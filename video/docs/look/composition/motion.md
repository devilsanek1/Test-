# MOTION: moves inside a shot and joins between shots, for our 9:16 films (research, 2026-10-30)

The owner, verbatim (2026-10-30): "I think overall I would expect you to break down all mine references and whatever you
research on other composition strategies and on what makes a composition to be engaging and capturing attention and like
a a super moden modern cinematography / And then we would rank them and have a library and a set of guidelines on when
to use one or other and how animations and transitions fit into this", then "Yeah this plan sounds good remember to
parallelize work". Earlier the same day: "I didn’t get once again why you ignored all my references and came up with
yours?"

**What this is.** The MOTION AND TRANSITIONS lane of the composition rework: the grammar of motion inside a shot (§3:
the hold, the float, the push and the pull, the reveal tilt, the crane, the follow, the subject travelling a held frame,
the world passing a still one, the build, the light pull) and between shots (§4: the continuous camera, the
push-through, the match cut on shape, on light and colour and on motion, the eyeline, the carry, the wipe by an object,
the whip, the morph, the light change, the un-build, the card flip, the plain cut, and the sound across a join: the J-
and L-cut). For each: what it says, when it works, which COMPOSITIONS it pairs with, its timing in seconds and frames
at 60 fps with its easing, what short-form viewers tolerate (§6), and where it lives in our engine, what exists and
what is new (§7).

**The owner's references stay the spine.** §1 measures the motion in his five reels (new measurements: every join they
make and the speeds inside their held shots); §2 gives each of his 41 ideas (`reels.md` A1-E11) and the reels' own
device T its moves and its joins. Everything after §2 is OUR research, an addition labelled as ours: the moves I1-I12,
the joins J1-J15, the rules MR1-MR24 (§9).

**Rank.** Research notes, the lowest rank on DIRECTION's ladder: nothing here is a rule until it is integrated into the
doc §9 names (`../CINEMATIC_GUIDE.md` for the moves, `../CRAFT.md` §a and `../../G3_ANIMATIC.md` §4 for the joins,
`../../G5_BLOCKING.md` §2 for the engine forms, `../COMPOSITION_SHOTS.md` for the pairings). Methods only: no footage
traced or copied, no frame used as an input to a picture of ours, no creator named, no living artist as a style
target; a film appears only as the evidence a source gives.

**Conventions.** Px are OUR frame's (1080 x 1920, y down). **f** = frames at 60 fps (1 f = 16.7 ms; 0.1 s = 6 f, 0.25 s
= 15 f, 0.5 s = 30 f, 1 s = 60 f). **%W/s** = per cent of the picture's width per second (x 10.8 = px/s in our frame).
On the owner's feed 74 px of ours = 1 degree at 32 cm (`vertical.md` §3.2). Zones as in `../LAYOUT.md` §1 with the
measured feed: caption band y 290-600, stage y 600-1520, focal home x 380-700 / y 860-1200, its golden box x 413-667 /
y 951-1187. **Codes:** the owner's ideas A1-E11 and T (`reels.md`); carriers A-F (`../CRAFT.md` §a); recipes SR1-SR24
(`../COMPOSITION_SHOTS.md`); shots S1-S5 (`../CINEMATIC_GUIDE.md`); moves K1-K10 (`../COZY_AND_SCALE.md` §4); Arcane's
measured presets P1-P10 (`../research/cine_motion.md`) and joins T1-T10 (`../research/cine_light.md` §4); the sibling
lanes' M1-M29 (`modern.md`) and L1-L15 / AR1-AR18 (`attention.md`), cinema's C1-C14 and vertical's V1-V14. **Evidence
grades:** **STUDY** (a controlled experiment or a corpus measurement), **CONSENSUS** (the same craft rule in three or
more independent practitioner or platform sources), **ONE SOURCE**, **MEASURED** (ours: the owner's reels, here; Arcane,
in `../research/`), **est.** (our arithmetic: §5.6). **How the sources were read:** web search summaries; a direct fetch
of `ncbi.nlm.nih.gov` failed (the host is outside this session's network), so papers hosted there were read through
their search summaries, and any figure seen only in a summary is marked "(summary)". Paths are relative to this file
(`video/docs/look/composition/`). Scratch (the measuring scripts, their JSON, the contact strips):
`/tmp/comp2/motion/`, not committed.

## 0. Bottom line

1. **The owner's reels move little and join simply** (§1, MEASURED). Every idea in all five reels is joined by a HARD
   CUT to a black line card (0.6-1.3 s), then a hard cut or a short fade (0.17-0.5 s) into the shot, whose overlay of
   lines leaves within 0.1-0.6 s; each idea lasts 2.0-3.2 s. Inside the shots, 17 of 23 are locked or nearly
   (`reels.md` E9); the life is the SUBJECT travelling the device's line at ~5-14 %W/s (55-150 px/s in our frame), or
   the WORLD passing behind a still frame at ~15-40 %W/s, or the camera riding the lines while things pass along them
   (the escalator, 23-25 %W/s). The one continuous move is reel 03's slow handheld pass over a sheet while a pen draws
   each armature in ~1 s. **So our default in-shot motion is the owner's E9 (the camera holds, the subject travels
   the line) and his device T (the line first, then the world) is our draw-on.**
2. **The reels' joins are not ours, their rhythm is.** They are lists, so every idea is a cut (F) through black; our
   films are one story, so every join carries something (DIRECTION rule 1) and at most 2 are plain cuts. What carries
   over: one idea per ~2-3 s of picture, the line drawn first, the overlay leaving fast (ours un-draws, never fades).
3. **Pick the move and the join FROM the composition** (§2): an opening (C1, B4, B13, E2) is a push-through waiting to
   happen; a shape at the same spot in two frames (A6, A7, D7, E2, E8) is a match cut; lines into depth (B1, B2, B8,
   E7) are a path for the subject or the push; a tall thing (D2, A6, B11) is a tilt; two levels (C3) are a crane or a
   tilt; a near layer (C2, E5) is the parallax float and the wiper; negative space (D1) is a hold, never a push; a
   pattern with one break (D7) is a light change.
4. **Inside a shot, one thing moves for the story at a time** (§3): either the camera holds and the subject travels (E9,
   I8), or the camera moves and the subject is the still pivot (E3, I12); every onset of the subject on its word; the
   world's life slow, even and taking turns. Motion ONSET captures the eye, steady motion does not (STUDY [MO8]), so
   the float and the passing life never compete with the subject's start.
5. **The numbers at 60 fps** (§5): the float 8-15 px/s (0.13-0.25 px/f); a story push >= 3 % in <= 2 s, <= 2x per
   panel; a reveal tilt 600-900 px in 3.5-4.5 s, front-loaded; the big move 2.0-5.0 s + a hold >= 30 f; a subject
   walking ~150 px/s (2.5 px/f) at the "you"'s 180 px; detailed layers <= 15 px/f, a full-frame sideways pan of detail
   <= ~6 px/f (est., the 7-second rule at 60 fps); the eye follows one point smoothly to ~37 px/f; arrivals decelerate
   over 15-27 f, exits accelerate over 9-15 f, camera moves ease in AND out (slow-in/slow-out helps tracking: STUDY
   [MO14]).
6. **Joins at 60 fps** (§4): the continuous camera 1.4 s (42 f out, 84 f in, one velocity at the cut); the
   push-through 1.1 s (30 f in, 36 f out) into an opening of 15-30 % of the frame that ends as a flat light field
   before its zoom outruns ~3 % a frame; a match cut 0 f, the anchor within 150 px and 1.5x; a cut on action with the
   motion running >= 0.3 s after the cut (STUDY [MO4]); a carry at the same speed and direction on both sides; a wipe
   by a near mass covering >= 70 % of the stage on the cut frame, <= 0.5 s on screen; a morph staged in 0.4-0.8 s; a
   light change 0.1-0.3 s for a lamp, ~1 s for the sky. Every join's midpoint on the next sentence's first word.
7. **Sound across a join** (§4.4): our voice runs on, so the classic J-cut becomes the picture leading its word by
   0.1-0.3 s; the next place's ambience may lead its picture by 0.2-0.5 s (a J-cut) and the last one's may trail under
   the new picture for 0.3-1.0 s (an L-cut), ducking; a sound effect on the frame of its visual event or 1-2 f after,
   never more than ~2 f before (synchrony is detected from +45 ms of sound lead or 125 ms of lag: ITU [MO19]).
8. **What short-form viewers tolerate** (§6): changes every ~1-3 s, carried joins (related cuts cost less and leave
   better memory: STUDY), locked frames that keep changing on the subject, depth moves (push, pull) and vertical moves
   (tilt, rise) more than sideways ones in 9:16 (ONE SOURCE, plus the frame's arithmetic). Not: a dead second, a calm
   opening, an effect that carries no meaning, a dissolve (99 % of transitions in modern film are cuts: STUDY [MO11]),
   flashes over 3 a second, motion the eye cannot follow.
9. **The engine already has most of it** (§7): Film's six transitions, CineCamera with pan, tilt, push, anchor and its
   speed check, `floatCam`, the parallax tables, the S5 rig, the World sky's time-of-day wipe, Pop / Rise / Move /
   Walk, the draw-on and the un-build. **New:** a clean-pen near-mass wiper (the built-in figure and passer wipers are
   strangers' backs in an outlined style, both retired), a light-pull helper, a staged morph on `@remotion/paths`'
   `interpolatePaths`, an E card flip as a Film type (v1's `Card.tsx` has the flip maths), the reveal ease `unveil` in
   the lib camera, a join checker (carry speed and direction, the midpoint on the word, the anchor's spot), and sound
   offsets per join.
10. **The ranking** (§8): CORE: the hold with the subject travelling (I1 + I8), the parallax float (I2), the
    continuous camera (J1), the push-through (J2), the match cut on shape and on light (J3, J4), the build (I10).
    USE: the story push (I3), the one big pull or rise (I4, I6), the tilt (I5), the light pull (I11), the light change
    (J11), the carry (J7), the wipe by a near mass (J8), the un-build loop (J12), the J- and L-cut (J15). SPARINGLY:
    the follow (I7), the world passing (I9), the cut on action (J5), the eyeline (J6), the morph (J10), the card flip
    (J13), the plain cut (J14). NEVER: handheld shake, a zoom in a hold, roll, the dolly zoom, rack focus and every
    blur, the whip pan with blur (J9's smear version only as a declared exception), the dissolve as a join.
11. **Clashes** (§10): the figure and passer wipers, the World and ShotCam push defaults (a per-shot zoom from reference
    2's era), two speed limits (15 and 18 px/f), K2's and K9's numbers that Arcane's measurements already changed, no
    doc for the sound side of a join, two numbers for the B match's tolerance.

## 1. The owner's reels, measured for motion (the spine)

`reels.md` catalogued every composition idea the five reels show; this section measures how they MOVE: how each reel
joins one idea to the next, and what moves inside its held shots. Method: every frame of the five 30 fps recordings,
cropped to the picture (`reels.md` §1), the like button masked; mean luminance and the mean absolute change per frame
find the cards, cuts and fades; dense optical flow between frames 0.1 s apart (the recordings repeat source frames)
measures the movers; ORB features with a RANSAC similarity measure the camera; contact strips at 10 per second checked
each join by eye. Compression noise puts a floor of ~3.5-4.5 %W/s under every flow figure: speeds near it mean
"nothing moves". Scripts and numbers: `/tmp/comp2/motion/scripts/`, `/tmp/comp2/motion/out/`.

### 1.1 How each reel joins its ideas (MEASURED)

| reel | the line card | card -> shot | the overlay on the shot | the shot | out | loop |
|---|---|---|---|---|---|---|
| **01** London (4 ideas + title) | 0.60-0.67 s, still: the red lines and the yellow label appear whole, never drawn on | the shot FADES IN under the lines in 0.17-0.37 s (10-22 f) | the red lines leave in ~0.6 s, the label in ~0.4 s, both fading while the shot plays | 1.93-2.20 s (title 4.23 s) | a hard cut to the next black card | a hard cut back to the title at 16.0 s |
| **02** China (5 ideas) | 0.93-1.30 s, still | a HARD CUT (one frame) to the shot, with the hairline and its label laid over it | gone within ~0.15-0.3 s | 1.27-1.93 s | hard cut | (the recording ends) |
| **04a** (title + 7 ideas) | 0.67-0.73 s, still | a hard cut, with the overlay | fades out in ~0.4-0.5 s (by eye on the strip) | 1.37-2.10 s (title 2.90 s) | hard cut | (runs into 04b) |
| **04b** (title + 3 ideas) | 0.67-0.70 s | a fade-in of 0.5 s (30 f) | (as 01) | 1.80-2.87 s | hard cut | (cut off by the recording) |
| **05** Italy (hook + 4 ideas) | 0.70-0.77 s | a hard cut, with the overlay | ~0.4 s | 2.10-2.93 s | hard cut | a hard cut back to the hook at 12.3 s |
| **03** the sheet (18 panels) | none | one continuous handheld shot over the drawn sheet: the phone drifts 1.5-7.7 %W/s and zooms +-0.3-6 %/s, never still | a pen draws each red armature live, ~1 s a panel | ~1 s a panel | no cut | — |

**What it adds up to.** Card plus shot, an idea takes 2.0-3.2 s (`reels.md` §2 found 2.25-3.25 s): ~0.7 s of the line
alone, then 1.3-2.9 s of the world under it. Every join BETWEEN ideas is a plain cut through black, the reels' only
join; the card-to-shot step is a cut in three reels and a fade of 0.17-0.5 s in two. The loop is a hard cut back to the
opening frame (01, 05). Reel 03 is the exception that matters most to us: no cut at all, one moving camera, the lines
drawn live: an animated sketchbook.

### 1.2 What moves inside the held shots (MEASURED)

| what moves | where (reel, time) | camera | speed (%W/s; px/s in our frame) | share of the picture moving |
|---|---|---|---|---|
| **the subject travels the device's line** (E9) | 02 1.0 s: a walker crosses the moon gate (C1); 04a 3.6 s: a runner down the pier toward the tower (A7); 02 8.7 s: an egret crosses the mirrored lake (A7); 04a 14.8 s: a man leans from the fifth window (D7); 04a 0 s: a walker toward the villa, into the spiral's eye (A4) | locked | walker ~5-7 %W/s (55-75 px/s); runner 6-11 (65-120) and, into depth, 305 -> 92 px tall in 1 s (`reels.md` E9); egret 10-14 (105-150); the man in the window 5-11 | 0.5-2.2 % (one small mover) |
| **the world passes a still frame** (E3) | 01 0 s: the platform streaking past two carriage windows (the title); 01 10.9 s: two walkers before a train passing behind (C1); 04b 19.5 s: the station streaking past the train-door windows (the title) | locked | median 8-15 %W/s, the fastest tenth 23-39 %W/s (90-420 px/s), motion-blurred | 8-30 % (a band, not one mover) |
| **the camera rides the lines** (B5) | 01 5.0 s: the escalator, its handrails held fixed while the ad panels slide along them | moving with the lines | the panels 23-25 %W/s (250-270 px/s) along a ~30-40 degree diagonal | 57 % (everything but the rails) |
| **a slow push** | 02 6.1 s: the photographer on the boat (A1); 04a 14.8 s: the window row (D7) | push 2.6 and 1.4 %/s (`reels.md` E9) | the frame edge at 1.4-2.6 %/s | — |
| **a slow pan** | 05 3.9 s: the hiker under the peaks (A4) | pan 1.7 %W/s (`reels.md` E9) | 18 px/s | — |
| **a burst** | 04b 23.1 s: fireworks at the spiral's eye (A4) | locked, a small drift | 6-9 %W/s | 6 % |
| **nothing** | 01 14.1 s: the street to its vanishing point (B2); 02 11.3 s: the path to the tree (B1); 04a 10.4 s: the boy in the forest (D1); 05 9.8 s: the terrace over the sea (C2) | locked | under the noise floor | ~0 % |

**What it says.**
- **The camera holds and something travels** in 11 of the 25 shots measured: one small subject along the device's line
  (the commonest), or a band of world passing behind a still frame. In 10 nothing moves above the measuring floor; in
  4 the camera moves, once and slowly (1.4-2.6 %/s), or rides with the lines so that the frame's geometry holds still
  while the world slides.
- **Small movers, big speeds read as calm here only because the photos are blurred.** The passing world runs at up to
  ~40 %W/s; drawn sharp, with no blur (DIRECTION rule 5), that is ~7 px/f at 60 fps, inside our budget but a strong
  pull: ours stays slow and low in contrast, an even flow, never one mover behind the subject (`attention.md` §9.4).
- **The subject's speeds are human:** 55-150 px/s at our width. A 180 px "you" walking at 1.4 m/s moves ~150 px/s
  (§5.6): the reels' walkers are our walkers.
- **Into depth beats across:** the runner's 3.3x change of size in one second is the strongest motion in the reels and
  the only one that changes the composition (a figure arriving at the vanishing point). Sideways crossings take 6 s to
  cross our visible width at a walk, longer than a shot: a figure crosses an OPENING (the moon gate, ~1-2 s), never the
  frame.
- **Ten shots of 25 show no motion above the floor** and still hold for 1.3-2.6 s: frames whose lines already deliver
  the eye (B1, B2, the stairwell's C1, the tower's D2) or a quiet field (C2, D1, the beach's D6). The reels can afford
  it because the next cut comes within ~2 s; we hold longer (panels average >= 3.5 s), so ours always carries the slow
  life (DIRECTION rule 3; `../CINEMATIC_GUIDE.md` Scale cues 11: "> 1 s without is a dead frame").

### 1.3 What we take from the reels' motion, and what we don't

| the reels do | we | why |
|---|---|---|
| hold the camera; one subject travels the device's line (E9) | **take it as the default** (I1 + I8) | the commonest case (11 of 25 shots); one mover is where everyone looks (STUDY [MO7]) |
| a still frame with the world passing (E3, the titles) | take it, sharp and slow (I9) | the still thing among movers wins the eye (`cinema.md` [S6]) |
| ride the lines: the frame holds, the things on the lines pass (B5) | take it as a follow along parallels (I7) | the composition's lines never move, so the eye is never lost |
| one slow push or pan (1.4-2.6 %/s) | a push only as a story move, >= 3 % in <= 2 s (I3) | 1.4 % per second reads frozen on our flat drawings (`../COZY_AND_SCALE.md` 3b.5) |
| the line first, then the world (T: a still card 0.6-1.3 s, the shot under it) | **take it as our draw-on** (I10, J12): the subject's line draws on with a moving pen tip, the colour floods in under it | reel 03's live pen shows the line being made; watching the drawing hand helps (STUDY [MO25]) |
| a hard cut through black between ideas | **don't**: our joins carry (J1-J13); F only on a "But" | the reels are lists; ours is one story (DIRECTION rule 1) |
| the overlay and the shot fade (0.17-0.6 s) | **don't**: the line un-draws (`exit.tsx`) or the world wipes in | no opacity fades (DIRECTION rule 8; `../COMPOSITION_SHOTS.md` X3) |
| a hard cut back to the opening frame (the loop) | take it as our loop: the last frame un-builds to frame 0's drawing (J12) | the rewatch starts seamlessly (DIRECTION rule 9) |
| motion blur on everything fast | **don't** (DIRECTION rule 5): speed is shown by a smear drawing or by the near mass's own size | `../COMPOSITION_SHOTS.md` X1 |

## 2. The owner's 41 ideas in motion: each idea's move inside the shot and its joins

His ideas in his reels' order and names (`reels.md` §3, the library's Part 1 in `../COMPOSITION_SHOTS.md`). For each:
the move that suits it inside the shot (I-codes, §3), the joins it sets up in and out (J-codes, §4), with numbers, and
what never to do with it. "Reel" quotes the owner's own example in motion (§1.2). The pairing principle under the
whole table: **a composition's device already contains its motion**. Lines are a path, an opening is a portal, a shape
at a fixed spot is an anchor, a tall thing is a tilt, a near layer is parallax and a wiper, a quiet field is a hold.

### A. Where the subject sits

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| A1 | **Rule of thirds** | I1 held, or I7 a follow that keeps the subject on its third while the lead room grows to 1.5-2x the room behind (`cinema.md` C9); both end frames keep the 2:1 proportions (sky : ground). Reel: 02's photographer, a slow push of 2.6 %/s | J3 when the next shot keeps the subject within 150 px of its spot; J7 out the way it faces | a move that slides the subject across the centre to the other third (the eye loses it) |
| A2 | **Golden section** | any; the move's END frame lands the focal in the golden box (x 413-667, y 951-1187), a push scales about the focal's centre so it never leaves it (I3, I12) | every join puts the next focal within 150 px of the last (`modern.md` M19); J3 and J4 anchors sit on the box | a move that ends with the focal outside the box without a declared reason |
| A3 | **Golden section, nested** | I3 a push that steps INTO the nested cell, its anchor the nested point, <= 2x per panel | J2 when the nested cell holds an opening: the cells are a push-through chain (Arcane P8: two pushes of +7-9 % in 0.8 s each, then a landing shot already moving) | a push past 2x in one panel without the push-through |
| A4 | **Golden spiral** | I8 the subject travels the arc into the eye (reel: 04a's walker into the eye, a small, slow mover), or I3 a push aimed at the eye; the outer arc may leave the frame | J2 into the eye when it is an opening; J3 on the eye's shape. Reel: 04a draws the spiral over its first frame and drops it by 0.75 s, T's line first | a camera path along the spiral (a compound move, a roll) |
| A5 | **Golden triangle** | I8 the subject climbs the long diagonal; otherwise I1 | J14 on the turn (`../COMPOSITION_SHOTS.md` SR18) | using it as a placement grid (weak in 9:16) |
| A6 | **Cross** | I5 a tilt up the vertical (a mast, a tower, a trunk) from the horizon to its top; or I1 with the horizontal's life passing (I9) while the vertical holds | J3 a shape match on the vertical (a mast becomes a lamp post at the same x, +-8 %); J11 the horizon's light changes (a sunset on the cross) | a sideways pan: the vertical slides, and verticals judder worst on a lateral pan (§5.3) |
| A7 | **Symmetry** | I1; I3 a push exactly along the axis (it keeps the mirror); I8 the subject on the axis, toward or away (reel: 04a's runner, 3.3x smaller in 1 s), or crossing the mirror (reel: 02's egret, 10-14 %W/s) | J3 symmetry into symmetry (the axis on x 540 both sides); J12 the loop (a formal end) | a pan, an off-axis push, a float with a sideways leg (in a mirrored frame the float runs vertical legs only: est.) |

### B. Lines that carry the eye

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| B1 | **Leading lines** | I8 the subject travels the line to its end (the arrival on its word); or I3 a push along the line, anchored on its end (K5: >= 3 % per 2 s, `anchorDepth` >= 0.85). Reel: 02's path and 04a's path and stair hold still: the lines alone deliver the eye | J2 when the line ends at an opening; J3 on the line's end point (where the lines meet stays put across the cut) | a pull back along the lines (it sends the eye out of the frame: Poore's exit, `cinema.md` §4.5) |
| B2 | **Vanishing point / one point** | I3 the one-point push toward the vanishing point, anchored on the closed vista (E7); or I8 the subject recedes into it or arrives from it (reel: 04a's runner; 04b's man stands at the crossing) | J1 the continuous camera "travels the street" through the vista; J2 into the vista's door | a push into an EMPTY vanishing point (nothing to land on) |
| B3 | **Radiating** | I1; or I11 the light radiates from the point (a lamp comes on and the rays become light) | J11; J4 the bright point matched across the cut | any rotation (the rays would spin) |
| B4 | **Tunnel** | I3 a push toward the lit end (an opening of 15-25 % of the frame, K9) | J2 the push-through: the lit end becomes the next frame, brightening a step as it nears (Arcane T7) | a pull back out of a tunnel in a hold (it reads as retreat: Arcane P3, a beat of its own) |
| B5 | **Parallel lines** | I7 the camera rides along the parallels: the lines hold still, the things on them pass (reel: 01's escalator, the panels at 23-25 %W/s); or I1 with movers along the lines | J7 the carry along the lines' direction (exit on the line, enter on the same line); J1 | moving ACROSS the lines: parallel stripes crossing the frame at speed alias and strobe (est.) |
| B6 | **Diagonal** | I8 the subject climbs or descends the slope; I5 a tilt along it | J14 on the turn (a diagonal is contrast: SR18); J7 along its direction | two diagonals moving against each other |
| B7 | **Double diagonal** | I1 (a high angle, once a film) | J1 in by a rise to the high angle | a move across the X |
| B8 | **S-curve** | I8 the thread (warm water, a boat, a walker) travels the curve from the bottom edge into the depth, shrinking with the ground's perspective: the slow way in; or I6 a crane that follows the S once | J7 the carry: it leaves at the curve's far end and enters the next shot where the curve goes on | the camera snaking along the S (a compound move) |
| B9 | **C-shape** | I1 or I2, the subject inside the curve, the curve's life passing round it | J3 the C's opening matched to a round thing; J1 | a move that leaves the subject outside the curve ("never outside the circle": `cinema.md` §4.11) |
| B10 | **L-shape** | I1 or I2 (the cozy frame) | J2 out through the opening the L frames; J8 the tall side mass is already a near mass: it can wipe | a push that loses the side mass (the refuge goes) |
| B11 | **V-shape** | I5 a tilt DOWN into the canyon (down = into the place, confinement: Arcane) or up out of it (release) | J14 on the turn (the V is the unstable beat); J2 into the subject at the V's foot | a push into the V's empty sky |
| B12 | **Spiral composition** | I1 (a high angle); I8 the subject walks the spiral in | J2 into the centre (the stairwell's floor becomes the next frame) | a camera rotation along the spiral (roll) |
| B13 | **Circular** | I1; I3 a push into the round opening | J2 the portal (a round window); J3 circle to circle (window -> coin -> sun: Arcane T1's circles 760-1000 px wide at x 540, y 800-1050) | a spin |

### C. Frames, layers and levels

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| C1 | **Frame within a frame** | I1 while the subject crosses the opening or stands in it (reel: 02's walker crosses the moon gate at ~5-7 %W/s, ~1-2 s); I3 a push toward it; I11 the opening brightens a step | **J2 the push-through: the opening becomes the next frame (carrier A)**; J3 an opening matched to an opening; J8 the frame's own rim as the wiper. The reels hold these frames still: the push is ours (`reels.md` C1) | a push that stops halfway (the frame neither holds nor delivers) |
| C2 | **Foreground** | I2 the parallax float: the near layer moves the most (share 1.0 against the far 0.05-0.15), so the foreground IS the float's visible motion; I6 the crane, the near mass sliding out of the bottom (S1's wall). Reel: 02's lotus and 05's terrace hold still | J8 the near mass becomes the wiper (it passes the lens and hides the change: carrier D) | a near layer moving fast in a hold; a big or blurred near layer |
| C3 | **Level change** | I5 a tilt or I6 a crane between the two levels; I8 the subject descends the steps (reel: 01's walker on the stair, ~6-8 %W/s); I11 the light passes from one level to the other (cause above, effect below) | J1 the camera follows the cause down to the effect | a cut between the two levels of one frame (it splits one place into two) |

### D. Masses, balance and contrast

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| D1 | **Negative space** | I1 or I2 only; the subject's small move inside the field. Reel: 04a's boy holds still | J11 the light changes over the field; J1 out by a rise | a push: it eats the space that gives the subject its weight |
| D2 | **Scale** | I5 the tilt up from the figure to the giant (K2, "it keeps going"), or I4 the pull back (S5) until the figure is small; I9 small life at the foot | J14 into it only on a "But" (K1: the figure 6-20 times smaller across the cut, Arcane's median ~10:1); J1 the one big move; J2 back home | a push in on the giant (it shrinks the scale) |
| D3 | **Balance** | I1 | J3 the two masses matched | a move whose parallax grows one side (the balance tips) |
| D4 | **Unbalanced** | I2: the counterweight on a far plane barely moves while the subject's plane floats | any | the counterweight moving more than the subject |
| D5 | **Pyramid** | I1; I3 a push to the apex | J3 apex to apex (a roof's peak becomes a mountain's) | a tilt that cuts the apex off (the stability goes) |
| D6 | **Juxtaposition** | I1 while a FRONT travels the seam (I8: SR20, the warm water's front along the melt line); or the wipe's edge as the seam (J8): the "after" world revealed behind a moving edge | J3 the matched pair, before and after at one spot (SR19); J8 | a split screen (`vertical.md` V10) |
| D7 | **Patterns / repetition** | I1; I10 or I11 the break APPEARS: one window lights (0.1-0.3 s), or a figure appears in it (reel: 04a's man leaning out under a 1.4 %/s push) | J4 the lit window matched across the cut; J2 into the lit window | the pattern breaking twice in one shot (two onsets, two calls) |

### E. Moves the examples make without naming them

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| E1 | **One small figure where the lines meet** | I8 the figure ARRIVES at the meeting point (its onset on its word), then holds | J2 into the place it arrived at; J6 its look leads the next shot | the figure leaving the meeting point while it is the subject |
| E2 | **The lit opening** | I1; I11 the light inside grows a step (the opening the brightest area, a step >= 65 L* to the figure); the figure steps into it | J2 the bloom push-through (Arcane T7); J4 the light match (the bright shape within 190 px and 1.5x in size: Arcane T1) | a second opening lighting up in the same shot |
| E3 | **Stillness against motion** | I9 the world passes in one band behind the still subject (reels: 8-40 %W/s, motion-blurred; ours sharp, at its scale's speed: §5.4); or I12 the pivot, the camera moving while the subject holds its screen spot (S5's figures at x 0.45 W) | J1 (the pivot carries the eye across) | one mover passing right behind the subject (it takes the eye: `attention.md` §9.4) |
| E4 | **Looking room** | I7 a follow in which the lead room grows; the head turns before the move starts | J6 the eyeline: the subject looks, the next shot shows what it sees | the subject walking into the frame's edge |
| E5 | **A soft near layer** | I2 (the near layer is the float's fastest plane); I6 it slides out (S1's wall) | J8 the wiper | blur (DIRECTION rule 5) |
| E6 | **Atmospheric layers** | I2 by depth (the 1/z shares: `lib/depth.ts` `PARALLAX_Z`); I4 or I6 the reveal adds the layers one by one | J11 the haze changes with the time of day (the sky's wipe) | all the layers moving together (a flat card) |
| E7 | **The closed vista** | I3 a slow push to the vista, anchored on the object that ends the sight line (K5, with its slow end raised to >= 3 % per 2 s: `../COMPOSITION_SHOTS.md` §5 row 10; Arcane P4a lean-in on a settle, P4b drawn-in peaking at 65-80 %) | J2 into the vista's object (its door, its window); J3 the object stays put across a cut | an open vanishing point at the end of the push |
| E8 | **One colour accent on the subject** | I10 the accent arrives with the subject's onset (a pop, a light-up) on its word | J4 the colour match: the accent holds its spot across the join (the thread's hot accent) | the accent moving elsewhere during a hold |
| E9 | **The camera holds; the subject travels the line** | this IS I1 + I8, the reels' commonest motion (§1.2) | J7 the carry: it leaves the line at one edge and enters the next shot's line from the opposite edge at the same speed; J2 into where it arrived | the camera following when the line already delivers the eye |
| E10 | **The near "you" over the shoulder** | the "you" holds or breathes (<= 2 %W/s: `../CRAFT.md` §b); its head turns to the subject ~0.3-0.5 s before the beat (the look leads: est.) | J6 the eyeline (a cut or a push to what it sees) | the "you" moving while the subject acts |
| E11 | **The POV hook** | I10 the effect lands in the hand (a tick, a pop) on its word; the hand holds | J2 into the screen or the object in hand (a phone's screen is a portal); J4 the object in hand matched to the world's | a shaking hand (handheld) |

### T. The reels' own device

| # | idea | the move inside the shot | the joins | never |
|---|---|---|---|---|
| T | **The line first, then the world under it** | I10 the draw-on: the subject's line with a moving pen tip, >= 1 s, its biggest change after 0.4 s, then the colour floods in under it (reel 03: a live pen, ~1 s per armature; reels 01-05: a still card of 0.6-1.3 s) | J12: the film opens on it and the loop un-draws back to it; the reels' card -> shot is a cut or a 0.17-0.5 s fade, ours draws on | the opacity cross-fade (`../COMPOSITION_SHOTS.md` X3) |

**Read by joins, the table gives each carrier its compositions** (the inverse lookup):
- **J2 push-through (A):** C1, B4, B13, E2, E7's object, E11's screen, A3's nested cell, A4's eye, B12's centre, D7's lit
  window, B10's opening. An opening of 15-30 % of the frame on the axis.
- **J3 shape match and J4 light match (B):** A6's vertical, A7's axis, B13's circle, D5's apex, D3's masses, B9's C, D6's
  matched pair, D7's lit window, E2's bright shape, E8's accent. One shape or light at one spot.
- **J1 continuous camera (C):** B2's street, C3's two levels, D2's big move, E3's pivot, B5's ride.
- **J7 carry and J8 wipe (D):** B5, B6, B8 and E9's travellers (carry); C2, E5 and B10's near masses, D6's seam (wipe).
- **J11 light change:** B3, D1, D7, E6, A6's horizon. **J14 plain cut (F):** A5, B6, B11, D2's "But".

## 3. Inside a shot: the moves (ours: I1-I12)

Each move: what it **says**, when it **works**, the owner's ideas it **pairs** with (§2 the other way round), its
**timing** at 60 fps with its easing, what viewers **tolerate**, its **engine** form (EXISTS / PARTLY / NEW: §7) and its
**evidence**. Three laws hold for all of them (rules MR1-MR3, §9): one story motion at a time; the move is three
designed frames (start, middle, end: `cinema.md` C12); the caption band is a fixed mat that never moves.

**I1 The hold (a locked camera).**
- *Says:* "look at this"; stillness, being watched; it hands the motion to the subject, whose onset then takes the eye.
- *Works:* the owner's default (E9, §1.2); the lit opening, the pattern with one break, symmetry, negative space, the
  closed vista seen whole, inserts and paper; any beat whose caption carries the news.
- *Pairs:* A7, B3, B9, B10, C1, D1, D3, D5, D6, D7, E1, E2, E9.
- *Timing:* a held peak 1.5-3 s (`../COZY_AND_SCALE.md` §5; Arcane's locked shots: median 2.7 s, 29 % of shots, 23 % of
  the time: `../research/cine_motion.md` §1); the reels' 1.3-2.9 s. Something always moves: never > 1 s without a mover
  (`../CINEMATIC_GUIDE.md` Scale cues 11; `scripts/qa/deadframes.py` flags dead runs > 0.4 s); no handheld drift in a
  cozy hold (the references' locked cozy shot moved <= 0.1 px in 7.8 s: 3b.5).
- *Tolerated:* a still camera, yes, when the subject changes every ~1.5-3 s and a caption page every 1.1-1.5 s
  (`attention.md` §5.4).
- *Engine:* EXISTS: a `CineCamera` / `ShotCam` with no keys and `handheld` 0; the life from `lib/idle.ts`
  (`events`, `windowLit`, `crossing`, `loopPos`, `puffs`, `twinkle`).
- *Evidence:* MEASURED (11 of 25 reel shots hold while something moves, 10 hold with nothing moving); STUDY (in a still
  frame the mover takes the eye, and one mover takes everyone's [MO7]).

**I2 The parallax float (the drift).**
- *Says:* "alive, breathing", depth with no event; the multiplane at rest.
- *Works:* every cozy hold (DIRECTION rule 8: "every hold is locked or a slow float"); any frame with planes, most of all
  with a near layer (C2, E5) and atmospheric layers (E6).
- *Pairs:* C2, D1, D4, E5, E6, B9, B10.
- *Timing:* translation only, 8-15 px/s path speed at the near plane (0.13-0.25 px/f), peak <= 25 px/s, straight legs
  turning every 0.6-1.5 s and turning back, net offset within +-12 px of home, >= 40 px of overscan, sub-pixel
  transforms; planes by depth (`PARALLAX_K`: near 1, subject's plane 0.6, mid 0.35, far 0.15, farthest 0.05; or the 1/z
  table `PARALLAX_Z`), the sky and the band 0; home again on every join and every map-critical frame
  (`../COZY_AND_SCALE.md` 3b.5). Linear legs, eased turns (the velocity blends over ~0.34 s). In a mirrored frame the
  legs run vertical only (est., A7).
- *Tolerated:* it sits under the capture threshold on purpose: steady motion does not capture attention, an onset does
  (STUDY [MO8]); a 1.4 % push moved the frame's edge ~2 px/s and read frozen, the float is ~5x faster and reads
  "visible but calm" (3b.5).
- *Engine:* EXISTS: `floatCam(t, {seed, dur, speed, box, leg})` (`lib/idle.ts`), `parallaxOffset` / `parallaxK`
  (`lib/depth.ts`).
- *Evidence:* the owner's words (2026-10-28, "planes move by depth"); MEASURED (the cozy reference's float 10.1 px/s);
  STUDY (motion parallax alone conveys depth: `modern.md` [N12]).

**I3 The story push (a dolly in).**
- *Says:* "this matters", attention, approach: looming is a motion that captures the eye (STUDY [MO8]); a slow push
  builds intimacy or tension (CONSENSUS [MO27]).
- *Works:* on the word that names the subject; toward an opening (C1, B4, B13), a vanishing point closed by an object
  (B2, E7), the spiral's eye (A4), the apex (D5), the nested cell (A3).
- *Pairs:* A3, A4, A7 (on its axis), B1, B2, B4, B13, C1, D5, E7.
- *Timing:* visible at >= 3 % in <= 2 s (`../COZY_AND_SCALE.md` 3b.5); vista pushes 3-8 % in 2-4 s with that floor
  (K5); Arcane's moving shots run 1.5 %/s on wides, 2.6 on mids and 3.6 on closes (`../research/cine_motion.md` §1
  rule 2); <= 2x per panel, beyond it the push becomes a push-through (J2); the target's centre held within +-40 px
  (scale about it: `anchor`). Easing: a lean-in lands softly (`CAM.settle`, out-cubic, Arcane P4a), a drawn-in push
  accelerates and peaks late (65-80 % of its length) and may be cut while still moving (P4b; Arcane's big pushes are all
  back-loaded, median 1.5 s). 2 s = 120 f.
- *Tolerated:* one push on its word, yes; "punch-ins on every key word" is a current editing tic we do not take
  (`modern.md` §7); a push slower than ~1.5 %/s reads as nothing happening (3b.5).
- *Engine:* EXISTS: `ShotCam push={{to, dur, at, anchor, ease}}`, `CineCamera` `push` / `anchor` keys, World `push`
  (its default is a clash: §10.2).
- *Evidence:* STUDY (looming captures; receding does not [MO8]); MEASURED (Arcane rates, the reels' 1.4-2.6 %/s);
  CONSENSUS (meaning).

**I4 The pull-back (a dolly out), and the one big move.**
- *Says:* "let it sit", context, isolation; at scale, "it is bigger than you thought" (S5, the owner's favourite).
- *Works:* the scale beat (D2, E1's small figure), the payoff's pull back to the whole (SR24), the one big move (S1 or
  S5, once a film).
- *Pairs:* D2, E1, E3 (as the pivot, I12), E6, C2 (the near mass leaving).
- *Timing:* S5 retimed 2.0-5.0 s, default 3.3 s = 156 f of move + 42 f of hold, the pivot 3.5-6x, the far plane sliding
  1.0 W, its peak 14 px/f; the landing hold >= 30 f below 5 % of the peak speed; ease S5's cubic-bezier(0.55, 0.03,
  0.50, 1.0) (a creep that is never still, one peak at 2.1x the mean, a long decelerate); a continuous pull of <= ~2.3-2.4x
  (Arcane's longest, #55), the rest hidden by a wipe (J8) or a push-through (J2) (`../CINEMATIC_GUIDE.md` S5;
  `../COZY_AND_SCALE.md` K4).
- *Tolerated:* a pull does NOT capture by itself (receding motion: STUDY [MO8]): it carries its own event (S5's light
  burst before the landing, the landmark rising on the payoff word, birds crossing toward it) or it reads as a lull;
  "a breath-out" pull in a hold is not ours (no zoom in a hold: DIRECTION rule 8), though Arcane uses it on wides (P2).
- *Engine:* EXISTS: `lib/pullback.tsx` (`PullPlane`, `PullBox`, `S5_EASE`, `planeSpeed`), `CineCamera` `push` back to
  0, `anchor` on the pivot.
- *Evidence:* MEASURED (Arcane: pulls outnumber pushes 46 : 34, 20 : 9 on scale shots); STUDY (receding does not
  capture); the owner's pick (S5, 2026-10-26).

**I5 The reveal tilt (and pan).** In 9:16 the reveal is vertical: the frame has room up and down.
- *Says:* up = wonder, power, "it keeps going" (K2); down = into the place, confinement (Arcane's tilts down run into
  the dark: `../research/cine_light.md` §6).
- *Works:* a tall thing (D2, A6's vertical), the V canyon (B11), two levels (C3), a sky that holds the band.
- *Pairs:* A6, B6, B11, C3, D2.
- *Timing:* 600-900 px in 3.5-4.5 s (Arcane's tilts run 0.04-0.07 H/s; our K2's 2.5-3.2 s was 2-2.5x too fast:
  `../research/cine_motion.md` §4), front-loaded (all 7 of Arcane's vertical reveals peak at <= 45 % of the move and end
  on a near-still tail of 1-2 s) or linear; the pan-head form (every layer shifts the same: no parallax), verticals kept
  parallel; anything that crosses the band during the move is one flat field or passes in the gutters (x < 95, x > 945).
  A sideways PAN of the whole detailed frame <= ~6 px/f (est.: the 7-second rule at 60 fps: §5.3).
- *Tolerated:* vertical moves suit the tall frame; sideways moves read faster and bigger in 9:16 (ONE SOURCE each:
  "the 9:16 frame tends to exaggerate horizontal (left-right) movement"; "camera movement is exaggerated in vertical
  formats, and should be subtle" [MO26]).
- *Engine:* EXISTS: `CineCamera` `tilt` / `pan` keys (a pan-head: everything, the sky included, shifts by the same
  amount), `CAM.reveal` = trapezoid(0.25, 0.35); PARTLY: the front-loaded `unveil` = trapezoid(0.1, 0.6) lives in the
  board's `SketchReel` only, not in the lib camera.
- *Evidence:* MEASURED (Arcane); ONE SOURCE (vertical makers); est. (judder).

**I6 The crane: the rise-over.**
- *Says:* arrival, "here it all is": the world opens past the wall (S1, K3).
- *Works:* a near mass (a wall, a ledge: C2) that slides out of the bottom; a level change (C3); the opening's one big
  move when S5 is not used.
- *Pairs:* C2, C3, E5, E6, B8 (once, following the curve).
- *Timing:* S1: 4-4.5 s at the source, retimed so the scale moment sits in ~1.5-4 s, scale 1.00 -> 1.04, ease-out, then
  a 1 s hold; K3: a crane of 400-700 px in 2.5-3.5 s with the ledge moving 1.3x; the layers drawn ~500 px taller than
  the start frame shows.
- *Tolerated:* yes, once (it is a big move: one per film, S1 or S5).
- *Engine:* EXISTS: `CineCamera` `y` keys (a true crane with parallax; only with the horizon off-frame or the ground's
  far edge on a depth ~1 layer, else the horizon slides against the sky: use `tilt`); CineDemo B.
- *Evidence:* MEASURED (Arcane #94, the only shot all three reviewers passed: `../CINEMATIC_GUIDE.md` S1).

**I7 The follow: a truck or a tilt with a mover.**
- *Says:* travel, "the mechanism on its way" (SR10); with a ride along parallels (B5), the journey itself.
- *Works:* the thread travels farther than one frame (the warm water through the pipes); the parallels of B5; a facing
  subject on its third (A1, E4).
- *Pairs:* A1, B5, E4.
- *Timing:* the subject held at x 410-560 (a truck) or on the axis (a tilt), its pivot within +-40 px; the lead room in
  front grows (1.5-2x); the camera starts 2-4 f after the subject and lands after it (`../../G3_ANIMATIC.md` §4); a
  TILT before a truck (vertical travel has twice the room); a sideways follow at about half the px per frame of a
  vertical one for the same calm (`modern.md` M18, est.); the background drawn as the view plus the travel (the hole
  rule: `modern.md` M17).
- *Tolerated:* two follows in a row read as one long chase: alternate with a hold (`../COMPOSITION_SHOTS.md` §4 check 2).
- *Engine:* EXISTS: `CineCamera` `x` / `y` keys with `anchor`, `Walk` / `Move` for the mover, `camSpeed` / `camSpeedAt`
  (velocity continuity across keys and cuts).
- *Evidence:* MEASURED (the escalator ride, §1.2); CONSENSUS (lead room: `cinema.md` [S14]); ONE SOURCE (vertical).

**I8 The subject travels a held frame (the owner's E9).**
- *Says:* "this goes there": arrival, departure; the device's line becomes a path, so the composition itself acts.
- *Works:* lines and openings: along a leading line to its end (B1), into or out of the vanishing point (B2), round the
  S (B8) and the spiral (A4, B12), across an opening (C1), up a slope (B6, A5), down the steps (C3), a front along a
  seam (D6), the arrival where the lines meet (E1).
- *Pairs:* A4, A5, A7, B1, B2, B6, B8, B12, C1, C3, D6, E1, E9.
- *Timing:* the reels' movers 55-150 px/s (§1.2); a walk at our human scale (the "you" 180 px for 1.7 m) is ~150 px/s,
  2.5 px/f, and a mid walker 110-260 px tall 90-215 px/s (§5.4); into depth the size changes with the ground's
  perspective (the reels' runner: 3.3x in 1 s, the strongest motion in the reels); the eye follows one moving point
  smoothly up to ~30 degrees/s, ~37 px/f on the feed, so every walk is followable (STUDY [MO2]). Crossing the visible
  width at a walk takes ~6 s, longer than a shot: a figure crosses an OPENING (~1-2 s) or enters or leaves, never the
  whole frame. The onset on its word (the start of motion takes the eye: STUDY [MO8]); the path starts and ends inside
  the golden box or at its opening; drawn poses step every 5 f ("twos" at 24 fps) while the camera glides (`modern.md`
  M16).
- *Tolerated:* it is the reels' own motion and the calmest strong event we have.
- *Engine:* EXISTS: `Walk` (step bob and sway), `Move`, `crossing()` and `loopPos()` (`lib/idle.ts`), `stepped()` for
  stepped drawings.
- *Evidence:* MEASURED (§1.2); STUDY (onset capture; gaze clusters on the one mover [MO7]).

**I9 The world passes a still subject (the owner's E3).**
- *Says:* the world goes on and the subject is still: time passing, isolation, a pause.
- *Works:* E3; the reels' titles (a still frame, the world streaking past its windows); B5 with the camera locked; life
  in the cozy lane (DIRECTION rule 7: "life passing through sideways").
- *Pairs:* A6 (the horizontal's life), B5, D2 (small life at the foot), E3.
- *Timing:* an even FLOW in one band (a tram, boats, walkers both ways), never one mover passing behind the subject
  (`attention.md` §9.4); speed by the passers' scale, since huge means slow (Scale cues 10): far walkers 15-60 px tall
  ~12-50 px/s, mid walkers 110-260 px 90-215 px/s (§5.4); low in contrast, inside its band's value; no new mover
  enters in the 0.4 s round a join; at most 3-4 noticeable movers at once, taking turns (~0.6 entries/s: `../CRAFT.md`
  §b). The reels' passing world (8-40 %W/s) is motion-blurred; ours is drawn sharp, so it stays slower.
- *Tolerated:* yes, as texture; one fast or contrasty passer becomes a second subject.
- *Engine:* EXISTS: `crossing`, `loopPos`, `shuttle` (`lib/idle.ts`), `lib/particles.tsx`.
- *Evidence:* MEASURED (§1.2); STUDY (the still thing among movers wins: `cinema.md` [S6]; one mover pulls: [MO7]).

**I10 The build: draw-on, pop, grow, tick.**
- *Says:* "this is being made", the mechanism step by step; the reels' own "line first" (T).
- *Works:* frame 0 (DIRECTION rule 9); a chart line in step with the voice; one tick per unit of cause (the hook's real
  mechanism); D7's break appearing; E8's accent landing; E11's effect in the hand.
- *Pairs:* T, D7, E8, E11, A4 (04a's spiral drawn over frame 0).
- *Timing:* the opening's draw-on >= 1 s with its biggest change after 0.4 s (the swipe settles at ~0.4 s: `vertical.md`
  §4), ONE pen tip leading at ~12-25 px/f so the eye can ride it (`attention.md` §4); a stroke 0.10-0.20 s (6-12 f),
  strokes ~2 f apart (`MOTION.stroke`); a fill grows from 20 % over ~0.12 s (7 f), 0.13-0.27 s after its line starts;
  a pop springs with ~7 % overshoot peaking at ~0.2 s (`springs.pop`); a rise 0.33 s on an exponential ease-out (half
  its travel in the first frame); things that grow, slide or arrive decelerate over 0.25-0.45 s (15-27 f) and leave
  accelerating over 0.15-0.25 s (9-15 f) (`modern.md` M15); pieces of ONE build may come every 0.1-0.2 s, separate
  reads >= 0.5 s apart (the attentional blink: `attention.md` §5.4); start everything on one group's beat: staggering
  many movers does not help the eye track them (STUDY [MO15]).
- *Tolerated:* the build is the most watchable motion we have when it IS the mechanism; decoration built the same way
  is a seductive detail (`attention.md` L8).
- *Engine:* EXISTS: `Ink` (draw-on), `Fill` (the flood), `Pop`, `Rise`, `Sink`, `Move`, `Appear` (`lib/motion.tsx`),
  `MOTION` (`lib/spec.ts`), `evolvePath` (`@remotion/paths`); the un-build in `lib/exit.tsx`.
- *Evidence:* STUDY (the drawing hand helps learning; animation helps when it shows the process: `modern.md` [N20],
  `attention.md` [AT38]); MEASURED (the reels' cards 0.6-1.3 s; reel 03's pen ~1 s per armature).

**I11 The light pull (our focus pull).** A rack focus moves the sharp plane from one thing to another; with no blur in
our look (DIRECTION rule 5), the LIGHT moves instead.
- *Says:* "look here now", without moving the camera; the turn told by light (SR19); time passing.
- *Works:* two subjects in one frame (C3's cause above and effect below, D6's two sides), a window lighting in a row (D7),
  the opening brightening (E2), rays as light (B3).
- *Pairs:* B3, C1, C3, D6, D7, E2.
- *Timing:* the new focal reaches the frame's hardest step (>= 65 L*) while the old one drops >= 1 value step (>= 10-15
  L*); a lamp or a window switching on 0.1-0.3 s (6-18 f) with its bloom ramping at the source, the sky's change
  ~1 s; ONE light change at a time, >= 0.5 s from any other onset; with a new thing appearing at the new focal, since
  a new object captures attention and a luminance change alone captures far less (STUDY [MO9]); on its word.
- *Tolerated:* yes; a light that flickers or several lights switching at once read as a fault; never > 3 flashes a second
  (`../COZY_AND_SCALE.md` §5).
- *Engine:* PARTLY: `windowLit` (switch events, `lib/idle.ts`), the World sky's time-of-day keys with a moving edge
  (`{t, tod, wipe, dur}`, `lib/World.tsx`), `lib/light2` maps; NEW: a `lightPull(t, from, to)` helper that cross-ramps
  two story lights with one held step, and a check that the brightest area lands on the new focal.
- *Evidence:* STUDY (a spotlight cue in an animation improved understanding: `attention.md` [AT36]; new objects capture
  [MO9]); MEASURED (Arcane T7, the opening brightening a step per cut).

**I12 The pivot: the camera moves, the subject holds its screen spot.**
- *Says:* the subject is the fixed point of a moving world (E3 with a moving camera): the strongest call in the frame.
- *Works:* every camera move that keeps one subject (I3 about its target, I4's figures, I6, I7).
- *Pairs:* E3, A2 (the spot is the golden box), D2.
- *Timing:* the subject within +-40 px of its screen spot through the move, or on one smooth path between two points
  of the golden box (`cinema.md` C12); the push scales about the target's centre; the subject never moves against the
  flow unless that IS the beat.
- *Tolerated:* yes: "in a scene with everything moving, the eye is drawn to a still object" (`cinema.md` [S6]).
- *Engine:* EXISTS: `anchor` / `anchorTo` keys (`lib/cine/camera.tsx`), `PullPlane`'s pivot (`lib/pullback.tsx`).
- *Evidence:* CONSENSUS (staging); MEASURED (S5's figures hold x ~0.45 W while the world slides).

**Not ours** (each fights a rule in force; `modern.md` §7 and `../COMPOSITION_SHOTS.md` §D3 list the same family):
handheld shake and jitter (DIRECTION rule 8: holds are locked or floating; vertical makers warn against it too [MO26]);
a zoom in a hold, the "breathe" or the per-shot push (DIRECTION rule 8); roll and the Dutch tilt (no roll); the dolly
zoom (a compound move, "disorientation"); an orbit as its own move (only inside S5's one ease); rack focus, depth of
field and every blur (DIRECTION rule 5: I11 instead); a crash zoom on every key word; speed ramps that stop dead (a
camera never stops without easing: "without easing, the camera just stops, like someone hits the camera" [MO30]).

## 4. Between shots: the joins (ours: J1-J15)

Every join carries something (DIRECTION rule 1; carriers A-F, `../CRAFT.md` §a), and its midpoint lands on the next
sentence's first word, in the voice's pause; nothing else enters, pops or turns in the 0.4 s round it. **Why joins
carry, in evidence:** cuts inside one scene (related) cost viewers less processing and leave better memory than cuts to
a new scene (STUDY, `modern.md` [N3]); continuity cuts go unnoticed far more often than cuts between scenes (32 % missed
against 9 % [MO3]); a discontinuity of ACTION is what viewers mark as a new event, while breaks in space and time
matter little (STUDY [MO6]); the cut attends to where the eye already is (STUDY [MO5]). A good join is "high visual
momentum": the next view is understood at once, like "a good cut from one scene or view to another" (Hochberg and
Brooks; Woods, read through summaries [MO13]).

### 4.1 The carried joins

**J1 The continuous camera (carrier C).**
- *Says:* "still here, still going": one place, one movement; the modern long take (`modern.md` M13).
- *Works:* any change inside one place: closer, wider, down to the effect, along the street; the joins of the one big
  move; a seam between two builders that draw the identical picture.
- *Pairs:* B2, B5, C3, D2, E3 (I12).
- *Timing:* Film's `camera-continuous` default 1.4 s: the outgoing leg accelerates over 0.7 s (42 f, ease-in cubic), the
  incoming one continues at the SAME velocity and settles over 1.4 s (84 f, out-cubic): "one weighty move, no
  whip-and-stop"; travel <= 1.15x zoom or <= 150 px (the 140 px bleed); a seam's cut on a held frame or mid-move, never
  on an event (`../../G5_BLOCKING.md` §2b). Speed is continuous across the cut: `camSpeedAt` >= ~1 px/f on both
  sides of a seam (gate 1, `lib/cine/camera.tsx`).
- *Tolerated:* the best-tolerated join of all: no cut is seen.
- *Engine:* EXISTS: `camera-continuous`, the `matchcut` seam with `seam: true` and the seam probe
  (`scripts/qa/gate_check.py`), a sequence's own camera on film time (`lib/sequence.tsx`).
- *Evidence:* STUDY (continuity cuts unseen [MO3]; action continuity carries the event [MO6]); CONSENSUS (the long
  take and the seamless join, `modern.md` M13).

**J2 The push-through, and the pull-out of an opening (carrier A).**
- *Says:* "going inside", a change of level: from the place to the thing in it, from here to there through a door.
- *Works:* an opening the first shot showed for >= 0.5 s: a door, a window, a gate, a tunnel's lit end, a screen, a
  round window, a lit window in a row.
- *Pairs:* A3, A4, B1, B2, B4, B10, B12, B13, C1, D7, E1, E2, E7, E11.
- *Timing:* Film's `push-through` default 1.1 s: in 45 % (0.5 s, 30 f, ease-in cubic) to a 7x zoom on the opening's
  point, out 55 % (0.6 s, 36 f, out-cubic) as the next scene pulls back out of its own point; an optional flat bridge
  colour held ~0.1 s (6 f) when the opening's light IS the next shot's sky. The opening is 15-30 % of the frame at the
  start, on the axis, its aperture the lightest area below the sky, brightening a step as it nears (Arcane T7: the
  opening blooms a step per cut); the next focal where the aperture's centre was (within 150 px). **The zoom outruns ~3 %
  a frame after 0.19 s (at 1.12x)** and reaches 1.22x a frame at the cut (est., §5.6): by then the screen must be the
  aperture's flat light field and its rim, never detail. Arcane's measured version is two accelerating cuts of +7-9 %
  in 0.8 s each, then a landing shot already moving (P8, `../research/cine_motion.md` §4: it changes K9's single push).
- *Tolerated:* one of short form's staple joins (the "zoom transition"); ours is one push into a real opening, never a
  zoom into a random point.
- *Engine:* EXISTS: `push-through` with `from`, `to`, `zoom`, `bridge`, `hold`, `inkComp`; NEW: K9's `Portal` / room
  holes (`../COZY_AND_SCALE.md` K9: "TO BUILD"), and a check that the aperture fills the frame before the zoom passes
  ~3 % a frame.
- *Evidence:* CONSENSUS (`../research/animatic_mograph.md` §3: the "dynamic / infinite zoom"; Material's container
  transform, `modern.md` M21); MEASURED (Arcane T7, P8).

**J3 The match cut on shape (a graphic match; carrier B when the shape is the thread).**
- *Says:* "this is like that", "an object passing through time" or "the relationship between two objects" (School of
  Motion [MO31]); a graphic match "calls attention to pictorial elements" more than a continuity cut does ([MO24]).
- *Works:* one shape at one spot in both frames: a circle (window, coin, clock, sun), a vertical (mast, lamp post), an
  apex, an axis, a lit opening; the before and after of a matched pair.
- *Pairs:* A1, A2, A6, A7, B1, B9, B13, C1, D3, D5, D6, E7.
- *Timing:* a hard cut (0 f) at the anchor's fastest movement or on the word ([MO31]); the anchor within +-8 % of its
  spot and +-20 % of its size (`../CRAFT.md` §a B), at most 150 px and 1.5x (`modern.md` M20: the two tolerances are
  §10.10); ONE change across the cut (temperature, scale or world: Arcane T1). The match zoom: a flat shape zooms to
  fill the frame, holds, and shrinks into its counterpart (`MOTION.matchZoom`: 8 f in, 6 f hold, 12 f out at 60 fps).
- *Tolerated:* very well, sound helping (the cut was noticed far more when the soundtrack was removed: STUDY [MO4]).
- *Engine:* EXISTS: `matchcut` (both scenes draw the anchor at the join's numbers); NEW: a matched-anchor check at the
  boundary frames (`../../G3_ANIMATIC.md` §4 lists it as decided at G3, built the first time a reel uses it).
- *Evidence:* STUDY (features repeated across a cut guide the eye to the continuation: `modern.md` [N9]); CONSENSUS.

**J4 The match cut on light and colour.**
- *Says:* "the same light, somewhere else" or "the same place, later": the light carries the eye.
- *Works:* a bright shape (a lit window, a lamp, a sun) or the scene's one hot accent at one spot.
- *Pairs:* B3, D7, E2, E8, E11, A6's horizon.
- *Timing:* a hard cut; the bright shape's centre within 190 px (0.1 H) and its size within 1.5x; change ONE of
  temperature, scale and world (Arcane T1, layout correlation 0.81-0.90 across such cuts); a colour shift <= 15
  otherwise (`../CRAFT.md` §a).
- *Tolerated:* yes; repeated colour speeds the eye's re-orientation (STUDY, `modern.md` [N9]).
- *Engine:* EXISTS (as J3); the colour shift and eye-jump checks already flag jumps on a board (`../CRAFT.md` §a).
- *Evidence:* MEASURED (Arcane T1); STUDY.

**J5 The cut on action (a match on motion).**
- *Says:* "it keeps happening": the action bridges the cut, and the viewer finishes it.
- *Works:* rarely for us, since our panels average >= 3.5 s and our size changes come by C pushes; when a subject's move
  (a door swinging, the thread falling) begins in one size and ends in another.
- *Pairs:* E9, B6, C3 (the step down).
- *Timing:* the motion begins >= 4-6 f before the cut and RUNS ON >= 0.3 s after it, in the same screen direction:
  removing the motion after a match-action cut made viewers see the cut sooner and miss it less, while the motion
  before it mattered less (STUDY [MO4]); a cut that coincides with a motion onset goes unseen a third of the time
  (`attention.md` [AT42]).
- *Tolerated:* the invisible cut of continuity editing; for us a plain cut in disguise, so it counts against F's limit
  unless the action carries the thread across (then it is B).
- *Engine:* EXISTS: `cut` / `matchcut` with the mover keyed on film time on both sides.
- *Evidence:* STUDY [MO3, MO4].

**J6 The eyeline: the look carries.**
- *Says:* "what it sees": the "you" or a figure looks, and the next view is the thing looked at.
- *Works:* the "you" (E10, E4) turned toward the subject; a figure where the lines meet (E1) looking out.
- *Pairs:* E1, E4, E10.
- *Timing:* the look held >= 0.5 s before the join so its direction registers (est.); the head turns 0.3-0.5 s before
  the move (est.); the next shot's focal on the gaze line's end, within 150 px of where the look pointed; usually as a
  push (J2) along the sightline rather than a cut.
- *Tolerated:* yes; a gaze sends attention "along a person's sightline to the target" (`cinema.md` [S9]).
- *Engine:* EXISTS (pose and camera); NEW: nothing, a planning rule.
- *Evidence:* STUDY (gaze cues: `cinema.md` [S9], `attention.md` [AT20]); CONSENSUS (the eyeline match).

**J7 The carry (carrier D): an object leaves one edge and enters the next shot from the opposite one.**
- *Says:* "it went there": travel between places, the thread on its way.
- *Works:* a traveller with a direction: the warm water, a boat, a walker, the stick that leaves the laptop.
- *Pairs:* A1, B5, B6, B8, E9.
- *Timing:* the same speed (within ~10 %, est.) and the same screen direction on both sides; it exits fully and enters
  within 0-2 f; a thing that leaves frame right enters frame left (`cinema.md` §6.3, the 180-degree rule); vertical
  carries (out the top, in at the bottom) suit 9:16; matched HIGH speed is the device, so the carry is exempt from the
  speed budget and checked for direction and speed instead (`../../G3_ANIMATIC.md` §4).
- *Tolerated:* yes, the whip family's calm member.
- *Engine:* EXISTS as a carry across a `cut` (both scenes key the object); NEW: the carry check (direction and speed
  across the cut).
- *Evidence:* CONSENSUS (screen direction; `../research/animatic_mograph.md` §3).

**J8 The wipe by a near mass (carrier D).**
- *Says:* nothing in itself: it HIDES a change too big to show (a jump in scale or place) behind something of the world.
- *Works:* a near mass already in the first shot: a column, a tree trunk, a boat's sail, a chimney pot, the frame's rim,
  the L's tall side (B10), the foreground (C2, E5); and as D6's seam, its edge revealing the "after".
- *Pairs:* B10, C1, C2, D6, E5.
- *Timing:* Film's `foreground-wipe` default 0.8 s, the edge on an in-out sine from off one side to off the other (a
  peak of ~50 px/f for a 230 px column, ~80 px/f for a 680 px mass: est.); Arcane's eclipse wipe: a mass covering >= 70 %
  of the frame on the cut frame, on screen <= 0.5 s (T5); S5's chimney pot: its own window of >= 8 / 10 / 12 f at up to
  ~90 px/f; it moves the way the camera travels; the captions stay in screen space over it (their tone follows the
  wiper's regions). Change blindness explains why it works: a change hidden behind a disruption goes unseen
  (STUDY [MO23]).
- *Tolerated:* the object wipe is a short-form staple (CONSENSUS, `modern.md` M22); once or twice a film.
- *Engine:* EXISTS: `foreground-wipe` with `element: 'scene'` (the outgoing scene's own `Wiper`), `captionRegions`,
  `half`; **the built-in `figure` and `passer` wipers are strangers' backs at the lens drawn with ink outlines, both
  retired (§10.1)**; NEW: a clean-pen, outline-free near-mass wiper (tier C, organic, flat).
- *Evidence:* STUDY (change blindness [MO23]); MEASURED (Arcane T5); CONSENSUS.

**J9 The whip (a carry at speed).** Not ours, except as a declared exception.
- *Says:* energy, "meanwhile", a jump.
- *Why not:* the live-action whip hides its cut in motion blur (DIRECTION rule 5: no blur); its speed fights "alive but
  calm"; short-form uses it as a tic (`modern.md` §7).
- *If ever:* both sides whip the same way at the same speed ([MO21], CONSENSUS); about 0.33 s in all (one tutorial: 8 f
  at 24 fps, 20 f at 60: ONE SOURCE); the blur replaced by ONE smear drawing held 2-3 f at the peak (the hand-drawn
  substitute for motion blur since the 1940s [MO22]); exempt from the speed budget, checked for direction and speed
  (`../../G3_ANIMATIC.md` §4). A calm film reaches the same jump with J7 or J8.
- *Engine:* NEW (none built).

**J10 The morph: one thing becomes the next.**
- *Says:* "this IS that": transformation (`modern.md` M24).
- *Works:* when the story says one object turns into another (a window becomes a bar of a chart, the warm water becomes
  the heat in a home); a world-to-paper join (E's alternative).
- *Pairs:* D6 (across time), E8 (the accent keeps its colour through the change).
- *Timing:* 0.4-0.8 s in all (est.), STAGED: first the position (it travels to where the next object will be), then the
  shape and colour, then the next world arrives round it; slow-in and slow-out on each stage; the object stays the
  brightest, hottest thing throughout; at G3 it is played as 2-3 stepped drawings (start, one smear, end, popped on the
  cut word) and a G5 tween keeps that duration (`../../G3_ANIMATIC.md` §4). Never two morphs in a row.
- *Tolerated:* yes when it is the meaning; "the most complicated" device to make, often faked as a cut at peak speed
  ([MO31]).
- *Engine:* PARTLY: `interpolatePath(value, a, b)` and `interpolatePaths` (`@remotion/paths`, installed, unused in our
  lib); NEW: a staged morph helper that orders the stages and matches the two paths' point counts.
- *Evidence:* STUDY (animated transitions beat static jumps for tracking change, staged ones preferred [MO16]; animation
  helps when it is simple and slow enough to see [MO17]; slow-in/slow-out helps tracking [MO14]).

**J11 The light change: time passes in place.**
- *Says:* "later", "now it changes", the key turning on a story beat; it replaces the dissolve.
- *Works:* the same frame, its light changed: a lamp or a window switching on, the sky going from day to dusk, a cloud
  crossing the sun (`cinema.md` §7: the key changes only on a story turn, carried by light in place; a source never
  moves between cuts: DIRECTION rule 5).
- *Pairs:* A6, B3, D1, D7, E6; SR19's matched pair.
- *Timing:* a lamp 0.1-0.3 s with its bloom ramping at the source; the sky's time-of-day change by a moving edge, the
  World's default 0.4 s, ~0.8-1.5 s for "time passes" (est.); the caption tone follows the edge (`wipe: 'down'`).
  Stage practice does the same with a "lights out, change, lights up" (ONE SOURCE [MO28]); in film the switch on a
  practical light motivates the change (ONE SOURCE [MO28]).
- *Tolerated:* yes; the dissolve, its old rival, has nearly left modern film (since the 1970s almost 99 % of
  transitions are cuts; dissolves survive in rare clusters: STUDY, summary [MO11]).
- *Engine:* PARTLY: World sky keys `{t, tod, wipe, dur}`, `windowLit`, `lib/light2`; NEW: the light-pull helper (I11)
  doubles as this join's tool.
- *Evidence:* STUDY (the dissolve's decline [MO11]); MEASURED (Arcane T6 and T9: temperature flips only under motion
  or at the turn); ONE SOURCE (practice).

**J12 The un-build and the draw-on: the loop, and the line first.**
- *Says:* "back to the beginning" (the loop) and "here is the idea" (the reels' T: the line, then the world).
- *Works:* the film's last frame back to frame 0's drawing state; the opening's draw-on.
- *Pairs:* T, A7 (a formal end), SR1 and SR24.
- *Timing:* the un-build 0.5 s, all ease-in (lines loosen 0.1 s, fills shrink 0.18 s, ink retracts 0.13 s, the big slab
  collapses 0.17 s: `MOTION.unbuild`), the captions rolling back to page 1 ~0.22 s before the seam; the opening's
  draw-on >= 1 s (I10). The reels go back to their hook with a hard cut (01 at 16.0 s, 05 at 12.3 s).
- *Engine:* EXISTS: the `unbuild` transitionOut, `lib/exit.tsx` (`UnBuild`, `ExitShrink`, `EraseDown`), Film's loop
  underlay at t < 0.
- *Evidence:* the owner's rule (DIRECTION rule 9); MEASURED (the reels' loops).

**J13 The card flip or swipe of the same paper (carrier E).**
- *Says:* "the next page of the proof".
- *Works:* charts and papers (SR22), the paper keeping its spot.
- *Timing:* v1's measured flip: a pre-tilt from 0.62 s before the cut, the turn accelerating to edge-on at the cut, the
  new page flat 0.45 s after it (`lib/Card.tsx` `FLIP_PRE`, `FLIP_POST`); nearly orthographic (the card grows ~2.7 %
  edge-on).
- *Engine:* PARTLY: the flip and swipe maths in `lib/Card.tsx` (the v1 card); NEW: an E transition in Film
  (`../../G5_BLOCKING.md` §2: "no Film type yet").
- *Evidence:* MEASURED (v1's reference, `docs/motion_evidence`).

**J14 The plain cut (carrier F).**
- *Says:* the jolt: "But".
- *Works:* only on a "But" turn, at most 2 a film, the thread on both sides; into the off-balance (SR18) or the scale jolt
  (K1).
- *Pairs:* A5, B6, B11, D2.
- *Timing:* 0 f; the size changes >= 20 % or the angle >= 30 degrees (`../../G3_ANIMATIC.md` §4; `cinema.md` C4 asks
  1.5-2x: §10); the incoming camera already moving (its first key 0.5-1.5 s before the cut: K1); the new focal near
  the centre, where a cut sends the eye (`attention.md` L4).
- *Tolerated:* the reels cut between every idea (they are lists); in a story every unrelated cut costs processing and
  memory (`modern.md` [N3]).
- *Engine:* EXISTS: `cut`; `gate_check.py` counts the F joins.
- *Evidence:* STUDY [MO3, MO6]; MEASURED (§1.1).

### 4.2 What is never a join
The dissolve (two half-contrast pictures and no onset: a declared time-passing exception only, 0.2-0.4 s up to 1-2 s,
`../../G3_ANIMATIC.md` §4; J11 does the job without it); the dip or flash to black or white (Arcane T3 hid a 2x scale
jump in a 0.9 s dip once; ours is a dark near mass, J8); the reels' black card between ideas; spins, glitches, RGB
splits and flashes (`modern.md` §7); a cut in the middle of a move.

### 4.3 Which join for which change (pick by what changes)

| what changes at the join | join | its numbers |
|---|---|---|
| closer or wider on the same subject, same place | J1 (C) | <= 1.15x or 150 px over 1.4 s; <= 2x per panel inside a shot |
| into a place seen through an opening in this one | J2 (A) | the opening 15-30 % of the frame, shown >= 0.5 s; 1.1 s; flat light by 1.12x |
| to another place, with the thread | J3 or J4 (B) | the anchor within 150 px (190 for a light) and 1.5x; one change |
| following a traveller | J7 (D) | same speed and direction; enters within 0-2 f |
| a jump in scale or place that must not show | J8 (D) | >= 70 % of the stage covered on the cut frame; <= 0.5 s on screen |
| one thing becomes another | J10 (B or E) | staged, 0.4-0.8 s |
| time passes, same place | J11 | a lamp 0.1-0.3 s; the sky 0.4-1.5 s |
| to the proof (a chart, a number) | J13 (E), or J2 into a paper object | the flip 0.62 s before and 0.45 s after the cut |
| the turn | J14 (F) | at most 2; >= 20 % size or >= 30 degrees |
| the end back to the start | J12 | the un-build 0.5 s onto frame 0's drawing |

### 4.4 Sound across a join: the J-cut and the L-cut (J15)

**The definitions** (CONSENSUS [MO20]): in a **J-cut** the next shot's sound starts BEFORE its picture (an "audio lead",
a sound bridge); in an **L-cut** the last shot's sound runs ON under the new picture. No source gives a standard length:
"the amount of overlap determines how much the sound leads the picture" ([MO20], read through summaries).

**In our films the voice runs on across every join**, so the dialogue form of the J- and L-cut does not arise. What
does:
- **The picture leads its word.** DIRECTION rule 8: visuals lead their word by ~0.1 s; the evidence for words with the
  picture supports 0.1-0.3 s (`attention.md` §9.2). A join whose midpoint lands on the next sentence's first word
  starts changing the picture half its length BEFORE the word (a 1.1 s push-through begins ~0.55 s before it): the
  picture-first overlap is our house form of the J-cut, reversed.
- **The place's own sound is the J-cut.** The next place's ambience (water, a tram, wind) may lead its picture by
  0.2-0.5 s (est.), so the ear arrives first; the last place's ambience may trail 0.3-1.0 s under the new picture (an
  L-cut), ducked under the voice. One bridge per join.
- **A sound on a visual event is synchronous.** Viewers detect a sound that leads its picture by 45 ms or lags it by
  125 ms; acceptability runs from 90 ms ahead to 185 ms behind (ITU-R BT.1359, sound-ahead positive [MO19]). So a pop,
  a tick or a switch sounds on the frame of its event or 1-2 f after it (sound travels slower than light, so a slight
  lag reads natural), never more than ~2 f (33 ms) before it.
- **The cut sits where the viewer would blink.** Viewers' spontaneous blinks synchronise at implicit breakpoints: the
  conclusion of an action, a long shot, the main character's absence (STUDY, summary [MO10]). The voice's pause at a
  sentence's end is that breakpoint, which is why the join lives there.
- **The sound carries the join.** Removing the soundtrack made match-action cuts far easier to see (STUDY [MO4]); a
  soft sound under a portal or a wipe hides it further (the playbook's "with its own sound" for opening effects).
The sound-sync lane measures the reels' sync moments and writes the craft (`../sound_sync/`); its numbers win on sound.

## 5. Timing and easing for 60 fps short form (the numbers in one place)

### 5.1 Frames
1 f = 16.7 ms. 0.1 s = 6 f; 0.2 s = 12 f; 0.25 s = 15 f; 0.33 s = 20 f; 0.4 s = 24 f; 0.5 s = 30 f; 1 s = 60 f; 2 s =
120 f; 3.3 s = 198 f. A drawing held "on twos" at 24 fps = 5 f (83 ms), "on threes" 7-8 f; 12 drawings a second = 5 f
each (`stepped(t, 12)`). Film rounds a scene's first frame up: ceil(start x 60) (`../../G5_BLOCKING.md` §6).

### 5.2 Durations

| what | duration | frames | source |
|---|---|---|---|
| a stroke of the draw-on | 0.10-0.20 s | 6-12 | `MOTION.stroke` |
| a fill growing in | ~0.12 s, 0.13-0.27 s after its line starts | 7 | `MOTION.fillGrow`, `fillLag` |
| a pop (spring, ~7 % overshoot) | peaks at ~0.2 s, settled by ~0.4 s | 12 / 24 | `springs.pop` |
| a rise | 0.33 s, half its travel in the first frame | 20 | `MOTION.rise` |
| an arrival (slide, grow) | 0.25-0.45 s, decelerating | 15-27 | `modern.md` M15 |
| an exit | 0.15-0.25 s, accelerating | 9-15 | `modern.md` M15 |
| a light switching on | 0.1-0.3 s | 6-18 | I11 (est.) |
| the opening's draw-on | >= 1 s, its peak after 0.4 s | >= 60 | V9 |
| one build's pieces | every 0.1-0.2 s | 6-12 | `../CINEMATIC_GUIDE.md` "The opening" (in seconds: `modern.md` §8.3) |
| separate reads (ticks, flashes, labels) | >= 0.5 s apart | >= 30 | the attentional blink, `attention.md` §5.4 |
| a story push | >= 3 % in <= 2 s; vista pushes 2-4 s | 120-240 | I3 |
| a reveal tilt | 3.5-4.5 s for 600-900 px | 210-270 | I5 |
| the one big move | 2.0-5.0 s + a hold >= 0.5 s | 120-300 + 30 | S5 |
| a held peak | 1.5-3 s | 90-180 | I1 |
| a shot (panel) | >= 3.5 s on average | >= 210 | DIRECTION rule 1 |
| a caption page | ~1.1-1.5 s, <= 20 characters a second | 66-90 | `vertical.md` V6 |
| the quiet round a join | 0.4 s (nothing enters, pops or turns) | 24 | `../CRAFT.md` §a |
| joins | J1 1.4 s; J2 1.1 s; J8 0.8 s (<= 0.5 s on screen); J10 0.4-0.8 s; J12 0.5 s; J13 0.62 + 0.45 s; J3, J4, J14 0 s | 84; 66; 48 (30); 24-48; 30; 37 + 27 | §4 |

### 5.3 Speeds

| what | speed | per frame | source |
|---|---|---|---|
| the parallax float (near plane) | 8-15 px/s, peak <= 25 | 0.13-0.25 (<= 0.42) | 3b.5 |
| a frame edge on the floor-speed story push (3 % in 2 s) | 8 px/s at the sides, 14 at top and bottom | 0.13-0.24 | arithmetic |
| huge, far things (hero cloud) | 0-6 px/s | <= 0.1 | Scale cues 10 |
| a subject walking at the "you"'s scale (180 px = 1.7 m) | ~150 px/s | 2.5 | §5.6 |
| the reels' travelling subjects | 55-150 px/s | 0.9-2.5 | §1.2 |
| the reels' passing world (motion-blurred) | 90-420 px/s | 1.5-7 | §1.2 |
| the S5 far plane at its peak (3.3 s) | ~840 px/s | 14 | S5 |
| **the budget for detailed layers** | ~900 px/s | **~15** (a WARN; readable at 1x decides) | `PIPELINE_V2.md` "Frame rate" |
| a full-frame sideways pan of detail without judder | <= ~390 px/s | **<= ~6.4** (est.) | the 7-second rule [MO1] at 60 fps |
| the eye's smooth pursuit of one point | to ~2,200 px/s on the feed (30 degrees/s) | ~37 | [MO2] |
| a carrier's flat mass at the cut (wiper, carry) | up to ~5,400 px/s | ~50-90 | S5's pot; Film's wipe |
| the push-through's zoom at the cut | x1.22 a frame | — | §5.6 |

**The 7-second rule, scaled.** A pan judders when the picture crosses its width in under ~7 s at 24 fps with a normal
motion blur, a soft limit, "not a hard cutoff" (ONE SOURCE, a camera maker's guide [MO1]). At 60 fps the same per-frame
step allows 2.5x the speed: a width in ~2.8 s, ~6.4 px/f. Our drawings have no blur, so they strobe sooner, which is
why a full-frame SIDEWAYS pan of a detailed frame stays near that number while a tilt, a push and a pull (whose motion
is mostly along the frame's long axis or radial) keep the 15 px/f budget (est.; to be checked by `scripts/camspeed.py`
and the 1x look test). Vertical edges are the first to judder on a sideways pan (practitioner consensus [MO1]).

### 5.4 Life's speed by its scale
A walker moves about 1.4 m/s; drawn P px tall for 1.7 m, it moves ~0.82 P px/s: far walkers 15-60 px tall ~12-50 px/s,
mid walkers 110-260 px ~90-215 px/s, the 180 px "you" ~150 px/s. A boat or a tram keeps its own scale the same way;
clouds 0-15 px/s; birds 5-6 wingspans a second (Scale cues 11). The near mover is the fastest one in px; "huge means
slow" (Scale cues 10).

### 5.5 Easing (each curve with its use)

| use | curve | in our engine | evidence |
|---|---|---|---|
| an arrival (a pop, a slide-in, a move that lands) | decelerate: out-cubic, out-expo; Material's emphasized decelerate cubic-bezier(0.05, 0.7, 0.1, 1.0) | `ease.outCubic`, `ease.expOut(4.5)`, `CAM.settle` | CONSENSUS (`modern.md` M15 [N24]) |
| an exit | accelerate: in-cubic; Material's emphasized accelerate cubic-bezier(0.3, 0.0, 0.8, 0.15) | `ease.inCubic` | CONSENSUS |
| a camera move from rest to rest | ease in AND out (slow-in, slow-out) | `CAM.ease` (in-out cubic), `CAM.slow` (in-out sine) | STUDY: slow-in/slow-out beat constant speed and fast-in/fast-out for tracking objects through a transition [MO14]; "without easing, the camera just stops, like someone hits the camera" [MO30] |
| a long move that must cruise (strobe) | trapezoid(0.25, 0.35): sine ramps, a cruise, peak 1.43x the mean (against 4x for in-out quart) | `CAM.reveal` | MEASURED (Arcane); engine maths |
| a vertical reveal | front-loaded: trapezoid(0.1, 0.6), or linear | `unveil` (board only: PARTLY) | MEASURED (Arcane: all 7 vertical reveals peak at <= 45 %) |
| the one big move | cubic-bezier(0.55, 0.03, 0.50, 1.0): a creep never still, one peak at 2.1x the mean, a long landing | `S5_EASE` (`lib/pullback.tsx`) | MEASURED (#55) |
| a join's two legs | the outgoing leg accelerates (in-cubic), the incoming one decelerates (out-cubic) at the SAME velocity at the cut | Film's `camCont` (n = 3), `pushThrough` | engine (velocity-continuous) |
| a camera through several keys | velocity-continuous (monotone cubic through the keys), so it never stops dead at a key | `CineCamera interp: 'spline'` | engine |
| a drawn character | stepped poses (2-4 keys a shot, popped on their words) while the camera glides; a fast transit is one smear drawing held 2-3 f | `stepped()`; the G3 pose test | `../../G3_ANIMATIC.md` §4; [MO22] |
| a drift (a cloud, a far walker, a float leg) | linear | `prog(..., ease.linear)` | — |
| never | a linear start or stop on the camera; a bounce or overshoot on the camera; staggered starts across many movers (no gain in tracking, a loss of common-motion grouping: STUDY [MO15]) | | |

The arcs principle holds for everything that travels: the thread object moves on an arc or an S, never on a ruler line
(`modern.md` M15; the classic animation principles, `cinema.md` [S5]).

### 5.6 Our arithmetic (est.)
- **Walk speed:** 1.4 m/s x (180 px / 1.7 m) = 148 px/s = 2.5 px/f; crossing the feed's visible 884 px takes 6.0 s.
- **The push-through's zoom** (Film's default: 7x over the 0.495 s outgoing leg on an in-cubic in log space): the
  log-zoom rate at the cut is 3 ln 7 / 29.7 f = 0.197 a frame, x1.217 a frame; it passes 3 % a frame at u = 0.39 of the
  leg (0.19 s in, at 1.12x). The frame's edge moves ~210 px/f at the cut.
- **The continuous camera** (default 1.4 s, the incoming zoom 1.12x): the log-zoom rate at the cut is 0.24 a second;
  the frame's top edge moves ~3.9 px/f there: a gentle push, well inside the budget.
- **The wipes:** an in-out sine edge crossing 1080 + 2 x half + 60 px in 0.8 s peaks at pi/2 x distance / 0.8 s: 49
  px/f for the 180 px figure, 52 for the column, 82 for the 680 px passer.
- **The 7-second rule:** 1080 px / 7 s = 154 px/s = 6.4 px/f at 24 fps; the same per-frame step at 60 fps = a width in
  2.8 s (386 px/s).
- **Smooth pursuit:** 30 degrees/s x 74 px/degree = 2,220 px/s = 37 px/f on the owner's feed.
- **The match zoom at 60 fps:** `MOTION.matchZoom` 4/30 + 3/30 + 6/30 s = 8 + 6 + 12 f.
- **The reels' speeds in our frame:** %W/s x 10.8 = px/s (the reel's picture shown at full width maps to our 1080 px:
  `reels.md` §1; on the owner's feed the width is 884 of our px, so x 0.82 for what he sees).

## 6. What short-form viewers tolerate (and what they don't)

**The window.** The next reel settles ~0.4 s after the swipe (MEASURED, `vertical.md` §4); a mobile feed item gets
~1.7 s (`vertical.md` [V4]); the stay-or-swipe falls at ~1.5-2 s (`attention.md` §4). Our own: a calm, pretty opening
lost ~80 % of viewers by 3 s (the playbook's Performance log).

**Pace that holds** (the evidence and its grade):
- Film's shots have shortened for a century, to ~4 s by 1985-2005, with more motion in them (STUDY [MO12]); Arcane's
  highlights run a median 2.73 s, the refuge longest (3.96 s) (MEASURED); the owner's reels give an idea ~2-3 s (MEASURED,
  §1.1); creator guidance says "cut every 2-3 s" and puts the top Shorts at a 2.5 s average shot (ONE SOURCE each, method
  unpublished [MO29]).
- Ours: panels average >= 3.5 s, but something changes on the subject every ~1.5-3 s and a caption page every ~1.1-1.5
  s, so the felt change rate matches the feed's while the joins stay few and carried (`attention.md` §5.4).
- Camera changes INSIDE a scene raised arousal and memory up to fast rates; fast pacing plus arousing content overloads
  viewers (STUDY, `attention.md` [AT46]): our calm content takes a quick pace of change inside continuous shots.

**What they accept:**
- **Carried, related joins** (STUDY: they cost less processing and leave better memory; `modern.md` [N3]); "seamless
  transitions" are short form's own vocabulary, with the common advice to keep them short, match light and colour
  across them and not overuse effects (CONSENSUS, practitioner blogs [MO29]).
- **A still camera** when something keeps changing (the reels: 21 of 25 shots hold the camera, §1.2).
- **Depth moves and vertical moves** more than sideways ones in the tall frame (ONE SOURCE each [MO26]; the frame's
  arithmetic: a sideways mover crosses the visible width 2.2x sooner than the height).
- **A drawing being made** (STUDY: the hand drawing helps; whiteboard animation raised engagement: `modern.md` [N20,
  N21]).

**What they don't:**
- **A dead second:** no mover for > 1 s reads as a frozen frame (Scale cues 11; `deadframes.py`'s 0.4 s flag).
- **Effects with no meaning:** a whoosh, a punch-in or a shake on nothing spends an orienting response on nothing
  (`attention.md` §5.3); interesting-but-irrelevant extras cost understanding (META, `modern.md` [N18]).
- **The dissolve:** almost every modern transition is a cut (STUDY [MO11]); a cross-fade reads slow and dated, and it is
  two half-contrast pictures with no place to look (`attention.md` §8).
- **Motion the eye cannot follow:** one point faster than ~37 px/f breaks into catch-up saccades [MO2]; several pens or
  movers at once split the look.
- **Flashes:** never more than 3 a second, at any size (`../COZY_AND_SCALE.md` §5).
- **Shaky or big sideways moves** in 9:16: "Avoid shaky hand held, quick pans or big movements" (ONE SOURCE [MO26]).
- **Slow, invisible moves:** a push under ~1.5 % a second reads frozen (3b.5); a 0.3 s draw-on was invisible on a phone
  (the owner, 2026-10-28).

