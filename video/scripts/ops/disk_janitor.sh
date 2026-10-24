#!/usr/bin/env bash
# Prune stale Remotion webpack cache entries when free disk drops under a threshold.
# Many agents bundle in parallel and each config hash leaves a ~200-400 MB pack behind.
# Usage: scripts/ops/disk_janitor.sh [min_free_gb=5] [interval_s=300] [stale_min=15]
MIN_GB=${1:-5}; INT=${2:-300}; STALE=${3:-15}
CACHE="$(cd "$(dirname "$0")/../.." && pwd)/node_modules/.cache/webpack"
while true; do
  free_gb=$(df -BG --output=avail / | tail -1 | tr -dc 0-9)
  if [ "$free_gb" -lt "$MIN_GB" ]; then
    before=$free_gb
    find "$CACHE" -mindepth 2 -maxdepth 2 -type d -mmin +"$STALE" -exec rm -rf {} + 2>/dev/null
    echo "$(date +%H:%M) pruned webpack cache: ${before}G -> $(df -BG --output=avail / | tail -1 | tr -dc 0-9)G free"
  fi
  sleep "$INT"
done
