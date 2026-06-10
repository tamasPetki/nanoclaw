/**
 * Seed the v2 central DB with all NanoClaw agent groups and Discord channel mappings.
 *
 * Reads .discord-structure.json for channel IDs.
 *
 * Usage: pnpm exec tsx scripts/seed-all-agents.ts
 */
import fs from 'fs';
import path from 'path';

import { DATA_DIR } from '../src/config.js';
import { initDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { createAgentGroup, getAgentGroup } from '../src/db/agent-groups.js';
import {
  createMessagingGroup,
  createMessagingGroupAgent,
  getMessagingGroup,
} from '../src/db/messaging-groups.js';
import { initGroupFilesystem } from '../src/group-init.js';

const db = initDb(path.join(DATA_DIR, 'v2.db'));
runMigrations(db);

// Discord structure from Phase 0.9
const discordStruct = JSON.parse(
  fs.readFileSync('.discord-structure.json', 'utf8'),
);
const guildId: string = discordStruct.guild_id;

// platform_id format: discord:<guild_id>:<channel_id>
function platformId(channelId: string): string {
  return `discord:${guildId}:${channelId}`;
}

// Fetch channel IDs from Discord API via curl (bot token in .env)
const token = fs
  .readFileSync('.env', 'utf8')
  .split('\n')
  .find((l) => l.startsWith('DISCORD_BOT_TOKEN='))
  ?.split('=')[1];
if (!token) throw new Error('DISCORD_BOT_TOKEN not in .env');

// Hard-coded channel mapping (name → channel_id) — we just created them.
// Fetch dynamically in case of reordering.
import { execSync } from 'child_process';
const channelsRaw = execSync(
  `curl -sS -H "Authorization: Bot ${token}" https://discord.com/api/v10/guilds/${guildId}/channels`,
).toString();
const channels = JSON.parse(channelsRaw) as Array<{
  id: string;
  name: string;
  type: number;
  parent_id: string | null;
}>;

function chan(name: string): string {
  const c = channels.find((x) => x.name === name && x.type === 0);
  if (!c) throw new Error(`Channel not found: #${name}`);
  return c.id;
}

// Agent groups + folder
// Model per agent: pietscarlet → opus, others → sonnet 4.6
// (agent_provider field = 'claude'; per-agent model selection happens
// in container.json or runtime — schema doesn't have a dedicated column.)
const agentDefs = [
  { id: 'ag-asszisztens', name: 'Asszisztens', folder: 'asszisztens' },
  { id: 'ag-edzo', name: 'Edző', folder: 'edzo' },
  { id: 'ag-crypto', name: 'Crypto Advisor', folder: 'crypto-advisor' },
  { id: 'ag-pietscarlet', name: 'PietScarlet', folder: 'pietscarlet' },
  { id: 'ag-gorgey32', name: 'Görgey 32', folder: 'gorgey32' },
  { id: 'ag-csobanka', name: 'Csobánka', folder: 'csobanka' },
  { id: 'ag-torokhegyi', name: 'Törökhegyi', folder: 'torokhegyi' },
  { id: 'ag-bulltrapp', name: 'BullTrapp', folder: 'bulltrapp' },
  { id: 'ag-rezerver', name: 'Rezerver', folder: 'rezerver' },
  { id: 'ag-napi-hirek', name: 'Napi Hírek', folder: 'napi-hirek' },
];

for (const def of agentDefs) {
  if (!getAgentGroup(def.id)) {
    createAgentGroup({
      id: def.id,
      name: def.name,
      folder: def.folder,
      agent_provider: 'claude',
      created_at: new Date().toISOString(),
    });
    console.log(`✓ agent_group: ${def.id} (${def.folder})`);
    // Initialize filesystem (.claude-global.md symlink + container.json if missing)
    initGroupFilesystem({
      id: def.id,
      name: def.name,
      folder: def.folder,
      agent_provider: 'claude',
      created_at: new Date().toISOString(),
    } as Parameters<typeof initGroupFilesystem>[0]);
  } else {
    console.log(`(exists) ${def.id}`);
  }
}

// Messaging groups + agent wiring
// Each Discord channel → 1 messaging_group → 1 agent_group (except log/remote/hírek)
const wiring: Array<{
  mgId: string;
  mgaId: string;
  channelName: string;
  agentId: string | null; // null for system channels (log, remote, hírek)
}> = [
  { mgId: 'mg-asszisztens', mgaId: 'mga-asszisztens', channelName: 'asszisztens', agentId: 'ag-asszisztens' },
  { mgId: 'mg-edzo', mgaId: 'mga-edzo', channelName: 'edző', agentId: 'ag-edzo' },
  { mgId: 'mg-crypto', mgaId: 'mga-crypto', channelName: 'crypto', agentId: 'ag-crypto' },
  { mgId: 'mg-pietscarlet', mgaId: 'mga-pietscarlet', channelName: 'pietscarlet', agentId: 'ag-pietscarlet' },
  { mgId: 'mg-gorgey32', mgaId: 'mga-gorgey32', channelName: 'görgey32', agentId: 'ag-gorgey32' },
  { mgId: 'mg-csobanka', mgaId: 'mga-csobanka', channelName: 'csobánka', agentId: 'ag-csobanka' },
  { mgId: 'mg-torokhegyi', mgaId: 'mga-torokhegyi', channelName: 'törökhegyi', agentId: 'ag-torokhegyi' },
  { mgId: 'mg-bulltrapp', mgaId: 'mga-bulltrapp', channelName: 'bulltrapp', agentId: 'ag-bulltrapp' },
  { mgId: 'mg-rezerver', mgaId: 'mga-rezerver', channelName: 'rezerver', agentId: 'ag-rezerver' },
  { mgId: 'mg-hirek', mgaId: 'mga-hirek', channelName: 'hírek', agentId: 'ag-napi-hirek' },
  // System channels (no agent wiring yet — push-only or future manual setup)
  { mgId: 'mg-log', mgaId: '', channelName: 'log', agentId: null },
  { mgId: 'mg-remote', mgaId: '', channelName: 'remote', agentId: null },
];

for (const w of wiring) {
  const channelId = chan(w.channelName);
  const pid = platformId(channelId);

  if (!getMessagingGroup(w.mgId)) {
    createMessagingGroup({
      id: w.mgId,
      channel_type: 'discord',
      platform_id: pid,
      name: `#${w.channelName}`,
      is_group: 1,
      unknown_sender_policy: 'strict',
      created_at: new Date().toISOString(),
    });
    console.log(`✓ messaging_group: ${w.mgId} → #${w.channelName} (${channelId})`);
  } else {
    console.log(`(exists) ${w.mgId}`);
  }

  if (w.agentId) {
    try {
      createMessagingGroupAgent({
        id: w.mgaId,
        messaging_group_id: w.mgId,
        agent_group_id: w.agentId,
        engage_mode: 'mention-sticky',
        engage_pattern: null,
        sender_scope: 'all',
        ignored_message_policy: 'drop',
        session_mode: 'shared',
        priority: 0,
        created_at: new Date().toISOString(),
      });
      console.log(`  ↳ linked ${w.agentId}`);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        console.log(`  ↳ (link exists)`);
      } else {
        throw err;
      }
    }
  }
}

console.log('\nDone. 10 agent groups, 12 messaging groups, 10 agent wires.');
console.log('Start: pnpm run build && pnpm run dev');
