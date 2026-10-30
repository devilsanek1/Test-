# ORGANIC PROOF: four v6 pieces repainted so they stop reading "square and proper" (iteration, stills, 2026-10-30)

The owner (2026-10-30), on the list of differences between still v6 and the references: "5 and 6 and 7 think that's
the biggest difference we need to find a way to solve properly. It feels like a lot of our design is too square and
proper like I can see shapes and angles very clearly while references are obviously not like that. They are more regular
more naturally blend Do deep research into techniques libraries etc"; on point 4: "I think we need to find a balance I
think even in the references the close objects are more sharp while further objects are more like brushes and painting";
and "Again let's start with stills", "No video yet".

**What this is.** The proof step after the five research reports in this folder (`techniques.md`, `libraries.md`,
`shapes.md`, `light.md`, `composition.md`): their top-ranked techniques and libraries and the shape rules, applied to
four pieces of v6's scene 1 ("She quit Google.", 1.0 s): the near cumulus, the near tree, the facade by the doorway and
the paving of our bank. Each piece is one baked image placed by the ENGINE in its own plane's slot
(`src/look/organic_s1`), so her, Pip, the props, the door and the captions are the scene's own, drawn over it, crisp. An
iteration for the owner's eye, stills only; nothing here is a rule until it is integrated (`docs/look/ORGANIC.md`,
`PAINT_RECIPES.md`, `CRAFT.md`). Methods are learned from the references; no reference is copied, traced or used as an
input to any picture here, and no living artist is a style target.

| File | What |
|---|---|
| `organic_proof.png` | THE sheet: each piece v6 beside the new one at full size (1:1) and at 400 px (the phone's width), with its numbers; then the whole frame before and after (half size and 400 px) |
| `organic_proof_metrics.json` | every number below (per piece and for the whole still), the bake's stats and md5s, the determinism check, the render cost |
| `scripts/look/organic/` | the code: `organic_proof.py` (the driver), `piece_cloud.py`, `piece_tree.py`, `piece_facade.py`, `piece_paving.py`, `oc_lib.py` (noise, colour, regions, the stroke plan, the MyPaint bridge), `mypaint_bake.mjs` (the brush), `organic_sheet.py` (numbers + sheet), `render_inputs.sh` (the engine renders), `bench_render.py` (the cost) |
| `src/look/organic_s1/` | the engine side: `OrganicScene.tsx` (v6's scene with the four slots), `OrganicS1.tsx` (the shell + the bake's flat inputs), `entry.tsx`, `organic_set.ts`, `paint/*.ocpaint.png` + `paint/manifest.json` (the four baked pieces, 0.5 MB) |

## 0. Bottom line

- **The whole still moves toward the references on two of the three numbers** (`techniques.md` section 1's method, the
  same code): long straight edges 26.5 -> 16.7 % (references 1-13 %), dead-flat area 35.3 -> 30.8 % (references
  0-20 %); razor edges only 22.0 -> 18.5 % (references 0.3-4.6 %), because most of the frame's razor edges are in what
  was not touched (her, the props, the far city, the boats, the water's marks, the captions).
- **Per piece, on the shapes lane's own crops** (section 2): the cloud's compass arcs 27 -> 1 % and its clear
  geometry 26 -> 0 px per 100 x 100; the facade's ruler lines 54 -> 23 % and straight edges 76 -> 49 %; the paving's
  ruler lines 68 -> 15 % (the target) and straight 80 -> 35 %, its dead-flat area 29 -> 11 %. The tree is simpler (small
  shapes 38 -> 18 % of its area, 182 -> 58 shapes in its crop) but its edges are now cleaner than v6's confetti, not
  softer (section 2.2): it needs the owner's eye more than the others.
- **The owner's balance is built in:** the cloud (the farthest painted piece) gets the most brush, lost edges and the
  softest marks; the facade (the subject's plane) keeps its frames, the door and W found and crisp (the door, the fascia
  and W are holes in the piece: the scene's own layers); the paving's marks grow with perspective; her, Pip and the
  captions are untouched (measured: 0 change on her; the caption words' rows: 1 px of 1 level).
- **What reads at phone size** (the sheet's 400 px column): the cloud and the paving clearly read painted and organic;
  the tree reads as one painted mass instead of a cluster of crisp clumps; the facade's change is subtle at 400 px
  (painted piers and glass, the same clean building).
- **The honest new problem it shows:** once the ground and the tree are painted, the props that stay flat vector (the
  planter, the crates, the café set, the bench, the pier, the fern pot) read pasted on it; the playbook's "one painted
  language for the whole frame" now points at them (design-time organic props, or fewer props: `composition.md` R6).
- **Cost:** the bake is 26-28 s on one core for the four pieces (MyPaint 0.5-2.7 s each); at render, +30-70 ms per
  frame (+5-12 % over v6's 544-588 ms) on this shared machine, two images new (the facade, the paving), two replacing
  v6's own (the cloud, the tree); nothing runs per frame but the images (section 4).
- **Deterministic:** two bakes give the same bytes for all four pieces (md5), and the engine's frame renders to the
  same bytes twice.

## 1. What was used (ranked by the research), and where

| Technique or library (research rank) | Where | How |
|---|---|---|
| Organic geometry by design (`techniques.md` rank 1; `shapes.md` 3.1-3.2) | all four | the cloud's outline re-cut at the cloud octaves (`shapes_gen.displace`, the short octave kept); the tree's crown in three levels on a size ladder (a body, 4 lobes, half-sunk clumps, a flat underside); the facade's and the paving's long lines given a sub-pixel hand-ruled bow (no wobble on man-made shapes); each pane its own reflection and glow (no template); the paving's joints broken into pieces with lost gaps and faded ends, each flag its own value |
| Edges by intent, lost and found (rank 2) | all four | the cloud and the tree: found and crisp where the silhouette faces the low sun, lost (the cloud) or broken by dark leaves (the tree: a blurred edge on foliage reads as a drop shadow) away from it, alternating along the outline by a slow noise; the facade and the paving: short flat-brush strokes laid along an edge where its two faces meet at a close value (< 10 L* on the facade, < 6 L* on the paving), from one side or the other; found edges kept where the step is big |
| Colour and light inside shapes (rank 3) | facade, paving, tree | a ramp toward the low sun inside every face (+-2.5-3 L*, warmer toward it) and a slow FastNoiseLite mottle; the glass a sky reflection from its top; the tree lit as one form with clumps catching the light |
| Marks by intent through MyPaint (rank 4; `libraries.md` rank 1) | all four | `mypaint_bake.mjs`: peinten 1.3.0's libmypaint port with CC0 brushes (`tanda/acrylic-04-paint` the flat blocky stroke, `ramon/wet_round` the wash, `classic/blending_knife` across lost zone edges, `deevad/brush` the crisp accent, `tanda/acrylic-03-with-water` the dry level stroke); every mark planned by our code from the design (where, which brush, which colour, why); on the facade and the paving every mark clipped to its own face (or the two faces of a lost edge), so nothing smears across a frame or a prop |
| A raster warp on a baked natural piece (rank 7) | cloud | v6's own painted cloud displaced by FastNoiseLite fBm at 150 / 60 / 24 / 12 px (RMS 7 px): every billow's arc and v6's big disc arc become free curves; the base only slides level |
| FastNoiseLite (`libraries.md` rank 2) | all four | `pyfastnoiselite` 0.0.7 (MIT): the warp, the terminators, the mottle, the bow, the shadow outlines |
| Not used | | Kuwahara, LIC, generic Hertzmann, watercolour edge darkening (filters on our flat design: `techniques.md` ranks 8-9), live filters (rank 10), p5.brush, Spectral.js, Mixbox (non-commercial) |

## 2. The pieces (v6 -> organic, on the shapes lane's crops; the painted references' targets from `shapes.md` 6)

### 2.1 The near cumulus (`piece_cloud.py`)
The owner liked v6's cloud ("AI generated cloud certainly fits"), so this REPAINTS v6's own painted plane
(`public/paint/v2s1_v6/clouds_p3.png`) instead of designing a new one (two from-scratch designs were tried first: a
per-billow light read as a pile of balls, a mass light as torn paper). Warped at the cloud octaves, its outline re-cut
(more ragged away from the sun, the level base and the frame's cut edges kept), edges found toward the sun and lost along
the base and the shade side with short level dry-brush teeth between, then 201 MyPaint marks with colours sampled from
the painting itself (flat strokes along the billows where the form turns, knife strokes across the old disc's arc, crisp
accents on the lit edge, dry strokes in the base). The caption block stays clear (it fades out over y 299-318 left of
x 985, as v6's did).

| Crop `ours_cloud` | v6 | organic | painted refs |
|---|---|---|---|
| compass arcs | 27 % | **1 %** | <= 10 % |
| free curve | 73 % | 95 % | 84 % median |
| corners per 100 px (jags, breaks) | 0.71 | **1.99** | 1.88 median |
| clear geometry (px per 100 x 100) | 26 | **0.2** | <= 15 |
| crisp visible edges | 1 % | 8 % | 15-40 % (only where the light hits) |
| lost mass edges | 14 % | 11 % | 15-25 % |
| broken mass edges | 7 % | 13 % | >= 20 % |
| mirror symmetry | 0.42 | 0.52 | <= 0.65 |

How close: the geometry is there (no compass, the jags and breaks of a painted cloud); the edges are still softer and
less broken than the references' bold dry-brush clouds, and the marks are calm (a dose choice: the owner's "subtle and
more beautiful"); the next dose step is bolder, fewer strokes on the lit side and a ragged found top.

### 2.2 The near tree (`piece_tree.py`)
A new crown at v6's place and size (v6's tree was "a poster tree in a painted frame": 67 % small shapes, confetti): a
body, 4 lobes on a ladder (the biggest toward the light), clumps half sunk, small clumps sitting on their clump's outline,
a flat underside with two shallow bites; lit as one form with each clump's cap catching the light (quantile value zones:
deep 20 / shade 30 / mid 28 / lit 22 %), the zones melted into each other (no razor seams), then MyPaint marks: washes
inside the masses, each clump's lit cap painted along its arc, a dark stroke under the front clumps, leaves reaching out
past the outline all round (light on the lit side, dark on the shade side); a bowed, tapered trunk (`shapes_gen.limb`).

| The tree alone on a flat ground (no planter, no paving lines) | v6 | organic | painted refs |
|---|---|---|---|
| small shapes, share of the area | 38 % | **18 %** | 34 % (the posters' trees 76 %) |
| shapes in the crop | 182 | **58** | few medium masses |
| compass arcs | 2 % | 6 % | <= 5 % |
| crisp visible edges | 31 % | 40 % | <= 30 % |
| lost mass edges | 1 % | 2 % | >= 7 % |
| broken mass edges | 53 % | 21 % | >= 35 % |

On the shapes lane's crop `ours_tree` (it holds the planter's straight rim and the paving's lines too) the numbers are
in the json; they move the same way. How close: the crown is now a few medium masses in the painted language (the
shapes lane's main point), but v6's confetti measured as "broken" and this crown's leafy edge is cleaner than the painted
references' soft trees; it also lost some of v6's crafted clump detail. The owner's balance asks a near thing to be
sharper, so a cleaner edge than the cloud's is by intent; whether it now "fits the style" is the owner's call.

### 2.3 The facade by the doorway (`piece_facade.py`)
v6's exact wing (the engine's flat render, `OrganicFlat` 'wing', with its shades baked in), 1227 faces: a sub-pixel
hand-ruled bow (0.55 px at 140 px, 0.25 px at 50 px: a majority filter to wear the corners was dropped, it ate the thin
frames), each pane its own state (a sky reflection at its own strength, on some a diagonal sheen at its own place, the lit
interiors glowing from their own top), a ramp toward the sun in every face, then 224 blocky flat-brush marks along the
piers and bands (vertical on the piers, level on the bands; light marks only on the glass), 55 strokes over the lost
edges between big faces of close value, 140 tufts on the roof planting. Every mark is clipped to its own face's colour
(the first try, clipped to the whole wing, smeared the frames into a melted, torn building). The door's frame and lobby,
the fascia (its letters still pop) and W (the story's next subject) are holes: the scene's own crisp layers.

| Crop `ours_facade` | v6 | organic | painted refs | posters |
|---|---|---|---|---|
| straight | 76 % | **49 %** | 29 % [24-53] | 47 % |
| ruler lines | 54 % | **23 %** | 6 % (target <= 15 %) | 15 % |
| right-angle corners | 40 % | 33 % | 21 % (target <= 25 %) | 28 % |
| crisp visible edges | 55 % | 52 % | <= 60 % | |
| broken mass edges | 22 % | 24 % | 58 % (target >= 40 %) | 61 % |
| mirror symmetry | 0.78 | 0.72 | 0.55 (target <= 0.65) | 0.63 |
| clear geometry | 63 | **44** | (not a gap) | |
| razor edges, straight (Hough), dead-flat (techniques.md 1) | 40 / 44 / 20 % | **27 / 20 / 10 %** | | |

How close: the straightness halved and the flat fields went, without losing the clean premium building; but its
corners, symmetry and broken edges barely moved, and at 400 px the change is subtle. The levers left are the design's
(`shapes.md` 3.2): a turned two-point view of the wing, overlaps (a branch, a person, a lamp in front of a long edge),
windows that differ in size and state, edges broken along their length by value (a pier lost into the sky's value).

### 2.4 The paving of our bank (`piece_paving.py`)
v6's coping, landing, five treads, their lips and flags (geometry from `OrganicFlat` 'bands'; colours from the scene
itself, `OrganicS1` 'noProps': some flags render a step paler there), with: the bow, each flag its own value (+-1-3.5
L*), the joints broken into pieces with lost gaps and faded ends, the bank lit toward the sun and the canal, 800 MyPaint
strokes along the treads toward the vanishing point (sized by `groundScale`: big near, fine toward the canal), 189
strokes lapping across the nosings where the lip and the tread meet at a close value. The props' ground shadows are
recovered exactly from two engine renders (the frame / the frame with the ground's shadows off: their ratio is the
shadow), continued under the props by inpainting, then given natural outlines (displaced at 70 / 26 / 11 px) and a soft
penumbra, and baked into the piece; the scene draws the props over it without those shadows.

| Crop `ours_paving` | v6 | organic | painted refs |
|---|---|---|---|
| straight | 80 % | **35 %** | <= 40 % |
| ruler lines | 68 % | **15 %** | <= 15 % |
| crisp visible edges | 70 % | 67 % | <= 45 % (the crisp props are in this crop, by intent) |
| lost mass edges | 1 % | 2 % | >= 10 % |
| broken mass edges | 14 % | 19 % | >= 40 % |
| mirror symmetry | 0.87 | 0.82 | <= 0.65 |
| razor edges, straight (Hough), dead-flat, this window | 7.5 / 37 / 29 % | 8.4 / 24 / **11 %** | |

How close: the ruler lines and the dead-flat field reach the references' range; the masses do not yet melt (lost 2 %)
and the marks are crisp-edged (the acrylic brush's own edge: razor edges rise a little). Against the painted ground the
flat props now read pasted (section 0).

## 3. The whole frame

| Whole still, `techniques.md` 1 | v6 | organic | references |
|---|---|---|---|
| razor edges | 22.0 % | 18.5 % | 0.3-4.6 % |
| straight (Hough >= 60 px) | 26.5 % | 16.7 % | 1-13 % (the beach's horizon 27 %) |
| dead-flat (31 px) | 35.3 % | 30.8 % | 0-20 % |

The v6 column reproduces `techniques.md`'s numbers exactly (the same code on the same still). The four pieces cover
roughly half the frame; inside them the gaps close by half or more (section 2); the rest of the still (the far city,
the water, the boats, the props, the leaf branch, the mid cloud bank, the caption field) is v6 and holds most of the
remaining razor edges and flat area. The caption band is untouched (her, Pip, the captions: the scene's own; the only
changes inside the caption block's rows are the cloud's base right of the words, x 849-984, y 299-344, where v6's cloud
already was). What it does not touch: the composition (the frame is as busy as v6: `composition.md`'s R1-R12 are the
next lane), the light (`light.md`), people.

## 4. Cost

| | Measured (this machine: 4 shared cores, no GPU) |
|---|---|
| bake, one core | the cloud 2.3 s, the tree 1.7 s, the facade 6.7 s, the paving 16.4 s (its Python: region cleaning, the joints, the shadow inpaint); MyPaint's share 0.5-2.7 s per piece |
| render, per frame | v6 544 / 579 ms, organic 609 / 647 ms (two alternating runs of 40 frames, `render-frames.mjs`, GL=angle, concurrency 1): +65 ms; a third pair 553 / 588 against 574 / 634 (the machine's load 2-3): within the noise. So **+30-70 ms per frame, +5-12 %**. Split per piece (`bench_render.py --split`): every single piece within the ~40 ms noise |
| why | two images are new (the facade 780 x 525 over the wing, the paving 1080 x 780 replacing the vector treads); the cloud and the tree replace v6's own images; nothing is filtered or re-baked per frame. `light.md` 7 measured a full-frame image at ~40-70 ms on this renderer; v6's own lib/light layers cost ~340 ms |
| size | 0.52 MB of PNGs (the cloud 92 KB, the tree 47 KB, the facade 116 KB, the paving 262 KB) |
| motion | not rendered (stills only); every piece rides its own plane's group (see 5) |

## 5. Determinism, and what motion would need (stills only here)
- **Seeded:** every random draw comes from a sha256 of a string key (`oc_lib.seeded`, `seed_int`), MyPaint takes one
  seed per stroke and runs on fixed-point tiles: two bakes give the same bytes for all four (md5 in the json); the engine
  frame renders to the same bytes twice.
- **Locked to its layer:** each image is drawn inside its plane's group (the cloud in the sky's, the facade in the
  subject's, the paving in the bank's, the tree in the near plane's), so it rides the float like the shapes it replaces.
  Known gaps before a moving test: the near things' ground shadows are baked into the bank's piece (the bank floats at
  0.85 of the near plane: up to ~1.8 px of slip at the float's 12 px); the facade's pane that switches on at 3.90 s is
  baked in its 1.0 s state (two bakes, or a hole); the door's sliding leaves, the fascia's letters, her, W and the
  pigeons stay live; the cloud is static (v6's was too).

## 6. In the engine (how a film would use it)
`src/look/organic_s1/OrganicScene.tsx` is v6's scene (`src/look/paint_s1`, untouched) copied at the three places that
need a slot: the sky things (the organic cloud over v6's far and mid planes), the world (the facade over the wing, under
the sliding leaves; the wing's shades go quiet: they are baked in) and our bank (the paving in place of the stone bands,
the bench over it, the near things' ground shadows off: baked in; the tree in the near plane's `under`). With
`organic: false` it renders v6's still to the byte (checked). The pieces are bundle imports (`*.ocpaint.png`), not
`public/` files. The bake's inputs come from the engine itself: `OrganicFlat` renders one piece's flats alone in the
scene's contexts, and the decomposition variants (`groundUnlit`, `noProps`, `noPip`) give the exact shadows and masks.

## 7. Flags for the orchestrator (found here, not edited)
- **`lib/paint` `PaintedLayer` loads pieces through `staticFile`**, so a piece must live under `public/`; a bundle import
  (a URL) cannot be passed. This proof drew its own image (`OrganicImage`); a `src` that is already a URL (or an
  `href` prop) in `PaintedLayer` would let every film keep its pieces next to its code.
- **The ground's shadows baked into a ground piece** (2.4) and `light.md`'s plan (one multiply light map per plane, the
  static shadows folded in, `light.md` 7): the same shadows must not be baked twice. Proposal: the light lane's map
  owns the shadow values; a painted ground takes only their natural outlines (or the map takes this piece's).
- **"One painted language" now reaches the props** (section 0): the playbook's PAINTED PIECES ("a lone painted object
  among flat vector pieces reads pasted in") applies the other way round once the big masses are painted.
- **`shapes.md` 3.2's "corners worn 2-3.5 px"** by a majority filter on a flat render erodes thin frames and mullions
  (4-8 px): wear corners at design time, per shape, not on the raster.
- No clash found with the playbook, DIRECTION, CRAFT or PAINT_RECIPES: the pieces are our own deterministic passes,
  locked to their layers, never a filter over the frame, the subject and people crisp, the film works with them off.

## 8. Libraries and licences (a commercial channel; checked 2026-10-30)

| Library | Use | Licence | Where it lives |
|---|---|---|---|
| peinten 1.3.0 (a TypeScript port of libmypaint) | the brush engine (`mypaint_bake.mjs`) | MIT (NOTICE carries libmypaint's ISC) | `npm install` in the scratch, never in the repo's package.json |
| mypaint-brushes 2.0.2 | the brush presets (data) | CC0 1.0 | the GitHub release tarball, in the scratch |
| pyfastnoiselite 0.0.7 (FastNoiseLite) | all noise | MIT | a venv in the scratch |
| numpy, SciPy, OpenCV, scikit-image (through the shapes lane's measures), Pillow | the bake, the measures, the sheet | BSD-3 / BSD-3 / Apache-2.0 / BSD-3 / MIT-CMU | the system's |
| Inter, DejaVu | the sheet's labels | SIL OFL 1.1 / Bitstream Vera | the system's fonts |
| Never: Mixbox (CC BY-NC 4.0), LYGIA (Prosperity), GPL tools | | | |

## 9. Rerun
From `video/`, with the scratch tools (nothing installs into the repo):
```bash
S=/tmp/organic/organic_proof; mkdir -p $S/npm $S/data
python3 -m venv --system-site-packages $S/venv && $S/venv/bin/pip install pyfastnoiselite==0.0.7
(cd $S/npm && echo '{"private":true}' > package.json && npm install --ignore-scripts peinten@1.3.0)
curl -sSL -o $S/data/b.tar.xz https://github.com/mypaint/mypaint-brushes/releases/download/v2.0.2/mypaint-brushes-2.0.2.tar.xz && tar xf $S/data/b.tar.xz -C $S/data
$S/venv/bin/python -B scripts/look/organic/organic_proof.py          # renders, bake, after frames, numbers, sheet (~6 min)
$S/venv/bin/python -B scripts/look/organic/organic_proof.py --check  # bake twice, compare md5
$S/venv/bin/python -B scripts/look/organic/bench_render.py 40 2      # the render cost (cost.json in the scratch)
```
The still alone: `GL=angle node scripts/render-frames.mjs OrganicS1 <dir> 1.0 --entry=src/look/organic_s1/entry.tsx`
(`--props='{"organic":false}'` = v6's still).
