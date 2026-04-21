# BullTrapp Resources API

Partner/ajánlott resource-ok kezelése a bulltrapp.com/resources oldalon. Email outreach-ben ezt ajánljuk cserébe: backlink a /resources-ról.

## Hitelesítés

Minden kéréshez:
```
Authorization: Bearer AbE63AyWBRhv3u4F1wcDB6sLYGQO08WzzyAV4DoWrO4=
Content-Type: application/json
```

Base URL: `https://bulltrapp.com/api/resources`

## Végpontok

### Resource létrehozás
```
POST /api/resources
```

Kötelező mezők:
- `title` (string) — Resource neve (pl. "CoinGecko")
- `description` (string) — Rövid leírás, 1-2 mondat
- `url` (string) — https:// kell
- `category` (string) — Egyike: exchange, wallet, analytics, education, community, security, defi, news

Opcionális mezők:
- `status` (string) — "draft" (default), "active", "archived". **MINDIG "draft"-ot használj** — admin aktiválja manuálisan.
- `tags` (string[]) — Max 10 tag (pl. ["market-data", "prices"])
- `featured` (boolean) — Default false
- `nofollow` (boolean) — Default true. Csak megerősített partnereknek false (SEO value átadás).
- `partnerType` (string) — "affiliate", "backlink", "cross-promo", "content". A partnership típusa alapján.
- `logoUrl` (string) — Partner logó URL
- `affiliateUrl` (string) — Affiliate/referral link (nem publikus, belső tracking)
- `sortOrder` (number) — Megjelenítési sorrend, default 0. Alacsonyabb = elöl.

Példa:
```json
{
  "title": "CoinGecko",
  "description": "Free crypto price tracking, market data, and portfolio management.",
  "url": "https://www.coingecko.com",
  "category": "analytics",
  "tags": ["market-data", "portfolio", "prices"],
  "partnerType": "backlink",
  "nofollow": false
}
```

Válasz: `{ "data": { "id": "abc123", "slug": "coingecko", ... } }`

### Összes resource listázás
```
GET /api/resources
GET /api/resources?status=draft
GET /api/resources?category=exchange
GET /api/resources?featured=true
```

Válasz: `{ "data": [...], "meta": { "total": 5 } }`

### Egy resource lekérdezése
```
GET /api/resources/{id}
```

### Resource frissítése
```
PUT /api/resources/{id}
```

Csak a változó mezőket küldd:
```json
{ "description": "Updated description", "tags": ["new-tag"] }
```

### Resource törlése
```
DELETE /api/resources/{id}
```

Válasz: 204 No Content

## Szabályok

1. **MINDIG draft státusszal hozz létre** — admin aktiválja manuálisan.
2. URL érvényes https:// legyen.
3. Max 10 tag per resource.
4. Slug auto-generált a title-ből (pl. "CoinGecko" → "coingecko"). Ha létezik, szám suffix kerül rá.
5. **Létrehozás előtt GET-tel ellenőrizd** hogy nem létezik-e már.
6. `partnerType` a deal alapján: "affiliate" ha referral linkünk van, "backlink" ha visszalinkelnek, "cross-promo" kölcsönös promóció, "content" tartalmi együttműködés.
7. `nofollow: false` CSAK megerősített backlink partnereknél ahol kifejezetten megegyeztünk SEO value átadásban.
8. Hibás válaszok: `{ "error": "Error message" }` — 400, 401, 404, 500 státuszokkal.

## Használat az outreach-ben

Amikor egy partnernek emailezel és backlinket ajánlasz a /resources oldalról:
1. Ellenőrizd, hogy a partner még nincs-e felvéve (`GET /api/resources`)
2. Hozd létre draft-ként az emailben ígért resource-t
3. Az emailben hivatkozz rá: "We've already added you to bulltrapp.com/resources"
4. Ha a partner elfogadja a backlink swap-ot: Tomi-nak szólj Discord-on hogy aktiválja és állítsa `nofollow: false`-ra
