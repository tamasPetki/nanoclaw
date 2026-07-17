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

# ── Source rotation ───────────────────────────────────────────────────────────
# A forráslista 2026-07-17 óta adatvezérelt: groups/worker/rezerver/pain-sources.json.
# Korábban itt egy hard-coded `case DOW` állt, ami miatt új fórumot csak a script
# szerkesztésével lehetett bevonni — az agent nem tudta bővíteni. Most a vasárnapi
# fórum-felderítés felveheti az új forrást a JSON-ba, és a rotáció magától bevonja.
#
# Rotáció: vasárnap mindig szintézis + felderítés; hétköznap az év napja szerint
# körbejárunk a `lurk` forrásokon (a `weight` többször szerepelteti a fontosabbat).
# Egy klaszter/futás — így a lurk-kadencia emberi marad és a context sem telik meg.
SRC_JSON=/root/nanoclaw-v2/groups/worker/rezerver/pain-sources.json
DOW=$(date +%u)

if [[ "$DOW" == "7" ]]; then
  CLUSTER=$(jq -r '.sources[] | select(.type=="synthesis") | "HETI SZINTÉZIS + FÓRUM-FELDERÍTÉS — NINCS új lurk. \(.note)"' "$SRC_JSON")
else
  # weight szerint kifejtett lurk-lista, majd az év napja alapján választunk
  mapfile -t POOL < <(jq -r '[.sources[] | select(.type=="lurk")] | map(. as $s | range(.weight // 1) | $s) | .[] | @base64' "$SRC_JSON")
  if (( ${#POOL[@]} == 0 )); then
    echo "$(date): ERROR — nincs lurk-forrás a $SRC_JSON-ban" >> "$LOG"
    exit 1
  fi
  IDX=$(( 10#$(date +%j) % ${#POOL[@]} ))
  SEL=$(echo "${POOL[$IDX]}" | base64 -d)
  CLUSTER=$(jq -r '"\(.label) — persona: \(.persona), platform: \(.platform). Célpontok: \(.targets | join(", ")). \(.note)"' <<<"$SEL")
fi

if [[ -z "$CLUSTER" ]]; then
  echo "$(date): ERROR — ures CLUSTER (rossz $SRC_JSON?)" >> "$LOG"
  exit 1
fi

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
4. A pain-harvest BELSŐ. Semmilyen output nem mehet publikusra (operational secrecy).

**NÉMÁN dolgozol (2026-07-17 óta).** A playbook Step 5 (korai indítás-jelzés) és Step 8 (záró reflexió) üzeneteit NE küldd ki — a napi riport (19:00) összefoglal. Helyette a végén appendeld a `rezerver/daily-log.md`-be a blokkodat (`## <dátum> <idő> — Pain-harvest`), a fájl fejlécében leírt formátumban.

**A te `megfigyelés` sorod a legértékesebb az egész naplóban.** A 19:00-s riport „AMIT EBBŐL TANULTUNK" szekciója elsősorban ebből él: te hallod, amit egymás közt mondanak — nem a marketingszöveget. Amit keress a jelek MÖGÖTT (nem csak a pain_text, hanem a hozzáállás):
- **Árazási pszichológia**: mit mondanak a SaaS-okról, havidíjról, jutalékról, „another subscription"-ről? Egy „tired of paying monthly for X" jel többet ér, mint tíz venue-profil.
- **Mitől félnek**: elveszett foglalás, no-show, adminisztráció, hogy a rendszer elveszi a személyes kapcsolatot?
- **Milyen szavakkal írják le a saját problémájukat** — ez lesz később a megkeresés nyelve. Ne a mi zsargonunk, az övék.
- **Mit utasítanak el és miért** — ha valaki azt írja „tried [tool], went back to pen and paper", az ARANY: a `pain_text`-be a panasz megy, a `megfigyelés`-be az, hogy MIÉRT bukott meg.

Anomália (checkpoint / captcha / nem-várt képernyő) → STOP + **azonnali** Tomi-ping (`<message to="tomi">`, max 3 mondat) — ez riasztás, nem rutin-státusz, tehát ez ÉL. NE kérj manuális belépést.
PROMPT_EOF

PROMPT="${PROMPT//__CLUSTER__/$CLUSTER}"

CONTENT=$(jq -nc --arg p "$PROMPT" '{prompt: $p, script: null}')
# Páros seq — a host páros, a container páratlan számokat használ (CLAUDE.md,
# docs/db-session.md). A korábbi `MAX(seq)+1` a paritástól függően páratlant is adott.
NEXT_SEQ=$(sqlite3 "$SDB" "SELECT (COALESCE(MAX(seq),0)/2)*2+2 FROM messages_in")
ESC_CONTENT=$(printf '%s' "$CONTENT" | sed "s/'/''/g")

sqlite3 "$SDB" "INSERT INTO messages_in (id, seq, kind, timestamp, status, process_after, recurrence, trigger, content) VALUES ('$TASK_ID', $NEXT_SEQ, 'task', '$TS_NOW', 'pending', '$PROCESS_AFTER', NULL, 1, '$ESC_CONTENT');"

echo "$(date): scheduled $TASK_ID (dow=$DOW) — fires $PROCESS_AFTER UTC (offset ${OFFSET_MIN}min from 12:00 CET)" >> "$LOG"
