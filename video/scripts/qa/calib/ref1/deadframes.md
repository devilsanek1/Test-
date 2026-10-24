# Dead-frame report: ref1

Source `/home/user/Test-/video/assets/ref/reference.mp4`: 946 frames @ 30 fps (31.53 s), scenes from /home/user/Test-/video/scripts/qa/calib/ref1_scenes.json.
Dead = life energy < 2000 canvas px² (camera compensated, caption band y 990-1270 excluded); flagged dead run > 0.40 s; event >= 2000 px²·frames; target 5 events/s.

**Gate: PASS** (6/6 scenes pass; overall 5.58 events/s, median gap 3.0 f, longest dead run 0.10 s).

| scene | time | score | ev/s | med gap (f) | max gap (s) | dead f | longest dead (s) | flagged runs | caption ev | camera-only moves | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R1-S1 | 0.00-7.77 | **8.9** | 3.99 | 5.0 | 1.07 | 19 | 0.10 | 0 | 11 | 58 f | PASS |
| R1-S2 | 7.77-13.80 | **10.0** | 7.96 | 3.0 | 0.57 | 3 | 0.07 | 0 | 5 | 18 f | PASS |
| R1-S3 | 13.80-20.23 | **9.0** | 6.06 | 2.0 | 1.47 | 5 | 0.10 | 0 | 12 | 20 f | PASS |
| R1-S4 | 20.23-23.83 | **9.0** | 3.89 | 3.0 | 0.63 | 4 | 0.10 | 0 | 8 | 13 f | PASS |
| R1-S5 | 23.83-27.57 | **10.0** | 7.77 | 2.0 | 0.63 | 3 | 0.07 | 0 | 5 | 25 f | PASS |
| R1-S6 | 27.57-31.53 | **8.9** | 3.78 | 8.0 | 0.50 | 10 | 0.10 | 0 | 5 | 53 f | PASS |

## Dead runs over the limit

- none

## Score formula

score = 10 x (0.45 D + 0.35 V + 0.20 G); D = min(1, events/s / target); V = 1 - frames in flagged dead runs / frames; G = 1 if the longest gap between event onsets (scene edges included) <= 1.0 s, linear to 0 at 2.0 s. A scene PASSES with score >= 8.0 and no flagged dead run. Frames inside transition windows are never dead.
