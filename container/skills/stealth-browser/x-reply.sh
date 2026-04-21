#!/bin/bash
# x-reply.sh — Reply to an X (Twitter) tweet via headed Chrome with cookie auth.
#
# Requires X_CT0 + X_AUTH_TOKEN env vars (run: source /workspace/group/.secrets first).
#
# Uses data-testid selectors so it's language-independent (works on HU/EN/etc accounts).
#
# Usage:
#   bash x-reply.sh <tweet_url> "reply text"
#
# Example:
#   bash x-reply.sh https://x.com/jack/status/123456 "great point, thanks for sharing"

set -euo pipefail

URL="${1:-}"
TEXT="${2:-}"

if [ -z "$URL" ] || [ -z "$TEXT" ]; then
  echo "Usage: bash x-reply.sh <tweet_url> \"reply text\"" >&2
  exit 1
fi

if [ -z "${X_CT0:-}" ] || [ -z "${X_AUTH_TOKEN:-}" ]; then
  echo "ERROR: X_CT0 and X_AUTH_TOKEN must be set. Run: source /workspace/group/.secrets" >&2
  exit 1
fi

LEN=${#TEXT}
if [ "$LEN" -gt 280 ]; then
  echo "ERROR: reply text is $LEN chars, max 280" >&2
  exit 1
fi

SCREENSHOT_DIR="/tmp/x-reply-$(date +%s)"
mkdir -p "$SCREENSHOT_DIR"
echo "Screenshots → $SCREENSHOT_DIR"

cleanup() {
  echo "→ Closing browser"
  stealth-browse close >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Force a clean start — kill any lingering browser state from previous runs
stealth-browse close >/dev/null 2>&1 || true
rm -f /tmp/stealth-browser-state.json 2>/dev/null || true

echo "→ Verifying X cookies are non-empty..."
if [ ${#X_AUTH_TOKEN} -lt 20 ] || [ ${#X_CT0} -lt 20 ]; then
  echo "ERROR: X_AUTH_TOKEN or X_CT0 looks too short — source /workspace/group/.secrets first" >&2
  exit 1
fi
echo "  auth_token: ${#X_AUTH_TOKEN} chars, ct0: ${#X_CT0} chars"

echo "→ Launching fresh headed Chrome and injecting X cookies..."
stealth-browse open about:blank >/dev/null
stealth-browse cookies x.com "auth_token=$X_AUTH_TOKEN" "ct0=$X_CT0" >/dev/null

echo "→ Verifying logged-in state at x.com/home..."
stealth-browse open https://x.com/home >/dev/null
sleep 4
stealth-browse screenshot "$SCREENSHOT_DIR/01-home.png" >/dev/null
LOGGED_IN=$(stealth-browse eval '!!document.querySelector("[data-testid=\"SideNav_NewTweet_Button\"]")')
if [ "$LOGGED_IN" != "true" ]; then
  CURRENT_URL=$(stealth-browse get url 2>&1)
  TITLE=$(stealth-browse get title 2>&1)
  echo "ERROR: not logged in. Diagnostics:" >&2
  echo "  URL: $CURRENT_URL" >&2
  echo "  Title: $TITLE" >&2
  echo "  Screenshot: $SCREENSHOT_DIR/01-home.png" >&2
  if echo "$CURRENT_URL" | grep -q "chrome-error\|ERR_"; then
    echo "  CAUSE: Network/proxy error — Chrome cannot reach x.com. Check REDDIT_PROXY / STEALTH_PROXY." >&2
  elif echo "$CURRENT_URL" | grep -q "login\|flow"; then
    echo "  CAUSE: Login redirect — cookies may be stale or X detected automation." >&2
  else
    echo "  CAUSE: Unknown — check screenshot. Possible: challenge page, JS error, or slow load." >&2
  fi
  exit 1
fi
echo "  ✓ Logged in"

echo "→ Opening target tweet: $URL"
stealth-browse open "$URL" >/dev/null
sleep 4
stealth-browse screenshot "$SCREENSHOT_DIR/02-tweet.png" >/dev/null

# Find the reply button on the focal tweet — testid="reply"
echo "→ Looking for Reply button..."
SNAPSHOT=$(stealth-browse snapshot)
REPLY_REF=$(echo "$SNAPSHOT" | grep 'testid="reply"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$REPLY_REF" ]; then
  echo "ERROR: Reply button not found in snapshot" >&2
  echo "$SNAPSHOT" | head -40 >&2
  exit 1
fi
echo "  ✓ Found reply ref: $REPLY_REF"
stealth-browse click "$REPLY_REF" >/dev/null
sleep 2
stealth-browse screenshot "$SCREENSHOT_DIR/03-reply-modal.png" >/dev/null

# In the reply modal, find textarea testid="tweetTextarea_0"
echo "→ Finding reply textarea..."
SNAPSHOT=$(stealth-browse snapshot)
TEXTAREA_REF=$(echo "$SNAPSHOT" | grep 'testid="tweetTextarea_0"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$TEXTAREA_REF" ]; then
  echo "ERROR: tweetTextarea_0 not found" >&2
  echo "$SNAPSHOT" | head -40 >&2
  exit 1
fi
echo "  ✓ Found textarea ref: $TEXTAREA_REF"

stealth-browse click "$TEXTAREA_REF" >/dev/null
sleep 1
echo "→ Typing reply text..."
stealth-browse type "$TEXT" >/dev/null
sleep 2
stealth-browse screenshot "$SCREENSHOT_DIR/04-typed.png" >/dev/null

# Submit button: testid="tweetButton" (in modal) or "tweetButtonInline"
echo "→ Finding submit button..."
SNAPSHOT=$(stealth-browse snapshot)
POST_REF=$(echo "$SNAPSHOT" | grep -E 'testid="tweetButton"|testid="tweetButtonInline"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$POST_REF" ]; then
  echo "ERROR: submit button (tweetButton/tweetButtonInline) not found" >&2
  echo "$SNAPSHOT" | head -40 >&2
  exit 1
fi
echo "  ✓ Found submit ref: $POST_REF"

stealth-browse click "$POST_REF" >/dev/null
sleep 4
stealth-browse screenshot "$SCREENSHOT_DIR/05-after-submit.png" >/dev/null

# Verify by checking if the reply shows up in the user's own timeline.
# Cannot rely on "modal closed" heuristic because tweetTextarea_0 also exists
# in the inline reply box below the focal tweet (false positive).
echo "→ Verifying reply landed on @krip_tom profile..."
stealth-browse open https://x.com/krip_tom/with_replies >/dev/null
sleep 3
# Sanitize signature to alphanumerics + spaces only (no escape headaches)
SIG=$(echo "$TEXT" | tr -cd '[:alnum:] ' | head -c 30)
FOUND=$(stealth-browse eval "(function(){var sig='$SIG';var arts=document.querySelectorAll('article');for(var i=0;i<Math.min(5,arts.length);i++){var t=arts[i].querySelector('[data-testid=\"tweetText\"]');if(t){var clean=t.innerText.replace(/[^a-zA-Z0-9 ]/g,'');if(clean.indexOf(sig)>=0)return 'FOUND';}}return 'NOT_FOUND';})()")

if [ "$FOUND" = "FOUND" ]; then
  echo ""
  echo "✓ Reply verified on @krip_tom/with_replies — submission successful"
  echo "  Screenshots: $SCREENSHOT_DIR"
else
  echo "⚠ Reply not visible on @krip_tom/with_replies yet — may be delayed, rate-limited, or silently rejected"
  echo "  Check $SCREENSHOT_DIR/05-after-submit.png manually"
  exit 2
fi
