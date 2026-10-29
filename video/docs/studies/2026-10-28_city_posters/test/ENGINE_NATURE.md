# The look test's nature lane (N): one species tree, one wind, one hero cumulus

*Lane N of the 7 s look test (`STUDY.md` §10, build items 8 and 9). Written as it goes. Specs: `pro_3_nature.md` §3.0
(N1-N7), §3.1 (trees), §3.4 (clouds); the owner on nature: "the "nature" objects are very subtle and they are visually
very interesting like they are obviously very real, but if you look closely we combine the real effects with the lower
poly kind of effects". Decided (2026-10-29, "Go with your suggestions"): no outlines (edges from light and shade), a lit
and a shade face on every volume, one look, a VERY subtle mottle, a full value range, 2 px lines on floating layers.*

Status: in progress (2026-10-29 ~09:10 UTC): the three modules, the demo and the lints are in; the 2 s wind check,
the demo sheets and the proof are next.

## 1. The pieces (all new files; no existing file changed)
| File | What |
|---|---|
| `src/lib/wind.ts` | ONE gentle wind for all foliage (N7): `makeWind`, `crownDeg`, `clusterShift`, `leafFlutter`, `gustAt`, `windProblems` |
| `src/lib/foliage.tsx` | one species (the London plane): `<Crown>`, `<LeafSpray>`, `crownGeometry`, `sprayGeometry`, the tones, `foliageProblems` |
| `src/lib/clouds.tsx` | the hero cumulus (§3.4): `<Cumulus>`, `cumulusGeometry`, `cloudTones`, `cloudProblems` |
| `src/look/nature/demo.tsx`, `src/entry-look-nature.tsx` | the demo (specs, frames, lints) and its compositions |
| `scripts/look/posters/nature_check.py` | the still meter (pro_3's own metrics on a box) and the motion check (twinkle, boil) |

## 2. Libraries (the owner: "Search for any libraries or supporting code on GitHub ... But only if it's genuinely better than built yourself")
Searched GitHub and npm (WebSearch `site:github.com`, `site:npmjs.com`; `npm view`), 2026-10-29:
| piece | chosen | looked at (version, licence) | why |
|---|---|---|---|
| the wind's noise | **`@remotion/noise` 4.0.538** (already a dependency, pinned by the project's Remotion; it wraps `simplex-noise` 4.0.1, MIT) | `simplex-noise` 4.0.3 direct, our own noise | seeded, deterministic per frame, maintained with Remotion: genuinely better than writing noise. One seed per wind (its cache keeps 10 seeds) |
| the wind's model | our own (~150 lines) | GPU Gems 3 ch. 6 and ch. 16 (the technique: main + detail bending, phase from position), an OpenProcessing grass sketch (noise gusts + sine sway), Godot's 2D wind-sway shader, `tuxalin/vegetation-shader` (UE4) | no JS/SVG wind library exists; each is a shader or a sketch, and ours is the same few formulas on transforms |
| crowns, leaves | our own | `dgreenheck/ez-tree` (MIT; Three.js meshes, GLB), aurbano's TreeGenerator (canvas, branches only), `walsh9/topiary`, `lindenmayer` (L-systems) | they grow 3D or skeletal trees; our crown is a designed species drawn as flat SVG (the study: "species drawn by hand, the generator only places and lights them") |
| facets, unions, clipping | our own (an icosphere for the far mode, Sutherland-Hodgman against convex cuts, ray-cast point-in-polygon, a convex hull: ~120 lines) | `d3-delaunay` 6.0.4 (ISC), `delaunator` 5.1.0 (ISC), `clipper2-ts` 2.0.1-18 (BSL-1.0, 2 MB), `polygon-clipping` 0.15.7 (MIT) | every clip here is a polygon against one convex region, and the cloud's union and soft steps are exact with circles (nonzero fill; a circle grown by d is the step d px out): a general boolean engine adds 0.3-2 MB for none of it |
| clouds | our own | `svg-clouds` (SVG feTurbulence filters), `Erkaman/cloud_gen` (C++, vector clouds, MIT, 2017), `a-type/clouds` (Three.js) | filters are blur and noise (rule 5: flat steps, never blur); the others are not JS/SVG |
No dependency added; `package.json` unchanged.

## 3. How each piece reads (the owner's "real, but low poly up close")
- **The crown** (`crownGeometry`; near plane): 8-11 clusters placed on the species' envelope (the London plane's broad,
  irregular dome on a 36 % clear trunk), plus a dark core behind them. Each cluster is an organic blob whose RIM IS
  LEAVES: an outer row of the species' own leaves (~70 % out past the mass, about a leaf apart, so each outline reads
  against what is behind it) and a tucked inner row (lace, never a saw). Inside, SIMPLE FACETS: one value per cluster
  from the crown's envelope (lit as ONE mass, the core darkest), a lit cap toward the key cut by a straight two-facet
  line, a hi facet on the 2 brightest clusters (a dab), a core crescent on the dark low ones. On the lit facets the
  light reveals the leaves: each rim leaf folded on its midrib (its key-facing half a step up, the other a half step)
  and a sprig or two of leaves inside the cap. In the shade the leaves merge into the mass. October: ~3.5 % of the
  outer, lit rim leaves turned gold or rust (the falling leaves are this tree's). Sky holes: leaf-bitten gaps in the
  true sky colour a step down, only where the sky is behind (`holesAbove`).
- **The trunk**: a tapered closed path, its shade side away from the key, the London plane's camouflage plates as
  same-hue patches (peach-cream, rose, soft sage on the lit side; two deeper ones in the shade: N5 b), the crown's own
  shade across its top in two flat steps; 3-4 limbs into the crown, under every cluster (a limb's end never pokes out).
- **The ladder** (N1): `plane` picks the mode: near (<= -1) species leaves, 5 tones; mid (0 ... +2) leaf bumps
  (11-18 px), 4 tones; far (+3, +4) 4-8 straight facets of a jittered icosahedron, 3 tones spread so they still step
  ~5 L* after the plane's air step (`recede`, then lib/water's `cleanColour` keeps them out of the olive band).
- **The spray** (`sprayGeometry`): a tapered branch, 2 twigs, ~10 leaves on stalks (>= 2.2 px), each leaf the full
  species template FOLDED along its five main veins (10 facets, each tilted toward its vein, toned by the key: the
  proteas' and banana leaves' fold), the midrib and two lateral veins as light tapered shapes (3 -> 2 px), 3 depths.
- **The cumulus** (`cumulusGeometry`): a union of circles (2-4 towers on a flat base, a row of low masses joining them,
  shoulders, lobes 3-8 % of the width along the top); inside, the body is the whole union moved toward the key (its
  shade a crescent along the edges facing away), a lit band on the lobes facing the key cut once by a straight facet,
  the flat base's shade as a wedge (thin under the lit side), and soft edges where it thins as 2 flat steps of 3.5 px
  toward the sky there (C2). It drifts as one translate (3 px/s), never reshaped.

## 4. API
(see §6 for the lane S wiring)

## 5. Checks and numbers (so far)
- **Lints** (`natureDemoProblems()` in the demo; the node runner bundles it with esbuild): foliage `[]`, wind `[]`,
  clouds `[]` after fixing what they caught (the crown's leaf tips at y 539 in the caption band, two demo trees in the
  right rail, far steps 3.3 L* after the air step, a far tone on the olive band's edge).
- **The crown, measured** (`nature_check.py still`, pro_3's own metrics, box 0 540 770 1030 of NatureFoliage @3.0 s):
  tones 36 / 45 / 53 / (57, a fold's half step) / 61 / 68 L*, shares 6 / 34 / 24 / 12 / 19 / 5 %, range 24.7 (<= 30),
  mean L* 51.9 (target ~52, N1 42-55), light vector 145 deg at strength 1.36 (the key's 3D vector projects to 143-152:
  within 10 deg), lighter at the top (r 0.65) and at the rim (+6.9 L* over the core: Gurney), roughness 1.66 (>= 1.3;
  posters 1.31-3.19; v2's sage tree 1.25), local contrast 2.45 (<= 9; calm: posters 6.7-12.6).
- **The wind, sampled over 7 s at 60 fps** (the demo's gust at 2.6 s included): crown 0.52 deg, cluster 1.8 px, leaf
  1.2 px / 2.9 deg: inside N7's ranges.

## 6. For lane S (wiring it into the scene)
(filled in at the end)
