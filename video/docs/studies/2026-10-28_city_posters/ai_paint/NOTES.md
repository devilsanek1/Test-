# AI-painted background plates: the local test (iteration, 2026-10-29)

**The ask** (owner, 2026-10-29): "I mean let’s try and see if it gets us there"; then "Oh damn we need a separate
service / But you are AI why can’t you do it". So the test ran an open-source image model LOCALLY, in our own container
(4 CPU cores, no GPU, no key, no outside service). The test: `BRIEF.md`; the rule: playbook PAINTED PIECES.

**Short answer:** _(filled below, "The verdict")_

| File | What |
|---|---|
| `ai_still_v1.png` (= `deliverables/tests/ai_painted_scene1_still_v1.png`) | v2's S1 at 1.0 s, 1080 x 1920: our v4 design with its sky plate (sky, 4 cloud planes, far haze) and its tree painted by the model; everything else ours and crisp |
| `trials_sky.jpg`, `trial_sky_s*.jpg` | the sky-plate trials: our design (the init), img2img alone at 0.40 / 0.55 / 0.62 / 0.70, then with structure control (canny) |
| `compare.jpg` | 1 v2 flat (as shipped), 2 our painter's `paint_still_v4`, 3 `ai_still_v1`, 4 ref 03, 5 ref 02 |
| `reveal_strip.jpg` | the owner's "would it literally just popup?": 4 stills of the paint-on (no video yet) |

## The model and its licence
- **SDXL base 1.0** (`stabilityai/stable-diffusion-xl-base-1.0`, revision `462165984030d82259a11f4367a4eed129e94a7b`),
  licence **CreativeML Open RAIL++-M**: commercial use allowed, with its Attachment A use restrictions. No fallback to SD
  1.5 was needed.
- **Structure control:** `xinsir/controlnet-canny-sdxl-1.0` (revision `1271357eda52d54b857c650cacb5b51144643ccb`),
  licence **Apache-2.0**: commercial use allowed. It is fed OUR design's canny edges, never a reference image.
- **How it runs:** diffusers 0.42.1 (`StableDiffusionXLImg2ImgPipeline`, `StableDiffusionXLControlNetImg2ImgPipeline`),
  torch 2.15.0+cpu, transformers 5.22.0, Python 3.13. The UNet, ControlNet and text encoders run in bfloat16 (this
  Xeon has AMX-BF16, so bf16 is fast); the VAE encodes and decodes in fp32. Safetensors only; no remote code.
- **Weights:** outside the repo, in `/tmp/hf-cache` (the fp16 safetensors: SDXL 6.5 GB, fetched in 32 s; the ControlNet
  2.5 GB, in 66 s). The python env is `/tmp/aipaint/venv`. Nothing of either is committed.

## The method (the design is ours; the model only paints it)
1. **Init = our design** (`make_inits.py`): our painter's v4 DESIGN stage (`public/paint/v2s1_v4design/`, the flat dusk
   sky, its 4 cloud planes, the far roofs and tower; the tree as a lit and a shade mass).
   - The **sky plate** is 768 x 1344 (SDXL-native portrait) = frame rows 0..1890 at one uniform scale (0.711). The scene
     covers the sky below y 1100, so those rows are a calm mirror of the sky: context the model reads as "sky over
     water", never used.
   - The **tree** is 768 x 768 = the stage around the tree (x 0..340, y 1215..1555, scale 2.26).
   - The trials' init had the stage's sun disc pasted on top. The final init has none (`sky_init_nosun.png`): the
     scene draws its crisp `SunDisc` UNDER the far roofs, so a painted sun landed inside the far-roofs piece, over the
     crisp one (seen in a test render).
2. **Paint** (`sdxl_paint.py`): img2img from our init's VAE latents (the mean, so it is deterministic), DPM++ 2M Karras,
   30 scheduler steps (img2img runs `int(30 x strength)`), CFG 6.5, seed 1029 for every run; with `--control`, the
   canny ControlNet at conditioning scale 0.6 on our edges (OpenCV canny: blur 1.6, thresholds 18/48).
3. **Cut and place** (`cut_plates.py`): each plate goes back to frame scale with Lanczos, and is cut into the ENGINE's
   own pieces: the same box as our v4 design piece, under that piece's own alpha (our silhouettes). That gives the set
   `ai1` (`public/paint/v2s1_ai1/` + `manifest.json`): the sky, `clouds_p0..p3` (the `clouds` group, far to near),
   `farroofs` and `fartower` (the far planes), and the tree (the near plane). Each sits through `PaintedLayer` /
   `PaintedGroup` in its own plane's group (`PaintS1 set: 'ai1'`). Her, the people, the door and its "Google" sign,
   Pip and the captions are drawn by the scene on top, crisp and ours. The pier stays our design's.

**The prompt** (words only: no artist named; the owner's models 03 and 02 were looked at to write it, never fed to the
model). Sky:

> matte gouache painting of a dusk sky, layered clouds in overlapping planes, near cumulus lit gold by a low sun on the
> left, far banks paler and flatter, thin streaks at the horizon, big simple masses, few broad brush strokes, soft
> dry-brush edges, soft atmosphere, lavender rose and peach palette

Tree:

> matte gouache painting of a small round tree on a quay at dusk, one warm lit mass on the sunny left and one cool shade
> mass, big simple masses, few broad deliberate brush strokes, soft dry-brush edges, soft atmosphere, muted sage green,
> warm low evening light

**Negative:** text, letters, words, watermark, signature, logo, people, person, figure, face, photo, photograph,
photorealistic, 3d render, cgi, noise, grain, jpeg artifacts, oversaturated, neon, harsh contrast, busy detail, outlines,
blurry (the second canny run adds: border, frame, vignette, stripes, banding).

Every run's full settings and timing are in its JSON beside the PNG (`out/aipaint/<plate>/<name>.json`, not committed;
the table below has them all).

## The runs, minutes per plate

| Run | Init | Strength | Control | Steps run | s / step | Minutes (denoise + decode) | What held, what drifted |
|---|---|---|---|---|---|---|---|
_(table filled below)_

Model load 4-13 s and the init's encode 12-17 s come once per process.

## The paint-on: "would it literally just popup?"

## The verdict

## What a hosted model (FLUX on Replicate, with structure control) would likely add

## A whole film, consistently

## Rerun
`bash scripts/look/aipaint/run_ai1.sh` (everything), or `--sheets` (renders and sheets only). Scripts:
`scripts/look/aipaint/` (`fetch_model.py`, `make_inits.py`, `sdxl_paint.py`, `cut_plates.py`, `sheets.py`). The engine's
reveal: `src/lib/paint/reveal.tsx`.
