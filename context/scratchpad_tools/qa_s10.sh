#!/usr/bin/env bash
# run_all.sh for S10 with the isolated entry (same tools, same args; only the bundle entry differs)
set -uo pipefail
cd /home/user/Test-/video
OUT="$1"; mkdir -p "$OUT"
FR="$OUT/frames"; rm -rf "$FR"; mkdir -p "$FR"
read -r DUR OFF < <(python3 -c "
import json
for s in json.load(open('src/data/scenes.json')):
  if s['id']=='S10': print(s['end']-s['start'], s['start'])")
TIMES="$(python3 -c "
import math
fps=30.0; b=float('$DUR')
f1=math.ceil(b*fps-1e-6)-1
print(','.join(f'{f/fps:.5f}' for f in range(0, f1+1)))")"
T0=$(date +%s)
node scripts/render-frames.mjs S10 "$FR" "$TIMES" --scale=0.5 --concurrency=2 --entry=src/scenes/scene10/preview/entry.tsx > "$OUT/list.txt" 2> "$OUT/render.log"
tail -1 "$OUT/render.log"
FT0="$OFF"
python3 scripts/qa/deadframes.py "$FR" --fps 30 --out "$OUT" --name S10 --quiet --scenes src/data/scenes.json --only S10 --t0 "$FT0" --allow scripts/qa/holds.json > "$OUT/deadframes.log" 2>&1 &
P1=$!
python3 scripts/qa/framecheck.py "$FR" --fps 30 --out "$OUT" --name S10 --quiet --scenes src/data/scenes.json --t0 "$FT0" > "$OUT/framecheck.log" 2>&1 &
P2=$!
wait $P1; wait $P2
python3 scripts/qa/report.py "$OUT" S10
echo "[qa] total $(( $(date +%s) - T0 )) s"
