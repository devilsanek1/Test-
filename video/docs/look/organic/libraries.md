# ORGANIC libraries: which open-source code can carry the painted, naturally blending look (survey + tests, 2026-10-30)

**The ask** (owner, 2026-10-30, on the list of differences between our latest still and the references): "5 and 6 and 7
think that’s the biggest difference we need to find a way to solve properly. It feels like a lot of our design is too
square and proper like I can see shapes and angles very clearly while references are obviously not like that. They are
more regular more naturally blend Do deep research into techniques libraries etc" (5 = brushwork with intent, 6 =
shape variety and rhythm, 7 = lost-and-found edges); and on 4: "even in the references the close objects are more
sharp while further objects are more like brushes and painting".

**What this is.** The LIBRARIES lane of the organic research. Every candidate was installed in an isolated scratch
(`/tmp/organic/libraries/`: a venv, an npm folder, the local headless Chrome) and tried. The five that could carry the
look painted the SAME test: the v6 near cumulus (520 x 345) and the v6 near tree (420 x 300), taken from OUR designed
flats (paint.py's own design stage, untouched). Each result sits beside v6 and a reference crop, at full size and at
phone width, and in the whole still. The techniques lane (`techniques.md`, this folder) says WHAT to do. This file
says WHICH CODE does it, at what cost and under which licence. A look doc, ranked under DIRECTION and CRAFT; we learn
methods from the references and never copy or trace one.

| File | What |
|---|---|
| `libraries_sheet.png` | THE comparison. Columns: reference crop, v6, MyPaint, MyPaint + FastNoiseLite, Skia, FastNoiseLite on v6, p5.brush, OpenCV. Rows: cloud 1:1, cloud at phone width, tree 1:1, tree at phone width, the whole still at 400 px with that column's two pieces swapped in. The numbers under each tile are explained in §3 |
| `libraries_sheet_extra.png` | Everything else that was tried (open-watercolor-sim, p5.brush fills alone, cv2.stylization, Kuwahara, SLIC, a MyPaint smudge-only pass), the 52 MyPaint CC0 brushes painted through the engine, and Spectral.js against our OKLab mix |
| `libraries_metrics.json` | The §3 numbers per tile |
| `libraries_code/` | The proof harness, as run. To be moved into `scripts/look/paint/` when adopted. Its paths point at the scratch: rebuild it with §7 |

## 0. The answer: ranked recommendation

1. **MyPaint's brush engine as the BRUSH under our painter.** Use it through `peinten`, a pure-TypeScript port of
   libmypaint (MIT, port of ISC code), with the CC0 `mypaint-brushes` 2.0.2 presets. Our painter keeps the design, the
   light and the plan (where each mark goes and why), and MyPaint lays the marks. It was the only tested code whose
   marks melt one zone into the next: smudge and wet brushes pick up the colour under them and drag it. Its flat
   brushes leave deliberate blocky strokes with dry tails, its soft brushes leave lost edges, and the circles break.
   This answers points 5 and 7 directly, and point 4 by brush per plane: crisp flat brushes near, wet and smudging
   brushes far. Costs: 0.5-1.3 s per piece on one core in Node; byte-identical on a re-run (md5); licence-clean. The
   risk is that peinten is 10 days old with one maintainer. So pin `peinten@1.3.0` and vendor its `domain/brush` and
   `domain/tiles` folders (18 JS files, keeping its NOTICE; the only outside import is `valibot`, in `myb.js`). The C
   libmypaint 1.6.1 (ISC) is the reference implementation: it reads the same `.myb` brushes and can replace the port
   wherever compiling is allowed. Compiling it was refused in this sandbox, and it has no PyPI or npm build. Rust
   `hokusai` (MIT OR Apache-2.0, WASM bindings, 0.3.0) is the one to watch.
2. **FastNoiseLite** (MIT; `pyfastnoiselite` in Python, `fastnoise-lite` on npm, plus GLSL, HLSL and C ports of the
   same noise). Seeded OpenSimplex2 fbm, for two jobs:
   - a domain warp of the DESIGN before it is painted, so silhouettes and zone edges stop being circles and arcs;
   - the noise that breaks lost and found edges into a rhythm along an edge.

   It costs 0.2-0.3 s per piece and is byte-identical. Because the same noise runs in Python (the bake) and in JS or
   GLSL (a live churn), the two agree. Stacked with 1, it is the sheet's fourth column, "the recommended stack": arcs
   down from 49 to 27 % (§3).
3. **perfect-freehand** (MIT, npm; a Python port exists, also MIT). It turns a polyline with pressure into a
   variable-width, tapered stroke outline: a hand-made stroke shape as a vector path (SVG `d`). Use it for organic
   strokes in the vector engine (`lib/organic.ts` in techniques §5.1), and as stroke geometry for any rasterizer.
   Proven in the Skia test.
4. **Live per-frame effects only, if a shot needs one** (a cloud's slow churn, a breathing edge):
   - **regl** (MIT) or **three.js** (MIT, `@remotion/three`) running GLSL;
   - or **Skia through `@remotion/skia`** (CanvasKit, BSD-3) running SkSL.

   Measured on the same headless Chrome, CPU-emulated WebGL (SwiftShader), a full 1080 x 1920 frame with a 4-octave
   fbm warp on the cloud box costs 66 ms per frame in regl and 71 ms in CanvasKit-on-WebGL. CanvasKit's CPU raster in
   Node is unusable for full-frame SkSL: 10.6 s per frame. A painted piece stays a bake; nothing else needs to run
   per frame (techniques §4 agrees).
5. **OpenCV and scikit-image** (Apache-2.0, BSD-3) stay what they are: helpers for remap, inpaint, distance
   transforms and k-means. As stylizers they keep the silhouette, so they cannot make a shape organic. The one possible
   job: a far-tier simplifier. `xphoto.oilPainting` and Kuwahara merge the tree's leaf confetti into bigger blobs, and
   SLIC facets give the "low poly" far world. That is a look-test question.

**Ruled out:**

| Library | Licence | Why |
|---|---|---|
| p5.brush | MIT | Its model is transparent watercolour and marker: each stroke gets a darker rim, layered marks darken, and a light wash cannot cover a darker ground. 53-90 s per piece on CPU WebGL |
| Spectral.js | MIT | Kubelka-Munk mixing greys our complementary dusk pairs (peach x lilac -> #CABBB6, beige-grey: "never sickly"). Keep OKLab |
| open-watercolor-sim | Apache-2.0, Taichi | White-paper watercolour: edge darkening draws outlines, and gravity drips |
| `cv2.stylization` | Apache-2.0 | Draws dark edge lines |
| Kuwahara / oil filters | | The filter look |
| Neural stroke painters (PaintTransformer, LearningToPaint, Stylized Neural Painting, neural-painters) | Apache-2.0 / MIT / CC0 code / MIT | Not run: the weights sit on Google Drive and need PyTorch on the CPU. They approximate an image with strokes, without our light-aware intent |
| Mixbox | CC BY-NC 4.0 | Non-commercial |
| mypaint-rs, PyPainterly, pykuwahara | GPL-3.0 | A tool at most, never vendored |

**What no library fixes:** the design itself, billows as circles in a row (techniques §3.9, rank 1). The noise warp
only roughens a template. **At phone width the gains shrink:** at 400 px the brushwork in columns 3-5 is visible on
the cloud and faint on the tree. Marks that must read on a phone have to be bolder and fewer, and that is a dose for
the painter (techniques §5.4), not a library choice.

## 1. The test (the same for every library)

- **Inputs:** `libraries_code/make_inputs.py` imports `scripts/look/paint/paint.py` read-only, with bytecode off, and
  writes only to the scratch.
  - **The cloud:** `style_cloud_planes` on the near plane (p3, box 560,0 -> 1080,345), once with `--design` semantics
    and once painted. The re-bake equals the repo's `public/paint/v2s1_v6/clouds_p3.png` pixel for pixel. The sky
    behind is the v6 sky piece.
  - **The tree:** `foliage.paint_tree(stop='zones')` with v6's seed, box, crown and -5 L* near step. The flat value
    zones over the wood.
- **One stroke plan per subject** (`plan.py`), read from the design and never from a reference:
  - 5 value zones by k-means in OKLab (the tree's foliage only; its trunk stays the design's);
  - a structure-tensor tangent flow;
  - strokes by pass: **wash** (P1, 18 broad soft strokes on the cloud); **form** (P2, along the flow; about 120 on the
    cloud, most where the form turns, and calm masses kept calm: dark zones get 0.35x the marks; near a zone edge, a
    mark carries the neighbour's value across it at 50 %); **accent** (P3, crisp, at the lit silhouette, a step
    lighter); **blend** (short strokes across a zone edge that turns from the light); **edge** (along the silhouette:
    found facing the light, lost away from it); on the tree, **dab** (813 leaf marks, a value step lighter than their
    zone, the top zone taking the palette's lit leaf) and **leafy** (206 marks across the foliage outline);
  - the light from the scene's key: the cloud lit from the low sun at the left, the tree from the upper left (rig
    key).
- **The renderers:**
  - MyPaint (`mypaint_render.mjs`): peinten's `BrushEngine` + `TiledSurface` over our design as the base tiles, one
    seed per stroke, brush per pass (§4).
  - Skia (`skia_paint.mjs`): CanvasKit in Node.
  - p5.brush (`web/p5b_p5.html`): on p5 2.x in headless Chrome. The standalone WebGL2 build was tried first, but it
    cannot draw an image underlay.
  - FastNoiseLite (`noise_organic.py`).
  - OpenCV (`opencv_filters.py`).
- **The sheet** (`sheet.py`): 1:1 = the piece's pixels in the 1080 x 1920 frame. Phone width = x 400/1080 (the
  owner's landscape screenshots fill the same phone width: x 400/1206). In context = the whole v6 still at 400 px:
  v6's cloud replaced by its own sky (exact: 0 px differ), v6's tree inpainted out (Telea) and the planter wall re-laid
  over the trunk's foot.

## 2. Each library: what it did, licence, maintenance, speed, determinism, effort

Speed was measured on this sandbox (4 shared cores, no GPU). Determinism means byte-identical output on a re-run
(md5), unless the row says otherwise.

| Library | Version tried | Licence | Maintenance | Speed per piece | Deterministic | Integration effort | Verdict |
|---|---|---|---|---|---|---|---|
| **libmypaint** (C, the reference) | 1.6.1 (2020) | ISC; brushes CC0 | slow but alive (388 stars, MyPaint project) | - (compiling refused here) | yes (its RNG is seeded per brush) | medium where it can be built (C + ctypes, or GObject) | the reference; not runnable here |
| **peinten** (TS port of libmypaint) | 1.3.0 (8 releases 2026-10-20 to 10-26) | MIT, NOTICE with libmypaint's ISC | brand new, 1 maintainer, 0 stars | 0.5-1.3 s (Node, 1 core; tree 1,274 strokes 0.7 s) | **yes** (md5) | **small**: a ~150-line Node bake fed by a strokes JSON (`mypaint_render.mjs`) | **rank 1**: pin and vendor |
| mypaint-brushes | 2.0.2 | CC0 (raw brush settings) | stable | - | - | data files, parsed by peinten's `parseMyb` | the 52 presets in `libraries_sheet_extra.png` |
| **FastNoiseLite** | pyfastnoiselite 0.0.7 (2025-12); npm fastnoise-lite 1.1.1 | MIT | very active upstream (3.5k stars) | 0.2-0.3 s for warp + lost/found | **yes** (md5) | **trivial** (pip / npm; GLSL port for live) | **rank 2** |
| opensimplex (py), simplex-noise (npm) | 0.4.5.1; 4.0.3 | MIT | stable | - | yes | trivial | alternatives to FastNoiseLite, no built-in warp |
| **perfect-freehand** | npm 1.2.3 (2026-02); py 1.2.0 | MIT | active (5.8k stars) | ms | yes | trivial | **rank 3** (stroke shapes) |
| **Skia / CanvasKit** (`canvaskit-wasm`) | 0.42.0 (2026-08) | BSD-3 | Google, very active | Node raster: 1.0-1.9 s per piece; full-frame SkSL 10.6 s/frame; WebGL in Chrome 71 ms/frame | **yes** (md5, Node raster) | medium (`@remotion/skia` adds the CanvasKit wasm to the bundle) | **rank 4**, live effects only |
| skia-python | 144.1 (2026-10) | BSD-3 | active | - | - | needs the system `libEGL.so.1` (missing here, not installed) | use CanvasKit instead |
| **regl** / three.js | 2.1.1 / 0.186.1 | MIT / MIT | regl slow, three very active | 66 ms/frame full-frame warp (SwiftShader) | same renderer: yes | medium (a WebGL canvas layer; `@remotion/three` exists) | **rank 4** (live) |
| **p5.brush** | 2.2.3 (3.0.0 is 2 days old) | MIT (its p5 build needs p5 2.x, LGPL-2.1) | very active (1.2k stars) | 53-90 s per piece (CPU WebGL) | seeded (its own PRNG) | high (a headless Chrome bake) | ruled out: transparent marker look |
| **OpenCV** (+ contrib) | 5.0.0.93 | Apache-2.0 | very active | 0.02-0.12 s | yes | trivial (already a dependency) | helper; far-tier simplifier at most |
| scikit-image | 0.26.0 | BSD-3 | active | 0.3-0.5 s (SLIC) | yes | trivial | helper |
| pykuwahara | 0.5.0 | GPL-3.0-or-later | active | 0.03 s | yes | - | tool only; techniques has a 40-line Kuwahara |
| open-watercolor-sim | 0.1.1 (2026-02), Taichi 1.7.4 | Apache-2.0 | early, 1 author | 3.5-4 s at 512^2 | yes (Taichi CPU, same process) | medium | ruled out: outlines and drips |
| Spectral.js | 3.0.0 | MIT | active (1.3k stars) | ms | yes | trivial (JS + GLSL) | ruled out: greys our dusk mixes |
| Mixbox | 2.0.0 | **CC BY-NC 4.0** | - | - | - | - | **never** (non-commercial) |
| hokusai (Rust + wasm-bindgen) | 0.3.0 (2026-06) | MIT OR Apache-2.0 | young, from the reearth organisation | not run (needs cargo) | claims .myb compatibility | medium | watch: a 2nd MyPaint-compatible engine |
| mypaint-rs | - | GPL-3.0 | 9 days old | not run | claims bit-identical to libmypaint | - | no (GPL) |
| PaintTransformer / LearningToPaint / Stylized Neural Painting / neural-painters | - | Apache-2.0 / MIT / CC0 code / MIT | research code | not run | - | high (PyTorch, weights on Drive) | no: strokes without intent |
| watercolor-playground, aquarelle, THREE.Watercolor, KinoAqua | - | MIT / MIT / MIT / public domain | various | not run | - | - | the same watercolour model as p5.brush and the sim |

**Notes, library by library:**
- **MyPaint through peinten.** The port exposes exactly what our bake needs:
  - `new BrushEngine(compiledBrush, mixer, seed).strokeTo(surface, x, y, pressure, xtilt, ytilt, dtime, zoom, rot,
    barrel)`;
  - `TiledSurface` over 64 px fix15 premultiplied tiles, which we fill from our own PNG, so smudge brushes pick up
    OUR design;
  - `parseMyb` for any CC0 `.myb`;
  - the libmypaint 2 spectral pigment mixer (`paint_mode` defaults to 1).

  On our palette the pigment and non-pigment renders had the same chroma (mean C 0.0638 against 0.0637), so it does
  not grey our dusk. Two gotchas:
  - A size override sets the BASE radius, and a brush's pressure curve adds to it in log space. Divide the width by
    e^curve(p_max), or a full-pressure dab comes out 2-3x too wide (`sizeFor` in `mypaint_render.mjs`).
  - Brushes with offsets and jitter scatter dabs (`classic/impressionism`, `Dieterle/WateryFlatbrush`): pick brushes
    from the catalogue.
- **The MyPaint smudge-only pass on v6** (no new paint, only blending-knife and smudge strokes over our own painting;
  the extra sheet) is almost invisible. The engine's value is in laying the marks, not in post-processing ours.
- **Skia / CanvasKit gotchas:**
  - A raster surface's snapshot is UNPREMULTIPLIED. Sampling it with a linear filter, or blurring it, lerps straight
    colour toward transparent black, which gives a dark fringe on every soft edge. Re-wrap every snapshot as a premul
    image (`premulImage()`), or interpolate in SkSL from Nearest samples.
  - There is no `PathEffect.MakeCompose` in CanvasKit, so discrete jitter and corner rounding cannot be chained.
  - The SkSL domain warp and the SkSL lost-and-found shader (crisp where the edge faces the light, blurred where it
    turns away, alternating by noise) are both in `skia_paint.mjs`, ready to port to a `@remotion/skia`
    `RuntimeEffect`.
  - A blurred lost edge reads as a DROP SHADOW on foliage; leaves break instead (techniques §3.6).
- **p5.brush:** the standalone build (MIT, WebGL2, no p5) draws with its centre as the origin (translate by -W/2,
  -H/2). It has no image underlay, and its transparent ground composites its washes to white. On an opaque ground the
  marks get the medium's darker rim. Its watercolour fill (deformed, layered translucent polygons with bleed) is the
  one transferable idea, and techniques §3.5 ranks it as an accent for vapour only.
- **open-watercolor-sim:** the sim works on a square grid indexed (x, y). Pigment is deposited from masks
  (`paint_mask`) and composited on white paper by optical density: a medium for paper, not for our opaque gouache
  dusk.

## 3. Three numbers per tile (`metrics.py`; descriptive, the owner's eye decides)

- **arcs**: the share of the silhouette lying on a near-perfect circle arc (a local circle fit over 31 px with an RMS
  residual under 0.35 px). It measures "I can see shapes and angles very clearly". Lower is less geometric.
- **edges crisp / soft / lost**: the silhouette's 10-90 % alpha width along its normal: <= 2 px, 2-8 px, > 8 px.
- **seams**: the share of the mass carrying a step of more than 5 L* across 2 px. It counts zone seams AND brush-mark
  edges, so brushwork raises it.

| Tile | Cloud arcs | Cloud edges crisp/soft/lost % | Cloud seams % | Tree arcs | Tree edges % | Tree seams % |
|---|---|---|---|---|---|---|
| our design flat | 55.5 | 90 / 10 / 0 | 4.7 | 23.6 | 90 / 10 / 0 | 3.8 |
| v6 | 35.6 | 42 / 12 / 46 | 0.4 | 4.1 | 70 / 30 / 0 | 37.9 |
| MyPaint | 49.3 | 41 / 31 / 28 | 8.8 | 4.8 | 75 / 25 / 0 | 24.3 |
| **MyPaint + FastNoiseLite** | **27.0** | 13 / 50 / 37 | 8.1 | **1.3** | 71 / 29 / 0 | 25.1 |
| Skia + SkSL + perfect-freehand | 16.2 | 15 / 36 / 49 | 4.3 | 6.1 | 38 / 55 / 7 | 14.7 |
| FastNoiseLite on v6 | 6.5 | 12 / 39 / 49 | 0.3 | 0.2 | 41 / 57 / 2 | 38.2 |
| p5.brush | 20.2 | 54 / 41 / 6 | 25.2 | 2.9 | 82 / 17 / 1 | 46.6 |
| OpenCV oilPainting on v6 | 35.6 | 42 / 12 / 46 | 3.6 | 4.1 | 70 / 30 / 0 | 15.8 |

**Reading:**
- MyPaint alone keeps the design's arcs (49 %): its marks stay inside the silhouette, because the found edges follow
  the design. The silhouette has to be warped first (FastNoiseLite: 27 %) or carved by edge strokes (techniques §5.2).
- v6's tree already breaks its outline (4 % arcs: the leafy edge works). Its 38 % seams are the crisp leaf confetti.
  The MyPaint and Skia trees hold 15-25 % because their marks overlap and melt.
- p5.brush's seams (25-47 %) are its outlined marks.

## 4. The brushes that worked (MyPaint CC0 presets, by pass)

| Pass | Cloud | Tree | Why |
|---|---|---|---|
| P1 wash | `ramon/wet_round` | `ramon/wet_round` | a soft wet round with a dry end |
| P2 form, edge (found) | `tanda/acrylic-04-paint` | `tanda/acrylic-04-paint` | a flat, opaque stroke with a slightly broken outline and a tapered tail: the deliberate blocky stroke of `refs_paint/02` |
| P3 accent | `deevad/brush` | `deevad/brush` | thin, tapered, crisp |
| blend (lost zone edge) | `classic/blending_knife` | `classic/blending_knife` | drags one value into the next |
| edge (lost) | `deevad/large_watercolor_fringe`, then `classic/smudge` dragged out | `deevad/chalk` | a feathered fringe, then the colour pulled into transparency |
| dab, leafy | - | `tanda/acrylic-04-paint`, short | crisp near marks (owner's point 4); `kaerhon_v1/paint_sm` was too soft and furry for a near tree |

These are tool presets (file names inside the CC0 set), never style targets.

## 5. How it would enter the engine (PROPOSAL; the painter build decides)

1. **paint.py stays the planner.** It keeps the design (organic geometry by design, techniques §3.9), the one light
   table, the zones, the depth ladder, the seeds (`rng_for`) and the techniques' doses (§5.4). It warps the design per
   plane with `pyfastnoiselite` (amplitude by plane and material; never on hand-cut man-made edges), then writes each
   piece's marks as a strokes JSON instead of rasterizing its own stamps: `{brush, pts:[x, y, pressure], color, width,
   opacity, seed}`, the format of `mypaint_render.mjs`.
2. **A Node bake paints the strokes with MyPaint brushes** over the piece's flat base tiles. Cost: about 1 s per
   piece. Then paint.py's lost-and-found pass (FastNoiseLite noise, by the light) and its plane blur run, and it
   writes the RGBA PNG and manifest row exactly as now. `<PaintedLayer>`, `reveal.tsx` and the float are unchanged.
3. **Pin it.** `peinten@1.3.0` exact, or a vendored copy of its `dist/domain/brush` + `dist/domain/tiles` (MIT;
   keep the NOTICE; `myb.js` needs `valibot`, MIT, or a 20-line JSON reader in its place). The brushes are a vendored
   subset of the CC0 `.myb` files. Re-check byte-identity in CI (two bakes, one md5).
4. **Live, only on request:** a cloud churn as a `@remotion/skia` RuntimeEffect, or a regl/three layer, sampling the
   baked PNG. It must interpolate premultiplied (§2's gotcha), its noise is FastNoiseLite's GLSL port seeded per
   piece, and it costs about 70 ms per frame on CPU WebGL.

## 6. Doc clashes found (flagged for the orchestrator, not edited here)
- `docs/studies/2026-10-28_city_posters/paint_test/NOTES.md` ("Libraries and methods considered") rejects p5.brush
  as "a new runtime and dependency for something numpy and cv2 already do under our control", and a WebGL shader
  stack because "it is a post-filter" that "reads as 'filtered'". Both verdicts stand, now measured (§2). The reason
  given for p5.brush does not hold for a brush ENGINE: smudge and wet pickup (marks that drag the colour under them)
  are what our numpy stamps lack, since they carry their own colour only. The NOTES are history, so no edit is
  proposed; this file supersedes that paragraph.
- None against the playbook, DIRECTION, CRAFT or PAINT_RECIPES: every proposal above keeps PAINTED PIECES' rules (our
  own deterministic pass, locked to its layer, never a filter over the frame, the subject and people crisp).

## 7. Re-run (scratch layout; nothing installs into the repo)

```bash
S=/tmp/organic/libraries; mkdir -p $S/{inputs,plans,out/{mypaint,skia,noise,opencv,p5brush,stack,watercolor,spectral,regl},work,npm,src,web}
cp video/docs/look/organic/libraries_code/*.{py,mjs} $S/src/; cp video/docs/look/organic/libraries_code/web/* $S/web/
python3 -m venv --system-site-packages $S/venv
$S/venv/bin/pip install pyfastnoiselite==0.0.7 opensimplex perfect-freehand opencv-contrib-python-headless pykuwahara taichi==1.7.4 open-watercolor-sim==0.1.1
cd $S/npm && echo '{"private":true}' > package.json && npm install --ignore-scripts p5.brush@2.2.3 perfect-freehand@1.2.3 \
  spectral.js@3.0.0 simplex-noise@4.0.3 fastnoise-lite@1.1.1 canvaskit-wasm@0.42.0 playwright-core@1.64.1 peinten@1.3.0 regl@2.1.1 three@0.186.1
# brushes: mypaint-brushes-2.0.2.tar.xz (GitHub release of mypaint/mypaint-brushes), data only: tar xf into $S/data/mypaint-brushes/
cd $S && venv/bin/python -B src/make_inputs.py && venv/bin/python -B src/plan.py && venv/bin/python -B src/mypaint_paint.py
node src/skia_paint.mjs cloud out/skia/cloud.rgba && node src/skia_paint.mjs tree out/skia/tree.rgba   # then rawio.py from ...
venv/bin/python -B src/noise_organic.py && venv/bin/python -B src/opencv_filters.py && venv/bin/python -B src/stack.py
node src/chrome_run.mjs web/p5b_p5.html out/p5brush/final_cloud.png "name=cloud&mode=full&under=1&op=200&bleed=0.2&pop=150"
node src/chrome_run.mjs web/p5b_p5.html out/p5brush/final_tree.png "name=tree&mode=full&under=1&op=220&bleed=0.08&tex=0.25&border=0.2&pop=200&ptype=default&sharp=0.5&grain=12&dabp=1"
venv/bin/python -B src/sheet.py && venv/bin/python -B src/sheet_extra.py
```
The Chrome is the local `chrome-headless-shell` (`/opt/pw-browsers/...`), with SwiftShader WebGL.
