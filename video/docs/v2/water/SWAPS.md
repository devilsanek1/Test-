# The water swaps: lib/water in S2, S3, S4, S5 (and S8's seam), 2026-10-28

**What:** every shot where the canal or the river shows at size now draws the film's ONE shared water
(`src/lib/water.tsx`, how-to `src/lib/WATER.md`, rules CRAFT §f.7), the design the owner approved on G4 look clip v6
("Yeah this is better keep going"). Each spec is built from its OWN shot: its camera, its geometry, its colours as the
clean pen draws them, its sky preset, its air, RIG_CANAL's water tint; never S1's numbers. S1 already used it; S7's
fountain stays; S8 keeps its flat field (below). **Lint:** `src/v2r/scenes/water_swaps_qa.ts` (the esbuild command in
its header) runs `waterProblems` on all eight specs: **all clean**. Typecheck clean. **Outside the water nothing
changed:** the diff of every after still against the before (same frame, 0.5) lies inside the water's own box (below);
S1 is byte-identical at 1.0 / 3.0 / 5.0 s against dd446a5 (the one lib change below cannot touch it).

**Before / after** (0.5, side by side; `_phone` = 360 px wide): `docs/v2/water/swaps/` (S2_0700, S2_1000, S3_1390,
S4_1797, S5_2340 `_ba.jpg` / `_phone.jpg`; crops `S2_0700_canal_crop.jpg`, `S3_1390_canal_1to1.jpg`,
`S4_1797_water_crops.jpg`, `S5_2340_river_2x.jpg`; the seam `S8_seam_2336_ba.jpg`; the joins `joins_ba.jpg`, top row
before, bottom after: f373, f777, f779, f1228, f1230).

## The one lib change
`BED_H_MAX` (6.6 px): a glitter bed lens is never thicker than CRAFT §f.7e's 4-6.6 px. On S1's grazing water a lens
fills 0.8 of its 5-8 px band; on S3's and S4's steeper water the bands are 10-21 px and the lenses became 8-17 px gold
blobs. S1's tallest lens is 6.59999 px: unchanged (byte-identical frames above).

## Per shot
| | S2 canal | S3 canal (+ the sliver) | S4 canal (+ the near water) | S5 Potomac (+ the channel) |
|---|---|---|---|---|
| file | `V2S2_Water.tsx` (`S2WaterSurface`, `S2_WATER`, `s2WaterSpec`) | `V2S3_water.tsx` (`S3Water`, `s3WaterSpecs`) | `V2S4_water.tsx` (`S4Water`, `s4WaterSpecs`) | `V2S5_river.tsx` (`S5Water`, `s5WaterSpecs`) |
| camera (horizon, f, eye over the water) | 700, 1400, 3.90 m (V2S2_Ground's; the far coping's face 6 g px over 336 g px: t / e 0.018) | **1000**, 1400, 1.5 m: the shot's World horizon. S3_CAM's towpath VP (1150) lies BELOW the canal's far edge (1130), so no level water fits it; the coping's 9 px over the 130 px gives t / e 0.069 | 760 (S4_CAM's = the sky's), 1400, 3.22 m (her coping's 12 px over 322 px; her 100 px/m at her feet) | 750 (END), 1400, 87 m: rows ~0.05 px, `lod 'far'` |
| mirror lines (R1) | the wing's lens line under its base: the map's first three columns as drawn (`axis {line}`), then R1's affine map past column 2 (`{a0 1175.7, s -0.3398}`); the boat about its own sloped waterline | the lens line under each base: yb -> 1000 + (yb - 1000) x 1.074 (the terrace's foot 1100 -> 1107.4) | yb -> 760 + (yb - 760) x 1.0387 (her feet's line 1070 -> the waterline 1082); the backs about the line under their hidden foot (~900) | the far shore about its embankment (801); each bridge face about its own sloped foot (`{a0, s}`) |
| sky / air | S2_EVENING / S2_AIR #FBD9BB (L* 88.8) | S3_SUNSET / S3_AIR #FCBF9B (82.0) | S4_SKY / S4_AIR #FCD7B9 (88.4) | S5_SKY / S5_AIR #F6D9BC (88.4) |
| ramp far -> near | #BACFC5 (L* 81.3 C* 9.3) -> #A0C5BE | #C8BDB6 (77.3, C* 5.6: a pale warm pearl) -> #BFD3CF (83.0) -> #A0C5BE | #ADCBBF (79.2: the mirrored caption-band mint) -> #A0C5BE | #D7CCC6 (82.8, C* 5.2) -> #C3D6CF (84.1); body = the plane's hazed water RIV.water, veil at its own value, dl 0.06 |
| notLike (dE76) | far towpath 16.7, our York stone 18.5 | her towpath 9.0 | her towpath 20.2 | (no lit ground beside a far strip) |
| reflections | the wing as 5 plane masses (its colour per plane), the far lamp, the far coping's crisp band; per frame the ground panes (lit = LIGHT ON WATER, 2 slivers; unlit = glass) and the 3 ground staff windows (gold until 8.96 + 0.04 i, then their cool white as a mass), the passing boat as ONE dark band | the garden wall, the tree's trunk, the 4 houses' ground storeys, 3 doors, her lace window, 3 lit windows (light, 2 slivers), bench, bin, lamp post, 3 bollard stubs, the coping's crisp band, the heron's post (whole); the walker's legs (kMin 0.85); sliver: the hull WHOLE, k 0.70-0.80, dl 0.08 | the terrace backs as one pale mass (0.6x, counter-shifted; the sun's gap), 11 wall segments + 3 gate leaves, 3 lamp posts, the fingerpost, 3 bollards, the coping band; never her (L3's rule); near water: the boat WHOLE (the sage cabin; hull + stripe as one dark band, R5), k 0.70-0.80, in its own 2.0x group | flat (far LOD): the shore fringe, the Lincoln Memorial, Memorial Bridge's face, the three 14th Street faces; tone family = RIV.water's (FAR_TONE), not the Canal Mint |
| glitter | none (S2 has no disc) | SUN3 (96, 652): bed on rows 1150-1214, 6 slots (other particles 9 -> <= 15) | SUN1 (250, 650) on the CANAL rows 1090-1220 (the water nearest its mirror point; the near water's 88-140 px bands hold no CRAFT-sized bed), screen-fixed, 6 slots (others 10 -> <= 16) | 5 flecks 2-6 px under the END sun (1058.5, 646), slope 0.08 (R13) |
| ripples | 7 (clear of Pip and the ducks) | 9 (clear of the column and the post) | canal 8, near 7 (streaming with the 2.0x water) | 3 current lines (+2 on the channel) |
| retired | the tone-on-tone bands; the kit ducks' paper V wake (S2Ducks: the kit's mallards on `floaterWater`) | V2S3_particles' 4-point star glints; V2S3_tCanal's hand-drawn post reflection (its foot: a contact lens a step under the water) | V2S4_particles' 4-point star glints (S4_WATER.glitter is now the canal column, `on` #A9C9C3) | the seeded streaks and the on / off glint dashes |
| diff vs before (all inside the water) | 7.0: x 122-1078, y 812-1208; 10.0: x 470-1078, y 810-1056 | 13.9: x 0-1078, y 1128-1252 | 17.97: x 0-1078, y 1082-1918 | 23.4: x 286-1078, y 804-870 |
| ms / frame (1080, conc. 1) | 294 -> 338 (+15 %) | 724 -> 732 (+1 %) | 628 -> 745 (+19 %) | 697 -> 709 (+2 %) |
| check_banding (open water only) | n/a: the wing's mirror covers the whole depth (the ramp shows only in tone-on-tone troughs) | the west gap's open ramp: smooth, L* 80.6 -> 77.4 over 20 rows, monotonic (the box's FAIL is a ripple trough and the boat roof's dressing) | canal 650,1209,1080,1222 PASS; near water 0,1760,1080,1910 PASS | 340,812,760,823 PASS |

All fields (ripples, slivers) run from before their shot's cut (t0 5.5 / 12.0 / 14.0; S5 scene -1), so nothing is born
in a join's window; a shot that does not open the film declares a flood at 0 that has long crossed (the lint's frame-0
rule).

## The joins (3 frames each, before / after)
S1 -> S2 (f361, f370 identical: S1's push and the plum bridge; f373 changes inside the water only) · S2 -> S3 (f777,
f779, f781: inside the water only; the match lands on her window, the water continuous) · S3 -> S4 (f890-f894
identical: the plum dive covers) · S4 -> S5 (f1228, f1230: inside the water only; f1232 identical: SUN1 fills the
frame). No pop, no field born at a cut.

## S8: the seam (L6's note), and why S8Canal stays a flat field
Rendered 2300, 2330-2344 and frame 0. The canal is hidden by the board and the cafe boat but for a ~40 x 70 px patch,
and S1's frame-0 water (pale flat shapes) did not change the seam (2338-2344 and frame 0: 0 px differ). It DID pop at
2335-2337: the board's exit bared S8Canal's flat field as a ~650 x 65 px teal band (#A8C9C2) over S1's pale frame 0 for
2-3 frames. That was the un-build ORDER, not the drawing, and a lib/water field would not take part in the un-build,
so the fix is in S8Water: S8Canal leaves early (`EarlyExit to 0.3`, gone while the board still covers it). After: no
teal at 2336 (`S8_seam_2336_ba.jpg`), 2338-2344 and frame 0 unchanged.

## Open (for the review)
- **The master colour check** (`docs/v2/water/master_check.py`: khaki rows from the encode's 4:2:0 chroma) was not run on
  S2-S5 (budget): run it on the next film master with each shot's water box.
- **S2's gold columns:** the three lit ground staff windows mirror as three wide gold columns under the story windows
  (6.10-9.0, before they cool and the board covers them): physically right (R7) and rule-shaped (a block <= 35 %, two
  leaves), but the frame's busiest water; judge them at phone size beside the story.
- **S4's near water** lost its sparkles with the stars: it is now calm body with the boat's soft mirror and streaming
  ripple lines; the sun's glitter lives on the canal strip.
- **S3's camera** for the water (horizon 1000) is a choice: the set has no single level camera (its towpath VP at 1150
  sits below the canal's far edge).
- **Pre-existing:** S5 renders the Pentagon plaque's cast shadow (x 306-794, y 1229-1258) differently between two
  renders of the same code (2,006 px; seen before this swap): a determinism bug outside the water.
