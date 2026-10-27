# Style check, lane L3 (V2S3 "Her window" + V2S4 "The walk home"), answered 2026-10-27 from the sources

1. **Colour jobs.** Sky = mint `#BCDCCF` (L* 85 / C* 13; high step `#CFE6DC`): the whole top y 0-600 in all four light states; never anything drawn in
   y 317-556, never a gradient or a second sky colour. Hero = canal teal `#0B8577` (50 / 33): HER only (her coat, her front door, her window frame), the one
   saturated subject; never boats, the public, boards, Google, Pip, props (and never a bigger her to "fix" the 5-15 %: her coat is ~0.3 % of a frame).
   Anchor = plum `#36223A` (17 / 19), ~5 % (cap 8 %): her dark office window, hair, gunwale stripes, board stiles, near silhouettes; never a whole hull, never
   lamps, railings or birds (the canal kit's defaults: override them), never black or a big dark slab. Pop = sun orange `#EE6A2E` (61 / 74), 1-3 %: the sun
   discs only (SUN0-2, the S3 and S8 low suns, the APRIL 2026 disc); never caption boxes, coats, signs, FOR LIFE, Google, the Pentagon. Tokens at or above
   the hero's C* 33: mustard `#D4A960` 44, leaves `#D6A563` 42 / `#B8714F` 39, lamp `#F7CF86` 42, line `#9A563C` 37, hair `#9A5A3E` 36, brick `#C9806A` 35 /
   `#A5604F` 34: confetti only, patches < 1 % each, brick as broken facades and hints, never a field; dressing aims at C* <= ~23. Mine: V2S3 = `sunset` (the
   sunset band `#F3C6A6` below y 600, lamps on, October), V2S4 = `lowSun` (the gold band `#F6D9BC`, the sun low on the far roofs, lamps off, October); a
   state changes only the flat bands below y 600, the lamps and the season, never the sky and never a fill (no relight). Light comes from each shot's own
   sun, west = screen LEFT: S3's low sun at left (~(96, 652)), S4's SUN1 (250, 650); short colour shadows fall east (screen right). [STYLE §2; K1 `LIGHT`]
2. **People and sizes.** A near head-back (head + shoulders cut by the frame bottom) is <= ~140 px WIDE, measured at the SHOULDERS (the figure, not the
   head; head ~55-65 px); K4 `NearBack` is 0.84 x hv x broad (0.93-1.1) wide, so hv <= ~150. Void: TR §5's S3 near heads 260-300 (and S2 260-320, S6
   240-300, S7 200-260), K2 `S1_SHEET.seatedHeadPx.near` 250-330 / `S6.nearHeads` 240-300 / `BOTTOM_THIRD`, the kits' `S1_STEPS` busts 262-316 and `S2Set` hv
   280 / 304, v1's 240-330. She is 150-170 px (170 in S4, 100 px/m; S3's silhouette 140: 137 at the match, >= 130 after the ease-back); the tallest standing
   extra ~260 px (mid band 110-260; K4 allows 400: don't); the biggest seated ~190 px (S2's staffer, >= 180). A forbidden look-alike pairs the darkest hair
   `#3E2A3A` (= G1's head, ΔE 6.5 from her plum) with a low bun or a long dark coat, or puts any dark bun within ~300 px of her or the row. [STYLE §4]
3. **A full frame.** Both my shots are DENSE-CALM: paused frame flat <= 30 %, detail >= 33 %, objects >= 120 / Mpx; life (`--cozy`) movers >= 2 (aim 2-4),
   empty <= 5 %, cv <= 0.3 (one slow swell <= 0.75), one quiet ambient element; the cozy lane: 1-5 movers both ways in ONE band, a new one every ~1-2.5 s,
   entering and leaving at an edge or behind a mass at cruising speed, half the people at rest, nothing coming at us. At 216 px a paused frame: is as full
   and specific as reference 1, v1 and the G5b pilot; has no hole > ~200 px outside the band and the top sky; no other flat region > 20 %; the y 1250-1920
   mass as TR §5 lists it; 12+ props, 3-4 planes, people; >= 2 things cut by an edge and 8+ specific dressing items (+ deadframes >= 8/10, no dead run >
   0.40 s). An empty frame is fixed world first (things, layers, thin lines), then people, then motion (never motion on a void). y 1250-1920: S3 = our
   moored narrowboat cut by both edges (roof ~1260-1330 with herb pots, a bike, a coiled rope, a chimney with smoke; sage cabin 1330-1580, plum stripe,
   cream portholes), our coping, our towpath 1640-1920 with two head-backs (<= 140 px wide) and a lamp-post foot bottom-right; S4 = our narrowboat beside
   us (sage cabin 1290-1660, plum stripe, cream portholes with curtains, the flower panel, fenders) over water 1700-1920 with the wake and floating leaves.
   Proof: `density.py <clip> --scenes src/v2r/film/scenes.json --only V2S3|V2S4 --cozy` (my clip-range renders use a clip-relative scenes file), `colour_meter.py
   <stills> --hero '#0B8577' --pop '#EE6A2E' --band 290,600`, `deadframes.py <clip> --scenes ...`, `camspeed.py --frames <dir> --fps 60 --limit 15` (7.5 for
   flat-ink moves), y 317-556 pure mint in every frame, the paused sheet beside ref 1 / v1 / G5b, a cold read by a viewer who read nothing. [STYLE §5; TR §5, §9]
4. **The opening and the clock.** Frame 0: S1 in bare warm ink on paper under SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452) +
   "Source: BBC News, 21 Oct 2026" (20 px, 550), the sun half-coloured and Pip already in colour, her ink figure mid-step behind the glass door. Colour floods
   f1-f18 shape by shape outward from SUN0 (disc, sky f2-5, far roofs + bridge f4-8, brick / fins / lit windows f6-12, water f9-13, boats f11-14, towpath and
   the steps' people f12-17), her teal coat LAST at f18 (0.30 s). The voice starts at 0.12 s ("She", f7); the first sound is the pencil flood at 0.00, the
   phone sound the exit ding at 0.45 (f27) as the doors start to slide. The expected thing: her window goes dark (0.40), the doors slide (0.45-0.52, "quit"),
   she walks out free into the gold (0.97), birds lift (1.40); reality overtakes it from 2.00 ("And": G1 pops ahead of her), a ghost per clause. 4.54-4.79
   the "...": she and every ghost stop mid-stride, the ambience dips (water, boats, birds go on); 4.98 "life": the row takes ONE step, three bare outlines pop
   beyond G6, birds lift off the far roofs, Pip ears-cover. The loop: S8 ends on her lit window at W (860, 700) under the 1.05 push about W (37.70-38.82: W =
   157.5 x 178.5 = S1's f0), un-builds 38.82-39.08 (fills shrink, ink retracts, the sky slab drops, ghosts and window last) onto S1's t < 0 bare state; f0's
   motions start 3-4 frames early; the words return at 39.04. Beat times: `public/v2r/voice_words_heard.json` (the HEARD clock); K2 / kit times are FILM s,
   `useTime()` is shot-local: my shots wrap themselves in `<TimeShift by={-start}>`. [TR §4; STYLE §6-7]
5. **The Arcane crane and scale.** The owner's favourite: Arcane S1E1's rooftop crane (#55 @109.46: two small backs end tiny over a vast city, "it has pretty
   much everything"). SHAPE: one dolly back (never a zoom) + crane up + a ~70-80° arc round the figures on ONE ease, no other move or roll; the figures are the
   pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0); suspense by progress: a bright slot in their eyeline, a mass hiding the landmark, a foreground wipe
   at peak speed, a light burst, the landmark landing as it slows, a hold >= 0.5 s. V2S5: hold 20.55-21.30, ONE `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40
   (p 0.15 at 21.75, 0.48 at 22.16, 0.70 at 22.43, 0.96 at 23.02), hold to 24.00; p 0.15-0.40 a big tree where the Pentagon will land, the lamppost wipe at
   peak speed 22.02-22.19, p 0.55-0.62 the light burst, p 0.70 the Pentagon clears the tree ON "Pentagon" 22.43 (plaque), p 0.77-0.96 the obelisk rises, 23.08
   windows warm, a V of birds in the hold. Scale cues: nothing ends inside the frame (something cut by all 4 edges); 5-7 planes each 2.2-3x smaller (S5: 6);
   the far band packed (rows every 9-10 px), detail peaking just under the horizon; flat steps 0 / 12 / 22 / 40 / 65 % toward the sky, ink full, full,
   hairline, none, none; feet 2-3 F below the horizon (past 3.5 F reads as a map); one huge-yet-far landmark 1.1-1.4 F over the horizon (the obelisk ~4x true
   size) on a cloud bank >= 1 W (tops >= 610); huge = slow (clouds 0-6 px/s); birds 24-44 px in 3 speed tiers. K2's end stranger (62 px at feet 1238, ~7 F)
   breaks the 2-3 F cue; K2 changes only through the director, so L4 builds to it with L4_spec §3's mitigation and checks at 216 px that it never reads as
   a map. [STYLE §6; CG S5; TR §6]
6. **Cozy enclosure and the held camera.** Held, not shut: brick, bank, boats on 2-3 sides, ONE opening the subject faces, the institutions far outside;
   enclosing mass 35-70 % of the frame and >= 40 % of its perimeter; something in the top gutter (y 0-290); >= 1 sign of care (her plants, the neighbour
   watering, herb pots); busy edges, a calm never-empty centre; one low flat lamp pool (<= 2 rings, lighter inward); rounded inside, hard outside. Our sky y
   0-600 (31 %) is the caption field and the only void (TR's dose over CS's 8-15 % sky), so the enclosure comes from masses below y 600 and the side edges
   (built tops >= 600). Value sandwich: the darkest mass (L* 20-38) right behind the people's lane so light figures pop, the lane neutral (C* <= 15), bank and
   water light again. The cozy lane: Q3. Float law: translation only, 8-15 px/s (peak 25), straight legs turning (eased) every 0.6-1.5 s, net within ±12 px
   of home, >= 40 px overscan, no zoom, rotation or parallax (one 10 px/s heading for seconds breaks it: my S3 float now turns, see below). Never a zoom in a
   hold: a 1-4 px/s push reads frozen; a zoom is a story move (>= 3 % in <= 2 s, on a line) or the one big move. Camera speed <= 7.5 px/frame on long
   flat-ink moves, <= 15 on detailed layers (S5's flat wipe ~41 by design): `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15`. [STYLE §5-6; CS 3b]
7. **Caption band and zones.** Nothing is ever drawn in y 317-556 (x 95-945; no roof, cloud, bird, wire, puff, Pip's hop, life); y 290-600 is flat sky but
   for S1's roof planting to y 575, sun tops >= 575 (S4's SUN1 top 585 is allowed), S5's cloud bank and obelisk tops >= 610 (and above it S1's hero cloud y
   120-280 and plane branch y 0-240); y 299-317 stays clear because the caption key boxes reach up to y 299. Flyers and puffs keep to y >= 600 or the top
   gutter (y < 290): pass `ceil={600}` over the canal kit's default 580. Key reads x 120-880, y 290-1250; the right rail x > 780 below y 840 (masses only: no
   text, Pip or board); y 1250+ holds masses only, never quiet, nothing to read. Captions: Patrick Hand (`public/fonts/CaptionHand.woff2`) 98 px, baselines
   387 / 510, <= 2 lines, centred, ink on the mint, one peach box `#F6B892` per line ~0.06-0.1 s before its key word (mine: she, AI, objected, military);
   they only POP in place (page, line, box), never roll, scroll or clip, a change every <= 1.5 s, in screen space. [STYLE §7; K2 `UI`]
8. **Fairness on the boards.** The identical pair: S7 GOOGLE SAYS and S8 SHE SAYS: the same StatementBoard face at B (x 150-630, y 700-1220), the same sunset
   light, type scale, pen build and clack, the same Pip pose at the bollard (700, 1205), ONE story move each before its key line (S7's 4 % push on
   "principles", S8's truck before "her words"), a lamp run on each key word. The deal board: the full F11 clause is up at the cut (24.00), the purpose line
   pops ON "any" (24.03), never before it, both readable to 28.06. Quote marks only on: "for fear of retaliation" (F5), "any lawful government purpose"
   (F10), the full 24-word oversight clause (F11), "AI principles" (F13), "of any kind" (F14), "human oversight" (F16), "talking about facts is not
   criticising" (F18); "for life" never. Google's beat: no irony, no Pip reaction, never lit on "facts", never in S8, never answering her clause; its full 4.85
   s, uninterrupted to 32.70. K3 has ONE owner, L5 (StatementBoard, the deal board, the tag, the fingerpost, NewsBox, Plaque, DoorSign); my post and tag use K3's
   `WorldText` + `TXT_PLATES` / `TXT_NAME_TAG` on its one scale (L5: fine), and a size off it changes only by a K2 REQUEST. Type scale: keys >= 56 px (read at 216
   px), body 30-34, credits 18-20 (read at ~390 px), headers 60. [STYLE §7; TR §8; K3 `TYPE`]
9. **Line, texture, edges.** Ink `#2B1B0A` only (never black or coloured); by depth front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px; figures >= 240 px 4.8, 130-240
   3.4, 72-130 2.2, 42-72 1.6, smaller fill only; near backs 4.8; ghosts 2.2; Pip ~3.4; far planes none. 20-40 % of each contour open; corners overshoot 3-15 px,
   structural lines run on; lines over 400 px in 2-4 segments (6-16 px gaps), 0.3-1° off-axis; cornices doubled 14-17 px apart; brick = 4-8 hints per wall;
   windows inked on 2-4 sides, panes 40-70 % filled. Fills flat, misregistered 2-5 px, one offset per object (Pip 3 right / 2 down); shade = a flat polygon one
   step darker, no outline; nothing soft (no gradient, glow, blur, haze, opacity). Texture OFF, linework static per seed. A big field is never bare: a few
   long tone-on-tone marks (ripple dashes 15-55 px long, 6-8 px thick, ~10-15 per 100 x 100 px; stone dabs 25-80 px; leaves). Paper edges OFF; if the owner
   asks: `paint-subtle`, never in y 0-620 or by the band, sides from y >= 640, keep-rects round her, Pip, ghosts, boards, signs; the stock preset puts 14-25
   px of paper at the TOP, so it needs a top-free fix first. [STYLE §3]
10. **The NEVER list.** Rejected: rooms / desks / papers as the stage; big front-facing people with faces (posed busts); squiggle speech bubbles and a
    "FACTS" bubble; three palettes and saturated washes; a locked camera and long holds; props instead of events (a badge, a highlighter, a scroll of years);
    text as slides (four tiers on frame 0, a source bar on every shot, a bullet list); her cat at home instead of Pip; a beige frame 0; rolling captions
    and paper at the top (v1). Fairness: V1 war imagery · V2 Google lettering / products / vans in the clause frame, screens, deliveries, targeting · V3
    villains (a sinister HQ, looming figures, glow or rim on Google or the Pentagon, a dolly-zoom) · V5 "for life" quoted or without SHE SAYS · V7 tape,
    padlocked lips, chains, cages · V8 gavels, ILLEGAL stamps, courtrooms · V9 the purpose line without the full clause · V10 blank cheques, infinity,
    "secret" · V12 cameras, eyes, guards, a camera inside Google watching her · V13 her in Washington · V14 irony on Google's beat · V15 logos, BBC styling,
    seals, flags · V16 charts or numbers for "heading" · V17 Hegseth, Trump, "kill", "bomb", "exclusive". Rendering / camera: gradients, glow, blur, opacity,
    fades, dissolves, texture, boil; a zoom in a hold; roll or a compound move; a cut mid-move or a high angle on one person. Flash rule: never more than 3
    flashes in any 1 s (WCAG 2.3.1): a lamp, bulb or window switches on ONCE, one bulb twinkles at a time; it bites S7's 30.04 string-light run and S8's 37.18
    lamp run (drop the canal `Lamp`'s 3-frame flicker). Mine: S3's string lights twinkle one bulb at a time. [STYLE §5, §9]
11. **Pip.** 86-120 px (>= 44 px only in S5's end frame); body `#9497D8`, shade `#7579C0`, inner ear / cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose
    tapered stroke per pose (~3.4 px, never scaled), 2-3 gaps (head top, base, the right ear root at >= 58 px), fills 3 / 2 px off. Never in y 317-556, the
    rail (x > 780 below y 840) or over her; >= 200 px from the F11 clause; no gag near harm; never furniture. In every shot it watches her or the story object,
    turns its head BEFORE the voice names the thing, leads the eye, hops across every cut, idles always. Mine: V2S3 turns to her on "she" (13.90; voice 13.96);
    V2S4 turns west on "heading" (19.55, leading 19.80). Cuts: arcs at y >= 600 (PipTrack `minY` 600); S2 -> S3 continues PIP_HOP_S2_S3 exactly; S3's exit is
    the LEFT edge, x 0-120 / y 620-700 at 14.86 (never the top); S4 enters descending down-left in x 520-640 / y 940-1060, left of her; it leaps into SUN1
    at 20.25. ONE Pip on screen at a time (S1 draws it only from t >= 0; it rides S7's wiping boat into S8). [STYLE §4; K2 PIP, MATCHES]
12. **The references.** Reference 1: THE style (bare ink then patchy floods, the expected grid then overflow, outline crowds, the fill-first noticeboard and
    the cat, the un-build loop): take the line, fills, open contours, small backs (heads 40-55 px), outline = not yet real, the cat crossing every cut, the
    sun on top; never its polaroid card and bottom captions, page scroll, card flips, locked camera, silence. v1: the house model (the mint caption sky, a
    working sun, Pip on a bollard hopping cuts, signage with sources, a new event every few frames, carried cuts); never its 240-330 px backs, the 2.2 s
    caption roll, its coloured frame 0, 30 fps, night beat, sets, Pip drawing, palette. Reference 2: crowds from behind, the animal low looking where we should,
    one journey; never its big near figures, dissolves, unsupported metaphors. The G5b pilot: how full "full" is (flat 18-24 %, detail 50-56 %); never its
    winter content or kit. The enclosure photo: one tall side, one soft low side, a curving lane closed by a tower, H:W ~1:1, sky ~27 %; never its overcast,
    realism, olive-grey stone or a top-cut wall. The palette refs: COLOUR only (a warm page 51-82 %, one hero 4-10 %, an aubergine anchor ~5 %, orange pops
    1-3 %); never their faces, olive / khaki, the pink wash, the halftone. The texture ref: thin tapered lines in key places only; never the halftone. The
    sketchbook: the loose architectural line (frame 0, the un-build); never hatching, grey wash, a monochrome finish. Arcane: ENVIRONMENT only (camera shape,
    small backs facing a vast view, scale cues, a big sky); never footage, tracing, faces, night, glow, haze, god rays, source speed. Compare at 216 px wide
    beside our frames, extracted to scratch (`ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png`); never commit their frames. [STYLE §8; CMN]

**What this changes in L3's build (applied in the critic round):** flyers and smoke `ceil={600}`; no plum on lamps, railings or birds (the post in `CM.line`);
shadows <= ~40 px; her truck at >= 0.70 body heights/s (V 110.7 -> 119 px/s, the post rides in from x ~242); S3's float turns (two eased legs, within
±12 px of home); in the DENSE-CALM water no motion of its own (no glint flicker), life from the lane; something in the top gutter; one bulb twinkling at a time.
