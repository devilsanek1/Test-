# Dead-frame report: ref2

Source `/home/user/Test-/video/assets/ref2/reference2.mp4`: 1323 frames @ 30 fps (44.10 s), scenes from /home/user/Test-/video/scripts/qa/calib/ref2_scenes.json.
Dead = life energy < 2000 canvas px² (camera compensated, caption band y 280-600 excluded); flagged dead run > 0.40 s; event >= 2000 px²·frames; target 5 events/s.

**Gate: FAIL** (6/16 scenes pass; overall 5.40 events/s, median gap 1.0 f, longest dead run 1.20 s).

| scene | time | score | ev/s | med gap (f) | max gap (s) | dead f | longest dead (s) | flagged runs | caption ev | camera-only moves | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R2-01 | 0.00-2.83 | **10.0** | 6.00 | 2.0 | 1.00 | 12 | 0.23 | 0 | 8 | 18 f | PASS |
| R2-02 | 2.83-4.77 | **10.0** | 6.21 | 2.0 | 0.50 | 8 | 0.20 | 0 | 9 | 35 f | PASS |
| R2-03 | 4.77-6.50 | **9.4** | 5.77 | 1.0 | 1.30 | 0 | 0.00 | 0 | 6 | 20 f | PASS |
| R2-04 | 6.50-8.97 | **9.3** | 7.30 | 1.0 | 0.80 | 40 | 0.43 | 1 | 13 | 34 f | FAIL |
| R2-05 | 8.97-11.20 | **7.0** | 2.69 | 6.0 | 0.73 | 25 | 0.57 | 1 | 4 | 33 f | FAIL |
| R2-06 | 11.20-13.13 | **8.8** | 7.24 | 2.0 | 0.57 | 19 | 0.63 | 1 | 3 | 32 f | FAIL |
| R2-07 | 13.13-15.20 | **9.4** | 4.35 | 2.5 | 0.57 | 21 | 0.23 | 0 | 4 | 22 f | PASS |
| R2-08 | 15.20-17.40 | **7.0** | 2.73 | 3.0 | 0.93 | 24 | 0.57 | 1 | 6 | 24 f | FAIL |
| R2-09 | 17.40-20.90 | **8.6** | 4.00 | 2.0 | 0.80 | 35 | 0.43 | 1 | 9 | 63 f | FAIL |
| R2-10 | 20.90-23.00 | **8.0** | 3.81 | 1.0 | 0.60 | 19 | 0.50 | 1 | 4 | 31 f | FAIL |
| R2-11 | 23.00-25.53 | **8.4** | 5.53 | 1.0 | 0.90 | 46 | 0.67 | 2 | 7 | 39 f | FAIL |
| R2-12 | 25.53-29.60 | **9.6** | 4.67 | 1.0 | 1.03 | 23 | 0.30 | 0 | 10 | 85 f | PASS |
| R2-13 | 29.60-31.83 | **10.0** | 9.85 | 0.0 | 0.53 | 14 | 0.23 | 0 | 8 | 39 f | PASS |
| R2-14 | 31.83-35.60 | **9.5** | 6.11 | 0.0 | 0.90 | 50 | 0.47 | 1 | 11 | 57 f | FAIL |
| R2-15 | 35.60-38.67 | **9.1** | 8.15 | 2.0 | 0.83 | 34 | 0.73 | 1 | 5 | 68 f | FAIL |
| R2-16 | 38.67-44.10 | **8.2** | 3.87 | 4.5 | 0.77 | 64 | 1.20 | 1 | 11 | 103 f | FAIL |

## Dead runs over the limit

- R2-04: 13 dead frames (scene f22–f34, film f217–f229, 7.23-7.67 s, 0.43 s): **FLAGGED**
- R2-05: 17 dead frames (scene f5–f21, film f274–f290, 9.13-9.70 s, 0.57 s): **FLAGGED**
- R2-06: 19 dead frames (scene f4–f22, film f340–f358, 11.33-11.97 s, 0.63 s): **FLAGGED**
- R2-08: 17 dead frames (scene f12–f28, film f468–f484, 15.60-16.17 s, 0.57 s), captions change in 1 of them: **FLAGGED**
- R2-09: 13 dead frames (scene f66–f78, film f588–f600, 19.60-20.03 s, 0.43 s), captions change in 1 of them: **FLAGGED**
- R2-10: 15 dead frames (scene f4–f18, film f631–f645, 21.03-21.53 s, 0.50 s): **FLAGGED**
- R2-11: 14 dead frames (scene f5–f18, film f695–f708, 23.17-23.63 s, 0.47 s): **FLAGGED**
- R2-11: 20 dead frames (scene f26–f45, film f716–f735, 23.87-24.53 s, 0.67 s), captions change in 1 of them: **FLAGGED**
- R2-14: 14 dead frames (scene f82–f95, film f1037–f1050, 34.57-35.03 s, 0.47 s): **FLAGGED**
- R2-15: 22 dead frames (scene f4–f25, film f1072–f1093, 35.73-36.47 s, 0.73 s): **FLAGGED**
- R2-16: 36 dead frames (scene f127–f162, film f1287–f1322, 42.90-44.10 s, 1.20 s), captions change in 1 of them: **FLAGGED**

## Score formula

score = 10 x (0.45 D + 0.35 V + 0.20 G); D = min(1, events/s / target); V = 1 - frames in flagged dead runs / frames; G = 1 if the longest gap between event onsets (scene edges included) <= 1.0 s, linear to 0 at 2.0 s. A scene PASSES with score >= 8.0 and no flagged dead run. Frames inside transition windows are never dead.
