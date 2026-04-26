> 🛑 **TELJES STOP 2026-04-25** — u/Mammoth-Birthday-437 shadowbanned. Komment ID-k (`t1_oi5b5la`, `t1_ohyis97`) láthatatlanok public JSON-ban, `/user/comments.json → 404`, karma 57-en stuck. **Account-recovery folyamatban — Tomi intézi az appeal-t.** Az agent SEMMILYEN Reddit posting akciót nem indít, amíg Tomi explicit zöld jelet nem ad. Olvasás (browse, sentiment-research) OK proxy-n.

# Reddit — API, Karma, Szabályok

> `source /workspace/group/.secrets` minden bash parancs előtt!

## Mi változott 2026-04-25 — shadowban + curl-tilalom

A 2026-04-17-i lock után 8 napig a default curl path-on postolt az agent (ahogy a régi doksi javasolta). Eredmény: shadowban. Tanulság:

- **Curl-alapú posting TILOS, nem visszaállítható.** 8 éves sleeper-account hirtelen rotating-residential IP-kről curl-rel kommentel = automatikus bot-flag, függetlenül a proxytól. A `reddit-comment.sh` script futtatása **bármilyen formában tilos**.
- **Stealth browser DEFAULT, kötelező.** Visszatéréskor (ha sikerül), `reddit-comment-stealth.sh` az egyetlen út: headed Chrome Xvfb-n, bezier egér, gaussian gépelés.
- **Recovery protokoll** (lent külön szekció): minimum 2-4 hét teljes posting-szilencium, Tomi-vezérelt appeal, fokozatos újraindulás kis volumennel.
- A Reddit kísérlet **érdemben még el sem indult** (soft marketing csak Apr 16-tól, 1 hét éles). Nem deprioritizálunk — pause + helyes újraindulás.

## Account recovery — mi a Tomi-feladat, mi az agent-feladat

**Tomi (saját böngésző, HU otthoni IP, NEM proxy)**:
1. Login `https://www.reddit.com` u/Mammoth-Birthday-437-ként
2. Modmail `r/ShadowBan`-be: rövid kérés, "8 éves accountom, shadowban gyanú, kérek vizsgálatot". Egy kommentet írj a r/ShadowBan-ba mert a moderálók azon ellenőrzik
3. Pár napig használd manuálisan a accountot (lurking, 1-2 nem-promo komment) — "warm" jelek
4. Ha a shadow feloldódik (kommentjeid újra láthatók logged-out böngészőben + `/user/Mammoth-Birthday-437/comments.json` 200-as): pingelj az agentet

**Agent**:
1. **Most**: minden Reddit posting műveletet pause-ol. `state.json.reddit_paused: true` állapotban marad
2. Olvasás OK (sentiment-research, thread-watching, competitive research) — ezek nem érzékelnek shadowbant
3. Tomi explicit zöld jele után: stealth-only újraindulás, heti **1-2 komment max** az első 2 hétben, csak karma (semmi BullTrapp link), random subok és időpontok

## Mi változott 2026-04-17-én (történelmi kontextus)

- **Lock oka**: geo-anomalia. Tomi HU mobilról (Reddit app) használta az accountot, ugyanakkor az agent BG/PE/EC/BD/PT IP-kről kommentelt — ugyanazzal a session cookie-val. Reddit fraud-detekció erre jön rá legelőször.
- **Sticky HU proxy** (120 min TTL) bevezetve — geo-jump megoldva, de a curl-fingerprint maradt → ez vezetett a 2026-04-25-i shadowbanhez.
- **Új session cookie**: `REDDIT_SESSION` frissítve jelszó-reset + relogin után.
- **Szabály-szigorítás**: napi volumen 1-4 komment, 2-7h időköz, karma és outreach napok szét.

## Reddit Karma

A u/Mammoth-Birthday-437 account 8 éves, de karma ~1. Egyes subredditek (r/CryptoCurrency) minimum karmát követelnek.

**KARMA-ÉPÍTÉS FÁZIS** (amíg comment karma < 50):
- Írj genuinely hasznos kommenteket crypto/tech threadekre
- BullTrapp-ot NE említsd — csak segíts, válaszolj kérdésekre, oszd meg véleményed
- Célzott subredditek: r/CryptoCurrency, r/Polymarket, r/algotrading, r/SideProject
- Válassz threadeket ahol van engagement (min 5 upvote a poszt)
- Légy informatív, adj hozzáadott értéket

**OUTREACH FÁZIS** (karma 50+ után):
- Bekapcsol a BullTrapp outreach a voice.md szerint
- Fokozatosan — először heti 1-2 BullTrapp mention, aztán növelve

## Olvasás (proxy-n keresztül, JSON API)

```bash
source /workspace/group/.secrets

# Subreddit browsing
bash /home/node/.claude/skills/reddit-monitor/fetch-posts.sh SUBREDDIT [LIMIT] [SORT]

# Cross-subreddit keresés (AJÁNLOTT — relevánsabb találatok)
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "QUERY" [LIMIT] [TIME] [SORT]

# Relevancia scoring
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "QUERY" 15 | \
  bash /home/node/.claude/skills/reddit-monitor/score-posts.sh "QUERY"
```

## Posztolás — STOP 2026-04-25 / visszatéréskor STEALTH-ONLY

**Most (recovery alatt): semmilyen posztolás.** A `state.json.reddit_paused` true; ne hozz létre primed Reddit-taszkot, ne posztolj, ne kommentelj. Olvasás (sentiment, research) OK.

### Visszatéréskor — KIZÁRÓLAG stealth browser + residential proxy

Ha Tomi explicit zöld jelet ad (shadowban feloldva, manuális kommentek láthatók logged-out browser-ben):

```bash
source /workspace/group/.secrets
[ -n "$REDDIT_PROXY" ] || { echo "NO PROXY — STOP"; exit 1; }
bash /home/node/.claude/skills/reddit-monitor/reddit-comment-stealth.sh "POST_URL" "COMMENT_TEXT"
```

Headed Chrome Xvfb-n, bezier egér + gaussian gépelés — valós browser fingerprint. **Ez az egyetlen engedélyezett posting path.**

**Stealth browser residential proxy NÉLKÜL TILOS** (lásd [browser.md](browser.md) tetején). DC-IP + valós Chrome fingerprint = még gyanúsabb mint a curl, mert egy "élő gépezet" látszik furcsa hálózatról. Ha `REDDIT_PROXY` üres vagy lejárt → STOP, Tomi-ping. Ez **minden** Reddit-műveletre érvényes (nem csak posting): browse, login dry-run, snapshot, screenshot — mind csak proxy mögül.

### `reddit-comment.sh` (curl) — TILTOTT

A `reddit-comment.sh` curl-alapú script **bármilyen formában tilos**. Ne hívd meg, ne hivatkozz rá draftokban, ne primáld a `next_session_tasks`-be. Ha valamiért úgy tűnik, hogy "ez most gyors megoldás lenne", nem az — egyszer már shadowbanhez vezetett, ugyanaz lenne másodszorra is, csak gyorsabban.

Indok: 8 éves sleeper-account + rotating-residential IP-ról futó `curl` POST = Reddit fraud-detector legerősebb jelei. A sticky HU proxy a geo-anomalia ellen védett, de a hiányzó browser fingerprint elárulta.

### Recovery utáni első hetek — tempó

Ha a stealth path engedélyezett:
- **Hét 1-2**: heti 2 komment max, csak karma (semmi BullTrapp említés, semmi link), random subok, random időpontok
- **Hét 3-4**: heti 4-5 komment, még mindig csak karma, fokozatos
- **Hét 5+**: ha a kommentek mind láthatók (saját shadow-tester scriptekkel ellenőrizve), elkezdődhet az óvatos outreach — heti 1 BullTrapp-disclosure komment, voice.md szerint
- Bármikor jön shadow-jel (komment 0 score 24h után + nem látható logged-out): **azonnal full stop**, Tomi-ping

## Competitive research (ad-hoc)

```bash
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "coingecko problems OR issues" 25
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "best crypto portfolio tracker 2026" 20
```

## Szabályok — randomizált anti-bot minta

### Napi volumen

- **Karma nap**: 1-4 random karma-building komment (sorsold ki a `state.json` napi tervezésnél)
- **Outreach nap** (csak karma 50+ után): 1-2 random BullTrapp-említő komment
- **Vegyítés TILOS**: egy naptári napon belül vagy karma, vagy outreach — nem mindkettő

### Időzítés

- **Két komment között min 2h, max 7h** — sorsold ki random, NE fix 4h lépcsőkkel
- **Ne állíts órára pontos időt** (pl. 09:00, 13:00) — random perc/másodperc (pl. 09:17:43, 12:42:08)
- **Kerüld a napi azonos mintát** (pl. mindig reggel 5 komment) — heti szinten változtasd
- **Kora reggel (02-06 CET) NE posztolj** — egy magyar user ilyenkor alszik

### Tartalmi változatosság

- SOHA ne copy-paste azonos kommentet, még különböző threadbe sem
- Hossz: 80-350 karakter, random
- Stílus: időnként kérdés-válasz, időnként tipp, időnként saját tapasztalat

### Volumen cap (keményhatár)

- **Max 4 komment/nap összesen** (függetlenül a fent-leírt napi "típustól")
- **Max 20 komment/hét**
- Ha Reddit bármi figyelmeztetést mutat (shadowban, rate limit, warning modal): **azonnali stop**, Discord ping

## Reddit Voice (voice.md kiegészítés)

- "Full disclosure: I work on BullTrapp" vagy "disclosure: I'm on the BullTrapp team" — KÖTELEZŐ
- Először válaszolj a kérdésre genuinely — AZTÁN említsd a BullTrapp-ot
- Max 200-300 karakter
- Link: bulltrapp.com?utm_source=reddit&utm_campaign=beta
