# Trigger Event Monitor — Real-time Launch Hook-források

> Cél: olyan események naplózása amikor egy venue épp most lenne a legfogékonyabb a Rezerver-re. Launch-kor ezeket használd first-batch outreach-re: személyesített email-ben hivatkozhatsz a friss eseményre.

## Monitoring források

- **Új venue nyitás** — Trademagazin, Vendeglatas.hu, Menumagazin "új étterem", Menetrend.hu PR, Budapest kerület-újság, Google Maps "recently added"
- **Menedzser-váltás / tulajdonos-váltás** — LinkedIn HU feed keresés, Trademagazin hírek
- **Konkurens-churn jel** — Google review panasz versenytárs rendszerre ("Foody nem működött", "Dineout bug"), FB komment-panasz
- **Venue átalakul / bővít** — Instagram bejelentés, FB post "hamarosan új terasz", sajtóanyag
- **Rendezvény-szezon nyitás** — Balaton, tavaszi terasz, év végi corporate — szezon előtt 4-6 hét a legjobb hook
- **Díj / elismerés** — Bib Gourmand, Dining Guide TOP 100, stb. (frissen elismert venue büszkélkedik, jó hangulat)
- **Posztolási frekvencia ugrás** — venue FB / IG aktivitás hirtelen nő = új marketinges / új fókusz

## Trigger event napló

Minden új event-et vegyél fel. Ha a venue benne van a `venue_pipeline.json`-ban, a `trigger_events` mezőben is frissítsd (dup-OK, ez a kereshető master log).

Sémája:
- **Dátum észlelés:** (ma)
- **Esemény dátuma:** (mikor történt a dolog)
- **Típus:** `new_opening` / `mgmt_change` / `competitor_complaint` / `expansion` / `season_start` / `award` / `activity_spike`
- **Venue / szereplő:** (név + URL)
- **Forrás:** (link vagy forrás-megnevezés)
- **Hook-mondat:** (1 mondat amit launch-kor email-ben használnál)
- **Ha már pipeline-ban:** `venue_pipeline.json` ID

### 2026-04

#### TR-001 — Symbol Budapest aktív működés-jel (kontradikció a learnings-szel)
- **Dátum észlelés:** 2026-04-22
- **Esemény dátuma:** 2026-04-21–22 (programok)
- **Típus:** `activity_spike` / esetleg újranyitás-jel
- **Venue:** Symbol Budapest (Óbuda, https://symbolbudapest.hu)
- **Forrás:** symbolbudapest.hu/programok-jegyek/ — 2026-04-21 18:00, 2026-04-22 16:00 + 19:00 események élnek
- **Hook-mondat:** *"Láttam hogy újra van program nálatok az aktív naptárban. A bezárt időszak után most jön a momentum-helyreállítás — ehhez van egy béta-ajánlat amit érdemes lehet megnézni."*
- **Megjegyzés:** ELLENŐRIZNI a learnings-ben szereplő "2026 febr-ápr rendőrségi bezárás miatt 2-3 hónap várás"-t. Lehet hogy túl pesszimista volt — Symbol nyitva. ⚠️ Update szükséges.
- **Pipeline ID:** Symbol Budapest a venue_pipeline.json-ban (Tier 1)

#### TR-002 — Új Budapest étterem-nyitás boom (áprilisi kohort)
- **Dátum észlelés:** 2026-04-22
- **Esemény dátuma:** 2026-04 (folyamatos)
- **Típus:** `new_opening`
- **Venue / szereplő:** több — Funzine 9 új hely listája, kiemelve:
  - **Piros Paprika** (magyar konyha, családi receptek)
  - **Nagomi Bar** (Újbuda, japán ramen — Palkovics Zóra + Molnár Dániel)
- **Forrás:** funzine.hu/2026/04/01/gasztro/ujdonsagok-budapesten-9-ujonnan-nyilt-hely (2026-04-01)
- **Hook-mondat:** *"Gratulálok az [étterem]-hez! Új helyek nálunk gyakran rendezvényekre is bookolnak — ha nézitek a foglalási oldalt, a Rezerver béta első 30 helyszín 3 hónapig ingyen."*
- **Megjegyzés:** Új venue = még nincs beágyazott foglalási rendszerük → fogékonyabbak. Funzine cikk feltérképezése ki van: 9 hely, ebből kiemelten 2 (rame/magyar). Pipeline-ba felvenni mindegyiket.
- **Pipeline ID:** 103 Funky Budapest Bistro & Bar, 104 Marrakesh Budapest, 105 LISZT Budapest, 106 Piros Paprika (hozzáadva 2026-04-23). Ramenji / Nagomi / Piazza del Gusto / Lalibela / MűhelyM kihagyva (kicsi/nem releváns rendezvényhelyszín-szempontból).
- **Kohort kibővítés 2026-04-24 (márciusi Funzine):** 107 Páholy Café (XIII.ker Vígszínház), 108 Éclat Budapest (IX.ker iroda-negyed), 109 Silly Bar (VI.ker Oktogon). Beugró Corner / nor/ma Bartók / Bloom by Cinnamon / Apikám s'Pizzatura / Poppy Budapest kihagyva (kávézó, pékség, candy shop — nem rendezvény-profil).

#### TR-003 — Étterem Hét Tavasz Extra (közönségkedvencek 2. kör)
- **Dátum észlelés:** 2026-04-22
- **Esemény dátuma:** 2026-04-17 — 2026-04-26 (most aktív)
- **Típus:** `award` / kiemelt elismerés
- **Venue:** 25 közönségkedvenc Étterem Hét étterem (lista: etteremhet.hu)
- **Forrás:** etteremhet.hu, welovebudapest.com Étterem Hét 2026 tavasz
- **Hook-mondat:** *"Láttam hogy benne vagytok az Étterem Hét Extra 25-ös kedvenc listáján — a vendég-flow most peak-el. Ha rendezvény-foglalásra is kerestek megoldást, a béta első 30 helyszín 3 hónapig ingyen."*
- **Megjegyzés:** Közönség által szavazott kedvencek = magas vendégelégedettség → büszke, fogékony hangulat. A 25 lista teljes neveinek kibontása következő research-ben.
- **Pipeline ID:** Cross-check szükséges venue_pipeline.json ellen

#### TR-004 — Balaton/terasz szezon-nyitás közelít
- **Dátum észlelés:** 2026-04-22
- **Esemény dátuma:** 2026-05 első hete (~2026-05-01–05)
- **Típus:** `season_start`
- **Venue:** Pipeline-ban szereplő Balaton venue-k — Tihany, Balatonfüred, Vass Pincészet (Felsőörs), Sentio Birtok (Pécsely), Vonyarcvashegy, Hévíz, Keszthely, Badacsony, Siófok, Egy Csipet Nádas. Kb. 12-15 venue.
- **Forrás:** seasonality.md (saját) + általános HoReCa szezon-szabály (terasz nyitás május elején)
- **Hook-mondat:** *"Szezon indul nálatok 2 hét múlva — terasz-foglalás csúcsra pörög. Ha most még nincs azonnali online foglalás, nézzétek meg a béta-ajánlatunkat: első 30 helyszín 3 hónapig ingyen."*
- **Megjegyzés:** Aktiváláskor (csendes fázis vége után) ez egy first-batch outreach időablak. Aktuálisan: silent fázis, nem küldjük.
- **Pipeline ID:** Tier-1 Balaton csoport — pipeline-szűrés `city in ['Tihany', 'Balatonfüred', 'Felsőörs', 'Pécsely', 'Hévíz', 'Keszthely', 'Badacsony', 'Vonyarcvashegy', 'Siófok']`

#### TR-005 — HoReCa AI/digitalizáció trend (Trademagazin)
- **Dátum észlelés:** 2026-04-22
- **Esemény dátuma:** 2026-04-16 cikk
- **Típus:** `industry_trend` (új kategória)
- **Venue:** általános HU HoReCa
- **Forrás:** trademagazin.hu — "AI + digitalizáció a vendéglátásban" cikk
- **Hook-mondat:** *"Olvastam a Trademagazin AI/digitalizáció cikkét — pont ehhez kapcsolódóan építünk valamit, ami HU rendezvényfoglalásra real-time. Nem kérek semmit, csak pingelnék 1 demolinket ha érdekel."*
- **Megjegyzés:** Nem konkrét venue trigger, hanem média-pitch hook. media_pipeline-hoz kapcsolódik. Trademagazin = legerősebb HU HoReCa tech vonal.
- **Pipeline ID:** media_pipeline.json — Trademagazin (Hermann Zsuzsanna)

---

## Új trigger-típus: `industry_trend`

Hozzáadva 2026-04-22: a media-cikkek nem venue-specifikusak, de pitch-hook-ként használhatók. Külön kategória, hogy ne keveredjen a venue-trigger logikájával.

## Hook-mondat sablonok (trigger-típusonként)

- **new_opening:** "Láttam hogy a [név] most nyitott [kerület]-ben — gratulálok. Amikor foglalási rendszert néztek, érdekelne egy 15 perces kép..."
- **competitor_complaint:** "Olvastam hogy [konkurens]-nél volt pár nehézség. Ha most vizsgáltok alternatívát, a béta első 30 helyszín 3 hónapig ingyen..."
- **season_start:** "[Szezon] indul nemsokára, most jön a venue-foglalási hullám. Ha [pain point] ismerős, néztünk egy megoldást..."

## Nyitott kérdések

- [ ] Tomi: van-e kedvenc forrás ami én nem láttam (pl. privát HU HoReCa newsletter)?
- [ ] Mennyi ideig "friss" egy trigger event — 2 hét, 1 hónap?

#### TR-006 — Anyák napja közelít (2026-05-04 vasárnap)
- **Dátum észlelés:** 2026-04-27
- **Esemény dátuma:** 2026-05-04 (anyák napja, HU első vasárnap)
- **Típus:** `season_start` (al-kategória: HU családi-naptár csúcsnap)
- **Venue:** étterem + cukrászda + brunchhely + Balaton-szezon-előtti kis-rendezvényhelyszínek
- **Forrás:** általános HU naptár — első vasárnap május
- **Hook-mondat:** *"Anyák napja vasárnap, a brunch- és kétfős-asztal-foglalások most állnak be sűrűn. Ha az online foglaláson akadás van, a béta első 30 helyszínének 3 hónapig ingyen — szólok."*
- **Megjegyzés:** Egy hetes ablak, csendes fázisban nem küldjük. Aktiváláskor szűrés `tags ~ ['brunch','desszert','családi','romantikus']`. NEM Balaton-fókusz, hanem Budapest+vidék étterem-cukrászda mix.
- **Pipeline ID:** venue_pipeline.json — szűrhető `segment in ['restaurant','cafe','patisserie']` + `family_friendly = true`
- **Retrospektíva 2026-05-04:** Ablak MA aktív, csendes fázis miatt NEM aktiváltuk — várt-és-elhalasztott. Calibration-szempontból: launch utáni első anyák napja (2027-05-02) lesz az első éles teszt erre a hookra; addig megfigyelési mód. FB-feed-ben semmilyen anyák-napi venue-aktivitás nem jött szembe a HU lurk-ben (Phase 2 warmup sessions), de a target-venue-okat nem követjük közvetlenül még.

#### TR-007 — Gault&Millau HU 2026 kalauz (várható publikálás május közepe)
- **Dátum észlelés:** 2026-04-27
- **Esemény dátuma:** ~2026-05-15 (utóbbi évek mintája szerint)
- **Típus:** `industry_award` (új kategória)
- **Venue:** kalauzba bekerült éttermek + sapka-emelést kapók
- **Forrás:** Gault&Millau HU kalauz éves megjelenés
- **Hook-mondat:** *"Láttam hogy a frissen megjelent Gault&Millau-ban [N] sapkát kaptatok — gratulálok. A foglalási hullám most fog beindulni, a béta első 30 helyszín 3 hónap ingyen ha kíváncsiak vagytok."*
- **Megjegyzés:** Award-után 2-3 hetes booking-spike a tapasztalat. Csendes fázisban nem aktiváljuk — feljegyezve ablakra. Forráscikk megjelenéskor a media_pipeline-ban Hermann Zsuzsanna (Trademagazin) szokott írni róla, dual-purpose hook.
- **Pipeline ID:** dynamic — a kalauz megjelenése után a venue_pipeline-ban `gault_millau_2026 = true` flag setelendő.
