> ⚠ **FRISSÍTÉS 2026-04-17** — Reddit lockolta az accountot. Új jelszó, új session cookie, új sticky HU proxy. Olvasd el a "Mi változott 2026-04-17-én" szekciót ebben a fájlban MIELŐTT bármilyen Reddit műveletet futtatnál. A szabályok is szigorodtak.

# Reddit — API, Karma, Szabályok

> `source /workspace/group/.secrets` minden bash parancs előtt!

## Mi változott 2026-04-17-én (olvasd el először)

- **Lock oka**: geo-anomalia. Tomi HU mobilról (Reddit app) használta az accountot, ugyanakkor az agent BG/PE/EC/BD/PT IP-kről kommentelt — ugyanazzal a session cookie-val. Reddit fraud-detekció erre jön rá legelőször.
- **Új proxy**: sticky HU residential, 120 min TTL (`REDDIT_PROXY` már frissítve a `.secrets`-ben). 2 óránként váltogat HU IP-k között, de egy burst-ön belül stabil.
- **Új session cookie**: `REDDIT_SESSION` frissítve jelszó-reset + relogin után.
- **Szabály-szigorítás**: napi volumen **1-4 komment (randomizált)**, 2-7h időköz (nem fix 4h), karma és outreach napok **szét vannak választva** (nem vegyíthetők ugyanazon a napon).
- **Stealth browser (Task #2)**: hosszú távon `reddit-comment-stealth.sh`-ra váltunk curl helyett. Amíg nincs kész, a régi `reddit-comment.sh` használható, de figyelmesen.

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

## Posztolás — curl (old.reddit.com API)

Ez a standard út. A sticky HU proxy + érvényes session cookie mellett stabil.

```bash
source /workspace/group/.secrets

# Post ID kinyerése URL-ből: reddit.com/r/sub/comments/1sg02ul/title/ → t3_1sg02ul
bash /home/node/.claude/skills/reddit-monitor/reddit-comment.sh "t3_POST_ID" "COMMENT_TEXT"
```

Ha "Session may be expired": küldj Discord üzenetet Tominak, kérj új reddit_session cookie-t.

### Tartalék: stealth-browser (csak ha újra ban/warning jön)

Ha a curl path újra problémát okoz (újabb lock, shadowban, rate limit warning), válts át:

```bash
bash /home/node/.claude/skills/reddit-monitor/reddit-comment-stealth.sh "POST_URL" "COMMENT_TEXT"
```

Headed Chrome Xvfb-n, bezier egér + gaussian gépelés. Nincs live-tesztelve a 2026-04-17-i bevezetés óta — első éles használat Discord-pingelje Tomit, hogy nézze.

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
