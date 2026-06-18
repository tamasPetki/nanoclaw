/**
 * Repurpose the inert shift-* agents from staffing → construction-management.
 * Archives the staffing product/ work + the staffing sessions (so the new topic
 * starts with a clean context), keeps the agent groups / adapter / wiring.
 *
 * Idempotent. Usage: pnpm exec tsx scripts/reset-shift-for-construction.ts
 */
import Database from 'better-sqlite3';
import fs from 'fs';

const ROOT = '/root/nanoclaw-v2';

// 1. Drop the staffing sessions from the central DB so the router creates a
//    fresh session (clean context) on the next message.
const db = new Database(`${ROOT}/data/v2.db`);
const r = db.prepare("DELETE FROM sessions WHERE agent_group_id LIKE 'ag-shift%'").run();
console.log(`deleted ${r.changes} staffing session row(s)`);
db.close();

// 2. Archive the staffing product/ work (keep as reference).
const prod = `${ROOT}/groups/shift-lead/product`;
const prodArch = `${ROOT}/groups/shift-lead/_archive-staffing-product`;
if (fs.existsSync(prod)) {
  fs.rmSync(prodArch, { recursive: true, force: true });
  fs.renameSync(prod, prodArch);
  console.log('archived staffing product/ →', prodArch);
}

// 3. Archive the staffing growth notes too (Drift's workspace).
for (const f of ['distribution-notes.md', 'business-notes.md', 'BUSINESS.md', 'DISTRIBUTION.md', 'PHASE-0-RUNPLAN.md']) {
  const src = `${ROOT}/groups/shift-growth/${f}`;
  if (fs.existsSync(src)) {
    const arch = `${ROOT}/groups/shift-growth/_archive-staffing`;
    fs.mkdirSync(arch, { recursive: true });
    fs.renameSync(src, `${arch}/${f}`);
    console.log('archived', f);
  }
}

// 4. Archive the staffing session folders.
const sArch = `${ROOT}/data/v2-sessions/_archive-staffing`;
fs.mkdirSync(sArch, { recursive: true });
for (const g of ['ag-shift-lead', 'ag-shift-growth']) {
  const d = `${ROOT}/data/v2-sessions/${g}`;
  if (!fs.existsSync(d)) continue;
  for (const s of fs.readdirSync(d).filter((x) => x.startsWith('sess-'))) {
    fs.renameSync(`${d}/${s}`, `${sArch}/${g}-${s}`);
    console.log('archived session', g, s);
  }
}
console.log('reset done — clean slate for construction topic.');
