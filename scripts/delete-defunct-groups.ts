import Database from 'better-sqlite3';
import fs from 'fs';

// Delete the 12 defunct agent groups from the "12 agents → 2 (hub + worker)"
// consolidation. Idempotent: safe to re-run (already-deleted rows = 0 changes).
// Order respects FKs — children keyed by session_id and agent_group_id first.
//   pnpm exec tsx scripts/delete-defunct-groups.ts

const GROUPS: Array<{ folder: string; id: string }> = [
  { folder: 'asszisztens', id: 'ag-asszisztens' },
  { folder: 'bulltrapp', id: 'ag-bulltrapp' },
  { folder: 'crypto-advisor', id: 'ag-crypto' },
  { folder: 'csobanka', id: 'ag-csobanka' },
  { folder: 'edzo', id: 'ag-edzo' },
  { folder: 'gorgey32', id: 'ag-gorgey32' },
  { folder: 'lupaobol', id: 'ag-lupaobol' },
  { folder: 'napi-hirek', id: 'ag-napi-hirek' },
  { folder: 'pietscarlet', id: 'ag-pietscarlet' },
  { folder: 'rezerver', id: 'ag-rezerver' },
  { folder: 'torokhegyi', id: 'ag-torokhegyi' },
  { folder: 'trinkenessen', id: 'ag-trinkenessen' },
];
const IDS = GROUPS.map((g) => g.id);
const ph = IDS.map(() => '?').join(',');

const db = new Database('/root/nanoclaw-v2/data/v2.db');

// All user tables + their columns.
const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[]).map((r) => r.name);
const colsOf = (t: string) => db.prepare(`SELECT name FROM pragma_table_info('${t}')`).all().map((r: any) => r.name);

// 1) Tables keyed by session_id → delete rows for the 12 groups' sessions (FK children of sessions).
for (const t of tables) {
  if (t === 'sessions' || t === 'agent_groups') continue;
  if (!colsOf(t).includes('session_id')) continue;
  const r = db
    .prepare(`DELETE FROM ${t} WHERE session_id IN (SELECT id FROM sessions WHERE agent_group_id IN (${ph}))`)
    .run(...IDS);
  if (r.changes) console.log(`DB ${t} (by session_id): ${r.changes}`);
}

// 2) Tables keyed by agent_group_id (except sessions + agent_groups) → then sessions → then agent_groups.
for (const t of tables) {
  if (t === 'agent_groups' || t === 'sessions') continue;
  if (!colsOf(t).includes('agent_group_id')) continue;
  const r = db.prepare(`DELETE FROM ${t} WHERE agent_group_id IN (${ph})`).run(...IDS);
  if (r.changes) console.log(`DB ${t}: ${r.changes}`);
}
const s = db.prepare(`DELETE FROM sessions WHERE agent_group_id IN (${ph})`).run(...IDS);
console.log(`DB sessions: ${s.changes}`);
const ag = db.prepare(`DELETE FROM agent_groups WHERE id IN (${ph})`).run(...IDS);
console.log(`DB agent_groups: ${ag.changes}`);
db.close();

// 3) Filesystem.
for (const g of GROUPS) {
  for (const p of [`groups/${g.folder}`, `data/v2-sessions/${g.id}`]) {
    const abs = `/root/nanoclaw-v2/${p}`;
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { recursive: true, force: true });
      console.log(`FS törölve: ${p}`);
    }
  }
}
console.log('\nKész — 12 halott group eltávolítva (DB + fájlrendszer).');
