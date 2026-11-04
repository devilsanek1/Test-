#!/usr/bin/env bash
# The AI-paint test, end to end (docs/studies/2026-10-28_city_posters/ai_paint/NOTES.md): an open model (SDXL base 1.0,
# img2img + canny ControlNet) paints OUR v4 design's background plates LOCALLY on the CPU (no key, no service); the
# engine (lib/paint) places them; the scene's story layers stay ours and crisp.
#   bash scripts/look/aipaint/run_ai1.sh            # everything (about 25 min on 4 cores; the weights once: ~9 GB)
#   bash scripts/look/aipaint/run_ai1.sh --sheets   # only the renders and sheets (plates already painted)
# Weights: HF_HOME=/tmp/hf-cache (never in the repo). The python env: /tmp/aipaint/venv (CPU torch + diffusers).
set -euo pipefail
cd "$(dirname "$0")/../../.."
export HF_HOME=${HF_HOME:-/tmp/hf-cache}
PY=${PY:-/tmp/aipaint/venv/bin/python}
A=scripts/look/aipaint
DOC=docs/studies/2026-10-28_city_posters/ai_paint
SEED=1029
if [[ "${1:-}" != "--sheets" ]]; then
  [[ -x $PY ]] || { python3 -m venv /tmp/aipaint/venv; /tmp/aipaint/venv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch; /tmp/aipaint/venv/bin/pip install diffusers transformers accelerate safetensors huggingface_hub pillow numpy; }
  $PY $A/fetch_model.py --controlnet
  python3 $A/make_inits.py                                     # our design -> the inits + our canny edges
  # the strength trials (img2img alone, one seed; the trial init has the stage's sun)
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init.png --out out/aipaint/sky --strength 0.55 --seed $SEED
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init.png --out out/aipaint/sky --strength 0.4 --seed $SEED
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init.png --out out/aipaint/sky --strength 0.7 --seed $SEED
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init_nosun.png --out out/aipaint/sky_final --strength 0.62 --seed $SEED
  # structure control on our edges (the canny trials): our shapes hold, the paint is weaker
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init_nosun.png --control out/aipaint/init/sky_init_nosun_canny.png \
      --control-scale 0.6 --tag _cn2 --negative-extra "border, frame, vignette, stripes, banding" --out out/aipaint/sky_final --strength 0.68 --seed $SEED
  $PY $A/sdxl_paint.py --plate sky --init out/aipaint/init/sky_init_nosun.png --control out/aipaint/init/sky_init_nosun_canny.png \
      --control-scale 0.6 --tag _cn --out out/aipaint/sky_final --strength 0.75 --seed $SEED
  # the owner's pick, "Yeah 0.7 looks reasonable": the sky is the 0.70 trial itself; the tree at 0.70 (alone it drifts into
  # another picture, so the still's tree is the structure-controlled one)
  $PY $A/sdxl_paint.py --plate tree --init out/aipaint/init/tree_init.png --out out/aipaint/tree --strength 0.7 --seed $SEED
  $PY $A/sdxl_paint.py --plate tree --init out/aipaint/init/tree_init.png --control out/aipaint/init/tree_init_canny.png \
      --control-scale 0.6 --tag _cn --out out/aipaint/tree --strength 0.7 --seed $SEED
  # the sky and clouds from the model; the far roofs and the tower ours (0.70 turns them into a cloud)
  python3 $A/cut_plates.py --sky out/aipaint/sky/sky_s0.70_seed${SEED}.png \
      --tree out/aipaint/tree/tree_s0.70_seed${SEED}_cn.png --keep-design farroofs,fartower --set v2s1_ai1
fi
# the still, the paint-on strip (stills only), v2 flat for the compare; one render at a time (4 shared CPUs)
render() { local dir=out/aipaint/render/$1; mkdir -p "$dir"; GL=angle node scripts/render-frames.mjs PaintS1 "$dir" 1.0 --entry=src/entry-look-paint.tsx --props="$2" >/dev/null; echo "$dir/f00060.png"; }
render v2flat '{"paint":false}' >/dev/null
render ai1 '{"set":"ai1"}' >/dev/null
for r in 0 0.333 0.667 1; do render "reveal_$r" "{\"set\":\"ai1\",\"reveal\":$r}" >/dev/null; done
cp out/aipaint/render/ai1/f00060.png $DOC/ai_still_v1.png
cp $DOC/ai_still_v1.png deliverables/tests/ai_painted_scene1_still_v1.png
python3 $A/sheets.py trials out/aipaint
python3 $A/sheets.py compare out/aipaint/render/v2flat/f00060.png
python3 $A/sheets.py strip out/aipaint/render/reveal_{0,0.333,0.667,1}/f00060.png
