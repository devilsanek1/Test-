#!/usr/bin/env bash
# rs.sh <set> <variant|-> <t1,t2,...> <outprefix> [--scale=0.5]
set -e
SP=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad
cd /home/user/Test-/video
SET="$1"; VAR="$2"; TS="$3"; OUT="$4"; shift 4
if [ "$VAR" = "-" ]; then PROPS="{\"set\":\"$SET\"}"; else PROPS="{\"set\":\"$SET\",\"variant\":\"$VAR\"}"; fi
TMP=$(mktemp -d $SP/rf.XXXX)
node src/scenes/shared/sets/preview/render.mjs SetsPreview $TMP "$TS" --concurrency=2 --props="$PROPS" "$@" > $TMP/list.txt
i=0
while read s f file; do cp "$file" "${OUT}_${s}.png"; echo "${OUT}_${s}.png"; done < $TMP/list.txt
rm -rf $TMP
