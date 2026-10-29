#!/usr/bin/env bash
# The paint bake for v2's S1 (paint_test/NOTES.md "the bake"): 1. each piece's flat shapes alone on a transparent frame
# (the PaintFlatS1 composition of src/entry-look-paint.tsx, 1.0 s, after the flood) into out/paint/v2s1/flat/; 2. the
# painter (paint.py, seeded: the same spec gives the same pixels) into public/paint/v2s1/ + manifest.json.
#   bash scripts/look/paint/bake_v2s1.sh            # flats + paint
#   bash scripts/look/paint/bake_v2s1.sh --paint    # paint only (the flats are already there)
set -euo pipefail
cd "$(dirname "$0")/../../.."
FLAT=out/paint/v2s1/flat
mkdir -p "$FLAT"
if [[ "${1:-}" != "--paint" ]]; then
  for p in sky tree pier farroofs fartower fern water; do
    tmp=$(mktemp -d)
    GL=angle node scripts/render-frames.mjs PaintFlatS1 "$tmp" 1.0 --entry=src/entry-look-paint.tsx --props="{\"piece\":\"$p\"}" >/dev/null
    mv "$tmp"/f00060.png "$FLAT/$p.png"
    rm -rf "$tmp"
  done
fi
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1.json
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v2.json
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v3.json
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v4.json --design   # v4's flat design stage
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v4.json            # v4 painted
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v5.json --design   # v5's flat design stage
python3 scripts/look/paint/paint.py scripts/look/paint/v2s1_v5.json            # v5: the layered brush
