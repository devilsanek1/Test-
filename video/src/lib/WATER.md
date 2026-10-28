# lib/water.tsx: the film's ONE shared water

**Why it exists.** The owner on video 2's G4 look clip v5 (2026-10-28): "I don't like the water too much, leafs are great"
... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the
water." v5 was a flat mint band with box-shaped reflection patches, scattered white dashes and four-point stars. The
playbook's DEPTH AND SEPARATION rule asks for water with the same clean, premium, refined drawing as everything else, as
ONE shared component. **Rank:** a how-to. The owner's words, `docs/look/DIRECTION.md` (rule 6's reflected-sky exception)
and `docs/look/CRAFT.md` §f.7 (the rules) outrank it. Optics and sources: `docs/look/research/2026-10-28_water.md`
(R1-R14). Why this design: `docs/v2/water/JUDGE.md` (candidate A's engine and cool colour, candidate B's drawing).

## What it draws (bottom to top; raw SVG with computed colours: the pen's tier pull never re-tints it)
1. **The ramp:** the shot's own `lib/sky` preset mirrored about the horizon (water y shows the sky at 2 hz - y), toned
   toward the water's body: the far water keeps the warm horizon (value toned only), a light veil of the body's hue
   crosses, the teal body shows near us (R2). It is a `lib/sky` spec over the water's box (eased OKLab curve, blue-noise
   dither), held still on screen while the water plane floats. It is the ONE gradient in the water.
2. **Reflections:** every thing over the water, as a screen polygon with its own waterline (`axis`), mirrored (R1) and
   toned by a flat Fresnel ladder in CIE LCh (`reflectTone`: hue from the water, value from the world, a light keeps
   its colour; R3-R4). Each is ONE solid block, its sides sampled every 4 px and bent by the sway (never a stair-step),
   its bottom corners rounded, down to >= 55 % of its visible length; then level bars with tapered ends on ONE shared
   perspective grid. Bars start only where a band is >= `barPitch` px (7): the far water is a near-perfect mirror, so a
   far reflection stays whole. Each band's gap is a tone-on-tone trough (the bar's hue, <= 3.5 L* toward the open water;
   a light's slivers part on the open water instead, R7). The envelope narrows smoothly toward the end; a band breaks
   once at most, only in its last half, static and seeded; the very last may drop.
3. **Quay pieces:** `draw: 'crisp'` (a contact band: the quay's face mirrored, one flat still shape) and `draw: 'stub'`
   (a bollard's reflection: a short vertical ending in its dome).
4. **The glitter** (R8) under `sun`, between the reflections and the quay layer (`quayLayer`, default 30): a STILL bed,
   one gold lens per band of the column (its half-width a (y - hz) + f a sin e; longest at the sun's mirror point
   2 hz - y_sun), swaying with its band; in its longer lenses up to 6 warm-white slivers (each slot owns its own lenses),
   growing in along their length, holding, shrinking out, then resting >= 0.12 s. These are CRAFT §f.6's glints.
5. **Shades** (optional): closed paths multiplied by the rig's water tint (`tint`, `shades`: a bank's shade, R10).
6. **Ripple lines** (R9): `slots` long tapered lenses drifting with the breeze; a crest across a reflection (its own
   tone +8 L*), a trough across the open water (-0.04 OKLab L); the tone is decided once per life, never flips.
- **Floaters** (`floaterWater`): a thin dark contact lens at the waterline and the underside mirrored as 2-3 tapered
  bars, drawn by the floater's own component under its body (S1's duck).
- **`lod: 'far'`** (R14): a strip whose rows are under 2 px: each reflection one flat shape at its far tone (no bars,
  no sway), 2-4 still current lines, <= 6 flecks of 2-6 px in the sun's column.
- **Frame 0:** before the flood front (`flood`) reaches it the water is flat pale shapes (the reflections whole, mixed
  `pale` toward the paper); the colour floods in clipped to the front's circle.

## The API (`src/lib/water.tsx`)
| | what |
|---|---|
| `<Water spec t />` | the whole water, in the shot's water slot (inside the water plane's parallax group, before everything that stands in or over it) |
| `WaterSpec` | `id`, `seed`; `cam` {horizon, f, eye over the WATER (m)}; `region` {top(x), bottom(x), x0, x1, tucks}; `sky` (the shot's preset), `air`; `body` (the near water's colour); `tint`, `shades`; `tier`; `ramp` {yFar, yNear, toning}; `tone` (TONE_DEFAULT, `warmMemory` 0); `ladder` {k: [0.40, 0.72], y, step 0.05}; `grid` {dz 0.45, minPitch 3, gap [0.16, 0.26], barPitch 7, gapMix 0.4}; `sway`; `sources`; `moving(t)`; `sun`; `ripples`; `float(plane, t)` + `skyPlane`; `flood`; `joins`; `lod`, `farLod` |
| `WaterSource` | `id`; `thing` + `axis` (number = a level waterline, `'horizon'`, `{a0, s}` = R1's affine sloped quay, `{line: (x) => y}`) or `refl` (already mirrored); `color` (on screen); `kind` body / light / figure; `layer`, `plane`; `draw` mass / crisp / stub; `solid` (>= 0.55), `breakup`, `narrow`, `taper`, `sway`; `sep` {from, dL} (a value step kept from another source at every step), `dL` |
| `waterFrame(spec, t)` | the pure per-frame build (runs, ripple lines, bed, slivers): node QA reads what the picture draws |
| `waterProblems(spec, {t1, otherAlive})` | the lint: no tone in the beige / olive / grey bands, a cool body, every thing above its waterline and inside the water's span, solid >= 0.55 and tapered ends, a far strip on `lod 'far'`, calm sway (<= 3 / 7 px, waves 0.2-0.6 m/s, slices <= 15 px/s), 6-14 ripple slots of >= 40 px drifting <= 25 px/s, the glitter under the sun and inside R8's column, slivers 20-36 px, lit 0.25-0.8 s, <= 6 alive and nested in the bed, <= 16 with the shot's other particles, a flood declared, no field born in a join's window |
| `waterPalette(spec)` | every colour with L* / C* / h and its band (the palette QA hook) |
| helpers | `mirrorPoly`, `affineMirror` (an SVG matrix), `axisY`, `reflectTone`, `neverBand`, `cleanColour`, `waterStep`, `crestOf`, `waterRamp`, `rampColour`, `floaterWater`, `waterColourAt`, `waterKAt`, `waterSwayAt`, `camZ` / `camY` / `camFresnel` / `pxPerMDeep`, `WATER_LIMITS` |

Demo: `src/entry-v2r-water.tsx` (`WaterFarSample`, `WaterAffineSample`; their specs in `src/lib/water_samples.ts`).

## S1's numbers (`src/v2r/scenes/V2S1_water.tsx`; DIAGNOSIS §2 has the geometry)
- **Camera:** horizon 965, f 1400, eye 1.45 m over the water. **Grid:** 0.45 m bands: 4.7 px at the far edge (y 1111),
  12 px at 1200, 23 px at our edge; gaps 16 -> 26 % of the pitch; bars from y ~1143 (the first 7 px band).
- **Tone:** k 0.40 (far) -> 0.72 (near) in steps of 0.05; TONE {waterL 76, waterH 182, waterC 10, hueSlope 0.9,
  chromaSlope 0.32, C* 6.5-16}: the wing's brick #95B4B0 (L* 71) far -> #9EBBB6 (73.7) near; the lit lobby #ECC583 (L*
  81.5, C* 39); the arch's ring L* 84.1 over its soffit 77.6 (`sep` -6.5: the ellipse closes with a clear step).
- **Sway:** +-1.4 px far -> +-4.4 px near; waves 3.2 m / 7.0 s and 1.6 m / 4.2 s (0.46 / 0.38 m/s toward us).
- **Glitter:** x 196, rows reflTop - 3 .. our edge + 3, slope 0.06 rad; 12 bed lenses 21-56 x 3-6.2 px (L* 82, C* 34,
  h 74); 6 sliver slots: ~4 alive (max 6), 20-34 px, L* 97.5, lit 0.46-0.78 s, from 0.30 s.
- **Ripples:** 11 slots (6-11 alive on every frame), 40-150 px, 1.5-3 px, drift 6-16 px/s east, lives 2.6-4.6 s, rests
  0.2-0.7 s; clear of the glitter column and Pip's seat; a steady field from frame 0, revealed by the flood.
- **Simplified (R5), and why:** the door's stiles and the bridge's railing are left to the set (they split the gold
  column and combed the bend); the row reflects as its LEGS (0.19 h: a flat coat block read as a box), the outlines
  O1-O3 reflect nothing; each boat is ONE dark band (hull + gunwale with the bow's sweep; the cabin and cratch only
  fragmented it); the duck's ring is off (one more mover and line).
- **Measured** (docs/v2/water/judge_metrics.py against v5, at 1.0 / 2.5 / 3.8 / 5.0 s): cool 85.9 / 85.0 / 83.5 /
  83.4 % (v5 85-88), warm 12.3-13.8 %, under the sky 8.2-8.5 % cool; dx edges 50.5 / 60.3 / 65.4 / 67.1 per 1000
  (A was 81-111, B 58-84); marks 12-16 (A 27-32); glitter gold 974-1030 px (A 128-354); Pip dE 28; motion over
  2.50-3.48 s: 0.47 % px changing per frame, 0.69 % quick toggles (v5 0.33 / 0.60); +8 to +32 ms per frame; f150 and
  f300 byte-identical in three processes.

## Recipes (each lane builds its own spec; never hand-roll a water)
- **Every canal shot at evening (S2, S3, S4, S8):** copy S1's spec shape: your `groundCam`'s horizon and focal, the eye
  over the WATER; `region` from your set's water edges (tuck under the banks); `sky` your `S<n>_*` preset, `body`
  `#9CC3BC`, `tint` TINT_CANAL.water; one `WaterSource` per mass, vertical and light over the water, its `thing` the
  polygon you draw and its `axis` its own waterline; `sun` only where the sun is in frame; `ripples` 6-14 slots clear of
  your mascot's seat; `float` your shot's per-plane counter-shift inside the water's group; `flood` your frame-0 front if
  the shot opens; run `waterProblems(spec, {t1, otherAlive})` and the judge's measures before you report.
  - **S2** (the receding canal): the far quay's waterline is a sloped line: `axis: {a0, s}` (R1's affine map; mirrored
    edges follow the slope exactly; `affineMirror(a0, s)` mirrors a whole group the same way); the passing boat is a
    `moving` source; the two ducks take `floaterWater`. Not built yet: a moving boat's wake (a wide Kelvin V, R11).
  - **S3** (the canal + the sliver under our hull): two specs (or one region covering both); the sliver is a steep view:
    `ladder.k` ~[0.7, 0.8] (mostly body), the hull's dark reflection its one mass.
  - **S4 / S8** (the kit's `Water` band in `kit/canal/sets.tsx`): the set's band as `region`; S8's lamps lit at sunset
    as `kind: 'light'` sources 8-14 px wide (gold columns, R7) with `S8_EVENING` as the sky.
- **S5, the Potomac on an April morning** (a 23 px far strip): `lod: 'far'`, `sky: S5_SKY` (the morning's own keys), the
  far shore and the bridges' arches as `sources` mirrored flat, `sun` for 2-6 px flecks, `farLod.lines` 2-4; the sample
  `WATER_FAR_SAMPLE` (lib/water_samples.ts) is the recipe. A morning sun is higher: a wider, shorter column (R13).
- **The colour identity** stays the owner's knob: `tone.warmMemory` (0..1, off) lets a warm mass keep its hue family in
  the far steps at C* <= 12 through violet to mauve; use it only if the owner asks for a warmer canal, and only while the
  water stays >= 80 % cool (research §5.6, JUDGE G8).

## Lessons (each was a fail on the way; the next water starts past them)
- Light gaps between bars across a big reflection read as stripes (v5's "dashes" in a new form): troughs are
  tone-on-tone; the light lines are the few ripple crests.
- Far reflections sliced on 3-5 px bands read as a barcode: bars start at a 7 px band.
- A box under a figure (its coat as a flat block) reads as v5's patches: reflect the legs only.
- Small fragments (cabins, cratches, door stiles, railing posts) are what makes a reflection look procedural: one plane
  simpler than the thing.
- A ripple line that changes tone as it drifts, a sliver that re-lights within 0.1 s, a glitter bed that breathes to
  nothing: each is a flicker; fields keep their pace and their tone.
- A 1 px seam of light between a contact band and the reflections under it (the row's feet stand 1 px above the coping):
  the band runs 2 px over the reflections' start.
- Rendering on a full disk: Chrome falls back to shared memory files on the temp disk and the page crashes; render with
  `TMPDIR` on `/dev/shm` when the disk is tight.
