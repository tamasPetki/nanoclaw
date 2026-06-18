/**
 * Switch the Axiom+Drift team to a NEW product, keeping the CORE.
 *
 * The team is a reusable product-incubator: the CORE (CLAUDE.local.md persona,
 * METHODOLOGY.md, LEARNINGS.md) is project-independent and STAYS. Only the
 * PROJECT layer (project.md + product/) is swapped. This script archives the
 * current project layer and resets the sessions for a clean context.
 *
 * Usage:  pnpm exec tsx scripts/switch-project.ts <old-project-slug>
 *
 * AFTER running, the operator must:
 *   1. Write a new groups/shift-lead/project.md  and groups/shift-growth/project.md
 *   2. Write a new groups/shift-lead/product/brief.md (+ empty product/)
 *   3. Set/replace the Drive (or other) mount if needed (wire-axiom-drive.ts pattern)
 *   4. chown -R 1000:1000 groups/shift-lead groups/shift-growth
 *   5. ncl groups restart --id ag-shift-lead --message "<new kickoff>"  (and Tomi messages the bot)
 *
 * Idempotent-ish: archives whatever is present; safe to inspect before run.
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: pnpm exec tsx scripts/switch-project.ts <old-project-slug>');
  process.exit(1);
}

const ROOT = '/root/nanoclaw-v2';
const ARCHIVE = `/root/nanoclaw-projects-archive/${slug}`;
const AGENTS = [
  { id: 'ag-shift-lead', folder: 'shift-lead' },
  { id: 'ag-shift-growth', folder: 'shift-growth' },
];
const CORE_KEEP = new Set(['CLAUDE.local.md', 'CLAUDE.md', 'METHODOLOGY.md', 'LEARNINGS.md', 'container.json']);

fs.mkdirSync(ARCHIVE, { recursive: true });

for (const a of AGENTS) {
  const gdir = path.join(ROOT, 'groups', a.folder);
  const adir = path.join(ARCHIVE, a.folder);
  fs.mkdirSync(adir, { recursive: true });

  // Archive project.md + product/ + any non-core project files (md/png notes).
  for (const entry of fs.readdirSync(gdir)) {
    if (CORE_KEEP.has(entry) || entry.startsWith('.')) continue; // keep CORE + symlinks/fragments
    if (entry === 'intel' || entry === 'work') continue; // handled specially below (CLI is CORE, DB is project data)
    const src = path.join(gdir, entry);
    fs.renameSync(src, path.join(adir, entry));
    console.log(`archived ${a.folder}/${entry}`);
  }
  // Fresh empty product/ for the next project.
  fs.mkdirSync(path.join(gdir, 'product'), { recursive: true });

  // intel/ : the CLI + schema are CORE tooling (keep); the DB is project data (archive).
  // The next run's CLI re-creates an empty intel.db via its migrations on first invocation.
  const intelDir = path.join(gdir, 'intel');
  if (fs.existsSync(intelDir)) {
    const intelArch = path.join(adir, 'intel');
    fs.mkdirSync(intelArch, { recursive: true });
    for (const f of fs.readdirSync(intelDir)) {
      if (f.startsWith('intel.db')) {
        fs.renameSync(path.join(intelDir, f), path.join(intelArch, f)); // archive DB (+ any -wal/-shm)
        console.log(`archived ${a.folder}/intel/${f} (project data)`);
      }
    }
    // intel.ts, migrations.ts, README.md stay → reusable CORE tool for the next project.
  }

  // work/ : the Axiom (shift-lead) analog of intel/ — the CLI + schema are CORE tooling
  // (keep); the DB is project data (archive). The next run's CLI re-creates an empty
  // work.db via its migrations on first invocation.
  const workDir = path.join(gdir, 'work');
  if (fs.existsSync(workDir)) {
    const workArch = path.join(adir, 'work');
    fs.mkdirSync(workArch, { recursive: true });
    for (const f of fs.readdirSync(workDir)) {
      if (f.startsWith('work.db')) {
        fs.renameSync(path.join(workDir, f), path.join(workArch, f)); // archive DB (+ any -wal/-shm)
        console.log(`archived ${a.folder}/work/${f} (project data)`);
      }
    }
    // work.ts, migrations.ts, README.md stay → reusable CORE tool for the next project.
  }
}

// Reset sessions (clean context for the new project).
const db = new Database(path.join(ROOT, 'data/v2.db'));
const r = db.prepare("DELETE FROM sessions WHERE agent_group_id LIKE 'ag-shift%'").run();
console.log(`deleted ${r.changes} session row(s)`);
db.close();

const sArch = path.join(ARCHIVE, '_sessions');
fs.mkdirSync(sArch, { recursive: true });
for (const a of AGENTS) {
  const d = path.join(ROOT, 'data/v2-sessions', a.id);
  if (!fs.existsSync(d)) continue;
  for (const s of fs.readdirSync(d).filter((x) => x.startsWith('sess-'))) {
    fs.renameSync(path.join(d, s), path.join(sArch, `${a.id}-${s}`));
  }
}
console.log(`\nDONE. CORE kept (CLAUDE.local.md, METHODOLOGY.md, LEARNINGS.md). Project layer archived to ${ARCHIVE}.`);
console.log('NEXT (operator): write new project.md (both agents) + product/brief.md, set Drive mount, chown 1000:1000, restart + Tomi messages the bot.');
