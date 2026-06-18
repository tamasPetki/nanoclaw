/**
 * Pause the shift-* agents: delete pending/processing messages (the A2A ping-pong)
 * and the recurring design cron from both inbound.dbs, so the containers don't
 * respawn after they're killed. Idempotent. The product/*.md work stays on disk.
 *
 * Usage: pnpm exec tsx scripts/pause-shift.ts
 */
import Database from 'better-sqlite3';
import fs from 'fs';

for (const g of ['ag-shift-lead', 'ag-shift-growth']) {
  const dir = `/root/nanoclaw-v2/data/v2-sessions/${g}`;
  if (!fs.existsSync(dir)) continue;
  for (const s of fs.readdirSync(dir).filter((x) => x.startsWith('sess-'))) {
    const p = `${dir}/${s}/inbound.db`;
    if (!fs.existsSync(p)) continue;
    const db = new Database(p);
    db.pragma('busy_timeout = 5000');
    const r = db
      .prepare("DELETE FROM messages_in WHERE status IN ('pending','processing') OR recurrence IS NOT NULL")
      .run();
    console.log(`${g}/${s}: deleted ${r.changes} pending/processing/recurring`);
    db.close();
  }
}
console.log('paused.');
