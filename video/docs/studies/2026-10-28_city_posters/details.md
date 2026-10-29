# Details: where detail lives, how much, and how it stays calm (look lens 3)

*City-poster study, look lens 3 (2026-10-28, finished 2026-10-29). Analysis only: `video/docs/look/DIRECTION.md` stands,
with the owner's answers of 2026-10-28 (one look, still evolving; Pip hidden; the VERY subtle texture test; lit and shade
faces; a full value range); open: outline-free edges, layout, the designed view, the patchwork. Script
`video/scripts/look/posters/details.py` (`maps`, `sizes`, `motion`, `measure`); sheets `img/details_maps_posters.jpg`,
`img/details_maps_v2.jpg`, `img/details_maps_v1_ref1_v3.jpg`, `img/details_regions.jpg`, `img/details_motion.jpg`; scratch
`/tmp/posters-details/`. The finish ladder per tier is `pro_2_hierarchy.md`'s and is not repeated here.*

**Feelings:** mostly 2 ("fullness and live and the right amount of density" in the "low poly" rest) and 4's "cheap and
lazy" (where v2 is empty); a little of 1 and 3. **Not named by the owner:** the posters are full almost without people
(1.3); their finest quarter of detail would twinkle in our moving frames (3).

**Top findings**
1. **v2 is not emptier than the posters, it is coarser.** The same share of calm tiles (43 % both), but where the posters
   put small things (45 % busy tiles), v2 puts big shapes with nothing inside (22 % "structure" tiles vs 8.5 %). A third of
   v2's near ground is empty tiles (21-41 %; 14-24 % of the frame); the posters' 3 % (0.7-2.1 % of the frame).
2. **Rich but calm = small and quiet.** The posters reach reference 1's fullness (density.py 191 objects/Mpx; ref 1 168-192)
   with edges a quarter as contrasty (median step 14.5 L* vs 52-55 for v1 and ref 1). v2 already draws at the posters'
   contrast (12.4 L*); it lacks the amount: half their edges, a third of their thin features.
3. **What floats must be 2 px or quiet.** Under our parallax float a 1 px line's core swings 55-66 % of its contrast at
   every speed (the renderer, before any codec), a 1 px mullion grid 65-79 %; lines of 2 px or more and window ticks of
   4 x 6 px or more do not twinkle in the render, and on the platform's 720p rung 3 px lines and 4 x 6 ticks stay under
   0.2 and 0.07. A quarter of the posters' thin detail is <= 2 px: we would draw it at 2-3 px, or keep it quiet.

## 0. Method and the numbers in one table
Every image on a 1080-px-wide canvas (posters 1206 -> 1080, INTER_AREA). **Edges:** Canny on L* (blur sigma 0.7, steps from
~5 L*; the posters' grain stays under it). **Tiles** 24 px: CALM < 2 % edge pixels, STRUCTURE 2-8 % (a few big edges),
BUSY >= 8 % (several small things). **Step** = the local L* contrast at an edge; QUIET < 15 L* (CRAFT §c's dL* 15 inside a
plane). **Regions:** hand polygons (sky, far, hero = the README's landmark, L2 = the other landmarks, near = the rest;
`img/details_regions.jpg`). **Thin features by width:** a square opening/closing removes features narrower than its
side (>= 6 L* off their surround): <= 2 px, 3-4 px, 5-8 px. Masked: the Instagram UI, the posters' titles, our caption band
(y 290-600) and y 1820-1920. Frames: v2 10 (S1-S8), v1 12, v3 11, reference 1 8 (its art panel). Limits: Instagram JPEGs
vs H.264 masters; the <= 2 px class is +-15 % (est.); one film is not a trend.

| median [range] | posters (7) | v2 (10) | v1 (12) | ref 1 (8) | v3 (11) |
|---|---|---|---|---|---|
| edge pixels, % of frame | **10.1** [8.6-12.7] | **5.1** [4.2-6.8] | 5.2 [4.0-7.6] | 10.0 [5.8-12.7] | 3.5 [2.3-3.9] |
| tiles busy / structure / calm, % | **45 / 8.5 / 43** | **30.5 / 22 / 43.5** | 35 / 14 / 49 | 60 / 12.5 / 29 | 19 / 25 / 56 |
| median edge step, L* (quiet share of edges) | **14.5** (51 %) | **12.4** (59 %) | 51.7 (9 %) | 54.6 (4 %) | 17.8 (43 %) |
| thin features <= 2 / 3-4 / 5-8 px, % of frame | **5.8 / 6.5 / 11.0** | **1.1 / 2.2 / 4.3** | 4.5 / 4.8 / 4.0 | 10.3 / 6.7 / 6.2 | 0.8 / 1.2 / 2.7 |
| density.py flat / detail % / objects per Mpx | 37 / 48 / **191** | 25 / 37 / **108** | 34 / 42 / 127 | 21 / 61 / 168 | 35 / 23 / 88 |
| top 10 % of tiles hold / Gini | 30 % / 0.61 | 34 % / 0.60 | 35 % / 0.63 | 24 % / 0.47 | 41 % / 0.68 |

(LIFE_AND_DENSITY §1 has ref 1 at 20 % / 58 % / 192 and v1 at 32 % / 45 % / 141 over whole films: our samples agree.)

## 1. What the posters do
### 1.1 Detail maps: busy vs calm, hero : near : far : sky (`img/details_maps_posters.jpg`)
| region (median) | posters: area / edge density / step | v2: area / edge density / step |
|---|---|---|
| hero | 8 % / 19.9 % / 16.6 L* | 5 % / 7.5 % / **38.8** L* |
| other landmarks (L2) | 13.5 % / 19.0 % / 17.6 | (none) |
| near ground | 28 % / **18.0 %** / 14.7 | **67 %** / **5.9 %** / 11.2 |
| far | 5 % / 10.8 % / 13.4 | 7 % / 6.5 % / 11.0 |
| sky | 43 % / 0.46 % / 8.7 | 20 % (plus the masked band) / 0.2 % |
| ratio hero : near : far : sky (edge density) | **1.10 : 1 : 0.57 : 0.03** | 1.15 : 1 : 1.05 : 0.03 |
| share of all edges hero / L2 / near / far / sky | 15 / 24 / 52 / 5 / 2 | 10 / - / 77 / 9 / 1 |
| thin features <= 8 px, % of the region: hero / near / far | **46 / 40 / 18** | 19 / **8.5** / 9 |
| empty (calm) tiles in the near ground, % of frame (of region) | **0.9 (3.3)** | **20 (33)** |

- **One calm field, and it is the sky.** Calm tiles = the sky, poster by poster (42/43, 51/52, 37/36, 47/45, 42/41, 51/51,
  43/37 %); below the skyline almost nothing is empty (0.7-2.1 % of the frame) and almost nothing is in between (structure
  8.5 %): every area is clearly empty or clearly full. The map shows it as one hard line along the skyline.
- **Detail is even below the skyline.** The hero carries 1.1x the near ground's edge density (Buenos Aires' Obelisco 0.22x,
  Singapore 1.60x): it does not lead by having more detail. It leads by silhouette, size and value (`pro_2_hierarchy.md`
  finish, `style.md` 1.2 values); the detail is the fabric everything sits in.
- **The ladder of thin features runs hero 46 % > near 40 % > far 18 % > sky ~0** (% of each region's area): distance merges
  small parts (Kyoto's far mountains 2 %, flat layers), but Cape Town's far harbour keeps 44 % (lighthouse, masts, houses).

### 1.2 The hero's drawing: drawn vs suggested (boxes in each screenshot's px, est. +-20 px)
| hero | drawn in full | suggested or dropped |
|---|---|---|
| Marina Bay Sands `[232,661,877,1054]` | the exact silhouette (three leaning towers, the skypark "boat"), a lit and a shade face per tower, the glass as fine verticals and floor bands (8 px a floor: `perspective.md` App. B), the skypark's row of tiny trees | the 55 floors (fewer bands), no balconies or reflections |
| Supertrees `[855,718,1202,1032]` | each fan as dozens of fine plum ribs radiating from a trunk ring | the planting, the walkway |
| Hallgrimskirkja `[45,398,532,1118]` | the stepped tent: each column step a lit/shade strip pair, ~10-12 per wing; 4 belfry lancets, a clock disc, a column of slit windows, the arched door | the concrete, all ornament |
| One Pillar Pagoda `[673,838,1186,1387]` | upturned eaves with dragon finials, the tile rows (dozens of quiet lines), the dark balustrade, the bracket set, the ONE square pillar | carving in the panels |
| Obelisco `[558,393,670,1065]` | a white shaft in 2 faces and one tiny window: 4 % thin features | everything: a unique shape needs nothing else |
| Casa Rosada `[660,960,1206,1395]` (L2) | rows of arched windows, cornices, the roof balustrade, the pediment and clock, niche statues | the stucco |
| Table Mountain `[0,597,1202,952]` | the flat table and its tablecloth cloud, the cliffs as many vertical strata: the quietest hero (quiet edges 18.4 % of its area, loud 4.4 %) | rock texture |
| Nyhavn `[0,758,766,1226]` | each house's window grid (3-5 x 3-4 white-framed windows, 20-37 px), gables, dormers: the loudest hero (loud 16.9 %, quiet 4.7 %) | brickwork, signage |
| Kinkaku-ji `[638,739,1170,1129]` | three storeys in their three styles (dark posts and white panels; gold with a baluster rail and bell windows), the phoenix, the reflection broken by the water | gold leaf (flat gold in lit/shade tones) |

**The level that makes a landmark read at a glance:** (1) the silhouette exact, its one unique shape intact (the skypark,
the stepped tent, the table with its cloud, the single pillar, the needle); (2) ONE signature rhythm drawn in full and
roughly counted (the glass grid, the column steps, the tile rows, the window grids, the balusters); (3) a lit and a shade
face on every plane (DIRECTION rule 5). Texture, ornament inside panels and true floor counts are left out. Half of a
hero's edges are quiet (51 %; median step 16.6 L*): the rhythm is drawn tone-on-tone, the accents (windows, shade sides)
loud. The Obelisco shows that (1) alone suffices when the shape is unique.

### 1.3 The near ground: facades, vegetation, micro-life props, people (inventory; screenshot px, est.)
| poster | house type, facade detail | vegetation | props (objects of use) | people | statues |
|---|---|---|---|---|---|
| Singapore | shophouse row `[484,1323,1129,1613]`: arched shuttered windows (58 px), pilasters, striped tile roofs; stairs and an arch as flat blocks | monstera and banana leaves framing the bottom left, a frangipani, palms | a bumboat `[266,1234,484,1290]` | none seen | the Merlion |
| Reykjavik | pitched-roof houses `[0,1129,1202,1613]`, 3-6 facets each, window pairs (30 px) | conifers, bare trees in fine branch lines | a red trawler with mast lines `[1008,1129,1202,1290]` | none seen | the Sun Voyager (fine lines) |
| Hanoi | tube houses with balconies and shutters; colonial facades far `[726,645,1202,839]` | a flame tree `[0,427,484,903]`, palms | a cyclo `[97,1290,355,1597]`, ~8 lanterns `[16,1113,274,1258]`, a flower basket, the red bridge | **the only people:** the cyclo rider (~190 px), a woman in a non la (cut by the bottom), 2-3 walkers on the bridge (35-50 px) | - |
| Buenos Aires | La Boca's corrugated houses `[0,935,395,1581]` (fine vertical ribs), shutters, balconies | jacarandas in 3 places | a street lamp, a green awning, a cafe table and chairs, the flag `[952,815,1040,927]`, 10 px cars on the avenue, an iron fence | none seen | niche statues on the Casa Rosada |
| Cape Town | Bo-Kaap flat-roofed houses `[484,855,1202,1597]`: parapets, tall dark-framed openings, a wrought-iron balcony, steps | king proteas framing the bottom left `[0,1258,419,1597]`, a palm, round trees | a lighthouse, a ferris wheel, sailboats, a wall lamp | none seen | - |
| Copenhagen | Nyhavn's townhouses (the hero) | almost none | moored wooden ships with rigging, cafe awnings over EMPTY chairs and tables (y 1120-1260), a bicycle (215 px wheel), the quay railing | none seen | the Little Mermaid |
| Kyoto | temple halls, a veranda with a balustrade | maples, cloud-pruned pines, bamboo `[952,1258,1202,1613]` | the torii tunnel `[97,1032,403,1290]`, a small bridge, pond rocks | none seen | - |

- **Full without people:** 6 of 7 posters show no person we could find (0.62x views of all seven, 1x crops of the
  likeliest spots: Copenhagen's cafe row, Buenos Aires' avenue and plaza); "lived-in" is told by objects of use (a parked
  bicycle, empty cafe chairs, moored boats, lanterns, a flag) and by statues (4 of 7). Only Hanoi has figures, and its two
  near ones are the foreground strangers DIRECTION retired.
- **Few props, many facades:** 2-6 distinct props per poster (LIFE_AND_DENSITY §1 calibrates 12+ for a wide exterior).
  The fullness is architecture (window grids, balconies, shutters, roof edges: the near ground's 40 % thin-feature cover)
  and nature; props are few, specific, and grouped (the cafe row, the lantern string, the moored boats) at frame edges
  and along paths. Vegetation's drawing: `pro_3_nature.md`.

### 1.4 Calm detail: how it stays quiet
1. **Low contrast inside the detail:** median step 14.5 L* (near 14.7, far 13.4, hero 16.6); 51 % of edges under 15 L*. Ref 1
   and v1 hold the same fullness at 52-55 L* (ink lines). The contrast, not the amount, makes busy.
2. **Repetition read as surface:** the detail comes in rhythms (grids, tile rows, balusters, column steps, torii, bamboo),
   which a glance takes as one textured surface, not as N objects (`pro_2_hierarchy.md`: regular reads crisp).
3. **Bimodal areas:** clearly full or clearly empty (structure tiles 8.5 %); no half-empty walls with one big edge.
4. **One empty field, reduced far planes, grouped props:** the sky (36-52 % of the frame at 0.46 % edges); far planes at
   0.57x the near's edges, ghost blocks and mountain layers with no windows (`perspective.md` App. B); props in 1-3 clusters.

### 1.5 Specific beats generic: 3-5 objects per city
Each poster names its city with the same five slots: **a landmark, a house type, a plant, a vehicle or object of use,
a local sign** (Singapore: MBS, shophouses, Supertrees, a bumboat, the Merlion; Hanoi: the pagoda, tube houses, the flame
tree, a cyclo, the non la and lanterns; Buenos Aires: the Obelisco, La Boca, jacarandas, cafe chairs, the flag; Cape
Town: Table Mountain, Bo-Kaap, proteas, sailboats, the lighthouse; Copenhagen: Nyhavn, the bicycle, ships, the Mermaid,
the spiral spire; Kyoto: Kinkaku-ji, the pagoda, maples and bamboo, the torii; Reykjavik: Hallgrimskirkja, tin houses,
the trawler, the Sun Voyager, the aurora). The owner placed this under content, not style ("hard to imagine if its
going to trasnalte and generalize well"): for a story's home place it is a W1 practice, not a look rule (lesson 6).

## 2. Where our films stand (v2 first; `img/details_maps_v2.jpg`, `img/details_maps_v1_ref1_v3.jpg`)
- **v2 has the posters' calm and contrast, not their amount.** Calm tiles 43.5 % (posters 43 %), median step 12.4 L* (14.5),
  quiet share 59 % (51 %); but half the edges (5.1 % vs 10.1 %), a third of the thin features (7.6 % vs 23.3 % of the
  frame) and 2.6x the "structure" tiles (22 % vs 8.5 %): big flat shapes with one edge across them.
- **Where v2 is empty: the near ground.** 67 % of the measured frame at 5.9 % edges (posters 28 % at 18 %); a third of it
  empty tiles (median 33 %, 20 % of the frame; posters 3 %, 0.9 %); thin-feature cover 8.5 % (posters 40 %): the same as
  its far (9 %). The ladder is broken where the units are biggest: S1's quay and paving (t 1-5 s: 33-35 % of the region
  empty), S6-S8's boards (t 26-36: 33-41 %).
- **v2's hero is an outline, the posters' a rhythm.** v2 hero edges are 84 % loud (median step 38.8 L*; posters 16.6) and
  its thin features cover 19 % of it (posters 46 %): the outline plus a few strong inner lines, without the quiet
  tone-on-tone rhythm inside.
- **Where v2 is rich:** S3's window wall (t 14: busy 47 %, the posters' level) and S5's city reveal (t 22: busy 41 %, a far
  plane of 24 % at 9.1 % edges); the boards are the calmest (busy 27-28 %, calm 49-55 %).
- **v1, the other bar** (playbook: "reference 1 (France) and v1 (PHP)"): v1's fullness is ink: edges 5.2 % but 91 % loud
  (median step 52 L*), thin <= 2 px 4.5 % of the frame (its lines). The posters show the same fullness drawn quiet; v2 has
  the quiet but not v1's amount. **v3** (64.5 % skipped) is the emptiest (busy 19 %, structure 25 %, calm 56 %); the order
  of our three films by busy share (v1 35 > v2 30.5 > v3 19 %) matches their reception (consistent with, not proof of).

## 3. Phone and motion: what survives 1080 px and H.264 at 60 fps (`img/details_motion.jpg`)
**Test** (`details.py motion`): two 1080 x 1920 charts of lines and window ticks on a warm wall (exact area antialiasing,
like Chrome's analytic coverage; 8-bit), dL* 12 (tone-on-tone) and 30, moving at 0 / 2.5 / 10 / 25 px/s (still; the far
city at k 0.15 under a 15 px/s float; the near ground's 8-15 px/s path; its 25 px/s peak: COZY_AND_SCALE 3b.5, `lib/depth.ts`
PARALLAX_K), 2 s at 60 fps; the `style.md` 1.4 ladder: master x264 CRF 14 slow aq 3, then 3.5 Mbps 1080p and 1.5 Mbps 720p.
**Twinkle** = the swing of a feature's core contrast over time (p95-p5 over the mean); the visible swing is twinkle x dL*.

| feature (px at 1080) | still: kept at 720p | moving: twinkle in the render | 1080p rung | 720p rung |
|---|---|---|---|---|
| hairline 1.0 | 88-93 % | **0.55-0.66** | 0.53-0.61 | 0.31-0.56 |
| hairline 1.5 | 93-97 % | 0.17-0.27 | 0.24-0.30 | 0.33-0.36 |
| line 2.0 | 100-102 % | **0** | 0.12-0.22 | 0.26-0.35 |
| line 3.0 | 94-96 % | 0 | 0.06-0.13 | 0.16-0.19 |
| mullion grid, 1 px lines every 6 px | 94-96 % | **0.65-0.79** (the patch's energy pulses +-12 %) | 0.69-0.90 | 0.62-0.74 |
| window ticks 2 x 3 every 5 x 8 / 3 x 4 every 6 x 10 | 96-108 % | 0 | 0.06-0.19 | 0.10-0.28 |
| window ticks 4 x 6 every 8 x 14 and larger | 96-105 % | 0 | 0.05-0.15 | **0.04-0.12** (4 x 6: <= 0.07) |

- **Still, everything survives** (88-102 % kept at 720p, twinkle ~0): fine detail is safe on locked holds and in the sky.
- **Moving, the renderer is the problem, not the codec:** a line under 2 px straddles pixels as it moves, so its core dims
  and recovers 2.5-25 times a second; a 1 px dark mullion at dL* 30 swings ~20 L*, a 1 px grid is the worst case. The 720p
  rung shrinks 2-3 px lines to 1.3-2 px and brings some back (0.16-0.35). Bitrate is not the limit: a frame full of ticks
  costs 15.2 Mbps at CRF 14, and the 3.5 / 1.5 Mbps rungs kept 88-108 % of the detail (resampled, never erased).
- **Rule of thumb (est.):** twinkle x dL* <= ~2 L* on anything that floats: small features quiet (a 2 x 3 tick at dL* <= 8),
  loud ones big (lines >= 3 px, ticks >= 4 x 6 px). CRAFT §f.2's tone-on-tone far windows (ΔE <= 6) pass. **Clashes with
  our numbers:** CRAFT §c's C hairlines (1.2-1.6 px, dL* <= 15) swing ~3-7 L* in a float (est., between the 1.0 and 1.5
  rows); `lib/depth.ts` `planeLod` allows `minFeature` 0 px on the subject's plane (k 0.6 of the float).
- **Phone (est.):** a 6.1-inch phone shows 1080 px across ~64 mm (1 px ~0.06 mm, ~0.7 arcmin at 30 cm): 2 px features
  resolve; a 6 px grid (~15 cycles/degree) reads as texture.

## 4. Production: richness without drawing every window by hand
On top of `pro_2_hierarchy.md` §3.4 (`lib/finish.ts`, a `lod` prop on the kit, `lib/patchwork.ts`); each film's world drawn
new, engine and tools reused (playbook ONE LOOK; DIRECTION rule 3):
1. **A facade grammar, `lib/facade.ts` (new, M):** bays x floors (ground floor, main floors, attic), each bay one opening
   from the film's own vocabulary (W1 draws 3-5 window types, a door, a balcony, a shutter), one accent per 5-8 bays (a lit
   pane, an open shutter, a plant); lit and shade faces from the rig; finish by tier (pro_2's lod) and distance (`planeLod`
   windows lit / tone / none, `toneOnTone`); sizes clamped by §3 (`keepDetail`). It extends `kit/Window.tsx`'s
   `WindowGrid` and replaces v1's `wallTicks` (nulled by the clean pen).
2. **Quiet material stripes (S):** tile rows, corrugated ribs, slats, strata clipped to a face, >= 2-3 px, dL* <= 8, only on
   materials that are striped (a clash: question 2).
3. **A per-film identity kit (W1):** 1.5's five slots, drawn new at A or B finish; objects of use (bicycle, chairs, awnings,
   lamps, boats, planters) drawn new from parameters (`kit/Nature.tsx` `Bike`, `LampPost`, `kit/Town.tsx` `Car` as
   references: "lib pieces are references").
4. **Placement (S-M):** `lib/depth.ts` `poissonDisk` exists; add `cluster()` (props in 1-3 groups at frame edges and along
   paths) and `rhythmAlong()` (facades, lamps, railings along a `lib/persp.tsx` vanishing line, sized by `groundCam`).
5. **Checks (S):** `details.py measure <still>` on G4 and G5 stills (busy / structure / calm, median step, thin widths;
   `sizes` adds near-ground empty tiles where a still has region polygons); a twinkle lint in `scripts/qa` (strokes under
   2 px, ticks under 4 x 6 px on a plane with PARALLAX_K > 0 in a floating shot); the G4 master's bitrate logged.
Cost per film once built: the W1 vocabulary and identity kit, ~1 lane-day (est.).

## 5. Lessons, ranked by the difference they would make
1. **Load the ground below the skyline; keep the sky the one empty field.** *Evidence:* near-ground empty tiles 0.9 % of
   the frame vs v2's 20 %; structure tiles 8.5 vs 22 %; thin features 40 vs 8.5 % of the near ground. *In our films:* W1 and
   G3 plan the near ground as facades, railings, moored boats and planters at tier C finish, never a blank wall or paving
   in a third of the frame (a bounded floor in front stays allowed, COZY_AND_SCALE 3b.1, cut into patchwork facets and
   objects, never one flat fill); LIFE_AND_DENSITY §2's "one quiet field" becomes measurable: `details.py measure` warns
   at structure tiles > 12 % or busy < 35 %, `sizes` at near-ground empty tiles > 5 % of the frame. *Cost* M (facade
   grammar, G3 planning). *Risk:* busy (lesson 3 keeps it quiet), render time (thousands of SVG parts: est.), the float
   (lesson 4).
2. **Draw each hero as silhouette + one signature rhythm + lit and shade faces.** *Evidence:* 1.2; posters' heroes 46 %
   thin features, half of their edges quiet; v2's 19 %, 84 % loud. *In our films:* W1 names each A's signature rhythm (count,
   pitch); G3 draws the exact silhouette and the rhythm in grey; G4 renders it tone-on-tone with the accents loud; pro_2's
   A row (6-12 % small features) is the budget. *Cost* S-M. *Risk:* rule 4's outline plus a rhythm reads busy: the rhythm
   stays at dL* 6-15 and >= 2 px.
3. **Add detail at the posters' contrast, not v1's.** *Evidence:* the same fullness at 14.5 L* as ref 1 at 55 L*. *In
   our films:* new detail at dL* 6-15 (C), lit panes and shade sides as the few loud accents; CRAFT §b and §c already
   point here (C local contrast <= 7, dL* <= 15 inside a plane); check: median step 12-18 L*, quiet share >= 45 %.
   *Cost* S. *Risk:* too quiet to read on a phone: keep the accents.
4. **Size by motion: 2 px or quiet on anything that floats.** *Evidence:* §3. *In our films:* `planeLod` `minFeature`
   >= 2 px on planes that float (0 now on plane 0); C hairlines 2.0 px on floating planes (CRAFT §c says 1.2-1.6) or kept
   to locked shots; window ticks >= 4 x 6 px unless tone-on-tone; never a 1 px grid. *Cost* S. *Risk:* slightly heavier
   lines; the float stays (owner, 2026-10-28).
5. **Fullness from architecture and objects of use; people for motion.** *Evidence:* 6 of 7 posters without people; 2-6
   specific, grouped props. *In our films:* rule 3's people stay (life is motion, the posters are stills); the paused
   frame's fullness comes from facades and objects of use, and Pip's hiding spots sit among them (rule 2). *Cost* S. *Risk:*
   the playbook asks for "people near and far": question 3.
6. **(Content) Name the home place's five specific objects in W1.** *Evidence:* 1.5. *In our films:* W1's world bible lists
   a landmark, a house type, a plant, a vehicle or object of use and a local sign, drawn new. *Cost* S. *Risk:* the owner
   doubts it generalises; outside cities the same slots read as "this kitchen's kettle, not a kettle".

## 6. What not to take
- **The posters' sub-2 px work** (1 px mullion grids, rigging, ribs; 5.8 % of their frame): it twinkles in a float (§3).
- **Even detail as the lead:** a still invites a long look; a 3.5 s shot needs the eye on A at once, so our fabric stays
  quiet and still (no idle motion inside it) and A leads by silhouette, value and motion (rule 2).
- **The foreground strangers** (Hanoi's rider and woman): retired (DIRECTION; `perspective.md` §5).
- **Prop counts as targets:** the inventory is calibration, never a quota (LIFE_AND_DENSITY §1).
- **Detail by depth as a line ladder:** retired; only "distance merges small parts" (`planeLod`) stays.

## 7. Open questions for the owner
1. May the next G4 look clip load v2's near ground with quiet facade detail (windows, balconies, railings, boats) to the
   posters' level (empty tiles under 5 % of the frame below the skyline, about twice v2's edges), beside v2's version?
2. May quiet material stripes (roof tiles, corrugated iron, cliff strata) cover more than CRAFT §c's "1-2 small surfaces
   per shot", at dL* <= 8 and >= 2-3 px, as the posters do? DIRECTION rule 4 says "big areas flat, no specks, ticks or
   hatching"; these would be the material's own lines, never marks laid over it.
3. The posters are full with almost no people; in a place film, should fullness come from facades and traces of people (a
   parked bicycle, cafe chairs, boats) with a few walkers for motion, or stay "people near and far" as now?
