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
thresholds come from two films, so they are warnings with a declared exception, except §a's two FAILs. The board lint's
completeness checks (`G3_ANIMATIC.md` §7: a missing carrier, tier or rig field, a set panel with no ambient move,
undeclared bare paper, a red mark on an owner-facing render) are not craft thresholds: they check that the board shows
its signal, and they keep their FAIL. Px at 1080 x 1920, CIE L* and C*, %W/s = % of frame width/s; measures: §e.

## a. One flowing story
**The through-line** (written down beside the core line, before any drawing):
1. **One thread object carries the main arc** (v3: your laptop's price tag): on screen for at least 80 % of the runtime,
   never gone more than 3 s; when the shot is elsewhere it keeps a home spot (a corner, the window, the phone). One
   exception: the film's scale reveal (the pull-back, playbook) runs its full length without it when the move leaves from
   the thread and the next join returns to it (v3: the crane follows the stick that left your laptop); never a tag pinned
   over the reveal. Every cause beat ends with it reacting (the tag ticks): each shot answers "what did this do to it?"
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
  screen time summed from it is >= 80 % with no gap over 3 s (the declared scale reveal aside). These two are the FAILs.
- carry >= 0.25 unless B or D is declared (0.53 / 0.19 / 0.085); eye jump <= 0.10 (0.05 / 0.12 / 0.17); colour shift
  <= 15 unless a light change is declared (10.7 / 11.8 / 24.1); <= 4 movers within 0.4 s of the join, falling weather
  declared aside (2 / 4 / 20). Eye jump and colour shift already flag jumps on a G3 board (v3's board: 0.21 and 35, over
  both limits); carry and movers do not (blank paper: 0.41 and 0), so those two count from the G4 look clip on.
- Read each beat's subject aloud, in order: it retells the story. Watch at 1x and name what carried you across each join.

## b. Attention hierarchy: one subject at a time, a calm world around it
v3's subject was as strong as the references'; the world around it was louder: environment local contrast 11.3 (ref 1 6.6,
v1 6.1), the subject's dark line on every crumb, 10x their saturated pixels, 25 movers per 0.5 s, and the story held 22 % of
the motion (ref 1 60 %). Every element gets a tier by its STORY ROLE, never by its depth:

| tier | value | colour | line (§c) | detail | motion |
|---|---|---|---|---|---|
| **A subject** (1-3 objects: the beat's one focus) | L* range >= 80; local contrast >= 2x C's | the hero colour only here (>= 50 % of the frame's C* > 35 pixels) | the only full outline | line coverage >= 2.5x C's | >= 60 % of the motion in its beat; a second story action <= 0.3x of it, never at the same moment |
| **B supporting life** (the mascot, people near the story, an audience in the mid ground; kit tier `support`, which also takes story objects off their beat) | local contrast <= 1.2x C's; no near-black areas | C* <= 25; never the hero or pop hue | tinted, or none | flat: one tone + one shade | each <= 3 % of the frame; constant speed, <= 0.5x the subject's while it moves (a still subject never freezes the world); no pops; together <= 30 % of the motion |
| **C environment** (room, shelves, desk dressing, street, town, sky, weather and far life: walkers, cars, birds, steam; kit tier `environment`) | local contrast <= 7; L* range <= 60 | C90 <= 25 (ref 1, v1), or saturated at contrast <= 7 (the cozy look) | no outlines; hairlines only | line coverage <= 6 % | the camera's float plus slow life that never stops (cloud drift, smoke, steam, snow, one window or bulb changing at a time, far walkers, cars and birds), together <= 10 % of the motion |

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
  or less) on 1-2 small surfaces per shot. No specks, ticks, hatching, scribble, dash rows, crumbs or steam squiggles,
  and no grain overlay. The one optional texture is the owner's halftone (`PALETTE.md` "Texture and lines": at most 6 %,
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
near-miss ends = endpoints of different strokes 3-18 px apart.
