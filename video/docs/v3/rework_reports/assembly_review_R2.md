# v3 rework assembly: independent review R2, THE LOOK (clean, premium, light), 2026-10-28

Lens: the line (CRAFT §c), the light and shadow (§d), the depth (§f), full but calm (§b, `density.py --cozy`), every
sequence against the approved hook pilot SQA (`deliverables/v3/v3_rework_pilot.mp4`). The film under review:
the integrator's `film_full.mp4` (2469 frames, 1080 x 1920, 60 fps, code at be03dfa). Judged only against the owner's
words and the rules. Done (2026-10-28): verdict, scores and 5 findings below.

## Status
- [x] read the rules and the integrator's report
- [x] sheets at full and phone size
- [x] line budgets per sequence (`retro_tools/line/measure.py`, 39 film frames + 5 pilot frames, caption band out)
- [x] light per set (`check_light.py`, 21 light-off/on pairs rendered from the code at HEAD; v3 code unchanged since be03dfa)
- [x] fullness and calm (`density.py --cozy` on the film, per sequence)
- [x] depth (far planes: `check_depth.py` with an H2 plane sheet, `R2/h2_rest_sheet.json`), 1:1 crops of the worst areas
- [x] findings

## Numbers so far (evidence: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/R2/`)
- **Line** (per Mpx, band out; budget strokes 80 / short 25 / ends 40 / dark px 3 %): the pilot itself runs 98-194 strokes,
  74-172 short, 207-391 ends, 0.76-1.16 % dark (text and flat dark shapes count: the integrator's "accepted as in the
  pilot"). The film sits inside the pilot's own range everywhere: SQB 101-146 / 81-112 / 192-273; SQC 100-167 / 83-149 /
  192-333; SQD 53-120 / 48-116 / 90-240; SQE 124-156 / 116-144 / 232-308; SQF 123-136 / 108-119 / 251-296; dark px
  0.17-1.17 %. SQA in the film = the pilot (to +-5 strokes). No sequence is rougher than the pilot by this measure; the
  defects below are shapes and texture the line mask does not count.
- **Light** (`check_light.py`): SQB 8.5 / 12.5 / 14.9 OK (brightest 5 % on the card, 0.00-0.04 H; shadow shapes 11.5-12 %;
  no light shape in the frame: the lamp's pool is off-frame left); SQC 17.7 brightest 5 % 0.151 H off the listing laptop
  (the white listing page below it; marginal), 18.5 / 18.88 on the stick (0.00 H); the caption-band FAILs at 2.0 / 4.5
  (the pilot) and 18.5 / 18.88 are the known highlight-box false positive. SQD 19.7: the light layer touches 2.4 % of the
  frame (rim + contact under THE stick only); 20.8: brightest 5 % on the town's caps below the pile (0.13 H off a pile box
  reaching y 1400); 21.4 / 22.0 OK. SQE warm-lit 7.9-12.7 % (CRAFT 8-15: E11's 4.9-7.0 % fixed), brightest 5 % on each
  beat (0.00-0.02 H). SQF 37.2 0.065 H, 38.9 / 40.1 0.00 H, warm-lit 5.5 %.
- **Fullness and calm** (`density.py --cozy`): movers / empty frames / cv: SQA (the pilot) 3.6 / 9 % / 2.10; SQB 1.7 / 55 %
  / 2.50; SQC 4.1 / 39 % / 1.05; SQD 1.6 / 59 % / 1.77 (76 track jumps: a crane, not a hold); SQE 2.4 / 5 % / 1.76; SQF
  2.0 / 21 % / 1.41. Fullness: flat 30-40 %, detail 20-29 % (the pilot 25 %); SQB the emptiest (detail 20 %, static 58 %).
- **The pile** (dark chip marks in y 620-1800): 19.7 231, 20.0 358, 20.4 730, 20.8 596 (573 / Mpx at 20.4) against the
  pilot's room 152-198 (119-155 / Mpx); detail tiles 30 % at 20.8 (pilot 10-15 %); its fills tan-brown (#966D58 L* 50 C*
  23, #B08361 L* 58 C* 28, #D4AC7C L* 73 C* 31) under THE stick's gold (#EFB063, L* 76, C* 50).
- **Depth, H2 at rest** (`check_depth.py`, 23.5 and 37.2; air = FAR_AIR #7D8AB6): street (subject plane) contrast 9.2-11.0;
  town +1 dE 18.3 from the air; DC +2 dE 19.5 (WARN: not >= 3 closer than the town); the mountain +3 dE 47.4 (WARN: no air at
  all), L* range 28, 4 values, C* 32.7 (C90 38.7); the far ridge +4 dE 2.8 (OK). The far pile's box (430 x 245 px) holds
  ~360-376 specks (4-80 px marks > 4 L* off their 15 px median) at 23.5 / 37.2 / 38.9, about 3,500 / Mpx against ~495 / Mpx
  in the pilot's whole window band (5.5); Canny edge px 13.6 % (street 8-9 %, town 9 %).
- **Squint** (L* blurred sigma 25, darkest 3 %): 23.5 the calm DC (squint L* 37.7), then the desk planner (43.4), then the
  DC truck; 38.0 the DC on its beat (30.0), then the planner (43.4).
- **Checked and clean**: no rough, doubled or misregistered stroke found at 1:1 in SQB (desk, card, skylight), SQC (the 700 px
  stick), SQD (THE stick on its bed), SQE (DC sign, vans, booth, gate), SQF (the payoff tag front and back); the rims sit
  inside their silhouettes (19.7 / 18.5 / 18.88: 0 lit px on the sky colour); E7 (THE stick on gold), E10 (payoff rim +
  form shade, the back's bands), E13 (book shadows rotated), E15 (dark captions at the loop) are in. The payoff tag's rim
  covers its outline on the key side exactly as the pilot's tag does at 2.0 (same treatment: not below the bar).

## Verdict
The look answers most of the owner's note: the clean pen holds in every sequence (no rough, doubled, broken or misregistered
stroke at 1:1; line counts inside the pilot's own range everywhere), the colour is warm and never sickly (khaki / olive
0.0-0.1 %), and every set has one light logic with contact and form shadows (check_light OK in 20 of 21 pairs; the rest
the known highlight-box false positive and a marginal 0.151 H). What an owner sees first below the pilot's bar: the
reveal's pile at 19.6-21.2 (pallets, then a brick and woven texture at 3.7-4.8x the pilot's mark density), the far
mountain's specks through all of SQE and SQF (~7x the pilot window's, no air), and SQB's 9.5 s hold, where the planned
life is too small to see (55 % of its frames without a mover, the pilot 9 %).

## Scores (the measures R2 ran; evidence in `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/R2/`)
- **Line** (`retro_tools/line/measure.py`, per Mpx, band out; strokes / short / near-miss ends / dark px): pilot SQA
  98-194 / 74-172 / 207-391 / 0.76-1.16 %; film SQA = the pilot (+-5); SQB 101-146 / 81-112 / 192-273 / 0.81-1.17 %; SQC
  100-167 / 83-149 / 192-333 / 0.64-1.07 %; SQD 53-120 / 48-116 / 90-240 / 0.17-0.53 %; SQE 124-156 / 116-144 / 232-308 /
  0.51-0.93 %; SQF 123-136 / 108-119 / 251-296 / 0.71-0.96 %. All over CRAFT's 80 / 25 / 40, as the pilot is (text and flat
  dark shapes count); none rougher than the pilot.
- **Light** (`check_light.py`, 21 pairs at HEAD): brightest 5 % on the subject in 20 of 21 (17.7: 0.151 H, on the lit
  listing page under the listing laptop); caption-band FAILs only on highlight-box frames (2.0 and 4.5 = the pilot, 18.5,
  18.88); greyed shadow px under the limit everywhere; SQB lit 0.2 % / ambient 52 % / shadow shapes 12 % (the lamp
  off-frame left, shadows down-right: consistent); SQD 19.7 the light layer 2.4 % of the frame, the rims 0 px outside
  their silhouettes; SQE warm-lit 7.9-12.7 % (CRAFT 8-15); SQF 5.5-9.7 %.
- **Depth** (`check_depth.py`, H2 sheet, 23.5 / 37.2): street contrast 9.2-11.0; town +1 dE air 18.3-18.7; DC +2 19.5-19.8
  (ladder WARN); mountain +3 47.4 (WARN: no air; range 28, 4 values, C* 32.7); far ridge +4 2.8. 0 FAIL, 4-5 WARN.
- **Full but calm** (`density.py --cozy`; movers / empty / cv): SQA 3.6 / 9 % / 2.10; SQB 1.7 / 55 % / 2.50; SQC 4.1 / 39 % /
  1.05; SQD 1.6 / 59 % / 1.77 (a crane: 76 track jumps); SQE 2.4 / 5 % / 1.76; SQF 2.0 / 21 % / 1.41. Flat 30-40 %, detail
  20-29 % (pilot 25 %).
- **Texture** (dark marks / Mpx): pilot room 119-155; SQD pile 181 / 281 / 573 / 468 at 19.7 / 20.0 / 20.4 / 20.8; far pile at
  H2 rest ~3,500 specks / Mpx (pilot window ~495).
- **Salience** (CRAFT §e, top 3 %): SQE street 71-89 %, mountain 0.7-5.2 %, DC 0 %; 30.4 the phone 100 %; SQF 37.2-38.0
  the DC 47-50 %. **Squint**: the calm DC, then the desk planner, are the heaviest darks of SQE / SQF.
- **Colour**: khaki / olive 0.0-0.1 % everywhere; warm share SQB 80 %, SQC 86 %, SQD 27-69 % (dusk), SQE / SQF 44-58 %;
  Pip C* 22-24.
- **Joins** (R2's colour shift / carry, 108 px wide, band masked, mean Lab over 0.4 s): J1 2.7 / 0.89, J2 2.5 / 0.89, J3
  12.5 / 0.62 (declared light change), J4 5.6 / 0.73, J5 0.3 / 1.00, loop 5.5. No look break at a join.

## Findings (ranked: blocker, then by how long the owner sees it)
- **R2-1. BLOCKER. SQD 19.60-21.20, centre and lower two thirds: the summit's pile reads as wooden pallets, then a brick
  wall, then a woven haystack: the busiest, roughest frames of the film** (lane: reveal). Owner: "The style is too rough
  and messy ... cleaner, more refined, gentle, a lot more premium"; "too busy"; "There is no story" (flow_v2 §7: it must
  read "a stick on a pile of sticks"). Measured: dark chip marks in y 620-1800 231 / 358 / 730 / 596 at 19.7 / 20.0 /
  20.4 / 20.8 (573 / Mpx at 20.4) against the pilot's room 152-198 (119-155 / Mpx): 3.7-4.8x; detail tiles 30 % at 20.8
  (pilot 10-15 %). The crest sticks carry none of THE stick's value pattern: board #D4A268 L* 70 / pin strip #CDAA7F-#D3B58B
  L* 72-76 (no light edge) / chips #966E59 L* 50 C* 23, against THE stick's 77 / 92 / 13, no outline: tan planks with
  brown slots. The line mask is clean (53-120 strokes / Mpx): the fault is count and read. **Fix:** `SQD_peak.tsx`
  `PEAK_D` (the chip pass and `lodAt`): chips only on the crest's 8 sticks (`s.crest`: THE stick's bed and the second
  layer); every lod-1 stick a flat gold board with its pin strip as ONE flat light band (THE stick's pin cream one step
  down, L* ~85, no pin lines) and no chips; the crest's pin strips in that band, so each big stick reads gold board /
  light pin edge / dark chips. Target: <= ~200 marks in y 620-1800 through 20.0-20.8 (the pilot's level).
- **R2-2. MAJOR. SQE + SQF 22.68-41.15 (18.5 s), the window band's upper right: the far mountain is the busiest texture of
  the window and has no air** (lane: reveal). Owner: "some supporting environment can be drawn a bit more subtle"; "too
  rough and messy"; "not sure what to keep my attention on". Measured (`check_depth.py`, H2 sheet, 23.5 / 37.2): the
  mountain (+3) dE 47.4 from FAR_AIR #7D8AB6, against the DC (+2) 19.5 and the town (+1) 18.3; L* range 28, 4 values, C*
  32.7 (CRAFT §f.2: no two values over 12 dE apart on +3); ~360-376 specks (4-80 px marks > 4 L* off their 15 px median)
  in its 430 x 245 px box at 23.5 / 37.2 / 38.9 (~3,500 / Mpx), against ~495 / Mpx in the pilot's whole window band at
  5.5; Canny edge px 13.6 % against the street's 8-9 % (the subject plane). SQD_peak's header promises SQE / SQF "the calm
  pile: a golden mass with a pile's silhouette, no specks", but `lodAt` keeps pale chips and pins within 150 H2 px of the
  summit and every stick keeps its lit top. **Fix:** `SQD_peak.tsx` `RevealPeak` at the far plane's rest scale (x1.0-1.08,
  from the load beat 23.10 with the pile rim's own step): no chips, no pins, no per-stick lit tops outside THE stick: the
  pile's silhouette in 2-3 flat values (the gold, its lit upper-left slope, the flank's form shade), its fills one +3
  plane step toward FAR_AIR (`lib/depth` `recede`, k .40: C* ~33 -> ~22, hue kept). Re-run check_depth: the mountain >= 3
  dE closer to the air than the DC, specks at the pilot window's ~500 / Mpx.
- **R2-3. MAJOR. SQB 6.45-15.95 (the film's longest hold; quiet stretch 10.9-13.85), the whole frame: the world stops**
  (lane: home). Owner (G5): "way too empty"; now: "the supporting details / supporting animation that adds subtle
  loveliness, like a bird flying, should be a bit more subtle but yet alive". Measured: `density.py --cozy` SQB movers
  1.7, empty 55 % (the pilot SQA 9 %; cozy references <= 5 %), cv 2.50; static 58 %, longest gap 3.33 s, detail 20 % (FAR).
  The life planned for it is under phone size: the skylight flakes 4-7 px (`Snowfall` size 0.75, 9 flakes in a 224 x 206
  pane, 16-26 px/s; CRAFT §f.6: particles SEEN at phone size, motes 6-10 px), the string-light bulb 7 px ("never a
  noticeable mover"), the steam two 1.8 px strands: in 10.9-13.85 nothing a phone viewer can point at moves but the 1.6
  px/s float. **Fix:** `home_set.tsx` `SkylightSnow`: the flakes at SQA's near-window size (`Snowfall` size 0.75 -> 1.6:
  8-15 px; n 9 -> ~14; speed 0.6 -> 0.85), so 3-5 flakes always drift visibly through the pane all hold long (tier C, the
  pane still clips them); then the phone-size check (a viewer points at the snow without searching) and `density.py
  --cozy` SQB again (empty toward the pilot's 9 %).
- **R2-4. MINOR. SQE + SQF 22.68-41.15, the H2 desk, lower centre (x 470-770, y 1580-1770): the planner is the heaviest
  near dressing** (lane: window). Owner: "some supporting environment can be drawn a bit more subtle"; "not sure what to
  keep my attention on". Measured: `PLANNER` #97646C renders L* 44.5 (C* 24.5) on the desk's L* 61.5: dL* 17 (CRAFT §c,
  tier C: <= 15 inside one plane); at a squint (L* blurred sigma 25) it is the frame's second-heaviest dark at 23.5 and
  38.0 (squint L* 43.4), after the DC and ahead of the street's subjects bar the DC truck (CRAFT §f: "the heaviest area at
  a squint must be the subject's, never the near dressing"). **Fix:** `h2_window.tsx` `PLANNER`: one value toward the desk
  (e.g. `mixHex(PLANNER, EMBER.desk, 0.4)`, L* ~53-55; its band and spine with it): dL* <= ~10 to the desk.
- **R2-5. MINOR. SQE + SQF off the DC's beats (22.68-36.98, 38.70-41.15), the window band left of the mountain: the calm
  data center is the heaviest mass at a squint, and its roof fans read as a row of dark dashes on the sky** (lane: window).
  Owner: "some supporting environment can be drawn a bit more subtle"; "too rough and messy". Measured: `check_depth.py`:
  the DC (+2) dE 19.5 from the air, not >= 3 closer than the town (+1, 18.3); at a squint the calm DC is the darkest mass
  through SQE (squint L* 37.7 at 23.5, 38.8 at 33.5) while the beat is in the street; `HallFansCalm`'s 7 boxes
  (EMBER.dcDark under the 0.35 haze: L* 32-33 against the body's 35-44 and the sky's 58, 14 px of sky between them, 19 px
  in the push) make 14 short dark marks per frame (outside.tsx's own note: "never a row of dark dashes on the sky").
  **Fix:** `outside.tsx` `H2Hall`, its calm state (s = 1): `HallFansCalm` as one continuous roof band in the hall's own
  value under one snow lid (no sky gaps), and `HALL_K` 0.35 -> ~0.55 (`HALLB_K` 0.5 -> ~0.65, still one step farther), so
  the calm body sits at ~L* 47-50, >= 3 dE closer to the air than the town; its beats (s = 0: 19.40-21.60, 36.98-38.70)
  unchanged.
