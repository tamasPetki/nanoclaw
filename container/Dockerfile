# syntax=docker/dockerfile:1.7
# NanoClaw Agent Container
# Runs Claude Agent SDK in isolated Linux VM with browser automation.
#
# Runtime split:
#   - agent-runner (our TypeScript code): Bun
#   - globally-installed Node CLIs (claude-code, agent-browser, vercel): pnpm + Node

FROM node:22-slim

# ---- Build-time arguments ----------------------------------------------------
# CJK fonts add ~200MB. Opt in only if you render Chinese/Japanese/Korean text.
ARG INSTALL_CJK_FONTS=false

# Pin CLI versions for reproducibility. Bump deliberately — unpinned installs
# mean every rebuild silently picks up the latest and can break in lockstep
# across all users.
ARG CLAUDE_CODE_VERSION=2.1.112
ARG AGENT_BROWSER_VERSION=latest
ARG VERCEL_VERSION=latest
ARG BUN_VERSION=1.3.12

# ---- System dependencies -----------------------------------------------------
# tini: correct PID 1 / signal forwarding so outbound.db writes finalize on
# SIGTERM instead of being orphaned by the shell entrypoint.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
        chromium \
        fonts-liberation \
        fonts-noto-color-emoji \
        libgbm1 \
        libnss3 \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libasound2 \
        libpangocairo-1.0-0 \
        libcups2 \
        libdrm2 \
        libxshmfence1 \
        ca-certificates \
        curl \
        git \
        tini \
        unzip \
        xvfb \
        dbus-x11 \
        fluxbox \
        x11-utils \
        python3-venv \
        python3-pip \
        jq \
        poppler-utils \
    && if [ "$INSTALL_CJK_FONTS" = "true" ]; then \
        apt-get install -y --no-install-recommends fonts-noto-cjk; \
       fi \
    && rm -rf /var/lib/apt/lists/*

# ---- Python runtime + uv (for Python-based MCPs and scripts) -----------------
# uv/uvx for mcp-email-server and similar publicly-installed Python MCPs
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin sh

# Python venv at /opt/pyenv with common deps used by skills
# (telethon for Telegram read, youtube-transcript-api for YT, yt-dlp for media).
RUN python3 -m venv /opt/pyenv && \
    /opt/pyenv/bin/pip install --no-cache-dir telethon youtube-transcript-api requests yt-dlp
ENV PATH="/opt/pyenv/bin:$PATH"

# Utility scripts copied from build context (telegram-read.py, youtube-transcript.py, pdf-filler.cjs)
COPY _scripts/ /opt/scripts/
RUN chmod +x /opt/scripts/*.py 2>/dev/null || true

# Chromium path for agent-browser / Playwright consumers
ENV AGENT_BROWSER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
# Belt-and-braces: prevent Playwright's postinstall from downloading its own
# ~300MB Chromium. We've already installed the system one above.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# ---- Bun runtime -------------------------------------------------------------
# Install via the official script (handles multi-arch detection), then move
# the binary to /usr/local/bin so the non-root `node` user can execute it.
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}" && \
    install -m 0755 /root/.bun/bin/bun /usr/local/bin/bun && \
    rm -rf /root/.bun

# ---- pnpm + global Node CLIs -------------------------------------------------
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# agent-browser has a postinstall build script — pnpm skips these by default.
# Allowlist it via .npmrc so the install doesn't silently produce a broken
# package. Pinned versions so every rebuild is reproducible.
RUN --mount=type=cache,target=/root/.cache/pnpm \
    echo "only-built-dependencies[]=agent-browser" > /root/.npmrc && \
    pnpm install -g \
        "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
        "agent-browser@${AGENT_BROWSER_VERSION}" \
        "vercel@${VERCEL_VERSION}" \
        "pdf-lib@1.17.1"

# pdf-filler wrapper — CJS script at /opt/scripts/pdf-filler.cjs uses pdf-lib
# via NODE_PATH pointing at pnpm global root.
RUN printf '#!/bin/bash\nNODE_PATH=%s node /opt/scripts/pdf-filler.cjs "$@"\n' "$(pnpm root -g)" > /usr/local/bin/pdf-filler && \
    chmod +x /usr/local/bin/pdf-filler

# ---- MCP servers (per-group container.json picks which to use) --------------
# Copy all custom MCP server sources under /opt/mcp-servers/, then install
# each per its runtime needs. Published MCPs (mcp-email-server via uvx,
# google-calendar via npx, youtube-transcript via npx) don't need image-time
# install — they download on first use. Listed below are the only custom-code
# MCPs: quick (Node), todoist (Python), withings (Python).
COPY mcp-servers/ /opt/mcp-servers/

# Quick (riport.app) — Node MCP
RUN cd /opt/mcp-servers/quick && npm install --production --no-audit --no-fund 2>&1 | tail -20

# Todoist — Python MCP (venv inside its dir, entrypoint run.sh)
RUN cd /opt/mcp-servers/todoist && \
    python3 -m venv .venv && \
    .venv/bin/pip install --no-cache-dir mcp httpx pydantic

# Withings — Python MCP (venv inside its dir, package install editable)
RUN cd /opt/mcp-servers/withings && \
    python3 -m venv .venv && \
    .venv/bin/pip install --no-cache-dir -e .

# Precache uvx mcp-email-server — first-call download avoided at runtime.
RUN uvx mcp-email-server@latest --help 2>/dev/null || true

# ---- Skill binaries (PATH-installed) ----------------------------------------
# stealth-browse: headed Chrome via Xvfb with human-like input for X/TG/etc.
# pdf-reader: PDF text extraction CLI (wraps poppler-utils pdftotext)
COPY skills/stealth-browser/stealth-browse /usr/local/bin/stealth-browse
COPY skills/pdf-reader/pdf-reader /usr/local/bin/pdf-reader
RUN chmod +x /usr/local/bin/stealth-browse /usr/local/bin/pdf-reader

# ---- agent-runner ------------------------------------------------------------
WORKDIR /app

# Copy manifest + lockfile first so the install layer caches independently of
# source edits.
COPY agent-runner/package.json agent-runner/bun.lock ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Source. Bun runs TS directly — no tsc build step. The host remounts this
# path at runtime via `src/container-runner.ts` so source edits on the host
# take effect without rebuilding the image; the baked copy is the fallback.
COPY agent-runner/ ./

# ---- Entrypoint --------------------------------------------------------------
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# ---- Workspace + permissions -------------------------------------------------
RUN mkdir -p /workspace/group /workspace/global /workspace/extra && \
    chown -R node:node /workspace && \
    chmod 755 /home/node

USER node
WORKDIR /workspace/group

# tini is PID 1, reaps zombies, forwards signals cleanly. entrypoint.sh does
# `exec bun ...` so bun runs as tini's direct child.
ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
