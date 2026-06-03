import type Database from 'better-sqlite3';

import { migration001 } from './001-init.js';
import { migration002 } from './002-enrich.js';

export interface CrmMigration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

export const crmMigrations: CrmMigration[] = [migration001, migration002];
