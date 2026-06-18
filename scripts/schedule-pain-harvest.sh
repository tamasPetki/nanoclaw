#!/usr/bin/env bash
# Daily pain-point harvest scheduler for the Worker.
# Runs every day ~12:00 CET via system cron (between the 08-10 reddit warmup and
# the 17:00 fb warmup), picks a random fire-time between 13:00-14:00 CET, and
# inserts a one-shot task into the Worker session inbound DB. The host sweep loop
# (60s) wakes the agent at process_after.
#
# A dedicated "just listen" run: the Worker lurks ONE source cluster (rotated by
# weekday) read-only and records overheard user pain-points via `ncl rezerver
# pain-add`. The full flow lives in groups/worker/rezerver/platforms/pain-harvest.md.

set -euo pipefail

LOG=/root/nanoclaw-v2/data/pain-harvest-schedule.log
SDB=/root/nanoclaw-v2/data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/inbound.db

# ── Source rotation by weekday (1=Mon … 7=Sun) ────────────────────────────────
# Full 3-platform rotation from day one (Tomi 2026-06-12). One cluster per run so
# the lurk cadence stays human and the agent context doesn't fill up.
DOW=$(date +%u)
case "$DOW" in
  1|4) CLUSTER="Reddit HoReCa — u/dani_horeca a r/restaurateur, r/restaurantowners, r/foodservice, r/EventPlanning subokon." ;;
  2|5) CLUSTER="Reddit builder/indie — u/lloyd_bt READ-ONLY lurk a r/SideProject, r/indiehackers, r/smallbusiness, r/SaaS subokon. FONTOS: lloyd_bt shadowbanned → olvasás OK, write (poszt/komment/vote/save/subscribe) SOHA." ;;
  3|6) CLUSTER="Facebook — Dani Bene a 2 belépett HoReCa-csoport (\"A Vendéglátós Csoport\", \"VENDÉGLÁTÓSOK ÉS VENDÉGEIK VLM\") feedjén. Zéró interakció, phase-5 cadence (csak feed-olvasás)." ;;
  7) CLUSTER="HETI SZINTÉZIS — NINCS új lurk. Olvasd be a .crm-export/pain_signals.json-t és posztolj Tominak egy heti pain-klaszter összefoglalót: top-frequency klaszterek, új vertikálok, a legígéretesebb termék-ötletek. (A részleteket lásd a pain-harvest.md 'Vasárnap' szekciójában.)" ;;
esac

# Random offset: 60-120 minutes after 12:00 local → fires 13:00-14:00 local.
OFFSET_MIN=$(( 60 + RANDOM % 61 ))
HOUR=$(( (12 * 60 + OFFSET_MIN) / 60 ))
MIN=$(( (12 * 60 + OFFSET_MIN) % 60 ))
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

TASK_ID="pain-harvest-$(date +%Y%m%d)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')"
TS_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Idempotency — skip if today's pain-harvest task already scheduled.
EXISTING=$(sqlite3 "$SDB" \
  "SELECT id FROM messages_in WHERE id LIKE 'pain-harvest-$(date +%Y%m%d)-%' AND status IN ('pending','processing') LIMIT 1" 2>/dev/null || true)
if [[ -n "$EXISTING" ]]; then
  echo "$(date): SKIP — already scheduled today ($EXISTING)" >> "$LOG"
  exit 0
fi

# ── Prompt ───────────────────────────────────────────────────────────────────
# Thin orchestrate-prompt — the step-by-step flow, pain-signal keywords, dedup,
# segmentation, and ncl pain-add calls all live in the pain-harvest.md playbook.
# __CLUSTER__ is substituted below (quoted heredoc keeps $ / backticks literal).
read -r -d '' PROMPT <<'PROMPT_EOF' || true
[Pain-harvest session — néma fájdalompont-felderítés]

Ma a következő klaszteren dolgozol: __CLUSTER__

Olvasd el a `rezerver/platforms/pain-harvest.md` teljes flow-t (session-init → forrás-pick → Step 5 → lurk → extrakció → dedup+write → Step 8 → cadence-safety) és kövesd pontosan.

KRITIKUS — amitől nem szabad eltérni:
1. READ-ONLY lurk. SEMMI interakció: no upvote / save / join / comment / post / subscribe. Stealth-browse + residential proxy KÖTELEZŐ (a `platforms/browser.md` szabálya). Persona-disambig (Dani vs Lloyd) a `reddit.md` szerint — `BT_REDDIT_*` Lloydhoz, sima `REDDIT_*` Danihoz.
2. Session elején OLVASD be a `.crm-export/pain_signals.json`-t (ismert pain-ek + dedup_key-ek) — ez a dedup alapja.
3. A talált fájdalompontokat `ncl rezerver pain-add`-dal írd be. Ha egy pain lényegében egyezik egy ismert dedup_key-jel → add meg UGYANAZT a `--dedup-key`-t (frequency++); különben új. A `context_quote` MINDIG anonim — SOHA username/PII.
4. **Step 5** (korai indítás-jelzés, 1 mondat) és **Step 8** (záró reflexió, 1-3 mondat) közvetlenül Tominak a botodon (`<message to="tomi">`), persona-hangon — prefix és hub nélkül.
5. A pain-harvest BELSŐ. Semmilyen output nem mehet publikusra (operational secrecy).

Anomália (checkpoint / captcha / nem-várt képernyő) → STOP + Tomi-ping (max 3 mondat), de NE kérj manuális belépést.
PROMPT_EOF

PROMPT="${PROMPT//__CLUSTER__/$CLUSTER}"

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT COALESCE(MAX(seq),0)+1 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID (dow=$DOW) — fires $PROCESS_AFTER UTC (offset ${OFFSET_MIN}min from 12:00 CET)" >> "$LOG"
