# CINEMA: composition as film and animation use it (research, 2026-10-30)

The owner (2026-10-30): "After we are done with this I want you to do another research and distill of the composition
shots to use / Take a look at this folder I collected some initial references but do the deeper research"
(`docs/look/refs_composition/`). Earlier the same day, on our list of differences from the references: "8 agreed this is
an important point about scene composition"; on still v6: "our scene is very busy".

**What this is.** The cinematography and animation-layout lane of that research: the 9:16 frame as a grid and where
the eye goes in it (§1), shot sizes and angles and what each says (§2-3), the classic devices (§4), staging and
silhouette (§5), background layout in 2D studios (§6), colour scripts (§7) and how a camera move changes a
composition over a shot (§8), each turned into placement rules in pixels for our frame; the owner's reels and their
cheat sheet read in 9:16 (§9); the rules distilled (§10); doc clashes (§11); 20 sources (§12, cited [S1]-[S20]).
Its sibling, the measured notan study of scene 1 with rules R1-R12, is `docs/look/organic/composition.md`; this page
cites those rules as R1-R12 and does not repeat them.
**Rank:** research notes, the lowest rank on DIRECTION's ladder; nothing here is a rule until it is integrated into
`LAYOUT.md` (§1-3), `CINEMATIC_GUIDE.md`, `STORYBOARD_STYLE.md` (§3, §7), `G3_ANIMATIC.md` or W1 (§10 names the
target of each). Methods only: no footage traced or copied, no reference used as an input to a picture of ours, no
living artist as a style target. Paths are from `video/`. Px at 1080 x 1920, y down, W = 1080, H = 1920; the zones are
`LAYOUT.md` §1's: caption band y 290-600 (block y 317-556, centred on x 520), read zone y 600-1250, subject axis x
380-700, bottom UI y > 1520, right rail x > 950 at y 900-1500. Scratch work (downloads, the tables' scripts):
`/tmp/comp/cinema/`.

## 0. Bottom line

1. **Every classic device serves one job: make ONE thing win and let everything else serve it.** The rule of thirds,
   as first written (J. T. Smith, 1797), is a rule of unequal proportions: "Two distinct, equal lights, should never
   appear in the same picture: One should be principal, and the rest subordinate, both in dimension and degree" [S3].
   Dow calls the same law subordination [S2], Poore principality, "the sacrifice of many measures to one" [S1], the
   Disney animators staging, "one idea at a time" [S5, S6]. v6 is busy because it breaks this law, not for want of a
   grid: a device is worth drawing only when it points at the one focal (R3).
2. **The eye-tracking evidence says the same, with numbers to lean on.** When a scene appears, the first look goes to
   the screen centre, whatever the picture holds [S7]; in moving pictures many viewers look at the same place at once,
   at motion and people, and when one thing moves, everyone looks at it [S8, S9]; in a frame where everything moves, a
   still thing wins [S6]; viewers prefer a front-facing subject at the centre and a side-facing one facing INTO the
   frame [S10]. So: the focal near the centre (x 413-667, y 951-1187), one mover at a time, the "you" facing into the
   frame and toward the subject.
3. **In 9:16 the full frame's classic points mostly land where we cannot use them** (§1): the dynamic-symmetry eyes and
   the golden-spiral poles fall in the caption band or under the read zone, the thirds' verticals just outside the
   subject axis. The usable picture is the **stage square** under the band (y 600-1520, 1080 x 920): its golden lines
   (x 413, 667; y 951, 1169) and its diagonal "eyes" fall on the subject axis and inside R7's focal range, the four eyes
   making the box x 454-626, y 987-1133.
4. **The horizon's height is the master decision of a 9:16 exterior** (§3). With a level camera the horizon cuts every
   standing figure on the camera's ground at (camera height / figure height) of its height, near or far; at eye level
   (1.6 m) every standing head sits on the horizon. The owner's human-scale references all use a LOW eye: horizon
   0.57-0.85 H, the camera at or below the people's eyes, their heads at or above the horizon against the far world,
   the sky the big quiet mass. Still v6 keeps v2's low camera (~1 m) but its quay lines meet at y ~995, the frame's
   half; our documented default horizon (0.40 H, y 768) with an eye-level camera stands a 180 px "you" at y 757-937,
   right under the captions and between the words and the focal (which R7 forbids). A near "you" low in the frame at
   eye level needs a LOW horizon; with a mid or high horizon it needs a camera 3-7 m up. Hence two setups, each with
   its figure placement in pixels: **A, the low eye** (camera 0.9-1.6 m, horizon 0.60-0.68 H: the references) and
   **B, the raised eye** (camera 3-7 m, horizon 0.36-0.45 H). W1 declares one per set; the horizon at the half (v6)
   is neither.
5. **Sizes and angles** (§2-3): the scale ladder steps 2-3x per size (2D layout's 6 to 12 field [S16]); eye level is
   the default ("we are equal" [S13]); a low angle only for the monumental quantity, a high angle for pattern, crowds
   and maps; never a Dutch tilt (no roll: DIRECTION rule 8); no human close-ups: CU and insert go to objects.
6. **Staging and layout** (§5-6): an action reads in silhouette, in profile or 3/4 back, never across the body [S6];
   a layout exists "to support the actions and placement of the characters", spiral and radiating pathways are its
   workhorses, and the background carries no "meaningless information" [S16]; in a 3 s shot the background is caught
   in about a quarter second [S16]. Our G3 panel IS the layout: §6.4 lists what each panel declares.
7. **The colour script** (§7): a strip of small thumbnails, one per beat, planning "color, value, and visual drama" for
   the whole film [S18]; contrast is intensity and affinity is calm [S17]. Plan the film's intensity curve in value
   first (a grey strip at W1 and G3), in colour at G4; the key changes only on a story turn.
8. **A camera move is a sequence of compositions** (§8): the start, the middle and the end frame each pass the frame
   rules; one variable per move; the subject is the pivot that holds its screen spot while the world moves past it,
   the still point among moving planes being the strongest call [S6].
9. **Distilled rules C1-C14 with their target docs: §10. Clashes: §11** (the main one: an eye-level camera, a 0.40 H
   default horizon and a near "you" low in the frame cannot all hold at once).

## 1. The frame we compose in (9:16, with our zones)

Every guide line of the classic armatures, computed for 1080 x 1920 (`/tmp/comp/cinema/notes.md`; the golden spiral
and the reciprocal by their constructions [S4]):

| guide | lines / points (px) | where it lands in our frame |
|---|---|---|
| centre | (540, 960) | inside the subject axis and the read zone, 20 px right of the caption's centre line (x 520) |
| thirds | x 360, 720; y 640, 1280 | both verticals 20 px OUTSIDE the subject axis (380-700); y 640 is 40 px under the band, y 1280 is 30 px under the read zone |
| golden section (0.382 / 0.618) | x 413, 667; y 733, 1187 | all four crossings inside the subject axis and the read zone; the lower pair in R7's focal range (y 860-1200), the upper pair only 177 px under the caption block (R7 asks 300-650) |
| rabatment (the two implied squares [S3]) | squares y 0-1080 and 840-1920; lines y 840, 1080 | the top square holds the words and the sky, the bottom square the stage and the near ground; their overlap y 840-1080 is the hinge of the frame |
| frame diagonals | 60.6 deg from level | steep: a corner-to-corner line in 9:16 reads as a climb, not as the 16:9 "diagonal" (29.4 deg) |
| dynamic-symmetry eyes (a corner's perpendicular to the diagonal [S4]) | 0.240 along it: (260, 461), (820, 461), (260, 1459), (820, 1459) | the upper two inside the caption band; the lower two at y 1459, under the read zone and 61 px above the bottom UI: no place for a focal |
| reciprocal line from a top corner | meets the far edge at y 608 | at the band's bottom edge: the band's lower edge is the frame's own reciprocal |
| golden-spiral pole (a golden rectangle 1080 x 1747 fitted to the width) | 0.276 of each side from a corner: x 298 or 782; y 483-656 or 1265-1437 by the rectangle's placement | outside the subject axis (by ~80 px), in or at the band, or under the read zone; inside the read zone's own golden rectangle (y 600-1267) the pole is (298 or 782, 784 or 1083) |
| **stage square** (y 600-1520, full width, 1080 x 920, near-square) | thirds y 907, 1213 (x 360, 720); golden y 951, 1169 (x 413, 667); diagonal 40.4 deg; eyes (454, 987), (626, 1133), (454, 1133), (626, 987) | the picture under the words: its eyes make the box x 454-626, y 987-1133, inside R7's focal range and the subject axis; its 40 deg diagonals are the comfortable "dynamic" ones |

**What it means.**
- The 9:16 frame is three stacked pictures: the words (the band, in the top square's sky), the stage square (where the
  story happens) and the near band (y 1250-1920, most of it under the platform UI). Compose the story inside the
  stage square; the top of the frame is the sky that holds the captions; the full-frame armatures are for the
  big masses only (the sky against the ground, a tower against the sky).
- **The focal's home** is the stage square's golden box: x 413-667, y 951-1187 (its eyes x 454-626, y 987-1133 at its
  heart). It agrees with three independent things: the centre bias of the eye [S7, S10], R7's drop from the words (y
  860-1200), and LAYOUT's subject axis.
- **The horizon goes near a third or a golden line of the full frame, never near the half:** y 640-860 (sky a third
  or so: ground-led, setup B, §3.3) or y 1150-1300 (sky two thirds: sky-led, setup A); never y 900-1020 (0.47-0.53
  H), Smith's "precise formal half" [S3] and the composition guides' "The horizon line should not divide the art work
  in two equal parts" [S3]. v6's horizon is at the half: its paving lines meet at (-1124, 995), 0.52 H (Hough lines on
  our quay, the median of 131 crossings, interquartile y 988-1003; method in §12).
- **A spiral or a golden triangle needs the stage square, or the left-third hero spot** (x ~200-450, still open in
  LAYOUT §8.2): in the full frame their eyes fall in the band or the UI.

**Where the eye goes (the evidence behind the numbers).**
- **The centre first.** "When the scene appeared, the initial response was to orient to the center of the screen", and
  the bias held whatever the picture's features or the viewer's task [S7]. A new shot starts the eye near (540, 960):
  a focal there costs no search; one 300 px away (~3.6 deg at phone size) costs a saccade and a moment.
- **Motion, people, one at a time.** In moving scenes, gaze clusters ("attentional synchrony") on motion and people,
  and "initial saccades default toward the screen center, areas of high motion and people" [S8]; "If there is only
  one point of motion at a particular moment, then all viewers will look at the motion", and the greater the motion
  contrast against the still ground, the surer it is [S9]. Every extra mover splits the room.
- **The still one among movers.** "The eye is drawn to motion in an otherwise still scene. In a scene with everything
  moving, the eye is drawn to a still object" [S6]: during a camera move or a busy float, the screen-locked subject
  wins.
- **Facing and gaze.** A front-facing subject is liked best at or near the centre, less the farther it sits; a
  side-facing one is liked facing into the frame [S10]; art puts more space in front of an animal than behind it
  [S10]. A figure's gaze or gesture sends attention "along a person's sightline to the target" [S9]; turning a figure's
  back on us frees the eye to wander [S9].
- **Up and down.** Things that live above us (a lamp, a flying bird) are liked above the centre, things below us (a
  bowl) below it, and things seen straight from above or below near the centre [S11].
- **What pulls first.** "A saturated yellow will always attract a viewer's eye first" [S17] (v6's four yellow upper
  windows out-shouting the lit door, `organic/composition.md` §3); light, contrast and lines pull, clutter splits
  [S3]; "Only the visual information at the centre of attention can be perceived in detail" [S9]: detail away from the
  focal is never read, it only adds pieces at a squint.

## 2. Shot sizes and what each says

Size is how much of the subject and its place the frame shows, set by the camera's distance and its lens [S12]. The
classic ladder is defined on a human body (eyes, shoulders, waist, knees, feet); our films have no faces and never a
near person as the subject (LAYOUT §2), so our ladder is defined on the beat's SUBJECT (an object, a door, a building,
a screen), and the "you" is always the small figure at the scale the playbook sets (~130-220 px).

| size | classic framing | what it says | ours (the subject, the "you", the frame) | use |
|---|---|---|---|---|
| extreme wide (EWS, ELS) | the figure tiny or absent; "epic views and panoramas" [S12] | the place, the scale; it can "make your subject appear small against their location ... distant or unfamiliar" [S13] | the world past every edge, 5-7 planes, one landmark huge yet far; the "you" 60-150 px (K wides) or 170-200 px (S5's end) (LAYOUT §2) | the scale beat, 1-2 a film, ~1.5-4 s (DIRECTION 7) |
| wide (WS, LS) | the whole subject with its surroundings; the establishing shot's "broad overview" [S12] | the subject's "relationship to their surroundings", "narrative distance" [S13] | the home view: the subject 15-35 % of the frame's height (290-670 px) in its place; the "you" 130-220 px near the camera (setup A or B, §3) | the home place, >= 50 % of the runtime (cozy) |
| medium (MS) | the waist up on a person; "the most common shot in movies" and it "usually follows the first establishing shots" [S12] | the action, a balance of subject and setting [S13] | the subject box 270-460 px wide (35-60 % of the stage, LAYOUT §1), one backing, at most two props cut by the edges | the mechanism beats: the explainer's working size |
| close (CU) | a feature fills the frame; "the most detail, but they do not include the broader scene" [S12] | importance: major characters get a close-up "as a way of indicating their importance"; "If overused, close-ups may leave viewers uncertain as to what they are seeing" [S12] | an object >= 60 % W (>= 650 px), never a face; reached by a push of <= 2x per panel or a cut-in on a "But" turn (LAYOUT §2) | the personal beat; the object the story turns on |
| insert (ECU) | one detail; "very little space to breathe" [S13] | "look at exactly this" | one detail filling the stage: a number 120-160 px on what it measures, paper straight-on (LAYOUT §2-3) | the proof, the payoff number |

**Rules for sizes.**
- **The ladder steps 2-3x.** 2D layout frames close-ups at 6 field and long shots at 12 field [S16], a 2x step in width;
  our push is <= 2x per panel (LAYOUT §2) and our planes step 2.2-3x (CINEMATIC_GUIDE "Scale cues" 2). Two shots of
  one subject joined by a plain cut (F) differ by >= ~1.5-2x in size or >= 30 deg in angle, else the cut reads as a
  jump (film's "20 mm/30 degree" guideline [S20]); a deliberate match keeps the exact frame (LAYOUT §4).
- **The wider the shot, the simpler its masses.** A 3.5 s shot's background is caught in about a quarter second while
  the eye goes to the subject [S16]: a wide must read at a glance as three masses and one call (R1-R3); the detail a
  shot can afford sits ON the subject in a close, never around it in a wide.
- **Size is the camera's, never the thing's:** a figure is calmed by colour, not shrunk (CRAFT §f.5); a subject is
  made important by size on screen (a push, a cut-in) or by isolation, "the farther from the centre and more isolated
  an object is, the greater its weight" [S1].

## 3. Camera height and angle

### 3.1 What each angle says, and ours

| angle | what it says | ours |
|---|---|---|
| eye level | "little to no psychological effect" [S12]; "a neutral perspective (not superior or inferior)", "it can break down boundaries" [S13]; it "plants the idea that we are equal with the character" [S13] | the default: the camera where a person would stand (playbook DEPTH AND SCALE FROM A HUMAN VIEWPOINT) |
| high angle | the subject "small or weak or vulnerable" [S12], "a feeling of inferiority" [S13]; an overview | K10 (horizon 0.15-0.30 H) on a crowd, never on one person, once a film (LAYOUT §2); the mild raised eye of setup B (3-7 m) for a home view |
| low angle | "powerful or threatening" [S12]; "signaling superiority or to elicit feelings of fear and dread" [S13] | K7 worm's-eye on the quantity, never on the thing under critique (LAYOUT §2); the mild low eye of setup A (0.9-1.6 m) reads as standing beside the people, heads against the sky |
| overhead, bird's-eye | "neutral or sometimes divine point of view" [S13]; it shows "the landscape and the actors relationship to it" [S12] | only as paper: a chart or a map is a flat thing in the place, straight-on (LAYOUT §2) |
| worm's-eye | "the view that a child or a pet would have" [S12] | K7, horizon 0.58-0.64 H (LAYOUT §2) |
| Dutch (canted) | "the world is out of balance or psychological unrest" [S12] | never: no roll (DIRECTION 8; CINEMATIC_GUIDE "Not for us") |

**How an angle is drawn in our world.** Our verticals stay parallel (no three-point convergence: CINEMATIC_GUIDE "Not
for us"), so the camera stays level and the frame slides up or down, as a shift lens does. The angle then shows in
two things only: **the camera's height** (where the horizon cuts the figures) and **the horizon's place in the frame**
(how much ground or sky the frame shows). Both are W1 decisions per set, kept in every shot of it (CRAFT §f.4, "ONE
camera per shot").

### 3.2 The horizon-cut rule (where the figures stand)

On level ground, a level camera at height c sees the horizon cut every standing figure at c / (figure height) of its
height from the feet, whatever its distance: feet at y_h + P c / h and head top at y_h - P (h - c) / h (P the figure's
height in px, h its height in metres, y_h the horizon). This is CRAFT §f.5's "people on one level keep one eye ratio
within +-15 %", in numbers. For a 1.7 m "you" drawn 180 px tall (the offsets scale with P):

| horizon y | camera 0.9 m (waist) | camera 1.6 m (eye) | camera 3 m (a wall, a step) | camera 6 m (a first floor) |
|---|---|---|---|---|
| 640 (0.33 H) | head 555, feet 735 | head 629, feet 809 | head 778, feet 958 | head 1095, feet 1275 |
| 768 (0.40 H, our default) | head 683, feet 863 | **head 757, feet 937** | head 906, feet 1086 | head 1223, feet 1403 |
| 960 (0.50 H) | head 875, feet 1055 | head 949, feet 1129 | head 1098, feet 1278 | head 1415, feet 1595 |
| 1187 (0.618 H) | head 1102, feet 1282 | **head 1176, feet 1356** | head 1325, feet 1505 | head 1642, feet 1822 |
| 1280 (0.67 H) | **head 1195, feet 1375** | **head 1269, feet 1449** | head 1418, feet 1598 | head 1735, feet 1915 |

Read the other way: a 180 px "you" whose feet stand at y 1300-1480 under a 0.40 H horizon implies a camera 5.0-6.7 m
up (3-4 figure heights); a 130 px one, 7-9 m. **At eye level every standing adult's head is ON the horizon**, near or
far (a 15 px far walker's head 1 px above it, the 180 px "you"'s 11 px): the horizon is the line of heads, the oldest
figure rule of a level view.

### 3.3 Two setups for an exterior home view

The owner's four human-scale references, read by eye (`docs/look/refs_human_scale/`): the city on the hill, horizon
~0.57 H, the camera at the standing man's chest, his head above the horizon against the lit city; the beach, horizon
~0.70 H, the camera at ~0.9 m (the horizon crosses the couple at about half their height), their heads against the
sky; the 9:16 motion piece, the ground line at ~0.85 H with the girl standing on it, the sky ~85 %; the bus stop, the
ground at ~0.85 H, the camera about a seated man's height. Still v6, built on v2's view (the owner: "our initial angle
snd the view frankly wasn’t bad"), has a low camera too, but a mid horizon: our quay's paving lines meet at y ~995
(0.52 H, measured: §1), and the horizon crosses her in the door at ~56 % of her height (head y ~928, feet ~1080, so a
camera ~1 m above the quays); the frame holds no "you". A 180 px "you" on our quay in that view would stand at y
~921-1101, beside her on the line of heads: a second call in the middle of the read zone.

So a human-scale "you" near the camera fixes the horizon, and the horizon fixes the frame. Three ways to frame an
exterior home view:

| | **A, the low eye, low horizon** (the references) | **B, the raised eye** | v6 as built (for comparison) |
|---|---|---|---|
| camera | 0.9-1.6 m on the "you"'s ground (standing, or lower) | 3-7 m (a raised quay, a bridge, steps, a first floor) | ~1 m |
| horizon | y 1150-1300 (0.60-0.68 H): sky two thirds | y 690-860 (0.36-0.45 H): sky a third or so | y ~995 (0.52 H): the half |
| the "you" (180 px) | head at or just above the horizon, against the far belt or the sky: feet y 1356-1449 (camera 1.6 m) or 1282-1375 (0.9 m) | below the horizon, seen from behind and a little above: e.g. head 1117, feet 1297 (horizon 768, camera 5 m) | none; if added, y ~921-1101, level with the focal |
| the sky | 60-68 % of the frame, the caption band high in it: R5's quiet sky comes free | 36-45 %, the band inside it; ground and water take 55-64 % and need R5's quiet near mass | ~50 %; the band at its top |
| the far world | one dense belt on the horizon, rising into the sky where it is tall: detail inside one band (R2, R6) | a deep field spread below the horizon: room for the far side's density, more pieces to keep quiet | the far side across the middle |
| the subject | on the horizon belt or rising above it (a lit facade, a tower): y ~900-1300 | in the middle distance, below the horizon: y ~850-1150 | the lit door at y ~850-1080 |
| scale | a near human figure against a far, big world: the playbook's DEPTH AND SCALE | the world spread out below; the person small, a mild high angle | the world level with us |
| risk | the "you" and the subject share the line of heads: two calls; keep the "you" soft (tier B), from behind, at one side (x 120-380 facing right, or x 700-900 facing left), its gaze on the subject | busier (more ground, more things); a high angle makes the "you" small and watched | the horizon at the half [S3]; no room for a near "you" |

**Proposal (C3):** W1 declares A or B per set, with its camera height and horizon; every figure is placed by the
horizon-cut rule; the half is avoided. The scene-1 look test shows A beside v6's view: composition.md's T3 ("the camera
tilted up 140 px" for a bigger sky) is already a step toward A; the owner picks, and v2's view keeps its camera height
either way.

**Vertical placement by nature** [S11]: things that live above us (birds, a lamp, the sun, a sign) are liked above the
centre, things that live below us (a cup, a laptop on a table, a boat on the water) below it: in 9:16 the top square
(the gutter y 120-290 and the band's sides, or y 600-840) holds what lives above, the bottom square what lives below,
and a symmetric top-down thing (a round table seen from above) sits near the centre.

## 4. The classic devices, each as a placement rule for 1080 x 1920

Each: what it is and what it does (sources), then the rule in pixels for our frame and our use. One device per shot
does the leading; a second is allowed only when it points at the same focal (a frame within a frame whose sill is
also the leading line). The owner's reels teach one device per example (§9): that is the right dose for a film frame.

**4.1 Thirds: unequal division, not hot spots.** Smith's 1797 rule asks for 2:1 proportions everywhere: one principal
light, the sky "at about two-thirds; or else at about one-third", water and land 2:1, a long line broken at a third,
"a much better and more harmonizing proportion, than the precise formal half, the too-far-extending four-fifths"; in
use, the subject goes on a line or a crossing, the horizon on a line, the extra room in front of the subject [S3].
Measured on large sets of good photographs and paintings, conformity to the grid "seems to play only a minor, if any,
role" [S3]. **Rule:** use thirds as proportions: one value group 40-55 % of the frame (R1), the sky a third or two
thirds (§1), warm to cool about 2:1 (Reynolds's ratio, via Field [S3]), one quiet mass about twice the other (R5's
sky 30-40 % over the near ground 15-25 %); never two equal halves of anything. In 9:16 the thirds' verticals (x 360,
720) sit 20 px outside the subject axis: a subject "on a third" stands at the axis's edge (x 380-420 or 660-700), facing
into the frame.

**4.2 The golden section, the spiral and dynamic symmetry: a nudge, not a law.** 565 paintings averaged a 1.34
canvas, not the golden 1.62; Fechner's preference for the golden rectangle has not held up ("at best, inconclusive");
the golden spiral is a log spiral built from nested golden rectangles [S4]. Hambidge's dynamic symmetry draws a
rectangle's diagonal and the perpendicular to it from a corner (the reciprocal) and composes on that net [S4].
**Rule:** the stage square's golden lines (x 413, 667; y 951, 1169) are the focal's home (§1); a spiral composition
works only inside the stage square or the read zone, its pole at x 298 or 782 (outside the subject axis), so it needs
the left-third hero spot (x ~200-450, still open in LAYOUT §8.2) and is a deliberate variant, never the default; the full
frame's reciprocal meets the far edge at y 608, at the band's lower edge: keep that edge clean (no prop or roof across
it).

**4.3 The centre and symmetry.** Viewers like a front-facing subject best at or near the centre, less with every step
away [S10]; Poore finds the canvas's centre is the picture's pivot and "the vertical division is the more important"
[S1]; the guides keep a prominent subject off-centre "unless a symmetrical or formal composition is desired" [S3].
**Rule:** 1080 px is narrow: the subject axis (x 380-700) IS the centre third. A front-facing or symmetric subject (a
door straight on, a phone, a chart) sits on x 520-540 (the caption's line and the frame's); a side-facing one sits off
centre on the side it faces away from (4.7). A fully symmetric frame (mirrored about x 540, the two halves within
+-5 % in mass) is a formal, settled beat: a loop's end, an institution, a chart; one or two a film; never the horizon
at the half.

**4.4 Balance: the steelyard.** "On the principle of the steelyard, the farther from the centre and more isolated an
object is, the greater its weight or attraction. Therefore ... a very important object placed but a short distance from
the centre may be balanced by a very small object on the other side of the centre and further removed from it"; "where
the subject is on one side of the centre it must exist close to the centre, or ... show positive anchorage to the
other side"; "the small balancing weight of the steelyard should not become a point causing divided interest"; and
balance runs in depth too: the "aggressiveness" of a foreground comes from "the lack of their balancing complements in
the back planes of the picture" [S1]. **Rule:**
weight x distance from x 540 balances: the focal 0-130 px off centre (inside the axis) is balanced by one counterweight
>= 300 px out on the other side (x < 240 or > 840: the hero cloud in a top corner, a soft mass at a side edge),
bigger and softer, its pull < 50 % of the focal's (R8), and never isolated and crisp (isolation adds weight [S1] and
would make it a second call). Top to bottom: the words are a heavy top; the near dark mass (R10) balances them low.

**4.5 Leading lines and the eye's path: in, round, never straight out.** "One spot or circumference there should be
toward which through the suppression of other parts the eye is led at once"; "Any element which proves too attractive
along this avenue of entrance is confusing"; in deep pictures "the best mode of entrance is to triangulate in, with a
series of zigzags"; where lines are missing, "an arrangement of receding spots, or accents is an equivalent"; "The eye
should never be permitted to leave the principal figure or object and go straight back and out through the centre";
"The eye always follows the course of light from the shadow"; a line "cutting a picture diagonally, almost from corner
to corner" must be interrupted [S1]. "Spiral and radiating pathways are the most common types used in layout
compositions" [S16];
"Many lines without a clear subject-point suggest chaos" [S3]. **Rule:** every line in the stage either leads to the
focal or is calm (level, tone-on-tone). The path enters from the near band (or drops from the words: R7), zigzags in 2-3
legs of >= 150 px that alternate sides, and its last leg ends on the focal (within 40 px of its box) or at a vanishing
point beside it; nothing along it pulls >= 50 % of the focal (R3); no line runs corner to corner unbroken or crosses
the band; the light lane runs from shade toward the focal's light, never past it into an empty vanishing point.

**4.6 Frames within frames, the repoussoir, the coulisse.** A repoussoir is "a figure or object along the right or left
foreground that directs the viewer's eye into the composition by bracketing (framing) the edge and creating a greater
sense of depth"; in 1762 the term meant "strongly coloured or deeply shaded objects placed in the foreground ... to
make the other objects appear farther away" [S14]. Claude's two schemes, as Poore reads them: sides darkened so "the
light of the centre might gain by contrast", or a large shadowed first third, "reserving the more distant mass, which
is the most attractive, to gain by the sacrifice of the foreground mass"; and "sky spots in a dark background are air
holes" [S1]. **Rule:** one inner frame (a door, a window, an arch, the gap between two masses) of 15-30 % of the frame
(LAYOUT §2's one opening), its aperture >= 10 L* off its rim and holding the focal; the rim darker or lighter as a
mass, quieter than the aperture, with <= 2 props (R6); the repoussoir on ONE side only, cut by that edge (x 0-200 or
880-1080), never two equal wings; in 9:16 width is scarce, so side wings stay <= 20 % W each and the frame's natural
framing pieces are the top lid (gutter y 0-290) and the near band. A frame within a frame is also the classic start of
a reveal (§8).

**4.7 Negative space, lead room and headroom.** Lead room is "the space in front, and in the direction of, moving or
stationary subjects"; without it a car's "progress will seem impeded" [S14]; viewers prefer a side-facing subject to
face into the frame (the inward bias), and painters give an animal more space in front than behind [S10]. Headroom
"changes relative to how much of the frame is filled by the subject"; "Too much room ... results in dead space"; in an
extreme wide "It can be more visually pleasing to give equal weight to the sky and ground" [S14]. **Rule:** a facing or
moving subject gets 1.5-2x more room in front than behind: facing right at x 380-430 (650-700 px ahead, 1.5-1.8x),
facing left at x 650-700; a figure looking up has the thing it looks at above it on its sightline, clear of the band;
a moving thing keeps or grows its lead room through a move (the camera leads). Our negative space is R5's quiet masses
(>= 65 % quiet in two connected masses), and the space between the words and the focal is the focal's headroom: quiet
(R7).

**4.8 Depth layering and foreground framing.** The multiplane camera moved layers "at various distances" and speeds,
"the further away from the camera, the slower" [S15]. Guo Xi named three distances for a landscape: high (looking up
at a mountain from below), deep (from the front of a mountain to the ranges behind it), level (out over low hills)
[S19]; his hanging scroll and the later vertical woodblock print [S19] are the old 9:16. Poore: "We feel the vastness
of a scene by the presence of a lone figure" [S1]. **Rule:** at least three readable zones (near frame, the subject's
plane, the far and the sky) and 4-6 planes (CRAFT §f.1); in 9:16 the planes STACK UP the frame (the near at the
bottom, each farther one higher), overlapping, never touching tangent, no two plane tops within ~40 px of each other
(est.: two equal tops read as one stacked band); the near frame a quiet
mass with <= 2 props cut by the edges (R6). Our three shot families are Guo Xi's three distances: high = the tilt-up
and worm's-eye (K2, K7), deep = the S1 and S5 vistas, level = the S4 breather (a thin band of land under a huge sky).

**4.9 Diagonals.** "Oblique lines convey a sense of movement"; "almost diagonal lines produce tension"; horizontals
give "calm, tranquility, and space", verticals "height and grandeur" [S3]; in Block's terms a shot's lines run from
horizontal (affinity, low intensity) to diagonal (contrast, high intensity) [S17]. **Rule:** the full frame's diagonal
is 60.6 deg (a climb), the stage square's 40.4 deg; a diagonal shot uses 30-45 deg lines inside the stage, ONE
dominant diagonal rising toward the focal; cozy beats keep level and upright lines (affinity), the turn and the payoff
may bring the diagonal (contrast); no diagonal crosses the band.

**4.10 Triangles and the pyramid.** Poore calls the pyramid "the structure of physical stability": "In the landscape the
pyramid lies on its side, the apex receding", with lines drawing the eye "from the lower corners of the picture to an
apex" [S1]; "A triangular format creates a sense of stability and strength", and odd groups read more naturally than
even ones [S3]. **Rule:** base on the near ground (y 1350-1520, >= 50 % W wide), apex on the focal (inside the golden box
x 413-667, y 951-1187), sides 50-70 deg from level; three spots (the focal and two lesser) at unequal distances, the
focal the apex; a scalene triangle, never an equilateral one; the inverted triangle (the reel's V) for the unstable
beat, the "But" turn.

**4.11 S- and C-curves.** Curves "provide a greater dynamic influence" and read as "nature and softness": the simple C
and the sinuous S [S3]; Poore's line of beauty, and for circular schemes the subject "should lie either within the
circuit or be the most important item of the circle. It should never be outside the circle" [S1]. **Rule:** a 9:16
frame holds 2-3 bends: the S enters at the bottom edge (x 250-830), each bend 25-40 % W wide and about half the width
of the bend below it (perspective), and ends on or behind the focal; a C wraps the focal on three sides and opens
toward the sky (LAYOUT §3's BALCONY curve enters under the band at y 600-700); the subject inside or at the end of the
curve, never outside it; no curve through the band.

**4.12 Radial lines and the vanishing point.** In layout, an exposed ceiling gives "a strong set of radiating lines
towards the character", and stairs, floorboards and shelves "help to point to the character"; most production layouts
are one-point perspective [S16]. **Rule:** when the device is radial, the vanishing point sits on the subject or within
60 px of its box, so the lines deliver the eye to it; otherwise it is hidden behind the subject or a mass (LAYOUT §2's
street: one long sight line, ended by one object); never an empty vanishing point in open sky behind the focal (the
eye leaves through it [S1]).

**4.13 Figure-ground, notan and counterchange.** Figure-ground organisation separates a figure from its background by
assigning each edge to one side; when that assignment is ambiguous the picture flips (Rubin's vase) [S2]. Dow's notan
is "the massing of tones of different values", practised in two values, then three ("A tone of gray, midway ...
changes their relations"), then more, in flat tones because then "the value of a whole space can be judged better"
[S2]. **Rule:** at two values (cut at the frame's median L*) the subject is ONE closed shape a viewer can name at 0.25
scale, on a field of the other value; counterchange at the focal (light on dark or dark on light: R4's >= 65 L* at the
story light; CRAFT §f.3's median >= 15 L* along the silhouette); no shape at the focal that reads both ways.

**4.14 Value grouping.** R1, R2 and R10 hold it (three masses >= 85 %, <= 10 pieces, a real dark mass), from Dow's
massing and Payne's armatures (`organic/composition.md` §4, §8). Poore adds how the masses serve the one point: the
setting sun, "covering but a very limited measure of the picture is what we see and remember, the remaining space
serving this by subordination"; masters reach that point "either by banking up abruptly about it ... or by vast
gradations toward it"; and a principal object "made to occupy too much space is one of the commonest of faults" [S1].
**Rule:** the focal's light is small (the light lane's brightest 5 % below the sky, within 0.07-0.15 H of the subject:
`organic/light.md` §5.4), reached either by a bank of darker masses close round it (counterchange) or by one long
gradation of the story light toward it, never both at once and never a big bright area. In setup A (§3.3) the
natural notan is three stacked bands: the light sky (the words in it), the mid far belt, the dark near ground, with the
"you" a dark silhouette rising from the dark mass against the light at the line of heads (the beach couple's plan).
The shot's value plan is drawn at G3 (the board's grey tiers, `STORYBOARD_STYLE.md`), the film's in the value script
(§7).

**4.15 Pattern, repetition, rhythm.** Dow's principles are opposition, transition, subordination, repetition and
symmetry [S2]; in Block's terms rhythm runs from slow to fast [S17]. **Rule:** a repeated motif (a row of windows,
boats, umbrellas, bollards) is ONE texture inside one mass, its pieces within +-6 L* (R2, R6); the one break in the
pattern is the call (the lit window in a row of dark ones, the open door in a row of shut ones); a pattern never breaks
twice in one shot.

## 5. Staging and silhouette (animation's own composition)

Staging is "the presentation of any idea so that it is completely and unmistakably clear", whether action,
personality, expression or mood, by "the placement of a character in the frame, the use of light and shadow, or the
angle and position of the camera"; its essence is "keeping focus on what is relevant, and avoiding unnecessary detail"
[S5]. Its working rules: "lead the viewers eye to where the action will occur"; "only one idea at a time occur, or else
the viewers may be looking at the wrong thing"; "the main object should be contrasted in some way with the rest of the
scene". Early Disney drew all action in silhouette because a black arm vanished against a black body, and kept the
habit because "action was more clearly visible in silhouette": a character scratching its side reads, scratching its
stomach does not [S6]. Eye tracking shows staging steering many viewers at once: faces, hands and the sudden
appearance of things take the gaze, a gesture sends it along the sightline, a turned back frees it, and a long shot
holds attention "by minimising background distractions and staging the scene in a clear sequential manner" [S9]. In
production layout, a character's 3 s scene gives the background about a quarter second of looking [S16].

**Rules (ours; numbers marked est. are our estimates at phone size, 1 px of 1080 = ~0.7 arcmin on a 68 mm wide screen
at 30 cm):**
- **One idea per beat, in turns.** The beat's subject acts while everything else waits; when the beat passes to
  another subject, the first one settles before the second starts, as speakers take turns [S9]; supporting movers
  keep DIRECTION 3's budget (3-4 at most, taking turns) and never share the subject's channel (value, colour, motion)
  at the same moment.
- **The silhouette test.** Fill the subject and the "you" solid on their field and look at 0.25 scale (270 px wide):
  what the thing is and what it does must read. Act in profile or 3/4 back; the acting limb, tool or object stands
  OUTSIDE the body's silhouette by a gap of >= ~12 px (est.: ~8 arcmin); never an action in front of the body
  ("frontal action" [S6]); a figure turning shows it in the shoulders and head, since we draw no faces.
- **Contrast the subject in one channel more than anything else has:** value (R4), colour (R11), motion (>= 60 % of the
  motion: DIRECTION 2), size or isolation [S1]. A still subject among moving things also wins [S6] (the pivot of §8).
- **Overlap or air, never a kiss.** Two contours overlap by >= ~10 px or stay >= ~20 px apart (est.); an edge that just
  touches another fuses them into one shape and flattens the depth (CRAFT §f.3: "overlap, never a tangent").
- **The gaze cue.** The "you" looks at the subject: its head and shoulders turned so the sightline passes through the
  focal's box; it never looks out of the frame while the subject is in it.
- **The background budget.** In a 3.5 s shot the background gets about a quarter second [S16]: it says where we are
  (place, time of day, mood) in three masses; any detail that needs a longer look is either the subject or noise (R2,
  R6). Detail goes where the eye will be: "Only the visual information at the centre of attention can be perceived in
  detail" [S9].
- **The stage around the act:** the action happens inside the stage square's golden box, with a calm ring of one value
  30-60 px round the subject (LAYOUT §3; the board: 80 px clear).

## 6. Background layout in 2D studios, and our G3

**6.1 What a layout is.** "Layouts are the stage between storyboarding and animation ... the full planning stage that
translates the information from the storyboard panels into the full size art that both the animator and the
background artist will work from." A layout holds "not just the background drawing but also the posing of the
character within the scene, and the technical information needed for shooting the scene such as field size and any
camera moves"; the layout artist works from the location and prop designs for proportions and from the board for
placement, action and angle; a rough is approved before clean-up; "a tonal rendering may be done to give the
background artist a better sense of the lighting"; then layouts and poses are shot and timed into the story reel in
place of the board panels [S16]. Our map: W1's sets are the location designs, the G3 panel is the layout (its greys
are the tonal rendering), the G4 look clip is the background key, G5 paints to the layout.

**6.2 The layout artist's working rules** (one practitioner's teaching notes [S16]; methods only):
- "the whole purpose of your layout is to support the actions and placement of the characters within the scene";
- most production layouts are one-point perspective; the horizon is set at the character (one example: "The horizon
  line is at the character's chest level", which is §3.2's rule: a camera at chest height);
- pathways: "Spiral and radiating pathways are the most common types used in layout compositions", drawn in the
  thumbnail before the drawing (one example traces a spiral from a broken strut, along the path, round a bucket and up
  a pump to the doorway, the focal);
- clutter: "I don't like to clutter up the backgrounds with a lot of meaningless information unless it's actually
  going to help put across a specific message about the location ... Too much detail can distract from the characters";
- time: in a 3 s scene "You catch the background for about 1/4 of a second"; "Sort out what the priority of the scene
  is"; a lone object in the field draws the eye straight to it; a cheated perspective passes in a scene under ~4 s;
- continuity: every layout is drawn as if "there is a scene before and a scene after".

**6.3 The camera on the layout.** Field sizes run 6 field for close-ups to 12 field for long shots [S16]; a camera move
is drawn on the background as its frames; the multiplane shot moved layers at speeds set by their distance, and
moving the background and the foreground in opposite directions makes a rotation (an orbit) [S15]: our S5 pull-back's
foreground pot running the other way (-7) is that effect, and our parallax float is the multiplane at rest. Screen
direction carries between scenes: keep the camera on one side of the line between the "you" and the subject, and a
thing that leaves frame right enters the next shot frame left [S20] (LAYOUT §4's D carrier).

**6.4 Our G3 panel as a layout (proposal C10).** Each exterior panel declares, on top of the board's existing fields
(the subject box and planes, `STORYBOARD_STYLE.md` §3; G3's `planes`):
1. the shot size (§2) and the setup: camera height and horizon y (§3.3);
2. the vanishing point(s), the one device (§4) and its pathway, drawn as an arrow from the entry to the focal;
3. the focal box (default inside x 413-667, y 951-1187) and the counterweight (its side and size, §4.4);
4. the planes (4-6), each with its top's y and its float factor (LAYOUT §8.2's 1/z);
5. a 3-value notan thumbnail (R1) with the two quiet masses marked (R5);
6. the "you" (pose, facing, height in px, feet y from §3.2) and Pip's hiding spot (R12);
7. a camera move as its start, middle and end frames drawn as rectangles on the panel's world (§8);
8. the hook-up: where the thread object and the focal sit on the first and the last frame (LAYOUT §4).

## 7. Colour scripts (and the value script under them)

**What studios do.** "Color scripts map out the emotional beats of a story, helping all involved in the animation
process understand the vision as a whole"; the first at Pixar "planned out scenes on long stripes of black paper with
chalk pastel, [as] a kind of 'stream of consciousness' map of color, value, and visual drama"; that first one stays soft
(blues, pinks, warm yellows), "only turning bleak and muddy when something sinister occurs"; colour scripts were not
invented there, but that studio made one for every film [S18]. Block's frame for planning it: every visual component
(space, line, shape, tone, colour, movement, rhythm) runs between contrast and affinity; "Contrast increases visual
intensity, but affinity decreases visual intensity", so a film's visual intensity can be built to follow its story's
[S17]. Dow's subordination "governs the distribution of masses in Dark-and-Light composition, and of hues in Color
schemes" [S2]: one dominant per frame, and over the film one dominant key per scene.

**Ours (proposal C11).**
- **One strip per film, value first.** At W1 (it already writes "a colour-script line per beat": DIRECTION, the
  pipeline) and G3, a value script: one 9:16 thumbnail per beat (a 30-45 s film has ~8-14), 108 x 192 px (1/10
  scale), side by side in one strip; each in 3 values (R1), its focal marked, its key's side marked (one rig per set:
  DIRECTION 5). At G4 the same strip in the film's palette becomes the colour script: per beat the colour key (one
  strong family and one hot accent: playbook PROPER LIGHT), the story light, the sky's hue.
- **The intensity curve.** Affinity (one key, close values, level lines, slow rhythm) in the cozy beats; contrast in
  the first 3 s (DIRECTION 9), on the "But" turn and on the payoff. The payoff beat holds the film's hardest value step at
  its focal (R4's >= 65 L*) and its one hot accent; the scale reveal's in-shot script (a bright slot in a dark frame,
  the darkest moment, a burst of light before the landing, the settle: CINEMATIC_GUIDE S5) is the model inside a shot.
- **The key changes only on a story turn,** once or twice a film, as the first script's colour changes only for the
  sinister turn [S18]; the change is carried by the light changing in place (a lamp or a window switching on, a cloud
  crossing the sun; a source never moves: DIRECTION 5), never cut in, and an ordinary join keeps LAYOUT §4's colour
  shift <= 15.
- **Check the strip at its own size:** every thumbnail's focal found in under a second, no two neighbours with the
  same intensity when the story changes between them, one hot accent per thumbnail.

## 8. Moving frames: how a camera move changes a composition

A layout draws a move as its frames on the background [S16]; a multiplane move slides each layer at the speed its
distance sets [S15]; a zoom changes the headroom, so "the camera must simultaneously tilt up or down to keep the center
of interest approximately one-third of the way down from the top of the frame" [S14]; continuity of movement across
cuts is a craft of its own ("decide to avoid abrupt editing by mastering continuum of movement" [S17]). A moving shot
is a sequence of compositions, and every frame of it is seen.

**Principles (proposal C12).**
- **Three frames are designed:** the start and the end frame each pass §1-4 and R1-R7 as stills; the middle (p 0.5)
  passes the band and tangent checks. The move changes ONE thing (size, height, or what is revealed) on one ease
  (CINEMATIC_GUIDE rules 1 and 3; DIRECTION 8: no roll, no compound moves).
- **The pivot.** The subject holds its screen spot within +-40 px while the world moves past it (S5's figures at x 0.45
  W), or travels one smooth path between two points of the golden box; it never wanders. In a frame where everything
  moves the still thing is the call [S6]: the screen-locked subject wins the move.
- **Motion contrast.** During a move every plane moves, so the eye goes to whatever moves differently [S6, S9]; only
  the subject (or nothing) may move against the flow.
- **Lead room in the direction of travel:** a pan or truck leads its subject, the room in front growing, never
  shrinking (§4.7).
- **The band and the words are a fixed mat:** the band stays one flat field at every frame of a move (CINEMATIC_GUIDE
  rule 2), the focal never passes through it, and a plane edge that sweeps across it does so in the gutters only.
- **Tangents pass, never rest:** parallax re-draws every overlap; two edges may meet in passing but never sit on each
  other for more than ~0.1 s (est.), and never at the start or end frame.

**Each move, composed.**

| move | what it says | start frame | end frame | rule |
|---|---|---|---|---|
| push-in (A carrier, a story push) | attention, "this matters" | the subject in its place (WS or MS) | the subject owns the stage (CU) | scale about the target's own centre, so it stays put while the world spreads away from it; <= 2x per panel (LAYOUT §2); the target's top stays under the band; its centre ends in the golden box or on x 520-540 |
| pull-back reveal (S5) | isolation, then scale: "it is bigger than you thought" | enclosed: a slot or a frame within a frame, 3-5 % of the frame (CINEMATIC_GUIDE S5) | open: the world past every edge | the subject is the pivot, shrinking in place; the landmark lands in the last 20-30 % of the move, before the hold |
| rise-over, crane (S1) | arrival, "here it all is" | the near wall and the "you" fill the bottom 25 % | the city in the lower 60 % | the near mass leaves by the bottom edge; the horizon moves only 0.37 -> 0.40 H; layers drawn ~500 px taller (CINEMATIC_GUIDE S1) |
| tilt-up (K2) | height, "it keeps going" | horizon 0.40 H | horizon 0.70 H | verticals stay parallel (a shift, not a turn: §3.1); flat across the band (COZY_AND_SCALE K2) |
| pan or truck | follow, survey | the subject entering with lead room | the subject with lead room ahead | background length = the view plus the travel; planes by 1/z |
| the float (holds) | life in a still frame | home | home | planes by depth, back at rest by every join (DIRECTION 8) |
| dolly zoom | "disorientation and discomfort" [S20] | | | never (it is a compound move and a feeling we never want) |

## 9. The owner's reels in film terms, and the cheat sheet in 9:16

The five reels (`docs/look/refs_composition/`; their full catalogue is the sibling lane's `reels.md`) are photography
and drawing lessons in a vertical feed: landscape pictures letterboxed across a 9:16 phone screen, one device per
example, the device drawn as lines over the picture. Two things carry over directly. **One device per example** is the
right dose for a film frame (§4's intro). **The letterbox is our stage:** a 16:9 picture at full width is 1080 x 608,
a 3:2 one 1080 x 720, a 4:3 one 1080 x 810; laid under our band (from y 600) they cover y 600-1208, 600-1320 and
600-1410: the read zone and the stage square. A landscape lesson's composition maps onto our stage, with our sky and
words above it and the near band below.

| device (reel) | in film and animation practice | in our 9:16 frame | ours |
|---|---|---|---|
| frame within a frame (01, 02, 04) | doorways, windows, arches; the repoussoir; the start of a reveal (§4.6, §8) | one aperture of 15-30 % in the stage square, >= 10 L* off its rim | the lit door; a window; S5's slot |
| leading lines, vanishing point, one point (01, 02, 04) | radiating and spiral pathways; one-point layouts (§4.5, §4.12) | 2-3 legs of >= 150 px; the vanishing point on the subject or hidden by it | quay edges, a lane, the light column on the water |
| foreground (02, 05) | repoussoir and coulisse; depth layering (§4.6, §4.8) | one side only, <= 20 % W; the top lid and the near band | the playbook's "small, subtle hint at the edges" |
| rule of thirds, golden ratio (02, 03, 04, 05) | proportions and a nudge off the centre (§4.1-4.2) | horizon near y 640 or 1280; the focal in the stage's golden box | proportions, never hot spots |
| symmetry, balance (02, 03, 04) | formal balance; the steelyard (§4.3-4.4) | the axis x 520-540; a counterweight >= 300 px out | symmetry for a formal or final beat; the steelyard for the rest |
| parallel lines, patterns and repetition (01, 04) | rhythm; one texture with one break (§4.15) | a row within +-6 L*, one break at the focal | the far facade's windows, one lit |
| level change (01) | two stacked stages, a step in height | the 9:16 frame is two stacked squares (§1) | setup B: the "you" on the upper level, the world below |
| negative space (04) | the quiet masses; headroom (§4.7) | >= 65 % quiet in two masses (R5) | the sky and the near ground |
| scale (04) | a known-size figure beside a big world: "We feel the vastness of a scene by the presence of a lone figure" [S1] | the "you" 130-220 px, or 60-150 px in the K wides | DEPTH AND SCALE; the scale beat |
| juxtaposition (05) | contrast and affinity: two opposites side by side are intense [S17] | opposite values or colours meeting at the focal | counterchange at the lit door |
| spiral (05: a stair seen from above) | an overhead circular view | top-down is paper only (§3.1) | not for a film frame |
| pyramid; V-shape (03) | stability; the inverted one for instability (§4.10) | base y 1350-1520 >= 50 % W, apex in the golden box; the V a canyon (>= 2:1) | stable beats; the V for the turn |
| diagonal, double diagonal (03) | movement, tension, intensity (§4.9) | 30-45 deg inside the stage; an X crossing at (540, 960) only for a centred subject | one diagonal, for the turn or the payoff |
| S-curve, C-shape (03) | the line of beauty; the circuit (§4.11) | 2-3 bends entering at the bottom edge; the C open to the sky | a canal, a path, a quay |
| L-shape (03) | a side mass with a ground base framing an open field | a side mass x 0-200 (or 880-1080) and a ground band from y ~1250; the focal toward the L's inner corner | LAYOUT §2's cozy masses on 2-3 sides with one opening |
| unbalanced (03) | deliberate tension: one heavy side and nothing against it | the focal far off centre with no counterweight | the "But" turn only |
| radiating; circular (03) | rays and perspective lines to one point; the eye's circuit with the subject inside it, "never outside the circle" [S1] | the point within 60 px of the subject; the circuit inside the stage square | light rays at the story light; a round window |
| golden triangle (03) | Hambidge's diagonal and reciprocals (§4.2) | full frame: its eyes fall in the band and at y 1459 (unusable); the stage square's eyes (454, 987) and (626, 1133) | the stage version only |
| cross (03) | a strong vertical across a horizontal (a tree against the horizon) | the crossing at a golden point of the stage | a lone tree, a mast, a lamp post against the horizon |

## 10. The rules, distilled (each a proposal, with the doc it would go into)

| # | rule (numbers at 1080 x 1920) | why | target |
|---|---|---|---|
| C1 | **The focal's home:** the beat's focal centred in the stage square's golden box, x 413-667, y 951-1187 (its eyes x 454-626, y 987-1133 the heart); off it only for a declared reason (a left-third spiral, a scale shot, a chart) | the centre bias [S7, S10]; R7's drop; §1 | `LAYOUT.md` §1 (subject axis row), §3 |
| C2 | **The horizon:** near y 640-860 (setup B) or 1150-1300 (setup A); never y 900-1020; breathers and scale shots keep CINEMATIC_GUIDE's numbers | Smith's 2:1 and the half [S3]; §3 | `LAYOUT.md` §1 (sky and horizon), §2 |
| C3 | **The camera height, per set:** A (0.9-1.6 m, horizon 0.60-0.68 H) or B (3-7 m, horizon 0.36-0.45 H), declared in W1; every standing figure placed by the horizon-cut rule (feet y_h + P c / h, head y_h - P (h - c) / h); the scene-1 look test shows A beside v6's view | §3.2-3.3; the references; CRAFT §f.5 | W1; `LAYOUT.md` §2; `CRAFT.md` §f.5 |
| C4 | **The size ladder:** sizes step 2-3x; an F cut between two shots of one subject changes size by >= ~1.5-2x or angle by >= 30 deg, or keeps the exact frame | 6-12 field [S16]; 20 mm / 30 deg [S20] | `LAYOUT.md` §2 |
| C5 | **Angles:** eye level the default; a low angle only on the quantity; a high angle only on crowds, patterns and maps; overhead only as paper; never a Dutch tilt | [S12, S13]; DIRECTION 8 | `LAYOUT.md` §2 (angle row) |
| C6 | **One device per shot,** pointing at the focal (§4); a second only when it points at the same focal; the G3 panel names it | Smith, Dow, Poore, staging [S1-S3, S5, S6] | `LAYOUT.md` §3; `STORYBOARD_STYLE.md` §3 |
| C7 | **The eye's path:** entry from the near band or the words; 2-3 zigzag legs of >= 150 px; the last leg ends within 40 px of the focal's box; no line corner to corner, none through the band; no empty vanishing point behind the focal | Poore's entrance and exit [S1]; layout pathways [S16] | `LAYOUT.md` §3 (leading lines) |
| C8 | **The steelyard:** the focal <= 130 px off x 540; one counterweight >= 300 px out on the other side, bigger and softer, < 50 % of the focal's pull, never isolated and crisp; the words on top balanced by the near dark mass (R10) | Poore's balance [S1]; R8 | `LAYOUT.md` §3 |
| C9 | **Facing and lead room:** 1.5-2x more room in front of a facing or moving subject than behind (on the axis: facing right at x 380-430, facing left at 650-700); the "you" beside the subject stands outside the axis on the side it looks from (x 120-380 or 700-900), faces into the frame, its sightline through the focal's box | lead room [S14]; inward bias [S10]; gaze cues [S9] | `LAYOUT.md` §3 (people) |
| C10 | **The G3 panel is a layout:** the eight declarations of §6.4 (size and setup; vanishing point, device and path; focal box and counterweight; planes; a 3-value notan; the "you" and Pip; the move's three frames; the hook-up) | 2D layout practice [S16] | `STORYBOARD_STYLE.md` §3; `G3_ANIMATIC.md` |
| C11 | **The value script and the colour script:** one strip per film, one 108 x 192 thumbnail per beat, in values at W1/G3 and in colour at G4; affinity in the cozy beats, contrast at the hook, the turn and the payoff; the key changes only on a story turn, carried by light | colour scripts [S18]; contrast and affinity [S17] | `PIPELINE_V2.md` (W1, G3, G4); `PALETTE.md` |
| C12 | **Moves:** the start, middle and end frames designed; one variable per move; the subject the pivot (+-40 px) or one path between two golden points; a push scales about the target's centre; lead room grows with travel; the band a fixed mat; tangents pass in <= ~0.1 s | §8 [S6, S14-S17] | `CINEMATIC_GUIDE.md` rules |
| C13 | **Staging:** the silhouette test at 0.25 scale; action in profile or 3/4 back, the acting part >= ~12 px outside the body; contours overlap >= ~10 px or keep >= ~20 px apart; one actor at a time, in turns; the background read in a glance | staging [S5, S6]; eye tracking [S9]; layout [S16] | `LAYOUT.md` §3; `CRAFT.md` §b, §f.3 |
| C14 | **Rhythm and symmetry:** a repeated motif is one texture with one break, the break being the call; full symmetry in at most two shots a film, for formal beats; never two equal halves of anything (sky and ground, two masses, two lights) | Smith [S3]; Dow [S2]; Block [S17] | `LAYOUT.md` §3 |

Numbers marked ~ or est. are our estimates for phone size; the look test and the owner's eye at phone size decide.

## 11. Doc clashes found (flagged for the orchestrator; not edited here)

1. **The "you", the camera and the horizon.** DIRECTION 7 and the playbook's DEPTH AND SCALE FROM A HUMAN VIEWPOINT
   (the camera where a person would stand, the "you" near it at ~130-220 px), `LAYOUT.md` §2's angle row ("eye level
   by default, at or below the person's eye level"), `LAYOUT.md` §1's default horizon (y 768, 0.40 H) and R7 (nothing
   calls between the words and the focal) cannot all hold: at eye level a standing "you" has its head on the horizon,
   so at y 768 it stands at y ~757-937, between the words and the focal, and in v2's and v6's view (horizon ~995) it
   stands level with the focal. **Proposal:** C3: the camera height and the horizon declared per set (A for a
   human-scale view, horizon 0.60-0.68 H; B when the ground must spread, camera 3-7 m); `LAYOUT.md` §1's default
   horizon becomes a per-setup value.
2. **Two sizes of "you".** `LAYOUT.md` §1's "you" row (head 90-140 px, cut by the bottom edge, head top y <= ~1380:
   at 7-7.5 heads a figure of ~650-1050 px) predates the playbook's ~130-220 px whole figure (2026-10-29, owner).
   **Proposal:** name two cases: the human-scale "you" (130-220 px, standing on the ground, placed by C3) for
   exteriors, and the near "you" cut by the bottom (head <= 140 px) only for an interior or POV beat (v3's hands).
3. **R7's focal range in setup A.** R7 sets the focal's centre at y 860-1200; in setup A a subject on the horizon belt
   sits at y ~1100-1300. **Proposal:** in setup A the focal may reach y ~1300 (inside `LAYOUT.md` §1's key-read box, y
   <= 1480), or the subject rises above the horizon (a facade, a tower).
4. **v6's horizon at the half.** Not a doc clash but a gap between the docs and the picture: v6 measures 0.52 H, where
   Smith and the composition guides put no horizon [S3]; composition.md's T3 (+140 px, ~0.59 H) moves it off. The look
   test should show it.

## 12. Sources (methods only; no picture copied)

- **[S1]** H. R. Poore, *Pictorial Composition and the Critical Judgment of Pictures* (1903; 10th ed.), public domain:
  the steelyard, balance in depth, entrance and exit, principality, the pyramid, the circle, the figure in landscape,
  Claude's two schemes. [Project Gutenberg #26638](https://www.gutenberg.org/ebooks/26638).
- **[S2]** A. W. Dow, *Composition* (1899; 1913 ed.), public domain: notan, subordination, two and three values.
  [Project Gutenberg #45410](https://www.gutenberg.org/ebooks/45410); with Wikipedia,
  [Notan](https://en.wikipedia.org/wiki/Notan) and
  [Figure-ground (perception)](https://en.wikipedia.org/wiki/Figure%E2%80%93ground_(perception)).
- **[S3]** Wikipedia, [Rule of thirds](https://en.wikipedia.org/wiki/Rule_of_thirds) (J. T. Smith's 1797 text and
  Reynolds's 2:1, via Field 1845; Amirshahi et al. 2014's measurement),
  [Composition (visual arts)](https://en.wikipedia.org/wiki/Composition_(visual_arts)) (lines, curves, triangles, the
  rule of odds and of space, the horizon not at the half),
  [Rabatment of the rectangle](https://en.wikipedia.org/wiki/Rabatment_of_the_rectangle).
- **[S4]** Wikipedia, [Golden ratio](https://en.wikipedia.org/wiki/Golden_ratio) (the 565-painting study, Fechner's
  preference "at best, inconclusive"), [Golden spiral](https://en.wikipedia.org/wiki/Golden_spiral),
  [Dynamic rectangle](https://en.wikipedia.org/wiki/Root_rectangle) (Hambidge's diagonal and reciprocal).
- **[S5]** F. Thomas and O. Johnston, *The Illusion of Life* (1981): staging, as summarised in Wikipedia,
  [Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation).
- **[S6]** ACM SIGGRAPH Education, HyperGraph,
  [Principles of Animation: Staging](https://education.siggraph.org/static/HyperGraph/animation/character_animation/principles/staging.htm)
  (after Lasseter, "Principles of Traditional Animation Applied to 3D Computer Animation", SIGGRAPH 1987).
- **[S7]** B. W. Tatler, "The central fixation bias in scene viewing", *Journal of Vision* 7(14):4 (2007),
  [doi:10.1167/7.14.4](https://doi.org/10.1167/7.14.4).
- **[S8]** T. J. Smith and P. K. Mital, "Attentional synchrony and the influence of viewing task on gaze behavior in
  static and dynamic scenes", *Journal of Vision* 13(8):16 (2013), [doi:10.1167/13.8.16](https://doi.org/10.1167/13.8.16).
- **[S9]** T. J. Smith, "Watching you watch THERE WILL BE BLOOD" (2011), on D. Bordwell and K. Thompson's blog,
  [davidbordwell.net](https://www.davidbordwell.net/blog/2011/02/14/watching-you-watch-there-will-be-blood/).
- **[S10]** S. E. Palmer, J. S. Gardner and T. D. Wickens, "Aesthetic issues in spatial composition: effects of
  position and direction on framing single objects", *Spatial Vision* 21 (2008),
  [doi:10.1163/156856808784532662](https://doi.org/10.1163/156856808784532662); with M. Bertamini et al., "The anterior
  bias in visual art", *Laterality* 16 (2011), [doi:10.1080/1357650X.2010.508219](https://doi.org/10.1080/1357650X.2010.508219).
- **[S11]** J. Sammartino and S. E. Palmer, "Aesthetic issues in spatial composition: effects of vertical position and
  perspective on framing single objects", *J. Exp. Psychol.: Human Perception and Performance* 38 (2012),
  [doi:10.1037/a0027736](https://doi.org/10.1037/a0027736).
- **[S12]** Wikipedia, [Shot (filmmaking)](https://en.wikipedia.org/wiki/Shot_(filmmaking)),
  [Camera angle](https://en.wikipedia.org/wiki/Camera_angle), [Medium shot](https://en.wikipedia.org/wiki/Medium_shot),
  [Close-up](https://en.wikipedia.org/wiki/Close-up).
- **[S13]** StudioBinder, [Types of camera shots](https://www.studiobinder.com/blog/types-of-camera-shots-sizes-in-film/),
  [Types of camera angles](https://www.studiobinder.com/blog/types-of-camera-shot-angles-in-film/),
  [Rules of shot composition](https://www.studiobinder.com/blog/rules-of-shot-composition-in-film/).
- **[S14]** Wikipedia, [Lead room](https://en.wikipedia.org/wiki/Lead_room),
  [Headroom (photographic framing)](https://en.wikipedia.org/wiki/Headroom_(photographic_framing)),
  [Repoussoir](https://en.wikipedia.org/wiki/Repoussoir),
  [Framing (visual arts)](https://en.wikipedia.org/wiki/Framing_(visual_arts)).
- **[S15]** Wikipedia, [Multiplane camera](https://en.wikipedia.org/wiki/Multiplane_camera).
- **[S16]** B. Lemay, Animation School, [Layouts](https://brianlemay.com/Pages/animationschool/layout/layoutexamples.html)
  and the notes on each layout (e.g. [the pump and the shack](https://brianlemay.com/Pages/Portfolio/layout/layout15a.html),
  [the stairs to a doorway](https://brianlemay.com/Pages/Portfolio/layout/layout28a.html),
  [the alley](https://brianlemay.com/Pages/Portfolio/layout/layout32.html),
  [the stairs from the deck](https://brianlemay.com/Pages/Portfolio/layout/layout280.html)): a layout practitioner's
  teaching, read for method.
- **[S17]** B. Block, *The Visual Story* (2001; 3rd ed. 2020): the publisher's
  [description](https://shop.elsevier.com/books/the-visual-story/block/978-0-08-052073-5) and a
  [review summarising contrast and affinity](https://betterposters.blogspot.com/2022/07/review-visual-story.html).
- **[S18]** Hyperallergic, "25 Years of Pixar's Vibrant, Emotional Color Palettes" (2020), on *The Art of Pixar: The
  Complete Colorscripts*, [hyperallergic.com](https://hyperallergic.com/610771/the-art-of-pixar-chronicle-books/).
- **[S19]** JAANUS, [san-en](https://www.aisf.or.jp/~jaanus/deta/s/sanen.htm) (Guo Xi's three distances, from *The
  Lofty Message of Forests and Streams*); Wikipedia, [Guo Xi](https://en.wikipedia.org/wiki/Guo_Xi) (*Early Spring*,
  1072, a hanging scroll) and
  [One Hundred Famous Views of Edo](https://en.wikipedia.org/wiki/One_Hundred_Famous_Views_of_Edo) (the vertical
  format).
- **[S20]** Wikipedia, [180-degree rule](https://en.wikipedia.org/wiki/180-degree_rule),
  [30-degree rule](https://en.wikipedia.org/wiki/30-degree_rule), [Dolly zoom](https://en.wikipedia.org/wiki/Dolly_zoom).

**Our own measurements** (scratch, `/tmp/comp/cinema/`): the grids of §1 and the horizon-cut table of §3.2 are
arithmetic from the formulas given; v6's vanishing point is OpenCV's probabilistic Hough transform on our quay
(x 0-1080, y 1150-1500; Canny 20/60; segments >= 180 px with slopes 0.03-0.6), the median of 131 pairwise
intersections; the references' horizons are by eye (+-0.03 H).
