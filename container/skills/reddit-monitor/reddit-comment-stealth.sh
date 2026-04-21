#!/bin/bash
# reddit-comment-stealth.sh — Post a Reddit comment via headed Chrome (stealth browser).
#
# Drop-in replacement for reddit-comment.sh when genuine browser fingerprint is needed.
# Uses old.reddit.com (plain HTML form, no Shadow DOM — simpler to automate).
#
# Requires: REDDIT_SESSION, REDDIT_PROXY (loaded via: source /workspace/group/.secrets)
#
# Usage:
#   bash reddit-comment-stealth.sh "POST_URL" "COMMENT_TEXT"
#
# POST_URL forms accepted:
#   https://www.reddit.com/r/sub/comments/1sg02ul/title/
#   https://old.reddit.com/r/sub/comments/1sg02ul/title/
#   https://reddit.com/r/sub/comments/1sg02ul/
#   t3_1sg02ul                                         (legacy fullname — resolved to a post URL)
#
# Exit codes:
#   0 = comment verified present on page after submit
#   1 = fatal error (auth, navigation, selectors missing)
#   2 = submit attempted but verification failed (rate limit, silent reject, shadowban)

set -euo pipefail

URL="${1:-}"
TEXT="${2:-}"

if [ -z "$URL" ] || [ -z "$TEXT" ]; then
  echo "Usage: bash reddit-comment-stealth.sh \"POST_URL\" \"COMMENT_TEXT\"" >&2
  exit 1
fi

if [ -z "${REDDIT_SESSION:-}" ]; then
  echo "ERROR: REDDIT_SESSION not set. Run: source /workspace/group/.secrets" >&2
  exit 1
fi

# Normalize URL → old.reddit.com/comments/ID
if [[ "$URL" =~ ^t3_([a-z0-9]+)$ ]]; then
  # Legacy fullname: no subreddit info, but old.reddit.com/comments/ID redirects to the right place
  URL="https://old.reddit.com/comments/${BASH_REMATCH[1]}/"
elif [[ "$URL" =~ reddit\.com ]]; then
  # Rewrite www./new./sh. → old.
  URL=$(echo "$URL" | sed -E 's|https?://(www\.|new\.|sh\.|m\.)?reddit\.com|https://old.reddit.com|')
else
  echo "ERROR: URL must be a reddit.com post URL or t3_ID fullname, got: $URL" >&2
  exit 1
fi

LEN=${#TEXT}
if [ "$LEN" -gt 10000 ]; then
  echo "ERROR: comment text is $LEN chars, Reddit max 10000" >&2
  exit 1
fi

SCREENSHOT_DIR="/tmp/reddit-comment-$(date +%s)"
mkdir -p "$SCREENSHOT_DIR"
echo "Screenshots → $SCREENSHOT_DIR"

cleanup() {
  echo "→ Closing browser"
  stealth-browse close >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Force clean start
stealth-browse close >/dev/null 2>&1 || true
rm -f /tmp/stealth-browser-state.json 2>/dev/null || true

echo "→ Launching headed Chrome"
stealth-browse open about:blank >/dev/null

echo "→ Injecting reddit_session cookie for .reddit.com"
# Cookie must be set for .reddit.com (apex) so old.reddit.com inherits it.
stealth-browse cookies reddit.com "reddit_session=$REDDIT_SESSION" >/dev/null

echo "→ Verifying logged-in state at old.reddit.com"
stealth-browse open https://old.reddit.com/ >/dev/null
sleep 4
stealth-browse screenshot "$SCREENSHOT_DIR/01-home.png" >/dev/null

# old.reddit.com header shows "u/USERNAME" when logged in. Selector: #header-bottom-right span.user a
LOGGED_AS=$(stealth-browse eval '(function(){var e=document.querySelector("#header-bottom-right span.user a");return e?e.innerText:"";})()' 2>&1 | tr -d '"')
if [ -z "$LOGGED_AS" ] || [ "$LOGGED_AS" = "login" ]; then
  echo "ERROR: not logged in. Cookie may be stale or Reddit challenged." >&2
  echo "  Screenshot: $SCREENSHOT_DIR/01-home.png" >&2
  stealth-browse get url >&2
  exit 1
fi
echo "  ✓ Logged in as $LOGGED_AS"

echo "→ Opening target post: $URL"
stealth-browse open "$URL" >/dev/null
sleep 5
stealth-browse screenshot "$SCREENSHOT_DIR/02-post.png" >/dev/null

# Scroll down to bring the comment composer into view (helps mouse movement look natural)
stealth-browse scroll down 800 >/dev/null 2>&1 || true
sleep 1

# The comment textarea on old.reddit.com is under div.commentarea > div.usertext.cloneable > form textarea[name="text"]
# There are often multiple textarea[name="text"] on page (reply forms under existing comments).
# The top-level one is inside .commentarea > .usertext.cloneable (the composer for the OP).
echo "→ Locating top-level comment textarea"
HAS_COMPOSER=$(stealth-browse eval '(function(){var e=document.querySelector(".commentarea > .usertext.cloneable textarea[name=\"text\"]");return e?"yes":"no";})()' 2>&1 | tr -d '"')
if [ "$HAS_COMPOSER" != "yes" ]; then
  echo "ERROR: top-level comment composer not found on page" >&2
  echo "  Possible reasons: post locked, archived, subreddit restricted, account shadowbanned" >&2
  echo "  Screenshot: $SCREENSHOT_DIR/02-post.png" >&2
  exit 1
fi

# Click the textarea to focus (Reddit sometimes lazy-renders the real input on focus)
echo "→ Focusing textarea via click"
stealth-browse eval '(function(){var e=document.querySelector(".commentarea > .usertext.cloneable textarea[name=\"text\"]");e.scrollIntoView({block:"center"});e.focus();return e.getBoundingClientRect().top;})()' >/dev/null
sleep 1

# Snapshot to get the @ref for the focused textarea
SNAPSHOT=$(stealth-browse snapshot)
TA_REF=$(echo "$SNAPSHOT" | grep -E 'textarea.*name="text"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$TA_REF" ]; then
  echo "ERROR: textarea @ref not found in snapshot" >&2
  echo "$SNAPSHOT" | head -40 >&2
  exit 1
fi
echo "  ✓ Textarea ref: $TA_REF"

stealth-browse click "$TA_REF" >/dev/null
sleep 1
echo "→ Typing comment ($LEN chars) with gaussian keystroke dynamics"
stealth-browse type "$TEXT" >/dev/null
sleep 2
stealth-browse screenshot "$SCREENSHOT_DIR/03-typed.png" >/dev/null

# Submit button is inside same form: button.save or button[type="submit"] with text "save"
echo "→ Locating submit button"
SUBMIT_REF=$(echo "$SNAPSHOT" | grep -iE 'button.*(class="save|save.*submit|submit.*save|type="submit")' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$SUBMIT_REF" ]; then
  # Fallback: re-snapshot after typing (composer may have revealed hidden buttons)
  SNAPSHOT=$(stealth-browse snapshot)
  SUBMIT_REF=$(echo "$SNAPSHOT" | grep -E 'button.*"save"' | head -1 | grep -oE '@e[0-9]+' | head -1)
fi
if [ -z "$SUBMIT_REF" ]; then
  echo "→ Falling back to JS submit (no button @ref located)"
  stealth-browse eval '(function(){var f=document.querySelector(".commentarea > .usertext.cloneable form");if(!f)return "no-form";f.querySelector("button[type=\"submit\"], input[type=\"submit\"]").click();return "clicked";})()' >/dev/null
else
  echo "  ✓ Submit ref: $SUBMIT_REF"
  stealth-browse click "$SUBMIT_REF" >/dev/null
fi
sleep 4
stealth-browse screenshot "$SCREENSHOT_DIR/04-after-submit.png" >/dev/null

# Verify: after submit, old.reddit.com inserts the new comment into the thread.
# Check if the first 40 chars of TEXT appear anywhere in the current page.
SIG=$(echo "$TEXT" | tr -cd '[:alnum:] ' | head -c 40)
FOUND=$(stealth-browse eval "(function(){var sig='$(echo "$SIG" | sed "s/'/\\\\'/g")';var bodies=document.querySelectorAll('.commentarea .entry .md p');for(var i=0;i<Math.min(20,bodies.length);i++){var t=bodies[i].innerText.replace(/[^a-zA-Z0-9 ]/g,'');if(t.indexOf(sig)>=0)return 'FOUND';}return 'NOT_FOUND';})()" 2>&1 | tr -d '"')

if [ "$FOUND" = "FOUND" ]; then
  echo ""
  echo "✓ Comment verified on page — submission successful"
  echo "  Screenshots: $SCREENSHOT_DIR"
  exit 0
fi

# Fallback verify: check user profile (most recent comment)
echo "→ Page verify failed, trying u/$LOGGED_AS profile"
stealth-browse open "https://old.reddit.com/user/$LOGGED_AS/comments/" >/dev/null
sleep 3
FOUND2=$(stealth-browse eval "(function(){var sig='$(echo "$SIG" | sed "s/'/\\\\'/g")';var bodies=document.querySelectorAll('.md p');for(var i=0;i<Math.min(10,bodies.length);i++){var t=bodies[i].innerText.replace(/[^a-zA-Z0-9 ]/g,'');if(t.indexOf(sig)>=0)return 'FOUND';}return 'NOT_FOUND';})()" 2>&1 | tr -d '"')

if [ "$FOUND2" = "FOUND" ]; then
  echo "✓ Comment found on u/$LOGGED_AS profile — submission successful"
  exit 0
fi

echo "⚠ Comment not visible on thread or profile — possible silent reject, rate limit, or shadowban"
echo "  Check $SCREENSHOT_DIR/04-after-submit.png"
exit 2
