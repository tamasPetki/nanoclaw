/**
 * Work DB schema — versioned migrations (CORE tool, project-agnostic).
 *
 * Shared by the container CLI (`work.ts`, bun:sqlite) and the host init/inspect
 * (`scripts/init-work-db.ts`, better-sqlite3). Pure data — NO runtime imports —
 * so both Node (tsx) and Bun can import it.
 *
 * Growth rule (Tomi, 2026-06-15): structured/growing data lives in this DB, never
 * in md/json files. The schema is designed to evolve — append a new {version} here,
 * never edit a shipped migration. Both runtimes apply pending migrations on startup
 * via PRAGMA user_version (idempotent).
 *
 * The schema is product-agnostic (tasks / task_deps / task_events — the design-sprint
 * → build work-tracker for the Axiom lead) so it carries across projects; only the DB
 * *data* is per-project and archives on switch-project.
 */
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'init',
    sql: `
      CREATE TABLE IF NOT EXISTS tasks (
        id            INTEGER PRIMARY KEY,
        key           TEXT NOT NULL UNIQUE,        -- stable slug (bead-id analog); upsert key
        title         TEXT NOT NULL,
        kind          TEXT NOT NULL DEFAULT 'feature', -- feature | bug | spec | chore
        status        TEXT NOT NULL DEFAULT 'todo',    -- todo|spec|architect|dev|test|review|shipped|blocked
        priority      TEXT,                        -- P1 | P2 | P3
        feature       TEXT,                        -- pillar / area
        spec_ref      TEXT,                        -- path to a SPEC-*.md
        health_score  INTEGER,                     -- set at review / ship-gate
        wip_note      TEXT,                        -- mid-build checkpoint (WS4)
        blocked_reason TEXT,
        owner         TEXT,                        -- subagent role
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
        closed_at     TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

      CREATE TABLE IF NOT EXISTS task_deps (
        id             INTEGER PRIMARY KEY,
        task_key       TEXT NOT NULL,
        depends_on_key TEXT NOT NULL,
        created_at     TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(task_key, depends_on_key)
      );
      CREATE INDEX IF NOT EXISTS idx_deps_task ON task_deps(task_key);

      CREATE TABLE IF NOT EXISTS task_events (
        id          INTEGER PRIMARY KEY,
        task_key    TEXT NOT NULL,
        from_status TEXT,
        to_status   TEXT,
        note        TEXT,
        at          TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_events_task ON task_events(task_key);
    `,
  },
];

/** Apply pending migrations. `db` is any object with .exec()/.pragma()-equivalent. */
export function runMigrations(
  exec: (sql: string) => void,
  getUserVersion: () => number,
  setUserVersion: (v: number) => void,
): number {
  let current = getUserVersion();
  const pending = MIGRATIONS.filter((m) => m.version > current).sort((a, b) => a.version - b.version);
  for (const m of pending) {
    exec(m.sql);
    setUserVersion(m.version);
    current = m.version;
  }
  return current;
}
