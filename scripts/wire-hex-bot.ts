import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();
const PLATFORM = 'telegram:1243781160';
const AG = 'eb0d9b93-9b35-4b94-b686-d58f5df90300'; // ag-tracker (Hex)
const SESSION = 'sess-1779896427881-2kadcg';
const UID = 'telegram-hex:1243781160';

const existing = db.prepare("SELECT id FROM messaging_groups WHERE channel_type='telegram-hex' AND platform_id=?").get(PLATFORM) as {id:string}|undefined;
const mgId = existing?.id ?? `mg-hex-bot-${Date.now()}`;
if (!existing) {
  db.prepare(`INSERT INTO messaging_groups (id, channel_type, platform_id, name, is_group, unknown_sender_policy, created_at)
              VALUES (@id,'telegram-hex',@p,'Tomi DM @Tomi_hex_bot',0,'strict',@now)`).run({id:mgId,p:PLATFORM,now});
  console.log('messaging_group:', mgId);
} else console.log('messaging_group már létezik:', mgId);

const wired = db.prepare("SELECT id FROM messaging_group_agents WHERE messaging_group_id=? AND agent_group_id=?").get(mgId,AG) as {id:string}|undefined;
if (!wired) {
  db.prepare(`INSERT INTO messaging_group_agents (id, messaging_group_id, agent_group_id, session_mode, priority, created_at, engage_mode, engage_pattern, sender_scope, ignored_message_policy)
              VALUES (@id,@mg,@ag,'shared',0,@now,'pattern','.','all','drop')`).run({id:`mga-hex-${Date.now()}`,mg:mgId,ag:AG,now});
  console.log('wiring kész');
} else console.log('wiring már létezik');

const r = db.prepare("UPDATE sessions SET messaging_group_id=? WHERE id=? AND agent_group_id=?").run(mgId, SESSION, AG);
console.log(`tracker session → ${mgId} (changed ${r.changes})`);

db.prepare(`INSERT OR IGNORE INTO users (id, kind, display_name, created_at) VALUES (?,?,?,?)`).run(UID,'telegram-hex','Tomi',now);
db.prepare(`INSERT OR IGNORE INTO agent_group_members (user_id, agent_group_id, added_by, added_at) VALUES (?,?,?,?)`).run(UID,AG,null,now);
console.log('Tomi member az ag-tracker-ben:', UID);
db.close();
