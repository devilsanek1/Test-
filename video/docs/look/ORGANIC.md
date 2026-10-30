# ORGANIC: why our frames read geometric, and how painter v7 makes them blend like the references (2026-10-30)

The owner (2026-10-30), answering our list of the 10 biggest differences between still v6 and his references, verbatim:
"I mean dark and contrast are great but that’s very doable that’s just color palette and selection? Similarly point 2
[one colour key] / I noticed this too the light source yes - can we do the proper lights? / 4 [one painted language] I
think we need to find a balance I think even in the references the close objects are more sharp while further objects
are more like brushes and painting / 5 and 6 and 7 [brushwork with intent; shape variety and rhythm; lost-and-found
edges] think that’s the biggest difference we need to find a way to solve properly. It feels like a lot of our design is
too square and proper like I can see shapes and angles very clearly while references are obviously not like that. They
are more regular more naturally blend Do deep research into techniques libraries etc / 8 [simplicity and focus] agreed
this is an important point about scene composition / 9 [an overall texture] that seems solvable too?" On v6 itself: "it
is weird looking tree we have on the forefront like it doesn’t fit the style there, while AI generated cloud certainly
fits / Our point 8 I’d also true - our scene is very busy". Then: "Again let’s start with stills".

The list he answered (ours, 2026-10-30): 1 darks and contrast, 2 one colour key, 3 one strong story light, 4 one painted
language, 5 brushwork with intent, 6 shape variety and rhythm, 7 lost and found edges, 8 simplicity and focus, 9 an
overall texture, 10 people. The playbook rules they feed: ORGANIC, NOT GEOMETRIC; PROPER LIGHT; SCENE COMPOSITION;
PAINTED PIECES (`docs/OWNER_PLAYBOOK.md`).

**What this is.** The synthesis of the organic-look research (five lanes: techniques, libraries, shapes, light,
composition) and its two engine proofs on v6's scene 1 ("She quit Google.", the King's Cross canal at an October dusk,
1.0 s): each of the owner's points answered with its cost and our confidence (§1), the gap in measured lines (§2), the
techniques and libraries chosen and rejected with their licences (§3), the rules with numbers (§4), the balance by plane
(§5), the roadmap for painter v7 on scene 1 (§6), what is still unknown (§7), and the doc clashes found (§8).

**Rank.** A look doc on DIRECTION's ladder: the owner's words, DIRECTION and CRAFT win over it. Its topic is how a frame
stops reading geometric: shapes and edges, the paint's dose by plane, the light's method, the composition numbers, the
paper. `PAINT_RECIPES.md` keeps each painted element's recipe, `LAYOUT.md` where things sit, `PALETTE.md` the palettes.
Where a higher doc predates the owner's 2026-10-30 words and disagrees with them, §8 flags it for the orchestrator (a
clash is a bug); until it is integrated, CRAFT's numbers stand in production, and v7 (an iteration, stills only) is where
this doc's numbers are tried and the owner's eye decides. The research reports below are notes under this doc. We learn
methods: every reference is only measured, never copied, traced or used as an input to a picture of ours, and no living
artist is a style target. Paths are from `video/`.

| File | What |
|---|---|
| `docs/look/organic/index.jpg` | the contact sheet of the run's nine sheets, labelled (1600 px wide) |
| `docs/look/organic/techniques.md` + `techniques_sheet.jpg` | the techniques lane: filters against techniques by intent on v6, edge strokes at two doses, the facade design steps; costs on our renderer, the motion test; 26 sources |
| `docs/look/organic/libraries.md` + `libraries_sheet.png`, `libraries_sheet_extra.png`, `libraries_metrics.json`, `libraries_code/` | the libraries lane: eight columns painting the same cloud and tree; everything else tried; licences, speed, determinism |
| `docs/look/organic/shapes.md` + `shapes_sheet.png`, `shapes_generators.png`, `shapes_gen.py`, `shapes_lib.py`, `shapes_measure.py` | the shapes lane: 54 crops measured, the six shape gaps, the rules with numbers, seeded generators, before / after |
| `docs/look/organic/light.md` + `light_sheet.jpg`, `light_motion.mp4`, `light_demo.py`, `light_proto/` | the light lane: 15 sources, the three homes of light in our engine, scene 1's plan, the relit still, the motion proof, the cost bench |
| `docs/look/organic/composition.md` + `composition_sheet.png`, `composition_study.py`, `composition_metrics.json` | the composition lane: notan studies of v6 and the references, R1-R12, the value thumbnails T1-T3, the `frame` check |
| `docs/look/organic/organic_proof.md` + `organic_proof.png`, `organic_proof_metrics.json` | proof 1: the cloud, the tree, the facade and the paving repainted (MyPaint + FastNoiseLite), placed by the engine. Code: `scripts/look/organic/`, `src/look/organic_s1/` |
| `docs/look/organic/light_proof.md` + `light_proof.png` | proof 2: v6, + proper light, + one paper and one colour key, rendered by the engine. Code: `src/look/light_s1/` (bake in `bake/`), `src/lib/light2/` |

## 0. In one screen

- **"Too square and proper" is measurable.** Against the references at phone width, through the same codec, v6 has 5-70x
  their share of razor-sharp edges (22 % against 0.3-4.6 %), 2-24x their long straight runs (26.5 % against 1-13 %) and
  up to 35 % dead-flat area (against 0-20 %). Under those three numbers sit six shape habits (compass arcs, ruler lines,
  right angles and parallels, one edge quality everywhere, mirror-image templates, no dominant mass) and a frame with
  ten equal calls and no light (§2). The amount of wiggle in our outlines is NOT the gap (2-3 % of the wavelength for
  ours and theirs alike): its kind is. "Add noise" or "add a filter" fixes neither.
- **What closes it, best first:** (1) organic shapes decided at design time; (2) lost-and-found edges, carried by
  flat-brush strokes near and dry-brush teeth far; (3) colour and light moving inside each shape; (4) marks by intent,
  laid by MyPaint's brush engine and coarser on far planes; (5) one paper locked to each plane. Beside them, the three
  levers the owner called doable: one colour key and the darks (palette work), one story light (the lit doorway, with
  the low sun as the key), and one call with big quiet masses (composition). Every stock painterly filter we tried
  (Kuwahara, LIC, generic stroke painters, watercolour edges) reads as a filter on our flat design and is rejected (§3).
- **Proved in the engine on v6** (two proofs, deterministic; her drawing and the captions untouched): the cloud's
  compass arcs 27 -> 1 %, the facade's ruler lines 54 -> 23 %, the paving's 68 -> 15 %; the lit doorway became the one
  place to look (the facade into shade 68 -> 56 L*, the lobby lifted 77 -> 82, its pool 83 -> 93); darks 6.7 -> 33-38 %
  of the frame in two masses; off-family colour 16.3 -> 2.5 %; dead-flat area 39 -> 22.5 % with the paper; the
  composition check 9 WARNs -> 5 (and the recomposed value thumbnail T1 passes all 10). What did not move enough: razor
  edges in the whole frame (22 -> 18.6 %: the untouched layers hold them), the facade's right angles and symmetry, the
  brushwork's visibility at 400 px on the facade and the tree, and the flat props, which now read pasted on the painted
  ground.
- **Cost.** Nothing chosen runs per frame. Bakes: ~26 s for four organic pieces, ~66 s for the light, key and paper
  maps (one core, per state). Render: the light's production path measured 256 ms a frame against v6's ~550, because
  v6's own `lib/light` layers cost ~340 ms and the maps replace them; the organic pieces add 30-70 ms. Video: baked,
  plane-locked marks +6-11 % bitrate in the float; anything re-seeded per frame +112 % and boils (never).
- **v7, in order** (§6): the palette and one colour key -> the story light -> organic shapes and brushwork ->
  composition (its prop cut runs before any near-world painting) -> the paper. Each step is one checkpointed still with
  its check.
- **Not solved yet** (§7): motion (light maps per state, the float's slip), marks that read at phone width, the
  high-key caption sky against the references' low key, the frontal facade's right angles, and people (their own lane).

## 1. The owner's points, each answered

Confidence: **high** = proved in the engine on v6, measured, the same bytes on a rerun; **medium** = proved on pieces
or panels, or open on the dose at phone width or in motion; **low** = researched, not built.

| # | The point (his words) | What it takes | Confidence | Cost |
|---|---|---|---|---|
| 1 | Darks and contrast: "dark and contrast are great but that’s very doable that’s just color palette and selection?" | Yes: palette and light, no new drawing. Shade masses with named casters (the backlit facade, our bank under a canopy off-screen) and the key's deeper darks; R10's real dark mass (§4.4). Proof 2: darks (L* < 40) 6.7 -> 33-38 % of the frame, 94-97 % of the dark group in two masses; median L* 67 -> 61-62; the caption band unchanged (0 codes) | **High** for the still; the dose (T1's gentle key or T3's, the references' own) is the owner's pick, and CRAFT §f.8 disagrees (§8 C8) | 0 ms in the palette; the shade is part of point 3's maps |
| 2 | One colour key: "Similarly point 2" | Palette work, at the source: ONE family (the sky's dusk family: violet shade, rose-plum, rose, peach, cream-gold light), ONE hot accent (the doorway's gold), every other colour tone-on-tone in its mass (§4.3). Proof 2: off-family colour below the band 16.3 -> 2.5 %; the 1 % most saturated warm light at the door 24 -> 100 %; colour rivals 4 -> 1 | **High** for the method. The proof's per-pixel function greyed the glass (C* 11 -> 4) and the lanterns (6 -> 2) and turned the tree olive: v7 keeps C* >= 8 and one green family | 0 ms (palette roles) |
| 3 | One story light: "I noticed this too the light source yes - can we do the proper lights?" | Yes, in three homes (§4.2): the colours (what is simply lit or shaded), baked maps per plane (one multiply + one solved screen map, cropped, per state), live layers on movers (rim, wrap, shade, shadow cut, from the mover's own drawing). Proof 2: the doorway is the one place to look, with its pool (83 -> 93 L*), her shadows cut out of it live, her rim and wrap; in `light.md`'s relit still the brightest 5 % below the sky sits within 0.07 H of her (far planes out). Motion proof: the static light holds (0.02-0.05 L* drift), her light falls smoothly 7.3 -> 3.5 L*, nothing flickers (p99 0.3 L*) | **High** for the still; **medium** for a film: maps are one state of the scene (by 1.10 s the shut glass took a green cast), and solved maps slip up to p99 2.8 L* as planes float | As built +170-270 ms a frame; the production path measured 256 ms against v6's ~550 (-290 ms) |
| 4 | One painted language, near sharper: "I think we need to find a balance ... close objects are more sharp while further objects are more like brushes and painting" | One language for the whole frame at a dose by plane (§5): found edges, fine marks and detail near and at the focal; lost edges, fewer values and coarser, visible marks far; the subject and people crisp. Proof 1: the cloud (the farthest piece) got the most brush, the facade kept the door, the fascia and W found, the paving's marks grow with perspective. It also showed the next step: once the ground is painted, the flat props read pasted, so whatever stays in the frame joins the language at its plane's dose, or goes (R6) | **Medium**: the dose table is first doses; the far city, the water's edges and the props are not yet in the language | Bakes only (0 ms a frame); +30-70 ms for two new full-size images |
| 5 | Brushwork with intent: "5 and 6 and 7 think that’s the biggest difference we need to find a way to solve properly" | Our painter plans every mark (where the form turns, along the light edge, across a lost edge, where weather runs) and MyPaint's brush engine lays it, brush by pass (§3.2): a wet wash, flat blocky strokes along the form, a blending knife across lost zone edges, crisp accents at the light edge, strokes over lost edges; far planes stop after the coarse passes. Proof 1: 201-989 marks per piece, MyPaint 0.5-2.4 s per piece, the same bytes twice | **Medium**: the engine is right (the only code whose marks melt one zone into the next); at 400 px the marks read on the cloud and the paving, faintly on the facade and the tree, so v7's marks are fewer and bolder | 0 ms a frame; +6-11 % bitrate in the float |
| 6 | Shape variety and rhythm: "too square and proper like I can see shapes and angles very clearly" | Design-time geometry (§4.1): natural shapes from ellipses on size ladders, displaced by value noise at the short octaves; man-made shapes straight but hand-cut, broken by overlaps and lost stretches, never a template; one dominant mass per element. Generators: cumulus arcs 48 -> 7 %, streak ruler lines 95 -> 0 %, facade ruler lines 26 -> 6 %. Proof 1: straight runs in the whole still 26.5 -> 16.2 % | **High** for natural shapes; **medium** for buildings: the facade's right angles (40 -> 33 %) and mirror symmetry (0.78 -> 0.72) barely move and the change is subtle at 400 px; they need the design (windows that differ, overlaps, a turned view) | Vector +7-13 ms a frame per 300 outlines; generators 1-70 ms at bake |
| 7 | Lost-and-found edges (same words) | Each edge's hardness from its value step (found >= 14 L*, lost <= 4 L*), the light, the tier and the plane, alternating along an outline; a lost edge is laid over with flat-brush strokes (near) or broken by dry-brush teeth along the brush (far, vapour), never blurred (a blur reads out of focus, and as a drop shadow on foliage). On v6's crops: crisp edges 10.5 -> 2.8 % (near, strokes), 28 -> 9 % (far, teeth); the generated cumulus alternates found and lost along 89 % of its outline (painted clouds 81 %, v6 44 %) | **High** for the method; the whole frame reached only 18.6 % razor edges (proof 1) and 11.2 % with the paper (proof 2's own measure) because her, the props, the boats, the far city and the water's marks were untouched | Strokes 1.1-2.0 s, teeth 0.5 s per full-frame layer at bake; 0 ms a frame |
| 8 | Simplicity and focus: "agreed this is an important point about scene composition" | R1-R12 (§4.4): the notan first, few pieces, ONE call, the focal where the subject, the story light and the hardest step meet, >= 65 % quiet in two connected masses, <= 6 named objects. T1 (the lit door as the only call, our quay in a canopy's shade, v2's view kept) passes all ten checks where v6 fails nine; the light and the key alone take v6 to five WARNs, and what is left is the props | **High** (measured on the references; T1-T3 pass); the painted v7 frame will need the quiet threshold recalibrated (flat thumbnails overstate quiet) | None: it removes things, and the frame renders faster |
| 9 | An overall texture: "that seems solvable too?" | Yes: one paper per film (§4.5), the same material on every plane and on the movers, baked into each plane's maps so it rides the float. Proof 2: dead-flat area 39 -> 22.5 % (the references 0-20 %), +0.4-0.8 L* on the flats, 12 % in the caption band (its spread 1.27 L*) | **Medium**: faint at 400 px (as meant) and visible at 1:1; over CRAFT's 0.25 L* grain cap; its bitrate in the float is not measured yet | 0 ms baked; bitrate is its cost (a plane-locked mottle measured +27 %) |
| 10 | People (no comment from the owner) | Their own lane (`PEOPLE_DESIGN.md`: direction C with the LASH face). What this doc asks of them: they stay crisp and are never painted, carry the paper as a tile locked to them, take their light live from their own drawing (`lib/light2` `RimOf`, `WrapOf`, `ShadeOf`, `ShadowCut`), and their silhouettes are free curves (her crop measured 55 % straight against the references' 6 %) | - | - |

## 2. Why we look geometric, measured

Every picture at the phone's width (1080 px wide), through the same JPEG codec, the phone UI masked (`techniques.md` §1,
`shapes.md` §2, `composition.md` §2-3, `light.md` §3; the references are the owner's painting models `refs_human_scale/`
01-04 and `refs_paint/` 01-02, plus the seven city posters).

1. **Razor edges.** 22.0 % of v6's edges have a 10-90 % width under 1.5 px; the references 0.3-4.6 %, the posters 1.2-4.5 %:
   even the "clean" posters break and soften almost every edge with texture and a hand-made line.
2. **Ruler lines.** 26.5 % of v6's edge pixels lie on straight runs of 60 px or more (the references 1-13 %; only the
   beach's horizon reaches 27 %). Per element: the facade 54 %, the paving 68 %, the low sky's streaks 58 % of their edge
   length, against the painted references' medians of 0-9 %.
3. **Dead-flat fields.** 35.3 % of v6's area away from edges is flat (L* within 0.35 over 31 px); the painted references
   0-20 %. Their quiet areas are quiet in value, never dead: colour moves in them.
4. **Compass drawing.** Our cumulus is 27 % compass arcs (a union of circles, as `lib/clouds.tsx` builds it, measures
   83 %); the references' clouds 10 %. The low sky's streaks are constant-width bars (mirror symmetry 0.81).
5. **Right angles and parallels.** 40-42 % of our building corners are 83-97 degrees (the painted references 21 %, the
   posters 28 %); 93 % of the facade's straight length has a parallel partner (71 %); 62 % of its edges lie within 2
   degrees of horizontal or vertical (34 %): a frontal elevation of identical rectangles.
6. **One edge quality, and nothing melts.** Our cumulus alternates found and lost along 44 % of its outline (the painted
   clouds 81 %); lost mass edges are 1 % on our ground and tree (the references 13 % and 10 %); broken edges 14 % on our
   ground (58 %).
7. **Templates and mirror images.** The median shape is 0.78-0.90 its own mirror image (facade, far city, paving, the
   man) against 0.54-0.56; 24 % of the far city's shapes have a near twin beside them (2 %).
8. **No dominant mass, too much confetti.** The facade's biggest shape holds 4 % of its shape area (the references 13 %);
   the tree is 67 % small shapes by area (the painted trees 34 %).
9. **Not the cause: the amount of wiggle.** Per octave from 6 to 400 px, the outline's displacement is 2-3 % of the
   wavelength for ours and the references alike. Ours sits in corners and in the cusps between constant-curvature
   pieces; theirs runs along free curves. Noise alone does not fix a template.
10. **Busy.** Ten regions pull at >= 50 % of the strongest (three of them rivals) against 1-2 in the painted models; 32
    separate value pieces against 2-7; about 40 named things against 4-6; 61 % quiet, but in two perforated fields
    (sky 29 %, paving 24 %) where the references keep 67-91 % in big connected masses.
11. **No light.** High-key (median L* 67, darks 6.8 %), our bank the same value as the water (55 L*), no glow at the
    sun or the door, rims only on her, and a day rig (a sun at 36 degrees) under a sunset sky whose sun sits at 8.9.
12. **No key.** 16.3 % of the coloured pixels below the band lie outside the dusk family, and the four yellow upper
    windows out-shout the lit door in colour (the colour formula's #1, #3, #4, #5; the door #2).

## 3. Techniques and libraries: chosen, and rejected

**The finding that decides the rest:** a filter run over our flat design reads as a filter, because our design is
already abstract (the abstraction filters were made for photographs: `techniques.md` source 9). What works is decided
per layer, by intent, at the design and in the bake, the way a studio that wanted a painterly world put it: "if you want
a painterly bush, paint the bush" (source 20). So every chosen technique is a vector change in the engine or a bake per
layer: 0 ms at render.

### 3.1 The techniques we use (ranked by impact; rows 1-7 are the organic look, 8-11 the light)
| # | Technique | Answers | Runs in | Cost | Proof |
|---|---|---|---|---|---|
| 1 | **Organic geometry by design**: ellipse unions on size ladders, value-noise outlines, hand-cut man-made edges, no template, overlaps, one dominant mass (§4.1) | 6, 5, 7 | the engine (vector, seeded per object) and the bake's masks (`shapes_gen.py`) | +0.01-0.04 s a frame for 300 outlines (Chrome); 1-70 ms a generator call | `shapes_generators.png`; proof 1's cloud, facade, paving |
| 2 | **Lost-and-found edges by intent**: hardness from the value step, the light, the tier and the plane; lost edges laid over with flat-brush EDGE STROKES (near, mid) or broken by DRY-BRUSH TEETH along the brush (far, vapour) | 7, 4, 6 | a bake per layer | strokes 1.1-2.0 s, teeth 0.5 s per full-frame layer; 0 ms a frame; +6-11 % bitrate in the float | `techniques_sheet.jpg` rows 1-3; proof 1 |
| 3 | **Colour and light moving inside a shape**: a ramp toward the key (+-2.5-3 L*), warm toward the light and cool away (+-0.8-1.0 on OKLab b), a dappled shade from a named caster | 5, 9, 3 | vector gradients (dithered) in the engine; a bake for painted pieces (0.43 s) | ~0 ms a frame | `techniques_sheet.jpg` row 4; proof 1's facade and paving |
| 4 | **Marks by intent through MyPaint**: our painter plans each mark (where, which brush, which colour, why); MyPaint lays it; the brush ladder stops early on far planes, so far reads "more like brushes" | 5, 4 | a bake: `paint.py` plans and writes a strokes JSON, a Node bake paints it (`scripts/look/organic/mypaint_bake.mjs`) | 0.5-2.4 s a piece; 0 ms a frame | `libraries_sheet.png`; proof 1 |
| 5 | **One paper, locked to each plane** (§4.5) | 9 | baked into each plane's maps and painted pieces; a tile locked to each mover | 0 ms baked (a live `lib/texture` `<Mottle>` costs +55-65 ms per layer) | proof 2 |
| 6 | **Watercolour, selected parts only**: wet-on-wet bleed on vapour (a cloud's base, haze into sky), layered deformed polygons (~4 % opacity) for a glow or a mist bank, gaps and overlaps as an accent | 5, 7 | a bake | ~0.1 s | `techniques.md` §3.5 |
| 7 | **A raster warp on a baked natural piece** (FastNoiseLite fBm at 150 / 60 / 24 / 12 px, RMS ~7 px): every billow's arc becomes a free curve, the base only slides level | 6 | a bake | 0.2 s | proof 1's cloud (arcs 27 -> 1 %) |
| 8 | **Light maps per plane**: one multiply map (shade, falloff) and one screen map SOLVED per pixel against the plane's own render (the browser blends sRGB values; a naive map is 2-4x too bright on dark ground), cropped to their box, one set per state | 3, 1 | a bake (`src/look/light_s1/bake/`), drawn by `lib/light2` `LightMaps` in the plane's group | the solved pair +12 ms over the frame without `lib/light`; each full-frame blended image ~40-70 ms | `light_sheet.jpg`; proof 2 (the engine within 0.08-0.10 L* of the bake) |
| 9 | **Rims from the shape's distance field**: a band w thick x max(0, n . l)^p, uneven by construction; on movers the silhouette minus a copy moved away from the light | 3 | baked for static shapes; live vector for movers (`RimOf`) | within the measuring noise | proof 2 |
| 10 | **Bloom at emitters only**: three blurs at ~0.1 / 0.4 / 1.2 x the source's size, cut out of the source | 3 | baked (static sources); a cropped live filter for a changing one | within the noise when cropped | proof 2 |
| 11 | **Shadows and pools by projective construction**: a homography through the light's image point and its foot | 3 | live for movers (`ShadowCut`, 100-300 points a frame), baked for static casters | within the noise | proof 2 |

### 3.2 The libraries we use (every licence fine for a commercial channel)
| Library | Version | Licence | Use | How it enters |
|---|---|---|---|---|
| **MyPaint's brush engine via `peinten`** (a TypeScript port of libmypaint) | 1.3.0 | MIT; its NOTICE carries libmypaint's ISC | the brush under our painter: the only tested code whose marks melt one zone into the next (smudge and wet brushes pick up the colour under them) and break the circles | pin the exact version and vendor its `dist/domain/brush` + `dist/domain/tiles` (18 JS files) with the NOTICE; `valibot` (MIT) or a 20-line reader for `.myb`; two bakes must give one md5 (it is 10 days old with one maintainer). Gotcha: a size override sets the BASE radius, so divide the width by e^curve(p_max) (`sizeFor`) |
| **mypaint-brushes** | 2.0.2 | CC0 1.0 | the presets (file names in the CC0 set: tool presets, never style targets), by pass: `ramon/wet_round` (wash), `tanda/acrylic-04-paint` (the flat blocky stroke along the form; short, for near leaves), `classic/blending_knife` (across a lost zone edge), `deevad/brush` (crisp accent), `tanda/acrylic-03-with-water` (dry level stroke), `deevad/large_watercolor_fringe` then `classic/smudge` (a vapour's lost edge), `deevad/chalk` (a tree's lost edge) | a vendored subset (data); brushes with offsets and jitter scatter dabs (`classic/impressionism`, `Dieterle/WateryFlatbrush`): not used |
| **libmypaint** (C, the reference) | 1.6.1 | ISC | reads the same `.myb` brushes | replaces the port wherever compiling is allowed (refused in this sandbox) |
| **FastNoiseLite** | `pyfastnoiselite` 0.0.7; npm `fastnoise-lite` 1.1.1 (+ a GLSL port) | MIT | the design warp, the lost-and-found rhythm along an edge, terminators, mottle; the same noise in the bake and in a live churn | pip / npm, pinned; 0.2-0.3 s a piece, byte-identical |
| **perfect-freehand** | npm 1.2.3 (a Python port 1.2.0) | MIT | variable-width, tapered stroke outlines as SVG paths (a hand-made stroke in the vector engine) | when `lib/organic` is built (§6 step 3) |
| numpy, SciPy, scikit-image | installed | BSD-3-Clause | every bake operator, the measures | already used |
| OpenCV | 5.0.0 | Apache-2.0 | remaps, exact distance transforms (rims), homography warps, inpainting | already used |
| Pillow | installed | MIT-CMU (HPND) | image I/O, sheets | already used |
| polygon-clipping / d3-contour | 0.15.7 / 4.0.2 | MIT / ISC | optional: a union's outline in the engine | when needed |
| Skia CanvasKit (`@remotion/skia`), or regl / three.js | 0.42.0; 2.1.1 / 0.186.1 | BSD-3-Clause; MIT / MIT | ONLY a live effect a shot needs (a cloud's slow churn): 66-71 ms a frame on our CPU WebGL; must sample premultiplied (a CanvasKit snapshot is unpremultiplied: dark fringes) | on request |
| Watch: `hokusai` (Rust + WASM) | 0.3.0 | MIT OR Apache-2.0 | a second MyPaint-compatible engine | not run (needs cargo) |

### 3.3 Rejected, and why
| What | Licence | Why |
|---|---|---|
| Anisotropic or generalized Kuwahara (and `pykuwahara`) | ours / GPL-3.0 | softens everything, deletes small detail (the flock, posts, panes), adds no brushwork to flat fills; WebGL on our renderer 15-17 s a frame. Its one use: unify a plate that is not ours (an AI plate, a photo) at bake time |
| Generic Hertzmann strokes as a filter | - | round dabs everywhere: an "oil paint filter" that erases the pale far city; kept only as our mark maker, by intent (#4) |
| A flow-aligned (LIC) texture over everything | - | the "even streaky texture" the playbook bans; +108 % bitrate in the float |
| Watercolour edge darkening; `open-watercolor-sim` 0.1.1 | Apache-2.0 | draws an outline on every region; white-paper washes and gravity drips |
| `p5.brush` 2.2.3 | MIT (its p5 2.x build LGPL-2.1) | a transparent marker model: darker rims on every mark, a light wash cannot cover a darker ground; 53-90 s a piece on CPU WebGL |
| Spectral.js 3.0.0 (Kubelka-Munk mixing) | MIT | greys our complementary dusk pairs (peach x lilac -> #CABBB6, beige-grey: "never sickly"); we mix in OKLab |
| `cv2.stylization`, edge-preserving and bilateral filters, mean shift, XDoG | Apache-2.0 | dark contour lines (outlines are off-brand), or flatter fills: more vector, not less |
| Neural stroke painters (PaintTransformer, LearningToPaint, Stylized Neural Painting, neural-painters) | Apache-2.0 / MIT / CC0 code / MIT | they paint FROM an image with no light-aware intent (the filter problem again); PyTorch and weights on a CPU; not run |
| A live displacement or WebGL pass for edges or texture | - | reads as a wobble, resamples the layer every frame, +40-100 ms per layer; only for a mover (a churn) |
| A texture fixed to the screen or re-seeded each frame | - | the "shower door" and boil: +112 % bitrate, visibly boils |
| A MyPaint smudge-only pass over our finished painting | MIT / CC0 | almost invisible: the engine's value is in laying the marks |
| `pixi-filters`, pmndrs `postprocessing` | MIT / Zlib | a second renderer on CPU WebGL, where our baked maps cost ~12 ms |
| A blurred lost edge on foliage | - | reads as a drop shadow; leaves break the edge instead |
| **Mixbox** | CC BY-NC 4.0 | non-commercial: never |
| **LYGIA** | Prosperity + Patron | non-commercial unless a paying patron: never |
| Shadertoy code | CC BY-NC-SA 3.0 by default | never copied |
| `mypaint-rs`, PyPainterly | GPL-3.0 | never vendored (a tool at most) |
| `skia-python` 144.1 | BSD-3-Clause | needs a system `libEGL`; CanvasKit does the same in Node |

## 4. The rules, with numbers

Lengths in px of the 1080 x 1920 frame; R = a shape's equivalent radius (sqrt(area / pi)). Every number is a first value
for the v7 look test, measured on the references (the painted models first); the checks WARN, the owner's eye at phone
size decides. Sources: `shapes.md` §3 and §6, `techniques.md` §3.6 and §6, `light.md` §2 and §4-5, `composition.md`
§4, `light_proof.md` §3.

### 4.1 Shapes and edges (points 5, 6, 7)

**Natural shapes** (clouds, foliage, rocks, cast shadows, water edges) are free curves, never compass arcs:
- **Ellipses on a size ladder, never circles.** Each billow, lobe or clump is an ellipse (aspect 0.6-0.98, tilted +-12-20
  degrees) sunk 35-75 % of its radius into its parent; each level 0.28-0.55 of its parent's radius; three levels near
  (lobe, clump, small clump), two on +2, one on +3 and beyond. Each next size 0.55-0.85 of the last; two neighbours
  never within 10 %.
- **Overlap or gap, never kiss:** an overlap of 18-40 % of the smaller radius, or a gap >= 12 %.
- **The outline displaced by value noise** (never sines: they repeat) along its normal, at the SHORT octaves (the
  ellipses make the long ones): clouds 0.4 R / 0.2 R / 0.1 R at 2.2 / 1.3 / 0.7 % of R RMS (floors 1.0 / 0.8 / 0.6 px);
  foliage 0.25 R / 0.1 R at 2.5 / 1.2 % of R (floors 1.0 / 0.7 px); a shape grown from a simple base (a rock, a cast
  shadow, a water edge) takes the whole row of `shapes_gen.spectrum_for(R, element)`. The 0.1 R octave is the one that
  matters: without it 11-20 % of a cumulus stays compass arcs, with it 0-7 % (six unpicked seeds). Undersides (a
  cloud's base, a crown's belly) take 20-40 % of the amplitude.
- **Clouds:** a flat base tilted <= 1.5 degrees; 2-4 towers of unequal height (each 0.62-0.9 of the last) over a skirt
  12-20 % of the height whose ends taper at different rates (6-14 % and 10-22 % of the width). Banks and decks: long thin
  bodies swelling in 2-4 humps (ladder 0.45-0.8), their ends dragged thin over 10-30 % and 25-50 % of the length,
  sometimes pinched in two. A tail ends at 2 px, never a hairline.
- **Sky streaks:** never a constant-width bar: the thickness swells and pinches +-35 %, the two ends taper over 15-30 %
  at different rates, the centre line bows and wanders by 0.25 of the thickness.
- **Trees:** a body wider than tall with a flattened underside, 3-5 big lobes over its upper three-quarters (never evenly
  spaced; the biggest toward the lean), 2-4 clumps half sunk on each lobe's outer arc, 1-3 sky gaps where lobes meet; by
  area the biggest mass 20-30 %, medium 35-45 %, small <= 40 % (v6's tree 67 % small); the trunk tapered, bowed 5 %,
  with a root flare.
- **Asymmetry:** the biggest tower or lobe 2-16 % of the width off-centre, toward the light or the lean; inner shapes
  (lit caps, shade masses) mirror IoU <= 0.7.

**Man-made shapes** stay straight, but drawn (a noise wobble on them reads melted):
- **Hand-cut, at design time:** each side turned 0.8-2.2 degrees (opposite sides differing by >= 1), bowed 0.3-0.9 %,
  cut in 1-3 pieces jogging 0.3-1 px, corners worn 0.6-2 px (windows, doors, sills 2-3.5 px), per shape (a majority
  filter on the raster eats thin frames and mullions).
- **No ruler line reads unbroken on planes 0 to +2:** straight runs of 60 px or more <= 15 % of a crop's edge length
  (v6: the facade 54 %, the paving 68 %). Break each long edge with an overlap (a branch, a person, a lamp post), a lost
  stretch over 10-30 % of its length where it meets a close value, a joint that stops, a chip. A hand-cut side alone
  stays a ruler line (99 % measured).
- **No template:** windows, panels, flags and planks vary 5-12 % in size, +-1.5 px in place and in state (lit, dark,
  sky-reflecting, curtained), never the same state twice running; twins <= 5 % of the shapes (v6's far city 24 %); each
  repeated element carries one asymmetric thing (a curtain to one side, a blind at its own height, a sky reflection
  across one corner); a building's median mirror IoU <= 0.65.
- **Parallels and right angles:** two straight edges within 3 degrees, 3-30 px apart, only where designed (a window's
  jambs, a rail): <= 75 % of the straight length; edges on the axes (within 2 degrees of level or plumb) <= 50 %; right
  angles <= 25 % of the corners in the picture, which takes a hero building turned 15-30 degrees off frontal, or its
  corners broken by overlaps and lost stretches (rounding does not move the count).
- **Two faces per volume:** the lit face and a shade face whose far edge meets the air at a close value and is LOST over
  25-40 % of its length.
- **The ground:** no joint, plank or kerb crosses the frame: a joint runs <= 25 % of the frame's width, fades with
  distance and breaks into 2-5 pieces with lost gaps (10-25 % of its length) and faded ends; flags are value patches
  (+-3-9 L*) more than drawn joints; cast shadows lie across them.

**Rhythm and size:**
- One dominant mass per element: the biggest shape 15-35 % of the element's shape area, the next three 25-45 %, the
  small ones <= 45 % (v6's facade: the biggest 4 %). Sizes spread over 4-7 octaves of area.
- Fewer, bigger clumps inside a mass: a near tree's clumps 8-25 % of the crown's width, a cloud's billows 6-20 % of its
  width; small marks only where a thing is fine (reeds, a flock).
- Rows of things (posts, windows, bollards, birds) are never evenly spaced: the gaps' CV >= 0.3.
- Every mass on planes 0 to +2 is broken at least once by a thing in front of it (a branch over a roof corner, reeds
  over a base, a person over a kerb).

**Edges, lost and found:**
- **Found** (crisp, 0.5-1.5 px) where the light hits a form, at the focal, and wherever the value step is >= 14 L*.
  **Lost** (10-24 px, or broken by teeth) where two values within 4 L* meet: a shade face against the dusk air, a
  cloud's base, a shadow's far edge. Between 4 and 14 L*, blended.
- **They alternate:** every natural outline over 300 px carries at least one found and one lost stretch of >= 15 px,
  chosen by the light's facing term plus a slow noise along the outline (wavelength 90-160 px); never one quality all
  round.
- **A lost edge is made, never blurred.** Near and mid: EDGE STROKES, one flat-brush stamp every 14-26 px along the edge,
  3-7 px wide and 14-40 px long with a dry tail over its last 25-60 %, in one side's colour or the other's by a slow
  noise, lapping 0.2-0.5 of its width over the edge, the two sides' strokes interleaved. Far and vapour: DRY-BRUSH TEETH
  (~5 px wide, ~28 px long) along the brush direction (the wind for sky and water, the perspective lines for paving,
  vertical for facades, growth for foliage). Teeth, gaps and bristle breaks >= 2 px across at 1x (thinner ones twinkle in
  the float); thin props get small doses (long teeth on a chair leg look torn).

**The targets** (the painted references' range; the subject's box measured apart: it stays crisp):

| Measure (tool) | Whole frame | Sky | Cloud | Tree | Building (not the subject) | Ground |
|---|---|---|---|---|---|---|
| razor edges (`techniques_demo.py --measure`) | <= 8 % first (refs 0.3-4.6 %; v6 22 %) | | | | | |
| straight runs >= 60 px (same) | <= 15 % (refs 1-13 %; v6 26.5 %) | | | | | |
| dead-flat over 31 px (same) | <= 20 % (refs 0-20 %; v6 35 %) | | | | | |
| straight (`shapes_measure.py`) | | <= 25 % | <= 15 % (base excepted) | <= 10 % | <= 45 % | <= 40 % |
| ruler lines | | <= 10 % | <= 5 % | <= 3 % | <= 15 % | <= 15 % |
| compass arcs | | <= 5 % | <= 10 % | <= 5 % | - | - |
| right-angle corners | | | | | <= 25 % | <= 10 % |
| mirror symmetry (median IoU) | | <= 0.65 | <= 0.65 | <= 0.6 | <= 0.65 | <= 0.65 |
| crisp visible edges | | <= 30 % | 15-40 %, where the light hits | <= 30 % | <= 60 % | <= 45 % |
| lost mass edges | | >= 10 % | 15-25 % | >= 7 % | 2-5 % | >= 10 % |
| broken mass edges | | >= 25 % | >= 20 % | >= 35 % | >= 40 % | >= 40 % |
| outline alternates found / lost | | | >= 70 % of its length | | | |
| clear geometric edge (px per 100 x 100) | | <= 10 | <= 15 | <= 20 | (not a gap) | <= 45 |

### 4.2 Light (point 3; and the darks of point 1)
- **One key per set, one story light per scene, on the subject.** The key gives the direction for everything (a sun in
  frame is its image point and the horizon: elevation = atan((horizon y - sun y) / focal), its shadows' vanishing point
  straight below it on the horizon). The story light wins: the brightest 5 % of the frame below the sky (the far planes,
  +3 and beyond, left out with the sky and the band) within 0.07-0.15 H of the subject; every other light at least a
  step under it (lit panes +6-8 L* over their facade, never a saturated yellow; far lamps off or tone-on-tone).
- **Falloff on a real curve:** under a lamp cos^3(theta) / h^2 (a bright core, a fast drop, a long tail); an area
  source (a doorway) falls off more slowly near it. Shipped as a smooth ramp dithered +-0.5 code (seeded) in a baked
  map, never concentric rings; a vector pool may keep CRAFT's two flat steps. A doorway's pool is the opening projected
  forward (1.45x by the near edge), +7-10 L* at the threshold, its sides softening 3 -> 12 px with distance, every
  caster in it cutting its own shadow out; it never lands on water (the water shows the source's column).
- **Rims on what the light touches,** from the shape's distance field x max(0, n . l)^p (p 0.8-1.2), so uneven by
  construction, never an even outline, in the light's colour: the subject 4-6 px on a ~300 px figure, scaled with its
  height (her 153 px: 1.7 px plus a 3.4 px band at 0.4), +12-18 L*; tier B 2 px, +6-8; tier C 1.5-2.5 px, +4-8 (a
  sliver up a building's sun-facing corner ~3 px); far planes none, or +2-3 L* lost in the haze.
- **Light wrap** where the subject stands against the story light's source: the source blurred (sigma ~7 px) laid on
  her inner edge band (3-4 px at ~300 px tall, scaled), weighted by that blur so it fades as she leaves; on the back
  edge only where an even band would read as an outline.
- **Bloom only AT emitters** (the sun, a lit opening, a lamp, a screen) and their reflections: three blurs at ~0.1 /
  0.4 / 1.2 x the source's size (the door 2.5 / 8 / 22 px; the sun 4 / 14 / 40 / 110 px, the two wide ones stretched
  1.8-2.4x along the horizon), weights ~0.3 / 0.2 / 0.1, cut out of the source itself; <= +6-8 L* at its edge, +2 one
  size away, nothing past three; never on a lit surface, never a disc or ring, never in the caption band. A sun that is
  the key but not the story light keeps its glow at +2-3 L*: the far stays the calmest part of the frame.
- **Shafts:** at most 2-3 soft wedges fanning from the source's image point, +2-4 L*, against darker air only, never
  across the caption band or the focal.
- **Shadows by projective construction** (one homography through the light's image point and its foot). A dusk sun's
  shadows are long (h / tan(el): ~6.5 h at scene 1's 8.9 degrees) and converge on the point below the sun; where a design
  needs a sunlit dusk ground, cap them at <= 2.5 h with the far end fading. A sun on the roofline puts the near ground in
  shade instead, and nothing inside a shade mass casts a sun shadow. Contact shadows always.
- **Shade masses have a named caster** (a canopy off-screen, the far roofs) and the caster's shape (§4.1: clumps of three
  sizes in an uneven rhythm, holes of light near the edge, a penumbra of the caster's distance x the sun's 0.53 degrees:
  10-30 px on our near ground), never a vignette. Dapples are the sun's image through gaps: ellipses stretched along the
  light, in clusters of uneven sizes, or none (single soft discs read as discs).
- **The dusk light table:** the key #FFC27A (gold-peach: rims, slivers, the glow, the veil); the story light #FFE2AE
  (cream-gold, ~2900 K: the scene's one hot accent); shade toward the sky's violet with its chroma kept, #C79AB4
  rose-plum on warm surfaces and #A49BD6 violet on cool ones; a warm bounce #F2B8A8 (+3-5 L*) under things standing on
  a warm ground. Never a black or grey multiply.
- **Three homes, cheapest first:** the colours (what is simply lit or shaded and never changes: 0 ms) > baked maps per
  plane (ONE multiply + ONE screen map solved per pixel against the plane's own render, each cropped to its box; one set
  per state, mixed by the cause: a door's light scales with its opening) > live layers for movers (rims, wrap, shade,
  shadow cut: within the measuring noise). A full-frame blended image costs ~40-70 ms: crop and merge.
- **In time:** a source never moves between cuts; static light is baked once per state and rides its plane; light on a
  mover is a function of its pose at t; a light switching is a one-frame pop on its story beat; no flicker without a
  story reason, no light re-seeded per frame. The light floods in WITH the colour from its source on frame 0's beat
  (each map masked by the flood's growing circle; the story light lands with the door's flood). Every layer stops >= 10
  px outside the caption band.

### 4.3 Colour: one key (point 2)
- **One family per scene, the sky's own** (scene 1's dusk: violet shade -> rose-plum -> rose -> peach -> cream-gold
  light). Off-family colour below the caption band <= 3 % of the coloured pixels (v6 16.3 %; proof 2 2.5 %).
- **Hues outside the family turn toward its nearer end with their chroma kept:** C* >= 8 (CRAFT §f.2's floor; proof 2's
  glass at C* 4 and lanterns at 2 read grey), never beige, never in the olive band (h 88-118 at C* < 30). Living greens
  keep ONE green family (`PAINT_RECIPES.md` §3 C8: the lit end h 100-110 pulled 6-10 degrees toward the key, the deep
  end h 210-230 toward the sky's cool); proof 2's key turned the tree olive, which C8 and CRAFT forbid.
- **One hot accent, at the focal:** the story light's gold (the lobby C* ~56, every other light <= ~20); the 1 % most
  saturated warm light (L* > 60) 100 % at the focal (v6 24 %: the yellow panes); colour calls <= 3 with one rival (R3).
- **A glaze and the darks:** every colour below the sky leans toward the family at its own value (~24 % in the proof:
  warm lights, violet darks); the darks below the band a step deeper (-8 L* at L* <= 25).
- **The subject keeps her own colour:** her teal against the door's gold is the complementary pair the eye goes to.
- **At the source:** the palette roles and each painted piece's light table (`PAINT_RECIPES.md` §3 C5) carry the keyed
  values (`light_proof.md` §3.3's table, with the two fixes above): 0 ms a frame. The proof's per-pixel function
  (`src/look/light_s1/bake/key.py`) stays a measure, never a grade over the frame.

### 4.4 Composition (point 8; `composition.md` §4, checked by `composition_study.py frame`)
- **R1 The notan first:** at a 1 % squint in 3 values, the three largest value masses hold >= 85 % of the frame
  (painted models 88-97 %, v6 82 %), <= 8 masses of >= 1 %, one group dominant (40-55 %), the groups' means >= 13 L*
  apart. A 2- and 3-value notan of every exterior shot at G3, checked at phone width before G4.
- **R2 Few pieces:** <= 10 value pieces (0.02-1 % of the frame) in a 9:16 frame (references 2-7, v6 32); detail lives
  INSIDE a mass (2-8 L* of in-mass variation): a small thing joins its mass tone-on-tone or is one of R6's objects.
- **R3 One call:** <= 3 regions pull at >= 50 % of the strongest and only one at >= 70 % (the focal), in value AND in
  colour (painted models 1-2; v6 10 with 3 rivals in value, 11 with 4 in colour).
- **R4 The focal is the subject, the story light and the hardest value step in one place:** scene 1, the lit doorway
  (L* >= 95) with her silhouette in it (L* <= 28), a step >= 65 L*; below the band no other step over ~40 L* and nothing
  within 10 L* of the door's light; the strongest call on her box in value and colour.
- **R5 Big quiet:** >= 65 % of the frame quiet at a squint, in two connected masses: the sky with the caption band (>=
  30 %) at the top and the near ground (>= 15 %) at the bottom; the things live in the belt between (painted models
  67-91 % with masses of 51-77 % and 12-14 %; v6 61 % as 29 + 24, perforated). Quiet is never empty: patterned within
  +-4-6 L* (painted variation, dapples, joints, fallen leaves, tone-on-tone things).
- **R6 <= 6 named objects at phone size** (the subject, one big secondary mass such as the hero cloud, 1-3 supporting
  things; the fields are not objects; references 4-6, v6 about 40). The near frame holds <= 2 props, cut by a frame edge
  and inside the near shade mass (<= 8 L* from it). The far side stays full, as texture in its band (within +-6 L*, no
  own silhouette at a squint).
- **R7 Under the band:** the band sits in the light quiet mass; the focal's centre at y 860-1200 and x 380-700, <= 0.2 W
  off the caption's centre line (x 520), 300-650 px below the caption block (y 556); nothing calls between the words and
  the focal.
- **R8 One counterweight:** one big, soft, quiet secondary mass (the hero cloud, top right) on the other side from the
  focal, its pull < 50 % of the focal's, its lit side toward the key.
- **R9 Edges found only at the focal** (0.5-1.5 px, the hardest step); wherever two masses are within ~10 L*, soft or
  lost (§4.1).
- **R10 A real dark mass:** the darkest value group 15-40 % of the frame at mean L* <= 45, >= 80 % of it in one or two
  connected masses below the band (references 17-36 % at L* 8-35; v6 16 % at 45 in pieces; proof 2 38 % at 30-36, 94-97
  % in two).
- **R11 The hot accent only at the focal;** everything else tone-on-tone in its mass (dE <= 6-8); a lit window off the
  beat +6-8 L* inside its facade.
- **R12 Pip** hides inside a mass of the busy belt, tone-on-tone, >= 250 px from the focal, never between the words and
  the focal or on a leading line into it (v6's post under the door sits on the door's light column).
- **The focal moves only with the story:** the value plan prepares the next subject a step under the current one (W's
  pane under the door), and the old focal calms as the new one lights.

### 4.5 Texture: one paper (point 9)
- **One material per film,** on every plane and every mover: a fine tooth, a little fibre (2 x 1 px along one angle; 4 x
  1 px read as brushed linen: never) and a gentle mottle (40-90 px blotches), soft-light round mid-grey (an equal lift
  and darkening, strongest in the mid-tones: the darks keep their depth, the lights never grey). On a plane that floats
  its finest feature is >= 2 px across (the twinkle rule).
- **Strength:** ~0.9 L* std on a mid-tone, +0.4-0.8 L* added on the flats; by plane as `lib/texture` `MOTTLE_K`: tiers
  A and B 1.0, tier C up to +1 0.7, +2 and farther 0.4, the sky 0.6; in the caption band <= 15 % (its spread <= 1.5 L*,
  the ink's contrast unchanged).
- **Locked:** baked into each plane's painted pieces and its one multiply map (it rides the plane's float); a tile
  locked to each mover (`lib/light2` `GrainOn`); never fixed to the screen, never re-seeded per frame.
- **Targets:** dead-flat area (31 px) <= 20 % of the frame (v6 35 %, proof 2 22.5 %); in the float, the paint and the
  paper together <= +30 % bitrate over v6 (CRAFT measured a plane-locked mottle +27 %, and a 0.25 L* grain +48 % with a
  shimmer at 720p). The film works without it: it is the last step.

## 5. The balance: near crisp, far painterly (one table by plane)

The owner's balance as one dose table: what each plane gets of every technique. Near and in focus: found edges, the
finest marks, the most detail; far: lost edges, fewer values, and the COARSEST marks, few, broad and visible ("more like
brushes and painting"), never a far plane that is only blurred. ONE painted language: every piece in the frame (a prop,
a boat, a lamp post) takes its plane's row, because one flat vector piece among painted ones reads pasted in; the
subject and people are the exception, crisp by tier. "Near" is the subject's plane and the near world, not the frame's
edge: the nearest framing objects are out of focus (as ref 02's reeds). First doses for the v7 look test
(`techniques.md` §5.4 with `PAINT_RECIPES.md` §1's depth ladder and `shapes.md` §3.3); show two strengths, the owner
picks.

| Plane (scene 1) | Found edges | Lost edges, and how they are made | Marks (the brush ladder) | Shape detail | Light inside a face; rims | The air: k; values; blur solids / vapour | Paper |
|---|---|---|---|---|---|---|---|
| **Tier A, the subject** (her; the lit doorway, its frame, the fascia), plane 0 | all round on the lit side and at the focal, 0.5-1.5 px; the frame's hardest step | none (her shade side <= 2 px) | none on her (never painted); the doorway its design + <= 7 crisp accents | her outline free curves; the door hand-cut (0.3-0.45 px hand-ruled) | +-3-4 L* toward the story light; rim 4-6 px at ~300 px tall, scaled (1.7 px at 153 px), +12-18 L* | k 0; 4 values + rim; 0 / 0 | 1.0 (a tile locked to her) |
| **Tier B** (Pip; people near the story) | all round | none | none (their own recipe) | free curves, asymmetric poses | rim 2 px, +6-8 L* | their plane's k | 1.0 (locked) |
| **The subject's plane around the focal**, 0 to -0.5 (the facade, the far towpath, the water, the boats) | at the door, the fascia and W and at steps >= 14 L*, 0.5-1.5 px | between faces closer than 10 L*: short flat strokes clipped to the two faces; a shade face's far edge lost over 25-40 % | blocky flat-brush marks along the piers (vertical) and bands (level); light marks only on the glass, each pane its own reflection | hand-cut, bowed 0.25-0.55 px; ruler lines broken, windows varied, an overlap per long edge | +-2.5-3 L* toward the key; backlit shade in rose-plum; rims 1.5-2.5 px where the key touches (parapet, planting, a ~3 px corner sliver) | k 0; 4 values + rim; 0 | 0.7 |
| **The near world**, -1 (our bank: its paving and coping, the canopy's shade) | at steps >= 14 L* (the coping's sunlit lip, a thing's contact edge), 0.5-1.5 px; thin things only 0.2 px teeth | where <= 4 L* meet (joints, nosings, a shadow's far edge): edge strokes every 14-20 px, 14-34 long, 3-7 wide; lost teeth 6-8 px | the full ladder, the finest in the frame: a wash, flat blocky strokes along the perspective sized by distance, crisp accents on lit lips | natural: 3 lobe levels, the full octaves (foliage 6-12 px); man-made: hand-cut (0.5 px), joints <= 25 % of the width in 2-5 pieces | +-2.5-3 L* toward the key; C rims 1.5-2.5 px, +4-8 (a sunlit coping edge) | no air: a value step darker (5 L*); 4-5 values; 0 | 0.7 |
| **The near frame**, -2 (<= 2 props cut by an edge, inside the near shade mass) | few: found teeth 0.5 px, the rest quiet in its shade mass | teeth 4 px; a framing object meant out of focus takes the one optical blur, 2.2-3 px | few (it stays within 8 L* of its shade mass); none on an out-of-focus one | leaves warped 4-8 px; man-made hand-cut | +-2 L* | no air: a value step darker (10 L*); 4 values + accents | 0.7 |
| **+1** (none in scene 1) | 0.7-1 px wide; found teeth 0.6 px | teeth 4 px; strokes every 16 px, 16-28 long, 3-6 wide | radii 10 / 5 / 3 | 2-3 lobe levels; warp 4-8 px; wobble 0.6 px | +-2 L* | k .12, chroma x0.90; 5 values; 0.3 / - | 0.7 |
| **+2** (the mid cloud bank; the bridge) | 1-1.5 px wide (a cloud's lit side 2.6); found teeth 0.6 px | solids: teeth 2.5 px, few strokes; vapour: teeth 8 px, strokes every 18 px, 16-28 long, 3-5 wide | radii 12 / 6: two coarse passes, then stop | 2 lobe levels; warp 3-6 px; wobble 0.7 px | +-1.5 L*; rims lost | k .22, chroma x0.82; 4 values within 24 dE; 0.4-0.6 / 1.3 | 0.4 |
| **+3** (the far tower; the far cloud deck) | only where the sun touches: a sliver <= +12 dE over its body, 1.5 px | solids: teeth 2 px, the tops lost by the sun; vapour: teeth 8-10 px, strokes every 24 px, 24-40 long, 4-7 wide | radii 14 / 8: few, broad and visible | 1 lobe level, displacement at the floors (0.6-0.8 px); warp 2-4 px; wobble 0.9 px | +-1 L*; the sun's in-scatter veil | k .40, chroma x0.68; 3 values within 12 dE, windows tone-on-tone (dE <= 6); 0.5-1.0 / 2.4 | 0.4 |
| **+4** (the far roofs; the horizon streaks) | none but the sun's rim; 2-3 px | roof tops lost by the sun (teeth 6 px); vapour teeth 10 px along the wind | radius 14 only (the coarsest pass), or the silhouette alone | the silhouette only; warp 2-3 px; streaks swell and pinch (§4.1) | +-0.5 L* | k .65, chroma x0.48; 2 values within 5 dE, within dE 10 of the air; no windows; 1.6 (streaks 0.6-1.6) | 0.4 |
| **The sky and its clouds** (the sky never floats; each cloud plane takes its own k) | a cloud's lit side, crisp and ragged toward the sun (1.8 px near, 2.6 on +2) | the base 22 px and the side away from the light 16 px, with dry teeth 8-10 px along the wind; each outline alternating on >= 70 % of its length | the sky recipe's passes laid with MyPaint: a wash, flat strokes along the billows where the form turns, a knife across old arcs, crisp accents on the lit edge, dry strokes in the base; the open sky calm | ellipse unions + the cloud octaves: three levels near, two on +2, one on +3 | the sky's one warmth field; a cloud lit as one form (light per billow <= 0.45) | near cumulus k 0, mid bank .22, far deck .40; the band flat (spread <= 1.5 L*) | 0.6; <= 0.15 in the band |

"Found teeth" are the short dry-brush breaks a found edge keeps (px long); "warp" is a natural silhouette's
displacement (px); "wobble" is the hand-ruled bow of a man-made edge (px); k is CRAFT §f.2's step toward the air, the
chroma factor a hue across the air's keeps.

## 6. The roadmap: painter v7 on scene 1

**v7 is an iteration** (the owner: "Again let’s start with stills"): v2's scene 1 at 1.0 s, in v2's view (the owner:
"our initial angle snd the view frankly wasn't bad"), built in five checkpointed steps in order of impact per effort.
Each step ends in a still (v6 | v7 so far, at full size and at 400 px beside refs 03 and 02) and its check, so a usage
limit loses at most one step. The checks are the scripts the research already wrote (minutes each, no panels).
- **Where it lives:** one NEW scene folder that merges the two proofs, e.g. `src/look/v7_s1/` with its own entry and
  composition (`V7S1`), built from `src/look/light_s1/` (its 26 named segments, the plane slots, the bake that solves
  each plane's maps against the exact composite under them) plus `src/look/organic_s1/`'s piece slots. Never `src/v2r`,
  `src/look/paint_s1` or a `src/lib` default; a new `lib` module is fine. The painter's spec is
  `scripts/look/paint/v2s1_v7.json` with `bake_v2s1.sh`'s v7 lines; the notes go in
  `docs/studies/2026-10-28_city_posters/paint_test/NOTES.md` under v7.
- **One dependency:** step 4's prop cut is a deletion: run it at the START of step 3, so nothing is painted and then
  removed. Steps 1 and 2 share one bake (the light maps are solved against the keyed colours); step 5 folds into step
  2's maps and step 3's pieces.
- **Show the owner twice:** at step 3.0 (steps 1 and 2 with step 4's cut: cheap, and they change the still the most),
  and after step 5.

### Step 1. The palette and one colour key (points 1, 2). Effort: small (palette data, about an hour). Cost: 0 ms.
- **What:** the scene's palette roles take `light_proof.md` §3.3's keyed values, with two fixes: C* >= 8 on every role
  but a designed neutral (the glass a slate-violet at C* ~10, not 4; the lantern glass and the lamp posts likewise), and
  living greens in one green family (`PAINT_RECIPES.md` C8), never olive or beige. ONE accent: the doorway's gold (the
  lobby's warm wall, C* ~56). The lit upper panes a quiet warm cream inside the facade's mass (+6-8 L*, C* <= 20); the
  yellow side panel into the facade; the hulls, the lamps and the far towpath's life toward the family's violet end; the
  darks below the band a step deeper. The sky top B (v4's deeper zenith #afb3d8: the owner saw no difference between A
  and B, so we took B on 2026-10-30). The painter's light table (`paint.py` `scene_light()`) is fed from the same keyed
  roles, so the painted sky, clouds, water and far city share the key.
- **Files:** NEW `src/look/v7_s1/palette_v7.ts` (the keyed role map over `src/look/paint_s1/palette_10b.ts`'s roles,
  with a `problems()` check: C* >= 8, the olive band, one accent); the v7 scene's modules that pick roles;
  `scripts/look/paint/v2s1_v7.json` (`palette`, `local`, the zenith); `src/look/light_s1/bake/key.py` kept as a
  measure, never a grade over the frame.
- **Check:** `src/look/light_s1/bake/measure.py` (or its v7 copy), captions off: off-family colour below the band <= 3 %
  (v6 16.3 %); the 1 % most saturated warm light 100 % at the door (v6 24 %); `palette_v7` `problems()` empty; the band's
  spread <= 1.5 L* and the words' contrast unchanged (68.9 L*); `composition_study.py frame`: colour calls <= 3 with one
  rival; `scripts/qa/check_banding.py` on a master encode of the deeper zenith. Eye at 400 px: one family, the door the
  only gold.

### Step 2. The story light (points 3, 1). Effort: medium (about a day). Cost: the frame gets cheaper than v6.
- **What:** `light.md` §5's rig as data. The key: the sun in frame at (195, 745), r 20, the horizon at y 965, focal 1400
  (elevation 8.9 degrees, vanishing point (195, 965)). The story light: the doorway (x 540-720, y 848-1082) with the
  lobby's lamps through the opening, #FFE2AE. The shade family #C79AB4 / #A49BD6; the far towpath's lamps off. The dusk
  rig: v6's day casts off, contact shadows and form shades kept. Per plane ONE multiply + ONE solved screen map, cropped,
  solved against step 1's colours: the backlit facade in shade (dose 0.52-0.88); our bank under a canopy off-screen left
  (0.8-1.0), its edge a designed shape (§4.1: clumps of three sizes, holes of light, a 10-30 px penumbra); dapples as
  clusters of stretched ellipses, or none; light on the jambs; the door's pool and its column in the water; the sun's
  bloom (+2-3 L*) and veil; rims by tier. A map set per STATE (the doors shut and open, W's lamp, the pane at 3.90 s),
  mixed by the cause. Her: `RimOf` toward the sun (1.7 px + 3.4 px at 0.4), `WrapOf` on her back edge only, `ShadeOf`,
  `ShadowCut` from the lobby's lamps; Pip: shade + a 1.6 px rim. The `lib/light` layers that the maps replace: OFF.
- **Files:** `src/look/light_s1/bake/` (`light.py`, `labels.py`, `solve.py`, `render_many.mjs`, `run.sh`) -> the v7
  scene's `bake/` (later production-grade as `scripts/look/light/bake_light.py`, `light.md` §4.0);
  `src/look/light_s1/rig.ts`, `movers.tsx`, `context.tsx` -> `src/look/v7_s1/`; `src/lib/light2/` reused as is.
- **Check:** `measure.py`: the brightest 5 % below the sky (far planes out) within 0.07-0.15 H of her; the lobby >= +25
  L* over the facade in its regions (proof 2 +26, v6 +9); darks (L* < 40) 15-40 % of the frame with >= 80 % in two
  masses below the band (R10); the caption band 0 codes changed; the engine within ~0.1 L* (mean) of the bake away from
  the movers; two bakes, one md5.
  Motion: a 1.0-2.4 s clip at 30 fps measured as `light_motion.py` does (static light drift <= 0.05 L*; her light's
  largest step <= 1 L* a frame; frame-to-frame p99 <= 0.3 L* away from the movers; no green cast in the shut state).
  Render <= v6's ~550 ms a frame (the measured path: 256 ms). Eye: for every shadow, point at its caster; at 400 px the
  eye lands on the door.

### Step 3. Organic shapes and brushwork (points 5, 6, 7, 4). Effort: large (the biggest step). Cost: bakes; +30-70 ms.
- **3.0** Step 4's cut first.
- **3a, the design, in the engine:** port `shapes_gen.py`'s generators to a NEW `src/lib/organic/` (seeded by
  `lib/rng.ts`): ellipse unions with the value-noise octaves, `cumulus`, `bank`, `streak`, `crown`, `limb`, `handCut`,
  `varyRects`, `brokenLine`, a dithered `lightRamp`, `dapple`; perfect-freehand for tapered strokes; polygon-clipping or
  d3-contour for a union's outline. In the scene: the cloud planes and streaks from the generators; the facade's windows
  varied, each with one asymmetric element, their frames hand-cut, an overlap over each long edge; the paving's joints
  broken.
- **3b, the painter:** `scripts/look/organic/` and `docs/look/organic/shapes_gen.py` move into `scripts/look/paint/` as
  v7 styles (imported, never copied). `paint.py` stays the planner (the design, the light table, the zones, the depth
  ladder, `rng_for` seeds, §5's doses) and writes each piece's marks as a strokes JSON `{brush, pts:[x, y, pressure],
  color, width, opacity, seed}`; the Node bake paints them with MyPaint over the piece's flat; then the edge pass (found
  and lost by value, light, tier and plane; strokes near, teeth far, >= 2 px) and the plane's blur; one RGBA PNG per
  piece, as now.
- **3c, the pieces, far to near, one checkpoint each:** the sky and three cloud planes (v6's own cloud, which the owner
  liked, warped and marked as in proof 1, then fewer and bolder marks on its lit side and a ragged found top; the mid
  bank a real bank, never a slab); the far city +3 / +4 (lost tops, teeth, coarse marks, tone-on-tone windows); the
  facade round the door (proof 1's piece with the new windows; the door, the fascia and W stay holes for the crisp
  layers); the water (its left third calmer); our bank and the canopy's shade (proof 1's paving, its marks bold enough
  for 400 px; the props' shadows owned by step 2's multiply map, never baked twice); the kept prop at the near dose
  (hand-cut, a light ramp, edge strokes), so nothing reads pasted.
- **Files:** NEW `src/lib/organic/`; `scripts/look/paint/paint.py` (v7 styles calling a moved
  `scripts/look/paint/organic/` package: `oc_lib.py`, `piece_*.py`, `mypaint_bake.mjs`); `scripts/look/paint/shapes_gen.py`
  (moved as is); `scripts/look/paint/recipes/sky_clouds.py` (billows -> ellipses + octaves) and `recipes/foliage.py`
  (a crown by `shapes_gen.crown`, if a tree stays); the vendored brush, e.g. `scripts/look/paint/mypaint/` (peinten
  1.3.0's `dist/domain/brush` + `dist/domain/tiles`, its NOTICE, the CC0 `.myb` subset); `scripts/look/paint/v2s1_v7.json`;
  the piece slots in `src/look/v7_s1/` (from `src/look/organic_s1/OrganicScene.tsx`).
- **Check:** `python3 docs/look/organic/techniques_demo.py --measure` on the still: razor edges <= 8 % (the subject's box
  measured apart, still crisp), straight runs <= 15 %, dead-flat <= 20 % (with step 5); `shapes_measure.py` on the same
  crop boxes (`SRC['ours_v6']` -> the v7 still) against §4.1's table; two bakes, one md5 per piece;
  `techniques_motion.py` on the full still: <= +30 % bitrate against v6, no tooth, gap or fleck under 2 px on a floating
  plane. Eye at 400 px beside v6 and refs 03 and 02: the marks read on a phone (proof 1's facade and tree did not), and
  nothing reads pasted.
- **Cost:** a bake of ~2-16 s a piece on one core (about eight pieces); +30-70 ms a frame for new full-size images (crop
  each to its box); 0 ms otherwise.

### Step 4. Composition (point 8). Effort: small (deletions and moves, about an hour). Cost: none; renders faster.
- **What:** T1's plan (`composition.md` §5). Remove the bay tree and its grass, the planter with its pennants, the
  flower crates, the potted plant, the bench, the post box, the low wall, the fern pot, and the top-left leaf
  branch. Keep one café table and one chair at the right edge, cut by it, inside the canopy's shade. The
  far towpath's life tone-on-tone within +-6 L*; one boat hull; at most one of the man, the duck and the cat,
  tone-on-tone; Pip off the bollard under the door, onto the boat's cabin roof, tone-on-tone, >= 250 px from the door;
  one hero cloud top right as the counterweight, the far deck and streaks within +-4 L* of the sky. Show T3's key beside
  it (a darker sky top, the quay one deep mass) for the owner's pick.
- **Files:** the v7 scene's own copies of `src/look/paint_s1/V2S1_fore.tsx` (the near props), `near.ts`,
  `V2S1_set_life.tsx` (the towpath's life, the boats, the cat, the leaf branch), `V2S1_pip.tsx` and `V2S1_set_wing.tsx`
  (the panes), or switches in its own `switches.tsx`.
- **Check:** `python3 -B docs/look/organic/composition_study.py frame <v7.png> --caption --subject
  0.495,0.435,0.675,0.567`: all ten ok (v6 9 WARNs, proof 2 5, T1 0), with R5's quiet threshold recalibrated on this
  first painted frame (flat thumbnails read 86-88 %; a painted frame falls toward 67-91 %). Eye: squint at 400 px, one
  place to look; Pip found on a second look.

### Step 5. The paper (point 9). Effort: small (built). Cost: 0 ms baked; its cost is bitrate.
- **What:** `light_proof.md` §3.2's paper, folded into step 2's per-plane multiply maps and step 3's painted pieces (one
  material, `MOTTLE_K`'s strengths, <= 15 % in the band), `GrainOn` on her and Pip; its finest feature >= 2 px on a
  floating plane.
- **Files:** `src/look/light_s1/bake/texture.py` -> the v7 bake; `src/lib/light2/live.tsx` `GrainOn` (reused); the
  painter's per-piece grain (`paint.py` `grain`) replaced by the one material.
- **Check:** dead-flat (31 px) <= 20 % of the frame; the band's spread <= 1.5 L*, the ink unchanged; +0.4-0.8 L* added
  on the flats; in the float, `techniques_motion.py` on the full frame: <= +30 % bitrate over v6 for steps 3 and 5
  together, and no shimmer at 720p (`check_banding.py`'s texture mode, the platform rungs): the gate before a film takes
  it. Eye: no texture visible at 400 px, the frame reads as one surface.

**The v7 sheet:** v6 | v7 at full size and at 400 px beside refs 03 and 02, with T3's key as the second option, and one
table: the three numbers (§4.1), the composition check, the light measure, the float's bitrate, the bake and render
cost, the md5s. With it, ask the owner §8's three questions.

## 7. What we do not know yet (honest)

1. **Motion.** Everything above is one still at 1.0 s. Light maps are one state of the scene (by 1.10 s the shut glass
   took the open state's solve: a green cast); a solved map slips up to p99 2.8 L* as its plane floats; the bank's baked
   prop shadows can slip ~1.8 px (the bank floats at 0.85 of the near plane); the pane that lights at 3.90 s is baked in
   its 1.0 s state; the cloud is static (a churn is a live displacement, 66-71 ms a frame). A 1.0-2.4 s clip is part of
   step 2's check; a film needs every state baked.
2. **The phone's width.** Marks that read at 1:1 fade at 400 px: proof 1's facade and tree, the far city's gold rims,
   her rim and wrap (1-2 px). v7's marks are fewer, bigger and bolder, and every step is judged at 400 px first.
3. **The high-key top.** The caption sky stays light by rule (a flat band, ink on light): our median stays ~61 against
   the references' 21-34. T3's darker top is the owner's call; a dark sky with white captions is a separate decision
   (DIRECTION rule 10).
4. **The frontal facade.** Its right angles (33 %) and symmetry (0.72) stay over target without a turned view, and the
   owner liked v2's frontal view. Overlaps and varied windows may be enough at 400 px; if not, the wing turns 15-30
   degrees (a G3 decision for a film).
5. **`peinten`'s age.** Ten days old, one maintainer: pinned and vendored, byte-identity checked; libmypaint (ISC) is the
   fallback wherever it compiles; `hokusai` is the one to watch.
6. **The whole-frame razor-edge target** counts the frame without the subject's box: her and the people stay crisp by
   rule, and they hold part of today's 18.6 %.
7. **The bitrate of the marks and the paper together** is measured only on crops (+6-11 % for baked marks); the full
   frame in the float is step 5's gate.
8. **The light's cost as built** (+170-270 ms) holds until `lib/light`'s layers go; their 340 ms is not profiled (§8).
9. **A near tree,** where a later shot keeps one: proof 1's crown is simpler but its edge is cleaner than the
   references' (lost 4 % against >= 7 %, broken 18 % against >= 35 %). The owner's eye decides.

## 8. Doc clashes found (flagged for the orchestrator; DIRECTION, CRAFT and PAINT_RECIPES are not edited here)

The owner's 2026-10-30 words (the playbook's ORGANIC, NOT GEOMETRIC, PROPER LIGHT, SCENE COMPOSITION and the new
balance in PAINTED PIECES) outrank every rule below that predates them; each needs a reconciling edit in its own doc.
About half repeat the research lanes' flags (`light.md` §9, `composition.md` §7, `techniques.md` §8, `shapes.md` §8,
`light_proof.md` §9), gathered here with one proposal each; D1, D5, C1, C9, C10, C12, P1-P3 and P6 are new here.

**DIRECTION**
- **D1. Rule 4, "big areas flat", and the painted pieces as "a few chosen environment pieces" (elsewhere "texture stays
  VERY subtle"),** against the playbook's PAINTED PIECES ("always ONE painted language for the whole frame: a lone painted
  object among flat vector pieces reads pasted in") and the references' 0-20 % dead-flat area. Proposed: "every
  non-subject piece in ONE painted language at its plane's dose (`ORGANIC.md` §5); big areas quiet in value, never dead
  flat; the subject and people crisp".
- **D2. Rule 5's "rim light only on the subject" and "otherwise never glow discs, blur or gradients ... a halo is one step
  of at most 1.7x, or none"** sit in the same rule as its 2026-10-30 PROPER LIGHT sentence (rims on what the light
  touches, a soft glow and bloom at the source, real falloff). Proposed: "rims on what the key and the story light touch,
  by tier; a bloom at emitters only (three sigmas, <= +6-8 L* at the edge); falloff as a dithered ramp in a baked light
  map; never a glow on a lit surface, a disc or a ring" (`light.md` D-L1, D-L2).
- **D3. Rule 6, real darks "drawn in many small pieces ..., never one dark mass"** (and the playbook's own "A full value
  range" bullet, 2026-10-28/29), against SCENE COMPOSITION (2026-10-30: "values grouped into a few big masses"), R10 and
  proof 2's 33-38 % in two masses. The owner's two notes pull different ways: ask him with T1 (the gentle key) beside T3
  (the references' key), then reword rule 6, CRAFT §f.8 and the playbook bullet together. Proposed: "small darks at the
  focal (windows, a hull, her silhouette) plus one or two big quiet dark masses below the band (15-40 % of the frame)".
- **D4. Rule 3's "no hole bigger than the caption band"** (with `LIFE_AND_DENSITY.md`'s "one quiet field" and
  `LAYOUT.md` §1's quiet-field row) against R5's two big quiet masses. Proposed (`composition.md` §7.1): up to two quiet
  fields, the sky with the band at the top and the near ground at the bottom, each patterned within +-4-6 L*, so never a
  hole.
- **D5. Rule 2's tier C "built as a 'low poly' patchwork ... in flat facets"** (CRAFT §b: "flat, straight-edged facets",
  neighbours dL* 4-10) against ORGANIC, NOT GEOMETRIC ("I can see shapes and angles very clearly") and the balance (far
  "more like brushes"). Proposed: "low poly" means fewer, bigger, simpler shapes and fewer values; the facets are
  hand-cut, their shared edges lost where they sit within ~4-6 L*, and far facets carry §5's coarse marks.

**CRAFT**
- **C1. §c "Shapes": "Straight edges are ruler-true (jitter, drift, bow 0) ... circles are true ellipses (wobble 0;
  organic shapes 0.01 at most)"; "Made objects get soft corners (r = 3-6 % of the short side, at least 3 px)".** The
  biggest clash: CRAFT prescribes the geometry the owner calls "too square and proper". Proposed: §4.1 (natural outlines
  displaced at the short octaves, 0.7-2.5 % of R; man-made hand-cut, sides turned 0.8-2.2 degrees, bowed 0.3-0.9 %,
  corners worn 0.6-3.5 px), keeping "each shape one closed path, fills meet exactly, no doubled strokes, no boil".
- **C2. §c Texture: "big areas flat ... no grain overlay by default", a grain "at most 0.25 L*", "none in the caption
  band"** against the one paper (`light_proof.md` §9). Proposed: "one paper per film: tooth + fibre + mottle, soft-light,
  <= ~1 L* added on a mid-tone, <= 15 % in the band (spread <= 1.5 L*), baked per plane", adopted once its float bitrate
  and 720p shimmer pass (§6 step 5).
- **C3. §d.4's form shadow "one flat, hard-edged step ... never a gradient" and §g's "The sky is the one gradient in the
  look; everything else stays flat"** against colour and light moving inside a shape (PAINTED PIECES; PROPER LIGHT's
  falloff). Proposed (`techniques.md` §8): a dithered ramp inside a tone (<= +-3-4 L*) is allowed; a volume's 2-3 tones
  stay readable.
- **C4. §d.7 "A halo: at most 1.7x the lantern ... No symbolic glow" and §d's code line "Soft edges: 2 flat steps, no
  `feGaussianBlur`"** against the bloom at emitters (`light.md` D-L1's wording, §4.2 here).
- **C5. §d.8 "Rim light only on the subject"** against rims by tier (`light.md` D-L2).
- **C6. §d.5 "Cast shadow ... 0.3-0.8 h long under a sun"** against a dusk sun (8.9 degrees: ~6.5 h). Proposed: "at
  golden hour <= 2.5 h, the far end fading; a sun on the roofline puts the ground in shade instead" (`light.md` D-L4).
- **C7. §d.2's brightest-5 % check** leaves out the sky and the band but not the far planes, so it fails by design with a
  sun in frame over a pale far city (`light.md` D-L5: leave out +3 and beyond); and §d.2's "Nothing under L* 35 but ink,
  anchor-dark surfaces and §f.8's dark pieces" (with its check line) against a shade mass at L* 30-39 (proof 2's bank) or
  T3's quay at 25.
- **C8. §f.8, darks "6-10 % of the frame under L* 40 in >= 120 pieces ... the near world in mid-tones"** against R10: D3
  above (`composition.md` §7.3, `light_proof.md` §9).
- **C9. §g.1, a zenith "a touch deeper ... dL* <= ~1.3"** against v7's sky top B (#afb3d8, L* 75.9 under a field of ~82)
  and the key's -5 L* at the top: `check_banding.py` on a master before it ships (`PAINT_RECIPES.md` C14).
- **C10. §g.2, "the disc a flat shape on top, no halo"** against the key sun's gentle bloom (proof 2: +2.2 L* within 70
  px). Proposed: a key sun may carry a bloom of <= +2-3 L*, stretched along the horizon, and stays one step off its sky.
- **C11. §b's check** (salience peak / median, background, top-10 % mass) passes v6 while ten things compete. Proposed:
  add R3's calls (<= 3, one rival, the strongest on the subject in value and colour) (`composition.md` §7.6).
- **C12. §f.2, "never a gradient, fog or blur on the flat world"** against the light's falloff and the sun's in-scatter
  veil baked on the far planes (a graded k). Proposed: "(the light's falloff and veil, baked per plane, are light, §d,
  not the plane's air step)".

**PAINT_RECIPES**
- **P1. §1 items 5-6, §3 C3 and the depth ladder: "solid silhouettes" crisp to +3; +3 "P0" with slivers; +4 "the silhouette
  only"** against the owner's balance ("further objects are more like brushes and painting"). Proposed: far planes keep
  fewer values and fewer marks, but the marks they keep are the coarsest passes, broad and visible, and their solid
  edges lose by plane (teeth, tops lost by the sun): §5's rows +2 to +4.
- **P2. §1.7, "Texture only where the paint is near"** against one paper over every plane (point 9). Proposed: the paper
  is one material on every plane at `MOTTLE_K`'s strength; a near mass's own brush grain and speckle sit on top of it.
- **P3. §4.1 and §4.5: the facade and the paving "stay the film's crisp flat"; "the facade, only if the owner asks"**
  against the one painted language (2026-10-30) and proof 1. Proposed: the whole frame in one language, the subject's
  plane at the crispest dose (§5), the door, the fascia and W kept crisp as the focal.
- **P4. §2.3's tree crown** (9 pads, ~1550 dabs, a 0.88 px edge; its own review: "a little topiary") against §4.1's trees
  (three levels, fewer and bigger clumps) and edges (lost >= 7 %, crisp <= 30 %); the owner called v6's tree out of style
  (`shapes.md` §8).
- **P5. §2.1's near cumulus** (billows drawn as round lobes) and `lib/clouds.tsx`'s union of circles (83 % compass arcs by
  calibration): ellipses on a ladder plus the cloud octaves, arcs <= 10 % (§4.1).
- **P6. §1.10, "never ... crescents (a lit band along an outline)"** against PROPER LIGHT's rims. Proposed wording: a rim
  is the light grazing a form, n . l-weighted, uneven, broken by lost stretches, on the light's side only; a crescent is
  an even lit band following every billow (still never).
- **Not a doc clash, a fix to proof 2:** its colour key broke C8 (the tree turned olive) and CRAFT §f.2's C* >= 8 floor
  (the glass at C* 4, the lantern glass at 2): §4.3 and step 1 correct it.

**Shared code** (flagged for whoever owns it; nothing edited): `src/lib/clouds.tsx` (a union of circles, soft edges as
2 flat steps); `src/lib/edges/rough.ts` `organic()` (3-21 harmonics resampled every 26 px measure as locally straight:
add a short octave, or use §4.1's value-noise octaves); `src/lib/light.tsx` and `src/lib/LIGHT.md`'s headers ("never a
glow disc ... no blur, gradient or opacity fade": `light.md` D-L3), and its masks and tints drawn over a 2280 x 3120
region in many multiply groups (~340 ms of v6's ~550 ms frame; not profiled); `src/lib/paint/PaintedLayer.tsx` loads
pieces through `staticFile` only (pieces must live under `public/`) and has no `blend` prop (`light.md` D-L6;
`lib/light2` `LightMap` answers it without touching `lib/paint`); `paint_test/NOTES.md`'s library paragraph is history,
superseded by `libraries.md`.

**Three questions for the owner, with the v7 sheet:**
1. The key: T1 (one gentle dark mass, L* ~40-45, our quay in a canopy's shade) or T3 (the references' low key: 45 % of
   the frame under L* 40, a darker sky top)? (D3, C8)
2. The Google wing: keep v2's frontal view and break its corners with overlaps, or turn it 15-30 degrees? (§7.4)
3. The doses: the paint's and the paper's strength, shown at two strengths side by side at 400 px.

## 9. Sources and reruns

Methods only; every source with its URL is in its report: `techniques.md` §9 (26: stroke-based rendering, edge tangent
flow, Kuwahara, watercolour rendering, temporal coherence, stylized focus, domain warping, lost and found edges, a
studio's painterly environments), `light.md` §10 (15: lighting for story, a 2D feature's light-and-shadow tool, anime
compositing, light wrap, bloom, shafts, 2D light layers, golden hour), `shapes.md` §10 (edge, segmentation and fractal
measures; cloud morphology), `composition.md` §8 (notan, the steelyard balance, staging). Licences were read from the
npm registry, the wheels' metadata and the projects' licence files on 2026-10-30.

Reruns, from `video/`: `python3 docs/look/organic/techniques_demo.py [--measure | --bench]`; `python3
docs/look/organic/shapes_measure.py --out <dir>` then `shapes_sheet.py --run <dir>`; `python3 -B
docs/look/organic/composition_study.py all | frame <still> --caption --subject x0,y0,x1,y1`; `light.md` §11; `bash
src/look/light_s1/bake/run.sh` (proof 2); `python3 -B scripts/look/organic/organic_proof.py [--check]` (proof 1, with
its scratch tools: `organic_proof.md` §9). `index.jpg` is the nine sheets downsized and labelled by a one-off Pillow
script kept outside the repo (this run's scratchpad, `organic_index/make_index.py`); the sheet is the record.
