#!/usr/bin/env bash
# Render the type stills (TYPE_GUIDE.md §h): every page here -> scripts/type/out/<name>.png (+ _phone, _ui, _mask, _bare,
# _layout.json for check_stills.py), then the deliverables -> docs/look/type/stills/<name>.png and <name>_ui.jpg.
#   bash scripts/type/stills/render_all.sh [NN ...]      # from video/; no args = all pages
set -euo pipefail
cd "$(dirname "$0")/../../.."
OUT=scripts/type/out; DOC=docs/look/type/stills
mkdir -p "$OUT" "$DOC"
pages=()
if [ $# -eq 0 ]; then pages=(scripts/type/stills/[0-9]*.html); else for n in "$@"; do pages+=(scripts/type/stills/${n}_*.html); done; fi
for f in "${pages[@]}"; do
  n=$(basename "$f" .html)
  node scripts/type/render.mjs "$f" "$OUT/$n.png" --phone --ui --mask >/dev/null
  cp "$OUT/$n.png" "$DOC/$n.png"; cp "$OUT/${n}_ui.jpg" "$DOC/${n}_ui.jpg"
  echo "rendered $n"
done
