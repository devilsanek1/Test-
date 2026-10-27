# Video 2 ("One Small Window"): STYLE, the look every lane builds to

The definitive style direction of the finished film, distilled from every style source and checked against the owner's
reference images and frames of reference 1 and v1 (2026-10-27). Read it before touching a pixel, then TREATMENT.md for your
shots. It adds no rule of its own: every rule names its source; [measured] = measured for this page on the reference videos.
Precedence: the owner's words [PB, N2] > [TR] > [K2] / [K1] > the look docs > v1 specs; the conflicts this page settles are
listed at the end. Tags: PB `docs/OWNER_PLAYBOOK` · N2 `v2/OWNER_NOTES` · CB `CREATIVE_BRIEF` · TR `v2/TREATMENT` · HD / TD / BM
`v2/direction/house_digest, teardown, beat_map` · CG `look/CINEMATIC_GUIDE` · CS `look/COZY_AND_SCALE` · LD `look/LIFE_AND_DENSITY`
· PAL `look/PALETTE` · ED `EDGES` · SB `style_bible` · MS `motion_spec` · MAS `mascot` · K1 `src/v2r/palette.ts` · K2
`src/v2r/world/map.ts` · BUILD `v2/BUILD` · cast / pip / canal / dc = `src/v2r/kit/*/README.md` · CMN `v2/lanes/COMMON` · L1
`v2/lanes/handover_L1` (critic round 0) · L5 `v2/lanes/handover_L5`.

## 1. The look in one paragraph, and the 10 non-negotiables
One London canal on one golden October evening, plus one trip through the sun to an April morning in Arlington [TR §2]. A
full-bleed 9:16 world seen level across the water or along a towpath, drawn like reference 1 and our v1: a loose, tapered,
warm-brown architectural ink line over flat, slightly misregistered fills in many light peach-cream, brick, sage and water
tones, under one flat mint sky that holds the captions [TR §2, §5; HD §3]. Light brick terraces with balconies and chimney
pots, a two-storey canal wing of light brick, stone fins and glass, narrowboats with smoke, lamps, benches, gasholders and a
viaduct far west; dozens of small, simple people from behind; a new periwinkle elephant in a mustard scarf watching from a
bollard [TR §2-3]. One small woman in a long teal coat is the only teal in the world; one orange sun is the only orange, and
it works [TR §2; TD §2]. Everything moves a little all the time, the camera always travels, every cut carries motion, and the
one big move, a pull-back crane over Arlington, makes the world feel vast [TD §2; CG S5]. Calm, legible, warm and serious:
never menacing, never sickly [TR §2, §6; PB].
1. **Everything is drawn NEW for this film:** sets, figures, Pip, props, life, music; engine primitives and QA tools only;
   never v1 sets, the v3 kit (except `idle.ts`, `Pullback.tsx`), `lib/kit` people, cine generators, `lib/mascot`, `src/v2/**` [PB; CMN; TR §9].
2. **One world, ONE palette ("10 Canal Mint"), fixed colour jobs:** teal `#0B8577` = HER only; orange `#EE6A2E` = the sun disc
   only; plum `#36223A` = the ~5 % anchor; light page fills >= 50 %; story time changes only the light, never the palette [TR §2; K1].
3. **The flat mint sky (y 0-600) is every shot's ONE quiet field and the caption field:** nothing is ever drawn in y 317-556;
   captions pop in place there; the bottom third is never quiet [TR §5; K2 `UI`; PB Captions].
4. **The house hand:** warm ink `#2B1B0A`, weight by depth, tapered, 20-40 % of contours open, fills flat and 2-5 px off the
   line; no gradient, glow, blur, haze, opacity or fade; texture and paper edges off [TR §2; SB §3-4; MS §0].
5. **People small and simple like reference 1:** backs, round heads, one accessory, no faces; near head-backs <= ~140 px
   wide; never a big model, a waist-up shot or a face [PB; N2; TR §3].
6. **Full and alive:** every PAUSED frame at 216 px reads as full as reference 1 and v1; ambient life never stops [PB; LD §0; TR §9].
7. **Pip ("towpath Pip", drawn new) in every shot:** watches, leads the eye, reacts at most once, hops across every cut [TR §3].
8. **A travelling camera:** one move per shot, every cut carried, ONE big move (the S5 crane) whose scale feels GREAT, never
   a zoom in a hold; 60 fps [TR §5-6; CG; PB Motion].
9. **Frame 0 is the scene being drawn:** bare ink, colour by 0.30 s (her coat last), voice at 0.12 s, the hook made physical,
   one continuous shot; the end un-builds back to it [TR §4; PB Hook].
10. **Literal, sourced and fair in every frame:** information on real objects in real places, quotes exact, Google's side at
    equal weight, no war, gag or villain imagery [TR §8; BM §4; CB §18-19].

## 2. Palette "10 Canal Mint" (exact hex: TR §2 = K1 `CM`; checked by K1 `problems()`)
| role | hex (L* / C*) | may go on | NEVER on |
|---|---|---|---|
| sky = caption field | mint `#BCDCCF` (85 / 13) · high step `#CFE6DC` | the whole top y 0-600 in all four light states; a cloud's or April's high step | anything drawn in y 317-556; a gradient; a second sky colour (the mint in every state) |
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
- **The family DNA [PAL; HD §3]:** page L* >= 75, C* <= 20 over 50-80 % of the frame as many fills · ink L* <= 25 at >= 7:1
  (11.3:1 on the mint) · ONE hero (C* >= 30, 5-15 %) · ONE dark tinted anchor (L* <= 40, ~5 %) instead of black · AT MOST one
  pop (C* >= 50, 1-3 %, "look here" only). Colours keep their jobs all film; dressing never takes the hero or the pop [LD §2].
  Saturation lives only in the sun and her coat; Google and the Pentagon stay in quiet stone and brick, no hero, glow or rim [TR §2, §8 V3].
- **Warm, never sickly [PB; TR §2; CS 3b.6]:** no beige, muddy tan, olive(-brown) or grey anywhere (`problems()`: page C* >= 4.5;
  the rejected cut's beige frame 0 is the warning, TD §3); greens are sage (hue >= 95°), never a low-chroma yellow-green
  (it turns olive-khaki); warmth = peach creams, brick, red-brown wood, golden lamp pools, warm shadows against the cool canal.
- **Shadows are colour [CS 3b.6; K1]:** one sun, one light direction, lit : shade ~3:1; a flat polygon (or a 2-step band with a
  15-25 px lighter penumbra), dL* -25 to -40, chroma x0.6-0.7, hue turned to plum on warm walls and 10-15° to blue on cool ones
  (`shadeWarm` / `shadeCool`); short (<= 3-4 % W past the object); whites tinted; darks warm and rare (L* < 25 on <= 6 %).
- **>= 10 % opposite temperature in every frame:** the water, panes and dusk band against the warm made world [CS 3b.6].

| light state (K1 `LIGHT`) | shots (`SHOT_LIGHT`) | flat bands below y 600 | lamps | season dressing (V13 without words) |
|---|---|---|---|---|
| golden | S1, S2, the loop | gold | off | October leaves |
| lowSun | S4 (her walk home) | gold; the sun low on the far roofs | off | October |
| april | S5, S6 (Arlington) | high step `#CFE6DC` over gold | off | blossom + the sun's "APRIL 2026" |
| sunset | S3 (a flash-forward), S7, S8 | sunset (+ dusk mint above it late) | coming on | October |
The sky is the same mint in all four, no state relights a fill (`todSteps` empty) [K1]; S7 and S8 share one light [TR §8 V3].

## 3. Line, fill and texture
- **Ink** `#2B1B0A` only, for lines and captions; never black, never coloured lines [SB §3; K1]. By depth (`INK_PX`): front 4.8,
  mid 3.4, far things 2.2, hair 1.6 px at 1080; figures by height: >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6, smaller
  fill only; ghosts 2.2; Pip ~3.4 at any size; the farthest planes get no ink (S5: full, full, hairline, none, none) [K1; cast; CG cue 5].
- **Loose architectural line [SB §3, §11; TR §2]:** round caps, tapered ends; corners overshoot 3-15 px and structural lines run
  on; long lines in 2-4 segments with 6-16 px gaps; 0.3-1° off-axis, verticals truer; 20-40 % of each contour open (the side
  touching an edge, a window's right or bottom, torso bottoms, Pip's head top and base).
- **Lines only where they carry form:** never a cartoon outline round every silhouette, never on shadows, sky, ground, water or
  far planes [TR §2; PAL; HD §3]. Ink-only things: wires, mullions, rails, bike frames, aerials, bollard poles [SB §3].
- **Fills [SB §4]:** flat single colours, misregistered 2-5 px from their line, ONE offset per object in mixed directions
  (Pip 3 px right / 2 px down); windows 40-70 % filled; shade = a flat polygon one step darker.
- **Nothing soft, nothing fades:** no gradient, glow, bloom, blur, haze, god rays, vignette or opacity anywhere; every change is
  a pop, scale, wipe, slide or draw-on [TR §2; MS §0; MAS].
- **Both states read on their own:** ink-only (frame 0 and the loop; people as paper shapes with full outlines) and fills-only [SB §3; TR §4].
- **The ghosts are the ONE closed outline, on purpose:** outline = not yet real, reference 1's grammar (its empty expected grid
  at 0.0 s, the outline crowds of bigger marches at 6.0-7.5 s) [TR §2; TD §1b].
- **Texture OFF** (no halftone, grain or brush texture); linework static per seed: no boil, shimmer or visible sway [TR §2; CS 3b.7].
- **Paper edges OFF** (Film2R `edges: false`). Only if the owner asks at the final: `paint-subtle`, no paper in y 0-620 (K2
  `UI.noPaperEdge`) or beside the band, side paper from y >= 640 [CS 3b.7], keep rects round her, Pip, the ghosts and every
  board, sign and tag [TR §2]. The stock preset leaves 14-25 px of paper at the TOP (ED §0): it needs a top-free variant first [PB].

## 4. People and Pip
- **Reference 1's grammar [SB §6; cast; PB]:** back view or rear 3/4; a round head that IS the hair colour; a neck; a tombstone
  torso; ONE accessory (bun, hood, beanie, cap, scarf, backpack, tote, headphones, a raised phone); two leg bars; few lines.
  Never a face, features, hands (except a raised phone) or anatomy; a turned head shows at most a skin crescent [cast].
- **Sizes [measured]:** reference 1's street front row has heads ~40 px and shoulders 70-80 px (4.0 s); its biggest backs, after
  the 1.9x push (28.5 s), heads ~50 px, shoulders 110-120 px, ~160 px visible. So in EVERY shot a near head-back (head and
  shoulders cut by the frame bottom) is <= ~140 px wide at the shoulders, its head ~60 px [PB; TR S1 + K2]: with K4 `NearBack`
  (width = 0.84 x hv x broad 0.93-1.1) that is hv <= ~150. The cap is the figure, not the head (a 140 px head would bring back
  the overridden 250-330 px busts). v1's near backs (240-330 px wide at 1.0, 17-19 and 24-34 s) are NOT the bar [measured].
  No big passers-by cut by a side edge (LD §4's 500-1000 px tier B): frame with architecture, trees, boats and posts [PB].
- **Legibility floor [K2 `LEGIBILITY`]:** a story change >= 80 px in its smallest dimension; a figure carrying one >= 130 px
  tall; the S2 bench staffer >= 180 px seated (the hood change >= 80 px); S2's staff windows >= 90 x 90; S3's silhouette 137 px at the match.
- **The public [TR §3; LD §4; cast; CS 3b.4]:** 10-40 per shot (walkers, joggers, cyclists, boaters, readers, people on steps,
  neighbours in windows), about half at rest, no two neighbours alike in hair and coat, NEVER teal or orange; mid figures
  110-260 px, far 15-60 px fill only (LOD: < 105 simplified, < 42 fill only, < 16 `FarCrowd`), window people 12-60 px and never
  still; walks drawn at 12 drawings/s at real speeds (walk 0.7-1.1 body heights/s, bikes 1-3).
- **Her [TR §3; cast]:** invented and generic, never a likeness (V4); a 150-170 px full figure (100 px/m on her line), never
  under 130 px while she carries a story change; a dark-plum round head with a low bun, a long teal coat, a cream tote (S1: a
  potted desk plant under her arm); back, rear 3/4 or walking profile, no features ever; one model sheet at every size; never in
  Washington (V13). Her signature (plum head + bun + long coat, and the teal) is hers alone: no look-alike within ~300 px [L1].
- **The ghosts [TR §3; cast; L1]:** six whole outline copies of HER (her coat cut and bun), paper fill, closed 2.2 px ink; age
  only by whole-head value G1-G6, a scarf and a softer back from G4, a shorter stride at G5-G6; no stoop, stick, bag or anything
  frail; lockstep with her, a visible stride, each figure separate and whole at K2's spacing (`s1RowAt`), 170 -> 135 px down
  the bend; on "life" three bare ink outlines (no fill, no age cue) 130 -> 120 px; the row goes on and never walks off; the
  world passes through them unaware; nothing counts years. The read is "for the rest of her life", never death (no gowns or
  shrouds: L1's critic saw them) [brief_L1]. S8: three, with G4-G6's cues, 140 -> 130 px.
- **Staff and the others [TR §3, §8]:** five window silhouettes in S2's wall, one bench staffer (slate coat, auburn hair, plain
  lanyard; the hood goes up) and small backs at S7's doors who never react: a few, unnamed, faceless; never a row, crowd or count
  (V11). The reporter is a small seated back (satchel, notebook, no BBC marks); S5's stranger reads an open newspaper (no
  masthead, no words); S8's café owner is a small back in an apron with a cloth.
- **Pip, drawn NEW [TR §3; pip]:** a pebble-round baby elephant, no neck; two big leaf ears that fold along a midrib and flick;
  a short trunk with one curl; a three-hair tuft; teddy-bear soles (a pad and three beans); a short knitted mustard scarf lifting
  in the canal wind; ONE loose continuous stroke per pose with 2-3 gaps (head top, base, the screen-right ear root at >= 58 px);
  86-120 px (>= 44 px only in S5's end frame); in colour on frame 0's bare page; idle always (blink, ear sway, a fold-and-flick
  every 4-8 s, breath, scarf flutter).
- **Pip's rules [TR §3; K2 `PIP_RULES`, `PIP`; HD §6]:** in every shot, watching her or the story object; its head turns a few
  frames BEFORE the voice names the next thing; ONE reaction per shot: S1 ears-cover on "life" · S2 head to the wall on "But" ·
  S3 turns to her on "she" · S4 turns west on "heading" · S5 looks up at the calendar sun · S6 one ear flick on "veto", no droop
  · S7 NONE (no tilt or nod on Google's beat) · S8 ears down on "can't". It hops across the cuts on arcs at y >= 600; never in
  y 317-556, the right rail (x > 780 below y 840) or over her; >= 200 px from the F11 clause; no gag near harm; never furniture.

## 5. Fullness and life
- **The bar [PB; LD §0-1; TR §9]:** every PAUSED frame, 216 px wide beside reference 1 and v1, reads as full and specific; the
  approved density bar is v3's G5b pilot (flat 18-24 %, detail 50-56 %) [LD "Approved bar"]. Fullness first, motion second:
  motion never fixes an empty still; fix the world (things, layers, thin lines), then the people, then the idle motion [LD §0].

| profile | shots | the paused frame (`density.py`) | life |
|---|---|---|---|
| BUSY | S1, S2, S6 | flat <= 40 %, objects >= 105 / Mpx, detail >= 34 % | >= 3.5 medium events/s per shot (>= 5 per film), no gap > 1 s; a burst (10+ items in 4 frames) on a hero word every 6-10 s |
| DENSE-CALM | S3, S4, S7, S8 | flat <= 30 %, detail >= 33 %, objects >= 120 | `--cozy`: >= 2 movers always (aim 2-4), crossing sideways at real speeds, half the people at rest, nothing coming at us, one quiet ambient element |
| scale hold | S5 | the scale cues (§6) | 3 tiers of movers in the sky and by the figures, never 1 s still, nothing moving inside the city |
- **The checks, every shot [TR §9; LD §0]:** no hole > ~200 px outside the caption band and the top sky; no other flat region >
  20 %; the y 1250-1920 mass exactly as TR §5 lists it (never flat paving or bare water, nothing to read there); a wide holds 12+
  props, 3-4 planes (S5: 6), people (still ones count), >= 2 things cut by a frame edge, 8+ specific dressing items;
  `deadframes` >= 8/10, no dead run > 0.40 s; the hook ~25 events in its first 3 s [TR §4].
- **What fills a frame [LD §0-3; TD §2.13]:** layers: backs cut by the bottom, a subject in the middle band, a living background,
  edge furniture (a branch, lamps, wires, rails); many small things stacked by overlap; several colours per small patch and
  varied repeats (4-5 building types, a different hat on each head); thin lines (wires, poles, aerials, rails, mullions; never in
  y 317-556); lived-in infrastructure; signs of care (her plants, a neighbour watering, herb pots, the café's mugs) [TR §6].
- **Ambient life always on, from frame 0 [PB; LD §6; CS 3b.4]:** BUSY: leaves, smoke or steam, clouds, a window switching every
  0.6-1.5 s, people walking, Pip's idle, one small loop per shot; DENSE-CALM: the lane of movers plus one quiet element (steam,
  a window lighting, a bird, boat smoke). The world reacts within 0.1-0.3 s (birds lift, heads turn). Ambient motion is small,
  slow, low-contrast and off the subject's path; never over lettering ("Googlz") or in the band [LD §6; HD §8].

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
- **Frame 0 to 5 s [TR §4; PB Hook; CG "The opening"]:** f0 is S1 in bare warm ink on paper under SHE SAYS... + its source, the
  sun half-coloured and Pip already in colour (reference 1's sun and cat); never a title card or a still. f1-f18 colour floods
  shape by shape outward from SUN0, her teal coat LAST at f18 (0.30 s); voice at 0.12 s; our exit ding at 0.45 s; something new
  every few frames; one continuous shot to 5.95 with only the 5 % pull-out. The hook made physical: the expected thing (her
  window goes dark 0.40, the glass doors slide 0.45-0.52, she walks out free into the gold, birds lift 1.40), then reality
  overtaking it from 2.00 (G1 pops ahead of her), one ghost per clause, the row's step and the extra outlines on "life" (4.98).
- **The loop [TR §4; MS §8]:** S8 ends on her lit home window at W (860, 700) 150 x 170; the un-build (fills shrink, ink retracts,
  the sky slab drops, the ghosts and the window last) lands on S1's bare-line state, f0's first motions starting 3-4 frames
  before the seam; never a solid or empty frame there.
- **The Arcane pull-back crane [PB; CG S5]:** the owner's favourite shot (Arcane S1E1 rooftop, #55 @109.46: the camera pulls back
  and rises until two small backs are tiny at a rail over a vast city; "it has pretty much everything"). Its SHAPE: one continuous
  dolly back (never a zoom) + crane up + a ~70-80° arc round the figures on ONE ease, no secondary move, no reversal, roll 0; the
  figures are the pivot while the world slides past (parallax far 1.0, mid 0.85, near 0.4, deck 0, a foreground piece the other
  way); suspense scheduled by progress: a bright slot in their eyeline, a mass hiding the landmark, a foreground wipe at peak
  speed, a light burst, then the landmark lands as the camera slows; a landing hold >= 0.5 s. **In V2S5 [TR §6; K2; dc]:**
  held 20.55-21.30 under blossoming crowns (SUN1 in the slot, the stranger and Pip on a bench, the news box); ONE ease
  `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40; p 0.15-0.40 a big tree stands where the Pentagon will land; the lamppost
  wipe at peak speed (22.02-22.19; the tiny figures swap in behind it); a light burst (the pale cloud bank); p 0.70 the Pentagon
  clears the tree ON "Pentagon" (22.43) with its plaque; p 0.77-0.96 the obelisk rises; windows warm on at 23.08; hold to 24.00
  with a V of birds. The breath out, never menace: the Pentagon calm in daylight and blossom, at or below eye level; no flag,
  seal, guard, vehicle or glow [TR §6, §8 V3].
- **Great-scale cues, run on S5's end frame [CG "Scale cues"; PB]:** nothing ends inside the frame (every band runs past both
  sides; the Pentagon's facades run off the right edge); 6 planes, each 2.2-3x smaller than the one in front; flat atmospheric
  steps 0 / 12 / 22 / 40 / 65 % toward the sky, ink full, full, hairline, none, none (never a haze gradient); the far band packed
  (seeded rows, detail peaking just under the horizon); the drop below the camera; one huge-yet-far landmark (the obelisk drawn
  ~4x its true size, dark against the palest cloud) [dc]; a hero cloud bank >= 1 W behind it (tops >= y 610); huge = slow (clouds
  0-6 px/s); tiny anchors (the stranger and Pip at the balustrade) with lines leading up; daylight colours only. At 216 px: does
  the world keep going, and is it alive?
- **Cozy enclosure, held not shut [CS §1-3b; TR §6]:** her bank (S3, S4, S8) and the riverside holds (S1, S2, S7) are the cozy
  majority, ~31 of the ~35 s outside S5-S6: brick, the bank, boats and steps on 2-3 sides, ONE opening the subject faces (the
  canal, the lane), Google and the deal outside and far; enclosing mass 35-70 % of the frame and >= 40 % of its perimeter; busy
  edges, a calm never-empty centre; a low lamp pool against the cool canal; rounded and soft inside, hard outside. H:W doses at
  eye level: canyon >= 2:1 (sky <= 10 %) · cozy 1:1-1:1.5 (opening 15-30 %) · baseline 1:2 (sky ~30 %) · exposed >= 1:4 (scale
  only). Our mint sky is 31 % of every frame and the only void: every other opening is a bounded floor or water whose far end is
  hidden (a bend, her house, a bridge). RIVERSIDE: level, verticals vertical, depth by overlap stacking upward, every band off
  both sides, a darker mass right behind the people's lane so light figures pop [CS 3b.2]. The owner's lane photo (H:W 1:1, ~27 %
  sky, a tower closing the vista) teaches one tall side, one soft low side and a closed far end (S8 ends on her house at the
  bend), but every built top stays at y >= 600 [K2 `UI.skylineMinY`]. The comfort breaks once, in S5-S6, with no cute props near the clause.
- **Camera rules [K2 `CAMSPEED`; CG Rules; CS 3b.5, §5]:** `camspeed` <= 7.5 px/frame on long flat-ink moves and <= 15 on
  detailed layers (60 fps); a flat foreground wipe may run faster (S5's ~41 px/f) [dc]. Holds lock or float (translation only,
  8-15 px/s, peak <= 25, legs turning back within ±12 px of home); NEVER a zoom in a hold (a 1-4 px/s push reads frozen); a zoom
  is a story move (3-8 % on a line) or the one big move. A physical camera (crane, dolly, truck), ease in, land over the last
  third; no roll, no compound move, no cut mid-move; at or below eye level, never a high angle on one person.
- **Motion carried across every cut [TD §2.11; BUILD §1]:** v1 carried 8 of its 11 cuts; this film carries all 7 plus the loop
  (push-through, window match, two cuts on Pip's leap, two sun matches, the narrowboat wipe, the un-build); no fades, dissolves
  or card flips; transitions sit in voice pauses >= 0.3 s with the midpoint on the new line's first word (S6's cut on "any" is
  the one exception) [MS §7; TR §5].
- **A reference move gives the SHAPE, never the speed [PB Motion]:** copy its path, framing, reveal order and easing, then retime
  to the reel (Arcane's 11.5 s -> our 2.1 s). **60 fps** everywhere, frame = round(t x 60), animated by time, deterministic
  (`rng`); drawn poses step at 12 drawings/s while the camera glides [PB; CMN].
- **Build and sync [MS §3, §7; HD §5]:** strokes draw on in 0.10-0.20 s, ~1 frame apart; fills land 0.13-0.27 s after their
  outline (or fill-first); rises 0.2-0.33 s out-expo; pictures lead the voice by ~0.1 s; marks and Pip's beats land ON the word
  (±0.05 s); one big visual beat per sentence.

## 7. Captions and text in the world
- **Captions [PB Captions; TR §5; BUILD §3; HD §3]:** burned in (platform auto-captions off), Patrick Hand
  (`public/fonts/CaptionHand.woff2`), 98 px on baselines 387 / 510, <= 2 lines, centred, dark ink on the mint; they POP in place
  (page, line, box), never a roll-in, page scroll or clipped letter (v1's 2.2 s roll is the failure); a change at least every
  1.5 s; ONE peach box `#F6B892` per line, leading its word by ~0.06-0.1 s, only on TR §5's key words (quit · SAYS -> NO
  CRITICIZING -> FOR LIFE · odd · staff · scared · contracts · she · AI · objected · military · April · Pentagon · "any lawful
  government purpose" · veto · Google says · principles · "of any kind" · can't · her words · facts); in screen space, never on a
  camera layer, clipped by a wiper or shrinking.
- **The band [K2 `UI`, `SKYLINE_EXCEPTIONS`; BUILD §2]:** the caption block y 317-556 (x 95-945) sits on ONE flat field, the mint;
  nothing is ever drawn in y 317-556 (roof, cloud, bird, wire, Pip's hop, life); the margin y 290-600 stays flat sky except the
  named exceptions (S1's roof planting to y 575, sun tops >= 575, S5's cloud bank and obelisk tops >= 610, S1's hero cloud y
  120-280 and plane branch y 0-240); horizon bands and built tops start at y 600.
- **The frame-0 block [TR §4; BUILD §3]:** SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452, no quote
  marks) + "Source: BBC News, 21 Oct 2026" (20 px, 550), to 5.95 s and back at 39.04 (no box); the only spoken page under it is
  "She [quit] Google." (52 px, 516) 0.12-1.88; then the box walks the block's own words: SAYS 2.06 · NO 3.14 · NO CRITICIZING
  3.74 · FOR LIFE 4.77. "For life" is on screen once, boxed once, always under SHE SAYS (V5).
- **Words live on real objects in real places [LD §7; TD §2.7; TR §5, §9 K3]:** straight-on, level, big, with people or Pip
  looking; one type scale (K3 `WorldText` on `lib/font`): keys >= 56 px read at 216 px; body 30-34 px and credits 18-20 px read
  at full-screen phone width (~390 px) [K2 `LEGIBILITY`]; every source as small print ON its sign, post, plaque, box or board;
  no headers, paragraphs, bullet lists, slides or a source bar on every shot [TD §4]. ONE StatementBoard face (an enamel A-board:
  plum stiles and rails, a paper face, a plum keyline) for TOLD THE BBC (S2, face x 160-560, y 1050-1250), GOOGLE SAYS (S7) and
  SHE SAYS (S8) at B (x 150-630, y 700-1220), the deal board (S6) in the same face and type; fill-first pen reveal, line pops,
  ONE wooden clack, ONE pen [TR §5, §7; L5].
- **Quotes exact [TR §8 V6, A7; BM §3]:** quote marks ONLY on exact words: "for fear of retaliation" (F5) · "any lawful
  government purpose" (F10) · the full 24-word oversight clause, never cut (F11) · "AI principles" (F13) · "of any kind" (F14)
  · "human oversight" (F16) · "talking about facts is not criticising" (F18, the spoken span). Paraphrase stays unquoted
  ("Lawful use: decided by the Pentagon", "bans retaliation"); "for life" is NEVER quoted; British spelling only inside her
  quote, US elsewhere (criticize, AUTHORIZED); "Google" hand-lettered, never its logo or logo colours; never "secret",
  "Department of War", "exclusive" or "largest office building" (V17).
- **Fairness of the boards [TR §8 V9, A5, A8, V14, Q9]:** the deal board is up with the full clause at the cut (24.00), its purpose
  line pops ON "any" (24.03), both readable to 28.06 (it drifts ~25 px/s parallel to the lens). Google's board and hers: the same
  face at B, one light, one type scale, the same pen build and sound, the same Pip pose at the board bollard (700, 1205), ONE
  story move each landing before its key line (S7's 4 % push on "principles", S8's truck before "her words"), a lamp run on each
  key word; Google's beat gets its full 4.85 s (28.31-33.16), uninterrupted to 32.70, no irony, no Pip reaction, never lit on
  "facts", never in S8, never answering her clause. The headers TOLD THE BBC / GOOGLE SAYS / SHE SAYS tell an account, a
  statement and the record apart with the sound off; the record wears "Reported ..." credits.

## 8. The references (study them at 216 px wide beside your frames; never commit their frames [CMN])
| reference | file | study (s) | take | NOT |
|---|---|---|---|---|
| Reference 1 (France, 31.5 s, 1080x1350, 30 fps): THE style | `assets/ref/reference.mp4` (stills already in `assets/ref/`: `f_0.5` ink-only, `f_5.5` street crowd, `f_12.0` noticeboard) | 0.0-0.6 bare ink, then colour floods in patches; 0.6-3.0 the expected grid fills, then overflows on "half a million" (2.0); 3.2-5.5 placards rise; 6.0-7.5 outline crowds; 8.0-13.7 the noticeboard (fill-first, the cat hops on 8.7); 14.0-16 a block builds; 26.9-28.2 push-in; 30.8-31.5 un-build to f0 | the line, flat misregistered fills, open contours; small simple backs (heads 40-55 px); outline = not yet real; the cat in every shot crossing every transition; the sun on top of everything; scenes that build to the words; the loop | the white polaroid card and its bottom captions; page-scroll captions; 3D card flips; a locked camera; its silence |
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
- **The dropped first cut [TD §3-5; N2]:** rooms, desks and papers as the stage (100 % interiors, a top-down desk) · big
  front-facing people with faces, posed busts, squiggle speech bubbles, a "FACTS" bubble · three palettes in 39 s (terracotta,
  periwinkle, violet, a lilac Pentagon) and saturated washes · a locked camera and long holds (43 % still frames) · props
  instead of events (an arm dropping a badge, a highlighter on a clause, a scroll of years) · text as slides (four tiers on frame
  0, a source bar on every shot, legal paragraphs, a GOOGLE SAYS bullet list) · her cat at home instead of Pip · hard cuts
  between unrelated sets · energy that dies after 1 s · a beige pencil frame 0 · anything from that production.
- **People [PB; N2]:** big character models, waist-up shots, close-up faces, front-facing posed figures, stock-vector "corporate
  flat" people; near backs over ~140 px wide; big passers-by framing a shot; a likeness of Sofia Liguori (V4); a row, crowd or
  count of staff, empty desks (V11).
- **Reuse [PB; CMN]:** any v1 set, the v3 kit, `lib/kit` people or placement, cine generators, the `lib/mascot` drawing,
  `src/v2/**`, a house music bed; tracing any frame.
- **Emptiness and stillness [PB; LD; TD DON'T 6]:** a big flat empty field; an object alone on a blank wall; a hole > ~200 px; a
  quiet bottom third; a still frame; a locked shot over ~1 s without inner events; 10+ s on one composition; motion on a void.
- **Colour [PB; TR §2; TD DON'T 4]:** a palette per scene or any sister palette; a violet or periwinkle world; saturated slabs;
  beige, muddy tan, olive or grey; pure black; grey shadows; teal on anyone but her; orange off the sun disc.
- **Rendering [TR §2; MS §0; PB]:** gradients, glow, bloom, blur, haze, god rays, vignettes, opacity, fades, dissolves, card
  flips; an outline round every silhouette; ink on sky, shadow, ground or far planes; texture; boiling lines; paper at the top
  or beside the band.
- **Camera [CG; CS 3b.5]:** a zoom in a hold; roll; a compound move; a cut mid-move; a second big move; a source-speed move; a
  high angle on one person; night or near-black frames; red skies.
- **Captions and text [PB; TR §5, §8]:** a roll-in, page scroll or clipped letter; anything drawn in y 317-556; life crossing
  lettering; text below its floor; quote marks on paraphrase; "for life" quoted, stamped or without SHE SAYS (V5); a drawn
  contract with readable clauses (V6).
- **Fairness [BM §4; TR §8]:** war imagery (weapons, drones, missiles, explosions, soldiers, tanks, crosshairs, targets, radar
  over cities, blood, skulls, war footage) (V1) · Google lettering, product, van or sign in the clause frame, racks, carts,
  screens, deliveries, anything implying targeting (V2) · villains: a sinister HQ, looming figures, ominous stings, EXPOSED /
  glitch / siren graphics, hero light on her and villain light on Google, glow or rim on Google or the Pentagon, a dolly-zoom (V3)
  · gag imagery: tape, padlocked lips, zips, muzzles, chains, cages (V7) · gavels, ILLEGAL / VOID stamps, courtrooms (V8) · the
  purpose line without the full clause (V9) · blank cheques, infinity, floodgates, "unlimited", "secret" (V10) · cameras, eyes,
  guards, escorts, the camera inside Google looking out at her (V12) · her in Washington, the deal at her home or desk (V13) ·
  irony on Google's beat (V14) · logos, BBC styling, seals, insignia, partisan flags (V15) · charts or numbers for "heading"
  (V16) · Hegseth, Trump, Israel or Gaza imagery; "kill", "bomb", "genocide" on screen (V17).
- **Pip [TR §3; TD DON'T 9]:** two reactions in a shot; a gag near harm; a reaction on Google's beat; Pip in the band, the rail or
  over her; Pip as idle furniture or tied to one place; the house Pip drawing.
- **Ghosts [TR §3; L1]:** a stoop, a stick, a bag, anything frail; a cut or partial figure; walking off; anything that counts
  years (dates, counters, accelerating ticks); a death read.

## Conflicts this page settles, and source gaps
- **Near backs:** TR §5 still lists 260-320 (S2), 260-300 (S3), 240-300 (S6) and 200-260 px (S7) near heads; K2 keeps
  `S1_SHEET.seatedHeadPx.near` [250, 330], `S6.nearHeads.hPx` [240, 300] and those sizes in `BOTTOM_THIRD`; the kits' S1 defaults
  predate the rule (cast `S1_SEATED.near` hv 262-326, canal `S1_STEPS` near busts 262-316 and a ~300 px seated middle row, the
  `S2Set` busts hv 280/304). The owner's rule wins in every shot: <= ~140 px wide (§4). REQUEST: K2 and the kit owners update them.
- **Pip** 86-120 px [TR; K2] over HD's "86-130"; its colour `#9497D8` [TR] over the house `#8D90CC` [HD §6; MAS].
- **The right rail** is K2's x > 780 below y 840 (LD §8's x > 950 box is older). **No faces at all** (LD §4's face beat is
  overridden) [HD §3]. **Orange** stays on the sun disc (SB's "one orange coat in ~300" does not apply) [TR §2]. **Captions pop**
  (MS's page scroll, SB's card captions and the card flip are retired) [HD]. **S5's move** 2.1 s + a 0.6 s hold [TR] sits inside
  CG's 2-5 s / >= 0.5 s (CS §1.4's 2.5-4 s is older: CG wins) [HD]. **Paper edges:** PB forbids top paper, the stock `paint-subtle` has it (§3).
- **Open, for L4 to decide and report:** CG's drop of 2-3 figure heights vs K2's 62 px end stranger at feet 1238 under a horizon
  near y 800 (~7): keep the terrace floor in dappled shade with dark frames so the bright view carries the scale, and check at
  216 px that it never reads as a map [dc "Open"; handover_L4].
- **Gaps:** `src/v2r/kit/boards/README.md` does not exist yet (K3 is `WorldText.tsx` + `texts.ts`; L5 owns it); "10 Canal Mint"
  is not in `palettes.json` yet (K1 `palette.ts` is the source); the teardown's contact sheets live only in the orchestrator's
  scratch (regenerate: `ffmpeg -ss <t> -i <video> -frames:v 1 -vf scale=216:-2 <out>.png`); the cozy references C2 / C3 exist in words only.
