# The shared G3 kit (`src/lib/g3/`): the animated sketchbook every film's G3 reel is drawn with

Built 2026-10-30 (lane A3, video 4's production) from v3's `src/v3/SketchReel.tsx` (which stays v3's own and keeps
rendering) plus the tier-1 deltas of `docs/G3_ANIMATIC.md` §7. Specs: `docs/G3_ANIMATIC.md` (the stage, it wins),
`docs/look/STORYBOARD_STYLE.md` (the drawing), `docs/look/CRAFT.md` §a (carriers, the thread), §b (tiers), §f (planes).
A film's entry imports from `src/lib/g3` only (never another film's folder); a G3 revision is a JSON edit, never code.

| File | What |
|---|---|
| `types.ts` | the board JSON schema, every field documented (read it first) |
| `SketchReel.tsx` | the reel: panels, the set's shared drawing, transitions, captions, the notes strip, the voice and sfx |
| `G3Reel.tsx` | `G3ReelComposition`: a film's composition (its id, animatic JSON, voice; 1080 x 1920 at 60 fps; the duration from the voice file) |
| `elements.tsx` | one element at its tier and plane: entrances, moves, draw-on / un-draw, the pen tip, the pipe, the rig's shadows, pools, ground lines |
| `board.ts` | the 4 tones + ink + red; tier weights (`weightOf`); the plane ladder (`planeTone`) |
| `motion.ts` | eases, the peaked ease, the multi-key camera, moves, loops, draw progress (the lint mirrors it) |
| `ambient.tsx` | the shared ambient kit: snow, steam, window lights, cloud, water, birds |
| `figure.ts` | gesture-figure poses + the smear |
| `Captions.tsx` | `PopCaptions` (v3's pop captions) and the caption-layer interface |
| `SketchIcons.tsx` | the icon kit (copied from v3: laptop, phone, server rack, mug, window, house, factory, truck, chart, ...) |
| `scripts/g3/board_lint.py` | the shared lint (run before every render) |
| `scripts/g3/g3kit.py` | Python helpers for a film's board builder (elements, panels, the pose test, camera keys, joins, word times) |
| `scripts/g3/build_selftest.py` | the kit's self-test board (`public/g3kit/selftest.json`, `src/entry-g3kit.tsx`): every delta on screen, lint-clean |

## Commands (from `video/`)

```bash
python3 -I scripts/g3/board_lint.py public/v4/animatic.json            # owner-facing rules ("draft": true in the JSON relaxes them)
python3 -I scripts/g3/board_lint.py public/v4/animatic.json -v         # with INFO (peak speeds, thread %, gaps)
node scripts/render-media.mjs G3Reel out/v4/g3.mp4 --entry=src/entry-v4.tsx --scale=0.5        # THE 540p60 reel (~1 min)
node scripts/render-frames.mjs G3Reel out/v4/stills 2.1,6.5,21.3 --entry=src/entry-v4.tsx --scale=0.5   # stills at film s
python3 -I scripts/qa/av_lag.py out/v4/g3.mp4 public/v4/voice.wav       # the voice in sync (lag 0 ms, r 1.00)
```
Render one at a time on the shared CPUs. The skeleton reel of video 4: `out/v4/g3_skeleton.mp4` (540 x 960, 60 fps,
2535 frames, 42.25 s; 57 s to render at concurrency 3).

## A film's entry

```tsx
import {G3ReelComposition} from './lib/g3';
registerRoot(() => <G3ReelComposition id="G3Reel" film="v4" animatic="v4/animatic.json" voice="v4/voice.wav" />);
```
`captions={MyLayer}` swaps the caption layer (a `React.FC<{t, fps, words}>`); default `PopCaptions`. **Never bundle the
reel with a module that calls `setPen('clean')`** (`lib/pen.ts` is global): the clean pen draws no scribble, hatch or
board marks.

## The schema in one screen (`types.ts` has every field)

- **Time.** Camera times (`camera.start/end`, `camera.keys[].t`, a key's `peak`) are FILM seconds. Element times (`in`,
  `out`, `draw`, `undraw`, `fillIn`, `moves[].at/peak`, `level` / `water` keys) are seconds after the SHOT's start
  (negative is fine). A set's shared drawing and its `moves` run on the FILM clock. Ambient life always runs on the
  film clock, so the same preset in two panels continues across a join. `g3kit.Panel.rel(t)` converts.
- **Space.** World px of the panel's drawing; the camera `{x, y, z}` puts world (x, y) at the frame's centre. Caption
  band y 290-600, read zone 600-1250, notes strip from 1680.
- **Tiers** (`tier: 'A' | 'B' | 'C'` on every element, by story role): A = 9 px ink outline, 5 px details, the only
  dark mass; B = 3 px mid-grey lines, never a dark mass (dark becomes mid); C = a light tone, no contour (a C shape
  always fills light), open lines that ARE lines (rails, wires, the ground's lines) at 3 px a step under the light
  tone, the scribble at light grey. A panel re-tiers a set element by id: `shot.tiers: {"window": "A"}` (the tier is
  the beat's story role, so it changes per panel). `role: 'dress'` = the dress layer (tier C, exempt from the
  25-element cap and the subject lint). No tier = v3's role weights (subject / mid / far).
- **Planes** (`plane: -2 ... +4`, 0 = the subject's): each farther plane a paler grey step (`PLANE_K` 0.2 / 0.4 / 0.6 /
  0.75 toward the paper's air: light reads L* 82 -> 85 / 88 / 91 / 93), each nearer one 5 L* darker; tier A takes
  half its step. The set (or panel) declares `planes: [{n, name}]` and `vp: {y, x}` (the horizon, the vanishing
  point); `{t: 'ground', x0, x1, y0, y1, n, horizon?}` draws the ground's lines running to the VP.
- **Sets** (`sets.<id>`: `name`, `rig`, `planes`, `vp`, `els`, `moves`, `density`). A panel with `set` is a SET PANEL;
  the set's `els` are drawn under the panel's own in every panel of the set (one world space: pushes and cranes are
  camera moves, not cuts; the density key is drawn once). `ownWorld: true` = a panel drawn at its own size (no set
  drawing); `hide: [ids]` = set elements left out of this panel.
- **The rig** (`sets.<id>.rig`): `key` ('left' | 'right' | 'top-left' | 'top-right' | 'top' | 'back' | 'back-left' |
  'back-right' | 'front'), `source`, `shadow` ('mid' default, the ONE shadow value), `pools` (names). An element's
  `shadow: true` (or `{len, w}`) casts a contact + cast shadow from its foot AWAY from the key, in the shadow value, so
  the key's side reads in every panel of the set; `{t: 'shade', ...}` = an explicit shadow shape; `{t: 'pool', cx, cy,
  rx, ry}` = a light pool (paper).
- **The camera**: v3's one segment (`from`, `to`, `start`, `end`, `ease`, `word`) or `keys: [{t, x, y, z, ease?, peak?,
  word?, anchor?, pivot?}]` (2+). The segment INTO a key carries the move's five values: `word` (PUSH IN, PULL BACK,
  TILT DOWN, FOLLOW, ...), its duration and its start / end (the keys), `anchor` ("the computer"), `ease` or `peak`.
  `peak` = the film s of the move's fastest moment (still at both keys; "fastest on 'AI'"); `pivot` = a world point
  held on its screen spot (a zoom about it: "the mug's spot held still"). Zoom interpolates geometrically. A move may
  straddle a join: give the next panel the same keys and the camera continues.
- **Element moves**: `moves: [{el: index | id, dx, dy, at, dur, ease?, peak?, s?, o?, lin?, loop?, gap?}]` (scale `s`
  about `o`; `loop: true` repeats every dur + gap: a ferry crossing). Moves apply in list order.
- **Draw-on and un-draw**: `draw: [start, dur(, ease)]` (frame 0's build; later only where the drawing IS the beat),
  `undraw: [start, dur]` (the pen lifts the strokes off, last drawn first), `tip: true` (a pen tip rides the front of a
  `line` or `pipe`). A `line` with `curve: 'joined' | 'smooth'` draws at one speed along its length.
- **Entrances**: `in` = a pop (whole on its first frame), `enter: 'grow' | 'rise' | 'wipe'` (never an opacity fade);
  `out` = a pop out.
- **The pipe** `{t: 'pipe', pts, bore, water: [[s, u], ...], drain, pulse: [start, dur, len], flow}`: a double wall and
  an empty bore; `water` = the front's keys along the run (0..1), `drain` = the tail's, `pulse` = a slug travelling the
  whole run, `flow` = moving marks in the water (px/s). With `thread: true` its WATER is the thread (the lint counts
  it only while water is in it).
- **The pose test**: 2-4 key poses per shot, each a figure popping on its word (`in` / `out` at `snap(t)`: never a
  tween); `pose: 'smear'` = the ONE stretched drawing of a fast transit, held 2-3 frames between two keys.
  `g3kit.Panel.poses(prefix, [(t, pose, x, y), ...], x, y, h, smear=[(t, frames, x, y)])` writes them. `snap(t)` is the
  pose-change idiom: an instant move or swap placed a quarter frame after a 60 fps frame, so no frame lands mid-jump.
- **Transitions** (the join INTO a shot): `type` = how the reel plays the switch ('cut' = the next panel on the next
  frame: what a continuous camera or a matched hand-over is; 'push-through', 'wipe', 'match-cut' and the declared
  'dissolve' / 'dip' / 'flash' as v3); `carrier` A-F and `device` (continuous, push-through, pull-back, thread-match,
  match-cut, match-zoom, morph, object-carry, wipe, whip, carry, card-flip, swipe, plain-cut, cut-on-action); `what`
  (the carrier object), `mid` (the midpoint, default the shot's start: the new sentence's first word), `match: {prev,
  next}` (the carried thing's box in both panels), `subframe` (push-through), `exception: 'time'` (a dissolve only so).
  `loopJoin` = the join from the last shot back into frame 0. The notes strip names the join with its carrier.
- **The thread** (`thread: true` on its elements; `throughline: {thread, home, reveal?, fairness?}`): the lint sums its
  screen time outside the declared scale reveal (`reveal` film s, or `shot.reveal: true`).
- **Life and density**: `shot.life: [...]` names every G5 life item; each placeholder carries `life: "<item>"` and a
  `promise` ("grey row = 6 pedestrians, walking"); `negative: true` declares plain paper where the final stays plain;
  `movers` = the declared count of noticeable supporting movers.
- **Composition and sound**: `shot.comp: {frame, move, join}` (the `COMPOSITION_SHOTS.md` codes from the film's
  composition pass); `sfx: [{src, t, gain, type, event}]` (SOUND_SYNC §4: each cue's type and the event it lands on).
- **A draft**: `"draft": true` = an internal interim board (placeholder panels and red marks (1) / (3) allowed); a
  panel with `placeholder: true` is a skeleton panel (the lint lists its to-dos).

## The ambient kit (`{t: 'ambient', kit, ...}`, loop implied; defaults at final size and speed)

| kit | fields (defaults) | use |
|---|---|---|
| `snow` | x, y, w, h, n (by area), r 5, speed 55 px/s, sway 12 | falling snow in a box (keep the box below the caption band) |
| `steam` | x, y (the source), w 160 (top width), h 260, r, rate 2.6 puffs/s, rise 85 px/s, level keys [[s, 0..1]] | a column rising; `level` thickens, thins or stops it (puffs already rising drift away) |
| `window` | x, y, w, h, cols 3, rows 4, pane, wave [from, to] (shot s), cycle s, startLit, lit 'paper', dark | window lights: a staggered wave switching on (a story action), or one window toggling every `cycle` s (ambient). Lit = paper: put the grid on a toned wall |
| `cloud` | x, y, w, h, rw 300, rh 110, speed 10 px/s, phase (seeded) | a cloud drifting across the box, wrapping round |
| `water` | pts, speed 80, dash 26, gap 54, width 6 | marks travelling along a pipe or a channel |
| `bird` | x, y, w, h, n 3, speed 70, size 18 | small Vs crossing, wings ticking (two drawings) |

Every set panel carries 2-3 of them (zero is a lint FAIL); they take turns (~0.6 entries/s) and none enters in the 0.4 s
round a join. A looping element move (`moves[].loop`) is the one periodic prop.

## The lint (`scripts/g3/board_lint.py`; its docstring lists every check)

ERROR = FAIL (exit 1: the board does not show its signal, or a house FAIL); WARN = a number to resolve at the 1x watch
or a fuzzy read; TODO = a placeholder panel's missing signal in a draft; INFO (`-v`) = what was measured. Per panel: a
tier per element; the camera's five values per move, eases in and out, zoom <= 2x; the speed budget (~15 px/frame at
the render rate, camera + own moves + ambient, moves >= 2 frames); a set panel's rig, planes, vp, 2-3 ambient moves,
ground lines, pools, a dress layer on a home / wide panel; `life:` coverage; the emptiness grid (G3_ANIMATIC §6, at the
resting end frame); the mover budget; v3's house rules (25 elements, one tier-A subject group and its staging, labels,
numbers, marks, text size, palette fills, the caption band at the start, middle, end and every camera key); red marks.
Film: shots tile the voice; a carrier per join and at most 2 plain cuts (FAIL); F on "But"; device vs carrier; the
declared dissolve exception; per-device checks (B's match boxes +-8 % / +-20 %, A's sub-frame 15-30 %, C's camera
continuity across a join inside one set's world); the join's midpoint on a sentence's first word; nothing but the
carrier entering in the 0.4 s round a join; thread coverage >= 80 % with no gap over 3 s (FAIL; the declared reveal
aside); pacing (>= 3.5 s average, no three near-equal); sfx type + event; the camera-plan cross-check against
`docs/<film>/camera_plan_g3.md` (rows' shots exist, carriers equal: FAIL; move words, tier letters, rig side, life
items: WARN; a tolerant read of its markdown tables, outgoing joins by default, "join in" columns understood).

## Gotchas

- A tier-C shape on a tier-C mass of the same plane vanishes (no contour by design): separate them by plane, or make
  the thing that must read B.
- Ids: moves, `hide` and `tiers` find elements by `id` (the panel's first, then the set's). Keep ids unique per list.
- The figure and icon boxes the lint uses come from `figure.ts` (`POSES`, `SMEAR`) and `SketchIcons.tsx`
  (`ICON_ASPECT`), parsed: keep both plain literals.
- `motion.ts` and the lint share their math (eases, the peaked ease, geometric zoom, the pivot, moves in list order):
  change both together.

## Not in this kit yet

- Tier 1 items outside this lane: `g5_scaffold.py` carrying `transition.type`, `carrier`, `tier` and `rig` into
  scenes.json (needed at G5); eye jump and colour shift per join measured on the rendered reel (`scripts/qa`, the craft
  tooling lane).
- Tier 2 (built when a reel first needs it): `crowd-row`, `facade-row`, `window-ticks`, `foliage-blob` primitives
  (the `window` ambient preset covers lit windows); board parallax stays v3's `shot.parallax` + `f` only.
- Captions: `PopCaptions` until the production component (`src/lib/captions2/`, TYPE_GUIDE) is finished; it has a
  `mono` mode for the grey board, and a film's entry swaps it in through `captions`.
