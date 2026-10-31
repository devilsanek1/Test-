#!/usr/bin/env bash
# v8 end to end (paint_test/v8_card.md; NOTES.md "v8"; the pattern of src/look/v7_s1/bake/run.sh). From video/:
#   bash src/look/v8_s1/bake/run.sh [scratch dir] [--from=paint|parts|light|stills]
#   1. paint   the set's design (set_v8.py) and the painter (paint_v8.py: the recipe book's sky, MyPaint marks per face,
#              the street's flags, joints and wet map, the trees' leaves) -> src/look/v8_s1/paint/ + pieces_v8.ts,
#              flat_v8.ts; the design's labels and the wet maps -> <scratch>/bake
#   2. parts   the movers alone on a black and a white slab (her, the cafe, Pip) -> <scratch>/parts
#   3. light   the one rig solved into each plane's maps (light_v8.py: the sun with its shadows, the sky's fill, the
#              lobby's pool, the reflections in the glass, the canal and the wet street, the air, bloom at sources, the
#              paper) -> src/look/v8_s1/maps/ + maps_v8.ts
#   4. stills  look 'v8' with and without captions, and look 'flat' -> <scratch>/stills
# The painter needs organic proof 1's scratch tools (docs/look/organic/organic_proof.md §9: the venv, peinten, the CC0
# brushes); PAINT_PY names its python. Seeded: a rerun gives the same bytes. Scratch default /tmp/v8_s1.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
SCR="${1:-/tmp/v8_s1}"
shift || true
FROM=paint
for arg in "$@"; do
  case "$arg" in
    --from=*) FROM="${arg#--from=}" ;;
  esac
done
B=src/look/v8_s1/bake
PAINT_PY="${PAINT_PY:-/tmp/organic/organic_proof/venv/bin/python}"
mkdir -p "$SCR/bake" "$SCR/parts" "$SCR/stills" "$SCR/oc"
step() { case "$FROM" in paint) return 0 ;; parts) [ "$1" != paint ] ;; light) [ "$1" = light ] || [ "$1" = stills ] ;; stills) [ "$1" = stills ] ;; esac; }

if step paint; then
  OC_SCRATCH="$SCR/oc" "$PAINT_PY" -B $B/paint_v8.py --out "$SCR/bake"
  rm -rf "$SCR/oc/jobs"
fi
if step parts; then
  python3 - "$SCR/parts" <<'EOF'
import json, sys
out = sys.argv[1]
jobs = [{'name': f'{m}_{t}', 't': 1.0, 'props': {'look': 'v8', 'parts': [m], 'slab': bg}}
        for m in ('her', 'cafe', 'pip') for bg, t in (('#000000', 'k'), ('#FFFFFF', 'w'))]
json.dump(jobs, open(f'{out}/jobs.json', 'w'))
EOF
  GL=angle node $B/render_many.mjs "$SCR/parts/jobs.json" "$SCR/parts"
fi
if step light; then
  python3 -B $B/light_v8.py --bake "$SCR/bake" --parts "$SCR/parts" --paper --preview "$SCR/lightprev"
fi
if step stills; then
  echo '[{"name": "v8", "t": 1.0, "props": {"look": "v8"}}, {"name": "v8_nocap", "t": 1.0, "props": {"look": "v8", "captions": false}}, {"name": "flat", "t": 1.0, "props": {"look": "flat"}}]' > "$SCR/stills/jobs.json"
  GL=angle node $B/render_many.mjs "$SCR/stills/jobs.json" "$SCR/stills"
fi
