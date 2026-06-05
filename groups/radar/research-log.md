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

## 2026-06-04 — esti zárás

Nap zárva: 2 run (kickoff teljes sweep + déli delta). Állapot: 19 követett versenytárs (10 direct / 8 indirect /
1 aspirational), 9 nyitott alert, 7 synthesis. Napi Telegram-digest elküldve Tominak. Záró-kutatást nem indítottam —
a mai lefedettség elég. Holnapi fókusz: RadioCloud.app mély-sweep + feature-by-feature a Radio OS ellen; a
direct-klaszter (Pal/Studiio/nēdl/Aiir/Podbean/Nobex) pricing+feature mátrix-kitöltése.

## 2026-06-04 — RadioCloud user-spot + napi csapat-riport
RadioCloud.app méret-spot: csak önbevallott "1,000+ creators and teams" (homepage) — nincs audited user/MAU/letöltés.
Logolva (metric clients=1000, confidence low). Vigyázni: radiocloud.app ≠ radio.cloud (kereső összemossa).
Napi RadioOs csapat-riport elküldve. Következő fókusz: (1) RadioCloud mély feature-by-feature vs Radio OS;
(2) direct-klaszter (Studiio/Aiir/Pal/Podbean/nēdl) bővít-e gifting/membership felé; (3) RadioCloud reálisabb
ügyfél-becslés (LinkedIn-létszám, állás-hirdetés, ügyfél-referenciák).

## 2026-06-05 — mély sweep: a 7 direct auto-discovered szereplő (features+pricing+market)

Dimenzió-rotáció: features (teljes 12-kulcsos mátrix) + pricing + market/clients a tegnap felfedezett direct-klaszteren.
Mind a 7 most 12/12 feature-kulccsal.

**FŐ KORREKCIÓ (a MIÉRT):** A tegnap HIGH-ként Tominak eszkalált **RadioCloud.app** mély merülés után **LOW**.
Valós kép: új (2025 szept.) IPPBX-tulajdonú, Odoo-alapú marketing-jelenlét, NULLA verifikálható ügyfél/review
("1,000+ creators" alátámasztatlan), ad-revenue gazdasági motor (nem listener-funded), HIÁNYZIK a member-economy
live-magja (nincs live-queue/congregation/paid-priority), white-label csak a $350k+ Enterprise tieren, az ár
ellentmond az indie/community célzásnak. + névütközés a megalapozott, KÜLÖN Radio.Cloud-dal. → A "category of one"
tézis ÁLL. Tomi értesítve a korrekcióról. (Tanulság: hangos "full-stack" copy ≠ szállított termék — a leszállított
funkciót kell verifikálni, nem a marketinget.)

**Valódi feature-referenciák:** Podbean = a member-economy live-mechanika piaci BLUEPRINTje (Fan Club: priority
call-in + label + emoji + entry-effect; Superchat; Patron 5%) — de consumer/podcast, nem white-label, GTM nem ütközik.
nēdl = legmélyebb listener-funded (Hay: tip/comment/ticketing, Google-backed) — de consumer/nem-white-label;
a Hay take-rate NEM publikus → következő dig.

**Ökoszisztéma:** Nobex = Triton- ÉS SHOUTcast-partner (73k állomás) → a legvalószínűbb "bolt-on member-economy" út
egy incumbensnél (Triton/iHeart ad-stack + leszállított app-réteg). Watch.

Pricing rögzítve: Pal $90-479/hó, Studiio $39-99/hó (+50% community), Aiir CMS $55-/streaming $20-, Nobex $22.92-82.50/hó,
Podbean Patron 5% (Patreon alatt), RadioCloud $95k-350k+ setup (!).

Mellék: kitakarítottam egy stray `.failed` fájlt (run kind="spot" érvénytelen; egyetlen unique adata a clients=1000
RadioCloud-metrika volt = félrevezető marketing, NEM ingestáltam).

Következő fókusz: nēdl Hay take-rate dig; Spotify Memberships nyári rollout terms; az indirect-klaszter (Stationhead/
Spoon/Mixlr/Spreaker/Supercast/Audiorista) feature-mátrix kitöltése; esti digest.

## 2026-06-05 — déli delta #2 (változások + discovery round 2)

**Hír (jún 4-5):** nincs in-window; Substack "Reply Rules" (jún 3, inkrementális moderáció) rögzítve. Több
dátum-tévesztés kiszűrve (Aiir/Radio News AI = 2024, Stationhead/Mellomanic = 2026 jan.).

**KÉT materiális változás (a MIÉRT):**
- **Podbean kivezeti az élő streaminget** (teljes leállás 2026-06-18, AI-tooling pivot). A tegnap "blueprint"-ként
  jelölt live-mechanika (priority call-in + Superchat + live gifting) VISSZAVONUL → a live-audio átfedés a Radio OS-szel
  eltűnik. Feature-ek korrigálva (streaming_infra→partial, live_queue/congregation/premium_priority→no, gifting→partial).
  A tagság-mag (Patron 5% + Fan Club) marad.
- **nēdl pivot/wind-down jel:** a Hay consumer-app domainjei (home/live.nedl.com) DOWN; www.nedl.com generikus B2B
  "stūdio" oldalt szolgál ki Hay nélkül (sablon-jellegű). A tegnap "legmélyebb listener-funded direct" → threat med→low,
  Hay-függő feature-ek unknown-ra. **Nyitott szál lezárva:** a Hay take-rate sosem volt publikus (alapos keresés után sem).

Tanulság: a consumer-oldali "mély member-economy direct"-ek (Podbean, nēdl) nem tartósak ebben a térben → a wedge
(white-label × mély member-economy × LIVE radio) tovább védve.

**Discovery round 2 (+4):** Radio Base (radiobase.org/Church Base) — az első STRUKTURÁLIS Radio-OS-analóg (white-label
multi-tenant rádió-suite + natív in-app giving), de FAITH-vertikálra szűkítve, faith-broadcastereknek INGYEN (ár-moat
a church-szegmensben) → direct/low + new_competitor alert. + RadioKing (FR app-builder, membership-keret 2025),
Radio Cult (UK indie-radio SaaS, natív community/chat, monetizáció külső), TopFan (white-label D2F, podcast+sport,
relaunch 2026 feb.) — mind indirect/low. Nem találtam regionális (EU/LATAM/Afrika/Ázsia) member-economy-for-radio belépőt.

Állapot: 23 követett (1 high=Triton, 7 med, 15 low), 13 alert, 12 synthesis. Következő: indirect-klaszter feature-mátrix;
Spotify Memberships nyári terms; nēdl + Podbean 06-18 utáni állapot megerősítése; esti digest.

> **Operatív megjegyzés (2026-06-05):** a watchlist.md egyszer elavultnak tűnt egy új session elején (a 06-04
> délutáni edit nem volt meg 06-05 reggel). A megbízható, perzisztens forrás a `.radar-export/*.json` (a DB, amit a
> host ír minden ingest után). Ha a watchlist/research-log egy session elején elavultnak tűnik, a `.radar-export`-ból
> re-deriváld az aktuális képet, ne abból induljon ki, ami a .md-ben van.
