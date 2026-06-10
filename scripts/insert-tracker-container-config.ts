import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();
db.prepare(`
  INSERT INTO container_configs (
    agent_group_id, provider, assistant_name, skills, mcp_servers,
    packages_apt, packages_npm, additional_mounts, updated_at, cli_scope
  ) VALUES (
    @id, 'claude', 'Hex', 'all', '{}', '[]', '[]', '[]', @now, 'group'
  )
`).run({ id: 'eb0d9b93-9b35-4b94-b686-d58f5df90300', now });
console.log('Container config inserted');
db.close();
