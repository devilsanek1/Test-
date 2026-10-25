#!/usr/bin/env bash
# r.sh <name> <times> [scale] [cols] [crop]: render S02 (isolated entry) into scratchpad/scenes/S02/pol/<name>, make <name>.png sheet
set -e
SP=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad
D=$SP/scenes/S02/pol/$1; rm -rf "$D"; mkdir -p "$D"
cd /home/user/Test-/video
node scripts/render-frames.mjs ${ENTRYCOMP:-S02} "$D" "$2" --entry=${ENTRY:-src/scenes/scene02/preview.entry.tsx} --scale=${3:-0.5} --concurrency=2 2>&1 | tail -1
python3 $SP/sheet.py "$D" "$SP/scenes/S02/pol/$1.png" ${4:-6} $5
