#!/bin/bash
# Post a comment on a Reddit post via old.reddit.com API (curl, no browser needed).
# Usage: source .secrets && bash reddit-comment.sh "POST_FULLNAME" "COMMENT_TEXT"
#
# POST_FULLNAME: Reddit thing ID, e.g. "t3_1sg02ul" (t3_ prefix + post ID from URL)
#   To get it from a URL like reddit.com/r/sub/comments/1sg02ul/title/:
#   The post ID is "1sg02ul", fullname is "t3_1sg02ul"
#
# Requires: REDDIT_PROXY, REDDIT_SESSION
# Returns: 0 on success, 1 on failure

set -euo pipefail

THING_ID="${1:?Usage: reddit-comment.sh \"t3_POST_ID\" \"COMMENT_TEXT\"}"
COMMENT_TEXT="${2:?Usage: reddit-comment.sh \"t3_POST_ID\" \"COMMENT_TEXT\"}"

PROXY="${REDDIT_PROXY:?REDDIT_PROXY not set}"
SESSION="${REDDIT_SESSION:?REDDIT_SESSION not set}"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Step 1: Get modhash (anti-CSRF token)
MODHASH=$(curl -s \
  --proxy "http://${PROXY}" \
  -H "User-Agent: ${UA}" \
  -b "reddit_session=${SESSION}" \
  "https://old.reddit.com/" 2>/dev/null | grep -o 'modhash": "[^"]*' | head -1 | sed 's/modhash": "//')

if [ -z "$MODHASH" ]; then
  echo "ERROR: Could not get modhash. Session may be expired." >&2
  exit 1
fi

# Step 2: Post comment via old.reddit.com API
RESPONSE=$(curl -s -w "\n%{http_code}" \
  --proxy "http://${PROXY}" \
  -X POST \
  -H "User-Agent: ${UA}" \
  -H "X-Modhash: ${MODHASH}" \
  -b "reddit_session=${SESSION}" \
  -d "thing_id=${THING_ID}&text=${COMMENT_TEXT}&api_type=json" \
  "https://old.reddit.com/api/comment" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Reddit API returned HTTP $HTTP_CODE" >&2
  echo "$BODY" | head -3 >&2
  exit 1
fi

# Check for errors in response
ERRORS=$(echo "$BODY" | python3 -c "
import json, sys, re
try:
    d = json.load(sys.stdin)
    errors = d.get('json', {}).get('errors', [])
    if errors:
        for e in errors:
            print(f'ERROR: {e}')
    else:
        data = d.get('json', {}).get('data', {})
        things = data.get('things', [])
        if things:
            thing = things[0].get('data', {})
            comment_id = thing.get('id', '?')
            # Extract permalink from HTML content
            content = thing.get('content', '')
            permalink_match = re.search(r'data-permalink=\"([^\"]+)\"', content)
            permalink = permalink_match.group(1) if permalink_match else ''
            author_match = re.search(r'data-author=\"([^\"]+)\"', content)
            author = author_match.group(1) if author_match else '?'
            print(f'OK: Comment {comment_id} posted as u/{author}')
            if permalink:
                print(f'Link: https://old.reddit.com{permalink}')
        else:
            print('OK: Comment submitted (no details returned)')
except Exception as e:
    print(f'PARSE_ERROR: {e}')
" 2>/dev/null)

echo "$ERRORS"

if echo "$ERRORS" | grep -q "^ERROR:"; then
  exit 1
fi

exit 0
