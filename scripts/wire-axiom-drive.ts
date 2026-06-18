/**
 * Give Axiom (ag-shift-lead) read-only access to the real Görgey 32 project
 * folder (the most well-organized project) for design-sprint discovery.
 * The /root/data root is already allowlisted read-only (mount-allowlist.json),
 * so this RO mount is permitted. Takes effect on the next container respawn.
 *
 * Usage: pnpm exec tsx scripts/wire-axiom-drive.ts
 */
import path from 'path';

import { DATA_DIR } from '../src/config.js';
import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { updateContainerConfigJson, getContainerConfig } from '../src/db/container-configs.js';

initDb(path.join(DATA_DIR, 'v2.db'));
runMigrations(getDb());

const mounts = [
  {
    hostPath: '/root/data/gdrive-pietscarlet/04 - Ingatlanok/Vác - Görgey utca 32',
    containerPath: 'gorgey32', // mount-security prefixes /workspace/extra/ → final: /workspace/extra/gorgey32
    readonly: true,
  },
];

updateContainerConfigJson('ag-shift-lead', 'additional_mounts', mounts);
const cfg = getContainerConfig('ag-shift-lead');
console.log('Axiom additional_mounts now:', cfg?.additional_mounts);
