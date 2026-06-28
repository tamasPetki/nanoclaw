/**
 * Set the cron cadence for the "Ledger" product-incubator trio (Ledger + Tally + Form),
 * which builds an internal financial management app for Tomi's own companies.
 *
 * Unlike the Axiom+Drift incubator (which races a market, hence night-heavy), Ledger builds
 * an INTERNAL tool — no market/distribution race — and the interview-first design phase needs
 * Tomi (daytime). So this cadence is LIGHTER + DAYTIME-LEANING + hour-offset to avoid the
 * shared 5h Claude limit colliding with Axiom (0,2,4,6,9,13,18,23) and Drift (1,3,5,12,16):
 *
 *   Ledger (lead, interview→design→build):  0 7,11,15,20 * * *   (4×/day)
 *   Tally  (finance domain + integrations):  30 8,16,21 * * *     (3×/day, :30 offset)
 *   Form   (design / UX):                     30 10,17,22 * * *    (3×/day, :30 offset)
 *
 * Run this AFTER the .env token + host restart, BEFORE Tomi first messages the bot. It does two
 * things: (1) ensures each agent has a session via resolveSession — Tally/Form have no bot/inbound
 * so this is the only way they get a session (created with messaging_group_id=NULL, like Drift);
 * Ledger's session is created keyed to its DM mg so the router finds it on Tomi's first message;
 * (2) writes the recurring cron task into each session's inbound.db.
 *
 * PROJECT-AGNOSTIC PROMPTS: the prompts delegate to project.md + product/brief.md + sprint-log +
 * the CORE files; they never name a specific feature, so a project pivot needs no prompt edit.
 *
 * Idempotent: re-running refreshes the active pending row of each series (matched by series_id),
 * INSERTing a fresh row only if none is pending. Usage: pnpm exec tsx scripts/set-ledger-cadence.ts
 */
import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';

import { initDb, getDb } from '../src/db/connection.js';
import { resolveSession, inboundDbPath } from '../src/session-manager.js';

const TZ = 'Europe/Budapest';
const ROOT = '/root/nanoclaw-v2';
const FIRE_NOW = process.argv.includes('--now');

initDb(path.join(ROOT, 'data/v2.db'));
getDb().pragma('busy_timeout = 5000');

const LEDGER_CRON = '0 7,11,15,20 * * *'; // day 07/11/15/20 = 4×/day
const TALLY_CRON = '30 8,16,21 * * *'; // 08:30/16:30/21:30 = 3×/day
const FORM_CRON = '30 10,17,22 * * *'; // 10:30/17:30/22:30 = 3×/day

const LEDGER_PROMPT = [
  'Új futás. Te vagy Ledger, egy autonóm termék-csapat vezetője; a csapat egy BELSŐ pénzügyi menedzsment-appot épít Tomi saját cégeinek (QuickBooks-alternatíva, jobb UX/UI + saját integrációk). A terméket a `project.md` + `product/brief.md` definiálja — a session elején OLVASD el; ne feltételezz semmit fejből.',
  '',
  'INTERJÚ-ELŐSZÖR: belső eszköz → ELŐBB értsd meg Tomi valós pénzügyi munkafolyamatait, mit használ ma, mi a QuickBooks-fájdalom, milyen integrációk/riportok kellenek, mely cégek (PietScarlet/Trinken/Lupa/Waikiki) — csak UTÁNA tervezz. NE kódolj a 🔵 Tomi-gate előtt (a terv a termék). BUILD-fázisban a `work` DB + a build-pipeline vezet (METHODOLOGY).',
  '',
  'NE kezdd elölről: olvasd a `LEARNINGS.md` → `project.md` + `product/brief.md` → `product/sprint-log.md`-t, és FOLYTASD a sprint-log ▶ NEXT RUN pointeréből (build-fázisban a `work` DB in-flight taskját RESUME-old a wip_note-ból).',
  '',
  'Naponta többször futsz (nappal-súlyozott: ~07/11/15/20 — az interjú-fázishoz a nappal kell). Döntsd el a legértékesebb lépést MOST és vidd végig mélyen (Boil the Ocean):',
  '  • Ha van nyitott Tomi-input/válasz: építsd be. Ha a NEXT-pointer Tomi-inputot kér (interjú-kérdés / taste-gate / scope-döntés), fókuszáltan kérdezd a boton (`<message to="tomi">`, magyarul). Csoportosított, kevés kérdés — ne pazarold az idejét.',
  '  • Tally (pénzügy-domain + integrációk) és Form (design/UX) SAJÁT cronon dolgoznak és A2A-n jelentenek (`<message to="ledger">`). Olvasd a digestjeiket, kérd amire szükséged van (`<message to="tally">` / `<message to="form">`, SOHA ack), és integráld a `product/` deliverable-jeibe. Te vagy a hub: ők beszállítanak, te döntesz és írod a tervet.',
  '  • Mindig: a brief konkrét fájdalmait tényleg megoldja a terv? Mi a MAG (a legégetőbb pénzügyi fájdalom, nem feature-lista)? A UI/UX első osztályú deliverable (igényes, a lehető legjobb UX — Tomi elvárása).',
  '',
  'A futás végén KÖTELEZŐ: append a `product/sprint-log.md`-be (+ a ▶ NEXT RUN pointer frissítése; build-fázisban a `work` DB task-státusz is). Tominak NAPONTA ~1× írj (az esti ~20:00 futás, vagy ha van érdemi sztori) — Csináltam / Gondoltam / Holnap. NE minden futásból spamelj.',
  '',
  'A fázis-szabályok a `CLAUDE.local.md`-ben: a két fázis + a KEMÉNY FAL (termék-kód CSAK a 🔵 Tomi-gate után, amikor a kulcs-deliverable-ök készen vannak ÉS önkritikán/red-team-en átestek) + a döntési autoritás. Ha kész → kérd a gate-et strukturált üzenetben.',
].join('\n');

const TALLY_PROMPT = [
  'Hírszerző/domain futás. Te vagy Tally, a BELSŐ pénzügyi app csapatának pénzügy-domain + integrációk specialistája — a terméket a `project.md` definiálja (a session elején OLVASD el). SAJÁT CRONON futsz (~08:30/16:30/21:30); a dolgod: a fejlesztéssel PÁRHUZAMOSAN, FOLYAMATOSAN építeni a tartós domain-ADATBÁZIST (NEM md/json — lásd `CLAUDE.local.md` + METHODOLOGY §13).',
  '',
  'NE kezdd elölről: olvasd a `LEARNINGS.md` → `project.md` → `bun domain/domain.ts stats` (mi van a DB-ben), és FOLYTASD. Egy futás = 1-2 terület ÉRDEMI mélyítése: a magyar könyvelési/adózási domain (kettős könyvelés, ÁFA-szabályok, számlatükör), a kötelező integrációk (NAV Online Számla API, banki kivonat-import CAMT/CSV, esetleg bér/adó), és a valós cég-adatfolyamok feltérképezése (melyik cég pénzügyi adata hol él, milyen hozzáférés kell). Valós kutatással (`WebSearch`/`WebFetch`, `/deep-research`), majd a DB bővítése a CLI-vel (`domain integration|rule|source|account|recon|question add …`). Minden tényhez forrás (`source add`).',
  '',
  'A futás végén KÖTELEZŐ: egy TÖMÖR digest Ledgernek (`<message to="ledger">`, magyarul: mit találtál, mi releváns a tervhez/integrációhoz, mi a következő — `domain stats`-szal). A2A hard rule: konkrét tartalom, SOHA ack. Nincs saját botod — Ledgernek jelentesz, ő tálal Tominak. Ha külső erőforrás kell (NAV-cred / bank-export / repo / cég-email-hozzáférés) → jelezd Ledgernek (METHODOLOGY §15).',
  '',
  'Hetente egyszer: `domain maintain` (dedup/smell) + szemét-irtás (§14). A nyitott, Tomihoz/Ledgerhez szóló kérdéseket az `open_questions` táblába gyűjtsd, ne pörögj üresen.',
].join('\n');

const FORM_PROMPT = [
  'Design/UX futás. Te vagy Form, a BELSŐ pénzügyi app csapatának design + UX specialistája — a terméket a `project.md` definiálja (a session elején OLVASD el). SAJÁT CRONON futsz (~10:30/17:30/22:30); a dolgod: a design-rendszer + a UX-flow-k tulajdonosaként FOLYAMATOSAN építeni a termék vizuális/interakciós minőségét, az „igényes UI, a lehető legjobb UX, segítség nem admin-teher" észak-csillagra (METHODOLOGY §3, anti-slop).',
  '',
  'NE kezdd elölről: olvasd a `LEARNINGS.md` → `project.md` → `bun design/design.ts stats`, és FOLYTASD. Egy futás = a design-rendszer (tipográfia, szín, spacing, komponens-állapotok: empty/loading/error/populated), a kulcs-UX-flow-k (számlázás, kiadás-rögzítés, bank-reconciliation, riport-áttekintés) érdemi mélyítése. A komponens-inventárt + a UX-findingokat a `design` DB-be (`design component|finding|flow add …`); a prózai design-deliverable-öket (DESIGN-SYSTEM.md, UX-SPEC-*.md) draftold és add át Ledgernek (ő integrálja a `product/`-ba).',
  '',
  'Pénzügyi app = bizalom pixel-szinten, valós pénzadatok. Edge-state-paranoia (üres állapot mint feature, hibaállapot, 47 karakteres cégnév, nulla tranzakció). Ne AI-slop generikus dashboard — craft.',
  '',
  'A futás végén KÖTELEZŐ: egy TÖMÖR digest Ledgernek (`<message to="ledger">`, magyarul: mit terveztél, mi releváns, mi a következő — `design stats`-szal). A2A hard rule: konkrét tartalom, SOHA ack. Nincs saját botod — Ledgernek jelentesz. A build-fázisban: a kész UI-t dogfood/ux-critic szemmel kritizáld, a findingokat a `design` DB-be + Ledgernek.',
].join('\n');

interface AgentCron {
  agentId: string;
  messagingGroupId: string | null;
  seriesId: string;
  cron: string;
  prompt: string;
}

// Ledger's session is keyed to its DM messaging group so the router reuses it on Tomi's first
// message. Tally/Form have no messaging group (A2A-only) → messaging_group_id NULL, like Drift.
const ledgerMg = getDb()
  .prepare("SELECT id FROM messaging_groups WHERE channel_type='telegram-ledger' AND platform_id='telegram:1243781160'")
  .get() as { id: string } | undefined;
if (!ledgerMg) {
  console.error('!! No telegram-ledger messaging group — run scripts/wire-ledger-team.ts first.');
  process.exit(1);
}

const AGENTS: AgentCron[] = [
  { agentId: 'ag-ledger', messagingGroupId: ledgerMg.id, seriesId: 'task-ledger-build', cron: LEDGER_CRON, prompt: LEDGER_PROMPT },
  { agentId: 'ag-tally', messagingGroupId: null, seriesId: 'task-tally-domain', cron: TALLY_CRON, prompt: TALLY_PROMPT },
  { agentId: 'ag-form', messagingGroupId: null, seriesId: 'task-form-design', cron: FORM_CRON, prompt: FORM_PROMPT },
];

for (const a of AGENTS) {
  // 1. Ensure the session exists (creates folder + inbound/outbound DBs if missing).
  const { session, created } = resolveSession(a.agentId, a.messagingGroupId, null, 'shared');
  console.log(`${a.agentId}: session ${session.id} (${created ? 'CREATED' : 'existing'})`);

  // 2. Upsert the recurring cron row into the session's inbound.db.
  const db = new Database(inboundDbPath(a.agentId, session.id));
  db.pragma('busy_timeout = 5000');
  const content = JSON.stringify({ prompt: a.prompt, script: null });
  const now = new Date().toISOString();
  const nextCron = CronExpressionParser.parse(a.cron, { tz: TZ }).next().toISOString();
  const firstRun = FIRE_NOW ? now : nextCron;

  const upd = db.prepare(
    `UPDATE messages_in SET content=@content, recurrence=@recurrence WHERE series_id=@seriesId AND status='pending'`,
  );
  const u = upd.run({ content, recurrence: a.cron, seriesId: a.seriesId });

  let inserted = 0;
  if (u.changes === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO messages_in
        (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
      VALUES
        (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
    `);
    inserted = insert.run({
      id: a.seriesId,
      timestamp: now,
      processAfter: firstRun,
      recurrence: a.cron,
      seriesId: a.seriesId,
      content,
    }).changes;
  }
  console.log(`  cron=${a.cron} refreshed=${u.changes} inserted=${inserted} first=${firstRun}${FIRE_NOW ? ' (NOW)' : ''}`);
  db.close();
}

console.log('\n✅ Ledger trió kadencia beállítva.');
