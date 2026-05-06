import fs from 'fs';
import path from 'path';

import {
  query as sdkQuery,
  type HookCallback,
  type PostToolUseFailureHookInput,
  type PreCompactHookInput,
  type Query,
} from '@anthropic-ai/claude-agent-sdk';

import { clearContainerToolInFlight, setContainerToolInFlight } from '../db/connection.js';
import { registerProvider } from './provider-registry.js';
import type { AgentProvider, AgentQuery, McpServerConfig, ProviderEvent, ProviderOptions, QueryInput } from './types.js';

function log(msg: string): void {
  console.error(`[claude-provider] ${msg}`);
}

// Deferred SDK builtins that either sidestep nanoclaw's own scheduling or
// don't fit our async message-passing model (they're designed for Claude
// Code's interactive UI and would hang here).
//
// - CronCreate / CronDelete / CronList / ScheduleWakeup: we have durable
//   scheduling via mcp__nanoclaw__schedule_task.
// - AskUserQuestion: SDK returns a placeholder instead of blocking on a
//   real answer — we have mcp__nanoclaw__ask_user_question that persists
//   the question and blocks on the real reply.
// - EnterPlanMode / ExitPlanMode / EnterWorktree / ExitWorktree: Claude
//   Code UI affordances; in a headless container they'd appear stuck.
const SDK_DISALLOWED_TOOLS = [
  'CronCreate',
  'CronDelete',
  'CronList',
  'ScheduleWakeup',
  'AskUserQuestion',
  'EnterPlanMode',
  'ExitPlanMode',
  'EnterWorktree',
  'ExitWorktree',
];

// Tool allowlist for NanoClaw agent containers.
//
// Notable omissions (intentional, do NOT re-add without thinking):
//
// - SendMessage / TeamCreate / TeamDelete: SDK-native Claude Code "team
//   messaging" — sends to internal SDK state with a fake "@target" address,
//   returns success:true, but is NOT wired to NanoClaw's inbound.db routing.
//   Agents that use it think they delegated; the named agent's inbox stays
//   empty. Cross-agent communication must go through `<message to="...">`
//   wrappers or `mcp__nanoclaw__send_message`. (2026-05-04 incident:
//   asszisztens used SendMessage 3+ times to pietscarlet/lupaobol; both
//   inboxes empty for an hour.)
const TOOL_ALLOWLIST = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'Task',
  'TaskOutput',
  'TaskStop',
  'TodoWrite',
  'ToolSearch',
  'Skill',
  'NotebookEdit',
  'mcp__nanoclaw__*',
];

interface SDKUserMessage {
  type: 'user';
  message: { role: 'user'; content: string };
  parent_tool_use_id: null;
  session_id: string;
}

/**
 * Push-based async iterable for streaming user messages to the Claude SDK.
 */
class MessageStream {
  private queue: SDKUserMessage[] = [];
  private waiting: (() => void) | null = null;
  private done = false;

  push(text: string): void {
    this.queue.push({
      type: 'user',
      message: { role: 'user', content: text },
      parent_tool_use_id: null,
      session_id: '',
    });
    this.waiting?.();
  }

  end(): void {
    this.done = true;
    this.waiting?.();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<SDKUserMessage> {
    while (true) {
      while (this.queue.length > 0) {
        yield this.queue.shift()!;
      }
      if (this.done) return;
      await new Promise<void>((r) => {
        this.waiting = r;
      });
      this.waiting = null;
    }
  }
}

// ── Transcript archiving (PreCompact hook) ──

interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parseTranscript(content: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'user' && entry.message?.content) {
        const text = typeof entry.message.content === 'string' ? entry.message.content : entry.message.content.map((c: { text?: string }) => c.text || '').join('');
        if (text) messages.push({ role: 'user', content: text });
      } else if (entry.type === 'assistant' && entry.message?.content) {
        const textParts = entry.message.content.filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text);
        const text = textParts.join('');
        if (text) messages.push({ role: 'assistant', content: text });
      }
    } catch {
      /* skip unparseable lines */
    }
  }
  return messages;
}

function formatTranscriptMarkdown(messages: ParsedMessage[], title?: string | null, assistantName?: string): string {
  const now = new Date();
  const dateStr = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const lines = [`# ${title || 'Conversation'}`, '', `Archived: ${dateStr}`, '', '---', ''];
  for (const msg of messages) {
    const sender = msg.role === 'user' ? 'User' : assistantName || 'Assistant';
    const content = msg.content.length > 2000 ? msg.content.slice(0, 2000) + '...' : msg.content;
    lines.push(`**${sender}**: ${content}`, '');
  }
  return lines.join('\n');
}

/**
 * PreToolUse hook: record the current tool + its declared timeout so the host
 * sweep can widen its stuck tolerance while Bash is running a long-declared
 * script. Defense-in-depth: if SDK_DISALLOWED_TOOLS slips through somehow,
 * block the call here instead of letting the agent hang.
 */
const preToolUseHook: HookCallback = async (input) => {
  const i = input as { tool_name?: string; tool_input?: Record<string, unknown> };
  const toolName = i.tool_name ?? '';
  if (SDK_DISALLOWED_TOOLS.includes(toolName)) {
    return {
      decision: 'block',
      stopReason: `Tool '${toolName}' is not available in this environment — use the nanoclaw equivalent.`,
    } as unknown as ReturnType<HookCallback>;
  }
  // Bash exposes its timeout via the tool_input.timeout field (ms). Any other
  // tool: no declared timeout.
  const declaredTimeoutMs =
    toolName === 'Bash' && typeof i.tool_input?.timeout === 'number' ? (i.tool_input.timeout as number) : null;
  try {
    setContainerToolInFlight(toolName, declaredTimeoutMs);
  } catch (err) {
    log(`PreToolUse: failed to record container_state: ${err instanceof Error ? err.message : String(err)}`);
  }
  return { continue: true };
};

/** Clear in-flight tool on PostToolUse / PostToolUseFailure. */
const postToolUseHook: HookCallback = async () => {
  try {
    clearContainerToolInFlight();
  } catch (err) {
    log(`PostToolUse: failed to clear container_state: ${err instanceof Error ? err.message : String(err)}`);
  }
  return { continue: true };
};

/**
 * Proactive MCP health check. Runs on every UserPromptSubmit (every turn,
 * including cross-agent messages). Independent of whether the agent
 * attempts an MCP tool — necessary because a passive agent that has
 * "given up" on a dead MCP will never trigger PostToolUseFailure, leaving
 * the dead child process dead forever.
 *
 * For each MCP whose status is `failed` (or `disabled` unexpectedly),
 * calls reconnectMcpServer(name). The next tool call has a live MCP.
 *
 * Concrete incident (2026-05-04 18:42-20:36): trinkenessen Todoist
 * mcp-remote child died, agent saw it as disconnected, refused to retry,
 * and the dead child stayed dead through 4 hours of session-resume cycles.
 */
function createMcpHealthCheckHook(getQuery: () => Query | null): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const q = getQuery();
    if (!q) return {};

    try {
      const statuses = await q.mcpServerStatus();
      const dead = statuses.filter((s) => s.status === 'failed' || s.status === 'disabled');
      if (dead.length === 0) return {};

      log(`[mcp-health] ${dead.length} MCP server(s) need reconnect: ${dead.map((s) => `${s.name}=${s.status}`).join(', ')}`);
      for (const s of dead) {
        try {
          await q.reconnectMcpServer(s.name);
          log(`[mcp-health] ${s.name} reconnect OK`);
        } catch (err) {
          log(`[mcp-health] ${s.name} reconnect failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (err) {
      log(`[mcp-health] status query failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    return {};
  };
}

/**
 * Force inline-UI tool use on approval-trigger turns. The Claude Agent SDK
 * does not expose `tool_choice` directly, so we use a UserPromptSubmit hook
 * to inject a focused, per-turn system instruction when the user's prompt
 * contains an approval-flow trigger word ("tervezet", "küldjem", "mehet",
 * "fogalmazz", etc.). This keeps the base CLAUDE.local.md token-cheap (no
 * 🚨-style permanent hack) while still steering Opus toward `ask_user_question`
 * / `send_card` on the turns where it matters.
 *
 * Token cost: ~80 tokens per matched turn, zero on non-matched turns.
 *
 * Why this is necessary: Opus 4.7 base policy strongly prefers narrative
 * text output. A general "MIND USE CARDS" instruction in CLAUDE.md gets
 * partly applied (lists, summaries) but loses force on draft/approval
 * flows where it would be most natural — exactly when Tomi expects a card.
 */
const APPROVAL_TRIGGERS = [
  // draft / approval verbs
  'tervezet',
  'draft',
  'fogalmazz',
  'írj választ',
  'írj egy választ',
  'írj emailt',
  'írj egy emailt',
  'írj e-mailt',
  'írj üzenetet',
  'írj egy üzenetet',
  // send-confirmation phrases
  'küldjem',
  'küldhetem',
  'küldjük',
  'mehet?',
  'továbbítsam',
  'elindítsam',
  'indíthatom',
  'jóváhagyom',
  'engedélyezed',
  // multi-option list verbs (send_card territory)
  'sorold fel',
  'mit kell ma',
  'mai feladatok',
  'státusz',
];

const APPROVAL_HINT = [
  '⚙️ INTERAKTÍV TURN — a felhasználó approval/draft/lista jellegű kérést küldött.',
  '',
  '**KÖTELEZŐ tool használat ebben a turnben** (NEM sima text válasz):',
  '- Ha a kérés egy email/üzenet draft-ról szól, vagy "küldjem/mehet/továbbítsam" jellegű → **`mcp__nanoclaw__ask_user_question`** tool-lal: title=rövid akció, question=teljes draft-szöveg, options=[{label:"Küldd",value:"send"},{label:"Edit",value:"edit"},{label:"Mégsem",value:"cancel"}]',
  '- Ha a kérés 3+ tételes listát/státuszt/áttekintést kér → **`mcp__nanoclaw__send_card`** tool-lal: title=téma, description=lead 1-2 mondat, children=tételek section-ökben',
  '',
  'NE adj sima textben "íme a tervezet, mehet?" választ. NE sorold fel sima bullet-pointokban a tételeket. A tool-hívás MAGA legyen a turn-output.',
].join('\n');

function createApprovalHintHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const prompt = input.prompt?.toLowerCase() ?? '';
    if (!prompt) return {};
    const matched = APPROVAL_TRIGGERS.some((trig) => prompt.includes(trig));
    if (!matched) return {};
    log(`[approval-hint] injecting inline-UI nudge for prompt containing trigger`);
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: APPROVAL_HINT,
      },
    } as unknown as ReturnType<HookCallback>;
  };
}

/**
 * Auto-recover from MCP-disconnect failures. The Claude Code SDK does not
 * reconnect a child MCP server when its stdio pipe dies (long-idle IMAP
 * timeout, child crash, OOM). The whole session sees `mcp__*` tools as
 * disconnected for the rest of the run, blocking workflows like the email
 * pre-filter / delegate pattern.
 *
 * Hook listens for PostToolUseFailure on `mcp__*` tools, detects disconnect
 * patterns in the error string, then calls `query.reconnectMcpServer(name)`.
 * On success, returns `additionalContext` so the agent retries the failed
 * tool call instead of giving up.
 *
 * `getQuery` is a closure-captured lazy reference because the Query handle
 * is only available AFTER the sdkQuery({...}) call returns — but the hooks
 * are passed in as part of that very call's options.
 */
function createMcpRecoveryHook(getQuery: () => Query | null): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'PostToolUseFailure') return {};
    const failure = input as PostToolUseFailureHookInput;
    const toolName = failure.tool_name ?? '';
    if (!toolName.startsWith('mcp__')) return {};

    const errorMsg = String(failure.error ?? '').toLowerCase();
    if (!/disconnect|not available|not connected|server.*not.*running|broken pipe|epipe|connection.*(closed|reset|lost)/i.test(errorMsg)) {
      return {};
    }

    // Tool name pattern: mcp__<server>__<tool>. Server names may contain
    // single underscores (we use a non-greedy match up to `__`).
    const match = toolName.match(/^mcp__(.+?)__/);
    const serverName = match?.[1];
    if (!serverName) return {};

    const q = getQuery();
    if (!q) return {};

    try {
      const statuses = await q.mcpServerStatus();
      const target = statuses.find((s) => s.name === serverName);
      if (target?.status === 'connected') return {};

      log(`[mcp-recovery] ${serverName} status=${target?.status ?? 'unknown'} (error=${errorMsg.slice(0, 80)}), reconnecting…`);
      await q.reconnectMcpServer(serverName);
      log(`[mcp-recovery] ${serverName} reconnect OK`);

      return {
        hookSpecificOutput: {
          hookEventName: 'PostToolUseFailure',
          additionalContext: `MCP server "${serverName}" was disconnected and has been auto-reconnected. Please retry the failed tool call once.`,
        },
      } as unknown as ReturnType<HookCallback>;
    } catch (err) {
      log(`[mcp-recovery] ${serverName} reconnect failed: ${err instanceof Error ? err.message : String(err)}`);
      return {};
    }
  };
}

function createPreCompactHook(assistantName?: string): HookCallback {
  return async (input) => {
    const preCompact = input as PreCompactHookInput;
    const { transcript_path: transcriptPath, session_id: sessionId } = preCompact;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      log('No transcript found for archiving');
      return {};
    }

    try {
      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const messages = parseTranscript(content);
      if (messages.length === 0) return {};

      // Try to get summary from sessions index
      let summary: string | undefined;
      const indexPath = path.join(path.dirname(transcriptPath), 'sessions-index.json');
      if (fs.existsSync(indexPath)) {
        try {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
          summary = index.entries?.find((e: { sessionId: string; summary?: string }) => e.sessionId === sessionId)?.summary;
        } catch {
          /* ignore */
        }
      }

      const name = summary
        ? summary.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50)
        : `conversation-${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}`;

      const conversationsDir = '/workspace/agent/conversations';
      fs.mkdirSync(conversationsDir, { recursive: true });
      const filename = `${new Date().toISOString().split('T')[0]}-${name}.md`;
      fs.writeFileSync(path.join(conversationsDir, filename), formatTranscriptMarkdown(messages, summary, assistantName));
      log(`Archived conversation to ${filename}`);
    } catch (err) {
      log(`Failed to archive transcript: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Compaction-survivor reminder: re-emit the most load-bearing routing
    // invariant the agent commonly forgets after compact. The system prompt
    // already carries it (destinations.ts), but compaction can dilute LLM
    // attention to it — this systemMessage gives a short, fresh nudge in
    // the post-compact context.
    return {
      systemMessage: [
        '⚠️ POST-COMPACTION REMINDER',
        '',
        'Cross-agent communication requires explicit routing:',
        '- `<message to="agent-name">...</message>` wrapper, OR',
        '- `mcp__nanoclaw__send_message({ to: "agent-name", text: "..." })` tool call',
        '',
        'Plain text WITHOUT a wrapper goes ONLY to your user channel — the named agent receives nothing.',
        'Before claiming "I told X" / "I delegated to X", verify the wrapper/tool call is in your output.',
        'Re-read the "Sending messages" section of your system prompt for the full destination list.',
      ].join('\n'),
    };
  };
}

// ── Provider ──

/**
 * Claude Code auto-compacts context at this window (tokens). Kept here so
 * the generic bootstrap doesn't need to know about Claude-specific env vars.
 *
 * Operator override: set CLAUDE_CODE_AUTO_COMPACT_WINDOW in the host env to
 * raise or lower the threshold without editing source — useful when running
 * with a 1M-context model variant or when emergency-tuning a deployment.
 */
const CLAUDE_CODE_AUTO_COMPACT_WINDOW = process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '165000';

/**
 * Stale-session detection. Matches Claude Code's error text when a
 * resumed session can't be found — missing transcript .jsonl, unknown
 * session ID, etc.
 */
const STALE_SESSION_RE = /no conversation found|ENOENT.*\.jsonl|session.*not found/i;

export class ClaudeProvider implements AgentProvider {
  readonly supportsNativeSlashCommands = true;

  private assistantName?: string;
  private mcpServers: Record<string, McpServerConfig>;
  private env: Record<string, string | undefined>;
  private additionalDirectories?: string[];
  private model?: string;
  private effort?: string;

  constructor(options: ProviderOptions = {}) {
    this.assistantName = options.assistantName;
    this.mcpServers = options.mcpServers ?? {};
    this.additionalDirectories = options.additionalDirectories;
    this.model = options.model;
    this.effort = options.effort;
    this.env = {
      ...(options.env ?? {}),
      CLAUDE_CODE_AUTO_COMPACT_WINDOW,
    };
  }

  isSessionInvalid(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return STALE_SESSION_RE.test(msg);
  }

  query(input: QueryInput): AgentQuery {
    const stream = new MessageStream();
    stream.push(input.prompt);

    const instructions = input.systemContext?.instructions;

    // Forward reference: hooks need the Query handle (for reconnectMcpServer)
    // but the handle only exists AFTER sdkQuery({...}) returns. Closure +
    // lazy getter sidesteps the chicken-and-egg.
    let queryHandle: Query | null = null;
    const mcpRecoveryHook = createMcpRecoveryHook(() => queryHandle);
    const mcpHealthCheckHook = createMcpHealthCheckHook(() => queryHandle);
    const approvalHintHook = createApprovalHintHook();

    const sdkResult = sdkQuery({
      prompt: stream,
      options: {
        cwd: input.cwd,
        additionalDirectories: this.additionalDirectories,
        resume: input.continuation,
        pathToClaudeCodeExecutable: '/pnpm/claude',
        systemPrompt: instructions ? { type: 'preset' as const, preset: 'claude_code' as const, append: instructions } : undefined,
        allowedTools: TOOL_ALLOWLIST,
        disallowedTools: SDK_DISALLOWED_TOOLS,
        env: this.env,
        model: this.model,
        effort: this.effort as any,
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        settingSources: ['project', 'user'],
        mcpServers: this.mcpServers,
        hooks: {
          PreToolUse: [{ hooks: [preToolUseHook] }],
          PostToolUse: [{ hooks: [postToolUseHook] }],
          PostToolUseFailure: [{ hooks: [postToolUseHook, mcpRecoveryHook] }],
          PreCompact: [{ hooks: [createPreCompactHook(this.assistantName)] }],
          UserPromptSubmit: [{ hooks: [mcpHealthCheckHook, approvalHintHook] }],
        },
      },
    });
    queryHandle = sdkResult;

    let aborted = false;

    async function* translateEvents(): AsyncGenerator<ProviderEvent> {
      let messageCount = 0;
      for await (const message of sdkResult) {
        if (aborted) return;
        messageCount++;

        // Yield activity for every SDK event so the poll loop knows the agent is working
        yield { type: 'activity' };

        if (message.type === 'system' && message.subtype === 'init') {
          yield { type: 'init', continuation: message.session_id };
        } else if (message.type === 'result') {
          const text = 'result' in message ? (message as { result?: string }).result ?? null : null;
          yield { type: 'result', text };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'api_retry') {
          yield { type: 'error', message: 'API retry', retryable: true };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'rate_limit_event') {
          yield { type: 'error', message: 'Rate limit', retryable: false, classification: 'quota' };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'compact_boundary') {
          const meta = (message as { compact_metadata?: { pre_tokens?: number } }).compact_metadata;
          yield { type: 'compact', preTokens: meta?.pre_tokens };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'task_notification') {
          const tn = message as { summary?: string };
          yield { type: 'progress', message: tn.summary || 'Task notification' };
        }
      }
      log(`Query completed after ${messageCount} SDK messages`);
    }

    return {
      push: (msg) => stream.push(msg),
      end: () => stream.end(),
      events: translateEvents(),
      abort: () => {
        aborted = true;
        stream.end();
      },
    };
  }
}

registerProvider('claude', (opts) => new ClaudeProvider(opts));
