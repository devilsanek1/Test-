# The look test, reviewed by the art director (fresh eyes)

*2026-10-29. One of the parallel reviews of `video/deliverables/tests/poster_look_test_v1.mp4` (15.5 s, 1080 x 1920,
60 fps). Judged against the seven posters (`docs/look/poster_refs/`, the owner's four feelings in its README), against
v2's own S1 in the same clip, and against DIRECTION. Times are clip seconds, with pass 2's own clock in brackets (pass 2
local = clip - 8.5 s). Screen spots are px at 1080 x 1920. My scratch: `/tmp/review-art/` (frames, crops, sheets,
`tools/lab.py`).*

## 1. What I looked at
- **The timeline, frame-exact:** the "Before" card 0-1.2 s (frames 0-71), v2's S1 1.2-7.3 s (72-437), the "After" card
  7.3-8.5 s (438-509), pass 2 8.5-15.5 s (510-929). The brief's "about 0.6-6.7 s" for the Before half is 0.6 s early.
- **Frames at full size, both parts at the same local times:** 0.0, 0.05, then every 0.1 s to 1.0 (the opening), 1.5,
  2.0, 2.6, 3.0, 4.0, 4.8, 5.2 (the cover), 5.6, 5.9, 6.05; pass 2's hold at 6.3, 6.5, 6.95. Side-by-side crops at 1:1
  and 2-3x: her and the ghost row, the door, the wing's windows and roofline, the far stage, the cloud, the spray, the
  crown with Pip, the paving, the bottom corners, the boats and the café. A phone-size sheet (390 px wide) of v2 and
  pass 2 at 5.2 s next to Copenhagen and Hanoi; a squint sheet (blurred greyscale) of both parts at 3.0 and 5.2 s;
  every 6th frame of both parts for the float, the wind and glitches. The builder's `ab_switches.jpg`.
- **The posters:** all seven at overview; Copenhagen (a canal quay: the closest to our set) and Hanoi at full size.
- **Measured on the clip's frames** (CIE L*a*b*, my own scripts): the values cited below.
- **Docs:** SUMMARY, STUDY §1-10, REPORT (§5's flags), SCENE, the posters' README, DIRECTION, and v2's
  `THROUGHLINE.md` (what W and the ghost row are in the story, and their tiers).

## 2. Verdict: FIX_FIRST
Pass 2 is a real step toward the posters, and the owner should see it, but not yet. Four things would mislead him on
the very decisions this clip exists to show, and a fifth breaks the depth ladder. All five are cheap: settings and
drawing in `src/look/poster_s1/`, about a day.

**What works (keep all of it):**
- **The value structure is fixed.** The near bank in mid-tones (L* 56-59, was 75-87), real darks 8.2 % (was 1.6 %),
  32 L* from the near group to the air (was 12.6). Pass 2 no longer floats in the light half.
- **The nature is the best thing in the clip.** The plane spray has palmate leaves folded on their veins. The crown has
  true leaf edges and flat facets inside. The hero cumulus has a scalloped edge and flat stepped shade. The wind is calm:
  the spray moves at most 1.3 px per 0.1 s.
- **The sun is calm** (C* 74 -> 31).
- **The float works by depth:** the near bank about 9.5 px peak to peak, the wing about 7, the far roofs 0.3, the far
  stage 0 (the tower's tip sits at y 636 on every frame).
- **The opening is bolder:** from frame 0 to 1.0 s, 65 % of the frame changes by more than 40 luma levels (v2: 35 %).
  The bank's facets pop in a staggered front.

**What misleads:**
- **The subject went flatter than v2 without its outline**, so the owner may undo decision 1 for an execution fault.
- **The darks made whole panes dark beside W**, so the film's thread stops being "the one dark pane" and the squint test
  fails.
- **The spray left v2's autumn hues** (the owner: keep v2's colours).
- **The paving reads as a diamond chequer**, not the posters' "low poly".
- **The far landmark is a pink sticker**, no paler than the roofs in front of it.

Fix the five, re-render, then SHOW.

## 3. The four feelings, pass 2 against the posters and against v2
1. **Depth, "something WAY further out": half.**
   - Near against far is delivered. It is the clip's biggest gain: two value groups, a dark near frame, bottom corners
     L* 52 / 59 (v2 67 / 70; posters 44 / 53).
   - "WAY further out" barely registers. S1's wing covers about 75 % of the horizon, so the far stage lives in a
     260 px gap. Its landmark is 30 x 125 px and pink (MUST 5). The posters' far anchor spans the width (Esja, Kyoto's
     ranges) or is huge.
2. **Crisp main objects, a simpler coherent world: not yet.**
   - The subject is less crisp than v2. Her coat lost the belt, bow and collar. The copies are flat cream columns
     (MUST 1).
   - In the world, the crown and the spray are exactly the owner's "low poly yet coherent".
   - The paving chequer is a change of MODE: you spot it at once, which is what the owner said must not happen
     (MUST 4).
   - The dark panes put loud contrast on C right beside A (MUST 2).
3. **Nature, real yet faceted: yes**, the strongest of the four (see §2). Off: the season (MUST 3).
4. **Colours, vibrant and coherent: half.**
   - More coherent and more premium in value.
   - Less vibrant than v2:
     - the spray's warm confetti is gone (87 % gold and rust at C* 33-36, now 86 % green at C* 19);
     - the bank is one large mid-chroma tan (L* 58, C* 18.7, h 61);
     - accents at C* >= 35 fell from 4.8 % to 3.8 % of the frame;
     - p90 / p50 fell from 1.96 to 1.45.
   - The posters ring because of many small saturated pieces on a calm base (Copenhagen's facades). Pass 2 has few.

**Where it still reads "cheap and lazy"**, worst first:
- the flat cut-out figures;
- the chequer floor;
- the dark slabs with a white diagonal glint (a stock-vector glass trope);
- three dark trapezoids on the wing's roof that read as pitched roofs of hidden houses;
- generic furniture blobs in the lit windows;
- the near boxes as big flat slabs;
- her tote turned neutral grey.

## 4. Every decided rule, checked on the frames
| Rule (decided 2026-10-29) | Visible | Right | What I see |
|---|---|---|---|
| No outlines, edges from light and shade | yes | **no on the figures** | The line went, but the drawing it carried (belt, bow, collar, sleeves, strap) was not redrawn in value. Thin dark bars on props read as lines (SHOULD 1). |
| The subject's shade face the deepest | partly | partly | Her coat goes from L* 49 to 28 (-21), but only as a 4-6 px sliver. The copies' shade does not read at phone size. W (L* 21.8) is only 6.5 L* under the new ground-floor panes. |
| Real darks in many small pieces | yes | **placement no** | 8.2 % in 130+ pieces (REPORT: met). About 20 % of the dark area sits in five big pane recesses beside the door and W (MUST 2). |
| "Low poly" patchwork, never on the subject, never in the sky | yes | **look no** | Placement right. The paving is a 2-tone diamond chequer (MUST 4). The far walls' blocks barely show. |
| Far stage: pale ghost skyline, one landmark | yes | **landmark no** | Ghost blocks pale (L* 85-88), still in the float. The tower is a flat pink (MUST 5). |
| London plane: real edges, faceted inside, calm wind | yes | yes, colour no | The spray and the crown are premium. They are summer green while gold and rust leaves fall (MUST 3). |
| Hero cumulus | yes | yes | Small blemishes at 3x (SHOULD 7). |
| Toned sun | yes | yes | dE ~19 from its sky. Calm at phone size. |
| VERY subtle mottle | no (by design) | yes | Invisible at phone size. The owner can judge it only on the A/B sheet's crops (SHOULD 9). |
| Pip hidden | yes | yes | In the crown at (178, 1412): about 8 px at phone size, lavender with a pink paw on "life". Off her eye path. |
| The float by depth | yes | yes | Near 9.5 px, wing 7, far roofs 0.3, stage and sky 0. The same near-to-wing ratio as v2. |
| Frame 0 a bold event, its line under the colour | yes | yes | W's line goes under at 0.40, the door's by 0.6, her coat's by 0.8. The flood is bigger than v2's. |

## 5. The builder's flags (REPORT §5), weighed
1. **The copies' row at 7.9 L* without outlines: worse than a flag, and only half the problem.**
   - The row is tier A ("her + her ghost row (one subject)", v2 THROUGHLINE §4). It is the cover's story ("for life").
   - Where a copy crosses the lit door glass or the bridge arch, it is 0 L* apart from it (coat 86.1 against 84-88). The
     first copy pops in front of the lit door at 11.1 s (2.6) and barely shows.
   - Her own figure lost its drawing too.
   - Not the "lined exception": it contradicts decision 1 (c). MUST 1.
2. **The calm paving: the fields number is the symptom, the chequer is the problem.** All three settings ('busy',
   'mid', 'calm') are the same lattice. MUST 4.
3. **10b's chroma spread: real.** MUST 3 restores most of the lost warm accents. Small saturated pieces would add the
   rest (SHOULD 6). The owner should be told 10b is a proposal inside pass 2 (SHOULD 9).
4. **The open sky 34 -> 32 %: accept.** The cumulus earns the 2 points. But the spray grew threefold (9.7k -> 29.7k px)
   and darkened into the frame's top-left dark mass. MUST 3 lightens it.
5. **Pip at about 13 px: fine.** It is a quiet "find Pip", as decided.
6. **The mottle's cost (+5 % bitrate): fine.**
7. **waterDeep against her teal:** not on screen in S1.

## 6. MUST-FIX (5)
1. **The subject is flatter than v2: the ghost row melts away and her drawing is gone.**
   - *Where:* the towpath row, x 0-760, y 900-1100. From 11.1 s (2.6: the first copy pops on the lit door) to 15.5 s.
     Worst on the cover frame, 13.7 s (5.2).
   - *Why:*
     - Tier A owns the contrast (rule 2), and "the subject never melts into what is behind it" (owner, v2 G4).
     - 10b lifted the oat coat to L* 86.1. Against the lit door glass and the bridge arch (L* 84-88) the copies have
       nothing. The REPORT measures a median 7.9 L* (v2: 13.0 with its line).
     - The belt, collar, sleeves and her bow were lines and went with them. The shade face is a 4-6 px sliver.
     - Her tote turned neutral grey under the cool shade (L* 49, C* 2.6; v2 cream, L* 76, C* 16): "never grey".
     - The owner would judge "no outlines" on a subject that looks cheaper than v2's.
   - *Fix* (`V2S1_row.tsx`, `V2S1_row_fig.tsx`):
     - Widen each copy's `FormShade` to the whole side away from the key: about 40 % of the coat's width, at -22 L* in
       the warm family. Every copy then shows a lit half (it parts from the rose wall) and a shade half (it parts from
       the pale bridge and the door glass).
     - Redraw the belt, collar and sleeve on every member as flat value shapes in the coat's own shade tone, no line.
       Her bow the same.
     - Keep her tote cream, with a warm shade. Its strap stays a thin line (a strap is a line, rule 4).
     - Add a rim on her hair's key side where it crosses the dark door frame.
     - Check: the row's separation >= 15 L* at 5.2 s (`check_depth`), and her "one value" share <= 20 %.
2. **W is no longer "the one dark pane", and the darks pull the eye off the subject.**
   - *Where:* the wing, x 380-1080, y 600-1050, from 9.0 s (0.5, after the flood) to the end:
     - the two ground-floor panes beside the door: x 388-428 and 811-931, y 866-1048, L* 28.3;
     - the first-floor panes: x 528-600 and 620-690, L* 32.2;
     - W: x 807-913, y 609-773, L* 21.8.
   - *Why:*
     - W is the film's thread: "it goes dark when she quits (0.40); it is the one dark pane" (THROUGHLINE §1.2).
     - In v2 the other panes sat at L* 78-87. Now they are 6.5-10.5 L* from W, and the right ground-floor pair is as
       big as W (16.3k px against 16.6k).
     - The squint test (rule 2: the eye on the beat's subject) now lands on five to seven dark spots, not on W and the
       figures.
     - The café stranger's mustard coat is now 45 L* off the navy pane behind him (v2: 4.5), far more contrast than the
       ghost row's 7.9.
     - The panes are five big slabs holding about 20 % of the dark area, not "many small pieces" (rule 6).
   - *Fix* (`darks.ts`, `V2S1_set_wing.tsx`):
     - Return the unlit panes to glass that mirrors the sky: L* 60-75 in v2's cool family, a dark band only at the sill
       and the reveal (<= 25 % of each pane). Or light them with blinds.
     - Keep the furniture silhouettes in the lit panes.
     - W stays the only full dark pane, at least 15 L* under any other.
     - The dark share falls from about 8.2 % to about 7 %: still inside 6-10 %, still more than 120 pieces in the same
       cells.
     - Check: the squint at 3.0 and 5.2 s puts the darkest mass on W and the row.
3. **The spray and the crown left v2's autumn hues: green trees drop gold and rust leaves.**
   - *Where:* the top-left spray, x 0-300, y 0-275, through all of pass 2. Also the near crown, x 0-340, y 1200-1450.
   - *Why:*
     - The owner: "I like the colors of our last video about Google". The study made that "keep v2's hues" [owner].
     - v2's twig was 87 % warm: gold L* 73 C* 36 and rust L* 59 C* 33 (`CM.leafGold` / `CM.leafRust`).
     - Pass 2's spray is 86 % green (L* 53, C* 19) on three times the area.
     - So the top third gained the frame's darkest corner mass (the squint shows it) and lost its warm confetti.
     - The falling leaves stay gold and rust, in v2's October evening, under green trees. That breaks "coherently fit
       together" (feeling 4).
   - *Fix* (`V2S1_nature.tsx`):
     - `s1SpraySpec` `autumn` 0.1 -> about 0.75. lib/foliage's `autumnTone` already gives v2's two hues (gold h 76,
       rust h 52) on each leaf's lit and shade ladder, so N's geometry and faceting stay. Two or three leaves stay sage.
     - `s1TreeSpec` `autumn` from the species' 0.035 to about 0.15-0.2, so the falling leaves have a source.
     - Re-run `s1NatureProblems`.
4. **The paving reads as a diamond chequer, a pattern, not the posters' "low poly".**
   - *Where:* the whole bank, x 0-1080, y 1150-1920, from 9.0 s (0.5) on, and already in frame 0's pale wash.
   - *Why:*
     - Decision 3 is "low poly" facets that you "can't immediately spot". The owner's test: nothing off in a 2 s flick.
     - The calm setting is a guillotine split with 2 tones 4.5 L* apart, on 1.2 m cells snapped to a 0.3 m grid.
       Neighbours must differ, so the two tones alternate, and the bank's two-point camera turns them into diagonal
       diamonds.
     - At 390 px wide it reads at once as an argyle floor over about 30 % of the frame. The study calls such a mode
       change cheap; the posters never make one (Copenhagen's quay is a few large, irregular facets).
     - The 4.5 L* steps sit under the fields detector, hence REPORT flag 2's 18.8 % edge-free field.
   - *Fix* (`V2S1_patch.tsx`, `PAVING` / `treadPatch`):
     - A new setting: cell about 2.4 m (near facets 60-100 px, the posters' 3.5-7.5 % of W).
     - 3 tones 5-7 L* apart, so neighbours cannot strictly alternate.
     - `jitter` 0.4, `grid` 0.6 m or off, marks about 1 in 24; keep the key bias (lighter toward the west sun).
     - Make it the default and judge it at 390 px: no repeat visible in a 2 s flick. Then `patchworkProblems` and the
       fields measure.
5. **The far landmark is a pink sticker, no paler than the roofs in front of it.**
   - *Where:* the telecom tower, x 85-115, y 636-760, left of the sun, from 9.0 s (0.5) to the end.
   - *Why:*
     - Decision 4's "pale ghost skyline and one landmark" carries feeling 1's "something WAY further out".
     - Far things converge on the air (rule 2), and SCENE §6's own spec says "paler than anything nearer".
     - Measured, it is one flat pink from tip to foot: L* 79-84, C* 18.5, h 36. That is dE76 16-21 from the mint sky
       beside its upper 60 % (only 4-7.5 at its foot, in the warm glow).
     - It is as dark as the far roofs in front of it (L* 82-86) and more chromatic (C* 12-13). So the ladder is
       inverted, and it is the loudest far thing after the sun.
   - *Fix* (`V2S1_far_stage.tsx`):
     - Tone the shaft and the crown from the sky at their own height, as the ghost cluster over the wing already is: mix
       toward the air at that y with k 0.8-0.87.
     - Targets: L* >= 86, C* within 4 of the air, dE76 <= 8 from the sky beside it on every row.
     - Keep the lit sliver at +2-3 L*, and the warm pale foot only where it meets the horizon glow.
     - Check: the tower is paler than the far roofs on every row.

## 7. SHOULD
1. **Dark bars that read as lines (rule 4):**
   - The crate's two long hand slots (x 375-550, y 1590-1700) should be short rounded slots, about a quarter of the
     crate's width.
   - The planter's soil lip (along its top edge, x 0-280, y 1470-1590), the bench's top stripe (x 850-1080, y 1420-1470) and the pot's board
     should each be an 8 px or wider band with a lit edge, or dropped.
   - The lintel bands across every lit pane should be thinner or the pane's own shade step.
2. **The roof terrace's three dark trapezoids** (x 370-430, 480-550, 590-665, y 625-650) read as pitched roofs of hidden
   houses on a flat roof, right under the band. Give them their plants and a lit face, or drop them.
3. **The furniture silhouettes in the lit panes** are round-topped navy blobs and brown "H" shapes, generic at 1:1. Use
   fewer, nameable shapes on the sill line: a person at a screen, a plant, a pendant.
4. **The white diagonal glint on dark glass** is a stock-vector trope. Once MUST 2 lifts the panes, let the glass carry
   the sky's own flat tone with one soft step.
5. **The near boxes are still big flat slabs:** the left planter's face (x 0-270, y 1490-1840) and the right box
   (x 860-1080, y 1570-1920) are part of the 19 % edge-free fields. Give each a lit top, a shade face and 2-3 planks or
   one object of use (a chalkboard menu on the café box is a dark piece).
6. **Vibrancy after MUST 3:** a few saturated small pieces in the mids, never fields:
   - the narrowboats in a canal livery (deep red or bottle green with cream lettering);
   - a red life-ring on the coping;
   - warmer bunting.
   Aim to bring accents at C* >= 35 back to about 5 % of the frame, in 40 or more parts, and p90 / p50 toward 2.
7. **The hero cumulus at 3x:**
   - The lavender base slab overhangs the lobes at both ends, with fuzzy ends (x 600-615 and 1030-1055, y 230-270).
   - Faint concentric arcs sit outside the right lobe (x 1005-1040, y 200-240).
   - End the shade inside the silhouette, as flat steps.
8. **The designed view's room:**
   - S1's wing leaves the far stage a 260 px gap, so the owner judges decision 4 here in principle. Say so in the
     message, or show it again on the scale landing.
   - Let the ghost skyline span that whole gap at two values.
   - The wing's west edge against the calm tower is 10.9 L* (`check_depth` WARN): one shade step there helps.
9. **Tell the owner what he is looking at:**
   - 10b's calm lights are a proposal inside "the poster lessons"; offer a `palette10b: false` variant to separate the
     palette from the decided rules.
   - The mottle can only be judged on `ab_switches.jpg`'s crops.
10. **The far copies' white heads** sit 6.5 L* from the bridge parapet, which 10b lifted from L* 81.9 to 86.2. After
    MUST 1, check the far end of the row at phone size.
