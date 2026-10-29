# The 7 s look test: the clip and its QA (STUDY.md §10 item 11)

*Lane S, 2026-10-29. Lanes E, PT and N integrated into S1's copy (`SCENE.md` §7), ONE playable clip for the owner's
phone, ONE A/B sheet, the QA. Everything below was measured on the final code (13:53 UTC).*

**State (13:58 UTC): done.** Nothing is running. If this is picked up again: the clip is final; every check below can be
re-run with the commands in §6.

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
