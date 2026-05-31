#!/usr/bin/env bash
# Daily Reddit warmup scheduler for u/lloyd_bt (BullTrapp persona).
# Runs every morning ~08:00 CET via system cron (one hour offset from the
# rezerver/Dani warmup at 07:00), picks a random fire-time between
# 09:00-11:00 CET, and inserts a one-shot task into the Worker session
# inbound DB. The host sweep loop (60s) wakes the agent at process_after.

set -euo pipefail

LOG=/root/nanoclaw-v2/data/bulltrapp-reddit-warmup-schedule.log
SDB=/root/nanoclaw-v2/data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/inbound.db

# ── HARD STOP 2026-05-31 ──────────────────────────────────────────────────
# u/lloyd_bt is SHADOWBANNED on Reddit (Tomi confirmed). No more warmup runs —
# every session on a shadowbanned account is wasted risk and surfaces nothing.
# This guard short-circuits the daily scheduler even though the crontab line
# still fires; remove it (and flip account_status in bulltrapp/state.json)
# only if Tomi explicitly clears the account or moves to a fresh one. See also
# groups/worker/bulltrapp/platforms/reddit.md top banner.
echo "$(date): SKIP — u/lloyd_bt shadowbanned (hard stop 2026-05-31)" >> "$LOG"
exit 0
# ──────────────────────────────────────────────────────────────────────────

# Random offset: 60-180 minutes after 08:00 local → fires 09:00-11:00 local.
OFFSET_MIN=$(( 60 + RANDOM % 121 ))
HOUR=$(( (8 * 60 + OFFSET_MIN) / 60 ))
MIN=$(( (8 * 60 + OFFSET_MIN) % 60 ))
LOCAL_TIME=$(printf "%02d:%02d:00" "$HOUR" "$MIN")
TZ_OFFSET=$(date '+%z')                       # +0200 (CEST) or +0100 (CET)
TZ_FMT="${TZ_OFFSET:0:3}:${TZ_OFFSET:3:2}"    # +02:00 / +01:00
TODAY=$(date +%Y-%m-%d)
PROCESS_AFTER=$(date -d "$TODAY $LOCAL_TIME $TZ_FMT" -u +"%Y-%m-%dT%H:%M:%SZ")

# If the computed time is already past (script ran late), schedule for tomorrow.
NOW_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
if [[ "$PROCESS_AFTER" < "$NOW_UTC" ]]; then
  TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
  PROCESS_AFTER=$(date -d "$TOMORROW $LOCAL_TIME $TZ_FMT" -u +"%Y-%m-%dT%H:%M:%SZ")
fi

TASK_ID="bulltrapp-reddit-warmup-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
TS_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Idempotency — skip if today's BullTrapp warmup task already scheduled.
# Prefix-szel disambiguálva a rezerver/Dani warmuptól (reddit-warmup-* vs bulltrapp-reddit-warmup-*).
EXISTING=$(sqlite3 "$SDB" \
  "SELECT id FROM messages_in WHERE id LIKE 'bulltrapp-reddit-warmup-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
if [[ -n "$EXISTING" ]]; then
  echo "$(date): SKIP — already scheduled today ($EXISTING)" >> "$LOG"
  exit 0
fi

# ── Prompt ───────────────────────────────────────────────────────────────────
# Vékony orchestrate-prompt. A lépésenkénti flow, day-policy, bash parancsok,
# STOP-pingek mind a `groups/worker/bulltrapp/platforms/reddit.md` "Daily warmup
# playbook" szekciójában élnek. Rövid prompt = kisebb context = kisebb esély
# hogy az SDK auto-compactingba csap a riport előtt
# (lásd memory: feedback_v2_poll_loop_context_compact_stuck.md).
read -r -d '' PROMPT <<'PROMPT_EOF' || true
[Reddit warmup session — u/lloyd_bt, BullTrapp persona]

Olvasd el a `bulltrapp/platforms/reddit.md` "Daily warmup playbook" szekcióját + `bulltrapp/state.json`-ban a `reddit` blokkot. A 10 lépéses flow, day-szám-policy és STOP-pingek mind ott vannak — kövesd pontosan.

FONTOS — Dani vs Lloyd disambiguáció:
- A `bulltrapp/` mappa Lloyd persona; a `BT_REDDIT_*` env-eket használd, NEM a sima `REDDIT_*`-et (Dani-é).
- Cookie file: `/workspace/agent/.reddit-cookies-lloyd_bt.json`.
- Proxy: `BT_REDDIT_PROXY` — Verizon FiOS US residential, sticky session `lloydverify` (NEM Dani HU-sticky-jával).
- A reflektív riport prefixe `[reflect:bulltrapp]` (NEM `[reflect:rezerver]`).

Két kritikus pont amitől nem szabad eltérni:

1. **Step 5: Korai indítás-jelzés a hubnak.** A subreddit-pick UTÁN, a lurk ELŐTT küldj `[reflect:bulltrapp]` prefixű egy mondatot Lloyd hangon (EN). Még akkor is ha később bármi elromlik.

2. **Step 8: Záró reflektív riport.** A state-update UTÁN, a cookie-dump ELŐTT küldd ki. A riport fontosabb mint a cookie-dump (az holnapig elbírja).

A day-szám-policy hardlimit. Ne posztolj, ne kommentelj, ne subscribe-olj. Cookie-restore session, NEM login. Bármi anomália → STOP + Tomi-ping (lista a doksiban). Phase-váltás CSAK Tomi explicit zöld jelével.
PROMPT_EOF

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT COALESCE(MAX(seq),0)+1 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID — fires $PROCESS_AFTER UTC (offset ${OFFSET_MIN}min from 08:00 CET)" >> "$LOG"
