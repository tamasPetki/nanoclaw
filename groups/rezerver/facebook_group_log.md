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

## Uj csoport hozzaadasa

Ha felfedezel uj relevans HU HoReCa FB csoportot, add hozza a fenti formatummal. Jegyezd meg honnan halottal rola (link, forras), hogy kesobb visszavezetheto legyen.

## TOP 5 Shortlist (Phase 3 jeloltek)

A kovetkezo csoportok a legmagasabb prioritasuak a Phase 3 csatlakozasra:

1. **Rendezvenyhely szinek, teremberles - Budapest** (score: 5) -- kozvetlenul a Rezerver core temaja
2. **Rendezvenyszervezok** (score: 5) -- supply + demand mix, rendezvenyszervezok szakmai kozossege
3. **Kevesbe ehezo vendeglatosok** (score: 5) -- vendeglatos tulajdonosok/vezetok, velemenyformaló kozosseg
4. **Vendeglatos Csoport HORECA -- GASZTRO, Adok-veszek** (score: 4) -- HoReCa szakma, aktiv
5. **Vendeglatos Csoport 2025** (score: 4) -- altalanos vendeglatos, evente frissitett
