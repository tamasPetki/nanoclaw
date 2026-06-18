/**
 * Design-mode daily cron for Axiom (ag-shift-lead): construction-management topic.
 * Run AFTER the session exists. After the Tomi-gate, swap to build-mode.
 *
 * Usage: pnpm exec tsx scripts/schedule-axiom-design.ts
 */
import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
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
  'Reggel van. Te vezeted az építőipari KKV menedzsment-app TERVEZÉSÉT. Most a DESIGN SPRINT megy — NE kódolj, a terv a termék.',
  '',
  'Olvasd a `product/sprint-log.md`-t (hol tartasz). Döntsd el a legértékesebb tervezési lépést, vidd végig mélyen.',
  '',
  '  • Ha még nincs meg a Tomi-interjú + a Drive-elemzés (`DISCOVERY.md`): AZ az első — kérdezd Tomit a boton, fókuszáltan (ő a user + domain-expert). Kérd a Drive-mappát, ha még nincs.',
  '  • Melyik deliverable a leggyengébb most — mélyítsd. Drift versenytárs-reconja (Procore/iBuild/HU) beépült-e?',
  '  • A red-team flagelt-e Procore-klónt vagy „egy KKV-nak túl-komplexet"?',
  '  • A 9 konkrét fájdalmat (brief) tényleg megoldja a terv — vagy feature-eket halmoz? Mi a MAG (egy projekt, terv-vs-tény költség + a leghúzósabb pain)?',
  '',
  'A run végén KÖTELEZŐ: append a `product/sprint-log.md`-be + summary Tominak (`<message to="tomi">`, magyarul: Csináltam / Gondoltam / Holnap).',
  '',
  'Ha a kulcs-deliverable-ök (VISION, ARCHITECTURE, ROADMAP) készen vannak ÉS red-team/pre-mortem-en átestek → kérd a 🔵 Tomi-gate-et egy strukturált üzenetben. NE kezdj termék-kódot a gate előtt — az a kemény fal.',
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
    (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
`);
const now = new Date().toISOString();
const cron = '0 9 * * *';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-construction-design-daily';
const content = JSON.stringify({ prompt: PROMPT, script: null });

const result = insert.run({ id, timestamp: now, processAfter: next, recurrence: cron, seriesId: id, content });
const upd = db.prepare(`UPDATE messages_in SET content=@content WHERE kind='task' AND recurrence=@recurrence AND status='pending'`);
const u = upd.run({ content, recurrence: cron });
console.log(`Inserted ${id} cron=${cron} next=${next} changes=${result.changes}; refreshed ${u.changes} pending`);
db.close();
