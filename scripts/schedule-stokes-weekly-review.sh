#!/usr/bin/env bash
# Weekly family review scheduler for Stokes (ag-stokes).
# Runs Friday ~17:00 CET via system cron, picks a random fire-time between
# 18:00-19:00 CET, and inserts a one-shot task into the Stokes session inbound DB.

set -euo pipefail

LOG=/root/nanoclaw-v2/data/stokes-weekly-review-schedule.log
GROUP_ID=e6fdddad-f8a2-4476-9219-5864e9f4e79b
SDB=$(ls -t /root/nanoclaw-v2/data/v2-sessions/$GROUP_ID/sess-*/inbound.db 2>/dev/null | head -1 || true)
if [[ -z "$SDB" ]]; then
  echo "$(date): SKIP — no stokes session yet" >> "$LOG"
  exit 0
fi

OFFSET_MIN=$(( RANDOM % 61 ))                              # 0-60 min after 18:00
HOUR=$(( (18 * 60 + OFFSET_MIN) / 60 ))
MIN=$(( (18 * 60 + OFFSET_MIN) % 60 ))
LOCAL_TIME=$(printf "%02d:%02d:00" "$HOUR" "$MIN")
TZ_OFFSET=$(date '+%z')
TZ_FMT="${TZ_OFFSET:0:3}:${TZ_OFFSET:3:2}"
TODAY=$(date +%Y-%m-%d)
PROCESS_AFTER=$(date -d "$TODAY $LOCAL_TIME $TZ_FMT" -u +"%Y-%m-%dT%H:%M:%SZ")

NOW_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
if [[ "$PROCESS_AFTER" < "$NOW_UTC" ]]; then
  TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
  PROCESS_AFTER=$(date -d "$TOMORROW $LOCAL_TIME $TZ_FMT" -u +"%Y-%m-%dT%H:%M:%SZ")
fi

TASK_ID="stokes-weekly-review-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
TS_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

EXISTING=$(sqlite3 "$SDB" \
  "SELECT id FROM messages_in WHERE id LIKE 'stokes-weekly-review-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
if [[ -n "$EXISTING" ]]; then
  echo "$(date): SKIP — already scheduled today ($EXISTING)" >> "$LOG"
  exit 0
fi

read -r -d '' PROMPT <<'PROMPT_EOF' || true
[reflect:stokes-weekly-review]

Heti családi review. Olvasd el a CLAUDE.local.md "Heti családi review" szekcióját, és a leírt módon készítsd el a duplikált összegzést:

- `<message to="user">` → feleségnek, Telegram-on @Szandra_stokes_bot DM (Tomi jövő heti programja, közös event-ek, shopping list state)
- `<message to="hub">` prefix `[stokes:weekly-review]` → Tomi felé, a hub továbbít

Forrás: Tomi calendar e heti + jövő heti event-jei, Family/Shared TickTick project, workspace/family-dates.md közelgő dátumai.

Tömör, áttekinthető Markdown. Nincs em-dash, nincs zárókérdés.
PROMPT_EOF

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT COALESCE(MAX(seq),0)+1 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID — fires $PROCESS_AFTER UTC (offset ${OFFSET_MIN}min from 18:00 CET)" >> "$LOG"
