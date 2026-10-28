# Water v6: the fresh-eyes art director's verdict (S1, 2026-10-28)

**Rank:** a critic's note. The owner's words (the playbook's DEPTH AND SEPARATION water rule, `docs/v2/OWNER_NOTES.md`)
outrank it, then `docs/look/DIRECTION.md`, then `docs/look/CRAFT.md` §f.7, then `src/lib/WATER.md` and `JUDGE.md`.
**The brief** is the owner on v5's water: "I don't like the water too much, leafs are great" ... "It's just looking way
too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the water."
**Judged:** the master the owner would see, `deliverables/v2/v2r_G4_look_v6.mp4` (368 frames), against v5's master; a
lossless still of the current code (Film2R at 3.0 s); `src/lib/water.tsx`, `src/v2r/scenes/V2S1_water.tsx`, `WATER.md`,
`JUDGE.md`. The critic did not design or build this water.

## Verdict
- **Not signed off yet, but close.** One short fix pass (must-fixes 1-2; 3-4 are cheap and go in the same pass), then it
  goes to the owner as v6.
- **Every tell the owner named is gone.** The flat band is now the mirrored evening sky, toned toward the water. The
  box patches are now each thing mirrored about its own waterline. The scattered dashes are now 6-11 calm ripple lines.
  The stars are now a still gold bed with nested slivers.
- **What works:**
  - It reads as water at a glance.
  - Its reflections are logical under S1's one camera.
  - Its motion is calm.
  - Nothing outside the water changed.
- **What still reads as made by a procedure,** which is the owner's "cheap" in a new form:
  - The lit door's gold column is a solid slab with five equal round-capped bars under it. Its 2 px gaps turn khaki
    in the encode.
  - A few crumbs remain: the row's legs are dark slabs that notch the gold, and the left third is a stack of about 15
    pale bars beside the glitter.
  - The ramp's far end is the paving's own colour and crosses the house beige band. Where it shows, at the near-left,
    the water reads as paving (a peach "crown").
- **The canal is also a step greyer** than the approved Canal Mint. The cause is the reflections that cover most of it.
- **Premium: 6.5 / 10** (v5: 2).

## Scores (0-10)
| criterion | v5 | v6 | why |
|---|---|---|---|
| CLEAN at 1:1 | 3 | 7 | Every shape is one smooth closed path, with no stair-steps or specks. Against that: the khaki seams in the gold column (master only) and the peach crown at the near-left. |
| CLEAN at 360 px | 3 | 7 | A calm teal band, the gold column under the door, the boats doubled in slate. |
| PREMIUM at 1:1 | 1 | 6 | A designed language (mirror, Fresnel ladder, glitter lenses), but the gold slab and its equal pill-capped bars read as a stock vector "reflection" effect. |
| PREMIUM at 360 / 720 px | 2 | 6.5 | Glassy and calm. The gold stack is the loudest shape under the row and reads as stacked bars, not light on water. |
| REFINED at 1:1 | 1 | 6 | The crumbs: 14-19 px leg slabs, the crown, and the left third's ~15 pale bars beside 12 glitter lenses. |
| REFINED at phone size | 2 | 7 | The crumbs mostly vanish at phone size. The gold stack does not. |
| reads as water at a glance | 4 | 8.5 | The door's light, the boats and the sun path read at once at 360 px. |
| reflections logical under the one camera | 1 | 8.5 | See the first note below the table. |
| motion calm and alive | 2 | 8 | See the second note below the table. |
| sits in the approved look | 6 | 7 | Flat colour, no lines, and the frame's one cool field. But the water median is C* 11.2 against v5's 13.2, and L* 73.2 against 78.3: greyer than the approved mint. |
| nothing outside the water changed | | yes | See "What I checked". |
| **premium overall** | **2** | **6.5** | |

**Reflection logic.** Every thing is mirrored about its own waterline, and set-back things about the lens line under
them. The facade reflects only the lowest ~2.1 m that our coping lets us see. The sun's column sits straight under
x 196 and is densest at its mirror point, y 1158. Two things miss:
- The mirrored sky has no sun warmth (`waterRamp` drops it), so the glitter sits on cool teal.
- The light's column is as bright as the light itself (L* 80.9 against 81.5).

**Motion.** Checked with x-t slices of rows y 1150, 1185 and 1240 over all 368 frames:
- The sway is smooth.
- No jitter and no strobing slices.
- Ripples and slivers grow in and shrink out, and nothing pops.
- The fields keep their pace through the 6.1 s join.

## Must-fix (ranked; one fix pass; each measured on the MASTER, not only on lossless frames)
1. **The door's gold column becomes light on water, not a slab** (`lib/water.tsx`'s `kind: 'light'` drawing and S1's
   `wing/lobby` source).
   - **Now (3.0 s, x 600):**
     - Solid from y 1123 to 1169, which is ~50 % of its 92 px visible length.
     - Then five equal 6-7 px bars with round caps and 2 px gaps (engine: one block plus five bars).
     - The lossless gaps are teal (#96B5B1, CIE h 187). The master's 4:2:0 chroma turns them khaki (#AAB29A, h 122-131).
     - 13-15 rows of the column (x 556-640, y 1150-1232) are more than half khaki at 1 / 2 / 3 / 4 / 5 s (lossless: 3).
       The box holds 1,703-2,077 px in the house's beige / olive / yellow-green bands (lossless: 474).
     - The column is as bright as the lit glass (L* 80.9 against 81.5), so it competes with the subject's door.
   - **The change:**
     - Keep it solid for at most 35 % of its visible length.
     - Then at most 3 slivers, each at least 15 % shorter and narrower than the one above, ending in lens points (no
       pill caps).
     - Water gaps of at least 4 px, so 4:2:0 keeps at least 2 rows of each gap teal wherever the float puts it.
     - The column sits a step under its source: at least 4 L* under the lit glass at its top, falling with the slivers.
   - **The target:**
     - At most 2 khaki rows in that box in the master, at each of 1-5 s.
     - Eye check at 720 px wide: light glinting on the canal, not a stack of pancakes.
2. **One plane simpler where the eye goes, and a far water that never equals the paving** (S1's spec and the ramp).
   - **(a) The row's legs.** Each figure now reflects as one 14-19 px dark teal slab (L* 60 on a field of L* 71-81). The
     slabs notch the gold and stipple the water under the subject. Make each figure's legs at most 10 px wide in all,
     or two 4-5 px legs with a gap, tapering to a point. Keep each at most 12 L* under its field.
   - **(b) The ramp's far end is the paving's own colour.**
     - At y 1140 the ramp is #F1D2B5 (L* 86.1, C* 19.5, h 71) and the paving is #F1D2B3 (L* 86.0, C* 20.3, h 72):
       dE76 about 1.
     - The ramp then crosses the house beige / olive bands at y 1155-1162: 8 rows at L* 85.6-85.8, C* 6.8-16.7,
       h 74-103. `waterProblems` misses them, because it does not walk the ramp's rows.
     - Where nothing covers it (the notch of the mirrored far roofs, x 40-120, y 1137-1157, against our coping), the
       water reads as paving with two chimney spikes: the "crown".
     - The fix: the reflected sky is a Fresnel step UNDER the sky (at least 4 L* under the air) and a touch toward the
       water's hue. Add the row walk to `waterProblems`.
     - The targets:
       - 0 ramp rows in a house band;
       - 0 water px within dE76 5 of #F1D2B3 (now 295 in the master at 3.0 s, 396 lossless).
   - **(c) The left third's comb.**
     - At 3.0 s, the roofs (4 bars), the tower (4), the pier (3) and lamp 360 (4) put ~15 pale, pill-ended bars plus
       their troughs in x 0-360, beside the glitter's 12 lenses.
     - The fix: the far roofs and the tower become ONE pale far mass, whole or broken once (the far water is a near
       mirror, R5). The pier and the lamp get at most 2 bars each.
     - The targets: at most 6 bars outside the glitter in x 0-360 (a `waterFrame` count). At 720 px the left water
       reads as one calm mirror with one sun path.
3. **The canal keeps the approved Canal Mint.**
   - **Now:** the open body is right: #A0C5BE (L* 76.8, C* 13.7) against v5's #A6C9C1 (13.2). What greys the canal is the
     tone of the reflections that cover most of it:
     - the wing's wall reflection is #9EBBB7 (L* 73.6, C* 10.5) at (560, 1205), and #97B5B1 (C* 11.1) under the row;
     - `TONE_DEFAULT` pulls body reflections toward grey (waterC 10, cMin 6.5);
     - the master's water median is C* 11.2 (v5: 13.2).
   - **The change:** body reflections stay tone-on-tone in the mint family, never a grey-teal. The value ladder and the
     cool field stay.
   - **The target:**
     - median water C* at least 12.5;
     - the wing's reflection at C* 12 or more;
     - at least 83 % cool;
     - no tone in a house band.
4. **The master passes CRAFT §f.7's colour numbers.**
   - **Now:** the builder's cool / warm figures (83.4-85.9 / 12.3-13.8 %) are lossless numbers. The same rule measured
     on the master is in the table below. Most of the gap is fix 1's khaki gaps and the 3-6 px glitter lenses' fringes.
   - **The target:** on the master at 1 / 2 / 3 / 4 / 5 s:
     - at least 83 % cool;
     - at most 15 % warm;
     - at most 1.5 % in the house bands (beige + olive).
     Add the master check to `judge_metrics.py`'s recipe, or to `WATER.md`'s check.

   The master now (mask: S1's geometric water mask, minus pixels within 6 codes of v5):

   | at 1-5 s | cool | warm | olive band | beige band | yellow-green (h 118-150) |
   |---|---|---|---|---|---|
   | v6 master | 79.3-82.2 % | 15.1-16.2 % | 1.8-2.3 % | 0.6-1.0 % | 1.1-1.5 % |

## Nice-to-have
- **Mirror the sun's warmth.** Add it as a low, narrow warm zone straight under the sun, in the far water. It is the
  sky's own gradient seen in the water (DIRECTION rule 6). The glitter's gold then sits on warm water: its fringes stop
  mixing to khaki (the glitter box x 150-240, y 1090-1170 holds 1,257-1,393 khaki px in the master, 918 lossless), and
  the sun path reads less pasted. Keep the water at least 83 % cool.
- **Make the slivers a touch taller.** They are 2.4-4 px tall now; give them at least 3.5 px at their middle. At 360 px
  wide they are ~1 px tall today, so the twinkle barely registers on a phone.
- **Break the boats' bars on their own rhythm.** Offset them from the gold column's rows (one shared wave grid, but
  each reflection's breaks in its own phase), so neighbouring reflections never cut on the same rows.
- **The arch:** the reflection reads as a pale "smile" more than as the arch's opening mirrored. A deeper soffit bowl
  (at least 8 L* under the ring) would close the ellipse at phone size.
- **The thin light seam at each hull's waterline** (3 px, L* 70, between the L* 52 hull and its L* 52 reflection) reads
  as a gap at 2x. Check that it is meant: a contact line is darker.

## Keep (it is right; the fix pass must not undo it)
- **The engine:**
  - mirror about the own waterline (and the lens line for set-back things);
  - the Fresnel ladder in CIE LCh;
  - one smooth solid block per reflection;
  - tone-on-tone troughs on the wing (its 6 bars are nearly invisible, as they should be).
- **The motion:**
  - the travelling sway (±1.4-4.4 px);
  - static seeded breaks;
  - ripple tone fixed per life;
  - sliver rests of at least 0.12 s;
  - the steady fields through the join;
  - the flood reveal at f5-f12.
- **The duck:** its contact lens, its mirrored underside and its approved sway (no V).
- **The coping's crisp contact band** and the far-to-near value ladder (far L* 78-84, near L* 66-74).
- **Everything outside the water,** byte-for-byte in content: the leaves and near motes, the people, Pip, the sky, the
  buildings and the captions.

## What I checked of the builder's claims
- **Nothing outside the water changed.** Two checks:
  - **v5 against v6 masters, frames 0-357:** 3,550 px over 30 codes in total (at most 113 per frame), all thin
    edge artefacts, 1-5 px wide along static building edges (x 779-805 and 907-933, y 606-770). That is encode noise.
  - **The lossless 3.0 s still of the current code against each master, outside y 1060-1300:** 34,259 / 34,128 px
    over 12 codes, and 2,628 / 2,563 over 30. The same content, and the same noise.

  Frames 358-362 (the closing push-in) differ outside that box only because the water itself sweeps through the frame.
- **The master is the current code.** Inside the water, the lossless still against the v6 master: 267 px over 30 codes.
  Against v5: 38,393.
- **`waterProblems(s1WaterSpec(), {t1: 6.13})` is `[]`.** I ran it through an esbuild bundle of
  `src/v2r/scenes/V2S1_water.tsx`.
- **But the ramp, walked row by row** (`waterColourAt` + `neverBand`, y 1111-1290), has 8 rows in the house bands
  (y 1155-1162). Its far end is dE76 about 1 from the paving (must-fix 2b).
- **Engine piece counts at 3.0 s (block + bars + troughs):**

  | source | pieces |
  |---|---|
  | lobby | 6 (no troughs: a light) |
  | wing wall | 13 |
  | pier | 7 |
  | slit | 7 |
  | roofs | 9 |
  | tower | 9 |
  | lamp 360 | 9 |
  | lamp 752 | 5 |
  | each boat | 3 |
  | each bollard | 1 |

- **Motion on the master (2.50-3.48 s, my mask):** 0.69 % px changing per frame, against v5's 0.66 %. Quick toggles are
  1.30 % against 1.51 %, but they include the encode's flicker. The builder's lossless figures (0.47 / 0.69 %) are the
  right ones for the engine; the x-t slices are the eye check.
- **Horizontal edge onsets** (|dL*| > 2 over 3 px, per 1000 water px, master): v5 47, v6 78-88. The bars add 1.7x the
  horizontal edges; fix 2(c) and the fewer slivers of fix 1 bring them down.

## How I looked and measured (scratch on `/dev/shm`; the root disk was full)
- **What I looked at:**
  - The master's frames at 1-6 s at 360 px wide.
  - 1:1 water crops at 1 / 3 / 5 s, and v5 against v6 at 1 / 4 s.
  - 2x crops of the gold column, the glitter, the boats and the wing.
  - 4x crops of the bollard stubs, the crown and the legs.
  - The 10-frame strip f175-184.
  - The draw-in at f0-12 and the push-in at f354-363.
  - v5 against v6 at 720 px wide.
  - x-t slices.
- **Frames from the master** (BT.709, TV range to full):
  `ffmpeg -i deliverables/v2/v2r_G4_look_v6.mp4 -vf "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24" -vsync 0 -start_number 0 /dev/shm/v6/f%03d.png`.
- **A lossless still:**
  `TMPDIR=/dev/shm/tmp node scripts/render-frames.mjs Film2R /dev/shm/ll 3.0 --entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}' --concurrency=1`.
- **The colour classes** (CIE L*, C*, h from sRGB, D65):
  - khaki / olive / beige: h 55-95 at C* 6-18 under L* 86 (the house's beige), or h 95-150 at C* 6-30 (the house's
    olive, 95-118, plus the yellow-green it shades into);
  - cool: h 150-250 at C* over 4;
  - warm: h under 110 or over 300 at C* over 8.
- **A khaki row:** a row of the box with more than 50 % of its px khaki.
- **Pip** (h 250-320) is left out of the box counts.

## The fix pass (the fixer, 2026-10-28): one "fixed" line per item, measured on the re-rendered master
The master is `deliverables/v2/v2r_G4_look_v6.mp4`, re-rendered in place (with its sheet, phone view and water v5 vs
v6 sheet). The numbers are `docs/v2/water/master_check.py` at 1 / 2 / 3 / 4 / 5 s, with the critic's mask and
classes; it reproduces this verdict's numbers on v6's first master exactly. The engine is in `src/lib/water.tsx`, S1's
spec in `src/v2r/scenes/V2S1_water.tsx`, and the how-to in `src/lib/WATER.md`.

| at 1-5 s, master | khaki rows (door) | cool | warm | house bands | median C* | paving px |
|---|---|---|---|---|---|---|
| target | <= 2 | >= 83 % | <= 15 % | <= 1.5 % | >= 12.5 | 0 |
| v6's first master | 13-15 | 79.3-82.2 % | 15.1-16.2 % | 2.80-3.35 % | 11.1-11.2 | 59-411 |
| re-rendered master | **0** | **90.5-91.6 %** | **6.6-7.1 %** | **1.18-1.35 %** | **14.8** | **8-11** |

- **1. Fixed: the lit door is light on water.** It is `kind: 'light'`, drawn by `LightOpts`.
  - A solid block of 33 % of the visible length: from under the coping band to y ~1151. Its bottom is a gentle static
    2.2 px ripple, so no row carries the whole gold-to-water edge.
  - Then 3 leaf slivers, pointed at both ends, flanks 1 - |u|^1.5. They are 102 / 63 / 39 px long (each 0.62 of the
    one above; the first 0.62 x the block's width) and 8 / 6.8 / 5.8 px thick (0.85).
  - The water between them is 7-14 px (>= 4.5).
  - The tone: the lit glass is L* 85.1; the block L* 79.1 (6 under it), the slivers L* 77.7 / 76.5 / 75.1.
  - Khaki rows in x 556-640, y 1150-1232: 0 at every second (13-15 before). The box's khaki px: 609-855 (1,703-2,077).
  - At 720 px wide: the door's mirror breaking into three shrinking glints.
- **2a. Fixed: the row's legs.** Each figure reflects as one slim wedge of its lowest 0.12 h: 8 px wide at the
  waterline, tapering to a point. `kMin` 0.85 puts the tones at L* 67-72, <= 11.5 under the gold block and 1-6 under
  the wall. Over the gold they are small dents, not slabs.
- **2b. Fixed: the far water is never the paving.**
  - The mirrored sky is a Fresnel step under the sky (OKLab L - 0.05). The far end is #D7CDC5 (L* 83.0): 5.2 L* under
    the air #FDD6B8, and dE76 15 from the paving.
  - Through the whole warm-to-cool crossing the chroma is held in the clean gap, C* 4.7-5.5 (`rampGap`).
  - `waterProblems` now walks the ramp as drawn, row by row. It also flags any row within dE76 6 of a `notLike` colour
    (S1: the paving #F1D2B3) and a far water under 4 L* below the `air`.
  - Ramp rows in a house band: 0 (8 before).
  - Paving-like px: 0 in the lossless frames (396 before). In the master, 8-11 (59-411 before): single 4:2:0 chroma
    specks at the glitter's sliver tips (x 188-215, dE76 2.9-5.0). None in the ramp, the reflections or the near-left.
    The target of 0 is not met, by those specks only.
- **2c. Fixed: the left third's comb.**
  - The far roofs and the far tower are ONE pale far mass, whole: `farCity`, its lower edge the skyline smoothed, so no
    chimney notch lets the far water through. The crown is gone (crown box khaki px 0-2, 61-339 before).
  - The pier and the lamps break twice at most (`maxBars: 2`). The bus on the bridge is whole.
  - Bars outside the glitter in x 0-360 (`waterPieces`): 5 at every second from 1 to 5 s (~15 before).
- **3. Fixed: Canal Mint.** `TONE_DEFAULT` is waterC 13.5, cMin 9 (was 10 / 6.5).
  - The wing's reflection is C* 14.0-15.0 (#8DB6B0-#96BCB6); at (560, 1205) C* 13.9-14.8.
  - The water's median C* is 14.8 (11.2 before; v5 13.2).
  - 90.5-91.6 % cool, and no tone in a house band (the lint).
- **4. Fixed: CRAFT §f.7's numbers pass on the master.**
  - 90.5-91.6 % cool, 6.6-7.1 % warm, 1.18-1.35 % in the house bands (olive 0.88-1.12, beige 0.17-0.30).
  - The check is now in the recipe: `docs/v2/water/master_check.py <master> <baseline>`, in `WATER.md`'s recipe and
    `judge_metrics.py`'s header.
  - The glitter's share fell with three changes: a richer amber bed (#F9BE7F, C* 42: its encode rims mix out of the
    bands), no lenses on the far bands under 5 px (7 lenses, not 12), and lenses 0.85 as long.
- **Nice-to-have, the sun's warmth in the water: tried, then declined.** A pale cream path under the glitter (the
  sun's light on the water) read as a pasted grey-beige panel at 2x. Its edges with the gold also mixed into the
  paving's peach (664-766 px in the master). Instead, the amber bed sits on the reflections, as above: glitter box khaki
  px 596-682 in the master (1,257-1,393 before).
- **Nice-to-have, the slivers taller: done.** Slivers are >= 3.5 px tall at their middle at full length (`SLIVER_H`):
  3.5-4.8 px. They live only in lenses >= 4.5 px, so they stay nested, and the lenses fill 0.8 of their band. Their
  gold-white #FEEED1 (L* 94.7, C* 16) keeps every sRGB rim with its lens >= 6 dE76 from the paving. L* 97.5 can hold only
  C* ~7 in sRGB, and its rims were the paving's peach.
- **Nice-to-have, a break phase per reflection: moot for the door.** The door's slivers are no longer on the shared
  grid, so the boats' bars no longer cut on its rows. The rest keep the one grid.
- **Nice-to-have, the arch: done.** The soffit bowl is 8.4-8.6 L* under its ring (`sep` -8.5).
- **Nice-to-have, the hull seam: checked, left.** The 3-4 px light line is the kit's "waterline lip"
  (`kit/canal/boat.tsx`: a CM.waterDeep strip the boat draws over its own water). It is the boat's, outside the water,
  and in a shared kit, so it is not changed here. A proposal for the kit's owner: draw the lip in the hull's shade, a
  darker contact.
- **Checked, unchanged outside the water:**
  - The lossless 3.0 s frame against v6's first code: 0 px differ outside the water region.
  - The masters there differ by encode noise only. v5 -> this: 4,472 px over 30 codes in frames 0-357. v6's first ->
    this, with the same content outside: 3,906.
  - check_depth: 0 FAIL, the same 5 WARN as v5, at 3.0 / 5.4 s.
  - check_banding: PASS on the ramp's open stretch, the west gap and the zenith. The band 0,270,1080,560 WARNs at 0.5 /
    3.0 s on its caption lines (v5 at 0.5 s).
  - check_light: as v5. Its one FAIL is the bank's brightest 5 %, 0.156 / 0.173 H from her; greyed 196 / 185 px (OK).
  - Motion over 2.50-3.48 s: 0.55 % px changing per frame, 1.29 % quick toggles (0.73 / 1.36 before). Horizontal edge
    onsets: 66-72 per 1000 water px (78-88).
  - Determinism: f180 / f300 are byte-identical in two processes. `waterProblems` and `particleProblems` are [].
