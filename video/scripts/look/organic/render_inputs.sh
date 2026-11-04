#!/usr/bin/env bash
# The organic proof's engine renders (docs/look/organic/organic_proof.md "Rerun"): v6's frame at 1.0 s and the
# decomposition renders the bake reads (src/look/organic_s1: OrganicS1 variants and OrganicFlat solos), then, with
# --after, the frame with the four organic pieces. One render at a time (4 shared CPUs), GL=angle as the paint stills.
#   bash scripts/look/organic/render_inputs.sh [OUT]           # inputs (default /tmp/organic/organic_proof/renders)
#   bash scripts/look/organic/render_inputs.sh [OUT] --after   # the after frame (captions on and off)
set -euo pipefail
cd "$(dirname "$0")/../../.."
R="${1:-/tmp/organic/organic_proof/renders}"
E=--entry=src/look/organic_s1/entry.tsx
one() { # <dir> <comp> <props>
  local tmp; tmp=$(mktemp -d)
  GL=angle node scripts/render-frames.mjs "$2" "$tmp" 1.0 $E --concurrency=1 --props="$3" >/dev/null
  mkdir -p "$R"; mv "$tmp"/f00060.png "$R/$1.png"; rm -rf "$tmp"
  echo "$R/$1.png"
}
if [[ "${2:-}" == "--after" ]]; then
  one after_cap OrganicS1 '{"organic":true}'
  one after OrganicS1 '{"organic":true,"captions":false}'
  exit 0
fi
one v6_cap OrganicS1 '{"organic":false}'
one v6 OrganicS1 '{"organic":false,"captions":false}'
one v6_groundUnlit OrganicS1 '{"organic":false,"captions":false,"variant":"groundUnlit"}'
one v6_noProps OrganicS1 '{"organic":false,"captions":false,"variant":"noProps"}'
one v6_noPip OrganicS1 '{"organic":false,"captions":false,"variant":"noPip"}'
one v6_noRow OrganicS1 '{"organic":false,"captions":false,"rowHidden":true}'
one flat_wing OrganicFlat '{"piece":"wing"}'
one flat_bands OrganicFlat '{"piece":"bands"}'
