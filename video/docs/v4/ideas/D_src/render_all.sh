#!/usr/bin/env bash
# Imagination D: write every frame's page, render them one at a time (render.mjs), keep compressed JPEGs, lay out the sheet.
#   bash render_all.sh [ids...]      (run from anywhere; ids like D-B1 D-B7alt; none = all)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VIDEO="$(cd "$HERE/../../../.." && pwd)"
cd "$HERE"
LIST="$(mktemp)"
python3 frames.py "$@" > "$LIST"
mkdir -p out
while read -r page; do
  id="$(basename "$page" .html)"
  tmp="$(mktemp -d)"
  (cd "$VIDEO" && node scripts/type/render.mjs "$page" "$tmp/$id.png" --phone > /dev/null)
  python3 -c "from PIL import Image; Image.open('$tmp/$id.png').convert('RGB').save('out/$id.jpg', quality=90)"
  cp "$tmp/${id}_phone.jpg" "out/${id}_phone.jpg"
  rm -rf "$tmp"
  echo "rendered $id"
done < "$LIST"
rm -f "$LIST"
python3 sheet.py
