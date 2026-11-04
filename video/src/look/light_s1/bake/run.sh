#!/usr/bin/env bash
# The LIGHT AND TEXTURE PROOF end to end (docs/look/organic/light_proof.md §6). From video/:
#   bash src/look/light_s1/bake/run.sh [scratch dir, default /tmp/organic/light_proof/run]
# 1. the engine's parts renders of v6's scene 1 at 1.0 s (every segment alone on a black and a white slab, the static
#    base), 2. the bake (the maps + maps.ts), 3. the three stills, 4. the numbers, 5. the sheet. ~4 min on one core.
# BENCH=1 adds the render-cost bench (30 frames per look, twice). Everything is seeded: a rerun gives the same bytes.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
SCR="${1:-/tmp/organic/light_proof/run}"
B=src/look/light_s1/bake
mkdir -p "$SCR"
python3 - "$SCR" <<'EOF'
import json, sys
scr = sys.argv[1]
segs = ['sky', 'clouds', 'spray', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing', 'doorleaves',
        'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'duck', 'bank', 'nearunder', 'near',
        'nearover', 'pipshadows', 'pip', 'particles']
static = [s for s in segs if s not in ('her', 'pip', 'pipshadows', 'particles', 'farroofs', 'fartower')]
jobs = [{'name': f'seg_{s}_{t}', 't': 1.0, 'props': {'look': 'light', 'parts': [s], 'slab': bg}}
        for s in segs for bg, t in (('#000000', 'k'), ('#FFFFFF', 'w'))]
jobs.append({'name': 'base_static', 't': 1.0, 'props': {'look': 'light', 'parts': static, 'slab': '#FBF3E6'}})
jobs.append({'name': 'base_all', 't': 1.0, 'props': {'look': 'light', 'parts': [s for s in segs if s not in ('farroofs', 'fartower')], 'slab': '#FBF3E6'}})
json.dump(jobs, open(f'{scr}/jobs_parts.json', 'w'))
stills = [{'name': n, 't': 1.0, 'props': dict(look=l, **({} if c else {'captions': False}))}
          for l, a, b in (('v6', 's1_v6', 'n1_v6'), ('light', 's2_light', 'n2_light'), ('full', 's3_full', 'n3_full'))
          for n, c in ((a, True), (b, False))]
json.dump(stills, open(f'{scr}/jobs_stills.json', 'w'))
ts = [round(1.0 + i / 60, 5) for i in range(30)]
json.dump([{'name': f'bench{r}_{l}', 'ts': ts, 'props': {'look': l}} for r in (1, 2) for l in ('v6', 'light', 'full')],
          open(f'{scr}/jobs_bench.json', 'w'))
EOF
GL=angle node $B/render_many.mjs "$SCR/jobs_parts.json" "$SCR/parts"
python3 -B $B/bake_light_s1.py --parts "$SCR/parts" --preview "$SCR/bake"
GL=angle node $B/render_many.mjs "$SCR/jobs_stills.json" "$SCR/stills"
python3 -B $B/measure.py "$SCR/stills" "$SCR/parts" "$SCR/measure.json" > /dev/null
python3 -B $B/sheet.py "$SCR/stills" "$SCR/measure.json" docs/look/organic/light_proof.png
if [ "${BENCH:-0}" = 1 ]; then GL=angle node $B/render_many.mjs "$SCR/jobs_bench.json" "$SCR/bench"; fi
