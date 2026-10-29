# Painting recipe: water and reflections

**Status: in progress** (restarted run, 2026-10-29). The LOOK and RESEARCH sections are final; the per-element
recipes follow below as they are proven in code.

**What this is.** A step-by-step painting recipe for the water family, written so that a programmer, or our painter's
code (`scripts/look/paint/paint.py`), can follow it and get the references' quality: calm, subtle, beautiful, painted,
with depth. Five elements are covered: calm water mirroring a dusk sky, reflections of lit windows, the sun's glint
column, ripples and horizontal dashes, wet sand and wet paving (with a puddle), and wave and foam lines on a shore. A
seventh row applies everything to our own scene, the October canal evening at King's Cross with a low sun on the left.
The recipe is proven by `scripts/look/paint/recipes/water.py` (seeded, numpy + PIL + scipy), which paints each element
beside its reference crop in `water_swatch.png`.

**The owner's words this answers** (2026-10-29): "Why can’t you do the research yourself and come up with a concrete
detailed recipes to reproduce certain elements? Seems like you should be able to really clearly define a recipe"; "I
think we just need to brush it and perhaps draw them in layers a bit more blurry each time like look how this is done or
this" (`refs_paint/01`, `02`); "The drawing quality is not the same it needs to be a bit more subtle and more beautiful"
(the models: `refs_human_scale/03_beach_dusk.jpg`, `02_bus_stop_night.jpg`). The rule they made: `OWNER_PLAYBOOK.md`,
PAINTED PIECES. The flat water's own rules stay `CRAFT.md` §f.7 (`lib/water.tsx`): this recipe paints ON that design,
it never replaces it.

All sizes are frame px at 1080 x 1920 (the frame is 1080 wide). A reference measured in a frame W px wide is scaled
by 1080 / W. Values are CIE L* (0-100). "dL" is a step in L*.

---

## 1. LOOK: what the references do (measured)

Crops at full resolution: `/tmp/recipes/water/crops/` (scratch; the swatch sheet carries the ones that matter). The
measuring scripts: the same metric runs on the references and on our swatches (§8).

### 1.1 The one finding that matters most: calm base, few BOLD marks

| Reference (water area) | marks lighter by > 6 L* | marks darker by > 6 L* | calm base (local dL < 2.5) | texture in the calm base (high-pass std, L*) |
|---|---|---|---|---|
| refs_paint 02 lighthouse, near sea | 4.9 % of the area | 2.2 % | 79 % | 1.96 |
| refs_paint 02 lighthouse, far sea | 2.6 % | 4.1 % | 81 % | 1.76 |
| refs_paint 01 van, sea | 4.4 % | 3.7 % | 75 % | 1.69 |
| refs_human_scale 03 beach, wet sand | 0.6 % | 0.7 % | 93 % | 1.03 |
| refs_human_scale 03 beach, sea band (two foam lines) | 13.4 % | 16.9 % | 40 % | 2.60 |
| poster 07 Kyoto, pond reflection | 8.7 % | 8.9 % | 56 % | 2.15 |
| poster 01 Singapore, harbour | 9.0 % | 9.1 % | 57 % | 2.89 |
| **our try 3 (before this recipe), open water** | **0.3 %** | **0.1 %** | 96 % | 0.74 |
| **our try 3, near ripples** | **1.3 %** | **1.8 %** | 89 % | 1.28 |

The references' marks are few and **bold**: light marks are +11 to +22 L* over their base (lighthouse near +11, far
+18; van glints +20; beach foam +17; Cape Town flecks +22; Kyoto streaks +11), dark marks -10 to -15 L*. Between them
the water is a calm, softly graded base. Our earlier water inverted this: almost no real marks, and a fog of 2-4 L*
strokes over everything, which reads as a filter and as "lower drawing quality" (the playbook's "never an even streaky
texture"). **The recipe's first rule: the base is calm and designed; the marks are few, deliberate, and at least 8 L*
off the base.**

### 1.2 Per element

**Calm water mirroring a dusk sky** (`refs_human_scale/03`, `refs_paint/01`, `02`):
- *Silhouette:* the water is one horizontal band, cut by a dead-straight horizon line (or the far quay line). The
  brightest thing in it is a THIN line at the far edge: the sky's horizon glow seen at grazing angle (03: L* 75-88 in a
  16 px band, peach-gold #eaa98f / #f7d8ae, against a sea of L* 33).
- *Value structure:* 3-4 values. The far water is a clear step under its sky (03: horizon air L* 89 -> sea L* 33;
  van: 73 -> 38; lighthouse: sky 80 -> far sea 65 -> near sea 40). The water darkens toward us (lighthouse far 60 ->
  near 39 L*; Cape Town 54 -> 38), while its hue follows the sky it mirrors (far warm and light, near cooler and
  deeper).
- *Palette:* 4-6 colours per sea. 03's sea: #4a2751 L22, #583c78 L31, #73436b L35, #6b52a1 L41, plus the foam lilac
  and one pink light #daa7a5. The lighthouse near sea: #214a67 L30, #3b6380 L40, #4f7390 L47, #83807f L54 (the rocks'
  reflection).
- *Strokes:* long horizontal runs. The gradient across rows is 2-7 x the gradient along them (dL/dy : dL/dx = 2.4
  near and 1.1 far in the lighthouse, 5.2 in 03, 3.3 in the van). Far: a FEW long thin lines, 1-2 px tall and
  60-250 px long, and short dark dashes 5-23 px long and 2-5 px tall, sparse (lighthouse far sea: ~10 dashes in the
  whole band). The base itself has a faint horizontal dry-brush grain (lighthouse, far sea), never stroke noise.
- *Edges:* the horizon line is crisp (one step, 1 px ramp). The marks are crisp, flat and opaque (gouache-like), with
  square or one-side tapered ends. The underpainting between them is soft.
- *Depth:* farther = lighter, warmer, calmer, finer marks; nearer = darker, cooler, bigger and more contrasting marks.

**Reflections of lit windows and facades** (poster 07 Kyoto pond, 03 Hanoi near water, 01 Singapore):
- The reflection is an almost exact MIRROR of the thing about its own waterline, a little darker, duller and lower in
  contrast (Kyoto pavilion: source L* 9-90, its reflection L* 29-82). It reads as one solid image first.
- It is cut by thin horizontal light lines (1.8-3 px tall, 7-20 px p50 and up to 250 px long, +11 L*): the facets
  that face the high sky. They multiply toward the far end of the reflection, where it breaks into bars and is lost.
- Verticals survive, horizontals dissolve: Hanoi's red posts reflect as soft vertical streaks fading down; Kyoto's
  verticals zig-zag a few px.
- Lights reflect as columns, longer than the light, softer, keeping their hue.

**The sun's glint column** (03; physics: §2):
- 03's sun disc is 17 px across at 1080 (19 px in 1206). Under it the sea carries a SOFT column: +10-12 L* over the
  sea just under the horizon, 103-107 px wide (FWHM), then on the wet sand a narrower one (30-45 px FWHM), +4-6 L*.
  Its hue at the peak is rose-magenta (h 312-333), not gold: the sun's colour mixed with the sea's. It is a glow, with
  almost no dashes, and the foam lines run across it unbroken.
- The brightest bit is a merged short line right under the sun at the horizon.

**Ripples and horizontal dashes** (`refs_paint/02` near sea, the clearest method reference):
- The base is mid blue (#3b6380, L* 40) with a soft darker wash low left. On it: flat, opaque, crisp-edged dashes in
  2-3 values only: lighter (+11 L*), darker (-10 L*), and near the rocks their ochre reflection.
- Sizes at 1080: light dashes 15 px long (p50), 31 px (p90), 4.6 px tall (p50), 9 px (p90); dark dashes 14/33 px
  long, 3.4/8 px tall. Long runs reach 92-196 px (p90-p98 of the run lengths). Aspect 3-4 : 1.
- They cluster: 61 dashes in the top third of the band, 22 in the bottom third; whole patches stay calm. A dark dash
  often sits right under a light one (a facet's lit back and its shade).
- Ends: square or slightly tapered on one side, never rounded blobs; never combed.

**Wet sand and wet paving** (`refs_paint/01` van, 03 beach, 02 bus stop):
- Wet sand is a mirror of the sky ABOVE it, a step under it. Under a light pink sky it is the LIGHTEST ground (van: L*
  60-72, #cda7b4 / #e6afb8, lighter than the sea at 38); under a dark violet sky it is dark (03: L* 23-30). Its value
  structure is soft horizontal bands of the sky's own layers (pink, lilac cloud, peach), blurred strongly ALONG the
  ground and little across it (03 wet sand: dL/dy : dL/dx = 7.0, calm 93 %).
- Things on it reflect short, soft and dark: the van's rocks reflect as dark soft shapes half their height or less,
  straight below, a little lighter than the rock, a dark contact line right under it. 03's walking legs reflect as
  soft vertical darker streaks.
- Pools and puddles are crisp-edged irregular shapes that mirror a brighter, higher sky (van pools: near white lilac,
  L* 85-100), so they are lighter than the wet ground around them.
- Wet paving at night (bus stop): a dark field lit by the light source, its reflection a soft VERTICAL smear of the
  light below the source (blurred strongly down, little across).

**Wave and foam lines on a shore** (03, the owner's favourite; van shore):
- 2-3 foam lines along the shore, dead horizontal, gently undulating. The foam is NOT white: it is lit by the sky
  (03: periwinkle #6b52a1 / #9566b0, L* 41-51 in a sea of 22-35; its brightest tops pink-lilac #daa7a5, L* 73, 2 % of
  the area). Light foam marks: +17 L* over the sea, 10 px long (p50), 60 px (p90), and only 1.8 px tall (p50), 4.7 px
  (p90): foam is made of MANY THIN marks grouped along a line, not of thick blobs.
- Each foam mass: a crisp top edge, a flat bottom edge, a few curled strokes inside (the curl), and a darker wave face
  just below it. Between the foam lines the sea is long, straight, thin bands of rose-violet and plum, crisp-edged.
- On the sand: the swash, thin lacy light lines (van: 1.9 px tall, 9-26 px long, +18 L*), and the wet/dry boundary
  as a crisp line in places.

**Texture:** the painted references have a faint grain or dry-brush tooth in the base (lighthouse: fine vertical ticks
in horizontal rows; posters: a paper grain), at a high-pass std of 1-2 L*. No speckle on calm water. Speckle only
where the paint is near and rough (foam spray, Cape Town's sea flecks at 2-7 px).

---

## 2. RESEARCH: how painters do it (sources)

1. **Value rule of reflections** (J. Gurney, *Water reflections part 1*,
   <https://gurneyjourney.blogspot.com/2007/12/water-reflections-part-1.html>): light tones above the water appear a
   little darker in the reflection, because some light enters the water instead of bouncing off; darker objects may be
   lighter in their reflection. Reflections are duller than the original colour (the same rule in
   <https://watercolourworkout.substack.com/p/two-for-one>).
2. **Ripples and vertical lines** (J. Gurney, *Water reflections part 2*, quoting Ruskin and M. Pollock's *Light and
   Water*, 1903, <https://gurneyjourney.blogspot.com/2007/12/water-reflections-part-2.html>; and *Reflections on gently
   rippled water*, <https://gurneyjourney.blogspot.com/2013/08/reflections-on-gently-rippled-water.html>): tiny waves
   dissolve horizontal lines and keep vertical ones; "all motion in water elongates reflections, and throws them into
   confused vertical lines"; distant gentle movement stretches upright lines down, while near ripples, seen one by
   one, break a reflection up horizontally.
3. **Viewing angle (Fresnel)** (J. Gurney, *Reflectivity and viewing angle*,
   <https://gurneyjourney.blogspot.com/2011/06/reflectivity-and-viewing-angle.html>; the physics in the Unity manual,
   <https://docs.unity3d.com/Manual/StandardShaderFresnel.html>): looking across water you see mostly reflection (the
   sky); looking steeply down you see into it. So far water mirrors the sky and is light; near water shows its body and
   is darker.
4. **The glitter path** (Lynch, Dearborn and Lock, *Glitter and glints on water*, Applied Optics 2011, via NASA Earth
   Observatory, <https://earthobservatory.nasa.gov/blogs/earthmatters/2016/11/09/ground-to-space-a-glittering-path-of-san-francisco-sunglint/>;
   J. Gurney, *Moon reflections on a calm sea*, <https://gurneyjourney.blogspot.com/2014/04/moon-reflections-on-calm-sea.html>):
   the path is many tilted facets, each a tiny mirror; it lies in the vertical plane through the sun and the eye; with a
   low sun it narrows to a vertical stripe about the sun's width; rougher water makes it wider and longer.
5. **Wet sand is a mirror** (<https://paintingwithwatercolors.com/painting-walking-figures-on-wet-sand-with-watercolor>,
   <https://www.paintingwithwatercolors.com/painting-the-sand-of-our-beach-watercolor-landscape/>): a thin film of water
   over sand is a good mirror, so match its value to the sky it reflects; reflections are a tad darker, lower in
   contrast, with no sharp edges and little detail; a reflection starts sharp at its base and softens as it spreads;
   the sand-water edge is never one straight line.
6. **Painting order and layers in background art** (J. Gurney, *Layers in animation background painting*,
   <https://gurneyjourney.blogspot.com/2021/09/layers-in-animation-background-painting.html>; gouache water,
   <https://thevirtualinstructor.com/members/painting-water-with-gouache>): backgrounds are painted in layers, big
   shapes blocked in first, detail last; in gouache the base reflection goes in as a wet wash, then the ripple lines
   are laid horizontally on the dry base with a small brush, sparingly ("not overdoing them"); gouache's opacity lets
   light marks go over dark.
7. **Foam** (watercolour and acrylic seascape guides: <https://watercolourworkout.substack.com/p/making-waves>,
   <https://ehow.com/how_8162410_paint-sea-foam-acrylics.html>,
   <https://stepbysteppainting.net/2022/04/13/how-to-paint-a-beach-acrylic-painting-tutorial/>): foam gets a hint of
   the sky's colour in its white; never a solid block of one colour, let flecks of the water show through; dry-brush it
   over the shade without covering the shade; on the sand it makes a lace-like web.
8. **Atmospheric perspective** (Mont Marte, *8 tips for background painting*,
   <https://montmarte.com.au/blogs/tips-techniques/8-tips-for-background-painting>; the same rule in every source
   above): far planes lighter, cooler and softer, the foreground darkest, most contrasting and sharpest; start from a
   limited palette.

(Web pages could only be read through search summaries in this session: the hosts are outside its allowed network.)
