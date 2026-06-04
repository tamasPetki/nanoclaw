# Radar research log

Append-only napló: minden futás után 1-3 sor — mit néztél, mit tanultál (a döntés/insight MIÉRTje),
mi a következő fókusz. A strukturált adat a DB-ben van; ez a gondolkodás-napló.

---

## 2026-06-04 — setup

A `competitor-radar` szolgáltatás + dashboard élesítve. Seed: 7 versenytárs (Triton, jācapps, Futuri,
Patreon, Substack, Spotify-for-Creators + Radio OS self-row), a Radio OS feature-referencia-oszlop kész.
Következő: első teljes sweep (pricing + features + positioning a seed-listán).

## 2026-06-04 — első teljes sweep (kick-off, kézi)

6 versenytárs végigfésülve (pricing + 12-kulcsos feature-mátrix + finomított pozícionálás + market/clients),
135-op batch ingestálva. **Pozícionálási tengely-konvenció rögzítve** (a seed-becslés finomítása): X = közönség-
orientáció (single-creator/consumer 0 ↔ broadcaster/B2B 100), Y = member-economy mélység (0 ↔ mély listener-funded).

Fő tanulság (a MIÉRT): a mező két táborra hasad, és a jobb-felső kvadráns (broadcaster + mély member-economy) ÜRES
— csak a Radio OS van ott. Az incumbensek (Triton/jācapps/Futuri) advertiser-funded, zéró member-economy; a creator-
economy (Patreon/Substack/Spotify) listener-funded de single-creator + consumer-brand + nem white-label. A tiszta
differenciátor: white-label ÉS listener-funded egyszerre — ezt EGYIK sem adja.

Konkrét számok rögzítve: Patreon egységes 10% (2025 aug.), $10B+ lifetime payout; Substack 10% + $1.1B valuation
(2025 júl.); Spotify SPP 50% ad-split + Memberships 2026 nyár (terms undisclosed); incumbensek mind hidden-pricing.

Két konvergencia-alert (med): Patreon natív livestream beta (2025 ápr.) + Spotify Memberships (2026 nyár).

Következő fókusz: (1) auto-discovery első kör — van-e új belépő a "member economy for live radio" térben;
(2) Patreon livestream + Spotify Memberships velocity-követés; (3) Triton iHeart-szinergiák figyelése.
