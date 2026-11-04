#!/usr/bin/env bash
# test01_s1 end to end: the hero frame of process test 01 (docs/tests/process_test_01_amsterdam/CARD.md; the pattern of
# src/look/v8_s1/bake/run.sh, never edited). From video/:
#   bash src/look/test01_s1/bake/run.sh [scratch dir] [--from=paint|parts|light|stills]
#   1. paint   the set's design (set_t01.py: the Jordaan street, the bridge, the paper twin, the waking pages) and the
#              painter (paint_t01.py: the recipe book's blue-hour sky with a calm caption field, MyPaint marks per face,
#              brick in courses, the twin's paper with its handwriting as a texture, the parchment ground, the water)
#              -> src/look/test01_s1/paint/ + pieces_t01.ts, flat_t01.ts; the labels and ink maps -> <scratch>/bake
#   2. parts   the stream alone on black (its top end is her phone: the light bake reads it from there)
#   3. light   the one rig solved into each plane's maps (light_t01.py: the waking pages, the stream and the phone as
#              the story light, the blue hour's fill, the afterglow's rims, the lamp and the windows a step under, the
#              twin waking round the source, the gold path on the water, the air, bloom at sources, the paper)
#              -> src/look/test01_s1/maps/ + maps_t01.ts
#   4. stills  look 't01' with and without the caption, and look 'flat' -> <scratch>/stills
# The painter needs organic proof 1's scratch tools (docs/look/organic/organic_proof.md §9: the venv, peinten, the CC0
# brushes); PAINT_PY names its python. Seeded: a rerun gives the same bytes. Scratch default /tmp/test01_s1.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
SCR="${1:-/tmp/test01_s1}"
shift || true
FROM=paint
for arg in "$@"; do
  case "$arg" in
    --from=*) FROM="${arg#--from=}" ;;
  esac
done
B=src/look/test01_s1/bake
E=src/look/test01_s1/entry.tsx
PAINT_PY="${PAINT_PY:-/tmp/organic/organic_proof/venv/bin/python}"
mkdir -p "$SCR/bake" "$SCR/parts" "$SCR/stills" "$SCR/oc"
step() { case "$FROM" in paint) return 0 ;; parts) [ "$1" != paint ] ;; light) [ "$1" = light ] || [ "$1" = stills ] ;; stills) [ "$1" = stills ] ;; esac; }

if step paint; then
  OC_SCRATCH="$SCR/oc" "$PAINT_PY" -B $B/paint_t01.py --out "$SCR/bake"
  rm -rf "$SCR/oc/jobs"
fi
if step parts; then
  GL=angle node scripts/render-frames.mjs T01S1 "$SCR/parts" 1.0 --entry=$E --props='{"look":"t01","parts":["stream"],"slab":"#000000"}'
  mv "$SCR/parts/f00060.png" "$SCR/parts/stream_k.png"
fi
if step light; then
  python3 -B $B/light_t01.py --bake "$SCR/bake" --parts "$SCR/parts" --paper --preview "$SCR/lightprev"
fi
if step stills; then
  for look in t01 flat; do
    GL=angle node scripts/render-frames.mjs T01S1 "$SCR/stills" 1.0 --entry=$E --props="{\"look\":\"$look\"}"
    mv "$SCR/stills/f00060.png" "$SCR/stills/$look.png"
  done
  GL=angle node scripts/render-frames.mjs T01S1 "$SCR/stills" 1.0 --entry=$E --props='{"look":"t01","captions":false}'
  mv "$SCR/stills/f00060.png" "$SCR/stills/t01_nocap.png"
fi
