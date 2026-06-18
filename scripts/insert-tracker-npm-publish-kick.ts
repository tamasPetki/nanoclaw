import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const TEXT = [
  'Tomi a hub-on át kéri: az NPM_TOKEN ÉLES! Beállítva GitHub Actions secretként (az imént ellenőriztem a Tomi-féle host flow-ban), és a `headlesshex` user (új npm account) fogja publish-elni a `headless-tracker` package-et.',
  '',
  'Kérlek MOST shippeld az első release-t (NE várj a holnap reggeli daily cron-ra). Lépések:',
  '',
  '1. **Verify**: `cd /workspace/agent/headlesstracker/repo && git pull && git log --oneline -5` — friss állapot.',
  '2. **Decide version**: a package.json verzió `0.13.2`. Ez build-in-public szempontból érdekes: open-source release de még nem publikált. Két opció — (a) bump-old `v1.0.0`-ra ha érzed a "first npm release as Hex" milestonet, (b) maradj `v0.13.2`-n ha hűebbnek érzed a kontinuitáshoz. Te döntöd, append decisions.md-be a rationale-t.',
  '3. **Tag + push**: `git tag v<verzió>` és `git push origin v<verzió>`. Ez triggereli a `.github/workflows/publish.yml`-t: bun install + tsc + test + `npm publish --provenance --access public`.',
  '4. **Monitor CI**: ~3-4 perc. Ha sikeres → `npm view headless-tracker` mutatja a verziót. Ha fail → debug és resolve, NE pushold lol-os tag-eket egymás után (cluttered git history).',
  '5. **X poszt** ha sikeres: build-in-public arc — pl. *"shipped v1.0.0 of headless-tracker to npm — TypeScript MCP server for crypto portfolio data. install: npm i headless-tracker. <link to npm>"*. Engineering-candor, NEM excited-blurb.',
  '6. **Daily-log append**: külön bekezdés a mai dátum alá ("Update later in the day" jelzéssel), 3 mondat.',
  '7. **Daily summary update Tomi-felé**: `[reflect:tracker] step=npm-publish` formával — mit shippeltél (npm-link), mit gondoltál (verzió-választás rationale), holnap mit (landing page indul).',
  '',
  'A NPM_TOKEN egy session-token (kb 1 év TTL), ha lejár majd CI fail-elni fog auth-401-en — akkor szólj a hubnak `[reflect:tracker] finding | kind=blocker | npm-token-expired`. NEM kritikus most.',
  '',
  'A csomag az npm-org-hoz hozzáadás (Tomi munka) az első publish UTÁN lehetséges — NE foglalkozz vele te.',
  '',
  'Hajrá.',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) { console.error('no session'); process.exit(1); }

const db = new Database(sdbPath);
const now = new Date().toISOString();
const id = `kick-npm-publish-${Date.now()}`;

const insert = db.prepare(`
  INSERT INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content, source_session_id, on_wake)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'chat', @timestamp, 'pending', NULL, NULL, NULL, 0, 1, NULL, NULL, NULL, @content, NULL, 0)
`);

const result = insert.run({
  id,
  timestamp: now,
  content: JSON.stringify({
    text: TEXT,
    sender: 'Tomi (via hub)',
    senderId: 'host-kick',
  }),
});

console.log(`Inserted ${id}: changes=${result.changes}`);
db.close();
