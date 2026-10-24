#!/usr/bin/env bash
# sheet.sh <CompId> <t0> <t1> <count> <out.png> [--cols=N] [--scale=0.35] [--concurrency=2] [--no-capcheck]
# Renders <count> frames evenly spaced over [t0, t1] seconds (one bundle, one browser) and tiles them into a
# labeled contact sheet (label = seconds). Default thumbnail scale 0.35 (378x672 per frame).
# Then runs the caption legibility check on the same frames (scripts/capcheck.py: a second, captions-only mask render;
# prints FAIL lines for frames whose caption background is below 3:1). --no-capcheck skips it.
set -euo pipefail
cd "$(dirname "$0")/.."
[ $# -ge 5 ] || { echo "usage: scripts/sheet.sh <CompId> <t0> <t1> <count> <out.png> [--cols=N] [--scale=0.35] [--concurrency=2]"; exit 2; }
COMP="$1"; T0="$2"; T1="$3"; N="$4"; OUT="$5"; shift 5
COLS=""; SCALE="0.35"; PASS=(); CAPCHECK=1
for a in "$@"; do
  case "$a" in
    --cols=*) COLS="${a#--cols=}" ;;
    --scale=*) SCALE="${a#--scale=}" ;;
    --no-capcheck) CAPCHECK=0 ;;
    *) PASS+=("$a") ;;
  esac
done
TIMES="$(python3 -c "
t0,t1,n=float('$T0'),float('$T1'),int('$N')
print(','.join(f'{t0+(t1-t0)*i/max(1,n-1):.3f}' for i in range(n)))")"
[ -n "$COLS" ] || COLS="$(python3 -c "import math;n=int('$N');print(min(n, 8 if n>24 else 6 if n>12 else max(1,math.ceil(math.sqrt(n*1.6)))))")"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/sheet.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
node scripts/render-frames.mjs "$COMP" "$TMP" "$TIMES" --scale="$SCALE" ${PASS[@]+"${PASS[@]}"} > "$TMP/list.txt"
ARGS=()
while read -r S FR F; do
  ARGS+=(-label "$(printf '%.2fs' "$S")" "$F")
done < "$TMP/list.txt"
mkdir -p "$(dirname "$OUT")"
montage -background '#2b2b2b' -fill '#f0f0f0' -pointsize 18 "${ARGS[@]}" -tile "${COLS}x" -geometry +6+6 "$OUT"
if [ "$CAPCHECK" = 1 ]; then
  node scripts/render-frames.mjs "$COMP" "$TMP/mask" "$TIMES" --scale="$SCALE" --props='{"capcheck":"mask"}' ${PASS[@]+"${PASS[@]}"} > "$TMP/mask.txt" 2>/dev/null || true
  paste -d' ' "$TMP/list.txt" <(awk '{print $3}' "$TMP/mask.txt") > "$TMP/cc.txt" 2>/dev/null && python3 scripts/capcheck.py "$TMP/cc.txt" --quiet || true
fi
echo "$OUT"
