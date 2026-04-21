#!/bin/bash
# Upload a base64 image to X/Twitter and return the media_id.
# Usage: source /workspace/group/.secrets && echo "BASE64_DATA" | bash /home/node/.claude/skills/x-browser/upload-media.sh
#
# Reads base64 JPEG from stdin, outputs media_id_string to stdout.
# Requires X_API_CONSUMER_KEY, X_API_CONSUMER_SECRET, X_API_ACCESS_TOKEN,
# X_API_ACCESS_TOKEN_SECRET env vars (source .secrets first).

set -euo pipefail

for var in X_API_CONSUMER_KEY X_API_CONSUMER_SECRET X_API_ACCESS_TOKEN X_API_ACCESS_TOKEN_SECRET; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: $var must be set. Run: source /workspace/group/.secrets" >&2
    exit 1
  fi
done

IMAGE_B64=$(cat)

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

image_b64 = sys.argv[1]
url = 'https://upload.twitter.com/1.1/media/upload.json'
boundary = uuid.uuid4().hex

fields = {
    'media_data': image_b64,
    'media_category': 'tweet_image',
}

body = b''
for key, val in fields.items():
    body += f'--{boundary}\r\n'.encode()
    body += f'Content-Disposition: form-data; name=\"{key}\"\r\n\r\n'.encode()
    body += f'{val}\r\n'.encode()
body += f'--{boundary}--\r\n'.encode()

req = urllib.request.Request(url, data=body, method='POST')
req.add_header('Authorization', make_oauth_header('POST', url))
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode())
        print(result['media_id_string'])
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
" "$IMAGE_B64"
