# Recipe: trees and greenery (painted pieces)

STATUS: IN PROGRESS (checkpoint 1: the LOOK section is written; the recipe and the proof follow).

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements?" This is that recipe for the greenery family: a tree crown, bushes in planters, grass and
wind-blown reeds, a near flowering plant (protea-like) and near leaves framing a corner.

## 1. What the references do (measured)

Sizes are px of our 1080-wide frame (the refs are 1206-wide phone screenshots: x 1080/1206).
Crops: `/tmp/recipes/foliage/crops/`.

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

### 1.3 Bushes and domes
- Cape Town domes: one flat colour each (deep green L* 30, olive L* 43), the inside brushed with broad dry strokes
  along the dome (texture std 3.3 L* at sigma 6, 1.6 L* fine grain), a lighter streak on the top; crisp circle edges.
- Singapore crowns: flat domes in 3-4 greens + one lit yellow-green, overlapping in rows, faint radial vein strokes,
  texture 4.4 L*.

### 1.4 Grass and reeds (02 bus stop, 01 hill, refs_paint 01 van)
- A MASS first: the reed bed is a dark band (L* 7-15 at night, 98 % of its pixels) with a ragged top leaning
  downwind; the strokes sit on it, never replace it.
- Lit strokes: 1.1-1.5 px wide (p90 1.4-3.5), 7-14 px long pieces (p90 16-77 px), leaning 33-49 deg from vertical
  downwind; the plume tips are the lightest (the sky's colour, L* 38-48 at night), the lower stems darker and nearer
  vertical; the very base lighter again in a mist band (02).
- Dune grass (van): thin light blades (L* 49-66) curving over a dark base mass (L* 12-21), a few seed heads.
- Hill grass (01): the edge of a dark mass broken by 1-2 px blades 6-20 px tall; a few lit tips; tiny pale flowers in
  drifts; 2-4 tall near blades framing the left edge, soft.
- Near out-of-focus plumes (02): big (60-250 px), dark, blurred (edges 4.5-8.6 px), low contrast.

### 1.5 The protea (05 Cape Town) and near leaves
- Dome: cream (L* 88, h 69) with a lower shade (L* 79), textured by fine radial strokes (1-2 px, 0.1-0.2 R long)
  radiating from a point below its centre.
- Bracts: pointed, length ~1.0-1.1 R, base width ~0.35 R, ~14 visible in 2 rings; each bract is TWO flat facets
  split along its midline (lit rose L* 65-67, shade rose L* 46, a dark accent L* 35): the folded-paper look.
- Leaves: long ellipses, two halves of different value split by a light midrib; 3 greens (L* 28-60).
- Near corner leaves (01 Singapore, 07 Kyoto): flat two-tone leaves with light vein lines (1-2 px), cut by the frame;
  maple leaves in 2-3 reds with faint radial veins. (Our scene: the owner, 2026-10-28, "the closest leafs and nature on
  the left are way too big and not as subtle as they need be": ours stay small.)

### 1.6 Texture
- Inside flat masses: fine grain 1.6-2.4 L* (std, < 1.5 px), mottle 2.3-3 L* (1.5-6 px); leafy crowns 8-10 L* because
  the dabs are structure, not noise.
