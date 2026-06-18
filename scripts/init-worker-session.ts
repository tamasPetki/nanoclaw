import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { resolveSession } from '../src/session-manager.js';
import path from 'path';

const dbPath = path.resolve('./data/v2.db');
initDb(dbPath);
runMigrations(getDb());

// Worker has NO messaging_group wire — agent-shared mode for autonomous-only sessions.
const { session, created } = resolveSession('ag-worker', null, null, 'agent-shared');
console.log(JSON.stringify({ id: session.id, created }));
