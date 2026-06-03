import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Dedicated daily "channel follow-up" sweep for Hex (ag-tracker).
// Distinct from the 3x-daily build cron: this is mechanical maintenance of the
// open external threads tracked in headlesstracker/open-threads.md — keep PRs,
// directory submissions, and posts alive until they close, instead of
// fire-and-forget. Cheap when nothing is actionable.

const TZ = 'Europe/Budapest';
const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const PROMPT = [
  'Follow-up sweep — a külső szálaid karbantartása. Ez NEM build-session: rövid, fókuszált, mechanikus. Ne kezdj új feature-t, ne ismételd a build-sessiont.',
  '',
  'Olvasd el a `headlesstracker/open-threads.md` ledgert. Minden AKTÍV szálra:',
  '  1. Nézd meg az ÉLŐ állapotát (GitHub PR-komment / CI a GitHub API-n, Glama check-státusz, poszt-reakciók, email).',
  '  2. Ha van értelmes következő lépés amit MOST meg tudsz tenni → tedd meg, végig. Ez a te terméked, a te szálad — ne pingelj Tomit azért amit magad el tudsz intézni.',
  '  3. Frissítsd a ledger blokkot: state, next-action, last-checked=ma.',
  '  4. Ha egy szál lezárult (merged / elutasítva / megválaszolva / befejezve) → told át a „Lezárt" szekcióba 1 soros eredménnyel.',
  '',
  'Ha egy szál VALÓDI külső blokkolón áll (credential/account kell Tomitól, vagy Tomi-döntés) → szólj neki a botodon (`<message to="tomi">`), konkrétan mi kell és miért. Lásd döntési autoritás a CLAUDE.local.md-ben.',
  '',
  'Ha SEMMI nem aktálható egyik szálon sem (mindegyik valami külsőre vár): frissítsd a last-checked-eket, és NE posztolj Tominak — vagy max 1 sor „minden szál vár, nincs teendő". Ne csinálj busy-workot.',
  '',
  'Jelenleg a top-priority szál: a **PR #6265** (awesome-mcp-servers) Glama-követelménye — ott van a legtöbb tennivaló (Glama-submit + Dockerfile + badge). Részletek + a teljes next-action lista a ledgerben.',
  '',
  'Hasznos a GitHub-állapothoz (token már `public_repo`, lásd CLAUDE.local.md „Tooling"):',
  '  source /workspace/agent/.secrets',
  '  GH(){ NO_PROXY="api.github.com,github.com" HTTPS_PROXY="" HTTP_PROXY="" https_proxy="" http_proxy="" curl -s -H "Authorization: Bearer $GH_TOKEN" "$@"; }',
  '',
  'Git első használat ebben a session-ben: `git config --global http.sslCAInfo "$NODE_EXTRA_CA_CERTS"`.',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) {
  console.error(`No session for ${GROUP_ID} yet — wake Hex first, then re-run.`);
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
const cron = '0 11 * * *';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-tracker-followup';

const content = JSON.stringify({ prompt: PROMPT, script: null });

const result = insert.run({
  id,
  timestamp: now,
  processAfter: next,
  recurrence: cron,
  seriesId: id,
  content,
});

// Idempotent refresh: if a pending occurrence of this cron already exists
// (re-run / recurrence engine), update its prompt to the latest.
const upd = db.prepare(
  `UPDATE messages_in SET content=@content WHERE kind='task' AND recurrence=@recurrence AND series_id=@id AND status='pending'`,
);
const u = upd.run({ content, recurrence: cron, id });

console.log(`Inserted ${id} cron=${cron} (${TZ}) next=${next} changes=${result.changes}; refreshed ${u.changes} pending occurrence(s)`);
db.close();
