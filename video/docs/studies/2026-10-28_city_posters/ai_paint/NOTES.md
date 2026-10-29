# AI-painted background plates: the local test (iteration, 2026-10-29)

**The ask** (owner, 2026-10-29): "I mean let’s try and see if it gets us there"; then "Oh damn we need a separate
service / But you are AI why can’t you do it". So the test ran an open-source image model LOCALLY, in our own container
(4 CPU cores, no GPU, no key, no outside service). The test: `BRIEF.md`; the rule: playbook PAINTED PIECES.

**Short answer:** it runs here, for free, in about 4 minutes a plate, and with structure control it paints OUR design
(every cloud plane and silhouette holds). It does not get us to the references yet: the paint it adds is soft, generic
digital painting (broad airbrushed washes, a faint grain), not their few big deliberate strokes. Details: "The verdict".
And yes, a painted plate can paint on stroke by stroke in the opening instead of popping up (`reveal_strip.jpg`).

| File | What |
|---|---|
| `ai_still_v1.png` (= `deliverables/tests/ai_painted_scene1_still_v1.png`) | v2's S1 at 1.0 s, 1080 x 1920: our v4 design with its sky plate (the sky, 4 cloud planes, the far haze) and its tree painted by the model; everything else ours and crisp |
| `trials_sky.jpg`, `trial_sky_*.jpg` | the sky-plate trials, one seed: our design (the init), img2img alone at 0.40 / 0.55 / 0.62 / 0.70, then with structure control (canny) at 0.68 (the pick) and 0.75 |
| `compare.jpg` | 1 v2 flat (as shipped), 2 our painter's `paint_still_v4`, 3 `ai_still_v1`, 4 ref 03, 5 ref 02 |
| `reveal_strip.jpg` | the owner's "would it literally just popup?": 4 stills of the paint-on (no video yet) |

## The model and its licence
- **SDXL base 1.0** (`stabilityai/stable-diffusion-xl-base-1.0`, revision `462165984030d82259a11f4367a4eed129e94a7b`),
  licence **CreativeML Open RAIL++-M**: commercial use allowed, with its Attachment A use restrictions. No fallback to SD
  1.5 was needed.
- **Structure control:** `xinsir/controlnet-canny-sdxl-1.0` (revision `1271357eda52d54b857c650cacb5b51144643ccb`),
  licence **Apache-2.0**: commercial use allowed. It is fed OUR design's canny edges, never a reference image.
- **How it runs:** diffusers 0.42.1 (`StableDiffusionXLImg2ImgPipeline`, `StableDiffusionXLControlNetImg2ImgPipeline`),
  torch 2.15.0+cpu, transformers 5.22.0, Python 3.13. The UNet, the ControlNet and the text encoders run in bfloat16
  (this Xeon has AMX-BF16, so bf16 is fast on the CPU); the VAE encodes and decodes in fp32. Safetensors only; no remote
  code.
- **Weights:** outside the repo, in `/tmp/hf-cache` (fp16 safetensors: SDXL 6.5 GB, fetched in 32 s; the ControlNet 2.5
  GB, in 66 s). The python env is `/tmp/aipaint/venv`. Neither is committed.

## The method (the design is ours; the model only paints it)
1. **Init = our design** (`make_inits.py`): our painter's v4 DESIGN stage (`public/paint/v2s1_v4design/`): the flat dusk
   sky, its 4 cloud planes, the far roofs and the tower; the tree as a lit and a shade mass.
   - The **sky plate** is 768 x 1344 (SDXL-native portrait) = frame rows 0..1890 at one uniform scale (0.711). The scene
     covers the sky below y 1100, so those rows are a calm mirror of the sky: context the model reads as "sky over
     water", never used.
   - The **tree** is 768 x 768 = the stage around the tree (x 0..340, y 1215..1555, scale 2.26).
   - The trials' init had the stage's sun disc on top. The final init has none (`sky_init_nosun.png`): the scene draws
     its crisp `SunDisc` UNDER the far roofs, so a painted sun lands inside the far-roofs piece, over the crisp one (seen
     in a test render).
2. **Paint** (`sdxl_paint.py`): img2img from our init's VAE latents (the mean, so it is deterministic), DPM++ 2M Karras,
   30 scheduler steps (img2img runs `int(30 x strength)` of them), CFG 6.5, **seed 1029 for every run**. With
   `--control`, the canny ControlNet at conditioning scale 0.6 on our own edges (OpenCV canny of the init: blur 1.6,
   thresholds 18/48).
3. **Cut and place** (`cut_plates.py`): each plate goes back to frame scale with Lanczos and is cut into the ENGINE's own
   pieces: the same box as our v4 design piece, under that piece's own alpha (our silhouettes). That makes the set `ai1`
   (`public/paint/v2s1_ai1/` + `manifest.json`, each row logging its painter, strength and seed): the sky; `clouds_p0..p3`
   (the `clouds` group, far to near); `farroofs` and `fartower` (the far planes); the tree (the near plane). Each sits
   through `PaintedLayer` / `PaintedGroup` in its own plane's group (`PaintS1 set: 'ai1'`). Her, the people, the door
   and its "Google" sign, Pip and the captions are drawn by the scene on top, crisp and ours. The pier stays our
   design's. The plate's top 6 rows take row 6 (`--edge-repair 6`): the model paints a thin darker rim along a canvas
   edge, and the rule is no paper edge at the top of the frame. The proper fix: paint plates with a bleed margin.

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
blurry. The pick (and the tree) add: border, frame, vignette, stripes, banding.

## The runs: minutes per plate, what held, what drifted

Every run used seed 1029. "Minutes" is the denoise plus the fp32 decode. The model's load (4-13 s from a warm disk) and
the init's encode (12-17 s) come once per process. Each run's full settings are in the JSON beside its PNG
(`out/aipaint/<plate>/<name>.json`, not committed).

| Plate | Strength | Control | Steps | s / step | Min | What held, what drifted |
|---|---|---|---|---|---|---|
| sky (trial init) | 0.40 | none | 12 | 10.9 | 2.8 | Everything held. Only the far roofs soften into vertical washes; the clouds stay our flat shapes. It reads as our design. |
| sky (trial init) | 0.55 | none | 16 | 10.5 | 3.3 | Held. The far roofs turn into horizontal dusk-haze strokes, the sun into a smudge, and the cloud edges get a thin lit rim. The crescent and the flat bands stay: still graphic. |
| sky | 0.62 | none | 18 | 8.1 | 2.7 | Mostly held, still graphic. Drift: the tower's painted ghost grows from y 586 up to about y 405, into the caption band behind "She"; a new small cloud at the right edge; soft new clouds at the horizon. |
| sky (trial init) | 0.70 | none | 21 | 7.4 | 2.9 | The most beautiful trial: a soft, layered dusk with a gold-lit cumulus. But it is the model's own sky: our 4 planes are replaced, the far city turns into a cumulus, and a new cloud sits in the caption band beside "Google.". (The first try was killed for memory at its decode; fixed by dropping the text encoders and freeing the UNet before the decode.) |
| sky | 0.75 | canny 0.6 | 22 | 10.4 | 4.1 | Our shapes held: every cloud plane, the crescent, the far city and the tower. Real strokes appear, but the sky turns saturated blue at the top, bands into stripes, and gets a dark painted rim along the top edge (luma 116 against 178). |
| **sky: the pick** | **0.68** | **canny 0.6** | 20 | 11.7 | 4.3 | **Our shapes held** (the tower too). There are soft broad washes in one lavender-rose-peach family, dry vertical strokes in the far haze, and the clouds' flat fills take a slight paint grain. Drift: the colour runs a little cooler and bluer at the top, with a soft pink band under the words (the band's luma is 208 against the design's 210, its spread 3.8 against 1.8, so the ink reads); the top 4 px have a darker rim (repaired). |
| tree | 0.68 | canny 0.6 | _(pending)_ | | | _(pending)_ |

Peak memory was about 10 GB with the ControlNet. The session's limit is 14.3 GB, and the page cache counts against it.

## The paint-on: "would it literally just popup?"
**No: it paints on.** `reveal_strip.jpg` is 4 stills of the same scene at 1.0 s, where only the paint-on changes: 1 our
flat design, 2 a third revealed, 3 two thirds, 4 done.
- **The engine helper** is `src/lib/paint/reveal.tsx` (`RevealMask`, `revealStrokes`, `revealProgress`), wired into
  `PaintedLayer` and `PaintedGroup` through `<PaintProvider reveal>`.
- **How it works:** each painted piece is drawn over its flat design (the `under` set, here v4design) through an SVG mask
  of SEEDED brush strokes. Each stroke is a broad curved path with bristle strokes along its sides, roughened into a
  dry-brush edge, and it is laid from its start to its end, in painting order.
- **The painting order** (`S1_REVEAL_WINDOWS` in `PaintS1.tsx`):
  - the sky washes first: long rows, top to bottom, alternating direction;
  - the cloud planes, far to near;
  - the far haze: roofs in rows, the tower in columns from the ground up;
  - the tree last: dabs curling round the crown, the shade side first and the lit side last.
- **Deterministic:** the same seed gives the same strokes, so nothing swims. At progress 1 the plate is drawn unmasked.
- **Motion later** is the same code driven by time: `reveal={{from, to, windows, under}}` in scene seconds. In a film it
  would run right after the flood (for example 0.6 to 1.8 s), with the voice already going.
- **The catch:** the reveal only reads as "our design being painted" when the plate keeps our shapes. A drifted plate
  (the 0.70 trial) reveals a different sky over ours, with two clouds where one should be mid-reveal. Another reason the
  pick is the structure-controlled one.

## The verdict
_(below)_

## What a hosted model (FLUX on Replicate, with structure control) would likely add
_(below)_

## A whole film, consistently
_(below)_

## Rerun
`bash scripts/look/aipaint/run_ai1.sh` runs everything; `--sheets` runs only the renders and the sheets. The scripts are
in `scripts/look/aipaint/` (`fetch_model.py`, `make_inits.py`, `sdxl_paint.py`, `cut_plates.py`, `sheets.py`), and the
engine's reveal is in `src/lib/paint/reveal.tsx`.
