#!/bin/bash
# Post a tweet (or reply or quote tweet) via X API v2 with OAuth 1.0a.
# Usage: source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/post-tweet.sh "tweet text" [reply_to_tweet_id] [media_id] [quote_tweet_id]
#
# Requires X_API_CONSUMER_KEY, X_API_CONSUMER_SECRET, X_API_ACCESS_TOKEN,
# X_API_ACCESS_TOKEN_SECRET env vars (source .secrets first).

set -euo pipefail

TWEET_TEXT="${1:?Usage: post-tweet.sh \"tweet text\" [reply_to_tweet_id] [media_id] [quote_tweet_id]}"
REPLY_TO="${2:-}"
MEDIA_ID="${3:-}"
QUOTE_TWEET_ID="${4:-}"

# Verify credentials
for var in X_API_CONSUMER_KEY X_API_CONSUMER_SECRET X_API_ACCESS_TOKEN X_API_ACCESS_TOKEN_SECRET; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/agent/.secrets" >&2
    exit 1
  fi
done

# Build tweet payload
PAYLOAD="{\"text\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$TWEET_TEXT")"
if [ -n "$REPLY_TO" ]; then
  PAYLOAD="${PAYLOAD}, \"reply\": {\"in_reply_to_tweet_id\": \"${REPLY_TO}\"}"
fi
if [ -n "$MEDIA_ID" ]; then
  PAYLOAD="${PAYLOAD}, \"media\": {\"media_ids\": [\"${MEDIA_ID}\"]}"
fi
if [ -n "$QUOTE_TWEET_ID" ]; then
  PAYLOAD="${PAYLOAD}, \"quote_tweet_id\": \"${QUOTE_TWEET_ID}\""
fi
PAYLOAD="${PAYLOAD}}"

python3 -c "
import urllib.parse, hmac, hashlib, base64, time, uuid, json, urllib.request, sys, os

consumer_key = os.environ['X_API_CONSUMER_KEY']
consumer_secret = os.environ['X_API_CONSUMER_SECRET']
access_token = os.environ['X_API_ACCESS_TOKEN']
access_token_secret = os.environ['X_API_ACCESS_TOKEN_SECRET']

def make_oauth_header(method, url):
    op = {
        'oauth_consumer_key': consumer_key,
        'oauth_nonce': uuid.uuid4().hex,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': str(int(time.time())),
        'oauth_token': access_token,
        'oauth_version': '1.0',
    }
    ps = '&'.join(f'{urllib.parse.quote(k,safe=\"\")}={urllib.parse.quote(v,safe=\"\")}'
                   for k,v in sorted(op.items()))
    bs = f'{method}&{urllib.parse.quote(url,safe=\"\")}&{urllib.parse.quote(ps,safe=\"\")}'
    sk = f'{urllib.parse.quote(consumer_secret,safe=\"\")}&{urllib.parse.quote(access_token_secret,safe=\"\")}'
    sig = base64.b64encode(hmac.new(sk.encode(),bs.encode(),hashlib.sha1).digest()).decode()
    op['oauth_signature'] = sig
    return 'OAuth ' + ', '.join(
        f'{urllib.parse.quote(k,safe=\"\")}=\"{urllib.parse.quote(v,safe=\"\")}\"'
        for k,v in sorted(op.items()))

url = 'https://api.x.com/2/tweets'
payload = sys.argv[1].encode()
req = urllib.request.Request(url, data=payload, method='POST')
req.add_header('Authorization', make_oauth_header('POST', url))
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode())
        tweet_id = body['data']['id']
        username = os.environ.get('X_POST_USERNAME', 'krip_tom')
        print(f'https://x.com/{username}/status/{tweet_id}')
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
" "$PAYLOAD"
