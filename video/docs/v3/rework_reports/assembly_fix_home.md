# v3 rework assembly, final round: the HOME fix lane (SQA, SQB*, SQC*, home_set.tsx), 2026-10-28

Status: DONE. Code: 7335bf9 (step 1), 3bfe2e7 (step 2); typecheck clean. Files: `scenes/home_set.tsx`,
`scenes/SQB_chart.tsx`, `scenes/SQB.tsx` (comments only). SQA, SQC and their files are unchanged (SQC draws the shared
set and card, so it shows the calm window and the band through J2, as SQB does).

Findings owned (`assembly_review_R1.md`, `_R2.md`, `_R3.md`): R1-2 = R3-2 (SQB's window strip and mullion vs the card,
6.45-10.3), R2-3 (SQB's invisible life: the skylight snow), R3-3 (SQB's turn 10.90-13.85 has no picture).
"Before" = the reviewed render `film_full.mp4` (be03dfa) and, for exact A/B stills, a worktree of 3bfe2e7 with these
three files at 4162d79. "After" = `sqb_v3.mp4`, frames 348-1040 (SQB + J2) rendered at 3bfe2e7.
Work folder (session scratch): `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/home/`
(`tools/`: R1's `beats.py` / `vid.py` with a film path and frame offset, `sal.py` / `sal2.py` (CRAFT §e salience in
R1's and R3's boxes), `accmap.py` (where the motion energy sits), `flakes.py` (flakes in the pane), `phonemotion.py`
(R3's phone-size motion); stills `before/`, `v1/`-`v3f/`; sheets `v3s/sheet.jpg`, `v3s/phone_turn.jpg`,
`v3s/skylight_seq.jpg`, `v3s/wood_1to1.png`, `v3s/beam_1to1.png`).

## Verdict per finding (before -> after; CRAFT §e at 540 wide, captions masked)
- **R1-2 / R3-2 FIXED.** The strip's share of the frame's top-3 % salience: R1's box (x 0-125) 24-34 % -> 1-4 % over
  6.5-9.7 and 0 % from 10.1 (R1's beats.py on the SQB render); R3's boxes (card / strip x 0-190 / phone) 5/43/30 ->
  15/3/54 at 6.6, 14/44/16 -> 25/4/28 at 7.5, 31/35/14 -> 41/2/25 at 8.5, 36/34/13 -> 48/2/23 at 9.0, 36/36/13 ->
  52/0/24 at 10.0, 76/16/6 -> 86/0/10 at 12.5. The card: 9-38 % -> 21-54 % over 6.5-9.7, 57-78 % -> 74-89 % from 10.1.
  The line's draw holds 61 / 71 / 68 / 59 % of the motion at 7.3 / 7.7 / 8.1 / 8.5 (before 47 / 52 / 48 / 51 %);
  noticeable supporting movers over the draw 2-7 -> 0-1. Not met over the line's last 0.4 s: 30-37 % at 8.9-9.1 (its
  ease-out, and Pip's look-up to the card 9.04-9.24 in the thread plane: REQUEST 1).
- **R2-3 FIXED (the phone-size test); density.py barely moves, by design of its mover floor.** The skylight's flakes
  4-7 px -> 10-14 px; flakes fully in the pane (`flakes.py`, >= 40 px): median 1 (0-2) -> 3 (2-5) over 10.9-13.85 and
  0 (0-1) -> 5 (4-5) over 13.85-15.95; at 1:1 and at 0.25 they read as snow drifting past the roof window
  (`v3s/skylight_seq.jpg`, `v3s/phone_turn.jpg`), and they take 0 % of the top-3 % salience. density.py --cozy SQB:
  movers 1.7 -> 1.6, empty 55 -> 53 %, cv 2.50 -> 2.52; main table ev/s 3.8 -> 4.5, gap 3.33 -> 2.67 s, static 58 ->
  64 %, run 0.53 -> 3.20 s. Why: its mover needs >= 400 px^2 changed in 0.2 s and >= 6 px thick (a 14 px flake at
  25 px/s changes ~140 px^2), so no calm snow can count; and the static run is the locked draw (6.45-9.65), where a
  9 px line growing reads as a static frame to the meter (the float's edge shifts had kept those frames "moving").
- **R3-3 FIXED.** At 11.80 "this past year" has its own picture: a soft band pops in over the past year with the dot's
  swell and stays as the stage where the line hooks up (13.85) and "+9.7%" lands (14.74); at phone size a pale stripe
  at the chart's end with the dot inside (`v3s/phone_turn.jpg`). The card holds 87-89 % of the top 3 % at 11.8-12.5
  (78 % before at 12.0).

## What was found while fixing
- **The strip's salience was the window's woodwork, not the houses.** At 8.0 its top-3 % pixels sat on the mullion
  column (x 40-80: 2,219 px) and the frame's right bar (x 110-150: 2,531 px); the houses held ~4 % of the frame's top
  3 %. The terracotta trim (L* 45, C* 40) on the dusk-blue glass (L* 45, C* 22) is a complementary colour edge at equal
  value; the latch was L* 25. So the frame (the same piece of wood, the same colour in SQA) takes the mullion's step:
  without it R3's strip box would have stayed ~25 %.
- **The freed salience then landed on the same terracotta in the attic's beams** (`EMBER.beam` = the trim): 31-36 % of
  the top 3 % over the draw at step 1; one step toward the slope takes them to 0 %.
- **SQB's measured motion was mostly the parallax float.** With the camera removed by ECC (R1's method), the float's
  residual was ~80 % of the motion energy over 7.3-8.6 (674-875 k with the float, 121 k locked), spread over every
  high-contrast edge, the card's own title and axes included; the line's draw alone ~68 k. A float at half speed
  (4-6 px/s) still left 485-507 k and the card at 53-58 %. CRAFT §b counts the camera's float in tier C's <= 10 % of
  the motion, and DIRECTION rule 8 rests the float on every map-critical frame: a chart being drawn is one.

## The fixes
1. **Strip settle (`home_set.tsx`, `STRIP_CALM` 6.20-6.65, `stripCalm`):** one smooth 0.45 s step right after J1's
   0.4 s, as the pan lands, so the strip is calm by SQB's first beat: `CalmWoodwork` redraws the frame, the mullion and
   the latch over the Nook's (same tier: k 0 is the Nook's colour) under one kit `Haze` step (k 0.5) toward the glass's
   dusk (`EMBER.sky`: a calm plum-brown, C* ~12), the latch 40 % toward the anchor (a soft value under the mullion,
   never near-black); the far roofs' caps one pale step toward the air (`EMBER.skyLow`, k 0.3), the houses' wall steps
   and haze, and the desk's two darks (mug, pen cup) on the same settle. The data center keeps `windowCalm` 6.35-6.95
   (it is in frame until ~6.33), and so does the thread plane's REST.
2. **Beams (`home_set.tsx`):** the Nook's diagonal beam (redrawn over) and the tie beam over the card wall one step
   toward the slope they lie on (`BEAM_CALM_K` 0.4: a softer warm brown), on the strip's settle.
3. **The float rests while the line draws (`homeCam`):** locked 6.45-9.30 (`SQB_FLOAT_FROM`), then eased in over 0.8 s
   (offset x smoothstep: no velocity step), home by J2 (15.95) as before.
4. **Skylight snow (`SkylightSnow`, `SKY_FLAKES`):** five scheduled flakes at the window's near-layer size (10-14 px),
   23-28 px/s with a +-5 px sway, the same snow colour on the tier; each slides in from under the pane's top edge and
   out behind its snow strip. Entries 9.0 / 9.51 / 10.04 / 12.18 / 12.67 (>= 0.47 s apart): none in view until the line
   has drawn, first at the pane's top at 9.6, 3 from ~11, 4-5 from 13.0 to 16.0, 4 into J2; none slides in on the
   band's pop (11.6-12.1) or inside J2's 0.4 s (16.2-17.0). (The finding's n ~14 would have put ~11 big flakes in the
   204 x 162 px pane once all had entered; 5 meets its own 3-5.)
5. **The past year's band (`SQB_chart.tsx` `YearBand`):** at `CHART_BEATS.pulse` (11.80) a soft band in a pale hero
   tint (the hero 72 % toward the card's paper: L* ~83, C* ~21; tier-B value, no outline, flat, soft top corners) pops
   in about its centre (0.3 -> 1, outBack 1.4, 0.18 s): from 2025 (over the "2025" label; the dot inside with room for
   its swell) to the hook's round end cap, ~51 px, the plot's full height, its foot just above the x axis.

## Checks
- SQA and J1 unchanged: 14 frames 0-6.19 s rendered with and without these changes (same renderer): 0 px differ.
- Seam probe (gate_check `--seam-comp Film3Seams`, at 3bfe2e7): PASS, J1 0.00 % / 0.00 %, J2 0.00 % / 0.00 %, J4 0.00 /
  0.02 %, J5 0.01 / 0.00 % of the pixels > 4 L*.
- check_light (light off/on pairs): OK at 8.0 and 12.5 (SQB: lighter 0.2 %, ambient 52 %, shadow shapes 12 %, as R2
  measured) and at 17.7 (SQC).
- Line (`retro_tools/line/measure.py`, band out): 12.5 strokes 104 -> 105 /Mpx, short 78 -> 78, dark px 1.14 -> 1.15 %;
  8.0 79 -> 94 / 58 -> 71 (the float's position and the calm woodwork's edges; inside R2's SQB range 101-146). At 3-4x
  the calm woodwork and beams have clean edges, no fringe (`v3s/wood_1to1.png`, `v3s/beam_1to1.png`).
- `npx tsc --noEmit -p video`: clean.

## REQUESTS
1. `thread_plane.tsx` (thread lane): Pip's look-up to the card `{t: 9.04, v: -0.95}` -> `{t: 9.32, ...}` (after the
   chart's line has drawn at 9.28), so the line keeps >= 60 % of the motion to its end (8.9-9.1: the line 30-37 %, Pip
   13-24 %, R1-2).
2. `thread_plane.tsx` (thread lane, optional): `restK` = home_set's `stripCalm` (6.20-6.65) instead of `windowCalm`
   (6.35-6.95), so the phone is at REST by SQB's first beat (6.5-6.9 it holds 30-38 % of the top 3 % and 43-71 % of
   the motion while it settles); flow_v2 §1's "6.35-6.95" with it.
3. `docs/v3/flow_v2.md` (spec owner): §3 the SQB float rests while the line draws (locked 6.45-9.30, eased in, home by
   15.95); the window's woodwork, the attic's beams, the houses and the desk's darks settle with the strip at
   6.20-6.65 (the data center keeps 6.35-6.95); the skylight snow is 5 scheduled 10-14 px flakes from 9.0 (first in
   view 9.6). §4 SQB: "11.80 the line's end dot pops once and the past year's soft band pops in with it (the hook's
   stage)".
4. `src/v3/film/kit/README.md` (kit owner): the `Snowfall` row's "home_set's skylight" example is gone (the skylight
   draws its own scheduled flakes, home_set `SKY_FLAKES`); `enterAt` has no user left.
