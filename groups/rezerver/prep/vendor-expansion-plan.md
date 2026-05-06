# Vendor Pipeline Expansion Plan — 2026-05-05

## Jelenlegi seed (24 vendor, 6 kategória)

| Type | Count |
|---|---|
| dj | 5 |
| catering | 4 |
| cukrász | 4 |
| dekoratőr | 4 |
| videós | 4 |
| vőfély | 3 |

## Hiányzó kategóriák (Tomi 2026-04-21 kérése + általános rendezvény-vertikum)

| Type | Indoklás | Cél seed-méret | Prioritás |
|---|---|---|---|
| zenekar | Esküvők 60-70%-án zenekar van DJ helyett vagy mellett | 4 | P1 |
| AV technika | Céges/konferencia + nagyobb esküvők — hangosítás, fény | 3 | P1 |
| fotós | Fotó-videó separáció a HU piacon külön szakma | 4 | P1 |
| személyszállítás | Esküvői limuzin/buszbérlés + corporate transfer | 3 | P2 |
| animátor / show-műsor | Gyermekprogram + tűzshow + akrobata | 3 | P2 |
| virág-dekor (külön a dekoratőrtől) | A virágoslány/floral designer külön szakma | 3 | P2 |
| helyszín-koordinátor / day-of | Specifikusan rendezvényt levezénylő szabadúszó | 2 | P3 |

**Összesen tervezett bővítés:** +22 vendor → 46 seed.

## Research-módszer

Per kategória 4 forrás-csatorna:
1. Google search "magyar [kategória] esküvő referencia oldal"
2. Esküvők.hu / minimalweddings.hu / maydecor.hu vendor-listák
3. Instagram hashtag #magyaresküvő[kategória]
4. FB-csoport találatok (a Phase 3-ban csatlakozott rendezvény-csoportokból)

Schema azonos a meglévővel: id (seq), name, company, type, city, coverage, website, instagram, email, phone, contact_known, event_types, note, status="NOT_CONTACTED", last_touched=null.

## Következő lépés

Amikor van browser-session web-research kapacitással (HU proxy nélkül is OK, vendor-research nem login-context), kezdés: **zenekar** kategória 4 lead-del. Becsült idő: 30-40 perc. Tomi-OK kell a tényleges seed-bővítésre lépés előtt, vagy explicit zöld jelzés az Esti growth session-ben.
