#!/usr/bin/env bash
# v7 end to end (ORGANIC.md §6; NOTES.md "v7a" and "v7"). From video/:
#   bash src/look/v7_s1/bake/run.sh [scratch dir] [--from=paint|parts|bake|stills|check] [--look=v7a|v7] [--paper]
# look v7a, the first half (steps 4, 1, 2; the default, unchanged):
#   1. paint   the painter's v7 pieces (scripts/look/paint/v2s1_v7.json: T3's sky, the dark cloud, the calm far planes,
#              the flock), then the canal's design frame (V7S1 design: the cut scene keyed, the vector water unkeyed) and
#              the canal painted on it (-> public/paint/v2s1_v7/)
#   2. parts   the engine's parts renders of V7S1 at 1.0 s (every segment alone on a black and a white slab, the static
#              base, the marker render of the lit panes) -> <scratch>/parts
#   3. bake    the light (bake_light_v7.py -> src/look/v7_s1/maps/v7a/ + maps.ts), solved against the keyed picture
#   4. stills  the checkpoints and the still: look 'cut' (step 4), 'key' (+ step 1), 'v7a' (+ step 2), captions on/off
#   5. check   the numbers (check_v7.py) and the sheet (sheet_v7.py): compare_v7a.jpg
# look v7, the second half (steps 3 and 5, her in the people overhaul's drawing):
#   1. paint   v7a's flat parts (look 'v7a': the painter's input) -> <scratch>/parts_v7a, then the painter v7
#              (paint_v7.py: the quay, the facade, the near leaves, through MyPaint) -> src/look/v7_s1/paint/ + paint_v7.ts
#   2. parts   the parts renders of look 'v7' (the pieces in their slots, her new drawing) -> <scratch>/parts_v7
#   3. bake    the light solved again against them (bake_light_v7.py --look v7 --labels <v7a parts> [--paper]) ->
#              src/look/v7_s1/maps/v7/ + maps_v7.ts
#   4. stills  look 'v7' (captions on and off) and v7a and v6 to compare
#   5. check   check_v7.py (v6, v7a, v7) and sheet_v7.py --v7 (compare_v7.jpg)
# The painter needs organic proof 1's scratch tools (the venv with FastNoiseLite, peinten, the CC0 brushes:
# docs/look/organic/organic_proof.md §9); PAINT_PY names its python (default /tmp/organic/organic_proof/venv/bin/python).
# Everything is seeded: a rerun gives the same bytes. Scratch default /tmp/v7_s1 (renders and parts only).
set -euo pipefail
cd "$(dirname "$0")/../../../.."
SCR="${1:-/tmp/v7_s1}"
shift || true
FROM=paint
LOOK=v7a
PAPER=""
for arg in "$@"; do
  case "$arg" in
    --from=*) FROM="${arg#--from=}" ;;
    --look=*) LOOK="${arg#--look=}" ;;
    --paper) PAPER="--paper" ;;
  esac
done
B=src/look/v7_s1/bake
PAINT_PY="${PAINT_PY:-/tmp/organic/organic_proof/venv/bin/python}"
mkdir -p "$SCR/parts" "$SCR/stills" "$SCR/design"
step() { case "$FROM" in paint) return 0 ;; parts) [ "$1" != paint ] ;; bake) [ "$1" != paint ] && [ "$1" != parts ] ;; stills) [ "$1" = stills ] || [ "$1" = check ] ;; check) [ "$1" = check ] ;; esac; }

# the parts jobs of a look into a folder
parts_jobs() {
  python3 - "$1" "$2" <<'EOF'
import json, sys
look, out = sys.argv[1], sys.argv[2]
sys.path.insert(0, 'src/look/v7_s1/bake')
from v7common import SEGMENTS, MOVERS
static = [s for s in SEGMENTS if s not in MOVERS and s not in ('farroofs', 'fartower')]
jobs = [{'name': f'seg_{s}_{t}', 't': 1.0, 'props': {'look': look, 'parts': [s], 'slab': bg}}
        for s in SEGMENTS for bg, t in (('#000000', 'k'), ('#FFFFFF', 'w'))]
jobs.append({'name': 'base_static', 't': 1.0, 'props': {'look': look, 'parts': static, 'slab': '#FBF3E6'}})
jobs.append({'name': 'base_all', 't': 1.0, 'props': {'look': look, 'parts': [s for s in SEGMENTS if s not in ('farroofs', 'fartower')], 'slab': '#FBF3E6'}})
jobs.append({'name': 'marker_wing', 't': 1.0, 'props': {'look': look, 'parts': ['wing'], 'slab': '#000000', 'marker': True}})
json.dump(jobs, open(f'{out}/jobs.json', 'w'))
EOF
}

if [ "$LOOK" = v7a ]; then
  if step paint; then
    python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v7.json --only sky,clouds,flock
    echo '[{"name": "design", "t": 1.0, "props": {"look": "key", "design": true, "captions": false}}]' > "$SCR/design/jobs.json"
    GL=angle node $B/render_many.mjs "$SCR/design/jobs.json" "$SCR/design"
    mkdir -p out/paint/v2s1_v7 && cp "$SCR/design/design.png" out/paint/v2s1_v7/design_frame.png
    python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v7.json --only water
  fi
  if step parts; then
    parts_jobs v7a "$SCR/parts"
    GL=angle node $B/render_many.mjs "$SCR/parts/jobs.json" "$SCR/parts"
  fi
  if step bake; then
    python3 -B $B/bake_light_v7.py --parts "$SCR/parts" --preview "$SCR/bake"
  fi
  if step stills; then
    python3 - "$SCR" <<'EOF'
import json, sys
scr = sys.argv[1]
jobs = []
for look in ('cut', 'key', 'v7a'):
    jobs.append({'name': look, 't': 1.0, 'props': {'look': look}})
    jobs.append({'name': f'{look}_nocap', 't': 1.0, 'props': {'look': look, 'captions': False}})
json.dump(jobs, open(f'{scr}/stills/jobs.json', 'w'))
EOF
    GL=angle node $B/render_many.mjs "$SCR/stills/jobs.json" "$SCR/stills"
  fi
else
  mkdir -p "$SCR/parts_v7a" "$SCR/parts_v7"
  if step paint; then
    if [ ! -f "$SCR/parts_v7a/base_static.png" ]; then
      parts_jobs v7a "$SCR/parts_v7a"
      GL=angle node $B/render_many.mjs "$SCR/parts_v7a/jobs.json" "$SCR/parts_v7a"
    fi
    mkdir -p "$SCR/oc"
    OC_SCRATCH="$SCR/oc" "$PAINT_PY" -B $B/paint_v7.py --flat "$SCR/parts_v7a"
  fi
  if step parts; then
    parts_jobs v7 "$SCR/parts_v7"
    GL=angle node $B/render_many.mjs "$SCR/parts_v7/jobs.json" "$SCR/parts_v7"
  fi
  if step bake; then
    python3 -B $B/bake_light_v7.py --parts "$SCR/parts_v7" --look v7 --labels "$SCR/parts_v7a" $PAPER --preview "$SCR/bake_v7"
  fi
  if step stills; then
    python3 - "$SCR" <<'EOF'
import json, sys
scr = sys.argv[1]
jobs = []
for look in ('v7', 'v7a'):
    jobs.append({'name': look, 't': 1.0, 'props': {'look': look}})
    jobs.append({'name': f'{look}_nocap', 't': 1.0, 'props': {'look': look, 'captions': False}})
json.dump(jobs, open(f'{scr}/stills/jobs.json', 'w'))
EOF
    GL=angle node $B/render_many.mjs "$SCR/stills/jobs.json" "$SCR/stills"
  fi
fi
if step stills; then
  # v6 to compare: the still as sent (paint_still_v6.png) and the light proof's look 'v6' without captions (the same
  # frame, pixel for pixel: light_proof.md §1)
  cp docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png "$SCR/stills/v6.png"
  if [ ! -f "$SCR/stills/v6_nocap.png" ]; then
    echo '[{"name": "v6_nocap", "t": 1.0, "props": {"look": "v6", "captions": false}}]' > "$SCR/stills/jobs_v6.json"
    GL=angle node src/look/light_s1/bake/render_many.mjs "$SCR/stills/jobs_v6.json" "$SCR/stills"
  fi
fi
if step check; then
  if [ "$LOOK" = v7a ]; then
    python3 -B $B/check_v7.py "$SCR" > "$SCR/check.json"
    python3 -B $B/sheet_v7.py "$SCR"
  else
    python3 -B $B/check_v7.py "$SCR" --parts "$SCR/parts_v7" --labels "$SCR/parts_v7a" --stills v6,v7a,v7 > "$SCR/check_v7.json"
    python3 -B $B/sheet_v7.py "$SCR" --v7
  fi
fi
