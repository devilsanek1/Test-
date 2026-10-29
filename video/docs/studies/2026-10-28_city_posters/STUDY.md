# The city-poster study: what we learn, and what we try next (the synthesis)

*2026-10-29. The owner sent seven city posters (`video/docs/look/poster_refs/`, their words verbatim in its README),
asked how we learn from them (perspective, visual style, details, composition), how professionals get each of four
feelings, what they missed, and which content fits. This merges the twelve reports in this folder. A study, not a rule
change: DIRECTION and the playbook stand; the owner approves what becomes a rule. v2 ("One Small Window") is the
baseline the owner likes. One screen: `SUMMARY.md`; one picture: `img/SUMMARY_sheet.jpg`.*

## In short
1. **The premium gap is value and density, not hue.** v2's hues sit inside the posters' range on all 9 harmony measures
   (7 % of the measured gap); the gap is a missing lower half of the value range (L* p5 48 vs 23; under L* 40 on 1.9 %
   vs 13.8 % of the frame, in 41 pieces vs 259) and empty, evenly tinted fields below the sky (P4 §1). A grade closes 16 %.
2. **Depth is two value groups, a gap of air and one pale thing WAY out:** near ground to air spans 27-46 L* in the
   posters, 10-15 in v2 (P1); their nearest plane is L* 45 and busy, v2's L* 74 and open (PE).
3. **Finish is one style at two resolutions:** the "low poly" world keeps the hero's shape density (14.5 vs 15.3 shapes
   per 10,000 px) and drops only small features; v2's near quay has 3.2 (P2). v2 is not emptier, it is coarser (DE).
4. **Crispness is the shade step more than the line:** no outlines anywhere; every volume lit and shaded 21-37 L* apart
   (median 29; ours 7-12) (ST, AB).
5. **All the calm lives in the sky:** below the skyline the posters are 1-3 % calm, v2 19-31 % (CO).
6. **They fit 9:16 by extension:** a poster's title lands in our caption block in 7 of 7 (CO).
7. **Next:** one 7 s look clip of v2's canal bank (S1 and its cover frame), in two passes (§10).

## How to read this
- **Status** on every item: **[owner]** decided by the owner (the quote or rule named); **[open]** the owner's call (§9);
  **[proposal]** ours, to be seen in the next G4 look clip. Nothing [open] or [proposal] is decided.
- **Reports:** PE `perspective.md`, ST `style.md`, DE `details.md`, CO `composition.md` (the look lenses); P1-P4
  `pro_1_depth.md` ... `pro_4_colour.md` (pro practice per feeling); LA `layout.md`; AB `img/AB_outlines.md`; CM
  `content_market.md`, CF `content_fit.md`, CD `content_discussion.md`. Every number is theirs, "est." included.
- **Units:** px at 1080 x 1920 unless a poster's own; CIE L*, C*; dE76; k = the share of a flat step toward the air.
  **Gates:** W1 world bible, G3 grey animated sketchbook, G4 6-8 s look clip, G5 colour fill, G6 polish. **Cost** S/M/L.

## 1. Depth and scale (feeling 1)
*"some buildings are obviously closer to me, some further out and there is something WAY further out that gives me a
sense of scale"*

**1a. Near looks near: two value groups, a gap of air, a dark near frame.** [the range: owner, rule 6; the numbers:
proposal]
- *Posters:* L* < 65 on 27-48 % of the frame, L* >= 80 on 44-59 %, only 8-14 % between; a 19-36 L* jump from the hero's
  group to the far group across water or a hidden valley (P1 §1). Nearest plane L* 45, dE 45 from the air, edges 0.52,
  contrast 9.4; open ground 7 %; the bottom fifth 59 % near masses (PE). *v2:* nearest plane L* 74, dE 20, edges 0.13,
  contrast 2.8; open ground 25 % (S1 37 %); 21-47 % of the frame in between; S1's near treads lighter than its subject.
- *Pros:* Gurney's atmospheric ladder (each layer of air lightens by a fixed share: our PLANE_STEPS 0.12 / 0.23 / 0.40
  / 0.64 already are it; its next doubling, 0.87, is the posters' ghost planes, 0.89-0.92); Hiroshige's vertical *Views
  of Edo* (a huge near thing cut by the edges, a small far view); Wolfwalkers (depth only by value, hue, chroma) (P1 §2).
- *Technique* (P1 §3.1, PE L1): near group (planes -2, -1) median L* 45-60, cut by 1-2 edges, the biggest parts; hero
  group 50-68; the gap one flat field or hidden; far group >= 15 L* above the hero group at the air's C* ±4; a +5 ghost
  at k 0.87. Per frame: >= 30 L* from the near group to the air, L* < 65 on >= 25 %, 65-80 on <= 20 %, open ground <=
  15 %. Keep v2's hues, move values. In 9:16 the near frame goes where nothing is read: y > 1520 and the side edges.
- *Engine, check:* `lib/depth.ts` (the +5 step; `nearStep` with an absolute floor); `check_depth.py` VALUE and NEAR
  parts (WARN: nearest plane over L* 60, within 30 of the air, edges under 0.3, ground over 20 %). W1 declares the groups
  and the near frame, G3 decides values in grey, G4 in colour. *Cost* S-M. *Risk:* heavier than "very soft ... no
  screaming colours" (owner, 2026-10-25): darks only where the eye goes; few large near shapes, no outline.

**1b. Something WAY further out: one pale far anchor.** [proposal; every exterior set or the scale beat only: P1 Q2]
- *Posters:* in 6 of 7 one wide, simple, air-coloured shape on the horizon (Esja, Kyoto's ranges, ghost towers): C*
  within ~4 of the air, k 0.69-0.92, 0.07-0.6x the near contrast, overlapped at its base, off a side edge, a pale foot,
  tiny known things at its foot, no window anywhere in it (P1 §1.4). Cape Town's mid-valued, cool mountain is the
  variant when the anchor is the subject. *v2:* nothing WAY out in S1; S5's far group is a ~55 px strip and its sun disc
  sits dE 80 off its sky, the loudest far thing.
- *Pros:* Gurney's "Scale Tip" (large soft forms against tiny sharp details, the middle sizes skipped); Disney's
  multiplane (the far moon keeps its size while the near layers pass).
- *Technique* (P1 §3.2): top y >= 620, base on the horizon at y ~850-1050, >= 65 % of the width, 6-20 % of H; plane +4
  (k 0.64) with a +5 ghost (0.87); C* = the air's ±4 (never under 8 on our warm air); <= 3 values; a pale foot (its
  bottom 10-15 % one step paler, >= +5 L*); a nearer plane across its base; tiny things at 1/20-1/40 of its height; tier
  C, no line. Drawn new from the story's place. *Engine:* `anchorTones(air, plane)`; the depth sheet's `anchor` entry; a
  "far sticker" WARN. *Cost* M. *Risk:* one stock mountain per film reads as a template.

**1c. The hero huge yet far.** [proposal] Heroes take 21-45 % of the height, their base hidden in 5 of 7, drawn
1.4-3.6x the size the poster's own camera allows, paler than the near frame (PE §1.5). *Technique* (PE L3, on
CINEMATIC_GUIDE "Scale cues" 7): the base behind a band, a frontal elevation, the top in open sky at y >= 620, the
enlargement declared in W1 (`hero: true` in `sizeProblems`). *Cost* S.

**1d. The planes are the float's layers, moved by distance.** [the float: owner, rule 8; the constants: a code fix]
Frame-to-far scale ratios run 2.5-47x (median ~10): every move is mostly a near-frame move (PE L5). Each plane moves by
1/z, the law of its drawn size and of CineCamera: near 1, plane 0 0.6, +1 0.24, +2 0.10, +3 0.04, the anchor and sky 0
(P1 §3.4); a far landmark that is the subject moves by its measured scale, never its index (PE L5); pushes are dollies
(the anchor grows <= 1 % while the subject grows 6 %); the float stays within ±12 px. Today's `PARALLAX_K` (+1 0.45, +2
0.35: 1.9x and 3.6x their size; neighbours 1.2-1.4x apart where COZY_AND_SCALE §4 asks 1.8x) is recomputed and
`floatProblems` lints it. *Cost* S.

## 2. A hierarchy of finish: crisp heroes, a simpler world that still belongs (feeling 2)
*"more details and cleaner lines and just all around crispier ... the rest ... a bit more low poly but nonetheless
coherently fit into the style ... you can't immidetaly spot that something is off"*

**2a. The tiers change resolution, never style.** [tiers by story role: owner, rule 2; the finish ladder: proposal]
- *Posters* (P2 §1, 37 boxes): small features on A 6.9 % of its area, C near 1.8 %, C far 0.7 %; shapes per 10,000 px
  A 15.3, C near 14.5, C far 7.1; the same face size, the same 2.3-2.7 px edge, C's colours within CIEDE2000 ~4-6 of the
  hero's. *v2:* a hierarchy of contrast, not of finish (A's local contrast 12.1 vs the near ground's 3.0; the posters
  1.1x); one flat fill per face everywhere; the quay (31 % of S1) at 3.2 shapes: "a hero no richer in kind than a crate".
- *Pros:* Valve's TF2 (NPAR 2007, GDC 2008: one shading model, a read hierarchy); Pixar's *The Good Dinosaur* (a change
  of MODE jumps out, a change of LEVEL does not); Spider-Verse (lower a tier in the style's own vocabulary, no filter).
- *Technique* (P2 §3.1-3.2): A: small features 6-12 %, smallest 2 px in regular rhythms, 3 tones; B: 4-8 %; C near: <=
  2 %, smallest 8 px, 11-25 shapes per 10,000 px, 2 tones per mass, neighbour facets dL* 4-10; C far: <= 1 %, 12 px, 1-2
  tones pulled to the air. "Low poly" in SVG: <= 8 vertices per building outline, <= 10 facets per crown, straight edges,
  one fill per facet by its angle to the key, an identity mark every 3-6 facets. Every tier keeps the same edge, palette
  (CIEDE2000 <= 8), rig and texture; no blur, opacity or gradient on one tier.
- *Engine, gate, check:* `lib/finish.ts` (lod fixed per shot) S-M; a `lod` prop on `lib/kit` L; `lib/patchwork.ts`
  (§5.2). W1 names each tier's finish; G3 draws A at its real silhouette and C as grey patchwork; G4 runs the owner's
  glance test (a 2 s flick: nothing off; 10 s: name the crispest thing); `check_finish.py` (prototype
  `pro_2_hierarchy.py`): A >= 3x C near's small features and >= 5x C far's. *Cost* M. *Risk:* a collage, not a city.

**2b. The hero: big, loud, drawn as silhouette + one rhythm + light.** [A owns the contrast: owner, rule 2; size and
drawing: proposal]
- *Posters:* the biggest of 3-5 icons in 6 of 7 (median 2.4x the next; median 15 % of the frame), its ring 34-60 % open
  sky, yet the salience peak on it in only 2 of 7 (CO §2); drawn as the exact silhouette, ONE signature rhythm (the
  glass grid, the column steps) and lit and shade faces, half its edges quiet (DE §1.2). *v2:* the subject leads per
  pixel (x1.8-2.5) but covers 1.4-4.6 % of the frame and touches no sky (CO §7); 84 % of its edges are loud (median step
  38.8 vs the posters' 16.6 L*).
- *Technique* (CO L2, DE L2): in a place-led shot the landmark is A: >= 2x the next icon, ~8-15 % of the frame (est.),
  its top in open sky (>= 30 % of its ring), the salience peak on it (the near frame low in chroma). W1 names its rhythm;
  G3 draws it in grey; G4 renders it tone-on-tone (dL* 6-15, >= 2 px) with lit panes and shade sides loud. Who is A in a
  city film (the landmark, or the person with her objects) is each story's call (P2 Q3). *Check:* CRAFT §b's peak on A
  plus area and ring sky (`composition.py frame`). *Cost* S-M. *Risk:* crowding a figure-led beat: place-led shots only.

**2c. Fullness: load the ground, keep it quiet, size it for motion.** [proposal]
- *Posters vs v2* (DE): the same calm share (43 vs 43.5 % of tiles) and contrast (median edge step 14.5 vs 12.4 L*), but
  half the edges, a third of the thin features, 2.6x the half-empty tiles, and a third of v2's near ground empty (20 % of
  the frame; posters 0.9 %). Full almost without people (6 of 7): facades and 2-6 grouped objects of use (a bicycle,
  empty cafe chairs, boats). Under our float a 1 px line's core swings 55-66 % of its contrast, a 1 px window grid 65-79
  %; lines >= 2 px and ticks >= 4 x 6 px don't twinkle (DE §3).
- *Technique:* the near ground as facades, railings, boats, planters at C finish, never blank paving in a third of the
  frame; new detail at dL* 6-15 with a few loud accents; 2 px or quiet on anything that floats (twinkle x dL* <= ~2 L*);
  people stay for motion (rule 3), objects of use make the paused frame full. *Engine:* `lib/facade.ts` (bays x floors
  from 3-5 window types drawn per film) M; `cluster()`, `rhythmAlong()` S-M; a twinkle lint S. *Check:* `details.py
  measure` (WARN: half-empty tiles > 12 %, busy < 35 %, near-ground empty > 5 % of the frame). *Cost* M. *Risk:* busy.

## 3. Nature: real, yet faceted (feeling 3)
*"very subtle ... visually very interesting ... obviously very real, but if you look closely we combine the real
effects with the lower poly kind of effects"* [proposal, each piece an A/B in the G4 clip; kept: the falling leaves
("leafs are great") and the water ("Yeah this is better")]
- *Posters* (P3 §1): a realism ladder by distance: near framing nature species-true (silhouette roughness 1.31-3.19, 6+
  tones over 32-49 L*, mean L* 33-42), mid crowns lollipops split into a lit and a shade half, far ranges straight-edged
  polygons (Esja 47 % straight edge). The facets sit INSIDE organic shapes, along the light's turn (a leaf folded on its
  midrib, a crown's terminator: steps 6-13 L*); the real effects are the silhouette, a material in a facet (strata),
  soft air (a cloud's edge 7.5 px vs a building's 1.9), reflections. Nature holds the darks and the only curves, and
  frames the view in 6 of 7. *v2:* one mode: S1's nearest tree is five flat discs (4 tones over 19 L*, mean 71,
  contrast 3.0); S5's blossoms are evenly spread dots with whiskers past the silhouette.
- *Pros:* Takizawa, *Breath of the Wild* (GDC 2017: the size of the lie, small near, bigger far); Firewatch (23
  hand-made trees for ~4,600 placed, more stylised as they recede); Ghost of Tsushima (GDC 2021: one shared wind).
- *Technique* (P3 §3): near: the species' own leaves, roughness >= 1.3, 4 tones in 6-10 L* steps, mean L* 42-55,
  contrast <= 9; mid: 3-8 lit clusters, 3-4 tones, mean 45-60, <= 7; far: 4-8 facets per mass, >= 40 % straight edge,
  2-3 tones, <= 4. Each facet one tone from its angle to the key; a tree's tones ~36 / 45 / 53 / 61 / 70 L*; 2-4 species
  per film, drawn once by hand; greens h 154-171, never the olive 95-118. Calm wind: crowns ±0.5-1.0 deg at 0.12-0.25
  Hz, clusters ±1.5-3 px phased by x, far planes still, transforms only (est.). Soft air as 2-3 flat steps, never blur.
- *Engine, gate, check:* `lib/foliage.tsx` (from v2r's `crownD`, `dc/bloom.tsx`) M-L (est. 2-3 days for 4-6 species);
  `lib/wind.ts` S; `lib/facets.ts` (rocks, ranges) M; `lib/clouds.tsx` S-M. W1 names species and season (content); G3
  grey modes and sway timing; G4 one near and one mid tree; `check_nature.py` from `pro_3_nature.py`. *Cost* M-L.
  *Risk:* "procedural" trees, lockstep sway. Inside it, the owner's calls (P3 C1-C3; decision 3): material marks beyond
  CRAFT §c's 1-2 surfaces; cloud edges as flat steps; nature richer than tier C allows.

## 4. Colour: vibrant, coherent, premium, and why v2 reads "cheap and lazy" (feeling 4)
*"very vibrant and coherently fit together. I like the colors of our last video about Google, but our video still feels
cheap and lazy"* [keep v2's hues: owner; the full range: owner, rule 6; the plan and palette 10b: proposal]
- *Posters vs v2* (P4 §1, 38 metrics), the gap by family: **value 34 %** (L* p5 23 vs 48; under L* 40 13.8 vs 1.9 %, in
  259 pieces vs 41); **where colour lives 22 %** (pastel lights 5 vs 55 % of the frame; calm paper 16 vs 2.7 %; the
  posters' chroma peaks in the mids, C* 18.4 at L* 40-60 vs 7.9 in the lights); **empty fields 13 %** (15 % of v2's frame
  below the sky, 0 % in the posters); **colour count 12 %** (29 colours cover 90 % vs 14); **in-shape variation 11 %**
  (mottle 0.60 vs 0.24 L*); **hues 7 %** (v2 inside the posters' range: keep them). Vibrant is contrast, not chroma: a
  calm base (C* median 5-8 vs 13-14), stronger accents (C* p99 37-54 vs 30-42), saturation and darks as confetti (C* >=
  35 in 8-28 parts, only Kyoto's torii over 1.7 %, none in the top third in 6 of 7); the hero is the palest or most
  neutral mass in 5 of 7 (ST §1.1).
- *Why v2 reads cheap* (P4 §1): the world floats in the light half; a pastel tint on every light, so nothing rings; empty
  fields in the world (S1's paving 12 % of the frame, S4's canal bands 14 %, the deck 13-19 %, S8's floor a saturated
  field); one hex per role; fills flat to the code value: the default-vector look. A grade cuts the gap only 16 % (55.7
  -> 47.0): the dark pieces, the empty ground and the colour count are drawing.
- *Pros:* Gurney's gamut masking (*Color and Light*, 2010: choose the palette's shape first); Albers, *Interaction of
  Color* (1963: calm the lights before pushing an accent); Pixar's colour scripts (Eggleston: each shot inside its chunk).
- *Technique, by gain* (P4 §3): (1) **darks drawn in pieces** (~30-35 %, est.): L* p5 <= 32, under L* 40 on 6-10 % in >=
  120 pieces of >= 4 x 4 px across >= 9 of 16 grid cells: windows, doorways, eave undersides, shade under trees, hulls;
  never in the band or far. (2) **calm lights, colour in the mids** (~20-25 %): light fills (L* >= 86) C* 4-8, the cool
  field C* 9-11 (v2 13), pastel <= 25 %, mids (L* 45-75) kept at C* 18-32, accents C* >= 35 on 2-6 % in >= 25 parts, none
  over 1.5 %, none static in the top third, p90 / p50 >= 2.5. (3) **fill the grounds** (~15-20 %): no edge-free field over
  2 % below the sky. (4) **sibling tints** (~10 %): 3-5 per role, dE76 8-14 apart, so >= 20 colours cover 90 %. (5) **the
  mottle** (§5.1). A Canal Mint gamut mask (chroma peaking in the mids, olive held to C* 7) and one shade family. The
  palette **"10b Canal Mint, full range"**: every hue within 7 deg of v2's, only L* and C* move (sky C* 13 -> 10, stucco
  11 -> 6, lit paving 14.5 -> 7, water L* 77 -> 70 / 56, unlit panes 46 -> 33, a new eave shade).
- *Engine, check:* `colour_meter.py --profile poster` (from `pro_4_colour.py`) S-M; `lib/gamut.ts` (`siblings`,
  `inMask`, `calmLight`) S. W1's colour script states the dark share; G3 decides values; G4 shows 10b beside v2. *Cost*
  S-M. *Risk:* calm creams read greige on a phone (C* 8 at worst); whether they are still "the colours of the Google
  video" is the owner's eye (P4 Q2).

## 5. What you didn't name
**5.1 Texture.** [a VERY subtle test: owner, rule 4; the numbers: proposal] The posters carry a grain of 0.2-0.9 L*
(~2.5 px) and a coloured mottle of 0.4-0.7 L* in 40-70 px blotches on every fill; v2 is dead flat (ST §1.4). Through
H.264 at 60 fps (ST's test, v2 S1 panning): a world-locked mottle alone costs +27 % master bitrate, keeps 84-95 % on
the platform's rungs, `check_banding` PASS; with the subtlest posters' grain it costs +48 %, the grain halves at 720p
and starts to shimmer; screen-locked 6.2x the bitrate; re-seeded 14x and erased. *Pros:* Meier (SIGGRAPH 1996: texture
rides on the surface); Bénard et al. (2011: static, world-locked, low-frequency is the safe corner). *Technique* (P4
§3.4): mottle only, static, locked per parallax plane, std <= 0.5 L* in 30-70 px blotches, colour <= 0.35 a*b*; plane
factors 1.0 / 0.7 / 0.4 (A and B / near C / far C), the sky ~0.6 (est.); none in the caption band; no grain first;
applied after G6, the film works without it. *Engine:* `lib/texture.tsx` M; `check_banding.py` texture mode S. *Risk:*
shimmer; bitrate on floats and pans.

**5.2 The geometric patchwork.** [open: no answer yet; decision 3] Flat, hard-edged, ruler-straight blocks in the far
and mid city, the near ground, water and the sky's edges, never on the landmark; 3.5-7.5 % W (38-81 px), far 6-10 %;
steps shrink with distance (near dE 18-35, far 10-12, sky 1-5); translucent overlaps as third tones (ST §1.3). It is
feeling 2's "low poly", measured (P2), and a cheap depth device (pale blocks as ghost planes: P1 §5). *Technique* (ST
L4, P2 §3.4, PE §5): frontal facets on mid and far masses; on a ground only projected by `groundCam` so it recedes
(never level bands: the owner's "no distance effect nor perspective" at v2's G4); in the sky only as masses within dE 6 of the
air, never abstract rectangles; tones by angle to the key, neighbours dL* 4-10; blocks >= 8 px, locked to their plane,
nothing in y 290-600, never on the subject. *Engine:* `lib/patchwork.ts` (a guillotine split snapped to the scene's
lines; Delaunay facets for natural masses) M-L. *Gate:* W1 declares, G3 grey blocks, G4 beside v2's flat version.
*Risk:* edge noise in motion; a collage, not a city.

**5.3 Outlines, or light and shade.** [open: the owner has the A vs B picture; rule 4's lines stand; decision 1] No
poster draws an outline: an edge is a value step; thin dark lines (~0.9 px, L* 26-37) live only where the thing is a
line (ST §1.5). The A vs B (AB): A = v2's line (the subject's 3.0 px outline, a shade face 5-9 L* down), B = no outline,
every volume lit and shaded at a poster-like step (brick -18 L*, stucco -26). They differ little at panel size because
v2's outlines sit only on each beat's subject, and B goes flat without its shade faces: **the real choice is the shade
step as much as the line.** In our float the posters' ~1 px lines would twinkle (DE §3): lines stay >= 2 px. *Engine:*
the tier-A line as a per-film flag; `scripts/look/posters/ab_outlines/` renders both from one geometry. *Cost* S.

**5.4 Light on volumes.** [lit and shade faces: owner, rule 5; how deep: open, decision 1] Every poster volume is one
deep flat step, -21 to -37 L* (median -29; CRAFT §d.3 asks -7 to -12); round forms in 3-4 stepped bands; the shade cool
on whites, plum on warm walls, chroma kept; one key high and to the side; no cast shadow on the ground (we keep ours:
CRAFT §d.6) (ST §1.2). v2's S3 chimney: -5 L* (AB). *Technique* (ST L2): the subject's shade face -20 to -25 L* (§7); B
and C keep -7 to -12. *Engine:* `lib/light.tsx` `FormShade` per tier; a tier-A row in CRAFT §d.3; `check_light.py`'s A
step. *Cost* S-M. *Risk:* a turning object re-cuts its step each frame.

**5.5 The value range.** [owner, rule 6: "good point too!", the numbers from this study] Proposed for rule 6 (§1a,
§4): L* p5 <= 32; under L* 40 on 6-10 % in >= 120 pieces; L* < 65 on >= 25 %, 65-80 on <= 20 %; >= 30 L* from the near
group to the air; a >= 15 L* jump to the far group. Rule 6's "dark anchor (~5 %)" names the darks' hue, not their cap
(ST, P4). Nature is the cheapest start: v2's trees from L* 63-71 to ~45-60 cost no detail (P3 §5). Above ~5 %: decision 2.

**5.6 Layout and composition.** [the consolidated guide: `layout.md` Part A; the posters: its §8 Part B, every line
marked] The posters stack three bands: open sky 36-53 % (median 44), the city below with 73-90 % of the detail in the
lower half, all the calm in the sky (1-3 % calm below the skyline; v2 19-31 %), dark bottom corners (L* 44 / 53; v2 ~72
/ 74); diagonals don't aim at the hero, the sky does (CO §1). Extended (never cropped) into 9:16 the title lands in our
caption block in 7 of 7; the hero stays centred or on the left third, never under the rail (CO §4). Part B adds a
"poster frame" for the establishing view and the scale landing, the near frame, the quiet field measured, the far
anchor's zone, Pip's spot, off-centre VPs, the far landmark as a B carrier, one cover frame. *Check:* `composition.py
frame` -> `scripts/qa/check_composition.py` (M).

**5.7 The designed view.** [open: the owner finds it "fascinating"; decision 4] A stack of cameras (PE finding 1):
three posters are one camera each; Hanoi, Buenos Aires and Cape Town draw the near world from a low eye (0.67-0.80 of
the height) and lift the far city and its water onto a second horizon 0.14-0.27 higher, the junction hidden behind
trees, water or roofs, the far zone free of receding lines; heroes 1.4-3.6x one camera's size; 3-5 icons, one per
plane, sides alternating (CO §3). *Pros:* Hiroshige's framed far views; Guo Xi's three distances in one tall panorama
(P1 §2). *Technique* (PE L2, CO L5): one near camera per set and, only for a panorama, ONE declared far stage (in 9:16
y ~1090-1215 against a near eye at y 1380-1480) behind a hiding band with no receding line; the icons as a sequence,
one per beat. In motion both horizons hold; a truck along the junction is the one move that exposes it. *Engine:*
`lib/persp` `farStage({horizon})`; `stage: 'far'` in `sizeProblems`. W1 declares, G3 plays every move through the
layers. *Cost* M. *Risk:* a thin hiding band reads as a backdrop; it clashes with CRAFT §f.4-5's one camera per shot.

**5.8 The series and the brand.** [one look, one brand, still evolving: owner; covers as one series: owner (playbook
ONE LOOK); the template: proposal] The 19 posters read as one series because the frame repeats (the name at one height,
~44 % sky, one landmark touching it, a dark near frame) and the hero changes; their title is print-small, 5-10 px on a
360-px grid tile (CO §6). *Technique* (CO L6): one cover frame: the core line in the sky in our caption type (17-20 px
on the tile), the film's A big under it (~8-15 %, est.) with sky round its top, the near frame dark, inside the 4:5
crop y 285-1635; no second type voice before 3 place-led films (ST L7, CM §5.4). The ladders (finish, value, nature)
are the brand too. Refined film by film ("i don't think we can overfixate on this"). Open: the case, Pip on the cover.

**5.9 Pip, hidden.** [owner, 2026-10-28: "keep it, but not as obvious ... hide it deliberately"] In the busiest 60-px
spot of y 700-1480, x 140-760, >= 250 px from the hero, in the near patchwork (CO §4); ~40-90 px, <= 1 % of the frame,
never the sky, the band, the rail, a join or the subject's eye path (LA §1). The posters' fullness gives it places to
hide. W1 names the spots, G3 plans them. Open: a few spots or most shots, and the cover (decision 5).

**5.10 The sky and the sun.** [proposal; the sun: decision 6] The posters' skies are paper (cool blue-grey L* 85-87,
C* 4-6, or warm cream L* 93-94, C* 6-12), mostly lighter toward the horizon (up to +5.8 L*), no sunset band; v2's S1
sky has C* 13-14 (ST §1.6): a `lib/sky.tsx` paper preset (C* 8-10, +2 to +5 L* toward the horizon, the band flat to <=
1.5 L*), S. No poster has a sun disc; v2's S5 sun is the loudest far thing (P1 §4, P4 Q3).

## 6. The content track, in brief
The owner asked "which type of content would be best fit into videos where we have more of cities / architectures /
buildings", then steered it in the parallel thread: "Don't be fixated on tech or AI, all goes"; the views as
"storytelling that is around these views", yet not "completely made up content"; then "datacenters do fit pretty nice
in here ... we need some WOW stories" and "generalizing it to tech in the cities" (verbatim: CD; the playbook's "Places
on screen").
- **Our evidence** (CF): v1's city was the mechanism (82 % place-led frames; skip rate 32 %), v2's canal a stage for
  text boards, v3's place behind a product (5 %; skip 64.5 %); the gap sits in the first 2-3 s. Pick stories whose
  mechanism happens TO a place; place fit tests the story, not the set.
- **The market** (CM): place-led explainers are proven in long form (the B1M ~4M subscribers, Johnny Harris ~7.8M,
  est.); nothing shows the look carries short-form reach (Kurzgesagt ~25.3M on YouTube, ~1.9M on TikTok, est.): the
  opening does. Stories travel with a named place, a conflict and a consequence; the postcard is the trap. Judge the
  look on saves and shares (v1: 0.4 %, 0.7 %).
- **The live thread** (CD, 2026-10-29 ~03:15 UTC): a shortlist under "tech in the cities", in five kinds (hidden
  machines, waste turned into warmth, machines over the streets, giants being built, towns deciding); its top: London's
  hospital blood drones (8.4), Seaham's homes heated by flooded mines (8.1), Norway's ship tunnel, Venice's 78 sea gates
  (8.0 each); the owner's Stockholm bunker checked true. **Waiting on the owner's pick;** a pick gets one fact lock.
- **Pending:** the journal corpus (`journals/`: 1,209 recent stories from big publications, two scorers running, then
  an audit and clusters): directions with real examples, not a pick.
- **Specific local objects** (DE §1.5: a landmark, a house type, a plant, an object of use, a local sign) are content,
  not style (owner): a W1 practice for a story's home place.

## 7. Where the reports disagree, and how we resolve it
| Topic | What the reports say | We take | Why, or whose call |
|---|---|---|---|
| The subject's shade step | ST L2 -18 to -25; AB's B -18 (brick) / -26 (stucco); P4's 10b -24; posters -21 to -37 (median -29); CRAFT §d.3 -7 to -12 | tier A -20 to -25 L*; B and C keep -7 to -12 | the overlap of the three proposals; under the posters' median because our palettes are paler (CRAFT §d.3); a phone needs bolder steps than print (Gurney on Meissonier, P1 §5). Rule 5 says "gentle": the owner's call (decision 1) |
| The dark share | ST 6-15 %; P1 ~5-10 %; P4 6-10 % in >= 120 pieces; rule 6 "one tinted dark anchor (~5 %)" | 6-10 % under L* 40 in >= 120 pieces | the overlap of all three, P4 measured at phone scale; the owner's call (decision 2) |
| The darkest value | ST L* p5 <= ~30; P4 <= 32 | <= 32 | P4 measures at the phone scale the owner judges at |
| Chroma of the page and the mids | ST: page and mids at C* ~8-10; P4: light fills C* 4-8, the cool field 9-11, the mids kept at 18-32 | P4's split | the posters' chroma peaks in the mids (C* 18.4 at L* 40-60); ST's frame median is set by the lights |
| The float's constants | code `PARALLAX_K` 1 / 0.85 / 0.6 / 0.45 / 0.35 / 0.15 / 0.05; P1 1/z by plane (1 / 0.6 / 0.24 / 0.10 / 0.04 / 0); PE each plane's measured scale | 1/z from the shot's camera; P1's table when W1 declares no units | one law for size, CineCamera and COZY_AND_SCALE §4's 1.8x; PE's case is that law applied. A code-vs-doc bug: no owner call |
| Contrast caps | CRAFT §b tier C <= 7; posters' near frames 7.9-12 (PE), near patchwork 9.7, ~10 if still (P2), near nature <= 9 (P3); far: P2 <= 6, P3 <= 4, posters' backgrounds median 4.9 | near planes (-2, -1) <= 9 with no small features; mid C <= 7; far <= 5 (far nature <= 4) | the middle of the proposals; the float already moves the near ground most (rule 8). Above tier C's cap: the owner's call (decision 3) |
| The quiet field, measured | PE open ground <= 15 %; DE near-ground empty tiles <= 5 % of the frame, half-empty tiles <= 12 %; CO calm below the skyline <= 5 %; P2 no C region > 5 % under 8 shapes per 10,000 px; P4 no edge-free field > 2 % | one check: calm below the skyline <= 5 %, no edge-free field over 2 %; open ground <= 15 % as W1's planning number | four measures of one thing, agreeing on ~5 %; a cozy shot whose quiet field is the floor keeps LD's rule |
| Where the patchwork goes | ST L4: far, mid, the ground, the sky's edges; P2: the near ground and far; PE §5: never a level ground, at most far | §5.2: frontal on mid and far masses; on grounds only receding through `groundCam`; in the sky only as masses | keeps both lenses' evidence: PE objects to level bands, which the projection removes; ST itself rejects abstract sky rectangles |
| Texture amplitude | ST mottle <= 0.5-0.6 L*, 40-70 px, grain <= 0.25; P4 mottle <= 0.5, 30-70 px, grain none or <= 0.25; P2 1.5 / 1.1 / 0.7 std L* | mottle <= 0.5 L* in 30-70 px blotches, no grain first, P2's plane ratios 1.0 / 0.7 / 0.4 | ST's bitrate and shimmer test; P2's absolutes hold grain and JPEG |
| Texture in the caption band | ST Q1 asks about half strength (~0.3 L*); P4 none; rule 10 one calm flat field | none | rule 10 stands; no owner question needed |
| The hero: quiet or loud | the posters' hero is quiet in 5 of 7 (CO §2); rule 2: A owns the contrast | big AND loud | the owner's v3 note ("not sure what to keep my attention on"); a 2-4 s shot has no time for a tour |
| The cover title | ST L7: a constant label in tracked geometric caps (Jost, cap >= 32 px); CO §6: our caption type only; CM §5.4: name a series after 3 place-led films | caption type only now; a label after 3 place-led films | the owner's "few and big" words; one type voice |
| The vista's eye and sky | PE: near eye 0.72-0.77 H with a far stage 0.57-0.63 H; CO: sky ~45-58 % in the poster frame; CG: rooftop landings at 0.40 / 0.46 H, sky 30-40 % | both, by shot: the poster frame for a street-level establishing view; CG's rooftop for the scale move | two cameras, not one number; the owner sees one poster frame in the clip (decision 4) |
| The far anchor's value | P1: pale (k 0.64-0.87); PE §1.5 and CG cue 7: a dark far silhouette on a pale sky allowed | pale by default; dark only as the declared scale subject | 6 of 7 posters; Copenhagen's spire is the one exception |
| The hero's size | CO ~8-15 % of the 9:16 frame (est.); P2 ~15 % (the posters' box); PE 21-45 % of the height; LA Part A a subject 270-460 px wide | place-led: 8-15 % of the frame, >= 2x the next icon; figure-led: Part A's box | CO measured the posters extended into our frame; Part A's box is for people |

## 8. What not to take
- **The quiet hero and the tour** (the peak on the near frame or a second icon in 5 of 7; 3-5 icons at once): the split
  focus the owner rejected in v3; take the icons as a sequence (CO §9). **Three eye levels in one picture** (PE §5).
- **Patchwork as level floor bands; abstract rectangles in the sky** (PE §5, ST §4). **The crop to fill, the right-third
  hero, a steep sky in the band, a title in the film's frame, tiny letter-spaced caps on a cover** (CO §9).
- **The beige, olive and grey fields** (Copenhagen's olive sky, Kyoto's olive hills): "warm, not sick" (ST §4).
- **Grain at the posters' upper level, re-seeded or screen-locked texture:** 1.6-14x the bitrate, erased or shimmering
  (ST §1.4). **Sub-2 px work on anything that floats**, and window grids as line density (783-1734 strokes per Mpx vs
  our budget of 80) (DE §6, ST §4).
- **No contact shadows, greyed stone shadows, two light directions** (ST §4). **Foreground strangers** (retired: PE, DE).
- **Prop counts as targets, detail by depth as a line ladder, even detail as the lead** (DE §6); **blur, depth of
  field, opacity or a filter** to push a plane back or lower a tier (P1, P2).
- **A grade as the fix** (16 % of the gap) and **a saturated subject as "premium"** (5 of 7 heroes are the palest mass)
  (P4). **A poster frame for every shot** (cozy stays the home: CO §9). **A poster or a real skyline copied**; **local
  objects as a style rule** (the owner: content).

## 9. Decisions for the owner
1. **Edges (the A vs B picture):** (a) keep A: the subject's 3 px outline and today's gentle shade (-7 to -12 L*); (b)
   the outline plus a deeper shade face on the subject (-20 to -25); (c) B: no outlines, the deeper shade face makes the
   edge. *Ours:* (c) in the next look clip, beside (a).
2. **Darks:** (a) about 5 % of the frame dark, as rule 6's anchor now; (b) 6-10 % under L* 40 in many small pieces
   (windows, doorways, eaves, the shade under trees), the near world in mid-tones. *Ours:* (b), seen beside v2.
3. **The "low poly" world:** cut the near ground and the mid and far city into flat facets of the hero's colours, the
   still near world a little richer than today's cap (local contrast ~9 instead of 7; strata and veins on more
   surfaces): (a) yes, try it; (b) the far city only; (c) no. *Ours:* (a), never on the subject, never as rectangles
   in the sky.
4. **The designed view:** (a) an establishing view or the scale landing may lift its far city onto its own horizon
   behind water or trees (one far stage) and draw the landmark bigger than one camera allows; (b) one camera for
   everything, as CRAFT says now. *Ours:* (a), for those two frames only.
5. **Pip's hiding:** (a) a few planned spots per film; (b) a quiet "find Pip" in most exterior shots, none in closes and
   charts; and on the cover, hidden too or the one place it shows. *Ours:* (b), hidden on the cover too.
6. **The sun:** (a) keep v2's saturated disc as the pop; (b) one step off its sky, or behind a ridge, unless it is the
   shot's "look here", so the far stays the calmest part (no poster has a sun disc). *Ours:* (b).

## 10. The next step: one look experiment
**What:** a 7 s look clip of v2's home place, S1, the canal bank outside her office (0-6.1 s with v2's locked voice and
captions, then a 0.9 s locked hold), rebuilt in v2's hues at 60 fps, plus its cover frame (v2's 5.2 s) as the cover
test. Why S1: every lens wrote its "after" for it (PE §2, P1 §4, P2 §4, P3 §4, P4 §4); its gaps are the largest (open
ground 37 %, near treads lighter than the subject, the far city in a quarter of the width, a five-disc tree, 12 % empty
paving); it is the cover. One playable video, labelled, ~21 s: **v2's own S1**, then **pass 1, the owner-approved
lessons** (the near group in mid-tones with darks at ~5 %, a lit and a shade face on every volume at today's step, the
VERY subtle mottle switched on at 3.5 s, Pip hidden in one spot, the float by depth, rule 4's line), then **pass 2,
everything proposed** (B edges with the subject's shade at -20 to -25, darks 6-10 % in pieces, patchwork paving and far
city, a far stage with a pale ghost skyline and one landmark rising to y ~640-700 (P1 §4), one species tree in a calm
wind, a hero cumulus, 10b's calm lights). Each opens with frame 0 drawn in the clean pen as a bold event (rule 9), then
floats (the near frame ±12 px, the far stage and sky still), then holds. Beside it, one sheet of the 5.2 s frame in four
single-switch A/Bs (line, darks, patchwork, texture) from the same code. The owner: the glance test on the phone (a 2 s
flick, then 10 s), then decisions 1-6. v2 is shipped: the clip copies its S1 code, never edits it.

**Build order** (engine and tools are reused by every later film; each film still draws its own world):
| # | Piece | Report | Cost |
|---|---|---|---|
| 1 | The "before" row: the study's scripts on v2 S1 at 1.0, 3.0, 5.2 s (`pro_4_colour.py`, `check_depth.py`, `details.py measure`, `pro_2_hierarchy.py`, `composition.py frame`); no new code | all | S |
| 2 | `lib/depth.ts`: `PARALLAX_K` by 1/z, a +5 ghost step 0.87, `nearStep`'s floor, `anchorTones` | P1 §3.4-3.5, PE L5 | S |
| 3 | 10b's roles in a copy of v2r's palette; `lib/gamut.ts` `siblings` | P4 §3.3, §3.7 | S |
| 4 | `lib/light.tsx` `FormShade` per tier (reference: `ab_outlines/scene.py`, form 0.56) and the tier-A line as a flag | ST L2, AB | S-M |
| 5 | Darks drawn in pieces on the wing and the café: reveals, doorways, awning undersides | P4 §3.1, §4 | S-M |
| 6 | `lib/patchwork.ts`, lean: a guillotine split projected by `groundCam` (the paving), frontal blocks (the far city) | ST L4, P2 §3.4 | M |
| 7 | The far stage: `lib/persp` `farStage` and S1's ghost skyline with its landmark | PE L2, P1 §3.2 | M |
| 8 | One species tree (`lib/foliage.tsx` crown and leaf spray) and `lib/wind.ts` | P3 §3.1, N7 | M + S |
| 9 | A hero cumulus (`lib/clouds.tsx`) | P3 §3.4 | S-M |
| 10 | `lib/texture.tsx` (the mottle per plane) and `check_banding.py`'s texture mode | ST L3, P4 §3.4 | M + S |
| 11 | Render the three parts; QA: framecheck, capcheck, `check_depth` (VALUE, NEAR), `check_light`, `check_banding`, step 1's scripts again ("after"), the master's bitrate, a re-encode at the platform's rungs (1080p 3.5 Mbps, 720p 1.5 Mbps) checked for twinkle and the darks | DE §3, ST §1.4 | S-M |

L in all; the four M pieces (6, 7, 8, 10) carry it. If the week runs short, cut 9, then 8, then 7: pass 2 then shows
fewer proposals, never a half-built one. After the owner's verdict, promote what stays: `check_finish.py`,
`check_nature.py`, `check_composition.py`, `colour_meter --profile poster` (M each), `lib/finish.ts` with the kit's
`lod` (L) and `lib/facade.ts` (M). Timing is the owner's: finishing the videos in flight comes first (owner, 2026-10-27).
