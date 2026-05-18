#!/usr/bin/env bash
# Daily birthday/anniversary check for Stokes (ag-stokes).
# Runs every morning at 08:00 CET via system cron, fires immediately
# (no random offset — short, deterministic task).

set -euo pipefail

LOG=/root/nanoclaw-v2/data/stokes-birthday-check-schedule.log
GROUP_ID=e6fdddad-f8a2-4476-9219-5864e9f4e79b
SDB=$(ls -t /root/nanoclaw-v2/data/v2-sessions/$GROUP_ID/sess-*/inbound.db 2>/dev/null | head -1 || true)
if [[ -z "$SDB" ]]; then
  echo "$(date): SKIP — no stokes session yet" >> "$LOG"
  exit 0
fi

PROCESS_AFTER=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TASK_ID="stokes-birthday-check-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
TS_NOW="$PROCESS_AFTER"

EXISTING=$(sqlite3 "$SDB" \
  "SELECT id FROM messages_in WHERE id LIKE 'stokes-birthday-check-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
if [[ -n "$EXISTING" ]]; then
  echo "$(date): SKIP — already scheduled today ($EXISTING)" >> "$LOG"
  exit 0
fi

read -r -d '' PROMPT <<'PROMPT_EOF' || true
[reflect:stokes-birthday-check]

Napi b-day/évforduló check. Olvasd el a `workspace/family-dates.md`-t és a CLAUDE.local.md "Napi b-day check" szekcióját.

Számold ki: van-e olyan bejegyzés ami pontosan 1, 3 vagy 7 nap múlva esedékes? Egyaránt vizsgáld a `--MM-DD` (éves ismétlődés) és `YYYY-MM-DD` (egyszeri) formátumot.

- Ha NINCS: csendben befejezed. NE küldj semmit.
- Ha VAN: rövid emlékeztető `<message to="user">` (feleség, Telegram) ÉS `<message to="hub">` prefix `[stokes:birthday-warning]` (Tomi felé). Pl. "Tisztelettel emlékeztetem, hogy 3 nap múlva (szombat) lesz X születésnapja."

Tömör, 1-2 mondat. Nincs em-dash, nincs zárókérdés.
PROMPT_EOF

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT COALESCE(MAX(seq),0)+1 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID" >> "$LOG"
