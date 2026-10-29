# The look test's "before" row: v2's S1 as shipped (STUDY.md §10, build item 1)

*2026-10-29. The study's five measuring scripts on v2's own S1 at 1.0, 3.0 and 5.2 s (the cover frame), run exactly as
the study ran them on v2. These are the numbers the "after" (pass 1, pass 2) must beat; the targets are the study's.*

**Frames:** rendered from the shipped code (lossless PNG, 1080 x 1920), not pulled from the H.264 master:
`GL=angle node scripts/render-frames.mjs Film2R-V2S1 <dir> 1.0,3.0,5.2 --entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`
(frames 60, 180, 312). They are the shipped S1: against the study's master frames the mean difference is 1.9 of 255
(H.264), 99 % of pixels within 11. **Run it again for the after:** `python3 -I scripts/look/posters/look_test_row.py
--label after --frames t1.png t3.png t5.png --sheets <the scene's three depth sheets> --out <json>` (from `video/`; the
runner only calls the five scripts' own code with their v2 settings: band y 290-600 out, phone scale, the S1 boxes;
`--boxes` and `--subject` take the new scene's boxes). All numbers: `before_row.json`.

**Depth sheets:** 3.0 s `scripts/qa/depth_sheets/v2_s1_t3.0.json` (lane L1's); 1.0 s `v2_s1_t1.0.json` and 5.2 s
`v2_s1_t5.2.json` (new: L1's sheets with her and the copies' row as fixed-seed GrabCut boxes where they stand at 1.0 and
5.2 s; v2_s1.json's polygons were baked at 5.4 s).

| | 1.0 s | 3.0 s | 5.2 s (cover) | the after's target (source) |
|---|---|---|---|---|
| **Value** (`pro_4_colour.py`, `pro_1_depth.py`) | | | | |
| L* p5 | 59.4 | 59.2 | 55.4 | <= 32 (P4 §3.1, STUDY §5.5) |
| under L* 40, % of the frame | 1.6 | 1.6 | 1.8 | 6-10 (decision 2b, owner-approved) |
| dark parts (>= 4 px at 540) | 19 | 25 | 65 | >= 120 (P4 §3.1) |
| grid cells holding darks /16 | 4 | 6 | 6 | >= 9 (P4 §3.1) |
| L* < 65, % | 9.6 | 10.1 | 10.9 | >= 25 (P1 §3.1) |
| L* 65-80, % | 31.1 | 30.7 | 30.6 | <= 20 (P1 §3.1) |
| bottom quarter L* p50 (the near group) | 78.4 | 78.4 | 78.4 | 45-60 (P1 §3.1; PE L1: nearest plane <= 60) |
| **Depth** (`check_depth.py`) | | | | |
| near treads L* (plane -2) | 75.3 | 75.4 | 75.4 | 5-14 under the subject's plane, 45-60 (CRAFT §f.2, P1 §3.1) |
| the wing (the subject's plane) L* | 74.6 | 73.7 | 73.9 | the near group 5-14 darker than this |
| the air L* (S1_AIR #FDD6B8) | 88.0 | 88.0 | 88.0 | - |
| near-to-air span, L* | 12.7 | 12.6 | 12.6 | >= 30 (P1 §3.1) |
| FAIL / WARN | 0 / 4 | 0 / 5 | 0 / 4 | 0 FAIL; the ladder, the subject step (dE 8.0-9.5, target >= 12) and the far edges (0.93-0.98x, target <= 0.5x) WARN today |
| **Colour** (`pro_4_colour.py`) | | | | |
| pastel (L* >= 75, C* >= 10), % | 56.8 | 57.4 | 57.5 | <= 25 (P4 §3.2b) |
| C* p50 / p90 (p90 / p50) | 14.0 / 27.4 (1.96) | 14.0 / 27.4 (1.96) | 14.0 / 27.4 (1.96) | p90 / p50 >= 2.5 (P4 §3.2e) |
| C*-weighted mean L* | 77.0 | 77.0 | 76.9 | <= 68 (P4 §3.2c) |
| accents C* >= 35: % / parts | 4.6 / 50 | 4.8 / 47 | 5.1 / 48 | 2-6 % in >= 25 parts, none over 1.5 %, none static in the top third (P4 §3.2e) |
| edge-free fields >= 2 % below the sky, % of the frame | 15.2 | 15.2 | 15.0 | 0: no field over 2 % (P4 §3.5) |
| mottle inside fields, std L* | 0.24 | 0.24 | 0.24 | 0.3-0.6 with the texture on (P4 §3.6 #5) |
| colours covering 90 % / holding >= 0.5 % | 17 / 22 | 18 / 23 | 19 / 27 | >= 20 / >= 25 (P4 §3.3c) |
| **Detail** (`details.py measure`) | | | | |
| edge pixels, % | 4.9 | 4.9 | 5.2 | posters' median 10.1 |
| busy / structure tiles, % | 29.1 / 26.9 | 29.3 / 28.5 | 30.8 / 25.7 | busy >= 35, structure <= 12 (DE) |
| median edge step, L* | 10.8 | 11.1 | 12.5 | 12-18 (posters 14.5) |
| **Finish** (`pro_2_hierarchy.py`, the S1 boxes) | | | | |
| A (her + the door): small features, % of its area | 12.3 | 12.8 | 11.3 | 6-12, >= 3x C near's (P2 §3.1, §3.3) |
| C near (the props, y 1300-1900): shapes per 10,000 px | 4.2 | 3.9 | 3.6 | 11-25 (P2 §3.1; posters 14.5) |
| C near local contrast | 3.0 | 3.0 | 3.0 | ~9 if still (decision 3a), <= 7 if it moves (P2 §3.5) |
| C far (the far city): shapes per 10,000 px | 12.2 | 9.6 | 10.5 | 2-15 (P2 §3.1) |
| **Composition** (`composition.py frame`, subject [470, 780, 740, 1090]) | | | | |
| open sky, % | 34.1 | 33.9 | 34.3 | posters 36-53 (median 44) (CO §1) |
| calm below the skyline, % | 23.9 | 23.5 | 23.1 | <= 5 (STUDY §7; posters 1-3) |
| bottom corners BL / BR, L* | 66.7 / 69.6 | 66.7 / 69.6 | 66.7 / 69.6 | dark (posters 44 / 53) (CO §1) |
| the subject: area / salience share, % | 4.6 / 9.3 | 4.6 / 10.1 | 4.6 / 9.8 | the peak on A (CRAFT §b); place-led 8-15 % of the frame (CO L2) |

**Read:** the study's diagnosis holds on the shipped code. The frame lives in the light half (p5 55-59; 1.6-1.8 % dark in
19-65 pieces; 10-11 % under L* 65 and 31 % in the in-between band), the near group is LIGHTER than the subject's plane
(75 vs 74, 12.6 L* from the air), the lights carry a pastel tint (57 %), 15 % of the frame is edge-free fields below
the sky (the paving and the canal), the near props hold 3.6-4.2 shapes per 10,000 px (the posters' near patchwork 14.5),
and 23 % of the frame below the skyline is calm (posters 1-3 %). These agree with the study's master-frame numbers
(P4 §4: p5 55-59, darks 1.7-2.0 % in 16-64 pieces, pastel 56-57 %; P1 §4: treads 75.0 vs the wing 73.2 at 3.0 s;
P2: the quay at 3.2 shapes; ST: mottle 0.24).
