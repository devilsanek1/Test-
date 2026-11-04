# Recipe: trees and greenery (painted pieces)

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements? Seems like you should be able to really clearly define a recipe". This is that recipe for
the greenery family: a tree crown (lit and shade masses built from painted leaf clusters), bushes in planters, grass
and wind-blown reeds (fine strokes), a near flowering plant (protea-like) and near leaves framing a corner. It sits
under the playbook's PAINTED PIECES rule and DIRECTION rule 4; its colours come from the sky recipe's dusk set
(`sky_clouds.md` 2.1), so the greenery and the sky share one light.

- **The proof:** `video/scripts/look/paint/recipes/foliage.py`, a standalone, seeded script (numpy, PIL, scipy,
  skimage; ~1700 lines). It writes `foliage_swatch.png` next to this file: each element painted at 1:1 beside the
  reference crops that show it, plus the tree and the reeds pass by pass.
  - Run it: `python3 video/scripts/look/paint/recipes/foliage.py [--phone P.png] [--check]`.
  - The six swatches paint in ~22 s on one CPU core (the near tree 2.2 s; the depth ladder's 13 trees 13 s).
  - The same seed gives the same bytes (md5 checked by `--check`, which also prints the numbers in 7.7).
- **The scene:** an October canal evening at King's Cross, a low sun on the left, the v4/v5 dusk family (lilac sky,
  peach horizon, pale warm paving). Sizes are px of the 1080 x 1920 frame.
- **The refs:** 1206 px wide phone screenshots; every ref size below is scaled to our width (x 1080 / 1206). The crops
  (and two 5x zooms of the lit mosaics) are in `/tmp/recipes/foliage/crops/`.

## 0. How close it gets (honest, after one review-and-fix round)

The first proof (the earlier run of this task) was reviewed at phone width beside the crops and failed in six
specific ways; the fix round rebuilt each element (the before/after is in the table). Judged again at 400 px wide:

| Element | First proof (before the fix) | Now, at full size | At phone width (400 px) | The gap to the refs |
|---|---|---|---|---|
| tree crown | round "broccoli" balls, mint lights speckled everywhere, a hairy edge, holes read as pink blossoms | pads with flat undersides, warm yellow-olive tops, a mosaic of lighter leaf dabs over the mid, calm shade, a leafy edge of clumps and notches, few cut holes, branches in the gaps | reads as a painted, lit, layered tree: the best of the six | the pads are too alike (rows of similar ovals: a little "topiary"); the mosaic is one scale (the refs group their dabs into bigger lit shapes); the undersides are smooth gradients, not painted; greener and more saturated than the posters' muted olive. **About 2/3 of the way.** |
| depth ladder | far trees as cloud puffs on sticks | a far tree line sitting on the bank (2 values, toward the warm air), mid trees with 3 values, the near crown cut by the frame | depth reads by value and simplicity, all edges crisp | the mid trees are the near recipe made smaller and paler; the refs' mid trees are simpler masses with fewer, bigger clumps. **About 1/2-2/3.** |
| bush in a planter | a mossy hedge, the same texture everywhere | three domes, broad dry strokes along the dome, dabs only in the light, a leafy edge, its shadow on the rim | reads as a clipped shrub | the Cape Town domes are calmer and cleaner (a flat colour + a few broad strokes); ours stays busier and lumpier. **About 1/2.** |
| reeds and grass | a "hay bale" with a sawtooth top, straw everywhere, grey vertical bars as near reeds | a soft plum-to-mauve mass with a crest of leaning plume shapes, fine blades in groups (gusts), dry plumes lit on the sun side, a short-grass verge with lit blades and flowers, dark out-of-focus plumes in the corners | reads as wind in October reeds | the refs' strokes are longer, more flowing and more numerous, with a stronger dark/light split; our mass still reads a little "furry" and the plumes one straw colour; the verge is a plain band. **About 1/2-2/3.** |
| protea | a pink star / daisy (bracts all round) | a cream dome with a radial hatch in a CUP of broad two-facet bracts that fan up, two-tone leaves | reads as a protea | the refs' bracts are bigger, broader and overlap more; the dome's texture is richer. **About 2/3.** |
| corner leaves | a row of small clip-art leaves on a line | a small branch with leaf clumps on 3 depth layers (back leaves toward the sky, the 2 nearest out of focus) | small and subtle, reads as an autumn branch | the refs' clusters are denser, overlap more and vary more in colour; ours is still a little "sprinkled". **About 1/2.** |

**Overall.** The METHOD now matches the refs: design flat masses in one light, paint dark first, lay lighter leaf
dabs on top, break the edge into leaf clumps, keep every mid and far edge crisp, move distance by value and warmth.
At phone width every element reads as what it is and as painted. What is still short is the design's variety (each
element is built from one template; the refs' shapes are drawn one by one) and the mark-making's range (the refs mix
2-3 dab scales and longer, more deliberate strokes). Section 8 lists the next steps.

---

## 1. What the references do (measured)

Sizes are px of our 1080-wide frame (the refs are 1206-wide phone screenshots: x 1080/1206).

### 1.1 Edges are CRISP everywhere except the nearest plane
10-90 % edge width across silhouettes (median, px at 1080):
- poster trees, bushes, leaves, proteas: 1.1-1.5 (Singapore tree 1.3, Cape bush domes 1.2, protea bracts 1.2,
  Singapore corner leaves 1.3, Hanoi mid tree 1.1, Hanoi far trees 1.1, Kyoto pine 1.3, Kyoto maple 1.5);
- the bus stop's mid-plane trees and reeds (02): 0.9-1.6; the hill grass (01): 0.9;
- ONLY the nearest out-of-focus reeds (02, bottom of frame): 4.5-8.6 (a defocus blur, sigma ~2-3.4 px).

So distance is carried by value, contrast and simplicity, never by blurring the mid and far planes; our v1-v5
foliage had 6-20 px smudged edges on every plane.

### 1.2 Tree crowns: 4 values in one light, built from clusters
- Kyoto pine (k-means L*): lit 55 (22 %) + top lights 77 (6 %), mid 42 (29 %), shade 30 (25 %), deep 19 (17 %).
- Hanoi mid tree: holes/lights 74 (9 %), lit 53 (22 %), mid 44 (25 %), shade 34 (25 %), deep 25 (16 %).
- Steps between neighbours 9-12 L*; lit-to-deep 28-36 L*; hue turns warm in the light (h 104-110) and cool in the
  shade (h 130-160 teal; the deepest h 200-230 in the posters, the sky's own hue at night in 02: h 282-293).
- The light is a MASS of small lit dabs covering the top-sun-side 40-55 % of each cluster, never a band along the
  outline (our v4 "crescents"). The undersides are flatter, darker and calmer.
- Lit dab size (connected lit patches): median 4.5-5.8 px, p90 10-16 px, in crowns 150-270 px wide: 2-2.6 % of the
  crown width (p90 ~5-6 %); elongated 1.7:1 (major 6.4-9.1, minor 3.7-4.8 px).
- Sky holes: 3.3-3.6 % of the crown area, 12-34 per crown, median 3.4-4.7 px (2.5-3.5 % of the crown), p90 6-12 px;
  the Kyoto pine's pads leave dark gaps instead (branches show in them).
- Branches: dark, tapering, seen in the gaps and under the crown, disappearing into the clusters.
- Far trees (Hanoi): 2-3 values (lit 56, shade 40-46), rounder, simpler clumps, same crisp edges.
- Night trees (02): 5 values all in the sky's hue (L* 15-33), the far ones paler: atmosphere by value only.

### 1.3 The lit mosaic, seen at 5x (Kyoto pine, Hanoi tree; `crops/zoom5_*.png`)
- Inside a lit zone the paint is a MOSAIC: small irregular dabs in 2-3 close light values (lit, a lighter top light)
  with the MID colour showing between them as small dark gaps. The gaps, not the dabs, make it read as leaves.
- So the lit zone's base is the mid value (L* 42 under lit 55 in the Kyoto pine: 13 L* of contrast inside the light),
  and the shade zone is calm: fewer, closer-valued marks.
- The silhouette is made of the same leaf clumps: rounded-pointed bumps 1-2 dabs wide, with notches between them.
- The pads (Kyoto) are wider than tall, with flat dark undersides; a pad in front leaves a dark band on the pad
  behind it: the layers that give the crown its depth.

### 1.4 Bushes and domes
- Cape Town domes: one flat colour each (deep green L* 30, olive L* 43), the inside brushed with broad dry strokes
  along the dome (texture std 3.3 L* at sigma 6, 1.6 L* fine grain), a lighter streak on the top; crisp circle edges.
- Singapore crowns: flat domes in 3-4 greens + one lit yellow-green, overlapping in rows, faint radial vein strokes,
  texture 4.4 L*.

### 1.5 Grass and reeds (02 bus stop, 01 hill, refs_paint 01 van)
- A MASS first: the reed bed is a dark band (L* 7-15 at night, 98 % of its pixels) with a ragged top leaning
  downwind; the strokes sit on it, never replace it.
- Lit strokes: 1.1-1.5 px wide (p90 1.4-3.5), 7-14 px long pieces (p90 16-77 px), leaning 33-49 deg from vertical
  downwind; the plume tips are the lightest (the sky's colour, L* 38-48 at night), the lower stems darker and nearer
  vertical; the very base lighter again in a mist band (02).
- Dune grass (van): thin light blades (L* 49-66) curving over a dark base mass (L* 12-21), a few seed heads.
- Hill grass (01): the edge of a dark mass broken by 1-2 px blades 6-20 px tall; a few lit tips; tiny pale flowers in
  drifts; 2-4 tall near blades framing the left edge, soft.
- Near out-of-focus plumes (02): big (60-250 px), dark, blurred (edges 4.5-8.6 px), low contrast.

### 1.6 The protea (05 Cape Town) and near leaves
- Dome: cream (L* 88, h 69) with a lower shade (L* 79), textured by fine radial strokes (1-2 px, 0.1-0.2 R long)
  radiating from a point below its centre.
- Bracts: pointed, length ~1.0-1.1 R, base width ~0.35 R, ~14 visible in 2 rings; each bract is TWO flat facets
  split along its midline (lit rose L* 65-67, shade rose L* 46, a dark accent L* 35): the folded-paper look. They
  form a CUP that fans upward around the dome, never a star.
- Leaves: long ellipses, two halves of different value split by a light midrib; 3 greens (L* 28-60).
- Near corner leaves (01 Singapore, 07 Kyoto): flat two-tone leaves with light vein lines (1-2 px), cut by the frame;
  maple leaves in 2-3 reds with faint radial veins, overlapping in clumps. (Our scene: the owner, 2026-10-28, "the
  closest leafs and nature on the left are way too big and not as subtle as they need be": ours stay small.)

### 1.7 Texture
- Inside flat masses: fine grain 1.6-2.4 L* (std, < 1.5 px), mottle 2.3-3 L* (1.5-6 px); leafy crowns 8-10 L* because
  the dabs are structure, not noise.

---

## 2. Research (2026-10-29, ~10 min of web search; sources in section 9)

- **Shapes before leaves.** Split the canopy into a light side and a shadow side from the light's direction; see the
  shapes, not the leaves; keep darks out of the light and lights out of the shadow; scattered highlights everywhere are
  the classic fault (source 1). Missing sky holes and weak light/shadow contrast are the other two (source 2).
- **Dark first, then lighter.** Gouache and poster colour are opaque: block the mid and dark masses, then lay the
  lighter clumps on top, working background to foreground (sources 3, 6, 8). The animation background departments that
  paint in poster colour keep a clear split between light and shadow shapes with very little blending (source 6).
- **A few colours per leaf region, spherical shading, aerial perspective.** An NPR paper built on animation
  background practice renders trees as colour regions (a few colours each), shaded as spheres, faded by aerial
  perspective (source 7): our design-first method, confirmed; our pad + bump + crown spheres are its spherical
  shading at three scales.
- **Cluster size falls toward the crown's edge; three depth bands** (far: soft, low contrast; mid: some detail;
  near: dark and detailed) (source 5).
- **Atmospheric perspective at sunset is reversed:** against a bright warm sky the far things go lighter and WARMER,
  not bluer; distant trees lose the contrast between their light and shadow first (sources 4, 5).
- **Grass:** a dark base mass, then lighter strokes clipped to it, sampling the mid tone and repeating (source 8).

---

## 3. The shared method (every element)

**The method in one line: design flat masses in one light, paint them dark first, lay lighter marks on top, break the
edge into leaves, then move each plane toward the air.** It is the owner's layered-brush recipe (playbook PAINTED
PIECES: soft underpainting first, then marks along the form, then a few crisp lights) translated to foliage, where the
"blocky flat-brush strokes" are leaf dabs and the crisp lights are the top-light clumps and the lit tips.

### 3.1 The limited palette: one foliage family per light, sampled from the scene
**The rule:** every stroke takes one swatch, or a mix of two NEIGHBOURS made in CIELAB, jittered per stroke by at most
±2.5 L*, ±2 C*, ±4 deg h ("colour moving within a shape, never a new colour"). Each element uses 5-8 swatches.

| Swatch | Hex | L* C* h | Role |
|---|---|---|---|
| zenith / field / band / horizon | #c7c6e6 / #d3c8dd / #eddcd6 / #f3d6c3 | 80.9 17 293 / 82 12 310 / 88.9 7 46 / 87.5 15 61 | the sky recipe's dusk set: the air every plane converges on (horizon = the far air) |
| paving / water / shadow | #f2dac8 / #ccbad9 / #d5bdd1 | 88.6 13 66 / 77.8 18 313 / 79 14 330 | the ground, the canal, a cast shadow (lilac, never grey) |
| leaf_accent | #e7d182 | 84 42 94 | the top light: the low sun on the topmost leaves (~5 % of a near crown) |
| leaf_lit | #b7b46c | 72 38 104 | lit dabs: warm yellow-olive |
| leaf_mid | #7f9264 | 58 27 124 | the lit zone's base; mid dabs |
| leaf_shade | #4c7360 | 45 19 162 | shade: cool green |
| leaf_deep | #294e56 | 31 14 218 | deep: the inner dark, undersides, toward the sky's cool |
| leaf_amber / leaf_rust | #d6a961 / #ba7e5c | 72 44 80 / 58 34 55 | October: turned patches on the sun side |
| bark_lit / bark_shade | #9e8070 / #504253 | 56 16 55 / 30 12 320 | trunk and limbs: two facets |
| grass_tip / lit / mid / shade / deep | #fadfb5 / #e7c091 / #b99079 / #8d6569 / #534153 | 90 24 82 / 80 30 76 / 63 22 55 / 47 17 15 / 30 14 325 | reeds: gold tips, straw plumes, ochre-mauve stems, plum root |
| verge_tip / lit / mid / shade / deep | #d6bf85 / #a49c6a / #667457 / #3f5d52 / #2e464c | 78 32 90 / 64 28 100 / 47 18 128 / 37 14 168 / 28 10 220 | short grass (darker and more muted than the crown: never a bright lawn) |
| flower | #f2eae0 | 93 6 78 | tiny pale flowers in the verge |
| dome_lit / mid / shade / hatch / dot | #f6e6d2 / #e8d0be / #c2aab8 / #bd988f / #f9f0e1 | 92 12 78 / 85 13 66 / 72 12 340 / 66 16 40 / 95 8 85 | the protea's dome |
| bract_lit / mid / shade / deep | #f1a0a7 / #d67f93 / #a8627c / #794862 | 74 32 16 / 63 36 6 / 50 32 356 / 37 26 345 | the protea's bracts: two facets each |
| pleaf_lit / mid / shade / deep | #aaaf7f / #798f6c / #487067 / #335358 | 70 26 112 / 57 22 132 / 44 16 178 / 33 12 215 | the protea's leaves (sage, olive, teal) |
| aut_lit / mid / shade / deep | #e7b97d / #d79066 / #b36b60 / #734b5d | 78 38 76 / 66 40 56 / 53 33 34 / 37 20 350 | autumn corner leaves; deep = the twig |
| planter_top / lit / shade, soil | #daa582 / #ca8d6f / #9f6a5a, #5f4545 | 72 30 60 / 64 32 52 / 50 26 42, 32 12 20 | the corten planter: flat faces |

**For another light or film:** keep the structure, resample the numbers.
- Take the key light's hue (here the low sun, peach-gold h ~70) and the sky's cool hue (here lilac h ~300).
- The foliage family runs from lit to deep in steps of 12-14 L*: lit = leaf hue h 100-110 pulled 6-10 deg toward the
  key's hue; mid h ~125; shade h ~160; deep h 210-230, i.e. toward the sky's cool. The accent is 12 L* over lit.
- The lit-to-deep range: 40 L* for a near tree in a light scene (ours: 72 to 31), ~30 at mid, ~12 at far.

### 3.2 The light: one sun, seen through three spheres
- **The key:** `LIGHT = normalize(-0.70, -0.62, 0.36)`: the low sun on the left plus the sky above, a little frontal.
- **The normal at a pixel** = `unit(0.30 * bump + 0.32 * pad + 0.38 * crown)`: three hemisphere normals, a small
  sub-clump, the pad it belongs to, and the whole crown (centre (cx - 0.04 W, cy - 0.06 H), radius 0.62 W). The crown
  term makes ONE light side for the whole tree (Marla's rule); the pad and bump terms give each clump its own lit top.
- **The light value** `s = n . LIGHT`, then:
  - the underside goes dark: `s -= ao * clip((y - (cut - 0.45 ry)) / (0.45 ry), 0, 1) ** 1.4`, ao 0.5-0.8;
  - a pad behind goes dark next to the pads in front of it (the layered look): `s -= occ * G(front, 0.03 W)` with
    the front union shifted (+0.02 W, +0.035 W) away from the light and `occ` 0.45 (near).
- **Values by AREA, not by threshold:** the zones are percentiles of `s` over the visible crown: deep 15 %, shade
  30 %, mid 28 %, lit 27 % (fewer values farther: 3.5).

### 3.3 The brush kit (each mark is a polygon, rasterised at 4x and box-reduced: 1 px AA, 7.3)
| Brush | Shape | Size at 1080 | Opacity | Where |
|---|---|---|---|---|
| **dab** | 2-3 overlapping ragged ellipses (long axis 0.5-0.85 D, aspect 1.5-2.2, rough 14 %), along the form | D = D0 x lognormal(0, 0.4) in [0.5, 2.4] D0; D0 = 0.021 W (7 px in a 330 px crown) | 1.0 | inside the crown zones (P3) |
| **leaf clump** | 2-5 pointed leaves (length 0.62-1.0 D, width 0.42-0.56 of it) fanning +-0.55-0.8 rad from one point | 0.75-1.2 D_edge (8 px) | 1.0 | 30 % of the mid/lit dabs; the edge (P4); accents (P6) |
| **notch** | 1-2 pointed leaves pointing INTO the mass, filled with what is behind | 0.55-0.95 D_edge | 1.0 | the edge (P4) |
| **ribbon blade** | the centre line +- half the width, tapering to 10-15 % at the tip, a quadratic bend | 1.0-2.4 px wide (blades), 7-10 px (near reeds) | 0.5-0.95 | grass, reeds, twigs, stems |
| **dry bristle** | a flat brush of 3-5 bristles, each running out of paint at its own point (dry 0.3-0.5) | 3.5-7 px (plumes, dome strokes), 26-34 px (near plumes) | 0.45-0.95 | reed plumes, bush domes, near plumes |
| **facet** | a pointed ogive split along its midrib into a lit and a shade polygon | 0.3-0.58 R wide | 1.0 | protea bracts, leaves |
| **line** | a 0.9-1.4 px polyline | | 0.3-0.9 | veins, the dome's radial hatch, midribs, tip lights |
| **speck** | a ragged disc r 0.55-1.3 px | | 0.25-0.95 | near masses only; flowers |

### 3.4 The pass order (per mass): dark first, lighter on top, each pass softer than the one after it
| Pass | What | Softness after it |
|---|---|---|
| P0 | the flat design's darkest shape (the crown's inner dark; the reed mass) | crisp (tree) / blur 0.7 px (reeds: the softest pass) |
| P1 | the wood: trunk and limbs (two facets) | crisp |
| P2 | flat value zones, each one value step UNDER the marks that will cover it | colour blended with sigma 1.2-1.5 px inside the shape (soft terminators), the alpha crisp |
| P3 | marks one step lighter than their zone: dabs, blades, dry strokes, plumes | crisp |
| P4 | the edge: leaf clumps out, notches in | crisp |
| P5 | holes cut (alpha 0) + a 22 % veil | crisp |
| P6 | the lightest accents, tip lights; texture (grain, mottle; speckle on near only) | crisp |
| plane | converge on the air by k, then blur | 0 (near) / 0.4 px (mid) / 0.5 px (far) / 2.2-3 px (out-of-focus near framing only) |

### 3.5 The depth ladder (near to far): fewer values, simpler, toward the warm air, edges still crisp
| Plane | k (toward horizon #f3d6c3) | Plane blur | Values | Pads | Dab D0 | Cover lit/mid/shade/deep | Edge clump D | Notch p | Occlusion | Holes | Grain / mottle |
|---|---|---|---|---|---|---|---|---|---|---|---|
| near (crown W 250-400 px) | 0 | 0 | 4 + accents | 9 | 0.021 W | 0.74 / 0.56 / 0.38 / 0.10 | 1.15 D0 | 0.30 | 0.45 | 1.2 % | 1.6 / 2.0 + speckle |
| mid (W 100-160) | 0.28 | 0.4 px | 3 | 7 | 0.032 W | 0.62 / 0.40 / 0.14 / 0 | 1.1 D0 | 0.30 | 0.45 | 0.8 % | 1.1 / 1.4 |
| far (W 40-70) | 0.55 | 0.5 px | 2 | 6 | none | none | 0.065 W | 0.22 | 0.30 | 0 | 0.7 / 0.9 |

- **Moving back one plane:** the crown keeps its silhouette rules and crisp edge, loses one value and its dabs, its
  leaf clumps get relatively bigger (the edge D grows from 2.4 % to 6.5 % of the crown's width), and its colours
  move toward the HORIZON air: at dusk distance goes lighter and warmer, never grey or blue (source 4).
- **Far trees stand in a line**, overlapping 40-50 %, ON the bank (no trunks, no inner dark); the mid and far trees
  are mirrored at random so no two read as copies.

### 3.6 Texture (inside a piece only, never over the frame)
- Grain (noise sigma 0.7 px) + mottle (sigma 7 px) as a multiplicative value change of 1.6 and 2.0 L* std on near
  masses (the refs: 1.6-2.4 and 2.3-3); less on mid and far (3.5).
- Speckle only on near masses: one ragged disc per 500-900 px² of the piece, r 0.55-1.1 px, op 0.25-0.5, in the
  lit, shade or accent colour.

---

## 4. The elements

### 4.1 Tree crown (`paint_tree()`; near: crown 330 x 270 px, trunk foot at the bottom)

**Superseded for the next tree (2026-10-30; `PAINT_RECIPES.md` §2.3).** The owner called v6's tree, painted from this
recipe, out of style ("it is weird looking tree we have on the forefront like it doesn’t fit the style there"), and
the playbook's ORGANIC, NOT GEOMETRIC asks for fewer, bigger, irregular shapes: v6's crown measures 67 % small shapes by
area and 58 % crisp edges (the painted trees 34 % and 20 %), and this recipe's own verdict (§0) finds the pads "too
alike" ("a little topiary"). A tree takes `ORGANIC.md` §4.1's shape (a body wider than tall with a flattened underside, 3-5 big
lobes never evenly spaced, 2-4 clumps half sunk on each lobe, 1-3 sky gaps; the biggest mass 20-30 % of the area,
small <= 40 %) and edges (lost >= 7 %, crisp <= 30 %), its crown from `shapes_gen.crown`; the light, palette and pass
order below still hold.

**(a) Design: the flat shapes first**
- **Pads, not balls.** 9 pads (`PAD_TEMPLATE`, (u, v, half-width) in crown W/H), back (top) to front (bottom):
  - half-width rx = 0.17-0.24 W (x U(0.96, 1.12)); dome height ry = rx x U(0.52, 0.64); the underside sits
    bot = ry x U(0.30, 0.42) below the pad's centre and is FLAT: `cut = y + bot + 0.10 ry (1 - (dx/rx)^2) + 0.04 ry
    sin(4.5 dx/rx + phase)`;
  - 5-8 small bumps on the top arc (angles -173..-7 deg, at 0.80 rx / 0.78 ry), radius rx x lognormal(ln 0.23, 0.3)
    clipped to 0.12-0.40 rx: they protrude 0.1-0.2 rx (a gently lumpy top, never a scallop chain);
  - the crown: a dome wider than tall (H/W 0.82), the top pad narrower, the widest row a little above the middle,
    the front pad lowest; pads overlap 25-40 %.
- **Value plan:** 4 values by area (3.2) + top lights ~5 %. Measured on the proof (k-means, 5 classes, L*):
  83 (5 %), 70 (17 %), 57 (23 %), 44 (34 %), 33 (22 %) against the refs' 74-77 (6-9 %), 53-55 (22 %), 42-44
  (25-29 %), 30-34 (25 %), 19-25 (16-17 %): the same structure and steps (12-13 L*), lifted ~10 L* for a light scene.
- **Palette:** leaf_deep, shade, mid, lit, accent (+ amber in patches, bark_lit, bark_shade).
- **Zone base colours** (one step under the marks): deep #294e56, shade mix(deep, shade, 0.6) #3e645c (L* 39), mid
  mix(shade, mid, 0.3) #5c7c61 (L* 49), lit = leaf_mid #7f9264 (L* 58).

**(b) Paint passes** (sizes for W = 330 px; scale by W)
| Pass | Brush and size | Count | Direction / taper | Colour | Opacity | Softness after |
|---|---|---|---|---|---|---|
| P0 inner dark | flat fill: one disc per pad (r 0.62 rx, squashed 0.75, cut above its underside) + the convex hull of the pad centres | 1 shape | | leaf_deep | 1 | crisp |
| P1 wood | trunk ribbon, tw = 0.072 W (24 px): 1.22 tw (29 px) at the root, a x1.3 flare in its last 3 samples, tapering to 0.80 tw (19 px) at the fork, cy + 0.40 H; 3 limbs to the leftmost, middle and rightmost lower pads, 0.5-0.62 tw tapering to 28 % of that; 70 % get a side twig (0.42 -> 0.15 of the limb) | 4-7 ribbons | curved quadratics | bark_shade body, bark_lit strip (0.38 of the width, offset 0.26 to the left: the sun's side) | 1 / 0.85 | crisp |
| P2 flat zones | per pad, back to front: the 4 zone bases by s | 9 shapes | | zone bases | 1 | colour blended sigma 1.2 px inside the pad; alpha crisp |
| P3 dabs | dab (70 %) or leaf clump (30 %, mid and lit only); D0 = 0.021 W = 7 px; D = D0 x lognormal(0, 0.4) in [0.5, 2.4] x zone factor (deep 1.0, shade 1.05, mid 1.15, lit 1.3) x (0.72 + 0.28 e), e = depth inside the crown / 0.10 W (smaller toward the edge: source 5) | ~1550 (near) | dabs along the pad's tangent (flat on its top, drooping at its sides: 0.6 x tangent + N(0, 0.2) rad); clumps point outward +- 0.35 rad | one step LIGHTER than the zone: deep -> mix(deep, shade, .6), shade -> mix(shade, mid, .25), mid -> mid, lit -> lit; in the lit zone above the 88th percentile of s, 60 % take leaf_accent; October: lit dabs in amber patches (noise sigma 0.12 W > 0.9, within 0.12 W of the edge) at p 0.42 | 1 | crisp; clipped to the pad + 0.1 D0 |
| P4 leafy edge | after each pad's dabs, walk its outline every 0.75-1.45 D_e (D_e = 1.15 D0 = 8 px): 50 % a leaf clump OUT (2-4 leaves, 0.75-1.2 D_e), 30 % a NOTCH in (1-2 leaves, 0.55-0.95 D_e), 20 % nothing | ~280 | out: along the outward normal + 0.4 droop, +- 0.25 rad; notch: inward | out: the colour 0.9 D_e inside (soft-sampled, +- 1.2 L*); notch: what was behind (earlier pads, or transparent) | 1 | crisp |
| P5 sky holes | groups >= 5 D0 apart, 0.02-0.07 W inside the edge, above cy + 0.05 H, in deep/shade/mid; 1-3 holes per group, each 1-2 leaf shapes (0.5-1.2 D0) + a blob (50 %, 0.3 of it) | 1.2-1.3 % of the crown | random | CUT (alpha 0) through foliage and wood, then a leaf_shade veil at 22 %; 25 % of groups get a 1.1 px twig across (bark_shade) | | crisp |
| P6 accents | leaf clumps of 2-3 leaves, 0.5-0.85 D0, on s above the 96th percentile, not under a front pad | 2-5 per pad | outward from the pad | leaf_accent | 0.95 | crisp |
| texture | grain 1.6 + mottle 2.0 L*, speckle 1 / 520 px² (lit, shade, accent); wood grain 1.3 / mottle 1.2 | | | | | |
| plane | near: k 0, blur 0; mid / far: 3.5 | | | | | |

**(c) Edges.** The silhouette is crisp (measured: mean 10-90 % width 0.88 px; the refs 1.1-1.5) and LEAFY: it is a
walk of discrete clumps and notches, so it is broken without being fuzzy. The inside terminators are soft (sigma
1.2 px) and broken by dabs that cross them (dabs are clipped by the pad, not by the zone). The undersides are crisp,
made leafy by drooping clumps. Nothing on the near or mid plane is blurred.

**(d) Depth:** 3.5. A tree farther back uses the same code with the plane's row.

**(e) Mistakes to avoid** (all seen in our v1-v5 or in this recipe's first proof)
- round balls (a "broccoli" / cumulus crown) -> pads wider than tall with flat undersides;
- light as speckle everywhere, minty and cold -> the light lives on the pads' tops as lighter dabs over the mid,
  warm yellow-olive; the shade is calm (cover 0.38 and 0.10, closer values);
- a crescent band of light along the outline (v4) -> the lit zone comes from the normal field, never an offset outline;
- a hairy or combed silhouette (the first proof let dabs spill 0.42 D0 outside: fuzz) -> the edge is a walk of
  separate clumps and notches, dabs stay inside;
- sky holes as round light dots (they read as pink blossoms) -> few, small, leaf-shaped, in groups near the edge,
  cut, veiled;
- smudged mid and far trees (v1-v5: 6-20 px edges) -> distance by value, warmth and simplicity, crisp edges;
- heavy darks (the first fix had 36 % of the crown at L* 34) -> the shade zone's base is mix(deep, shade, 0.6),
  occlusion 0.45: the darkest class 22 %.

### 4.2 Bush in a planter (`paint_bush()`, `paint_planter()`; planter 300 x 72 px, bush 128 px tall)

**(a) Design**
- 3 domes back to front: (x 0.66 Wb, rx 0.30 Wb, ry 0.88 h), (0.29 Wb, 0.31 Wb, 1.0 h), (0.52 Wb, 0.21 Wb, 0.62 h);
  each a half-ellipse standing on the planter's top, its outline gently lumpy (+-3.5 % at 5 lobes, +-2.5 % at 11).
- The light: normal = 0.65 dome + 0.35 the whole bush (a sphere r 0.62 Wb); the contact dark at the planter: `s -=
  0.95 * clip((y - (y0 - 0.18 ry)) / (0.18 ry)) ** 1.3`; occlusion 0.5 behind the front domes.
- Values: 4 by area (15/45/72 percentiles), the tree's zone bases and dab colours.
- The planter: flat faces only: the rim top (planter_top), the front (planter_shade), its sun-side quarter lifted to
  planter_lit (blurred sigma 6 px, 80 %), a 2 px lit lip (planter_top +6 L*), soil (#5f4545); the bush's cast shadow on
  the rim (lilac, -10 L*, sigma 2.5, offset to the right, away from the sun).

**(b) Paint passes**
| Pass | Brush | Count | Direction | Colour | Opacity | Softness |
|---|---|---|---|---|---|---|
| P2 flat zones | | 3 domes | | zone bases | 1 | sigma 1.5 px colour blend |
| P3a dry strokes (the Cape domes' brushing) | dry bristle, 4.5-7 px wide, 4-5 bristles, dry 0.5, 10-sample arcs spanning 0.12-0.24 rad / v (v = the arc's radius, 0.2-0.95 of the dome) | rx x ry / 85 tries per dome (60-140; those outside the dome or under a front dome are skipped) | along the dome's latitude lines | mix(zone base, zone dab, 0.6) | 0.45-0.7 | crisp |
| P3b dabs | the tree's dab and clump, D0 = 0.02 Wb = 6 px | cover lit 0.55, mid 0.28, shade 0.06, deep 0 (the shade stays calm) | tangent to the dome | one step lighter + accent above the 93rd percentile | 1 | crisp |
| P4 leafy edge | clumps 0.9 D0; p_out 0.38, p_notch 0.32, droop 0.35; skipped on the bottom 3 px (it sits in the soil) | one step per 0.75-1.45 x 0.9 D0 of outline | | the colour just inside / what was behind | 1 | crisp |
| texture | grain 1.6, mottle 2.0, speckle 1 / 700 px² | | | | | |

**(c) Edges:** the domes' silhouettes crisp and leafy; their feet straight on the soil; terminators sigma 1.5 px.
**(d) Depth:** a planter on the far towpath uses the mid row of 3.5 (3 values, k 0.28, no dry strokes).
**(e) Mistakes:** the same "moss" texture at one density everywhere (the first proof); lumpy rock shapes; spiky
hair from too many outward clumps (keep p_out <= 0.4 on small leaves); no contact shadow (the bush floats).

### 4.3 Grass and wind-blown reeds (`paint_reeds()`, `paint_verge()`, `paint_near_plumes()`; bed 170 px tall)

**(a) Design**
- **The bed is a band across the frame**, cut by its edges (a reed bed that tapers at both ends reads as a mound).
  Height profile `hm(x) = hmax (0.60 + 0.08 fbm(sigma 50 px) + 0.05 fbm(sigma 14 px))`.
- **Wind from the sun's side** (left to right): lean per x = 0.62 + 0.20 gust(x) rad from vertical, gust = a
  unit-variance fbm(sigma 45 px): 24-47 deg within one sigma (refs 33-49), and GROUPS lean together: the rhythm that
  stops it reading as a comb. Each blade leans 0.55 x that at its root and bends a further 0.5-1.0 x toward its tip.
- **Three depths:** the dark mass; the blades and plumes on it; the out-of-focus near plumes in the bottom corners.
  The verge (short grass) runs at the bed's foot.
- **Value plan:** mass L* 30 (root) -> 47 (55 % up) -> 52 (top); back blades 49-59; plumes 68-80; tip lights 90,
  against the lilac water L* 78. Near plumes L* 27, the darkest thing in the piece.

**(b) Paint passes**
| Pass | Brush | Count | Direction / taper | Colour | Opacity | Softness after |
|---|---|---|---|---|---|---|
| P0 mass | a band sheared downwind (0.35 tan(lean) px per px of height) up to 0.8 hm | 1 | leaning | ramp grass_deep -> grass_shade (55 %) -> mix(shade, mid, .35) (95 %) | 1 | |
| P0 crest | leaning plume shapes standing on the mass's top: 3.5-6.5 px wide, (1 - t)^0.8 (0.6 + 0.4 sin pi t), length 0.22-0.5 hm | 1 per 5 px (+-2) | lean x 0.9-1.3 | mix(shade, mid, .4) +- 2 L* | 1 | **blur 0.7 px (the mass is the softest pass)** |
| P0 mist | a band 0.28 hm tall at the root, over the mass | 1 | | mix(water, grass_mid, .45) | 0.35 | sigma 2 px |
| P1 back blades | ribbon, 1.2-2.2 px tapering to 12 % (power 0.9), length 0.95-1.5 hm, quadratic bend (tip +0.5-1.0 x lean) | 1 per 3.2 px (~190) | lean x 0.7-1.2 + N(0, 0.07) | mix(shade, mid, 0.15-0.75) | 0.7-0.95 | crisp |
| P2 plumes | dry bristle head along the blade's last 30-45 %: 3 bristles, 3.5-6 px wide, dry 0.45; then its sun-side edge: a ribbon offset 0.28 w toward the light, 0.42 w wide | on 40 % of the blades (~75) | along the blade | head mix(mid, lit, 0.3-0.7); edge grass_lit | 0.95 / 0.9 | crisp |
| P3 front blades | lit ribbons 1.0-1.5 px, length 0.55-1.3 hm; dark ribbons 1.6-2.4 px | 1 per 9 px lit; 1 per 28 px dark | lean x 0.7-1.3 | grass_lit / grass_deep | 0.5-0.8 / 0.8 | crisp |
| P4 tip lights | 0.9-1.3 px line on the plume's upper 65 %, 1.3 px toward the light | on 45 % x (1.3 - x/W) of the plumes (the sun's side favoured) | | grass_tip | 0.6-0.9 | crisp |
| texture | grain 1.4, mottle 1.4 | | | | | |
| verge mass | a band 24 px tall, its top ragged (3 fbm(sigma 18) + 1.2 fbm(sigma 4) px) | 1 | | verge_mid (top) -> shade (35 %) -> deep | 1 | blur 0.5 px |
| verge edge blades | ribbon 1.0-1.6 px, length lognormal(ln 9, 0.4) in 4-20 px | 1 per 1.6 px | lean 0.3 + N(0, 0.25) | mix(verge_shade, verge_mid, 0.2-1.0) | 1 | crisp |
| verge lit blades | ribbon 0.9-1.3 px, 5-15 px | 1 per 6 px, thinned away from the sun | | verge_lit -> verge_tip | 0.6-0.9 | crisp |
| verge flowers | specks r 0.7-1.3 px in drifts (fbm(sigma 25) > 0.6) | 1 per 9 px in a drift | | flower | 0.7-0.95 | crisp |
| near plumes | a blade 7-10 px wide ((1 - t)^0.5) + a dry plume head along its last 55 % (5 bristles, 26-34 px, dry 0.35); rooted below the frame, 0.52-0.80 of its height | 3-4, in the bottom corners | lean 0.48-0.62 rad | grass_deep -3 L*, x0.9 chroma | 0.9-0.92 | **blur sigma 3.0 px** (10-90 % edges 7.7 px; refs 4.5-8.6) |

**(c) Edges:** the mass's top is never a drawn line: it is the crest of plume shapes, softened 0.7 px. Blades,
plumes and tip lights are crisp (1 px AA). Only the near framing plumes are out of focus.
**(d) Depth:** a far reed bed is the mass + crest + one blade per 6 px, no plumes, k 0.3-0.5 toward the air.
**(e) Mistakes:** blades replacing the mass ("hay bale"); a sawtooth or mountain top (the first proof); a comb
(parallel blades at even spacing: the gust field groups them); one straw colour everywhere (run the values from a plum
root to gold tips); near reeds as vertical grey bars (they are dark, plumed and leaning); a bed tapering into a mound;
the verge as a bright green lawn strip (it is the darkest, most muted green in the piece).

### 4.4 Near flowering plant, protea-like (`paint_protea()`; head R = 48 px near, 30 px behind)

**(a) Design**
- **A cup, never a star.** The head is a cream dome (R, ry 0.9 R) sitting in pointed bracts that fan UPWARD:
  - 9 back bracts behind the dome, rooted at (cx + 0.50 R cos a, cy + 0.45 R + 0.20 R sin a), a = -160..-20 deg
    (up-left to up-right), length R (1.30 + 0.45 |cos a|) (1.3-1.75 R: longer at the sides), width 0.48-0.56 R,
    tips curled 10 % toward the centre;
  - 7 front bracts rooted below the dome (cx + 0.32 R u, cy + 1.12 R), pointing -90 +- 58 deg, length 1.12-1.36 R
    (x (1 - 0.1 |u|)), width 0.50-0.58 R; they hide the dome's lower 40 %; drawn outer first, central in front;
  - 2 small sepals (0.62 x 0.32 R) turned down at the base.
- **Leaves:** 8, lanceolate (length 2.2-2.8 R x 0.95-1.12, width 0.26-0.32 of it), rooted along the stem 1.05-3.05 R
  below the head, pointing up and out (-166..-12 deg), curled +-12 %. Stem 0.16 -> 0.11 R.
- **Every bract and leaf is two flat facets** split along its midrib; the facet facing the light takes the lighter
  swatch (the folded-paper look).
- **Values:** dome 92 / 85 / 72 (lit cap, mid, a cool rose-lilac shade on the lower right); bracts 74 / 63 / 50 / 37;
  leaves 70 / 57 / 44 / 33. Behind the head: a darker field (the planter's face, L* 42-50), as the refs set the
  flowers against dark teal.

**(b) Paint passes**
| Pass | Brush | Count | Colour | Opacity | Softness |
|---|---|---|---|---|---|
| leaves | facet pairs + a 1.2 px midrib line (the lit swatch +9 L*) | 8 | pairs (pleaf shade, mid), (deep, shade), (mid, lit) in turn | 1 / 0.55 | crisp |
| stem | ribbon | 1 | stem | 1 | crisp |
| back bracts | facet pairs | 9 | (bract_shade, bract_mid) | 1 | crisp |
| dome | 3 zones by s (> 0.55 lit, > 0.12 mid, else shade) | 1 | dome swatches | 1 | sigma 1.5 px colour blend |
| radial hatch | lines 0.9-1.4 px, 0.10-0.20 R long, radiating from a point 0.85 R below the centre, clipped to the dome | ~7 R candidates (about 2/3 land inside) | dome_hatch | 0.45 x 0.5-0.95 | crisp |
| floret dots | specks r 0.6-1.1 px on the dome's upper rim (0.55-0.92 R out) | 0.9 R | dome_dot | 0.5-0.9 | crisp |
| front bracts | facet pairs | 7 | inner (bract_mid, bract_lit), outer (bract_shade, bract_mid) | 1 | crisp |
| sepals | facet pairs | 2 | (bract_deep, bract_shade) | 1 | crisp |
| texture | grain 1.8, mottle 1.8, speckle 1 / 900 px² (dome_lit, bract_lit) | | | | |

**(c) Edges:** all crisp (1 px AA); the only soft transition is the dome's light (sigma 1.5).
**(d) Depth:** near only in our films; a second head behind at 0.6 R with leaves x0.85.
**(e) Mistakes:** bracts all around (a star or daisy: the first proof); small bracts that let the dome dominate; a
smooth gradient dome without the radial hatch; outlines around the facets.

### 4.5 Near leaves framing a corner (`paint_corner_leaves()`; a 420 x 300 px corner box = 39 % x 16 % of the frame)

**(a) Design**
- **Small and subtle** (owner, 2026-10-28): a small October branch entering from the corner, never big leaves.
- The twig: a quadratic from (-14, 30) through (0.24 w, 20) to (0.50 w, 0.27 h), 4.5 -> 1.2 px; 4 side twigs
  (2.4 -> 0.9 px, 33-56 px long).
- 24 leaves: 12 along the twig + 3 on each side twig, each on a 0.35 R stalk, hanging 35-85 deg off the twig and
  drooping 40 % toward down; R 16-26 px x (1.15 - 0.45 x/w) (bigger near the corner); turned (squash 0.45-1.0); a
  5-lobed plane/maple outline (lobes 1.0 / 0.88 / 0.58 R, 2.5 % teeth, a stalk notch).
- Three layers: 40 % on the BACK layer (behind the twig), 60 % on the mid layer, and the 2 nearest at the corner (R
  26-36, cut by the frame) on the NEAR layer.
- Colour pairs (lit facet, shade facet): (aut_lit, aut_mid) 50 %, (aut_mid, aut_shade) 30 %, (aut_shade, aut_deep)
  20 %. Values against the sky (L* 81-82): the lightest leaves sit just under the sky (78), the twig is the darkest
  (37): subtle, never orange cut-outs.

**(b) Paint passes**
| Pass | What | Colour / change | Softness after |
|---|---|---|---|
| back leaves | shade colour, then the lit facet (an analytic half-plane on the sun's side of the midrib, 1 px AA), veins 1 px from the stalk to each lobe tip at 30 % | converged 35 % on the sky | blur 0.5 px |
| twig | ribbons | aut_deep | crisp |
| mid leaves | as the back leaves, with their stalks (1.4 px) | full | crisp |
| near leaves | 2 leaves, (aut_mid, aut_shade) | -5 L*, x0.85 chroma | blur 2.2 px (out of focus) |
| texture | grain 1.0 / 1.6 / 1.0 (back / mid / near), mottle the same | | |

**(c) Edges:** mid leaves crisp; back leaves 0.5 px; the 2 near leaves 2.2 px.
**(d) Depth:** the back layer is the far step (k 0.35), the near layer the defocused one: three planes inside one
small corner.
**(e) Mistakes:** big near leaves; a row of identical icons hanging from a line (the first proof); saturated orange
cut-outs on the lilac sky; black silhouettes for the near leaves.

---

## 5. Mistakes that made v1-v5 (and this recipe's first proof) fall short: the rule for each

| Mistake | Where we did it | The rule |
|---|---|---|
| even streaky texture over everything | paint v2 | marks follow a FORM and a ZONE; coverage differs per zone (lit 0.74 ... deep 0.10); the shade stays calm |
| smudging (blurred edges on every plane) | v1-v5 foliage, 6-20 px edges | edges crisp (~1 px) on near, mid and far; blur only the out-of-focus near framing |
| combing (parallel strokes at even spacing) | v3 tree edge | a gust field groups the blades; the edge is a walk of separate clumps with random steps (0.75-1.45 D) |
| greying (strokes averaging the darks away) | v1 crown paler than flat | paint dark first, marks one step LIGHTER than their zone; never mix toward grey; converge toward the warm air, not grey |
| cartoon outlines | (avoided) | no outline anywhere: value steps and facets separate the shapes |
| crescents (a light band along the outline) | v4 tree | the lit zone comes from a normal field (pads, bumps, crown), never an offset outline |
| round balls / cumulus crown | first proof | pads wider than tall with flat undersides |
| light everywhere (scattered highlights) | first proof | light only on the sun side of each pad; accents above the 96th percentile only |
| holes that read as blossoms | first proof | few, leaf-shaped, grouped near the edge, cut, veiled |
| hay bale, sawtooth top, grey bars | first proof reeds | a dark soft mass first, a crest of plume shapes, dark plumed near reeds |
| star-shaped protea | first proof | bracts fan UP into a cup; the dome shows its top 60 % |
| clip-art corner leaves | first proof | clumps on 3 depth layers, turned leaves, values just under the sky |

---

## 6. Using it in the engine (notes for `src/lib/paint/`)

- **One layer per piece**, baked once from a seed, placed in its plane's group (the painter's existing
  `<PaintedLayer>`): a tree is two internal layers (wood under foliage) merged at the end; its sky holes are CUT, so
  the PNG works over any background and over the sky's own drift.
- **Inputs from the flat design:** the crown's centre, W, H and trunk foot (or a pad list drawn in the design), the
  plane (near/mid/far) and the light vector of the shot's rig. The zone thresholds are percentiles, so the same code
  works on any crown size.
- **Motion:** a tree sways as a rigid image about its trunk foot (0.4-0.8 deg, period 3-4 s); reeds can be baked in
  2-3 gust states and cross-faded, or sheared per row (the bake's lean field is per x); the near plumes move most.
- **The paint-on opening:** the passes are separable (every pass has its own seed, `stop=`), so a reveal can play
  them in order: P0-P2 flat, then the dabs, then the edge.

---

## 7. Implementation spec (numpy / PIL / scipy / skimage), as built in `foliage.py`

### 7.1 Colour
- Swatches in CIELAB LCh (`PAL`); `C(name)` -> sRGB float. Mixes of two neighbours in CIELAB (`mixc`). Per-stroke
  jitter: `variants(rgb, rng, n)` draws n copies within +-2.5 L*, +-2 C*, +-4 deg h; each stroke picks one.
- Atmospheric perspective: `converge(img, air, k)`: CIELAB lerp toward the air by k, on the unpremultiplied colour.

### 7.2 Layers and compositing
- `Layer`: premultiplied RGBA float32. `comp(mask, x0, y0, rgb, op)`: source-over through a local coverage mask.
  `replace(mask, x0, y0, src)`: show `src` (a full premultiplied array, e.g. the layer before this mass) through the
  mask, or erase when `src` is None: the notch and the hole. `rgb_soft(sigma)`: the colour blurred inside the shape
  only (premultiplied blur / blurred alpha), for sampling a zone's colour near an edge.
- `under(top, bottom)` merges two layers; `over(bg, layer)` composites onto an opaque background.

### 7.3 Marks: polygons at 4x, box-reduced (crisp 1 px AA, no stamp seams)
- `polys_mask(polys)`: draws one or more polygons (or (polygon, value) pairs) with PIL at `SS = 4` and reduces by 4:
  a coverage mask with ~1 px anti-aliased edges, the refs' edge width.
- `ribbon(path, widths)`: a stroke along a sampled path = the centre line +- half the width along the normal (one
  polygon: no stamp seams). Blades, limbs, twigs, plumes and crests are ribbons along quadratic Beziers (`bez`,
  `blade_path`: from the root, leaning by `lean`, the tip bending by `bend`).
- `dab()`: 2-3 ragged ellipses (`ellipse_poly`: radius x (1 + 0.14 (0.6 sin 3t + 0.4 sin 5t))). `spray()`: n pointed
  leaves (`leaf_poly`: half-width 0.5 W sin(pi t)^0.8 (1 - 0.35 t), round base, pointed tip) fanning from a point.
- `bristle_stroke(path, width, nb, dry)`: nb parallel thin ribbons, each starting up to 10 % late and ending
  `dry * rand^1.5` early, with tapered ends, at value 0.55-1.0 each: the dry flat brush.
- `facet_masks()`: a bract's two halves (an ogive split along its midline); the lit one = the side whose normal faces
  `LIGHT`.

### 7.4 Masses: pads, normals, zones
- `tree_design()` returns the pads (7.3 numbers in 4.1); `pad_fields(p, X, Y, crown)` returns the AA mask (an
  analytic distance, `clip((1 - d) * r + 0.5, 0, 1)`, then the flat cut) and `s` (3.2).
- Occlusion: for pad i, `front_i` = the union of the pads after it; `s_i -= occ * G(roll(front_i, (dy, dx)), 0.03 W)
  * (1 - front_i)`.
- Zones: `np.digitize(s, percentiles(visible s, [15, 45, 73]))` (3 values: [32, 68] + 1; 2 values: median).
- Zone fill: the base colours per pixel, blended with a normalised Gaussian (sigma 1.2) inside the pad only:
  `G(col * m) / G(m)`, so the terminators soften while the silhouette stays crisp.

### 7.5 Dab placement (`dab_pass()`)
- A jittered grid over the pad's box, spacing 0.58 D0, shuffled; each point inside the pad (and its zone k):
  accept with `p = min(1, -ln(1 - cover_k) / 1.9) * (0.55 + 0.9 * clip(0.5 + 0.5 clump))`, where `clump` is unit
  Gaussian noise (sigma 0.035 W): dabs gather in sub-clumps with gaps between. (1.9 = the mean dab area / the grid
  cell's area, so `cover_k` is the expected covered fraction.)
- Size, shape, angle and colour as in 4.1 (b); the mark is multiplied by the pad's mask dilated 0.1 D0, so nothing
  spills.

### 7.6 The leafy edge (`leafy_edge()`) and the holes
- Before painting a mass, keep `behind = L.px.copy()`. After its zones and dabs: `skimage.measure.find_contours(m,
  0.5)`; walk each contour by arc length with random steps (0.75-1.45 D); the outward normal is minus the gradient of
  the mask blurred by 1.5 px. Out: a spray in the colour sampled 0.9 D inside from `rgb_soft(1.0)`. Notch: a 1-2 leaf
  spray pointing inward, `L.replace(mask, behind)`.
- Holes: candidates by the distance transform of the crown's alpha (0.02-0.07 W inside), grouped (>= 5 D0 apart),
  `replace(mask, None)` on both the foliage and the wood layer, then a 22 % veil of leaf_shade.

### 7.7 Determinism, cost and the checks
- Every element takes its own `np.random.default_rng(seed)`; inside it, `kids(rng, n)` makes one child generator per
  pass, so stopping after a pass (`stop='wood' | 'zones' | 'dabs' | 'edges'`, the pass strip) never changes the passes
  before it, and adding strokes to one pass never reshuffles the next.
- Cost on one core: the near tree 2.1 s (~1550 dabs, ~280 edge clumps and notches, ~150 holes, accents and specks);
  a mid tree 1.3 s (~510 marks) and a far tree 0.9 s (~65 marks) on a 600 x 320 canvas: their time is the per-pad
  fields over the whole canvas, so an engine bake should compute the fields in the crown's box only; the bush 0.7 s;
  the reeds 0.5 s (~570 marks); the verge 0.25 s (~440); the protea 0.1 s (~130); the corner 0.1 s.
- `--check`: bakes the sheet twice and compares md5 (deterministic: True), then measures the near crown as section 1
  measured the refs: L* k-means 83 (5 %) / 70 (17 %) / 57 (23 %) / 44 (34 %) / 33 (22 %); the outer silhouette's
  mean 10-90 % edge width 0.88 px (ring area / outline length); sky holes 1.3 % of the crown.
- `--phone P.png`: the 400 px wide review sheet (ours x 400/1080, the refs x 400/1206), the check this recipe was
  judged by.

---

## 8. Next, to close the gap (not built; each one small)

1. **Variety in the design:** draw each tree's pads (or pick from 3-4 templates and drop 1-2 pads), vary the pad
   sizes more (0.6-1.4 x), let one or two pads break the dome; mid trees get 4-5 bigger pads instead of the near
   template shrunk.
2. **Two dab scales:** big lit shapes (3-5 % W, op 0.9) under the leaf dabs, so the light groups into bigger shapes
   as in the refs; then the mosaic on top.
3. **Painted undersides:** a few dark dabs (shade on deep) along each underside instead of the smooth gradient.
4. **Reeds:** longer sweeping strokes through the mass (0.5-1.0 hmax, 2-3 px, the gust's direction) and a second
   plume colour (a cooler, sky-lit plume on the shade side); a broken top on the verge.
5. **Protea:** 2-3 more bracts per ring, more overlap, a second hatch colour on the lit cap.
6. **Corner leaves:** 30-40 leaves in 2-3 tight clumps instead of 24 along the twig; 3 colour families mixed.
7. **In the scene:** bake the tree, bush, planter and corner pieces into scene 1 and judge them in context (these
   swatches sit on flat backgrounds).

---

## 9. Sources (research, 2026-10-29)

1. Painting Lessons with Marla, "5 Tips for Painting Foliage": light side and shadow side from the light's direction,
   shapes not leaves, no lights in the shadow, no scattered highlights.
   https://paintinglessonswithmarla.com/?p=70355
2. Tobio's Kits, "How to Paint Trees in Watercolor: Simple Shapes to Texture": sky holes (negative space) and the
   light/shadow contrast as the common faults. https://tobioskits.com/blogs/news/how-to-paint-trees-in-watercolor
3. Fine Art Tutorials, "Autumn landscape painting tutorial" (gouache): neutral mid tones first, shadow tones layered on
   top, background to foreground. https://finearttutorials.com/guide/gouache-autumn-landscape-painting-tutorial/
4. Fine Art Tutorials, "Atmospheric perspective": lighter, cooler, less contrast with distance, and the sunset
   exception: against a warm sky the far goes warmer and lighter. https://finearttutorials.com/guide/atmospheric-perspective/
5. CLIP STUDIO TIPS, "How to Paint Trees": leaf clusters shrink toward the crown's edge; three depth bands (far soft
   and low in contrast, mid some detail, near dark and detailed). https://tips.clip-studio.com/en-us/articles/7610
6. Open Culture, "A Look Inside the Painting Process of the Studio Ghibli Artist..." (poster colour, an opaque
   gouache-like medium, in layers; clear light and shadow shapes):
   https://www.openculture.com/2021/01/a-look-inside-the-painting-process-of-the-studio-ghibli-artist-kazuo-oga.html
7. "A Color Region Based Rendering of Trees Based on Shading Techniques of Background Art in Animation" (IPSJ): leaf
   painting in a few colours per region, spherical shading, aerial perspective, wind sway.
   https://ipsj.ixsq.nii.ac.jp/records/9641 ; related: "Controlling Color Regions of Leaves with Painting Techniques
   for Landscape Arts", Computational Aesthetics 2009, https://diglib.eg.org/xmlui/handle/10.2312/COMPAESTH.COMPAESTH09.025-032
8. MediBang Paint, "How to paint grasses": a dark base, then lighter strokes on a clipped layer, sampling the mid tone
   and repeating. https://medibangpaint.com/en/use/2021/05/how-to-paint-grasses

(Sources 5 and 7 were read through search summaries: their hosts were not reachable from this container. We learn
the method from these sources and from the refs; no artist is a style target, and nothing is traced or copied.)
