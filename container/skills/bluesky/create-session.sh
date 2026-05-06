#!/bin/bash
# Authenticate with Bluesky AT Protocol and get a bearer token.
# Usage: source /workspace/agent/.secrets && bash /home/node/.claude/skills/bluesky/create-session.sh
#
# Requires BLUESKY_HANDLE and BLUESKY_APP_PASSWORD env vars.
# Outputs the access token (JWT) to stdout. Also prints DID to stderr for reference.
# Store the token: export BLUESKY_TOKEN=$(bash create-session.sh)

set -euo pipefail

for var in BLUESKY_HANDLE BLUESKY_APP_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/agent/.secrets" >&2
    exit 1
  fi
done

python3 -c "
import json, urllib.request, sys, os

handle = os.environ['BLUESKY_HANDLE']
password = os.environ['BLUESKY_APP_PASSWORD']

url = 'https://bsky.social/xrpc/com.atproto.server.createSession'
payload = json.dumps({'identifier': handle, 'password': password}).encode()

req = urllib.request.Request(url, data=payload, method='POST')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        print(data['accessJwt'])
        print(f'DID: {data[\"did\"]}', file=sys.stderr)
        print(f'Handle: {data[\"handle\"]}', file=sys.stderr)
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
"
