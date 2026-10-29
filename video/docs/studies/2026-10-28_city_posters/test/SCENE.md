# The look test's scene lane (S): v2's S1 copied, the darks, the far stage, the switches

*Lane S of the 7 s look test (`STUDY.md` §10: items 5 and 7, the S1 copy and the switches). 2026-10-29. Done through
item (4); the integration and the renders (item 11) wait for the orchestrator's message (lanes PT's texture and N).
Scratch work in `/tmp/posters-s/` only (an early tool of mine in the shared scratchpad, `tools/pxdiff.py`, is the one
that replaced lane E's: every proof below was re-run from my own folder).*

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
| `patchwork` | the "low poly" world (decision 3 a): our bank's treads as facets RECEDING through the bank's one camera (PT's `twoPointCam`: v2's two VPs exactly; 4 m = v2's ~1.2 m blocks), a 0.3 m paving module, the tread's own stone (mid-tones under `darks`) as shown through the tier pull, marks 1 in 14; the far rows' walls as frontal blocks from their receded colours (+4 two values, +3 three), each row's drawn over its own walls and under the nearer rows | lib/patchwork (PT, done) | wired, rendered | `V2S1_patch.tsx`; `V2S1_steps_stone.tsx` StoneBand; `V2S1_set_far.tsx` FarRoofs |
| `farStage` | the designed view (decision 4 a): §6 | lib/persp `farStage` (S), `anchorTones` (E) | built | `V2S1_far_stage.tsx`, `V2S1_set_far.tsx` |
| `foliage` | one species tree for the bay, the leaf spray for the top-left twig | lib/foliage + wind (N) | PLACEHOLDER (`TreeSlot`, `SpraySlot` draw v2's crown and twig) | `engine.tsx`; `V2S1_fore.tsx` Planter; `V2S1_set.tsx` |
| `cloud` | a hero cumulus for the kit's cloud (box y 160-272, above the band) | lib/clouds (N) | PLACEHOLDER (`CloudSlot` draws the kit's) | `engine.tsx`; `V2S1_set.tsx` |
| `texture` | the VERY subtle mottle per plane (true, or a number: on from that second) | lib/texture `<Mottle>` (PT, in progress) | PLACEHOLDER (`TextureSlot` wraps every plane group, `S1Plane`, the sky included: passes its children through) | `engine.tsx`; `V2S1_float.tsx` S1Plane |
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

## 7. For the integration (item 11)
- **PT's texture:** replace `TextureSlot`'s body in `engine.tsx` with `<Mottle k={mottleK({plane, sky})} on={textureAt(sw, t)}>`
  (every `S1Plane` group already passes `plane`; the sky's group passes `sky`); none in the band (Mottle's default).
- **N's foliage:** `TreeSlot` (box [-48, 1308, 334, 174], trunk foot (126, 1530), plane -2) and `SpraySlot` (the
  top-left gutter box) render N's `<Crown>` / `<LeafSpray>` under `sw.foliage`. **Pip's spot lives in v2's crown**:
  with N's crown, draw `<S1PipInTree />` between its back and front layers (or move Pip's seat into N's crown), and
  re-check that it reads on a second look only. The darks' crown shade then comes from N's tone ladder (its lowest tone
  L* 36 is a dark piece).
- **N's cloud:** `CloudSlot` (box [640, 160, 360, 112], drift 2 px/s) renders N's `<Cumulus>` under `sw.cloud`.
- **Flags for the art director:** (1) the patchwork paving at the near world's mid-tones reads busy (a full chequer of
  dL* 4-10 at L* ~55-60 over 30 % of the frame): tune PT's cell or steps, or keep the treads' tones closer; (2) E's
  flag stands: 10b's `waterDeep` sits dE 15 from her teal (she stands on the towpath, not against the deep water, in
  S1); (3) the roof terrace's dark planters sit close under the band (y 604-650): drop them if the band edge reads
  busy; (4) Pip's head is periwinkle on the sage crown: if it reads too readily at 2 s, push the seat 10 px down.
- **Libraries** (the owner: only when genuinely better): none needed. The far stage is a level pinhole (five formulas
  next to lib/persp's homographies), the darks are drawing, the switches React props; nothing was installed and
  `package.json` is unchanged.
