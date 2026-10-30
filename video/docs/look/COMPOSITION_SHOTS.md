# COMPOSITION_SHOTS: the shot library (composition recipes for our 9:16 films)

The owner (2026-10-30): "After we are done with this I want you to do another research and distill of the composition
shots to use / Take a look at this folder I collected some initial references but do the deeper research"
(`refs_composition/`). Earlier the same day: "8 agreed this is an important point about scene composition"; on still
v6: "our scene is very busy". Then (~14:10 UTC): "When we settle on the composition library recipes and overall approach
we need to evaluate our visual script for Helsinki story to figure out how to compose each scene and how we animate and
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
from here. We learn principles from the references and sources: no frame traced, copied or used as an input, no
creator named, no living artist as a style target.

**Conventions.** Px at 1080 x 1920, y down; W = 1080, H = 1920. "The feed" = the owner's Instagram Reels tab on his
phone (it shows x 98-982 of our frame, 1.366x larger than our pixels). "The 'you'" = the film's one stand-in for the
viewer. **Scene 1** = v2's opening at the King's Cross canal on an October dusk ("She quit Google."; still v6; the lit
doorway with her silhouette in it; the value thumbnails T1-T3). **Video 4** = Helsinki's AI-heated homes on a snowy
winter night (its G2.5 visual script: 12 shots S1-S12 on one continuous camera, 42.24 s; the warm water the thread,
the one window its home spot, the giant computer by the harbour). Carriers A-F are `CRAFT.md` §a's (A push-through, B
thread match, C continuous camera, D object carry or wipe, E card flip, F plain cut). Paths are from `video/docs/look/`
unless they start with `video/`.

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
- **Centre** (540, 960): the first look of every new shot goes here [cinema S7]; 20 px right of the captions' centre line.
- **Thirds** x 360 / 720 (20 px outside the subject axis), y 640 (40 px under the band) / 1280 (30 px under the read
  zone). The feed's own visible thirds fall at x 393 / 687, inside the axis: on the phone "on a third" and "on the axis"
  are the same place. Use thirds as proportions (2:1), never as hot spots.
- **Golden section** x 413 / 667 (the axis), y 733 / 1187; the stage square's y 951 / 1169. Our layout already sits on
  this grid (`composition/reels.md` §0).
- **Diagonals:** the full frame's is 60.6 degrees from level (it reads as a climb), the stage square's 40.4 degrees
  (the comfortable "dynamic" one). The golden spiral's pole and the dynamic-symmetry eyes of the full frame land in the
  band (y ~461-656) or near the bottom UI (y ~1265-1459): never a placement grid for us.
- **Angles on the feed** (32 cm from the eye): 74 px = 1 degree; the eye's sharp centre covers ~150 px; while it rests on
  one spot it previews ~370 px around it (5 degrees); the "you" at 130-220 px is 1.75-2.97 degrees.

**Two camera setups for an exterior** (`composition/cinema.md` §3; proposal C2-C3). With a level camera at height c,
every standing figure of height h drawn P px tall on the camera's ground has **feet at y_h + P·c/h and its head top at
y_h - P·(h - c)/h** (y_h the horizon): at eye level every standing head sits on the horizon, near or far. So the
horizon and the "you" fix each other:

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
   point) sit inside x 130-945 from y 600 to 860 and inside x 130-870 from y 860 to 1519; nothing to read above y 240
   or at y >= 1519. Only masses run into x < 98 or x > 982 (never on the owner's feed), under the rails and under the
   bottom UI; a thing cut by a side edge must still read with its outer 98 px gone. On the phone, words in the world
   are >= 56 px (the floor of fluent reading is a 17 px x-height), lines >= 2 px, a figure "doing what" >= 40 px and
   reliably 60-80 px. *Measured on the owner's recordings: `composition/vertical.md` §1, §3.4 (V1-V4, V7); proposal
   where it differs from `LAYOUT.md` §1 (§5 row 1).*
2. **Three stacked pictures.** The words' sky (y 0-600: the band one flat field, no tops, lines, heads, props or shadow
   edges across it), the stage (y 600-1520: the story) and the near band (y 1250-1920: one quiet mass under the app's
   text, where light detail loses 10-20 % to the scrim). Depth stacks UP the frame: the near at the bottom, each farther
   plane higher, overlapping by >= ~10 px, no two plane tops within ~40 px of each other. Width is scarce (884 visible
   px), height is not. One stage, never a split screen: a comparison is a sequence or one frame with a seam (SR20). *A
   landscape picture at full width (1080 x 610-812) maps onto our stage: 16 of the 21 reel focal points land in or within
   40 px of R7's box (`composition/reels.md` §4); cinema §1, §4.8; vertical §2.*
3. **One focal, in its home.** The focal's centre on the subject axis x 380-700, by default within 130 px of x 540 (x
   410-670) and at y 860-1200; its default spot y 950-1050, where the frame's centre (y 960), the stage's upper golden
   line (y 951) and still v6's door (y 965) meet, 400-500 px under the caption block. The drop from the block's foot
   (y 556) is 300-650 px (4-8.7 degrees); the short end (300-450 px, y 856-1006) when captions change every ~1.1-1.5 s
   and the beat is about reading the subject. Nothing calls in the drop. Off the home only for a declared reason: a scale
   shot's landmark on a third (S3, S5), the left-third hero spot (x 200-450, open in `LAYOUT.md` §8.2), the turn's
   off-balance (SR18), a setup-A focal on the horizon belt down to y ~1250 (§5 row 7). *R7; C1; V8. The eye starts at
   the screen's centre whatever the picture holds [cinema S7]; a centred subject in vertical video gave longer
   fixations and fewer saccades than a moving one [vertical V5].*
4. **The focal is one place: the subject, the story light and the hardest value step.** A step of >= 65 L* at the focal
   (e.g., a lit doorway at L* >= 95 with her silhouette at <= 28); below the band no other step over ~40 L* and no light
   within 10 L* of the focal's; the brightest 5 % below the sky within 134-288 px (0.07-0.15 H) of the subject; the one
   hot accent of the scene's colour key only at the focal, everything else tone-on-tone in its mass (dE <= 6-8). At most
   3 regions pull at >= 50 % of the strongest and only one at >= 70 %, in value AND in colour, the strongest on the
   subject. **The lines lead, the light decides:** in 12 of the 20 one-subject reel examples a brighter patch elsewhere
   (a sunlit path, a white car, a corner of sky) beat the subject the lines pointed at; end every line at the light.
   *R3, R4, R11; `composition/reels.md` §0, §6; in force as DIRECTION rules 2 and 5 and playbook PROPER LIGHT (the
   numbers WARN: `CRAFT.md` §b).*
5. **Notan first: three masses, two quiet fields.** At a 1 % squint in 3 values the three largest masses hold >= 85 % of
   the frame (<= 8 masses >= 1 %), one value group holds 40-55 %, the groups' means sit >= 13 L* apart; <= 10 value
   pieces; <= 6 named objects at phone size (the subject, one big soft secondary mass, 1-3 supporting things). >= 65 %
   of the frame is quiet at a squint, in two connected fields: the sky with the band at the top (>= 30 %) and the near
   ground at the bottom (>= 15 %), each patterned within +-4-6 L*, so never a hole; the things live in the belt between,
   the far side's density as texture inside its band. Pip >= 250 px from the focal, tone-on-tone inside a mass, never in
   the drop or on a line into the focal. The dark key (one gentle dark mass, T1, or the references' low key, T3) is the
   owner's pick (`ORGANIC.md` §8 D3). Draw the 3-value notan thumbnail of every shot before anything else. *R1, R2,
   R5, R6, R10, R12; in force as DIRECTION rules 2-3 and `LAYOUT.md` §1's quiet fields.*
6. **The horizon off the half, declared per set.** Setup A y 1150-1300 or setup B y 690-860 (§0); never y 900-1020
   (0.47-0.53 H). The scale and breather shots keep `CINEMATIC_GUIDE.md`'s horizons (S1 lands at y 768, S5 at 883, S3
   at ~1402, S4 at ~1574; K7 y 1114-1229). W1 names A or B per set with its camera height, and every shot of the set
   keeps it. Thirds as proportions: one quiet mass about twice the other, never two equal halves of anything (sky and
   ground, two masses, two lights). *C2, C3, C14; "a much better ... proportion than the precise formal half" (J. T.
   Smith, 1797, via cinema S3); the owner's references put the horizon at 0.57-0.85 H; proposal (§5 rows 3-5).*
7. **People stand by the horizon-cut rule; the "you" is soft, at one side, looking in.** Place every standing figure with
   the formula in §0. The "you": one figure, 130-220 px tall (DIRECTION rule 7), from behind or in silhouette, softer
   than the subject (tier B, its pull < 50 % of the focal's), outside the axis on the side it looks from: x 130-380
   facing right (the default: the rails are on the right) or x 700-830 facing left; its head and shoulders turned so its
   sightline crosses the focal's box; its head top above y ~1380, its body may run under the bottom UI. Lead room: 1.5-2x
   more room in front than behind (a right-facing figure at x <= 410 below y 860, where the rail makes x 870 the edge; a
   left-facing one at x >= 560); a mover's lead room grows through a move. Strangers small (mid walkers 110-260 px, far
   15-60 px), in twos and threes, as texture in their band; never a stranger's back in the foreground. *Cinema §3.2,
   C9; vertical §7.1; `LAYOUT.md` §3 people; the reels put one small figure where the lines meet in 11 of 24 examples,
   8 of 12 measured at 150-226 px at full width (`composition/reels.md` E1).*
8. **One device per shot, and it delivers the eye to the focal.** Name one device (an opening, leading lines, one point,
   an S or C curve, a pattern with one break, the cross, scale, symmetry, the pyramid, one diagonal); a second only when
   it points at the same focal (a doorway whose sill is the leading line). Lines rise from the near band (or drop from the
   words) in 2-3 legs of >= 150 px that alternate sides, at ~40-60 degrees on the ground, and the last leg ends within
   40 px of the focal's box; no line runs corner to corner unbroken, crosses the band or runs past the focal into an
   empty vanishing point; the vanishing point sits on the subject (within 60 px) or hides behind it or a mass. An inner
   frame is one opening of 15-30 % of the frame, its aperture >= 10 L* off its rim. A pattern is one texture inside one
   mass (its pieces within +-6 L*) with one break, the call; never two. *C6, C7, C14; cinema §4; the reels teach one
   device per example (`composition/reels.md` §0).*
9. **One soft counterweight, high or on the far side.** The focal 0-130 px off x 540 is balanced by one counterweight
   >= 300 px out on the other side (x < 240 or > 840), bigger and softer, its pull < 50 % of the focal's, never isolated
   and crisp: by default the hero cloud in the top gutter (y 0-290, cut by a side edge). Never a counterweight in the
   lower right (x > 830 below y 790): the app's rail and name block already weigh there. The words are a heavy top; the
   near dark mass balances them low. *C8, R8, V11 (the steelyard: Poore 1903, Payne 1941, via cinema S1 and
   `organic/composition.md` §8).*
10. **The near frame is a hint at the edges.** >= 2 things cut by the frame edges in every shot; the near frame holds <= 2
    props, cut by an edge, inside the near ground's shade mass (within 8 L* of it); a repoussoir on one side only, cut
    by that edge, <= 216 px (20 % W) wide; never half the frame, never a blur. Found edges (crisp, the hardest step)
    only at the focal; lost where two masses sit within ~10 L*. Contours overlap by >= ~10 px or keep >= ~20 px apart,
    never a tangent on a start or end frame. *R6, R9, C13; playbook DEPTH AND SCALE ("a small, subtle hint at the
    edges"); `composition/reels.md` C2, E5 (the reels' big blurred near layers are what we don't take).*
11. **Sizes step 2-3x; an angle means something.** Sizes are set on the beat's subject (we draw no faces): extreme wide
    (the place; the "you" 60-150 px in a K wide), wide (the subject 15-35 % of the frame's height in its place), medium
    (the subject box 270-460 px wide), close (one object >= 60 % W, >= 650 px), insert (one detail filling the stage).
    A push is <= 2x per panel (beyond, a push-through A); a plain cut F changes size by >= 1.5-2x or angle by >= 30
    degrees, or keeps the exact frame (a deliberate match). Eye level by default; a low angle only on the quantity,
    never on the thing under critique; a high angle only on crowds, patterns and maps, once a film; overhead only as
    paper; never a tilted horizon (no roll). *C4, C5; `LAYOUT.md` §2; `STORYBOARD_STYLE.md` §4, §7.*
12. **A move is three designed frames, and the subject is its pivot.** The start, middle (p 0.5) and end frames each pass
    rules 1-11 as stills (the middle at least the band and tangent checks); one variable per move (size, height or what
    is revealed), on one ease; no roll, no compound move. The subject holds its screen spot within +-40 px while the world
    moves (a push scales about the target's own centre), or travels one path between two points of the golden box; the
    still thing among moving planes wins the eye [cinema S6]. Often the camera holds and the subject travels the
    device's line: 17 of the 23 reel shots are locked or nearly while a figure runs down the pier, walks into the
    spiral's eye or crosses the gate (`composition/reels.md` E9). The band is a fixed mat: one flat field at every frame,
    crossed by a plane's edge only in the gutters. Holds are locked or the parallax float (8-15 px/s), never a zoom;
    one speed budget (~15 px per frame at 60 fps). *C12; DIRECTION rule 8; `CINEMATIC_GUIDE.md` rules 1-3.*
13. **Frame 0 peaks after the swipe settles.** The next reel slides up and settles in ~0.4 s (half its travel in 0.07 s,
    measured): the opening's bold event lasts >= 1 s and makes its biggest change after 0.4 s (its first strokes may run
    under the slide). Read as one gist at 0.25 s: one subject on the axis, >= 400 px wide (45 % of the visible width),
    with the hardest value step; the first spoken line in the band from frame 0; nothing important in the bottom 400 px
    or the outer 98 px. *V9; `composition/vertical.md` §4; the playbook's Hook ("~0.3 s was invisible") is explained by
    the swipe.*
