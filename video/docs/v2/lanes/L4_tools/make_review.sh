#!/usr/bin/env bash
# make_review.sh (lane L4 scratch tool): the brief's review files for V2S5, into $OUT (default <scratch>/review/<tag>).
#   1. stills at 10 key times (Film2R, captions on) at 1080 -> 216 px, labelled, beside reference 1 / v1 at 216 px
#   2. full-size 1080x1920 stills: the start key frame (20.80) and the end key frame (23.70)
#   3. motion strips: busiest (10 frames 0.1 s apart, 21.80-22.70) + calm (start hold 8 x 0.1 s; end hold 7 x 0.1 s)
#   4. the 0.5-scale clip with voice + cues (Film2R frames 1233-1439) + density.py + the camera check
# Usage (from video/): bash make_review.sh <tag> [--no-clip]
set -euo pipefail
TAG=${1:-r0}
SCR=/tmp/claude-0/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/scratchpad
OUT=${OUT:-$SCR/review/$TAG}
REFS=$SCR/refs216
mkdir -p $OUT/full $OUT/keys $OUT/strip_busy $OUT/strip_calm
E=--entry=src/entry-v2r-film.tsx
KEYT="20.60,20.80,21.20,21.85,22.10,22.30,22.44,22.80,23.10,23.70"
GL=angle node scripts/render-frames.mjs Film2R $OUT/keys $KEYT $E --scale=1 > $OUT/keys.log 2>&1
cp $OUT/keys/f01248.png $OUT/full/start_20.80.png
cp $OUT/keys/f01422.png $OUT/full/end_23.70.png
# 216 px labelled stills
i=0
for f in $(ls $OUT/keys/f*.png | sort); do
  fr=$(basename $f .png | sed 's/f0*//'); t=$(python3 -c "print(f'{$fr/60:.2f}')")
  convert $f -resize 216x384 -gravity south -background '#222' -fill white -splice 0x16 -pointsize 12 -annotate +0+1 "V2S5 film $t" $OUT/keys/s216_$(printf %02d $i).png
  i=$((i+1))
done
montage $OUT/keys/s216_*.png -tile 10x1 -geometry +3+3 -background '#333' $OUT/sheet_keys216.png
# beside the references at 216 px
for f in $REFS/ref1_*.png; do convert $f -gravity south -background '#222' -fill white -splice 0x16 -pointsize 12 -annotate +0+1 "ref1 $(basename $f .png | sed 's/ref1_//')s" $OUT/keys/r_$(basename $f); done
for f in $REFS/v1_*.png; do convert $f -gravity south -background '#222' -fill white -splice 0x16 -pointsize 12 -annotate +0+1 "v1 $(basename $f .png | sed 's/v1_//')s" $OUT/keys/v_$(basename $f); done
montage $OUT/keys/r_ref1_*.png -tile 10x1 -geometry +3+3 -background '#333' $OUT/row_ref1.png
for f in $REFS/g5b_*.png; do convert $f -gravity south -background '#222' -fill white -splice 0x16 -pointsize 12 -annotate +0+1 "G5b bar $(basename $f .png | sed 's/g5b_//')s" $OUT/keys/v_zz_$(basename $f); done
montage $OUT/keys/v_v1_*.png $OUT/keys/v_zz_*.png -tile 10x1 -geometry +3+3 -background '#333' $OUT/row_v1.png
convert $OUT/sheet_keys216.png $OUT/row_v1.png $OUT/row_ref1.png -background '#333' -gravity west -append $OUT/sheet_216_vs_refs.png
# motion strips (Bare: no captions), 0.25 scale
GL=angle node scripts/render-frames.mjs Film2RBare $OUT/strip_busy 21.80,21.90,22.00,22.10,22.20,22.30,22.40,22.50,22.60,22.70 $E --scale=0.25 > $OUT/strip.log 2>&1
montage $OUT/strip_busy/f*.png -tile 10x1 -geometry +2+2 -background '#333' $OUT/strip_busy.png
GL=angle node scripts/render-frames.mjs Film2RBare $OUT/strip_calm 20.55,20.65,20.75,20.85,20.95,21.05,21.15,21.25,23.40,23.50,23.60,23.70,23.80,23.90,23.98 $E --scale=0.25 >> $OUT/strip.log 2>&1
montage $OUT/strip_calm/f*.png -tile 15x1 -geometry +2+2 -background '#333' $OUT/strip_calm.png
# camera check
npx esbuild src/v2r/scenes/V2S5_qa_run.ts --bundle --platform=node --format=cjs --jsx=automatic --loader:.tsx=tsx --loader:.woff2=empty --outfile=$OUT/s5qa.js --log-level=error && node $OUT/s5qa.js > $OUT/camera_check.txt
if [ "${2:-}" != "--no-clip" ]; then
  npx remotion render src/entry-v2r-film.tsx Film2R $OUT/v2s5_half.mp4 --frames=1233-1439 --gl=angle --concurrency=2 --scale=0.5 > $OUT/clip.log 2>&1
  python3 -I scripts/qa/density.py $OUT/v2s5_half.mp4 > $OUT/density.txt 2>&1 || true
  python3 -I scripts/qa/density.py $OUT/v2s5_half.mp4 --cozy > $OUT/density_cozy.txt 2>&1 || true
fi
python3 $SCR/tools/bandcheck.py --dir $OUT/band > $OUT/bandcheck.txt 2>&1 || true
# STYLE.md section 5 proofs: camspeed on the 60 fps Bare frames, colour jobs on the key stills, deadframes on the clip
python3 -I scripts/camspeed.py --frames $OUT/band --fps 60 --t0 0 --limit 15 --allow=1.47-1.64 > $OUT/camspeed.txt 2>&1 || true
python3 -I scripts/qa/colour_meter.py $OUT/keys/f0*.png --hero '#0B8577' --pop '#EE6A2E' --band 290,600 > $OUT/colour_meter.txt 2>&1 || true
if [ -f $OUT/v2s5_half.mp4 ]; then python3 -I scripts/qa/deadframes.py $OUT/v2s5_half.mp4 --scenes none --out $OUT/deadframes --no-chart --quiet > $OUT/deadframes.txt 2>&1 || true; fi
echo "review files in $OUT"; ls $OUT
