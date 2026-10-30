# COMPOSITION_SHOTS: the shot library (composition recipes for our 9:16 films)

The owner (2026-10-30): "After we are done with this I want you to do another research and distill of the composition
shots to use / Take a look at this folder I collected some initial references but do the deeper research"
(`refs_composition/`). Earlier the same day: "8 agreed this is an important point about scene composition"; on still v6:
"our scene is very busy". Then (~14:10 UTC): "When we settle on the composition library recipes and overall approach we
need to evaluate our visual script for Helsinki story to figure out how to compose each scene and how we animate and
move within a scene and from scene to scene".

**What this is.** The distill: the 13 composition rules that matter most in our frame (§1), a table of the 24 shot
recipes (§2), the recipes themselves, each by story beat, with its layout in numbers, its device, its camera move and
joins, what it must never do and how it looks in our two test places (§3), how to pick shots for a film (§4) and the
clashes with the docs in force (§5). It sums up four research notes, which keep the evidence and the sources:
- `composition/reels.md`: the owner's five reels, every idea they show (A1-E11) judged for 9:16;
- `composition/cinema.md`: film and animation practice (rules C1-C14, sources S1-S20);
- `composition/vertical.md`: the phone feed, measured on the owner's own screen recordings (rules V1-V14, sources
  V1-V15);
- `organic/composition.md`: our notan study of scene 1 (rules R1-R12, the value thumbnails T1-T3).

**Rank and status.** A look doc on DIRECTION's ladder; its topic is which composition a shot uses and that composition's
layout in numbers: the library the playbook names ("Every film's visual script gets a composition-and-motion pass from
the shot library"). `LAYOUT.md` still wins on the screen zones and each shot type's framing, `CINEMATIC_GUIDE.md` on
S1-S5 and the camera moves, `COZY_AND_SCALE.md` on the cozy and scale doses, `CRAFT.md` on numbers and checks; a number
quoted here from them must match them. **Everything here that is not already in one of those docs is a proposal** until
the owner approves the library (the playbook: "once the library and the approach are settled"); its first use is video
4's composition-and-motion pass, judged at phone size. The clashes are flagged in §5, never edited into the other docs
from here. We learn principles from the references and sources: no frame traced, copied or used as an input, no creator
named, no living artist as a style target.

**Conventions.** Px at 1080 x 1920, y down; W = 1080, H = 1920. "The feed" = the owner's Instagram Reels tab on his
phone (it shows x 98-982 of our frame, 1.22x larger than a review MP4 played fit to the screen). "The 'you'" = the
film's one stand-in for the viewer. **Scene 1** = v2's opening at the King's Cross canal on an October dusk ("She quit
Google."; still v6; the lit doorway with her silhouette in it; the value thumbnails T1-T3). **Video 4** = Helsinki's
AI-heated homes on a snowy winter night (its G2.5 visual script: 12 shots S1-S12 on one continuous camera, 42.24 s; the
warm water the thread, the one window its home spot, the giant computer by the harbour). Carriers A-F are `CRAFT.md`
§a's (A push-through, B thread match, C continuous camera, D object carry or wipe, E card flip, F plain cut). Paths are
from `video/docs/look/` unless they start with `video/`. **Words:** the notan = the picture as 2-3 flat values seen at a
squint; counterchange = dark against light at the one spot; the steelyard = a big soft mass balancing a small strong one
farther out; a repoussoir = a framing mass at one side edge; affinity and contrast = calm (level lines, close values,
slow) against intense (diagonals, hard steps, jumps in size); the drop = the eye's way down from the captions to the
focal; the pivot = the subject held still while the world moves past it.

## 0. The frame in numbers

**The zones that composition works with** (`LAYOUT.md` §1 is the one definition; the measured feed numbers are
`composition/vertical.md` §1, proposals V1-V5 until approved):

| zone | numbers (px) | what goes there |
|---|---|---|
| visible on the feed | x 98-982 on the owner's Reels tab (98 px cut per side; 108 on most Androids, 129 on 21:9 phones); x 52-1028 on a profile; TikTok shows all 1080 | key reads inside x 130-945; only masses run into the cut strips |
| header | y 0-218 (Reels tab) or 0-235 (profile), a 10 % darker scrim to y ~240 | framing only: the sky's top, the hero cloud, a lid |
| caption band | y 290-600, one calm flat field (dL* <= 1.5 behind the block, ink >= 7:1); the block y 317-556, centred on x 520, <= 2 lines (lines <= 780 px: V5) | the words; outdoors the one sky, indoors a flat light wall (L* >= 70) |
| stage square | y 600-1520, full width; under the words the feed shows x 98-982 by y 600-1519, a near square (884 x 919) | the story: the subject, its device, the "you" |
| focal home | the focal's centre on the subject axis x 380-700, y 860-1200 (R7); its heart the golden box x 413-667, y 951-1187, whose middle the stage square's diagonal "eyes" mark (x 454-626, y 987-1133) | the beat's one focal (rule 3) |
| right rails | TikTok x 948-1059 from y 797; Instagram's Reels tab x 877-954, y 1032-1660 (from ~860 when a repost button shows) | nothing to read at x > 945 below y 790, or at x > 870 below y 860 |
| bottom UI | the app's text from y 1519 (Instagram), 1738 (TikTok); a 10-20 % darker scrim from y ~1680 | the near ground as one quiet mass; the "you"'s body may run under it, never its head |
| ad cut | key reads above y 1250, and left of x 780 below y 840 | a cut made for a boosted post |

**The grid lines, and where they land** (`composition/cinema.md` §1, `composition/vertical.md` §2):
- **Centre** (540, 960): the first look of every new shot goes here [cinema S7]; 20 px right of the captions' centre
  line.
- **Thirds** x 360 / 720 (20 px outside the subject axis), y 640 (40 px under the band) / 1280 (30 px under the read
  zone). The feed's own visible thirds fall at x 393 / 687, inside the axis: on the phone "on a third" and "on the axis"
  are the same place. Use thirds as proportions (2:1), never as hot spots.
- **Golden section** x 413 / 667 (the axis), y 733 / 1187; the stage square's y 951 / 1169. Our layout already sits on
  this grid (`composition/reels.md` §0).
- **Diagonals:** the full frame's is 60.6 degrees from level (it reads as a climb), the stage square's 40.4 degrees (the
  comfortable "dynamic" one). The golden spiral's pole and the dynamic-symmetry eyes of the full frame land in or just
  under the band (y ~461-656) or near the bottom UI (y ~1265-1459): never a placement grid for us.
- **Angles on the feed** (32 cm from the eye): 74 px = 1 degree; the eye's sharp centre covers ~150 px; while it rests
  on one spot it previews ~370 px around it (5 degrees); the "you" at 130-220 px is 1.75-2.97 degrees.

**Two camera setups for an exterior** (`composition/cinema.md` §3; proposal C2-C3). With a level camera at height c,
every standing figure of height h drawn P px tall on the camera's ground has **feet at y_h + P·c/h and its head top at
y_h - P·(h - c)/h** (y_h the horizon): at eye level every standing head sits on the horizon, near or far. So the horizon
and the "you" fix each other:

| | **A, the low eye** (the owner's human-scale references) | **B, the raised eye** | never |
|---|---|---|---|
| camera | 0.9-1.6 m on the "you"'s ground | 3-7 m: a raised quay, a bridge, steps, a first floor | |
| horizon | y 1150-1300 (0.60-0.68 H) | y 690-860 (0.36-0.45 H) | y 900-1020 (0.47-0.53 H): the half; still v6 sits at y ~995 |
| sky | up to 60-68 % of the frame, the band high in it, less what rises into it | 36-45 %, the band inside it | |
| a 180 px "you" (1.7 m) | camera 1.6 m: head y_h - 11, feet y_h + 169 (horizon 1187: 1176-1356); camera 0.9 m: head y_h - 85, feet y_h + 95 | below the horizon, seen from a little above: camera 5 m, horizon 768: head 1117, feet 1297; or no "you" in frame (POV) | |
| the focal | on the horizon belt or rising above it (a lit window, a doorway, a tower): centre y 950-1200 | in the middle distance below the horizon: y 860-1150 | |
| the far world | one dense belt on the horizon, rising into the sky where it is tall | spread below the horizon: more ground, more pieces to keep quiet | |
| use | the human view, the home view, the payoff | when the ground must spread (a square, two levels, a street from steps) | |

## 1. The rules that matter most (13)

Each rule is numbers for our frame, then where it comes from. "Proposal" marks what is not yet in a doc in force.

1. **Design for the window the phone shows.** Key reads (the subject's action, a figure, a label, a number, a contact
   point) sit inside x 130-945 from y 600 to 860 and inside x 130-870 from y 860 to 1519; nothing to read above y 240 or
   at y >= 1519. Only masses run into x < 98 or x > 982 (never on the owner's feed), under the rails and under the
   bottom UI; a thing cut by a side edge must still read with its outer 98 px gone. On the phone, words in the world
   are >= 56 px (the floor of fluent reading is a 17 px x-height), lines >= 2 px, a figure "doing what" >= 40 px and
   reliably 60-80 px. *Measured on the owner's recordings: `composition/vertical.md` §1, §3.4 (V1-V4, V7); proposal
   where it differs from `LAYOUT.md` §1 (§5 row 1).*
2. **Three stacked pictures.** The words' sky (y 0-600: the band one flat field, no tops, lines, heads, props or shadow
   edges across it), the stage (y 600-1520: the story) and the near band (y 1250-1920: one quiet mass under the app's
   text, where light detail loses 10-20 % to the scrim). Depth stacks UP the frame: the near at the bottom, each farther
   plane higher, overlapping by >= ~10 px, no two plane tops within ~40 px of each other. Width is scarce (884 visible
   px), height is not. One stage, never a split screen: a comparison is a sequence or one frame with a seam (SR20). *A
   landscape picture at full width (1080 x 610-812) maps onto our stage: 16 of the 21 reel focal points land in or
   within 40 px of R7's box (`composition/reels.md` §4); cinema §1, §4.8; vertical §2.*
3. **One focal, in its home.** The focal's centre on the subject axis x 380-700, by default within 130 px of x 540 (x
   410-670) and at y 860-1200; its default spot y 950-1050, where the frame's centre (y 960), the stage's upper golden
   line (y 951) and still v6's door (y 965) meet, 400-500 px under the caption block. The drop from the block's foot
   (y 556) is 300-650 px (4-8.7 degrees); the short end (300-450 px, y 856-1006) whenever the shot allows, since every
   caption page (one every ~1.1-1.5 s) sends the eye up and down the drop. Nothing calls in the drop. Off the home only
   for a declared reason: a scale shot's landmark on a third (S3, S5), the left-third hero spot (x 200-450, open in
   `LAYOUT.md` §8.2), the turn's off-balance (SR18), a setup-A focal on the horizon belt down to y ~1250 (§5 row 13).
   *R7; C1; V8. The eye starts at the screen's centre whatever the picture holds [cinema S7]; a centred subject in
   vertical video gave longer fixations and fewer saccades than a moving one [vertical V5].*
4. **The focal is one place: the subject, the story light and the hardest value step.** A step of >= 65 L* at the focal
   (e.g., a lit doorway at L* >= 95 with her silhouette at <= 28); below the band no other step over ~40 L* and no light
   within 10 L* of the focal's; the brightest 5 % below the sky within 134-288 px (0.07-0.15 H) of the subject; the one
   hot accent of the scene's colour key only at the focal, everything else tone-on-tone in its mass (dE <= 6-8). At most
   3 regions pull at >= 50 % of the strongest and only one at >= 70 %, in value AND in colour, the strongest on the
   subject. **The lines lead, the light decides:** in 12 of the 20 one-subject reel examples a brighter patch elsewhere
   (a sunlit path, a white car, a corner of sky) beat the subject the lines pointed at; end every line at the light.
   *R3, R4, R11; `composition/reels.md` §0, §6; in force as DIRECTION rules 2 and 5 and playbook PROPER LIGHT (the
   numbers WARN: `CRAFT.md` §b).*
5. **Notan first (the picture as 3 flat values): three masses, two quiet fields.** At a 1 % squint in 3 values the three
   largest masses hold >= 85 % of the frame (<= 8 masses >= 1 %), one value group holds 40-55 %, the groups' means
   sit >= 13 L* apart; <= 10 value pieces; <= 6 named objects at phone size (the subject, one big soft secondary mass,
   1-3 supporting things). >= 65 % of the frame is quiet at a squint, in two connected fields: the sky with the band at
   the top (>= 30 %) and the near ground at the bottom (>= 15 %), each patterned within +-4-6 L*, so never a hole; the
   things live in the belt between, the far side's density as texture inside its band. Pip >= 250 px from the focal,
   tone-on-tone inside a mass, never in the drop or on a line into the focal. The dark key (one gentle dark mass, T1, or
   the references' low key, T3) is the owner's pick (`ORGANIC.md` §8 D3). Draw the 3-value notan thumbnail of every shot
   before anything else. *R1, R2, R5, R6, R10, R12; in force as DIRECTION rules 2-3 and `LAYOUT.md` §1's quiet fields.*
6. **The horizon off the half, declared per set.** Setup A y 1150-1300 or setup B y 690-860 (§0); never y 900-1020
   (0.47-0.53 H). The scale and breather shots keep `CINEMATIC_GUIDE.md`'s horizons (S1 lands at y 768, S5 at 883, S3 at
   ~1402, S4 at ~1574; K7 y 1114-1229). W1 names A or B per set with its camera height, and every shot of the set keeps
   it. Thirds as proportions: one quiet mass about twice the other, never two equal halves of anything (sky and ground,
   two masses, two lights). *C2, C3, C14; "a much better ... proportion than the precise formal half" (J. T. Smith,
   1797, via cinema S3); the owner's references put the horizon at 0.57-0.85 H; proposal (§5 rows 3 and 5).*
7. **People stand by the horizon-cut rule; the "you" is soft, at one side, looking in.** Place every standing figure
   with the formula in §0. The "you": one figure, 130-220 px tall (DIRECTION rule 7), from behind or in silhouette,
   softer than the subject (tier B, its pull < 50 % of the focal's), outside the axis on the side it looks from: x
   130-380 facing right (the default: the rails are on the right) or x 700-830 facing left; its head and shoulders
   turned so its sightline crosses the focal's box; its head top above y ~1380, its body may run under the bottom UI.
   Lead room: 1.5-2x more room in front than behind (a right-facing figure at x <= 410 below y 860, where the rail makes
   x 870 the edge; a left-facing one at x >= 560); a mover's lead room grows through a move. Strangers small (mid
   walkers 110-260 px, far 15-60 px), in twos and threes, as texture in their band; never a stranger's back in the
   foreground. *Cinema §3.2, C9; vertical §7.1; `LAYOUT.md` §3 people; the reels put one small figure where the lines
   meet in 11 of 24 examples, 8 of 12 measured at 150-226 px at full width (`composition/reels.md` E1).*
8. **One device per shot, and it delivers the eye to the focal.** Name one device (an opening, leading lines, one point,
   an S or C curve, a pattern with one break, the cross, scale, symmetry, the pyramid, one diagonal); a second only when
   it points at the same focal (a doorway whose sill is the leading line). Lines rise from the near band (or drop from
   the words) in 2-3 legs of >= 150 px that alternate sides, at ~40-60 degrees on the ground, and the last leg ends
   within 40 px of the focal's box; no line runs corner to corner unbroken, crosses the band or runs past the focal into
   an empty vanishing point; the vanishing point sits on the subject (within 60 px) or hides behind it or a mass. An
   inner frame is one opening of 15-30 % of the frame, its aperture >= 10 L* off its rim. A pattern is one texture
   inside one mass (its pieces within +-6 L*) with one break, the call; never two. *C6, C7, C14; cinema §4; the reels
   teach one device per example (`composition/reels.md` §0).*
9. **One soft counterweight, high or on the far side.** The focal 0-130 px off x 540 is balanced by one counterweight >=
   300 px out on the other side (x < 240 or > 840), bigger and softer, its pull < 50 % of the focal's, never isolated
   and crisp: by default the hero cloud in the top gutter (y 0-290, cut by a side edge). Never a counterweight in the
   lower right (x > 830 below y 790): the app's rail and name block already weigh there. The words are a heavy top; the
   near dark mass balances them low. *C8, R8, V11 (the steelyard: Poore 1903, Payne 1941, via cinema S1 and
   `organic/composition.md` §8).*
10. **The near frame is a hint at the edges.** >= 2 things cut by the frame edges in every shot; the near frame holds <=
    2 props, cut by an edge, inside the near ground's shade mass (within 8 L* of it); a framing mass (a repoussoir) on
    one side only, cut by that edge, <= 216 px (20 % W) wide; never half the frame, never a blur. Found edges (crisp,
    the hardest step) only at the focal; lost where two masses sit within ~10 L*. Contours overlap by >= ~10 px or
    keep >= ~20 px apart, never a tangent on a start or end frame. *R6, R9, C13; playbook DEPTH AND SCALE ("a small,
    subtle hint at the edges"); `composition/reels.md` C2, E5 (the reels' big blurred near layers are what we don't
    take).*
11. **Sizes step 2-3x; an angle means something.** Sizes are set on the beat's subject (we draw no faces): extreme wide
    (the place; the "you" 60-150 px in a K wide), wide (the subject 15-35 % of the frame's height in its place), medium
    (the subject box 270-460 px wide), close (one object >= 60 % W, >= 650 px), insert (one detail filling the stage). A
    push is <= 2x per panel (beyond, a push-through A); a plain cut F changes size by >= 20 % or angle by >= 30 degrees
    (`video/docs/G3_ANIMATIC.md` §4, in force; this library asks >= 1.5-2x in size: §5 row 14), or keeps the exact frame
    (a deliberate match). Eye level by default; a low angle only on the quantity, never on the thing under critique; a
    high angle only on crowds, patterns and maps, once a film; overhead only as paper; never a tilted horizon (no roll).
    *C4, C5; `LAYOUT.md` §2; `STORYBOARD_STYLE.md` §4, §7.*
12. **A move is three designed frames, and the subject is its pivot.** The start, middle (p 0.5) and end frames each
    pass rules 1-11 as stills (the middle at least the band and tangent checks); one variable per move (size, height or
    what is revealed), on one ease; no roll, no compound move. The subject holds its screen spot within +-40 px while
    the world moves (a push scales about the target's own centre), or travels one path between two points of the golden
    box; the still thing among moving planes wins the eye [cinema S6]. Often the camera holds and the subject travels
    the device's line: 17 of the 23 reel shots are locked or nearly while a figure runs down the pier, walks into the
    spiral's eye or crosses the gate (`composition/reels.md` E9). The band is a fixed mat: one flat field at every
    frame, crossed by a plane's edge only in the gutters. Holds are locked or the parallax float (8-15 px/s), never a
    zoom; one speed budget (~15 px per frame at 60 fps). *C12; DIRECTION rule 8; `CINEMATIC_GUIDE.md` rules 1-3.*
13. **Frame 0 peaks after the swipe settles.** The next reel slides up and settles in ~0.4 s (half its travel in 0.07 s,
    measured): the opening's bold event lasts >= 1 s and makes its biggest change after 0.4 s (its first strokes may run
    under the slide). Read as one gist at 0.25 s: one subject on the axis, >= 400 px wide (45 % of the visible width),
    with the hardest value step; the first spoken line in the band from frame 0; nothing important in the bottom 400 px
    or the outer 98 px. *V9; `composition/vertical.md` §4; the playbook's Hook ("~0.3 s was invisible") is explained by
    the swipe.*

## 2. The library at a glance

**Thumbnails:** `composition/shots_sheet.png`, one value thumbnail per recipe (our frame at 1/4, 270 x 480: five flat
values, white kept for the story light; the caption band and the app's interface on the owner's Reels tab marked
faintly; the composition idea in red), each in scene 1 or video 4 as its example says, drawn from the recipe's numbers
by `composition/shots_sheet.py` (seeded; no image copied or traced).

Pick by the beat (§4 has the checklist). **By beat:** the hook SR1 · establishing the home place SR2-SR5 · the subject's
moment SR6-SR11 · a reveal SR6 (through the opening), SR10 (the tilt), SR15 (the tilt-up), SR17 (the big move), SR4 (out
through the window) · the turn SR18, SR19 · scale SR14-SR17 · intimacy SR12, SR13 · a comparison SR20, SR19, SR11 · a
list SR21, SR22 · the payoff SR24, SR23, SR13. "The set's" = the set's own setup (A or B) and horizon from W1. The focal
is the centre of the beat's subject; its size is on screen.

| # | recipe | the beat | setup, horizon y | the focal: centre; size | device | camera | joins |
|---|---|---|---|---|---|---|---|
| SR1 | THE DRAWN SUBJECT | the hook, 0-3 s; the loop's frame | the set's | the focal home, near (540, 960); >= 400 px wide | figure and ground; the line first | locked, or one story move >= 3 % in <= 2 s | out C or A; the loop B |
| SR2 | HOME ACROSS THE WATER | the home place | A 1100-1250, or B 690-860 | the lit opening, (540-670, 950-1180); 150-230 px wide | stacked bands + one opening | locked or the float | in A or B; out A |
| SR3 | THE LANE | the home place: a street | 1020-1150 | the closed vista at the vanishing point, (540-700, 950-1150) | one point; the canyon's V | locked, the float, or a push to the vista | out A or C |
| SR4 | THE NOOK | the home place: indoors | none (the window's own) | the lamp-lit subject, head y 864-1152 | refuge and one opening | locked or the float | out A through the window |
| SR5 | THE BALCONY | the home place from above; a crowd | none (35-55 degrees down) | on the curve, y 860-1060 | the C-curve under a lid | locked | A or C |
| SR6 | THE LIT OPENING | the subject's moment | the set's | the lit aperture in the golden box; 15-30 % of the frame | frame within a frame | locked, then a push-through | out A |
| SR7 | THE PATH IN | arrival; the thing at the end of the way | A or B | the line's end, (480-640, 950-1150) | leading lines, one point, S-curve | locked while the subject travels, or a push to the vista | out A or C |
| SR8 | THE BREAK IN THE ROW | the one among many | the set's | the one lit window, (413-667, 860-1100) | a pattern with one break | locked | out A |
| SR9 | ON THE LINE OF LIGHT | a person's moment | A, camera 0.9-1.2 m, 1150-1300 | a figure straddling the lit horizon, x 413-667; 150-300 px | the cross; counterchange | locked; the figure walks the line | out C or D |
| SR10 | THE FOLLOW | travel; the mechanism on its way | the set's | held at x 410-560 (truck) or on the axis (tilt) | the pivot | a truck or a tilt | out C or D |
| SR11 | THE LEVEL CHANGE | cause and effect; two places in one frame | B | the subject's level in the golden box | two levels and the steps | locked, or a tilt between them | out C |
| SR12 | THE CLOSE | intimacy: the object | none | the object in the golden box; >= 650 px wide | isolation | a push <= 2x in, then locked | in A, C or F; out C or A |
| SR13 | THE HANDS | intimacy: the "you"; "for you" | the window's | the thing in hand, (300-600, 1000-1250) | POV; cause above, effect in hand | locked or the float | in A or B; out A or B |
| SR14 | THE YOU AND THE WORLD | scale from a human viewpoint | A 1150-1300 | the far lit point on the axis; the "you" at x 130-380, 130-220 px | scale from a known size; the gaze | locked, the float, or a push to the vista | in C; out A or C |
| SR15 | TINY UNDER GIANT | scale: the quantity, the machine | 1114-1229 (worm's-eye) or 1020-1133 | a figure 60-220 px at x 420-660; the giant >= 0.7 H | scale; the cross | locked, or a tilt-up | in F on a "But", or inside the big move; out A |
| SR16 | THE BIG SKY | a breather | ~1402 (S3) or ~1574 (S4) | a landmark on the left third, or a small "you" | negative space | locked or the float | never next to SR17 |
| SR17 | THE ONE BIG MOVE | the scale reveal, once | S1 710 -> 768; S5 845 -> 883 | the pivot (S5's figures x 420-560, feet y 1490); the landmark (760, 760) | scale; the pivot | S1 rise-over or S5 pull-back | leaves from the thread; back by A or C |
| SR18 | THE OFF-BALANCE | the turn ("But") | the set's | off home: x 250-380 or 700-830, no counterweight; or one 30-45 degree diagonal | unbalanced, the diagonal, the V | a plain cut F, or a push landing off-centre; then a hold | in F or C |
| SR19 | THE MATCHED PAIR | the turn told by light; before and after | the earlier shot's | the same focal, one change | the deliberate match | locked, both | B |
| SR20 | THE SEAM | a comparison in one frame | the set's | at the seam, in the golden box | juxtaposition | locked; the seam's front may travel | C |
| SR21 | THE LINEUP | how many; a list of like things | the set's, a little from above | the cause at the apex in the golden box; units >= 60 px | repetition; the pyramid | locked; units pop by rows on their word | C |
| SR22 | THE PAPER | the proof: a chart, a number, a date | none (straight-on) | the paper >= 60 % of the stage wide; one number 120-160 px | figure and ground | in by a push A or a flip E | A or E |
| SR23 | THE MIRROR | stillness; a formal beat; once | waterline 1040-1100 | the landmark on x 540, y 850-1040 | symmetry | locked | B |
| SR24 | THE WHOLE RUN | the payoff; the callback | the opening's | the thread at its home spot; the film's hardest step | the matched frame; one sweep | a pull back A, then locked | the loop B to frame 0 |

## 3. The recipes

Each recipe: **Beat** (when to use it); **Layout** (the horizon, the subject's place and size, the value masses, the
quiet areas, the story light, where the eye lands first, what sits behind the captions); **Device** (the composition
idea and where it comes from); **Camera and joins** (the move it pairs with and how it leaves); **Never**; and one line
on how it looks in scene 1 or video 4. Every recipe also keeps the 13 rules: the band one flat field, key reads in the
feed's clear window, one focal with the story light, two quiet fields, the near frame a hint.

### The hook

**SR1 THE DRAWN SUBJECT**
- **Beat:** the hook, 0-3 s, in one continuous shot (DIRECTION rule 9); the same frame is the loop's last (the film
  un-draws back to it).
- **Layout:** the set's setup, usually the home view or a closer view of the subject in it. The subject (tier A) is one
  closed shape >= 400 px wide, its centre in the focal home near (540, 960), where the eye already is when the reel
  lands. The drawing order is the value plan arriving: the subject's line first at full contrast (the darkest mark on
  the frame, a moving pen tip), then the world as flat pale shapes, the colour flood over the line, the light flooding
  from its source; the 3-value notan stands complete by ~1.5 s. The band shows the first spoken line on the flat sky
  from frame 0; the near band is one tone. The story light reaches the subject on the payoff word (~2 s) and makes the
  frame's hardest step there. Eye: the centre and the pen tip at once, the caption above, then the hook's change at ~2
  s.
- **Device:** figure and ground at two values (the subject one shape a viewer can name at 0.25 scale) and the reels' own
  teaching move, "the line first, then the world under it": a line held 0.5-1.5 s reads at phone size
  (`composition/reels.md` §5).
- **Camera and joins:** locked, or one visible story move >= 3 % in <= 2 s; never the reference's slow invisible
  pull-out; nothing scale before 3 s. The expected thing, then reality overtaking it at ~2 s through the real mechanism;
  the bold event lasts >= 1 s and peaks after 0.4 s (rule 13). Out by C (a push toward the mechanism) or A (into the
  subject).
- **Never:** a still frame; a subtle or short effect (a ~0.3 s pale draw-on was invisible); the biggest change before
  0.4 s; a title over the captions; extra supporting life as the novelty; the pen starting in a cut strip (x < 98) or
  anything to read at x > 945 or y > 1519.
- **Video 4 (S1):** start the pipe's visible draw at x >= 130 (the feed never shows x < 98, and the page is still
  sliding for the first 0.4 s), make the one window lighting on "heat" (2.14 s) the peak, inside the golden box, and let
  the windows that follow light as one spreading wave a step dimmer (+6-8 L* inside their facades), so the one window
  stays the call.

### Establishing the home place

**SR2 HOME ACROSS THE WATER**
- **Beat:** the home place's establishing view; the quiet beat's return; the callback's place.
- **Layout:** level across water (a canal, a river, a harbour), the camera on our bank. Two variants. **Enclosed**, the
  RIVERSIDE dose (`COZY_AND_SCALE.md` 3b.2): the far row rises behind the band as one flat facade (L* >= 75), the facade
  belt y 600-1000, a dark belt to y 1115, the far lane y 1115-1230 with the horizon on its standing heads (~y 1100), our
  bank y 1230-1420, the water from y 1420; the sky 8-15 % in the top gutter. **Open**, the human view (setup A, horizon
  y 1150-1250, scene 1's T1/T3; by `COZY_AND_SCALE.md`'s numbers a sky of >= 36 % counts as exposed: §5 row 12): the sky
  with the band down to the far belt's tops (never above y 620), the far belt to the horizon, the far waterline just
  under it, the water, our bank to the bottom edge. In both, the subject is the lit opening on the far bank (a door or
  one window, 150-230 px wide), centre (540-670, 950-1180); the far side's people, umbrellas, bikes and boats are
  texture in their band (within +-6 L*). The "you", when the card names one, stands on our bank at x 130-380 facing
  right, placed by the horizon-cut rule (in setup A its head on the horizon), soft and dark against the lit water;
  otherwise the view is the viewer's own (POV, v2's choice). Masses: the light sky (or the far row) with the band, the
  mid far belt, the dark near bank. Quiet: the sky and our bank, >= 65 % with the water. Light: the opening is the story
  light, its broken column on the water pointing at it; the low sun one step off its sky on the side away from the
  focal; the hero cloud high as the counterweight. Eye: the words, one drop to the lit opening, the light column below
  it confirming.
- **Device:** horizontal bands stacked up the frame (level lines: the calm of affinity), one opening on the far bank
  (SR6 inside a wide), counterchange at the focal, the steelyard.
- **Camera and joins:** locked, or the parallax float (our bank most, the far belt little, the sky and band not at all);
  life passes sideways in one lane, both ways, nothing comes at the lens. In by A (a pull back out of the opening) or B
  (the thread at its home spot); out by A (a push into the opening).
- **Never:** the horizon at the half; the far belt in the band, or so near it fills the frame ("I'm really
  suffocating"); the far side as an empty strip; a saturated far window competing with the focal; Pip on the light
  column under the door; more than 2 props on our bank.
- **Scene 1:** T1's values in v2's view, the frame moved up 140-190 px so the horizon leaves the half (y ~995 ->
  1135-1187; T3 moved it +140): the lit door lands at ~(630, 1105-1155), 550-600 px under the block; the sun one step
  off its sky at the left; our quay one shade mass with one table and chair cut by the right edge.

**SR3 THE LANE**
- **Beat:** a street as the home place; the walk; a closed vista where the story's object waits.
- **Layout:** the LANE dose (`COZY_AND_SCALE.md` §2, 3b.2): eye level along a street, H:W 1:1-1:1.5, the walls >= 35 %
  of the frame, the sky 15-30 %. One side tall, cut by the top, its face one flat light field (L* >= 70) through the
  band; the other side tops out below y 600. Horizon y 1020-1150, off the half; the vanishing point at x 540-700 on the
  subject (within 60 px) or hidden behind it. The subject is the one thing that closes the vista (a tower, a bend, a lit
  shopfront, the story's object), centre (540-700, 950-1150), the lightest thing at the street's end. Masses: the two
  walls in shade (mid to dark), the sky slot light, the street floor mid with the lit lane down its middle. Quiet: the
  sky slot and the near floor. Light: at the end (the vista lit, the walls in shade). Eye: the words, then down the
  walls' converging lines to the lit end.
- **Device:** one-point perspective to a closed vista (`composition/reels.md` B2, E7); the canyon's V (B11); the
  tunnel's light at the end (B4).
- **Camera and joins:** locked or the float; a push to the vista (K5) as a story move, visible (>= 3 % in <= 2 s, e.g. 6
  % in 3 s, on its word), anchored on the far vanishing point; walkers pass both ways on the walks. Out by A (into the
  lit end) or C.
- **Never:** an open vanishing point into empty sky (the eye leaves through it); both walls tall through the band (a
  symmetric 1:1 lane can't hold the captions); a line across the band; the vanishing point under the rail (x > 870); a
  brighter patch on the walk than at the end.
- **Scene 1:** along the towpath toward the bridge, the canal's coping and the wall's foot converging on the lit door at
  the end of the walk, the low sun one step off its sky over the far roofs, the band on the flat face of the tall wall
  at the right.

**SR4 THE NOOK**
- **Beat:** an interior home place; the personal, quiet beat; the place a "you" sits.
- **Layout:** the NOOK dose (`COZY_AND_SCALE.md` §2-3): refuge 35-55 % of the frame on >= 2 edges (a wall, a shelf, a
  soffit cutting the top 8-15 % over <= 70 % of the width) and a top-edge object in y 0-290 (a lamp shade, a beam); ONE
  opening, the window, 15-30 % of the frame, read in y 600-1250, >= 10 L* off its surround (lighter by day; at night the
  cool darker inset). No horizon in the room; the view in the window keeps the set's setup. The subject: the person at
  the desk (back or 3/4 back, head at y 864-1152, back to a wall, facing the window) or the object on the desk, in the
  golden box. Masses: the room one light-mid tone, the window, the desk mid. Quiet: the wall behind the captions and the
  floor or desk (the two quiet fields indoors). Light: one low lamp, the story light, and at most one secondary (a
  screen); its pool on the desk with real falloff; cold only in the window. Eye: the words on the wall, then the
  lamp-lit subject; the window one step under it. Band: a flat light wall (L* >= 70), never the window.
- **Device:** refuge and prospect: one opening in an enclosing mass (held, not shut).
- **Camera and joins:** locked or the float; small loops inside (steam, a page, breath). Out by A through the window
  (K9: the window 15-25 %, a push 0 -> 0.85 in 1.2-2 s); back in by A out of it.
- **Never:** a ceiling light; the window and the lamp at the same brightness (two calls); a mullion across the view's
  landmark; the window behind the captions; the room's wall dead flat (it is patterned +-4-6 L*).
- **Video 4:** inside the flat behind the one window: the radiator under the sill as the subject (y ~1000-1150), the
  lamp's warm pool on the sill the story light, the snowy street and the giant computer's small lights a cool step
  darker in the glass.

**SR5 THE BALCONY**
- **Beat:** the home place seen from above (a street, a square, a courtyard); a crowd; the flow of a place.
- **Layout:** the BALCONY dose (`COZY_AND_SCALE.md` 3b.2): from a 3rd-5th floor window, 35-55 degrees down; no sky and
  no horizon. The lid y 0-600: >= 90 % mass cut by the top edge, one flat facade (L* >= 75) across x 95-945, y 290-600
  behind the captions, one corner mass cut by two edges and 1-2 smaller side masses (a C-shaped cradle). The life band y
  600-1250: the far kerb, people 70-190 px, the story's object. The floor y 1250-1920: one calm field in <= 2 tones,
  15-18 L* lighter than the masses. One C-curve (a kerb, a bank) enters just under the band (y 600-700), leaves the
  other side at y 860-1060 and dives under a mass through a mouth <= 150 px. The subject sits on the curve in the golden
  box. Light: a lit shopfront or the object's own light on the curve. Eye: the words on the lid's flat facade, then down
  to the subject; the curve carries the eye round it.
- **Device:** the C-curve (`composition/reels.md` B9) under a lid that frames the band instead of crossing it.
- **Camera and joins:** locked; the traffic follows the curve; movers enter and leave only through the open sides or the
  mouth. In and out by A (the window we look from) or C.
- **Never:** the canopy or a roof edge in the band; one lone person as the subject from this height (a high angle on one
  person reads as being looked down on); the floor busier than the life band.
- **Video 4:** from the next block's snowy balcony (Pip's spot in S1 and S12), the street below curving from under the
  band toward the harbour, the melt line along it the subject's path, a tram on the curve, the snow floor the calm
  field.

### The subject's moment

**SR6 THE LIT OPENING**
- **Beat:** the subject's moment: one person or one thing in its place; the start of a push-through reveal.
- **Layout:** the set's setup. One opening (a door, a window, an arch, a gate, the gap between two masses) on the axis,
  15-30 % of the frame; its lit aperture's centre in the golden box (x 413-667, y 951-1187), its top at y >= 620. The
  aperture is the lightest area below the sky (>= 10 L* off its rim); the figure or object inside it is dark against it
  (a step >= 65 L*), a figure 150-300 px tall; the rim (the wall around it) one mid or dark mass, quieter than the
  aperture, with <= 2 props. Quiet: the sky with the band above the wall; the ground below. Light: the opening is the
  story light, a soft glow and gentle bloom at it that end >= 10 px outside the band, a pool on the ground in front.
  Eye: the words, then straight down into the lit aperture and the silhouette in it.
- **Device:** frame within a frame with the lit opening (`composition/reels.md` C1, E2): the inner frame the brightest
  area, the figure dark inside it. The two calmest reel examples are this (a stairwell's lit gap with one man in it: 2
  calls, 83 % quiet; a row of windows with one man in one: 1 call, 73 % quiet).
- **Camera and joins:** locked while the figure stands in the opening or crosses it; then a push-through (A, K9): 0 ->
  0.85 into the aperture in 1.2-2 s, and the aperture IS the next shot; or a C push of <= 2x to a closer view of it.
- **Never:** two openings lit alike; the opening under the rail (x > 870 below y 860); the figure touching the opening's
  edge (overlap it by >= 10 px or keep >= 20 px clear); the opening's glow laid over the wall; a centred, symmetric
  doorway in every beat (once is formal: SR23).
- **Scene 1:** a C push of <= 2x from the home view to the Google door: the doorway ~450 px wide with its canopy (~15 %
  of the frame), its inside at L* >= 95, her silhouette ~300 px tall at L* <= 28, the brick round it one mid mass (~L*
  52), the panes above tone-on-tone.

**SR7 THE PATH IN**
- **Beat:** arrival: the subject at the end of the way; the thread travelling to its place; a slow, calm way in (the
  S-curve).
- **Layout:** setup A or B. Lines in the ground (kerbs, a coping, a pier's rails, a path's edges, tracks, a light's
  column on water, a melt line in snow) rise from the bottom edge (they may start under the bottom UI as masses) at
  40-60 degrees, in 2-3 legs of >= 150 px, to the subject at (480-640, 950-1150); the vanishing point on the subject or
  hidden behind it; the sight line closed by one object. **The S-curve variant:** a canal, river or path winding up the
  frame in 2-3 bends, entering at the bottom edge (x 250-830), each bend 25-40 % W wide and about half the width of the
  bend below it, ending on or behind the focal. Masses: the ground mid with its lines tone-on-tone, except the lit lane;
  the sky light with the band; the far end lit. Quiet: the sky; the ground between the lines. Light: the lines end at
  the story light (a lit end, a light's column). Eye: the words, then the lit end; the lines confirm it from below.
- **Device:** leading lines and one-point perspective (`composition/reels.md` B1, B2) to a closed vista (E7); the
  S-curve (B8): the tall ground holds one more bend than a landscape frame.
- **Camera and joins:** locked while the subject travels the line (into the vanishing point, along the path: the reels'
  runner went 305 -> 92 px in 1 s down a pier's axis); or a push to the vista (>= 3 % in <= 2 s, on its word). Out by A
  (into the end) or C (on along the line).
- **Never:** lines ending on nothing (an empty vanishing point in the sky); a brighter patch on the path than at its end
  (reel 04a's sunlit patch beat the man the lines pointed at); a line across the band or corner to corner unbroken; a
  line leading on past the focal down to the name block (the exit).
- **Scene 1:** the door's broken light column on the canal is the one line in, rising from our side of the water to the
  lit door, while the quay's paving lines stay level and quiet (in still v6 they run to a point ~1,100 px off the left
  edge).

**SR8 THE BREAK IN THE ROW**
- **Beat:** the one among many: one home in a city, one person in a crowd, the thread's home spot among its kind.
- **Layout:** the set's setup. A repeated motif (a facade's windows, boats, bollards, umbrellas) is ONE texture inside
  one mass: its pieces within +-6 L*, sizes varied 5-12 %, states mixed, never a ruler grid of identical rectangles. One
  break in it is the subject: one window lit warm with a person or the thread in it, at (413-667, 860-1100). Masses: the
  facade one mid mass, the sky with the band above, the street or water below. Quiet: the sky; the wall below the
  windows. Light: the one lit pane is the story light and carries the scene's one hot accent; the other panes dark or
  lit a step under it, inside the facade's value. Eye: the words, then the one break.
- **Device:** a pattern with one break (`composition/reels.md` D7: a row of six windows with a man leaning out of the
  fifth, 1 call, 73 % quiet; cinema §4.15).
- **Camera and joins:** locked; the break may happen on its word (the one window lights: a light change in place); out
  by A (a push-through into the window).
- **Never:** two breaks; a saturated colour in any other window (still v6's four yellow upper windows were the colour
  formula's #1, out-shouting the lit door); the pattern's pieces with their own silhouettes at a squint.
- **Video 4 (S1, S12):** the block's one window is the only warm pane before "seventy"; the windows that light after it
  stay a step under it (+6-8 L* inside their facades, cooler), so the one window stays the break all film long.

**SR9 ON THE LINE OF LIGHT**
- **Beat:** a person's moment: an arrival, a pause, the stillness after a turn; one upright thing (a lamp, a mast, a
  tree) as the subject.
- **Layout:** setup A with a low camera (0.9-1.2 m): the horizon y 1150-1300 is a lit line (a lit far shore, a sunset
  sea, the lit canal, a far band of lit windows); the subject stands ON it as one dark upright, 150-300 px, centre x
  413-667: at 0.9 m a 180 px figure spans y_h - 85 to y_h + 95, the light behind its chest. Masses: the sky 50-65 %
  (light, quiet, the band high in it, one big cloud high as the counterweight), the thin lit line (the frame's hardest
  step where the figure crosses it), the ground below dark. Quiet: the sky and the dark ground. Light: the lit line is
  the story light (a sun on it one step off its sky unless it is the shot's "look here"). Eye: the words, down to the
  brightest line, then its one break: the figure.
- **Device:** the cross (`composition/reels.md` A6): one strong vertical across one strong horizontal, at the subject;
  counterchange (the owner's beach reference: the couple dark ON the lit horizon line, its one call).
- **Camera and joins:** locked; the figure walks along the line with its lead room ahead, or stands; clouds drift 3-6
  px/s. Out by C, or D (the figure leaves one edge and enters the next shot from the opposite edge at the same speed).
- **Never:** two uprights of equal weight on the line; the line at the half; the figure's head in the band or its feet
  under the bottom UI; the figure facing us.
- **Video 4:** a walker crossing the snowy harbour front, dark against the far shore's band of lit windows on the
  horizon at y ~1200, the one big snow cloud over the harbour high on the other side.

**SR10 THE FOLLOW**
- **Beat:** travel and the mechanism on its way: a walker going home, the thread on its way, heat moving through a pipe.
- **Layout:** **Sideways (a truck):** the subject held at x 410-560 while the world slides past (each plane by its
  depth, 1/z), facing its travel with 1.5-2x lead room (moving right: at x <= 410 below y 860); the background drawn as
  the view plus the travel; life passes the other way at its own pace. **Up or down (a tilt, the tall frame's own
  move):** the subject or its effect travels the frame's height (water down a pipe, steam rising, a tower up), the
  camera shifting 600-900 px in 2.5-3.2 s with the verticals parallel (K2's shape), the subject on the axis, the band
  one flat field at every frame. In both, the subject is the one thing moving against the flow and carries the focal's
  value step with it.
- **Device:** the pivot (rule 12): the screen-locked subject among moving planes wins the eye [cinema S6]; height, not
  width, is the tall frame's travel (`composition/vertical.md` §6).
- **Camera and joins:** one move on one ease: it catches the subject up, holds it, then lands with the next beat's frame
  in the golden box. Out by C (the camera goes on), or D (the subject leaves one edge and enters the next shot from the
  opposite edge at the same speed).
- **Never:** the subject wandering in the frame; a compound move (a truck plus a zoom, a tilt plus a zoom); a source's
  speed (retime it); the subject riding into the rail at the right edge; two follows in a row (§4).
- **Video 4 (S10, S11):** S10 tilts down with the cool water from the computer's top to its foot while the steam above
  it thins; S11 trucks right with the hot water's front held at x ~400, its lead room to the right, the street sliding
  past, landing with the block's foot, its wall and the one window in the golden box.

**SR11 THE LEVEL CHANGE**
- **Beat:** cause and effect in one frame (the street above, the pipe below); two places joined (a square above, a
  towpath below).
- **Layout:** setup B (camera 3-7 m) or a soft cutaway. Two levels: the upper at y ~700-950, the lower at y ~1150-1450,
  joined by steps, a slope or the cut's edge, running 30-45 degrees through the stage (the shot's one diagonal). The
  subject on one level, in the golden box; the life or the effect on the other. Each level is one mass; the subject's
  holds the story light. Quiet: the sky with the band above the upper level; the lower level's ground. Eye: the words,
  the subject's level, then along the steps to the other.
- **Device:** the level change (`composition/reels.md` C3: a walker high on a station stair, people waiting below); only
  the tall frame holds both stages.
- **Camera and joins:** locked, or a tilt from one level to the other (SR10); out by C.
- **Never:** two levels with equal calls; a ruler-straight cut through the ground (it reads as a diagram: the cut is a
  soft, irregular painted edge, or there is none); the lower level's key read under the bottom UI (y >= 1519).
- **Video 4:** the snowy street at y ~850-1150 above, the warm pipe in a soft, irregular painted cut of snow and earth
  at y ~1250-1450 below, the melt line in the snow joining the two; or no cut at all, the melt line alone showing the
  pipe's path.

### Intimacy

**SR12 THE CLOSE**
- **Beat:** intimacy with the object the story turns on; the personal beat; a mechanism's detail.
- **Layout:** no horizon (or the set's, far behind). The object >= 60 % W (>= 650 px), the biggest whole thing in the
  frame, its centre in the golden box, its top under the band (y >= 620); its own backing one quiet field in the place's
  colour, flat behind the captions; <= 2 other things, cut by the edges. The detail (found edges, the finest marks) on
  the object only. Light: the story light on the object: its lit face, a rim on the key's side, its shade face the
  deepest of the frame. Eye: the words, then the object's one feature that names it.
- **Device:** isolation: size on screen makes the subject important, and the background is read in about a quarter of a
  second while the eye stays on the subject (2D layout practice, cinema S16).
- **Camera and joins:** reached by a push of <= 2x per panel (A or C), the close drawn at its own size, or by a plain
  cut-in on its axis on a "But" turn (F); then locked or the float. Out by C (a pull back) or A.
- **Never:** a face, or a person as the subject; a 4x zoom of the wide drawing; the object inside a screen rectangle (it
  reads as a picture on a display); steam, a glow or the object's top in the band.
- **Video 4 (S3):** the computer's top ~700 px wide on the axis, its flakes melting to steam on "really" that rises and
  thins out below y 600, the snow beyond one quiet dark-blue field.

**SR13 THE HANDS**
- **Beat:** intimacy with the "you": the effect in the viewer's own hand; the "for you" of the payoff.
- **Layout:** POV: the "you"'s hand and forearm rise from the bottom left (the wrist runs under the bottom UI as a
  mass); the thing in hand (a phone, a cup, a key) centred at (300-600, 1000-1250), its face or screen inside x <= 870
  and y <= 1480. Behind it the world keeps the set's setup, the cause in it on the axis above the hand (y ~700-1000),
  changing on the same word as the thing in hand (one subject group). Masses: the hand and sleeve dark-mid (the near
  mass), the world mid, the sky light with the band. Light: the thing in hand lit (a screen's glow is a local story
  light); the cause a step under it until the payoff word. Eye: the words, the cause, then down to the hand (300-500
  px).
- **Device:** POV with the cause above and the effect in hand (`CINEMATIC_GUIDE.md` "The opening": the cause outside the
  home window, the effect in the hand, both changing on the payoff word); `composition/reels.md` E11.
- **Camera and joins:** locked or the float (the hand breathes <= 2 % W/s); the hand acts once, on its word. In by A (a
  pull back out of a window or a screen) or B; out by A (into the screen) or B.
- **Never:** the screen under the rail (x > 870 below y 860) or the name block (y >= 1519); a logo or readable fine
  print on the screen; a big near body; the hand coming in from the right edge (it lands under the rail).
- **Video 4 (S12):** the gloved hand and phone come in from the bottom LEFT (x ~150-500), not the bottom right, where
  Instagram's rail (x 877-954 from y 1032) and the name block (y >= 1519) sit; the phone's screen at ~(380, 1150), the
  chat bubble on it, the warm run and the one window above and right of it.

### Scale

**SR14 THE YOU AND THE WORLD**
- **Beat:** scale from a human viewpoint (the film's lesser scale moment, not the big move); the establishing view of a
  city or a coast; "what this means for you".
- **Layout:** setup A (horizon y 1150-1300, the camera at 0.9-1.6 m). The "you" at x 130-380 facing right, from behind
  or in silhouette, 130-220 px: its head on the horizon (camera 1.6 m: head y ~1140-1290) or 60-105 px above it (camera
  0.9 m), its feet at y ~1220-1510. The world beyond: one dense belt on the horizon (a far city, a coast, a harbour),
  rising into the sky where it is tall (tops at y >= 620). The focal is the far world's one lit point (a lit tower, a
  lit window, the sun on the horizon) on the axis at (480-640, 950-1200), on the "you"'s sightline. Masses: the sky
  light, 50-65 % with the band high in it; the far belt mid, its density inside it; the near ground and the "you" dark,
  one connected dark mass rising into the light at the line of heads. Quiet: the sky; the near ground. Light: the far
  lit point is the story light, the key behind the far world (the "you" a soft silhouette). Eye: the words, the far lit
  point, then the "you" looking at it.
- **Device:** scale from a known size ("We feel the vastness of a scene by the presence of a lone figure", Poore 1903,
  via cinema S1); the gaze cue (the "you"'s sightline sends the eye to the focal [cinema S9]); the owner's human-scale
  references (`refs_human_scale/`: the city hill, the beach) are this frame.
- **Camera and joins:** locked or the float; or a push to the vista (>= 3 % in <= 2 s, anchored on the far point); life
  in the sky (birds, clouds) and far away (a ferry, a tram), never by the "you". In by C (a rise or pull back from the
  home view); out by A (into the far point) or C.
- **Never:** the "you" on the axis covering the focal; the "you" facing us, or as bright as the focal; a far,
  poster-like panorama with no near figure ("too cheap looking"); a wall filling the frame ("suffocating").
- **Video 4:** the "you" walking home in the snow at the street's near edge (x ~200-350, ~180 px, from behind), the
  harbour and the far city as one band of lit windows on the horizon at y ~1200, the block's one lit window above it at
  ~(560, 1000) on the "you"'s sightline.

**SR15 TINY UNDER GIANT**
- **Beat:** scale: the quantity, the machine, the system beside one person.
- **Layout:** a worm's-eye (K7: camera 0.3 m, horizon y 1114-1229) or eye height (horizon y 1020-1133, off the half).
  The giant >= 0.7 H tall (>= 1344 px) and >= 10:1 over the figure, cut by the top edge, its face across the band one
  flat field (L* >= 70), its top in a gutter or cut off. The figure (the "you" 130-220 px, or an anchor 60-150 px in a K
  wide) low near the axis (x 420-660), feet above y 1250 (K7) and always above y 1480, on plain ground in front of the
  giant (against a busy giant it vanishes). Masses: the giant one mass (mid), the ground light and plain, slivers of
  sky. Quiet: the giant's face (patterned +-4-6 L*) and the ground. Light: at the figure's spot (a pool, or the giant's
  lit door at its foot): the figure is the stage's only high-contrast mark. Eye: the words on the giant's flat face,
  down its verticals to the figure at its foot.
- **Device:** scale (`composition/reels.md` D2: a man at a railing, 214 px at full width, under a tower that fills half
  the picture); the cross (the giant's vertical on the ground line).
- **Camera and joins:** locked (K6, 2-3.5 s), or a tilt-up reveal (K2's shape: 600-900 px in 2.5-3.2 s, the top landing
  at 0.08-0.15 H or cut). In by a plain cut F only on a "But" turn (K1: the wide's figure <= 1/8 of the close's size),
  or inside the big move; out by A.
- **Never:** the low angle on the thing under critique (scene 1: never on the Google building); the figure on busy
  ground or under the bottom UI; the giant's detail in the band; two scale wides in a row.
- **Video 4:** S10's planned hall, its rows of giant computers running past both side edges, with one engineer at ~130
  px at its foot: the one 2-storey computer is only ~4:1 over a person, so the hall, not the one machine, is the giant.

**SR16 THE BIG SKY**
- **Beat:** a breather: after a dense or scale beat, before a key line, or the outro; the caption owns the frame.
- **Layout:** a low horizon (S3 ~0.73 H, y ~1402; S4 0.82 H, y ~1574, its ground band allowed under the bottom UI as a
  mass). The sky 70-80 %: one gradient, 2-3 painted cloud masses in planes (the near one biggest), the hero cloud cut by
  a side edge as the counterweight, every cloud below the band. One landmark on the left third (x 220-420) rising to
  y >= 600 (S3), or the "you" small (~150 px) at the bottom left, its feet above y 1480 on a wall or a step (S4), or
  nobody. Masses: the sky light (one big quiet field, patterned), the land strip dark. Light: the sun half behind a
  cloud's edge (S3) or a half disc on the horizon (S4's closer variant), at the subject's side. Eye: the words, then the
  landmark or the figure at the field's foot.
- **Device:** negative space (`composition/reels.md` D1: the space gives the small subject weight); Guo Xi's "level
  distance", a thin band of land under a huge sky (cinema S19).
- **Camera and joins:** locked or the float; clouds drift 3-6 px/s, birds cross the top. S2 and S4 at most once each a
  film; never next to SR17.
- **Never:** an empty sky (it is patterned: clouds in planes, birds, a gentle variation in tone); a cloud or a top in
  the band; the figure under the bottom UI; the same breather twice in a film.
- **Scene 1:** the far city a thin strip at y ~1400-1520 under the dusk sky, one big cloud bank lit rose on the sun's
  side at the left, the bridge's arch the one landmark on the left third.

**SR17 THE ONE BIG MOVE**
- **Beat:** the film's one scale reveal ("it is bigger than you thought"), once a film: S1 or S5, never both.
- **Layout:** `CINEMATIC_GUIDE.md` S1 or S5, as three designed frames (rule 12). **S5's start:** the horizon at 0.44 H
  (y ~845) seen only through a slot (3-5 % of the frame, the brightest and coolest patch in a warm dark frame, x
  240-600, y 780-900), the figures from behind (heads <= ~140 px, from y 1060, cut at the hips). **S5's end:** the
  horizon at 0.46 H (y ~883), the landmark centred at (760, 760) on the right third with its top at y >= 620, the
  figures tiny at x 420-560 (feet y 1490, 170-200 px), 6 planes, a lit canyon leading to it. **S1:** the near wall and
  the "you" fill the bottom 25 % (top edge y ~1440) at 0.37 H (y ~710), landing at 0.40 H (y 768) with the city in the
  lower 60 %. The band stays in the flat sky at every frame (S5's start: sky y 0-840). Over the move: the bright slot in
  a dark frame, the darkest moment at the dormer, a light burst before the landmark lands, the settle. Eye: on the pivot
  (the figures) through the move, then the landmark as it lands.
- **Device:** scale; the pivot (the subject holds still while the world moves past it); a frame within a frame opening
  into the world.
- **Camera and joins:** one continuous move on one ease (S5: a dolly back, a crane up and a 70-80 degree arc; S1: a
  rise), retimed to the reel (S5's default a 2.6 s move + a 0.7 s hold), the landmark landing on the payoff word. It
  leaves from the thread (the declared scale reveal may run without it) and the next join returns to the thread, by A
  (the dive back in) or C.
- **Never:** a zoom instead of a dolly; a second big move; roll; the landmark in the band; Pip as the anchor.
- **Video 4 (S6):** out from the mug to the Earth's curve: hold the pivot (the mug, then Helsinki's lit spot) within
  +-40 px of one point on the axis all the way out, and land with the curve's horizon off the half (y <= 860 or >=
  1150), the band in the sky above it one flat field.

### The turn

**SR18 THE OFF-BALANCE**
- **Beat:** the turn ("But ..."): the one place in the film where the composition leans.
- **Layout:** the set's setup. The focal leaves its home to one side, x 250-380 or 700-830 (still inside the clear
  window), with no counterweight on the other side, which stays open (sky, water, empty ground); or one dominant
  diagonal of 30-45 degrees rises through the stage to the focal; or the inverted triangle (the V), its point at the
  focal. Masses: one heavy dark mass on the focal's side, the open side light, the band in the set's flat sky or wall
  above both; the step at the focal the film's hardest so far. Light: the story light hard on the focal (a raking key, a
  lamp switching on). Eye: the words, then a longer jump to the off-centre focal: the turn is felt.
- **Device:** the unbalanced frame ("deliberate tension: one heavy side and nothing against it", cinema §9), the
  diagonal and the V: contrast against the home beats' affinity (level lines, close values, slow), as a film's intensity
  curve is planned (cinema S17).
- **Camera and joins:** a plain cut (F: at most 2 a film, only on a "But" turn, the thread on both sides, a size
  change >= 20 % (>= 1.5-2x proposed: §5 row 14) or an angle change >= 30 degrees), or a push that lands off-centre;
  then a hold of 0.5-1.0 s (the pause after the heaviest line) before the next move.
- **Never:** in a cozy or home beat; twice in a row; the focal under the rail (x > 870 below y 860) or in the cut
  strips; a tilted horizon.
- **Video 4 (S7, "But Helsinki WANTS that heat"):** the dive lands with the computer at x ~330, off the axis, the city's
  pipe coming in from the right, so the empty stretch the pen draws on "WANTS" crosses the open half toward it; S8's
  push re-centres on the plan.

**SR19 THE MATCHED PAIR**
- **Beat:** the turn told by light (a window goes dark, a lamp comes on); before and after; the callback.
- **Layout:** the same frame as an earlier shot (a B match: the thread within +-8 % of its spot and +-20 % of its size;
  a deliberate match keeps the exact frame) with ONE change at the focal: the light (lit to dark, dark to lit), the
  thing (a price, a sign, a level), or the hour. Everything else stays identical, so the change is the only difference.
  Light: the key changes only on a story turn, once or twice a film, carried by the light changing in place (a lamp or a
  window switching, a cloud crossing the sun), never cut in; a colour shift over 15 at the join is then declared
  (`CRAFT.md` §a). Eye: straight to the change.
- **Device:** the deliberate match ("the same chart again, the same place later, the callback to the opening's end
  frame", `STORYBOARD_STYLE.md` §7); the colour script's one key change per story turn (cinema §7).
- **Camera and joins:** locked on both; the change lands on its word. The join between the two is B, or the change
  happens inside one held shot.
- **Never:** a drift between the two frames (it reads as a mistake); two changes at once; a light source that moves
  between them.
- **Scene 1:** the home view with her office window on the axis the one warm pane, then the same frame with it dark on
  "She quit": the other panes unchanged, so the one dark pane is the story.

### A comparison or a list

**SR20 THE SEAM**
- **Beat:** a comparison inside one frame: two states (cold and warm, before and after, thrown away and kept).
- **Layout:** one line (a waterline, a shoreline, a melt edge, a shadow edge, a wall) splits the stage into two fields,
  across it (one state above, one below) or on a 30-45 degree diagonal; each field one value and one texture, their
  means >= 13 L* apart; the subject sits at the seam, in the golden box. Quiet: each field calm inside itself. Light:
  the story light on the subject at the seam (the hardest step is the seam at the focal). Eye: the words, then the seam
  where the subject sits; the two fields read in one glance as "this against that".
- **Device:** juxtaposition (`composition/reels.md` D6: a beach split from the sea by its shoreline); two opposites side
  by side read as intense (cinema S17).
- **Camera and joins:** locked; the seam's front may travel (a melt spreading, water rising, a shadow moving with the
  light) as the beat's one mover. Out by C.
- **Never:** two stages stacked as a split screen (the eye switches between streams: `composition/vertical.md` §2); the
  seam across the band; two equal fields with nothing at the seam.
- **Video 4:** the melt line in the snow over the pipe: white, untouched snow on one side, the dark wet melt on the
  other, the hot water's front running along the seam with the one warm accent at the front.

**SR21 THE LINEUP**
- **Beat:** how many: a count made visible ("forty kettles"); a list of like things.
- **Layout:** the set's setup, seen a little from above so the rows recede. The many are equal small things, each >= 60
  px, ONE texture in one mass (within +-6 L*, never forty subjects); the count reads as a shape (rows by columns: 5 rows
  of 8). The cause, when shown, is the apex behind them: a pyramid with its base on the near ground (y 1350-1520, >= 540
  px wide) and its apex in the golden box. Or one row on a ledge (an Isotype row), one unit broken out as the subject.
  Masses: the units one mid texture, the cause one strong mass (its top at y >= 620, under the band), the floor light.
  Light: on the cause (or the one unit broken out). Eye: the words, the cause at the apex, then the spread of units
  below it.
- **Device:** repetition ("'How many' is a row of equal small icons (Isotype), not one bigger icon",
  `STORYBOARD_STYLE.md` §3); the pyramid (`composition/reels.md` D5; cinema §4.10: the apex on the focal, sides 50-70
  degrees).
- **Camera and joins:** locked; the units pop by rows on their word, never one by one for forty; out by C.
- **Never:** units of different sizes or colours (it becomes a tour); units as strong in value as the cause; a unit
  under the rail or in the bottom UI; a number tag beside the caption's number.
- **Video 4 (S4):** the 40 kettles in 5 rows of 8 on the snowy floor at the computer's foot (the front row ~650-700 px
  wide at y ~1400, the back row ~500 px at y ~1180), one mid texture of lids and spouts whose steam joins the
  computer's; the computer the apex with the hardest step.

**SR22 THE PAPER**
- **Beat:** the proof: a chart, a number, a date, a plan; information as paper in the place.
- **Layout:** paper in the place the camera is already in (a printout, a phone, a board, a tag), straight-on and level;
  as the beat's subject (a chart) it is >= 60 % of the stage wide (>= 456 px), with axes an L, one line or 3-5 bars
  and <= 2 axis words at 56 px; as a tag on the subject (a date, a price) it carries one number or word, 120-160 px, on
  or touching what it measures; the paper's face one quiet light field with its top under the band (y >= 620), its place
  visible at the edges (a hand, a wall, the snow). Light: the paper lit, the place a step under it. Eye: the words, then
  the number or the line's end.
- **Device:** figure and ground: one light rectangle, one dark mark on it (`LAYOUT.md` §2 chart row).
- **Camera and joins:** entered by a push (A) or a card flip (E); the line draws on in step with the voice (a draw-on is
  allowed where the drawing is the beat); held >= 1 s after its number lands.
- **Never:** a new place made for the chart (a billboard, a noticeboard); small words, sources or fine print (they go in
  the post's text); the paper at an angle (it bends the number); the same words as the caption.
- **Video 4 (S8):** the paper tag swinging onto the plan's front wall on the axis, below the computer's middle, "2027"
  at 120-160 px: the only word in the film's picture.

### The payoff

**SR23 THE MIRROR**
- **Beat:** stillness: a formal, settled beat (an answer, the quiet before the payoff, the loop's end); once a film.
- **Layout:** a landmark or a lit opening on the axis (x 540), mirrored left to right (the two halves within +-5 % in
  mass) and in still water below it: the landmark at y 850-1040, the waterline (the horizon) at y 1040-1100, off the
  half; the reflection below it to y ~1300, calmer and a step darker; the banks' masses at both sides as the symmetric
  frame. Masses: the sky light with the band; the landmark and its reflection the one call; the dark banks. Light: the
  landmark's light and its reflected column. Eye: the words, then straight down the axis to the landmark.
- **Device:** symmetry (`composition/reels.md` A7: a pavilion mirrored in a still lake at dusk); the axis x 540 sits 20
  px from the captions' centre line, so the words sit on the mirror's axis.
- **Camera and joins:** locked; one slow mover (a bird, a boat) crosses and breaks the mirror once. In or out by B (a
  matched frame), or as the loop's frame.
- **Never:** more than one a film (two at most); the horizon at the half; three wides in a row sharing a centred
  landmark on a ground line; symmetry for a mechanism beat (it stops the eye).
- **Scene 1:** the lit doorway centred on x 540 across the still canal at dusk, its light column and reflection doubling
  it down to y ~1300, the two banks' dark masses mirrored at the sides: a still beat for her answer.

**SR24 THE WHOLE RUN**
- **Beat:** the payoff and the callback: the whole story in one picture; the frame the film loops from.
- **Layout:** the home view's matched frame (the opening's end frame, kept exact: SR19), now with everything the story
  built visible end to end: the thread's whole path drawn as one line that sweeps the eye through the frame in 2-3 legs,
  in the story's order, and ends at the focal (the thread at its home spot, in the golden box). The film's hardest value
  step (>= 65 L*) and its one hot accent at the focal; the light at its warmest; Pip back on its first spot. Eye: the
  words, the path's start, the sweep, the focal.
- **Device:** the matched frame and one sweep ("triangulate in, with a series of zigzags", Poore 1903, via cinema §4.5).
- **Camera and joins:** a pull back (A) out of the last close onto the matched frame, then locked; the last frame
  un-draws to frame 0 (B).
- **Never:** anything new the film has not shown; a title; a second focal.
- **Video 4 (S12):** the home view with the warm run lit from the giant computer under the street to the one window; the
  pulse travelling the run on "could ... heat ... apartment" is the sweep, ending on the one window lighting a step
  warmer; the phone from the bottom left (SR13).

### Not in the library (what the references show that we don't take)
- Focus blur and motion blur, a big blurred near head, a soft near layer filling half the frame: our look has no blur
  (DIRECTION rules 4-5); the near frame is a hint at the edges (rule 10).
- Grids that place the subject by the full frame: the thirds' crossings (y 640 under the band, y 1280 under the read
  zone), the golden triangle's and the dynamic-symmetry eyes (in the band or by the bottom UI), the full-frame golden
  spiral's pole (x 298 or 782).
- Balance of two equal masses, the double diagonal, top-down views (a high angle once a film on a crowd, K10; overhead
  only as paper), a tilted horizon, a dolly zoom.
- The photographs' density (1-14 value calls, median 6, against the owner's painted models' 1-2): we take their
  armatures, never their clutter.
- A title over the shot, and the reels' opacity cross-fade between their line and their picture (DIRECTION rule 8: no
  opacity fades; our line draws on and the colour floods in under it).

## 4. Picking shots for a film (the composition-and-motion pass)

Done on the visual script before G3 (the playbook: "for each shot, which composition recipe it uses, how the camera and
the action move WITHIN the shot, and how it moves to the next"), one row per shot in the camera plan: the beat's one
sentence, the recipe (SR#), the move inside the shot, the join to the next with its carrier. Then check:

1. **One recipe per shot, picked by its beat** (§2). A 30-45 s film holds ~10-12 shots (they average >= 3.5 s). A beat
   that fits no recipe is a story question before it is a picture question.
2. **Never the same recipe twice in a row,** except the deliberate match (SR19) and the callback (SR24 back to SR1's
   frame). Neighbours differ in at least one of: the size (>= 1.5x), the device, the camera's height or angle. Never
   three wides in a row, and never three that share a centred landmark on a ground line.
3. **The doses, per film:** the home place's recipes (SR2-SR5, and every shot set in the home place) >= 50 % of the
   runtime outside full-frame charts; the one big move (SR17) once; 1-2 scale moments in all (SR14-SR17, ~1.5-4 s each),
   never two scale wides in a row; each breather (SR16: S2, S4) at most once, never next to SR17; the off-balance (SR18)
   only on the turn; the mirror (SR23) at most once; plain cuts (F) at most 2, only on a "But" turn.
4. **The rhythm is an intensity curve.** Affinity (level lines, close values, one key, slow life: SR2-SR5, SR8, SR16,
   SR23) in the home beats; contrast (a diagonal, the hardest step, a jump in size: SR1, SR15, SR18) at the hook, the
   turn and the payoff. Sizes step 2-3x between neighbours (a push <= 2x per panel, beyond it a push-through), moving in
   toward the close on the personal beat and out to the wide for the system. Shot lengths vary: never three near-equal
   in a row; a breathing shot after a dense or scale beat; the film ends close to the payoff (SR24) and loops.
5. **Every join names its carrier, taken from the recipes' exits:** an opening (SR4, SR6, SR8) leaves by A; a follow
   (SR10) by C or D; the big move (SR17) comes back by A; a pair (SR19) joins by B; the paper (SR22) by A or E; a plain
   cut F only into SR15 or SR18 on a "But". Across a join the subject keeps its screen spot unless the join is about
   movement (eye jump <= 0.10: `CRAFT.md` §a); the midpoint lands on the next sentence's first word; nothing enters in
   the 0.4 s around it.
6. **One camera per set:** W1 names setup A or B, the camera height and the horizon for each set, and every shot in the
   set keeps them; a light never moves between cuts; the key changes only on a story turn (SR19). The "you" is one
   drawing (or POV) for the film, placed by the horizon-cut rule; Pip has a planned hiding spot in each exterior shot
   (>= 250 px from the focal; none in closes and charts).
7. **The focal's path and the value strip:** mark every shot's focal on one 1080 x 1920 sheet (most land in the golden
   box; a jump over ~300 px between neighbours needs a carrier that moves the eye, or is the turn); then one 108 x 192
   notan thumbnail per shot side by side: every focal found in under a second, one hot accent each, no two neighbours at
   the same intensity where the story changes between them.
8. **The phone check:** each chosen frame, and each move's start, middle and end frames, seen at the feed's crop with
   its interface drawn over it (x 98-982, the rails, the name block: V12): no key read under it, the focal in the clear
   window.

*Check 2 at work, on video 4's visual script (an example, not the pass, which follows the owner's settling of this
library):* S10 tilts down with the water (SR10) and S11 trucks along with it (SR10 again): two follows in a row. S11
could hold the camera and let the hot water's front travel the melt line across the frame (SR20, the camera still, as in
17 of the 23 reel shots), so the two shots differ.

## 5. Clashes with the docs in force (flagged for the orchestrator; not edited here)

Each: what the doc says, what this library uses, and the proposal. By the ladder the doc in force wins until the owner
approves the change; a clash is a bug, fixed in the lower doc once he has.

**With `LAYOUT.md`**

1. **The feed's interface** (§1 "platform UI (organic)": "top y < 180; bottom y > 1520; right rail x > 950 at y
   900-1500"; "key-read box": "x 120-950, y 600-1480"; DIRECTION rule 10 points here). Measured on the owner's feed: the
   header reaches y 218-235 with a scrim to ~240; Instagram's rail starts at x 877 from y 1032 (~860 with a repost
   button), TikTok's at x 948 from y 797; x < 98 and x > 982 are cut on his Reels tab; the bottom (y 1519) is exact.
   Rule 1 uses the measured numbers. Proposal (`composition/vertical.md` V1-V4): top y 240; the rails x > 945 from y 790
   and x > 870 from y 860, to y 1520; the key-read box x 130-945 down to y 860 and x 130-870 below it. The code follows
   (`video/src/lib/theme.ts` `safe`, `video/scripts/qa/framecheck.py`: tooling).
2. **The caption's width** (§1 "caption block": "x 95-945 ... <= 850 px wide"). A full 850 px line starts 3 px outside
   the feed's crop (13 px on a 20:9 phone). §0 uses lines <= 780 px (x 130-910). Proposal (V5); `video/src/lib/theme.ts`
   `skyCaption.maxWidth` 850 -> 780 (tooling).
3. **The default horizon** (§1 "sky and horizon": "the default horizon y 768 (0.40 H)") with §2's "angle" row ("eye
   level by default, at or below the person's eye level") and DIRECTION rule 7's "you" near the camera: at eye level a
   standing "you" has its head on the horizon, so with the horizon at y 768 a 180 px "you" stands at y ~757-937, in the
   drop between the words and the focal (R7 forbids a call there). §0 and rule 6 use two setups, A (y 1150-1300) and B
   (y 690-860), named per set in W1. Proposal (`composition/cinema.md` C2-C3, §11.1): §1's default horizon becomes a
   per-setup value.
4. **Two sizes of "you"** (§1 "the 'you'": "head 90-140 px; cut by the bottom edge ... head top y <= ~1380", which at
   7-7.5 heads is a figure of ~650-1050 px). DIRECTION rule 7 (2026-10-29) sets the "you" at ~130-220 px tall, a whole
   figure; DIRECTION outranks LAYOUT, so this library uses 130-220 px (rule 7, SR14) and keeps the near "you" cut by the
   bottom edge only as POV hands (SR13). Proposal (cinema §11.2): the row names the two cases.
5. **Horizons near the half** (§2 "street": "horizon 0.50-0.60 H, VP at 0.60-0.70 W", i.e. y 960-1152 and x 648-756; §2
   "other scale frames": "Eye-height scale shots: horizon 0.52-0.59 H", y 998-1133). Both overlap y 900-1020, the half
   that rule 6 avoids, and the street's vanishing point reaches 56 px past the subject axis. SR3 uses y 1020-1150 with
   the vanishing point at x 540-700 on the subject or hidden; SR15 uses y 1020-1133. Proposal; `COZY_AND_SCALE.md` §2
   carries the same street numbers.
6. **Setup B and the respect rule** (§2 "angle": "at or below the person's eye level"; `COZY_AND_SCALE.md` §5: "camera
   at or below the person's eye level (K10 is a crowd, never one person)"). A camera 3-7 m up sees a person on a lower
   level from a little above. This library uses setup B with the "you" in POV, or seen from behind as the viewer's own
   stand-in, never on a person under critique. The owner's call.
7. **A figure as the subject** (§1 "subject axis and box": "a standing figure 300-650 px tall"; the board lint,
   `STORYBOARD_STYLE.md` §6). SR9's figure on the lit line is 150-300 px, the human size the playbook's DEPTH AND SCALE
   asks for (the reels' figures: 150-226 px at full width). Proposal: in a human-scale frame a figure is measured as the
   "you" (130-220 px) or up to 300 px; the box's 300-650 px stays for a figure-led medium shot.

**With `CINEMATIC_GUIDE.md`**

8. **The opening's timing** ("The opening": "0.00-0.35 s, the scene is made: frame 0 is bare ink lines only; flat colour
   floods in shape by shape within fast but unmistakable"). That is the reference's timing; the guide's own note says
   ~0.3 s was invisible, and the measured swipe settles at ~0.4 s. Rule 13 and SR1 use a bold event of >= 1 s peaking
   after 0.4 s. Proposal (V9): the bullet becomes that floor.
9. **S5's start frame** ("Start (u = 0)": "The two figures ... heads at most ~140 px ... from y 1060, cut at the hips",
   figures of ~1000 px if drawn whole) against DIRECTION rule 7's "you" of ~130-220 px. The owner picked S5 on
   2026-10-26, before DEPTH AND SCALE (2026-10-29); S5's end frame (170-200 px) agrees with the rule. SR17 keeps S5's
   numbers; the owner's call whether the start frame keeps its near figures.
10. **Pushes and tilts** (rule 3: "never a slow pull-out or push in a hold ... A zoom is a visible story move or a
    carrier"; `COZY_AND_SCALE.md` §4 K5: "push 3-8 % in 2-4 s"; K2: a tilt "+ 3-5 % zoom-out"). K5's slow end (3 % in 4
    s) falls under the visible floor of a story move (>= 3 % in <= 2 s), and K2's tilt with a zoom-out is a compound
    move (DIRECTION rule 8). SR3, SR7 and SR14 use the push only as a visible story move; SR10 and SR15 tilt without a
    zoom. Proposal: K5 >= 3 % per 2 s; K2 without the zoom-out.

**With `DIRECTION.md`**

11. **The "you" as the owner sees it** (rule 7: "~130-220 px tall in our 1080 x 1920 frame (the references' people as
    the owner sees them on the phone, full width: 8-16 % of the screen's width ...)"). On his feed the screen's width is
    884 of our px, so 8-16 % of it is 71-141 px, and the feed shows our frame 1.22x larger than a review MP4
    (`composition/vertical.md` §8 row 6). The owner's number stands and this library uses it. Proposal: show him the
    "you" at ~145 and ~200 px at the feed's crop and let him pick.
12. **Cozy and the big sky** (rule 7: "Cozy is the home feeling (>= 50 % of the runtime outside full-frame charts)";
    `COZY_AND_SCALE.md` §2 and 3b.1: a cozy sky 15-30 %, "exposed once the void reaches 36 %"; `LAYOUT.md` §8.1: a sky
    of 45-58 % is "the exposed dose: 1-3 frames a film"). Setup A, the owner's human-scale references and SCENE
    COMPOSITION's big quiet sky (R5: >= 30 %) put 30-65 % sky in a home view (T3's sky, its largest quiet mass, is 39 %
    of the frame; SR2's open variant, SR9, SR14). By those numbers a setup-A home view counts as exposed, so a film
    built on it fails the cozy dose. SR2 keeps the enclosed RIVERSIDE variant (sky 8-15 %) beside the open one.
    Proposal: count a home view as cozy by how the ground is held (masses on 2-3 sides of the belt, one opening, the
    near bank as the refuge), with the sky as its top quiet field; the owner decides on the look test of setup A beside
    v6's view.

**With other docs** (outside the three asked for, listed so nothing is lost)

13. `ORGANIC.md` §4.4 R7 (carried into `CRAFT.md` as a WARN: the focal's centre at y 860-1200): in setup A a subject on
    the horizon belt sits at y ~1100-1300. Rule 3 allows a setup-A focal to y ~1250 as a declared case, or puts the
    focal on something that rises above the horizon (a lit window, a tower). Proposal (cinema §11.3).
14. `video/docs/G3_ANIMATIC.md` §4 (a gate spec, ranked above this page): a plain cut needs ">= 20 % size or >= 30°
    angle change". Rule 11 asks >= 1.5-2x in size (film's "20 mm / 30 degree" guideline and 2D layout's 6-12 field
    ladder: cinema C4). The gate spec's 20 % stands until changed; proposal C4.

## 6. Sources

The evidence and every source are in the four research notes: `composition/reels.md` (the owner's five reels, watched
frame by frame and scored with our notan check), `composition/cinema.md` §12 (S1-S20: Poore 1903, Dow 1899, J. T. Smith
1797 via the rule of thirds' history, the golden ratio's and dynamic symmetry's construction, Disney's staging,
eye-tracking studies of scenes and film, aesthetic studies of framing, shot sizes and angles, lead room and the
repoussoir, the multiplane camera, 2D layout practice, contrast and affinity, colour scripts, Guo Xi's three distances,
the 30-degree rule), `composition/vertical.md` §10 (V1-V15: the platforms' safe-zone files measured on their pixels, the
owner's screen recordings measured, eye-tracking studies of vertical and short-form video, subtitle guidelines,
reading-size research), and `organic/composition.md` §8 (notan, the steelyard, staging). The owner's references:
`refs_composition/`, `refs_human_scale/`. Nothing from them is traced or copied; we measured them to learn methods.
