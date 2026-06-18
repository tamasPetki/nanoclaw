---
name: bluesky
description: Search and post on Bluesky (AT Protocol). Create posts, reply to anyone (no restrictions), quote posts, search content. Use when the user asks to post on Bluesky, search Bluesky, or engage with Bluesky content.
allowed-tools: Bash(curl:*), Bash(python3:*)
secrets:
  - BLUESKY_HANDLE
  - BLUESKY_APP_PASSWORD
---

# Bluesky — Posztolás és Keresés

A Bluesky-t az AT Protocol-on keresztül használjuk. Bearer token auth — egyszerűbb mint X OAuth.

## Authentication

```bash
source /workspace/agent/.secrets
# Ezután használhatók: $BLUESKY_HANDLE, $BLUESKY_APP_PASSWORD
```

A scriptek automatikusan autentikálnak minden kérésnél (nem kell külön session-t kezelni).

## Elérhető scriptek

| Script | Leírás |
|--------|--------|
| `search-posts.sh "query" [limit]` | Posztok keresése |
| `post.sh "text" [reply_uri reply_cid] [quote_uri quote_cid]` | Poszt, reply vagy quote |
| `delete-post.sh "rkey_or_uri"` | Poszt törlése |
| `create-session.sh` | Token lekérése (a többi script automatikusan is csinálja) |

## Fontos

- **Reply bárki posztjára MŰKÖDIK** — nincs follower/mention korlátozás
- Max 300 karakter per poszt
- URL-ek automatikusan linkké válnak (facet detection)
- Reply-hoz kell a target poszt **URI** és **CID** értéke (a search kimenetéből)
