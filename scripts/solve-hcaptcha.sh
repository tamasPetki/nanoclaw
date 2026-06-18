#!/usr/bin/env bash
# CapSolver hCaptcha solver — proxy-aware (HCaptchaTask)
#
# Usage:
#   solve-hcaptcha.sh <websiteURL> <websiteKey> <proxy-spec>
# Where proxy-spec = "user:pass@host:port" (DataImpulse format)
#
# Outputs solved token on stdout, or empty + non-zero exit on failure.
# Reads CAPSOLVER_API_KEY from env.

set -euo pipefail

WEBSITE_URL="${1:?websiteURL required}"
WEBSITE_KEY="${2:?websiteKey required}"
PROXY_SPEC="${3:?proxy spec required (user:pass@host:port)}"

: "${CAPSOLVER_API_KEY:?CAPSOLVER_API_KEY env not set}"

# Parse user:pass@host:port → individual fields for CapSolver schema
PROXY_USERPASS="${PROXY_SPEC%@*}"
PROXY_HOSTPORT="${PROXY_SPEC#*@}"
PROXY_USER="${PROXY_USERPASS%:*}"
PROXY_PASS="${PROXY_USERPASS#*:}"
PROXY_HOST="${PROXY_HOSTPORT%:*}"
PROXY_PORT="${PROXY_HOSTPORT#*:}"

create_payload=$(jq -n \
  --arg key   "$CAPSOLVER_API_KEY" \
  --arg url   "$WEBSITE_URL" \
  --arg sk    "$WEBSITE_KEY" \
  --arg phost "$PROXY_HOST" \
  --argjson pport "$PROXY_PORT" \
  --arg puser "$PROXY_USER" \
  --arg ppass "$PROXY_PASS" \
  '{
    clientKey: $key,
    task: {
      type: "HCaptchaTask",
      websiteURL: $url,
      websiteKey: $sk,
      proxyType: "http",
      proxyAddress: $phost,
      proxyPort: $pport,
      proxyLogin: $puser,
      proxyPassword: $ppass
    }
  }')

create_resp=$(curl -sS --max-time 30 -X POST "https://api.capsolver.com/createTask" \
  -H "Content-Type: application/json" \
  -d "$create_payload")

err_id=$(echo "$create_resp" | jq -r '.errorId // 0')
if [[ "$err_id" != "0" ]]; then
  echo >&2 "createTask failed: $create_resp"
  exit 1
fi
TASK_ID=$(echo "$create_resp" | jq -r '.taskId')
echo >&2 "Task created: $TASK_ID  (polling for result, max 120s)"

deadline=$(( $(date +%s) + 120 ))
while (( $(date +%s) < deadline )); do
  sleep 4
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
      cost=$(echo "$result" | jq -r '.solution.userAgent // empty' >/dev/null; echo "$result" | jq -r '.cost // ""')
      echo >&2 "✓ solved (cost: $cost USD)"
      echo "$token"
      exit 0
      ;;
    processing)
      echo >&2 "  ...processing"
      ;;
    *)
      echo >&2 "  unknown status: $status"
      ;;
  esac
done
echo >&2 "TIMEOUT — no result in 120s"
exit 3
