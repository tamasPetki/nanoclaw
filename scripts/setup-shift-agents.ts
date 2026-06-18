/**
 * One-shot setup for the HoReCa shift-staffing marketplace experiment: two
 * persistent agent groups — Axiom (Lead/Architect, folder shift-lead) and Drift
 * (Growth/Distribution, folder shift-growth) — plus their bidirectional A2A
 * destinations.
 *
 * Both run cli_scope='group' (least privilege — they don't spawn sub-agent
 * groups at runtime). The design-sprint perspective lenses run as SDK subagents
 * inside Axiom's container, not as separate groups. Real multi-agent (separate
 * git clones) arrives in the build phase via a promotion script.
 *
 * Idempotent. The CLAUDE.local.md personas are written separately BEFORE running
 * this — initGroupFilesystem only seeds CLAUDE.local.md if absent.
 *
 * Usage: pnpm exec tsx scripts/setup-shift-agents.ts
 */
import path from 'path';

import { DATA_DIR } from '../src/config.js';
import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { createAgentGroup, getAgentGroup, getAgentGroupByFolder } from '../src/db/agent-groups.js';
import { updateContainerConfigScalars } from '../src/db/container-configs.js';
import { initGroupFilesystem } from '../src/group-init.js';
import { createDestination, getDestinationByName } from '../src/modules/agent-to-agent/db/agent-destinations.js';
import type { AgentGroup } from '../src/types.js';

initDb(path.join(DATA_DIR, 'v2.db'));
runMigrations(getDb());

const now = new Date().toISOString();

interface Spec {
  id: string;
  name: string;
  folder: string;
  assistant_name: string;
}

const AXIOM: Spec = { id: 'ag-shift-lead', name: 'Axiom', folder: 'shift-lead', assistant_name: 'Axiom' };
const DRIFT: Spec = { id: 'ag-shift-growth', name: 'Drift', folder: 'shift-growth', assistant_name: 'Drift' };

function ensureGroup(spec: Spec): void {
  let existing = getAgentGroup(spec.id) ?? getAgentGroupByFolder(spec.folder);
  if (!existing) {
    const group: AgentGroup = {
      id: spec.id,
      name: spec.name,
      folder: spec.folder,
      agent_provider: null,
      created_at: now,
    };
    createAgentGroup(group);
    existing = group;
    console.log(`created agent_group ${spec.id} (${spec.name})`);
  } else {
    console.log(`agent_group already exists: ${existing.id} (${existing.name})`);
  }
  initGroupFilesystem(existing);
  updateContainerConfigScalars(existing.id, {
    model: 'claude-opus-4-8[1m]',
    effort: 'xhigh',
    cli_scope: 'group',
    assistant_name: spec.assistant_name,
  });
  console.log(`  config set: model=claude-opus-4-8[1m] effort=xhigh cli_scope=group assistant_name=${spec.assistant_name}`);
}

function ensureDestination(fromId: string, localName: string, toId: string): void {
  if (getDestinationByName(fromId, localName)) {
    console.log(`destination already exists: ${fromId} →"${localName}"`);
    return;
  }
  createDestination({
    agent_group_id: fromId,
    local_name: localName,
    target_type: 'agent',
    target_id: toId,
    created_at: now,
  });
  console.log(`destination: ${fromId} →"${localName}"→ ${toId}`);
}

ensureGroup(AXIOM);
ensureGroup(DRIFT);

ensureDestination(AXIOM.id, 'drift', DRIFT.id);
ensureDestination(DRIFT.id, 'axiom', AXIOM.id);

console.log('done.');
