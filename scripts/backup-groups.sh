#!/usr/bin/env bash
# Durable backup of NanoClaw runtime state (groups/ + central DBs).
#
# Replaces the old "track groups/ in git" backup mechanism: the agents'
# workspaces (wiki, logs, memory, research) are no longer versioned in the code
# repo, so this nightly snapshot is what keeps them recoverable.
#
# Output: /root/backups/nanoclaw-groups/groups-<date>.tar.gz (+ DB snapshots),
# 14-day rotation. Dependency-free (tar + cp of the WAL fileset).
# /root/backups is a symlink to the Hetzner volume (/mnt/HC_Volume_106216764)
# since 2026-07-03 — backups live off the root disk.
set -euo pipefail

REPO=/root/nanoclaw-v2
DEST=/root/backups/nanoclaw-groups
KEEP_DAYS=14
TS=$(date +%Y%m%d-%H%M%S)
STAMP=$(mktemp -d)
trap 'rm -rf "$STAMP"' EXIT

mkdir -p "$DEST"

# 1) groups/ — the agents' runtime workspaces (the thing we no longer git-track).
#    Reinstallable dependency trees are excluded (node_modules ballooned the
#    nightly tarball 539M→1.1G when the ledger trio landed); everything the
#    agents authored stays in.
tar czf "$DEST/groups-$TS.tar.gz" \
  --exclude='node_modules' \
  --exclude='.pnpm-store' \
  --exclude='.next' \
  -C "$REPO" groups/

# 2) central DBs — copy the full WAL fileset together so the snapshot is
#    consistent on restore (SQLite replays the -wal on first open).
mkdir -p "$STAMP/db"
for db in v2.db rezerver-crm.db; do
  for ext in "" "-wal" "-shm"; do
    [ -f "$REPO/data/${db}${ext}" ] && cp -p "$REPO/data/${db}${ext}" "$STAMP/db/" || true
  done
done
tar czf "$DEST/db-$TS.tar.gz" -C "$STAMP" db/

# 3) rotation — prune snapshots older than KEEP_DAYS
find "$DEST" -name 'groups-*.tar.gz' -mtime +$KEEP_DAYS -delete 2>/dev/null || true
find "$DEST" -name 'db-*.tar.gz' -mtime +$KEEP_DAYS -delete 2>/dev/null || true

echo "$(date -Iseconds) backup ok: groups-$TS.tar.gz ($(du -h "$DEST/groups-$TS.tar.gz" | cut -f1)), db-$TS.tar.gz ($(du -h "$DEST/db-$TS.tar.gz" | cut -f1))"
