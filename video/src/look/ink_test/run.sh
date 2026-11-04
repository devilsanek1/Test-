#!/usr/bin/env bash
# The ink-line look test (iteration, 2026-10-30; docs/look/ink_test/BRIEF.md, NOTES.md). From video/:
#   bash src/look/ink_test/run.sh [scratch dir] [--from=renders|trace|ink]
# 1. renders  v7a's scene 1 at 1.0 s through v7's own composition and render helper (called, never edited): the still
#             with and without its captions, and every lined segment alone on a black and a white slab (the flat, keyed,
#             unlit design: the line geometry's source; the light slots never draw in a parts render)
# 2. trace    trace.py: the design's edges -> polylines (strokes), each with its segment, plane, kind and light side
# 3. ink      ink.py: the three treatments (A, B, C) drawn over the paint, the captions back on top, each at full size
#             and 360 px wide; sheet.py: docs/look/ink_test/compare.png
# Everything is seeded: a rerun gives the same bytes.
set -euo pipefail
cd "$(dirname "$0")/../../.."
SCR="${1:-/tmp/ink_test}"
FROM="${2:---from=renders}"
FROM="${FROM#--from=}"
HERE=src/look/ink_test
mkdir -p "$SCR/renders"
step() { case "$FROM" in renders) return 0 ;; trace) [ "$1" != renders ] ;; ink) [ "$1" = ink ] ;; esac; }

if step renders; then
  python3 - "$SCR" <<'EOF'
import json, sys
scr = sys.argv[1]
sys.path.insert(0, 'src/look/ink_test')
from inkcommon import LINED
jobs = [{'name': 'v7a_cap', 't': 1.0, 'props': {'look': 'v7a'}},
        {'name': 'v7a_nocap', 't': 1.0, 'props': {'look': 'v7a', 'captions': False}}]
for s in LINED:
    for bg, k in (('#000000', 'k'), ('#FFFFFF', 'w')):
        jobs.append({'name': f'seg_{s}_{k}', 't': 1.0, 'props': {'look': 'v7a', 'parts': [s], 'slab': bg}})
json.dump(jobs, open(f'{scr}/renders/jobs.json', 'w'), indent=0)
EOF
  GL=angle node src/look/v7_s1/bake/render_many.mjs "$SCR/renders/jobs.json" "$SCR/renders"
fi
if step trace; then
  python3 -B $HERE/trace.py "$SCR"
fi
if step ink; then
  python3 -B $HERE/ink.py "$SCR"
  python3 -B $HERE/sheet.py "$SCR"
fi
