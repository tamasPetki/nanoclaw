import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();
const cols = db.prepare("SELECT name FROM pragma_table_info('agent_destinations')").all().map((r:any)=>r.name);
const hasCreated = cols.includes('created_at');
function addChannel(ag:string, mg:string){
  const ex = db.prepare("SELECT 1 FROM agent_destinations WHERE agent_group_id=? AND local_name='tomi'").get(ag);
  if (ex){ console.log(`${ag}: 'tomi' már létezik`); return; }
  if (hasCreated) db.prepare("INSERT INTO agent_destinations (agent_group_id, local_name, target_type, target_id, created_at) VALUES (?,?,?,?,?)").run(ag,'tomi','channel',mg,now);
  else db.prepare("INSERT INTO agent_destinations (agent_group_id, local_name, target_type, target_id) VALUES (?,?,?,?)").run(ag,'tomi','channel',mg);
  console.log(`${ag}: + tomi|channel|${mg}`);
}
// remove the 'hub' agent-destination (no longer needed — direct posting)
const r1 = db.prepare("DELETE FROM agent_destinations WHERE agent_group_id IN ('ag-worker','eb0d9b93-9b35-4b94-b686-d58f5df90300') AND local_name='hub'").run();
console.log(`'hub' destination törölve: ${r1.changes}`);
addChannel('ag-worker','mg-worker-bot-1780339591082');
addChannel('eb0d9b93-9b35-4b94-b686-d58f5df90300','mg-hex-bot-1780340256935');
console.log('--- végállapot ---');
for (const row of db.prepare("SELECT agent_group_id, local_name, target_type, target_id FROM agent_destinations WHERE agent_group_id IN ('ag-worker','eb0d9b93-9b35-4b94-b686-d58f5df90300')").all() as any[])
  console.log(`  ${row.agent_group_id} | ${row.local_name} | ${row.target_type} | ${row.target_id}`);
db.close();
