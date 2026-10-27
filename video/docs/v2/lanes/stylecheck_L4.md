# Style check, lane L4 (V2S5 "The far side", the crane): answers to STYLE_CHECK.md
Answered 2026-10-27 by the L4 helper (session_014PwCXHEmk7T2Y5xLmUSX6h) from the sources, not from memory. My shot: V2S5, film 20.55-24.00.

1. **Colour jobs.** Sky = caption field mint `#BCDCCF` (L* 85 / C* 13; high step `#CFE6DC`): the whole top y 0-600 in all four light states, a cloud's or
   April's high step; never anything drawn in y 317-556, never a gradient or a second sky colour. Hero canal teal `#0B8577` (50 / 33): HER only (coat, front
   door, window frame); never boats, the public, boards, signs, Google, the Pentagon, Pip, props or dressing (and in S5 nowhere: she is never in Washington,
   V13). Anchor plum `#36223A` (17 / 19): her dark office window, hair, gunwale stripes, board stiles, near silhouettes, ~5 % (cap 8 %); never a whole hull,
   lamps, railings or birds, never black or a big dark slab. Pop sun orange `#EE6A2E` (61 / 74): the sun disc only, 1-3 % (SUN0-2, the S3 / S8 low suns, the
   APRIL 2026 calendar disc); never caption boxes, coats, signs, FOR LIFE, props, logos, Google, the Pentagon. Tokens at or above the hero's C* 33: mustard
   `#D4A960` 44, leaves `#D6A563` 42 and `#B8714F` 39, lamp `#F7CF86` 42, line `#9A563C` 37, hair `#9A5A3E` 36, brick `#C9806A` 35 and `#A5604F` 34: confetti
   only, patches < 1 % each (brick as broken facades and hints, never a field); dressing aims at C* <= ~23. V2S5 is in the **April** state (§6 table): a light
   state changes only the flat bands below y 600, the lamps and the season dressing (blossom + the sun's APRIL 2026), never the sky or a fill. Light: one sun,
   3/4 backlight from beyond the view (SUN1 in the slot at the start, upper right cut by the edge at the end): tops lit, camera-facing walls and the backs in
   shade, shadows toward us. [STYLE §2, §6; TR §2; CG S5 Light]
2. **People and sizes.** A near head-back (head + shoulders cut by the frame bottom) is <= ~140 px WIDE at the shoulders (head ~55-65): the number measures the
   figure's width, not its head; K4 `NearBack` is 0.84 x hv x broad 0.93-1.1 wide, so hv <= ~150. Void: TR §5's S2 260-320 / S3 260-300 / S6 240-300 / S7
   200-260, K2's `S1_SHEET.seatedHeadPx.near` 250-330 and `S6.nearHeads` 240-300, canal `S1_STEPS` busts 262-316 and `S2Set` hv 280 / 304, v1's 240-330. Her:
   150-170 px full figure (100 px/m; never < 130 while she carries a story change); tallest standing extra ~260 px (mid band 110-260; K4 `Person` allows 400:
   don't); biggest seated ~190 (S2's staffer, >= 180). A forbidden look-alike pairs the darkest hair `#3E2A3A` (= G1, ΔE 6.5 from her plum) with a low bun or a
   long dark coat, or puts any dark bun within ~300 px of her or the row. In V2S5: the stranger 150 px (start) -> 62 (end), terrace people 40-120, no near
   backs. [STYLE §4; L1]
3. **A full frame.** V2S5 = the **scale hold** profile: the paused frame is judged by the scale cues (§6); life = 3 tiers of movers in the sky and by the
   figures, never 1 s still, nothing moving inside the city (CG cue 11: <= ~2 % of the frame). The checks at 216 px beside ref 1, v1 and the G5b pilot: no hole
   > ~200 px outside the band and the top sky; no other flat region > 20 %; the y 1250-1920 mass as TR §5 lists it (never flat paving, nothing to read); 12+
   props, 6 planes, people (still ones count); >= 2 things cut by a frame edge; 8+ specific dressing items; `deadframes` >= 8/10, no dead run > 0.40 s. Fix an
   empty frame in this order: the world (things, layers, thin lines), then people, then motion. My y 1250-1920: START the bench front, the stranger's bag,
   petal-strewn paving, the news box's base, a tree root cut by the bottom-left; END the terrace floor (paving joints, petal drifts, a bench, a bin, a stroller,
   people), the tree's roots cut by the bottom-left, the lamppost base cut by the bottom-right. Proof: `python3 -I scripts/qa/density.py <clip> --scenes
   src/v2r/film/scenes.json --only V2S5` (my S5-only clip: no `--scenes`), `colour_meter.py <stills> --hero '#0B8577' --pop '#EE6A2E' --band 290,600`,
   `deadframes.py <clip>`, `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15 --allow 1.47-1.64`, y 317-556 pure mint in every frame (my
   band check), and a cold viewer's tell-back. [STYLE §5; TR §5, §9; LD §0]
4. **The opening and the clock.** Frame 0 = S1 in bare warm ink on paper under SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452) +
   "Source: BBC News, 21 Oct 2026" (20 px, 550); the sun half-coloured, Pip already in colour, her ink figure behind the glass door. Colour floods f1-f18 from
   SUN0 outward (disc, sky f2-5, far roofs + bridge f4-8, brick + windows f6-12, water f9-13, boats f11-14, towpath + steps f12-17), her teal coat LAST at f18
   (0.30 s). Voice "She" 0.12 (f7); sound from 0.00 (the pencil flood), lamp click 0.40, our exit ding 0.45. The expected thing: her window goes dark 0.40, the
   doors slide 0.45-0.52, she walks out free, birds lift 1.40; reality overtakes at 2.00 ("And": G1 pops). 4.54-4.79: she and every ghost stop mid-stride, the
   ambience dips; 4.98 "life": the row takes ONE step, three bare outlines pop, birds lift, Pip ears-cover. Loop: S8 ends on her lit window at W (860, 700)
   under its 1.05 push, un-builds 38.82-39.08 onto S1's t < 0 bare state (f0's motions start 3-4 frames early, words back at 39.04). Beat times: the HEARD
   clock, `public/v2r/voice_words_heard.json` (beat_map §2); K2 and kit default times are FILM seconds (`useTime()` is shot-local: t = film - 20.55 in S5).
   [STYLE §6, §7; TR §4; BUILD §2-3]
5. **The Arcane crane and scale.** The owner's favourite: Arcane S1E1's rooftop pull-back, CG #55 @109.46. Its SHAPE: one dolly back (never a zoom) + crane up
   + a ~70-80° arc round the figures on ONE ease, no other move, reversal or roll; the figures are the pivot (parallax far 1.0, mid 0.85, near 0.4, deck 0).
   V2S5: hold 20.55-21.30; ONE `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40 (p 0.15 at 21.75, 0.48 at 22.16, 0.70 at 22.43, 0.96 at 23.02); hold to 24.00.
   Beats: the bright slot (SUN1) in their eyeline; p 0.15-0.40 the big tree where the Pentagon will land; p 0.37-0.51 (22.02-22.19) the lamppost wipe at peak
   speed (swap behind it, 22.117); p 0.55-0.62 the light burst (the pale bank); p 0.70 the Pentagon clears the tree ON "Pentagon" (22.43) + the plaque; p
   0.77-0.96 the obelisk rises; 23.08 windows warm on; a V of birds in the hold. Cues: nothing ends in frame (something cut by all 4 edges); 5-7 planes each
   2.2-3x smaller (S5: 6); the far band packed, rows every 9-10 px each half hiding the next, detail peaking under the horizon; flat steps 0 / 12 / 22 / 40 / 65 %,
   ink full, full, hairline, none, none; feet 2-3 F under the horizon (past 3.5 F reads as a map); one landmark 1.1-1.4 F over the horizon, the darkest far
   shape on the palest cloud, a bank >= 1 W behind it (tops >= 610); clouds 0-6 px/s; birds 24-44 px, flap 3-4 Hz, entering at 70-80 % of the move. What
   breaks it: K2's end stranger, 62 px at feet 1238 under my horizon 750 = 7.9 F. Now: K2 changes only through the director; L4 builds to the contract with
   L4_spec §3's mitigation (the terrace as a near world with its own size gradient, dappled shade, dark frames left and right, the bright view carrying the
   scale) and checks at 216 px that it never reads as a map. [STYLE §6; CG S5 + Scale cues; L4S §3]
6. **Cozy enclosure and the held camera.** "Held, not shut": walls on 2-3 sides, ONE opening the subject faces, the threat visible but outside; mass 35-70 % of
   the frame and >= 40 % of its perimeter; something in the top gutter (y 0-290); >= 1 sign of care; busy edges and a calm, never-empty centre; one low flat
   lamp pool (<= 2 rings, lighter inward); rounded inside, hard outside. Our sky (y 0-600, 31 %) is the caption field, so it is the only void: the enclosure
   comes from masses below y 600 and the side edges. Value sandwich: the darkest mass (L* 20-38) right behind the people's lane so light figures pop, the lane
   neutral (C* <= 15), bank and water light again. Cozy lane: ONE band, both ways, 1-5 movers, a new one every ~1-2.5 s entering and leaving at an edge or
   behind a mass already at speed, half at rest, nothing coming at us, no sway or shimmer. Float law: translation only, 8-15 px/s (peak 25), straight legs
   turning (eased) every 0.6-1.5 s, net within ±12 px of home, >= 40 px overscan, no zoom, rotation or parallax. Never a zoom in a hold: 1-4 px/s reads frozen
   and leans at the viewer; a zoom is a story move (>= 3 % in <= 2 s, on a line) or the big move. Speeds: <= 7.5 px/f long flat-ink, <= 15 detailed (S5's flat
   wipe ~41 by design): `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15` (S5 `--allow 1.47-1.64`). V2S5 is not cozy: the comfort breaks
   once, in S5-S6. [STYLE §6; CS §1-3b.5]
7. **The caption band and zones.** Nothing is ever drawn in y 317-556 (block x 95-945): no roof, cloud, bird, wire, puff, Pip's hop or life. y 290-600 is flat
   sky but for S1's roof planting (to y 575), sun tops >= 575 and S5's cloud bank and obelisk tops >= 610 (above it S1's hero cloud y 120-280, plane branch y
   0-240); y 299-317 stays clear because the caption boxes reach y 299. Flyers and puffs keep to y >= 600 or the top gutter: `ceil={600}` over the canal kit's
   580 (and the dc kit's `BirdV` `minY` 580: S5 flies at >= 610). Key reads x 120-880, y 290-1250; the rail x > 780 below y 840 (masses only); y 1250+ masses
   only, never quiet, nothing to read. Captions: Patrick Hand (`CaptionHand.woff2`) 98 px on baselines 387 / 510, <= 2 lines, centred, ink on the mint; they
   only POP in place (page, line, box), a change at least every 1.5 s, one peach box `#F6B892` per line ~0.06-0.1 s before its key word. [STYLE §7; K2 UI]
8. **Fairness on the boards.** The identical pair is S7 GOOGLE SAYS and S8 SHE SAYS: the same StatementBoard face at B (x 150-630, y 700-1220), the same sunset
   light, type scale, pen build and ONE clack, the same Pip pose at the board bollard (700, 1205), ONE story move each landing before its key line (S7's 4 %
   push on "principles", S8's truck), a lamp run on each key word. The deal board: the full clause up at the cut (24.00), the purpose line pops ON "any"
   (24.03), both readable to 28.06. Quote marks only on "for fear of retaliation" (F5), "any lawful government purpose" (F10), the full 24-word clause (F11),
   "AI principles" (F13), "of any kind" (F14), "human oversight" (F16), "talking about facts is not criticising" (F18). Google's beat never has irony, a Pip
   reaction, a light on "facts", a place in S8 or an answer to her clause; it is uninterrupted to 32.70 (its full 4.85 s). K3 has ONE owner, L5: every board,
   tag, post, news box and plaque (my NewsBox and Plaque are K3's since 14:50); `TYPE`: header 60, key 56 (read at 216 px), body 34 / 30 and credits 20 / 18
   (read at ~390 px). [STYLE §7; TR §8; K3 README]
9. **Line, texture and edges.** Ink `#2B1B0A` only: front 4.8 / mid 3.4 / far 2.2 / hair 1.6 px; figures >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6,
   smaller fill only; near backs 4.8; ghosts 2.2; Pip ~3.4; far planes none (S5: full, full, hairline, none, none). 20-40 % of each contour open; corners
   overshoot 3-15 px; lines over 400 px in 2-4 segments (6-16 px gaps), 0.3-1° off-axis; fills misregistered 2-5 px, one offset per object, mixed directions;
   shade = a flat polygon one step darker, no outline (dL* -25 to -40, chroma x0.6-0.7, plum on warm, 10-15° to blue on cool). Texture OFF; linework static.
   A big field is never bare: a few long tone-on-tone marks (ripple dashes 15-55 x 6-8 px, ~10-15 per 100 x 100; stone dabs 25-80 px; lane marks; leaves).
   Paper edges OFF; if asked: `paint-subtle`, never in y 0-620 or beside the band, sides from y >= 640, rects kept round her, Pip, ghosts, boards and signs;
   the stock preset puts 14-25 px of paper at the TOP: fix it first. [STYLE §3]
10. **The NEVER list.** Rejected cut + owner: rooms / desks as the stage; big front-facing people with faces, posed busts, waist-up shots; speech bubbles and a
    "FACTS" bubble; three palettes, saturated washes; a locked camera and long holds; props instead of events; text as slides (four tiers on frame 0, source
    bars, paragraphs, bullet lists); her cat instead of Pip; a beige frame 0; reused assets. Fairness: war imagery (V1); Google lettering / products / vans in
    the clause frame, racks, screens, implied targeting (V2); villain framing, glow or rim on Google or the Pentagon, a dolly-zoom (V3); "for life" quoted or
    without SHE SAYS (V5); gag imagery (V7); gavels, stamps, courtrooms (V8); the purpose line without the full clause (V9); blank cheques, infinity, "secret"
    (V10); cameras, eyes, guards, escorts (V12); her in Washington (V13); irony on Google's beat (V14); logos, seals, insignia, flags (V15); charts for
    "heading" (V16); Hegseth, Trump, Israel, Gaza, "kill", "bomb", "exclusive" (V17). Rendering / camera: gradients, glow, blur, opacity, fades, dissolves,
    texture, boiling lines, an outline round every silhouette; a zoom in a hold, roll, a compound or source-speed move, a cut mid-move, night-black frames,
    red skies. Flash rule: never > 3 flashes in any 1 s at any size; a lamp, bulb or window switches on ONCE (drop the canal `Lamp`'s 3-frame flicker from
    S7's 30.04 and S8's 37.18 runs), one bulb twinkles at a time. [STYLE §5, §9; TR §8]
11. **Pip.** 86-120 px (>= 44 only in S5's end frame: 108 at my start -> 44.6 at the end through the deck's 2.419); body `#9497D8`, shade `#7579C0`, inner ear /
    cheeks / soles `#F2C3CC`, scarf `#D4A960`; ONE loose tapered stroke per pose (~3.4 px, 2.3 at 44), 2-3 gaps (head top, base, the right ear root at >= 58
    px); never in y 317-556, the rail (x > 780, y > 840) or over her, >= 200 px from the F11 clause, no gag near harm, never furniture. Jobs: watches, turns
    its head before the voice names the next thing, reacts ONCE, hops across every cut on arcs at y >= 600 (S3 exits the LEFT edge at y 620-700). My ONE
    reaction: it looks up at the calendar sun on "April" (20.76, scene 0.21). In: mid-air at the cut at L3's (292, 721), dropping onto the bench backrest (415,
    1120) by ~20.72; out: a leap up-right at 23.90 toward S6's corner post (770, 720). One Pip at a time: S1 draws it from t >= 0 only (S8's lands on f0's
    bollard in the t < 0 underlay); S7 into S8 it rides the wiping boat (one hand-off). [STYLE §4; TR §3; K2 PIP]
12. **The references.** Reference 1: the line, flat misregistered fills, open contours, small simple backs (heads 40-55 px), outline = not yet real, the cat
    crossing every cut, the sun on top, the loop; never its polaroid card, bottom or scrolling captions, card flips, locked camera, silence. v1: one sunny
    world under the mint caption sky, a working sun, Pip on a bollard hopping cuts, signs with sources, a new event every few frames, its crane (24.1-27) and
    pull-back (37.2-39.4); never its 240-330 px near backs, the 2.2 s caption roll, its coloured frame 0, 30 fps, the night beat, its sets / Pip / palette.
    Reference 2: crowds from behind, the animal low looking where we should, one journey without a hard cut; never its big near figures, dissolves, giant
    metaphors. The v3 G5b pilot: how full "full" is (flat 18-24 %, detail 50-56 %), on every review sheet; never its winter content or kit. The enclosure photo:
    one tall side, one soft low side, a curving lane closed by a tower (H:W ~1:1, sky ~27 %); never its grey rain, realism or olive stone. Palette refs: colour
    only (page 51-82 %, one hero, an aubergine anchor ~5 %, tiny orange pops); never their faces, olive or the halftone. Texture ref: thin tapered lines in key
    places; never the dots. The sketchbook: the loose architectural line (the spirit of f0 and the un-build); never its hatching or grey wash. Arcane:
    environment only (#55's crane shape and the scale cues; the collage's two small backs over a city); never footage, tracing, faces, night, glow, haze or
    source speed. Compare at 216 px wide (body and credits at ~390 px); frames by ffmpeg into scratch (`-vf fps=2,scale=216:-2`); never commit their frames.
    [STYLE §8; CMN]
