import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const run = (args) => {
  try {
    const out = execFileSync('ncl', args, { encoding: 'utf8', cwd: '/workspace/agent' });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') + (e.message || '') };
  }
};

const toFlags = (entry, { booleanKeys = [] } = {}) => {
  const flags = [];
  for (const [k, v] of Object.entries(entry)) {
    if (v === null || v === undefined || v === '') continue;
    let val = v;
    if (Array.isArray(val)) val = val.join(',');
    else if (booleanKeys.includes(k) || typeof val === 'boolean') val = val ? 1 : 0;
    flags.push('--' + k.replace(/_/g, '-'), String(val));
  }
  return flags;
};

const idFrom = (out) => {
  try { const m = out.match(/"id"\s*:\s*(\d+)/); return m ? m[1] : '?'; } catch { return '?'; }
};

// --- VENUES (uk_venues.json) ---
const venues = JSON.parse(readFileSync('/workspace/agent/rezerver/uk_venues.json', 'utf8'));
console.log(`\n=== VENUE MIGRATION (${venues.length}) ===`);
for (const v of venues) {
  const flags = toFlags(v, { booleanKeys: ['needs_verification'] });
  const r = run(['rezerver', 'venue-add', ...flags]);
  if (r.ok) console.log(`OK  venue "${v.name}" (${v.city}) -> id ${idFrom(r.out)}`);
  else console.log(`ERR venue "${v.name}" (${v.city}): ${r.out.trim().split('\n').slice(-1)[0]}`);
}

// --- PARTNERS / SUBCONTRACTORS (subcontractors.json) ---
const partners = JSON.parse(readFileSync('/workspace/agent/rezerver/subcontractors.json', 'utf8'));
console.log(`\n=== PARTNER MIGRATION (${partners.length}) ===`);
for (const p of partners) {
  const flags = toFlags(p);
  const r = run(['rezerver', 'partner-add', ...flags]);
  if (r.ok) console.log(`OK  partner "${p.name}" [${p.specialization}] -> id ${idFrom(r.out)}`);
  else console.log(`ERR partner "${p.name}": ${r.out.trim().split('\n').slice(-1)[0]}`);
}
console.log('\n=== DONE ===');
