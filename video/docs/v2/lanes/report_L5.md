# Report L5: K3 boards + V2S6 "The gate" + V2S7 "Google says" (conform to the G4 v4 look, 2026-10-28)

**Clip:** `video/deliverables/v2/lanes/v2r_L5_S6S7_0.4.mp4`: Film2R frames 1399-2008 (23.32-33.46), 0.4 scale, 60 fps,
with the voice. It covers the joins S5 -> S6 (23.62-23.98), S6 -> S7 (27.95-28.25) and S7 -> S8 (32.70-33.16) with
0.3 s round each. Frame-sampled: no pops outside the joins.
**Board B vs A:** `video/docs/v2/lanes/img/L5_board_B_vs_A.jpg`. Left: K3's default support tier. Right: tier subject in
S6 at 25.0, with one closed ~3 px outline in the frame's own deep plum (#342138; the stile is #36223A), drawn from the
first frame, keys at full contrast. No kit change was needed.
**Commits:** 14b57db, 46eaf56 ... ffc8668 (S6); a4d6b7a ... e1fcb2c, d3e47e5 (S7); the K3 colours commit (BBC_CALM);
3edcdf2 (the clip); this report.

## What changed
- **ONE eye-level camera per shot** (CRAFT §f "Two cameras").
  - S6: horizon 771, VP (540, 771), eye 1.6 m. It is the camera the gate's own far field implies: the door is 40 px/m.
  - S7: horizon 897, VP (540, 897), eye 1.6 m, f 1800.
  - The near planes are rebuilt at their camera's scale:
    - S6: a raised tulip bed with a flowering shrub, a park bench, and footpath joints running to the VP.
    - S7: a café table with cups and a folded paper, chairs and a coat, and a planter of grasses.
  - conform_L5 §7's "VP (540, 560)" and "S6 facade +1" are superseded by the one-camera rule. By S6's camera the facade
    is the farthest plane, +3.
- **Sky** (`skies.ts`): S6_MORNING and S7_SUNSET use lib/sky. Each puts its light band at the sun and a low warmth round
  the disc, so the sun sits in sky that agrees with it (this was the critic's MUST 1). Air: S6 #F6D9BC, S7 #F3C6A6.
- **Light**: RIG_APRIL in S6 and RIG_CANAL in S7.
  - Contact and cast shadows for the boards (`shadow={false}` plus the rig), Pip, people and furniture.
  - A Shade on planes turned from the sun.
  - S7's festoons are SourceCore in three switch-ons at f1812 / 1836 / 1848.
- **Tiers**: each board is A for its whole shot; Pip and the door staff are B; everything else is C.
  - Gone: the readers, the café's backs, every stranger's back near the lens, the pigeons, the birds, the gardener,
    and the hand-drawn specks.
- **Clocks**:
  - S6 is `<TimeShift by={T0 - S6_START}>`: the purpose line and clack land at 24.03, F12 at 26.467 (f1588).
  - S6's windows switch on in three groups: 27.100 / 27.450 / 27.833.
  - S7 local time is film − 28.10. GOOGLE SAYS and its clack land at 28.33. "AI principles" completes by 30.02 and "of
    any kind" by 32.06.
- **Pip**:
  - S6: seated at (360, 1410) from the first frame, with one ear flick at 26.50.
  - S7: seated on the bollard, NO reaction (V14), unmoved until the bow covers it at ~32.85.
  - The S6 -> S7 hop is retired.
- **Float** (lib/depth): one gentle parallax float per shot, in planes −1 to +3. The sky and captions never move.
  - S6: 24.30-26.40.
  - S7: 30.20-32.50.
- **Particles**:
  - S6's petals are its own weather: ≤ 7 at once, 24-34 px, crossing the open paving.
  - S7: rust leaves, 26-38 px, over the pale paving (this was the critic's MUST 2), plus motes (far ≤ 9 px, near
    ≤ 13.8 px).
- **Water**: S7's basin is the isolated `S7BasinWater` (V2S7_water.tsx, `S7_WATER`). Swapping in lib/water is one line.
- **K3**: `colors` override. ToldTheBBCBoard now defaults to BBC_CALM (L2's request): frame L* ~42 in plum/line, face
  limestone L* 91, lettering ink. The deal, Google and her boards are unchanged (A5). README: board shadows come from
  the scene's rig.

## Checks (all at full size; the S7 logs are in L5's scratch `s7/final/numbers.md`)
| check | S6 (25.0; 27.5) | S7 (29.0 / 31.0; 31.5) |
|---|---|---|
| tsc / skyProblems / floatProblems | 0 / [] (khaki C* 5.8) / [] (peak 8.5 px/s) | 0 / [] (khaki 5.7) / [] |
| check_depth (sheets v2_s6, v2_s7) | 0 FAIL, 2 WARN. Air ladder 15.0 / 11.4 / 7.4, board 20.5. Board edge dL* 54 / 43. WARN: Pip 9.4. | PASS, 0 WARN. Ladder 3.6 / 7.6 / 11.3 / 14.6, board 20.4. Board 57, Pip 20. Sizes k −0.3 to +1.4 % |
| check_light (A/B) | OK 25.0, OK 27.5. Brightest 5 % 0.000 H from the board, greyed 45 / 22 px | OK 29.0, OK 31.5. 0.000 H, greyed 196 / 292 px |
| check_banding (open sky) | PASS x3 | PASS x4 regions, band dL* 0.03 |
| line (lettering blanked) | strokes 41 / Mpx, near-miss 26, dark 1.0 % | strokes 35, near-miss **49** (budget 40), dark 0.52 % |
| particles (phone test, 360 px) | petals seen at 25.3 / 26.0 / 27.0: 6 / 5 / 7 | every leaf pointable at 30.7 / 31.5 / 32.3: 2 / 2 / 2 |
| flashes / movers | 3 window groups in 0.73 s / ≤ 3 (staff, one jogger, petals) | 3 festoon groups in 0.6 s / ≤ 2 people |
| Pip / clause gap | Pip's top at 1312, the clause's foot at ≤ 1108: 204 px | unmoved to 32.83 |
| joins | 23.90 board clear; 23.98 up; 24.03 the pop; 27.95 at rest; 28.05 diving into SUN2 | 28.10 SUN2 whole on warm sky with the board's rail; 28.25 and 32.70 at rest; nothing new 32.50-33.10 |

**Critic:** one pass on S7 found two MUSTs, both fixed: the sun in mint sky, and leaves that couldn't be seen. The
builder also found and fixed the staff popping at the doors at 29.05 (d3e47e5).
**Open:** S7's near-miss ends are 49 / Mpx against 40. About 26 / Mpx of that comes from K3's corner notches, screws,
handle slot and legs, plus Pip.

## REQUESTS
1. **map.ts (integrator):** L2's optional "the board ~40 px lower" needs `S2.aBoard` moved; K3's `S2_LEGS_Y1` follows it.
2. **K3 face: LANDED** (the orchestrator's call, 10:38). Every board now has a closed keyline, screw heads without
   slots, and no handle slot; everything else is identical. Stills: S2 11.0, S6 25.0, S7 31.0, S8 36.0, all OK. Line
   delta (lettering blanked) S6 / S7: strokes 41 -> 40 / 35 -> 33, near-miss ends 26 -> 24 / 44 -> 43, dark-line
   1.0 -> 0.96 % / 0.42 -> 0.39 %. So the gain is ~1-2 / Mpx, not the ~15 estimated, and S7 stays over 40.
3. **Tools:**
   - check_light: take a gradient sky (today only `--exclude` rectangles).
   - lib/particles: lint a leaf's on-screen entrance against the joins.
   - cast kit: a lines-off option for people under a forced environment tier.
