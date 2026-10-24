# ENGINE v2: cheat-sheet for scene agents (core lane)

Full-bleed, cinematic, hand-drawn ink. Read `docs/BRIEF.md` (BALANCE NOTE + CINEMATIC DIRECTION), then this page.
Camera / light / skyline / city kit: **`docs/CINE.md`** (`src/lib/cine`). Mascot: **`docs/mascot.md`** (`src/lib/mascot`).
Look: `docs/style_bible.md`. Motion numbers: `docs/motion_spec.md` (all of them live in `MOTION`, `src/lib/spec.ts`).

```ts
import {World, Sun, Ink, Fill, Drawn, rect, line, Plane, wallQuad, Person, Crowd, MOTION, palette, skies, world} from '../lib';
import {CineCamera, Layer, BigSun, EndlessCity} from '../lib/cine';
import {Elephant, ElephantTimeline} from '../lib/mascot';
```

## 1. The ten rules

1. **Everything is seconds.** `useTime()` = scene-local seconds (0 = your scene's `start` in `src/data/scenes.json`).
   Never frame numbers. `useGlobalTime()` = VO seconds. VO word times: `assets/timing.json` (`words[i].s`).
2. **Deterministic.** `rng(seed)` / `rand(seed, key)` (Remotion `random`), never `Math.random`.
3. **No fades. Ever.** Nothing animates opacity. Things pop (1 frame), grow 20%→100% (0.12 s), wipe, slide, rise or
   draw on. Static translucency is allowed only for light shafts / glows (cine kit). `Fill mode="fade"` and `<Appear>`
   are now 1-frame pops; `Tween` opacity is a visibility switch.
4. **Flat.** No CSS/SVG blur, filters, gradients, masks with soft edges. Palette tokens only (`palette.*`, `skies.*`).
5. **Lead the voice** (motion spec 7): small element `word.s - 0.10`, big build/burst `word.s - 0.25..0.40` so it
   completes on the word, ✓/✗ marks on the word, sun beats on the word (±0.05). Captions apply their own leads.
6. **≥ 5 visual events per second, no gap > 1.0 s.** Something always moves: sun drift/beats, mascot idle, crowd bob.
7. **People are always seen from behind** (`Person`: ears, neck, back of the head, no faces).
8. **Ink weight by depth**: `depthInk.front 4.8 / mid 3.4 / far 2.2 / hair 1.6`, far things get NO ink.
9. **One colossal element per scene, tiny people / mascot against it**, eye-level or low camera — with restraint
   (balance note): mostly gentle 5–15 % pushes, 2–3 Arcane-scale peaks in the whole film.
10. **Captions own the sky band** y 236–476 (screen space): keep busy detail out of it; dark ink on light skies,
    white on dark skies (`captionTone`).

## 2. Coordinates and the frame

- **World coordinates = canvas pixels at camera rest**: x 0..1080, y 0..1920, y down. `world.horizon` 880,
  `world.vp` [540, 880] are defaults, not rules.
- Author **`world.bleed` (140 px) past every edge** for ground, walls and sky-reaching things: `camera-continuous` and
  `push-through` transitions show up to ~12% beyond the frame. The sky is always infinite (World sizes it).
- **Safe zones** (`safe`): platform UI covers y < 180, y > 1520 and the right rail x > 950 for y 900–1500. Key action
  inside x 90–990, y 200–1480. Bottom = ground and foreground framing only.
- Captions: screen space, baselines 330 / 426 (one-line pages 378), clip window y 236–476 (`skyCaption`).
- Big sun: `sunWorld` = (540, 840) r 150, on the horizon (`<Sun>` defaults to it inside a `<World>`).

## 3. A complete minimal scene

`src/scenes/Scene07.tsx` (auto-registered as `S07`; the id must exist in `src/data/scenes.json`):

```tsx
import React from 'react';
import {World, Sun, Fill, Ink, Drawn, Plane, wallQuad, Building, Crowd, Person, hline, rect, rectPath,
  palette, skies, stroke, world, useTime, WiperProps, FigureWiper} from '../lib';
import {ElephantTimeline} from '../lib/mascot';

const H = 900;                       // this scene's horizon
const VP: [number, number] = [560, H];

const Scene07: React.FC = () => {
  const t = useTime();               // scene seconds; VO word at 32.715 s with start 30.5 => t = 2.215
  return (
    <World sky={[{t: 0, color: skies.golden}, {t: 4.2, color: skies.dusk, wipe: 'down'}]}>
      {/* 1 sky-level: the sun sits on the horizon, beats on stressed words, never perfectly still */}
      <Sun cx={560} cy={830} horizon={H} beats={[1.33, {t: 2.215, amp: 0.13}]} drift={[10, 0]} />
      {/* 2 ground: a flat fill + one long ink line (structural overshoot past the frame) */}
      <Fill rect={[-140, H, 1360, 1160]} color={palette.mintPale} offset={false} />
      <Ink d={hline(-60, 1140, H, {seed: 'h7'})} at={0.1} width={stroke.ink} />
      {/* 3 a facade receding to the vanishing point: draw it flat, map it onto the wall plane */}
      <Plane quad={wallQuad({vp: VP, x: -60, top: 420, bottom: 1300, depth: 0.7})} w={1400} h={880}>
        <Building x={0} y={880} w={600} floors={4} floorH={220} at={0.3} seed="b7" color={palette.cream} />
      </Plane>
      {/* 4 a crowd from behind walking into the distance (ink by depth, far rows fill-only) */}
      <Crowd far={{y: 920, x0: 520, x1: 600, s: 0.08}} near={{y: 1450, x0: 260, x1: 860, s: 0.9}}
             rows={9} at={1.0} span={1.8} build="rise" order="back" legRows={9} seed="c7" />
      {/* 5 an actor: ink first, its fill lands 0.13-0.27 s later */}
      <Drawn d={rect(700, 1200, 160, 120, {seed: 'sign7'})} fillD={rectPath(700, 1200, 160, 120)} fill={palette.peach} at={2.1} width={stroke.inkBold} />
      {/* 6 the mascot (other lane's API) */}
      <ElephantTimeline x={640} y={1700} scale={1} t={t} seed={7} keys={[{t: 0, pose: 'sit-back'}]} />
      {/* 7 foreground framing, cropped by the frame edge */}
      <Person x={130} y={1990} s={2.4} at={0.4} build="rise" ink={stroke.inkBold} seed="fg7" />
    </World>
  );
};
export default Scene07;

/** Optional: this scene's own close-to-the-lens element for {type: 'foreground-wipe', element: 'scene'} OUT of it. */
export const Wiper: React.FC<WiperProps> = (p) => <FigureWiper {...p} color={palette.teal} />;
```

`src/data/scenes.json` entry (generated by `node scripts/gen-scenes.mjs` from `docs/storyboard.json`; manual tweaks
go in `src/data/scenes.overrides.json`):

```json
{"id": "S07", "start": 30.5, "end": 35.52,
 "transitionIn": {"type": "foreground-wipe", "dur": 0.38, "element": "scene", "dir": "right"},
 "captionTone": [{"t": 0, "tone": "dark"}, {"t": 4.2, "tone": "light"}]}
```

Preview it: `scripts/still.sh S07 2.0 previews/s07.png` (composition time = scene time) or the whole film
`scripts/sheet.sh Main 30 36 12 previews/s07_sheet.png`.

## 4. Stage: World, sky, Film

| API | what |
|---|---|
| `<World sky={color \| SkyKey[]} stage="flat"\|"context" overlay?>` | scene root. Full-bleed SVG in world px, the sky slab behind everything (it collapses LAST in an un-build). `SkyKey = {t, color, wipe?: 'down'\|'up'\|'left'\|'right'\|'snap', dur? = 0.4}`: sky changes WIPE (default down) or snap. |
| `skies.day / golden / dusk / night / deep` | mint, cream, sage, teal, tealDark. Tone: day/golden/dusk → `dark`, night/deep → `light`. |
| `<ScreenSpace>` | children ignore the transition camera (HUD-like layers inside a flat World). |
| `useScene()` | `{id, start, end, dur}` (VO seconds) |
| `useTransition()` | `{type, phase: 'in'\|'out', p}` while this scene is entering/leaving, else null |
| `useStageCam()` | the transition camera `{ox, oy, zoom, rot}` (same model as the cine camera at depth 0). With `<World stage="context">` World does NOT apply it; add it to your own camera (e.g. `<CineCamera add={...}>`) for real multiplane parallax during transitions. |
| `<Film scenes components wipers captions offset? only?>` | Main's sequencer (you don't render it). Captions + soundtrack (`public/mix.wav` if present, else `public/vo.mp3`). |
| `<Standalone captions tone unbuild loop cam>` | dev previews: one scene + captions (+ un-build + loop) at frame/fps time. |

Root registers `Main` (whole film), **one composition per scene id** (that scene alone, its captions, the soundtrack
offset to its range, its own un-build) and the dev compositions in `src/dev/registry.ts`.

## 5. Transitions (`transitionIn` of the INCOMING scene; c = its `start`)

| type | params (defaults) | what happens / what the scenes must do |
|---|---|---|
| `cut` | – | hard cut at c |
| `matchcut` | – | hard cut at c; both scenes put the shared object (sun, horizon line, a door, the mascot) at the SAME screen spot |
| `camera-continuous` | `dur` 1.4, `dir` 'in'\|'out'\|'up'\|'down'\|'left'\|'right', `amount` (zoom factor or px; default scales with dur), `focus`/`to` [x,y] | the outgoing camera accelerates into the cut (ease-in), the incoming scene continues the same move with matched velocity and settles (strong ease-out). Incoming starts zoomed out / offset: author the bleed. |
| `foreground-wipe` | `dur` 0.8, `element` 'figure'\|'pole'\|'foliage'\|'scene', `dir` 'right', `color` | something passes right in front of the lens; old scene on the unswept side, new scene behind it. `'scene'` = the OUTGOING module's `export const Wiper: React.FC<WiperProps>` ({x, p, dir, color}, screen px, must be opaque over x±90 for the full height). Both scenes drift 50 px (parallax). |
| `push-through` | `dur` 1.1, `from` [x,y] (outgoing point), `to` [x,y] (incoming point, default centre), `zoom` 7, `bridge` colour | the outgoing scene zooms into `from` until it fills the frame (match its colour to the incoming scene), optional 3-frame flat `bridge`, the incoming scene pulls back out of `to`. |
| `unbuild` | `dur` 0.5 | the outgoing scene un-builds ON TOP of the incoming one, which is already rendered at local t < 0: design your t < 0 state (ink-only line art via `<Look fills="paper">` or nothing). |
| last scene `transitionOut` | `{type: 'unbuild', dur, loop: true, captionAt}` | un-builds into the FIRST scene at its t < 0 state (the loop). Captions roll back to page 1 at `captionAt` (default end − 0.22). Frame 0 must equal that state: the seam is mid-motion. |

Outgoing and incoming scenes keep rendering through overlaps (they hold their end state; local time keeps running).

## 6. Captions

- Data: `src/data/captions.json` = `[{s, e, lines: [{text, s}], highlights: [{text, s}], style?}]`, all **word-start**
  times. Regenerate: `node scripts/gen-captions.mjs` (pages from `assets/timing.json`) or
  `node scripts/gen-captions.mjs --storyboard` (paging + multi-word highlights from `docs/storyboard.json`, times
  re-derived from timing.json; the current file). Overrides: `src/data/captions.overrides.json` (by page index).
- Motion (measured, applied in `SkyCaptions`): page change = whole stack scrolls up 260 px in 0.45 s
  `bezier(0, 0.7, 0.12, 1)` starting 0.04 s before the first word (old page gone in 2–3 frames); line 2 rises
  ~110 px in 0.42 s, 0.08 s early; highlight box wipes L→R, `bezier(0.3, 0.3, 0.1, 1)`, 0.19 s + 0.3 ms/px, 0.10 s early.
  First page = hook style (×1.06) and is on screen at frame 0. Max line width 860 (the page font shrinks to fit).
- **Tone** = `captionTone` in scenes.json (scene-local `t`, exact 1-frame switch). Change the sky and the tone at
  the same moment. The highlighted word stays ink on peach in both tones.

## 7. Drawing primitives

| API | notes |
|---|---|
| `<Ink d at? dur? width? color? order='seq'\|'all' pace='spec'\|'free' open? taper? dash?>` | pen draw-on. **Spec pacing**: every subpath is one stroke of 0.10–0.20 s whatever its length, successive strokes start 1 frame apart (3–6 in flight). `dur` only spreads the stroke starts. Long strokes taper. Un-build: lines loosen, then retract. `inkDrawTime(d, dur?)` = total time. |
| `<Fill d\|rect color at? mode dir? dur? offset? exitMode? opacity? lookExempt?>` | flat fill, misregistered (`misreg`) by default. Modes: `pop` (default: 20%→100% about its centre in 0.12 s), `snap` (1 frame), `wipe` (linear, 0.12 s; `dir`), `grow` (from an edge, out-expo 0.2 s), `spring` (7% overshoot), `none`. Exit: shrinks to its centre; fills covering ≥ ~55% of the frame are the slab (wipe down, last). |
| `<Drawn d fill at ...ink>` | ink + its fill landing 0.13–0.27 s after the outline STARTS (seeded). |
| `<Look fills='paper'\|'none'\|'color' ink? cascade={{at, origin, speed}}>` | render states: paper = ink on white fills (frame 0 / loop frame), `ink={false}` = fills only, `cascade` = paper until a wave from `origin` (the VP) reaches each fill (the opening fill cascade, ~0.3 s). The World sky keeps its colour. |
| sketch (`lib/sketch.ts`) | `line hline vline rect poly smooth circle ellipse blob arc wire wirePoint crown crownTicks glint hatch arrow check cross textLines wallTicks speedLines scribble` (ink paths: overshoot, drift, breaks, seeded) + closed fills `rectPath roundRect polyPath torso blob crown`. Memoised: calling them every frame is cheap. |
| `<Plane quad w h>` + `wallQuad({vp, x, top, bottom, depth})`, `groundQuad({vp, y, x0, x1, depth})`, `frontQuad(...)`, `rayPoint(vp, p, k)` | **one-point perspective**: draw anything (a whole kit `Building`, windows, a fence) flat in plane-local px, it is projected onto the receding quad; strokes keep screen widths. Right walls run local x far → near. Only Ink/Fill (and kit built from them) are projected; raw `<circle>/<text>` are not. |
| `XG`, `mat`, `Place` | affine groups that also work inside a Plane (folded into the projection). |

## 8. Motion

| API | notes (MOTION constants in `src/lib/spec.ts`) |
|---|---|
| `prog(t, start, dur, ease)`, `keys`, `springAt(t, at, springs.pop\|rise)`, `stagger`, `spread`, `osc` | time helpers (`lib/time.ts`). `springs.pop` = 7% overshoot @ 0.2 s, `springs.rise` = 3%. `bez(x1,y1,x2,y2)` = CSS cubic-bezier. |
| `<Pop at x y>` | scale-in about (x, y), 7% overshoot. |
| `<Rise at dist=140 dur=0.33>` / `<Sink at>` | rise ~own height from below with out(exp) 0.33 s (people never walk in, they rise); sink = exit 0.2 s ease-in. Hide the entry behind something. |
| `<Move from to at dur arc>`, `<Walk>`, `<Wobble>` (idle), `<Shake>`, `<Tween>` | slides, walks, idle life. |
| `<Appear at outAt>` | 1-frame pop in/out. |
| `<UnBuild at dur=0.5>` / `<NoExit>` / `useExit()` | local un-build with the measured recipe (loosen → fills shrink → ink retracts → slab collapses). The mascot ignores it: drive `<Elephant draw={1 - exit}>` yourself. |
| Camera | gentle moves and multiplane parallax: **cine lane** `CineCamera` / `Layer` (`docs/CINE.md`). The legacy card `<Camera>` in motion.tsx is card-only. |

## 9. The sun (a character)

`<Sun cx cy r horizon rise beats bounce hops moves drift breathe at>` — in a World it defaults to `sunWorld` (r 150).
- `rise={{at, from: VP}}`: emerges from the vanishing point in 0.37 s (ease-out) then pulses +7% (the opening).
- `beats={[t, {t, amp}]}`: +4…+13% pulses (attack 0.08 / hold 0.08 / release 0.27), the PEAK lands on t (stressed words).
- `bounce={{times: [...], h}}`: ballistic bounces whose touch-downs land on word onsets, with landing squash.
- `hops={[{t, to: [x, y], h = 74, air = 1.03}]}`: anticipation squash 0.1 s, stretch, floaty arc, landing squash.
- `moves` (set / slide / grow), `drift` px/s (never perfectly still), `horizon` clips it (setting behind a line).
- Order matters for depth: draw it before the skyline to sit BEHIND silhouettes (huge low sun, Arcane), or after
  everything (card-style anchor). The cine `BigSun` wraps it with time-of-day colours.

## 10. Kit (`lib/kit`)

`Person` (back view; `build` draw/pop/rise; `ink` = on-screen weight; `hair` short/long/bun/cap/beanie/bald/curly;
`acc` backpack/headphones/strap/phone/scarf/sign/collar; `legs`; `lod` 0/1/2), `Crowd` (rows far→near, depth ink via
`crowdInk(s)`, far rows fill-only blobs, `build`, `order`, `limit`), `Building`, `Wall`, `Ground`, `Window`,
`WindowGrid`, `Door`, `Tree`, `Bike`, `Bird`, `BirdsOnWire`, `LampPost`, `Festoon` (string lights, plane-safe),
`UtilityPole`, `BrowserWindow` (switch-off = CRT squash, no fades), `Padlock`, `Noticeboard`, `Paper`, `Stamp`, `Bug`,
`Shield`, `Cloud`, `Server`, `Laptop`, `Place`. Every component takes `at` (omit = already built) and a `seed`.
Built-in wipers: `FigureWiper`, `PoleWiper`, `FoliageWiper`.

## 11. Preview commands

```bash
npx tsc --noEmit                                         # must be clean
scripts/still.sh <Comp> <sec> out.png [--scale=0.5]      # one frame (Comp = Main, S01..S13, KitDemo, CineDemo, ...)
scripts/sheet.sh <Comp> <t0> <t1> <n> out.png [--scale=0.35] [--cols=N]     # contact sheet, labelled seconds
scripts/strip.sh <Comp> <t0> <t1> out.png [--crop=WxH+X+Y] [--scale=0.5] [--step=1]  # EVERY frame: check motion
node scripts/gen-captions.mjs --storyboard               # captions.json from storyboard paging + timing.json
node scripts/gen-scenes.mjs                              # scenes.json from docs/storyboard.json (+ overrides)
npx remotion render src/index.ts Main out/main.mp4       # full render (shared 4-CPU machine: render ranges)
```
Look at your frames next to `assets/ref2/f_*.png` and `assets/ref/f_*.png` before calling a scene done.

## 12. Performance rules

Measured (concurrency 2, 1080×1920): dense KitDemo street (crowd ~120 figures, 2 planes, 4 festoons) **~105 ms/frame**;
simple scenes ~65 ms/frame.
- No filters, blur, gradients, masks with soft edges, `<foreignObject>`. Clip paths only where needed.
- Path generators are memoised; still, build static geometry once (module scope or `useMemo`) and **merge static
  linework into one `<Ink d={a + b + c}>`** instead of hundreds of elements. A fully drawn, untapered Ink is one `<path>`.
- Far crowds: let `Crowd` pick `lod` 2 (fill-only blobs). Hundreds of lod-0 people get slow.
- `Plane` projections are cached per (homography, path): static planes are free after the first frame. Animating a
  plane's quad every frame re-projects every path every frame: move planes with a camera / `XG` instead.
- Return `null` early for things not yet visible (`at` does it for you) and for things far off-frame.
- Heavy per-frame math belongs in pure functions of `t`; never keep state between frames.

## 13. Legacy (v1 card layout, still exported)

`Page`, `Card`, `Art`, `Panel`, `Timeline`, `Stage`, `Captions` (card captions), card `Camera`, `PanelClip`, card
transitions (flip / swipe / sheet / crossfade). Not used by Main any more; `crossfade` and the card `zoom` animate
opacity and must not be used in the film.

## 14. Open switches (decided by the orchestrator, not by scenes)

- **Caption grammar**: `skyCaption.motion` = `'scroll'` (default: reference 1's measured scroll / rise / wipe, as the
  brief's binding motion spec says) or `'pop'` (reference 2: pages, lines and boxes pop in one frame,
  `docs/style_bible_ref2.md` 3). Reference 2 also sets its captions bigger and lower (98 px, baselines 387 / 510):
  change `skyCaption` size / line1 / line2 / oneLine / clipTop / clipBottom together (keep the clip window just outside
  the boxes: top ≈ line1 − 0.68 em − 10, bottom ≈ line2 + 0.31 em + 25).
- Reference 2 cuts with 5-frame cross-dissolves; the binding spec says no fades, so Film has none. A dissolve would be a
  Film transition type to add, not something to fake inside a scene.
