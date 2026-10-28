#!/usr/bin/env bash
# Lane L3 report assets (conform_L3 §5, RESUME "Before you report"): usage  bash context/workflows/v2r-l3-report-assets.sh <round>
# Writes into $S/report/<round>/ (scratch) and copies the deliverables to video/docs/v2/lanes/img/:
#   L3_S3S4_0.4.mp4      Film2R 12.80-20.80 s at 0.4 scale (S2's last 0.18 s, S3, S4, S5's first 0.25 s), voice + captions
#   L3_joins_0.4.jpg     the join frames 12.95 / 12.98 / 13.00 · 14.71 / 14.86 / 15.01 · 20.40 / 20.55 / 20.70
#   L3_stills_0.4.jpg    13.5, 14.2, 16.0, 17.0, 17.96, 19.9 (her far window at 16.0 and 19.9)
# and prints: check_light A/B at 13.5 / 17.0 / 19.9, check_depth at 13.5 / 17.0 / 19.9, measure.py + ends.py at 13.5 / 17.0
# (full size, the caption zone y 290-600 masked), check_banding on the open sky at 13.5 / 17.0.
set -uo pipefail
S=/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad
R=${1:?round name}
OUT=$S/report/$R
V=/home/user/Test-/video
IMG=$V/docs/v2/lanes/img
mkdir -p "$OUT"/j "$OUT"/st "$OUT"/full "$OUT"/off "$IMG"
cd "$V"
E=--entry=src/entry-v2r-film.tsx
rf() { env GL=angle node scripts/render-frames.mjs Film2R "$@" $E 2>&1 | grep -v "^\s*$" | tail -1; }

echo "== clip"
npx remotion render src/entry-v2r-film.tsx Film2R "$OUT/L3_S3S4_0.4.mp4" --gl=angle --concurrency=2 --scale=0.4 --frames=768-1248 --log=error && cp "$OUT/L3_S3S4_0.4.mp4" "$IMG/"

echo "== join frames and stills (0.4)"
rf "$OUT/j" 12.95,12.98,13.0,14.71,14.86,15.01,20.4,20.55,20.7 --scale=0.4
rf "$OUT/st" 13.5,14.2,16.0,17.0,17.96,19.9 --scale=0.4
python3 - "$OUT" "$IMG" <<'PY'
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
out, img = sys.argv[1], sys.argv[2]
def sheet(d, labels, cols, name):
    fs = sorted(glob.glob(f'{out}/{d}/f*.png'))
    ims = [Image.open(f).convert('RGB') for f in fs]
    w, h = ims[0].size
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * (w + 8), rows * (h + 30)), '#333')
    dr = ImageDraw.Draw(S)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except Exception: font = None
    for i, (im, lab) in enumerate(zip(ims, labels)):
        x, y = (i % cols) * (w + 8), (i // cols) * (h + 30)
        S.paste(im, (x, y + 26)); dr.text((x + 6, y + 3), lab, fill='white', font=font)
    S.save(f'{img}/{name}', quality=88)
sheet('j', ['12.95 S2', '12.98 S3 (match)', '13.00', '14.71 push in', '14.86 mid', '15.01 S4', '20.40 push in', '20.55 mid', '20.70 S5'], 3, 'L3_joins_0.4.jpg')
sheet('st', ['13.5', '14.2', '16.0 (far window)', '17.0', '17.96 stop', '19.9 (far window)'], 3, 'L3_stills_0.4.jpg')
PY

echo "== full-size A/B (lights off / on) at 13.5, 17.0, 19.9"
rf "$OUT/full" 13.5,17.0,19.9 --scale=1
rf "$OUT/off" 13.5,17.0,19.9 --scale=1 --props='{"lightOff":true}'
f() { python3 -c "import sys; print('%s/f%05d.png' % (sys.argv[2], round(float(sys.argv[1]) * 60)))" "$1" "$2"; }
echo "== check_light"
python3 scripts/qa/check_light.py "$(f 13.5 $OUT/off)" "$(f 13.5 $OUT/full)" --subject 255,700,410,870 --sky '#BCDCCF' --exclude 0,0,1080,600 2>&1 | tail -6
python3 scripts/qa/check_light.py "$(f 17.0 $OUT/off)" "$(f 17.0 $OUT/full)" --subject 660,880,790,1080 --sky '#BCDCCF' --exclude 0,0,1080,600 2>&1 | tail -6
python3 scripts/qa/check_light.py "$(f 19.9 $OUT/off)" "$(f 19.9 $OUT/full)" --subject 660,880,790,1080 --sky '#BCDCCF' --exclude 0,0,1080,600 2>&1 | tail -6
echo "== check_depth"
for t in 13.5; do python3 scripts/qa/check_depth.py "$(f $t $OUT/full)" --sheet scripts/qa/depth_sheets/v2_s3.json --quiet 2>&1 | tail -4; done
for t in 17.0 19.9; do python3 scripts/qa/check_depth.py "$(f $t $OUT/full)" --sheet scripts/qa/depth_sheets/v2_s4.json --quiet 2>&1 | tail -4; done
echo "== line metrics (full size, caption zone masked)"
python3 -I scripts/qa/retro_tools/line/measure.py "$OUT/measure.json" "s3_13.5=$(f 13.5 $OUT/full)#290-600" "s4_17.0=$(f 17.0 $OUT/full)#290-600" 2>&1 | tail -2
(cd scripts/qa/retro_tools/line && python3 ends.py "s3_13.5=$(f 13.5 $OUT/full)#290-600" "s4_17.0=$(f 17.0 $OUT/full)#290-600" 2>&1 | tail -4)
echo "== banding (open sky)"
python3 -I scripts/qa/check_banding.py "$(f 13.5 $OUT/full)" --region ${S3_SKY_REGION:-400,0,1080,280} --quiet 2>&1 | tail -2
python3 -I scripts/qa/check_banding.py "$(f 17.0 $OUT/full)" --region ${S4_SKY_REGION:-400,0,1080,280} --quiet 2>&1 | tail -2
echo "== done: $OUT"
