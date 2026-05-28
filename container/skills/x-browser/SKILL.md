---
name: x-browser
description: Read and post X (Twitter) content — timelines, lists, profiles, tweets. Includes AI image generation (Stability AI) for tweet media. Use when the user asks to check X, read tweets, summarize timeline, look up X profiles/posts, post/tweet something, or generate images for tweets.
allowed-tools: Bash(curl:*), Bash(jq:*), Bash(python3:*)
secrets:
  - X_CT0
  - X_AUTH_TOKEN
  - X_API_CONSUMER_KEY
  - X_API_CONSUMER_SECRET
  - X_API_ACCESS_TOKEN
  - X_API_ACCESS_TOKEN_SECRET
  - BT_X_API_CONSUMER_KEY
  - BT_X_API_CONSUMER_SECRET
  - BT_X_API_ACCESS_TOKEN
  - BT_X_API_ACCESS_TOKEN_SECRET
  - STABILITY_API_KEY
---

# X (Twitter) Olvasás és Posztolás

Az X tartalmakat a belső GraphQL API-n keresztül **olvassuk** curl GET kérésekkel.
Posztoláshoz az **X API v2**-t használjuk OAuth 1.0a hitelesítéssel.

## Authentication

A secret env var-ok (`X_AUTH_TOKEN`, `X_CT0`) elérhetők a `.secrets` fájlból:
```bash
source /workspace/agent/.secrets
# Ezután használhatók: $X_AUTH_TOKEN, $X_CT0
```

Minden X API kéréshez ezek a headerek kellenek:
```bash
source /workspace/agent/.secrets
curl -s \
  -H "Cookie: auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}" \
  -H "x-csrf-token: ${X_CT0}" \
  -H "authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA" \
  "URL"
```

A Bearer token fix — ez az X web kliens publikus tokenje.

## Tomi X listái

| Lista | ID | Tartalom |
|-------|-----|----------|
| AI lista #1 | `2026028408996823510` | Top 50 AI account |
| AI lista #2 | `1953536336675365173` | Kiegészítő AI account lista |
| Crypto/Investor lista | `1763666482175631479` | Kriptó influencerek, traderek, befektetők |

## Lista olvasása

### Ajánlott: wrapper script (egyszerűbb, kevesebb hibalehetőség)

```bash
source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh LIST_ID [COUNT]
```

Példa: `source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh 2026028408996823510`

A script automatikusan:
- Kiolvassa a QUERY_ID-t ebből a SKILL.md-ből (single source of truth)
- Kezeli az auth-ot a .secrets fájlból
- Retry-olja a 401-et
- Parseol jq-val és engagement adatokat is ad

FONTOS: **Mindig a scriptet használd**, NE konstruálj saját curl parancsot. A queryId
gyakran rotálódik, a script mindig a friss értéket olvassa ki.

### Referencia: raw GraphQL endpoint (csak ha a script nem elérhető)

```bash
# QueryID — ez a host által automatikusan frissített érték.
# SOHA ne találj ki saját queryId-t — KIZÁRÓLAG az alábbit használd:
QUERY_ID="K77PSxWq_St4HLusAV9nVg"
LIST_ID="2026028408996823510"

# URL-encode a variables és features paramétereket
VARS='{"listId":"'$LIST_ID'","count":20}'
FEATURES='{"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"creator_subscriptions_tweet_preview_api_enabled":true,"freedom_of_speech_not_reach_fetch_enabled":true,"tweetypie_unmention_optimization_enabled":true,"longform_notetweets_consumption_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false,"responsive_web_media_download_video_enabled":false,"articles_preview_enabled":true}'

source /workspace/agent/.secrets
ENCODED_VARS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$VARS")
ENCODED_FEATURES=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$FEATURES")

curl -s \
  -H "Cookie: auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}" \
  -H "x-csrf-token: ${X_CT0}" \
  -H "authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA" \
  "https://x.com/i/api/graphql/${QUERY_ID}/ListLatestTweetsTimeline?variables=${ENCODED_VARS}&features=${ENCODED_FEATURES}"
```

### Válasz parseolása

A tweetek a következő útvonalon érhetők el:
```
data.list.tweets_timeline.timeline.instructions[].entries[].content.itemContent.tweet_results.result
```

Minden tweet-ből kiolvass:
- `result.legacy.full_text` — tweet szöveg
- `result.core.user_results.result.core.screen_name` — szerző (FONTOS: `.core.screen_name`, NEM `.legacy.screen_name`)
- `result.rest_id` — tweet ID (a linkhez kell)
- `result.legacy.created_at` — időpont
- Link: `https://x.com/{screen_name}/status/{rest_id}`

Használj `jq`-t a parseoláshoz:
```bash
cat response.json | jq -r '
  [.data.list.tweets_timeline.timeline.instructions[].entries[]
   | .content.itemContent.tweet_results.result // empty
   | {
       user: .core.user_results.result.core.screen_name,
       text: .legacy.full_text,
       date: .legacy.created_at,
       id: .rest_id
     }
  ] | sort_by(.date) | reverse | .[:20][] |
  "@\(.user) (\(.date)):\n\(.text)\nhttps://x.com/\(.user)/status/\(.id)\n"'
```

### Engagement adatok kinyerése

A GraphQL válasz engagement metrikákat is tartalmaz — használd a trending témák azonosításához:

```bash
cat response.json | jq -r '
  [.data.list.tweets_timeline.timeline.instructions[].entries[]
   | .content.itemContent.tweet_results.result // empty
   | {
       user: .core.user_results.result.core.screen_name,
       text: .legacy.full_text,
       date: .legacy.created_at,
       id: .rest_id,
       likes: .legacy.favorite_count,
       retweets: .legacy.retweet_count,
       replies: .legacy.reply_count,
       followers: .core.user_results.result.legacy.followers_count
     }
  ] | sort_by(.likes) | reverse | .[:20][] |
  "@\(.user) [\(.followers) followers] (\(.date)):\n\(.text)\nLikes: \(.likes) | RTs: \(.retweets) | Replies: \(.replies)\nhttps://x.com/\(.user)/status/\(.id)\n"'
```

## QueryID frissítés (ha "query not found" hibát kapsz)

Ha "query not found" hibát kapsz, a QUERY_ID fent ebben a fájlban elavult.
Jelezd: "Az X GraphQL queryId elavult, frissíteni kell a host-on."
NE próbálj más fájlból olvasni — a SKILL.md-ben lévő QUERY_ID az egyetlen forrás.

## Hibakezelés

- **401**: Lehet tranziens hiba! Várj 5 másodpercet és próbáld újra 1x. Ha másodszorra is 401 → jelezd: "X cookie-k lejártak, friss cookie-k kellenek."
- **429**: Rate limit → várj 10 másodpercet és próbáld újra 1x.
- **"query not found"**: QueryId elavult → lásd fent.
- **Egyéb hiba**: Jelezd és használj WebSearch fallback-et.

SOHA ne küldj POST/PUT/DELETE kérést az X **GraphQL** API-ra (olvasás).
Posztoláshoz KIZÁRÓLAG az alábbi hivatalos X API v2 módszert használd.

---

## Tweet keresés — X API v2 Recent Search

Keresés az elmúlt 7 nap tweetjei között. Használd outreach-hez, monitoring-hoz, trend felismeréshez.

### Wrapper script (AJÁNLOTT)

```bash
source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/search-tweets.sh "query" [MAX_RESULTS]
```

Példák:
```bash
# Portfolio tracker keresés
source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/search-tweets.sh "portfolio tracker crypto" 20

# Polymarket keresés
source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/search-tweets.sh "polymarket portfolio" 15

# Panasz keresés (kizárva a saját accountot)
source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/search-tweets.sh "\"too many tabs\" crypto -from:krip_tom" 20
```

A script automatikusan:
- OAuth 1.0a hitelesítés a .secrets fájlból
- Visszaadja: szerző, szöveg, engagement, link, followers szám
- Rate limit: 60 kérés / 15 perc (Basic tier)

### Query szintaxis
- `"exact phrase"` — pontos kifejezés
- `-from:username` — kizárja az adott usert
- `lang:en` — csak angol tweetek
- `-is:retweet` — nem retweetek
- `has:links` — linkkel rendelkező tweetek
- Operátorok kombinálhatók: `"portfolio tracker" lang:en -is:retweet`

### Hibakezelés
- **429**: Rate limit — várj 15 percet
- **401**: API kulcsok érvénytelenek

---

## Tweet posztolás — X API v2 (OAuth 1.0a)

A posztoláshoz az X hivatalos API-ját használjuk, NEM a GraphQL-t.

### Korlátok
- **Max 280 karakter** per tweet (nem premium account)
- Pay-per-use kredit rendszer — takarékoskodj a hívásokkal
- Angol nyelven posztolj (Tomi kérése)

### Posztolás wrapper scripttel (AJÁNLOTT)

```bash
source /workspace/agent/.secrets

# Sima tweet
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Your tweet here (max 280 chars)"

# Reply egy tweethez
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Reply text" "TWEET_ID_IDE"

# Tweet képpel (media_id-t az upload-media.sh adja)
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Tweet with image" "" "MEDIA_ID"

# Reply képpel
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Reply with image" "TWEET_ID" "MEDIA_ID"
```

A script kezeli az OAuth 1.0a hitelesítést, a `.secrets` fájlból olvassa a kulcsokat.
Kimenet: `https://x.com/krip_tom/status/{tweet_id}`

FONTOS: **Mindig a scriptet használd**, NE írj saját OAuth kódot és NE hardcódolj API kulcsokat.

---

## Kép generálás — Stability AI

### Wrapper scriptek (AJÁNLOTT)

```bash
source /workspace/agent/.secrets

# 1. Kép generálás (base64 JPEG → fájlba)
bash /home/node/.claude/skills/x-browser/generate-image.sh "image prompt here" > /tmp/image.b64

# 2. Feltöltés X-re (base64 → media_id)
MEDIA_ID=$(cat /tmp/image.b64 | bash /home/node/.claude/skills/x-browser/upload-media.sh)

# 3. Tweet képpel
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Tweet text" "" "$MEDIA_ID"
```

Aspect ratio opcióval: `generate-image.sh "prompt" "1:1"` (default: 16:9)

FONTOS: **Mindig a scripteket használd**, NE írj saját API kódot és NE hardcódolj API kulcsokat.

### Image prompt tippek

ALAPSZABÁLYOK:
- A kép SZOROSAN KÖTŐDJÖN a tweet tartalmához — ha egy konkrét tool-ról, repo-ról vagy termékről szól a tweet, a kép vizuálisan azt illusztrálja (pl. terminál screenshot-szerű, CLI output, dashboard, a tool működésének vizuális metaforája). NE generálj általános hangulatfotót ami bármilyen tech tweethez passzolna.
- Írd le a vizuális koncepciót, NE a tweet szövegét másold
- NE kérj szöveget/feliratot a képben (AI nem jó benne)
- Max 200 karakter prompt, tömör és konkrét
- VÁLTOZATOSSÁG a legfontosabb — SOHA ne ismételd ugyanazt a stílust/jelenetet kétszer egymás után

VIZUÁLIS STÍLUSOK (váltogasd véletlenszerűen):
1. **Fotórealisztikus** — "photorealistic, editorial photography, shot on Canon EOS R5"
2. **Cinematic** — "cinematic still, anamorphic lens flare, 35mm film grain, Blade Runner mood"
3. **Aerial/drone** — "aerial drone shot, bird's eye view, dramatic scale"
4. **Macro/close-up** — "extreme macro, shallow DOF, abstract texture detail"
5. **Neon/cyberpunk** — "neon-lit, rain-soaked street, cyberpunk atmosphere, reflections on wet asphalt"
6. **Minimalist** — "clean minimalist composition, single subject, negative space, studio lighting"
7. **Documentary** — "raw documentary photography, candid, available light, gritty"
8. **Surreal/conceptual** — "surreal dreamlike, impossible architecture, Escher-inspired, hyper-detailed"
9. **Retro/analog** — "1970s Kodachrome, vintage grain, warm color cast, analog feel"
10. **Dark moody** — "chiaroscuro, single light source, dramatic shadows, Caravaggio lighting"

JELENET TÍPUSOK (téma szerint válassz, de variáld):
- **AI/tech**: szerver farm, neurális hálózat vizualizáció, robot kéz és emberi kéz, holografikus kijelző, régi vs új tech kontraszt, üres irodák, chipek makró fotó
- **Crypto/finance**: Wall Street éjjel, arany vs digitális, elhagyott bank épület, pénz origami, piac zárás utáni üres parkett, háttérben Tokió/Hong Kong skyline, régi pénztárgép
- **Félelem/veszély**: elhagyott gyárcsarnok, viharfelhők város felett, dominó lánc, szétesett kirakós, olvadó jéghegy, üres szék spotlámpa alatt
- **Siker/növekedés**: rakéta kilövés, hegycsúcs napkeltekor, áttörés a felhőkön, magányos fa a sivatagban ami virágzik
- **Kontraszt/ellentét**: régi és új egymás mellett, kis vs nagy, fény vs sötét, természet vs technológia, tömeg vs egyedüllét
- **Absztrakt**: fraktálok, folyadék művészet, geometrikus formák, tükröződések, prizma fénytörés

FÉNY PALETTA (váltogasd):
- golden hour / narancs-arany
- kék-lila neon
- hideg fehér / acélszürke
- vörös-fekete drámai
- zöld mátrix
- meleg napfény természetes
- éjszakai város fények

PÉLDÁK (minden más, ne ismételd):
- "Cinematic aerial view of an empty trading floor at dawn, fog rolling through glass windows, warm golden light"
- "Extreme macro of a silicon chip, iridescent reflections, abstract technological landscape, studio lighting"
- "Lone figure silhouetted against massive data center LED lights, cyberpunk scale, rain"
- "1970s Kodachrome style photo of a Wall Street newsstand, vintage grain, warm yellows"
- "Surreal impossible staircase made of circuit boards, Escher-inspired, hyper-detailed, cool blue tones"
- "Raw documentary photo of hands typing on a mechanical keyboard, available light, shallow DOF"
- "Minimalist composition: single golden Bitcoin on black marble surface, dramatic side lighting"
- "Aerial drone shot of Tokyo financial district at night, neon rivers of traffic, tilt-shift effect"

### Hibakezelés
- **401**: Érvénytelen API kulcs
- **402**: Elfogyott a kredit
- **400**: Content policy violation (prompt elutasítva — fogalmazd át)

---

## Tweet képpel — teljes flow wrapper scriptekkel

```bash
source /workspace/agent/.secrets

# 1. Kép generálás
bash /home/node/.claude/skills/x-browser/generate-image.sh "image prompt here" > /tmp/image.b64

# 2. Feltöltés X-re
MEDIA_ID=$(cat /tmp/image.b64 | bash /home/node/.claude/skills/x-browser/upload-media.sh)

# 3. Tweet képpel
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Tweet text" "" "$MEDIA_ID"

# Thread képpel: CSAK az első tweethez csatolj képet
FIRST=$(bash /home/node/.claude/skills/x-browser/post-tweet.sh "First tweet" "" "$MEDIA_ID")
TWEET_ID=$(echo "$FIRST" | grep -oP 'status/\K\d+')
bash /home/node/.claude/skills/x-browser/post-tweet.sh "Second tweet (text only)" "$TWEET_ID"
```

### Tweet törlés

```bash
source /workspace/agent/.secrets
# Törléshez még nincs wrapper script — használd manuálisan:
python3 -c "
import os, urllib.parse, hmac, hashlib, base64, time, uuid, urllib.request
ck=os.environ['X_API_CONSUMER_KEY']; cs=os.environ['X_API_CONSUMER_SECRET']
at=os.environ['X_API_ACCESS_TOKEN']; ats=os.environ['X_API_ACCESS_TOKEN_SECRET']
url=f'https://api.x.com/2/tweets/TWEET_ID_IDE'
op={'oauth_consumer_key':ck,'oauth_nonce':uuid.uuid4().hex,'oauth_signature_method':'HMAC-SHA1','oauth_timestamp':str(int(time.time())),'oauth_token':at,'oauth_version':'1.0'}
ps='&'.join(f'{urllib.parse.quote(k,safe=\"\")}={urllib.parse.quote(v,safe=\"\")}' for k,v in sorted(op.items()))
bs=f'DELETE&{urllib.parse.quote(url,safe=\"\")}&{urllib.parse.quote(ps,safe=\"\")}'
sk=f'{urllib.parse.quote(cs,safe=\"\")}&{urllib.parse.quote(ats,safe=\"\")}'
sig=base64.b64encode(hmac.new(sk.encode(),bs.encode(),hashlib.sha1).digest()).decode()
op['oauth_signature']=sig
auth='OAuth '+', '.join(f'{urllib.parse.quote(k,safe=\"\")}=\"{urllib.parse.quote(v,safe=\"\")}\"' for k,v in sorted(op.items()))
req=urllib.request.Request(url,method='DELETE'); req.add_header('Authorization',auth)
urllib.request.urlopen(req,timeout=15); print('Deleted')
"
```

### Hibakezelés
- **403 "not permitted"**: Ellenőrizd, hogy a tweet max 280 karakter
- **429**: Rate limit — várj és próbáld újra
- **401**: API kulcsok érvénytelenek

### FONTOS szabályok
- MINDIG kérd Tomi jóváhagyását mielőtt posztolsz (mutasd meg a tweet szövegét)
- Angol nyelven posztolj
- Max 280 karakter — ha hosszabb, oszd több tweetre (thread)
- Naponta max 3 poszt (3 automatikus task fut: hottake, thread, prediction)
- NE használj hosszú gondolatjelet (em dash: —) — tipikus AI jelző. Használj rövid kötőjelet (- vagy --) helyette.
- NE használj AI-klisé fordulatokat: "Let that sink in", "Here's the thing", "game-changer", kettőspont gondolat előtt
- NE használj hízelgő fordulatokat: "nails it", "great point", "spot on", "couldn't agree more", "totally agree"
- NE használj quote_tweet_id-t — az X API nem engedi más accountok quotolását. Sima tweetként posztolj.
- Ha hivatkozol valakire, NE dicsérgesd — foglalj állást, vitázz, vagy adj hozzá egy új szempontot
- SOHA ne kezdj tweetet ".@"-tal — elavult, amatőr
- Ha @username-re hivatkozol, add meg a kontextust is — a tweet ÖNMAGÁBAN kell értelmesnek lennie, az olvasó nem látta az eredeti tweetet
- NE zárj tweetet kérdéssel ("Why is anyone still paying for this?", "Is X finally solved?") — ez olcsó engagement-bait. Ehelyett mondd el MIÉRT hasznos, MI teszi különlegessé, MIÉRT érdemes másoknak is megnézni. A cél: az olvasó TOVÁBB AKARJA OSZTANI, mert értéket kapott.
- NE sorolj feature-öket és statisztikákat anélkül, hogy elmondanád MIÉRT SZÁMÍTANAK. A tweet lényege NEM az hogy "X does Y and Z" — hanem hogy MILYEN PROBLÉMÁT old meg, MI VÁLTOZIK az olvasó életében, MIÉRT izgalmas ez. Rossz: "Vera emulates AWS locally, 80% pass rate vs 47%." Jó: "Vera lets you test AWS code offline in seconds — no credentials, no cloud bills. Caught a bug in 3 minutes that would've cost me an hour on real EC2." A számok önmagukban unalmasak — az olvasó azt akarja tudni mit jelent ez A GYAKORLATBAN.
- Ha GitHub repo-t vagy linket osztasz meg, a link MINDIG az első reply-ba kerüljön, és a tweet szövegében EGYÉRTELMŰEN jelezd: "link below" vagy "repo in the comments" — az olvasó tudja, hogy hol keresse
