/**
 * Sanitized projection of groups/worker/rezerver/state.json for the CRM
 * ops/account-health view.
 *
 * SECURITY: state.json holds operational secrets (session cookies, fresh `xs`
 * tokens, proxy session ids, browser fingerprint, verification codes). Those
 * must NEVER leave the host. This module allowlists safe fields and hard-strips
 * known-sensitive keys, so the /api/ops endpoint can only ever expose
 * non-secret warmup/health telemetry.
 */

// Keys whose values are secret/operationally sensitive — stripped anywhere.
const SECRET_KEY_RE =
  /cookie|fresh_xs|^xs$|proxy_session|fingerprint|password|secret|token|registration_attempt|email|\bip\b/i;

// Value-level scrubber: free-text fields (incident notes etc.) sometimes paste
// real credential VALUES inline (e.g. "xs: 12%3AfB-3..."), which key-level
// stripping can't catch. Redact token-shaped substrings as defense-in-depth.
//
// Two tiers. The "inline credential" patterns are high-signal secret shapes
// (FB session tokens, cookie assignments) that never false-positive on normal
// business text/URLs — safe to apply to ALL endpoints (see server.ts). The
// extra "long opaque blob" pattern is aggressive (would mangle long URL slugs)
// so it's reserved for the ops endpoint where any opaque token is suspect.
const FB_SESSION_RE = /\d+%3A[A-Za-z0-9._%/+\-]{6,}/g; // xs token, URL-encoded
const COOKIE_ASSIGN_RE = /\b(?:xs|c_user|datr|sb|fr|presence|hsi|wd|access_token)\s*[:=]\s*[A-Za-z0-9._%/+\-]{6,}/gi;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_\-]{32,}\b/g; // opaque base64-ish blobs (ops-only)

/** Light scrub — high-signal credential shapes only. Safe for business data. */
export function scrubInlineCredentials(s: string): string {
  return s.replace(FB_SESSION_RE, '[REDACTED]').replace(COOKIE_ASSIGN_RE, '[REDACTED]');
}

/** Strict scrub — adds the aggressive opaque-blob rule. Ops endpoint only. */
function scrubSecrets(s: string): string {
  return scrubInlineCredentials(s).replace(LONG_TOKEN_RE, '[REDACTED]');
}

function deepStrip<T>(value: T): T {
  if (typeof value === 'string') return scrubSecrets(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepStrip(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_RE.test(k)) continue;
      out[k] = deepStrip(v);
    }
    return out as unknown as T;
  }
  return value;
}

export interface OpsProjection {
  date: string | null;
  phase: string | null;
  phase_description: string | null;
  goal_current: string | null;
  facebook: {
    warmup_phase: unknown;
    warmup_started_at: unknown;
    warmup_ends_at: unknown;
    daily: unknown;
    weekly: unknown;
    incidents: unknown;
  };
  reddit: unknown;
  pipeline_counters: unknown;
}

export function sanitizeOps(state: Record<string, any>): OpsProjection {
  const projection: OpsProjection = {
    date: state.date ?? null,
    phase: state.phase ?? null,
    phase_description: state.phase_description ?? null,
    goal_current: state.goal_current ?? null,
    facebook: {
      warmup_phase: state.fb_warmup_phase ?? null,
      warmup_started_at: state.fb_warmup_phase_started_at ?? null,
      warmup_ends_at: state.fb_warmup_phase_ends_at ?? null,
      daily: deepStrip(state.fb_daily_actions ?? null),
      weekly: deepStrip(state.fb_weekly_stats ?? null),
      incidents: deepStrip(state.fb_incidents ?? []),
    },
    reddit: deepStrip(state.reddit ?? null),
    pipeline_counters: state.pipeline_counters ?? null,
  };
  // Final pass: scrub every string leaf (catches free-text phase_description /
  // goal_current and any inline credential value missed above).
  return deepStrip(projection);
}

/** Account-health snapshots for the DB (history-preserving). */
export function accountHealthSnapshots(state: Record<string, any>): {
  platform: string;
  account: string | null;
  warmup_phase: string | null;
  incident_count: number;
  daily_stats: unknown;
  weekly_stats: unknown;
  raw: unknown;
}[] {
  const ops = sanitizeOps(state);
  return [
    {
      platform: 'facebook',
      account: 'dani',
      warmup_phase: state.fb_warmup_phase != null ? String(state.fb_warmup_phase) : null,
      incident_count: Array.isArray(state.fb_incidents) ? state.fb_incidents.length : 0,
      daily_stats: ops.facebook.daily,
      weekly_stats: ops.facebook.weekly,
      raw: ops.facebook,
    },
    {
      platform: 'reddit',
      account: state.reddit?.username_target ?? null,
      warmup_phase: state.reddit?.phase ?? null,
      incident_count: 0,
      daily_stats: null,
      weekly_stats: null,
      raw: ops.reddit,
    },
  ];
}
