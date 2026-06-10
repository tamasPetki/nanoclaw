/**
 * Hub session inbound.db-be insert egy projekt-ingest task-ot.
 * A hub a következő spawn-nál (ha most fut, a következő poll-ciklusban) elindul.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

function findHubSessionDb(): string {
  const dir = '/root/nanoclaw-v2/data/v2-sessions/ag-hub';
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return path.join(dir, ses[0], 'inbound.db');
}

const HUB_DB = findHubSessionDb();
const TG_PLATFORM = 'telegram:1243781160';

const prompt = [
  'Folytasd az ingest-et. Sorrendben dolgozd fel a 6 céges projekt forrást a `sources/`-ből és hozz létre wiki page-eket:',
  '',
  '1. **pietscarlet** → `wiki/projects/pietscarlet/summary.md` (cég-szintű ernyő, az alá-projektek külön oldalakon).',
  '   Sources: persona.md, email-check-workflow.md, known-scam-patterns.md',
  '',
  '2. **gorgey32** → `wiki/projects/gorgey32/summary.md` (Vác Görgey 32 társasház).',
  '   Sources: persona.md, alvallalkozok.md, redony_megallapodas.md, status.md',
  '',
  '3. **csobanka** → `wiki/projects/csobanka/summary.md` (Csobánka Kilátó utca).',
  '   Sources: persona.md, context.md',
  '',
  '4. **torokhegyi** → `wiki/projects/torokhegyi/summary.md` (Felső Törökhegy telkek).',
  '   Sources: persona.md, context.md',
  '',
  '5. **lupaobol** → `wiki/projects/lupaobol/summary.md` (Lupa Öböl Kft. beachbar).',
  '   Sources: persona.md, email-check-workflow.md, projekt-allapot.md',
  '',
  '6. **trinkenessen** → `wiki/projects/trinkenessen/summary.md` (Trinken Essen Kft. vendéglátás).',
  '   Sources: persona.md, email-check-workflow.md',
  '',
  'Karpathy-disciplina (módosított, batch-mode Tomi-jóváhagyásával):',
  '- **Projektenként sorban**: olvass minden source-fájlt → írd meg a summary.md-t (frontmatter + szekciók: jelenlegi fázis, kulcs-szereplők, határidők/blokkolók, költség/szerződés, kockázatok)',
  '- **Frontmatter**: type:project, tags: [<projekt-slug>, projekt], created/updated: today',
  '- **Plusz entity-pages**: ha egy szereplő több projektben szerepel (pl. Erika a könyvelő), `wiki/entities/<slug>.md` page is jöjjön létre kereszthivatkozással',
  '- **`wiki/log.md` append minden projekt után** egy sorral: `## [YYYY-MM-DD HH:MM] ingest | projects/<projekt>/summary.md | <1 mondat takeaway>`',
  '- **Ne kérdezz Tomit minden projekt után** — csak ha valami contradicting / uncertain (akkor `mcp__nanoclaw__ask_user_question`)',
  '- **Végén ÖSSZEFOGLALÓ card** Tomi-nak Telegramra: 6 új projekt-page, kulcs-takeaway-ek',
  '',
  'Időkeret: kb. 15-25 perc. Ha közben heartbeat-ceiling kill történne, a következő spawn folytatja a megmaradt projektekkel (a wiki-ben látszik mi van kész).',
].join('\n');

const wdb = new Database(HUB_DB);
const insert = wdb.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (?, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', ?, 'pending', 0, 1, ?, 'telegram', NULL, ?)
`);
const id = `task-project-ingest-${Date.now()}`;
const result = insert.run(id, new Date().toISOString(), TG_PLATFORM, JSON.stringify({ prompt, script: null }));
console.log(`Inserted ${id} (changes=${result.changes})`);
wdb.close();
