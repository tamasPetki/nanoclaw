#!/bin/bash
# x-notifications.sh — Check X (Twitter) mentions via headed Chrome with cookie auth.
#
# Opens a fresh browser, injects cookies, navigates to x.com/home,
# then clicks the notification bell + Mentions tab (instead of direct URL navigation,
# which X redirects to login).
#
# Outputs: page text content of the mentions tab (interactive elements + text).
#
# Exit codes:
#   0 — mentions loaded successfully
#   1 — setup/auth failure
#   2 — navigation failure (couldn't find bell or tab)
#
# Usage:
#   bash x-notifications.sh
#
# Requires: X_CT0, X_AUTH_TOKEN, REDDIT_PROXY or STEALTH_PROXY in env.

set -euo pipefail

if [ -z "${X_CT0:-}" ] || [ -z "${X_AUTH_TOKEN:-}" ]; then
  echo "ERROR: X_CT0 and X_AUTH_TOKEN must be set. Run: source /workspace/agent/.secrets" >&2
  exit 1
fi

PROXY="${STEALTH_PROXY:-${REDDIT_PROXY:-}}"
if [ -z "$PROXY" ]; then
  echo "ERROR: No proxy configured (STEALTH_PROXY or REDDIT_PROXY)." >&2
  exit 1
fi

SCREENSHOT_DIR="/tmp/x-notifications-$(date +%s)"
mkdir -p "$SCREENSHOT_DIR"
echo "Screenshots → $SCREENSHOT_DIR"

cleanup() {
  stealth-browse close >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Force clean start
stealth-browse close >/dev/null 2>&1 || true
rm -f /tmp/stealth-browser-state.json 2>/dev/null || true

echo "→ Launching browser and injecting cookies..."
stealth-browse open about:blank >/dev/null
stealth-browse cookies x.com "auth_token=$X_AUTH_TOKEN" "ct0=$X_CT0" >/dev/null

echo "→ Navigating to x.com/home..."
stealth-browse open https://x.com/home >/dev/null
sleep 5
stealth-browse screenshot "$SCREENSHOT_DIR/01-home.png" >/dev/null

LOGGED_IN=$(stealth-browse eval '!!document.querySelector("[data-testid=\"SideNav_NewTweet_Button\"]")' 2>&1)
if [ "$LOGGED_IN" != "true" ]; then
  CURRENT_URL=$(stealth-browse get url 2>&1)
  echo "ERROR: not logged in at $CURRENT_URL" >&2
  echo "  Screenshot: $SCREENSHOT_DIR/01-home.png" >&2
  exit 1
fi
echo "  ✓ Logged in"

echo "→ Clicking notification bell in sidebar..."
SNAPSHOT=$(stealth-browse snapshot)
# The notification bell has aria-label "Notifications" or data-testid="AppTabBar_Notifications_Link"
BELL_REF=$(echo "$SNAPSHOT" | grep -iE 'testid="AppTabBar_Notifications_Link"|aria="Notifications"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$BELL_REF" ]; then
  # Fallback: try href="/notifications"
  BELL_REF=$(echo "$SNAPSHOT" | grep 'href.*=/notifications' | head -1 | grep -oE '@e[0-9]+' | head -1)
fi
if [ -z "$BELL_REF" ]; then
  echo "ERROR: Notification bell not found in sidebar" >&2
  echo "$SNAPSHOT" | head -40 >&2
  echo "  Screenshot: $SCREENSHOT_DIR/01-home.png" >&2
  exit 2
fi
echo "  ✓ Found bell ref: $BELL_REF"
stealth-browse click "$BELL_REF" >/dev/null
sleep 3
stealth-browse screenshot "$SCREENSHOT_DIR/02-notifications.png" >/dev/null

echo "→ Switching to Mentions tab..."
SNAPSHOT=$(stealth-browse snapshot)
# Mentions tab: look for text "Mentions" in tab-like elements
MENTIONS_REF=$(echo "$SNAPSHOT" | grep -iE '"Mentions"' | head -1 | grep -oE '@e[0-9]+' | head -1)
if [ -z "$MENTIONS_REF" ]; then
  # Fallback: try aria-label or a link with /mentions
  MENTIONS_REF=$(echo "$SNAPSHOT" | grep -iE 'aria="Mentions"|href.*/mentions' | head -1 | grep -oE '@e[0-9]+' | head -1)
fi
if [ -z "$MENTIONS_REF" ]; then
  echo "⚠ Mentions tab not found — may already be on mentions, or UI changed" >&2
  echo "  Continuing with current view..." >&2
  stealth-browse screenshot "$SCREENSHOT_DIR/02b-no-mentions-tab.png" >/dev/null
else
  echo "  ✓ Found mentions tab ref: $MENTIONS_REF"
  stealth-browse click "$MENTIONS_REF" >/dev/null
  sleep 3
fi
stealth-browse screenshot "$SCREENSHOT_DIR/03-mentions.png" >/dev/null

CURRENT_URL=$(stealth-browse get url 2>&1)
echo "  Current URL: $CURRENT_URL"

echo ""
echo "=== Mentions page content ==="
stealth-browse get text >/dev/null 2>&1
# Output the page text for the agent to parse
PAGE_TEXT=$(stealth-browse eval '(function(){var articles=document.querySelectorAll("article");var out=[];for(var i=0;i<Math.min(20,articles.length);i++){var name=articles[i].querySelector("[data-testid=\"User-Name\"]");var text=articles[i].querySelector("[data-testid=\"tweetText\"]");var time=articles[i].querySelector("time");out.push((name?name.innerText.replace(/\\n/g," "):"")+"|"+(time?time.getAttribute("datetime"):"")+"|"+(text?text.innerText:""));}return out.join("\\n---\\n");})()' 2>&1)

if [ -z "$PAGE_TEXT" ] || [ "$PAGE_TEXT" = "undefined" ]; then
  echo "(No mentions found or page empty)"
  echo "Check screenshot: $SCREENSHOT_DIR/03-mentions.png"
else
  echo "$PAGE_TEXT"
fi

echo ""
echo "Screenshots: $SCREENSHOT_DIR"
echo "✓ Notification check complete"
