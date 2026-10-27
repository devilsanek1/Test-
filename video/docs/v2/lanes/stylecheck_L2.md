# Style check, lane L2 (V2S2 "The wall"), 2026-10-27

1. **Colour jobs.** Sky mint `#BCDCCF` (high step `#CFE6DC`): the whole top y 0-600 in every light state; never anything drawn in y 317-556, never a
   gradient or a second sky colour. Hero canal teal `#0B8577`: HER only (coat, front door, window frame); never boats, the public, boards, Google, Pip
   or any dressing (S2 has no her: 0 % teal). Anchor plum `#36223A`: her dark office window (S2's ringed window), hair, gunwale stripes, board stiles,
   near silhouettes, ~5 % (cap 8 %); never lamps, railings, birds (override the canal kit defaults), black, a whole hull, a big dark slab. Pop sun
   orange `#EE6A2E`: the sun disc only (SUN0-2, S3/S8 low suns, the APRIL 2026 disc), 1-3 %; never caption boxes, coats, signs, FOR LIFE, logos.
   Tokens >= the hero's C* 33: mustard `#D4A960` 44, leaves `#D6A563` 42 / `#B8714F` 39, lamp `#F7CF86` 42, line `#9A563C` 37, hair `#9A5A3E` 36,
   brick `#C9806A` 35 / `#A5604F` 34: confetti, patches < 1 % each, brick as hints and broken facades, never a field (dressing aims at C* <= ~23).
   V2S2 is **golden** (gold band, lamps off, October leaves); a light state changes only the bands below y 600, lamps and season, never a fill or the sky.
   Light: the low sun off-screen WEST = screen left (S2 is the film's one shot with no disc); flat colour shadows thrown right. [STYLE §1-2; TR §2; K1]
2. **People and sizes.** A near head-back is <= ~140 px WIDE measured at the shoulders (head + shoulders cut by the bottom; head ~55-65): the cap is the
   figure, not its head; K4 `NearBack` = 0.84 x hv x broad (0.93-1.1) wide, so hv <= ~150. Void: TR §5's S2 260-320 (S3 260-300, S6 240-300, S7
   200-260), K2 `S1_SHEET.seatedHeadPx.near` 250-330, the kit `S2Set` hv 280 / 304 (also S1_STEPS busts 262-316, v1's 240-330). Her 150-170 px (170 in
   S1/S4 at 100 px/m, 150 in S8, never < 130 carrying a change); standing extras <= ~260 px (mid band 110-260; far 15-60 fill only); biggest seated ~190
   (S2's staffer, >= 180). Look-alike: any extra with her signature (plum head, low bun, long coat, teal); no extra pairs hair `#3E2A3A` with a low bun or a
   long dark coat, no dark bun within ~300 px of her or the row. In S2 the newsagent stays <= 260 px. [STYLE §4; PB; K2 LEGIBILITY]
3. **A full frame.** V2S2 is BUSY: paused flat <= 40 %, objects >= 105 / Mpx, detail >= 34 %; life >= 3.5 medium events/s (>= 5 per film), no gap > 1 s,
   one small loop (the kiosk clock), a burst on a hero word every 6-10 s ("staff" 8.96: five panes + silhouettes). Paused at 216 px: no hole > ~200 px
   outside the band and top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists it; 12+ props and 3-4 planes; people (still ones count);
   >= 2 things cut by an edge; 8+ specific dressing items. Fix order: the world (things, layers, thin lines), then people, then motion. S2's bottom third:
   our towpath (flag courses, a sett channel, a drain, leaves), the A-board / bench legs, the planter of grasses cut left (x 0-230, y 1290-1650), the bike
   on a lamp-post cut bottom-right, small head-backs cut by the bottom (beanie, cap), a dog on a lead nosing a leaf (+ café chairs, paper bundles). Proof:
   `density.py <clip> --scenes ... --only V2S2`, `deadframes.py <clip>` (>= 8/10, no dead run > 0.40 s), `colour_meter.py <stills> --hero '#0B8577' --pop
   '#EE6A2E' --band 290,600`, camspeed, y 317-556 pure mint, the sheet beside ref 1 / v1 / the G5b pilot, a cold read. [STYLE §5; LD §0, §9; TR §5, §9]
4. **The opening and the clock.** f0: S1 in bare warm ink on paper under the frame-0 block, the sun half-coloured, Pip already in colour, her ink figure
   behind the glass door. Colour floods f1-f18 from SUN0 outward (disc, sky, roofs, brick and windows, water, boats, towpath and steps); her teal coat
   LAST at f18 (0.30 s). Voice "She" 0.12; first sound the pencil flood at 0.00, then the lamp click 0.40 and the exit ding 0.45 (doors open by 0.52).
   Expected: she walks out free into the gold (1.40 birds lift); reality overtakes at 2.00 ("And": G1 pops, one tick per ghost). 4.54-4.79 she and every
   ghost stop mid-stride, the ambience dips; 4.98 "life": the row takes ONE step, three bare outlines pop, birds lift, Pip ears-cover. Loop: S8's un-build
   38.82-39.08 onto S1's t < 0 bare state, Pip landing on f0's bollard, the block back at 39.04. Beats: `public/v2r/voice_words_heard.json` (HEARD clock);
   K2 and kit default times are FILM seconds (`useTime()` is shot-local: `<TimeShift by={-6.1}>` in S2). [TR §4; STYLE §6; BUILD §2-3]
5. **The Arcane crane and scale.** The owner's favourite: S1E1's rooftop (#55 @109.46). Shape: ONE dolly back + crane up + a ~70-80° arc round the
   figures on ONE ease, no other move or roll; the figures are the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0). V2S5: hold 20.55-21.30,
   `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40 (p 0.15 @21.75, 0.48 @22.16, 0.70 @22.43, 0.96 @23.02), hold to 24.00; a tree where the Pentagon will
   land (p 0.15-0.40), the lamppost wipe at peak speed 22.02-22.19, the light burst 22.24-22.33, the Pentagon clears the tree ON "Pentagon" 22.43 (plaque),
   the obelisk rises 22.54-23.02, a V of birds in the hold. Cues: nothing ends in frame; 5-7 planes each 2.2-3x smaller (S5: 6); far rows every 9-10 px;
   flat steps 0/12/22/40/65 % to the sky, ink full/full/hairline/none/none; feet 2-3 F below the horizon (> 3.5 F reads as a map); landmark 1.1-1.4 F over
   it (obelisk ~4x true); a cloud bank >= 1 W behind (tops >= 610), clouds 0-6 px/s. K2's end stranger (62 px at feet 1238, ~7 F) breaks the feet cue: L4
   builds to K2 with L4S §3's mitigation and checks at 216 px it never reads as a map; K2 changes only through the director. [STYLE §6; CG; TR §6]
6. **Cozy enclosure and the held camera.** Held, not shut: masses on 2-3 sides, ONE opening the subject faces, mass 35-70 % of the frame and >= 40 % of
   the perimeter, something in the top gutter (y 0-290), >= 1 sign of care, one low flat lamp pool (<= 2 rings), busy edges and a calm never-empty
   centre. Our sky (31 %) is the caption field, so it is the ONE void: enclosure comes from masses below y 600 and the side edges (S2: the kiosk left,
   the lamp-post right, the wing above, our bank below). Value sandwich: the darkest mass (L* 20-38) right behind the people's lane, the lane neutral
   (C* <= 15), bank and water light again. Cozy lane: one band both ways, 1-5 movers, a new one every ~1-2.5 s entering at an edge at cruising speed,
   half at rest, nothing coming at us. Float law: translation only, 8-15 px/s (peak 25), straight legs turning every 0.6-1.5 s, net within ±12 px, >= 40
   px overscan, back home when the move lands (S2's push about W2 is exact at 12.98). Never a zoom in a hold (1-4 px/s reads frozen; a zoom is a story
   move). Camspeed <= 7.5 px/f flat-ink moves, <= 15 detailed: `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15`. [STYLE §6; CS 3b]
7. **The band and zones.** Nothing ever in y 317-556; y 290-600 flat sky but for the named exceptions (S1's roof planting to 575, sun tops >= 575, S5's
   cloud bank / obelisk >= 610; above, S1's hero cloud y 120-280 and branch y 0-240); caption boxes reach y 299, so y 299-317 stays clear. Flyers and puffs
   keep to y >= 600 or the top gutter (`ceil={600}` over the kit's 580). Key reads x 120-880, y 290-1250; the rail x > 780 below y 840 (masses only, never
   Pip or a board); y 1250+ masses only, nothing to read. Captions: Patrick Hand 98 px, baselines 387 / 510, <= 2 lines, they POP in place. [STYLE §7; K2]
8. **Fair boards.** The identical pair is S7 GOOGLE SAYS and S8 SHE SAYS: same face at B (x 150-630, y 700-1220), sunset light, type, pen build and clack,
   Pip pose at the bollard (700, 1205), ONE story move before the key line, a lamp run on each key word. Deal board: the full clause at the cut 24.00,
   the purpose line pops ON "any" 24.03, both readable to 28.06. Quote marks only on F5 "for fear of retaliation", F10, the full 24-word F11 clause, F13
   "AI principles", F14 "of any kind", F16 "human oversight", F18. Google's beat: no irony, never lit on "facts", never in S8, uninterrupted 28.31-32.70.
   Every board, tag, post, news box and plaque: L5 (K3); type scale header 60 (TOLD THE BBC 56), key 56, body 34 / 30, credits 20 / 18. S2's stand-in
   swaps to K3's `ToldTheBBCBoard`. [STYLE §7; TR §5, §8; boards README]
9. **Line, texture, edges.** Ink `#2B1B0A` only: 4.8 / 3.4 / 2.2 / 1.6 px by depth; figures >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6, smaller
   fill only; near backs 4.8, ghosts 2.2, Pip ~3.4; far planes none. 20-40 % of each contour open; corners overshoot 3-15 px; lines > 400 px in 2-4
   segments (6-16 px gaps), 0.3-1° off-axis; fills misregistered 2-5 px, one offset per object; shade a flat polygon one step darker, no outline. Texture
   OFF. A big field is filled with long tone-on-tone marks (ripple dashes 15-55 px, stone dabs 25-80 px, leaves), never texture. Paper edges OFF; if asked:
   `paint-subtle`, never in y 0-620 or beside the band, sides from y >= 640, rects kept round her, Pip, ghosts, boards; the stock preset puts 14-25 px of
   paper at the TOP: fix that first. [STYLE §3]
10. **The NEVER list.** Rejected cut: rooms / desks / papers as the stage, big front-facing people with faces, posed busts, speech bubbles and a "FACTS"
    bubble, three palettes, a locked camera with long holds, props instead of events, text as slides, her cat instead of Pip, a beige frame 0; plus reused
    assets and big models of people. Fairness: V1 war imagery · V2 Google lettering / products in the clause frame, screens, deliveries · V3 villains,
    glow or rim, dolly-zoom · V5 "for life" quoted or without SHE SAYS · V6 a drawn contract · V7 tape, zips, muzzles, chains, cages · V8 gavels, stamps,
    courtrooms · V9 the purpose line without the clause · V10 blank cheques, infinity, "secret" · V11 staff as a crowd or count, empty desks · V12 cameras,
    eyes, guards, a camera inside Google watching her · V13 her in Washington · V14 irony on Google's beat · V15 logos, BBC styling, flags · V16 charts for
    "heading" · V17 excluded names / words. Rendering: gradients, glow, opacity, fades; texture or boiling lines; a zoom in a hold; roll / compound move /
    cut mid-move. Flash: never > 3 flashes in any 1 s (WCAG 2.3.1): a lamp or window switches ONCE; drop the canal `Lamp`'s 3-frame flicker from S7's 30.04
    and S8's 37.18 runs; S2's five clicks are single steps. [STYLE §9, §5]
11. **Pip.** 86-120 px (>= 44 in S5's end); body `#9497D8`, shade `#7579C0`, inner ear / cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose stroke per
    pose, 2-3 gaps, ~3.4 px, fills 3 right / 2 down; never in y 317-556, the rail, over her, within 200 px of the F11 clause, never furniture or a gag
    near harm. Jobs: watch, lead the eye (turn BEFORE the voice names it), react ONCE, idle always, hop across cuts. S2: lands on the railing post (590,
    1050) by 6.70; its ONE reaction: the head turns to the wall on "But" (8.30, heard 8.44); hops at 12.85 on `PIP_HOP_S2_S3` (to S3's seat (462, 878) at
    13.10, apex 50 px; mid-air at the cut 12.98). Arcs stay at y >= 600; S3 exits through the LEFT edge at y 620-700. One Pip at a time: S1 draws it from
    t >= 0 only (S8's lands on f0's bollard in the t < 0 underlay); S7 -> S8 it rides S7's wiping boat in. [STYLE §4; TR §3; K2 PIP]
12. **The references.** Reference 1: the line, flat misregistered fills, open contours, small backs (heads 40-55), outline = not yet real, the cat in every
    shot, the loop; never its polaroid card, page-scroll captions, card flips, locked camera. v1: one sunny world under the mint caption sky, a working
    sun, Pip on a bollard across cuts, signage with sources, a new event every few frames; never its big near backs (240-330), the 2.2 s caption roll, its
    sets / Pip / palette. Reference 2: crowds from behind, the animal low looking where we should; never its big figures or dissolves. The G5b pilot: how
    full "full" is (flat 18-24 %, detail 50-56 %), never its content. The enclosure photo: one tall side, one soft side, a closed vista (H:W ~1:1); never
    its grey / olive. Palette refs: COLOUR only (page 51-82 %, one hero, an aubergine anchor, tiny pops), never their faces or olive. Texture ref: thin lines
    in key places, never halftone. Sketchbook: the loose architectural line, never its hatching or grey wash. Arcane: environment, camera shape, scale cues
    only; never footage, faces, night, glow, haze, source speed. Compare at 216 px wide (body text at ~390 px), frames extracted to scratch with
    `ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png`; never commit reference frames. [STYLE §8; CMN]
