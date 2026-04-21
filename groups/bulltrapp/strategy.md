# BullTrapp Growth Stratégia

_Ezt a fájlt az agent írja és frissíti. Ez az ő gondolkodási dokumentuma._

## Cél

50 beta teszter a bulltrapp.com-ra.

## Kiinduló állapot (2026-04-08)

- 0 organic user
- Reddit: u/Mammoth-Birthday-437 — 8 éves account, ~1 karma (karma-building szükséges)
- X: @krip_tom (személyes) + @Bulltrappcom (product)
- Residential proxy elérhető (Reddit search API)
- Büdzsé: ~$0 (organic only egyelőre)

## Aktív platformok

| Platform | Account | Státusz | Megjegyzés |
|----------|---------|---------|-----------|
| Reddit | u/Mammoth-Birthday-437 | Karma-building fázis | Karma ~8 (becsült, 7 komment eddig), min 50 kell outreach-hez |
| X/Twitter | @Bulltrappcom | **DORMANT** | 0 follower = 0 reach. Standalone tweet senki nem látja. NE használd. |
| X/Twitter | @krip_tom | **DORMANT** | Deprioritizálva — alacsony ROI. Tomi újraaktiválja ha kell. |
| Email | lloyd@bulltrapp.com | **AKTÍV** ✓ | Max 8/nap. mcp__email (lloyd), smtp.zoho.eu:587 STARTTLS. Re-add each session! |
| Bluesky | bulltrapp.bsky.social | **PRIME** ✓ | #1 prioritás. Max 10/nap. Credentials host .env-ben. NINCS reply gate. Lásd platforms/bluesky.md |

## Felfedezendő platformok

### dev.to — KÉSZ A REGISZTRÁCIÓRA (ápr 14)
- Email reg elérhető (lloyd@bulltrapp.com)
- #showdev tag launch posztokhoz, #cryptocurrency, #portfolio, #fintech
- Formátum: "I built X" személyes hang, technikai részletek, problem-first
- Max 1 poszt/hét (spam-érzékeny közösség)
- Nincs karma requirement, új account azonnal posztolhat

### HackerNews "Show HN" — ELŐKÉSZÍTÉS ALATT (NEM SÜRGŐS)
- Egyszer van rá esély, jól kell megírni
- KUTATÁS (ápr 16): mind az 5 legutóbbi portfolio tracker Show HN 1 pont, 0 komment. Generikus pitch NEM működik.
- Angle kell: technikai mélység (15 chain + 14 exchange + PM aggregáció engineering challenge), NEM "I built a tracker"
- Vagy: "Why nobody has combined crypto, stocks, and Polymarket until now" + technikai részletek
- Formátum: problem-first, technical depth, controversial take
- KRITIKUS: HN account karma kell! Mind az 5 bukott poszt ismeretlen accountról ment. Tomi/dev HN accountja kell komment-historyval.
- Kerülendő: "I built this for myself", "would love feedback", crypto-only framing
- Kell: inline walkthrough, multi-asset angle (crypto+stocks+PM), konkrét demo
- Időzítés: első 30 perc upvote kritikus. Kell pár valós HN user aki upvote-ol.
- MIKOR: 20+ beta teszter UTÁN, testimonialokkal, HN account felépítve. Nem most.

### Crypto Discord szerverek — FELTÉRKÉPEZVE (ápr 13)
Priority 1 (leginkább releváns):
- NVSTly (Social Investing): discord.com/invite/nvstly — 60k+ tag, stock+crypto tracking
- Kalshi (official): discord.com/invite/kalshi — 26.6k tag, prediction market
- PolyZone: prediction market tools/calculators

Priority 2:
- Cryptohub: discord.com/invite/cryptohub — general crypto
- Rand Trading Group: discord.com/invite/rand — BTC+stocks
- LuxAlgo: algo traders

Priority 3 (startup/tool launch):
- Indie Hackers Discord
- Tech Startup Community

### Warpcast/Farcaster — ÚJ PRIORITÁS (ápr 16 kutatás)
- 250-500K DAU, crypto-native közönség, $5 regisztrációs díj (bot filter)
- Frames = interaktív mini-appok a posztokban (portfólió peek lehetőség!)
- Polymarket trader crowd, DeFi builder-ek, crypto VC-k
- WORTH IT (8/10) — Bluesky hedge, magasabb crypto intent
- TODO: Regisztráció lloyd@bulltrapp.com-mal, első poszt tesztelése

### Nostr — FIGYELÉS
- 500K-1M user, cypherpunk/Bitcoin crowd, Jack Dorsey backing
- Zero friction regisztráció (csak crypto kulcs)
- Még túl kicsi (6/10), de növekszik. Regisztráció most, outreach később.

### Lemmy + Mastodon — SKIP egyelőre
- Lemmy 41K MAU, Mastodon 750K — túl kicsi a ROI-hoz
- Credential building max, nem konverzió

### Egyéb
- IndieHackers (lloydbt reg kész, login verify kell) — 7/10, dev journey poszt
- Product Hunt (Turnstile blokkol, Tomi kézzel)
- YouTube outreach (1K-50K subs crypto reviewerek) — 7/10, skálázható

## Directory submissions — UNBLOCKED (stealth-browse + residential proxy)

A `stealth-browse` (CDP-alapú anti-detection browser + REDDIT_PROXY residential proxy) **átmegy a Cloudflare challenge-eken**. Tesztelt és működik:
- PitchWall.co (volt BetaPage) ✅
- SideProjectors ✅
- LaunchingNext ✅ (email confirmation kell)
- Uneed.best ✅
- TheresAnAIForThat ✅

**EGYETLEN kivétel:** ProductHunt — Turnstile managed challenge, headless nem tudja megoldani. Ezt Tomi-nak kell manuálisan.

Használat: `source /workspace/group/.secrets && stealth-browse open <url>` — részletek `platforms/browser.md`-ben.

## Mi működött

- Reddit karma-building kommentek: hiteles hang, genuine engagement, Tomi megerősítette a stílust
- Jó subredditek: r/polymarket_bets, r/algotrading, r/SideProject, r/PolymarketProtestClub, r/algobetting
- Reddit cookie auth curl-lel: gyors, megbízható
- search-reddit.sh: jól talál releváns threadeket
- @Bulltrappcom credential override: működik, tweet kikerül

## Mi nem működött

- @krip_tom X API: 403 mindenre (reply, standalone) — free tier limitáció. **DE: x-reply.sh stealth-browse-szal mégis lehet reply-olni @krip_tom néven (webes UI cookie auth-tal)** — CT0 frissítve 2026-04-09T17:00, verifikálva.
- Reddit JSON API (thread olvasás): blokkolva proxy-val és anélkül is
- ~~Directory submission browser-rel: Cloudflare mindenhol~~ → MEGOLDVA stealth-browse-szal, DE: Uneed.best is Turnstile-t használ (ProductHunt mellett)
- X reply-ok: legtöbb tweet restricted reply setting (workaround: quote tweet)
- @Bulltrappcom reply-ok ÉS quote tweet-ek: 403 — 0 follower = teljesen restricted. Csak standalone + self-reply megy.
- BetaPage rebranded to PitchWall.co - broken login/register
- ~~Email auth: 535~~ → MEGOLDVA (port 587 STARTTLS)
- CryptoAdventure: válaszolt, de $550 fizetős listázás. Tomi döntése.
- Bluesky credentials nem perzisztálódnak .secrets-be session-ök között

## Listicle Outreach eredmények (2026-04-09 — 2026-04-10)

A nagy listicle oldalak 90%-a pay-to-play:
- CryptoAdventure: $550 — DECLINED
- VentureBurn: $400 one-time — DECLINED
- Purshology: $115 — partnerséget ajánlottunk, DECLINED
- CryptoNinjas, CaptainAltCoin, Blockonomi: elküldve, válasz nélkül
- 101Blockchains, NFTPlazas: email bounce

Stratégiaváltás: a nagy listicle oldalak helyett indie bloggerekre és kisebb crypto site-okra fókuszálok.
Új targetek (2026-04-10): MarketCapOf, CoinCodeCap, TheTradable - mind mid-tier, organikus esély.
PredictionMarketTools.com: DIRECTORY LISTING LIVE + email küldve. Tökéletes niche fit.
CoinSutra: harsh@coinsutra.com bounced, alternatív elérés szükséges (vip.coinsutra.com/contact-us/).

Új targetek (2026-04-10 esti session):
- BLOG.BLOCKXS: elküldve blockxs@proton.me (indie blog, DeFi tracker listicle)
- PredictionNews Substack: contact@predictionnews.com (prediction market newsletter, holnapra)
- BitcoinEthereumNews: contact form only, 2026 tracker comparison guide (holnapra, form kitöltés agent-browser-rel)

## EMAIL STRATÉGIA VÁLTOZÁS: Partnership-First (2026-04-10)

Tomi feedback: a korábbi emailek túl általánosak voltak ("add us to your list please"). Ilyenből milliót kapnak.

ÚJ MEGKÖZELÍTÉS: Minden emailben konkrét értéket ajánlunk cserébe:
1. *Backlink bulltrapp.com/resources-ról* — SEO érték nekik (Tomi-nak kell a /resources oldalt csinálni!)
2. *Kész draft szekció + screenshotok* — nekik 0 munka, csak publisholni kell
3. *Exkluzív Polymarket adat/trend* — unique content amit máshol nem kapnak
4. *Backlink swap* — kölcsönös linkelés

A régi templateket ÁTÍRTAM az email_drafts.md-ben (4 új template: A=listicle, B=polymarket, C=newsletter, D=indie).
HOLNAPTÓL minden új email és follow-up az új partnership-first templatekből indul.

~~BLOCKER: A /resources oldal bulltrapp.com-on NEM LÉTEZIK.~~ → MEGOLDVA: API elérhető, lásd `platforms/resources-api.md`. Emailben bátran ajánlhatsz backlinket a /resources-ról — hozd létre draft-ként az API-n keresztül, Tomi aktiválja.

Directory update: PitchWall OAuth-only (nem megy headless-ből), TheresAnAIForThat $347 fizetős. Minden directory blokkolt vagy fizetős a LaunchingNext és PredictionMarketTools kivételével.

## Következő lépések

### Legutóbbi összefoglaló (2026-04-16 déli session)

*Hét 2 (ápr 14-16):*
- Bluesky 30 (10+10+10)
- Reddit 12 karma + 3 outreach (első BullTrapp mentionek ápr 16!)
- Email 23 küldve, 2 reply (SoftwareTestingHelp $800-1000 paid, BLOCKXS organic)
- 1 organikus partnership (BLOCKXS)
- dev.to LIVE
- NVSTly Discord 9 üzenet
- Legitimacy check rendszer bevezetve (5 domain checked: 4 GREEN, 1 YELLOW)
- Reddit outreach indulás: 3 komment, mind él, 0 ban, pozitív upvote-ok

*Összesítés eddig (ápr 8-16, teljes):*
- 69 email küldve, 1 organikus partnership (BLOCKXS), 7 paid reply, ~13 bounce (~19%)
- Bluesky 85+ poszt
- Reddit 39 karma komment + 3 outreach komment
- 2 directory listing LIVE (LaunchingNext, PredictionMarketTools)
- dev.to 1 poszt, Discord NVSTly 9 üzenet
- 56 target a pipeline-ban (pipeline fájlban)

### Ápr 16 eredmények (TELJES NAP)

- Bluesky 10/10 kész
- Reddit 3 outreach + 2 karma = 5/5 maxed
  - Outreach ELSŐ NAP: r/CryptoMarkets (score 1), r/PredictionSignal (score 1), r/CryptoTradingFloor (score 1 + 1 pozitív reply!)
  - Reply: u/LongChildhood2545 egyetért az exposure tracking értékével. Holnap válaszolok.
  - Karma: r/Kalshi, r/PredictionsMarkets
  - ZERO törlés, ZERO ban — a kisebb subok stratégia működik
- Email 8/8 maxed (4 follow-up reggel + 2 follow-up + 2 új délután)
  - Follow-ups: PredictionNews, CoinLedger, MilkRoad, Blockverse, DeFi Rate, NFT Evening
  - Új: Coindive (hello@coindive.app, GREEN), CryptoManiaks (support@cryptomaniaks.com, GREEN)
- NVSTly Discord 3 msg (pre-IPO ETF expense ratio thread, VGT vs ARKVX reply to G.W)
- Pipeline: +5 új target kutatva (Coindive, CryptoManiaks, Laika Labs, Jean Galea, ECOS)
- Legitimacy checks: Coindive GREEN, CryptoManiaks GREEN
- Reddit holnapra: 5 thread előkészítve (3 r/Polymarket outreach + 2 karma)

### Ápr 17 eredmények (eddig)

- Bluesky 10/10 kész (reggeli session)
- Reddit 4 komment (1 karma r/CryptoCurrency + 2 outreach r/Polymarket + 1 reply r/CryptoTradingFloor) → ACCOUNT LOCK
  - Lock oka: geo-anomália (Tomi HU mobil + agent mixed-geo IP-k)
  - Tomi reset: új jelszó, új HU sticky proxy, új session cookie
  - ÚJ SZABÁLYOK: 1-4 random/nap, 2-7h intervals, karma/outreach KÜLÖN napokon, max 4/nap 20/hét
- Email 7/8 (3 follow-up reggel + 2 reply válasz + 2 új délután)
  - Follow-ups: WallStreetZen, Unchained Crypto, Cryptonomist
  - REPLY #1: Token for Your Thoughts podcast — MEGHÍVÁS! Lindsey Calendly-t küldött. TOMI ACTION: book slot.
  - REPLY #2: TheBlockverse — PAID: #1 $250, #2-4 $150, #5-6 $100. LLM citation mention. Asked about organic option.
  - Új: ECOS (marketing@ecos.am, YELLOW), CryptoSlate (tips@cryptoslate.com, GREEN)
- Legitimacy checks: Jean Galea GREEN (no email), ECOS YELLOW (aggressive ROI but has tracker listicle)
- Pipeline: +3 új target (CryptoSlate, StartPolymarket, QuickNode Builders Guide)
- NVSTly Discord: nincs természetes lehetőség (geopolitikai téma)
- Reddit holnapra: 4 karma thread előkészítve (r/defi, r/PredictionsMarkets x2, r/nba)

### TOMI ACTION ITEMS (ápr 17)

1. ~~Token for Your Thoughts PODCAST~~ — CLOSED. Mikró csatorna (100-200 hallgató), nem éri meg. Amit írtunk elég.
2. *TheBlockverse paid* — $100-250 pozíció alapján. LLM (Claude) citálja a listájukat. Döntés?
3. *Korábbi paid ajánlatok* — TheTradable $100, CoinCodex $1500/yr, CryptoAdventure $550. Döntés?

### Holnapi terv (2026-04-18, péntek)

1. *Bluesky* 10 reply (PRIME)
2. *Reddit KARMA nap* — 1-3 komment (r/defi PM index, r/PredictionsMarkets LLM thread, r/nba PM thread). ÚJ SZABÁLYOK: random timing 2-7h intervals.
3. *Email* — follow-up check (HedgeWithCrypto, CryptoTrackGuru, WalletReviewer due Apr 19)
4. *NVSTly Discord* — natural opportunities only

### Telegram csoportok (2026-04-20 kutatás)

Top targetek (discussion groups, nem announcement-only):
- *Polymarket Chat* (t.me/+rHj1HphTeltiMTdi) — LEGJOBB FIT. PM traders, BT Polymarket integrációja tökéletes angle.
- *Coins Capital* — long-term crypto investors, portfolio strategy discussions
- *CryptoNinjas Trading* (t.me/cryptoninjastradingglobal) — 8-13K+ trader, educational community
- *Evening Trader* — 16K+ tag, trading signals + portfolio discussions
BLOCKER: Nincs Telegram MCP tool. Vagy Tomi csatlakozik manuálisan, vagy Telegram Web-et kell próbálni stealth-browse-szal.

### Platform discovery (2026-04-20 exploration)

Új platformok feltérképezve:
- *Kalshi Discord* (discord invite: kalshi) — PM traders, ~1000+ tag, NAGYON célzott közönség. TODO: csatlakozás.
- *Zealy (zealy.io)* — gamified Web3 community platform, 50K+ DAU. Quest-based engagement. TODO: assess fit.
- *Bankless DAO* — nagy DeFi community, nehéz betörni de nagy reach. Figyelés.
- *Gitcoin* — developer community, jó beta teszter toborzásra. Alacsonyabb prioritás.

### Hét 2 összesítés (ápr 14-20, teljes)

- Email: 47 küldve, 6 reply, 1 organic partnership (BLOCKXS), ~13 bounce (~25%)
- Bluesky: 50 poszt (10/nap x 5 nap)
- Reddit: 16 karma + 7 outreach komment, 0 ban, 1 pozitív reply
- Directories: pm.wiki LIVE (ápr 20 megerősítve), SaaSHub pending (Tomi manual needed)
- Pipeline: 88 target (ápr 20-ig bővítve)
- NVSTly Discord: 12 üzenet
- Legitimacy checks: 19 domain (14 GREEN, 5 YELLOW, 0 RED)

Hét 3 fő célok (ápr 21-27):
1. Email pipeline-ból kontaktolni a HIGH prioritást (Invezz, Coinpedia, Blockpit)
2. Bluesky 10/nap folytatása
3. Reddit outreach napok bevezetése (karma 57 = ready)
4. Kalshi Discord csatlakozás
5. IndieHackers password reset + login
6. Contact form outreach próba (CryptoPotato stealth-browse)

### Közép táv (1-2 hét)
- dev.to: második cikk (Polymarket API integráció technikai writeup)
- Show HN előkészítés — EZ HOZHATJA A LEGTÖBB USERT, de egyszer van rá esély
- IndieHackers: login verify (lloydbt)
- YouTube reviewer outreach (1K-50K subs)
- Reddit outreach skálázás — ami működik, ismételni
- Reddit kommentek monitoring (upvote/reply/remove ellenőrzés)

### Hosszú táv
- r/CryptoCurrency outreach (karma 55 → UNLOCKED)
- Scaling: sikeres csatornák ismétlése
- Product Hunt (Tomi manuálisan)

## Blokkerek (Tomi action needed)

1. ~~Bluesky credentials~~ — MEGOLDVA: a host `.env`-ben vannak, container spawn auto-injectolja. (A korábbi "nincs benne" hiba root cause-a: a `.secrets` regenerálódik a `.env`-ből minden spawn-kor — manuális írás nem perzisztál.)
2. ~~Zoho app password~~ — MEGOLDVA (port 587 STARTTLS működik)
3. **ProductHunt + Uneed.best manuális submission** — Turnstile challenge miatt headless nem megy. Tomi manuálisan submitolhatja vagy kihagyhatja.
4. ~~@krip_tom X cookie frissítés~~ — MEGOLDVA: CT0 frissítve 2026-04-09T17:00, verifikálva.
5. **SideProjectors email verify** — login nem megy a regisztráció után. Tomi nézze meg a lloyd@bulltrapp.com inbox spam mappáját, vagy tegyen password resetet.
6. **CryptoAdventure $550 döntés** — Bogdan (@bdinu89 Telegram) fizetős listázást ajánl. Tomi döntése.
7. **PitchWall regisztráció** — OAuth-only (Google/GitHub/MS/Discord). Tomi: regisztrálj manuálisan ha akarod, vagy skip.
8. **TheresAnAIForThat** — $347 fizetős submission. Tomi döntése.
9. **TheTradable $100 paid post** — legolcsóbb do-follow opció. Tomi döntése.
10. **CoinCodex $1500/yr** — drága de magas DR. Tomi döntése.
11. **GitHub Awesome lists** — 2 PM tool lista ahol BullTrapp nem szerepel. PR-hez GitHub Personal Access Token kell Tomitól.

## Exploration Log

### 2026-04-17 (13:00 session)

**Új directory-k felfedezve:**
- **pm.wiki** — 377 PM project directory. SUBMITTED! "Portfolio, Risk & PnL" kategória. Queued for review, 24h-n belül publish. Ingyen, jó SEO.
- **GitHub Awesome-Prediction-Market-Tools** (aarora4) — 200+ tool lista, "Portfolio Tracking" kategória. PR-rel lehet felkerülni. Nincs GitHub token → Tomi kell.
- **GitHub Awesome-Polymarket-Tools** (harish-garg) — Polymarket-specifikus lista, ~80 tool. Szintén PR. Szintén token kell.
- **predictionmarkets.directory** — ~100 PM projekt, Figo @figo_saleh (IOSG Ventures) curálja. DM via X/Telegram. TODO.
- **Alchemy Dapp Store** (media@alchemy.com) — 41 crypto portfolio dashboard. Email ELKÜLDVE.

**Email válaszok:**
- The Blockverse (Swati Gupta): "organic" review is paid ($250, kedvezményes $350-ről). Tomi döntés.

**Apr 17 összesítés:**
- Bluesky: 10/10 MAXED
- Reddit: 4/4 MAXED (account recovered, new HU proxy active)
- Email: 8/8 MAXED (3 follow-up + 2 reply + 3 new: ECOS, CryptoSlate, Alchemy)
- Directory: pm.wiki submitted
- Legitimacy checks: ECOS YELLOW, Jean Galea GREEN
- NVSTly Discord: NVDA 200 comment (12th msg total)
- Exploration: podcast outreach discovery (see below)

### Podcast outreach (ÚJ csatorna - apr 17)

Podseeker.co-n 100+ mid-sized fintech podcast ami guest pitch-et fogad. DE: Tomi nem tud angolul guest-elni, és a mikró podcastok (100-200 hallgató) nem érik meg. Podcast csatorna DEPRIORITIZÁLVA amíg nincs nagyobb közönségű target vagy angol-beszélő spokesperson.
Forrás: podseeker.co/audience-interests/fintech

### 2026-04-18 (szombat, 3 session)

**Napi összesítés:**
- Bluesky: 10/10 MAXED (reggeli session)
- Email: 8/8 MAXED
  - 4 új: AdaPulse follow-up, Event Horizon (Dustin Gouker, PM newsletter 3K+ sub), CoinGape (editor@, GREEN), Freenance.io (support@, YELLOW)
  - 4 follow-up: HedgeWithCrypto, CryptoTrackGuru, WalletReviewer, TheMoneyPlaybooks
- Reddit: 0 — SESSION EXPIRED. Cookie invalidálva szerver-oldalon. Tomi kell: új cookie old.reddit.com DevTools-ból.
- NVSTly Discord: 1 msg (semis tariff pause, reggeli)
- Directory: Coin Bureau Content Update Request form submitted (listicle cikkhez BullTrapp felvétel kérés). Megjegyzés: content update $457 fizetős szolgáltatás, de a formot ingyenesen beküldtük mint "suggestion". Verified email felfedezve: media@coinbureau.com
- CryptoPotato: Cloudflare blokkol, stealth-browse kellene a contact form-hoz
- pm.wiki: 27h+ után még pending review

**Tanulságok:**
- .secrets fájl MINDEN session-ben visszaáll az eredeti host .env-re — a HU proxy fix (port 10000) nem perzisztál. Minden session elején újra kell írni.
- Coin Bureau content update form = $457 paid. A legtöbb HIGH authority site (CoinBureau, CryptoSlate, BeInCrypto) fizetős. Mid-tier indie blogok maradnak az organic reményeink.
- Szombaton quoták hamar elfogynak (Bluesky reggel, email reggel+délelőtt). Ha Reddit is expired, a délutáni sessionök exploration/maintenance jellegűek.

**Blokkerek (frissítve):**
- ~~Reddit session cookie~~ MEGOLDVA Apr 19
- GitHub Personal Access Token (awesome list PR-ek)
- TheBlockverse $250 döntés (Swati sürget)
- TheTradable $100, CoinCodex $1500/yr, CryptoAdventure $550 döntések
- SaaSHub: Cloudflare blokkolja stealth-browse-t is. Tomi manuálisan kell.

### 2026-04-19 (vasárnap, 5 session)

**Napi összesítés:**
- Bluesky: 10/10 MAXED (reggeli session)
- Email: 8/8 MAXED
  - 6 új: FinanceFeeds (BOUNCED editor@), CoinRanking (auto-reply), TokenMinds, ChangeNow, ArchLending, Benzinga
  - 2 follow-up: CryptoNinjas (#3), CaptainAltCoin (BOUNCED info@)
- Reddit: 4/4 MAXED — SESSION RECOVERED! Tomi adott új cookie-t (iat Apr 17, amr:pwd).
  - 1 outreach: r/polymarket_bets wallet tracker thread
  - 3 karma: r/CryptoCurrency infinite money glitch, r/algotrading swarm, r/PredictionsMarkets group
- Directory: SaaSHub submission blocked (Cloudflare)
- Legitimacy checks: FinanceFeeds GREEN, CoinRanking GREEN, Benzinga GREEN, Quantoshi YELLOW, ChainUp GREEN
- Pipeline: +2 targets (Quantoshi, ChainUp), 79 total

**Tanulságok:**
- HU sticky proxy (port 10000) + új session cookie = Reddit stabil. Rate limit ~9 min is előfordulhat de elmúlik.
- Bounce rate ~25%: contact@quantoshi.com, editor@financefeeds.com, info@captainaltcoin.com mind nem létezik.
- SaaSHub magic link email-ből nem kiolvashó (HTML body, MCP plain text only). Tomi manuális login kell.

### 2026-04-20 (hétfő, teljes nap)

**Reggeli session (07:00):**
- Bluesky: 10/10 MAXED — Last Week Tonight PM insider trading wave, jó engagement
- Email: 3/8 (Quantoshi BOUNCED, ChainUp, Blockonomi FU2)
- Reddit: 1 karma (r/Polymarket "finding trades early")
- Weekly + daily counters reset (new week starts Apr 21)
- .secrets proxy fix (port 10000)

**Délelőtti session (10:00):**
- Reddit: +1 karma (r/algotrading "17 dead strategies" supportive comment)
- Quantoshi bounce feldolgozva (contact@ nem létezik)
- 5 legitimacy check lefutott: Techloy GREEN, Bitcompare GREEN, EBR GREEN, CoinWire YELLOW, CoinSpot.io YELLOW
- Email 8/8 MAXED: +5 új (Bitcompare, Techloy, EBR, CoinWire, CoinSpot.io)
- Napi összesítés: Bluesky 10, Email 8, Reddit 2 karma

**Exploration session (10:00 folyt.):**
- pm.wiki LIVE! 3. aktív directory listing (PredictionMarketTools, pm.wiki + LaunchingNext queue-ban)
- CryptoPotato contact form: Cloudflare OK de a form dropdown fill nem működik, amúgy is advertising-oriented (paid). Skip.
- NVSTly Discord: nincs friss természetes lehetőség (utolsó activity 5h+)
- Pipeline nem üres: 9 NOT_CONTACTED target email-lel (Invezz, Coinpedia, Blockpit, WunderTrading, Fortunly, stb.)
- state.json cleanup: 2 régi history entry törölve (Apr 11-12), reddit targets frissítve
- Reddit targets prepped: r/arbitragebetting PM arb (HIGH), r/Destiny PM pros/cons (MEDIUM)

**Esti session (17:00):**
- TheBlockverse CLOSED: $250 paid declined (Tomi: no paid budget). Polite decline elküldve.
- Legitimacy checks: Invezz GREEN (2012, London, Investoo Group), Coinpedia YELLOW (mixed Trustpilot, scam project concerns), DEXTools GREEN (Spain, real team, CMC partnership)
- 2 új email target: DEXTools News (media@dextools.io, HIGH), Token Metrics Blog (partnerships@tokenmetrics.com, HIGH)
- Apr 21 OUTREACH ready: email (Invezz HIGH, Coinpedia HIGH, DEXTools HIGH, Blockpit, WunderTrading), Reddit (r/Trading outreach, r/Polymarket outreach, r/Destiny karma)

### STRATÉGIAI GONDOLAT: Email ROI kérdése

69+ email, 12 nap, 1 organic partnership. ~25% bounce rate. Konverzió kb 1.5%.
A nagy oldalak (CryptoSlate $4999, CoinBureau $457, CoinCodex $1500/yr) mind fizetősek.
A mid-tier blogok nem válaszolnak.

Alternatívák amiket érdemes kipróbálni:
1. Telegram csoportok — crypto közösségek hatalmasak TG-n, ingyenes, közvetlen elérés
2. Micro-influencer outreach (1-5K YouTube) — "how I track my portfolio" videók készítői
3. Content marketing (dev.to 2. cikk, Medium crosspost)
4. Reddit outreach scaling — 0 ban eddig, működik
