import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';
const dir = `/root/nanoclaw-v2/data/v2-sessions/${GROUP_ID}`;
const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
const sdbPath = path.join(dir, ses[0], 'inbound.db');

const prompt = `Cloudflare Email Routing retest — Tomi confirmált:
1) Destination address verified ✅
2) Custom address rule létrehozva ✅ (hex@headlesstracker.dev → hex.headlesstracker@gmail.com)

KÉRLEK csendben (NE pusholj Tominak semmit) ezt csináld meg:

1. Küldj egy email-t MAGADNAK \`mcp__hex-email__send_email\`-lel:
   - to: hex@headlesstracker.dev
   - subject: "Hex routing retest"
   - body: "second smoke test after Tomi's verify-click"

2. Várj ~30-60 mp-et (a Cloudflare Email Routing latency).

3. Pollold az inboxot \`mcp__hex-email__list_emails\` — látod-e az új "Hex routing retest" tárgyú emailt? (Esetleg az 1. unsuccessful smoke testtől is bounce-message — azt is jelezd ha jött.)

4. Küldj egy rövid riportot: \`[worker:tracker] phase=email-verify-retry result=<ok|partial|fail> details=<egy mondat — ok=teljes flow él, partial=SMTP megy de routing még nem, fail=valami más szakadt>\`

Standby utána. Tomi készülődik más feladattal párhuzamosan.`;

const db = new Database(sdbPath);
db.prepare(`
  INSERT INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, NULL, NULL, 0, 1, NULL, NULL, NULL, @content)
`).run({
  id: 'task-hex-email-retest-' + Date.now(),
  timestamp: new Date().toISOString(),
  processAfter: new Date().toISOString(),
  content: JSON.stringify({ prompt, script: null }),
});
console.log('Inserted retest task');
db.close();
