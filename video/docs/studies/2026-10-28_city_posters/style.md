# Look lens 2: visual style (colour, light, shape, texture, line, sky, water, type)

*Study, not a rule change (README). Every number is measured by `video/scripts/look/posters/style.py` on the seven
screenshots with the Instagram UI masked (`ui_mask.json`), against full-size frames of our masters (v2 = the baseline
the owner likes). Sheets: `img/style_*.jpg`. CIE L*, C*, h (D65); dE = dE76; "% W" = share of the frame width. The
posters are phone screenshots of Instagram JPEGs (1080 px upscaled to 1206): fine grain is softened (est.).*

**In short.** (1) The posters' base is calmer than v2's and their darks are many: median C* 5-8 (v2 13-14), a quarter to
half of each poster near-neutral (C* < 6; v2 2-5 %), 8-24 % under L* 40 in 27-65 small pieces (v2 1-4 %); their
saturated colour is confetti, as our DNA asks. (2) Landmarks are modelled with one deep flat step (lit to shade dL* -21
to -37, median -29; our form step -7 to -12), never a gradient and almost never a cast shadow; their planes are a
hard-edged patchwork whose steps shrink with distance (near dE 18-35, far 10-12, sky planes 1-5). (3) Four of the seven
sit deep in the owner's banned beige, olive and grey (24-46 % of the land) and every poster carries a paper mottle and
grain (DIRECTION rule 4 forbids grain). Both clash with owner rules; the call is the owner's. Through H.264 a
world-locked mottle survives every rung for +27 % bitrate; fine grain costs +61 % and is half lost at 720p.

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
- **A calm base, then accents.** Half the posters' pixels sit under C* 5-8; v2's median is 13 (the mint, stucco and paving
  are all tinted). The posters' C* p90 (18-34) and pops (C* >= 50: 0-2 %) match v2's (16-32; 0-0.6 %): the accents are as
  strong as ours, the base is quieter, so the accents read louder.
- **Saturation is confetti, never a field:** C* >= 35 in 8-28 separate parts, none over 1.7 % of the frame (Kyoto's
  torii 4.5 %), never in the sky (0 % in the top third in 6/7), on roofs, lanterns, flowers, a flag, one facade each.
- **The darks are confetti too, and 3-10x ours:** L* < 40 covers 8-24 % in 27-65 pieces >= 0.02 % (windows, doorways,
  eaves, foliage shade; Hanoi's and Kyoto's foliage joins into one ~11 % mass); v2 has 15-24 pieces and 1-4 %. Value
  range p5-p95: posters L* 21-35 -> 88-94 (55-70 L*), v2 44-59 -> 88-96 (31-45). Darks are tinted, never black: `#354F4D`
  teal, `#3F505C` slate, `#444046`, `#3C464D`, `#413F3B`, `#524838` (medians).
- **The hero is rarely a hue.** In 5/7 the landmark is the palest or most neutral mass near it: the Obelisco L* 95 / 63
  at C* 5-8, Hallgrimskirkja cream-grey C* 3-10, Table Mountain grey-blue C* 1-14, Marina Bay Sands blue-grey glass C*
  11-17; only Kyoto's pavilion is a saturated hero (gold C* 40-47). It reads by value, size, silhouette and the empty sky
  round it (the composition lens owns the focus).
- **Two sky families:** cool blue-grey paper (Singapore, Reykjavik, Cape Town: L* 85-87, C* 4-6) and warm cream paper
  (Hanoi, Buenos Aires, Kyoto: L* 93-94, C* 7-12, h 90-94, just under the olive band's h 95). Warm/cool follows the city:
  three cool (warm 11-17 %), four warm (cool 0-14 %); v2 is balanced (a warm world held by the cool mint).
- **The never bands** (`lib/water.tsx` `neverBand`; playbook "never beige, muddy tan, olive or grey"): below the skyline
  13-46 % of each poster; Kyoto's land 16 / 16 / 11 % (beige / olive / grey: dark wood, pine and hills, stone),
  Copenhagen's 20 / 15 / 12 % and its whole sky olive (h 104-108), Hanoi's water and foliage olive and yellow-green,
  Reykjavik's and Cape Town's stone and roofs grey (10-11 %). **What keeps them from reading sickly** (my reading, est.):
  the lightest, calmest field is a clean pale (L* 85-94) that does not tip yellow-green except in Copenhagen; every
  olive or beige patch sits beside its complement at full strength (vermilion torii C* 42-52 against pine, rust and
  ochre facades against Copenhagen's sky) and beside deep darks (L* 18-30), so the frame has a full value range; they are
  the colours of real things (pine, moss, stone, tile) in pieces, and the paper texture frames them as an aged print.
  v3's sick frame had the opposite: the whole page and its light yellowed. Note the lint's limit: it puts 7-26 % of v2's
  frames (shaded paving, L* 78-86) and our ink `#2B1B0A` in "beige"; it is a lint for mid fills, not the owner's verdict.

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
- **One key, high and to the side,** from the right in 5/7 (Reykjavik, Hanoi, Buenos Aires, Copenhagen, Singapore);
  Cape Town's lighthouse is lit from the left while its houses take the right: one inconsistency (est., eye check).
- **Flat values, deep steps:** prisms get 2 values (lit face, shade face), round forms 3-4 stepped bands (the Round Tower
  L* 30 / 40 / 57 / 70; the dome 44 / 58 / 71; the gold 45 / 71 / 81), never a gradient. The step is 2-3x ours: median
  -29 (CRAFT §d.3: form -7 to -12; v2's paving -9). Shade hue: cool on whites (lavender, blue), plum on pink with chroma
  kept, held on gold (-4 deg, C* x 0.85), greyer on stone and brick (C* x 0.27-0.65).
- **Shadow, mostly as form:** no cast shadow on any ground and no contact shadows (eye check); shadow appears under
  eaves, brackets and awnings (Hanoi's bracket, Kyoto's eaves). Area modelled as shade (`shade_steps`, the retro proxy):
  20-46 % (v2 7-38 %, dL* 14-16, hue -8 to -15 toward rose, chroma kept 0.91-1.08).

### 1.3 Shape language: the geometric patchwork (`img/style_patchwork.jpg`)
- **Where:** the far and mid city (Hanoi, Buenos Aires, Cape Town, Kyoto), the near ground (Singapore, Hanoi, Buenos
  Aires, Copenhagen), the water (Copenhagen, Singapore), the sky's edges (Singapore's rectangles, Reykjavik's and
  Kyoto's translucent mountains, Copenhagen's blue and peach rectangles). Never across the landmark.
- **Blocks:** flat, hard-edged, ruler-straight; median width 3.5-7.5 % W in mid, near and water patches (38-81 px at
  1080; IQR 2-10 %), 6-10 % for far mountain planes, 1.5-2.2 % for facades. Edges: level 20-46 %, plumb 9-42 %, 45 deg
  diagonals 4-22 % (roof triangles), the rest organic (foliage, flowers).
- **No outlines:** an edge is a value step; only 9-30 % of patchwork edges carry a dark line (far mountains 9-13 %),
  against 61-79 % in the window-dense facades.
- **Steps shrink with distance** (dE / |dL*| across straight edges): near patchwork 18-35 / 13-25, far planes 10-12 / 9,
  sky planes 1-5 / 1-5; 12-52 % of the steps are soft (dE < 10). v2's ground: 9-17 / 2-9.
- **Translucent planes make a third tone:** Copenhagen's blue rectangle over the olive-cream sky turns it sage-grey (L*
  91 C* 10 h 104 -> L* 82 C* 6 h 158, dL* -8.5) and the peach triangle over it reads L* 86 C* 28; Kyoto's mountains step
  the sky down 93 -> 88 -> 85 -> 80 -> 75 (3-5 L* each, the far ones grey, the near one olive); Reykjavik 87.5 -> 83
  (-4.4) -> 64; Singapore's sky rectangles 1-3 L* off the sky.
- **Richness without noise:** many flat shapes, one value each, aligned to the frame, small steps far and larger near:
  variety in size and tone, never inside a block (save the paper texture).

### 1.4 Texture (`img/style_texture.jpg`)
| | Singapore | Reykjavik | Hanoi | Buenos Aires | Cape Town | Copenhagen | Kyoto | v2 sky |
|---|---|---|---|---|---|---|---|---|
| grain std L* (size, FWHM) | 0.86 (1.3 px) | 0.48 (2.4) | 0.39 (2.3) | 0.21 (2.9) | 0.48 (2.3) | 0.43 (2.8) | 0.24 (2.9) | 0.25 (1.2): lib/sky dither |
| mottle std L* (p1-p99), 1/e radius | 0.60 (2.8), 20 px | 0.66 (3.2), 36 | 0.64 (3.0), 30 | 0.39 (2.0), 27 | 0.52 (2.4), 34 | 0.71 (3.2), 33 | 0.49 (2.2), 26 | 0.01-0.02 (S4, S8) |
- Grain is partly coloured (chroma / L* 0.45-1.09) and uncorrelated with L* (r ~ 0); Singapore's is a canvas weave. The
  mottle is coloured too (chroma std 0.57-1.13: blue, ochre and violet blotches in the stretch) and brushed vertically in
  Reykjavik, Cape Town, Singapore and Kyoto (column-mean std 0.25-0.33 vs rows 0.06-0.15). It covers sky and fills alike.
- **The clash, plainly:** DIRECTION rule 4 says "big areas flat, no specks, ticks, hatching or grain; the owner's
  halftone is the one optional texture, a last step", and CRAFT §c "no grain overlay". The owner said "VERY subtle texture
  ... test it in production" and then "very subtle and only tactically ... not everywhere" (PALETTE "Texture and lines").
  The posters' texture is everywhere. In amplitude it is close to our invisible sky dither (0.2-0.9 vs 0.28 L*), but
  coarser and with 2-3 L* blotches: it reads as paper on a phone.
- **Through H.264** (`encode-test`: v2 S1 panning 30 px/s at 60 fps; grain 0.45 L* sigma 0.8 px, mottle 0.6 L* sigma
  14 px; master x264 CRF 14 slow aq 3, then x264 3.5 Mbps 1080p and 1.5 Mbps 720p):

  | Texture | master bitrate | kept at 1080 / 720 (grain; mottle) | frame-to-frame dL* (master) | check_banding |
  |---|---|---|---|---|
  | none | 1822 kbps | - | 0.048 | PASS / PASS |
  | grain + mottle locked to the world | 2935 (+61 %) | 95 / 42 %; 91 / 95 % | 0.138 (shimmer) | WARN / WARN (reads grain as weak steps) |
  | the same locked to the screen | 11385 (6.2x) | 76 / 56 %; 89 / 91 % | 0.188 | WARN / WARN |
  | grain re-seeded each frame | 26133 (14x) | 0 / 0 % | 0.392 | PASS / PASS (erased) |
  | mottle only, locked to the world | 2320 (+27 %) | -; 86 / 90 % | 0.069 | PASS / PASS |

### 1.5 Line
- **No outlines anywhere** (1.3). Thin dark lines live only where the thing is a line: mullions and window frames,
  railings, rigging and masts, branches, bamboo, bridge rails; hairlines (median width 0.9 px at 1080) at L* 26-37.
- Per frame: dark-line pixels 3.3-7.9 % (v2 0.6-1.4 %, v1 5.4-5.9 %), strokes 783-1734 per Mpx, nearly all short (v2
  44-139; CRAFT §c budget <= 80), edges carrying a line 38-68 % (v2 5-24 %; budget <= 40 %): the window grids, not the
  outlines, carry these numbers. Our clean pen's tier A outline (3.0 px in its own deep shade) has no poster equivalent:
  their subject is separated by value (1.2).

### 1.6 Sky (`img/style_sky_water.jpg`)
- Nearly flat paper, lighter toward the horizon: dL* top -> skyline +1.2 to +5.8 (Singapore +5.2, Copenhagen +5.8; Buenos
  Aires -0.3), chroma falling 1-4 (Copenhagen rising 4.1); no warm horizon band (no poster has a sunset); a calm hue.
  Over a caption band's 240 px the row medians move 0.4-3.1 L* (Singapore 2.0, Copenhagen 2.4, Reykjavik 3.1 exceed
  CRAFT §g's 1.5; Buenos Aires 0.4, Cape Town 0.8, Hanoi 0.9, Kyoto 1.3 meet it), plus the mottle (p1-p99 2-3 L*).
- Structure without clouds: pale rectangles and translucent planes (1.3), Cape Town's tablecloth cloud, Reykjavik's
  aurora. v2: zenith 83.7 -> band 84.4 (dL* 1.0), C* 13 flat through the band: our sky is more chromatic and flatter.

### 1.7 Water (`img/style_sky_water.jpg`)
- **Built from the colours above:** column profiles under a source match it (correlation 0.45-0.93: Reykjavik's ship
  0.93, Kyoto's pavilion 0.77, Singapore's boat 0.75); reflections 10-23 L* lighter and pulled to the water's hue
  (Copenhagen's ochre facades turn blue-grey, C* x 0.41). Then cut into level bands (level / plumb edge energy 1.25-2.74;
  bars 4-13 px) and, in Copenhagen and Singapore, axis-aligned blocks (6-7.5 % W, steps dE 13-20), with a few thin light
  streaks. No sparkles, stars or dashes; calm.
- **Why the block water reads premium there:** it is the same patchwork language as the sky, ground and city (one
  system), each block carries a true mirrored colour at the right x, blocks come in many sizes with small steps, and a
  texture lives inside them. v2's earlier water was one flat band with a few boxes in a smooth flat-colour world: the
  boxes were the only boxes, so they read as patches ("way too cheap").
- **v2's approved water** (`lib/water.tsx`, "Yeah this is better") already shares the mirror, the veil toward the water
  and the level bands (level / plumb 2.29, bars ~5 px). The posters' blocks fit only inside a patchwork world (lesson 3).

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
  open (the gap between letters is 1.0-1.7 cap heights), centred in the open sky over the landmark at 9-14 % of the
  height, small (cap 1.5-2.7 % W), in a dark ink tinted toward the sky (navy-teal on blue skies, warm grey-black on cream).

## 2. Where our films stand
- **v2 (the baseline):** Canal Mint (`src/v2r/palette.ts`): a chromatic pastel base (median C* 13-14, only 2-5 %
  near-neutral), a cool mint sky field held flat in the caption band (L* 84-85, C* 13), warm stucco and paving; one
  small teal hero, the sun as the one pop; few darks (L* < 40 1-4 %, p5 44-59); flat fills with the sky's invisible
  dither (0.25 L*); the clean pen (0.6-1.4 % line pixels, 44-139 strokes / Mpx); gentle light (form -9, rose-turned,
  chroma kept); one gentle sky gradient; the approved water. Calmer in line, fuller in chroma, narrower in value than
  the posters.
- **v1:** a lined film (5.4-5.9 % line pixels, 3 px), flat fills, warm and cool balanced: closer to the posters in line
  density, without their value range or texture. **v3:** warm 95 %, a saturated field (C* >= 35 on 23 % of the frame, one
  part 11 %), 31 % in the beige band: the warm, field-saturated frame the posters never make.

## 3. Lessons, ranked by the difference they would make
1. **A calm base, dark confetti, colour confetti** (value range). *What:* lower the page and mid chroma for city films
   (C* ~8-10, still tinted, never under 6), and add a dark job: windows, doorways, eave undersides and near foliage in
   the anchor's family (L* 18-35, tinted), 8-15 % of a frame in many pieces under ~1 % each, near and mid planes only.
   *Evidence:* 1.1 (L* < 40 8-24 % vs 1-4 %; C* median 5-8 vs 13). *In our films:* W1's palette states a dark-confetti
   share and the page chroma; `scripts/qa/colour_meter.py` adds L* p5, dark % and dark parts (style.py's `colour()`);
   the far planes stay light (CRAFT §f.2). Survives 9:16 and the phone: darks are what stay legible at thumbnail size.
   *Cost* S. *Risk:* darks near the caption band or in far planes break the band and the air; heavy frames at low
   phone brightness. *Clash:* DIRECTION rule 6's "one tinted dark anchor (~5 %)" (a doc rule; the owner's own words
   support it: "some details have a bit more contrast to them", PALETTE).
2. **One deep form step on the subject.** *What:* tier A's shade face dL* -18 to -25 (2 flat values on flat faces, 3-4
   bands on round ones), shade cool on whites, plum on warm, chroma kept; B and C stay -7 to -12. *Evidence:* 1.2 (median
   -29). *In our films:* `lib/light.tsx` `FormShade` takes a per-tier strength; CRAFT §d.3 gets a tier-A row;
   `check_light.py` measures the A step; shown in the G4 look clip. Gives DIRECTION rule 2's "A owns the contrast" a
   light-side tool; reads at phone size. *Cost* S-M. *Risk:* harsher, less "gentle"; a hard step that moves with a
   turning object must re-cut per frame. *Clash:* CRAFT §d.3 calls -25 to -40 "too hard for our pale palettes"; the
   owner's "gentle, but always there" (playbook) is the judge.
3. **The geometric patchwork for far and mid planes, the ground and the sky's edges.** *What:* flat ruler-straight
   blocks 3.5-7.5 % W (far planes 6-10 %), steps by plane (near dE ~18-25, far ~10, sky planes 1-5), translucent overlaps
   as third tones, no outlines, never on the subject. *In our films:* a new `src/lib/patchwork.tsx` (seeded blocks inside
   a plane's polygon, tones from `lib/depth`'s `planePalette`, overlaps as alpha-over, locked to its parallax group,
   projected on the ground by `groundCam` so it recedes, whole-pixel edges, >= 8 px blocks, nothing in y 290-600); W1
   declares it per film; G3 draws it as grey blocks; the G4 look clip judges it. *Cost* M-L. *Risk:* busy or noisy
   edges in motion; frontal blocks on a receding ground read flat (CRAFT §f.4); a new style the owner has not seen moving.
4. **Paper texture as mottle, not grain** (only if the owner wants texture). *What:* a world-locked, static mottle (<=
   0.6 L*, 40-70 px blotches, optionally faintly coloured), no fine grain, never re-seeded, never screen-locked.
   *Evidence:* 1.4 and the encode table (+27 % bitrate, 86-95 % kept, banding PASS; grain halves at 720p, shimmers and
   trips `check_banding`). *In our films:* a texture layer per parallax plane (a tileable PNG from a seeded generator,
   like `make_blue_noise.py`), the last step after G6 as the halftone is; `check_banding.py` gains a texture-aware mode
   (an A/B against the texture-only render). *Cost* M. *Risk:* the caption band stops being "one calm flat field"
   (DIRECTION rule 10); bitrate. *Clash:* DIRECTION rule 4 and the owner's "not everywhere": the owner decides.
5. **Sister palettes from the posters** (below): Poster Harbour and Lantern Paper, DNA-checked. *In our films:* W1
   candidates for city and place films, shown in G4. *Cost* S. *Risk:* Lantern Paper sits next to the olive and beige
   bands by design: judge it on a moving frame.
6. **A paper sky preset.** *What:* lighter toward the horizon (+2 to +5 L*), C* 8-10, no warm band in daylight.
   *In our films:* a `lib/sky.tsx` preset (`eveningSky`'s keys); the caption band stays flat (<= 1.5 L*). *Cost* S.
   *Risk:* C* under ~6 reads grey (the posters' 4-6 is the edge).
7. **Cover type** (the core line belongs on the cover; captions keep our hand font). *What:* the place or a one-word
   label in tracked geometric caps (gap ~1.2 cap heights, light weight, ink tinted toward the sky) above the core line;
   the core line stays big (v2's 61 px cap). *In our films:* an OFL Futura-like (Jost) in `public/fonts` for the cover
   only; place it at y >= ~320 and cap >= 32 px so it survives the profile grid's 4:5 crop (y 285-1635) and its size.
   *Cost* S. *Risk:* two type voices on one cover; the poster's 1.5-2.7 % W title is unreadable in the grid.
8. **Water:** keep `lib/water.tsx`; a `style: 'blocks'` option only inside a patchwork world (lesson 3), judged in G4
   side by side with the approved water. *Cost* M. *Risk:* the owner's "box-shaped reflection patches ... cheap".

## 4. What not to take
- **The beige, olive and grey fields** (Copenhagen's olive sky, Kyoto's olive hills and grey stone, Hanoi's olive water):
  the owner's rule ("we need to have a warm feeling, not sick"); the sister palettes keep their structure without them.
- **Fine grain, grain re-seeded per frame, texture locked to the screen:** 1.6-14x the bitrate, erased or smeared by the
  platform, shimmer at 60 fps (encode table).
- **The window grids as line density** (783-1734 strokes / Mpx against our 80): in motion it boils; our far windows stay
  tone-on-tone (CRAFT §f.2). **Greyed shadows on stone** (chroma x 0.27-0.65) and **no contact shadows:** ours keep
  colour and touch the ground (CRAFT §d.6). **Two light directions in one frame** (Cape Town).
- **Abstract rectangles in the open sky:** a seam no object explains (DIRECTION rule 6); planes are fine where they are
  mountains or masses. **The tiny title as the cover's core line, or any title over the captions** (playbook).

## 5. Open questions for the owner
1. Texture: may the next G4 look clip try a world-locked paper mottle (subtle, no grain) on the whole frame, sky
   included, next to the flat version? It goes beyond "tactically ... not everywhere".
2. Light: may the subject's shade side go deeper (about -20 to -25 L*, the posters' -21 to -37) than our gentle -7 to -12?
3. Colour: for a city film, try a calmer, less tinted base with many small darks (Poster Harbour or Lantern Paper) in W1/G4?

## Sister palettes (proposals, palettes.json role format; not added to palettes.json)
Both pass `style.py dna` (palette_board.py's DNA + no role or support colour at L* >= 40 in a never band; ink >= 7:1).
```json
{"name": "11 Poster Harbour (proposal)", "mood": "A city by water on a clear morning (Singapore, Reykjavik, Cape Town) with Canal Mint's DNA: a pale blue paper sky and the harbour as the one cool field, warm limestone and white walls, facades as confetti, slate windows as the darks, a terracotta-roof hero, a marigold pop.",
 "colors": {"bg": "#C9DDE9", "ground": "#EFE2D0", "disc": "#F8DDB0", "hl": "#F4B99C", "line": "#7C4B3A", "skin": "#D9A27E", "hero": "#C8553D", "anchor": "#273A4F", "pop": "#F2A63A", "ink": "#1D2B36"},
 "support": {"facade_confetti": {"colors": ["#E8C36A", "#7D9CC4", "#E0A3A0", "#9CBFA7", "#F1E6D6"], "role": "facades, roofs, boats: patches under 1-3 % each"},
             "shade_family": {"colors": ["#B9B6CF", "#8E7A92", "#5F6F8E"], "role": "form shade: lavender on whites, plum-rose on warm walls, slate deepest"},
             "water": {"colors": ["#A9C6CF", "#7FA3B4", "#557C93"], "role": "the harbour, far to near"}}}
{"name": "12 Lantern Paper (proposal)", "mood": "Old-town warmth (Hanoi, Kyoto, Buenos Aires) without their beige, olive and grey: a warm paper sky, peach-cream stone, pine and leaf-sage greens, rose-grey stone, red-brown wood, a gold hero, a vermilion pop, deep pine as the anchor; the pond is the one cool field.",
 "colors": {"bg": "#F4EBDC", "ground": "#F0D8C0", "disc": "#F6CF86", "hl": "#F2B48F", "line": "#874630", "skin": "#D9A27E", "hero": "#C9963A", "anchor": "#22332F", "pop": "#E4532E", "ink": "#2B1B0A"},
 "support": {"greens": {"colors": ["#4F7468", "#86A898", "#B9CDBF"], "role": "pine, leaf sage, far trees (h 154-171, never 95-118)"},
             "stone": {"colors": ["#DCC5C3", "#B8A3A6", "#8C6E73"], "role": "stone, plaster in shade, tiles: rose-grey, never grey"},
             "water": {"colors": ["#A8C2BF", "#7FA29F", "#56807E"], "role": "the pond or river: the one cool field"}}}
```
- **Poster Harbour** vs the DNA: bg L* 87 C* 9 h 242 (a cool page: allowed as the one cool field, but DIRECTION rule 6
  says the page is "warm by default": a deliberate exception, like Canal Mint's mint); hero C* 57, anchor L* 24, pop
  C* 67, ink 10.3:1. **Lantern Paper:** bg L* 93 C* 8 h 86 and ground L* 88 C* 16 h 73 sit just outside the beige band
  (L* < 86) and the olive band (h > 95) by design: a shaded copy of either drops into beige (lint it on the frame).
  The house file's own check (`dna`) flags #1-2's ground (yellow-green) and #5 Sage Study's page (olive h 116).

## Method and files
- `video/scripts/look/posters/style.py` (`measure`, `sheets`, `encode-test`, `dna`; regions per poster in `POSTERS`, our
  frames in `OURS`; run from `video/` with `python3 -I`). Line metrics port `scripts/qa/retro_tools/line/measure.py`,
  shade area ports `retro_tools/light/shadepairs.py`, never bands follow `lib/water.tsx`, the DNA `palette_board.py`.
- Sheets: `img/style_colour.jpg`, `style_saturation_darks.jpg`, `style_patchwork.jpg`, `style_planes_light.jpg`,
  `style_texture.jpg` (with the encode table), `style_sky_water.jpg`, `style_type.jpg`.
- Limits: screenshots (JPEG, upscaled) soften grain and chroma edges; boxes are hand-placed (in the script); light side,
  cast shadows and the "sickly" reading are eye judgements (marked est.); v2 numbers are 5 master frames (1, 9, 17.5, 22,
  36 s), v1 2 and v3 2.
