import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();
const MG = `mg-worker-bot-${Date.now()}`;
const PLATFORM = 'telegram:1243781160'; // Tomi DM (same chat id, distinct bot via channel_type)
const SESSION = 'sess-1778077729204-u2ry5f';

// idempotens: ha már van telegram-worker mg erre a platformra, használd azt
const existing = db.prepare("SELECT id FROM messaging_groups WHERE channel_type='telegram-worker' AND platform_id=?").get(PLATFORM) as {id:string}|undefined;
const mgId = existing?.id ?? MG;
if (!existing) {
  db.prepare(`INSERT INTO messaging_groups (id, channel_type, platform_id, name, is_group, unknown_sender_policy, created_at)
              VALUES (@id,'telegram-worker',@p,'Tomi DM @Tomi_worker_bot',0,'strict',@now)`).run({id:mgId,p:PLATFORM,now});
  console.log('messaging_group létrehozva:', mgId);
} else { console.log('messaging_group már létezik:', mgId); }

const wired = db.prepare("SELECT id FROM messaging_group_agents WHERE messaging_group_id=? AND agent_group_id='ag-worker'").get(mgId) as {id:string}|undefined;
if (!wired) {
  db.prepare(`INSERT INTO messaging_group_agents (id, messaging_group_id, agent_group_id, session_mode, priority, created_at, engage_mode, engage_pattern, sender_scope, ignored_message_policy)
              VALUES (@id,@mg,'ag-worker','shared',0,@now,'pattern','.','all','drop')`).run({id:`mga-worker-${Date.now()}`,mg:mgId,now});
  console.log('wiring (messaging_group_agents) létrehozva');
} else { console.log('wiring már létezik'); }

const r = db.prepare("UPDATE sessions SET messaging_group_id=? WHERE id=? AND agent_group_id='ag-worker'").run(mgId, SESSION);
console.log(`worker session messaging_group → ${mgId} (changed ${r.changes})`);
db.close();
