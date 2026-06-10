import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { resolveSession } from '../src/session-manager.js';
import path from 'path';

const dbPath = path.resolve('./data/v2.db');
initDb(dbPath);
runMigrations(getDb());

const TG_MG = 'mg-1778050817473-lyyb7c';
const { session, created } = resolveSession('ag-hub', TG_MG, null, 'shared');
console.log(JSON.stringify({ id: session.id, created }));
