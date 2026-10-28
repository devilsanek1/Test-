# lib/depth.ts + lib/particles.tsx: depth, separation and a few particles for every film

The film-agnostic depth module the owner's v2 G4 note asked for ("the foreground and the main focus still blurs with the
background ... no distance effect nor perspective ... the bottom part ... little to no perspective or depth ... a bit of
particles here and there"; playbook DEPTH AND SEPARATION, DIRECTION rule 2). The rules and numbers are
`docs/look/CRAFT.md` §f (it wins over this page); the check is `scripts/qa/check_depth.py` (sheets:
`scripts/qa/depth_sheets/README.md`); the demo is `src/entry-v2r-depth.tsx` (`DepthDemo2R` flat / depth / trails,
`DepthLint2R`). The research behind it: `docs/look/research/2026-10-27_depth_analysis.md` (why the clip read flat, the
spec) and `2026-10-27_effects_libraries.md` (the stack: no new dependency; `@remotion/noise`, `lib/persp`, our code).

**Opt-in and flat.** Nothing runs unless a scene calls it; a film that never imports these renders exactly as before.
Everything is a flat fill: one colour step per plane (never a gradient, fog, blur or glow), a ground drawn from one
camera, particles that grow in and shrink out (never an opacity fade). Deterministic: pure functions of the scene time
and a seed (lib/rng, `@remotion/noise` with ONE noise seed for the module); never `Math.random`, a clock or frame state.
**Two axes, both on everything:** the TIER (story role, `lib/tier.tsx`) sets the weight; the PLANE (distance) sets the
colour, the size, the texture and how simple a thing is. Plane 0 = the subject's plane; -1, -2 the foreground; +1 ... +4
farther.

## API: lib/depth.ts (pure TS)

| export | what |
|---|---|
| `makeAtmosphere({name, air, steps?, near?, chroma?, hueTurn?, chromaFloor?})` | ONE per set (W1, with its light rig). `air` = the sky's lowest colour right behind the planes (one colour, or one per plane): `horizonColor(sky, x)` of a `lib/sky` sky (CRAFT §g.3; v2 S1 `S1_AIR`), or `hazeFromSky(skyTopToHorizon)` for a stepped sky's colours. Steps `PLANE_STEPS` 0 / .12 / .22 / .40 / .65; foreground `NEAR_STEPS` 5 / 10 / 13 / 14 L* darker. |
| `recede(color, plane, atm, {tier})`, `recedeAll(palette, plane, atm)`, `atmos(color, k, air)`, `nearStep`, `planeK` | a colour on its plane: farther = one flat step toward its air (`atmos`), nearer = a value step darker; `tier: 'subject'` takes half the step (it may read one plane nearer). `atmos`: L* toward the air's; a hue on the air's side converges on it in a*b*; a hue across from it keeps its hue, chroma x (1 - 0.8 k); never under C* 8, never into the olive band (h 88-118 at C* < 30). |
| `planeLod(plane)`, `planePalette(colors, plane, atm)`, `keepDetail(px, plane)`, `toneOnTone(wall, {lit})`, `seamTone(c, dL)` | simpler with distance: values 5 / 5 / 4 / 3 / 2, the widest step between them (spread) 24 / 12 / 5 ΔE on +2 / +3 / +4, windows lit / tone / none, hairlines to +2, smallest part 0 / 3 / 4 / 8 / 12 px. `planePalette` recedes a set of materials and merges them to the plane's values; `toneOnTone` a far window (ΔE <= 6 from its wall); `seamTone` a joint's tone (dL* 7: visible at >= 6). |
| `backing(edge, field, {min, dir, tier, bg})`, `separationOf`, `SEPARATION` | the calm field behind a subject's edge: the FIELD's colour moved in L* until the edge parts by `min` (15 tier A, 12 a mass), a lit edge on a darker field, a shaded one on a lighter field; `tier` pre-compensates the clean pen's value pull on that field (environment 16 %), so the step SHOWN meets `min`. Pass a far-plane colour as the field, never a sky step (darkened in its own hue it turns khaki). |
| `groundCam({horizon, vpx, f, height, yaw})`, `camFromSheet` | ONE camera per shot: `pt(x, z, level)` (metres -> px), `y(z)`, `z(y)`, `scale(z)`, `pxPerM(y, level)`, `vp`, `vpX` (two-point under a yaw). v2 S1's lens = `groundCam({horizon: 965, f: 1400, height: 1.3})`. |
| `receding`, `crossing`, `band`, `groundPoly`, `frontFace`, `sideFace`, `flight`, `flightCheek`, `quadForPlane`, `projectPts`, `rowsZ`, `rowYs` | the ground recedes: lines into the picture (to the VP), lines across, a joint as a tone band that narrows with distance, a ground rectangle, risers and cheeks, a flight of steps (far first; 'down' shows nosings, 'up' risers), the `Plane` quad for dressing laid out flat (`lib/persp.tsx`), and the equal-depth row construction. |
| `poissonDisk({w, h, r, seed})` | an even, natural scatter (Bridson), seeded and cached: lay litter, leaves, tufts and people's spots out in the plane's own coordinates, then project them. |
| `depthProblems(atm, planes)`, `sizeProblems(things, {horizon, height?})`, `DEPTH_TARGETS`, `dE76` | palette-level lints before a render: the air ladder (from the second plane behind the subject), the farthest plane's ΔE, the subject step, dark far colours, grey far colours (C* < 8); size inversions (across levels only with the camera `height`) and two cameras. Palette means are not area-weighted: "no air" is the pixel check's (`check_depth.py`). |

## API: lib/particles.tsx

| export | what |
|---|---|
| `<Particles kind seed region on .../>` | one field. `kind` 'motes' (in a light shape, against shade), 'dust' (pollen in sun-side air), 'leaves' (`floor`, `colors`, `leaf`: 'almond' or 'palmate', the plane or maple leaf that still reads as a leaf at phone size), 'glints' (four-point sparkles in the glitter path, `horizon`: they flatten toward it), 'birds' (a flock in a sky band, `dir`); `on` = the colour right behind (its contrast is set against it); `count`, or `births` (leaves: one per given time, to place 2-3 across a hold), `plane` + `atm` (size and speed x 1.5^-plane, the plane's air step), `tier` ('environment' default, 'support' x1.25 and contrast +5), `joins` (no entrance, a leaf's grow-in or a flock flying into its band, touches the 0.2 s either side), `avoid` (default the caption band; add the subject's box; a leaf whose fall would reach one shrinks out before it, never to come back), `margin` (the soft edge, 22 px; particles are born 0.6 of it inside: narrow a narrow region's margin), `t0` / `t1`, `sun` (lighter toward it; default the rig's key side), overrides `size`, `speed`, `life`, `gap`, `drift`, `lift`. Put it in the set's `<Lit>` and camera group, after what it floats in front of, outside a frame-0 `Look` (start it with `t0` after the flood). |
| `PRESETS`, `LIFT_MAX`, `SEEN_MIN`, `ALIVE_MAX`, `CAPTION_BAND`, `COVER_CAP` | per kind (CRAFT §f.6, SEEN at phone size: the owner on v4): count / cap (motes 8 / 10, dust 5 / 6, leaves 2 / 3, glints 6 / 6, birds 3 / 5), life (glints 0.3-0.8 s), gap, size (motes 6-10, dust 5-8, leaves 26-40, glints 20-36 px), speed, drift, lift (motes +15, dust +12, glints +20, birds -12 L*; three light steps 2 apart), grow / shrink shares, join rule ('keep' a steady field, 'hold' entrances), plane; the contrast limit per kind (motes 20, glints 25, leaves 30, dust and birds 15; tier B +5); the phone-size floor (on screen: motes 6, dust 5, leaves 26, glints 20 px; motes +12, glints +15 L*); <= 16 alive across a shot's fields; coverage <= 0.2 % of the frame per field. |
| `particlesAt(t, props, keyFrom)`, `particleProblems(fields, {joins})`, `glitterPath`, `regionSdf` | the field as data (QA, trails, the phone-size test's rings); the mover-budget lint (caps, contrast, the phone-size floor, top speed: motes and dust <= 12 px/s, entrances <= ~0.6/s with joins declared, births outside [t0, t1] or in a join's window, regions clear of the band, leaves that cannot fall clear, a flock's band narrower than the frame, <= ~16 alive); the sun's glitter column; a region's signed distance. |

## The parallax float (DIRECTION rule 8, COZY_AND_SCALE 3b.5; owner, 2026-10-28)
A hold either stays locked or floats gently, and a float is a PARALLAX float: each plane shows its own share of one
2D camera float. Nothing zooms or rotates, and the sky, the caption band and the UI stay fixed.

| export | what |
|---|---|
| `PARALLAX_K`, `parallaxK(plane)`, `PARALLAX_SKY` | a plane's share of the float: -2 (near ground) 1, -1 0.85, 0 (the subject) 0.6, +1 0.45, +2 (mid) 0.35, +3 (far city) 0.15, +4 (farthest) 0.05, the sky 0; fractional planes interpolate |
| `parallaxOffset(float, plane)` | the plane's offset in px (sub-pixel, never rounded) |
| `floatAt(t, legs, ease?)`, `FloatLeg` | the float as STRAIGHT LEGS `{t0, t1, to}` (near-ground px from home), each with a trapezoid speed profile (ease 0.25: the peak is 1.33x the leg's mean); home before the first leg, after the last and between legs that do not touch |
| `floatProblems(legs, {rest, maxOffset, maxSpeed})` | the lints: net offset <= 12 px, peak <= 10 px/s, home at every rest time (frame 0 / the loop match, every join, every map-critical frame) |

How to use it: wrap each plane's group in `<g transform={translate(parallaxOffset(floatAt(t, LEGS), plane))}>`.
- **Shadows and particles** ride their plane's group.
- **The clip paths** of a group are user-space inside it, so they move with it. A clip cut from another plane (a far
  jogger seen through a bridge arch) belongs in that plane's group.
- **Overscan:** give each plane >= 40 px beyond the frame edge (3b.5).
- **Rest:** the first leg leaves home after the hook's first beat, and the last arrives home >= 0.15 s before a
  push-through or a match cut, so the move starts from rest.

## The CRAFT §f numbers it implements

| CRAFT §f | in the code |
|---|---|
| 2. one flat step per plane toward its air, k 0 / .12 / .22 / .40 / .65; never grey or olive; the foreground 5 / 10 / 13 / 14 L* darker | `PLANE_STEPS`, `atmos`, `recede`, `NEAR_STEPS`, `nearStep` |
| 2. simpler with distance: 5 / 5 / 4 / 3 / 2 values, far windows tone-on-tone (ΔE <= 6) or none, no hairline past +2 | `planeLod`, `planePalette`, `toneOnTone`, `keepDetail` |
| 2. targets: farthest within ΔE 10 of its air, the ladder falling >= 3 per plane, the subject step >= 12, far darks within 20 L* | `DEPTH_TARGETS`, `depthProblems` (palette); `check_depth.py` (pixels) |
| 3. separation: tier A median \|ΔL*\| >= 15, a mass >= 12, a lit edge on a darker field | `SEPARATION`, `backing`, `separationOf` |
| 4. one camera, lines into the picture, rows foreshortening, joints visible (\|ΔL*\| >= 6 or a band >= 3 px) and narrowing | `groundCam`, `receding`, `band`, `seamTone`, `flight`, `quadForPlane`, `poissonDisk` |
| 5. no size inversion, one eye ratio within +-15 % | `groundCam.pxPerM`, `sizeProblems` |
| 6. particles: few, SEEN at phone size (leaves 26-40 px, glints 20-36 px x 4-6, motes 6-10 px against shade), slow, lighter than what is behind, grow in / shrink out, no entrance near a join | `Particles`, `PRESETS`, `SEEN_MIN`, `particleProblems` |

## Learned building it (keep)
- The clean pen's environment tier pulls every fill's value 16 % toward the background: a separation computed on the
  authored colours loses ~2-3 L* on screen. Compute with the edge as shown and pass `tier` to `backing`.
- A pale subject plane (S1's wing, L* ~76) sits close to a light air: a +2 brick row is as close to the wing as to the
  air (ΔE ~8 both ways). Start the far city at +3 there, and use `planePalette` so a far row of four materials shows
  two close values (edges under ΔE 6 stop reading as detail).
- `backing` keeps the field's hue: give it a far-plane colour (a dusty lavender stone, a receded brick), never a sky step
  between mint and gold (darkened, it is khaki).
- GrabCut masks vary by up to ~6 L* in the separation numbers with their random start: sheets carry polygons.
- Frontal steps going down away from the camera show nosings only (each hides the tread below): draw them far first
  (`flight`), or show the depth with things that run into the picture (a stair cheek, a row of bollards, joints).
- Particles: one noise seed for the module (its cache keeps 10); leaves fall down a gutter (never through the caption
  band); motes read only against shade; a field drawn inside a frame-0 `Look` would paint paper-white specks.
- SEEN at phone size (the owner on S1's v4, 2026-10-28: "I don't see any changes in the particles anywhere"): v4's
  13 px leaves, 14-24 px glints and 3-4 px motes vanished at phone size. Test every shot at 360 px wide (three frames,
  every particle ringed from `particlesAt`; L1's report has the script): leaves 34-40 px read as leaves there (an
  almond reads as a seed: use `leaf: 'palmate'`), 26-36 px sparkles read, 8-10 px motes read only as specks, so put
  them in the brightest sunlit air against the darkest shade near the sun. A leaf needs a calm path through the open
  mid ground, where the eye goes (S1: blown in from off-frame on a light breeze, 115 px/s across, ~40 px/s down);
  a 54 px wide region needs a margin of ~8 (the default 22 shrank everything but its middle).
- From the critic's pass (2026-10-28; the same frame renders byte-identical in any order and process, ~0.4 ms of
  `particlesAt` per frame for five fields): the raw curl flow peaks near 3x unit speed (motes ran up to 28 px/s against
  3-12: it is capped at 1); a particle born at its region's edge starts shrunk (a quarter of a narrow glitter column's
  glints stayed under 5 px: they are born 0.6 of the margin inside); a leaf drifting into the caption band shrank
  away and grew back below it (now it shrinks out for good, and the lint names the field); a flock's life must cover
  its tail (its last bird vanished half in view) and its entrance runs until the last bird is in; a leaf's grow-in is
  its entrance (it must not overlap a join's 0.4 s).

## Owner decisions (never applied quietly)
A fog or haze gradient, a depth-of-field blur, a glow or bloom, grain, the halftone as an `@remotion/effects` raster, a
true-3D move (`@remotion/three`): each needs the owner's yes (DIRECTION forbids blur, glow discs and gradients; the
sky's gradient is the one exception). The parallax float is decided (owner, 2026-10-28: the section above).
