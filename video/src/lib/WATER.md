# lib/water.tsx: the film's ONE shared water

**Why it exists.** The owner on video 2's G4 look clip v5 (2026-10-28): "I don't like the water too much, leafs are great"
... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the
water." v5 was a flat mint band with box-shaped reflection patches, scattered white dashes and four-point stars. The
playbook's DEPTH AND SEPARATION rule asks for water with the same clean, premium, refined drawing as everything else, as
ONE shared component. **Rank:** a how-to. The owner's words, `docs/look/DIRECTION.md` (rule 6's reflected-sky exception)
and `docs/look/CRAFT.md` §f.7 (the rules) outrank it. Optics and sources: `docs/look/research/2026-10-28_water.md`
(R1-R14). Why this design: `docs/v2/water/JUDGE.md` (candidate A's engine and cool colour, candidate B's drawing).

## What it draws (bottom to top; raw SVG with computed colours: the pen's tier pull never re-tints it)
1. **The ramp:** the shot's own `lib/sky` preset mirrored about the horizon (water y shows the sky at 2 hz - y), a
   FRESNEL STEP under it (OKLab L - 0.05 at the far edge: ~5 L*, so the far water is >= 4 L* under the air and never the
   lit ground's colour), toned toward the water's body: a light veil of the body's hue crosses, the teal body shows near
   us (R2). Through the whole warm-to-cool crossing (CIE h 30-168) the chroma is held in the CLEAN GAP, C* 4.7-5.5
   (`rampGap`: the beige and olive bands start at 6, grey under 4): the far water is a pale warm pearl (S1: #D7CDC5, L*
   83, C* 5.6), as the sky's own light band crosses at C* <= 6, never peach paving, beige or olive. It is a `lib/sky` spec
   over the water's box (keys every 8 px, or every 1/20 of a short strip; eased OKLab curve, blue-noise dither), held
   still on screen while the water plane floats. It is the ONE gradient in the water.
2. **Reflections:** every thing over the water, as a screen polygon with its own waterline (`axis`), mirrored (R1) and
   toned by a flat Fresnel ladder in CIE LCh (`reflectTone`: hue from the water, value from the world, a light keeps
   its colour; R3-R4). Each is ONE solid block, its sides sampled every 4 px and bent by the sway (never a stair-step),
   its bottom corners rounded, down to >= 55 % of its visible length; then level bars with tapered ends on ONE shared
   perspective grid. Bars start only where a band is >= `barPitch` px (7): the far water is a near-perfect mirror, so a
   far reflection stays whole. Each band's gap is a tone-on-tone trough (the bar's hue, <= 3.5 L* toward the open water;
   a light's slivers part on the open water instead, R7). The envelope narrows smoothly toward the end; a band breaks
   once at most, only in its last half, static and seeded; the very last may drop. `solid: 1` is WHOLE (one shape to
   its end: a far thing in the far water, a near mirror); `maxBars` caps a thin thing's bars (S1's pier and lamps: 2).
   - **A light** (`kind: 'light'`, `LightOpts`) is LIGHT ON WATER: a short solid block (<= 35 % of its visible length,
     its bottom a gentle static ripple of 2.2 px, so no row carries the whole gold-to-water edge), then <= 3 LEAF slivers
     on the open water (pointed at both ends, flanks 1 - |u|^1.5), each 0.62 as long (the first: 0.62 x the block's
     width) and 0.85 as thick as the one above, seeded a little off the middle, each swaying with its row; the water
     between them >= 4.5 px (the encode's 4:2:0 keeps 2 rows of every gap teal); its tone a step (6 L*) under its source,
     falling 1.3 L* a sliver.
3. **Quay pieces:** `draw: 'crisp'` (a contact band: the quay's face mirrored, one flat still shape) and `draw: 'stub'`
   (a bollard's reflection: a short vertical ending in its dome).
4. **The glitter** (R8) under `sun`, between the reflections and the quay layer (`quayLayer`, default 30): a STILL bed,
   one amber lens per band of the column where the band is >= 5 px (`lensPitch`: the far rows are a near mirror), 0.8
   of its band thick and 0.85 of the envelope long (`lensLen`; its half-width a (y - hz) + f a sin e; longest at the
   sun's mirror point 2 hz - y_sun), swaying with its band; in its lenses >= 4.5 px tall up to 6 gold-white slivers (each
   slot owns its own lenses), >= 3.5 px tall at their middle at full length (`SLIVER_H`), growing in along their length,
   holding, shrinking out, then resting >= 0.12 s. These are CRAFT §f.6's glints. Colours: the bed L* 81 C* 42 h 71
   (#F9BE7F), the slivers L* 94.7 C* 16 h 87 (#FEEED1): every sRGB mix of a sliver and its lens stays >= 6 dE76 from a
   peach paving, and fewer of the bed's rims fall in the house bands in the encode.
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
| `WaterSpec` | `id`, `seed`; `cam` {horizon, f, eye over the WATER (m)}; `region` {top(x), bottom(x), x0, x1, tucks}; `sky` (the shot's preset), `air`; `body` (the near water's colour); `tint`, `shades`; `tier`; `ramp` {yFar, yNear, toning, `cap` 5.5}; `tone` (TONE_DEFAULT: waterC 13.5, cMin 9; `warmMemory` 0); `ladder` {k: [0.40, 0.72], y, step 0.05}; `grid` {dz 0.45, minPitch 3, gap [0.16, 0.26], barPitch 7, gapMix 0.4}; `sway`; `sources`; `moving(t)`; `sun` (+ `lensPitch` 5, `lensLen` 0.85); `ripples`; `float(plane, t)` + `skyPlane`; `flood`; `joins`; `notLike` [{name, hex, dE 6}] (the lit ground beside the water: never its colour); `lod`, `farLod` |
| `WaterSource` | `id`; `thing` + `axis` (number = a level waterline, `'horizon'`, `{a0, s}` = R1's affine sloped quay, `{line: (x) => y}`) or `refl` (already mirrored); `color` (on screen); `kind` body / light / figure; `layer`, `plane`; `draw` mass / crisp / stub; `solid` (>= 0.55; 1 = whole), `maxBars`, `breakup`, `narrow`, `taper`, `sway`; `light` (LightOpts: solid 0.33, slivers 3, ratio 0.62, thinning 0.85, thick, gap 4.5, step 6, fall 1.3, wave [2.2, 56], leaf 1.5); `kMin` (a figure's k floor, default 0.6); `sep` {from, dL} (a value step kept from another source at every step), `dL` |
| `waterFrame(spec, t)` | the pure per-frame build (runs, ripple lines, bed, slivers): node QA reads what the picture draws |
| `waterPieces(spec, t)` | per source: its blocks, bars (a broken band counts twice) and a light's slivers, with its middle x (the comb count) |
| `waterProblems(spec, {t1, otherAlive})` | the lint: no tone in the beige / olive / grey bands, and the ramp AS DRAWN walked ROW BY ROW (its curve between two clean keys can cross a band), none within dE76 6 of a `notLike` colour, the far water >= 4 L* under the `air`, a cool body, every thing above its waterline and inside the water's span, solid >= 0.55 and tapered ends, a light's block <= 35 % with <= 3 slivers each >= 15 % shorter and thinner, gaps >= 4 px and a step >= 4 L* under its source, a far strip on `lod 'far'`, calm sway (<= 3 / 7 px, waves 0.2-0.6 m/s, slices <= 15 px/s), 6-14 ripple slots of >= 40 px drifting <= 25 px/s, the glitter under the sun and inside R8's column, slivers 20-36 px, lit 0.25-0.8 s, <= 6 alive and nested in the bed, <= 16 with the shot's other particles, a flood declared, no field born in a join's window |
| `waterPalette(spec)` | every colour with L* / C* / h and its band (the palette QA hook; a light's block and slivers) |
| helpers | `mirrorPoly`, `affineMirror` (an SVG matrix), `axisY`, `reflectTone`, `neverBand`, `cleanColour`, `rampGap`, `dE76`, `waterStep`, `crestOf`, `waterRamp`, `rampColour`, `floaterWater`, `leafD`, `lensD`, `barD`, `waterColourAt`, `waterKAt`, `waterSwayAt`, `camZ` / `camY` / `camFresnel` / `pxPerMDeep`, `LIGHT_DEFAULT`, `SLIVER_H`, `BED_H_MAX`, `WATER_LIMITS` |

Demo: `src/entry-v2r-water.tsx` (`WaterFarSample`, `WaterAffineSample`; their specs in `src/lib/water_samples.ts`).

## S1's numbers (`src/v2r/scenes/V2S1_water.tsx`; DIAGNOSIS §2 has the geometry)
- **Camera:** horizon 965, f 1400, eye 1.45 m over the water. **Grid:** 0.45 m bands: 4.7 px at the far edge (y 1111),
  12 px at 1200, 23 px at our edge; gaps 16 -> 26 % of the pitch; bars from y ~1143 (the first 7 px band).
- **Tone:** k 0.40 (far) -> 0.72 (near) in steps of 0.05; TONE {waterL 76, waterH 182, waterC 13.5, hueSlope 0.9,
  chromaSlope 0.32, C* 9-16} (the approved Canal Mint: v6's first master had waterC 10 / cMin 6.5 and read a step greyer,
  median C* 11.2): the wing's brick #8DB6B0 (L* 71, C* 15) far -> #96BCB6 (73.4, C* 14) near; the arch's ring L* 84.1
  over its soffit 75.7 (`sep` -8.5: the mirrored ellipse closes at phone size).
- **The ramp:** the far water #D7CDC5 (L* 83.0, C* 5.6: 5.2 under the air #FDD6B8, dE76 15 from the paving), the
  crossing at C* 4.7-5.5 (y 1160-1176), the body #A0C5BE from y ~1260; `notLike` our paving as drawn (#F1D2B3).
- **The lit door** (`wing/lobby`, `kind: 'light'`): the lit glass #F7CF86 (L* 85.1) -> the block #E6BE7D (L* 79.1, C*
  39) from under the coping band to y ~1151 (33 % of 120 px), its bottom a 2.2 px ripple; three leaves 102 / 63 / 39 px
  long, 8 / 6.8 / 5.8 px thick, L* 77.7 / 76.5 / 75.1, the water between them 7-14 px; the column ends at y ~1205.
- **Sway:** +-1.4 px far -> +-4.4 px near; waves 3.2 m / 7.0 s and 1.6 m / 4.2 s (0.46 / 0.38 m/s toward us).
- **Glitter:** x 196, rows reflTop - 3 .. our edge + 3, slope 0.06 rad; 7 bed lenses 28-48 x 4.2-6.6 px on the bands
  >= 5 px (y 1123-1163; #F9BE7F, L* 81 C* 42 h 71); 6 sliver slots in the 6 lenses >= 4.5 px: ~4 alive (max 6), 20-34
  px long, 3.5-4.8 px tall at full length, #FEEED1 (L* 94.7, C* 16), lit 0.46-0.78 s, from 0.30 s.
- **Ripples:** 11 slots (6-11 alive on every frame), 40-150 px, 1.5-3 px, drift 6-16 px/s east, lives 2.6-4.6 s, rests
  0.2-0.7 s; clear of the glitter column and Pip's seat; a steady field from frame 0, revealed by the flood.
- **Simplified (R5), and why:** the door's stiles and the bridge's railing are left to the set (they split the gold
  column and combed the bend); the far roofs and the far tower are ONE pale far mass, whole (`farCity`: their 8 bars
  and troughs combed the left third beside the glitter; its lower edge the skyline smoothed, so no chimney notch lets
  the far water through as a "crown"); the pier and the lamps break twice at most (`maxBars: 2`); the bus on the bridge
  is whole; the row reflects as a slim wedge of its lowest 0.12 h (8 px wide at the waterline, `kMin` 0.85: L* 67-72,
  <= 12 under every field, the gold included; a 14-19 px slab at L* 60 notched the gold), the outlines O1-O3 reflect
  nothing; each boat is ONE dark band (hull + gunwale with the bow's sweep; the cabin and cratch only fragmented it); the
  duck's ring is off (one more mover and line).
- **Measured on lossless frames** (docs/v2/water/judge_metrics.py against v5, at 1.0 / 2.5 / 3.8 / 5.0 s): cool 93.6 /
  93.0 / 92.7 / 92.6 % (v5 85-88), warm 5.4-5.8 %; dx edges 46.5 / 54.8 / 57.3 / 58.7 per 1000 (v6's first build
  50.5-67.1); marks 15-17; glitter gold 676-743 px; Pip dE 29-31; `waterPieces`: 5 bars outside the glitter in x 0-360
  at 1-5 s (the critic counted ~15); f180 / f300 byte-identical in two processes (sha256 7bce4572... / d435b704...).
- **On the master** (deliverables/v2/v2r_G4_look_v6.mp4, re-rendered in place after the critic's fix pass: 368 frames
  in 3 min 3 s at concurrency 2; `docs/v2/water/master_check.py` at 1 / 2 / 3 / 4 / 5 s, the critic's mask):

  | at 1-5 s | khaki rows (door) | cool | warm | house bands | median C* | paving px |
  |---|---|---|---|---|---|---|
  | v6's first master | 13-15 | 79.3-82.2 % | 15.1-16.2 % | 2.80-3.35 % | 11.1-11.2 | 59-411 |
  | this master | **0** | **90.5-91.6 %** | **6.6-7.1 %** | **1.18-1.35 %** | **14.8** | 8-11 |

  The 8-11 paving-like px (dE76 2.9-5.0) are single 4:2:0 chroma specks at the glitter's sliver tips (x 188-215); the
  ramp, the reflections and the near-left show none (0 in the lossless frames). Motion (2.50-3.48 s): 0.55 % px
  changing per frame, 1.29 % quick toggles (v6's first 0.73 / 1.36, v5 0.71 / 1.55); horizontal edge onsets 66-72 per
  1000 water px (v6's first 78-88, v5 45-48). Outside the water nothing changed: 0 px in the lossless 3.0 s frame
  against v6's first code; the masters differ there by encode noise only (v5 -> this: 4,472 px over 30 codes in 358
  frames; v6's first -> this, the same content outside: 3,906). check_banding PASS on the ramp's widest open stretch
  (950,1249,1057,1265), the west gap and the zenith; the band 0,270,1080,560 WARN at 0.5 and 3.0 s (its caption lines;
  v5 WARN at 0.5 s). check_depth 0 FAIL with v5's same 5 WARN (3.0 / 5.4 s). check_light as v5 (its one FAIL, the bank's
  brightest 5 % 0.156 / 0.173 H from her at 2.5 / 5.0 s; greyed 196 / 185 px, OK).

## Recipes (each lane builds its own spec; never hand-roll a water)
- **Every canal shot at evening (S2, S3, S4, S8):** copy S1's spec shape: your `groundCam`'s horizon and focal, the eye
  over the WATER; `region` from your set's water edges (tuck under the banks); `sky` your `S<n>_*` preset, `body`
  `#9CC3BC`, `tint` TINT_CANAL.water; one `WaterSource` per mass, vertical and light over the water, its `thing` the
  polygon you draw and its `axis` its own waterline; `sun` only where the sun is in frame; `ripples` 6-14 slots clear of
  your mascot's seat; `float` your shot's per-plane counter-shift inside the water's group; `flood` your frame-0 front if
  the shot opens; run `waterProblems(spec, {t1, otherAlive})` and the judge's measures before you report, and the
  colour numbers on the MASTER, not only on PNG frames (`docs/v2/water/master_check.py <master> <baseline>`: the 4:2:0
  chroma of every delivered clip turns thin gaps and gold-on-teal rims khaki; S1's mask; copy it with your shot's water
  edges and boxes). A lit window or lamp is `kind: 'light'` (LightOpts); a far skyline is one whole mass; a thin
  vertical takes `maxBars: 2`; `notLike` the lit ground beside your water.
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
- **Built (the water swaps, 2026-10-28; every number in `docs/v2/water/SWAPS.md`):** S2 `V2S2_Water.tsx`, S3
  `V2S3_water.tsx` (canal + sliver), S4 `V2S4_water.tsx` (canal + near water), S5 `V2S5_river.tsx` (Potomac + channel,
  far LOD); `src/v2r/scenes/water_swaps_qa.ts` lints all of them. What they taught the next water:
  - a set may have no single level camera (S3's towpath VP sat below the canal's far edge): take the eye level the WATER
    can live under (the shot's World horizon) and the eye height from the coping's drawn face (t / e = face / (waterline -
    horizon)); the lens factor e / (e - t) maps a towpath base onto its mirror line;
  - steep water (S3, S4: 10-21 px bands) keeps the bed's lenses CRAFT-sized through `BED_H_MAX` (6.6 px); on near water
    seen at 50-60 deg (S4's, 88-140 px bands) the sun's column goes on the strip nearest its mirror point instead;
  - near water under a hull is a near MIRROR: the boat whole (`solid 1`), ladder k 0.70-0.80; a water drawn in screen
    space while its surface trucks takes its own group (S4: 2.0x) and counter-shifts what is screen-fixed via `float`;
  - a far strip takes its own plane's hazed water as `body`, a tone family from it (S5 FAR_TONE), the veil at the body's
    value (the default + 0.085 lifted a 23 px strip over the air);
  - a shot that does not open the film declares a flood at 0 that has long crossed; its fields start before its cut;
  - lit windows reflect as LIGHT ON WATER with 2 slivers when several share the water; once a pane cools to white it is
    a pale mass (`kind 'light'` keeps C* >= 35: a white light would turn green);
  - the water's own glitter replaces lib/particles' 4-point star glints on water (CRAFT §f.7e).
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
- (The critic on v6's first master, 2026-10-28, `docs/v2/water/CRITIC.md`.) A light drawn like a mass (a slab, then
  equal round-capped bars on the grid) reads as a stack of pancakes, and its 2 px gaps turn khaki in the encode: a
  light is a short block and a few shrinking leaves with real water between them.
- Judge colour on the MASTER: yuv420p averages the chroma of every 2 x 2 block, so a gold-to-teal edge mixes to olive
  on 1-2 rows whatever the PNG shows; khaki scales with the length of warm-on-cool edges: fewer, shorter gold shapes;
  edges that wander across rows (a rippled block bottom, leaf flanks) never stack into one khaki row.
- The mirrored sky darkened by a Fresnel step crosses the house beige band wherever it desaturates under L* 86:
  hold the crossing in the clean gap (C* 4.7-5.5) and walk the ramp ROW BY ROW in the lint (the keys alone were clean).
- The lit ground is the sky's own peach: a far water left at the sky's value reads as paving. Keep it a step under
  the air and say which ground it must never equal (`notLike`).
- A pale "sun path" under the glitter read as a pasted panel (and its rims with the gold mixed into the paving's
  peach); a richer amber bed with gold-white slivers on the reflections reads as sun and stays out of the bands.
- A sliver's sRGB edge with its lens is a third colour: at L* 97.5 C* 7 (near-white) on L* 82 gold it is the paving's
  peach; at L* 94.7 C* 16 on C* 42 amber it stays >= 6 dE76 away (L* 97.5 can hold only C* ~7 in sRGB).
