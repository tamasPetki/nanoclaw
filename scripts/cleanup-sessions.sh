#!/usr/bin/env bash
#
# Prune stale session artifacts under data/v2-sessions/ and groups/*/logs/.
# Safe to run while NanoClaw is live — only touches inactive sessions and stale logs.
#
# Usage:  ./scripts/cleanup-sessions.sh [--dry-run]
#
# Removes:
#   - Orphan session dirs   — sess-* on disk with no row in v2.db `sessions`
#   - Archived session dirs — DB row status='archived' AND last_active > 14 days
#   - Stale container logs  — groups/*/logs/container-*.log mtime > 7 days
#                             (v1 leftover; v2 containers use --rm so these are stale)
#
# Active sessions (status='active') are NEVER touched, regardless of last_active.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

CENTRAL_DB="$PROJECT_ROOT/data/v2.db"
SESSIONS_DIR="$PROJECT_ROOT/data/v2-sessions"
GROUPS_DIR="$PROJECT_ROOT/groups"
ARCHIVED_DAYS=14

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

TOTAL_FREED_K=0
TOTAL_REMOVED=0

log() { echo "[cleanup] $*"; }

if [ ! -f "$CENTRAL_DB" ]; then
  log "ERROR: central DB not found at $CENTRAL_DB"
  exit 1
fi
if [ ! -d "$SESSIONS_DIR" ]; then
  log "no sessions dir ($SESSIONS_DIR) — nothing to clean"
  exit 0
fi

remove_dir() {
  local target="$1" reason="$2"
  local sz_k
  sz_k=$(du -sk "$target" 2>/dev/null | cut -f1)
  if $DRY_RUN; then
    log "would remove ($reason): $target (${sz_k}K)"
  else
    rm -rf "$target"
    log "removed ($reason): $target (${sz_k}K)"
  fi
  TOTAL_FREED_K=$((TOTAL_FREED_K + sz_k))
  TOTAL_REMOVED=$((TOTAL_REMOVED + 1))
}

remove_file() {
  local target="$1" reason="$2"
  local sz_k
  sz_k=$(( ($(wc -c < "$target" 2>/dev/null || echo 0) + 1023) / 1024 ))
  if $DRY_RUN; then
    : # too noisy to log every old log file in dry-run
  else
    rm -f "$target"
  fi
  TOTAL_FREED_K=$((TOTAL_FREED_K + sz_k))
  TOTAL_REMOVED=$((TOTAL_REMOVED + 1))
}

# --- 1) Orphan + archived session dirs ---

cutoff_iso=$(date -u -d "${ARCHIVED_DAYS} days ago" +"%Y-%m-%dT%H:%M:%SZ")

while IFS= read -r d; do
  sid=$(basename "$d")
  ag=$(basename "$(dirname "$d")")

  row=$(sqlite3 "$CENTRAL_DB" \
    "SELECT status || '|' || COALESCE(last_active,'') FROM sessions WHERE id='$sid' LIMIT 1" 2>/dev/null || true)

  if [[ -z "$row" ]]; then
    remove_dir "$d" "orphan: no DB row"
    continue
  fi

  status=${row%|*}
  last_active=${row#*|}

  if [[ "$status" == "archived" ]] && [[ -n "$last_active" ]] && [[ "$last_active" < "$cutoff_iso" ]]; then
    remove_dir "$d" "archived >${ARCHIVED_DAYS}d (last_active=$last_active)"
  fi
done < <(find "$SESSIONS_DIR" -mindepth 2 -maxdepth 2 -name 'sess-*' -type d 2>/dev/null)

# --- 2) Stale container logs in groups/*/logs (v1 leftover) ---

stale_logs_count=0
stale_logs_bytes=0
if [ -d "$GROUPS_DIR" ]; then
  while IFS= read -r -d '' f; do
    sz=$(wc -c < "$f" 2>/dev/null || echo 0)
    stale_logs_count=$((stale_logs_count + 1))
    stale_logs_bytes=$((stale_logs_bytes + sz))
    remove_file "$f" "stale container log"
  done < <(find "$GROUPS_DIR"/*/logs -maxdepth 1 -type f -name 'container-*.log' -mtime +7 -print0 2>/dev/null)
fi

# --- Summary ---

if [ "$stale_logs_count" -gt 0 ]; then
  log "stale container logs: $stale_logs_count files (~$((stale_logs_bytes / 1024))K)"
fi

if $DRY_RUN; then
  log "DRY RUN complete — would remove $TOTAL_REMOVED items, free ~${TOTAL_FREED_K}K"
else
  log "Done — removed $TOTAL_REMOVED items, freed ~${TOTAL_FREED_K}K"
fi
