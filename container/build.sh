#!/bin/bash
# Build the NanoClaw agent container image.
#
# Reads one optional build flag from ../.env:
#   INSTALL_CJK_FONTS=true   — add Chinese/Japanese/Korean fonts (~200MB)
# setup/container.ts reads the same file, so both build paths stay in sync.
# Callers can also override by exporting INSTALL_CJK_FONTS directly.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$SCRIPT_DIR"

# Derive the image name from the project root so two NanoClaw installs on the
# same host don't overwrite each other's `nanoclaw-agent:latest` tag. Matches
# setup/lib/install-slug.sh + src/install-slug.ts.
# shellcheck source=../setup/lib/install-slug.sh
source "$PROJECT_ROOT/setup/lib/install-slug.sh"
IMAGE_NAME="$(container_image_base)"
TAG="${1:-latest}"
CONTAINER_RUNTIME="${CONTAINER_RUNTIME:-docker}"

# Caller's env takes precedence; fall back to .env.
if [ -z "${INSTALL_CJK_FONTS:-}" ] && [ -f "../.env" ]; then
    INSTALL_CJK_FONTS="$(grep '^INSTALL_CJK_FONTS=' ../.env | tail -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]')"
fi

BUILD_ARGS=()
if [ "${INSTALL_CJK_FONTS:-false}" = "true" ]; then
    echo "CJK fonts: enabled (adds ~200MB)"
    BUILD_ARGS+=(--build-arg INSTALL_CJK_FONTS=true)
fi

# Copy utility scripts into build context — only needed by the downstream
# extension layer (Dockerfile.local). Cheap to do unconditionally so the
# layer is always reproducible.
rm -rf "$SCRIPT_DIR/_scripts"
mkdir -p "$SCRIPT_DIR/_scripts"
cp "$SCRIPT_DIR/../scripts/telegram-read.py" \
   "$SCRIPT_DIR/../scripts/telegram-auth.py" \
   "$SCRIPT_DIR/../scripts/youtube-transcript.py" \
   "$SCRIPT_DIR/../scripts/pdf-filler.cjs" \
   "$SCRIPT_DIR/../scripts/cdp-cookies.js" \
   "$SCRIPT_DIR/_scripts/" 2>/dev/null || true

# ── Stage 1: build the upstream base image ──────────────────────────────────
# Always tagged ":base"; an extension layer (if Dockerfile.local exists) will
# overwrite ":latest" after stage 2. If there's no extension layer, the base
# is re-tagged as ":latest" directly.
BASE_TAG="${IMAGE_NAME}:base"

echo "Building NanoClaw agent container image..."
echo "Stage 1 (upstream base): ${BASE_TAG}"

${CONTAINER_RUNTIME} build "${BUILD_ARGS[@]}" -t "${BASE_TAG}" -f Dockerfile .

# ── Stage 2: optional downstream extension ──────────────────────────────────
# Dockerfile.local stays out of the upstream merge surface. Add per-host
# MCPs, skill binaries, and apt extras there. Build it on top of ":base" and
# tag the result as the requested ":${TAG}" (default :latest), which is what
# the host code resolves via getDefaultContainerImage().
if [ -f "$SCRIPT_DIR/Dockerfile.local" ]; then
    echo "Stage 2 (downstream extension): ${IMAGE_NAME}:${TAG}"
    ${CONTAINER_RUNTIME} build \
        --build-arg "BASE_IMAGE=${BASE_TAG}" \
        -t "${IMAGE_NAME}:${TAG}" \
        -f Dockerfile.local .
else
    echo "No Dockerfile.local — re-tagging base as ${IMAGE_NAME}:${TAG}"
    ${CONTAINER_RUNTIME} tag "${BASE_TAG}" "${IMAGE_NAME}:${TAG}"
fi

# Clean up temp script copy
rm -rf "$SCRIPT_DIR/_scripts"

echo ""
echo "Build complete!"
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""
echo "Test with:"
echo "  echo '{\"prompt\":\"What is 2+2?\",\"groupFolder\":\"test\",\"chatJid\":\"test@g.us\",\"isMain\":false}' | ${CONTAINER_RUNTIME} run -i ${IMAGE_NAME}:${TAG}"
