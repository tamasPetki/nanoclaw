import fs from 'fs';
import os from 'os';
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

// Tool allowlist for NanoClaw agent containers. MCP-tool entries are derived
// at the call site from the registered `mcpServers` map so that any server
// added via `add_mcp_server` (or wired in container.json directly) is
// reachable to the agent — without this, the SDK's allowedTools filter
// silently drops every MCP namespace not listed here.
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
  // Notable omissions (intentional, do NOT re-add without thinking):
  // - SendMessage / TeamCreate / TeamDelete: SDK-native Claude Code "team
  //   messaging" — sends to internal SDK state with a fake "@target" address,
  //   returns success:true, but is NOT wired to NanoClaw's inbound.db routing.
  //   Agents that use it think they delegated; the named agent's inbox stays
  //   empty. Cross-agent communication must go through `<message to="...">`
  //   wrappers or `mcp__nanoclaw__send_message`. (2026-05-04 incident:
  //   asszisztens used SendMessage 3+ times to pietscarlet/lupaobol; both
  //   inboxes empty for an hour.)
  'TodoWrite',
  'ToolSearch',
  'Skill',
  'NotebookEdit',
];

// MCP server names are sanitized by the SDK when forming tool prefixes:
// any character outside [A-Za-z0-9_-] becomes '_'. Mirror that here so our
// allowlist patterns match what the SDK actually exposes.
function mcpAllowPattern(serverName: string): string {
  return `mcp__${serverName.replace(/[^a-zA-Z0-9_-]/g, '_')}__*`;
}

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

/**
 * Live findings buffer — append-only log of in-session signals that the
 * weekly self-improvement reflection (Sunday 11:00) consumes. Written by
 * the feedback-logger and tool-failure-logger hooks below. Located in the
 * agent's wiki dir so it survives container respawns.
 *
 * Resolved at hook-fire time (container has /workspace/agent → host
 * groups/<folder>/). For agents without a wiki dir, the append silently
 * no-ops — only the hub uses this today.
 */
function appendDraftFinding(kind: string, body: string): void {
  try {
    // Container mount: groups/<folder>/ → /workspace/agent/
    const dir = '/workspace/agent/wiki/findings';
    if (!fs.existsSync(dir)) return; // no wiki/findings/ → no-op (worker-en pl.)
    const file = path.join(dir, 'draft-current-week.md');
    const ts = new Date().toISOString();
    const line = `\n## [${ts}] ${kind}\n${body.trim()}\n`;
    fs.appendFileSync(file, line);
  } catch (err) {
    log(`[findings-buffer] append failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Frusztrációs / korrekciós minták a Tomi-üzenetekben. Ha bármelyik
// substring matchel, jelezzük a self-improvement bufferbe — a heti
// reflection prioritizálja az ilyen turn-eket. Token-zero a turn-context-
// re (NEM injektálunk additionalContext-et).
const FEEDBACK_PATTERNS: Array<{ key: string; rx: RegExp }> = [
  { key: 'frustration', rx: /\b(rosszul|hibás|hibásan|elromlott|nem így|nem ezt|nem akartam|nem értem|stop)\b/i },
  { key: 'repeat', rx: /\b(megint|újra|már mondtam|kértem hogy|miért nem ahogy|harmadszor|sokadszor)\b/i },
  { key: 'directive', rx: /\b(jegyezd meg|ne csináld többé|mostantól (mindig|soha)|tanulj ebből)\b/i },
  { key: 'correction-prefix', rx: /^(ne |nem |stop\b|de hát|kértem )/i },
];

function createTomiFeedbackLogger(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const prompt = input.prompt ?? '';
    if (!prompt || prompt.length < 4) return {};
    const matched = FEEDBACK_PATTERNS.find((p) => p.rx.test(prompt));
    if (!matched) return {};
    log(`[feedback-logger] ${matched.key} pattern → draft buffer`);
    appendDraftFinding(`tomi-feedback (${matched.key})`, prompt.slice(0, 800));
    return {};
  };
}

function createToolFailureLogger(): HookCallback {
  return async (rawInput) => {
    if (rawInput.hook_event_name !== 'PostToolUseFailure') return {};
    const input = rawInput as PostToolUseFailureHookInput;
    const errStr = String(input.error ?? '').slice(0, 400);
    const body = `tool=${input.tool_name}\nerror=${errStr}`;
    log(`[failure-logger] ${input.tool_name} → draft buffer`);
    appendDraftFinding('tool-failure', body);
    return {};
  };
}

const QUICK_LEARNING_HINT = [
  '🚨 RUNTIME OVERRIDE: Tomi explicit "jegyezd meg / ne csináld többé / mostantól mindig X / tanulj ebből" mintát írt.',
  '',
  'Ennek a turn-nek a kimenete TOOL_USE legyen, NEM sima text "Megjegyeztem ✅" típusú válasz.',
  '',
  'Indítsd a Quick learning workflow-t a hub CLAUDE.local.md "Self-improvement (heti reflection + session-realtime)" → "Quick learning" szekciója szerint:',
  '',
  '1. Azonosítsd a célfájlt a Tomi-direktíva alapján:',
  '   - Tomi-stílus / hangtípus → groups/global/CLAUDE.md',
  '   - Hub-konkrét viselkedés → groups/hub/CLAUDE.local.md (workspace: /workspace/agent/CLAUDE.local.md)',
  '   - Skill-trigger / minta → container/skills/<név>/SKILL.md (workspace: /app/skills/<név>/SKILL.md)',
  '   - Worker-viselkedés → groups/worker/CLAUDE.local.md (cross-agent send_message)',
  '',
  '2. Olvasd el a célfájlt (`Read`).',
  '',
  '3. **mcp__nanoclaw__ask_user_question** card:',
  '   - title: "💡 Quick learning: <rövid összefoglaló>"',
  '   - question: "Frissítsem a `<konkrét fájl path>`-t? Konkrét diff:\\n\\n```diff\\n<diff>\\n```"',
  '   - options: [{label:"Frissítsd",value:"apply"}, {label:"Csak draft",value:"draft"}, {label:"Skip",value:"skip"}]',
  '',
  '4. Approve (`apply`) → `Edit` a fájlt + log az `wiki/findings/draft-current-week.md`-be: `## [YYYY-MM-DD HH:MM] quick-learning-applied | <fájl> | <takeaway>`',
].join('\n');

function createQuickLearningHintHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const prompt = (input.prompt ?? '').toLowerCase();
    if (!prompt) return {};
    // Csak a directive mintára injektáljuk (nem minden frusztrációs jelzésre)
    const isDirective =
      /\b(jegyezd meg|ne csináld többé|mostantól (mindig|soha)|tanulj ebből)\b/i.test(prompt);
    if (!isDirective) return {};
    log(`[quick-learning] directive detected → injecting workflow hint`);
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: QUICK_LEARNING_HINT,
      },
    } as unknown as ReturnType<HookCallback>;
  };
}

// Slash command router. The hub's CLAUDE.local.md has a routing table for
// "/projektek", "/teendok", etc., but Opus 4.7 reliably ignores that table
// and falls back to "Unknown command" — same trust-the-table failure we saw
// with cards and approval flows. Per-turn injection wins.
const SLASH_COMMANDS: Record<string, string> = {
  help: 'List all commands as a `mcp__nanoclaw__send_card`. See the `/help` template in CLAUDE.local.md.',
  projektek:
    'Build a status card from `wiki/projects/` — sections for Görgey 32, Csobánka, Törökhegy, Rózsa u., Lupa Öböl, Trinken Essen, plus Egyéb. Read each project page for current state. Use `mcp__nanoclaw__send_card`.',
  teendok:
    'Run `mcp__todoist__list_tasks` with filter `(overdue | today | 7 days)`. Group by project, render as `mcp__nanoclaw__send_card` (sections per project). Lejárt = piros emoji, ma = sárga, héten = zöld.',
  email:
    'Run the `task-hub-email-check` cron prompt now. The pre-filter script is `bash /workspace/agent/email-prefilter.py`. Then per-account summary card.',
  hirek:
    'Run the `task-hub-news` cron prompt now (4 kategória: politika, kripto, AI, X-lista). Wiki target: `wiki/news/YYYY-MM-DD.md`.',
  edzo:
    'Run the `task-edzo-reggeli` cron prompt now (Withings get_weight_and_body + get_sleep + get_activity, plus history.md). Káromkodós-edző hangon, card-ban.',
  naptar:
    'Run `mcp__google-calendar__list_events` for today + tomorrow, render in `mcp__nanoclaw__send_card` with two sections.',
  wiki:
    'Search the wiki. The argument (text after `/wiki `) is the query. Use `bash grep -r -i "<query>" /workspace/agent/wiki/` then read the most relevant hit and answer with citation. If multiple hits, send_card with each as a section.',
  szia:
    'Trigger the `welcome` skill workflow (`/app/skills/welcome/SKILL.md`). Greeting + capabilities tour.',
};

// NOTE: slash commands a Claude Code SDK natívan kezeli, ha vannak
// `.claude/commands/<name>.md` fájlok a project root-ban (a hub-on:
// groups/hub/.claude/commands/). A poll-loop.ts:221 `formatMessagesWithCommands`
// passthrough-olja a `/X` szövegeket az SDK-nak, ami megkeresi a
// commands/-mappát.
//
// Ez a hook ezt KIEGÉSZÍTI: ha a `formatMessagesWithCommands` mégis
// XML-wrapped üzenetbe csomagolja (pl. ha az `additionalContext`-en jön),
// a hook fallback-ként parse-ol és injektál hint-et.
function createSlashCommandHintHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const prompt = input.prompt ?? '';
    const msgMatch = prompt.match(/<message[^>]*>([\s\S]+?)<\/message>/);
    const inner = (msgMatch?.[1] ?? prompt).trim();
    const m = inner.match(/^\/([a-z0-9_-]+)(?:\s+([\s\S]+))?$/i);
    if (!m) return {};
    const cmd = m[1].toLowerCase();

    // Az SDK natívan kezeli a slash commandokat ha `.claude/commands/<cmd>.md`
    // létezik a project root-ban (/workspace/agent/.claude/commands/). NE
    // duplikáljuk a router-t — csak akkor szólunk, ha a fájl SEM létezik
    // ÉS van extra hint-tartalom a SLASH_COMMANDS táblában.
    const cmdFile = `/workspace/agent/.claude/commands/${cmd}.md`;
    const fileExists = fs.existsSync(cmdFile);
    if (fileExists) {
      // Az SDK natívan futtatja — ne avatkozzunk bele.
      log(`[slash-router] /${cmd} → native handler (.claude/commands/${cmd}.md)`);
      return {};
    }

    // Fallback: ha nincs .md fájl, de van router-tábla bejegyzés (legacy hook-stílus)
    const handler = SLASH_COMMANDS[cmd];
    if (!handler) {
      log(`[slash-router] unknown command: /${cmd} (no file, no table entry)`);
      return {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `Tomi a \`/${cmd}\` parancsot küldte, de nincs hozzá ${cmd}.md fájl és router-tábla bejegyzés sem. Válaszolj magyarul: "Ismeretlen parancs: \`/${cmd}\`. Lista: \`/help\`."`,
        },
      } as unknown as ReturnType<HookCallback>;
    }

    const arg = m[2] ?? '';
    log(`[slash-router] /${cmd} → table-based handler (legacy)`);
    const argText = arg ? `\nArgumentum: "${arg}"` : '';
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: [
          `🔧 SLASH COMMAND ROUTER: Tomi a \`/${cmd}\` parancsot küldte.${argText}`,
          '',
          `Ennek a turn-nek a workflow-ja:`,
          handler,
          '',
          'NE válaszolj "Unknown command"-dal. NE generálj sima text választ ha card-szerű kimenet a természetes (lista/státusz). Ha tool kell hozzá, hívd most.',
        ].join('\n'),
      },
    } as unknown as ReturnType<HookCallback>;
  };
}

// Minden turn elejére injektálunk egy formátum-emlékeztetőt. Tomi 3× explicit
// kérte hogy tagolt legyen a kimenet, a CLAUDE.local.md instrukció ignorálódott.
// Ez per-turn ~50 token, garantáltan látja az LLM. Csak text-output esetén
// érvényes (card render-szinten amúgy is automatikus üres sorral van tagolva).
const FORMAT_REMINDER = [
  '📋 FORMÁTUM-EMLÉKEZTETŐ (mindig érvényes):',
  '- Card-okban a `children`-ben minden `text` blokk dupla `\\n\\n`-nel tagolt legyen, NE wall-of-text.',
  '- 3+ tételes lista esetén section-okra bontsd, üres sorral elválasztva.',
  '- Plain text válaszban is használj üres sorokat (kettős enter) a logikai blokkok között.',
  '- Tomi vizuálisan átlátható, gyorsan szemmel olvasható kimenetet vár.',
].join('\n');

function createFormatReminderHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: FORMAT_REMINDER,
      },
    } as unknown as ReturnType<HookCallback>;
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
// Substring matches against the lowercased prompt. Keep them broad —
// false positives just inject a small hint that's safe even if the agent
// ends up doing a normal text turn.
const APPROVAL_TRIGGERS = [
  // draft / approval verbs (broad)
  'tervezet',
  'draft',
  'fogalmazz',
  'írj választ',
  'írj egy választ',
  'írj egy email',
  'írj email',
  'írj e-mail',
  'írj üzenet',
  'írj egy üzenet',
  'írj próba',
  'írjál',
  'fogalmazd',
  // domain words — any email/message context benefits from card
  'email',
  'e-mail',
  'levelet',
  'levélre',
  'üzenet ',
  // send-confirmation phrases
  'küldjem',
  'küldhetem',
  'küldjük',
  'mehet?',
  'mehet ',
  'továbbítsam',
  'továbbítsd',
  'elindítsam',
  'indíthatom',
  'jóváhagyom',
  'jóváhagyod',
  'engedélyezed',
  'megerősíted',
  // multi-option list verbs (send_card territory)
  'sorold fel',
  'mit kell ma',
  'mai feladatok',
  'státusz',
  'áttekintés',
  'összegzés',
  'riport',
  // explicit user request for card
  'kártya',
  'kártyá',
];

const APPROVAL_HINT = [
  '🚨 RUNTIME OVERRIDE: ennek a turn-nek a végkimenete TOOL_USE, nem text.',
  '',
  'A felhasználó email/üzenet draft-ot vagy approval-t kér, vagy listázható',
  'választ vár. STOP — NE generálj "Tervezet: ..." formátumú szöveg-választ.',
  '',
  'Helyette EGYETLEN tool-call legyen az utolsó action-öd:',
  '',
  '1) Email/üzenet draft / "küldjem/mehet/továbbítsam" → `mcp__nanoclaw__ask_user_question`',
  '   - title: rövid akció (max 50 char, pl. "📧 Email: tonertop@gmail.com")',
  '   - question: a teljes draft szövege (Tárgy + body + aláírás-jelzés)',
  '   - options: [{label:"Küldd",value:"send"},{label:"Edit",value:"edit"},{label:"Mégsem",value:"cancel"}]',
  '',
  '2) Lista/státusz/riport (3+ tétel) → `mcp__nanoclaw__send_card`',
  '   - title, description (1-2 mondat lead), children (section-ök tételenként), opcionális actions',
  '',
  'Ha a draft már megfogalmazódott a fejedben, RAKD A `question` MEZŐBE és hívd a tool-t.',
  'NE küldj előtte / utána szöveges magyarázatot a draft mellé. EGY tool-hívás.',
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
 * Wiki-discipline reminder: project-mention triggers in the user's prompt
 * cause a one-time per-turn injection telling the agent to write the new
 * info to wiki/log.md and the relevant project page BEFORE responding.
 *
 * Conditional (zero-cost on no-match turns) — uses the same trigger lists
 * as the PreCompact auto-extract for consistency. The 2026-05-13 incident
 * showed CLAUDE.local.md disciplines are insufficient on their own; a hard
 * per-turn nudge is needed for project-update messages.
 */
const WIKI_REMINDER = [
  '📝 WIKI DISCIPLINE — projekt-említést érzékelek Tomi üzenetében.',
  '',
  'A Telegram-válasz ELŐTT (még ebben a turn-ben):',
  '1. `Read wiki/projects/<projekt>/summary.md` vagy `wiki/entities/<személy>.md` az érintett oldal',
  '2. `Edit` — appendelj rövid bekezdést a friss info-val (dátum, takeaway, ki/mi/mikor)',
  '3. `wiki/log.md` 1-soros bullet append: `## [YYYY-MM-DD HH:MM] <projekt> | <1 mondat>`',
  '4. CSAK EZUTÁN válaszolj Tominak (és megemlítheted: "beírtam: wiki/...")',
  '',
  'Ha most nem írod le, a context-compactnál ELVESZIK. Tegnap (2026-05-13) egy egész napi project-update-burst veszett el így — ne ismétlődjön.',
  'Apró infók is fontosak (egy "rendben" / "csütörtök" / "X.Y M Ft" — minden konkrét tény beleírandó).',
].join('\n');

function createWikiReminderHook(): HookCallback {
  return async (input) => {
    if (input.hook_event_name !== 'UserPromptSubmit') return {};
    const prompt = (input.prompt ?? '').toLowerCase();
    if (!prompt || prompt.length < 8) return {};
    const hasProject = WIKI_EXTRACT_PROJECTS.some((p) => prompt.includes(p));
    const hasEntity = WIKI_EXTRACT_ENTITIES.some((e) => prompt.includes(e));
    const hasAction = WIKI_EXTRACT_ACTIONS.some((a) => prompt.includes(a));
    if (!hasProject && !(hasEntity && hasAction)) return {};
    log(`[wiki-discipline] project mention in prompt → injecting wiki-update reminder`);
    return {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: WIKI_REMINDER,
      },
    } as unknown as ReturnType<HookCallback>;
  };
}

/**
 * Read a Claude transcript .jsonl, render a markdown summary, and drop it into
 * the agent's `conversations/` folder so context survives a compaction or a
 * session rotation. Best-effort: returns false (and logs) on any failure.
 */
function archiveTranscriptFile(transcriptPath: string | undefined, sessionId: string | undefined, assistantName?: string): boolean {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    log('No transcript found for archiving');
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const messages = parseTranscript(content);
    if (messages.length === 0) return false;

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

    const conversationsDir = process.env.NANOCLAW_CONVERSATIONS_DIR || '/workspace/agent/conversations';
    fs.mkdirSync(conversationsDir, { recursive: true });
    const filename = `${new Date().toISOString().split('T')[0]}-${name}.md`;
    fs.writeFileSync(path.join(conversationsDir, filename), formatTranscriptMarkdown(messages, summary, assistantName));
    log(`Archived conversation to ${filename}`);
    return true;
  } catch (err) {
    log(`Failed to archive transcript: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

/**
 * Auto-extract project-mention sentences from a transcript so they survive
 * compaction. Triggered as part of the PreCompact hook — every compact runs
 * an extra pass that appends any new project-related Tomi-message to
 * wiki/log.md. Idempotent via timestamp-keyed section headers. No-op for
 * groups without a wiki/log.md (the existsSync guard).
 *
 * Background: 2026-05-13 the hub lost an entire morning's worth of project
 * updates (DMRV/Bérczy/Tóth Robi/Lupa/Espár/Törökhegy) because the LLM did
 * not write them to wiki/log.md before context compaction. This hook is the
 * automatic safety net so a similar amnesia incident cannot recur silently.
 */
const WIKI_EXTRACT_PROJECTS = [
  'görgey', 'gorgey', 'csobánka', 'csobanka', 'törökhegy', 'torokhegy',
  'rózsa', 'rozsa', 'lupa', 'trinken', 'pietscarlet', 'piet scarlet',
  'bulltrapp', 'bull trapp', 'rezerver', 'pilates',
];

const WIKI_EXTRACT_ENTITIES = [
  'bérczy', 'berczy', 'dmrv', 'tóth robi', 'toth robi', 'tóth róbert', 'toth robert',
  'milán', 'milan', 'fehér istván', 'feher istvan', 'fehér lászló', 'feher laszlo',
  'erika', 'kövesdi', 'kovesdi', 'espár', 'espar', 'borsó', 'borso',
];

const WIKI_EXTRACT_ACTIONS = [
  'hívtam', 'hivtam', 'hívott', 'hivott', 'visszahívott', 'visszahivott', 'felhívom',
  'ajánlat', 'ajanlat', 'megegyez', 'döntés', 'dontes', 'megrendelés', 'megrendeles',
  'beszéltem', 'beszeltem', 'találkoz', 'talalkoz', 'elfogad', 'elutasít', 'elutasit',
  'vakolás', 'vakolas', 'szigetelés', 'szigeteles', 'tervtanács', 'tervtanacs', 'meeting',
];

function extractProjectMentions(messages: ParsedMessage[]): string[] {
  const found: string[] = [];
  for (const msg of messages) {
    if (msg.role !== 'user') continue; // only Tomi-messages
    const lower = msg.content.toLowerCase();
    const hasProject = WIKI_EXTRACT_PROJECTS.some((p) => lower.includes(p));
    const hasEntity = WIKI_EXTRACT_ENTITIES.some((e) => lower.includes(e));
    const hasAction = WIKI_EXTRACT_ACTIONS.some((a) => lower.includes(a));
    // Trigger if a project name appears OR an (entity + action) pair appears.
    // Single bare entity or action is too noisy.
    if (hasProject || (hasEntity && hasAction)) {
      // Trim message-XML wrappers if present (the SDK transcript stores raw text).
      let clean = msg.content
        .replace(/<message[^>]*>/g, '')
        .replace(/<\/message>/g, '')
        .replace(/<context[^>]*\/?>/g, '')
        .trim();
      if (clean.length > 400) clean = clean.slice(0, 400) + '…';
      // Skip if empty after cleanup
      if (clean.length > 5) found.push(clean.replace(/\s+/g, ' '));
    }
  }
  return found;
}

function appendProjectMentionsToWikiLog(mentions: string[]): void {
  if (mentions.length === 0) return;
  try {
    const wikiLogPath = '/workspace/agent/wiki/log.md';
    if (!fs.existsSync(wikiLogPath)) return; // not a wiki-enabled group (worker etc.)
    const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const headerLine = `## [${ts}] pre-compact-extract`;
    const existing = fs.readFileSync(wikiLogPath, 'utf-8');
    // Idempotency: minute-granular header — if a compact already wrote one this minute, skip.
    if (existing.includes(headerLine)) {
      log(`[pre-compact-wiki] skip — section already exists for ${ts}`);
      return;
    }
    const block = `\n${headerLine} — ${mentions.length} project-mention(s) parsed before context compaction\n` +
      mentions.map((m) => `- ${m}`).join('\n') + '\n';
    fs.appendFileSync(wikiLogPath, block);
    log(`[pre-compact-wiki] ${mentions.length} project-mention(s) appended to wiki/log.md`);
  } catch (err) {
    log(`[pre-compact-wiki] append failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * PreCompact safety-net: parse the transcript and append any project-mention
 * Tomi-messages to wiki/log.md so they survive the upcoming compaction. Best
 * effort, no-op for non-wiki groups.
 */
function extractProjectMentionsBeforeCompact(transcriptPath: string | undefined): void {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return;
  try {
    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const messages = parseTranscript(content);
    appendProjectMentionsToWikiLog(extractProjectMentions(messages));
  } catch (err) {
    log(`[pre-compact-wiki] extract failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function createPreCompactHook(assistantName?: string): HookCallback {
  return async (input) => {
    const preCompact = input as PreCompactHookInput;
    archiveTranscriptFile(preCompact.transcript_path, preCompact.session_id, assistantName);
    extractProjectMentionsBeforeCompact(preCompact.transcript_path);

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
        '',
        '📝 WIKI DISCIPLINE (post-compact recovery):',
        'If wiki/log.md exists in your workspace, check it for a recent `[YYYY-MM-DD HH:MM] pre-compact-extract` section — that contains the project-mentions your context just lost.',
        'If any of those bullets are NOT yet integrated into the matching `wiki/projects/<name>/summary.md` or `wiki/entities/<person>.md`, integrate them NOW (Edit + 1-line wiki/log.md bullet) before responding to the user.',
        'Future-you depends on it: the next compaction WILL drop the chat-context again.',
      ].join('\n'),
    };
  };
}

// ── Continuation rotation (cold-resume guard) ──

/**
 * Resume cost is dominated by transcript size. Past this many bytes a fresh
 * cold container can't reload the .jsonl before the host's 30-min idle ceiling
 * fires, so the session is dropped and started clean. Operator-overridable.
 */
function transcriptRotateBytes(): number {
  return Number(process.env.CLAUDE_TRANSCRIPT_ROTATE_BYTES) || 12 * 1024 * 1024;
}

/**
 * Secondary age trigger, measured from the transcript's first entry. 0 (or a
 * non-positive value) disables the age check; size alone then governs.
 */
function transcriptRotateAgeMs(): number {
  const raw = process.env.CLAUDE_TRANSCRIPT_ROTATE_AGE_DAYS;
  if (raw === undefined || raw.trim() === '') return 14 * 86_400_000;
  const days = Number(raw);
  if (!Number.isFinite(days)) return 14 * 86_400_000;
  // Explicit non-positive override disables the age check; size alone governs.
  return days > 0 ? days * 86_400_000 : Infinity;
}

function claudeProjectsDir(): string {
  const base = process.env.CLAUDE_CONFIG_DIR || path.join(process.env.HOME || os.homedir(), '.claude');
  return path.join(base, 'projects');
}

/**
 * Locate the .jsonl backing a session id. The SDK names project dirs by a
 * mangled cwd; rather than reproduce that convention we scan project dirs for
 * `<sessionId>.jsonl` (session ids are UUIDs, so this is unambiguous).
 */
function findTranscriptPath(sessionId: string): string | null {
  const projects = claudeProjectsDir();
  let dirs: string[];
  try {
    dirs = fs.readdirSync(projects);
  } catch {
    return null;
  }
  for (const dir of dirs) {
    const candidate = path.join(projects, dir, `${sessionId}.jsonl`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Epoch-ms of the first transcript entry, or null if unreadable. */
function transcriptStartMs(transcriptPath: string): number | null {
  try {
    const fd = fs.openSync(transcriptPath, 'r');
    try {
      const buf = Buffer.alloc(4096);
      const n = fs.readSync(fd, buf, 0, buf.length, 0);
      const firstLine = buf.toString('utf-8', 0, n).split('\n', 1)[0];
      const ts = JSON.parse(firstLine)?.timestamp;
      const ms = ts ? Date.parse(ts) : NaN;
      return Number.isNaN(ms) ? null : ms;
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return null;
  }
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

  maybeRotateContinuation(continuation: string): string | null {
    const transcriptPath = findTranscriptPath(continuation);
    if (!transcriptPath) return null;

    let size: number;
    try {
      size = fs.statSync(transcriptPath).size;
    } catch {
      return null;
    }

    const maxBytes = transcriptRotateBytes();
    const startMs = transcriptStartMs(transcriptPath);
    const ageMs = startMs === null ? 0 : Date.now() - startMs;
    const maxAgeMs = transcriptRotateAgeMs();

    let reason: string | null = null;
    if (size > maxBytes) {
      reason = `transcript ${(size / 1_048_576).toFixed(1)}MB > ${(maxBytes / 1_048_576).toFixed(0)}MB cap`;
    } else if (startMs !== null && ageMs > maxAgeMs) {
      reason = `transcript ${(ageMs / 86_400_000).toFixed(1)}d old > ${(maxAgeMs / 86_400_000).toFixed(0)}d cap`;
    }
    if (!reason) return null;

    // Preserve a readable summary, then move the heavy .jsonl out of the
    // resume path so the SDK starts a fresh session and the disk is reclaimed.
    archiveTranscriptFile(transcriptPath, continuation, this.assistantName);
    try {
      fs.renameSync(transcriptPath, `${transcriptPath}.rotated-${Date.now()}`);
    } catch (err) {
      log(`Failed to move rotated transcript aside: ${err instanceof Error ? err.message : String(err)}`);
    }
    return reason;
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
    const tomiFeedbackLogger = createTomiFeedbackLogger();
    const toolFailureLogger = createToolFailureLogger();
    const quickLearningHintHook = createQuickLearningHintHook();
    const slashCommandHintHook = createSlashCommandHintHook();
    const formatReminderHook = createFormatReminderHook();
    const wikiReminderHook = createWikiReminderHook();

    const sdkResult = sdkQuery({
      prompt: stream,
      options: {
        cwd: input.cwd,
        additionalDirectories: this.additionalDirectories,
        resume: input.continuation,
        pathToClaudeCodeExecutable: '/pnpm/claude',
        systemPrompt: instructions ? { type: 'preset' as const, preset: 'claude_code' as const, append: instructions } : undefined,
        allowedTools: [
          ...TOOL_ALLOWLIST,
          ...Object.keys(this.mcpServers).map(mcpAllowPattern),
        ],
        disallowedTools: SDK_DISALLOWED_TOOLS,
        env: this.env,
        model: this.model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        effort: this.effort as any,
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        settingSources: ['project', 'user', 'local'],
        mcpServers: this.mcpServers,
        hooks: {
          PreToolUse: [{ hooks: [preToolUseHook] }],
          PostToolUse: [{ hooks: [postToolUseHook] }],
          PostToolUseFailure: [{ hooks: [postToolUseHook, mcpRecoveryHook, toolFailureLogger] }],
          PreCompact: [{ hooks: [createPreCompactHook(this.assistantName)] }],
          UserPromptSubmit: [{ hooks: [mcpHealthCheckHook, slashCommandHintHook, approvalHintHook, quickLearningHintHook, wikiReminderHook, formatReminderHook, tomiFeedbackLogger] }],
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
          // `result` text exists only on subtype:"success"; error subtypes
          // (e.g. a non-retryable 403 billing_error) carry their message in
          // `errors[]` instead. Surface either so the poll-loop can deliver a
          // billing/quota notice to the user rather than dropping the turn.
          const m = message as { result?: string; is_error?: boolean; errors?: string[] };
          const text = m.result ?? (m.errors && m.errors.length > 0 ? m.errors.join('\n') : null);
          yield { type: 'result', text, isError: m.is_error === true };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'api_retry') {
          yield { type: 'error', message: 'API retry', retryable: true };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'rate_limit_event') {
          yield { type: 'error', message: 'Rate limit', retryable: false, classification: 'quota' };
        } else if (message.type === 'system' && (message as { subtype?: string }).subtype === 'compact_boundary') {
          const meta = (message as { compact_metadata?: { pre_tokens?: number } }).compact_metadata;
          const detail = meta?.pre_tokens ? ` (${meta.pre_tokens.toLocaleString()} tokens compacted)` : '';
          yield { type: 'result', text: `Context compacted${detail}.` };
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
