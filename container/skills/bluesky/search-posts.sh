#!/bin/bash
# Search Bluesky posts via AT Protocol.
# Usage: source /workspace/group/.secrets && bash /home/node/.claude/skills/bluesky/search-posts.sh "query" [LIMIT]
#
# Requires BLUESKY_HANDLE and BLUESKY_APP_PASSWORD env vars.
# Returns: post text, author handle, like/reply/repost counts, post URL, URI, CID.
# The URI and CID are needed for reply/quote operations.

set -euo pipefail

QUERY="${1:?Usage: search-posts.sh \"query\" [LIMIT]}"
LIMIT="${2:-25}"

for var in BLUESKY_HANDLE BLUESKY_APP_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/group/.secrets" >&2
    exit 1
  fi
done

# Clamp limit (1-100)
if [ "$LIMIT" -lt 1 ]; then LIMIT=1; fi
if [ "$LIMIT" -gt 100 ]; then LIMIT=100; fi

python3 -c "
import json, urllib.request, urllib.parse, sys, os

handle = os.environ['BLUESKY_HANDLE']
password = os.environ['BLUESKY_APP_PASSWORD']
query = sys.argv[1]
limit = sys.argv[2]

# Authenticate
auth_url = 'https://bsky.social/xrpc/com.atproto.server.createSession'
auth_payload = json.dumps({'identifier': handle, 'password': password}).encode()
req = urllib.request.Request(auth_url, data=auth_payload, method='POST')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        auth = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: Auth failed HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)

token = auth['accessJwt']

# Search posts
encoded_query = urllib.parse.quote(query)
search_url = f'https://bsky.social/xrpc/app.bsky.feed.searchPosts?q={encoded_query}&limit={limit}'
req = urllib.request.Request(search_url)
req.add_header('Authorization', f'Bearer {token}')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)

posts = data.get('posts', [])
if not posts:
    print('No results found.')
    sys.exit(0)

for i, post in enumerate(posts, 1):
    author = post.get('author', {})
    author_handle = author.get('handle', 'unknown')
    author_name = author.get('displayName', '')
    record = post.get('record', {})
    text = record.get('text', '')
    created = record.get('createdAt', '')[:10]
    uri = post.get('uri', '')
    cid = post.get('cid', '')

    # Extract rkey from URI for URL
    rkey = uri.split('/')[-1] if uri else ''

    likes = post.get('likeCount', 0)
    replies = post.get('replyCount', 0)
    reposts = post.get('repostCount', 0)

    print(f'--- [{i}] @{author_handle} ({author_name}) | {created} ---')
    print(f'{text}')
    print(f'Likes: {likes} | Replies: {replies} | Reposts: {reposts}')
    print(f'URL: https://bsky.app/profile/{author_handle}/post/{rkey}')
    print(f'URI: {uri}')
    print(f'CID: {cid}')
    print()
" "$QUERY" "$LIMIT"
