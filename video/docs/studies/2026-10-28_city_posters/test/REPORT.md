# The 7 s look test: the clip and its QA (STUDY.md §10 item 11)

*Lane S, 2026-10-29. Integration of lanes E, PT and N into S1's copy (notes: `SCENE.md` §7), one playable clip for the
owner's phone, one A/B sheet, the QA. Live document: written as each render and check lands.*

**Next step (12:58 UTC):** the master render is running: `GL=angle node scripts/render-media.mjs PosterLookTest
/tmp/posters-s/master/poster_look_test_v1_video.mp4 --entry=src/entry-look-poster.tsx --master --concurrency=2` (from
`video/`; log `/tmp/posters-s/master/render.log`). Then: the clip's audio as WAV (`--codec=wav`), the voice to -14 LUFS /
<= -1 dBTP with ffmpeg, muxed onto the master's video stream (copied) as `deliverables/tests/poster_look_test_v1.mp4`;
then the QA of §2.

## 1. The clip
- File: `video/deliverables/tests/poster_look_test_v1.mp4` (rendering).
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
| copy = v2 (every switch off vs `Film2R-V2S1`, 0 / 1.0 / 3.0 / 5.2 s) | PASS 0 px (09:49 UTC) | after the integration |
| `check_banding --texture --flat` (pass 2 vs pass 2 texture off; stills 1.0 / 3.0 / 5.2 / 6.5 s) | sky PASS (std 0.29-0.31, radius 32-34, band 0.001), bank PASS, wing PASS, water PASS, far roofs PASS; STRUCTURE p99.9 <= 1.04 L* everywhere (cap 3) | the far-gap region WARN (it holds sky at k 0.6); the calm tower 0.233 vs 0.23 (WARN, a hair) |
| the same, v2 + texture alone vs v2 (full frame, 4 times) | PASS, std 0.28, radius 34.5, STRUCTURE p99.9 1.02 | it first FAILED: v2's crescent form shade on the bay crown (a multiply in the mottled near group) painted solid over the crown once the crown sat outside the filter: a white blob. Fixed (the crescent drawn in the near group's `over`); v2 re-proved 0 px |
| the filter alone (`textureK` 0.0001 vs texture off, pass 2) | p99.9 2-4 levels, a handful of 1-px AA seams | before the groups were split: the spray, the crown, the boats and the bridge softened by ~1 px (Chrome resamples rotated / scaled groups inside a filter: SCENE.md §7) |
| edge motion, textured vs flat (pass 2, frames 160-199, four vertical edges) | identical sub-pixel positions on the trunk, the café table and the wing (0.000 px); the row's edge within 0.1 px (its mottle moves the measure) | no snapping, no judder from the filter |

## 3. Waived, and why
- (none yet)

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
