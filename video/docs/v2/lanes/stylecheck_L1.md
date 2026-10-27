# Style check, lane L1 (V2S1 "Walking out", film 0.00-6.10 s), third helper, 2026-10-27

1. **Colour jobs.** Sky mint `#BCDCCF` (high step `#CFE6DC`): the whole top y 0-600 in all four states; never drawn on in y 317-556, never a
   gradient or a second sky colour. Hero teal `#0B8577`: HER only (her coat, door, window frame; her coat is ~0.3 % of a frame, expected);
   never on boats, the public, Pip, Google, boards, props, and never a bigger her to raise the %. Anchor plum `#36223A` (~5 %, cap 8 %): her
   dark office window W, her hair, gunwale stripes, board stiles, near silhouettes; never a whole hull, lamps, railings or birds (canal kit
   defaults to override), black or a big dark slab. Pop sun orange `#EE6A2E` (1-3 %): the sun disc only (SUN0 in S1); never caption boxes,
   coats, FOR LIFE, signs, logos. Tokens at or above the hero's C* 33: mustard `#D4A960` 44, leaves `#D6A563` 42 / `#B8714F` 39, lamp `#F7CF86`
   42, line `#9A563C` 37, hair `#9A5A3E` 36, brick `#C9806A` 35 / `#A5604F` 34: confetti, patches < 1 % each, brick as broken facades and hints,
   never a field (dressing aims at C* <= ~23). S1 is "golden" (gold band `#F6D9BC` below y 600, lamps off, October leaves); a light state
   changes only the bands below y 600, lamps and season dressing, never a fill or the mint sky (`todSteps` empty). Light: S1's own sun SUN0
   (200, 690) r 80 in the west gap, west = screen LEFT on the north lens; one direction, shadows fall right. [STYLE §2; TR §2, §4; K1]
2. **People and sizes.** A near head-back (head + shoulders cut by the frame bottom) is <= ~140 px WIDE at the SHOULDERS (the figure, not the
   head; head ~55-65 px); K4 `NearBack` is 0.84 x hv x broad 0.93-1.1 wide, so hv <= ~150. Void: TR §5's 250-330 / 260-320 / 240-300 near
   heads, K2 `S1_SHEET.seatedHeadPx.near` [250, 330], canal `S1_STEPS` busts 262-316 (+ the ~300 px middle row), cast `S1_SEATED` near hv
   262-326, `S2Set` hv 280 / 304, v1's 240-330. Her: 170 px on the S1 towpath (153 behind the door; 150-170 range, never < 130 while carrying a
   story change). Tallest standing extra ~260 px (mid band 110-260; K4 allows 400: don't); biggest seated ~190 (S2's staffer, >= 180). A
   forbidden look-alike carries her signature: an extra pairing the darkest hair `#3E2A3A` (= G1's head) with a low bun or a long dark coat,
   any dark bun within ~300 px of her or the row, teal; S1's near-row "low bun + mustard scarf" takes a light hair. [STYLE §4; TR §3]
3. **A full frame.** S1 is BUSY: paused flat <= 40 %, objects >= 105 / Mpx, detail >= 34 % (approved bar G5b: flat 18-24 %, detail 50-56 %);
   life >= 3.5 medium events/s (>= 5 per film), no gap > 1 s, one small loop, ~25 events in the first 3 s. At 216 px: no hole > ~200 px outside
   the band and the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists it (never flat paving or bare water, nothing to
   read); 12+ props, 3-4 planes, people; >= 2 things cut by a frame edge; 8+ specific dressing items; `deadframes` >= 8/10, no dead run > 0.40 s.
   Empty frame: fix the world (things, layers, thin lines) first, then people, then motion (motion never fixes an empty still). S1's y 1250-1920:
   our five broad stone steps with the seated public from behind: near head-backs at the cap across the width, a middle row seated ~110 px, a
   low row ~60 px by the water; cups, totes, a dog lying down, a bike cut by the bottom-right (+ dressing). Proof: `python3 -I
   scripts/qa/density.py <clip> --scenes src/v2r/film/scenes.json --only V2S1`; `colour_meter.py <stills> --hero '#0B8577' --pop '#EE6A2E' --band
   290,600`; `deadframes.py <clip> --scenes src/v2r/film/scenes.json`; camspeed (6); y 317-556 pure mint; the sheet beside ref 1, v1, G5b; a cold
   viewer. [STYLE §5; TR §5, §9; LD §0]
4. **The opening and the clock.** f0: S1 in bare warm ink on paper under SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, 372 / 452) + its
   source (20 px, 550); the sun half-coloured, Pip in colour; her ink figure mid-step behind the glass door (153 px). f1-f18 the flood from SUN0:
   the disc, the sky f2-5, far roofs + bridge f4-8, brick, fins, lit windows f6-12 (W lamp-lit), water f9-13, boats f11-14, the towpath + the
   steps' people f12-17, her teal coat LAST at f18 (0.30 s). Sound from 0.00 (pencil flood); voice "She" 0.12 (f7); the exit ding 0.45. The
   expected thing: W goes dark 0.40, the doors slide 0.45-0.52, she walks out free 0.97, birds lift 1.40; reality overtakes at 2.00 ("And": G1
   pops one step ahead). 4.54-4.79: the "...": she and every ghost stop mid-stride, the ambience dips, water/boats/birds go on; 4.77 the box on
   FOR LIFE, 4.79 G6. 4.98 "life": ONE step together, three bare outlines down the bend, birds off the far roofs, Pip ears-cover; cover 5.30.
   Loop: S8 holds a 1.05 push about W (W = 157.5 x 178.5 = S1's f0) and un-builds 38.82-39.08 onto S1's t < 0 bare state (f0's motions start 3-4
   frames early; words back at 39.04). Beats: `public/v2r/voice_words_heard.json` (the HEARD clock); K2 / kit times are FILM s (S1 starts at 0,
   so shot = film time; elsewhere t = film - start). [STYLE §6; TR §4-5; BUILD §2]
5. **Crane and scale (L4's, known for the cut).** Arcane S1E1 rooftop (#55 @109.46): ONE dolly back (never a zoom) + crane up + a ~70-80° arc on
   ONE ease, no other move or roll; the figures are the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0). V2S5: hold 20.55-21.30; ONE
   `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40; p 0.15-0.40 a tree where the Pentagon lands; the lamppost wipe at peak speed 22.02-22.19; a
   light burst (the pale cloud bank); p 0.70 the Pentagon clears the tree ON "Pentagon" 22.43; the obelisk rises; windows warm 23.08; hold to
   24.00. Cues: nothing ends in frame; 5-7 planes each 2.2-3x smaller (S5: 6); flat steps 0 / 12 / 22 / 40 / 65 %, ink full, full, hairline,
   none, none; feet 2-3 F below the horizon, then the drop (> 3.5 F reads as a map); one landmark 1.1-1.4 F over the horizon on the palest cloud,
   a bank >= 1 W (tops >= y 610); huge = slow (clouds 0-6 px/s); birds 24-44 px, 3-4 Hz. K2's end stranger (62 px, feet 1238, ~7 F) breaks the
   feet cue: L4 builds to it with L4S §3's mitigation and checks at 216 px it never reads as a map. [STYLE §6; CG S5]
6. **Cozy, held.** 2-3 enclosing sides, ONE opening the subject faces, mass 35-70 % of the frame and >= 40 % of its perimeter, something in the top
   gutter (y 0-290: S1's hero cloud + plane branch), >= 1 sign of care (her desk plant, its ring on W's sill, cups), one low flat lamp pool (<= 2
   rings). Our mint sky y 0-600 (31 %) is the caption field and the ONLY void, so the enclosure comes from masses below y 600 and the side edges.
   Value sandwich: the darkest mass (L* 20-38) right behind the people's lane so light figures pop, the lane neutral (C* <= 15), bank and water
   light again. Cozy lane: one band, both ways, 1-5 movers, a new one every ~1-2.5 s at cruising speed from an edge, half at rest, nothing coming
   at us. Float: translation only, 8-15 px/s (peak 25), legs turning every 0.6-1.5 s, within ±12 px of home, >= 40 px overscan. No zoom in a hold
   (1-4 px/s reads frozen; a zoom is a story move >= 3 % in <= 2 s, or the big move). camspeed <= 7.5 px/f flat ink, <= 15 detailed: `python3 -I
   scripts/camspeed.py --frames <dir> --fps 60 --limit 15` (7.5 for flat moves). [STYLE §6; CS 3b]
7. **Band and zones.** Nothing ever in y 317-556 (the block, x 95-945); y 299-317 clear because the peach boxes reach y 299; y 290-600 flat sky
   except S1's roof planting to y 575, sun tops >= 575, the hero cloud y 120-280 and plane branch y 0-240 above it (S5's bank / obelisk >= 610).
   Flyers and puffs at y >= 600 or the top gutter: `ceil={600}` over the canal kit's 580. Key reads x 120-880, y 290-1250; the rail x > 780 below
   y 840; y 1250+ masses only, nothing to read, never quiet. Captions: Patrick Hand 98 px, baselines 387 / 510, <= 2 lines, ink on mint, POP in
   place (never roll, scroll or clip), a change every <= 1.5 s, one peach box `#F6B892` ~0.06-0.1 s before its key word. [STYLE §7; K2 UI]
8. **Fair boards.** The identical pair is S7 GOOGLE SAYS and S8 SHE SAYS: the same face at B (x 150-630, y 700-1220), sunset light, type scale,
   pen build, clack, Pip's pose at the bollard (700, 1205), ONE story move before the key line (S7's 4 % push, S8's truck), a lamp run on each key
   word. Deal board: the full clause up at the cut 24.00, the purpose line pops ON "any" 24.03, both readable to 28.06. Quote marks only on F5, F10,
   F11 (the full 24 words), F13 "AI principles", F14 "of any kind", F16 "human oversight", F18 "talking about facts is not criticising"; "for life"
   never quoted. Google's beat: its full 4.85 s, uninterrupted to 32.70, no irony, no Pip reaction, never lit on "facts", never in S8. Every board,
   tag, post, news box and plaque is K3's, owner L5; type: keys >= 56 px, body 30-34, credits 18-20. [STYLE §7; TR §8]
9. **Line.** Ink `#2B1B0A` only (never black or coloured: the kit's CM.line joints / brickDeep bike / CM.line plant ring are defects): 4.8 / 3.4 /
   2.2 / 1.6 by depth; figures 130-240 px 3.4, 72-130 2.2, 42-72 1.6; near backs 4.8; ghosts 2.2; Pip ~3.4; far planes none. 20-40 % of each
   contour open; corners overshoot 3-15 px; lines > 400 px in 2-4 segments with 6-16 px gaps, 0.3-1° off-axis; windows inked on 2-4 sides; a glint
   = two hairline diagonals at 60-70°. Fills flat, 2-5 px misregistered, one offset per object; shade a flat polygon one step darker, no outline.
   Texture OFF, linework static. Big fields: tone-on-tone marks (ripple dashes 15-55 x 6-8 px, ~10-15 per 100 x 100; stone dabs 25-80 px). Paper
   edges OFF; if asked: no paper in y 0-620 or by the band, sides from y >= 640, keep rects round her, Pip, the ghosts; the stock preset puts 14-25
   px of paper at the TOP. [STYLE §3]
10. **NEVER.** The rejected cut: rooms and desks as the stage, big front-facing faces, speech bubbles / a "FACTS" bubble, three palettes, a locked
    camera, a scroll of years, text slides (four tiers on frame 0), her cat at home, a beige frame 0; also big people models, near backs > 140 px,
    paper at the top. Fairness: V1 war imagery, V2 Google signs/products in the clause frame, V3 villain light / glow on Google, V5 "for life"
    quoted or without SHE SAYS, V7 gag imagery (tape, padlocks, zips, chains), V8 gavels / stamps, V9 the purpose line without the full clause,
    V10 blank cheques / "secret", V12 cameras / eyes / guards, V13 her in Washington, V14 irony on Google's beat, V15 logos / BBC styling, V16
    charts for "heading". Rendering / camera: gradients, glow, opacity, fades; a zoom in a hold; roll or a compound move; night-black or red skies.
    Flash: never more than 3 flashes in any 1 s (a lamp / window switches on ONCE; drop the canal Lamp's 3-frame flicker from S7's 30.04 and S8's
    37.18 lamp runs; one bulb twinkles at a time). [STYLE §5, §9; TR §8]
11. **Pip.** 86-120 px (>= 44 only in S5's end); body `#9497D8`, shade `#7579C0`, inner ear / cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose
    ~3.4 px stroke per pose, 2-3 gaps (head top, base, the right ear root at >= 58 px), fills 3 right / 2 down. Never in y 317-556, the rail (x >
    780 below y 840), over her, within 200 px of the F11 clause; no gag near harm; not furniture. Jobs: in every shot, watching, the head turning
    BEFORE the voice names the next thing, one reaction, hops across cuts on arcs at y >= 600 (S3 exits LEFT, y 620-700). S1: in colour at f0 on
    the waterline bollard (700, 1235), head follows her 1.25, ONE reaction EARS-COVER on "life" 4.98, hops up-left into the dive 5.90. One Pip on
    screen: S1 draws it only from t >= 0 (S8's lands on f0's bollard in the t < 0 underlay); into S8 it rides S7's wiping boat. [STYLE §4; TR §3]
12. **References** (compare at 216 px wide beside our frames; `ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png` into scratch; never commit
    their frames). Ref 1: the line, misregistered fills, open contours, small backs (heads 40-55), outline = not yet real, the cat crossing every
    transition, the opening flood, the loop; not its polaroid card, scrolling captions, card flips, locked camera, silence. v1: the mint caption sky
    over one sunny world, a working sun, Pip on a bollard hopping cuts, sourced signage, a new event every few frames; not its 240-330 px near backs,
    the caption roll, its coloured frame 0, 30 fps, night, sets / Pip / palette. Ref 2: crowds from behind, the animal low looking where we should,
    one journey; not its big near figures or dissolves. G5b pilot: how full "full" is (flat 18-24 %, detail 50-56 %); not its winter, palette, kit.
    Enclosure photo: one tall side, one soft low side, a closed vista (H:W ~1:1, sky ~27 %); not the grey rain, olive stone, a top-cut wall.
    Palette refs: colour only; not their front-facing figures, olive, pink wash, halftone. Texture ref: thin lines in key places; not halftone.
    Sketchbook: the loose line (frame 0, the un-build); not hatching, grey wash. Arcane: environment / camera shape / scale only; not footage,
    faces, night, glow, haze, source speed. [STYLE §8]
