# Recipe: buildings, ground and far city (painted pieces)

The owner (2026-10-29): "Why can't you do the research yourself and come up with a concrete detailed recipes to
reproduce certain elements? Seems like you should be able to really clearly define a recipe". This is that recipe for
the built and ground family:
- a painted building facade;
- brick and stone surfaces;
- paving receding in perspective;
- smooth rocks and boulders;
- the far city as layered atmospheric haze.

It sits under the playbook's PAINTED PIECES rule ("big, simple painted masses made of a few broad, deliberate strokes
... atmosphere over detail", and the owner's layered-brush method from `refs_paint/`) and under DIRECTION. Their words
win over anything here.

- **The proof:** `video/scripts/look/paint/recipes/built_ground.py`, a standalone, seeded script (numpy, PIL, scipy,
  skimage). It writes `built_ground_swatch.png` next to this file: each element beside the reference crops that show
  it, the facade pass by pass, 2x details, and every piece at phone width beside the refs at phone width.
  - Run it: `python3 video/scripts/look/paint/recipes/built_ground.py [--only far|facade|brick|paving|rocks --out P]
    [--passes N] [--seed N] [--phone P.png] [--check]`.
  - The sheet paints in about 13 s on one core: the far city 3.6 s, the facade 2.5 s, the tiles 0.4 s, the paving
    0.8 s, the rocks 2.4 s.
  - `--check` paints every element twice and compares md5s (same seed, same bytes), then prints the facade's value
    plan and the paving's texture gradient as measured.
- **The scene:** an October canal evening at King's Cross, a low sun on the left (frame (196, 779), horizon y 792).
  Sizes are px of the 1080 x 1920 frame.
- **The refs:** they are phone screenshots, and every ref size is scaled to our width by the painting's own width,
  because the phone shows each at full width:
  - the posters and `refs_human_scale`: x 1080/1206 (0.896);
  - `refs_paint/01`: x 1080/1160 (0.931);
  - `refs_paint/02` (the painting is 938 px of the screenshot): x 1.151.
- **Colours** are CIELAB L* C* h (D65). "res1" is the std of L* minus its Gaussian blur at sigma 1 px (the fine grain).
- **Crops and measuring scripts** are scratch, in `/tmp/recipes/built_ground/` (`crops/`, `zoom/`, `scripts*/`). The
  sheet re-crops every reference straight from `docs/look/`, so it needs no scratch file.

## 0. How close it gets (honest, after one review-and-fix round)

| Element | At full size | At phone width (400 px) | The gap to the refs |
|---|---|---|---|
| **paving** | the texture gradient works: the flags shrink, their joints thin and fade, the flags merge into one warm band far away. The sun's sheen sits on its line, and long soft shadows run toward us. | the strongest piece: depth, light and shadows all read | the near flags' strokes are subtle. It sits closer to the posters and to the owner's calm-ground models (02, 03) than to c05's dry-brush asphalt. About 3/4 of the way. |
| **facade** | the light logic is right: a gold side face (L* 74) against a shade front (55 / 54); every reveal, jamb and pipe edge that faces the sun is a sliver (L* 77). Glass reads as value shapes (22 / 63), with 3 lamps (84). Panel strokes, cool patches, perspective brick courses, stains, drips, chips and speckle all show at 1:1. | a clean, lit, believable building | at phone width the brushwork disappears: it reads as a poster-clean illustration, not as p02's painted surface. The design is too regular (a perfect window grid, every window alike). About 2/3. |
| **far city** | 4 planes stepping L* 49 > 59 > 68 > 78 to the air (88). The in-scatter melts the planes by the sun, and the far tops are lost there. Slivers, glowing parapets, window grids, the clock tower and the gasholder are all in. | the depth reads as 4 steps; a calm, pale city | far plainer than ref 01: fewer towers, a smaller value range, dimmer slivers, simple boxes. Right for a background under captions, short of 01's drama. About 2/3. |
| **brick and stone** | A (brick in the sun), B (brick in shade with a reveal, sill and stains) and D (chipped, rust-stained render, the p02 method) read as painted surfaces up close. C (the stone cornice) is the plainest. | textures that read; D closest to p02 | the brick reads more "drawn" than "painted" at 2x. About 2/3. |
| **rocks** | the domes read as smooth backlit boulders: a dark body lifting softly to a sky-lit top, a thin arris, a warm rim to the sun, a sand line, a warm bounce low. No band and no crescent. The faceted rock is low-poly, with its facets valued by the way they face. | boulders and a stone that read; the shadows lead the eye | more graphic than p01's near-black, softly stroked bodies; the faceted rock is brighter and more crystalline than c06's. About 60 %. |

**Overall:** the method transfers, and every number below is in code. At phone width our pieces read as a calm,
lit, painted illustration. The refs (01, p01, p02) read richer and darker, because they are full-bleed dramatic
pictures, while ours must sit under captions in DIRECTION's calm light frame.

The gap is in three places:
- the mark-making inside the masses (p02's chips at the right places, at a bolder dose on hero pieces);
- the irregularity of the design (windows and blocks that differ);
- a deeper value range near the subject.

Section 6 lists the next steps.

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

- **Silhouettes:**
  - rectangles and a few iconic shapes, with flat tops;
  - widths vary about 1:4 and heights 1:3 within one plane;
  - a plane's top line rises and falls in a slow rhythm (a few tall towers among low blocks);
  - the farther the plane, the simpler: the farthest has no notches; the nearest has setbacks, roof boxes and a spire.
- **Light toward the low sun (h01):** every tower body is ONE dark flat value. The light lives in two things only:
  - **lit slivers** on the sun side of a tower:
    - width p50 3.6 px, p90 14 px (n = 290);
    - colour pale gold, L* 85-97 C* 26-31 h 81-105 (#f3d09b to #fdfac6);
    - crisp: 1.3 px against the body, 0.2 px against the sky;
  - **window lights:** tiny warm dashes 1.8 x 0.9 px, about 165 per 100 x 100 px in the near layer, in rows.
- **Haze toward the sun:** near the sun the far planes melt into the glow (towers L 60-68, dE00 4.9 off the sky), and
  their tops' edges are lost. Away from the sun the same planes stay distinct.
- **No texture on the far planes** (res1 0.25-1.5). The near city layer carries texture only as its window dots.

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

- **Values:** a lit face and a shade face 28-48 L* apart, a terminator band between them, and one deepest accent under
  the overhang. The cylinder reads in 4 steps (46 / 33 / 18 / 14) plus the rust.
- **The marks (the method the owner pointed at):** blocky, square-ended flat-brush marks.
  - On the iron there are 103 light marks in a 196 x 322 px area. The 10 big ones are median 22 x 63 px, upright
    (h/w 2.7); the other 87 are small chips.
  - They sit where the paint would chip and run: under the gallery, along the seams, around the terminator. They are
    never spread evenly.
  - Rust runs down from a horizontal rust band as dark-red vertical drips, 3-6 px wide and hard-edged.
- **Speckle:** light specks on the dark iron (about 14 per 100 x 100 px), light and dark specks on the lit band, and
  none on the shade face's calm parts.
- **Edges:**
  - the silhouette against the sky: 0.9 px (lit) and 2.3 px (shade);
  - stains: 1.0 px, hard but low in contrast;
  - the dark door: 6.4 px (its edge softened).
- **The posters' facades are calmer:**
  - one flat colour per facade, with a 4-6 value plan: c06 ochre is frames 88, wall 68, wall turning 65, shadow 53,
    glass 31; c05 pink is 83 / 65 / 29 / 12; c04 pink stone is 76 / 65 / 50 / 36 / 16;
  - windows are dark value shapes (L* 12-31) in crisp light frames (0 px edges);
  - cornices and sills are light lines with a dark shadow under them;
  - a face gets a soft gradient across it;
  - the wall's chroma is high (C* 27-54): the facade is the colourful piece of the poster.

### 1.3 Brick and stone (c06 brick tower, c06 round tower, c04 stone, p02 iron)
| Surface | Value plan (L*, share of the area) | What makes it read |
|---|---|---|
| c06 brick tower | body 26 C16 h71 (49 %), lighter courses 44 (14 %), stone bands 62 C29 h81 (9 %), openings 13 (22 %) | a near-flat dark brick with a faint course pattern; the light stone bands and dark arched openings carry the form |
| c06 round tower (rendered stone) | lit side 72 (20 %), mid 54 (25 %), shade side 35 (34 %), windows 19 (14 %) | a cylinder in 3 values; vertical pilasters as slightly lighter strips; a dark band under the cornice |
| c04 pink stone palace | 76 / 65 / 50 / 36 / 16 | the light ornament on a mid wall, deep arches |
| p02 weathered iron | 46 / 33 / 18 / 14 + rust 21 | chips, drips, speckle (1.2) |

- Brick is SUGGESTED. The course pattern shows only where the light rakes, or in a few patches; most of the wall is
  the wall's flat colour (res1 4.5 on the brick tower: a fine grain only).

### 1.4 Paving and ground in perspective (c06 quay, c05 road, c04 avenue and plaza, h02 bus stop, h03 and p01 sand)
| Ref | Values | Structure | Texture |
|---|---|---|---|
| c06 quay paving | lit slabs L 77 C 26 h 80 (#d8ba90) to cast shadow L 14-25 C 11-15 h 259-262 | slabs ~110-133 px apart in the near rows; big flat cast-shadow shapes cross the joints | mottle inside a slab (res1 2.7) |
| c05 road | asphalt lit L 54 C 7, in shadow L 37; kerb top L 64 | one big cast shadow with a crisp edge; the kerb a lit top band over a shade face | horizontal dry-brush dashes: correlation 5.4 px along the road, 1.8 px across (ratio 1.9); sd 20 L* |
| c04 avenue | L 55 -> 44-63 in bands, the far road bluer (h 289-336) | lane lines converge; tree shadows cross as level bands | little |
| h02 bus stop (owner's model) | L 5-24 | broad level bands, a pool of the shelter's light, one vertical reflection streak | res1 0.7: almost none |
| h03 beach (owner's model) | wet sand L 30-55 | level bands mirroring the sky, darker toward the frame's bottom | almost none |
| p01 wet sand | L 43-65 C 17-35 h 289-321 | level bands of reflected sky; the rocks' reflections L 55 | res1 1.3-2.3 |

- **Texture gradient:** stones and slabs shrink with distance until they merge. The near rows carry joints and a few
  strokes; the far ground is one smooth band. The owner's two models keep the ground very calm.

### 1.5 Rocks and boulders (p01 smooth boulders, p02 blocky rocks, c06 faceted rock, c07 pond rocks)
| Ref | Values (L*) | Shape | Edges |
|---|---|---|---|
| p01 boulders (dusk, the owner's paint ref) | body 14.6 C 18.7 h 290 (#1f233e); sky-lit top 40-51 C 31 h 299; the reflection below 55 | domes in the sand; overlapping lobes | silhouette 0.75 px; base contact 10.8 px soft on the shade side |
| p02 rocks (sun) | tops 87-96 (white), side planes 58 C 16 h 249 (blue-grey) and 63.5 C 12 h 74 (tan), shade 26, base moss 19 | polygons 15-40 px; plane changes are hard | hard everywhere; light and dark speckle on the near ones |
| c06 rock | 74 / 67 / 54 / 32 C 14-27 h 78-88 | 6-8 big facets, each with a soft internal gradient | crisp facet edges, a soft mottle (res1 2.8) |
| c07 pond rocks | 66 / 51 / 36 / 18 (grey, C 5-23) | rounded, a lit cap and a dark base | crisp |

- **The p01 boulder's profile**, top to bottom at one column: sky 73 -> 59 -> 41 -> 37 -> 40 (the sky-lit top, about
  7 px) -> 23 -> 18 (the body, darkening 3 L* over 40 px) -> 40 (the wet sand's reflection).
- Two or three thin curved light strokes (1-2 px) follow the dome on the biggest boulder. The small stones are just a
  body plus a lit top edge.

---

## 2. RESEARCH: how background painters do it (sources in section 7)
1. **Atmospheric perspective** [1]: with distance a thing gets lighter (toward the air), lower in contrast, cooler,
   softer-edged and less detailed. We use it as a numbered ladder (3.5), one plane per step.
2. **It depends on the light** [2]. Toward a low sun the air is warm: the distant darks go lighter, but near the sun the
   warm in-scatter wins. So our far planes converge on the horizon AIR colour (peach at the sun, rose-lilac away from
   it), never on grey or blue.
3. **Matte paintings are built in planes** [3]: foreground, midground and background, each with its own atmosphere, a
   light mist across the base of the distant silhouettes, and varied silhouettes so a city never repeats.
4. **Simplified planes** [4]: a rock (or a building) is top planes, planes facing the light, planes in half-light and
   planes in shadow; small things collapse to 3 values. Keep the light family and the shadow family apart.
5. **Reflected light** [5]: a shadow side gets a gentle inner glow, the local colour a little lighter but never as
   light as the light side. Dark accents go only where light can't reach (cracks, the base).
6. **Texture gradient** [6]: paving stones shrink with distance until they can't be told apart; then only a roughness
   remains, then not even that. A sudden change in the texture breaks the depth, so the scale must change smoothly.
7. **A limited gamut** [7]: choose the palette (a gamut mask) before painting and keep every mix inside it. That is
   what makes a picture feel lit by one light.
8. **Weathering follows water** [8]: rain carries dirt down from roof edges, sills, copings and downpipes, so stains
   start under those features and run down, and splash darkens the base.

---

## 3. The shared method (every element)

**The rule, in one line:** DESIGN the flat shapes in a limited palette lit by one light (P0). Then BRUSH them in
passes, each blurred LESS than the one before:
- P1: big soft strokes, blurred 6-14 px;
- P2: blocky flat strokes placed where the form turns or the weather runs, blurred 0.4-0.5 px;
- P3: a few crisp light accents, not blurred;
- P4: weathering and speckle, on near pieces only.

Last, convert the whole plane for its depth (toward the air, less chroma, a little softer).

### 3.1 The limited palette: 14 swatches, sampled from the scene's light
- **Three hue families**, the same as the sky recipe's (gamut mask, source 7): peach-gold h 45-80, rose h 0-45 and
  lilac-violet h 295-320. Nothing goes outside them.
- **Every stroke takes one swatch, or an OKLab mix of two.**
  - A value step UP is a mix toward the light (`glow`, `cream`, or `terracotta` for a warm bounce).
  - A value step DOWN is a mix toward the shade family (`plum`, `slate`, `lilac` or `ink`).
  - Never step toward white, black or grey.
  - Mix t 0.12 is about 2-3 L*; 0.2 is about 4-6 L*.

| Swatch | Hex | L* C* h | Role |
|---|---|---|---|
| glow | #ffdfbe | 91 21 73 | the sun's warmth: lit arrises, slivers, the brightest light on a surface |
| air | #f3d6c3 | 88 15 61 | the horizon air: what far planes converge on (the sky family's `horizon`) |
| cream | #e9d7c0 | 87 14 79 | stone facing up or toward the sun: sills, copings, cornice tops |
| sand | #dfc1aa | 80 17 65 | paving and stone in the sun, near |
| ochre | #d1a67b | 71 30 70 | stock brick in the sun |
| granite | #b8a196 | 68 11 53 | warm grey: paving mid, stone and rock half-light |
| terracotta | #b67e6b | 58 27 45 | brick in half-light; the warm ground bounce |
| lilac | #a49db4 | 66 13 303 | sky-lit shadow on pale ground and stone (cast shadows) |
| mauve | #916e73 | 50 15 10 | brick in shade; the far city's nearest plane |
| slate | #6d6b7f | 46 12 295 | rock shade, joints, the shade side of stone |
| plum | #56465b | 32 15 319 | deep shade: soffits, reveals, rock bodies |
| ink | #2d2a3b | 18 12 299 | the darkest: glass in shade, contact shadows (small areas only) |
| lamp | #faca7e | 84 45 80 | lit windows (warm interiors at dusk) |
| skyglass | #9893ab | 62 14 299 | glass mirroring the sky (the upper part of a pane) |

**For another light:** keep the roles and re-sample them from the film's own rig:
- `air` = the sky at the horizon;
- `glow` = the sun's colour;
- `lilac` = the sky-dome's colour in the shade;
- the materials' local colours shift toward them.

### 3.2 The light: one low sun, ahead-left, seen from each face
- **The sun** sits at azimuth -20 deg (X/Z = -0.368 on the ground) and elevation 3 deg, IN the frame, so most faces we
  see are turned away from it (contre-jour).
- **Decide each face's value from its orientation first, then paint:**

| Face | Light | Brick | Stone | Ground / rock |
|---|---|---|---|---|
| faces the sun (left) | direct low sun, grazing | `side` #d9b087 L 75 C 28 | `stone_lit` #f5dbbf L 89 | `sun` facet #e7c8af L 83 |
| faces up | sky dome (+ a grazing sun on paving) | (sill and band tops are seen only from above the eye) | cream/lilac L 80-83 | paving `lit` #d1b6a3 L 76; rock top L 57-70 |
| faces us, away from the sun | sky behind us (lilac) + warm bounce low | `front_top` #977c86 L 55 -> `front_low` #a07470 L 53 | `stone_sh` #b8aeb8 L 72 | rock body L 38-40; `front` facet L 47 |
| faces right (away) | the least sky | (darker by 0.1-0.2 mix toward plum) | | `right` facet #5f5569 L 38 |
| faces down (soffits, heads) | bounce only | `deep` #614e60 L 36 | `deep` | |
| an edge or reveal facing the sun, on a shaded face | the sun catches it | a **sliver**: 1.2-3.6 px of `glow` or `reveal` #e0b890 L 77 | glow 2 px | the rock's arris: glow 1-2.6 px |
| a cast shadow on the ground | the sky dome only | | | `lilac` mixes, about 10 L* under the lit ground, cooler (h 317-343) |

- **Shadows fall toward us and to the right**, along (0.345, -0.938) in ground (X, Z). They are long (about 19 x the
  caster's height) and soften with distance from the caster: penumbra 6 mm + 0.0093 x the distance.

### 3.3 The brush kit (each one a profile swept along a path, never a chain of stamps: 6.3)
| Brush | Across profile | Size at 1080 x 1920 | Opacity | Where |
|---|---|---|---|---|
| **round soft** | ramps of 8-14 px from each edge inward | 50-200 px wide, 150-600 px long | 0.35-0.6 | P1 underpainting (then blurred 5-14 px) |
| **flat mark (chisel)** | crisp, ramps of 0.45-0.8 px; square ends (taper 0.01-0.12) | 3-90 px wide, 8-160 px long | 0.45-0.85 | P2 blocks, chips, panel strokes, slivers |
| **panel stroke** | the flat mark sized by the architecture: 60-92 % of a pier, 55-100 % of a floor | 20-90 px | 0.55-0.8 | P2 on facades (one per pier, one per spandrel) |
| **dry** | any brush; the paint breaks into streaks ALONG the stroke over its last 25-60 % (`dry` 0.3-0.55) | as the brush | as the brush | tails of P2 marks, stains, splash, paving dashes |
| **course line** | 1.0 px line along the face's own perspective | 30-64 px patches, every 3 px | 0.45-0.65 | brick on a receding face |
| **brick dab** | flat, crisp (0.45 px) | course 2.8-9 px, brick 7-26 px | 0.45-0.85 | brick on a frontal face, in patches |
| **drip** | flat, crisp, tapering out 30-35 % | 2-6 px x 14-80 px | 0.45-0.85 | soot and rust runs (p02) |
| **speckle** | an anti-aliased disc applied as an L* delta | r 0.45-1.1 px | +-1.5 to +-12 L* | near masses only |
| **arc** | the flat or soft brush on an elliptical arc | | | along domes (rocks) |

**Never use the `bristle` term** (comb streaks across a stroke's body): it is what read as "combed" in v3.

### 3.4 The pass order: each pass blurred LESS than the one before
| Pass | What | Blur after |
|---|---|---|
| P0 | the flat design: per-face values from 3.2, soft gradients inside a face (colour moving), value shapes for openings | none (edges crisp by the mask's 4x supersampling) |
| P1 | 3-10 big soft strokes per face or mass, +-3-5 L*, warm/cool (none on far planes: their colour moves by the in-scatter, the mist and a mottle) | 6 px (near), 5-8 px (rocks, ground) |
| P2 | blocky flat strokes PLACED BY INTENT: piers, spandrels, edges where the form turns, the band under features; cool patches, warm repairs; brick in patches | 0.4-0.5 px |
| P3 | the crisp light accents, last and few: slivers on every sun-facing edge, lit lips, arrises, glazing bars | none |
| P4 | weathering (stains under sills, soot under cornices, splash at the base, drips, chips) and speckle, near only | none |
| plane | toward the air by k, chroma scaled, then the plane's blur | 0-1.6 px (3.5) |

### 3.5 The depth ladder (near to far): the softness and colour shift as numbers
| Plane | Example (Z) | k toward `air` | Chroma kept | Plane blur | Edge width | Detail kept |
|---|---|---|---|---|---|---|
| near | facade (27 m), rocks (2.5-6 m), paving under 5 m | 0 | 1.0 | 0 | 0.5-1 px | all passes, speckle, brick, chips |
| mid | paving 10-20 m, a far rock | 0.07-0.30 | 0.96-0.85 | 0.6-0.9 (blended in by Z) | 1-1.5 px | P0-P1, joints fading, no speckle |
| far 1 (p1) | the nearest far city (~200 m) | 0.12 | 0.85 | 0.3 | 0.7 px | sun-side faces, slivers 3.6 px, window grids |
| far 2 (p2) | ~400 m, the clock tower | 0.34 | 0.70 | 0.6 | 1 px | faces, slivers 2.4 px, sparse windows |
| far 3 (p3) | ~900 m, towers, the gasholder | 0.56 | 0.55 | 1.0 | 1.5 px; lost by the sun (+2.5) | slivers 1.4 px, no windows |
| far 4 (p4) | ~2 km | 0.78 | 0.40 | 1.6 | 2-3 px; lost by the sun (+3.5) | silhouette only |

- **In-scatter by the sun:** k rises by `scatter` x veil, with veil = exp(-((x - 196)/330)^2) exp(-((y - 779)/260)^2)
  and `scatter` 0.20 / 0.30 / 0.40 / 0.45 from p1 to p4. Then the colour mixes toward `glow` by 0.22 x veil.
- **Mist:** each plane goes a little lighter low: k rises by `mist` x smoothstep((y - (horizon - 30)) / 170), with
  `mist` 0.04 / 0.07 / 0.10 / 0.12.
- **The steps measure** L* 49 > 59 > 68 > 78 > air 88: about 10 L* per plane (Kyoto's steps are 5-7 against a flat
  sky; ours need more against a graded dusk sky).

---

## 4. The elements

### 4.1 The far city as layered atmospheric haze (`paint_far_city`, 1000 x 300 at frame y 592)

**(a) DESIGN**
- **Four planes** (3.5), each a row of buildings from `skyline()`, far to near.
- **Kinds and sizes:** a plane mixes blocks, towers, warehouses, terraces and gables. The weights per plane are in
  `FAR_PLANES`; heights are px above the horizon.
  - towers: the width x 0.35-0.55 and the height x 1.9-2.8;
  - warehouses: the width x 1.4-2.2, the height x 0.7-0.95 and a 5-9 % roof pitch;
  - gables: ridges 22-36 % of the width;
  - 30 % of blocks and towers get a setback or a roof box (35-65 % of the width, 8-22 % of the height);
  - terraces (and 30 % of p1's blocks) get a row of 2-4 chimney stacks, 5-8 x 7-13 px.
- **The rhythm:** heights x (1 + 0.35 n(x / 260 px)), so taller clusters stand among low stretches.
- **The sun gap:** heights x (1 - 0.5 exp(-((x - 196)/95)^2)). The skyline dips by the sun, so the disc stays visible.
- **The plane's widths and heights:**

  | Plane | Width (px) | Height (px above the horizon) |
  |---|---|---|
  | p4 | 18-60 | 8-30 |
  | p3 | 20-64 | 18-56 |
  | p2 | 26-84 | 22-64 |
  | p1 | 40-120 | 6-30 |

  The near plane is the LOWEST, and each farther plane peeks above the one before it. That is how a layered skyline
  is composed, as in the matte-painting layering of source 3.
- **The scene's own shapes:** the clock tower with its spire on p2 (24 px wide, 146 px above the horizon, a 52 px
  spire, 13 px pinnacles) and the gasholder's ring of columns on p3.
- **One value per block:**
  - start from `shade` = mix(mauve, plum, 0.35) (#7c606b L 44);
  - give each block an OKLab L jitter of sd 0.010 (p4) to 0.025 (p1), so neighbours differ by 1-2.5 L*;
  - add a slow mottle of +-0.5-0.8 L* (cell 46 px);
  - convert per pixel by the plane's k, chroma, in-scatter and mist (3.5).

**(b) PAINT PASSES** (passes 2-3 only on the planes that keep the detail)
| Pass | Planes | Brush | Size | Opacity | Count | Colour | Blur after |
|---|---|---|---|---|---|---|---|
| P0 | all | flat fill | the silhouettes | 1 | per block | `shade` +- jitter, converted | none |
| P2 sun-side face | p2, p1 | flat mark, vertical, square, crisp 0.6 | 20-36 % of the block wide, from its top to the bottom | 0.6-0.8 | 75 % of blocks | lighter(shade, 0.3) converted (+8-12 L* before the conversion) | 0.4 |
| P2 dark slot | p2, p1 | flat mark | 2.5-5 px, from 5-14 px below the top | 0.35-0.55 | 30 % of blocks | darker(shade, 0.35) converted | 0.4 |
| P3 sliver | p3, p2, p1 | flat mark, crisp 0.45, tapering out 60 %, dry 0.2 | 1.4 / 2.4 / 3.6 px; 5-11 px for a face turned to the sun (12 % of p2's blocks, 20 % of p1's) | 0.8-0.95 | 80 % of blocks | glow converted with k x 0.45 (L* 90) | none |
| P3 roof glow | p3, p2, p1 | 1.3 px line along a flat parapet | | 0.55 | 55 % of flat tops | as the sliver | none |
| P3 windows | p2, p1 | dashes in a grid | cell 7.5 x 10 (p1), 6 x 8 (p2); dash 2.4 x 1.5 / 1.8 x 1.2 | 0.65-0.95 | 50 % / 35 % of blocks; each window lit at 0.34 x a per-row 0.2-1.6 | mix(lamp, shade, 0.15) converted with k x 0.55 | none |
| P3 gasholder | p3 | 8 columns 1.7 px (cosine spacing over 120 px), 3 rails 1.8 px, 70 px tall; its top rail lit 1.2 px | | 0.9 | 1 | darker(shade, 0.2) converted | none |
| plane | all | blur 1.6 / 1.0 / 0.6 / 0.3; then on p4 and p3 a blend toward a 3.5 / 2.5 px blur, weighted min(1, 1.15 veil) (lost tops by the sun) | | | | | |

**(c) EDGES**
- The near planes' silhouettes stay crisp (0.3-0.6 px).
- The far planes soften (1.0-1.6 px), and their tops are LOST right by the sun.
- Slivers are the crispest marks on the plane (crisp against the sky, 1.3 px against the body).
- No outline anywhere.

**(d) DEPTH:** the ladder in 3.5, with the in-scatter and the mist.

**(e) MISTAKES TO AVOID**
- Horizontal light strokes in a far plane. Our first pass had them; they read as smudged bars.
- Soft blobs inside a far plane. The refs' planes are flat; the colour moves only by the in-scatter, the mist and a
  +-0.5-0.8 L* mottle.
- A near plane as tall as the far ones: it hides them and the layers vanish.
- A row of identical gables: it looks naive. Mix the kinds and use the rhythm.
- Window lights as random dots: they read as noise. Lay them in grids, by floor.
- The planes' steps too small against a graded sky: we went from 6-8 to about 10 L*.
- Blue-grey far planes. They converge on the AIR (peach-rose), never on grey (source 2).

**(f) IMPLEMENTATION:** `FAR_PLANES`, `skyline()`, `landmarks()`, `far_window_grid()` and `paint_far_city()` (section
5 of the script).

### 4.2 The painted facade (`paint_facade`, 600 x 720 at frame (430, 198))

**(a) DESIGN**
- **The geometry is real:**
  - a four-storey stock-brick warehouse 27 m away, seen from a 1.6 m eye: its base at frame y 848, its top at y 288;
  - the horizon crosses it 56 px above the base, so every window is ABOVE the eye: we see window heads and the
    cornice's soffit, never the tops of sills;
  - the side face recedes to a vanishing point on the horizon (panel (-900, 594)), mapped by `fac_side_pt(u, y)`;
  - the front is frontal.
- **The value plan** (3.2):

  | Part | Colour | L* |
  |---|---|---|
  | side face (sunlit) | `side` | 75 |
  | front, high | `front_top` | 55 |
  | front, low | `front_low` | 53 |
  | stone in shade | `stone_sh` | 72 |
  | stone in the sun | `stone_lit` | 89 |
  | soffits and heads | `deep` | 36 |
  | glass | `glass` / `glass_sky` | 22 / 63 |
  | lit windows | `lamp` -> `lamp_low` | 84 -> 72 |
  | engineering-brick plinth | shade / sun | 40 / 63 |
  | pipe | `pipe` | 28 |
  | reveals | `reveal` | 77 |

  That is 9 values from 3 hue families.
- **Colour moving within a face (P0 gradients):**
  - the front runs `front_top` -> `front_low` down its height (cooler high, where more sky reaches it; warmer low, from
    the bounce);
  - a warm bounce lifts the front's lower left by up to 35 % toward lighter(front_low, 0.2, terracotta), x
    exp(-(x - corner)/120) x smoothstep((y - 300)/340), because the sunlit ground is there;
  - the side face brightens toward its far end, nearer the sun (+0.2 x 0.5).
- **The openings are value shapes:**
  - windows 50 x 86 px at a 100 px pitch, 3 floors;
  - a 4 px head (`deep`), and the RIGHT reveal (6 px, `reveal`): it faces the sun, and we see it from the left;
  - the glass splits at 32-46 % of the height on a slant (0.22 px/px): the upper pane mirrors the lilac sky behind
    us, the lower pane is dark; interiors vary +-2.5 L*;
  - 2 blinds; 3 lit windows of 12;
  - 3 arched loading bays (80 px, radius 40) with gauged-brick rings, one bay a lit cafe; their right reveals are
    7 px of sun.
- **Stone:**
  - a cornice: corona y 90-106 (stone), soffit 106-116 (deep), bed course;
  - string courses 8 px at y 254 / 382 / 510, with a 1.6 px deep underside;
  - sills 60 x 8 px, with a 1.6 px underside.
- **The ground:**
  - sunlit paving to the horizon, glaring toward it (air -> glow);
  - a shadow wedge from the corner's base, running away from the sun's foot on the horizon (`ground_sh`, L* 70).

**(b) PAINT PASSES**
| Pass | Where | Brush | Size (px) | Opacity | Count | Colour | Blur |
|---|---|---|---|---|---|---|---|
| P1 | each face's brick, clipped | round soft, vertical | 60-120 wide, 160-400 long, soft 14 | 0.6 | front 10, side 4 | 50 % lighter(base, 0.15-0.22, terracotta/glow), 50 % darker(base, 0.14-0.2, slate): +-4-6 L* | 6 |
| P2 piers | every pier segment (5 piers x 3 floors), p 0.8 | panel stroke, vertical, crisp 0.6, dry tail on half | 60-92 % of the pier wide, 55-100 % of the floor tall | 0.55-0.8 | ~12 | 40 % lighter(0.15-0.24, terracotta) (+4-7 L*), 38 % darker(0.14-0.22) (-4-7), 22 % toward lilac 0.3-0.42 (a cool patch) | 0.5 |
| P2 spandrels | under each window to the band below, p 0.5 | panel stroke, level | 60-95 % of the width, 55-90 % of the height | 0.5-0.75 | ~6 | as the piers | 0.5 |
| P2 corner | the front's edge by the arris | flat mark, vertical | 8-16 x 40-110 | 0.5-0.7 | 3 | lighter(front_low, 0.12-0.2, terracotta): the bounce, the form turning | 0.5 |
| P2 cool patches | high on the front, away from its edges | flat mark, upright | 10-22 x 18-46 | 0.55-0.8 | 7 | mix(front_top, lilac, 0.35-0.5) (p02's cool patch) | 0.5 |
| P2 warm repairs | low on the front | flat mark, level | 10-26 x 14-34 | 0.5-0.75 | 4 | mix(front_low, terracotta, 0.35-0.55) | 0.5 |
| P2 plinth | the plinth | flat mark, level, dry 0.4 | 5-9 x 50-120 | 0.45-0.7 | 4 | lighter(plinth, 0.08-0.16, lilac) | 0.5 |
| P2 side bays | 2 bays x 4 floors, p 0.85 | flat mark, vertical | a random part of the bay (at least 0.12 of the face's width) x 50-95 % of the floor | 0.5-0.75 | ~7 | 50 % lighter(side, 0.2-0.32), 50 % darker(side, 0.12-0.2, terracotta) | 0.5 |
| P2b brick, side | 12 patches 30-64 x 12-27 (face px) | course lines in the face's perspective, every 3.0 px | 1.0 px, half-length to the patch's ellipse x 0.5-1.0 | 0.45-0.65 | 80 % of courses | 55 % lighter(side, 0.16-0.28), else darker(x 0.8, terracotta) | none |
| P2b brick, front | 7 patches near the face's edges (weight exp(-d/18)) | brick dabs, running bond | course 2.8, brick 7.0 | 0.45-0.7 | 62 % x (1 - r^2) of bricks | +-(0.12-0.18) | none |
| P3 arris | the corner, on the lit side | line | 1.6 | 0.85 | 1 | mix(side, glow, 0.55) | none |
| P3 sun tops | side cornice top; side bands | line in perspective | 2.0; 1.4 | 0.9; 0.8 | | glow | none |
| P3 slivers | each window's reveal edge; arch jambs; the pipe's left edge | line | 1.2; 1.4; 1.2 | 0.75-0.8 | 12 + 3 + 1 | mix(reveal, glow, 0.6); mix(pipe, glow, 0.55) | none |
| P3 stone lips | each band's lower edge (seen from below) | line | 1.0 | 0.6 | 3 | mix(stone_sh, cream, 0.5) | none |
| P3 glazing | each window: a centre bar and a meeting rail | line | 1.5 and 2.2 | 0.7-0.75 | 12 | mix(deep, glass, 0.4); lit windows mix(lamp_low, deep, 0.55) | none |
| P4 stains | under each sill | soft line, tapering out 70 %, dry 0.5 | 3-7 x 24-70 | 0.25-0.4 | 1-2 per window | darker(wall, 0.42) | none |
| P4 soot | under the cornice | soft 2.5, dry 0.45 | 5-12 x 50-160 | 0.14-0.22 | 7 | darker(front_top, 0.4) | none |
| P4 drips | under 30 % of sills | crisp drip | 2.0-3.2 x 28-80 | 0.45-0.6 | ~4 | darker(front_low, 0.5) | none |
| P4 splash | the base, PER FACE | level, soft below, edge_dry 0.55 | 5-11 x 25-80 | 0.2-0.38 | 14 front + 6 side | darker(wall, 0.3-0.35) | none |
| P4 chips | the lit side, weighted low | flat mark, upright | 3-7 x 8-26 | 0.45-0.7 | 14 | lighter(side, 0.5, cream) | none |
| P4 speckle | the side + its plinth; the front + plinth + stone | discs | r 0.45-0.9 | | 85 and 32 per 100 x 100 px | +-2.5-4.0 L* (60 % light); +-1.5-2.5 (50 %) | none |
| base | the front and side bases | line, crisp above, soft 3 px below | 3.0 / 2.4 | 0.8 / 0.7 | | mix(ground, plum, 0.5-0.6) | none |

**(c) EDGES**
- **Crisp (0.45-0.6 px):** the silhouette against the sky, the corner arris (the hardest edge: light against shade),
  window and opening edges, slivers, drips, chips.
- **Firm:** the panel strokes' sides (0.6 px).
- **Soft:** stains (1.2 px), soot (2.5 px), the splash band's upper edge (dry-broken), the contact line's lower side
  (3 px).
- **Never warp architecture:** our "hand-cut" wobble of the design made the windows melt.

**(d) DEPTH:** a near piece (k 0). The same facade as a mid building gets k 0.1-0.2, no speckle, no brick, no P4,
panel strokes x 0.5; as a far block it becomes 4.1's flat value + sliver + windows.

**(e) MISTAKES TO AVOID**
- P2 marks scattered at random over the wall: they read as pasted rectangles. Make one per pier or spandrel, aligned
  to the architecture, plus a few by intent.
- Marks at +-2-3 L*: invisible at 1:1. The refs' marks are +-10-25 L*; ours use +-4-7 on the shade face and +-6-9 on
  the lit side, a calm dose.
- Brick dabs on a receding face: they shrink into dots that read as speckle. Draw course LINES in the face's
  perspective.
- A stroke crossing the corner: two lights in one stroke. Clip every pass per face.
- The window grid drawn as CAD: all the rails and an even dark. Use one bar and one rail, interiors that vary, blinds,
  a few lamps.
- The front lit by a sun that is in front of us. The light table (3.2) decides: here the front is SHADE.

**(f) IMPLEMENTATION:** `fac_colours()`, `fac_side_pt()`, `fac_side_quad()` and `paint_facade(keep=...)`. `keep`
returns the P0 / P1 / P2 / P3 snapshots shown on the sheet.

### 4.3 Brick and stone up close (`paint_brick_tiles`, four 240 x 240 tiles, about 1.7 m of wall)

**(a) DESIGN**
- **A, stock brick in the raking sun:**
  - a flat `side` base, lit toward the sun: lighter(side, 0.18) -> darker(side, 0.06, terracotta) along x + 0.5 y;
  - bricks in running bond: course 9 px, brick 26 px, joint 1.44 px.
- **B, stock brick in shade:** `front_top` -> `front_low` down the tile, with a window corner:
  - the reveal (18 px, `reveal`);
  - the glass mirroring the sky over its dark lower part;
  - a stone sill (16 px, `stone_sh`) with a 3 px `deep` underside.
- **C, a stone cornice seen from below:**
  - the sunlit return (left, `stone_lit`) and the shaded corona (st_sh = mix(stone_sh, sand, 0.25), L* 74);
  - a soffit in `deep` with 9 modillions (9 x 18 px at a 21 px pitch, each with a 3 px lit underside);
  - ashlar below: courses 28 px, blocks 60 px, the joints mix(ash, deep, 0.25).
- **D, chipped, rust-stained render (the p02 method in our palette):**
  - lit L* 73 (mix(granite, sand, 0.4)) turning to shade L* 47 (mix(slate, mauve, 0.3));
  - the terminator is a soft band x 120-160, painted as 3 vertical value bands (16-26 px);
  - a rust band (mix(terracotta, plum, 0.45), L* 46) at y 150.

**(b) PAINT PASSES**
| Tile | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| A | 4 round soft, 60-100 px, +-(0.12-0.2), blur 6 | brick dabs: coverage 0.62 (a patch field, cell 70 px), each brick lighter or darker 0.12-0.24, 15 % burnt headers (toward plum, never grey), opacity 0.55-0.85, blur 0.4; a lit top arris on 18 % of bricks (1.0 px, mix(base, glow, 0.7)) | | one soot run; speckle 110 per 100 x 100 px, r 0.45-0.95, +-2.5-4.5 L* |
| B | 3 round soft (a cool and a warm), blur 6 | bricks: amp 0.07-0.13, coverage 0.5 (half the sun tile's contrast), never in the opening | the reveal's edge 1.3 px glow-mix; glazing bars 2.2 / 3.0 px; the sill's top lip 1.2 px | 3 stains (4-8 x 30-66 px, darker 0.45, 0.28-0.4); 1 hard drip 2.4 px; speckle 40 per 100 x 100 px, +-1.5-2.5 |
| C | | each ashlar block +-2 L* as one flat mark (59 x 25.4 px); 60 % get one inner flat stroke (20-44 x 6-12, +-0.1-0.12, dry 0.4); the corona 3 level strokes | the corona's lit top 1.2 px; the return's top 2 px glow; its arris 1.6 px; each course's lit lower lip 1 px | 6 soot runs from the soffit (5-12 x 40-130, 0.14-0.24); speckle 60 per 100 x 100 px |
| D | the terminator bands, blur 1.2 | chips: 16 light (6-22 x 10-60, lighter(lit, 0.35-0.6, cream)) where the band and the lit side are, 45 % stepped (an L-shape: a second block beside it, 30-60 % as long and 40-80 % as wide); 10 small chips on the shade (4-12 x 8-40, toward lit 0.3-0.5); blur 0.3 | the rust band 12 px (edge_dry 0.35); 9 drips 2.5-6 x 14-80 px, crisp, 0.6-0.85; a seam 1.4 px | speckle: light specks on the shade (70 per 100 x 100 px, 85 % light, +-6-12 L*), dark specks on the light (50, 20 % light, +-3-6) |

**(c) EDGES**
- **Crisp:** brick dabs (0.45 px), chips, drips, the stone's joints and lips.
- **Soft:** soot and stains.
- **Lost:** the edge of each brick PATCH. The probability of a brick fades to 0 at the patch's edge, so the brick
  appears and disappears.

**(d) DEPTH:** these are near (k 0).
- At facade distance, bricks become course lines or dabs of 2.8 x 7 px in a few patches (4.2).
- Farther, no brick at all: the wall's flat colour.

**(e) MISTAKES TO AVOID**
- Rendering every brick: it reads as a pattern fill. Use coverage 0.5-0.62, patches, faded edges.
- "Burnt" bricks mixed toward grey: they read as holes. Mix toward plum or terracotta.
- Flat grey stone: our first C. Warm the stone (toward sand), cut the joints and the lit lips.
- Chips spread evenly: put them where the paint would chip, around bands, edges and the light.

**(f) IMPLEMENTATION:** `brick_courses(layer, brush, rng, box, course, blen, base, amp, coverage, patch_cell, ...)`,
`chip_marks(layer, brush, rng, weight, n, col_fn, size, opacity)` and `paint_brick_tiles()`.

### 4.4 Paving receding in perspective (`paint_paving`, 1000 x 480 at frame (40, 840): Z 31 -> 2.8 m)

**(a) DESIGN**
- **Ground projection** (a 1.6 m eye, focal 935 px): y = 792 + 1496 / Z, x = 540 + 935 X / Z.
- **The flags:**
  - rows D = 0.62 m deep, each row seeded by its index, of random lengths 0.55-1.25 m (York flags);
  - per flag, a value N(0, 1) x 2.6 L* and a warm/cool shift N(0, 1) (b* toward warm, never below -0.4 sd: no grey
    flags);
  - both fade by 1 - smoothstep((Z - 4)/16). This is the texture gradient: the flags merge into one band beyond about
    20 m.
- **Joints:** 9 mm gaps, drawn at max(0.009 x 935 / Z, 0.7) px across and max(1496 x 0.009 / Z^2, 0.6) px for the bed
  joints.
  - colour mix(lit, slate, 0.45), or in shadow mix(shad, slate, 0.4);
  - opacity 0.85 x (1 - smoothstep((Z - 5)/11)): they thin and FADE with distance.
- **Shadows toward us** (3.2):
  - per caster (X, Z, height, radius) and per ground pixel: the distance s along the shadow and q across it;
  - core = smoothstep((r - |q|) / pen + 0.5), with pen = 0.006 + 0.0093 s m;
  - x exp(-s / (0.9 L)), where L = h / tan(3 deg) (19 h), x r / (r + 0.5 pen);
  - colour `shad` = mix(lilac, granite, 0.25), L* 66: 10 L* under the lit flags (L* 76), cooler (h 317).
- **The sheen:** exp(-((X/Z + 0.368)/0.30)^2) x smoothstep((Z - 2.5)/18), mixed toward mix(glow, air, 0.3) by
  0.65 x sheen x (1 - 0.7 shadow). The low sun's glare lies along its own line and is strongest far away (grazing).
- **The props** (bollards, a lamp post): flat plum-slate, crisp, with a 1.2 px glow sliver on the sun side. They are
  not painted pieces (tier B/C); they anchor the shadows.

**(b) PAINT PASSES**
| Pass | Where | Brush | Size | Opacity | Count | Colour | Blur |
|---|---|---|---|---|---|---|---|
| P0 | per pixel | (the design above) | | | | | none |
| P1 | anywhere | round soft, LEVEL | 26-56 px x 300-600 px, soft 12 | 0.4 | 7 | +-(0.08-0.14), darker toward lilac | 8 |
| P2 flags | flags with Z < 7.5 m, area > 400 px, 65 % of them | flat mark, level, soft 1.2, taper (0.1, 0.35), dry 0.55, clipped to the flag | 35-80 % of the flag wide, 25-55 % of it tall (>= 3 px) | 0.35-0.55 | 1-2 per flag | +-(0.08-0.15) | 0.4 |
| P2 dashes | Z < 6 m | flat mark, level (+-1.5 deg), dry 0.5 | 8-32 x 1.4-3.0 | 0.3-0.5 | 90 | +-(0.1-0.2) (c05's asphalt texture, calmer) | 0.4 |
| P3 lit lips | 1.2 px just below each row's FAR joint (the near flag's back edge faces the sun), Z < 9 m, not in shadow | a line | 1.2 | 0.7 x (1 - smoothstep((Z - 5)/4)) | every row | mix(lit, glow, 0.7) | none |
| P4 grit | Z < ~5 m (weight 1 - smoothstep((Z - 3)/4)) | discs | r 0.45-0.9 | | 45 per 100 x 100 px | +-2-4 L* | none |
| depth | per pixel | k = 0.5 smoothstep((Z - 3)/30) toward `air`, chroma x (1 - 0.5 k); then a blend toward a 0.9 px blur by smoothstep((Z - 10)/12) | | | | | |

**(c) EDGES**
- Joints are crisp near and gone far.
- Shadows are crisp at their casters (6 mm) and soften along their length.
- No flag is outlined: the joints are value gaps that FADE, never lines of constant contrast.

**(d) DEPTH (measured by `--check`):** the fine texture (L* std after removing a 3 px blur) is 1.58 near (Z ~3 m),
1.75 mid (~7 m) and 0.11 far (~20 m). It peaks where the joints crowd, then merges: source 6's gradient. The mean L*
rises 73.7 -> 75.1 -> 79.2 toward the air and the sheen.

**(e) MISTAKES TO AVOID**
- A grid of constant lines: it reads as a floor plan. Thin and fade the joints.
- Grey-blue flags: the cool jitter clamped. Flags vary warmer or cooler, never greyer.
- Pasted rectangles inside flags. P2 strokes are dry, tapered, low in contrast, clipped per flag.
- Shadows falling AWAY from the sun's side of the frame: wrong for a sun in the frame. They run toward us.
- The lit lip on the wrong side of the joint. The back edge of the NEARER flag faces the sun.
- A busy near ground: the owner's models keep it calm. Our P1 bands are +-2-3 L*.

**(f) IMPLEMENTATION:** `ground_xy(X, Z)` and `paint_paving()`. Per row: the cross joints' px positions via
`np.searchsorted`; the flags' ids; the distance to the nearest joint.

### 4.5 Smooth boulders and faceted rocks (`paint_rocks`, 1000 x 420 at frame (40, 980): Z 8 -> 2.5 m)

**(a) DESIGN**
- **A dome boulder** (`boulder_outline`):
  - the top is a superellipse with exponent p 2.0-2.6, different half-widths left and right (skew +-0.1-0.2: an
    asymmetric peak) and slow lumps (+-6 % of h);
  - the BASE is the sand line, 5-9 % of h above the footprint: the boulder sits IN the sand.
  - Sizes come from ground metres: a = 935 w / (2 Z), h = 935 hm / Z.
- **Its value plan:**

  | Part | Colour | L* |
  |---|---|---|
  | body, high | mix(plum, slate, 0.4) | 38 |
  | body, low | mix(plum, mauve, 0.45) (the warm bounce) | 40 |
  | the sky-lit top | mix(slate, lilac, 0.55) | 57 |
  | the sun rim | mix(glow, sand, 0.2) | 89 |

  - The upper 45 % of the body lifts SOFTLY toward the top value (up to 42 %, by smoothstep). There is no band and no
    crescent.
- **A faceted rock (low poly):**
  - an 8-segment dome outline (radius jitter 0.9-1.06), fanned from two interior points (-0.25 a, -0.42 h) and
    (0.3 a, -0.38 h), plus a crown and front facets;
  - each facet takes its plane (source 4) from its outer edge's normal n:
    - n_y < -0.8: `top`;
    - n_x < -0.45: `sun`;
    - n_x > 0.45: `right`;
    - otherwise `top` if n_y < -0.55, else `half`;
  - L*: sun 83, top 70, half 54, front 47, right 38;
  - each facet is jittered +-0.8 L*.
- **The bed:**
  - water beyond (mix(lilac, air, 0.45), with 5 thin light dashes) down to a bank line;
  - sand mix(sand, glow, 0.15) (L* 82), going 25 % toward granite near the frame's bottom;
  - shadows toward us (as the paving's: r = 0.8 x the half-width, pen = 0.02 + 0.06 s, strength
    exp(-s / (0.8 + 2.5 h)), colour mix(sand_sh, slate, 0.15) at 0.65), starting UNDER the rock.

**(b) PAINT PASSES**
| Pass | Dome | Faceted |
|---|---|---|
| P1 | 2-3 soft arcs along the dome (radius 0.45-0.8 a, width 0.3 a, lighter 0.08-0.14 toward lilac, 0.45, soft 8), blur 6 | 3 soft strokes (0.5 h wide, +-0.12-0.15, 0.35), blur 5, inside the silhouette |
| P2 | a/22 (>= 2) flat arcs along the form (radius 0.35-0.95 a, width 0.05-0.1 a and >= 4 px, +-(0.06-0.14), 0.4-0.65, dry 0.4); 1-3 short marks on the upper body along the local slope (10-26 x 3-6 px, toward the top value); the reflected light: the lowest 35 % lifted toward lighter(body_lo, 0.16, terracotta) at 60 %, blurred 4 (source 5) | 2-4 chisel marks per plane, along it (top -6 deg, right 75 deg, front 85 deg; 15-40 x 8-16 px; +-(0.08-0.15); 0.5-0.75), clipped to the plane |
| P3 | the sky-lit ARRIS along the whole top: max(1.5, 0.022 h) px, mix(top, lilac, 0.5), 0.75, crisp outside (0.45) and soft inside (0.6); the SUN RIM along the upper-left half, 1.0 -> 2.6 px, `rim`, 0.6-0.95; 3 thin curved lights on the biggest (1.2-2.0 px, mix(top, body_hi, 0.35), 0.35-0.55); the contact along the sand line: max(2.5, 0.04 h) px, mix(sand_sh, ink, 0.5), 0.7, soft below max(3, 0.06 h) px | the three sunward arrises in glow, 1.8 -> 1.0 px; the contact as the dome's |
| P4 | speckle only if Z < 4 m: 25 per 100 x 100 px, +-3-6 L*, 70 % light | 45 per 100 x 100 px, +-3-6 L* (not on the far rock) |
| depth | | the far rock: to_plane k 0.22, chroma 0.85, blur 0.6 |
| bed | 6 level soft strokes (18-40 x 300-600 px, +-0.1, 0.35, blur 7) around the rocks; grit 35 per 100 x 100 px, +-2-3.5 L*, in the near half | |

**(c) EDGES**
- **Crisp (0.45 px):** the top silhouette against the water or sand, the sun rim, the facets' plane changes.
- **Soft:** the arris's inner side, the contact's lower side (3-8 px), the shadows (growing penumbra).
- **Lost:** the transition from the sky-lit top into the body (a 45 % smoothstep, never a band edge).

**(d) DEPTH:**
- near rocks (Z < 4 m) get P4;
- a mid rock (4-6 m) keeps P0-P3;
- a far rock is converted (k 0.22) and blurred 0.6 px, with no speckle;
- smaller and higher in the frame by the projection itself.

**(e) MISTAKES TO AVOID**
- A uniform lighter top BAND: it reads as a cap or crescent. This was v4's crescent mistake again, in our first pass.
  Use the soft lift plus a thin arris.
- Perfect hemispheres sitting ON the ground: "buns". Use lumps and skew, and bury the base.
- A light gap between the base and its shadow: start the shadow under the rock.
- Long contre-jour shadows at full strength over the whole bed: the sand turns lilac. Fade them by the distance from
  the caster.
- A box with a lid for a faceted rock (our first try). Fan facets from a coarse dome and value them by orientation.
- Scratch-thin P2 marks on facets: they read as scratches. Make them 8-16 px wide and 15-40 px long.

**(f) IMPLEMENTATION:** `rock_xy()`, `boulder_outline()`, `top_curve()` and `paint_rocks()`.

---

## 5. Mistakes that made v1-v4 (and this recipe's first pass) fall short: the rule for each
| Mistake | Where it came from | The rule |
|---|---|---|
| an even streaky texture over everything | v2/v3's sky and surfaces | marks go where the form turns or the weather runs (P2 placement by weight maps); calm areas stay calm (only P1 +-3-5 L*) |
| smudging / greying | v1/v3's strokes averaging a mass toward its mean | every pass composites flat paint OVER the design (premultiplied), never a blur of the whole; value steps are palette mixes, never toward grey |
| combing | v3's bristle streaks across the stroke | dry breakup only ALONG the stroke, only on tails and soft edges; no `bristle` term |
| cartoon outlines | v3 G5b's ink | no outlines; shapes separated by value; thin dark lines only on things that are lines (glazing bars, rails, the gasholder) |
| crescents | v4's accent billow; our first boulder band | lit planes follow the FORM's planes (an irregular break, a soft lift), never a band parallel to the silhouette |
| invisible paint (dose too low) | v1, v4 ("2.6 % of pixels changed") | P2 marks at +-4-9 L*, sized by the architecture, so they read at 1:1 and as colour moving at phone width |
| random rectangles | our first facade P2 | one stroke per pier and spandrel, aligned; a few by intent |
| a warp on architecture | our first "hand-cut edges" | never displace architecture; straight edges stay straight |
| strokes across a corner | our first splash band | clip every pass per face (per light) |
| far planes with stroke bars | the predecessor's far city | far planes are flat + mottle; the detail is slivers and windows only |

---

## 6. IMPLEMENTATION SPEC (numpy / PIL), as built in `built_ground.py`

### 6.1 Colour
- sRGB <-> OKLab with Ottosson's matrices (`rgb2ok`, `ok2rgb`).
- Every mix is linear in OKLab (`mix(c1, c2, t)`): a painter's mix that keeps lightness honest.
- `lighter(c, t, toward='glow')` and `darker(c, t, toward='plum')` are mixes toward a palette swatch.
- `jitter(c, rng)` gives each stroke its own wobble: L sd 0.006 and a, b sd 0.003 (about +-0.6 L*).
- The palette is `PAL` (3.1), `SKY` is the sky family's stops, and `LIGHT` documents the face table.

### 6.2 Layers and compositing
- `Layer`: premultiplied RGBA float32 (h, w, 3) + (h, w).
  - `put(y0, x0, cov, rgb)` lays paint with coverage `cov`: c = c (1 - cov) + cov rgb, a = a (1 - cov) + cov. So later
    strokes cover earlier ones, as gouache does.
  - `fill(mask, rgb_or_image)` is a flat design shape.
  - `blur(sigma)` filters both c and a (premultiplied, so edges stay clean); `clip(mask)` multiplies both.
- `Canvas.over(layer)`: c = layer.c + c (1 - layer.a).
- **Each pass is its own Layer:** paint it, blur it by its sigma (3.4), clip it to its mass or face, composite it.
- A plane, a far rock or a whole facade is a Layer too: converted by `to_plane(rgb, k, chroma)` (a mix toward `air`
  by k, then the chroma scaled about the air) and blurred by the plane's sigma.
- The ground converts per pixel: `depth_convert(cv, k_map, chroma_map)`.

### 6.3 The brush: a profile swept along a path (`Brush`)
- For a stroke, take its bounding box and compute per-pixel stroke coordinates:
  - `u` = the distance along the path (0 at the start);
  - `v` = the signed distance across it.
- **The coverage** = across(v) x along(u) x dry(u, v):
  - **across:** smoothstep((v + w/2)/soft_lo) x smoothstep((w/2 - v)/soft_hi). The core is flat and opaque; soft_lo
    and soft_hi set each side's edge (0.45 px crisp ... 14 px soft).
  - **along:** smoothstep(s/taper_in) x smoothstep((1 - s)/taper_out), with s = u/length. Blocks use 0.01-0.05; soft
    strokes 0.25-0.3.
  - **dry:** a 512 x 512 bristle tile (white noise blurred sigma 0.7 across x 14 along, normalized), sampled at
    (v + ov, u + ou) with a random offset per stroke. Paint is kept where noise > a threshold that rises over the
    stroke's last `dry_len` (and toward its soft edge with `edge_dry`). The breaks therefore run ALONG the stroke.
- **The paths:**
  - `line(p0, p1, width, ...)`;
  - `mark(cx, cy, length, width, angle, ...)`: the blocky flat-brush mark, centred, at an angle (90 = down);
  - `arc(centre, radius, th0, th1, width, ..., squash)`: an elliptical arc, for strokes along a dome; u = the angle x
    the radius, v = the radius offset;
  - polylines are consecutive `line`s (the rock's arris, rim and contact, sampled from its outline).
- **Options:** `drift` thins the paint along the stroke (an L shift toward the tail); `clip` is a mask multiplied into
  the coverage (a stroke kept inside its flag or plane).
- **If an engine needs a stamp:** render across(v) x the bristle tile into a w x w RGBA stamp, but SWEEP it (the
  u, v mapping above). Never chain stamps: their seams read as beads.

### 6.4 Placement by intent (where the strokes go)
- `sample_by(weight, n, rng)` draws n stroke centres with probability proportional to a weight map.
- The weight maps:
  - `inside_dist(mask)`: the distance from a face's border; exp(-d/22) = where the form turns;
  - `below_map(mask, length)`: the band under sills, bands and soffits, fading over `length`;
  - pier columns: Gaussians between windows;
  - region masks (the lit side, the low wall, the upper wall).
- Panel strokes are placed by the architecture's own boxes (piers x floors, spandrels).
- Brick patches use a smooth patch field (`value_noise`, cell 60-70 px) through a smoothstep, so bricks appear and
  vanish.

### 6.5 Perspective helpers
- **Ground:** y = 792 + 935 x 1.6 / Z, x = 540 + 935 X / Z (`ground_xy`, `rock_xy`); per pixel, Z and X from y and x.
- **A receding face:** `fac_side_pt(u, yc)` maps (u from the far edge 0 to the corner 1, a height on the corner's
  scale) through the vanishing point on the horizon.
  - Brick courses on that face are drawn in face coordinates and mapped point by point.
- **Shadows:** for each caster, per ground pixel, s and q along and across the sun's ground direction; the core is a
  smoothstep over the penumbra; the strength fades with s.

### 6.6 Speckle
- `grain(h, w, mask, density, r_range, dl_range, rng, light_share)` places Poisson(density x area / 1e4) discs, by the
  mask.
- `disc_field` sums anti-aliased discs into an L* delta field; `apply_dl` adds it in OKLab (0.01 L = about 1 L*).
- Speckle never touches glass, the far planes or calm ground beyond 5 m.

### 6.7 Determinism and the checks
- `rng_for(name, seed)` = numpy `default_rng` seeded by sha256("seed:name")[:8]. There is one generator per piece and
  sub-piece (`far_city/p2`, `paving/row17`, `rocks/3`, `facade/windows`, `tile/stone`), so adding a piece never
  reshuffles the others.
- The default seed is 20261029. The same seed gives the same bytes; `--check` verifies it with md5 per element.
- `--passes N` stops after pass N (0 = the flat design), for pass-by-pass review.

### 6.8 Into the engine (not built here; the painter `scripts/look/paint/paint.py` is another agent's)
- Each piece becomes one baked RGBA layer (as `lib/paint` already places pieces):
  - the far city: 4 plane PNGs (each rides its own parallax);
  - the facade: one PNG from the film's own flat design, its face masks rendered from the SVG (side, front, stone,
    openings, reveals);
  - the paving: one ground PNG plus its Z map;
  - each rock its own PNG.
- The passes run on the masks with the numbers above. The film's P0 IS the design, so the paint never changes a shape.

---

## 7. Sources (research, 2026-10-29)
Read through the search tool's summaries. This sandbox blocks direct fetches of these hosts.
1. Fine Art Tutorials, "Atmospheric perspective": https://finearttutorials.com/guide/atmospheric-perspective/
2. Gurney Journey, "Reverse atmospheric perspective": https://gurneyjourney.blogspot.com/2007/09/reverse-atmospheric-perspective.html
3. Creative Bloq, "How to structure a matte painting to create a cinematic environment":
   https://www.creativebloq.com/art/digital-art/how-to-structure-a-matte-painting-to-create-a-cinematic-environment-game-concept-or-personal-illustration
4. Gurney Journey, "Simplified planes" (rocks as top / light / halftone / shadow planes): https://gurneyjourney.blogspot.com/2008/09/simplfied-planes.html
5. "How to paint reflected light (on rocks)": https://gabor-svagrik.squarespace.com/gabor-svagrik-blog/2023/1/5/how-to-paint-reflected-light-on-rocks
6. Krantz, Hanover College, "Texture gradient" (the cobblestones of *Paris Street; A Rainy Day*): https://psychology.hanover.edu/Krantz/art/texture.html
7. Lines and Colors, "James Gurney on gamut masking": https://linesandcolors.com/2011/09/19/james-gurney-on-gamut-masking/
8. Nippon Paint, "Which parts of your exterior walls get dirty the fastest": https://www.nipponpaint.com.my/articles/tips-and-guides/which-parts-of-your-exterior-walls-get-dirty-the-fastest/

These are sources of METHOD (planes, gamut, atmosphere, texture gradient, weathering), never style targets.
