# Painting recipe: water and reflections

**Status: proven in code** (2026-10-29): `scripts/look/paint/recipes/water.py` paints every element below in our own
scene's light, beside the reference crop that shows it: `water_swatch.png` (1600 px wide). How close it gets, honestly:
§9. A study for the engine's paint pass (playbook PAINTED PIECES); nothing in the film uses it yet.

**What this is.** A step-by-step painting recipe for the water family, written so that a programmer, or our painter's
code (`scripts/look/paint/paint.py`), can follow it and get the references' quality: calm, subtle, painted, with
depth. Six elements: (E1) calm water mirroring a dusk sky, (E2) reflections of lit windows, (E3) the sun's glint
column, (E4) small ripples and horizontal dashes, (E5) wet sand and wet paving, (E6) gentle waves and foam lines on a
shore. A seventh row (E7) applies all of it to our own scene, the October canal evening at King's Cross with a low
sun on the left.

**The owner's words this answers** (2026-10-29):
- "Why can’t you do the research yourself and come up with a concrete detailed recipes to reproduce certain elements?
  Seems like you should be able to really clearly define a recipe";
- "I think we just need to brush it and perhaps draw them in layers a bit more blurry each time like look how this is
  done or this" (`refs_paint/01`, `02`);
- "The drawing quality is not the same it needs to be a bit more subtle and more beautiful" (the models:
  `refs_human_scale/03_beach_dusk.jpg`, `02_bus_stop_night.jpg`).

The rule these made is the playbook's PAINTED PIECES. The flat water's own rules stay in `CRAFT.md` §f.7
(`lib/water.tsx`): this recipe paints ON that design and never replaces it.

**How to read it.**
- Sizes are frame px at 1080 x 1920 (the frame is 1080 wide). A reference measured in a frame W px wide is scaled by
  1080 / W.
- Values are CIE L* (0-100), and "dL" is a step in L*.
- "s" is perspective depth: 0 is the far waterline, 1 is the near edge of the water.
- Each recipe names the function and parameters in `water.py` that do it.

**Contents.**
- §1 LOOK: what the references do, measured.
- §2 RESEARCH: the sources.
- §3 THE ONE RULE.
- §4 the palette.
- §5 the shared water body: design, passes, edges, depth.
- §6 the elements E1-E7: design, passes, edges, depth and mistakes per element.
- §7 mistakes to avoid: everything our tries got wrong.
- §8 the implementation spec for numpy/PIL.
- §9 the proof, and how close it gets.

---

## 1. LOOK: what the references do (measured)

Crops at full resolution: `/tmp/recipes/water/crops/` (scratch). The sheet carries the ones that matter. The same
metric (§8.7) runs on the references and on our swatches.

### 1.1 The finding that matters most: a calm base and a few BOLD marks

| Water area | Marks > 6 L* lighter | Marks > 6 L* darker | Calm base (local dL < 2.5) | Texture in the calm base (high-pass std, L*) |
|---|---|---|---|---|
| refs_paint 02 lighthouse, near sea | 4.9 % | 2.2 % | 79 % | 1.96 |
| refs_paint 02 lighthouse, far sea | 2.6 % | 4.1 % | 81 % | 1.76 |
| refs_paint 01 van, sea | 4.4 % | 3.7 % | 75 % | 1.69 |
| refs_human_scale 03 beach, wet sand | 0.6 % | 0.7 % | 93 % | 1.03 |
| refs_human_scale 03 beach, sea band (two foam lines) | 13.4 % | 16.9 % | 40 % | 2.60 |
| poster 07 Kyoto, pond reflection | 8.7 % | 8.9 % | 56 % | 2.15 |
| poster 01 Singapore, harbour | 9.0 % | 9.1 % | 57 % | 2.89 |
| our try 3, before this recipe: open water | **0.3 %** | **0.1 %** | 96 % | 0.74 |
| our try 3: near ripples | **1.3 %** | **1.8 %** | 89 % | 1.28 |
| **this recipe, E1 open water** | 1.6 % | 1.5 % | 94 % | 0.80 |
| **this recipe, E4 near ripples** | 2.4 % | 2.5 % | 93 % | 1.16 |
| **this recipe, E6 sea and foam** | 4.7 % | 1.2 % | 86 % | 1.79 |

**The marks are bold.** Light marks sit +11 to +22 L* over their base:
- lighthouse: near +11, far +18;
- van glints: +20;
- beach foam: +17;
- Cape Town flecks: +22;
- Kyoto streaks: +11.

Dark marks sit -10 to -15 L* under it. Between the marks, the water is a calm, softly graded base.

**Our earlier water inverted this.** It had almost no real marks, and a fog of 2-4 L* strokes over everything. That
fog reads as a filter and as "lower drawing quality" (the playbook's "never an even streaky texture").

**This recipe** puts at least 75 % of the water as a calm designed base, and its marks are 7-15 L* off that base. It
stays a little calmer than the lighthouse and the van, by choice: §9.

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

## 2. RESEARCH: how painters do it (8 sources)

1. **The value rule of reflections** (J. Gurney, *Water reflections part 1*,
   <https://gurneyjourney.blogspot.com/2007/12/water-reflections-part-1.html>):
   - light tones above the water appear a little darker in the reflection, because some of the light enters the water
     instead of bouncing off;
   - darker objects may be lighter in their reflection;
   - so reflections are duller and lower in contrast than the things they mirror.
2. **Ripples and vertical lines** (J. Gurney, *Water reflections part 2*, quoting Ruskin and M. Pollock's *Light and
   Water*, 1903, <https://gurneyjourney.blogspot.com/2007/12/water-reflections-part-2.html>):
   - tiny waves dissolve horizontal lines and keep vertical ones;
   - "all motion in water elongates reflections, and throws them into confused vertical lines";
   - distant gentle movement stretches upright lines down, while near ripples, seen one by one, break a reflection up
     horizontally.
3. **Viewing angle, the Fresnel effect** (J. Gurney, *Reflectivity and viewing angle*,
   <https://gurneyjourney.blogspot.com/2011/06/reflectivity-and-viewing-angle.html>): looking across water you see
   mostly reflection (the sky); looking steeply down you see into it. So far water mirrors the sky and is light, and
   near water shows its body and is darker.
4. **The glitter path** (Lynch, Dearborn and Lock, *Applied Optics* 2011, via NASA Earth Observatory,
   <https://earthobservatory.nasa.gov/blogs/earthmatters/2016/11/09/ground-to-space-a-glittering-path-of-san-francisco-sunglint/>):
   - the path is many tilted facets, each a tiny mirror, and lies in the vertical plane through the sun and the eye;
   - with a low sun it narrows to a vertical stripe about the sun's width;
   - rougher water makes it wider and longer.
5. **Wet sand is a mirror**
   (<https://paintingwithwatercolors.com/painting-walking-figures-on-wet-sand-with-watercolor>):
   - a thin film of water over sand is a good mirror, so match its value to the sky it reflects;
   - reflections are a tad darker and lower in contrast, with no sharp edges and little detail;
   - a reflection starts sharp at its base and softens as it spreads;
   - the sand-water edge is never one straight line.
6. **Layers in background art** (J. Gurney, *Layers in animation background painting*,
   <https://gurneyjourney.blogspot.com/2021/09/layers-in-animation-background-painting.html>): film backgrounds are
   painted in layers, with the big shapes blocked in first and the detail last. That is this recipe's order: design,
   underpaint, marks, accents.
7. **Foam** (<https://ehow.com/how_8162410_paint-sea-foam-acrylics.html>): give the foam's white a hint of the sky's
   colour; never make it a solid block of one colour; let flecks of the water show through.
8. **Atmospheric perspective and a limited palette** (Mont Marte, *8 tips for background painting*,
   <https://montmarte.com.au/blogs/tips-techniques/8-tips-for-background-painting>):
   - start from a limited palette;
   - make far planes lighter, cooler and softer;
   - keep the foreground the darkest, most contrasting and sharpest.

(Web pages could only be read through search summaries in this session: the hosts are outside its allowed network.)

---

## 3. THE ONE RULE

**Design the water first, then paint it in layers that are softer the earlier they go down. Leave most of it calm.**

1. **Design (P0).** Lay the flat shapes and the value plan: the water is the sky mirrored, darker and richer toward
   us. Things over the water mirror about their own waterline as ONE solid block.
2. **Underpaint (P1).** A few big soft strokes give gentle variation inside the calm areas: 5-8 strokes, +-1.5-3.5 L*,
   blurred 3-6 px.
3. **Marks (P2).** Few, deliberate, BOLD flat dashes:
   - in only two colours per depth plane (one light, one dark), 7-15 L* off the base;
   - laid as broken lines along the swell;
   - only on the windy patches, covering 4-9 % of the water;
   - each plane blurred a little less the nearer it is.
4. **Accents (P3).** A handful of crisp lightest strokes where the light catches.
5. **Texture (P4).** A faint tooth everywhere (+-0.5 L*), and grain on the near plane only.

The owner's recipe in one line, with its numbers: brush it in layers, a bit more blurry each time. The underpaint is
blurred 6 -> 3 px, the far marks 0.6 px, the mid marks 0.45 px, the near marks 0.3 px, and the accents are not
blurred at all.

---

## 4. THE PALETTE: limited, sampled from the scene's light

**The rule.** Every water colour is a colour of the scene's own light, moved in CIE LCh, darker and richer toward the
viewer. Water is never greyer than its sky, never beige or olive (DIRECTION rule 6), and keeps C* >= 15. One element
uses 8-12 of these colours.

**The scene's light** (King's Cross, October dusk, low sun on the left), sampled from `paint_still_v4.png`
(`KX_LIGHT` in the code):

| | sky top | sky upper | caption band | sky low | horizon | sun | cloud shade | lit window | door | stone | sand | paving |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hex | #b4b6da | #d0c5e0 | #e6d1d3 | #e2c4b8 | #fbdbbc | #ee6a2e | #b79ab9 | #f7cf86 | #fbe6c2 | #6d6680 | #d8b9a2 | #e2d0c1 |
| L* | 75 | 81 | 86 | 81 | 89 | 61 | 67 | 85 | 92 | 45 | 77 | 85 |

**The water palette** (`water_palette()`), how each colour is made, and what it gives here:

| Colour | Made from (LCh move) | Hex | L* | C* | h |
|---|---|---|---|---|---|
| `w_line`: the grazing glow line, the lightest water | horizon, dL -1, C x1.05 | #f9d8b7 | 88 | 21 | 71 |
| `w_far`: the far water, rose-peach | horizon/low 45/55, dL -11, C x1.25, h -14 | #d8ac9b | 74 | 20 | 47 |
| `w_mid`: lilac-rose | band/upper 55/45, dL -16, C x1.75 | #b89cb3 | 68 | 16 | 331 |
| `w_near`: lavender | upper, dL -19, C x1.45, h -4 | #9b91b7 | 62 | 22 | 302 |
| `w_deep`: blue-violet | top, dL -24, C x1.35, h -6 | #6b78a5 | 51 | 26 | 284 |
| `w_deeper` | top, dL -32, C x1.25, h -8 | #56658d | 43 | 24 | 282 |
| `w_plum`: the dark accent of sea bands | cloud shade, dL -22, C x1.15 | #7f6082 | 45 | 23 | 324 |
| `g_core`: a glint's cream core | fixed | #fff4dc | 96 | 13 | 91 |
| `g_gold` | sun/horizon 42/58, dL +4 | #ffb88a | 80 | 39 | 58 |
| `g_amber`: the glint bed | sun/horizon 65/35 | #f89360 | 71 | 54 | 52 |
| `g_lift`: the soft column | sun/band 45/55 | #f2a488 | 74 | 37 | 45 |
| `f_light`: foam, lit by the dome | upper/top 55/45, C x1.3 | #c4bde6 | 78 | 22 | 298 |
| `f_top`: foam crest, lit by the low light | band/horizon 55/45 | #f0d5c9 | 87 | 12 | 54 |
| `sand_dry`: peach-rose, never tan | sand, dL -1, C x1.05, h -14 | #dbb4a3 | 76 | 18 | 50 |
| `sand_wet` | sand, dL -16, C x1.15, h -16 | #b48b7a | 61 | 20 | 48 |
| `paving_wet` | paving, dL -15, C x1.35, h -10 | #c0a595 | 70 | 14 | 59 |

**The ladder.** The water's base colour at depth s is a Lab gradient through `w_line` (s -0.35), `w_far` (0), `w_mid`
(0.33), `w_near` (0.66), `w_deep` (1.0) and `w_deeper` (1.4) (`base_of()`). Here it runs 74 -> 51 L* from the far
waterline to the near edge, and its hue turns rose -> lilac -> lavender -> blue-violet. The step from the horizon air
(L* 89) to the far water is 15 L*. That is the gentlest step that still reads as a horizon at phone size in a light
scene; the references use 30-50.

**The mark colours.** Each depth plane gets ONE light and ONE dark colour (`mark_colour()`):
- **Light:** the hue and chroma of the ladder 0.2 farther. It is a facet tilted away, so it shows the lower, warmer
  sky.
- **Dark:** the ladder 0.25 nearer, with a +3 degree turn toward plum. It is a facet tilted toward us, showing the
  higher, cooler sky.
- **Value:** each is set at exactly the plane's dL off the base, so the contrast is the measured one whatever the
  ladder.

Here:

| Plane (centre s) | Base | Light mark | Dark mark |
|---|---|---|---|
| far (0.15) | #caa5a6 L* 71 | #e9bdaa L* 80 (+9) | #ad93ac L* 64 (-7) |
| mid (0.5) | #aa96b5 L* 65 | #d3b5c9 L* 77 (+12) | #867ea5 L* 55 (-10) |
| near (0.85) | #8183ad L* 56 | #b3a8ce L* 71 (+15) | #5a638e L* 43 (-13) |

**The reflection rule** (`reflect()`): a reflection moves 25 % (a canal: 30 %) toward the water's own colour at that
depth, then -4 L* and C* x0.9. Then the Fresnel step: a further -8 L* x s, darker toward us. So light things reflect
darker and dark things lighter (research 1), and the water's own colour runs through every reflection (§2, items 1
and 3).

---

## 5. THE SHARED WATER BODY (`water_body()`), used by E1-E4, E6 and E7

### 5.1 Design (P0)

- **Silhouette.** The water is one shape with a straight far edge (the horizon, or the foot of the far quay). Mirrored
  sky features are designed as flat soft bands: each cloud band of the sky mirrors as far below the waterline as it is
  above it, x0.9, at 0.85 of its height. It is toned by the reflection rule, a further -4..-14 L*.
- **Value plan.** 3-4 values:
  - the grazing line (the lightest, thin);
  - the far water (a clear step under the air: >= 15 L* here);
  - the mid water;
  - the near water (the darkest base).

  The real darks are SMALL: the dark marks, the reflections of dark things, contact lines.
- **Colour.** The ladder (§4). The far water is warm, the near water cool.

### 5.2 Paint passes

| Pass | Brush | Size (px at 1080) | Opacity | Count | Direction, taper | Colour | Blur after |
|---|---|---|---|---|---|---|---|
| P1 underpaint | flat, soft-edged wash (edge ramp 0.45 x h, ragged 1.5 px, 20 % dry tail) | h = 14 (far) .. 48 (near) x U(0.7, 1.3); length 0.4-1.0 of the width | 0.30-0.45 | 5-8 per element, plus 1 per mirrored cloud band (op 0.5) | horizontal, left -> right, tapering 50 % over the last 40 % | the base at s +- 0.06, +-1.5..3.5 L*, hue +-3 degrees | gaussian 6 px far .. 3 px near (by the band's mean s) |
| P2 far marks (s < 0.33) | (a) long thin lines: a lens stroke, thickness sin(pi u)^0.35; (b) chains of flat dashes | (a) 60-250 x 1.1-1.8; (b) h 1.0-1.8, dash median 18 (lognormal sigma 0.6, min 4.5 h), 1-3 dashes per chain, 35 % of chains one long line of 60-220 | (a) 0.80; (b) 0.85 | (a) 4-9 lines; (b) until 4 % of the far water is covered | horizontal, slope sd 0.004 | the plane's light (+9) or dark (-7), 55/45, jitter sd 0.7 L* | 0.6 px |
| P2 mid marks (0.33-0.66) | chains of flat dashes | h 2.2-4.4; dash median 30; 20 % long lines of 60-180 | 0.90 | until 7 % covered | 65 % left -> right; ends: taper 60 %, square-dry 25 %, blunt 15 % | +12 / -10; 15 % of light dashes get a dark partner below | 0.45 px |
| P2 near marks (> 0.66) | chains of flat dashes | h 4.0-9.0; dash median 42; 15 % long lines of 70-200 | 0.93 | until 9 % covered | as mid | +15 / -13; 30 % paired | 0.3 px |
| P3 accents | flat, crisp (edge 0.7 px), dry tail 35 % | 30-110 long x 1.5-2.4 | 0.92 | 2-8 per element, only where the wind is > 0.6, in the lower 70 % of the water | horizontal, 60 % left -> right | +16 L* (the plane's light hue) | none |
| P3 the line (far waterline / open horizon) | flat, crisp, broken | segments 40-240 long (80 % painted) x 1.6-2.4 | 0.92 | 1 line | along the waterline | `w_line` | none |
| P4 tooth | anisotropic value noise, long along x (sigma 0.6 y, 9 x) | the whole water | +-0.6 % (about +-0.5 L*) | - | horizontal | multiplies the paint | - |
| P4 grain | gaussian noise (sigma 0.7 px) | the near plane only (s > 0.6, ramped to 0.9) | 1 % std | - | - | multiplies | - |

**Inside a plane** the dashes grow toward us: 0.85 -> 1.2 x in length and 0.85 -> 1.15 x in thickness.

**Where the marks go.** A wind field (value noise, cells of 40 x 280 px) decides it. A patch whose wind is under 0.32
gets no marks: it stays the calm mirror. Above that, a chain's weight ramps up as smoothstep((wind - 0.32) / 0.4).

The chains are laid in rows, 1.7-3.2 x h apart. Their acceptance is coverage-driven (§8.4), so the plane's coverage
lands on its target whatever the shape of the water. A chain is mostly one colour: each next dash flips colour with a
20 % chance.

**Stroke counts** in the swatch, per 1080 px of width:
- E1 open water, 290 px tall: far 144, mid 93, near 14, plus 4 accents and the line;
- E4 near water, 300 px tall: mid 59, near 62.

### 5.3 Edges

- **Crisp** (an edge ramp of 0.7-0.85 px): the horizon and waterline line, every mark, the accents, contact lines.
- **Soft:** the underpaint (a ramp of 0.45 x h, then a 3-6 px blur) and mirrored cloud bands.
- **Broken (dry):** mark tails (the last 15-40 % of a dash dries out along the bristles) and the waterline line (20 %
  gaps).
- **Lost:** the far end of a reflection (§6, E2) and the far tips of the long lines (lens-tapered).
- **Never:** an outline around the water or around a mark.

### 5.4 Depth: the ladder, as numbers

| Plane | s | Base L* (here) | Hue | Mark h (px) | Dash median (px) | Marks dL | Coverage | Blur of marks (sigma px) | Underpaint blur |
|---|---|---|---|---|---|---|---|---|---|
| far | < 0.33 | 74 -> 69 | rose-peach, h 47 | 1.0-1.8 | 18, plus 35 % long lines | +9 / -7 | 4 % | 0.6 | 6 |
| mid | 0.33-0.66 | 68 -> 63 | lilac-rose, h 331 | 2.2-4.4 | 30 | +12 / -10 | 7 % | 0.45 | 4.5 |
| near | > 0.66 | 62 -> 51 | lavender -> blue-violet, h 302 -> 284 | 4.0-9.0 | 42 | +15 / -13 | 9 % | 0.3 | 3 |

**From far to near**, each plane is:
- about 6 L* darker;
- 20-45 degrees cooler in hue (toward blue);
- +2-6 in chroma;
- 2.3x thicker in its marks;
- +3 L* stronger in mark contrast;
- about half as blurred.

The far plane is the calmest and the finest. The near plane holds the boldest marks and the grain.

---

## 6. THE ELEMENTS

Each element below gives (a) the design, (b) the paint passes in order, (c) the edges, (d) the depth and (e) the
mistakes specific to it; (f) points to the code. §7 lists the general mistakes and §8 is the shared implementation
spec.

### E1. Calm water mirroring a dusk sky (`e1_mirror()`, 1080 x 460: sky 170 px, water 290 px)

**(a) Design.**
- The sky is the scene's gradient: band, then low, then horizon at the waterline.
- Three soft cloud streaks are designed in the sky, each with a thin lit top. Each mirrors into the water at 0.9 of its
  distance and 0.85 of its height, toned by the reflection rule and -4..-14 L* (the farther above the line, the darker
  its mirror).
- A low hazy far city stands on the left half of the horizon. Its reflection is ONE whole soft mass: a far thing in
  the far water is whole (CRAFT §f.7 c).
- The open horizon on the right carries the bright line.
- The water: the ladder from s 0 to s 0.75.

**(b) Passes.**
1. P0 the ladder.
2. P1 6 soft strokes plus the 3 mirrored bands, blurred 4.7 px.
3. P2 the far plane: 4-9 long thin lines and 144 marks. The mid plane: 93 marks. The near plane: 14 marks (it is only
   the bottom 25 px here).
4. P3 4 accents and the line (x 650 -> 1080).
5. P4 tooth, then grain.
6. After the water: the far city's reflection (its mirrored silhouette, blur 1.6 y / 0.8 x, op 0.88), each tiny lit
   window as a soft 2 px streak 6-13 px long straight below (blur 1.6 / 0.4), and 2 rows of thin sky lines (1.3 px,
   +6 L*) breaking the city's reflection 7 and 14 px under the line.

**(c) Edges.** The horizon is crisp (a 1 px step of 15 L*). The mirrored bands are soft. The far city's reflection is
soft along the view and crisp across it.

**(d) Depth.** §5.4. The mirrored bands darken 4 -> 14 L* with their distance from the line.

**(e) Mistakes.**
- No step at the horizon: our first ladder put the far water within 5 L* of the air, so the horizon vanished at phone
  size.
- Marks all the way to the horizon at full contrast: the far plane must be the calmest and finest.

### E2. Reflections of lit windows: a facade on a quay (`e2_windows()`, `reflection()`, 540 x 400)

**(a) Design.**
- The source is our flat: a cream facade, terracotta piers, two lit windows, a lit door, one dark window, a cornice,
  the quay's top (paving) and its 6 px stone face.
- The mirror target (`mirror_rows_split`):
  - the quay face shows first (6 rows), then the facade from its base up;
  - the quay's top is never seen in a reflection;
  - the LIT windows and the door are replaced by the wall colour, because they are painted as lights, never as slabs.
- Only masses survive (`simplify`, a 5 x 13 px median).
- Toned by the reflection rule plus Fresnel.
- Wobbled row by row by the ripples: 0.5 px at the waterline, 2.5 px 120 px down (smooth noise, a 7-row cell).
- The visible length is the waterline to the reflection's last covered row, per column.
- A light's reflected length is 1.25 x its own height: ripples elongate a light (research 2).

**(b) Passes.**
1. The water body first (s 0.55 -> 1.0, mid and near at 0.8 dose, 2 accents), so the open water below the
   reflection is painted water.
2. **P1 the solid block.** Opaque (op 0.97) from the waterline to 60 % of the visible length, with a 0.06 soft
   transition. Then LEVEL BARS on bands 7-12 px tall (thicker toward us):
   - each bar takes 70-85 % of its band;
   - it is kept with a probability falling 0.9 -> 0.3 toward the far end;
   - its ends are cut back 0-18 % and tapered, and 30 % of bars get one 6-20 px break;
   - under the whole bar zone lies 35 % of the reflection, so the gaps stay tone-on-tone.

   The colour is the target's; blur 1.2 px down, 0.6 across.
3. **P2b the lights.** Each lit window and door:
   - a glow column: screened, a gaussian across of sigma 0.45 x its width, from 4 px above its mirrored top down to
     1.5 x its reflected length, op 0.32, the light mixed 35 % with the water, blur 5;
   - the block: ONE solid shape over the first 35 % of its length, its sides wobbled (0.4 -> 1.4 px), narrowing 10 %
     downward, its lower corners rounded, the light -4 L*, op 0.97;
   - then up to 3 pointed slivers (lens power 0.7): 0.85 x the width and 4.2 px, then each 0.70-0.85 of the one above
     in length and 0.75-0.85 in thickness, 4.5-7.5 px of water between them, -5 / -7 / -9 L*;
   - cores: 2-3 crisp strokes (1.8 px, 25-55 % of the width, +6 L*) at the block's top.
4. **P2 the sky breaks.** Thin long lines across the reflection, where a facet faces the high sky:
   - one every 5-11 px down from 7 px under the line, denser toward the far end;
   - each with a probability of 0.3 -> 0.75;
   - 50-280 px long, 1.3-2.2 px tall, lens-tapered;
   - the open water's light at that depth +4..+8 L*, op 0.85;
   - clipped to the reflection's extent.
5. **P3 the contact line.** Where the quay face meets the water: 2 px, stone -14 L*, op 0.55.

**(c) Edges.**
- The reflection's sides are crisp and wobbled.
- It is soft along the view (1.2 px) and crisp across it (0.6 px).
- Its far end is lost: bars, then nothing.
- The lights' blocks and slivers are crisp; their glow is soft.

**(d) Depth.**
- Fresnel: -4 L* at the line -> -12 L* at the near edge.
- Wobble: 0.5 -> 2.5 px.
- The breaks: 30 % -> 75 % of the rows.

**(e) Mistakes.**
- Chopping the reflection into dashes from the waterline down: try 3's version read as confetti and not as a mirror.
- A light as a slab, i.e. the full mirrored rectangle of the window.
- A light's block built from stacked strokes: try 4 read as a stack of stripes.
- The open water below darker than the reflection's own range: try 4's deep ladder made a navy band.

### E3. The sun's glint column (`e3_glint()`, `glint()`, 540 x 420)

**(a) Design.**
- The sun is a flat disc 96 px across, sitting on the far city, crisp-edged, the scene's #ee6a2e: one step off its
  sky, no halo disc (DIRECTION rule 5).
- The column lies straight under it (the vertical plane through the sun and the eye: research 4):
  - its width is a FWHM of 1.1 x the sun's diameter at the waterline, widening to 2.0x at the near edge (with a low
    sun the glitter is about the sun's width; ripples spread it toward us);
  - its value is a soft lift: 03 measures +10-12 L* at the horizon and +4-6 L* on the wet sand.
- The default dose suits a column that is the shot's "look here". For a calm far sun, use `strength=0.5` with 2-4
  slivers, as in E7.

**(b) Passes.**
1. The water body (s 0 -> 0.8, at 0.7-0.8 dose, 2 accents), then the city's reflection.
2. **P1 the lift.** Screened. A gaussian across with the FWHM above; opacity 0.50 at the line -> 0.12 at the near
   edge; `g_lift`; blur 6.
3. **P2 the bed.** Rows from 2.5 px under the line, 5.5 px apart at the line and 14 px apart at the near edge.
   - In the far quarter, a shimmer: 2-4 short thin lines per row, 10-26 x 1.2-2.0 px (lens power 0.5), spread
     uniformly over +-0.5 of the column's width, gold -> cream, op 0.9.
   - In every row, one amber lens: a quarter of the rows get a second one, 0.3 of the width aside.
     - Size: 14 -> 46 px long x U(0.6, 1.4), 1.6 -> 5.0 px thick.
     - Position: x ~ N(the axis, 0.16 -> 0.3 of the width).
     - Colour: amber/gold, turning 60 % toward `g_lift` by the near end.
     - Opacity: 0.95 -> 0.5.
   - Past 55 % of the length, rows drop out (20 -> 55 %).
   - Side glints: Poisson(1.0 -> 0.3) per row, 8-20 x 1.2-2.6 px, x ~ N(the axis, 0.45 of the width), op 0.7 x their
     falloff.
   - Blur 0.5 px.
4. **P3.** 4-6 gold-white slivers on bed lenses in the far 60 %: 20-36 px, 2.0-3.8 px, the bed +13 L*, op 0.95. Then
   the merged bright line under the sun at the waterline: 0.9 x its diameter by 2 px, `g_core`.

**(c) Edges.** The lift has no edge at all (it is a screened glow). The lenses and slivers are crisp and
pointed at both ends. There are no point sparkles and no stars (CRAFT §f.7 e).

**(d) Depth.** Toward us:
- the rows spread 5.5 -> 14 px apart;
- the lenses grow 14 -> 46 px long and 1.6 -> 5 px thick;
- the lift fades 0.50 -> 0.12;
- the colour goes amber -> rose (`g_lift`);
- the opacity falls 0.95 -> 0.5.

**(e) Mistakes.**
- One lens per row in a perfect column: try 7 read as a string of beads.
- Saturated orange confetti: try 3 was too many dashes.
- A white or yellow halo around the sun.

### E4. Small ripples and horizontal dashes, a post and its rings (`e4_ripples()`, 1080 x 300)

**(a) Design.**
- Near water only: s 0.5 -> 1.05.
- A wind field with calm patches (cells 40 x 300).
- A mooring post in the water: a dark stone box with a lit left face (+12 L*).
- Its reflection: the post's colour by the reflection rule (k 0.3, +2 L*: a dark thing reflects a little lighter, still
  darker than the water). It is ONE block down to 60 % of the post's height, then bars.
- A thin dark contact lens at its foot: an ellipse 0.75 x its width by 2.6 px, -14 L*, op 0.8.
- Three rings: flattened ellipses at 1 : 7, radius 40 x 1.6^k.

**(b) Passes.**
1. The water body: 8 accents; mid 59 and near 62 dashes, covering 6.8 % and 7.7 %.
2. The post's reflection (`reflection()`, solid 0.6), wobbled 0.5 -> 3 px.
3. The rings (`ring_marks()`):
   - 7-10 dashes per ring, each 0.35-0.6 rad of the ellipse;
   - a light line (+12 L*, 2.4 px on the near arc, 1.6 px on the far arc, x0.85 per ring outward);
   - on the near arc, a dark partner 2.2 px below it (-10 L*);
   - op 0.85 / 0.6 / 0.4 from the inner ring out; blur 0.35.
4. The contact lens, then the post itself, crisp: our flat.

**(c) Edges.**
- The dashes are crisp (0.85 px), with flat or one-side-tapered ends.
- The rings are lens-tapered.
- The post's reflection is soft along the view.

**(d) Depth.** §5.4. The dashes double in size from the top of this swatch to its bottom.

**(e) Mistakes.**
- Dashes of every colour at every place: try 4-5 read as confetti or sprinkles. Use 2 colours per plane.
- Dashes too short (median 12-20 px) and too uniform: they read as pixels. Use medians of 30-42 px, a long tail, and
  1-3 per chain.
- Rings as full ellipses, or as crescents.

### E5. Wet sand and wet paving (`e5_wet()`, `wet_ground()`, `rock()`, `puddle()`, 1080 x 340)

**(a) Design.**

Left half, the beach:
- A strip of sea and its swash edge.
- Wet sand that MIRRORS THE SKY: a step under the sky it reflects, so under our light sky it is the lightest ground
  (as in the van; under 03's dark sky it is dark).
  - Its base: the wet sand colour (`sand_wet`) mixed with the sky mirrored (`wet_sky`: horizon -> low -> cloud ->
    band -> upper -> cloud shade -> top, from far to near).
  - The sky's share: 80 % far -> 45 % near (grazing views mirror more: research 3), at -3 L*.
- Three rocks (`rock()`), each designed as a dome lit by the low sun on the left and quantised into flat tones:
  - a small lit cap: dot > 0.74, +11 L*, warmed 25 % toward the low sky;
  - a mid face: dot > 0.5;
  - a shade face: -3 L*, turned cooler;
  - the stone at -13 L*, so the rocks are the real darks;
  - the tone boundaries soft-turned (1.8 px).
- A pool: a crisp organic shape that mirrors the HIGHER, brighter sky (research 5; the van's pools).
- The wet/dry edge near the bottom, and the dry sand in `sand_dry`.

Right half, the paving:
- Wet paving (`paving_wet`, the sky's share 50 % -> 28 %, -2 L*).
- Slab joints in perspective.
- A puddle.
- A lamp post, its head out of frame.

**(b) Passes.**
1. P0 the wet base (above).
2. **P1 bands.** The mirrored sky's own layers in soft strokes:
   - 16 on the sand and 22 on the paving;
   - 8-24 px tall, 0.3-0.9 of the width long;
   - the sky position jittered by sd 0.18, +-3 L*, op 0.45-0.7, edge 0.45 x h;
   - blurred 3 px across and 14 px ALONG the sand (it smears along the ground), but 10 px down and 2 px across on the
     paving (on rough wet stone the light smears DOWN: the bus stop).
3. The sea strip: the water body, s 0.4 -> 0.7.
4. **The swash.** A lacy light edge where the sea meets the sand: segments 40-160 px (75 % painted), 1.6-2.6 px,
   `f_light` at L* 86. Then 2 thin rows at 20 px spacing below it.
5. **The pool and the puddle** (`puddle()`):
   - a crisp 0.6 px edge;
   - inside, the higher sky (`wet_sky` 0.55-0.9 for the pool, 0.62-0.98 for the puddle) mixed 12 % with the ground;
   - a damp margin: 6 px out, blur 3, -6 L*, op 0.4;
   - the far edge's rim: 1 px, the low sky, op 0.4. A thick rim reads as an outline.
6. **The rocks.** First the reflection of each (`reflect_shape`):
   - its silhouette mirrored about its base, 0.55 of its height, fading;
   - blur 2 px down, 0.8 across;
   - colour reflect(stone, wet sand, k 0.25, +4 L*).

   Then a contact line (about 3 px tall, 0.85 of its width, stone -10, op 0.6, blurred 2 px along), then the rock.
7. **Water-edge lines** on the sand: 8 lines, 120-380 px long, 1.2-2.0 px thick, gently curved, lens-tapered; 5 light
   (the low sky, -4..-12 L*) and 3 dark (wet -6); op 0.7, blur 0.5. They run BEHIND the rocks.
8. **The wet/dry edge.** A wavy line whose softness varies 0.8 -> 3.5 px along it, so it is crisp in places
   (research 5). The dry sand is matte (`sand_dry`) with a 1.4 % grain and about 80 specks (2 x 1 px, +-10-14 L*),
   only on the near dry sand.
9. **The paving.**
   - Slab joints: 1 px, -12 L*, op 0.1 far -> 0.5 near.
   - The puddle, placed across the lamp's reflection.
   - The pole's reflection: a 6 px column fading over 200 px, blurred 7 px down and 1.4 px across on the paving, but
     only 1.5 / 0.7 inside the puddle (smooth water is a sharper mirror).
   - The lamp's light: a screened glow column, sigma 8 px across, blur 6 / 1.5.

**(c) Edges.**
- Crisp: the pool and puddle edges; the rocks' lit side (0.6 px); the wet/dry edge in places.
- Soft: the rocks' shade side (1.4 px), the bands (blurred), the reflections along the view.

**(d) Depth.**
- The sky's share in the wet ground: 80 % -> 45 %.
- The sky it mirrors: lower (warmer, lighter) far -> higher (cooler) near.
- Speckle and grain only on the near dry sand.

**(e) Mistakes.**
- Wet sand as a uniform blurry wash: try 3. It needs the sky's own bands.
- Rocks split by a straight diagonal light/shade line (graphic), or pale and mid-grey (no darks).
- A separate core-shadow band between the lit cap and the shade: it reads as a crescent. Turn the form softly
  instead.
- Water lines drawn over the rocks.
- A thick light rim around the puddle (an outline).
- Dry sand in a tan or beige (DIRECTION rule 6): use peach-rose.

### E6. Gentle waves and foam lines on a shore (`e6_foam()`, `foam_line()`, 1080 x 300)

**(a) Design.**
- The horizon glow band above the sea.
- The sea: a mid-tone, s 0.3 -> 1.0, so that the sky-lit foam can read against it.
- Three foam lines from far to near (y 46, 88 and the shore break at 140), with heights hmax of 4, 7 and 13 px. Each
  follows a gentle curve: an amplitude of 3 x s px over a 90 px period, plus 1.2 px over 31 px.
- Each line breaks only where its swell (value noise, 70 px cells) is high: 55-80 % of its length.
- The wet sand below mirrors the sky (as E5). The swash is on it, and the wet/dry edge near the bottom.

**(b) Passes.**
1. The wet sand (E5's `wet_ground`, sky share 80 % -> 50 %).
2. The water body at 0.3 dose, with no accents, plus the horizon line.
3. **Sea bands** (`sea_bands()`): 5-7 long straight bands, 200 px to the full width, 2-5 px thick (thinner far), lens
   tips. Each is either light (+5..+7 L*, the ladder 0.2 farther) or plum (`w_plum` 40 % toward the base, -6..-8),
   op 0.7-0.85, blur 0.4. This is 03's sea between its foam lines.
4. **Per foam line, far to near** (`foam_line()`):
   - **The wave face.** A soft darker band just under the line: 1.6 x hmax tall, the base at s + 0.25 and -9 L*, op
     0.6, in segments of 80-220 px, blur 2.
   - **The foam band.** ONE continuous lumpy shape.
     - Its height: hmax x the lump envelope x the swell's coverage.
     - The lump envelope: rounded domes of radius 5-12 px (x0.6 far), height 0.55-1.0, spaced 0.9-1.6 radii, plus
       noise sd 0.08. This makes a cauliflower edge, never spiky peaks.
     - The bottom is flat, 0.35 x hmax under the line.
     - The colour is `f_light`, warmed up to 35 % toward the low sky on the sun's side (x < 220):
       - L* = the sea +12 (far) .. +17 (near);
       - +2 at its top and -3 at its base (its own form);
       - capped at 90, never white.
     - Edge ramps: 0.7 px at the top, 0.8 px at the bottom; op 0.95, blur 0.4.
   - **Crest light.** On 40 % of the lumps higher than 0.55 x hmax: a 6-20 px lens stroke, 1.2 px, `f_top`
     (+5 L* over the body, warmed toward the horizon on the sun's side). Never a line along the whole top.
   - **Curls** (the near line only): one every 60-120 px where the band is tall, a small arc of radius 0.25-0.4 x the
     band's height, 1.1 px, the body -4 L*, op 0.75.
   - **Lace.** Width / 40 dabs of 3-9 x 1-2 px under the band, at the body's value x0.6, op 0.6.
5. **The swash** on the sand (`swash()`): 3 wavy rows 24 px apart, segments 40-150 px (70 % painted), 1.0-1.7 px,
   `f_light` at L* 82 and 3 darker per row, op 0.65 -> 0.37.
6. **The wet/dry edge.** A wavy line, softness 3 px, then `sand_dry`.

**(c) Edges.**
- Crisp: the foam's top and bottom, the crest lights, the sea bands.
- Soft: the wave faces (blur 2), the wet sand bands.
- Broken: the swash, the lace.

**(d) Depth.** From the far line to the near one:
- foam height 4 -> 7 -> 13 px;
- lump radius x0.6 -> x1.0;
- foam contrast +12 -> +17 L*;
- curls only on the near line;
- sea bands thinner far.

**(e) Mistakes.**
- Foam as stacked rows of separate strokes: try 7-8 read as a stack of pancakes.
- Foam masses as smooth lens shapes: they read as floating leaves or sand bars.
- Gaussian lumps: they read as a mountain range.
- A dotted crisp line along the foam top: it reads as an outline.
- White foam.
- A light sea under light foam: no contrast.
- Too many, too contrasting sea bands: they compete with the foam.

### E7. Together: the King's Cross canal (`e7_canal()`, the v4 layout, rows 1030-1310)

**(a) Design.**
- The water's shape: measured from the v4 design. The far waterline (the quay's foot) runs from y 1068 at x 0 to
  1111 at x >= 460; the near quay edge is y = 1143 + 0.131 x.
- The objects standing in the water stay our crisp flat: the two boats, the duck and Pip's post (v4-v6; since
  2026-10-30 a prop that stays joins the one painted language at its plane's dose, or leaves the frame: playbook
  PAINTED PIECES, `PAINT_RECIPES.md` §4.1, `ORGANIC.md` §5 and R6; Pip stays crisp, tier B).
- The mirror target: the design above the waterline, per column:
  - 7 px of the quay face (stone +6 L*) first;
  - the quay's 10 px top skipped;
  - then the bridge, the far city and the facade, simplified by a 7 x 21 median;
  - toned with k 0.3 and Fresnel;
  - wobbled 0.5 -> 2.7 px.
- The lit doorway (x 545-712, y 850-1062) becomes a LIGHT: its rectangle in the target is filled with the median of
  the wall on both sides of it. Its light's length is 0.75 x its height, measured from its mirrored foot.
- The boats and the duck mirror about their own bottoms, as dark solid shapes (k 0.25).
- The sun's glint (x 195, its diameter 96 px) is sparse at strength 0.5, because the canal lies far below the horizon.
  Ripple facets of 5-10 degrees can still send the low sun to the eye there (research 4).

**(b) Passes.**
1. The water body: s 0.55 -> 0.95, mid and near at 0.6 dose, 4 accents.
2. The reflection: solid 0.6, bars, sky breaks, the door as a light (glow, block, slivers, cores).
3. The glint, with 2-3 slivers.
4. Rings around the duck: radius 46 px x 1.5 per ring, 1 : 7.
5. The contact line under the far quay: 1.2 px, stone -12 L*, op 0.5.
6. The objects pasted back crisp.

**(c) Edges and (d) depth.** As E2 and §5.4.

**(e) Mistakes.**
- Mirroring everything at full detail: try 3 turned the canal into a muddy jumble. The median keeps only masses, and
  the lights are lights.
- The v4 mint body under a lilac sky: the water must be its own shot's sky mirrored (DIRECTION rule 6; CRAFT §f.7 a).

---

## 7. MISTAKES TO AVOID

These are everything our painter (v1-v5, `paint_test/NOTES.md`) and this recipe's own tries got wrong.

| Mistake | What it looked like | The rule that prevents it |
|---|---|---|
| **Even streaky texture** (playbook) | a fog of 2-4 L* strokes over all the water (our try 3: 0.3 % real marks); v2's "drawing quality is not the same" | a calm designed base, at least 75 % untouched; marks 7-15 L* off it; check with §8.7 |
| **Confetti / sprinkles** | many short blocky marks of many colours, evenly scattered (tries 4-5) | ONE light and ONE dark colour per plane; chains along the swell; long-tailed lengths; calm patches with no marks |
| **A stack of pancakes** (CRAFT §f.7) | uniform rows of same-size dashes; a light built of stacked strokes; foam built of stacked rows | a solid shape first (a block, a band), then few marks on it |
| **Chopping a reflection** | dashes from the waterline down, so no mirror reads | solid down to 55-65 % of its visible length, then bars, then lost |
| **Smudging** | blurring the whole water or the whole layer | blur per pass and per plane only: underpaint 3-6 px, marks 0.3-0.6 px, accents 0 |
| **Combing** (v3, v4) | parallel bristle streaks along every edge | bristle depth <= 0.06 in marks and 0 in accents; dry breaks only at stroke tails |
| **Greying, muddy, beige** | the first ladder's mid #bea4a6 (C* 11) and far #dfbca1 (h 66); tan dry sand | chroma >= 15 in the water; hue kept off 60-90 degrees; every colour from the sky's family; dry sand peach-rose |
| **Too dark for the scene** | the first ladder's deep end L* 42 made a heavy navy band (try 4) | the water stays a mid-tone in a light scene (51-74 here); real darks only in small pieces |
| **No horizon** | the far water within 5 L* of the air | a step of at least 15 L* (references: 30-50) and a crisp bright line |
| **Cartoon outlines** | a dotted crisp line along each foam top; a thick light rim around the puddle | lit tops only on lump peaks; rims <= 1 px at op 0.4; contact lines only where a thing meets the water |
| **Crescents** (v4) | a core-shadow band between a rock's lit cap and its shade | soft-turned tones (blur 1.8 px), no separate band |
| **Spiky or leaf foam** | gaussian lumps (a mountain range); smooth lens masses (floating leaves) | one continuous band with rounded domes |
| **A string of beads** | one glint lens per row in a perfect column | a shimmer of short lines near the horizon, varied lenses, sparser toward us |
| **White foam, white glints, star sparkles** | | foam is sky-lit (`f_light`), glints are gold; the only near-white is a small cream core; no stars |
| **A slab for a light** | the full mirrored window rectangle | a block of <= 35 %, then <= 3 slivers, plus a soft glow |

---

## 8. IMPLEMENTATION SPEC (numpy, PIL, scipy)

### 8.1 Colour

Convert sRGB to CIE Lab (D65) and back, in float64 (`lab()`, `rgb()`). Every palette colour is a scene colour moved in
LCh (`shift(c, dL, cmul, dh)`), mixed in Lab (`mix()`) or set to a lightness (`with_L()`). Gradients interpolate in Lab
(`grad()`).

### 8.2 The brush

A stroke is rasterised analytically, not stamped; it is one call to `chisel()`.

**The path.** For a near-horizontal stroke from x0 to x1 at height yc:

```
u = (x - x_start) / run                            (0 at the touch-down, 1 at the lift)
y_path(x) = yc + slope (x - x0) + bow * 4 u (1 - u)
```

**The thickness.**
- A flat brush: prof(u) = (0.86 + 0.14 smooth(u / 0.06)) * (1 - thin_end * smooth((u - (1 - t1)) / t1)). The
  touch-down is blunt and the lift tapers over the last t1.
- A lens (glints, slivers, long lines): prof(u) = sin(pi u) ^ p, with p = 0.25-0.7.
- Then prof *= 1 + pressure * (n1(x) - 0.5) * 4, where n1 is a smoothed noise row. This is the hand's slow change of
  pressure.

**The alpha.**

```
d(x, y) = h/2 * prof(u) - |y - y_path(x)| + rag * (n2(x, y) - 0.5) * 2      (n2: ragged long edges)
alpha   = clip(d / soft + 0.5, 0, 1)                                         (soft = the edge ramp, px)
        * end ramps of 0.9 px
        * smooth((n3 - thr(u)) / 0.08 + 1)       (dry break: thr rises 0 -> dry over the last 1.6 t1)
        * (1 - bdepth * n4)                       (bristle streaks)
        * op
```

**The colour.** The palette colour, plus a drift of +-cj along the run, plus cj / 2 per bristle.

**The noise.** One 512 x 512 texture per element and pass: gaussian-filtered white noise (sigma 0.75 y, 7 x, wrapped),
rank-normalised to a uniform [0, 1], long along x (`Noise`). Every stroke reads its n1-n4 from random windows of it, so
no two strokes share their bristles.

**The end styles of a dash** (`stroke()`), as (thin_end, dry):
- taper: (0.6, 0.25), 60 % of dashes;
- square-dry: (0.1, 0.6), 25 %;
- blunt: (0.1, 0.15), 15 %.

Plus slope N(0, 0.004) and bow N(0, 0.08 h).

### 8.3 Layers and compositing

- Each pass is its own premultiplied RGBA layer (`Layer`). Strokes composite into it with "over", in the order they
  are made.
- The finished layer is blurred by its plane's gaussian sigma: RGB and alpha alike, a scalar or (sigma_y, sigma_x).
- It is then composited onto the canvas inside the element's mask, with "over" or, for glows, "screen":
  1 - (1 - canvas)(1 - layer).
- **The order:** P0 design, P1 underpaint, P2 marks far, P2 marks mid, P2 marks near, P3 accents, P4 tooth and grain.
  Then, by element: reflections (block, lights, breaks), glints, rings, contact lines. Then the crisp objects on top.

### 8.4 Marks by coverage (`plane_marks()`)

1. **Candidates.** Lay chains row by row:
   - row spacing h x U(space);
   - chain lengths lognormal;
   - gaps between chains U(gap) x the chain's length.
2. **Weights.** w = mask x smoothstep((wind - 0.32) / 0.4), where wind is value noise with 40 x 280 px cells.
3. **The acceptance constant.** k = target_cover x plane_area / sum(chain_area x w).
4. **Acceptance.** Keep each chain with probability min(1, k w), in a fixed order with its own generator.
5. **The dashes.** Paint each accepted dash in the plane's light or dark colour (§4), with 20 % colour flips inside a
   chain and dark partners under light dashes.

The coverage lands on its target unless the candidates run out. Then lay them denser (smaller gap and space) rather
than raising k.

### 8.5 Reflections (`reflection()`)

1. **The target.** Mirror the flat about the waterline per column (`mirror_rows`, `mirror_rows_split`). Replace lights
   by their wall colour. Take a median (`simplify`). Tone it with `reflect()` and Fresnel. Wobble its rows
   (`wobble_rows`).
2. **The alpha.** The solid block = cover x (t < solid), with t = (y - waterline) / the visible length per column. The
   bars are `chisel` strokes painted in white into a layer whose alpha alone is used. Take the maximum of both and 35 %
   of the bar zone.
3. **Colour and blur.** The colour is the target's; blur (1.2, 0.6).
4. **Then, in order:** the lights (glow, block, slivers, cores) and the sky breaks.

### 8.6 Seeding and determinism

- `rng_for(seed, element, pass, ...)` = `numpy.random.default_rng(int(sha256(key)[:8]))`, one generator per (seed,
  element, pass).
- So changing one element or pass never changes another, and a new `--seed` gives a new painting of the same design.
- Two runs give the same file: md5 `bbc183c7…` for seed 1029.
- In the engine each painted piece is baked once and locked to its layer (playbook PAINTED PIECES). Water's motion
  (CRAFT §f.7 g: the sway, the ripple drift, the slivers) belongs to the flat layer under it, or to a few separately
  baked phases; never re-randomise per frame.

### 8.7 The check (`mark_metric()`, `--metrics`)

For the water area:
- L* minus its (9 x 41) median: the share of marks more than 6 L* lighter, and the share more than 6 L* darker;
- the calm share (|dL| < 2.5);
- the high-pass std of the calm part (the tooth).

These are the same numbers as the references' table (§1.1).

**The targets for open painted water:**
- marks 3-9 % (light plus dark);
- calm >= 75 %;
- tooth 0.6-2.0 (above about 2.5 reads as a filter);
- the horizon step >= 15 L* in a light scene.

### 8.8 Cost

All 7 swatches (about 2.4 Mpx in all) take 17 s on one shared CPU core: about 1,000 strokes. numpy, PIL and scipy
only.

---

## 9. PROOF: `water_swatch.png`, and how close it gets

`python3 video/scripts/look/paint/recipes/water.py` writes `video/docs/look/paint_recipes/water_swatch.png` (1600 px
wide). On each row, the left side is the reference crop(s) and the right side is our recipe in the King's Cross dusk
light. Add `--scratch DIR --metrics` for each swatch at frame scale, a phone check (each frame's width at 400 px,
beside the crop at the same scale) and the numbers.

**How it was checked.** I looked at the swatches at phone size (400 px wide) beside the crops, then made ONE fix round
where the recipe fell short:
- the horizon step went from 11 to 15 L*;
- the near dashes got bolder (4-9 px, +15 / -13 L*);
- the rocks became the real darks, softly turned, with no crescent band;
- the shore sea became a mid-tone, so the foam reads (+12..+17 L*).

The numbers above are after that round.

**How close it gets, honestly.** The METHOD transfers: a designed calm base, a limited palette, few bold marks in
plane-by-plane layers that are blurrier the farther they sit, solid mirrors with breaks, lights as a block plus slivers,
sky-lit foam, wet ground as the sky mirrored.

The RESULT is calm, clean, painted water in our dusk family, and at phone size it no longer reads as a filter or as
confetti. It is still gentler and simpler than the references:
- they are darker, higher-contrast scenes, made by hand with more variety;
- our water sits in a light pastel key, so its value drama (a 15 L* horizon step) is about half of theirs.

Per element:

| Element | At phone size, beside its crop | What is still short |
|---|---|---|
| E1 calm mirror | reads as calm painted dusk water with a clear horizon, mirrored cloud bands and few long lines; close to the lighthouse's far sea in method | 03's drama (a dark sea and bold foam) is absent by our key; the far half is quiet, close to flat |
| E2 lit windows | the closest: a solid mirror, darker and duller, cut by thin light lines; the lights read as light on water | our facade is a simple flat, so its mirror is simple; nothing like Kyoto's richness, by design |
| E3 glint | a soft warm column with a shimmer under the sun, sparser toward us; near 03's softness in the far half | the near lenses are still a little regular; in a shot where the sun is not the "look here", use strength 0.5 |
| E4 ripples | the lighthouse's method: 2 values, dashes in rows, calm gaps | calmer, thinner and less blocky than the lighthouse; its choppy energy would need about 12-15 % coverage and h up to 12 px |
| E5 wet sand and paving | wet sand mirrors the sky in bands, lighter than the sea (the van's rule); rocks dark, short, softly reflected; crisp pool; the lamp's smear reads | the bands are softer and less designed than the van's pink/lilac; the rocks are simple domes |
| E6 foam | reads as foam lines: rounded sky-lit bands with crest light, wave faces, lace, swash | smaller and weaker than 03's foam (03's sea is far darker, so its foam pops); the curls barely show at 400 px |
| E7 canal | a calm painted dusk canal: the facade, boats and duck mirrored as solid blocks with breaks, the door as a light, a sparse glint | the left third (bollards, the bridge, the far city) mirrors a little busy; the lilac is darker than v4's mint, so in a film the shot's value plan sets its lightness |

**For the engine.** This file is a recipe and a proof, not the engine. `paint.py` was not touched; another agent works
in it. To adopt it, a `style: "water"` spec could carry the following, with the defaults in §5.4:
- the ladder stops (from the scene's sky);
- the three planes (cover, h, dash, dL);
- the wind cell, accents and line;
- the reflection targets (the flat above the water, solid, the lights);
- the glint (x, D, strength).

**A doc clash to settle (flagged, not edited).** `CRAFT.md` §f.7's phone check says "never boxes, dashes, stars or a
stack of pancakes", while the playbook's PAINTED PIECES says "water in horizontal dashes" (from `refs_paint/02`). This
recipe reconciles them: its dashes are designed (2 colours per plane, broken lines along the swell, calm patches,
<= 9 % coverage), so the water still reads calm and glassy. The CRAFT line could read "never scattered or uniform
dashes".
