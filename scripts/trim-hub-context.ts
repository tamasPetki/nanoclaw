import Database from 'better-sqlite3';

// Trim the hub's baseline context: drop the youtube-transcript MCP server (unused
// by the hub) and curate skills from "all" down to a hub-relevant list (removes
// worker/tracker/dev/social skills the hub never invokes). Reversible: set skills
// back to "all" and re-add the MCP entry.

const DB = '/root/nanoclaw-v2/data/v2.db';
const db = new Database(DB);
const GID = 'ag-hub';

// Skills the hub actually uses. Dropped: bluesky, frontend-engineer, reddit-monitor,
// stealth-browser, vercel-cli, x-browser (all worker/tracker/dev/social only).
const HUB_SKILLS = [
  'agent-browser', 'document-fill', 'email-assistant', 'google-drive-write',
  'humanizer', 'inline-ui', 'mnemon', 'ocr-and-documents', 'onecli-gateway',
  'pdf-filler', 'pdf-reader', 'quick-integration', 'self-customize',
  'self-improvement', 'skill-authoring', 'status', 'ticktick', 'welcome',
  'whatsapp-formatting', 'wiki',
];

const row = db
  .prepare('SELECT mcp_servers, skills FROM container_configs WHERE agent_group_id = ?')
  .get(GID) as { mcp_servers: string; skills: string };

const mcp = JSON.parse(row.mcp_servers);
const hadYt = 'youtube-transcript' in mcp;
delete mcp['youtube-transcript'];

db.prepare(
  'UPDATE container_configs SET mcp_servers = @mcp, skills = @skills, updated_at = @ts WHERE agent_group_id = @gid',
).run({
  mcp: JSON.stringify(mcp),
  skills: JSON.stringify(HUB_SKILLS),
  ts: new Date().toISOString(),
  gid: GID,
});

console.log(`youtube-transcript MCP eltávolítva: ${hadYt}`);
console.log(`MCP-szerverek most: ${Object.keys(mcp).length} (${Object.keys(mcp).join(', ')})`);
console.log(`skills: "all" → ${HUB_SKILLS.length} curált`);
db.close();
