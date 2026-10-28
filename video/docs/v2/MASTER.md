# v2r "One Small Window": the G7 master v1 and its checks (2026-10-28)

**Verdict: the final master is 39.083 s at 60 fps with the final mix. Its A/V lag is 0 ms, it measures -14.0 LUFS, and the
loop lands on frame 0. One check fails: gate_check does not find V2S7's cut within 1 frame of f1686. On the frames this is
the S6 -> S7 zoom's own motion, not a pop (section 3). check_light is OK at all 17 holds: 23.40 s is 0.012 H and 34.00 s is
0.003 H. One lint problem is new since the G5 assembly: the water lint finds the S1 canal's slivers starting at 0.30 s,
before the flood reaches the water at 0.65 s. They cannot be told apart at 360 px.** Frames, numbers and commands are
below. Section 5 lists what a viewer would still notice.

## 1. The render
- **File:** `video/deliverables/v2/v2r_G7_master_v1.mp4`, 25.5 MB (25,475,422 bytes).
- **Content:** Film2R, all 8 shots, 1080 x 1920, 60 fps, 2345 frames = 39.083 s.
- **Source:** `6e9d1f8`, a clean tree. That commit is fix pass B (REVIEW_1 MUSTs 3, 4 and 6 and the two light fixes). It sits on
  fix pass A (MUSTs 1, 2 and 5) and on the sound sync (`61eb1f7` and `5409bf5`).
- **Command** (from `video/`, with `TMPDIR` on the RAM disk; the root disk had 0.7 GB free, then 4.5 GB once the webpack cache
  entries older than an hour were pruned, as `scripts/ops/disk_janitor.sh` does):
  `TMPDIR=/dev/shm/m2/tmp node scripts/render-media.mjs Film2R deliverables/v2/v2r_G7_master_v1.mp4 --entry=src/entry-v2r-film.tsx --master --concurrency=3 --props='{"draftLabel":false}'`
- **Encode:** the master settings:
  - PNG frames, then BT.709 limited range (tagged).
  - x264 CRF 14, preset slow, aq-mode 3, yuv420p, H.264 High, 4.88 Mb/s.
  - GL: the default (Skia CPU raster), as for the G5 assembly. Draft label off.
- **Render time:** 18:21:12 to 18:31:32 UTC, **10 min 20 s**. That is a 3.6 s bundle plus 2345 frames in 615.9 s (0.26 s per
  frame at concurrency 3).
- **Audio:** `public/v2r/cues.json` points to `v2r/mix.wav`, the final mix from the sound sync (`61eb1f7`).
  - AAC LC, 48 kHz, stereo, 317 kb/s, 39.104 s long (the extra 21 ms is AAC frame padding).
  - **-14.0 LUFS** integrated, LRA 4.4 LU, true peak **-1.2 dBTP**.

## 2. The checks
| check | result | numbers |
|---|---|---|
| typecheck (`npx tsc --noEmit -p .`) | **PASS** | 0 errors |
| gate_check fps | **PASS** | 60 fps stream; the composition is 60 fps and 2345 frames |
| gate_check duration | **PASS** | 2345 frames = 39.083 s = ceil(voice 39.080 s x 60) |
| gate_check audio | **PASS** | AAC starts at 0.000 s and lasts 39.104 s, against 39.083 s of video |
| A/V sync (`av_lag.py`) | **PASS** | The voice (`public/v2/voice.wav`) inside the master lags **+0.0 ms** in each window, 0-12 / 12-24 / 26-38 s (r 0.97 / 0.98 / 0.98). Against `mix.wav`: 0.0 ms, r 1.00 in each window. |
| gate_check cuts | **FAIL 1, WARN 4** | **FAIL:** V2S7 (f1686): the nearest cut found is f1684. The 4 WARNs are below. Section 3. |
| gate_check carriers | **PASS** | every join names its carrier, with 0 plain cuts: V2S2 A, V2S3 B, V2S4 A, V2S5 A, V2S6 D, V2S7 A, V2S8 D |
| gate_check captions (safe area) | **PASS, 2 WARN** | 24 pages, 5 of them `@hide` (a board carries those words), all inside the band (y 290-600), the clip (280-570) and x 90-950. The WARNs are page 2's two lines, 25 and 29 characters (max ~20), as before. |
| loop seam (f2344 -> f0) | **PASS** | mean change 0.25 levels (RGB); 0.09 % of pixels change by more than 8 levels. The film's own last steps: f2342 -> f2343 7.09 %, f2343 -> f2344 2.15 %. f0 -> f1 is 0.01 %. |
| sky lint (`skyProblems`, 8 skies) | **PASS** | 8 clean. 1 note on S2_EVENING: the sun's warmth ry 216 -> 142 keeps it out of the caption band. |
| particle lint (`particleProblems`, 7 field sets) | **PASS, 1 WARN** | V2S1-V2S7 clean. V2S8 `s8leaves`: 1 of 3 leaves shrinks out 2.9 s after birth. The lint calls this "fine past the shot's end"; it is the same note as at G5. |
| float lint (`floatProblems`, 6 floats) | **PASS** | V2S1, S2, S3, S6, S7 and S8 clean |
| water lint (`waterProblems`, 8 specs) | **WARN 1 (new)** | S2 canal, S3 canal, S3 sliver, S4 canal, S4 near water, S5 Potomac and S5 channel are clean. **S1 canal:** "slivers born from 0.3 s, before the flood has crossed the water (0.65 s)", f18-f39. Section 3. |
| map contract (`contractProblems`) | **PASS** | 0 errors, 33 notes (key-read box margins, the right rail at 23.62), as after pass B |
| check_light A/B (17 stills) | **PASS 17 / 17** | every still OK; **23.40 s 0.012 H**, **34.00 s 0.003 H** (G5: 0.159 / 0.192 FAIL). No greyed shadow; the caption band spread is 0.0 everywhere. |
| check_depth (14 master stills) | **PASS** | 0 FAIL, 30 WARN (G5: 32). 29.0 and 31.0 pass clean. Five sheets were brought up to the picture first (section 6). |
| check_banding, open skies (43 region x time measures) | **PASS: 40 PASS, 3 WARN, 0 FAIL** | The 3 WARNs are isolated soft steps at caption highlight boxes (section 3). S6 at 25.0 s now passes as one region, because its caption page is hidden. |
| check_banding, reflected-sky water (11 measures) | **PASS** | 11 / 11: S1, S3, S4 canal, S4 near water and S5 Potomac |

## 3. Every FAIL and WARN, with frames
### gate_check FAIL: V2S7's cut (the S6 -> S7 push into SUN2, midpoint 28.10 s = f1686)
- **The report:** "1 scene start without a cut within 1 frame: V2S7 (frame 1686, d=35.9, nearest detected cut 1684)". The
  matching WARN says the push has no turn at f1686. Its zoom per frame over f1682-f1690 reads 1.14, 1.22, 1.37, 1.12, 1.00,
  0.99, 1.01, 1.01, 1.01: the measure loses track on the sun-only frames.
- **Measured:** the mean |grey| change per frame at 270 px climbs and falls with the zoom, with no single spike:
  - f1678-f1683, building: 4.9, 14.9, 21.3, 26.2, 33.6
  - **f1683 -> f1684: 38.6**, the peak
  - then 35.4, and 31.4 at f1685 -> f1686, the scene switch
  - then 21.7, 25.3, 23.3, 27.0, 25.7, 22.8, 20.1, 14.0, 7.6 and 1.2 (f1695 -> f1696)
- **Eye check of f1680-f1695 at 0.25 scale:**
  - The push is one smooth whip into the sun. S6's board swells and drops out of the bottom (f1684-f1685: "APRIL 2026 DE..."
    at about 3.7x).
  - f1686 is the 7x frame: only sun and sky.
  - S7 pulls out from f1687, its board's top rail rising from the bottom.
  - The caption "Google can't veto how it's used." holds still throughout. No pop.
- **Why it changed:** pass B lowered the boards (MUST 4), so the 7x frames hold only sun and sky. The S6 header crossing the
  frame is now the largest change, at f1684, 2 frames before the switch. The G5 assembly found this cut at f1685 (a WARN).
- **To clear it:** a gate_check model change, not a picture fix: for a push-through without a bridge, accept the motion's
  peak inside the push's half-window (c - dur/2 to c). It is not changed here.

### gate_check WARNs (none fails)
1. **V2S2:** the out-of-bridge cut is found at f369, not f368, within 1 frame. M's pane matches the plum bridge, as before.
2. **V2S6:** a hard-cut-like frame at **f1427**, inside the S5 -> S6 foreground wipe (23.62-23.98 s). It is the wiper's
   own motion: the joins strip's f1428-f1430 row shows the blossom tree crossing and S6 opening behind it. It was f1429 at
   G5.
3. **Extra cut-like frames inside shots:** f24 (0.40 s, d 2.3: W goes dark), f29 / f33 / f38 (0.48 / 0.55 / 0.63 s: the
   flood's steps) and f2337 (38.95 s, d 15.0: the un-build). Pass A reported the same set, with the un-build at f2336.
4. **Page 2's lines** (25 and 29 characters), as above.

### Lint problems
- **Water, S1 canal (new to the record):** the lint says the slivers are born from 0.30 s (f18), before the flood has crossed
  the water at 0.65 s (f39).
  - Fix pass A moved the flood to start at 0.44 s. Neither fix pass ran this lint; ASSEMBLY.md's run, before them, was clean.
  - At 360 px, f18-f36 show the same pale gold dashes under the door that frame 0 draws as the column's pale shape. No
    separate glint reads.
  - To clear it: start the slivers with the flood's arrival (0.65 s), or let them ride the flood.
- **Particles, V2S8 `s8leaves`:** as at G5 ("fine past the shot's end").

### check_depth (0 FAIL; WARNs per still)
| still | WARN | what |
|---|---|---|
| 3.0 | 5 | far-city ladder step (dE 10.1 vs 12.2); subject-to-+3 dE 9.5; far edges 0.87x; G1-G2 separation 10.0; bank texture |
| 5.4 | 5 | the same five (ladder 10.0 vs 11.9; dE 9.4; 0.83x; the copies' row 8.2; texture) |
| 7.0 | 3 | two setback ladder steps; towpath texture |
| 11.0 | 4 | setback ladder; the S2 board as a mass (10.2); SW4 one value 25 %; towpath texture |
| 13.5 | 1 | far contrast 0.59x |
| 17.0 | 3 | subject-to-+2 dE 2.9; the terrace backs busier (1.21x); her towpath's texture no finer far (3.9 vs 3.9 crossings / 100 px: new) |
| 19.9 | 3 | subject-to-+2 dE 3.7; DEC plate 10.0; APR plate in a thin ring along 35 % |
| 21.0 | 1 | ladder in the slot (15.0 vs 14.3) |
| 23.4 | 1 | far edges 0.58x |
| 25.0 | 1 | Pip as a mass, 8.9 |
| 29.0, 31.0 | 0 | PASS |
| 34.0 | 2 | the further row busier (1.18x); towpath texture (1.5 vs 1.5). G5 had 4 here. |
| 38.0 | 1 | W's pane one value 45 %. G5 had 2 here. |

### check_banding WARNs (each an isolated soft step; no staircase in the sky)
- **S2 band 0,270,1080,598 at 7.0 s:** 1 visible step (dE00 2.15) across the band. That is a caption box's side: the page
  "You'd think that's / one odd contract." is on, with its box.
- **S2, the same band at 11.0 s:** 1 visible step (dE00 1.98). This is the "scared" box's edge. G5 measured the same, at y 297.
- **S8 0,0,1080,540 at 34.0 s:** 1 visible step (dE00 2.27). This is the "can't" box's edge; G5 measured it at y 297.
- Every caption band is within its 1.5 budget: dL* 0.01-0.06.
- The S1 frame-0 WARNs from G5 are gone, because the frame-0 block is gone (MUST 1). The S6 25.0 s FAIL from G5 is gone too,
  because page 16 is hidden.

### check_light (all OK; distance of the brightest 5 % from the subject)
| stills | distance (H) |
|---|---|
| 0.5 / 3.0 / 5.3 | 0.035 / 0.051 / 0.057 |
| 7.0 / 11.0 | 0.042 / 0.018 |
| 13.5 / 17.0 | 0.102 / 0.102 |
| 19.9 / 21.0 | 0.000 / 0.000 |
| **23.4** | **0.012** (centred (652, 1127), just under the Pentagon's box; at G5 it was the floor, (701, 1409)) |
| 25.0 / 27.5 / 29.0 / 31.5 | 0.000 each |
| **34.0** | **0.003** (centred (614, 1100), at her feet; at G5 it was the SHE SAYS face, (201, 958)) |
| 36.0 / 38.0 | 0.000 each |

## 4. My look at 360 px
- **The first 3 s** (f0, 3, 6, 12, 18, 24, 30, 36, 42, 48, 60, 90, 120, 180):
  - **Frame 0:** paper and the flat pale world, with **"She quit Google." in ink at the house size**. No title block. The
    payoff is in words from the first frame.
  - **The draw-on:** the bold door frame draws from f12, and W's frame closes by f18. W's pane goes plum at f24, the first
    colour after the sun. The flood runs from the sun at f27-f48, and the box on "quit" lands with it (f30). Everything is
    in colour by ~0.8 s.
  - Her own strokes (f1-f12) are small at this size, as pass A noted: she is ~51 px tall. The door, W and the flood carry the
    event.
  - Page 2 arrives at 2.0 s, and the row of copies grows at the door by 3.0 s. Nothing in these frames is still.
- **The payoff** (36.4-38.7 s):
  - "But in her words," leaves at 36.54. The band then stays empty while the board writes "talking about facts / is not
    criticising" in step with the voice (36.6-38.0).
  - W is lit with her in it, and the sun sits clear over the board.
  - The quote keeps the BBC's British spelling; the captions use US spelling ("criticize").
- **The seam** (38.82-39.08 s, f0, f1):
  - S8 un-builds in its last frames. f2342 shows a large sky disc closing over the pale S1, and f2342-f2343 keep two long
    diagonal strokes, S8's last lines. Page 1 is back at f2343.
  - f2344 and f0 match (0.25 levels). The pen starts on her at f1. No frame from f2342 to f0 shows two suns.
  - At speed it reads as the film folding back into the opening. No pop.

## 5. What a viewer would still notice
Most visible first. None of these is a FAIL, and none was among REVIEW_1's MUSTs.
1. **V2S5, 21.0-22.0 s (f1260-f1320):** the terrace trees' cast shadows are a heavy dark-mauve mass over the lower half of the
   frame. This was the G5 eye-check's first item, and it is unchanged.
2. **The blank boards wait for the voice.**
   - SHE SAYS stands blank, dimmed one step, for 33.2-36.6 s while she walks home.
   - Google's board is blank, at half that step, for 28.2-29.7 s.
   - This is MUST 3 working as designed (the board, not a caption, carries those words), but the empty faces show.
3. **Small things:**
   - 22.0 s: a passer-by's head is cut by the bottom edge.
   - 15.0-15.5 s: S4's lower edge is a flat teal band during the pull-out.
   - 22.43-23.08 s: the plaque's "The Pentagon" and the caption's "the Pentagon" are on screen together (pass B kept this).
   - The nearest S8 copy stands mostly behind her board's right stile (pass B's open item).

## 6. The sheets, and what changed in the checks' inputs
- **The contact sheet, in two halves:** one frame every 0.5 s at 0.25 scale, 8 per row.
  - `video/deliverables/v2/master/v2r_G7_master_v1_sheet_1.jpg`: 0.0-19.5 s, 40 frames, 958 KB.
  - `video/deliverables/v2/master/v2r_G7_master_v1_sheet_2.jpg`: 20.0-39.0 s, 39 frames, 829 KB.
- **The joins:** `video/deliverables/v2/master/v2r_G7_master_v1_joins.jpg`, 0.3 scale, 857 KB.
  - Each join gets 3 frames: c - 0.1 s / c / c + 0.1 s for the pushes and wipes, and f778 / f779 / f780 for the matchcut.
  - Extra rows: "J5 detail" (f1428-f1430) and "J6 cut" (f1685 / f1686 / f1687, the push's 3.7x / 7x / 4.1x).
  - The loop row is 38.90 s / f2344 / f0.
- **The depth sheets were brought up to the picture** (`scripts/qa/depth_sheets/`). Each sheet is part of its check, and
  pass B moved what these boxed:
  - `v2_s6`, `v2_s7`, `v2_s7_t29.0`, `v2_s8_t38`: the boards' frame tops are now at 780 (MUST 4), so the boards' top edges,
    the subject boxes, the edge ROIs and the boards' sizes moved down with them. S7 at 29.0 s is scaled by its push
    (top 784.8). S8's face is 150-630 x 800-1220.
  - `v2_s5_23.4`: the plaque's plate was refitted when its body line was cut. Measured on the master, its dark panel is now
    447-764 x 1146-1238, so the rect is 441,1144,769,1240. With the old rect, the plaque WARNed (8.2, a one-value run of
    128 px); with the new one, 23.4 has 1 WARN.

## 7. Reproduce (from `video/`)
- Everything else runs as `ASSEMBLY.md` section 6 describes, with `M=deliverables/v2/v2r_G7_master_v1.mp4`:
  - gate_check: BUILD section 5's command, without `--frame0`.
  - `av_lag.py`, ebur128, both lint bundles (`assembly_lints.ts`, `water_swaps_qa.ts`) and `master_sheets.py`.
  - The banding regions are the same; S6 at 25.0 s also runs as the whole region 0,0,1080,565.
- **check_light:**
  - Render the A/B PNG stills in one call each, at the default GL:
    `node scripts/render-frames.mjs Film2R <dir> 0.5,3.0,...,38.0 --entry=src/entry-v2r-film.tsx --concurrency=2 --props='{"draftLabel":false}'`,
    then again with `"lightOff":true`.
  - Run `check_light.py <off> <on> --subject <box> --sky '#BCDCCF' --exclude 0,0,1080,<sky bottom>`. The sky bottom is 600
    for S1, S6 and S7; 700 for S2 and S3; 745 for S4; 750 for S5; 610 for S8.
  - The subject is the depth sheet's tier-A box:

    | still | subject box |
    |---|---|
    | 0.5, 3.0 | 451,914,626,1079 |
    | 5.3 | 44,924,536,1096 |
    | 7.0 | 266,701,404,869 |
    | 11.0 | 130,701,520,1010 |
    | 13.5 | 269,703,401,867 |
    | 17.0 | 682,894,764,1078 |
    | 19.9 | 110,755,764,1078 |
    | 21.0 | 470,903,785,1196 |
    | 23.4 | 322,846,1080,1104 (the Pentagon, as at G5 and in pass B) |
    | 25.0, 27.5 | 123,779,683,1252 |
    | 29.0 | 118,785,676,1242 |
    | 31.5 | 113,779,687,1249 |
    | 34.0 | 570,934,634,1094 |
    | 36.0, 38.0 | 150,615,935,1220 (the board and W, from the landing at 35.60) |
- **The seam numbers:** decode f2342-f2344, f0 and f1 with `master_sheets.py frames`. Then take the mean |RGB| difference,
  and the share of pixels whose largest channel difference is over 8 levels.

## 7. Orchestrator's ruling on the gate_check FAIL (2026-10-28)
The V2S7 cut is found at f1684, not f1686: checked by eye on f1680-f1688 (the S6 -> S7 push into the sun). f1684 is the S6 board's top
edge and heading leaving the bottom of the frame during one continuous zoom; f1685 is sun and sky; f1686 S7 starts on the sun and its
board rises from the bottom as it pulls out. No pop: the detector's peak sits on the exit, two frames before the declared boundary.
WAIVED for this master. Tooling backlog: gate_check should take a push-through join's declared window (or +-3 frames) instead of +-1.
