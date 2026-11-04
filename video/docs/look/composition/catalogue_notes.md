# CATALOGUE NOTES: how the one catalogue was built (every merge, every dedup, the counts)

The owner (2026-10-30): "I think overall I would expect you to break down all mine references and whatever you research
on other composition strategies and on what makes a composition to be engaging and capturing attention and like a a
super moden modern cinematography / And then we would rank them and have a library and a set of guidelines on when to
use one or other and how animations and transitions fit into this". The playbook: "The owner's references are the SPINE
of a distillation; ours come second, labelled."

**What this is.** The notes behind `catalogue.json`: the codes, every merge and dedup decision (one line each) and the
counts. **The files** (this folder):
- `catalogue.json`: 103 choices a director can make, in three families: **frame** (how the shot is composed, 67),
  **move** (motion inside a shot, 17), **join** (between shots, 19). In each family the owner's items come first
  (`source: "owner"`, under his names, in his reels' order), then ours (`source: "ours"`). The fields are `id, family,
  name, source, ref, what, numbers, says, pairs_with, engine, prior_verdict, note`. The `note` field names what was
  merged into the entry.
- `catalogue_prior.json`: the earlier scores (attention.md 1-5, modern.md 0-15, motion.md 0-12, CINEMATIC_GUIDE's
  reviewer marks), keyed by catalogue id, kept out of the catalogue so the three judges score blind.
- `principles.json`: 130 rules that hold for every shot, so they are not choices (attention levers L1-L15, AR1-AR18, the
  rule-type M principles, MR1-MR24, the library's rules CS1-CS13, cinema C1-C14, vertical V1-V14, organic R1-R12). Each
  has `id, kind, name, rule, numbers, evidence, source, catalogue` (the entries it bears on).

**Rank.** Research notes, the lowest rank on DIRECTION's ladder; nothing here changes a doc in force. The sources are
`../COMPOSITION_SHOTS.md` Part 1 (the device catalogue), `reels.md`, `attention.md`, `modern.md`, `motion.md`,
`cinema.md`, `vertical.md`, `../organic/composition.md`, `../CINEMATIC_GUIDE.md`, `../COZY_AND_SCALE.md` and
`../research/cine_light.md` / `cine_motion.md` (Arcane's joins T1-T10 and presets P1-P10).

## 1. Counts

**By family, source and prior verdict** (the verdict the docs gave; NONE = never judged as an entry of its own):

| family | source | YES | ADAPT | REJECT | NONE | total |
|---|---|---|---|---|---|---|
| frame | owner: the 41 (A1-E11) + T, + 2 treatments seen in his reels (X1, X2) | 24 | 18 | 2 | 0 | 44 |
| frame | ours | 14 | 4 | 4 | 1 | 23 |
| move | owner: what his reels' shots do (RM1-RM9) | 1 | 6 | 1 | 1 | 9 |
| move | ours | 5 | 0 | 3 | 0 | 8 |
| join | owner: how his reels join their ideas (RJ1-RJ4, X3) | 0 | 3 | 2 | 0 | 5 |
| join | ours | 8 | 3 | 2 | 1 | 14 |
| **all** | | **52** | **34** | **14** | **3** | **103** |

**The owner's coverage.** All 41 ideas of his five reels are entries, in his reels' order and under his names (A1-A7,
B1-B13, C1-C3, D1-D7, E1-E11): 24 YES, 17 ADAPT, 0 REJECT, as `../COMPOSITION_SHOTS.md` D4 has them; plus his reels'
own device T (ADAPT). Everything else his reels show is an entry too: the two treatments we reject (X1 blur, X2 the
title over the shot), the nine kinds of motion measured in his shots (RM1-RM9) and his five kinds of join (RJ1-RJ4,
X3). No owner item is merged into anything of ours; ours are merged into his.

**Engine** (what exists to make each choice): exists 78, partly 15, new 1 (J9, the whip, never built), n/a 9 (rejected
treatments with nothing in the engine; the rejects X8, X9 and RM9 exist in code and stay unused). Partly: A4, B4, B7,
B12, E11, N3, N5, N12 (frames); RM6, I11 (moves); J8, J10, J11, J13, J15 (joins).

## 2. The codes

- **Kept as they were:** the owner's A1-E11 and T (`reels.md`); our N1-N15 (`../COMPOSITION_SHOTS.md` D2, less the
  three merged: N4, N8, N10); I4, I5, I6, I11, I12 and J2-J11, J13, J15 (`motion.md`); X1-X6
  (`../COMPOSITION_SHOTS.md` D3); M3 (`modern.md`); S2 (`../CINEMATIC_GUIDE.md`); K8 (`../COZY_AND_SCALE.md`); T2
  (Arcane's pinned-anchor join, `../research/cine_light.md` 4: not the owner's T).
- **New codes:**
  - **RM1-RM9**: the owner's reels' moves, in `motion.md` 1.2's order (the subject travels, the world passes, the camera
    rides, the slow push, the slow pan, the burst, nothing moves), then reel 03's live pen and its handheld pass.
  - **RJ1-RJ4**: the owner's reels' joins (`motion.md` 1.1): the cut through the black line card, the hard cut, the
    loop, reel 03's continuous take (his fifth join, the fade, keeps its code X3).
  - **Z1-Z4**: the shot sizes of `cinema.md` 2 (extreme wide, wide, medium, insert; the close is N9).
  - **X7-X11**: rejects new to the catalogue (X7 isometric views, X8 forced three-point perspective, X9 a zoom in a
    hold, X10 the crash zoom, X11 effect transitions).
- **Where a retired code now lives** (merged in, its code kept in the entry's `note`): I1 -> RM7, I2 -> RM5, I3 -> RM4,
  I7 -> RM3, I8 -> RM1, I9 -> RM2, I10 -> RM8, J1 -> RJ4, J12 -> RJ3, J14 -> RJ2, N4 -> B10, N8 -> B8, N10 -> E3; the M,
  K, S, P and T codes: section 3.

## 3. Merge and dedup decisions (one line each)

**The rule used.** When one of ours covers the same choice as one of the owner's, it goes INTO his entry as a note under
his name. When two of ours cover the same choice, the older code stays (`../COMPOSITION_SHOTS.md`'s N, `motion.md`'s I
and J). A principle that is a rule for every shot goes to `principles.json`; when it is also a choice, the choice is
merged into its entry and the rule kept in `principles.json` (marked "dual" below).

### Frame family

1. N4 the repoussoir -> B10 L-shape: the L's tall side cut by the edge IS the one framing wing; N4's numbers (one side,
   <= 216 px, never two equal wings) now in B10.
2. N8 the zigzag way in -> B8 S-curve: the same winding entry into the depth, in angular legs or as receding accents;
   its numbers (2-3 legs >= 150 px alternating sides, ending within 40 px of the focal's box) now in B8.
3. N10 the pivot -> E3 stillness against motion: the same still subject in a moving world, with the camera moving; its
   motion stays a move of its own, I12.
4. E9 (frame) and RM1 (move) are one reel observation seen from two families: E9 keeps the layout (a locked frame built
   as a path), RM1 the motion (speeds, timing); E9 stays so the owner's 41 read complete.
5. E3 (frame) and RM2 (move): the same split; E3 the still subject and its band, RM2 the passing world's speeds.
6. T (frame) and RM8 (move): T is frame 0 drawn as the line; RM8 is the live pen and the build.
7. B5 parallel lines (frame) and RM3 the camera rides the lines (move): one reel example; B5 holds the lines, RM3 the
   ride.
8. M1 centre-weighted framing -> N1 (the choice); its rule (the crop-safe stage) -> principles M1 (dual).
9. M2 negative space -> D1.
10. M3 short-siding and the low quadrant: kept as its own entry, not merged into N15: N15 breaks the balance (no
    counterweight), M3 breaks the lead room or the headroom; both serve the turn.
11. M3's 'low quadrant as a house style' (`modern.md` 7) -> M3's note (not ours).
12. M4 formal symmetry, then the break -> A7.
13. M5 stack in depth -> N6 (the choice); its move-along-Z rule -> principles M5 (dual).
14. M6 the look-through -> C2 foreground.
15. M7 height as meaning, split: eye level -> N3, low -> N11, high and top-down -> N12, overhead as paper -> Z4; its rule
    -> principles M7 (dual).
16. M8 one bold colour -> E8 (the choice); its rule -> principles M8 (dual).
17. M9 the practical as the story light -> E2 (the choice); its rule -> principles M9 (dual).
18. M10 drawn depth instead of blur -> principles (a rendering rule), named on E5 and X1.
19. `cinema.md` 4.1 thirds as proportions -> A1.
20. `cinema.md` 4.2 the spiral variant -> A4; its dynamic symmetry and the reciprocal -> A5.
21. `cinema.md` 4.3 the centre and symmetry -> A7 (its centring half is N1's).
22. `cinema.md` 4.4 the steelyard and R8 -> D4.
23. `cinema.md` 4.5 Poore's entrance -> B1; its zigzag -> B8 (with N8).
24. `cinema.md` 4.6 frames within frames -> C1; the repoussoir and the coulisse -> B10.
25. `cinema.md` 4.7 lead room -> E4; headroom -> N5.
26. `cinema.md` 4.8 depth layering, the three distances -> N6.
27. `cinema.md` 4.9 diagonals -> B6.
28. `cinema.md` 4.10 the pyramid -> D5; the inverted triangle -> B11.
29. `cinema.md` 4.11 the S and the line of beauty -> B8; Poore's circuit -> B9.
30. `cinema.md` 4.12 radial lines and the vanishing point -> B2.
31. `cinema.md` 4.13-4.14 notan, counterchange, value grouping -> N7 (the rule parts: R1, R2, R10, CS5).
32. `cinema.md` 4.15 pattern and rhythm -> D7.
33. `cinema.md` 6.2 radiating pathways -> B3; the spiral pathway -> B12.
34. `cinema.md` 2 the size ladder: extreme wide -> Z1, wide -> Z2, medium -> Z3 (new), close -> N9 (merged), insert ->
    Z4 (new); the stepping rule -> principles C4, CS11.
35. `cinema.md` 3.1 angles: eye level -> N3, high -> N12, low and worm's-eye -> N11, overhead -> Z4, Dutch -> X5.
36. `cinema.md` 3.3 the two camera setups A and B and the horizon-cut rule -> N3 (and C3 in principles).
37. `cinema.md` 3.3 'vertical placement by nature' [S11] (what lives above us sits above the centre): a nudge, not an
    entry; left in `cinema.md` 3.3 for the guidelines.
38. `cinema.md` 5 staging: the gaze cue -> E4; the silhouette test, 'overlap or air', 'one idea at a time', the
    background's quarter second -> principles C13, CS10, R3.
39. `cinema.md` 7 the colour and value scripts -> principles C11.
40. `vertical.md` 6 'a stage under a sky of words' -> N2; 'everything on the axis' -> N1; 'few sets, re-framed' and 'height,
    not width' -> planning rules (DIRECTION's one home place; principles M5, M18), not entries.
41. `COZY_AND_SCALE.md` K6 the locked tiny-figure wide -> D2 (frame) and RM7 (its locked camera).
42. `COZY_AND_SCALE.md` K7 the worm's-eye on the colossus -> N11.
43. `COZY_AND_SCALE.md` K8 the shaft: kept as its own entry (no owner idea or N covers a light shaft with its pool); its
    other form, one warm window in a cold grid -> D7.
44. `COZY_AND_SCALE.md` K10 the high angle from the institution -> N12 (with Arcane P9, the high widen, as its motion).
45. `CINEMATIC_GUIDE.md` S2 the sun behind the roofline: kept as its own entry (the light source as the subject, the
    world in silhouette: no owner idea covers it).
46. `CINEMATIC_GUIDE.md` S3 big sky, one landmark, and S4 the low-horizon breather -> D1 negative space.
47. The enclosure framings NOOK, LANE, BALCONY, RIVERSIDE and the canyon (`../LAYOUT.md` 2, `../COZY_AND_SCALE.md` 2)
    are combinations, not single choices: NOOK and LANE -> N13 + B10 + C1; BALCONY -> B9 + N12; the canyon -> B11.
48. The recipes SR1-SR24 (`../COMPOSITION_SHOTS.md` Part 2) are combinations of entries, not entries; every device code
    they name exists here (or its merge target above).
49. attention.md: no new frame device (its devices are the owner's 41, scored in its 7: the scores -> `catalogue_prior.json`).
50. modern.md 7's look-only rejects are not composition, move or join choices and are left out: complementary two-colour
    neon light, volumetric shafts as a show (named on K8), the flat 'streaming look', loud grain, torn paper and
    collage; the colour-offset defocus -> X1.
51. modern.md 7's kinetic titles -> X2; split screens, picture-in-picture and talking heads -> X4; Dutch angles, roll
    and spin joins -> X5 (spin joins also X11); isometric views -> X7 (new); forced three-point perspective -> X8 (new,
    with `../CINEMATIC_GUIDE.md` 'Not for us').
52. Shallow focus, bokeh and the rack focus -> X1 (the reels' blur); the rack focus's job is I11's.

### Move family

53. I8 the subject travels a held frame -> RM1 (the owner's E9 in motion).
54. I9 the world passes a still subject -> RM2 (the owner's E3 in motion).
55. I7 the follow -> RM3 (the escalator ride; `motion.md` 1.3: 'take it as a follow along parallels').
56. I3 the story push -> RM4 (the reels' slow push), with its visibility floor (>= 3 % in <= 2 s).
57. K5 the slow push to the vista, Arcane P4a the lean-in and P4b the drawn-in push -> RM4.
58. M14's push half (looming) -> RM4; its pull half (a pull needs its own event) -> I4; its rule -> principles M14 (dual).
59. modern.md 2's corridor push and the FPV fly-through -> RM4 (as a chain of pushes) and RJ4 (the continuous take).
60. I2 the parallax float -> RM5 (the reels' slow pan and small drifts become our float: DIRECTION rule 8).
61. RM6 the burst (04b's fireworks at the spiral's eye): kept as its own owner move; attention.md 8's 'colour flood,
    a light coming on' merged into it; I11 kept apart (it moves the light between two things).
62. I1 the hold and Arcane P1 -> RM7 (the reels' locked frame where nothing moves).
63. I10 the build, M27 the live drawing (its choice half) and attention.md 8's draw-on, pop / grow, slide-in and exit
    rows -> RM8 (reel 03's live pen); M27's rule -> principles M27 (dual).
64. Handheld shake and documentary jitter (`motion.md` 3, `modern.md` 7) and Arcane P10 the shake and lurch -> RM9
    (reel 03's handheld pass, rejected).
65. K4 the pull-back, Arcane P6 the big reveal and P3 the retreat pull -> I4 (with S5, the owner's pick).
66. K2 the tilt-up (its 3-5 % zoom-out dropped as a compound move) and Arcane P7 -> I5.
67. S1 the rise-over and K3 -> I6.
68. The pivot, `cinema.md` 8 -> I12 (its frame form N10 is in E3).
69. A zoom in a hold, the breathe, the per-shot push and Arcane P2 the breath-out -> X9 (new).
70. The crash zoom, punch-ins and Arcane P5 the lunge -> X10 (new).
71. An orbit as its own move -> X6 (with the dolly zoom: both compound moves).
72. Roll as a move -> X5.
73. Speed ramps that stop dead, a linear camera start or stop -> principles MR10 (a rule, not a choice).
74. attention.md 8's parallax float row -> RM5; its camera push-in row -> RM4.

### Join family

75. J1 the continuous camera and M13 the long take -> RJ4 (reel 03's one continuous take).
76. J12 the un-build and the draw-on -> RJ3 (the reels' loop back to the opening frame); its draw-on half is RM8.
77. J14 the plain cut -> RJ2 (the reels' hard cut), with K1 the close-up -> wide jolt, Arcane T8 (the scale cut, light
    held) and T9 (the contrast reset at the turn); jump cuts every 0.5-1 s (`modern.md` 7) noted there as not ours.
78. The dissolve and Arcane T10 the haze-wash dissolve -> X3 (the reels' fade-in under the lines); the reels' overlays
    fading out also -> X3 (ours un-draw: RM8).
79. The dip to black -> RJ1 (the reels' black card); Arcane T3's dip is done as a dark near mass -> J8.
80. The flash to white, spins, glitches, RGB splits and Arcane T4 the flash cut -> X11 (new).
81. Arcane T1 the light-match cut -> J4.
82. Arcane T2 pinned-anchor jump cuts: kept as its own entry (no J covers a run of quick cuts round one pinned anchor);
    its code is Arcane's, not the owner's T.
83. Arcane T5 the eclipse wipe and M22 the wipe by a near mover -> J8.
84. Arcane T6 the temperature flip under motion -> J11.
85. Arcane T7 the bloom push-through, P8 the push-through chain, K9 and M21 the portal -> J2.
86. M20 the feature match: its shape half -> J3, its colour and light half -> J4.
87. M23 sound leads the cut: its join side -> J15; its rule -> principles M23 (dual).
88. M24 the staged morph -> J10.
89. Whip pans with motion blur (`modern.md` 7) -> J9.
90. attention.md 8's plain cut row -> RJ2; 'match on action, carriers A-E' -> J5 and the carried joins; the dissolve
    row -> X3; 'flash, shake, whip pan' -> X11, RM9, J9.
91. The carriers A-F (`../CRAFT.md` a) are categories, not entries: A = J2; B = J3, J4 (and T2 or J10 when the thread
    carries); C = RJ4; D = J7, J8; E = J13 (and J10 to paper); F = RJ2.
92. 'A cut in the middle of a move' -> principles MR21 (a rule).
93. Arcane's sequences Q1-Q4 (`../research/cine_light.md` 5: refuge -> world -> refuge; light -> who -> feeling;
    geography -> dive -> payoff; the threshold) are runs of several shots, not single choices: left for the guidelines.

### Principles

94. Into `principles.json`: L1-L15, AR1-AR18, MR1-MR24, and the M principles that are rules: M1, M5, M7, M8, M9, M10,
    M11, M12, M14, M15, M16, M17, M18, M19, M23, M25, M26, M27, M28, M29 (of these M1, M5, M7, M8, M9, M14, M23 and M27
    are dual: their choice half is merged into a catalogue entry).
95. The device M principles (M2, M3, M4, M6, M13, M20, M21, M22, M24) are catalogue entries or merged into them, so not
    in `principles.json`.
96. Added beyond the task's four groups, so the guidelines have one list: `../COMPOSITION_SHOTS.md`'s 13 rules (as
    CS1-CS13), `cinema.md` C1-C14, `vertical.md` V1-V14 and `../organic/composition.md` R1-R12. They overlap on
    purpose (CS1-CS13 distil C, V and R; each keeps its own evidence); the guidelines merge them.
97. The caption pop (captions pop in place, `attention.md` 8) is a fixed rule (the playbook, M29, L2), not a choice.

## 4. Where the docs' verdicts differ (prior_verdict quotes both)

- `reels.md` 4 counted 26 yes, 12 adapt, 3 weak; `../COMPOSITION_SHOTS.md` D4 (later) 24 YES, 17 ADAPT, 0 REJECT. The
  catalogue's prior_verdict leads with the later one and quotes `reels.md` where it differs: A5 (weak -> ADAPT on the
  stage square), B7 (weak -> ADAPT, once a film), D3 (weak -> ADAPT as a frame), D4 (yes -> ADAPT: the subject stays on
  the axis), E3 (yes without blur -> ADAPT).
- `../COZY_AND_SCALE.md` K2 (2.5-3.2 s, with a zoom-out) against `motion.md` I5 (3.5-4.5 s, no zoom-out): I5's numbers.
- K9 (one push, 1.2-2 s) against Arcane P8 (a chain of two cuts): J2 names both.
- The B match's tolerance (`../CRAFT.md` a: +-8 % and +-20 %) against 150 px and 1.5x (`modern.md` M20): N14, J3 and J4
  use the px numbers (`motion.md` 10.9's proposal), the thread itself within 1.2x.

## 5. How the entries were written

- **ref:** for the owner's items, the reel and the time (as `reels.md` 3 and `motion.md` 1 give them) and what the
  example shows; for ours, the doc and its code.
- **numbers:** our frame (1080 x 1920, the band y 290-600, Instagram's visible x 98-982, the rail x 877-954 from y
  1032, the name block from y 1519) in px, seconds and 60 fps frames; taken from `../COMPOSITION_SHOTS.md` D1-D3 for the
  frames and from `motion.md` 3-5 for the moves and joins, unchanged.
- **says:** the emotion or meaning, from the docs' 'says' or 'serves' lines.
- **pairs_with:** ids in this catalogue, from `motion.md` 2 (each owner idea's move and joins, mapped through section 2's
  codes) and each move's and join's own pairs; every id resolves.
- **engine:** exists / partly / new / n/a with the file or module (`motion.md` 7 for the moves and joins; the code in
  `video/src/lib` and `video/scripts/qa` for the frames).
- **prior_verdict:** YES, ADAPT, REJECT or NONE (never judged as an entry of its own) with the doc and its one-line
  reason. No earlier score appears in `catalogue.json`: they are all in `catalogue_prior.json` (76 entries scored, 27
  never scored; the scales are not comparable).
