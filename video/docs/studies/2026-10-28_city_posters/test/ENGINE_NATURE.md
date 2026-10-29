# The look test's nature lane (N): one species tree, one wind, one hero cumulus

*Lane N of the 7 s look test (`STUDY.md` §10, build items 8 and 9). Specs: `pro_3_nature.md` §3.0 (N1-N7), §3.1
(trees), §3.4 (clouds); the owner on nature: "the "nature" objects are very subtle and they are visually very
interesting like they are obviously very real, but if you look closely we combine the real effects with the lower poly
kind of effects". Decided (2026-10-29, "Go with your suggestions"): no outlines (edges from light and shade), a lit and a
shade face on every volume, one look, a VERY subtle mottle, a full value range, 2 px lines on floating layers.*

Status: done (2026-10-29 ~09:15 UTC). Demo sheets here: `engine_foliage.png`, `engine_clouds.png`; the 2 s wind check:
`engine_wind_check.mp4` (720 x 1280 at 1:1, 60 fps, 378 KB).

## 1. The pieces (all new files; no existing file changed)
| File | What |
|---|---|
| `src/lib/wind.ts` | ONE gentle wind for all foliage (N7) |
| `src/lib/foliage.tsx` | one species, the London plane: `<Crown>` (crown, limbs, trunk), `<LeafSpray>`, the nature ladder's tones, `foliageProblems` |
| `src/lib/clouds.tsx` | the hero cumulus (§3.4): `<Cumulus>`, `cloudTones`, `cloudProblems` |
| `src/look/nature/demo.tsx`, `src/entry-look-nature.tsx` | the demo: specs, frames, lints; compositions `NatureFoliage`, `NatureLadder`, `NatureClouds`, `NatureWindCheck`, `NatureTwinkle` |
| `scripts/look/posters/nature_check.py` | `still` (pro_3_nature.py's own metrics on a box + CRAFT §e local contrast), `motion` (smoothness, boil), `twinkle` (the sub-pixel test) |

## 2. Libraries (the owner: "Search for any libraries or supporting code on GitHub ... But only if it's genuinely better than built yourself")
Searched GitHub and npm (WebSearch `site:github.com`, `site:npmjs.com`; `npm view`), 2026-10-29:
| piece | chosen | looked at (version, licence) | why |
|---|---|---|---|
| the wind's noise | **`@remotion/noise` 4.0.538** (already a dependency, pinned with the project's Remotion; wraps `simplex-noise` 4.0.1, MIT) | `simplex-noise` 4.0.3 direct; our own noise | seeded and deterministic per frame, maintained with Remotion: genuinely better than our own. Use one seed per wind (its cache holds 10) |
| the wind's model | our own (~150 lines) | GPU Gems 3 ch. 6 and ch. 16 (main + detail bending, phase from position), an OpenProcessing grass sketch (noise gusts + sine), Godot's 2D wind-sway shader, `tuxalin/vegetation-shader` (UE4) | no JS/SVG wind library exists; each is a shader or a sketch, and ours is those formulas on transforms |
| crowns, leaves | our own | `dgreenheck/ez-tree` (MIT; Three.js meshes, GLB), aurbano's TreeGenerator (canvas, branches only), `walsh9/topiary`, `lindenmayer` (L-systems) | they grow 3D or skeletal trees; ours is a designed species drawn as flat SVG ("species drawn by hand, the generator only places and lights them": pro_3 §3.6) |
| facets, clipping, unions | our own (~120 lines: an icosphere for the far mode, Sutherland-Hodgman against convex cuts, point-in-polygon, a hull) | `d3-delaunay` 6.0.4 (ISC), `delaunator` 5.1.0 (ISC), `clipper2-ts` 2.0.1-18 (BSL-1.0, 2 MB), `polygon-clipping` 0.15.7 (MIT) | every clip is a polygon against one convex region, and the cloud's union and soft steps are exact with circles (nonzero fill; a circle grown by d is the step d px out): a boolean engine adds 0.3-2 MB for none of it |
| clouds | our own | `svg-clouds` (SVG feTurbulence filters), `Erkaman/cloud_gen` (C++, MIT, 2017), `a-type/clouds` (Three.js) | filters are blur and noise (rule 5: flat steps, never blur); the others are not JS/SVG |
No dependency added; `package.json` unchanged.

## 3. How each piece reads (real at the silhouette, the material and the light; low poly where the light turns)
- **The crown** (near plane): 8-11 clusters on the species' envelope (a broad, irregular dome on a 36 % clear trunk),
  a dark core behind. Each cluster takes ONE value from the crown's envelope against the key (lit as one mass, the core
  darkest, the underside away from the key shading itself). REAL: each cluster is an organic blob whose rim is the
  London plane's own leaves (an outer row ~70 % out past the mass, about a leaf apart, each outline reading against
  what is behind it, and a tucked inner row: lace, never a saw); ~3.5 % of the outer, lit rim leaves turned gold or
  rust (S1's falling leaves are this tree's); leaf-bitten sky holes in the true sky colour a step down, only where the
  sky is behind (`holesAbove`). LOW POLY: a lit cap cut by a straight two-facet line, a hi facet on the two brightest
  clusters (a dab), a core crescent on the dark low ones; on the lit facets each rim leaf is folded on its midrib (its
  key-facing half a step up, the other a half step) and a sprig or two sits inside the cap; in the shade the leaves
  merge into the mass.
- **The trunk and limbs:** tapered closed paths, the shade side away from the key, the plane's camouflage plates as
  same-hue patches (peach-cream, rose, soft sage lit; two deeper in the shade: N5 b), the crown's own shade over the
  trunk's top in two flat steps; limbs under every cluster (a limb's end never pokes out of the leaves).
- **The ladder** (N1; `plane` picks the mode): near (<= -1) species leaves, 5 tones; mid (0 ... +2) 11-18 px leaf bumps,
  4 tones; far (+3, +4) 4-8 straight facets of a jittered icosahedron, 3 tones spread so they still step ~5 L* after the
  plane's air step (lib/depth `recede`, then lib/water `cleanColour` keeps them out of the olive band).
- **The spray:** a tapered branch with 2 twigs and ~10 leaves on stalks (2.8 -> 2.2 px); each leaf the full species
  template folded along its five main veins (10 facets, each tilted toward its vein, toned by the key: the proteas' and
  banana leaves' fold), a base plate where the facets meet, the midrib and two lateral veins as light tapered shapes
  (3 -> 2 px), 3 depths of green; the lit strip of a twig or branch only where it is >= 4.5 px wide.
- **The cumulus:** a union of circles (2-4 overlapping towers, a row of low masses on one flat base, shoulders, lobes
  3-8 % of the width along the top). Inside: the body is the whole union moved toward the key (its shade a crescent
  along the edges facing away), a lit band on the lobes facing the key cut once by a straight facet, the flat base's
  shade as a wedge (thin under the lit side) toned toward the shade family's violet (on a pale sky a value step alone
  melts into it: `cloudProblems` checks dE >= 6), soft ends as 2 flat steps of 3.5 px from the tone they border toward
  the sky there (C2). It drifts as one translate (3 px/s along the wind), never reshaped; its fills are backdrops.

## 4. API (all opt-in; nothing draws unless a scene places it)
- **`lib/wind.ts`:** `makeWind({seed, dir = 0 (toward, screen deg), speed = 180 px/s, crown = {deg 0.6, hz 0.18},
  cluster = {px 2, hz 0.4}, leaf = {px 1.2, deg 1.2, hz 0.85}, gusts = [] ({t, strength 0.6, width 520}), at = [540, 960],
  strength = 1, joins = []})`; responses `crownDeg(w, t, {x, y, plane, seed})`, `clusterShift(...)`, `leafFlutter(...)`
  (pure functions of time and position: the phase travels downwind at `speed`, so neighbours never sway in lockstep);
  `gustAt`, `gustPeakAt`, `lagT`, `planeSway(plane)` (near 1, 0: 0.85, +1 0.6, +2 0.35, +3 and farther 0), `STILL_WIND`,
  `WIND_DEFAULTS`, `WIND_RANGES`; `windProblems(w, things, {t0, t1, fps})`: N7's ranges, sampled maxima (crown <= 1.0 deg,
  cluster <= 3 px, leaf <= 2 px and 1.6 deg), far planes still, no gust peaking at a thing or entering within 0.2 s of a
  join, one gust on screen at a time.
- **`lib/foliage.tsx`:** `<Crown spec wind? t? exact?>`, `<LeafSpray spec wind? t? exact?>`; `crownGeometry(spec)`,
  `sprayGeometry(spec)` (cached by content; `.stats` has tones, shares, mean L*, the light vector, counts, min width;
  `.pivot` the trunk's foot, `.bbox`); `CrownSpec {seed, base: [x, y] (the foot), height, width?, plane = -1, light
  (a rig, `{kind:'sun', toward, el}`, `{from, el}` or a 3D vector toward the light), tones?, bark?, atm? (lib/depth),
  holes? (colour or (x, y) => colour), holesAbove?, autumn?, clusters?, leafSize?, lean?, trunkWidth?, patches?,
  species = LONDON_PLANE}`; `LeafSpraySpec {seed, branch: Pt[] (entry -> tip), width = [16, 4], leaves = 11, size =
  [70, 120], twigs = 2, plane = -2, light, tones?, bark?, droop = 0.45, autumn = 0, fold = 22, veins = 'main'}`;
  `foliageTones({green, L, chroma, hueTurn})` (the ladder on a green: cooler toward the core, never into the olive
  band), `barkTones()`, `autumnTone()`, `LADDER_NEAR / _MID / _FAR`, `TONE_SHARES`, `modeOf(plane)`, `lightVec`,
  `sunVector`, `LONDON_PLANE`, `PLANE_LEAF`, `PLANE_RIM_LEAF`, `BUMP_LEAF`, `NATURE_TARGETS`, `NATURE_KEEP_OUT`;
  `foliageProblems({crowns, sprays, keepOut})`: the never bands and C* >= 8, the ladder's count, steps, range and mean
  by mode, the light vector within 45 deg of the key at strength >= 0.3, sky holes <= 3 %, every thin part >= 2 px,
  nothing in the caption band (x 95-945, y 290-600) or the right rail (6 px sway margin).
- **`lib/clouds.tsx`:** `<Cumulus spec wind? t?>`; `cumulusGeometry(spec)`, `cloudTones({sky, warmHue, lit, body,
  belly, bellyHue, bellyC})`, `cloudOffset`; `CumulusSpec {seed, x, base, w, h, towers = 3, light, sky (colour or
  (x, y) => colour: lib/sky's skyColorAt), tones?, soft = {steps 2, px 3.5}, drift = 3, lobes = [0.03, 0.075]}`;
  `cloudProblems(geoms, {band, t0, t1, wind})`: clear of the caption band over the whole drift, steps >= 3 px, drift
  2-6 px/s, top lobes 3-8 % of the width, belly 6-10 L* under the body and dE >= 6 from its sky, the lit top >= 5 L*
  over its sky, no tone in the never bands.

## 5. Checks and numbers
- **Lints** (`natureDemoProblems()`; also run in node by bundling the demo with esbuild): foliage `[]`, wind `[]`,
  clouds `[]`. Fixed what they caught on the way: the crown's leaf tips in the caption band (y 539), two demo trees in
  the right rail, far steps of 3.3 L* after the air step, a far tone on the olive band's edge.
- **The crown, measured** (`nature_check.py still`, pro_3's own metrics; `NatureFoliage` @3.0 s, box 0 540 770 1030,
  above the canal): tones 36 / 45 / 53 / (57, a fold's half step) / 61 / 68 L*, shares 6 / 34 / 24 / 12 / 19 / 5 %,
  range 24.7 (<= 30), mean L* 51.9 (the study's S1 target ~52; N1 42-55), light vector 145 deg at strength 1.36 (the
  key's direction 143-152 deg: within 10), lighter at the top (r 0.65) and at the rim (+6.9 L* over the core: Gurney),
  roughness 1.66 (>= 1.3; posters 1.31-3.19; v2's five-disc tree 1.25), local contrast 2.45 (<= 9; the posters' near
  nature 6.7-12.6: calm, with room to be richer). The meter's step warning is the folds' half steps (4.0, 3.7), meant.
- **The ladder** (geometry stats): mid crowns mean L* ~54 in 4 tones (N1 45-60); far crowns 3 tones in ~5 L* steps after
  the plane's air step.
- **The wind** (sampled over 7 s at 60 fps, the 2.6 s gust included): crown 0.52 deg, cluster 1.8 px, leaf 1.2 px and
  1.15 deg (a 100 px leaf's tip ~2 px): inside N7. Calmed on the way: the leaves first turned ±3 deg (tips ±5 px).
- **Boil** (`NatureWindCheck`, 2 s from 1.6 s at 1:1, the S1 float and the gust): the same window with the wind and the
  float held: 0 px changed over 30 frames (nothing moves unless the clock does; every path is built once); in motion the
  mean |dL*| per frame stays even (median 0.035, max 0.045: max / median 1.27, no pops).
- **Twinkle** (`NatureTwinkle`: the window held still and moved by pure sub-pixel translations, 0-1 px in 0.1 px steps,
  so motion cannot confound it; `nature_check.py twinkle`, each thin feature's core contrast followed across the phases;
  calibrated on the demo's card: a 1 px line swings 7.1 L* along all of its 240 px, a 2 px line 0.0, the details lens's
  numbers). The cloud's steps: 0 features of note (4 specks of 3-5 px). The foliage: no line-like feature pulses; what
  the measure flags is the lace's very ends: V-shaped sky gaps between rim leaves and lobe tips (a few px each, up to
  ~25 L* at a tip's last pixels), and the spray's one connected vein and stalk network, whose strongest point swings
  2.8 L*. At 4x across the phases the veins, stalks, tips and the crown's edge hold their brightness. Fixed on the way
  (real sub-2 px lines): the lit strip of a thin twig (55 % of 3 px = 1.6 px) now stops where the twig is under 4.5 px,
  and the ten facets of a spray leaf no longer meet in slivers at its base (a base plate). Note for the meter: a 3 x 3
  top-hat fakes a twinkle on a 2 px line (it under-reads it whenever it straddles three rows); the meter uses 5 x 5.
- **Non-breaking proof:** `Film2R-V2S1` (`--entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`, full size,
  `GL=angle`) at frames 60 and 312 (1.0, 5.2 s) against lane E's frames rendered at 07:48 UTC, before any file of this
  lane existed (copied into `/tmp/posters-n/proof_before`): **0 px of 2,073,600 differ on both** (max channel delta 0);
  the sanity pair (60 vs 312) differs on 426,155 px. `npx tsc --noEmit`: clean (the whole project).

## 6. For lane S (wiring it into the scene)
- **One wind for the shot:** `const WIND = makeWind({seed: 'S1', dir: 0, gusts: [{t: 2.6}], joins: [6.1]})` (dir 0: v2's
  light westerly, the falling leaves drift right); `windProblems(WIND, [...])`. A gust is one noticeable mover: keep it
  out of 5.9-6.3 and off the hook's first beat.
- **The tree:** `<Crown spec={{seed, base: [x, y], height, plane: -1, light: RIG_CANAL (or {kind: 'sun', toward: 15,
  el: 36}), holes: (x, y) => <the sky a step down>, holesAbove: <where the skyline starts>, species: {...LONDON_PLANE,
  green: CM10B.sage}}} wind={WIND} />` inside the near plane's float group, with `ContactShadow` / `CastShadow`
  (lib/light) at `crownGeometry(spec).pivot`, and `foliageProblems({crowns: [crownGeometry(spec)]})`. Its leaf tips must
  stay out of the caption band (the lint says where): in S1 that means a crown below y ~610 on the left third, or the
  trunk at the left edge with the crown above the frame and the spray as its overhang. Pass 1: `green: CM.sage`.
- **The spray:** `<LeafSpray spec={{seed, branch: [[-50, -30], [70, 30], [170, 84], [262, 118]], width: [15, 4],
  leaves: 10, size: [52, 86], droop: 0.32, light: KEY, autumn: 0.1, species: ...}} wind={WIND} />` in the top gutter on
  the near plane (the demo's spray stays at y <= 273).
- **The cloud:** `<Cumulus spec={{seed, x: 598, base: 272, w: 430, h: 146, light: KEY, sky: (x, y) => skyColorAt(SKY, y,
  x), drift: 3}} wind={WIND} />` in the sky group (no float), in place of v2's flat cream cloud `[644, 184, 1004, 270]`
  (and its strip of tiny scallops); `cloudProblems([cumulusGeometry(spec)], {t0: 0, t1: 7, wind: WIND})`.
- **Frame 0:** every fill is a lib/Fill, so the paper state and the flood apply. The crown and the spray keep their
  tones under the clean pen (`exact`, a subject-tier scope, though they are tier C by role); the cloud's fills are
  backdrops (paper white before the flood).

## 7. Open points (the owner's eye at G4)
- The look is a first engine pass of the recipe; the owner judges it in the clip (each piece is an A/B in the study).
- The near crown is calm (local contrast 2.45 against the posters' 6.7-12.6): more sprigs, or more leaves revealed on
  the lit side, raise it if "visually very interesting" asks for more.
- The lace's ends (V-gaps, lobe tips) twinkle at their last pixels in a sub-pixel move; at 1:1 and 4x they read as
  stable. Watch the crown's edge at 1x in the clip (`engine_wind_check.mp4`).
- Not built (not needed for S1): `<Flower>`, `<Blossom>`, `lib/facets.ts` (rocks, ranges), the aurora, a second species.

## 8. Re-run
```bash
E=--entry=src/entry-look-nature.tsx   # from video/
GL=angle node scripts/render-frames.mjs NatureFoliage <dir> 3.0 $E          # also NatureLadder, NatureClouds
npx remotion render src/entry-look-nature.tsx NatureWindCheck <dir> --sequence --image-format=png --gl=angle --concurrency=2
npx remotion render src/entry-look-nature.tsx NatureWindCheck <dir2> --sequence --image-format=png --gl=angle --concurrency=2 --frames=0-29 --props='{"still":true}'
npx remotion render src/entry-look-nature.tsx NatureTwinkle <dir3> --sequence --image-format=png --gl=angle --concurrency=2
python3 -I scripts/look/posters/nature_check.py still --img <dir>/f00180.png --box 0 540 770 1030 --band near
python3 -I scripts/look/posters/nature_check.py motion --frames <dir> --still <dir2>
python3 -I scripts/look/posters/nature_check.py twinkle --frames <dir3> --box 560 1160 712 1210 560 1210 712 1272 0 0 330 290 0 560 720 800 --names cal_1px cal_2px spray crown_edge
```
Scratch (lane N's own): `/tmp/posters-n/` (the sheet builder `n_sheets.py`, the node lint runner `n_lint.ts`, the
proof's diff `n_pxdiff.py`).
