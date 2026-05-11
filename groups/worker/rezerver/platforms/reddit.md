# Reddit — EN-globális HoReCa account-építés

> 🛑 **STEALTH BROWSER + US-STICKY RESIDENTIAL PROXY KÖTELEZŐ.** Curl-alapú posting tilos minden formában. Olvasásra is csak proxy-mögött. Részletek: [browser.md](browser.md) tetején (`stealth-browse residential proxy nélkül TILOS` blokk).

## Fázis

A Reddit-fázis és target paraméterek **a `state.json.reddit` blokkban** vannak (`phase`, `username_actual`, `subs_target`, `warmup_cadence`). Minden session elején olvasd be onnan, ne ebből a doksiból.

Jelenlegi (2026-04-25 Tomi-döntés): **EN-globális HoReCa scope**, fresh account-építés — nem a Mammoth-féle 8 éves sleeper, hanem új account amit Dani-persona keze alá kap, és lassú organic karma-építés US-sticky IP-ről, semmi Rezerver-link az első 4-6 hétben.

## Daily warmup playbook

Napi **1× session**, automatizáltan beillesztett task egy random 8:00–10:00 CET közötti időpontra (`scripts/schedule-reddit-warmup.sh` + cron 7:00 CET). A task-prompt **vékony orchestrate-utalás** erre a playbookra — minden részlet itt él.

### Day-szám-szabály

Számold: `floor((now - state.reddit.created_at) / 86400)`. A `created_at` a `state.json.reddit` blokkban van.

| Day | Hét | Engedélyezett | Tilos |
|---|---|---|---|
| 0–6 | Week 1 | Csak read-only lurk (scroll, post-detail open, comments olvasás) | Save, vote, comment, subscribe, follow |
| 7–20 | Week 2–3 | + max 1 save/session | Vote, comment, subscribe |
| 21–34 | Week 4–5 | + 1–2 upvote csak top-poszton (nyilvánvaló helyeslés) | Comment, subscribe |
| 35+ | Week 6+ | Comment csak ha `state.reddit.phase = "karma-building"`-re vált (Tomi explicit) | Self-promotion, link, Rezerver-említés |

**Cookie-restore session, NEM login.** A `groups/rezerver/.reddit-cookies-dani_horeca.json`-ból töltsd vissza. Login-form újra-belépés extra bot-szignál — minden napi szálnál ennyi kockázatot ne. Ha cookie lejárt → STOP + Tomi-ping (manuális relogin egyszer 1-2 hetente).

### Lépésenkénti flow

1. **Secrets + proxy IP-check.**
   ```bash
   source /workspace/agent/.secrets
   # REDDIT_PROXY US-sticky (cr.us, port 10000), CAPSOLVER_API_KEY jelen.
   curl -sS -x "$REDDIT_PROXY" --max-time 15 https://ipinfo.io/json | jq -c '{ip,city,region,country}'
   ```
   Ha nem US → **STOP, Tomi-ping**, ne folytasd.

2. **State olvasás + day-policy döntés.**
   ```bash
   jq '.reddit' /workspace/agent/state.json
   ```
   Számold ki a `warmup-day-N`-t (lásd fent). Day szerint dönts hogy lurk-only vagy save megengedett-e a session-ben.

3. **Browser indítás + cookie-restore (NEM login).**
   ```bash
   stealth-browse open "https://www.reddit.com/" --proxy "$REDDIT_PROXY"
   ```
   Iterálj a `/workspace/agent/.reddit-cookies-dani_horeca.json`-on, és minden cookie-t add be:
   ```bash
   stealth-browse cookies <domain> <name>=<value>
   ```
   Reload ugyanazon proxyval. Ellenőrizd: header-ben jelenjen meg az avatar és a "dani_horeca" felhasználónév (snapshot vagy `get text`). Ha NINCS bejelentkezve → **STOP + Tomi-ping** (cookie lejárt). Semmilyen recovery-akció.

4. **Subreddit pick.** Random 1 a `state.reddit.subs_target` listából. Az előző session subjától ELTÉRŐ legyen (`state.reddit.last_subs_visited` utolsó eleme tabu).

5. **Korai indítás-jelzés a hubnak.** **`[reflect:rezerver]` prefixszel** — a hub felismeri, magyarra fordítja (HU-ról HU-ra: minimal change), push-olja Tomi-Telegramjára real-time. **MOST küldd ki**, mielőtt a hosszú lurk-flow elindul. Egy mondat, Dani hangon. Példa: `[reflect:rezerver] step=5 | reggeli warmup, ma r/restaurateur-en figyelek`. Ez biztosítja hogy ha a session később megakad (context-compact, ceiling-kill), Tomi legalább látja hogy elindult és melyik subot néztük. (Részletek a `groups/worker/CLAUDE.local.md` "Reflektív riportok" szekciójában.)

6. **Lurk-flow (5–10 perc, RANDOM cadence — ne timer-szerű):**
   - Open `r/<sub>` hot vagy new view (random 50/50).
   - 30–90 mp scroll lefelé, többször, eltérő sebességgel. Természetes — néhány hosszú megállás, néhány gyors.
   - 1–3 érdekes poszt címre nézz rá; valamelyikre **kattints** (poszt-detail), olvass kommenteket 60–180 mp.
   - Vissza, scroll még 1–2 percig.
   - Day-policy szerint: ha engedélyezve, 0–1 save (`stealth-browse click` a save gombon).

7. **State frissítés:**
   - `state.reddit.last_session_at` = now ISO
   - `state.reddit.last_subs_visited` = append a sub neve, max 5 elem (FIFO)
   - `state.reddit.session_count` = increment
   - Ha történt save/upvote: `cumulative_saves` / `cumulative_upvotes` increment
   - **Ne nyúlj** a `phase`-hez automatikusan — fázis-váltás Tomi explicit kérése.

8. **Záró reflektív riport a hubnak.** **`[reflect:rezerver]` prefixszel** — push real-time Tomi-Telegramra. **A cookie-dump ELŐTT** küldd ki, mert a cookie-dump nem kritikus a behavior-szempontjából, de a riport értékes Tominak. 1–3 mondat, Dani hangon, magyarul. Ne bullet-tábla. Tartalom-rács: (1) mit néztél (sub + idő), (2) mire kaptad fel a fejedet (egy konkrét takeaway), (3) opcionális Rezerver-ICP-szignál. Példa: `[reflect:rezerver] step=8 | r/restaurateur-ön voltam 8 percet. Egy POS-rendszer-váltás threadnél megakadtam, sok minden cserélődik most a tulajok körében — Toast vs SpotOn vs Square. Save 0, csak figyelek.`

9. **Cookie-dump frissítés** (token_v2 lejárhat — best-effort, ha elhasal nem baj, holnapig elbírja):
   ```bash
   NO_PROXY=localhost,127.0.0.1 HTTP_PROXY="" HTTPS_PROXY="" \
     cdp-cookies-dump > /workspace/agent/.reddit-cookies-dani_horeca.json
   ```
   A `cdp-cookies-dump` a container-ben pre-installált bash wrapper (`/usr/local/bin/cdp-cookies-dump` → `/opt/scripts/cdp-cookies.js`), natív Node WebSocket-et használ — `chrome-remote-interface` npm-csomag NEM kell. Ha a parancs hiányzik (régi image), azonnal STOP + Tomi-ping (kell egy container rebuild). NE írj inline `/tmp/cdp-cookies.js`-t a régi `chrome-remote-interface`-szel — a worker container-ben az nincs telepítve.

10. **Browser close:** `stealth-browse close`.

### Random elemek minden session-ben

- Subreddit pick: lásd step 4.
- Hot vagy New view: random 50/50.
- Session-hossz: 5–10 perc, ne fix.
- Scroll-cadence: némelyik 30s megálló, némelyik 2–3 perces komment-olvasás. Ne timer-szerű.

### STOP-pingek (azonnal Tomi, semmi recovery)

- Cookie expired → "log in" oldal a feed helyett
- "Something went wrong" / "Suspicious activity" / phone-verify modal
- Captcha jön elő (warmup-ban CapSolver tilos — túl-kockázatos)
- IP nem US (proxy-csere kell)
- Account suspension üzenet

**Phase-et SOHA ne lépj automatikusan** — Tomi explicit kérése kell hozzá. Ne posztolj. Ne kommentelj. Ne subscribe-olj. Day-szám szerint a fenti policy a HARDLIMIT.

## Miért EN-globális, miért US-sticky

- HU HoReCa Reddit-prezencia minimális (r/Hungary nem iparág-fókusz, r/budapest nem szakmai). Az EN HoReCa subok (r/restaurateur 95k, r/restaurantowners 54k, r/foodservice 12k, r/Chefit 39k, r/EventPlanning 32k) **20-50× nagyobb userbase**, ott van a tényleges szakmai diskurzus.
- A Rezerver HU SaaS, **de** a foglalási-iparág + self-service onboarding + real-time pricing témák univerzálisak. Karma-építés EN-en, és amikor majd jön a disclosure-outreach, az "I'm building rezerver.com (Hungary-focused booking SaaS)" természetes hangon megy.
- US-sticky proxy: a Reddit user-base ~40%-a US, az r/restaurateur stb. még inkább. US IP-ről írni r/restaurateur-be természetes; HU IP-ről írni ugyanoda már demográfiai mismatch (gyanús).

## Voice — Reddit-EN

A Rezerver `voice.md` magyar HoReCa hangra van kalibrálva. **Reddit-en EN, és más kód-tár** — globális vendéglátós/szakmai közösség, nem hipster-tech, nem corporate-pitch.

- **Egy gondolat per komment.** Ne 3 feature, ne kérdés-válasz-disclaimer halmaz.
- **Konkrét tapasztalat-narratíva.** "ran a 60-cover restaurant for 4 years, the biggest pain was..." > "as a restaurateur..."
- **Specifikus szám.** "~40% of our private dining bookings came from..." > "many bookings"
- **Mondattöredékek OK** — természetes Reddit-flow.
- **Kisbetűs kezdés OK**, hagyj benne 1-2 apró hibát ("dont", "doesnt", "ive").
- **Karma-fázisban: ZÉRÓ Rezerver-link, ZÉRÓ említés.** Ha valaki direkt megkérdezi mit csinálsz: "i help out at a small booking-tool startup in Europe, focused on event venues" — vague, nincs URL.
- **Disclosure-fázisban (karma 50+, hét 5+)**: full disclosure első mondatban: "disclosure: i'm building rezerver.com (small booking-tool for European event venues, free for first 30)". Aztán a kérdésre érdemi válasz.

## NE — AI-tellek (lásd Rezerver `voice.md` 🚨 szekciók ugyanúgy)

Em dash, semicolon, "not just X, it's Y", "delve / leverage / seamless", "as someone who...", "Imagine...", emoji, hármasszabály, formális átkötések. EN-ben ugyanígy: ezek mind AI-fingerprint-ek. Reddit-mod sokkal érzékenyebbek mint a Bluesky/Twitter közönség.

## Subok — primary target list (`state.reddit.subs_target` szinkronban)

| Sub | ~Userbase | Téma | Megjegyzés |
|---|---|---|---|
| r/restaurateur | 95k | Vendéglátós tulajdonosok, szakmai | Fő target. Booking, POS, scheduling, supply, P&L |
| r/restaurantowners | 54k | Övezetes-restaurateur, hands-on | Sok rendezvény-foglalás és private-dining téma |
| r/foodservice | 12k | Tágabb iparág (catering, B2B) | Niche de magas engagement |
| r/Chefit | 39k | Konyhafőnökök, kitchen ops | Foglalás-mentes, de szakmai-respect építéshez |
| r/EventPlanning | 32k | Event organizer, B2B/B2C demand-side | Hosszabb távon Rezerver demand-side targetelés |

Egyéb felfedezhető: r/smallbusiness (vendéglátós segmens), r/CateringIndustry, r/HotelManagement, r/wedding (csak demand-side és csak ha rezerver-relevant). **NE** r/Hungary / r/budapest első hónapban — Tomi mobil HU kommentelése + agent kommentje ugyanabban a HU subban = mini-geo-link kockázat.

## Account-építés tempó (csak Tomi explicit zöld jelével indul)

A `state.reddit.warmup_cadence` szerint:

- **Hét 1-2** (post-registráció): heti 2 karma-komment, csak a 5 primary subból, válasz egy értékes thread-re saját tapasztalat-narratívával. **Zéró link**, **zéró Rezerver**, **zéró promo-szöveg**.
- **Hét 3-4**: heti 4-5 karma-komment, fokozatos hangulat-építés. Még mindig zéró link.
- **Hét 5+** (ha karma 50+ a Reddit `/about.json` szerint): heti 1 disclosure-outreach. Először válasz egy konkrét kérdésre ("how do you handle private dining bookings"), ott első mondat disclosure + érdemi válasz + opcionális rezerver.com link a végén.
- Bármikor jön shadow-jel (komment 0 score 24h után + nem látszik logged-out incognito browser-ben): **azonnali full stop**, Tomi-ping, ne posztolj tovább míg nem tisztáztuk.

## Posztolás

```bash
source /workspace/group/.secrets
[ -n "$REDDIT_PROXY" ] || { echo "NO PROXY — STOP"; exit 1; }
[ -n "$REDDIT_USERNAME" ] && [ -n "$REDDIT_PASSWORD" ] || { echo "NO ACCOUNT CREDS — registráció előtt vagyunk vagy kompromittálódott"; exit 1; }
bash /home/node/.claude/skills/reddit-monitor/reddit-comment-stealth.sh "POST_URL" "COMMENT_TEXT"
```

A `reddit-comment-stealth.sh` headed Chrome Xvfb-en, WindMouse + log-normal gépelés. **Egyetlen engedélyezett path** — `reddit-comment.sh` curl-alapú script bármilyen formában tilos (lásd a BullTrapp Mammoth-féle 2026-04-25 shadowban-tanulság, az pont curl-bombázás miatt esett ki).

## Olvasás (sentiment, research, thread-discovery)

Olvasásra is csak proxy mögül:

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/reddit-monitor/fetch-posts.sh restaurateur 25 hot
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "private dining booking system" 25
```

Browse / sentiment-research / target-thread keresés szabadon — nem trigger fraud-detector.

## Shadowban-self-test (heti 1× karma-fázisban)

Minden héten egyszer ellenőrizni hogy a saját kommenteid logged-out userek számára is láthatók:

```bash
source /workspace/group/.secrets
USERNAME="$REDDIT_USERNAME"
curl -sS --max-time 20 -x "$REDDIT_PROXY" \
  -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36" \
  "https://www.reddit.com/user/$USERNAME/about.json" -w "\nHTTP %{http_code}\n"
```

Ha 404 vagy 403 → shadow gyanú, full stop, Tomi-ping. Ha 200 + látszik a karma-szám: életben van, futás folytatódhat.

## Anti-pattern checklist (saját Mammoth-tanulság, NE ismételd)

1. ❌ Nem-stealth (curl) postolás. → ✅ Csak `reddit-comment-stealth.sh`.
2. ❌ Sleeper-account hirtelen daily aktivitás. → ✅ Fresh account, organic-lassú emelkedés.
3. ❌ Geo-jump (Tomi mobilról + agent proxyról ugyanaz a cookie). → ✅ Stealth-only, soha nem nyúl Tomi az accounthoz, kizárólag agent.
4. ❌ Promo-link megjelenése korai fázisban. → ✅ 5+ hét zéró link.
5. ❌ Pontos N komment/nap fix időközzel. → ✅ Heti tempó 2 → 4-5 → 1 outreach, random napok és időpontok.
6. ❌ Single-IP burst több kontinens proxy-cookie-mismatch. → ✅ US-sticky, named session-id (`dani-reddit`), 120 perces TTL.
