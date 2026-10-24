#!/usr/bin/env bash
# strip.sh <CompId> <t0> <t1> <out.png> [--crop=WxH+X+Y] [--scale=0.5] [--cols=8] [--step=1]
# Renders EVERY frame (or every Nth with --step) between t0 and t1 seconds and tiles them with frame numbers:
# the tool for checking motion at 30 fps (caption scroll, draw-on pacing, pops, transitions).
# --crop is in FULL-RES canvas px (it is scaled with --scale), e.g. --crop=1080x300+0+200 for the sky captions.
set -euo pipefail
cd "$(dirname "$0")/.."
[ $# -ge 4 ] || { echo "usage: scripts/strip.sh <CompId> <t0> <t1> <out.png> [--crop=WxH+X+Y] [--scale=0.5] [--cols=8] [--step=1]"; exit 2; }
COMP="$1"; T0="$2"; T1="$3"; OUT="$4"; shift 4
CROP=""; SCALE="0.5"; COLS="8"; STEP="1"
for a in "$@"; do
  case "$a" in
    --crop=*) CROP="${a#--crop=}" ;;
    --scale=*) SCALE="${a#--scale=}" ;;
    --cols=*) COLS="${a#--cols=}" ;;
    --step=*) STEP="${a#--step=}" ;;
  esac
done
TIMES="$(python3 -c "
t0,t1,st=float('$T0'),float('$T1'),int('$STEP')
f0,f1=round(t0*30),round(t1*30)
print(','.join(f'{f/30:.4f}' for f in range(f0,f1+1,st)))")"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/strip.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
node scripts/render-frames.mjs "$COMP" "$TMP" "$TIMES" --scale="$SCALE" > "$TMP/list.txt"
CR=""
if [ -n "$CROP" ]; then CR="$(python3 -c "
import re;w,h,x,y=map(float,re.match(r'(\d+)x(\d+)\+(\d+)\+(\d+)','$CROP').groups());s=float('$SCALE')
print(f'{round(w*s)}x{round(h*s)}+{round(x*s)}+{round(y*s)}')")"; fi
ARGS=()
while read -r S FR F; do
  if [ -n "$CR" ]; then convert "$F" -crop "$CR" +repage "$F.c.png"; F="$F.c.png"; fi
  ARGS+=(-label "f$FR $(printf '%.2fs' "$S")" "$F")
done < "$TMP/list.txt"
mkdir -p "$(dirname "$OUT")"
montage -background '#2b2b2b' -fill '#f0f0f0' -pointsize 14 "${ARGS[@]}" -tile "${COLS}x" -geometry +3+3 "$OUT"
echo "$OUT"
