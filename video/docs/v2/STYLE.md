# Video 2 ("One Small Window"): STYLE, the look every lane builds to

The definitive style direction of the finished film, from every style source, checked against the owner's reference images and frames of reference 1 and v1,
then integrated with a coverage audit (2026-10-27). Read it FIRST, in full; then TREATMENT.md for your shots; then answer `lanes/STYLE_CHECK.md`. Each rule
cites its source ([measured] = measured for this page); where it is silent, the cited source decides. Precedence: the owner's words [PB, N2] > [TR] > [K2] /
[K1] > the look docs > v1 specs; "A over B" marks a settled conflict (a source still showing B is stale). Tags (`video/docs/` unless a path is given): PB
`OWNER_PLAYBOOK` · N2 `v2/OWNER_NOTES` · CB `CREATIVE_BRIEF` · TR `v2/TREATMENT` · HD / TD / BM `v2/direction/` house_digest, teardown, beat_map · CG / CS /
LD / PAL `look/` CINEMATIC_GUIDE, COZY_AND_SCALE, LIFE_AND_DENSITY, PALETTE · ED `EDGES` · SB `style_bible` · MS `motion_spec` · K1 `src/v2r/palette.ts` · K2
`src/v2r/world/map.ts` · BUILD `v2/BUILD` · cast / pip / canal / dc = `src/v2r/kit/*/README.md` · CMN / L1 / L4S = `v2/lanes/` COMMON, handover_L1, L4_spec.

> **Revised 2026-10-27 ~15:40 UTC with the owner's newest direction (after v3 G5b), integrated where it applies:** CLEAN, refined, premium line
> (§1 no. 4, §3: the v2r clean pen), gentle light and shadow always there (§2), ATTENTION HIERARCHY: one focus at a time, supporting life subtle (§1 no. 6,
> §3 line by attention, §5: BUSY is now LIVELY), one flowing story (§1 no. 8), the NEVER list (§9). Lanes that answered the style check before this: re-read
> those sections.

## 1. The look in one paragraph, and the 10 non-negotiables
One London canal on one golden October evening, plus one trip through the sun to an April morning in Arlington, seen level across water or down a towpath,
drawn like reference 1 and v1 but CLEAN, REFINED, GENTLE and PREMIUM (owner, 2026-10-27): a smooth, confident warm-brown line, flat fills, many light tones,
gentle light with soft shadows that always make sense, one flat mint sky holding the captions; small people from behind; a new periwinkle elephant; one small
woman in teal; one working sun; ONE focus at a time while the supporting world lives quietly; one flowing story; one crane makes it vast [PB; TR §2-6; HD §3].
1. **New:** every set, figure, Pip, prop, life element and the music is made NEW for this film; engine primitives and QA tools only [PB; CMN; TR §9].
2. **One palette, fixed jobs:** "10 Canal Mint"; teal = HER only, orange = the sun only, plum = the ~5 % anchor; only the light changes [TR §2].
3. **One quiet field:** the flat mint sky y 0-600 holds the captions; nothing is ever drawn in y 317-556; the bottom third is never quiet [TR §5; K2].
4. **The house hand, clean and premium:** smooth confident warm ink by depth, few lines, consistent weights; no jitter, overshoot, breaks or doubled
   strokes; contours open only where light hits; fills meet their line; gentle light and soft shadows from one sun, always there; no gradient, glow, blur,
   opacity, fade [PB 2026-10-27 over SB / TR §2's loose line].
5. **People small and simple like reference 1:** backs, round heads, no faces; near backs <= ~140 px WIDE; no big model or waist-up [PB; N2].
6. **Full, alive and READABLE: one focus at a time:** every PAUSED frame at 216 px reads as full as reference 1 and v1 and ambient life never stops, but
   the story's subject owns the contrast, line weight, saturation and the clear motion; supporting life and environment stay subtle (smaller, softer,
   thinner or no lines, calmer); never many equal moving parts [PB 2026-10-27; LD §0, §2; TR §9].
7. **Pip ("towpath Pip", drawn new) in every shot:** watches, leads the eye, reacts at most once, hops across every cut [TR §3].
8. **One flowing story, a travelling camera:** one move per shot, every cut carries the eye and the story into the next (a shared object, a match, the
   subject's motion leading out and in), the main arc visible across the film, ONE big move (S5) whose scale feels GREAT, no zoom in a hold, 60 fps [TR §5-6; CG].
9. **Frame 0 is the scene being drawn:** bare ink, colour by 0.30 s (her coat last), voice at 0.12 s, the hook made physical; it loops [TR §4; PB].
10. **Literal, sourced, fair:** each line an event in the world on its word; facts on real objects; exact quotes; Google at equal weight [TR §8; TD §2.5].

## 2. Palette "10 Canal Mint" (exact hex: TR §2 = K1 `CM`, checked by K1 `problems()`; CIE L* / C* measured)
| role | hex (L* / C*) | may go on | NEVER on |
|---|---|---|---|
| sky = caption field | mint `#BCDCCF` (85 / 13) · high step `#CFE6DC` | the whole top y 0-600 in all four light states; a cloud's or April's high step | anything drawn in y 317-556; a gradient; a second sky colour |
| horizon bands | gold `#F6D9BC` · sunset `#F3C6A6` · dusk mint `#B3CDD2` | flat bands BELOW y 600 (World `horizon` >= 760, or a band rides up into the captions) | y 317-556; blends between bands |
| page (50-80 %) | stucco `#F4E4D2` · paving `#EFD8C2` · limestone `#EEE4D4` · glass `#CDE1DF` · paper `#FBF3E6` | walls, paving, stone, glass, board faces, frame 0's paper: MANY light fills | one empty slab; pure white (glints only, <= 5 % of one object) |
| mids | brick `#E3A88C` `#C9806A` `#A5604F` · sage `#AFC4A8` · stone shade `#C8C3D3` | facades, roofs, trees, boat cabins, stone in shade | a field big enough to read as a slab |
| cool (>= 10 % per frame) | water `#9DC6BF` `#7DAEA8` · unlit pane `#5E6F86` | the canal, the Potomac, cool shade, unlit glass | dark water right behind her (only ΔE 24 from the teal) |
| HERO | canal teal `#0B8577` (50 / 33) | HER only: her coat, her front door, her window frame: the one saturated subject (her coat is ~0.3 % of a frame, so `problems()`'s 5-15 % reads low: expected [PB over TR §9]) | boats, the public, boards, signs, Google, the Pentagon, Pip, props, dressing; a bigger her to "fix" the % |
| ANCHOR | plum `#36223A` (17 / 19) | her dark office window, her hair, gunwale stripes, board stiles, near silhouettes; ~5 % (cap 8 %) | a whole hull; lamps, railings, birds (canal kit defaults: override them); black; a big dark slab |
| POP (one) | sun orange `#EE6A2E` (61 / 74) | the sun disc only, 1-3 %: SUN0-2, the S3 and S8 low suns, the APRIL 2026 calendar disc | caption boxes, coats, signs, FOR LIFE, props, logos, Google, the Pentagon |
| support | box `#F6B892` · lamp `#F7CF86` `#FBE6C2` · ink `#2B1B0A` · line `#9A563C` · shade warm `#8C5E6B` / cool `#6F80A0` | box = the caption key box; lamp = lit windows, pools, bulbs (flat); line = wood, frames, posts, railings | glow or halos (no bulb halo in any state) |
| confetti (< 1 % each, C* <= 45) | leaves `#D6A563` `#B8714F` · blossom `#F3C3CD` · coats `#5E6F86` `#D4A960` `#E6D3B5` `#6E4A5E` · hair `#3E2A3A` `#6B4A3A` `#9A5A3E` `#B9B6C4` `#D9B98A` | people and dressing: many hues in small patches | fields; the hero's or the pop's hue |
| ghosts | paper `#FBF6EE`, ink 2.2 px; heads G1 `#3E2A3A` → G2 `#7D7387` → G3 `#A9A5B5` → G4 `#CFCCD6` → G5-G6 `#ECEAF0` | S1's row (+ 3 bare ink outlines) and S8's three | any other figure |
| Pip | body `#9497D8` · shade `#7579C0` · inner ear, cheeks, soles `#F2C3CC` · scarf `#D4A960` | Pip only (body ΔE76 39-59 from every ground) | its hue on anything else |
- **Family DNA, warm never sickly [PAL; HD §3; LD §2; PB]:** page L* >= 75, C* <= 20, 50-80 % as many fills · ink L* <= 25 at >= 7:1 (11.3:1 on the mint) ·
  ONE hero (C* >= 30) · ONE tinted anchor (L* <= 40, ~5 %) · AT MOST one pop (C* >= 50, 1-3 %); jobs hold all film; Google and the Pentagon stay quiet stone and
  brick (no hero colour, glow, rim [V3]); no beige, muddy tan, olive or grey (page C* >= 4.5; the rejected cut's beige frame 0 [TD §3]); greens sage.
- **Loud tokens stay confetti [CS 3b.6; K1, measured]:** dressing aims at C* <= min(40, hero 33 - 10) ≈ 23; the locked tokens at or above the hero's 33 (mustard
  `#D4A960` 44: coats, Pip's scarf · leaves `#D6A563` 42, `#B8714F` 39 · lamp `#F7CF86` 42 · line `#9A563C` 37 · hair `#9A5A3E` 36 · brick `#C9806A` 35,
  `#A5604F` 34) go in patches < 1 % each, brick as broken facades and hints, never a field; confetti spans many hue families (C3: 52 patches in 11-12).
- **CM only [K1; HD §3; TD DON'T 10]:** every fill is a `CM` token or a flat mix of two (the dc kit's `mix` / `atm`), never CG's cloud or Autumn Ember swatches
  (`#FAF1EA` `#ECD8CB` `#CFC5C4`...), Cream & Cobalt or Dusk (PB's taste signal was the dropped cut's G4 pick, not a lock); `colour_meter.py` defaults to Cobalt.
- **Light and shadow: gentle, but always there [PB 2026-10-27; CS 3b.6; K1]:** one sun per scene and ONE consistent light direction; every figure, Pip, prop,
  boat and building has a soft form shadow on its far side from the sun and a soft flat cast shadow on the ground away from it; light pools only where a
  source explains them (a lamp's pool under its lamp, a window's spill on the paving); never absent, never placed where no light explains it. Shadows are
  colour: lit : shade ~3:1; flat polygons (or a 2-step band with a 15-25 px lighter penumbra),
  dL* -25 to -40, chroma x0.6-0.7, hue to plum on warm walls and 10-15° to blue on cool ones (`shadeWarm`, `shadeCool`), <= 3-4 % W long; whites tinted
  (C* 7-15), darks warm and rare (L* < 25 on <= 6 %); >= 10 % of the opposite temperature (water, panes, the dusk band) in every frame.
- **Light = story time [K1 `LIGHT`; TR §2]:** one mint sky in every state; only the bands below y 600, lamps and season change, never a fill (per shot: §6;
  S7 = S8 [V3]). Light comes from each shot's own sun (west = screen left on every north lens; S6's morning sun east = left) over SB §4's "from the right";
  S2 shows no disc (its sun is off-screen west): the film's one shot without one [TR §5 over TD §2.2].

## 3. Line, fill and texture
- **Ink** `#2B1B0A` only, never black or coloured [SB §3]: by depth front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px (`INK_PX`); figures >= 240 px tall 4.8,
  130-240 3.4, 72-130 2.2, 42-72 1.6, smaller fill only; near backs the front 4.8 (reference 1's audience: 4.5-5); ghosts 2.2; Pip ~3.4; far planes none.
- **Clean architectural line [PB 2026-10-27, over SB §3-4 / TR §2's loose line]:** one smooth, confident stroke per edge, round caps, gently tapered ends,
  ONE consistent weight per depth; NO overshoot, no breaks or gaps in long lines, no off-axis drift, no jitter, no doubled or sketchy strokes (a cornice is
  one line plus a flat shade band); the v2r clean pen does this for every `lib/sketch` call (`src/v2r/pen.ts`, imported by every v2r entry: never pass
  `over`, `breaks`, `jitter` or `drift` to undo it). Few lines: lines only where they carry form, so a contour may stay open where light hits it (a lit edge,
  a window's lit side), never round every silhouette, never on shadows, sky, ground, water or far planes [PAL; HD §3]; brick = a few tone-on-tone flat dabs
  (fill, never ink marks) or none; windows inked on 2-4 sides, panes filled; a glass glint = two hairline diagonals at 60-70°.
- **Line by attention [PB 2026-10-27]:** the subject (her, Pip in his beat, a board on its line) gets the full weight of its depth; supporting figures,
  walkers, birds and background people go one weight step thinner or fill-only; supporting environment may be simpler (fewer lines, flat tone shapes).
- **Fills [SB §4; PB 2026-10-27]:** flat, and they MEET their line (at most a 1-2 px registration offset, one per object, none on small details: clean, not
  sloppy); shade = a flat polygon one step darker, no outline. Nothing soft, nothing fades: no gradient, glow, bloom, blur, haze, god rays, vignette or opacity; every change is a pop, scale,
  wipe, slide or draw-on [TR §2; MS §0]. The ink-only state (frame 0, the loop) and the fills-only state must each read alone [SB §3; TR §4].
- **Big fields are never bare, and still flat [CS 3b.7; TR §5]:** their "paint" is a few long tone-on-tone marks: water ripple dashes 15-55 px long, 6-8 px
  thick (~10-15 per 100 x 100 px), stone dabs 25-80 px one value step darker, lane marks, leaves: drawing, not texture.
- **The ghosts are the ONE closed outline, on purpose** (outline = not yet real, as in reference 1's empty expected grid at 0.0 s and its outline crowds at
  6.0-7.5 s) [TR §2; TD §1b]. **Texture OFF**; linework static per seed (no boil, shimmer or sway) [TR §2; CS 3b.7].
- **Paper edges OFF** (Film2R `edges: false`). If asked for at the final: `paint-subtle`, no paper in y 0-620 [K2] or by the band, sides from y >= 640 [CS
  3b.7], keep rects round her, Pip, ghosts, boards, signs [TR §2]; the stock preset puts 14-25 px of paper at the TOP [ED §0]: fix that first [PB].

## 4. People and Pip
- **Reference 1's grammar [SB §6; cast; PB]:** back view or rear 3/4; a round head that IS the hair colour; a neck; a tombstone torso; ONE accessory (bun,
  hood, beanie, cap, scarf, backpack, tote, headphones, phone); two leg bars; few lines; never a face, features, hands or anatomy.
- **Near backs [PB; N2; TR §5; measured]:** reference 1's front row: heads ~40 px, shoulders 70-80; its biggest backs heads ~50, shoulders 110-120 (SB §6:
  48-56 / 100-110). So in EVERY shot a near head-back (head + shoulders cut by the frame bottom) is <= ~140 px WIDE at the shoulders, head ~55-65; K4 `NearBack`
  is 0.84 x hv x broad (0.93-1.1) wide, so hv <= ~150 (the cap is the figure, not its head), over TR §5 (S2 260-320, S3 260-300, S6 240-300, S7 200-260), K2
  (`S1_SHEET.seatedHeadPx.near` 250-330, `S6.nearHeads` 240-300, `BOTTOM_THIRD`), the kits (`NearBack` / `S1Seated` notes, canal `S1_STEPS` busts 262-316 and a
  ~300 px middle row, `S2Set` hv 280 / 304) and v1 (240-330). S1's steps: near row at the cap, middle row seated ~110 px, low row ~60 px [TR §5].
- **Full figures [PB; TR §3; LD §4; cast]:** standing public 110-260 px in the mid band, never above ~260 (K4 `Person` allows 400: don't), far 15-60 fill only,
  window people 12-60; seated up to ~190 (S2's staffer); the café owner and S8's two readers are small backs about her size (~150 px); no passer-by framing
  a shot (LD §4's 500-1000 px). Floor [K2]: a story change >= 80 px, its carrier >= 130 px, the staffer >= 180 seated, staff windows >= 90 x 90.
- **The public and staff [TR §3, §8; LD §4; cast]:** 10-40 per shot, half at rest, no two neighbours alike in hair and coat, NEVER teal or orange; Google's
  staff few, unnamed, faceless, never a row or count (V11); the reporter (no BBC marks), S5's stranger, the café owner: small backs. **No look-alike** [LD §4;
  L1 must 3]: her signature (plum head, low bun, long coat, teal) is hers alone; no extra pairs the darkest hair `#3E2A3A` (= G1's head, ΔE 6.5 from her plum)
  with a low bun or a long dark coat, none with a dark bun within ~300 px of her or the row; S1's near-row "low bun with a mustard scarf" takes a light hair.
- **Walkers [CS 3b.4; TR §4; MS §3]:** real speeds, equal in body heights at every depth: walk 0.7-1.1 bh/s, bike 1-3; S1 alone keeps TR's ~40 px/s stroll
  (the row is built on it); S4: one stride for her and the truck, feet planted (`strideFor`); walks at 12 drawings/s; extras enter at an edge already
  walking; a figure that APPEARS rises 0.2-0.33 s from behind a mass, never pops mid-frame.
- **Her [TR §3; cast]:** invented, never a likeness (V4); a 150-170 px full figure (100 px/m), never under 130 px while carrying a story change; a dark-plum
  round head with a low bun, a long teal coat, a cream tote (S1: a desk plant); back, rear 3/4 or walking profile; one model sheet at every size; never in
  Washington (V13). S3's window IS S8's picture: one French window (teal frame, Juliet rail, blind UP, lamp on), house and sunset light; L3 and L6 compare.
- **The ghosts [TR §3; cast; L1]:** six whole outline copies of HER (coat cut, collar, hem, bun), paper fill, closed 2.2 px ink; age only by whole-head value
  G1-G6, a scarf and softer back from G4, a shorter stride G5-G6; nothing frail; lockstep, each separate, 170 -> 135 px down the bend, three bare outlines
  130 -> 120 px on "life"; the row goes on, the world passes through it, nothing counts years, never death. S8: three, 140 -> 130 px, to the seam, last out.
- **Pip, drawn NEW [TR §3; pip; K2 `PIP`; HD §6]:** a pebble-round elephant, no neck; two big leaf ears that fold and flick; a one-curl trunk; a three-hair
  tuft; teddy-bear soles; a short knitted mustard scarf in the wind; ONE clean, smooth outline per pose (consistent weight, no gaps, no overshoot); 86-120 px (>= 44 in S5's end) and `#9497D8`, over
  HD / LD's 86-130, TD's 5-10 % and the house `#8D90CC`; idle always. It watches, turns its head BEFORE the voice names the next thing, reacts ONCE: S1
  ears-cover on "life" · S2 head to the wall on "But" · S3 turns to her on "she" · S4 turns west on "heading" · S5 looks up at the calendar · S6 one ear flick
  on "veto" (no droop) · S7 NONE · S8 ears down on "can't" (looking up at W on "not" is a lead); beats on her words stay small [TR §3 over LD §5]. It hops
  across cuts (arcs at y >= 600); S3's exit is the LEFT edge, y 620-700 [K2 over TR §3]. One Pip at a time: S1 draws it from t >= 0 only (S8's lands on f0's
  bollard in the t < 0 underlay) [BUILD §2; L6]; it rides S7's wiping boat in (L5 and L6 agree the hand-off). Never in y 317-556, the rail (x > 780, y >
  840) or over her; >= 200 px from the F11 clause; no gag near harm; not furniture.

## 5. Fullness and life
- **The bar [PB; LD §0; TR §9]:** every PAUSED frame at 216 px beside reference 1 and v1 reads as full and specific, AND calm to read: one focus, the
  supporting world softer and simpler. v3's G5b pilot shows how FULL a world can be (flat 18-24 %, detail 50-56 %), never how much may move: the owner
  judged v3 G5b "too busy, too many moving parts, I'm not sure what to keep my attention on" (2026-10-27). Fullness first (motion never fixes an empty
  still), then hierarchy: decide each beat's ONE focus and demote everything else, designed in from the start, never bolted on afterwards.

| profile | shots | the paused frame (`density.py`) | life |
|---|---|---|---|
| LIVELY (was BUSY) | S1, S2, S6 | flat <= 40 %, objects >= 105 / Mpx, detail >= 34 % | at any moment ONE focus-tier motion (the story beat) + 2-4 supporting movers, slow and low-contrast; no gap > 1 s with nothing moving; one small loop per shot; a burst only where the burst IS the beat (S2: "staff" 8.96, the five windows and silhouettes), never an extra event competing with it |
| DENSE-CALM | S3, S4, S7, S8 | flat <= 30 %, detail >= 33 %, objects >= 120 | `--cozy`: movers >= 2 (aim 2-4), empty <= 5 %, cv <= 0.3 (one slow swell <= 0.75); one quiet ambient element |
| scale hold | S5 | the scale cues (§6) | 3 tiers of movers in the sky and by the figures, never 1 s still, nothing moving inside the city |
- **The checks [TR §9; LD §0]:** no hole > ~200 px outside the band and the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists it
  (never flat paving or bare water, nothing to read); a wide holds 12+ props, 3-4 planes (S5: 6), people (still ones count), >= 2 things cut by a frame edge,
  8+ specific dressing items; `deadframes` >= 8/10, no dead run > 0.40 s; the hook's first 3 s full of events [TR §4], read as ONE coherent action (the scene drawing itself, then her walk), not many competing ones.
- **What fills a frame [LD §0-3; TD §2.13]:** layers (backs cut by the bottom, a subject mid-frame, a living background, edge furniture); small things stacked
  by overlap; several colours per patch, varied repeats (4-5 building types, a different hat on each head); thin lines (never in y 290-600); lived-in
  infrastructure; signs of care (her plants, a neighbour watering, herb pots, mugs); the subject keeps the strongest contrast and a calm 30-60 px ring [LD §2].
- **Ambient life always on, in the SUPPORTING tier [PB; LD §6]:** LIVELY: leaves, smoke or steam, clouds, a window switching every ~2-4 s, walkers, Pip's idle; the world reacts
  within 0.1-0.3 s (birds lift, heads turn); ambient motion small, slow, low-contrast, off the subject's path, never over lettering ("Googlz") or in y
  290-600 [HD §8]. S1's sky: the hero cloud at 2 px/s (huge = slow) plus a thin bar or two at 5-15 px/s the same way, in y < 290 [TR §4; CG cue 10].
- **The cozy lane, DENSE-CALM [CS 3b.4]:** life passes through ONE band, both ways: 1-5 movers, a new one every ~1-2.5 s, each entering and leaving at an edge
  or behind a mass already at cruising speed (no starts, stops or easing on screen), half the people at rest beside them, and NOTHING comes at the viewer
  (S8's cyclist's lamp crosses, never rides at the lens); bank, backdrop and water have no motion of their own; no sway, shimmer or boil.
- **Builds and sync [MS §3, §6, §7; BM §2]:** strokes draw on in 0.10-0.20 s, starting ~2 frames (60 fps) apart; fills 0.13-0.27 s after their outline
  (boards: fill-first); counting builds 0.10-0.17 s apart. TR's exact times win; elsewhere a small item leads its word ~0.1 s, a big build starts 0.25-0.40 s
  early so it completes ON the word, marks and Pip's beats land on the word (±0.05 s); nothing ever trails its word.
- **Flash safety [CS §5; WCAG 2.3.1]:** never more than 3 flashes in any 1 s, at any size: a lamp, bulb or window switches on ONCE (drop the canal `Lamp`'s
  3-frame flicker from S7's 30.04 and S8's 37.18 runs); one bulb twinkles at a time; S2's five clicks and S6's 27.08-27.80 ticks are single steps.
- **Prove it in the review files [LD §9; TR §9]:** `python3 -I scripts/qa/density.py <clip> --scenes src/v2r/film/scenes.json --only V2Sn` (+ `--cozy` on S3,
  S4, S7, S8, judged on their row: the default table and `gate_check --density` misread cozy holds); `colour_meter.py <stills> --hero '#0B8577' --pop
  '#EE6A2E' --band 290,600`; `deadframes.py <clip> --scenes src/v2r/film/scenes.json`; camspeed (§6); y 317-556 pure mint in every frame; the paused sheet
  beside reference 1, v1 and the G5b pilot; the shot's ONE thing (TR §5, last column) told back by a cold viewer who read nothing (frames only, sound off).

## 6. Cinematography
| shot | vantage (dose) | profile | camera: ONE move each [TR §5] | in [BUILD §1] | light |
|---|---|---|---|---|---|
| S1 | RIVERSIDE, seated eye level on our steps, looking north | LIVELY | pull-out 1.05 -> 1.00 ease-in about W 0-4.90; push-through dive into W 5.95-6.25 | the loop's un-build | golden |
| S2 | RIVERSIDE from the south towpath; the wing recedes right | LIVELY | out of the dive (12 % ease-out) -> float 10 px/s -> 6 % story push on W2 8.50-12.80 | push-through | golden |
| S3 | RIVERSIDE across the water to her terrace | DENSE-CALM | match at W2 -> 5 % ease-back 13.00-13.60 -> float 8-12 px/s | window match-cut | sunset |
| S4 | RIVERSIDE truck from the water | DENSE-CALM | truck west at her pace (far roofs 0.3x) -> stop on "objected" -> 6 % push to SUN1 18.40-20.10 | cut on Pip's leap | low sun |
| S5 | a viewpoint terrace -> the pull-back crane | scale | hold -> ONE crane 21.30-23.40 -> hold to 24.00 | sun match-cut (SUN1) | April |
| S6 | eye level, straight-on, looking south | LIVELY | lateral truck left 24.00-28.06, parallel to the board | cut on Pip's leap | April |
| S7 | eye level in Google's forecourt, looking north | DENSE-CALM | float 8-12 px/s + ONE 4 % push on B landing on "principles" | sun match-cut (SUN2) | sunset |
| S8 | LANE along her towpath, looking west | DENSE-CALM | float -> ONE plain truck left 34.99-35.60 -> float -> the seam push 1.00 -> 1.05 about W | narrowboat wipe | sunset |
- **Frame 0 to 5 s, and the loop [TR §4; PB Hook; CG "The opening"; MS §8]:** f0 = S1 in bare warm ink on paper under the frame-0 words, the sun half-coloured
  and Pip already in colour (reference 1's sun and cat), never a title card; f1-f18 colour floods shape by shape from SUN0, her coat LAST (f18, 0.30 s); voice
  0.12 s; the exit ding 0.45 s; one continuous shot to 5.95, only the 5 % pull-out. The expected thing (her window dark 0.40, the doors slide 0.45-0.52, she
  walks out free, birds lift 1.40), then reality overtaking it from 2.00: a ghost per clause, the row's step and the extra outlines on "life" (4.98); cover
  5.30. S8 ends on her lit window at W (860, 700) under a 1.05 push about W (37.70-38.82, held: W = 157.5 x 178.5 = S1's f0) [K2 MATCHES; brief_L6 over TR
  §5's float], then un-builds (fills shrink, ink retracts, the sky slab drops, ghosts and window last) onto S1's bare state; f0's motions start 3-4 frames early.
- **The Arcane pull-back crane [PB; CG S5]:** the owner's favourite (S1E1's rooftop, #55 @109.46: two small backs end tiny over a vast city; "it has pretty
  much everything"). Its SHAPE: one dolly back (never a zoom) + crane up + a ~70-80° arc round the figures on ONE ease, no other move or roll; the figures are
  the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0); suspense by progress: a bright slot in their eyeline, a mass hiding the landmark, a foreground wipe
  at peak speed, a light burst, the landmark landing as it slows, a hold >= 0.5 s drifting the last ~2 %. **V2S5 [TR §6; K2; dc]:** held 20.55-21.30 between
  flanking blossom crowns over dappled floor shade (nothing overhead: a crane-up drops it through the band); ONE `cubicBezier(0.35, 0.03, 0.45, 1.0)`
  21.30-23.40 (over CG's 0.55 curve); the lamppost wipe at peak speed 22.02-22.19 (over TR's 7-frame p 0.40-0.50); the Pentagon clears the tree ON "Pentagon"
  (22.43); the obelisk rises; hold to 24.00. Never menace: daylight, blossom, eye level or below, no flag, seal, guard, vehicle or glow [TR §8 V3].
- **Great scale [CG Scale cues 1-11; PB]:** nothing ends inside the frame (every band past both edges, something cut by all 4); 5-7 planes, each 2.2-3x smaller
  than the next nearer (S5: 6); the far band packed (rows every 9-10 px, each half hiding the next), detail PEAKING just under the horizon; flat steps 0 / 12 /
  22 / 40 / 65 % toward the sky, values 5 / 5 / 4 / 3 / 2, ink full, full, hairline, none, none, far shade leaning dusk-blue; 3/4 backlight (tops lit,
  camera-facing walls and the backs in shade, shadows toward us); feet 2-3 F (figure heights) below the horizon, then the drop (past 3.5 F reads as a map);
  one huge-yet-far landmark 1.1-1.4 F over the horizon, the darkest far shape on the palest cloud (the obelisk ~4x true size [dc]); a cloud bank >= 1 W behind
  it (tops >= y 610); huge = slow (clouds 0-6 px/s, bars 5-15, one way); 3 speed tiers of life, none inside the city: birds 24-44 px, 5-6 wingspans/s, flap
  3-4 Hz, entering at 70-80 % of the move. K2's end stranger (62 px at feet 1238, ~7 F) breaks the 2-3 F cue; K2 changes only through the director: until
  then L4 builds to it with L4S §3's mitigation and checks at 216 px that it never reads as a map.
- **Cozy enclosure, held not shut [CS §1-3b; TR §6]:** her bank (S3, S4, S8) and the riverside holds (S1, S2, S7): brick, bank, boats and steps on 2-3 sides,
  ONE opening the subject faces, the institutions far outside; mass 35-70 % of the frame, >= 40 % of the perimeter; something in the top gutter (y 0-290); >= 1
  sign of care; busy edges, a calm never-empty centre; one low flat lamp pool (<= 2 rings, lighter inward); rounded inside, hard outside. TR's dose over CS's
  8-15 % sky: the sky y 0-600 (31 %) is the caption field and the only void, so masses below y 600 and the side edges enclose. RIVERSIDE: level, overlap
  stacked upward, the VALUE SANDWICH (the darkest mass, L* 20-38, right behind the people's lane so light figures pop; the lane neutral, C* <= 15; bank and
  water light again) [CS 3b.2]. LANE (S8; the owner's lane photo, H:W 1:1, ~27 % sky): one tall side, one soft low side, a closed end (her house). Google is
  never the threat, so its riverside is cozy (V3, A5 over CS §1.5); the comfort breaks once, in S5-S6.
- **Camera rules [K2 `CAMSPEED`; CG Rules 3; CS 3b.5; HD §5; TD §2.11]:** `camspeed` <= 7.5 px/f on long flat-ink moves, <= 15 on detailed layers (over
  PIPELINE_V2's 15, CG's 25 and the tool's 18); S5's flat wipe ~41 by design. The float law: translation only, 8-15 px/s (peak 25), straight legs turning
  (eased) every 0.6-1.5 s, net within ±12 px of home, >= 40 px overscan, no zoom, rotation or parallax (one 10 px/s heading for seconds breaks it). NEVER a
  zoom in a hold (1-4 px/s reads frozen); a zoom is a story move (>= 3 % in <= 2 s, on a line) or the big move; in TR's float + move pairs (S2, S7) the float
  is back home (0 offset) when the move lands, so K2's spot is exact; S8's truck is plain; speed continuous; ease in, land over the last third; no roll,
  compound move or cut mid-move; at or below eye level. Every cut carried (the table's "in"), in a voice pause >= 0.3 s, midpoint on the new line's first word
  (S6's "any" excepted); no fades, dissolves, card flips. Measure every 60 fps frame: `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15` (7.5
  for flat-ink moves; S5: `--allow 1.47-1.64`, s from its first frame). CG's S1-S5 are shot TYPES (its "S2: push <= 1 %" is not V2S2).
- **Shape, never speed; 60 fps; the clock [PB Motion; CMN; BUILD §2]:** copy a move's path, framing, reveal order and easing, then retime it (Arcane's 11.5 s ->
  our 2.1 s); 60 fps, frame = round(t x 60), deterministic; poses step at 12/s, the camera glides. Beats run on the HEARD clock (`voice_words_heard.json`: "life"
  4.98, "of any kind" 32.08) over HD §1's raw anchors; `useTime()` is shot-local but K2 times and kit defaults are FILM s: `TimeShift`, or t = film - start.

## 7. Captions, text in the world, sound
- **Captions (engine-owned) [PB; TR §5; BUILD §3]:** burned in, Patrick Hand 98 px on baselines 387 / 510, <= 2 lines, centred, ink on the mint; they POP in
  place (page, line, box), never a roll-in, page scroll or clipped letter (v1's 2.2 s roll failed); a change at least every 1.5 s; ONE peach box `#F6B892`
  per line, ~0.06-0.1 s before its word, only on TR §5's key words; in screen space, never on a camera layer or shrinking.
- **The band [K2 `UI`, `SKYLINE_EXCEPTIONS`; BUILD §2-3; CG Rules 2]:** the block y 317-556 (x 95-945) sits on ONE flat field, the mint; NOTHING is ever drawn
  in y 317-556 (roof, cloud, bird, wire, puff, Pip's hop, life); the boxes reach y 299, so y 299-317 stays clear wherever a box can sit; y 290-600 is flat sky
  but for the named exceptions (S1's roof planting to y 575, sun tops >= 575, S5's cloud bank and obelisk tops >= 610; above it, S1's hero cloud y 120-280 and
  plane branch y 0-240), over LD §8's passing weather; flyers and puffs keep to y >= 600 or the top gutter (`ceil={600}` over the kit's 580). Key reads x
  120-880, y 290-1250; the rail x > 780 below y 840 [K2 over LD §8's x > 950]; y 1250+ holds masses only, nothing to read.
- **The frame-0 block [TR §4; BUILD §3]:** SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452, no quote marks) + "Source: BBC News, 21 Oct
  2026" (20 px, 550), to 5.95 s and from 39.04; only "She [quit] Google." (52 px) under it, 0.12-1.88; then the box walks the block's own words (SAYS 2.06 ·
  NO 3.14 · NO CRITICIZING 3.74 · FOR LIFE 4.77): "for life" on screen once, boxed once, always under SHE SAYS (V5).
- **Words live on real objects in real places [LD §7; TD §4; K2; TR §5, §9]:** straight-on, level, big, people or Pip looking; one type scale (K3 `WorldText`):
  keys >= 56 px read at 216 px, body 30-34 and credits 18-20 at full-screen phone width (~390 px); sources as small print ON the object; no headers, paragraphs,
  bullets or source bars. ONE StatementBoard face (enamel A-board, plum stiles) for TOLD THE BBC (S2), GOOGLE SAYS (S7), SHE SAYS (S8) at B (x 150-630, y
  700-1220) and the deal board (S6): fill-first pen reveal, ONE clack, ONE pen [TR §7]. K3 has ONE owner, L5: stand-ins (L2's A-board, L3's post and tag, L4's
  NewsBox and Plaque) swap to K3's; a size off the scale (TR's 40 px news-box headline; a 280 x 200 tag too small for body 30) changes only by a K2 REQUEST.
- **Quotes exact [TR §8 V6, A7; BM §3]:** quote marks ONLY on exact words: "for fear of retaliation" (F5) · "any lawful government purpose" (F10) · the full
  24-word oversight clause, never cut (F11) · "AI principles" (F13) · "of any kind" (F14) · "human oversight" (F16) · "talking about facts is not criticising"
  (F18); "for life" never quoted; British spelling only inside her quote; "Google" hand-lettered, never its logo; never "secret", "Department of War" (V17).
- **Fair boards [TR §8 V9, A5, A8, V14, Q9]:** the deal board (the record) shows the full clause at the cut (24.00) and pops its purpose line ON "any" (24.03),
  both readable to 28.06. The identical pair is S7 GOOGLE SAYS and S8 SHE SAYS (in neither L5's nor L6's brief: it is the rule): the same face at B, sunset
  light, type, pen build and clack, the same Pip pose at the bollard (700, 1205), ONE story move each before its key line (S7's 4 % push, S8's truck), a lamp
  run on each key word; Google's beat gets its full 4.85 s, uninterrupted to 32.70 (nothing starts before), no irony, never lit on "facts", never in S8,
  never answering her clause. The headers TOLD THE BBC / GOOGLE SAYS / SHE SAYS tell account, statement and record apart.
- **Sound the picture carries [TR §7; PB; CB §20-21; HD §7]:** the voice always on top; 0-6.10 no music (air + S1's SFX: the picture is the hook); every SFX
  sits on a visual onset (TR §5's SFX column), one sound per idea, so each hit you animate is clean and frame-exact; ONE clack and ONE pen for every
  statement board; one soft tick per ghost pop at one pitch (nothing counts years); Google's beat keeps her pulse and level. Report any hit you add.

## 8. The references (study at 216 px beside your frames; extract to scratch: `ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png`)
| reference | file | study (s) | take | NOT |
|---|---|---|---|---|
| Reference 1 (France, 31.5 s, 1080x1350, 30 fps): THE style | `assets/ref/reference.mp4` (stills in `assets/ref/`: `f_0.5` ink-only, `f_5.5` street crowd, `f_12.0` noticeboard) | 0.0-0.6 bare ink, then colour floods in patches; 0.6-3.0 the expected grid fills, then overflows on "half a million" (2.0); 3.2-5.5 placards rise; 6.0-7.5 outline crowds; 8.0-13.7 the noticeboard (fill-first, the cat hops on 8.7); 14.0-16 a block builds; 26.9-28.2 push-in; 30.8-31.5 un-build to f0 | the line, flat misregistered fills, open contours; small simple backs (heads 40-55 px); outline = not yet real; the cat in every shot crossing every transition; the sun on top of everything; scenes that build to the words; the loop | the white polaroid card and its bottom captions; page-scroll captions; 3D card flips; a locked camera; its silence |
| v1 "php2shell" (55.4 s, 30 fps): the house model, the owner's favourite | `deliverables/v1/php2shell_final.mp4` | 0-4.7 plaza + power-button sun; 4.35-4.72 the dive into a lock; 8.45-9.95 a street builds from bare lines; 12.0-13.4 the sun as a pie; 19.8-22 golden-hour lane with string lights; 24.1-27 crane over a wall into the skyline; 37.2-39.4 pull-back to a hillside; 39.55 the tram wipe; 52.2-55.4 the rewind loop | one sunny world under the mint caption sky; a sun that works; Pip on a bollard hopping across cuts; signage with sources; a new event every few frames; 8 of 11 cuts carried; scale peaks held | its big near backs (240-330 px wide [measured]); the caption roll at 2.2 s; its coloured frame 0 (the bare-ink rule came later); 30 fps; its night beat (34.5-36); its sets, Pip drawing and palette |
| Reference 2 (town meeting, 44.1 s): part of the bar | `assets/ref2/reference2.mp4` | 0-6 a walking dolly behind walkers and a corgi; 32-38 dusk -> night, string lights | crowds from behind ("makes me feel small"); the animal low in frame looking where we should; one journey with no hard cut | its big near figures; dissolves; giant-object metaphors the facts don't support [CG] |
| The approved density bar | `deliverables/v3/v3_g5b_pilot.mp4` | O1 (the nook), S4 (the noticeboard street) | how FULL a world can be (flat 18-24 %, detail 50-56 %), NEVER how much may move: the owner judged v3 G5b too busy, incoherent and rough (2026-10-27) | its winter content, palette and kit |
| Sense of enclosure (owner photo) | `docs/look/ref_sense_of_enclosure.jpg` | the whole frame | an eye-level lane: one tall side, one soft low side, a curving lane, a vista closed by a tower; H:W ~1:1, sky ~27 % | its grey overcast and rain; photo realism; olive-grey stone; a wall cut by the top (our tops stay >= y 600) |
| Palette references (5 editorial illustrations): COLOUR only | `docs/look/palette_refs/1-5.webp` + `swatches.png` | the swatch bars | a warm off-white page 51-82 %, one saturated hero 4-10 %, a deep aubergine anchor ~5 % (refs 3, 5), tiny orange pops 1-3 %, soft secondaries; lines only inside shapes | their big front-facing figures with faces, never a character style (the rejected cut's "corporate flat" people [TD §4.2]); olive and khaki (refs 1, 4); ref 5's pink wash; the halftone |
| Texture reference | `docs/look/texture_refs/autumn_walk_detail.png` | the crop | thin tapered dark lines only in key places; no outline round silhouettes | the halftone dots (texture is off); olive |
| The animated sketchbook | `docs/look/ref_animated_sketchbook.png` | both pages | RETIRED for v2's line (the owner's clean premium line, 2026-10-27): only its open contours where light hits survive | scribble hatching, grey wash, a monochrome finished look (it is the G3 animatic's look; this film has no sketch stage) [N2] |
| Arcane: ENVIRONMENT ONLY | words in CG (#55 @109.46 the S1E1 rooftop crane; #94 @238.0 rise-over; #24 @30.8; #60 @144.4; #61 @147.3; #108 @286.3); the owner's collage `assets/ref_cinematic/arcane_collage.jpg` (its first tile: two small backs over the night city) | the measured shapes and cues in CG | camera shape and staging; small backs facing a vast view; the scale cues; a big flat sky with huge clouds | footage, frames or tracing; faces or people as subject; night, red skies, glow, beams, haze, god rays, painterly texture, airships, steampunk; source speed [CG "Not for us"] |
| Cozy references C2 / C3 (owner clips) | words only, `docs/look/COZY_AND_SCALE.md` 3b | the BALCONY and RIVERSIDE recipes | fullness first; rest next to motion; life passing sideways; the 2D float instead of a push | their louder saturation; olive darks |
| Anti-references | v3 G5 `deliverables/v3/v3_g5_blocking.mp4`; the rejected v2 cut in words only (TD §3-4; its archive is never mined [PB]) | TD §4's table | "way too empty" (a chart on a blank wall, 74 % flat); interiors, big faces, three palettes, stillness, props, text slides | anything from them |

## 9. The NEVER list (everything the owner rejected, and every fairness break; plus every NEVER in §2-7)
- **The dropped first cut [TD §3-5; N2]:** rooms, desks and papers as the stage · big front-facing people with faces, posed busts, squiggle speech bubbles, a
  "FACTS" bubble · three palettes, saturated washes · a locked camera, long holds · props instead of events (a badge, a highlighter, a scroll of years) · text
  as slides (four tiers on frame 0, a source bar on every shot, legal paragraphs, a bullet list) · her cat at home instead of Pip · hard cuts between
  unrelated sets · energy dying after 1 s · a beige frame 0 · anything from that production.
- **People [PB; N2; LD §4]:** big character models, waist-up shots, close-up faces, front-facing posed figures, "corporate flat" stock people; near backs over
  ~140 px wide; standing figures over ~260 px; big passers-by framing a shot; an extra who looks like her; a likeness of Sofia Liguori (V4); staff as a crowd.
- **Reuse [PB; CMN]:** any v1 set, the v3 kit (bar `idle.ts`, `Pullback.tsx`), `lib/kit` people or placement, cine generators, the `lib/mascot` drawing,
  `src/v2/**`, `src/v3/film/kit/util.tsx`, a house music bed; tracing any frame.
- **Rough, busy, stitched (owner, 2026-10-27, after v3 G5b) [PB]:** rough, scratchy or sketchy lines (jitter, overshoot, breaks, doubled strokes, uneven
  weights) · many equal moving parts competing for attention, life at the subject's contrast · absent shadows, light "weirdly put" (a pool or shadow no
  source explains, two light directions in a scene) · a bunch of shots stitched together, a cut that carries neither the eye nor the story · detail bolted on
  after the shot instead of designed in with its hierarchy.
- **Emptiness, look and camera [PB; LD; TD DON'T 4, 6; MS §0; CG; CS §5]:** a big flat empty field, an object alone on a blank wall, a quiet bottom third, a
  still frame, a locked shot over ~1 s without inner events, 10+ s on one composition, motion on a void · a palette per scene, a hex outside `CM`, a violet
  world, loud fields, beige, tan, olive, grey, pure black, grey shadows · gradients, glow, blur, haze, opacity, fades, dissolves, card flips, texture, boiling
  lines, an outline round every silhouette · a zoom in a hold, roll, a compound or source-speed move, a cut mid-move, a high angle on one person, night-black
  frames, red skies, more than 3 flashes in a second · anything in y 317-556, a clipped or rolling caption, life over lettering, quote marks on paraphrase.
- **Fairness [BM §4; TR §8]:** war imagery: weapons, drones, missiles, explosions, soldiers, tanks, crosshairs, targets, radar over cities, blood, skulls, war
  footage (V1) · Google lettering, products, vans or signs in the clause frame; racks, carts, screens, deliveries; anything implying targeting (V2) · villains:
  a sinister HQ, looming figures, ominous stings, EXPOSED / glitch / siren graphics, hero vs villain light, glow or rim on Google or the Pentagon, a
  dolly-zoom (V3) · tape, padlocked lips, zips, muzzles, chains, cages (V7) · gavels, ILLEGAL / VOID stamps, courtrooms (V8) · the purpose line without the full
  clause (V9) · blank cheques, infinity, floodgates, "unlimited", "secret" (V10) · cameras, eyes, guards, escorts, a camera inside Google watching her (V12) ·
  her in Washington, the deal at her home or desk (V13) · irony on Google's beat (V14) · logos, BBC styling, seals, insignia, partisan flags (V15) · charts or
  numbers for "heading" (V16) · Hegseth, Trump, Israel, Gaza, "kill", "bomb", "exclusive" (V17) · "for life" quoted, stamped or without SHE SAYS (V5).
- **Pip and the ghosts [TR §3; L1]:** two Pip reactions in a shot, two Pips on screen, a gag near harm, a reaction on Google's beat, Pip in the band, rail or
  over her, Pip as furniture; a frail ghost (stoop, stick, bag), the row walking off, counting years (dates, counters, faster ticks), a death read.
- **Settled direction (2026-10-27):** the owner's clean premium line, gentle light and shadow, attention hierarchy and one flowing story (PB, after v3 G5b)
  over SB §3's loose line, TR §2's overshoots and misregistration, LD's event rates and the G5b pilot's motion; STYLE.md is the ONE place that wins.
- **Settled process; source gaps:** no sketch stage (the owner's restart) over CLAUDE.md / PIPELINE_V2's G3; COMMON's review loop (<= 12 problems, 3 rounds)
  over TR §9's "max 6 findings, fix once" [PB: MAX effort]. Gaps: no `kit/boards/README.md` yet; "10 Canal Mint" not in `palettes.json` (K1 is the source);
  `docs/v2/LOOK.md` archived; the teardown's sheets only in the orchestrator's scratch (re-extract, §8); C2 / C3 in words only; no committed band check.
