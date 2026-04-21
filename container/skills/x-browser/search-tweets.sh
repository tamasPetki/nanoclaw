#!/bin/bash
# Search recent tweets via X API v2 Recent Search endpoint.
# Usage: source /workspace/group/.secrets && bash /home/node/.claude/skills/x-browser/search-tweets.sh "query" [MAX_RESULTS]
#
# Uses OAuth 1.0a (same credentials as post-tweet.sh).
# Returns: tweet text, author, engagement metrics, tweet URL.
# Rate limit: 60 requests per 15 min (Basic tier), 450 (Pro).

set -euo pipefail

QUERY="${1:?Usage: search-tweets.sh \"query\" [MAX_RESULTS]}"
MAX_RESULTS="${2:-20}"

# Verify credentials
for var in X_API_CONSUMER_KEY X_API_CONSUMER_SECRET X_API_ACCESS_TOKEN X_API_ACCESS_TOKEN_SECRET; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/group/.secrets" >&2
    exit 1
  fi
done

# Clamp max_results to API limits (10-100)
if [ "$MAX_RESULTS" -lt 10 ]; then MAX_RESULTS=10; fi
if [ "$MAX_RESULTS" -gt 100 ]; then MAX_RESULTS=100; fi

# Build the search URL with query parameters
BASE_URL="https://api.x.com/2/tweets/search/recent"
ENCODED_QUERY=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$QUERY")
URL="${BASE_URL}?query=${ENCODED_QUERY}&max_results=${MAX_RESULTS}&tweet.fields=created_at,public_metrics,author_id,conversation_id&expansions=author_id&user.fields=username,name,public_metrics"

# Generate OAuth 1.0a signature and make the request
python3 -c "
import urllib.parse, hmac, hashlib, base64, time, uuid, json, urllib.request, sys, os

consumer_key = os.environ['X_API_CONSUMER_KEY']
consumer_secret = os.environ['X_API_CONSUMER_SECRET']
access_token = os.environ['X_API_ACCESS_TOKEN']
access_token_secret = os.environ['X_API_ACCESS_TOKEN_SECRET']

url_str = sys.argv[1]
# Split URL into base and params for OAuth signature
parsed = urllib.parse.urlparse(url_str)
base_url = f'{parsed.scheme}://{parsed.netloc}{parsed.path}'
query_params = dict(urllib.parse.parse_qsl(parsed.query))

op = {
    'oauth_consumer_key': consumer_key,
    'oauth_nonce': uuid.uuid4().hex,
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp': str(int(time.time())),
    'oauth_token': access_token,
    'oauth_version': '1.0',
}

# Combine OAuth params with query params for signature
all_params = {**op, **query_params}
ps = '&'.join(f'{urllib.parse.quote(k,safe=\"\")}={urllib.parse.quote(v,safe=\"\")}'
               for k,v in sorted(all_params.items()))
bs = f'GET&{urllib.parse.quote(base_url,safe=\"\")}&{urllib.parse.quote(ps,safe=\"\")}'
sk = f'{urllib.parse.quote(consumer_secret,safe=\"\")}&{urllib.parse.quote(access_token_secret,safe=\"\")}'
sig = base64.b64encode(hmac.new(sk.encode(),bs.encode(),hashlib.sha1).digest()).decode()
op['oauth_signature'] = sig
auth = 'OAuth ' + ', '.join(
    f'{urllib.parse.quote(k,safe=\"\")}=\"{urllib.parse.quote(v,safe=\"\")}\"'
    for k,v in sorted(op.items()))

req = urllib.request.Request(url_str)
req.add_header('Authorization', auth)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())

    if 'data' not in data:
        print('No results found for query.', file=sys.stderr)
        sys.exit(0)

    # Build user lookup map from includes
    users = {}
    if 'includes' in data and 'users' in data['includes']:
        for u in data['includes']['users']:
            users[u['id']] = {
                'username': u['username'],
                'name': u['name'],
                'followers': u.get('public_metrics', {}).get('followers_count', 0)
            }

    # Output formatted results
    for tweet in data['data']:
        author = users.get(tweet['author_id'], {'username': 'unknown', 'name': 'Unknown', 'followers': 0})
        metrics = tweet.get('public_metrics', {})
        print(f\"@{author['username']} ({author['name']}) [{author['followers']} followers]\")
        print(f\"{tweet['text']}\")
        print(f\"Likes: {metrics.get('like_count',0)} | RTs: {metrics.get('retweet_count',0)} | Replies: {metrics.get('reply_count',0)}\")
        print(f\"https://x.com/{author['username']}/status/{tweet['id']}\")
        print(f\"Posted: {tweet.get('created_at','unknown')}\")
        print()

except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    if e.code == 429:
        print('ERROR: Rate limited (429). Wait 15 minutes and retry.', file=sys.stderr)
    elif e.code == 401:
        print('ERROR: Authentication failed (401). Check API credentials.', file=sys.stderr)
    else:
        print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
" "$URL"
