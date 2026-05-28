import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
db.prepare(`UPDATE container_configs SET skills = '"all"' WHERE agent_group_id = ?`)
  .run('eb0d9b93-9b35-4b94-b686-d58f5df90300');
const row = db.prepare(`SELECT skills FROM container_configs WHERE agent_group_id = ?`)
  .get('eb0d9b93-9b35-4b94-b686-d58f5df90300');
console.log('Updated skills:', row);
db.close();
