import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// One-shot reminder: wake Hex on 2026-08-25 ~09:00 CEST to rotate the GitHub
// PAT before it expires (2026-09-01 13:02 UTC). Hex flags Tomi on its bot.
// Non-recurring: process_after set, recurrence NULL → fires once.

const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';

function findSessionDb(agentId: string): string | null {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${agentId}`;
  if (!fs.existsSync(dir)) return null;
  const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
  return ses.length ? path.join(dir, ses[0], 'inbound.db') : null;
}

const PROMPT = [
  '🔑 Token-rotálás emlékeztető (egyszeri).',
  '',
  'A GitHub PAT-od (`$GH_TOKEN`, classic `repo`+`workflow`) **2026-09-01 13:02 UTC**-n lejár — kb. egy hét múlva.',
  '',
  'Tedd meg:',
  '  1. Ellenőrizd a pontos hátralévő időt:',
  '     source /workspace/agent/.secrets',
  '     NO_PROXY="api.github.com" HTTPS_PROXY="" HTTP_PROXY="" curl -sI -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user | grep -i token-expiration',
  '  2. Szólj Tominak a botodon (`<message to="tomi">`): generáljon új classic PAT-ot **`repo` + `workflow`** scope-pal (github.com/settings/tokens), és illessze be — a host oldali csere a `groups/tracker/.secrets` (GH_TOKEN+GITHUB_TOKEN) és a `repo/.git/config` remote URL frissítése, majd a régi revoke. Ez Tomi-feladat (credential), te csak emlékeztetsz + ellenőrzöl.',
  '',
  'Ne posztolj erről X-re/sehova — belső credential-ügy (operational secrecy).',
].join('\n');

const sdbPath = findSessionDb(GROUP_ID);
if (!sdbPath) {
  console.error(`No session for ${GROUP_ID} — wake Hex first, then re-run.`);
  process.exit(1);
}

const db = new Database(sdbPath);
const id = 'task-tracker-gh-token-rotate-2026-08-25';
const processAfter = '2026-08-25T07:00:00.000Z'; // 09:00 Europe/Budapest (CEST, UTC+2)
const content = JSON.stringify({ prompt: PROMPT, script: null });

const insert = db.prepare(`
  INSERT OR IGNORE INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @ts, 'pending', @pa, NULL, @id, 0, 1, NULL, NULL, NULL, @content)
`);

const r = insert.run({ id, ts: new Date().toISOString(), pa: processAfter, content });
console.log(`Inserted one-shot ${id} fires=${processAfter} changes=${r.changes}`);
db.close();
