import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';

const TZ = 'Europe/Budapest';
const HUB_DB_PATH = '/root/nanoclaw-v2/data/v2-sessions/ag-hub/sess-1778077155679-2tf6v0/inbound.db';
const TG_PLATFORM = 'telegram:1243781160';

const lintPrompt = [
  'Heti wiki lint pass — kövesd a `container/skills/wiki/` lint workflow-t (`/app/skills/wiki/SKILL.md`).',
  '',
  'Ellenőrzendő:',
  '- Ellentmondások (két oldal mást állít ugyanarról)',
  '- Orphan oldalak (nincs hozzájuk hivatkozás index.md-ből vagy más oldalról)',
  '- Stale tartalom (utolsó update >3 hónap)',
  '- Hiányzó kereszthivatkozások (entitás-oldal csak 1 helyről linkelt)',
  '- Gap-ek (log szerint volt ingest, tartalom nem épült be teljesen)',
  '',
  'Eredmény Tominak Telegram-üzenetben, javaslat-listával. NE javíts automatikusan — egyezz meg vele.',
  'Append a `wiki/log.md`-be: `## [YYYY-MM-DD] lint | <találatok száma> | <rövid összefoglaló>`',
].join('\n');

const hubDb = new Database(HUB_DB_PATH);
const cron = '0 10 * * 0';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();

const insert = hubDb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (?, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', ?, 'pending', ?, ?, ?, 0, 1, ?, 'telegram', NULL, ?)
`);
insert.run(
  'task-wiki-lint',
  new Date().toISOString(),
  next,
  cron,
  'task-wiki-lint',
  TG_PLATFORM,
  JSON.stringify({ prompt: lintPrompt, script: null })
);
console.log(`Inserted task-wiki-lint cron=${cron} next=${next}`);
hubDb.close();
