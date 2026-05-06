Reggeli edző-riport ad-hoc futtatás. A `task-edzo-reggeli` cron-prompt manuális verziója (függetlenül attól hogy hét vagy hétvége).

1. Withings adatok lekérése (mind a 3 tool):
   - `mcp__withings__get_weight_and_body`
   - `mcp__withings__get_sleep`
   - `mcp__withings__get_activity`

2. Heti trend (utolsó 7 nap) — súly Δ, alvás Δ, AHI átlag.

3. `wiki/health/edzo.md` (ha létezik) — mai fókusz a heti edzéstervből.

4. Naplózás: `wiki/health/edzo/history.md` (vagy a meglévő `groups/hub/sources/edzo/history.md`) "Napló" szekciójába egy új sor: `YYYY-MM-DD reggel — súly X kg, AHI Y, REM Zh, mai fókusz: ...`.

5. Card Tomi-nak Telegramra **káromkodós-edző hangon** (lásd `wiki/health/edzo.md` persona-szabályok). Kemény, vicces, számonkérő.

Card formátum:
```
title: "🏋️ Reggeli edző — <YYYY-MM-DD>"
description: "<káromkodós 1-mondat reakció: pl. 'Na bazmeg, ez kurva jól néz ki' vagy 'Há te szegény barátom...'>"
children:
  - { type: "section", title: "📊 Withings", children: [{ type: "text", text: "Súly: X kg (Δ Y kg / 7 nap)\nAlvás: Xh, REM Yh, AHI Z\nLépés: Nnnn" }] }
  - { type: "section", title: "🎯 Mai fókusz", children: [{ type: "text", text: "<edzésterv mai eleme + 1 mondat motiváció vagy ostorozás>" }] }
fallbackText: "..."
```
