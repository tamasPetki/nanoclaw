/**
 * Wire cross-agent destinations for PietScarlet (hub) + Asszisztens (hub) over
 * the three building projects: gorgey32, csobanka, torokhegyi.
 *
 * Two-star topology, bi-directional:
 *   - PietScarlet ↔ { gorgey32, csobanka, torokhegyi, asszisztens }
 *   - Asszisztens  ↔ { pietscarlet, gorgey32, csobanka, torokhegyi, lupaobol, trinkenessen }
 *   - Each PS-sub (gorgey32/csobanka/torokhegyi) ↔ { pietscarlet, asszisztens }
 *   - Each AS-only (lupaobol/trinkenessen) ↔ { asszisztens }
 *
 * Safe to re-run (INSERT OR IGNORE on the unique (agent_group_id, local_name)).
 * After writing the central rows, projects each affected agent's running
 * sessions' `destinations` table via `writeDestinations()` so live containers
 * see the change without a restart.
 *
 * Usage: pnpm exec tsx scripts/wire-superagent-destinations.ts
 */
import path from 'path';

import { DATA_DIR } from '../src/config.js';
import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { getAgentGroup } from '../src/db/agent-groups.js';
import { getSessionsByAgentGroup } from '../src/db/sessions.js';
import { writeDestinations } from '../src/modules/agent-to-agent/write-destinations.js';

initDb(path.join(DATA_DIR, 'v2.db'));
runMigrations(getDb());

interface Link {
  from: string;
  to: string;
  localName: string;
}

const HUB_PS = 'ag-pietscarlet';
const HUB_AS = 'ag-asszisztens';
const PS_SUBS = ['ag-gorgey32', 'ag-csobanka', 'ag-torokhegyi'];
const AS_ONLY = ['ag-lupaobol', 'ag-trinkenessen'];

const NAME_OF: Record<string, string> = {
  'ag-pietscarlet': 'pietscarlet',
  'ag-asszisztens': 'asszisztens',
  'ag-gorgey32': 'gorgey32',
  'ag-csobanka': 'csobanka',
  'ag-torokhegyi': 'torokhegyi',
  'ag-lupaobol': 'lupaobol',
  'ag-trinkenessen': 'trinkenessen',
};

const links: Link[] = [];
// PS hub ↔ each PS-sub + asszisztens
for (const sub of PS_SUBS) {
  links.push({ from: HUB_PS, to: sub, localName: NAME_OF[sub] });
  links.push({ from: sub, to: HUB_PS, localName: NAME_OF[HUB_PS] });
}
links.push({ from: HUB_PS, to: HUB_AS, localName: NAME_OF[HUB_AS] });
links.push({ from: HUB_AS, to: HUB_PS, localName: NAME_OF[HUB_PS] });
// AS hub ↔ each PS-sub
for (const sub of PS_SUBS) {
  links.push({ from: HUB_AS, to: sub, localName: NAME_OF[sub] });
  links.push({ from: sub, to: HUB_AS, localName: NAME_OF[HUB_AS] });
}
// AS-only agents ↔ asszisztens
for (const sub of AS_ONLY) {
  links.push({ from: HUB_AS, to: sub, localName: NAME_OF[sub] });
  links.push({ from: sub, to: HUB_AS, localName: NAME_OF[HUB_AS] });
}

const now = new Date().toISOString();
const db = getDb();
const insert = db.prepare(
  `INSERT OR IGNORE INTO agent_destinations (agent_group_id, local_name, target_type, target_id, created_at)
   VALUES (?, ?, 'agent', ?, ?)`,
);

let inserted = 0;
let skipped = 0;
for (const link of links) {
  if (!getAgentGroup(link.from) || !getAgentGroup(link.to)) {
    console.warn(`skip (missing agent group): ${link.from} → ${link.to}`);
    continue;
  }
  const res = insert.run(link.from, link.localName, link.to, now);
  if (res.changes > 0) inserted++;
  else skipped++;
}
console.log(`agent_destinations: ${inserted} inserted, ${skipped} already existed`);

// Refresh session projections for every agent whose destinations changed.
const affected = new Set([HUB_PS, HUB_AS, ...PS_SUBS, ...AS_ONLY]);
for (const agentGroupId of affected) {
  const sessions = getSessionsByAgentGroup(agentGroupId);
  for (const s of sessions) {
    try {
      writeDestinations(agentGroupId, s.id);
      console.log(`  refreshed ${agentGroupId} session ${s.id}`);
    } catch (e) {
      console.error(`  FAILED to refresh ${agentGroupId} session ${s.id}:`, e);
    }
  }
}

console.log('done.');
