#!/usr/bin/env bash
# Daily Facebook warmup scheduler for Dani Bene (user_id 61569002698901).
# Runs every afternoon ~17:00 CET via system cron, picks a random fire-time
# between 18:00-21:00 CET, and inserts a one-shot task into the Rezerver
# session inbound DB. The host sweep loop (60s) wakes the agent at process_after.
#
# Window choice (20:00-22:00 CET) — magyar FB-peak: vacsora utáni böngészés,
# legrealisztikusabb pattern egy HU HoReCa-tulajdonosnak.
#
# 2026-07-17: az ablak 18:00-21:00-ról 20:00-22:00-ra tolva. Az esti growth
# 17:30-ról 19:00-ra került (a 17:00-s HU venue-sáv miatt), így belelógott a
# régi ablakba. Egy sessionben a taskok sorban futnak, tehát a warmup csak
# csúszott volna — de épp az időzítés élethűsége a lényege, ezért inkább
# mögé tesszük. Ha a growth ideje megint változik, ezt igazítsd vele.

set -euo pipefail

LOG=/root/nanoclaw-v2/data/fb-warmup-schedule.log
SDB=/root/nanoclaw-v2/data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/inbound.db

# Random offset: 180-300 minutes after 17:00 local → fires 20:00-22:00 local.
OFFSET_MIN=$(( 180 + RANDOM % 121 ))
HOUR=$(( (17 * 60 + OFFSET_MIN) / 60 ))
MIN=$(( (17 * 60 + OFFSET_MIN) % 60 ))
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

TASK_ID="fb-warmup-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
TS_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Idempotency — skip if today's task already scheduled
EXISTING=$(sqlite3 "$SDB" \
  "SELECT id FROM messages_in WHERE id LIKE 'fb-warmup-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
if [[ -n "$EXISTING" ]]; then
  echo "$(date): SKIP — already scheduled today ($EXISTING)" >> "$LOG"
  exit 0
fi

# ── Prompt ───────────────────────────────────────────────────────────────────
# Vékony orchestrate-prompt. Minden részlet (lépésenkénti flow, Phase-policy,
# Cookie-restore, SAFE lájk, Notification badge, AZONNALI STOP) a
# platforms/facebook-groups.md "Daily warmup playbook" szekciójában él.
# Rövid prompt = kisebb context = kisebb esély hogy az SDK auto-compactingba
# csap és a poll-loop stuck-ba megy a riport előtt
# (lásd memory: feedback_v2_poll_loop_context_compact_stuck.md).
read -r -d '' PROMPT <<'PROMPT_EOF' || true
[FB warmup session — Dani Bene]

Olvasd el a `platforms/facebook-groups.md` "Daily warmup playbook" szekcióját + `state.json`-ban a `fb_warmup_phase`, `fb_warmup_phase_ends_at`, `fb_weekly_stats`, `fb_daily_actions` mezőket. A 10 lépéses flow, Phase-policy és STOP-pingek mind a doksiban — kövesd pontosan.

**NÉMÁN dolgozol (2026-07-17 óta).** A doksi Step 5 (korai indítás-jelzés) és Step 8 (záró reflektív riport) üzeneteit NE küldd ki — azok rutin-státuszok, és a napi riport (19:00) összefoglal. A doksi többi lépése változatlanul érvényes.

Helyette a session végén **naplózz**: appendeld a `rezerver/daily-log.md` végére a blokkodat a fájl fejlécében leírt formátumban (`## <dátum> <idő> — FB-warmup`, majd `eredmény` / `kiemelés` / `versenytárs` / `akadály` sorok). Az `eredmény`-be: Phase, session-típus, végrehajtott akciók száma. Ez váltja ki a Step 8-as riportot — a state-update UTÁN, a cookie-dump ELŐTT írd (a napló fontosabb, mint a cookie-dump: az holnapig elbírja).

**A STOP-ping viszont ÉL és kötelező** — ez nem rutin-státusz, hanem riasztás: bármi anomália (checkpoint / SMS / captcha / 2FA / "Unusual activity" / lejárt session) → AZONNALI STOP + Tomi-ping `<message to="tomi">`-vel, 1 mondatban, semmi recovery. Erre azonnal be kell avatkoznia, nem várhat estig. A pingek listája a doksiban.

A Phase-policy hardlimit. HU-sticky proxy KÖTELEZŐ — bármilyen geo-jump fraud-flag. Ne kommentelj, ne csatlakozz csoporthoz a Phase-keret felett. Cookie-restore session, NEM login.

FIGYELEM: a cookie-k 2026-07-04-iek és 07-15 óta nem használtuk a fiókot. Ha a restore nem visz be, az NEM hiba a te oldaladon — STOP + ping, ne próbálj újra belépni.
PROMPT_EOF

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
# Páros seq — a host páros, a container páratlan számokat használ (CLAUDE.md,
# docs/db-session.md). A korábbi `MAX(seq)+1` a paritástól függően páratlant is
# adhatott (és adott is: a 07-04..07-14 közti fb-warmup taskok mind páratlanok).
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT (COALESCE(MAX(seq),0)/2)*2+2 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID — fires $PROCESS_AFTER UTC (offset ${OFFSET_MIN}min from 17:00 CET)" >> "$LOG"
