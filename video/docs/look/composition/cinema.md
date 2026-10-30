# CINEMA: composition as film and animation use it (research, 2026-10-30)

The owner (2026-10-30): "After we are done with this I want you to do another research and distill of the composition
shots to use / Take a look at this folder I collected some initial references but do the deeper research"
(`docs/look/refs_composition/`). Earlier the same day, on our list of differences from the references: "8 agreed this is
an important point about scene composition"; on still v6: "our scene is very busy".

**What this is.** The cinematography and animation-layout lane of that research: shot sizes and angles and what each
says (§2-3), the classic devices (§4), staging and silhouette (§5), background layout in 2D studios (§6), colour
scripts (§7) and how a camera move changes a composition over a shot (§8), each turned into placement rules in pixels
for our frame; the owner's reels and their cheat sheet read in 9:16 (§9); the rules distilled (§10); doc clashes (§11);
20 sources (§12, cited [S1]-[S20]). Its sibling, the measured notan study of scene 1 with rules R1-R12, is
`docs/look/organic/composition.md`; this page cites those rules as R1-R12 and does not repeat them.
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
   frame [S10]. So: the focal near the centre (x 413-667, y 950-1190), one mover at a time, the "you" facing into the
   frame and toward the subject.
3. **In 9:16 the full frame's classic points mostly land where we cannot use them** (§1): the dynamic-symmetry eyes and
   the golden-spiral poles fall in the caption band or under the read zone, the thirds' verticals just outside the
   subject axis. The usable picture is the **stage square** under the band (y 600-1520, 1080 x 920): its thirds, golden
   lines and diagonal "eyes" all fall on the subject axis, its four eyes make the box x 454-626, y 987-1133, inside
   R7's focal range.
4. **The horizon's height is the master decision of a 9:16 exterior** (§3). With a level camera the horizon cuts every
   standing figure on the camera's ground at (camera height / figure height) of its height, near or far; at eye level
   (1.6 m) every standing head sits on the horizon. The owner's human-scale references all use a LOW eye: horizon
   0.57-0.85 H, the camera at or below the people's eyes, their heads at or above the horizon against the far world,
   the sky the big quiet mass. Our default horizon (0.40 H, y 768) with an eye-level camera stands the "you" at y
   757-937, right under the captions and between the words and the focal (which R7 forbids); a "you" low in the frame
   under a 0.40 H horizon means a camera 4-7 m up, v6's raised view. Two setups follow, each with its figure
   placement in pixels: **A, the low eye** (horizon 0.60-0.70 H, the references) and **B, the raised eye** (horizon
   0.36-0.47 H, v2 and v6). W1 declares one per set.
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
9. **Distilled rules C1-C14 with their target docs: §10. Clashes: §11** (the main one: "eye level by default" and a
   0.40 H horizon cannot both hold for a standing "you" low in the frame).

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
| **stage square** (y 600-1520, full width, 1080 x 920) | thirds y 907, 1213 (x 360, 720); golden y 951, 1169 (x 413, 667); diagonal 40.4 deg; eyes (454, 987), (626, 1133), (454, 1133), (626, 987) | the picture under the words: its eyes make the box x 454-626, y 987-1133, inside R7's focal range and the subject axis; its 40 deg diagonals are the comfortable "dynamic" ones |

**What it means.**
- The 9:16 frame is three stacked pictures: the words (the band, in the top square's sky), the stage square (where the
  story happens) and the near band (y 1250-1920, half of it under the platform UI). Compose the story inside the
  stage square; the top of the frame is the sky that holds the captions; the full-frame armatures are for the
  big masses only (the sky against the ground, a tower against the sky).
- **The focal's home** is the stage square's golden box: x 413-667, y 951-1187 (its eyes x 454-626, y 987-1133 at its
  heart). It agrees with three independent things: the centre bias of the eye [S7, S10], R7's drop from the words (y
  860-1200), and LAYOUT's subject axis.
- **The horizon goes on a third or a golden line of the full frame, never near the half:** y 640-768 (sky a third:
  ground-led, setup B) or y 1187-1280 (sky two thirds: sky-led, setup A); never y 900-1020 (0.47-0.53 H), Smith's
  "precise formal half" [S3] and the composition guides' "The horizon line should not divide the art work in two
  equal parts" [S3]. v6's horizon sits at ~0.47 H (y ~900, by eye), at the half's edge.
- **A spiral or a golden triangle needs the stage square, or the left-third hero spot** (x ~200-450, LAYOUT §8.2's
  open question): in the full frame their eyes fall in the band or the UI.

**Where the eye goes (the evidence behind the numbers).**
- **The centre first.** "When the scene appeared, the initial response was to orient to the center of the screen", and
  the bias held whatever the picture's features or the viewer's task [S7]. Every cut restarts at (540, 960): a focal
  at the centre costs no search; one 300 px off costs a saccade and a moment.
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
within +-15 %", in numbers. For a 1.7 m "you" drawn 180 px tall (P scales the offsets linearly; 145 px and 220 px in
`/tmp/comp/cinema/horizon_cut.txt`):

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
ground at ~0.85 H, the camera about a seated man's height. Still v6 (and v2's view, which the owner liked: "our initial
angle snd the view frankly wasn’t bad") looks down from a raised camera: horizon ~0.47 H, her head in the door below it,
our paving receding.

| | **A, the low eye** (the references) | **B, the raised eye** (v2, v6) |
|---|---|---|
| camera | 0.9-1.6 m on the "you"'s ground (standing or a little lower) | 3-7 m (a raised quay, a bridge, steps, a first floor) |
| horizon | y 1150-1300 (0.60-0.68 H): sky two thirds | y 690-900 (0.36-0.47 H): sky a third or so |
| the "you" (180 px) | head at or just above the horizon, against the far belt or the sky; feet y 1356-1449 (camera 1.6 m) or 1282-1375 (0.9 m) | below the horizon, seen from behind and a little above: e.g. head 1117, feet 1297 (horizon 768, camera 5 m) |
| the sky | 60-68 % of the frame, the caption band high in it: R5's quiet sky is automatic | 36-47 %, the band inside it; the ground and water take 53-64 % and need R5's quiet near mass |
| the far world | one dense belt on the horizon, rising into the sky where it is tall: detail inside one band (R2, R6) | a deep receding field: more room for the far side's density, more pieces to keep quiet |
| the subject | on the horizon belt or rising above it (a lit facade, a tower): y ~900-1300 | in the middle distance at y ~850-1150, below the line of heads |
| scale | a near human figure against a far, big world: the playbook's DEPTH AND SCALE | the world spread out below: a map-like note; the person small |
| risk | the "you" and the subject share the line of heads: two calls; keep the "you" soft (tier B), from behind, at one side (x 120-380 facing right, or x 700-900 facing left), its gaze on the subject | busier (more ground, more things); the horizon drifts toward the half (v6 ~0.47 H) |

**Proposal (C3):** W1 declares A or B per set, with its camera height and horizon; every figure is placed by the
horizon-cut rule. The scene-1 look test shows A beside B (composition.md's T3, "the camera tilted up 140 px" for a
bigger sky, is a step from B toward A); the owner picks.

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
the left-third hero spot (LAYOUT §8.2's open question 2) and is a deliberate variant, never the default; the full
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
balance runs in depth too: a foreground is "aggressive" when the back planes lack balancing weight [S1]. **Rule:**
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
to corner" must be interrupted [S1]. In 2D layout "Spiral and radiating pathways are the most common types" [S16];
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
is the most attractive, to gain by the sacrifice of the foreground mass"; and sky seen through a dark mass is an "air
hole" [S1]. **Rule:** one inner frame (a door, a window, an arch, the gap between two masses) of 15-30 % of the frame
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
moving subject gets 1.5-2x more room in front than behind: facing right at x 380-450 (630-700 px ahead, 1.4-1.8x),
facing left at x 630-700; a figure looking up has the thing it looks at above it on its sightline, clear of the band;
a moving thing keeps or grows its lead room through a move (the camera leads). Our negative space is R5's quiet masses
(>= 65 % quiet in two connected masses), and the space between the words and the focal is the focal's headroom: quiet
(R7).

**4.8 Depth layering and foreground framing.** The multiplane camera moved layers "at various distances" and speeds,
"the further away from the camera, the slower" [S15]. Guo Xi named three distances for a landscape: high (looking up
at a mountain from below), deep (from the front of a mountain to the ranges behind it), level (out over low hills)
[S19]; the vertical scroll and the vertical print [S19] are the old 9:16. Poore: "We feel the vastness of a scene by the
presence of a lone figure" [S1]. **Rule:** at least three readable zones (near frame, the subject's plane, the far and
the sky) and 4-6 planes (CRAFT §f.1); in 9:16 the planes STACK UP the frame (the near at the bottom, each farther one
higher), overlapping, never touching tangent, no two plane tops within 40 px of each other; the near frame a quiet
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
massing and Payne's armatures (`organic/composition.md` §4, §8). The cinema addition: the shot's value plan is drawn at
G3 (the board's grey tiers, `STORYBOARD_STYLE.md`) and the film's in the value script (§7).

**4.15 Pattern, repetition, rhythm.** Dow's principles are opposition, transition, subordination, repetition and
symmetry [S2]; in Block's terms rhythm runs from slow to fast [S17]. **Rule:** a repeated motif (a row of windows,
boats, umbrellas, bollards) is ONE texture inside one mass, its pieces within +-6 L* (R2, R6); the one break in the
pattern is the call (the lit window in a row of dark ones, the open door in a row of shut ones); a pattern never breaks
twice in one shot.
