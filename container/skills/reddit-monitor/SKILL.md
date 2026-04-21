---
name: reddit-monitor
description: Reddit monitoring, search, and posting for BullTrapp outreach. Read posts, search across subreddits, score relevance, and post comments via browser automation.
allowed-tools: Bash(curl:*), Bash(jq:*), Bash(python3:*), Bash(agent-browser:*)
secrets:
  - REDDIT_PROXY
  - REDDIT_SESSION
---

# Reddit Monitor & Poster — BullTrapp Outreach

## Olvasás — Subreddit browsing

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/reddit-monitor/fetch-posts.sh SUBREDDIT [LIMIT] [SORT]
```
Residential proxy-n keresztül JSON API-t használ (upvote, comment szám, selftext). RSS fallback ha proxy nem elérhető.

## Keresés — Cross-subreddit search

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "QUERY" [LIMIT] [TIME] [SORT]
```
A `/search.json` endpointot használja — egyetlen query az EGÉSZ Reddit-en keres. Relevánsabb találatok mint a subreddit browsing.

Paraméterek:
- QUERY: keresési kifejezés (pl. "portfolio tracker crypto")
- LIMIT: max találatok (default 25)
- TIME: hour, day, week, month (default month)
- SORT: relevance, new, top, comments (default relevance)

## Relevancia scoring

```bash
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "QUERY" 15 | \
  bash /home/node/.claude/skills/reddit-monitor/score-posts.sh "QUERY" [THRESHOLD]
```
Token overlap scoring (0.0-1.0). Threshold default: 0.20. Nincs LLM költség.

## Javasolt keresések

| Query | Cél |
|-------|-----|
| `"portfolio tracker" crypto` | Core termék |
| `polymarket portfolio OR tracking` | Egyedi differenciáló |
| `"too many" crypto exchanges OR tabs` | Pain point |
| `coingecko OR blockfolio alternative` | Competitor elégedetlenség |
| `crypto dashboard "all in one"` | Feature match |

## Posztolás — curl via old.reddit.com API

Elsődleges út. Sticky HU proxy + cookie auth + modhash, curl-lel. Gyors, megbízható.

```bash
source /workspace/group/.secrets
bash /home/node/.claude/skills/reddit-monitor/reddit-comment.sh "t3_POST_ID" "COMMENT_TEXT"
```

A `POST_ID` a Reddit URL-ből: `reddit.com/r/sub/comments/1sg02ul/title/` → `t3_1sg02ul`

Env vars: `REDDIT_PROXY` (sticky HU), `REDDIT_SESSION`.

Ha "Session may be expired" hibát kapsz: Tominak újra kell exportálnia a `reddit_session` cookie-t.

### Tartalék: stealth-browser

Ha a curl path újra problémát okoz (lock, shadowban, rate limit), van `reddit-comment-stealth.sh` — headed Chrome Xvfb-n, valós fingerprint. Nincs live-tesztelve — első éles használat figyelt módon.

## Komment szabályok

- "Full disclosure: I'm the dev" — KÖTELEZŐ
- Először válaszolj a kérdésre genuinely — AZTÁN említsd a BullTrapp-ot
- Max 200-300 karakter
- Link: `bulltrapp.com?utm_source=reddit&utm_campaign=beta`
- SOHA: emoji, marketing nyelv, feature matrix, copy-paste
- **Volumen**: 1-4 komment/nap (randomizált), 2-7h közök (randomizált), karma és outreach külön napra

## Competitive research

Ugyanez az eszköztár ad-hoc kutatásra is:
```bash
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "coingecko problems OR issues" 25
bash /home/node/.claude/skills/reddit-monitor/search-reddit.sh "best crypto portfolio tracker 2026" 20
```
