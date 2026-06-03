/**
 * Parser for groups/worker/rezerver/facebook_group_log.md.
 *
 * The file is hand-maintained markdown: blocks separated by a line of `---`,
 * each block starting `### <group name>`, followed by `- **Key:** value`
 * bullets and nested `  - YYYY-MM-DD: …` action/incident lines.
 *
 * Robustness over strictness: this MUST NOT throw on a malformed block. A
 * parse miss degrades to "we still have the raw text" (raw_block), never to
 * data loss. Unknown join-status labels default to NOT_YET_REQUESTED.
 */

export interface ParsedFbGroup {
  id: string;
  name: string;
  url: string | null;
  members: string | null;
  category: string | null;
  relevance_score: number | null;
  join_status: string;
  approval_date: string | null;
  warmup_phase: string | null;
  language: string | null;
  group_kind: string | null;
  discovered: string | null;
  notes: string | null;
  actions_log: { date: string | null; text: string }[];
  incidents: { date: string | null; text: string }[];
  raw_block: string;
}

const JOIN_STATUSES = ['NOT_YET_REQUESTED', 'PENDING', 'APPROVED', 'DENIED', 'JOINED'];

/** Strip diacritics + lowercase for tolerant key matching. */
function normKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function extractFbId(url: string | null, name: string): string {
  if (url) {
    const m = url.match(/groups\/([^/?#]+)/);
    if (m) return m[1];
  }
  return slug(name) || 'unknown';
}

function parseDatedLine(line: string): { date: string | null; text: string } {
  const m = line.match(/^(\d{4}-\d{2}-\d{2})\s*:\s*(.*)$/);
  if (m) return { date: m[1], text: m[2].trim() };
  return { date: null, text: line.trim() };
}

export function parseFbLog(content: string): ParsedFbGroup[] {
  const groups: ParsedFbGroup[] = [];
  const allLines = content.split('\n');

  // A block runs from each `### <name>` header to the next `###`/`##`/`#`
  // header (or EOF). This handles both `---`-separated blocks AND consecutive
  // `### ` blocks with no separator between them.
  const headerIdxs: number[] = [];
  allLines.forEach((l, i) => {
    if (/^###\s+/.test(l)) headerIdxs.push(i);
  });

  for (let h = 0; h < headerIdxs.length; h++) {
    const start = headerIdxs[h];
    let end = allLines.length;
    for (let i = start + 1; i < allLines.length; i++) {
      if (/^#{1,3}\s/.test(allLines[i])) {
        end = i;
        break;
      }
    }
    const lines = allLines.slice(start, end);
    const raw = lines.join('\n');
    const headerIdx = 0;
    const name = lines[headerIdx].replace(/^###\s+/, '').trim();
    if (!name) continue;

    const g: ParsedFbGroup = {
      id: '',
      name,
      url: null,
      members: null,
      category: null,
      relevance_score: null,
      join_status: 'NOT_YET_REQUESTED',
      approval_date: null,
      warmup_phase: null,
      language: null,
      group_kind: null,
      discovered: null,
      notes: null,
      actions_log: [],
      incidents: [],
      raw_block: raw.trim(),
    };

    let collecting: 'actions' | 'incidents' | null = null;

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      // Nested action/incident line: starts with whitespace + `-`.
      if (collecting && /^\s+-\s+/.test(line)) {
        const text = line.replace(/^\s+-\s+/, '').trim();
        const entry = parseDatedLine(text);
        if (collecting === 'actions') g.actions_log.push(entry);
        else g.incidents.push(entry);
        continue;
      }

      const kv = line.match(/^-\s+\*\*(.+?):\*\*\s*(.*)$/);
      if (!kv) continue;
      const key = normKey(kv[1]);
      const val = kv[2].trim();

      if (/akciok|akcio|actions/.test(key)) {
        collecting = 'actions';
        continue;
      }
      if (/incident/.test(key)) {
        collecting = 'incidents';
        continue;
      }
      collecting = null;

      if (/(^| )url|id \/ url|^id$/.test(key)) g.url = val || g.url;
      else if (/tagsag|members/.test(key)) g.members = val;
      else if (/tipus|type/.test(key)) g.group_kind = val;
      else if (/nyelv|language/.test(key)) g.language = val;
      else if (/kategoria|category/.test(key)) g.category = val;
      else if (/relevancia|relevance/.test(key)) {
        const n = parseInt(val, 10);
        g.relevance_score = Number.isFinite(n) ? n : null;
      } else if (/csatlakoz|join|statusz|status/.test(key)) {
        const up = val.toUpperCase().replace(/[^A-Z_]/g, '');
        g.join_status = JOIN_STATUSES.find((s) => up.includes(s)) || 'NOT_YET_REQUESTED';
      } else if (/approval/.test(key)) g.approval_date = val || null;
      else if (/warmup|fazis|phase/.test(key) && !/phase-action/.test(key)) g.warmup_phase = val || null;
      else if (/discovered/.test(key)) g.discovered = val || null;
      else if (/jegyzet|note/.test(key)) g.notes = val || null;
    }

    g.id = extractFbId(g.url, name);
    groups.push(g);
  }

  return groups;
}
