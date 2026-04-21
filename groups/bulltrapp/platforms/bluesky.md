# Bluesky — API, Stratégia (PRIME CSATORNA)

> **Ez a #1 prioritás csatorna.** Nincs reply gate, nincs follower restriction. Max 10 reply/poszt per nap.

> `source /workspace/group/.secrets` minden bash parancs előtt!
> Szükséges env-ek: `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`

## Keresés

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/bluesky/search-posts.sh "crypto portfolio tracker" [LIMIT]
```

Kimenet: poszt szöveg, szerző, engagement metrikák, URL, **URI** és **CID** (reply/quote-hoz kellenek).

## Posztolás

```bash
source /workspace/group/.secrets

# Standalone poszt
bash /home/node/.claude/skills/bluesky/post.sh "TEXT"

# Reply (NINCS korlátozás — bárki posztjára válaszolhatsz!)
# URI és CID a search kimenetéből
bash /home/node/.claude/skills/bluesky/post.sh "TEXT" "at://did:plc:xxx/app.bsky.feed.post/yyy" "CID_HASH"

# Quote post
bash /home/node/.claude/skills/bluesky/post.sh "TEXT" "" "" "at://did:plc:xxx/app.bsky.feed.post/yyy" "CID_HASH"
```

**Max 300 karakter** per poszt (nem 280 mint X-en).

## Törlés

```bash
source /workspace/group/.secrets
# RKEY a poszt URI utolsó szegmense, vagy teljes URI is megadható
bash /home/node/.claude/skills/bluesky/delete-post.sh "RKEY_OR_URI"
```

## Stratégia

- **Reply a fő fegyver** — Bluesky-on NINCS reply-gate. Bárki posztjára válaszolhatsz.
- Keress releváns crypto/fintech/Polymarket posztokat → válaszolj értékes kommentárral
- Quote poszt: ha a target poszt jól illeszkedik a BullTrapp narratívához
- Standalone poszt: napi 1 insight/thread (portfóliókezelés, Polymarket, exchange tippek)
- **Ne spammelj** — minden engagement legyen értékes, ne csak "check out BullTrapp"

### Engagement prioritás

1. **Reply releváns posztokra** — ez az elsődleges engagement mód
2. **Mention monitoring** — keress @handle mention-öket, válaszolj
3. **Standalone tartalom** — insight posztok, threadek
4. **Quote post** — ha a context indokolja

### Jó keresések

- `"crypto portfolio"` — direkt versenytárs/use-case keresés
- `"polymarket"` — egyedi differenciáló
- `"portfolio tracker"` — need-based keresés
- `"multiple exchanges"` — pain-point alapú
- `"prediction market"` — Polymarket és hasonlók
- `"exchange comparison"` — exchange összehasonlítás pain point
- `"defi portfolio"` — DeFi + portfolio kezelés
- `"multi-chain wallet"` — multi-chain tracking use case

### Napi elosztás (10/nap limit)

- **7 reply** releváns posztokra (70%) — ez hozza a legtöbb engagement-et
- **3 standalone poszt** (30%) — insight, Polymarket adat, portfolio tipp

## Bluesky Voice (voice.md kiegészítés)

- Max 300 karakter (de rövidebb = jobb)
- Barátságos, technikai, builder voice — pont mint X-en, de lazább (Bluesky kultúra kevésbé formális)
- Link közvetlenül a posztban OK (nem kell reply-ban elrejteni mint X-en): bulltrapp.com?utm_source=bluesky&utm_medium=organic&utm_campaign=beta
- NE használj hashtageket excesszíven — Bluesky kultúrában ez spam jel
- Egy-egy hashtag OK ha releváns: #crypto #polymarket
