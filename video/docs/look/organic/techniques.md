# ORGANIC techniques: how a picture reads as painted, not geometric (research, 2026-10-30)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "4 I think we
need to find a balance I think even in the references the close objects are more sharp while further objects are more
like brushes and painting / 5 and 6 and 7 think that's the biggest difference we need to find a way to solve properly.
It feels like a lot of our design is too square and proper like I can see shapes and angles very clearly while
references are obviously not like that. They are more regular more naturally blend Do deep research into techniques
libraries etc / 9 that seems solvable too?" (5 = brushwork with intent, 6 = shape variety and rhythm, 7 = lost-and-found
edges, 9 = an overall texture). The playbook rule this feeds: "ORGANIC, NOT GEOMETRIC" (`docs/OWNER_PLAYBOOK.md`).

**What this is.** The TECHNIQUES lane of the organic research: which rendering and painting techniques make an image
read as naturally painted, how each would run in our stack, what it costs per 1080 x 1920 frame (measured on this
machine, which is also our render machine), whether it is deterministic, whether it moves well in a video, and a
ranking for our case. Libraries are the sibling lane (`libraries.md` in this folder); here only the libraries a
technique needs. **Rank:** research notes, the lowest rank (DIRECTION's ladder); nothing here is a rule until it is
integrated into `docs/look/ORGANIC.md`, `CRAFT.md` or `PAINT_RECIPES.md`. We learn methods; no reference is copied,
traced or used as input (they are only measured), and no living artist is a style target.

| File | What |
|---|---|
| `techniques.md` | this report |
| `techniques_sheet.jpg` | 12 panels on our own v6 still and a test facade: four filters against the techniques by intent (§3) |
| `techniques_demo.py` | the seeded proof script: the sheet (default), `--bench` (cost per operator on a full frame, one core), `--measure` (the §1 numbers) |
| `techniques_chrome_bench.html`, `.js` | the live-filter, WebGL and vector cost tests in the render's headless Chrome (§3.7, §3.12) |
| `techniques_motion.py` | the motion check of §3.13 (the float, x264; the same numbers on a rerun) |

## 0. Bottom line

- **"Too square and proper" is three measurable things** (§1, at phone scale, ours and the references through the same
  JPEG codec): **razor edges** (22 % of our edges have a 10-90 % width under 1.5 px; the references 0.3-4.6 %, the
  posters 1.2-4.5 %), **long ruler lines** (26.5 % of our edge pixels lie on straight runs of 60 px or more; the
  references 1-13 %, except the beach horizon at 27 %), and **dead-flat fields** (35 % of our non-edge area is flat over
  31 px; the human-scale and paint references 0-20 %, the posters 0-40 %). Those three numbers are the check for every
  next still (§6).
- **Every filter we tried reads as a filter on our flat design** (sheet, panels 2-3 of rows 1-2): the anisotropic
  Kuwahara softens and deletes detail, adds no brushwork; generic Hertzmann strokes give an "oil paint filter" of round
  dabs; a flow-aligned (LIC) texture everywhere is the "even streaky texture" the playbook bans; watercolour edge
  darkening draws outlines. The literature agrees: these are abstraction filters for photographs and video (source 9),
  and our design is already abstract. A studio that got a painterly look said it plainly: "if you want a painterly
  bush, paint the bush" rather than filter a realistic one (source 20). The libraries lane finds the same for every
  stock filter it tried (`libraries.md`, in progress at the time of writing).
- **What works is by intent, per layer, decided by the design** (sheet, panel 4 of each row): (1) organic geometry at
  design time (no two windows alike, hand-cut straight edges, natural silhouettes, overlaps); (2) edges by intent:
  each edge's hardness from its value step, its tier, its plane and the light, lost edges broken by dry-brush teeth
  along the brush direction; (3) colour and light moving inside each shape (a falloff from the story light, warm and
  cool, a dappled shade); (4) brush marks by intent with a brush ladder stopped early on far planes (far = coarse
  marks = "more like brushes"); (5) a texture locked to each plane (CRAFT §c's Mottle, already built). On the demo
  crops these move the numbers the right way: crisp edges 28 -> 9 % (far crop) and 10.5 -> 3.3 % (near crop),
  dead-flat 29 -> 15 % (near), with the subject and the props still crisp.
- **The owner's balance (point 4) has a name and a method:** stylized focus (sources 16, 17): detail and found edges
  where the viewer should look and near; lost edges and coarse marks elsewhere and far. One dose table by plane and tier
  drives every technique (§5.4).
- **Cost:** every ranked technique is a vector change (+7-13 ms per frame for 300 hand-cut outlines, measured as a full
  parse and raster) or a per-layer bake (0.2-0.6 s per full-frame layer per operator on one core; the Hertzmann ladder
  2.8-13.6 s), so 0 ms at render. Live SVG filters cost +40-100 ms per filtered full-frame layer per frame; WebGL runs
  on SwiftShader here (no GPU; `remotion.config.ts` uses `swangle`): a simple warp shader 0.2-0.3 s per frame, the
  anisotropic Kuwahara 15-17 s per frame. Nothing ranked runs per frame.
- **Motion:** a baked, plane-locked treatment costs +6 % H.264 bitrate under the float (measured); a texture everywhere
  +108 %; re-seeding each frame (boil) +112 % and visibly boils: never.
- **Licences:** everything ranked runs on numpy, OpenCV (Apache-2.0), SciPy (BSD-3) and our own code; the optional JS
  pieces are MIT. Never: Mixbox (CC BY-NC 4.0), LYGIA (Prosperity licence: non-commercial unless a paying patron),
  Shadertoy snippets (CC BY-NC-SA 3.0 unless stated otherwise); pykuwahara is GPL-3.0 (usable as a tool, not needed).
- **Next step:** an ITERATION still v7 (one agent, about an hour): v6 + design variation on the facade and the paving +
  edges by intent on the ground, the far city and the clouds + light ramps and one dappled shade; judged by the owner at
  phone size beside v6; the three numbers measured (§6).

## 1. The gap in three numbers (measured)

`techniques_demo.py --measure`. Every image is resized to 1080 px wide and re-encoded JPEG q85, so ours and the
screenshots carry the same codec; the UI (mute buttons, counters, the lighthouse post's phone chrome and palette) is
masked or cropped out. **Edge width** is the step across the edge (L*, 9 x 9 window) over the gradient, calibrated on
synthetic edges: crisp = a 10-90 % width under ~1.5 px, soft = over ~3.8 px; only edges with a step of 8 L* or more are
counted (lost edges wider than ~10 px are not detected at all). **Straight** = the share of edge pixels on Hough
segments of 60 px or more (gap 3 px). **Flat31** = the share of non-edge pixels whose L* varies by under 0.35 over
31 x 31 px.

| Image | crisp edges | soft edges | straight | flat31 |
|---|---|---|---|---|
| **v6 still (ours)** | **22.0 %** | 36.8 % | **26.5 %** | **35.3 %** |
| human-scale 01 city hill | 0.8 % | 81.0 % | 1.1 % | 0.0 % |
| human-scale 02 bus stop | 1.2 % | 83.0 % | 6.2 % | 0.5 % |
| human-scale 03 beach dusk | 4.6 % | 49.9 % | 26.6 % (the horizon) | 9.0 % |
| human-scale 04 cloud beast (9:16; upscaled 1.5x) | 0.3 % | 61.4 % | 6.7 % | 19.9 % |
| paint 01 beach van | 1.5 % | 69.7 % | 4.4 % | 0.3 % |
| paint 02 lighthouse | 1.8 % | 60.9 % | 2.6 % | 18.1 % |
| posters 01-07 | 1.2-4.5 % | 65.5-76.3 % | 2.8-12.7 % | 0.1-39.9 % |

**Reading.** The razor-edge share is the clearest gap: ours is 5 to 70 times every reference's, the "geometric"
city posters included (they read clean, yet only 1-5 % of their edges are razor-sharp: their edges are firm, broken by
texture). Straightness is partly content (a canal city has long lines, the beach has its horizon), but the posters, full
of buildings, stay at 3-13 % because their long lines are broken and varied. Flatness: the references' big quiet areas
are not dead flat; colour moves in them. Caveats: the references are phone screenshots (rescaled, re-compressed), which
softens them a little; the gap in razor edges is too large for that to explain.

**On the demo crops (§3's sheet), before -> after the techniques by intent:**

| Crop | crisp | straight | flat31 |
|---|---|---|---|
| far crop (sky, far city, tower, bridge; the facade crisp) | 28.1 -> 9.3 % | 33.8 -> 24.8 % | 15.3 -> 12.2 % |
| near crop (paving and props; the props crisp) | 10.5 -> 3.3 % | 33.0 -> 29.1 % | 29.2 -> 14.6 % |
| test facade, design A (perfect grid) -> D (varied, lit, edges by value) | 92.5 -> 41.8 % | 55.7 -> 34.3 % | 39.6 -> 28.7 % |

The straight share barely moves under a raster treatment: long ruler lines are a DESIGN property (the paving's joints
cross the whole frame). Only the design can break them (§3.9).

## 2. What the references do (methods, learned, not copied)

- **One contour, several edges.** The beach-dusk cloud (`refs_human_scale/03`) is crisp and ragged on top where it
  meets the lit sky and dissolves at its base; the bus-stop cloud (02) is big soft strokes, crisp only on its lit rim;
  the reeds (02) are a dark mass whose top breaks into wind-blown strokes. Edges are hard near the focus and the light,
  lost where two values meet (source 22: "decide the hard edges first, everything else soft").
- **Teeth go with the brush.** Dry-brush raggedness points along the stroke (horizontal on the beach sky, along the
  form on the lighthouse post, `refs_paint/02`): an edge parallel to the strokes stays clean, an edge across them goes
  ragged. A random wobble in every direction is not that (it reads melted).
- **Man-made stays straight, but drawn.** The bus shelter and the lighthouse are straight and clean, yet nothing is
  ruler-perfect: their edges vary in weight and value along their length, the lighthouse's marks break at their ends,
  and no two parts repeat.
- **Fills are never dead flat.** Colour moves with the light (the red lamp's falloff on the shelter and the ground in
  02; the sunset's warmth along the cloud undersides in 03) and with a few broad strokes.
- **Depth:** the subject and the near world are sharp; the far is fewer, broader marks and lost edges (the owner's
  balance). In 02 the nearest reeds are out of focus: "near" means the subject's plane, not the frame's edge.
- **Variety and overlap:** big, medium, small; nothing repeats; shapes overlap (reeds over the shelter's base, foam
  over sand, people over the sea), so silhouettes are broken by other things.

## 3. The techniques, one by one

The sheet (`techniques_sheet.jpg`, 2160 x 1752; rerun: `python3 docs/look/organic/techniques_demo.py`, same bytes every
run): row 1 = v6's far crop (frame x 0-540, y 560-1100), row 2 = v6's near crop (x 360-900, y 1340-1880), row 3 = a
test facade. Panels 1 = as is, 2-3 = filters, 4 = by intent. Costs: one core, a full 1080 x 1920 frame, best of 1-2
runs (`--bench`); Chrome numbers from the render machine's headless shell with SwiftShader (§3.12).

### 3.1 Stroke-based rendering (Hertzmann curved strokes, Litwinowicz, Meier, Hays and Essa)
- **What it is.** Paint the picture with discrete strokes from a reference: coarse brushes first, finer brushes only
  where the canvas still differs from the reference by more than a threshold; each stroke follows the isophote (normal
  to the gradient), bends with a curvature filter, and takes the reference's colour (source 1; survey: source 2).
  Litwinowicz clips strokes at edges and moves them by optical flow (3); Meier sticks strokes to surfaces as particles so
  they never slide over the image, the "shower door" (4); Hays and Essa constrain every stroke property over time (5).
- **Look on our design** (row 1, panel 3: a compact Hertzmann, radii 12/6/3): round dabs everywhere, an "oil paint
  filter". On a flat, pale design the coarse passes erase the low-contrast far city, and the fine passes rebuild the
  vector shapes as blobs. It never adds intent: the strokes go wherever the reference has an edge.
- **Our stack.** A Python bake (`paint.py` already is a Hertzmann-style painter, with bristle and flat chisel stamps).
  **Cost:** radii 14/8: 9,859 strokes in 2.8 s; 12/6/3: 58,245 strokes in 13.6 s (paint.py's own v1 sky: 4,946 strokes
  in 8.8 s). Deterministic (seeded order and jitter). **Motion:** perfect once baked per layer; per-frame stroke
  animation needs Meier / Hays-Essa machinery and never pays for us.
- **Verdict: keep it as the MARK MAKER, never as a filter.** Inside designed masses, a few strokes by intent (PAINT_
  RECIPES §1: big soft strokes, then flat chisel marks along the form, then a few crisp accents). The owner's balance
  maps onto its brush ladder: **far planes stop after the coarse brushes** (visible broad marks = "more like brushes"),
  near planes run more passes or keep the design. Rank 4.

### 3.2 Flow fields (structure tensor, edge tangent flow)
- **What it is.** The smoothed structure tensor gives each pixel the direction along its edge and an anisotropy; the
  edge tangent flow (ETF) smooths it into coherent streamlines (source 8; also the base of the anisotropic Kuwahara,
  source 6). Where there is no edge, a default direction by material: the wind for sky, haze and water, the
  perspective lines for paving, vertical for facades, the growth for foliage.
- **Cost:** 0.32 s per frame (numpy, OpenCV). Deterministic. It moves nothing by itself.
- **Verdict:** infrastructure for §3.1 and §3.6 (stroke and tooth directions). Part of rank 2 and 4.

### 3.3 The Kuwahara family (generalized, anisotropic)
- **What it is.** Each pixel takes the mean of the least-varying sector of its neighbourhood: flat patches with
  brush-like boundaries. Papari's generalized version uses smooth sectors and is stable on noise (7); the anisotropic one
  stretches the sectors along the local flow, so the patches follow the form (6; real time on a GPU, polynomial weights
  in the 2010 follow-up; oil-paint systems build on it, 10).
- **Look on our design** (row 1, panel 2, r 7, 8 sectors, 8 orientation bins): it softens everything a little and
  deletes small detail (the flock, railing posts, window panes merge); it adds no strokes, because our fills are already
  flat. On a textured or photographic plate it does make painterly patches.
- **Cost:** numpy: generalized r6 2.3 s, anisotropic r6 21.4 s per frame (binned approximation). WebGL on our renderer
  (SwiftShader): 15-17 s per frame (measured, r 4-6), so never live; a real GPU would run it in milliseconds.
  Deterministic. **Motion:** a per-frame Kuwahara flickers on moving content (its sector choice flips); baked per
  layer it is static.
- **Verdict: rank low (8).** Its one use for us: unify a plate that is not ours in style (an AI-painted background, a
  photo texture) before our own edges and marks, at bake time.
- **The other stock painterly filters, measured on the full frame (OpenCV, one core):** `cv2.stylization` (a
  domain-transform filter, 1.8 s) draws dark contour lines and washes the far planes out (outlines: off-brand);
  `cv2.edgePreservingFilter` (0.5 s) and a bilateral filter (0.18 s) only smooth; `cv2.pyrMeanShiftFiltering` (4.1 s)
  flattens our fills further, more vector, not less. The XDoG / flow-DoG line filters (8) make ink lines, which CRAFT
  §c forbids. Same verdict for all of them.

### 3.4 Flow-aligned texture (line integral convolution)
- **What it is.** Convolve noise along streamlines of the flow field, so the noise becomes streaks along the form
  (source 24); oil-paint filters use it to synthesize a paint texture (10).
- **Look** (row 2, panel 2, 14 steps each way, clipped at region edges as Litwinowicz clips strokes): an even streaky
  texture over everything: the filter look the playbook bans ("never an even streaky texture over everything").
- **Cost:** 1.1 s per frame. Deterministic. **Motion:** +108 % H.264 bitrate under the float (§3.13): high-frequency
  texture is what codecs pay for.
- **Verdict: rank 9.** At most a faint tooth (<= 0.5 L*) inside one painted mass, never everywhere.

### 3.5 Watercolour and gouache simulation (edge darkening, granulation, wet-on-wet, dry brush, gaps and overlaps)
- **What it is.** Curtis et al. simulate water, pigment and paper (shallow-water flow, Kubelka-Munk glazing) to get
  dry brush, edge darkening, backruns, granulation, flow and glazing (11): far too heavy and too wet for us. Bousseau et
  al. get the look as image effects: abstraction, then a pigment-density modulation C' = C (1 - (1 - C)(d - 1)) driven
  by paper, turbulence and edge-darkening textures (12). Montesdeoca et al. add art-directed dry brush and "gaps and
  overlaps" and control every effect per object (13). Hobbs builds watercolour washes from 30-100 layers of recursively
  deformed polygons at ~4 % opacity, varying the deformation where the edge should be soft (19).
- **Look** (row 2, panel 3, our density op: edge darkening + paper + turbulence): every region boundary gets a dark
  line (an outline, which CRAFT §c forbids on every tier) and the fills get stains. Off-brand as a whole.
- **Granulation** (pigment settling in the paper's valleys) is a paper texture modulating the density: for us a grain,
  which CRAFT §c caps at 0.25 L* std (the posters' subtlest grain already costs +48 % bitrate and shimmers at 720p).
- **What to keep, selectively:** dry brush (= §3.6's teeth and paint.py's dry tails); **wet-on-wet bleed** for vapour
  only (a cloud's base, haze into sky: a lost edge with a soft, blooming fringe); **Hobbs' layered deformed polygons**
  for soft vapour shapes (a glow, a mist bank) as a bake; **gaps and overlaps** only as a design accent (a misregistered
  fill, which `lib/Fill.tsx` already supports), never as an outline.
- **Cost:** our density op 0.10 s per frame; Hobbs' layers are cheap to bake (polygon fills). Deterministic. Static
  when baked. **Verdict: rank 6 (the selected parts only).**

### 3.6 Lost-and-found edges by intent (the edge pass)
- **What it is.** The painter's rule: hard edges where the eye should go and where the light separates values, soft
  and lost edges where two values meet, in shade and far away; one contour alternates found and lost stretches (22).
  Gaze research backs it: keep detail where viewers look and drop it elsewhere (17); vary line and shading quality by
  distance from the focus to steer the eye (16, "stylized focus").
- **Our operator** (`edge_teeth_maps` in the proof script): each edge's hardness = its value step (found at >= 14 L*,
  lost at <= 4 L*), times its tier and plane; a slow noise along the contour alternates lost and found stretches; lost
  edges break into sparse, tapered **dry-brush teeth along the brush direction** (a tooth ~5 px wide and ~28 px long,
  sampled nearest at 2x and box-reduced, so its flecks stay crisp, never blurred); every edge gets a 0.3-1 px
  hand-ruled wobble. The dose comes per pixel from the caller (the engine knows each layer's plane, tier and
  material).
- **Look** (row 1 panel 4: far planes lose their edges into horizontal teeth, the tower and the bridge keep their
  silhouettes, the facade stays crisp; row 2 panel 4: the paving's joints and the cast shadows break and melt along the
  paving's lines while the table, chairs, crate and planter keep their found edges). Measured: crisp edges 28 -> 9 %
  and 10.5 -> 3.3 %.
- **Its limits, honestly.** Displacement is a proxy for strokes: long teeth on thin features (a chair leg, a lamp
  post) look torn, so thin props get small doses; an earlier version that displaced pixels in random directions read
  as a glitch, and a Gaussian softening read as out of focus (both dropped). At 1:1 the far crop shows a second limit:
  on a regular pattern (the far terrace's row of windows, the tower's straight sides) horizontal teeth read as a wavy
  distortion rather than paint; at phone size it is nearly invisible, but the right order is to simplify the far
  design first (windows merged and tone-on-tone, CRAFT §f.2) and tooth only what is left. The quality route for near
  and mid painted pieces is **edge strokes** (§5.2): flat stamps laid along the edge, their dry tails across it.
- **Cost:** 0.55 s per full-frame layer (2x supersampled), deterministic (md5 checked). **Motion:** baked and locked
  to its plane: +6 % bitrate, no boil. Teeth must stay >= 2 px wide: thinner flecks twinkle in the float (CRAFT §c,
  "Thin lines twinkle").
- **Verdict: rank 2.** It is the direct answer to point 7 and to "naturally blend".

### 3.7 Noise-displaced and eroded silhouettes
- **What it is.** Push an outline along its normals by fractal noise; a domain warp (noise sampled at a point already
  displaced by noise, fbm(p + 4 q(p))) gives the curling, eroded, cloud- and rock-like forms (18). Natural edges are
  fractal; people rate mid-range fractal dimensions (about 1.3-1.5) highest in natural images (23; with individual
  differences and exceptions for exact fractals, 25), while a ruler line is dimension 1.0.
- **Two rules by material.** **Natural shapes** (foliage, clouds, rocks, shadows, water edges, reeds): a multi-scale
  warp, 3-4 octaves, amplitude about 3-6 % of the shape's size, big, medium and small lobes. **Man-made shapes:** never a
  noise wobble; a HAND-CUT contour instead: each side a few straight
  cuts with small angle changes, corners slightly off 90 degrees (our early tests: a noise wobble on furniture and
  railings read melted). Our engine has both already, for the frame edge:
  `src/lib/edges/rough.ts` `cutPoly` (hand-cut) and `organic` (a smooth normal wobble), plus `smoothClosed`.
- **Cost:** vector: 300 shapes with 48-point hand-cut outlines rasterize in 14-20 ms against 7 ms as plain rects
  (Chrome, two runs; 1,500 shapes: 56-61 against 22-24 ms), so +0.01-0.04 s per frame. Raster (a baked piece's mask): a nested
  warp field 0.17 s + 0.02 s remap. Seeded per object. **Motion:** the outline is fixed per object and rides its layer;
  re-seeding it per frame is boil (CRAFT: "no boil").
- **Verdict: rank 1 (as part of the design), rank 7 as a raster pass on a baked piece.**

### 3.8 Colour and light moving inside a shape
- **What it is.** Painters never leave a big shape one colour: the value and temperature drift with the light (lit
  side warmer and lighter, away cooler), and a few broad strokes vary it. Our operator `shape_light`: each region gets a
  ramp toward the key light (+-2.2-2.8 L*), a warm/cool shift (+-0.8-1.0 on OKLab b) and a very soft mottle; and the
  strongest organic cue for a big flat: **a dappled shade** (a tree's leaf shadow, window light) laid over it, which
  breaks the geometry with a natural shape (row 3, panel 3).
- **Our stack.** Vector first: an SVG `linearGradient` per face oriented to the key (the sky already uses one,
  `lib/sky.tsx`), dithered per CRAFT §g.4 so it never bands; a dappled shade as one static shadow shape per plane
  through `lib/light.tsx`'s multiply tint family. Bake for painted pieces (`shape_light`, 0.43 s given the regions; the
  regions come free from the design's layers, a k-means on a composite costs 7.7 s).
- **Motion:** gradients and shade shapes ride their layers; a dappled shade may sway slowly as one shape (like the
  tree's sway, PAINT_RECIPES §4.5). **Cost:** ~0 per frame.
- **Verdict: rank 3.** It answers "flat fills" (with §3.6, the near crop's flat31 went 29 -> 15 %) and supports
  PROPER LIGHT's falloff. Doc clash flagged in §8.

### 3.9 Organic geometry by design (shape variety, repetition with variation, overlaps)
- **What it is.** The shapes themselves: big, medium, small; no template repeated (each window its own width, tilt
  within 0.3-0.4 degrees, glass state: lit, dark, sky-reflecting, a curtain); hand-ruled mullions and hand-cut edges;
  overlaps that break silhouettes (a branch, a person, reeds); joints and seams that stop, vary and break instead of
  crossing the frame. Production painterly films did the same at the source: shapes modelled as strokes and
  splatters rather than filtered geometry (20, 21: "edge breakup" designed into the look).
- **Look** (row 3: panel 1 a perfect grid; panel 2 the same grid with seeded variation and hand-ruled mullions). The
  biggest single step on the sheet, and the only technique that moves the straight-line share (55.7 -> 40.2 %).
- **Our stack.** Vector, in the engine, seeded per object (`lib/rng.ts`), reusing `edges/rough.ts` and `sketch.ts`
  (`blob`, `smooth`, `crown`). **Cost:** +0.01-0.04 s per frame (§3.7). **Motion:** perfect.
- **Verdict: rank 1.** It is where "square and proper" is decided; every raster technique after it adds 20-30 %.

### 3.10 Depth-based softness: near crisp, far brushy
- **What it is.** The owner's balance as a parameter ladder: per plane (CRAFT §f.2's planes) and tier, the dose of
  every technique above: found and lost tooth lengths, the hand-ruled wobble, the brush ladder's finest radius, the
  light ramp, the silhouette warp, the mottle. It is the stylized-focus principle (16, 17) applied to planes rather than
  a camera blur (an optical depth-of-field blur is a different thing; we keep it only for out-of-focus framing objects,
  PAINT_RECIPES §3 C3). The table: §5.4.
- **Cost:** the sum of the parts. **Motion:** a plane's dose is fixed; a focus pull (animating the dose) is possible in
  principle (16's "stylized focus pull") but would need per-frame bakes: not now.
- **Verdict: the frame that ranks 2 and 4 hang on.**

### 3.11 An overall texture (point 9)
- **What it is.** The paper-and-paint grain and mottle. Already specified and built: CRAFT §c's paper-and-paint test
  (mottle <= 0.5 L* in 30-70 px blotches, by plane 1.0 / 0.7 / 0.4, none in the caption band, grain at most 0.25 L*)
  and `lib/texture.tsx` `<Mottle>` (an SVG feTurbulence in the plane's user space, so it rides the plane and never
  boils).
- **Why per plane:** a texture fixed to the screen while the picture moves is the "shower door" (4); the dynamic-canvas
  work shows a static canvas fights the sense of motion (15); the temporal-coherence survey names the three goals any
  texture must meet together: flatness, coherent motion with the content, temporal continuity (14); a noise that
  follows the motion is its own research primitive (26). A plane-locked texture meets all three for free. CRAFT
  measured the price: plane-locked mottle +27 % bitrate, screen-locked 6.2x, re-seeded each frame 14x.
- **Cost:** live filter, about +55-65 ms per filtered full-frame layer per frame (our grain-overlay measurement, §3.12).
- **Verdict: rank 5.** Solvable as the owner guessed, with the tool we have; dose by look test.

### 3.12 Live per-frame filters (SVG filters, WebGL shaders)
- **Measured on the render machine** (Playwright + the Remotion headless shell, `--use-angle=swiftshader`; a full
  1080 x 1920 image drawn through an SVG filter into a canvas, best of 3, two runs on the shared machine): no filter
  53-68 ms; feTurbulence (3 octaves) + feDisplacementMap 142-154 ms (+74-101); a fine anisotropic displacement 124-127
  ms (+56-74); feGaussianBlur sigma 3 109-115 ms (+41-62); a grain overlay 118-122 ms (+54-65). WebGL2 on
  ANGLE/SwiftShader (the GPU string reads "SwiftShader Device (Subzero)"): a full-frame copy 47-62 ms; a nested
  domain-warp shader 201-297 ms; the anisotropic Kuwahara (tensor, 2 blur passes, filter) 14.5-16.8 s.
- **Look:** a live displacement reads as a wobble, not as brushwork (NOTES' finding, confirmed); it also resamples the
  layer every frame.
- **Verdict: rank 10.** Only for things that must move: a cloud's slow churn (displacing its baked image a few px), a
  water shimmer. Never for edges or texture that could be baked.

### 3.13 Motion check (how each moves in a video)
A 540 x 540 crop under the parallax float (3 x 1.5 px sine, 4 s, 60 fps, bilinear like the browser's image draw),
x264 CRF 18:

| Variant | kbit/s | vs v6 |
|---|---|---|
| v6 as is | 387 | - |
| by intent, baked and locked (row 2 panel 4) | 410 | +6 % |
| LIC texture everywhere (row 2 panel 2) | 807 | +108 % |
| the same edges re-seeded every frame (boil) | 821 | +112 %, and it boils |

### 3.14 Neural and AI stroke painters, style transfer
- Learned stroke painters and parameterized-brushstroke style transfer paint FROM an image (the filter problem again),
  need a GPU for reasonable speed, and their licences vary (not verified here: GitHub was not reachable from this
  session, so none may be adopted without a licence check). The AI-painted plate is its own lane
  (`docs/studies/2026-10-28_city_posters/ai_paint/BRIEF.md`). **Rank 11:** not for this problem.

## 4. Ranking for our case

| Rank | Technique | Owner's points | Runs in | Render cost / frame | Bake cost (one core) | Seeded | Motion | Risk |
|---|---|---|---|---|---|---|---|---|
| 1 | Organic geometry by design: variety, no template, hand-cut man-made edges, natural silhouettes, overlaps (§3.9, §3.7) | 6, 5-7 | vector (engine) | +0.01-0.04 s | - | yes | perfect | melted man-made shapes if noise-wobbled; use hand-cut |
| 2 | Edges by intent: lost and found by value, tier, plane, light; dry teeth along the brush (§3.6) | 7, 4 | bake per layer | 0 | 0.55 s per layer | yes | +6 % bitrate | torn thin features; teeth < 2 px twinkle |
| 3 | Colour and light inside shapes: ramps to the key, warm/cool, a dappled shade (§3.8) | 5, 8-9, PROPER LIGHT | vector gradients; bake for painted pieces | ~0 | 0.43 s | yes | perfect | banding (dither), crescents; doc clash §8 |
| 4 | Marks by intent + the brush ladder stopped by plane (far = coarse) (§3.1, §3.10) | 5, 4 | bake (paint.py) | 0 | 2.8-13.6 s per full frame | yes | perfect | the filter look if image-driven and everywhere |
| 5 | Texture locked to each plane (Mottle) (§3.11) | 9 | live SVG filter (built) | ~+55-65 ms per layer | - | yes | +27 % (CRAFT) | shimmer and bitrate if grain is added |
| 6 | Watercolour parts: wet-on-wet bleed on vapour, layered deformed polygons, gaps and overlaps as an accent (§3.5) | 5, 7 | bake | 0 | ~0.1 s | yes | perfect | outlines (edge darkening: never) |
| 7 | Raster silhouette warp on a baked natural piece (§3.7) | 6 | bake | 0 | 0.2 s | yes | perfect | over-warp |
| 8 | Anisotropic Kuwahara, to unify a foreign plate (§3.3) | - | bake | never live (15-17 s on SwiftShader) | 21 s numpy | yes | static if baked | blur, lost detail |
| 9 | LIC texture, as a faint tooth only (§3.4) | 9 | bake | 0 | 1.1 s | yes | +108 % if everywhere | the filter look |
| 10 | Live displacement filters, for movers only (§3.12) | - | live SVG / WebGL | +0.06-0.3 s | - | yes | resampled every frame | wobble |
| 11 | Neural stroke painters, style transfer (§3.14) | - | GPU | - | minutes on CPU | mostly | per-frame flicker | licences, filter look |

## 5. In our stack: the plan (PROPOSAL)

### 5.1 Vector, in the engine (ranks 1, 3)
- A small `lib/organic.ts` (to build; names illustrative), seeded through `lib/rng.ts`, reusing `edges/rough.ts`:
  `vary(seed, i, spec)` per-instance jitter (size +-3-4 %, offset +-1.5 px, tilt +-0.35 deg, a state from a palette
  set: lit, dark, reflecting); `handCut(rect | poly)` (`cutPoly`: 2-4 cuts per side, small angle changes, corners off 90
  degrees); `naturalOutline(pts, plane, material)` (`organic` with octaves and an amplitude from §5.4);
  `lightRamp(face, key)` (a `linearGradient` toward the key, CRAFT §g.4's dither); `dapple(plane, box)` (one static
  shade shape through `lib/light.tsx`'s tint family).
- Paving and seams: joints drawn as segments that vary, stop and restart, never one line across the frame.
- Overlaps: one natural overlap per big man-made silhouette (a branch, a figure, reeds, a lamp), designed at G3.

### 5.2 Bake, in `scripts/look/paint/paint.py` (ranks 2, 4, 6, 7)
- An `edges` pass per piece after P0-P3: `edge_teeth_maps` with the piece's dose (§5.4), the brush direction from the
  piece's style (wind, perspective line, vertical, growth), its seed from `rng_for(seed, piece, 'edges')` (PAINT_RECIPES
  §3 C16). On near and mid pieces, prefer edge STROKES where the teeth tear thin features or meet a regular pattern.
- **Edge strokes, the spec (to build; not demonstrated here):** (1) from the piece's design regions, take each boundary
  between two regions A and B whose value step is under the found threshold (14 L*); (2) resample it every ~0.6 of a
  stroke length; (3) at each sample lay one flat-brush stamp (paint.py's `make_flat_stamps`, a dry tail over its last
  25-60 %, PAINT_RECIPES §1.8) of A's or B's colour, chosen by a slow noise along the contour (the lost / found
  rhythm), oriented along the edge where the edge runs with the brush and along the brush where it crosses it, centred
  0.2-0.5 of its width over the edge so it laps onto the neighbour; length 18-40 px and width 4-10 px by plane (§5.4);
  (4) A's strokes, then B's, so the two colours interleave; none on found edges; seeded per (piece, 'edges', A, B).
  Estimated 1-3 s per layer (est.: a few thousand stamps at paint.py's measured stroke rates).
- The brush ladder's finest radius by plane (§5.4); `shape_light` on painted fills; Hobbs-style layered polygons for a
  glow or a mist bank; a raster warp on natural masks.
- Output unchanged: one RGBA PNG per piece, placed by `<PaintedLayer>`, riding its plane; the reveal (`reveal.tsx`)
  paints it on as now.

### 5.3 Live (rank 5, 10)
- `<Mottle>` per plane as built (CRAFT §c). A cloud's slow churn later (NOTES' `churn`). Nothing else per frame.

### 5.4 The dose table by plane and tier (PROPOSAL: first doses for the look test)
Teeth lengths in px at the frame's scale; "found" applies to value steps >= 14 L*, "lost" to steps <= 4 L* (blended
between); teeth are always >= 2 px wide; directions as in §5.2.

| Plane / tier | Found teeth | Lost teeth | Hand-ruled wobble | Brush ladder (radii) | Light ramp in a face | Natural-silhouette warp |
|---|---|---|---|---|---|---|
| The subject (tier A, plane 0) | 0.3 | 0 (<= 2 on its shade side only) | 0.3-0.45 | design + <= 7 crisp accents | +-3-4 L* toward the story light | designed, none added |
| People, Pip | 0 | 0 | 0 | none (their own recipe) | their recipe | none |
| Near world and props (tiers B, C at plane 0 / -1) | 0.2 (thin props) to 0.8 | 6-8 (joints, cast-shadow edges) | 0.5 | design + marks by intent | +-2.5-3 | foliage 6-12 px (cell 40-80) |
| Near frame (-1, -2) | 0.5 | 4 | 0.5 | out-of-focus framing only (blur 2.2-3, PAINT_RECIPES C3) | +-2 | leaves 4-8 |
| +1 | 0.6 | 4 | 0.6 | 10 / 5 / 3 | +-2 | 4-8 |
| +2 | 0.6 | solids 2.5; vapour 8 | 0.7 | 12 / 6 | +-1.5 | 3-6 |
| +3 | 1.0 | solids 2 (tops lost by the sun); vapour 8-10 | 0.9 | 14 / 8 | +-1 | 2-4 |
| +4 | 1.0 | 6 (roof tops); vapour 10 | 1.0 | 14 | +-0.5 | 2-3 |
| Sky clouds | - | the sky recipe's edges (lit 1.8, away 16, base 22 px) + teeth 8-10 along the wind on the away side | - | the sky recipe | the sky recipe | the sky recipe |

### 5.5 Never
A filter over the whole frame; a per-frame Kuwahara, LIC or stroke pass; a texture fixed to the screen or re-seeded
per frame; an outline from edge darkening; a noise wobble on man-made shapes; flecks or lines under 2 px on a floating
plane.

## 6. Checks for the next still (v7, an iteration)
- **The three numbers** (`techniques_demo.py --measure`, the same method on the new still): crisp edges from 22 % toward
  the references' 0.3-4.6 % (a first target <= 8 %, the subject's own edges still crisp: measure inside its box
  separately); straight from 26.5 % toward <= 15 %; flat31 from 35 % toward <= 20 %.
- **Motion:** the float test of §3.13 on the full still: <= +30 % bitrate against v6 (CRAFT's texture budget is +27 %);
  no tooth or line under 2 px on a floating plane.
- **Determinism:** two bakes, the same md5 (the proof script's operators already pass).
- **The owner's eye at phone size** beside v6 and the two models (`refs_human_scale/03`, `02`); the numbers only warn.

## 7. Libraries and licences (what these techniques need; the full survey is `libraries.md`)

| Library | Use here | Licence (checked) |
|---|---|---|
| numpy, SciPy | every bake operator | BSD-3 (installed) |
| OpenCV (`opencv-python`) | remap, filters, distance transforms, k-means | Apache-2.0 (installed, 5.0.0) |
| scikit-image | optional segmentation | BSD-3 (installed) |
| opensimplex, pyfastnoiselite, vnoise | optional noise in Python (we use our own value noise) | MIT (wheel metadata) |
| simplex-noise, fastnoise-lite | seeded noise in JS (FastNoiseLite has a built-in domain warp) | MIT (npm registry) |
| perfect-freehand, roughjs, paper.js, d3-delaunay | variable-width hand lines, sketchy strokes, path booleans | MIT / MIT / MIT / ISC (npm registry) |
| spectral.js | Kubelka-Munk style paint mixing, if colour mixing is ever needed | MIT (npm registry) |
| three, regl, twgl.js, @remotion/three | WebGL, if a live shader is ever needed | MIT (npm registry) |
| **Mixbox** | never | CC-BY-NC-4.0 (npm registry) |
| **LYGIA** | never, unless the channel becomes a paying patron | Prosperity + Patron licence (npm registry) |
| **pykuwahara** | not needed (our own Kuwahara is 40 lines) | GPL-3.0-or-later (0.5.0 wheel metadata) |
| Shadertoy code | never copied | CC BY-NC-SA 3.0 by default |

## 8. Doc clashes found (flagged for the orchestrator, not edited here)
- **`src/lib/light.tsx`'s header** ("a soft edge is 2 flat steps (a half-tint penumbra band), never blur, a gradient or
  an opacity fade") against the playbook's PROPER LIGHT (2026-10-30: "real falloff from it ... a soft glow and gentle
  bloom around the source itself") and PAINTED PIECES ("colour moving within a shape"). The owner's words win; the
  proposed reading: a falloff ramp inside a face (<= +-3-4 L*, dithered) is allowed, the 2-3 flat tones of a volume
  (playbook "Light and shadow") stay readable.
- **The playbook's "Every volume reads in 2-3 flat tones"** sits beside §3.8's ramps: the ramp lives inside each tone
  and must not blur the lit / shade step; the dose is the owner's call on the look test.

## 9. Sources (methods only)
1. Hertzmann 1998, painterly rendering with curved brush strokes of multiple sizes: https://mrl.cs.nyu.edu/publications/painterly98/
2. Hertzmann 2003, a survey of stroke-based rendering: https://www.dgp.toronto.edu/~hertzman/sbr02/hertzmann-cga03.pdf
3. Litwinowicz 1997, processing images and video for an impressionist effect: https://www.cs.princeton.edu/courses/archive/fall00/cs597b/papers/litwinowicz97.pdf
4. Meier 1996, painterly rendering for animation (strokes on surfaces; the shower door): https://www.cs.princeton.edu/courses/archive/fall00/cs597b/papers/meier96.pdf
5. Hays and Essa 2004, image and video based painterly animation: https://faculty.cc.gatech.edu/~hays/papers/IVBPA_Final.pdf
6. Kyprianidis, Kang, Döllner 2009, image and video abstraction by anisotropic Kuwahara filtering: https://umsl.edu/~kangh/Papers/kang_cgf09.pdf (polynomial weights, 2010: https://knowledge.hpi.de/handle/123456789/21576)
7. Papari, Petkov, Campisi 2007, artistic edge and corner enhancing smoothing: https://www.cs.rug.nl/~imaging/artisticsmoothing/java/ArtisticApplet.html
8. Kang, Lee, Chui 2009, flow-based image abstraction (edge tangent flow): https://www.cs.princeton.edu/courses/archive/spr17/cos426/papers/Kang09.pdf
9. Kyprianidis, Collomosse, Wang, Isenberg 2013, a taxonomy of artistic stylization techniques: https://hal.archives-ouvertes.fr/hal-00781502
10. Semmo, Limberger, Kyprianidis, Döllner 2016, image stylization by interactive oil paint filtering: https://dblp.org/rec/journals/cg/SemmoLKD16.html
11. Curtis, Anderson, Seims, Fleischer, Salesin 1997, computer-generated watercolor: https://grail.cs.washington.edu/projects/watercolor/
12. Bousseau, Kaplan, Thollot, Sillion 2006, interactive watercolor rendering with temporal coherence and abstraction: https://hal.archives-ouvertes.fr/inria-00510223
13. Montesdeoca et al. 2017, edge- and substrate-based effects for watercolor stylization: https://diglib.eg.org/handle/10.2312/npar2017a02
14. Bénard, Bousseau, Thollot 2011, state-of-the-art report on temporal coherence for stylized animations: https://diglib.eg.org/handle/10.1111/v30i8pp2367-2386
15. Cunzi, Thollot, Paris, Debunne, Gascuel, Durand 2003, dynamic canvas for non-photorealistic walkthroughs: https://graphicsinterface.org/wp-content/uploads/gi2003-15.pdf
16. Cole, DeCarlo, Finkelstein, Kin, Morley, Santella 2006, directing gaze in 3D models with stylized focus: https://gfx.cs.princeton.edu/pubs/Cole_2006_DGI/cole06_stylizedfocus.pdf
17. Santella and DeCarlo 2002, abstracted painterly renderings using eye-tracking data (with DeCarlo and Santella 2002, stylization and abstraction of photographs, doi 10.1145/566570.566650): https://www.cse.psu.edu/~rtc12/CSE597E/papers/eyegazeDeCarloNPAR02.pdf
18. Quilez, domain warping: https://iquilezles.org/articles/warp
19. Hobbs 2017, a guide to simulating watercolor paint with generative art (layered deformed polygons): https://www.tylerxhobbs.com/words/a-guide-to-simulating-watercolor-paint-with-generative-art
20. Befores & Afters 2025, "If you want a painterly bush, paint the bush" (a studio's painterly environments): https://beforesandafters.com/2025/01/10/if-you-want-a-painterly-bush-paint-the-bush/ (talk: https://history.siggraph.org/?p=227388)
21. SIGGRAPH 2023 production session on a painterly feature's visual style (edge breakup, graphic rims): https://history.siggraph.org/?p=131616 (press: https://beforesandafters.com/2023/01/11/heres-how-dreamworks-lent-a-whole-new-brand-of-stylized-look-and-feel-to-puss-in-boots-the-last-wish)
22. Lost and found edges, the painters' practice: https://creativebloq.com/illustration/theory-behind-lost-and-found-edges-explained-51620585 (also https://drawpaintacademy.com/edges/)
23. Taylor, fractals and the preference for mid-range dimensions (1.3-1.5): https://www.mi.sanu.ac.rs/vismath/proceedings/taylor.htm
24. Cabral and Leedom 1993, imaging vector fields using line integral convolution: https://courses.cs.duke.edu/spring03/cps296.8/papers/cabralLineIntegralConvolutions.pdf
25. Bies et al. 2016, aesthetic responses to exact fractals (preference rising with dimension; the caveat to 23): https://www.frontiersin.org/articles/10.3389/fnhum.2016.00210/text
26. Bénard et al. 2010, a dynamic noise primitive for coherent stylization (texture that follows motion): https://artis.inrialpes.fr/Publications/2010/BLVLDT10/

Licence facts in §7 were read from the npm registry and from the wheels' metadata on 2026-10-30. Page fetches were
blocked in this session for most hosts (and GitHub's API), so paper details come from the papers' abstracts and
indexed text, and every cost, look and motion claim here comes from our own measurements.

## 10. Rerun
From `video/`: `python3 docs/look/organic/techniques_demo.py` (the sheet, about 11 s), `--bench` (about a minute),
`--measure` (about 20 s); `node docs/look/organic/techniques_chrome_bench.js` (about 2 min; Playwright's global
install, the headless shell at `/opt/pw-browsers/chromium_headless_shell-1243/`, `--use-gl=angle
--use-angle=swiftshader` as the render's `swangle`); `python3 docs/look/organic/techniques_motion.py` (about 1.5 min,
ffmpeg + x264, the MP4s go to `/tmp/organic_motion/`).
