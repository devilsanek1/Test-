# Video 2 ("One Small Window"): STYLE, the look every lane builds to

The definitive style direction of the finished film, from every style source, checked against the owner's reference images and frames of reference 1
and v1 (2026-10-27). Read it before touching a pixel, then TREATMENT.md for your shots. It adds no rule of its own: each rule cites its source;
[measured] = measured for this page. Precedence: the owner's words [PB, N2] > [TR] > [K2] / [K1] > the look docs > v1 specs; the conflicts it settles
are at the end. Tags (in `video/docs/` unless a path is given): PB `OWNER_PLAYBOOK` · N2 `v2/OWNER_NOTES` · CB `CREATIVE_BRIEF` · TR `v2/TREATMENT` ·
HD / TD / BM `v2/direction/` house_digest, teardown, beat_map · CG / CS / LD / PAL `look/` CINEMATIC_GUIDE, COZY_AND_SCALE, LIFE_AND_DENSITY, PALETTE
· ED `EDGES` · SB `style_bible` · MS `motion_spec` · MAS `mascot` · K1 `src/v2r/palette.ts` · K2 `src/v2r/world/map.ts` · BUILD `v2/BUILD` · cast /
pip / canal / dc = `src/v2r/kit/*/README.md` · CMN / L1 / L4 / L5 = `v2/lanes/` COMMON, handover_L1 (critic round 0), _L4, _L5.

## 1. The look in one paragraph, and the 10 non-negotiables
One London canal on one golden October evening, plus one trip through the sun to an April morning in Arlington [TR §2]: a full-bleed 9:16 world seen
level across water or down a towpath, drawn like reference 1 and v1 in a loose, tapered, warm-brown architectural line over flat, misregistered fills
in many light peach-cream, brick, sage and water tones under one flat mint sky holding the captions [TR §2, §5; HD §3]. Brick terraces, a canal wing
of brick, stone and glass, narrowboats, lamps, gasholders; small simple people from behind; a new periwinkle elephant in a mustard scarf [TR §2-3].
One small woman in a long teal coat is the only teal, one working sun the only orange [TR §2; TD §2]. Everything moves a little, always, every cut
carries motion, and one pull-back crane makes the world vast [TD §2; CG S5]. Calm, legible, warm, serious, never menacing or sickly [TR §2, §6; PB].
1. **New:** every set, figure, Pip, prop, life element and the music is made NEW for this film; engine primitives and QA tools only [PB; CMN; TR §9].
2. **One palette, fixed jobs:** "10 Canal Mint"; teal = HER only, orange = the sun only, plum = the ~5 % anchor; only the light changes [TR §2].
3. **One quiet field:** the flat mint sky y 0-600 holds the captions; nothing is ever drawn in y 317-556; the bottom third is never quiet [TR §5; K2].
4. **The house hand:** warm tapered ink by depth, 20-40 % of contours open, flat fills 2-5 px off; no gradient, glow, blur, opacity, fade [TR §2; SB].
5. **People small and simple like reference 1:** backs, round heads, no faces; near backs <= ~140 px wide; no big model or waist-up [PB; N2].
6. **Full and alive:** every PAUSED frame at 216 px reads as full as reference 1 and v1, and ambient life never stops [PB; LD §0; TR §9].
7. **Pip ("towpath Pip", drawn new) in every shot:** watches, leads the eye, reacts at most once, hops across every cut [TR §3].
8. **A travelling camera:** one move per shot, every cut carried, ONE big move (S5) whose scale feels GREAT, no zoom in a hold, 60 fps [TR §5-6; CG].
9. **Frame 0 is the scene being drawn:** bare ink, colour by 0.30 s (her coat last), voice at 0.12 s, the hook made physical; it loops [TR §4; PB].
10. **Literal, sourced, fair:** facts on real objects in real places, exact quotes, Google at equal weight, no war, gag or villain image [TR §8].

## 2. Palette "10 Canal Mint" (exact hex: TR §2 = K1 `CM`, checked by K1 `problems()`)
| role | hex (L* / C*) | may go on | NEVER on |
|---|---|---|---|
| sky = caption field | mint `#BCDCCF` (85 / 13) · high step `#CFE6DC` | the whole top y 0-600 in all four light states; a cloud's or April's high step | anything drawn in y 317-556; a gradient; a second sky colour |
| horizon bands | gold `#F6D9BC` · sunset `#F3C6A6` · dusk mint `#B3CDD2` | flat bands BELOW y 600 (World `horizon` >= 760, or a band rides up into the captions) | y 317-556; blends between bands |
| page (50-80 %) | stucco `#F4E4D2` · paving `#EFD8C2` · limestone `#EEE4D4` · glass `#CDE1DF` · paper `#FBF3E6` | walls, paving, stone, glass, board faces, frame 0's paper: MANY light fills | one empty slab; pure white (glints only, <= 5 % of one object) |
| mids | brick `#E3A88C` `#C9806A` `#A5604F` · sage `#AFC4A8` · stone shade `#C8C3D3` | facades, roofs, trees, boat cabins, stone in shade | a field big enough to read as a slab |
| cool (>= 10 % per frame) | water `#9DC6BF` `#7DAEA8` · unlit pane `#5E6F86` | the canal, the Potomac, cool shade, unlit glass | dark water right behind her (only ΔE 24 from the teal) |
| HERO | canal teal `#0B8577` (50 / 33) | HER only: her coat, her front door, her window frame; 5-15 % on her shots | boats, the public, boards, signs, Google, the Pentagon, Pip, any prop or dressing |
| ANCHOR | plum `#36223A` (17 / 19) | her dark office window, her hair, gunwale stripes, board stiles, near silhouettes; ~5 % (cap 8 %) | a whole hull; black; any big dark slab |
| POP (one) | sun orange `#EE6A2E` (61 / 74) | the sun disc only, 1-3 %: SUN0-2, the S3 and S8 low suns, the APRIL 2026 calendar disc | caption boxes, coats, signs, FOR LIFE, props, logos, Google, the Pentagon |
| support | box `#F6B892` · lamp `#F7CF86` `#FBE6C2` · ink `#2B1B0A` · line `#9A563C` · shade warm `#8C5E6B` / cool `#6F80A0` | box = the caption key box; lamp = lit windows, pools, bulbs (flat); line = wood, frames, posts | glow or halos (no bulb halo in any state) |
| confetti (< 1 % each, C* <= 45) | leaves `#D6A563` `#B8714F` · blossom `#F3C3CD` · coats `#5E6F86` `#D4A960` `#E6D3B5` `#6E4A5E` · hair `#3E2A3A` `#6B4A3A` `#9A5A3E` `#B9B6C4` `#D9B98A` | people and dressing: many hues in small patches | fields; the hero's or the pop's hue |
| ghosts | paper `#FBF6EE`, ink 2.2 px; heads G1 `#3E2A3A` → G2 `#7D7387` → G3 `#A9A5B5` → G4 `#CFCCD6` → G5-G6 `#ECEAF0` | S1's row (+ 3 bare ink outlines) and S8's three | any other figure |
| Pip | body `#9497D8` · shade `#7579C0` · inner ear, cheeks, soles `#F2C3CC` · scarf `#D4A960` | Pip only (body ΔE76 39-59 from every ground) | its hue on anything else |
- **Family DNA [PAL; HD §3; LD §2]:** page L* >= 75, C* <= 20, 50-80 % as many fills · ink L* <= 25 at >= 7:1 (11.3:1 on the mint) · ONE hero
  (C* >= 30, 5-15 %) · ONE tinted dark anchor (L* <= 40, ~5 %) instead of black · AT MOST one pop (C* >= 50, 1-3 %, "look here"); the jobs hold all
  film and dressing never takes the hero or the pop; Google and the Pentagon stay quiet stone and brick, no hero colour, glow or rim [TR §2, §8 V3].
- **Warm, never sickly [PB; TR §2; CS 3b.6]:** no beige, muddy tan, olive or grey (`problems()`: page C* >= 4.5; the rejected cut's beige frame 0 is
  the warning [TD §3]); greens sage, never a dull yellow-green (olive-khaki); warmth = peach creams, brick, red-brown wood, golden lamp pools.
- **Shadows are colour [CS 3b.6; K1]:** one sun, one light direction, lit : shade ~3:1; flat polygons (or a 2-step band with a 15-25 px lighter
  penumbra), dL* -25 to -40, chroma x0.6-0.7, hue to plum on warm walls and 10-15° to blue on cool ones (`shadeWarm`, `shadeCool`), <= 3-4 % W long;
  whites tinted, darks warm and rare (L* < 25 on <= 6 %); >= 10 % of the opposite temperature (water, panes, the dusk band) in every frame.
- **Light = story time [K1 `LIGHT`]:** one mint sky in every state; only the bands below y 600, lamps and season change, never a fill: **golden** S1,
  S2, the loop (gold, lamps off, October leaves) · **lowSun** S4 (gold, the sun low on far roofs) · **april** S5, S6 (high step over gold, blossom,
  the "APRIL 2026" sun) · **sunset** S3 (a flash-forward), S7, S8 (sunset band, dusk mint late, lamps on); S7 = S8's light [TR §8 V3].

## 3. Line, fill and texture
- **Ink** `#2B1B0A` only, never black or coloured lines [SB §3]: by depth front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px (`INK_PX`); figures >= 240 px
  tall 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6, smaller fill only; ghosts 2.2; Pip ~3.4 at any size; the farthest planes no ink [K1; cast; CG cue 5].
- **Loose architectural line [SB §3, §11; TR §2]:** round caps, tapered ends; corners overshoot 3-15 px, structural lines run on; long lines in 2-4
  segments (6-16 px gaps), 0.3-1° off-axis; 20-40 % of each contour open (an edge side, a window's right or bottom, torso bottoms). Lines only where
  they carry form: never round every silhouette or on shadows, sky, ground, water, far planes; wires, mullions, rails, bikes ink-only [PAL; HD §3].
- **Fills [SB §4]:** flat, misregistered 2-5 px from their line, one offset per object, mixed directions (Pip 3 right / 2 down); windows 40-70 %
  filled; shade = a flat polygon one step darker. Nothing soft, nothing fades: no gradient, glow, bloom, blur, haze, god rays, vignette or opacity;
  every change is a pop, scale, wipe, slide or draw-on [TR §2; MS §0]. Ink-only (frame 0, the loop) and fills-only states both read [SB §3; TR §4].
- **The ghosts are the ONE closed outline, on purpose:** outline = not yet real, as in reference 1 (its empty expected grid at 0.0 s, its outline
  crowds of bigger marches at 6.0-7.5 s) [TR §2; TD §1b]. **Texture OFF**; linework static per seed (no boil, shimmer or sway) [TR §2; CS 3b.7].
- **Paper edges OFF** (Film2R `edges: false`). If asked for at the final: `paint-subtle`, no paper in y 0-620 [K2] or by the band, sides from y >= 640
  [CS 3b.7], keep rects round her, Pip, ghosts, boards, signs [TR §2]; the stock preset has 14-25 px TOP paper [ED §0]: fix that first [PB].

## 4. People and Pip
- **Reference 1's grammar [SB §6; cast; PB]:** back view or rear 3/4; a round head that IS the hair colour; a neck; a tombstone torso; ONE accessory
  (bun, hood, beanie, cap, scarf, backpack, tote, headphones, phone); two leg bars; few lines; never a face, features, hands or anatomy.
- **Sizes [measured]:** reference 1's street front row: heads ~40 px, shoulders 70-80 px (4.0 s); its biggest backs (after a 1.9x push, 28.5 s) heads
  ~50 px, shoulders 110-120 px. So in EVERY shot a near head-back (head + shoulders cut by the frame bottom) is <= ~140 px wide at the shoulders, head
  ~60 px [PB; TR; K2]; K4 `NearBack` is 0.84 x hv x broad (0.93-1.1) wide, so hv <= ~150. It caps the figure, not its head (a 140 px head would
  re-allow the overridden 250-330 px busts). Not the bar: v1's near backs (240-330 px), LD §4's 500-1000 px side passers-by [PB].
- **Legibility floor [K2]:** a story change >= 80 px on its smallest side, its carrier >= 130 px, staffer >= 180 px seated, staff windows >= 90 x 90.
- **The public [TR §3; LD §4; cast]:** 10-40 per shot (walkers, joggers, cyclists, boaters, readers, neighbours in windows), half at rest, no two
  neighbours alike in hair and coat, NEVER teal or orange; mid 110-260 px, far 15-60 px fill only, window people 12-60 px; walks at 12 drawings/s.
- **Her [TR §3; cast]:** invented, never a likeness (V4); a 150-170 px full figure (100 px/m), never under 130 px while carrying a story change; a
  dark-plum round head with a low bun, a long teal coat, a cream tote (S1: a desk plant under her arm); back, rear 3/4 or walking profile; one model
  sheet at every size; never in Washington (V13). Her signature (plum head, bun, long coat, teal) is hers alone: no look-alike within ~300 px [L1].
- **The ghosts [TR §3; cast; L1]:** six whole outline copies of HER (coat cut and bun), paper fill, closed 2.2 px ink; age only by whole-head value
  G1-G6, a scarf and softer back from G4, a shorter stride G5-G6; nothing frail (stoop, stick, bag); in lockstep with a visible stride, each separate
  and whole, 170 -> 135 px down the bend, then three bare ink outlines 130 -> 120 px on "life"; the row goes on, never walks off; the world passes
  through them unaware; nothing counts years; it reads "the rest of her life", never death [brief_L1]. S8: three (G4-G6 cues), 140 -> 130 px.
- **Staff and others [TR §3, §8]:** five window silhouettes, a bench staffer (slate coat, auburn hair, lanyard, hood up), backs at S7's doors who
  never react: few, unnamed, faceless, no row or count (V11); the reporter (no BBC marks), S5's stranger (blank paper), S8's café owner: small backs.
- **Pip, drawn NEW [TR §3; pip; K2 `PIP`; HD §6]:** a pebble-round elephant, no neck; two big leaf ears that fold and flick; a one-curl trunk; a
  three-hair tuft; teddy-bear soles; a short knitted mustard scarf in the wind; ONE loose stroke per pose, 2-3 gaps; 86-120 px (44 in S5's end); in
  colour on frame 0's page; idle always (blink, ears, a fold-and-flick every 4-8 s, breath). In every shot it watches her or the story, turns its head
  BEFORE the voice names the next thing, reacts ONCE: S1 ears-cover on "life" · S2 head to the wall on "But" · S3 turns to her on "she" · S4 turns
  west on "heading" · S5 looks up at the calendar · S6 one ear flick on "veto" (no droop) · S7 NONE · S8 ears down on "can't". It hops across cuts
  (arcs at y >= 600); never in y 317-556, the rail (x > 780, y > 840) or over her; >= 200 px from the F11 clause; no gag near harm; never furniture.

## 5. Fullness and life
- **The bar [PB; LD §0; TR §9]:** every PAUSED frame at 216 px beside reference 1 and v1 reads as full and specific (approved bar: v3's G5b pilot,
  flat 18-24 %, detail 50-56 %). Fullness first: motion never fixes an empty still; fix the world (things, layers, lines), then people, then motion.

| profile | shots | the paused frame (`density.py`) | life |
|---|---|---|---|
| BUSY | S1, S2, S6 | flat <= 40 %, objects >= 105 / Mpx, detail >= 34 % | >= 3.5 medium events/s per shot (>= 5 per film), no gap > 1 s; a burst (10+ items in 4 frames) on a hero word every 6-10 s |
| DENSE-CALM | S3, S4, S7, S8 | flat <= 30 %, detail >= 33 %, objects >= 120 | `--cozy`: >= 2 movers always (aim 2-4), crossing sideways at real speeds, half the people at rest, nothing coming at us, one quiet ambient element |
| scale hold | S5 | the scale cues (§6) | 3 tiers of movers in the sky and by the figures, never 1 s still, nothing moving inside the city |
- **The checks [TR §9; LD §0]:** no hole > ~200 px outside the band and the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists
  it (never flat paving or bare water, nothing to read there); a wide holds 12+ props, 3-4 planes (S5: 6), people (still ones count), >= 2 things cut
  by a frame edge, 8+ specific dressing items; `deadframes` >= 8/10, no dead run > 0.40 s; ~25 events in the hook's first 3 s [TR §4].
- **What fills a frame [LD §0-3; TD §2.13; TR §6]:** layers (backs cut by the bottom, a subject in the middle band, a living background, edge
  furniture); many small things stacked by overlap; several colours per patch, varied repeats (4-5 building types, a different hat on each head); thin
  lines (never in y 317-556); lived-in infrastructure; signs of care (her plants, a neighbour watering, herb pots, the café's mugs).
- **Ambient life always on [PB; LD §6; CS 3b.4]:** BUSY: leaves, smoke or steam, clouds, a window switching every 0.6-1.5 s, walkers, Pip's idle, one
  small loop per shot; DENSE-CALM: the lane of movers + one quiet element (steam, a window lighting, a bird). The world reacts within 0.1-0.3 s (birds
  lift, heads turn); ambient motion is small, slow, low-contrast, off the subject's path, never over lettering ("Googlz") or in the band [HD §8].

## 6. Cinematography
| shot | vantage (dose) | profile | camera: ONE move each [TR §5] | in [BUILD §1] | light |
|---|---|---|---|---|---|
| S1 | RIVERSIDE, seated eye level on our steps, looking north | BUSY | pull-out 1.05 -> 1.00 ease-in about W 0-4.90; push-through dive into W 5.95-6.25 | the loop's un-build | golden |
| S2 | RIVERSIDE from the south towpath; the wing recedes right | BUSY | out of the dive (12 % ease-out) -> float 10 px/s -> 6 % story push on W2 8.50-12.80 | push-through | golden |
| S3 | RIVERSIDE across the water to her terrace | DENSE-CALM | match at W2 -> 5 % ease-back 13.00-13.60 -> float 8-12 px/s | window match-cut | sunset |
| S4 | RIVERSIDE truck from the water | DENSE-CALM | truck west at her pace (far roofs 0.3x) -> stop on "objected" -> 6 % push to SUN1 18.40-20.10 | cut on Pip's leap | low sun |
| S5 | a viewpoint terrace -> the pull-back crane | scale | hold -> ONE crane 21.30-23.40 -> hold to 24.00 | sun match-cut (SUN1) | April |
| S6 | eye level, straight-on, looking south | BUSY | lateral truck left 24.00-28.06, parallel to the board | cut on Pip's leap | April |
| S7 | eye level in Google's forecourt, looking north | DENSE-CALM | float 8-12 px/s + ONE 4 % push on B landing on "principles" | sun match-cut (SUN2) | sunset |
| S8 | LANE along her towpath, looking west | DENSE-CALM | float -> ONE truck left in the pause 34.99-35.60 -> float; the seam push about W | narrowboat wipe | sunset |
- **Frame 0 to 5 s, and the loop [TR §4; PB Hook; CG "The opening"; MS §8]:** f0 = S1 in bare warm ink on paper under the frame-0 words, the sun
  half-coloured and Pip already in colour (reference 1's sun and cat), never a title card; f1-f18 colour floods shape by shape from SUN0, her coat
  LAST (f18, 0.30 s); voice 0.12 s; the exit ding 0.45 s; one continuous shot to 5.95, only the 5 % pull-out. The expected thing (her window goes dark
  0.40, the doors slide 0.45-0.52, she walks out free into the gold, birds lift 1.40), then reality overtaking it from 2.00: a ghost per clause, then
  the row's one step and the extra outlines on "life" (4.98). S8 ends on her lit window at W (860, 700) and un-builds (fills shrink, ink retracts, the
  sky slab drops, ghosts and window last) onto S1's bare state, f0's first motions 3-4 frames before the seam; never a solid frame there.
- **The Arcane pull-back crane [PB; CG S5]:** the owner's favourite (S1E1's rooftop, #55 @109.46: the camera pulls back and rises till two small backs
  are tiny over a vast city; "it has pretty much everything"). Its SHAPE: one dolly back (never a zoom) + crane up + a ~70-80° arc round the figures
  on ONE ease, no other move or roll; the figures are the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0); suspense by progress: a bright slot in
  their eyeline, a mass hiding the landmark, a foreground wipe at peak speed, a light burst, the landmark landing as it slows, a hold >= 0.5 s. **V2S5
  [TR §6; K2; dc]:** held 20.55-21.30 under blossom; ONE `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40; a tree where the Pentagon will land; the
  lamppost wipe at peak speed (22.02-22.19; the tiny figures swap in); the Pentagon clears the tree ON "Pentagon" (22.43); the obelisk rises; hold to
  24.00 (a V of birds). Never menace: daylight, blossom, eye level or below, no flag, seal, guard, vehicle or glow [TR §8 V3].
- **Great scale [CG cues; PB]:** S5's end frame: nothing ends inside it (the Pentagon runs off the right); 6 planes, each 2.2-3x smaller than the next
  nearer; flat steps 0 / 12 / 22 / 40 / 65 % toward the sky, ink full, full, hairline, none, none (no haze gradient); the far band packed, detail
  peaking under the horizon; the drop below the camera; a huge-yet-far landmark (the obelisk ~4x true size) [dc]; a cloud bank >= 1 W behind it
  (tops >= y 610); huge = slow (clouds 0-6 px/s); tiny anchors with lines leading up; daylight only. At 216 px the world keeps going and is alive.
- **Cozy enclosure, held not shut [CS §1-3b; TR §6]:** her bank (S3, S4, S8) and the riverside holds (S1, S2, S7), ~31 s of ~35 outside S5-S6: brick,
  bank, boats and steps on 2-3 sides, ONE opening the subject faces (the canal, the lane), the institutions far outside; mass 35-70 % of the frame
  and >= 40 % of the perimeter; busy edges, a calm never-empty centre; a low lamp pool against the cool canal; rounded inside, hard outside. H:W at
  eye level: canyon >= 2:1 (sky <= 10 %) · cozy 1:1-1:1.5 (opening 15-30 %) · baseline 1:2 (sky ~30 %) · exposed >= 1:4 (scale only). Our sky (31 %)
  is the only void: every other opening is a bounded floor or water, its far end hidden. RIVERSIDE: level, verticals vertical, overlap stacked upward,
  a darker mass behind the people's lane so light figures pop [CS 3b.2]. The owner's lane photo (H:W 1:1, ~27 % sky, a tower closing the vista) = one
  tall side, one soft low side, a closed end (S8: her house), every built top at y >= 600 [K2]. Broken once: S5-S6, no cute props near the clause.
- **Camera rules [K2 `CAMSPEED`; CG; CS 3b.5]:** `camspeed` <= 7.5 px/f on long flat-ink moves, <= 15 on detailed layers; a flat wipe may run faster
  (S5's 41 px/f); holds lock or float (8-15 px/s, peak 25, turning back within ±12 px); NEVER a zoom in a hold (a 1-4 px/s push reads frozen); zooms
  are story moves (3-8 % on a line) or the big move; ease in, land over the last third; no roll, compound move or cut mid-move; at or below eye level.
- **Carried cuts [TD §2.11; BUILD §1; MS §7]:** v1 carried 8 of its 11 cuts; this film carries all 7 and the loop (push-through, window match, Pip's
  leap x2, sun match x2, a narrowboat wipe, the un-build); no fades, dissolves or card flips; transitions sit in voice pauses >= 0.3 s with the
  midpoint on the new line's first word (S6's cut on "any" is the one exception) [TR §5].
- **Shape, never speed; 60 fps [PB Motion; CMN; MS §3, §7; HD §5]:** copy a reference move's path, framing, reveal order and easing, then retime it
  (Arcane's 11.5 s -> our 2.1 s); 60 fps, frame = round(t x 60), by time, deterministic; drawn poses step at 12/s while the camera glides; strokes
  draw on in 0.10-0.20 s, fills 0.13-0.27 s after their line; pictures lead the voice ~0.1 s; marks and Pip's beats land ON the word (±0.05 s).

## 7. Captions and text in the world
- **Captions (engine-owned) [PB; TR §5; BUILD §3; HD §3]:** burned in, Patrick Hand 98 px on baselines 387 / 510, <= 2 lines, centred, ink on the
  mint; they POP in place (page, line, box), never a roll-in, page scroll or clipped letter (v1's 2.2 s roll failed); a change at least every 1.5 s;
  ONE peach box `#F6B892` per line, ~0.06-0.1 s before its word, only on TR §5's key words; in screen space, never on a camera layer or shrinking.
- **The band [K2 `UI`, `SKYLINE_EXCEPTIONS`]:** the block y 317-556 (x 95-945) sits on ONE flat field, the mint; NOTHING is drawn in y 317-556 (roof,
  cloud, bird, wire, Pip's hop, life); y 290-600 stays flat sky except the named exceptions (S1's roof planting to y 575, sun tops >= 575, S5's cloud
  bank and obelisk tops >= 610, S1's hero cloud y 120-280 and plane branch y 0-240); horizon bands and built tops start at y 600.
- **The frame-0 block [TR §4; BUILD §3]:** SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452, no quote marks) + "Source: BBC
  News, 21 Oct 2026" (20 px, 550), to 5.95 s and from 39.04; only "She [quit] Google." (52 px) under it, 0.12-1.88; then the box walks the block's own
  words (SAYS 2.06 · NO 3.14 · NO CRITICIZING 3.74 · FOR LIFE 4.77): "for life" on screen once, boxed once, always under SHE SAYS (V5).
- **Words live on real objects in real places [LD §7; TD §4; K2]:** straight-on, level, big, people or Pip looking; one type scale (K3 `WorldText`):
  keys >= 56 px read at 216 px, body 30-34 px and credits 18-20 px at full-screen phone width (~390 px); each source as small print ON its object; no
  headers, paragraphs, bullets or source bars. ONE StatementBoard face (an enamel A-board, plum stiles) for TOLD THE BBC (S2), GOOGLE SAYS (S7) and
  SHE SAYS (S8) at B (x 150-630, y 700-1220) and the deal board (S6); a fill-first pen reveal, ONE clack, ONE pen [TR §5, §7; L5].
- **Quotes exact [TR §8 V6, A7; BM §3]:** quote marks ONLY on exact words: "for fear of retaliation" (F5) · "any lawful government purpose" (F10) ·
  the full 24-word oversight clause, never cut (F11) · "AI principles" (F13) · "of any kind" (F14) · "human oversight" (F16) · "talking about facts is
  not criticising" (F18). Paraphrase stays unquoted (the F12 line); "for life" is never quoted; British spelling only inside her quote (criticize,
  AUTHORIZED elsewhere); "Google" hand-lettered, never its logo or colours; never "secret", "Department of War", "exclusive" (V17).
- **Fair boards [TR §8 V9, A5, A8, V14, Q9]:** the deal board shows the full clause at the cut (24.00) and pops its purpose line ON "any" (24.03),
  both readable to 28.06. Google's board and hers: the same face at B, light, type, pen build and sound, the same Pip pose at the bollard (700, 1205),
  ONE story move each before its key line, a lamp run on each key word; Google's beat gets its full 4.85 s, uninterrupted to 32.70, no irony, never
  lit on "facts", never in S8, never answering her clause. The headers TOLD THE BBC / GOOGLE SAYS / SHE SAYS tell account, statement and record apart.

## 8. The references (study them at 216 px beside your frames; never commit their frames [CMN])
| reference | file | study (s) | take | NOT |
|---|---|---|---|---|
| Reference 1 (France, 31.5 s, 1080x1350, 30 fps): THE style | `assets/ref/reference.mp4` (stills in `assets/ref/`: `f_0.5` ink-only, `f_5.5` street crowd, `f_12.0` noticeboard) | 0.0-0.6 bare ink, then colour floods in patches; 0.6-3.0 the expected grid fills, then overflows on "half a million" (2.0); 3.2-5.5 placards rise; 6.0-7.5 outline crowds; 8.0-13.7 the noticeboard (fill-first, the cat hops on 8.7); 14.0-16 a block builds; 26.9-28.2 push-in; 30.8-31.5 un-build to f0 | the line, flat misregistered fills, open contours; small simple backs (heads 40-55 px); outline = not yet real; the cat in every shot crossing every transition; the sun on top of everything; scenes that build to the words; the loop | the white polaroid card and its bottom captions; page-scroll captions; 3D card flips; a locked camera; its silence |
| v1 "php2shell" (55.4 s, 30 fps): the house model, the owner's favourite | `deliverables/v1/php2shell_final.mp4` | 0-4.7 plaza + power-button sun; 4.35-4.72 the dive into a lock; 8.45-9.95 a street builds from bare lines; 12.0-13.4 the sun as a pie; 19.8-22 golden-hour lane with string lights; 24.1-27 crane over a wall into the skyline; 37.2-39.4 pull-back to a hillside; 39.55 the tram wipe; 52.2-55.4 the rewind loop | one sunny world under the mint caption sky; a sun that works; Pip on a bollard hopping across cuts; signage with sources; a new event every few frames; 8 of 11 cuts carried; scale peaks held | its big near backs (240-330 px wide [measured]); the caption roll at 2.2 s; its coloured frame 0 (the bare-ink rule came later); 30 fps; its night beat (34.5-36); its sets, Pip drawing and palette |
| Reference 2 (town meeting, 44.1 s) | `assets/ref2/reference2.mp4` | 0-6 a walking dolly behind walkers and a corgi; 32-38 dusk -> night, string lights | crowds from behind; the animal low in frame looking where we should; one journey with no hard cut | its big near figures; dissolves; giant-object metaphors the facts don't support [CG] |
| The approved density bar | `deliverables/v3/v3_g5b_pilot.mp4` | O1 (the nook), S4 (the noticeboard street) | how full "full" is (flat 18-24 %, detail 50-56 %) | its winter content, palette and kit |
| Sense of enclosure (owner photo) | `docs/look/ref_sense_of_enclosure.jpg` | the whole frame | an eye-level lane: one tall side, one soft low side, a curving lane, a vista closed by a tower; H:W ~1:1, sky ~27 % | its grey overcast and rain; photo realism; olive-grey stone; a wall cut by the top (our tops stay >= y 600) |
| Palette references (5 editorial illustrations) | `docs/look/palette_refs/1-5.webp` + `swatches.png` | the swatch bars | COLOUR only: a warm off-white page 51-82 %, one saturated hero 4-10 %, a deep aubergine anchor ~5 % (refs 3, 5), tiny orange pops 1-3 %, soft secondaries; lines only inside shapes | their big front-facing figures with faces (the rejected cut's "corporate flat" people); olive and khaki (refs 1, 4); ref 5's pink gradient; the halftone |
| Texture reference | `docs/look/texture_refs/autumn_walk_detail.png` | the crop | thin tapered dark lines only in key places; no outline round silhouettes | the halftone dots (texture is off); olive |
| The animated sketchbook | `docs/look/ref_animated_sketchbook.png` | both pages | the loose architectural line (overshoots, open contours, the backbone visible): the spirit of frame 0's bare ink and the un-build | scribble hatching, grey wash, a monochrome finished look (it is the G3 animatic's look; this film has no sketch stage) [N2] |
| Arcane: ENVIRONMENT ONLY | words in CG (#55 @109.46 the S1E1 rooftop crane; #94 @238.0 rise-over; #24 @30.8; #60 @144.4; #61 @147.3; #108 @286.3); the owner's collage `assets/ref_cinematic/arcane_collage.jpg` | the measured shapes and cues in CG | camera shape and staging; small backs facing a vast view; the scale cues; a big flat sky with huge clouds | footage, frames or tracing; faces or people as subject; night, red skies, glow, beams, haze, god rays, painterly texture, airships, steampunk; source speed [CG "Not for us"] |
| Cozy references C2 / C3 (owner clips) | words only, `docs/look/COZY_AND_SCALE.md` 3b | the BALCONY and RIVERSIDE recipes | fullness first; rest next to motion; life passing sideways; the 2D float instead of a push | their louder saturation; olive darks |
| Anti-references | v3 G5 `deliverables/v3/v3_g5_blocking.mp4`; the rejected v2 cut in words only (TD §3-4; its archive is never mined [PB]) | TD §4's table | "way too empty" (a chart on a blank wall, 74 % flat); interiors, big faces, three palettes, stillness, props, text slides | anything from them |

## 9. The NEVER list (everything the owner rejected, and every fairness break)
- **The dropped first cut [TD §3-5; N2]:** rooms, desks and papers as the stage · big front-facing people with faces, posed busts, squiggle speech
  bubbles, a "FACTS" bubble · three palettes in 39 s, saturated washes · a locked camera, long holds · props instead of events (a badge, a
  highlighter, a scroll of years) · text as slides (four tiers on frame 0, a source bar on every shot, legal paragraphs, a bullet list) · her cat at
  home instead of Pip · hard cuts between unrelated sets · energy dying after 1 s · a beige frame 0 · anything from that production.
- **People [PB; N2]:** big character models, waist-up shots, close-up faces, front-facing posed figures, "corporate flat" stock people; near backs
  over ~140 px wide; big passers-by framing a shot; a likeness of Sofia Liguori (V4); a row, crowd or count of staff, empty desks (V11).
- **Reuse [PB; CMN]:** any v1 set, the v3 kit (bar `idle.ts`, `Pullback.tsx`), `lib/kit` people or placement, cine generators, the `lib/mascot`
  drawing, `src/v2/**`, `src/v3/film/kit/util.tsx`, a house music bed; tracing any frame.
- **Emptiness and stillness [PB; LD; TD DON'T 6]:** a big flat empty field; an object alone on a blank wall; a hole > ~200 px; a quiet bottom third; a
  still frame; a locked shot over ~1 s without inner events; 10+ s on one composition; motion on a void.
- **Colour [PB; TR §2; TD DON'T 4]:** a palette per scene or any sister palette; a violet or periwinkle world; saturated slabs; beige, muddy tan,
  olive, grey; pure black; grey shadows; teal on anyone but her; orange off the sun disc.
- **Rendering and camera [TR §2; MS §0; CG; CS 3b.5]:** gradients, glow, bloom, blur, haze, god rays, vignettes, opacity, fades, dissolves, card
  flips; an outline round every silhouette; ink on sky, shadow, ground or far planes; texture; boiling lines; top or band-side paper; a zoom in a
  hold; roll; a compound move; a cut mid-move; a second big or source-speed move; a high angle on one person; night-black frames, red skies.
- **Captions and text [PB; TR §5, §8]:** a roll-in, page scroll or clipped letter; anything in y 317-556; life crossing lettering; text below its
  floor; quote marks on paraphrase; "for life" quoted, stamped or without SHE SAYS (V5); a drawn contract with readable clauses (V6).
- **Fairness [BM §4; TR §8]:** war imagery: weapons, drones, missiles, explosions, soldiers, tanks, crosshairs, targets, radar over cities, blood,
  skulls, war footage (V1) · Google lettering, products, vans or signs in the clause frame; racks, carts, screens, deliveries; anything implying
  targeting (V2) · villains: a sinister HQ, looming figures, ominous stings, EXPOSED / glitch / siren graphics, hero vs villain light, glow or rim on
  Google or the Pentagon, a dolly-zoom (V3) · tape, padlocked lips, zips, muzzles, chains, cages (V7) · gavels, ILLEGAL / VOID stamps, courtrooms (V8)
  · the purpose line without the full clause (V9) · blank cheques, infinity, floodgates, "unlimited", "secret" (V10) · cameras, eyes, guards, escorts,
  a camera inside Google watching her (V12) · her in Washington, the deal at her home or desk (V13) · irony on Google's beat (V14) · logos, BBC
  styling, seals, insignia, partisan flags (V15) · charts or numbers for "heading" (V16) · Hegseth, Trump, Israel or Gaza; "kill", "bomb" (V17).
- **Pip and the ghosts [TR §3; L1]:** two Pip reactions in a shot, a gag near harm, a reaction on Google's beat, Pip in the band, rail or over her,
  Pip as furniture; a frail ghost (stoop, stick, bag), the row walking off, counting years (dates, counters, faster ticks), a death read.

## Conflicts this page settles, and source gaps
- **Near backs:** TR §5 still lists near heads of 260-320 (S2), 260-300 (S3), 240-300 (S6), 200-260 px (S7); K2 keeps them
  (`S1_SHEET.seatedHeadPx.near` [250, 330], `S6.nearHeads.hPx`, `BOTTOM_THIRD`); the kits predate the rule (cast `S1_SEATED.near` hv 262-326; canal
  `S1_STEPS` busts 262-316, a ~300 px seated row; `S2Set` hv 280-304). The owner's rule wins: <= ~140 px wide (§4). REQUEST: K2 and kits update them.
- **Pip** 86-120 px [TR; K2] over HD's "86-130", and `#9497D8` [TR] over the house `#8D90CC` [HD §6; MAS]. **The right rail** is K2's x > 780 below
  y 840 (LD §8's x > 950 box is older). **No faces at all** (LD §4's face beat is overridden [HD §3]). **Orange** stays on the sun disc (not SB's "one
  orange coat in ~300"). **Captions pop** (MS's page scroll, SB's card captions and flip are retired [HD]). **S5's move** (2.1 s + a 0.6 s hold [TR])
  fits CG's 2-5 s / >= 0.5 s; CS §1.4's 2.5-4 s is older [HD]. **Paper edges:** stock `paint-subtle` has the top paper PB forbids (§3).
- **Open, for L4 to decide and report:** CG's drop of 2-3 figure heights vs K2's 62 px end stranger at feet 1238 under a horizon near y 800 (~7): keep
  the terrace floor in dappled shade with dark frames so the bright view carries the scale, and check at 216 px it never reads as a map [dc; L4].
- **Gaps:** `src/v2r/kit/boards/README.md` is missing (K3 = `WorldText.tsx`, `texts.ts`; L5); "10 Canal Mint" is not in `palettes.json` yet (K1 is the
  source); the teardown's sheets live only in the orchestrator's scratch (re-extract with ffmpeg at 216 px); C2 / C3 exist in words only.
