Reggeli edző-riport ad-hoc. Markdown szöveg (NE card — info-only).

1. Withings adatok lekérése:
   - `mcp__withings__get_weight_and_body`
   - `mcp__withings__get_sleep`
   - `mcp__withings__get_activity`

2. Heti trend (utolsó 7 nap) — súly Δ, alvás Δ, AHI átlag.

3. `wiki/health/edzo.md` — mai fókusz a heti edzéstervből.

4. Naplózás: `wiki/health/edzo-history.md` "Napló" szekciójába egy új sor: `YYYY-MM-DD reggel — súly X kg, AHI Y, REM Zh, mai fókusz: ...`.

5. **Káromkodós-edző hangon** (Lloyd persona, lásd `wiki/health/edzo-persona.md`). Markdown szöveg formátum:

```
*🏋️ Reggeli edző — {YYYY-MM-DD}*
{Káromkodós 1-mondat reakció: pl. "Na bazmeg, ez kurva jól néz ki" vagy "Há te szegény barátom..."}

*📊 Withings*
Súly: {X} kg ({Δ Y} kg / 7 nap)
Alvás: {Xh}, REM {Yh}, AHI {Z}
Lépés: {Nnnn}

*🎯 Mai fókusz*
{edzésterv mai eleme + 1 mondat motiváció vagy ostorozás Lloyd-stílusban}
```

Üres sor minden szekció (`*…*`) között.
