# v2r "One Small Window": the G5 assembly v1 and its gate checks (2026-10-28)

**Verdict: the whole film plays as one master. The scripted gate check passes (0 FAIL, 4 WARN). There are two real FAILs, both
from check_light: 23.40 s (f1404, new) and 34.00 s (f2040, already known). One banding FAIL comes from how the region was
measured, not from the sky: re-measured around the caption box, it passes.** Details, frame numbers and commands are
below. The eye-check findings from the sheets are in section 4.

## 1. The render
- **File:** `video/deliverables/v2/v2r_G5_assembly_v1.mp4`, 25.8 MB (25,846,968 bytes).
- **Content:** Film2R, all 8 shots, 1080 x 1920, 60 fps, 2345 frames = 39.083 s.
- **Source:** rendered from `8a723ce`. It holds the same v2r tree as `d3c669d` (the water swaps); the only extra change
  is the v4 README.
- **Command** (from `video/`, `TMPDIR` on the RAM disk because the root disk had 1.4 GB free):
  `TMPDIR=/dev/shm/asm/tmp node scripts/render-media.mjs Film2R deliverables/v2/v2r_G5_assembly_v1.mp4 --entry=src/entry-v2r-film.tsx --master --concurrency=3 --props='{"draftLabel":false}'`
- **Encode:** the master settings: PNG frames, BT.709 limited range (tagged), x264 CRF 14, preset slow, aq-mode 3,
  yuv420p, H.264 High at 4.96 Mb/s.
  - GL: render-media's default (Skia CPU raster), as in this step's command and in the water docs' S1 byte-identical
    renders (DIAGNOSIS section 4). It is not BUILD.md section 4's `GL=angle`.
  - Draft label: off.
- **Render time:** 16:00:51 to 16:11:25 UTC, **10 min 34 s** wall. That is a 3.8 s bundle plus 2345 frames in 629.6 s
  (0.27 s per frame at concurrency 3). The 4-core box rendered S1-S2 at about 0.45 s per frame and the later shots
  faster.
- **Audio: the current sound mix**, not the voice alone. `public/v2r/cues.json` sets `{"audio": "v2r/mix.wav"}`, the
  mastered mix of voice, bed and every cue from `audio/v2r/premix.py`.
  - The master's audio matches `mix.wav` (r 1.00, lag 0 ms).
  - AAC LC, 48 kHz, stereo, 317 kb/s, 39.104 s long. The extra 21 ms is the AAC frame padding.
  - Loudness: **-14.0 LUFS** integrated, LRA 4.5 LU, true peak **-1.2 dBFS**.

## 2. The checks
| check | result | numbers |
|---|---|---|
| typecheck (`npx tsc --noEmit -p .`) | **PASS** | 0 errors, including the new `src/v2r/film/assembly_lints.ts` |
| gate_check fps | **PASS** | 60 fps stream; the composition is 60 fps and 2345 frames |
| gate_check duration | **PASS** | 2345 frames = 39.083 s = ceil(voice 39.080 s x 60) |
| gate_check audio / A/V sync | **PASS** | AAC starts at 0.000 s and lasts 39.104 s against 39.083 s of video (inside the +-2 frame limit) |
| A/V sync, the voice inside the mix (`scripts/qa/av_lag.py`) | **PASS** | `public/v2/voice.wav` has lag **0.0 ms** in each window, 0-12 / 12-24 / 26-38 s (r 0.97 / 0.98 / 0.98: no offset, no drift) |
| gate_check cuts | **PASS, 4 WARN** | 7 cuts at their scene starts (+-1 frame); the 2 foreground wipes have no cut; 5 cut-like frames fall inside transition windows, as expected. The 4 WARNs follow this table. |
| gate_check carriers / joins | **PASS** | every join names its carrier, with 0 plain cuts: V2S2 A, V2S3 B, V2S4 A, V2S5 A, V2S6 D, V2S7 A, V2S8 D |
| gate_check captions (safe area) | **PASS** | 27 pages inside the band (y 290-600), the clip (280-570) and x 90-950. The frame-0 words, the lowered page 1 (5 pages hidden under the block) and the source line are all checked with FILM2R_FRAME0's geometry. |
| loop seam (f2344 -> f0) | **PASS** | mean change 0.34 levels; 0.30 % of pixels change by more than 8 levels (the film's own step f2343 -> f2344 is 2.19 %) |
| sky lint (`skyProblems`, 8 skies) | **PASS** | 8 clean, 1 note on S2_EVENING: the sun's warmth ry 216 -> 142 keeps it out of the caption band |
| particle lint (`particleProblems`, 7 field sets) | **PASS, 1 WARN** | V2S1-V2S7 clean (V2S6 has no lib/particles field). V2S8 `s8leaves`: 1 of 3 leaves shrinks out 2.9 s after birth. The lint marks this "fine past the shot's end", and L6 already noted it. |
| float lint (`floatProblems`, 6 floats) | **PASS** | V2S1, S2, S3, S6, S7 and S8 all clean (V2S4 and V2S5 have no float) |
| water lint (`waterProblems`, 8 specs) | **PASS** | S1 canal, S2 canal, S3 canal and sliver, S4 canal and near water, S5 Potomac and channel: all clean |
| map contract (`contractProblems`) | **PASS** | 0 errors, 33 notes (key-read box margins, the right rail at 23.62) |
| check_light A/B (17 stills) | **15 OK, 2 FAIL** | FAIL **f1404 (23.40 s)** and **f2040 (34.00 s)**: section 3 |
| check_depth (14 master stills) | **PASS** | 0 FAIL, 32 WARN; S7 at 29.0 and 31.0 pass clean (section 3) |
| check_banding, open skies (40 region x time measures on the master) | **35 PASS, 4 WARN, 1 FAIL as run** | The 1 FAIL is S6 at 25.0 s, caused by the caption box. Re-measured around the box: PASS / PASS / WARN. Section 3. |
| check_banding, reflected-sky water (11 measures) | **PASS** | S1, S3, S4 canal, S4 near water, S5 Potomac; S2 not applicable (section 3) |

Not run in this step (not on its list): CRAFT's line measure (strokes, near-miss ends), density, and the G5 exit diff
against the G3 board.

## 3. Every FAIL and WARN, with frames
### check_light
- **FAIL f1404 (23.40 s, V2S5, the Pentagon):**
  - The brightest 5 % (L* >= 89.0) is centred at (701, 1409), **0.159 H** from the subject box (limit 0.15). The box
    is 322,846,1080,1104: the Pentagon plus the plaque, the depth sheet's tier-A union.
  - The bright pixels sit on the lit terrace paving, below the subject.
  - L4 measured 0.128 H (OK) here. The likely cause is integrator item 3 (`39f85e8`): the Plaque's `panel="dark"`
    (L* 36) took the pale plate out of the subject box, so the brightest pixels moved to the floor. That commit
    re-ran check_depth, not check_light.
  - Fix options: let the Pentagon's lit facade or the plaque's letters carry the top values, or take the near paving's
    lit zone down one step at the landing.
- **FAIL f2040 (34.00 s, V2S8, her walk home), already known:**
  - The brightest 5 % (L* >= 95.2) is centred at (201, 958), **0.192 H** from her box (570,934,634,1094).
  - The bright pixels are the SHE SAYS board's cream face at full weight while she is the subject. This is
    ASSEMBLY_TODO's S8 SHOULD ("board at full weight in her walk").
- **OK, with the distance from the subject:**

  | stills | distance (H) |
  |---|---|
  | 0.5 / 3.0 / 5.3 | 0.033 / 0.051 / 0.057 |
  | 7.0 / 11.0 | 0.042 / 0.017 |
  | 13.5 | 0.102 |
  | 17.0 / 19.9 | 0.081 / 0.000 |
  | 21.0 | 0.000 |
  | 25.0 / 27.5 / 29.0 / 31.5 | 0.000 each |
  | 36.0 / 38.0 | 0.000 each |

- No still has a greyed-shadow FAIL. The caption band takes one value everywhere (spread 0.0).

### gate_check cut WARNs (none fails)
1. **V2S2:** the out-of-bridge cut is at f370, not f369. Known: the dark window matches the plum bridge.
2. **V2S7:** the cut is at f1685, not f1686, still within 1 frame.
3. **V2S6:** a cut-like frame at **f1429**, inside the S5 -> S6 foreground wipe (23.62-23.98).
   - Eye check of f1426-f1431 (the joins sheet's "J5 detail" row holds f1428-f1430): no pop. The blossom tree
     crosses and S6 opens behind it.
   - Measured: 16-17 % of the pixels change on every frame from f1424 to f1432. f1428 -> f1429 averages 15.1 levels
     against 14.4 and 13.8 on either side, a small peak in the wiper's own motion.
4. **Extra cut-like frames:** f24 (0.40 s, d 2.1, the draw-on) and f2336 (38.93 s, d 15.8, the un-build). Both are
   known; the 2026-10-27 smoke run also showed 9, 14, 1248 and 2330, which are gone now.

### check_depth (0 FAIL; WARN count per still)
| still | WARN | what |
|---|---|---|
| 3.0 | 5 | far-city ladder step; subject-to-+3 step dE 9.5; far edges busy (0.88x); G1-G2 separation 9.8; bank texture |
| 5.4 | 5 | the same five |
| 7.0 | 3 | setback ladder steps; towpath texture |
| 11.0 | 4 | ladder; the board as a mass (10.1); SW4 one value 25 %; texture |
| 13.5 | 1 | far contrast 0.59x |
| 17.0 | 2 | subject-to-+2 dE 2.9; the terrace backs busier (1.21x) |
| 19.9 | 3 | subject-to-+2 dE 3.6; DEC plate 9.8; APR plate ring 30 % |
| 21.0 | 1 | ladder in the slot |
| 23.4 | 1 | far edges 0.57x |
| 25.0 | 1 | Pip as a mass, 9.2 |
| 29.0, 31.0 | 0 | PASS |
| 34.0 | 4 | the far rows busier (1.28x / 1.18x); far contrast 1.11x; texture |
| 38.0 | 2 | far contrast 0.74x; W's pane one value 46 % |

Sheets: `scripts/qa/depth_sheets/v2_s1_t3.0`, `v2_s1` (5.4), `v2_s2_t7.0`, `v2_s2` (11.0), `v2_s3`, `v2_s4`,
`v2_s4_hold`, `v2_s5_21.0`, `v2_s5_23.4`, `v2_s6`, `v2_s7_t29.0`, `v2_s7` (31.0), `v2_s8_t34`, `v2_s8_t38`.

### check_banding (decoded from the master at 16 bits)
- **FAIL as run: S6 at 25.0 s, region 0,0,1080,565.** The check reads "8 near-JND steps in one wide strip; band dL*
  6.03".
  - The cause is the caption. The second line's highlight box, "government purpose", covers x ~151-829 of rows
    420-530, which is 63 % of each row. The row median becomes the box, so the steps sit on the box's edges (x 115, 172,
    926).
  - Re-measured around the box:
    - 0,0,1080,290: **PASS**
    - 0,290,140,565: **PASS**, band dL* 0.27
    - 840,290,1080,565: **WARN**, 1 isolated step at dE00 1.88; band dL* 0.52
  - The same sky passes at 27.5 s.
  - **Not a sky defect.**
- **WARN (isolated soft contours):**
  - **S1 band 0,270,1080,560:** at 0.5 s, 1 visible step at y 467 (dE00 1.53); at 3.0 s, 3 weak steps. Both are in the
    frame-0 caption lines. WATER.md reports the same WARN (v5 too).
  - **S2 band 0,270,1080,598 at 11.0 s:** 1 visible step at **y 297** (dE00 2.01). That is the top edge of the
    "scared" highlight box; L2 measured 1.51 at the same place.
  - **S8 0,0,1080,540 at 34.0 s:** 1 visible step at **y 297** (dE00 2.22). That is the top edge of the "can't" box.
- **PASS:**

  | shot | regions and times |
  |---|---|
  | S1 | west gap, zenith, left, right; at 0.5, 3.0 and 5.3 s |
  | S2 | left of the cloud and above it; 7.0 and 11.0 s, plus the band at 7.0 s |
  | S3 | 13.5 s |
  | S4 | zenith and band at 17.0 / 19.9 s; the gap at 19.9 s |
  | S5 | above the clouds and the band at 21.0 s; the sky at 23.4 s |
  | S7 | 29.0 / 31.5 s |
  | S8 | 38.0 s; the two strips beside SUN8 at 34.0 / 38.0 s |

  Every caption band measured is within its budget of 1.5: dL* 0.01-0.21, and 0.27 / 0.52 in S6's side strips at
  25.0 s.
- **Reflected-sky water: PASS.**
  - Regions from the water docs:
    - S1 950,1249,1057,1265 at 0.5 / 3.0 / 5.3 s
    - S3 0,1128,1080,1148 at 13.5 s
    - S4 canal 650,1209,1080,1222 and near water 0,1760,1080,1910 at 17.0 / 17.97 / 19.9 s
    - S5 Potomac 340,812,760,823 at 23.4 s
  - The canal and Potomac regions are thin open stretches of 11-20 rows, so a PASS there only means no step inside
    them. The S4 near water is a flat body.
  - S2 is not applicable: the wing's mirror covers the whole depth (SWAPS.md).

## 4. Eye check: the whole-film sheets
These are the worst three spots on the sheets, most visible first. They are what the G6 review should start from.
1. **V2S5, 20.70-22.0 s (f1242-f1320; the sheet's 21.0 / 21.5 s).**
   - The terrace's tree cast shadows read as heavy dark-plum blobs over the lower half of the frame, in the first
     second after the push into SUN1.
   - This is the heaviest shadow mass in the film, against DIRECTION's "gentle light and shadow". L4 had already asked
     whether it reads heavy.
2. **V2S6 / V2S7, 23.9-32.9 s (f1434-f1975).**
   - The sun disc is parked tangent on the board's top-left corner and reads as a ball sitting on the board (ASSEMBLY_TODO's open question).
   - At the S6 -> S7 push into SUN2 (f1680-f1692; the cut is f1685/f1686) the 7x zoom puts the board's dark top rail
     under the disc as a black bar.
3. **V2S8, 33.16-36.5 s (f1990-f2190).**
   - The SHE SAYS board is a blank cream panel at full weight while she walks home. It is the brightest thing in the
     frame (check_light FAIL at 34.0) until the quote pops at 36.54.
   - Google's board in V2S7 is blank in the same way for 28.2-29.9 s (f1692-f1795), before "follows its AI principles".

Smaller things, for the same review:
- The lower 15 % of V2S4's first half-second (15.0-15.5 s) is a flat teal band.
- At 22.0 s (f1320) a passer-by's head is cut by the bottom edge.
- The joins all play with their carriers and Pip on both sides (joins sheet). The loop lands on frame 0 seamlessly.

## 5. The sheets
- **The contact sheet, in two halves** (one file would be 1.04 MB at q 50); one frame every 0.5 s at 0.25 scale,
  time-stamped (s and frame), 8 per row:
  - `video/deliverables/v2/assembly/v2r_G5_assembly_v1_sheet_1.jpg`: 0.0-19.5 s, 40 frames, 968 KB
  - `video/deliverables/v2/assembly/v2r_G5_assembly_v1_sheet_2.jpg`: 20.0-39.0 s, 39 frames, 880 KB
- **The joins:** `video/deliverables/v2/assembly/v2r_G5_assembly_v1_joins.jpg`, 0.3 scale, 865 KB.
  - Each join gets 3 frames: c - 0.1 s / c / c + 0.1 s for the pushes and wipes, f-1 / f / f+1 for the matchcut.
  - The loop row is 38.90 s / f2344 / f0.
  - One extra row shows f1428-f1430, the gate check's f1429.

## 6. Reproduce (from `video/`)
```bash
M=deliverables/v2/v2r_G5_assembly_v1.mp4
python3 -I scripts/qa/gate_check.py --mp4 $M ...                 # BUILD.md section 5's command, unchanged
python3 -I scripts/qa/av_lag.py $M public/v2/voice.wav           # the voice inside the mix (lag per window)
ffmpeg -nostats -i $M -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:"
npx esbuild src/v2r/film/assembly_lints.ts --bundle --platform=node --format=cjs --jsx=automatic --loader:.tsx=tsx --outfile=/tmp/al.js --log-level=error && node /tmp/al.js
npx esbuild src/v2r/scenes/water_swaps_qa.ts --bundle --platform=node --format=cjs --jsx=automatic --loader:.tsx=tsx --outfile=/tmp/wq.js --log-level=error && node /tmp/wq.js
python3 -I scripts/qa/master_sheets.py sheet $M sheet_1.jpg --every 0.5 --scale 0.25 --cols 8 --from 0 --to 19.5
python3 -I scripts/qa/master_sheets.py strip $M joins.jpg --scale 0.3 --rows "J1=6.00,6.10,6.20;...;LOOP=38.90,f2344,f0"
python3 -I scripts/qa/master_sheets.py frames $M /dev/shm/mf 3.0,5.4,7.0   # full-size PNGs for check_depth
```
- **check_light:** A/B PNG stills, default GL.
  - Render: `node scripts/render-frames.mjs Film2R <dir> <t> --entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`,
    and the same with `"lightOff":true`.
  - Check: `--sky '#BCDCCF' --exclude 0,0,1080,<sky bottom>`. The sky bottom is 600 for S1, S6 and S7, 700 for S2
    and S3, 745 for S4, 750 for S5 and 610 for S8.
  - Subject: the depth sheet's tier-A box at that time.
- **check_banding open-sky regions** (master, `--times` as listed). They come from the sky critic, the lanes, and a
  per-row median test on the master frames (scratch; it found these non-sky blobs: S1's leaves and its cloud at x 641-1002, y 184-246;
  S2's cloud at x 637-1017, y 148-262; S5's clouds at y 97-220; the suns' tops at y 573-585).

  | shot | regions (times) |
  |---|---|
  | S1 | 0,560,250,712 · 400,0,1080,170 · 0,270,1080,560 · 0,262,160,700 · 1005,0,1080,590 (0.5, 3.0, 5.3) |
  | S2 | 0,0,620,600 · 0,0,1080,140 · 0,270,1080,598 (7.0, 11.0) |
  | S3 | 0,0,1080,595 (13.5) |
  | S4 | 0,0,1080,280 · 0,280,1080,575 (17.0, 19.9) · 322,604,424,730 (19.9) |
  | S5 | 0,0,1080,90 · 0,225,1080,570 (21.0) · 0,0,1080,580 (23.4) |
  | S6 | 0,0,1080,290 · 0,290,140,565 · 840,290,1080,565 (25.0: clear of the caption box) · 0,0,1080,565 (27.5) |
  | S7 | 0,0,1080,565 (29.0, 31.5) |
  | S8 | 0,0,1080,540 · 0,540,380,598 · 460,540,1080,598 (34.0, 38.0) |
