# Email B2C — Wedding / event planner outreach

> **STATUS: STUB — Phase 2**
>
> Ezt a csatornát NE aktiváld amíg **10+ venue nincs onboarded** a Rezerver platformon.
>
> Indok: planner-eknek az a kérdés "mennyi foglalható helyszín van a platformon?" Ha 2-3 üres listát kapnak, minket rögtön leírnak egy későbbi revisit esélye nélkül.

## Mikor aktiválódik

A `state.json` `weekly_stats.venue_onboarded >= 10` teljesülésekor:

1. Tomi-nak Discord-ping: "10+ venue onboarded — aktiválhatjuk a demand-side (B2C planner) outreach-et?"
2. Tomi OK → ez a fájl megnyílik szerkesztésre, `planner_pipeline.json` töltődik
3. Quota: max 3 planner email / nap

## Target-típusok (előre jegyzetelve, aktiválás-kor használható)

- Wedding planner (HU) — wedding.hu szállítói címtár / FB Esküvőszervezők Magyarországon csoport
- MICE agency (HU) — céges event szervező
- Corporate event koordinátorok nagyvállalatoknál (HR, CMO, marketing)
- Party event szervezők (születésnap, évforduló) — OLX, Jófogás, FB events

## Angle-ök előre (ha aktiválódik)

- **Supply story:** "30+ rendezvényhelyszínünk van már a Rezerver-en Budapest-szerte — mind real-time árazással, fiók nélküli foglalással. Jól jöhet a munkátokban?"
- **Time-saving:** "A helyszín-keresésnek már nem kell hogy email ping-pong legyen — egy platformon az összes elérhető helyszín, árral, előleg-fizetéssel."
- **Exclusivity:** "Első hivatalos Rezerver partner wedding plannerként 10% kedvezmény a ti összes foglalásodra."

## Ne vedd fel amíg

`state.json` `phase = "MVP supply-first"` alatt ne érintsd. Ha session prioritás-sorrendben ide jut, lépd át.
