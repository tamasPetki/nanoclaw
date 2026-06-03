/**
 * Host-written snapshot of the CRM DB into the worker's workspace, so the agent
 * can load the full pipeline in-context (microsecond-fast) without touching the
 * DB file. Writes go the other way — through `ncl rezerver` (host applies them).
 *
 * The host process runs as root; the container runs as UID 1000. Files written
 * here must be chowned to 1000:1000 or the worker gets EACCES on read.
 */
import fs from 'fs';

import { log } from '../log.js';
import { getCrmDb } from './db.js';
import { CRM_EXPORT_DIR } from './paths.js';

const CONTAINER_UID = 1000;
const CONTAINER_GID = 1000;

function writeOwned(path: string, content: string): void {
  fs.writeFileSync(path, content);
  try {
    fs.chownSync(path, CONTAINER_UID, CONTAINER_GID);
  } catch {
    /* not root / not applicable — ignore */
  }
}

export function exportCrmSnapshot(): void {
  try {
    const db = getCrmDb();
    fs.mkdirSync(CRM_EXPORT_DIR, { recursive: true });
    try {
      fs.chownSync(CRM_EXPORT_DIR, CONTAINER_UID, CONTAINER_GID);
    } catch {
      /* ignore */
    }

    const dump: Record<string, unknown[]> = {
      venues: db.prepare('SELECT * FROM crm_venues ORDER BY tier, name').all(),
      partners: db.prepare('SELECT * FROM crm_referral_partners ORDER BY tier, name').all(),
      media: db.prepare('SELECT * FROM crm_media_outlets ORDER BY site').all(),
      fb_groups: db
        .prepare('SELECT id,name,join_status,relevance_score,warmup_phase,next_action FROM crm_fb_groups ORDER BY name')
        .all(),
      outreach: db.prepare("SELECT * FROM crm_outreach WHERE status NOT IN ('closed') ORDER BY created_at DESC").all(),
      tasks: db.prepare('SELECT * FROM crm_tasks WHERE done = 0 ORDER BY due_at').all(),
    };

    for (const [name, rows] of Object.entries(dump)) {
      writeOwned(`${CRM_EXPORT_DIR}/${name}.json`, JSON.stringify(rows, null, 2));
    }
    writeOwned(
      `${CRM_EXPORT_DIR}/README.md`,
      [
        '# CRM export (host-generated, READ-ONLY)',
        '',
        'Ezek a fájlok a `data/rezerver-crm.db` host-oldali pillanatképei — a host írja, te OLVASOD.',
        'NE szerkeszd őket kézzel: a tartós állapotot `ncl rezerver ... set/add`-del írd (a host alkalmazza a DB-be),',
        'és a következő pillanatkép automatikusan frissül. A mezőkről: `ncl rezerver schema`.',
        '',
        `Frissítve: ${new Date().toISOString()}`,
      ].join('\n'),
    );
  } catch (err) {
    log.error('CRM snapshot export failed', { err });
  }
}
