#!/bin/bash
# Reddit login setup — configures proxy and loads/checks saved state.
# The actual login form interaction is done by the AGENT (LLM),
# not by this script — Reddit's React UI needs adaptive navigation.
#
# Usage: source .secrets && source reddit-login.sh
# (source, not bash — sets env vars for agent-browser)
#
# After sourcing, the agent should:
#   1. agent-browser open "https://www.reddit.com/login/"
#   2. agent-browser wait 5000
#   3. agent-browser snapshot -i
#   4. Use refs from snapshot to fill username/password and submit

STATE_FILE="/workspace/group/reddit-auth.json"

# Configure proxy for browser
if [ -n "${REDDIT_PROXY:-}" ]; then
  export AGENT_BROWSER_PROXY="http://${REDDIT_PROXY}"
fi

export AGENT_BROWSER_DEFAULT_TIMEOUT=30000
export AGENT_BROWSER_USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Load saved state if available
if [ -f "$STATE_FILE" ]; then
  echo "STATE_EXISTS=true"
  echo "Loading saved browser state from $STATE_FILE"
  agent-browser state load "$STATE_FILE" 2>/dev/null || true
else
  echo "STATE_EXISTS=false"
  echo "No saved state. Agent must log in interactively."
fi
