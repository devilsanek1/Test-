# The city-poster study: what we learn, and what we try next (the synthesis)

*2026-10-29. The owner sent seven city posters (`video/docs/look/poster_refs/`, their words verbatim in its README) and
asked how we learn from them (perspective, visual style, details, composition), how professionals get each of four
feelings, what they missed, and which content fits. This merges the twelve reports in this folder. A study, not a rule
change: DIRECTION and the playbook stand; the owner approves what becomes a rule. v2 ("One Small Window") is the
baseline the owner likes. The one-screen version: `SUMMARY.md`; the phone picture: `img/SUMMARY_sheet.jpg`.*

## In short
1. **The premium gap is value and density, not hue.** v2's hues sit inside the posters' range on all 9 harmony measures
   (7 % of the measured gap); the gap is a missing lower half of the value range (L* p5 48 vs 23; under L* 40 on 1.9 %
   vs 13.8 % of the frame, in 41 pieces vs 259) and empty, evenly tinted fields below the sky (P4 §1). A grade closes
   16 % of it: the rest is drawing.
2. **Depth is two value groups, a gap of air and one pale thing WAY out.** The posters span 27-46 L* from the near
   ground to the air, v2 10-15 (P1); their nearest plane is L* 45 and busy, v2's L* 74 and open (PE).
3. **Finish is one style at two resolutions.** The "low poly" world keeps the hero's shape density (14.5 vs 15.3 shapes
   per 10,000 px) and drops only small features; v2's near quay has 3.2 (P2). v2 is not emptier than the posters, it
   is coarser (DE).
4. **Crispness is the shade step more than the line.** The posters draw no outlines; every volume is lit and shaded
   21-37 L* apart (median 29; ours 7-12) (ST; the A vs B picture).
5. **All the calm lives in the sky.** Below the skyline the posters are 1-3 % calm, v2 19-31 % (CO).
6. **They fit 9:16 by extension:** a poster's title lands in our caption block in 7 of 7 (CO).
7. **Next:** one 7 s look clip of v2's canal bank (S1 and its cover frame) in two passes: the owner-approved lessons
   only, then all of them (§10).

## How to read this
- **Status** on every item: **[owner]** the owner already decided (the quote or rule named); **[open]** the owner's
  call (§9); **[proposal]** ours, to be seen in the next G4 look clip. Nothing [open] or [proposal] is decided.
- **Reports:** PE `perspective.md`, ST `style.md`, DE `details.md`, CO `composition.md` (the four look lenses); P1-P4
  `pro_1_depth.md` ... `pro_4_colour.md` (pro practice for the four feelings); LA `layout.md` (Part A every earlier
  layout rule, Part B the posters' changes); AB `img/AB_outlines.md`; CM `content_market.md`, CF `content_fit.md`, CD
  `content_discussion.md`. Every number below is theirs; "est." is theirs too.
- **Units:** px at 1080 x 1920 unless a poster's own px; L*, C* CIE Lab; dE76; "k" = the share of a flat step toward
  the air. **Gates:** W1 the world bible (text, with G2), G3 the animated sketchbook (grey), G4 the 6-8 s look clip,
  G5 colour fill, G6 polish. **Cost** S/M/L as the reports give it.

## 1. Depth and scale (feeling 1)
*"some buildings are obviously closer to me, some further out and there is something WAY further out that gives me a
sense of scale"*

**1a. Near looks near: two value groups, a gap of air, a dark near frame.** [the full range: owner, rule 6; the
numbers: proposal]
- *Posters:* L* < 65 on 27-48 % of the frame, L* >= 80 on 44-59 %, only 8-14 % between; near ground to air 27-46 L*;
  a 19-36 L* jump between the hero's group and the far group, the distance between them water or hidden (P1 §1). The
  nearest plane L* 45, dE 45 from the air, edges 0.52, local contrast 9.4; open ground 7 %; the bottom fifth 59 % near
  masses (PE §1.3-1.4). *v2:* the whole ladder 10-15 L*, 21-47 % in between; nearest plane L* 74, dE 20, edges 0.13,
  contrast 2.8; open ground 25 % (S1 37 %); S1's near treads are lighter than its subject (PE §2, P1 §4).
- *Pros:* Gurney's atmospheric ladder (each layer of air lightens by a fixed share: our PLANE_STEPS 0.12 / 0.23 / 0.40
  / 0.64 already are it, and its next doubling, 0.87, is the posters' ghost planes, 0.89-0.92); Hiroshige's *One Hundred
  Famous Views of Edo* (vertical prints: a huge near thing cut by the edges, a small far view); Wolfwalkers (depth only
  by value, hue and chroma steps between flat layers) (P1 §2).
- *Technique* (P1 §3.1, PE L1): near group (planes -2, -1) median L* 45-60, cut by 1-2 edges, the biggest parts and
  the frame's highest chroma; hero group (0, +1) 50-68; the gap one flat field (water, a haze strip) or hidden; far group
  >= 15 L* above the hero group, C* at the air's ±4; a ghost +5 at k 0.87. Per frame: >= 30 L* from the near group to the
  air, L* < 65 on >= 25 %, 65-80 on <= 20 %, open ground <= 15 %. Keep v2's hues, move values. In 9:16 the near frame
  goes where nothing is read: y > 1520 and the side edges.
- *Engine, gate, check:* `lib/depth.ts` (a +5 step 0.87; `nearStep` with an absolute floor); `check_depth.py` VALUE and
  NEAR parts (WARN: nearest plane over L* 60, within 30 of the air, edges under 0.3, ground over 20 %). W1 declares
  the groups and the near frame per exterior set; G3 decides values in grey; G4 in colour. *Cost* S-M. *Risk:* heavier
  than "very soft ... no screaming colours" (owner, 2026-10-25): darks only where the eye goes; the frame never
  outweighs the subject (few large shapes, no outline).

**1b. Something WAY further out: one pale far anchor.** [proposal; every exterior set or the scale beat only: P1 Q2]
- *Posters:* in 6 of 7 one wide, simple, air-coloured shape on the horizon (Esja, Kyoto's ranges, Hanoi's far towers,
  Singapore's ghost slabs): C* within ~4 of the air, k 0.69-0.92, 0.07-0.6x the near contrast, overlapped at its base,
  leaving the frame at a side, a pale foot (Reykjavik's 16 px mist line), tiny known things at its foot, no window or
  storey anywhere in it (P1 §1.4, PE §1.3). Cape Town's mountain stays mid-valued and recedes by a cool hue: the variant
  when the anchor is the subject. No sun disc in any poster. *v2:* S1's far city fills the left quarter, nothing WAY
  out; S5's far group is a ~55 px strip and its sun disc sits dE 80 from its sky, the loudest thing in the upper frame.
- *Pros:* Gurney's "Scale Tip" (large soft forms against tiny sharp details, the middle sizes skipped); Disney's
  multiplane (1937: the far moon keeps its size while the near layers pass); Hokusai's small, unmistakable Fuji.
- *Technique* (P1 §3.2): top y >= 620, base on the horizon at y ~850-1050, >= 65 % of the width, off >= 1 side, 6-20 %
  of H; plane +4 (k 0.64) with a +5 ghost (k 0.87); C* = the air's ±4 (never under C* 8 on our warm air); <= 3 values,
  range <= 0.4x the near group's; a pale foot (its bottom 10-15 % one step paler, >= +5 L*); a nearer plane across its
  base; tiny things at 1/20-1/40 of its height; tier C, no line; nothing far louder than the subject. Drawn new from the
  story's place (a ridge, a sea horizon, a far skyline with one landmark, gasholders).
- *Engine, check:* `lib/depth.ts` `anchorTones(air, plane)`; the depth sheet's `anchor` entry; a "far sticker" WARN.
  W1 names it, G3 draws its silhouette. *Cost* M. *Risk:* one stock mountain in every film reads as a template.

**1c. The hero huge yet far.** [proposal] Heroes take 21-45 % of the poster's height, their base hidden in 5 of 7,
drawn 1.4-3.6x the size the poster's own camera allows, paler than the frame (the Obelisco dE 16 to the air; the near
frames 34-65), 10 px cars under a 685 px obelisk (PE §1.5). *Technique* (PE L3, on CINEMATIC_GUIDE "Scale cues" 7): the
base behind a band, never on a visible ground line; a frontal elevation; the top in open sky at y >= 620; the
enlargement declared in W1 and exempted in `sizeProblems` (`hero: true`). A dark far silhouette (Copenhagen's spire,
L* 33) stays the declared exception. *Cost* S. *Risk:* low.

**1d. The planes are the float's layers, moved by distance.** [the parallax float: owner, rule 8; the constants: a
code fix, no owner call] Per metre the mid planes are 0.35 of the near frame's scale, the farthest unit 0.12, the
background ~0; frame-to-far ratios 2.5-47x (median ~10): every move is mostly a near-frame move (PE App. B, L5).
*Technique:* each plane moves by 1/z, the law of its drawn size and of CineCamera: near 1, plane 0 0.6, +1 0.24, +2
0.10, +3 0.04, the anchor, ghost and sky 0 (P1 §3.4); a far landmark that is the subject moves by its measured scale,
never its index (PE L5); pushes are dollies (the anchor grows <= 1 % while the subject plane grows 6 %: Disney's moon);
the float stays small (±12 px). *Engine:* `lib/depth.ts` `PARALLAX_K` (today 0.45 / 0.35 for +1 / +2: 1.9x and 3.6x
their size; neighbours 1.2-1.4x apart where COZY_AND_SCALE §4 asks >= 1.8x) from `planeLod(p).scale`; `floatProblems`
lints the 1.8x. G5, G6. *Cost* S.

## 2. A hierarchy of finish: crisp heroes, a simpler world that still belongs (feeling 2)
*"more details and cleaner lines and just all around crispier ... the rest ... less detailed, a bit more low poly but
nonetheless coherently fit into the style ... you can't immidetaly spot that something is off"*

**2a. The tiers change resolution, never style.** [tiers by story role: owner, rule 2; the finish ladder: proposal]
- *Posters* (P2 §1, 37 boxes): small features on A 6.9 % of its area, C near 1.8 %, C far 0.7 % (3.8x, 10x); shapes
  per 10,000 px A 15.3, C near 14.5, C far 7.1; the same face size (49 px), the same edge (2.3-2.7 px, nothing blurred)
  and C's colours within CIEDE2000 ~4-6 of the hero's. The patchwork is the "low poly" layer, and it is FULL.
  *v2:* a hierarchy of contrast and amount, not of finish: A's local contrast 12.1 against the near ground's 3.0 (the
  posters 1.1x); one flat fill per face everywhere; the near quay (31 % of S1) at 3.2 shapes per 10,000 px; detail in a
  few clusters with dead flats between: "a hero no richer in kind than a crate".
- *Pros:* Valve's TF2 (NPAR 2007; GDC 2008: a read hierarchy inside one shading model); Spider-Verse (lower a tier in
  the style's own vocabulary, never a filter); Santella and DeCarlo (NPAR 2004: locally kept detail draws the gaze);
  Pixar's *The Good Dinosaur* (a change of MODE jumps out, a change of LEVEL does not); Charley Harper (count the wings,
  not the feathers).
- *Technique* (P2 §3.1-3.2): A: small features 6-12 %, smallest 2 px in regular rhythms, 3 tones; B: 4-8 %; C near:
  <= 2 %, smallest 8 px, 11-25 shapes per 10,000 px (the hero's density), 2 tones per mass, neighbour facets dL* 4-10;
  C far: <= 1 %, 12 px, 1-2 tones pulled to the air. "Low poly" in SVG: <= 8 vertices per building outline, <= 10 facets
  per crown, straight edges, each facet one fill by its angle to the key, an identity mark (a window pair, a lamppost)
  every 3-6 facets. The guard: same edge, same palette (CIEDE2000 <= 8), same rig, same texture on every tier; no blur,
  opacity or gradient on one tier.
- *Engine:* `src/lib/finish.ts` (FINISH[tier][plane], lod fixed per shot) S-M; a `lod` prop on `lib/kit` L;
  `lib/patchwork.ts` (§5.2). *Gate, check:* W1 names each tier's finish; G3 draws A at its real silhouette and part count
  and C as grey patchwork; G4 runs the owner's glance test (flick past in ~2 s: nothing off; look 10 s: name the
  crispest thing); G5 adds no finish; `scripts/qa/check_finish.py` (prototype `pro_2_hierarchy.py`): A >= 3x C near's
  small features, >= 5x C far's, no C region over 5 % of the frame under 8 shapes per 10,000 px. *Cost* M. *Risk:* a
  collage instead of a city (identity marks); a contrasty near patchwork moving in the float (<= 7 when it moves).

**2b. The hero: big, loud, and drawn as silhouette + one rhythm + light.** [A owns the contrast: owner, rule 2; size
and drawing: proposal]
- *Posters:* the biggest of 3-5 icons in 6 of 7 (1.4-3.5x the next, median 2.4x; median 15 % of the frame), its ring
  34-60 % open sky, yet the salience peak sits on it in only 2 of 7 (CO §2). Drawn as the exact silhouette, ONE signature
  rhythm drawn in full (the glass grid, the column steps, the tile rows) and a lit and a shade face on every plane: 46 %
  thin-feature cover, half its edges quiet (DE §1.2); the Obelisco proves a unique shape needs nothing else. *v2:* the
  subject leads per pixel (x1.8-2.5) but covers 1.4-4.6 % of the frame and touches no sky (CO §7); its edges 84 % loud
  (median step 38.8 L* vs 16.6): an outline plus a few strong lines, no quiet rhythm inside (DE §2).
- *Technique* (CO L2, DE L2): in a place-led shot the landmark is A: >= 2x the next icon, ~8-15 % of the frame (est.),
  its top in open sky (>= 30 % of its ring), and it owns the salience peak (the near frame stays low in chroma). W1
  names A's rhythm (count, pitch); G3 draws silhouette and rhythm in grey; G4 renders the rhythm tone-on-tone (dL* 6-15,
  >= 2 px), the lit panes and shade sides loud. Who is A in a city film (the landmark, or the person with her objects at
  A finish) is each story's call in W1 (P2 Q3). *Check:* CRAFT §b's peak on A + A's area and ring sky (`composition.py
  frame`). *Cost* S-M. *Risk:* a big hero crowds a figure-led beat: place-led shots only.

**2c. Fullness: load the ground, keep it quiet, size it for motion.** [proposal]
- *Posters vs v2* (DE §0-3): the same share of calm tiles (43 vs 43.5 %) and contrast (median edge step 14.5 vs 12.4
  L*), but half the edges, a third of the thin features, 2.6x the half-empty "structure" tiles (22 vs 8.5 %) and a third
  of v2's near ground empty (20 % of the frame; posters 0.9 %). Reference 1's fullness at a quarter of its contrast. Full
  almost without people (6 of 7 show none): facades, 2-6 grouped objects of use (a parked bicycle, empty cafe chairs,
  boats, lanterns). In our float a 1 px line's core swings 55-66 % of its contrast (the renderer, before any codec), a
  1 px window grid 65-79 %; lines >= 2 px and ticks >= 4 x 6 px don't twinkle.
- *Technique:* W1 and G3 plan the near ground as facades, railings, boats and planters at C finish, never blank paving
  in a third of the frame; new detail at dL* 6-15, a few loud accents; 2 px or quiet on anything that floats (never a
  1 px grid; twinkle x dL* <= ~2 L*); people stay for motion (rule 3), the paused frame's fullness comes from
  architecture and objects of use. *Engine:* `lib/facade.ts` (bays x floors from 3-5 window types drawn per film) M;
  `cluster()`, `rhythmAlong()` S-M; a twinkle lint S. *Check:* `details.py measure` (WARN: structure tiles > 12 %, busy
  < 35 %, near-ground empty tiles > 5 % of the frame). *Cost* M. *Risk:* busy; render time (est.).

## 3. Nature: real, yet faceted (feeling 3)
*"very subtle ... visually very interesting ... obviously very real, but if you look closely we combine the real
effects with the lower poly kind of effects"* [proposal, piece by piece as A/Bs in the G4 clip; kept as approved: the
falling leaves ("leafs are great") and the water ("Yeah this is better")]
- *Posters* (P3 §1): a realism ladder by distance: near framing nature is species-true (silhouette roughness 1.31-3.19,
  6+ tones over 32-49 L*, dark: mean L* 33-42), mid crowns are lollipops split into a lit and a shade half, far ranges are
  straight-edged polygons (Esja 47 % straight edge; Kyoto 4 tones in ~5 L* steps). The facets sit INSIDE organic shapes,
  along the light's turn (a leaf folded on its midrib, a crown's terminator, a rock's ridge: steps 6-13 L*); the real
  effects are the silhouette, a material inside a facet (strata, stone), soft air (the tablecloth cloud's edge 7.5 px vs
  a building's 1.9), reflections. Nature holds the darks and the only curves against the ruled city, and frames the
  bottom or a side in 6 of 7. *v2:* one mode: S1's nearest tree is five flat discs and two floating ellipses (4 tones
  over 19 L*, mean 71, contrast 3.0); S5's blossoms are dots spread evenly with whiskers past the silhouette.
- *Pros:* Takizawa, *Breath of the Wild* (GDC 2017: the size of the lie, small near, bigger far); Firewatch (23
  hand-made trees for ~4,600 placed, more stylised as they recede); Mary Blair's lollipops; Gurney and Carlson (values by
  angle: sky > ground > slants > crowns); Wolfwalkers (a curved forest against an angular town); Crysis (GPU Gems 3) and
  Ghost of Tsushima (GDC 2021): one shared wind, a sway hierarchy.
- *Technique* (P3 §3): near: the species' own leaves, roughness >= 1.3, 4 tones in 6-10 L* steps, mean L* 42-55, local
  contrast <= 9; mid: 3-8 lit clusters, 3-4 tones, mean 45-60, <= 7; far: 4-8 facets per mass, >= 40 % straight edge,
  2-3 tones in 4-6 L* steps, <= 4. Each facet one tone from its angle to the key; each crown lit within 45 deg of the
  key; a tree's tones ~36 / 45 / 53 / 61 / 70 L*; 2-4 species per film, drawn once by hand and reused; greens h 154-171,
  never the olive 95-118. Calm wind: crowns ±0.5-1.0 deg at 0.12-0.25 Hz, clusters ±1.5-3 px phased by x, near leaves
  ±1-2 px, far planes still, transforms only (est., tuned in G4). Soft air as 2-3 flat steps of 3-4 px, never blur.
- *Engine:* `lib/foliage.tsx` (crowns, leaf sprays, flowers, blossoms; from v2r's `crownD` and `dc/bloom.tsx`) M-L
  (est. 2-3 days for 4-6 species); `lib/wind.ts` S; `lib/facets.ts` (rocks, ranges, strata) M; `lib/clouds.tsx` (a hero
  cumulus: lit top, belly step) S-M. *Gate, check:* W1 names species and season (content); G3 grey modes, cluster counts
  and sway timing; G4 one near and one mid tree; `check_nature.py` from `pro_3_nature.py`. *Cost* M-L. *Risk:*
  "procedural" trees (each species drawn by hand); lockstep sway; a loud near plane.
- *Owner calls inside it* (P3 C1-C3, decision 3): same-hue marks (strata, veins) beyond CRAFT §c's 1-2 surfaces; cloud
  edges as flat steps; near and mid nature richer than tier C allows today.

## 4. Colour: vibrant, coherent, premium, and why v2 reads "cheap and lazy" (feeling 4)
*"very vibrant and coherently fit together. I like the colors of our last video about Google, but our video still feels
cheap and lazy"* [keep v2's hues: owner; the full range: owner, rule 6; the plan and palette 10b: proposal]
- *Posters vs v2* (P4 §1, 38 metrics; ST §1.1), the gap by family: **value 34 %** (L* p5 23 vs 48; under L* 40 13.8 %
  vs 1.9 %, in 259 pieces vs 41); **where colour lives 22 %** (pastel lights, L* >= 75 at C* >= 10: 5 % vs 55 % of the
  frame; calm paper 16 % vs 2.7 %; the posters' chroma peaks in the mids, C* 18.4 at L* 40-60 vs 7.9 in the lights);
  **empty fields 13 %** (15 % of v2's frame below the sky, 0 % in the posters); **colour count 12 %** (29 colours cover
  90 % vs 14); **in-shape variation 11 %** (mottle 0.60 vs 0.24 L*); **hue harmony 7 %** (v2 inside the posters' range on
  all 9 measures: keep the hues). Vibrant is contrast, not more chroma: base C* median 5-8 (v2 13-14), accents stronger
  (C* p99 37-54 vs 30-42), saturation and darks as confetti (C* >= 35 in 8-28 parts, none over 1.7 %, never in the top
  third in 6 of 7); the hero is the palest or most neutral mass in 5 of 7 (ST §1.1).
- *Why v2 reads cheap* (P4 §1): the world floats in the light half (bottom quarter L* 74-78); a pastel tint on every
  light, so nothing rings; empty fields in the world (S1's paving 12 % of the frame, S4's canal bands 14 %, S6-S7's deck
  13-19 %, S8's floor a saturated field at C* 32); one hex per role; fills flat to the code value. Even tint and even
  simplicity everywhere: the default-vector look. A grade on the cover frame moves 26 of 38 metrics into range but cuts
  the gap only 16 % (55.7 -> 47.0): the dark pieces (64 -> 62; posters 215+), the empty ground and the colour count are
  drawing.
- *Pros:* Gurney's gamut masking (*Color and Light*, 2010; the blog, 2011: choose the palette's shape first); Pixar's
  colour scripts (Eggleston: each shot painted inside its chunk of the script); Albers, *Interaction of Color* (1963: a
  colour is read against its neighbours, so calm the lights before pushing an accent); Mary Blair (flat is not cheap when
  the colour design is deliberate); Cohen-Or et al., "Color Harmonization" (SIGGRAPH 2006: harmony is measurable).
- *Technique, in the order of the gain* (P4 §3.1-3.7): (1) **darks drawn in pieces** (gain ~30-35 %, est.): L* p5 <= 32,
  under L* 40 on 6-10 % in >= 120 pieces of >= 4 x 4 px, in >= 9 of 16 grid cells: windows and reveals, doorways, eave
  and awning undersides, shade under trees, hulls, coats; never in the band or the far planes. (2) **calm lights, colour
  in the mids** (~20-25 %): light fills (L* >= 86) at C* 4-8, the one cool field C* 9-11 (v2 13), pastel <= 25 %, the mids
  (L* 45-75) kept at C* 18-32, C*-weighted mean L* <= 68, accents C* >= 35 on 2-6 % in >= 25 parts, none over 1.5 %, none
  static in the top third, p90 / p50 >= 2.5. (3) **fill the grounds** (~15-20 %): no edge-free field over 2 % below the
  sky. (4) **sibling tints** (~10 %): 3-5 per role (hue ±8 deg, L* ±4-10, C* ±3-6, dE76 8-14 apart) so >= 20 colours
  cover 90 %. (5) **the VERY subtle mottle** (~5-10 %, §5.1). Harmony: a Canal Mint gamut mask (three lobes, chroma
  peaking in the mids, olive held to C* 7) and one shade family. The palette **"10b Canal Mint, full range"**: every hue
  within 7 deg of v2's, only L* and C* move (sky C* 13 -> 10, stucco 11 -> 6, lit paving 14.5 -> 7, water L* 77 -> 70 /
  56, unlit panes 46 -> 33, sage 77 -> 66, a new eave shade). ST's Poster Harbour and Lantern Paper stay options for a
  new place film.
- *Engine, gate, check:* `colour_meter.py --profile poster` (port of `pro_4_colour.py`) S-M; `src/lib/gamut.ts`
  (`envelope`, `inMask`, `calmLight`, `siblings`) S. W1's colour script states the dark share and the page chroma; G3
  decides values in grey; G4 shows 10b beside v2. *Cost* S-M. *Risk:* heavier than "very soft" (2026-10-25); calm creams
  read greige on a phone (C* 8 at worst); tints under dE 6 apart read as mistakes. Whether cream-paper lights are still
  "the colours of the Google video" is the owner's eye (P4 Q2).

## 5. What you didn't name
**5.1 Texture.** [a VERY subtle test: owner, rule 4 ("start playing with it, very subtly"); the numbers: proposal]
Posters: a grain of 0.2-0.9 L* (~2.5 px; Buenos Aires and Kyoto the subtlest, 0.21-0.24) and a coloured mottle of
0.4-0.7 L* in 40-70 px blotches, on sky and fills alike (ST §1.4); v2 is dead flat. Through H.264 at 60 fps (ST's
encode test, v2 S1 panning): a world-locked mottle alone costs +27 % master bitrate, keeps 84-95 % after the
platform's 1080p and 720p rungs, frame-to-frame dL* 0.069 (none 0.048), `check_banding` PASS; adding the subtlest
posters' grain: +48 %, the grain halves at 720p, shimmer starts, WARN; screen-locked 6.2x the bitrate, re-seeded 14x
and erased. *Pros:* Meier (SIGGRAPH 1996: texture rides on the surface); Bénard et al. (2010, 2011: static,
world-locked, low-frequency is the safe corner); Netflix's AV1 grain synthesis (fine grain is the costliest layer).
*Technique* (P4 §3.4): mottle only, static, locked per parallax plane, std <= 0.5 L* in 30-70 px blotches, colour <=
0.35 a*b*; plane factors A and B 1.0, near C 0.7, far C 0.4, the sky ~0.6 (est.); none in the caption band; no grain in
the first test; applied last (after G6), the film works without it. *Engine:* `src/lib/texture.tsx` (a seeded tileable
mottle per plane) M; `check_banding.py` texture mode S. *Check:* a hold's frame-to-frame dL* <= 0.08. *Risk:* shimmer;
bitrate on floats and pans.

**5.2 The geometric patchwork.** [open: no answer yet; decision 3] Posters (ST §1.3): flat, hard-edged, ruler-straight
blocks in the far and mid city, the near ground, water and the sky's edges, never on the landmark; 3.5-7.5 % W (38-81
px), far planes 6-10 %; steps shrink with distance (near dE 18-35, far 10-12, sky planes 1-5); no outlines; translucent
overlaps as third tones. It is feeling 2's "low poly" measured (the hero's shape density without its small features:
P2) and a cheap depth device (pale overlapping blocks as ghost planes: P1 §5). *Technique* (ST L4, P2 §3.4, PE §5):
frontal facets on mid and far masses; on a ground only projected by `groundCam`, so they recede (never level bands seen
edge to edge: the "elevation" look the owner rejected in v2's G4); in the sky only as masses (mountains, ghost blocks
within dE 6 of the air), never abstract rectangles; tones by angle to the key, neighbours dL* 4-10 near, ~10 far;
blocks >= 8 px, whole-pixel edges, locked to their plane, nothing in y 290-600, never on the subject. *Engine:*
`src/lib/patchwork.ts` (a guillotine split snapped to the scene's verticals, level lines, vanishing lines and 45-degree
cuts; Delaunay facets for natural masses) M-L. *Gate:* W1 declares, G3 grey blocks, G4 beside v2's flat version.
*Risk:* edge noise in motion; a collage, not a city.

**5.3 Outlines, or light and shade.** [open: the owner has the A vs B picture; rule 4's lines stand; decision 1] The
posters draw no outline anywhere: an edge is a value step, and thin dark lines (~0.9 px at L* 26-37) live only where
the thing is a line (mullions, railings, rigging) (ST §1.5). The A vs B (AB): one v2 scene drawn twice: A = v2's line
(tier A's 3.0 px outline, a shade face 5-9 L* down), B = no outline, every volume lit and shaded at a poster-like step
(brick -18 L*, stucco or stone -26). They differ little at panel size, because v2's outlines sit only on each beat's
subject; without its shade faces B goes flat. **The real choice is the shade step as much as the line.** In our float
the posters' ~1 px lines would twinkle (DE §3): a thing that is a line is drawn >= 2 px or kept quiet. *Engine:* the
tier-A line as a per-film flag; `scripts/look/posters/ab_outlines/` already renders both from one geometry. *Cost* S.

**5.4 Light on volumes.** [a lit and a shade face on every volume: owner, rule 5; how deep: open, decision 1] Posters
(ST §1.2): every volume one deep flat step, lit to shade -21 to -37 L* (median -29; CRAFT §d.3 asks -7 to -12); round
forms in 3-4 stepped bands, never a gradient; the shade cool on whites, plum on warm walls with chroma kept; one key
high and to the side; no cast shadow on the ground (we keep ours: CRAFT §d.6). v2's S3 chimney: -5 L* (AB). *Pros:*
Valve's one shading model for every tier (P2), the crown lit as one mass (P3). *Technique* (ST L2): tier A's shade face
-20 to -25 L* (§7), 3-4 bands on round forms; B and C keep -7 to -12. *Engine:* `lib/light.tsx` `FormShade` per-tier
strength; a tier-A row in CRAFT §d.3; `check_light.py` checks the A step. *Cost* S-M. *Risk:* a turning object re-cuts
its step each frame.

**5.5 The value range.** [owner, rule 6: "good point too!", the numbers from this study] The numbers we propose for
rule 6 (§1a, §4): L* p5 <= 32; under L* 40 on 6-10 % of the frame in >= 120 pieces; L* < 65 on >= 25 %, 65-80 on <= 20
%; >= 30 L* from the near group to the air; a >= 15 L* jump to the far group. Rule 6's "one tinted dark anchor (~5 %)"
names the darks' hue family, not their cap (ST, P4). The cheapest start is nature: v2's trees from L* 63-71 to ~45-60
cost no detail (P3 §5). The share over ~5 % is decision 2.

**5.6 Layout and composition.** [the consolidation: `layout.md` Part A (every earlier rule) and Part B (the posters),
each line marked; `docs/look/LAYOUT.md` once approved] The posters stack three bands: open sky 36-53 % (median 44),
the city in the lower 44-61 % with 73-90 % of the detail, all the calm in the sky (1-3 % calm below the skyline; v2
19-31 %), dark bottom corners (L* 44 / 53 in frames of 83; v2 ~72 / 74); diagonals don't aim at the hero (lead lift
0.78): the sky does (CO §1). Into 9:16 by extension, never by crop: the title lands in our caption block in 7 of 7, the
near frame under the bottom UI; the hero centred or on the left third, never the right (the rail) (CO §4). Part B adds
a "poster frame" for the establishing view and the scale landing, the near frame, the quiet field measured, the far
anchor's zone, Pip's spot, off-centre VPs, the hero big AND loud, the far landmark as a B carrier, one cover frame.
*Check:* `composition.py frame` -> `scripts/qa/check_composition.py` (M).

**5.7 The designed view.** [open: the owner finds it "fascinating"; decision 4] Posters (PE finding 1): a stack of
cameras. Three are one camera each; Hanoi, Buenos Aires and Cape Town draw the near world from a low eye level (0.75;
0.67-0.80; 0.77 of the height) and lift the far city and its water onto a second horizon 0.14-0.27 higher, the junction
hidden behind trees, water or roofs, the far zone with no receding line; heroes 1.4-3.6x one camera's size; and 3-5 of a
city's icons, one per plane, sides alternating (CO §3). *Pros:* Hiroshige's framed far views; Guo Xi's three distances
in one vertical panorama (P1 §2). *Technique* (PE L2, CO L5): one near camera per set (eye 1.6-5 m) and, only for a
panorama, ONE declared far stage on its own horizon (y ~1090-1215 against a near eye at y 1380-1480) behind a hiding
band with no receding line; never three eye levels; the icons as a sequence, one per beat. In motion both horizons
hold; a truck along the junction is the one move that exposes it. *Engine:* `lib/persp` `farStage({horizon})`;
`sizeProblems` accepts `stage: 'far'`, `hero: true`. *Gate:* W1 declares; G3 plays every move through the layers.
*Cost* M. *Risk:* a thin hiding band reads as a backdrop on a floor; it clashes with CRAFT §f.4-5's one camera.

**5.8 The series and the brand.** [one look, one brand, still evolving: owner; covers as one series: owner, playbook
ONE LOOK; the cover template: proposal] The 19 posters read as one series because the frame repeats (the name at one
height, ~44 % sky, one landmark touching it, a dark near frame) and the hero changes; their title is print-small (5-10
px on a 360-px grid tile) (CO §6). *Technique* (CO L6): one cover frame for every film: the core line in the sky in our
caption type (17-20 px on the tile), the film's A big under it (~8-15 %, est.) with open sky round its top, the near
frame dark, inside the 4:5 crop y 285-1635; no second type voice now (ST's tracked-caps label: after 3 place-led films,
CM §5.4). The brand is also the ladders (finish, value, nature) kept the same in every film (P2 §5). Refined film by
film, never frozen ("i don't think we can overfixate on this"). Open: the case and Pip on the cover (LA §6 rows 15-16).

**5.9 Pip, hidden.** [owner, 2026-10-28: "keep it, but not as obvious ... hide it deliberately"] Where (CO §4): the
busiest 60-px spot of y 700-1480, x 140-760, >= 250 px from the hero, in the near patchwork (La Boca's windows,
Reykjavik's roofs, Cape Town's harbour); ~40-90 px, <= 1 % of the frame, never the sky, the band, the rail, a join or
the subject's eye path (LA §1). The posters' fullness (facades, objects of use) is what gives it places to hide. W1
names the spots, G3 plans them. Open: a few spots or a "find Pip" in every shot, and the cover (decision 5).

**5.10 The sky and the sun.** [proposal; the sun: decision 6] The posters' skies are paper: cool blue-grey (L* 85-87,
C* 4-6) or warm cream (L* 93-94, C* 6-12), lighter toward the horizon (+1.2 to +5.8 L*), no sunset band; v2 S1's sky
C* 13-14, +1.1 L* (ST §1.6). A `lib/sky.tsx` paper preset (C* 8-10, +2 to +5 L* toward the horizon, the band flat to
<= 1.5) S. No poster has a sun disc; v2's S5 sun (C* 74, dE 80 off its sky) is the loudest far thing (P1 §4, P4 Q3).

## 6. The content track, in brief
The owner asked "which type of content would be best fit into videos where we have more of cities / architectures /
buildings", then, in the parallel thread, widened and steered it: "Don't be fixated on tech or AI, all goes"; the views
are "storytelling that is around these views ... has nothing to do wiht the actual cities"; not "completely made up
content" either; then "tech related topics ... datacenters do fit pretty nice in here ... we need some WOW stories" and
"generalizing it to tech in the cities" (all verbatim in CD; captured in the playbook's "Places on screen").
- **Our evidence** (CF §1, §4): v1's city was the mechanism (82 % place-led frames; skip rate 32 %), v2's canal a stage
  while text boards carried the argument (the story the owner found weak), v3's place sat behind a product (5 %; skip
  64.5 %). The gap is in the first 2-3 s, so it speaks to frame 0, not to places as such. The lesson: pick stories whose
  mechanism happens TO a place; place fit tests the story, not the set.
- **The market** (CM): place-led explainers are proven in long form (the B1M ~4M subscribers, Practical Engineering
  ~4.7M, Johnny Harris ~7.8M, est.); nothing shows the look carries short-form reach (Kurzgesagt ~25.3M on YouTube, ~1.9M
  on TikTok, est.): the opening does. Stories travel with a named place, a conflict and an everyday consequence; the
  postcard is the trap. Judge the look on saves and shares (v1: 0.4 %, 0.7 %).
- **The live thread** (CD, state 2026-10-29 ~03:15 UTC): a shortlist sent under one umbrella, "tech in the cities", in
  five kinds (the hidden machines; waste turned into warmth; new machines over the streets; giants being built; towns
  deciding); its top: London's hospital blood-sample drones (8.4), Seaham's homes heated by flooded mines (8.1), Norway's
  ship tunnel, Germany's Eiffel-tall turbine, Venice's 78 sea gates, London's super sewer (8.0 each); the owner's
  Stockholm bunker checked true. **Waiting on the owner's pick**; a pick gets one fact lock.
- **Pending:** the journal corpus (`journals/`: 1,209 recent stories from big publications, 308 in its second stage,
  two scorers running, then an audit and clusters) gives content directions with real examples, not a pick.
- **Specific local objects** (DE §1.5's five slots: a landmark, a house type, a plant, an object of use, a local sign)
  are content, not style (owner: "hard to imagine if its going to trasnalte and generalize well"): a W1 practice for a
  story's home place, never a look rule.

## 7. Where the reports disagree, and how we resolve it
| Topic | What the reports say | We take | Why, or whose call |
|---|---|---|---|
| The subject's shade step | ST L2 -18 to -25; AB's B -18 (brick) / -26 (stucco); P4's 10b -24; posters -21 to -37 (median -29); CRAFT §d.3 -7 to -12 | tier A -20 to -25 L*; B and C keep -7 to -12 | the overlap of the three proposals; under the posters' median because our palettes are paler (CRAFT §d.3); a phone needs bolder steps than print (Gurney on Meissonier, P1 §5). Rule 5 says "gentle": the owner's call (decision 1) |
| The dark share | ST 6-15 %; P1 ~5-10 %; P4 6-10 % in >= 120 pieces; rule 6 "one tinted dark anchor (~5 %)" | 6-10 % under L* 40 in >= 120 pieces | the overlap of all three, P4 measured at phone scale; the owner's call (decision 2) |
| The darkest value | ST L* p5 <= ~30; P4 <= 32 | <= 32 | P4 measures at the phone scale the owner judges at |
| Chroma of the page and the mids | ST: page and mids at C* ~8-10; P4: light fills C* 4-8, the cool field 9-11, the mids kept at 18-32 | P4's split | the posters' chroma peaks in the mids (C* 18.4 at L* 40-60); ST's frame median is set by the lights |
| The float's constants | code `PARALLAX_K` 1 / 0.85 / 0.6 / 0.45 / 0.35 / 0.15 / 0.05; P1 1/z by plane (1 / 0.6 / 0.24 / 0.10 / 0.04 / 0); PE each plane's measured scale | 1/z from the shot's camera; P1's table when W1 declares no units | one law for size, CineCamera and COZY_AND_SCALE §4's 1.8x; PE's case is that law applied. A code-vs-doc bug: no owner call |
| Contrast caps | CRAFT §b tier C <= 7; posters' near frames 7.9-12 (PE), near patchwork 9.7, ~10 if still (P2), near nature <= 9 (P3); far: P2 <= 6, P3 <= 4, posters' backgrounds median 4.9 | near planes (-2, -1) <= 9 with no small features; mid C <= 7; far <= 5 (far nature <= 4) | the middle of the proposals; the float already moves the near ground most (rule 8). Above tier C's cap: the owner's call (decision 3) |
| The quiet field, measured | PE open ground <= 15 %; DE near-ground empty tiles <= 5 % of the frame, structure tiles <= 12 %; CO calm below the skyline <= 5 %; P2 no C region > 5 % under 8 shapes per 10,000 px; P4 no edge-free field > 2 % | one check: calm below the skyline <= 5 %, no edge-free field over 2 %; open ground <= 15 % as W1's planning number | four measures of one thing, agreeing on ~5 %; a cozy shot whose quiet field is the floor keeps LD's rule |
| Where the patchwork goes | ST L4: far, mid, the ground, the sky's edges; P2: the near ground and far; PE §5: never a level ground, at most far | §5.2: frontal on mid and far masses; on grounds only receding through `groundCam`; in the sky only as masses | keeps both lenses' evidence: PE objects to level bands, which the projection removes; ST itself rejects abstract sky rectangles |
| Texture amplitude | ST mottle <= 0.5-0.6 L*, 40-70 px, grain <= 0.25; P4 mottle <= 0.5, 30-70 px, grain none or <= 0.25; P2 1.5 / 1.1 / 0.7 std L* | mottle <= 0.5 L* in 30-70 px blotches, no grain first, P2's plane ratios 1.0 / 0.7 / 0.4 | ST's bitrate and shimmer test; P2's absolutes hold grain and JPEG |
| Texture in the caption band | ST Q1 asks about half strength (~0.3 L*); P4 none; rule 10 one calm flat field | none | rule 10 stands; no owner question needed |
| The hero: quiet or loud | the posters' hero is quiet in 5 of 7 (CO §2); rule 2: A owns the contrast | big AND loud | the owner's v3 note ("not sure what to keep my attention on"); a 2-4 s shot has no time for a tour |
| The cover title | ST L7: a constant label in tracked geometric caps (Jost, cap >= 32 px); CO §6: our caption type only; CM §5.4: name a series after 3 place-led films | caption type only now; a label after 3 place-led films | the owner's "few and big" words; one type voice |
| The vista's eye and sky | PE: near eye 0.72-0.77 H with a far stage 0.57-0.63 H; CO: sky ~45-58 % in the poster frame; CG: rooftop landings at 0.40 / 0.46 H, sky 30-40 % | both, by shot: the poster frame for a street-level establishing view; CG's rooftop for the scale move | two cameras, not one number; the owner sees one poster frame in the clip (decision 4) |
| The far anchor's value | P1: pale (k 0.64-0.87); PE §1.5 and CG cue 7: a dark far silhouette on a pale sky allowed | pale by default; dark only as the declared scale subject | 6 of 7 posters; Copenhagen's spire is the one exception |
| The hero's size | CO ~8-15 % of the 9:16 frame (est.); P2 ~15 % (the posters' box); PE 21-45 % of the height; LA Part A a subject 270-460 px wide | place-led: 8-15 % of the frame, >= 2x the next icon; figure-led: Part A's box | CO measured the posters extended into our frame; Part A's box is for people |

## 8. What not to take
- **The quiet hero and the tour:** the salience peak on the near frame or a second icon (5 of 7), 3-5 icons at once
  (CO §9, DE §6): in a 2-4 s shot that is the split focus the owner rejected in v3. Take the icons as a sequence.
- **Three eye levels in one picture** (Buenos Aires 0.80 / 0.67 / 0.53): a still hides it, a camera move shows it (PE §5).
- **The patchwork as level floor bands; abstract rectangles in the open sky** (PE §5, ST §4).
- **The crop to fill, the right-third hero, a steep sky in the band, any title in the film's frame, the posters' tiny
  letter-spaced caps on a cover** (CO §9, ST §4).
- **The beige, olive and grey fields** (Copenhagen's olive sky, Kyoto's olive hills, Hanoi's olive water): the owner's
  "warm, not sick" (ST §4).
- **Fine grain at the posters' upper level, grain re-seeded per frame, texture locked to the screen:** 1.6-14x the
  bitrate, erased or shimmering (ST §1.4).
- **Sub-2 px work on anything that floats** (1 px window grids, rigging, ribs) and **window grids as line density**
  (783-1734 strokes per Mpx against our budget of 80) (DE §6, ST §4).
- **No contact shadows, greyed shadows on stone, two light directions in one frame** (ST §4).
- **Foreground strangers** (Hanoi's rider and woman): retired in DIRECTION (PE §5, DE §6).
- **Prop counts as targets, detail by depth as a line ladder, even detail as the lead** (DE §6).
- **Blur, depth of field, opacity or a filter** to push a plane back or lower a tier (P1 §2, P2 §2).
- **A post-process grade as the fix** (it closes 16 % of the gap) and **saturating the subject to look premium** (5 of 7
  heroes are the palest mass) (P4 §1, §5).
- **A poster frame for every shot:** it is the exposed dose; cozy stays the home (CO §9).
- **A poster or a real skyline copied:** every film's world is drawn new (PE §5; playbook).
- **The specific local objects as a style rule:** content, the owner's call per story.

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
captions, then a 0.9 s hold on the cover frame, 5.2 s in v2), rebuilt in v2's hues at 60 fps. Why S1: every lens wrote
its "after" for it (PE §2, P1 §4, P2 §4, P3 §4, P4 §4), its gaps are the largest (open ground 37 %, near treads lighter
than the subject, the far city in a quarter of the width, a five-disc tree, 12 % empty paving), and it is the cover, so
the same clip tests the series frame. One playable video, labelled, about 21 s: **v2's own S1**, then **pass 1, the
owner-approved lessons** (the near group in mid-tones with darks at ~5 %, a lit and a shade face on every volume at
today's step, the VERY subtle mottle switched on at 3.5 s, Pip hidden in one spot, the float by depth, rule 4's line),
then **pass 2, everything proposed** (B edges with the subject's shade at -20 to -25, darks 6-10 % in pieces, the
patchwork paving and far city, a far stage with a pale ghost skyline and one landmark rising to y ~640-700 (P1 §4), one
species tree in a calm wind, a hero cumulus, 10b's calm lights). Both open with frame 0 drawn in the clean pen as a bold
event (rule 9), then float (the near frame ±12 px, the far stage and sky still), then hold. Beside it, one sheet of the
5.2 s frame in four single-switch A/Bs (line, darks, patchwork, texture) from the same code. The owner: the glance test
on the phone (a 2 s flick, then 10 s), then decisions 1-6. v2 is shipped: the clip copies its S1 code, never edits it.

**Build order** (engine and tools are reused by every later film; each film still draws its own world):
| # | Piece | Report | Cost |
|---|---|---|---|
| 1 | The "before" row: the study's scripts on v2 S1 at 1.0, 3.0, 5.2 s (`pro_4_colour.py`, `check_depth.py`, `details.py measure`, `pro_2_hierarchy.py`, `composition.py frame`); no new code | all | S |
| 2 | `lib/depth.ts`: `PARALLAX_K` by 1/z, a +5 ghost step 0.87, `nearStep`'s floor, `anchorTones` | P1 §3.4-3.5, PE L5 | S |
| 3 | 10b's roles in a copy of v2r's palette; `lib/gamut.ts` `siblings` | P4 §3.3, §3.7 | S |
| 4 | `lib/light.tsx` `FormShade` per tier (the reference: `ab_outlines/scene.py`, form 0.56) and the tier-A line as a flag | ST L2, AB | S-M |
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
