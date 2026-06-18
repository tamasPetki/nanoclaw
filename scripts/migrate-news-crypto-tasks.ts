import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const HUB_DB_PATH = '/root/nanoclaw-v2/data/v2-sessions/ag-hub/sess-1778077155679-2tf6v0/inbound.db';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const TG_PLATFORM = 'telegram:1243781160';

const newsPrompt = [
  'Napi reggeli hírdigest Tominak. 4 kategória, mindet egy Telegram-üzenetben (markdown formázás, ha sok, oszd 2-3 üzenetre):',
  '',
  '1. **Politika** — top 3 magyar+globális, 1 mondat összefoglaló, link <https://...>',
  '2. **Kriptó** — BTC/ETH/SOL ár, top mover, 2 hír link <https://...>',
  '3. **AI** — top 3-5 AI-releváns poszt az X "AI" listából (id 2026028408996823510). Futtasd: `source /workspace/group/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh 2026028408996823510 20` — kb 20 tweetet ad @handle + like + RT + szöveg + URL formátumban. Top 3-5 builder/dev tartalmat válogass.',
  '4. **X lista — Crypto/Investor** (id 1763666482175631479) — futtasd ugyanaz, top 3 érdekes.',
  '',
  'LINKEK KÖTELEZŐ FORMÁTUM: <https://...> (Telegram preview-suppress).',
  'Eredmény mentése a `wiki/news/YYYY-MM-DD.md` és `wiki/crypto/YYYY-MM-DD.md` fájlokba is. Ne küldj emailt.',
].join('\n');

const cryptoPrompt = [
  'Reggeli crypto briefing Tomi-nak (CrypTom hangon). BTC/ETH/SOL/top10 ár+24h delta, top news, narratives.md-be új szakasz, trades.md-be új ötlet ha látsz. Eredmény Telegramra (markdown), citation a wiki/crypto/-ből.',
  '',
  'Mentés: `wiki/crypto/YYYY-MM-DD.md` napi blokk.',
].join('\n');

const tasks: Array<{ id: string; seriesId: string; cron: string; prompt: string }> = [
  {
    id: 'task-hub-news',
    seriesId: 'task-hub-news',
    cron: '0 6 * * *',
    prompt: newsPrompt,
  },
  {
    id: 'task-hub-crypto-morning',
    seriesId: 'task-hub-crypto-morning',
    cron: '30 5 * * *',
    prompt: cryptoPrompt,
  },
];

const hubDb = new Database(HUB_DB_PATH);

const insert = hubDb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, @platformId, 'telegram', NULL, @content)
`);

const now = new Date().toISOString();
for (const t of tasks) {
  const next = CronExpressionParser.parse(t.cron, { tz: TZ }).next().toISOString();
  insert.run({
    id: t.id,
    timestamp: now,
    processAfter: next,
    recurrence: t.cron,
    seriesId: t.seriesId,
    platformId: TG_PLATFORM,
    content: JSON.stringify({ prompt: t.prompt, script: null }),
  });
  console.log(`Inserted ${t.id} cron=${t.cron} next=${next}`);
}

// Cancel old tasks in napi-hirek + crypto
for (const ag of ['ag-napi-hirek', 'ag-crypto']) {
  const db = findSessionDb(ag);
  if (!db) {
    console.log(`No session for ${ag}, skipping cancel`);
    continue;
  }
  const sdb = new Database(db);
  const r = sdb
    .prepare(`UPDATE messages_in SET status='completed', recurrence=NULL WHERE kind='task' AND status='pending'`)
    .run();
  console.log(`Cancelled ${r.changes} tasks in ${ag}`);
  sdb.close();
}

hubDb.close();
