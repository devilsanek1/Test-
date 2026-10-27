# Style check, lane L5 (K3 boards + V2S6 the gate + V2S7 Google says), 2026-10-27

1. **Colour jobs.** Sky = caption field mint `#BCDCCF` (L* 85 / C* 13; high step `#CFE6DC`): the whole top y 0-600 in every light state; never anything drawn in
   y 317-556, never a gradient or a second sky colour. Hero canal teal `#0B8577` (50 / 33): HER only (coat, front door, window frame); never on boards / signs /
   Google / the Pentagon / Pip / the public / boats (none in S6-S7: she is not in them). Anchor plum `#36223A` (17 / 19, ~5 %, cap 8 %): her dark window, hair,
   gunwale stripes, BOARD STILES, near silhouettes; never a whole hull, never lamps / railings / birds (override the canal kit defaults), never black or a big
   dark slab. Pop sun orange `#EE6A2E` (61 / 74, 1-3 %): the sun disc only (my SUN2); never caption boxes, coats, signs, props, logos, Google, the Pentagon.
   Tokens at or above the hero's C* 33: mustard `#D4A960` 44, leaves `#D6A563` 42 / `#B8714F` 39, lamp `#F7CF86` 42, line `#9A563C` 37, hair `#9A5A3E` 36,
   brick `#C9806A` 35 / `#A5604F` 34: confetti patches < 1 % each (dressing aims at C* <= ~23), brick as broken facades and hints, never a field.
   Light states (K1 `SHOT_LIGHT`): S6 `april` (mint over the high step `#CFE6DC` + gold band, lamps off, blossom), S7 `sunset` (= S8's: sunset `#F3C6A6`,
   dusk mint `#B3CDD2` late, lamps coming on, October). A state changes only the bands below y 600, the lamps and the season dressing; never the mint sky,
   never a fill or the palette. Light: each shot's own sun, both at SUN2 (260, 620) r 45, screen-LEFT (S6 morning sun east, S7 sunset west); shadows fall
   right. [STYLE §2; TR §2; K1 `LIGHT`]
2. **People and sizes.** A near head-back (head + shoulders cut by the frame bottom) is <= ~140 px WIDE AT THE SHOULDERS (the whole figure, not the head; head
   ~55-65 px); `NearBack` width = 0.84 x hv x broad 0.93-1.1, so hv <= ~150. Void now: TR §5 near heads (S6 240-300, S7 200-260, S2 260-320, S3 260-300), K2
   `S1_SHEET.seatedHeadPx.near` 250-330 / `S6.nearHeads` 240-300, canal `S1_STEPS` busts 262-316 and `S2Set` hv 280 / 304, v1's 240-330. Her: 150-170 px
   (170 in S1 / S4, 153 at the door, ~150 in S8; never < 130 while carrying a story change). Tallest standing extra ~260 px (mid band 110-260; K4 `Person`'s
   400 is not allowed). Biggest seated ~190 px (S2's staffer, >= 180). A forbidden look-alike: any teal, or the darkest hair `#3E2A3A` (= G1's head, ΔE 6.5
   from her plum) with a low bun or a long dark coat; no dark bun within ~300 px of her or the row. [STYLE §4; LD §4; L1]
3. **A full frame.** S6 = BUSY: paused flat <= 40 %, objects >= 105 / Mpx, detail >= 34 %; life >= 3.5 medium events/s, no gap > 1 s, one small loop, a
   burst (10+ items in ~4 frames of 30, <= 0.5 s settling) on a hero word (S6: the shrub's petals on "any" 24.03). S7 = DENSE-CALM: flat <= 30 %, detail >= 33 %,
   objects >= 120; `--cozy` movers >= 2 (aim 2-4), empty <= 5 %, cv <= 0.3; one quiet ambient element. Paused at 216 px: no hole > ~200 px outside the band
   and the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists; a wide holds 12+ props, 3-4 planes, people, >= 2 things cut by an edge,
   8+ dressing items; `deadframes` >= 8/10, no dead run > 0.40 s. Fix order: the world (things, layers, lines), then people, then motion. Bottom thirds: S6 the
   kerb + tulip beds, three readers' head-backs cut by the bottom (hv <= ~150) crossing with the truck, bollards and chain, the shrub, a bike rack + bench in
   the rail; S7 two cafe tables with seated backs cut bottom-left, a bike rack, a planter of grasses, paving joints, the fountain basin's rim bottom-right.
   Proof: `density.py <clip> --scenes ... --only V2S6` (S7 with `--cozy`, judged on its row), `deadframes.py <clip> --scenes ...`, `colour_meter.py <stills>
   --hero '#0B8577' --pop '#EE6A2E' --band 290,600`, `camspeed.py --frames <dir> --fps 60 --limit 15` (7.5 flat-ink), y 317-556 pure mint every frame, the
   paused sheet beside ref 1, v1 and the G5b pilot, a cold read. [STYLE §5; TR §5, §9; LD §0, §9]
4. **The opening and the clock.** f0: S1 in bare warm ink on paper under SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452) + the
   source (20 px, 550); the sun half-coloured and Pip already in colour; her ink figure mid-step behind the glass door. Colour f1-f18 floods from SUN0: the
   disc, the sky f2-5, far roofs + bridge f4-8, brick / fins / lit windows f6-12, water f9-13, boats f11-14, towpath + steps' people f12-17, her teal coat LAST
   f18 (0.30 s). Voice "She" 0.12 s; the first sound is the pencil flood at 0.00 (no music to 6.10); lamp click 0.40, exit ding 0.45. Expected: her window
   dark 0.40, the doors slide 0.45-0.52, she walks out free 0.97, birds lift 1.40; reality from 2.00 ("And": G1), one ghost per clause. 4.54-4.79: she and every
   ghost stop mid-stride, the ambience dips (water, boats, birds go on); 4.98 "life": the row takes ONE step, three bare outlines pop in, birds lift, Pip
   ears-cover. Loop: S8 ends on her lit window at W (860, 700) under a held 1.05 push about W, un-builds 38.82-39.08 onto S1's t < 0 bare state (f0 motions
   3-4 frames early; the words back at 39.04). Beats: `public/v2r/voice_words_heard.json` (the HEARD clock); K2 and kit default times are FILM s, `useTime()`
   is shot-local (`TimeShift` or t = film - start). [STYLE §6; TR §4; BUILD §2-3]
5. **The Arcane crane and scale.** The owner's favourite: Arcane S1E1's rooftop crane (CG #55 @109.46: two small backs end tiny over a vast city). SHAPE: ONE
   dolly back (never a zoom) + crane up + a ~70-80° arc round the figures on ONE ease, no other move, no roll; the figures are the pivot (parallax far 1.0, mid
   0.85, near 0.4, deck 0). V2S5: held 20.55-21.30; `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40 (p 0.15 @21.75, 0.48 @22.16, 0.70 @22.43, 0.96 @23.02);
   hold to 24.00. Beats: p 0.15-0.40 a big tree where the Pentagon will land; the lamppost wipe at peak speed 22.02-22.19; p 0.55-0.62 a light burst (the
   cloud bank); p 0.70 the Pentagon clears the tree ON "Pentagon" + the plaque; p 0.77-0.96 the obelisk rises; 23.08 windows warm; a V of birds in the hold.
   Cues: nothing ends in frame (cut by all 4 edges); 5-7 planes each 2.2-3x smaller (S5: 6); flat steps 0 / 12 / 22 / 40 / 65 %, ink full, full, hairline,
   none, none; far band packed (rows every 9-10 px); feet 2-3 F below the horizon; one huge-yet-far landmark 1.1-1.4 F up (obelisk ~4x true size) on the palest
   cloud, a bank >= 1 W (tops >= 610); huge = slow (clouds 0-6 px/s); 3 speed tiers of life, none in the city. K2's end stranger (62 px at feet 1238, ~7 F)
   breaks the 2-3 F cue; K2 changes only via the director: L4 builds to it with L4S §3's mitigation and checks at 216 px it never reads as a map. [STYLE §6; CG]
6. **Cozy enclosure and the held camera.** Held, not shut: brick, bank, boats, steps on 2-3 sides; ONE opening the subject faces; enclosing mass 35-70 % of the
   frame and >= 40 % of its perimeter; something in the top gutter (y 0-290); >= 1 sign of care; busy edges, a calm never-empty centre; one low flat lamp pool
   (<= 2 rings, lighter inward); rounded inside, hard outside. Our sky (y 0-600, 31 %) is the caption field, the only void, so the enclosure comes from masses
   below y 600 and the side edges. Value sandwich: the darkest mass (L* 20-38) right behind the people's lane, the lane neutral (C* <= 15), bank and water light
   again. The cozy lane (S7): life through ONE band both ways, 1-5 movers, a new one every ~1-2.5 s, entering / leaving at an edge or behind a mass at cruising
   speed, half the people at rest, NOTHING comes at the viewer. Float law: translation only, 8-15 px/s (peak 25), straight legs turning (eased) every 0.6-1.5
   s, net within ±12 px of home, >= 40 px overscan, no zoom / rotation / parallax; home (0) when the story move lands (S7: `V2S7_pip.ts` keys, home at 30.04).
   No zoom in a hold (1-4 px/s reads frozen; a zoom is a story move >= 3 % in <= 2 s, or the big move). `camspeed` <= 7.5 px/f long flat-ink moves, <= 15
   detailed: `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15`. [STYLE §5-6; CS §1-3b]
7. **The caption band and zones.** Nothing ever in y 317-556 (the block x 95-945 on the flat mint). y 290-600 is flat sky but for the named exceptions (S1's roof
   planting to 575, sun tops >= 575 (SUN2's top is 575), S5's cloud bank / obelisk tops >= 610; above, S1's hero cloud y 120-280 and branch y 0-240); y 299-317
   stays clear because the caption boxes reach y 299. Flyers and puffs: y >= 600 or the top gutter: override the canal kit's `ceil` 580 with `ceil={600}`.
   Key reads x 120-880, y 290-1250; the right rail x > 780 below y 840 (masses only); y 1250+ masses, never quiet, nothing to read. Captions: Patrick Hand
   ('CaptionHand') 98 px on baselines 387 / 510, <= 2 lines, centred ink on the mint, popping in place (page, line, box: never a roll-in, scroll or clipped
   letter), one peach box `#F6B892` per line ~0.06-0.1 s before its word, a change every <= 1.5 s. [STYLE §7; K2 `UI`; BUILD §3]
8. **Fairness on the boards.** The identical pair: S7 GOOGLE SAYS and S8 SHE SAYS: the same StatementBoard face at B (x 150-630, y 700-1220, legs 1250), the
   same frame seed / colours / shadow (one sunset light), type scale and weights, pen build and clack, the same Pip pose at the bollard (700, 1205), ONE story
   move each before its key line (S7's 4 % push on "principles", S8's truck before "her words"), a lamp run on each key word (30.04 / 37.18). The deal board
   (S6) also equals Google's in face, frame, type and light (TR §8, my brief). Deal timing: frame, tag, the FULL clause and the credit up at the cut 24.00;
   the purpose line pops ON "any" 24.03 (never before the clause); F12 on "veto" 26.40; readable to 28.06, drifting 24.6 px/s parallel to the lens. Quote
   marks only on: "for fear of retaliation" (F5), "any lawful government purpose" (F10), the full 24-word oversight clause (F11), "AI principles" (F13), "of
   any kind" (F14), "human oversight" (F16), "talking about facts is not criticising" (F18). Google's beat: never irony, a sting, a Pip reaction, never lit
   on "facts", never in S8, never answering her clause; uninterrupted to 32.70 (its full 4.85 s, 28.31-33.16). Every board, tag, post, news box, plaque: K3,
   ONE owner, L5. Type: keys >= 56 px (headers 60), body 30-34, credits 18-20. [STYLE §7; TR §5, §8]
9. **Line, texture and edges.** Ink `#2B1B0A` only: front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px; figures >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6,
   smaller fill only; near backs 4.8; ghosts 2.2; Pip ~3.4; far planes none. 20-40 % of each contour open; corners overshoot 3-15 px, structural lines run on;
   lines over 400 px in 2-4 segments (6-16 px gaps), 0.3-1° off-axis. Fills flat, misregistered 2-5 px, one offset per object (Pip 3 right / 2 down); shade a
   flat polygon one step darker, no outline. Texture OFF (static linework per seed). Big fields: a few long tone-on-tone marks (water dashes 15-55 x 6-8 px,
   ~10-15 per 100 x 100; stone dabs 25-80 px one step darker; lane marks; leaves). Paper edges OFF; if asked: `paint-subtle`, never in y 0-620 or by the band,
   sides from y >= 640, clear of her, Pip, ghosts, boards and signs; the stock preset puts 14-25 px of paper at the TOP: fix that first. [STYLE §3; SB; ED]
10. **The NEVER list.** Rejected: rooms / desks / papers as the stage; big front-facing people with faces, posed busts; speech bubbles, a "FACTS" bubble; three
    palettes, saturated washes; a locked camera, long holds; props instead of events (badge, highlighter, a scroll of years); text as slides (source bars,
    legal paragraphs, bullet lists); her cat instead of Pip; a beige frame 0; reused assets; big near backs. Fairness: V1 war imagery (weapons, drones,
    crosshairs, targets...); V2 Google letters / products / vans in the clause frame, racks, screens, deliveries, targeting; V3 villains (sinister HQ, looming,
    stings, glow or rim on Google / the Pentagon, dolly-zoom); V4 a likeness of her; V5 "for life" quoted, stamped or without SHE SAYS; V7 tape, padlocked
    lips, zips, chains, cages; V8 gavels, ILLEGAL / VOID, courtrooms; V9 the purpose line without the full clause; V10 blank cheques, infinity, "unlimited",
    "secret"; V12 cameras, eyes, guards, escorts; V13 her in Washington; V14 irony on Google's beat; V15 logos, BBC styling, seals, flags; V16 charts for
    "heading"; V17 Hegseth, Trump, Israel, Gaza, "kill", "bomb". Rendering / camera: gradients, glow, blur, opacity, fades, dissolves; a zoom in a hold; roll, a
    compound or source-speed move, a cut mid-move; night-black frames, red skies, a high angle on one person. Flash rule: never > 3 flashes in any 1 s at any
    size (WCAG 2.3.1): a lamp, bulb or window switches on ONCE, one bulb twinkles at a time; drop the canal `Lamp`'s 3-frame flicker from S7's 30.04 string-light
    run and S8's 37.18 lamp run; S6's 27.08-27.80 window ticks are single steps. [STYLE §5, §9; TR §8]
11. **Pip.** 86-120 px (>= 44 only in S5's end frame); body `#9497D8`, shade `#7579C0`, inner ear / cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose
    continuous tapered stroke per pose (~3.4 px) with 2-3 gaps (head top, base, the right ear root >= 58 px), fills 3 right / 2 down. Never in y 317-556, the
    rail (x > 780 below y 840), over her, or within 200 px of the F11 clause; no gag near harm; never furniture. Jobs: in every shot, watching her or the story
    object, its head turning BEFORE the voice names the next thing, idle always, ONE reaction at most, hopping across every cut. Mine: S6 lands on the corner
    post (770, 720) by 24.12, ONE ear flick on "veto" 26.50 (flick 'A', no droop, idle flick off), hops 27.95; S7 NONE (sit-watch at the bollard (700, 1205),
    no tilt or nod on Google's beat). Cuts: arcs at y >= 600 (head top >= 600), the same screen arc on both sides (S6 -> S7: `pipHopAt`, apex ON the cut at
    (732, 702), lands 28.22); S3 exits through the LEFT edge at y 620-700. ONE Pip at a time: S1 draws it only from t >= 0 (S8's lands on f0's bollard in the
    underlay); S7 -> S8: S7's Pip is covered by the wiping boat by ~32.84 and S8's leaps from behind the stern at 33.00 (the band-safe wiper carries none: on
    the roof its head would be in the band; L5 and L6 agreed). [STYLE §4; TR §3; K2 `PIP`]
12. **The references** (at 216 px wide beside our frames; `ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png` into scratch; never commit their
    frames). Reference 1: THE style: line, flat misregistered fills, open contours, small simple backs (heads 40-55 px), outline = not yet real, the cat in
    every shot across every cut, the sun on top, scenes building to the words, the loop; NOT the polaroid card and its captions, page scrolls, 3D flips, a
    locked camera, silence. v1: one sunny world under the mint sky, a working sun, Pip hopping across cuts, signage with sources, a new event every few
    frames, carried cuts, held scale peaks; NOT its 240-330 px near backs, the caption roll, its coloured frame 0, 30 fps, its night beat, its sets / Pip /
    palette. Reference 2: crowds from behind, the animal low in frame looking where we should, one journey; NOT its big near figures, dissolves, giant-object
    metaphors. v3 G5b pilot: how full "full" is (flat 18-24 %, detail 50-56 %); NOT its content, palette, kit. Enclosure photo: one tall side, one soft low
    side, a curving lane closed by a tower, H:W ~1:1, sky ~27 %; NOT grey rain, realism, olive stone, a wall cut by the top. Palette refs: COLOUR only (page
    51-82 %, hero 4-10 %, aubergine anchor ~5 %, orange pops 1-3 %); NOT their faces, olive / khaki, pink wash, halftone. Texture ref: thin tapered lines only
    in key places; NOT halftone, olive. Sketchbook: the loose architectural line (frame 0, the un-build); NOT hatching, grey wash, a monochrome finish.
    Arcane: ENVIRONMENT ONLY (camera shape, small backs before a vast view, scale cues, a big flat sky); NOT footage or tracing, faces, night, red skies, glow,
    beams, haze, painterly texture, source speed. [STYLE §8]
