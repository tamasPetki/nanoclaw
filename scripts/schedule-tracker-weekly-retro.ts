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
  'Weekly retrospective session (vasárnap 18:00 CET cron-trigger).',
  '',
  'Ez NEM a daily — strategic szint, 7 napos minta-felismerés. A daily-ket NE ismételd, a hetet ELEMEZD.',
  '',
  'Phase 1 — Gather (~10 perc):',
  '  • Read `headlesstracker/daily-log.md` az utolsó 7 nap teljes egészében.',
  '  • Read `headlesstracker/decisions.md` az utolsó hét bejegyzéseit.',
  '  • Read `headlesstracker/roadmap.md` — a current state vs eredeti plan.',
  '  • Read `headlesstracker/learning.md` — competitive intel, market signals.',
  '  • GitHub state-trend: `curl -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/repos/tamasPetki/HeadlessTracker | jq "{stargazers_count, open_issues_count, forks_count, pushed_at}"` — vs múlt héten ha tárolod (most még nem trackeled, de a daily-log-ból kiolvasható).',
  '  • npm DL trend: `curl -s https://api.npmjs.org/downloads/range/last-week/headlesstracker | jq` (adjust package név).',
  '  • X engagement trend: az utolsó 7 poszt összesítése — like/reply/RT total, top-poszt.',
  '  • Sentry trend (ha shippelt): unresolved issues counts vs múlt héten.',
  '',
  'Phase 2 — Synthesize (~15 perc):',
  '  • Mit tanultunk a héten? (3-5 bullet)',
  '  • Mi működött? (X tone, fejlesztési ütem, mi keltett engagementet)',
  '  • Mi nem? (mi ragadt, mi vesztett mom-t)',
  '  • Strategic shift szükséges? (ha igen, append decisions.md)',
  '  • A roadmap.md "Theme proposals to evaluate" listából commit-olható-e már bármelyik az aktuális 1-2 hetes scope-ba? (ha igen, frissítsd a roadmap.md-t)',
  '',
  'Phase 3 — Longer-form content (~15-30 perc):',
  '  • Írj 1× longer-form publication-t:',
  '    - X-thread (3-7 tweet, építőkocka-stílusban: "Week N — here\'s what I shipped and what I learned")',
  '    - VAGY Bluesky longer post (~500 char, narratívabb)',
  '    - VAGY ha tényleg van anyag: dev.to / hashnode blogposzt (300-800 szó). Csak ha érdemi tartalom van, NE forszírozd.',
  '  • Tone: engineering candor, mutass hibákat és kompromisszumokat is, NE blurb.',
  '  • Compliance: "Not financial advice" CLAUDE.local.md COMPLIANCE szekció szerint.',
  '',
  'Phase 4 — Wrap (~10 perc):',
  '  • Append `headlesstracker/daily-log.md` — egy külön bejegyzés: `## YYYY-MM-DD (vasárnap) — weekly retro` (4-5 mondat: hét összefoglaló + key learning + next-week plan).',
  '  • Update `headlesstracker/roadmap.md` ha strategic-shift történt (ne minden héten — csak ha tényleg van rationale).',
  '  • Weekly summary üzenet a hubnak:',
  '',
  '```',
  '[reflect:tracker] step=weekly',
  '',
  'A hét számai: <commit-count / PR-count / merged / X-engagement total / npm DL / GitHub stars>',
  'Mit tanultam: <2-3 mondat key learning>',
  'Roadmap-update: <1 mondat — változott-e a prio, ha igen mi>',
  'Jövő hét: <1-2 mondat fő-fókusz>',
  'Longer-form: <linkek a heti publikációkra>',
  '```',
  '',
  'KÖTELEZŐ — még akkor is ha a hét lassú volt ("Csendes hét, csak 1 PR ment, X-en 0 engagement; jövő héten X-re koncentrálok mert Y").',
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
const cron = '0 18 * * 0';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-tracker-weekly-retro';

const result = insert.run({
  id,
  timestamp: now,
  processAfter: next,
  recurrence: cron,
  seriesId: id,
  content: JSON.stringify({ prompt: PROMPT, script: null }),
});

console.log(`Inserted ${id}: changes=${result.changes}, next_fire=${next} (CET: ${new Date(next).toLocaleString('hu-HU', { timeZone: TZ })})`);
db.close();
