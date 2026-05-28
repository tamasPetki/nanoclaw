import Database from 'better-sqlite3';
const db = new Database('/root/nanoclaw-v2/data/v2.db');
const TRACKER_ID = 'eb0d9b93-9b35-4b94-b686-d58f5df90300';

const mcpServers = {
  'hex-email': {
    command: 'mcp-email-server',
    args: ['stdio'],
    env: {
      MCP_EMAIL_SERVER_ACCOUNT_NAME: 'hex',
      MCP_EMAIL_SERVER_FULL_NAME: '"Hex @ HeadlessTracker"',
      MCP_EMAIL_SERVER_EMAIL_ADDRESS: 'hex.headlesstracker@gmail.com',
      MCP_EMAIL_SERVER_IMAP_HOST: 'imap.gmail.com',
      MCP_EMAIL_SERVER_IMAP_PORT: '993',
      MCP_EMAIL_SERVER_SMTP_HOST: 'smtp.gmail.com',
      MCP_EMAIL_SERVER_SMTP_PORT: '587',
      MCP_EMAIL_SERVER_SMTP_SSL: 'false',
      MCP_EMAIL_SERVER_SMTP_START_SSL: 'true',
      MCP_EMAIL_SERVER_ENABLE_ATTACHMENT_DOWNLOAD: 'false',
      MCP_EMAIL_SERVER_SAVE_TO_SENT: 'true',
      MCP_EMAIL_SERVER_PASSWORD: '${HEX_EMAIL_PASSWORD}',
    },
  },
};

const now = new Date().toISOString();
db.prepare(`UPDATE container_configs SET mcp_servers = ?, updated_at = ? WHERE agent_group_id = ?`)
  .run(JSON.stringify(mcpServers), now, TRACKER_ID);

const row = db.prepare(`SELECT mcp_servers FROM container_configs WHERE agent_group_id = ?`).get(TRACKER_ID) as { mcp_servers: string };
console.log('Updated mcp_servers for tracker:');
console.log(JSON.stringify(JSON.parse(row.mcp_servers), null, 2));
db.close();
