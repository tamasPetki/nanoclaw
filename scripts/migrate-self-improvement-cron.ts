import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const TZ = 'Europe/Budapest';
const TG_PLATFORM = 'telegram:1243781160';

function findHubSessionDb(): string {
  const dir = '/root/nanoclaw-v2/data/v2-sessions/ag-hub';
  if (!fs.existsSync(dir)) throw new Error(`hub session dir not found: ${dir}`);
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  if (ses.length === 0) throw new Error('no hub session — wake the hub first');
  return path.join(dir, ses[0], 'inbound.db');
}

const HUB_DB = findHubSessionDb();
console.log(`hub inbound.db: ${HUB_DB}`);

const cron = '0 11 * * 0'; // vasárnap 11:00 CET
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();

const prompt = [
  'Heti self-improvement reflection. Olvasd el a `/app/skills/self-improvement/SKILL.md`-t és KÖVESD pontról-pontra:',
  '',
  '1. Evidence-gyűjtés (utolsó 7 nap): wiki/log.md, worker-activity.md, hub session inbound failed/paused tasks, Tomi-pull javítás-minták az user-üzenetekben.',
  '2. Kategorizálás (4-féle scope): skill-update / wiki-gap / mcp-install / voice-calibration.',
  '3. Top 3-5 finding kihámozása súlyozással (gyakoriság × Tomi-impact).',
  '4. `wiki/findings/YYYY-W<NN>.md` generálás (frontmatter type:finding).',
  '5. `wiki/log.md` append.',
  '6. **`mcp__nanoclaw__ask_user_question` card** Tomi-nak Telegramra a finding-listával — gombok: Mind / Top 3 / Csak 1 / Skip. Timeout 24h.',
  '7. Approve esetén: kategória-szerinti auto-execute (skill Edit, wiki ingest, install_packages request, global CLAUDE.md edit).',
  '8. Visszaigazoló card Tomi-nak.',
  '',
  'Rate-limit: max havonta egyszer ugyanaz a skill-frissítés. 0 finding esetén NE küldj cardot, csak log.md append.',
  '',
  'Skill-edit-hez használd a `skill-authoring` skillt (frontmatter validation, méret-limit, trigger-broadening).',
].join('\n');

const wdb = new Database(HUB_DB);
const insert = wdb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (?, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', ?, 'pending', ?, ?, ?, 0, 1, ?, 'telegram', NULL, ?)
`);
const result = insert.run(
  'task-hub-self-improvement',
  new Date().toISOString(),
  next,
  cron,
  'task-hub-self-improvement',
  TG_PLATFORM,
  JSON.stringify({ prompt, script: null })
);
console.log(`Inserted task-hub-self-improvement cron=${cron} next=${next} (changes=${result.changes})`);
wdb.close();
