# The 7 s look test: the clip and its QA (STUDY.md §10 item 11)

*Lane S, 2026-10-29. Lanes E, PT and N integrated into S1's copy (`SCENE.md` §7), ONE playable clip for the owner's
phone, ONE A/B sheet, the QA. Everything below was measured on the final code (13:53 UTC).*

**State: FIX PASS 1 IN PROGRESS** (the panel's FIX_FIRST: `REVIEW.md`). The progress log and the exact next step are
in §8 at the end; §1-§7 below describe v1 as reviewed, until §8 says the clip is re-rendered.

## 1. What to look at
- **The clip:** `video/deliverables/tests/poster_look_test_v1.mp4` (8.85 MB, 15.5 s, 1080 x 1920, 60 fps, voice and
  captions). 0.0-1.2 s a card "Before: the Google video"; 1.2-7.3 s **v2's S1 as shipped** (pixel-identical to
  `Film2R-V2S1`); 7.3-8.5 s a card "After: the poster lessons"; 8.5-15.5 s **pass 2**, every decided change (S1 0-6.1 s,
  then the 0.9 s locked hold). Composition `PosterLookTest` (`src/look/poster_s1/PosterLookTest.tsx`, entry
  `src/entry-look-poster.tsx`). The cards' words: the caption hand at 92 / 128 px, centred at y ~900-1060 (the caption
  block is y 290-600), on the film's paper, silent.
- **The A/B sheet:** `test/ab_switches.jpg`: S1 at 5.2 s, v2 then v2 + ONE switch (line, darks, patchwork, texture, far
  stage) as full frames, then 1:1 crops of each (the texture's: the mottle layer itself x10 next to the frame), and v2
  next to pass 2. From the same code (`PosterS1`, preset v2 + one switch).

## 2. What the after row beats (STUDY §10 step 1's five scripts, `look_test_row.py`, pass 2 at 1.0 / 3.0 / 5.2 s)
All numbers: `after_row.json` (the before: `before_row.json`, `BEFORE.md`). Lossless PNG stills, as the before.

| | before (v2) 1.0 / 3.0 / 5.2 | after (pass 2) 1.0 / 3.0 / 5.2 | target | |
|---|---|---|---|---|
| L* p5 | 59.4 / 59.2 / 55.4 | 33.1 / 33.1 / 33.1 | <= 32 | closer, not met |
| L*<40 % | 1.6 / 1.6 / 1.8 | 8.2 / 8.3 / 8.2 | 6-10 | MET (v2 did not) |
| dark parts | 19 / 25 / 65 | 130 / 132 / 134 | >= 120 | MET (v2 did not) |
| dark cells /16 | 4 / 6 / 6 | 12 / 12 / 13 | >= 9 | MET (v2 did not) |
| L*<65 % | 9.6 / 10.1 / 10.9 | 52.9 / 53.5 / 53.3 | >= 25 | MET (v2 did not) |
| L* 65-80 % | 31.1 / 30.7 / 30.6 | 15.9 / 15.3 / 15.2 | <= 20 | MET (v2 did not) |
| bottom quarter L* p50 | 78.4 / 78.4 / 78.4 | 58.1 / 58.1 / 58.1 | 45-60 | MET (v2 did not) |
| near treads L* | 75.3 / 75.4 / 75.4 | 55.9 / 56.1 / 56.0 | 45-60 | MET (v2 did not) |
| near-to-air span L* | 12.7 / 12.6 / 12.6 | 32.1 / 32.0 / 32.1 | >= 30 | MET (v2 did not) |
| pastel % | 56.8 / 57.4 / 57.5 | 20.0 / 20.7 / 21.5 | <= 25 | MET (v2 did not) |
| C*-weighted L* | 77.0 / 77.0 / 76.9 | 63.5 / 63.5 / 63.7 | <= 68 | MET (v2 did not) |
| accent C>=35 % | 4.6 / 4.8 / 5.1 | 3.7 / 3.9 / 4.1 | 2-6 | met (v2 too) |
| accent parts | 50 / 47 / 48 | 43 / 41 / 43 | >= 25 | met (v2 too) |
| big fields below sky % | 15.2 / 15.2 / 15.0 | 19.2 / 18.8 / 18.9 | 0 (none over 2 %) | FURTHER |
| mottle L std | 0.2 / 0.2 / 0.2 | 0.8 / 0.8 / 0.8 | 0.3-0.6 | not met |
| colours n90 | 17 / 18 / 19 | 24 / 25 / 24 | >= 20 | MET (v2 did not) |
| colours >=0.5 % | 22 / 23 / 27 | 31 / 32 / 31 | >= 25 | MET (v2 did not) |
| edges % | 4.9 / 4.9 / 5.2 | 5.7 / 5.8 / 5.9 | posters 10.1 | closer, not met |
| busy % | 29.1 / 29.3 / 30.8 | 33.1 / 34.7 / 35.1 | >= 35 | closer, not met |
| structure % | 26.9 / 28.5 / 25.7 | 30.7 / 31.1 / 30.6 | <= 12 | FURTHER |
| median edge step L* | 10.8 / 11.1 / 12.5 | 14.0 / 14.3 / 15.0 | 12-18 | MET (v2 did not) |
| A fine % | 12.3 / 12.8 / 11.3 | 5.7 / 10.3 / 11.3 | 6-12 | not met |
| C near faces/10k | 4.2 / 3.9 / 3.6 | 4.5 / 4.1 / 4.2 | 11-25 | closer, not met |
| C near local c. | 3.0 / 3.0 / 3.0 | 3.3 / 3.3 / 3.3 | ~9 still, <= 7 moving | closer, not met |
| C far faces/10k | 12.2 / 9.6 / 10.5 | 12.0 / 9.5 / 11.0 | 2-15 | met (v2 too) |
| sky % | 34.1 / 33.9 / 34.3 | 31.7 / 31.8 / 32.0 | posters 36-53 | FURTHER |
| calm below skyline % | 23.9 / 23.5 / 23.1 | 18.3 / 18.2 / 17.9 | <= 5 | closer, not met |
| C* p90 / p50 | 1.96 / 1.96 / 1.96 | 1.42 / 1.45 / 1.46 | >= 2.5 | FURTHER |
| corners BL/BR L* | 67/70 / 67/70 / 67/70 | 52/59 / 52/59 / 52/59 | dark (posters 44 / 53) | closer |
| subject salience share % | 9.3 / 10.1 / 9.8 | 8.5 / 9.3 / 9.3 | | |
| depth FAIL / WARN | [0, 4] / [0, 5] / [0, 4] | [0, 3] / [0, 3] / [0, 4] | | |

**Read.** Pass 2 fixes what the study diagnosed in the value structure: the frame leaves the light half (p5 59 -> 33, the
darks 1.6 -> 8.2 % in 130-134 pieces over 12-13 cells, L* < 65 from 10 % to 53 %), the near group is now 9-11 L* UNDER
the subject's plane (v2: 0.7 over it) and 32 L* from the air (v2 12.6), the pastel tint is gone (57 -> 21 %), the
colours count went up (n90 17-19 -> 24-25), the edges are firmer (median step 11-12.5 -> 14-15 L*), the bottom corners
darker (67 / 70 -> 52 / 59 L*), check_depth's subject-step and ground-texture WARNs are gone. **Not met:** p5 by 1.1
(33.1 against <= 32); the detail and finish targets (the posters' edge density, busy and structure tiles, the near props'
shapes and local contrast) moved toward the posters but stay far from them: they need more drawn things, not settings;
**three measures moved AWAY** (flags for the owner, §5): edge-free fields below the sky 15 -> 19 % (the calm paving),
the structure tiles 26-28 -> 31 %, the open sky 34 -> 32 % (the cumulus and the spray), the chroma spread p90 / p50
1.96 -> 1.45 (10b's colour in the mids). The "mottle inside fields" measure (0.8, target 0.3-0.6) is confounded: it
reads 0.74 with the texture OFF (the patchwork's facets inside the fields); the texture's own layer is 0.13-0.31 L*
(check_banding, below).

## 3. Every check
| check | result | numbers |
|---|---|---|
| **The copy is v2** (every switch off vs `Film2R-V2S1`'s frames from v2's own entry, 0 / 1.0 / 3.0 / 5.2 s, full size) | **PASS: 0 px** | re-run after every code change (09:49, 12:47, 13:53 UTC); max channel delta 0. v2's part of the clip is this code |
| **framecheck** (the deliverable, `--fps 60 --scenes` its four parts) | **2 ERROR (waived, §4), 3 WARN** | no flash; captions found in 696 frames: low-contrast share p95 0.0, busyness p95 0.0. ERROR "blank": the two label cards. WARN "ui-zone": S1's opening flood reaching the top, bottom and rail zones (f72-114 in v2's part, f510-552 in pass 2's: the same event in both) |
| **capcheck** (`scripts/capcheck.mjs`'s two renders and `capcheck.py`, 30 clip times at 0.5 scale, both parts) | **PASS: 22 caption frames, 0 FAIL, 0 warn** | near < 3:1 0.0 %, band < 3:1 0.0 % on every frame; "for life." (4.85-5.8 s) sits inside its highlight box (no open background to measure) |
| **check_depth** VALUE and NEAR (pass 2 stills, `scripts/qa/depth_sheets/v2_s1_t{1.0,3.0,5.2}.json`) | **0 FAIL; 3 / 3 / 4 WARN** (v2 4 / 5 / 4) | the near treads (plane -2) **L* 55.9-56.1** (v2 75.3-75.4; target 45-60), **9.4-11.1 under the wing** (L* 65.5-67.0; target 5-14), the near-to-air span **32.0-32.1** (>= 30; v2 12.6); the subject's plane to +3 **dE 16.5-17.6** (>= 12; v2 8.0-9.5 WARN: gone); the ground's texture finer far than near (2.7 vs 2.1 crossings / 100 px; v2 WARN: gone). Still WARN: the ladder (+4 dE 10.2 from the air vs +3's 10.6-11.4; v2 10.0 vs 12.2-12.7), the far plane's edges 0.70-0.74x the subject plane's (<= 0.5; v2 0.93-0.98). New WARN, the no-outline cost: the wing's west edge 10.9 at 1.0 s (>= 12; v2 12.4), her one value 28 % at 3.0 s and 26 % at 5.2 s (<= 20 % unlined / 25 % lined; v2 6-11 % with her line), **the copies' row at 5.2 s median dL* 7.9** (>= 15; v2 13.0 with its line). The silhouette numbers move ~1 L* / 1 % between two renders that differ in 588 px elsewhere (the motes): her 5.2 s is on the line |
| **check_light** A/B (pass 2 `lightOff` vs lit, 1.0 / 3.0 / 5.2 s; v2's subject boxes, `--sky '#C5DDD3'` (10b), `--exclude 0,0,1080,600`) | **OK x 3** (v2 OK x 3) | the brightest 5 % 0.038 / 0.057 / 0.063 H from the subject (v2 0.034 / 0.051 / 0.057); greyed shadow 510-739 px (cap 0.05 % = 1,037 px; v2 142-174); the band's spread 0.0; warm-lit share 7-8 % (v2 31 %: 10b's calm lights; reported, never a quota) |
| **check_banding --texture**, stills (pass 2 vs pass 2 texture off, 1.0 / 3.0 / 5.2 / 6.5 s, PNG) | **PASS on every region**, STRUCTURE p99.9 <= 1.04 L* (cap 3) | the sky (300-575 x 0-285, k 0.6): layer std 0.29-0.31 L*, 1/e radius 32-34 px, colour 0.21, in the band 0.001, the sky's banding PASS flat and textured; the bank (k 0.7) std 0.21 radius 33; the wing 0.20 radius 20-28; the water 0.20-0.21; the far roofs (k 0.4) 0.11-0.14. v2 + the texture alone vs v2 (full frame): PASS, STRUCTURE 1.02 |
| **check_banding --texture**, video (7 s masters of pass 2 with and without the mottle, `--times 1.0,3.0,5.2,6.5 --hold 6.2,6.9`) | **sky PASS x 4; HOLD PASS everywhere** | sky: std 0.308, radius 33.4-33.5, colour 0.23-0.25, banding PASS flat and textured; the hold (the sky, the wing, the treads, the far city, the café ground): frame-to-frame mean dL* 0.0000-0.0023 (cap 0.08), the same as the flat master: nothing boils. WARN (§4): the wing's and the water's mottle colour 0.37-0.39 a*b* (cap 0.35) through H.264 (the PNG stills read 0.17-0.22 there); the treads at 6.5 s "adds steps" (a patchwork region) |
| **the filter's own cost** (`textureK` 0.0001 vs the texture off) | p99.9 2-4 levels: a handful of 1-px AA seams | before the groups were split (SCENE §7): the spray, the crown, the boats and the bridge softened ~1 px; the edge positions of the trunk, the café table and the wing during the float textured vs flat: 0.000 px apart (no snapping) |
| **the master's bitrate** | **4.36 Mb/s video** (4.57 with audio), 8.85 MB | the mottle's share: pass 2 alone at the master settings 5.30 Mb/s textured vs 5.04 flat (+5 %; a grain at the subtlest posters' level costs +48 %, PT) |
| **the rungs** (style.py's settings from the deliverable: x264 medium, 1080p 3.5 Mb/s, 720p 1.5 Mb/s) | **1080p 3.20 Mb/s, 720p 1.40 Mb/s video** | `/tmp/posters-s/rungs/clip_p1080_3500k.mp4`, `clip_p720_1500k.mp4` |
| **the darks at each rung** (pro_4 at phone scale, pass 2 at 1.0 / 3.0 / 5.2 s) | **kept** | PNG p5 33.1, L* < 40 8.2-8.3 %, 130-134 pieces, 12-13 cells; master 32.2-32.9, 8.3-8.5 %, 129-134, 12-13; 1080p 32.2-33.1, 8.3-8.4 %, 128-135, 12-13; 720p 32.4-33.2, 8.2-8.3 %, 127-137, 12 |
| **twinkle at the crown's edge, in motion** (`nature_check.py motion`, the crown's box 0-360 x 1180-1460, pass 2's 2.0-3.0 s: the float's second leg and the gust; visible swing per 64 px tile, L*) | **the rungs add none** | PNG p95 3.06 / max 3.78 (4 of 20 tiles over 2 L*); master 2.55 / 2.82 (5 / 20); 1080p 2.11 / 2.61 (2 / 20); 720p 1.43 / 1.46 (0 / 6). With the wind held still the PNG reads the same (3.06 / 3.74): the swing is the float's parallax at the crown's lower edge (the near plane over the bank's paving) and Pip's idle motion, not the wind. v2's same box: 5.9 / 6.7 (a falling leaf crosses it) |
| **twinkle, strict** (lane N's method: the 6.5 s frame held, wind still, the near plane moved 0-1 px in 0.1 px steps along x, then y; lossless) | **WARN (as N found on its demo)** | thin-feature pixels swinging over 2 L*: the crown 15 % (max 10.0), its right edge 42 % (8.6), its top edge 3 % (3.4), Pip 29 % (8.5), the spray 21 % (23.5 at a tip's last pixels; its vein network 3.2): the lace's very ends. At 4x across the 22 phases the edge holds its shape and brightness. Through H.264 this measure is noise-bound (the max pixel of a big feature moves with quantisation: shares 27-100 %), so the motion test above ranks the encodes |
| **lints** (node, esbuild) | **[]** | lane N's `foliageProblems`, `windProblems`, `cloudProblems` in both palettes (`s1NatureProblems`); `particleProblems` with the moved near motes; E's float lints with `PARALLAX_Z` clean (item 4); `npx tsc --noEmit` clean |
| **audio** | **-14.0 LUFS, -4.4 dBTP**, LRA 6.1 LU; A/V lag 0.0 ms | the voice in both parts against where PosterLookTest plays it (`av_lag.py`, r 0.94 after the compression; Remotion's own track 0.0 ms, r 1.00) |

## 4. Waived, and why
- **framecheck "blank" x 2:** the label cards the brief asks for (paper with two lines of text, 98 % one colour, luma std
  21.5). Not the film: each part opens on its own frame 0 (the construction line, the voice from ~0.12 s).
- **check_banding's banding verdict outside the open sky** (the water, the treads, a full frame): FAIL flat AND
  textured: those regions are not skies (reflections, facets, buildings). Only the texture's own verdict applies there.
  The treads' "the texture adds steps" at 6.5 s: the region is a patchwork; the mottle's +-0.3 L* changes how many of its
  facet edges cross the step detector (1 -> 3). STRUCTURE never failed (no shape changed).
- **The mottle's colour WARN through H.264** (the wing, the water: 0.37-0.39 a*b* against 0.35): the same regions read
  0.17-0.22 on the lossless stills; 4:2:0 chroma and the codec's noise add the rest.
- **The calm tower's mottle std 0.233 against 0.23** (k 0.4): a hair, on the stills.
- **The strict twinkle at the lace's ends:** lane N's own finding on its demo (the tips' last pixels), not visible at 1x
  or 4x; the motion test shows the encodes soften it. Flagged for the owner's eye (§5).

## 5. Flags for the owner (decisions, not bugs)
1. **No outlines costs the copies' row its separation.** At 5.2 s (the cover) the copies part from the pale bridge and
   towpath by a median 7.9 L* (target >= 15; v2 13.0 with its line); their coat details (belt, bow, collar) were lines
   and are gone. Her own coat holds (15-21) but is borderline at 5.2 s. Options: a deeper shade face on the copies
   (`FormShade` per copy), a darker oat for the nearer copies, or the copies as the one lined exception (rule 4's line).
2. **The calm paving** reads calm at phone size but holds 18.8 % of edge-free field below the sky (busy 13.8, PT's
   3-tone middle 16.5, v2 15.2). `paving: 'mid'` is the in-between, by eye close to calm.
3. **10b's palette** lowers the chroma spread (p90 / p50 1.96 -> 1.45; target >= 2.5) and the warm-lit share (31 -> 8 %).
4. **The open sky** is 2 points smaller (34 -> 32 %): the hero cumulus is bigger than v2's cloud.
5. **Pip in the crown** is findable as a lavender patch with a pink paw pad on "life"; at phone size a ~13 px patch.
6. **The cost of the mottle:** +5 % bitrate, ~+0.33 s a frame to render (pass 2 0.74 s vs 0.41 at concurrency 2).
7. Lane E's: 10b's `waterDeep` sits dE 15 from her teal (she stands on the towpath, not against the deep water, in S1).

## 6. How it was made (commands from `video/`)
```bash
E=--entry=src/entry-look-poster.tsx
GL=angle node scripts/render-media.mjs PosterLookTest /tmp/posters-s/master/poster_look_test_v1_video.mp4 $E --master --concurrency=2
bash /tmp/posters-s/tools/s_audio.sh /tmp/posters-s/master/poster_look_test_v1_video.mp4 deliverables/tests/poster_look_test_v1.mp4
python3 scripts/qa/framecheck.py deliverables/tests/poster_look_test_v1.mp4 --fps 60 --scenes /tmp/posters-s/clip_scenes.json --out /tmp/posters-s/framecheck
bash /tmp/posters-s/tools/s_capcheck.sh
GL=angle node scripts/render-frames.mjs PosterS1 /tmp/posters-s/s_after 1.0,3.0,5.2,6.5 $E --props='{"preset":"pass2"}'
python3 -I scripts/look/posters/look_test_row.py --label after --frames /tmp/posters-s/s_after/f00060.png /tmp/posters-s/s_after/f00180.png /tmp/posters-s/s_after/f00312.png --sheets scripts/qa/depth_sheets/v2_s1_t1.0.json scripts/qa/depth_sheets/v2_s1_t3.0.json scripts/qa/depth_sheets/v2_s1_t5.2.json --out docs/studies/2026-10-28_city_posters/test/after_row.json
GL=angle node scripts/render-media.mjs PosterS1 /tmp/posters-s/master/p2_tex.mp4 $E --master --concurrency=2 --props='{"preset":"pass2","audio":"none"}'   # and "texture":false
python3 -I scripts/qa/check_banding.py /tmp/posters-s/master/p2_tex.mp4 --texture --flat /tmp/posters-s/master/p2_flat.mp4 --region 300,0,575,285 --k 0.6 --times 1.0,3.0,5.2,6.5 --hold 6.2,6.9
python3 -I /tmp/posters-s/tools/s_rungs.py deliverables/tests/poster_look_test_v1.mp4 /tmp/posters-s/s_win /tmp/posters-s/s_after /tmp/posters-s/rungs
```
The audio master: the voice placed where the composition plays it, then at 4x a 2:1 compressor above -20 dBFS, +12.75 dB
and a limiter at -1.4 dBFS (delay compensated), muxed onto the master's video stream (copied, never re-encoded) as
AAC-LC 48 kHz stereo, faststart (the voice alone was -22.1 LUFS at -2.8 dBTP: gain alone would clip). Scratch (stills,
masters, rungs, tools): `/tmp/posters-s/`. Render times: the clip 930 frames in 442 s (v2's part ~0.3 s a frame, pass
2's ~0.74), GL=angle like every still and check of the test.

## 7. What the integration changed (details: `SCENE.md` §7)
- **PT's mottle** on every plane group that can carry it (the sky 0.6 at blotch scale 0.9: its radius read 36-37 px at
  1.0; the far stage, the far roofs and the calm tower 0.4; the water, the subject's plane, the bank, the near things
  0.7), one seed per plane, the band screen-locked through the float's offset. Not on the spray, the tree and Pip, the
  boats and the duck, the bridge, the particles: Chrome resamples a rotated or scaled group inside a filter (a ~1 px
  softening), and at k 0.4-0.7 on small or dark things the mottle cannot be seen. Every multiply layer that falls on
  another group sits outside the filter (`S1PlaneStack` layers): no shadow paints its tint solid.
- **N's London plane** as the planter's tree (300 px, 12 clusters, N's ladder L* 36-70, mean 47.5) with Pip inside it,
  N's spray for the top-left twig, ONE wind (a light westerly, one gust at 2.6 s), N's hero cumulus for the kit's cloud
  (the thin bar gone); the near motes moved into the new crown's shade (on v2's crown colour they read +50 L* over N's).
- **PT's calm paving** (1.2 m cells, 2 tones 4.5 apart): the first setting read as a chequer at phone size.
- Lane E's pieces were wired at item (4); nothing changed there. No library added; `package.json` unchanged; no shared
  lib file touched (lib/texture, foliage, wind, clouds as their lanes left them).

## 8. Fix pass 1 (REVIEW.md: MUST 1-6, the SHOULDs of its §3; nothing from its §5)
**Progress log** (each item: before -> after; the full table when the pass is done):
- SHOULD 1, the hook caption from frame 0 (`PosterS1.tsx`): page 1 and its first line start at 0. S1 frames 0-5 now
  carry 10,939 caption-ink px in the band (v2's master: 10,934; before: 0 on frames 0-4).
- SHOULD 2, pass 2's own water troughs (`V2S1_water.tsx`): the 10b spec's gapMix 0.4000001 (its own TROUGHS key).
- MUST 6, the landmark (`V2S1_far_stage.tsx`): two flat bands toned from the sky beside them (at x 60 and 140, the
  split at 130 m, y ~698), the warm foot from y 735. Row by row at 1.0 / 3.0 / 5.2 s: **L* min 86.5, dE76 max 5.7,
  |dC*| max 3.8: every row passes** (before: L* 78.2-86.8, C* 11-19 h 35-44, dE 7-18.7). SHOULD 9 with it: a farther,
  paler ghost row (z 4200) across the west gap from the frame's edge to the sun's left edge.

- MUST 4, the spray and the crown (`V2S1_nature.tsx`): the spray `autumn` 0.88 on 6 leaves and 1 twig (size 46-76),
  its tones lifted to the ladder L* 50-75 (`S1_SPRAY_LADDER`, lit gold near v2's ~70); the crown `autumn` 0.18 (the
  falling leaves have a source). At p2 3.0 s: **warm 86 %, green 2 %, L* 67.5, C* 32.6, 17.9k px** (before: 96 %
  green, L* 53.3, C* 20.0, 29.5k px; v2's twig 90 % warm, L* 72.9, C* 33.5, 9.5k px); `s1NatureProblems` [] in both
  palettes. Its edge px 5,974 against her group's 5,541 (box 470-660 x 880-1100; before 8,990): re-measured after
  MUST 1; if the spray still leads, its branch goes ~60 px further off-frame.

- MUST 1, her and the row (`V2S1_row_fig.tsx`: `FigValues`, value parts clipped to their part; `V2S1_row.tsx`; all
  under `lineOff`): on every member the belt a ~4 px band in the coat's deep shade (-20 L*) with its bow filled, the
  collar a lit (+5) / shade (-9) pair split where the body's band starts, the near sleeve a 3 px shade sliver; the
  copies' band 40 % of the coat at -25 L* (warm; before ~20 % at -22), their oat -7 L* (lever 5: the step was still
  under 15), the rig's rim on their key side (3.5 px at 170 px); every head a crescent away from the key at -24 L*
  (cool, C* >= 8) and a lit cap (+8 L*, 2.2 px), the head left out of the body's band. Her tote is an object of its
  own: **cream L* 85.0 C* 17.4 with a warm shade L* 68.7 C* 15.8** (before L* 50.2 C* 2.3 under her teal's cool band),
  its strap one 2.0 px line in its deep shade; her plant **L* 56.8, 12.3 off the lobby plant** (before 3.4); her
  hair's rim clipped to the door's dark members (a light rim on the lit lobby read as a halo ring). check_depth (the
  sheets): **her 5.2 s 18.3 / 13 %, 3.0 s 21.5 / 13 %: pass** (before 15.4 / 26 %, 21.9 / 31 %); **the copies' row
  at 5.2 s 8.1 / 29 %: still under 15** (before 7.9 / 33 %; v2 13.0 lined), G1-G2 at 3.0 s 11.4 / 31 % (15.6 / 13 %).
  Why: the sheet's GrabCut takes the whole row box as one blob (its contour runs along the heads' tops, the
  balustrade and the box's edges; v2's 13.0 is its outlines along that top). On the exact silhouettes (the frame
  minus `rowHidden`, a new QA switch) with check_depth's own separation at 540 px: copies 8.5 / 26 % (before 9.5 /
  28 %; **v2 with its lines 8.1 / 31 %**). At 540 px a copy is ~14 px wide, so its "inside" is the mean of its lit and
  shade halves (~L* 70) against the bridge's soffit (76) and the rose piers (68-72): mid fields between the two halves.
  Edge by edge at 1080 (1-3 px in, 1-4 px out) the shade edges part by 17-21 (before 7-11), the lit edges by 9-16 with
  the rim, the heads' key side by 15-21. The spray's edges now sit under her group's (5,974 against 6,935).

- MUST 2, the bank (`near.ts` `noBeigeBig` / `nearMid(..., {big})`; `V2S1_patch.tsx` `PAVE_STONE` / `paveTones`, the
  new default `paving: 'stone'`; `PatchFill front`): the bank's big fields (every tread stone, the bench's, the near
  things over a 4 % share of the near group) read the beige band wide (h 55-95 under C* 23) and turn a terracotta-rose
  stone at the same value (h 46, C* 22); the paving is 3 tones 5 L* apart as shown (h 41 / 46 / 51), 2.2 m cells on a
  0.6 m module at jitter 0.4, a mark in 24, no facet under 10 px: per tread the median facet 57-90 x 57-83 px, every
  neighbour pair inside 4-10, `patchworkProblems` [] on all seven; it floods under ONE circle front (the cascade's
  origin and speed, both states as shown), no longer tile by tile. y 1190-1920 at 5.2 s: **median h 47, C* 22.1,
  L* 57.0; 0.5 % at h 55-95 under C* 22; 68.8 % at h <= 50** (before: h 61, C* 19.2, L* 58.9; 56.9 %; 7.3 %).

- MUST 3, the panes (`V2S1_set_wing.tsx` `darkPaneInto`, the lobby, `V2S1_set_life.tsx`): every unlit pane is the
  sky's mirror in v2's cool family (L* 68 shown; 60-62 on the ground storey under the canopy's shade) with the room a
  band at its foot (16-23 % of its height; v1 56-68 %), its sill step kept, a streak one step lighter (L* 76; v1's sky
  white L* 89), no white glint; each pane's steps in their own batch layers (a batch layer groups its fills by colour,
  so a room colour another pane used first painted under this pane's glass). W is the one pane dark as a whole: **W's
  mean L* 27.0, every other pane 54-63**. The darks the panes gave up went where the eye goes, in small pieces: a low
  bench and a framed picture in the lobby, eight iron mooring rings on the coping in front of the door. **Darks 6.4 /
  6.6 / 6.7 % at 1.0 / 3.0 / 5.2 s, 122 / 126 / 127 pieces, 11 cells** (v1 8.2-8.3 %, 130-134, 12-13: MUST 4's autumn
  spray took its dark shade leaves and the top-left cell). Local contrast (pro_2's sigma 16): the unlit panes **5.2-7.7**
  (v1 8.9-15.4, v2 3.7-5.0), hers 17.1 at 5.2 s and 21.3 at 1.0 s: **2.2-3.2x**. The 300 px squint at 3.0 and 5.2 s:
  W, then the door with her and the first copies (the crown's shade still the darkest mass at the bottom left).
- SHOULD 3 (part), the lintel: each pane's lintel shadow is the pane's own shade step at 4.5 % of it (v1 an eave-dark
  bar at 7 % across every pane).

- SHOULD 3, the bars (`V2S1_fore.tsx`): the crates' hand holes are short round slots (a quarter of each crate's
  width) in the wood's own deep shade (L* 38, its hue), the shade under the upper crate 5 px (v1 11); the planter's soil
  has the far inner rim's lit edge over it (a recess between two lit edges); the bench's under-seat shade is a 13 px band
  (v1 a 9 px stripe); the fern pot's soil 12 px between the rim's lit bands (v1 8 px slivers).
- SHOULD 4, the roof terrace (`V2S1_set_wing.tsx`): square timber boxes with a lit face (L* 58), the end away from the
  sun in shade (the dark piece) and sage planting in them (v1 dark trapezoids that read as hidden roofs).
- SHOULD 5, the west corner (`V2S1_set_wing.tsx`, `V2S1_set_far.tsx`, `V2S1_float.tsx`; under `shadeTier`, so the
  Before half keeps v2's corner): no brick strip under the corner pier (its overhang and its anti-aliased fringe at the
  pier's edge made the 1 px L* 69 seam), the end wall 2 px under the pier; the calm tower's lower part one shade step
  down (it stands in the far city's shade like the wing's ground storey). The new QA prop `nudgeOn: 'subject'` moves the
  subject's plane by `nudge`: over five sub-pixel nudges at 2.5 s the seam's depth swings **0.3 L*** (before 3.0 on the
  same test; the tech review's 6.2 through the float). check_depth's west edge **16.4 / 18.8 / 18.3** at 1.0 / 3.0 /
  5.2 s (before 10.3 WARN / 13.2 / 16.0).

- SHOULD 6, the cumulus (`V2S1_nature.tsx` `s1CloudSpec`): `soft: {steps: 0}`. The faint rings outside the right
  lobe are gone (they were the soft steps); the lilac belly band stays inside the silhouette, but where the union's
  shoulders run a few px past the lit lobes its ends still show as a flat end: only lib/clouds can trim the band
  (round its ends inside the lobes), so it is **flagged to lib/clouds' owner (lane N)**, not edited here.
  `s1NatureProblems` [] in both palettes.
- SHOULD 7, the crown's motes (`V2S1_particles.tsx` `CROWN_GLINTS`, under `foliage`): the near field is now leaf-shaped
  glints on the crown's lit (top-left) edge: lib/particles' glints timing slowed (life 0.9-1.4 s, gap 0.5-1.2 s, two at
  most), each drawn as a small pointed leaf 20-24 px in the sun's warm light (L* ~90, h 86), not the lib's four-point
  sparkle (the owner on v5: "cheap"); `particleProblems` [] on the fields as drawn.
- SHOULD 8, Pip (`V2S1_nature.tsx` `S1_PIP_IN_CROWN.behind`, `S1Tree`): the crown's middle front cluster (id 10) goes
  behind Pip, so its ear's curve, pink inside, clears the leaves (on "life" its paw); **0.04-0.06 % of the frame** at
  1.0-6.5 s (v1 0.046 %), in the crown's shade, off her eye path. Of four clusters tried this one shows the most
  "elephant" piece for the least area (another showed an eye: too strong a find).

- MUST 5, the sheet (`test/ab_switches.jpg`, re-made from the fixed code): v2 and v2 + one switch at a time at 5.2 s
  with their 1:1 crops (the mottle as its own layer x10), pass 2 at 1:1 next to v2, and the palette pair: **pass 2 with
  the 10b palette (proposed: the clip's After) and pass 2 with v2's palette (`palette10b: false`: the decided switches
  alone)**, next to v2. The message's lines are in §9.

**Next step:** the re-render (`poster_look_test_v1.mp4`, same structure, same master encode), then the re-check
(REVIEW.md §7) with SHOULD 10's numbers.

## 9. The message to the owner (REVIEW.md MUST 5.2: the lines to send with the clip)
- **What it is:** a look test of v2's opening shot (S1), not a film: the same 6 seconds twice. **Before** (v2's S1 as
  shipped) plays at **1.2-7.3 s**, **After** (the poster lessons) at **8.5-15.5 s**, each after a 1.2 s label card.
- **Decided** (your "go with your suggestions"): no outlines, her and her row drawn by light and shade; real darks in
  small pieces, the near world in mid-tones; the low-poly paving and far walls; the far stage; one tree species in one
  wind; the hero cloud; the very subtle mottle; the toned sun; Pip hidden; the float by depth; 2 px thin lines.
  **Proposed, not decided:** lane E's 10b palette. `ab_switches.jpg` shows the After frame with it and with v2's own
  palette side by side, so the palette can be judged apart from the rest.
- **The mottle** is meant to stay invisible on a phone: judge it on the sheet's x10 crop.
- **The far stage** (decision 4) shows here only in principle: S1's wing leaves it a 260 px gap; it gets its full size
  on a scale landing.
- **The sound:** both halves carry v2's voice alone, mastered to -14 LUFS (v2's S1 with its full mix is -16.4),
  so loudness is not part of the comparison.
- **Open it as a file**, not as a messenger video (a messenger re-encodes it and smears the darks and the mottle).

