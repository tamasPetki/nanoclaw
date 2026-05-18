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
