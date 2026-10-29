# Pro practice 4: vibrant, coherent, premium colour, and why v2 still reads cheap

*The city-poster study (2026-10-28), pro-practice researcher 4. Analysis only: nothing here is a rule until the owner
approves it; `video/docs/look/DIRECTION.md` and the playbook stand (with the owner's answers of 2026-10-28: one look,
still evolving; a VERY subtle paper-and-paint texture to try; a lit and a shade face on every volume; a full value
range whose numbers come from this study; the owner likes v2's colours, so v2's HUES stay and this report says what
moves). Numbers: `video/scripts/look/posters/pro_4_colour.py` (`measure`, `sheets`, `simulate`, `mask`; CIE L*a*b*
D65, C* chroma, h hue; measured at PHONE SCALE, the image area-averaged to 540 px wide; the Instagram UI, each poster's
title and v2's caption band y 290-600 masked) on the 7 posters and 10 frames of v2's G7 master (1, 3, 5.2 = the cover
frame, 9, 14, 17.5, 22, 26, 30.5, 36 s; v1 at 20.5 and 38.5 s). Built on `style.md` (cited, not re-measured: its value
range, base chroma, lit-to-shade step, texture and H.264 costs, sister palettes), `pro_1_depth.md` (value groups) and
`pro_2_hierarchy.md` (the finish ladder). Sheets: `img/pro_4_colour_value_chroma.jpg` (value map and colour jobs, 4
posters vs 4 v2 frames), `img/pro_4_colour_maps.jpg` (L* against C*, the a*b* gamut and the proposed mask),
`img/pro_4_colour_fields.jpg` (empty fields and the variation inside a shape), `img/pro_4_colour_fixes.jpg` (the fix
ladder simulated on v2's cover frame). Posters: median [range] of 7; v2: median [range] of 10 frames.*

**In short.** (1) v2's hues are not the problem: on all 9 hue-harmony measures v2 sits inside the posters' range (they
are 7 % of the measured gap); keep them. The gap is where v2 puts VALUE and CHROMA: no lower half of the value range
(L* p5 48 vs 23; under L* 40 on 1.9 % vs 13.8 %, in 41 pieces vs 259), and colour living in the lights (55 % of v2's
frame is tinted pastel, the posters 5 %), so no calm field lets an accent ring: 56 % of the gap. (2) The rest is drawing,
not colour: empty uniform fields in the world (15 % of v2's frame below the sky, the posters 0 %), one hex per role (14
colours cover 90 % of a frame vs 29), dead-flat fills (mottle 0.24 vs 0.60 L*). A post-process grade closes only 16 %
of the gap (the fix ladder), so the fixes are palette roles, darks drawn as pieces, and filled grounds. (3) The pro way
to get "vibrant yet coherent" is a gamut mask plus a value-chroma plan (chroma peaks in the mids, lights calm, a few
accents outside the mask), and texture that stays static, world-locked and low-frequency.

## 1. The feeling, restated precisely

The owner: "very vibrant and coherently fit together. I like the colors of our last video about Google, but our video
still feels cheap and lazy as if these pictures give a very premium feel to it." Measured, side by side
(`img/pro_4_colour_value_chroma.jpg`, `img/pro_4_colour_maps.jpg`, `img/pro_4_colour_fields.jpg`):

| Family (share of the measured gap*) | Measure | Posters | v2 | Read |
|---|---|---|---|---|
| **Value structure (34 %)** | L* p5 / p25 / p50 / p95 | 23 / 54 / 83 / 91 | 48 / 73 / 83 / 90 | v2's lights match; its lower half is missing |
| | under L* 40: share; pieces (>= 4 px at 540); grid cells of 16 | 13.8 % [8.5-24.1]; 259 [215-324]; 9 [9-12] | 1.9 % [0.7-5.3]; 41 [14-64]; 6.5 [4-8] | 7x the dark area, 6x the pieces, spread wider |
| **Where colour lives (22 %)** | C* p50 | 7.3 [5.0-13.3] | 13.6 [13.0-14.4] | v2 tints everything |
| | pastel (L* >= 75, C* >= 10) / paper (L* >= 75, C* < 6) | 5 % [4-43] / 16 % [0-50] | 55 % [38-61] / 2.7 % [1.5-5] | v2's lights are tinted, theirs calm |
| | C*-weighted mean L*; mean C* at L* 40-60 vs 75-88 | 63 [58-67]; 18.4 vs 7.9 (x2.3) | 75 [69-77]; 23.7 vs 14.1 (x1.7) | their chroma peaks in the mids |
| | accents C* >= 35: share, parts, in the top third | 3.5 % [2.1-9.3], 87 [23-192], 0 % (6 of 7) | 1.8 % [0.3-4.8], 46 [5-151], 13 % [0-63] | v2's accents fewer, and up in the sky |
| **Empty fields (13 %)** | edge-free fields >= 2 % each: all / below the sky | 42 % [35-51] / 0 % [0-2.3] | 32 % [25-52] / 15 % [0-32] | the posters' calm is the sky only |
| **Colour count (12 %)** | colours (merged at dE 8) covering 90 %; colours >= 0.5 %; the largest | 29 [18-50]; 32 [26-35]; 42 % (the sky) | 14 [9-21]; 21.5 [17-27]; 28 % | one dominant calm field, a rich world |
| **In-shape variation (11 %)** | inside big fields: mottle std L* / a*b*; drift across one shape (L*) | 0.60 / 0.82; 5.9 [0.9-8.7] | 0.24 / 0.29; 1.0 [0.7-2.8] | v2's fills are dead flat** |
| **Hue harmony (7 %)** | hue concentration R; families >= 3 %; Matsuda template costs; cast C* | 0.53; 7; (range); 7.1 | 0.61; 5; inside; 9.1 | **no gap: keep v2's hues** |

\* Each metric's distance from the posters' median in units of their half-range, capped at 4, summed per family (38
metrics; `m.json`). \*\* The posters are Instagram JPEGs: part of their measured mottle is compression blocks (visible in
the x8 crops of `img/pro_4_colour_fields.jpg`), est.; `style.md` §1.4's full-size texture (grain 0.2-0.9, mottle 0.4-0.7
L*) is the number to build on.

**What creates the feeling, by region:**
1. **"Vibrant" is contrast, not more chroma** (agrees with `style.md` §1.1). The calm field is big and near-neutral:
   Singapore's and Reykjavik's skies and water (paper C* 4, h 198-218, 40-50 % of the poster), Buenos Aires' and Kyoto's
   cream (L* 93, C* 7). Against it the colour sits in the MIDS in small pieces: Singapore's shophouse row along the
   bottom (in its own colour, C* >= 35, in row 3 of the value-chroma sheet), Cape Town's Bo-Kaap and proteas
   (`pro_1_depth` box 0,1300-450,1600, L* 46), Kyoto's torii (vermilion beside the pines), Buenos Aires' facades. v2's
   mids are already as colourful (mean C* 23.7 at L* 40-60, the posters 18.4): what differs is that v2 tints its lights
   too. The L*-C* map (`img/pro_4_colour_maps.jpg`) is a triangle with its chroma at L* 40-70 and calm lights; v2's is a
   band at L* 60-90 with every light tinted.
2. **"Coherent" is three shared things, not one hue.** The darks share one tinted family (`#354F4D` teal, `#3F505C` slate,
   `style.md` §1.1); the calm pixels share one lean (Singapore's paper hue concentration 0.74); one key light gives every
   volume a lit and a shade face 21-37 L* apart (`style.md` §1.2). The hues themselves spread wider than v2's (7 families
   vs 5): coherence comes from the shared light, darks and paper, so the hue count can grow.
3. **"Premium" is density with calm, in the right places.** The posters' calm is the sky only (42 % in one field, the
   largest colour of the frame); below it, no edge-free field reaches 2 % of the frame: every ground is cut into steps,
   facets, shadows, windows and props (`pro_2_hierarchy`: near patchwork 14.5 shapes per 10,000 px). Inside every shape
   the colour breathes (mottle 2.5x v2's, a hue shift inside one wall).
4. **What reads "cheap and lazy" in v2**, in its pixels: (a) the world floats in the light half (`pro_1_depth`: the
   bottom quarter at L* 74-78); its few darks are 14-64 small pieces, the largest under 1 % (S1-S5); (b) a pastel tint on
   every light (stucco `#F4E4D2` C* 11, paving `#EFD8C2` C* 14.5, mint sky C* 13): the base is as colourful as the
   accents' surroundings, so nothing rings; (c) empty fields in the world: S1's paving y 1150-1640 (four fields, 12 % of
   the frame, L* 87 C* 12 h 62), S4's canal bands y 1086-1206 and 1764-1918 (14 %), S6-S7's deck y 1264-1918 (13-19 %),
   S8's floor 0,1364-552,1918 (10 % at C* 32: a saturated FIELD, against rule 6's confetti); (d) one hex per role, so a
   facade row repeats one stucco; (e) fills flat to the code value. The default-vector look: even tint, even
   simplicity, everywhere.

**What a grade can and cannot do** (`img/pro_4_colour_fixes.jpg`, a post-process on v2's cover frame, never the
build): a value curve under the sky, then calm lights with colour in the mids (no beige), then a VERY subtle paper
mottle move 21 -> 24 -> 26 -> 26 of 38 metrics into the posters' range and cut the summed gap 55.7 -> 47.0 (-16 %): L* p5
55 -> 41, under L* 45 2 -> 8 %, pastel 57 -> 35 %, C*-weighted L* 76 -> 67, mottle 0.24 -> 0.57. Untouched: the dark
pieces (64 -> 62; posters 215+), the empty fields below the sky (15 -> 12 %; posters 0), the colour count (25 -> 27).
The remaining 84 % is drawing: darks come from windows, doorways, eaves and foliage shade; fullness from a cut-up ground.

## 2. How the professionals do it
(pending: 6-12 named sources, each with the principle it teaches)

## 3. The concrete approach for our films
(pending: value plan, chroma plan, harmony method, texture spec, ranked fixes, engine piece, gate, check, cost, risk)

## 4. What it would change in v2 (the baseline)
(pending: before/after per shot)

## 5. What the owner didn't name that matters for this feeling
(pending)

## 6. Clashes with the owner's earlier words, and open questions
(pending)
