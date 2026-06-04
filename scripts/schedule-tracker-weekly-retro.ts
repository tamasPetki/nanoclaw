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
  'Vasárnap este — a hét vége. Most nem buildelsz, hanem hátralépsz és founder-fejjel végiggondolod a HeadlessTracker hetét.',
  '',
  'Ez a strategic szint: nem a napok ismétlése, hanem a minták meglátása, amit napról napra nem vesz észre az ember.',
  'A te dolgod eldönteni mi a hét tanulsága és mit jelent a következő hétre — nincs előírt sablon.',
  '',
  'Amin egy tulaj ilyenkor elgondolkodik (vedd amelyik releváns, a forrásaid: daily-log 7 nap, decisions.md, roadmap.md, learning.md, és a számok: GitHub stars/issues/forks, npm DL-trend, X-engagement, Sentry ha van):',
  '  • Hova jutott a termék a héten — tényleg előrébb van, vagy csak mozgás volt mozdulás nélkül?',
  '  • Mi működött és MIÉRT? Mi ragadt be és MIÉRT? A "miért" a lényeg, nem a felsorolás.',
  '  • Megerősített vagy megcáfolt a hét valamilyen feltevést a termékről / userről / piacról?',
  '  • Kell-e stratégiai irányváltás? Ha igen, az nagy döntés — írd le a decisions.md-be a rationale-lel. Ha nem, az is döntés.',
  '  • A roadmap még a helyes irányt mutatja? Frissítsd ha a hét mást tanított (de csak valódi okkal, ne hetente).',
  '',
  'Heti longer-form (a build-in-public lényege, ha van miről):',
  '  • Egy mélyebb publikáció: X-thread, Bluesky longer post, VAGY dev.to/hashnode blogposzt — te döntöd el a formátumot.',
  '  • Ha X-thread: NE a "Week N -- here is what I shipped" changelog-sablon (az unalmas). Helyette egy igazi sztori a hétből:',
  '    a legviccesebb/legfájdalmasabb pillanat mint hook, a döntés amin agyaltál, amit elszúrtál és mit tanultál belőle,',
  '    hova tartasz -- és nyugodtan kérdezz az olvasóktól. Engedd be őket a fejedbe. Lásd CLAUDE.local.md "X / build-in-public hang".',
  '  • A hibák, kompromisszumok, a gondolkodás a value -- ne marketing-blurb. Ha tényleg üres a hét, ne forszírozd.',
  '  • Compliance: "Not financial advice" (lásd CLAUDE.local.md).',
  '',
  'A nap végén KÖTELEZŐ:',
  '  • `headlesstracker/daily-log.md` — külön retro-bejegyzés: `## YYYY-MM-DD (vasárnap) — weekly retro` (hét összefoglaló + key learning + jövő hét).',
  '  • Weekly summary a hubnak:',
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
db.pragma('busy_timeout = 5000'); // inbound.db is host-owned; wait out the host's write lock

const insert = db.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT CASE WHEN COALESCE(MAX(seq),0) < 2 THEN 2 ELSE COALESCE(MAX(seq),0) + 2 - (COALESCE(MAX(seq),0) % 2) END FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, NULL, NULL, NULL, @content)
`);

const now = new Date().toISOString();
const cron = '0 18 * * 0';
const next = CronExpressionParser.parse(cron, { tz: TZ }).next().toISOString();
const id = 'task-tracker-weekly-retro';

const content = JSON.stringify({ prompt: PROMPT, script: null });

const result = insert.run({
  id,
  timestamp: now,
  processAfter: next,
  recurrence: cron,
  seriesId: id,
  content,
});

// Idempotent refresh: update any already-pending recurring occurrence with the new prompt.
const upd = db.prepare(
  `UPDATE messages_in SET content = @content WHERE kind='task' AND recurrence = @recurrence AND status='pending'`,
);
const u = upd.run({ content, recurrence: cron });

console.log(`Inserted ${id}: changes=${result.changes}, refreshed ${u.changes} pending occurrence(s), next_fire=${next} (CET: ${new Date(next).toLocaleString('hu-HU', { timeZone: TZ })})`);
db.close();
