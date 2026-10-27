# Depth, separation and particles for a flat, clean 2D world in Remotion: libraries and craft (research, 2026-10-27)

Library-scout lane for the owner's note on video 2's G4 look clip (`deliverables/v2/v2r_G4_look.mp4`, the S1 opening):
"the foreground and the main focus still blurs with the background supporting entities ... the Google office vs the
building on the background ... no distance effect nor perspective ... the bottom part ... little to no perspective or
depth ... research some libraries on GitHub ... add perhaps a bit of particles here and there". The rule it produced is
the playbook's "DEPTH AND SEPARATION" and DIRECTION rule 2's depth clause.

**Rank:** research notes, the lowest rank (DIRECTION > CRAFT > PIPELINE_V2 > gate specs > look docs > these notes).
Nothing here is a rule until the integrator moves it into `CRAFT.md`, `LIFE_AND_DENSITY.md` or `src/lib`. Anything
that needs blur, glow, a gradient, grain or a third-party animation is marked **OWNER DECISION** and is never applied
quietly. **Tags:** VERIFIED means read from the npm registry, a package tarball or our `node_modules`, run in a local
test, or measured on our frames. REPORTED means taken from a web search summary: page fetches were blocked in this
sandbox for `www.remotion.dev` and `glossary.ametsoc.org`. PROPOSAL means our own idea, not yet tried in a render.

## 0. Bottom line

**The recommended stack.** The depth fix needs no new runtime dependency. Use what is installed, plus about 150 lines
of our own code:
- `@remotion/noise` drives all natural motion, with one seed per system.
- `@remotion/paths` gives `warpPath` for curves on a steep ground plane, and `getPointAtLength` / `getTangentAtLength`
  for particles that follow a path.
- `lib/persp.tsx` builds every receding plane. Draw the ground's joints and dressing flat, in the plane's own
  coordinates, then project them, so convergence, foreshortening and the size and texture gradients come out right.
- One `atmos()` colour operator, built on the gamut-safe CIELCh helpers already in `lib/light.tsx` (`lch`, `fromLch`),
  does the atmospheric perspective. It moves lightness toward the haze behind the plane, scales chroma down and keeps
  the hue. It never does a straight sRGB mix toward a sky of the opposite temperature (§4).
- A small closed-form particle module (motes, leaves, glints, birds) draws through `Fill` on the environment tier,
  sized and coloured by the plane each particle lives in, and lives only inside the light (§6).

Two optional additions: `culori` if we want gamut mapping or ΔE2000 in TypeScript, and `poisson-disk-sampling` (or a
40-line Bridson sampler) for natural scatter. Particle engines, 3D engines and the canvas effect packs are rejected,
for the reasons in §2.

**Top craft rules** (sources in §7):
1. **Separate the planes by value first.** Each plane is one value group. The subject never shares a value key with
   the plane right behind it.
2. **Atmospheric perspective converges on the haze behind the plane.** Lights get darker, darks get lighter, chroma
   drops, and the hue holds or turns slightly cool. Use fixed steps per plane (0 / 12 / 22 / 40 / 65 %), with values
   5 / 5 / 4 / 3 / 2 and less detail per plane.
3. **The subject gets the edge.** It has the hardest value step and the only full outline, and it is separated by
   counterchange (light against dark, dark against light), never by a line alone.
4. **Overlap, never tangent.** The subject cuts in front of the far plane. Edges that only touch fuse the planes.
5. **The ground recedes.** Lines that run into the picture converge on a vanishing point (VP). Equal steps compress
   toward the horizon, things shrink as 1/distance, and texture gets finer. In a frontal view the risers stay level, so
   the depth must come from the lines that run inward, or from a 15-30° turn into two-point perspective.
6. **Particles obey the light and the wind.** Few (4-8 visible at once), small, slow and lighter than what is behind
   them. Motes appear only inside a light shape, and glints only in the sun's glitter path. They grow and shrink in and
   out (never an opacity fade), and stay deterministic per frame.
7. **Motion adds the parallax cue.** Planes move at f = 1 − depth. Today's cozy float moves the whole set as one card,
   so this is an owner decision (§2, item 7).

## 1. What the G4 frame shows, in numbers (VERIFIED)
Measured on `v2r_G4_look.mp4` at 5.5 s (1080 x 1920; CIE Lab via OpenCV on float RGB; local contrast as in CRAFT §e,
the mean |L* − Gaussian(L*, σ 16)|; C90 is the 90th percentile of C*).

| region (frame px) | L* mean | L* p5-p95 | C* mean | C90 | share C* > 25 | local contrast |
|---|---|---|---|---|---|---|
| far city, x 0-320, y 745-935 | 74.9 | 32.3 | 19.3 | **34.2** | 29.8 % | **7.8** |
| Google wing, x 340-1080, y 630-1060 | 75.2 | 69.6 | 18.2 | 41.3 | 24.8 % | 8.7 |
| steps, x 0-1080, y 1220-1900 | 79.4 | 33.0 | 12.3 | 16.9 | 4.4 % | 3.7 |
| canal, y 1110-1200 | 73.0 | 33.4 | 16.7 | 26.4 | 12.8 % | 4.1 |

- **The far plane has no atmospheric step at all.** It has the wing's value key (L* 74.9 against 75.2) and the same lit
  windows (L* 84.2 / C* 39.8 against the wing's 83.9 / C* 40.7). Its walls and roofs carry more chroma than the wing's
  (C* 26.8 against 20.5). That is the owner's "blurred together", measured.
- **CRAFT §b's existing tier-C budget already fails on this one plane.** The budget is local contrast ≤ 7 and C90 ≤ 25
  (or saturated colour at contrast ≤ 7); the far city measures 7.8 and 34.2. The budget was only ever checked over the
  whole environment, where the calm sky and the flat bands dilute it, and never plane by plane.
- **The haze behind the far city is the gold horizon band, not the mint sky.** It measures #F5D7BC (the band, #F6D9BC);
  the mint #BBDBCF starts above y ~600.
- **Code.** S1's far roofs use the near role colours (`V2S1_set_far.tsx`: `CM.brickLight`, `CM.stucco`,
  `CM.limestone`), with only the environment tier's pull (value 16 %, chroma x0.85). The kits' depth helpers (dc
  `atm()` / `atmShade()`, cine `atmos()`) mix in gamma sRGB toward the mint sky (§4).
- **Steps (the bottom of the frame).** 13 of the 15 long lines (≥ 220 px) are level (< 2°); the other two are 4° shadow
  edges. Tread depths grow about 91, 116, 152 and 190 px toward the camera, so the spacing has some foreshortening. But
  no line runs into the picture, the props keep one size on every step, and the paving has no joints that converge or
  get finer: it is an elevation of stacked bands. L1's ground pass (commit 6162e73, 2026-10-27) has since turned the
  bank to two-point perspective, which agrees with §5.
- **Duplication found in passing.** Our code has five gamma-sRGB mixes (`lib/cine/util.ts` `mix`, `lib/light.tsx`
  `mixHex`, `src/v2r/kit/dc/core.tsx` `mix`, `src/v2r/kit/boards/StatementBoard.tsx` `mixHex`,
  `src/v2r/scenes/V2S7_rig.ts` `mixHex`) and two CIELab implementations (`lib/pen.ts` `hexToLab` / `labToHex`,
  `lib/light.tsx` `lab` / `lch` / `fromLch`, the latter with gamut reduction). This is a consolidation candidate for the
  tooling lane, not urgent.

## 2. Ranked shortlist
Weekly downloads are for 2026-10-20..26 (api.npmjs.org); sizes are npm's unpacked size. Every package was checked with
`npm view` from here (VERIFIED); none was installed.

### Adopt
1. **`@remotion/noise`**: already installed, 4.0.538 (latest 4.0.539); MIT; 6 kB; wraps `simplex-noise` 4.0.1 (MIT);
   80 k/week.
   - *Gives us* smooth seeded noise for drift, sway variety, leaf flutter, curl-noise motes and glint timing.
   - *Deterministic* (VERIFIED): the same seed and coordinates give the same value. Output ±1, sd 0.44, the same as
     `simplex-noise` fed a proper PRNG. Its permutation table comes from a constant `random(seed)` callback, and it
     shows no visible pattern.
   - *Cost* (VERIFIED): 40 ns per `noise2D` call, 88 ns per `noise3D` call.
   - *Risk* (VERIFIED): it caches only 10 seeds, first in first out. With one seed per particle (40 seeds), 2e5 calls
     took 10.1 s instead of 15 ms, so use **one seed per system** and give each particle its own coordinate offset.
   - *Fit:* motion only, no look of its own. Its docs' dot-grid demo animates opacity (REPORTED), which DIRECTION rule 8
     forbids: drive scale instead.
2. **`@remotion/paths`**: already installed, 4.0.538; MIT; 1.1 M/week.
   - `warpPath` subdivides a path and maps every point (since v3.3.43; a port of WarpJS; REPORTED). It handles curves
     on a steeply foreshortened plane. `persp.tsx` `projectPath` maps only the cubic control points, which is exact
     for straight lines but approximate for curves under projection.
   - `getPointAtLength` and `getTangentAtLength` let a particle follow a path: a leaf's glide, glints along a ripple
     line, a bird's flight line.
   - It is pure and vector, and `Ink`, `Fill` and `persp` already use it.
3. **Our own code, no dependency** (PROPOSAL; opt-in, so v1 and v3 renders stay byte-identical):
   - an `atmos()` operator on `lib/light.tsx`'s `lch` / `fromLch` (§4);
   - `lib/particles.ts`, closed-form fields built on `lib/rng`, `lib/idle` (`events`, `puffs`) and `@remotion/noise`
     (§6);
   - a `persp.tsx` helper that scatters points in a plane's own coordinates and projects them (§5).

### Consider
4. **`culori`** 4.0.2 (2025-06): MIT; no dependencies; ESM + CJS; tree-shakeable through `culori/fn`; 3.37 M/week;
   1.1 MB unpacked, of which we would use a few kB.
   - It has OKLab / OKLCH, CIEDE2000 and ΔEOK, CSS Color 4 gamut mapping, and interpolation in any colour space, all as
     pure functions.
   - Take it only if we need gamut mapping or ΔE2000 in TypeScript. `atmos()` needs neither: `fromLch` already reduces
     chroma until the colour fits the gamut. Move to OKLCH (via culori, or Ottosson's 30 lines) only if a cool palette
     shows CIELab's known drift of blues toward purple (REPORTED).
5. **`poisson-disk-sampling`** 2.3.1 (2022-06, stable): MIT; 42 kB, plus the `moore` dependency; 8.4 k/week.
   - It gives an even, natural, non-grid scatter, with a custom RNG and a density function (README VERIFIED). Uses:
     litter on steps, tufts, pebbles, spots for people.
   - It is deterministic when fed `() => r.next()` from `lib/rng`. Compute it once per seed (a module cache or
     `useMemo`), never per frame.
   - Alternative: Bridson's 2007 algorithm is about 40 lines in `lib`.
6. **`@remotion/shapes`**: already installed, 4.0.538; MIT.
   - `makeSpark` draws a 4-point glint as ONE closed path. `makeEllipse`, `makeStar` and `makePolygon` are other
     clean-pen-friendly path makers.
   - Draw their `path` through `Fill` / `Ink` so the tiers apply, not through their components (which also take
     canvas `effects`).
7. **A parallax float** (an engine change, not a library; PROPOSAL; **OWNER DECISION**).
   - Apply the cozy float plane by plane, with f = 1 − depth: sky 0, far 0.1-0.3, mid 0.5, near 1. This is the
     multiplane camera's cue, and `lib/cine/camera.tsx` `Layer depth` already does the maths.
   - At the float's 8-12 px/s a far plane would drift only 1-3 px/s: felt rather than seen.
   - `COZY_AND_SCALE.md` 3b.5 says "the whole set moves as one card (no parallax needed)", so this changes a look rule:
     ask the owner.
8. **`colour-science`** (Python, BSD-3, PyPI 0.4.7): for a QA depth check, and only if it needs ΔE2000 or OKLab.
   OpenCV Lab already covers L*, C* and local contrast.

### Reject
- **Particle engines: `tsParticles` / `@tsparticles/engine` 4.5.0** (MIT, 340 k/week), **`@pixi/particle-emitter`**
  5.0.10, **`proton-engine`** 7.1.5, **`particles.js`** 2.0.0.
  - They are stateful simulations stepped by `requestAnimationFrame`. tsParticles has a seedable `setRandom`
    (VERIFIED), but each particle carries state from tick to tick. A render tab that starts cold at frame 900 therefore
    draws a different field from one that has played frames 0-899.
  - They draw on a canvas raster, outside `Ink` / `Fill`, the tiers and the light rig, and they look generic.
  - Our fields are 20-80 lines of closed form (§6).
- **`simplex-noise` 4.0.3 used directly, `open-simplex-noise` 3.0.0** (Unlicense): duplicates of `@remotion/noise`,
  which already ships simplex-noise. Use simplex-noise directly only for something `@remotion/noise` lacks, seeded with
  an alea PRNG.
- **`chroma-js` 3.2.0** (BSD-3 AND Apache-2.0, 397 kB), **`colorjs.io` 0.7.1** (MIT; the CSS Color 4 reference
  library, correct but 15.8 MB unpacked for three functions), **`d3-color`** (no OKLab).
- **`@remotion/three`** with `three` 0.186.1 (20 MB) and `@react-three/fiber` 9.8.2.
  - It is a WebGL canvas outside the SVG pen, the tiers and the light module.
  - It is deterministic only when driven from `useCurrentFrame()`, never from `useFrame` or a clock.
  - It is worth it only for a one-off true-3D move (a crane through a city), with the owner's yes.
- **`@remotion/svg-3d-engine`** 4.0.539: its README says "internal package and has no documentation", and it has no
  licence field (VERIFIED). It does extrusion, not planes.
- **`@remotion/motion-blur`** 4.0.539 (MIT). `CameraMotionBlur` renders the children N times at opacity 1/N (VERIFIED
  in its source), and `Trail` stacks ghost copies: blur, at N times the render time. **OWNER DECISION** if a fast move
  ever needs it.
- **`@remotion/effects`** 4.0.539 (npm says "UNLICENSED", so Remotion's terms apply; first published 2026-05).
  - It has 80+ WebGL effects (blur, glow, light-leak, paper, burlap, halftone, long-shadows, noise, roughen-edges,
    vignette ...), applied to canvas components.
  - On our SVG it needs `<HtmlInCanvas>`, which requires "Chrome 149 or newer with Canvas Draw Element enabled"
    (VERIFIED in remotion 4.0.538). Our headless shell is Chrome 153.0.8010.12, without that flag.
  - It turns the vector frame into a raster, and most of it is what DIRECTION forbids.
  - Its `halftone` could serve the owner's optional halftone, but an SVG `<pattern>` of dots does that in vector, and
    dots that get finer with distance even add a texture gradient. **OWNER DECISION**, and a last step only.
- **`@remotion/light-leaks`, `@remotion/starburst`** (Remotion License): glow and gradients by design.
- **`@remotion/lottie`, `@remotion/rive`:** third-party animation outside the pen (the playbook: everything is drawn
  new for each film).
- **`@remotion/rough-notation`** (roughjs: rough lines), **`@remotion/p5`** (stuck at an old 3.0 prerelease,
  3.0.0-processing.7),
  **`@remotion/gsap`** (GSAP timelines; our timing is pure functions of t).
- **SVG `feTurbulence` / `feDisplacementMap`:** grain, paper or a wobble (CRAFT §c: no grain, no boil), and slow to
  rasterize at 1080 x 1920. **OWNER DECISION.**
- **CSS `color-mix(in oklab, …)`, CSS 3D transforms.** Colours must stay known hex values, because `tierFill`, the
  emissive set and `check_light` read them. CSS 3D turns a layer into a raster and breaks the screen-px strokes that
  `persp.tsx` keeps.
- **`perspective-transform` 1.1.3, `polygon-clipping` 0.15.7, `paper.js`:** `persp.tsx` already solves the 4-point
  homography, and same-colour flat shapes on tier C already merge without boolean operations.

## 3. The stack in one paragraph
The depth fix needs no new runtime dependency.
- **Ground and perspective:** draw every receding plane with `lib/persp.tsx` (`groundQuad`, `wallQuad`, `frontQuad`,
  `<Plane>`, `eyeLevel`). Put the ground's joints, steps, litter and people in the plane's own flat coordinates at a
  uniform density, then let the homography produce the convergence and the size and texture gradients. Use
  `@remotion/paths` `warpPath` for round things on a steep plane.
- **Distance in colour:** one `atmos(color, k, haze)` operator on `lib/light.tsx`'s CIELCh helpers, with the haze
  taken at the horizon behind each plane and k = 0 / .12 / .22 / .40 / .65 per plane.
- **Natural motion:** `@remotion/noise`, one seed per system. Stateless curl-noise motes, fluttering leaves, glints in
  the glitter path and far birds, in a small closed-form `lib/particles.ts`.
- **Drawing:** everything goes through `Fill` / `Ink` on the environment tier, so the clean pen, the tiers and the
  light module keep working unchanged.
- **Optional:** `culori` for OKLCH or ΔE2000, and `poisson-disk-sampling` or a 40-line Bridson sampler for scatter.
- **Kept out:** blur, glow, gradients, grain, rasterizing effect packs and particle engines, unless the owner asks.

## 4. Colour: atmospheric perspective that stays warm (VERIFIED numbers)
**Brick #C9806A** (L* 60.7, C* 35.0, h 43) stepped toward the haze at the far-plane steps:

| operator | 22 % | 40 % | 65 % |
|---|---|---|---|
| gamma-sRGB mix toward the mint sky (dc `atm`, cine `atmos`) | #C69480 L66 C24 h48 | #C4A592 L70 C16 h59 | #C1BCAC L76 C9 h97 |
| linear-light mix toward the mint (Koschmieder's airlight) | #C69B89 L68 C21 h49 | #C4AD9D L72 C13 h63 | #C1C2B4 L78 C8 h112 |
| OKLab mix toward the mint | #C99580 L66 C25 h48 | #C8A692 L71 C18 h58 | #C5BCAB L77 C10 h88 |
| **lift toward the gold band, hue kept** (proposed) | #D29481 L67 C29 h43 | #D9A493 L72 C24 h44 | #E2BAAE L79 C17 h42 |
| the same, turning 25°·k toward rose | #D49284 L67 C29 h37 | #DBA299 L72 C24 h33 | #E4B9B6 L79 C17 h26 |

**Other colours:**
- **shadeWarm #8C5E6B:** at 65 % toward the mint, the sRGB mix goes grey (#ABB0AC, C* 2.9). The lift keeps it rose
  (#C6AEB4, C* 9.7, h 1).
- **paneUnlit #5E6F86:** an OKLab mix toward the gold band goes grey at 40 % (C* 2.8), then tan at 65 % (h 66). The
  lift keeps its hue, h 267.
- **Lit lamp #F7CF86:** at k 0.40 it is still C* 28 after the lift. Far windows should therefore be the wall's own
  colour, one tone-on-tone step lighter (`CINEMATIC_GUIDE.md` Scale cues 2), never the lamp colour.

**What the table shows.** Any straight mix between a warm colour and a cool sky crosses the neutral axis, whether in
sRGB, linear light or OKLab. The far planes pass through tan, khaki and olive-grey (h 55-110 at C* 8-16): the "beige,
muddy tan, olive or grey" that DIRECTION rule 6 bans. The colour space matters less than the path. The fix has three
parts:
1. The haze is the sky **at the horizon behind that plane**. In S1 that is the gold band, not the mint caption sky.
2. Move only lightness and chroma, and keep the hue. `lib/pen.ts` `tierFill` already says so: "never mixed toward the
   background's hue: a blue pulled toward a peach wall would go grey". Optionally turn a warm plane slightly toward rose
   or lilac (warm near, dusty-rose far), or a cool plane toward the sky's hue.
3. Work in CIELCh with `fromLch`'s gamut fit, or in OKLCH for cool palettes.

**The operator** (PROPOSAL, for `lib/light.tsx` or a shared colour module):
`atmos(c, k, haze, {chroma = 0.8, hueShift = 0})` = `fromLch(L + (L_haze − L)·k, C·(1 − chroma·k), h + hueShift·k)`.
- **k per plane:** 0 / .12 / .22 / .40 / .65, the steps `CINEMATIC_GUIDE.md` Scale cues 5 measured on Arcane.
- **These steps are Koschmieder's law with each plane about twice as far** (our arithmetic): 1 − e^(−βd) = .12, .22,
  .40 and .65 at βd ≈ 0.13, 0.25, 0.51 and 1.05 [2].
- **Light colours get darker with distance.** Stucco goes from L* 91.4 to 90.1 at k 0.40, toward the gold band's 88.4,
  because the haze is darker than it. The rule is "toward the haze's value", not "lighter" [3].
- **Shade colours** take the same operator. `atmShade()`'s lean toward `shadeCool` becomes a hue turn, never a mix
  through grey.
- **Fewer values per plane:** 5 / 5 / 4 / 3 / 2, near to far.

**S1's far palette at k 0.40, toward #F6D9BC with the hue kept** (an example, not a pick):
- brickLight → #E7BCA9 (L* 79.5, C* 20)
- brick → #D9A493 (L* 71.8, C* 24)
- stucco → #ECE1D5 (L* 90.1)
- stoneShade → #D1CDD8 (L* 83)
- shadeWarm → #B08E97 (L* 62.3, C* 14)

That plane spans L* 62-90 at C* ≤ 24, a narrow, light band behind a wing that keeps L* 50-90 and C* up to 41.

## 5. Perspective and the ground in a vertical frame
**The geometry.** In one-point perspective, lines parallel to the picture plane stay level and vertical, so the G4
frame's level risers are not themselves the error. The depth lives in the lines that run into the picture: paving
joints, step ends, side walls, rails, the canal edge, a handrail. They all converge on one VP on the horizon [9].
- **Equal steps in depth compress toward the horizon.** A ground line sits at screen
  y = horizon + (y_near − horizon)·z_near / z, so a tread's screen depth falls roughly as 1/z².
- **Sizes fall as 1/z.** For people, `eyeLevel()` already gives the size from the screen y of the feet.
- **Texture gets finer with distance** (joint spacing, leaf size, litter): a texture gradient, one of the standard
  pictorial depth cues with relative size, relative height, occlusion, linear and aerial perspective [5].

**The recipe in our engine** (PROPOSAL):
- Draw the ground with `groundQuad` / `wallQuad` and `<Plane>`.
- Lay out joints, litter, leaves and people's spots uniformly in the plane's own coordinates, with a Poisson disk or
  a jittered grid. The projection then produces the density and size gradient.
- Draw small round things on a steep plane (stones, wheels, puddles) with `warpPath` through the same homography.
- Where the shot allows, turn the steps 15-30° into two-point perspective so the risers converge too. This is the
  strongest single fix, and L1's ground pass does it.

**A vertical frame helps.** The ground can fill 40-60 % of a 9:16 frame when the camera sits above eye height and
looks down a little. Reference 1 `f_0.5.png` is the model. Its kerbs, rails and rows of chairs run to a VP about 40 %
of the way down the picture, and the chair rows shrink about 4x from the nearest to the farthest (an eye estimate).
It gets almost all its depth from linear perspective and the size gradient, with little colour change.

**Overlap, never tangent.** The subject's silhouette cuts in front of a far shape. Edges that only touch fuse the planes
("kissing", [8]). In the G4 frame the wing's left edge and the far city's last building meet at about x 330 (an eye
check).

## 6. Particles: few, in the light, deterministic (PROPOSAL; costs VERIFIED)
**Rules for every field:**
- **Few.** 4-8 visible at once per field. The earlier proposal in `arcane.md` said 6-12 specks; CRAFT §b measures about
  7 small movers per 0.5 s in reference 1 and v1.
- **Small and slow.** Motes 2-4 px at 3-12 px/s; leaves 8-14 px near.
- **Lighter than what they float in**, or in the plane's own `atmos` colour.
- **In and out by scale.** Each one grows in (about 15 % of its life) and shrinks out (about 25 %). Never an opacity
  fade (DIRECTION rule 8).
- **Out of the caption band (y ~290-600), never across the subject.**
- **Around joins.** No new entrance (a leaf, a bird) in the 0.4 s around a join, but a continuous field keeps its pace
  through it (CRAFT §a: a freeze reads as a glitch).
- **Not texture.** Particles are movers, and DIRECTION rule 4's "no specks" means static dark marks. A one-line
  clarification in CRAFT §c would keep the two from reading as a clash (§8).

**Motes:**
- Only inside a light shape: clip them to the pool or shaft from `lib/light.tsx`. Only where they are lighter than the
  shade behind them (L* +8 to +15); they vanish against the sky, so place them against shade.
- They drift on curl noise. Curl noise is divergence-free, so the motes swirl but never clump or spread [10].
- They rise or fall slightly, and live 3-5 s.

**Leaves:**
- They flutter: a side-to-side swing whose tilt leads the sway by a quarter period, falling slowest at the turns.
- A few tumble, drawn as a scaleX spin. Flutter and tumble are the two modes of falling plates [12].
- Size, swing and speed scale with the plane's depth, and the colour takes its `atmos` step.
- The canal kit's `FallingLeaves` already sways and spins, but on separate clocks; tie the tilt to the sway.

**Water glints:**
- Only in the glitter path under the sun: a column whose width-to-length ratio is about the sine of the sun's elevation
  [13]. Under S1's low sun at the left, that is a narrow column below the sun, not glints all over the canal.
- Each glint is a short level dash in the light tint (CRAFT §c: L* +10 to +20). Dashes get shorter and rows closer
  with distance, through the water plane's projection.
- 3-6 are alive at once, each living 0.2-0.6 s and scaling in and out over 2-3 frames.
- At most one `makeSpark`, on the brightest glint, on a beat.

**Birds:**
- Far birds are paler (their `atmos` step), smaller and slower on screen.
- Use Scale cues 11's numbers (near V's 24-44 px, flapping 3-4 Hz, gliding phases). `lib/cine/sky.tsx` `Birds` is the
  reference; it is not clean-pen-aware.

**Determinism and cost** (VERIFIED with a throwaway prototype):
- **Pure functions.** Every particle is a pure function of (t, seed). Each one is born from a seeded schedule
  (`events()`, or `rand(seed, i/cycle)`).
- **Stateless re-simulation.** A field that must follow a flow is re-simulated from its seeded birth at every frame.
  12 curl-noise motes with 3-5 s lives at 30 sub-steps/s cost 0.30 ms per frame. A frame rendered alone equals the same
  frame rendered in sequence, so Remotion's parallel tabs agree.
- **Integrate to the exact age.** The last sub-step must be partial. In the prototype, motes without it updated only
  every other 60 fps frame: measured speeds alternated between 0 and twice the true speed.
- **No hidden state.** One noise seed per system (§2, item 1). Never `Math.random`, `requestAnimationFrame` or a clock
  [14].
- **Drawing.** Draw through `Fill` with a `Batch`: one path per colour. Decide per field whether its colour takes the
  environment pull (subtler) or joins the pen's emissive set (it reads as lit).

## 7. Craft notes with sources
1. **Value planes.** Give the foreground, middle ground and background each one major value. The same value in two
   planes flattens the picture. Put the focal point where the value contrast is strongest [6]. Check with a two- or
   three-value thumbnail (notan) that the subject is the clearest shape.
2. **Atmospheric perspective.** Airlight lowers a distant object's contrast. Koschmieder's 1924 law gives the airlight
   toward a dark object at the horizon, and the AMS Glossary defines aerial perspective as that reduced contrast [2].
   Painters' rule of thumb: far is lighter, less contrasted, less detailed, less saturated and often cooler [3, 4, 7].
   One caveat: objects lighter than the haze darken with distance [3].
3. **Edges and counterchange.** Separate touching shapes by value rather than outline: darken the tree where it meets
   the house, so the shape changes value along its edge against changing grounds. Pair the darkest dark with the
   lightest light at the focal point [11].
4. **Overlap, never tangent.** Near-touching edges fuse planes and "confuse the spatial depth"; overlap them or leave a
   clear gap [8].
5. **Pictorial depth cues.** Occlusion, relative size, familiar size, relative height, texture gradients, linear
   perspective and aerial perspective. The brain combines them, so use several at once [5]. Gibson (*The Perception of
   the Visual World*, 1950) is the classic account of texture gradients.
6. **The one-point floor.** Joint lines get closer together going back, and exact spacing comes from a construction,
   not from the eye [9].
7. **Parallax.** Disney's multiplane camera (1937, first used on *The Old Mill*) filmed up to seven painted planes
   moving at different speeds [15]. 2D background practice still splits a picture into foreground, middle ground and
   background layers for that reason, with the far planes paler, less detailed and less saturated [4].
8. **Flat but deep.** Eyvind Earle's *Sleeping Beauty* backgrounds are flat yet dense with detail, built in layered
   planes [16]. A commentary adds that he set the far backgrounds in green-blue tones (REPORTED).
9. **Staging and secondary action.** Secondary motion supports the main action and never pulls attention from it
   (Thomas and Johnston, *The Illusion of Life*, 1981; [17]). Ambient motion is slow and subtle, and does not ask for
   attention [18].
10. **Natural placement and motion physics.** Poisson-disk sampling gives an even, never-gridded scatter in linear time
    [19]. Curl noise gives a divergence-free flow [10]. Falling plates flutter or tumble [12]. Sun glitter fills an
    ellipse set by wave slopes and the sun's elevation [13].
11. **Books worth having** (not fetched here): James Gurney, *Color and Light* (2010), the chapter "Atmospheric
    Effects"; Marcos Mateu-Mestre, *Framed Ink* (2010).

**Sources** (REPORTED from web search summaries unless marked):
- [1] Remotion docs (VERIFIED in our installed packages, pages not fetched): "Using randomness"
  https://www.remotion.dev/docs/using-randomness ; `noise2D` https://www.remotion.dev/docs/noise/noise-2d ; noise
  visualization https://www.remotion.dev/docs/noise-visualization ; `warpPath`
  https://www.remotion.dev/docs/paths/warp-path ; effects https://www.remotion.dev/docs/effects
- [2] AMS Glossary of Meteorology, "Airlight formula" (Koschmieder's law) https://glossary.ametsoc.org/wiki/Airlight_formula
  and "Aerial perspective" https://glossary.ametsoc.org/wiki/Aerial_perspective
- [3] WetCanvas, "The Spotlight, April 2015: atmospheric perspective"
  https://www.wetcanvas.com/forums/topic/the-spotlight-april-2015-atmospheric-perspective ; Draw Paint Academy,
  "How to Paint Atmospheric Perspective" https://drawpaintacademy.com/atmospheric-perspective/
- [4] BINUS DKV, "Backgrounds that Breathe: Creating Depth in Flat Worlds" (2025)
  https://binus.ac.id/bandung/dkv/2025/11/04/backgrounds-that-breathe-creating-depth-in-flat-worlds/
- [5] Wolfe et al., *Sensation & Perception* 4e, activity "Monocular Depth Cues"
  https://learninglink.oup.com/public/files/cdn/wolfe4e/wa06.01.html
- [6] Artists Network, "Three planes of vision" https://www.artistsnetwork.com/art-subjects/three-planes-of-vision ;
  Draw Paint Academy, "Foreground, Middle Ground, and Background"
  https://drawpaintacademy.com/foreground-middleground-background/
- [7] LibreTexts, *Drawing Perspectives* 5.03, "Visual Characteristics of Atmospheric Perspective"
  https://human.libretexts.org/Courses/Coalinga_College/Drawing_Perspectives/05:_Atmospheric_Perspective/5.03:_Visual_Characteristics_of_Atmospheric_Perspective
- [8] The Informed Illustrator, "Off On A Tangent" (2013) https://www.theinformedillustrator.com/2013/10/off-on-tangent.html
- [9] Smarthistory, "How one-point linear perspective works" https://smarthistory.org/how-one-point-linear-perspective-works
- [10] Bridson, Hourihan and Nordenstam, "Curl-noise for procedural fluid flow", ACM TOG 26(3), 2007
  https://history.siggraph.org/?p=115355
- [11] Watercolour Workout, "Counterchange" https://watercolourworkout.substack.com/p/counterchange
- [12] Andersen, Pesavento and Wang, "Unsteady aerodynamics of fluttering and tumbling plates", J. Fluid Mech. 541, 2005
  https://dragonfly.tam.cornell.edu/publications/2005_JFM_Andersen_Pesavento_Wang_a.pdf
- [13] NOAA PSL, "Glittering Light on Water" https://psl.noaa.gov/outreach/education/science/glitter
- [14] Remotion `random()` https://remotion.dev/docs/random (the reason: parallel render tabs)
- [15] Wikipedia, "Multiplane camera" https://en.wikipedia.org/wiki/Multiplane_camera
- [16] The Walt Disney Family Museum, "Eyvind Earle: artistic devotion and distinction in Sleeping Beauty"
  https://waltdisney.org/blog/eyvind-earle-artistic-devotion-distinction-sleeping-beauty
- [17] Adobe, "Principles of animation" https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html
- [18] Andy Clarke, "Ambient Animations In Web Design: Principles And Implementation (Part 1)", Smashing Magazine, 2025
  https://smashingmagazine.com/2025/09/ambient-animations-web-design-principles-implementation/
- [19] Bridson, "Fast Poisson disk sampling in arbitrary dimensions", SIGGRAPH 2007 sketch
  https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
- Oklab: Ottosson, "A perceptual color space for image processing" (2020) https://bottosson.github.io/posts/oklab/ ;
  https://en.wikipedia.org/wiki/Oklab_color_space

## 8. What this asks of the pipeline (for the integrator; nothing applied here)
- **CRAFT §b checks per plane** (PROPOSAL). Run the tier-C budget on each plane, not averaged over the environment.
  Add a depth ladder: the plane right behind the subject at local contrast ≤ 0.6x the subject's and C90 ≤ 0.7x (k 0.40
  gives contrast x0.60 and chroma x0.68).
- **The subject's silhouette** (PROPOSAL): |ΔL*| ≥ 12 against what is behind it (CRAFT §c's value-parting step) along
  at least 70 % of the silhouette, or counterchange.
- **`scripts/qa/check_depth.py`** (PROPOSAL). Planes are given as boxes, or found by an A/B render with a `planesOff`
  prop, the way `check_light.py` uses `lightOff`. It reports per plane the mean and range of L*, C90 and local
  contrast, the ladder between planes, and the silhouette ring.
- **`lib`, opt-in** (v1 and v3 untouched): `atmos()`; `lib/particles.ts` (motes, glints, leaves, birds; pure); a
  `persp.tsx` scatter helper; one shared colour module, later.
- **Docs.**
  - CRAFT §c's "no specks" means static dark marks; the playbook's particles are light, moving and inside the light.
    One clause there removes the apparent clash.
  - COZY 3b.5's one-card float against a parallax float is the owner's call.
- **OWNER DECISIONS.** Blur, glow, gradient or grain effects (none recommended); the halftone (an SVG pattern rather
  than `@remotion/effects`); a parallax float; a one-off true-3D move with `@remotion/three`.
