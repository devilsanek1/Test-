# Style check, lane L6 (V2S8 "Her words" + the loop seam), answered from the sources, 2026-10-27

1. **Colour jobs.** Sky mint `#BCDCCF` (high step `#CFE6DC`): the whole top y 0-600 in every light state; never anything drawn in y 317-556, never a gradient
   or a second sky colour. Hero canal teal `#0B8577`: HER only (coat, her front door, her window frame); never boats, the public, boards, Google, Pip or
   dressing, and never a bigger her to raise the %. Anchor plum `#36223A` (~5 %, cap 8 %): her hair, gunwale stripes, board stiles, near silhouettes; never a
   whole hull, never lamps / railings / birds (override the canal kit), never black or a big dark slab. Pop sun orange `#EE6A2E` (1-3 %): the S8 low sun disc
   only; never caption boxes, coats, signs, props. Tokens at or above the hero's C* 33: mustard `#D4A960` 44, leaves `#D6A563` 42 / `#B8714F` 39, lamp
   `#F7CF86` 42, line `#9A563C` 37, hair `#9A5A3E` 36, brick `#C9806A` 35 / `#A5604F` 34: confetti, < 1 % patches each, brick as broken hints, never a field.
   S8 is in the SUNSET state (= S7, V3): a light state changes only the bands below y 600 (sunset + dusk mint late), the lamps (coming on) and the season,
   never a fill or the sky. Light comes from S8's own low sun ahead in the west (SUN8 over the canal, upper left of centre): shadows fall toward us.
   [STYLE §2; TR §2; K1 `LIGHT`]
2. **People and sizes.** A near head-back is <= ~140 px WIDE at the shoulders (head ~55-65), measured as the figure's width, which allows K4 `NearBack`
   hv <= ~150 (0.84 x hv x broad). Void: TR §5's S2 260-320 / S7 200-260 px near heads, K2 `S1_SHEET.seatedHeadPx.near` 250-330, canal `S1_STEPS` busts
   262-316 (and v1's 240-330). She is 150-170 px (150 at her door in S8, never < 130 while she carries a beat); standing public 110-260 px, never above ~260;
   seated up to ~190 (S2's staffer). S8's cafe owner and two readers are small backs about her size (~150 px). A look-alike: an extra with her signature
   (plum / darkest hair `#3E2A3A` + a low bun, a long dark coat, teal), or any dark bun within ~300 px of her. [STYLE §4; PB; N2]
3. **A full frame.** S8 is DENSE-CALM: paused flat <= 30 %, detail >= 33 %, objects >= 120 / Mpx; life `--cozy`: movers >= 2 (aim 2-4), empty <= 5 %, cv <= 0.3,
   one quiet ambient element. Checks at 216 px: no hole > ~200 px outside the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists it;
   12+ props, 3-4 planes, people; >= 2 things cut by an edge; 8+ specific dressing items; `deadframes` >= 8/10 with no dead run > 0.40 s. Fix an empty frame
   world first (things, layers, lines), then people, then motion. S8's bottom third: the cafe boat's stern deck bottom-left (two small tables, mugs, a folded
   chair, a potted bay, a coiled rope), paving with leaves and a drain, a planter and a lamp-post foot bottom-right; no near heads. Proof:
   `density.py <clip> --scenes src/v2r/film/scenes.json --only V2S8 --cozy`, `deadframes.py <clip> --scenes src/v2r/film/scenes.json`, `colour_meter.py <stills>
   --hero '#0B8577' --pop '#EE6A2E' --band 290,600`, `camspeed.py --frames <dir> --fps 60 --limit 15`. [STYLE §5; TR §5, §9]
4. **The opening and the clock.** f0 = S1 in bare warm ink on paper under SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. + "Source: BBC News, 21 Oct 2026", the
   sun half-coloured, Pip in colour. Colour floods from SUN0 f1-f18, her teal coat LAST at f18 (0.30 s); voice 0.12 s; the exit ding 0.45 s. Expected: her
   window dark 0.40, doors slide 0.45-0.52, she walks out free, birds lift 1.40; reality overtakes from 2.00 (G1). 4.54-4.79 she and every ghost stop, the
   ambience dips; 4.98 "life": the row takes one step, three bare outlines pop, birds lift, Pip ears-cover. The loop: S8 ends on her lit window at W (860, 700)
   under the 1.05 push, un-builds 38.82-39.08 (the sky slab dropped, ghosts and W last) onto S1's t < 0 bare state; the words return at 39.04. Beat times:
   `public/v2r/voice_words_heard.json`; K2 and kit default times are FILM seconds (useTime() is shot-local: TimeShift or t = film - start). [TR §4; STYLE §6]
5. **The Arcane crane and scale.** The owner's favourite: S1E1's rooftop pull-back (#55 @109.46). Its shape: ONE dolly back + crane up + a ~70-80° arc round
   the two small backs on one ease, no roll; the figures are the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0). V2S5: held 20.55-21.30, ONE
   `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40; beats: bright slot, the tree hiding the landmark, the lamppost wipe at peak speed 22.02-22.19, a light
   burst, the Pentagon clears the tree ON "Pentagon" 22.43, the obelisk rises, hold to 24.00. Cues: nothing ends inside the frame; 5-7 planes each 2.2-3x
   smaller; flat steps 0 / 12 / 22 / 40 / 65 %; ink full / full / hairline / none / none; feet 2-3 figure heights below the horizon; a cloud bank >= 1 W, tops
   >= y 610; huge = slow (clouds 0-6 px/s). K2's 62 px end stranger at feet 1238 (~7 F) breaks the feet-to-horizon cue: L4 builds to it with L4S §3's
   mitigation until the director changes K2, checking at 216 px it never reads as a map. [STYLE §6; CG]
6. **Cozy enclosure and the held camera.** Held, not shut: mass 35-70 % of the frame and >= 40 % of the perimeter, ONE opening the subject faces, something in
   the top gutter (y 0-290), >= 1 sign of care, one low flat lamp pool (<= 2 rings). Our sky (y 0-600, 31 %) is the caption field and the only void, so the
   enclosure comes from masses below y 600 and the side edges. The value sandwich: the darkest mass (L* 20-38) right behind the people's lane, the lane neutral
   (C* <= 15), bank and water light again. S8 is the LANE (the owner's photo, H:W 1:1, ~27 % sky): one tall side (her terrace), one soft low side (the canal and
   the cafe boat), a closed end (her house at the bend). Float law: translation only, 8-15 px/s (peak 25), eased legs turning every 0.6-1.5 s, net within
   +-12 px of home, >= 40 px overscan, no zoom / rotation / parallax; never a zoom in a hold (1-4 px/s reads frozen; a zoom is a story move >= 3 % in <= 2 s).
   camspeed <= 7.5 px/f long flat-ink moves, <= 15 detailed: `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15`. [STYLE §6; CS]
7. **The caption band and screen zones.** Nothing is ever drawn in y 317-556 (x 95-945): roof, cloud, bird, wire, puff, Pip's hop, life. y 290-600 is flat sky
   but the named exceptions (sun tops >= 575, S1's roof planting to 575, S5's cloud bank / obelisk >= 610; above, S1's hero cloud and branch); y 299-317 stays
   clear because the caption boxes reach y 299. Flyers and puffs keep to y >= 600 or the top gutter: `ceil={600}` over the canal kit's 580. Key reads x 120-880,
   y 290-1250; the right rail x > 780 below y 840 holds masses only; y 1250+ holds masses, nothing to read. Captions: Patrick Hand 98 px, baselines 387 / 510,
   <= 2 lines, centred, dark ink on the mint, popped in place (page, line, box), never rolled or clipped. [STYLE §7; K2 `UI`]
8. **Fairness on the boards.** The identical pair: S7 GOOGLE SAYS and S8 SHE SAYS: the same StatementBoard face at B (150-630 x 700-1220), sunset light, type
   scale, fill-first pen build, ONE clack and ONE pen, the same Pip pose at the bollard (700, 1205; S7's 'sit', facing 'backLeft'), ONE story move before the key
   line (S7's 4 % push, S8's truck), a lamp run on each key word. The deal board: the full clause up at the cut 24.00, the purpose line ON "any" 24.03, both
   readable to 28.06. Quote marks only on F5, F10, the full F11 clause, F13 "AI principles", F14 "of any kind", F16 "human oversight", F18 "talking about facts
   is not criticising". Google's beat: its full 4.85 s, uninterrupted to 32.70, no irony, no Pip reaction, never lit on "facts", never in S8. Every board, tag,
   post, news box and plaque: K3, one owner (L5). Type: keys >= 56 px (216 px read), body 30-34, credits 18-20 (~390 px read). [STYLE §7; TR §8]
9. **Line, texture and edges.** Ink `#2B1B0A` only: front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px; figures >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6;
   near backs 4.8; ghosts 2.2; Pip ~3.4; far planes none. 20-40 % of each contour open; corners overshoot 3-15 px; lines over 400 px in 2-4 segments (6-16 px
   gaps), 0.3-1° off axis. Fills flat, misregistered 2-5 px, one offset per object; shade = a flat polygon one step darker, no outline. Texture OFF. A big field
   carries a few long tone-on-tone marks (ripple dashes 15-55 px, stone dabs 25-80 px, leaves), drawing not texture. Paper edges OFF; if asked: `paint-subtle`,
   never in y 0-620 or beside the band, sides from y >= 640, keep rects round her, Pip, the ghosts and boards; the stock preset puts 14-25 px of paper at the
   TOP: fix that first. [STYLE §3]
10. **The NEVER list.** Rejected: rooms / desks as the stage, big front-facing faces, squiggle bubbles and a "FACTS" bubble, three palettes, a locked camera
    and long holds, props instead of events, text as slides, her cat instead of Pip; plus big models / waist-up, near backs > ~140 px, a beige frame 0.
    Fairness: war imagery (V1), Google signs in the clause frame (V2), villain light / dolly-zoom (V3), "for life" quoted (V5), gag imagery (V7), gavels (V8),
    purpose line without the clause (V9), "secret" / blank cheques (V10), cameras / eyes / guards (V12), her in Washington (V13), irony on Google's beat
    (V14), logos (V15), charts for "heading" (V16). Rendering / camera: gradients / glow / opacity / fades, texture and boiling lines, a zoom in a hold, roll
    or a compound move. Flash: never more than 3 flashes in any 1 s: a lamp, bulb or window switches on ONCE (drop the canal Lamp's 3-frame flicker) in
    S7's 30.04 and S8's 37.18 runs; one bulb twinkles at a time. [STYLE §5, §9]
11. **Pip.** 86-120 px (>= 44 only in S5's end frame); body `#9497D8`, shade `#7579C0`, inner ear / cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose
    stroke per pose, 2-3 gaps, ~3.4 px. Never in y 317-556, the rail (x > 780, y > 840) or over her; >= 200 px from the F11 clause; no gag near harm, not
    furniture. Its jobs: watch, turn its head before the voice names the next thing, react once, hop across every cut. S8's ONE reaction: ears down on
    "can't" 33.78 (looking up at W on "not" 37.70 is a lead). Cuts: arcs at y >= 600; S3 exits through the LEFT edge at y 620-700. One Pip on screen: S1
    draws none at t < 0 (S8's lands on f0's bollard in the underlay and becomes S1's frame-0 Pip); into S8 it rides S7's wiping boat (L5 draws no Pip on the
    band-safe wiper; S8 shows it on the stern deck and leaps off at 33.00). [STYLE §4; TR §3; K2 `PIP`]
12. **The references.** Reference 1: study the line, fills, open contours, small backs (heads 40-55 px), outline = not yet real, the cat crossing cuts, the
    un-build loop; never its polaroid card, page-scroll captions or card flips. v1: one sunny world, a working sun, Pip on a bollard, sourced signage, a
    new event every few frames; never its big near backs (240-330 px), its 2.2 s caption roll, its coloured f0. Reference 2: crowds from behind, the animal
    low looking where we should, one journey; never its big near figures or dissolves. G5b pilot: how full "full" is (flat 18-24 %, detail 50-56 %); never
    its winter / kit. Enclosure photo: one tall side, one soft side, a closed vista; never its grey, rain or a wall cut by the top. Palette refs: colour only;
    never their faces, olive or pink wash. Texture ref: thin tapered lines only where they carry form; never the halftone. Sketchbook: the loose line of f0 and
    the un-build; never hatching or a grey wash. Arcane: camera shape and staging, small backs before a vast view; never footage, faces, night, glow or its
    speed. Compare at 216 px wide; extract with ffmpeg (`-vf fps=2,scale=216:-2`) into scratch; never commit their frames. [STYLE §8; CMN]
