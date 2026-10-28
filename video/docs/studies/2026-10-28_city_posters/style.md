# Look lens 2: visual style (colour, light, shape, texture, line, sky, water, type)

*Study, not a rule change (README), updated after the owner's 2026-10-28 answers (playbook; DIRECTION rules 4-6: a VERY
subtle paper-and-paint texture may be tried, every volume in lit and shade tones, a full value range whose numbers come
from this study; outline-free edges still open). Every number is measured by `video/scripts/look/posters/style.py` on
the seven screenshots with the Instagram UI masked (`ui_mask.json`), against full-size frames of our masters (v2 = the
baseline). Sheets: `img/style_*.jpg`. CIE L*, C*, h (D65); dE = dE76; "% W" = share of the frame width. The posters are
phone screenshots of Instagram JPEGs (1080 px upscaled to 1206): fine grain is softened (est.).*

**In short.** (1) The posters' "very vibrant" colour (owner) is contrast, not more chroma: their base is calmer than
v2's (median C* 5-8 vs 13-14; a quarter to half of each poster near-neutral, v2 2-5 %) and their few accents stronger
(C* p99 37-54 vs 30-42; p90 / p50 2.3-4.6 vs 1.2-2.4), with a full value range (L* p5-p95 spans 53-73 vs v2's 30-48;
8-24 % under L* 40 in 27-65 small pieces, v2 1-4 %). (2) Every volume is one deep flat step (lit to shade dL* -21 to
-37, median -29; our form step -7 to -12), no gradient, no cast shadow on the ground; the planes are a hard-edged
patchwork whose steps shrink with distance (near dE 18-35, far 10-12, sky planes 1-5). (3) The approved texture,
measured: grain 0.2-0.9 L* (~2.5 px) plus a mottle 0.4-0.7 L* (blotches 40-70 px). Through H.264 a world-locked mottle
survives every rung (84-95 %) for +27 % master bitrate; any fine grain adds most of the cost (+48-61 % in all), loses
half of itself at 720p and shimmers. Hanoi, Kyoto and Copenhagen sit deep in the owner's banned beige, olive and grey
(35-46 % of the land): not to take.

## 1. What the posters do (measured)

### 1.1 Colour (`img/style_colour.jpg`, `img/style_saturation_darks.jpg`)
| Poster | sky (median) | C* median | near-neutral (C* < 6) | warm / cool / green-olive | C* >= 35: share, parts, largest | L* < 40 | L* p5 / p50 / p95 | land in beige+olive+grey |
|---|---|---|---|---|---|---|---|---|
| Singapore | `#D1DBDA` L 87 C 4 h 191 | 6.5 | 44 % | 13 / 36 / 6 | 3.3 %, 8, 1.7 % | 10 % | 31 / 83 / 90 | 13 % |
| Reykjavik | `#D1DBDD` L 87 C 4 h 216 | 5.0 | 57 % | 11 / 24 / 8 | 2.7 %, 8, 1.1 % | 8 % | 35 / 84 / 88 | 24 % |
| Hanoi | `#F3EAD3` L 93 C 12 h 94 | 13.3 | 8 % | 51 / 7 / 34 | 6.8 %, 28, 0.9 % | 24 % | 21 / 66 / 94 | 35 % (+16 % yellow-green) |
| Buenos Aires | `#F1ECE0` L 94 C 7 h 93 | 7.5 | 14 % | 61 / 14 / 8 | 6.3 %, 18, 1.3 % | 12 % | 24 / 87 / 94 | 15 % |
| Cape Town | `#C9D8DD` L 85 C 6 h 227 | 6.4 | 47 % | 17 / 27 / 8 | 2.0 %, 10, 0.3 % | 13 % | 25 / 76 / 90 | 24 % |
| Copenhagen | `#DCDBCC` L 87 C 8 h 108 (olive) | 8.4 | 26 % | 26 / 8 / 41 | 3.0 %, 9, 0.9 % | 15 % | 22 / 84 / 91 | 46 % (sky 64 % olive) |
| Kyoto | `#F1EBDF` L 93 C 7 h 90 | 7.3 | 25 % | 63 / 0.2 / 12 | 9.1 %, 11, 4.5 % | 21 % | 24 / 75 / 94 | 43 % |
| **v2** (5 frames) | mint `#BCDCCF` L 85 C 13 h 168 | 13.1-13.7 | 2-5 % | 34-61 / 32-52 / 1-11 | 0.7-3.5 %, 2-17, <= 0.6 % | 1-4 % | 44-59 / 78-84 / 88-96 | (beige band 7-26 %: shaded paving) |
- **Vibrant by contrast.** Half the posters' pixels sit under C* 5-8, while v2 tints everything (the mint, stucco and
  paving: median 13). Their top chroma is higher (p99 37-54; v2 30-42) and further from their base (p90 / p50 2.3-4.6;
  v2 1.2-2.4): a quiet field makes each accent ring. Pops (C* >= 50) stay rare: 0-2 % (v2 0-0.6 %).
- **Saturation is confetti, never a field:** C* >= 35 in 8-28 separate parts, none over 1.7 % (Kyoto's torii 4.5 %),
  never in the top third (6/7): roofs, lanterns, flowers, a flag, one facade each.
- **The darks are confetti too, and 3-10x ours:** L* < 40 covers 8-24 % in 27-65 pieces (windows, doorways, eaves,
  foliage shade; Hanoi's and Kyoto's foliage joins into one ~11 % mass); v2: 15-24 pieces, 1-4 %. Value range p5-p95:
  53-73 L* (v2 30-48). Tinted, never black: medians `#354F4D` teal, `#3F505C` slate, `#413F3B`, `#524838` brown.
- **The hero is rarely a hue:** in 5/7 the landmark is the palest or most neutral mass near it (Obelisco C* 5-8,
  Hallgrimskirkja 3-10, Table Mountain 1-14, Marina Bay Sands 11-17); only Kyoto's gold (C* 40-47) is saturated.
- **The never bands** (`lib/water.tsx` `neverBand`; playbook "never beige, muddy tan, olive or grey"): Kyoto's land 16 /
  16 / 11 % beige / olive / grey (dark wood, pine and hills, stone), Copenhagen's 20 / 15 / 12 % and 64 % of its sky
  olive (h 104-108), Hanoi's water and foliage olive and yellow-green, Reykjavik's and Cape Town's stone grey (10-11 %).
  **What keeps them from reading sickly** (est.): the lightest, calmest field is a clean pale (L* 85-94) that does not
  tip yellow-green (Copenhagen aside); each olive or beige patch sits beside its complement at full strength (vermilion
  torii C* 42-52 by the pines) and beside deep darks (L* 18-30); they are real things' colours in pieces, under one paper
  texture. (The owner's "sick" frame was #7 Autumn Ochre's, not measured here.) The lint also flags 7-26 % of v2's
  frames (shaded paving, L* 78-86) and our ink: a lint, not a verdict.

### 1.2 Light (`img/style_planes_light.jpg`)
| Pair (lit vs shade) | lit L* C* h | shade L* C* h | dL* | C* x | hue turn |
|---|---|---|---|---|---|
| Singapore tower front vs side | 59 14 214 | 38 12 231 | -21 | 0.85 | +17 (bluer) |
| Reykjavik spire right vs left | 84 10 89 | 55 7 95 | -29 | 0.65 | +6 |
| Hanoi pillar right vs left | 88 21 85 | 54 6 109 | -34 | 0.27 | +25 (greyer) |
| Obelisco right vs left | 95 5 92 | 63 8 301 | -32 | (white) | to lavender |
| Cape Town house front vs side | 68 30 26 | 34 30 353 | -34 | 1.01 | -32 (to plum) |
| Cape Town lighthouse left vs right | 94 4 90 | 71 10 267 | -22 | (white) | to blue |
| Round Tower right vs left | 70 25 80 | 33 9 75 | -37 | 0.36 | -5 |
| Marble Church dome right vs left | 71 16 133 | 44 13 217 | -27 | 0.83 | +84 (sage to teal) |
| Kinkaku-ji gold lit vs shade | 71 47 81 | 45 40 77 | -26 | 0.85 | -4 |
- **One key, high and to the side** (est.), from the right in 6/7; Cape Town lights its lighthouse from the left and its
  houses from the right.
- **Flat values, deep steps:** prisms get 2 values, round forms 3-4 stepped bands (Round Tower L* 30 / 40 / 57 / 70, the
  dome 44 / 58 / 71), never a gradient: the new rule 5's "2-3 flat tones". But the step is 2-3x ours (median -29; CRAFT
  §d.3 form -7 to -12). Shade hue: cool on whites, plum on pink (chroma kept), held on gold, greyer on stone (C* x
  0.27-0.65).
- **No cast or contact shadow on any ground** (eye check: the cyclo, the bicycle, the cafe tables float); shadow lives
  under eaves and awnings. Modelled shade (`shade_steps`): 20-46 % of a poster (v2 7-38 %, dL* 14-16, toward rose).

### 1.3 Shape language: the geometric patchwork (`img/style_patchwork.jpg`)
- **Where:** far and mid city, the near ground, water and the sky's edges (in all seven, never on the landmark): the
  owner's "rest simpler ('a bit more low poly') yet coherent", measured.
- **Blocks:** flat, hard-edged, ruler-straight; median width 3.5-7.5 % W in mid, near and water patches (38-81 px at 1080;
  IQR 2-10 %), 6-10 % for far mountain planes, 1.5-2.2 % for facades. Edges: level 20-51 %, plumb 9-42 %, 45 deg
  diagonals 4-22 % (roof triangles), the rest organic.
- **No outlines:** an edge is a value step. In the plainest patchwork 9-30 % of edges carry a dark line (far mountains
  9-13 %), 39-56 % where windows and foliage mix in, 61-79 % in facades.
- **Steps shrink with distance** (dE / |dL*| across straight edges): near 18-35 / 13-25, far planes 10-12 / 9, sky planes
  1-5; 12-52 % of steps are soft (dE < 10). v2's ground: 3-17 / 2-9.
- **Translucent planes make a third tone:** Copenhagen's blue rectangle turns the olive-cream sky sage-grey (L* 91 C* 10
  h 104 -> L* 82 C* 6 h 158) and the peach triangle over it reads L* 86 C* 28; Kyoto's mountains step the sky down
  93 -> 88 -> 85 -> 80 -> 75 (far ones grey, the near one olive); Reykjavik 87.5 -> 83 -> 64; Singapore's sky rectangles
  sit 1-3 L* off the sky. Richness without noise: many flat shapes, one value each, aligned to the frame.

### 1.4 Texture (`img/style_texture.jpg`)
| | Singapore | Reykjavik | Hanoi | Buenos Aires | Cape Town | Copenhagen | Kyoto | v2 sky |
|---|---|---|---|---|---|---|---|---|
| grain std L* (size, FWHM) | 0.86 (1.3 px) | 0.48 (2.4) | 0.39 (2.3) | 0.21 (2.9) | 0.48 (2.3) | 0.43 (2.8) | 0.24 (2.9) | 0.25 (1.2): lib/sky dither |
| mottle std L* (p1-p99), 1/e radius | 0.60 (2.8), 20 px | 0.66 (3.2), 36 | 0.64 (3.0), 30 | 0.39 (2.0), 27 | 0.52 (2.4), 34 | 0.71 (3.2), 33 | 0.49 (2.2), 26 | 0.01-0.02 (S4, S8) |
- Grain partly coloured (chroma / L* 0.45-1.09, partly JPEG), independent of L* (r -0.04 to 0.19); Singapore's a canvas
  weave. The mottle is coloured too (chroma std 0.57-1.13) and brushed vertically in four; it covers sky and fills alike.
- **Now decided** (owner, 2026-10-28: "start playing with it, very subtly especially if its adding to the premium look";
  DIRECTION rule 4: "a fine paper-and-paint grain with gentle mottling in the big flats, static and locked to the world",
  tried in a look clip, kept only if it adds). "Very subtle", in numbers: the posters' grain is at or near our invisible
  sky dither (0.2-0.9 vs 0.28 L*), their mottle 0.4-0.7 L* with 2-3 L* blotches; Buenos Aires and Kyoto are the
  subtlest (grain 0.21-0.24, mottle 0.39-0.49). Still a clash: rule 10 keeps the caption band "one calm flat field".
- **Through H.264** (`encode-test`: v2 S1 panning 30 px/s at 60 fps; grain 0.45 L* sigma 0.8 px, mottle 0.6 L* sigma
  14 px; master x264 CRF 14 slow aq 3, then x264 3.5 Mbps 1080p and 1.5 Mbps 720p):

  | Texture | master bitrate | kept at 1080 / 720 (grain; mottle) | frame-to-frame dL* (master) | check_banding |
  |---|---|---|---|---|
  | none | 1822 kbps | - | 0.048 | PASS / PASS |
  | grain + mottle locked to the world | 2935 (+61 %) | 95 / 42 %; 91 / 95 % | 0.138 (shimmer) | WARN / WARN (reads grain as weak steps) |
  | the same locked to the screen | 11385 (6.2x) | 76 / 56 %; 91 / 93 % | 0.188 | WARN / WARN |
  | grain re-seeded each frame | 26133 (14x) | 0 / 0 % | 0.392 | PASS / PASS (erased) |
  | mottle only, locked to the world | 2320 (+27 %) | -; 86 / 90 % | 0.069 | PASS / PASS |
  | the subtlest posters' level: grain 0.25 + mottle 0.5, world | 2698 (+48 %) | 95 / 52 %; 84 / 88 % | 0.108 | PASS / WARN |

### 1.5 Line
- **No outlines anywhere** (1.3). Thin dark lines live only where the thing is a line: mullions and window frames,
  railings, rigging and masts, branches, bamboo, bridge rails; hairlines (median 0.9 px at 1080) at L* 26-37.
- Per frame: dark-line pixels 3.3-7.9 % (v2 0.6-1.4 %, v1 5.4-5.9 %), strokes 783-1734 per Mpx, nearly all short (v2
  44-139; CRAFT §c budget <= 80), edges carrying a line 38-68 % (v2 5-24 %; budget <= 40 %): window grids, not outlines.
- **For the owner's A vs B (open):** A = our tier A outline (3.0 px in the object's own deep shade). B, as the posters
  do it = no outline: every edge a value step (1.3), the subject modelled by its lit and shade faces (dL* 20-35), ~1 px
  lines only on things that are lines (mullions, railings, rigging) at L* 26-37.

### 1.6 Sky (`img/style_sky_water.jpg`)
- Two families: cool blue-grey paper (Singapore, Reykjavik, Cape Town: L* 85-87, C* 4-6) and warm cream paper (Hanoi,
  Buenos Aires, Kyoto: L* 93-94, C* 6-12, h 90-94, just under the olive band). Nearly flat, lighter toward the horizon
  (dL* top -> skyline +5.2 Singapore, +5.8 Copenhagen, +1.2 to +2.2 in four, -0.3 Buenos Aires), chroma flat or falling;
  no warm band, no sunset. Over a caption band's 240 px the rows move 0.4-3.1 L* (Singapore, Copenhagen, Reykjavik
  break CRAFT §g's 1.5), plus the mottle (p1-p99 2-3 L*). Structure without clouds: pale rectangles and translucent
  planes (1.3). v2 S1: L* 83.7 -> 85.0 (+1.1, monotone), C* 13-14: more chromatic and flatter than any poster sky.

### 1.7 Water (`img/style_sky_water.jpg`)
- **Built from the colours above:** column profiles under a source match it (correlation 0.45-0.93: Reykjavik's ship
  0.93, Kyoto's pavilion 0.77, Singapore's boat 0.75); reflections 10-23 L* lighter, pulled to the water's hue
  (Copenhagen's ochre facades turn blue-grey, C* x 0.41); cut into level bands (level / plumb edge energy 1.3-2.7, bars
  4-13 px; 0.8 under Hanoi's bridge, whose piles mirror as verticals) and, in Copenhagen and Singapore, axis-aligned
  blocks (6-7.5 % W, steps dE 13-20); a few thin light streaks; no sparkles, stars or dashes.
- **Why their block water reads premium:** the blocks are the same patchwork as the sky, ground and city (one system),
  each carries a true mirrored colour at the right x, in many sizes with small steps and texture inside. v2's rejected
  water had a few boxes in a smooth flat world, so they read as patches ("way too cheap"). v2's approved water
  (`lib/water.tsx`, "Yeah this is better") already has the mirror, the veil and the level bands (level / plumb 2.29,
  bars ~5 px): blocks fit only inside a patchwork world (lesson 4).

### 1.8 Type (`img/style_type.jpg`)
| | cap height | letter gap / pitch (% cap) | stroke (% cap) | width | centre y | ink on sky |
|---|---|---|---|---|---|---|
| Singapore | 18 px, 1.5 % W | 156 / 238 | 12 | 29 % W | 11 % | `#20383E` L 22, 8.3:1 |
| Reykjavik | 20, 1.7 % | 115 / 189 | 14 | 26 % | 11 % | `#264354` L 27, 7.3:1 |
| Hanoi | 26, 2.2 % | 104 / 195 | 8 | 17 % | 14 % | `#3E4337` L 28, 8.6:1 |
| Buenos Aires | 20, 1.7 % | 132 / 210 | 10 | 37 % | 9 % | `#242E37` L 18, 11.9:1 |
| Cape Town | 18, 1.5 % | 133 / 214 | 9 | 26 % | 14 % | `#223841` L 22, 8.3:1 |
| Copenhagen | 33, 2.7 % | 124 / 202 | 9 | 51 % | 13 % | `#18272D` L 15, 10.5:1 |
| Kyoto | 22, 1.8 % | 116 / 209 | 12 | 17 % | 13 % | `#38362F` L 23, 10.0:1 |
| v2 cover (ours) | 61 px, 5.7 % W | 9-11 / 55-70 | 10-11 | 27-77 % | 18-28 % | `#2B1B0A` L 11, 11.3:1 |
- One line of geometric sans caps (round O, pointed A and V, spurless G: Futura-like), light to book weight, tracked
  wide open (1.0-1.7 cap heights between letters), centred in the open sky over the landmark at 9-14 % of the height,
  small (cap 1.5-2.7 % W), in a dark ink tinted toward the sky (navy-teal on blue, warm grey-black on cream).

## 2. Where our films stand
- **v2 (the baseline),** Canal Mint (`src/v2r/palette.ts`). The measurable gaps behind the owner's "still feels cheap
  and lazy": a narrow value band (p5-p95 30-48 L*, darks 1-4 %), a base tinted everywhere (median C* 13, so no accent
  rings), shallow modelling (form -9), perfectly flat fills (only the sky's invisible dither), a sky flatter and more
  chromatic than any poster's. Its strengths hold: the clean pen, confetti saturation, one cool field, the approved water.
- **v1:** lined (5.4-5.9 % line pixels, 1-3 px), flat, warm and cool balanced. **v3:** warm 95 %, a saturated field (C*
  >= 35 on 23 % of a frame, one part 11 %), 31 % beige band: the field-saturated warm frame the posters never make.

## 3. Lessons, ranked by the difference they would make
1. **The full value range, with numbers** (owner rule since 2026-10-28; "the numbers come from the city-poster study").
   *What:* L* p5 <= ~30 (posters 21-35, v2 44-59); 6-15 % of a frame under L* 40 (posters 8-24 %, v2 1-4 %) in many
   pieces under ~1 % each (windows, doorways, eave undersides, near foliage) in the anchor's tinted family, near and mid
   planes only; page and mids at C* ~8-10 for place films so the accents ring (p90 / p50 >= ~2.5). *In our films:* W1's
   colour script states the dark share and page chroma; `scripts/qa/colour_meter.py` adds L* p5, dark % and dark parts
   (`style.py` `colour()`); far planes stay light (CRAFT §f.2). *Cost* S. *Risk:* darks by the caption band or in far
   planes break the band and the air. *Doc note:* rule 6's "one tinted dark anchor (~5 %)" sits beside "a few real
   darks": the lower docs should say the anchor is the darks' hue, not their cap.
2. **How deep a shade face is** (rule 5 now asks every volume for a lit and a shade tone; the depth is open). *What:*
   tier A's shade face dL* -18 to -25 (posters -21 to -37), 3-4 bands on round forms, cool on whites, plum on warm,
   chroma kept; B and C stay -7 to -12. *In our films:* `lib/light.tsx` `FormShade` takes a per-tier strength, CRAFT §d.3
   a tier-A row, `check_light.py` the A step; shown in the G4 look clip; a 20-30 L* step still reads at thumbnail size.
   *Cost* S-M. *Risk:* a turning object re-cuts its step per frame. *Clash:* rule 5's "gentle in value" and CRAFT §d.3
   ("-25 to -40 ... too hard for our pale palettes"): the owner judges.
3. **The approved texture, made safe for H.264.** *What:* the mottle carries it (<= 0.5-0.6 L*, 40-70 px blotches,
   faintly coloured at most: +27 % master bitrate, 84-95 % kept on the platform); a grain, if any, at the subtlest
   posters' level (<= 0.25 L*, ~2.5 px), which still lifts the cost to +48 % and halves at 720p; both static and
   world-locked per parallax plane, never re-seeded or screen-locked (6-14x). *In our films:* a texture layer per plane
   (a tileable PNG from a seeded generator, like `make_blue_noise.py`), the last step after G6; `check_banding.py` gets a
   texture-aware mode (A/B against the texture-only render; it WARNs on grain today). *Cost* M. *Risk:* the caption band
   (question 1); floats and pans pay the bitrate, locked holds far less (est.).
4. **The geometric patchwork for far and mid planes, the ground and the sky's edges** (the owner's "a bit more low
   poly yet coherent"). *What:* flat ruler-straight blocks 3.5-7.5 % W (far 6-10 %), steps by plane (near dE ~18-25, far
   ~10, sky 1-5), translucent overlaps as third tones, no outlines, never on the subject. *In our films:* a new
   `src/lib/patchwork.tsx`: seeded blocks inside a plane's polygon, tones from `lib/depth` `planePalette`, overlaps as
   alpha-over, locked to its parallax group, projected by `groundCam` so the ground recedes, whole-pixel edges, blocks
   >= 8 px, nothing in y 290-600; W1 declares it, G3 draws grey blocks, the G4 look clip judges it. *Cost* M-L.
   *Risk:* edge noise in motion; frontal blocks on a receding ground read flat (CRAFT §f.4).
5. **Sister palettes from the posters** (below): Poster Harbour, Lantern Paper. W1 candidates for place films, shown
   in G4. *Cost* S. *Risk:* Lantern Paper borders the beige and olive bands by design: judge it on a moving frame.
6. **A paper sky preset:** lighter toward the horizon (+2 to +5 L*), C* 8-10, no warm band by day; a `lib/sky.tsx`
   preset, the caption band still flat (<= 1.5 L*). *Cost* S. *Risk:* under C* ~6 it reads grey (the posters' 4-6 is
   the edge).
7. **Cover type as the series signature.** The 19 posters read as one series through one constant title (1.8); the
   owner now asks that of our covers ("Our covers on the profile grid should read as one series, as the city posters'
   19 do", playbook ONE LOOK). *What:* a constant place or one-word label in tracked geometric caps (gap ~1.2 caps,
   light weight, ink tinted to the sky), same size and place on every cover, above the core line, which stays big (v2's
   61 px cap); captions keep our hand font. *In our films:* an OFL Futura-like (Jost) in `public/fonts`, cover only;
   label cap >= 32 px at y >= ~320, inside the grid's 4:5 and 3:4 centre (v2 POSTING_KIT). *Cost* S. *Risk:* two type
   voices on one cover; at the posters' 1.5-2.7 % W it would vanish in the grid.
8. **Water:** keep `lib/water.tsx`; a `style: 'blocks'` option only inside a patchwork world, judged in G4 beside the
   approved water. *Cost* M. *Risk:* the owner's "box-shaped reflection patches ... cheap".

## 4. What not to take
- **The beige, olive and grey fields** (Copenhagen's olive sky, Kyoto's olive hills and grey stone, Hanoi's olive water):
  the owner's rule ("we need to have a warm feeling, not sick"); the sister palettes keep the structure without them.
- **Fine grain at the posters' upper level, grain re-seeded per frame, texture locked to the screen:** 1.6-14x the
  bitrate, erased or smeared by the platform, shimmer at 60 fps (1.4).
- **Window grids as line density** (783-1734 strokes / Mpx against our 80): in motion it boils; our far windows stay
  tone-on-tone (CRAFT §f.2). **Greyed shadows on stone** and **no contact shadows**: ours keep colour and touch the
  ground (CRAFT §d.6). **Two light directions in one frame** (Cape Town).
- **Abstract rectangles in the open sky:** a seam no object explains (DIRECTION rule 6); planes are fine as mountains or
  masses. **The tiny title as the cover's core line, or any title over the captions** (playbook Hook and pacing).

## 5. Open questions for the owner
1. Texture and captions: may the paper mottle continue through the caption band at about half strength (~0.3 L*), or
   must the band stay perfectly flat (rule 10)? The posters' skies are mottled right behind their titles.
2. Light: how deep may the shade face go on the subject: about -20 to -25 L* (the posters -21 to -37) or our gentle -7
   to -12?
3. Colour: for a place film, a calmer, less tinted base so the accents ring (Poster Harbour or Lantern Paper) in W1/G4?

## Sister palettes (proposals in palettes.json's role format; not added to palettes.json)
Both pass `style.py dna` (palette_board.py's DNA, ink >= 7:1, and no role or support colour at L* >= 40 in a never band).
```json
[{"name": "11 Poster Harbour (proposal)", "mood": "A city by water on a clear morning (Singapore, Reykjavik, Cape Town) with Canal Mint's DNA: a pale blue paper sky and the harbour as the one cool field, warm limestone and white walls, facades as confetti, slate windows as the darks, a terracotta-roof hero, a marigold pop.",
  "colors": {"bg": "#C9DDE9", "ground": "#EFE2D0", "disc": "#F8DDB0", "hl": "#F4B99C", "line": "#7C4B3A", "skin": "#D9A27E", "hero": "#C8553D", "anchor": "#273A4F", "pop": "#F2A63A", "ink": "#1D2B36"},
  "support": {"facade_confetti": {"colors": ["#E8C36A", "#7D9CC4", "#E0A3A0", "#9CBFA7", "#F1E6D6"], "role": "facades, roofs, boats: patches under 1-3 % each"},
              "shade_family": {"colors": ["#B9B6CF", "#8E7A92", "#5F6F8E"], "role": "form shade: lavender on whites, plum-rose on warm walls, slate deepest"},
              "water": {"colors": ["#A9C6CF", "#7FA3B4", "#557C93"], "role": "the harbour, far to near"}}},
 {"name": "12 Lantern Paper (proposal)", "mood": "Old-town warmth (Hanoi, Kyoto, Buenos Aires) without their beige, olive and grey: a warm paper sky, peach-cream stone, pine and leaf-sage greens, rose-grey stone, red-brown wood, a gold hero, a vermilion pop, deep pine as the anchor; the pond is the one cool field.",
  "colors": {"bg": "#F4EBDC", "ground": "#F0D8C0", "disc": "#F6CF86", "hl": "#F2B48F", "line": "#874630", "skin": "#D9A27E", "hero": "#C9963A", "anchor": "#22332F", "pop": "#E4532E", "ink": "#2B1B0A"},
  "support": {"greens": {"colors": ["#4F7468", "#86A898", "#B9CDBF"], "role": "pine, leaf sage, far trees (h 154-171, never 95-118)"},
              "stone": {"colors": ["#DCC5C3", "#B8A3A6", "#8C6E73"], "role": "stone, plaster in shade, tiles: rose-grey, never grey"},
              "water": {"colors": ["#A8C2BF", "#7FA29F", "#56807E"], "role": "the pond or river: the one cool field"}}}]
```
- **Poster Harbour** breaks one DNA line on purpose: a cool page (L* 87 C* 9 h 242) where rule 6 says "warm by default";
  the sky is the one cool field, as Canal Mint's mint is. **Lantern Paper**'s page (L* 93 C* 8 h 86) and ground (L* 88
  C* 16 h 73) sit just outside the beige band (L* < 86) and under the olive band: lint their shaded copies on the frame.
  Side finding: the same check flags house palettes #1-2's ground (yellow-green) and #5 Sage Study's page (olive, h 116).

## Method and files
`video/scripts/look/posters/style.py` (`measure`, `sheets`, `encode-test`, `dna`; regions in `POSTERS` and `OURS`; run
from `video/` with `python3 -I`; line metrics port `retro_tools/line/measure.py`, the never bands `lib/water.tsx`, the DNA
`palette_board.py`). Limits: JPEG screenshots soften grain and chroma; boxes are hand-placed; the light side, the missing
shadows and the "sickly" reading are eye judgements (est.); v2 = 5 master frames (1, 9, 17.5, 22, 36 s), v1 and v3 2 each.
