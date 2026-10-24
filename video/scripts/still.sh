#!/usr/bin/env bash
# still.sh <CompId> <seconds> <out.png> [--scale=0.5]
# Renders one frame at <seconds> (composition time) to <out.png>.
set -euo pipefail
cd "$(dirname "$0")/.."
[ $# -ge 3 ] || { echo "usage: scripts/still.sh <CompId> <seconds> <out.png> [--scale=0.5]"; exit 2; }
COMP="$1"; T="$2"; OUT="$3"; shift 3
TMP="$(mktemp -d "${TMPDIR:-/tmp}/still.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
LINE="$(node scripts/render-frames.mjs "$COMP" "$TMP" "$T" --concurrency=1 "$@" | tail -n1)"
SRC="$(echo "$LINE" | awk '{print $3}')"
mkdir -p "$(dirname "$OUT")"
cp "$SRC" "$OUT"
echo "$OUT"
