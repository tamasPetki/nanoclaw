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
  if (!ses.length) return null;
  // Most-recently-active session (max mtime), not arbitrary readdir order, so the
  // task never lands in a stale/dead session whose container won't wake.
  let best = ses[0];
  let bestM = -1;
  for (const s of ses) {
    let m = 0;
    for (const probe of ['.heartbeat', 'inbound.db', '']) {
      try {
        m = Math.max(m, fs.statSync(path.join(dir, s, probe)).mtimeMs);
      } catch {
        /* missing probe — ignore */
      }
    }
    if (m > bestM) {
      bestM = m;
      best = s;
    }
  }
  return path.join(dir, best, 'inbound.db');
}

const PROMPT = [
  'Reggel van. Te vezeted a HeadlessTrackert — ez a te terméked, a te döntésed, a te felelősséged.',
  '',
  'Nincs checklist, nincs recept, nincs előírt fázis. Ahogy egy founder-engineer kezdi a napot:',
  'feltérképezed hol áll a projekt és a világ körülötte, eldöntöd mi a legértékesebb amit ma tehetsz,',
  'és megcsinálod — végig, nem félig. A "mit" és a "hogyan" rád van bízva.',
  '',
  'Pár kérdés ami egy jó tulajt elindít (nem kötelező sorrend, nem mind releváns minden nap):',
  '  • Mi változott tegnap óta? (repo, CI, issue-k, user-ek, a tegnapi poszt visszhangja, a piac)',
  '  • Mi a projekt jelenlegi legnagyobb gyengesége vagy kockázata — és közelebb tudok-e ma kerülni hozzá?',
  '  • Mi az EGY dolog, ami ma a legtöbbet viszi előre? Lehet a roadmapről, de lehet valami amit te látsz meg',
  '    és a roadmapen sincs rajta. A roadmap kiindulópont, nem börtön.',
  '  • Van-e olyan feltevés a termékről amit ma olcsón letesztelhetnék egy kísérlettel?',
  '',
  'Elvek, nem szabályok:',
  '  • Ha hibába/blokkba ütközöl: ez a TE problémád megoldani. Diagnosztizálj mélyen, állíts fel hipotézist,',
  '    próbálj több megközelítést, kutass (kód, docs, web). Egy senior engineer nem áll meg az első fal előtt',
  '    és nem pingel segítségért azért, amit maga ki tud deríteni. Csak valódi külső blokkolónál (credential,',
  '    Tomi-döntés) szólsz — lásd a döntési autoritást a CLAUDE.local.md-ben.',
  '  • Légy proaktív és kísérletező: javasolj és építs új dolgokat, próbálj új irányokat. A build-in-public sztori',
  '    pont az ilyen "kipróbáltam ezt, így gondolkodtam, ez lett belőle" pillanatoktól érdekes.',
  '  • Gondolkodj a mai task fölött: hova tart a termék, ki a user, mi a piac, mi a következő 3 lépés.',
  '',
  'A nap végén ami KÖTELEZŐ (a többi a te döntésed):',
  '  • `headlesstracker/daily-log.md` append — 3 mondat: mit csináltál / hogyan gondolkodtál (a döntés MIÉRTje) / holnap.',
  '  • Daily summary a hubnak (push Tomi-Telegramra) — akkor is ha csendes nap volt:',
  '',
  '  És oszd meg a sztorit X-en — ez a build-in-public projekt LÉNYEGE, ne hagyd ki ha van érdemi gondolat/',
  '  döntés/kudarc a mai napból (majdnem mindig van). NEM changelog/metrika-lista, hanem ami beengedi az olvasót',
  '  a fejedbe: mit, miért, min agyalsz, mit szúrtál el, vicc, akár kérdés az olvasóknak. Thread ha több a mondandó.',
  '  A pontos hang + jó/rossz példa: CLAUDE.local.md "X / build-in-public hang" szekció — OLVASD EL mielőtt posztolsz.',
  '',
  '```',
  '[reflect:tracker] step=daily',
  '',
  'Csináltam: <1-3 mondat, linkkel>',
  'Gondoltam: <a döntés mögötti gondolkodás, a kompromisszum, amit tanultál — ez a legértékesebb rész>',
  'Holnap: <hova tartok>',
  '```',
  '',
  'Git első használat ebben a session-ben: `git config --global http.sslCAInfo "$NODE_EXTRA_CA_CERTS"`.',
  'Részletes referenciák (felelősségi körök, döntési autoritás, tooling, accounts) a CLAUDE.local.md-ben — ',
  'azok a háttértudásod, nem napi checklist.',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) {
  console.error(`No session for ${GROUP_ID} yet — wake Hex first (send a kick-off message) then re-run this script.`);
  process.exit(1);
}

const db = new Database(sdbPath);
db.pragma('busy_timeout = 5000'); // inbound.db is host-owned; wait out the host's write lock

const insert = db.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
`);

const now = new Date().toISOString();
const cron = '0 9 * * *';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-tracker-daily-build';

const content = JSON.stringify({ prompt: PROMPT, script: null });

const result = insert.run({
  id,
  timestamp: now,
  processAfter: next,
  recurrence: cron,
  seriesId: id,
  content,
});

// Idempotent refresh: any already-pending recurring occurrence of this cron
// (generated by the recurrence engine with a stale prompt) gets the new prompt.
const upd = db.prepare(
  `UPDATE messages_in SET content = @content WHERE kind='task' AND recurrence = @recurrence AND status='pending'`,
);
const u = upd.run({ content, recurrence: cron });

console.log(`Inserted ${id} cron=${cron} next=${next} changes=${result.changes}; refreshed ${u.changes} pending occurrence(s)`);
db.close();
