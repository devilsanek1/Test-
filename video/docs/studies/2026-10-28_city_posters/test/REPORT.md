# The 7 s look test: the clip and its QA (STUDY.md §10 item 11)

*Lane S, 2026-10-29. Integration of lanes E, PT and N into S1's copy (notes: `SCENE.md` §7), one playable clip for the
owner's phone, one A/B sheet, the QA. Live document: written as each render and check lands.*

**Next step:** build the A/B sheet `ab_switches.jpg` from the 5.2 s frames in `/tmp/posters-s/s_ab_*` (rendered 09:55),
then the clip composition `PosterLookTest` in `src/entry-look-poster.tsx`.

## 1. The clip
- File: `video/deliverables/tests/poster_look_test_v1.mp4` (not yet rendered).

## 2. The checks
| check | result | notes |
|---|---|---|
| copy = v2 (every switch off vs `Film2R-V2S1`, 0 / 1.0 / 3.0 / 5.2 s) | PASS 0 px (09:49 UTC) | after the integration |
| `check_banding --texture --flat` (pass 2 vs pass 2 texture off; stills 1.0 / 3.0 / 5.2 / 6.5 s) | sky PASS (std 0.29-0.31, radius 32-34, band 0.001), bank PASS, wing PASS, water PASS, far roofs PASS; STRUCTURE p99.9 <= 1.04 L* everywhere (cap 3) | the far-gap region WARN (it holds sky at k 0.6); the calm tower 0.233 vs 0.23 (WARN, a hair) |

## 3. Waived, and why
- (none yet)
