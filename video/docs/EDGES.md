# EDGES: hand-made screen edges on a full-bleed world (`src/lib/edges`)

The user's note: *"I like a bit of hand-drawing messiness that the first video has around the edges of the screen. Maybe
we can experiment with a few different variations and see what looks cleaner, more polished and premium."*

Reference 1's edge charm is one rule (style bible 4 + 5.4): **the fills stop dead at the panel edge, the ink keeps going**
into the white card, corners overshoot, some contours stay open. We stay full-bleed (reference 2 framing, the viewer feels
small): the treatment only adds that ink-past-colour charm at the frame edge, in screen space, around any scene.

**Status (round 3, paint):** the user picked the TRIM direction with a note: *"I'm thinking it's more like a default
white base and then we paint on top of it in a somewhat messy, incomplete way, like in the very first video, with the
edges around the page even more loose and messy."* Answer: a new variant **`paint`** with a looseness knob and three
presets, `paint-subtle`, `paint-medium`, `paint-loose` (section 0). `trim` / `panel` / `clean` are unchanged. Review
material: `review/edges/loose/` (section 8). The film default is still `clean` (`FILM_EDGES`); the user picks.

Round 2 (kept below for reference): three candidates, `clean` (control), `trim` and `panel`, refined from the judges'
round-1 ranking (trim 26.5, panel 26.0, rough-tb 20, clean 20, construction 19.5, vignette 15.5); material in
`review/edges/final/`.

## 0. paint: white paper, the colour painted on top (round 3)

**The idea.** The frame is a sheet of white paper. The scene's line art is drawn on it, and the colour is then laid on
top as a few flat blocks that do not quite reach the edges: the colour stops on crisp, hand-laid straight edges that
step in and out, bite in, leave a corner or two bare, and here and there run off the frame. The line art keeps going
past the colour into the white and stops at varied points. That is reference 1's panel (f_3.0, f_5.5, f_9.0, f_12.0:
fills clipped to flat blocks, the pale ground block a trapezoid past the panel, ink running 30-62 px into the white,
line-art people standing on bare paper), loosened and taken to every edge of a full-bleed 9:16 frame. Flat colour
only: no brush texture, blur, gradient or opacity. The edge is fixed on screen, a pure function of (seed, looseness).

**How the colour is built** (`src/lib/edges/paint.ts`): the UNION of a few flat blocks (the clip path's nonzero rule
unions same-wound subpaths, so no polygon boolean is needed):

| element | what it is | why |
|---|---|---|
| bands | the body cut into 2 / 3 / 4 horizontal bands (subtle / medium / loose), each a slightly tilted block with its own side insets; the first seam sits just under the caption block (y 680-780) | where two blocks meet, the side steps in or out: "a block ends, the next starts" (f_5.5's facade vs. ground fills) |
| notches | trapezoid / scoop bites in a band side (left 50 %, bottom 30 %, top / right 10 % each) | paint that did not reach |
| tongues | blocks run past the frame edge: one long slant in (like a ground plane in perspective), a short step out (bottom 50 %, left 25 %, top 15 %, right 10 %) | colour reaching the edge (f_5.5's pale ground running past the panel) |
| shelves | a block sticking 8-40 px further out of a side for 140-400 px | uneven, wandering margin |
| corners | each frame corner gets a role: **unpainted** (a big lasso chamfer with 1-2 knees: the corner stays line art on white; 1 corner, + the diagonal one when loose), **bleed** (a block covers the corner and runs off both edges; medium / loose), **lip** (a small block overlapping the band corner, its own corner sticking out), **square** | "a corner or two left mostly unpainted, a stretch where the colour reaches the edge" |
| ruled corner | the trim's artist's ruled crossing at one painted top corner (single thin strokes, kept above the caption block) | continuity with the picked trim |

**How the ink is clipped:** the scene as line art on paper (the ink layer, section 4) is clipped to the same blocks in
their SKETCH state (notches closed: the drawing is complete there, only the paint is missing; unpainted chamfers
40-60 % as deep, so the line art half fills the bare corner) plus a band along every block edge whose reach wanders
(a random walk through 14-34 / 24-58 / 30-66 px, knots every 20-70 px, straight between them). Whole runs of 80-220 px
either END in the white (50 / 62 / 72 % of runs, and always 6-22 px short of the frame) or run off the screen (always
where the paper is under 16 px). Run-level switching matters: per-stretch switching chopped scene lines that run
parallel to an edge into dashes.

**The presets** (amount 1, 40 seeds, `review/edges/loose/check-paint.txt`, p5 / median / p95):

| preset | looseness | in plain words | paper, % of frame (of y 180-1520) | paper depth left / right (y 200-1500) | top / bottom | ink past colour |
|---|---|---|---|---|---|---|
| `paint-subtle` | 0.5 | trim, but painted: 2 blocks, the margin wanders 8-40 px with small steps, one small unpainted corner (80-140 px chamfer), a lip, a shelf, the ground runs off the bottom once | 6 / 7 / 7 (3 / 3 / 4) | 0 / 21 / 34, 7 / 17 / 20 | 0 / 24 / 31, 0 / 37 / 55 | 14-34 px |
| `paint-medium` | 1 | clearly painted: 3 blocks stepping in and out, 2 notches, one unpainted corner (150-250 px), one bleed corner, a lip, 2 shelves, 2 tongues | 9 / 11 / 12 (4 / 5 / 7) | 0 / 36 / 74, 8 / 18 / 28 | 0 / 41 / 107, 0 / 64 / 162 | 24-58 px |
| `paint-loose` | 1.6 | as messy as reference 1 dares: 4 blocks, 4 deep notches (44-130 px), two DIAGONAL corners left as line art (210-340 px), a bleed corner, 3 tongues, 3 shelves; the bottom broken up under the app UI | 15 / 17 / 21 (6 / 7 / 8) | 23 / 38 / 103, 8 / 18 / 39 | 0 / 80 / 189, 0 / 136 / 278 | 30-66 px |

(Depth 0 = colour at the frame edge: a tongue or a bleed corner.) A seed's random structure is shared across looseness
(each run, feature and corner draws from its own fork): `paint-subtle`, `-medium` and `-loose` of one seed are the same
painting getting looser. The corner roles are drawn per seed, so different scenes get different bare corners.

**Phone-aware limits** (`PAINT_LIMITS`, `PHONE_UI` in `shared.ts`; checked on 600 edges: 3 presets x amounts 0.6-1.4 x
40 seeds, 0 failures): the colour contains the caption block (`CAPTION_SAFE`), so a caption never sits on paper and
no overlay stroke enters it; beside the caption block the paper is <= 38 px (left) / <= 77 px (right); under the right
rail (y 860-1540) <= 18 px (white icons on white paper would vanish); no unpainted chamfer, lip or bleed of a top
corner reaches the caption zone; the deepest work (chamfers, the widest wander, the bottom, up to ~280 px at loose) sits
under the top ~180 px and bottom ~400 px app UI. No paper is enclosed by colour (no specks between blocks) and no paper
hairline under 6 px runs along a frame edge (raster check). Features keep clear of the unpainted corners, the bleed and
lip blocks and the seams between bands, which is what removed the specks.

**One painting per scene:** the seed picks the painting. In a scene composition: `<EdgeProvider value={{variant:
'paint-medium', seed: 'scene-04'}}>`. In Film (core lane): `<FilmEdges scene={currentSceneId}>` appends the scene id to the
config seed, so the edge changes on the cut and never within a scene (`review/edges/loose/paint_seeds.png`: six seeds).

**Tuning by hand:** `variant: 'paint'` with `amount` = the looseness (0.5 / 1 / 1.6 = the presets, anything between or
up to ~2; below 0.5 every distance and count shrinks toward 0); a preset with `amount` multiplies its own looseness
(`paint-medium` at 1.2 = looseness 1.2). All the knobs per looseness are in `ANCHORS` in `paint.ts` (piecewise linear
between the presets). `paper: 'warm'` and `margin` work as for the other variants.

## 1. The three candidates (round 2)

| variant | in plain words | paper (amount 1, 1080x1920) | added ink |
|---|---|---|---|
| `clean` | the control: full-bleed, no treatment, one render | none | none |
| `trim` | **the quiet one.** A hand-trimmed window: thin scissor-cut paper slivers at the sides and top; the scene's own lines cross them and run off the screen; the bottom is open, so the ground and the foreground figures run out of frame in colour | left 28-32 px (one stretch drifts out to 36-40 over 80-120 px turns), right 22-26 (clear of the rail), top 12-16 (clear of the status bar), bottom 0 | one ruled ink corner (top-left: two thin crossing lines, 2-4 px out in the paper, the horizontal ending in the white); one sharp, uneven scissor snip at the top-right (a straight 18-28 x 30-46 px chamfer, never a radius) |
| `panel` | **the sketch runs out.** Reference 1's panel: the colour stops on a hand-cut edge, the line art keeps going into the white and visibly STOPS there (lines end 6-20 px short of the screen edge on some stretches); near the bottom the left cut snips out to the frame edge, so the bottom of the world is full-bleed | left 36-42 px (the side that carries the charm, away from the rail), right 18-22, top 14-18, bottom 0; the left cut ends at y 1490-1570 in one diagonal snip | ruled ink at both top corners, single strokes (top-left crossing pair, top-right one vertical running off the top) |

Measured over 40 seeds at amount 1 (`check-shapes.ts`): trim paper left 28-41 / right 20-27 / top 11-18 px, panel left
34-45 / right 16-25 / top 13-20 px; every side is off-axis by < 1 px; the scissor character is in the 1-3 px jogs between
2-4 straight cuts per side, never in noise.

How round 2 answers the judges (premium / immersion / charm / phone):

| note | change |
|---|---|
| 1 px grey seam along the contour where actors cross it (trim vista, panel vista) | fixed at the source: the colour layer is clipped once as a composited layer (section 4); measured 0 seam pixels (was 5,251 px differing along the contour) |
| peach cine banners leak through the margin | the margin is now line art for EVERY fill except the actors' colours (`margin="actors"` = allow-list: sun disc, mascot body); banners, sun halos, emblem discs go paper |
| big BigSun halo arcs spill into the white like a sticker | halos go paper in the margin; only the sun DISC and the mascot break the edge |
| trim's 16-24 px sides are ambiguous / pillarbox-like | trim sides 28-32 (left, with a wider stretch) and 22-26 (right) |
| rounded-looking 5-12 px corner snips | one sharp, asymmetric scissor snip; the other corner is square with ruled ink |
| white border closes all four sides ("matted print", "UI card") | both variants are OPEN at the bottom: the world runs off the frame in colour, foreground figures stay in colour |
| deep top / bottom margins sit under the status bar and the sound text (white on white) | top 12-18 px, bottom 0 |
| panel sides read as a card; right margin under the rail icons | panel left 36-42 (charm side), right 18-22 |
| panel: doubled re-strokes busy; limit overshoot to 1-2 corners | single strokes, two corners |
| panel: lines run straight off the screen ("a white mat under a drawing"); line ENDS should show in the white | the ink layer is clipped to a comb contour on the left: stretches of 80-180 px where the line art stops 6-20 px short of the edge, between stretches where it runs off |
| panel: blank white L at the top-right sky corner | one ruled vertical overshoot there |
| panel: let the colour bleed where ground / foreground meets the frame | bottom open + the left cut snips out to the frame edge at y 1490-1570 |
| warm paper for night scenes | `paper="warm"` (`PAPER_WARM` #FAF6EE) |
| vignette / construction / rough-tb | kept in the lab for reference, not refined (ranked out); construction's best idea (a couple of ruled guide strokes) survives as the ruled corners |

## 2. API

```tsx
import {EdgeTreatment, FilmEdges, EdgeProvider, FILM_EDGES, PAPER_WARM, edgeSpec} from '../lib/edges';

<EdgeTreatment variant="trim" seed="film" amount={1}>  <MyScene/>  </EdgeTreatment>   // captions go AFTER it (above)
```

| prop | default | what |
|---|---|---|
| `variant` | `'clean'` | `'clean' \| 'trim' \| 'panel' \| 'paint-subtle' \| 'paint-medium' \| 'paint-loose' \| 'paint'` (+ lab-only `'vignette' \| 'construction' \| 'rough-tb'`) |
| `seed` | `'edge'` | a different hand cut / a different painting (the film uses `'film'`; give each scene its own, e.g. its id; every number in this doc is for seed `'film'` or 40 seeds) |
| `amount` | `1` | **the strength** (section 3); for `paint` the looseness (section 0) |
| `paper` | `'white'` | `'white'` (reference 1's card), `'warm'` (`PAPER_WARM`, for night acts) or any colour |
| `margin` | `'actors'` | what keeps colour in the margin: `'actors'` = only `ACTOR_FILLS` (sun disc #EC6B2E in every TOD, mascot body #8D90CC + shade #7377B5) + `actorFills`; `'strict'` = nothing (the mascot becomes a white outline); `'look'` = round-1 behaviour (anything that ignores `<Look>` keeps its colour) |
| `actorFills` | - | extra fill colours that break the edge in colour |
| `skyFills` | - | extra flat sky values (only needed with `margin="look"`) |
| `vp` | `world.vp` | screen vanishing point (lab `construction` only) |
| `debug` | `false` | colour contour as a magenta hairline, ink contour cyan |

`edgeSpec(variant, seed, amount)` returns the pure geometry: `{colour, colourPts, ink, inkPts, strokes}` (screen px,
memoised); for `paint` also `colourPolys` / `inkPolys` (the blocks whose union the clips are; `colourPts` is then the
top band, which holds the caption block). `paintSpec(seed, looseness)` gives the paint geometry directly (+ `meta`:
corner roles, band seams). `CAPTION_SAFE` = the caption block every colour contour must contain. `FilmEdges` = `EdgeTreatment` with the
config in effect (provider > input props > `FILM_EDGES`); it steps aside in the caption check's `mask` pass; its optional
`scene` prop appends a scene id to the seed (one painting per scene).

## 3. The strength parameter (`amount`)

`amount` scales every distance of a variant: margin widths, the drift stretch, the snip, the comb insets, the jog size
and the stroke overshoot (stroke lengths stay put). `0` (or `clean`) renders the children untouched, with no second render.

Measured over 40 seeds (paper width in the always-visible zone y 250-1450 for the sides; jogs and the drift stretch
included):

| amount | trim (left / right / top) | panel (left / right / top) | use |
|---|---|---|---|
| 0.6 | 17-25 / 12-16 / 6-11 px | 20-27 / 10-15 / 8-12 px | night acts, very fast cuts: a whisper of paper |
| 0.8 | 22-33 / 16-22 / 8-14 px | 27-36 / 13-20 / 10-16 px | the judges' phone pick for panel |
| **1** | 28-41 / 20-27 / 11-18 px | 34-45 / 16-25 / 13-20 px | designed |
| 1.2 | 34-49 / 24-33 / 13-22 px | 40-53 / 19-30 / 15-24 px | hook / loop moments only |
| 1.4 | 36-57 / 28-38 / 15-25 px | 39-53 / 23-34 / 16-27 px | the side insets give way wherever they would reach the caption block (x < 50 beside it) |

Every contour at every amount 0.5-1.4 contains the caption block, and no stroke enters it (`check-shapes.ts`: 800
contours, 0 failures). Per scene: wrap that scene composition in its own `<EdgeProvider value={{variant: 'trim', amount: 0.6, paper: 'warm'}}>`.

## 4. How it works

The scene is rendered twice, both layers fixed to the SCREEN (the camera moves the world under them):

1. **Ink layer** (underneath, full frame): the same scene under `<Look fills="paper">` (every Fill white, people as white
   tombstones, cine pieces in their own paper state), on paper. A scoped CSS rule then paints every remaining `fill`
   attribute paper except ink, `none` and the actor colours: the World / cine sky (Look-exempt by design), raw-SVG pieces
   that ignore the Look (cine banners, sun halos, emblem discs), translucent glows. Scene-root `div` backgrounds go
   transparent. Result: the drawing as line art, with the sun disc and the mascot breaking the edge in colour. `panel`
   also clips this layer to its comb contour, so lines END in the white.
2. **Colour layer** on top, clipped to the variant's hand-cut contour. **The clip is `clip-path: path()` on a parent whose
   child is a composited layer (`will-change: transform`)**: Chrome then clips the finished layer once. A plain
   `clip-path` on the content anti-aliases every shape inside it separately (each shape blends at partial coverage over
   what is beneath), which left a 1 px darker seam wherever both layers show the same colour (an actor crossing the cut:
   rgb 216,177,146 in a 246,184,146 sun halo). Measured: plain clip 5,251 px differ from a masked render along the
   contour, composited clip 0 seam pixels (only AA rounding of 1 level). A CSS `mask-image` (SVG data URI) fixes it too
   but loads asynchronously; the composited clip is synchronous.
3. **Overlay strokes**: core `<Ink>` strokes in screen space (no `at`: already drawn; `exit={false}`: they never un-build).

Every contour is a pure function of `(variant, seed, amount)`, memoised: nothing depends on time, so the edge cannot move
or flicker. Captions are not part of the treatment; render them after it.

## 5. Using it in the film (do not edit Film yourself: core lane)

The one-line integration in `src/lib/Film.tsx` (core lane): wrap the SCENE STACK, not the captions:

```tsx
// Film's return, inside <AbsoluteFill>: the layers + transition overlays (wipers, bridges) go inside, SkyCaptions stays after it (above)
<FilmEdges>{layers.map((l) => <React.Fragment key={l.key}>{l.node}</React.Fragment>)}{overlays}</FilmEdges>
{showCaptions ? <SkyCaptions ... /> : null}
```

and the same around `Standalone`'s two scene blocks (the loop underlay + the scene). Then pick the look without a code change:
`npx remotion render src/index.ts Main out.mp4 --props='{"edges":"trim"}'` or `'{"edges":{"variant":"panel","amount":0.8}}'`;
make it the house look by setting `FILM_EDGES` in `src/lib/edges/config.tsx` (e.g. `{variant: 'trim', seed: 'film', amount: 1}`
or `{variant: 'paint-medium', seed: 'film', amount: 1}`); `--props='{"edges":"paint-loose"}'` works too. For a painting per
scene, Film passes the current scene's id: `<FilmEdges scene={id}>` (core lane).

## 6. Render cost

Frames only (PNG), full 1080x1920, concurrency 2, 30 spread frames, best of two interleaved runs
(`review/edges/final/bench_fullres.txt`):

| shot | clean | trim | panel |
|---|---|---|---|
| KitDemo street + lab camera move | 105 ms/frame | 145 (+38 %) | 152 (+45 %) |
| CineDemo monument (crane) | 125 | 150 (+20 %) | 156 (+25 %) |

With H.264 encoding (the final clips): clean 96, trim 132, panel 120 ms/frame.

**paint** (round 3, `review/edges/loose/bench_fullres.txt`; same method, 4 rotated rounds, best of 4; the machine was
shared with other lanes' renders, load 10-13 on 4 cores, so absolute numbers are inflated and noisy):

| shot | clean | trim | paint-subtle | paint-medium | paint-loose |
|---|---|---|---|---|---|
| KitDemo street + lab camera move | 135 ms/frame | 184 (+36 %) | 195 (+44 %) | 166 (+23 %) | 202 (+50 %) |
| CineDemo monument (crane) | 146 | 203 (+39 %) | 211 (+45 %) | 191 (+31 %) | 227 (+55 %) |

paint costs what trim costs: the same second (line-art) render; the presets differ only in clip geometry and their
spread is within the noise. Geometry: ~3 ms per (seed, looseness), once per scene; clip paths 0.5 KB (colour, 7
blocks) and 5-9 KB (ink). The second render costs +20-45 %, not
2x: page capture and encoding are paid once. In Film, the cost applies to every layer inside `FilmEdges` (during a
transition both scenes render twice).

## 7. Limitations

- **Actors are found by colour.** Any fill painted exactly the sun orange or the mascot's body / shade keeps its colour
  in the margin (orange is reserved for the sun by the style bible). The mascot's inner ears and cheeks (peach, shared
  with banners and placards) go paper in the margin. Fills set through inline `style={{fill}}` instead of the `fill`
  attribute are not matched (they keep their colour). A large peak sun disc still breaks the margin in orange (the halo
  does not).
- **Night**: white paper is the brightest thing in a night frame: use `paper="warm"` and/or `amount` 0.6-0.8 for that
  act (`review/edges/final/extra/`). Dark captions never sit on paper (the caption block is always inside the colour).
- **Scene whites merge with the paper** where a white object meets a side (the street's right-hand fence): the scene's
  ink still separates them, but trim's right sliver reads less there.
- **Comb clip (panel)**: an actor in colour that sits in the leftmost 6-20 px of a combed stretch is cut by the comb.
- **Pieces that draw a background on a `div`** (bridges) are transparent in the ink layer: the margin shows paper.
- **The composited colour layer** (`will-change: transform`) is one extra 1080x1920 layer per treatment: fine for one
  treatment around the scene stack; do not nest treatments.
- **paint: the blocks are screen-space, not per object.** Reference 1's fills stop where each OBJECT stops; here a block
  edge crosses whatever is under it (a car, a banner, a person half in colour, half line art). That is the "painted
  on top, incomplete" read, but a block edge can land awkwardly close to a key prop: pick another seed for that scene.
- **paint: the ink clip is a clip.** Line ends past the colour are cut square, not tapered; where several parallel
  scene lines cross one run they end on a common (slanting) line. A coloured actor in the paper beyond the ink reach
  (rare: the sun disc at a deep corner) is cut there too (as with panel's comb).
- **paint: paper under the app UI.** The bottom ~400 px carries the most paper at loose (median 136 px, up to ~280):
  the platform's white description text over white paper needs its own shadow. The top status bar likewise.
- **paint at night:** more paper than trim, so use `paper="warm"` and / or a lower looseness for dark acts.
- Captions must render after the treatment (Film and Standalone already draw them after the scenes). EdgeLab hides
  CineDemo's built-in caption overlay inside both layers (CSS) and draws its own lab captions on top.

## 8. Review material

`review/edges/loose/` (round 3, paint):

| file | what |
|---|---|
| `paint_sheet.png` | rows trim (the pick, for reference) / paint-subtle / paint-medium / paint-loose x the three shots (street 7.6 s dusk, monument 13.0 s, vista 4.6 s), full frames on a dark phone bezel, labelled |
| `paint_corners.png` | per shot and row, 300 px crops at 1:1: top-left, top-right, left edge (y 760-1060), bottom-left, bottom-right |
| `paint_vs_ref.png` | reference 1's panel edges (f_5.5, f_9.0, f_12.0 crops) above paint-medium / paint-loose crops of the street and the vista, 1:1 |
| `paint_seeds.png` | paint-medium on the street for six scene seeds: a separate painting each time |
| `clips/paint-{subtle,medium,loose}_street.mp4` | 6 s, 1080x1920, 30 fps: the street (KitDemo 3.2-9.2 s, day -> dusk) with the lab push x1.07 + 40 px pan, captions on top |
| `clips/side_by_side_street.mp4` | the three paint clips side by side (1620x1016), labelled |
| `clips/clean_street.mp4` | the clean render of the same clip (the edgecheck baseline) |
| `check-paint.txt` | the geometry check (600 edges, 0 failures) and the per-preset stats in section 0 |
| `edgecheck.txt` | contour stability in the clips: 85-98 % of scanline samples within 2 px of their position, per-frame mean drift 0.7-7 px (scene content crossing the cut; the deep loose bottom / top see the most people and lights cross it); debug-contour probe at lab t 0 / 2.5 / 5.9 s: 1-81 of 166-1119 hairline pixels differ (anti-aliasing over moving colour; no time input) |
| `bench_fullres.txt`, `bench_raw.txt` | the cost table in section 6 |
| `stills/`, `stills/seeds/` | the full-resolution stills behind the sheets |
| `tools/` | `stills.json`, `clips.json`, `bench.json` (render-lab / render-clips jobs), `loose_sheets.py` (`grid` / `corners` / `ref` / `seeds` / `labels`), `check-paint.ts`, `dump-paint.ts` + `geom.py` (a 0.25x geometry preview of the blocks for any seeds, no render), `probe.json` + `probe/` (the debug-contour probe) |

```bash
node review/edges/tools/render-lab.mjs review/edges/loose/tools/stills.json --scale=1 --concurrency=3
node review/edges/tools/render-clips.mjs review/edges/loose/tools/clips.json --scale=1 --concurrency=3
python3 review/edges/loose/tools/loose_sheets.py grid     # also: corners, ref, seeds, labels
npx esbuild review/edges/loose/tools/check-paint.ts --bundle --platform=node --log-level=error > /tmp/cp.cjs && node /tmp/cp.cjs
```

`review/edges/final/` (round 2, trim / panel, this code):

| file | what |
|---|---|
| `edges_final_sheet.png` | rows clean / trim / panel x the three shots (KitDemo street 7.6 s dusk, CineDemo monument 13.0 s, CineDemo vista 4.6 s), full frames on a dark phone bezel, labelled |
| `edges_final_corners.png` | per shot and variant, 300 px crops at 1:1: top-left, top-right, left edge (y 640-940), bottom-left |
| `clips/{clean,trim,panel}_street.mp4` | 6 s, 1080x1920, 30 fps: the street (KitDemo 3.2-9.2 s, day -> dusk) with a lab push x1.07 + 40 px pan, captions on top |
| `clips/side_by_side_street.mp4` | the three clips side by side (1644x1024), labelled |
| `extra/*_night*.png` | the street at 9.6 s: clean, trim / panel on white and on warm paper |
| `edgecheck.txt` | contour stability in the final clips: 95-98 % of scanline samples within 2 px of their position, per-frame mean drift 0.8-1.6 px (scene content crossing the cut; an edge riding the camera would drift tens of px); debug-contour probe at lab t 0 / 2.5 / 5.9 s: panel 0 contour px moved, trim 0 (32 threshold pixels in the cut's own column) |
| `bench_fullres.txt` | the cost table above |
| `stills/` | the full-resolution stills behind the sheets |

Round 1 (six variants, the geometry the judges scored; code at commit f28ae81): `review/edges/edges_comparison.png`,
`edges_corners.png`, `clips/`, `stills/`, `extra/`.

Tools: `review/edges/tools/render-lab.mjs` (many EdgeLab stills, one bundle), `render-clips.mjs` (clips and `bench`),
`edgecheck.py`, `check-shapes.ts`; `review/edges/final/tools/final_sheets.py` (`grid` / `corners` / `labels`) and its job
files (`stills.json`, `clips.json`, `bench.json`). Lab composition `EdgeLab` (`src/dev/EdgeLab.tsx`), props
`{variant, shot: 'street' | 'monument' | 'vista', amount, seed, from, cam, margin, paper, debug, captions}`:

```bash
scripts/still.sh EdgeLab 0 out.png --props='{"variant":"trim","shot":"vista"}'
node review/edges/tools/render-lab.mjs review/edges/final/tools/stills.json --scale=1
node review/edges/tools/render-clips.mjs review/edges/final/tools/clips.json --scale=1 --concurrency=2
python3 review/edges/final/tools/final_sheets.py grid      # also: corners, labels
python3 review/edges/tools/edgecheck.py review/edges/final/clips/trim_street.mp4 review/edges/final/clips/clean_street.mp4
npx esbuild review/edges/tools/check-shapes.ts --bundle --platform=node --log-level=error > /tmp/cs.cjs && node /tmp/cs.cjs
```
