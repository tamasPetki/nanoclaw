#!/usr/bin/env bash
# CapSolver reCAPTCHA Enterprise solver (proxy-aware)
#
# Usage:
#   solve-recaptcha-enterprise.sh <websiteURL> <websiteKey> <proxy-spec> [pageAction]
# Where proxy-spec = "user:pass@host:port"
# pageAction = optional, e.g. "submit", "register" (some Enterprise sites enforce)
#
# Reads CAPSOLVER_API_KEY from env. Outputs token on stdout.

set -euo pipefail

WEBSITE_URL="${1:?websiteURL required}"
WEBSITE_KEY="${2:?websiteKey required}"
PROXY_SPEC="${3:?proxy spec required (user:pass@host:port)}"
PAGE_ACTION="${4:-}"

: "${CAPSOLVER_API_KEY:?CAPSOLVER_API_KEY env not set}"

PROXY_USERPASS="${PROXY_SPEC%@*}"
PROXY_HOSTPORT="${PROXY_SPEC#*@}"
PROXY_USER="${PROXY_USERPASS%:*}"
PROXY_PASS="${PROXY_USERPASS#*:}"
PROXY_HOST="${PROXY_HOSTPORT%:*}"
PROXY_PORT="${PROXY_HOSTPORT#*:}"

if [[ -n "$PAGE_ACTION" ]]; then
  task_extra=$(jq -n --arg a "$PAGE_ACTION" '{pageAction: $a}')
else
  task_extra='{}'
fi

create_payload=$(jq -n \
  --arg key   "$CAPSOLVER_API_KEY" \
  --arg url   "$WEBSITE_URL" \
  --arg sk    "$WEBSITE_KEY" \
  --arg phost "$PROXY_HOST" \
  --argjson pport "$PROXY_PORT" \
  --arg puser "$PROXY_USER" \
  --arg ppass "$PROXY_PASS" \
  --argjson extra "$task_extra" \
  '{
    clientKey: $key,
    task: ({
      type: "ReCaptchaV2EnterpriseTask",
      websiteURL: $url,
      websiteKey: $sk,
      isInvisible: true,
      proxyType: "http",
      proxyAddress: $phost,
      proxyPort: $pport,
      proxyLogin: $puser,
      proxyPassword: $ppass
    } + $extra)
  }')

create_resp=$(curl -sS --max-time 30 -X POST "https://api.capsolver.com/createTask" \
  -H "Content-Type: application/json" \
  -d "$create_payload")

err_id=$(echo "$create_resp" | jq -r '.errorId // 0')
if [[ "$err_id" != "0" ]]; then
  echo >&2 "createTask failed: $create_resp"; exit 1
fi
TASK_ID=$(echo "$create_resp" | jq -r '.taskId')
echo >&2 "Task: $TASK_ID  (polling, max 180s)"

deadline=$(( $(date +%s) + 180 ))
while (( $(date +%s) < deadline )); do
  sleep 5
  result=$(curl -sS --max-time 15 -X POST "https://api.capsolver.com/getTaskResult" \
    -H "Content-Type: application/json" \
    -d "{\"clientKey\":\"$CAPSOLVER_API_KEY\",\"taskId\":\"$TASK_ID\"}")
  status=$(echo "$result" | jq -r '.status // ""')
  err=$(echo "$result" | jq -r '.errorId // 0')
  if [[ "$err" != "0" ]]; then
    echo >&2 "task error: $result"; exit 2
  fi
  case "$status" in
    ready)
      token=$(echo "$result" | jq -r '.solution.gRecaptchaResponse')
      cost=$(echo "$result" | jq -r '.cost // ""')
      echo >&2 "✓ solved (cost: $cost USD)"
      echo "$token"
      exit 0
      ;;
    processing) echo >&2 "  ...processing" ;;
    *)          echo >&2 "  status: $status" ;;
  esac
done
echo >&2 "TIMEOUT 180s"
exit 3
