import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const HUB_DB_PATH = '/root/nanoclaw-v2/data/v2-sessions/ag-hub/sess-1778077155679-2tf6v0/inbound.db';

const TG_PLATFORM = 'telegram:1243781160';

const emailPrompt = [
  'Reggeli email-check 3 fiókra (pietscarlet, lupaobol, trinkenessen). A pre-filter script lefutott (`script` mező), a `data` mezőben kapod fiókonként a header listát.',
  '',
  'Lépések:',
  '1. Ha egy fióknál `error` van → rövid Telegram-üzenet Tominak a hibával, tovább.',
  '2. Sikeres fióknál (`new_count > 0`) húzd le a body-kat: `fetch_emails` MCP tool, fallback `bash /workspace/agent/email-fetch-bodies.py <account> <uid1,uid2,...>` (raw IMAP).',
  '',
  '3. ⚠️ NINCS TÖBBÉ KÁRTYA / ask_user_question az email-válaszokhoz. (A blokkoló kártya mire Tomi a Telegramhoz ült, timeoutolt — Tomi 2026-06-01 kivetette.) Helyette:',
  '',
  '   **pietscarlet — válasz-igénylő emailhez DRAFT-ot írsz a Piszkozatokba.** Tomi a levelezőkliensében megnézi, szerkeszti, és Ő küldi -- te SOHA nem küldesz emailt magadtól, te csak draftolsz.',
  '   a) Fogalmazd meg a TELJES választ HTML-ben, a HELYES sablonnal: köszönés ("Szia <Név>! 😊"), érdemi tartalom, záró ("Köszönöm szépen! Szép napot!"), majd a teljes PietScarlet HTML-aláírás. A tartalmi tilalmak (NINCS "Tomi kérésére továbbítom", NINCS utasítás a partnernek, html kötelező): `email-assistant` SKILL.md pre-send checklist + a hub CLAUDE.local.md Erika-szabálya. Olvasd vissza MIELŐTT draftolsz.',
  '   b) Írd a HTML body-t egy fájlba (pl. `/tmp/draft-<uid>.html`), majd:',
  '      `python3 /workspace/agent/email-save-draft.py pietscarlet "<címzett email>" "Re: <eredeti tárgy>" /tmp/draft-<uid>.html "<eredeti Message-ID ha válasz>"`',
  '   c) A script a `INBOX.Drafts`-ba teszi `\\Draft` flaggel → megjelenik Tomi kliensében a Piszkozatokban. Verify: a script `status=OK`-t ír.',
  '',
  '   **lupaobol / trinkenessen — egyelőre CSAK summary.** A draft-flow most pietscarleten teszt alatt (Tomi 2026-06-01). Ezeknél NE írj draftot, NE küldj emailt -- csak a summaryban listázd a válasz-igénylő itemeket, Tomi manuálisan intézi a levelezőjében.',
  '',
  '4. Telegram summary (sima Markdown szöveg, NEM card, NEM blokkoló): fiókonként mi jött (db, prio). A pietscarletnél jelezd melyik emailhez tettél draftot ("X-hez és Y-hoz draftot tettem a pietscarlet Piszkozatokba -- nézd meg és küldd"). A lupaobol/trinkenessen válasz-igénylő itemeit is listázd, hogy Tomi tudjon róluk.',
  '5. Napló: append `wiki/log.md` `## [YYYY-MM-DD HH:MM] email-check | <fiók>: N új | <draftok / kérdéses items>`.',
  '6. Ha SEHOL nincs új levél → ne küldj summary-t (csak naplózd).',
  '',
  'Pre-filter JSON (`data` mező): `accounts.{key}.new_count`, `.headers` ([{uid, from, subject, date}]), `.error`.',
].join('\n');

const tasks: Array<{ id: string; seriesId: string; cron: string; prompt: string; script?: string }> = [
  {
    id: 'task-hub-email-check',
    seriesId: 'task-hub-email-check',
    cron: '0 8 * * 1-5',
    prompt: emailPrompt,
    script: 'source /workspace/agent/.secrets && python3 /workspace/agent/email-prefilter.py',
  },
];

const hubDb = new Database(HUB_DB_PATH);

const insert = hubDb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, @recurrence, @seriesId, 0, 1, @platformId, 'telegram', NULL, @content)
`);

const now = new Date().toISOString();
for (const t of tasks) {
  const next = CronExpressionParser.parse(t.cron, { tz: TZ }).next().toISOString();
  const content = JSON.stringify({ prompt: t.prompt, script: t.script ?? null });
  insert.run({
    id: t.id,
    timestamp: now,
    processAfter: next,
    recurrence: t.cron,
    seriesId: t.seriesId,
    platformId: TG_PLATFORM,
    content,
  });
  // Idempotent refresh: update the already-pending recurring occurrence with the new prompt.
  const u = hubDb
    .prepare(`UPDATE messages_in SET content = @content WHERE kind='task' AND recurrence = @recurrence AND status='pending'`)
    .run({ content, recurrence: t.cron });
  console.log(`Inserted ${t.id} cron=${t.cron} next=${next}; refreshed ${u.changes} pending occurrence(s)`);
}

// Cancel old asszisztens task
const ASZ_DB = '/root/nanoclaw-v2/data/v2-sessions/ag-asszisztens/sess-1776690352106-3jmbu9/inbound.db';
const asz = new Database(ASZ_DB);
const r = asz
  .prepare(`UPDATE messages_in SET status='completed', recurrence=NULL WHERE kind='task' AND status='pending'`)
  .run();
console.log(`Cancelled ${r.changes} asszisztens tasks`);
asz.close();

hubDb.close();
