#!/usr/bin/env bun
/**
 * `work` — the canonical work-tracker store for the Axiom lead (CORE tool).
 *
 * Tomi's rule (2026-06-15): structured/growing data → THIS DB, never md/json files.
 * Agents reach for files by default and they don't scale; the DB does. This is the
 * design-sprint → BUILD task tracker (the Axiom analog of Drift's intel store). Run
 * from the agent workspace:  bun work/work.ts <verb> [--flags]
 *
 * The DB (work.db) sits next to this script and is durable (bind-mounted workspace +
 * nightly backup). Schema is versioned in ./migrations.ts and applied on every run.
 *
 * Verbs:
 *   task add|update|done|list     dep add        event add
 *   stats                         query "<SELECT ...>"        maintain
 *
 * Use `work task help` or `work help` for flags. bun:sqlite: positional `?` params only.
 */
import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import { runMigrations } from './migrations.ts';

const DB_PATH = join(import.meta.dir, 'work.db');

function open(): Database {
  const db = new Database(DB_PATH, { create: true });
  db.exec('PRAGMA journal_mode = DELETE;');
  db.exec('PRAGMA busy_timeout = 5000;');
  runMigrations(
    (sql) => db.exec(sql),
    () => (db.query('PRAGMA user_version').get() as { user_version: number }).user_version,
    (v) => db.exec(`PRAGMA user_version = ${v}`),
  );
  return db;
}

// ---- arg parsing -----------------------------------------------------------
function parseFlags(argv: string[]): { _: string[]; flags: Record<string, string> } {
  const _: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
          flags[a.slice(2)] = 'true';
        } else {
          flags[a.slice(2)] = next;
          i++;
        }
      }
    } else {
      _.push(a);
    }
  }
  return { _, flags };
}

function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

// ---- task columns the CLI accepts ------------------------------------------
const TASK_COLS = [
  'key', 'title', 'kind', 'status', 'priority', 'feature', 'spec_ref',
  'health_score', 'wip_note', 'blocked_reason', 'owner',
];

function getTask(db: Database, key: string): Record<string, unknown> | null {
  return db.query('SELECT * FROM tasks WHERE key = ?').get(key) as Record<string, unknown> | null;
}

function logEvent(db: Database, taskKey: string, from: string | null, to: string, note?: string): void {
  db.run(
    'INSERT INTO task_events (task_key, from_status, to_status, note) VALUES (?, ?, ?, ?)',
    [taskKey, from, to, note ?? null],
  );
}

// ---- build-pipeline sequencing (METHODOLOGY §4 / build-feature.md), feature tasks only ----
// 2026-07-03: an audit (Ledger + shift-lead/Axiom) found the documented DAG
// (spec→architect→dev→test→review→shipped) was pure convention with zero enforcement — most
// feature tasks in both work.db instances skipped straight from todo/None to shipped, with
// only a handful ever touching 'architect'. This makes the sequence structurally impossible
// to skip for kind='feature' tasks (build-feature.md's own title scopes the DAG to features);
// chore/bug/spec tasks are unaffected.
const PIPELINE_ORDER = ['todo', 'spec', 'architect', 'dev', 'test', 'review', 'shipped'];

function validateTransition(kind: string, from: string | null, to: string): void {
  if (kind !== 'feature') return;
  if (to === 'blocked' || from === 'blocked') return; // safety valve, always allowed both ways
  const fromIdx = from === null ? -1 : PIPELINE_ORDER.indexOf(from);
  const toIdx = PIPELINE_ORDER.indexOf(to);
  if (toIdx === -1) return; // not a pipeline status — not our concern
  if (toIdx === fromIdx + 1) return; // one step forward
  if (toIdx === PIPELINE_ORDER.indexOf('dev') && fromIdx >= PIPELINE_ORDER.indexOf('test')) return; // fix-loop
  die(
    `feature task can't jump '${from ?? '(new)'}' → '${to}' — the build-pipeline is sequential ` +
      `(todo→spec→architect→dev→test→review→shipped; fix-loop: test/review/shipped→dev). ` +
      `Spawn the missing stage's subagent (Task/Agent tool) and flip through it, or re-file with ` +
      `--kind chore|bug|spec if this genuinely doesn't need the full DAG.`,
  );
}

// `task add` — upsert on key. On status change vs existing, log a task_events row.
function doTaskAdd(db: Database, flags: Record<string, string>): void {
  if (!flags.key) die('--key is required for \'task add\'');
  if (!flags.title) die('--title is required for \'task add\'');
  const present = TASK_COLS.filter((c) => flags[c] !== undefined);

  const tx = db.transaction(() => {
    const existing = getTask(db, flags.key);
    if (existing) {
      const setCols = present.filter((c) => c !== 'key');
      const newStatus = flags.status;
      const statusChanged = newStatus !== undefined && newStatus !== existing.status;
      if (statusChanged) {
        validateTransition((flags.kind ?? existing.kind) as string, existing.status as string, newStatus);
      }
      const sets = [
        ...setCols.map((c) => `${c} = ?`),
        "updated_at = datetime('now')",
        ...(statusChanged && newStatus === 'shipped' ? ["closed_at = datetime('now')"] : []),
      ];
      if (sets.length) {
        db.run(
          `UPDATE tasks SET ${sets.join(', ')} WHERE key = ?`,
          [...setCols.map((c) => flags[c]), flags.key],
        );
      }
      if (statusChanged) {
        logEvent(db, flags.key, existing.status as string, newStatus, flags.note);
      }
      console.log(`updated task '${flags.key}' (id=${existing.id})${statusChanged ? ` [${existing.status}→${newStatus}]` : ''}`);
      return;
    }
    validateTransition(flags.kind ?? 'feature', null, flags.status ?? 'todo');
    const insCols = present;
    const placeholders = insCols.map(() => '?').join(', ');
    const r = db.run(
      `INSERT INTO tasks (${insCols.join(', ')}) VALUES (${placeholders})`,
      insCols.map((c) => flags[c]),
    );
    // a freshly-created task gets an event for its initial status (delta from nothing)
    logEvent(db, flags.key, null, (flags.status ?? 'todo'), flags.note);
    console.log(`added task '${flags.key}' (id=${r.lastInsertRowid})`);
  });
  tx();
}

// `task update` — set any column; on status change log a task_events row.
function doTaskUpdate(db: Database, flags: Record<string, string>): void {
  if (!flags.key) die('--key is required for \'task update\'');
  const present = TASK_COLS.filter((c) => c !== 'key' && flags[c] !== undefined);
  if (!present.length) die('task update needs at least one --<column> to set');

  const tx = db.transaction(() => {
    const existing = getTask(db, flags.key);
    if (!existing) die(`task '${flags.key}' not found — use 'task add' to create it`);
    const newStatus = flags.status;
    const statusChanged = newStatus !== undefined && newStatus !== existing.status;
    if (statusChanged) {
      validateTransition((flags.kind ?? existing.kind) as string, existing.status as string, newStatus);
    }
    const sets = [
      ...present.map((c) => `${c} = ?`),
      "updated_at = datetime('now')",
      ...(statusChanged && newStatus === 'shipped' ? ["closed_at = datetime('now')"] : []),
    ];
    db.run(
      `UPDATE tasks SET ${sets.join(', ')} WHERE key = ?`,
      [...present.map((c) => flags[c]), flags.key],
    );
    if (statusChanged) {
      logEvent(db, flags.key, existing.status as string, newStatus, flags.note);
    }
    console.log(`updated task '${flags.key}' (id=${existing.id})${statusChanged ? ` [${existing.status}→${newStatus}]` : ''}`);
  });
  tx();
}

// `task done` — shorthand: status=shipped + closed_at + optional health_score, logs the event.
function doTaskDone(db: Database, flags: Record<string, string>): void {
  if (!flags.key) die('--key is required for \'task done\'');
  const tx = db.transaction(() => {
    const existing = getTask(db, flags.key);
    if (!existing) die(`task '${flags.key}' not found`);
    const kind = (flags.kind ?? existing.kind) as string;
    if (existing.status !== 'shipped') {
      validateTransition(kind, existing.status as string, 'shipped');
    }
    if (kind === 'feature') {
      const score = flags.health_score !== undefined ? parseInt(flags.health_score, 10) : NaN;
      if (!Number.isFinite(score) || score < 8) {
        die(
          `ship-gate (METHODOLOGY §4, KEMÉNY): feature task 'task done' requires --health_score >= 8 ` +
            `(got ${flags.health_score ?? '(none)'}). Below 8 → fix-loop back to dev, don't ship.`,
        );
      }
    }
    const sets = ['status = ?', "closed_at = datetime('now')", "updated_at = datetime('now')"];
    const vals: unknown[] = ['shipped'];
    if (flags.health_score !== undefined) {
      sets.push('health_score = ?');
      vals.push(flags.health_score);
    }
    db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE key = ?`, [...vals, flags.key]);
    if (existing.status !== 'shipped') {
      logEvent(db, flags.key, existing.status as string, 'shipped', flags.note);
    }
    console.log(`shipped task '${flags.key}' (id=${existing.id})`);
  });
  tx();
}

function doTaskList(db: Database, flags: Record<string, string>): void {
  const limit = flags.limit ? parseInt(flags.limit, 10) : 100;
  let where = '';
  const params: unknown[] = [];
  for (const c of ['status', 'priority', 'feature']) {
    if (flags[c] !== undefined) {
      where += where ? ' AND ' : ' WHERE ';
      where += `${c} = ?`;
      params.push(flags[c]);
    }
  }
  const rows = db
    .query(`SELECT * FROM tasks${where} ORDER BY priority ASC, status ASC, id DESC LIMIT ${limit}`)
    .all(...params) as Record<string, unknown>[];
  if (!rows.length) {
    console.log('(none)');
    return;
  }
  for (const row of rows) {
    const parts = Object.entries(row)
      .filter(([k, v]) => v !== null && v !== '' && k !== 'created_at' && k !== 'updated_at')
      .map(([k, v]) => `${k}=${String(v).replace(/\s+/g, ' ').slice(0, 200)}`);
    console.log(`- ${parts.join(' | ')}`);
  }
  console.log(`(${rows.length} row${rows.length === 1 ? '' : 's'})`);
}

function doDepAdd(db: Database, flags: Record<string, string>): void {
  if (!flags.task_key) die('--task_key is required for \'dep add\'');
  if (!flags.depends_on_key) die('--depends_on_key is required for \'dep add\'');
  const r = db.run(
    'INSERT OR IGNORE INTO task_deps (task_key, depends_on_key) VALUES (?, ?)',
    [flags.task_key, flags.depends_on_key],
  );
  if (r.changes) console.log(`added dep ${flags.task_key} → ${flags.depends_on_key} (id=${r.lastInsertRowid})`);
  else console.log(`dep ${flags.task_key} → ${flags.depends_on_key} already exists`);
}

function doEventAdd(db: Database, flags: Record<string, string>): void {
  if (!flags.task_key) die('--task_key is required for \'event add\'');
  if (!flags.to_status) die('--to_status is required for \'event add\'');
  const r = db.run(
    'INSERT INTO task_events (task_key, from_status, to_status, note) VALUES (?, ?, ?, ?)',
    [flags.task_key, flags.from_status ?? null, flags.to_status, flags.note ?? null],
  );
  console.log(`added event for '${flags.task_key}' (id=${r.lastInsertRowid})`);
}

function doStats(db: Database): void {
  const v = (db.query('PRAGMA user_version').get() as { user_version: number }).user_version;
  console.log(`work.db (schema v${v}) @ ${DB_PATH}`);
  const rows = db
    .query("SELECT status, COUNT(*) AS n FROM tasks GROUP BY status ORDER BY status")
    .all() as { status: string; n: number }[];
  let total = 0;
  for (const r of rows) {
    console.log(`  ${String(r.status).padEnd(12)} ${r.n}`);
    total += r.n;
  }
  console.log(`  ${'TOTAL'.padEnd(12)} ${total}`);
}

function doQuery(db: Database, sql: string): void {
  if (!/^\s*select\s/i.test(sql)) die('query only allows SELECT');
  const rows = db.query(sql).all() as Record<string, unknown>[];
  console.log(JSON.stringify(rows, null, 2));
}

function doMaintain(db: Database): void {
  console.log('=== work maintenance ===');
  doStats(db);
  // orphan deps: task_key or depends_on_key not in tasks (structure smell)
  const orphanDeps = db
    .query(`
      SELECT task_key, depends_on_key FROM task_deps
      WHERE task_key NOT IN (SELECT key FROM tasks)
         OR depends_on_key NOT IN (SELECT key FROM tasks)
    `)
    .all() as { task_key: string; depends_on_key: string }[];
  if (orphanDeps.length) {
    console.log('\n⚠ orphan deps (task_key or depends_on_key not in tasks):');
    for (const d of orphanDeps) console.log(`  - ${d.task_key} → ${d.depends_on_key}`);
  }
  // shipped tasks with no health_score (skipped the ship-gate)
  const shippedNoHealth = db
    .query(`SELECT key FROM tasks WHERE status = 'shipped' AND health_score IS NULL`)
    .all() as { key: string }[];
  if (shippedNoHealth.length) {
    console.log('\n⚠ shipped task(s) with NULL health_score (ship-gate skipped):');
    for (const t of shippedNoHealth) console.log(`  - ${t.key}`);
  }
  // tasks stuck in 'blocked'
  const blocked = db
    .query(`SELECT key, blocked_reason FROM tasks WHERE status = 'blocked'`)
    .all() as { key: string; blocked_reason: string | null }[];
  if (blocked.length) {
    console.log('\n⚠ blocked task(s):');
    for (const t of blocked) console.log(`  - ${t.key}${t.blocked_reason ? `: ${t.blocked_reason}` : ''}`);
  }
  console.log('\nok — fix structure smells early; never build on faulty foundations.');
}

const HELP = `work — canonical work-tracker store (DB, not md/json)

  work stats
  work task add --key K --title T [--kind feature|bug|spec|chore] [--status todo|spec|architect|dev|test|review|shipped|blocked]
                [--priority P1|P2|P3] [--feature area] [--spec_ref product/SPEC-x.md] [--health_score N] [--owner role]
                [--blocked_reason ..] [--wip_note ..] [--note ..]     (upsert on --key; status change logs an event)
  work task update --key K [--status ..] [--<any column> ..] [--note ..]   (status change logs an event; shipped sets closed_at)
  work task done --key K [--health_score N] [--note ..]                     (status=shipped + closed_at, logs the event)
  work task list [--status S] [--priority P] [--feature F] [--limit N]      (order: priority, status)
  work dep add --task_key K --depends_on_key D
  work event add --task_key K --to_status S [--from_status F] [--note ..]
  work query "SELECT ... "             (SELECT only)
  work maintain                        (structure-smell + counts)

Schema: tasks (key=stable slug) · task_deps · task_events. Append migrations, never edit a shipped one.

HARD GATE (kind='feature' only): status must move one pipeline step at a time
(todo→spec→architect→dev→test→review→shipped; fix-loop test/review/shipped→dev allowed;
'blocked' always allowed both ways). 'task done' additionally requires --health_score >= 8.
Skipping a stage or shipping without a score errors out — spawn the missing stage's
subagent and flip through it, or use --kind chore|bug|spec if the full DAG doesn't apply.`;

// ---- main ------------------------------------------------------------------
const { _, flags } = parseFlags(process.argv.slice(2));
const [a, b] = _;

if (!a || a === 'help' || a === '--help') {
  console.log(HELP);
  process.exit(0);
}

const db = open();
try {
  if (a === 'stats') doStats(db);
  else if (a === 'maintain') doMaintain(db);
  else if (a === 'query') doQuery(db, b ?? die('query needs a SELECT string'));
  else if (a === 'task') {
    if (b === 'add') doTaskAdd(db, flags);
    else if (b === 'update') doTaskUpdate(db, flags);
    else if (b === 'done') doTaskDone(db, flags);
    else if (b === 'list') doTaskList(db, flags);
    else if (b === 'help' || !b) console.log(HELP);
    else die(`unknown verb '${b}' for 'task'`);
  } else if (a === 'dep') {
    if (b === 'add') doDepAdd(db, flags);
    else if (b === 'help' || !b) console.log(HELP);
    else die(`unknown verb '${b}' for 'dep'`);
  } else if (a === 'event') {
    if (b === 'add') doEventAdd(db, flags);
    else if (b === 'help' || !b) console.log(HELP);
    else die(`unknown verb '${b}' for 'event'`);
  } else {
    die(`unknown command '${a}' — try: work help`);
  }
} finally {
  db.close();
}
