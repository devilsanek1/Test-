#!/usr/bin/env bash
# QA gate for S07 through its isolated entry (same steps and args as scripts/qa/run_all.sh for a scene composition).
set -euo pipefail
cd /home/user/Test-/video
OUT="$1"; mkdir -p "$OUT"
FR="$(mktemp -d "${TMPDIR:-/tmp}/qa-S07i.XXXXXX")"
trap 'rm -rf "$FR"' EXIT
read -r DUR OFF < <(python3 -c "
import json
s=[x for x in json.load(open('src/data/scenes.json')) if x['id']=='S07'][0]
print(s['end']-s['start'], s['start'])")
TIMES="$(python3 -c "
import math
fps=30; b=float('$DUR')
f1=max(0, math.ceil(b*fps-1e-6)-1)
print(','.join(f'{f/fps:.5f}' for f in range(0, f1+1)))")"
node scripts/render-frames.mjs S07 "$FR/frames" "$TIMES" --scale=0.5 --concurrency=2 --entry=src/scenes/scene07/entry.tsx > "$FR/list.txt"
DF_ARGS=(--fps 30 --out "$OUT" --name S07 --quiet --scenes src/data/scenes.json --only S07 --t0 "$OFF")
FC_ARGS=(--fps 30 --out "$OUT" --name S07 --quiet --scenes src/data/scenes.json --t0 "$OFF")
[ -f scripts/qa/holds.json ] && DF_ARGS+=(--allow scripts/qa/holds.json)
set +e
python3 scripts/qa/deadframes.py "$FR/frames" "${DF_ARGS[@]}" > "$OUT/deadframes.log" 2>&1 &
P1=$!
python3 scripts/qa/framecheck.py "$FR/frames" "${FC_ARGS[@]}" > "$OUT/framecheck.log" 2>&1 &
P2=$!
wait $P1; wait $P2
grep -v '^  \[' "$OUT/deadframes.log" | head -n 20
grep -v '^  \[' "$OUT/framecheck.log" | head -n 12
python3 scripts/qa/report.py "$OUT" S07
