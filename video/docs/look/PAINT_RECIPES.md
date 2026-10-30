# PAINT_RECIPES: how we paint the painted pieces (the recipe book)

The owner (2026-10-29), after four rounds of our own painter: "Why can’t you do the research yourself and come up with a
concrete detailed recipes to reproduce certain elements? Seems like you should be able to really clearly define a
recipe". The method he pointed at: "I think we just need to brush it and perhaps draw them in layers a bit more blurry
each time like look how this is done or this" (`refs_paint/01`, `02`). The models: "I like the drawing style in these
two more" (`refs_human_scale/03_beach_dusk.jpg`, `02_bus_stop_night.jpg`); "even clouds have layers that give a sense
of depth". On the design-first still v4: "Wait but this is actually not bad like it’s not there but we are getting
there".

**What this is.** One book for the painted pieces (playbook PAINTED PIECES; DIRECTION rules 4-6): the shared method
(§1), every element with its one-line recipe and an honest distance to the references (§2), the calls where the family
recipes disagree (§3), and the plan that turns the first recipes into painter styles for the scene-1 canal evening
(§4). The detail lives in four family recipes, each with measured references, sources, numbered passes, a seeded proof
script that gives the same bytes on every run, and a swatch of every element beside the reference crops:

| Family | Recipe (`docs/look/`) | Proof script (`video/`) | Swatch |
|---|---|---|---|
| Sky and clouds | `paint_recipes/sky_clouds.md` | `scripts/look/paint/recipes/sky_clouds.py` | `paint_recipes/sky_clouds_swatch.png` |
| Water | `paint_recipes/water.md` | `scripts/look/paint/recipes/water.py` | `paint_recipes/water_swatch.png` |
| Trees and greenery | `paint_recipes/foliage.md` | `scripts/look/paint/recipes/foliage.py` | `paint_recipes/foliage_swatch.png` |
| Buildings, ground, far city | `paint_recipes/built_ground.md` | `scripts/look/paint/recipes/built_ground.py` | `paint_recipes/built_ground_swatch.png` |

All four swatches on one sheet: `paint_recipes/index.jpg`. People are never painted pieces (they stay crisp); their
recipe is `paint_recipes/people.md`.

**Rank.** A look doc (DIRECTION's "Which doc wins"): the owner's words, DIRECTION and CRAFT win over it. Its topic is
the method shared by all painted pieces and the calls between the family recipes (§3 wins over them); each family
recipe wins on its own element's numbers everywhere else. We learn methods from the references; we never trace or copy
one, and no artist is a style target.

## 1. The shared method (every painted piece)

1. **Design first:** flat shapes before any stroke, 3-5 values per mass (lit, half, shade, deep; accents <= 5 %), one
   colour family, one light; check the flat (`--design`) beside the refs. P0 is the film's flat: paint never moves it.
2. **One light, one limited palette:** the shot's rig lights every piece (§3 C7); 10-15 swatches per piece from the
   scene's one light table (C5); a stroke is one swatch or an OKLab mix of two neighbours (jitter <= 2.5 L*), no grey.
3. **Passes, soft to crisp, each blurred less than the last:** P0 the design (sigma 0-4 px) -> P1 3-14 big soft strokes
   per mass, +-1-5 L* (sigma 3-8; the open sky 24) -> P2 blocky flat-brush marks along the form (sigma 0.3-0.6) -> P3 a
   few crisp accents at the light edges (sigma 0) -> P4 texture, near masses only.
4. **Marks by intent, at a dose that reads:** where the form turns, along the light edge, where weather runs, 4-15 L*
   off their zone; calm stays calm (water >= 75 % unmarked, a shade zone <= 40 % covered); v4's 2.6 % was too faint.
5. **Depth by plane** (the table): farther = closer to its air by CRAFT §f.2's k, fewer values and marks, a bit softer.
6. **Edges by the light:** crisp 0.5-1.5 px (solid silhouettes to +3, marks, slivers), firm 2-6 (a cloud's lit edge),
   soft 7-16 (a cloud turning away), lost 20-35 (a cloud's base, far vapour); broken = clumps and notches, never a comb.
7. **Texture only where the paint is near:** open sky +-0.3-1.2 L* in patches (caption band <= 1.5 L*), water tooth
   +-0.5, near solids grain ~1.6 + mottle ~2.0 L* std, speckle on near masses only; sky pieces get CRAFT §g.4's dither.
8. **Real strokes:** a profile swept along a path (chained stamps bead) or a polygon at 4x, box-reduced; dry breaks run
   along the stroke's last 25-60 %, never across it (reed plumes and dome brushing excepted).
9. **One layer per plane, deterministic:** one generator per (seed, piece, pass); one RGBA PNG per plane, in its group.
10. **Never:** an even streaky texture, a smudged layer, combed edges, greying, crescents (a lit band along an outline),
    eggs (a ramp per billow), a necklace of equal bumps, airbrushed blobs, confetti or stacked dashes, random
    rectangles, a pale mass within 4 L* of its field, outlines, a saturated sun disc, lamp-coloured far windows.

**The depth ladder** (CRAFT §f.2's planes and k, `lib/depth.ts` `PLANE_STEPS`; scene 1's planes are `S1_PLANE` in
`src/look/paint_s1/V2S1_float.tsx`; the clouds take the same k toward the sky at their own height):

| Plane | Scene-1 painted pieces | k toward the air | Chroma kept (a hue across the air's) | Values; spread inside the plane | Plane blur sigma, solids / vapour (px) | Silhouette edge 10-90 % (px) | What stays |
|---|---|---|---|---|---|---|---|
| -1, -2 (near frame) | the tree (-2) | 0; a value step darker (5 / 10 L*) | 1.0 | 4 + accents; lit to deep 35-40 L* | 0 (out-of-focus framing only: 2.2-3) | 0.5-1.5 | every pass; grain, mottle, speckle |
| 0 (the subject's; sky plane 1) | the near cumulus (the facade and her stay crisp) | 0 | 1.0 | 4 + rim; ~30 L* | 0 / 0 | solids 0.5-1.5; cloud lit 1.8, away 16, base 22 | every pass; specks only on the cloud's far base |
| +1 | (none in scene 1) | 0.12 | 0.90 | 5 | 0.3 / - | 0.7-1 | P0-P3; no speckle |
| +2 | the mid cloud bank (the bridge stays crisp) | 0.22 | 0.82 | 4; <= 24 dE | 0.4-0.6 / 1.3 | 1-1.5; cloud lit 2.6, top 10 | P0-P3 at half the count |
| +3 | the far tower; the far cloud deck | 0.40 | 0.68 | 3; <= 12 dE | 0.5-1.0 / 2.4 | 1.5 (by the sun +2.5, lost) | P0; a sun-side face and slivers inside the spread; windows tone-on-tone (dE <= 6) |
| +4 | the far roofs; the horizon streaks | 0.65 | 0.48 | 2; <= 5 dE; within dE 10 of the air | 1.6 / streaks 0 | 2-3 (by the sun +3.5, lost); streaks 0.6-1.6 | the silhouette only; no windows |
| +5 ghost (opt-in) | - | 0.87 | 0.30 | 2; within dE 6 of the air | 1.6 | lost | the silhouette only |

- **The air** is the sky's lowest colour right behind the plane (scene 1: `horizon` #f3d6c3, warmer by the sun through
  the sky's one warmth field, §3 C18). The step is CRAFT §f.2's rule (`lib/depth.ts` `atmos`): L* moves toward the air's
  by k; a hue within 90 deg of the air's mixes toward it; a hue across from it keeps its hue at C* x (1 - 0.8 k), never
  under C* 8 and never into the olive band (h 88-118 at C* < 30).
- **Water** (scene 1's plane -0.5) has its own ladder inside it, by perspective depth (far / mid / near): marks
  1-1.8 / 2.2-4.4 / 4-9 px tall; light and dark marks +9 and -7 / +12 and -10 / +15 and -13 L* off the base; covering
  4 / 7 / 9 % of the water; blurred 0.6 / 0.45 / 0.3 px (`water.md` §5.4).

## 2. Every element: the recipe in one line, and how close it gets

"How close" is how far a swatch gets toward the references, judged at phone width (400 px). The fraction is the family
agent's own where it gave one (trees, buildings, the cumulus); elsewhere it is this book's reading of the agent's
verdict, from the swatch beside its refs; where the two differ, both are given. The rows are the numbered rows of each
family's swatch.

### 2.1 Sky and clouds (`paint_recipes/sky_clouds.md`, swatch `sky_clouds_swatch.png`)
| Element | Recipe in one line | § | Row | How close (honest) |
|---|---|---|---|---|
| Sky gradient (dusk, day) | One PCHIP curve in OKLab through zenith L* 80.9, field 82.0 (flat over y 317-556), rose 84.4, band 88.9 (the lightest) and horizon 87.5 (the air). The sun's warmth is an ellipse (rx 475, ry 214, 0.55) cut above y 556. P1: 14 soft strokes 160-320 px, sigma 24. P2: 70 strokes 40-90 px, sigma 6. P3: a 35 deg hatch (2-3 px lines 9 px apart, +-0.7-1.2 L*) on 55 % of the sky, x0.25 in the band (by day, a +-0.35 L* paper tooth instead) | 3.1 | 1 | Right by CRAFT §g: the band spreads 1.08 L*. Its texture is 0.35 L* against the refs' 0.45-0.60, and it has none of 03's lighter gaps. **About 1/2** of the refs' life; it is calm by rule. |
| Near cumulus | 10-14 hand-placed billows on a size ladder (1 : 0.75 : 0.55 : 0.4 : 0.25 : 0.15), those farther from the light drawn in front, on one base line. One big form is lit as a whole (light per billow <= 0.45), with caps on top: 4 values + a 5 px rim, L* 58-90 on a field of 82. P1: soft strokes, sigma 7. P2: scoops with a crisp convex edge, plus 7 level blocks, sigma 0.6. P3: <= 7 rims. P4: <= 70 specks on the far base. Edges: lit 1.8, away 16, base 22 px | 3.2 | 2, 2b | **About 2/3** by its own review. This book reads **1/2-2/3** at 400 px: the design and the light are right, but the inside is smoother than 02 and p02 and the base reads airbrushed. Still the strongest sky piece. |
| Banks and decks | 6-8 flattened humps (flat 0.36-0.52 mid, 0.26-0.33 far) on a level base, lit from below by the low sun, the top in `shade_top`. P2: 8-11 level strokes per hump, crisp toward the light. P3: a lit underside in 70-220 px segments, warmest by the sun. k .22 / .38, blur 1.3 / 2.4 | 3.3 | 3, 3b | **About 1/2**: the depth reads, but each plane is one slab where 03 stacks several, with lighter gaps and dragged ends. |
| Horizon streaks | 4 rows, 16-74 px above the horizon, 3-12 px tall and 70-520 px long (log-uniform). Each is a rose body ~6-8 L* under the band with a lit underside 0.42 w wide, brightest within ~340 px of the sun | 3.4 | 4 | **About 1/2**: nearly invisible at 400 px, by design (the far stays calmest). |
| Sun and glow | A flat disc, r 20: the band above it mixed 85 % toward `sun` #fff0db, so one step over its band; edge 1.2 px, no halo; cut by the far roofs. The glow is the sky's warmth plus the lit undersides nearest the sun | 3.5 | 5 | Right by CRAFT §g.2 (a rule here, not a reference to match). |
| Far flock | 46 two-stroke birds (V, gull, level), 82 % of them in 9 clumps along an arc; the wingspan grows 3.5-9.5 px toward the near end; drawn at 4x | 3.6 | 6 | **About 3/4** as a drawing. In a film the flock is a mover, never baked (§3 C12). |

### 2.2 Water (`paint_recipes/water.md`, swatch `water_swatch.png`)
| Element | Recipe in one line | § | Row | How close (honest) |
|---|---|---|---|---|
| E1 Calm mirror of a dusk sky | P0: a ladder by depth (L* 74 -> 51, rose-peach -> blue-violet), with a horizon step >= 15 L* and mirrored cloud bands. P1: 5-8 soft strokes, +-1.5-3.5 L*, sigma 6 -> 3. P2: bold flat dashes, ONE light and ONE dark colour per plane (+-7-15 L*), in chains along the swell and only on windy patches, covering 4 / 7 / 9 %. P3: 2-8 crisp accents and the broken waterline. P4: tooth +-0.5 L* | 5, 6 E1 | 1 | **About 1/2**: calm, painted, a clear horizon. Its marks cover 3.1 % of the water (the painted refs 6.7-8.1 %); its horizon step is 15 L* (theirs 30-50). |
| E2 Lit-window reflections | Mirror the thing about its own waterline, simplify it (a 7 x 21 median), tone it 25-30 % toward the water (-4 L*, C* x0.9, Fresnel -8 L* x depth). One solid block down to 60 % of its length, then level bars, crossed by thin sky-break lines. A light is a glow column + a block over 35 % of its length + <= 3 slivers + cores | 6 E2 | 2 | **About 2/3**, the closest water piece: a mirror, with lights that read as light on water. |
| E3 Sun's glint column | A soft screened lift (opacity 0.50 -> 0.12, FWHM 1.1 -> 2 x the width parameter), one amber lens per band (14-46 x 1.6-5 px), sparser toward us, 4-6 gold-white slivers and a short bright line under the sun; no stars | 6 E3 | 3 | **About 1/2**: 03's softness in the far half, but the near lenses are a little regular. It was drawn under the old saturated 96 px disc (§3 C6). |
| E4 Ripples, a post and its rings | The body at full dose (2 colours per plane, dash medians 30-42 px, 1-3 per chain, calm patches). A post reflects solid to 60 %, then in bars. Rings: 7-10 dashes per flattened ellipse (1 : 7), with a dark partner on the near arc | 6 E4 | 4 | **About 1/2**: the lighthouse's method, but calmer, thinner and less blocky (marks 4.9 % against its 7.1 %). |
| E5 Wet sand and wet paving | Wet ground mixes its own colour with the sky it mirrors (80 -> 45 % toward us). The sky's bands smear along the ground (sigma 14 along, 3 across; on rough stone, 10 down). Rocks reflect short and dark. Pools mirror the higher sky inside a crisp 0.6 px edge | 6 E5 | 5 | **About 1/2**: its bands are softer and less designed than the van's, and the rocks are simple domes. |
| E6 Waves and foam | 3 foam lines (4 / 7 / 13 px tall, far -> near). Each is ONE lumpy band of rounded domes, sky-lit (never white, <= L* 90), +12-17 L* over a mid-tone sea, with a darker wave face below it. Crest lights on 40 % of the lumps, curls on the near line; long thin sea bands between the lines; a lacy swash | 6 E6 | 6 | **About 1/3-1/2**: it reads as foam lines, smaller and weaker than 03's; the curls vanish at 400 px. |
| E7 King's Cross canal | Mirror the v4 design above the waterline (the 7 px quay face, the quay top skipped), median 7 x 21, k 0.3 + Fresnel, wobble 0.5 -> 2.7 px. The door is painted as a light (0.75 x its height). The body at dose 0.6 with 4 accents; a sparse glint (0.5); rings round the duck. The boats, the duck and Pip's post stay our crisp flat | 6 E7 | 7 | **About 1/2**: a calm, painted dusk canal; the left third mirrors a little busy. |

### 2.3 Trees and greenery (`paint_recipes/foliage.md`, swatch `foliage_swatch.png`)
| Element | Recipe in one line | § | Row | How close (honest) |
|---|---|---|---|---|
| Tree crown | 9 pads, wider than tall, with flat undersides, lit by three spheres (bump, pad, crown) from L = (-0.70, -0.62, 0.36). 4 zones by area (deep 15 / shade 30 / mid 28 / lit 27 %) + accents ~5 %. Painted dark first: the inner dark; the wood in two facets; each zone one step under its marks; ~1550 dabs (D 0.021 W), one step lighter, covering 74 / 56 / 38 / 10 % by zone; a leafy edge of clumps out and notches in; 1.2 % holes cut; accents. Edge 0.88 px | 4.1 | 1, 1b | **About 2/3**: a painted, lit, layered tree. The pads are too alike (a little topiary), the light is one dab scale, and it is greener than the posters' olive. |
| Trees in depth | The same code per plane: mid (3 values, 7 pads, dabs 0.032 W, blur 0.4) and far (2 values, no dabs, a leafy edge 0.065 W, blur 0.5). Far trees stand in a line on the bank, mirrored at random | 3.5 | 2 | **About 1/2-2/3**: depth reads by value, but the mid trees are the near template shrunk. |
| Bush in a planter | 3 domes on the planter (normal 0.65 dome + 0.35 bush). Dry-bristle strokes along the latitude lines (4.5-7 px, op 0.45-0.7), dabs only in the light (55 / 28 / 6 / 0 %), a leafy edge (p_out <= 0.4); the planter in flat faces, its cast shadow lilac | 4.2 | 3 | **About 1/2**: a clipped shrub, busier and lumpier than the Cape Town domes. |
| Grass and reeds | A soft dark MASS first (plum root L* 30 -> 52 at the top, a crest of leaning plume shapes, blur 0.7). Then ~190 back blades, plumes on 40 % of them, front blades and tip lights, leaning 24-47 deg in gusts so the blades group. Near plumes blurred sigma 3; a muted verge with flowers in drifts | 4.3 | 4, 4b | **About 1/2-2/3**: wind in October reeds, but the strokes are shorter and fewer than 02's, and the mass is a little furry. |
| Protea | A cream dome (L* 92 / 85 / 72) with a radial hatch, in a CUP of 9 back + 7 front bracts that fan up. Each bract is two flat facets (74 / 63 / 50 / 37 L*); 8 two-tone leaves; set against a darker field | 4.4 | 5 | **About 2/3**: it reads as a protea; the refs' bracts are bigger and overlap more. |
| Corner leaves | A small October branch from the corner (<= 39 x 16 % of the frame): 24 five-lobed leaves on 3 layers (back 35 % toward the sky at sigma 0.5, mid crisp, the 2 near ones defocused at sigma 2.2), values from just under the sky (78) to the twig (37) | 4.5 | 6 | **About 1/2**: subtle, as asked, but still a little sprinkled. |

### 2.4 Buildings, ground, far city (`paint_recipes/built_ground.md`, swatch `built_ground_swatch.png`)
| Element | Recipe in one line | § | Row | How close (honest) |
|---|---|---|---|---|
| Far city as layered haze | 4 planes of flat blocks (widths 1 : 4, heights 1 : 3, a dip by the sun), one value per block (+-1-2.5 L*). Each plane converts toward the air, with in-scatter by the sun and mist low. A sun-side face and slivers go on the edges that face the sun, window grids on the near planes. Blur 0.3 -> 1.6 px, tops lost by the sun; L* 49 > 59 > 68 > 78, then the air at 88 | 4.1 | 1 | **About 2/3**: a calm, pale, layered city, plainer than ref 01. Measured, its p3 slivers sit 23.5 dE over their body and its p2 lamp windows 33 dE over theirs: over CRAFT §f.2 for a film (§3 C11). |
| Painted facade | Each face valued by its orientation to one sun: sun side L* 75, front 55 / 53, soffits 36, glass 22 / 63, lamps 84, reveals 77. P1: soft strokes, +-4-6 L*. P2: one panel stroke per pier and spandrel (+-4-9 L*), cool patches, warm repairs, brick in patches. P3: slivers on every sun-facing edge, 1.2-2 px. P4: stains, soot, drips, splash, chips, speckle | 4.2 | 2 | **About 2/3** by its own review, at 1:1. This book reads **about 1/2** at 400 px, where the brushwork disappears and the window grid is too regular. |
| Brick and stone | Brick only suggested, in patches (coverage 0.5-0.62, faded edges): course lines on receding faces, dabs on frontal ones. Stone as big flat blocks with lit lips; chips, drips and speckle where water and wear run | 4.3 | 3 | **About 2/3**: at 2x the brick reads more drawn than painted. |
| Paving in perspective | Flags laid out in ground coordinates (0.62 m rows, 0.55-1.25 m long), +-2.6 L* each, fading between 4 and 20 m. Joints thin and fade with distance; the sun's sheen lies along its line; long lilac shadows run toward us (19 x the caster's height, the penumbra growing). Level soft bands, dry strokes clipped per flag, lit lips, grit near | 4.4 | 4 | **About 3/4** of the owner's calm-ground models (02, 03); its strokes are invisible at 400 px. |
| Boulders and rocks | A dome boulder (a superellipse buried 5-9 % in the sand): a dark body L* 38-40 lifting softly to a sky-lit top (57), a thin arris, a warm sun rim, a bounce low. A low-poly rock with facets valued by orientation (83 / 70 / 54 / 47 / 38); shadows start under the rock | 4.5 | 5 | **About 3/5**: more graphic than p01's near-black, softly stroked bodies. |

**Overall, honestly.** Every family's method transfers, and every number above is in code. Most elements get about
half-way to the references; the best (the cumulus, the window reflections, the tree crown, the protea, the paving) get
about 2/3-3/4. Two shortfalls are shared:
- **The key.** Our frames hold captions in a light field: our sky is L* 80-90, while the owner's two models have skies
  at L* 16-50 and 03's sea is 22-41. That halves the value drama.
- **The marks inside near masses.** They are smoother and more regular than a hand's, with one template per element.

More texture closes neither gap. The next steps are bolder designed marks inside the near masses and more variety in
the designs. Each family lists them: `sky_clouds.md` §6, `water.md` §9, `foliage.md` §8 and `built_ground.md` §0.

## 3. Where the recipes disagree, and the call

| # | Topic | What the recipes say | The call |
|---|---|---|---|
| C1 | The depth ladder's k | Clouds use 0 / .22 / .38. Trees use 0 / .28 / .55. The far city uses .12 / .34 / .56 / .78. Paving uses .07-.30 | **CRAFT §f.2's steps for every family: 0 / .12 / .22 / .40 / .65 (+5: .87).** The clouds near / mid / far map to 0 / +2 / +3. The trees near / mid / far map to -1 / +2 / +3. The city's p1-p4 map to +1 to +4. CRAFT outranks the recipes, and one ladder makes two families at one distance read as one distance. |
| C2 | How a plane converges | Sky: a straight OKLab mix. Foliage: a CIELAB lerp, which sends far greens into the olive band (measured: at k .55 all four leaf swatches land at h 91-113, C* 3-24). Built: an OKLab mix plus a chroma scale. Water: its own LCh ladder | **One function: a numpy port of `lib/depth.ts` `atmos()`** (the rule under the table in §1). |
| C3 | Blur by depth | The playbook: "each plane painted softer and blurrier the farther it is". CRAFT §f.2: "never a gradient, fog or blur". Sky: 1.3 / 2.4 px. The far city: 0.3-1.6 px. Foliage keeps every plane crisp (0.4 / 0.5 px), because the refs' trees keep 1.1-1.5 px silhouettes | **Farther is always softer (the playbook outranks CRAFT), by material.** Vapour (clouds, haze, glow) steps 0 / 1.3 / 2.4 px. Solids (trees, buildings, rocks, ground) step 0 / 0.3 / 0.4-0.6 / 0.5-1.0 / 1.6 px over planes 0 to +4, keeping crisp silhouettes to +3, with tops lost only by the sun on +3 and +4. The one big blur on a solid is the near out-of-focus framing (2.2-3 px). CRAFT's wording is doc clash D1. |
| C4 | The colour space | Sky, built and paint.py mix in OKLab (CRAFT §g.1). Foliage and water mix in CIELAB | **Mix and grade in OKLab; measure and quote in CIELAB L* C* h.** A recipe's LCh rules build its hex swatches once. |
| C5 | Where a palette comes from | Water's `KX_LIGHT` is sampled from `paint_still_v4.png` (zenith L* 75, sun #ee6a2e). Foliage and built use the sky recipe's dusk set (zenith 80.9, CRAFT §g.1) | **One light table per scene: the sky recipe's set plus the scene's own local colours.** Water re-derives its ladder from that table. Done as-is, the step at the horizon falls to 10.2 L* and w_far to C* 13 (measured), below the water recipe's own floors. So `w_far` is then set to the air -15 L*, C* >= 15. #ee6a2e stays only as the sun's LIGHT colour, for the glint's amber (CRAFT §f.7 e). |
| C6 | The sun disc | Water E3 / E7: a saturated 96 px #ee6a2e disc. Built's backdrop: r 31. Sky: r 20, one step over its band | **The sky recipe's disc (CRAFT §g.2, DIRECTION rule 6), and only the sky piece draws it.** The glint's width is set in px (E7's `D` 96 gives a column 106 -> 192 px wide), never from the disc. |
| C7 | The light vector | Sky: per plane, toward the sun's image, with lz 0.3. Foliage: L = (-0.70, -0.62, 0.36). Water's rock: (-0.72, -0.42, 0.55). Built: a 3-D sun (az -20 deg, el 3 deg) in the frame, so the fronts are in shade and the slivers go on the edges that face the sun's x | **One sun per set, applied in three ways.** Near and mid solids take the rig's key, L = normalize(-0.70, -0.62, 0.36): the film's crisp layers beside them are lit that way, and built's face values agree with it (sun face 75, front 53-55). Clouds keep the sky recipe's per-plane rule, because a low sun lights their undersides. Far planes (+2 to +4) take built's in-frame rule. Built's fronts-in-shade table is for a shot whose rig says so. |
| C8 | The gamut | Sky and built: three hue families (peach-gold, rose, lilac) and "nothing outside them". Foliage: greens from h 94 to 218 | **Per scene: the sky's three families plus ONE green family for living things.** Its lit end sits at h 100-110, pulled 6-10 deg toward the key; its deep end at h 210-230, toward the sky's cool. The story layers' hero and pop stay crisp, never painted. |
| C9 | The water's mark dose | The water recipe covers 4-9 % of open water. CRAFT §f.7 (f) gives the flat water 6-14 ripple lines | **Settled in CRAFT §f.7 (commit 1f9cd50b): a FEW deliberate strokes on a calm base, 75 %+ untouched.** The canal has only the mid and near planes (depth 0.55-0.95) and runs them at dose 0.6 (4.2 / 5.4 %). `mark_metric` checks it: calm >= 75 %, marks 3-9 %. |
| C10 | The water's P0 | E7 re-mirrors the design image, though `water.md` says it "paints ON that design and never replaces it" (`lib/water.tsx`) | **In production, P0 is the film's flat water from `lib/water.tsx`** (CRAFT §f.7's mirror, Fresnel ladder and cool field), passed as `water_body(base=...)`; P1-P4 paint on it. **A still (v6) may use E7's method,** but must pass `master_check.py`'s cool share (>= 83 %) before production: E7's warm facade mirrors at k 0.3 may fail it. |
| C11 | How rich the far city is | Built: slivers +23.5 dE over the body on p3, lamp windows +33 dE on p2 (ref 01's look). CRAFT §f.2: behind a pale subject the far city starts at +3, with <= 3 values within 12 dE on +3 and <= 2 within 5 dE on +4; windows tone-on-tone (dE <= 6, never the lamp colour) from +2, none at +4 | **CRAFT, in scene 1.** The tower is +3: slivers <= +12 dE, windows tone-on-tone. The far roofs are +4: no slivers, no windows, tops lost by the sun. A ref-01 city of lit windows is a CRAFT change and needs the owner's word. |
| C12 | The flock | Sky §3.6 bakes 46 birds into the sky plate, 20 L* under the sky. CRAFT §f.6: birds are tier-C movers, "far birds pale and small" | **Never baked: a baked flock is frozen.** The recipe's two-stroke bird is the drawing for the particle layer (`lib/particles`), the whole flock at the recipe's pale far end (55 % toward the sky). |
| C13 | The sky curve | paint.py v5 and built's backdrop join the stops linearly (`np.interp`). The sky recipe uses PCHIP | **PCHIP** (CRAFT §g.1's monotone cubic): `sky_clouds.sky_ramp`, one sky behind every piece. |
| C14 | The zenith | The v4 / v5 stills had a zenith 10 L* under the field (74 vs 84) and a caption band spread of 3.4 L*. The sky recipe keeps CRAFT §g.1 (80.9 vs 82.0; band 1.08) | **v6 follows the recipe (CRAFT).** Bake v4's top as a second sky (`palette.zenith` #afb3d8, one spec line) and show both. A deeper zenith needs the owner's word and `check_banding.py` on the master (doc note D4). |
| C15 | Strokes and bristles | Built never uses the bristle term. Water keeps bristle depth <= 0.06. Sky uses a bristle texture only for dry breaks. Foliage draws dry-bristle plumes | **§1 item 8:** the profile is swept, the breaks run along the stroke, and bristles show only where they are the form. |
| C16 | Seeds | Sky: `default_rng([SEED, id])`. Water and built: sha256 of a key. Foliage: a child generator per pass. paint.py: `seed * 7 + n` | **`rng_for(seed, piece, pass)` = sha256, one generator per pass.** Stopping early never changes the earlier passes, and adding strokes to one pass never reshuffles the next. |
| C17 | Which way a mark goes | Foliage: always one step lighter, on a darker base (dark first). Built and water: lighter and darker marks about a mid base | **Both, by material.** A leafy mass is painted dark first with lighter marks; a surface or water carries light and dark marks. Either way a mark is one step (4-15 L*) off its zone. |
| C18 | The sun's warmth | Sky: an ellipse (rx 475, ry 214, smootherstep, cut above y 556). Built: an in-scatter veil (Gaussian 330 x 260) and a backdrop warmth (300 x 95) | **One warmth field per set: the sky's ellipse.** The far planes use it as their in-scatter veil, so their tops melt where the sky warms. |

**Doc clashes found** (a clash is a bug; flagged for the orchestrator, not edited here):
- **D1.** CRAFT §f.2, "One flat step per plane toward the air ... (never a gradient, fog or blur)", against the
  playbook's "each plane painted softer and blurrier the farther it is". Proposed CRAFT wording: "(never a gradient, fog
  or blur on the flat world; a painted piece softens by its plane: `PAINT_RECIPES.md` §1)".
- **D2.** `sky_clouds.md` §3.6 bakes the flock. Add: "a drawing for the particle layer, never baked (CRAFT §f.6)" (C12).
- **D3.** `built_ground.md` §4.1's far city goes over CRAFT §f.2 on +2 and +3. Add CRAFT's caps for a far city behind a
  pale subject (C11).
- **D4.** `water.md` §4's `KX_LIGHT` samples v4's sky, which is outside CRAFT §g.1, and §6 E3 / E7 derive from the 96 px
  saturated disc. Take the sky recipe's set and disc (C5, C6). The v4 / v5 zenith is the owner's question (C14).
- **D5.** `foliage.md`'s `converge` (a CIELAB lerp) should become CRAFT §f.2's `atmos` (C2).
- **Closed:** `water.md` §9's clash with CRAFT §f.7 over dashes; CRAFT now allows a few deliberate strokes (commit
  1f9cd50b).

## 4. Into the engine: painter v6 for the scene-1 canal evening

The handover's next step (`docs/studies/2026-10-28_city_posters/HANDOVER.md`): one agent, an iteration of stills
only, builds painter v6 from this book (the sky and its layered clouds, the water, the tree, the far city), with real
darks and the refined her. It is compared beside `ai_paint/ai_still_v1.png` and v5. The painter is
`scripts/look/paint/paint.py`, the placing half `src/lib/paint/`, the scene `src/look/paint_s1/` (`PaintS1`). Paths
below are from `video/`.

### 4.1 What v6 paints, and what stays crisp
- **Painted:** the sky (with its streaks and the sun disc), three cloud planes, the canal, the near tree (bottom left)
  and the far city (the tower on +3, the far roofs on +4).
- **Stays the film's crisp flat:** her, the people, the facade with its lit door and sign (the subject's building), Pip,
  the boats and the duck, the captions, the paving, the corner branch and the pier (flat in v6; its recipe is
  `built_ground.md` §4.3, later).
- **Hidden in set v6:** the film's saturated sun disc (the sky piece paints CRAFT §g.2's disc), plus each flat layer
  that a painted piece replaces (`usePainted`, as now).
- **Darks from the paint:** only the tree's inner dark and undersides (L* 31-33). The sky, the canal and the far city
  carry no darks (CRAFT §f.8).

### 4.2 Plumbing (new in paint.py, shared by the five styles)
```python
import hashlib
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'recipes'))
import sky_clouds as SC, water as WA, foliage as FO, built_ground as BG   # the proven code: imported, never copied

PLANE_K = (0.0, 0.12, 0.22, 0.40, 0.65, 0.87)          # planes 0 .. +5 (CRAFT §f.2; lib/depth.ts PLANE_STEPS, GHOST_K)

def rng_for(seed, piece, pas):                           # §3 C16
    return np.random.default_rng(int(hashlib.sha256(f'{seed}:{piece}:{pas}'.encode()).hexdigest()[:8], 16))

def atmos_np(rgb, k, air_hex, chroma=0.8, floor=8.0, olive=(88.0, 118.0)):
    """lib/depth.ts atmos() per pixel in CIELCh (§3 C2); k may be a per-pixel map (in-scatter, mist)."""

def scene_light(spec):
    """The ONE light table (§3 C5): SC.DUSK (+ spec['palette'] overrides) + spec['local'] (window, door, stone,
    paving ...) + spec['sun_colour'] '#ee6a2e' (the glint's light, never a disc)."""

def sun_veil(x0, y0, w, h, sun=(196, 779)):             # the one warmth field (§3 C18), in a piece's box
    return SC.sun_warmth(h, w, (sun[0] - x0, sun[1] - y0), 0.44 * 1080, 0.198 * 1080, 556 - y0)
```
- **The geometry lives in module constants** (`SC.SUN`, `SC.HORIZON`, `SC.CAPTION`, `SC.PLATE_H`, `BG.SUN`,
  `BG.HORIZON_Y`, `FO.LIGHT`). Set them once from the spec before painting. Scene 1's values are already theirs: sun
  (196, 779), horizon 792, caption band 317-556, key (-0.70, -0.62, 0.36).
- **`write_png`:** sky pieces go out through CRAFT §g.4's dither (`SC.Layer.rgb(dither_seed)`: +-2 codes at a 2 px
  grain). The other pieces keep paint.py's output.
- **The checks first:** `atmos_np` must match `lib/depth.ts` `atmos` (run with node) within 1 dE on three colours (a
  brick, a sage and a lilac at k .22, .40 and .65).

### 4.3 The five styles (spec keys with scene 1's values)
1. **`style: "sky_recipe"` -> `style_sky_recipe(piece, spec)`.**
   - **Calls:** `SC.paint_sky(900, 1080, pal, 'dusk', rng, sun=(196, 779), glow=0.55)`, then
     `SC.paint_streaks(sky, pal, rng, sun, n_rows=4)`, then `SC.paint_sun(sky, pal, sun, r=20)`.
   - **Keys:** `size` [1080, 900], `palette` (`SC.DUSK`; the C14 A/B is `{"zenith": "#afb3d8"}`), `sun`
     {xy [196, 779], r 20, glow 0.55}, `band` [317, 556], `streaks` 4.
   - **Output:** one opaque PNG, box [0, 0, 1080, 900], static (the sky never floats). About 2 s.
2. **`style: "cloud_planes"` -> `style_cloud_planes(piece, spec)`.**
   - **Calls,** per plane, far to near: `SC.paint_mass(box, billows, pal, sky, rng, dict(SC.DEPTH[depth],
     base_y=base_y, k=PLANE_K[plane]))`. `sky` is the sky piece's layer, painted again in-process from its seed (the
     same bytes).
   - **Keys per plane:** `name`, `depth` (near | mid | far), `plane` (0 | 2 | 3), `box` [x0, y0, x1, y1], `base_y`, and
     `billows` [[cx, cy, r, flat, z], ...]. Any `SC.DEPTH` key can be overridden.
   - **Scene 1:** near {box [560, 0, 1080, 345], base_y 300, `SC.NEAR`}; mid {[0, 100, 580, 290], 240, `SC.MID`}; far
     {[0, 610, 780, 706], 686, `SC.FAR`}.
   - **Output:** one RGBA PNG per plane, `group` "clouds" with its `depth` (lib/paint `<PaintedGroup>`, as in v3-v5).
     `--design` writes the `flat` that `paint_mass` returns. About 2 s.
3. **`style: "water_recipe"` -> `style_water_recipe(piece, spec)`.**
   - **Calls (v6):** `paint_canal(design_rgb, spec)`, which is `WA.e7_canal` with its constants turned into keys. In
     production, the canal is `WA.water_body(cv, mask, W, seed, key, y_top, y_bot, s_range, base=<the lib/water flat>,
     dose=...)` (§3 C10).
   - **Keys** (boxes [x0, y0, x1, y1]; values measured on v4): `rows` [1030, 1310]; `waterline` [[0, 1068], [460,
     1111]]; `near_edge` {y0 1143, slope 0.1311}; `s_range` [0.55, 0.95]; `dose` {mid 0.6, near 0.6}; `accents` 4.
   - **Crisp `objects`** (never painted): the boats [785, 1040, 1080, 1210], the duck [355, 1080, 445, 1142] and Pip's
     post [650, 1112, 750, 1300].
   - **The light:** `lights` [{box [545, 850, 712, 1062], length 0.75}].
   - **The reflection:** `reflection` {solid 0.6, face 7, quay_top 10, simplify [7, 21], k 0.3, fresnel [-4, -8],
     wobble [0.5, 2.7, 120]}.
   - **The rest:** `glint` {x 196, D 96, strength 0.5, slivers [2, 4]}, where D is the column's width (C6); `rings`
     {xy [400, 1137], r0 46, grow 1.5, ratio 7}; `contact` {px 1.2, dL -12, op 0.5}.
   - **The palette:** `WA.water_palette()` fed from `scene_light()`, then `w_far` set to the air -15 L*, C* >= 15 (C5).
   - **Output:** one RGBA PNG of the canal (alpha = the water minus the objects), under the crisp boats, duck and post.
     About 4 s.
4. **`style: "tree_recipe"` -> `style_tree_recipe(piece, spec)`.**
   - **Calls:** `FO.paint_tree(w, h, base, crown_c, Wc, Hc, rng, plane='near', air=None)`, in a box that runs past
     the frame's left edge (the frame cuts the crown).
   - **Keys:** `box` [-60, 1250, 360, 1550]; `trunk_foot` [128, 1529]; `crown` {c [125, 1392], W 330, H 190};
     `plane` -1 (CRAFT's plane for its group; the call is `plane='near'`); `wood` "recipe" (the flat trunk is hidden).
   - **The crown's shape:** v4's flat crown is visible over x 0-285 and y 1308-1475. Its H/W of 0.58 is flatter than
     the recipe's 0.82; if the pads read squashed, raise H to 0.7 W (the design grows ~40 px up).
   - **Output:** one RGBA PNG with its sky holes cut (alpha 0), in the near plane's group. About 2.5 s.
5. **`style: "far_city_recipe"` -> `style_far_city_recipe(piece, spec)`.**
   - **Per plane, from its flat.** The blocks are the flat's colour regions (`ndi.label` per quantised colour).
   - **P0:** one value per block (OKLab L jitter sd 0.010 / 0.012 on +4 / +3), then `atmos_np` with a per-pixel k:
     k = k0 + (1 - k0) x scatter x veil, then k + (1 - k) x mist x smoothstep((y - 762) / 170), with k0 = PLANE_K,
     scatter .45 / .40 and mist .12 / .10. Plus a mottle of +-0.5 / 0.6 L* at a 46 px cell (`BG.value_noise`).
   - **P2 (+3 only):** the face toward the sun's x, 20-36 % of the block, one step lighter.
   - **P3 (+3 only):** slivers 2.4 px wide on 80 % of the sun-facing edges (`BG.Brush.line`, crisp 0.45, taper 0.6,
     dry 0.2), in `glow` converted, capped at +12 dE over their body.
   - **Windows:** the flat's own, recoloured tone-on-tone on +3 (dE <= 6 from the wall), removed on +4.
   - **The plane:** blur 1.0 / 1.6 px, with the tops lost by the sun (a blend toward sigma 2.5 / 3.5 by min(1, 1.15 x
     veil)).
   - **Keys:** `planes` [{name "roofs", flat "out/paint/v2s1/flat/farroofs.png", plane 4}, {name "tower", flat
     "out/paint/v2s1/flat/fartower.png", plane 3}], `air` "horizon", `caps` {"3": 12, "4": 5} (dE).
   - **If a flat has no distinct blocks,** design that plane with `BG.skyline(rng, w, BG.FAR_PLANES[i])` in its box
     (x 0-371, base y 943). The iteration may do this; in production the film designs its far city.
   - **Output:** one RGBA PNG per plane, each riding its own parallax. About 2 s.

### 4.4 The order of work and the v6 checks
1. **Plumbing** (§4.2), with the `atmos_np` check.
2. **The sky and the cloud planes:** `--design` first (the flat planes in the scene beside v4's design), then the paint.
3. **The canal, then the tree, then the far city.**
4. **The composite:** `PaintS1` set "v6", with the sun disc hidden.
5. **The compare sheet at 400 px:** v5 | v6 | `ai_still_v1` | refs 03 and 02, plus the C14 sky A/B.

The checks: an iteration's numbers go in `paint_test/NOTES.md`, with no panels.
- **Determinism:** two bakes give the same md5.
- **The captions:** on the words' rows (x 150-800, y 317-556), the p2-p98 spread is <= 1.5 L*.
- **The canal** (`WA.mark_metric`): calm >= 75 %, marks 3-9 %, tooth 0.6-2.0.
- **The far city:** +4 within dE 10 of its air and <= 5 dE inside; +3 <= 12 dE inside.
- **The tree:** a silhouette edge of ~1 px.
- **The bake:** <= ~15 s on one core.

### 4.5 After v6
- **The next recipes to become styles, in order:**
  1. the paving (`built_ground.md` §4.4, the near ground);
  2. the bush and planter (`foliage.md` §4.2);
  3. the corner branch (§4.5);
  4. the reeds (§4.3), where a film has them;
  5. the facade, only if the owner asks (in scene 1 it is the subject's building).
- **Refactor once v6 is approved:** the four proof scripts become one library with explicit scene parameters instead
  of module constants; each proof script becomes a thin caller.
- **Motion:** each plane is already its own PNG.
  - Clouds drift by their depth; a slow churn displaces only the near mass, by a few px.
  - The tree sways as one rigid image about its trunk foot (0.4-0.8 deg, 3-4 s).
  - Water motion stays in the flat layer (CRAFT §f.7 g).
  - The opening paints the plate on pass by pass (`lib/paint/reveal.tsx`): every pass has its own seed, so the
    passes can play in order.

## 5. Keeping this book
- **A new element or family** gets five things:
  - its recipe in `paint_recipes/<family>.md`: the measured refs, the sources, the design, the passes, the edges, the
    depth, the mistakes, a numpy spec and an honest verdict;
  - a seeded proof script in `scripts/look/paint/recipes/`;
  - a swatch beside the reference crops;
  - a row in §2, and any clash in §3;
  - a rebuilt contact sheet (the four swatches side by side, 381 px each).
- **A call in §3 that the owner overrules** is rewritten here and in its family recipe in the same turn.
