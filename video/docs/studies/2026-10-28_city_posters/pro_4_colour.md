# Pro practice 4: vibrant, coherent, premium colour, and why v2 still reads cheap

*City-poster study (2026-10-28), pro-practice 4. Analysis only: DIRECTION and the playbook stand (with the owner's
2026-10-28 answers: one look, still evolving; a VERY subtle texture to try; lit and shade faces; a full value range,
numbers from this study; v2's colours liked, so its HUES stay and this report says what moves). Numbers:
`video/scripts/look/posters/pro_4_colour.py` (`measure`, `sheets`, `simulate`, `mask`; CIE L*a*b* D65 at PHONE SCALE,
540 px wide; UI, titles and v2's caption band y 290-600 masked): 7 posters vs 10 frames of v2's G7 master (1, 3, 5.2 =
the cover, 9, 14, 17.5, 22, 26, 30.5, 36 s). Built on `style.md` (cited, not re-measured), `pro_1_depth.md` (value
groups), `pro_2_hierarchy.md` (finish ladder). Sheets: `img/pro_4_colour_{value_chroma,maps,fields,fixes}.jpg`.*

**In short.** (1) v2's hues are not the problem: on all 9 hue-harmony measures v2 sits inside the posters' range (7 %
of the measured gap); keep them. The gap is where v2 puts VALUE and CHROMA: no lower half of the value range (L* p5 48
vs 23; under L* 40 on 1.9 % vs 13.8 %, in 41 pieces vs 259) and colour living in the lights (55 % of v2's frame is
tinted pastel, the posters' 5 %), so no calm field lets an accent ring: 56 % of the gap. (2) The rest is drawing: empty
uniform fields in the world (15 % of v2's frame below the sky, the posters' 0 %), one hex per role (14 colours cover 90
% of a frame vs 29), dead-flat fills (mottle 0.24 vs 0.60 L*). A post-process grade closes only 16 % of the gap, so the
fixes are palette roles, darks drawn as pieces and filled grounds. (3) The pro way to "vibrant yet coherent" is a gamut
mask with a value-chroma plan (chroma peaks in the mids, the lights calm, only the one pop outside the mask), and a
texture that is static, world-locked and low-frequency.

## 1. The feeling, restated precisely

The owner: "very vibrant and coherently fit together. I like the colors of our last video about Google, but our video
still feels cheap and lazy as if these pictures give a very premium feel to it." Measured side by side
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
metrics). \*\* The posters are Instagram JPEGs: part of their mottle is compression blocks (visible in the x8 crops of
`img/pro_4_colour_fields.jpg`), est.; `style.md` §1.4's full-size texture (grain 0.2-0.9, mottle 0.4-0.7 L*) is the
number to build on.

**What creates the feeling, by region:**
1. **"Vibrant" is contrast, not more chroma** (as `style.md` §1.1): a big near-neutral field (Singapore's and
   Reykjavik's sky and water: paper C* 4, 40-50 % of the poster; Buenos Aires' and Kyoto's cream, L* 93 C* 7) against
   colour in the MIDS in small pieces (Singapore's shophouse row, C* >= 35 in row 3 of the value-chroma sheet; Cape
   Town's Bo-Kaap and proteas, `pro_1_depth` box 0,1300-450,1600, L* 46; Kyoto's vermilion torii by the pines). v2's
   mids are as colourful (mean C* 23.7 at L* 40-60, the posters' 18.4); it differs by tinting its lights too: its L*-C*
   map is a band at L* 60-90, the posters' a triangle peaking at L* 40-70 (`img/pro_4_colour_maps.jpg`).
2. **"Coherent" is three shared things, not one hue:** one tinted dark family (`#354F4D` teal, `#3F505C` slate), one
   lean in the calm pixels (Singapore's paper hue concentration 0.74), one key light giving every volume a lit and a
   shade face 21-37 L* apart (`style.md` §1.1-1.2). Their hues spread wider than v2's (7 families vs 5).
3. **"Premium" is density with the calm in one place:** the calm is the sky only (42 %, the frame's largest colour);
   below it no edge-free field reaches 2 %: grounds are cut into steps, facets, shadows, windows and props (`pro_2`: near
   patchwork 14.5 shapes per 10,000 px), and every shape breathes (mottle 2.5x v2's, colour mottle 2.8x).
4. **What reads "cheap and lazy" in v2:** (a) the world floats in the light half (bottom quarter L* 74-78, `pro_1`), its
   darks 14-64 pieces, the largest under 1 % (S1-S5); (b) a pastel tint on every light (stucco `#F4E4D2` C* 11, paving
   `#EFD8C2` C* 14.5, sky C* 13), so nothing rings; (c) empty fields in the world: S1's paving y 1150-1640 (12 %, L* 87
   C* 12), S4's canal bands y 1086-1206 and 1764-1918 (14 %), S6-S7's deck y ~1260-1918 (13-19 %), S8's floor
   0,1364-552,1918 (10 % at C* 32: a saturated FIELD, against rule 6); (d) one hex per role; (e) fills flat to the code
   value. Even tint and even simplicity everywhere: the default-vector look.

**What a grade can and cannot do** (`img/pro_4_colour_fixes.jpg`: a post-process on v2's cover frame, never the build).
A value curve under the sky, then calm lights with colour in the mids (no beige), then a VERY subtle mottle move 21 ->
24 -> 26 -> 26 of 38 metrics into the posters' range and cut the summed gap 55.7 -> 47.0 (-16 %): p5 55 -> 41, under L*
45 2 -> 8 %, pastel 57 -> 35 %, C*-weighted L* 76 -> 67, mottle 0.24 -> 0.57. Unmoved: the dark pieces (64 -> 62;
posters 215+), the empty ground (15 -> 12 %), the colour count (25 -> 27). Those are drawing: darks come from windows,
doorways, eaves and foliage shade, fullness from a cut-up ground.

## 2. How the professionals do it
(14 searches. gurneyjourney.blogspot.com does not resolve from this session: lines marked "(excerpt)" are search
excerpts of the named page; check them before quoting onward. Value groups and the finish ladder: `pro_1_depth` §2,
`pro_2_hierarchy` §2. On riso and gouache materiality the searches found only texture-kit vendors, not evidence.)
1. **James Gurney, gamut masking:** *Color and Light* (Andrews McMeel, 2010); "Gamut Masking Method" parts 1-3, Gurney
   Journey, 2011-09-14 to 16 (https://gurneyjourney.blogspot.com/2011/09/part-3-gamut-masking-method.html); Lines and
   Colors, 2011-09-19 (https://linesandcolors.com/2011/09/19/james-gurney-on-gamut-masking/). Premix inside a gamut
   chosen first instead of mixing from whatever pigments you have, an idea from "at least the 1920s" (excerpt); harmony
   is then built in. **Teaches:** a palette is a SHAPE on the hue-chroma wheel, chosen before painting -> §3.3.
2. **Ralph Eggleston, Pixar's colour scripts:** MoMA interview
   (https://www.moma.org/interactives/redstudio/interviews/behind/content/eggleston/assets/transcripts.php); Cartoon Brew,
   2022-08 (https://www.cartoonbrew.com/rip/ralph-eggleston-a-cornerstone-of-pixars-visual-style-dies-at-56-220781.html);
   Amid Amidi, *The Art of Pixar: The Complete Color Scripts* (Chronicle, 2011). "A map of the color"; painters got "a
   chunk of the color script" to paint within its range (excerpts). **Teaches:** coherence comes from a small reference
   made before production that hands each shot its range and value plan -> W1's colour script, G3, G4.
3. **Mary Blair (Disney):** John Canemaker, *The Art and Flair of Mary Blair* (Disney Editions, 2003, updated 2014);
   Walt Disney Family Museum, "Magic, Color, Flair" (2014, https://waltdisney.org/exhibitions/magic-color-flair-world-mary-blair).
   Ollie Johnston, quoted by Canemaker: "Walt told us to get Mary Blair's stuff on the screen, but it was impossible.
   Her stuff is very flat!" **Teaches:** flat is not cheap when the colour design is deliberate; flatness fights depth
   and motion, so our depth comes from value groups (`pro_1`), never from rendering.
4. **Josef Albers, *Interaction of Color*** (Yale University Press, 1963; 2013 edition); the Albers Foundation's "One
   color becomes two" (https://www.albersfoundation.org/learning/workshops/one-color-becomes-two). "A color has many
   faces": a colour is read against its neighbours. **Teaches:** vibrancy is relative; v2's accents sit among C* 13
   pastels and read duller than their numbers -> calm the lights before pushing an accent (§3.2).
5. **Hue templates (Matsuda, *Color Design*, 1995) in Cohen-Or, Sorkine, Gal, Leyvand, Xu, "Color Harmonization"**,
   ACM TOG 25(3):624-630, SIGGRAPH 2006 (https://doi.org/10.1145/1141911.1141933): harmonious images' hues fit a few
   sector shapes, scored by how far the colour falls outside. **Teaches:** "coherent hues" is measurable; v2 scores
   inside the posters' range (§1) -> the score guards the brand when siblings or palettes are added.
6. **The poster tradition, few inks and flat blocks:** V&A, "A short history of the poster" (undated,
   https://www.vam.ac.uk/articles/a-short-history-of-the-poster): Chéret's three-stone lithography, every colour its own
   stone, so few inks, each with a role; Tom Purvis, 100+ LNER posters 1923-1945 (Science Museum Group,
   https://collection.sciencemuseumgroup.org.uk/people/ap19): "large blocks of vivid flat colour", detail eliminated
   (https://en.wikipedia.org/wiki/Tom_Purvis). **Teaches** (our reading, est.): a few inks reused in many places make a
   flat picture cohere -> sibling tints as a film's inks (§3.3).
7. **Barbara J. Meier (Walt Disney Feature Animation), "Painterly Rendering for Animation"**, SIGGRAPH 1996, pp.
   477-484 (https://disneyanimation.com/publications/painterly-rendering-for-animation): strokes ride on particles
   attached to the moving surfaces. **Teaches:** texture belongs to the surface, never to the screen -> the mottle is
   locked per parallax plane (`style.md` §1.4: screen-locked cost 6.2x the bitrate and still smeared).
8. **Bénard, Bousseau, Thollot, "State-of-the-Art Report on Temporal Coherence for Stylized Animations"**, Computer
   Graphics Forum 30(8):2367-2386, 2011 (https://diglib.eg.org/handle/10.1111/v30i8pp2367-2386); Bénard et al., "A
   Dynamic Noise Primitive for Coherent Stylization", EGSR 2010 (https://artis.inrialpes.fr/Publications/2010/BLVLDT10/).
   Texture in motion trades flatness, coherent motion and temporal continuity; in their user study coherent motion
   mattered most. **Teaches:** static, world-locked, low-frequency texture is the safe corner; re-seeding or boil breaks
   continuity; a big zoom needs an octave blend -> §3.4.
9. **Netflix, AV1 film grain synthesis** (Netflix Technology Blog, 2025,
   https://netflixtechblog.com/av1-now-powering-30-of-netflix-streaming-02f592242d80; Broadband TV News, 2025-07-04,
   https://www.broadbandtvnews.com/2025/07/04/netflix-film-grain-synthesis-saves-on-the-bitrate/): grain is random, so a
   codec spends bits on it or smears it; Netflix strips it before encoding and re-synthesises it in the player (~36 %
   less bitrate at 1080p and up, ~10 % below, where downscaling filters it out: trade report). **Teaches:** fine grain is
   the costliest, least robust layer; short-form platforms re-encode without synthesis (est.) -> mottle, little grain.

## 3. The concrete approach for our films
Per frame, outside the caption band, at phone scale (`pro_4_colour.py measure`): WARN signals for a judge, never quotas.

**3.1 The value plan (adopts `pro_1_depth` §3.1, adds where the darks come from).** pro_1's groups as they are: L* < 65
on >= 25 % of the frame, 65-80 on <= 20 %, >= 30 L* from the near group to the air, a >= 15 L* jump to the far group.
Added: L* p5 <= 32 (posters 20-34, v2 40-59); under L* 40 on 6-10 % (posters 8.5-24, v2 0.7-5.3; pro_1 says 5-10,
`style.md` 6-15: their overlap), in >= 120 pieces of >= 4 x 4 px at 1080 (posters 215-324, v2 14-64; v1 reached 123-325
with its line work), in >= 9 of 16 grid cells (posters 9-12, v2 4-8); one near mass at the frame edge may hold one dark up
to ~5 % (Cape Town 5.2, Copenhagen 5.8; Hanoi's and Kyoto's foliage 11-12 %). The darks are drawn things: windows and
their reveals, doorways, the undersides of eaves, awnings and boats, the shade under trees, a hull, hair and coats; never
a darker grade (the ladder's curve left the pieces at 62). None in the caption band or the far planes. The lights need
nothing: p50 and p95 already match (83 / 90).

**3.2 The chroma plan (v2's hues kept; chroma moves by value).** (a) Calm lights: a big light fill (L* >= 86: walls in
light, lit paving, paper) takes C* 4-8, its hue kept (warm cream at h 70-90 is not beige above L* 86: `lib/water.tsx`
`neverBand`); the one cool field (the sky, or the canal) C* 9-11 (v2 13). (b) Pastel (L* >= 75, C* >= 10) on <= 25 % of
the frame, the cool field included (posters median 5 %, Hanoi 43 %; v2 38-61 %). (c) Colour in the mids: L* 45-75 at C*
18-32, where v2 already is (23.7 at L* 40-60): keep, don't push; C*-weighted mean L* <= 68 (posters 58-67, v2 69-77). (d)
No beige: a warm fill (h 55-95) under L* 86 takes C* >= 18 (apricot, gold) or turns rose (h < 55), as `cleanColour`
does. (e) Accents C* >= 35 on 2-6 % in >= 25 parts, none over 1.5 %, no static accent in the top third (posters: 0 % in
6 of 7; v2 median 13 %, its sun is the pop by design); C* p90 / p50 >= 2.5 (`style.md`). Order: value first (the
ladder's value step alone took pastel 57 -> 46 %), then calm the lights if the accents still don't ring.

**3.3 Harmony: a gamut mask, one shade family, sibling tints.** (a) **The Canal Mint mask** (Gurney's method; `pro_4_colour.py
mask`, drawn on `img/pro_4_colour_maps.jpg`): three lobes, warm terracotta-gold (h 0-90, C* up to 28-52), teal-mint (h
165-205, 24-38), slate-plum (h 240-330, 18-26); olive (h 95-118) held to C* 7, leaf sage (h 130-165) 18-32; times a
value-chroma envelope (x0.7 at L* 0, x1 at 15-72, x0.55 at 80, x0.3 at 88, x0.22 at 96: chroma peaks in the mids, as the
posters' L*-C* triangle does). Outside by design: the one pop and light sources (lamps). v2's frames have 3-11 % of
pixels outside (the sun, lamp glow, warm sky bands); its roles outside: `bandGold`, `bandSunset`, `sage` (C* 17 at L*
77, limit 14), `blossom`, `pipEar`, `pipScarf`, and the caption `box` (UI). The posters fall 10-62 % outside (their olive
and yellow-green): the mask is our brand's, not theirs. (b) **One shade family** (rule 5): every shade face takes the
rig's family (lavender on whites, plum-rose on warm walls, slate deepest: `style.md` §1.2), the posters' strongest glue
after the shared paper. (c) **Siblings:** each fill role gets 3-5 tints (hue +-8 deg, L* +-4-10, C* +-3-6, dE76 8-14
apart, inside the mask, none in a never band), reused across facades, boats, awnings and clothes like a poster's few
inks, so >= 20 colours cover 90 % of a frame and >= 25 hold >= 0.5 % (posters 18-50 and 26-35; v2 9-21 and 17-27); tints
under dE 6 apart read as mistakes (est.). (d) The template scores and the hue concentration stay in the posters' range.

**3.4 Texture and in-shape variation (the owner's "VERY subtle"; agrees with `style.md` §1.4 and its lesson 3).** Mottle
only, first: static, locked per parallax plane (Meier; Bénard et al.), std <= 0.5 L* in 30-70 px blotches at 1080,
colour <= 0.35 a*b*; strength by tier and plane as `pro_2` §3.1 (A and B x1, near C x0.7, far C x0.4), the sky ~x0.6
(est.: it has its gradient and dither), none in the caption band (rule 10; `style.md` question 1). Grain: none, or <=
0.25 L* at ~2.5 px, static, never re-seeded. Variation across a big shape comes as flat steps, never a gradient (the sky
is the one gradient, rule 6): a ground over 2 % of the frame is cut into 2-3 bands or facets at dL* 2-4 far, 4-10 near
(`pro_2`'s C tier), lighter toward the key. Zooms scale the texture with the world; past ~1.2x it crossfades to the next
octave (Bénard et al. 2010; est.). Cost through H.264 (`style.md`, v2 S1 panning at 60 fps): mottle only: +27 % master
bitrate, 84-95 % kept after the platform's 1080p and 720p rungs, frame-to-frame dL* 0.069 (none 0.048), `check_banding`
PASS; plus grain at the subtlest posters' level: +48 %, the grain halves at 720p, 0.108 (shimmer starts), WARN. *Where
the numbers differ:* `pro_2`'s texture (1.5 / 2.4 / 1.1 / 0.7 std L*) is full-size with grain and JPEG in it, mine
phone-scale (posters 0.34-0.77): take the amplitude from `style.md`, the plane ratios from `pro_2`.

**3.5 Filled fields.** Below the sky, no edge-free field over 2 % of the frame (posters 0-2.3 %, v2 0-32 %), except a
surface the story reads (a document, a screen: declared). A big ground is cut by light (shade bands, shadows cast from
things off-frame, `lib/light.tsx`), the patchwork (`style.md` lesson 4), joints and small props, at low contrast
(neighbour steps dL* 4-10, `pro_2`) so the subject keeps tier A's contrast.

**3.6 The fixes for "cheap and lazy", ranked** (gain est. = the gap share x how early the cue reads: value and empty
grounds read at thumbnail size in the first second, colour count and texture at a second look):

| # | Fix | Gap share | Gain (est.) | Engine piece | Gate | Check | Cost | Risk |
|---|---|---|---|---|---|---|---|---|
| 1 | Darks drawn in pieces, a mid-tone near group (3.1) | 34 % | ~30-35 % | palette dark roles; kit pieces (windows, doors, eaves); `lib/depth.ts` PLANE_STEPS | W1 colour script, G3 grey board, G4 | `scripts/qa/colour_meter.py` new `--profile poster`: p5, dark %, pieces, cells (port `pro_4_colour.py` `value_plan`) | S-M | heavier frames than "very soft" (2026-10-25) |
| 2 | Calm lights, colour in the mids (3.2) | 22 % | ~20-25 % | the palette (3.7); new `src/lib/gamut.ts` (`envelope`, `inMask`, `calmLight`) | W1, G4 | the profile: pastel %, C*-weighted L*, p90 / p50, accent parts and top-third share | S | calm creams read greige on a phone: judge in G4, C* 8 at worst |
| 3 | Fill the grounds (3.5) | 13 % | ~15-20 % | `lib/light.tsx` bands; `patchwork.tsx` (`style.md`); `lib/kit` | G3 (where density lives), G5 | the profile: edge-free fields below the sky | M | a busy ground competing with A |
| 4 | Sibling tints (3.3c) | 12 % | ~10 % | `gamut.ts` `siblings(hex, n, seed)` on `neverBand` | W1, G4 | colours covering 90 %; `pro_4_colour.py mask` on the palette | S | near-matches look like errors |
| 5 | VERY subtle mottle (3.4) | 11 % | ~5-10 % (holds, the cover) | new `src/lib/texture.tsx` (a seeded tileable mottle per plane) | G4 A/B; applied after G6 | `check_banding.py` texture mode (`style.md`); mottle 0.3-0.6 L*; hold dL* <= 0.08 | M | shimmer, bitrate |
| - | Hues | 7 % | none | keep | - | template scores stay in range | - | - |

The other lenses own the rest of the "cheap" read, in the same direction: the shade-face depth (`style.md` lesson 2:
posters -29 L* median, ours -7 to -12) belongs to fix 1; the line (`style.md` §1.5, the A vs B picture) and the
patchwork (`style.md` lesson 4) to fixes 1 and 3.

**3.7 A sister palette: "10b Canal Mint, full range" (a proposal; not added to `palettes.json`).** v2's roles, every
hue within 7 deg of v2's; only L* and C* move. Passes the never-band lint (the ink is flagged as ever, `style.md`), the
mask (the pop outside by design) and the DNA (bg L* 86 C* 10; hero C* 33; anchor L* 17; pop C* 74; ink 11.6:1 on the
sky, v2 11.3:1).
```json
{"name": "10b Canal Mint, full range (proposal)", "mood": "v2's Canal Mint with the city posters' value and chroma plan: a calmer mint sky, cream-paper lights, colour in the mid-tone brick, water and sage, slate and plum darks in many small pieces; hues unchanged.",
 "colors": {"bg": "#C5DDD3", "ground": "#E9DED3", "disc": "#EE6A2E", "hl": "#F6B892", "line": "#9A563C", "skin": "#D9A27E", "hero": "#0B8577", "anchor": "#36223A", "pop": "#EE6A2E", "ink": "#2B1B0A"},
 "support": {"calm_lights": {"colors": ["#F0E7DD", "#EAE5DC", "#F9F3E8", "#D6E6DF", "#EFD9C4"], "role": "stucco, limestone, paper, the high sky, the gold horizon band: C* 5-14, v2's hues"},
             "facade_siblings": {"colors": ["#F2EDE6", "#E8DACF", "#E6BFA7", "#D6A695", "#CDBCCA", "#E3A88C", "#C9806A"], "role": "facades, boats, awnings: patches under 1-3 % each"},
             "darks": {"colors": ["#3A5065", "#6B4B5F", "#36223A"], "role": "windows (paneUnlit, L* 33), eave and doorway shade (L* 36), the anchor: 6-10 % in many pieces"},
             "shade_family": {"colors": ["#A9A3B8", "#CFAFA4", "#8C5E6B", "#6F80A0"], "role": "tier-A stone shade (-24 under lit stucco), paving in shade (rose, never beige), warm and cool form shade"},
             "water_greens": {"colors": ["#86B4AC", "#59908A", "#8DA889"], "role": "the canal (L* 70 / 56: a mid-tone field, not a pale one), leaf sage (L* 66)"}}}
```
What moves (v2 -> 10b): the lights' C* (sky 13 -> 10, stucco 11 -> 6, lit paving 14.5 -> 7, plus a rose `pavingShade`);
the L* of water (77 -> 70 / 56), windows (`paneUnlit` 46 -> 33), sage (77 -> 66) and stone shade (80 -> 68: tier A only,
B and C keep -7 to -12 via `lib/light.tsx` `FormShade`); `coatOat` leaves the beige band; a new `eaveShade`. The brick
family, hero, anchor, pop, line, ink and caption box are unchanged. `style.md`'s Poster Harbour and Lantern Paper stay
the options for a new place film; 10b is the next step for the look we have.

## 4. What it would change in v2 (the baseline)
v2 is shipped: this shows what the rules would change on its frames (boxes in 1080 x 1920 px; "before" measured).
- **S1 (0-6.1 s) and the cover (5.2 s).** Before: p5 55-59; under L* 40 1.7-2.0 % in 16-64 pieces; pastel 56-57 %; the
  paving y 1150-1640 in four empty fields (12 %, L* 87 C* 12). After: the café set and planter as the near group at L*
  50-60 (`pro_1`); windows in `#3A5065` with dark reveals, doorways and awning undersides in `#6B4B5F` (+60-100 pieces,
  est.); the paving cut by the facades' shade band (`#CFAFA4`) and joints; stucco `#F0E7DD` with its siblings. Targets:
  p5 <= 32, darks 6-10 %, pastel <= 25 %, empty ground <= 3 % (direction: `img/pro_4_colour_fixes.jpg`).
- **S2 (@9.0).** Before: the boards y 1560-1918 in five empty fields (L* 75-82, C* 13-14, h 55-61: beige by the lint);
  darks 2.4 % in 47 pieces. After: lit and shaded boards (`#E9DED3` / `#CFAFA4`), plank seams as 2 long bands (CRAFT §c).
- **S3-S4 (@17.5).** Before: canal bands y 1086-1206 and 1764-1918 (14 %), towpath strips y 1348-1604 (8 %); mottle
  0.10, the flattest frame. After: the canal at `#86B4AC` / `#59908A` carrying the facades' mirror (`lib/water.tsx`); the
  towpath cut by bollards, rings and a shade band; the terrace windows in `#3A5065`.
- **S5 (@22.0).** Before: the fewest darks (0.7 %, p5 59); 29 % of the accents in the top third. After: the blossom
  crowns as the near frame with plum undersides (`pro_1`); trunks and the shade under them as darks.
- **S6-S7 (@26.0 / 30.5).** Before: the deck y ~1260-1918 in 4-6 empty fields (13-19 %, L* 87); the deal card (8 %, L*
  96) is a reading surface, kept calm. After: the deck lit and shaded, the railing's shadow across it, plank seams.
- **S8 (@36.0).** Before: the floor 0,1364-552,1918 is a saturated FIELD (10 % at C* 32). After: a calm light or a mid
  apricot (C* <= 22) cut by the light; the accents back to confetti.
- **Everywhere:** the sky `#C5DDD3`, the hues unchanged, the mottle last (after G6) if the G4 test keeps it.

## 5. What the owner didn't name that matters for this feeling
1. **The calm lives in one place.** The posters' calm is one big field (the sky, 42 %, their largest colour); all below
   is dense. v2 spreads calm everywhere (its largest colour 28 %, 15 % empty ground): premium is the contrast of density,
   not even simplicity.
2. **Vibrancy needs darks.** The posters' accents sit beside L* 18-30 darks (Kyoto's torii by the pines, `style.md`
   §1.1): the darks frame the colour, so fix 1 is also a colour fix. And the hero leads by value and finish, not chroma
   (5 of 7 landmarks are the palest mass): never answer "premium" by saturating the subject.
3. **The top third stays calm** (no accent there in 6 of 7 posters): for us it borders the caption band and the UI zone.
4. **The platform's encode is part of the colour pipeline:** dark pieces under ~4 px and 1 px dark lines soften into
   their fill on the 720p rung (est., from `style.md`'s grain loss): check the darks and the mottle on the re-encode.

## 6. Clashes with the owner's earlier words, and open questions
- **The dark share.** DIRECTION rule 6 and PALETTE's DNA: "one tinted dark anchor (~5 %)"; this study: 6-10 % under L*
  40 in many pieces. As `style.md` notes, the anchor is the darks' hue family, not their cap; the owner approved the full
  range ("5 - good point too!"), the number is the owner's call.
- **The shade-face depth.** 10b's tier-A shade face (-24) goes past rule 5's "gentle in value" (CRAFT §d.3 -7 to -12):
  the same open question as `style.md` question 2, not a new one.
- **No clash, but watch:** "very soft ... no screaming colours" (playbook, 2026-10-25) holds (a calmer base, accents
  as confetti; the new weight is in the darks), and so do rule 4's "big areas flat" (filled grounds are flat steps and
  things, not marks; rule 10's caption band: `style.md` question 1) and "I like the colors of our last video" (10b keeps
  every hue; whether it still reads as v2's colours is the owner's eye, question 2).

**Open questions (at most 3):**
1. May a frame carry 6-10 % under L* 40 in many small pieces (windows, doorways, eaves), above the ~5 % anchor?
2. 10b against v2 on the cover frame: are cream-paper lights (C* 5-7 instead of 11-15) still "the colours of the Google
   video"?
3. The sun: the posters keep the top third free of saturated colour; keep v2's orange sun disc (the pop) as is, or calm
   it toward the warm sky band unless it is the shot's "look here"?
