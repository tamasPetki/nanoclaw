import type Database from 'better-sqlite3';

import { migration001 } from './001-init.js';
import { migration002 } from './002-enrich.js';
import { migration003 } from './003-warmup-state.js';
import { migration004 } from './004-country.js';

export interface CrmMigration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

export const crmMigrations: CrmMigration[] = [migration001, migration002, migration003, migration004];
