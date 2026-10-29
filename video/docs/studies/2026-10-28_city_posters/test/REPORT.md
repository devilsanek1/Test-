# The 7 s look test: the clip and its QA (STUDY.md §10 item 11)

*Lane S, 2026-10-29. Integration of lanes E, PT and N into S1's copy (notes: `SCENE.md` §7), one playable clip for the
owner's phone, one A/B sheet, the QA. Live document: written as each render and check lands.*

**Next step (13:20 UTC):** done: the clip, framecheck, the after row (`after_row.json`, §5), check_depth, check_light.
Next: capcheck (`/tmp/posters-s/tools/s_capcheck.sh`), the twinkle window (pass 2 f120-179 as PNG), the two 7 s texture
masters (pass 2 with and without the mottle) for `check_banding --texture --hold`, the rungs
(`/tmp/posters-s/tools/s_rungs.py <deliverable> /tmp/posters-s/s_win /tmp/posters-s/s_after /tmp/posters-s/rungs`).

## 1. The clip
- **File:** `video/deliverables/tests/poster_look_test_v1.mp4`, 8.86 MB, 15.500 s, 930 frames, 1080 x 1920, 60 fps.
- **Video:** the repo's master path, `GL=angle node scripts/render-media.mjs PosterLookTest
  /tmp/posters-s/master/poster_look_test_v1_video.mp4 --entry=src/entry-look-poster.tsx --master --concurrency=2` (from
  `video/`): lossless PNG frames, BT.709 limited range (tagged), x264 CRF 14 preset slow aq-mode 3, yuv420p, H.264 High,
  **4.36 Mb/s**; 930 frames in 431 s (v2's part ~0.3 s a frame, pass 2's ~0.74: the mottle's filters). GL=angle, as
  every still and check of the test.
- **Audio:** v2's locked voice where PosterLookTest plays it (0-6.1 s of `public/v2/voice.wav` at 1.2 s and at 8.5 s,
  silence elsewhere: Remotion's own track in the master lags 0.0 ms against it, r 1.00 in both parts), mastered to
  **-14.0 LUFS** integrated, **-4.4 dBTP** (LRA 6.1 LU) and muxed onto the master's video stream (copied, never
  re-encoded) as AAC-LC 48 kHz stereo, faststart: `/tmp/posters-s/tools/s_audio.sh` (at 4x: a gentle 2:1 compressor
  above -20 dBFS, +12.75 dB, a limiter at -1.4 dBFS with its delay compensated; the voice alone was -22.1 LUFS at
  -2.8 dBTP, so gain alone would clip). In the deliverable the voice lags **0.0 ms** in both parts (`av_lag.py`, r 0.94:
  the compression).
- Composition `PosterLookTest` (`src/look/poster_s1/PosterLookTest.tsx`, entry `src/entry-look-poster.tsx`): 930 frames
  = 15.5 s at 60 fps, 1080 x 1920. 0.0-1.2 s a card "Before: the Google video"; 1.2-7.3 s v2's S1 as shipped (PosterS1
  preset v2: pixel-identical to `Film2R-V2S1`); 7.3-8.5 s a card "After: the poster lessons"; 8.5-15.5 s pass 2 (every
  decided change: S1 0-6.1 s and the 0.9 s locked hold). v2's locked voice (`public/v2/voice.wav`, cut at 6.1 s) and
  v2's pop captions in both parts; the cards silent, their words in the caption hand at 92 / 128 px, centred at
  y ~900-1060 (the caption block is y 290-600), on the film's paper (S1 opens on paper: the cut into frame 0 is calm).
- The A/B sheet: `test/ab_switches.jpg` (5.2 s; v2, then v2 + one switch: line, darks, patchwork, texture, far stage;
  full frames, then 1:1 crops; the texture's crop shows the mottle layer itself x10 next to the frame; v2 next to
  pass 2). From the same code (`PosterS1`, preset v2 + one switch), rendered 09:54 and the texture frame again 12:48
  after a fix (§2: the bay crown's crescent).

## 2. The checks
| check | result | notes |
|---|---|---|
| copy = v2 (every switch off vs `Film2R-V2S1`, 0 / 1.0 / 3.0 / 5.2 s) | PASS 0 px (09:49 UTC; again 12:47 after the crescent fix) | after the integration |
| `framecheck.py` on the deliverable (`--fps 60 --scenes` the clip's four parts) | 2 ERROR (waived, §3), 3 WARN; no flash; captions found in 696 frames, low-contrast share p95 0.0, busyness p95 0.0 | ERROR "blank": the two label cards (98 % one colour, by design). WARN "ui-zone": the flood of S1's opening reaching the top / bottom / rail zones (f72-114 in v2's part, f510-552 in pass 2's: the same event in both) |
| `check_depth.py` (pass 2 stills 1.0 / 3.0 / 5.2 s, `scripts/qa/depth_sheets/v2_s1_t*.json`) | **0 FAIL, 3 WARN** each (v2: 0 FAIL, 4 / 5 / 4 WARN) | VALUE and NEAR: the near treads (plane -2) L* 55.9-56.1 (v2 75.3-75.4; target 45-60), **9.4-11.1 under the wing** (66-67; target 5-14; v2 0.7 LIGHTER), the near-to-air span 32.0-32.1 (target >= 30; v2 12.6). Gone: the subject step WARN (dE 16.5-17.6, v2 8.0-9.5; target >= 12) and the ground's texture-gradient WARN (the patchwork recedes: 2.7 crossings / 100 px far, 2.1 near). Still WARN: the ladder (+4 dE 10.2 from the air against +3's 10.6-11.4, v2 10.0 / 12.2-12.7), the far plane's edges 0.70-0.74x the subject plane's (v2 0.93-0.98; target <= 0.5). New WARN (the no-outline cost, §5): one silhouette a frame: the wing's west edge 10.9 at 1.0 s (>= 12; v2 12.4), her at 3.0 s 31 % at one value (<= 20 %; v2 11 %), **the copies' row at 5.2 s median dL* 8.8** (>= 15; v2 13.0 with its line) |
| `check_light.py` A/B (pass 2 `lightOff` vs lit, 1.0 / 3.0 / 5.2 s; subject boxes as v2's master, `--sky '#C5DDD3'` (10b), `--exclude 0,0,1080,600`) | **OK x 3** | the brightest 5 % 0.038 / 0.057 / 0.063 H from the subject (v2 0.034 / 0.051 / 0.057); greyed shadow 510-739 px (v2 142-174; the cap is 0.05 % = 1,037 px); the band's spread 0.0; the warm-lit share 7-8 % (v2 31 %: 10b's calm lights; reported, never a quota) |
| `check_banding --texture --flat` (pass 2 vs pass 2 texture off; stills 1.0 / 3.0 / 5.2 / 6.5 s) | sky PASS (std 0.29-0.31, radius 32-34, band 0.001), bank PASS, wing PASS, water PASS, far roofs PASS; STRUCTURE p99.9 <= 1.04 L* everywhere (cap 3) | the far-gap region WARN (it holds sky at k 0.6); the calm tower 0.233 vs 0.23 (WARN, a hair) |
| the same, v2 + texture alone vs v2 (full frame, 4 times) | PASS, std 0.28, radius 34.5, STRUCTURE p99.9 1.02 | it first FAILED: v2's crescent form shade on the bay crown (a multiply in the mottled near group) painted solid over the crown once the crown sat outside the filter: a white blob. Fixed (the crescent drawn in the near group's `over`); v2 re-proved 0 px |
| the filter alone (`textureK` 0.0001 vs texture off, pass 2) | p99.9 2-4 levels, a handful of 1-px AA seams | before the groups were split: the spray, the crown, the boats and the bridge softened by ~1 px (Chrome resamples rotated / scaled groups inside a filter: SCENE.md §7) |
| edge motion, textured vs flat (pass 2, frames 160-199, four vertical edges) | identical sub-pixel positions on the trunk, the café table and the wing (0.000 px); the row's edge within 0.1 px (its mottle moves the measure) | no snapping, no judder from the filter |

## 3. Waived, and why
- **framecheck's two "blank" ERRORs** are the label cards the brief asks for ("Before: the Google video", "After: the
  poster lessons": paper with two lines of text, 98 % one colour, luma std 21.5). They are not the film: v2's own S1 and
  pass 2 each open on their own frame 0 (the construction line, voice from ~0.12 s).

## 4. What the integration changed (details: `SCENE.md` §7)
- **Lane PT's mottle** on every plane group that can carry it (the sky at 0.6, blotch scale 0.9; the far stage, the far
  roofs and the calm tower at 0.4; the water, the subject's plane, the bank and the near things at 0.7), one seed per
  plane, the caption band screen-locked through the float's offset. Not on: the leaf spray, the tree and Pip, the boats
  and the duck, the bridge, the particles (Chrome resamples a rotated or scaled group inside a filter: a ~1 px softening;
  at k 0.4-0.7 on small or dark things the mottle cannot be seen). Every multiply layer that falls on another group sits
  outside the filter (`S1PlaneStack` layers), so no shadow paints its tint solid.
- **Lane N's London plane** as the planter's tree (300 px, 12 clusters, N's ladder L* 36-70, mean 47.5), Pip hidden in it
  (behind front clusters 4-11, its ears and a lavender sliver between the dark lower clusters), N's spray for the
  top-left twig, ONE wind (a light westerly, one gust at 2.6 s), N's hero cumulus for the kit's cloud (the thin bar
  gone). N's lints `[]`.
- **Lane PT's calm paving** (1.2 m cells, 2 tones 4.5 apart): the first setting read as a chequer at phone size.
- Lane E's pieces were wired at item (4) (10b palette, the line flags, FormShade per tier, the float by 1/z, the near
  floor, the far anchor); nothing changed there.
