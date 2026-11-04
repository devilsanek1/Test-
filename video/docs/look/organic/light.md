# PROPER LIGHT: one story light, done properly (research and engine spec, 2026-10-30)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "I noticed this
too the light source yes - can we do the proper lights?" The playbook rule this feeds: "PROPER LIGHT: one story light
per scene, done properly" (`docs/OWNER_PLAYBOOK.md`): one dominant source the eye goes to, real falloff, rim light on
what it touches, a soft glow and gentle bloom at the source, cast shadows and pools that follow it, local lights as
story lights. Darks, contrast and the one colour key are palette work (the owner: "that's just color palette and
selection"); this page is the light.

**What this is.** The LIGHT lane of the organic research: how 2D illustrators, background painters and 2D animation
compositors build light that reads (§2, 15 sources), what the owner's references do with light, measured (§1), how to do
each technique in OUR engine with its cost and determinism (§4, §7), the light plan for scene 1 (the low October sun on
the left as the key, the lit Google doorway as the story light on her: §5), and a proof: the v6 still relit by the
engine's own renders and masks, at two doses, in motion, plus a cost bench in the real render path (§6, §7). **Rank:**
research notes, the lowest rank (DIRECTION's ladder); nothing here is a rule until it is integrated into `CRAFT.md` §d,
`src/lib/LIGHT.md` and the playbook's PROPER LIGHT. We learn methods; no reference is copied, traced or used as input
(they are only measured), and no living artist is a style target. Paths are from `video/`.

| File (`docs/look/organic/`) | What |
|---|---|
| `light.md` | this report |
| `light_sheet.jpg` | the proof: v6 against the relit frames at phone width (dose 1.0 and 1.6, at 1.0, 1.6 and 2.4 s), the doorway at 1.5x, the light maps, and the references' light (method crops) |
| `light_motion.mp4` | the motion proof: 1.0-2.4 s at 30 fps, v6 beside the relit frames (her rim, wrap and door shadow follow her; the static light rides each plane's float) |
| `light_demo.py` | the seeded proof script: every pass of §4 on the engine's renders (`python3 light_demo.py <renders> <out> --times=1.0,1.6 --doses=1.0,1.6 --repeat=2`) |
| `light_sheet.py` | builds the sheet from the renders and the proof's outputs |
| `light_motion.py` | builds the MP4 and measures the light over time: does the static light hold still, does her light change smoothly, does anything flicker (§6.4) |
| `light_blendspace.py` | the blend-space check: each way of shipping the light as two images against the linear result (§4.11) |
| `light_proto/` | the engine bench: `entry.tsx` + `LightBench.tsx` (v6's scene with one kind of light layer over it), `make_assets.py` (its inputs, written outside the repo), `run_bench.py` (the cost and determinism table, §7) |

## 0. Bottom line

- **"Proper light" in the references is one source the eye goes to, and everything else arranged around it**
  (measured, §1): in the bus-stop night the brightest 0.5 % of the picture sits on the shelter, 0.11 H from the man;
  its pool lifts the ground strip to L* 24 against 7-10 outside (+14-17) and falls off within 20-40 px past the posts;
  its air glows only +9 L*; its red light (hue 22-35 deg) sits against a blue-violet shade (285-320 deg). In the sunset
  city the sun-facing slivers are L* 95 against fronts at 37 (+58 L*), about 7 px wide at our scale. The beach's sun is
  a thin horizon line, its glow tight. In the cloud frame the glow colours the whole air the light's colour.
- **Our v6 has sources but no light.** The lobby (L* 88) sits in a high-key frame (median L* 67) where our bank (55)
  matches the water (55); there is no shade mass, no glow at the sun or the door, rims only on her, and v2's rig casts
  the short shadows of a high sun (elevation 36 deg) under a sunset sky whose sun sits on the roofline (8.9 deg).
- **Yes, our engine can do proper light, and cheaply, in three homes** (§4.0): (1) **the colours**: what is simply lit
  or in shade becomes the fill (0 ms); (2) **baked light maps per plane**: one multiply map (the shade masses and the
  falloff) and one screen map (pools, spills, static rims, blooms, shafts), placed like a painted piece so they ride the
  float; a full-frame blended image costs ~40-70 ms per frame (measured: 3 maps +130-160 ms, 12 maps +600 ms), so maps
  are cropped, merged and folded into the colours where they can be; (3) **live layers for movers**: her rim
  (lib/light's `Rim`, the distance-field band as a vector mask), her light wrap (one small SVG filter), her shadows by
  projective construction, a bloom on a changing source: each within the measuring noise (§7).
- **And cheaper than v6 is today** (§7): v6's own lib/light layers cost ~340 ms of its ~550 ms frame; with them off and
  ONE cropped multiply map (the new shade with v6's static shadows folded in), ONE cropped screen map and her live
  layers, the relit frame renders in 256 ms: -290 ms, with all of §5's light in it.
- **Ship the light the browser's way** (§4.11): the browser blends sRGB values while light adds in linear light. The
  shade ships as an sRGB-encoded multiply map; the light as a screen map SOLVED per pixel against the plane's own
  render. End to end in Chrome, the solved maps reproduce the linear bake within 0.48 L* (mean; p99 1.7); the naive
  map misses by 1.14 (p99 8.2: shafts and pool visibly too bright, worst on dark ground).
- **Scene 1, relit** (§5, §6, `light_sheet.jpg`): the doorway is the story light (the lobby 88 -> 91, its pool on the
  towpath 77 -> 84, her wrap and rims, her shadow from the lobby's lamps in the pool); the sun is the key (its glow and
  in-scatter veil, gold rims on the skyline, a sliver up the wing's corner, a warm edge on her front as she walks into
  it); the backlit facade sits in the dusk's rose-plum shade (63 -> 55); our bank lies under the shadow of a canopy
  off-screen left, one big quiet mass with a leafy edge and two warm dapples (55 -> 42). The darks (L* < 40) go from
  6.8 to 14.8 % of the frame (23.9 % at dose 1.6); the brightest 5 % below the sky sits 0.07 H from her; the caption
  band is untouched (max change 0/255). The bake is 6-8 s per frame on one core, the same bytes on every run. In motion
  (§6.4, `light_motion.mp4`) the static light holds still (0.02-0.05 L* over 1.4 s), her light falls smoothly from +7.3
  to +3.5 L* as she leaves the door, and nothing flickers (p99 0.3 L* frame to frame). Not yet right (§6.3): v6's day
  shadows still drawn inside the new shade, the leafy edge too even, the dapples read as discs, no light on the jambs.
- **The light floods in with the colour**: S1's colour flood already starts at the sun (SUN0); the light maps can be
  masked by the same growing circle, so the light spreads from its source on frame 0's beat (§5.3).
- **Taste rules, from the sources and the references** (§2): bloom only AT emitters and their reflections, three
  sigmas of ~0.1 / 0.4 / 1.2 x the source, at most +6-8 L* at its edge; rims follow n . l and the tier (the subject
  4-6 px), never an even outline; shade masses are cast by a named thing, never a vignette; at most 2-3 shafts, never
  across the band or the focus; one story light per scene, the rest at least a step under it.
- **Doc clashes** (§9): CRAFT §d's "no blur, no gradient, a halo <= 1.7x, rim only on the subject, sun shadows 0.3-0.8
  h" and its brightest-5 % check predate the owner's PROPER LIGHT; proposed wordings are in §9, for the orchestrator.

## 1. What the references do with light (measured, for method)

CIE L* C* h of the phone screenshots (UI masked), at their own size (1206 px wide; the cloud frame 720).

| Ref | The story light | Measured | What we learn |
|---|---|---|---|
| `refs_human_scale/02_bus_stop_night.jpg` | the red tube under the shelter's roof | the brightest 0.5 % (L* >= 57) centred at (662, 379), the man at about (645, 445): 0.11 H; the tube L* 49, hue 35; the ground strip under the shelter (rows 522-542) L* 20-27, median 24, against 7-10 outside, down to ~10 within 20-40 px past the posts; the reeds' tips by the shelter 18 (hue 23) against 6-10 (hue 285-320) beyond; the air above the roof by the tube 48 against 39 far | one source, ON the subject; a pool +14-17 L* with a quick falloff at its sides; the light colours what it touches (the reeds' tips, the posts' inner faces, the man's top); a tight glow (+9 L*); the shade complementary to the light (red against blue-violet) |
| `refs_human_scale/03_beach_dusk.jpg` (+ the couple zoom) | the sun on the horizon; the phone on the girl | the horizon line L* 70-75 across the frame, 88 at the sun, the disc 91; the sky above it 31-37 (+35-40 under it); along the line the sun lifts only +1-3 L* within ~120 px; the couple L* 13, the near sand 17 | the sun's light is a LINE, its glow tight; the people are silhouettes; the phone is the only cool light, so the eye goes to it |
| `refs_human_scale/01_city_hill_sunset.jpg` | the sunset behind the towers | the sun-facing slivers L* 95, hue 99 (cream-gold); the fronts L* 37, hue 343 (plum): +58 L*; the slivers 8 px median at 1206 (p25 3.8, p75 10) = 7.2 px at 1080 | backlight: the fronts in shade, a bright sliver on every edge facing the sun, uneven widths (3-10 px) |
| `refs_human_scale/04_cloud_beast_frame.jpg` | the glowing cloud | the cloud's lit core L* 79, hue 73 (gold); its far side 66, hue 44; the sky field 56, hue 315; the girl 58, hue 352 | the glow colours the air: the subject sits in the light's colour field |
| `refs_paint/01_beach_van_dusk.jpg` | the dusk sky behind the rocks | (eye) the rocks near-black bodies with a thin sky-lit top and a warm rim on the sun's side | dark masses with lit edges carry the light more than the light itself |

## 2. How the pros build light that reads (research; methods only)

### 2.1 One story light
- Lighting is a storytelling device before it is physics: its jobs are to lead the eye to the story and to set the
  mood, then to model form and say the time of day (Pixar's lighting course at SIGGRAPH 96, source 12).
- The 2D feature that took light furthest kept the vocabulary tiny: Klaus's light-and-shadow tool reduced light to key,
  bounce, ambient, occlusion and rim, so the artists could "paint directly with light" (source 1). Fortiche's series
  overrode automated lighting with hand-designed light and "hero lighting": the light on a character need not match
  the room when the story needs it (source 13).
- In the owner's references the one source IS the story (02's shelter lamp, 03's phone, 01's sunset, 04's cloud), and
  everything else sits in a few shade masses (§1).
- **For us:** one KEY per set (the direction for everything) and ONE STORY LIGHT on the subject per scene: the
  brightest thing below the sky, within 0.15 H of the subject (CRAFT §d.2's check; 02 measures 0.11 H); secondary
  lights (lit windows, far lamps) stay at least a step under it.

### 2.2 Falloff
- A point source falls off with the square of the distance; on a floor under a lamp at height h the light goes as
  cos^3(theta) / h^2 (the cosine-cubed law of lighting design, source 10): bright under the lamp, a fast first drop,
  then a slow tail. An area source (a doorway, a window, a screen) falls off more slowly near it and like a point far
  away.
- Painters compress the curve (a bright core, a quick drop, a long gentle tail) and let the tail TINT what it reaches
  (source 14; 02's reeds and posts, §1).
- **For us:** falloff follows a real curve, applied as a smooth, dithered ramp in a baked light map or a short gradient
  fill, never as concentric rings; CRAFT §d.7's two flat steps stay for a pool that is meant to be hard.

### 2.3 Rim light and light wrap
- A rim is the thin bright edge where a form turns away from us toward a light behind or beside it: brightest where
  the surface faces the light, thicker on soft or thin parts (hair, a scarf, cloth), thinner on hard edges, in the
  light's own colour; an even rim all round reads as an effect and pulls focus (source 14). 01's slivers (§1) are the
  same thing on buildings: 3-10 px, uneven.
- Light wrap is the compositor's version for a subject before a bright background: blur the background until only its
  light is left, keep it to a band just inside the subject's edge, add it (screen or plus), with controls for the band's
  width, intensity, which brightness wraps and saturation (source 3). It makes a figure in a lit doorway belong to the
  light behind her instead of looking cut out.
- **For us:** rims from the shape's own distance field, weighted by n . l (§4.3); light wrap where the subject stands
  against the story light's source (§4.7).

### 2.4 Glow and bloom, done tastefully
- Bloom is light scattering in the lens and the eye. The modern recipe is a chain of blurs at doubling sizes, summed,
  with no hard brightness threshold, so the glow falls off naturally and never shows a ring (Jimenez, SIGGRAPH 2014,
  source 5).
- Japanese animation's compositing stage (撮影, "photography") treats light as its own layer: 透過光 (transmitted
  light: originally the cel lit from below and double-exposed) for suns, beams, fire and glints, tinted with パラ
  (coloured paraffin paper) for bleed and colour; at ufotable the light "propagates through the shot", bouncing and
  leaking into the lens as bloom, and gradients are added in compositing (source 2).
- A painter's glow is a core plus an aura that tints what it touches, and it reads only against darker values: on a
  light field it is invisible, overdone it reads as fog or a spotlight (source 14). The references keep it tight (02's
  air +9 L*; 03's sun +1-3 along its line).
- **For us:** bloom only AT emitters (the sun, a lit opening, a lamp, a screen) and at their mirror images in water,
  never on lit surfaces; three sigmas of ~0.1, 0.4 and 1.2 x the source's size; at most +6-8 L* at its edge, +2 at one
  size away, nothing past three; in the light's colour; never in the caption band; never a disc or ring.

### 2.5 Light shafts
- The real-time recipe accumulates, for each pixel, samples along the ray toward the light's screen position over an
  occlusion image, with a decay and a weight (Mitchell, GPU Gems 3 ch. 13, source 6): the 2D form of a painter's
  lighter, soft-edged wedges in hazy air, seen only against darker things.
- Crepuscular rays are parallel; perspective makes them fan from the sun's image (and meet again at the antisolar
  point), so in a picture they radiate from the sun (source 11).
- **For us:** two or three soft wedges from the source's image at most, +2-4 L*, fading along their length, never
  across the caption band or the focal point.

### 2.6 Cast shadows and light pools
- Under the sun, shadows are parallel in the world and converge in the picture on a vanishing point on the horizon
  straight below the sun (when the sun is in frame they come toward us); under a lamp they radiate from the point on the
  ground below it. A shadow's tip is where the line from the light through the top meets the line from that foot point
  through the base (source 11).
- 2D engines build light in the same two layers we can: an ambient darkening of the whole canvas (Godot's
  CanvasModulate) plus lights added over it (Add, Mix or Subtract), shadows cast by occluder polygons; Unity's 2D
  renderer blends light textures by style (multiply and additive, at most four and usually two per scene, because each
  style costs a pass) (source 7). Ori's sequel painted a light mask on every surface so the world reacts to moving
  lights (source 15).
- **For us:** shadows by projective construction (exact in our perspective); pools as the source's opening projected
  onto the ground with its falloff; a caster's shadow from the story light cut out of that pool (§4.6).

### 2.7 Local lights as story lights
- A lit doorway is an area light behind an opening: a spill shaped like the opening thrown forward, a glow at the
  opening, wrap and rim on whoever stands in it, light on the jambs and soffit, its column in the water. A lamp is a
  small hot core, a halo, an elliptical pool, shadows radiating from its foot. A phone is a tiny cool source that lights
  only the face, hands and near front: in 03 the only cool light in a violet world, so the eye goes there.
- **For us:** every local light gets the same bundle (§4.8); only one of them is the story light.

### 2.8 The colour of light and shadow at dusk
- A low sun's light crosses more air, so the short wavelengths scatter out and it turns gold to orange (golden hour,
  roughly 2000-3500 K); the shadows are lit by the blue sky, so they lean cool and violet, unless warm bounce dominates
  and the sky is blocked, when they turn warm (source 4). After sunset the world is lit by the sky (cool) and every
  lamp reads warm. The references hold it: 02's red against blue-violet, 01's cream-gold slivers against plum fronts.
- **For us:** gold light; shade toward the sky's violet with its chroma kept (CRAFT §d.3: warm surfaces turn toward
  rose and plum, cool ones toward violet); warm bounce under things near a warm ground; the story light as the one hot
  accent of the scene's colour key.

### 2.9 How light moves in animation
- Klaus tracked its light and shadow shapes to every drawing and in-betweened them, so the light rides the character
  and never boils (source 1). Ori's painted light masks let the world answer a moving light (source 15). Anime pulses
  and flickers transmitted light on story beats (source 2).
- **For us:** a source never moves between cuts (CRAFT §d.1); static light is baked per plane and rides its plane;
  light on a mover is computed from its pose every frame (a function of t only); a light switching is a one-frame pop
  on its story beat; a light that follows its cause (doors sliding open) changes with that motion (§4.10).

## 3. Where v6 stands, in light terms

Measured on the v6 renders (1.6 s, captions off): the lobby L* 88, the facade 63, our bank 55, the water 55, the
towpath in front of the door 77, the median 67, the darks (L* < 40) 6.8 % of the frame. So:
- **No place to look below the sky**: the doorway is lighter than its facade by 25 L*, but everything around it is
  high-key and even; nothing falls off from it; our bank and the water are one value.
- **No glow**: the sun is CRAFT §g.2's calm disc (correct by rule), and the door has none.
- **Rims only on her** (v6's warm front edge and teal back edge); the skyline, the posts and Pip have none.
- **The shadows contradict the sky**: v2's `RIG_CANAL` casts parallel shadows for a sun at 36 deg (toward 15 deg,
  capped 0.8 h), while the painted sun sits on the far roofline (8.9 deg); and the facade, which faces us with the sun
  in front of us, is lit as if the sun were behind the camera.
- **What already works**: one shade family (v6's lilac-plum), contact shadows under everything, the water's door
  column (the water recipe's E2), the painted sky's warmth field by the sun.

## 4. In our engine: three homes for light, then each technique

### 4.0 The three homes (cheapest first)
| Home | What goes there | How | Render cost (§7) | Moves |
|---|---|---|---|---|
| 1. **The colours** | what is simply lit or in shade and never changes: a backlit facade's front, a shade face, a lit sliver on a static edge, a falloff inside one face | the rig computes the fill (`relit`, `formTint`, the per-surface family), or a `linearGradient` fill along the light (dithered, short ramps) | 0 (a fill is a fill; a vector gradient measured within noise) | with its shape |
| 2. **Baked light maps** (per plane) | static light: shade masses (our bank under the trees), the falloff of static sources, pools and spills, static rims, blooms at static sources, shafts, the in-scatter veil | `scripts/look/light/bake_light.py` (proposed: this proof's passes, production-grade) writes per plane a `shade` PNG (multiply) and ONE `light` PNG (screen), placed like a painted piece inside the plane's group | ~40-70 ms per full-frame blended image; two cropped maps measured +12 ms (§7): crop each map to its box, merge light and glow, fold shade into the colours where possible; the light map solved for the browser's blend (§4.11) | rides its plane: never slides |
| 3. **Live layers** (vector, or a small SVG filter) | light on movers: the subject's rim and wrap, her shadows in the pool, a spill while a door opens, a bloom on a source that changes | `lib/light` components computed from the pose at t | within the noise when the region is small (her box, the door's box) | per frame, deterministic |

### 4.1 The rig: one key, one story light, one shade family (data, `lib/light` `makeRig`)
- **Key:** a sun in frame is given by its image point and the horizon (proposed `sunInFrame({img, r, horizonY})`): its
  elevation is atan((horizonY - img.y) / focal), its shadows' vanishing point is (img.x, horizonY), and a sun on the far
  roofline puts the near ground in shade. A key out of frame keeps `sunLight({toward, el})`.
- **Story light:** one per scene, typed by shape: `area` (a lit opening: its rect, the lamps' image point and their
  floor foot), `point` (a lamp: core, height, foot), `screen` (a phone: a small cool rect). Its colour is the scene's
  one hot accent.
- **Shade family:** CRAFT §d.3's tint family given per surface family: warm surfaces take its rose-plum end, cool ones
  its violet end (`familyFor(surface, warm, cool)` exists), at a strength per zone.
- **Light table:** the key's colour, the story light's, the bounce; every layer takes its colour from it (PAINT_RECIPES
  §3 C5: one light table per scene).

### 4.2 The light map (falloff and shade masses, per plane)
- **Placement:** per plane, `shade_<plane>.png` (multiply, RGB <= 1) and `light_<plane>.png` (screen, RGB), each cropped
  to its box, drawn in the plane's group exactly like a painted piece (`lib/paint` `PaintedLayer` plus a proposed
  `blend` prop: §9 D-L6), so it rides the float, lands with the flood (`from`, the reveal) and sits under whatever the
  scene draws in front. Smooth maps (shade, falloff) may bake at 1/4 resolution and be upscaled by the browser; rims
  and any SOLVED light map stay at full resolution (§4.11).
- **The bake:** from each plane's flat render alone (a `LightFlat` composition, like `PaintFlatS1`) and masks that are
  differences of two renders of the same frame with one layer switched (exact to the pixel: §6); in linear light; the
  curves of §2.2; the shade tint per pixel by the surface's warmth (§4.9); dithered +-0.5 code, triangular,
  sha256-seeded, so no ramp bands on a phone (CRAFT §g.4).
- **Vector alternative:** a `radialGradient` or `linearGradient` (5-8 stops on the real curve) in a screen or multiply
  group, within the noise (§7). Gradient stops band in 8 bits over long, gentle ramps: keep vector ramps short or
  steep, bake the long ones.
- **Shade masses are designed shapes, never a vignette:** a cast shadow from a named thing (a canopy off-screen, the
  far roofs), with that thing's outline (clumps of three sizes, holes of light near its edge) and its penumbra (the
  caster's distance x the sun's 0.53 deg: ~10-30 px on our near ground).

### 4.3 Rims from the shape's distance field
- **The math:** inside a silhouette, the exact Euclidean distance to its edge d (Felzenszwalb-Huttenlocher, source 9;
  OpenCV `distanceTransform`, `DIST_MASK_PRECISE`) and its gradient give the outward normal n; rim = (1 - smoothstep(w -
  0.8, w + 0.8, d)) x max(0, n . l)^p, with l the unit vector toward the light (per pixel for a point light or a sun in
  frame); p 0.8-1.2; p = 0 gives the band all round (the wrap's band, §4.7). `light_demo.py` `rim_band()`.
- **Static shapes: baked** into the plane's light map (the skyline's sun-facing edges, lamp heads, bollards, boats, a
  corner sliver).
- **Movers: live, vector**: `lib/light` `Rim` (exists): the silhouette minus a copy moved w px AWAY from the light. That
  difference is exactly a band w x max(0, n . l) thick: the distance-field rim without a bake, and it follows every
  drawing of the pose for free (`of` = the same element). Upgrade: `steps: 2` (a crisp band w and a softer band 2w at
  ~35 %; the bench's `rimMask`), the direction per object for a point light (`lightDir` exists).
- **Dose by tier** (the playbook: "lit edges on what it touches"): the subject 4-6 px, +12-18 L*, in the light's colour;
  B (Pip, people) 2 px, +6-8; C (facades, posts, boats) 1.5-2.5 px, +4-8; far planes (+3, +4) none, or +2-3 (lost in
  the haze). Uneven along the edge by construction; never an even outline.

### 4.4 Bloom AT the source
- **Baked** (the usual case: sources are static): the emitter's own bright mask blurred at three sigmas (~0.1, 0.4, 1.2
  x its size; S1's door 2.5 / 8 / 22 px; the sun 4 / 14 / 40 / 110 px, the two wide ones stretched 1.8-2.4x along the
  horizon), weights ~0.3 / 0.2 / 0.1, screened in the light's colour, cut out of the source itself (the source is
  lifted, not fogged) and faded to 0 before the caption band's guard.
- **Live** (a source that changes or moves): `feGaussianBlur` x3 merged on the source's own shape, the filter region
  cut to the source + 3 sigma (the bench's `bloomLive`): within the noise for one (§7).
- **Never:** bloom on a lit surface, a global threshold bloom (it softens the whole flat world: a filter look), a disc
  or ring, a glow brighter than its source.

### 4.5 Light shafts
- **Vector:** wedges from the source's image point with a radial gradient (0 until they leave the occluder, a peak, a
  long tail), screened at +2-4 L*, in the group of the plane whose air they cross (the bench's `shafts`).
- **Baked, occlusion-true:** Mitchell's radial accumulation over the plane's occluders at half resolution
  (`light_demo.py` `shafts()`: 72 samples toward the source, decay 0.965: 0.25 s per bake, the same bytes twice).
- **Rules:** never across the caption band or the focal point, only against darker air, one fan from one point.

### 4.6 Cast shadows and pools, by projective construction
- **The construction:** a billboard caster (a person, a post) standing on a ground line maps to its shadow by ONE 2D
  homography of the image (points of one plane sent through one centre onto another plane), fitted from four points with
  the light's image point and its foot (for the sun: its image and its vanishing point on the horizon). Exact in our
  perspective and gap-free; live, it maps the silhouette path's points every frame (100-300 points; the bench's
  `shadowProj`); baked, it warps the mask (`cv2.warpPerspective`; `light_demo.py` `shadow_homography()`).
- **Pools and spills:** an opening's spill is the opening projected the same way onto the ground (a trapezoid widening
  toward us: S1's door 1.45x by the coping); its falloff is cos^3 from the lamps' height; its sides soften with distance
  (an area light's penumbra, 4 -> 14 px); every caster in it cuts its own shadow out of it; it never lands on water
  (water shows the source's reflection instead).
- **Sun shadows at dusk** are long (h / tan(el): ~6.5 h at S1's 8.9 deg) and converge on the vanishing point; where a
  dusk ground is sunlit, cap them by design (<= 2.5 h, the far end fading) instead of CRAFT §d.5's 0.3-0.8 h (§9 D-L4).
- **Contact shadows:** unchanged (`ContactShadow`): ambient occlusion holds under any light.

### 4.7 Light wrap
- The story light's source blurred (baked once: S1's lit opening at sigma 7 px, its box only), laid on the subject's
  inner edge band (all round, 3-4 px) where she stands against it, screened at ~0.6-0.9. It fades by itself as she
  walks out of the opening's light, because it is weighted by the blurred source at her edge: no keyframes.
- Live: one small SVG filter on her silhouette (`feMorphology` erode, `feComposite` out, a 0.7 px blur, `feImage` of the
  baked blur, `feComposite` in), the filter region cut to her box (the bench's `wrap`).

### 4.8 Local lights: the bundle
| Light | Core | Bloom | Spill / pool | On the subject | In water |
|---|---|---|---|---|---|
| A lit doorway (area) | the lobby lifted a step (L* 90-93, its lamps 95-98) | 2.5 / 8 / 22 px, +5 L* at the frame, ~0 by 60 px | the opening projected forward (1.45x by the near edge), cos^3, +7-9 L* at the threshold, her shadow cut out | wrap (3-4 px) + a back rim (2-3 px) from its lamps | its column (water E2) + a small bloom |
| A lamp (point) | L* 95-98, <= 1 % of the frame | ~0.1 / 0.4 / 1.2 x the lamp | an ellipse flattened by the ground (CRAFT §d.7's size), cos^3 | a rim on the side facing it | a broken column |
| A phone (screen) | a small cool rect, L* 92-96 | 1-3 px, cool | none | the face, hands and front within ~1-2 head sizes, +8-12 L*, cool | none |
| A lit window (secondary) | L* 85-92 (CRAFT §d.2) | 1-2 px at most | a sill spill (CRAFT §d.7's trapezoid) | none | a short column |

### 4.9 The colour of light and shade (the dusk light table)
| Role | Hex | Rule |
|---|---|---|
| Key light (the low sun) | #FFC27A | gold-peach: rims, slivers, the glow and the veil; the glint's #ee6a2e is its saturated core |
| Story light (the lobby, ~2900 K) | #FFE2AE | cream-gold: the scene's one hot accent |
| Shade on warm surfaces | #C79AB4 | rose-plum: terracotta and brick stay warm, chroma kept (CRAFT §d.3) |
| Shade on cool surfaces | #A49BD6 | violet: teal glass and slate turn toward the sky |
| Bounce from the warm ground | #F2B8A8 | rose, into the undersides of things standing on the terracotta (optional, +3-5 L*) |

Light lifts L* and turns toward gold with a little more chroma; shade lowers L* and turns toward the sky's violet with
the chroma kept; the gold on her teal coat reads as a pale warm edge, a complementary pair the eye goes to.

### 4.10 Motion and determinism
- Static light is baked once per state and rides its plane (a pool on the ground's plane, a rim on its object's, the
  sun's glow in the sky, which never floats).
- Light on movers is a function of the pose at t: nothing accumulates across frames, so a frame renders the same alone
  or in sequence, in any order.
- A light switching (W's lamp at 0.40) is a one-frame pop of its baked state; a light that follows its cause (the glass
  doors sliding 0.45-0.52) mixes its two baked states by the opening fraction (light through an opening scales with its
  area: the cause's motion, not an opacity fade).
- Never: a light that moves between cuts, flicker without a story reason, light re-seeded or re-traced per frame (it
  boils).
- The bake gives the same bytes on every run (md5, §6); the live layers the same PNG bytes across fresh renders (§7).

### 4.11 Blend space: the browser blends sRGB values, the light model is linear
Light adds in linear light (the bake, §4.2); `mix-blend-mode` multiplies and screens the sRGB-ENCODED values (source 8;
SVG's linearRGB setting reaches filters only, through `color-interpolation-filters`). Measured on the proof at 1.6 s
(dose 1.0; 14.6 % of the frame lit, 48 % shaded): each way of shipping the light as two 8-bit images, against the
linear result (`blend space` check in §11):

| Way | abs dL*, mean | p99 |
|---|---|---|
| Multiply map = the linear shade encoded with the sRGB curve | 0.51 | 1.16 |
| Screen map = the linear light encoded with the sRGB curve (the naive way) | 2.19 | 8.8 (too bright, worst on darks) |
| Screen map = the linear light's values, no curve | 0.93 | 8.4 (max 16) |
| Screen map SOLVED against the plane's own render: m = 1 - (1 - target) / (1 - base) | 0.04 | 0.25 |
| `plus-lighter` map solved: m = target - base | 0.08 | 0.25 |
| The solved screen map over the base 0.1 s later (her and the water moved under it) | 0.16 | 2.8 |

- **The shade map ships as the sRGB-encoded linear multiply** (a power law commutes with a product, so multiply is
  almost gamma-free).
- **The light map is SOLVED per pixel against the plane's flat render**, which the bake has: exact for static light on
  a static plane. A naive light map is 2-4x too bright on dark ground.
- **Checked end to end in Chrome** (the bench's `solved` frame, §7): its own multiply and screen of the two shipped
  8-bit PNGs land within 0.48 L* of the linear bake (mean; p99 1.7, max 2.7; 0.08 % of the pixels over 2 L*) outside
  her, the row and the band; the naive maps: 1.14 (p99 8.2; 11.5 % over 2 L*).
- **Light on a mover stays a live layer** whose dose is set as L* lifts measured in the render (§4.3): blend-space-free.

## 5. Scene 1: the light plan (the low sun + the lit doorway)

### 5.1 The rig "canal dusk"
- **Key: the sun, in frame, half behind the far roofs**: the painted disc's centre (195, 745), r 20 (the sky piece
  draws CRAFT §g.2's calm disc); the lens's horizon y 965 (S1_LENS, focal 1400), so the elevation is atan(220 / 1400) =
  8.9 deg and the shadows' vanishing point is (195, 965). On the roofline, the sun leaves the near ground in the far
  roofs' shadow and reaches only what rises into it: the wing's parapet and roof planting, the lamp heads, the tower's
  sun side, her front as she walks west. The key gives the glow, the rims and the direction; the ground belongs to the
  story light.
- **Story light: the Google doorway** (S1_SHEET.door 540-720 x 848-1082): the lit lobby as an area source, its two
  lamps at (575, 879) and (675, 879) through the opening, their floor foot (630, 1076); #FFE2AE.
- **Shade family:** warm #C79AB4 / cool #A49BD6 at three strengths (dose 1.0): the backlit facade 0.52; the towpath in
  the far roofs' shadow 0.36, fading in from x 120 to 420 (the roofs' shadow edge: never a seam); our bank under the
  canopy off-screen left 0.80.
- **Secondary lights:** the lit office panes (sources: never shaded); W's lamp (on until 0.40, then dark); the far
  towpath lamps OFF (no rival to the story light). The "Google" fascia is a lit sign (unshaded).

### 5.2 Layer by layer (plane, home, values measured on the proof at 1.6 s, dose 1.0 / 1.6)
| Layer | Plane (float share) | Home | Values |
|---|---|---|---|
| The sun's bloom (4 sigmas, the wide two stretched along the horizon) | sky (0) | baked with the sky piece | the sky by the disc 89.6 -> 91.5 / 92.3 L*; nothing above y ~680 |
| The in-scatter veil over the far city by the sun | +3, +4 (0.15, 0.05) | baked with the far city | +2-4 L*; tops lost by the sun (built_ground's rule) |
| The backlit facade's shade | 0 (0.6) | the colours (home 1) or the plane's shade map | 63 -> 55 / 48 L*; the panes, the lobby, the sign and her excluded |
| Sun rims on the parapet, the roof planting, the lamp heads (C, 2.4 px) and a 3 px sliver up the wing's west corner | 0 | baked | +4-8 L* |
| The lobby lifted, its two lamps glowing | 0 | baked, two states (shut / open) | 88 -> 91 / 93 L*, the lamps 95+ |
| The door's bloom (2.5 / 8 / 22 px) | 0 | baked, two states | +5 L* at the frame, ~0 by 60 px |
| The door's pool on the towpath and the coping | 0 | baked per state; her shadow cut live | 77 -> 84 / 86 L* at the threshold |
| Her shadow from the lobby's lamps (homography), clipped at the coping | 0 | live | toward us and right |
| Her sun rim (front, 4 px), her wrap (3.6 px) and back rim (2.4 px) from the door | 0 (her group) | live (`Rim` steps 2, `Wrap`) | her mean 45.7 -> 50.9 / 52.9 L*; her lit edges +11 (median) to +17 (p90), +16 to +23 at dose 1.6 |
| The ghosts' rims (B, 2 px, half) and Pip's (B, 2 px) | 0, -1 | live | +6 L* |
| Our bank under the canopy: one leafy-edged mass, holes of light near its edge, two warm dapples | -1 (0.85) | baked shade map | 55 -> 42 / 39 L* |
| The door's column and the sun's glint bloom in the water | -0.5 (0.725) | baked with the water | +1-3 L* |
| Two soft shafts low over the water, left of the door | -0.5 | vector | +2 L* |

### 5.3 The timeline (S1_CLOCK)
- **Frame 0 to the flood (0.44-0.78):** frame 0 is pale shapes and the pen (DIRECTION rule 9): no light yet. The light
  FLOODS IN WITH THE COLOUR from the sun: each baked map is masked by the flood's growing circle from SUN0 (lib/exit's
  `Look cascade`, 5200 px/s), so the light spreads from its source; the story light's maps land with the door's flood
  (0.53).
- **0.40, W's lamp clicks off:** its pane light pops off with the plum pane.
- **0.45-0.52 the glass doors slide open, 1.10 shut:** the spill, the bloom and the lobby's lift mix their shut and open
  states by the opening fraction (shut = the glass's ~85 % with a cool sheen streak on the leaves).
- **0.97 she steps out and walks west:** her rim, wrap and door shadow follow every drawing of her pose; the wrap fades
  as she leaves the opening's light; the sun rim on her front stays.
- **5.875 the push-through into W:** the maps sit in their plane groups, so they ride the dive; nothing special.

### 5.4 What it must not do
- Touch the caption band (one value across it: CRAFT §d.9): every layer stops 10 px outside it (measured: 0 change).
- Out-shine the story light: the brightest 5 % below the sky (the far planes left out) stays on her and the door.
- Grey anything: the shade keeps its chroma (the per-surface family), never a black multiply.
- Read as a filter: every light has a named source, every shade mass a named caster.

## 6. The proof (an iteration; numbers in `light_demo.py`'s metrics)

**What it is.** `light_demo.py` relights still v6's scene 1 with the rig of §5. The engine renders each frame six ways
(render-frames.mjs on `src/entry-look-paint.tsx`, `PaintS1` set `v6`: captions off and on, the row hidden, the painted
sky swapped for v2's flat one, the sky alone, Pip hidden), and every mask is the difference of two of them, exact to
the pixel (only the doorway's source is picked by colour, inside the door's rect). The light is applied in linear light,
out = base x E + G (E the multiply map: shade < 1, light > 1; G the additive glow), each map moved by its plane's float;
the caption band and the captions are pasted back from v6. It relights the composited frame, so a light cannot pass
behind a thing drawn later: production bakes per plane (§4.2). Two doses: 1.0 (the spec's values) and 1.6 (every light
layer x1.6). The sheet: `light_sheet.jpg`; the motion: `light_motion.mp4` (§6.4).

### 6.1 Measured (CIE L*, region means; v6 -> dose 1.0 / dose 1.6)
| | 1.0 s (the doors open, she steps out) | 1.6 s (in the doorway) | 2.4 s (G1 beside her) |
|---|---|---|---|
| The lobby (the story light's source) | 88.9 -> 92.0 / 93.3 | 88.2 -> 91.4 / 92.8 | 87.1 -> 90.2 / 91.6 |
| The pool on the towpath before the door | 82.5 -> 90.2 / 92.3 | 77.3 -> 83.8 / 85.7 | 69.5 -> 74.7 / 76.7 |
| Her | 46.8 -> 54.2 / 57.1 | 45.7 -> 50.9 / 52.9 | 42.1 -> 46.0 / 47.5 |
| The backlit facade | 63.2 -> 54.9 / 48.6 | 62.9 -> 54.6 / 48.3 | 62.9 -> 54.7 / 48.4 |
| The lobby above the facade | +25.7 -> +37.1 / +44.7 | +25.3 -> +36.8 / +44.5 | +24.2 -> +35.5 / +43.2 |
| Our near bank | 55.0 -> 42.3 / 39.0 | 55.0 -> 42.3 / 39.0 | 55.1 -> 42.3 / 39.0 |
| The sky by the sun | 89.6 -> 91.5 / 92.3 | 89.6 -> 91.5 / 92.3 | 89.5 -> 91.5 / 92.3 |
| Darks (L* < 40), % of the frame | 6.7 -> 14.7 / 23.8 | 6.8 -> 14.8 / 23.9 | 6.8 -> 14.7 / 23.9 |
| Median L* | 66.9 -> 61.4 / 59.9 | 66.9 -> 61.2 / 59.8 | 66.9 -> 61.1 / 59.7 |
| The brightest 5 % below the sky, to her (H) | 0.155 / 0.147 (far planes out: 0.071 / 0.071) | 0.160 / 0.153 (0.071 / 0.071) | 0.135 / 0.130 (0.068 / 0.067) |
| The caption band, max change (codes) | 0 | 0 | 0 |
| The bake, one core (s) | 7.5 / 5.7 | 7.0 / 7.0 | 7.5 / 7.2 |

Determinism: every frame baked twice gives the same md5, and the same md5 as the earlier session's run on a restarted
machine (1.0 s at dose 1.0: `f3f870b9...`). The bake is per frame here only because the proof relights whole frames;
production bakes each plane's maps once per state (S1: ~6 planes x 2 door states), so nothing is baked per frame.

### 6.2 What reads (the sheet, at phone width)
- **The doorway is the place to look**: the one warm-white opening in a facade now in rose-plum shade, +37 L* above it
  (+45 at dose 1.6, against +25 in v6), with its pool on the towpath, her wrap, and the dark bank below framing it.
- **Three value zones, as the references have**: the pale sky and far city, the mid facade and water, the dark near
  bank. The darks go from 7 % of the frame to 15 % (24 % at 1.6), the median from 67 to 61.
- **The light on her follows her with no keys**: her lift is +7.4 L* as she steps out (1.0 s), +5.2 in the doorway
  (1.6 s), +3.9 by G1 (2.4 s), because the wrap is weighted by the opening's blurred light at her edge (§4.7).
- **The sun is the key without stealing the eye**: a gentle glow low at the left (+2-3 L* by the disc), gold edges on
  the skyline; the brightest 5 % below the sky sits 0.07 H from her once the far planes are left out (§9 D-L5).
- **Dose**: 1.0 is the safe step; 1.6 is closer to the references' contrast (01's fronts sit at L* 37; our facade at
  1.6 is 48). The owner picks at G4.

### 6.3 What does not work yet (the honest list)
1. **v6's day shadows are still drawn inside the new shade.** RIG_CANAL's casts (the cafe table's, the chairs', the
   posts', all to the right) stay under the near bank's shade mass, and a thing in shade casts no sun shadow.
   Production turns those casts off inside a shade mass and keeps the contact shadows (§4.6); it is the rig bug of §3.
2. **The near bank's leafy edge is one procedural edge across the frame**: it reads as a hedge's shadow, its rhythm a
   little even. The production edge is the canopy's shadow designed as a shape (the shapes lane's generator,
   `shapes.md`): clumps of three sizes in an uneven rhythm, holes of light near the edge, a 10-30 px penumbra.
3. **The two warm dapples read as soft discs** at phone width. A dapple is the sun's image through a gap in the leaves:
   an ellipse stretched along the light, in a cluster of uneven sizes. Production breaks each into such a cluster or
   drops it.
4. **No light on the jambs and soffit**: the door's white surround sits in the facade's shade; §2.7 wants the lobby's
   light on the jambs' inner faces (a 6-10 px lift in the light's colour).
5. **A frame relight cannot put light behind a thing drawn later** (the pool passing behind Pip's bollard, the boats);
   per-plane maps can (§4.2).

### 6.4 The motion proof (`light_motion.mp4`, `light_motion.py`)
1.0-2.4 s at 30 fps (she steps out and walks west; G1 arrives), v6 beside dose 1.0. The static light rides each plane's
float; her rim, wrap and door shadow are recomputed from her mask on every frame (43 frames, ~8 s each on one core,
two processes). Measured on the 43 frames:
- **The static light holds still**: the light's mean effect varies by 0.02 L* on our bank, 0.04 on the facade and 0.05
  by the sun across the 1.4 s.
- **Her light changes smoothly**: 7.3 -> 3.5 L* as she leaves the opening's light, the largest step between two frames
  0.97 L* (at 30 fps; half that at 60).
- **Nothing flickers**: the frame-to-frame change of the light, away from what moves, is 0.30 L* at p99 (median frame;
  0.52 at most) once the proof's per-frame dither is averaged out (with it: 0.79 / 1.0, the dither's own +-0.5 code).
  Production bakes the dither into the static maps once, so the light adds no grain that changes per frame.
- The MP4 encodes to the same bytes twice (md5 `5c3018bd...`).

## 7. Cost and determinism (the bench, in the real render path)

**The bench.** `light_proto/LightBench.tsx` draws v6's scene 1 (`PaintS1` set `v6`) with ONE kind of light layer over
it (`n` copies), and `run_bench.py` renders the same frames through `scripts/render-frames.mjs` at concurrency 1 (GL
`angle`, as the paint bakes render) and reads its ms per frame; each kind's frame at 1.6 s is then rendered twice in
fresh renders and compared by md5. Her live layers follow her silhouette walked west at her pace. The maps are the
proof's own at 1.6 s, dose 1.6 (`make_assets.py`, written outside the repo); all but the `solved` one are encoded the
naive way (§4.11), which changes their look, not their cost. Four runs (30, 60, 60 and 60 frames); the box is shared
with another workflow, so the baseline moves by 25-50 ms between runs (the `none` rows): a difference under ~40 ms is
noise.

| Kind (drawn over v6) | Run 1 (30 frames) | Run 2 (60 frames) | Runs 3-4 (60 frames) | Against `none` |
|---|---|---|---|---|
| `none` (v6 alone) | 577, 608 | 566, 564, 540 | 553, 541, 550 | the baseline |
| `lightOff` (v6 with lib/light's layers off) | | 209 | 213 | **-340 ms** |
| `svgEmpty` (an empty overlay svg) | 605 | | | noise |
| `gradPool` (vector falloff: the pool, the sun's glow, the door's bloom as gradients) | 606 | | | noise |
| `bloomLive` (3 blurs on the door's rect, the region cropped) | 566 | | | noise |
| `bloomLiveFull` (the same, the filter region the whole frame) | 592 | | | noise |
| `bloomLive` x4 | 690 | 541 | | noise to +100 |
| `rimMask` (her two-step rim: the silhouette minus its shifted copy) | 590 | | | noise |
| `rimMask` x4 | 598 | 571 | | noise |
| `rimFilter` (the same rim as one SVG filter) | 560 | | | noise |
| `wrap` (the light wrap: one small filter with an `feImage`) | 596 | | | noise |
| `shadowProj` (her door shadow, 101 points projected per frame) | 603 | | | noise |
| `shafts` (two gradient wedges) | 596 | | | noise |
| `dither` (a 128 px `feTurbulence` tile, soft-light, 1300 px tall) | 627 | | | +35 |
| `screenOnly` (ONE screen map, cropped to 1080 x 819) | | 559 | | noise |
| `shadeOnly` (ONE full-frame multiply map, 1/4 res) | | 626 | | +69 |
| `mapCrop` (the three maps, each cropped to its box) | | 601 | | +44 |
| `mapMerged` (the shade + ONE merged screen map, cropped) | | 658 (load 5.2) | | +40-100 |
| `mapImg` (three full-frame maps: multiply, screen, screen) | 723 | 714 | | +130-160 |
| `mapImg` x4 (12 full-frame blended images) | 1191 | | | +600 (~50 each) |
| `all` (`mapImg` + `gradPool` + `bloomLive` + `rimMask` + `wrap` + `shadowProj` + `shafts`) | 762 | 725 | 731 | +170-185 |
| **`proposal`** (`lightOff` + ONE multiply map holding the new shade AND v6's static shadows + ONE screen map, both cropped + her live rim, wrap and shadow) | | | 256 | **-290 ms** (+43 over `lightOff`) |
| **`solved`** (`lightOff` + the same multiply map + the screen map SOLVED for the browser's blend, §4.11; her live layers left out) | | | 225 | **-325 ms** (+12 over `lightOff`) |

What it says:
- **Light on movers is free at our sizes**: every live vector layer (the rims, the wrap, the projected shadow, shafts,
  gradient pools, a bloom on a cropped region) is within the noise, alone and four at a time.
- **The cost is the full-frame blended image**: ~40-70 ms each (an `<image>` over 1080 x 1920 with `mix-blend-mode`),
  +600 ms for twelve. Crop every map to its box, merge what can be merged (one multiply and one screen map per plane at
  most), and fold a shade that never changes into the colours (home 1, 0 ms).
- **v6's own light is today's expensive part**: with lib/light's layers off, v6 renders in 209-213 ms instead of ~550
  (-340 ms, about 60 % of the frame). lib/light draws each mask and tint over its REGION (2280 x 3120 px, 3.4x the
  frame: `src/lib/light.tsx`) in many separate multiply groups, the likely cause (not profiled here: flagged in §9).
- **Proper light can make the frame cheaper than v6 is today**: the proposal (v6 with lib/light's live layers off; ONE
  cropped multiply map holding the new shade and v6's static shadows; ONE cropped screen map; her live rim, wrap and
  shadow) renders in 256 ms per frame against v6's ~550: -290 ms, with all of §5's light in it; the two maps alone
  (`solved`) cost 12 ms over `lightOff`. (Her own form shade, live in lib/light today, would stay live: one mover's
  layer, within the noise once its mask is cropped to her box.)
- **The spec's maps give the proof's light in the real browser**: with the screen map solved (§4.11), Chrome's own
  blends reproduce the linear bake within 0.48 L* (mean; p99 1.7, max 2.7; 0.08 % of the pixels over 2 L*) outside
  her, the row and the band, where the bench's naive maps miss by 1.14 (p99 8.2; 11.5 % over 2 L*: the shafts and the
  pool visibly too bright).
- **Deterministic**: every kind's 1.6 s frame, rendered twice in fresh renders, gives the same bytes (all 36 rows).

## 8. Libraries and licences
| Library | Use here | Licence | Status |
|---|---|---|---|
| NumPy 2.5.3 | the bake | BSD-3-Clause | in use (already a QA dependency) |
| OpenCV (cv2 5.0.0) | the exact distance transform, the blurs, the homography warp, the radial accumulation | Apache-2.0 | in use (already a QA dependency) |
| SciPy 1.18.1 | an alternative exact EDT (`ndimage.distance_transform_edt`) | BSD-3-Clause | not needed |
| Remotion 4.0.538 + the Chromium headless shell 1243 | the render; SVG blend modes, gradients, masks and filters (W3C Compositing and Blending, SVG filter effects: source 8) | Remotion's licence (the project's existing stack); Chromium BSD-3 | in use |
| pixi-filters (GodrayFilter, AdvancedBloomFilter) | WebGL god rays and bloom | MIT | rejected: a second renderer, and WebGL runs on SwiftShader here (techniques.md §3.12: a full-frame copy 47-62 ms, a domain-warp shader 0.2-0.3 s per frame), where our baked maps cost ~12 ms (§7) |
| pmndrs postprocessing (BloomEffect, GodRaysEffect) | three.js post effects | Zlib (on three.js, MIT) | rejected: same reasons |
| LYGIA (shader functions) | GLSL bloom, light, SDF helpers | Prosperity (non-commercial) + Patron (sponsors); its mixBox files are separately non-commercial | **banned in production** unless a commercial licence is bought |
| Mixbox | pigment mixing | CC BY-NC 4.0 | **banned** (repo rule) |
| ffmpeg 6.1.1 (the system's build, with libx264) | encodes the motion proof | GPL-2.0+ in this build | a tool run here, never shipped; its licence does not reach the videos it encodes |

No new dependency is proposed: everything here is numpy, OpenCV and the SVG we already render.

## 9. Doc clashes found (flagged for the orchestrator, not edited here)
- **D-L1.** CRAFT §d.7 ("A halo: at most 1.7x the lantern, one step on the sky, or none: show light on what it hits,
  never as discs ... No symbolic glow") and §d's code line ("Soft edges: 2 flat steps, no `feGaussianBlur`") against the
  playbook's PROPER LIGHT ("a soft glow and gentle bloom around the source itself ... This replaces the old 'no glow, no
  gradient' caution for light"). Proposed CRAFT wording: "A source gets a soft glow and a gentle bloom AT it: three
  sigmas of ~0.1 / 0.4 / 1.2 x its size, at most +6-8 L* at its edge, +2 one size away, none past three; on emitters and
  their reflections only, never on a lit surface, never a disc or ring. A falloff may be a smooth, dithered ramp in a
  baked light map; vector pools may keep two flat steps."
- **D-L2.** CRAFT §d.8 and DIRECTION rule 5 ("rim light only on the subject") against the playbook ("lit edges (rim
  light) on what it touches"). Proposed: "rims on what the key and the story light touch, by tier: the subject 4-6 px,
  +12-18 L*; B 2 px, +6-8; C 1.5-2.5 px, +4-8; far planes none".
- **D-L3.** `src/lib/LIGHT.md` and `src/lib/light.tsx`'s headers ("a light is a flat step ... never a glow disc. A soft
  edge is two flat steps ... no blur, gradient or opacity fade"): the engine's pages; update them when the light map and
  bloom land (the techniques lane flagged the same header, `techniques.md` §8).
- **D-L4.** CRAFT §d.5 ("Cast shadow ... 0.3-0.8 h long under a sun") against a dusk sun (8.9 deg in S1: ~6.5 h).
  Proposed: "at golden hour 1.5-2.5 h, the far end fading; a sun on the roofline puts the ground in shade instead".
- **D-L5.** CRAFT §d.2's check ("the brightest 5 % ... (the sky and the caption band left out)") fails by design in a
  shot whose sun is in frame over a pale far city (S1 relit: 0.15-0.16 H with the far planes in, 0.07 without).
  Proposed: leave out the far planes (+3 and beyond) too: they are the sky's air.
- **D-L6.** §4.2 places a light map "like a painted piece", but `lib/paint` `PaintedLayer` has no blend mode today:
  the map needs a `blend` prop (multiply | screen) on it, or a small `LightMap` beside it that reuses its slot, its
  `from` and its reveal (the flood). Shared code: flagged, not edited.
- **Not a doc clash, a rig bug:** v2's `RIG_CANAL` (el 36 deg, toward 15) lights S1 as a day scene under a sunset sky
  whose sun sits at 8.9 deg (§3).
- **Not a doc clash, a cost flag:** v6's lib/light layers cost ~340 ms of its ~550 ms frame (§7). `src/lib/light.tsx`
  draws masks and big tints over its REGION (2280 x 3120 px, 3.4x the frame), in many separate multiply groups; cropping
  each mask to its shape's box (plus its blur or offset) is the likely fix, to be profiled by whoever owns lib/light.

## 10. Sources (methods only)
The session's network blocked direct page fetches (only search summaries were readable), so each source is cited for
what its search summary and our own knowledge of the method agree on; nothing is quoted beyond a few words.
1. Klaus's light-and-shadow tool (KLaS; key, bounce, ambient, occlusion, rim; tracking and in-betweening):
   animatorsguild.com/?p=5287;
   cartoonbrew.com/feature-film/how-klaus-draws-on-centuries-old-artistic-principles-to-push-2d-animation-forward-182325.html
2. Anime compositing (撮影; 透過光 transmitted light; パラ coloured paraffin; ufotable's light and bloom in compositing):
   animenewsnetwork.com/feature/2018-01-10/interview-yuichi-terao-chief-of-ufotable-digital-team/.125658;
   neec.ac.jp/tuitionfreedat/syllabusdat/pdf/2021/hac/21LA038.pdf
3. Light wrap: learn.foundry.com/nuke/14.1/content/reference_guide/draw_nodes/lightwrap.html;
   natron.readthedocs.io/en/v2.4.2/plugins/fr.inria.LightWrap.html
4. Golden hour (a low sun's light gold to orange, roughly 2000-3500 K) and complementary shadows:
   gurneyjourney.blogspot.com/2008/01/golden-hour.html; gurneyjourney.blogspot.com/2014/09/complementary-shadows.html;
   en.wikipedia.org/wiki/Golden_hour_(photography)
5. Bloom (SIGGRAPH 2014, Advances in Real-Time Rendering):
   iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/
6. Light shafts (GPU Gems 3 ch. 13):
   developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process
7. 2D light layers: docs.unity3d.com/Packages/com.unity.render-pipelines.universal@15.0/manual/LightBlendStyles.html;
   docs.godotengine.org/en/4.5/tutorials/2d/2d_lights_and_shadows.html
8. Blending and SVG filters: w3.org/TR/compositing-1/; developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode;
   developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
9. Distance transforms: theoryofcomputing.org/articles/v008a019 (Felzenszwalb and Huttenlocher, Theory of Computing 8,
   2012)
10. Falloff on a plane (the cosine-cubed law): schorsch.com/en/kbase/glossary/point-by-point.html
11. Crepuscular rays and shadows in perspective: scientificamerican.com/article/what-are-crepuscular-rays;
    atoptics.co.uk/atoptics/rayim8.htm; studiochalkboard.evansville.edu/lp-shadow.html
12. Lighting for story (SIGGRAPH 96 course 30, Pixel Cinematography: "Storytelling Through Lighting"):
    history.siggraph.org/wp-content/uploads/2021/08/1996-30-Contents-Pixel-Cinematography-A-Lighting-Approach-for-Computer-Graphics.pdf
13. Fortiche's hand-designed light:
    redsharknews.com/why-netflixs-arcane-looks-so-good-how-fortiche-ramped-up-the-animation-pipeline
14. Painting light: a glow as a core plus an aura that tints what it reaches (screen and add layers), and a rim as light
    on a turning form, uneven, never an even outline: instructables.com/How-to-Draw-Light;
    tips.clip-studio.com/en-us/articles/1178; muddycolors.com/?p=43890; glass.photo/photography-terms/rim-light
15. Painted light masks reacting to moving lights (Ori and the Will of the Wisps):
    wccftech.com/ori-and-the-will-of-the-wisps-dynamic-lighting/ Licences: npmjs.com/package/lygia,
    unpkg.com/resolve-lygia@1.0.4/LICENSE.md (LYGIA); jsdelivr.com/package/npm/@pixi/filter-advanced-bloom
    (pixi-filters); pmndrs.github.io/postprocessing (postprocessing).

## 11. Rerun
From `video/`; outputs go to `/tmp/organic/light/` (nothing big is committed but the sheet and the MP4). The bake is
seeded (sha256) and gives the same bytes on every run.
```bash
L=docs/look/organic; R=/tmp/organic/light/renders
# 1. the engine's renders of v6, seven ways (1.0, 1.6, 2.4 s; the motion proof: 1.0-2.4 s every 1/30 s into renders_m)
for v in base:'{"set":"v6","captions":false}' cap:'{"set":"v6"}' \
         norow:'{"set":"v6","captions":false,"rowHidden":true}' \
         nosky:'{"set":"v6","captions":false,"pieces":["tree","water","flock","farroofs","fartower"]}' \
         skyonly:'{"set":"v6","captions":false,"pieces":["sky","clouds_p1","clouds_p2","clouds_p3","flock"]}' \
         nopip:'{"set":"v6","captions":false,"pipHidden":true}' lightoff:'{"set":"v6","captions":false,"lightOff":true}'; do
  GL=angle node scripts/render-frames.mjs PaintS1 $R/${v%%:*} 1.0,1.6,2.4 --entry=src/entry-look-paint.tsx \
       --concurrency=2 --props="${v#*:}"
done
# 2. the proof (§6.1) and its sheet
python3 $L/light_demo.py $R /tmp/organic/light/out --times=1.0,1.6,2.4 --doses=1.0,1.6 --repeat=2
python3 $L/light_sheet.py $R /tmp/organic/light/out $L/light_sheet.jpg
# 3. the motion proof (§6.4): the loop of 1 (all but lightoff) again, into /tmp/organic/light/renders_m at these
#    43 times instead of 1.0,1.6,2.4, then
T=$(python3 -c "print(','.join(f'{1.0 + i/30:.5f}' for i in range(43)))")
python3 $L/light_demo.py /tmp/organic/light/renders_m /tmp/organic/light/out_m --times=$T --doses=1.0
python3 $L/light_motion.py /tmp/organic/light/renders_m /tmp/organic/light/out_m --out=$L/light_motion.mp4
# 4. the blend-space check (§4.11)
python3 $L/light_blendspace.py /tmp/organic/light/renders_m 96 1.0
# 5. the bench (§7)
python3 $L/light_proto/make_assets.py $R /tmp/organic/light/proto_gen --t 1.6
NF=60 python3 $L/light_proto/run_bench.py /tmp/organic/light/bench3 none=1 lightOff=1 proposal=1 all=1 solved=1 none=1
# 6. the solved maps end to end in Chrome (§4.11, §7)
GL=angle node scripts/render-frames.mjs LightBench /tmp/organic/light/solved 1.6 --entry=$L/light_proto/entry.tsx \
     --concurrency=1 --props='{"kind":"solved","n":1,"lightOff":true}'
python3 $L/light_blendspace.py $R 96 --browser=/tmp/organic/light/solved/f00096.png \
     --target=/tmp/organic/light/proto_gen/solved_target.npy
```
