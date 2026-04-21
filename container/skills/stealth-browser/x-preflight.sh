#!/bin/bash
# x-preflight.sh — Health check before X reply attempts.
#
# Verifies: proxy connectivity, X cookie auth, logged-in state.
# Run this BEFORE x-reply.sh. If it fails, do NOT attempt reply.
#
# Exit codes:
#   0 — all checks passed, safe to reply
#   1 — proxy failure (network/connectivity)
#   2 — cookie/auth failure (login redirect or challenge)
#   3 — unknown failure (check screenshot)
#
# Usage:
#   bash x-preflight.sh
#
# Requires: X_CT0, X_AUTH_TOKEN, REDDIT_PROXY or STEALTH_PROXY in env.

set -euo pipefail

if [ -z "${X_CT0:-}" ] || [ -z "${X_AUTH_TOKEN:-}" ]; then
  echo "PREFLIGHT FAIL: X_CT0 and X_AUTH_TOKEN must be set." >&2
  echo "Run: source /workspace/group/.secrets" >&2
  exit 1
fi

PROXY="${STEALTH_PROXY:-${REDDIT_PROXY:-}}"
if [ -z "$PROXY" ]; then
  echo "PREFLIGHT FAIL: No proxy configured (STEALTH_PROXY or REDDIT_PROXY)." >&2
  echo "Proxy is MANDATORY for X browsing." >&2
  exit 1
fi

SCREENSHOT_DIR="/tmp/x-preflight-$(date +%s)"
mkdir -p "$SCREENSHOT_DIR"

cleanup() {
  stealth-browse close >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Kill any lingering browser
stealth-browse close >/dev/null 2>&1 || true
rm -f /tmp/stealth-browser-state.json 2>/dev/null || true

echo "=== X Preflight Check ==="

# Step 1: Launch browser and check proxy with httpbin
echo "[1/3] Proxy check..."
stealth-browse open about:blank >/dev/null 2>&1
stealth-browse open https://httpbin.org/ip >/dev/null 2>&1
sleep 3
PROXY_URL=$(stealth-browse get url 2>&1)
if echo "$PROXY_URL" | grep -q "chrome-error\|ERR_"; then
  echo "PREFLIGHT FAIL: Proxy not reachable ($PROXY_URL)" >&2
  echo "Proxy host: $(echo "$PROXY" | sed 's/.*@//')" >&2
  stealth-browse screenshot "$SCREENSHOT_DIR/proxy-fail.png" >/dev/null 2>&1 || true
  exit 1
fi
PROXY_IP=$(stealth-browse eval "document.body.innerText" 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
echo "  OK — residential IP: ${PROXY_IP:-unknown}"

# Step 2: Set cookies
echo "[2/3] Cookie injection..."
stealth-browse cookies x.com "auth_token=$X_AUTH_TOKEN" "ct0=$X_CT0" >/dev/null 2>&1
echo "  OK — auth_token: ${#X_AUTH_TOKEN} chars, ct0: ${#X_CT0} chars"

# Step 3: Navigate to x.com and check login
echo "[3/3] Login check..."
stealth-browse open https://x.com/home >/dev/null 2>&1
sleep 5
stealth-browse screenshot "$SCREENSHOT_DIR/home.png" >/dev/null 2>&1 || true
CURRENT_URL=$(stealth-browse get url 2>&1)
LOGGED_IN=$(stealth-browse eval '!!document.querySelector("[data-testid=\"SideNav_NewTweet_Button\"]")' 2>&1)

if [ "$LOGGED_IN" = "true" ]; then
  echo "  OK — logged in at $CURRENT_URL"
  echo ""
  echo "=== PREFLIGHT PASSED — safe to reply ==="
  exit 0
fi

# Login failed — diagnose
stealth-browse screenshot "$SCREENSHOT_DIR/login-fail.png" >/dev/null 2>&1 || true
if echo "$CURRENT_URL" | grep -q "chrome-error\|ERR_"; then
  echo "PREFLIGHT FAIL: Network error after proxy connected ($CURRENT_URL)" >&2
  echo "  Screenshot: $SCREENSHOT_DIR/login-fail.png" >&2
  exit 1
elif echo "$CURRENT_URL" | grep -q "login\|flow"; then
  echo "PREFLIGHT FAIL: Cookie auth failed — redirected to login ($CURRENT_URL)" >&2
  echo "  Cookies may be stale. Regenerate X_AUTH_TOKEN and X_CT0." >&2
  echo "  Screenshot: $SCREENSHOT_DIR/login-fail.png" >&2
  exit 2
else
  echo "PREFLIGHT FAIL: Unknown — not logged in at $CURRENT_URL" >&2
  echo "  Screenshot: $SCREENSHOT_DIR/login-fail.png" >&2
  exit 3
fi
