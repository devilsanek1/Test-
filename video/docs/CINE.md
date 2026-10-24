# CINE: the cinematic-scale kit (cine lane)

`src/lib/cine/**`: full-bleed pieces that make the viewer feel small (Arcane-scale vistas, worm's-eye monuments,
pull-backs to a wall of windows) in the reference's flat ink style, plus the reference-2 baseline street. Everything is
canvas coordinates (1080 x 1920 = the frame at camera rest), time-based in seconds (`useTime()`), deterministic
(`rng` / `rand` seeds), flat (no gradients, no blur, no masks, no animated opacity: things pop, wipe, grow or switch).

```tsx
import {CineCamera, Layer, Sky, BigSun, EndlessCity, Monument, WallOfWindows, WipeCut, TOD, ...} from '../lib/cine';
```

Demo: `src/dev/CineDemo.tsx` (composition `CineDemo`, 22 s): A Arcane vista (peak, the hook) -> D eye-level street
(baseline) -> B backlit monument (peak) -> C pull-back from one window (peak). Time of day only moves forward (golden,
golden, late golden, night), the sun only sets across cuts and HOPS from shot to shot after each wiper has passed, and
every wipe's midpoint sits on the first word of the incoming caption page. Contact sheet: `docs/cine_demo.png`.

![CineDemo](cine_demo.png)

```
scripts/sheet.sh CineDemo 0 21.9 32 out.png --cols=8                       # contact sheet (+ caption check)
node scripts/capcheck.mjs CineDemo --t0=0 --t1=21.9 --n=110              # caption legibility
scripts/still.sh CineDemo 0 s.png --props='{"mode":"speed"}'             # camera speed report per shot (camSpeed)
scripts/still.sh CineDemo 0.3 w.png --props='{"mode":"wipes"}'           # the wipers + their caption regions
npx remotion still src/index.ts CineDemo s.png --frame=75 --props='{"mode":"street"}'  # PerspectiveStreet + crowd
npx remotion still src/index.ts CineDemo t.png --frame=75 --props='{"mode":"tower"}'   # Tower / silhouettes (each ONCE)
npx remotion render src/index.ts CineDemo l.mp4 --frames=0-119 --props='{"mode":"loop"}'  # un-build + loop seam
# event density: render every frame at scale 0.25 with props {"lock": true, "capcheck": "bg"} (camera held on each
# shot's RESTING key, captions hidden), then count medium events (space-time blobs >= 500 voxels, diff > 18)
```

Camera speeds without a browser (the same numbers as `{mode: 'speed'}`):

```
npx esbuild speed.ts --bundle --platform=node --log-level=error > /tmp/speed.cjs && node /tmp/speed.cjs
# speed.ts: import {cineSpeedReport} from './src/dev/CineDemo'; console.log(cineSpeedReport());
```

| shot | move | max on-screen speed | when / where |
|---|---|---|---|
| A vista | tilt 640 px down (`CAM.reveal`, 2.5 s) + push 0.12 anchored on the far city | 13.5 px / frame | 1.3 s, the observer layer (depth -0.25) |
| D street | dolly push 0.09 anchored on the VP (real parallax) | 2.0 px / frame | the string lights (depth -0.6) |
| B monument | crane 160 px (`CAM.reveal`, 6 s) | 2.3 px / frame | the lens figure (depth -0.5) |
| C pull-back | 8x -> 1.3x (`CAM.reveal`, 5.3 s) | 19.2 px / frame | 3.7 s, the far frame corner |

Flat inked art strobes above ~15-20 px / frame: every move stays at or under that (C's cruise is the limit; the old
24x -> 1x in 4 s ran at 48-53 px / frame).

Speed (full 1080 x 1920, concurrency 2, 20 frames per shot, incl. page setup): A 118, D 125, B 133, C 122 ms / frame
with the machine at load ~3-6; ~200-250 ms / frame (60 frames over the demo: 197) while the other lanes rendered too
(load ~8-10). The heaviest pieces: the plaza + steps Persons in B (~75 kit Persons) and the close-up ring in C.

---

## 1. Camera + multiplane (`camera.tsx`)

```tsx
<CineCamera keys={[{t: 0, tilt: 640, push: 0, anchor: [600, 1000], anchorDepth: 0.85},
                   {t: 2.5, tilt: 0, push: 0.05, anchor: [600, 1000], anchorDepth: 0.85, ease: CAM.reveal}]} handheld={1.2}>
  <Layer depth={1}>   <Sky/> <BigSun/> </Layer>          // infinitely far: only the lens zoom (and pan / tilt) moves it
  <Layer depth={0.8}> far stuff </Layer>                  // slides / grows less
  <Layer depth={0}>   reference plane (1:1 with camera) </Layer>
  <Layer depth={-0.5}> foreground framing </Layer>        // whips past, grows fastest on a push
  {/* outside any Layer = screen space */}
</CineCamera>
```

Model: parallax factor `f = 1 - depth`; on screen `C + T + R(rot) * s_f * (p - C - o * f)` with
`s_f = zoom / (1 - softPush(push * f))`, C = (540, 960), T = (-pan, tilt).

| key field | meaning |
|---|---|
| `t` | scene seconds |
| `x, y` | world point at screen centre on the reference plane: a TRUCK / CRANE (the camera translates: near layers move more, the depth-1 sky not at all). Default 540, 960 |
| `pan`, `tilt` | the camera ROTATES (screen px; tilt > 0 looks up, pan > 0 looks right): every layer, the sky and the sun included, shifts by the same amount, so the horizon stays on the sky's horizon and vanishing lines keep converging on it. Arcane's tilt-up / tilt-down reveal. Applied after anchoring |
| `push` | dolly forward (fraction of the distance to the reference plane). Real parallax: far layers grow less |
| `zoom` | lens zoom (all layers equally) |
| `rot` | roll, degrees |
| `anchor`, `anchorDepth`, `anchorTo` | keep world point `anchor` (in the layer of `anchorDepth`) at screen `anchorTo` (default: its rest position). Two consecutive keys with the same anchor keep it pinned through the move. **Anchor a push on the FAR city / the VP** (`anchorDepth` 0.8+) so the world grows and the foreground slides out |
| `ease` | ease of a segment whose ends are both at rest. Default `CAM.ease` (inOutCubic); `CAM.slow` (inOutSine), `CAM.reveal` (trapezoid: sine ramp 25 %, cruise, soft landing 35 %; peak 1.43x the average speed), `CAM.settle` (outCubic: first segment only) |

**Crane vs tilt.** A `y` crane with the horizon in frame moves the depth-0 ground (and its vanishing lines) while the
depth-1 sky and sun stay put: the horizon slides against the sun. Crane only with the horizon off-frame (shot B), or use
`tilt` (shot A).

**Velocity-continuous** (`interp="spline"`, default): every channel (log zoom, dolly-log, rot, offset or anchorTo, pan,
tilt) is a monotone cubic (PCHIP) through the keys, so a move through several keys never stops dead at a key. A segment
whose two ends are at rest uses its key's `ease`. `interp="ease"` restores per-segment easing. `trapezoid(acc, dec)`
builds cruise eases. `push * f` is linear up to `CAM.pushKnee` (0.85), then saturates (tanh) toward 0.94.
`handheld={px}` adds a deterministic drift.

Hooks / math: `useCam()`, `layerScale(cam, depth)`, `layerMat`, `project(cam, depth, p)`, `unproject`,
`camAt(keys, t, interp?)`, `camFull(keys, t, {handheld, seed})` (with the handheld drift), `camPath(keys, depth, o)`
(layer -> screen matrix over time: precompute what a moving camera will show, e.g. `WallOfWindows keepDark.path`),
**`camSpeed(keys, {t0, t1, depths, handheld})`** (the fastest on-screen motion of a 7 x 11 screen grid, per layer depth, in
px / frame, plus when / where and the average), `useScreenWidth(depth)(px)`. `<CineCamera stage>` folds the core
transition camera in. `<CineFrame bg overlay>` is a minimal full-bleed svg root; `<Shot from to>` runs children on a
local clock.

## 2. Atmosphere and time of day (`atmosphere.ts`)

```ts
TOD.day | TOD.golden | TOD.dusk | TOD.night | TOD.dawn   // TodPalette: every `palette` key relit + skyBands, haze, glow,
                                                         // cloud, stars, windowLit[], windowDark, facade[], silhouette, rim, text
useTodPal(tod?)                          // a piece's palette: its `tod` prop, else the core <Tod> context (+ its role)
ambient(palette.cream, 'night')          // -> sand: a palette STEP, never a mix (the shared todSteps table)
atmos(palette.tan, 0.8, 'dusk')          // FAR layers only (depth >= 0.3): stepped pull toward the sky haze
inkForDepth(depth)                       // 4.8 / 3.4 / 2.2 / 1.6 / 0 (fill-only far)
deep.teal78 / teal60 / teal45            // ink-dark silhouette values (below tealDark: silhouettes / dark panes only)
```

**One table for both lanes.** The caption-band sky (`skyBands[0]`) and the caption tone (`text`) come from theme
`skies` / `todTone`: day and golden = the flat day sky `#ACD1BF` + ink (style_bible_ref2 8: "golden = the same flat sky +
peach-lit faces"), dusk = sage `#6D988B` + ink (ref 2 f_33), night = `#588077` + white. Dusk and night add value steps
toward the horizon, all below y 600. (Core `todSky.golden` is cream: that disagrees with style_bible_ref2 8; cine follows
the bible. Core lane to reconcile.)

**`tod` defaults to the core context.** Every piece takes `tod?: TodLike | TodPalette`; when omitted it reads the core
`<Tod>` context (time of day AND relight role) through `useTodPal`, so inside a timed `<World>` cine pieces relight
with it. The hook runs in the piece itself (below the World); `useTod()` called in a scene body outside the World
returns 'day'. Pass `tod` to pin a piece. The type is `TodLike` (it was `Tod`, which clashed with the core `<Tod>`
component; a deprecated `Tod` alias stays in `./atmosphere` but is not re-exported by the barrel).

**Relight rule** (style_bible_ref2 4): time of day never mixes paint. Only the light fields step down one palette step at
dusk and the near ground a second step at night (`todSteps` in theme.ts, core `relight()`). Haze mixes (`atmos`) are for
far rows only.

## 3. Sky (`sky.tsx`)

```tsx
<Sky tod="golden" horizon={1010} />        // day / golden: ONE flat value (reference 2), no divider under the captions
<Sky tod="dusk" horizon={1010} />          // dusk / night / dawn: value steps below y 600 with hand-drawn streak edges
                                           //   (wobble +- 9 px: stepped tongues, no edge runs straight across the width)
<SkyCloud x y w h tod drift at />          // ref 2 cloud: inked (day / golden) or flat (dusk / night)
<Streaks y tod n color />   <Hills y amp color seed ink? />   <HazeBand .../> (static translucency; avoid)
<Stars tod region at span n avoid? />      // dots + sparkles; `avoid` boxes default to CAPTION_BAND [80, 270, 1000, 580]
<Birds at from to dur n size />            // keep flight paths out of the caption band
```

`Sky` is the un-build SLAB: its glow / horizon bands shrink into the horizon WITH the fills, then the slab collapses
downward from e 0.5 (overlapping the last fills; <= 2 bare frames); it reaches 1600 px below the horizon so it covers the
whole frame. It keeps its colour in the paper / cascade Looks.

## 4. Big sun + light (`light.tsx`)

```tsx
<BigSun cx cy r horizon tod path={[{t, x, y, r, ease}]} moves hops beats bounce drift bob glow glowMode />
```

- r 150 default (ref 2 baseline 94-120; PEAKS 270-490). Default `drift` = `sunDrift(tod)`: ~10 px/s, SINKING (rising at
  dawn): never still, ENGINE rule 6. `drift={[0, 0]}` pins it (a match-cut frame); `bob={px}` floats it instead.
- **Shot-to-shot hops**: start the next shot's sun exactly where the last one left it (screen position and radius) and
  `hops={[{t, to, h, air}]}` (anticipation squash, stretch, landing squash) after the wiper has passed, landing on a
  stressed word; `moves={[{at, dur, r}]}` resizes it during the hop. CineDemo: A -> D (r 309 -> 110, lands on "that"),
  D -> B (r 110 -> 150, lands on "four").
- `<Glow cx cy r rings spread color opacity core at />` stepped flat discs; `<LightShaft .../>`; `<RimLight .../>`;
  `<FlatColor color>` recolours every fill + stroke; `<Silhouette color>`; `<Rimmed color dx dy silhouette?>` (backlit:
  an offset flat copy behind -> a rim sliver; with `silhouette` the element itself goes fill-only).

## 5. Windows (`windows.tsx`)

```tsx
<LitWindows grid={{x, y, w, h, rows, cols, fw, fh, jitter, skip, bay}} quad? initial events lit dark blinds pop flicker ink />
windowPaths(cells, events, times, t, look, precision, {keep?, dark?, override?})
```

Patterns `random | rows | cols | sweep | wave | collapse`; events apply in order (later switches win). `region: [u0, v0,
u1, v1]` limits an event to a district (its timing spreads over the region only): "a whole district lights up in one
sweep". `override(i, on)` has the final say (a hero window lit until its own off time).

## 6. Scale kit

```tsx
<EndlessCity horizon nearY rows farS tod seed towers beacons backFrom={4} vpX={540} street lampsOn={{at, dur}}
  build={{at: -2.6, span: 1, rowStagger: 0.45, order: 'center'}}
  rowProps={(r) => ({landmarks: r.i === 1 ? [{x: 330, w: 1300, h: 9800, kind: 'colossal', color, quietAbove: 640}] : undefined})}
  inRow={(r) => ({front: <SkyCloud .../>})} windows={{initial, events}} />
<Skyline base s depth tod seed ink light="back" vp street lampsOn build windows landmarks variety />
<Monument cx by bw ty taper tod light="back" quietY={720} people doorPeople build peopleAt banners doorAt sideLitAt emblem />
<Tower x y wl wr top vpy tod floors windows light crown at buildDur />
<WallOfWindows quad rows cols tod events exclude keepDark={{boxes, path, span}} lod={{cells, above}} override bandsBelow />
wallQuadVP(...)  wallDarkFrom(spec, keepDark)  wallCellState(spec, row, col, t, {darkFrom, override})  windowQuad(...)
<PerspectiveStreet vp f camH road walk heights roofs doors fence roadColor walkColor poleStart standing crowd lightsOn />
<GroundPlane vp y0 f camH every radial />        // a paved plaza: joints converge on the VP, broken pen strokes
<TinyCrowd n|spots area horizon k at span order walk walkDir tod silhouette personAbove />
<StringLights x1 y1 x2 y2 sag n r r1 tod on lit at />   <Pole/>   <Wires/>
<Ledge y top face tod floor detail />   <Balustrade .../>   <Plinth .../>
<WindowCloseup w h tod detail litColor darkColor on onAt offAt screenTick curtainAt flickerAt person chair desk />
<WipeCut at dur dir kind tod rim a={<Shot/>} b={<Shot/>} />   <WipePass .../>   wipeEdge(...)   wipeToneRegions(T, wipe, before, after)
```

- **Skyline / EndlessCity** (hand-drawn rows): fills misregistered from the ink (theme `misreg`); the HAND: line ends
  jittered +-(0.6-1.2 % of the length), verticals drifting 0.5-1.4 deg, ~15 % of long verticals broken in two, three
  stroke widths per row (0.85 / 1 / 1.18x, by building); ~30 % of flat mid / near buildings get a setback storey;
  `variety` (inked rows s >= 0.42): ~10 % wall cells, sill plants, a balcony band with a railing; 2-3 window types,
  ledge bands, shop fronts / awnings, water towers, open ink window frames. **Looking down**: with `vp`, every roof
  whose top is below the horizon gets its TOP FACE (a thin parallelogram converging on the VP). **Street life**: tree
  clumps over the building feet and two lines of lamp dots per row (both kerbs) that shrink and crowd toward the horizon
  row by row; `lampsOn` pops them on along the street. **`light="back"`** (EndlessCity `backFrom`): the sun behind the
  row: facades teal / tealDark, roofs tealDark, roof tops sage (they catch the sky), warm windows the only accents, a
  peach rim along the sun-facing roof edges. **Landmark `kind: 'colossal'`**: podium, long finned shaft, two setbacks,
  crown and needle; `color` paints it fill-only (one atmospheric step from the sky), `quietAbove` drops its windows
  above a line so it can rise THROUGH the caption band as a flat field. Build: fill-first rising silhouettes, ink a beat
  later, windows once standing.
- **Monument**: elevation drawing through a worm's-eye homography. `light="back"`: flat shadow fields + a peach rim; ink
  stays BELOW `quietY` (screen y in the layer; default 600; shot B uses 720 because the crane carries the entablature
  through the band): capitals and bases as doubled lines overshooting 4-10 px, every step nosing broken every 80-160 px,
  1-2 hairline flutes per shaft, door frame + transom, entablature mouldings + dentils; above it only outlines (a
  backlit drum is one flat field: no shade strip, no slots). Fills misregistered 3-5 px per part. Long mouldings
  overshoot at most 12 px on screen. Human scale: door ~3x a person, people on the steps sized by step depth.
- **WallOfWindows**: `keepDark` darkens the cells whose screen quad touches the caption LINE BOXES (`boxes(t)`, + `pad`
  + a ragged per-cell noise) or a band; with a camera `path` (`camPath(keys)`) it has HYSTERESIS: once a cell has
  touched a box it stays dark for the rest of the shot (only switch-offs: no row of windows popping back on as it
  leaves the band). `wallDarkFrom` / `wallCellState` give close-ups the exact grid state (events, darkness, override,
  one-frame flicker, lit colour index k3). `lod` leaves cells out of the grid while zoomed past `above`; floor bands end
  ON a pier line and are drawn only below `bandsBelow` (3x) zoom.
- **WindowCloseup** levels of detail by the glass's SCREEN width (jitter the thresholds per cell): `full` (>= ~75 px:
  room, person, desk + web page, lamp glow, back-view chair with an inked frame, two slats, legs and a misregistered
  cream fill, plant, frame band, glints), `room` (~48-75 px: the flat room colour, curtain, transom), `glass` (one flat
  pane in `litColor` / `darkColor` = pixel-identical to the grid pane, so the swap to the grid is invisible).
- **PerspectiveStreet**: one-point street on `persp1`; pitched roofs (eaves overhang, inked eaves + rake), doors,
  `fence` (white railing along a walk), `roadColor` / `walkColor` (a narrow `road` reads as a central path),
  `poleStart` (push the first pole back so pole tops stay under the captions), `standing` share of the crowd, kerb ink,
  paving joints, specks; its zig-zag string lights shrink with depth (`r1`). Keep facades low (~1.5x camH) so the sky
  band stays clear. **StringLights `r1`**: a string receding to the VP: bulbs spaced evenly in depth (screen spacing and
  radius ~ 1 / z), bulbs under 3 px dropped into the wire.
- **Ledge `detail`**: brick courses on the face, a drain pipe, roof clutter on the floor (vents, hatch, pipe run on
  blocks, antenna mast, tar seams): the roof floor is never a dead slab.

## 7. Wipes (`wipers.tsx`, `props.tsx`)

The cine wipers live in a LEAF module (`wipers.tsx`: no runtime import of Film or the rest of cine) in the core
`WiperComponent` shape (`{x, p, dir, color}`, screen px, opaque over x +- 90, static `captionRegions`):

```tsx
import {CINE_WIPERS, CINE_WIPE_HALF, wipeEdgeX} from './cine/wipers';   // core Film: {...BUILTIN_WIPERS, ...CINE_WIPERS}
<ColumnWiper x p dir rim light />    // a stone column at the lens: doubled-ink capital + base, fill-only flutes, lit rim
<PasserWiper x p dir rim hair />     // a giant back-view passer-by (below)
passerPath(x)                        // its outline: ONE closed clockwise path (head, ear, neck, shoulders)
```

- **Passer**: an irregular, egg-shaped head with hair bumps and one ear, ochre hair with three ink clump strokes and a
  ragged nape, a collar whose ink overshoots, fold strokes; fills misregistered 3 px (toward the trailing side) + 4 px
  down; an ~8 px one-sided rim sliver inside the leading edge. The outline is a single subpath, so nothing can cancel
  under the nonzero rule (the old head circle and neck rect had opposite windings: a see-through hole).
- `WipeCut` / `WipePass` draw any kind (`column`, `passer`, core `figure` / `pole` / `foliage`, old `slab`) from one
  registry (`WIPERS`); the edge moves with in-out sine (`wipeEdgeX`; the core Film still moves its edge linearly: core
  lane to switch to `wipeEdgeX` and register `CINE_WIPERS`). The element grows 8 % (parallax).
- **Captions over a wipe**: `wipeToneRegions(T, {at, dur, dir, kind}, toneBefore, toneAfter)` returns the unswept /
  swept tone rects + the wiper's own `captionRegions` (with its 8 % growth and the passer's walking bob): feed it to
  `SkyCaptions regions`.

## 8. Render states: un-build, loop, paper (`state.tsx`)

- **Un-build**: windows switch off at once; buildings, rows (and their masses: capped below slab size), monument parts,
  figures, poles and walls sink into their base with `exitFillProgress` (small first, ease-in); batched ink drops at
  `exitInkProgress >= 0.5`; string-light bulbs shrink, then the wire retracts; stars, glows, shafts shrink; the Sky's
  glow bands go with the fills and its slab collapses downward from e 0.5. The mascot: `<Elephant draw={1 - exit}>`.
- **Looks**: `paper` = white fills + ink (fill-only far rows and hills get a hairline outline so frame 0 / the loop frame
  reads as line art); `cascade` = paper until the wave from `origin` reaches each piece; light only in colour.
- Helpers: `useCineState()` -> `{t, e, look, m}`, `exitScale`, `inkGone`, `inkOn`, `lookPaint`, `isPaper`,
  `screenSize`, `<ExitShrink x y>`. Check: CineDemo `{mode: 'loop'}`.

## 9. Recipes (what the demo proves)

**Arcane vista (PEAK, the hook).** Golden, flat sky. Frame 0 is already the image: the sun (r 300) and the crown of ONE
colossal tower (3x anything near it, fill-only `mix(sky, sage)`, no windows above y 640) with a cloud band across it
(Arcane panel 4); the camera TILTS down 640 px over 2.5 s (`CAM.reveal`) onto the city and lands on a backlit observer
(`Rimmed peach` + `deep.teal78` silhouette, shoulders up, cut by the bottom edge) and the mascot on a parapet; a push
anchored on the far city continues. Six rows, the near two backlit with roof top faces, street lamps and tree clumps.
A big beat every 1.2-1.8 s: a district lights up in one sweep on "22 million" (1.15 s), the mascot turns on "PHP",
a second district on "out there" (3.55), the tower lights bottom -> top + beacons + the street lamps on "hit" (4.4);
the sun sinks 140 px.

**Eye-level street (BASELINE).** Reference 2 f_1: camera at 187 for 170 people (heads hug the horizon), a 240-wide
central path between lawn strips, low pitched-roof houses with doors, a right-hand railing; the queue starts at the lens
(z 150: the hero 0.55 H, cut by the bottom edge; the next ones 0.4-0.5 H) and recedes to the VP; the mascot at their
feet; the near 30 % dressed with kit pieces placed by the street's own camera (mailbox, bike, car, lamp post, trees,
palms, water tower), walkers (30 % standing) on both walks, bulbs shrinking toward the VP; a dolly push 0.09 anchored on
the VP (real parallax); the sun hops in from shot A.

**Backlit worm's-eye monument (PEAK).** `bw` 1950, `taper` 0.52: the pediment runs past both edges, the lantern leaves the
top, only flat pediment / drum fields sit in the caption band; scale chain plaza person ~70 px -> door ~160 px -> column
~700 px -> dome beyond. The colonnade stands at the cut (`build.at` -1.6) and the upper storeys keep building while the
camera cranes up 160 px; a GroundPlane plaza with 44 back-view people walking up; a backlit head-and-shoulders
silhouette at the lens; banners on "four", lanterns popping one by one, the door opens on "Nobody".

**Pull-back (PEAK).** `WallOfWindows` 56 x 30 on `wallQuadVP`; 8x -> 1.3x over 5.3 s (cruise <= 20 px / frame) anchored
on the hero, which ends framed at (440, 1110), 35 x 41 px; the hero and every cell the 8x opening shows (9 rows x 7
cols) as close-ups degrading by screen size (flat dark glass behind the caption words); keepDark on the caption LINE boxes with hysteresis; an on-wave from the hero, then the switch-off: the block under
"switch it off" goes first, darkness closes in on the hero (a ragged collapse wave) punctuated by whole blocks of floors
going dark inside the final framing, the stragglers, and the hero last on "did." (0.55 s before the cut); our own
rooftop (Ledge with detail) rises into the frame and the mascot watches the blocks go dark, glances at us, and turns to
us when the last light goes out.

## 10. Captions and legibility

Captions own the band y 280-570. Keep busy detail out of it: stars avoid it, birds fly above or below it, sky steps stay
below y 600 (day / golden have none), shafts start below it, wall windows behind the caption lines go dark, backlit
monuments put only flat fields in it (`quietY`), street facades and poles stay under it, the colossal tower crosses it
as a flat field. Check with `scripts/capcheck.mjs` (fails when > 5 % of the background near the glyphs is below 3:1).
CineDemo: 110 sampled frames, 0 FAIL after the B `quietY` fix (earlier: 2 FAIL at 11.65-11.85 s, entablature ink
under "in four countries" during the crane).

## 11. Performance rules

1. **Batch.** Anything numerous (windows, stars, tiny people, bulbs, lamps, trees) goes into one `PathBuf` path per
   colour. Rows / monuments keep per-building / per-part strings so they build and un-build piece by piece.
2. **Memoise geometry, recompute only state.** Static geometry is cached by seed (rows, monument, wall darkness per
   camera path); per frame only switch states, positions and moving pieces are rebuilt.
3. **Fill-only far, ink near.** Use core `<Ink>` (taper, draw-on) only for a few hero lines.
4. **One `<g transform>` per layer.** Camera moves never touch geometry.
5. **No masks.** Silhouettes / rims are `FlatColor` copies; clip paths only for wipe splits and the passer's rim.
6. **Precision for deep zooms.** `PathBuf(precision)` / `WallOfWindows precision={3}` past 10x.
7. **Static translucency only** (haze, shafts, glows): never animate opacity.
8. Kit Persons cost ~20 elements each: fine for tens (the steps, the plaza, a queue), not hundreds (use blobs).

## 12. Known gaps

- Event density (camera held on each shot's resting key, captions hidden; the reviewer's `density.py`, strict: blobs
  >= 500 voxels at 1/4 scale, diff > 18): A 6.3 / s, D 5.1 / s, B 5.0 / s, C 17.1 / s (max gaps 1.00 / 0.53 / 0.63 /
  1.07 s). Grid switch-offs barely count (each window is its own one-frame sub-threshold blob), so C's tail is carried
  by the mascot's pose beats; the old "7.5 / s" came from an uncommitted tool (a committed copy in `scripts/` is the
  core lane's to add).
- `Monument light="back"` reads best at golden / dusk; at night prefer `light="front"` with lit windows.
- The core Film still uses its own linear wipe edge and does not register `column` / `passer` yet (core lane:
  `{...BUILTIN_WIPERS, ...CINE_WIPERS}` and `wipeEdgeX`).
- Core `todSky.golden` (cream) vs style_bible_ref2 8 (golden = the flat day sky): cine follows the bible.
