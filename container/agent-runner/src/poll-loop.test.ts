import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

import { initTestSessionDb, closeSessionDb, getInboundDb, getOutboundDb } from './db/connection.js';
import { getPendingMessages, markCompleted } from './db/messages-in.js';
import { getUndeliveredMessages } from './db/messages-out.js';
import { formatMessages, extractRouting } from './formatter.js';
import { extractRoutingWithSessionFallback, shouldFollowUpInclude } from './poll-loop.js';
import { MockProvider } from './providers/mock.js';

beforeEach(() => {
  initTestSessionDb();
});

afterEach(() => {
  closeSessionDb();
});

function insertMessage(
  id: string,
  kind: string,
  content: object,
  opts?: { processAfter?: string; trigger?: 0 | 1; onWake?: 0 | 1 },
) {
  getInboundDb()
    .prepare(
      `INSERT INTO messages_in (id, kind, timestamp, status, process_after, trigger, on_wake, content)
     VALUES (?, ?, datetime('now'), 'pending', ?, ?, ?, ?)`,
    )
    .run(id, kind, opts?.processAfter ?? null, opts?.trigger ?? 1, opts?.onWake ?? 0, JSON.stringify(content));
}

describe('formatter', () => {
  it('should format a single chat message', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello world' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('Hello world');
  });

  it('should format multiple chat messages as XML block', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello' });
    insertMessage('m2', 'chat', { sender: 'Jane', text: 'Hi there' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('<messages>');
    expect(prompt).toContain('</messages>');
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('sender="Jane"');
  });

  it('should format task messages', () => {
    insertMessage('m1', 'task', { prompt: 'Review open PRs' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('<task');
    expect(prompt).toContain('Review open PRs');
  });

  it('should format webhook messages', () => {
    insertMessage('m1', 'webhook', { source: 'github', event: 'push', payload: { ref: 'main' } });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('<webhook');
    expect(prompt).toContain('source="github"');
    expect(prompt).toContain('event="push"');
  });

  it('should format system messages', () => {
    insertMessage('m1', 'system', { action: 'register_group', status: 'success', result: { id: 'ag-1' } });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('<system_response');
    expect(prompt).toContain('action="register_group"');
  });

  it('should handle mixed kinds', () => {
    insertMessage('m1', 'chat', { sender: 'John', text: 'Hello' });
    insertMessage('m2', 'system', { action: 'test', status: 'ok', result: null });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('sender="John"');
    expect(prompt).toContain('<system_response');
  });

  it('should escape XML in content', () => {
    insertMessage('m1', 'chat', { sender: 'A<B', text: 'x > y && z' });
    const messages = getPendingMessages();
    const prompt = formatMessages(messages);
    expect(prompt).toContain('A&lt;B');
    expect(prompt).toContain('x &gt; y &amp;&amp; z');
  });
});

describe('accumulate gate (trigger column)', () => {
  it('getPendingMessages returns both trigger=0 and trigger=1 rows', () => {
    // trigger=0 rides along as context, trigger=1 is the wake-eligible row.
    // The poll loop's gate depends on this data contract.
    insertMessage('m1', 'chat', { sender: 'A', text: 'chit chat' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'actual mention' }, { trigger: 1 });
    const messages = getPendingMessages();
    expect(messages).toHaveLength(2);
    const byId = Object.fromEntries(messages.map((m) => [m.id, m]));
    expect(byId.m1.trigger).toBe(0);
    expect(byId.m2.trigger).toBe(1);
  });

  it('trigger=0-only batch: gate predicate `some(trigger===1)` is false', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'noise' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'more noise' }, { trigger: 0 });
    const messages = getPendingMessages();
    // This is the exact predicate the poll loop uses to skip accumulate-only
    // batches — gate should be false, so the loop sleeps without waking the agent.
    expect(messages.some((m) => m.trigger === 1)).toBe(false);
  });

  it('mixed batch: gate is true → loop proceeds, accumulated rows ride along', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'earlier chatter' }, { trigger: 0 });
    insertMessage('m2', 'chat', { sender: 'B', text: 'the real mention' }, { trigger: 1 });
    const messages = getPendingMessages();
    expect(messages.some((m) => m.trigger === 1)).toBe(true);
    // Both messages are present for the formatter → agent sees the prior context.
    expect(messages.map((m) => m.id).sort()).toEqual(['m1', 'm2']);
  });

  it('trigger column defaults to 1 for legacy inserts without explicit value', () => {
    // The schema default is 1 (see src/db/schema.ts INBOUND_SCHEMA) — existing
    // rows / tests without the column set are effectively wake-eligible.
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, content)
         VALUES ('m1', 'chat', datetime('now'), 'pending', '{"text":"hi"}')`,
      )
      .run();
    const [msg] = getPendingMessages();
    expect(msg.trigger).toBe(1);
  });
});

describe('on_wake filtering', () => {
  it('first poll returns on_wake=1 messages', () => {
    insertMessage('m1', 'chat', { sender: 'system', text: 'Resuming.' }, { onWake: 1 });
    const messages = getPendingMessages(true);
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('m1');
  });

  it('subsequent polls skip on_wake=1 messages', () => {
    insertMessage('m1', 'chat', { sender: 'system', text: 'Resuming.' }, { onWake: 1 });
    const messages = getPendingMessages(false);
    expect(messages).toHaveLength(0);
  });

  it('normal messages returned regardless of isFirstPoll', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'hello' });
    expect(getPendingMessages(true)).toHaveLength(1);

    // Reset: mark completed so we can re-test with a fresh message
    markCompleted(['m1']);
    insertMessage('m2', 'chat', { sender: 'A', text: 'hello again' });
    expect(getPendingMessages(false)).toHaveLength(1);
  });

  it('mixed batch: first poll returns both normal and on_wake messages', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'user msg' });
    insertMessage('m2', 'chat', { sender: 'system', text: 'Resuming.' }, { onWake: 1 });
    const messages = getPendingMessages(true);
    expect(messages).toHaveLength(2);
    expect(messages.map((m) => m.id).sort()).toEqual(['m1', 'm2']);
  });

  it('mixed batch: subsequent poll returns only normal messages', () => {
    insertMessage('m1', 'chat', { sender: 'A', text: 'user msg' });
    insertMessage('m2', 'chat', { sender: 'system', text: 'Resuming.' }, { onWake: 1 });
    const messages = getPendingMessages(false);
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('m1');
  });

  it('on_wake defaults to 0 for inserts without explicit value', () => {
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, content)
         VALUES ('m1', 'chat', datetime('now'), 'pending', '{"text":"hi"}')`,
      )
      .run();
    // Should be returned even on non-first poll (on_wake=0)
    expect(getPendingMessages(false)).toHaveLength(1);
  });
});

describe('routing', () => {
  it('should extract routing from messages', () => {
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, platform_id, channel_type, thread_id, content)
       VALUES ('m1', 'chat', datetime('now'), 'pending', 'chan-123', 'discord', 'thread-456', '{"text":"hi"}')`,
      )
      .run();

    const messages = getPendingMessages();
    const routing = extractRouting(messages);
    expect(routing.platformId).toBe('chan-123');
    expect(routing.channelType).toBe('discord');
    expect(routing.threadId).toBe('thread-456');
    expect(routing.inReplyTo).toBe('m1');
  });
});

describe('extractRoutingWithSessionFallback', () => {
  // Regression guard: scheduled task rows carry no platform_id / channel_type /
  // thread_id, so the single-destination shortcut reply would land in the
  // parent channel instead of the session's own thread. The fallback must
  // pull routing from session_routing when the message row is empty.
  function insertSessionRouting(channelType: string, platformId: string, threadId: string | null) {
    getInboundDb()
      .prepare(
        `INSERT OR REPLACE INTO session_routing (id, channel_type, platform_id, thread_id)
         VALUES (1, ?, ?, ?)`,
      )
      .run(channelType, platformId, threadId);
  }

  it('uses message routing when it is populated (chat message)', () => {
    insertSessionRouting('discord', 'chan-123', 'thread-session');
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, platform_id, channel_type, thread_id, content)
         VALUES ('m1', 'chat', datetime('now'), 'pending', 'chan-123', 'discord', 'thread-from-msg', '{"text":"hi"}')`,
      )
      .run();

    const routing = extractRoutingWithSessionFallback(getPendingMessages());
    expect(routing.platformId).toBe('chan-123');
    expect(routing.channelType).toBe('discord');
    expect(routing.threadId).toBe('thread-from-msg');
    expect(routing.inReplyTo).toBe('m1');
  });

  it('falls back to session_routing when message routing is empty (task row)', () => {
    insertSessionRouting('discord', 'chan-456', 'thread-session');
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, process_after, content)
         VALUES ('task-1', 'task', datetime('now'), 'pending', datetime('now'), '{"prompt":"run"}')`,
      )
      .run();

    const routing = extractRoutingWithSessionFallback(getPendingMessages());
    expect(routing.platformId).toBe('chan-456');
    expect(routing.channelType).toBe('discord');
    expect(routing.threadId).toBe('thread-session');
    expect(routing.inReplyTo).toBe('task-1');
  });

  it('returns nulls when both message and session routing are empty', () => {
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, process_after, content)
         VALUES ('task-1', 'task', datetime('now'), 'pending', datetime('now'), '{"prompt":"run"}')`,
      )
      .run();

    const routing = extractRoutingWithSessionFallback(getPendingMessages());
    expect(routing.platformId).toBeNull();
    expect(routing.channelType).toBeNull();
    expect(routing.threadId).toBeNull();
    expect(routing.inReplyTo).toBe('task-1');
  });
});

describe('origin metadata (from= attribute)', () => {
  function seedDestination(name: string, channelType: string, platformId: string): void {
    getInboundDb()
      .prepare(
        `INSERT INTO destinations (name, display_name, type, channel_type, platform_id, agent_group_id)
         VALUES (?, ?, 'channel', ?, ?, NULL)`,
      )
      .run(name, name, channelType, platformId);
  }

  function insertWithRouting(id: string, kind: string, content: object, channelType: string | null, platformId: string | null): void {
    getInboundDb()
      .prepare(
        `INSERT INTO messages_in (id, kind, timestamp, status, platform_id, channel_type, content)
         VALUES (?, ?, datetime('now'), 'pending', ?, ?, ?)`,
      )
      .run(id, kind, platformId, channelType, JSON.stringify(content));
  }

  it('chat message includes from= when destination matches', () => {
    seedDestination('discord-main', 'discord', 'chan-1');
    insertWithRouting('m1', 'chat', { sender: 'Alice', text: 'hi' }, 'discord', 'chan-1');
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('from="discord-main"');
  });

  it('chat message falls back to raw routing when no destination matches', () => {
    insertWithRouting('m1', 'chat', { sender: 'Alice', text: 'hi' }, 'telegram', 'chat-999');
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('from="unknown:telegram:chat-999"');
  });

  it('chat message omits from= when routing is null', () => {
    insertMessage('m1', 'chat', { sender: 'Alice', text: 'hi' });
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).not.toContain('from=');
  });

  it('task message includes from= when destination matches', () => {
    seedDestination('slack-ops', 'slack', 'C-OPS');
    insertWithRouting('t1', 'task', { prompt: 'check status' }, 'slack', 'C-OPS');
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('<task');
    expect(prompt).toContain('from="slack-ops"');
  });

  it('task message omits from= when routing is null', () => {
    insertMessage('t1', 'task', { prompt: 'check status' });
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('<task');
    expect(prompt).not.toContain('from=');
  });

  it('webhook message includes from= when destination matches', () => {
    seedDestination('github-ch', 'github', 'repo-1');
    insertWithRouting('w1', 'webhook', { source: 'github', event: 'push', payload: {} }, 'github', 'repo-1');
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('<webhook');
    expect(prompt).toContain('from="github-ch"');
  });

  it('system message includes from= when destination matches', () => {
    seedDestination('discord-main', 'discord', 'chan-1');
    insertWithRouting('s1', 'system', { action: 'test', status: 'ok', result: null }, 'discord', 'chan-1');
    const prompt = formatMessages(getPendingMessages());
    expect(prompt).toContain('<system_response');
    expect(prompt).toContain('from="discord-main"');
  });
});

describe('mock provider', () => {
  it('should produce init + result events', async () => {
    const provider = new MockProvider({}, (prompt) => `Echo: ${prompt}`);
    const query = provider.query({
      prompt: 'Hello',
      cwd: '/tmp',
    });

    const events: Array<{ type: string }> = [];
    setTimeout(() => query.end(), 50);

    for await (const event of query.events) {
      events.push(event);
    }

    const typed = events.filter((e) => e.type !== 'activity');
    expect(typed.length).toBeGreaterThanOrEqual(2);
    expect(typed[0].type).toBe('init');
    expect(typed[1].type).toBe('result');
    expect((typed[1] as { text: string }).text).toBe('Echo: Hello');
  });

  it('should handle push() during active query', async () => {
    const provider = new MockProvider({}, (prompt) => `Re: ${prompt}`);
    const query = provider.query({
      prompt: 'First',
      cwd: '/tmp',
    });

    const events: Array<{ type: string; text?: string }> = [];

    setTimeout(() => query.push('Second'), 30);
    setTimeout(() => query.end(), 60);

    for await (const event of query.events) {
      events.push(event);
    }

    const results = events.filter((e) => e.type === 'result');
    expect(results).toHaveLength(2);
    expect(results[0].text).toBe('Re: First');
    expect(results[1].text).toBe('Re: Second');
  });
});

describe('processQuery — initial batch completion on result', () => {
  it('marks initial batch completed on first result (not only on stream end)', async () => {
    // Regression guard for the downstream fix: under concurrent-polling the
    // SDK event stream stays open indefinitely, so waiting for stream end
    // before markCompleted leaves the processing_ack at 'processing' forever.
    // The fix: mark on the first `result` event.
    const { processQuery } = await import('./poll-loop.js');
    const { markProcessing } = await import('./db/messages-in.js');

    insertMessage('m1', 'chat', { sender: 'User', text: 'hi' });
    const messages = getPendingMessages();
    markProcessing(['m1']);

    const provider = new MockProvider({}, () => 'hello back');
    const query = provider.query({ prompt: formatMessages(messages), cwd: '/tmp' });

    // Do NOT call query.end() — simulate the concurrent-polling case where
    // the stream stays open (the real failure mode). Observe that ack flips
    // to 'completed' anyway, once the result event fires. We race the check
    // against a timeout to catch the regression without hanging forever.
    const routing = extractRouting(messages);
    const processPromise = processQuery(query, routing, ['m1']);

    // Wait for the mock provider's result (emitted after ~15ms). Poll the ack.
    const deadline = Date.now() + 1000;
    let ackStatus: string | undefined;
    while (Date.now() < deadline) {
      const row = getOutboundDb()
        .prepare("SELECT status FROM processing_ack WHERE message_id = 'm1'")
        .get() as { status: string } | undefined;
      ackStatus = row?.status;
      if (ackStatus === 'completed') break;
      await new Promise((r) => setTimeout(r, 10));
    }

    expect(ackStatus).toBe('completed');

    // Clean up: close the stream so the test doesn't leak a running processQuery.
    query.end();
    await processPromise;
  });

  it('mark-on-result is idempotent with the caller-side safety-net markCompleted', async () => {
    // After processQuery returns, the outer while-loop also calls
    // markCompleted(processingIds) as a safety net for error paths. Both
    // calls must be safe to run for the same ids (INSERT OR REPLACE).
    const { processQuery } = await import('./poll-loop.js');
    const { markProcessing, markCompleted } = await import('./db/messages-in.js');

    insertMessage('m1', 'chat', { sender: 'User', text: 'hi' });
    markProcessing(['m1']);

    const provider = new MockProvider({}, () => 'hi');
    const query = provider.query({ prompt: 'hi', cwd: '/tmp' });
    const routing = extractRouting(getPendingMessages());

    const processPromise = processQuery(query, routing, ['m1']);
    // Let the stream close naturally by ending after result has fired.
    setTimeout(() => query.end(), 50);
    await processPromise;

    // Safety-net call by outer while-loop — must not throw or corrupt state.
    markCompleted(['m1']);

    const row = getOutboundDb()
      .prepare("SELECT status FROM processing_ack WHERE message_id = 'm1'")
      .get() as { status: string };
    expect(row.status).toBe('completed');
  });
});

describe('shouldFollowUpInclude — concurrent-polling filter', () => {
  const notAdmin = () => false;
  const discordThread = 'discord:g:c:t';

  it('includes same-thread chat messages', () => {
    expect(
      shouldFollowUpInclude(
        { kind: 'chat', channel_type: 'discord', thread_id: discordThread },
        discordThread,
        notAdmin,
      ),
    ).toBe(true);
  });

  it('excludes cross-thread chat messages', () => {
    expect(
      shouldFollowUpInclude(
        { kind: 'chat', channel_type: 'discord', thread_id: 'discord:g:c:other' },
        discordThread,
        notAdmin,
      ),
    ).toBe(false);
  });

  it('excludes system messages regardless of thread', () => {
    expect(
      shouldFollowUpInclude(
        { kind: 'system', channel_type: null, thread_id: null },
        discordThread,
        notAdmin,
      ),
    ).toBe(false);
  });

  it('includes agent-to-agent messages even when active turn has a discord thread', () => {
    // Regression guard: agent-to-agent messages have channel_type='agent' and
    // thread_id=null by construction. If the active turn was started by a
    // Discord message (non-null threadId), the prior thread-only filter would
    // drop these, leaving cross-agent replies pending forever.
    expect(
      shouldFollowUpInclude(
        { kind: 'chat', channel_type: 'agent', thread_id: null },
        discordThread,
        notAdmin,
      ),
    ).toBe(true);
  });

  it('excludes admin chat messages (they need a fresh query)', () => {
    expect(
      shouldFollowUpInclude(
        { kind: 'chat', channel_type: 'discord', thread_id: discordThread },
        discordThread,
        () => true,
      ),
    ).toBe(false);
  });
});

describe('end-to-end with mock provider', () => {
  it('should read messages_in, process with mock provider, write messages_out', async () => {
    // Insert a chat message into inbound DB
    insertMessage('m1', 'chat', { sender: 'User', text: 'What is 2+2?' });

    // Read and process
    const messages = getPendingMessages();
    expect(messages).toHaveLength(1);

    const routing = extractRouting(messages);
    const prompt = formatMessages(messages);

    // Create mock provider and run query
    const provider = new MockProvider({}, () => 'The answer is 4');
    const query = provider.query({
      prompt,
      cwd: '/tmp',
    });

    // Process events — simulate what poll-loop does
    const { markProcessing } = await import('./db/messages-in.js');
    const { writeMessageOut } = await import('./db/messages-out.js');

    markProcessing(['m1']);

    setTimeout(() => query.end(), 50);

    for await (const event of query.events) {
      if (event.type === 'result' && event.text) {
        writeMessageOut({
          id: `out-${Date.now()}`,
          in_reply_to: routing.inReplyTo,
          kind: 'chat',
          platform_id: routing.platformId,
          channel_type: routing.channelType,
          thread_id: routing.threadId,
          content: JSON.stringify({ text: event.text }),
        });
      }
    }

    markCompleted(['m1']);

    // Verify: message was processed (not pending, acked in processing_ack)
    const processed = getPendingMessages();
    expect(processed).toHaveLength(0);

    // Verify: response was written to outbound DB
    const outMessages = getUndeliveredMessages();
    expect(outMessages).toHaveLength(1);
    expect(JSON.parse(outMessages[0].content).text).toBe('The answer is 4');
    expect(outMessages[0].in_reply_to).toBe('m1');
  });
});
