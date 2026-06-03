import path from 'path';

import { GROUPS_DIR } from '../config.js';

/** The worker's Rezerver biz-dev data directory (the ingest source). */
export const REZERVER_DIR = path.join(GROUPS_DIR, 'worker', 'rezerver');

export const SOURCE_FILES = {
  venues: path.join(REZERVER_DIR, 'venue_pipeline.json'),
  referrals: path.join(REZERVER_DIR, 'referral_pipeline.json'),
  media: path.join(REZERVER_DIR, 'media_pipeline.json'),
  fbGroups: path.join(REZERVER_DIR, 'facebook_group_log.md'),
  state: path.join(REZERVER_DIR, 'state.json'),
};

/** Host-written snapshot the worker reads in-context (Phase B). */
export const CRM_EXPORT_DIR = path.join(REZERVER_DIR, '.crm-export');
