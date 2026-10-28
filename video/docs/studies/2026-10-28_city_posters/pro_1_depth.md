# Pro practice 1: depth and scale (the city-poster study, 2026-10-28)

**Feeling 1, the owner's words:** "the pictures feel like they have "depth" like some buildings are obviously closer to
me, some further out and there is something WAY further out that gives me a sense of scale."
A study, not a rule change (README). It builds on DIRECTION rules 2, 6 ("a full value range", owner 2026-10-28: "good
point too!"; "the numbers come from the city-poster study"), 7 and 8, CRAFT §f, COZY_AND_SCALE §4, CINEMATIC_GUIDE
"Scale cues". **Numbers:** `video/scripts/look/posters/pro_1_depth.py` (CIE L*a*b*, UI masked with `ui_mask.json`;
boxes placed by eye, drawn on `img/pro_1_depth_planes.jpg`); `check_depth.py` on v2's master at its sheets' own times.
**Sheets:** `img/pro_1_depth_planes.jpg`, `img/pro_1_depth_value_groups.jpg`, `img/pro_1_depth_anchors.jpg`.
**Sources:** 26 web searches; opening pages was blocked in this session (blog.camposanto.com and thumbsticks.com did not
resolve), so quotes marked (excerpt) are search-engine excerpts of the page named: check them before quoting onward.
k = the share of the way a plane's L* has moved from the near planes' median toward its air (k_L, our measure).

## 1. The feeling, restated precisely
The posters build depth from **two value groups with a jump of air between them, and one huge, calm, air-coloured
shape behind it all**. Measured (sheet `value_groups`, `planes`, `anchors`):
1. **Near and far are different values, not just different sizes.** The posters put L* < 65 on 27-48 % of the
   picture and L* >= 80 on 44-59 %, with only 8-14 % in between (65-80). The near planes (bottom quarter) sit at a
   median L* 47-59, darks (p5) 8-25: **from the near ground to the air the value spans 27-46 L***. v2 (5 frames, caption
   band left out): L* < 65 on 11-17 %, the in-between 21-47 %, the bottom quarter at L* 74-78 (p5 48-63): **its whole
   ladder spans 10-15 L*** (air #FDD6B8 L* 88). That is the "narrow band of light pastels" the new rule 6 names.
2. **"Obviously closer"**: the near group is darker, more saturated, cut by the frame edges and big. Cape Town's proteas
   (box 0,1300-450,1600: L* 46, range 72) and Bo-Kaap (L* 57, C* 18), Kyoto's torii (L* 38, C* 35), Hanoi's pagoda
   (L* 39, range 82), Copenhagen's railing and rock: every poster has a foreground cut by 1-2 edges (repoussoir).
   Windows shrink about 2.5-3x per step (est. from the grid crops: near 30-60 px, mid 10-25, far 3-8, none on the
   anchor), the mid group stays at k <= 0.3 (Hanoi's lake and tower 0.30; MBS, Harpa, Nyhavn, Kinkaku-ji -0.06-0.14).
3. **A gap of air:** between the hero's group and the far group the value jumps 19-36 L* (Reykjavik Harpa 52 ->
   mountains 75; Hanoi 61 -> far city 80; Copenhagen 55 -> far dome 78; Kyoto 52 -> ranges 82/88; Singapore 59 -> ghost
   towers 84), and the distance in between is water or hidden: the sea (Reykjavik y 1000-1100, Cape Town, Singapore), a
   river (Buenos Aires y 836-900, k 0.47), a lake (Hanoi), a valley hidden behind the temples (Kyoto). Nothing of middle
   size sits in the gap: the eye jumps from "near" to "WAY out".
4. **The "WAY further out" thing** (6 of 7 posters; Copenhagen's is the weakest): one wide, simple, air-coloured shape
   on the horizon, overlapped by nearer planes, leaving the frame at a side:

   | Poster | Anchor | W x H, band (% of H) | dE to air | C* (air) | L* range (near) | k |
   |---|---|---|---|---|---|---|
   | Reykjavik | Esja range, snow tops | 67 % x 6 %, 55-61 | 8.3 | 3.8 (4.9) | 36 (60) | 0.73 |
   | Cape Town | Table Mountain | 100 % x 20 %, 38-58 | 34.2 | 3.9 (3.7) | 24 (72-75) | 0.09 |
   | Kyoto | two flat ranges | 67 % x 10 %, 40-49 | 5.1 / 10.8 | 6.1 / 4.1 (6.1) | 6 / 13 (torii 37) | 0.89 / 0.77 |
   | Hanoi | far city towers | 67 % x 14 %, 35-50 | 13.1 | 13.4 (12.7) | 36 (65-82) | 0.72 |
   | Buenos Aires | river horizon, far shore | 75 % x 1 %, 52-53 | 15.6 | 2.1 (6.3) | 32 (65-70) | 0.69 |
   | Singapore | ghost slabs at both edges | 11 % x 44 %, 17-61 | 3.5 | 5.9 (3.5) | 5 (70) | 0.92 |

   Read: the anchor takes **the air's chroma** (C* within ~4 of it) and **a fraction of the near contrast** (0.07-0.6x;
   the flat ones 0.07-0.36x); it is pale (k 0.69-0.92, within dE 3.5-16 of the air) unless it is itself the
   hero of the view: Cape Town's mountain keeps its value (L* 54) and recedes by chroma, a cool hue (259 deg against
   the warm near 36-68 deg) and a third of the near contrast. It has **a pale foot**: Reykjavik's slope (L* 67) lifts
   to 77-81 in a 16 px mist line at its base (y 986-1002); Cape Town's body (L* ~50) lifts to 53-65 toward the city
   line (y 860-960); Kyoto's ranges dissolve into ghost blocks. **Tiny known things** sit at its foot: Cape Town's far
   city (houses ~3-6 px, est.),
   Buenos Aires' far towers (~30 px, 2 % of H), Reykjavik's ship. Nothing in any far group is a strong contrast:
   there is no sun disc in any poster.

## 2. How the professionals do it
- **Disney, the multiplane camera** (first used on *The Old Mill*, 1937; Walt Disney Family Museum educator guide,
  https://www.waltdisney.org/sites/default/files/WDFMMultiplaneEducatorGuide.pdf): up to seven layers of painted glass
  at different distances, moved at different speeds. Walt's demonstration in *Tricks of Our Trade* (Disneyland TV,
  1957-02-13; https://d23.com/this-day/abc-airs-tricks-of-our-trade-on-the-disneyland-tv-show/): pushing into one flat
  painting made the moon grow, "which does not happen in reality" (excerpt); on the multiplane the moon keeps its size
  while the near layers pass. **Teaches:** planes move and scale by distance; the far anchor never grows in a push.
- **James Gurney on the air** (*Color and Light*, 2010; Gurney Journey): "Atmospheric distance and value" (2013-07,
  http://gurneyjourney.blogspot.com/2013/07/atmospheric-distance-and-value.html): each layer of air is a veil that
  lightens darks by a fixed proportion, so the change with distance is geometric, and objects take the colour of the
  atmosphere (blue under a blue sky, warm under a sunset); "Reverse atmospheric perspective" (2007-09): near sunrise
  or sunset the scene warms with distance; James Perry Wilson (2009-01, .../2009/01/james-perry-wilsons-dioramas-part-2.html):
  darks are hit first (far shadows turn violet, then blue), lights (clouds) turn yellowish or pinkish. **Teaches:** one
  geometric ladder toward the AIR's colour, the darks converging fastest. Our PLANE_STEPS already are this ladder
  (each plane twice as far: k = 1 - 0.88^(2^(n-1)) = 0.12 / 0.23 / 0.40 / 0.64); the next doubling is **0.87**,
  exactly the posters' ghost anchors (0.89-0.92).
- **James Gurney on scale**: "Scale Tip" (2009-07, .../2009/07/scale-tip.html): to make a thing look gigantic,
  "exaggerate the contrast between large, soft forms and tiny, sharp details" and skip the middle sizes; "The Toy Boat
  Problem" (2013-08): a thing reads its true size only at the right distance under the horizon; "Figures in Landscape"
  (2021-05): figures give scale and let viewers project themselves; "Painting Big, Painting Small" (2014-11): Meissonier,
  small pictures need bolder relief. **Teaches:** the anchor is one huge soft mass plus tiny sharp things at its foot;
  a phone screen is a small picture, so our steps must be bolder than a print's, never subtler.
- **Firewatch** (Campo Santo, 2016; Jane Ng, "The Art of Firewatch", GDC 2015, https://gdcvault.com/play/1022295; art
  direction from Olly Moss's poster): "beautiful and bold colours ... in very distinct layers. Each layer adds to a
  feeling of depth and distance" and "the biggest chunk of colour is actually determined by the sky" (Thumbsticks'
  write-up of the talk, https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch, excerpt); Moss asked distant trees
  to get more stylised and less detailed as they recede (Campo Santo blog, 2015-03, excerpt); the website's header art
  scrolls as layers at different speeds (a remake:
  https://medium.com/@hamstu/recreating-the-firewatch-parallax-effect-213694d42f4e). **Teaches:** few distinct colour
  layers set by the sky; LOD by plane; the poster's layers ARE the parallax planes.
- **Cartoon Saloon, *Wolfwalkers*** (2020): mostly flat backgrounds (Maria Pareja, art co-director,
  https://thegeekiary.com/?p=91768); the background task was depth "through value, hue, and saturation shifts between
  layers of hills and buildings while keeping the image flat" (a background artist's ArtStation page,
  https://almuredondo.artstation.com/projects/PevPeo, excerpt); layers at different distances in After Effects, in the
  multiplane's line. **Teaches:** our exact setting: flat fills, no blur, depth only by value, hue and chroma steps.
- **Hiroshige, *One Hundred Famous Views of Edo*** (1856-58): 118 VERTICAL prints that frame a distant view with large
  foreground elements (Fuji Arts, https://www.fujiarts.com/edo-era-japanese-prints/hiroshige/1202798-hall-of-thirty-three-bays-fukagawa-1857;
  UMMA on *Fukagawa Susaki*, "striking figure-ground framing"; Henry D. Smith II, "'He Frames a Shot!'", *Orientations*,
  2000, https://academiccommons.columbia.edu/doi/10.7916/nh49-as66). **Teaches:** the 9:16 grammar of depth: a huge
  near thing cut by the edges, a small far view, little in between (repoussoir: "an element placed in the immediate
  foreground ... to direct the spectator's eye into the picture", AAT via the Fitzwilliam,
  https://collection.beta.fitz.ms/id/terminology/term-3065).
- **Hokusai, *The Great Wave*** (c. 1830-32): Hokusai "positioned a small Mount Fuji within the midst of a thundering
  seascape" (Art Institute of Chicago, https://www.artic.edu/artworks/24645); he uses Western perspective "to maximize
  the sense of distance" (MMFA, https://www.mbam.qc.ca/en/hokusais-the-great-wave-anecdotes/); the near wave echoes
  Fuji's shape. **Teaches:** the anchor can be small if it is unmistakable; a near shape can rhyme with it.
- **Guo Xi, the three distances** (*Lofty Message of Forests and Streams*, 11th c.; *Early Spring*, 1072; Aisthesis,
  https://mimesisjournals.com/ojs/index.php/aisthesis/article/view/4221): high, deep and level distance composed as one
  vertical panorama, thin mist over the mountains. **Teaches:** in a tall frame depth climbs UP the picture; a mist
  band between groups (our reading of the scroll, est.) separates them like the posters' pale foot.
- **Travel and park posters:** Roger Broders (PLM, 1920s-30s) built mountain scenes in three planes ("foreground,
  viewpoint, background", a book on Broders quoted by Chairish) and from 1925 in "large flat areas of bright colors"
  (Swann Galleries, 2022-07, https://www.swanngalleries.com/news/vintage-posters/2022/07/artist-profile-roger-broders/);
  the WPA national-park posters (1938-41) are hand-pulled silkscreens in a limited palette (NPR, 2014-05-26,
  https://www.npr.org/transcripts/314941202). **Teaches:** a few flat inks, one per plane, the far plane one pale ink.
- **Kazuo Oga (Ghibli backgrounds):** "a sky or feathering clouds, misty distant mountains, rocks, plants ... everything
  rough is done only by this large hira-fude" (Oga, quoted on https://drawingatduke.blogspot.com/2010/11/kazuo-oga.html,
  2010-11-21); his aim is the essentials, not every detail (Animation Obsessive,
  https://animationobsessive.substack.com/p/what-kazuo-oga-thinks-about-when). **Teaches:** the far is drawn with the
  biggest tool: fewer, larger shapes (the posters' faceted far "low poly").
- **Value design first:** Nathan Fowkes (Schoolism, https://schoolism.com/courses/painting/landscape-sketching-in-watercolor-and-gouache-nathan-fowkes):
  "our first read is based on its overall value structure", built by grouping values; storyboard practice (Klaus
  Scherwinski in our `STORYBOARD_STYLE.md`: the front darkest, the middle "a medium grey flat area", the far washed
  out). **Teaches:** decide the value groups in grey before colour: our G3 board is exactly that place.
- **Layered 2D games:** *Ori* (Airborn Studios for Moon: "a layered painterly look that has depth to it and doesn't look
  as flat as 2D games often do", https://airborn-studios.com/projects/ori; it adds depth-of-field blur, which we don't
  take: CRAFT §f); parallax by a speed factor per layer, background slower, foreground faster (Tuts+,
  https://code.tutsplus.com/parallax-scrolling-a-simple-effective-way-to-add-depth-to-a-2d-game--cms-21510t). Our
  Arcane measurements (CINEMATIC_GUIDE "Scale cues": 5-7 planes 2.2-3x smaller each, flat steps doubling) say the same.

## 3. The concrete approach for our films
**3.1 The plane ladder: two groups, a gap, a far group** (k = CRAFT §f.2's flat step toward the air, `recede`; the
posters' k_L reads about the same where a plane's own colours sit near the near group's values, est.):

| Group | Planes | k | Value target (median L*) | Chroma, contrast | Detail | Posters (measured) |
|---|---|---|---|---|---|---|
| near (frame) | -2, -1 | none; 5-14 L* darker than plane 0 (§f.2) | 45-60 | the frame's highest C*; range 50-75 | biggest parts, cut by 1-2 edges | bottom quarter p50 47-59 |
| hero | 0, +1 | 0, 0.12 | 50-68 | the subject owns the contrast (rule 2) | full | k <= 0.3 |
| gap | +2 (+3) | 0.23, 0.40 | one flat field: water, a valley floor, a haze strip, or hidden | range <= 25 | none | water in 5 of 7 |
| far | +3, +4 | 0.40, 0.64 | the jump: >= 15 L* above the hero group | C* -> the air's +-4; <= 0.4x the near range | tone-on-tone | k 0.69-0.77 |
| ghost | +5 (new) | 0.87 | within dE 6 of the air | <= 6 L*, 2 values | flat facets | k 0.89-0.92 |

Rules a builder follows: the frame spans **>= 30 L* from the near group's median to the air** (posters 27-46; v2 10-15);
L* < 65 on >= 25 % of the frame outside the caption band and the in-between (65-80) on <= 20 % (posters 27-48 / 8-14;
v2 11-17 / 21-47); the real darks (< 40) go "where the eye should go" (rule 6: windows, a hull, the shade under trees)
and stay ~5-10 % (rule 6's dark anchor ~5 %; posters 9-25 %); keep the film's HUES (the owner likes v2's colours) and
move VALUES by group. One plane is skipped or flat between hero and far (the gap). 5-7 planes per exterior.

**3.2 The far scale anchor** (declared per exterior set in W1; drawn new per film from the story's own world: a ridge,
the sea horizon with a far shore, a far skyline with one landmark, a bridge, gasholders):
- **Where (9:16):** its top under the caption band (y >= 620), its base on the horizon (y ~850-1050, 45-55 % of H),
  its peak or landmark inside x 120-950; >= 65 % of W and off >= 1 side edge; 6-20 % of H tall (posters' 1-20 %).
- **How pale:** plane +4 (k 0.64) with a +5 ghost behind it (k 0.87) or as the anchor itself; dE to its air 4-16 (the
  ghost <= 6); C* = the air's +-4 (our warm air #FDD6B8 is C* 22, so the anchor stays a warm-lilac or peach tint, never
  under C* 8); hue within 30 deg of the air's; L* range <= 0.4x the near group's, <= 3 values; real detail (snow,
  strata, windows) only tone-on-tone (`toneOnTone`, within 15 L*). The Cape Town variant (a mid-valued, desaturated,
  cool mass) only when the anchor is the view's subject.
- **Its foot:** the bottom 10-15 % of its height one flat step nearer the air (+0.1-0.15 k, >= +5 L*): the mist line.
- **Overlap and scale:** >= 1 nearer plane crosses its base (a roof, a tower, a crown); tiny known things at its foot
  (far roofs without windows, a boat, a lighthouse, a flock) at 1/20-1/40 of its height (Gurney's scale tip).
- **Calm:** tier C (no line, rule 4); nothing in the far group out-contrasts the subject's separation (the sun disc too).

**3.3 9:16 with the caption band in the sky:** the air group owns y 0-600 (the band stays one calm field: rule 10), the
anchor sits just under it (y 620-1050), the hero group in the read zone (y 600-1480), the near group's darkest, least
important masses at the bottom (y > 1520, under the platform UI: dressing may run there, keys never) and the side edges.
The frame reads dark-near at the bottom and edges, pale-far toward the middle: Guo Xi's and Hiroshige's vertical depth.

**3.4 Motion:** **the float** moves each plane by 1/z, the same law as its drawn size and as CineCamera
(`f = 1 - depth`, "1/distance"): near ground 1, plane 0 0.6, +1 0.24, +2 0.10, +3 0.04, the anchor, ghost and sky 0. Today's
`PARALLAX_K` (+1 0.45, +2 0.35, +3 0.15, +4 0.05) moves +1 and +2 1.9x and 3.6x more than their size says, and its
neighbours from -2 to +2 are 1.2-1.4x apart where COZY_AND_SCALE §4 asks >= 1.8x: mid planes slide like cards.
**Pushes** are dollies (ShotCam/CineCamera already: far layers grow less): the anchor on a layer of depth >= 0.95 grows
<= 1 % while the subject plane grows 6 % (Disney's moon). **Scale moves** reveal the anchor: K3's ledge falls while the
anchor rises 0.15x; K4's world shrinks round an anchor whose size barely changes. Life near it is "huge means slow"
(Scale cues 10).

**3.5 Engine, gate, check, cost, risk**
| Technique | Engine | Gate | Check | Cost | Risk |
|---|---|---|---|---|---|
| Two groups + the gap (3.1) | `lib/depth.ts`: PLANE_STEPS + a +5 step 0.87; `depthProblems` adds the near steps and the >= 15 L* jump | W1 declares groups; G3 draws them in grey (the board decides values); G4 in colour | `check_depth.py` new VALUE part: band shares outside y 290-600, near-to-air span, near steps (today unchecked), the jump | S | heavier frames than "very soft" (owner, 2026-10-25): keep hues, move values; darks only where the eye goes |
| Far anchor (3.2) | `lib/depth.ts` `anchorTones(air, plane)`: body, lit, foot tones; silhouettes drawn per film | W1 names it per exterior set; G3 silhouette; G4 owner | sheet `anchor` entry: W/H/top-y, dE and C* to its air, range vs near, foot step, declared overlap | M | one stock mountain per film reads as a template: take it from the story's place |
| Contrast budget by distance | none (a rule) | G4, G5 | "far sticker" WARN: a far region's dE to its surround > the subject's separation median | S | the sun disc is a look the owner never judged on its own |
| Parallax by 1/z (3.4) | `PARALLAX_K` from `planeLod(p).scale`; one convention with CineCamera | G5, G6 | `floatProblems`: neighbours >= 1.8x apart | S | far planes nearly still (correct) |
| Near group cut by edges | staging | G3 framing | `framecheck.py` zones + near steps | S | strangers in front read as "you" (rule 3): keep the frame to objects |

## 4. What it would change in v2 (the baseline)
- **S1 (0-6.1 s) and the cover (5.2 s):** before: `check_depth` @3.0 (its sheet) puts the near treads at L* 75.0, the
  mid treads 79.6 and the landing 84.7, LIGHTER than the subject's plane (the wing, 73.2) where CRAFT §f.2 asks 5-14
  darker (the check never tests it); the far city fills only the left quarter (x 0-310, y 600-930); nothing WAY out;
  L* < 65 on 11 % of the frame. After: the treads, planter and bike in their own hues at L* 50-60, cut by the bottom and
  left edges; the canal as the gap's flat field; a far group across the left quarter and over the wing's roofline: the
  far city at k 0.64 and a ghost ridge or skyline at k 0.87 with one landmark rising to y ~640-700.
- **S2 (6.1-12.98):** the receding promenade (good perspective) stays; its pale boards (bottom quarter L* 76) step
  down to the near group; the far end of the promenade dissolves into a far group under the band.
- **S3/S4 (12.98-20.55, the frontal canal):** before (@19.9): the towpath (subject plane, L* 76) and the terrace backs
  (+2, L* 74) dE 3.7 apart (target >= 12; the far plane is DARKER); 65-80 holds 47 % of the frame (@17.5). After: the
  boat's cabin side and the near quay to L* 50-60; the terrace backs up to k 0.4; the gasholders over the roofs become
  the anchor (one big pale ring set at k 0.64-0.87 with a pale foot), the roofs' far rows tone-on-tone.
- **S5 (20.55-23.8, the scale beat):** before (@21.0 / @23.4): the ladder exists (far city dE 5.7-5.9 from its air) but
  the far group is a ~55 px strip (3 % of H, est.) with nothing rising over it, the blossom crowns (+1, L* 67) sit in
  the in-between band (41 % of the frame at 65-80), and the sun disc (L* 60, C* 74) is dE 80 from the sky beside it: the
  strongest contrast in the upper frame, at the farthest distance. After: the crowns as the near frame (L* 45-58, both
  sides, as now), the far city off both edges with a ghost ridge behind it (8-12 % of H, top y >= 620, a pale foot over
  the river) and the obelisk as the landmark rising over it; the sun one step off its sky or set behind the ridge.
- **S6-S8 (23.8-39.08, the boards on the terrace and deck):** the boards keep tier A; the deck and terrace step down
  to the near group (bottom quarter L* 87 at 26.0 s, 72 at 36.0 s; L* < 65 on 12-14 %), a far group through the
  railings. Holds that float take the 1/z shares.

## 5. What the owner didn't name that matters for this feeling
- **Value carries the depth, not hue:** the posters' depth is a two-group value structure; v2's colours can stay.
- **The gap:** one plane skipped or flat (water, a hidden valley) so the value jumps; middle sizes left out.
- **The pale foot** and **the overlap at the anchor's base:** they detach the far group and fix the order.
- **A contrast budget by distance:** the far is the calmest part of the frame; our saturated sun disc breaks it.
- **Small pictures need bolder relief** (Meissonier via Gurney): a phone needs steps of 15-30 L* between groups; v2
  S1's near planes sit 2-11 L* LIGHTER than its subject.
- **The patchwork is a depth device:** the posters' pale overlapping blocks are cheap ghost planes (Singapore's slabs
  dE 3.5, Copenhagen's facet k 0.78): layers of depth without detail (the open item 2).
- **The designed view needs one air:** a collage of landmarks at true-to-story distances reads as one place only if each
  sits on its plane's step toward the same air.

## 6. Clashes with the owner's earlier words, and open questions
- **The dark share:** DIRECTION rule 6 and PALETTE keep "one tinted dark anchor (~5 %)", COZY_AND_SCALE §4 "L* <= 40 is
  anchor-dark ... ~5 %", and the owner liked a palette "very soft ... no screaming colours" (2026-10-25); the posters'
  L* < 40 covers 9-25 % (median 14 %). The recipe stays inside the rules (the near group in mid-tones L* 45-60, real
  darks ~5-10 % where the eye goes); going darker is the owner's call.
- **Code vs docs, not owner words:** `lib/depth.ts` `PARALLAX_K` breaks COZY_AND_SCALE §4 ("neighbours >= 1.8x apart")
  and CineCamera's 1/distance law (a clash is a bug: the orchestrator fixes the lower one). CRAFT §f's ladder ends at
  +4 (k 0.65); the +5 ghost (0.87) is an extension, not a clash. Rule 7 ("1-2 scale moments") stands: a far anchor seen
  through a cozy shot's one opening is prospect, not a scale move.
- **Open questions:** (1) May the near group go to mid-tones (L* < 65 on ~25-35 % of the frame, v2 has 11-17 %)? Seen in
  the next G4 look clip next to v2. (2) A far scale anchor in every exterior set, not only the scale beat? (3) The sun:
  keep v2's saturated disc, or pale it one step off its sky so the far stays the calmest part?
