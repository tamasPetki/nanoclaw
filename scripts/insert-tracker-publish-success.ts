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
  '🎉 PUBLISH SIKERES! `headless-tracker@1.0.0` ÉLŐ az npm-en.',
  '',
  'URL: https://www.npmjs.com/package/headless-tracker',
  'Maintainer: headlesshex',
  'Published: 2026-05-28T09:22:13Z',
  '',
  'Mi történt a háttérben (host-szintű flow, hogy értsd):',
  '- Az első workflow-run 403-mat kapott (2FA-bypass jog hiányzott a tokenen)',
  '- Tomi az npm UI-n logoutolt, belépett a `headlesshex` accountba, generált egy Classic Automation tokent (`headless-tracker-ci` nevű, bypass_2fa=true, all-packages scope, 3 hónap TTL)',
  '- Én cseréltem a GitHub Actions NPM_TOKEN secret-et és re-trigger-eltem a workflow-t (`runs/26565054070/rerun-failed-jobs`)',
  '- A 3. run-attempt sikerült: bun test zöld, npm publish provenance-szel kiment',
  '',
  'Most KÉRLEK fejezd be a flow-t:',
  '',
  '1. **Verify**: `npm view headless-tracker` mutatja a v1.0.0-t (vagy curl `https://registry.npmjs.org/headless-tracker`). Saját szemmel látva confirmáld.',
  '2. **X poszt** — engineering-candor, NEM excited-blurb. Pl.: *"shipped headless-tracker v1.0.0 to npm — TypeScript MCP server, query crypto positions across 5 connectors (Bybit/Binance/MetaMask/Solana/Polymarket). install: npm i headless-tracker. <link>"*. SOHA NEM "Excited to announce" formával.',
  '3. **README badge**: érdemes egy `[![npm version](https://img.shields.io/npm/v/headless-tracker.svg)](https://www.npmjs.com/package/headless-tracker)` badge a README tetejére a meglévő Hex-badge mellé. Külön PR vagy bundle-eld a holnapi landing-page-PR-be — te döntöd.',
  '4. **decisions.md append**: jegyezd fel a v1.0.0 release-t mint major milestone — miért v1.0.0 és nem v0.13.2 (a build-in-public-narratíva miatt vagy más okból, ahogy érveltél).',
  '5. **daily-log.md append**: külön "Update later in the day" bekezdés a mai dátum alá, 3 mondat.',
  '6. **Daily summary update Tomi-felé**: `[reflect:tracker] step=npm-publish-success` formával — npm-link + verzió-rationale + mit Tomi-nak kell még csinálnia (lásd lent).',
  '',
  'TOMI-FELADAT (ne te csináld, csak jelezd a summary-ben):',
  '- A `bulltrapp` npm org-hoz "Add package" gombbal hozzáadhatja a `headless-tracker`-t most már (a publish lement, a package létezik). NEM sürgős, csak ha Tomi egységes org-arc-ot akar.',
  '',
  'A NPM_TOKEN expiry: 2026-08-26 (3 hónap). Ha lejár előtte, jelezd `[reflect:tracker] finding | kind=blocker | npm-token-expired`.',
  '',
  'Hajrá — most a jó hír kell, hogy menjen Tomi-Telegramra.',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) { console.error('no session'); process.exit(1); }

const db = new Database(sdbPath);
const now = new Date().toISOString();
const id = `kick-publish-success-${Date.now()}`;

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
