/**
 * Tear down the inert mailroom-* agent groups (email-client experiment, renamed
 * to shift-*). Safe because nothing ever ran: no session, no container, no cron.
 * Removes central-DB rows + on-disk group/session scaffold.
 *
 * Usage: pnpm exec tsx scripts/teardown-mailroom-agents.ts
 */
import fs from 'fs';
import Database from 'better-sqlite3';

const db = new Database('/root/nanoclaw-v2/data/v2.db');

const stmts = [
  "DELETE FROM agent_destinations WHERE agent_group_id LIKE 'ag-mailroom%' OR target_id LIKE 'ag-mailroom%'",
  "DELETE FROM messaging_group_agents WHERE agent_group_id LIKE 'ag-mailroom%'",
  "DELETE FROM messaging_groups WHERE channel_type='telegram-axiom'",
  "DELETE FROM agent_group_members WHERE agent_group_id LIKE 'ag-mailroom%'",
  "DELETE FROM users WHERE id='telegram-axiom:1243781160'",
  "DELETE FROM container_configs WHERE agent_group_id LIKE 'ag-mailroom%'",
  "DELETE FROM agent_groups WHERE id LIKE 'ag-mailroom%'",
];
for (const sql of stmts) {
  const r = db.prepare(sql).run();
  console.log(`${r.changes} <- ${sql.slice(0, 60)}...`);
}
db.close();

for (const p of [
  '/root/nanoclaw-v2/groups/mailroom-lead',
  '/root/nanoclaw-v2/groups/mailroom-growth',
  '/root/nanoclaw-v2/data/v2-sessions/ag-mailroom-lead',
  '/root/nanoclaw-v2/data/v2-sessions/ag-mailroom-growth',
]) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('rm -rf', p);
  }
}
console.log('teardown done.');
