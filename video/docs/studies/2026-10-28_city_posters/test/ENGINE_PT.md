# The look test's patchwork and texture lane (PT): `lib/patchwork.ts`, `lib/texture.tsx`, `check_banding.py --texture`

*Lane PT of the 7 s look test (`STUDY.md` §10, build items 6 and 10). Written as it goes. Specs: CRAFT §b ("Tier C's
build: the low poly patchwork"), §c ("The paper-and-paint test, its spec"); `style.md` L3-L4 and §1.3-1.4; `pro_2` §3.1,
§3.4; `pro_4` §3.4. Decided (owner, 2026-10-29, "Go with your suggestions"): the patchwork for the ground and the far
city (never on the subject, never in the sky), a VERY subtle mottle, 2 px lines on floating layers.*

Status: items 6 and 10 done (2026-10-29). Nothing existing is changed: two new lib files and one new mode in a QA
script, whose default path is proven unchanged (§7). Scratch work in `/tmp/posters-pt/` (never the shared scratchpad).
**For lane S, the wiring and one hazard: §6.**

## 1. The pieces
| File | What |
|---|---|
| `src/lib/patchwork.ts` | pure TS (no React, no clock): a seeded guillotine split of a plane's mass, projected (groundCam, a quad's homography, or frontal), whole-pixel facets toned from the plane's fills |
| `src/lib/texture.tsx` | `<Mottle>`: the per-plane mottle, an SVG filter locked to its plane's group (§3) |
| `scripts/qa/check_banding.py` | `--texture`: the texture-aware mode (§4) |
| `src/look/pt/` | the demos (entry `src/look/pt/entry.tsx`, never imported by a film): `PtPatchworkDemo` (props `mode` 'flat' / 'patch' / 'grid'), `PtTextureDemo` (`mode` 'flat' / 'mottle': a float 0.2-1.6 s, then a hold), `PtTextureCal` (the calibration fields); `pw_harness*.ts` node harnesses (bundle with esbuild into a scratch folder: `npx esbuild src/look/pt/pw_harness.ts --bundle --platform=node --outfile=<dir>/h.cjs && node <dir>/h.cjs`) |
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

**How busy, and the calmer knobs** (lane S's flag: "the patchwork paving at the near world's mid-tones reads busy").
By CRAFT §e's own measure it is calm: a mid-tone quay (L* ~55 base, v2 S1's lens, `pw_harness4.ts`, rasterized) reads
local contrast 1.6 against tier C near's cap of 7 (9 when still) and the posters' near patchwork's 9.7; what reads as
busy is the count of visible edges. Inside the dL* 4-10 rule, fewer tones and a bigger cell quiet it:
| tones (`patchTones`) / `cell` (0.3 m module) | edge pixels | local contrast | facets | merged neighbours |
|---|---|---|---|---|
| 4 at 4.6 (the default) / 0.8 m | 2.9 % | 1.63 | 239 | 0 % |
| 3 at 4.5 / 0.8 m | 2.9 % | 1.67 | 239 | 0 % |
| 3 at 4.5 / 1.2 m | 2.7 % | 1.53 | 201 | 0 % |
| **2 at 4.5 / 1.2 m** (`patchTones(base, {plane: -1, n: 2, step: 4.5})`, `cell: 1.2`) | **2.3 %** | **1.03** | 201 | 18 % (bigger regions) |
All pass the lint. The two-tone version is the calmest that keeps every step inside 4-10: one step size, and the odd
cycles merge into larger shapes. Fewer marks (`marks: 24`) quiet it further; the owner's glance test decides.

**Not built (lean; the study's extras):** translucent overlaps as third tones (style.md §1.3), Delaunay facets for
natural masses (pro_2 §3.4 named delaunator: lane N's foliage builds its own crowns), the sky's edge planes (never as
rectangles in the sky: DIRECTION rule 2).

## 3. `lib/texture.tsx` (item 10)
**What it is.** `<Mottle>` wraps ONE plane's fills, inside the plane's float group, in an SVG filter:
`feTurbulence` (fractalNoise, 3 octaves, base frequency 0.0125, the plane's own integer seed) -> `feColorMatrix` (one
luminance noise from the turbulence's R channel, two faint colour noises from G and B, alpha 1) -> (the band mask, §3.3)
-> `feComposite arithmetic` with the plane's own pixels: each pixel x (1 + s (N - 0.5)) in sRGB, s = 0.049 k. The noise
lives in the group's user space, so it rides the group's transform exactly (the sub-pixel float moves it with the
fills; a zoom scales it with the world). Static: a pure function of its props and the transform; nothing re-seeds.

```tsx
import {Mottle, mottleK, mottleSeed} from '../../lib/texture';
<g transform={`translate(${dx} ${dy})`}>                                        // the plane's float group
  <Mottle k={mottleK({plane: -1})} seed={4} offset={[dx, dy]} on={3.5}>        // near C: 0.7; on from 3.5 s (pass 1)
    ...the plane's fills...
  </Mottle>
</g>
```

| export | what |
|---|---|
| `<Mottle k seed scale chroma band soft offset region on>` | `k` strength (1 = the spec; 0 = OFF: no filter at all, the children render exactly as without the wrapper); `seed` an integer per plane (two planes never read as one sliding sheet); `scale` the blotch size against the spec's (0.7-1.3 stays in 30-70 px); `chroma` the colour share (0 = a pure value mottle); `band` the screen rows kept clean (default LAYOUT's caption band y 290-600; null = none) with a `soft` 48 px ramp outside it; `offset` the group's current float offset (keeps the band SCREEN-locked while the plane moves); `region` the filter region in the group's user space (default the frame + 160 px; it CLIPS the plane: it must hold all of it); `on` true / false / a start time (s) |
| `mottleK({plane, tier, sky})`, `MOTTLE_K` | the strength by tier and plane (CRAFT §c; pro_2 §3.1): the sky 0.6, a group that is tier A or B 1.0 (pass `tier`), tier C on plane <= +1 0.7, on +2 and farther 0.4 |
| `mottleSeed(plane, salt)` | a plane's own seed: the same for every group of one plane (one surface), different across planes, the sky its own |
| `MOTTLE`, `MOTTLE_BAND` | the spec (std 0.5 L*, blotches 30-70 px, radius ~28, colour 0.35) and the band [290, 600] |
| `mottleProblems(planes)` | the lint: a plane's k over its spec, a plane reaching the band with no band kept clear |

**3.1 Why an SVG filter on feTurbulence** (probed before building; the probes are retired, their numbers kept here):
- *It rides the float, sub-pixel:* at a 0.37 px offset the filtered layer shifts smoothly (edge pixels interpolate:
  217 / 207 / 197 as direct rendering does), no snapping to whole pixels; a 2 px line keeps its anti-aliasing.
- *Deterministic:* the same frame in two processes is byte-identical (feTurbulence is specified to the bit by the SVG
  reference code).
- *Switching it on is clean:* the filter at k 0 against no filter differs by at most 1 code on 3,400 edge pixels
  (the layer's rounding): pass 1's switch at 3.5 s pops nothing but the mottle.
- *feTurbulence over a PNG tile:* both work (an feImage of a tileable Gaussian-noise PNG loaded at frame 0 and rode the
  float too), but the PNG needs an asset, a loading guard (a frame rendered before its decode would flash flat: a
  boil) and feTile, and cost +47 ms per full-frame plane against +27 (probe, 2 octaves). The look: at 0.012 x 2 octaves
  Perlin noise shows a faint grid; 3 octaves read as a natural multi-scale paper mottle; the Gaussian PNG read as
  even bubbles. Chosen: feTurbulence, 3 octaves.
- *Multiplicative, sRGB:* a pixel x (1 + s (N - 0.5)) keeps transparent pixels transparent and the mean colour exact. In
  sRGB the L* swing is proportional to the fill's value (a paint-density mottle): a light fill shows the full amount, a
  mid one ~0.7x, a dark window ~0.4x ("VERY subtle" where the darks are). An additive (value-uniform) mottle cannot be
  built alpha-correctly from these primitives (it needs signed intermediates).
- *The edge trade-off, measured:* the composite raises the alpha of a plane's outer anti-aliased pixels by s/2, so
  while the plane sits at a fractional offset that one row reads <= ~0.8 L* darker (an internal seam between two
  abutting shapes of one plane, already a conflation seam, up to 1.4); at rest 0. A 0.02 px dilation of the silhouette,
  inside CRAFT §c's float budget (<= ~2 L*). The alpha-exact variant (k1 + k2 = 1, then a transfer multiplying the
  colour back) was built and rejected: its extra 8-bit step truncates, shifting whole planes by 0.05-0.18 L* (a half-code
  intercept fixed only part of it, and it depends on Chrome's rounding).

**3.2 Calibration** (`PtTextureCal`: flat fields from paper L* 96 to a dark L* 33; meter = style.py's mottling: the
layer minus a quadratic surface, blurred sigma 4 px; the radius in ~400 px windows, as the posters' sky boxes):
| at k = 1 | measured | spec / posters |
|---|---|---|
| std, a big light field (L* 86-88) | 0.44 L* (0.40-0.47 by window) | <= 0.5 (CRAFT §c); posters 0.39-0.71 |
| std by fill (stripes) | L* 96 0.48, 88 0.40, 86 0.46, 78 0.37, 70 0.36, 61 0.29, 50 0.27, 33 0.18 | |
| p1-p99 | 2.0 L* | posters 2.0-3.2 |
| 1/e radius | 29.3 px (28.7-32.2); whole-frame ACF 33 | blotches 30-70 px; posters 20-36 (median 30); the study's test 28 |
| colour (a*b* std) | 0.29-0.31 (the value mottle alone: 0.04-0.2, the 8-bit rounding) | <= 0.35 |
| mean shift | <= 0.03 L* (every fill) | 0 |
| high-pass (a grain) | 0.06-0.08 (the 8-bit rounding floor) | none in the first test |
The constants (`CAL` in texture.tsx): s 0.049, freq 0.0125, 3 octaves, colour weights 0.18 / 0.21.

**3.3 The caption band.** Inside the filter, one neutral grey flood (the noise's mean: no modulation) over the band
and half the soft edge, blurred vertically (sigma soft/4): the mottle is 0 inside y 290-600 (2 % at its edge) and full
48 px outside, a smooth ramp, no line. The flood's rows are the band's SCREEN rows mapped through `offset`, so the band
stays put while the plane floats: measured 0.000 L* inside the band at rest and with the plane at (3.4, -9.2) px; above
and below 0.45-0.49. (The first version stepped 8 floods per side merged: +29 ms per frame; the blurred flood: +7.)

**3.4 Locked to the world, never boiling.** The texture layer (textured - flat) at a (7.3, -9.6) px plane offset
against the rest layer moved with the plane: r 0.9998, mean |diff| 0.0055 L*; against the rest layer unmoved (what a
screen-locked texture would show): r 0.83, 0.21 L*. On a hold, consecutive frames are identical.

**3.5 The demo** (`engine_texture.png`: the patchwork set under v2 S1's own evening sky (lib/sky's gradient and dither),
five planes, each its own `<Mottle>`, floating by lib/depth `PARALLAX_Z`; A/B by `check_banding.py --texture`):
| plane | k | layer std | radius | colour | verdict |
|---|---|---|---|---|---|
| the sky | 0.6 | 0.27 L* (the band 0.001) | 33 px | 0.21 | PASS; the sky's own banding PASS (flat PASS; band dL* 0.02 both) |
| the far city (+3) | 0.4 | 0.17 | (a thin strip) | 0.14 | PASS |
| the water (-0.5) | 0.7 | 0.25 | 33 | 0.22 | PASS |
| the quay (-1) | 0.7 | 0.29 | 33 | 0.22 | PASS |
| the subject (teal, L* ~50) | 1.0 | 0.28 | 28 | 0.24 | PASS |

**3.6 Through H.264** (the demo's 2 s: the float 0.2-1.6 s, then a hold; masters by `render-media.mjs --master`, then
style.py's platform rungs: x264 3.5 Mbps at 1080p, 1.5 Mbps at 720p):
| | flat | mottle |
|---|---|---|
| master bitrate | 1197 kbps | 1714 kbps (+517 kbps, +43 % on this sparse set; the study measured ~+500 kbps, +27 %, on v2 S1's busier frame panning 30 px/s: the absolute cost is the texture's, the share depends on the scene) |
| the mottle kept at 1080p 3.5 Mbps / 720p 1.5 Mbps | | the sky 100 / 101 %, the water 100 / 98-99 %, the quay 100 / 100 % (this demo never starves the rungs; the study's busier frame kept 84-95 %) |
| a hold, frame-to-frame mean |dL*| | 0.0001 (master) / 0.0005 (720p) | 0.0001 / 0.0011: static |
| during the float, frame-to-frame mean |dL*| | 0.0176 | 0.0211 (+0.0035: the texture moving with its plane; the study's world-locked mottle +0.021 at 30 px/s) |
| `check_banding.py --texture`, the sky | | PASS at the master, 1080p and 720p (layer 0.273-0.277 L* against 0.271 in the PNG; in the band <= 0.015; banding PASS flat and textured; structure p99.9 1.25 L*) |
| render, 120 frames at concurrency 2 | 11.4 s | 28.1 s: a full-frame plane costs ~+77 ms a frame (feTurbulence over 3 Mpx), the band mask +7; a tighter `region` is cheaper |

**Not built (the study's extras, lean):** a grain (CRAFT §c: none in the first test); the crossfade to the next octave
past a ~1.2x zoom (Bénard et al.: a zoom here scales the mottle with the world); per-tier strength inside one plane
group (the group takes one k: give a plane holding the subject 1.0).

## 4. `check_banding.py --texture` (item 10)
A deliberate world-locked mottle is not banding and a grain is not the dither, so the texture mode (off by default:
without `--texture` every number and verdict is as before, §7):
- **grain** is the HIGH-PASS residual (L* minus its blur, sigma 4 px, on the sky pixels): the dither and any grain,
  never the mottle's low frequencies (GRAIN_MAX 0.6 still applies to it); `mottle` (the band-pass, blur 4 - blur 40)
  is reported.
- **`--flat F`** (the A/B: the same frame(s) with the texture off, PNG or video): the layer Lab(input) - Lab(F) on flat
  pixels (3 px clear of any edge of F, read on F blurred sigma 1.2 over a 3 px span so a sky's dither is not an edge):
  its std (style.py's mottling, blurred sigma 4: <= 0.5 L* x `--k`, +15 %), p1-p99, the 1/e radius (the median over
  ~400 px windows: 15-35 px; a region under one window reads biased: reported, never warned), its colour (<= 0.35 a*b*),
  its high-pass (a grain, <= 0.15; between two encodes it is codec noise: reported, not judged), its mean shift, the
  band's std (`--texture-band`, default LAYOUT's 290-600: <= 0.08; `--band` stays the sky's flatness band 317-556), and
  STRUCTURE: the layer's |dL*| p99.9 over 3 L* (6 between two encodes) means a shape changed, not the mottle (a lib/light
  multiply or screen layer isolated by the plane's filter: §6). Both frames get the banding analysis; the textured one
  must be no worse than the flat one.
- **`--hold A,B`** (a video): consecutive frames of a locked hold must not move (mean |dL*| <= 0.08).
- **`--k`**: the plane's strength (lib/texture `mottleK`).
- **Verdict with `--flat`:** the TEXTURE's, i.e. what it adds to the flat frame, in any region (a sky, a patchwork, a
  wall: a region that is not open sky fails the sky's banding test in both frames, which is not the texture's doing).
  FAIL: texture in the band, steps it adds, structure. WARN: strength, radius, colour, grain, a hold that moves.
```bash
python3 -I scripts/qa/check_banding.py tex.png --texture --flat flat.png --region 0,0,1080,640 --k 0.6          # a still, the sky
python3 -I scripts/qa/check_banding.py tex.mp4 --texture --flat flat.mp4 --region 0,0,1080,640 --times 0.5,1.8 --hold 1.65,1.95 --k 0.6
```
Tested: the real mottle with the band kept clean PASS (in the band 0.0); the same mottle with no band FAIL (in the band
0.44); a k 1 mottle declared k 0.6 WARN; a tinted shape painted into the frame FAIL (structure, p99.9 15.2 against
0.84 for the mottle); the demo's planes PASS (§3.5); its master and both rungs PASS (§3.6).

## 5. Libraries (the owner: "only if it's genuinely better than built yourself")
| piece | chosen | looked at (version, licence) | why |
|---|---|---|---|
| the guillotine split | our own (~60 lines in `patchwork.ts`) | d3-hierarchy 3.1.2 (ISC: `treemapBinary` / `treemapSliceDice`), @kitsuyui/rectangle-dividing 0.2.1 (MIT, Rust/WASM), Atum 1.0.0 (procedural BSP, 2017, abandoned) | the treemaps split axis-aligned RECTANGLES by value; ours splits a convex polygon in plane coordinates with screen-size rules through a projection (min width on screen, max side, off-frame), a paving grid and 45-degree roof cuts. None does that; wrapping one would be more code than the split |
| cutting a convex polygon by a line | our own (Sutherland-Hodgman against one half-plane, ~25 lines) | split-polygon 1.0.0 (MIT, robust arithmetic) | our cuts are axis-aligned and copy the cut coordinate exactly; the robust predicates buy nothing here |
| concave masses (a skyline) | our own exact vertical-slab (trapezoid) decomposition (~40 lines) | polygon-clipping 0.15.7 (MIT, Martinez-Rueda; deps robust-predicates, splaytree; 350 kB unpacked; last release 2023), polyclip-ts 0.16.8 (MIT, bignumber.js), clipper2-js 1.2.4 (BSL, 1.9 MB), martinez-polygon-clipping 0.9.0 (MIT) | the study suggested polygon-clipping to clip facets to the mass. A boolean-ops engine would be genuinely better if we intersected arbitrary polygons, but we never need to: a simple polygon splits exactly into vertical trapezoids at its vertices' x, each convex, and every later cut is a half-plane. Exact, dependency-free, and the T-junction pass handles the parts' shared edges. Adopt polygon-clipping if a later piece needs unions or holes |
| tones (graph colouring under a value rule) | our own DSatur + min-conflicts (~90 lines) | no npm package colours a graph under per-pair value ranges (searched "graph coloring", "dsatur": none) | |
| tones' never bands | lib/water `cleanColour` / `neverBand` (ours, existing) | - | one definition of the owner's never bands |
| the mottle's noise | the browser's own SVG `feTurbulence` (the SVG 1.1 reference algorithm, in Chrome via Skia) | a tileable Gaussian-noise PNG (numpy FFT, made and probed: it rides the float too), simplex-noise 4.0.1 (MIT; installed via @remotion/noise 4.0.538) with a PNG encoder (fast-png 8.0.0, pngjs 7.0.0, upng-js 2.1.0, all MIT) for a JS-made tile | no asset and no loading guard (a frame rendered before an image decodes would flash flat: a boil), deterministic to the bit, cheaper per frame (+27 vs +47 ms per full-frame plane, 2 octaves) and at 3 octaves the most natural paper mottle of the three by eye (§3.1) |
| the band mask, the composite | SVG filter primitives (feFlood, feGaussianBlur, feMerge, feComposite) | an HTML/CSS layer per plane; a mask in the scene | one filter per plane group, nothing outside the plane's own markup |
| the texture check | our own (a mode of `check_banding.py`, numpy + OpenCV, already its deps) | libvmaf CAMBI (banding only; not in this ffmpeg build) | the A/B layer, the band and the structure need the flat render; CAMBI reads luma bands only |
No dependency added; `package.json` unchanged.

## 6. For lane S: wiring it into S1
- **The patchwork:** §2 "Wiring it into S1" (the bank's treads via `viaQuad` or `twoPointCam`; the far city via
  `frontalBlocks`; draw inside the plane's float group, the base first; `shown` under the clean pen's environment pull;
  `patchPaths(pw, {by: 'cell'})` for the frame-0 flood; `avoid` her and the door).
- **The mottle:** S's `TextureSlot` (`engine.tsx`, inside each `S1Plane`'s translate) is the place. Its planned body
  (`SCENE.md` §7: `<Mottle k={mottleK({plane, sky})} on={textureAt(sw, t)}>`) needs two more props: `seed` (a
  different integer per plane, else every plane carries the SAME pattern and the planes slide as one sheet:
  `seed={mottleSeed(plane)}`) and `offset={[dx, dy]}` (the group's float offset, which `S1Plane` has and must pass
  down to `TextureSlot`; else the band moves with the plane, since it is cut out in the group's own coordinates):
  `<Mottle k={mottleK({plane, sky})} seed={mottleSeed(plane)} offset={[dx, dy]} on={textureAt(sw, t)}>`. In full:
  ```tsx
  export const S1Plane: React.FC<{plane: number; children?: React.ReactNode}> = ({plane, children}) => {
    const t = useTime();
    const [dx, dy] = parallaxOffset(s1Float(t), plane, PARALLAX_Z);
    return <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>
      <Mottle k={MOTTLE_ON ? mottleK({plane, sky: !Number.isFinite(plane)}) : 0} seed={mottleSeed(plane)} offset={[dx, dy]} on={3.5}>{children}</Mottle>
    </g>;
  };
  ```
  (`MOTTLE_ON`: the scene's switch.) S1's planes by `mottleK`: the sky 0.6, the far roofs, tower and bridge (+2..+4)
  0.4, everything else 0.7, the subject's plane included (one k per group: its pixels are mostly the wing, tier C; her
  and W are small, and 0.7 against 1.0 on them cannot be seen; a group that IS the subject passes `tier: 'subject'` for
  1.0). Two groups of ONE plane (S1 draws the near plane twice: the branch and the near things; Pip rides the bank's
  plane in its own group) get the same `mottleSeed`, so they read as one surface; the same seed at two strengths would
  split one plane by tier with no seam in the pattern.
- **THE HAZARD: a mottled plane is ISOLATED.** A filter renders its group into its own layer, so a lib/light `Multiply`
  or `Screen` layer inside it (`Shadow`, `Shade`, `ContactShadow`, `CastShadow`, `PoolLift`, lib/water's shade strips)
  blends only with that plane's own fills: one that falls on ANOTHER plane would paint its tint solid there. In v2 S1:
  `S1BoatStrips` (the boats' waterline strips, in the boats group) multiply onto the water (another group); the
  towpath's shadows (`S1TowpathShadows`) and the wing's shades sit on their own plane (fine). Fix: draw such a layer in
  the group of the plane it falls on, or leave that plane unmottled. Check every switch-on with `check_banding.py
  --texture --flat` on the full frame: STRUCTURE FAILs on any shape the texture changed (a solid tint, a lost shadow).
- **The region clips:** the default (the frame + 160 px) holds any plane with the float's overscan; pass a tighter one
  only for a plane you know (the far city's rows), never one that cuts what the plane draws (the demo's first sky
  region cut the sky under the quay: a white strip).
- **The band stays put:** pass the group's offset; a group under a zoom (the push-through) needs the band mapped into
  its own coordinates (pass `band` in local rows and `offset` [0, 0]), or no mottle during the move.
- **Frame 0:** a mottle that is on at frame 0 mottles the flood's pale shapes too (paper with a paper texture); pass 1
  switches it on at 3.5 s (`on={3.5}`), after the opening.
- **Cost:** ~+20-80 ms a frame per mottled plane (by region area), ~+140 ms for S1's eight planes, est.

## 7. Proofs and checks (all in `/tmp/posters-pt/`)
- **Rule (a), non-breaking:** no existing lib file is touched (`src/lib/patchwork.ts`, `src/lib/texture.tsx` are new and
  imported by nothing shipped; `entry-v2r-film.tsx` never bundles them), so no shipped film can change and the
  Film2R-V2S1 pixel diff is not needed for this lane. `check_banding.py`: the script before the edit (saved) and after,
  on 6 inputs (two of v2's G7 master at three and one time, four PNGs, band and axes flags) without `--texture`: JSON,
  stdout and exit code identical on all 6. (`--plot` crashes in both: matplotlib is not installed here; pre-existing.)
- **Determinism:** the mottle's frame in two processes byte-identical; the patchwork is a pure function of its options
  (seeded lib/rng, no clock, no Math.random): the node harness's numbers reproduce run to run.
- **`npx tsc --noEmit`:** the whole project clean (exit 0, no output) with this lane's files.
- **Renders** (`GL=angle`, one at a time, `pgrep` first): stills, two 2 s masters per run; the masters through
  `render-media.mjs --master`.

## 8. Files
- New: `src/lib/patchwork.ts`, `src/lib/texture.tsx`; `src/look/pt/entry.tsx`, `PatchworkDemo.tsx`, `TextureDemo.tsx`,
  `TextureCal.tsx`, `pw_harness.ts` (ground + far), `pw_harness2.ts` (twoPointCam, groundAt, viaQuad, shown, grid),
  `pw_harness3.ts` (the demo's numbers), `pw_harness4.ts` (the calmer variants); this folder's `ENGINE_PT.md`,
  `engine_patchwork.png`, `engine_texture.png`.
- Changed (additive, default path proven identical): `scripts/qa/check_banding.py` (`--texture`, `--flat`, `--k`,
  `--hold`, `--texture-band`).
- Nothing else (no `package.json`, no `public/`, no shared lib file, nothing in `src/v2r`, `src/v3`, `src/v2`).
