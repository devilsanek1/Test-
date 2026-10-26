# Camera movement and timing (cine guidebook section; research lane, 2026-10-26)

**Source:** "Amazing Shots of ARCANE SEASON 1" (YouTube, Amazing Shots, id HzJ7Nvwz1e8; Fortiche / Riot / Netflix), the
owner's screen recording, 6:19 at 24 fps. We measured every shot: cuts, pan and tilt as % of the source width (16:9, so
H = 0.56 W), zoom %, roll, where the easing peaks, and parallax. We describe the shots in words only and keep no frames.
**The cleaned set used below: 136 shots, 376.9 s.** We dropped 4 recording artefacts (#1, #2, #144, #165; the tail of #2
is the head of #3) and merged 10 runs of false cuts that the detector made on flicker or flares (#4-9, #14-19, #40-42,
#44-46, #51-54, #56-57, #64-67, #127-128, #131-132, #146-148). Where optical flow read figure or FX motion as camera
motion, we used the reviewed reading instead (#14-16, #36, #63, #66, #77, #146-148, #151, #158, #160, #161). Zoom % =
end scale / start scale - 1, so -58 % = 2.4x. Motion classes, by the largest of zoom, pan and tilt: **locked** < 1.5 %,
**breath** 1.5-3.5 %, **move** 3.5-10 %, **big** > 10 %. Every number tagged [M] comes from this set; untagged numbers
are proposals to test at G4. "#55 @109" means shot 55, starting 109 s into the compilation.

## 1. Rules [M]
1. **Half the shots barely move.** Locked 29 % of shots (23 % of the time), breath 19 %, move 32 %, big 17 %, whips and
   FX 3 %. (The raw "71 % moving" counted flicker and figure motion as camera motion.) A locked shot still drifts
   ~0.45 % W over the shot (~5 px at 1080): a handheld float, never a dead frame. The life is in the frame, not the
   camera: smoke, light, or a walk (#36 @63 holds 5.75 s while a figure crosses).
2. **The closer the shot, the bigger and faster the move.** Median |zoom| and rate of the moving shots: wide (XW + W,
   n 73) 4.8 % at 1.5 %/s (IQR 2.9-7.2 %), and 37 % of wides are locked; mid (F + M, n 39) 6.5 % at 2.6 %/s; close
   (MCU-XCU, n 16) 7.5 % at 3.6 %/s, only 1 of 16 locked. On inserts (n 8), 5 of 8 are locked: the object moves, the
   camera holds.
3. **Pull-outs outnumber push-ins 46 : 34** (27 : 12 on wides). On close sizes it flips: 8 pushes to 4 pulls. By
   purpose: scale 20 pulls to 9 pushes, establishing 15 : 9, intimate 12 : 8, but action 6 pulls to 11 pushes.
   **A pull lets the moment sit, leaves people alone, or shows the context; a push means attention, approach, threat or
   impact.** The commonest single move is a breath-out: at 1.5-3.5 % the pulls lead 17 : 7, 9 of them front-loaded.
4. **No house easing: three shapes in thirds** (92 moving shots): front-loaded (ease-out, or peak < 40 %) 33, centred
   26, back-loaded (ease-in, or peak > 60 %) 31, constant 2. A symmetric in-out (our `CAM.ease` / `CAM.slow`) is
   rarely the measured shape. A third of the moves start at full speed on frame 0, carrying the energy of the cut, and
   a third never land: they are cut at full speed. The back-loaded moves are the big ones (median 6.9 % vs 4.5 %
   front-loaded). **All 6 big pushes (>= 10 %) are back-loaded, median 1.5 s; big pulls take a median 4.2 s.**
5. **Vertical reveals start fast and settle.** All 7 crane and tilt reveals peak at <= 45 % (#50, #55, #56-57, #58,
   #72, #94, #113), with a near-still tail of 1-2 s (#72: the last 1 s; #113: the last ~2 s); #69 is a constant crawl.
   The long tilts are pan-head rotations (parallax 0.94-1.04: #50, #56-57, #58, #139, #143). True dolly or crane
   parallax is kept for the big reveal (#55: 0.67, 11 % off-plane; #94: rail 1.26x; #113: rail ~1.6x) and for action
   dives (#104: 1.88; #126: 1.86; #135: 1.9).
6. **Moves are compound but gentle.** A calm push or pull carries a lateral drift about half its size (median 2.5 % W
   with 5.2 % zoom). Roll >= 1° shows up in 38 shots: a 1-4° drift on calm floats and reveals (#4-9, #55, #58, #62,
   #102), 2-9° in fights, and 14-33° only inside whip blur (#158-160).
7. **Shot length:** cleaned median 2.73 s, IQR 1.23-3.21. (The raw 2.08 s was pulled down by the false cuts.) By size:
   XW 2.71 (1.85-3.44), W 2.94, F 2.67, M 2.44, CU 1.96, MCU 0.50, inserts 2.17 (the raw 0.58 came from flare splits).
   By purpose: action 0.83 (0.50-1.98), transition 1.56, scale 2.94 (2.39-3.56), establishing 2.92 (2.67-4.19),
   intimate 2.98, symbolic 3.00, and **cozy 3.96 (2.77-5.68): the refuge is held longest.** 23 % of shots are < 1 s and
   10 % are >= 5 s (the big moves and the long holds).

## 2. Presets for our camera kit (1080 x 1920, 30 fps; Arcane's 5-12 s moves compress 2-2.5x for 30-45 s videos)
Write a pull-out as keys that land at rest, `{t: 0, push: p}, {t: d, push: 0}`, so the end frame is the authored one;
p = 1 - 1 / (1 + zoom). Check every move with `scripts/camspeed.py`: peak <= 15 px/frame on every layer.

| preset | numbers | ease | use | reference shots (# @ s) |
|---|---|---|---|---|
| P1 **Hold** | zoom 0-1 %, `handheld` 1-1.5 px; 2.5-3.5 s, up to 6 s with a walk | none | power, a threshold, being watched, symbols, inserts | #21 @22 hall under a round window; #26 @37 figure in a blown-out doorway; #36 @63 balcony walk; #125 @333 pair against a red sun |
| P2 **Breath-out** (our default on wides) | pull 1.5-3 % in 2-3.5 s, drift <= 1.5 % W (16 px), last 30 % near-still | `CAM.settle` (peak 10-35 %) | let a moment sit, aftermath, vistas | #3 @2 worm's-eye towers; #13 @15 pair in the moon-gate; #24 @31 beam over the city; #108 @286 sunset parapet |
| P3 **Retreat pull** | pull 4-7 % in 2.5-3.5 s (+ truck <= 3 % W); never lands; cut at speed into a shot that is already moving | `E.inQuad` | isolation, leaving, "our world gets smaller" | #10 @10 moon-gate; #27 @40 man before a glowing porthole; #37 @69 figure on a boat deck; #47 @86 hooded face (14 % in 8.7 s) |
| P4a **Lean-in push** | push 1.5-3 % in 2-3 s | `CAM.settle` | contemplation, a held silhouette | #23 @28 figure before tall windows; #73 @179 haloed seated figure; #88 @223 facade in rain |
| P4b **Drawn-in push** | push 3-6 % in 2.5-5 s, peak at 65-80 %; cut while moving | `E.inQuad` or a late bezier | "this small thing matters", tension | #25 @34 lit window in a cavern; #103 @271 one glow in the ruins; #43 @79 eyes split by a blade (5.7 %, roll -2°); #14-19 @16 the landing on a fingertip |
| P5 **Lunge** (action) | push 10-15 % in 0.5-1.5 s (+ truck 7-13 % W); 12 % in 0.5 s on `E.inQuad` peaks at ~15 px/frame on the top edge; a foreground at f 1.6-1.9 may pass the cap only on the last 2-3 frames, under a smear; cut on the fastest frame; one way only | `E.inQuad` (`E.inCubic` only up to 8 %) | impact, diving into the fight | #104 @276 head snaps back; #126 @336 dive along the bridge; #127-128 @338 0.33 s hold, then +23 %; #142 @355 crash zoom |
| P6 **Big reveal** (the ONE big move) | rise 0.15-0.3 H + pull 1.3-2.4x; ours 3.5-5 s + 1-1.5 s near-still; a ledge at f 1.3-1.6 slides out of the bottom | proposed `CAM.unveil = trapezoid(0.1, 0.6)` (peak 1.54x the average) | scale: the world they want or have to face | #55 @109 two profiles to a tiny rooftop pair (2.4x, 11.5 s, peak 42 %); #72 @173 rooftop over the night city (1.33x, 5.8 s); #94 @238 window to skyline; #113 @294 flare to the canyon (1.5x, 8.5 s) |
| P7 **Tilt reveal** | tilt 0.12-0.45 H at <= 0.12 H/s (600-900 px in 3.5-4.5 s) + push 3-8 %; no parallax (`tilt`, not `y`) | `trapezoid(0.1, 0.7)` (58 % of the travel by 40 %) or linear | up = wonder or power; down = into the place, confinement | #50 @101 spires down to the sill (0.42 H, 6 s); #58 @133 up a tree (0.32 H + 7.6 %); #56-57 @121 down a canyon (0.81 H, 11.7 s); #69 @161 mural, constant speed |
| P8 **Push-through chain** | 2 cuts of +7-9 % in 0.8 s each, then a landing shot that is already moving: crane 0.18 H + 4 % in 4-5 s | `E.inQuad`, then `CAM.settle` | leaving the refuge for the world (K9) | #92-94 @236-243 window, railing, skyline |
| P9 **High widen** (K10) | pull 2-6.5 % in 2.7-4 s, centred, linear or peaking mid-shot; never a push | linear or `CAM.slow` | institution, ceremony, council | #20 @19 caskets from above; #38 @72 cog-shaped table; #89 @226 empty council (constant speed) |
| P10 **Shake / lurch** | impact: 2 frames of 6-15 px, decaying in <= 0.25 s; lurch: roll <= 6° + tilt 0.15 H in 0.5 s; fights: 2° roll drift + 1-1.5 px | none | contact frames only, one per beat | #120 @321 lightning jolt; #157 @367 punch; #79 @193 lurch; #129 @340 (a -17° swing: cap it at 6°) |

## 3. Rhythm between intimate and huge [M]
- **Size steps between neighbouring shots:** 31 % stay at the same size, 28 % change by one size, and 21 % (29 of 135)
  jump 3 or more sizes.
- **Burst, then hold.** Two of the three fast bursts are 3 shots of 0.33-0.50 s (1.25-1.34 s in all), handing off to a
  longer shot (the third, #149-155 @362, is a 7-shot FX aftermath of 0.33-0.75 s each, 3.8 s in all).
  In #110-112 @293 (0.50 / 0.42 / 0.33 s) each cut is ~1.5x wider, then the #113 wide holds 8.5 s. In #78-80 @193 the
  jump cuts share one fixed anchor (two lamps that never move), then the #81 wide holds 2.7 s. Of the 14 jumps from close
  to wide, 6 leave a shot < 1 s, and that wide lasts 2-26x as long (median ~6.5x: #80 -> #81, #93 -> #94, #112 -> #113,
  #130 -> #131-132, #133 -> #134, #142 -> #143). The 8 calm jumps keep about equal lengths (0.45-1.9x: #23 -> #24,
  #124 -> #125, #162 -> #163).
- **Stillness before violence:** a 2.9 s locked frame, then a 0.46 s jolt (#119 -> #120 @318); a 0.33 s locked beat,
  then the rush (#127-128 @338).
- **The figure ratio across a scale cut is 6:1 to 20:1** (median ~10:1): #112 -> #113 ~6:1, #130 -> #131 ~10:1,
  #133-134 -> #135 a tiny figure to a gauntlet ~1:14, #142 -> #143 ~20:1.
- **For our 30-45 s videos:** at Arcane's pace, a 40 s video has ~15 shots. Calm shots run 2.5-3.5 s, the refuge 3-6 s.
  Use at most one burst of 3 shots x 10-15 frames, then a held wide of 2.5-4 s. Cozy stays >= 50 % of the runtime
  (wides fill 61 % of this compilation, but it is a highlights reel).

## 4. What the measurements confirm or change in COZY_AND_SCALE sections 4-5
- **Principle 4 (one big move; other shots push 3-8 %):** the size is confirmed (moving median 4.8-7.5 %). The direction
  changes: the default on a wide is a 1.5-3 % pull (P2) or a hold, and a push needs a reason. The big move: Arcane
  takes 5-12 s, so ours becomes 3.5-5 s + a 1-1.5 s hold (it was 2.5-4 s + 0.8-1.5 s).
- **Easing ("ease in, land over the last 35 %"):** changed. Reveals lift off in ~10 % and settle over 60 % (peak at
  <= 45 %), and a third of all moves never land. Keep `CAM.reveal` for K3 and add `CAM.unveil` = trapezoid(0.1, 0.6).
  The 1-1.5 px drift at rest is confirmed (~5 px of residual over a locked shot).
- **"No spins":** confirmed. Allow up to 2° of roll drift on long reveals and floats (Arcane: 1-4°), up to 6° in
  action, and > 20° only in a whip under a smear.
- **K1:** confirmed. The ratio is 6-20:1 (median ~10:1), against our <= 1/8, and the cut comes from a close shot < 1 s.
  Change: in action the wide may last 1.2-1.6 s (#131-132, #159); 2.5-4 s is for calm scale.
- **K2:** the distance is confirmed (0.3-0.45 H), but our pace is 2-2.5x too fast. Use 3.5-4.5 s for 600-900 px
  (Arcane 0.04-0.07 H/s; ours <= 0.12 H/s), with a front-loaded or linear ease instead of trapezoid(0.25, 0.35). Pair
  the tilt with a +3-8 % push (#56-57, #58, #64-67), not a zoom-out.
- **K3:** confirmed: a ledge at f 1.3 (Arcane's rails run 1.26-1.6x). Arcane also pulls back 1.3-1.5x as it rises
  (#72, #113) and lands on an ease-out.
- **K4:** confirmed and bounded. Arcane's longest continuous pull-back is 2.4x (#55, 11.5 s); bigger jumps are cut or
  dipped (#10 -> #11-12, a dip to black worth ~2x; #112 -> #113). This matches our "<= 2.3x continuous, skip the rest
  in a hidden cut". A retreat pull-out accelerates and does not land (P3).
- **K5:** the size is confirmed (Arcane's vista pushes are 1.7-5.4 % in 2.3-5 s), but the symmetric `CAM.slow` is rare:
  use P4a (settle) or P4b (drawn in).
- **K6:** confirmed: 27 locked wides, median 2.7 s, with the life in the frame.
- **K7:** confirmed near-locked (#3 -2 %, #31 locked, #62 -2 % + 2° roll). The "optional 2-4 % tilt" becomes a 2 %
  breath-out.
- **K8:** no camera data beyond near-locked (#23: 1.7 %).
- **K9:** changed. Arcane pushes through in 2 accelerating cuts (+7-9 % in 0.8 s each, ease-in) and then lands in a
  third shot (P8). It is not one `CAM.ease` push from 0 to 0.85: the cuts cover the distance, not the push.
- **K10:** confirmed calm: every high or overhead institution shot pulls out 2-6.5 % or holds, at a linear or mid-peak
  speed (#20, #38, #89). Arcane also looks straight down on one person to show vulnerability (#49, #123); our respect
  rule still bars that for real people.
- **Section 5:** "still peak frames 1.5-3 s" is confirmed (locked median 2.7 s). Every crash push is one-way (6 of 6
  back-loaded, no bounce), which matches "no rapid zoom in-out". Impact shakes last <= 2 frames.

## 5. Caveats
- The compilation's editor cut the clips: 57 of 136 shots last 2.5-3.5 s, so "about 3 s" may be the editor's trim.
  Treat the long durations as lower bounds.
- Optical flow reads figure motion, flares and radial FX as camera moves. We corrected 12 shots by eye. Easing peaks on
  locked shots are noise and are left out.
- Season 1 only, from one compilation. The shot order is the editor's, so section 3 uses only the in-sequence runs
  (#77-81, #92-94, #110-113, #119-120, #126-131, #140-143).
