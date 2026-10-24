# CINE: the cinematic-scale kit (cine lane)

`src/lib/cine/**`: full-bleed pieces that make the viewer feel small (Arcane-scale vistas, worm's-eye monuments,
pull-backs to a million windows) in the reference's flat ink style, plus the reference-2 baseline street. Everything is
canvas coordinates (1080 x 1920 = the frame at camera rest), time-based in seconds (`useTime()`), deterministic
(`rng` / `rand` seeds), flat (no gradients, no blur, no masks, no animated opacity: things pop, wipe, grow or switch).

```tsx
import {CineCamera, Layer, Sky, BigSun, EndlessCity, Monument, WallOfWindows, WipeCut, TOD, ...} from '../lib/cine';
```

Demo: `src/dev/CineDemo.tsx` (composition `CineDemo`, 22 s): A Arcane vista (peak) -> D eye-level street (baseline)
-> B backlit monument (peak) -> C pull-back from one window (peak), cut on things passing the lens, the sun hopping
from shot to shot. Contact sheet: `docs/cine_demo.png`.

![CineDemo](cine_demo.png)

```
scripts/sheet.sh CineDemo 0 21.9 24 out.png --cols=8                      # contact sheet of the demo
node scripts/capcheck.mjs CineDemo --t0=0 --t1=21.9 --n=110             # caption legibility
npx remotion still src/index.ts CineDemo s.png --frame=75 --props='{"mode":"street"}'  # PerspectiveStreet + crowd check
npx remotion still src/index.ts CineDemo t.png --frame=75 --props='{"mode":"tower"}'   # Tower build / silhouettes (each ONCE)
npx remotion render src/index.ts CineDemo l.mp4 --frames=0-119 --props='{"mode":"loop"}'  # un-build + loop seam
# event density with the camera LOCKED (props {"lock": true}): render every frame at scale 0.25, then density.py
```

Speed: CineDemo renders at **~115 ms/frame** (full 1080 x 1920, concurrency 2, 30 frames spread over all four shots;
the heaviest single frames, the window close-ups of shot C, ~240 ms at concurrency 1).

---

## 1. Camera + multiplane (`camera.tsx`)

```tsx
<CineCamera keys={[{t: 0, push: 0, anchor: [600, 1000], anchorDepth: 0.85}, {t: 5.9, push: 0.14, zoom: 1.04, anchor: [600, 1000], anchorDepth: 0.85, ease: bez(0.45, 0, 0.15, 1)}]} handheld={1.2}>
  <Layer depth={1}>   <Sky/> <BigSun/> </Layer>          // infinitely far: only the lens zoom affects it
  <Layer depth={0.8}> far stuff </Layer>                  // slides / grows less
  <Layer depth={0}>   reference plane (1:1 with camera) </Layer>
  <Layer depth={-0.5}> foreground framing </Layer>        // whips past, grows fastest on a push
  {/* outside any Layer = screen space */}
</CineCamera>
```

Model: parallax factor `f = 1 - depth`; on screen `C + R(rot) * s_f * (p - C - o * f)` with
`s_f = zoom / (1 - softPush(push * f))`, C = (540, 960).

| key field | meaning |
|---|---|
| `t` | scene seconds |
| `x, y` | world point at screen centre on the reference plane (truck / crane). Default 540, 960 |
| `push` | dolly forward (fraction of the distance to the reference plane). Real parallax: far layers grow less |
| `zoom` | lens zoom (all layers equally) |
| `rot` | roll, degrees |
| `anchor`, `anchorDepth`, `anchorTo` | keep world point `anchor` (in the layer of `anchorDepth`) at screen `anchorTo` (default: its rest position). Two consecutive keys with the same anchor keep it pinned through the move. **Anchor a push on the FAR city** (`anchorDepth` 0.8+) so the world grows and the foreground slides out; anchoring on the observer makes the viewer feel big |
| `ease` | ease of a segment whose ends are both at rest (see below). Default `CAM.ease` (inOutCubic); `CAM.slow` (inOutSine), `CAM.reveal` (trapezoid: sine ramp 25 %, cruise, soft landing 35 %; peak 1.43x the average speed), `CAM.settle` (outCubic: first segment only) |

**Velocity-continuous** (`interp="spline"`, default): every channel (log zoom, dolly-log, rot, offset or anchorTo) is a
monotone cubic (PCHIP) through the keys, so a move through several keys never stops dead and restarts at a key. A
segment whose two ends are at rest (a two-key move, a direction change) uses its key's `ease`. `CAM.settle` (starts
already moving) is honoured only on the FIRST segment, for a shot that continues the previous shot's move.
`interp="ease"` restores per-segment easing. `trapezoid(acc, dec)` builds cruise eases: long moves should cruise
(flat inked art strobes above ~15-20 px/frame; the demo's moves peak at 2.8-3.6 px/frame).
`push * f` is linear up to `CAM.pushKnee` (0.85) and then saturates smoothly (tanh) toward 0.94: nothing passes
through the lens and a foreground layer's scale never kinks. `handheld={px}` adds a deterministic drift.

Hooks / math: `useCam()`, `layerScale(cam, depth)`, `layerMat`, `project(cam, depth, p)`, `unproject`,
`camAt(keys, t, interp?)`, `useScreenWidth(depth)(px)`. `<CineCamera stage>` folds the core transition camera in.
`<CineFrame bg overlay>` is a minimal full-bleed svg root; `<Shot from to>` runs children on a local clock.

## 2. Atmosphere and time of day (`atmosphere.ts`)

```ts
TOD.day | TOD.golden | TOD.dusk | TOD.night | TOD.dawn   // TodPalette: every `palette` key relit + skyBands, haze,
                                                         // glow, cloud, stars, windowLit[], windowDark, facade[], silhouette, rim, text
ambient(palette.cream, 'night')            // -> sand: a palette STEP, never a mix (shared table, see below)
ambient(palette.sage, 'night', 'far')      // the table's far row
atmos(palette.tan, 0.8, 'dusk')            // FAR layers only (depth >= 0.3): stepped pull toward the sky haze
inkForDepth(depth)                         // 4.8 / 3.4 / 2.2 / 1.6 / 0 (fill-only far)
deep.teal78 / teal60 / teal45              // ink-dark silhouette values (below tealDark: silhouettes / dark panes only)
```

**Relight rule** (style_bible_ref2 4, measured): time of day never mixes paint. Only the light fields step down one
palette step at dusk (mintPale -> sky, cream -> sand, sand -> tan) and the near ground a second step at night
(mintPale -> sage); whites, mid and dark tones, ochre, ink, peach and the sun never move. The table is the SHARED
`todSteps` in `theme.ts` (core `<Fill>` reads it through `<Tod>`): `ambient()` is core `relight()`, so cine and core
relight identically. Inside a timed core `<World>`, feed cine pieces `tod={useTod()}`. Haze mixes (`atmos`) are kept
for far rows only (the measured night far step #4B706B). Caption tone: `TOD[x].text`.

## 3. Sky (`sky.tsx`)

```tsx
<Sky tod="dusk" horizon={1010} />          // flat value steps below y 600 (the caption band stays one flat value);
                                           // the un-build SLAB: it collapses downward last; keeps colour in paper looks
<SkyCloud x y w tod drift at />            // ref 2 cloud, inked white (day) or flat (dusk); hairline ink in paper looks
<Streaks y tod n color />   <Hills y amp color seed ink? />   <HazeBand .../> (static translucency; avoid: use row steps)
<Stars tod region at span n avoid? />      // dots + sparkles; `avoid` boxes default to CAPTION_BAND [80, 270, 1000, 580]
<Birds at from to dur n size />            // keep flight paths out of the caption band
```

## 4. Big sun + light (`light.tsx`)

```tsx
<BigSun cx cy r horizon tod path={[{t, x, y, r, ease}]} beats hops bounce drift glow glowMode />
        // r 150 default (ref 2 baseline 94-120, PEAKS 270-490); default drift [2.2, 0.6] px/s (never perfectly still;
        // pass [0, 0] to pin it); path keys move AND resize it: hop it into the next shot from where the last one left it
<Glow cx cy r rings spread color opacity core at />      // stepped flat discs; shrink with the un-build
<LightShaft from angle length w0 w1 beams opacity sweep at />  // flat translucent beams; keep them out of the caption band
<RimLight rect side width color /> / <RimLight points light width color />
<FlatColor color> ...any kit element... </FlatColor>      // recolour EVERY fill + stroke (scoped CSS rule, no raster)
<Silhouette color> <Person .../> </Silhouette>            // fill-only (a FlatColor); <Silhouette d color/> for a path
<Rimmed color dx dy silhouette?> ... </Rimmed>            // backlit: an offset flat copy behind -> a 3-5 px rim sliver
```

Silhouettes no longer use alpha masks (masks tiled and repeated in Chrome). `bounds` / `SIL_BOUNDS` are accepted
but ignored (deprecated).

## 5. Windows (`windows.tsx`)

```tsx
<LitWindows grid={{x, y, w, h, rows, cols, fw, fh, jitter, skip, bay}} quad? initial events lit dark blinds pop flicker ink />
windowPaths(cells, events, times, t, look, precision, {keep?: (i) => bool, dark?: (i) => bool})   // filters
```

Patterns `random | rows | cols | sweep | wave | collapse`; events apply in order (later switches win). Un-build:
every window switches off at once (a 1-frame event), then the panes go with their building.

## 6. Scale kit

```tsx
<EndlessCity horizon nearY rows farS tod seed towers beacons
  build={{at: -2.6, span: 1, rowStagger: 0.45, order: 'center'}}        // buildings pop up row by row, far first
  rowProps={(r) => ({landmarks: r.i === 1 ? [{x: 300, w: 1150, h: 3000, kind: 'step'}] : undefined})}
  windows={{initial, events}} haze={0} />                               // haze bands off by default (overlay look)
<Skyline base s depth tod seed ink build={{at, span, per, order}} windows landmarks frames shops />
<Monument cx by bw ty taper tod light="back" people doorPeople build peopleAt banners doorAt sideLitAt sideOffAt emblem emblemY emblemAt />
<Tower x y wl wr top vpy tod floors windows light crown at buildDur />
<WallOfWindows quad rows cols tod events exclude keepDark={{y0, y1}} lod={{cells, above}} inkW precision />
wallQuadVP({vp, near: [x, top, bottom], farX})   wallCellOn(spec, row, col, t)   windowQuad(quad, rows, cols, r, c)
<PerspectiveStreet vp f camH road walk tod seed heights poles poleH lightsOn windows crowd ground personAbove />
<TinyCrowd n|spots area horizon k at span order walk walkDir tod silhouette personAbove />
<StringLights x1 y1 x2 y2 sag n r tod on={{at, dur}} lit at />   <Pole/>   <Wires/>
<Ledge y top face tod floor at />   <Balustrade x y w h side tod rim />   <Plinth .../>
<WindowCloseup w h tod lit onAt offAt screenTick curtainAt flickerAt person chair desk />
<WipeCut at dur dir kind tod a={<Shot .../>} b={<Shot .../>} />   <WipePass .../>   wipeEdge(t, at, dur, dir, kind)
```

- **Skyline / EndlessCity** (hand-drawn near rows): each building's fills sit misregistered from its ink (theme
  `misreg`, seeded per building); 2-3 window types per building with their own rhythm; a ledge band every 3-5 floors;
  shop fronts and 18 % awnings on the nearest row; water towers on ~25 % of flat roofs; ink window frames as open
  rectangles overshooting 3-8 px on inked rows. Build: fill-first silhouettes rising from the base (outBack, ~0.27 s each,
  50 % overlap), ink a beat later, windows once the building stands. The row's mass is the row's own facade paint.
- **Monument**: elevation drawing mapped through a worm's-eye homography. Human-scale cues: a central bronze door in the
  middle bay (~3x a person), people on the steps as kit Persons sized by step depth (0.032 H low -> 0.022 H high,
  never under 40 px), doorway people, column bases and capitals as doubled ink lines; the ink thins with height
  (`x clamp(scale / scale(base), 0.45, 1)`); lit strips cover 40-70 % of one edge. `light="back"` = the sun behind it:
  flat shadow fields (golden: sage + one lighter step; dusk / night: tealDark + teal), columns as fill-only bands, the
  upper storeys carry no inner ink and no horizontal lines (a crane moves them through the caption band; ink captions
  on the golden field are >= 5:1), a 4 px peach rim on the sun-facing edges, people as tealDark silhouettes. Build
  pops parts bottom -> top (0.16 s each, columns left -> right); `banners` drop one by one (a counting build: "four"),
  `doorAt` opens the door on light, `sideLitAt` / `sideOffAt` switch the side doorways.
- **WallOfWindows**: `wallQuadVP` puts the receding edges on the horizon's vanishing point. `keepDark` keeps every
  window whose SCREEN quad overlaps the caption band dark (or switches it off as the camera brings it in). `lod`
  leaves cells out of the batched grid while the layer is zoomed past `above`: draw them as `WindowCloseup`s, lit
  exactly when the grid would light them (`wallCellOn`). Unlit close-ups keep cool values (sage frame, teal curtain).
- **PerspectiveStreet**: camH 110 by default; ground detail (3.4 px kerb ink, paving joints across the walks and the
  road, a centre dash on wide roads, 3-10 px dash specks, half of them near the lens); `poleH` keeps pole tops under
  the caption band; keep facade heights low (~1.5x camH) so the sky band stays clear. Walkers and **TinyCrowd**
  figures at least `personAbove` (40 px) tall are kit Persons (inked by size, legs, depth-sorted); smaller ones are
  batched blobs in depth-sorted chunks (no head lands on a nearer body); walkers recede and shrink with perspective.
- **Wipes**: `WipeCut` splits two shots on the moving edge of something passing the lens (`kind`: `column` (stone,
  capital + base mouldings in doubled ink, fill-only flutes, lit rim), `passer` (giant back-view silhouette with a rim;
  `passerPath(x)` gives its outline for caption tone regions), core `figure` / `pole` / `foliage`, old `slab`); the
  element crosses in 0.45-0.6 s (in-out sine) and grows 8 % (parallax). The frame is never fully covered: both shots are
  visible on either side of the element. Give `SkyCaptions` tone `regions` per side and white text over the element.
- **WindowCloseup**: back-view chair in front of the person (ref 2 f_33), `lit={false}` dark neighbours, `onAt`,
  `curtainAt`, `flickerAt`, `screenTick` (the web page refreshes: a visible pop).

Perspective helpers (`persp.ts`): `quadMap(quad)`, `cell`, `persp1({vx, vy, f, camH})(x, y, z)` (place figures with
the same camera as the street: `h = 170 * k`), `affineFromTri`, `toward`, `lerpPt`.

## 7. Render states: un-build, loop, paper (`state.tsx`)

Every cine piece takes part in the core un-build (`useExit`) and Looks (`useLook`):
- **Un-build**: windows switch off at once; buildings, rows, monument parts, figures, poles and walls sink into their
  base with `exitFillProgress` (small first, ease-in); batched ink drops at `exitInkProgress >= 0.5`; string-light
  bulbs shrink, then the wire retracts; stars, glows, shafts shrink; the cine `Sky` is the SLAB and collapses downward
  last. The mascot: `<Elephant draw={1 - exit}>` (it ignores exit by itself).
- **Looks**: `paper` = white fills + ink (fill-only far rows and hills get a hairline outline so frame 0 / the loop frame
  reads as line art); `cascade` = paper until the wave from `origin` reaches each building / part / figure chunk; light
  (glows, shafts, lit windows, haze) only exists in the coloured state. Sky and sun keep their colour.
- Helpers for new pieces: `useCineState()` -> `{t, e, look, m}`, `exitScale(e, jitter, size)`, `inkGone`, `inkOn`,
  `lookPaint(S, color, point)`, `isPaper`, `screenSize`, `<ExitShrink x y>`.
- Check: CineDemo `{mode: 'loop'}` (Standalone un-build at 3.5 s, loop at 4 s: the end frame equals frame 0).

## 8. Recipes (what the demo proves)

**Arcane vista from a height (PEAK).** Sky steps below y 600 + stars (out of the caption band) + a half-set r 300 sun
with two opaque glow rings behind the far rows; `EndlessCity` 6 rows building far -> near, ONE colossal stepped tower
(0.13 W wide, cut by the sun, top below the caption band); a back-view observer (s 2.6, `Rimmed` peach) cut by the
bottom edge and the mascot on the parapet (`Ledge` at the bottom, no dead slab); push 0 -> 0.14 + zoom 1.04 anchored
on the far city; string-light bulbs popping on the "hit" beat; light sweeps across the city on the stressed words.

**Eye-level street (BASELINE).** `persp1` camera with eye above head height (`camH` 260): one 0.32 H back-view figure
cut by the left edge, the mascot at people's feet (0.27x a person), a queue on the path receding to the vanishing
point (kit Persons above 40 px), low facades, short poles, near string lights at the top (lights on near the end),
sun r 110 at the vanishing point, 5 % push-in.

**Backlit worm's-eye monument (PEAK).** `Monument light="back"` far wider than the frame (`bw` 1600, taper 0.52), sun
behind the drum's right side, crane `y` 1260 -> 960 with `CAM.reveal` (+ zoom 1.06 -> 1): the columns never enter the
caption band, only flat fields do; the dome lands inside the band as a flat field; people keep gathering on the steps,
banners drop on "four", the door opens on "Nobody", the clock pops once it is below the captions; foreground
`Balustrade` with the mascot and a near Person with legs at depth -0.5 fall out of frame first.

**Pull-back (PEAK).** `WallOfWindows` 80 x 44 on `wallQuadVP` (edges converge on the horizon VP), `keepDark` on the
caption band, a 5 x 5 block of `WindowCloseup`s around the hero while the zoom is above 3x; camera `zoom 5 * push 0.79`
(~24x) -> rest anchored on the hero (hero centre at screen y 1120 so the neighbour above, a dark close-up, sits under
the captions); on-wave from the hero, then two off-waves; the hero switches off last.

## 9. Captions and legibility

Captions own the band y 280-570 (`skyCaption.clipTop/clipBottom`). Keep busy detail out of it: stars avoid it,
birds fly above or below it, sky steps stay below y 600, shafts start below it, wall windows keep dark in it, backlit
monuments put only flat fields in it, street facades and poles stay under it. Check every shot with
`scripts/capcheck.mjs` (renders a caption mask; fails when > 5 % of the background near the glyphs is below 3:1
against the active tone). CineDemo: 141 of 143 sampled frames pass (every wipe sampled at 12 steps); the 2 borderline
frames (5.7 % near < 3:1, 0.07 s) are a glyph straddling the passer's head edge mid-wipe.

## 10. Performance rules

1. **Batch.** Anything numerous (windows, stars, tiny people, bulbs, birds) goes into one `PathBuf` path per colour.
   Rows / monuments keep per-building / per-part strings so they can build and un-build piece by piece and still batch
   everything at rest.
2. **Memoise geometry, recompute only state.** Static geometry is cached by seed; per frame only switch states,
   positions and the few moving pieces are rebuilt.
3. **Fill-only far, ink near.** Far rows have no ink. Use core `<Ink>` (taper, draw-on) only for a few hero lines.
4. **One `<g transform>` per layer.** Camera moves never touch geometry.
5. **No masks.** Silhouettes / rims are `FlatColor` copies (a scoped CSS rule); clip paths only for wipe splits.
6. **Precision for deep zooms.** `PathBuf(precision)` / `WallOfWindows precision={3}` past 10x.
7. **Static translucency only** (haze, shafts, glows): never animate opacity; switch things by pop / wipe / scale.
8. Kit Persons cost ~20 elements each: fine for tens (the monument steps, a queue), not for hundreds (use blobs).

## 11. Known gaps

- Event density measured with the camera LOCKED (`density.py`, 0.25 scale): 7.5 medium events/s over the demo; the
  backlit monument and the 24x window shot still have 1-3 s stretches with only small events (people popping onto the
  steps, page refreshes) because the sun's continuous drift and build chains merge neighbouring changes into one
  space-time event; with the camera moving they read as busy.
- Monument `light="back"` reads best at golden / dusk; at night prefer `light="front"` with lit windows.
- `WindowCloseup` close-ups of the LOD block cost ~100 ms per frame while they are on screen (24 of them).
- `PerspectiveStreet` facades are plain (windows + ink edges): no shopfronts or awnings yet; pair it
  with core kit pieces on a `<Plane>` for hero blocks.
