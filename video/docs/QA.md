# QA: dead frames, frame checks, contact sheets, beat sync (QA lane)

> **v1-era (banner, 2026-10-27).** Keep it for the tools and what they measure. Its gate is v1's: the density score's
> ">= 5 events/s" target and a scene FAIL from events or dead runs are retired as gates (`docs/look/DIRECTION.md`,
> Retired: events/s and the meters are information). A new film's gate is `scripts/qa/gate_check.py`
> (`docs/G5_BLOCKING.md` §7), with `density.py` as information (`docs/look/LIFE_AND_DENSITY.md` §9), CRAFT's checks
> (`docs/look/CRAFT.md`) and `framecheck.py`'s UI zones (`docs/look/LAYOUT.md` §1).

Tools in `scripts/qa/` (Python 3.13 + OpenCV/numpy/scipy/matplotlib, ImageMagick, Remotion). They answer four
questions about a render, and the **QA gate** at the end of this page turns the answers into PASS/FAIL:

1. **Is every scene alive?** `deadframes.py`: per-frame "life" with the camera compensated, dead runs, motion events,
   a 0-10 life score per scene and a bar chart (green alive, red dead).
2. **Is any frame broken?** `framecheck.py`: blank frames, 1-2 frame flashes/glitches, caption legibility, platform UI zones.
3. **What does it look like frame by frame?** `sheets.sh`: labeled 6x4 contact sheets of every n-th frame.
4. **Do the cuts sit on the music?** `beatsync.py`: cut offsets from the beat grid, and a tempo map that bends the
   music so its beats land on the cuts (`audio/tempo_map_proposal.json`).

`run_all.sh <CompId>` runs everything on a fresh half-scale render and writes one report folder. It and `report.py` are
v1's per-scene gate runner, archived since 2026-10-29 in `archive/v1/scripts/qa/`: they run at the
`v1-final` commit (`76c166c1`).

## Quick start

```bash
# run_all.sh (the next 3 lines) is v1's, archived in archive/v1/scripts/qa/: run it at the v1-final commit (76c166c1)
scripts/qa/run_all.sh S05                         # one scene: render all its frames at 0.5x, check, report, gate
scripts/qa/run_all.sh Main                        # the film (+ beat sync); ~5 min on the shared box
scripts/qa/run_all.sh KitDemo --out=out/qa/kit    # any composition (dev comps: scenes = detected cuts)
scripts/qa/sheets.sh S05 0 4 2 out/qa/s05_sheets  # every 2nd frame of S05, 0-4 s, in 6x4 sheets
python3 scripts/qa/beatsync.py                    # current cut offsets vs audio/music_cinematic.mid
python3 scripts/qa/beatsync.py --fit-tempo        # + tempo map proposal -> audio/tempo_map_proposal.json
python3 scripts/qa/selftest.py                    # synthetic sanity tests of the detectors (~30 s)
python3 scripts/qa/calibrate.py                   # re-run the calibration on both reference videos (~6 min)
```

Every tool takes a frames directory (PNG/JPG, natural sort) **or** a video file, so references, renders and exports
are measured the same way. All measurements are in **canvas px of a 1080-wide frame** whatever the input size
(half-scale renders, reference 2 at 720x1280, reference 1 at 1080x1350). The machine is shared: renders default to
`--scale=0.5 --concurrency=2`; each Python tool uses one core.

`run_all.sh` output (v1's, archived in `archive/v1/scripts/qa/`; `out/qa/<CompId>-<timestamp>/` or `--out`):

| file | what |
|---|---|
| `REPORT.md` | the gate verdict + per-scene table + every issue (start here) |
| `deadframes.png` / `.md` / `.json` / `_frames.csv` | life chart, report, data, per-frame series (energy, camera, cut signals) |
| `framecheck.md` / `.json` / `framecheck_frames.png` | issues with frame numbers + a contact sheet of the flagged frames |
| `beatsync/beatsync.md`, `tempo_map_proposal.json`, `music_retimed.mid` | Main only: offsets, fitted tempo map, the MIDI with it |
| `beatsync_detected/` | Main only: the same offsets for the cuts detected in the pixels (cross-check of scenes.json) |

Options: `--t0= --t1=` (a time range), `--keep-frames` (keep the PNGs in `<out>/frames`), `--allow=FILE`.

---

## 1. deadframes.py: is anything moving?

```
python3 scripts/qa/deadframes.py <frames_dir_or_video> [--fps 30] [--scenes src/data/scenes.json|auto|cuts|none]
       [--t0 0] [--only S05] [--out dir] [--caption-band 280,600] [--dead-limit 0.40] [--allow scripts/qa/holds.json]
```
`--scenes auto` read v1's `src/data/scenes.json`, archived since 2026-10-29: pass `--scenes src/<film>/film/scenes.json`.

**How a frame is measured** (the user's rule: *a frame is dead if nothing on screen moves*, and *camera drift alone
does NOT count as life*):

1. **Camera.** Shi-Tomasi corners outside the caption band are tracked into the next frame with pyramidal
   Lucas-Kanade (forward-backward checked, < 0.3 px), and a RANSAC similarity (scale, rotation, shift; 0.35 px
   threshold) is fitted. A camera hypothesis must be *global* (inliers spread over >= 40 % of the width and 25 % of
   the height), so a big moving object is never mistaken for the camera. A second similarity is fitted to the
   remaining tracks when a wide set of them moves differently but in a camera-like way (multiplane parallax: same
   zoom direction or same pan direction). ORB matching was tried first and is too coarse: it reads a 0.14 %/frame
   push-in as 0.02 %.
2. **Tolerant differencing.** A pixel *changed* when no hypothesis explains it, neither a static camera nor any
   camera model: `|cur - warp(prev)| > tau0 + delta * step` (max over RGB), where `step` is the local step height
   (3x3 morphological gradient) and `delta` the allowed sub-pixel misregistration (0 for the static camera, 0.45 px
   for camera models). Pixels the camera reveals at the frame edge are not measured.
3. **Noise.** Changed blobs under 24 canvas px^2 are dropped (codec noise, anti-aliasing).
4. **Caption band** (default canvas y 280-600; `skyCaption` clips at 280-570) is measured separately: caption scrolls
   and highlight wipes are reported (grey line in the chart, `caption_events`, `caption_only_frames`) but never make a
   frame alive.
5. **Life energy** = changed canvas px^2 outside the band. **Dead frame** = life < **2,000 px^2** (about 0.1 % of
   the frame, a 45x45 px patch), unless SLOW, STEADY motion keeps it alive: the last 4 frames each changed a little
   (250-2,000 px^2) and the camera-compensated change over those 4 frames reaches 3,000 px^2 (a pipe drawing on, a
   slow slide). A one-off pop followed by stillness, idle jitter or a 10-30 px/s drift do not qualify.
6. **Dead run** = consecutive dead frames inside one scene; **flagged** when longer than **0.40 s** (12 frames), the
   reference's own maximum, unless allow-listed or inside a transition window (camera-continuous, push-through,
   foreground-wipe and un-build windows from `src/data/scenes.json` (v1's, archived since 2026-10-29: pass
   `--scenes src/<film>/film/scenes.json`), mirroring `src/lib/Film.tsx`: a transition counts as one long event, as in
   motion_spec 9). Dead frames inside a transition are drawn blue ("excused").
7. **Events** = space-time change blobs: each frame, changed pixels within 12 px of each other form a blob; a blob
   continues the chain whose footprint of the last 2 frames it overlaps (within 4 px), otherwise it starts a new chain;
   chains never merge (a new pop next to an ongoing motion is its own event; a walk cycle's 1-frame pause is not).
   An event is a chain of >= 2,000 canvas px^2 x frames, counted at its onset.

**Life score** (transparent, 0-10, per scene):

```
score = 10 x (0.45 D + 0.35 V + 0.20 G)
  D (density)  = min(1, events per second / 5)                 target >= 5 events/s (motion_spec 9)
  V (coverage) = 1 - frames in flagged dead runs / scene frames
  G (gap)      = 1 if the longest gap between event onsets (scene edges included) <= 1.0 s, falling linearly to 0 at 2.0 s
PASS = score >= 8.0 and no flagged dead run
```

So 4 events/s, no dead run and every gap under a second scores 9.1; one 1-second hold in a 4-second scene costs
0.35 x 0.25 = 0.9 points *and* fails the gate by itself; a scene that is static except for the camera scores under 1.

**Scenes.** `--scenes auto` (default) uses `src/data/scenes.json` when the clip is the film (or `--t0` places a
per-scene composition on the film timeline), otherwise the cuts detected in the pixels (edge newness after camera
compensation >= 0.5 and >= 12 % of the frame changed, merged within 0.4 s; segments under 1 s join a neighbour).
`--scenes auto` read v1's `src/data/scenes.json`, archived since 2026-10-29: pass `--scenes src/<film>/film/scenes.json`
(deadframes, framecheck).
`--only S05 --t0 23.671` scores one scene composition. Reference scene lists live in `scripts/qa/calib/`.

**Allow-list** (`scripts/qa/holds.json`, read by run_all): deliberate holds, e.g. the beat after "switched themselves
off". `{"scene": "S01", "t0": 3.2, "t1": 4.6, "why": "lights-out beat"}` (scene-local s) or `{"t0": .., "t1": ..}`
(film s). A dead run fully inside a window is reported as allow-listed and not flagged. Every hold needs a why and the
creative lead's OK; the default list is empty.

### Reading the chart (`deadframes.png`)

One panel per scene (small multiples, 2 columns for more than 3 scenes). x = frame inside the scene, y = life energy
(log). **Green** bars = alive, **red** = dead, **blue** = dead but inside a transition (excused), **pink band** = a
flagged dead run (its length and frame range are printed in red, e.g. `46 dead f (f90-f135)`). Dashed line = the dead
threshold. Ticks along the top = event onsets (sparse ticks = few new things). Grey line = caption-band change.
Header: `S01  7.6/10 x FAIL`, then events/s, the longest gap between events, dead frames, dead runs over the limit.
Typical pictures: a **pink slab with red stubs** = only the camera (or nothing) moves; **red/green alternating near
the dashed line** = the scene lives on slow idle motion only (Main's S02 today); **dense ticks and tall green** = builds.

---

## 2. framecheck.py: is any frame broken?

```
python3 scripts/qa/framecheck.py <frames_dir_or_video> [--fps 30] [--out dir] [--scenes ...] [--t0 0]
       [--caption-band 280,600] [--captions auto|none|file] [--no-ui-zones] [--expect-caption]
```

| check | severity | rule |
|---|---|---|
| blank | ERROR | luma std < 4 or one colour >= 98 % of the frame. <= 3 such frames **between two different shots** at a cut = a deliberate bridge (push-through colour, white match frame): WARNING. A blank frame 0 is always an error (the hook must show) |
| flash | ERROR | 1 or 2 frames that differ from both neighbours (>= 2 % of pixels, raw difference > 40) while the neighbours agree (difference <= 35 % of that), not at a cut |
| caption contrast | ERROR > 5 %, WARN > 2 % | caption glyphs found by colour (ink `#2B1B0F` or white) and shape (stroke 0.025-0.22 em, size, on a text line with neighbours, not a hollow rectangle, not a counter inside a letter, not inside a highlight box); background = a ring 0.3 em around the glyphs; share of background pixels below 3:1 WCAG contrast against the glyph colour (the rule of `scripts/capcheck.py`) |
| caption busy | WARN | edge density of that background > 6 % (detail behind the words) |
| caption missing | ERROR | a page of the film's captions (`--captions <file>`) is settled on screen (s + 0.3 .. e - 0.1) but no legible glyphs are found for >= 6 frames: merged with same-coloured art, covered, or the wrong tone |
| ui-zone | WARN | platform UI zones (top 180 px, bottom 400 px, right rail x > 950 for y 900-1500): a NEW element (camera-compensated change blob >= 1,500 px^2, >= 60 % inside the zone), one line per zone with its stretches; dense edges in the right rail for >= 0.5 s |

For the film and scene compositions the expected caption tone comes from `captionTone` in `scenes.json` (unknown
around tone switches and transitions), so art drawn in caption ink is not mistaken for a caption. `scripts/capcheck.mjs`
(engine lane) is the exact, mask-based caption check for chosen frames; framecheck is the every-frame screen.
Output: `framecheck.md` lists every issue with frame numbers and times, `framecheck_frames.png` tiles up to 24 of them.

---

## 3. sheets.sh: contact sheets for frame-by-frame review

```
scripts/qa/sheets.sh <CompId> <t0> <t1> <every_nth> <out_dir> [--scale=0.25] [--tile=256] [--cols=6] [--rows=4]
                     [--crop=WxH+X+Y] [--concurrency=2]
```

Renders every n-th frame between t0 and t1 (one bundle, one browser) and tiles them 6x4 per sheet. Each tile is labeled
`f123  4.10s` (+ the scene id for Main, + the film time for a scene composition); each sheet has a header with the
range. 256 px tiles make a ~1.6k px sheet: small enough to read in one look. `--crop` zooms on a canvas region, e.g.
`--crop=1080x340+0+260 --scale=0.5 --tile=380 --cols=3` for the caption band. Use `every_nth=1` for motion and pops,
2-3 to scan a whole scene. (`scripts/sheet.sh` = evenly spaced overview + caption check; `scripts/strip.sh` = every
frame of a crop.)

---

## 4. beatsync.py: cuts against the beat grid, and a tempo map that bends the music

```
python3 scripts/qa/beatsync.py [--cuts scenes|storyboard|frames:<dir|video>|json:<file>|list:t1,t2] [--grid beat|downbeat|half]
       [--midi audio/music_cinematic.mid | --audio file.wav] [--tol-ms 25] [--warp auto|none|v1-to-v2|v2-to-v1] [--out dir]
python3 scripts/qa/beatsync.py --fit-tempo [--anchor auto|beat|downbeat] [--max-dev 0.08] [--end-time film|music|<s>]
       [--tempo-out audio/tempo_map_proposal.json] [--write-midi out.mid]
```

- **Cuts.** `scenes` (default): every scene start after the first in `src/data/scenes.json` (Film switches scenes there
  for every transition type: cut, matchcut, the camera-continuous switch, the push-through switch, the centre of a
  foreground wipe, the end of an un-build), **quantised to the first frame that shows the new scene**
  (`ceil(start x 30) / 30`, up to 33 ms after the nominal start; `--no-quantize` to turn off). `frames:` runs the cut
  detector of deadframes on rendered frames; `json:` takes a `deadframes.json` (its detected cuts) or a list.
  `--cuts scenes` read v1's `src/data/scenes.json`, archived since 2026-10-29: pass `--cuts json:...` or
  `--cuts scenes:<path>`.
- **Warp.** If the cut list is still on the v1 voice timeline (70.69 s) and the music on v2 (78 s), `--warp auto` maps
  it through `assets/timewarp_v1_to_v2.json`. Today scenes.json is already v2, so no warp.
- **Grid.** From the MIDI's tempo map and time signatures (95.38 BPM, bars of 4/4, 5/4 and 6/4: 124 beats, 28 bars,
  ending at 78.000 s), or librosa beat tracking for an audio file. Every cut gets its signed offset (cut - grid point)
  to the nearest beat, downbeat and half-beat.
- **`--fit-tempo`: the voice decides the cuts, the music bends.** (1) Each cut is assigned to a beat by dynamic
  programming over the cuts in order: candidates are the beats within +-6 of the nearest one; a segment between two
  anchors is feasible only if its average tempo is within +-8 % of the base; the cost is 100 x ln(segment tempo /
  base)^2 per segment, plus 0.1 for a beat that is not a downbeat (`auto`: a downbeat is worth ~3 % of tempo bend) and
  0.05 per beat away from the nearest. A cut that no feasible path can reach is DROPPED and reported. Anchors also pin
  beat 0 at 0 s and the end of the last bar at the film's last frame (`--end-time film`), so the bed loops with the
  video. (2) The per-beat durations are solved (SLSQP) to pass **exactly** through every anchor while minimising the
  squared change of beat length from beat to beat (+ a small pull to the base tempo), each beat within +-8 %: the
  tempo ramps smoothly between anchors. (3) Output: `audio/tempo_map_proposal.json` with the anchors (cut -> bar.beat,
  how far that beat moves), dropped cuts, one tempo event per beat (tick, new time, BPM), and an old->new `time_map` at
  every beat; `--write-midi` writes the MIDI with the same notes (ticks) and the new `set_tempo` events, then re-reads
  it to verify the offsets.

**How the sound stream applies it:** MIDI: keep every note tick and replace the tempo track with `tempo_events` (or just
take the `--write-midi` file). Audio-domain renderers (`audio/tools/bedkit.Grid`): map each note's original time through
`time_map` (piecewise-linear between beats) and scale its duration by the local beat-length ratio.

### Current beat-sync numbers (2026-10-24: scenes.json v2, `audio/music_cinematic.mid`)

- Now: **cuts: 12, on-beat (<= 25 ms): 1 (S12, +23 ms), max off-beat: 277 ms (S03), mean |offset|: 175 ms.** Against
  downbeats: 1 on, max 1,009 ms; against half-beats: 1 on, max 156 ms.
- Fit (`auto`, +-8 %): **12/12 cuts anchored, 0 dropped; after: 12 on-beat, max 0 ms** (verified from the retimed MIDI).
  Tempo 89.2-100.4 BPM (-6.5 .. +5.3 %), max change 1.5 % per beat; 5 cuts land on downbeats (S02 3.1, S07 13.1, S08 15.1,
  S10 20.1, S12 25.1). Beats move by up to 380 ms (S04 lands on 7.4, 380 ms earlier than written), so the bar lines the
  bed placed on words move with the cuts. `--anchor downbeat` keeps only 6 of 12 cuts. The film ends at 77.767 s while the
  bed was written for 78.0 s: the fit makes the music end on the film's last frame.

---

## 5. The QA gate

A composition passes when **all** of these hold (`report.py`, exit code 0; v1's, archived in `archive/v1/scripts/qa/`):

1. **Life:** every scene has a life score **>= 8/10** and **no dead run over 0.40 s** unless allow-listed in
   `scripts/qa/holds.json` (with a why).
2. **Frames:** **no framecheck ERROR** (blank frame, flash/glitch, caption contrast or missing caption). Warnings
   (UI zones, busy caption background, bridge frames) are read, not blocking.
3. **Beat sync (Main):** every cut within **25 ms** of a beat of the music as it is in `audio/` **after the tempo fit
   has been applied** to the bed. Until the sound stream re-renders with `tempo_map_proposal.json`, this check fails
   and REPORT.md shows what the fit would achieve.

Scene agents: run `scripts/qa/run_all.sh SNN` (v1's, archived in `archive/v1/scripts/qa/`; at the
`v1-final` commit (`76c166c1`)) before calling a scene done, read `REPORT.md`, open `deadframes.png` and
`framecheck_frames.png`, and use `sheets.sh` on any flagged range.

---

## 6. Calibration on the reference videos

`python3 scripts/qa/calibrate.py` runs deadframes and framecheck on both references with the scene lists in
`scripts/qa/calib/ref*_scenes.json` (from motion_spec section 2 and style_bible_ref2 section 1.1, transitions as
excused windows) and compares with the analysis streams' hand-built measurements. Results:
`scripts/qa/calib/calibration.md`, charts `scripts/qa/calib/ref1/deadframes.png`, `scripts/qa/calib/ref2/deadframes.png`.

| metric | ref 1 measured | ref 1 tool | ref 2 measured | ref 2 tool |
|---|---|---|---|---|
| events per second | 5.9 | **5.58** | 3.6 | 5.40 |
| median gap between event onsets | 4 f | 3 f | - | 1 f |
| longest event gap outside transitions | 0.97 s | 1.47 s (the coins, 16.4-17.9 s) | - | - |
| near-static / dead frames | 3.6 % (< 0.1 % px) | **4.7 %** | 35.6 % | **32.8 %** |
| longest near-static / dead run | 0.2 s (< 1,000 px), 0.4 s (< 3,000 px) | **0.10 s**, 0.17 s (< 3,000 px) | 1.53 s | **1.20 s** (shot 16) |
| scene life scores | - | 8.9-10.0, mean **9.30**; **6/6 pass**; 0 dead runs > 0.40 s | - | 7.0-10.0, mean **8.89**; 6/16 pass the strict gate |
| framecheck | - | 0 errors, 0 warnings | - | 0 errors, 4 UI-zone warnings (its framing) |

Reference 1 (our density target) passes the gate in every scene with no dead run over 0.40 s. Reference 2 is "the
floor" (BRIEF): its 11 dead runs of 0.43-1.20 s are its genuine holds (verified on frames: a camera pull-out with
nothing else moving), all shorter than its own measured 1.53 s maximum, so there are no false dead runs; the gate
rightly flags them against our stricter 0.40 s limit.

How the thresholds were chosen:

- **Camera compensation** was verified on reference 2, whose every shot zooms 1.3-5.9 %: after compensation only real
  local motion remains (presenters walking in, hats stacking, a hand raise), and a 22-frame pull-out with nothing else
  moving (35.73-36.43 s) is correctly dead. `selftest.py` case A: a 6 % push + 40 px pan + 0.4 deg roll alone gives
  59/59 dead frames; case B: the same move plus a small moving disc gives 0 dead frames.
- **Dead threshold 2,000 px^2** (~0.1 % of the frame) reproduces the static share and the longest near-static run of
  *both* references (the specs used "< 0.1 % of pixels changed"). Sweep on the stored energies: 1,200 px^2 gave ref 2
  29.6 % dead / 0.73 s; 3,000 px^2 gave ref 1 0.40 s and ref 2 1.93 s (above its own 1.53 s maximum).
- **Slow-motion rule** added after the calibration found a false 1.6 s dead run in reference 2 (23.87-25.47 s: a water
  pipe draws on at 400-1,900 px^2 per frame). A plain 4-frame window was too generous (ref 1 dead share fell to 0.4 %:
  it counted the quiet frame after every burst), hence the "steady" condition.
- **Event definition** swept over merge radius (6-10 px at analysis scale), chain hold (1-3 frames) and minimum size
  (2,000-5,000 px^2 x frames) against reference 1's measured 5.9 events/s, 4-frame median gap and 0.97 s longest gap.
  Chosen: merge 12 canvas px, hold 2 frames, 2,000 px^2 x frames.
- **Caption checks**: tuned until both references and KitDemo report no false caption errors (letter counters on the
  white card, string-light bulbs at the band edge, window frames in caption ink and the clipped letters of a scrolling
  page were the false positives that were removed); `selftest.py` case E checks that an ink caption over tealDark
  detail is still an ERROR.

---

## 7. Results on the dev compositions and the film (2026-10-24)

| composition | frames | life (deadframes) | framecheck | chart / report |
|---|---|---|---|---|
| KitDemo | 360 | **10.0/10 PASS** (11.7 events/s, longest dead 0.27 s); gate PASS | 0 errors, 3 UI-zone warnings | `out/qa/KitDemo/deadframes.png`, `REPORT.md` |
| CineDemo | 660 | C01 **9.1 FAIL** (28 dead frames f4-f31: a multiplane crane with drifting clouds and nothing else moving, i.e. camera only), C02 **10.0**, C03 **10.0**, C04 **9.6 FAIL** (16 dead frames f148-f163) | 3 caption errors: a white caption crossing a light column edge (f174-f177) and a passer-by's hair (f300-f302) during wipes, a dark caption over the dark facade for 3 frames at a vignette cut (f477-f479); busy-facade warnings f571-f659 | `out/qa/CineDemo/deadframes.png`, `framecheck_frames.png` |
| Main | 2,333 | S01 **7.6 FAIL** (46 dead frames 3.0-4.5 s after "switched themselves off": allow-list it if the hold is deliberate), S02 **4.0 FAIL** (0.9 events/s: lives on slow idle motion only), S03-S13 **0.4-2.4** (not built yet: placeholders) | 4 caption errors: f143 (horizon line through the caption at the S02 push-through), f985-f991 and f1997-f2000 (white caption over light sky at the edge of the S07 / S12 foreground wipes), f1420-f1494 (S09 has `captionTone: light` but its placeholder sky is day: 1.78:1) | `out/qa/Main/deadframes.png`, `REPORT.md` |

Main beat sync: see section 4 (now 1/12 cuts on a beat, max 277 ms; the fit puts 12/12 on beats). The 6 cuts the
detector finds in the pixels (placeholders look alike) cross-check at 1/6 on-beat, max 296 ms.

---

## 8. Known limitations

- **Events are a proxy.** A blob tracker cannot tell "new thing" from "same thing again" perfectly: touching
  counting-builds (coins in a row) can merge into one event, so the longest-gap measure is pessimistic there (ref 1:
  1.47 s vs the measured 0.97 s); a walk cycle that pauses for 2+ frames re-counts. Reference 2 measures 5.4 events/s
  here vs 3.6/s in its style bible (gestures and walk steps count here). Treat events/s as +-20 %.
- **Camera model = 2 similarities.** Strong 3-plane parallax, perspective (keystone) camera moves or rolling 3D card
  flips leave residual that counts as life; very fast moves (push-through zooms, whip transitions) are inside transition
  windows anyway. A big object moving rigidly across the whole frame width could be taken for a camera layer.
- **Slow idle motion is not life by design.** A sun drifting 10-30 px/s alone keeps a frame dead (it is "secondary
  drift"). If a hold is meant to breathe, give it a real event or allow-list it.
- **Caption legibility is colour-based.** It finds ink `#2B1B0F` / white glyphs; other caption colours, the 1.7x emphasis
  pages and captions whose letters touch same-coloured art (reported as "caption missing") are not measured glyph by
  glyph. Use `scripts/capcheck.mjs` (exact masks) on the frames framecheck lists.
- **UI-zone warnings are heuristic** (new change blobs and edge density): the bottom zone normally holds moving
  foreground, so expect warnings there; they are not blocking.
- **Beat sync** treats each scene start as the cut instant (true for Film's switch), not the perceived midpoint of a
  long wipe; the fit moves beats by up to ~0.4 s, so the bed's bar lines that were placed on words move too. The
  librosa path assumes 4/4 for downbeats.
- **Performance:** ~45 ms/frame render (0.5x, concurrency 2) + ~60 ms/frame deadframes + ~100 ms/frame framecheck (in
  parallel): Main (2,333 frames) takes about 5 minutes (282 s).
