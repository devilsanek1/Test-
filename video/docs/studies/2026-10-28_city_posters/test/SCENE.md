# The look test's scene lane (S): v2's S1 copied, the darks, the far stage, the switches

*Lane S of the 7 s look test (`STUDY.md` §10: items 5 and 7, the S1 copy and the switches; item 11, the integration and
the clip). 2026-10-29. Items (1)-(4) done 09:04 UTC; the integration of lanes E, PT and N done 09:50 UTC (§7); the
clip, the A/B sheet and the QA: `REPORT.md` (its "Next step" line is the live state). Scratch work in `/tmp/posters-s/`
only (an early tool of mine in the shared scratchpad, `tools/pxdiff.py`, is the one that replaced lane E's: every proof
below was re-run from my own folder).*

## 1. What it is
- **The copy:** `video/src/look/poster_s1/` holds v2's S1 tree (`src/v2r/scenes/V2S1*`, 18 files; not `V2S1_public.tsx`,
  no longer drawn, or `V2S1_row_entry.tsx`, a dev entry), its v2r imports rewritten to `../../v2r/...` (read-only:
  nothing in `src/v2r` changes). The file names are v2's, so `diff src/v2r/scenes/V2S1_set_wing.tsx
  src/look/poster_s1/V2S1_set_wing.tsx` shows exactly what the test changes; every change sits behind a switch.
  New files: `switches.tsx`, `engine.tsx` (the one place the scene meets the lanes' pieces), `darks.ts`, `near.ts`,
  `V2S1_far_stage.tsx`, `V2S1_patch.tsx`, `PosterS1.tsx` (the shell); lane E's `palette_10b.ts` lives here too.
- **The shell:** `PosterS1.tsx` is v2's own shot shell (lib/Film in shot mode over v2's `scenes.json` and
  `captions.json`, read-only), so with every switch off the picture is v2's pixel for pixel (§4). Its root sets the
  film-wide module state every frame before anything draws: the palette's roles, the pen's line flags, the float table.
- **The composition:** 7.0 s = 420 frames, 60 fps, 1080 x 1920: S1 0-6.1 s with v2's locked voice
  (`public/v2/voice.wav`: silent at 6.1 s, -72 dB, a clean cut) and pop captions ("for life." leaves at 5.88; S2's
  6.28 page never shows), then a 0.9 s locked hold (the float home from 5.8, no dive, no words, no sound, the world
  alive: cloud, water, motes, leaves). W stays the subject through the hold (v2 dived into it at 5.875:
  `S1_TIER_A.w` ends at 7.1 here).

## 2. Compositions and commands (entry `video/src/entry-look-poster.tsx`; run from `video/`)
| Composition | What |
|---|---|
| `PosterS1` | props: `preset` 'v2' (default) / 'pass1' / 'pass2', then any switch of §3 on its own, `label` (a burned-in review label: lib/Film's draft label "label · V2S1 · m:ss.ss"; none when empty), `audio` 'voice' (default) / 'mix' (v2's final mix, faded 5.80-5.95 s before the retired dive's whoosh) / 'none', `captions` (default true) |
| `PosterS1-v2` | every switch off: v2's S1 plus the hold |
| `PosterS1-pass1` | STUDY §10's pass 1 as written on 2026-10-28: the near group in mid-tones (`nearMid` alone), the mottle from 3.5 s, Pip hidden, the float by 1/z, v2's line |
| `PosterS1-pass2` | every switch on (since 2026-10-29 every one is decided, 10b's palette aside: a proposal) |

```bash
E=--entry=src/entry-look-poster.tsx
GL=angle node scripts/render-frames.mjs PosterS1 <dir> 0.3,1.0,3.0,5.2 $E --props='{"preset":"pass2"}'          # stills
GL=angle node scripts/render-frames.mjs PosterS1 <dir> 5.2 $E --props='{"darks":true}'                             # one switch A/B (the cover)
GL=angle node scripts/render-frames.mjs PosterS1 <dir> 5.2 $E --props='{"preset":"pass2","patchwork":false}'      # pass 2 minus one
npx remotion render src/entry-look-poster.tsx PosterS1-pass2 out/poster_s1_pass2.mp4 --gl=angle --concurrency=2   # the clip
python3 -I scripts/look/posters/look_test_row.py --label after --frames t1.png t3.png t5.png --out <json>          # E's after row
```
A render takes ~1 s a frame at full size; the bundle 2-6 s.

## 3. The switches (`src/look/poster_s1/switches.tsx`; every one off = v2)
| Switch | What it changes | Engine (lane) | Status | Where |
|---|---|---|---|---|
| `lineOff` | no outlines (decision 1 c). Frame 0 keeps its CONSTRUCTION LINE (DIRECTION rule 9; the coordinator's rule): the bold pen with its moving tip draws her, the door and W at full contrast as in v2 (0-0.39 s), and each line goes under its colour as the flood lands on it (W 0.40 with its plum, the door 0.53, her coat 0.78: `engine.tsx` `LINE_UNTIL`); from 0.80 the pen draws no outline at all (E's `PEN.outlines = false`). Pip draws no line; the copies part from the wall by a lit and a shade face (`FormShade` per copy) | `PEN.outlines` (E) + `<Look ink>` per subject (S) | wired, rendered | `engine.tsx` applyPen, `lineOn`; `V2S1_set_wing.tsx` (W, door frame, leaves), `V2S1_row.tsx` (her, the row), `V2S1_pip.tsx` |
| `shadeTier` | the subject's shade face deeper (decision 1 c): the rig with the form step per tier (E's `withTierForm(RIG_CANAL, CM.shadeWarm)`: A 0.56, B and C v2's 0.20); her coat at -22 L* in the cool family (`tierFormFor(CM.hero, CM.shadeCool, -22)`), the copies' oat coats at -22 in the warm one | lib/light (E) | wired, rendered | `V2S1.tsx` (the rig), `V2S1_row.tsx` |
| `darks` | real darks in many small pieces, the near world in mid-tones (decision 2 b): §5 | the scene (S); E's `nearPalette` | built | `darks.ts`, `near.ts`, the wing, set_life, fore, steps_stone, pip |
| `nearMid` | (optional, undefined = follows `darks`) the near world's mid-tones alone, to split the darks A/B | E's `nearPalette` | built | `near.ts` |
| `patchwork` | the "low poly" world (decision 3 a): our bank's treads as facets RECEDING through the bank's one camera (PT's `twoPointCam`: v2's two VPs exactly; 4 m = v2's ~1.2 m blocks), a 0.3 m paving module, the tread's own stone (mid-tones under `darks`) as shown through the tier pull, marks 1 in 14; the far rows' walls as frontal blocks from their receded colours (+4 two values, +3 three), each row's drawn over its own walls and under the nearer rows. The paving's setting: PT's CALM one (1.2 m cells, 2 tones 4.5 apart; `paving: 'busy'` = the first pass, 0.9 m, 4 tones): judged at phone size, the first read as a chequer over the whole bank (§7) | lib/patchwork (PT) | wired, rendered | `V2S1_patch.tsx` (PAVING); `V2S1_steps_stone.tsx` StoneBand; `V2S1_set_far.tsx` FarRoofs |
| `farStage` | the designed view (decision 4 a): §6 | lib/persp `farStage` (S), `anchorTones` (E) | built | `V2S1_far_stage.tsx`, `V2S1_set_far.tsx` |
| `foliage` | the planter's tree as ONE species, a young London plane (N's crown geometry in N's one wind: foot (126, 1530), 300 px tall, 372 wide; Pip inside it under `pipHidden`), and the top-left twig as a spray of its own leaves (N's S1 spray), in ONE wind (`S1_WIND`: a light westerly, one gust at 2.6 s) | lib/foliage + lib/wind (N) | wired, rendered | `V2S1_nature.tsx`; `engine.tsx` TreeSlot, SpraySlot; `V2S1_fore.tsx` PlanterTree; `V2S1_set.tsx` |
| `cloud` | N's hero cumulus in v2's hero-cloud spot (x 598-1028, base y 272: above the band over its 3 px/s drift), the kit's two clouds gone (the thin bar's 9 px/s is over N7's 2-6) | lib/clouds (N) | wired, rendered | `V2S1_nature.tsx` S1Cloud; `engine.tsx` CloudSlot; `V2S1_set.tsx` S1SkyThings |
| `texture` | the VERY subtle mottle per plane (true, or a number: on from that second): PT's `<Mottle>` in each plane group (`S1PlaneStack` layers), `mottleK` per plane (the sky 0.6 at blotch scale 0.9, the far stage 0.4 on the sky's seed, +3/+4 0.4, the rest 0.7), `mottleSeed(plane)`, the float offset passed (the band stays screen-locked). NOT mottled (§7): the spray, the tree and Pip, the boats and the duck, the bridge, particles; the cross-plane shadows sit outside the filter | lib/texture (PT) | wired, rendered | `engine.tsx` TextureSlot; `V2S1_float.tsx` S1PlaneStack; `V2S1.tsx` (the sky); `V2S1_set.tsx` |
| `paving` | (optional) the patchwork's setting: 'calm' (default, decided), 'mid' (PT's 3 tones at 4.5, 1.2 m) or 'busy' (the first pass) | lib/patchwork (PT) | built | `V2S1_patch.tsx` |
| `textureK` | (optional) a multiplier on every plane's mottle strength (A/Bs; 0.0001 = the filter with no visible mottle: the filter-only test of §7) | lib/texture (PT) | built | `engine.tsx` |
| `windStill` | (optional) the wind held still (lib/wind `STILL_WIND`): the crown and the spray ride the float only (the QA's twinkle test) | lib/wind (N) | built | `V2S1_nature.tsx` |
| `sunToned` | the sun one flat step off its sky (decision 6 b): the disc mixed toward the sky round its cap until dE76 18 (under tier A's separation), frame 0's half-coloured disc in the same toned colour | the scene (S) | built | `V2S1_set_far.tsx` sunToned |
| `pipHidden` | a quiet "find Pip" (decision 5 b): Pip sits INSIDE the bay tree on our bank (seat 184, 1446; 100 px, nearer than the bollard so never smaller per metre), between the crown's back and front lobes: its head and ears among the leaves, its body behind the front lobe; >= 250 px from her and off her eye path; the same beats (drawn with the flood, ears-cover on "life", sits at 5.55); the empty bollard stays (a dark piece under `darks`) | the scene (S) | built | `V2S1_pip.tsx` S1PipInTree; `V2S1_fore.tsx` |
| `float1z` | the float by 1/z: E's `PARALLAX_Z` (-2 1, -1 0.8, 0 0.6, +1 0.24, +2 0.10, +3 0.04, +4 and the stage 0) in every plane group and in the water's reflections | lib/depth (E) | wired | `engine.tsx` applyFloat; `V2S1_float.tsx`; `V2S1_water.tsx` |
| `lines2px` | thin lines 2.0 px on the planes that float: E's `PEN.lineMin = 2` for every pen line; the one thin FILL on a floating plane in S1, the bridge railing's 1.6 px bars, 2.0 px | lib/pen (E) + the scene | wired | `engine.tsx`; `V2S1_set_far.tsx` bridgeRail |
| `palette10b` | E's 10b palette (`CM10B`, v2's keys): v2r's live `CM` roles swapped in place by the root (both ways, every frame; the shipped bundle never imports this); S1's sky gets 10b's calmer band on v2's horizon and sun (`S1_EVENING_10B`: S1's air stays v2's); the water its own spec (10b's mid-tone body); import-time captures re-resolved (`engine.tsx` `live`) | `palette_10b.ts` (E) | wired | `engine.tsx` applyPalette; `V2S1_sky.tsx`; `V2S1_water.tsx`; set_life (cabins), fore and steps_stone (palette entries) |

**Pass 2 measured** (full size, `pro_4_colour.py` at phone scale, the band out; the after targets: `BEFORE.md`):
| | v2 (before) | darks only | pass 2 (all switches) | target |
|---|---|---|---|---|
| under L* 40, % | 1.6 / 1.6 / 1.8 | 8.1 / 8.2 / 8.3 | 8.1 / 8.2 / 8.2 | 6-10 |
| dark pieces (>= 4 px at 540) | 19 / 25 / 65 | 123 / 122 / 156 | 120 / 122 / 124 | >= 120 |
| grid cells with darks /16 | 4 / 6 / 6 | 11 / 11 / 11 | 11 / 11 / 11 | >= 9 |
| L* p5 | 59.4 / 59.2 / 55.4 | 30.9 / 32.0 / 32.0 | 32.0 / 32.0 / 32.2 | <= 32 |
(at 1.0 / 3.0 / 5.2 s.) Pass 1 (the near group's mid-tones alone, no dark pieces) holds 2.1 % in 22 pieces at 1.0 s
and 2.3 % in 69 at 5.2 s (p5 47-48): §10's "darks at ~5 %" was rule 6's anchor, retired by decision 2 (b). The pieces are drawn things; the long ones (the two waterlines, the coping's wet edge) and
the touching ones (her against the door's frame, the two boats) count once each. The top row (the sky) holds none by
design, so 11 of 16 cells is the most S1 can hold.

**The float lints** (E's, on S1's legs, rests and planes, the stage at +5): v2's `PARALLAX_K` 2 WARN (0 vs +2 1.71x;
+4 vs +5 1.00x); `PARALLAX_Z` none (`/tmp/posters-s/harness/s_float_lint.ts`, an esbuild harness).

## 4. The proofs (full size, `GL=angle`, `--concurrency=2`, my own diff script `/tmp/posters-s/tools/s_pxdiff.py`)
- **The copy is v2:** `Film2R-V2S1` (`--entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`) against
  `PosterS1` (preset v2, no label) at 0, 1.0, 3.0, 5.2 s: **0 px changed on all four** (max channel delta 0), first
  at 08:05 UTC, re-run from `/tmp/posters-s/` at 08:31 and after all the wiring at 09:01 (every switch's code path in
  place, off). A sanity pair (v2's 1.0 s against the copy's 5.2 s) differs on 426,155 px.
- **lib/persp is non-breaking:** `farStage` and `splitStages` are new exports (pure math, nothing imported, nothing
  else touched). `Film2R-V2S1` at 1.0 and 5.2 s after the edit against the 08:31 render: **0 px** (and again at 09:01).
- The hold (6.5, 6.9, 6.99 s) renders; against 6.05 s only the life moves. Every switch alone and both presets
  render (a smoke test at 3.0 s); `npx tsc --noEmit` clean.

## 5. Item 5: the darks (`darks` switch; `darks.ts`, `near.ts`)
- **The dark family** (`DARK`, as SHOWN): 10b's dark roles (pro_4 §3.7: pane `#3A5065` L* 33, eave `#6B4B5F` L* 36, the
  anchor `#36223A`) and three of the same family: iron `#364958` (L* 30), leaf shade `#3C5648` (L* 34, h 159, never
  olive), wood shade `#6F4849` (L* 35). The clean pen pulls a tier-C fill 16 % toward the sky (`#3A5065` would SHOW at
  L* 41.6), so every dark is authored through `forTier` (the pull inverted); on the subject's tier (the door until
  1.40) the shown value is written as is.
- **On the wing:** every unlit pane a dark recess under the glass's sky reflection (the room from 32-44 % down, its
  sill a step up), every lit pane its furniture in silhouette (pendant, table, chair backs, files, a plant, a mug on
  the sill), the lintel's shadow on every pane; dark reveals in every bay and the door's left reveal; the canopy's
  underside (a 3 px stone lip under the fascia keeps the letters off it); the coping's drip shadow, the band's and the
  plinth's undersides; ten cast-iron air bricks in the plinth; the downpipe and its brackets; two wall lanterns and an
  intercom by the door; the roof terrace's planter boxes (none above y 604); the door's frame and leaves dark iron, its
  threshold the deepest; the lobby's counter, pot and pendants.
- **On the water and the far towpath:** the boats' hulls dark iron, their portholes dark glass, their stern doors and
  roof pots dark wood (the kit's fills recoloured by layer: `recolourBatch`); the far coping's wet dark line (to x 780),
  its bollards and seven cleats dark iron, two litter bins, the big lamps' plinths and lantern caps.
- **On our bank and the café set (the near group):** the coping's wet edge, eight cleats and six gully grates; the
  bay's trunk and the shade under its crown (clipped to it); the planter's soil; the chairs' frames and seat
  undersides, the table's pedestal and foot; the shade under the bench's seat, the backpack; the crates' hand slots and
  the shade under the upper one; the soil in the fern pot and the thyme pot; eleven wet fallen leaves; Pip's bollard.
- **The near world in mid-tones** (`near.ts`): lane E's `nearPalette` puts the bank (plane -1, area-weighted) at L* 60
  and the near things (-2) at 55, every internal step kept; a darkened peach stone in the beige band takes its warm
  chroma back as terracotta (h <= 50, C* >= 19: pro_4 §3.2's mids at C* 18-32; at L* 60 a rose at C* 13 read
  grey-mauve), then the pull is inverted so the frame shows E's values. E's `nearStep` already lifts beige to C* 19;
  `noBeige` is then a no-op.

## 6. Item 7: the far stage (`farStage` switch; `lib/persp.tsx`, `V2S1_far_stage.tsx`)
- **`lib/persp` `farStage({horizon, vpx, f, height})`** (non-breaking: new exports): the designed view's ONE declared
  second horizon (CRAFT §f.5, PE L2): a level, frontal pinhole of its own; things placed in screen x and sized in
  metres; `pt`, `baseY(z)`, `scale(z)`, `front({x0, x1, z, h, level})` (a frontal quad on the stage), `profile(pts, z)`
  (a skyline path closed to the stage's ground), `thing(name, z, h)` (a `sizeProblems` entry tagged `stage: 'far'`),
  `parallax: 0` (at infinity: it never floats). `splitStages(things)` splits measured things by camera, so lib/depth
  `sizeProblems` runs once on the near world against the lens and once on the stage against its own horizon (no "two
  cameras" WARN across them; depth.ts itself unchanged).
- **S1's stage:** horizon y 806 (159 px over the lens's 965), behind the far roofs (the hiding band: no receding line in
  the far zone), camera 30 m up, f 2800 = twice the lens (the landmark drawn bigger than one camera allows), bases at
  y 832-838, all hidden. Drawn behind the far roofs and after the sun, in the sky's float group (share 0).
- **On it:** a pale ghost skyline (+5, E's `anchorTones(ATM, 5)`: dE <= 6 from the air) rising just over the far roofs
  west of the sun (tops y 716-748), under them round the sun (its visible cap stays whole: one near-level edge), and a
  taller cluster over the wing's west roofline (tops >= y 622, under the band) toned from the sky's own colour there
  (the cool light band at y 632, not the warm horizon: a peach ghost read as pink boxes on the roof); and ONE landmark,
  a slender telecom tower (London's read: shaft, two antenna rings, the drum crown with tone-on-tone rings, the mast at
  5 px: nothing hair-thin far), at x 100 left of the sun, rising to y 635, at E's anchor tones on the stage's ghost-step
  atmosphere at k 0.8 (dE ~8-10: firm but paler than anything nearer), a lit sliver on its sun side and a pale foot
  (the mist line) where it meets the far roofs. Its base is hidden by the mid row; the stage's ghost cluster continues
  behind the calm tower and the wing (the city goes on).
- Placement against P1 §3.2: top y 635 (>= 620), base hidden at y ~782-838, the stage behind a nearer band, a pale foot,
  <= 3 values. Not met in S1: ">= 65 % of W" (the wing covers the middle and right: the visible far group is the west
  gap plus slivers over the wing) and "the landmark in x 120-950" (x 100: the sun takes x 144-248).

## 7. The integration (item 11: lanes E, PT, N; 2026-10-29)
- **The mottle (PT):** `TextureSlot` is `<Mottle k={mottleK({plane, sky})} seed={mottleSeed(plane)} offset={[dx, dy]}>`
  (off: the children as they are, no wrapper). `S1Plane` became `S1PlaneStack`: one translate per plane group, its
  LAYERS back to front, each either mottled (all of one plane share its seed: one surface) or drawn in the same
  translate OUTSIDE the filter. Two findings made the split necessary:
  1. **A mottled group is isolated** (PT's hazard): a lib/light multiply layer inside it that falls on ANOTHER group
     paints its tint solid. Found by the full-frame `check_banding --texture --flat` and a k-0 render: the boats' strips
     (onto the water), the near things' contact and cast shadows (onto the treads), the props' strips (one on the
     bench), the bollard's shadows (onto the landing), and the far towpath's light layers (the wing's shades, the
     lamps', bollards' and the row's shadows) where they spill past the towpath's edge onto the water's group (light
     patches at the row's feet, white arcs in the door's reflection). Each now sits in its group's `under` / `over`
     or between the subject plane's mottled layers (`V2S1_set.tsx`: FarTowpath + wing + doors | the wing's shades | the
     pigeons | the towpath's shadows | the furniture + her + the row). Same drawing order as v2's, so with the texture
     off the tree is v2's exactly (the 0 px proof below).
  2. **Chrome resamples a ROTATED or SCALED group inside a filtered one** (a ~1 px softening of every edge: an edge's
     1-px ramp becomes 2-3 px; a 2 px line loses contrast), and a filtered group under a fractional translate can be
     resampled too. Measured with `textureK: 0.0001` (the filter, no visible mottle) against the texture off, and
     reproduced in a bare headless-Chrome page (`/tmp/posters-s/ftest/s_ftest*.py`: a container `rotate(0.4)` over
     12 leaves p99.9 20 levels, the same rotation folded into each leaf 2; translate-only containers 2; the region's
     size, CSS filter, nested svg, isolation, will-change: no effect). In S1 it hit the wind's crown and spray (N's
     main bending is a rotated group), the kit's boats and duck, the bridge's people, birds and bus, Pip. So those groups
     are NOT mottled (`texture={false}`, the tree in the near group's `under`): at k 0.4-0.7 on small or dark things the
     mottle cannot be seen, and their edges stay crisp. After the split the filter-only diff is p99.9 2-4 levels (a
     handful of 1-px AA seams), STRUCTURE p99.9 <= 1.04 L* (cap 3) on every region at 1.0 / 3.0 / 5.2 / 6.5 s.
  3. The sky measured a 1/e radius of 36-37 px at lib/texture's scale (spec 15-35; posters 20-36): `SKY_MOTTLE_SCALE`
     0.9 gives 31.7-33.5 (PASS).
- **The foliage and the wind (N):** `V2S1_nature.tsx`: `S1_WIND = makeWind({seed: 'S1', dir: 0, gusts: [{t: 2.6}],
  joins: [6.1]})`; the tree `s1TreeSpec()` (foot (126, 1530), height 300, width 372, plane -2, the key RIG_CANAL's sun
  toward 15 el 36, no sky holes: it stands against the bank; green = the live palette's sage), drawn by `S1Tree` from
  `crownGeometry` with N's own transforms (the crown turns about the foot, each cluster shifts) so Pip can sit between
  the front clusters: `S1_PIP_IN_CROWN` seat (178, 1412), drawn after front clusters 0-3 and under 4-11 (its ears and
  a lavender sliver show between the dark lower clusters: found on a second look; the paw pad shows on "life"); the
  spray `s1SpraySpec()` (N's S1 spray, bbox -50..297 x -69..274: clear of the band); v2's crescent FormShade on the
  bay goes with the switch. Lints (`s1NatureProblems`, node via esbuild `/tmp/posters-s/harness/s_nature_probe.ts`):
  `[]` in both palettes. The crown: mean L* 47.5, light vector 166 deg against the key's 143 (23 off, cap 45),
  12 clusters, 225 rim leaves.
- **The cloud (N):** `s1CloudSpec(palette10b)`: N's HERO (seed hero-s1, x 598, base 272, 430 x 146, drift 3 px/s),
  its tones given explicitly (lib/clouds' own defaults from the sky at its centre) so its geometry cache keys on the
  palette (the cache ignores a function's body). bbox 575-1043 x 111-272. `cloudProblems` `[]`.
- **The paving:** judged at phone size (390 px wide) against PT's first setting: the first read as a chequer over the
  whole bank, the calm one as paving. Decided: calm (`PAVING.calm`). Its cost on the study's fields measure (pro_4,
  3.0 s): edge-free fields below the sky 18.8 % (busy 13.8, PT's middle 3-tone setting 16.5, v2 15.2; target 0): the
  4.5 L* facet steps sit under the field detector's edge threshold. `paving: 'mid'` is the in-between (by eye close to
  calm).
- **The near motes** (V2S1_particles): v2's field sat on the bay crown's shade (`on` '#A5AD9A', L* ~70); N's crown is
  narrower and darker, so the field straddled its edge and the paving and the motes read +50 L* over the leaves (bright
  cream dots). Under `foliage` they drift inside the crown's shaded right side (ellipse (262, 1326) 46 x 34, `on` its
  core tone '#375C53'), a light tint over it; `particleProblems` `[]`, traced: they stay inside (x 229-303).
- **Proofs:** every switch off against `Film2R-V2S1` (09:01's frames from v2's own entry) at 0 / 1.0 / 3.0 / 5.2 s after
  the integration: **0 px** (09:49 UTC). The unmottled pass 2 renders byte-identical in two runs (determinism).
  `npx tsc --noEmit` clean. No library added (lib/texture.tsx, lib/foliage.tsx, lib/wind.ts, lib/clouds.tsx unchanged:
  the fixes are all in this folder).
- **Open flags:** E's 10b `waterDeep` dE 15 from her teal (she stands on the towpath in S1); the roof terrace's dark
  planters close under the band (y 604-650); the crown is calm (N's own note: local contrast 2.45 against the posters'
  6.7-12.6).
- **Libraries** (the owner: only when genuinely better): none needed. The far stage is a level pinhole (five formulas
  next to lib/persp's homographies), the darks are drawing, the switches React props; nothing was installed and
  `package.json` is unchanged.
