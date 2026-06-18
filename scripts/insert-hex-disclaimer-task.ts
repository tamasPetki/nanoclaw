import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';
const dir = `/root/nanoclaw-v2/data/v2-sessions/${GROUP_ID}`;
const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
const sdbPath = path.join(dir, ses[0], 'inbound.db');

const prompt = `URGENT compliance ship — Tomi direktíva: a "Not financial advice" disclaimer MOST kerüljön be a repóba, ne várjunk holnapra. Lásd a frissen kapott CLAUDE.local.md új ⚠️ COMPLIANCE szekcióját — olvasd el először.

Csináld meg most az alábbi minimal ship-et (~15 perc):

1. **README.md update** — közvetlenül a Hex maintainer badge ALATT (a build-in-public banner alatt) tegyél egy compact disclaimer-bannert:
\`\`\`
> ⚠️ **Not financial advice.** HeadlessTracker is a portfolio data aggregation tool. For informational purposes only. See [DISCLAIMER.md](DISCLAIMER.md) for full text.
\`\`\`

2. **DISCLAIMER.md** új fájl a repo gyökerében a CLAUDE.local.md-ben szereplő full disclaimer szöveggel.

3. **package.json** description mező frissítése: \`Not financial advice. Portfolio data aggregation MCP server for crypto positions.\` (ha a meglévő description nem kompatibilis, csak prepend-eld a \"Not financial advice. \" stringet az elejére).

4. **decisions.md** új bejegyzés: \`## 2026-05-27 — \"Not financial advice\" compliance policy adopted\` + What/Why/Alternatives/Reversal-trigger struktúrában. Why-ban hivatkozz Tomi direktívájára (regulatory grey-zone-elkerülés).

5. **Branch + PR + self-merge** ha CI zöld:
   - branch: \`compliance/not-financial-advice\`
   - commit message: \`compliance: add 'Not financial advice' disclaimer (README banner, DISCLAIMER.md, package.json, decisions log)\`
   - PR title: \`compliance: 'Not financial advice' policy\`
   - PR body: rövid magyarázat hogy Tomi explicit compliance-direktívája volt
   - Self-merge ha CI zöld

6. **Daily-log.md append** (ma még szerepeljen 2026-05-27 alatt) — második bekezdés:
\`\`\`
Update later in the day — Tomi raised a compliance concern: regardless of how HeadlessTracker evolves, "Not financial advice" must appear everywhere to avoid regulatory grey-zone (SEC/MiFID II/FCA/MNB). Shipped a compliance PR adding the disclaimer to README, a new DISCLAIMER.md, package.json description, and a decisions.md entry codifying the policy. Future content (X posts, blog, MCP tool descriptions) must follow the same "data aggregation, not advice" framing — see CLAUDE.local.md COMPLIANCE section for hard rules.
\`\`\`

7. **Riport a hubnak**: \`[reflect:tracker] step=compliance-ship\` formátumban, magyar, 2-3 mondat — mit shippeltél, link a PR-re. Ezt push-olja Tomi-Telegramra a hub. (Plain push, NEM Phase 4 daily summary — extra event.)

Standby utána a holnap reggeli cron-ig.

NE térj ki más feladatra ebben a session-ben — csak ezt a compliance-shipet és az azt kísérő riportot.`;

const db = new Database(sdbPath);
db.prepare(`
  INSERT INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, NULL, NULL, 0, 1, NULL, NULL, NULL, @content)
`).run({
  id: 'task-hex-disclaimer-ship-' + Date.now(),
  timestamp: new Date().toISOString(),
  processAfter: new Date().toISOString(),
  content: JSON.stringify({ prompt, script: null }),
});
console.log('Inserted disclaimer ship task');
db.close();
