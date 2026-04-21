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

*Első bejegyzések ide jönnek.*

## Hook-mondat sablonok (trigger-típusonként)

- **new_opening:** "Láttam hogy a [név] most nyitott [kerület]-ben — gratulálok. Amikor foglalási rendszert néztek, érdekelne egy 15 perces kép..."
- **competitor_complaint:** "Olvastam hogy [konkurens]-nél volt pár nehézség. Ha most vizsgáltok alternatívát, a béta első 30 helyszín 3 hónapig ingyen..."
- **season_start:** "[Szezon] indul nemsokára, most jön a venue-foglalási hullám. Ha [pain point] ismerős, néztünk egy megoldást..."

## Nyitott kérdések

- [ ] Tomi: van-e kedvenc forrás ami én nem láttam (pl. privát HU HoReCa newsletter)?
- [ ] Mennyi ideig "friss" egy trigger event — 2 hét, 1 hónap?
