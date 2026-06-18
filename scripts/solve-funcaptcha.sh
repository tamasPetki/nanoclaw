#!/usr/bin/env bash
# CapSolver Arkose Labs / FunCaptcha solver (proxy-aware).
#
# Usage:
#   solve-funcaptcha.sh <websiteURL> <websitePublicKey> <proxy-spec>
# Where proxy-spec = "user:pass@host:port" (DataImpulse format)
#
# Reads CAPSOLVER_API_KEY from env. Outputs token on stdout (format: f.<base64>).

set -euo pipefail

WEBSITE_URL="${1:?websiteURL required}"
PUBLIC_KEY="${2:?websitePublicKey required}"
PROXY_SPEC="${3:?proxy spec required (user:pass@host:port)}"

: "${CAPSOLVER_API_KEY:?CAPSOLVER_API_KEY env not set}"

PROXY_USERPASS="${PROXY_SPEC%@*}"
PROXY_HOSTPORT="${PROXY_SPEC#*@}"
PROXY_USER="${PROXY_USERPASS%:*}"
PROXY_PASS="${PROXY_USERPASS#*:}"
PROXY_HOST="${PROXY_HOSTPORT%:*}"
PROXY_PORT="${PROXY_HOSTPORT#*:}"

create_payload=$(jq -n \
  --arg key   "$CAPSOLVER_API_KEY" \
  --arg url   "$WEBSITE_URL" \
  --arg pk    "$PUBLIC_KEY" \
  --arg phost "$PROXY_HOST" \
  --argjson pport "$PROXY_PORT" \
  --arg puser "$PROXY_USER" \
  --arg ppass "$PROXY_PASS" \
  '{
    clientKey: $key,
    task: {
      type: "FunCaptchaTask",
      websiteURL: $url,
      websitePublicKey: $pk,
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
  echo >&2 "createTask failed: $create_resp"; exit 1
fi
TASK_ID=$(echo "$create_resp" | jq -r '.taskId')
echo >&2 "Task: $TASK_ID  (polling, max 240s — FunCaptcha takes longer)"

deadline=$(( $(date +%s) + 240 ))
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
      token=$(echo "$result" | jq -r '.solution.token')
      cost=$(echo "$result" | jq -r '.cost // ""')
      echo >&2 "✓ solved (cost: $cost USD)"
      echo "$token"
      exit 0
      ;;
    processing) echo >&2 "  ...processing" ;;
    *)          echo >&2 "  status: $status" ;;
  esac
done
echo >&2 "TIMEOUT 240s"
exit 3
