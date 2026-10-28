# CRAFT: one flowing story, one focus, a clean line, gentle light (every video)

The owner on v3 G5b (2026-10-27): "too busy, too incoherent ... no clean transitions, just a bunch of shots put together
... too many moving parts and I'm not sure what to keep my attention on ... too rough and messy ... cleaner, more refined,
gentle ... premium ... lighting and shadows should be gentle but should probably exist." This page turns the playbook's
four rules (clean premium, light and shadow, attention hierarchy, one flowing story) into numbers, code and checks,
measured on v3 G5b against reference 1, v1 and the owner's two cozy references (`docs/retro/2026-10-27_v3_retro.md`). It
applies now, from the v3 rework on. The gate steps that make the pipeline produce it are owner-approved (2026-10-27) and
live in `PIPELINE_V2.md`, `G3_ANIMATIC.md` and `G5_BLOCKING.md`; the old rules that contradicted it are rewritten (a
plain cut as G3's default, G5's draft line, the events-per-second quota). Subtle never means removed and clean never
means empty: keep the life and the things a scene needs, lower their weight. The one-page summary of the direction is
`DIRECTION.md`; a film's STYLE.md picks its values inside these rules. **Which doc wins:** owner's words (playbook;
vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values
only) > v1-era docs (API and measurements, never style); in full, with the tie-breaks: DIRECTION's intro. This page's
thresholds come from two films, so they are warnings with a declared exception, except §a's two FAILs and §f's three
(the owner's "blurred together, no distance, no perspective" made measurable). The board lint's
completeness checks (`G3_ANIMATIC.md` §7: a missing carrier, tier or rig field, a set panel with no ambient move,
undeclared bare paper, a red mark on an owner-facing render) are not craft thresholds: they check that the board shows
its signal, and they keep their FAIL. Px at 1080 x 1920, CIE L* and C*, %W/s = % of frame width/s; measures: §e.

## a. One flowing story
**The through-line** (written down beside the core line, before any drawing):
1. **One thread object carries the main arc** (v3: your laptop's price tag): on screen for at least 80 % of the runtime,
   never gone more than 3 s; when the shot is elsewhere it keeps a home spot (a corner, the window, the phone). One
   exception: the film's scale reveal (the pull-back, playbook) runs its full length without it when the move leaves from
   the thread and the next join returns to it (v3: the crane follows the stick that left your laptop); never a tag pinned
   over the reveal. A second, owner-approved exception: a declared FAIRNESS stretch (the other side's equal-weight reply,
   or a place the subject must never be), which runs without the thread and returns to it at its next join (v2: S5-S7,
   12.4 s, owner yes 2026-10-27). Every cause beat ends with it reacting (the tag ticks): each shot answers "what did this do to it?"
   (v3: 35 %, gone 17.9 s mid-cause.)
2. **One home place.** Other places are entered through something in it (window, phone, screen, a paper chart) and left
   the same way; at most 3 places and 1 big scale reveal in 45 s. Information (a chart, a number) is paper in the place the
   camera is already in, never a new location made for it (v3: 6 places, a new world per chart).
3. **One "you":** one drawing of the viewer's stand-in, or POV only; no strangers' backs in the foreground (they read as
   "you"). The mascot is on both sides of every cut (riding the carrier, or in the same screen spot), never a new pop-in
   per shot (v3: "you" drawn five ways; Pip in a new spot in each shot).
4. **The picture keeps the script's joins:** a line the script says as one movement ("push into the laptop ... pull out
   through the window") is one camera move, never cuts (v3's board broke three such lines into cuts).

**Transition grammar: carry something, don't cut.** Every join names its carrier (A-F) in the board JSON and scenes.json:
- **A push-through:** push into something the first shot showed for >= 0.5 s, or pull back out of it.
- **B thread match:** the thread in the same screen spot (±8 %) and size (±20 %) on both sides; or a match zoom (a flat
  shape zooms to fill the frame, holds 3 frames, shrinks into its counterpart).
- **C continuous camera:** a push, pull or crane, for any change inside one place.
- **D object carry or wipe:** an object leaves one way and enters the next shot from the opposite edge at the same speed.
- **E card flip or swipe** of the same paper (charts).
- **F plain cut:** at most 2 per film, only on a "But" turn, with the thread on screen on both sides.
- **In the engine** (`G5_BLOCKING.md` §2 has the table): A `push-through`, B `matchcut`, C one panel (or
  `camera-continuous` inside one place), D `foreground-wipe` or a carry across a `cut`, E an in-panel card flip (no Film
  type yet: the craft tooling lane), F `cut`. A dissolve is no carrier: only a declared time-passing exception.
- **Timing:** the transition's midpoint lands on the first word of the new sentence, in the voice's pause; during it the
  carrier leads (the mascot may ride with it) and nothing else enters, pops, turns or speeds up, while slow life already
  moving (snow, steam, a far walker) keeps its pace: a freeze reads as a glitch. Shots average >= 3.5 s (ref 1 5.2, v1
  4.6, v3 2.9; a shot is one panel, from one join between panels to the next: a C move inside a panel keeps one shot),
  so a 40 s film has about 10-12.

**Check** (every join; in brackets ref 1 / v1 / v3 G5b):
- Shot list (scenes.json `carrier` once the field lands): every join has a carrier letter, at most 2 are F; the thread's
  screen time summed from it is >= 80 % with no gap over 3 s (the declared scale reveal and an owner-approved fairness stretch aside: the 80 % is counted outside them). These two are the FAILs.
- carry >= 0.25 unless B or D is declared (0.53 / 0.19 / 0.085); eye jump <= 0.10 (0.05 / 0.12 / 0.17); colour shift
  <= 15 unless a light change is declared (10.7 / 11.8 / 24.1); <= 4 movers within 0.4 s of the join, falling weather
  declared aside (2 / 4 / 20). Eye jump and colour shift already flag jumps on a G3 board (v3's board: 0.21 and 35, over
  both limits); carry and movers do not (blank paper: 0.41 and 0), so those two count from the G4 look clip on.
- Read each beat's subject aloud, in order: it retells the story. Watch at 1x and name what carried you across each join.

## b. Attention hierarchy: one subject at a time, a calm world around it
v3's subject was as strong as the references'; the world around it was louder: environment local contrast 11.3 (ref 1 6.6,
v1 6.1), the subject's dark line on every crumb, 10x their saturated pixels, 25 movers per 0.5 s, and the story held 22 % of
the motion (ref 1 60 %). Every element gets a tier by its STORY ROLE, never by its depth; its distance gives it a PLANE
(§f), and both apply: the tier sets the weight (outline, contrast inside its plane, motion), the plane the colour, size,
texture and how simple it is:

| tier | value | colour | line (§c) | detail | motion |
|---|---|---|---|---|---|
| **A subject** (1-3 objects: the beat's one focus) | L* range >= 80; local contrast >= 2x C's | the hero colour only here (>= 50 % of the frame's C* > 35 pixels) | the only full outline | line coverage >= 2.5x C's | >= 60 % of the motion in its beat; a second story action <= 0.3x of it, never at the same moment |
| **B supporting life** (the mascot, people near the story, an audience in the mid ground; kit tier `support`, which also takes story objects off their beat) | local contrast <= 1.2x C's; no near-black areas | C* <= 25; never the hero or pop hue | tinted, or none | flat: one tone + one shade | each <= 3 % of the frame; constant speed, <= 0.5x the subject's while it moves (a still subject never freezes the world); no pops; together <= 30 % of the motion |
| **C environment** (room, shelves, desk dressing, street, town, sky, weather and far life: walkers, cars, birds, steam, particles; kit tier `environment`) | local contrast <= 7, on each plane, not only averaged (§f); L* range <= 60 | C90 <= 25 (ref 1, v1), or saturated at contrast <= 7 (the cozy look) | no outlines; hairlines only | line coverage <= 6 % | the camera's float plus slow life that never stops (cloud drift, smoke, steam, snow, one window or bulb changing at a time, far walkers, cars and birds), together <= 10 % of the motion |

- **Alive but subtle:** supporting life (B and C) never stops (as in the cozy references) but stays small, slow and low in
  contrast, felt at the edges, never popping. As many movers as the scene needs to feel alive, but at most 3-4 noticeable
  ones at once (a box over 0.3 % of the frame: v1 2-3, the cozy references 3-4, 5 at a peak), the small far ones at the
  references' level (small movers per 0.5 s: ref 1 and v1 ~7; v3 ran ~19, inked like the subject). One mover leads at a
  time; supporting movers take turns (cozy: ~0.6 entries/s), and none enters or turns in the 0.4 s around a join (what
  already moves keeps its pace). Subtle means lighter, never fewer than the scene needs: lower a piece's weight (size,
  contrast, colour, speed, line) before removing it. Fullness comes from a calm, well-tiered world, never from
  equal-weight clutter.
- **A softer style for B and C is the method:** a light flat fill with a thin tinted line (ref 1's crowds, drawn with B's
  line, §c), no outlines (the cozy references' walkers), flat tinted silhouettes (v1's far city). Not every moving piece
  is drawn or animated alike.
- **Big means subject or still:** any moving figure > 5 % of the frame is the subject; a big near figure (the "you"; never
  strangers' backs, §a.3) holds still or breathes (<= 2 %W/s) while the subject acts (v3's audiences, 11-35 % of the
  frame, took up to 97 % of the motion).
- **The mascot is tier B** unless the line is about it: C* <= 25, a tinted outline <= 2.2 px, <= 1 % of the frame (close-ups
  too), only blinks and ear moves (<= 10 %W/s) while the subject moves, clear of the subject (v3's Pip, C* 44 with dark
  outlines, beat the subject's salience per pixel in 12 of 13 panels).
- **Code:** `lib/pen.ts` (`setPen('clean')`, `CLEAN_TIERS`; work in progress) maps `subject` / `support` / `environment`
  to line widths and colours, calmer fills and motion factors; its constants are tuned until this check passes.

**Check** (the paused middle frame, then a 0.5 s burst; target, then ref 1 / v1 / v3 G5b): salience peak/median >= 2.4
(3.65 / 2.60 / 1.79); background salience <= 1.4 (1.01 / 1.28 / 1.91); salience mass in the top 10 % of the area >= 19 %
(21 / 20 / 17); environment local contrast <= 7 (6.6 / 6.1 / 11.3); subject / environment local contrast >= 2 (2.1 / 2.6 /
1.1); the subject's share of the motion >= 60 % (60 / 34 / 22). Eye check at phone size: squint and say where your eye is
every 2 s; it is on that beat's named subject.

## c. The clean line: premium, gentle
v3's weight was fine (2.3-3.0 px, like ref 1 and v1); the count, the ends and the contrast were not: 3.4-6.2x the approved G4
frame's strokes, 10-27x its near-miss ends, every crumb at the hero's contrast (dL* 52-63 on every tier; cozy 24-28). The
G4 frame had the same pen and passed with a quarter of the strokes: the fix is a new pen, not fewer props.
- **Line by tier.** **A:** one closed outline 3.0 px, inner details 1.8-2.0 px, in the object's own shade (its fill L* -35,
  hue kept, never under L* 16; the palette's anchor on dark objects), never near-black; captions keep the dark ink
  (PALETTE). **B:** no outline: shapes part by value (neighbouring fills at least dL* 12 apart); where close values touch,
  round the mascot and on a line-drawn figure (ref 1's crowds, a light flat fill), a same-hue line 1.6-2.2 px at fill L*
  -15 to -25 (a tier scope with `lines`). **C:** no line: flat shapes in 2 tones (lit, shade), at most dL* 15 inside one
  plane; things that ARE lines (wires, rails, a bird's V) as hairlines 1.2-1.6 px within dL* 15 of their background
  (glints and lit rails a light tint, L* +10 to +20); none on far planes.
- **Shapes:** each closed shape is ONE closed path (`Z`, round joins): no corner crossings, gaps or overshoot. Straight edges
  are ruler-true (jitter, drift, bow 0). Made objects get soft corners (r = 3-6 % of the short side, at least 3 px). Curves
  are smooth (Catmull-Rom); circles are true ellipses (wobble 0; organic shapes 0.01 at most). Free ends only where the
  stroke IS the thing (hair, steam, string): round caps, a smooth taper to 60 %.
- **Fills** register exactly (offset 0); a tier-A outline is drawn inside its fill (stroke 2x, clipped to the fill), so the
  silhouette is the clean fill edge.
- **Texture:** big areas flat; texture only as flat same-hue shapes (a rug pattern, plank seams as 2 long bands at dL* 6-8
  or less) on 1-2 small surfaces per shot. No specks (static dark marks; §f's particles are light movers, not texture), ticks, hatching, scribble, dash rows, crumbs or steam squiggles,
  and no grain overlay (the sky's invisible encode dither, §g, is not a texture). The one optional texture is the
  owner's halftone (`PALETTE.md` "Texture and lines": at most 6 %,
  on a few chosen elements, a last step after G6; the film must work flat).
- **Line motion:** an object draws on as one stroke, never edge by edge; no `exitLoose`, no boil.
- **Code: the CLEAN pen** (the sketch pen stays for G3 boards), set once in the film's look module: `lib/pen.ts`
  `setPen('clean')` (the full pen with tiers, work in progress; `lib/sketch.ts` `setPenMode('clean')` is v2r's lighter
  one). Its targets: `misreg` {0,0,0}; `stroke` hero 3.0 / detail 2.0 / tone 1.8 / hair 1.2; rects, polys and loops one closed
  path; `Ink` `taper` off unless asked, `vary` / `open` / `exitLoose` 0, `color` by tier (no near-black default); `Fill`
  `offset` [0,0] + `inkInside`; `hatch`, `scribble`, `scribbleMass`, `wallTicks`, `crownTicks`, `speedLines`, `cross` draw nothing.

**Check** (per frame, caption band out, per Mpx; budget, then the approved G4 frame / ref 1 / v1 / v3 G5b): strokes <= 80
(74 / 45-166 / 140-232 / 248-459); short strokes (< 40 px) <= 25 (42 / 20-108 / 81-166 / 189-384); line length <= 10 k px
(16 k / 10-26 k / 20-31 k / 21-33 k); dark-line pixels <= 3 % (5.0 / 2.8-6.8 / 7-10 / 5.1-9.4); near-miss ends <= 40 (68 /
129-413 / 324-691 / 689-1840); colour edges that carry a line <= 40 % (62 / 54-89 / 64-72 / 59-72; the cozy references
19-22); cleaner than ref 1 and v1 on purpose, never emptier: the props stay, their lines go. Code: `grep -rnE
"\bover:|misreg|hatch\(|scribble|exitLoose|\bopen=" src/vN/film` finds nothing, and the film draws no `lib/cine`
drawing piece (city, street, tower, monument, wall, windows, figures, sky, light, props, wipers, lens: raw paths with
`misreg` and their own hand jitter, which the clean pen never reaches) until the craft tooling lane ports them; its
camera, perspective, atmosphere and colour utilities are engine primitives, and `lib/kit` draws through `Ink` / `Fill`
(clean-pen-aware). Eye check at 1:1: no "+" at a corner, no doubled loop, no fill sliding off its line.

## d. Light and shadow: gentle, but always there
v3: light pools darker than the snow they lit, a night room brightest at the top (farthest from a low lamp; already in the
G4 frame), halos as opaque discs, no cast or contact shadow in any kit file, no key light outdoors.
1. **One light rig per set**, decided with the story (the key is where the eye goes): the key (a point lamp; a sun with
   azimuth and elevation; or the sky), the shadow tints, the pool colours. Every shot in the set uses it; the key stays on
   the same screen side unless the camera turns over 90°; a source never moves between cuts. A lamp's shadows radiate from
   the point under it, a sun's are parallel; blue-hour sky light only lights tops and gives contact shadows.
2. **Light is lighter than what it lights, and it leads the eye:** the centroid of the brightest 5 % of the frame (the sky
   and the caption band left out) lies within 0.15 H of the subject. Night interior (L*): bulb or screen 95-98 (<= 1 % of
   the frame); pool core 92-94 (4 above any lit surface); pool ring and lamp wash 88-91; ambient wall 80-84 (caption band
   78+, ink 8:1+); desk 58-62; shade steps; contact strips 45+. Night exterior: lit windows and bulbs 85-92; pools 88-91 on
   ground snow at 83-85; sky-facing snow caps 87-89, thin, never above the pool core (a sky at ~45 lights them); sky ~45.
   Day: sun 45-65° high, lit tones lean yellow, the sky the lightest field. Nothing under L* 35 but ink and anchor-dark
   surfaces (their shadows take one step below).
3. **A shadow is its surface times the set's ONE tint family** (multiply; form, cast and contact are three strengths of
   one hue): never grey, never a hand-picked fill. Warm surfaces keep at least 0.95x their chroma and turn 5-20° toward
   rose or plum; cool ones 10-16° toward violet. On the main surfaces the tints give form dL* -7 to -12, cast -10 to -15,
   contact -15 to -25 (thin strips only): ref 1's one flat step is "gentle"; the cozy references' -25 to -40 is too hard
   for our pale palettes. (v3: room form #EEDCDC, cast #E3CCD3, contact #C8A3B0; dusk #D3CFEA, contact #B4AED8.)
4. **Form shadow** on the side away from the key, 25-40 % of the object's width: one flat, hard-edged step, no ink on its
   edge; a crescent on round things; about 3:1 lit to shade by area on what faces the key.
5. **Cast shadow** = the footprint swept along the light: 0.3-0.8 h long under a sun; under a lamp h·d / (H_lamp − h),
   capped at 1.5 h and only inside the pool (outside it, contact only); flattened by the ground's ry/rx (desk 0.3,
   street 0.2-0.35); sharp at the base, a 10-14 px half-tint step at the far end.
6. **Contact shadow under everything that touches a surface** (people, chairs, mugs, laptops, vans, lamp bases, pots):
   1.05-1.15x the footprint (1.1-1.3x a person's stance), 6-12 px tall (16 for a vehicle), 3-4 px away from the key, a
   3-4 px half-tint edge. The cheapest premium tell.
7. **Pools and spills agree with their source:** centred under the lamp's mouth (pushed along the shade's tilt), rx
   2.5-3.5x the mouth's half-width (a street lamp: 0.8-1.0x its post height), ry/rx = the ground's flattening; two opaque
   flat steps, both lighter and warmer than their ground (v3: snow #EADBD2 / #F6E4CA, desk #EBB07F / #F6CD98). A window
   spill: a trapezoid widening 1.3-1.6x, 0.6-1x the window's height, +4 L*. Warm objects in a pool are lifted +6 to +11 L*
   (a clipped copy screen-blended with #4A2E10; never on cool surfaces, it greys them). A halo: at most 1.7x the lantern,
   one step on the sky, or none: show light on what it hits, never as discs. Room falloff: planes (window reveal, desk
   underside, corners) plus ONE lamp wash with a 2-step (~26 px) edge, never concentric rings (a target). No symbolic glow.
8. **Rim light only on the subject,** when the key is behind or beside it or it stands on a darker field: 4-6 px inside
   the silhouette along 25-50 % of the outline on the key side, in the lit colour; never an offset copy of the outline.
9. **Unlit:** the sky and the sources, insert cards and charts, screens and lit panes, captions, the far town past the
   atmosphere steps. The caption band holds one value; no shadow edge crosses it.
10. **How much:** night interior 20-30 % lit (pool and wash), 45-60 % ambient, 10-20 % shadow shapes; night exterior 8-15 %
    warm-lit, ground ambient at least 50 %; day 20-30 % shade and cast. Every object in a lit zone gets a form and a
    contact shadow, every person a cast shadow too; supporting life stays in the ambient band.
- **Code (shapes, not blur): `lib/light.tsx`** (2026-10-27: being ported from v3's opt-in first version,
  `src/v3/film/kit/Light.tsx`; the craft tooling lane finishes it, `PIPELINE_V2.md`). These are engine primitives, not
  assets, and a film never imports another film's folder (`src/vN/`): a new film takes them from `lib/light.tsx`. A
  `LightRig` context per set; `<ShadowLayer>` = one isolated
  `<g style={{mixBlendMode: 'multiply'}}>` after the fills, before the ink (no double-darkening), holding `<ContactShadow>`,
  `<CastShadow>` (the footprint swept along the light) and `<FormShade>` (the path clipped to the side away from the key);
  then `<LightPool>`, `<PoolLift>`, `<Rim>`; ink and captions on top, unlit. Soft edges: 2 flat steps, no `feGaussianBlur`.

**Check** (the G4 look clip and every render): every pool at least +4 L* over its ground; a halo's radius at most 1.7x
its lantern; the brightest 5 % (sky and caption band out) centred within 0.15 H of the subject; no shadow pixel under C* 8,
nor under L* 35 except on an anchor-dark surface; one value in the caption band; the G4 look clip already shows the rig
with form, cast and contact shadows. `scripts/qa/check_light.py` (built in the v3 rework: an A/B of the same frame with
the light layers off and on) checks the pools, the brightest 5 %, the shadow colour and the caption band; the halo and
the three shadow kinds are an eye check. Eye check: for every shadow, point at its light; for every object in the
light, point at its shadow.

## e. How to measure (until `scripts/qa` has these: the retro's tooling lane)
OpenCV, captions masked. **Joins** (frames 108 px wide, OpenCV 8-bit Lab): carry = share of pixels whose mean |ΔLab| < 8
between the frames 0.05 s before and after; eye jump = distance between the motion centroids (per-frame |ΔLab| > 6 summed
over 0.4 s) before and after, over the frame diagonal; colour shift = |Δ mean Lab| over those 0.4 s; movers = separate
moving regions there. **Frames** (CIE L*): local contrast = mean |L* − Gaussian(L*, σ 16)| at 1080 wide; salience (540
wide) = Gaussian σ 10 of (local contrast / 15 + colour contrast / 15 + C* / 60), peak = p99; motion share = a region's
share of the frame-difference energy in a 0.5 s burst at 30 fps, camera removed (ECC affine); movers = separate moving
regions in that burst ("noticeable" = a box over 0.3 % of the frame, "small" = 0.03-0.3 %). **Lines** (1080 wide): mask =
black-hat (9 px ellipse) > 14 and L* < 55, specks < 4 px out; strokes = its connected parts; short = skeleton < 40 px;
near-miss ends = endpoints of different strokes 3-18 px apart. **Depth** (§f, `scripts/qa/check_depth.py`, 540 px wide;
per plane box: local contrast σ 8, visible edges = colour steps ΔE >= 6 per px, values = 6-L* bins holding >= 3 %, ΔE76
of the mean to the air; separation sampled every 4 px along the silhouette, fill 2-8 px in against 2-10 px out, drawn
lines out; ground: Canny + Hough on L* at 1080, segments >= 36 px, walls' verticals out, visible = |ΔL*| >= 6 across).

## f. Depth and separation: every shot reads in distance, never a flat elevation
The owner on v2's G4 look clip (2026-10-27): "the foreground and the main focus still blurs with the background ... no
distance effect nor perspective ... the bottom part ... little to no perspective or depth ... a bit of particles here and
there" (playbook DEPTH AND SEPARATION). Measured on its 5.4 s frame (`research/2026-10-27_depth_analysis.md`,
`check_depth.py`): the far city as light, saturated and busy as the wing in front of it (ΔE 18.3 from its air, the wing
13.1), the wing's lit corner on a field of its own value (|ΔL*| 2.9 along 152 px), our bank 84 % level lines and none
receding, the near public smaller per metre than her across the water. Every cue said "flat". v1 (fill-only far planes,
like our pen) is the model for the plane numbers; reference 1 for streets and separation.
1. **Planes and the air.** Each set declares (W1) its planes, 0 = the subject's, -1, -2 the foreground, +1 ... +4
   farther (4-6 in a shot, 5-7 on a vista), its AIR (the sky's lowest colour right behind them: rule 6's one sky,
   `horizonColor(sky, x)` of §g.3, never the mint above it; v2 S1 `S1_AIR`) and its camera (horizon, vanishing point(s)).
2. **One flat step per plane toward the air**, k = 0 / .12 / .22 / .40 / .65 on every fill of the plane (never a
   gradient, fog or blur): L* toward the air's; a hue on the air's side converges on it, one across from it keeps its
   hue at chroma x (1 - 0.8 k) (a straight mix would cross grey), never under C* 8, never into the olive band. This is
   DIRECTION's "lighter, cooler, less saturated" in a day or dusk air; under a warm sunset air the far planes take its
   warmth and still read far by value, contrast and simplicity (v1 @25.5: the far city more saturated than the near, its
   air C* 30; PASS). Simpler with distance: 5 / 5 / 4 / 3 / 2 values, no two more than 24 / 12 / 5 ΔE apart on +2 / +3 /
   +4, windows tone-on-tone (ΔE <= 6 from the wall, never a dark speck or the lamp colour) from +2 and none at +4, no
   hairline past +2. Nearer than the subject: no air, a value step darker each (5 / 10 / 13 / 14 L*). Behind a pale
   subject plane (L* > 70) the far city starts at +3. Targets (references): the farthest plane within ΔE 10 of its air
   (5.9-10.4; G4 18.3); from the second plane behind the subject on, each >= 3 closer to its air than the one before;
   the subject's plane >= ΔE 12 from the plane behind it (11-22.6; G4 5.7; a vista whose ladder falls may step ~5); the
   farthest plane's darks within 20 L* of the air, its range <= 15 L*, <= 4 values, contrast <= 0.5x the subject plane's
   and <= 4, visible edges <= 0.5x (v1 0.14-0.44x; G4 1.1x and 1.5x), hue within 30 deg of the air's (the rig's shade
   family when backlit); no plane behind the subject busier than its plane (fill contrast <= 1.1x). The subject on a far
   plane takes half its plane's step and keeps its separation.
3. **Separation: the subject never shares a value with what is right behind it.** A lit edge on a darker field, a shaded
   edge on a lighter one (counterchange); overlap, never a tangent. Along the silhouette (fill against fill): tier A
   median |ΔL*| >= 15, <= 20 % at one value (|ΔL*| < 5), no unlined one-value run over 60 px (12 / 25 % with its outline
   along >= 80 % of it: the line helps, never replaces the fill step); a big mass of the subject's plane >= 12 / <= 25 %
   / <= 100 px (references 13-38; G4's corner 2.9 / 52 % / 152 px). The field behind is a calm flat shape of its own
   plane (a far row rising behind a lit corner, a darker band behind light figures), never a halo, glow or outline: a
   step that lives only in a thin ring round the silhouette (2-10 px), with the edge melting past it (24-48 px out),
   is a melt.
4. **The ground recedes.** ONE camera per shot for every ground, wall, figure and particle; the ground's joints, steps
   and dressing laid out flat in its own coordinates and projected: lines into the picture converge, rows foreshorten
   (>= 2x far to near), joints narrow, sizes fall as 1/distance. Visible lines (|ΔL*| >= 6, or a tone band >= 3 px):
   <= 65 % level and >= 20 % to the vanishing point(s) (references 27-57 % receding; G4 84 % level, 0 %: its joints ran
   to the VP at |ΔL*| 3.6, invisible). A frontal ground still needs lines into it (joints, a stair cheek, a kerb, a
   row of bollards) or a 15-30 deg turn into two-point; each nearer ground band a value step darker.
5. **Size: one camera.** Never a nearer thing smaller per metre than a farther one (G4: the ducks and our landing's
   public 41-63 px/m, her across the water 100); people on one level keep one eye ratio within +-15 %. Calm a figure with
   colour (tier B), never by shrinking it; a camera too low for the foreground's things is raised, not cheated.
6. **A few particles make it natural** (owner: "a bit of particles here and there"): tier-C life inside rule 3's mover
   budget, declared at G3 as `life:` items: motes only inside light and against shade (2-4 px, L* +8 to +15), dust or
   pollen in the sun-side air (both 3-12 px/s), a leaf (8-14 px, a flutter, its fall clear of the caption band and the
   subject: a leaf that would reach them shrinks out before, never to come back), glints only in the sun's
   glitter path (short level dashes, L* +10 to +20, 0.2-0.6 s), far birds pale and small, a flock crossing the whole
   frame; a few a field (motes 6, dust 5, glints 4, a leaf or two, a flock of 3-5), <= ~12 on screen, each grows in and
   shrinks out (never fades), a step lighter on the sun side, no entrance (a leaf growing in, a flock flying in)
   touching the 0.4 s around a join (a steady field keeps its pace), a pure function of the frame. They are movers, not
   texture (§c).
- **Code:** `lib/depth.ts` (`makeAtmosphere`, `recede`, `planePalette`, `toneOnTone`, `backing`, `groundCam`, `flight`,
  `band`, `quadForPlane`, `poissonDisk`, `depthProblems`, `sizeProblems`; the parallax float `parallaxOffset`,
  `floatAt`, `floatProblems`) and `lib/particles.tsx` (`<Particles kind>`, `particleProblems`); how-to and numbers
  `lib/DEPTH.md`; demo `src/entry-v2r-depth.tsx`. Flat everywhere; the parallax float is approved (owner, 2026-10-28:
  DIRECTION rule 8); a fog, a depth-of-field blur or a glow stay owner decisions (rule 5's sky gradient aside).

**Check:** `scripts/qa/check_depth.py <still> --sheet <shot>.json` (sheets: `scripts/qa/depth_sheets/README.md`), with
the G4 look clip and every G5 lane's key stills. Three FAILs, the owner's words made measurable: "no air" (the farthest
plane no closer to its air than the subject's plane), "melts" (a silhouette's median step under 6, >= 50 % at one value
along an unlined run over 100 px, or a step that lives only in a thin ring round it), "elevation" (a ground >= 70 %
level with < 10 % receding); a sheet without its planes and air, its silhouettes or its ground FAILs too, unless it
waives that part with a reason (a check that did not run never passes); every other number above WARNs with its value.
The sheet is part of the check: every visible plane boxed, the farthest included, and nothing else (read its `--map`;
a far box that passes on sky inside it WARNs). Calibrated: v2's G4 clip FAILs all three; v1 @20.5 / @25.5 / @38.5 and
reference 1 @6.0 PASS (reference 1's lined far planes WARN on contrast). Eye check at phone size: squint; the subject
stands off what is behind it, the far reads far, the ground runs into the picture.

**Failures the eye catches first** (v2 G4 art-director pass, 2026-10-28; each one an owner send-back):
- A sun disc showing through a V gap or a notch in a roofline (a "speech-bubble" tooth): one near-level edge cuts the disc, or it is whole.
- A separation backing that is a blank slab: the field behind a subject is a real thing of the set (a building with tone-on-tone windows,
  a stepped top, a lit sliver on its sun side), never a placeholder rectangle.
- Particles too small for a phone: glints 12-24 px, leaves 10-14 px, motes 3-4 px set against a shaded field; 2-4 visible at a time.
- Two cameras: a perspective ground under level, frontal buildings reads as a backdrop on a floor; facades, bridge and far rows share the
  ground's horizon and vanishing point (a narrow side wall in shade shows a building's depth).
- The heaviest area at a squint must be the subject's, never the near dressing: near planes get value range, not prop count.

## g. Sky: one continuous, gentle gradient that survives video
The owner on v2's G4 look clip (2026-10-27): "why is it blue sky and then suddenly abruptly orange, weird ... maybe when
it comes to sky we can find a beautiful way to do a gentle gradient ... find the pro way and tools to do it the best way
you can" (playbook ONE CONTINUOUS SKY, DIRECTION rule 6). The sky is the one gradient in the look; everything else stays
flat. Measured on the S1 demo (`research/2026-10-27_sky_gradients.md` §5):
1. **One sky, frame top to horizon:** key colours in OKLCH, mixed in OKLab, joined by one eased curve (a monotone
   cubic: no stop line, no overshoot), as painters paint an evening: a zenith a touch deeper and cooler (dL* <= ~1.3:
   deeper reads richer but contours after a platform's re-encode), the caption field FLAT through the caption band
   (dL* <= 1.5 across y 317-556, ink >= 7:1), then lighter through a pale warm light band (the sky's lightest, a step
   over both neighbours) into the warm horizon. The cool-to-warm crossing happens in that light band at C* <= 7 (a
   2-stop sRGB mint -> peach goes through khaki #DCDBC5; a 2-key OKLab one crosses yellow-green at C* 13).
2. **The sun is part of the sky:** a soft elliptical warmth round a low sun (wider than tall, gone at its rim with a
   smootherstep: no edge, no ring), never inside the caption band; the disc a flat shape on top, no halo with it.
3. **The far haze = the sky's lowest colour,** warmed under the sun: `horizonColor(sky, x)` is §f.1's AIR.
4. **Dithered for the encoder:** Chrome's own +-0.5 code gradient dither is erased by any encode, so the sky carries a
   static blue-noise texture of +-2 codes per channel at a 2 px grain (zero-mean, 0.28 L* rms: invisible; a 1 px
   texture is erased by x264 even at CRF 14). Not grain (§c): it lives on the sky only and is never seen at 1:1.
5. **The master keeps it:** lossless PNG frames, one BT.709 conversion, x264 CRF 14 slow aq-mode 3, 8-bit yuv420p
   (`scripts/render-media.mjs --master`; Remotion's default JPEG q80 frames and the old TV-range second pass both band the
   sky, and the TV pass relabelled BT.601 as BT.709: 1.7 L* darker). A platform's re-encode still leaves a dithered sky
   isolated soft contours (simulated CRF 20-28: WARN) where a plain gradient leaves a staircase: post at the highest
   quality settings (`POSTING_KIT.md`).
- **Code:** `lib/sky.tsx` (`<Sky>`, `eveningSky`, `skyColorAt`, `horizonColor`, `skyProblems`; how-to `lib/SKY.md`), a
  film's skies beside its rigs (v2: `src/v2r/world/skies.ts`), demo `src/entry-v2r-sky.tsx`.

**Check:** `skyProblems(sky, {ink})` is empty (band flatness, ink contrast, no khaki, no grey run), and
`scripts/qa/check_banding.py <still | master.mp4> --region <the sky's open area>` on the G4 clip and on every master's
sky shots: PASS (no staircase: < 3 visible steps per 64 px strip, none over 2x the JND; the band within 1.5 L*). The JND
is CAMBI's (Netflix libvmaf: a luminance step over 1.9 % of the mean) or dE00 1.5 for a hue band. FAIL on a staircase,
a strong step or a bent band; the six flat steps S1 had on 2026-10-27 FAIL (dE00 5.7). Eye check on the phone, full
brightness, in a dim room: no line where the sky changes colour, no texture at arm's length.
