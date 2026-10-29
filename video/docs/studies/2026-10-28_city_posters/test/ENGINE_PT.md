# The look test's patchwork and texture lane (PT): `lib/patchwork.ts`, `lib/texture.tsx`, `check_banding.py --texture`

*Lane PT of the 7 s look test (`STUDY.md` §10, build items 6 and 10). Written as it goes. Specs: CRAFT §b ("Tier C's
build: the low poly patchwork"), §c ("The paper-and-paint test, its spec"); `style.md` L3-L4 and §1.3-1.4; `pro_2` §3.1,
§3.4; `pro_4` §3.4. Decided (owner, 2026-10-29, "Go with your suggestions"): the patchwork for the ground and the far
city (never on the subject, never in the sky), a VERY subtle mottle, 2 px lines on floating layers.*

Status: item 6 done (2026-10-29); item 10 in progress. Nothing existing is changed: two new lib files, one new option
in a QA script. Scratch work in `/tmp/posters-pt/` (never the shared scratchpad).

## 1. The pieces
| File | What |
|---|---|
| `src/lib/patchwork.ts` | pure TS (no React, no clock): a seeded guillotine split of a plane's mass, projected (groundCam, a quad's homography, or frontal), whole-pixel facets toned from the plane's fills |
| `src/lib/texture.tsx` | `<Mottle>`: the per-plane mottle, an SVG filter locked to its plane's group (§3) |
| `scripts/qa/check_banding.py` | `--texture`: the texture-aware mode (§4) |
| `src/look/pt/` | the demos (entry `src/look/pt/entry.tsx`): `PtPatchworkDemo` (props `mode` 'flat' / 'patch' / 'grid'), the texture demo; `pw_harness*.ts` node harnesses (bundle with esbuild, never imported by a film); `probe*.tsx` the filter feasibility probes |
| `engine_patchwork.png`, `engine_texture.png` | the demo stills (this folder) |

## 2. `lib/patchwork.ts` (item 6)
**What it does.** Cuts a C mass (its layout polygon in its PLANE's own coordinates) into flat facets by a seeded
recursive guillotine (BSP) split, projects them (`viaCam(cam, level)`: lib/depth `groundCam`, so the ground recedes;
`viaQuad(quad, w, h)`: a quad's homography; `frontal`: screen px), snaps every vertex to a whole pixel (T-junction
vertices are inserted first, so two facets share their edge vertex for vertex: no seam, no overlap; every polygon has
one winding), and tones each facet from the plane's fills so that neighbours differ by the plane's dL* as SHOWN.
Static: a pure function of its options, so it is locked to whatever group draws it (draw it inside the plane's float
group) and never boils. Compute it once (module scope or `useMemo`): 200-400 facets take 40-120 ms.

```ts
import {frontalBlocks, groundPatchwork, markShape, patchPaths, patchTones, patchworkProblems, twoPointCam, viaQuad, patchwork} from '../../lib/patchwork';
const PAVE = groundPatchwork(CAM, {seed: 's1quay', poly: [[-4.4, 1.95], [4.4, 1.95], [4.4, 9], [-4.4, 9]],   // ground x, z (m)
  cell: 0.8, grid: 0.3, tones: patchTones(CM10B.pavingShade, {plane: -1}), plane: -1, key: [-1, -0.25],
  avoid: [HER_BOX]});
// draw: the base first (it fills every anti-aliased seam and every dropped facet), then the facets, then the marks
<Fill d={PAVE.base.d} color={PAVE.base.color} offset={false} />
{patchPaths(PAVE, {by: 'cell'}).map((p) => <Fill key={p.key} d={p.d} color={p.color} offset={false} />)}
{PAVE.facets.filter((f) => f.mark).map((f) => { const m = markShape(PAVE, f, 'square'); return m && <Fill key={f.id} d={m.d} color={m.color} offset={false} />; })}
const FAR = frontalBlocks({seed: 's1far', poly: SKYLINE, tones: patchTones(recede(CM.brick, 3, ATM), {plane: 3}), plane: 3});
patchworkProblems(PAVE, 'quay')    // [] = OK: run it in the scene's problems()
```

| export | what |
|---|---|
| `patchwork(opts)` | the general form. `poly`: one simple polygon (convex or not: cut into exact convex parts) or a list of parts; `project` (default `frontal`); `plane` (default 0: sets `minPx`, the size and the steps from `PATCH_PLANE`); `cell` (plane units, [u, v] or one number; default the plane's `cellPx` through the projection at the mass's centre); `minPx` (never split below this min width on screen); `maxPx` (keep splitting while a side is over it; default 1.7 x cellPx); `jitter` (cuts in 0.5 +- 0.25); `grid` (cuts snap to a module: paving rows); `diagonal` (45-degree corner triangles on the top row: roofs); `tones` (the plane's fills, >= 3; 2 = a far plane's two values, equal neighbours then merge); `dL` (default the plane's); `shown` (the colour as drawn: `c => tierFill(c, 'environment')`); `key` (the screen direction toward the key: facets lean lighter on that side) and `keyBias` (1.2); `band` (default y 290-600; null = none) and `bandMargin` (12 px, the float); `avoid` (screen boxes kept clear: the subject and its calm field); `marks` (one facet in about `marks` flagged, never two neighbours; false = none); `clip` (the screen area worth cutting, default the frame + 80 px) |
| `groundPatchwork(cam, opts & {level})` | a ground through the shot's ONE camera: `poly` in ground (x, z) metres, `cell` in metres (a paving module); plane -1, marks 1 in 16 (a drain, a ring, a hatch) by default |
| `frontalBlocks(opts)` | a mid or far city mass in screen px, frontal (CRAFT §b): cuts level and plumb at whole px (`grid: 1`), 15 % of the top row's leaves get a 45-degree corner triangle, plane +3 by default, `cell` 1.25 x its cellPx |
| result `Patchwork` | `facets` (each: `pts` whole-px screen polygon, `d`, `tone`, `color`, `c` centroid, `area`, `minW` (its true min width), `wU` / `wV` (its width and depth through its centroid), `box`, `top` (on the roof row), `whole` (an uncut part), `mark`, `uv`); `base` {d, color} (the whole mass in the middle tone); `adj` (neighbours by index); `spec`; `project`; `dropped`; `offRange` |
| `patchPaths(pw, {by, cell})` | the facets as few paths: 'tone' (one compound path per tone), 'cell' (per tone per 160 px screen cell: a frame-0 flood (lib/exit `Look` cascade) ripples cell by cell instead of flipping a whole tone at once), 'facet' |
| `patchTones(base, {n, step, plane, shown})` | n tones of one fill: L* steps centred on the base, hue kept, chroma eased 1 C* per 4 L* lighter, never beige / olive / grey (lib/water `cleanColour`). Defaults by plane: near 4 tones 4.6 apart (pairs 4.6 / 9.2; the outer pair, 13.8, the solver never makes neighbours), +2 three 3.0 apart, +3 three 2.4 apart, +4 three 2.0 apart. With `shown` the tones are pre-compensated so the steps SHOWN are `step` (the clean pen's environment pull shrinks every step by 16 %). Or pass lib/gamut `siblings` / lane E's `siblings10b` instead |
| `markShape(pw, facet, kind)`, `markTone(color, plane)` | an identity mark in the facet's plane coordinates, projected like it (a drain foreshortens): 'pair' (a window pair), 'slot' (a door), 'band' (a sill, a roof edge), 'square' (a drain, a hatch); its tone a darker step of the facet (-7 L*) near, tone-on-tone (-4) far (CRAFT §f.2); null when it would fall under the plane's minPx |
| `viaCam(cam, level)`, `viaQuad(quad, w, h)`, `frontal`, `twoPointCam({horizon, vpL, vpR, vpx, height})`, `groundAt(cam, sx, sy, level)` | projections; `twoPointCam` = lib/depth `groundCam` from two vanishing points (v2 S1's bank: `twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600, height})` gives f 1838 and yaw 41.74, its `vp` and `vpX` exactly v2's GROUND_VP and GROUND_VP2; its bank edges are lines of constant world x); `groundAt` the inverse (a screen point -> ground x, z) to lay a polygon out from screen corners |
| `patchStats(pw)`, `patchworkProblems(pw, name)` | the numbers (facets, median width / depth / side, the smallest cut facet, neighbour pairs in range, spikes (over the range's top), merges (same-tone neighbours), the tones' span, marks) and the lint: cut facets under minPx, any spike, under 90 % of the distinct-tone pairs in range, over 20 % merges, a span over 15 L* (CRAFT §c), any facet in the band (+ the float margin) or an avoid box, a median width under 0.5x or over 2x the plane's cellPx |
| `PATCH_PLANE`, `patchStep(plane)`, `PATCH_BAND`, `PATCH_SPAN_MAX`, `PATCH_TOL` | the numbers below; `PATCH_TOL` 0.3 L*: an 8-bit hex moves a tone's L* by up to ~0.2 |

**The numbers (`PATCH_PLANE`, sources).** minPx: C near's smallest feature 8 px, C far's 12 (pro_2 §3.1); cellPx: C
near's typical face side 30-75 [49], C far's 50-200 [77] (pro_2 §3.1), the posters' patches 38-81 px wide (style.md §1.3:
3.5-7.5 % W); neighbour dL*: 4-10 near (CRAFT §b, pro_2 §3.1), 2-4 far (pro_4 §3.4: "dL* 2-4 far, 4-10 near"), +1 4-8,
+2 3-6, +3 2-5 between; the tones' span <= 15 L* in one plane (CRAFT §c).

| plane | -2 | -1 | 0 | +1 | +2 | +3 | +4 |
|---|---|---|---|---|---|---|---|
| minPx | 8 | 8 | 8 | 8 | 10 | 12 | 12 |
| cellPx | 56 | 52 | 50 | 56 | 64 | 77 | 90 |
| neighbour dL* | 4-10 | 4-10 | 4-10 | 4-8 | 3-6 | 2-5 | 2-4 |

**How it decides.** A cell splits along the axis that most exceeds its target (its plane length over `cell` x a
seeded 0.9-1.25, or its screen chord over `maxPx`), at a seeded 25-75 % (snapped to `grid`), only if both children keep
the plane's min width ON SCREEN (their true projected width, rotating calipers: an axis chord lies under shear); a cell
wholly off the frame is not cut. Tones: DSatur (the most constrained facet first) with seeded preferences (lighter
toward the key, usage kept even), then a min-conflicts repair that weighs a SPIKE (a step over the range's top: more
contrast than tier C may have) far above a soft step (under the bottom: the posters keep 12-52 % soft steps) and a
same-tone pair (the two read as one bigger facet: harmless). Four near tones cannot colour an odd wheel (a facet ringed
by an odd cycle) without one merge, so ~8 % of neighbour pairs merge on a random guillotine and ~0 % on a paving grid.

**Measured** (`engine_patchwork.png`; v2 S1's lens, a quay x -4.4..4.4 m, z 1.95..9 m, `cell` 0.8 m, the 10b rose
paving `#CFAFA4`; a far skyline of 50-110 px buildings at +3 from the receded brick):
| | B: random guillotine | C: + a 0.3 m paving module |
|---|---|---|
| quay facets / median width / depth / smallest | 335 / 65.6 / 54.7 / 8 px | 211 / 75.7 / 50.3 / 8 px |
| neighbours in dL* 4-10 / spikes / merged | 100 % / 0 % / 8 % | 100 % / 0 % / 0 % |
| far city facets / median width / smallest | 69 / 47 / 13 px (dL* 2-5: 100 %; span 4.9 L*) | the same |
| built in (node) | 124 ms | 37 ms |
The seams at 2x: none (the shared-vertex snap); the far blocks' level and plumb edges land on whole pixels (no
anti-aliased edge at rest); the slab decomposition cuts a gable at its ridge, which reads as a lit and a shade roof.

**Wiring it into S1 (lane S).**
- v2's bank is a two-VP construction (`V2S1_steps_stone.tsx`: `GROUND_VP` (-1100, 1000), `GROUND_VP2` (2600, 1000),
  `edgeY`). Either (1) per tread, `patchwork({poly: [[0, 0], [L, 0], [L, D], [0, D]], project: viaQuad(theTreadsScreenQuad, L, D), cell: [0.9, D]})`
  (exact: the tread's quad, its sides to the two VPs, is the perspective image of an L x D m rectangle; the harness:
  69 facets on one tread, all in range), or (2) `const BANK_CAM = twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600,
  height: h})`, then `groundPatchwork(BANK_CAM, {poly, level: -k * rise})` with the polygon from `groundAt` of the
  screen corners (a tread is a strip of constant world x).
- Pass 2's near group sits at L* 50-60 (P1, lane E's `nearStep(c, -2, ATM, {maxL: 55})`): give `patchTones` the
  stepped base, or lane E's `siblings10b()` for the paving roles.
- Draw the patchwork inside its plane's float group (`S1Plane`), the base first. Under `<Tier tier="environment">`
  through `<Fill>`, pass `shown: (c) => tierFill(c, 'environment')` to `patchTones` and `patchwork` (the pull shrinks
  every step by 16 %), or draw the fills with `backdrop` (never recoloured) and skip `shown`.
- For the frame-0 flood, `patchPaths(pw, {by: 'cell'})` (one Fill per tone per 160 px cell): each cell's fill floods
  when the cascade reaches its centre.
- `avoid` her box and the door's (plus a calm margin: CRAFT §f.3's field behind a subject's edge); the base shows there.

**Not built (lean; the study's extras):** translucent overlaps as third tones (style.md §1.3), Delaunay facets for
natural masses (pro_2 §3.4 named delaunator: lane N's foliage builds its own crowns), the sky's edge planes (never as
rectangles in the sky: DIRECTION rule 2).

## 3. `lib/texture.tsx` (item 10)
(in progress)

## 4. `check_banding.py --texture`
(in progress)

## 5. Libraries (the owner: "only if it's genuinely better than built yourself")
| piece | chosen | looked at (version, licence) | why |
|---|---|---|---|
| the guillotine split | our own (~60 lines in `patchwork.ts`) | d3-hierarchy 3.1.2 (ISC: `treemapBinary` / `treemapSliceDice`), @kitsuyui/rectangle-dividing 0.2.1 (MIT, Rust/WASM), Atum 1.0.0 (procedural BSP, 2017, abandoned) | the treemaps split axis-aligned RECTANGLES by value; ours splits a convex polygon in plane coordinates with screen-size rules through a projection (min width on screen, max side, off-frame), a paving grid and 45-degree roof cuts. None does that; wrapping one would be more code than the split |
| cutting a convex polygon by a line | our own (Sutherland-Hodgman against one half-plane, ~25 lines) | split-polygon 1.0.0 (MIT, robust arithmetic) | our cuts are axis-aligned and copy the cut coordinate exactly; the robust predicates buy nothing here |
| concave masses (a skyline) | our own exact vertical-slab (trapezoid) decomposition (~40 lines) | polygon-clipping 0.15.7 (MIT, Martinez-Rueda; deps robust-predicates, splaytree; 350 kB unpacked; last release 2023), polyclip-ts 0.16.8 (MIT, bignumber.js), clipper2-js 1.2.4 (BSL, 1.9 MB), martinez-polygon-clipping 0.9.0 (MIT) | the study suggested polygon-clipping to clip facets to the mass. A boolean-ops engine would be genuinely better if we intersected arbitrary polygons, but we never need to: a simple polygon splits exactly into vertical trapezoids at its vertices' x, each convex, and every later cut is a half-plane. Exact, dependency-free, and the T-junction pass handles the parts' shared edges. Adopt polygon-clipping if a later piece needs unions or holes |
| tones (graph colouring under a value rule) | our own DSatur + min-conflicts (~90 lines) | no npm package colours a graph under per-pair value ranges (searched "graph coloring", "dsatur": none) | |
| tones' never bands | lib/water `cleanColour` / `neverBand` (ours, existing) | - | one definition of the owner's never bands |
| the PNG noise tile (texture) | not used: feTurbulence (§3) | simplex-noise 4.0.1 (via @remotion/noise, installed), fast-png 8.0.0, pngjs 7.0.0, upng-js 2.1.0 (encoders for a JS-made tile) | §3 |
No dependency added; `package.json` unchanged.
