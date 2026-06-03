# Rezerver Growth Strategy

> Ezt a fájlt én (Tomi growth agent) írom és frissítem minden session végén a tanulságokkal.

## Current Playbook

**Top imperatív szabályok. Session elején KÖTELEZŐ read (30 mp).** Ezek dominálnak minden döntésben — ha bármelyik más doksi (CLAUDE.md, platforms/*.md, state.json) ütközik egy itteni szabállyal, ez nyer. Új szabály emelése ide: 2-3 sessionön át ismétlődő, akció-orientált tanulság a `state.json.learnings`-ből (lásd Learnings lifecycle a CLAUDE.md-ben).

- **R1** Csendes karakterépítő fázisban (2026-04-18-tól) NINCS cold email/DM/komment. Inbox-only. Reddit warmup KIVÉTEL — read-only lurk a `state.reddit.warmup_cadence` szerint.
- **R2** Új venue/media target → kötelező legitimacy-check (`platforms/legitimacy-check.md`: e-cegjegyzek + NAV + Opten). RED verdict → BLACKLISTED, GREEN/YELLOW pipeline-ba.
- **R3** FB checkpoint / phone-verify / "ideiglenes zárolás" / Reddit "Suspicious activity" / 2FA-prompt → AZONNAL stop, Discord ping, NE próbálkozz tovább.
- **R4** BullTrapp / crypto / Polymarket témát SOHA ne említsd Rezerver-kontextusban (brand-keveredés tilos).
- **R5** Csak "béta, első 30 helyszín 3 hónap ingyen" árígéret. Más árazást/szerződési feltételt SOHA.
- **R6** Em dash (—), pontosvessző, "nem csak X hanem Y", buzzwords — TILOS minden HU outbound-ban (`voice.md`).
- **R7** GDPR opt-out kötelező minden cold email végén (aktiváláskor — most dormant).
- **R8** Reddit warmup nap 0-7 — read-only lurk, NULLA self-promotion, NULLA save/vote/comment. Nap 8-20 max 1 save/session. Lásd `platforms/reddit.md` "Daily warmup playbook".
- **R9** FB Phase 2 (2026-04-25-től) — SAFE-only lájk (időjárás/sport/közhír/mém/utazás), HoReCa-tartalmat SOHA ne lájkolj. Max 2 lájk/hét, 0 csoport-csatlakozás. Lásd `platforms/facebook-groups.md`.
- **R10** Discord proaktív posting csak a 4 trigger egyike alapján (új hipotézis / blocker / venue-reply vagy account-lock / phase-átmenet). Default: csend. Lásd `CLAUDE.md` "Discord proaktív posting (outbound)".

## Cél

**30 helyszín (B2B supply-first)** a waitlisten a Rezerver beta launchig. Demand oldal (B2C wedding planners, event organizers) = **Phase 2**, csak akkor aktiválódik ha 10+ venue onboarded.

**Időhorizont:** MVP 4-8 hét (FB warmup miatt az első hónap főleg venue email + FB read-only).

## Jelenlegi fázis: CSENDES KARAKTERÉPÍTÉS (2026-04-18-tól)

- **Kezdőpont:** 2026-04-18 (Tomi döntés: csendesre váltunk, nincs kimenő outreach)
- **Mit csinálunk:** ökoszisztéma-megismerés, pipeline-bővítés, inbox reply-only
- **Mit NEM:** cold email, sajtó-pitch, directory-registráció, FB/LinkedIn agent-akció (kommentelés/posztolás). **Reddit kivétel 2026-04-25-től**: u/dani_horeca account-építés EN-globális HoReCa scope-pal, warmup-fázis 4-6 hét (read-only lurk, semmi self-promotion). Ld. `platforms/reddit.md` + `state.reddit`.
- **FB:** **Phase 1 agent-aktív 2026-04-18-tól** (login + feed + notification badge check + search-discovery, ZÉRÓ engagement). Szabályok: `platforms/facebook-groups.md`.
- **Domain:** rezerver.com (nincs .hu verzió)
- **Landing page:** https://www.rezerver.com/demo
- **Persona:** Dani (growth kolléga, Tomi megbízásából) — de most csak reply-hoz aktív

## Csatornák értékelése (csendes fázis)

| Csatorna | Státusz | Megjegyzés |
|----------|---------|-----------|
| Venue B2B email | **DORMANT** | Majdani core csatorna, most csak pipeline-építés. |
| HU media pitch | **DORMANT** | Csak pipeline (szerkesztő + cikk), éles pitch NINCS. |
| Directory submission | **DORMANT** | Nem regisztráljuk még a Rezerver-t publikus helyre. |
| FB groups | **ACTIVE (Phase 1)** | Agent login + feed + notification check + search-discovery. Phase 1 = ZÉRÓ engagement 2026-04-25-ig. |
| LinkedIn HU | **DORMANT** | Tomi profil, Phase 2 (10+ venue után). |
| Reddit (EN-globális HoReCa) | **ACTIVE (warmup)** | u/dani_horeca live 2026-04-25, week 1 read-only lurk. Daily cron 8-10 CEST, ld. `platforms/reddit.md`. |
| Bluesky / X | **DORMANT** | HU HoReCa közönség nincs rajtuk. |
| **Venue pipeline bővítés** | ACTIVE | Google Maps, Wedding.hu, TripAdvisor, directory-k. Cél: 100+ NOT_CONTACTED target. |
| **FB csoport discovery** | ACTIVE | Google search nyilvános csoportokra. facebook_group_log.md-ben URL + metaadatok. |
| **HU media lista** | ACTIVE | 15+ publikáció + szerkesztő + cikkek (utolsó 90 nap). |
| **Konkurencia-kutatás** | ACTIVE | 5+ HU foglalási rendszer mapping (ár, USP, hang). |
| **Inbox reply** | ACTIVE | Csak bejövő kérdésre, Dani hangon. |

## Action plan — csendes fázis (első 2 hét)

### Hét 1 (csendes pipeline-építés)

1. Venue pipeline: Google Maps Budapest + vidéki nagyvárosok, Wedding.hu szállítói, TripAdvisor "Special Occasion". Cél: 80+ NOT_CONTACTED target legitimacy check-kel.
2. FB csoport discovery: Google search HU HoReCa / esküvő / rendezvény csoportokra. 20+ csoport URL, tagszám, leírás a facebook_group_log.md-ben.
3. HU media lista: 15+ publikáció + szerkesztő + 3-3 releváns cikk az utolsó 90 napból.
4. Konkurencia-mapping: 5+ HU foglalási rendszer (név, URL, ár, USP, hang).
5. Tomi manuális FB-teszt eredményének figyelése Discord-on. Ha zöld jelzés jön, következő fázis-tervet írunk.

### Hét 2 (observation + finomítás)

1. Pipeline bővítés folytatása (cél: 150+ venue).
2. Konkurencia-figyelés: mit csinálnak, milyen tartalmat készítenek, mit flex-elnek.
3. FB csoport tartalom-olvasás publikusan (bejelentkezés nélkül, nem minden csoport látható így): milyen kérdések jönnek vendéglátósoktól, milyen problémákra keresnek megoldást.
4. strategy.md `observations` szekció bővítése minden session után.
5. Ha Tomi zöld jelzést adott FB-ra, akkor új fázis-dokumentum + szigorú warmup terv. Ha nem, akkor stratégia-finomítás: email vs. LinkedIn vs. személyes Tomi network.

## Nyitott kérdések / hipotézisek (aktiváláskor teszteljük)

- **H1:** HU vendéglátósok gyorsabban reagálnak a FB Messenger DM-re mint email-re. — Teszt csak aktív fázisban, most csak observation.
- **H2:** A "béta fázis, első 30 ingyen" ajánlat erősebb hook mint a "1% fee". — A/B teszt aktiváláskor.
- **H3:** A Wedding.hu szállítói címtár supply-oldalra a legjobb forrás. — Pipeline-arány mérhető már most (hány target jött onnan).
- **H4:** Forbes HU / Transindex jobb reply rate mint HoReCa szakmai sajtó. — Aktiváláskor teszt.
- **H5:** Fine dining / rendezvényközpont gyorsabban dönt mint kis étterem. — Aktiváláskor teszt.

## Observations (csendes fázis jegyzetek)

*Session-enként töltsd fel: milyen konkurens mit csinál, milyen hang a HU HoReCa FB csoportokban, milyen kérdések ismétlődnek, mit hiányol a piac.*

### 2026-04-19 — Első pipeline-építés

- 23 venue target került a pipeline-ba egyetlen session alatt. Szegmensek: fine_dining (1), esküvő_fő_profil (2), rendezvényközpont (3), privát_étterem (1), kert_rendezvény (1), rooftop_bar/exkluzív (4), céges_rendezvény (2), kastély_kúria (2), hajó (1), egyéb (6).
- A HU rendezvényhelyszín-ökoszisztéma NAGYON jól indexelt Google-ban. Fő directory-k: rendezvenyhelyszinek.hu, eskuvohelszin.hu, eskuvoihelyszinkereso.hu, rendezveny.com, cegeshelyszinek.hu, topeskuvohelyszinek.hu. Ezekből mind gyűjthető target.
- Érdekes: a legtöbb venue NINCS online foglalási rendszeren — ajánlatkérős modell (form / email / telefon). Ez pontosan az a pain point, amit a Rezerver megold.
- Rooftop szektor boomol Budapesten (Guru Sky, High Note, Pluto, Liz & Chain, High Five) — ezek kisebb, exkluzívabb események, de magas ár és igényes közönség. Jó early adopter szegmens lehet.
- Kastély/kúria szegmens (Geréby, Fenyőharaszt) tipikusan esküvő-fókuszú, nagy kapacitás (350 fő). Komplex árazás — Rezerver itt adhat legtöbb értéket.
- Zsidai Csoport = több étterem egyszerre (Pierrot, Centrál). Ha sikerülne megnyerni, egyszerre több helyszín jön be. De döntéshozó corporate szinten — nehezebb.
- FB cookie-k hiányoznak a workspace-ből — valószínűleg az előző session .env-je nem lett perzisztálva. Tomi-nak jelezni kell.

### 2026-04-19 Session 4 — Vidék + Balaton + kastélyok bővítés

- Pipeline 92-re nőtt. A Balaton északi part (Tihany, Balatonfüred, Badacsony, Keszthely, Vonyarcvashegy, Hévíz) rendkívül gazdag esküvőhelyszín-ökoszisztéma. Borászat + panoráma + kastély kombó nagyon erős szegmens.
- Kastély/kúria szegmens Budapest környékén is bőséges: Brunszvik (Martonvásár), Károlyi (Fehérvárcsurgó), Dudits (Monor), Laffert (Dunaharaszti), Bodrogi (Inárcs), Gödöllői Királyi Kastély. Ezek jellemzően nagy kapacitásúak (100-350 fő) és komplex árazásúak — pont a Rezerver sweet spot.
- Vidéki városok (Miskolc, Székesfehérvár, Kecskemét, Nyíregyháza, Szolnok) mindenhol vannak rendezvényhelyszínek, de jellemzően 1-3 domináns venue per város. Kisebb piac, de kevesebb konkurencia is.
- FB cookie-k lejártak — Tovább gomb jelenik meg, nem engedi be jelszó nélkül. Tomi-nak frissítenie kell.
- Vass Pincészet Felsőörs és Sentio Birtok Pécsely — ezek a Balaton-felvidéki borászati esküvőhelyszínek már a pipeline-ban vannak korábbi session-ből, jó érzék volt belevenni őket.

### 2026-04-20 Session 1 — Pipeline 100+ elérve + venue tiering kész

- Pipeline 102-re nőtt (+10 vidéki target: Eger 2, Sopron 2, Visegrád/Dunakanyar 2, Győr 2, Siófok/Balaton déli part 2). A 100-as csendes fázis cél TELJESÍTVE.
- Venue tiering KÉSZ: mind a 102 venue tier-elve. Tier 1 (első outreach hullám): 46. Tier 2: 43. Tier 3: 13. Az arány jó — a Tier 1-es venue-k az esküvő/rendezvény fő profilú helyszínek + kastélyok, ahol a Rezerver értéke a legnagyobb.
- Dunakanyar (Visegrád): alulreprezentált volt a pipeline-ban, de erős esküvő-destination. Nagyvillám Panoráma Étterem = Dunakanyar legnagyobb étterme, 170 fős kapacitás, évtizedes esküvő-tapasztalat. Tier 1 jelölt.
- Nyugat-Magyarország (Sopron): Pro Village / Franciska Major érdekes — kétnyelvű (HU/DE), osztrák-magyar határ közelében. Potenciális cross-border appeal (bécsi esküvők HU-ban).
- Balaton déli part (Siófok): eddig csak északi part volt a pipeline-ban. Egy Csipet Nádas = természetvédelmi területen, gourmet konyha, unique vibe — az "anti-hotel" szegmens.
- FB cookie-k MÁR MEGINT lejártak — .secrets fájl frissült de ugyanazok a cookie értékek. Tomi-nak manuálisan kell friss cookie-kat exportálnia.
- Következő fókusz: personalization hooks a maradék ~68 venue-hoz + launch_content_battery prep elkezdése.

### 2026-04-20 Session 2 — HU media pipeline KÉSZ (19 target)

**Összesítés:** 19 HU média target feltérképezve. Célkitűzés (15+) teljesítve.

**Aktív, releváns tartalmú (HIGH/MEDIUM priority) lapok:**

| Lap | Kategória | Főszerkesztő email | Legfrissebb releváns cikk |
|-----|-----------|-------------------|--------------------------|
| Trademagazin | HoReCa szakmai | hermann.zsuzsanna@trademagazin.hu | 2026-04-16 (AI + digitalizáció) |
| Turizmus Online | HoReCa szakmai | info@turizmusonline.hu | 2026-03 (SIRHA, rendezvénypiac) |
| Vendéglátás Magazin | HoReCa szakmai | szanto.zoltan@turizmus.com | nincs online |
| Dining Guide | Gasztro | kovacs.nicolett@dining-guide.hu | 2026 trendek cikk |
| Portfolio | Üzleti | portfolio@portfolio.hu | 2026-03-31 (szállodai trendek) |
| Telex | Üzleti | ugyelet@telex.hu | 2026-02-17 (vendéglátás krízis) |
| G7 / Telex | Üzleti | istvan.vaczi@g7.hu | 2026-01-16 (éttermek bajban) |
| Piac & Profit | Üzleti | hollos.janos@piacesprofit.hu | szoftver vendéglátóknak |
| Economx | Üzleti | info@economx.hu | 2025-08 (HORECA startup) |
| Növekedés.hu | Startup | szerkesztoseg@novekedes.hu | 2026 startup programok |
| Forbes HU | Startup | nem_publikus | TBD |
| Gault&Millau | Gasztro | orsolya.haranghy@gault-millau.hu | nincs tech relevancia |

**Inaktív domainok (kizárva):**
- horecatrend.hu — timeout, nincs indexelt 2024-2026 tartalom
- saltmag.hu — timeout, nem elérhető
- menumagazin.hu — timeout, nem elérhető

**Media pitch szög (aktiváláskor):**
- HoReCa szakmai lapok: "Egyetlen HU SaaS, ami real-time árkalkulációval + azonnali foglalással megoldja a 'kérjen ajánlatot' problémát"
- Üzleti/startup sajtó: "Magyar SaaS gap a rendezvényfoglalásban — a Rezerver az első"
- Gasztro platformok: szükséges hook az étterem-technológia kontextusból (pl. AI foglalás, modern vendégélmény)

**Key learning:** A HU vendéglátós tech-sajtó megosztott. Trademagazin a legerősebb direkt HoReCa tech vonal. Portfolio/Telex/G7 = elérés + startup credibility. Forbes = prémium. Turizmus Online = rendezvénypiac specifikus + erős Rezerver fit.

## Competitive notes

*Utolsó frissítés: 2026-04-19. 10 platform feltérképezve, 3 kategóriában.*

### A) DIREKT KONKURENSEK — Venue/Event foglalási rendszerek

Jelenleg NINCS egyetlen magyar platform sem, ami real-time árazással és azonnali online foglalással működne rendezvényhelyszínekre. Ez a Rezerver fő USP-je.

### B) AGGREGÁTOR / DIRECTORY PLATFORMOK (venue listázás + ajánlatkérés)

#### 1. Rendezvenyhelyszinek.hu
- **URL:** https://www.rendezvenyhelyszinek.hu
- **Leírás:** Rendezvényhelyszín-kereső portál (konferencia, esküvő, tréning). 160+ helyszín. HotelPremio Group üzemelteti.
- **Üzleti modell:** Venue-k fizetnek éves listázási díjat + kiemelt pozíció felárat. Felhasználónak ingyenes.
- **Target:** Céges rendezvények, esküvők, konferenciák — inkább B2B event planner oldal.
- **Foglalás:** NINCS online foglalás. Ajánlatkérős modell: user kitölti a formot, a portál továbbítja a venue-nak.
- **Real-time árazás:** NINCS. Árak nem láthatóak, mindent egyedi ajánlatként kezelnek.
- **Hang:** Professzionális, szállodai corporate hangnem. Nem fiatalos, nem tech.
- **Gyenge pontok:** (1) Nincs árátláthatóság — a user vakon kérdeget. (2) Nincs online foglalás/fizetés. (3) Elavultabb design. (4) Csak aggregátor, nem SaaS — nincs valódi értéke a venue-nak a listázáson kívül.
- **Rezerver előny:** Real-time ár + azonnali foglalás + deposit fizetés = teljes pipeline automatizálás. Ami nekik hiányzik, az nálunk a core.

#### 2. Rendezveny.com
- **URL:** https://www.rendezveny.com
- **Leírás:** 500+ helyszín és szolgáltató kereső. Szintén HotelPremio Group (= rendezvenyhelyszinek.hu testvéroldala).
- **Üzleti modell:** Éves regisztrációs díj venue-knak + kiemelt hirdetési felár. Usernek ingyenes.
- **Target:** Meeting terem bérlés, céges rendezvények, konferenciák.
- **Foglalás:** NINCS online foglalás. Kizárólag ajánlatkérés.
- **Real-time árazás:** NINCS.
- **Hang:** Corporate, szállodai.
- **Gyenge pontok:** Ugyanazok mint rendezvenyhelyszinek.hu. A két oldal gyakorlatilag ugyanaz, más domain-en.

#### 3. Eskuvohelszin.hu
- **URL:** https://eskuvohelszin.hu
- **Leírás:** Esküvői helyszín és szolgáltató directory. 527 helyszín + 1000+ szolgáltató 17 kategóriában (fotós, virágkötő, DJ stb.).
- **Üzleti modell:** Freemium marketplace — ingyenes alaplista, kiemelt/prémium lista fizetős. Hirdetési banner bevétel.
- **Target:** Menyasszonyok/vőlegények (B2C). Esküvő-specifikus.
- **Foglalás:** NINCS online foglalás. Ajánlatkérés + közvetlen kapcsolatfelvétel.
- **Real-time árazás:** NINCS. "Nézd meg véleményeket, árazást, elérhetőséget" — de az árazás nem transzparens.
- **Plusz funkciók:** Esküvőtervező profil (vendéglista, költségvetés, ülésrend, feladatlista, esküvő-weboldal).
- **Hang:** Professzionális de barátságos, esküvői romantikus hangnem.
- **Gyenge pontok:** (1) Árak nem láthatóak. (2) Nincs foglalás/fizetés. (3) Csak esküvőre — nem általános rendezvény.

#### 4. Eskuvoihelyszinkereso.hu
- **URL:** https://www.eskuvoihelyszinkereso.hu
- **Leírás:** Esküvői helyszín kereső, szűrőkkel (Budapest, vidék, szállással, stb.).
- **Üzleti modell:** Directory, venue-k fizetnek a megjelenésért.
- **Target:** Esküvőt tervező párok.
- **Foglalás:** NINCS. Ajánlatkérés form.
- **Real-time árazás:** NINCS.
- **Gyenge pontok:** Ugyanaz az "ajánlatkérős" modell. Nincs semmi automatizáció.

#### 5. Cegeshelyszinek.hu
- **URL:** https://www.cegeshelyszinek.hu
- **Leírás:** 800+ céges rendezvényhelyszín. HotelPremio Group portfólió. Nemzetközi bővítés (Horvátország, Szlovénia).
- **Üzleti modell:** Venue-k fizetnek listázásért. Kiemelt ajánlatok feláras.
- **Target:** Corporate event planner-ek (tréning, csapatépítés, konferencia).
- **Foglalás:** NINCS online foglalás.
- **Real-time árazás:** NINCS. Részletes szűrés (kapacitás, programok, catering) de árak nem jelennek meg.
- **Hang:** Corporate, MICE-fókuszú.
- **Gyenge pontok:** Csak aggregátor. Nincs SaaS komponens.

#### 6. Helyszinonline.hu
- **URL:** http://www.helyszinonline.hu
- **Leírás:** Rendezvényhelyszín-kereső "helyszínspecialista" — profi rendezvényszervezők és helyszínértékesítők tapasztalatán alapul.
- **Üzleti modell:** Directory + media ajánlat venue-knak.
- **Target:** Profi rendezvényszervezők + céges ügyfélkör.
- **Foglalás:** NINCS online foglalás.
- **Real-time árazás:** NINCS.
- **Hang:** Szakmai, kicsit elavult design.
- **Gyenge pontok:** Régi weboldal, nem mobilbarát kinézet. Csak kereső, semmi SaaS.

**ÖSSZEGZÉS — Aggregátorok:** Mind a 6 aggregátor platform ugyanazt csinálja: venue listázás + ajánlatkérés form. EGYIKNÉL SINCS real-time árazás, online foglalás, vagy online fizetés. Ez a Rezerver teljes piaci rése: ami ezeknél a végpont (ajánlatkérés), az nálunk a kezdőpont (ár lekérdezés → foglalás → fizetés, automatikusan).

### C) ÉTTERMI ASZTALFOGLALÁSI RENDSZEREK (lehetséges expanzió event irányba)

#### 7. ReservOurs
- **URL:** https://reservours.com
- **Leírás:** Magyar fejlesztésű online asztalfoglalási rendszer. 2017 óta a piacon. ~200 partner étterem, évi 2-3 millió foglalás.
- **Árazás:** Havi 13.000 Ft-tól. Jutalékmentes. 2 hetes ingyenes próba. Vendégadatbázis az étteremé marad.
- **Target:** Éttermek, bárok, pubok.
- **Funkciók:** Interaktív asztaltérkép, iOS/Android app, vendég-adatbázis VIP tag-eléssel, Michelin Guide/FB/IG/Google Analytics/Mailchimp integráció, ajándékutalvány értékesítés, eseménykezelés (borkóstoló, szilveszter stb.), chatbot, automatikus emlékeztető, no-show csökkentés.
- **Real-time árazás:** Asztalnál NINCS árazás (foglalás ingyen), de az eseménykezelő modulnál van limitált jegyáras megoldás.
- **Hang:** Modern, tech-savvy, de magyar nyelven. Barátságos startup hangnem.
- **Gyenge pontok:** (1) Elsősorban asztalfoglalás, az event modul másodlagos. (2) Nem rendezvényhelyszín-specifikus — nincs terem-konfigurátor, csomag-összeállítás, deposit kezelés. (3) 200 partner = kis bázis.
- **Rezerver viszony:** NEM direkt konkurens, de ha event irányba bővítenének, átfedés lehetne. A Rezerver a rendezvény-foglalási szegmenst célozza (terem + csomag + ár + deposit), nem az asztalfoglalást.

#### 8. FoglaljOnline
- **URL:** https://www.foglaljonline.hu
- **Leírás:** Magyar éttermi foglalási rendszer. 500+ étterem használja. 185+ vélemény, 4.8/5 értékelés.
- **Árazás:** Havi 9.990–19.990 Ft, használat-alapú (foglalási volumen, éttermek száma, funkciók). 30 napos ingyenes próba. Nincs setup díj.
- **Target:** Magyar éttermek, kizárólag.
- **Funkciók:** Automatizált asztalkezelés, vendégprofilok, SMS + email emlékeztetők, QR-kód check-in, üzleti analitika, 3 foglalási form típus (standard, lépésről-lépésre, chatbot), mobil-responsive.
- **Real-time árazás:** NINCS (asztalnál nincs ár).
- **Hang:** Professzionális de megközelíthető. "5 perc beállítás, nulla technikai tudás." Magyar support hangsúlyozás.
- **Gyenge pontok:** (1) Csak asztalfoglalás, nincs event/rendezvény modul. (2) Nincs online fizetés. (3) Csak éttermekre — nem rendezvényhelyszínekre.
- **Rezerver viszony:** NINCS átfedés. Ők asztal, mi rendezvény. De ha egy étterem rendezvényteret is üzemeltet (és sok ilyen van), mindkettő kellhet.

#### 9. DISH (by METRO)
- **URL:** https://www.dish.co/HU/hu/
- **Leírás:** METRO leányvállalat, 320.000 étterem globálisan. HU piacon éttermi digitális csomag (foglalás, rendelés, weboldal, POS).
- **Árazás:** DISH Professional Reservation: havi 8.900 Ft + egyszeri 14.900 Ft aktiválás. DISH Premium (bundle: weboldal + foglalás + rendelés): havi 21.900 Ft + 99.900 Ft setup. 0% jutalék. SMS emlékeztető +4.000 Ft/hó.
- **Target:** Vendéglátósok széles köre (étterem, snack bár, food truck, bár, startup).
- **Funkciók:** 0% jutalék foglalásra, 24/7 online foglalás weboldalról + Google-ből, automatikus SMS/email emlékeztetők, drag-and-drop asztalkezelés, vendég-adatbázis, peak-time optimalizálás.
- **Real-time árazás:** NINCS.
- **Hang:** Corporate, de "egyszerű és elérhető" pozicionálás. METRO brand-háttér = megbízhatóság.
- **Gyenge pontok:** (1) Csak asztalfoglalás + rendelés, nincs event modul. (2) A METRO háttér miatt a kommunikáció néha corporate/generikus. (3) Beállítási díj magas a Premium-nál (99.900 Ft).
- **Rezerver viszony:** NINCS közvetlen átfedés. De ha a DISH event modullal bővülne, erős versenytárs lenne a METRO hálózat miatt.

#### 10. DinnerBooking
- **URL:** https://dinnerbooking.com/hu/hu-HU
- **Leírás:** Skandináv (dán) éttermi foglalási platform, HU piacon is jelen. 1.400+ étterem listázva. 25 millió user globálisan.
- **Árazás:** ~$170/hó (kb. 65.000 Ft). Nem átlátható árazás, angolul elérhető support.
- **Target:** Éttermek (étkezési foglalás + étterem-felfedezés).
- **Funkciók:** Asztalfoglalás, értékelések, éttermi események (jegyekkel), ajándékkártya.
- **Real-time árazás:** NINCS (asztalnál).
- **Hang:** Nemzetközi, profi, de a HU lokalizáció felszínes.
- **Gyenge pontok:** (1) Drága a magyar piacra. (2) Angol support. (3) Skandináv fókusz, HU másodlagos piac. (4) Kötelező user-regisztráció. (5) Nincs rendezvény modul, csak "éttermi események".
- **Rezerver viszony:** NINCS átfedés. Ők asztal, mi rendezvény.

### Összefoglaló táblázat

| Platform | Típus | Real-time ár | Online foglalás | Online fizetés | Event modul | HU ár/hó |
|----------|-------|-------------|----------------|---------------|-------------|----------|
| Rendezvenyhelyszinek.hu | Aggregátor | NEM | NEM | NEM | — | Venue fizet listázásért |
| Rendezveny.com | Aggregátor | NEM | NEM | NEM | — | Venue fizet listázásért |
| Eskuvohelszin.hu | Directory | NEM | NEM | NEM | — | Freemium |
| Eskuvoihelyszinkereso.hu | Directory | NEM | NEM | NEM | — | Venue fizet |
| Cegeshelyszinek.hu | Aggregátor | NEM | NEM | NEM | — | Venue fizet listázásért |
| Helyszinonline.hu | Directory | NEM | NEM | NEM | — | Media ajánlat |
| **ReservOurs** | Asztalfoglalás SaaS | NEM | IGEN | NEM* | Limitált | 13.000 Ft |
| **FoglaljOnline** | Asztalfoglalás SaaS | NEM | IGEN | NEM | NEM | 9.990-19.990 Ft |
| **DISH** | Asztalfoglalás SaaS | NEM | IGEN | NEM | NEM | 8.900 Ft |
| **DinnerBooking** | Asztalfoglalás SaaS | NEM | IGEN | NEM | Limitált | ~65.000 Ft |
| **REZERVER** | Rendezvényfoglalás SaaS | **IGEN** | **IGEN** | **IGEN** | **CORE** | 1% markup / 5% jutalék |

### Fő piaci tanulságok

1. **A HU rendezvényhelyszín-piacon NINCS SaaS megoldás.** Csak aggregátor/directory platformok léteznek, amelyek ajánlatkérést közvetítenek. Senki nem kínál real-time árazást + online foglalást + online fizetést. Ez TELJES piaci rés a Rezerver számára. *(⚠️ 2026-06-03 frissítés: ez RÉSZBEN elavult — a Dynex.hu hozott online foglalást + Stripe-fizetést + előleg-kezelést a HU vendéglátásba, DE event-oldalon még mindig ajánlatkérés-modell. Lásd Learnings 2026-06-03.)*

2. **Az asztalfoglalási SaaS piac viszonylag fejlett** (ReservOurs, FoglaljOnline, DISH, DinnerBooking, BookioPro), de ezek mind éttermi asztalfoglalásra specializáltak. Rendezvényre (terem + csomag + catering + deposit) egyikük sem alkalmas.

3. **Az aggregátorok üzleti modellje gyenge** — éves listázási díj, amire a venue csak passzív látogatót kap, konkrét foglalás nélkül. A Rezerver pay-per-booking modellje (1% vagy 5%) sokkal erősebb value proposition: a venue csak akkor fizet, ha tényleg foglalás történik.

4. **HotelPremio Group dominálja az aggregátor piacot** (rendezvenyhelyszinek.hu, rendezveny.com, cegeshelyszinek.hu — mind övék). De csak directory, semmi SaaS.

5. **Esküvő-specifikus directory-k (eskuvohelszin.hu, eskuvoihelyszinkereso.hu) erős pozíció** a demand oldalon, de a supply oldali technológia (foglalás, fizetés) teljesen hiányzik.

6. **Egyik competitor sem kínál deposit/előleg kezelést online.** Ez a Rezerver másik erős USP-je.

7. **A piac hangja:** az aggregátorok corporate/szállodai, az asztalfoglalók tech-barátabb de étterem-specifikus. A Rezerver "vendéglátós-barát, közvetlen" hangja (Dani persona) differenciáló lehet.

## Learnings

- **2026-06-02 — venue_pipeline.json részleges rebuild + context-compaction adatvesztés mintázat.** Az eredeti 109-venue fájl (+ vendor_pipeline.json + prep/ mappa) elveszett a 2026-05-28 context-compaction során. A NÉVVEL dokumentált 67 venue visszaállítható volt a state.history + observations alapján; a csak SZÁM szerint logolt ~42 vidéki target nem. Tanulság: a kritikus, hosszú életű pipeline-adatot (venue/vendor/prep) végig perzisztens JSON-ban kell tartani ÉS minden session elején ellenőrizni hogy a fájl létezik-e — a history nem elég granuláris a teljes visszaállításhoz (a batch-eket sokszor csak darabszámmal logoltuk, nem névvel). A per-venue tier-besorolás (46/43/13) és a 102 personalization hook elveszett, csak a G&M2026/Michelin-HU2025 Tier1 hook-ok jöttek vissza — ezek újra-építése Tomi-OK után.

- **2026-06-03 — ÚJ KONKURENS: Dynex.hu (competitive refresh).** A 6 hetes mapping óta felbukkant a Dynex.hu, az eddigi legközelebbi versenytárs. HU vendéglátóipari SaaS (kávézó/étterem/rendezvényhelyszín), ami a régi mapping szerint "senkinek nincs" stacket HOZZA: 24/7 online foglalás, **Stripe online kártyás fizetés + előleg-kezelés + visszatérítés**, AI asztalfoglaló asszisztens, rendezvényjegy-értékesítés, ajándékutalvány. Ár: használat-alapú vagy korlátlan 39.990 Ft/hó. **DE event-oldalon (rendezvényhelyszín) a Dynex NEM csinál automatizált real-time event-árkalkulációt** — ott "ajánlatkérés + utánkövetés + vendégkommunikáció egy rendszerben" (lead/inquiry-CRM), vagyis ugyanaz az ajánlatkérés-modell, csak jobb follow-up tooling. **Következmény a pozicionálásra:** a "senki nem csinál online foglalást+fizetést a HU HoReCa-ban" üzenet ELAVULT (Dynex asztalra igen). A védhető Rezerver-USP SZŰKÜL erre: **automatizált real-time EVENT-árazás (terem+csomag+catering konfigurátor) + azonnali foglalás komplex rendezvényekre**, szemben az univerzális ajánlatkérés-modellel. Outreach-aktiváláskor erre kell élezni az üzenetet, nem a tág "nincs SaaS"-ra. (Forrás: dynex.hu + funkciók/árlista, 2026-06-03 web-scan.)

## Tomi intervenciót igénylő dolgok (Discord ping-szenek!)

*Aktuálisan:*
- [x] Landing page URL megerősítve: https://www.rezerver.com/demo (2026-04-18)
- [x] Email: dani@rezerver.com + jelszó .env-ben (2026-04-18 — Mark letiltva VPN miatt)
- [x] Domain: rezerver.com (nincs .hu verzió) — minden file-ban frissítve 2026-04-18
- [x] Persona: Dani (growth kolléga), Tomi mint alapító hivatkozás
- [x] Csendes fázisra átállás: minden kimenő csatorna DORMANT
- [x] FB belépés-teszt: SIKERES 2026-04-18, agent-aktivált Phase 1 warmup-pal
- [x] FB warmup terv rögzítve `platforms/facebook-groups.md`-ben (Phase 1-4+, notification/friend-accept/SAFE lájk szabályok)
- [ ] Discord channel ID → DB `registered_groups` INSERT (channel 1494794728120782981)
- [ ] `REZERVER_DC_ID=1494794728120782981 bash scripts/schedule-rezerver-agent.sh` (csendes prompt-tal)
