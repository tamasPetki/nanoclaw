#!/bin/bash
# Create a Bluesky post, reply, or quote post via AT Protocol.
# Usage: source /workspace/agent/.secrets && bash /home/node/.claude/skills/bluesky/post.sh "text" [reply_to_uri reply_to_cid] [quote_uri quote_cid]
#
# Arguments:
#   $1 - Post text (required, max 300 chars)
#   $2 - Reply parent URI (optional, e.g. at://did:plc:xxx/app.bsky.feed.post/yyy)
#   $3 - Reply parent CID (optional, required with $2)
#   $4 - Quote post URI (optional)
#   $5 - Quote post CID (optional, required with $4)
#
# Requires BLUESKY_HANDLE, BLUESKY_APP_PASSWORD env vars.
# Authenticates automatically (no need to call create-session.sh separately).

set -euo pipefail

POST_TEXT="${1:?Usage: post.sh \"text\" [reply_uri reply_cid] [quote_uri quote_cid]}"
REPLY_URI="${2:-}"
REPLY_CID="${3:-}"
QUOTE_URI="${4:-}"
QUOTE_CID="${5:-}"

for var in BLUESKY_HANDLE BLUESKY_APP_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/agent/.secrets" >&2
    exit 1
  fi
done

# Export args as env vars so the Python heredoc can read them without shell
# interpolation (avoids bash trying to expand $type / $embed / $facet etc).
export POST_TEXT REPLY_URI REPLY_CID QUOTE_URI QUOTE_CID

python3 <<'PYEOF'
import json, urllib.request, urllib.error, sys, os, re
from datetime import datetime, timezone

handle = os.environ['BLUESKY_HANDLE']
password = os.environ['BLUESKY_APP_PASSWORD']
text = os.environ.get('POST_TEXT', '')
reply_uri = os.environ.get('REPLY_URI', '') or ''
reply_cid = os.environ.get('REPLY_CID', '') or ''
quote_uri = os.environ.get('QUOTE_URI', '') or ''
quote_cid = os.environ.get('QUOTE_CID', '') or ''

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
did = auth['did']

# Detect URLs and create facets for link embedding
url_pattern = re.compile(r'https?://[^\s\)\]>,"]+')
facets = []
for match in url_pattern.finditer(text):
    start = len(text[:match.start()].encode('utf-8'))
    end = len(text[:match.end()].encode('utf-8'))
    facets.append({
        'index': {'byteStart': start, 'byteEnd': end},
        'features': [{'$type': 'app.bsky.richtext.facet#link', 'uri': match.group()}]
    })

# Build record
record = {
    '$type': 'app.bsky.feed.post',
    'text': text,
    'createdAt': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
}

if facets:
    record['facets'] = facets

# Add reply reference
if reply_uri and reply_cid:
    # For reply, we need both parent and root. If replying to a top-level post, root = parent.
    record['reply'] = {
        'root': {'uri': reply_uri, 'cid': reply_cid},
        'parent': {'uri': reply_uri, 'cid': reply_cid},
    }

# Add quote embed
if quote_uri and quote_cid:
    record['embed'] = {
        '$type': 'app.bsky.embed.record',
        'record': {'uri': quote_uri, 'cid': quote_cid},
    }

# Create post
post_url = 'https://bsky.social/xrpc/com.atproto.repo.createRecord'
post_payload = json.dumps({
    'repo': did,
    'collection': 'app.bsky.feed.post',
    'record': record,
}).encode()

req = urllib.request.Request(post_url, data=post_payload, method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        uri = data['uri']
        cid = data['cid']
        # Extract rkey for URL
        rkey = uri.split('/')[-1]
        print(f'https://bsky.app/profile/{handle}/post/{rkey}')
        print(f'URI: {uri}', file=sys.stderr)
        print(f'CID: {cid}', file=sys.stderr)
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
PYEOF
