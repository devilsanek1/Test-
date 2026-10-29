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

