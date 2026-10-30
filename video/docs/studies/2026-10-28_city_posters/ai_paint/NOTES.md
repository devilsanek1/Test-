# AI-painted background plates: the local test (iteration, 2026-10-29)

**The ask** (owner, 2026-10-29): "I mean let’s try and see if it gets us there"; then "Oh damn we need a separate
service / But you are AI why can’t you do it". So the test ran an open-source image model LOCALLY, in our own container
(4 CPU cores, no GPU, no key, no outside service). The test: `BRIEF.md`; the rule: playbook PAINTED PIECES.

**The owner's pick**, on `trials_sky.jpg` (2026-10-29): "Yeah 0.7 looks reasonable". So `ai_still_v1` uses the 0.70
sky plate (seed 1029). That strength turned our far city into a cloud, so the far roofs and the tower stay OUR design and
the model gives the sky and the clouds.

**Short answer:** it runs here, for free, in about 3 to 4 minutes a plate. The owner's 0.70 sky is the closest we have
come to the references in mood and depth: soft, layered dusk clouds lit gold by the low sun. It is still not their
painting: its clouds are soft, cottony airbrush, not a few big deliberate strokes. And at that strength it ignores our
layout (the far city, the tree), which we keep or control. Details: "The verdict". And yes, a painted plate can PAINT ON
stroke by stroke in the opening instead of popping up (`reveal_strip.jpg`).

| File | What |
|---|---|
| `ai_still_v1.png` (= `deliverables/tests/ai_painted_scene1_still_v1.png`) | v2's S1 at 1.0 s, 1080 x 1920: our v4 design with the model's sky and clouds (0.70) and its tree (0.70 with structure control), placed through the engine; the far city and everything else ours and crisp |
| `trials_sky.jpg`, `trial_sky_*.jpg` | the sky-plate trials, one seed: our design (the init), img2img alone at 0.40 / 0.55 / 0.62 / 0.70, then with structure control (canny) at 0.68 and 0.75 |
| `compare.jpg` | 1 v2 flat (as shipped), 2 our painter's `paint_still_v4`, 3 `ai_still_v1`, 4 ref 03, 5 ref 02 |
| `reveal_strip.jpg` | the owner's "would it literally just popup?": 4 stills of the paint-on (no video yet) |

## The model and its licence
- **SDXL base 1.0** (`stabilityai/stable-diffusion-xl-base-1.0`, revision `462165984030d82259a11f4367a4eed129e94a7b`),
  licence **CreativeML Open RAIL++-M**: commercial use allowed, with its Attachment A use restrictions. No fallback to SD
  1.5 was needed.
- **Structure control** (the canny trials and the tree): `xinsir/controlnet-canny-sdxl-1.0` (revision
  `1271357eda52d54b857c650cacb5b51144643ccb`), licence **Apache-2.0**: commercial use allowed. It is fed OUR design's
  canny edges, never a reference image.
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
   - The trials' init (the 0.70 pick's too) has the stage's sun disc on top; `sky_init_nosun.png` (the 0.62 and canny
     runs) has none. The scene draws its crisp `SunDisc` UNDER the far roofs, so a painted sun can land inside the
     far-roofs piece. In the pick it cannot, because the far roofs are ours.
2. **Paint** (`sdxl_paint.py`): img2img from our init's VAE latents (the mean, so it is deterministic), DPM++ 2M Karras,
   30 scheduler steps (img2img runs `int(30 x strength)` of them), CFG 6.5, **seed 1029 for every run**. With
   `--control`, the canny ControlNet at conditioning scale 0.6 on our own edges (OpenCV canny of the init: blur 1.6,
   thresholds 18/48).
3. **Cut and place** (`cut_plates.py`): each plate goes back to frame scale with Lanczos and is cut into the ENGINE's own
   pieces: the same box as our v4 design piece, under that piece's own alpha (our silhouettes). That makes the set `ai1`
   (`public/paint/v2s1_ai1/` + `manifest.json`; each row logs its painter, strength and seed).
   - From the model: the sky and `clouds_p0..p3` (the `clouds` group, far to near), and the tree (the near plane).
   - Ours (`--keep-design farroofs,fartower`): the far roofs and the tower, so the far city lines up with our layout
     exactly; and the pier.
   - Each piece sits through `PaintedLayer` / `PaintedGroup` in its own plane's group (`PaintS1 set: 'ai1'`).
   - Her, the people, the door and its "Google" sign, Pip, the sun disc and the captions are drawn by the scene on top,
     crisp and ours.

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
blurry. The 0.68 canny run adds: border, frame, vignette, stripes, banding.

## The runs: minutes per plate, what held, what drifted

Every run used seed 1029. "Minutes" is the denoise plus the fp32 decode. The model's load (4-13 s from a warm disk; 222 s
after the container restart, from a cold disk at about 10 MB/s) and the init's encode (11-17 s) come once per process.
Each run's full settings are in the JSON beside its PNG (`out/aipaint/<plate>/<name>.json`, not committed).

| Plate | Strength | Control | Steps | s / step | Min | What held, what drifted |
|---|---|---|---|---|---|---|
| sky | 0.40 | none | 12 | 10.9 | 2.8 | Everything held. Only the far roofs soften into vertical washes; the clouds stay our flat shapes. It reads as our design. |
| sky | 0.55 | none | 16 | 10.5 | 3.3 | Held. The far roofs turn into horizontal dusk-haze strokes, the sun into a smudge, and the cloud edges get a thin lit rim. The crescent and the flat bands stay: still graphic. |
| sky (no sun) | 0.62 | none | 18 | 8.1 | 2.7 | Mostly held, still graphic. Drift: the tower's painted ghost grows from y 586 up to about y 405, into the caption band behind "She"; a new small cloud at the right edge; soft new clouds at the horizon. |
| **sky: the owner's pick** | **0.70** | none | 21 | 7.4 | 2.9 | **The most beautiful:** a soft, layered dusk, the near cumulus big and lit gold, the far banks paler. But it is the model's own sky: our 4 planes are replaced by its clouds, the far city turns into a cumulus (so it is kept from our design), and a new cloud sits in the caption band right of "Google." (beside the words, never behind them). The first try was killed for memory at its decode; dropping the text encoders and freeing the UNet before the decode fixed that. |
| sky (no sun) | 0.68 | canny 0.6 | 20 | 11.7 | 4.3 | Our shapes held, the tower too. Soft broad washes in one lavender-rose-peach family, dry vertical strokes in the far haze, a slight paint grain on the clouds' flat fills. Drift: cooler and bluer at the top, a soft pink band under the words, a darker 4 px rim along the top edge. |
| sky (no sun) | 0.75 | canny 0.6 | 22 | 10.4 | 4.1 | Our shapes held: every cloud plane, the crescent, the far city and the tower. Real strokes appear, but the sky turns saturated blue at the top, bands into stripes, and gets a dark painted rim along the top edge (luma 116 against 178). |
| tree | 0.70 | none | 21 | 5.4 | 2.1 | Drifted into a different picture: a flat two-green tree on a hill with a fence, a sun in the sky. Cut by our silhouette, it leaves sky-coloured holes in the crown and loses the trunk, and it is no more painted than our design. Not used. |
| **tree: in the still** | **0.70** | **canny 0.6** | 21 | 9.3 | 3.6 | Our form held: the lit and the shade mass, the accent lobe, the trunk. The lit mass turns a warmer olive-yellow and the left lobe darker, with a faint paint grain, so it is barely more painted than our design. The reeds and the pale dot in front of the tree were painted into the crown (the scene's own crisp reeds and dot cover them), and there is a tiny grey tick on the crown's top. |

Peak memory was about 10 GB with the ControlNet. The session's limit is 14.3 GB, and the page cache counts against it.

**The still, measured:**
- **Captions:** behind "She quit Google." (x 150-800, y 330-480) the sky's mean luma is 205 (our design: 207; v2: 206)
  and its 5th percentile is 198, against the ink's 30. The words read as before.
- **The top edge:** at 0.70 the top rows are luma 170 against the design's 178, with no rim, so there is no paper edge.
- **How much changed:** 32 % of the frame's pixels differ from our v4 design stage by more than 3/255 (all of it above y 1100, the sky's, except the 4.4 % below it that is the tree).

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
  - the far haze (here our design's own pieces, so nothing changes there);
  - the tree last: dabs curling round the crown, the shade side first and the lit side last.
- **Deterministic:** the same seed gives the same strokes, so nothing swims. At progress 1 the plate is drawn unmasked.
- **Motion later** is the same code driven by time: `reveal={{from, to, windows, under}}` in scene seconds. In a film it
  would run right after the flood (for example 0.6 to 1.8 s), with the voice already going.
- **The catch:** the reveal reads best when the plate keeps our shapes. The 0.70 sky is the model's own sky, so midway a
  painted cloud appears beside one of our flat clouds before the strokes cover the flat one. In motion that reads as the
  sky being repainted, not as our sky being painted in.

## The verdict
**Not yet. But the sky moved further than anything we have tried.**
- **What it gets right.** The owner's 0.70 sky has what our own painter did not reach in four versions:
  - real depth in the clouds: a big near cumulus lit gold from the low sun, paler and flatter banks behind it, a soft
    far haze;
  - soft painted edges, in our dusk colours, that read at phone size;
  - and it costs nothing but CPU time: about 3 minutes a plate here.
- **Where it falls short of 03 and 02:**
  - the finish is soft, cottony airbrush: smooth gradients and fluffy edges, the look of stock digital matte painting.
    The references are built from a few big deliberate strokes with dry, broken edges;
  - the references hold one bold colour family and a strong value plan (plum masses against a lit horizon; blue strokes
    on navy). Ours stays pale pastel, so its clouds read soft rather than designed;
  - the painted sky now sits over a flat vector world: two languages in one frame, where the references are painted
    throughout.
- **Control.** Img2img alone has a cliff between 0.62 and 0.70:
  - below it, our shapes survive and almost no paint is added;
  - at 0.70 the model paints its own picture. That is fine for clouds (the owner's pick), but it ate the far city (kept
    ours here) and turned the tree crop into another landscape;
  - structure control (canny on our edges) holds every shape, at the cost of a weaker, banded paint (the 0.68 and 0.75
    sky trials). The tree in the still uses it.
- **So:** keep the AI route for skies and clouds (free-form, curated by seed), with every built thing and every story
  layer ours. On its own it does not give the references' brush language. That needs a stronger model with structure
  and style control (below), or a style model trained on paintings we own.

## What a hosted model (FLUX on Replicate, with structure control) would likely add
- **Prompt adherence.** FLUX's T5 text encoder follows long style descriptions far better than SDXL's CLIP, which
  stops at 77 tokens. "A few broad deliberate strokes, dry-brush edges, one plum colour family" is more likely to land,
  with fewer fluffy defaults.
- **Structure control built for it.** FLUX.1 Canny and Depth are Black Forest Labs' own structural models ([pro] through
  the API, [dev] as weights). They keep our layout at a high denoise, so the 0.70-level paint would come without losing
  the far city or the tree: exactly the trade-off this test hit.
- **A style anchor.** FLUX Redux (an image prompt) can take one approved plate of OURS as the style reference for every
  other plate. Never the owner's references.
- **Speed, and so choice.** Seconds per plate on a GPU instead of about 3 minutes here, so 10 to 20 seeds per plate to
  choose from, at a few cents each (check Replicate's current prices).
- **Resolution.** About 1 to 2 MP natively, so a full 1080 x 1920 plate without the 768-wide upscale.
- **What it would not fix:**
  - the stroke vocabulary is still the model's, so matching 02 and 03's brushwork may still need a LoRA trained on
    paintings we own or license;
  - it needs the key (`REPLICATE_API_TOKEN`, in a new session) and a network call per plate;
  - licences, to check before production: FLUX.1 [pro] and [1.1 pro] are API models whose outputs may be used
    commercially; FLUX.1 [dev]'s weights are under a non-commercial licence that still lets its outputs be used
    commercially; Replicate's terms apply on top.

## A whole film, consistently
- **One prompt and one negative per film** (the style in words), plus one strength (0.70 for skies) and one control
  scale (0.6 for built things and trees), all fixed.
- **One seed per plate,** logged in the manifest (a new seed is a new painting of the same layout): choose it from a
  small batch per shot, then lock it.
- **The same layout source per shot:** our design (the designed flat pieces) and its canny edges. Skies may run free;
  buildings and trees always run under control or stay ours.
- **A style anchor:** the first plate the owner approves becomes the reference for the rest (an IP-Adapter locally,
  FLUX Redux hosted). Never the owner's references.
- **Paint per plane, with a bleed margin:**
  - the sky without its clouds, each cloud plane apart, the far haze, each tree;
  - each painted beyond the frame's edge (so no canvas rim) and cut by our alpha;
  - so each rides its own plane, can drift later, and paints on.
  - Today's sky plate is one image cut into its planes, so a drifting cloud would leave its painted twin behind in the
    sky piece. Paint the planes apart before any motion.
- **Re-bake on any design change:** about 3 to 4 minutes a plate here, seconds on a GPU.
- **Cost:** nothing but CPU time here (about 9 GB of weights on disk, outside the repo); a few cents a plate hosted.

`npm run typecheck`: one error, in `src/lib/figure/model.ts` (another lane's people work, not touched here). The paint
code (`src/lib/paint/`, `src/look/paint_s1/`) is clean.

## Rerun
`bash scripts/look/aipaint/run_ai1.sh` runs everything; `--sheets` runs only the renders and the sheets. The scripts are
in `scripts/look/aipaint/` (`fetch_model.py`, `make_inits.py`, `sdxl_paint.py`, `cut_plates.py`, `sheets.py`), and the
engine's reveal is in `src/lib/paint/reveal.tsx`.
