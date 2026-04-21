# X (Twitter) — API, Stratégia

> **DORMANT CSATORNA (2026-04-09)** — @Bulltrappcom 0 follower, standalone tweetek 0 reach, reply-ok 403. Ne pazarold az időd erre amíg Tomi újra nem aktiválja. Fókuszálj Bluesky-ra és email outreach-re.

> `source /workspace/group/.secrets` minden bash parancs előtt!

## Reply browser-en keresztül (ÚJ — 2026-04-09)

A v2 API @krip_tom-on és @Bulltrappcom-on egyaránt 403-at ad reply-ra (tier korlátozás + 0 follower restriction). De a **headed Chrome stealth-browse** képes a webes UI-n keresztül reply-olni, **úgy mint te kézzel**:

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/stealth-browser/x-reply.sh \
  "https://x.com/USER/status/TWEET_ID" \
  "your reply text here, max 280 chars"
```

A helper:
1. Indítja a headed Chromiumot virtuális X display-en (Xvfb)
2. Beinjektálja az X cookie-kat (`X_AUTH_TOKEN`, `X_CT0`) → bejelentkezett mint @krip_tom
3. Megnyitja a target tweet URL-t
4. Kattint reply gomb → textarea → humán-tempóval gépeli a szöveget → kattint Posztolás
5. Screenshot-okat ment minden lépésnél `/tmp/x-reply-<timestamp>/` alá
6. Exit code 0 = modal becsukódott (sikeres küldés), exit 2 = még nyitva (rate limit / restricted / túl hosszú)

**Account:** A `.secrets`-ben levő `X_AUTH_TOKEN` + `X_CT0` a @krip_tom session, tehát **a @krip_tom néven megy a reply** — nem @Bulltrappcom néven. Ez OK, mert a @krip_tom egy 8+ éves account, kevésbé restricted.

**Limit:** napi 1-2 reply az első héten, mielőtt skálázunk. Csak nyilvánosan reply-elhető tweetekre, konkrét értéket adó válaszokkal (nem promo).

**Validate after:** mindig nézd meg a screenshot-ot `/tmp/x-reply-*/05-after-submit.png`-ben, hogy tényleg eltűnt-e a modal.

## Keresés

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/x-browser/search-tweets.sh "QUERY" [LIMIT]
```

## Posztolás

```bash
source /workspace/group/.secrets

# Standalone tweet
bash /home/node/.claude/skills/x-browser/post-tweet.sh "TEXT"

# Quote tweet (AJÁNLOTT reply helyett — reply-ok 403-at adnak restricted settings miatt)
# 4. paraméter a quote_tweet_id
bash /home/node/.claude/skills/x-browser/post-tweet.sh "TEXT" "" "" "TWEET_ID_TO_QUOTE"

# Reply (ritkán működik — legtöbb user restricted reply)
bash /home/node/.claude/skills/x-browser/post-tweet.sh "TEXT" "REPLY_TO_TWEET_ID"
```

## @Bulltrappcom credential override

A default credentials @krip_tom (READ ONLY). @Bulltrappcom-hoz felülírod az env változókat:

```bash
# @Bulltrappcom standalone tweet:
X_API_CONSUMER_KEY="$BT_X_API_CONSUMER_KEY" \
X_API_CONSUMER_SECRET="$BT_X_API_CONSUMER_SECRET" \
X_API_ACCESS_TOKEN="$BT_X_API_ACCESS_TOKEN" \
X_API_ACCESS_TOKEN_SECRET="$BT_X_API_ACCESS_TOKEN_SECRET" \
X_POST_USERNAME="Bulltrappcom" \
bash /home/node/.claude/skills/x-browser/post-tweet.sh "TEXT"

# @Bulltrappcom quote tweet:
X_API_CONSUMER_KEY="$BT_X_API_CONSUMER_KEY" \
X_API_CONSUMER_SECRET="$BT_X_API_CONSUMER_SECRET" \
X_API_ACCESS_TOKEN="$BT_X_API_ACCESS_TOKEN" \
X_API_ACCESS_TOKEN_SECRET="$BT_X_API_ACCESS_TOKEN_SECRET" \
X_POST_USERNAME="Bulltrappcom" \
bash /home/node/.claude/skills/x-browser/post-tweet.sh "TEXT" "" "" "TWEET_ID_TO_QUOTE"
```

## Stratégia

- @krip_tom: **READ ONLY** (API 403 — free tier korlátozás, nem javítható)
- @Bulltrappcom: standalone tweet ÉS quote tweet működik
- **Reply-ok NEM működnek** — X 403: "Reply to this conversation is not allowed because you have not been mentioned or otherwise engaged by the author". Ez account-szintű korlátozás (0 follower, új account).
- Saját tweetekre reply: MŰKÖDIK (thread-építés OK)
- **QUOTE TWEET használd reply helyett** — nem kell hozzá a target tweet reply permission
- Keress releváns crypto/fintech tweeteket → quote tweet-eld kommentárral
- **Engagement-építés:** Ha valaki mention-öl vagy reply-ol nekünk, AZT reply-olhatjuk vissza. Keress mention-öket rendszeresen.

## Follower-building stratégia

A @Bulltrappcom account jelenleg ~0 follower. Amíg nincs ~50 follower, az X reply-ok 403-at adnak. Cél: organikus follower-építés.

### Napi tartalom
- **1 thread/nap**: Crypto insight thread (3-5 tweet). Témák: portfolio management tippek, exchange összehasonlítás, Polymarket alpha, on-chain adatok. Post → self-reply → self-reply.
- **1-2 quote tweet/nap**: Releváns crypto/fintech tweetek quote-olása értékes kommentárral.
- **Pinned tweet**: A legjobb thread legyen pinned. Cseréld ki ha jobb jön.

### Profil optimalizálás
- Bio: "Building @BullTrapp — track crypto, stocks & Polymarket in one dashboard. Open beta 🔗"
- Link: bulltrapp.com
- Pinned tweet: legjobb performing thread

### Follow stratégia
- Kövesd: crypto builders, indie hackers, fintech devs (100-5K follower tartomány)
- NE kövesd: nagy accountokat (>50K) — nem fognak visszakövetni
- Napi max 10 follow (ne legyen spammy)
- Ha valaki visszakövet és releváns → engage tartalmaival

### Mention monitoring
- Minden session elején: keress @Bulltrappcom mention-öket
- Ha valaki mention-öl vagy reply-ol → REPLY VISSZA (ez működik, mert ők engaged)
- Ez a legértékesebb engagement — mindig priorizáld

### Mérföldkövek
- **~20 follower**: Teszteld újra a reply-t egy kis accountra
- **~50 follower**: Teszteld reply-t normál accountokra
- Ha reply működik → logold `state.json` learnings-be, frissítsd ezt a fájlt

## X Voice (voice.md kiegészítés)

- Max 280 karakter
- Builder voice, nem hype
- Link reply-ban (nem a fő tweetben): bulltrapp.com?utm_source=x&utm_medium=organic&utm_campaign=beta
