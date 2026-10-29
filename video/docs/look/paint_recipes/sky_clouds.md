# Recipe: sky and clouds (painted pieces)

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements?" This is that recipe for the sky family: the sky gradient (dusk, daylight), the near
cumulus, banks and decks in depth planes, thin horizon streaks, the sun and its glow, and a far flock. It sits under
the playbook's PAINTED PIECES rule and DIRECTION rules 4 and 6. Its numbers for the sky's base gradient obey
`CRAFT.md` section g, which wins.

- **The proof:** `video/scripts/look/paint/recipes/sky_clouds.py`, a standalone, seeded script (numpy, PIL, scipy,
  skimage; ~1200 lines). It writes `sky_clouds_swatch.png` next to this file: each element beside the reference crops
  that show it, the cumulus pass by pass, and the whole plate at phone width.
  - Run it: `python3 video/scripts/look/paint/recipes/sky_clouds.py [--plate P.png] [--check]`.
  - The plate paints in ~4 s and the sheet in ~13 s, on one CPU core.
  - The same seed gives the same bytes (md5 checked).
- **The scene:** an October canal evening at King's Cross, with a low sun on the left. Sizes are px of the
  1080 x 1920 frame. The sky plate is the frame's top 900 px, with the horizon at y 792, the sun at (196, 779) and
  the caption band at y 317-556.
- **The refs:** they are 1206 px wide phone screenshots. Every ref size below is scaled to our width
  (px x 1080 / 1206), because the phone shows both at full width.

## 0. How close it gets (honest, after one review-and-fix round)

| Element | Verdict at full size | At phone width (400 px) | The gap to the refs |
|---|---|---|---|
| near cumulus | **close in method and read.** One big form lit from the left. Billows with lit tops over rose-lilac undersides, skylit tops in the shade. Crisp lit edges, a soft lost base, scoops and blocky strokes inside. | reads as a painted, lit cloud: the strongest piece | the interior is smoother than 02 / p02. Fewer deliberate marks, no dragged streaks, no blocky chisel cuts in the silhouette (03), and the lit edge is still a slightly regular scallop chain. About 2/3 of the way. |
| sky gradient | calm, on palette, inside CRAFT g (caption band spread 1.08 L*). The hatch reads at 1:1. | a clean gradient (the refs' open skies read flat too) | texture 0.35 L* at sigma 4 against the refs' 0.45-0.60; none of 03's lighter sky gaps between banks |
| banks and decks | 4 planes, each softer and closer to the sky. The mid bank is lit from below (01's look), the far deck soft. | depth reads; the mid bank is a thin lit bar | 03 stacks several slabs with light gaps and ragged dragged ends; ours is one slab per plane |
| horizon streaks | thin, two-tone, lit near the sun | nearly invisible (by design: the far is the calmest part, CRAFT g.2) | far quieter than 03's horizon, which is a whole warm band |
| sun and glow | right by CRAFT: a flat disc one step over its band, a wide low warmth, no halo | a small pale disc | none for our rules (03's disc is brighter, as the look-here of a sunset shot) |
| far flock | the 03 method: two-stroke birds, clumps, poses, near = bigger | reads as a dotted arc | fine |

**Overall:** at phone width our plate is a light, calm, harmonious dusk sky in which the cumulus carries the paint. The
refs are full-bleed illustrations with mid-dark skies. Ours must hold captions in a light field, so it will always be
quieter. The method transfers; the dose, and the mark-making inside the masses, still sit below the refs.

The next steps that would close the gap are in section 6.

---

## 1. What the references do (measured)

Measured with `/tmp/recipes/sky_clouds/work/measure*.py`. The crops are in `/tmp/recipes/sky_clouds/crops/`. L* is
CIELAB. "Range" is the p2-p98 spread. "Residual" is the std of L* minus its Gaussian blur at sigma 1.5 / 4 / 12 px.

### 1.1 The open sky: one value, alive in hue and in a faint texture
| Ref | Base | Range | Residual (1.5 / 4 / 12) | What the eye sees |
|---|---|---|---|---|
| 03 beach dusk (top) | #886f96, L* 49-50, C* 25, hue 316 | **4.1** | 0.36 / 0.60 / 0.86 | one violet, crossed by a faint hatch (below) |
| 05 Cape Town (poster) | #cad7dd, L* 84-86 | **4.1** | 0.31 / 0.45 / 0.56 | a flat pale blue with a fine paper tooth; big soft patches under 0.3 L* |
| 01 Singapore (poster) | #d0dbdb, L* 84-94 | 5.8 | 0.71 / 0.82 / 0.91 | flat, with a few big soft lighter patches |
| p01 beach van | #7a99d0 top to #dca3c3 pink | 10.8 | 0.35 / 0.48 / 0.92 | a smooth vertical gradient, blue-lavender to pink, with soft blotches (1.4 L* at 12-48 px) |
| 01 city hill | plum L* 35 to cream L* 89 | 27 | 0.94 / 1.89 / 3.59 | a full sunset gradient (not our case: our caption band must stay flat) |

- **The 03 hatch:** thin straight lines rising to the right at ~35 deg, 2-3 px wide and ~9 px apart, +-0.6 L*. It
  sits in patches, never everywhere.
- **The rule they share:** over large areas the open sky moves less than 6 L*. Its life is hue (a cool top, a warm
  horizon) plus a texture of +-0.3-0.7 L*. The value contrast lives in the clouds, not in the sky.

### 1.2 The near cumulus: 3-4 values, in the sky's own hue, clearly off the sky
| Ref | Sky | Cloud values (lit to deep) | The cloud against its sky |
|---|---|---|---|
| 02 bus stop night | L* 16-20, hue 291 | 51 / 46 / 40 / 30, hue 283-292, C* 41-49 | +20 to +30 (moonlit, lighter) |
| 03 beach dusk | L* 49, hue 316 | 43 / 38 / 35 / 32, hue 317-324, C* 27-29 | -6 to -17 (backlit, darker) |
| p02 lighthouse (near) | ~L* 78 | 97 / 89 / 81 / 72 / 64, hue 247-253 | +19 lit, -14 shade |
| p02 lighthouse (far layer) | ~L* 78 | 84 / 80 / 76 / 70 | +-6: almost the sky |
| 04 cloud beast | L* 53 violet | 83 cream / 75 orange / 65 coral / 60 pink | +7 to +30, the hue swinging warm |

- **Hue:** every cloud stays within 10 deg of its sky's hue and is a little more saturated. Only the 04 glow cloud
  swings warm.
- **Value:** the internal range is 11-33 L*. The cloud sits 6-30 L* off its sky.

### 1.3 Edges (10-90 % width, px at 1080)
| Edge | Width | Where |
|---|---|---|
| crisp | 1.6-3 | 03's horizon band top (1.6), the sun disc (2.3), 03's bank tops (2.4-3.1), the Cape Town table cloud top (2.6) |
| firm | 3-6 | 02's lit cloud head (2.8-5.6), 03's blocky cumulus top (5.1) |
| soft | 7-15 | p02's near cloud, lit but turning (7.5); 02's head where it turns away (14.5) |
| lost | 29-35 | p02's whole far layer (29); 04's shade side dissolving into the sky (35) |

- **Crisp and firm edges** face the light, or are a flat bank's top.
- **Soft edges** turn away from the light.
- **Lost edges** are the far plane's, and the shade side's.
- **Broken edges** come in two kinds. A **speckle dissolve** is 03's cumulus top right: dots of 1-3 px, dense at the
  mass and thinning over ~60 px. A **vertical drag** is 02's left half: striations 1-2 px wide, 3-8 px apart.

### 1.4 Strokes, shapes and layers
- **03 (the owner's model).**
  - The cumulus is a few huge soft masses, 150-300 px, with blurred interiors (range 4.4 L* inside a 270 x 120 px
    patch).
  - Its silhouette is cut by **blocky flat-brush stamps**: square-ended chunks 15-40 px wide, a few thin straight
    flicks, and one speckle dissolve.
  - The banks are **long level flat strokes**, 20-40 px tall and 200-600 px long. They have crisp tops, ragged dragged
    ends and **gaps of lighter sky** between them.
  - Toward the horizon they flatten into strips 3-8 px tall, whose undersides near the sun are lit salmon (#b4728a,
    L* 56).
- **02 (the owner's model).**
  - One big cloud: 3-4 big soft shapes and **one crisp round head**, a 170 px billow facing the light with a 3-5 px
    edge.
  - The far side is dragged into vertical streaks, and a patch of dark speckle breaks the middle.
  - The wisps are **wide flat-brush sweeps** (40-70 px), with a crisp square start, one crisp side and one feathered
    side.
- **p02 (the owner's recipe).**
  - **The far layer:** big scooped strokes 60-150 px wide, all blurred (edges ~29 px), within +-6 L* of the sky.
  - **The near cloud:** **scoop strokes**, C-shaped flat strokes along each billow, each with a crisp convex edge
    (5-8 px) and a soft concave edge. A few carry 3-6 parallel bristle lines.
  - The lit tops are near white; the shade is the sky's blue, deeper.
- **04.**
  - The lit edge is a chain of small bumps of varied size (r 12-45 px), crisp but dry-brush grainy, with light flecks
    just outside it.
  - The shade side is a lost, grainy dissolve (35 px).

### 1.5 Horizon, sun, flock (03)
- **The horizon band:** a narrow stack of three warm values, #f7d3a9 (L* 87), #e9a791 (74) and #c97c87 (60). Its top
  edge is crisp (1.6 px), and it is brightest at the sun's x.
- **The sun:** a small, nearly white disc (#f3d7c8, L* 88, C* 13), ~13 px across at 1080, with a crisp edge (2.3 px).
  Its bottom is cut level by the band in front of it. The glow is small: only the band and the nearest cloud
  undersides warm.
- **The flock:** about 60-90 birds over 44 % of the width, in a band ~7 % of the width tall.
  - **Each bird:** 2 strokes (a V, a gull's M, or level wings). The wingspan median is 3.6 px (p90 8).
  - **Value:** L* 13 at the darkest (#31153e) on a sky of L* 33, so 20 L* darker.
  - **Spacing:** loose clumps; the nearest neighbour is 7 px away at the median (p90 14).

---

## 2. The shared method (every element)

**The method in one line: design flat, then brush in layers, blurrier first and crisper last, then soften by
distance.**

1. **Design** the flat shapes in one colour family lit by one light: 3-4 values per mass plus the sky. Value
   grouping: Proko's lesson (source 6).
2. **Brush** the design in passes, coarse to fine, as Hertzmann does (source 1): big soft strokes blurred, then
   flat-brush strokes along the form, then a few crisp strokes at the light edges, then texture on near masses only.
3. **Each plane** converges on the sky behind it and blurs more the farther it is (sources 5, 9).

### 2.1 The limited palette: 15 swatches per light, sampled from the scene's light
- **The dusk set** is sampled from the approved v4 design's sky, then set by target CIELAB values:
  - **The sky** keeps CRAFT g: the zenith only 1.1 L* deeper than the flat field, the band the lightest, the
    cool-warm crossing at C* 7.
  - **The clouds** take the refs' range (1.2): lit +6, half at the sky's value (a hue step), shade -14, deep -23
    against the field.
  - **Hue families** (gamut-mask style, source 3): lilac 293-310, rose 30-350, peach-gold 46-84. Nothing outside them.
- **The rule:** every stroke takes one swatch, or a mix of two neighbours, made in OKLab.

| Swatch | Dusk | L* C* h | Role | Day |
|---|---|---|---|---|
| zenith | #c7c6e6 | 80.9 17 293 | the top, a touch deeper and cooler | #b5d0df |
| field | #d3c8dd | 82.0 12 310 | the caption field, flat y 317-556 | #c0d5df |
| rose | #e6ccd7 | 84.4 11 349 | under the field (y 655) | #cddde1 |
| band | #eddcd6 | 88.9 7 46 | the light band, the sky's lightest (y 738) | #e0e7e1 |
| horizon | #f3d6c3 | 87.5 15 61 | the horizon = the far AIR (y 792) | #e9e5da |
| glow | #ffdfbe | 90.7 21 73 | the sun's warmth; lit undersides near the sun | #f4edde |
| sun | #fff0db | 95.5 12 82 | the disc | #fcf9f2 |
| rim | #ffe8c3 | 93.0 21 84 | the lightest cloud value: thin, at sun-facing edges | #fbf9f3 |
| lit | #ffd5ae | 87.9 27 70 | cloud lit, peach-gold | #f4f0e9 |
| half | #f2bdb6 | 81.1 21 31 | the half-light: rose-peach AT the sky's value | #d2dfe4 |
| shade_top | #b8b1cf | 73.6 17 300 | shade facing up, lit by the sky dome | #c5d4dd |
| shade | #ab9fc2 | 67.5 20 304 | cloud shade, lilac-violet (field -14) | #aec1cf |
| deep | #9985ad | 58.6 24 310 | accent: the core, the base away from the sun (field -23); small areas | #95abbf |
| streak | #ddbecd | 80.0 14 346 | horizon streak body | #cedce2 |
| bird | #5a506f | 36.1 20 304 | the flock | #53606a |

- **For another film or another light:** sample the zenith, field, band and horizon from the film's own sky rig.
  Then set the cloud swatches at the same offsets from the field: lit +6 L* (C* up ~10 toward the light's hue), half
  +-0 (a hue step toward the light), shade_top -8, shade -14 and deep -23 (C* +5..+10, hue toward the sky's cool
  side).

### 2.2 The light: one sun, seen from each plane
- **The direction:** `l = normalize((1 - top) * unit(sun - centre) + top * (0, -1))` per mass. `top` is the sky-dome
  share.
- **With the sun at (196, 779):**
  - the near cumulus (top 0.5) is lit from (-0.92, -0.40): **the left, a little above**;
  - the mid bank (top 0.3) from (-0.28, +0.96): **below**, giving the lit undersides of a sunset (ref 01);
  - the far deck (top 0.2) from (-0.96, +0.29).
- **3-D:** add `lz = 0.3`, a little frontal light, so the lit caps are more than a thin rim.

### 2.3 The brush kit (each one a stamp swept along a path: 5.2)
| Brush | Across profile | Size at 1080 | Opacity | Where |
|---|---|---|---|---|
| **round soft** | Gaussian, sigma 0.32 w | sky 40-320; cloud 0.35-0.55 r | 0.25-0.45 | underpainting (P1) |
| **flat chisel** | flat core; one edge crisp (1-1.5 px), the other soft (0.4-0.45 w) | 9-44 wide, length 2-6 w | 0.5-0.85 | blocky strokes (P2), streaks |
| **scoop** | the flat chisel on an arc concentric with the billow, crisp on the convex side | 0.2-0.34 r (10-44 px) | 0.6-0.85 | billow edges (P2) |
| **rim** | the flat chisel, outer edge 0.7 px, inner 0.55 w, tapered 80 % | 5-10 px | 0.85-0.95 x warmth | sun-facing silhouette (P3) |
| **dry** | any brush x the bristle texture past a threshold rising toward the tail | as the brush | as the brush | tails of blocks and scoops (dry 0.1-0.4) |
| **speckle / fleck** | a disc, AA 1 px | r 0.6-1.6 (holes, flecks); 1-2.4 (light spatter) | 0.3-0.9 | near masses only |
| **hatch** | parallel lines (a field, 5.5) | 2-3 px, 9 px apart | +-0.7-1.2 L* | open dusk sky (P3) |

### 2.4 The pass order (per mass): each pass blurred LESS than the one before
| Pass | What | Blur after (near / mid / far) |
|---|---|---|
| P0 | the flat design, brushed soft | 4.0 / 3.0 / 2.5 px |
| P1 | big soft round strokes along the form | 7 / 6 / 5 |
| P2 | scoops and level flat strokes along the form; blocky strokes on the shade body | 0.6 / 1.0 / 1.5 |
| P3 | the crisp light edges: rims, lit undersides | 0 / 0.6 / 1.0 |
| edges | the alpha: crisp toward the light, soft or lost away | (5.4) |
| P4 | speckle and fleck (near only) | none |
| plane | converge on the sky by k, then blur | 0 / 1.3 / 2.4 |

### 2.5 The depth ladder (planes, near to far)
| Plane | Example | k (toward the sky) | Plane blur | Edge lit / shade / base | Values kept | Strokes |
|---|---|---|---|---|---|---|
| 1 near | the cumulus, top right | 0 | 0 | 1.8 / 16 / 22 px | 4 + rim (L* 58-90) | P1 2-4/billow, scoops 1-5/billow, 7 blocks, 7 rims, 70 specks |
| 2 mid | the bank, upper left | 0.22 | 1.3 | 2.6 / 10 / 2.6 (the lit base) | 4, range x 0.78 | P1 1-3, 11 level strokes per big hump, an underside |
| 3 far | the deck in the west gap | 0.38 | 2.4 | 3.5 / 12 / 3.5 | 3, range x 0.62 | P1 1-3, 8 level strokes per big hump, an underside |
| 4 farthest | the horizon streaks | (sky +-5 L*) | none (edges 0.6-1.6) | | 2 (body, lit underside) | one stroke pair each |

**Moving back one plane:**
- the shapes get flatter: the hump height/width falls from 1.0 (near) to 0.36-0.52 (mid) and 0.23-0.33 (far), then
  to strips 3-12 px tall;
- the edges soften;
- there are fewer strokes;
- the colour moves toward the sky behind it (warmer near the sun, cooler away from it).

---

## 3. The elements

### 3.1 Sky gradient (dusk and daylight)
**(a) DESIGN.**
- **The shape:** one smooth gradient, frame top to horizon. The key colours are placed at heights and joined by one
  monotone cubic (PCHIP) per OKLab channel: no stop line, no overshoot.
- **Dusk stops:** zenith y 0, field y 317, field y 556 (flat through the caption band), rose y 655, band y 738,
  horizon y 792 and below.
- **Daylight stops:** zenith 0, field 317 and 556, rose 690, band 772, horizon 792.
- **The sun's warmth (dusk only):** an ellipse round the sun. rx = 0.44 W (475 px), ry = 0.45 rx (214 px), strength
  0.55 toward `glow`. It falls to 0 at the rim with a smootherstep and is cut off above y 556 by a smoothstep over
  90 px, so it never enters the caption band.
- **Value plan:** a single value (spread <= 6 L* outside the horizon band). The life is in hue.

**(b) PAINT PASSES.**
1. **P1 broad wash.** 14 round soft strokes, width 160-320 px, length 0.5-1.1 W, angle -4 +- 2 deg.
   - **Colour:** the sky under the stroke +- 0.9-1.4 L*, with a +-0.3 a/b jitter. Opacity 0.30-0.45.
   - **Then blur sigma 24.**
2. **P2 mid wash.** 70 round soft strokes, width 40-90, length 0.25-0.6 W, angle -5 +- 3 deg, +- 0.8-1.3 L*, opacity
   0.30-0.45. **Then blur sigma 6.**
   - **Inside the caption band +-30 px**, P1 and P2 keep 30 % of their variation.
3. **P3 the hatch (dusk).**
   - **Lines:** 35 deg rising to the right, 2-3 px wide, 9 px apart (each line jittered +-25 %).
   - **Segments:** each line is broken into segments correlated over ~70 px, and 55 % of each line is drawn. 62 % of
     the lines are lighter and 38 % darker.
   - **Amplitude:** +- 0.012 x (0.6-1.0) in OKLab L (~0.7-1.2 L*).
   - **Where:** in patches covering ~55 % of the sky (noise cell 150 px, stretched x2 along the hatch). It is x0.25
     in the caption band and fades out between y 640 and 760.
4. **P4 the paper tooth (daylight, instead of the hatch).** A 0.9 px noise of +-0.35 L*, stretched x2.5 vertically
   (fibres), plus 120 px patches of +-0.3 L*.
5. **Output dither (CRAFT g.4):** +-2 codes at a 2 px grain, so the encode keeps no band.

**(c) EDGES.** There are none: the sky has no shapes. Every value change is wider than 150 px, except the hatch lines,
which are 2-3 px with 0.6 px AA.

**(d) DEPTH.** The sky is the back plane. Its lowest colour (`horizon`) is the AIR that every far plane converges on.

**(e) MISTAKES TO AVOID.**
- An even streaky texture over everything: v1-v2's sky strokes, and this recipe's first pass with 300 dry streaks at
  -7 deg. It reads as a filter.
- A gradient with visible stops.
- Paint in the caption band. Keep it within 1.5 L*; this one measures 1.08.
- A deep zenith. CRAFT caps it at ~1.3 L* below the field, so the richness comes from chroma (C* 17), not depth.

**(f) IMPLEMENTATION.** `sky_ramp`, `sun_warmth`, `paint_sky`, `hatch_field` (5.5).

### 3.2 The near cumulus (plane 1)
**(a) DESIGN.**
1. **Billows.** A hand-placed list `(cx, cy, r, flat, z)` of 10-14 billows.
   - **Size ladder:** 1 : 0.75 : 0.55 : 0.4 : 0.25 : 0.15. Here r is 132, 104, 80, 78, 74, 70, 66, 56, 37, 36, 27,
     19, 15, 15.
   - **Placement:** the biggest at the back of the tower, the smallest only along the lit edge and at irregular
     spacing. Never a necklace of equal bumps.
   - **The silhouette:** a tower rising to the right, cut by the frame (things cut by the edges). It is kept clear of
     the caption band (here x 640-1080, y 0-300). Each billow's radius wobbles +-4.5 % in 3 slow harmonics.
2. **Draw order z.** Each billow farther from the light sits IN FRONT, so its lit edge lies over the shade side of the
   one behind it. The base row recedes: it sits behind the tower, which avoids crescents.
3. **The base:** one level line (y 300), wobbling +-16 px. The union is cut by it with a smooth min (18 px).
4. **The value plan.**
   - **F_big:** the whole mass lit as ONE form: 0.5 x the light's attenuation through the mass + 0.5 x the big
     shape's facing (the mask blurred at sigma 0.35 r_max).
   - **Plus each billow's sphere light,** at weight 0.42.
   - **Plus a cap at each billow's sun-facing rim:** gain 0.22, depth 0.4 r. A billow deep in the shade gets almost
     none (floor 0.05).
5. **Cut F into 4 values:**
   - < 0.14 and low on the mass: **deep**;
   - < 0.40: **shade** (toward `shade_top` where it faces up);
   - < 0.68: **half**;
   - above: **lit**;
   - plus a 5 px **rim** where the silhouette faces the light.
6. **The result here:** L* 58-90 against a field of 81.6 (median 69).

**(b) PAINT PASSES** (per billow, back to front; colours always from the plan under the stroke).
1. **P0:** the flat design, blurred sigma 4.
2. **P1:** 2-4 round soft strokes per billow (round(3 x (0.5 + r / r_max))), tangent to the billow +- 14 deg.
   - **Size:** length 0.6-1.1 r, width 0.35-0.55 r, opacity 0.25-0.4.
   - **Colour:** the plan +- 0.8 L*.
   - **Then blur sigma 7.**
3. **P2 scoops:** on each billow's VISIBLE lit arc (light angle +- 100 deg, kept only where the billow owns the pixel),
   1-5 scoops (1 + 4 r / r_max).
   - **Shape:** width 0.2-0.34 r, clamped 10-44 px. The first spans 70-95 % of the arc with its convex edge ON the
     billow's edge. The next span 35-70 % and step inward by 0.7-1.1 widths.
   - **Edges:** crisp convex edge 1.1 px, soft inner edge 0.45 w; 55 % taper; dry 0-0.3; opacity 0.6-0.85.
   - **Colour: one value step up.** In the lit zone, toward `lit`/`rim`; in the half zone, toward `lit`; in the shade,
     toward `shade_top`. Mix 0.55 for the first scoop, 0.33 for the inner ones. In the shade zone the opacity drops
     to 55 %.
4. **P2 shade scoops:** on billows over 0.25 r_max, 2 darker (-1 L*) soft scoops on the shade half (r 0.55-0.8,
   width 0.2-0.32 r, edges 5 px / 0.5 w, opacity 0.25-0.4).
5. **P2 blocks:** 7 level flat strokes on the shade body.
   - **Shape:** length 0.3-0.8 r_max, width 14-28, wind -6 +- 4 deg; crisp top 1 px, soft bottom 0.4 w; dry 0.15-0.4;
     opacity 0.5-0.75.
   - **Colour:** alternately mixed 35-55 % toward `shade_top` and toward `deep`.
   - **Then blur sigma 0.6.**
6. **P3 rims:** on up to 7 billows (r >= 24, the most sun-facing first), along the silhouette arc that faces the light.
   - **Shape:** width 5-10 px (scaled by r), outer edge 0.7 px ON the outline, inner edge 0.55 w; 80 % taper.
   - **Colour:** `lit` -> `rim` by warmth (closer to the sun = warmer). Opacity 0.85-0.95 x warmth.
   - **No blur.**
7. **P4 speckle:** 70 tries in a band 10 px in to 30 px out, only on the far base (right of centre + 0.3 r_max) and
   where the big form faces away from the light (< -0.55).
   - **Density** falls as exp(-d / 14).
   - **Inside** the edge: holes of sky (r 0.6-1.6, 50-90 %). **Outside:** flecks of the cloud's colour (25 % toward
     the sky).
   - **Plus 8 light flecks** (r 1-2.4, `rim`, opacity 0.3-0.6) up to 30 px off the lit edge.

**(c) EDGES** (the 10-90 % width of the alpha).
- **Lit (facing > 0.1):** 1.8 px. These are the silhouette's lit side and its tops.
- **Turned away (facing < -0.45):** 16 px.
- **The base:** 22 px, lost, with a horizontal dry break (+-0.12 x 22 px, noise stretched x8 along the wind).
- **Turned-away sides only:** a dry break of +-0.7 x the edge width (4 px noise, stretched x7 along the wind), plus a
  fine 1 px grain of +-0.14 x the edge width. Never on the base and never on undersides: that reads as foam.
- **Inside the mass,** edges come only from strokes. The scoops' convex edges are crisp; everything else is P0/P1 soft.

**(d) DEPTH.** This is plane 1: k 0, no plane blur, the full value range. It is the biggest and strongest mass, and it
carries the paint.

**(e) MISTAKES TO AVOID** (all seen in v1-v5 or in this recipe's first pass).
- **Eggs:** a full light-to-shade ramp per billow. Here the per-billow weight is <= 0.45, and the big form leads.
- **The lit band following the whole outline** (v4's big crescent). The billows on the lit side need their own
  undersides one step down.
- **Two-edged crescents:** a cap has ONE crisp edge, and its terminator is soft (>= 0.3 r). Billows deep in the shade
  get no cap, and the base row sits behind.
- **A necklace of equal scallops.**
- **Airbrushed blobs:** big blurs with no crisp stroke (the earlier run's P1 blur was 12 px).
- **Drips:** a vertical drag at a flat base.
- **Gravel:** a band of dots along the base.
- **Foam:** grain on undersides.
- **Pale:** the cloud within 4 L* of the sky (v3, this recipe's first pass).
- **Cartoon outlines:** there is no dark line round anything.

**(f) IMPLEMENTATION.** `paint_mass` with `DEPTH['near']`. The geometry, plan and edges are in 5.3-5.4.

### 3.3 Banks and decks in depth planes (planes 2 and 3)
**(a) DESIGN.**
- **The shapes:** 6-8 flattened humps on one level base, with a thin wisp above (flat 0.13-0.15).
  - **Mid bank:** flat 0.36-0.52, r 25-112, base y 240, spanning x -90 to 500.
  - **Far deck:** flat 0.26-0.33, r 40-86, base y 686, x 0-740.
  - **Sizes** fall toward the bank's far end.
- **Light from below** (the low sun): the base is the LIT edge, crisp and warm. The top faces the sky dome, as
  `shade_top`.
- **The same value plan as 3.2,** with less per-billow light (0.35 mid / 0.30 far).

**(b) PAINT PASSES.**
- **P0:** blur 3 / 2.5.
- **P1:** 1-3 round strokes per hump, level at the wind angle +- 3 deg, width 1.6 x 0.35-0.55 x r x flat. Blur
  6 / 5.
- **P2:** 11 / 8 level flat strokes per big hump (scaled by (r / r_max)^0.6).
  - **Shape:** width 9-20 / 6-12, length 0.5-1.1 r, wind -3 / -2 +- 2 deg; dry 0.1-0.35; opacity 0.5-0.8.
  - **Edges:** crisp on the side toward the light (here the bottom, 1 px), soft opposite (3 px).
  - **Colour:** the plan, +1.2 L* on the lit half and -0.8 on the shade half.
  - **Blur 1.0 / 1.5.**
- **P3 the lit underside:** level strokes along the base in segments.
  - **Shape:** length 70-220 px, gaps 20-70, width 6 / 4 px (x 0.8-1.2); crisp bottom 0.8 px, soft top 2.2; 40 %
    taper.
  - **Colour:** `lit` -> `glow` by nearness to the sun, exp(-|x - sun_x| / 380), +0.8-2.8 L*.
  - **Opacity:** 0.55 + 0.4 x nearness.
  - **Blur 0.6 / 1.0.**

**(c) EDGES.**
- **Lit base:** 2.6 / 3.5 px.
- **Top (turned away):** 10 / 12 px, with a dry break of only +-0.22 / 0.35 x the edge and a grain of 0.08 / 0.06.
  More combs the top edge: the mid bank's first pass did.

**(d) DEPTH.**
- **Mid:** k 0.22, blur 1.3.
- **Far:** k 0.38, blur 2.4.
- **Each farther plane** is flatter and simpler, and its colour leans toward the sky behind it: warmer near the sun.
- **Spacing:** the banks sit in the open sky above and below the caption band, never inside it.

**(e) MISTAKES TO AVOID.**
- A lumpy strip with a sawtooth bottom (the earlier run's mid bank).
- A hairy, combed top edge.
- Planes that differ only in size: they also differ in blur, k, flatness and stroke count.
- Banks the same value as the near mass (no depth).

**(f) IMPLEMENTATION.** `paint_mass` with `DEPTH['mid']` / `DEPTH['far']` and `fl < 0.6` humps, which switch P2 to
level strokes.

### 3.4 Thin horizon streaks (plane 4)
**(a) DESIGN.** 4 rows above the horizon.

| Row y | Width (px) |
|---|---|
| 776 | 3-5 |
| 762 | 4-7 |
| 744 | 5-9 |
| 718 | 6-12 |

- **Length:** log-uniform, 70 to 520 - 80 x row px.
- **Gaps:** 30-160 x (1 + 0.4 x row) px.
- **Tilt and jitter:** +-0.35 deg; each streak's y jitters +-2.5 px.
- **Two tones per streak:**
  - **The body:** the sky behind it mixed 90 % (minus 10 % per row) toward `streak`, which itself moves 15 % per row
    toward `shade`, then -1.2 L*. That puts it about 6-8 L* under the band.
  - **The underside,** lit by the sun.

**(b) PAINT.** One flat stroke pair per streak.
- **The body:** opacity 0.7-0.9.
- **The lit underside:** 0.42 w wide, offset 0.32 w down. Colour: the body mixed toward `glow` by 0.45 + 0.55 x
  nearness, +1.2-5.2 L*. Opacity 0.45 + 0.5 x nearness, with nearness = exp(-|x - sun_x| / 340).

**(c) EDGES.**
- The body is crisp below (0.8 px) and softer above (1.6).
- The long taper (45 % of the length) is on the end away from the sun; 15 % at the end toward it.

**(d) DEPTH.** This is the farthest plane: the lowest contrast, no texture, no blur pass.

**(e) MISTAKES TO AVOID.**
- Streaks the same length and spacing (a barcode).
- Streaks lit everywhere: only near the sun.
- Streaks crossing the disc in front.

**(f) IMPLEMENTATION.** `paint_streaks`.

### 3.5 The sun and its glow
**(a) DESIGN.**
- **The disc:** r 20 px, colour = the band just above the disc mixed 85 % toward `sun`. That is one flat step over its
  band (CRAFT g.2), never saturated.
- **Its lower part** sits behind the far roofs, which cut it with one level edge.
- **The glow** is the sky's warmth ellipse (3.1 a) plus the warm lit undersides of the streaks and decks nearest the
  sun. **No halo disc.**

**(b) PAINT.** One flat shape, then the roofs over it.

**(c) EDGES.** 1.2 px (smoothstep over r +- 0.6).

**(d) DEPTH.** It belongs to the sky plane. It must not out-contrast the subject (DIRECTION rule 6).

**(e) MISTAKES TO AVOID.**
- A saturated orange disc as a pop (v2-v4).
- A radial gradient halo or a ring.
- A glow reaching into the caption band.

**(f) IMPLEMENTATION.** `sun_warmth`, `paint_sun`.

### 3.6 A far flock
**(a) DESIGN.**
- **The arc:** 46 birds along a quadratic arc, here (330, 612) -> (520, 576) -> (760, 600), in the open sky under the
  caption band.
- **Clumps:** 82 % of the birds sit in 9 clumps (sigma 0.045 of the arc along it and 13 px across it); 18 % are
  stragglers (+-36 px).
- **Size:** the wingspan grows toward the near end, 3.5-9.5 px x 0.75-1.15.

**(b) PAINT.**
- **Each bird:** 2 quadratic wing curves from the body to the tips.
  - **The tips:** lift N(0.25, 0.3) x the half span, clipped -0.35..0.75: a V, level, or down.
  - **The wing:** arched 0.12-0.3, with a tilt of N(0, 0.12).
  - **Line width:** 0.9-1.7 px, thicker for nearer birds.
- **Drawing:** at 4x and box-filtered down, then laid over the sky at 92 %.

**(c) EDGES.** Crisp, the one fine dark crisp thing in the sky (DIRECTION: fine strokes only where a thing is fine).

**(d) DEPTH.** The far end is mixed 55 % toward the sky; the near end takes the full `bird` swatch (about 20 L* under
its sky at the near end, as in 03).

**(e) MISTAKES TO AVOID.**
- Even spacing.
- One pose copied.
- Birds as dots or as letters (a "^" glyph).
- Birds over the caption.

**(f) IMPLEMENTATION.** `paint_flock`.

---

## 4. Mistakes that made v1-v5 (and this recipe's first pass) fall short: the rule for each

| Seen | Why it failed | The rule now |
|---|---|---|
| v1-v2: an even streaky texture over the sky and every piece | reads as a filter, not as painting | texture only in patches, at <= +-1.2 L*, x0.25 in the caption band; brush marks only where a form is |
| v2-v3: smudging, greying, pale tone-on-tone masses | strokes averaged into grey; values too close | each stroke one swatch (or two neighbours) mixed in OKLab; the planned blur per pass only; the cloud 30 L* inside, 6-23 off the sky |
| v2-v3: combed and hairy edges (the tree, the mid bank's top) | a dry break too strong on a soft edge | the dry break <= 0.25 x the edge width off the near mass; never on a lit edge |
| v4: crescents (the lit band along the outline, accent billows) | a two-edged light shape reads graphic | one crisp edge per lit shape, a soft terminator, no cap deep in the shade, the base row behind |
| this recipe's first plan: eggs | every billow shaded fully | the big form leads (per-billow light <= 0.45) |
| v4-v5: cartoon outlines, a yellow lit top too large | outlines draw a cartoon; one hue for half the mass reads flat | no outlines; lit / half / shade_top / shade / deep in the planned proportions |
| the earlier run of this recipe: airbrushed blobs, a necklace of equal bumps, drips, gravel | blur 12 with no crisp stroke; equal r; a vertical base drag; 520 dots in one band | P0 <= 4 px and P1 <= 7 px, then crisp P2/P3; the size ladder; a horizontal base break; <= 70 specks only on the far side |

---

## 5. Implementation spec (numpy / PIL), as built in `sky_clouds.py`

### 5.1 Colour and layers
- **Colour space:** all colour is OKLab (Ottosson's matrices: `rgb2ok`, `ok2rgb`). The palette hexes are converted
  once, and mixing is linear in OKLab.
- **A `Layer`** holds `c` (H x W x 3, OKLab) and `a` (H x W, straight alpha).
- **Painting a coverage map** `cov` (0..1) of one colour, source-over:
  `ao = cov + a(1 - cov)`, `c += (col - c) * cov / ao`, `a = ao`.
- **Blurring a layer** works premultiplied: `c = G(c*a) / G(a)`, `a = G(a)`, with no dark fringes. A sigma >= 6 runs on
  a copy downsampled by sigma/3, then resized back.
- **Output:** sRGB 8-bit plus the CRAFT g.4 dither: a 1 px-correlated noise x0.7 code plus a TPDF of +-0.5 code.

### 5.2 A stroke = a stamp swept along a path (no stamp seams)
- **The frame.** For every pixel in the path's bounding box, compute u (0..1 along) and s (px across; + = the right of
  travel, which is DOWN for a left-to-right stroke).
  - **A line:** `u = ((p - p0) . t) / L`, `s = (p - p0) x t`.
  - **An arc** (centre c, radius R, a0 -> a1, flattening fl): `u` = the angle fraction,
    `s = |(x - cx, (y - cy) / fl)| - R` (+ outside, the convex side).
- **The width with taper:** `w(u) = w (1 - tau + tau sqrt(sin(pi u)))`.
- **Across:**
  - the flat chisel: `smoothstep(w/2 + e+, w/2 - e+, s) * smoothstep(-w/2 - e-, -w/2 + e-, s)`, so the two sides get
    their own softness;
  - the round soft brush: `exp(-0.5 (s / 0.32 w)^2)`.
- **Along:** `smoothstep(0, t_in, u) * smoothstep(1, 1 - t_out, u)`.
- **Dry:**
  - multiply by `smoothstep(th - 0.1, th + 0.1, T(u L + o1, s + o0))`, with `th = dry (0.25 + 0.75 u^1.5)`, so the
    tail breaks first;
  - `T` is the bristle texture: 256 x 2048 uniform noise blurred (0.7, 14) + 0.6 x noise blurred (3, 60),
    rank-normalised to 0..1;
  - each stroke samples it at its own random offset.
- **The equivalent with stamps** (Krita-style dabs, source 8): stamp the across profile every 0.1-0.15 w along the
  path, with the opacity per dab = 1 - (1 - op)^(spacing / w). The sweep is used because it needs no spacing tuning.

### 5.3 Masses: geometry and the value plan
- **Billow SDF:** `d = r (1 + 0.045 (0.6 sin 2th + 0.3 sin 3th + 0.2 sin 5th + phases)) - |(x - cx, (y - cy)/fl)|`.
  The phases are seeded by the billow's index.
- **The union:** a polynomial smooth max over the billows (k 6 / 10 / 12 px), normalised by `|grad d|`. Cut by the base
  with a smooth min (`base_y - y + wobble(x)`, the wobble a 40 px noise stretched x4). Trapped sky slivers are filled.
- **The owner map:** in z order, `owner[d_i > 0] = i`. The union's fillets go to the nearest billow (an EDT index).
- **The light depth:** `od = sum over k = 1..30 of M(p + k step l) step`, with step 0.05 r_max, blurred 1.5 steps.
  `att = exp(-od / (penetration r_max))`, with penetration 1.0 / 1.2 / 1.4.
- **The big form:** `Mb = G(M, 0.35 r_max)`. `facing_big = -(grad Mb . l) / |grad Mb| * smoothstep(0, 1, |grad Mb| sigma 2.5)`.
  `F_big = 0.5 att + 0.5 (0.5 + 0.5 facing_big)`, normalised to its p2-p98 inside.
- **The billow sphere:**
  - `(u, v) = ((x - cx) / r, (y - cy) / (r fl))`, clamped to the unit disc;
  - the normal `n = normalize(u, v / fl, sqrt(1 - u^2 - v^2))`;
  - `lam = max(0, n . normalize(l.x, l.y, 0.3))`.
- **The cap:** `t_rim` = the distance (px) from p to the billow's rim along l (a ray-circle hit in unit space x r).
  `cap = smoothstep(0.3, 0.8, lam) * smoothstep(cap_w r, 0, t_rim)`.
- **F:** `F = (1 - w_b) F_big + w_b lam + cap_gain cap (cap_floor + (1 - cap_floor) F_big)`, normalised to its p2-p98.
- **The plan:** cuts (0.14, 0.40, 0.68) give deep / shade / half / lit. The colours:
  - **shade:** `mix(shade, shade_top, 0.8 * (0.55 max(0, -n_y) + 0.45 up_big))`;
  - **deep:** only where `F < c0` AND low on the mass (`smoothstep(cy - 0.2 r_max, cy + 0.6 r_max, y)`);
  - **rim:** 5 px inside the outline where facing > 0.45.
  - **The continuous plan** (`cont`, smoothstep blends at +-0.05) gives the stroke colours. **The quantised plan**
    (`flat`) is the design.
  - Both are extended outside the shape with the nearest inside colour (`fill_out`, an EDT), so soft edges fade in
    their own colour.

### 5.4 Edges and texture
- **facing** comes from the gradient of `G(D, 4)` (the raw SDF's gradient breaks at the medial axis).
- **The edge width:** `ew = mix(edge_shade, edge_lit, smoothstep(-0.45, 0.1, facing))`.
- **Near the base:** within 2.5 base_soft of the base line, on down-facing normals, `ew -> edge_base`.
- **The displaced distance:** `dd = D + in_band * (n_side ew dry_amp shade_side + n_base edge_base base_drag near_base + n_fine ew grain soft_edge (1 - near_base) up_or_side)`.
  - **The noises:** `n_side` is 4-6 px noise stretched x7-10 along the wind; `n_base` is stretched x8 along the wind;
    `n_fine` is 0.8 px.
  - `in_band = smoothstep(1.2, 0, |D| / ew)`.
- **The alpha:** `a = smoothstep(-ew/2, ew/2, dd)`.
- **Speckle holes** multiply the alpha by `1 - disc`; flecks are discs painted over.

### 5.5 The hatch as a field (not 10,000 strokes)
- **Coordinates:** `n = x nx + y ny` across the lines and `t = x tx + y ty` along them, with t = (cos 35 deg,
  -sin 35 deg).
- **Per line:** the line index is `k = floor(n / 9)`. Each line has its own offset (+-25 %), width (2-3), sign (62 %
  +), amplitude (0.6-1.0) and phase.
- **The profile:** `smoothstep(w/2 + 0.6, w/2 - 0.6, |n - centre_k|)`.
- **The segments:** a seeded 1-D noise at `t / 70 * 4 + phase_k`, past its 45th percentile (55 % drawn).
- **The field** is added to OKLab L x 0.012 x patch x calm.

### 5.6 Determinism and cost
- **One generator per element:** `np.random.default_rng([SEED, id])`, with SEED 20261029 and ids sky 1, mid 2, far 3,
  streaks 4, near 5, flock 6, ridge 7.
- **Fixed streams:** billow wobble `[SEED, 77, index]`, bristle `[SEED, 999]`, hatch segments `[SEED, 31]`, dither
  `[SEED, k]`.
- **Nothing else varies the output:** no global RNG, no clock, no threads. Two runs give byte-identical PNGs.
- **Cost on one CPU core:** the 1080 x 900 plate in ~4 s (the sky 1.8 s, the near mass 0.8 s); the sheet in ~13 s.
- **Into the engine** (`scripts/look/paint/paint.py`): each plane is one RGBA layer, the canvas `c` with its alpha.
  - **What goes in:** the designed billow list per plane. In a film it comes from the kit cloud's lobes plus a z per
    lobe, the light from the rig's key, and the palette from the film's sky rig.
  - **What comes out:** one PNG per plane, placed in its plane group, so it rides the plane's drift.

### 5.7 The checks (`--check`) and what this plate measures
| Check | Target | This plate |
|---|---|---|
| caption band L* spread (p2-p98, y 317-556, x 150-800) | <= 1.5 (CRAFT g.1) | 1.08 |
| open sky residual sigma 1.5 / 4 / 12 | refs 0.31-0.71 / 0.45-0.82 / 0.56-0.91 | top 0.23 / 0.35 / 0.39 (calmer: it sits near captions) |
| near cumulus L* range and offset | refs 11-33 inside, 6-30 off the sky | 58-90 (32), median 69 against the field 81.6 |
| deterministic | the same md5 twice | yes |

---

## 6. Next, to close the gap (not built; each one small)
1. **Blocky chisel cuts in the silhouette (03):** 2-4 square-ended flat stamps, 15-40 px, laid across the turned-away
   edge of the near mass, as sky-coloured or cloud-coloured blocks.
2. **A dragged-streak pass (02):** on the shade side, 6-12 vertical dry strokes, 1-2 px lines 3-8 px apart, pulled
   down out of the mass at 20-40 % opacity.
3. **Stacked bank slabs with sky gaps (03):** plane 2 made of 2-3 level slabs with lighter-sky gaps (+3 L*) painted as
   flat shapes between them.
4. **A plane behind the cumulus (p02's far layer):** big scooped strokes within +-6 L* of the sky, edges ~25 px, to
   frame the near mass.
5. **Motion:** each plane drifts at its depth. A slow churn displaces only the near mass by a few px (the engine's
   paint notes).

## 7. Sources (research, 2026-10-29)

These were read through web search. This cloud session's network blocks direct fetches of gurneyjourney.blogspot.com,
creativebloq.com and en.wikipedia.org, so the method points were checked against the search summaries and our own
measurements.

1. A. Hertzmann, "Painterly Rendering with Curved Brush Strokes of Multiple Sizes", SIGGRAPH 98,
   https://mrl.cs.nyu.edu/publications/painterly98/ : paint coarse to fine. The big strokes lay the rough sketch;
   smaller strokes go only where the canvas still differs from the target; strokes follow the image's contours. Our
   pass order.
2. J. Gurney, "Painting Clouds over a Sky Gradation" (2017),
   https://gurneyjourney.blogspot.com/2017/11/painting-clouds-over-sky-gradation.html : the sky gradation is laid down
   first, as one smooth layer, and the clouds are painted over it in opaque paint. Our layer order: sky, then planes.
3. J. Gurney, "Gamut Masking Method, Part 3" (2011),
   https://gurneyjourney.blogspot.com/2011/09/part-3-gamut-masking-method.html : choose the scene's gamut
   deliberately, as one shape on the colour wheel, and mix only inside it. Our limited palette and its hue families.
4. J. Gurney, "Painting in Ghibli Style" (2018), https://gurneyjourney.blogspot.com/2018/05/painting-in-ghibli-style.html :
   gouache background practice. The paper is pre-wetted for the sky, so cloud edges go soft; washes are laid flat.
   Soft edges come from the wet underlayer, crisp ones from paint laid later on dry paper. Our blur-then-crisp
   passes.
5. L. Bifano, "Painting clouds with gouache", ImagineFX (2021),
   https://www.pressreader.com/australia/imagine-fx/20210709/282810719268039 : wet-on-wet gives feathery clouds and
   dry-on-wet crisper forms. **Edge control is what pushes a cloud forward or back in space.** Our depth ladder of
   edges.
6. Proko, "Value Control" (lesson), https://www.proko.com/course-lesson/value-control : group the value scale into a
   few sets, pick each set's average, and merge shapes before painting. Our 3-4-value design per mass.
7. Draw Paint Academy, "Edges in Art", https://drawpaintacademy.com/edges/ : hard, soft and lost edges. A lost edge
   is so soft that the eye infers it from its neighbours. Our edge table.
8. Krita manual, "Brush Tips", https://docs.krita.org/en/reference_manual/brushes/brush_settings/brush_tips.html :
   a digital stroke is a row of stamped dabs, spaced at a fraction of the tip's size. The stamp equivalent in 5.2.
9. Aerial perspective, https://en.wikipedia.org/wiki/Aerial_perspective : with distance, contrast falls, colours
   shift toward the air's colour and edges soften. Our per-plane k and blur.
