import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const HUB_DB_PATH = '/root/nanoclaw-v2/data/v2-sessions/ag-hub/sess-1778077155679-2tf6v0/inbound.db';

// Find the live ag-edzo session inbound.db
const edzoDir = '/root/nanoclaw-v2/data/v2-sessions/ag-edzo';
const sessions = fs.readdirSync(edzoDir).filter((s) => s.startsWith('sess-'));
if (sessions.length === 0) {
  console.error('No ag-edzo session found');
  process.exit(1);
}
const EDZO_DB_PATH = path.join(edzoDir, sessions[0], 'inbound.db');

const TG_PLATFORM = 'telegram:1243781160';

const tasks: Array<{ id: string; seriesId: string; cron: string; prompt: string }> = [
  {
    id: 'task-edzo-reggeli',
    seriesId: 'task-edzo-reggeli',
    cron: '30 7 * * 1-5',
    prompt:
      'Reggeli edző-riport Tominak. Withings (get_weight_and_body, get_sleep, get_activity) + heti trendek. Heti edzéstervből mai fókusz (wiki/health/edzo/context.md). Naplózás: history.md új sorra YYYY-MM-DD reggel — súly, AHI, REM, fókusz. Káromkodós-edző hangon. Eredményeket Tominak Telegram DM-en.',
  },
  {
    id: 'task-edzo-esti',
    seriesId: 'task-edzo-esti',
    cron: '0 21 * * *',
    prompt:
      'Esti edző-emlékeztető. Holnapi edzés (history.md/context.md), ajánlott lefekvési idő (alvástrend). Append history.md mai sorához: este — edzés/kcal/hideg fürdő. 2-3 mondat, ne túl rinyálós. Káromkodós-edző hangon.',
  },
  {
    id: 'task-edzo-hetvegi',
    seriesId: 'task-edzo-hetvegi',
    cron: '0 10 * * 0,6',
    prompt:
      'Hétvégi reggeli riport — heti áttekintés. Withings heti trend (súly, alvás, aktivitás), history.md előző hét napi naplók, mit jól/rosszul, jövő heti fókusz. Káromkodós-edző hangon. Új heti összefoglaló a wiki/health/edzo/history.md "Heti összefoglalók" alá.',
  },
];

const hubDb = new Database(HUB_DB_PATH);
const edzoDb = new Database(EDZO_DB_PATH);

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

// Cancel old edzo recurring tasks
const cancel = edzoDb.prepare(
  `UPDATE messages_in SET status='completed', recurrence=NULL WHERE kind='task' AND status='pending'`
);
const result = cancel.run();
console.log(`Cancelled ${result.changes} old edzo tasks`);

hubDb.close();
edzoDb.close();
