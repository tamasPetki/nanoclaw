#!/bin/bash
# Fetch tweets from an X/Twitter list via GraphQL API.
# Usage: source /workspace/group/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh LIST_ID [COUNT]
#
# Reads QUERY_ID from SKILL.md automatically — never hardcode it elsewhere.
# Requires X_CT0 and X_AUTH_TOKEN env vars (source .secrets first).

set -euo pipefail

LIST_ID="${1:?Usage: fetch-list.sh LIST_ID [COUNT]}"
COUNT="${2:-20}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_FILE="$SCRIPT_DIR/SKILL.md"

# Extract QUERY_ID from SKILL.md — single source of truth
QUERY_ID=$(grep -oP 'QUERY_ID="\K[^"]+' "$SKILL_FILE")
if [ -z "$QUERY_ID" ]; then
  echo "ERROR: Could not extract QUERY_ID from $SKILL_FILE" >&2
  exit 1
fi

# Verify credentials
if [ -z "${X_CT0:-}" ] || [ -z "${X_AUTH_TOKEN:-}" ]; then
  echo "ERROR: X_CT0 and X_AUTH_TOKEN must be set. Run: source /workspace/group/.secrets" >&2
  exit 1
fi

VARS="{\"listId\":\"${LIST_ID}\",\"count\":${COUNT}}"
FEATURES='{"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"creator_subscriptions_tweet_preview_api_enabled":true,"freedom_of_speech_not_reach_fetch_enabled":true,"tweetypie_unmention_optimization_enabled":true,"longform_notetweets_consumption_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false,"responsive_web_media_download_video_enabled":false,"articles_preview_enabled":true}'

ENCODED_VARS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$VARS")
ENCODED_FEATURES=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$FEATURES")

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Cookie: auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}" \
  -H "x-csrf-token: ${X_CT0}" \
  -H "authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA" \
  "https://x.com/i/api/graphql/${QUERY_ID}/ListLatestTweetsTimeline?variables=${ENCODED_VARS}&features=${ENCODED_FEATURES}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
  # Retry once after 5 seconds (transient auth errors)
  sleep 5
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: auth_token=${X_AUTH_TOKEN}; ct0=${X_CT0}" \
    -H "x-csrf-token: ${X_CT0}" \
    -H "authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA" \
    "https://x.com/i/api/graphql/${QUERY_ID}/ListLatestTweetsTimeline?variables=${ENCODED_VARS}&features=${ENCODED_FEATURES}")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')
fi

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: X API returned HTTP $HTTP_CODE" >&2
  echo "$BODY" >&2
  exit 1
fi

# Parse and output tweets with engagement data
echo "$BODY" | jq -r '
  [.data.list.tweets_timeline.timeline.instructions[].entries[]
   | .content.itemContent.tweet_results.result // empty
   | {
       user: .core.user_results.result.core.screen_name,
       name: .core.user_results.result.legacy.name,
       text: .legacy.full_text,
       date: .legacy.created_at,
       id: .rest_id,
       likes: .legacy.favorite_count,
       retweets: .legacy.retweet_count,
       replies: .legacy.reply_count
     }
  ] | sort_by(.likes) | reverse | .[:20][] |
  "@\(.user) (\(.name)) — \(.likes) likes, \(.retweets) RTs\n\(.text)\nhttps://x.com/\(.user)/status/\(.id)\n"'
