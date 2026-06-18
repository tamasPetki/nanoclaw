#!/bin/bash
# Silent-failure watchdog for the autonomous agents that now report on their own
# Telegram bots (worker, Hex). If an agent's expected daily cron produced no
# output by check-time, DM Tomi an alert via that agent's bot token. Runs from
# system cron — independent of the nanoclaw service, so it fires even if the
# service is down (the alert uses the Telegram bot API directly via curl).
#
# Usage: agent-watchdog.sh <worker|hex|axiom|drift>
#
# DRY_RUN: if the DRY_RUN env var is non-empty, the alert branch echoes the
# alert text to stdout instead of curl-ing Telegram (so the change can be
# verified without spamming Tomi).
set -euo pipefail
cd "$(dirname "$0")/.."

AGENT="${1:?usage: agent-watchdog.sh <worker|hex|axiom|drift>}"
TOMI_CHAT=1243781160

case "$AGENT" in
  worker)
    DB="data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/outbound.db"
    H=17; M=30; LABEL="A worker"; SCHED="17:30 (esti growth session)"
    TOKEN=$(grep '^TELEGRAM_BOT_TOKEN_WORKER=' .env | cut -d= -f2-) ;;
  hex)
    DB="data/v2-sessions/eb0d9b93-9b35-4b94-b686-d58f5df90300/sess-1779896427881-2kadcg/outbound.db"
    H=9; M=0; LABEL="Hex"; SCHED="9:00 (napi session)"
    TOKEN=$(grep '^TELEGRAM_BOT_TOKEN_HEX=' .env | cut -d= -f2-) ;;
  axiom)
    # Session dirs are NOT stable for shift agents (switch-project rotates
    # them), so resolve the newest session dir dynamically instead of
    # hardcoding the sess- path.
    DB="$(ls -dt data/v2-sessions/ag-shift-lead/sess-*/ 2>/dev/null | head -1)outbound.db"
    H=9; M=0; LABEL="Axiom"; SCHED="9:00 (reggeli digest)"
    TOKEN=$(grep '^TELEGRAM_BOT_TOKEN_AXIOM=' .env | cut -d= -f2-) ;;
  drift)
    # Drift has no bot of its own → reuse Axiom's token for the alert.
    DB="$(ls -dt data/v2-sessions/ag-shift-growth/sess-*/ 2>/dev/null | head -1)outbound.db"
    H=5; M=0; LABEL="Drift"; SCHED="5:00 (éjszakai intel)"
    TOKEN=$(grep '^TELEGRAM_BOT_TOKEN_AXIOM=' .env | cut -d= -f2-) ;;
  *) echo "ismeretlen agent: $AGENT"; exit 2 ;;
esac

# Compare latest outbound (local) against today's expected cron time (local).
# All conversion happens in SQL to avoid timezone parsing bugs.
STATUS=$(python3 - "$DB" "$H" "$M" <<'PY'
import sqlite3, sys
db, h, m = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
try:
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    q = ("SELECT CASE WHEN (SELECT max(datetime(timestamp,'localtime')) FROM messages_out) "
         ">= datetime('now','localtime','start of day','+%d hours','+%d minutes') "
         "THEN 'OK' ELSE 'MISSING' END" % (h, m))
    print(con.execute(q).fetchone()[0] or 'MISSING')
    con.close()
except Exception as e:
    print(f"ERR:{e}")
PY
)

TS=$(date '+%F %T')
if [ "$STATUS" = "MISSING" ]; then
  TEXT="⚠️ Watchdog: ${LABEL} ma nem adott ki semmilyen kimenetet a várt ${SCHED} után. Lehet hogy a cron nem futott le vagy a konténer elakadt — érdemes ránézni."
  if [ -n "${DRY_RUN:-}" ]; then
    echo "$TS DRY_RUN would alert ($AGENT): $TEXT"
  else
    curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage" \
      --data-urlencode "chat_id=${TOMI_CHAT}" \
      --data-urlencode "text=${TEXT}" >/dev/null && echo "$TS ALERT sent: $AGENT"
  fi
elif [ "$STATUS" = "OK" ]; then
  echo "$TS OK: $AGENT"
else
  echo "$TS check error ($AGENT): $STATUS"
fi
