# EDGES: hand-made screen edges on a full-bleed world (`src/lib/edges`)

> **v1-era (banner, 2026-10-27).** Keep it for the edge engine's API and measurements. The rule is the playbook's:
> paper edges ('paint-subtle') are liked, never at the top or beside the caption band. Its "messy" intent, ink running
> past the colour and the ruled overshoot strokes yield to the clean pen (`docs/look/CRAFT.md` §c): edges are opt-in
> per film, decided with the G4 look clip and added at G6, 'paint-subtle' at most (never medium or loose), with no
> ruled overshoot and no ink past the colour. Film's default (`FILM_EDGES` on for a full film) stays for v1; a new film
> passes `edges={false}` until its G4 clip approves edges. Current direction: `docs/look/DIRECTION.md`.

The user's note: *"I like a bit of hand-drawing messiness that the first video has around the edges of the screen. Maybe
we can experiment with a few different variations and see what looks cleaner, more polished and premium."*

Reference 1's edge charm is one rule (style bible 4 + 5.4): **the fills stop dead at the panel edge, the ink keeps going**
into the white card, corners overshoot, some contours stay open. We stay full-bleed (reference 2 framing, the viewer feels
small): the treatment only adds that ink-past-colour charm at the frame edge, in screen space, around any scene.

**Status (round 3, paint, refined):** the user picked the TRIM direction with a note: *"I'm thinking it's more like a
default white base and then we paint on top of it in a somewhat messy, incomplete way, like in the very first video,
with the edges around the page even more loose and messy."* Answer: a variant **`paint`** (white paper, the colour
painted on top) with a looseness knob and three presets, `paint-subtle`, `paint-medium`, `paint-loose` (section 0).
This pass refined all three from the two judges' round-3 notes (subtle 6.5 / 5, medium 7.5 / 7, loose 6 / 8): fewer,
bigger, hand-laid gestures (no jog, shelf or tab under 26-48 px); a corner left bare only where the scene has line art
there (scene hints); keep rects, so a hero, the mascot or a lamp is never half colour, half line art; no dashed ink; and
one decisive gesture in the phone's visible zone. `trim` / `panel` / `clean` are unchanged. Review material:
`review/edges/loose/final/` (section 8). The user picked **`paint-subtle`** to start (22:30, `docs/BRIEF.md`: "let's start
with subtle", it may move up to medium); the core lane made it the house default (`FILM_EDGES`) and wraps Film's scene stack
in `<FilmEdges scene={edgeScene}>`.

Round 2 (kept below for reference): three candidates, `clean` (control), `trim` and `panel`, refined from the judges'
round-1 ranking (trim 26.5, panel 26.0, rough-tb 20, clean 20, construction 19.5, vignette 15.5); material in
`review/edges/final/`.

## 0. paint: white paper, the colour painted on top (round 3)

**The idea.** The frame is a sheet of white paper. The scene's line art is drawn on it, and the colour is laid on top as
a few flat blocks that do not quite reach the edges: the colour stops on long, crisp, slightly tilted edges that step
once, leave a corner or a bite bare where there is drawing to show, and here and there run off the frame. The line art
keeps going past the colour into the white and stops at varied points. That is reference 1's panel (f_3.0, f_5.5, f_9.0,
f_12.0: fills clipped to flat blocks, ink running 30-62 px into the white, line-art people and bikes standing on bare
paper), loosened and taken to every edge of a full-bleed 9:16 frame. Flat colour only: no brush texture, blur, gradient
or opacity. The edge is fixed on screen, a pure function of (seed, looseness, scene hints).

**How the colour is built** (`src/lib/edges/paint.ts`): one BODY polygon plus a few union blocks (the clip path's
nonzero rule unions same-wound subpaths, so no polygon boolean is needed):

| element | what it is | the judges' note it answers |
|---|---|---|
| body sides | each side is 1-4 slightly tilted blocks (left: the caption band, the visible band, 1-2 bands under the bottom UI; right: the caption band, the rail band, the band under the UI). Two blocks meet in ONE clear step of 0 or >= 26 / 40 / 48 px (subtle / medium / loose), slanted 10-25 deg; where no full step fits, the earlier block slopes into the next | "drop the small shelves and teeth; one long, slightly off-axis ruled edge with a single clear step"; "tilt the axis-aligned tabs" |
| bare corner | the paint did not reach it: an irregular diagonal run with two soft knees. The drawing half covers it and its lines run on into the white. ONLY where the scene has line art there (`hints.ink` >= 0.3), never through a keep rect (it shrinks in height or width, or the role moves to another corner) | "allow a deep bare corner only where the line-art layer is dense (rule out flat skies)"; "the vista's top-right: a blank white trapezoid" |
| step corner | a partly bare TOP corner (medium / loose): the block stops short in a tilted L, the line art fills it, the ruled crossing pair marks the block's corner | "leave one top corner partly bare when the scene has ink there"; "a crossing pair of strokes, like f_9.0's top-left" |
| bleed corner | colour covers the emptiest corner (usually flat sky) and runs off both edges; its ends are clean cuts | "otherwise turn it into a bleed corner" |
| bites | the visible-zone gesture: one straight-sided bite in the left side, y 680-1460 (medium 92-124 px from the frame, loose 128-166), one on the right between the caption and the rail (loose), bites in the bottom under the UI. Only where there is drawing (`hints.ink.left` / `right` >= 0.3, measured: a scene without hints gets no visible-zone bite; `bottom` >= 0.25); the drawing inside a bite is complete. A scene where no corner can go bare gets a bottom bite instead | "one deep bite of 80-160 px on the left at y 900-1450, with the line art running on into it, like the bikes in f_5.5"; "limit visible-zone bites to shallow, straight ones" (medium) |
| tongues | colour runs off the frame for a stretch (the ground off the bottom, one end a long slant), only where the paper is deep enough for a real step | "colour still reaches the edge at the bottom-right" |
| keep rects | `hints.keep`: hero figures, the mascot + the ground under it, a lamp + halo, a banner, a pillar. Always in colour: corners, bites and tongues keep 60-180 px clear, and a last block guarantees it (running off a frame side the rect comes within 110 px of) | "keep-out boxes so block edges never cut the hero or mascot"; "each figure either fully line art or fully coloured" |
| clean-up | every white notch narrower than 160 px along a side, and every white stretch shorter than 240 px between two stretches of colour at the edge, becomes colour; any paper the union encloses is filled | "a block running to the edge right next to a white bite"; "sub-40 px notches look glitchy" |
| ruled strokes | at most one pair at the top (the step corner's block corner, else a painted top corner) and one at the bottom (a bare corner holding little drawing: its block outline, ruled where the paint stopped). Single thin strokes, 2-4 px out in the paper, overshooting 14-24 / 24-40 / 40-60 px | "add 2-3 ruled construction strokes there, so white areas always contain drawing"; "one top corner's ink overshoot 40-60 px" |

**How the ink is clipped:** the scene as line art (section 4) is clipped to the body's SKETCH (bites and step corners
closed: the drawing is complete there, only the paint is missing; bare corners half drawn) plus a reach band along every
edge. Along one edge the reach either ENDS in the white (one peak: it rises, then falls, through 18-38 / 26-56 / 32-66
px; lines stop 6-20 px short of the frame), RUNS OFF, or does half and half with one perpendicular cut. Where two bands
meet (a block corner, a step), every gap under 60 px on a line parallel to the frame is bridged. A scene line that runs
parallel to an edge shows on one stretch and ends once. The round-3 dashes ('- - -' rails at the vista's bottom-left,
the street's broken ground line) came from runs switching every 80-220 px along one edge.

**Scene hints** (`src/lib/edges/hints.ts`; the type `EdgeHints` is in `shared.ts`). `ink` is the line-art density, 0-1,
per region: tl, tr, br, bl, left (y 860-1460), right (y 630-860) and bottom. `review/edges/loose/final/tools/scan_hints.py`
measures it from a clean render as the share of ink-colour pixels, where 5 % counts as 1, and also returns the mascot's
keep rect. `keep` holds screen rects for the whole shot. `EDGE_HINTS` is keyed by scene id, and `<FilmEdges scene={id}>`
applies that scene's entry. A scene without an entry still works: every region is allowed, and a bare corner gets its
block outline ruled in. The lab shots:

- `edgelab/street`: the branches make both top corners bare. The coat figure at the left edge and the mascot are kept,
  so the visible bite sits above the figure, over the car.
- `edgelab/monument`: the top is flat sky, so no top corner goes bare. The mascot, its pillar, the left banner, the
  lamp and the foreground head are kept, so no corner can go bare at all, and the bottom's line-art crowd gets the bite.
- `edgelab/vista`: the flat sky becomes a bleed corner. The hero and the mascot are kept, and the left bite holds the
  city's line art.

**The presets** (amount 1 = the preset; 40 seeds x 4 scenes (the three lab shots' hints and no hints);
`final/check-paint.txt`; p5 / median / p95):

| preset | looseness | in plain words | paper, % of frame (of y 180-1520) | paper depth left / right (y 200-1500) | top / bottom | bare corners | ink past the colour |
|---|---|---|---|---|---|---|---|
| `paint-subtle` | 0.6 | **trim, painted.** Each side one long, slightly tilted edge with one clear step (>= 26 px); ONE bare corner where the scene has drawing (if none can go bare: one bite in the bottom's drawing); the ruled crossing at a painted top corner. The phone's visible zone stays as calm as trim | 4 / 7 / 10 (2 / 5 / 6) | 0 / 25 / 61, 14 / 18 / 20 | 14 / 20 / 25, 0 / 19 / 159 | 0 / 1 / 1 | 18-38 px |
| `paint-medium` | 1 | **clearly painted, still calm where the phone shows it.** Blocks meet in >= 40 px steps; a bare corner and a partly bare top corner where there is drawing (branches, a crowd), a bleed on the emptiest corner; one left bite (92-124 px from the frame) holding the scene's line art; a bite in the bottom's drawing under the UI | 7 / 10 / 20 (3 / 7 / 8) | 0 / 29 / 109, 10 / 12 / 52 | 0 / 38 / 190, 0 / 27 / 264 | 0 / 1 / 1 | 26-56 px |
| `paint-loose` | 1.6 | **as messy as reference 1 dares.** Two bare corners (diagonal when both hold drawing), a deep left bite (128-166 px) and a right bite between the caption and the rail, >= 48 px steps, the bottom broken up under the UI, the f_9.0 ruled crossing overshooting 40-60 px | 9 / 13 / 25 (3 / 9 / 11) | 0 / 32 / 142, 10 / 15 / 76 | 0 / 72 / 213, 0 / 0 / 313 | 0 / 1 / 2 | 32-66 px |

**The code since the posted reel (2026-10-25):** `paint-subtle` paints colour past the top edge and beside the caption
band, so there is no paper at the top or beside the band (`src/lib/edges/paint.ts`, the 0.6 anchor: `top`, `left0`,
`right0` = -40); the top numbers and the "ruled crossing at a painted top corner" in the table above predate that
fix. The playbook rule wins: never paper at the top of the frame or beside the caption band.

(Depth 0 = colour at the frame edge: a bleed, a tongue, a keep block.) A seed's random structure is shared across
looseness (each element draws from its own fork), so `paint-subtle`, `-medium` and `-loose` of one seed are the same
painting getting looser. With the hints, one scene's paintings share their bare corners (the scene decides where the
drawing is) and differ in their sides and bottom (`final/paint_seeds.png`).

**Phone-aware limits** (`PAINT_LIMITS`, `PHONE_UI` in `shared.ts`; `final/check-paint.txt`: 2400 edges = 3 presets x amounts 0.6-1.4 x 4 scenes x 40 seeds, 0 failures):

- The colour contains the caption block (`CAPTION_SAFE`), and no stroke enters it.
- Beside the caption block the paper is <= 38 px on the left and <= 77 px on the right (the caption bands are clamped,
  even above loose).
- Under the right rail (y 860-1540) the paper is 10-18 px.
- Every keep rect is inside the colour.
- No enclosed paper and no paper hairline under 6 px along a frame edge.
- Jogs (a 6-24 px level change between flat stretches of a side's paper): with no hints, at amount 1, 0.03 / 0.13 / 0.10 per edge (subtle / medium / loose), against 1.50 / 1.35 / 0.75 in the first pass the judges scored. Over all amounts and scenes it is 1.2 / 1.0 / 0.7, almost all where a keep block or a bleed reaches the frame across the 10-18 px rail band or a thin bottom strip (section 7).
- Ink gaps under 60 px on a line parallel to an edge (a scene line drawn as dashes): with no hints, at amount 1, 0 / 0 / 0.05 per edge, against 1.5 / 3.6 / 5.2 in the first pass. Over all amounts it is 0.1-0.5, mostly at looseness 1.2-2.2.

The deepest work (bare corners, the bottom) sits under the top ~180 px and bottom ~400 px app UI. The visible zone
carries a single decisive gesture: the left bite, plus the right bite at loose. `final/paint_phone.png` draws the app UI
on the frames.

**One painting per scene:** the seed picks the painting and the hints place it. In a scene composition:
`<EdgeProvider value={{variant: 'paint-medium', seed: 'scene-04'}}>` + `hints={EDGE_HINTS['scene-04']}` on the
treatment. In Film (core lane): `<FilmEdges scene={currentSceneId}>` appends the scene id to the config seed and looks up
`EDGE_HINTS[currentSceneId]`, so the edge changes on the cut and never within a scene.

**Tuning by hand:** `variant: 'paint'` with `amount` = the looseness (0.6 / 1 / 1.6 = the presets, anything between, up
to ~2; below 0.6 every distance shrinks toward 0, the steps stay a full step or none). A preset with `amount` multiplies
its own looseness (`paint-medium` at 1.2 = looseness 1.2). All the knobs per looseness are in `ANCHORS` in `paint.ts`
(piecewise linear between the presets). `paper: 'warm'` and `margin` work as for the other variants.

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
import {EdgeTreatment, FilmEdges, EdgeProvider, FILM_EDGES, EDGE_HINTS, PAPER_WARM, edgeSpec} from '../lib/edges';

<EdgeTreatment variant="trim" seed="film" amount={1}>  <MyScene/>  </EdgeTreatment>   // captions go AFTER it (above)
<EdgeTreatment variant="paint-medium" seed="scene-04" hints={EDGE_HINTS['scene-04']}>  <Scene04/>  </EdgeTreatment>
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
| `hints` | - | `paint` only: what the scene under the edge holds (`EdgeHints`: `ink` = line-art density per region, `keep` = rects that stay in colour; section 0, `edges/hints.ts`). `FilmEdges` fills it from `EDGE_HINTS[scene]` |
| `vp` | `world.vp` | screen vanishing point (lab `construction` only) |
| `debug` | `false` | colour contour as a magenta hairline, ink contour cyan |

`edgeSpec(variant, seed, amount, {hints})` returns the pure geometry: `{colour, colourPts, ink, inkPts, strokes}` (screen
px, memoised); for `paint` also `colourPolys` / `inkPolys` (the blocks whose union the clips are; `colourPts` is then the
body, which holds the caption block). `paintSpec(seed, looseness, hints)` gives the paint geometry directly (+ `meta`:
corner roles, block seams, bites / tongues / keep blocks built). `CAPTION_SAFE` = the caption block every colour contour
must contain. `FilmEdges` = `EdgeTreatment` with the config in effect (provider > input props > `FILM_EDGES`); it steps
aside in the caption check's `mask` pass; its optional `scene` prop appends a scene id to the seed (one painting per
scene) and applies `EDGE_HINTS[scene]` (unless the config carries its own `hints`).

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

The one-line integration, in `src/lib/Film.tsx` since 22:39 (core lane): the SCENE STACK is wrapped, not the captions,
and the scene on screen is passed:

```tsx
// Film's return, inside <AbsoluteFill>: the layers + transition overlays go inside, SkyCaptions stays after it (above)
{edges ? <FilmEdges scene={edgeScene}>{stack}</FilmEdges> : stack}
{showCaptions ? <SkyCaptions ... /> : null}
```

and the same around `Standalone`'s two scene blocks (the loop underlay + the scene). Then pick the look without a code change:
`npx remotion render src/index.ts Main out.mp4 --props='{"edges":"trim"}'` or `'{"edges":{"variant":"panel","amount":0.8}}'`;
make it the house look by setting `FILM_EDGES` in `src/lib/edges/config.tsx` (e.g. `{variant: 'trim', seed: 'film', amount: 1}`
or `{variant: 'paint-medium', seed: 'film', amount: 1}`); `--props='{"edges":"paint-loose"}'` works too.

**For paint, the one line is `<FilmEdges scene={currentSceneId}>`**: one painting per scene, and the scene's `EDGE_HINTS`
entry applied (bare only where there is drawing, keep rects never cut). Appending the scene id to the seed changes the
edge on the cut and never within a scene.

**Each scene's entry lives in `src/lib/edges/hints.ts`** (section 5.1: S01-S06, S11, S12 done; S07-S10 still to do).
Render the scene clean at 5-6 frames of its shot (the first and last 0.2 s, every camera extreme), run `python3
review/edges/loose/final/tools/scan_hints.py <scene-id> f1.png f2.png ...`, paste the printed entry, add hero figures,
figures at the frame edges and key props to `keep` by hand, then look at Main with edges (section 5.1).

Until then a scene gets the hint-less edge (`final/stills/nohints/`). It is sound: no visible-zone bites, every corner
allowed, and a bare corner's block outline ruled in. But a figure standing at the frame edge can be trimmed by the
paper margin, as trim's sliver would trim it.

### 5.1 The film's hints (phase A2, `paint-subtle`)

`paint-subtle` leaves ONE corner bare: the densest corner (`ink` + a seeded jitter) that has `ink >= 0.3` and fits
around the keep rects; with none, the best corner with `ink >= 0.12` (its block outline ruled in); with none of those,
a bite in the bottom's drawing (`bottom >= 0.3`, if it fits between the keep rects). It has no visible-zone bites, so
`left` / `right` only matter from `paint-medium` up. A bare corner with `ink < 0.5` gets its block outline ruled in
(two thin crossing strokes). Measured per scene on 6-7 clean full-res frames (first / last 0.2 s, camera extremes),
Pip's bbox every 0.1 s, and the ink inside the bare corner's own triangle (a top corner is only 180-260 x 90-130 px at
subtle, a bottom one 180-260 x 300-400 px: the scan's corner regions are bigger, so a building or a lamp post beside the
corner can score high while the corner itself is flat pavement). Then checked on Main with edges, 4+ frames per scene.

| scene | bare corner | ink set by hand (and why) | keep rects |
|---|---|---|---|
| S01 (+ S12) | top-right: the hanging leaves, the stem in the white. The notch is ~90 x 80 px (x ~970-1060, y ~18-95, under the top UI) | `tr` 0.45 (leaves measure 0.63-0.73). Under 0.5 so a ruled pair is drawn, but it runs along the thin top and right margins (y ~12 from x 812, x ~1069 from y 0-166), not around the notch. In S01's dive (f134-137, f141 = 4.47-4.57 s, 4.70 s) flat sky swings through and the notch reads as a blank white rectangle for ~5 frames. Accepted: `tr` 0.1 would remove the bare corner (the leaves go into colour for all of S01 and S12). S12's notch holds the leaves throughout | left onlooker (phone raised), near observer (grows in the dive), cap onlooker, the lamp at the left edge (S01: head at x 10-75), Pip on the bollard, Pip's leap out at the right edge (4.45-4.7 s) |
| S02 | bottom-left: the board's leg and the ground lines | - | the three audience heads, the site plaque at the left edge. No rect for Pip: his max x is 1049 (f142, landing from S01), the right paper starts at x ~1060 at his height, so the rect only cut a step into the right side (y 600-900). Without it the right side is one 18-24 px strip |
| S03 | none: flat sky at the top, the near walkers fill both bottom corners, the bottom is the flat plan (0.13: no bite) | - | both near walkers, Pip (arrival, disc). In the opener (8.4 to ~10 s) the left 54 px strip ends in a straight cut at y 1320 (the walker's rect, before the walkers appear): accepted |
| S04 | none | `br` / `bl` 0.1: the scan's 0.48 / 0.16 come from the house and the lamp post; the corner triangles hold flat pavement, and nothing in the dive (a bare corner read as a blank trapezoid) | Pip (steps -> window; interior). The 57 px left strip runs 3-10 px from the lamp post's outline (x 60-104), so the post reads as the paint's edge |
| S05 | none: the foreground audience fills the whole bottom | - | the audience (the world runs off the bottom in colour), the team at the left edge, the messenger running in at the right, Pip at the board and on the exit, the AUG calendar at the left edge. The calendar's rect makes a 200 px tab (y 680-880) above the 51 px left strip; it stays: the calendar pans to x 38-98 at 19.67 s and ~0-70 at 19.73 s (without the rect it is half or all line art in f590-593; merged as `[0,690,90,1350]` the left side below y 680 loses all its paper) |
| S06 | bottom-right: the shrub and the bench as line art | `bl` 0.2: under the kept cart there is only flat pavement. Measured without the white page of the last 0.15 s (paper on a white page does not show) | the messenger entering at the left edge + the cart + Pip on it (one rect: the cart sits at x 0-160 all shot). The bare corner is empty only in f594 (the cut frame); the shrub is in by f596. The S06 -> S07 painting switch (21.985 s) falls on S06's white page |
| S11 | bottom-right: govC's steps | `bl` 0.25: the lamp's foot and the onlookers fill it, so it must not go bare | Pip at govB's window, the two onlookers. No rect for Pip's in-hop: he is in the left paper only in f1370-1372 (45.67-45.73 s; x >= 89 from f1373). The rect `[0,1280,135,1470]` ran a 200 px colour tongue down the left side for the whole 6.5 s shot (paper / tongue / paper at y ~1250-1490). Without it the left side is one 54 px strip from y 800 to the bottom; the cost is Pip's peach inner ear going paper-white in f1371 (his body and outline stay) |
| S12 | wears S01's painting (Film, for the loop seam), so S01's entry is the union over both shots; `EDGE_HINTS.S12` is the same object | | |

Lessons:
- **A keep rect within 110 px of a frame side runs off that side** (colour to the edge). A rect for a lamp post at the
  left edge takes the whole left paper below it away: S11's lamp sits at x 95-180, clear of the 46-62 px paper, so it
  gets no rect; `bl` is held down instead, so no corner can cut it.
- **A rect is for the whole shot, so weigh it against the frames it protects.** A figure that touches the side for a
  few frames costs a tongue or a step for every frame of the shot. Check the figure's bbox against the paper depth
  first: S02's Pip rect protected nothing (max x 1049, paper from x ~1060) and S11's in-hop rect protected 3 frames
  for a 6.5 s tongue, so both were dropped. Pip's body and shade are actor fills, so in the paper he keeps his colour
  and only his peach inner ears and cheeks go paper (section 7). A prop in scene colours that sits on the edge for
  much of the shot still needs its rect (S05's calendar, S06's cart).
- **Steering by `ink`:** below 0.3 a corner never goes bare when another dense corner fits; below 0.12 it is not even
  the fallback. Write the reason next to every hand-set value.
- **Keep blocks meet the thin margins in a step** (the 10-24 px rail band, the bottom strip): 124 jogs over the film's
  8 entries x 10 seeds at subtle, 1.55 per painting (144 / 1.8 before S02 and S11 lost their Pip rects; the earlier
  "3.6 per edge" divided by the lab check's 40) (section 7). The film's geometry check (`check-paint.ts` with these
  entries and seeds `film/<id>`, 3 presets x 10 seeds = 240 edges): 0 failures (caption block, keep rects, rail, holes,
  hairlines). Corner roles at subtle: S01 / S12 top-right bare, S02 bottom-left, S06 and S11 bottom-right, the rest
  none.
- **The loop seam** is unchanged: Main 55.3333 s vs 0 s differ only in the caption band (0 px below y 600).
- What is still half colour, half line art: S03's tree crown at the left edge (y 1010-1250, cut by the 46-62 px
  paper, f_5.5's half-filled crown read), a 10-20 px teal sliver at the left of S06's shrub in its bare corner, Pip's
  inner ear in S11's f1371 (in-hop, the left paper).
- **Checked (review of 5.1):** Main with edges at 51 frames (5-9 per scene) against the same frames clean, Pip tracked
  on 476 clean frames (every 2nd): no pop within a scene (every frame matches its own scene's painting; S12's match
  S01's exactly), Pip never on paper, no bare corner under a caption, every keep rect inside the colour. That ran on the
  entries before S02 / S11 lost their Pip rects; since then Pip is on paper only in the 3 S11 in-hop frames above
  (S02's Pip stays left of x 1049, clear of the new right strip; re-rendered and checked on Main).

## 6. Render cost

Frames only (PNG), full 1080x1920, concurrency 2, 30 spread frames, best of two interleaved runs
(`review/edges/final/bench_fullres.txt`):

| shot | clean | trim | panel |
|---|---|---|---|
| KitDemo street + lab camera move | 105 ms/frame | 145 (+38 %) | 152 (+45 %) |
| CineDemo monument (crane) | 125 | 150 (+20 %) | 156 (+25 %) |

With H.264 encoding (the final clips): clean 96, trim 132, panel 120 ms/frame.

**paint** (round 3 refined, `review/edges/loose/final/bench_fullres.txt`). Frames only, full res, the street with the lab
camera move, 8 spread frames per job, concurrency 1, six rotated rounds. Other lanes were rendering on the same machine
(load 6-11 on 4 cores), so each variant's minimum is the estimate:

| shot | clean | trim | paint-subtle | paint-medium | paint-loose |
|---|---|---|---|---|---|
| KitDemo street + lab camera move | 219 ms/frame | 306 (+40 %) | 314 (+43 %) | 300 (+37 %) | 318 (+45 %) |

paint costs what trim costs: the same second (line-art) render. The presets differ only in clip geometry (colour 0.3-0.7
KB, ink 4-13 KB), and their spread is within the noise. The geometry costs ~55 ms per (seed, looseness, hints) on first
use (the raster hole fill), memoised, so once per scene. The second render costs +20-45 %, not 2x: page capture and
encoding are paid once. In Film, the cost applies to every layer inside `FilmEdges` (during a transition both scenes
render twice).

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
  edge crosses whatever is under it. The keep rects protect what matters (heroes, the mascot, lamps, a banner); other
  props can still be half colour, half line art (the street's car in the loose left bite), which is the "painted on top,
  incomplete" read, like f_5.5's half-filled tree crown.
- **paint: the hints are per shot, in screen px.** A keep rect covers the figure over the whole shot (a long camera move
  needs a bigger rect or two frames scanned); line-art density is measured, not known: a scene without hints may get a
  bare corner on an empty area (its block outline is then ruled in, so it is never blank). Scenes whose content changes
  a lot within a shot should take the minimum over several frames (the scan tool does).
- **paint: a thin margin meets colour at the edge in a small step.** Where a keep block or a bleed reaches the frame
  next to the 10-18 px rail band or a thin bottom strip, the step is that margin's depth (8-24 px; ~0.6-0.9 per edge,
  mostly under the bottom UI): the phone limits leave no room for a bigger one.
- **paint: the ink clip is a clip.** Line ends past the colour are cut square, not tapered; where several parallel
  scene lines cross one stretch they end on a common (slanting) line. A coloured actor in the paper beyond the ink reach
  (rare: the sun disc at a deep corner) is cut there too (as with panel's comb).
- **paint: paper under the app UI.** The bottom ~400 px carries the most paper at loose (up to ~310 px): the platform's
  white description text over white paper needs its own shadow. The top status bar likewise.
- **paint at night:** more paper than trim, so use `paper="warm"` and / or a lower looseness for dark acts.
- **paint geometry cost:** ~55 ms per (seed, looseness, hints) on first use (the hole fill rasterises the frame once),
  memoised: once per scene, not per frame.
- Captions must render after the treatment (Film and Standalone already draw them after the scenes). EdgeLab hides
  CineDemo's built-in caption overlay inside both layers (CSS) and draws its own lab captions on top.

## 8. Review material

`review/edges/loose/final/` (round 3 refined, paint: **the material to judge**):

| file | what |
|---|---|
| `paint_sheet.png` | rows trim (the round-2 pick, for reference) / paint-subtle / paint-medium / paint-loose x the three shots (street 7.6 s dusk, monument 13.0 s, vista 4.6 s), full frames on a dark phone bezel, labelled; each shot with its `EDGE_HINTS` |
| `paint_phone.png` | the same with a phone app UI drawn on top (status bar + header 180 px, description block 400 px, the right action rail): what a viewer actually sees of each edge |
| `paint_corners.png` | per shot and row, 300 px crops at 1:1: top-left, top-right, left edge (y 800-1100), bottom-left, bottom-right |
| `paint_vs_ref.png` | reference 1's panel edges (f_5.5, f_9.0, f_12.0 crops) above paint-medium / paint-loose crops of the street and the vista, 1:1 |
| `paint_seeds.png` | paint-medium on the street for six scene seeds (same hints: the bare corners follow the drawing, sides and bottom differ) |
| `clips/paint-{subtle,medium,loose}_street.mp4` | 6 s, 1080x1920, 30 fps: the street (KitDemo 3.2-9.2 s, day -> dusk) with the lab push x1.07 + 40 px pan, captions on top |
| `clips/trim_street.mp4`, `clips/clean_street.mp4` | the same clip with trim (the 4-panel's reference) and clean (the edgecheck baseline) |
| `clips/side_by_side_street.mp4` | trim / paint-subtle / paint-medium / paint-loose side by side (4 x 432 px), labelled |
| `check-paint.txt` | the geometry check (2400 edges, 0 failures) and the per-preset stats in section 0 |
| `edgecheck.txt` | contour stability in the clips against the clean clip: 93-99 % of scanline samples within 2 px of their position, per-frame mean drift 0.8-7 px (scene content crossing the cut: the string lights at dusk at the top, people at the bottom); the contour has no time input |
| `bench_fullres.txt`, `bench_raw.txt` | the cost table in section 6 |
| `stills/nohints/` | paint-subtle / -medium on the three shots WITHOUT hints: what a film scene gets before its `EDGE_HINTS` entry exists (calm visible zone; a figure at the frame edge can be trimmed by the margin) |
| `stills/` | the full-resolution stills behind the sheets (`seeds/`; `scan/` = the clean frames the lab hints were measured on) |
| `tools/` | `stills.json`, `seeds.json`, `nohints.json`, `clips.json`, `clean_clip.json`, `bench.json`, `clean.json` (render-lab / render-clips jobs), `final_sheets.py` (`grid` / `phone` / `corners` / `ref` / `seeds` / `labels`), `check-paint.ts` (`--quick`: amount 1, 10 seeds; `--where`: print jog / dash locations), `scan_hints.py` (a scene's `EDGE_HINTS` entry from clean renders), `dump-paint.ts` + `sim.py` (a quick simulated composite of the edge over a clean still, no Chrome) |

```bash
node review/edges/tools/render-lab.mjs review/edges/loose/final/tools/stills.json --scale=1 --concurrency=2   # + seeds.json
node review/edges/tools/render-clips.mjs review/edges/loose/final/tools/clips.json --scale=1 --concurrency=3
for m in grid phone corners ref seeds labels; do python3 review/edges/loose/final/tools/final_sheets.py $m; done
npx esbuild review/edges/loose/final/tools/check-paint.ts --bundle --platform=node --log-level=error > /tmp/cp.cjs && node /tmp/cp.cjs
python3 review/edges/loose/final/tools/scan_hints.py scene-04 clean_a.png clean_b.png        # a scene's hints
```

`review/edges/loose/` (round 3 first pass, paint; the geometry the judges scored, code at commit 1d0b2a6):

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
| `stills/nohints/` | paint-subtle / -medium on the three shots WITHOUT hints: what a film scene gets before its `EDGE_HINTS` entry exists (calm visible zone; a figure at the frame edge can be trimmed by the margin) |
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
