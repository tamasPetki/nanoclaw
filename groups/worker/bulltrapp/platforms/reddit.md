# Reddit — BullTrapp Lloyd-persona account-építés

> ⛔️ **ACCOUNT LESZERELVE 2026-05-31 — u/lloyd_bt SHADOWBANNED (Tomi megerősítette).**
> **NE indíts semmilyen Reddit-sessiont erre az accountra**: nincs warmup, nincs lurk, nincs login, nincs cookie-restore, nincs scheduling. Egy shadowbannolt accounton minden session puszta kockázat és nulla haszon (a tartalmaid senkinek nem látszanak). A napi scheduler (`scripts/schedule-bulltrapp-reddit-warmup.sh`) hard-stop guarddal le van tiltva. Ha cron-task mégis felébreszt erre a projektre Reddit-céllal: olvasd be a `state.json.reddit.account_status == "shadowbanned"`-et és **azonnal állj le, ne csinálj semmit**. Csak Tomi explicit "feloldva" / "új account" utasítására éleszthető újra (akkor töröld ezt a bannert + a scheduler guardot + flip `account_status`). A BullTrapp growth a többi csatornán (X @Bulltrappcom, Telegram, email) fut tovább változatlanul.
>
> 🛑 **STEALTH BROWSER + US-STICKY RESIDENTIAL PROXY KÖTELEZŐ.** Curl-alapú posting tilos minden formában. Olvasásra is csak proxy-mögött. Az u/Mammoth 2026-04-17 ban pont curl-bombázás miatt jött — NE ismételd. Részletek: rezerver `platforms/browser.md` `stealth-browse residential proxy nélkül TILOS` blokk (azonos szabály mindkét personára).

## Fázis

A Reddit-fázis és target paraméterek **a `state.json.reddit` blokkban** vannak (`phase`, `username_actual`, `subs_target`, `warmup_cadence`). Minden session elején olvasd be onnan, ne ebből a doksiból.

Jelenlegi állapot: **pending registration → Lloyd builder/dev/crypto-tool fókusz**. Fresh account u/lloyd_bt-re regisztrálva, 4-6 hetes warmup (zéró BullTrapp-link, zéró self-promotion). Pattern: u/dani_horeca 2026-04-25-i regisztráció (Rezerver) — ugyanaz a stack ide.

## Registration playbook (egyszer-fut, regisztráció-igényli alkalom)

Csak akkor fut, ha `state.reddit.account_status == "pending_registration"`. Utána soha többet (kivéve ha account ban-olódik és Tomi explicit új account-ot kér).

### Pre-flight check

```bash
source /workspace/agent/.secrets
# Verify Lloyd-specific creds
[ -n "$BT_REDDIT_USERNAME" ] && [ -n "$BT_REDDIT_PASSWORD" ] && [ -n "$BT_REDDIT_PROXY" ] && [ -n "$CAPSOLVER_API_KEY" ] || { echo "MISSING BT_REDDIT_* — STOP"; exit 1; }
# Proxy IP-check (US sticky, BT session-id NEM ütközik Dani-éval)
curl -sS -x "$BT_REDDIT_PROXY" --max-time 15 https://ipinfo.io/json | jq -c '{ip,city,region,country,asn:.asn.asn}'
```

Ha nem US → STOP, Tomi-ping. Ha az IP **ugyanaz** mint a Dani-féle proxy session-é (`dani-r0cbd4a2a`) → STOP, mert a sticky session-id-knek külön kell lenniük (geo-fingerprint kapcsolat-veszély). A `BT_REDDIT_PROXY`-ban a `session.bt-r0...` suffixnek külön IP-pool-t kell adnia.

### Registration flow (Rezerver 2026-04-25 minta)

A Rezerver `state.reddit.registration_attempt_log` lépéseit követed. Tipikus sorrend:

1. **Browser indítás (TISZTA állapot)** — `stealth-browse close` ha még futna előző session, aztán:
   ```bash
   stealth-browse open "https://www.reddit.com/register/" --proxy "$BT_REDDIT_PROXY"
   ```

2. **Email submit** — `lloyd@bulltrapp.com` (= `BT_REDDIT_USERNAME` alá tartozó Zoho-fiók). Stealth-browse fill+click flow, Reddit register form. State-update: `registration_attempt_log` += `{ts, step:"email_submitted", result:"ok"}`.

3. **Email-code verify** — Reddit küld 6 jegyű kódot a `lloyd@bulltrapp.com` IMAP-ba. `mcp__bulltrapp-email__list_emails_metadata` + `since` (most-2min) + `from_address: noreply@reddit.com`. A legutolsó kódot pull-old, fill-eld be a register-form code-mezőjébe.

4. **Username + password submit** — `BT_REDDIT_USERNAME` (`lloyd_bt`) + `BT_REDDIT_PASSWORD` (vault). FIGYELEM: a Rezerver-flow-ban **3× blocked** ("Something went wrong") jött errő a lépésnél. Nem ad hibajelet, csak a form nem submit-ol. Ha 2× próbálkozás után sem megy → ugorj a CapSolver-flow-ra (lent), valószínűleg invisible reCAPTCHA Enterprise blokkol.

5. **CapSolver reCAPTCHA Enterprise solve + token-inject** — a regisztrációs form invisible reCAPTCHA Enterprise-t használ (sitekey: `6Lc...` Reddit-konkrét, megnézheted a DOM `data-sitekey` attributumából vagy a 2026-04-25-i log-ból `groups/worker/rezerver/state.json.reddit.registration_attempt_log`-ban). Memóriában: `feedback_capsolver_reddit_recaptcha.md`. Pattern: monkey-patch `grecaptcha.execute` → token kérés CapSolver-től → textarea injection → form submit.
   ```bash
   bash /home/node/.claude/skills/reddit-monitor/scripts/solve-recaptcha-enterprise.sh "6Lc..." "https://www.reddit.com/register/"
   # CAPSOLVER_API_KEY env-ből, response_token-t ad vissza
   ```

6. **Onboarding sub-pick** — Reddit beléptet és kéri 5-15 sub követését. PICK ezeket (Tomi 2026-05-07 döntése szerint, vegyes builder/crypto):
   - r/algotrading
   - r/CryptoCurrency
   - r/Bitcoin
   - r/SideProject
   - r/SaaS
   - r/IndieHackers
   - r/programming
   - r/startups
   - r/Entrepreneur
   - r/EntrepreneurRideAlong
   
   **NE** subscribe-olj egyebet. **NE** Reddit Premium ajánlatot fogadj el.

7. **Onboarding skip / complete** — bármilyen "personalize your feed", "verify phone", "add avatar" promptra **SKIP/CLOSE**. Phone-verify: nincs kéréskor SOSE pozitív válasz, az SMS-trigger fingerprint-szignál, Tomi-ping.

8. **Cookie-dump (registration-utáni mentés)** — friss cookie-jar, ezt fogja használni a daily warmup:
   ```bash
   NO_PROXY=localhost,127.0.0.1 HTTP_PROXY="" HTTPS_PROXY="" \
     cdp-cookies-dump > /workspace/agent/.reddit-cookies-lloyd_bt.json
   ```

9. **State update** (`state.json.reddit`):
   - `account_status` = `"active"`
   - `username_actual` = `"lloyd_bt"`
   - `registered_at` = now ISO
   - `last_login` = now ISO
   - `created_at` = now ISO (= registered_at — day-szám-számítás bázisa)
   - `ip_at_creation` = "<ip> (<region>, <ASN>)"
   - `registration_attempt_log` = full log az elejétől
   - `phase` = `"warmup-day-0"`

10. **Browser close** + **záró riport a hubnak** (Lloyd hangon):
    ```
    [worker:bulltrapp] phase=registration action=reddit-account-created result=u/lloyd_bt active, US-sticky <IP>, onboarding done (10 subs followed). next=daily warmup day 0-6 lurk-only.
    ```

### STOP-pingek a regisztráció során

- Email-code SMS-be jön (NE phone) — Reddit phone-verify üzemmódba esett → STOP, Tomi-ping
- "Suspicious activity" / Cloudflare challenge / "Try again later" → STOP, várjunk (proxy-burn vagy IP-rep)
- CapSolver hibakódot ad (balance-low, sitekey-mismatch) → STOP
- Username `lloyd_bt` foglalt → STOP, Tomi-döntés (alternatíva: lloyd_bts, lloydbt_dev, ld_bulltrapp)

## Daily warmup playbook

A regisztráció után **csak akkor fut**, ha `state.reddit.account_status == "active"`. A `scripts/schedule-bt-reddit-warmup.sh` (későbbi, még nem létezik) pickel egy random 8:00-10:00 CET időpontot és insertál egy task-üzenetet.

### Day-szám-szabály

Számold: `floor((now - state.reddit.created_at) / 86400)`. A `created_at` a `state.json.reddit` blokkban van.

| Day | Hét | Engedélyezett | Tilos |
|---|---|---|---|
| 0–6 | Week 1 | Csak read-only lurk (scroll, post-detail open, comments olvasás) | Save, vote, comment, subscribe, follow |
| 7–20 | Week 2–3 | + max 1 save/session | Vote, comment, subscribe |
| 21–34 | Week 4–5 | + 1–2 upvote csak top-poszton | Comment, subscribe |
| 35+ | Week 6+ | Comment csak ha `state.reddit.phase = "karma-building"`-re vált (Tomi explicit) | Self-promotion, link, BullTrapp/opensource említés |

**Cookie-restore session, NEM login.** A `groups/worker/bulltrapp/.reddit-cookies-lloyd_bt.json`-ból töltsd vissza. Login-form újra-belépés extra bot-szignál — minden napi szálnál ennyi kockázatot ne. Ha cookie lejárt → STOP + Tomi-ping (manuális relogin egyszer 1-2 hetente).

### Lépésenkénti flow

1. **Secrets + proxy IP-check.**
   ```bash
   source /workspace/agent/.secrets
   curl -sS -x "$BT_REDDIT_PROXY" --max-time 15 https://ipinfo.io/json | jq -c '{ip,city,region,country}'
   ```
   Ha nem US → **STOP, Tomi-ping**.

2. **State olvasás + day-policy döntés.**
   ```bash
   jq '.reddit' /workspace/agent/state.json
   ```
   Számold ki a `warmup-day-N`-t. Day szerint dönts hogy lurk-only vagy save megengedett-e.

3. **Browser indítás + cookie-restore (NEM login).**
   ```bash
   stealth-browse open "https://www.reddit.com/" --proxy "$BT_REDDIT_PROXY"
   ```
   Iterálj a `/workspace/agent/.reddit-cookies-lloyd_bt.json`-on:
   ```bash
   stealth-browse cookies <domain> <name>=<value>
   ```
   Reload ugyanazon proxyval. Ellenőrizd: header-ben jelenjen meg az avatar és a "lloyd_bt" felhasználónév. Ha NINCS bejelentkezve → **STOP + Tomi-ping** (cookie lejárt).

4. **Subreddit pick.** Random 1 a `state.reddit.subs_target` listából. Az előző session subjától ELTÉRŐ legyen.

5. **Korai indítás-jelzés a hubnak** (cross-agent send_message). **`[reflect:bulltrapp]` prefixszel** — a hub felismeri, magyarra fordítja, push-olja Tomi-Telegramjára real-time. Egy mondat, Lloyd hangon (EN, mert Lloyd persona angol). Példa: `[reflect:bulltrapp] step=5 | morning warmup, lurking r/algotrading today`. (Részletek a `groups/worker/CLAUDE.local.md` "Reflektív riportok" szekciójában.)

6. **Lurk-flow (5–10 perc, RANDOM cadence — ne timer-szerű):**
   - Open `r/<sub>` hot vagy new view (random 50/50).
   - 30–90 mp scroll lefelé, eltérő sebességgel.
   - 1–3 érdekes poszt címre nézz rá; valamelyikre **kattints**, olvass kommenteket 60–180 mp.
   - Vissza, scroll még 1–2 percig.
   - Day-policy szerint: ha engedélyezve, 0–1 save.

7. **State frissítés:**
   - `state.reddit.last_session_at` = now ISO
   - `state.reddit.last_subs_visited` = append a sub neve, max 5 elem (FIFO)
   - `state.reddit.session_count` = increment
   - Ha történt save/upvote: `cumulative_saves` / `cumulative_upvotes` increment
   - **Ne nyúlj** a `phase`-hez automatikusan — fázis-váltás Tomi explicit kérése.

8. **Záró reflektív riport a hubnak.** **`[reflect:bulltrapp]` prefixszel** — push real-time HU fordításban Tomi-Telegramra. 1–3 mondat, Lloyd hangon (EN). Tartalom-rács: (1) mit nézett (sub + idő), (2) mire kapta fel a fejét (egy konkrét takeaway), (3) opcionális ICP-szignál. Példa: `[reflect:bulltrapp] step=8 | spent 8 min on r/algotrading. got stuck on a backtesting overfit thread, walk-forward catches it better than k-fold for time series. save 0, just observing.`

9. **Cookie-dump frissítés:**
   ```bash
   NO_PROXY=localhost,127.0.0.1 HTTP_PROXY="" HTTPS_PROXY="" \
     cdp-cookies-dump > /workspace/agent/.reddit-cookies-lloyd_bt.json
   ```

10. **Browser close:** `stealth-browse close`.

### STOP-pingek (azonnal Tomi, semmi recovery)

- Cookie expired → "log in" oldal a feed helyett
- "Something went wrong" / "Suspicious activity" / phone-verify modal
- Captcha jön elő (warmup-ban CapSolver tilos — túl-kockázatos, csak a regisztrációkor)
- IP nem US (proxy-csere kell)
- Account suspension üzenet
- Reddit a Mammoth-trace-t észreveszi (azonos device-fingerprint, IP-overlap dani_horeca-val) → "you've been here before" üzenet → STOP, Tomi-stratégia

**Phase-et SOHA ne lépj automatikusan** — Tomi explicit kérése kell hozzá. Ne posztolj. Ne kommentelj. Ne subscribe-olj. Day-szám szerint a fenti policy a HARDLIMIT.

## Voice — Reddit-EN, Lloyd persona

Lloyd builder/dev/crypto-tool hang. Mintha a `groups/worker/bulltrapp/persona.md` voice-szabálya, de Reddit-natív (nem Twitter, nem dev.to):

- **Egy gondolat per komment.** Ne 3 feature, ne kérdés-válasz-disclaimer halmaz.
- **Konkrét tapasztalat-narratíva.** "ran a 4-engineer fintech team for 3 years, the biggest pain was..." > "as a developer..."
- **Specifikus szám.** "~30% of our backtest signals failed walk-forward" > "many signals fail"
- **Mondattöredékek OK**, természetes Reddit-flow.
- **Kisbetűs kezdés OK**, hagyj benne 1-2 apró tipust ("dont", "doesnt", "ive").
- **Karma-fázisban: ZÉRÓ BullTrapp-link, ZÉRÓ említés.** Ha valaki direkt megkérdezi mit csinálsz: "i build dev tools, mostly trading + market-data side stuff" — vague, nincs URL.
- **Disclosure-fázisban (karma 50+, hét 5+)**: full disclosure első mondatban: "disclosure: i'm building bulltrapp.com (a dashboard tracking crypto, stocks, and prediction markets together)". Aztán a kérdésre érdemi válasz.
- **Opensource project promo (Tomi 2026-05-07-i tervezett irány)**: amikor karma-fázisban Tomi explicit go-t ad, Reddit lesz a fő platform egy opensource side-project promotálásához. r/SideProject, r/programming, r/opensource fő-target. NE indíts magadtól ilyet, kizárólag Tomi-pingre.

## NE — AI-tellek

Em dash, semicolon, "not just X, it's Y", "delve / leverage / seamless", "as someone who...", "Imagine...", emoji, hármasszabály, formális átkötések. EN-ben ugyanígy: ezek mind AI-fingerprint-ek. Reddit-mod sokkal érzékenyebbek mint a Bluesky/Twitter közönség. Plus ne 1990-es dev-cliché-ket ("synergy", "ecosystem", "leverage"). 2026-builder hang: konkrét + specifikus + apró pesszimizmussal-keverve.

## Subok — primary target list (`state.reddit.subs_target` szinkronban)

| Sub | ~Userbase | Téma | Megjegyzés |
|---|---|---|---|
| r/algotrading | 1.7M | Quant + algotrading + backtest | Fő target. BullTrapp dashboard ICP középpont |
| r/CryptoCurrency | 8M+ | General crypto | Magas zaj, de pickelhető thread-ek aktívak |
| r/Bitcoin | 6.5M | BTC-specifikus | Maximalist hang, óvatosan értékkel kommentelni |
| r/SideProject | 220k | Side project show-tell + feedback | Opensource promo karma-fázisban főhely |
| r/SaaS | 280k | SaaS-builder discussion | BullTrapp ICP overlap |
| r/IndieHackers | 90k | Indie founder community | Builder-hang konzisztens |
| r/programming | 6M | General prog | Magas zaj, csak kivételes value-post |
| r/startups | 1.6M | Startup discussion | Általában | Növekedés-tipikus témák |
| r/Entrepreneur | 4.4M | Entrepreneur general | Sokszor pump-content, óvatosan |
| r/EntrepreneurRideAlong | 110k | Founder journey | Builder-narratíva-kompatibilis |

Egyéb felfedezhető: r/opensource (karma-fázisban projekt-promo target), r/devops (ha BullTrapp infra-storyt visz), r/MachineLearning (ha ML-feature jön a BullTrapp-ba). **NE** r/wallstreetbets — túl-zaj, alacsony retention, ban-rate magas.

## Account-építés tempó (csak Tomi explicit zöld jelével indul a karma-fázis)

A `state.reddit.warmup_cadence` szerint:

- **Hét 1-2** (post-registráció): heti 2 karma-komment, csak a 5 primary subból (algotrading, SideProject, SaaS, IndieHackers, EntrepreneurRideAlong), válasz egy értékes thread-re saját tapasztalat-narratívával. **Zéró link**, **zéró BullTrapp**, **zéró promo-szöveg**.
- **Hét 3-4**: heti 4-5 karma-komment, fokozatos hangulat-építés. Még mindig zéró link.
- **Hét 5+** (ha karma 50+ a Reddit `/about.json` szerint): heti 1 disclosure-outreach. Először válasz egy konkrét kérdésre ("how do you handle live crypto + stocks data in one place"), ott első mondat disclosure + érdemi válasz + opcionális bulltrapp.com link a végén.
- **Opensource promo (Tomi-ping triggered)**: r/SideProject + r/opensource + r/programming dedikált Show-post. Zéró link az első hozzászóláson, csak GitHub repo. BullTrapp-kapcsolat csak ha valaki direkt kérdez.
- Bármikor jön shadow-jel (komment 0 score 24h után + nem látszik logged-out incognito browser-ben): **azonnali full stop**, Tomi-ping, ne posztolj tovább míg nem tisztáztuk.

## Posztolás

```bash
source /workspace/group/.secrets
[ -n "$BT_REDDIT_PROXY" ] || { echo "NO PROXY — STOP"; exit 1; }
[ -n "$BT_REDDIT_USERNAME" ] && [ -n "$BT_REDDIT_PASSWORD" ] || { echo "NO ACCOUNT CREDS — registráció előtt vagyunk vagy kompromittálódott"; exit 1; }
bash /home/node/.claude/skills/reddit-monitor/reddit-comment-stealth.sh "POST_URL" "COMMENT_TEXT"
```

A `reddit-comment-stealth.sh` headed Chrome Xvfb-en, WindMouse + log-normal gépelés. **Egyetlen engedélyezett path** — `reddit-comment.sh` curl-alapú script bármilyen formában tilos (Mammoth-féle 2026-04-17 shadowban-tanulság).

## Olvasás (sentiment, research, thread-discovery)

Olvasásra is csak proxy mögül:

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/reddit-monitor/fetch-posts.sh algotrading 25 hot
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "crypto stocks dashboard" 25
```

Browse / sentiment-research / target-thread keresés szabadon — nem trigger fraud-detector.

## Shadowban-self-test (heti 1× karma-fázisban)

Minden héten egyszer ellenőrizni hogy a saját kommentjeid logged-out userek számára is láthatók:

```bash
source /workspace/group/.secrets
USERNAME="$BT_REDDIT_USERNAME"
curl -sS --max-time 20 -x "$BT_REDDIT_PROXY" \
  -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36" \
  "https://www.reddit.com/user/$USERNAME/about.json" -w "\nHTTP %{http_code}\n"
```

Ha 404 vagy 403 → shadow gyanú, full stop, Tomi-ping. Ha 200 + látszik a karma-szám: életben van.

## Anti-pattern checklist (Mammoth-tanulság, NE ismételd)

1. ❌ Nem-stealth (curl) postolás. → ✅ Csak `reddit-comment-stealth.sh`.
2. ❌ Sleeper-account hirtelen daily aktivitás. → ✅ Fresh account, organic-lassú emelkedés.
3. ❌ Geo-jump (Tomi mobilról + agent proxyról ugyanaz a cookie). → ✅ Stealth-only, soha nem nyúl Tomi az accounthoz, kizárólag agent.
4. ❌ Promo-link megjelenése korai fázisban. → ✅ 5+ hét zéró link.
5. ❌ Pontos N komment/nap fix időközzel. → ✅ Heti tempó 2 → 4-5 → 1 outreach, random napok és időpontok.
6. ❌ Single-IP burst több kontinens proxy-cookie-mismatch. → ✅ US-sticky, named session-id (`bt-r0...`), 30 perces TTL, **külön Dani-é-tól**.
7. ❌ Mammoth IP-overlap az új account-tal (Reddit fingerprint kapcsolja össze). → ✅ Friss IP-pool a `bt-r0...` session-id-ből, soha ne reuse a `dani-r0cbd4a2a` session-t.
