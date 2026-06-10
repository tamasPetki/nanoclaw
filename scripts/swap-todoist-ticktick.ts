import Database from 'better-sqlite3';

// Swap the `todoist` MCP server entry for a `ticktick` one (karbassi/mcp-ticktick)
// across every agent group that currently has Todoist wired. Source of truth is
// container_configs.mcp_servers in the central DB; container.json is materialized
// from it at spawn time.

const DB = '/root/nanoclaw-v2/data/v2.db';
const db = new Database(DB);

const ticktick = {
  command: '/bin/bash',
  args: ['/opt/mcp-servers/ticktick/run.sh'],
  env: {
    TICKTICK_ACCESS_TOKEN: '${TICKTICK_ACCESS_TOKEN}',
    TICKTICK_CLIENT_ID: '${TICKTICK_CLIENT_ID}',
    TICKTICK_CLIENT_SECRET: '${TICKTICK_CLIENT_SECRET}',
    TICKTICK_V2_SESSION_TOKEN: '${TICKTICK_V2_SESSION_TOKEN}',
    // mcp-ticktick talks straight to api.ticktick.com with its own bearer token;
    // bypass the OneCLI gateway proxy (avoids TLS-intercept cert + circular-JSON issues).
    NO_PROXY: 'api.ticktick.com,ticktick.com,.ticktick.com',
    HTTPS_PROXY: '',
    HTTP_PROXY: '',
  },
};

const rows = db
  .prepare(
    `SELECT cc.agent_group_id AS gid, ag.folder AS folder, cc.mcp_servers AS mcp
     FROM container_configs cc JOIN agent_groups ag ON ag.id = cc.agent_group_id
     WHERE cc.mcp_servers LIKE '%todoist%'`,
  )
  .all() as Array<{ gid: string; folder: string; mcp: string }>;

const upd = db.prepare(
  `UPDATE container_configs SET mcp_servers = @mcp, updated_at = @ts WHERE agent_group_id = @gid`,
);
const ts = new Date().toISOString();

for (const r of rows) {
  const servers = JSON.parse(r.mcp);
  if (!('todoist' in servers)) {
    console.log(`${r.folder}: nincs todoist kulcs (skip)`);
    continue;
  }
  delete servers.todoist;
  servers.ticktick = ticktick;
  upd.run({ mcp: JSON.stringify(servers), ts, gid: r.gid });
  console.log(`${r.folder}: todoist → ticktick ✓`);
}

console.log(`\n${rows.length} group feldolgozva.`);
db.close();
