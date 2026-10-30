# Painted pieces in our engine: the scene-1 still (iteration, 2026-10-29)

**The ask** (owner, 2026-10-29): "I really like the “painted” pieces like the sky and the clouds the references or some
foreground buildings and trees / greenery are uniquely painted / Is it possible to modify our engine to match the
story? Style"; then "modifying our engine to be able to do that"; then "Again let’s start with stills". The rule:
playbook PAINTED PIECES, DIRECTION rule 4. **The answer: yes.** The engine now has an opt-in paint pass
(`src/lib/paint/` + `scripts/look/paint/paint.py`), shown here on v2's shipped S1 at 1.0 s ("She quit Google."). It is
an iteration, judged by the owner on the still before any motion.

| File | What |
|---|---|
| `paint_still.png` (= `deliverables/tests/painted_scene1_still_v1.png`) | v2's S1 at 1.0 s, 1080 x 1920, five pieces painted: the sky, the hero cumulus, the thin cloud bar, the bay tree, the stone pier (bottom right) |
| `compare.jpg` | 1 v2's S1 as shipped (flat), 2 the paint still, 3 the 9:16 motion reference, 4 the Cape Town poster; 400 px each |

Crisp and never painted: her (teal), the people, the wing and its lit door, Pip, the captions, everything else.
`PaintS1` with `paint: false` renders v2's S1 unchanged (mean difference 3.6/255 against the shipped baseline JPEG, which is
JPEG noise), so the film still works with the paint off.

## The method, and why

The pros paint backgrounds as separate layers and put crisp characters on top. We do the same: each painted piece is its
own layer, painted once from a seed, and placed back in its own slot. We do not run one filter over the whole frame.

1. **Flat input.** The film's entry renders each piece's flat shapes alone on a transparent frame (`PaintFlatS1`, built
   on `lib/paint` `<PaintBakeFrame>`). It uses the same tier, light rig and switches as the scene, so the painter starts
   from the exact silhouette, tier colours and shade steps the film shows (`out/paint/v2s1/flat/*.png`).
2. **Paint** (`paint.py`, numpy + OpenCV, both already used by our QA scripts). A Hertzmann-style painter, big brush to
   small:
   - a ragged base wash;
   - bristle-stamp strokes with dry-brush streaks and broken tapers, run along a flow field set by the style;
   - each stroke takes its colour from a target field and stays inside its own flat region, so the design survives;
   - small strokes go only where the canvas still differs from the target;
   - then specks (spatter, grit, light on the leaves) and a fine grain.

   The target field is where "colour moving within a shape" comes from:
   - the flat colour;
   - plus a lit side that is warmer and lighter, toward the rig's key (the low western sun);
   - plus a shade side that is cooler and deeper;
   - plus a slow drift of hue and value.

   Styles:
   - `sky`: long, low-contrast horizontal strokes over the S1_EVENING gradient, calmed to about 25 % inside the caption
     band (y 290-600);
   - `cloud`: built from lobes alone. Strokes curl along the billows near the edge and follow the wind inside. Each billow
     is lit from the upper left, with a warm glowing rim and a spatter of flecks, and the base dissolves above the band;
   - `foliage`: leaf dabs in clusters;
   - `surface`: broad plaster strokes along an angle, straight edges, grit.

   The output is one RGBA PNG per piece in `public/paint/v2s1/`, plus `manifest.json` with each piece's box and seed.
3. **Placement** (`lib/paint` `<PaintedLayer piece from>`). The PNG is drawn as an SVG `<image>` exactly where the flat
   shapes were, inside its plane's group, so it rides that plane's float. Before `from` (its flood time) and with the
   paint off, the flat shapes are drawn instead. `usePainted()` turns off the light layers the paint took over (the
   crown's crescent, the pier's two Shade steps), so nothing is drawn twice.

**Checked:**
- **Locked to its layer.** From 1.0 to 3.0 s (the float), the painted tree and the pier move (-5, -7) px, the same as
  the flat planter beside them. The painted cloud moves (0, 0): the sky never floats.
- **Deterministic.** Two bakes give the same file (md5).
- **Caption band calm.** At 1.0 s, about 18 % of the frame's pixels differ from v2's by more than 3/255. In the
  caption text's rows (y 330-480) the most any pixel changes is 3/255 (mean 0.6): only the sky's calmed strokes. The
  cloud's soft base ends above y 290. The ink's contrast is unchanged.

**Why this route:**
- Strokes only look painted if they are real strokes, with a direction, bristles and a broken end, and if they follow
  the piece's own form and light. A filter adds noise. It does not add strokes.
- Baking once costs nothing per frame.
- The PNG cannot swim, because it is one image in one group.
- The seed makes "each piece painted for its place" literal: a new seed gives a new painting of the same shapes.

## Libraries and methods considered (about 20 min; one route built)

- **p5.brush** (MIT): good natural brushes and watercolour bleed. Not installed. It needs p5 in WEBGL mode, either at
  render time or in a second headless bake. It paints from its own primitives, not from our flat silhouette, tier
  colours and rig shades. It would add a new runtime and dependency for something numpy and cv2 already do under our
  control. Revisit only if the owner wants a wet watercolour bleed.
- **A WebGL shader** (anisotropic Kuwahara, watercolour edge darkening, granulation): it is a post-filter. It flattens a
  layer into blobs rather than adding strokes, and it reads as "filtered". It also needs the SVG layer rasterised into
  a texture in the browser on every frame. Rejected.
- **SVG feTurbulence + feDisplacementMap** (with our `lib/texture` Mottle): live, per group and seeded. But Chrome
  re-rasterises a filtered group on every frame, the displacement resamples it, and it reads as a wobble, not as
  brushwork. Too weak alone, as the brief guessed. It is kept for later as the tool for a cloud's slow churn, displacing
  the baked image a few px. Mottle stays the very subtle grain for the flat world.
- **Stroke-based painterly rendering in Python** (Hertzmann): **built** (`paint.py`, about 610 lines, no new dependency).

## How a production film would use it

```tsx
// W1 / G3: choose a few pieces per exterior shot (the sky + clouds, one tree or greenery mass, one near building),
//          never the subject, people, Pip or captions. G4: judge the dose in the look clip. G5/G6 (polish, after the
//          shapes lock): bake; re-bake on any shape change (seconds).
// 1. the bake input, in the film's entry: one composition per piece, its flat shapes in their contexts
<Composition id="PaintFlat" component={PaintFlat} defaultProps={{piece: 'tree'}} ... />   // <PaintBakeFrame>{...}
// 2. the spec, scripts/look/paint/<film>.json, one row per piece:
//    {id: '<film>/tree', style: 'foliage'|'surface'|'sky'|'cloud', seed, flat: 'out/paint/<film>/flat/tree.png'
//     | lobes: [[x, y, r], ...] + box, light: [dx, dy] (toward the key), palette/warm/cool/drift/angle/tau...}
// 3. bash scripts/look/paint/bake_<film>.sh   ->  public/paint/<film>/*.png + manifest.json
// 4. in the scene (src/look/paint_s1 is the worked example):
import {PaintProvider, PaintedLayer, paintSet, usePainted} from '../../lib/paint';
import manifest from '../../../public/paint/<film>/manifest.json';
const PAINT = paintSet(manifest);                      // {sky, cloud, tree, pier, ...}
<PaintProvider on>{film}</PaintProvider>               // off (the default) = the flat film; only={['tree']} for A/Bs
<S1Plane plane={S1_PLANE.near}>                        // the piece's own plane group: it rides the float
  <PaintedLayer piece={PAINT.tree} from={floodAt(120, 1390)}>{flatTree}</PaintedLayer>
</S1Plane>
{usePainted(PAINT.tree, from) ? null : <TreeCrescent />}  // a light layer the paint took over
// motion, later (not built; the pieces are already their own layers):
//   <PaintedLayer piece={PAINT.cloud} drift={[2, 0]} churn={{px: 4, cell: 90, speed: 0.15}} />  slow displacement
//   <PaintedLayer piece={PAINT.tree} sway={{pivot: [126, 1420], deg: 0.6, period: 3.7}} />          rotate about the trunk
```

**Cost:**
- **Bake:** 11 s on one CPU for S1's five pieces: the full-frame sky 8.8 s (4,946 strokes), the cloud 0.9 s, the bar
  0.1 s, the tree 0.4 s, the pier 0.5 s. Add about 3 s per flat input render (cached bundle).
- **Render:** five `<image>` draws per frame. Measured at 1.51 s/frame painted against 1.45 s/frame flat (2 frames each,
  including page setup, concurrency 2), which is inside the noise.
- **Size:** the PNGs total 1.3 MB (the sky 0.88 MB). They load through `delayRender`, so a frame never captures before
  its paint.

## Weak spots I see

- **The dose is low for the references.** At phone size the cloud and the tree read as painted. The sky's strokes, and
  most of the pier's, show only at full size. The motion reference's cloud is far bolder and more saturated. The next
  round should push the value range and stroke size on the hero cloud only.
- **The painted crown is paler than v2's flat one.** The strokes average away its dark inner lobes and its underside, and
  the crown's rim is a little hairy at 100 %.
- **The cloud is calm, not yet "glowing".** Its lit rim is only one step lighter than the band. A real glow needs a warmer
  sky behind it or a soft painted haze, and both touch rule 6's calm sky.
- **The hero cloud is a new shape** (lobes), not v2's kit cloud. It is static, while v2's cloud drifts 2 px/s. Drift and
  churn wait for the still's approval.
- **The painted pieces are rasters**, which brings four limits:
  - they don't relight with a `tod` key;
  - they land as one shape at their flood time, not shape by shape;
  - they have no exit or un-build of their own (the loop's un-build would need one);
  - a zoom above about 1.2x softens them, so shots with a push need a bake at 1.5-2x.
- **The sky PNG is 8-bit with stroke dither.** It has not been through `check_banding.py` or the master encode yet.
- **Flat input times are hand-picked** (1.0 s, after the flood). A shape that animates (a pane switching on, a wiper)
  must stay out of a painted piece, or it needs a bake per state.

## v2: the bold dose (2026-10-29: "obvious at 400 px wide")
- **`paint_still_v2.png`** (= `deliverables/tests/painted_scene1_still_v2.png`; `compare_v2.jpg`: flat, v1, v2, the motion reference): the same engine, a second bake (`scripts/look/paint/v2s1_v2.json` -> `public/paint/v2s1_v2/`), chosen with `PaintS1 set: 'v2'`; v1 still renders unchanged (max difference 0). `PaintProvider set` + `PaintedLayer piece="tree"` (pieces by name) let one scene carry several doses.
- **Sky:** bigger, more opaque strokes (r up to 72 px, a dry pass), warmer and more golden toward the sun, cooler and bluer up top. The paint calms in the band: on the caption's words (x 150-800, y 330-480) the most any pixel changes is 10/255 (mean 3.3).
- **Cumulus:** towers on the right beside the words (from x 849, never behind them). It has a lit golden-peach top and a rose-violet shade, a painted glow haze on its lit side, dry-brush edges and about 280 specks. **Tree:** 18 painted leaf clusters, each lit on the sun's side, with a deep shade side; richer than v2, not paler (mean luma 148 against v2's 173, value spread 33 against 19).
- **Two more pieces:** the far roofs and the calm tower as a soft painted haze, each on its own plane (+4, +3), with the sun disc left crisp; and the fern pot at the bottom edge. About 40 % of the frame's pixels change; she, the people, the door, the "Google" sign, Pip and the captions are untouched.
- **Weak spots of v2:**
  - the far roofs read a little muddy-pink;
  - the cloud's shade side is more pink than violet;
  - the tower must clear the widest caption line (v2's 3.0 s line reaches about x 900), so a film needs a calm box per caption page;
  - bake 14 s, 2.2 MB of PNGs; the render cost is unchanged.


## The owner's verdict on paint_still_v2 (2026-10-29)
"The drawing quality is not the same it needs to be a bit more subtle and more beautiful / Also I like the drawing
style in these two more" (with `refs_human_scale/03_beach_dusk.jpg` and `02_bus_stop_night.jpg`).
-> paint v3: the painter restyled toward those two (big simple masses, few broad deliberate strokes, soft dry-brush
edges, calm areas, one colour family and one light), never an even streaky texture.
Then: "And again even clouds have layers that give a sense of depth but yours do not" -> v3: 2-4 overlapping cloud
planes, far banks paler, cooler, simpler and flatter toward the horizon (a layered-cloudscape style in the painter).

## v3: the broad brush and a layered sky (the owner: "more subtle and more beautiful", the models 03_beach_dusk and 02_bus_stop_night; "even clouds have layers that give a sense of depth")
- **The outputs:** `paint_still_v3.png` (= `deliverables/tests/painted_scene1_still_v3.png`) and `compare_v3.jpg` (v2, v3, both models). Same base and same engine; set `v3` = `scripts/look/paint/v2s1_v3.json` -> `public/paint/v2s1_v3/`. v1 and v2 still render unchanged (max difference 0).
- **The painter gains `"brush": "broad"`** for every style:
  - a mass is a few flat, broad strokes of flat-brush stamps (an even core, soft sides, a dry tail), and its strokes stay inside their own value mass;
  - its rim breaks up in a dragged, dry scumble along the brush, with a speckle dissolve on the side away from the light;
  - the inside is calm;
  - one light gives 2-3 flat masses in the sky's own colour family.
- **The painter gains `"style": "cloudscape"`** (lib/paint `<PaintedGroup group="clouds">`): one image per cloud plane, far to near. **S1 has 4 planes:**
  - **near** (depth 0): the big cumulus with its tower beside the captions. Full form: 3 masses, a warm rim on the side facing the low sun, the most strokes, 12 px dry edges and specks.
  - **0.45:** a paler, flatter bank (0.6) behind it, top left. It moves 38 % of the way to the sky's colour and keeps the masses but gets fewer strokes and softer edges.
  - **0.7:** a flat, thin deck (0.42) low in the west gap. It moves 55 % of the way to the sky's colour and keeps only 2 masses.
  - **0.92:** six long, thin, lit level streaks along the sun's line, behind the sun disc.
  - Each nearer edge sits on the farther plane with a 14 px band of lighter air (the sky's value +0.03 L).
- **Readings:**
  - **Sky:** smooth, with a faint diagonal stroke texture at about 1 % of its value, warmer by the sun.
  - **Captions:** on the words (x 150-800, y 330-480) the most any pixel changes is 6/255, and the cloud stands only right of x 849.
  - **Tree:** 9 broad clusters in a lit and a shade mass, with the trunk's edge kept clean; darker than v2's flat (luma 159 against 173) and with more value spread (30 against 19).
  - **Far city:** the roofs and the tower stay a soft haze.
  - **Fern pot:** dropped (back to flat).
  - About 31 % of the frame's pixels change. The bake takes 23 s.
- **Weak spots of v3:**
  - the near cumulus is so pale and tone-on-tone that at 400 px it reads mostly as a light mass, with its form carried only by the warm rim and the soft shade on the right;
  - a few shade patches on the tower's right edge still read as round lobes;
  - the tree's edge is still a little combed;
  - the mid bank (0.45) hides partly behind the leaf branch;
  - nothing has been checked in motion yet (each plane is its own image, ready to drift at its depth).

## v4: design the shapes first, then paint them (the playbook's "forest before the trees")
- **The outputs:** `stage_v4_design.png` (the flat design in the scene), `paint_still_v4.png` (= `deliverables/tests/painted_scene1_still_v4.png`) and `compare_v4.jpg` (v2, v3, the design, v4, both models). The spec is `scripts/look/paint/v2s1_v4.json`. `paint.py --design` writes the flat design (set `v4design`) and plain `paint.py` paints the same shapes (set `v4`). v1-v3 still render unchanged.
- **The engine gains `"style": "designed"`: designed shapes in, paint out.**
  - Each plane is a set of hand-placed billows `[x, y, r, flat, accent]` plus a flat base line.
  - ONE form per cloud: a lit band follows the whole outline on the light's side (`lit_px`), then a mid band (`mid_px`), then one big shade mass and a shade underside (`under_px`).
  - Only the accent billows get their own lit cap inside, for depth.
  - The paint keeps those masses. Edges are firm where they face the light and soft and dry-broken on the shade side, as patches and dry strokes along the edge, never combs. A few broad strokes go inside each mass along its billow, and nothing is smudged or greyed.
  - The sky is a designed gradient (`gradient` stops + the sun's warmth) with a faint diagonal stroke texture.
- **Colour, one dusk family lit by the low sun on the left:**
  - the sky runs lavender-blue at the top, rose-lilac through the caption band and peach-gold at the horizon;
  - the clouds are gold on the lit tops, peach in the mid band and lilac-violet on the shade sides;
  - the words' background stays light (luma 204 against the ink's 32).
- **The 4 designed cloud planes:**
  - **near** (depth 0): the cumulus, 9 billows, one accent, full value range;
  - **0.4:** a flatter bank (0.55), 7 billows, 42 % of the way to the sky's colour, narrower bands;
  - **0.7:** a thin low deck (0.38) in the west gap, 60 % of the way to the sky's colour;
  - **0.9:** five lit streaks on the sun's line.
  - Each nearer edge leaves a 12 px band of lighter air on the plane behind it.
- **The tree:** one designed lit mass on the sun's side and one shade mass, one accent lobe, and the trunk kept crisp from the flat.
- **Weak spots:**
  - the paint changes only 2.6 % of the design's pixels (mostly the shade-side edges), so the strokes inside the masses are still faint;
  - the accent billow and the tree's lit band read a little graphic (crescent-like);
  - the water stays v2's mint under the new dusk sky;
  - the caption band is a gentle lilac-to-rose ramp (spread 4.9), not flat.


## The owner's verdict on paint_still_v4 (2026-10-29)
"Wait but this is actually not bad like it’s not there but we are getting there" (seen at phone size, in compare_v4).
-> v5 keeps the design-first method and the dusk family; fixes the crescent shapes; puts the whole scene under one
evening light (water and paving tinted by the dusk); paint a little more visible on cloud edges and inside the cumulus.

## v5: true billows, one evening light, and the owner's layered-brush recipe ("brush it and perhaps draw them in layers a bit more blurry each time"; refs_paint/)
- **The outputs:** `paint_still_v5.png` (= `deliverables/tests/painted_scene1_still_v5.png`) and `compare_v5.jpg` (v4, v5, refs_paint 01 and 02). The spec is `scripts/look/paint/v2s1_v5.json` (set `v5`), v4's design-first method; v1-v4 still render unchanged.
- **No crescents:** the new `light_mode: "cap"` draws each billow back to front, with a lit top over a curved terminator (lower on the sun's side), a mid band and a shade underside. The front lobes overlap the ones behind. The near cumulus has 14 lobes and the tree has 9 leaf masses; the accent caps and the giant top-right billow are gone.
- **The layered brush** (`"brush": "layered"`):
  - a LIMITED PALETTE of 14 swatches (`palette` in the spec). Every stroke takes one, or a neighbour of the same family;
  - three passes per mass: big soft strokes blurred as the underpainting (6 px + 6 x depth), mid flat chisel strokes (along the form near the edge, along the wind inside), and a few small crisp strokes only at the light edges and the lit terminator;
  - the plane blurred by its depth (3.2 px x depth; the streaks 1.0 px, the far roofs 2.2 px, the tower 1.6 px);
  - speckle only on the near masses;
  - 4 hand-placed broad strokes inside the near cumulus.
  - **Water** (`style: "water"`): the flat water as the underpainting, then horizontal dashes from the palette, shorter and thinner far and longer near, gold under the sun.
- **One evening light** (`src/look/paint_s1/dusk.tsx`, set `v5` only; src/v2r untouched):
  - the canal turns lavender with rose and peach reflections and a gold glint (a colour matrix fitted to the dusk sky, then the painted dashes);
  - a lilac shadow family in the rig;
  - a soft-light wash: peach toward the sun on the left, lilac away from it, over the paving and the near things;
  - the facade's lit side a touch warmer.
  - She, the door, the sign, Pip and the captions are drawn untouched, and the words' background stays light (luma 205 against the ink's 32).
- **Weak spots:**
  - the near cumulus's lit top is large and rather yellow, and its shade underside thin;
  - the tree reads pale yellow-green;
  - the water's lavender is strong, and the far towpath's waterline is still a mint stripe;
  - the soft-light washes are screen-space rectangles: in motion they would have to ride their planes;
  - the paint is still subtle inside the masses at 400 px.


## v6: the recipe book in the engine (iteration, 2026-10-30; `PAINT_RECIPES.md` §4; outputs `paint_still_v6.png` = `deliverables/tests/painted_scene1_still_v6.png`, `compare_v6.jpg`, `skytop_v6_choice.jpg`; spec `scripts/look/paint/v2s1_v6.json` + `v2s1_v6b.json`, set `v6`, bake = `bake_v2s1.sh`'s v6 lines)
- **From the book:** paint.py's v6 block imports the four recipe scripts as five styles (`sky_recipe`, `cloud_planes`, `water_recipe` = E7 with keys on OUR design frame, `tree_recipe`, `far_city_recipe`) + `flock_sprite`; `atmos_np` = lib/depth `atmos` (node check, brick/sage/lilac at k .22/.40/.65: worst 0.5 dE); §3 C1 k ladder, C5 one light table, C6 the sky's disc only, C11 caps, C13 PCHIP, C16 sha256 seeds, C18 one warmth field; D2 the flock is its own layer in the particle slot (never baked), D3 far city in CRAFT's caps (+3 spread 10.2 dE, +4 dE 2.1 to the air, spread 4.1), D4 the water fed from the sky set, D5 no `FO.converge` (near k 0, a -5 L* near step).
- **Scene 1:** the sky (gradient, hatch, 4 streak rows, CRAFT's pale disc, raised to y 752 so the roofs half-cut it instead of hiding it), 3 cloud planes (far deck +3, mid bank +2, near cumulus 0, their shade and deep a step deeper: #9d8fb9 / #806d9e), the canal, the tree, the far roofs (+4) and tower (+3), a pale flock low by the sun; the paving, pier, bridge and facade stay the film's flat (book §4.1). Two bakes give the same md5; the bake is 19 s on one core (the sky alone 10 s, over the 15 s target).
- **Real darks** (set v6 = the scene's `darks` switch + the painted darks + `v6Rig`, a lilac-plum shadow family a step deeper): L* < 40 on 7.2 % of the frame in 433 pieces (the largest 0.6 %), against v5 1.9 % and ai_still_v1 1.9 %; median L* 67 (v5 83, AI 81), p5 33 (v5 62), p2-p98 range 64 L*. The refs are low-key: 03 median 34 with 67 % under L* 40, 02 median 21 with 83 %; we stay far above them because the caption field and sky stay light (rows 0-600: 0-3 % darks, the 3 % being the ink).
- **The caption band** stays calm: on the words' rows (x 150-800, y 317-556, captions off) the p2-p98 spread is 1.29 L* (<= 1.5), mean L* 81.9; the darks sit at y 600-1320 (10-16 % of those rows) and in the near frame (6 %).
- **Water:** the ladder deepened per plane (`ladder_dL`: mid -12, near -18, deep -24): the horizon step is now 23 L* (sky 89 -> the canal's far water 66) and 34 to the near canal (the recipe's 15; the refs 30-50); marks 8.4 % (light 3.7, dark 4.7), calm 79 %, tooth 1.71 (`mark_metric`, all in range).
- **Her:** `src/lib/figure` in profile walking west at her place in the doorway, with the new optional `FigurePose.tune` (slim 0.88; the hem at -335, above the knee, so the legs act; a 300-unit scarf end tapering 13 -> 3.5); the low sun as the key (a warm rim on her front) and the lit door as a local light on her back (a light-teal edge against the door's dark frame). The door, the sign, Pip and the captions are untouched; the tree's silhouette edge measures ~1.6 px.
- **Weak spots:** the paving is one big flat terracotta field at phone size (the book's next recipe, §4.5); the pale disc barely reads at 400 px (CRAFT §g.2, by rule); the cumulus is smaller than v5's and keeps a few level-block rectangles at 1:1; the mid bank is one slab; the far flats were already hazed by the film, so +4 lands near its air; her back edge is lit teal-on-teal, warm only in hue; the water's left third mirrors a little busy.

## The owner's verdict on paint_still_v6 and the difference list (2026-10-30)
"All you hit all your points correctly / I see what you mean by point 4 - it is weird looking tree we have on the
forefront like it doesn’t fit the style there, while AI generated cloud certainly fits / Our point 8 I’d also true - our
scene is very busy".
-> The foreground tree (a lone painted object among flat vector pieces) reads pasted in: one painted language for the
whole frame, near pieces sharper but in the SAME language, never one painted object in a flat world. The AI cloud's
finish is the bar for clouds. Scene 1 is too busy: fewer props, a few value masses, one focal point (ORGANIC.md and the
composition study, in progress, feed v7).
