#!/bin/bash
# Generate an image via Stability AI Ultra and optionally upload to X.
# Usage: source /workspace/group/.secrets && bash /home/node/.claude/skills/x-browser/generate-image.sh "prompt" [aspect_ratio]
#
# Outputs: base64 JPEG to stdout (pipe to upload-media.sh or save to file)
# Requires STABILITY_API_KEY env var (source .secrets first).

set -euo pipefail

PROMPT="${1:?Usage: generate-image.sh \"prompt\" [aspect_ratio]}"
ASPECT="${2:-16:9}"

if [ -z "${STABILITY_API_KEY:-}" ]; then
  echo "ERROR: STABILITY_API_KEY must be set. Run: source /workspace/group/.secrets" >&2
  exit 1
fi

python3 -c "
import urllib.request, json, uuid, sys, os

stability_api_key = os.environ['STABILITY_API_KEY']
prompt = sys.argv[1]
aspect_ratio = sys.argv[2]

url = 'https://api.stability.ai/v2beta/stable-image/generate/ultra'
boundary = uuid.uuid4().hex

fields = {
    'prompt': prompt,
    'output_format': 'jpeg',
    'aspect_ratio': aspect_ratio,
}

body = b''
for key, val in fields.items():
    body += f'--{boundary}\r\n'.encode()
    body += f'Content-Disposition: form-data; name=\"{key}\"\r\n\r\n'.encode()
    body += f'{val}\r\n'.encode()
body += f'--{boundary}--\r\n'.encode()

req = urllib.request.Request(url, data=body, method='POST')
req.add_header('Authorization', f'Bearer {stability_api_key}')
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Accept', 'application/json')
req.add_header('User-Agent', 'NanoClaw/1.0')

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode())
        print(result['image'])
except urllib.error.HTTPError as e:
    error_body = e.read().decode() if e.fp else ''
    print(f'ERROR: HTTP {e.code}: {error_body}', file=sys.stderr)
    sys.exit(1)
" "$PROMPT" "$ASPECT"
