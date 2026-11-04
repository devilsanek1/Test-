# Technical review of the look test clip (`poster_look_test_v1.mp4`)

*Reviewer: THE TECHNICAL VERIFIER, 2026-10-29 (~14:20-15:40 UTC). Every number below was measured on the delivered
file `video/deliverables/tests/poster_look_test_v1.mp4` (8,853,305 B), not on the builder's renders, unless it says
otherwise. Where a check needs a texture-off reference, I used the builder's `/tmp/posters-s/master/p2_flat.mp4`, after
checking it against the clip (§5). Nothing in the repo changed except this file. Scratch and my tools (`yuvcmp.py`,
`rungs_check.py`, `track.py`, `mc_twinkle.py`, ...):
`/tmp/claude-0/-home-user-Test-/fe339b66-57f0-5b47-bb6a-872d2f15f4c0/scratchpad/review-tech/`.*

## 0. Verdict: SHOW (no MUST-FIX)
The file is technically sound and the A/B is fair:
- the Before half is v2's shipped S1, frame for frame (Y-PSNR 51.7-55.0 dB at the 3 moments);
- both parts carry the same voice at the same loudness (-13.9 / -14.0 LUFS), with no A/V offset (+0.0 ms);
- both use the same encoder settings, BT.709 TV-range tags that match the actual matrix, no dropped or duplicated frames,
  and no snapping in the float;
- REPORT's after row reproduces on the delivered frames;
- the sky and the mottle PASS on the file, and they hold at both platform rungs, as do the darks;
- the rungs add no twinkle.

Nothing I found would mislead the owner or embarrass on the phone.

Fix these before this code is reused (SHOULD 1-4):
1. The clip's pass-2 water is not the render REPORT measured: a lib/water cache leaks from the Before half into pass 2.
2. Both parts open without their first caption for 5 frames.
3. A 1-px line on the wing twinkles in the float. It is inherited from v2, so the A/B stays fair.
4. REPORT's rung numbers come from a decode path a phone doesn't use.

## 1. What I looked at
- **The file:** ffprobe and the MP4 boxes; a per-frame luma signature to find the cuts.
- **The Before half:** every one of its frames against v2's master, by frame index.
- **The after row:** pass 2's frames 570 / 690 / 822 through `look_test_row.py`, and the Before half's 132 / 252 / 384 for
  a like-for-like before.
- **The texture:** `check_banding.py --texture` on the delivered pass 2, twice: alone, and as an A/B against a texture-off
  master, on six regions.
- **The sound:** ebur128 and astats; `av_lag.py` against my own reference voice track.
- **framecheck** on the file.
- **The rungs:** three re-encodes of the file (1080p 3.5 Mb/s, 720p 1.5 Mb/s, plus 1080p 3.5 Mb/s at 30 fps as an extra).
  At each: pro_4's darks; `nature_check.py motion` on the crown, the spray and the café, in the float and in the hold;
  the mottle A/B; the sky's banding.
- **Extra checks:**
  - sub-pixel edge tracking of the float;
  - a frame-duplication scan;
  - the colour matrix against the lossless still;
  - a thin-feature census, with the one clean case tracked;
  - the cards.
- **Read:** REPORT, SCENE, BEFORE, SUMMARY, STUDY §9-10, DIRECTION, the poster refs README.
- **Code, read only:** `PosterLookTest.tsx`, `PosterS1.tsx`, `V2S1_water.tsx`, parts of `V2S1_set_wing.tsx`, and in lib
  `Film.tsx`, `Captions.tsx` (the hook page) and `water.tsx` (its caches).

## 2. The file itself (container, codec, colour tags, bitrate, timing)
| | measured on the file | REPORT | |
|---|---|---|---|
| container | MP4 (isom), **faststart** (moov at byte 32, before mdat), 8,853,305 B, 15.500 s | 8.85 MB, 15.5 s | OK |
| video | H.264 High @ L5.0, yuv420p, 1080 x 1920, 60/1 fps CFR, **930 frames**, x264 r3222 CRF 14, aq-mode 3, keyint 250, B-frames 3, an edit list of 2 frames (the B-frame delay); the same settings as v2's master | 1080 x 1920, 60 fps | OK |
| colour tags | stream and `colr nclx`: primaries 1 / transfer 1 / matrix 1 (**BT.709**), full_range 0 (**TV range**), chroma left. **The matrix really is BT.709**: decoded as BT.709, the 12 most saturated flat patches match the lossless still within 0.78 levels (max 1.06); decoded as BT.601 they are off by 3.98 (4.33) | (not stated) | OK |
| video bitrate | **4.36 Mb/s** over the clip (4.57 with audio). Per part: card 1 0.16, **Before 4.87**, card 2 0.17, **pass 2 5.35**, pass 2's hold 1.11. Peak 1 s window 8.26 Mb/s. Keyframes at 0, 1.2, 5.37, 7.3, 8.5 and 12.67 s (one at each part's start) | 4.36 (4.57); pass 2 alone 5.30 | OK |
| audio | AAC-LC 48 kHz stereo, 197 kb/s (asked for 320k: one voice in two identical channels needs no more); the edit list skips the 1024 priming samples | AAC-LC 48 kHz stereo | OK |
| **the parts** (frame-exact) | card 1 **frames 0-71** (0.0-1.2 s); **Before 72-437 (1.2-7.3 s)**; card 2 438-509 (7.3-8.5 s); **pass 2 510-929 (8.5-15.5 s)**. The brief's "Before about 0.6-6.7 s" is wrong; REPORT §1 and `PosterLookTest.tsx` are right | 0.0-1.2 / 1.2-7.3 / 7.3-8.5 / 8.5-15.5 | OK |
| cadence | no decoded frame identical to its predecessor in either part (the cards are static, as they should be) | | OK |
| cards | both render in the caption hand, centred, unclipped (ink x 116-960, y 834-1115: clear of the caption block y 290-600) | | OK |

So pass 2's 1.0 / 3.0 / 5.2 s are clip frames **570 / 690 / 822**, and the Before half's are **132 / 252 / 384**. They
match the builder's lossless stills `f00060 / f00180 / f00312` at 40.1 / 39.8 / 39.5 dB RGB PSNR, against 30-38 dB one
frame off. The timing is exact.

## 3. The Before half against v2's master (frame for frame, PSNR)
I compared every frame of the Before half (clip 72-437) with `v2r_G7_master_v1.mp4` frames 0-365, decoding both by frame
index (`yuvcmp.py`). ffmpeg's `psnr` filter mis-pairs frames on these files' timestamps (every third frame), so I didn't
use it.
| S1 time | frames (clip / master) | Y-PSNR | YUV-PSNR | max \|dY\| | |
|---|---|---|---|---|---|
| **1.0 s** | 132 / 60 | **55.0 dB** | 55.9 dB | 29 | match (encode noise; RGB 51.1 dB, mean \|d\| 0.22 of 255) |
| **3.0 s** | 252 / 180 | **51.7 dB** | 52.5 dB | 21 | match (RGB 47.6 dB, mean 0.45) |
| **5.2 s** (the cover) | 384 / 312 | **52.7 dB** | 53.8 dB | 32 | match (RGB 49.3 dB, mean 0.29) |
| 0.083-5.90 s | 77-426 / 5-354 | mean **57.5**, min 50.2, p5 51.3 | | 50 | every frame matches; one frame off reads 39.9 dB on average |
| **0-0.067 s** | 72-76 / 0-4 | **25.5 dB** | 27.3 | 189 | **differs.** v2's master shows "She quit Google." from frame 0; the clip shows no caption until S1 frame 5 (0.083 s). Pass 2 does the same: caption ink in the block is 0 px on frames 0-4 and 10,594 px from frame 5; the master has 10,584 px on its frame 0 |
| 5.917-6.083 s | 427-437 / 355-365 | 25.5 -> 5.4 dB | | 198 | differs, as expected: the master's A push-through into W (S2's carrier, from 5.875 s); the clip holds S1 to its cut, then shows the card |

Why the caption is late: `PosterS1.tsx` renders lib/Film with `only="V2S1"`, and Film passes `hookAtStart={!only}` to
`SkyCaptions` (`src/lib/Film.tsx:860`). Before page 1's own start, a shot render then returns no caption
(`src/lib/Captions.tsx`: `if (k < 0) { if (!hookAtStart) return null; ...}`). The shipped `Film2R` holds page 1 from
frame 0, as DIRECTION rule 9 asks: "frame 0 shows the first spoken line". REPORT's "pixel-identical to `Film2R-V2S1`" is
true. Its "v2's S1 as shipped" holds only from S1 frame 5 to frame 354.

## 4. The after row, re-run on frames from the delivered clip
`look_test_row.py --frames clip_0570.png clip_0690.png clip_0822.png` (depth sheets `v2_s1_t{1.0,3.0,5.2}.json`). The
frames were decoded with BT.709, TV to full range, bicubic with `accurate_rnd+full_chroma_int`, to 8-bit PNG. The same
runner on the clip's Before half gives a like-for-like before (both through the same encode).
| | REPORT after (PNG) 1.0 / 3.0 / 5.2 | **delivered pass 2** | **delivered Before (v2)** | target | |
|---|---|---|---|---|---|
| L* p5 | 33.1 / 33.1 / 33.1 | 33.0 / 33.0 / 33.5 | 59.5 / 59.2 / 55.5 | <= 32 | not met, as REPORT says |
| L* < 40 % | 8.2 / 8.3 / 8.2 | 8.2 / 8.3 / 8.2 | 1.6 / 1.6 / 1.9 | 6-10 | MET |
| dark parts / cells | 130-134 / 12-13 | 130 / 134 / 135, 12 / 12 / 13 | 16 / 24 / 64, 4 / 6 / 6 | >= 120 / >= 9 | MET |
| L* < 65 % / 65-80 % | 52.9-53.5 / 15.2-15.9 | 52.8 / 53.5 / 53.3, 16.0 / 15.4 / 15.2 | 10.1-11.3 / 30.2-30.6 | >= 25 / <= 20 | MET |
| bottom quarter p50, near treads, span | 58.1, 55.9-56.1, 32.0-32.1 | 58.1-58.2, 55.9-56.1, 32.0-32.1 | 78.4, 75.4-75.5, 12.6-12.7 | 45-60, 45-60, >= 30 | MET |
| pastel % | 20.0 / 20.7 / 21.5 | 21.3 / 22.0 / 22.7 | 57.1 / 57.6 / 57.8 | <= 25 | MET (+1.2-1.3 through the encode) |
| C*-weighted L*, C* p90 / p50 | 63.5-63.7, 1.42-1.46 | 63.5-63.7, 1.43 / 1.46 / 1.46 | 77.0-77.1, 1.94-1.96 | <= 68, >= 2.5 | MET, FURTHER (as REPORT) |
| accent % / parts | 3.7-4.1 / 41-43 | 3.4 / 3.5 / 3.7, 41 / 43 / 48 | 4.3-4.7 / 42-47 | 2-6 / >= 25 | met |
| big fields below sky % | 19.2 / 18.8 / 18.9 | 19.2 / 18.8 / **21.5** | 15.0-15.1 | 0 | FURTHER (the encode smooths the calm paving's 4.5 L* steps at 5.2 s) |
| mottle L std | 0.8 | 0.85 / 0.83 / 0.83 | 0.26-0.27 | 0.3-0.6 | not met; confounded, as REPORT says |
| colours n90 / >= 0.5 % | 24-25 / 31-32 | 24 / 24 / 25, 30 / 29 / 30 | 17-18 / 23-24 | >= 20 / >= 25 | MET |
| edges % | 5.7-5.9 | 5.8 / 6.0 / 6.1 | 4.9-5.2 | posters 10.1 | closer |
| busy % | 33.1 / 34.7 / 35.1 | 34.6 / 36.1 / 36.0 | 29.7-31.0 | >= 35 | the encode adds 1.0-1.5 here and 0.6 on v2: codec noise, not drawn detail. Keep REPORT's "closer, not met" |
| structure % | 30.6-31.1 | 30.2 / 31.5 / 30.8 | 25.5-27.7 | <= 12 | FURTHER |
| median edge step L* | 14.0 / 14.3 / 15.0 | 13.5 / 13.5 / 14.5 | 10.9-12.4 | 12-18 | MET (-0.5 to -0.8 through the encode) |
| A fine % | 5.7 / 10.3 / 11.3 | 5.7 / 10.1 / 11.1 | 11.2-12.8 | 6-12 | not met at 1.0 s |
| C near faces / 10k, local c. | 4.5 / 4.1 / 4.2, 3.3 | 4.1 / 3.7 / 3.7, 3.3 | 3.6 / 3.5 / 3.3, 3.0 | 11-25, ~9 | closer (by only 0.2-0.5 on the file) |
| **C far faces / 10k** | 12.0 / 9.5 / 11.0 | **9.8 / 6.1 / 7.9** | 10.0 / 7.8 / 9.4 | 2-15 | met; on the file pass 2's far city holds FEWER small shapes than v2's (the encode smooths its pale far shapes) |
| sky %, calm below skyline % | 31.7-32.0, 17.9-18.3 | 31.7 / 32.3 / 32.0, 18.1-18.3 | 34.0-34.3, 23.2-24.0 | 36-53, <= 5 | FURTHER, closer |
| corners BL / BR L* | 52 / 59 | 51.8-52.5 / 59.3 | 66.5 / 69.7 | dark | closer |
| depth FAIL / WARN | 0/3, 0/3, 0/4 | **0/3, 0/3, 0/3** | 0/4, 0/5, 0/4 | | the far plane's edges 0.59 / 0.58 / 0.55x the subject plane's (PNG 0.74 / 0.73 / 0.70; <= 0.5); the copies' row at 5.2 s 9.0 L* (PNG 7.9; >= 15): still the owner's flag 1; her 5.2 s PASSes on the file (PNG WARN): on the line, as REPORT says |

**Read:** REPORT's headline claims hold on the delivered file: the value structure, the darks, the near group under
the subject's plane, the pastel tint gone, more colours, firmer edges. The encode moves the detail measures a little
(pastel up, edge step down, busy up from noise). It calms the far city further than the PNG shows, so judge "something
WAY further out" on the clip, not on PNG stills.

## 5. check_banding --texture on the clip's pass-2 span
**On the clip alone (no flat), clip times:**
- The open-sky box 300-575 x 0-285 (k 0.6) at 9.5 / 11.5 / 13.7 / 15.0 s: **PASS x 4**, 0 visible steps, max step
  c 0.0068. Grain (high-pass) 0.29-0.30 L*, mottle (band-pass) 0.23 L*.
- The hold, 14.7-15.4 s: **PASS**, frame-to-frame mean |dL*| 0.0018 (max 0.0064).
- The sky's whole gradient through the empty band in the silent hold (rows 285-600 full width; column 300-575 x 0-600):
  **PASS**, grain 0.13 / 0.23 L*. (A full-width 0-620 box FAILs at caption times only on objects: the spray, the cloud,
  the caption's highlight box, dE00 13.3.)

**The A/B against a texture-off reference.**

The reference: the clip holds no flat version, so I cut its pass-2 span losslessly (FFV1, yuv420p, the same tags; all 420
frames bit-identical to the clip's, by framemd5) and ran it against the builder's `p2_flat.mp4`. Before using that
file I checked it. Decoded by frame index, it is aligned (48.6 dB mean against the clip at offset 0, 40.0 one frame
off), and every `-ss` seek lands on the same frame index in both files. The builder's textured `p2_tex.mp4` matches the
clip at 51.5 dB (encode noise), except in the water (§10, SHOULD 1).
| region (clip px) | k | layer std L* | radius px | colour a*b* | p99.9 | banding flat / tex | hold 6.2-6.9 s | verdict |
|---|---|---|---|---|---|---|---|---|
| sky 300-575 x 0-285 | 0.6 | **0.308** | **33.5-33.6** | **0.23-0.25** | 1.24-1.25 | PASS / PASS | 0.0036 | **PASS x 4** (REPORT: 0.308, 33.4-33.5, 0.23-0.25: reproduced) |
| wing 320-1080 x 620-1040 | 0.7 | 0.21-0.22 | 17.6-26.5 | 0.26-0.31 | 0.86 | FAIL / FAIL (not a sky) | 0.0011 | PASS x 4 |
| water 0-1080 x 1100-1230 | 0.7 | 0.31-0.35 | 16.4-23.2 | **0.355-0.402** | 3.35-3.39 | FAIL / FAIL | - | WARN x 4 (colour); confounded, see §8 waiver 3 |
| treads 300-1080 x 1260-1500 | 0.7 | 0.25-0.27 | 10.9-11.9 (a small region: reported, never judged) | 0.23-0.25 | 0.88-0.90 | FAIL / FAIL | 0.0099 | PASS x 4 |
| far roofs 0-300 x 700-900 | 0.4 | 0.153-0.154 | 13.5 (small region) | 0.19-0.20 | 0.83-1.23 | FAIL / FAIL | 0.0014 | PASS x 4 |
| café ground 450-1080 x 1500-1900 | 0.7 | 0.234-0.235 | 33.4-34.6 | 0.28-0.30 | 0.50-0.52 | FAIL / FAIL | 0.0005 | PASS x 4 |

**Results:**
- Nothing boils (every hold <= 0.0099, cap 0.08).
- No STRUCTURE: p99.9 <= 0.90 L* everywhere but the water, cap 6 between two encodes.
- The texture adds no steps anywhere: flat and textured verdicts are equal in every region.

## 6. Audio: loudness, true peak, A/V offset
| | measured | REPORT |
|---|---|---|
| integrated, whole clip | **-14.0 LUFS**, LRA 6.1 LU | -14.0, 6.1 |
| true peak (ebur128 `peak=true`) | **-4.4 dBTP** (astats sample peak -4.41 / -4.40 dBFS in the two parts) | -4.4 |
| per part | Before -13.9 LUFS (LRA 1.4), pass 2 -14.0 (LRA 3.4): matched, so the A/B is fair. Cards and hold silent (-inf / -89 / -85.5 dBFS peak) | |
| **A/V offset** | **+0.0 ms in all six windows** (1.2-7.3, 1.2-4.2, 4.2-7.3, 8.5-14.6, 8.5-11.5, 11.5-14.6 s; r 0.94), against my own reference track: `public/v2/voice.wav` cut to 6.1 s, placed at 1.2 and 8.5 s on silence. No drift | 0.0 ms, r 0.94 |
| for reference | v2's shipped master: -14.0 LUFS whole, -1.2 dBTP. Its S1 slice (voice, music, sound): **-16.4 LUFS** | |

The -4.4 dBTP against the script's -1.4 dBFS limiter: the mono voice is upmixed to stereo at -3 dB a channel. Loudness is
unchanged.

## 7. The platform rungs (1080p 3.5 Mb/s, 720p 1.5 Mb/s): the darks and the crown's twinkle
**How I made them:** re-encoded from the delivered file with REPORT's settings (x264 medium, `-b:v 3500k -maxrate 3500k
-bufsize 7000k`; 720p `scale=720:1280:flags=bicubic`, `1500k/1500k/3000k`, the BT.709 TV tags). As an extra, a 1080p
3.5 Mb/s rung at 30 fps (a platform may halve the frame rate).

**How I measured them:** every rung decoded with the accurate path above. The 720p rung is shown at 1080 like a phone's
scaler (the "native" row keeps REPORT's 720p grid).
| | master | 1080p 3.5 Mb/s | 720p 1.5 Mb/s | 1080p 30 fps (extra) |
|---|---|---|---|---|
| video bitrate (pass 2 alone) | 4.36 (5.35) | **3.21** (3.65); REPORT 3.20 | **1.40** (1.57); REPORT 1.40 | 3.08 (3.60) |
| darks: p5 at 1.0 / 3.0 / 5.2 | 33.0 / 33.0 / 33.5 | 33.0 / 33.1 / 33.6 | 33.2 / 33.1 / 34.0 | 33.0 / 33.0 / 33.5 |
| L* < 40 %, pieces, cells | 8.2-8.3, 130-135, 12-13 | 8.2-8.3, 127-138, 12 | 8.0-8.1, 123-131, 12 | 8.1-8.3, 128-138, 12-13 |
| crown 0-360 x 1180-1460, float 2.0-2.98 s: p95 / max L*, tiles > 2 | 2.60 / 3.21, 5 / 20 (PNG 3.06 / 3.78, 4 / 20) | 2.25 / 2.30, 4 / 20 | 1.63 / 2.47, 1 / 20 (native 1.43 / 1.46, 0 / 6) | 2.92 / 3.65, 5 / 20 |
| crown in the still hold 6.2-6.98 s | 2.09 / 2.92, 2 / 20 | 2.05 / 2.41, 2 / 20 | 1.03 / 3.34, 1 / 20 | - |
| spray 0-300 x 0-280, float (hold) | 3.79, 7 / 16 (3.16, 4 / 16); PNG 3.58, 9 / 16 | 2.89, 7 / 16 (2.55, 3 / 16) | 1.99, 1 / 14 (1.51, 0 / 14) | 3.54, 7 / 16 |
| café 540-900 x 1500-1760, float (hold) | 2.77, 4 / 20 (0.08: static) | 2.68, 4 / 20 (0.21) | 1.88, 0 / 20 (0.14) | 2.72, 4 / 20 |
| the mottle at the rung (pass 2 vs the flat, both at that rung) | sky 0.308 | sky 0.31, radius 33-34, café 0.234, holds <= 0.0154: PASS | sky 0.32, radius 33-34; wing 0.13-0.20; holds <= 0.0226; sky colour 0.345-0.369 (WARN) | - |
| sky banding (open box, band in the hold, column) | PASS | PASS | PASS (at most 2 wide stair steps; a staircase needs 3) | PASS |

**Read:**
- **The darks hold at every rung**, as REPORT says: >= 123 pieces in 12 cells, 8.0-8.3 % under L* 40.
- **The rungs add no twinkle:** they lower every swing. The crown's, the spray's and the café's swings come from real
  motion (the float's parallax, the wind), and they are in the lossless render too.
- **The mottle survives both rungs intact.** On a platform the texture is the one the owner sees.
- At 2x: the darks show no blocking at either rung. 720p softens the crown's serrations, and the far stage's ghost
  skyline and tower stay readable.

**The float, on the file** (a sub-pixel edge tracker on one edge per plane):
- The café table's pedestal (the near plane, mottled in pass 2): 0.10 px a frame, second difference p95 0.13 px. v2,
  unmottled: 0.12. **No snapping.**
- The wing's edge: 8.15 px of travel in pass 2 against v2's 3.47 (1/z), in smooth sub-pixel phases.
- The telecom tower (the stage): it holds within 0.20 px.

## 8. The waivers (REPORT §4), judged
1. **framecheck "blank" x 2: JUSTIFIED.** Reproduced exactly: f0-f71 and f438-f509, luma std 21.5, top colour 98 %, plus
   the 3 ui-zone WARNs (S1's flood in both parts), captions in 696 frames (p95 low-contrast 0.0, busyness 0.0). They are
   the label cards the brief asks for; each part opens on its own frame 0.
2. **check_banding's banding verdict outside the open sky: JUSTIFIED.**
   - In every non-sky region (wing, water, treads, far roofs, café) the verdict is the same flat and textured (FAIL /
     FAIL): the detector reads drawn facet and reflection edges as steps.
   - The texture's own verdict applies there, and it PASSes everywhere except the water's colour.
   - REPORT's "the treads add steps at 6.5 s" did not reproduce in my treads box (both FAIL). It depends on the region.
3. **The mottle's colour WARN through H.264: ACCEPTABLE, but its cause is not shown.**
   - On the file my wing box reads 0.26-0.31 (PASS). The water reads 0.355-0.402.
   - The delivered water is not the render REPORT measured (SHOULD 1): two encodes of the same textured pass 2 already
     differ there by a layer std of 0.20 L* and colour 0.05-0.14.
   - In the sky and the wing the same two encodes differ by only 0.003-0.021 L* and 0.01-0.09 a*b*. So "4:2:0 and the
     codec's noise add the rest" is a guess, not a measurement.
   - It doesn't matter for the look: 0.3-0.4 a*b* is invisible. At 720p the sky reads 0.345-0.369.
4. **The calm tower's mottle std 0.233 against 0.23: JUSTIFIED.** It is 1.3 % over a cap that already carries +15 %
   slack, and invisible (my far-roofs box: 0.153). If wanted, its k goes from 0.4 to 0.39.
5. **The strict twinkle at the lace's ends: JUSTIFIED as a flag for the owner's eye, INCOMPLETE as a waiver.**
   - On the file the rungs add no swing (§7).
   - The master itself has tiles over the 2 L* budget at the crown, the spray and the café, and the motion test can't
     tell motion from twinkle.
   - Lane N's strict test moves the near plane only. The subject's plane (+-4 px in pass 2) carries at least one 1-px
     line that twinkles (SHOULD 3), so decision 7 ("2.0 px on the planes that float") and REPORT's "the one thin FILL on
     a floating plane in S1, the bridge railing" are not met everywhere.

## 9. MUST-FIX
None. Nothing here would mislead the owner's judgement of the look or embarrass on the phone. The four items below should
still be fixed before this code is reused or the clip is remade.

## 10. SHOULD
1. **The clip's pass-2 water is not the render REPORT measured** (a lib/water cache leak from the Before half).
   - **Where:** pass 2 from 0.55 s to the end (clip 9.05-15.5 s), the near water along our bank. Thin horizontal rows,
     y ~1190-1232, x ~300-980: the troughs between the reflection bars.
   - **The symptom:** on those rows the clip is 2-3 L* lighter than `PosterS1` pass 2 (y 1203: L* 77.3 against 74.5).
     - In the box 560-860 x 1170-1250 the clip is off the lossless stills by mean 0.93-1.05 levels (p99 7). The builder's
       own encode is off by 0.39-0.52 (p99 2.3-3.0).
     - Everywhere else the two encodes sit at the same distance from the stills, to two decimals: sky 0.34-0.40, wing
       0.47-0.79, treads 0.40-0.51; the spray, the crown, the figures and the sign likewise (over frames 120-179).
     - Before 0.55 s (frame 33, the water's flood) they agree to 0.11.
     - The clip's box holds 5,700-6,400 thin bright line px per frame; the standalone renders hold 4,700-5,500.
   - **The cause** (read in the code):
     - lib/water's `troughOf(st, col, y)` mixes each bar's trough toward `skyColorAt(st.ramp, y)`, the open water.
       That differs between v2's body `#9CC3BC` under `S1_EVENING` and 10b's `CM10B.water` under `S1_EVENING_10B`.
     - But it caches the result in the module-level `TROUGHS` under `${col}|${Math.round(y)}|${st.gapMix}|${st.seed}`.
     - The v2 spec and the 10b copy (`{...S1_WATER, body, sky}` in `V2S1_water.tsx` `ensure()`) share seed `s1water` and
       gapMix 0.4.
     - Each render tab draws the Before half first, so pass 2 gets v2's lighter troughs for every bar colour the two
       palettes share.
     - `PosterLookTest.tsx`'s note that the module state "is always the part's own" does not hold for lib caches.
   - **The fix (in `src/look/poster_s1/V2S1_water.tsx` `ensure()`):** give the 10b spec its own trough key without
     touching its seed (the ripples must stay the same):
     `{...S1_WATER, body: CM10B.water, sky: S1_EVENING_10B, grid: {...S1_WATER.grid, gapMix: 0.4000001}}`, with a
     comment. Tell lib/water's owner to add the open-water colour to `TROUGHS`'s key. (Or render the parts separately and
     concatenate them.)
   - **Then:** re-render the master and check that box against `PosterS1` pass 2's lossless stills: mean |d| about 0.4-0.5,
     i.e. encode noise only.
2. **Both parts open without their first caption for 5 frames** (S1 frames 0-4, 0-0.067 s; clip 1.2-1.27 s and
   8.5-8.57 s).
   - **Where:** the caption block, y 290-600.
   - **Why it matters:** v2's shipped master shows "She quit Google." on frame 0, as DIRECTION rule 9 asks, so the Before
     half is not "as shipped" there. Pass 2's opening is the model for the next films' frame 0.
   - **The fix (in `src/look/poster_s1/PosterS1.tsx`):** start the hook page at 0 before handing the captions to Film,
     because Film hides page 1 in a shot render (§3):
     `const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));`
     The "quit" highlight keeps its 0.52 s.
   - **Then check:** about 10,590 caption px on frames 0-4 of both parts, and the Before half against v2's master at
     >= 50 dB on S1 frames 0-354.
3. **A 1-px line on the wing twinkles in the float** (inherited from v2, so the A/B stays fair).
   - **Where:** x ~324-326, y ~805-1033, where the west end wall (`s1SideWall`, drawn by S1Wing) meets the corner pier
     (`b.poly(CM.limestone, q(0, 0, CORNER, HM))`), edge to edge at u = 0. Pass 2 0-5.8 s; it is strongest while the
     subject's plane floats.
   - **The symptom:** a 1-px darker line sits there, its depth 5.9-12.1 L* under its neighbours (L* 69 against 80-83).
     The depth swings 6.2 L* through 2.0-2.98 s on the lossless render, 6.3 in the delivered clip and 6.8 in v2. The
     budget is about 2. In pass 2 the subject's plane travels 8.15 px against v2's 3.47, so it crosses more pixel
     phases.
   - **The fix (in `src/look/poster_s1/V2S1_set_wing.tsx`):** run the end wall 1-2 px under the pier, or give the corner a
     >= 2 px shade face. A render confirms which of the two fixes it.
   - **Then:** re-measure the swing (<= 2 L*), and extend the `nudge` QA prop (today the near plane only) to plane 0, so
     the strict test covers the wing's corners, window bars and door frame.
4. **REPORT §3's rung numbers come from a non-accurate decode.**
   - `s_rungs.py` decodes with `scale=...:flags=bicubic:in_color_matrix=bt709:in_range=tv` (swscale's default chroma
     path, no `accurate_rnd` / `full_chroma_int`). Through it the master's p5 reads 32.2-32.9.
   - Through the accurate path it reads 33.0-33.5, the same as the PNG's 33.1. The file doesn't darken p5; the decoder
     did.
   - The twinkle numbers move for the same reason (§11).
   - **The fix:** correct the row and use one decode path for every rung number.
   - The 720p twinkle on its own 6-tile grid (1.43 / 1.46, 0 / 6) can't be compared with the 1080p rows' 20 tiles.
     Measure it at 1080 too: 1.63 / 2.47, 1 / 20.
5. **The lengths aren't equal:** the Before half runs 6.1 s and pass 2 runs 7.0 s (its 0.9 s hold), though STUDY §10 has
   each part "float, then hold". For a like-for-like glance, either tell the owner pass 2 gets 0.9 s more, or give v2
   the same hold (`PosterS1` preset v2 has it: `LOOK_TEST_BEFORE = POSTER_S1_FRAMES`, a choice against "as shipped").
6. **For the owner, with the clip:**
   - Both halves carry v2's voice alone (no music, no sound effects), mastered to -14 LUFS. v2's shipped S1 with its mix
     is -16.4 LUFS. The Before half is v2's picture, not its soundtrack.
   - Send the file as a file (a document), not as a messenger video, so the phone plays the 4.4 Mb/s master. At a
     720p 1.5 Mb/s re-encode the darks, the sky and the mottle still hold, but the crown's serrations soften.
7. After SHOULD 1, re-run the water's texture A/B on the delivered file. On today's file it is confounded (§8 waiver 3).
8. The far stage loses some of its small shapes in the encode: C far 9.8 / 6.1 / 7.9 against the PNG's 12.0 / 9.5 / 11.0,
   and the far plane's edges 0.55-0.59x against 0.70-0.74x. It moves toward the <= 0.5x target, but judge the ghost
   skyline's read on the phone.

## 11. Numbers I could not reproduce (or did not re-run)
- **REPORT §3, the darks at each rung**, master "p5 32.2-32.9, L* < 40 8.3-8.5 %, 129-134 pieces":
  - Accurate decode: **33.0 / 33.0 / 33.5, 8.2 / 8.3 / 8.2 %, 130 / 134 / 135**.
  - I get REPORT's exact numbers only through `s_rungs.py`'s decode filter, and its saved stills read the same.
  - The rungs too: mine read 1080p 33.0-33.6, 720p 33.1-34.0 (REPORT: 32.2-33.1, 32.4-33.2).
- **REPORT §3, twinkle at the crown's edge** (`nature_check.py motion`, 2.0-2.98 s):
  - The PNG reproduces exactly: 3.06 / 3.78, 4 / 20.
  - 720p native reproduces exactly: 1.43 / 1.46, 0 / 6.
  - The master: REPORT 2.55 / 2.82 (5 / 20), mine **2.60 / 3.21** (5 / 20).
  - 1080p: REPORT 2.11 / 2.61 (2 / 20), mine **2.25 / 2.30** (4 / 20).
  - The cause is the decode path; the conclusion stands.
- **REPORT §3, the video A/B's wing colour WARN** (0.37-0.39): my wing box 320-1080 x 620-1040 reads **0.26-0.31**.
  REPORT doesn't give its box.
- **REPORT §3, the hold's frame-to-frame mean |dL*|** "0.0000-0.0023": mine **0.0005-0.0099**. The treads box is the
  highest; all are under 0.08. The regions differ.
- **The after row:** see §4. Pastel +1.2-1.3; accent % -0.3 / -0.4; C far faces -18 to -36 %; median edge step -0.5 to
  -0.8; busy +1.0 to +1.5; big fields at 5.2 s 21.5 against 18.9; check_depth WARN at 5.2 s 3 against 4; the far
  plane's edge ratio 0.55-0.59 against 0.70-0.74. Everything else is within +-0.5.
- **REPORT §1, "v2's S1 as shipped"** (pixel-identical to `Film2R-V2S1`): on the file, S1 frames 0-4 differ from the
  shipped master (the caption, §3).
- **Not re-run, because they need renders rather than the file:**
  - the check_light A/B;
  - capcheck's two renders (framecheck's caption check on the file agrees: 696 caption frames, p95 low-contrast and
    busyness 0.0);
  - the filter-only cost (`textureK` 0.0001);
  - lane N's strict twinkle (`nudge`);
  - the lints and `tsc`;
  - the 0 px copy proof at PNG level. On the file instead: S1 frames 5-354 match v2's master at >= 50.2 dB.
