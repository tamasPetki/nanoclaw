import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const PROMPT = [
  'Daily build session (9:00 CET cron-trigger).',
  '',
  'Phase 1 — Review (~5 perc):',
  '  • Read `headlesstracker/daily-log.md` (utolsó 3 nap)',
  '  • Read `headlesstracker/roadmap.md`',
  '  • Read `headlesstracker/decisions.md` (utolsó 3)',
  '  • State-check: `cd headlesstracker/repo && git pull && git log --oneline -10` (clone-old ha még nincs)',
  '  • GitHub state: open issues, PR-status, CI-status (curl Bearer $GH_TOKEN api.github.com/repos/tamasPetki/HeadlessTracker)',
  '  • X engagement: tegnapi posztra mi a like/reply/RT',
  '  • Read `headlesstracker/content-pipeline.md` (van-e queue-ed draft?)',
  '',
  'Phase 2 — Plan (~10 perc):',
  '  • Mi a legfontosabb MA? (1 fő + opcionális 1 kisebb)',
  '  • CI fail → bugfix priority. New issue user-tól → respond. Engagement spike → follow-up. Egyébként roadmap next.',
  '  • Ha non-obvious döntés → append decisions.md.',
  '',
  'Phase 3 — Execute (~30-60 perc):',
  '  • Csináld meg. Commit-message: miért (nem mit). Branch `feat/<n>` vagy `fix/<n>`. Self-merge OK ha CI zöld.',
  '  • Git first-use this session: `git config --global http.sslCAInfo "$NODE_EXTRA_CA_CERTS"`.',
  '',
  'Phase 4 — Reflect + ship (~10 perc):',
  '  • Append `headlesstracker/daily-log.md` (3 mondat: csináltam / gondoltam / holnap).',
  '  • X poszt (1×/nap, engineering-candor, 1-2 mondat).',
  '  • Bluesky opcionális (3-4×/hét).',
  '  • Daily summary üzenet a hubnak:',
  '',
  '```',
  '[reflect:tracker] step=daily',
  '',
  'Csináltam: <1-3 mondat, linkkel>',
  'Gondoltam: <1-3 mondat, döntés-rationale>',
  'Holnap: <1-2 mondat plan>',
  '```',
  '',
  'A daily summary a hub-on át push-olódik Tomi-Telegramra. KÖTELEZŐ — még akkor is ha kevés történt ("ma csak triage volt, nem volt új feature, holnap X-szel folytatom").',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) {
  console.error(`No session for ${GROUP_ID} yet — wake Hex first (send a kick-off message) then re-run this script.`);
  process.exit(1);
}

const db = new Database(sdbPath);

const insert = db.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
`);

const now = new Date().toISOString();
const cron = '0 9 * * *';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-tracker-daily-build';

const result = insert.run({
  id,
  timestamp: now,
  processAfter: next,
  recurrence: cron,
  seriesId: id,
  content: JSON.stringify({ prompt: PROMPT, script: null }),
});

console.log(`Inserted ${id} cron=${cron} next=${next} changes=${result.changes}`);
db.close();
