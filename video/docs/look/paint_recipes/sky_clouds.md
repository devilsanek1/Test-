# Recipe: sky and clouds (painted pieces)

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements?" This is that recipe for the sky family: the sky gradient (dusk, daylight), the near
cumulus, banks and decks in depth planes, thin horizon streaks, the sun and its glow, and a far flock. It sits under
the playbook's PAINTED PIECES rule and DIRECTION rule 4 and 6. Where it gives numbers for the sky's base gradient, it
obeys `CRAFT.md` section g, which wins.

- **The proof:** `video/scripts/look/paint/recipes/sky_clouds.py`, a standalone, seeded script (numpy, PIL, scipy,
  skimage). It writes `sky_clouds_swatch.png` next to this file: each element beside the reference crops that show it.
- **The scene:** an October canal evening at King's Cross, with a low sun on the left. The sizes are px of the
  1080 x 1920 frame. The sky plate is the frame's top 900 px, with the horizon at y 792, the sun at (196, 779) and
  the caption band at y 317-556.
- **The refs:** they are 1206 px wide phone screenshots. Every size below is scaled to our width (px x 1080 / 1206),
  because the phone shows both at full width.

*(Status while writing: sections 1 and 7 are final. The element recipes, sections 3-6, follow from the script.)*

---

## 1. What the references do (measured)

Measured with `/tmp/recipes/sky_clouds/work/measure*.py`. The crops are in `/tmp/recipes/sky_clouds/crops/`. L* is
CIELAB. "Range" is the p2-p98 spread. "Residual" is the std of L* minus its Gaussian blur at sigma 1.5 / 4 / 12 px.

### 1.1 The open sky: one value, alive in hue and in a faint texture
| Ref | Base | Range | Residual (1.5 / 4 / 12) | What the eye sees |
|---|---|---|---|---|
| 03 beach dusk (top) | #886f96, L* 49-50, C* 25, hue 316 | **4.1** | 0.36 / 0.60 / 0.86 | one violet. Over it lies a faint hatch of thin straight lines rising to the right at ~35 deg: 2-3 px wide, ~9 px apart, +-0.6 L*. It sits in patches, never everywhere. |
| 05 Cape Town (poster) | #cad7dd, L* 84-86 | **4.1** | 0.31 / 0.45 / 0.56 | a flat pale blue with a fine paper tooth. Big soft patches differ by under 0.3 L*. |
| 01 Singapore (poster) | #d0dbdb, L* 84-94 | 5.8 | 0.71 / 0.82 / 0.91 | flat, with a few big soft lighter patches. |
| p01 beach van | #7a99d0 top to #dca3c3 pink | 10.8 | 0.35 / 0.48 / 0.92 | a smooth vertical gradient, blue-lavender to pink, with soft blotches (1.4 L* at 12-48 px). |
| 01 city hill | plum L* 35 to cream L* 89 | 27 | 0.94 / 1.89 / 3.59 | a full sunset gradient (not our case: our caption band must stay flat). |

**The rule they share:** over large areas the open sky moves less than 6 L*. Its life is hue (a cool top, a warm
horizon) plus a texture of +-0.3-0.7 L*. The value contrast lives in the clouds, not in the sky.

### 1.2 The near cumulus: 3-4 values, in the sky's own hue, clearly off the sky
| Ref | Sky | Cloud values (lit to deep) | The cloud against its sky |
|---|---|---|---|
| 02 bus stop night | L* 16-20, hue 291 | 51 / 46 / 40 / 30, hue 283-292, C* 41-49 | +20 to +30 (moonlit, lighter) |
| 03 beach dusk | L* 49, hue 316 | 43 / 38 / 35 / 32, hue 317-324, C* 27-29 | -6 to -17 (backlit, darker) |
| p02 lighthouse (near) | ~L* 78 | 97 / 89 / 81 / 72 / 64, hue 247-253 | +19 lit, -14 shade |
| p02 lighthouse (far layer) | ~L* 78 | 84 / 80 / 76 / 70 | +-6: almost the sky |
| 04 cloud beast | L* 53 violet | 83 cream / 75 orange / 65 coral / 60 pink | +7 to +30, the hue swinging warm |

- **Hue:** every cloud stays in its sky's hue family, within 10 deg, and is a little more saturated than the sky. The
  only exception is the 04 glow cloud, which swings warm through orange to pink.
- **Value:** the internal range is 11-33 L*. The cloud sits 6-30 L* off its sky.
- **What our first pass of this recipe did wrong:** its lit, half and shade were sky +6 / 0 / -4. The cloud's mass sat
  within 4 L* of the sky, so it read pale and flat.

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
  mass and thinning over ~60 px. A **vertical drag** is 02's left half: thin vertical striations 1-2 px wide, 3-8 px
  apart, where the brush was pulled down.

### 1.4 Strokes, shapes and layers
- **03 (the owner's model).**
  - The cumulus is a few huge soft masses, 150-300 px, with blurred interiors (range 4.4 L* inside a 270 x 120 px
    patch).
  - Its silhouette is cut by **blocky flat-brush stamps**: square-ended chunks 15-40 px wide, a few thin straight
    flicks, and one speckle dissolve.
  - The banks are **long level flat strokes**, 20-40 px tall and 200-600 px long. They have crisp tops (2.5 px),
    ragged dragged ends and **gaps of lighter sky** between them, painted as flat shapes too.
  - Toward the horizon they flatten into strips 3-8 px tall, whose undersides near the sun are lit salmon (#b4728a,
    L* 56).
- **02 (the owner's model).**
  - One big cloud, made of 3-4 big soft shapes and **one crisp round head**: a 170 px billow facing the light, its edge
    3-5 px.
  - Its far side is dragged into vertical streaks.
  - A patch of dark speckle (the sky spattered onto the cloud) breaks the middle.
  - The wisps are **wide flat-brush sweeps** (40-70 px) with a crisp square start, one crisp side and one feathered
    side.
- **p02 (the owner's recipe).**
  - **The far layer:** big scooped strokes 60-150 px wide, all blurred (edges ~29 px), within +-6 L* of the sky.
  - **The near cloud:** **scoop strokes**, C-shaped flat strokes that follow each billow, each with a crisp convex
    edge (5-8 px) and a soft concave edge. A few carry 3-6 parallel bristle lines.
  - The lit tops are near white. The shade is the sky's blue, deeper.
  - The order is the layer order: far, blurred; then near, softer inside; then crisp at the lit edge.
- **04.**
  - The lit edge is a chain of small bumps of varied size (r 8-30 px at 720, so 12-45 px at 1080). It is crisp but
    dry-brush grainy, with light flecks just outside it.
  - The shade side is a lost, grainy dissolve (35 px).
  - Inside are a few thin hatch lines at ~30 deg.

### 1.5 Horizon, sun, flock (03)
- **The horizon band** is a narrow stack of three warm values: #f7d3a9 (L* 87), #e9a791 (74) and #c97c87 (60). Its
  top edge is crisp (1.6 px), and it is brightest at the sun's x.
- **The sun** is a small, nearly white disc: #f3d7c8, L* 88, C* 13, ~13 px across at 1080. Its edge is crisp (2.3 px),
  and its bottom is cut level by the band in front of it. The glow is small, only the band and the nearest cloud
  undersides warming.
- **The flock:** about 60-90 birds over 44 % of the width, in a band ~7 % of the width tall.
  - **Each bird:** 2 strokes (a V, a gull's M, or level wings). The wingspan median is 3.6 px at 1080 (p90 8).
  - **Value:** L* 13 at the darkest (#31153e) on a sky of L* 33, so 20 L* darker. It is the one fine, dark,
    crisp thing in the sky.
  - **Spacing:** loose clumps; the nearest neighbour is 7 px away at the median (p90 14).

---

## 7. Sources (research, 2026-10-29)

These were read through web search. This cloud session's network blocks direct fetches of gurneyjourney.blogspot.com,
creativebloq.com and en.wikipedia.org, so the method points were checked against the search summaries and our own
measurements.

1. A. Hertzmann, "Painterly Rendering with Curved Brush Strokes of Multiple Sizes", SIGGRAPH 98,
   https://mrl.cs.nyu.edu/publications/painterly98/ : paint coarse to fine. The big strokes lay the rough sketch;
   smaller strokes go only where the canvas still differs from the target; strokes follow the image's contours. Our
   pass order and the "only where it differs" rule.
2. J. Gurney, "Painting Clouds over a Sky Gradation" (2017),
   https://gurneyjourney.blogspot.com/2017/11/painting-clouds-over-sky-gradation.html : the sky gradation is laid down
   first, as one smooth layer, and the clouds are painted over it in opaque paint. Our layer order: sky, then planes.
3. J. Gurney, "Gamut Masking Method, Part 3" (2011),
   https://gurneyjourney.blogspot.com/2011/09/part-3-gamut-masking-method.html : choose the scene's gamut
   deliberately, as one shape on the colour wheel, and mix only inside it. Our limited palette.
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
   a digital stroke is a row of stamped dabs, spaced at a fraction of the tip's size. Our stamp spec (6.3). The
   swept-stroke maths we use gives the same look without the stamp seams.
9. Aerial perspective, https://en.wikipedia.org/wiki/Aerial_perspective : with distance, contrast falls, colours
   shift toward the air's colour and edges soften. Our per-plane convergence k and blur.
