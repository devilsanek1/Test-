#!/usr/bin/env bash
# sheets.sh <CompId> <t0> <t1> <every_nth> <out_dir> [--scale=0.25] [--tile=256] [--cols=6] [--rows=4] [--crop=WxH+X+Y]
#           [--concurrency=2] [--fps=30]
# Frame-by-frame visual review: renders every <every_nth> frame of <CompId> between <t0> and <t1> seconds (one bundle,
# one browser: scripts/render-frames.mjs) and tiles them into labeled contact sheets of 6x4 = 24 frames each.
# Every tile is labeled with its frame number, time and (for Main) scene id; every sheet has a header.
#   every_nth = 1: every frame (motion, pops, flashes); 2-3: a quick scan of a whole scene.
#   --tile = tile width in px (default 256: a 6-wide sheet is ~1.6k px wide, small enough to read in one look).
#   --crop = a region in FULL-RES canvas px, e.g. --crop=1080x340+0+260 for the caption band.
# Output: <out_dir>/<CompId>_<t0>-<t1>_n<N>_01.png, _02.png, ... (paths are printed).
# Keep the machine responsive: default --scale=0.25 (270x480 renders) and concurrency 2.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ $# -ge 5 ] || { sed -n '2,12p' "$0"; exit 2; }
COMP="$1"; T0="$2"; T1="$3"; NTH="$4"; OUT="$5"; shift 5
SCALE="0.25"; TILE="256"; COLS="6"; ROWS="4"; CROP=""; CONC="2"; FPS="30"
for a in "$@"; do
  case "$a" in
    --scale=*) SCALE="${a#--scale=}" ;;
    --tile=*) TILE="${a#--tile=}" ;;
    --cols=*) COLS="${a#--cols=}" ;;
    --rows=*) ROWS="${a#--rows=}" ;;
    --crop=*) CROP="${a#--crop=}" ;;
    --concurrency=*) CONC="${a#--concurrency=}" ;;
    --fps=*) FPS="${a#--fps=}" ;;
    *) echo "unknown option $a"; exit 2 ;;
  esac
done
mkdir -p "$OUT"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/qasheets.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
TIMES="$(python3 -c "
t0,t1,n,fps=float('$T0'),float('$T1'),max(1,int('$NTH')),float('$FPS')
f0,f1=round(t0*fps),round(t1*fps)
print(','.join(f'{f/fps:.5f}' for f in range(f0,f1+1,n)))")"
node scripts/render-frames.mjs "$COMP" "$TMP/frames" "$TIMES" --scale="$SCALE" --concurrency="$CONC" > "$TMP/list.txt"
# labels (+ scene ids for Main) and optional crop, then tile with ImageMagick
python3 - "$COMP" "$TMP/list.txt" "$TMP/labels.txt" "$CROP" "$SCALE" "$FPS" <<'PY'
import json, os, re, subprocess, sys
comp, lst, outp, crop, scale, fps = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), float(sys.argv[6])
scenes = []
if os.path.exists('src/data/scenes.json'):
    scenes = sorted(json.load(open('src/data/scenes.json')), key=lambda s: s['start'])
off = 0.0
for s in scenes:
    if s['id'] == comp:
        off = float(s['start'])      # per-scene composition: frame 0 = the scene's start on the film timeline
cr = None
if crop:
    w, h, x, y = map(float, re.match(r'(\d+)x(\d+)\+(\d+)\+(\d+)', crop).groups())
    cr = f'{round(w * scale)}x{round(h * scale)}+{round(x * scale)}+{round(y * scale)}'
with open(outp, 'w') as o:
    for line in open(lst):
        sec, fr, f = line.split()
        t = int(fr) / fps
        sid = ''
        if comp == 'Main':
            sid = next((s['id'] for s in reversed(scenes) if s['start'] <= t + 1e-9), '')
        elif off:
            sid = f'film {t + off:.2f}s'
        if cr:
            subprocess.run(['convert', f, '-crop', cr, '+repage', f], check=True)
        o.write(f'{f}\tf{int(fr)}  {t:.2f}s  {sid}\n')
PY
PER=$((COLS * ROWS))
TOTAL=$(wc -l < "$TMP/labels.txt")
NS=$(( (TOTAL + PER - 1) / PER ))
k=0
while [ $k -lt "$NS" ]; do
  ARGS=()
  while IFS=$'\t' read -r F L; do ARGS+=(-label "$L" "$F"); done < <(sed -n "$((k * PER + 1)),$(((k + 1) * PER))p" "$TMP/labels.txt")
  NAME="$(printf '%s/%s_%s-%s_n%s_%02d.png' "$OUT" "$COMP" "$T0" "$T1" "$NTH" $((k + 1)))"
  FIRST="$(sed -n "$((k * PER + 1))p" "$TMP/labels.txt" | cut -f2 | awk '{print $1}')"
  LAST="$(sed -n "$(( (k + 1) * PER < TOTAL ? (k + 1) * PER : TOTAL ))p" "$TMP/labels.txt" | cut -f2 | awk '{print $1}')"
  montage -background '#2b2b2b' -fill '#f0f0f0' -font DejaVu-Sans -pointsize 13 "${ARGS[@]}" \
    -tile "${COLS}x${ROWS}" -geometry "${TILE}x+4+4" \
    -title "$COMP  ${T0}-${T1}s  every ${NTH} frame(s)  sheet $((k + 1))/$NS  ($FIRST-$LAST)" "$NAME"
  echo "$NAME"
  k=$((k + 1))
done
