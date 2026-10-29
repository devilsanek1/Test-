# LAYOUT: where everything sits in the 9:16 frame (zones, shot framing, composition, the cover; every video)

The owner (2026-10-28): "layout is a big aspect. I think we've discussed a bunch of it already, perhaps we can
consolidate the previous discussions and reconcile it with your findings here". This page is that guide: every layout
and composition rule and owner note we had, de-duplicated, each number with its source (§1-6); the places where the
docs disagreed, resolved (§7); and the city-poster study's layout findings, each marked with its status (§8). It
consolidates the study's `layout.md` (Part A and Part B) and `STUDY.md` (`docs/studies/2026-10-28_city_posters/`).

**Rank and scope.** A look doc on DIRECTION's ladder: under the owner's words, DIRECTION, CRAFT, PIPELINE_V2 and the
gate specs, it wins on its own topic, the frame: every screen position and size (the zones; where the subject, the
people and Pip sit), each shot type's framing (horizon, sky share, masses) and the cover. It is the one definition of
the screen zones: `G5_BLOCKING.md` §2, DIRECTION rule 10 and the look docs point here. Its composition and across-shot
sections (§3-4) gather rules that live higher up (DIRECTION, CRAFT, the playbook) or in a recipe doc, each with its
source: the source wins, and this page is fixed to match. The recipes stay where they are: `CINEMATIC_GUIDE.md` the
shot recipes and camera moves (S1-S5, the scale cues), `COZY_AND_SCALE.md` the cozy and scale doses,
`LIFE_AND_DENSITY.md` fullness and life, `STORYBOARD_STYLE.md` the board's drawing. A framing number quoted here from
them matches them; a mismatch is a bug, fixed in the same turn. This page records the look as it stands, never a freeze
(the owner: "our look is evolving - we are finding out style i don't think we can overfixate on this"): each film may
carry its next step. **Status:** §1-7 are in force, except what they mark as open or proposed. §8 marks each line
**[owner]** or **[owner-decided (2026-10-29)]** (in force), **[open]** (the owner's call) or **[proposal]** (ours, to be seen in a look clip): a proposal
is never a rule until the owner approves it.

Px at 1080 x 1920, y down, screen space; H = 1920, W = 1080. Diagram: `docs/studies/2026-10-28_city_posters/img/layout_zones.jpg`
(drawn by `scripts/look/posters/layout.py`; `--measure` re-runs the measured numbers). Sources (paths from
`video/docs/`): DIR `look/DIRECTION.md` · PB `OWNER_PLAYBOOK.md` · CR `look/CRAFT.md` · CS `look/COZY_AND_SCALE.md` ·
CG `look/CINEMATIC_GUIDE.md` · SB `look/STORYBOARD_STYLE.md` · LD `look/LIFE_AND_DENSITY.md` · G5 `G5_BLOCKING.md` · VT
`look/research/vertical.md` (the evidence) · one film's values, as examples: v2S `v2/STYLE.md`, v2T
`v2/THROUGHLINE.md`, PK `v2/POSTING_KIT.md`, v3P `v3/POSTING.md`, v3CP `v3/camera_plan_g3.md` · the study
(`studies/2026-10-28_city_posters/`): ST `STUDY.md`, CO `composition.md`, PE `perspective.md`, P1 `pro_1_depth.md`, P4
`pro_4_colour.md` · code: `src/lib/theme.ts` (`safe`, `skyCaption`, `world`), `lib/sky.tsx`, `lib/particles.tsx`,
`scripts/capcheck.py`, `scripts/qa/framecheck.py`. The v1-era docs (`style_bible.md`, `ENGINE.md`) are never a layout
source here: their captions at the bottom and big near people are history.

## 1. The frame (9:16 zones)
The owner on the frame: "One thing I don't like is this white part at the top of the reel. Looks like it was screen
recorded from some other video?" (v1, 2026-10-25); "check out the text capture. Is it intentional effect?" (v1,
2026-10-25: the clipped caption roll); "why is it blue sky and then suddenly abruptly orange, weird" (v2 G4, 2026-10-27).

| zone | numbers | what goes there | sources |
|---|---|---|---|
| canvas | 1080 x 1920, 60 fps; the world = the canvas at camera rest; author 140 px past every edge (pushes zoom out up to ~12 %); a float keeps >= 40 px overscan; a rise-over draws its layers ~500 px taller | | theme.ts `world`; CS 3b.5; CG S1 |
| platform UI (organic) | top y < 180; bottom y > 1520; right rail x > 950 at y 900-1500 | masses and dressing may run under it (kerbs, the edges of things, a foreground cut by the bottom); key information never (the subject's action, a small figure, a label, a number, the pop, a contact point; a big near "you" may be cut there, its head above: the "you" row) | G5 §2 and CS §5 (moved here); theme.ts `safe`; framecheck; LD §8 |
| ad overlay (a boosted post) | top 240-288; bottom 35 % (y > ~1250); rail x > 780 from y 840; sides 48-192 (REPORTED) | a cut made for ads keeps its key reads above y 1250 and, below y 840, left of x 780 | VT §2; G5 §2 |
| top gutter | y 0-290 | framing only: a top-edge object (a lamp, branches, a beam; a whole lid from a high angle), wires (only here and below y 600), the jagged skyline and its sky, the hero cloud (v2 S1: y 120-280); a credit tab y ~185-288 (v2); never a paper edge | CS §2, 3b.2-3b.3; VT §1; v2S §5; G5 §5; PB |
| caption band (keep clear) | y 290-600; its flat field spans at least x 95-945 (full width where the sky fills it) | ONE calm flat field: outdoors the one sky (DIR 6), elsewhere a flat light wall or facade (L* >= 70; a cozy lid or far row L* >= 75); no lines, detail, roof tops, heads, props, shadow edge or texture across it; weather at half density at most (flakes <= 6 px); tops of towers, discs and clouds at y >= 600 unless the film declares an exception (v2 S1: its planting to y 575) | DIR 6, 10; CR §c, §d.9; CS 3b.2, §2; LD §8; CG rule 2; `particles.tsx` |
| caption block (the ink) | y 317-556, x 95-945: Patrick Hand 98 px, baselines 387 / 510 (one line 448), centred on x 520 (left of centre: clear of the rail), <= 850 px wide, <= 2 lines of ~20 characters; highlight boxes reach y 299 | pops in place in screen space, never on a camera layer, never clipped; a change at least every 1.5 s; ink >= 7:1 on its field; the sky flat to dL* <= 1.5 across it; frame 0 shows the first spoken line as a normal caption, never a title over it | theme.ts `skyCaption`; CR §g.1; `sky.tsx`; CS §5; G5 §5; PB Hook; capcheck |
| read zone ("the stage") | y 600-1250, x 120-880 | the beat's subject and its action, staged here (the board: SB §3); a cozy shot's one opening; on a cut made for ads, every key read | SB §3; CS §2; VT §0-2 |
| key-read box (organic) | x 120-950, y 600-1480 | the outer limit for any key read on an organic post (a label, a number, a contact point beside the subject) | G5 §2 (moved here) |
| subject axis and box | x 380-700; the subject 270-460 px wide (35-60 % of the 760 px stage; a standing figure 300-650 px tall), 80 px clear round it; <= 2 points of interest in a scale shot, inside x 380-700 | the beat's subject (tier A); a scale panel inverts it (>= 60 % of the frame, or cut by both sides) | SB §3 and its lint; CS §5 (moved here); VT §0, §3 |
| side margins | nothing key within 120 px of a side edge; the gutters beside the block (x < 95, x > 945) may hold quiet detail and may rise through the band's height | | CS §2, 3b.2; SB §3 |
| bottom third | y 1250-1920 | masses: the foreground cut by the bottom edge, in mid-tones with its small darks (CR §f.8), a big near "you" that reads by mass; quiet only when it is the frame's one quiet field (next row) | LD §0; VT §1; CS 3b.2 (§7 row 14) |
| the one quiet field | one band touching the top or the bottom edge (the sky, water, a floor), 15-35 % of the frame (a bounded floor seen from a balcony up to 50-60 %), patterned, in at most one of the thirds (y 0-640 / 640-1280 / 1280-1920): when it is the sky, the bottom third holds things; when it is a floor or water, the top holds a lid or a skyline | elsewhere no hole over ~200 px and no flat region over 20 %; drawn detail in most 240 px bands | LD §0, §2, §8; CS 3b.1, 3b.3 |
| labels and marks | world labels at y 600-1480, never in the band; the draft label bottom-left, y > 1850 (drafts only); the G3 notes strip y 1680-1920 (the board only) | | G5 §2 (moved here); SB §3 |
| paper edge (opt-in) | the sides from y >= 640 and the bottom, inset 12-40 px, 'paint-subtle' at most | never at the top of the frame or beside the band; each film decides with its G4 look clip | PB; DIR 10; CS 3b.7; EDGES (its code paints past the top since 2026-10-25) |
| sky and horizon | the sky is ONE gentle gradient from the frame top to the horizon; the default horizon y 768 (0.40 H, reference 2's median); by shot type: §2 | measured (`layout.py --measure`): the flat field behind the captions ends at y ~580-750 in v1 and v2 (medians 684 and 621); v3's interiors keep a flat wall to y ~1000-1380 | DIR 6; CR §g; theme.ts `world` |
| Pip | hidden in a spot of the world (a window, a boat, a balcony, a crowd), ~40-90 px, <= 1 % of the frame, off the subject's eye path, found on a second look; a quiet "find Pip" in most exterior shots, none in closes and charts, hidden on the cover too (owner, 2026-10-29); its spots planned at G3 (W1 names them) | never in the band, a right rail (organic or ad) or over the subject; never a join's carrier or a scale anchor; a hop keeps its arc at y >= 600 | DIR 1-2; CR §b; LD §5 |
| the "you" | one drawing or POV for the whole film; head 90-140 px; cut by the bottom edge: its body may run under the bottom UI (it reads by mass), its head stays above it (head top y <= ~1380); POV: hands cut by the bottom | in the foreground only it (or Pip, hidden); never strangers' backs | LD §4; CR §a.3; VT §1 (§7 row 10) |
| the cover | the grid's 4:5 centre crop y 285-1635 (1080 x 1350); the newer 3:4 crop y 240-1680 (1080 x 1440) | the title and the subject inside the 4:5 crop (§5) | PK; v3P |

**The code must match** (tooling, flagged, not yet changed): theme.ts `safe` (the UI zones and rail as above; its
`action` box x 90-990, y 200-1480 is looser than the key-read box), `skyCaption` (the block; its clip window y 280-570
predates pop captions, which need no clip), `scripts/capcheck.py` (x 90-990, y 280-570) and `scripts/qa/framecheck.py`
(the organic UI zones; `--caption-band 280,600`) differ from the band; `particles.tsx` (x 95-945, y 290-600) and
`sky.tsx` (the block, dL* 1.5) match. One constant the checks read, or a check that compares them, is the tooling
lane's (§7 row 19).

## 2. Shot grammar (where things sit, per shot type; the moves and timing stay in the recipe)
The owner: "there are videos that make it feel big and some that make it feel small ... arcane cinematic shots always
made me feel scale" (2026-10-24); "I do like the bigger scale scenes occasionally ... Another visual twists I think we
should rely on is a feeling of coziness via 1. Enclosure view" (2026-10-25); of the S5 pull-back: "It has pretty much
everything: suspense, sense of scale, fantastic environment and composition" (v3, 2026-10-26).

| shot | framing (numbers) | dose and use | recipe |
|---|---|---|---|
| home place, cozy (NOOK, LANE, BALCONY, RIVERSIDE) | masses on 2-3 sides, 35-70 % of the frame, >= 40 % of the perimeter closed; ONE opening 15-30 % read in y 600-1250, >= 10 L* off its surround; refuge 35-55 % on >= 2 edges plus a top-edge object in y 0-290; asymmetric for the captions (one tall side cut by the top, flat through the band; the other side tops out below y 600); the subject's head at 0.45-0.60 H, back to a wall, facing the opening. Bands: BALCONY lid 0-600 (one flat facade across the band), life 600-1250, floor 1250-1920; RIVERSIDE sky and skyline 0-290, one flat far row 290-600, facades 600-1000, dark belt to 1115, lane to 1230, bank to 1420, water below | >= 50 % of the runtime outside full-frame charts; opens the film, returns on the quiet beat, hosts the callback; locked or the parallax float; its establishing view may be the designed view (one far stage: CR §f.5; owner, 2026-10-29) | DIR 7; CS §1-3b; SB §7 |
| street | horizon 0.50-0.60 H, VP at 0.60-0.70 W; H:W 1:1-1:1.5 cozy (1:2 baseline, >= 1:4 exposed); >= 75 % of each side continuous; one long sight line at most, ended by one object (a hidden VP is the coziest) | | CS §2, 3b.1 |
| close (an object) | drawn at its size, the biggest whole thing in frame (>= 60 % W) at the ladder's small end; reached by an A or C push of at most 2x per panel, or an F cut-in on its axis on a "But" turn; never a face, never a person as the subject | "close for the personal beat" | SB §7; CG "Not for us"; PB; v3CP S16 |
| chart, number | paper in the place the camera is already in (a printout, a phone, a board), straight-on and level; full-frame it is the subject, >= 60 % of the stage wide; axes an L, one line or 3-5 bars, <= 2 axis words at 56 px; one number 120-160 px on what it measures | entered by a push (A) or a card flip (E); counts neither cozy nor scale | CR §a.2; LD §7; SB §3, §7; CS §1 |
| scale: the ONE big move (S1 rise-over or S5 pull-back) | the world keeps going past every edge (near side masses x 0-30 % and 78-100 % W cut the far rows); 5-7 planes, each 2.2-3x smaller; one landmark huge yet far, 1.1-1.4 F over the horizon, top y >= 620, on a third (S5: centre (760, 760)); feet 2-3 F under the horizon; sky 30-40 % with a hero cloud >= 1 W behind the landmark. S1 starts at 0.37 H with the wall and the "you" filling the bottom 25 %, lands at 0.40 H (the city in the lower 60 %). S5's end: 0.46 H, the figures (the "you", with a companion only if W1 names one; never Pip) at x 420-560, feet y 1490 | 1-2 scale moments per film, ~1.5-4 s each; never two scale wides in a row; a beat of agency within ~5 s; the landing's end frame may be the designed view (CR §f.5; owner, 2026-10-29) | DIR 7; CG S1, S5, "Scale cues"; CS §1, §4 |
| other scale frames | K1 close -> wide (a plain cut, F); K2 tilt-up (horizon 0.40 -> 0.70 H, the top lands at 0.08-0.15 H); K6 locked tiny-figure wide (the observer on the axis, a colossus cut by the frame, >= 10:1); K7 worm's-eye (horizon 0.58-0.64 H, the observer's feet above y 1250; the colossus >= 0.7 H cut by the top); K10 high angle (0.15-0.30 H, on a crowd, never one person, once). Eye-height scale shots: horizon 0.52-0.59 H (the top edge >= 45° up, the feet above y 1250); a 0.3 m camera allows 0.64 H | the low angle goes on the quantity, never on the thing under critique | CS §4, §5 (moved here); SB §7; VT §1 |
| tiny anchors (sizes) | the K wides' observer ~0.03-0.08 H, 60-150 px (floor 40, fill only below 80; the K1, K4 and K6 recipes aim at 0.04-0.08 H; the board draws >= ~80 px for its cold read); S5's end, the figures 170-200 px (F); always the "you" (or a companion W1 names), never Pip | the stage's only high-contrast mark | CS §4, §5 (moved here); VT; CG S5, "Scale cues"; SB §7 (§7 row 6) |
| breathers | S2 sun behind the roofline (a ~650 px disc at (580, 1060), the roofline top y ~1500; the disc one step off its sky unless it is the shot's "look here": CR §g.2); S3 big sky, one landmark (horizon ~0.73 H, the landmark on the left third x ~220-420 up to y >= 600, sky ~70 %); S4 low horizon (0.82 H, a promenade band in the bottom 15-18 % that may run under the bottom UI as a mass; a figure, if any, is the "you" with its feet above y 1480, on a wall or a step) | S2, S4 once each at most; never back to back with S1 / S5 | CG S2-S4, rule 5 |
| the opening (frame 0) | ONE continuous shot, never still: the scene drawn on in the clean pen as a bold event (the subject's line, pale C shapes, the colour flood over the line); frame 0 shows the first spoken line as a normal caption (no title over it); the hook made physical, the expected thing then reality overtaking it at ~2 s through the real mechanism (v3: the cause outside the home window x 180-900, y 630-1060, the effect in the hand cut by the bottom); a visible story move (>= 3 % in <= 2 s) or a locked / floating hold | nothing scale before 3 s unless the move IS the claim; loops to frame 0's drawing state | DIR 9; CG "The opening"; PB Hook; G5 §5; CS §5; SB §7; v3CP O1 |
| angle | eye level by default, at or below the person's eye level; vary angle and size on purpose (close for the personal beat, wide for the system); never three wides in a row sharing a centred landmark on a ground line; a queue reads in depth from slightly above | | CS §5; SB §7; v2S §6 |

## 3. Composition
- **One subject at a time** (DIR 2; CR §b; the owner: "too many moving parts and I'm not sure what to keep my
  attention on", v3 G5b): tiers by story role; A (1-3 objects) owns the contrast, the hero colour, the deepest shade
  step (no tier draws an outline: DIR 4) and >= 60 % of the motion. It sits on the subject axis in the read zone (§1), with the brightest area (DIR 5)
  and the heaviest area at a squint (CR §f), a calm ring of one value 30-60 px round it (LD §2; the board: 80 px clear);
  any figure moving over 5 % of the frame is the subject (CR §b). On screen: before left, after right; more goes up or
  taller; time runs left to right (SB §3).
- **Enclosure: held, not shut** (DIR 7; CS §1-3b, which wins on the doses): canyon >= 2:1 with sky <= 10 %; cozy
  1:1-1:1.5 with an opening 15-30 %; baseline 1:2, sky ~30 %; exposed >= 1:4, sky >= 36 %. ONE opening the subject
  faces; a closed vista; the viewer as the refuge; life passing sideways in one band (nothing comes at the lens); the
  far side and the edges hold 3-6x the detail of the calm centre or floor; the value sandwich (the darkest mass right
  behind the light figures); the perimeter 5-8 L* darker through the masses, never a vignette.
- **Depth planes** (DIR 2; CR §f, which wins; the owner: "no distance effect nor perspective; similarly the bottom part
  ... little to no perspective or depth at all", v2 G4; "something WAY further out that gives me a sense of scale", the
  posters): plane 0 is the subject's, -1 and -2 nearer, +1 to +4 farther; 4-6 per shot, 5-7 on a vista (the board
  stages near / mid / far and lists every plane: SB §3, G3's `planes`); one flat step per plane toward the air (k 0 /
  .12 / .22 / .40 / .65); the subject never shares a value with what is right behind it (counterchange; overlap, never
  a tangent); ONE camera for every ground, wall and figure (sizes fall with distance, never a nearer thing smaller per
  metre; the designed view's far stage, in two frames a film, aside: CR §f.5); the ground recedes (<= 65 % level lines, >= 20 % to the VP); >= 2 things cut by the frame edges in every
  shot; in a scale wide nothing ends inside the frame. The value range across the planes: CR §f.8.
- **Leading lines** (CS §2, 3b.2; CR §f.4; CG "Scale cues" 8, S5): the ground's joints and kerbs run to the VP; one
  long sight line, ended by one object; BALCONY's C-curve enters just under the band (y 600-700), leaves at y 860-1060
  and dives under a mass through a mouth <= 8 % of that edge; in a scale wide lines lead UP to the landmark (a canyon VP
  over the figures' heads, a skyline stepping up, one diagonal at its base; the rail the one level line).
- **People** (DIR 3; PB; LD §4; the owner: "don't use big models of people; the people in the first example video are
  the right direction", v2): small, from behind or rear 3/4, no faces; near heads <= ~140 px, mid walkers 110-260 px
  tall, far 15-60 px fill only, window people 12-40 px; RIVERSIDE seated ~85 px, standing ~140 px; BALCONY 70-190 px in
  the life band; v2: no figure over ~260 px, no tier-B figure over 3 % of the frame; about half at rest.
- **Words in the picture** (PB; SB §3; LD §7; the owner on v3: "Also this text is weird", of 11-13 px source lines):
  few and big, each read at phone size at a glance (every word checked at 0.25 scale) or not drawn: >= 56 px for any
  word a viewer must read (the board's lint floor 48 px); on a real object, straight-on and level; at most one label
  (56-72 px, within 40 px of its object, no box) and one number (120-160 px) per panel; no sources or fine print (they
  go in the post's text); never the same words twice on screen; nothing in front of words while they are the beat;
  nothing in the caption band; the core line as a title only on the cover.
- **Where the calm goes** (LD §0, §2; CS 3b.3; the owner: "way too empty", "less prescriptive on the amount of
  objects", v3 G5): calm only at a frame edge (the one quiet field), round the subject or behind the captions, never a
  slab mid-frame; in a scale wide the detail peaks just under the horizon (CG "Scale cues" 4).

## 4. Across shots
- **Joins and carriers** (DIR 1; CR §a; G5 §2's engine table; the owner: "no clean transitions, just a bunch of shots
  put together", v3 G5b): A push-through into a thing shown >= 0.5 s; B thread match, the thread in the same screen spot
  (±8 %) and size (±20 %); C one continuous camera; D an object leaving one edge and entering the next shot from the
  opposite edge at the same speed; E a card flip of the same paper; F a plain cut, at most 2, on a "But" turn, the
  thread on both sides, changing size or angle (a deliberate match keeps the exact frame: SB §7). The midpoint lands on
  the next sentence's first word; nothing enters, pops or turns in the 0.4 s around it (<= 4 movers); eye jump <= 0.10,
  colour shift <= 15, carry >= 0.25 (CR §a). The subject keeps its screen spot across a cut unless the cut is about
  movement (SB §3). Never two scale wides or breathers in a row (CS §1; CG rule 5).
- **Screen space is a fixed mat:** the captions, the paper edge and the UI never move with the picture (CS 3b.5); the
  parallax float is home by every join and on every map-critical frame (DIR 8). A light never moves between cuts (DIR
  5); v2's sun stayed at screen left on every north-facing shot and kept its spot through both sun push-throughs (v2T §5).
- **The thread object's spot** (CR §a.1; G3_ANIMATIC: the board draws its path and home spot): on screen >= 80 % of the
  runtime, no gap over 3 s (the declared scale reveal and fairness stretch aside); when the shot is elsewhere it keeps
  a home spot (a corner, the window, the phone); it reacts at the end of every cause beat. v2: W (860, 700) 150 x 170
  and M (335, 785) 133 x 164, the same spot and size across its B matches (v2T §1, §3).
- **Pip's spots** (the owner, 2026-10-28: "keep it, but not as obvious ... hide it deliberately in the video"; DIR 1-2;
  CR §a.3, §b; LD §5; PB): never a join's carrier, no longer on both sides of every join; it hides in a spot of the world
  (a window, a boat, a balcony, a crowd), off the subject's eye path, found on a second look; G3 plans the spots and W1
  names them. v2's seats (y 1050-1410, x 360-700, within ~200 px across each join: v2T §1, §3) are history.
- **The "you"** (CR §a.3; LD §4): one drawing or POV for the whole film; the callback keeps the opening's exact end
  frame (SB §7; v3: S15 = O1's end frame).

## 5. The cover and the profile grid
- **Decided:** the core line as a title belongs on the cover, never over the film's captions (PB Hook; the owner: "Wait
  why do we have the text repeat itself?", v3); our covers read as one series on the grid ("the cover's layout" is part
  of the one look: PB ONE LOOK, ONE BRAND); the cover is a frame of the film's own scene code without captions, draft
  label or paper edge (PK: v2 S1 frame 312; v3P: frame 192); the title in the caption type with the peach box on its
  key words, inside the 4:5 centre crop y 285-1635 (and the newer 3:4 crop y 240-1680), read at 360 px wide; no source
  line (PK); Pip hidden on the cover too, as in the film (owner, 2026-10-29: ST §9 decision 5).
- **Measured** (`layout.py --measure`): all three covers put the title on the band's flat field with the world below:
  v1 two lines y 311-538, x 85-925, sentence case, box y 420-531; v2 three lines y 312-559, x 124-953, ALL CAPS, box y
  477-576, in the sky above the roofline (first non-sky row y 590: PK); v3 two lines y 333-552, x 163-878, sentence
  case, box y 428-615, on the room's wall above the window. Each title starts 26-48 px inside the 4:5 crop's top. Pip is
  plain to see on all three (v1 bottom right, v2 on its post mid-frame, v3 at the window).
- **Open (the owner's call):** the case (v2's capitals or v1's and v3's sentence case; one template either way:
  "a coherent style across all videos sharing one look, one brand"). Pip on the cover was the other call: decided
  above (2026-10-29). The cover frame the posters suggest is a proposal (§8).

## 6. Checks (each number lives in §1-5)
- `scripts/qa/framecheck.py`: the organic UI zones (WARN); a WARN on the ad rail too is tooling (§7 row 4).
- `scripts/capcheck.py`: the caption block's contrast (FAIL when > 5 % of the near background is under 3:1);
  `lib/sky.tsx` `skyProblems`: the sky's flatness behind the block (CR §g).
- The board lint (`G3_ANIMATIC.md` §7; SB §5-6): the subject box, the band, words >= 48 px.
- `scripts/qa/check_depth.py`: the planes, separation and the receding ground (CR §f).
- By eye: every word at 0.25 scale; the cover at 360 px wide; the frame at phone size, sound off, squinting (the eye
  is on the beat's subject).
- Proposed: `scripts/look/posters/composition.py frame` (the overlay and numbers on any 1080 x 1920 still) promoted to
  `scripts/qa/check_composition.py` (CO L8, cost M) [proposal, §8].

## 7. Where the docs disagreed, and how it is resolved (2026-10-29)
By the ladder (DIRECTION's intro) and the owner's newest words; the study's `layout.md` §6 has each row's full
evidence. "Fixed" names the lower doc changed in the same pass (the list: the study's `INTEGRATION.md`).

| # | topic | resolved | why | fixed |
|---|---|---|---|---|
| 1 | the caption band's range | two names, one value each: the band (keep clear) y 290-600; the block (the ink) y 317-556 | DIR 10 names the band; CR §g's flatness and the ink are the block's | CS intro, §2, K2, K7; CG notation, rule 2, cues 9, 11; CR §g.1 names the block; DIR 10, G5 §2, LD §8, SB §3 point here; the code: tooling (§1) |
| 2 | what fills the band | one calm flat field: outdoors the one sky, elsewhere a flat light wall or facade | DIR 6, 10 over CG's "plain sky in every frame" | CG rule 2 |
| 3 | where key reads may go | the subject staged in the read zone (y 600-1250, all docs agree); any key read on an organic post inside the key-read box (x 120-950, y 600-1480); a cut made for ads above y 1250 and left of x 780 below y 840 | the ladder: G5 §2 (a gate spec) over the look docs and VT; its own rule already held both | none (G5 §2 moved here). Designing every film to the ad stage by default (PB: boost the best performer once 3-5 posts exist) is a proposal; `safe.action`: tooling |
| 4 | the right rail | two rails: organic x > 950 at y 900-1500, ad x > 780 from y 840 | as row 3 | none; framecheck may also warn on the ad rail (tooling) |
| 5 | planes per shot | 4-6 (5-7 on a vista); the board stages near / mid / far and lists every plane | CR §f.1 over CG and SB | CG rule 4; SB §3 |
| 6 | the tiny anchor's size | the K wides 60-150 px; S5's end 170-200 px | CG wins on its shot; one table (§2) | none |
| 7 | a roof vista's horizon | S1 lands at 0.40 H, S5 at 0.46 H | CG wins on its shots | CS §5 (moved here, the two named apart) |
| 8 | the worm's-eye horizon | 0.58-0.64 H | at ~0.78 H the figure's feet fall under the bottom UI | SB §7 |
| 9 | S4's figure | the strip may run under the UI as a mass; a figure stands with its feet above y 1480, or nobody; the "you" only | G5 §2's key reads; Pip hidden (the owner, 2026-10-28) | CG S4 |
| 10 | the "you" under the UI | its body may run under the bottom UI (it reads by mass), its head stays above it (head top y <= ~1380) | G5 §2 (key reads never under the UI) with VT §1's distinction | LD §4 |
| 11 | frame 0's words | frame 0 shows the first spoken line as a normal caption; no title over the captions | the owner: "Wait why do we have the text repeat itself?"; "Why are we having this out of order weirdly?" (v3) | SB §3; G5 §5's v2 `Frame0Text` note marked history; v2S §7's block is v2's (REVIEW_1 MUST 1 removed it) |
| 12 | small words | few and big: >= 56 px for any word a viewer must read (the board's floor 48) | the playbook; the owner: "Also this text is weird" (v3) | none: v2S's 30-34 px body and ENG's 34-40 px labels are history |
| 13 | Pip's place | hidden; never a carrier or a scale anchor (the anchor is the "you") | the newest words: "keep it, but not as obvious ... hide it deliberately in the video" | CG S1, S4, S5, cue 8; v2's seats are history |
| 14 | the bottom third | one quiet field per frame, at the top (then the bottom third holds things) or at the bottom (then the top holds a lid or skyline) | LD §0 | none (v2S's "never quiet" is v2's value) |
| 15 | the cover's case | one cover template (§5); the case is the owner's call | "a coherent style across all videos sharing one look, one brand" | none (open) |
| 16 | Pip on the cover | hidden there too (owner-decided, 2026-10-29: ST §9 decision 5) | "keep it, but not as obvious"; "Go with your suggestions" | §5 |
| 17 | paper at the top | never at the top or beside the band | the owner: "this white part at the top of the reel" | none: EDGES notes its code paints past the top since 2026-10-25 (the preset table's top numbers predate it) |
| 18 | v1-era layout | history (their banner); never a layout source here | the owner: "don't use big models of people" (v2) | none |
| 19 | repeats | this page is the one definition | DIRECTION: a clash is a bug | G5 §2, DIR 10, CS intro, §2, §5, CG notation, SB §3, LD §8, QA's banner point here; the code's constants: tooling |

## 8. Reconciled with the city posters (the study's Part B, each line with its status)
*From `layout.md` §8 and `STUDY.md` (2026-10-29). [owner] = in force (the rule named); [owner-decided (2026-10-29)] =
one of ST §9's calls, all answered "Go with your suggestions", in force and first judged in the look test; [open] =
the owner's call; [proposal] = ours, to be seen in the next G4 look clip (ST §10: v2's canal bank, S1 and its cover
frame, rebuilt beside v2's own). A line moves into §1-5 only when the owner approves it.*

### 8.1 What stays: our layout holds against the posters
- **The zones (§1).** Extended into 9:16 (full width, the poster's top edge on the band's top, y 300) a poster's title
  lands inside our caption block (y 434-500) in 7 of 7, its tallest top at y 605-832, its hero's centre in the read
  zone in 6 of 7 and its darkest near frame under the bottom UI (CO §4): the posters fit our map and ask for no new
  zone; their title zone IS our caption block, on the film and on the cover. [owner: DIR 10]
- **The band stays one calm flat field.** The posters' skies change by dL* 0.4-3.1 across the block's rows (median
  1.4; 4 of 7 meet our <= 1.5: CO §4): a poster-like sky is flattened inside the band, its gradient above y 290 and
  below y 600, and no texture in the band (ST §7). [owner: DIR 6, 10]
- **Cozy stays the home** (>= 50 % of the runtime). The poster frame's sky (36-53 % of a poster, 45-58 % once
  extended) is COZY_AND_SCALE's exposed dose: 1-3 frames a film (CO §5). [owner: DIR 7]
- **One subject at a time, owning the contrast.** The posters' hero is often quiet (the salience peak on it in 2 of 7:
  CO §2); in a 2-4 s shot that is the split focus the owner rejected ("too many moving parts", v3). [owner: DIR 2]
- **Words few and big; no title in the film's frame; the cover title in our caption type.** The posters' title caps
  (16-30 px at 1080) shrink to 5-10 px on a 360-px grid tile; ours are 17-20 px there (CO §6). [owner: PB]
- **One camera for the near world; the ground recedes** (CR §f.4): the posters agree for everything near (PE §1.2).
  [owner: v2 G4, "no distance effect nor perspective"; the far stage below is the one exception: owner-decided
  (2026-10-29)]

### 8.2 What the posters would change (in §1-5's order)
**The frame (§1)**
- **The bottom and side edges become the near frame:** dark, detailed masses cut by >= 2 edges (leaves, a rail, a
  rock, roof edges), median L* <= 60 and >= 30 from the air, edges >= 0.3, open ground <= 15 % of the frame (PE L1: the
  posters' nearest plane L* 45, open ground 7 %, the bottom fifth 59 % masses; v2 74, 25 %, 9 %); bottom corners L* <=
  ~55 (CO L1: posters 44 / 53, v2 ~72 / 74). Masses may already run under the UI (§1). [>= 30 L* from the near group
  to the air: owner, DIR 6 (CR §f.8); the near world in mid-tones, its darks in many small pieces: owner-decided
  (2026-10-29), ST §9 decision 2 (CR §f.8); the rest: proposal]
- **The one quiet field, measured:** when the sky is the field, calm below the skyline <= 5 % of the frame (posters 1-3
  %, v2 19-31 %: CO §1, §7) and no edge-free field over 2 % below the sky (P4 §3.5); 73-90 % of the detail in the lower
  half (v2 53-62 %); open ground <= 15 % as W1's planning number (ST §7). A cozy shot whose quiet field is the floor
  keeps LD §0's rule. [proposal]
- **The far anchor's zone:** its top at y >= 620 (just under the band), its base on the horizon at y ~850-1050, >= 65 %
  of the width and off >= 1 side edge, 6-20 % of the height, pale (k 0.64-0.87) unless it is the declared scale subject
  (P1 §3.2; ST §1b, §7). [proposal]
- **Pip's spot:** the busiest 60-px spot of y 700-1480, x 140-760, >= 250 px from the hero, in the near patchwork;
  never the sky, the band, the rail or the hero (CO §4). [hidden: owner, DIR 2; a quiet "find Pip" in most exterior
  shots, none in closes and charts, hidden on the cover too: owner-decided (2026-10-29), ST §9 decision 5 (§1, §5);
  the spot rule: proposal]

**Shot grammar (§2)**
- **A new row, the poster frame** (the home place's establishing view and the scale landing's end frame): open sky
  from the frame top to the hero's shoulders (~45-58 % of the frame, the band inside it, flat), the hero standing in the
  read zone with its top at y >= 600, centred or on the left third, >= ~80 % of the detail in the lower half, dark
  bottom corners (CO L1). v2's S5 crane end is one already (sky 39 %, the subject 16.8 %, corners 57 / 57: CO §7). CG's
  sky 30-40 % stays the scale move's default until the owner sees one; never a poster frame for every shot. [proposal]
- **Horizons.** For a place-led vista the posters' near eye level (median 0.74 H, 0.62-0.77) maps to y ~1380-1480; a
  figure-led street keeps the head on the eye level at 0.50-0.60 H (at 0.74 H the body falls under the bottom UI); CG's
  rooftop landings (S1 0.40 H, S5 0.46 H) stay the Arcane option (PE L2). [the low vista eye: proposal] Where a far
  city is lifted onto its own horizon (Hanoi, Buenos Aires, Cape Town: 0.14-0.27 H higher), that far stage sits at
  ~0.57-0.63 H, y ~1090-1215, behind a hiding band with no receding line (the study's `img/perspective_916.jpg`). [the
  designed view: owner-decided (2026-10-29), ST §9 decision 4, in the establishing view and the scale landing only (CR
  §f.5), one camera everywhere else; the low vista eye it sits against: proposal]
- **Vanishing points off the centre:** exterior vistas default to a yawed camera (`groundCam` yaw 20-25 deg puts the VP
  at or past a side edge with f 1400); the posters never centre one, v2 centres it in 5 of 8 shots (PE L4). CS's street
  (VP 0.60-0.70 W, one sight line) and a centred one-point corridor stay choices. [proposal]
- **Landmarks as frontal elevations, huge yet far:** no convergence, verticals parallel (21 of 23 posters'
  structures), the base hidden behind a band (5 of 7), the top in open sky at y >= 620, drawn up to 1.4-3.6x one
  camera's size, declared in W1 (PE L3). [the landmark drawn bigger than one camera allows, on a far stage free of
  receding lines: owner-decided (2026-10-29), ST §9 decision 4, in those two frames (CR §f.5), so rule 2's "never a
  flat elevation of stacked bands" keeps meaning the ground and the near world; the rest: proposal]

**Composition (§3)**
- **The hero's spot:** centred (x 380-700) or on the left third (x ~200-450, est.), never the right third below y 840:
  the posters' right-third heroes (Hanoi x 604-1061, Kyoto 571-1048) land under the rail (CO §4). [centre: owner (DIR
  2's subject axis); the left third: open, CO question 2]
- **The hero big AND loud:** in a place-led shot the landmark is the biggest icon (>= 2x the next; posters median
  2.4x), ~8-15 % of the frame (est.), its top in open sky (>= 30 % of its ring), and it owns the salience peak (CO L2;
  v2's subjects lead per pixel but cover 1.4-4.6 %). §1's subject box stays for figure-led beats. [proposal]
- **Lines don't lead, the sky does:** the posters' diagonals cross the hero no more often than chance (lead lift median
  0.78: CO §1); the hero is found by size, sky and value. §3's leading lines stay. [no change]
- **Planes in two value groups with a gap:** 5-7 planes and the sky in every poster (PE §1.3), as CR §f.1's vista
  count. [the range and its frame numbers: owner, DIR 6 (CR §f.8); each group's own L* (near 45-60, hero 50-68: P1
  §3.1): proposal]
- **The patchwork vs our planes rule:** frontal on mid and far masses; on a ground only projected through `groundCam`
  (facets receding to the VP, never level bands seen edge to edge: PE §5); in the sky only as masses (ghost blocks
  within dE 6 of the air), never abstract rectangles (ST §5.2); blocks 3.5-7.5 % W, far 6-10 %; each facet takes its
  plane's step, so CR §f's ladder holds; never on the subject, nothing in the band. [owner-decided (2026-10-29): the
  "low poly" world, ST §9 decision 3 (CR §b, tier C's build)]

**Across shots (§4)**
- **A far landmark carries a join:** kept at one screen spot (±8 %) and size (±20 %), it is a B thread match between
  two near places of one city (CO §5); never three wides in a row on a centred landmark (§2 "angle"). [proposal]
- **The capriccio as a sequence:** several icons of a place, one per beat, the establishing frame with exactly one A
  (CO L5); which icons is content (the owner). [proposal]
- **The float by distance:** each plane moves by 1/z from the shot's camera (P1's table when W1 declares no units:
  near 1, plane 0 0.6, +1 0.24, +2 0.10, +3 0.04, the anchor, the far stage and the sky 0), or by its measured scale
  (P1 §3.4, PE L5). [the parallax float: owner, DIR 8; the constants: a code-vs-doc fix with no owner call (ST §7):
  `lib/depth.ts` `PARALLAX_K` (+1 0.45, +2 0.35) breaks CS §4's 1.8x between neighbours; tooling, flagged]

**The cover and the grid (§5)**
- **What survives 9:16:** the extension (full width, the top edge at y ~300, ~300 px more sky above, ~200 px more near
  frame below), the three bands, the dark bottom corners. What does not: the crop (the title under the top UI at y
  181-268, a tower through the band in 6 of 7, a quarter of the width lost), the right third, a steep sky in the band
  (CO §4, §9). In motion the far stage and the sky hold still and the near frame moves most; a truck along the far
  stage's junction is the one move that could expose it (PE L2). [proposal]
- **One cover frame for the series:** the core line in the sky in our caption type, the film's A drawn big under it
  (~8-15 %, est.) with open sky round its top, the near frame dark at the bottom, all inside the 4:5 crop y 285-1635
  (CO L6); our caption type only, a constant series label only after 3 place-led films (ST §7). [covers as one series:
  owner (PB ONE LOOK); Pip hidden on the cover too: owner-decided (2026-10-29), ST §9 decision 5; the template:
  proposal; the case: open (§5)]

**Light in the frame**
- **The sun:** no poster has a sun disc; v2's S5 sun is the loudest far thing (P1 §4). The disc one step off its sky
  (or behind a ridge) unless it is the shot's "look here", so the far stays the calmest part; v2's saturated disc as
  the pop is history. [owner-decided (2026-10-29), ST §9 decision 6 (CR §g.2)]

### 8.3 What we don't take (layout)
The quiet hero and the tour (3-5 icons at once: take them as a sequence); three eye levels in one picture; patchwork
as level floor bands or abstract rectangles in the sky; the crop to fill, the right-third hero, a steep sky in the
band, a title in the film's frame, tiny letter-spaced caps on a cover; a poster frame for every shot (cozy stays the
home); a poster or a real skyline copied; local objects as a style rule (the owner: content) (ST §8).

### 8.4 Into §1-5, once approved
Already in §1-5 (owner-decided, 2026-10-29): Pip's "find Pip" and the cover (§1, §5), the designed view in two frames
(§2, §3; CR §f.5), the sun (§2). Once approved: the poster-frame row into §2; the near frame, the quiet-field numbers
and the far anchor's zone into §1; the hero's
spot and size into §3; the far-landmark carrier into §4; the cover template into §5; `check_composition.py` into §6.
The risk: a formula if every film opens on the same poster frame (vary the hero's side and the near frame per film:
CO L1).
