# Családi dátumok — születésnapok, évfordulók

Stokes ezt a fájlt olvassa a napi b-day check cron-ra. Csak Tomi módosíthatja a hub-on át (cross-agent `<message to="stokes">`), a feleség nem.

Formátum (egy sor / dátum):

```
YYYY-MM-DD | <típus> | <név> | <megjegyzés opcionálisan>
--MM-DD    | <típus> | <név> | <megjegyzés opcionálisan>   # éves ismétlődés
```

Típus: `birthday`, `anniversary`, `nameday`, `other`.

## Bejegyzések

<!-- Tomi tölti fel. Példa:
--09-15 | birthday | Anna | feleség
--06-20 | birthday | Anya |
2026-09-12 | anniversary | esküvőnk évfordulója | 5. évforduló
-->
