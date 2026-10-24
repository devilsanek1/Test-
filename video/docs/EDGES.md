# EDGES: hand-made screen edges on a full-bleed world (`src/lib/edges`)

The user's note: *"I like a bit of hand-drawing messiness that the first video has around the edges of the screen. Maybe
we can experiment with a few different variations and see what looks cleaner, more polished and premium."*

Reference 1's edge charm is one rule (style bible 4 + 5.4): **the fills stop dead at the panel edge, the ink keeps going**
30-62 px into the white card, corners overshoot, some contours stay open. We stay full-bleed (reference 2 framing, the
viewer feels small). The treatment only adds that ink-past-colour charm at the frame edge, in screen space, around any
scene.

```tsx
import {EdgeTreatment, FilmEdges, EdgeProvider} from '../lib/edges';
<EdgeTreatment variant="trim" seed="film" amount={1}> <MyScene/> </EdgeTreatment>   // captions go AFTER it (above)
```

## 1. How it works

The scene is rendered twice, both layers fixed to the SCREEN (the camera moves the world under them):

1. **Ink layer** (underneath, full frame): the same scene under `<Look fills="paper">` (every Fill white, people as white
   tombstones, cine pieces in their own paper state, ink untouched) on paper (`palette.white`, reference 1's card). The
   World / cine sky is `<Look>`-exempt by design, so a scoped CSS rule paints every flat sky value (theme `skies`,
   `todSky`, every cine `TOD.*.skyBands`, `palette.sky`) paper inside this layer only. Result: the drawing as line art.
2. **Colour layer** on top, clipped with CSS `clip-path: path(...)` to the variant's hand-cut contour: a hard, flat,
   anti-aliased edge (no masks, no blur, no opacity).
3. **Overlay strokes** (some variants): core `<Ink>` strokes in screen space (`exit={false}`: they never un-build).

Every contour is a pure function of `(variant, seed, amount[, vp])`, memoised once: nothing depends on time, so the edge
cannot move or flicker. Scissor cuts are a few straight segments with 1-6 px jogs (`rough.ts: cutPoly / cutSide`), never
per-frame noise. **Every colour contour contains the caption block** (`CAPTION_SAFE` = the widest hook page + 20 px), so a
caption is always over the scene's own sky (a white night caption over a paper margin would vanish); the panel's side
insets give way at large amounts to keep that true. Checked for 5 variants x 5 amounts x 40 seeds:
`review/edges/tools/check-shapes.ts` (0 failures).

**Actors break the edge** (default `margin="actors"`): raw-SVG pieces that do not read `<Look>` keep their colour in the
margin, like reference 1's sun and cat breaking the panel. On the three lab shots that is exactly: the core `Sun`, the
cine `BigSun` (disc + its static glow rings) and the mascot (`Elephant` / `ElephantTimeline`). `margin="strict"`
paints every non-ink fill in the margin paper (pure line art; the mascot becomes a white outline).

## 2. Variants (`amount` scales every distance; 0 = off, 1 = designed, ~1.6 max)

| variant | what it does | layers | cost (1080x1920, conc. 2) |
|---|---|---|---|
| `clean` | control, no treatment (children returned untouched) | 1x | 108-117 ms/frame |
| `panel` | reference 1, nearly full-bleed: colour in a hand-cut panel 30-45 px in (each corner its own inset, sides a hair off-axis, 1-4 scissor cuts per side); the line art runs on into a white margin; at 2-3 corners ONE side is inked and overshoots the corner 22-50 px (sometimes with a re-stroke 4-7 px outside it), the other side stays open | 2x + strokes | 133-155 |
| `vignette` | centre finished, periphery a sketch: a loose organic contour (18 px slow wobble) that hugs the sides (touching the frame in places) and pulls in at the corners with UNEQUAL elliptical bites (one tight top corner, one long shallow one, the deepest bite at a bottom corner); line art out to the screen edge | 2x | 144-155 |
| `construction` | full-bleed colour + the artist's construction lines, sparse: perspective guides toward the shot's VP that start past the frame and stop 120-260 px in, the eye-level horizon guide crossing both sides, composition ticks at the thirds and the half of every edge, two crop-mark corners (diagonal pair); nothing in the caption block | 1x + strokes | 110-114 |
| `rough-tb` | a hand-cut paper edge at the TOP (44-70 px) and BOTTOM (56-90 px) only, 4-6 rougher scissor cuts each; the sides stay fully immersive | 2x | 142-164 |
| `trim` (**proposal**) | a hand-trimmed print, phone-aware: SLIM hand-cut sides (16-24 px, the only edges a viewer sees in the app, so the world stays a window and its lines just cross a sliver of paper), deeper top (48-66) and bottom (64-92) margins that sit under the platform UI (the full card charm in a clean export or a paused frame), every corner snipped with a 5-12 px scissor chamfer, NO added strokes (only the scene's own lines overshoot), actors keep their colour | 2x | 138-175 |

Cost: 30 spread frames per shot (KitDemo street with the lab camera move, CineDemo monument), minimum of two interleaved
runs, on the shared machine at load 2-5 (`review/edges/bench_fullres.txt`). The second render costs +20-50 % per frame,
not 2x: page capture and PNG encoding are paid once. Half-scale clip renders incl. H.264: clean 83, construction 68,
panel 94-99, rough-tb 84-107, trim 104-114, vignette 114-142 ms/frame.

My ranking for "cleaner, more polished, premium": **trim** (charm where it is seen, no frame weight, nothing added), then
**panel** (the most reference-1, a little more "card"), **rough-tb** (safe but mostly hidden under the UI), **vignette**
(the boldest; best as a one-off moment, e.g. the hook or the loop frame, not the whole film), **construction** (charming
up close, but reads as stray marks at phone size and needs each scene's VP).

## 3. Using it in the film (do not edit Film yourself: core lane)

The one-line integration in `src/lib/Film.tsx` (core lane): wrap the SCENE STACK, not the captions:

```tsx
// Film's return: the layers + transition overlays (wipers, bridges) go inside, SkyCaptions stays outside (above)
<FilmEdges>{layers.map((l) => <React.Fragment key={l.key}>{l.node}</React.Fragment>)}{overlays}</FilmEdges>
```

and the same around `Standalone`'s two scene blocks (the loop underlay + the scene). `FilmEdges` reads, first wins:
an `<EdgeProvider value={{variant: 'trim', amount: 1}}>` above it, then the render's input props
(`npx remotion render src/index.ts Main out.mp4 --props='{"edges":"trim"}'` or `'{"edges":{"variant":"panel","amount":0.8}}'`:
review any variant on the real film without a code change), then `FILM_EDGES` in `src/lib/edges/config.tsx`
(house default, currently `'clean'`). Per scene: wrap a scene composition in its own `EdgeProvider` (e.g. a different
`vp` for `construction`, `amount` 0.6 at night).

Props: `variant`, `seed` (a different cut), `amount`, `vp` (construction guides; default `world.vp`), `paper` (margin
colour, default white), `margin` ('actors' | 'strict'), `skyFills` (extra flat sky values for a scene whose sky is not a
theme token), `debug` (magenta contour).

## 4. Limitations / notes

- **Pieces that ignore `<Look>`** keep their colour in the margin (`margin="actors"`, intended): core `Sun`, cine `BigSun`
  (disc and glow rings), the mascot. Anything else raw-SVG that does not read `useLook()` / `useCineState()` behaves the
  same; `margin="strict"` catches all of them (every non-ink fill, set as an attribute, goes paper).
- **The sky is found by colour**: flat sky values must be theme / TOD tokens (or listed in `skyFills`). A fill set via
  inline `style={{fill}}` instead of the `fill` attribute is not matched by the sky rule (strict mode matches attributes
  only too).
- **Two renders**: +20-50 % per frame; `construction` is free (one render + strokes). Duplicate DOM ids are not an issue
  (every clipPath id comes from `useId`, except the cine passer wiper's, whose geometry is identical in both layers).
- **Captions must render after the treatment** (Film / Standalone already draw them after the scenes). EdgeLab hides
  CineDemo's built-in caption overlay inside both layers (CSS) and draws its own lab captions on top.
- **Platform UI**: the top ~180 px and bottom ~400 px are covered in the app, so `rough-tb` and trim's deeper margins are
  mostly a clean-export / paused-frame detail; the left and right edges are what a viewer always sees. A white bottom
  band sits under the platform's white UI text: keep it thin (trim 64-92 px, panel 30-45 px).
- **Night**: the white margin is the brightest thing in a night frame (`review/edges/extra/night_sheet.png`). It reads
  as a deliberate card, but for a long night act consider `amount` 0.6-0.8 for that scene.
- **construction needs the scene's VP** (`vp`, screen px): the guides are drawn toward it; with the default `world.vp`
  they are only right for eye-level scenes on the default horizon.
- Wipers and push-through bridges inside the treatment become line art in the margin (the edge never breaks during a
  wipe); a bridge colour (a div background) is transparent in the ink layer.

## 5. Review material (`review/edges/`)

| file | what |
|---|---|
| `edges_comparison.png` | rows = variants, columns = the three shots (KitDemo street 7.6 s dusk, CineDemo monument 13.0 s, CineDemo vista 4.6 s), full frames with notes |
| `edges_corners.png` | the top-left and bottom-right 340 px corners of every variant x shot (the edges are the point) |
| `clips/<variant>_street.mp4`, `clips/<variant>_monument.mp4` | 5 s, 540x960: the street (KitDemo 3.2-8.2 s, day -> dusk relight, with a lab push x1.07 + 40 px pan) and the monument (CineDemo 10.4-15.4 s, its own crane) |
| `edgecheck.txt` | contour stability in every clip frame vs the clean clip: 90-100 % of scanline samples within 2 px of their own position, per-frame mean drift 0.03-3.7 px (residue of scene content crossing the contour; an edge riding the lab camera would drift ~20 px at this scale; meaningless for `construction`, which has no contour). Decisive probe: with `debug` (the contour drawn in magenta) at lab t 0 / 2.5 / 4.97 s, every contour pixel of t 2.5 and 4.97 lies within 1 px of t 0's (0-12 stray px of ~6000) for trim + panel street (camera push + pan) and vignette + rough-tb monument (crane) |
| `extra/amount_sheet.png` | amount 0.5 / 1.0 / 1.5 per variant (monument) |
| `extra/night_sheet.png` | the street at night per variant |
| `stills/` | the full-resolution stills behind the sheets |

Tools (`review/edges/tools/`): `render-lab.mjs` (many EdgeLab stills from one bundle), `render-clips.mjs` (clips and
`bench` frame timings), `sheet.py` (grid / corners sheets), `edgecheck.py`, `check-shapes.ts`. Lab composition:
`EdgeLab` (`src/dev/EdgeLab.tsx`), props `{variant, shot: 'street' | 'monument' | 'vista', amount, seed, from, cam,
margin, debug}`:

```bash
scripts/still.sh EdgeLab 0 out.png --props='{"variant":"trim","shot":"vista"}'
node review/edges/tools/render-lab.mjs jobs.json --scale=1          # [{"props": {...}, "t": 0, "out": "x.png"}, ...]
node review/edges/tools/render-clips.mjs clips.json --scale=0.5     # [{"props": {...}, "frames": [0, 149], "out": "x.mp4"}]
python3 review/edges/tools/edgecheck.py review/edges/clips/trim_street.mp4 review/edges/clips/clean_street.mp4
npx esbuild review/edges/tools/check-shapes.ts --bundle --platform=node --log-level=error > /tmp/cs.cjs && node /tmp/cs.cjs
```
