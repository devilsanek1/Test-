# v3 rework assembly, final round: the HOME fix lane (SQA, SQB*, SQC*, home_set.tsx), 2026-10-28

Status: IN PROGRESS (written as it goes). Code: 7335bf9 (step 1), 3bfe2e7 (step 2); the final checks on a full SQB
render are next.

Findings owned (from `assembly_review_R1.md`, `_R2.md`, `_R3.md`): R1-2 = R3-2 (SQB's window strip and mullion vs the
card, 6.45-10.3), R2-3 (SQB's invisible life: the skylight snow), R3-3 (SQB's turn 10.90-13.85 has no picture).
"Before" = the reviewed render `film_full.mp4` (code be03dfa; v3 source unchanged at 381e3c0).
Work folder: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/home/`
(stills `before/`, `v1/`, `v2/`; measuring tools `tools/`: R1's `beats.py` / `vid.py` with a film path and frame
offset, `sal.py` (CRAFT §e salience in R1's and R3's boxes), `accmap.py` (where the motion energy sits)).

## What was found while fixing (numbers on full-size renders, CRAFT §e, captions masked)
- **The strip's salience is the window's woodwork, not the houses.** At 8.0 the strip's top-3 % pixels sit on the
  mullion column (x 40-80: 2,219 px) and the frame's right bar (x 110-150: 2,531 px); the houses left and right of the
  mullion hold ~4 % of the frame's top 3 %. Cause: the terracotta trim (L* 45, C* 40) on the dusk-blue glass (L* 45,
  C* 22) is a complementary colour edge at equal value; the latch is L* 25 (near-black). So the frame (the same piece of
  wood, the same colour in SQA) takes the mullion's step: without it R3's strip box (x 0-190) would stay ~25 %.
- **SQB's measured motion is mostly the parallax float.** With the camera removed by ECC (R1's method) the float's
  residual is ~80 % of the frame's motion energy over 7.3-8.6 (674-875 k with the float, 121 k with the room locked),
  spread over every high-contrast edge: the card's own title and axes, the skylight's pane, the beams, the strip. The
  line's draw alone is ~68 k. A float at half speed (4-6 px/s) still left 485-507 k and the card at 53-58 %; with the
  room locked the line leads (card 56-68 %, the rest: Pip's idle 7-12 %, the phone's hand float and the tag's sway
  7-21 %, the strip's snow 7-9 %). DIRECTION rule 8: the float rests on every map-critical frame; a chart being drawn
  is one.

## Fixes (step 1, 7335bf9)
1. **R1-2 / R3-2, `home_set.tsx`:** in the same 6.35-6.95 settle (`windowCalm`; SQA untouched), `CalmWoodwork` redraws
   the frame, the mullion and the latch over the Nook's (same tier, so k 0 is the Nook's colour) under one kit `Haze`
   step (k 0.5) toward the glass's dusk (`EMBER.sky`): a calm plum-brown, C* ~12; the latch one soft value under it
   (40 % toward the anchor, never the anchor). The far roofs' snow caps one pale step toward the air (`EMBER.skyLow`,
   k 0.3); the lit panes keep the far-snow haze (toward the blue they grey).
2. **R1-2's motion target, `home_set.tsx` `homeCam`:** the SQB float rests while the line draws (locked 6.45-9.30,
   `SQB_FLOAT_FROM`), then eases in over 0.8 s (offset x smoothstep, no velocity step) and is home by J2 as before.
3. **R2-3, `home_set.tsx` `SkylightSnow`:** five scheduled flakes (`SKY_FLAKES`) at the window's near-layer size
   (diameter 10-14 px), 23-32 px/s with a +-5 px sway, the same snow colour on the tier; each slides in from under the
   pane's top edge and out behind its snow strip. Simulated count in the pane: 0 until 8.9, 1-2 to 9.6, 3 from 9.8,
   4-5 through 11.0-14.2, 3-4 to J2; no flake shows at the pane's top inside J2's 0.4 s (16.2-17.0). (The finding's
   n ~14 would have put ~11 big flakes in the 204 x 162 px pane once all had entered; 5 meets its own target of 3-5.)
4. **R3-3, `SQB_chart.tsx` `YearBand`:** at `CHART_BEATS.pulse` (11.80) a soft band in a pale hero tint (the hero 72 %
   toward the card's paper: L* ~83, C* ~21, tier-B value, no outline, flat, soft top corners) pops in about its centre
   (0.3 -> 1, outBack, 0.18 s) with the dot's swell in the same frame: x from 2025 (over the "2025" label) to the hook's
   end cap (~51 px), the plot's full height, its foot just above the x axis. It stays: the hook rises inside it (13.85)
   and "+9.7%" lands over it (14.74); SQC draws the same card through J2.

## Step 2 (3bfe2e7), after measuring step 1 on a full SQB render (`sqb_v2.mp4`, R1's beats.py)
- Step 1 took the strip to 0-2 % from 6.9 on, but 11 % at 6.5 (windowCalm's settle was only 16 % done) and the
  freed top-3 % landed on the next terracotta line: the attic's beams (the slope's diagonal beam and the tie beam over
  the card wall, `EMBER.beam` = the trim) held 31-36 % over the line's draw (8.1, 9.7). The motion: the line led
  61-72 % at 7.3-8.5 with the room locked; 31 % at 8.9 (the line's slow end, Pip's look-up 9.02-9.42 and the first
  flake at 8.88).
- So: ONE strip settle, `STRIP_CALM` 6.20-6.65 (right after J1's 0.4 s, as the pan lands): the woodwork, the houses'
  steps and caps, the desk's two darks; the data center keeps windowCalm (it is in frame until ~6.33). The beams one
  step toward the slope they lie on (`BEAM_CALM_K` 0.4: a softer warm brown; the Nook's diagonal beam redrawn over,
  the tie beam's own fill). The flakes rescheduled to start after the line has drawn (entries 9.0 / 9.51 / 10.04 /
  12.18 / 12.67: first at the pane's top at 9.6; 1 to 10.3, 2 to 10.7, 3 from 10.8, 4-5 from 13.0 to 16.0, 4 to J2;
  entries >= 0.47 s apart; none on the band's pop or inside J2's 0.4 s).
- Stills (CRAFT §e top-3 %, independent boxes): strip (x 0-125 / 0-190) 6.7 / 6.7 % at 6.5, 2.2 at 6.6, 2.9-3.6 at
  7.5, 2.1-2.5 at 8.1, 0.6 at 9.7, 0 at 12.5; the beams 0 %; the card 12 / 17 / 27 / 37 / 54 / 89 % at 6.5 / 6.6 /
  7.5 / 8.1 / 9.7 / 12.5 (before 9-11 / 5 / 14-15 / 27 / 38 / 77); the phone 55-61 % at 6.5-6.6 (the thread plane's
  REST settle, windowCalm 6.35-6.95, not yet done), 24-29 % over the draw.

## Results
(the final checks on the full SQB render are next)

## REQUESTS
(collected at the end)
