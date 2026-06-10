#!/usr/bin/env bash
# Daily disk cleanup + alert if still critical after cleanup.
# Cron: 0 3 * * * /root/nanoclaw-v2/scripts/disk-cleanup.sh
set -euo pipefail

LOG=/root/nanoclaw-v2/logs/disk-cleanup.log
THRESHOLD=85
mkdir -p "$(dirname "$LOG")"

{
  echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="
  echo "--- before ---"
  df -h /
  docker system df 2>/dev/null || true
} >> "$LOG"

# --- Docker cleanup (medium aggressiveness) ---
{
  echo "--- container prune ---"
  docker container prune -f 2>&1 | tail -3
  echo "--- image prune (>168h unused) ---"
  docker image prune -af --filter "until=168h" 2>&1 | tail -3
  echo "--- builder cache prune (keep 2GB) ---"
  docker builder prune -f --reserved-space 2GB 2>&1 | tail -3
} >> "$LOG" 2>&1

# --- Session artifact cleanup (existing script) ---
{
  echo "--- session cleanup ---"
  bash /root/nanoclaw-v2/scripts/cleanup-sessions.sh 2>&1 | tail -5 || true
} >> "$LOG" 2>&1

# --- After-state ---
USAGE=$(df / | awk 'NR==2{print $5}' | tr -d '%')
{
  echo "--- after ---"
  df -h /
  echo "Usage after: ${USAGE}%"
} >> "$LOG"

# --- Alert if still above threshold ---
if [ "$USAGE" -gt "$THRESHOLD" ]; then
  HUB_GROUP_ID=$(sqlite3 /root/nanoclaw-v2/data/v2.db \
    "SELECT id FROM agent_groups WHERE folder='hub' LIMIT 1" 2>/dev/null || true)
  if [[ -z "$HUB_GROUP_ID" ]]; then
    echo "ALERT SKIP: no hub group_id" >> "$LOG"
  else
    SDB=$(ls -t /root/nanoclaw-v2/data/v2-sessions/$HUB_GROUP_ID/sess-*/inbound.db 2>/dev/null | head -1 || true)
    if [[ -z "$SDB" ]]; then
      echo "ALERT SKIP: no hub session inbound.db" >> "$LOG"
    else
      EXISTING=$(sqlite3 "$SDB" \
        "SELECT id FROM messages_in WHERE id LIKE 'disk-alert-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
      if [[ -n "$EXISTING" ]]; then
        echo "ALERT SKIP: already scheduled today ($EXISTING)" >> "$LOG"
      else
        TASK_ID="disk-alert-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
        TS_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        DF_SUMMARY=$(df -h / | tail -1)
        TOP_HOGS=$(du -sh /root/data/gdrive-* 2>/dev/null | sort -h | tail -5 || echo "n/a")

        read -r -d '' PROMPT <<PROMPT_EOF || true
[disk-alert]

A VPS root partition ${USAGE}%-on van a napi auto-cleanup UTÁN is. Manuális beavatkozás kell.

df:
$DF_SUMMARY

gdrive top hogyók:
$TOP_HOGS

Tomi felé: küldj rövid Telegram DM-et (1-2 mondat, nincs em-dash, nincs zárókérdés) hogy nézze meg manuálisan. Javaslat sorrend: gdrive sync méretek (jelenleg domináns), aztán docker system df.
PROMPT_EOF
        CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
        NEXT_SEQ=$(sqlite3 "$SDB" "SELECT COALESCE(MAX(seq),0)+1 FROM messages_in")
        ESC=$(printf '%s' "$CONTENT" | sed "s/'/''/g")
        sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$TS_NOW', NULL, 1, '$ESC');"
        echo "ALERT: hub DM scheduled ($TASK_ID)" >> "$LOG"
      fi
    fi
  fi
else
  echo "Below threshold (${USAGE}% <= ${THRESHOLD}%), no alert." >> "$LOG"
fi

echo "" >> "$LOG"
