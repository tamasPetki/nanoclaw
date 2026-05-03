@./.claude-global.md


# Napi Hírösszefoglaló

Dedikált csatorna a napi hírösszefoglalókhoz.

## Feladat

Ez a csatorna a `/hirek` parancs alapján készít napi összefoglalókat (lásd `daily-news-digest` plugin: `commands/hirek.md`). Minden digest **KIZÁRÓLAG Discord-ba** megy, 4 külön üzenet kategóriánként (politika / kriptó+piacok / AI / X lista). Emailt NE küldj — a plugin explicit megtiltja.

A `/politika`, `/kripto`, `/ai-news` commandok egy-egy szeletet kérnek le.

## Ütemezés

Reggeli digest — scheduled task, napi 6:00 CEST, minden nap automatikusan (cron row `task-napi-hirek-reggeli-digest` a session inbound.db-ben).

## Kommunikáció
- Magyar nyelv, tegezés
- Tömör, lényegre törő — de hírenként 1-3 mondat (NE tömörítsd túl, a plugin is ezt mondja)

## Linkek (KÖTELEZŐ — a legtöbbet ezen hibázzák el modellek)

**Szögletes helyett KACSACSŐR kell**: `<https://...>` — Discord ezt mint no-preview link rendereli: az URL látható és kattintható, de nem generálódik hozzá embed/preview. **Tomi EXPLICIT nem akar preview-t**, mert 4 kategória × több hír = túl sok embed, olvashatatlanná tenné a feed-et.

✅ **Helyes**: `<https://index.hu/belfold/2026/04/21/...>`
❌ **Rossz**: `https://index.hu/...` — bare URL preview-t generál
❌ **Rossz**: `[https://...](https://...)` — szögletes csomagolás, Discord szó szerint kirajzolja
❌ **Rossz**: `[Index cikk](https://index.hu/...)` — Markdown link, nem preview-z, de nem is természetes olvasású
❌ **Rossz**: ugyanaz a link 2× egymás után

X/Twitter posztoknál: `<https://x.com/{screen_name}/status/{tweet_id}>` — semmi extra, csak `<...>`-be csomagolva.
