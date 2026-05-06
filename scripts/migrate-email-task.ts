import { CronExpressionParser } from 'cron-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TZ = 'Europe/Budapest';
const HUB_DB_PATH = '/root/nanoclaw-v2/data/v2-sessions/ag-hub/sess-1778077155679-2tf6v0/inbound.db';

const TG_PLATFORM = 'telegram:1243781160';

const emailPrompt = [
  'Reggeli email-check minden 3 fiókra (pietscarlet, lupaobol, trinkenessen). A pre-filter script lefutott (`script` mező), a `data` mezőben kapod fiókonként a header listát.',
  '',
  'Lépések:',
  '1. Ha bármelyik fióknál `error` van → küldj rövid Telegram-üzenetet Tominak a hibával, haladj tovább.',
  '2. Sikeres fiókoknál (`new_count > 0`) az MCP-szerverek (`email-pietscarlet`, `email-lupaobol`, `email-trinkenessen`) használatával húzd le a body-kat (`fetch_emails` tool). Fallback: `bash /workspace/agent/email-fetch-bodies.py <account> <uid1,uid2,...>` (raw IMAP, ha az MCP elérhetetlen).',
  '3. Tomi felé prezentáció:',
  '   - **Rövid summary** Telegram-markdown-üzenetben: mi jött (fiók, db, prio).',
  '   - **Döntést igénylő itemekhez** ask_user_question card sorban (high → med → low). Title rövid, question 1-2 mondat, options minimum 3 (Igen/Várj/Mégsem vagy akció-szabott). 300s blokkolás.',
  '   - "Küldd": fogalmazd meg a választ és küldd ki a megfelelő email-MCP-vel (`send_email`). Visszaigazolás: Message-ID.',
  '   - "Edit": kérdezd Tomit szövegesen, új card az új drafttal.',
  '   - "Skip": csak naplózd, tovább.',
  '4. Az új levelek summary-ja és az elvégzett akciók: append a `wiki/log.md`-be `## [YYYY-MM-DD HH:MM] email-check | <fiók>: N új | <kérdéses items>`.',
  '5. Ha SEHOL nincs új levél → ne küldj summary-t (csak naplózd).',
  '',
  'Pre-filter JSON struktúra (`data` mezőben):',
  '- `accounts.{key}.new_count`, `accounts.{key}.headers` ([{uid, from, subject, date}]), `accounts.{key}.error`.',
  '',
  'Memória: card_ux szabályok (1-click approval), verify_agent_work (kérj evidenciát ne csak ✅), todoist_check.',
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
  insert.run({
    id: t.id,
    timestamp: now,
    processAfter: next,
    recurrence: t.cron,
    seriesId: t.seriesId,
    platformId: TG_PLATFORM,
    content: JSON.stringify({ prompt: t.prompt, script: t.script ?? null }),
  });
  console.log(`Inserted ${t.id} cron=${t.cron} next=${next}`);
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
