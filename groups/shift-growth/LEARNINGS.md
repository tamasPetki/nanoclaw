# Drift — LEARNINGS (a cron ELSŐKÉNT ezt olvassa minden futáskor)

> Tartós operating-tanulságok. A market-/versenytárs-/fájdalom-/GTM-tudás NEM ide jön — az az
> `intel` DB-be (`bun intel/intel.ts …`). Ide csak a MUNKAMÓD-szabályok kerülnek.

## ⏱️ Build-fázisú A2A cadence (Axiom, 2026-06-16) — TOKEN-TUDATOSSÁG

A megosztott budget a BUILD-é. A puszta standing-watch enrichmentet **bankold a `intel` DB-be**
és fűzd egy **~napi digestbe** — NE ébreszd Axiomot minden find-re.

**A2A-val AZONNAL csak 3 esetben:**
- **(a) RED-szintű versenylépés** (valaki zárja a NAV-loopot, v. a delivery-tag bizonyítottan KKV-ba szivárog).
- **(b) Shipped-claim-korrekció** — ha egy MÁR kiadott állítás (MARKET/landing/ADR) hibás v. cáfolható
  (pl. a „6200 OPTEN" szám korrekciója — ez a kategória pingelendő).
- **(c) Pilot/GTM-hívás** — amikor Axiom konkrétan kéri a copy + MASZK + DIMOP muníciót.

Minden más find: csendben a DB-be, ~napi digestbe összefűzve. A per-find ébresztést visszafogjuk.

## 🪜 ESCALATION-LÉTRA P0/P1/P2 (kadencia-doktrína, 2026-06-18) — a fenti bináris helyett

A fenti AZONNAL/RED vs digest besorolás **három szintre formalizálva** (METHODOLOGY §17, a gastown `gt escalate`
mintájára). Routing: **Drift → Axiom → Tomi** (Axiomot sosem ugrom át).
- **P0 — CRITICAL:** NAV-loop shipped-zárás (Almetra, #0), kiadott-állítás-korrekció, pilot/GTM-hívás → **AZONNAL A2A
  Axiomnak**. (Axiom dönt Tomi felé az actionable + nem-éjszaka szűrőn — nem az én dolgom.)
- **P1 — HIGH:** releváns, nem sürgős terv-formáló jel → **~napi digest**.
- **P2 — MEDIUM:** enrichment / low-freq watch → **csendben az `intel` DB-be, heti szintézis**, ébresztés nincs.
A fenti „A2A-val AZONNAL csak 3 esetben" (a/b/c) = a P0-halmaz; a „minden más csendben a DB-be" = P1+P2.

## 🔭 Standing low-freq watch (insight 28+43 a DB-ben) — a versenykép wind-down (2026-06) UTÁN

A 7-körös versenykép-mélyítés LEZÁRVA (a moat empirikus: ADR-021). Alacsony frekvencián ezekre figyelek:

> **POSZTÚRA (Axiom, 2026-06-17):** a cold-start / könyvelő-GTM frame FELTÉRKÉPEZVE (MARKET §21-23, insight 53-54, outreach 6) → GTM-időre kész, de BUILD-fázisban vagyunk, hónapokig nem aktiváljuk. **NE mélyítsd tovább** (diminishing return) → standing-watch-ra téve; a szabad-kutatást a KÖVETKEZŐ BUILD groundingjára fordítom (directed-mód §11c). Csak akkor térek vissza a GTM-re, ha (a) Axiom kéri, v. (b) lényegi külső változás (új DIMOP-kör, MVP-intake, EU-entrant HU-lépés).

### 🚨 #0 — ÁLLÓ ESCALATION-SZERZŐDÉS: Almetra (Axiom, 2026-06-16, RISKS) — az EGYETLEN valódi RED-jelölt
Almetra (comp 10) MÁR birtokolja a builder-facing terv-tény UX-et + a strukturált projekt-költség-adatkörnyezetet, ÉS publikusan deklarálta az AI-szándékot ("ma még nem AI-szoftver" → "adatkörnyezet, amelyre később AI-réteg építhető"). A két hiányzó darabja PONT a mi wedge-ünk → **finite-window**. **AZONNALI A2A (RED), ha bármi SHIPPED (nem deklarált) megjelenik náluk:** (a) AI-auto-kategorizálás VAGY (b) direkt NAV-inbound-pull / Online Számla-feed. Deklarált intent = WATCH; shipped = RED. Szorosan tartani.

### Másodlagos jelek
1. **Delivery-tag-erózió** — BauApp DTLS tényleges KKV-penetrációja (sínek kiépítve: AIScan + 99 EUR self-serve; penetráció bizonyítatlan).
2. **NAV-loop-erózió (Almetrán túl)** — Kulcs-Soft (comp 20) építőipari-tétel-szintű + AI-auto-kategorizálás + builder-UX kiadása (ma: csak könyvelő-eszköz, manuális projekt-tag).
3. **e-napló-API nyílása** (INFO-024) → a workflow-moat egy része eltűnne. STÁTUSZ 2026-06-17: a 2026-os hivatalos változások közt NINCS API/gépi adatkapcsolat; a kézikönyv is csak webes/lokális kézi rögzítést ismer, export=PDF → a moat HOLDS, a jel NEGATÍV (insight 44, 58). KONKRÉT FORWARD-WATCH-FORRÁS: a **Lechner OÉNY 3D-adatinfrastruktúra-keretrendszer** (állami modernizáció, közbeszerzési műszaki leírás) — ha gépi adatkapcsolatot/API-t nyit, a moat-idő korlátozott → escalate.
4. **e-napló feltöltési-mandátum KITERJESZTÉSE a kivitelezési/alvállalkozói szerződésre** (Axiom, 2026-06-17) — ma csak tervezési+beruházáslebonyolítói szerződés kötelező a tervnaplóba (2026-04-01, verziózott+anonimizált). HA kiterjed a kivitelezésire → **közvetlen szerződés-pillér demand-trigger → A2A** (insight 44).
5. **DIMOP** vidéki új-kör-keret nyitása (channel 18) — CAC-unlock. STÁTUSZ 2026-06-16: /B-26 vidék KIMERÜLT, csak /C-26 (Budapest) él (hat.idő 2026-06-30); vidéki vevőhöz új keretre várni.
7. **~~BUILD-SIGNAL forward-marker: pilot-confirm-rate~~ → DEPRIORIZÁLVA (ADR-030, Axiom 2026-06-18).** Tomi MOST NEM rögzít valós adatot — folyamat-megfigyelő ('akkor használja, ha nagyon fejlett'). → A confirm-rate realitás NEM jön közeli éles pilot-adatból; NE várd, NE kérdezd. A Layer 2 #1 kockázata (confirm-rate) nyitva marad, de a market-validáció (insight 68 üres tér + insight 64 B2B-norma) elég alátámasztás egyelőre. A KÖVETKEZŐ market-releváns szál NEM a pilot-jel, hanem Axiom ÚJ recon-iránya, amikor új réteget kezd (valószínűleg ütemezés-pillér v. NAV-költség mélyítés).
6. **EU AI-native entrant HU/CEE-lokalizációja** (insight 52, scan 2026-06-17) — a 'generikus AI-native PM a priced-out SME-nek' pozíciót jól-fundált EU-startupok foglalják (Pillar IT comp 26, plancraft DE comp 27, Construction AI UK comp 28). Egyik sincs HU-ban + egyik sem direkt-adó-pull. TRIGGER: bármelyik HU/CEE-lokalizáció v. magyar-nyelvű verzió bejelentése → escalate (akkor a HU-lokalizáció az egyetlen védelem). A pozícionálásban 'magyar' > 'AI' a fő-differenciátor (az AI-native table-stakes). **PILLAR (comp 26) SÚLYOZVA ELÖL** (Axiom, 2026-06-17): a legközelebbi (AI operating system + workforce, legjobb-fundált, aktívan nemzetköziesít) → a VEZETŐ indikátor a terjeszkedési-célpiac KORAI jelei (bármilyen CEE/HU expansion-bejelentés, célpiac-említés, magyar hire/partner), NEM csak a kész magyar verzió.

## 📌 Parkolt termék-szálak (P2-P3, alacsony prio — ha a passzív kutatás útjába esik)

- **Alvállalkozói SZERZŐDÉS-pillér** (Axiom, 2026-06-16): egységes sablon → AI-generálás → online aláírás
  → AI-review + iktat → lefedettség-nézet. Nyitott kérdés: van-e HU/EU építő-PM, ami sub-szerződés-gen +
  e-aláírás + AI-iktatás SME-szinten? (Light-touch dig elindítva 2026-06-16; DB-ben a competitors/insights.)
- A 3-pillér moat-bővülés (cost + crew-continuity + sub-reliability) build-roadmap: lásd insight 35-37.
- **BANKOLT deferred-action — LiLBuild trial-account ellenőrzés (Axiom, 2026-06-17):** a LiLBuild bejövő-számla-modul
  login-gated mélysége (van-e rejtett NAV/számlázó-import) publikusan nem zárható 100%-ra. Moderate-high MOST elég.
  **TRIGGER:** amikor a NAV-pull differenciátort PUBLIKUSAN tesszük (pre-build-in-public / marketing) → AKKOR kérek
  Tomitól LiLBuild trial-fiókot a Bejövő-számla-képernyő import-gomb ellenőrzésére (moderate-high → airtight).
  Addig NE kérd (legolcsóbb kísérlet a szükség pillanatában). Vonatkozó: insight 47.
- **BUILD-IRÁNY LOCK + BANKOLT Tomi-input — supplier-tagging (b)-mód (Axiom, 2026-06-17):** a supplier-tagging MVP-path
  a no-login generikus (a) (ADR-018) — MINDIG elérhető. A (b) e-rendelés-integráció (tüzép B2B-webshop → projekt-tag
  az ordernél → order-data a cost-loopba) **NEM épül spekulatívan.** TRIGGER: amikor a supplier-tagging feature-höz
  érünk → pilot-időben Tomi VALÓS kereskedőjén át verifikálni (NEM vendor-outreach): melyik tüzép + van-e kivitelezői
  B2B webshop + exportálható-e az order-data. Igen → (b) valódi + egyszerre nyílik a GTM-csatorna; nem → (a) lefedi.
  Ez az EGY Tomi-input nyitja ki mindkettőt. Vonatkozó: insight 50.
- **BANKOLT deferred-verifikáció — doc-hub verzió↔PO határ (Axiom, 2026-06-18):** a Procore/BauApp PONTOS verzió↔PO/cost-link határának airtight-ellenőrzését (hogy a 'spine-linket senki nem köti' copy ne legyen támadható) NE most költsük el (LEARNINGS#6(5): scarce-forrás csak közvetlenül PUBLIKUS állítás előtt). STÁTUSZ: build-fázis, process-observer pilot, nincs közeli launch → a scope-olt cut (spine-link ≠ verziókezelés, insight 70) elég a spechez. TRIGGER: amikor a spine-link-differenciátort PUBLIKUSAN tesszük (build-in-public/landing/marketing) → AKKOR airtight-verifikáció. Addig parkol.
- **EMERGENS-ONLY watch (NE hajszold) — HU-sub terv-megnyitási valóság (Axiom, 2026-06-18):** hogyan kapják/nyitják meg a subok a terveket (Drive-link tap-rate, nyomtatás-arány) — a share-link cut formáját élesítené (insight 70 SZÁL 3), DE csak ha MAGÁTÓL felszínre jön (fórum/eset). Aktívan NE kutasd; ha emergens jel jön, bankold. + ROKON (Axiom, 2026-06-18, ADR-031 §A lead=auto-file inbox): a **Viber→app doksi-megosztás HU-valósága** (share-sheet vs egyéb) — a §A ingest erre épül, DE inkább architect-feasibility mint market-intel → csak ha keresztezi az utamat, NE hajszold.

## ⛔ PRE-CLAIM gate-ek (copy/pozícionálás — NE sértsd meg jövőbeli copy-runban)

- **SCOPE-THE-CLAIM (módszertan, Axiom 2026-06-17):** egy kategóriában lehet moat, ami a SZOMSZÉD kategóriában
  commodity → a 'csak mi' / 'egyedi' állítást MINDIG scope-old a kategóriához. Konkrét precedens: a bejövő-NAV-auto-pull
  COMMODITY az ügyviteli/könyvelési világban (Cégmenedzser/Kulcs/Novitax/MiniCRM), de ABSENT az építőipari-PM-ben →
  a helyes copy 'egyetlen építőipari PM-tool sem köt natív NAV-pullt a projekt-költségsorra real-time', NEM 'senki nem
  csinál auto-pullt' (utóbbi cáfolható). Minden 'csak mi'-állítás előtt: nézd meg a szomszéd kategóriát is. (insight 47)
- **Szerződés-pillér aláírás-érvényesség (gtm 34):** amíg jogász nem erősíti, a copy CSAK 'egységes sablon +
  iktatás + coverage'-t ígérhet, NEM 'jogilag érvényes aláírás'-t. Feloldás: jogász-megerősítés után.
- **Read-receipt / send-for-confirmation jogi súlya (insight 57, Axiom 2026-06-17):** az egyszerű chat/üzenet-megerősítés HU-ban NEM teljes bizonyító erejű (az ahhoz aláírás/ügyvédi ellenjegyzés/minősített e-aláírás kell), csak BÍRÓI MÉRLEGELÉS tárgya. A copy scope-olandó: 'erős, strukturált, mérlegelhető bizonyíték' IGEN — 'jogilag perdöntő/érvényes' NEM. A teljes bizonyító erő csatornája a pótmunkánál = az e-építési napló-bejegyzés + teljesítésigazolás (statute-backed, 191/2009); a termék a kettőt kösse össze.
- **A kattintásos confirm NEM 'elektronikus aláírás' (insight 59, Axiom 2026-06-17):** HU-ban az EGYSZERŰ e-aláírásnak alaki bizonyító ereje NINCS → a kattintás+időbélyeg+IP-t SOHA ne hívd 'elektronikus aláírásnak'/'digitális aláírásnak' (téves elvárás + támadási felület). Helyes szó: 'megerősítés/elfogadás' v. 'megerősített megállapodás-nyom' — 'erős, mérlegelhető bizonyíték (affirmatív, naplózott), jobb mint a WhatsApp'. Az 'aláírás' szó CSAK fokozott/minősített e-aláírás-tiernél engedélyezett (az már írásbeli).
- **Pilot-adat:** a konkrét pilot-számok (pl. NAV 47 számla/21 nap, gtm 32) BELSŐ proof, NEM publikus copy.
- **Korrigált szám:** a '6200 OPTEN' NEM építőipari csőd (nemzetgazdasági kényszertörlés) — a copyban a
  helyes építőipar-specifikus számok (~4000 felszámolás 2024, >2000 megszűnt 2025 jan-ápr; gtm 31).

## 🔒 Secrecy — passzív/publikus vonal (Axiom megerősítés, 2026-06-16)

A login-gate-elt FB-kivitelező-csoportok **member-szintű olvasása TILOS** (secrecy/ToS-kockázat). Csak passzív,
publikus forrás (oldal, doksi, fórum-preview, cikk, álláshirdetés). Ne lépj be, ne regisztrálj, ne posztolj/scrape-elj.

## 🗄️ Kanonikus tár = az `intel` DB (NEM md/json)

`bun intel/intel.ts stats | help | <noun> add | query "SELECT …"`. Táblák: competitors, pain_signals,
outreach_targets, channels, gtm_notes, insights, sources. A prózai szintézis is az `insight` táblába.
Heti `intel maintain` (dedup/smell).

## 🤖 Sub-agent figyelmeztetés

A kutató-agentek NÉHA maguk írnak a DB-be (egy financial-pain agent megtette: pains 18-22, sources 119-124,
insight 29), néha csak visszaadják + engedélyt kérnek. **Futás végén MINDIG ellenőrizd `intel stats` +
recent-query**, mit írtak ténylegesen, mielőtt magad hozzáadod — különben duplikálsz.
