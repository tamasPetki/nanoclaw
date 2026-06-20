/**
 * Set the night-heavy, multi-run cron cadence for the product-incubator team (Axiom + Drift).
 *
 * Tomi's point: a single 09:00 run/day is too little — the project should progress as much as it can.
 * The shared Claude subscription's rolling 5h limit is idle at night (Tomi asleep) → run FREQUENTLY at
 * night (deep autonomous progress), LESS during the day but more than once (integrate Tomi + Drift).
 *
 *   Axiom (Lead, design→build):     0 0,2,4,6,9,13,18,23 * * *   (night 23/00/02/04/06 + day 09/13/18 = 8×/day)
 *   Drift (continuous intel):       0 1,3,5,12,16 * * *          (night 01/03/05 + day 12/16 = 5×/day)
 *
 * Hours are offset by 1h between the two so their container spawns never collide. All in Europe/Budapest.
 *
 * ⚠️ PROJECT-AGNOSTIC PROMPTS (2026-06-20): the team is a reusable incubator — the CORE (Axiom/Drift +
 * METHODOLOGY + LEARNINGS) persists, the PROJECT layer (project.md + product/) is swappable. So these
 * wake-prompts must NOT name the current product or any product-specific detail; they delegate to
 * `project.md` + `product/sprint-log.md` (the ▶ NEXT RUN pointer) and the CORE files. On a pivot the cron
 * follows automatically — no prompt edit needed. (Earlier prompts hardcoded "építőipari app" + NAV + the
 * 9 pains, which went stale the instant Tomi pivoted to a new product.)
 *
 * Idempotent: re-running only refreshes the active pending row of each series (matched by series_id). It
 * INSERTs a fresh series row ONLY if none is pending — the recurrence handler renames the active row's id
 * each run, so a blind INSERT OR IGNORE keyed on id=series_id would duplicate the cron. Usage:
 * pnpm exec tsx scripts/set-shift-cadence.ts
 */
import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const ROOT = '/root/nanoclaw-v2';

function findSessionDb(agentId: string): string | null {
  const dir = `${ROOT}/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  if (!ses.length) return null;
  let best = ses[0];
  let bestM = -1;
  for (const s of ses) {
    let m = 0;
    for (const probe of ['.heartbeat', 'inbound.db', '']) {
      try {
        m = Math.max(m, fs.statSync(path.join(dir, s, probe)).mtimeMs);
      } catch {
        /* ignore */
      }
    }
    if (m > bestM) {
      bestM = m;
      best = s;
    }
  }
  return path.join(dir, best, 'inbound.db');
}

const AXIOM_CRON = '0 0,2,4,6,9,13,18,23 * * *'; // night 23/00/02/04/06 + day 09/13/18 = 8×/day
const DRIFT_CRON = '0 1,3,5,12,16 * * *';

const AXIOM_PROMPT = [
  'Új futás. Te vezeted az AKTUÁLIS terméked tervezését/építését — a terméket a `project.md` + `product/brief.md` definiálja (a session elején OLVASD el; ne feltételezz semmit fejből). DESIGN SPRINT alatt: NE kódolj a 🔵 Tomi-gate előtt (a terv a termék). BUILD-fázisban a `work` DB + a build-pipeline vezet (METHODOLOGY).',
  '',
  'Mostantól NAPONTA TÖBBSZÖR futsz (éjszaka sűrűn: ~23/00/02/04/06, nappal: ~09/13/18) — hogy a projekt haladjon, amennyire tud. NE kezdd elölről: olvasd a `LEARNINGS.md` → `project.md` + `product/brief.md` → `product/sprint-log.md`-t, és FOLYTASD a sprint-log ▶ NEXT RUN pointeréből (build-fázisban a `work` DB in-flight taskját RESUME-old a wip_note-ból — ne deriváld újra fejből).',
  '',
  'Döntsd el a legértékesebb lépést MOST, és vidd végig mélyen (Boil the Ocean — a teljes dolgot, ne a fél-utat):',
  '  • ÉJSZAKAI futás (Tomi alszik, 21:00–07:00 NEM elérhető): olyat vigyél előre, amihez NEM kell Tomi — Drift legfrissebb hírszerzésének integrálása (`<message to="drift">` kérd el a digestet vagy olvasd amit küldött + az `intel/`-t), a leggyengébb deliverable mélyítése, a wedge/moat élezése, egy red-team/pre-mortem lencse (SDK-subagent). NE pörögj üresen „Tomira várva", és ne kérdezd újra ugyanazt — a nyitott kérdéseket gyűjtsd a reggeli/esti digestbe, hogy egyszerre lássa.',
  '  • NAPPALI futás: ha Tomi válaszolt egy kérdésre/inputra, építsd be; ha a sprint-log NEXT-pointere Tomi-inputot kér (interjú / taste-gate / beachhead-jóváhagyás), fókuszáltan kérdezd a boton (ő a user + domain-expert). Kérd a Drive-ot/erőforrást, ha kell (METHODOLOGY §15).',
  '  • Mindig: a brief konkrét fájdalmait tényleg megoldja a terv, vagy feature-eket halmoz? Mi a MAG (a legégetőbb fájdalom + a make-or-break wedge, nem feature-lista)?',
  '',
  'Drift saját cronon FOLYAMATOSAN gyűjti a piac-/versenytárs-/fájdalom-/outreach-intelt — használd: olvasd a digestjeit, építsd a tervbe. Drift OWNER, nem végrehajtó (METHODOLOGY §11c): a design-fázisban NE pórázon tartsd — oszd meg vele a KERETET (a terv aktuális állása + 1-2 nyitott kérdés) kontextusként, NEM query-listaként (`<message to="drift">`, SOHA ack), és hagyd szabadon kutatni (várd el az off-frame meglepetést is). Build-fázisban válts irányítottra (konkrét kutatási feladatok). Ha Tomi vár a boton, ELŐBB neki válaszolj.',
  '',
  'A futás végén KÖTELEZŐ: append a `product/sprint-log.md`-be (+ a ▶ NEXT RUN pointer frissítése; build-fázisban a `work` DB task-státusz is). Tominak NAPONTA ~1× írj (az esti ~18:00 futás, vagy ha van érdemi sztori) — `<message to="tomi">`, magyarul: Csináltam / Gondoltam / Holnap. NE minden futásból spamelj.',
  '',
  'A fázis-szabályok a `CLAUDE.local.md`-ben: a két fázis + a KEMÉNY FAL (termék-kód CSAK a 🔵 Tomi-gate után, amikor VISION+ARCHITECTURE+ROADMAP kész ÉS red-team/pre-mortem-en átesett) + a döntési autoritás. Ha a kulcs-deliverable-ök készen vannak és önkritikán átestek → kérd a gate-et strukturált üzenetben.',
].join('\n');

const DRIFT_PROMPT = [
  'Hírszerző futás. Te vagy Drift, az AKTUÁLIS terméked Market & Growth agentje — a terméket a `project.md` definiálja (a session elején OLVASD el; ne feltételezz semmit fejből). SAJÁT CRONON futsz (éjszaka sűrűn ~01/03/05, nappal ~12/16) — a dolgod: a fejlesztéssel PÁRHUZAMOSAN, FOLYAMATOSAN bővíteni a tartós hírszerzési ADATBÁZIST (NEM md/json fájl — lásd `CLAUDE.local.md` + `METHODOLOGY.md` §13).',
  '',
  'NE kezdd elölről: olvasd a `LEARNINGS.md` → `project.md` → `bun intel/intel.ts stats` (mi van a DB-ben), és FOLYTASD. Egy futás = 1-2 terület ÉRDEMI mélyítése (versenytárs / fájdalom / outreach-cél / csatorna / GTM / disztribúció), valós kutatással (`WebSearch`/`WebFetch`, `/deep-research`), majd a DB bővítése a CLI-vel (`intel competitor|pain|target|channel|gtm|insight|source add …`). Ugyanaz a pain `--dedup_key`-jel → frequency nő. Forrás-alapú: minden tényhez `source add`.',
  '',
  'SZABAD-A-KERETEN-BELÜL — te vagy owner, nem végrehajtó (METHODOLOGY §11c). A design-fázisban (a Tomi-gate ELŐTT) TE döntöd el, mit mélyítesz. Ha Axiom megosztott egy keretet (terv-állás + nyitott kérdések), igazodj hozzá LAZÁN, DE mindig hozz off-frame meglepetést is (amit senki nem kért, de fontos — a legértékesebb találatok ilyenek). Build-fázisban (a gate UTÁN) válts: ott Axiom konkrét kutatási feladatokat ad.',
  '',
  'A futás végén KÖTELEZŐ: egy TÖMÖR digest Axiomnak (`<message to="axiom">`, magyarul: mit találtál, mi releváns a tervhez/wedge-hez, mi a következő — `intel stats`-szal). A2A hard rule: konkrét tartalom, SOHA ack. Nincs saját botod — Axiomnak jelentesz, ő tálal Tominak. Ha külső erőforrás kell (account/domain/eszköz) → jelezd Axiomnak (METHODOLOGY §15).',
  '',
  'Hetente egyszer: `intel maintain` (dedup/smell) + szemét-irtás — ne gyűljön rossz struktúra (§14). NE pörögj üresen: mindig van mit mélyíteni vagy karbantartani.',
  '',
  '⚠️ Operational secrecy: a piac-megfigyelés módszertana belső; ToS-megkerülés/automatizálás SOHA nem publikus (Reddit: olvasni OK, posztolni/disztribuálni NEM); valós cég-/ügyféladat sosem szivárog.',
].join('\n');

function upsertCron(opts: {
  agentId: string;
  seriesId: string;
  cron: string;
  prompt: string;
  fireNow: boolean;
}): void {
  const sdbPath = findSessionDb(opts.agentId);
  if (!sdbPath) {
    console.error(`!! No session for ${opts.agentId} — skipping. (Needs a live session first.)`);
    return;
  }
  const db = new Database(sdbPath);
  db.pragma('busy_timeout = 5000');
  const content = JSON.stringify({ prompt: opts.prompt, script: null });
  const now = new Date().toISOString();
  const nextCron = CronExpressionParser.parse(opts.cron, { tz: TZ }).next().toISOString();
  const firstRun = opts.fireNow ? now : nextCron;

  // Refresh the active pending row of this series (the recurrence handler renames the id each run but
  // keeps series_id). Don't touch process_after (avoid forcing an extra immediate run on re-run).
  const upd = db.prepare(
    `UPDATE messages_in SET content=@content, recurrence=@recurrence WHERE series_id=@seriesId AND status='pending'`,
  );
  const u = upd.run({ content, recurrence: opts.cron, seriesId: opts.seriesId });

  // INSERT a fresh series row ONLY if none is currently pending — otherwise the renamed-id INSERT would
  // duplicate the cron (id=series_id is free again after the handler renamed the live row).
  let inserted = 0;
  if (u.changes === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO messages_in
        (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
      VALUES
        (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
    `);
    inserted = insert.run({
      id: opts.seriesId,
      timestamp: now,
      processAfter: firstRun,
      recurrence: opts.cron,
      seriesId: opts.seriesId,
      content,
    }).changes;
  }

  console.log(
    `${opts.agentId}: cron=${opts.cron} refreshed=${u.changes} inserted=${inserted} first=${firstRun}${opts.fireNow ? ' (NOW)' : ''}`,
  );
  db.close();
}

// Axiom: refresh the existing design-cron series to the night-heavy cadence (no forced immediate run).
upsertCron({
  agentId: 'ag-shift-lead',
  seriesId: 'task-construction-design-daily',
  cron: AXIOM_CRON,
  prompt: AXIOM_PROMPT,
  fireNow: false,
});

// Drift: refresh the continuous-intel cron. fireNow=false — Drift is already running its series; we only
// swap in the project-agnostic prompt, no extra immediate run.
upsertCron({
  agentId: 'ag-shift-growth',
  seriesId: 'task-drift-intel',
  cron: DRIFT_CRON,
  prompt: DRIFT_PROMPT,
  fireNow: false,
});
