#!/bin/bash
# Delete a Bluesky post via AT Protocol.
# Usage: source /workspace/group/.secrets && bash /home/node/.claude/skills/bluesky/delete-post.sh "RKEY"
#
# RKEY is the last segment of the post URI (at://did:plc:xxx/app.bsky.feed.post/RKEY).
# You can also pass the full URI — the script will extract the rkey automatically.
#
# Requires BLUESKY_HANDLE and BLUESKY_APP_PASSWORD env vars.

set -euo pipefail

INPUT="${1:?Usage: delete-post.sh \"RKEY_OR_URI\"}"

for var in BLUESKY_HANDLE BLUESKY_APP_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/group/.secrets" >&2
    exit 1
  fi
done

python3 -c "
import json, urllib.request, sys, os

handle = os.environ['BLUESKY_HANDLE']
password = os.environ['BLUESKY_APP_PASSWORD']
input_val = sys.argv[1]

# Extract rkey from URI if full URI provided
if input_val.startswith('at://'):
    rkey = input_val.split('/')[-1]
else:
    rkey = input_val

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

# Delete post
delete_url = 'https://bsky.social/xrpc/com.atproto.repo.deleteRecord'
delete_payload = json.dumps({
    'repo': did,
    'collection': 'app.bsky.feed.post',
    'rkey': rkey,
}).encode()

req = urllib.request.Request(delete_url, data=delete_payload, method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print(f'Deleted post {rkey}')
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
" "$INPUT"
