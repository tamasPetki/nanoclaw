import { initDb, getDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrations/index.js';
import { writeDestinations } from '../src/modules/agent-to-agent/write-destinations.js';
import { getSessionsByAgentGroup } from '../src/db/sessions.js';
import path from 'path';

const dbPath = path.resolve('./data/v2.db');
initDb(dbPath);
runMigrations(getDb());

for (const ag of ['ag-hub', 'ag-worker']) {
  const sessions = getSessionsByAgentGroup(ag);
  for (const sess of sessions) {
    writeDestinations(ag, sess.id);
    console.log(`Wrote destinations for ${ag} / ${sess.id}`);
  }
}
