#!/usr/bin/env bash
# L3 review files (COMMON.md "Review loop" + brief_L3 "Review files"), one round into $S/review/<round>/.
#   bash l3_review.sh r1
# Makes: clip.mp4 (Film2R film 12.75-20.80 at 0.5 scale, voice + cues), 216 px labelled stills of each shot at 8 key
# times beside reference 1 / v1 frames (sheet_S3.png, sheet_S4.png), full-size key frames (key_*.png), motion strips
# (strip_*_busy.png 10 x 0.1 s, strip_*_calm.png 8 x 0.25 s), cut close-ups (cuts.png), density.txt (+ json),
# camspeed.txt, deadframes.txt, and an index (README.txt) with every path.
set -euo pipefail
S=/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad
R=${1:?round name}
OUT=$S/review/$R
V=/home/user/Test-/video
mkdir -p "$OUT"/frames "$OUT"/full "$OUT"/tmp
cd "$V"
E=--entry=src/entry-v2r-film.tsx
F0=765   # film 12.75 (S2 tail: 0.23 s of context)
F1=1248  # film 20.80 (S5 head: 0.25 s of context)

echo "[review] clip"
npx remotion render src/entry-v2r-film.tsx Film2R "$OUT/clip.mp4" --gl=angle --concurrency=2 --scale=0.5 --frames=$F0-$F1 --log=error

echo "[review] decode frames"
ffmpeg -v error -y -i "$OUT/clip.mp4" -vsync 0 "$OUT/frames/f%04d.png"   # f0001 = film frame F0

# film second -> decoded frame file
fr() { python3 -c "import sys; t=float(sys.argv[1]); print('%s/frames/f%04d.png' % (sys.argv[2], round(t*60)-$F0+1))" "$1" "$OUT"; }

label() { # in out text
  convert "$1" -resize 216x -gravity south -background '#222' -fill white -font DejaVu-Sans -pointsize 11 -splice 0x16 -annotate +0+2 "$3" "$2"
}

echo "[review] 216 px stills beside the references"
S3T=(12.98 13.02 13.10 13.40 13.70 13.96 14.30 14.62 14.78 14.85)
S4T=(14.87 14.95 15.30 16.10 16.80 17.50 17.96 18.70 19.10 19.62 19.85 20.30 20.54)
i=0; for t in "${S3T[@]}"; do label "$(fr $t)" "$OUT/tmp/s3_$(printf %02d $i).png" "V2S3 $t (+$(python3 -c "print(round($t-12.98,2))"))"; i=$((i+1)); done
i=0; for t in "${S4T[@]}"; do label "$(fr $t)" "$OUT/tmp/s4_$(printf %02d $i).png" "V2S4 $t (+$(python3 -c "print(round($t-14.86,2))"))"; i=$((i+1)); done
for k in 004 009 014 020 026; do label "$S/ref1/r_$k.png" "$OUT/tmp/ref1_$k.png" "reference 1 #$k"; done
for k in 003 010 016 021 040 052; do label "$S/v1/v_$k.png" "$OUT/tmp/v1_$k.png" "v1 #$k"; done
montage "$OUT"/tmp/s3_*.png "$OUT"/tmp/v1_003.png "$OUT"/tmp/v1_016.png "$OUT"/tmp/ref1_004.png "$OUT"/tmp/ref1_020.png -tile 7x -geometry +3+3 -background '#444' "$OUT/sheet_S3.png"
montage "$OUT"/tmp/s4_*.png "$OUT"/tmp/v1_010.png "$OUT"/tmp/v1_040.png "$OUT"/tmp/ref1_009.png "$OUT"/tmp/ref1_026.png "$OUT"/tmp/v1_052.png -tile 9x -geometry +3+3 -background '#444' "$OUT/sheet_S4.png"

echo "[review] full-size key frames"
GL=angle node scripts/render-frames.mjs Film2R "$OUT/full" 13.62,14.30,16.90,17.96,19.85,20.53 $E --scale=1 >/dev/null
for f in "$OUT"/full/f*.png; do n=$(basename "$f" .png); fn=$((10#${n#f})); t=$(python3 -c "print('%.2f' % ($fn/60))"); cp "$f" "$OUT/key_${t}.png"; done

echo "[review] motion strips (10 x 0.1 s busiest second, 8 x 0.25 s calmest)"
python3 - "$OUT" "$F0" <<'PY'
import sys, glob, os
import numpy as np, cv2
out, F0 = sys.argv[1], int(sys.argv[2])
files = sorted(glob.glob(f'{out}/frames/f*.png'))
def img(i): return cv2.imread(files[i], cv2.IMREAD_REDUCED_COLOR_4)
# per-frame change energy outside the caption band (y 290-600 of 1920 -> rows 290/4.. at quarter of 540 wide)
E = []
prev = None
for i in range(len(files)):
    a = img(i).astype(np.int16)
    h = a.shape[0]
    m = np.ones(h, bool); m[int(h*290/1920):int(h*600/1920)] = False
    if prev is not None: E.append(float(np.abs(a - prev)[m].max(axis=2).__gt__(24).mean()))
    else: E.append(0.0)
    prev = a
E = np.array(E)
shots = {'S3': (12.98, 14.86), 'S4': (14.86, 20.55)}
res = []
for sid, (a, b) in shots.items():
    fa, fb = round(a*60)-F0, round(b*60)-F0
    best = None; calm = None
    for s in range(fa+2, fb-60):
        e = E[s:s+60].mean()
        if best is None or e > best[0]: best = (e, s)
    for s in range(fa+2, max(fa+3, fb-int(1.75*60))):
        e = E[s:s+int(1.75*60)].mean()
        if calm is None or e < calm[0]: calm = (e, s)
    res.append((sid, best[1], calm[1] if calm else fa+2))
    print(sid, 'busiest second from film', round((best[1]+F0)/60, 2), 'calmest 1.75 s from', round(((calm[1] if calm else fa)+F0)/60, 2))
with open(f'{out}/strips.txt', 'w') as f:
    for sid, b, c in res:
        f.write(f'{sid} {b} {c}\n')
PY
while read -r sid b c; do
  L=(); for k in 0 1 2 3 4 5 6 7 8 9; do i=$((b + k*6 + 1)); L+=("$OUT/frames/f$(printf %04d $i).png"); done
  montage "${L[@]}" -resize 270x -tile 10x -geometry +2+2 -background '#444' "$OUT/strip_${sid}_busy.png"
  L=(); for k in 0 1 2 3 4 5 6 7; do i=$((c + k*15 + 1)); L+=("$OUT/frames/f$(printf %04d $i).png"); done
  montage "${L[@]}" -resize 270x -tile 8x -geometry +2+2 -background '#444' "$OUT/strip_${sid}_calm.png"
done < "$OUT/strips.txt"

echo "[review] the cuts (full-size crops of 0.5-scale frames)"
CUT=(12.95 12.97 12.98 12.99 13.02 14.83 14.85 14.86 14.87 14.90 20.52 20.54 20.55 20.56)
L=(); for t in "${CUT[@]}"; do label "$(fr $t)" "$OUT/tmp/cut_$t.png" "film $t"; L+=("$OUT/tmp/cut_$t.png"); done
montage "${L[@]}" -tile 7x -geometry +3+3 -background '#444' "$OUT/cuts.png"

echo "[review] density (per shot, clip-relative scenes)"
cat > "$OUT/scenes_clip.json" <<JSON
[{"id": "V2S2tail", "start": 0.0, "end": 0.23}, {"id": "V2S3", "start": 0.23, "end": 2.11}, {"id": "V2S4", "start": 2.11, "end": 7.8}, {"id": "V2S5head", "start": 7.8, "end": 8.05}]
JSON
python3 -I scripts/qa/density.py "$OUT/clip.mp4" --scenes "$OUT/scenes_clip.json" --cozy --json "$OUT/density.json" > "$OUT/density.txt" 2>&1 || true

echo "[review] camspeed (60 fps frames)"
python3 -I scripts/camspeed.py --frames "$OUT/frames" --fps 60 --allow=0.20-0.27,2.08-2.14,7.77-7.83 --chart "$OUT/camspeed.png" > "$OUT/camspeed.txt" 2>&1 || true

echo "[review] colour jobs (hero teal, pop orange, dark) on the key frames"
python3 -I scripts/qa/colour_meter.py "$OUT"/key_*.png --hero '#0B8577' --pop '#EE6A2E' --band 290,600 > "$OUT/colour.txt" 2>&1 || true

echo "[review] deadframes"
python3 -I scripts/qa/deadframes.py "$OUT/clip.mp4" --scenes "$OUT/scenes_clip.json" --out "$OUT/deadframes" > "$OUT/deadframes.txt" 2>&1 || true

cat > "$OUT/README.txt" <<TXT
L3 review files, round $R (film 12.75-20.80; V2S3 = 12.98-14.86, V2S4 = 14.86-20.55)
clip (0.5 scale, voice + cues):  $OUT/clip.mp4
216 px stills beside reference 1 / v1 (labelled):  $OUT/sheet_S3.png  $OUT/sheet_S4.png
full-size key frames (1080x1920):  $(ls "$OUT"/key_*.png | tr '\n' ' ')
motion strips:  $(ls "$OUT"/strip_*.png | tr '\n' ' ')
the cuts (S2->S3 12.98, S3->S4 14.86, S4->S5 20.55):  $OUT/cuts.png
QA: $OUT/density.txt  $OUT/camspeed.txt (+ camspeed.png)  $OUT/deadframes.txt  $OUT/colour.txt
single frames of the clip: $OUT/frames/fNNNN.png  (film frame = NNNN + $((F0-1)); film s = film frame / 60)
TXT
echo "[review] done: $OUT/README.txt"
cat "$OUT/README.txt"
