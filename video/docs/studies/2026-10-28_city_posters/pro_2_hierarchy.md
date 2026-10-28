# Pro practice 2: a hierarchy of finish (crisp heroes, a simpler world that still belongs)

*City-poster study, pro-practice researcher 2, 2026-10-28. Analysis only: nothing here is a rule until the owner approves
it; `video/docs/look/DIRECTION.md` stands (incl. the owner's answers of 2026-10-28 ~22:10: one look, the VERY subtle
texture test, lit and shade faces, a full value range; outline-free edges, the patchwork and layout still open).
Meter: `video/scripts/look/posters/pro_2_hierarchy.py` (all numbers below; JSON in `/tmp/posters-pro_2_hierarchy/`).
Sheets: `img/pro_2_hierarchy_tiers.jpg` (A / B / C near / C far crops at one magnification, v2 S1 in the last row),
`img/pro_2_hierarchy_detailmap.jpg` (where the small features sit, 7 posters + v2 S1, S4, S7).*

**The owner's feeling** (verbatim in `docs/look/poster_refs/README.md`): "some objects that are obviously the main parts
and so they stand out and they have more details and cleaner lines and just all around crispier and there are rest of the
objects that compose the scene and give it fullness and live and the right amount of density, but they are obviously
less detailed, a bit more low poly but nonetheless coherently fit into the style and the picture. Like you can't
immidetaly spot that something is off, only after looking at details for some time".

## 1. The feeling, restated precisely
**Restated:** 1-3 objects get a higher FINISH (more small features, regular straight lines, a clean silhouette, richer
tones); the rest is the SAME style at a coarser resolution: the same faces, colours, edges and light, with the small
features taken out. A glance reads the big shapes and colours, which match; only a long look finds the simplification.

**Measured** (37 boxes on the 7 posters at 1080 px wide, UI masked; median [range]; v2 = the S1 cover frame, t 5.20 s):

| per box | A hero (15) | B support (8) | C near: patchwork (7) | C far (7) | v2 S1: A / C near / C far |
|---|---|---|---|---|---|
| small features: thin < 9 px at >= 10 L*, % of area | **6.9** [0.5-14.2] | 8.4 | **1.8** [0.6-4.5] | **0.7** [0-4.0] | 11.2 / **0.2** / 0.9 |
| shapes (faces) per 10,000 px | 15.3 | 16.8 | **14.5** [11-25] | 7.1 | 20.5 / **3.2** / 8.0 |
| typical face side, px | 49 | 39 | 49 | 77 | 37 / 81 / 109 |
| tone spread inside a face (L* p90-p10) | 9.5 | 10.6 | 6.1 | 6.0 | 2.6 / 3.2 / 3.0 |
| L* range (p5-p95) | 62 | 64 | 64 | 39 | 59 / 30 / 20 |
| local contrast (CRAFT §e) | 11.0 | 10.9 | **9.7** [5.0-17.8] | 5.1 | 12.1 / **3.0** / 2.6 |
| surface texture, std L* in calm areas | 1.5 | 2.4 | 1.1 | 0.7 | 0.4 / 0.2 / 0.6 |
| strong-edge width 10-90 %, px | 2.7 | 2.7 | 2.3 | 2.3 | 2.1 / 2.3 / 2.2 |
| CIEDE2000 to the A+B palette | 4.5 | 5.5 | 6.3 [5.1-7.9] | 4.4 | 1.8 / 5.4 / 5.2 |

**Where it lives** (boxes in each screenshot's pixels; all 37 in the script): Singapore's MBS towers `[232,661,877,1054]`
(a 2-3 px mullion grid, lit and shade faces, the skypark's tiny trees) against the far blocks `[0,739,345,994]` and the
patchwork `[135,1339,495,1609]` (stairs, arches, walls as flat blocks of the shophouses' terracotta, sage and teal);
Hallgrimskirkja `[45,398,532,1118]` (each stepped column a lit/shade pair) against the faceted roofs `[0,1118,630,1260]`
(1.3 % beside the houses' 5.7 %); Casa Rosada `[660,960,1206,1395]` (11.7 %) against the patchwork `[520,1430,780,1575]`
(3.2 %); Kinkaku-ji `[638,739,1170,1129]` (10.4 %) against the patchwork `[560,1180,720,1300]` (0.6 %) and the far
mountains `[660,634,1206,799]` (0.1 %). Hanoi's far city `[360,574,1200,829]` is the other far option: a miniature (4.0 %).

**What creates the feeling, three findings:**
1. **The tiers change resolution, never style.** What stays: the face size (A 49 px, C near 49 px), the palette (C sits
   within CIEDE2000 ~6 of the hero's colours), the edge (2.3-2.7 px on every tier: nothing is blurred or faded), the light
   and the paper texture (on every plane, weaker with distance: 1.5 / 1.1 / 0.7). What changes: the small features
   (A 3.8x C near, 10x C far), the tones inside a face (9.5 vs 6), and on the far plane the value range and chroma.
2. **The patchwork is the "low poly" layer, and it is FULL.** It keeps the hero's density of shapes (14.5 vs 15.3 per
   10,000 px) and its value range (64 vs 62) but drops the small features, cutting stairs, walls, roofs and reflections
   into flat rectangles and diagonals. At a glance it reads as more city; on a long look, as geometry.
3. **Crisp = small, REGULAR features plus a clean silhouette.** The heroes' lines repeat in rhythms (mullion grids,
   columns, balustrades); the Obelisco `[558,393,670,1065]` is crisp with almost no features (0.5 %): a pure light shaft
   with a clean edge (step 33 L*) against a soft sky. The near life (B) is as rich as the hero (8.4 %) because it is big
   and close: the ladder runs by role first, then distance.

**v2 (the baseline) has a hierarchy of CONTRAST, not of finish.** Its subject leads by muting the world (local contrast
12.1 against 3.0 in the near ground, 4x; the posters' hero vs patchwork 1.1x), and every tier has the same finish: one
flat fill per face (tone spread 1.4-3.2, below the posters' FAR planes), no texture. Its largest area, the near quay and
props (31 % of the frame), is the emptiest: 3.2 shapes per 10,000 px (patchwork 14.5), L* range 30 (64). Its detail
clusters in a few spots (the top 10 % of tiles hold 68-91 % of its small features; posters 51-71 %) with dead flats
between. For this feeling, that is what reads "cheap and lazy": big areas with nothing to read, and a hero no richer
in kind than a crate.

## 2. How the professionals do it
Read through search summaries (Valve's PDFs on the steamstatic CDN were not reachable from this session).
1. **Valve, Team Fortress 2** (Mitchell, Francke, Eng, "Illustrative Rendering in Team Fortress 2", NPAR 2007; Mitchell,
   "Stylization with a Purpose", GDC 2008: https://cdn.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf):
   a "read hierarchy" (team, then class, then weapon); environments of simple forms, minimised visual noise in texture
   and geometry, an impressionistic painterly look; characters designed to read with NO internal detail (silhouette
   first), their highest contrast at the chest, more saturated than the desaturated world; one illustrative shading
   model for both. **Teaches:** finish by role inside one rendering model; silhouette before detail.
2. **Riot, the Summoner's Rift update** ("Updating Summoner's Rift", 2014-06; "Defining the Rift's Visual Style",
   2014-11-08: https://archive.runeterra.net/na/riot-official/5E5saupc): visibility ordered UI > effects > champions >
   environment; the tools were colour control, LOD control and clamped value ranges; clarity = art that keeps visual
   clutter down, in a handcrafted style. **Teaches:** LOD and value clamps are art-direction levers, set per tier.
3. **Fortiche, Arcane** (80.lv, "Arcane artists show how they combine traditional art & 3D for backgrounds", est. 2022:
   https://80.lv/articles/arcane-artists-show-how-they-combine-traditional-art-3d-for-backgrounds): the painters loosen
   most of a background but sharpen the parts the characters interact with, to match the 3D characters' detail.
   **Teaches:** a finish gradient around the action, never a cliff.
4. **Sony Imageworks, Spider-Verse** (Cartoon Brew, "If It's Not Broke, Break It", 2018-12, est.:
   https://www.cartoonbrew.com/feature-film/if-its-not-broke-break-it-sony-imageworks-renegade-approach-to-spider-man-into-the-spider-verse-167321.html):
   out-of-focus planes shown as offset-print misregistration, not lens blur (Danny Dimian). **Teaches:** lower a tier in
   the style's own vocabulary (for us: bigger facets, fewer tones), never with a filter (blur, opacity).
5. **James Gurney**, "Automated Selectivity" (Gurney Journey, 2011-05-23:
   https://gurneyjourney.blogspot.com/2011/05/automated-selectivity.html): the soft regions of a photo do not hold a
   viewer's interest the way the softened regions of a Sargent do. **Teaches:** C is designed simplification; a
   mechanical reduction reads as missing work.
6. **Eye tracking: Santella and DeCarlo**, "Visual Interest and NPR" (NPAR 2004:
   https://isgwww.cs.uni-magdeburg.de/~stefans/npr/entry-Santella-2004-VIN.html): viewers examine as many places in
   images of uniformly high or uniformly low detail as in photos, but are drawn to where detail is locally preserved in
   meaningfully abstracted images; **Cole et al.**, "Directing Gaze in 3D Models with Stylized Focus" (EGSR 2006:
   https://gfx.cs.princeton.edu/pubs/Cole_2006_DGI/cole06_stylizedfocus.pdf): local changes of saturation, contrast and
   line pull the gaze, verified by eye tracking. **Teaches:** the hierarchy of finish is a measured gaze driver; a
   uniform finish (v2) gives the eye no such cue.
7. **Pixar, The Good Dinosaur** (2015; Sharon Calahan in AWN:
   https://www.awn.com/print/animationworld/sharon-calahan-talks-lighting-and-visual-development-good-dinosaur): some
   reviewers found the soft cartoon cast at odds with the photoreal land; Calahan's "painterly realism" (you can't see
   every leaf on a tree, yet you know it's a tree). **Teaches:** a change of rendering MODE jumps out; a change of LEVEL
   inside one mode does not; simplification keeps identity.
8. **Charley Harper, "minimal realism"** (Audubon, "Counting the Wings", Jan-Feb 2008:
   https://www.audubon.org/magazine/january-february-2008/counting-wings): the subject reduced to its simplest visual
   terms without losing its identity (his line, in several wordings: he counts the wings, not the feathers). **Teaches:** what C keeps
   (silhouette, proportions, colour, the count of big parts) and what it drops (the small features).
9. **Lost and found edges** (Matt Kohr, Ctrl+Paint, https://www.ctrlpaint.com/videos/lost-edges; Utrecht University,
   https://research-portal.uu.nl/en/publications/macchie-passages-and-edges-lost-amp-found/): an edge is lost where two
   shapes are close in value and hue, found where they differ. **Teaches:** in flat colour, emphasis is the fills' step.
10. **Game LOD practice** (Wikipedia, "Level of detail (computer graphics)": by distance "or according to other metrics
   such as object importance"; texel density, one per scene: https://www.vertexschool.com/texel-density-guide).
   **Teaches:** each object's level from its role and on-screen size; one detail density per plane.
11. **Shedworks, Sable** (GDC 2022, https://gdcvault.com/play/1027721/The-Art-of-Sable-Imperfection): a flat-shaded,
   lined world read through lighting first and a distant fog. **Teaches:** one light and one air make it one world.
Dropped after search: Kurzgesagt (no first-party writing on detail hierarchy found), Marco Bucci, Sinix and Feng Zhu (no
checkable source found in this pass), Breath of the Wild's painterly far LOD (not confirmed).

## 3. The concrete approach for our films
**3.1 The finish ladder** (a proposal; px at 1080 x 1920; posters' medians in brackets; "est." = set by eye, to tune in
the G4 look clip). Tier = story role (rule 2), the plane modulates C; rule 5's 2-3 tones and rule 4's line hold.

| | A subject (1-3) | B support | C near: the patchwork | C far |
|---|---|---|---|---|
| small features, % of its area | 6-12 [6.9] | 4-8 [8.4] | <= 2, as identity marks [1.8] | <= 1 [0.7] |
| smallest feature | 2 px (§c's 1.8-2.0 detail), in regular rhythms | 5 px | 8 px; hairlines only where the thing IS a line | 12 px (est.) |
| shapes per 10,000 px | 10-25 [15.3] | 12-25 [16.8] | 11-25, the hero's density [14.5; v2 3.2] | 2-15 [7.1] |
| typical face side | 30-110 px [49] | ~40 px [39] | 30-75 px [49] | 50-200 px [77] |
| tones per volume | 3: lit, shade, one accent band (a cornice shadow, reflected light) | 2-3 | 2 per mass; neighbour facets dL* 4-10 | 1-2, pulled to the air (§f) |
| silhouette tolerance (est.) | <= 0.5 px, curves stay curves | <= 1.5 px | <= 4 px, snapped to the scene's grid | <= 8 px |
| edge (one crisp edge, never blur or opacity) | found: >= 25 L* to its ground on the lit side | parts by value (§c) | lost inside a mass, found at its outline | lost into the air |
| value | L* range 60-80, the frame's few real darks (rule 6) | 40-70 | 40-70 [64]; local contrast ~10 if still (§6) | L* range <= 45, local contrast <= 6 |
| texture (rule 4's opt-in) | 1.0x | 1.0x | 0.7x | 0.4x [1.5 / 2.4 / 1.1 / 0.7 std L*] |
| parts per object (est.) | a facade 60-300 (panes, bars, sills, cornice) | a house 10-30 | a building-sized mass 3-8 facets + <= 3 marks | 1-3 facets, 0-2 marks |

**"Low poly" in our SVG:** a C object is its A version on a coarser grid: <= 8 vertices per building silhouette, <= 10
facets per tree crown, straight edges only (a curve becomes 2-4 segments), each facet ONE flat fill chosen by its
orientation to the key (flat-shaded low-poly, inside rule 5's tones), no stroke, no feature under its minimum (dropped,
never shrunk: shrunk features become §c's specks); its identity marks (a window pair, a roof edge, a stair run, a
lamppost) are single flat shapes, one every 3-6 facets, so the mosaic reads as city, never as a rug.

**3.2 Coherence: what makes a mismatch jump out, and the guard** (TF2, The Good Dinosaur, Spider-Verse, Harper):
another rendering mode (a gradient, blur, glow, opacity fade or photo texture on one tier) -> every tier is flat fills,
flat tone steps and the same edge; another shape language -> C is A's construction (corner radii, angles, the vanishing
lines) on a coarser grid; another palette -> C's fills are A and B's fills or their air-pulled steps (CIEDE2000 <= 8);
another light -> every facet takes its lit or shade tone from the one rig (rule 5); another surface -> the texture, if
kept, covers every tier, weaker with distance; another line -> no tier invents a width or colour (rule 4).

**3.3 The "can't spot it at a glance" test.** **Owner** (each G4 look clip and G6 cut, on the phone): flick the frame
past as a scroll (~2 s): does anything look off, is it one picture? Then look 10 s: name the crispest thing. Pass: nothing
off at 2 s, the beat's A named at 10 s (the UX five-second test, Perfetti, UIE 2005, is the same idea). **The check**
(`scripts/qa/check_finish.py`, new; prototype: `video/scripts/look/posters/pro_2_hierarchy.py`), on a finish sheet (JSON
boxes or polygons per tier from the code's geometry, like `scripts/qa/depth_sheets/`) and the frame: (1) finish: A's
small features >= 3x C near's and >= 5x C far's (posters 3.8x, 10x), A's tones >= C's; (2) glance: after a Gaussian
blur of sigma 3 px (the < 9 px features gone), each C plane is within CIEDE2000 8 of the A/B palette, edge width within
1.3x, face side within 2x of A's, local contrast >= 0.4x A's (C must not be a hole); (3) emptiness: no C region over 5 %
of the frame below 8 shapes per 10,000 px (v2's near ground: 3.2 on 31 %); (4) mismatch: any piece whose line width,
fill colour, tone count, texture or edge width falls outside its tier's band. Plus CRAFT §b's salience check (the peak on A).

**3.4 The engine piece.**
- **`src/lib/finish.ts`** (new, S-M): `FINISH[tier][plane]` = {minFeature, silhouetteTol, tones, textureK, faceSide};
  `useFinish()` reads `useTierHere()` (`lib/tier.tsx`) and the plane (`lib/depth.ts`) and returns `lod` 2 / 1 / 0;
  `simplifyPath(pts, tolPx)` wraps simplify-js (Agafonkin, Douglas-Peucker + radial distance, BSD-2:
  https://mourner.github.io/simplify-js), its tolerance in screen px. An object's lod is fixed per SHOT from its tier and
  its largest on-screen size along the known camera path (games' screen-size LOD, without the pop): never switched
  mid-shot except as a designed build on its word.
- **A `lod` prop on the generators** (L): `lib/kit/Building.tsx` (2: frames, glazing bars, sills, cornice, door panels, 3
  tones; 1: plain window rects, 2 tones, one cornice band; 0: 3-6 facets + <= 3 marks), `Window.tsx`, `Town.tsx`,
  `Nature.tsx` (0: faceted 2-tone crowns, with feeling 3's lens), `Crowd.tsx` and `Person.tsx` (0: 2-tone silhouettes).
  Building still calls the v1 sketch helpers (`hatch`, `wallTicks`): the LOD pass moves it onto the clean pen for good.
- **`src/lib/patchwork.ts`** (new, M-L): fills a C mass (its layout polygon) with flat facets: a recursive guillotine
  (BSP) split snapped to the scene's grid (verticals, horizontals, `lib/persp.tsx`'s vanishing lines, 45-degree cuts),
  facet sides from the plane's distribution (near ~50 px, far ~75 px), clipped to the mass with polygon-clipping (npm,
  mfogel); natural masses (hills, crowns) as Delaunay facets (delaunator, Mapbox, ISC: https://github.com/mapbox/delaunator);
  fills from the plane's 4-7 palette fills, tone by orientation to the key, neighbours dL* 4-10, identity marks seeded
  every 3-6 facets; facets belong to their plane (they parallax with it) and never move or boil.
- **Texture** (rule 4's test): a plane factor 1.0 / 0.7 / 0.4 in its shader.

**3.5 Gates, cost, risk.** W1: the world bible names each tier's finish and which masses are patchwork (with their
palette subset). G3: the board draws every A at its real silhouette and part count and the C masses as grey patchwork
at the right facet size (G3 decides focus; the finish map is part of it). G4: the look clip shows the whole ladder in the
final style (one A at lod 2, B at 1, near and far patchwork); the owner runs the glance test beside a v2-style version;
check_finish's numbers in its report. G5: fills G3's plan at its finish levels (no finish promotion, as no tier
promotion). G6-G7: check_finish on the master sheets; the texture last. **Cost:** finish.ts S-M, kit lod L, patchwork.ts
M-L, check_finish M (the prototype exists). **Risks:** the patchwork reads as abstract collage, not city (identity marks
every 3-6 facets; the owner hasn't answered on it yet: §6); a contrasty near patchwork under the parallax float adds
motion energy outside A (rule 2: A >= 60 % of the motion; a moving near patchwork keeps local contrast <= 7); LOD seen
on a push-in (per-shot lod by largest size); A's 2 px features vanish on a phone (keep them in regular grids, which still
read as a fine texture when single bars don't).

## 4. What it would change in v2 (the baseline)
Tiers from `docs/v2/THROUGHLINE.md` §4; "before" from `baseline_v2_sheet.jpg` and the S1 numbers in §1.
- **S1 (the cover):** before: the glass door and W at the same finish as the café crate; the near quay (31 % of the
  frame) three flat planes (3.2 shapes / 10,000 px, local contrast 3.0). After: the door, its canopy letters and W at lod
  2 (frame profiles, glazing bars, 3 tones: she is ~0.3 % of the frame, too small to carry finish, so her objects do);
  the Google wing at lod 1 (plain rects, 2 tones); the far roofs as far patchwork (already close: 0.9 %, local contrast
  2.6); the quay as near patchwork (~50 px paving facets, dL* 4-10, a bollard, a drain, a mooring ring as marks); the
  café set at lod 1 (no plank stripes on the crate).
- **S2:** her dark window and the five staff windows at lod 2 (bars, 2-tone blind bands); the brick wing between them at
  lod 0 (3-4 brick-tone facets, not one even field); the towpath as near patchwork.
- **S3 and S4:** the moored narrowboat's rose panels are among the most worked objects in both frames while the boat is C:
  lod 1 (the roses as 2-3 flat shapes); her window (S3), the name tag and the fingerpost plates (S4) at lod 2; the backs
  at lod 1, the gasholders and viaduct as far patchwork.
- **S5 (the scale reveal):** the Pentagon at lod 2 against the city as pale far patchwork in its steps toward the sky
  (the hero huge yet far keeps its finish); the blossom crowns faceted (feeling 3).
- **S6, S7, S8 (the boards):** each board is A, and the big foreground furniture (S6's bench, S7's chair and table, S8's
  deck planks) is drawn at a finish close to it: lod 1 (2 tones, 3 slats instead of 6), the paving and decks as near
  patchwork instead of even stripes; the facades behind at lod 0-1.
- **Everywhere:** if the texture test keeps it, its plane factors; one ladder in every shot, so the brand reads.

## 5. What the owner didn't name that matters for this feeling
1. **The hero's size.** Finish needs room: each poster's main hero box covers 4-20 % of the frame (median 14 %); v2's S1
   subject is ~0.3 %. Below ~3 px a feature vanishes on a phone, so the crisp object is big where its finish is the point
   (or the camera pushes in): in a city film the landmark is the natural A.
2. **Fullness is shape count, not small features.** The patchwork has the hero's density of shapes; v2's flats have a
   quarter of it. "Low poly" removes features, never shapes.
3. **The hero leads by finish, not by muting the world** (posters: local contrast A 11.0, near C 9.7; v2: 12.1 vs 3.0).
   A world muted to a whisper reads unfinished.
4. **A gradient, not a cliff.** B is nearly as rich as A (8.4 %), and the hero's surroundings take a transition finish
   (Arcane sharpens where the characters touch the set).
5. **Regular detail reads crisp, random detail reads noisy:** the heroes' features repeat (grids, columns, balustrades).
6. **In motion** the ladder must survive the camera: lod fixed per shot, facets owned by their plane, no push-in onto C.
7. **The ladder is part of the brand** (ONE LOOK, ONE BRAND): the same finish rules in every video.

## 6. Clashes with the owner's earlier words, and open questions
**Clashes (flagged, not overruled):**
1. **The near world's contrast.** CRAFT §b (C local contrast <= 7, A >= 2x C) and DIRECTION rule 2 ("C, the
   environment: no outlines, low contrast"; `check_depth.py` WARNs over 7) against the posters' near patchwork (9.7
   [5.0-17.8]; A / C 1.1x). The playbook (owner rank): "supporting life (a bird, walkers, snow, steam) stays subtle
   (smaller, lower contrast, thinner or no lines, softer colour, calmer motion)"; "Supporting environment may be drawn in
   a softer, simpler style than the subject". The posters' C is simpler but not softer: its calm comes from having no
   small features and no motion. The cap stands until the owner says otherwise (question 2).
2. **Big flat areas.** CRAFT §c: "big areas flat ... texture only as flat same-hue shapes ... on 1-2 small surfaces per
   shot"; the patchwork cuts big areas into many flat facets (each flat, dL* 4-10). It is shape, not texture, but it
   changes what "big areas flat" means: the owner's call with question 1.
3. **A's outline** (DIRECTION rule 4) against the posters' outline-free crispness: already open with the owner (the A vs B
   picture, `img/AB_outlines.jpg`). The ladder works either way: without the outline, A's crispness is its silhouette's
   value step plus its regular small lines.

**Open questions for the owner:**
1. May the next G4 look clip try the posters' patchwork as our C (the near ground and far city in flat facets of the
   hero's colours), beside v2's flat version, to judge it at a glance and up close?
2. May a still near patchwork keep more contrast than our current cap (about 10 instead of 7), so the world reads full
   rather than muted, as long as it carries no small features and does not move?
3. In a city film, is the one landmark the crisp A (big in the frame, the most finished thing), with the person and Pip
   as B, or does the person stay A and the finish go to her objects (as v2's door and window)?
