# Libraries for organic, naturally blending painted pieces (survey + tests, 2026-10-30)

**Status: IN PROGRESS** (partial results; the ranked recommendation lands at the end of the run).

The owner (2026-10-30): "5 and 6 and 7 think that's the biggest difference we need to find a way to solve properly. It
feels like a lot of our design is too square and proper like I can see shapes and angles very clearly while references
are obviously not like that. They are more regular more naturally blend Do deep research into techniques libraries etc".
This file is the LIBRARIES part: which open-source code could carry it, tried in isolated installs
(`/tmp/organic/libraries/`), on the same test (the v6 near cumulus and the v6 near tree, from our designed flats).

## Found so far
- **libmypaint** (MyPaint's brush engine, ISC; brushes CC0): compiling the C library in this sandbox was refused
  (building downloaded source), and there is no PyPI/npm build of it. **peinten** (npm, MIT, 2026-10) is a pure
  TypeScript port of libmypaint (BrushEngine.strokeTo, TiledSurface, smudge, the spectral pigment mixer, seeded RNG)
  that runs on the CPU in Node: tested through it, with the CC0 `mypaint-brushes` 2.0.2 presets.
- **p5.brush** (MIT) 2.2.3 has a standalone WebGL2 build (no p5, so no LGPL): tested in headless Chrome.
- **skia-python** (BSD-3) 144.1, **pyfastnoiselite** (MIT), **opensimplex** (MIT), **perfect-freehand** (MIT): in the
  venv. **canvaskit-wasm** (BSD-3), **spectral.js** (MIT), **simplex-noise** (MIT), **fastnoise-lite** (MIT): in npm.
- **open-watercolor-sim** (Apache-2.0, Taichi): a physically based watercolour engine on PyPI (2026-02).
- Excluded on licence: **Mixbox** (CC BY-NC 4.0); **pykuwahara** is GPL-3.0 (a tool only, never vendored).

## Partial results (01:20)
- The test inputs are made by our own painter's design stage, untouched (`/tmp/organic/libraries/src/make_inputs.py`;
  the re-bake of v6's cloud matches the repo PNG pixel for pixel). One shared stroke plan per subject
  (`src/plan.py`: zones by k-means, a structure-tensor flow, wash / form / accent / blend / edge / dab / leafy strokes).
- **MyPaint engine (peinten port)**: runs in Node on the CPU, 0.5-1.3 s per piece, byte-identical on a re-run. The
  strongest painted look so far: real dab brushes with smudge melt the zones into each other and break the circles.
- **Skia (CanvasKit) + SkSL + perfect-freehand**: 1-2 s per piece, byte-identical; an SkSL domain warp + an SkSL
  lost-and-found edge shader + tapered dry-brush strokes. Gotcha: CanvasKit's raster snapshot is UNPREMUL, so linear
  sampling or blurring it gives dark fringes: re-wrap snapshots as premul images first.
- **FastNoiseLite organic pass on v6**: 0.2-0.3 s, byte-identical; the cheapest change.
- **p5.brush**: transparent watercolour/marker model (darkened stroke rims, washes cannot cover a darker ground);
  40-100 s per piece in SwiftShader (CPU WebGL).
- **open-watercolor-sim** (Taichi CPU, deterministic, 1-4 s): white-paper watercolour with coffee-ring edge lines and
  drips: the wrong medium for opaque dusk clouds.
- **OpenCV / scikit-image / Kuwahara**: filters keep the silhouette; they simplify (oil painting, Kuwahara, SLIC
  facets) but never make a shape organic; `cv2.stylization` adds dark edge lines.
- **Spectral.js (Kubelka-Munk)**: greys our complementary dusk mixes (peach x lilac -> #CABBB6 beige-grey): keep OKLab.
