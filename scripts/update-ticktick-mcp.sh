#!/bin/bash
# Bump the pinned mcp-ticktick version baked into the agent image, then rebuild.
# The MCP server runs from a local venv (/opt/mcp-servers/ticktick/.venv) baked into
# the image, so "refresh" = repin + rebuild (no per-spawn uvx resolution at runtime).
#
# Usage: scripts/update-ticktick-mcp.sh [<version>]
#   no arg  -> uses the latest version on PyPI
#   <ver>   -> pins exactly that version (e.g. 0.1.3)
set -euo pipefail
cd "$(dirname "$0")/.."

DF=container/Dockerfile.local
VER="${1:-}"
if [ -z "$VER" ]; then
  VER=$(curl -s https://pypi.org/pypi/mcp-ticktick/json | python3 -c 'import sys,json;print(json.load(sys.stdin)["info"]["version"])')
fi
echo "Pinning mcp-ticktick==$VER"

# Update the pin in the Dockerfile (matches mcp-ticktick==<anything>)
sed -i -E "s/mcp-ticktick==[0-9][0-9.]*/mcp-ticktick==$VER/" "$DF"
grep -n "mcp-ticktick==" "$DF"

echo "Rebuilding agent image..."
./container/build.sh

echo "Done. Restart the groups that use TickTick to pick up the new image:"
echo "  for g in hub stokes asszisztens pietscarlet gorgey32 csobanka lupaobol trinkenessen torokhegyi; do ncl groups restart --id <id>; done"
