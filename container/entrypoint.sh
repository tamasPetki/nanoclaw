#!/bin/bash
# NanoClaw agent container entrypoint.
#
# The host passes initial session parameters via stdin as a single JSON blob,
# then the agent-runner opens the session DBs at /workspace/{inbound,outbound}.db
# and enters its poll loop. All further IO flows through those DBs.
#
# We capture stdin to a file first so /tmp/input.json is available for
# post-mortem inspection if the container exits unexpectedly, then exec bun
# so that bun becomes PID 1's direct child (under tini) and receives signals.

set -e

# Register mnemon Claude Code hooks (idempotent, per-agent-group .claude/ mount).
# Routed to stderr so it doesn't interfere with the JSON stdin handshake below.
mnemon setup --target claude-code --yes --global >/dev/stderr 2>&1 || true

# Wire OneCLI MITM CA cert into the few tool ecosystems that don't honor SSL_CERT_FILE.
# Node already reads NODE_EXTRA_CA_CERTS; curl reads SSL_CERT_FILE. Git (GnuTLS build on
# debian) reads neither — needs GIT_SSL_CAINFO explicitly. Without this, every git command
# the agent runs fails with "server certificate verification failed" through the OneCLI proxy.
export GIT_SSL_CAINFO="${NODE_EXTRA_CA_CERTS:-/tmp/onecli-combined-ca.pem}"

cat > /tmp/input.json

exec bun run /app/src/index.ts < /tmp/input.json
