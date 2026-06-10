#!/bin/bash
# Fetch posts from a Reddit subreddit.
# Usage: bash fetch-posts.sh SUBREDDIT [LIMIT] [SORT]
# SORT: new (default), hot, top, rising
#
# Primary: JSON API via residential proxy (full data: upvotes, comments, selftext)
# Fallback: RSS feed (no proxy needed, but limited data)
#
# Env: REDDIT_PROXY — residential proxy URL (user:pass@host:port)

set -euo pipefail

SUBREDDIT="${1:?Usage: fetch-posts.sh SUBREDDIT [LIMIT] [SORT]}"
LIMIT="${2:-25}"
SORT="${3:-new}"

# ---- JSON via proxy (preferred) ----
PROXY="${REDDIT_PROXY:-}"
if [ -n "$PROXY" ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    --proxy "http://${PROXY}" \
    --max-time 15 \
    -H "User-Agent: NanoClaw/1.0 (research tool)" \
    -H "Accept: application/json" \
    "https://www.reddit.com/r/${SUBREDDIT}/${SORT}.json?limit=${LIMIT}&raw_json=1" 2>/dev/null || echo -e "\n000")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    # Check it's actually JSON (not anti-bot HTML)
    if echo "$BODY" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
      echo "$BODY" | python3 -c "
import json, sys
from datetime import datetime, timezone

data = json.load(sys.stdin)
children = data.get('data', {}).get('children', [])
if not children:
    print('No posts found in r/${SUBREDDIT}')
    sys.exit(0)

for child in children:
    d = child.get('data', {})
    if d.get('removed_by_category'):
        continue
    title = d.get('title', 'No title')
    author = d.get('author', 'unknown')
    ups = d.get('ups', 0)
    comments = d.get('num_comments', 0)
    permalink = d.get('permalink', '')
    selftext = (d.get('selftext', '') or '')[:300]
    created = d.get('created_utc', 0)
    flair = d.get('link_flair_text', '') or ''
    is_self = d.get('is_self', False)

    dt = datetime.fromtimestamp(created, tz=timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    url = f'https://reddit.com{permalink}' if permalink else ''
    post_type = 'self' if is_self else 'link'

    print(f'[{ups} up, {comments} comments, {post_type}] {title}')
    print(f'by u/{author} | {dt}' + (f' | flair: {flair}' if flair else ''))
    print(url)
    if selftext.strip():
        print(f'Preview: {selftext}')
    print()
"
      exit 0
    else
      echo "WARNING: Reddit returned non-JSON via proxy, falling back to RSS" >&2
    fi
  else
    echo "WARNING: Reddit JSON returned HTTP $HTTP_CODE via proxy, falling back to RSS" >&2
  fi
fi

# ---- RSS fallback (no proxy needed) ----
RESPONSE=$(curl -s -w "\n%{http_code}" \
  --max-time 15 \
  -H "User-Agent: NanoClaw/1.0" \
  "https://www.reddit.com/r/${SUBREDDIT}/${SORT}.rss?limit=${LIMIT}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Reddit RSS returned HTTP $HTTP_CODE for r/$SUBREDDIT" >&2
  exit 1
fi

python3 -c "
import xml.etree.ElementTree as ET
import sys, html, re

feed = sys.argv[1]
root = ET.fromstring(feed)
ns = {'atom': 'http://www.w3.org/2005/Atom'}

entries = root.findall('atom:entry', ns)
if not entries:
    print('No posts found in r/${SUBREDDIT}')
    sys.exit(0)

for entry in entries:
    title = entry.find('atom:title', ns)
    author = entry.find('atom:author/atom:name', ns)
    link = entry.find('atom:link', ns)
    published = entry.find('atom:published', ns)

    title_text = title.text if title is not None else 'No title'
    author_text = author.text if author is not None else 'unknown'
    link_href = link.get('href', '') if link is not None else ''
    pub_text = published.text if published is not None else 'unknown'

    # Extract selftext from HTML content
    content = entry.find('atom:content', ns)
    preview = ''
    if content is not None and content.text:
        clean = re.sub(r'<[^>]+>', ' ', html.unescape(content.text))
        clean = re.sub(r'\s+', ' ', clean).strip()
        clean = re.sub(r'submitted by\s+/u/\S+', '', clean)
        clean = re.sub(r'\[link\]|\[comments\]', '', clean)
        clean = clean.strip()
        if clean and len(clean) > 20:
            preview = clean[:300]

    print(f'[RSS] {title_text}')
    print(f'by {author_text} | {pub_text}')
    print(f'{link_href}')
    if preview:
        print(f'Preview: {preview}')
    print()
" "$BODY"
