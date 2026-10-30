# ORGANIC shapes: why our design reads "too square and proper", measured, and the rules that close it (research, 2026-10-30)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "5 and 6 and 7
think that's the biggest difference we need to find a way to solve properly. It feels like a lot of our design is too
square and proper like I can see shapes and angles very clearly while references are obviously not like that. They are
more regular more naturally blend Do deep research into techniques libraries etc" (5 = brushwork with intent, 6 =
shape variety and rhythm, 7 = lost-and-found edges); "8 agreed this is an important point about scene composition";
"4 I think we need to find a balance I think even in the references the close objects are more sharp while further
objects are more like brushes and painting". The playbook rules this feeds: ORGANIC, NOT GEOMETRIC; SCENE COMPOSITION;
PAINTED PIECES (`docs/OWNER_PLAYBOOK.md`).

**What this is.** The SHAPES lane of the organic research: matching crops of still v6 and the references (sky, cloud,
tree, building, ground, people), their shape edges measured with the same code at phone scale, the gaps in numbers, the
design and procedural rules that close each gap (with numbers), and seeded generators for organic silhouettes, proven
on before/after panels measured with the references' code. The siblings: `techniques.md` (rendering techniques, the
edge pass, the dose table by plane), `libraries.md` (open-source code), `light.md` (proper light). **Rank:** research
notes, the lowest rank (DIRECTION's ladder); nothing here is a rule until it is integrated into `docs/look/ORGANIC.md`,
`CRAFT.md` or `PAINT_RECIPES.md`. We learn methods; no reference is copied, traced or used as input (they are only
measured), and no living artist is a style target.

| File | What |
|---|---|
| `shapes.md` | this report |
| `shapes_sheet.png` | the measures side by side: 15 small multiples (ours against every reference, per element) and the 54 crops with their edge-class overlays |
| `shapes_generators.png` | the generators' proof: five before / after panels (cumulus, banks and streaks, a tree crown, a facade, paving) with their overlays and measured numbers |
| `shapes_crops.py` | the 54 crop boxes (ours 10, painted references 23, city posters 21) |
| `shapes_lib.py` | the measures (pure numpy / SciPy / OpenCV / scikit-image, deterministic) |
| `shapes_measure.py` | runs the measures on every crop: `shapes_data.json` + overlays |
| `shapes_sheet.py` | draws `shapes_sheet.png` from a run (matplotlib, sheet only) |
| `shapes_gen.py` | the generators: noise-displaced outlines, ellipse unions on size ladders, cumulus, tree crown, bank, streak, limb, hand-cut outlines, lost-and-found edge alpha, flat 3-value light, placement without tangents, the checks |
| `shapes_generators_sheet.py` | the before/after panels, their measures, a seed check (six unpicked seeds per generator), `shapes_generators.png` |

## 0. Bottom line

- **"I can see shapes and angles very clearly" is measurable, and it is six things** (§2; ours against the painted
  references' median, the city posters in brackets; every picture at the phone's width through the same JPEG codec):
  1. **Primitives.** Our edges are made of constant-curvature pieces: on the facade 76 % of the visible edge length
     is straight (painted refs 29 %, posters 47 %), on the paving 80 % (refs 27 %), on her 55 % (refs 6 %); our
     cumulus is 27 % compass arcs (refs 10 %, a union of circles measures 83 %).
  2. **Ruler lines.** Straight runs of 60 px or more: facade 54 % of its edge length, paving 68 %, the low sky's
     streaks 58 %, her 39 %; the painted refs' medians are 0-9 % per element (the posters' 0-33 %).
  3. **Right angles and parallels.** 40-42 % of our building corners are 83-97 degrees (refs 21 %, posters 28 %); 93 %
     of the facade's straight length has a parallel partner within 3 degrees (refs 71 %). Pooled over every crop, 27 %
     of our corners are right angles against 16 % in the painted refs, which turn more obtuse (120-150 degrees: 28 %
     against our 19 %).
  4. **Clean, crisp steps.** Our edges are one clean step along their whole length: crisp (10-90 % width <= 2 px) on
     73 % of the facade's clean edges, 86 % of the paving's, 75 % of hers (refs 57 %, 38 %, 46 %); "broken" (no clean
     step: brush, texture along the edge) on 5-34 % of our solid pieces' mass boundaries against 45-58 % for the
     painted refs' buildings, ground and people. The masses never melt: lost edges are 1 % on our ground and tree (refs 13 % and
     10 %).
  5. **Symmetry and repetition.** Our shapes are their own mirror images: median mirror IoU 0.78 (facade), 0.88 (far
     city), 0.87 (paving), 0.90 (the man) against the painted refs' 0.54-0.56 for the same elements; 24 % of the far
     city's shapes have a near-twin neighbour (refs 2 %).
  6. **No dominant shape, too many small ones.** On the facade the biggest shape holds 4 % of the shape area (refs 13 %,
     a dominant mass); our tree is 67 % small shapes by area (the painted trees 34 %, with 44 % medium).
- **Not the gap (measured nulls).** The amount of wiggle in the outlines: per octave, from 6 to 400 px wavelengths, the
  RMS displacement is 2-3 % of the wavelength (about 2.5 %) for ours and the references alike. What differs is its KIND: ours
  sits in corners and in the cusps between circles, with constant curvature between; theirs is spread along free
  curves. So "add noise" alone is not the fix: replace the constant-curvature pieces, break the ruler lines, vary the
  edge along its length. Spacing regularity and the size-ladder ratio do not separate us either.
- **The fix, in three layers** (§3, with numbers): (a) **design**: natural silhouettes from ellipse unions on size
  ladders, displaced by value noise; man-made shapes hand-cut, worn at the corners, broken by overlaps and lost
  stretches, never a frontal grid of identical rectangles, each window with one asymmetric element; a dominant mass
  per element; (b) **procedure**: the generators in `shapes_gen.py` (§4), seeded and deterministic; (c) **edges**:
  found where the light and the focus are, lost and broken elsewhere (the edge pass of `techniques.md` §3.6, with the
  per-element targets of §3.3 here).
- **Proof** (§5, `shapes_generators.png`): the generators move every panel toward the references on the measures that
  matter (numbers in §5); the seed check shows it holds for unpicked seeds.
- **Next step:** the generators feed the v7 iteration still that `techniques.md` §6 proposes (v6 + design variation +
  edges by intent); measure it with `shapes_measure.py` on the same crop boxes against the targets of §6.

## 1. The measures

### 1.1 The crops

`shapes_crops.py`: 54 crops in px of each picture resized to 1080 px wide (the phone's width), every one clear of the
phone UI, the posters' titles and the captions. Each picture goes through the same codec (JPEG q85) before measuring, so
our PNG and the phone screenshots are compared alike.

| Element | Ours (v6) | Painted references (refs_human_scale, refs_paint) | City posters |
|---|---|---|---|
| Sky | the upper sky with its hatch and mid bank; the low sky with streaks, sun and flock | 01 sunset streaks, 02 night wisps, 03 dusk banks, p01 dusk, p02 day | 01, 02 aurora, 05 |
| Cloud | the near cumulus | 02, 03, 04 (the glowing cumulus), p01, p02 | 01, 05 |
| Tree | the near tree | 02 trees left and right | 01, 03, 04, 05 domes, 07 maple and pine |
| Building | the facade (the subject's); the far city and tower | 01 towers, 02 shelter, p01 van, p02 lighthouse | 02, 03, 04, 05, 06 |
| Ground | the paving; the near ground and props | 01 hill, 02 reeds and road, 03 foam and sand, p01 sand, p02 rocks | 05 road, 06 quay |
| People | her in the door (the crop includes the door jambs); the man at the right | 01 two on the hill, 02 the sitter, 03 the couple, 04 the girl | 03 rider |

The painted references are the target (the owner's models are `refs_human_scale/02` and `03`); the posters are the
clean, designed end of the range, and the right comparison for man-made pieces.

### 1.2 Definitions

All lengths are px of a 1080-px-wide frame. Code: `shapes_lib.py`; run: `shapes_measure.py`.

- **Visible edges:** a colour Canny on CIELAB (Di Zenzo's gradient, chroma read at 2 px for the codec's 4:2:0 and
  weighted 0.7) at sigma 1 px, hysteresis 2.0 / 1.0 dE per px (a crisp step of about 5.5 dE passes), thinned, linked
  into sub-pixel chains; chains under 16 px are texture, not shape.
- **Straight run:** 21 px of arc within 0.06 px RMS of a line, merged, and every run within 0.4 px (or 0.6 % of its
  length) of ONE line. **Ruler line:** a straight run of 60 px or more.
- **Compass arc:** 31 px of arc within 0.12 px RMS of a circle (radius 4-600 px), not straight, every run within
  0.6 px of one circle and turning at least 25 degrees. **Free:** neither.
- **Corner:** at least 35 degrees of turn within +-3 px, most of the +-8 px turn there; its angle is the interior angle
  (180 minus the turn); under 20 degrees is a line end or a spike. **Right angle:** 83-97 degrees.
- **Curvature variance:** of the free and arc points (corners and straight runs left out), curvature times the curve's
  size.
- **Parallel:** a straight run with another within 3 degrees, 3-30 px away, overlapping by half the shorter.
- **Axis:** the share of edge length within 2 degrees of horizontal or vertical.
- **Edge width (gradient width):** across each edge every 3 px, three parallel profiles averaged, out to 20 px or 85 %
  of the way to the next edge, projected on the step's colour direction and fitted with an erf: the 10-90 % width is
  2.563 sigma. Kinds: a clean step; **broken** (not one step: brush, texture, two edges close); no edge (a step under
  4 dE); a thin line (a ridge of 6 dE or more).
- **Crisp / firm / soft / lost:** 10-90 % width <= 2 / 2-6 / 6-16 / over 16 px (or a step under 4 dE).
- **Mass edges:** the same detector at sigma 3 px (the big value masses' boundaries), widths read out to 28 px.
- **Clear geometric edge:** a sample that is straight or arc AND clearly seen (a clean step of 12 dE or more, 10-90 %
  width <= 6 px, or a line), in px of edge per 100 x 100 px of picture: "I can see shapes and angles clearly" as one
  number.
- **Visible shapes:** Felzenszwalb's graph segmentation on CIELAB, adjacent regions under 6 dE merged, anti-aliasing and
  codec slivers absorbed. On them: **mirror symmetry** (the best IoU of a shape with its own mirror image over axes every
  7.5 degrees through its centroid), **neighbour likeness** (each shape against its 6 nearest of a similar size, at
  equal area, best over rotations; a **twin** is >= 0.85 alike and >= 0.8 in area), **spacing CV** (nearest neighbours
  of a similar size: ~0 on a grid, ~0.5 random), the **size ladder** (the biggest shape's share of the shape area, the
  next 3, the rest; the mean ratio of neighbouring sizes among the 12 largest), the **divider dimension** (Richardson's,
  rulers 2-16 px: 1.0 = smooth or ruled; natural coastlines 1.1-1.3) and the **roughness spectrum** (the outline
  smoothed at sigma 1, 2, 4 ... 64 px; the RMS normal displacement between neighbouring scales, per octave).
- **Along the masses' boundaries:** the 2-value notan (the first principal component of CIELAB, blurred 2 px, Otsu)
  traced as outlines that run on where the edge is lost; read every 3 px as found (a clean step >= 8 dE, width <= 6 px),
  soft, lost or broken; an outline **alternates** when it has a found run and a soft-or-lost run of 15 px each.

### 1.3 Calibration (synthetic shapes through the same codec)

| Synthetic shape | straight | ruler | arc | free | right angles | D | crisp |
|---|---|---|---|---|---|---|---|
| a rectangle (axis-aligned or turned 17 degrees) | 99 % | 99 % | 0 | 1 % | 100 % (89-90 degrees) | 1.009 | 100 % |
| a circle, r 110 or r 30 | 0 | 0 | 100 % | 0 | - | 1.00 | 100 % |
| a union of 7 circles (our billow design) | 0 | 0 | 83 % | 17 % (the cusps) | cusps 90-147 degrees | 1.012 | - |
| a blob, smooth noise at 2 % of R | 52 % | 8 % | 8 % | 41 % | - | 1.001 | 100 % |
| a blob, 5 % of R | 6 % | 0 | 18 % | 77 % | - | 1.003 | 99 % |
| a blob, 10 % / 20 % of R | 0 | 0 | 0 | 100 % | - | 1.010 / 1.032 | 99 % |
| a window grid (5 x 4) | 96 % | 0 | 0 | 4 % | 100 % | 1.037 | 98 % |
| a hand-cut rectangle (2-3 cuts a side, joints jogging +-2.5 px, like `edges/rough.ts` `cutPoly`) | 99 % | 99 % | 0 | 1 % | 100 % (87-94 degrees) | 1.007 | 100 % |

Edge width: blurred steps of sigma 0.3 / 0.7 / 1.5 / 3 / 6 / 9 px measure 1.37 / 2.24 / 3.99 / 7.80 / 15.3 / 23.4 px
against the expected 1.07 / 1.94 / 3.92 / 7.72 / 15.4 / 23.1 (the codec adds ~0.3 px at the crisp end). The codec's
noise on a ruler edge is 0.013 px RMS (the line tolerance is 0.06); on a circle 0.02-0.03 (the arc tolerance 0.12).

Three readings matter for the rules: **a smooth, low-frequency wobble stays locally straight** (the 2 % blob is 52 %
straight: our `edges/rough.ts` `organic()`, resampled every 26 px with 3-21 harmonics per loop, makes such outlines);
**hand-cut corners off by 1.5-4 degrees still read as right angles** and its 2.5 px jogs leave every piece a ruler
line; **a union of circles is a compass drawing** (83 % arcs), which is how `lib/clouds.tsx` builds the hero cumulus.

### 1.4 Caveats

The references are phone screenshots (rescaled, re-compressed): that softens them a little, far less than the gaps
measured (a crisp step measures 1.4 px; our facade's median edge is 1.55 px, the bus shelter's 3.3). Crops carry
context (her crop holds the door jambs; the people crops hold their backgrounds), so read people with that in mind. The
painted tree has only two crops (refs_human_scale 02); the posters' six trees widen that range. Chain-based measures
cannot see an edge that is fully lost (no chain is found there), which is why the along-boundary measure exists; it is
dominated by "broken" in textured references and is reported only where it separates (§2.2, §2.5).

## 2. The gap, element by element

Ours (both crops where there are two) against the painted references' median [range] and the posters' median [range].
Bold = a gap outside the references' whole range or far from their median. Every number is in `shapes_data.json`
(`/tmp/organic/shapes/run2` on the run that made the sheet; rerun §9).

### 2.1 Sky

| Measure | Ours: upper sky / low sky | Painted refs | Posters |
|---|---|---|---|
| straight | 9 % / **74 %** | 19 % [12-39] | 3 % [0-23] |
| ruler lines | 0 / **58 %** | 9 % [0-17] | 0 |
| compass arcs | **27 %** / 0 | 2 % [0-7] | 0 |
| clear geometric (px / 100 x 100) | 9.5 / **71** | 5.9 [1.3-40] | 0.2 [0-0.5] |
| crisp visible edges | 4 % / 65 % | 28 % [8-58] | 29 % [9-50] |
| lost mass edges | 9 % / 4 % | 10 % [1-43] | 9 % [0-18] |
| broken mass edges | **4 %** / 22 % | 29 % [11-36] | 16 % [0-32] |
| mirror symmetry | 0.22 / **0.81** | 0.57 [0.45-0.79] | 0.64 |

Reading: the low sky's streaks are constant-width straight bars (a ruler line each, all parallel: 76 %), where the
references' streaks swell, pinch and break; the upper sky's bank edge is compass arcs. The open sky's hatch is calm and
fine (its numbers sit with the references).

### 2.2 Cloud

| Measure | Ours (near cumulus) | Painted refs | Posters |
|---|---|---|---|
| compass arcs | **27 %** | 10 % [0-18] | 0 |
| free curve | 73 % | 84 % [57-98] | 64 % |
| corners per 100 px | **0.71** | 1.88 [0.77-2.47] | 0.75 |
| visible edge width, median | 7.8 px | 3.0 [1.9-7.6] | 2.3 |
| crisp visible edges | **1 %** | 24 % [6-58] | 48 % |
| soft visible edges | **59 %** | 22 % [6-65] | 10 % |
| lost mass edges | 15 % | 18 % [7-29] | 3 % |
| broken mass edges | **7 %** | 24 % [15-32] | 14 % |
| outline alternates found / lost (share of boundary length) | **44 %** | 81 % [34-100] | 50 % |
| near-equal neighbouring sizes (ratio >= 0.85) | **45 %** | 18 % [0-73] | 18 % |
| clear geometric | 26 | 4.9 [0-42] | 20 |

Reading: our cumulus is a compass drawing (circles) with ONE edge quality all round: uniformly soft (59 % soft, 1 %
crisp). The references' clouds are crisp and ragged where they meet the light, soft and lost elsewhere, alternating
along the same outline, with jags and dry-brush breaks (2.6 times our corners per px).

### 2.3 Tree

| Measure | Ours (near tree) | Painted refs (02 trees) | Posters |
|---|---|---|---|
| straight | **15 %** | 1 % [0-3] | 22 % [6-56] |
| ruler lines | **9 %** | 0 | 3 % [2-37] |
| visible edge width, median | **1.8 px** | 4.3 [4.2-4.4] | 2.0 [1.7-2.2] |
| crisp visible edges | **58 %** | 20 % [17-23] | 54 % [45-72] |
| lost mass edges | **1 %** | 10 % [7-13] | 2 % [0-3] |
| shape area: biggest / next 3 / the rest | 14 / 19 / **67 %** | 22 / 44 / 34 % | 8 / 14 / 76 % |
| edge density (px per 1000 px^2) | **62** | 26 [25-26] | 70 [49-106] |
| clear geometric | **62** | 2.6 [0-5.1] | 105 [10-179] |

Reading: our tree is drawn like a poster tree (crisp, many small clumps, ruler-straight trunk and planter) but sits in
a frame whose other natural pieces are painted: "a weird looking tree ... doesn't fit the style there" (the owner, on
v6). The painted trees are a few medium masses with soft, lost edges and half the edge density.

### 2.4 Building

| Measure | Ours: facade / far city | Painted refs | Posters |
|---|---|---|---|
| straight | **76 %** / 47 % | 29 % [24-53] | 47 % [34-59] |
| ruler lines | **54 %** / 27 % | 6 % [5-42] | 15 % [7-31] |
| right-angle corners | **40 %** / **42 %** | 21 % [12-33] | 28 % [17-41] |
| parallels | **93 %** / 66 % | 71 % [59-99] | 82 % [72-91] |
| on the axes (within 2 degrees of H / V) | **62 %** / 57 % | 34 % [22-55] | 45 % [37-55] |
| broken visible edges | **25 %** / 33 % | 58 % [38-62] | 61 % [39-63] |
| broken mass edges | **22 %** / 34 % | 51 % [40-58] | 44 % [33-59] |
| mirror symmetry | **0.78** / **0.88** | 0.55 [0.49-0.58] | 0.63 [0.58-0.65] |
| neighbour likeness / twins | 0.62 / 0.72; twins 8 % / **24 %** | 0.55; 2 % [0-10] | 0.58; 6 % |
| divider dimension D | **1.048** / **1.062** | 1.13 [1.06-1.15] | 1.11 [1.07-1.13] |
| curvature variance | **5.5** / 1.8 | 1.2 [0.5-2.3] | 1.0 [0.5-1.2] |
| biggest shape's share | **4 %** / 30 % | 13 % [8-28] | 5 % [2-34] |

Reading: the facade is, with the paving and the low sky, among the most geometric of the 54 crops: a frontal
elevation (62 % of its edges on the axes), a grid of near-identical rectangles (mirror IoU 0.78), ruler edges as one
clean step. Its curvature comes in spikes (rounded
rectangle corners) and zeros (rulers): the 5.5 variance. The references' buildings are just as man-made and still
read hand-made: their straight edges are shorter (6 % ruler), broken along their length (58 % broken), seen at an
angle, and nothing repeats.

### 2.5 Ground

| Measure | Ours: paving / near ground | Painted refs | Posters |
|---|---|---|---|
| straight | **80 %** / 60 % | 27 % [2-61] | 48 % |
| ruler lines | **68 %** / 34 % | 8 % [0-47] | 33 % |
| crisp visible edges | **86 %** / 66 % | 38 % [29-61] | 73 % |
| visible edge width, median | 1.5 / 1.65 px | 2.5 [1.8-4.1] | 1.5 |
| lost mass edges | **1 %** / **1 %** | 13 % [2-27] | 3 % |
| broken mass edges | **14 %** / **14 %** | 58 % [29-60] | 29 % |
| along the mass boundaries: found / soft or lost | **48 % / 0** (paving) | 7 % / 10 % | 21 % / 4 % |
| mirror symmetry | **0.87** / 0.76 | 0.56 [0.41-0.63] | 0.68 |
| edge density | 25 / 33 | 68 [32-114] | 63 |

Reading: our ground has few edges, but they are long, crisp, parallel joints that cross the frame (the receding
paving lines and the canal edge). The references' grounds carry twice the edges, but short, broken and soft (marks,
pebbles, foam, grass), and their masses melt (13 % lost).

### 2.6 People

| Measure | Ours: her / the man | Painted refs | Poster (03 rider) |
|---|---|---|---|
| straight | **55 %** / **22 %** | 6 % [3-12] | 12 % |
| ruler lines | **39 %** / 0 | 0 | 0 |
| free curve | **40 %** / 69 % | 91 % [89-97] | 78 % |
| right-angle corners | **36 %** / 14 % | 7 % [0-27] | 5 % |
| crisp mass edges | **75 %** / **67 %** | 31 % [18-61] | 69 % |
| broken mass edges | 19 % / **5 %** | 45 % [23-57] | 70 % |
| mirror symmetry | 0.70 / **0.90** | 0.54 [0.38-0.68] | 0.43 |
| divider dimension D | **1.084** / - | 1.18 [1.15-1.21] | 1.22 |

Reading: part of her straightness is the door frame in her crop, but the man is a near-mirror-symmetric shape (0.90)
and both are crisp clean steps all round. The people stay crisp by rule (the subject and faces are never painted), so
the shape gap here is closed by silhouettes (asymmetric poses, overlapping limbs, free outlines), not by softening.
The people lane (`paint_recipes/people.md`, the painterly people work in progress) owns the figures; these numbers are
for its check.

### 2.7 Across all crops

- **Corner angles** (pooled, every crop's histogram normalised): right angles (83-97 degrees) are 27 % of our corners,
  16 % of the painted refs', 22 % of the posters'; corners within 75-105 degrees 36 % / 26 % / 32 %. The painted refs
  turn obtuse: 120-150 degrees is 28 % of their corners (ours 19 %).
- **Outline wiggle per octave** (the roughness spectrum, every shape over 80 px of perimeter): the RMS displacement is
  2-3 % of the wavelength in every octave from 6 to 400 px, for ours and the references alike (e.g. buildings,
  small shapes: ours 0.18 / 0.47 / 1.15 / 2.03 px at wavelengths 6-13 / 13-25 / 25-50 / 50-100 px; painted refs 0.20 /
  0.49 / 1.09 / 2.20). The amount is not the gap; its kind is (corners and cusps against free curves).
- **Spacing regularity** (CV 0.6-1.3 everywhere) and **the size-ladder ratio** (0.7-0.95) do not separate us.

## 3. The rules (design and procedure), with numbers

Each rule names the gap it closes (§2), the number to hit (from the painted references unless said), and the
generator or engine piece that does it (§4). Lengths in px of the 1080 x 1920 frame; R = a shape's equivalent radius
(sqrt(area / pi)).

### 3.1 Natural silhouettes: free curves, never compass arcs (clouds, foliage, rocks, cast shadows, water edges)

- **Build from ellipses, not circles,** on a size ladder, then displace. Each billow, lobe or clump is an ellipse
  (aspect 0.6-0.98, tilted +-12-20 degrees), sunk into its parent by 35-75 % of its own radius; each level 0.28-0.55 of
  its parent's radius; three levels near (lobe, clump, small clump), two on plane +2, one on +3 and beyond.
- **Overlap or gap, never kiss:** two shapes overlap by 18-40 % of the smaller radius or keep a gap of at least 12 %;
  the band between is a tangent and is never drawn (`shapes_gen.place`, `tangents()`).
- **Neighbouring sizes never within 10 %;** each next size 0.55-0.85 of the last (`size_ladder`, the billows' radius
  rule).
- **Displace the union's outline by value noise** (never sines: they repeat) along its normal, in octaves at the short
  end only (the big lobes come from the ellipses): clouds, wavelengths <= 0.5 R: 0.4 R (min 10 px) at 2.2 % of R (min
  1.0 px RMS), 0.2 R (min 6 px) at 1.3 % (min 0.8 px) and 0.1 R (min 4 px) at 0.7 % (min 0.6 px); foliage, wavelengths
  <= 0.25 R: 0.25 R (min 7 px) at 2.5 % of R (min 1 px) and 0.1 R (min 4 px) at 1.2 % (min 0.7 px). The SHORT octave
  is the one that matters: measured on six unpicked cumulus seeds, without the 0.1 R octave 11-20 % of the edge stayed
  compass arcs (the 0.2-0.4 R octaves look smooth inside a 31 px window); with it, 0-4 % (§5). The floors keep a small
  or far shape off the compass. The undersides (a cloud's base, a pad's belly) take 20-40 % of that amplitude: flat and
  quiet, as in the references.
- **Targets on the finished piece** (`shapes_measure.py`): compass arcs <= 10 % of its edge length (refs' median; ours
  27 %), straight <= 10 % (a cloud's flat base excepted: a level base is a third of an isolated cumulus's outline),
  free >= 80 %, corners per 100 px >= 1.2 on clouds (refs 1.9: jags and breaks). The divider dimension of the
  references (clouds 1.09-1.15, foliage 1.18-1.23) comes mostly from brush texture at 2-16 px: flat generated shapes
  stay at 1.02-1.06 and reach it only with the paint pass (P2-P3 marks, edge teeth), so D is a check on the painted
  piece, not on the silhouette.
- **Asymmetry:** the biggest tower or lobe off-centre by 2-16 % of the width, toward the light or the lean; inner shapes
  (lit caps, shade masses) mirror IoU <= 0.7. A whole isolated dome (a cumulus, a crown) measures 0.66-0.86 by nature:
  never above 0.9, and never a mirror-symmetric template.
- **Clouds specifically:** a flat base tilted <= 1.5 degrees; 2-4 towers of similar but never equal height (ratio
  0.62-0.9) over a low skirt (12-20 % of the height) whose two ends taper at different rates (6-14 % and 10-22 % of
  the width); banks and decks as long thin bodies whose thickness swells in 2-4 humps (ladder 0.45-0.8), the two ends
  dragged thin over 10-30 % and 25-50 % of the length, sometimes pinched in two; a tail ends at 2 px, never a
  hairline (it would twinkle in the float).
- **Sky streaks:** never a constant-width bar. Thickness swells and pinches +-35 % along it, the two ends taper over
  15-30 % at different rates, the centre line bows and wanders by 0.25 of the thickness, more of the thickness above
  or below the centre line (`streak()`).
- **Trees:** a body wider than tall with its underside flattened (a slight lens), 3-5 big lobes over its upper
  three-quarters (never evenly spaced; the biggest toward the lean), 2-4 clumps half sunk on each lobe's outer arc,
  small clumps on a third of those; 1-3 sky gaps where lobes meet; the trunk and limbs tapered, bowed (5 % of their
  length), with a root flare, entering the crown (`crown()`, `limb()`). By area: the biggest mass 20-30 %, medium
  35-45 %, small <= 40 % (our v6 tree: 67 % small).

### 3.2 Man-made shapes: straight, but drawn

Man-made things stay straight (a noise wobble on them reads melted: `techniques.md` §3.7); what makes the references'
buildings read hand-made is how the straight edges are cut, broken and varied:

- **No ruler line reads unbroken on planes 0 to +2:** ruler lines (straight runs >= 60 px) <= 15 % of a crop's edge
  length (refs' median 6 %, posters 15 %; our facade 54 %, paving 68 %). Break a long edge with an overlap (foliage,
  a person, a prop, a lamp post), a value change along it (a lost stretch over 10-30 % of its length where it meets a
  close value), a joint that stops, a chip. A hand-cut side (`cutPoly`) does NOT break it (calibration: 99 % ruler).
- **Corners worn, not razor:** every man-made corner rounded 2-3.5 px at the frame's scale (a window, a door, a
  sill). That softens the read but does not move the right-angle count (a 3.5 px rounding still turns 90 degrees inside
  the +-3 px window: the proof facade keeps 58 % right angles, §5). The count falls only by the view and by breaks: a
  hero building seen turned 15-30 degrees off frontal (a two-point view, its receding corners at 60-80 and 100-120
  degrees in the picture), and corners broken by overlaps, lost stretches and edge strokes. Target: corners in the
  picture <= 25 % right angles (refs 21 %, ours 40-42 %); a frontal elevation is allowed where the shot needs it, and
  then its corners are broken.
- **Two faces per volume, the shade face at an angle:** the lit face and a shade face whose far edge meets the air at
  a close value and is LOST over 25-40 % of its length (`edge_alpha`, found 0.25, lost 0.35).
- **No template:** windows, panels, flags and planks vary in size by 5-12 %, position by +-1.5 px, and state (lit,
  dark, sky-reflecting, curtained), never the same state twice running (`vary_rects`); twins <= 5 % of shapes (refs
  2 %; our far city 24 %).
- **No mirror images:** every repeated man-made element carries one asymmetric thing (a curtain drawn to one side, a
  blind at its own height, a sky reflection across one upper corner, a lamp, a plant): median mirror IoU of a
  building crop's shapes <= 0.65 (refs 0.55, posters 0.63; ours 0.78-0.88).
- **Accidental parallels:** two straight edges within 3 degrees, 3-30 px apart and overlapping by half are either
  designed (a window's two jambs, a rail's two edges) or moved: the parallel share <= 75 % of the straight length
  (refs 71 %; our facade 93 %); edge length on the axes (within 2 degrees of horizontal or vertical) <= 50 % (refs 34 %;
  our facade 62 %).
- **Edges broken along their length:** 40-60 % of a building's mass boundary "broken" (brush marks, texture or edge
  strokes along the edge: `techniques.md` §3.6) against our 22-34 %; the subject's building keeps its found edges on
  the lit side and at the door.
- **Ground:** joints, planks and kerbs never cross the frame: a joint runs <= 25 % of the frame's width, fades with
  distance, and breaks into 2-5 pieces with lost gaps (10-25 % of its length) and faded ends (`broken_line`); the
  flags are suggested by value patches (+-3-9 L*) more than by drawn joints; cast shadows lie across them (a natural
  shape over the man-made grid).

### 3.3 Edges: lost and found by the light and the focus (closes point 7)

Targets for the finished frame, per element, measured on the mass boundaries at sigma 3 (the painted references'
range; ours in brackets):

| Element | Lost | Broken | Crisp (visible edges) | Along the boundary |
|---|---|---|---|---|
| Sky | >= 10 % (9 / 4 %) | >= 25 % (4 / 22 %) | <= 30 % (4 / 65 %) | - |
| Cloud | 15-25 % (15 %) | >= 20 % (7 %) | 15-40 %, crisp only where the light hits (1 %) | alternates on >= 70 % of its length (44 %) |
| Tree (painted plane) | >= 7 % (1 %) | >= 35 % (44 %) | <= 30 % (58 %) | - |
| Building (not the subject) | 2-5 % (1 / 4 %) | >= 40 % (22 / 34 %) | <= 60 % (73 / 61 %) | - |
| Ground | >= 10 % (1 %) | >= 40 % (14 %) | <= 45 % (86 / 66 %) | soft or lost >= 8 % (0 / 12 %) |
| People | 0-5 % | the figure's recipe | the subject stays crisp | - |

- **Found** where the light hits a form (the lit side's silhouette), where the focus is (the subject, the door), and
  where the value step is large (>= 14 L*): crisp 1-1.5 px.
- **Lost** where two close values meet (<= 4 L*: a shade face against the dusk air, a cloud's base against the sky, a
  shadow's far edge): 10-24 px, or broken by teeth along the brush direction.
- **Alternate along one outline:** every natural outline over 300 px carries at least one found and one lost stretch
  (>= 15 px each); the choice by the light (`edge_alpha`'s facing term) plus a slow noise along the outline
  (wavelength ~90-160 px) so found and lost alternate, never one quality all round.
- **The owner's balance (point 4):** near and in focus sharper, far more brush: the lost and broken shares grow and the
  crisp share falls with the plane (the dose table: `techniques.md` §5.4); here, the shape side of it: a far piece has
  one level of lobes, a mid piece two, a near piece three; a far piece's displacement sits at the floors (0.6-0.8 px).

### 3.4 Size ladders and one dominant mass (closes point 6 and point 8)

- **One dominant mass per element:** in each element's crop the biggest shape holds 15-35 % of the shape area (painted
  refs' medians: cloud 17 %, tree 22 %, building 13 %, ground 33 %, people 34 %; our facade 4 %); the next three 25-45 %;
  the rest (the small) <= 45 % (our tree 67 %, facade 85 %).
- **Ladder:** each next size 0.55-0.85 of the last, two neighbouring sizes never within 10 %; the sizes spread over
  4-7 octaves (log2 of areas, p10-p90; the painted refs' medians 3.3-7.6 by element), never one size repeated.
- **Fewer, bigger clumps inside a mass:** a near tree's clumps are 8-25 % of the crown's width, a cloud's billows
  6-20 % of its width; small marks only where a thing is fine (reeds, a flock), as PAINTED PIECES says.

### 3.5 Overlap, tangents, parallels, intervals

- Overlap 18-40 % of the smaller radius, or a gap >= 12 %; never between (`tangents()` lists the kissing pairs).
- Never two edges parallel within 3 degrees over half their length unless designed (`parallels()` lists them).
- Intervals: rows of things (posts, windows, trees, bollards, birds) never evenly spaced: the CV of the gaps >= 0.3
  (`interval_cv()`; a picket fence is 0).
- A silhouette is broken by another thing in front at least once per mass on planes 0 to +2 (a branch over a roof
  corner, reeds over a base, a person over a kerb): the overlap breaks the ruler line and the symmetry at once.

### 3.6 Where it lives in our stack

- **Vector, in the engine** (the flat design; moves perfectly; seeded per object with `lib/rng.ts`): the ellipse
  unions and their displaced outlines, the hand-cut and worn man-made outlines, the window variation, the broken joints,
  the overlaps. `src/lib/edges/rough.ts` already has `cutPoly` (keep for man-made, with worn corners and breaks added),
  `organic` (its default 26 px resampling and 3-21 harmonics make outlines that measure locally straight: give it a
  short-wavelength octave of 0.4-1 px at 10-30 px, or replace it with the value-noise octaves of §3.1) and
  `smoothClosed`. `src/lib/clouds.tsx` builds the cumulus as a union of circles (83 % arcs by calibration): its lobes
  become ellipses on the §3.1 ladder, and its outline gets the cloud octaves. The union's outline for the displacement
  comes from a path boolean (polygon-clipping, MIT) or a marching-squares trace of the raster union (d3-contour, ISC).
- **Bake, for the painted pieces** (`scripts/look/paint/paint.py`): `shapes_gen.py` runs as is (numpy, SciPy, OpenCV):
  masks for the painted cloud, the crown, the banks; `edge_alpha` re-edges a piece's mask with found, broken and lost
  stretches; `shade3` gives flat 3-value light from the silhouette itself.
- **Cost:** a generator call is 20-150 ms in Python per piece (the crown with holes is the slowest); in the engine a
  displaced outline is a polyline of ~1 point per 2 px (the cost of `techniques.md` §3.7: +7-13 ms per frame for 300
  such outlines). Motion: every outline is fixed per seed and rides its layer; never re-seeded per frame (no boil).

## 4. The generators (`shapes_gen.py`)

Reference implementations: numpy, SciPy and OpenCV only, every function a pure function of its seed (sha256 of a
string, as the paint recipes seed), the same bytes on every run. Lengths in px of the 1080 x 1920 frame.

| Function | What it makes | The numbers in it |
|---|---|---|
| `seeded(seed)` | a numpy Generator from a string | sha256, as `scripts/look/paint` |
| `loop_noise`, `line_noise`, `noise2d` | value noise (periodic along a closed outline; along an open line; 2-D fractal) | octaves as (wavelength px, RMS px); Catmull-Rom between random values, so no octave repeats |
| `displace(P, octaves, seed, billow, amp_at)` | the noise-displaced outline: resampled every 1 px, pushed along the outward normal | `billow` turns one octave into convex bumps with sharp inward cusps; `amp_at` quiets a side (a base, a belly) |
| `spectrum_for(R, element)` | the displacement octaves for a shape of size R | §3.1's table: cloud, foliage, rock, shadow, water edge |
| `size_ladder(n, seed, ratio)` | n sizes, biggest first, each 0.55-0.8 of the last | never two within 10 % |
| `billows(seed, path, r_of, ...)` | ellipses along a skyline: sizes from a function of the position, sunk 25-75 %, spaced 0.45-0.95 of two radii (overlapping, never kissing); level 2 on the outer arcs | aspect 0.6-0.98, tilt +-12 degrees |
| `raster_union(ells, box, poly)` | the union at 4x, box-reduced | anti-aliased |
| `cumulus(seed, cx, base, width, height)` | 2-4 towers (heights 0.62-0.9 of the last) over a skirt that tapers at two rates; billows in three levels; a flat base tilted <= 1.2 degrees; the cloud octaves, quiet on the base | returns the outline and R |
| `bank(seed, cx, base, length, height)` | a dusk deck or stratocumulus: 2-4 humps on a ladder, ends dragged at two rates, a near-level base, pinched in two 35 % of the time | tails end at 2 px |
| `crown(seed, cx, cy, width, height)` | a tree crown in three levels (body, 3-5 lobes, clumps, small clumps), a flat lens underside with 1-3 bites, 1-3 sky gaps where lobes meet, the foliage octaves | returns coverage, offset, outline |
| `streak(seed, x0, x1, y, thick)` | a sky streak: swelling +-35 %, two different tapers, a bowed wandering centre line | never a bar |
| `limb(seed, p0, p1, w0, w1)` | a trunk, branch or stem: bowed 5 %, tapered, a root flare, a +-0.5 px wobble | a man-made post: wobble 0, bend <= 0.4 % |
| `hand_cut(corners, seed)` | a man-made outline: each side turned 0.8-2.2 degrees (opposite sides differing by >= 1 degree), bowed 0.3-0.9 %, cut in 1-3 pieces jogging 0.3-1 px, corners rounded 0.6-3.5 px | never a noise wobble |
| `vary_rects(seed, rects)` | windows or panels without a template: sizes +-5-12 %, positions +-1.5 px, states never twice running | twins nudged apart |
| `broken_line(seed, p0, p1, width)` | a joint, mullion or rail: width +-30 %, a 0.4 % bow, 2-5 pieces with lost gaps (10-25 %), faded ends | |
| `edge_alpha(cov, seed, light, ...)` | lost and found for a raster piece: found (crisp ~1.2 px) where the outline faces the light, lost (16-28 px) away from it, broken (dry-brush teeth 2-6 px deep, >= 2 px wide, along the brush direction) between; a slow noise along the outline makes them alternate | the shares found / lost are parameters |
| `shade3(cov, seed, light, ...)` | flat lit / body / shade values read from the silhouette (a dome height from the distance inside, normals at the billow scale over the mass scale) with a wandering terminator | never a crescent along the outline, never a ruler terminator |
| `place(seed, box, sizes)`, `tangents()`, `parallels()`, `interval_cv()` | placement that overlaps or keeps a gap, never kisses; the checks of §3.5 | |

**Porting to the engine.** Every function is 10-60 lines of arithmetic on point lists or masks; the TypeScript port
needs only `lib/rng.ts` (seeded draws), a value-noise helper, and for the unions either SVG's nonzero fill (when the
outline need not be displaced) or polygon-clipping (MIT) / d3-contour (ISC) to get the union's outline.

## 5. Proof: before and after (`shapes_generators.png`)

PROOF_TABLE_PLACEHOLDER

## 6. Checks for the next still (v7, an iteration)

Run `shapes_measure.py` on the new still with the same crop boxes (only `SRC['ours_v6']` changes), then
`shapes_sheet.py`. The targets (the painted references' range; the subject's own edges measured separately):

| Measure | Sky | Cloud | Tree | Building (not the subject) | Ground |
|---|---|---|---|---|---|
| straight | <= 25 % | <= 15 % (the base excepted) | <= 10 % | <= 45 % | <= 40 % |
| ruler lines | <= 10 % | <= 5 % | <= 3 % | <= 15 % | <= 15 % |
| compass arcs | <= 5 % | <= 10 % | <= 5 % | - | - |
| right-angle corners | - | - | - | <= 25 % | <= 10 % |
| mirror symmetry | <= 0.65 | <= 0.65 | <= 0.6 | <= 0.65 | <= 0.65 |
| lost mass edges | >= 10 % | 15-25 % | >= 7 % | 2-5 % | >= 10 % |
| broken mass edges | >= 25 % | >= 20 % | >= 35 % | >= 40 % | >= 40 % |
| clear geometric (px / 100 x 100) | <= 10 | <= 15 | <= 20 | <= 60 | <= 45 |

The numbers only warn; the owner's eye at phone size beside v6 and the two models (`refs_human_scale/02`, `03`) decides.

## 7. Libraries and licences

| Library | Use here | Licence (checked 2026-10-30) |
|---|---|---|
| numpy | everything | BSD-3-Clause (wheel metadata; bundled parts 0BSD / MIT / Zlib) |
| SciPy | filters, distance transforms, erf, labels | BSD-3-Clause |
| OpenCV (`opencv-python-headless` 5.0.0) | raster unions, contours, distance transforms, remaps | Apache-2.0 |
| scikit-image 0.26 | Felzenszwalb segmentation, region graphs, marching squares | BSD-3-Clause |
| matplotlib 3.11 | the two sheets only (installed in `/tmp/organic/shapes/venv`, never in the repo) | Matplotlib licence (PSF-based, BSD-compatible) |
| polygon-clipping 0.15.7 (npm) | optional: the union's outline in the engine | MIT |
| d3-contour 4.0.2 (npm) | optional: marching squares in the engine | ISC |
| simplex-noise 4.0.3 (npm) | optional: seeded noise in JS (value noise as here is ~20 lines) | MIT |
| clipper2-js 1.2.4 / clipper-lib 6.4.2 (npm) | optional: offsets and booleans | Boost Software License 1.0 |
| **Mixbox** | never (non-commercial) | CC BY-NC 4.0 |

Nothing here needs a library outside the repo's Python bake stack; the engine port needs none (the npm ones are
options).

## 8. Doc clashes found (flagged for the orchestrator, not edited here)

- **`src/lib/clouds.tsx`** builds the hero cumulus as "a union of circles" with "soft edges where it thins as 2 flat
  steps": by calibration that is 83 % compass arcs, and the v6 cloud measures 27 % arcs and one soft edge quality all
  round (§2.2). The playbook's ORGANIC, NOT GEOMETRIC (2026-10-30) wins; the proposed reading: ellipses on a ladder
  with the cloud octaves, and found / lost stretches by the light (§3.1, §3.3).
- **`src/lib/edges/rough.ts` `organic()`** (3-21 harmonics per loop, resampled every 26 px) gives smooth wobbles that
  measure as straight lines and arcs locally (§1.3): fine for a sketch line, not for a natural silhouette under the
  new rule.
- **`paint_recipes/foliage.md` §4.1's crown** ("9 pads ... a leafy edge of clumps out and notches in") and v6's tree
  measure 67 % small shapes by area and 58 % crisp edges; the owner called v6's tree out of style. §3.1's trees (three
  levels, fewer and bigger clumps, a flat underside) and §3.3's tree edges are the proposed reading.
- **CRAFT §c "Thin lines twinkle" / flecks >= 2 px** agrees with §3.1 (tails end at 2 px; teeth >= 2 px wide); no
  clash, noted because `edge_alpha`'s teeth must keep it (the proof's banks still show a few finer flecks: fix before
  production).

## 9. Rerun

All from `video/`; scratch in `/tmp/organic/shapes/` (nothing installs into the repo).

```
python3 -m venv /tmp/organic/shapes/venv && /tmp/organic/shapes/venv/bin/pip install numpy scipy opencv-python-headless scikit-image matplotlib
python3 docs/look/organic/shapes_measure.py --out /tmp/organic/shapes/run2          # 54 crops, ~8 min on one core
python3 docs/look/organic/shapes_measure.py --out /tmp/organic/shapes/run2 --add-along   # only the along-boundary numbers
/tmp/organic/shapes/venv/bin/python docs/look/organic/shapes_sheet.py --run /tmp/organic/shapes/run2
/tmp/organic/shapes/venv/bin/python docs/look/organic/shapes_generators_sheet.py --sheet   # panels, seed check, sheet
```

The measures and the generators are deterministic (no unseeded draws): the same numbers and bytes on every run.

## 10. Sources (methods only)

1. J. Canny, "A computational approach to edge detection", IEEE PAMI 8(6), 1986 (the edge detector).
2. S. Di Zenzo, "A note on the gradient of a multi-image", CVGIP 33, 1986 (the colour gradient).
3. P. Felzenszwalb, D. Huttenlocher, "Efficient graph-based image segmentation", IJCV 59(2), 2004 (the visible shapes).
4. B. Mandelbrot, "How long is the coast of Britain? Statistical self-similarity and fractional dimension", Science
   156, 1967; L. F. Richardson's divider method, 1961 (the divider dimension).
5. D. Douglas, T. Peucker, "Algorithms for the reduction of the number of points required to represent a digitized
   line", Cartographica 10(2), 1973 (splitting straight runs).
6. I. Kasa, "A circle fitting procedure and its error analysis", IEEE Trans. Instrum. Meas. 25(1), 1976 (compass arcs).
7. A. W. Dow, "Composition", 1899 (notan: the 2-value design of masses).
8. R. P. Taylor et al. and B. Spehar et al. on the perceived beauty of natural fractals (preferred dimensions about
   1.3-1.5 for natural images; `techniques.md` sources 23, 25).
9. The academic painting practice of lost and found edges ("decide the hard edges first, everything else soft":
   `techniques.md` source 22) and of stylized focus (sources 16, 17).
10. Cloud morphology (cumulus towers and turrets over a flat condensation base; stratocumulus decks): any meteorology
    atlas (WMO International Cloud Atlas).
