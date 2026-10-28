# Critic L6: V2S8 "Her words" + the loop seam (round k1, HEAD 71ed960, 2026-10-28)

## CHECKS (checks.sh k1 + the lints; stills and the 0.4 clip in the session scratch `checks/k1/`)
- check_light 34.0 (her): **FAIL**: brightest 5 % (L* >= 95.2) centred (201, 968), 0.190 H from her (<= 0.15): it sits on the board's cream face at the left edge. Shadows OK (greyed 326 px, 0 under L* 35), band dL* 0.
- check_light 36.0 (board): OK, 0.000 H; greyed 375 px; band 0. 38.0 (board): OK, 0.000 H; greyed 155 px.
- check_light 38.0 (W box): FAIL, 0.224 H; expected: the board, also A at 38.0, holds the light. All four: "light shapes 0": the pools and the spill are painted by the set in both passes, so the A/B cannot see them. By eye (36.0 vs 38.0): the near pool +4.7 L*; the pool at the lamp right of W: ring 93 / core 96 on L* 76 paving (+17 / +20).
- Light-shape line: shares at 38.0: lighter 0.4 %, one step down 8.3 %, shadow shapes 6.6 %, warm-lit 29.9 %.
- Line @36.0 as scripted (caption band IN): strokes 101 / Mpx, short 82, dark-line 1.44 %, near-miss end pairs 183. Band out + board lettering and stamp blanked (the fair number): strokes **74 OK** (<= 80), short **60** (> 25; S1 v4 48-50), dark-line **0.98 % OK**, near-miss **118 / Mpx** (> 40; clusters: the café owner + squeegee joints, the ghosts' outlines, Pip's outline, the board's inner-border corners, the café awning).
- check_depth 34.0: 0 FAIL / 4 WARN: +1 busier than the subject plane (fill contrast 7.5, 1.29x), +2 busier (6.6, 1.15x), the farthest plane's contrast 1.08x the subject's (<= 0.5x), ground texture no finer far (1.5 vs 2.1 /100 px). OK: her silhouette median |dL*| 30.9 (16 % one value), subject -> +1 dE 12.7; ground 30 % level / 56 % to the VP.
- check_depth 38.0: 0 FAIL / 3 WARN: the farthest plane's contrast 0.75x; W's silhouette median |dL*| 8.4, 49 % one value (lined 100 %); ground texture. OK: the board 72.9; subject -> +1 dE 14.5; ground 46 % level / 38 % to the VP.
- check_banding (scripted): 34.0 top PASS, y 600-640 FAIL (4 visible, 1 strong); 38.0 top PASS, y 600-640 WARN (1). That strip holds the sun disc and the roof / lantern tops. Open sky only (y 250-540 and y 540-598 either side of the disc, both stills): **PASS x6**.
- Switch-ons 37.10-38.20: detector 2237, 2261, 2262, 2280 (max 4 in 1 s). 2262 = W's A-outline pop + Pip's look-up (not a lamp); 2280 = the render stamp's digits. Lamps: 2237 / 2261 / 2273 (the lint: 37.283 / 37.683 / 37.883 = the sound lane's frames): 3 in 0.6 s, **OK**.
- Lints: skyProblems [] (air #FBC09C) · particleProblems: 1 note (s8leaves: 1 of 3 leaves cannot clear the avoid zones, shrinks out 2.9 s after birth, "fine past the shot's end") · floatProblems [] (peak 9.37 px/s, max 6.71 px) · tsc exit 0.
- Seam geometry: W centre (859, 700) in S8 vs (859, 698) at frame 0, the window 150 px wide in both (S8's +14 px a side is the balcony rail) OK · Pip (700, 1190) vs S1 (705-712, 1165): <= 30 px OK, absent 2342 to film 6 (the designed un-build / draw-on) · suns: S8's gone by 2332, S1's from film 2: never two, OK.

## REVIEW: in progress
