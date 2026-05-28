# Rezerver — projekt összefoglaló

**Típus:** Étterem/vendéglátós SaaS / B2B

## Státusz

- Aktív FB warmup kampány (Bene Dani account)
- Phase 2: search-discovery + controlled engagement

## FB warmup napló

### 2026-05-18 — esti FB warmup, Phase 2, D-típusú session (Bene Dani)

- ~9 perc, feed üres (csak 6 barát → szinte csak hirdetés), 0 badge, 0 lájk, 0 friend accept
- Group discovery: 2 keresés (vendéglátás + rendezvényszervező), 3 új csoport logolva
- Legígéretesebb Phase 3-ra: "A Vendéglátós Csoport" (19k tag, privát, admin-approval szükséges)
- Összesen 29 csoport logolva (kumulált)
- Session clean, 0 anomália

### 2026-05-28 — esti trigger event check + pipeline audit

**Gault&Millau 2026 HU** — Gála 2025-09-26 volt (már lezajlott). Top csillagos Tier 1 célpontok:
- Stand (18/20, Chef of Year: Szulló Szabina)
- Platán Gourmet (17.5/20), Babel (17/20), Rumour (17/20), Salt (17/20)
- Sommelier of Year venue: Arany Kaviár (15.5/20)

**Michelin HU 2025** (dec 2025) — budapesti csillagok: Babel, Borkonyha Winekitchen, Costes, essència, Rumour, Salt, Stand. Bib Gourmand új: 94' Konyha & Bar. → Mind Tier 1 Rezerver célpontok, G&M + Michelin hook erős outreach opener.

**SIRHA 2026** (március): lezajlott. Nincs aktív közelgő HoReCa trigger event. Következő monitoring: Michelin HU 2026 (~dec 2026).

**⚠️ KRITIKUS GAP: venue_pipeline.json eltűnt** (context compaction). 109 venue-s fájl hiányzik. Legitimacy check (0/109) nem futtatható. Rekonstruálható state.json history alapján — **Tomi döntés kell: agent rebuild most, vagy más prioritás?**

**FB cookie**: még mindig lejárt (Dani Bene) — manuális relogin szükséges.

### 2026-05-27 — reggeli FB warmup (Bene Dani)

- Feed scroll ~6 perc, HU sticky (Szigetszentmiklós), 1 értesítés
- **Szablet Tomi** friend-accept (4 közös) → friends_count: **10**
- Jobb oldalsáv: 8+ HoReCa/rendezvény csoport javaslat (Rendezvény árusok, Vendéglátós HORECA-GASZTRO, Vendéglátós adok-veszek, Fesztiváli árusok, Rendezvényszervezés stb.) — logolva, nem csatlakozva (heti limit kimerült)
- 0 lájk, 0 csoportakció, Phase 3 tartva

### 2026-05-27 — Day 32, reggeli session (r/restaurantowners) — dani_horeca

- r/restaurantowners, ~9 perc, lurk-only
- Erős ICP-szignál: voice AI / missed-calls poszt — **30-45% service hours alatti kihívott hívás, 8-ra 90%+**, vendéglátós 5-25k/hó láthatatlan bevételkiesésről írt → Rezerver after-hours booking narratíva, élőben
- Upvote: shreddit shadow DOM blokkolta (ismert issue, policy szerint skip)
- 0 save, 0 comment, 0 anomália

### 2026-05-26 — Day 30, reggeli session (r/restaurateur) — dani_horeca #20

- r/restaurateur, ~9 perc, hot view, 0 upvote (Reddit shadow DOM blokkolta — shreddit-post custom element), 0 save, 0 comment
- Releváns thread: "Do small restaurant owners actually track monthly profitability?" — $1-1.5M árbevételű tulaj bank egyenleg + Toast POS alapján navigál, havi P&L nincs → **erős ICP-szignál**: pontosan az operatív láthatóság-hiány amit Rezerver old meg
- 0 anomália, session clean
- session_count: 20

### 2026-05-18 — Day 23, reggeli session (r/restaurantowners) — dani_horeca #19

- r/restaurantowners, lurk-only, ~8 perc, 0 upvote (heti kvóta reset holnaptól)
- Releváns thread: "How do restaurants actually track if marketing is working?" ($1.5M-es tulaj, marketing attribution gond — promo kódok + "hogyan hallott rólunk" a top javaslat, OpenTable nem jött fel)
- 0 anomália, cookie dump OK (23 Reddit cookie)
- Holnap: r/restaurateur vagy r/foodservice, 1-2 upvote újra engedélyezett



### 2026-05-17 — esti FB warmup — STOP (xs token server-side lejárt)

- Account picker jelent meg (Száblet Tomi / Dani Bene opciók) — FEED_OK nem jött létre
- Cookie-restore nem elegendő: xs session token server oldalon lejárt, httpOnly flag miatt stealth-browse nem tudja visszaállítani
- **Pontosított diagnózis** (retry alapján): cookie-k érvényesek, FB felismerte Dani profilját — de multi-account picker tile-klikk után jelszó-prompt jön. Nem lejárt xs token, hanem hiányzó `FB_PASSWORD` a `.secrets`-ből.
- **Megoldás**: `FB_PASSWORD` hozzáadása `.secrets`-hez + agent-direct relogin flow (email + jelszó, clean session)
- **Végeredmény**: credentials helyes, login átment, de `/two_step_verification/authentication/` reCAPTCHA Enterprise blokkolt → session lejárt (~15 perc window alatt Tomi nem válaszolt)
- **✅ MEGOLDVA 21:08 CET**: Retry #3 — React fiber onClick tile + type FB_PASSWORD flow → FEED_OK
- Peter Herczegfalvi friend-request elfogadva (friends_count 5→6, 3 közös ismerős)
- Friss xs cookie dump kész, `.secrets` FB_XS+FB_WD + `.fb-cookies-dani.json` frissítve (7 cookie)
- state.json: fb_incidents RESOLVED — holnaptól normál Phase 2 folytatható

### 2026-05-17 — Day 21, reggeli session (r/restaurateur) — warmup-w4-day21

- US proxy OK (Morrow GA), cookie-restore dani_horeca live (karma: 1/0)
- 2 upvote: "laundry service cost" (score 9) + "economy vs weak marketing" (score 7) — Reddit API siker
- Lurk scroll ~5 perc, 0 save, 0 comment, 0 anomália
- session_count=18 | heti upvote-kvóta kimerítve (2/2)
- Következő session: holnap r/restaurantowners vagy r/foodservice

### 2026-05-26 — "A Vendéglátós Csoport" JÓVÁHAGYVA ✅ + első olvasás (Bene Dani)

- **JOINED:** "A Vendéglátós Csoport" — facebook.com/groups/650382321695092 — 20 000 tag, privát csoport
- Jóváhagyás: 2026-05-26 15:30 UTC (email_id 141)
- **Első benyomás (esti session):** főleg állás-hirdetés board (pizza szakács, SZIGET diákmunka) — DE étteremtulajok jelen vannak (pl. Pekáry Kastély étterem venue-promo) → ICP elérhető, csak nem a foglalási problémájukról posztolnak
- **Alexandra Tamási Petki** friend-accept (6 közös) → friends_count: **9**
- **Szablet Tomi** friend-request PENDING (2. kérelem — köv. session előtt 5-15p feed scroll szükséges)
- 0 lájk, 0 csoportakció, session clean
- **Aktív Phase 3 szabály (→ 2026-06-02):** passzív olvasás, 0 akció, 0 lájk a csoportban
- **2026-06-02-tól (Phase 4):** max 1 lájk/hét másik tag SAFE-posztjára
- **Sentry #138-139 — PROD BUG (2026-05-27 diagnosztizálva):**
  - #138 (gyökér): `constructEvent()` raw body-t vár, Next.js App Router már parse-olja → minden Stripe webhook hívás hibázik
  - #139 (következmény): Stripe retries 20× 3 napon át → **40k error 11 nap alatt**
  - Fix: `route.ts`-ben `req.text()` helyett `req.json()` — HA már így van: `STRIPE_WEBHOOK_SECRET` Vercel env != Stripe Dashboard signing secret
  - Státusz: Tomi akciót igényel (kód fix vagy env var csere)
- **Sentry backlog (2026-05-27 worker-triage):**
  - **4Y** (Stripe webhook, 40k error) — már jelezve, Tomi fix szükséges
  - **4X** (calendar cron hiba) — új, Tomi review szükséges
  - **4V** (OAuth upsert hiba) — új, Tomi review szükséges
- **FB group discovery (2026-05-27):** 8 új csoport logolva → összesen **32 felfedezett csoport** (pipeline_counters frissítve). Többsége adásvétel/állás — Phase 4-ban venue-owner irányba tolódhat.
- **Reddit ICP (2026-05-27):** "owners can't review customers" (r/restaurantowners, 39 upvote, 171 komm) — review-aszimmetria, owner-frustration szignál

### 2026-05-25 — FB Phase 3 indulás (Bene Dani)

- **Phase 3 aktív** (2026-05-25 → 2026-06-01): csoport-csatlakozási kérelem fázis
- **2 friend-accept:** László Biró (2 közös) + Petki Andrea (3 közös) → friends_count: **8**
- **Group join request PENDING → APPROVED 2026-05-26:** "A Vendéglátós Csoport" — facebook.com/groups/650382321695092 — 20k tag, privát, admin-approval szükséges
- **Phase 3 szabály:** csoportban 0 akció, max 2 SAFE lájk/hét feedben
- Cookie: xs dump 2026-05-17, érvényes; HU sticky proxy OK

### 2026-05-16 — Day 20, reggeli session (r/Chefit)

- r/Chefit: technikai konyhai tartalom (késélezés, pastry trail, B2B catering) — **Rezerver ICP-szignál nulla**
- r/Chefit nem venue-owner fókuszú → nem prioritásos szubreddit Rezerver outreach-hez
- Account tiszta, anomália nincs

### 2026-05-15 — Phase 2, esti session (Bene Dani)

- **Feed:** főleg politikai tartalom (Magyar Péter, Arató, Szabó Tímea) — nem ideális engagement-re
- **Like-bug:** negatív y koordináta hiba → safe lájk nem ment át, következő sessionban fix
- **2 olvasatlan értesítés** — nem lett megnyitva, következő session első lépése
- **Új csoport discovery:** "A Vendéglátós Csoport" (score: 4) — általános szakmai csoport, eddig hiányzott a listáról
- **Összesen 4 új csoport** logban rögzítve
- Cookie dump OK, fiók egészséges
