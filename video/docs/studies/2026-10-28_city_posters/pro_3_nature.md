# Pro practice 3: nature that looks real but is stylised

*City-poster study, pro-practice researcher 3, 2026-10-28. Analysis only: nothing here is a rule until the owner
approves it; `video/docs/look/DIRECTION.md` stands. Meter: `video/scripts/look/posters/pro_3_nature.py` (25 nature
samples, boxes in each screenshot's own pixels, the UI masked; lengths in px at a 1080-wide frame). Sheets:
`img/pro_3_nature_anatomy.jpg` (what reads real, what is low poly, and v2), `img/pro_3_nature_recipe.jpg` (the tree
recipe drawn in flat SVG, rendered in Chrome). Scratch: `/tmp/posters-pro_3_nature/`.*

Status: complete (2026-10-28).

## 1. The feeling, restated precisely
The owner: nature is "very subtle", "visually very interesting", "obviously very real, but if you look closely we
combine the real effects with the lower poly kind of effects". Measured, it is three things at once:
1. **A realism ladder by distance**, the same shapes simpler as they recede:
   - **Near, framing, cut by the frame** (Singapore's banana leaves `[0,1330,250,1620]`, Hanoi's flame tree
     `[0,420,470,860]`, Kyoto's maples `[0,880,250,1180]` and bamboo, Cape Town's proteas `[0,1260,520,1600]`, Buenos
     Aires' jacaranda `[980,1360,1206,1575]`): species-true silhouettes (roughness, the edge's length over its 8 px
     smoothed length: 1.31-3.19), 6+ tones over 32-49 L*, painted not flat (flat share 0.13-0.59), dark (leaves at mean
     L* 33-42). The most "real" nature in every poster.
   - **Mid masses** (Singapore's round trees `[0,1020,340,1112]`, Cape Town's `[440,1090,600,1180]`): Mary Blair's
     lollipops, each crown a disc split into a lit and a shade half (roughness 1.19-1.31, as smooth as v2's 1.25), still
     5-6 tones over 28-41 L*; Hanoi's lake trees `[400,770,1100,900]` sit between (scalloped, 1.67).
   - **Far** (Kyoto's ranges `[260,650,1200,760]`, Reykjavik's Esja `[400,885,1206,990]`, far trees in the patchwork):
     straight-edged polygons (Esja: 47 % of its edge in straight runs >= 30 px), flat (Kyoto: flat share 0.95, 4 tones
     in ~5 L* steps; Esja and Table Mountain 5-7), local contrast 2.6-5.3 (CRAFT §e).
2. **Low poly where the light turns; real at the silhouette, in the material and in the air.** The facets sit INSIDE
   organic shapes: a bract or leaf folded on its midrib into a lit and a shade half (proteas, banana leaves; steps 6-13
   L*), a crown split into two half-discs, a boulder cut into triangles (the Little Mermaid's rock `[820,1330,1206,1560]`:
   49 % straight edge, steps 7-13 L*), a range cut into lit-snow and shade faces (Esja). The real effects: (a) the
   species silhouette (the flame tree's lace, the maple's lobes, the jacaranda's dabs); (b) a material inside a facet
   (Table Mountain's strata, the rock's stone mottle: 4.4-6.7 L*); (c) soft air: the tablecloth cloud's top edge is 7.5
   px wide against the ridge's 3.7 and a building's 1.9, the aurora a whisper (dL* -1.8, da* -1.6, db* +1.6 on its sky:
   dE ~2.9; streaks every ~23 px); (d) particles: the Merlion's stream breaks into ~1-3 px droplets (est.); (e) true
   reflections (style.md 1.7). "Very subtle" is literal: soft effects within dE ~2-5 of what is behind them.
3. **Nature carries the darks and the counter-shapes.** Leaves at mean L* 33-48 are each poster's mid-dark field, and
   their curves are the only organic edges against the ruled city (style.md 1.3).

**Where v2 stands** (the anatomy sheet's last row): one mode for all nature. S1's sage tree, the film's nearest nature
(v2 @3.0 `[0,1290,290,1480]`), is five flat discs and two floating shade ellipses: 4 tones over 19 L*, mean L* 71, flat
share 0.93, local contrast 3.0: Blair's lollipop on the plane where every poster puts its most real nature. S5's blossom
trees (@22.0 `[0,790,320,1000]`, `[760,790,1080,1100]`) are a mauve body with pink polygons and dots spread evenly,
twig whiskers past the silhouette, the right crown barely lit (light strength 0.23). The approved pieces stay: the
falling leaves ("leafs are great") and the shared water ("Yeah this is better").

## 2. How the professionals do it
Read through search summaries (WebFetch was blocked by DNS for gurneyjourney.blogspot.com and the-solute.com in this
session); quotes marked (s) need a check against the page before they are quoted as exact.
1. **Satoru Takizawa, *Breath of the Wild*** ("Change and Constant", GDC 2017-03-01, https://gdcvault.com/play/1024562):
   the style is "the reconciliation between ... playability and reality", "an art style that makes it easy to lie";
   *Wind Waker*'s lies were "too big" (s). **Teaches:** the size of the lie: small near, bigger far, never big up close.
2. **Jane Ng and Olly Moss, *Firewatch*** (GDC 2016; PC Gamer 2016, https://pcgamer.com/why-less-is-more-when-it-comes-to-firewatchs-beautiful-trees):
   23 hand-made trees for ~4,600 placed, billboards far; trees "more stylised" as they recede; "aesthetically
   stylised" yet "felt real" (s). **Teaches:** a few hand-made species per film, reused; stylisation grows with distance.
3. **Eyvind Earle, *Sleeping Beauty*** (1959; Walt Disney Family Museum, https://www.waltdisney.org/eyvind-earle): "I
   wanted stylized, simplified Gothic" (s); his gouache bushes began as a blob, then smaller and smaller leaves (process
   write-ups such as Gurney Journey, 2019-02-06, (s)). **Teaches:** a designed big shape carries the style; realism is
   controlled small detail laid on it.
4. **Mary Blair and Charley Harper:** Blair's trees "become lollipops or triangles", colour fields compose, a thin line
   adds detail (https://madegooddesigns.com/mary-blair/, (s)); "flat and stylized" (John Canemaker, *The Art and Flair of
   Mary Blair*, 2003, via WBUR 2016-02-15). Harper's "minimal realism", "I just count the wings" (Audubon, 2008,
   https://www.audubon.org/magazine/january-february-2008/counting-wings).
   **Teaches:** mid and far nature may be pure geometry if the species' key counts are right.
5. **Henri Rousseau** (NGA, "Rousseau in the Jungle", https://www.nga.gov/educational-resources/art-and-ecology/rousseau-jungle):
   Jardin des Plantes specimens "as a point of departure, vastly enlarging and changing them", "giant leaves overlapping
   in shades of green". **Teaches:** near nature is one real species, enlarged, flattened, in a family of greens.
6. **Kazuo Oga, Ghibli** (Animation Obsessive, https://animationobsessive.substack.com/p/what-kazuo-oga-thinks-about-when):
   up close his paintings are "impressionistic ... He's not rendering everything"; a forest's "expressions" come from
   "the density of trees, the weather, the transition of light" (s). **Teaches:** light and density read real, not
   leaf counts: the owner's "if you look closely".
7. **James Gurney and John F. Carlson on values.** Gurney (*Color and Light*, 2010; Gurney Journey 2015-12-01, 2009-06-08,
   (s)): the largest masses first; dense foliage reads as a light and a shadow side, lightest at its outer and upper
   edges, darkest at the core; sky holes darker than the sky, used sparingly; shaded leaves facing up go blue-green.
   Carlson (*Guide to Landscape Painting*, 1929, https://theartistsroad.net/articles/thecarlsontheoryofangles): sky,
   ground, slants (mountains), uprights (trees), lightest to darkest. **Teaches:** the value of every cluster and plane.
8. **Cartoon Saloon, *Wolfwalkers*** (2020; BTL News, https://www.btlnews.com/?p=93527; Maria Pareja, Awards Radar
   2021-03-04): the town in "angular, geometric shapes" from woodcuts, the forest in "curving shapes", "rich and alive";
   near the forest edge "some of the trees were angular" (s). **Teaches:** nature is the curved counter-shape to the ruled
   city, and beside buildings it may borrow their facets (the posters' midrib and half-disc splits are that bridge).
9. **Low-poly games and the one-mass crown:** Ken Wong, "The Art of Monument Valley" (GDC 2015,
   https://gdcvault.com/play/1022299: low-poly 3D and Japanese flower arrangement among its sources (s)); game artists light
   a stylised crown as ONE form by giving its leaves a sphere's or hull's normals (gamesartist.co.uk "Lush tree"; the
   "Foliage Normals" add-on). **Teaches:** one value per facet from its angle to the key; the crown lit as one mass.
10. **Calm wind:** Tiago Sousa, "Vegetation Procedural Animation and Shading in Crysis" (*GPU Gems 3* ch. 16, 2007,
    https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-16-vegetation-procedural-animation-and-shading-crysis):
    main bending (the plant, by height) plus detail bending (leaves), phases from position; "too much bending will ruin
    the illusion". Bill Rockenbeck, "Blowing from the West" (Ghost of Tsushima, GDC 2021, https://gdcvault.com/play/1027124):
    one wind, gusts as "vorticles" that grass, trees, leaves and cloth all read. **Teaches:** one shared wind, a sway
    hierarchy, phases from position, nothing redrawn.
11. **Water effects in layers** (80.lv, https://80.lv/articles/how-to-create-realistic-waterfall-vfx-in-houdini: the
    stream, whitewater, an upper and a lower mist; *RiME*-style falls from "simple meshes and particles"). **Teaches:** a
    spray is a core, edge droplets and a mist band, each its own layer and motion.

## 3. The concrete approach for our films
### 3.0 The shared rules (all nature)
- **N1 The realism ladder** (declared per set in W1 with its planes, CRAFT §f.1; numbers from section 1, kept calmer):

  | plane | mode | silhouette | tones | local contrast |
  |---|---|---|---|---|
  | near (<= -1), framing | "real": the species' own leaf, frond, petal | roughness >= 1.3 (posters 1.31-3.19) | 4 (lit, mid, shade, core), steps 6-10 L*, range <= 30, mean L* 42-55 | <= 9 (posters 6.7-12.6) |
  | mid (0 ... +2) | "geometric": 3-8 lit clusters | leaf bumps on the silhouette and terminator only, 1.15-1.6 (posters 1.19-1.67) | 3-4, steps 6-10, mean L* 45-60 | <= 7 |
  | far (+3, +4) | "low poly": 4-8 facets per mass | >= 40 % of the edge in straight runs >= 30 px (Esja 47 %) | 2-3, steps 4-6, the plane's air step | <= 4 (Kyoto 2.6) |
- **N2 Facets follow the light, never a grid.** A split runs along the form's turn (a midrib, a crown's terminator, a
  rock's ridge) and each facet takes ONE tone from its angle to the set's key (flat shading: the facet's normal against
  `lib/light`'s rig, quantised to the plane's tones). Silhouettes stay organic except rocks, ranges and the far patchwork
  (Wolfwalkers' bridge: facets inside, curves outside).
- **N3 One light for all nature** (rule 5): each crown's light vector (lightest 20 % minus darkest 20 %) within 45 deg
  of the key, strength >= 0.3 (posters: 14 of 16 foliage samples 0.33-1.41, lit from above or the side; v2 S5's right
  crown 0.23). The posters' direction varies inside one picture (Hanoi 27-173 deg): we keep rule 5's one key.
- **N4 Values by angle** (Carlson): sky > ground > slants > crowns in mean L* (posters: 85-93 > 55-83 > 26-48; v2 S1:
  sky 84, paving 85, tree 71, 14 L* under the ground instead of ~40); a crown's core is the set's darkest natural tone
  (L* 32-38: rule 6's "the shade under trees", inside its ~5 % of darks); shaded leaves facing up a step bluer.
- **N5 The real effects the clean pen can draw:** (a) species silhouettes; (b) material as same-hue flat shapes inside
  a facet (strata bands, veins, bark plates, stone patches, dL* 3-8: CRAFT §c's rug and plank rule, on more surfaces only
  with the owner's OK, clash C1); (c) soft air as 2-3 flat steps of 3-4 px toward what is behind (the tablecloth's 7.5 px
  soft edge; CRAFT §d's 2-step soft edge), clash C2; (d) particles as movers (§f.6); (e) reflections (`lib/water.tsx`).
  Never blur, a gradient beyond the sky and the water's ramp, specks, hatching, or grain beyond the opt-in mottle.
- **N6 Species and greens:** 2-4 species per film, each drawn once by hand as a template and reused (Firewatch's 23
  trees); species and season are content, picked in W1 from the story's place and month (owner's answer 8); 3-5 greens
  in the allowed band (style.md: h 154-171, never the olive 95-118), warm accents from flowers or autumn.
- **N7 Calm wind: one field, a hierarchy, transforms only.** `lib/wind.ts` (new): one direction, a base sway and gusts
  that travel across the set (Tsushima's vorticles). Crowns rotate about their base +-0.5-1.0 deg at 0.12-0.25 Hz (main
  bending), clusters shift +-1.5-3 px at 0.3-0.5 Hz, phased by their x (detail bending), near leaves flutter +-1-2 px
  (all est., tuned in G4). Geometry cached per seed, moved only by transforms (no path rebuilt per frame: no boil); far
  planes never sway. A gust crossing a row is ONE noticeable mover (rule 3), never in the 0.4 s round a join.

### 3.1 Trees and foliage
- **Build** (one `<g>` per tree, `img/pro_3_nature_recipe.jpg`): (1) trunk and limbs as tapered closed paths, the shade
  side away from the key (25-40 % of the width, §d.4), limbs seen only in sky holes and under the crown; (2) the big
  shape, the species' silhouette (round, oval, columnar, vase, weeping, conifer tiers, palm); (3) 3-8 clusters (6-12 on
  a near hero) drawn as ONE lit mass: their union in the shade tone, a core crescent only along its underside away from
  the key, a lit cap per cluster 0.3-0.4 r toward the key (smaller low down: the crown shades itself), hi dabs on the top
  1-3 clusters: core L* ~36, shade ~45, lit ~61, hi ~70, mid ~53 for a second depth (the sheet's mid tree, measured:
  4 tones over 27 L*, flat 0.91, light vector 121 deg for a key at 128, roughness 1.16); (4) leaf bumps 8-14 px on
  two-scale lobes, only on the silhouette and the terminators, and 2-4 sky holes near the thin edge, a step under the
  open sky, <= 3 % of the crown; (5) contact and cast shadows (§d.5-6).
- **Near (framing):** never a blob: the species' own leaves at the edge (maple lobes, leaflets, fronds, banana blades),
  each folded on its midrib into a lit and a shade half (dL* 8-12), 3 veins as thin same-hue shapes (dL* +6-8), 3
  depths of green, cut by the bottom or left frame edge, never in the caption band or the right rail.
- **Far:** a disc with a lit half (+1, +2: Blair), 4-8 facets round one inner vertex (+3), the patchwork at +4 (pro_2).
  Tier C by role (A only when a tree is the beat's subject); its plane sets its finish.
- **Engine:** new `src/lib/foliage.tsx` (`<Crown species seed plane>`, `<LeafSpray>`, `crownProblems()`), generalising
  v2r's `crownD` (`src/v2r/kit/dc/core.tsx`) and `dc/bloom.tsx` (clumps lit on the sun side) and replacing
  `lib/kit/Nature.tsx`'s `Tree` (sketch pen, `crownTicks`); it reads `lib/light`, `lib/depth`, `lib/wind.ts`, `lib/rng`.
  Falling leaves stay `lib/particles` 'leaves' ("leafs are great"), coloured from their crown.

### 3.2 Flowers and plants
- A flower: 5-24 pointed petals or bracts round a centre, each folded on its axis (lit and shade halves, dL* 7-10: the
  proteas); the centre a dome with 8-20 radial same-hue marks (dL* 6-8) or a disc and a ring; leaves by 3.1's near rule.
- A blossom crown (cherry, jacaranda): dabs, never confetti. 8-20 px dabs in 3-4 tones clustered by the light (>= 70 %
  of the light dabs on each cluster's sun side), the deepest in the core, the silhouette made of dabs (the jacaranda's
  edge/core detail ratio 2.02), twigs only inside sky holes or under the crown, never whiskers past the silhouette.
- Flowers carry the film's confetti saturation or its one pop (rule 6), shade halves toward rose or plum (§d.3); a nod
  of +-1-2 deg at 0.2-0.4 Hz from the shared wind; petals fall as the approved leaf particles. Engine: `foliage.tsx`
  `<Flower species>`, `<Blossom>` (dab clusters).

### 3.3 Mountains and rocks
- **Ranges (+2 ... +4), the low-poly home:** straight ridge segments, each peak a lit face and a shade face split on a
  line from its summit, toned by the key, 3-4 tones in 4-7 L* steps (Kyoto ~5, Esja ~7), the base dissolving into the
  pale foot (pro_1's far anchor), on the plane's air step.
- **A hero mountain:** the same facets plus its material: 15-40 long strata bands (2-6 px, dL* 4-6, along the bedding)
  and gullies as flat shade planes from the rig (dL* -8 to -12), a crisp ridge (needs C1).
- **Rocks (near, mid):** the organic silhouette cut into 4-9 triangles or quads from 1-2 inner vertices (the mermaid
  rock), tones by the key (steps 7-13 L*), 2-4 same-hue stone patches (dL* 3-5, 20-60 px), a contact shadow. No motion.
- **Engine:** new `src/lib/facets.ts`: `facetPolygon(poly, {inner, seed})`, `shadeFacets(facets, rig, tones)` (flat
  shading from a height per inner vertex), `ridgeRange(spec)`, `strata(poly, spec)`; shared with pro_2's patchwork.

### 3.4 Clouds and sky effects
- Two cloud modes, as in the posters: patch clouds (flat pale blocks and one arc, Singapore) in a patchwork world; a hero
  cumulus (the tablecloth): a lit top with lobes 3-8 % of its width, a flat base, a belly a step down (dL* -6 to -10,
  cooler), soft edges where it thins as 2-3 flat steps of 3-4 px toward `skyColorAt` there (C2), never blur.
- A night sky effect (an aurora): 12-30 tapered vertical streak shapes (6-14 px wide, ~20-25 px apart), each a flat
  colour within dE 2-5 of its sky (Reykjavik's whisper, dE ~2.9), a clean lower curve, tapered tops.
- Motion: clouds drift 2-6 px/s along the wind (slower per plane), never reshaped; aurora streaks slide 4-10 px/s and
  lengthen smoothly; no cloud edge in the caption band; the sky holds still in the float (rule 8). Engine: `lib/sky.tsx`
  stays; new `src/lib/clouds.tsx` (`<Cloud kind>`, `steppedEdge()`, `<Aurora>`, `cloudProblems()`: no edge in the band,
  steps >= 3 px, a whisper within dE 5).

### 3.5 Water and spray
- Keep `lib/water.tsx` as approved: it already joins the real (the mirror, the Fresnel veil, the gold column) and the
  stylised (level bars on one grid), as the posters' water does (style.md 1.7).
- Spray, fountains, falls in the VFX artists' three layers: (1) the stream, a closed arc tapering 1.0 to 0.6, two flat
  tones (a white core, a pale edge band) and 3-6 tapered flow streaks scrolling along it at the flow speed (est. 40-120
  px/s), its shape fixed; (2) edge droplets as particles 6-12 px (our phone floor: the posters' ~1-3 px would read as
  specks or vanish), 8-16 alive, born at the edge, riding the flow, then falling; (3) a splash ring of 5-9 drops and a
  mist band of 2 flat steps where it lands. One noticeable mover. Engine: a 'drops' kind in `lib/particles.tsx`.

### 3.6 Engine, gate, check, cost, risk (one table)
| Piece | Engine | Gate | Check | Cost | Risk |
|---|---|---|---|---|---|
| The ladder, species, season (N1, N6) | the film's `STYLE.md` values | W1 names; G3 grey shapes in the right modes and cluster counts; G4 owner | new `scripts/qa/check_nature.py` from this meter (tones, range, light vector vs the key, roughness and straight share per plane, local contrast per tier) on G4 and G5 stills | S | none |
| Crowns, near leaves, flowers | new `lib/foliage.tsx` | G3 placeholders; G4 one near and one mid tree in the final style; G5 fill; G6 leaf edges | `crownProblems()` + `check_nature.py` | M-L (est. 2-3 days with 4-6 species) | generic "procedural" trees (species drawn by hand, the generator only places and lights them); a loud near plane (local contrast <= 9) |
| Wind | new `lib/wind.ts` | G3 sway timing; G5 | `windProblems()` (amplitudes, rates, joins); CRAFT §b motion share | S | lockstep or puppet wobble (phases from position, transforms only) |
| Rocks, ranges | new `lib/facets.ts` + pro_2's patchwork | W1 far anchor; G3; G4 | `check_depth.py` (air); `check_nature.py` (straight share, steps) | M | a "3D game asset" look (4-9 irregular facets, organic outline) |
| Clouds, aurora | new `lib/clouds.tsx` on `lib/sky.tsx` | G3 shapes and drift; G4 | `cloudProblems()`; `check_banding.py` on the open sky | S-M | a stepped edge read as banding (A/B at phone size) |
| Spray | 'drops' in `lib/particles.tsx` | G4 when the film has one | `particleProblems()`; `waterProblems()` | S | the mover budget |

## 4. What it would change in v2 (the baseline)
| Shot | Before (measured) | After (targets) |
|---|---|---|
| S1 0-6.1 s, the sage tree (@3.0 `[0,1290,290,1480]`, the nearest plane) | 5 discs + 2 floating ellipses; 4 tones over 19 L*, mean 71, flat 0.93, roughness 1.25, local contrast 3.0 | a species tree framed by the left edge (W1: a plane or lime by the canal), clusters lit toward the S1 sun (above it, ~85 deg), 4 tones ~61/53/45/36, mean ~52, near leaves at its edge (roughness >= 1.3), local contrast <= 9, sway +-0.6 deg |
| S1 falling leaves (approved) | ochre and rust palmate leaves | unchanged in size, count and fall; colours from the crown; the midrib fold only as an A/B |
| S1 clouds (`[66,240,370,262]` strip, `[644,184,1004,270]`) | a strip of tiny scallops; a flat cream cloud | one hero cumulus: lit top, belly step, 2-step soft edge, drift 3 px/s, clear of the band |
| S4 14.86-20.55 s, the boat's pots and reeds (@17.5) | flat pale blades and blooms | blades and petals folded (lit/shade halves), contact shadows, values down a step |
| S5 20.55-23.8 s, the blossom trees (@22.0 `[0,790,320,1000]`, `[760,790,1080,1100]`) | a mauve body, pink polygons and dots spread evenly, whiskers past the silhouette; mean L* 63-66; the right crown's light 0.23 | dab clusters lit toward the sun (up, centre), dabs at the silhouette (roughness 1.6-2.0), twigs only in sky holes, plum cores at L* ~36, mean ~55 |
| S5 far park, hills, clouds | tiny round trees (already the far mode); hills as soft mauve bumps (L* ~86); flat clouds (edge 2.3 px) | keep the park; hills as lit and shade facets with straight ridges; clouds with a lit top, a belly step and a 2-step soft edge |
| S6 23.8-28.1 s, the tulips (@26.0 `[0,1450,420,1920]`) | flat pale petals, overlapping sage blades | petals and blades folded (dL* 8), the cup's inside a step darker, values from ~75 to ~55 (est.) |
| S7, S8 street trees | lobed flat crowns | mid crowns from the recipe; far ones as discs with a lit half |
| Water (S1-S4) | the approved `lib/water.tsx` | unchanged |
Re-measure with `check_nature.py` (this meter) on S1, S5 and S6 stills; the leaves and water are not touched.

## 5. What the owner didn't name that matters for this feeling
1. **Nature holds the darks.** Leaves at mean L* 33-48 are each poster's mid-dark field; bringing v2's trees from L*
   63-71 to ~45-60 is the cheapest step to the full value range the owner already approved (rule 6), and costs no detail.
2. **Nature frames the view.** In 6 of 7 posters a near plant cut by the edge frames the bottom or a side (Copenhagen
   uses its rock). In 9:16: the bottom 20-25 % and the left edge (the right rail is UI), the plane that moves most in the
   parallax float: depth for free.
3. **Nature is the counter-shape:** the only curve against each poster's ruled city; v2 is ruled, soft only in blobs.
4. **In film, the motion decides.** Wind is the "real effect" a still cannot show; lockstep sway, wobbling outlines or
   puppet bends are what make it cheap.
5. **Season and time live in nature** (blossom, autumn, snow, low sun through leaves): it says when without a word.

## 6. Clashes with the owner's earlier words, and open questions
- **C1** Rule 4 ("big areas flat, no specks, ticks or hatching") and CRAFT §c ("texture only as flat same-hue shapes
  ... on 1-2 small surfaces per shot") against the posters' material inside nature: Table Mountain's strata, the rock's
  mottle, the protea's radial strokes, every leaf's veins. N5 (b) stays in the clean pen but puts same-hue marks on a big
  surface and on many leaves.
- **C2** Rule 5 (light "never glow discs, blur or gradients, the sky's gentle gradient aside") against the posters' soft
  cloud and mist edges (7.5 px against a building's 1.9). Our 2-3 flat steps are flat but read soft on purpose.
- **C3** CRAFT §b tier C ("local contrast <= 7") and §c ("C: ... flat shapes in 2 tones (lit, shade), at most dL* 15
  inside one plane") against the posters' near and mid nature (local contrast 6.3-12.6, median ~8.7; 5-6 tones over
  28-49 L*) and this recipe (4 tones over ~28 L*). Kept: "leafs are great" (the leaves), the approved water, the olive ban.

**Open questions for the owner** (each an A vs B in the next G4 look clip):
1. May hero nature (a mountain, a rock, near leaves) carry same-hue marks (strata, veins, stone patches) beyond CRAFT
   §c's 1-2 small surfaces?
2. May clouds and mist get soft-looking edges as 2-3 flat steps (no blur), or do clouds stay hard-edged?
3. May near and mid nature be richer than tier C allows today (4 tones over <= 30 L*, local contrast <= 9 near and <= 7
   mid), kept calm by colour and motion instead?
