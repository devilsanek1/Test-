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
| `makeAtmosphere({name, air, steps?, near?, chroma?, hueTurn?, chromaFloor?})` | ONE per set (W1, with its light rig). `air` = the sky's lowest step right behind the planes (one colour, or one per plane); `hazeFromSky(skyTopToHorizon)` takes it from a sky's colours. Steps `PLANE_STEPS` 0 / .12 / .22 / .40 / .65; foreground `NEAR_STEPS` 5 / 10 / 13 / 14 L* darker. |
| `recede(color, plane, atm, {tier})`, `recedeAll(palette, plane, atm)`, `atmos(color, k, air)`, `nearStep`, `planeK` | a colour on its plane: farther = one flat step toward its air (`atmos`), nearer = a value step darker; `tier: 'subject'` takes half the step (it may read one plane nearer). `atmos`: L* toward the air's; a hue on the air's side converges on it in a*b*; a hue across from it keeps its hue, chroma x (1 - 0.8 k); never under C* 8, never into the olive band (h 88-118 at C* < 30). |
| `planeLod(plane)`, `planePalette(colors, plane, atm)`, `keepDetail(px, plane)`, `toneOnTone(wall, {lit})`, `seamTone(c, dL)` | simpler with distance: values 5 / 5 / 4 / 3 / 2, the widest step between them (spread) 24 / 12 / 5 ΔE on +2 / +3 / +4, windows lit / tone / none, hairlines to +2, smallest part 0 / 3 / 4 / 8 / 12 px. `planePalette` recedes a set of materials and merges them to the plane's values; `toneOnTone` a far window (ΔE <= 6 from its wall); `seamTone` a joint's tone (dL* 7: visible at >= 6). |
| `backing(edge, field, {min, dir, tier, bg})`, `separationOf`, `SEPARATION` | the calm field behind a subject's edge: the FIELD's colour moved in L* until the edge parts by `min` (15 tier A, 12 a mass), a lit edge on a darker field, a shaded one on a lighter field; `tier` pre-compensates the clean pen's value pull on that field (environment 16 %), so the step SHOWN meets `min`. Pass a far-plane colour as the field, never a sky step (darkened in its own hue it turns khaki). |
| `groundCam({horizon, vpx, f, height, yaw})`, `camFromSheet` | ONE camera per shot: `pt(x, z, level)` (metres -> px), `y(z)`, `z(y)`, `scale(z)`, `pxPerM(y, level)`, `vp`, `vpX` (two-point under a yaw). v2 S1's lens = `groundCam({horizon: 965, f: 1400, height: 1.3})`. |
| `receding`, `crossing`, `band`, `groundPoly`, `frontFace`, `sideFace`, `flight`, `flightCheek`, `quadForPlane`, `projectPts`, `rowsZ`, `rowYs` | the ground recedes: lines into the picture (to the VP), lines across, a joint as a tone band that narrows with distance, a ground rectangle, risers and cheeks, a flight of steps (far first; 'down' shows nosings, 'up' risers), the `Plane` quad for dressing laid out flat (`lib/persp.tsx`), and the equal-depth row construction. |
| `poissonDisk({w, h, r, seed})` | an even, natural scatter (Bridson), seeded and cached: lay litter, leaves, tufts and people's spots out in the plane's own coordinates, then project them. |
| `depthProblems(atm, planes)`, `sizeProblems(things, {horizon})`, `DEPTH_TARGETS`, `dE76` | palette-level lints before a render: the air ladder, the farthest plane's ΔE, the subject step, dark far colours, grey far colours; size inversions and two cameras. |

## API: lib/particles.tsx

| export | what |
|---|---|
| `<Particles kind seed region on .../>` | one field. `kind` 'motes' (in a light shape, against shade), 'dust' (pollen in sun-side air), 'leaves' (`floor`, `colors`), 'glints' (in the glitter path, `horizon`), 'birds' (a flock in a sky band, `dir`); `on` = the colour right behind (its contrast is set against it); `count`, `plane` + `atm` (size and speed x 1.5^-plane, the plane's air step), `tier` ('environment' default, 'support' x1.25 and contrast <= 20), `joins` (no entrance within 0.2 s), `avoid` (default the caption band; add the subject's box), `t0` / `t1`, `sun` (lighter toward it; default the rig's key side), overrides `size`, `speed`, `life`, `gap`, `drift`, `lift`. Put it in the set's `<Lit>` and camera group, after what it floats in front of, outside a frame-0 `Look` (start it with `t0` after the flood). |
| `PRESETS`, `CAPTION_BAND`, `COVER_CAP` | per kind: count / cap (motes 6 / 8, dust 5 / 6, leaves 1 / 2, glints 4 / 6, birds 3 / 5), life, gap, size, speed, drift, lift (motes +10, dust +7, glints +15, birds -12 L*), grow / shrink shares, join rule ('keep' a steady field, 'hold' entrances), plane; coverage <= 0.2 % of the frame per field. |
| `particlesAt(t, props, keyFrom)`, `particleProblems(fields, {joins})`, `glitterPath`, `regionSdf` | the field as data (QA, trails); the mover-budget lint (caps, contrast, speed, entrances <= ~0.6/s with joins declared, regions clear of the band, <= ~12 alive); the sun's glitter column; a region's signed distance. |

## The CRAFT §f numbers it implements

| CRAFT §f | in the code |
|---|---|
| 2. one flat step per plane toward its air, k 0 / .12 / .22 / .40 / .65; never grey or olive; the foreground 5 / 10 / 13 / 14 L* darker | `PLANE_STEPS`, `atmos`, `recede`, `NEAR_STEPS`, `nearStep` |
| 2. simpler with distance: 5 / 5 / 4 / 3 / 2 values, far windows tone-on-tone (ΔE <= 6) or none, no hairline past +2 | `planeLod`, `planePalette`, `toneOnTone`, `keepDetail` |
| 2. targets: farthest within ΔE 10 of its air, the ladder falling >= 3 per plane, the subject step >= 12, far darks within 20 L* | `DEPTH_TARGETS`, `depthProblems` (palette); `check_depth.py` (pixels) |
| 3. separation: tier A median \|ΔL*\| >= 15, a mass >= 12, a lit edge on a darker field | `SEPARATION`, `backing`, `separationOf` |
| 4. one camera, lines into the picture, rows foreshortening, joints visible (\|ΔL*\| >= 6 or a band >= 3 px) and narrowing | `groundCam`, `receding`, `band`, `seamTone`, `flight`, `quadForPlane`, `poissonDisk` |
| 5. no size inversion, one eye ratio within +-15 % | `groundCam.pxPerM`, `sizeProblems` |
| 6. particles: few, small, slow, lighter than what is behind, grow in / shrink out, no entrance near a join | `Particles`, `PRESETS`, `particleProblems` |

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

## Owner decisions (never applied quietly)
A parallax float (planes drifting at 1 - depth: `COZY_AND_SCALE.md` 3b.5 says one card), a fog or haze gradient, a
depth-of-field blur, a glow or bloom, grain, the halftone as an `@remotion/effects` raster, a true-3D move
(`@remotion/three`): each needs the owner's yes (DIRECTION forbids blur, glow discs and gradients; the sky's gradient is
the one exception).
