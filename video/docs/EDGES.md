# EDGES: hand-made screen edges on a full-bleed world (`src/lib/edges`)

The user's note: *"I like a bit of hand-drawing messiness that the first video has around the edges of the screen. Maybe
we can experiment with a few different variations and see what looks cleaner, more polished and premium."*

Reference 1's edge charm is one rule (style bible 4 + 5.4): **the fills stop dead at the panel edge, the ink keeps going**
into the white card, corners overshoot, some contours stay open. We stay full-bleed (reference 2 framing, the viewer feels
small): the treatment only adds that ink-past-colour charm at the frame edge, in screen space, around any scene.

**Status (round 2, final comparison):** three candidates, `clean` (control), `trim` and `panel`, refined from the judges'
round-1 ranking (trim 26.5, panel 26.0, rough-tb 20, clean 20, construction 19.5, vignette 15.5). Review material:
`review/edges/final/` (section 6). The film default is still `clean` (`FILM_EDGES`); the user picks.

## 1. The three candidates

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
| `variant` | `'clean'` | `'clean' \| 'trim' \| 'panel'` (+ lab-only `'vignette' \| 'construction' \| 'rough-tb'`) |
| `seed` | `'edge'` | a different hand cut (the film uses `'film'`; every number in this doc is for seed `'film'` or 40 seeds) |
| `amount` | `1` | **the strength** (section 3) |
| `paper` | `'white'` | `'white'` (reference 1's card), `'warm'` (`PAPER_WARM`, for night acts) or any colour |
| `margin` | `'actors'` | what keeps colour in the margin: `'actors'` = only `ACTOR_FILLS` (sun disc #EC6B2E in every TOD, mascot body #8D90CC + shade #7377B5) + `actorFills`; `'strict'` = nothing (the mascot becomes a white outline); `'look'` = round-1 behaviour (anything that ignores `<Look>` keeps its colour) |
| `actorFills` | - | extra fill colours that break the edge in colour |
| `skyFills` | - | extra flat sky values (only needed with `margin="look"`) |
| `vp` | `world.vp` | screen vanishing point (lab `construction` only) |
| `debug` | `false` | colour contour as a magenta hairline, ink contour cyan |

`edgeSpec(variant, seed, amount)` returns the pure geometry: `{colour, colourPts, ink, inkPts, strokes}` (screen px,
memoised). `CAPTION_SAFE` = the caption block every colour contour must contain. `FilmEdges` = `EdgeTreatment` with the
config in effect (provider > input props > `FILM_EDGES`); it steps aside in the caption check's `mask` pass.

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
make it the house look by setting `FILM_EDGES` in `src/lib/edges/config.tsx` (e.g. `{variant: 'trim', seed: 'film', amount: 1}`).

## 6. Render cost

Frames only (PNG), full 1080x1920, concurrency 2, 30 spread frames, best of two interleaved runs
(`review/edges/final/bench_fullres.txt`):

| shot | clean | trim | panel |
|---|---|---|---|
| KitDemo street + lab camera move | 105 ms/frame | 145 (+38 %) | 152 (+45 %) |
| CineDemo monument (crane) | 125 | 150 (+20 %) | 156 (+25 %) |

With H.264 encoding (the final clips): clean 96, trim 132, panel 120 ms/frame. The second render costs +20-45 %, not
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
- Captions must render after the treatment (Film and Standalone already draw them after the scenes). EdgeLab hides
  CineDemo's built-in caption overlay inside both layers (CSS) and draws its own lab captions on top.

## 8. Review material

`review/edges/final/` (round 2, this code):

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
