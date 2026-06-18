import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const GROUP_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';
const dir = `/root/nanoclaw-v2/data/v2-sessions/${GROUP_ID}`;
const ses = fs.readdirSync(dir).filter((s) => s.startsWith('sess-'));
if (!ses.length) { console.error('No session yet'); process.exit(1); }
const sdbPath = path.join(dir, ses[0], 'inbound.db');

const prompt = fs.readFileSync('/tmp/hex-kickoff.txt', 'utf8');
const db = new Database(sdbPath);
const insert = db.prepare(`
  INSERT INTO messages_in
    (id, seq, kind, timestamp, status, process_after, recurrence, series_id, tries, trigger, platform_id, channel_type, thread_id, content)
  VALUES
    (@id, (SELECT COALESCE(MAX(seq),0)+2 FROM messages_in), 'task', @timestamp, 'pending', @processAfter, NULL, NULL, 0, 1, NULL, NULL, NULL, @content)
`);
const now = new Date().toISOString();
insert.run({
  id: 'task-hex-kickoff-2026-05-27',
  timestamp: now,
  processAfter: now,
  content: JSON.stringify({ prompt, script: null }),
});
console.log('Inserted kickoff task into', sdbPath);
db.close();
