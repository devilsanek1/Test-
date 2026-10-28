# v3 rework, final lanes: the three lane reports (2026-10-28)

The final pass's fix lanes (workflow `context/workflows/v3-final-lanes-wf_8fd70ab8-895.js`, max effort), each on its own files, after the
early review E1-E15 and the OPEN items (`OPEN.md`). The SHARED lane (thread_plane, home_set, PriceTag, captions) reported in `shared_layer.md`;
the cross-lane pre-pass in `cross_prepass.md`. Verbatim reports:

## REVEAL (SQD)

I fixed E7, OPEN 3 and SQD's half of E6. E5 is only partly fixed: the mountain now reads as memory sticks, but by the numbers our street still takes the eye on "By the mountain". All commits are pushed (8693cee, 72c2a47, 4d8f208, eccd681), in `/home/user/Test-/video/src/v3/film/scenes/SQD.tsx`, `/home/user/Test-/video/src/v3/film/scenes/SQD_peak.tsx` and flow_v2 §4-§7.

**Fixed:**
- **E7:** the stick now rests on two sticks at its own angle, with no sky under it at any zoom. Its shadow lands only on the pile. Its rim follows the real notched outline and is drawn over the stick (before, only the stray edge at the notch showed).
- **E5:** the neighbours use the stick's gold one step darker, with pins and brown chips (declared in flow_v2 as the reveal's exception to the C-tier contrast limit). The chips fade as the sticks get small, the lower pile is flat, the right flank is in shade, and the mountain gets a rim while "By the mountain" plays.
- **E6:** the captions turn white on the frame the stick clears the line (frame 1166; before, they were dark on navy from 19.43 to 19.62). J3's light change is declared.
- **OPEN 3:** SQD's own birds are gone; one flock rises from behind the mountain.
- **OPEN 5:** peak speeds are 42 px/f (the DC entering), 22 (town), 30 (street), with no strobe in frame overlays; left as is.
- **OPEN 11:** note only.
- Also: SQD now passes its plane cameras to outside.tsx, so the snow stays out of the caption band.

**Checks, before → after:**
- **TypeScript:** 0 errors with the project's tsc; the repo-root tsc 6.0.2 shows 196 old lib-target errors (190 at start), none in SQD.
- **check_light:** 19.70 FAIL → OK; 19.55, 20.0 and 20.4 OK. 20.8 and 21.9 still FAIL because full-white snow in the town, street and sill is the brightest thing outside.
- **Joins:** J3 carry 0.44 → 0.45, eye jump 0.029 → 0.022, colour shift 19.7 → 21.9 (declared). J4 0.54 / 0.087 / 12.2. All four seams 0.0000 %; gate_check on SQD passes.
- **Lines:** strokes / short strokes per Mpx at 21.9: 215/196 → 105/98, still over the 80/25 budget.
- **Density:** detail 30 → 22 %, right on the meter's "too empty" warning line, partly by design (calmer pile) and partly from the window lane's calmer far field.

**Open:**
- **E5's street half:** at 21.9 the street holds 88 % of the most salient pixels and the mountain 10 % (it was 58 % street before, but the town and DC have since gone quiet). The window lane's calm in `outside.tsx` covers only the pool, gate, trucks and notice. I had my own whole-street calm, which cut the street to 4 %, but dropped it: switching it off before J4 read as a cut. Fix: `outside.tsx` should calm the whole street plane (wall, house, booth, blank notice, bench and bollards) until 23.10.
- Snow should drop from L* 93 to 87-89 per CRAFT (`outside.tsx`, `h2_window.tsx`) to clear the two light FAILs.
- The summit stick stays at 25.9 px; 30 px needs `H2_SUMMIT` in `outside.tsx` and `K0` in SQD_rig changed together.
- SQC's rim has the same side-notch fault E7 had; it can use the new `stickOutlineD` from SQD_peak.

**REQUESTS:**
- `home_set.tsx`: `HomeDataCenter` tier `'support'` from ~4.6 s, sign panel and letters within dL* 15 of the facade (E8), so J3's push-out stops sweeping big dark letters through the captions.

## WINDOW (SQE + SQF, outside, h2_window)

The window lane is done and pushed (last commit 461de0c). Every assigned item is fixed and re-checked; whole-frame light and the clean-pen budgets are still open. One deviation: I touched three files outside my list — `kit/Fleet.tsx` (only my scenes import it), `flow_v2.md` and the kit README (to keep the spec in step with the build).

1. **Fixed: E1, OPEN 1, OPEN 2.** H2Scene now draws the real ThreadPlane, lit by h2_window's lamp. The crate lands on `threadAt(T).listingScreen` and the tag ticks at 30.28. `SQE_front.tsx` is deleted.
2. **Fixed: E4, OPEN 6.** The x1.35 push is held from 25.7 to 36.36, centred at (680, 1120), and releases 36.36–36.98. The queue was re-laid inside the pushed frame. The crate grows to 120 px mid-arc and shrinks into the lit screen. Truck B now leaves left behind the phone, because climbing the road would cross the wall during the push.
3. **Fixed: E3, E9, E11, E14, E15, E5 street side.**
   - The data center is calm and hazed off its beats, with soft row bands and no blinking.
   - At 36.98 its sign lights on top and the rows light one per syllable; the notice blanks in the same frame.
   - The town, the wall and the factory are calmer; waiting trucks sit back.
   - The gate pool is warmer, with a spill from the gate and a pool under the road lamp.
   - The steam is gold; SQF's captions turn dark at the loop roll; the street stays calm until 23.10.
   - New kit file `kit/Haze.tsx` (a flat colour step, no blur).
4. **Also fixed: OPEN 3, 5, 8, plus a loop fix.** OPEN 3: one flock of birds (REVEAL dropped theirs). OPEN 5: street side checked, no strobe, not softened. OPEN 8: SQF kept calm. The loop now carries the plane back to its frame-0 spot so the tag lands as $999.
5. **Typecheck:** 0 errors with the project's TypeScript 5.9. Running `npx tsc` from the repo root picks up TypeScript 6.0 and reports 190 old library errors, none in my files.
6. **Window band (y 600–1000):** local contrast 9.3–11.9 → 4.8–7.3; data center 19–22 → 6.6–8.0 off its beats.
7. **Lines per Mpx:** strokes 195–258 → 86–136, short strokes 171–231 → 74–124, near-miss ends 420–794 → 170–529. Still over the 80/25/40 budget, mostly from text.
8. **Attention:**
   - The subject holds 60–97 % of the motion at 10 of 11 beats.
   - The data center's beat reaches only 52 %, because the same-frame step-downs count against it.
   - Top salience: data center 0 → 48 %, notice 6 → 43 %, BETTER van 1 → 29 %.
9. **check_light:** 12 of 15 frames pass; warm-lit 4.8–7 % → 7.6–16 %. The brightest-5 % test fails at 32.2, 33.5 and 37.2 (0.24–0.26 H) because the phone screen and desk pool hold it; measured on the street view alone it passes (0.03–0.08 H).
10. **density.py (SQE/SQF):** static 20/48 % → 24/31 %; detail 36/35 % → 27/25 % (the dash rows are gone); frames with no mover rise to 23 % in SQF because the sign beat is deliberately quiet. Seams: J4 0.04 % / 0.00 %, J5 0.00 % / 0.00 %, pass.
11. **Open:** the whole-frame brightest-5 % at those three beats, the line budgets, and SQF's quiet stretch. The SHARED lane has claimed E10 and the like-pop. Scratch: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final/window/`.
12. **REQUESTS (four files):**
    - `thread_plane.tsx`: draw the 39.88 like-pop (E1).
    - `thread_plane.tsx`: add a rim window for 38.62–41.15 and a FormShade on the tag's right third at PAYOFF (E10).
    - `kit/PriceTag.tsx`: give the back's DataCenter `ledStyle="bands"` and `blink={false}` (E10).
    - `thread_plane.tsx`: dim the off-beat screen one more step, to L* ~82, so H2's street beats pass the brightest-5 % test.

## HOME (SQB + SQC)

Fixed: OPEN 12, the SQB chart's attention order, and the SQC stick's rim. Added the teacup steam for E12 on SQB's side. E8 and E13 live in home_set and the shared lane has done them, so I only verified them. Three commits, all pushed: 214189f, 8aef265, 4ca03bd.
1. **OPEN 12** (SQB_chart.tsx): the doodle laptops are now drawn plain (no trackpad, glint or key specks) with one big price per screen. "$999" goes from 25/29 to 38/42 px and "BETTER" from 23 to 32 px. That is the most the card holds: it stays 8 px under the subtitle and 11 px left of "+9.7%". Phone look checked.
2. **One subject at a time** (SQB_chart.tsx): the doodles drop to tier B (soft, no outline, pale screens) in the same frame "+9.7%" pops (14.74). At 14.95 the label and hook hold 29% → 39% of the frame's most salient pixels (top 3%) and the doodles 40% → 4%. The card holds 55% → 76% at 12.5. I first tried the step at "But" (11.80), but the card fell to 10% and the window strip and mug took over, so I moved it.
3. **SQC rim** (SQC_stick.tsx): the stick's warm rim now follows its real notched outline, inside its 3 px line. Before, it was a plain rectangle that crossed the side notch and covered the outline.
4. **E12**: SQB.tsx adds a soft steam wisp over the teacup, next to the shared lane's new corner (string lights, skylight snow, teacup, pencil). **E8 verified**: window contrast 13.2 → 5.5 at 17.8 and 14.8 → 6.7 at 18.88, about 2.3x below the listing and the stick. **E13 verified** (231b2cc). **OPEN 10**: the shared lane built it, so no request is needed.
5. **Light and types**: `tsc` 196 errors before and after, all pre-existing, none in SQB/SQC. `check_light` 6/6 OK (SQB 8.6/10.95/12.5/15.8, SQC 17.8/18.88); the brightest 5% sits 0.00–0.15 H from the subject.
6. **Seams and joins**: seam probe J1 0.00/0.00%, J2 0.00/0.00%. Joins (carry / eye jump / colour shift): J1 0.88/0.053/11.9; J2 0.85/0.047/10.9 → 0.87/0.063/10.2; J3 0.44/0.034/21.3 (the declared light change).
7. **Tiers**: the subject's share of motion in SQB bursts is 96/98/90/78/86/99% → 97/97/91/82/89/99%, and 86% for the SQC lift; at most 1 noticeable supporter. Line budget per Mpx (strokes / short / ends): SQB 15.8 139/110/263 → 134/102/252, SQC 18.88 180/152/368 → 164/144/339. Dark-line and lined-edge shares are within budget; stroke counts stay over 80 because of text, as in the SQA pilot.
8. **Density**: SQB flat 39 → 38%, objects 88 → 91, detail 18 → 19% (still FAR); share of frames with no mover 63 → 64%. The new life is too small for the meter to count.
9. **Open**: flow_v2 §4 still places the first doodle at ~2017 (it sits at ~2010) and doesn't list the 14.74 step-back; that doc is the orchestrator's. The tag stays full beside the held stick until 18.90 (33% vs 68% salience); I left it as the tug's beat. Evidence is in /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final/home/final2/.
10. REQUESTS:
11. home_set.tsx: homeCam floats the room and the window view together as one flat card in SQB; make it a parallax float (DIRECTION rule 8): `far` = 0.25 × (fx, fy), `room` keeps (fx, fy), back home by 15.95.
12. home_set.tsx: from 6.35, one light Haze step (k ~0.25 toward EMBER.wall) on the mug (its near-black coffee, L* ~27) and the pen cup; in SQB they hold 15–20% of the most salient pixels at 12.5 and 14.95.
13. home_set.tsx: export TEACUP; SQB.tsx's steam copies its position (x 1736, y 1772, w 96).
