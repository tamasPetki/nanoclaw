#!/bin/bash
# Score and filter Reddit posts by relevance to a query.
# Usage: search-reddit.sh "QUERY" | score-posts.sh "QUERY" [THRESHOLD]
#   Reads search-reddit.sh output from stdin
#   Scores each post using relevance.py token_overlap_relevance()
#   Filters by threshold (default 0.20) and sorts by score descending
#
# Output: [score: 0.72] [15 up, 8 comments] Title — r/subreddit — URL

set -euo pipefail

QUERY="${1:?Usage: score-posts.sh \"QUERY\" [THRESHOLD]}"
THRESHOLD="${2:-0.20}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read all stdin, parse posts, score with relevance.py
python3 -c "
import sys, re, os
sys.path.insert(0, '${SCRIPT_DIR}')
from relevance import token_overlap_relevance

query = '''${QUERY}'''
threshold = float('${THRESHOLD}')

# Parse search-reddit.sh output (blocks separated by blank lines)
content = sys.stdin.read()
blocks = content.strip().split('\n\n')
scored = []

for block in blocks:
    lines = block.strip().split('\n')
    if not lines or len(lines) < 2:
        continue

    header = lines[0]
    meta = lines[1] if len(lines) > 1 else ''
    url = lines[2] if len(lines) > 2 else ''
    preview_lines = [l for l in lines[3:] if l.startswith('Preview:')]
    preview = preview_lines[0][9:] if preview_lines else ''

    # Extract subreddit from meta line
    sub_match = re.search(r'r/(\S+)', meta)
    subreddit = sub_match.group(0) if sub_match else ''

    # Score: title + preview text
    text = header + ' ' + preview
    score = token_overlap_relevance(query, text)

    if score >= threshold:
        scored.append((score, header, subreddit, url, meta, preview))

# Sort by score descending
scored.sort(key=lambda x: -x[0])

if not scored:
    print(f'No posts above threshold ({threshold}) for query: {query}')
    sys.exit(0)

for score, header, subreddit, url, meta, preview in scored:
    # Extract engagement from header like [15 up, 8 comments, self]
    eng_match = re.match(r'\[([^\]]+)\]', header)
    engagement = eng_match.group(1) if eng_match else ''
    title = re.sub(r'^\[[^\]]+\]\s*', '', header)

    print(f'[score: {score:.2f}] [{engagement}] {title} — {subreddit}')
    print(f'  {url}')
    if preview:
        print(f'  {preview[:150]}')
    print()
"
