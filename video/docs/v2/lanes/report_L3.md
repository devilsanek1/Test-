# L3 report: V2S3 + V2S4 conform (2026-10-28)
1. Clip: `video/docs/v2/lanes/img/L3_S3S4_0.4.mp4` (Film2R 12.80-20.80 s, 0.4). Joins `img/L3_joins_0.4.jpg`; stills `img/L3_stills_0.4.jpg` (her far window 3/4 in at 16.0, whole at 19.9, clear of the plates, the tag and the band).
2. check_light: 13.5 OK (0.096 H from her window); 17.0 OK (0.089 H from her); 19.9 FAIL with her box alone (0.177 H: the brightest 5 % sits on the plates), OK (0.000 H) with her + the plates (both tier A at the hold, conform §2).
3. check_depth: 0 FAIL at 13.5 (v2_s3), 17.0 (v2_s4) and 19.9 (v2_s4_hold), 3 WARN each (far-plane steps, the busier backs, the plates' edges, texture gradients).
4. Line, caption zone masked: S3 13.5 strokes 80 / Mpx PASS (at the limit), dark-line 0.37 % PASS, near-miss ends 126 / Mpx FAIL (S8's Juliet-rail design on her window, the fenders' corners on the plum stripe). S4 17.0 strokes 73 PASS, dark-line 0.71 % PASS, near-miss 85 FAIL (the tag's lettering is 66 of it).
5. Banding PASS: S3 0,0,1080,595 at 13.5; S4 0,0,1080,280 at 17.0 and 19.9, and 322,604,424,730 at 19.9.
6. skyProblems [] (S3_SUNSET, S4_SKY); particleProblems [] (both fields); floatProblems [] (S3); `npx tsc --noEmit -p .` clean.
7. Joins: 12.95 / 12.98 / 13.00 her window and Pip on the same spot; L2's near lamp held (post x 1014-1045, arm exit y 657-678, #8F553F on both sides). 14.71 / 14.86 / 15.01 the dive lands on her plum and pulls out of her head (720, 912). 20.40 / 20.55 / 20.70 into SUN1, nothing on the disc.
8. Life: at most 3 noticeable movers in each shot; no stranger's back; walkers on screen from the cut. S4's cyclist is cut: every route crossed her or the plates.
9. Critic (`critic_L3.md`): 2 MUSTs, both fixed. The birds crossed SUN1 in the push-through: they now climb over it (y 522-548). Blank near-white render walls beside her: now a warm render with one recessed panel.
10. SHOULDs for the whole-film review: her far window 5 px from SUN1's limb (a tangent at phone size); the hull's dark band is the bottom third's heaviest mass; a walker crosses right behind her shoulder at 16.0; the pair is large at the left in the 14.92 pull-back; the birds now fly in the lower caption band.
11. The water stays isolated and unstyled (out of scope).

## REQUESTS
- L6: draw S8Window's stile from the transom down, with the fanlight undivided, to match S3 (in S8's design the full-height stile would cross her head at S3's push-through point).
- QA (measure.py / ends.py): mask in-world lettering (the tag, the plates) and dark-fill corners, or report them apart. S3 (126) and S4 (85) cannot reach 40 near-miss ends otherwise.
- QA (check_depth): sample thin A shapes at 1080 (the post's 15 px shaft); Hough's removal of level lines chops receding joints.
- Orchestrator (lib/water): the swap is one line each: the body of `S3Water` in `V2S3_water.tsx` (spec `S3_WATER`) and of `S4Water` in `V2S4_water.tsx` (spec `S4_WATER`, parts 'canal' / 'near'; the glints use `S4_WATER.glitter.on`).
- L2: keep `S2_NEAR_LAMP` and `PLANTER_WOOD` exported (S3 depends on them).
- Integrator (map.ts): move her far window 6+ px left, or make SUN1 r <= 60, to clear the 5 px near-tangent.
