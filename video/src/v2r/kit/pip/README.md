# K5 · towpath Pip (video 2, "One Small Window")

The film's own Pip, drawn new for this film (TREATMENT.md §3, K5). Nothing here imports `src/lib/mascot`, the v3
kit, v1 sets or the dropped `src/v2/**`: only the engine tools (`lib/time`, `lib/rng`, `lib/exit`, `lib/inkComp`,
`lib/font` for the sheet labels) and the film's `palette.ts` / `world/map.ts`.

## Who it is
A pebble-round baby elephant with no neck, the channel's witness (docs/mascot.md, house_digest §6): it sits in every
shot, watches what the voice is about, reacts once per shot at most, and crosses every join on its carrier (swept by
a push-through, riding a wipe's object, or in the same screen spot: it never hops across a join, `docs/v2/THROUGHLINE.md`
§3; hops stay available inside a shot).
- **Body** a pebble (wider and flatter below its middle), **head** round, straight on it.
- **Ears** two big LEAF ears: each is two half-blades on a curved midrib, so an ear can **fold** along its midrib and
  **flick** (the idle "fold-and-flick" every 4-8 s). Pink inner face, a midrib vein and one pair of side veins.
- **Trunk** short, one curl. **Tuft** three hairs, sprouting through the contour's head-top gap.
- **Soles** teddy-bear: one pad + three beans (pink), seen when it faces us, tucks or leaps.
- **Scarf** short, knitted, mustard: a ribbed band round the no-neck, a knot at its side, two fringed tails that lift and
  flutter in the canal wind (the `wind` param sets their direction).
- **Tail** hangs over its seat's edge (like reference 1's cat), a little brush at the tip; two haunch arcs from behind.
- **Colours** (CM.pip*; tier B since 2026-10-27, every one at C* <= 25): body `#9495C1` (L* 63 / C* 25), shade
  `#73739D` (only the far ear / far legs: depth is colour), inner ear, cheeks and soles `#F2C3CC`, scarf `#D8C599`; the
  clean pen draws its line in the body's own shade (1.6-2.2 px), never the ink `#2B1B0A`.

## The line
The silhouette (body, head, ears, trunk, legs, scarf band) is traced every frame as the union of the part shapes
(marching squares with bisected crossings: it moves continuously, no boil) and drawn as ONE loose tapered brush stroke
(~3.4 px on screen at 80-120 px, 2.3 px at 44 px; it never scales with `size`) with 2-3 gaps: the head top, the base and
the screen-right ear root (the third only at >= 58 px). A slow seeded hand wobble rides on it. Interior lines appear
only where a part lies over another (an ear over the head, the trunk over the face, a leg over the belly). Flat fills sit
3 px right / 2 px down of the line (2 px at 44). No opacity anywhere: the draw-on is a pen, the fills grow 20 % -> 100 %;
the un-build shrinks the fills then retracts the ink (`lib/exit` timings).

## Use it
```tsx
import {Pip, PipTrack, FACING} from '../kit/pip';

// a still pose (idle life on: blink, ear sway + fold-and-flick, breathing, scarf flutter, tuft, tail)
<Pip x={700} y={1235} size={96} facing="back" target={[510, 1010]} />

// a timeline (scene seconds). Seats are BASE-CENTRES (map.ts `Seat`): S1_BOLLARD, BOARD_BOLLARD, S2.pipSeat...
<PipTrack x={700} y={1235} size={96} facing="back" keys={[
  {t: 1.25, target: (t) => herHeadAt(t)},          // S1: the head follows her (a point or a function of t)
  {t: 4.98, pose: 'earsCover', dur: 0.1},           // "life" (a small flinch tremble is added for 0.6 s)
  {t: 5.55, pose: 'sit', dur: 0.25},
  {t: 5.90, hop: {to: [540, 760], height: 90}},     // take-off at 5.90; it crouches 0.12 s before
]} />
```
- **Props** (`Pip`): `x y` feet anchor · `size` px seat-to-head-top (44-120; LOD below 58 px) · `pose` · `facing`
  (`front frontRight right backRight back backLeft left frontLeft` or degrees; `back` = the 3/4-back watcher) · `look`
  (-1 screen-left .. +1 right) · `lookUp` · `target` (the head follows a screen point) · `wind` · `idle` (0..1 or
  `{amount, breeze, flick: false}`) · `squash` · `rotate` · `draw` · `exit` (default `useExit()`) · `paint`
  (`'colour'` default: Pip stays in colour on frame 0's bare-ink page, as TREATMENT §4 asks; `'paper'`; `'look'`
  follows the enclosing `<Look>` / cascade) · `params` (raw `PoseParams` overrides) · `inkPx`.
- **Keys** (`PipTrack`): `pose` (blend, default 0.16 s) · `facing` / `look` / `lookUp` / `wind` (ease 0.3 s) · `target`
  (null stops) · `hop: {to, dur, height, style: 'tuck' | 'leap', crouch, land, turn, minY}` (key t = take-off; the arc
  is `lerp(from, to, k) - height * 4k(1-k)`, the same form as map.ts `PIP_HOP_S2_S3`; the apex is clamped to stay at
  y >= `minY` = 600, the caption band, unless an end is above it) · `flick: 'A' | 'B'` · `ride: {amp, rate}` (bob +
  roll on a boat roof; null stops) · `draw` / `unbuild` (durations).
- **Poses** (`POSES`): `sit` (the watcher, perch) · `alert` · `earsCover` (from the front the leaves wrap over the eyes;
  from behind they hang forward against the cheeks, head sunk, hunched) · `earsDown` · `lookUp` (the trunk rises like
  a periscope: it reads from behind) · `crouch` · `tuck` (a hop in the air) · `leap` (a big leap) · `land` · `ride`.
- **Pure helpers**: `hopAt` (where Pip is at any t of a hop: use it on BOTH sides of a cut it crosses), `trackAt`,
  `aimAt`, `rideAt`, `drawOn`, `unBuild`, `applyIdle`, `buildPip` (the flat parts), `clampApex`.

## Per shot (TREATMENT §3 + map.ts `PIP`)
| shot | how |
|---|---|
| S1 | `facing="back"` on `S1_BOLLARD`, in colour at f0 (default paint); `target` her from 1.25; `earsCover` at 4.98; `hop` up-left at 5.90 |
| S2 | land on `S2.pipSeat`; on "But" 8.30 `look` toward the wall (from behind a turn of 0.6-0.8 shows the trunk hook past the cheek); `hop` at 12.85 (`PIP_HOP_S2_S3`: `dur 0.25, height 50`) |
| S3 | land on `S3.pipSeat` (a hop from off-frame with `crouch: 0.01`); turn to her on "she" 13.90 (`look`, or `facing`); `hop` with `style: 'leap'` out through the LEFT edge at 14.70 |
| S4 | ride the boat roof (`ride` key; the lane moves `x` with the boat and freezes it at take-off), `facing: 'left'` at 19.55; `leap` toward SUN1 at 20.25 |
| S5 | `lookUp` (+ `look` toward the sun) at 20.76; `size` shrinks with the crane to >= 44 px; `leap` at 23.90 |
| S6 | on the corner post; `flick: 'A'` at 26.50 (no droop); pass `idle={{flick: false}}` so no ambient flick competes |
| S7 | sit-watch at `BOARD_BOLLARD`, NO reaction: `idle={{flick: false}}` |
| S8 | ride the boat in, `hop` to the bollard 33.20, `earsDown` at 33.78, `lookUp` at W on "not" 37.70; hop to f0's bollard on the un-build (wrap Pip in `<NoExit>` or pass `exit={0}`: it must arrive in colour) |

Rules the lanes keep (map.ts `PIP_RULES`): 86-120 px (44 only in S5's end frame); never in the caption band y 317-556,
the right rail (x > 780 below y 840), over her, or within 200 px of the F11 clause; one reaction per shot.

## Files
`geom.ts` maths (shapes, union trace, brush) · `model.ts` the rig and `PoseParams` · `poses.ts` · `idle.ts` ·
`motion.ts` · `Pip.tsx` · `PipTrack.tsx` · `colours.ts` · dev comps: `KitPip.tsx` (the character sheet), `PipActions.tsx`
(every action in sequence, 1080 x 1920), `PipSweep.tsx` (continuity test), `PipStudy.tsx` / `PipZoom.tsx` (design
studies). Entry: `src/entry-v2r-pip.tsx` (palette first).

```bash
npx remotion still src/entry-v2r-pip.tsx KitPip out.png --frame=60 --scale=0.5 --gl=angle
npx remotion render src/entry-v2r-pip.tsx PipActions out.mp4 --gl=angle --concurrency=2 --scale=0.5
npx remotion render src/entry-v2r-pip.tsx PipSweep sweep.mp4 --gl=angle --concurrency=2   # then diff every frame:
#   the only jumps allowed are the test's own cuts at 4.00 / 8.00 s and the deliberate 0.12 s ears-cover
```
Cost: the silhouette is re-traced every frame; the 75-Pip sheet renders in ~4 s, the 1080 x 1920 actions clip at ~70 ms/frame (0.5 scale, the page included).

## Tiers (the clean pen, 2026-10-27)
`Pip`, `PipTrack` and `PipDrawing` default to `support` with lines (CRAFT §b: the mascot is B unless the line is about
it). Under `src/v2r/pen.ts`'s clean pen the silhouette is ONE closed uniform line (no gaps, wobble or taper) at the
body's own shade (support: 1.6-2.2 px at L* -20; `tier="subject"`: 3.0 px at L* -35; `environment`: no line but the
tuft and the tail tip); interior, scarf, midrib and haunch lines stay thin and same-hue; knit ribs and fringe ticks go;
fills register exactly and calm to C* <= 25 (the periwinkle sat at 37). Promote only when the line is about Pip:
`<PipTrack tier="subject" ...>`. Idle amplitudes are unchanged (`useTierMotion()` is there when a lane calms them).
