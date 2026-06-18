---
name: image-gen
description: >
  Raszteres képek/vizuálok GENERÁLÁSA a Stability AI (Stable Image) API-val:
  logó, hero-kép, illusztráció, banner, arculati grafika, og-image, háttér,
  termék-illusztráció, placeholder/marketing vizuál. Trigger: logo, logó, kép,
  image, fotó, illusztr, hero, banner, arculat, vizuál, grafik, mockup, render,
  og-image, favicon, képet generál, image generation. Akkor használd, ha NEW
  képet kell előállítani szövegből (text-to-image) vagy meglévő képet
  szerkeszteni/upscale-elni.
---

# Image generation — Stability AI (Stable Image)

Van Stability API-hozzáférésed a **OneCLI gateway**-en át. Ezzel logót, hero-képet,
illusztrációt, bannert, arculati grafikát stb. generálhatsz a termékhez. Tomi tette be
a kulcsot; **te a kulcsot SOSEM látod és SOSEM kezeled** (lásd Auth).

## Auth — KRITIKUS: ne nyúlj a kulcshoz

A konténered kimenő HTTPS-e a gateway-en megy át, ami a kulcsot a proxy-határon injektálja.
- **Egyszerűen hívd a valós `https://api.stability.ai/...` URL-t.** A gateway beteszi az
  `Authorization` headert.
- **NE** adj hozzá `Authorization` headert, **NE** kérd Tomitól a kulcsot, **NE** tedd `.secrets`-be.
- Ha `401/403 app_not_connected`-et kapsz: a hozzárendelés hiányzik → szólj Tominak (ne kerülgesd).

## Elsődleges: Stable Image Ultra (legjobb minőség)

`POST /v2beta/stable-image/generate/ultra` — 8 credit/kép, ~1MP. `accept: image/*` → a nyers
képbájtokat kapod, `-o`-val fájlba.

```bash
curl -sS -f -X POST https://api.stability.ai/v2beta/stable-image/generate/ultra \
  -H "accept: image/*" \
  -F prompt="minimalist construction-tech logo, plumb-bob mark, deep blue, clean vector, flat, white background" \
  -F aspect_ratio="1:1" \
  -F output_format="png" \
  -o logo.png
```

- **prompt angolul**, konkrétan (elem, szín, stílus, kompozíció). Súlyozás: `(szó:0.8)`.
- `aspect_ratio`: `1:1` (logó/ikon), `16:9` (hero/og-image), `3:2`/`4:5` stb.
- `output_format`: `png` (átlátszóhoz/éleshez) | `webp` (web, kicsi) | `jpeg`.
- Opcionális: `negative_prompt`, `style_preset` (pl. `photographic`, `digital-art`, `line-art`, `3d-model`), `seed` (reprodukálhatóság).

## Olcsóbb iterációhoz: Stable Image Core (3 credit) / SD3.5 (`/sd3`)

Koncepció-vázlatokhoz, sok variánshoz használd a `…/generate/core`-t (3 credit), és csak a
nyertest fuss újra Ultra-val. Ugyanaz a hívás-forma, `core` az `ultra` helyén.

## Hibakezelés

`-f` mellett hiba esetén nincs hasznos kimenet. Ha nem 200-at kapsz, ismételd `-f`/`-o` nélkül,
`-H "accept: application/json"`-nal, hogy lásd a JSON-hibát:
- `403 content_moderation` → a prompt megakadt a szűrőn (nem számláz), fogalmazd át.
- `429 rate_limit` → 10s alatt túl sok kérés, várj.
- `400` → paraméter-hiba (`errors` mező).

## Hová mentsd

A termék repójába, a megfelelő asset-helyre (pl. `product/repo/public/` vagy `…/app/assets/`),
beszédes névvel; a `<picture>`/`next/image`-hez webp+png. A repóba commitold (build-fázis).

## Hitelesség-invariáns (KÖTELEZŐ)

A generált kép **illusztráció, nem valóság.** Építőipari/ingatlan vizuál sosem állítható egy
**valós** projektről/címről készült fotónak (a `project.md` adat-bizalom invariánsa). Marketinghez/
UI-hoz/placeholderhez OK; valós referencia-fotó helyett SOHA. Ne generálj valós személyt/logót/márkát.

## Credit-tudat

Közös keret (~431 credit a setupkor; Ultra 8, Core 3 / kép). Ne pörgess felesleges batch-eket;
előbb 1 próba, jó prompt, aztán a véglegest. Ha fogytán → szólj Tominak (METHODOLOGY §15).

## Továbbiak (ha kell, a részletekért nézd a Stability v2beta dokit)

- **Edit:** `…/edit/remove-background` (5), `…/edit/inpaint`, `…/edit/erase`, `…/edit/search-and-replace`.
- **Upscale:** `…/upscale/fast` (2, 4×), `…/upscale/conservative` (40, 4MP).
- A 24h-s async végpontoknál (creative upscale, replace-background-and-relight) `id`-t kapsz →
  `GET /v2beta/results/{id}` pollozása 10s-enként.
