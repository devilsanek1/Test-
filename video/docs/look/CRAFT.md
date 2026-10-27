# CRAFT: one flowing story, one focus, a clean line, gentle light (every video)

The owner on v3 G5b (2026-10-27): "too busy, too incoherent ... no clean transitions, just a bunch of shots put together
... too many moving parts and I'm not sure what to keep my attention on ... too rough and messy ... cleaner, more refined,
gentle ... premium ... lighting and shadows should be gentle but should probably exist." This page turns the playbook's
four rules (clean premium, light and shadow, attention hierarchy, one flowing story) into numbers, code and checks,
measured on v3 G5b against reference 1, v1 and the owner's two cozy references (`docs/retro/2026-10-27_v3_retro.md`). It
applies now, from the v3 rework on; the gate changes that make the pipeline produce it wait for the owner (same file). A
film's STYLE.md picks its values inside these rules; an older look doc that disagrees loses. Two-film thresholds are warnings
with a declared exception, except §a's two FAILs. Px at 1080 x 1920, CIE L* and C*, %W/s = % of frame width/s; measures: §e.

## a. One flowing story
**The through-line** (written down beside the core line, before any drawing):
1. **One thread object carries the main arc** (v3: your laptop's price tag): on screen for at least 80 % of the runtime,
   never gone more than 3 s; when the shot is elsewhere it keeps a home spot (a corner, the window, the phone). Every cause
   beat ends with it reacting (the tag ticks): each shot answers "what did this do to it?" (v3: 35 %, gone 17.9 s mid-cause.)
2. **One home place.** Other places are entered through something in it (window, phone, screen, a paper chart) and left
   the same way; at most 3 places and 1 big scale reveal in 45 s. Information (a chart, a number) is paper in the place the
   camera is already in, never a new location made for it (v3: 6 places, a new world per chart).
3. **One "you":** one drawing of the viewer's stand-in, or POV only; no strangers' backs in the foreground (they read as
   "you"). The mascot crosses every cut, or it is dropped (v3: "you" drawn five ways; Pip in a new spot in each shot).
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
- **Timing:** the transition's midpoint lands on the first word of the new sentence, in the voice's pause; during it only
  the carrier and the mascot move. Shots average >= 3.5 s (ref 1 5.2, v1 4.6, v3 2.9).

**Check** (every join; in brackets ref 1 / v1 / v3 G5b):
- Shot list (scenes.json `carrier` once the field lands): every join has a carrier letter, at most 2 are F; the thread's
  screen time summed from it is >= 80 % with no gap over 3 s. These two are the FAILs.
- carry >= 0.25 unless B or D is declared (0.53 / 0.19 / 0.085); eye jump <= 0.10 (0.05 / 0.12 / 0.17); colour shift
  <= 15 unless a light change is declared (10.7 / 11.8 / 24.1); <= 4 movers within 0.4 s of the join (2 / 4 / 20).
- Read each beat's subject aloud, in order: it retells the story. Watch at 1x and name what carried you across each join.

## b. Attention hierarchy: one subject at a time, a calm world around it
v3's subject was as strong as the references'; the world around it was louder: environment local contrast 11.3 (ref 1 6.6,
v1 6.1), the subject's dark line on every crumb, 10x their saturated pixels, 25 movers per 0.5 s, and the story held 22 % of
the motion (ref 1 60 %). Every element gets a tier by its STORY ROLE, never by its depth:

| tier | value | colour | line (§c) | detail | motion |
|---|---|---|---|---|---|
| **A subject** (1-3 objects: the beat's one focus) | L* range >= 80; local contrast >= 2x C's | the hero colour only here (>= 50 % of the frame's C* > 35 pixels) | the only full outline | line coverage >= 2.5x C's | >= 60 % of the motion in its beat; a second story action <= 0.3x of it, never at the same moment |
| **B supporting life** (mascot, people, birds, steam, an audience) | local contrast <= 1.2x C's; no near-black areas | C* <= 25; never the hero or pop hue | tinted, or none | flat: one tone + one shade | <= 3-4 movers, each 0.3-3 % of the frame, together <= 30 % of the motion; constant speed, <= 0.5x the subject's; no pops |
| **C environment** (room, shelves, street, town, sky) | local contrast <= 6.5; L* range <= 60 | C90 <= 25 (ref 1, v1), or saturated at contrast <= 6.5 (the cozy look) | no outlines; hairlines only | line coverage <= 6 % | camera float only; snow and flicker <= 10 % of the motion |

- **Alive but subtle:** supporting life never stops (as in the cozy references) but stays small, slow and low in contrast,
  felt at the edges, never popping. One mover leads at a time; supporting movers take turns (cozy: ~0.6 entries/s) and keep
  out of the 0.4 s around a join. Fullness comes from a calm, well-tiered world, never from equal-weight clutter.
- **A softer style for B and C is the method:** lines only on a white or flat fill (ref 1's crowds), no outlines (the cozy
  references' walkers), flat tinted silhouettes (v1's far city). Not every moving piece is drawn or animated alike.
- **Big means subject or still:** any moving figure > 5 % of the frame is the subject; foreground backs hold still or
  breathe (<= 2 %W/s) while the subject acts (v3's audiences, 11-35 % of the frame, took up to 97 % of the motion).
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
  and round the mascot, a same-hue line 1.6-2.2 px at fill L* -15 to -25. **C:** no line: flat shapes in 2 tones (lit,
  shade), at most dL* 15 inside one plane; things that ARE lines (wires, rails, a bird's V) as hairlines 1.2-1.6 px within
  dL* 15 of their background (glints and lit rails a light tint, L* +10 to +20); none on far planes.
- **Shapes:** each closed shape is ONE closed path (`Z`, round joins): no corner crossings, gaps or overshoot. Straight edges
  are ruler-true (jitter, drift, bow 0). Made objects get soft corners (r = 3-6 % of the short side, at least 3 px). Curves
  are smooth (Catmull-Rom); circles are true ellipses (wobble 0; organic shapes 0.01 at most). Free ends only where the
  stroke IS the thing (hair, steam, string): round caps, a smooth taper to 60 %.
- **Fills** register exactly (offset 0); a tier-A outline is drawn inside its fill (stroke 2x, clipped to the fill), so the
  silhouette is the clean fill edge.
- **Texture:** big areas flat; texture only as flat same-hue shapes (a rug pattern, plank seams as 2 long bands at dL* 6-8
  or less) on 1-2 small surfaces per shot. No specks, ticks, hatching, scribble, dash rows, crumbs or steam squiggles.
- **Line motion:** an object draws on as one stroke, never edge by edge; no `exitLoose`, no boil.
- **Code: the CLEAN pen** (the sketch pen stays for G3 boards), set once in the film's look module: `lib/pen.ts`
  `setPen('clean')` (the full pen with tiers, work in progress; `lib/sketch.ts` `setPenMode('clean')` is v2r's lighter
  one). Its targets: `misreg` {0,0,0}; `stroke` hero 3.0 / detail 2.0 / tone 1.8 / hair 1.2; rects, polys and loops one closed
  path; `Ink` `taper` off unless asked, `vary` / `open` / `exitLoose` 0, `color` by tier (no near-black default); `Fill`
  `offset` [0,0] + `inkInside`; `hatch`, `scribble`, `scribbleMass`, `wallTicks`, `crownTicks`, `speedLines`, `cross` draw nothing.

**Check** (per frame, caption band out, per Mpx; budget, then the approved G4 frame / ref 1 / v1 / v3 G5b): strokes <= 80
(74 / 45-166 / 140-232 / 248-459); short strokes (< 40 px) <= 25 (42 / 20-108 / 81-166 / 189-384); line length <= 10 k px
(16 k / 10-26 k / 20-31 k / 21-33 k); dark-line pixels <= 3 % (5.0 / 2.8-6.8 / 7-10 / 5.1-9.4); near-miss ends <= 40 (68 /
129-413 / 324-691 / 689-1840); colour edges that carry a line 25-40 % (62 / 54-89 / 64-72 / 59-72); cleaner than ref 1 and
v1 on purpose. Code: `grep -rnE "\bover:|misreg|hatch\(|scribble|exitLoose|\bopen=" src/vN/film` finds nothing. Eye check at
1:1: no "+" at a corner, no doubled loop, no fill sliding off its line.

## d. Light and shadow: gentle, but always there
v3: light pools darker than the snow they lit, a night room brightest at the top (farthest from a low lamp; already in the
G4 frame), halos as opaque discs, no cast or contact shadow in any kit file, no key light outdoors.
1. **One light rig per set**, decided with the story (the key is where the eye goes): the key (a point lamp; a sun with
   azimuth and elevation; or the sky), the shadow tints, the pool colours. Every shot in the set uses it; the key stays on
   the same screen side unless the camera turns over 90°; a source never moves between cuts. A lamp's shadows radiate from
   the point under it, a sun's are parallel; blue-hour sky light only lights tops and gives contact shadows.
2. **Light is lighter than what it lights, and it leads the eye:** the brightest 5 % of the frame lies within 0.15 H of the
   subject. Night interior (L*): bulb or screen 95-98 (<= 1 % of the frame); pool core 92-94 (4 above any lit surface); pool
   ring and lamp wash 88-91; ambient wall 80-84 (caption band 78+, ink 8:1+); desk 58-62; shade steps; contact strips 45+.
   Night exterior: lit windows and bulbs 85-92; pools 88-91 on ground snow at 83-85; sky-facing snow caps 93, thin only;
   sky ~45. Day: sun 45-65° high, lit tones lean yellow, the sky the lightest field. Nothing under L* 35 but ink and anchor.
3. **A shadow is its surface times ONE tint per set** (multiply): never grey, never a hand-picked fill. Warm surfaces keep
   at least 0.95x their chroma and turn 5-20° toward rose or plum; cool ones 10-16° toward violet. On the main surfaces
   the tints give form dL* -7 to -12, cast -10 to -15, contact -15 to -25 (thin strips only): ref 1's one flat step is
   "gentle"; the cozy references' -25 to -40 is too hard for our pale palettes. (v3: room form #EEDCDC, cast #E3CCD3,
   contact #C8A3B0; dusk #D3CFEA, contact #B4AED8.)
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
- **Code (shapes, not blur): `lib/light.tsx`, to build.** A `LightRig` context per set; `<ShadowLayer>` = one isolated
  `<g style={{mixBlendMode: 'multiply'}}>` after the fills, before the ink (no double-darkening), holding `<ContactShadow>`,
  `<CastShadow>` (the footprint swept along the light) and `<FormShade>` (the path clipped to the side away from the key);
  then `<LightPool>`, `<PoolLift>`, `<Rim>`; ink and captions on top, unlit. Soft edges: 2 flat steps, no `feGaussianBlur`.

**Check** (the G4 frame and every render; to port as `scripts/qa/check_light.py`): every pool at least +4 L* over its
ground; a halo's radius at most 1.7x its lantern; the brightest 5 % within 0.15 H of the subject; no shadow pixel under C*
8 or L* 35; one value in the caption band; the style frame already shows the rig with form, cast and contact shadows. Eye
check: for every shadow, point at its light; for every object in the light, point at its shadow.

## e. How to measure (until `scripts/qa` has these: the retro's tooling lane)
OpenCV, captions masked. **Joins** (frames 108 px wide, OpenCV 8-bit Lab): carry = share of pixels whose mean |ΔLab| < 8
between the frames 0.05 s before and after; eye jump = distance between the motion centroids (per-frame |ΔLab| > 6 summed
over 0.4 s) before and after, over the frame diagonal; colour shift = |Δ mean Lab| over those 0.4 s; movers = separate
moving regions there. **Frames** (CIE L*): local contrast = mean |L* − Gaussian(L*, σ 16)| at 1080 wide; salience (540
wide) = Gaussian σ 10 of (local contrast / 15 + colour contrast / 15 + C* / 60), peak = p99; motion share = a region's
share of the frame-difference energy in a 0.5 s burst at 30 fps, camera removed (ECC affine). **Lines** (1080 wide): mask =
black-hat (9 px ellipse) > 14 and L* < 55, specks < 4 px out; strokes = its connected parts; short = skeleton < 40 px;
near-miss ends = endpoints of different strokes 3-18 px apart.
