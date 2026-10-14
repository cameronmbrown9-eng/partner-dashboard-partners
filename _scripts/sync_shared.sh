#!/bin/bash
# Copy the shared modules and data files from the partner dashboard repo (source of truth)
# into the research dashboard repo, so both sites render the same data.
# Usage: bash _scripts/sync_shared.sh   (from Partner-Dashboard-PARTNERS)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="${1:-$SRC/../Partner-Dashboard-RESEARCH}"
[ -d "$DST/src" ] || { echo "research repo not found at $DST"; exit 1; }
rsync -a --delete "$SRC/src/shared/" "$DST/src/shared/"
rsync -a "$SRC/src/data/" "$DST/src/data/"
cp "$SRC/src/index.css" "$DST/src/index.css"
echo "synced shared/ and data/ to $DST"
echo "research-only data file: $DST/src/data/site_notes.json (not synced)"
