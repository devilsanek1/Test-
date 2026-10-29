# Recipe: buildings, ground and far city (painted pieces)

STATUS: in progress (checkpoint 2: LOOK and RESEARCH written; the method, the element recipes and the proof follow).

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements? Seems like you should be able to really clearly define a recipe". This is that recipe for
the built and ground family: a painted building facade, brick and stone surfaces, paving receding in perspective,
smooth rocks and boulders, and the far city as layered atmospheric haze. It sits under the playbook's PAINTED PIECES
rule ("big, simple painted masses made of a few broad, deliberate strokes ... atmosphere over detail"; the owner's
layered-brush method from `refs_paint/`) and DIRECTION; their words win over anything here.

- **Sizes** are px of the 1080 x 1920 frame. The refs are phone screenshots; every ref size is scaled to our width by
  the painting's own width, because the phone shows each at full width: posters and `refs_human_scale` x 1080/1206
  (0.896), `refs_paint/01` x 1080/1160 (0.931), `refs_paint/02` (the painting is 938 px of the screenshot) x 1.151.
- **Colours** are CIELAB L* C* h (D65). dE is CIE76 unless marked dE00. "res1" is the std of L* minus its Gaussian blur
  at sigma 1 px (the fine grain); "sd" the plain std of L* in the patch.
- **The scene:** an October canal evening at King's Cross, a low sun on the left (frame (196, 779), horizon y 792).
- **Crops** (full resolution, 2x zooms) are in `/tmp/recipes/built_ground/crops/` and `zoom/`; the measuring scripts in
  `/tmp/recipes/built_ground/scripts*/`.

---

## 1. LOOK: what the references do (measured)

### 1.1 The far city as layered haze (c07 Kyoto, h01 city hill, c03 Hanoi, c05 Cape Town, p01 headlands)
| Ref | Planes | Values (L*), far -> near | Edges | Inside a plane |
|---|---|---|---|---|
| c07 Kyoto mountains + ghost city | 4 ridges + pale blocks | sky 93.6 -> 88.3 -> 80.7 -> 77.0 (dE to sky 5.3 / 13.5 / 19); C* 3-16 | farthest ridge 14 px soft (lost); the others 1.8 px crisp | flat: sd 0.5-1.2 L*, res1 0.25-0.5; a ridge varies <= 3 L* top to base |
| h01 dusk city toward the sun | 3-4 tower layers | far towers L 60-68 (dE00 4.9 to the sky behind), mid bodies L 36-38 C 30-37 h 344-349, near layer L 42-46 C 36-40 h 356-6 | towers crisp (0.7 px), sun-side slivers 1.3 px | bodies flat; detail = lit slivers + window dots only |
| c03 Hanoi | 3 | far blocks L 81 C 7-14 (dE 8.6-11.8 to the sky); mid L 68-76; near L 77 C 32-40 | 0.5 px crisp | flat colour per block; windows = small dark rectangles in a grid (near ones only) |
| c05 Cape Town | 3 | far ridge L 63.5 C 8 h 255 (dE 17); the mountain face L 52 (dE 27); coast-town strip L 67 C 2 | 1.3 px crisp | the town strip = a speckle of tiny pale blocks (res1 5.5) |
| p01 far headlands (dusk) | 2 | far headland L 31-42 C 16-26 h 306-331, against a sky L 74 | 1.4-2.6 px | flat, no strokes |

- **Silhouettes:** rectangles and a few iconic shapes. Flat tops. Widths vary about 1:4 and heights 1:3 within one
  plane, and a plane's top line rises and falls in a slow rhythm (a few tall towers among low blocks). The farther the
  plane, the simpler: the farthest has no notches, the nearest has setbacks, roof boxes, a spire.
- **Light toward the low sun (h01):** every tower body is ONE dark flat value; the light lives in two things only:
  - **lit slivers** on the sun side of a tower: width p50 3.6 px, p90 14 px (n = 290), colour pale gold
    L* 85-97 C* 26-31 h 81-105 (#f3d09b to #fdfac6), crisp (1.3 px against the body, 0.2 px against the sky);
  - **window lights:** tiny warm dashes 1.8 x 0.9 px, about 165 per 100 x 100 px in the near layer, in rows.
- **Haze toward the sun:** near the sun the far planes melt into the glow (towers L 60-68 at dE00 4.9 off the sky) and
  their tops' edges are lost; away from the sun the same planes stay distinct.
- **No texture** on the far planes (res1 0.25-1.5); the near city layer carries texture only as its window dots.

### 1.2 The painted facade (refs_paint 02 lighthouse; posters c06 Copenhagen, c05 Cape Town, c04 Buenos Aires, c01)
| Patch (lighthouse, in sun) | Colour | L* C* h | Texture |
|---|---|---|---|
| white band, lit | #f5efd5 | 94.3 13.7 99 | res1 3.4: speckle, 40 dark + 73 light specks per 100 x 100 px |
| white band, cool patch | #c8c7b3 | 79.8 10.5 106 | flat blocks of the sky's hue laid into the light |
| white band, shade side | #567178 | 46.0 10.6 221 | res1 2.2: calm |
| iron, lit face | #766a67 | 45.9 5.6 42 | res1 1.8 |
| iron, terminator band | #4f4e54 | 33.5 3.6 299 | |
| iron, shade face | #262d36 | 18.0 7.3 267 | res1 0.5: nearly flat |
| under the gallery (deepest) | #1f252b | 14.3 4.9 256 | |
| rust band and drips | #482c27 | 21.2 15.2 33 | hard-edged |

- **Values:** a lit face and a shade face 28-48 L* apart, a terminator band between them, one deepest accent under the
  overhang. The cylinder reads in 4 steps (46 / 33 / 18 / 14) plus the rust.
- **The marks (the method the owner pointed at):** blocky, square-ended flat-brush marks. On the iron, 103 light marks
  in a 196 x 322 px area: the big ones (10 of them) median 22 x 63 px, upright (h/w 2.7), and 87 small chips. They sit
  where the paint would chip and run: under the gallery, along the seams, around the terminator, never evenly.
  Rust runs down as dark-red vertical drips 3-6 px wide, hard-edged, from a horizontal rust band.
- **Speckle:** light specks on the dark iron (about 14 per 100 x 100 px), light and dark specks on the lit band; none
  on the shade face's calm parts.
- **Edges:** the silhouette against the sky 0.9 px (lit) and 2.3 px (shade); stains 1.0 px (hard but low contrast);
  the dark door 6.4 px (its edge softened).
- **The posters' facades** are calmer: one flat colour per facade with a 4-6 value plan
  (c06 ochre: frames 88, wall 68, wall turning 65, shadow 53, glass 31; c05 pink: 83 / 65 / 29 / 12;
  c04 pink stone: 76 / 65 / 50 / 36 / 16). Windows are dark value shapes (L* 12-31) in crisp light frames (0 px
  edges), cornices and sills are light lines with a dark shadow under them, and a face gets a soft gradient across it.
  The wall's chroma is high (C* 27-54): the facade is the colourful piece of the poster.

### 1.3 Brick and stone (c06 brick tower, c06 round tower, c04 stone, p02 iron)
| Surface | Value plan (L*, share of the area) | What makes it read |
|---|---|---|
| c06 brick tower | body 26 C16 h71 (49 %), lighter courses 44 (14 %), stone bands 62 C29 h81 (9 %), openings 13 (22 %) | a near-flat dark brick with a faint course pattern; the light stone bands and dark arched openings carry the form |
| c06 round tower (rendered stone) | lit side 72 (20 %), mid 54 (25 %), shade side 35 (34 %), windows 19 (14 %) | a cylinder in 3 values; vertical pilasters as slightly lighter strips; a dark band under the cornice |
| c04 pink stone palace | 76 / 65 / 50 / 36 / 16 | the light ornament on a mid wall, deep arches |
| p02 weathered iron | 46 / 33 / 18 / 14 + rust 21 | chips, drips, speckle (1.2) |

- Brick is SUGGESTED: the course pattern is visible only where the light rakes or in a few patches; most of the wall
  is the wall's flat colour. res1 4.5 on the brick tower (fine grain only).

### 1.4 Paving and ground in perspective (c06 quay, c05 road, c04 avenue and plaza, h02 bus stop, h03 and p01 sand)
| Ref | Values | Structure | Texture |
|---|---|---|---|
| c06 quay paving | lit slabs L 77 C 26 h 80 (#d8ba90) to cast shadow L 14-25 C 11-15 h 259-262 | slabs ~110-133 px apart in the near rows; big flat cast-shadow shapes cross the joints | mottle inside a slab (res1 2.7) |
| c05 road | asphalt lit L 54 C 7, in shadow L 37; kerb top L 64 | one big cast shadow with a crisp edge; the kerb a lit top band over a shade face | horizontal dry-brush dashes: correlation 5.4 px along the road, 1.8 px across (ratio 1.9); sd 20 L* |
| c04 avenue | L 55 -> 44-63 in bands, the far road bluer (h 289-336) | lane lines converge; tree shadows cross as level bands | little |
| h02 bus stop (owner's model) | L 5-24 | broad level bands, a pool of the shelter's light, one vertical reflection streak | res1 0.7: almost none |
| h03 beach (owner's model) | wet sand L 30-55 | level bands mirroring the sky, darker toward the frame's bottom | almost none |
| p01 wet sand | L 43-65 C 17-35 h 289-321 | level bands of reflected sky; the rocks' reflections L 55 | res1 1.3-2.3 |

- **Texture gradient:** stones and slabs shrink with distance until they merge; near rows carry joints and a few
  strokes, the far ground is one smooth band. The owner's two models keep the ground very calm.

### 1.5 Rocks and boulders (p01 smooth boulders, p02 blocky rocks, c06 faceted rock, c07 pond rocks)
| Ref | Values (L*) | Shape | Edges |
|---|---|---|---|
| p01 boulders (dusk, the owner's paint ref) | body 14.6 C 18.7 h 290 (#1f233e); sky-lit top band 40-51 C 31 h 299; the reflection below 55 | domes on a flat base; overlapping lobes | silhouette 0.75 px; top band ~7 px; base contact 10.8 px soft on the shade side |
| p02 rocks (sun) | tops 87-96 (white), side planes 58 C 16 h 249 (blue-grey) and 63.5 C 12 h 74 (tan), shade 26, base moss 19 | polygons 15-40 px; plane changes are hard | hard everywhere; light and dark speckle on the near ones |
| c06 rock | 74 / 67 / 54 / 32 C 14-27 h 78-88 | 6-8 big facets, each with a soft internal gradient | crisp facet edges, a soft mottle (res1 2.8) |
| c07 pond rocks | 66 / 51 / 36 / 18 (grey, C 5-23) | rounded, a lit cap and a dark base | crisp |

- **The p01 boulder's profile** (top to bottom at one column): sky 73 -> 59 -> 41 -> 37 -> 40 (the sky-lit band,
  7 px) -> 23 -> 18 (the body, darkening 3 L* over 40 px) -> 40 (wet sand reflection). Two or three thin curved
  light strokes (1-2 px) follow the dome on the biggest boulder; the small stones are just body + band.

---

## 2. RESEARCH: how background painters do it (sources in section 7)
1. **Atmospheric perspective** [1]: with distance a thing gets lighter (toward the air), lower in contrast, cooler,
   softer-edged and less detailed. We use it as a numbered ladder (section 3.4), one plane per step.
2. **It depends on the light** [2]: toward a low sun the air is warm and the distant darks go lighter and cooler, but
   near the sun warm in-scatter wins. So our far planes converge on the horizon AIR colour (peach at the sun, lilac away
   from it), not on grey or blue.
3. **Matte paintings are built in planes** [3]: foreground, midground and background, each with its own atmosphere; a
   light mist across the base of distant silhouettes; vary the silhouettes so a city doesn't repeat.
4. **Simplified planes** [4]: a rock (or a building) is top planes, planes facing the light, planes in half-light and
   planes in shadow; for small things collapse it to 3 values. Keep the light family and the shadow family apart.
5. **Reflected light** [5]: a shadow side gets a gentle inner glow, the local colour a little lighter, never as light as
   the light side; dark accents go only where light can't reach (cracks, the base).
6. **Texture gradient** [6]: paving stones shrink with distance until they can't be told apart, then only a roughness
   remains, then not even that. A sudden change in the texture breaks the depth, so the scale must change smoothly.
7. **A limited gamut** [7]: choose the palette (a gamut mask) before painting and keep every mix inside it; it is what
   makes a picture feel lit by one light.
8. **Weathering follows water** [8]: rain carries dirt down from roof edges, sills, copings and downpipes, so the
   stains start under those features and run down; splash darkens the base.

---

(sections 3-6 to follow: the shared method; the five element recipes; the implementation spec; the proof)

## 7. Sources (research, 2026-10-29)
Read through the search tool's summaries (this sandbox blocks direct fetches of these hosts).
1. Fine Art Tutorials, "Atmospheric perspective": https://finearttutorials.com/guide/atmospheric-perspective/
2. Gurney Journey, "Reverse atmospheric perspective": https://gurneyjourney.blogspot.com/2007/09/reverse-atmospheric-perspective.html
3. Creative Bloq, "How to structure a matte painting to create a cinematic environment":
   https://www.creativebloq.com/art/digital-art/how-to-structure-a-matte-painting-to-create-a-cinematic-environment-game-concept-or-personal-illustration
4. Gurney Journey, "Simplified planes" (rocks as top / light / halftone / shadow planes): https://gurneyjourney.blogspot.com/2008/09/simplfied-planes.html
5. "How to paint reflected light (on rocks)": https://gabor-svagrik.squarespace.com/gabor-svagrik-blog/2023/1/5/how-to-paint-reflected-light-on-rocks
6. Krantz, Hanover College, "Texture gradient" (the cobblestones of *Paris Street; A Rainy Day*): https://psychology.hanover.edu/Krantz/art/texture.html
7. Lines and Colors, "James Gurney on gamut masking": https://linesandcolors.com/2011/09/19/james-gurney-on-gamut-masking/
8. Nippon Paint, "Which parts of your exterior walls get dirty the fastest": https://www.nipponpaint.com.my/articles/tips-and-guides/which-parts-of-your-exterior-walls-get-dirty-the-fastest/
