#!/usr/bin/env bash
# checkin.sh <label>: render a progress overview of every visual thread for the 30-minute check-ins.
# Output: review/checkins/<label>/overview.png (+ one strip per composition). Failing compositions are
# skipped and listed in review/checkins/<label>/status.txt so a mid-edit lane never blocks the update.
set -uo pipefail
cd "$(dirname "$0")/../.."
LABEL="${1:-$(date -u +%H%M)}"
OUT="review/checkins/$LABEL"
mkdir -p "$OUT"
: > "$OUT/status.txt"

render_strip() { # <CompId> <times> <tile>
  local comp="$1" times="$2" tile="$3"
  if node scripts/render-frames.mjs "$comp" "$OUT/$comp" "$times" --scale=0.5 --concurrency=2 > "$OUT/$comp.log" 2>&1; then
    montage "$OUT/$comp"/*.png -tile "$tile" -geometry 270x480+3+3 -background '#222' \
      -title "$comp" -pointsize 18 -fill white "$OUT/strip_$comp.png" 2>/dev/null
    echo "ok   $comp" >> "$OUT/status.txt"
  else
    echo "FAIL $comp (see $comp.log)" >> "$OUT/status.txt"
  fi
}

# Scenes first (once scene production starts), then the toolkit demos.
for s in $(node -e "try{for(const s of require('./src/data/scenes.json'))console.log(s.id)}catch(e){}" 2>/dev/null); do
  n="${s#S}"
  f=""; [ -f src/scenes/Scene${n}.tsx ] && f=src/scenes/Scene${n}.tsx; [ -f src/scenes/S${n}.tsx ] && f=src/scenes/S${n}.tsx
  if [ -n "$f" ] && ! grep -q "PLACEHOLDER" "$f"; then
    dur=$(node -e "const s=require('./src/data/scenes.json').find(x=>x.id==='$s');console.log((s.end-s.start).toFixed(2))")
    t=$(python3 -c "d=$dur; print(','.join(f'{d*k/6:.2f}' for k in range(6)))")
    render_strip "$s" "$t" 6x1
  fi
done
render_strip CineDemo 1.5,4,6,8.5,11,13.5,16,19 8x1
render_strip KitDemo 1,3,5,7,9,11 6x1
if node scripts/render-frames.mjs SharedKitSheet "$OUT/SharedKitSheet" 2.5 --concurrency=1 > "$OUT/SharedKitSheet.log" 2>&1; then
  cp "$OUT"/SharedKitSheet/*.png "$OUT/sharedkit.png"; echo "ok   SharedKitSheet" >> "$OUT/status.txt"
else
  echo "FAIL SharedKitSheet" >> "$OUT/status.txt"
fi
strips=$(ls "$OUT"/strip_*.png 2>/dev/null)
[ -n "$strips" ] && montage $strips -tile 1x -geometry +0+4 -background '#222' "$OUT/overview.png"
cat "$OUT/status.txt"
echo "$OUT"
