import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const WORKER_DB = '/root/nanoclaw-v2/data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/inbound.db';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const tasks: Array<{ id: string; cron: string; prompt: string }> = [
  {
    id: 'task-worker-rezerver-growth',
    cron: '30 17 * * *',
    prompt: [
      'Esti growth session — Dani persona (Rezerver). Olvasd `rezerver/state.json`, `rezerver/strategy.md`, `rezerver/facebook_group_log.md`. Inbox check (`rezerver-email` MCP). Egy fókusz: vagy venue pipeline, vagy FB Phase action, vagy HU media followup, vagy referral.',
      '',
      'NE küldj outbound DM-et / cold-emailt csendes karakterépítő fázisban (2026-04-18 óta). Csak inbox reply.',
      '',
      'Action végrehajtása után update state.json + strategy.md changelog ha van változás. Append `facebook_group_log.md` ha FB.',
      '',
      'Report a hubnak: `send_message hub` → `[worker:rezerver] phase=<X> action=<Y> result=<short> next=<Z>` (max 5 sor).',
    ].join('\n'),
  },
  {
    id: 'task-worker-bulltrapp-growth',
    cron: '0 7,11,15,19 * * *',
    prompt: [
      'BullTrapp growth loop — Lloyd persona. State `bulltrapp/state.json`, strategy `bulltrapp/strategy.md`, email_pipeline `bulltrapp/email_pipeline.json`.',
      '',
      'Egy run = egy fókusz: cold email outreach (lloyd@bulltrapp.com), X (@Bulltrappcom) tweet candidate (NE poszt automatikusan, draft-be kérdezz wikiből), vagy follow-up.',
      '',
      'Memóriából: sender quality > volume, anti-AI tells (no em-dash, no antithesis), Reddit u/Mammoth lock 2026-04-17 óta — Reddit tilos.',
      '',
      'Report a hubnak: `[worker:bulltrapp] phase=<X> action=<Y> result=<short> next=<Z>` (max 5 sor).',
    ].join('\n'),
  },
];

const wdb = new Database(WORKER_DB);

const insert = wdb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
`);

const now = new Date().toISOString();
for (const t of tasks) {
  const next = CronExpressionParser.parse(t.cron, { tz: TZ }).next().toISOString();
  insert.run({
    id: t.id,
    timestamp: now,
    processAfter: next,
    recurrence: t.cron,
    seriesId: t.id,
    content: JSON.stringify({ prompt: t.prompt, script: null }),
  });
  console.log(`Inserted ${t.id} cron=${t.cron} next=${next}`);
}

// Cancel old recurring tasks in bulltrapp + rezerver
for (const ag of ['ag-bulltrapp', 'ag-rezerver']) {
  const db = findSessionDb(ag);
  if (!db) continue;
  const sdb = new Database(db);
  const r = sdb
    .prepare(`UPDATE messages_in SET status='completed', recurrence=NULL WHERE kind='task' AND status='pending'`)
    .run();
  console.log(`Cancelled ${r.changes} tasks in ${ag}`);
  sdb.close();
}

wdb.close();
