# CINE: the cinematic-scale kit (cine lane)

`src/lib/cine/**`: full-bleed pieces that make the viewer feel small (Arcane-scale vistas, worm's-eye towers, pull-backs
to a million windows) in the reference's flat ink style. Everything is canvas coordinates (1080 x 1920 = the frame at
camera rest), time-based in seconds (`useTime()`), deterministic (`rng` / `rand` seeds), flat (no gradients, no blur,
no animated opacity: things pop, wipe, grow or switch).

```tsx
import {CineCamera, Layer, Sky, BigSun, EndlessCity, TOD, ...} from '../lib/cine';
```

Demo: `src/dev/CineDemo.tsx` (composition `CineDemo`, 18 s, three shots + wipes + sky captions). Contact sheet:
`docs/cine_demo.png`.

![CineDemo](cine_demo.png)

```
scripts/sheet.sh CineDemo 0 17.9 12 out.png --cols=6        # contact sheet of the demo
npx remotion still src/index.ts CineDemo s.png --frame=75 --props='{"mode":"street"}'   # PerspectiveStreet check
npx remotion still src/index.ts CineDemo t.png --frame=75 --props='{"mode":"tower"}'    # Tower / Silhouette / LitWindows check
```

Speed: CineDemo renders at **~127-137 ms/frame** (full 1080 x 1920, concurrency 2, 30 frames spread over all three shots),
including thousands of windows, two masks (rim lights) and the captions.

---

## 1. Camera + multiplane (`camera.tsx`)

```tsx
<CineCamera keys={[{t: 0, push: 0, anchor: [560, 1180]}, {t: 6.4, push: 0.22, anchor: [560, 1180], ease: CAM.slow}]} handheld={1.5}>
  <Layer depth={1}>   <Sky/> <BigSun/> </Layer>          // infinitely far: only the lens zoom affects it
  <Layer depth={0.8}> far stuff </Layer>                  // slides / grows less
  <Layer depth={0}>   reference plane (1:1 with camera) </Layer>
  <Layer depth={-0.5}> foreground framing </Layer>        // whips past, grows fastest on a push
  {/* outside any Layer = screen space */}
</CineCamera>
```

Model: parallax factor `f = 1 - depth`; on screen `C + R(rot) * s_f * (p - C - o * f)` with
`s_f = zoom / (1 - push * f)`, C = (540, 960). So:

| key field | meaning |
|---|---|
| `t` | scene seconds |
| `x, y` | world point at screen centre on the reference plane (truck / crane). Default 540, 960 |
| `push` | dolly forward (fraction of the distance to the reference plane). Real parallax: far layers grow less |
| `zoom` | lens zoom (all layers equally) |
| `rot` | roll, degrees |
| `anchor`, `anchorDepth`, `anchorTo` | keep world point `anchor` (in the layer of `anchorDepth`) at screen `anchorTo` (default: its rest position) for this key. Two consecutive keys with the same anchor keep it exactly pinned through the move (push toward the mascot; pull back from one window) |
| `ease` | ease INTO this key. Default `CAM.ease` (inOutCubic); `CAM.slow` (inOutSine), `CAM.reveal` (inOutQuart), `CAM.settle` (outCubic) |

Missing fields inherit from the previous key. `zoom` and the dolly interpolate in log space (constant perceived speed).
`handheld={px}` adds a deterministic low-frequency drift (1-2 px reads as a held camera). `push * f` is clamped at
0.94 so nothing passes through the lens.

Hooks / math: `useCam()`, `layerScale(cam, depth)`, `layerMat`, `project(cam, depth, p)`, `unproject`, `camAt(keys, t)`,
`useScreenWidth(depth)(px)` (a stroke width that stays `px` on screen through a big zoom, see the demo's wall).

Inside the core `<World stage="context">`, pass `<CineCamera stage>` to fold the Film transition camera
(`useStageCam`) into this camera with full parallax. In a flat `<World>` (default) leave `stage` off: World already
moves everything.

`<CineFrame bg overlay>` is a minimal full-bleed svg root for dev previews; `<Shot from to>` runs children on a local
clock (t - from) and hides them outside the range.

## 2. Atmosphere (`atmosphere.ts`)

```ts
TOD.day | TOD.golden | TOD.dusk | TOD.night | TOD.dawn   // TodPalette: every `palette` key, re-lit for the time of day,
                                                         // + skyBands, haze, horizonGlow, glow, cloud, star(s),
                                                         //   windowLit[], windowDark, facade[], silhouette, rim, ground, text
atmos(palette.tan, 0.8, 'dusk')   // far building: ambient shift, then pulled toward the haze in FLAT STEPS (4 by default)
ambient(palette.cream, 'night')   // the paint under that light, no depth tint (ink / sun / highlight never shift)
tone(depth, steps)                // which haze step a depth lands in
inkForDepth(depth)                // 4.8 / 3.4 / 2.2 / 1.6 / 0 (fill-only far)
deep.teal78 / teal60 / teal45     // night steps: tealDark at lower value (same hue, no new pigment)
shade(hex, k), mix(a, b, t)       // flat colour helpers (memoised)
```

Measured anchors (`docs/style_bible_ref2.md` 4, 8): day haze = the sky itself (far layers step from sage toward it,
never lighter), night far step = mix(teal, tealDark) #4B706B, lit bulbs peach with a sage halo, lit windows peach /
cream. Night skies never go darker than teal behind the captions (a little lighter toward the horizon instead); the
deep teals (`deep.*`) are for silhouettes, walls and dark windows. Caption tone: `TOD[x].text` (ink on day / golden / dawn, white on dusk / night).

## 3. Sky (`sky.tsx`)

```tsx
<Sky tod="dusk" horizon={1010} />                    // flat value steps, top -> horizon; by default every step sits below
                                                     // y 600 so the caption zone is one flat value (colors / edges / span)
<SkyCloud x y w tod drift at />                     // ref 2 cloud: 3 bumps, flat base; inked white (day) or flat (dusk)
<Streaks y tod n color />                            // thin sunset streak clouds near the horizon
<Stars tod region={[x0, y0, x1, y1]} at span n />    // dots + sparkles, pop in one by one, twinkle by SIZE
<HazeBand y h color opacity wave />                  // static flat fog band between layers
<Hills y amp color seed ink? />                      // ref 2's rolling far hills
<Birds at from to dur n size />                      // ink V flock, wing flaps
```

## 4. Big sun + light (`light.tsx`)

```tsx
<BigSun cx={600} cy={1040} r={300} horizon={1090} tod="dusk"   // r default 150; ref 2 baseline 94-120, PEAKS 270-490
  path={[{t: 0, y: 1040}, {t: 6, y: 1100}]}           // set / rise path (-> core Sun moves)
  beats={[0.32, {t: 1.33, amp: 0.06}]} hops={...} bounce={...} drift={[8, 0]}   // all core Sun character behaviours
  glow={2} glowMode="rings" />                         // opaque stepped rings r x1.25 (#F19160) and x1.5 (peach), measured
                                                       // proposal; 'stack' = translucent discs (night). Rings FOLLOW
                                                       // hops / beats (they ride on a 2nd, invisible Sun)
<Glow cx cy r rings spread color opacity core at />   // stepped concentric flat discs (a bulb, a lamp, a screen)
<LightShaft from={[x, y]} angle={118} length w0 w1 beams={3} opacity={0.13} sweep={1.5} at />  // flat translucent beams
<RimLight rect={[x, y, w, h]} side="right" width color />   // lit strip on one side
<RimLight points={poly} light={-60} width color />          // strips on the polygon edges facing the light (rimPath())
<Silhouette color d={path} />                              // fill-only shape
<Silhouette color>{<Person .../>}</Silhouette>              // any kit element, fill-only (alpha mask)
<Rimmed color={palette.peach} dx={4} dy={-3}>{children}</Rimmed>   // backlit: offset silhouette behind the children
```

Masks: keep the region under ~4000 px a side (`SIL_BOUNDS` default = frame + margin; pass `bounds` for content far
outside the frame). Use them for a few hero elements, not for crowds (TinyCrowd has `silhouette`).

## 5. Windows (`windows.tsx`)

```tsx
<LitWindows grid={{x, y, w, h, rows, cols, fw, fh, jitter, skip, bay}} quad?={Quad} initial={0.1}
  events={[{at: 1, dur: 3, to: 'on', pattern: 'wave', origin: [0, 1], noise: 0.3, fraction: 0.8}]}
  lit={[peach, cream]} dark blinds={0.12} pop={0.35} flicker={0.25} ink={{}} />
```

Patterns: `random | rows | cols | sweep (dir deg) | wave (from origin u/v) | collapse (toward origin)`; events apply in
order (later switches win), so on-waves and off-waves can chain. Switch = pop (+35% for 0.16 s) and a one-frame
flicker on a quarter of them. Batched: dark panes, lit panes per colour and blinds are one path each.
Low level: `gridCells(spec, seed, quad?)`, `switchTimes(cells, events, seed)`, `windowPaths(cells, events, times, t, look)`.

## 6. Scale kit

```tsx
<EndlessCity horizon={1010} nearY={1640} rows={6} farS={0.1} tod="dusk" seed="pilt" towers={0.1} beacons={0.9}
  rowProps={(r) => ({hRange: [..], landmarks: r.i === 1 ? [{x: 330, w: 210, h: 3500, kind: 'spire'}] : undefined})}
  windows={{initial: 0.12, events: [{at: 0.2, dur: 5.5, to: 'on', fraction: 0.55}]}}
  haze={0.45} at?={0.3} inRow?={(r) => ({behind, front})} />
cityRows({horizon, nearY, rows, farS})   // {i, base, s, depth, parallax} per row: place props inside a row
<Skyline base s depth tod seed ink windows landmarks at beacons />   // one frontal row (the reference's skyline)
<Tower x y wl wr top vpy tod floors colsL colsR windows light="right" crown />   // worm's-eye 3-point tower
towerFaces({...})                                                                   // its face quads
<Monument cx by bw ty taper tod people columns dome flag emblem={(x, y, r) => ...} /> // colossal civic building
monumentMap({cx, by, bw, ty}).at(X, Y) / .scale(X, Y)                               // elevation -> screen
<WallOfWindows quad rows cols tod initial events exclude={[[r, c]]} fw fh inkW precision />
windowQuad(quad, rows, cols, row, col, fw, fh)                                      // one window's screen quad
<PerspectiveStreet vp f camH road walk tod seed poles lights lightsOn windows crowd />  // ref 2's one-point street
<StringLights x1 y1 x2 y2 sag n r tod on={{at, dur}} at />   // bulbs on stems; lit = peach + sage stepped halo
<Pole x y h w bars at />   <Wires a b n gap sag />
<TinyCrowd n area={[x0, y0, x1, y1]} horizon k at span order walk walkDir depth tod silhouette />  // 6-30 px back views
<TinyFigure x y h coat hair legs />   tinyFigure(headBuf, bodyBuf, legsBuf, x, y, h)
<Ledge y tod floor at />   <Plinth x y w h tod />   <WindowCloseup w h tod offAt person />   <WipePass at dur dir color rim />
```

Perspective helpers (`persp.ts`): `quadMap(quad)` (homography of the unit square: rows foreshorten), `cell`,
`persp1({vx, vy, f, camH})(x, y, z)` (tiny 3D projection, y up), `affineFromTri(rect, p0, p1, p3)` (place a flat
drawing onto a facade cell, e.g. the hero window), `toward`, `lerpPt`. Map geometry first, then draw with the sketch
helpers in screen space so the hand-drawn wobble stays screen-sized. (For whole kit components on a plane, the core
lane's `<Plane>` in `src/lib/persp.tsx` projects Ink/Fill point by point.)

## 7. Recipes (what the demo proves)

**Arcane vista (feel small, a PEAK shot in style_bible_ref2 8).** Sky bands kept below y 600 (captions sit on one flat
teal) + stars + a half-set r 300 sun with two opaque glow rings behind the far rows; `EndlessCity` 6 rows with
colossal `landmarks` in rows 1-2 (thin far needles, a stepped tower); a `Ledge` at depth -0.45 with a small back-view
`Person` (~150 px) and the mascot (`sit-back`, scale 0.85) wrapped in `Rimmed` (peach rim = backlit); `StringLights` at depth -0.8 framing the
top; `push` 0 -> 0.28 over 4.6 s anchored in the city, then a settle; windows switching on across the city all shot long.

**Worm's-eye crane.** `Monument` far wider than the frame (`bw` 1750, taper 0.42) so verticals converge; tiny people
on the steps and a `TinyCrowd` on the plaza; a `LightShaft` that shoots on; a near back-view figure and the mascot on
a `Plinth` at depth -0.5 (they fall out of frame first); camera `y` 1260 -> -540 with `CAM.reveal`, landing on the dome
with the sun behind it (sky layer at depth 0.92 barely moves).

**Pull-back.** `WallOfWindows` 80 x 44 in a steep quad; the hero window (`windowQuad`, excluded from the grid) drawn
with `WindowCloseup` placed by `affineFromTri`; camera `zoom 5 * push 0.833` (about 30x) -> rest with the hero as
`anchor` (anchorTo screen centre -> rest), wall ink width via `layerScale` so it stays 1.6 px; an on-wave from the hero
outward while pulling back, then two off-waves; the hero switches off last; the sun sets at the vanishing point.

## 8. Performance rules

1. **Batch.** Anything numerous (windows, stars, tiny people, bulbs, birds) goes into one `PathBuf` path per colour.
   Never a component per window. A row of a city is ~10 paths whatever its building count.
2. **Memoise geometry, recompute only state.** Static geometry is cached by seed (`memoize`, `useMemo`); per frame only
   the switch states / positions are rebuilt (strings of a few thousand rects cost ~1-3 ms).
3. **Fill-only far, ink near.** Far rows have no ink at all (style + speed). Use the core `<Ink>` (taper, draw-on)
   only for a few hero lines; batched ink is a single plain stroked path.
4. **One `<g transform>` per layer.** Camera moves never touch geometry.
5. **Masks sparingly** (Silhouette / Rimmed): each is an offscreen raster; a few per frame is fine, keep them < 4000 px.
6. **Precision for deep zooms.** `PathBuf(precision)` / `WallOfWindows precision={3}` when a camera zooms 10x+ into
   batched geometry (default 0.1 px rounding would show).
7. **Static translucency only** (haze, shafts, glows): never animate opacity; switch things by pop / wipe / scale.

## 9. Known gaps

- `Silhouette` / `Rimmed` use alpha masks: fine for a few hero elements; a very large mask region (> ~4000 px) can
  tile and repeat in Chrome (seen once during development; the default bounds avoid it).
- Batched tiny crowds draw all legs, then bodies, then heads: overlapping far figures can show a head over a nearer
  body (invisible at 6-30 px).
- `PerspectiveStreet` facades are plain (windows + ink edges): no doors / awnings / shopfronts yet; pair it with core
  kit pieces on a `<Plane>` for hero blocks.
- `Monument` and `Tower` have no build (draw-on) animation; they are establishing pieces whose life comes from people,
  birds, windows, flags, shafts and the clock emblem.
- The wall of windows reads busy at mid zoom (moire of thousands of cells); keep it on screen while it changes.
