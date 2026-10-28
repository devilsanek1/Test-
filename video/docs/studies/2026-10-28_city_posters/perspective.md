# Perspective and depth: what the seven city posters teach (look lens 1)

**Lens 1 of the city-poster study** (brief: `README.md`). It explains the owner's feeling 1 ("some buildings are
obviously closer to me, some further out and there is something WAY further out that gives me a sense of scale") and
the open observation 7, the designed view ("it is a unique camera angle and composition of objects is fascinating").
Analysis only: every lesson is a proposal until the owner approves it; DIRECTION and the playbook stand. Its value side
agrees with `pro_1_depth.md` (two value groups, a gap, a far group); this file adds the geometry (eye levels, vanishing
points, the ground, scale) and measures where v2, the baseline the owner likes, stands.

**Re-run** (about 1 min): `python3 -I video/scripts/look/posters/perspective.py all --img-dir
video/docs/studies/2026-10-28_city_posters/img [--model depth_anything_v2_vits.onnx]` (numbers to
`/tmp/posters-perspective/perspective.json`); one film still: `... frame <still.png> --sheet
video/scripts/qa/depth_sheets/<shot>.json`. **Sheets:** `img/perspective_vps.jpg` (lines, VPs, eye levels),
`img/perspective_planes.jpg` (the planes, and a depth network's reading), `img/perspective_ladder.jpg` (the depth-ladder
chart: 7 posters, 11 film stills), `img/perspective_films.jpg` (v2 S1, S2, S4, S6; v1 @10, @38.5),
`img/perspective_916.jpg` (the bands placed in 9:16). **Method:** Appendix C.

## Top findings
1. **The designed view is a stack of cameras.** Copenhagen, Reykjavik and Singapore are one camera each (Copenhagen's
   facade row and its paving have their VPs on one horizon, 18 px apart in y: a standing eye at 1.7 m). Hanoi, Buenos
   Aires and Cape Town put the near street at a low eye level (0.75, 0.67-0.80 and 0.77 of the height) and LIFT the far
   city and its water onto a second horizon 0.14-0.27 of the height higher (0.57, 0.53, 0.59), the junction hidden
   behind trees, water or roofs; Kyoto's veranda (0.90) is a third view under its pavilion and torii (0.72-0.76).
   Where it can be measured the hero is drawn 1.4-3.6x the size the poster's own camera allows (Buenos Aires,
   Reykjavik), and its base is hidden in 5 of 7. No single camera could take these pictures: that is the "unique
   camera angle".
2. **Near looks near: a dark, busy frame and almost no open ground.** The nearest plane: L* 45, dE 45 from the air,
   visible edges 0.52, local contrast 9.4 (medians of 7); open ground and water: 7 % of the frame; the bottom fifth: 59 %
   near masses. v2's nearest planes: L* 74, dE 20, edges 0.13, contrast 2.8; open ground 25 % (S1 37 %); the bottom
   fifth 9 % masses. v2 passes our depth check on all 8 shots and its grounds recede (45-83 % of its low lines are
   oblique), so what still reads flat is the near end: v2's ground has the far's value.
3. **Only near things recede; every landmark is an elevation.** Receding lines live in streets, quays, facade rows and
   two-point boxes, at gentle angles toward VPs at or beyond a side edge (never centred; v2 centres its VP in 5 of 8
   shots). Every hero but Kinkaku-ji is a frontal elevation, and verticals stay parallel in 21 of 23 structures (no
   three-point). Flat elevations do stack (Reykjavik's gable rows, Singapore's bay) and still read deep, because each
   band overlaps the next, shrinks (units 0.02-0.40 of the frame's per metre) and steps toward the air, ending on one
   pale plane 8.5-12.5 from it.

## 1. What the posters do (measured)

### 1.1 Viewpoint: eye level, camera height, lens (`img/perspective_vps.jpg`)
| Poster | Eye level(s), fraction of the height | From | Camera height the things imply (est.) | Near VP x |
|---|---|---|---|---|
| Copenhagen | 0.74, one camera | facade row VP (1461, 1221), 81 lines; paving VP (1274, 1203) | 1.7 m (bicycle 1.05 m, railing post): standing at the rail | 1.21 W |
| Reykjavik | 0.62, one camera | the sea's far edge; Harpa's edges meet at (982, 1005), (1292, 1002) | 31-46 m (near house, Harpa): over the roofs | 0.81, 1.07 W |
| Singapore | 0.70, one camera | the bay's far edge; the near roofs seen from above | 13 m (near shophouse door) | none (frontal) |
| Hanoi | near 0.75, far 0.57 | bridge VP (-584, 1192), balustrade VP (-1382, 1216); the lake's far edge | near 2.4 m (cyclo); the bridge's people stand above the eye | -0.48, -1.15 W |
| Buenos Aires | La Boca 0.80, Casa Rosada 0.67, far 0.53 | VPs (2122, 1271), (-456, 1059); the river's far shore | 5 m (the lamp); 21 m (the Casa Rosada, at its own cornice); 24 m (the Obelisco, far) | 1.76, -0.38 W |
| Cape Town | near 0.77, far 0.59 | Bo-Kaap row VP (-4, 1239), 49 lines; the sea's far edge | 4.5-5.1 m (two doors); 18 m (the lighthouse, far) | 0.00 W |
| Kyoto | Kinkaku-ji 0.72, torii 0.76 (by eye), veranda 0.90 | VPs (-2333, 1160) and (2707, 1063); (892, 1460) | at the pond's surface (1.0 m under the pavilion's stones) | -1.93, 2.24 W |

- **The near eye level is low:** 0.74 of the height (median; 0.62-0.77), a pedestrian or first-floor camera (1.7-5 m)
  wherever a person, a bicycle or a door gives a size; only Reykjavik and Singapore look down over roofs.
- **The lens is gentle:** each receding family spans little angle (Copenhagen 1.6-13.9 deg, the Casa Rosada 1.7-12.5,
  Kinkaku-ji 1-7, Cape Town's row -13 to +19; p10-p90), its VP at or past a side edge (0.5-2.4 widths from the
  centre): a normal-to-long lens, never a wide-angle wedge. v2 S2's towpath fans -52 to -10.5 deg; S6-S8's floors fan +-72-79 deg round a centred VP.

### 1.2 Vanishing points: what recedes, what is an elevation, several views in one picture
- **Visible line length** (LSD, colour step >= 6 across): level 30 % (21-37), vertical 36 % (23-47), oblique 35 % (24-40).
- **In perspective:** the near and mid structures: Copenhagen's facade row (its windows fall 37 -> 28 -> 20 px toward the
  VP, as one-point perspective predicts within ~10 %) and paving; Cape Town's Bo-Kaap row and street; Buenos Aires'
  Casa Rosada (79 lines, 65 % of its sloped length) and La Boca (63 lines); Hanoi's bridge, balustrade (87 %) and left
  street; Kyoto's Kinkaku-ji (a gentle two-point), veranda and torii tunnel; Reykjavik's Harpa (two-point, both VPs on
  the sea horizon).
- **Flat elevations:** every hero but Kinkaku-ji (Hallgrimskirkja 89 % vertical lines; Marina Bay Sands 42 % vertical, its
  SkyPark nearly level; the Obelisco; the One Pillar Pagoda, its horizontals one parallel family at 2.4 deg; Table
  Mountain a silhouette); all far landmarks (the Round Tower, the Marble Church, the Yasaka pagoda) and every far row.
- **Oblique projection** (parallel slopes, no VP): Reykjavik's gables (47 % of the house rows' sloped length in ONE
  parallel family at 125.5 deg) and Singapore's shophouse roofs (hip edges -19 to -23 deg, nearly parallel).
- **Verticals parallel** in 21 of 23 structures (the two-point convention, even for a tower 45 % of the frame tall); the
  exceptions are a 5-line avenue box and the torii tunnel's pillars, which lean toward its far end.
- **Why the mix stays believable:** each structure is consistent in itself; every junction between views is hidden
  behind a band (Hanoi's tree band and lake, y 760-905; the trees and far blocks round the Obelisco's plinth, y
  900-1100; Cape Town's roofs and palm, x 0-700, y 1100-1300; Kyoto's trees); the far zone carries no receding line
  that could contradict a near VP (water, mountain layers, ghost blocks, frontal landmarks); verticals stay vertical, so
  nothing tilts against anything; higher still means farther.

### 1.3 Depth by plane (tables: Appendix A; chart: `img/perspective_ladder.jpg`)
- **5-7 planes and the sky** in each. Nearest -> farthest (medians of 7): L* 45 -> 83, dE to the air 45 -> 11.5,
  visible edges 0.52 -> 0.21, local contrast 9.4 -> 4.9.
- **The ladder is not even:** from the frame to the far city every plane stays 20-60 from the air, then ONE cliff of
  12-30 to a pale background in 5 of 7 (Singapore 30 -> 12, Reykjavik 20 -> 9, Hanoi 38 -> 8.5, Copenhagen 40 -> 12.5,
  Kyoto 40 -> 9.5): ghost blocks or mountain layers, C* 4-12, with no unit (no window, no storey) in any poster.
  Buenos Aires and Cape Town end on a mid-valued far (the river 28, Table Mountain 29) that reads far by size, height
  in the frame and a cool, low-chroma hue. This is the owner's "something WAY further out".
- **Units** (Appendix B): the farthest measured unit is 0.02-0.40 (median 0.12) of the frame's px per metre.
- **The depth network** (Depth Anything V2, `img/perspective_planes.jpg`) reads each poster as layers: every plane's
  median depth falls with its rank in all seven (frame 0.64-0.94, background 0.00-0.04); the overlap share is 0.28
  (0.13-0.61): things at one height sit at different depths (side frames, overlaps).

### 1.4 The ground, the bottom and the sides
- **Open ground and water: 7 % of the frame (6-10 %).** The bottom fifth: 59 % near masses (26-89 %), 23 % ground
  (6-34 %); the outer 15 % columns of the lower half: 62 % near masses (17-73 %).
- **Where a ground shows**, it recedes with the near camera (Copenhagen's paving joints run to the facade row's VP;
  Cape Town's street to Bo-Kaap's), or it is flat patchwork (Buenos Aires' plaza, Hanoi's bottom blocks: diagonal
  quilts with no VP), or level water bands (Singapore's far-shore box: 74 % level lines).
- **The bottom is a frame, not a floor:** leaves, proteas, a rock and a railing, the nearest roofs, a cyclo, cut by the
  bottom and side edges, with the biggest units (a 215 px bicycle wheel, 90 px windows) and the darkest values.

### 1.5 Scale: huge yet far
- **Heroes take 21-45 % of the height** (Hallgrimskirkja 45, the Obelisco 43, One Pillar 33, Marina Bay Sands 27, the
  Nyhavn row 24, Kinkaku-ji 23, Table Mountain 21), tops at 0.25-0.53; the tallest element tops out at 0.22-0.41,
  under the title.
- **The base is hidden in 5 of 7** (behind the far shore's trees, the house rows, the plinth's trees, the coast and
  city, the moored boats); only the two water heroes (One Pillar, Kinkaku-ji) show it, and they are near-mid, not far.
- **Beyond one camera:** Hallgrimskirkja is drawn 2.5-3.6x the size Reykjavik's own camera allows (it implies a 12.7 m
  camera; the near house and Harpa 31.5-45.8 m), the Obelisco 1.4x (against the Casa Rosada under the far horizon), the
  Merlion ~5x (2.7 m against the near door's 13.3 m). The units agree: the belfry lancets are 47 px, the nearest windows
  30 px.
- **Yet far:** its base hidden, its top in open sky, paler than the frame (dE to the air: the Obelisco 16,
  Hallgrimskirkja 17; the frames 34-65), a simple silhouette with tiny things at its foot (10 px cars under a 685 px
  obelisk: 1:68).
- **One allowed exception:** a far landmark may stay a dark silhouette on the pale sky (Copenhagen's Our Saviour spire:
  L* 33, dE 52 from the air, behind the facade row), as CINEMATIC_GUIDE "Scale cues" 7 has it ("the darkest far shape
  on the palest cloud"); its far-ness then comes from its size, its hidden base and the planes in front.

## 2. Where our films stand (v2 first; `img/perspective_films.jpg`, the ladder chart's lower half)
| Still | Horizon (camera) | Open ground | Bottom fifth: masses | Nearest plane: L*, dE air, edges, contrast | Low lines: level / oblique | Overlap | `check_depth.py` |
|---|---|---|---|---|---|---|---|
| v2 S1 @5.2 | 0.50 (1.3 m, two-point) | 37 % (42 with the far towpath) | 0 % | 74, 14, 0.11, 2.3 | 7 / 83 % | 0.05 | 0 FAIL, 5 WARN |
| v2 S2 @11.0 | 0.36 (3.8 m, VP 1.30 W) | 26 % | 0 % | 78, 15, 0.12, 2.7 | 21 / 65 % | 0.20 | 0 FAIL, 4 WARN |
| v2 S3 @13.5 | 0.60 (VP centred) | 19 % | 18 % | 78, 21, 0.11, 2.8 | 65 / 12 % | 0.19 | 0 FAIL, 1 WARN |
| v2 S4 @17.0 | 0.40 (VP centred) | 24 % | 25 % | 74, 27, 0.17, 2.6 | 73 / 7 % | 0.03 | 0 FAIL, 2 WARN |
| v2 S5 @23.4 (crane end) | - | 26 % | 0 % | 55, 35, 0.15, 4.8 | 32 / 45 % | 0.63 | 0 FAIL, 1 WARN |
| v2 S6 @25.0 | 0.40 (1.6 m, VP centred) | 10 % | 19 % | 69, 21, 0.28, 4.8 | 21 / 61 % | 0.19 | 0 FAIL, 1 WARN |
| v2 S7 @31.0 | 0.47 (VP centred) | 2 % | 36 % | 77, 20, 0.15, 4.1 | 19 / 52 % | 0.34 | PASS |
| v2 S8 @38.0 | 0.49 (VP 0.55 W) | 33 % | 0 % | 72, 13, 0.09, 2.4 | 19 / 64 % | 0.20 | 0 FAIL, 1 WARN |
| **posters (median)** | **near 0.74, far 0.60** | **7 %** | **59 %** | **45, 45, 0.52, 9.4** | **32 / 34 %** | **0.28** | - |
| v1 @10.0 | VP 0.50 (one-point, centred) | 16 % | 5 % | 78, 20, 0.25, 7.8 | 27 / 28 % | 0.20 | 0 FAIL, 1 WARN |
| v1 @38.5 | - | 14 % | 0 % | 87, 8, 0.11, 4.1 | 52 / 5 % | 0.14 | PASS |

"Open ground" = the sheet's ground, water and tread planes; "low lines" = the bottom third's visible line length;
"overlap" = the depth network's overlap share. Stills from the G7 master at the depth sheets' times.

- **What v2 now does (the fix the owner approved):** no FAIL on any shot; the far planes sit 4-10 from the air (the
  posters' background 8.5-12.5); the grounds recede (45-83 % of the low lines are oblique in S1, S2, S5-S8; the posters
  34 %), from one camera per shot (`groundCam`; S1 a two-point bank, VPs -1.0 and 2.4 W). The owner's "no perspective"
  is answered in geometry. And v2's own crane landing (S5 @23.4), framed by a dark cherry (L* 55, dE 35), is its most
  layered frame: overlap 0.63, at the posters' top.
- **Where it still reads flat:**
  1. *The near reads far.* S1's near treads (L* 74, dE 14 from the air) sit as close to the air as its far city's
     front row (dE 12.4); across v2 the nearest plane is 30 L* lighter than the posters', with a quarter of their
     detail and a third of their contrast. The big peach paving has the value of distance.
  2. *Open ground fills the bottom:* S1's steps, landing and canal are 37 % of the frame; the bottom fifth is open
     ground in S1, S2 and S8 (posters: 59 % masses). The texture of that ground grows no finer with distance
     (`check_depth` WARN on S1, S2 and S8 @34: 1.1-2.0 crossings per 100 px far against 1.3-2.2 near).
  3. *Stacked bands in S3 and S4:* 65-73 % of the low lines are level, and S4's depth map is set by height alone
     (overlap 0.03; S1 0.05; the posters 0.13-0.61): the boat's cabin side is one pale slab across the frame (L* 74,
     contrast 4.5), the bands meet edge to edge, nothing overlaps them, and S4's subject plane steps only dE 3.1 to the
     plane behind it (`check_depth` WARN; >= 12 wanted).
  4. *Centred one-point stages:* S3, S4, S6, S7 and S8 put the VP at x 0.50-0.55 W; no poster centres one.
  5. *A high horizon:* 0.36-0.60 of the frame, so the ground band takes 40-64 % of it; the posters' near eye level,
     placed in 9:16 (L2), lands at ~0.76.
- **v1 (the best performer):** centred one-point streets whose lined side walls frame the bottom half (v1 @10: the near
  walls L* 66, edges 0.39, contrast 12.3, busier than any v2 near plane), the crowd's backs in front (retired since);
  its plaza (@38.5) is as pale as v2's paving (L* 87, dE 8). v3 has no exterior set to measure.

## 3. Clash check: DIRECTION rule 2, "never a flat elevation of stacked bands"
- **Where the posters stack flat elevations:** Reykjavik's bottom third is four rows of frontal gables (one parallel
  family, no VP), under flat bands of harbour, sea (y 992-1098), mountains (y 882-985) and sky; Singapore's bay is a
  stack of level patchwork rectangles under a frontal shore and a frontal hero; Hanoi's and Buenos Aires' bottoms are
  flat quilts; the far city is frontal blocks in all seven, and so is every hero but Kinkaku-ji.
- **Why they still read deep** (each measured above): (i) *overlap:* every band hides the base of the one behind, and
  none shows its base line on an open floor (the overlap share 0.13-0.61); (ii) *size steps:* each band's unit is
  smaller than the one in front (to 0.02-0.40 of the frame's per metre); (iii) *value steps:* from L* 45 at the frame to
  within 8.5-12.5 of the air; (iv) *one receding structure* anchors the space (Harpa on the sea horizon, Copenhagen's
  row, Cape Town's street, Hanoi's bridge), and higher means farther; (v) *no open ground*: the bands are masses, not
  floor.
- **Our failing bands are a different thing:** in v2 S3 and S4 the bands ARE the floor and its edges (a towpath, the
  canal, a boat's flank), seen edge to edge with level edges, in one pale value range (L* 74-78), with nothing cut or
  overlapped. Rule 2 is right about those; read literally, it also forbids the posters' way.
- **For the owner** (Q2): keep "never" for level floor bands seen edge to edge, and allow frontal elevations (landmarks,
  far rows, house rows) that overlap and step smaller and paler toward the air.

## 4. Lessons, ranked by the difference they would make
**L1. Make the near look near: a dark, detailed frame instead of open pale ground** (feeling 1: "obviously closer").
- *Evidence:* 1.3-1.4 and §2: the nearest plane L* 45 / dE 45 / edges 0.52 against v2's 74 / 20 / 0.13; open ground 7 %
  against 25 %; the bottom fifth 59 % masses against 9 %.
- *In our films:* every exterior set gets a near frame in W1 (what, which edges, how dark): its median L* <= 60
  (posters 39-58; v2 55-78), >= 30 from the air (posters 34-65; v2 13-35), edges >= 0.3, cut by 2 edges, still a step
  darker than the subject's plane (CRAFT §f.2's near steps; the posters' frames sit a median 9 L* under their heroes);
  open ground <= 15 % of the frame. v2's S5 landing already does it (above). 9:16 helps: the frame goes where nothing may
  be read anyway, y > 1520 under the bottom UI and the side edges (G5_BLOCKING §2: "dressing may run under them"), the
  subject stays in y 600-1480, the caption band stays sky. `lib/depth` `nearStep` (5/10/13/14 L*) gets a floor in
  absolute value; `check_depth.py` gets a NEAR part (WARN: the nearest plane over L* 60, closer than 30 to the air,
  edges under 0.3, or ground over 20 % of the frame), the near end of `pro_1_depth.md`'s VALUE part. On a phone the dark
  frame is what reads first; in motion it is the layer that moves (L5).
- *Cost:* M (a frame per set; the check part). *Risk:* the frame outweighs the subject (CRAFT's failures: "near planes
  get value range, not prop count"): few large shapes, no outline, dark but calm.
- *Clash:* CRAFT §b tier C, "local contrast <= 7": the posters' frames run 7.9-12. The new rule 6 ("a full value range
  ... a few real darks", owner, 2026-10-28) supports the values; the contrast is the owner's call (Q3).

**L2. The designed view: one low near eye level, and the far city lifted onto a far stage** (the owner's observation 7).
- *Evidence:* 1.1-1.2: the near eye at 0.67-0.80 of the height, the far horizon 0.14-0.27 higher in Hanoi, Buenos Aires
  and Cape Town; each zone consistent; every junction hidden; no receding line in the far zone.
- *In our films:* W1 writes, per exterior set, the near camera (eye level y, height 1.6-5 m, VPs) and, only if the set
  wants the panorama, a far stage: the far city, its water and the scale anchor on their own horizon (in 9:16 about
  y 1090-1215 against a near eye level at y 1380-1480; `img/perspective_916.jpg`), behind a hiding band (water, a tree
  line, a wall, roofs) that carries no receding line. `lib/persp` gains `farStage({horizon})` (frontal quads standing on
  the stage horizon); `lib/depth` `sizeProblems` and the depth sheet accept things tagged `stage: 'far'` (measured
  against the stage horizon, so the view does not WARN "two cameras"). In motion both horizons hold still (they are at
  infinity): the float and a crane move the near layers by their share and the stage hardly at all, so the stack stays
  coherent; a truck along the junction is the one move that could expose it (keep receding lines on the near side).
- *Per shot type in 9:16* (`img/perspective_916.jpg` places the posters' median bands with the tallest top at y 620):

  | Shot type | Eye level / horizon | Camera | What the posters add |
  |---|---|---|---|
  | place-led vista, establishing shot, a scale landing | near eye ~0.72-0.77 H (y 1380-1480; the posters' median maps to 1459); far stage ~0.57-0.63 H (y 1090-1215; the three lifted posters map to 1088-1189); tallest top >= y 620; hero top ~0.45 H | 1.7-5 m, or raised over the roofs with ONE horizon at ~0.60-0.70 H (Reykjavik, Singapore) | the designed view; the frame under the UI; CG's S1/S5 landings (0.40-0.46 H) stay the Arcane option |
  | figure-led street or bank (a person is the subject) | the subject's head on the eye level, 0.50-0.60 H (`layout.md` §2), so the figure stays in the read zone | 1.6 m standing; a 2.5-5 m first-floor camera shows a figure below the horizon but small (~120 px at 20 m, est.) | the near frame (L1), the off-centre VP (L4); a far stage only between the head and the caption band (y >= 620) |
  | big sky, one landmark (CG S3) | ~0.73 H, as CG S3 | eye level from a rooftop | the hero's hidden base and its size beyond one camera (L3) |

  A low poster horizon cannot be copied into a figure-led shot: an eye-level camera puts the subject's head on the
  horizon, and at 0.74 H the body would fall under the bottom UI.
- *Cost:* M. *Risk:* a thin or missing hiding band reads as "a backdrop on a floor" (CRAFT's failure list).
- *Clash:* CRAFT §f.4-5, "ONE camera per shot for every ground, wall, figure and particle"; "a camera too low for the
  foreground's things is raised, not cheated". The owner decides (Q1).

**L3. The hero: huge yet far.**
- *Evidence:* 1.5: 21-45 % of the height, base hidden in 5 of 7, 1.4-3.6x one camera, paler than the frame.
- *In our films:* CINEMATIC_GUIDE "Scale cues" 7 already asks for it (units 2x the mid windows; v2's obelisk ~4x). Add:
  the base hidden behind a band, never standing on a visible ground line where the eye could measure its distance; a
  frontal elevation (no convergence); its top in open sky at y >= 620; its enlargement declared in W1 and exempted in
  `sizeProblems` (`hero: true`). On a phone a big calm silhouette is the strongest read in the frame.
- *Cost:* S. *Risk:* low. *Clash:* none.

**L4. Turn the camera: off-centre VPs, gentle convergence, elevations for landmarks.**
- *Evidence:* 1.1-1.2: VPs at or past a side edge, families within ~+-15 deg, verticals parallel; v2 centres its VP in
  5 of 8 shots, fanning +-72-79 deg.
- *In our films:* exterior sets default to a yawed camera (`groundCam` `yaw` 20-25 deg puts the VP at or past a side
  edge with f 1400; CRAFT §f.4 already allows "a 15-30 deg turn into two-point"), landmarks frontal; a lint WARNs when an
  exterior set's VP x falls in 0.35-0.65 W. A centred one-point stays a choice for a corridor beat (v1's streets
  performed well). Off-centre recession also leaves the centre column to the subject and the captions.
- *Cost:* S. *Risk:* low. *Clash:* none.

**L5. The planes become the float's layers, moved by their measured scale; the camera moves through the stack.**
- *Evidence:* Appendix B: per metre the far planes are 0.02-0.40 of the frame (median 0.12), the mid 0.35 (0.06-0.73),
  the background has no unit (~0), the sky 0. `lib/depth` `PARALLAX_K` gives the subject's plane 0.6, +1 0.45, +2 0.35,
  +3 0.15: for a poster-like stack the mid and far slide 2-4x more than their drawn size says (`pro_1_depth.md` §3.4
  finds the same).
- *In our films:* DIRECTION rule 8's parallax float takes each plane's share from its scale: k = the plane's px per
  metre / the near frame's (`groundCam.scale(z)`, or W1's unit sizes). A crane of 0.25 m moves Copenhagen's bicycle
  77 px, its facade row 5 px, the Round Tower 2 px, the ghost blocks and sky 0: the frame drops away, the stack is
  revealed (the S1 rise-over's shape). A 1 m push (f 1400, est.) grows the frame x1.28 and the row x1.014: the frame
  opens like curtains, the hero holds. With frame-to-far scale ratios of 2.5-47x (median ~10) every move is mostly a
  near-frame move, so the frame is designed as the layer that moves.
- *Cost:* S (a helper and a lint: neighbours' k >= 1.8x apart, COZY_AND_SCALE §4). *Risk:* a float that moves only the
  foreground; keep it small (+-12 px).

**L6. What W1, G3 and the tools record** (enables L1-L5; CRAFT §f.1 already asks W1 for the planes, the AIR and the
camera): per set the near eye level y and camera height, the VPs (off-centre), the far stage if any (horizon, hiding
band), the near frame (objects, edges, value), each plane's unit size (px per metre: its float share), the hero
(frontal, enlargement, base occluder). G3 draws them in grey and plays every move through the layers (the float, a
crane, a push), so a junction that would break in motion breaks on the board. `check_depth.py` reports the VPs of every
declared structure (one camera within +-2 % of the height, or a declared stage) and, optionally, the overlap share
(onnxruntime and a 99 MB model; information only). This script's `frame` command already measures a still against its
sheet. *Cost:* S-M. *Risk:* more fields at W1; they replace guesses at G5.

## 5. What not to take
- **The patchwork as a ground** (Singapore's bay, Hanoi's and Buenos Aires' bottom quilts): level flat bands; on our
  floors they bring back the "elevation" signature and busy level lines in motion. At most a far texture (the style
  lens's open question 2).
- **Three eye levels in one picture** (Buenos Aires 0.80 / 0.67 / 0.53; Kyoto's veranda at 0.90): a still hides it, a
  camera move along a junction shows it. One near camera and at most one declared far stage.
- **Strangers in the foreground** (Hanoi's cyclo rider and the woman in the hat): retired in DIRECTION ("strangers'
  backs in the foreground, in any film"); the frame stays things.
- **The 3:4 framing with a title over the sky:** our captions own that band (composition and layout lenses).
- **A real skyline moved together as is:** every film's world is drawn new (playbook); take the construction, not the
  places.

## 6. Open questions for the owner
1. **The designed view:** may an exterior shot lift its far city onto its own horizon (a "far stage" 0.14-0.27 of the
   frame above the near eye level, the join hidden by water or trees), as Hanoi, Buenos Aires and Cape Town do, instead
   of one camera for everything (CRAFT §f.4-5)?
2. **Rule 2:** may landmarks, far rows and house rows be flat elevations when they overlap and step smaller and paler
   toward the air, keeping "never" for floor bands seen edge to edge (v2 S3, S4)?
3. **The bottom of the frame:** a dark, detailed near frame (leaves, a rail, a rock, roof edges) under the bottom UI and
   on the side edges, with the eye lowered to ~0.72-0.77 of the frame, in place of open pale ground (v2 S1: 37 % of the
   frame), even if it passes tier C's contrast cap (<= 7; the posters' frames 7.9-12)?

## Appendix A: the planes, per poster (rank 1 = nearest; dE76 of the plane's mean to the air; edges = share of px on a colour step > 6 per px; depth net = median relative depth, 1 near, 0 far)

**Singapore** (Marina Bay Sands): eye levels one camera 0.70 H; overlap share 0.28; ground and water 6 % of the frame; bottom fifth 89 % near masses, 6 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: leaves | 0.80-0.99 | 4 % | 40 | 17 | 45 | 0.39 | 9.4 | 0.75 |
| 2 near: shophouses, stairs | 0.73-0.99 | 16 % | 59 | 16 | 32 | 0.45 | 11.1 | 0.45 |
| 3 mid: Merlion, Supertrees | 0.48-0.74 | 8 % | 52 | 11 | 31 | 0.59 | 11.5 | 0.17 |
| 3 water: the bay (ground) | 0.70-0.83 | 6 % | 71 | 13 | 20 | 0.33 | 6.2 | 0.14 |
| 4 **Marina Bay Sands** (hero) | 0.41-0.62 | 7 % | 53 | 14 | 32 | 0.38 | 7.6 | 0.05 |
| 4 far: the far shore, museum | 0.56-0.70 | 7 % | 58 | 12 | 29 | 0.52 | 11.0 | 0.09 |
| 5 bg: far towers, ghost blocks | 0.19-0.60 | 4 % | 83 | 7 | 12 | 0.13 | 3.1 | 0.02 |
| 6 sky | 0.16-0.34 | 13 % | 86 | 4 | 3 | 0.00 | 0.5 | 0.00 |

**Reykjavik** (Hallgrimskirkja): eye levels one camera 0.62 H; overlap share 0.13; ground and water 6 % of the frame; bottom fifth 59 % near masses, 23 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: the nearest houses | 0.89-1.00 | 7 % | 58 | 19 | 34 | 0.46 | 7.9 | 0.91 |
| 2 near: house rows 2-4 | 0.73-0.89 | 9 % | 55 | 10 | 27 | 0.34 | 9.3 | 0.61 |
| 3 **Hallgrimskirkja** (hero) | 0.32-0.69 | 7 % | 70 | 9 | 17 | 0.47 | 8.2 | 0.28 |
| 3 mid: Harpa | 0.64-0.77 | 6 % | 53 | 12 | 32 | 0.59 | 7.6 | 0.23 |
| 3 water: the harbour, Sun Voyager (ground) | 0.78-0.91 | 5 % | 54 | 15 | 30 | 0.46 | 8.3 | 0.36 |
| 4 far: the sea (ground) | 0.62-0.68 | 0 % | 61 | 18 | 20 | 0.15 | 4.4 | 0.03 |
| 5 bg: the mountains (Esja) | 0.55-0.61 | 3 % | 74 | 4 | 9 | 0.44 | 6.2 | 0.01 |
| 6 sky | 0.13-0.32 | 10 % | 87 | 4 | 4 | 0.00 | 0.4 | 0.00 |

**Hanoi** (One Pillar Pagoda): eye levels near/mid eye level 0.75 H; far horizon 0.57 H; overlap share 0.26; ground and water 10 % of the frame; bottom fifth 54 % near masses, 32 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: cyclo, woman, flowers | 0.81-1.00 | 10 % | 42 | 12 | 49 | 0.54 | 9.4 | 0.64 |
| 2 near ground: patchwork blocks (ground) | 0.80-1.00 | 6 % | 62 | 16 | 39 | 0.24 | 6.6 | 0.47 |
| 2 near: street, shophouses, lanterns | 0.51-0.97 | 7 % | 36 | 21 | 55 | 0.55 | 10.2 | 0.38 |
| 3 **One Pillar Pagoda** (hero) | 0.54-0.84 | 7 % | 41 | 11 | 53 | 0.55 | 12.4 | 0.34 |
| 3 mid: bridge, Ngoc Son gate, trees | 0.56-0.76 | 8 % | 41 | 18 | 49 | 0.75 | 10.4 | 0.16 |
| 3 water: the lake (ground) | 0.57-0.89 | 5 % | 50 | 14 | 41 | 0.45 | 8.8 | 0.22 |
| 4 far: Turtle Tower, tree band | 0.47-0.56 | 3 % | 51 | 21 | 41 | 0.55 | 7.2 | 0.03 |
| 4 far: the colonial row (right) | 0.41-0.53 | 3 % | 59 | 18 | 35 | 0.70 | 13.2 | 0.07 |
| 5 bg: far towers, ghost blocks | 0.37-0.47 | 4 % | 93 | 12 | 8 | 0.20 | 4.9 | 0.00 |
| 6 sky | 0.18-0.32 | 6 % | 93 | 12 | 2 | 0.00 | 0.4 | 0.00 |

**Buenos Aires** (the Obelisco): eye levels near-left eye level 0.80 H; near-right eye level 0.67 H; far horizon 0.53 H; overlap share 0.49; ground and water 9 % of the frame; bottom fifth 72 % near masses, 24 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: La Boca houses, cafe | 0.61-0.99 | 16 % | 48 | 22 | 49 | 0.57 | 12.0 | 0.75 |
| 1 frame: jacaranda (bottom right) | 0.89-0.99 | 1 % | 43 | 38 | 65 | 0.68 | 7.6 | 0.73 |
| 2 near ground: the plaza patchwork (ground) | 0.74-0.99 | 8 % | 53 | 14 | 38 | 0.48 | 10.6 | 0.47 |
| 2 near: Casa Rosada | 0.63-0.89 | 11 % | 57 | 22 | 41 | 0.68 | 11.9 | 0.37 |
| 3 mid: the avenue, trees, plinth | 0.57-0.72 | 4 % | 50 | 14 | 43 | 0.73 | 10.3 | 0.13 |
| 3 mid: the domed building (left) | 0.36-0.63 | 5 % | 61 | 13 | 33 | 0.61 | 13.7 | 0.28 |
| 4 **the Obelisco** (hero) | 0.27-0.67 | 2 % | 74 | 6 | 16 | 0.16 | 10.2 | 0.23 |
| 5 far: far city blocks | 0.48-0.62 | 5 % | 70 | 11 | 26 | 0.39 | 7.6 | 0.04 |
| 6 bg: the river, far shore (ground) | 0.53-0.56 | 1 % | 71 | 11 | 28 | 0.49 | 6.4 | 0.01 |
| 7 sky | 0.13-0.37 | 19 % | 93 | 8 | 1 | 0.01 | 0.5 | 0.00 |

**Cape Town** (Table Mountain): eye levels near eye level 0.77 H; far horizon 0.59 H; overlap share 0.61; ground and water 7 % of the frame; bottom fifth 82 % near masses, 6 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: proteas, stairs | 0.79-1.00 | 9 % | 47 | 16 | 42 | 0.52 | 10.2 | 0.91 |
| 2 near ground: the street (ground) | 0.91-1.00 | 3 % | 35 | 10 | 51 | 0.28 | 7.2 | 0.26 |
| 2 near: Bo-Kaap houses | 0.54-0.99 | 17 % | 62 | 18 | 34 | 0.44 | 12.0 | 0.19 |
| 3 mid: lower houses, palm, gardens | 0.71-0.90 | 5 % | 57 | 13 | 33 | 0.54 | 15.3 | 0.12 |
| 4 mid-far: harbour, city towers | 0.55-0.69 | 10 % | 50 | 12 | 33 | 0.56 | 11.2 | 0.05 |
| 4 water: the sea (ground) | 0.60-0.77 | 3 % | 42 | 30 | 45 | 0.26 | 7.7 | 0.04 |
| 5 far: the far coast | 0.55-0.59 | 2 % | 59 | 7 | 28 | 0.58 | 5.8 | 0.01 |
| 6 **Table Mountain, Lion's Head** (hero) | 0.39-0.55 | 13 % | 56 | 6 | 29 | 0.39 | 5.3 | 0.01 |
| 7 sky | 0.16-0.30 | 10 % | 85 | 6 | 3 | 0.00 | 0.4 | 0.00 |

**Copenhagen** (Nyhavn): eye levels one camera 0.74 H; overlap share 0.23; ground and water 7 % of the frame; bottom fifth 26 % near masses, 34 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: the mermaid on her rock | 0.69-0.99 | 7 % | 52 | 11 | 44 | 0.40 | 9.6 | 0.91 |
| 1 frame: the quay paving (ground) | 0.95-0.99 | 3 % | 45 | 17 | 46 | 0.36 | 9.9 | 0.94 |
| 2 near: the water (patchwork) (ground) | 0.79-0.93 | 4 % | 54 | 12 | 40 | 0.41 | 12.5 | 0.34 |
| 3 **Nyhavn facades** (hero) | 0.49-0.71 | 11 % | 52 | 16 | 42 | 0.71 | 12.0 | 0.15 |
| 3 near-mid: boats, the quay | 0.71-0.79 | 6 % | 43 | 14 | 47 | 0.81 | 16.0 | 0.16 |
| 4 far: Our Saviour spire | 0.26-0.53 | 2 % | 33 | 13 | 52 | 0.77 | 14.2 | 0.14 |
| 4 far: Round Tower, Marble Church, far row | 0.51-0.71 | 5 % | 70 | 11 | 27 | 0.47 | 9.4 | 0.07 |
| 5 bg: ghost blocks | 0.43-0.65 | 2 % | 84 | 10 | 12 | 0.14 | 4.5 | 0.04 |
| 6 sky | 0.19-0.39 | 12 % | 87 | 8 | 6 | 0.00 | 0.5 | 0.00 |

**Kyoto** (Kinkaku-ji): eye levels mid eye level 0.72 H; near eye level 0.76 H; near 0.90 H; overlap share 0.48; ground and water 8 % of the frame; bottom fifth 46 % near masses, 16 % ground.

| rank, plane | y (frac.) | share | L* | C* | dE air | edges | contrast | depth net |
|---|---|---|---|---|---|---|---|---|
| 1 frame: maple, veranda, bamboo | 0.56-0.99 | 14 % | 39 | 20 | 55 | 0.62 | 8.6 | 0.75 |
| 2 near: torii tunnel, its bank | 0.65-0.82 | 6 % | 37 | 31 | 59 | 0.60 | 7.8 | 0.52 |
| 3 **Kinkaku-ji** (hero) | 0.49-0.70 | 8 % | 42 | 14 | 49 | 0.62 | 10.7 | 0.20 |
| 3 mid: trees, roofs, the bridge | 0.56-0.92 | 10 % | 47 | 22 | 46 | 0.54 | 9.1 | 0.39 |
| 3 water: the pond (ground) | 0.71-0.91 | 8 % | 60 | 22 | 38 | 0.48 | 6.5 | 0.33 |
| 4 far: pagoda, the central hall | 0.35-0.55 | 4 % | 51 | 8 | 40 | 0.56 | 11.0 | 0.14 |
| 5 bg: mountains, ghost blocks | 0.40-0.49 | 7 % | 85 | 6 | 10 | 0.09 | 3.3 | 0.02 |
| 6 sky | 0.16-0.37 | 13 % | 93 | 6 | 0 | 0.00 | 0.4 | 0.00 |

## Appendix B: units and each plane's share of a float or crane (by eye on 2-3x crops with a 10 px grid, +-10 %; real sizes est.)

| Poster | units, nearest -> farthest (px; est. real size) | float share k (px/m over the nearest) |
|---|---|---|
| Singapore | shophouse window (arched) 58 (2.0 m) -> MBS floor band 8 (3.2 m) -> far towers, ghost blocks: none | r2 1.00, r4 0.09 |
| Reykjavik | nearest house window 30 (1.5 m) -> row-2 house window 30 (1.5 m) -> Harpa glass panel row 12 (1.5 m) -> Hallgrimskirkja belfry lancet 47 (6 m) -> mountains: none | r1 1.00, r2 1.00, r3 0.40 |
| Hanoi | cyclo wheel 110 (0.65 m) -> person on the bridge 50 (1.65 m) -> colonial facade window 45 (2.2 m) -> far towers, ghost blocks: none | r1 1.00, r3 0.18, r4 0.12 |
| Buenos Aires | La Boca window 90 (1.8 m) -> Casa Rosada window (arched) 65 (3.0 m) -> domed building window 58 (2.5 m) -> car on the avenue 10 (1.5 m) -> far city blocks: none | r1 1.00, r2 0.43, r3 0.30 |
| Cape Town | Bo-Kaap window (pink house) 75 (1.6 m) -> lower house window 45 (1.6 m) -> harbour building window 7 (1.5 m) -> far coast house 5 (5 m) -> Table Mountain: none | r2 1.00, r3 0.60, r4 0.10, r5 0.02 |
| Copenhagen | bicycle wheel 215 (0.7 m) -> facade window, nearest house 37 (1.5 m) -> facade window, mid row 28 (1.5 m) -> facade window, far end of the row 20 (1.5 m) -> Round Tower window 15 (2.0 m) -> ghost blocks: none | r1 1.00, r3 0.06, r4 0.02 |
| Kyoto | veranda baluster bay 62 (1.8 m) -> Kinkaku-ji upper window 30 (1.2 m) -> pagoda tier 63 (9 m) -> mountains: none | r1 1.00, r3 0.73, r4 0.20 |

k = the plane's px per metre over the nearest measured plane's (sizes, sideways float shifts and crane shifts all go
as 1/distance). No poster gives its background a unit: ghost blocks and mountain layers carry no windows or storeys.

## Appendix C: method and its limits
- **Masks:** `ui_mask.json` (the page counter, the mute button, the black bars) in every measurement; the title box
  also out of the line count. Coordinates are the screenshots' px (1206 wide).
- **Lines:** OpenCV LSD; segments >= 2 % of the width (1.5 % inside a structure box) whose median colour step across
  (3 px each side) is >= dE76 6: paper grain and soft brushwork drop out. Level / vertical = within 3 deg.
- **Vanishing points:** seeded RANSAC over a structure box's sloped segments (exactly level ones, <= 1 deg, counted
  apart as frontal), inliers within 1.5 deg, refined by least squares; up to 3 per box, each >= 12 % of the sloped
  length; "parallel" beyond 6 image diagonals. An eye level from a structure = its strongest finite VP, skipping a
  near-parallel family far out (spread < 2 deg and > 3 widths off-centre). The torii tunnel's VP is by eye.
- **Camera height** = m x (base - horizon) / (base - top), with guessed real sizes (est.): metres are +-30 % (est.); the
  ratios between things in one poster are firmer than the metres.
- **Planes:** polygons drawn by eye (the overlay in `img/perspective_planes.jpg`), measured at 540 px wide with
  `scripts/qa/check_depth.py`'s definitions (CIE L*a*b* via OpenCV's float path; the AIR = the sky-like px of a box on
  the sky's lowest open patch). Medians are robust to a few px of boundary. Our films: their own depth sheets' boxes.
- **Depth network:** Depth Anything V2 small, ONNX export (fabio-sim/Depth-Anything-ONNX release v2.0.0,
  `depth_anything_v2_vits.onnx`, sha256 d2b11a11...62be, 99 MB, run locally with onnxruntime; not in the repo). It is
  trained on photographs and squeezes each picture to 518 x 518: a proxy for how the cues read, not a measurement.
  Cropping a v2 still to 3:4 changes its overlap share by <= 0.03 for S1 and S4 (0.05-0.07; 0.03-0.06).
- **Not measured here:** silhouette separation (the style and pro lenses), the sky (style), detail placement (details).
