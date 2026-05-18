# FB Groups Log -- csatlakozas + warmup allapot

> Minden FB akciot (join, request, komment, lajk, incident) logolj ide csoportonkent. A napi quota a `state.json`-ban van, ez a "per-group history".

## Formatum

Minden csoporthoz egy blokk. Formatum:

```
## [Csoport nev]
- **ID / URL:** facebook.com/groups/<id> vagy <url>
- **Tagsag:** ~<X>k fo
- **Kategoria:** B2B supply / B2C demand / szakmai / egyeb
- **Elso interakcio datuma:** YYYY-MM-DD
- **Csatlakozasi statusz:** PENDING / APPROVED / DENIED / NOT_YET_REQUESTED
- **Approval datuma:** YYYY-MM-DD (ha megvan)
- **Warmup fazis:** 1 / 2 / 3 / 4+
- **Akciok:**
  - YYYY-MM-DD: read (X percig gorgettem, temak: [X, Y])
  - YYYY-MM-DD: like (post: "[poszt rovid cim]")
  - YYYY-MM-DD: comment ("[komment elso 50 karakter]", kontextus: [X], Rezerver mention: no)
- **Incidents:**
  - YYYY-MM-DD: [checkpoint / phone verify / account lock / egyeb]
- **Jegyzetek:** aktivitasi mintak, mely temak resonalnak, kik a thought leader-ek a csoportban
```

## Csoportok

---

### Kevesbe ehezo vendeglatosok
- **URL:** https://www.facebook.com/groups/327660847950241/
- **Tagsag:** TBD (FB-ben ellenorizendo)
- **Tipus:** zart (valoszinuleg admin-approval)
- **Nyelv:** HU
- **Kategoria:** B2B supply (etterem/vendeglatos tulajdonosok, szakmai beszelgetes)
- **Relevancia-score:** 5
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** A nev alapjan aktiv, velemenyformazo vendeglatos kozosseg. Magas prioritas -- tulajdonosok/vezetok csoportja. Potencialis target csoport Phase 3-ra.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "vendeglatas")
- **Phase-action:** Phase 3-ra shortlisted

---

### Vendeglatos Csoport HORECA -- GASZTRO, Adok-veszek
- **URL:** https://www.facebook.com/groups/1526131270935595/
- **Tagsag:** TBD
- **Tipus:** publikus / zart (FB-ben ellenorizendo)
- **Nyelv:** HU
- **Kategoria:** B2B supply + adok-veszek (HoReCa eszkoz/anyag)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** HoReCa + gasztro temaju csoport, adok-veszek resze kevesbe relevans, de a szakmai resztvevok ertekes targetek. Eszkoz/berendezes kereskedes + szakmai kerdesek keveredhetnek.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "vendeglatas")
- **Phase-action:** Phase 3-ra shortlisted

---

### Vendeglatos Csoport 2025
- **URL:** https://www.facebook.com/groups/vendeglatoscsoport/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply (altalanos vendeglatos)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eves frissitesekkel mukodo altalanos vendeglatos csoport. Nevbol itelve aktivan moderalt, evenkent ujrainditott.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "vendeglatas")
- **Phase-action:** Phase 3-ra shortlisted

---

### Rendezvenyhely szinek, teremberles - Budapest
- **URL:** https://www.facebook.com/groups/374572047075308/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply + B2C demand (rendezvenyhely szinek + teremkereses)
- **Relevancia-score:** 5
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** KIEMELT PRIORITAS -- kozvetlenul rendezvenyhely szin + teremberles tema. Supply es demand oldal is jelen van. Pont a Rezerver core temaja.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "rendezveny" "helyszin")
- **Phase-action:** Phase 3-ra shortlisted (TOP 5 jelolt)

---

### Teremberles-Budapest
- **URL:** https://www.facebook.com/groups/345876629076684/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply + B2C demand (teremberles)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Hasonlo a Rendezvenyhely szinek csoporthoz, teremberles fokusz. Kisebb lehet de relevans.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "teremberles")
- **Phase-action:** Phase 4-re halasztva (ha az elso rendezvenyhely szin csoport bejott)

---

### Rendezvenyszervezok
- **URL:** https://www.facebook.com/groups/510456542306715/
- **Tagsag:** TBD
- **Tipus:** TBD (valoszinuleg zart, admin-approval)
- **Nyelv:** HU
- **Kategoria:** B2B supply + partial demand (rendezvenyszervezok)
- **Relevancia-score:** 5
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** HIGH PRIORITY -- rendezvenyszervezok szakmai csoportja. Mindket oldal (helyszin + szervezo) megtalalhato. Idealis Rezerver kontextusban.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "rendezvenyszervezok" magyarorszag)
- **Phase-action:** Phase 3-ra shortlisted (TOP 5 jelolt)

---

### Eskuvore szolgaltato kereses datummal
- **URL:** https://www.facebook.com/groups/szolgaltatokereses/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2C demand + B2B supply (eskuvoi szolgaltatok keresese/kinalata)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eskuvoi szolgaltatok keresese datummal -- itt par-ok keresnek helyszint/szolgaltatot, de szolgaltatok is hirdetik magukat. Mindket oldal.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "eskuvo" szervezes)
- **Phase-action:** Phase 4-re halasztva (demand-oldal, 10+ venue utan)

---

### Eskuvo-eskuvoi szolgaltatok
- **URL:** https://www.facebook.com/groups/eskuvoiszolgaltatokcsoportja/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply (eskuvoi szolgaltatok kozossege)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eskuvoi szolgaltatok csoportja -- helyszinek, fotozok, zenekarok stb. Venue-szempontbol erdekes, de tagsag/aktivitas meg ellenorizendo.
- **Discovered:** 2026-04-19 (Google search: facebook.com/groups eskuvoi szolgaltatok)
- **Phase-action:** Phase 4-re halasztva (demand-oldal)

---

### Eskuvoi szolgaltatok
- **URL:** https://www.facebook.com/groups/527146824070349/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply (eskuvoi szolgaltatok)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Masik eskuvoi szolgaltatok csoport. Meg ellenorizendo, hogy mennyiben fed at az elozovel.
- **Discovered:** 2026-04-19 (Google search: facebook.com/groups eskuvoi szolgaltatok)
- **Phase-action:** Phase 4-re halasztva

---

### Eskuvore Keszulok Es Eskuvoi Szolgaltatok 2025 / 2026
- **URL:** https://www.facebook.com/groups/113384996077439/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2C demand + B2B supply (keszulok + szolgaltatok vegyesen)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Aktiv, evszammal frissitett csoport -- eskuvore keszulok ES szolgaltatok. Eves refresh = aktiv moderalas. Demand + supply mix.
- **Discovered:** 2026-04-19 (Google search: facebook.com/groups eskuvoi szolgaltatok)
- **Phase-action:** Phase 4-re halasztva (demand-oldal, de szolgaltato mix miatt erdekes)

---

### Vigyazz, kesz (?), eskuvo
- **URL:** https://www.facebook.com/groups/vigyazzkeszeskuvo/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2C demand (eskuvo szervezes)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eskulvovel foglalkozo csoport, valoszinuleg par-ok kozossege. Demand-oldal, Phase 2-ben erdekes.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "eskuvo" szervezes)
- **Phase-action:** Phase 4-re halasztva

---

### Magyarorszagi Felszolgalo & Pultos & Mixer & Barista
- **URL:** https://www.facebook.com/groups/2101943063212063/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B staff (vendeglatos alkalmazottak)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Felszolgalok, pultosok, baristak csoportja. Nem tulajdonos-fokuszu, de indirekt info-csatorna a vendeglatos szektorrol. Allas-posztok dominalhatjak.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "pultosok" OR "bartender")
- **Phase-action:** Phase 4-re halasztva (alacsonyabb relevancia)

---

### Hova menjek enni? Etterem ajanlo -kereso csoport
- **URL:** https://www.facebook.com/groups/etteremajanlo/
- **Tagsag:** TBD
- **Tipus:** publikus (valoszinuleg)
- **Nyelv:** HU
- **Kategoria:** B2C demand (etterem ajanlas/kereses)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Etterem ajanlo csoport -- vendeg/fogyaszto-oldal. Nem B2B, de hasznos arra, hogy lassuk milyen helyszineket ajanlanak/keresnek. Piackutatasra jo.
- **Discovered:** 2026-04-19 (Google search: facebook csoport vendeglatos etterem)
- **Phase-action:** Phase 4-re halasztva

---

### Vendeglatos Munkak Budapesten
- **URL:** https://www.facebook.com/groups/504398736583589/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B staff (allas-kozvetites)
- **Relevancia-score:** 2
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Allas-fokuszu csoport. Nem relevans kozvetlenul a Rezerver szamara, de venue-tulajdonosok is posztolhatnak allasokat itt.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "vendeglatas")
- **Phase-action:** Elutasitva (tul allas-fokuszu, alacsony relevancia)

---

### Eskuvoi zenekarok, Lakodalmas zenekarok es megendeloik
- **URL:** https://www.facebook.com/groups/637630939636317/
- **Tagsag:** TBD
- **Tipus:** TBD
- **Nyelv:** HU
- **Kategoria:** B2B supply (eskuvoi szolgaltato - zene)
- **Relevancia-score:** 2
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eskuvoi zenekarok/lakodalmas zenekarok. Tul szuk fokusz, nem helyszin-releváns.
- **Discovered:** 2026-04-19 (Google search: site:facebook.com/groups "eskuvo" szervezes)
- **Phase-action:** Elutasitva (nem helyszin-releváns)

---

## 2026-04-21 FB session discovery (vendéglátás + rendezvényhelyszín search)

---

### VENDÉGLÁTÓSOK ÉS VENDÉGEIK VLM
- **URL:** https://www.facebook.com/groups/1431752517076984/
- **Tagsag:** ~24k
- **Tipus:** nyilvános
- **Nyelv:** HU
- **Kategoria:** B2C demand + B2B supply mix (vendéglátósok + vendégeik)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-04-21 (FB internal search: "vendéglátás")
- **Aktivitás:** 20+ bejegyzés/nap
- **Jegyzet:** Vendor + fogyasztó mix, de 24k tag és aktív. Indirekt csatorna — inkább olvasásra mint outreachre. Phase 4-re halasztva.
- **Phase-action:** Phase 4-re halasztva

---

### Rendezvények, rendezvényszervezés, koncertek, szolgáltatások, programok
- **URL:** https://www.facebook.com/groups/202301403165786/
- **Tagsag:** ~21k
- **Tipus:** nyilvános
- **Nyelv:** HU
- **Kategoria:** B2C demand + B2B supply (rendezvényszervezők + szolgáltatók)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-04-21 (FB internal search: "rendezvényhelyszín")
- **Aktivitás:** 70+ bejegyzés/nap — nagyon aktív!
- **Jegyzet:** Rendezvényszervezők és szolgáltatók mixed csoportja. 70+ poszt/nap = sok igény, sokat keresnek helyszínt. Rezerver szempontból a demand-oldal aktívan kommunikál itt. HIGH VALUE.
- **Phase-action:** Phase 3-ra shortlisted (TOP 5 jelölt)

---

### Rendezvények és rendezvény közeli szállások Magyarországon
- **URL:** https://www.facebook.com/groups/1072652926134887/
- **Tagsag:** ~11k
- **Tipus:** nyilvános
- **Nyelv:** HU
- **Kategoria:** B2C demand + B2B supply (rendezvény + szállás kombó)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-04-21 (FB internal search: "rendezvényhelyszín")
- **Aktivitás:** 20+ bejegyzés/nap
- **Jegyzet:** Helyszín + szállás kombó — venue-k, akik szállást is kínálnak (kastélyek, kúriák, resort-ok) pont itt vannak. 11k tag, aktív. Rezerver sweet spot szegmens.
- **Phase-action:** Phase 3-ra shortlisted (TOP 5 jelölt)

---

### Fesztiválok, rendezvények, szervezők, szolgáltatók, árusok
- **URL:** https://www.facebook.com/groups/524467594334034/
- **Tagsag:** ~48k
- **Tipus:** nyilvános
- **Nyelv:** HU
- **Kategoria:** B2B supply + demand (szervező + szolgáltató mix)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-04-21 (FB internal search: "rendezvényhelyszín")
- **Aktivitás:** 40+ bejegyzés/nap
- **Jegyzet:** Fesztivál + rendezvény fókusz, de 48k tag és sok szolgáltató. Inkább fesztivál/outdoor events, nem private venue. Helyszínes tartalom aránya ellenőrizendő.
- **Phase-action:** Phase 4-re halasztva (fesztivál-fókusz, kevésbé venue-specifikus)

---

## Korabbi placeholder-ek (meg nem verifikalt URL-lel)

### Ettermesek Kozossege
- **ID / URL:** _TBD_ (Google keresessel nem talalt, FB internal search-csel keresendo)
- **Tagsag:** ~10k+ (korabbi becslés)
- **Kategoria:** B2B supply
- **Statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eredeti target listarol. URL meg ellenorizendo FB-ban.

### Vendeglatosok Klubja
- **ID / URL:** _TBD_ (Google keresessel nem talalt)
- **Tagsag:** _TBD_
- **Kategoria:** B2B supply (altalanos)
- **Statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eredeti target listarol. URL meg ellenorizendo FB-ban.

### Ettermes vagyok
- **ID / URL:** _TBD_ (Google keresessel nem talalt)
- **Tagsag:** _TBD_
- **Kategoria:** B2B supply (napi mukodes)
- **Statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eredeti target listarol. URL meg ellenorizendo FB-ban.

### HoReCa Hungary
- **ID / URL:** _TBD_ (Google keresessel nem talalt)
- **Kategoria:** B2B szakmai
- **Statusz:** NOT_YET_REQUESTED
- **Jegyzet:** Eredeti target listarol. URL meg ellenorizendo FB-ban.

### Eskuvoszervezok Magyarorszagon (Phase 2)
- **ID / URL:** _TBD_
- **Kategoria:** B2C demand
- **Statusz:** NOT_YET_REQUESTED -- **Phase 2 csak**
- **Jegyzet:** Ne kerjen csatlakozast amig 10+ venue nincs onboarded.

---

## 2026-05-13 FB session discovery ("catering Magyarország" + "étteremvezetők" search)

Két keresés: "catering Magyarország" (mixed eredmény, kevés B2B-specifikus) + "étteremvezetők" (jobb batch). NOT joined (Phase 2 tilalom). 1 SAFE lájk: Vik Demeter humor post ("Kedd délutáni osztályfőnöki óra...").

**Új csoportok:**

### Éttermek, Üzletvezetők és Konyhavezetők csoportja
- **URL:** https://www.facebook.com/groups/2054419648105914/
- **Tagság:** ~5,100
- **Típus:** nyilvános
- **Nyelv:** HU
- **Kategória:** B2B supply (konyhai eszköz adásvétel — FIGYELEM: nem szakmai közösség!)
- **Relevancia-score:** 2
- **Csatlakozási státusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-05-13 (FB search: "étteremvezetők")
- **Aktivitás:** 10+ bejegyzés/nap
- **Jegyzet:** Megtévesztő cím — a description "Hirdesse itt eladó konyhagépeit korlátlan mennyiségben!" = inkább marketplace/hirdetési csoport, nem szakmai közösség. Tököl lokáció. Nem shortlist-re.
- **Phase-action:** Elutasítva (hirdetési csoport, nem szakmai)

---

### Fesztiváli árusok, szolgáltatók és szervezők közössége
- **URL:** https://www.facebook.com/groups/875132292961832/
- **Tagság:** ~6,500
- **Típus:** nyilvános
- **Nyelv:** HU
- **Kategória:** B2B supply + demand (fesztiváli szolgáltatók/szervezők)
- **Relevancia-score:** 3
- **Csatlakozási státusz:** NOT_YET_REQUESTED
- **Discovered:** 2026-05-13 (FB search: "étteremvezetők")
- **Aktivitás:** 10+ bejegyzés/nap
- **Szülő szervezet:** Fesztiválozók érdekvédelmi csoportja
- **Leírás:** "Célunk, hogy segítsük és támogassuk a kiállítókat, szolgáltatókat, szervezőket és látogatókat, akik a magyar fesztiválokon, vásárokon, rendezvényeken..."
- **Jegyzet:** Fesztivál/vásár/rendezvény fókusz, de nem HoReCa-specifikus. Mai tartalom: íjász edzés (nem releváns). Széles közönség — fesztiváli árus, nem venue-tulaj. Indirekt ICP.
- **Phase-action:** Phase 4-re halasztva (indirekt, nem core HoReCa)

---

**Megerősítés (már logged, most megnyitva + tartalom látva):**

- https://www.facebook.com/groups/707694661916866/ — "Rendezvényt szervezek - szolgáltatót keresek!" — **ICP SIGNAL 2026-05-13:** Aktív event organizer poszt: fotóst keresnek a 2026-os Ceglédi Laskafesztivál gasztronómiai fesztiválra (Cegléd, jún. 13-14, 10+ éves rendezvény, több ezer látogató). Ez a demand-oldal: szervezők aktívan keresnek szolgáltatókat. Rezerver value-prop pontosan ide illik. Score: 5, Phase 3-ra shortlist. **Felülmúlja a Rendezvénykereső Ajánlókat — ide kell belépni Phase 3-ban.**

---

## Uj csoport hozzaadasa

Ha felfedezel uj relevans HU HoReCa FB csoportot, add hozza a fenti formatummal. Jegyezd meg honnan halottal rola (link, forras), hogy kesobb visszavezetheto legyen.

## TOP 5 Shortlist (Phase 3 jeloltek)

A kovetkezo csoportok a legmagasabb prioritasuak a Phase 3 csatlakozasra:

1. **Rendezvenyhely szinek, teremberles - Budapest** (score: 5) -- kozvetlenul a Rezerver core temaja
2. **Rendezvenyszervezok** (score: 5) -- supply + demand mix, rendezvenyszervezok szakmai kozossege
3. **Kevesbe ehezo vendeglatosok** (score: 5) -- vendeglatos tulajdonosok/vezetok, velemenyformaló kozosseg
4. **Vendeglatos Csoport HORECA -- GASZTRO, Adok-veszek** (score: 4) -- HoReCa szakma, aktiv
5. **Vendeglatos Csoport 2025** (score: 4) -- altalanos vendeglatos, evente frissitett

## 2026-04-26 FB session discovery (esküvőszervező search)

- https://www.facebook.com/groups/mindenamirendezvenyesszervezes/ -- "Minden ami rendezvény és szervezés! Rendezvényszervezők szakmai csoportja." -- discovered, NOT joined (Phase 2 tilalom)
- https://www.facebook.com/groups/707694661916866/ -- "Rendezvényt szervezek - szolgáltatót keresek!" -- discovered, NOT joined (Phase 2 tilalom)

## 2026-05-04 FB session discovery ("rendezvényhelyszín Magyarország" search)

Narrow keyword bejött — első éles HU venue-side csoport-batch. NOT joined (Phase 2 tilalom), shortlist-jelölt:

- https://www.facebook.com/groups/1072652926134887/ — "Rendezvények és rendezvény közeli szállások Magyarországon" — venue + accommodation directory, valószínű B2C demand (foglaló oldal). Score: 4.
- https://www.facebook.com/groups/202301403165786/ — "Rendezvények, rendezvényszervezés, koncertek, szolgáltatások, programok" — supply + szolgáltatók mix. Score: 4.
- https://www.facebook.com/groups/533196806715223/ — "Rendezvénykereső és Rendezvényszervező Ajánlók" — directory/ajánló, B2B + B2C híd. Score: 5 (potenciális Phase 3 első target).
- https://www.facebook.com/groups/254791949698374/ — "Rendezvények, szolgáltatók, helyszínek" — vendor+venue marketplace. Score: 4.
- https://www.facebook.com/groups/rendezvenyre/ — "Rendezvényszervezés Falunap, Fesztivál, Fellépő, Rendezvény 2026" — falunap/fesztivál fókusz, részben tangenciális (kis-település). Score: 3.
- Kihagyva (kontextusból nem ICP): "RENDEZVÉNYEK MAGYARORSZÁGON" (event-listing fogyasztói), "Fesztiválok/Koncertek..." (zenei), "Magyarország értékei" (általános), "Szálláshelyek Magyarország" (accommodation-only).

## 2026-05-05 FB session discovery ("esküvő helyszín ajánlók" search)

Hipotézis igazolva: tagolt narrow keyword (vs. előző "esküvőhelyszín" összevont) goldmine. 9 erősen ICP-releváns csoport, NOT joined (Phase 2 tilalom).

- https://www.facebook.com/groups/eskuvoi.helyszinek/ — "TOP Esküvői helyszínek 2026/2027 💒" — direct venue-listing csoport, friss évszámmal. Score: 5 (Phase 3 első target jelölt — felülmúlhatja a tegnapi "Rendezvénykereső és Rendezvényszervező Ajánlók"-at, mert konkrétan venue-fókuszú).
- https://www.facebook.com/groups/www.22h.hu/ — "Esküvői Helyszínek" — szintén direct venue list. Score: 5.
- https://www.facebook.com/groups/eskuvoforum/ — "ESKÜVŐ FÓRUM - esküvői helyszínek, szolgáltatói ajánlatok, tanfolyamok" — supply + demand mix, plusz tanfolyam (training-leads). Score: 5.
- https://www.facebook.com/groups/eskuvoiszolgaltatok.eskuvorekeszuloknek/ — "Esküvői Szolgáltatók, Esküvőre Készülőknek!" — B2B+B2C híd. Score: 4.
- https://www.facebook.com/groups/184151740272760/ — "Esküvőnk lesz! (Országos) Jegyespárok és szolgáltatók csoportja" — országos, B2C+supply. Score: 4.
- https://www.facebook.com/groups/eskuvoiszolgaltatok/ — "Esküvői szolgáltatók" — pure supply, vendor-research-friendly. Score: 4.
- https://www.facebook.com/groups/eskuvoiszolgaltatokcsoportja/ — "Esküvő-esküvői szolgáltatók" — duplikál előzővel, supply-fókusz. Score: 3.
- https://www.facebook.com/groups/2071187562929460/ — "Esküvőre készülők!" — pure B2C demand. Score: 3.
- https://www.facebook.com/groups/538288546328326/ — "Esküvő adok veszek" — marketplace, tangenciális (használt cuccok). Score: 2.

## 2026-05-15 FB session discovery ("vendéglátás" + "rendezvény Magyarország" search)

"vendéglátás" keyword főleg vendor-marketplace típusú csoportokat hozott (berendezések, adásvétel). 2 újdonság:
- https://www.facebook.com/groups/650382321695092/ — "A Vendéglátós Csoport" — általános HU vendéglátós szakmai csoport. Score: 4. Phase 3-ra jelölt (URL ismert, tagszám TBD — ellenőrizni).
- https://www.facebook.com/groups/2006392399611269/ — "Vendéglátás Adok - Veszek & Állás keres - kínál" — marketplace + álláshirdetés mix. Score: 2. Elutasítva (nem ICP-fókusz).

"rendezvény Magyarország" keyword: 2 új csoport (a többi már loggolva korábban):
- https://www.facebook.com/groups/1149910545062354/ — "Rendezvény árusok, kitelepülők, fellépők // Rendezvény szervező" — vendor+kitelepülős. Score: 3. Phase 4-re halasztva.
- https://www.facebook.com/groups/365495235325742/ — "Koncertek, fesztiválok, rendezvények" — event-listing, B2C fókusz. Score: 2. Elutasítva.

Megerősítve (már logban): VENDÉGLÁTÓSOK ÉS VENDÉGEIK VLM, Vendéglátós Csoport HORECA, Fesztiválok/rendezvények/szervezők, Rendezvények közeli szállások, Rendezvényszervezés+koncertek, Rendezvényt szervezek (707694661916866, ICP-core), Fesztiváli árusok.

---

### Rendezvényszervező FALUNAPOK, FESZTIVÁLOK, FELLÉPŐK
- **URL:** https://www.facebook.com/groups/rendezvenyszervezo/
- **Tagsag:** ~22E tag
- **Tipus:** Nyilvános
- **Nyelv:** HU
- **Kategoria:** B2C demand + rendezvényszervező szakmai
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Aktivitas:** 30+ bejegyzes/nap
- **Discovered:** 2026-05-18
- **Phase-action:** Phase 3-ra shortlisted
- **Jegyzet:** Falunapok/fesztiválok szervezők — rendezvényhelyszín-keresés releváns, de fesztiválfókusz kevésbé éttermi. Közepes prioritás.

---

### Minden ami rendezvény és szervezés — szakmai csoport
- **URL:** https://www.facebook.com/groups/mindenamirendezvenyesszervezes/
- **Tagsag:** ~5.6E tag
- **Tipus:** Nyilvános
- **Nyelv:** HU
- **Kategoria:** B2C demand (rendezvényszervező szakmai)
- **Relevancia-score:** 3
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Aktivitas:** 3 bejegyzes/nap (alacsony)
- **Discovered:** 2026-05-18
- **Phase-action:** Phase 4-re halasztva (alacsony aktivitás)
- **Jegyzet:** Szakmai fókuszú de kis aktivitás. Nem prioritás.

---

### A Vendéglátós Csoport
- **URL:** https://www.facebook.com/groups/650382321695092/
- **Tagsag:** ~19E tag
- **Tipus:** Privát (admin-approval)
- **Nyelv:** HU
- **Kategoria:** B2B supply (vendéglátós szakmai)
- **Relevancia-score:** 4
- **Csatlakozasi statusz:** NOT_YET_REQUESTED
- **Aktivitas:** 8 bejegyzes/nap
- **Discovered:** 2026-05-18
- **Phase-action:** Phase 3-ra shortlisted (privát = admin-approval = kisebb kockázat)
- **Jegyzet:** Privát csoport, admin-approval — pontosan amit keresünk. 19k tag, napi 8 poszt, vendéglátós szakmai fókusz.
