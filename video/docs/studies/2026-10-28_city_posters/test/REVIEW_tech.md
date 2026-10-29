# Technical review of the look test clip (`poster_look_test_v1.mp4`)

*Reviewer: THE TECHNICAL VERIFIER, 2026-10-29. Every number below was measured on the delivered file
`video/deliverables/tests/poster_look_test_v1.mp4` (not on the builder's renders), unless it says otherwise. Scratch:
the session scratchpad's `review-tech/` folder. Status: IN PROGRESS (skeleton).*

## 0. Verdict
(pending)

## 1. What I looked at
(pending)

## 2. The file itself (container, codec, colour tags, bitrate, timing)
| | measured on the file | REPORT | |
|---|---|---|---|
| container | MP4 (isom), **faststart** (moov at byte 32, before mdat), 8,853,305 B, 15.500 s | 8.85 MB, 15.5 s | OK |
| video | H.264 High @ L5.0, yuv420p, 1080 x 1920, 60/1 fps CFR, **930 frames**, x264 r3222 CRF 14, aq-mode 3, keyint 250, B-frames 3, edit list of 2 frames (the B-frame delay) | 1080 x 1920, 60 fps | OK |
| colour tags | stream and `colr nclx` atom: primaries 1 / transfer 1 / matrix 1 (**BT.709**), full_range 0 (**TV range**), chroma left | (not stated) | OK |
| video bitrate | **4.36 Mb/s** over the clip (4.57 with audio); per part: card 1 0.16, **Before 4.87**, card 2 0.17, **pass 2 5.35**, pass 2's hold 1.11 Mb/s; peak 1 s window 8.26 Mb/s; keyframes at 0, 1.2, 5.37, 7.3, 8.5, 12.67 s (one at each part's start) | 4.36 (4.57); pass 2 alone 5.30 | OK |
| audio | AAC-LC 48 kHz stereo, 197 kb/s (asked for 320k: the encoder needs no more for one voice in two identical channels), edit list skips the 1024 priming samples | AAC-LC 48 kHz stereo | OK |
| **the parts** (frame-exact, from per-frame luma statistics) | card 1 **frames 0-71** (0.0-1.2 s); **Before 72-437 (1.2-7.3 s)**; card 2 438-509 (7.3-8.5 s); **pass 2 510-929 (8.5-15.5 s)**. The brief's "Before about 0.6-6.7 s" is wrong; REPORT §1 and `PosterLookTest.tsx` are right | 0.0-1.2 / 1.2-7.3 / 7.3-8.5 / 8.5-15.5 | OK |

So pass 2's 1.0 / 3.0 / 5.2 s are clip frames **570 / 690 / 822**, the Before half's are **132 / 252 / 384**. Checked: the
clip's frames 570 / 690 / 822 match the builder's lossless stills `f00060 / f00180 / f00312` at 40.1 / 39.8 / 39.5 dB RGB
PSNR (one frame off: 30-38 dB), so the timing is exact and the delivered pass 2 is the code REPORT measured.

## 3. The Before half against v2's master (frame for frame, PSNR)
Every frame of the Before half (clip 72-437) against v2's `v2r_G7_master_v1.mp4` frames 0-365, decoded by frame index
(`yuvcmp.py` in my scratch; note: ffmpeg's `psnr` filter mis-pairs frames on these files' timestamps, so it was not used):
| S1 time | frames | Y-PSNR | YUV-PSNR | max \|dY\| | |
|---|---|---|---|---|---|
| **1.0 s** | clip 132 / master 60 | **55.0 dB** | 55.9 dB | 29 | match (encode noise; RGB 51.1 dB, mean \|d\| 0.22 / 255) |
| **3.0 s** | 252 / 180 | **51.7 dB** | 52.5 dB | 21 | match (RGB 47.6 dB, mean 0.45) |
| **5.2 s** (the cover) | 384 / 312 | **52.7 dB** | 53.8 dB | 32 | match (RGB 49.3 dB, mean 0.29) |
| 0.083-5.90 s | 5-354 | mean **57.5**, min 50.2, p5 51.3 | | 50 | match on every frame; one frame off: mean 39.9 dB |
| **0-0.067 s** | 0-4 | **25.5 dB** | 27.3 | 189 | **differs: v2's master shows "She quit Google." from frame 0; the clip's Before half shows no caption until S1 frame 5** (0.083 s). Same in pass 2 (caption ink in the block: 0 px on frames 0-4, 10,594 px from frame 5; the master 10,584 px on frame 0) |
| 5.917-6.083 s | 355-365 | 25.5 -> 5.4 dB | | 198 | differs, expected: the master's A push-through into W (S2's carrier, 5.875 s on); the clip holds S1 to its cut and goes to the card |

Why the caption is late: `PosterS1.tsx` renders `lib/Film` with `only="V2S1"`, and Film passes `hookAtStart={!only}` to
`SkyCaptions` (`src/lib/Film.tsx:860`), so a single-shot render hides page 1 until its own pop time; the shipped
`Film2R` (no `only`) holds it from frame 0 (DIRECTION rule 9: "frame 0 shows the first spoken line"). REPORT's
"pixel-identical to `Film2R-V2S1`" is true; "v2's S1 as shipped" is true from S1 frame 5 to 354 only.

## 4. The after row, re-run on frames from the delivered clip
(pending)

## 5. check_banding --texture on the clip's pass-2 span
(pending)

## 6. Audio: loudness, true peak, A/V offset
(pending)

## 7. The platform rungs (1080p 3.5 Mb/s, 720p 1.5 Mb/s): the darks and the crown's twinkle
(pending)

## 8. The waivers (REPORT §4), judged
(pending)

## 9. MUST-FIX
(pending)

## 10. SHOULD
(pending)

## 11. Numbers I could not reproduce
(pending)
