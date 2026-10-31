#!/usr/bin/env bash
# Render C's pages one at a time: bash render.sh [ids...]  (run from anywhere)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
VIDEO="$(cd "$HERE/../../../.." && pwd)"
cd "$HERE"
python3 c_frames.py "$@"
mkdir -p frames
ids="$@"
if [ -z "$ids" ]; then ids=$(ls pages | sed 's/\.html$//'); fi
for id in $ids; do
  node "$VIDEO/scripts/type/render.mjs" "pages/$id.html" "frames/$id.png" --phone > /dev/null
  python3 -I -c "from PIL import Image; Image.open('frames/$id.png').convert('RGB').save('frames/$id.jpg', quality=90)" && rm -f "frames/$id.png"
  echo "rendered $id"
done
