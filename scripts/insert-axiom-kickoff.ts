/**
 * Insert the one-shot kickoff task into Axiom's (ag-shift-lead) session inbound.db.
 * Run AFTER Tomi messages @Tomi_Axiom_bot (which creates a fresh session).
 * Topic: construction-management app. Interview-first Phase 0.
 *
 * Usage: pnpm exec tsx scripts/insert-axiom-kickoff.ts
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const GROUP_ID = 'ag-shift-lead';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
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

const PROMPT = [
  'Szia Axiom! Te vezeted ezt a kísérletet: egy AI-csapat egy VALÓS megrendelő (Tomi) köré tervez/épít egy építőipari KKV menedzsment-appot — kizárólag agentek gondolkodásával.',
  '',
  'ELŐSZÖR olvasd el: `product/brief.md` (a termék-brief Tomi saját szavaiból — a fájdalompontok a lényeg), `CLAUDE.local.md` (a teljes szereped), `product/sprint-log.md`.',
  '',
  '⚠️ A KULCS: Tomi a TE usered és domain-experted. NE ess neki a mély tervezésnek, amíg nem érted a valóságát.',
  '',
  'Phase 0 — INTERJÚ ELŐSZÖR:',
  '  1. Interjúzd Tomit a boton (`<message to="tomi">`): 3-4 FÓKUSZÁLT kérdés a valós helyzetéről, és VÁRD meg a válaszait, aztán mélyíts (ne zúdíts rá 8 kérdést egyszerre). Pl.: milyen építőipart csinál pontosan (lakó/ipari/felújítás)? hány projekt + ember egyszerre? mit használ MA (Excel? papír? WhatsApp?) és mi a legrosszabb benne? hogy néz ki egy projekt elejétől a végéig? melyik fájdalom a legégetőbb, ha egyet oldhatnánk meg elsőre?',
  '  2. Kérd el a Drive-mappát (Tomi megoszt egy valós projektet — tervek, költségvetés, számlák, fájl-struktúra). Ha nincs eszközöd hozzá, KÉRD a boton — az operátor beállítja.',
  '  3. Delegálj Driftnek (`<message to="drift">`) a versenytárs-felmérésre (Procore, Buildertrend, Fieldwire; HU: iBuild + bármi más) — párhuzamosan futhat, nem Tomi-függő.',
  '  4. CSAK az interjú + a Drive után kezdd a mély tervezést: `product/DISCOVERY.md` (az interjú + Drive összegzése), majd PAIN/VISION.',
  '',
  '💡 KÍSÉRLET (gstack): a strukturált termék-átgondoláshoz / a forcing questionökhöz próbáld ki a /office-hours skillt — egy YC-style gondolkodási keret (startup-mód: 6 forcing question a kereslet-valóságról, a status quo-ról, a legszűkebb wedge-ről; a HARD GATE-je "csak design-doc, semmi kód" pont illik a Phase 0-hoz). Tomi szeretné tudni, MŰKÖDIK-E neked az Agent SDK alatt: ha tisztán lefut, használd a Phase 0 gondolkodásához és mondd el a tapasztalatod; ha hibázik vagy zajos (CLI-hívásokat keres, amik nincsenek), az is hasznos visszajelzés — jelezd Tominak röviden mi történt. Ez kísérlet, nem kötelező.',
  '',
  'A run végén: rövid summary Tominak (`<message to="tomi">`, magyarul) + append a `product/sprint-log.md`-be. Az interjú-fázisban a "summary" lehet maga a kérdés-kör Tomihoz. Ha kipróbáltad a /office-hours-t, írd meg Tominak működött-e.',
  '',
  'Hajrá — ez a tiéd. Tomi a partnered: kérdezd bátran, de fókuszáltan, és hallgasd meg, mielőtt tervezel.',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) {
  console.error(`No session for ${GROUP_ID} yet — Tomi must message @Tomi_Axiom_bot first, then re-run.`);
  process.exit(1);
}

const db = new Database(sdbPath);
db.pragma('busy_timeout = 5000');
const insert = db.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, NULL, NULL, 0, 1, NULL, NULL, NULL, @content)
`);
const now = new Date().toISOString();
const r = insert.run({
  id: 'task-construction-kickoff-2026-06-14',
  timestamp: now,
  processAfter: now,
  content: JSON.stringify({ prompt: PROMPT, script: null }),
});
console.log(`Inserted kickoff into ${sdbPath} (changes=${r.changes})`);
db.close();
