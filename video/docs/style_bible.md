# Style bible: php2shell (owned by the style-bible stream)

Measured from `assets/ref/reference.mp4` (1080x1350) with pixel sampling, k-means on flat-fill pixels,
distance-transform and cross-section line widths, and font overlays. **All px values are at 1080 px canvas
width, i.e. the reference card (960 px wide) and our card (960 px wide) are the same scale: every number
below can be used directly in card-local coordinates.** Evidence images are in `docs/style_evidence/`
(index at the end). Proposed token values are in `docs/theme_proposal.json`.

Notation: "card-local" = coordinates inside the card (0..960 x 0..1400). "Panel" = the coloured block.
"em" = caption font size.

---

## 0. The look in one paragraph

A white, flat, square-cornered polaroid card on flat mint. Inside it, a flat-colour block (the panel)
holding a loose architectural ink sketch: thin, dark-brown, round-ended lines that run past their corners
and past the panel edge, over flat fills that are **clipped to the panel rectangle** and sit a few px off
their outlines. Thirteen colours, no gradients, no textures, no outlines on shadows. An orange disc
overlaps the panel's top edge in every wide shot. People are always seen **from behind**, as simple
"tombstone" torsos with round heads. Captions are Patrick Hand at 82 px, centred, dark-brown ink, with a
flat peach box behind key words.

---

## 1. Geometry: card, panel, sun

### 1.1 Reference (1080 x 1350), measured

| element | measured | as ratio of card width (960) |
|---|---|---|
| page bg margin | card at x 60..1019, y 60..1289 | 0.0625 |
| card | 960 x 1230, radius 0, pure #FFFFFF, **no shadow, no grain** (std 0.06) | h = 1.281 w |
| panel | x 96..863, y 96..863 card-local: **768 x 768 square** | inset 0.100 on L/R/top; w 0.800 |
| panel bottom to caption line-1 baseline | 175 px | 0.182 |
| caption baselines | card-local 1040 and 1136 (96 apart) | |
| line-2 baseline to card bottom | 95 px (descender to card bottom 69 px) | |
| sun | r = 71-72 px (all 13 wide shots); centre cx 320..752, cy 115..155 card-local | r = 0.075 w |
| sun vs panel top (panel y = 96) | disc top 24..53 px above the panel top; default (opening) centre (480,132): 36 px below the edge | |

Evidence: `geometry_ref_vs_9x16.png`, `sun_layering_atm.png`, `sun_setting_behind_wall.png`.

### 1.2 Our 9:16 layout (1080 x 1920): recommended numbers (theme keys)

Safe zone for captions and key action: canvas x 90..930, y 160..1480.

| key | value | canvas result | why |
|---|---|---|---|
| `card` | x 60, y 120, w 960, h 1400, radius 0 | 60..1020 x 120..1520 | keeps 960 width = 1:1 with the reference |
| `panel` | x 96, y 96, w 768, h 944 | 156..924 x 216..1160 | same 96 px inset, same width; +176 px height |
| `sun` | cx 480, cy 132, r 72 | centre (540,252), top 180 | top stays below safe-top 160 |
| caption line 1 baseline | 1208 | 1328 | panel bottom + 168 (ref 175) |
| caption line 2 baseline | 1304 | 1424 | +96 |
| line-2 descender / box bottom | 1330 / 1329 | 1450 / 1449 | < 1480 |
| `captionZone` | x 90, y 1136, w 780, h 220 | 150..930 x 1256..1476 | max line 780 px, centred on 540 |
| caption clip (roll viewport) | y 1070..1400 | 1190..1520 | lines enter from under the card edge |
| art overshoot limits | 60 px left/right, 80 top, 50 bottom | ink x 96..984 canvas | never closer than 36 px to the card edge |

Use the extra 176 px of panel height for **foreground** (more crowd rows, bigger audience heads, more ground),
not for more sky: keep horizons at the same absolute distance from the panel top as in the reference
(see 5.1). Render check: `docs/style_evidence/fonttest.png` (frame 0) and `fonttest_punch.png` (frame 45).

---

## 2. Palette by role

13 colours total. Measured from flat-fill pixels (7x7 variance < 12) of 9 scenes, k-means K=24, then
merged. Swatches + per-scene area shares: `palette_swatches.png`.

| role | token (proposal) | hex | where it is used |
|---|---|---|---|
| page bg, panel sky | `bg`, `sky` | `#A6CABB` | page, sky block, distant glass faces |
| ground, glass, light facades | `mintPale` | `#EBF6E5` | ground planes, glass panes, glass-tower cells, pale buildings |
| mid teal-green | `sage` | `#6D988B` | glass, tree crowns, coats, cladding, balcony glass |
| teal | `teal` | `#547977` | doors, noticeboard frame, coats, backpacks, fascia shade |
| darkest fill | `tealDark` | `#3E605F` | shade step, door kick panels, ATM body, dusk sky, shop fascia |
| light wall | `cream` | `#F3E0CB` | walls, light coats |
| mid wall / skin | `sand` | `#D9BBA1` | walls, necks/hands, coats, light hair, dog-ears, door reveals |
| dark wall / shade | `tan` = `clay` | `#BA977E` | walls in shadow, dark facades, hair |
| ochre | `brown` = `ochre` | `#88652F` | hair, jackets, tree trunks, sign posts, placard sticks |
| peach accent | `peach` = `highlight` | `#F6B892` | caption box, placards, screens, awnings, shop door, coins |
| orange | `sun` | `#EC6B2E` | sun, cat, ONE hero prop per scene |
| ink | `ink` | `#2B1B0A` | every line, caption text |
| white | `card`, `white` | `#FFFFFF` | card, paper, signs, line-art (unfilled) people, glare |

Not in the reference (proposal aliases them): any grey, any olive/khaki, a second peach/salmon, any
blue, any pure black, any gradient. The mascot colourway (periwinkle `#8D90CC`, character stream) is the
single deliberate off-palette colour: keep it on the mascot only.

**Area share inside the panel (%), per scene** (nearest-palette assignment of every pixel):

| scene | dominant | ... | orange | ink |
|---|---|---|---|---|
| street crowd (f_5.5) | sky 24, sand 13, sage 9, cream 9, mintPale 8, teal 8 | ochre 4, clay 4, tealDark 4, peach 2, white 2 | 4 | 10 |
| noticeboard (f_12.0) | cream 35, white 14, mintPale 11, sky 9, teal 8 | sage 5, sand 5, tealDark 3 | 3 | 6 |
| skyline (f_15.4) | mintPale 38, sky 19, cream 10, white 6 | sand 5, sage 4, teal 3, tealDark 2, ochre 2 | 3 | 6 |
| ATM wall (21-23 s) | clay 29, tealDark 11, sky 10, sand 10, sage 9 | white 8, teal 6, peach 6, ochre 2 | 4 | 7 |
| dusk wall (24.5 s) | sand 28, tealDark 17, clay 16, teal 13, peach 11 | sage 8 | 2 | 4 |
| close-up board (28 s) | sage 40, clay 36, tealDark 12 | teal 1, ochre 1, sand 1 | 3 | 5 |

Rules that fall out of the numbers:
- Every scene is **one big light field + one or two mid fields** (60-75% of the panel), the rest is detail.
- **Orange stays at 2-4% of the panel**: the sun alone is 2.7%; the cat ~0.6%; one hero prop
  (placard 98x74, stamp disc 72, receipt strip 88x45) at most ~1%. Never orange on buildings or clothes
  (one orange coat in a crowd of ~300 is the maximum).
- Ink covers 4-10% of the panel (dense street 10%, simple wall 4%).
- Warm vs cool alternate between scenes (mint/cream day street -> clay/teal dusk). The **same 13 colours**
  are re-weighted, never extended.
- Light-to-dark steps used for shading are fixed pairs: cream -> sand -> clay; mintPale -> sage -> teal -> tealDark.

---

## 3. Ink (linework)

Evidence: `noticeboard_wall_bricks.png`, `door_double_teal.png`, `skyline_shopfronts.png`,
`street_depth_wires_birds_crane.png`, `bikes_bollards_lineart.png`.

| property | value |
|---|---|
| colour | `#2B1B0A` (core median rgb 43,27,10; identical for art and captions). Never black, never coloured lines. |
| default weight (`stroke.ink`) | **3.4 px** (cross-section coverage 3.3-3.7 px on ledges, kerbs, frames) |
| bold (`stroke.inkBold`) | **4.8 px**: foreground people, main kerb, top ledge, board frame (measured 4.5-5.2) |
| thin (`stroke.inkThin`) | **2.2 px**: distant buildings, small windows, bikes, crane lattice (DT median 2.0-2.5) |
| hair (`stroke.inkHair`) | **1.6 px**: glass glints, paper text lines, cables, hatching |
| weight by depth | foreground 4.5-5, mid 3-3.5, far 2-2.2. Never thicker than 5.2, never thinner than 1.5. |
| caps / joins | round caps, round joins. Ends **taper**: on lines > 150 px the last 8-10% thins to ~45% width (ledge: 3.5 mid, 1.5-2.3 at the ends). |
| straightness | ruler-straight but **off-axis by 0.3-1 deg** (a 880 px ledge drifts 10 px); slight bow allowed (<= 0.5% of length). Verticals are truer than horizontals. |
| corner overshoot | lines cross at corners and continue: small details 3-8 px; windows, doors, frames 6-15 px; structural lines (ledges, cornices, kerbs, ground lines, roof lines) run **30-62 px past the panel edge** into the white card. |
| long-line breaks | lines > 400 px are made of 2-4 segments with 6-16 px gaps (ledge in f_9.0 broken at x 380, 520, 780). |
| doubled strokes | cornices / ledges = 2-3 parallel lines 14-17 px apart (the gap often holds a clay band fill); frames = outer + inner line 15-20 px apart; occasional re-stroke: a second line 3-8 px off the first, 1-2 deg off-parallel, over part of the length. |
| unclosed contours | 20-40% of a shape's perimeter has no ink. Leave out: the side touching the panel edge, the bottom of anything cut by the frame, the top of the cat's head between the ears, one side of most windows (the right or bottom), people's torso bottoms. The fill alone defines the missing edge. |
| texture strokes | short, sparse, purposeful: brick hints (L, T, -, ⌐ marks 18-30 px, 4-8 per wall, 2.5 px), leaf "smile" arcs (3-5 per crown), cat stripes (3 arcs), glass glints (pairs of diagonals), ground specks (dots/dashes 3-10 px). Never hatching fields, never cross-hatching. |
| what is ink-only | wires, crane, bikes, bollard poles, antennas, scooter, window mullions, rails, overshoot extensions, line-art people. |

States that must both read (they are shown on screen):
1. **Ink only** on white (opening / loop frame: `f_0.5.png`): all fills absent, people are white tombstones.
2. **Fills only**, no ink (start of "Saying no isn't easy", 21 s): flat colour blocks must already describe the scene.

---

## 4. Fills

Evidence: `misregistration_zoom.png`, `cat_sitting_side.png`, `trees_cat_ledge.png`, `balconies_left_facade.png`,
`flat_shadow_planes_dusk.png`.

- **Flat** single colours. No gradients, no soft shadows, no transparency stacking, no texture.
- **Clipped to the panel rectangle**: sky, walls, ground, buildings, trees are cut by a hard vertical/horizontal
  edge at the panel boundary while their ink keeps going (tree crown half-filled at x = 923 in f_5.5; left facade
  fills stop dead at x = 156). Exceptions that may carry fill outside the panel: the sun, the cat, foreground
  people (legs/shoulders overshoot the bottom by 20-47 px), flying props (price tag above the panel).
- **Misregistration**: each object's fill is the outline shape (often simplified) shifted **2-5 px** (typ. 3.5)
  relative to its ink. Direction varies per object; about two thirds go right/down (cat: fill 6 px inside the left
  line, tucked under the right line, 5-6 px below the top line; jacket: fill pokes 5-7 px past the right line), the
  rest left or up (sage coat, backpacks, paper). The visible result: a 2-4 px sliver of background between ink and
  fill on one side, fill poking 2-5 px past the ink on the other. Keep one offset per object, not per edge.
  Proposed tokens: `misreg {dx: 1.5, dy: 1, jitter: 3}`.
- **Partial fills**: window panes, glass and display cases are often only 40-70% filled (a block of colour in
  one corner, the rest white or the wall colour); product blocks in a shop window are inset 3-5 px from their
  mullions with 2 px corner radius.
- **Fill-only (no ink)**: sky, ground, shade planes, distant crowd, mid-distance facades, far windows, door kick
  panels, balcony glass, the crowd's heads/hair, the sun.
- **Ink + fill**: everything in the foreground and the "actors": front-row people, cat, trees, doors,
  noticeboard, signs, papers, placards near the viewer, machines.
- **Shading**: done only with a flat polygon one palette step darker, no outline: the side wall of a recess
  (clay band left of the door, 18 px), a vertical shade plane on half a wall (dusk scene: clay left 30% /
  sand right), a diagonal shade wedge on the ground (two-tone teal ground split by a 60-deg diagonal), the
  under-side of balcony slabs (sand under cream). Light reads as coming from the right: shade planes sit on the
  left part of walls and on undersides.
- **Glass**: pane fill (mintPale on light frames, sage on teal doors) + glint = two parallel hairline diagonals
  at 60-70 deg, lengths ~0.35 and ~0.25 of the pane height, 8-10 px apart, upper-left; optional single short
  one lower-right. White highlight line inside metal handles.

---

## 5. Composition

Evidence: `street_depth_wires_birds_crane.png`, `skyline_full_board.png`, `flat_shadow_planes_dusk.png`,
`closeup_board_people.png`.

### 5.1 Camera and perspective

| scene type | construction | horizon / ground (fraction of panel height from top) | in our 944 px panel |
|---|---|---|---|
| street (wide) | 1-point perspective, VP at (0.68 w, 0.38 h) of the panel, i.e. off-centre to the right; facades on both sides, crowd fills the road | eye level 0.38 | VP at panel (522, 292) |
| skyline / plaza | frontal elevation, no convergence; 5 buildings flush side by side, each 0.20 w (147-155 px) | ground line 0.60 | ~ y 585 from panel top (+ extra ground below) |
| wall + object (noticeboard, ATM) | frontal elevation, wall fills the panel, cornice band at 0.10, ground line at 0.88-0.90 | 0.88 | ground ~ 810-830 |
| close-up | object fills 0.05-0.80 of the panel, audience heads along the bottom edge, no horizon | - | - |

Perspective is loose: converging lines miss the VP by up to 10-20 px; verticals stay vertical everywhere
(no 3-point perspective).

### 5.2 Layering (back to front)
1. panel sky fill (flat) 2. distant buildings: fill-only blocks + thin ink 3. mid buildings: fills + ink
4. ground plane fill 5. mid people / far crowd (fill-only) 6. trees, street furniture (ink + fill)
7. foreground people, props, cat (bold ink + fill, may break the panel edge) 8. ink overshoot lines
9. **the sun on top of everything** (fills and ink both pass behind it: `sun_layering_atm.png`), except when it
deliberately "sets" behind a wall line (`sun_setting_behind_wall.png`).

### 5.3 Density and negative space
- Wide shots are dense: street = 300+ figures, 2 facades with ~60 windows, 4 trees, 6 bikes, wires, crane, tram.
  Simple shots (noticeboard, close-up) have 1 object + a row of 5-8 people; the density moves into the crowd.
- Keep **one quiet field** in every frame: the sky block (18-25%) or a flat wall (30-40%) or the ground (25-40%).
- The white card margin is negative space: only ink overshoot (and the sun/actors) may enter it.
- Foreground "audience": in 6 of 8 scenes a row of 3-8 people seen from behind sits on the bottom edge,
  looking into the scene. Heads at 0.80-0.95 of panel height; bodies are cut by (or overshoot) the panel bottom.

### 5.4 What overshoots the panel, measured
| side | ink overshoot (px) | coloured overshoot |
|---|---|---|
| left / right | 53-61 (structural lines, crane jib, bike, tree crown, kerb) | none except actors |
| top | 20-96 (crane, antenna, poles, a flying price tag) | sun: disc top 24-53 above the edge |
| bottom | 0-47 (people, kerb lines) | front-row people's legs/shoulders 20-47 |

### 5.5 Sun and cat placement
- Sun: in the upper 0.06 of the panel, overlapping its top edge, horizontally anywhere 0.33-0.78 of the card
  width; usually above the "gap" (street vanishing point, between buildings, above the noticeboard). Absent in
  close-ups and in the ink-only loop frame.
- Cat: perched on something (ledge, board top, ground in front of the plaza) in the **right or middle third**,
  always small, always watching the scene from behind.

---

## 6. People

Evidence: `crowd_back_views.png`, `people_small_and_large.png`, `lineart_people_row.png`,
`crowd_far_perspective.png`, `closeup_board_people.png`, `balconies_left_facade.png`.

**Always back view** (or rear 3/4). No faces, no hands except a raised arm with a phone. Characters are
built from 4 primitives: head circle, neck block, "tombstone" torso (rounded-top rectangle), leg rectangles.

| tier | where | head dia | torso | legs | ink | proportions |
|---|---|---|---|---|---|---|
| A. audience (large) | bottom edge, 3-8 across | 48-56 px | w 2.0 x head (100-110), top corners r = 0.45 w, runs off the bottom | not shown | bold 4.5-5 on shoulders/sides, top 60-70% of head outline; torso bottom open | shoulders nearly touch (spacing 1.9-2.1 x head) |
| B. marchers (front crowd) | 0.65-0.95 panel height | 32-38 | coat 65 x 95, rounded top r 18 | 2 rects 15 x 50, gap 6; shoes 15 x 10 lighter block | coat sides + shoulders + legs outlined (3.4); head fill only | ~5 heads tall |
| C. walkers (mid) | plaza mid-ground | 16-18 | 30 x 45 + backpack | 2 rects 8 x 45 | thin 2.2 on body sides and legs | ~6.5 heads tall (110 px) |
| D. far crowd | toward the VP | 5-14 | blob 1.8 x head wide | none | **none** | grid rows, scale 0.85 per row |
| E. balcony / window people | in facades | 12-16 | small rounded rect | none | none | tiny accents, peach/white/sand |

Head / hair: the head circle IS the hair colour (back view). Hair colours (blob count, front rows of f_5.5,
approximate): clay ~25%, ochre ~20%, sand ~20%, ink-dark ~20%, teal/sage hats ~15%; far-crowd heads take any
palette colour (sage, clay, ochre, cream, sand most often). Neck: sand block 0.45 x head wide, ~0.25 x head visible.

Variants for tier A/B (mix 1 accessory per person, never 2 of the same next to each other):
- headphones: band = ink arc over the head (stroke 4), ear cups = sand rounded rects 0.3 x 0.45 head at both sides
- bun: circle 0.38 x head on top, same hair fill + ink
- long hair: hair fill continues as a rounded rect to the shoulders, 2-3 vertical ink strands
- beanie: teal/sage dome with 2 horizontal ink bands + pompom circle 0.3 x head
- cap: hair circle + a short brim arc at the back
- backpack: rounded rect 0.55 x torso w, 0.7 x torso h, r 10, in cream/sand/teal, top handle loop, horizontal flap line, short centre tick
- scarf / collar: teal or sage band at the neck + hanging end; or a V-neck ink chevron
- messenger strap: double diagonal line across the back (2 lines 8 px apart)
- raised phone: arm = two parallel lines, phone = white rounded rect 0.35 x 0.6 head with ink outline

Clothing colours: coats/tops sand, clay, cream, sage, teal, ochre, peach (occasionally white); trousers teal,
tealDark, ochre, ink; shoes teal, peach, cream. Never orange (reserved). Adjacent people never share both
hair and coat colour.

Crowd in perspective (street): a road-wide grid of tier D/B figures in rows; per row toward the VP the scale is
x0.85, horizontal spacing ~ torso width (shoulders touching, heads 0.55 x spacing), row pitch ~1.1 x spacing,
each row overlaps the one behind by ~50%. Rows are slightly jittered (+-15% x, +-5% y). Placards (rect on an
ochre stick, 90-100 x 70-75 near the front; fills peach, orange (one), teal, sand, white) poke above the heads.
Sidewalk crowds are looser, standing/walking tier C figures.

In the ink-only state, people are white tombstones with full ink outlines (`lineart_people_row.png`).

---

## 7. Architecture vocabulary

Evidence: `skyline_shopfronts.png`, `shopfront_sign_awning.png`, `balconies_left_facade.png`,
`door_double_teal.png`, `noticeboard_wall_bricks.png`, `atm_machine.png`, `crane_wires_birds.png`, `tram.png`.

Scale (mid/skyline): building width 147-155 px, storey 60-75 px, door ~55 x 110, small walker 110 px tall.

- **Facades**: a flat fill block (cream / sand / clay / white / mintPale) + ink verticals at both sides + a roof
  line that overshoots 8-15 px each side. Mix 4-5 types per row: Haussmann (cream/clay, mansard roof in teal
  with 2 dormers, tall windows 1:2.4), white modern block with balconies, brown brick with 2x2-paned windows,
  low shop pavilion with solar panels (teal parallelograms) and a clock, glass tower.
- **Windows**: rect with ink on 2-4 sides (often missing the right or bottom), 1 vertical or a cross mullion,
  sill = horizontal line overshooting 6-12 px each side. Pane fills: tealDark / teal / sage glass, sand or clay
  "curtain" blocks, white; 40-70% partial fills. Far windows: fill-only dark rects or bare ink brackets ⌐ ¬.
  Sizes: 2x2 window 48 x 43 (skyline), tall French 40 x 62-100, glass-tower cell 38 x 38.
- **Balconies**: slab = 2 lines 6-10 px apart that overshoot the facade by 15-40 px; glass rail = sage/teal fill
  with vertical ink dividers every 30-50 px; a shrub (scalloped blob) or a person behind some.
- **Glass tower**: ink grid; cells randomly ~35% filled sage/teal, rest mintPale/white; side face darker.
- **Shopfront**: fascia band 30-34 px tealDark with a white pictogram (cart) and two white dashes; display window
  ~100 x 130 with white shelves (each with a short ink dash) and product blocks (sand/sage/peach/mintPale);
  double door sage with two dot handles; awning = flat teal slab 12 px + two diagonal ink legs; peach door
  with vertical slat lines; round clock (white, ink, two hands).
- **Signage**: hanging square sign (white fill, ink outline, cart icon, two short bracket lines to the wall);
  pharmacy cross (sage/teal plus, fill-only); price tag (white, hole, euro sign, peach coin circles with ink arcs).
- **Doors**: double door teal `#547977`, glass panes sage over ~10-58% of the height, kick panels tealDark over ~70-92%
  (fill-only, r 3), long bar handles (thin ink rounded rects with a white inner line), frame reveal = clay/sand
  band 18 px on the left and top (fill-only), outer frame double line.
- **Noticeboard** (recurring anchor): teal frame ~12-14 px, two mintPale glass panes with glints, 4 hinge ticks,
  two teal legs with small feet; papers white with ink outline, sand dog-ear triangle, ink pin dot (5 px),
  one bold heading bar (5 px, 30% width) + 3-5 hairline body lines (60-100% width).
- **Walls**: cream/sand; cornice at the top = 2-3 long parallel lines overshooting 60 px both sides with a clay
  band between; brick hints only (4-8 marks); a round wall lamp (sand disc + inner arc); a doorbell panel
  (white rounded rect, ink, 3 lines + dot).
- **Ground / street**: mintPale or sage/teal plane; kerb = 2-3 long lines with gaps; bollards (white posts with
  ink sides, or thin poles with a ring top); ground specks (3-10 px dots/dashes) in teal scenes.
- **Machines (ATM)**: tealDark body, peach screen with an ink drawing, sand keypad with dash rows, contactless
  icon, slot, white receipt with zigzag bottom and an orange tear strip (the hero orange).
- **Cranes**: ink-only lattice mast (2 verticals 14-18 px apart + zigzag), long jib + counter-jib with a clay
  counterweight box, cable with a hook drawn as "V"; stands partly above the panel (overshoot 50-96 px).
- **Wires with birds**: a nearly straight wire across the street (barely sagging, thin 2.2 px), 3 pigeons 28 x 14 (white/sand fill,
  ink outline, dot eye), 16-25 px apart.
- **Vehicles**: tram front (mintPale windows, teal body, peach lamps); bikes ink-only (wheels r 22-30, frame
  triangle, basket rect), parked in perspective rows; e-scooter ink-only (wheels r 10).

---

## 8. Nature

- **Trees**: scalloped crown (8-12 bumps, bump radius 0.12-0.18 x crown width), crown 80-110 px wide (mid),
  sage or teal fill offset 3-5 px, ink outline ~80% closed, 3-5 "smile" arcs inside (leaf texture, 12-20 px,
  2.5 px); trunk = ochre fill rect 8-10 px wide between two ink lines; tree pit = ink ellipse at the base.
  Two-tone groups: alternate sage and teal crowns, overlap 20-30%.
- **Shrubs / potted plants**: small scalloped blob (5-7 bumps) in teal + ochre pot.
- **Clouds**: none in the reference; the sky is always flat. If a scene needs one: white fill, tree-crown scallop
  language (3 bumps on top, flat bottom), ink on the top 60% only, no smile arcs. Use sparingly.
- **Birds**: see wires. No flying birds in the reference.

---

## 9. Mascot design language (reference cat -> our original elephant)

Evidence: `cat_sitting_side.png`, `cat_on_board_back.png`, `trees_cat_ledge.png`, `closeup_board_people.png`.

| property | reference cat | translate to the elephant |
|---|---|---|
| size | 85-92 px tall in wide/mid shots (0.11-0.12 x panel width, ~0.6 x sun diameter, ~1.7 x an audience head); 170 px body (+ tail 350) in close-ups | 85-95 px tall in wide shots, x2 in close-ups |
| view | back view sitting; rear 3/4 on the ground; never a face in wide shots | back / rear 3/4 by default, profile only for action |
| silhouette | egg/pear body widening to the base, head ~0.45 x body width, two sharp triangular ears open at the base, tail exits right and ends in an upturned hook | egg body, big ear flaps as the head's two dominant shapes, trunk as the "tail" gesture |
| ink | 3.4-4 px, outline ~75% closed: open between the ears, open at the bottom, tail tip open | same weight; leave the top of the head and the base open |
| fill | flat orange `#EC6B2E`, offset ~3 px right / 2 px down (left sliver of background, fill tucked under the right line) | flat single body colour, same offset rule |
| marks | 3 stacked curved stripes on the back (downward-bowed arcs, lengths ~20/24/19 px, middle longest, 2.5-3 px, ~10 px apart) + 2 short haunch arcs at the base | 3 curved wrinkle arcs on the back or trunk, 2 knee/haunch arcs |
| poses | sitting on a ledge watching; sitting on top of the board with the tail hanging over the front (close-up gag); sitting on the ground watching the plaza | perched / sitting and watching; one hanging-trunk gag |
| colour role | the only orange besides the sun | its colour must not be reused on anything else in the scene |

---

## 10. Captions

Evidence: `font_compare.png` (24 candidates + overlay proof), `fonttest.png`, `fonttest_punch.png`.

**Font: Patrick Hand Regular (400)**, file `public/fonts/CaptionHand.woff2` (latin subset, OFL,
`public/fonts/CaptionHand-LICENSE.txt`). This is not a lookalike: rendered at 82 px and centred on x = 540
it overlays the reference glyph-for-glyph (8 lines: width error 0.1%, sd 0.1%; Chromium render ink IoU 0.88,
highlight box within 1 px). Its signature details are the reference's: single-storey a and g, the looped "ll"
ligature (all, million, normally), straight tick apostrophe, curled t and l feet, built-in baseline wobble.
Digits are clear at 82 px; note the European crossed 7.

| property | value |
|---|---|
| size | 82 px = 0.0854 x card width (x-height 38, cap 55, ascender 60, descender 26) |
| line gap | 96 px baseline to baseline (line-height 1.17) |
| colour | ink `#2B1B0A` |
| letter-spacing | 0; kerning on; ligatures ON (the "ll" loop depends on it) |
| alignment | each line centred on the card centre by advance width |
| lines | max 2; max width 780 px (~27 characters) in our layout |
| position | baselines card-local 1208 / 1304; a single line waiting for its second line sits on 1208 |
| punch line | one-line emphasis caption at 95 px (x1.16), centred vertically (baseline 1265) |
| hook / loop caption | first and last caption at 87 px (x1.06), line gap 103 |

**Highlight box** (fitted on 8 reference boxes, identical in all):
- colour `#F6B892`, flat, no outline, corner radius 3 px (0.035 em), drawn **behind** the text; text stays ink.
- x: from the word's advance start - 0.02 em (-1.6 px) to its advance end + 0.11 em (+9 px).
- y: baseline - 0.671 em (55 px, = cap height) to baseline + 0.305 em (25 px, = descender): height 80 px.
- trailing punctuation is outside the box ("Greece." box ends 9 px after the e); a multi-word phrase gets one
  continuous box including spaces ("Half a million").
- Motion as measured (for the motion stream): wipes left -> right over 0.25 s with strong ease-out (87% after
  0.1 s), timed with the spoken word, landing as line 2 settles.

Caption motion observed at 30 fps (for the motion stream): line 2 rises from +40 px (clipped by the card
bottom) to its baseline in 0.37 s, ease-out; on a new caption the old block exits upward fast (~45 px/frame,
gone in 0.1 s, clipped ~30 px under the panel) while the new line rises from +112 px over ~0.4 s.

---

## 11. Do / Don't: the 10 rules that make this style

1. **DO clip fills to the panel and let ink run out of it.** Background fills stop on a hard panel edge; lines
   continue 30-60 px into the white card. DON'T let walls, sky or ground colour leak outside the panel.
2. **DO offset every fill 2-5 px from its outline** (one offset per object, mixed directions). DON'T register
   fills exactly or use a stroke+fill on one SVG element.
3. **DO overshoot corners and break long lines.** 3-15 px at corners, 30-62 px for structural lines, 2-4 gaps
   per long line, 0.3-1 deg off-axis. DON'T draw closed, perfectly joined rectangles.
4. **DO leave 20-40% of contours open**; the fill finishes the shape. DON'T outline everything, and never
   outline shadows, sky, ground or distant things.
5. **DO stay inside the 13 colours, flat.** One big light field + one or two mid fields; shade = the next
   darker palette step as a flat polygon. DON'T add gradients, textures, greys, blacks, blues or new tints.
6. **DO ration orange to 2-4% of the panel**: sun + mascot + at most one hero prop. DON'T use it on
   buildings, clothes or decoration.
7. **DO use the ink weight ladder by depth** (4.8 front, 3.4 mid, 2.2 far, 1.6 hair), round caps, tapered
   ends, colour `#2B1B0A`. DON'T use one uniform weight or pure black.
8. **DO draw people from behind**: round head (= hair colour), neck block, tombstone torso, one accessory; a
   back-view audience along the bottom edge looking into the scene. DON'T draw faces, hands or detailed anatomy.
9. **DO keep the sun a perfect flat disc (r 72) overlapping the panel's top edge, on top of all other layers.**
   DON'T outline it, shade it, or give it rays.
10. **DO make every scene readable in ink-only and in fills-only state**, and keep one quiet field (sky, wall or
    ground) in every frame. DON'T fill the panel edge-to-edge with detail.

Also: captions in Patrick Hand 82 px with ligatures on, the peach box behind the word; the card stays flat
white with square corners (no grain, no shadow in the reference).

---

## 12. Recipe: a row of shopfronts with people (proves the rules)

Panel = card-local x 96..864, y 96..1040. Sun at (627, 153), r 72.
1. Sky fill `sky` over the whole panel. Ground fill `mintPale` from y 681 (0.62 of 944) to 1040. Both clipped.
2. Ground line: ink 3.4, from x 38 to 922 (overshoot 58/58), drifting 4 px; two kerb lines 16 and 34 px lower,
   each split into 2-3 segments, 2.2 px.
3. Five buildings flush, widths 150-156 (x 96 | 250 | 404 | 558 | 712 | 864), tops at y 230-380 (heights
   300-450): fills cream, white, clay, sand, mintPale-glass; ink verticals at the joints, roof lines
   overshooting 8-15 px; one mansard (teal fill-only roof, 2 inked dormers).
4. Windows 48 x 43 (2x2 panes) or 40 x 62 tall, rows every 60-75 px, 2-4 inked sides, 50% partial fills,
   sills overshooting 6-12 px.
5. Ground floor: per shop a 32 px tealDark fascia with a white pictogram, a 100 x 130 display window with white
   shelves + coloured product blocks, a 55 x 110 sage double door; one peach awning door; one clock.
6. Mid-ground: 3-4 walkers (110 px tall, heads 17) at y 700-790 with backpacks; a bike (ink-only, r 24
   wheels) and a tree (crown 95 px, sage, 4 smile arcs) at the right, crown overshooting the panel at x 864
   (fill clipped, ink continues).
7. Foreground: an audience of 3 (heads 52, torsos 104 wide, coat colours ochre / sand / sage) at x 560-860,
   heads at y 930, torsos overshooting the panel bottom by ~30 px.
8. Cat/elephant: 90 px tall, sitting at x 200-300, y 930-1020, back view.
9. Crane top-left: ink-only, mast at x 250, jib from x 40 to 330 at y 165, 60 px above the panel top.
10. Check: orange 2-4%, ink 6-8%, sky + ground >= 55%, every fill offset 2-5 px, no fill outside the panel
    except sun/people/mascot.

---

## 13. Evidence index (`docs/style_evidence/`)

| file | shows |
|---|---|
| `font_compare.png` | reference captions 1:1, overlay proof (Patrick Hand vs reference), 24 candidates at matched x-height |
| `fonttest.png`, `fonttest_punch.png` | Remotion render of FontTest: proposed card/panel/sun/caption geometry + safe zone, highlight, digits |
| `geometry_ref_vs_9x16.png` | reference geometry vs proposed 9:16 layout |
| `palette_swatches.png` | 13 colours by role + per-scene area shares |
| `misregistration_zoom.png` | 8 zoomed tiles of fill offsets (paper, jackets, backpacks, shop window, doorbell) |
| `cat_sitting_side.png`, `cat_on_board_back.png` | mascot construction, open contour, stripes, offset fill |
| `crowd_back_views.png`, `crowd_far_perspective.png` | tier B marchers, tier D far crowd, placards |
| `people_small_and_large.png`, `lineart_people_row.png`, `closeup_board_people.png` | tiers A/C, accessories, ink-only people |
| `balconies_left_facade.png`, `skyline_shopfronts.png`, `shopfront_sign_awning.png`, `skyline_full_board.png` | facades, windows, balconies, shops |
| `door_double_teal.png`, `noticeboard_wall_bricks.png`, `atm_machine.png` | doors, noticeboard, papers, brick marks, machine |
| `street_depth_wires_birds_crane.png`, `crane_wires_birds.png`, `tram.png`, `bikes_bollards_lineart.png`, `trees_cat_ledge.png` | perspective street, wires + birds, crane, tram, bikes, trees, panel clipping of fills |
| `flat_shadow_planes_dusk.png`, `sun_layering_atm.png`, `sun_setting_behind_wall.png` | flat shade planes, sun z-order |

Method scripts were run from the session scratchpad (k-means on flat pixels, coverage-based line widths,
Hough vanishing point, connected-component sizing, font width/overlay fitting); numbers above are their output.
