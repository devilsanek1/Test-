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
(marching squares with bisected crossings: it moves continuously, no boil). Under the film's clean pen (the only pen v2r
draws with; "Tiers" below) it is ONE closed uniform line in the body's own shade (tier B: 1.6-2.2 px), with no gaps,
wobble or taper, and the fills register exactly; the sketch-pen look this kit was first drawn in (a loose tapered
~3.4 px brush with 2-3 gaps, a hand wobble, fills 3 px / 2 px off the line) is retired (DIRECTION rule 4). Interior
lines appear only where a part lies over another (an ear over the head, the trunk over the face, a leg over the belly).
No opacity anywhere: the draw-on is a pen, the fills grow 20 % -> 100 %; the un-build shrinks the fills then retracts the
line (`lib/exit` timings).

## Use it
```tsx
import {Pip, PipTrack, FACING} from '../kit/pip';

// a still pose (idle life on: blink, ear sway + fold-and-flick, breathing, scarf flutter, tuft, tail)
<Pip x={700} y={1235} size={96} facing="back" target={[510, 1010]} />

// a timeline (scene seconds). Seats are BASE-CENTRES (map.ts `Seat`): S1_BOLLARD, BOARD_BOLLARD, S2.pipSeat...
<PipTrack x={700} y={1235} size={96} facing="back" keys={[
  {t: 1.25, target: (t) => herHeadAt(t)},          // S1: the head follows her (a point or a function of t)
  {t: 4.98, pose: 'earsCover', dur: 0.1},           // "life" (a small flinch tremble is added for 0.6 s)
  {t: 5.55, pose: 'sit', dur: 0.25},                // and it stays: the push-through into W sweeps it (no hop out)
]} />
```
- **Props** (`Pip`): `x y` feet anchor · `size` px seat-to-head-top (44-120; LOD below 58 px) · `pose` · `facing`
  (`front frontRight right backRight back backLeft left frontLeft` or degrees; `back` = the 3/4-back watcher) · `look`
  (-1 screen-left .. +1 right) · `lookUp` · `target` (the head follows a screen point) · `wind` · `idle` (0..1 or
  `{amount, breeze, flick: false}`) · `squash` · `rotate` · `draw` · `exit` (default `useExit()`) · `paint`
  (`'colour'` the default; `'paper'`; `'look'` follows the enclosing `<Look>` / cascade: S1 uses it, since frame 0 is
  drawn in the clean pen and Pip's tinted line draws on with the subject while its colour comes with the flood,
  DIRECTION rule 9) · `params` (raw `PoseParams` overrides) · `inkPx`.
- **Keys** (`PipTrack`; hops are for moves INSIDE a shot: Pip never hops across a join): `pose` (blend, default 0.16 s) · `facing` / `look` / `lookUp` / `wind` (ease 0.3 s) · `target`
  (null stops) · `hop: {to, dur, height, style: 'tuck' | 'leap', crouch, land, turn, minY}` (key t = take-off; the arc
  is `lerp(from, to, k) - height * 4k(1-k)`, the same form as map.ts `PIP_HOP_S2_S3`; the apex is clamped to stay at
  y >= `minY` = 600, the caption band, unless an end is above it) · `flick: 'A' | 'B'` · `ride: {amp, rate}` (bob +
  roll on a boat roof; null stops) · `draw` / `unbuild` (durations).
- **Poses** (`POSES`): `sit` (the watcher, perch) · `alert` · `earsCover` (from the front the leaves wrap over the eyes;
  from behind they hang forward against the cheeks, head sunk, hunched) · `earsDown` · `lookUp` (the trunk rises like
  a periscope: it reads from behind) · `crouch` · `tuck` (a hop in the air) · `leap` (a big leap) · `land` · `ride`.
- **Pure helpers**: `hopAt` (where Pip is at any t of a hop inside a shot), `trackAt`,
  `aimAt`, `rideAt`, `drawOn`, `unBuild`, `applyIdle`, `buildPip` (the flat parts), `clampApex`.

## Per shot (map.ts `PIP` and `MATCHES` = `docs/v2/THROUGHLINE.md` §3: on both sides of every join, never a hop across one)
| shot | how |
|---|---|
| S1 | `facing="back"` on `S1_BOLLARD` from frame 0, `paint="look"` (its tinted line draws on with the subject, its colour comes with the flood); `target` her from 1.25; `earsCover` at 4.98; it stays on the bollard: the A push-through into W sweeps it (no hop) |
| S2 | seated on `S2.pipSeat` (590, 1050) from the first frame (no landing); on "But" 8.30 `look` toward the wall (from behind a turn of 0.6-0.8 shows the trunk hook past the cheek); it holds the spot across the B match |
| S3 | seated on `S3.pipSeat` (590, 1050) = S2's spot from the first frame (no landing); turns to her on "she" 13.96 (`look`, or `facing`); it stays: the push-through into her sweeps it (no leap) |
| S4 | seated on the boat roof (`S4.pipSeat` (470, 1218), `ride` key) from the first frame (no landing); `facing: 'left'` at 19.55 (leads "heading"); it stays: the push-through into SUN1 sweeps it (no leap) |
| S5 | seated beside the stranger from the first frame (no arrival); `lookUp` at the blossom on "April" 20.76; `size` shrinks with the crane to >= 44 px; it holds the balustrade (366, 1195) until the blossom tree covers it (~23.81: no leap) |
| S6 | seated and still at the deal board's foot (`S6.pipSeat0` (360, 1410), 98 px) from the first frame; `flick: 'A'` at 26.50 (no droop); pass `idle={{flick: false}}` so no ambient flick competes; the push-through into SUN2 sweeps it |
| S7 | sit-watch at `BOARD_BOLLARD` from the first frame (no hop in), NO reaction: `idle={{flick: false}}`; seated until the boat's bow covers it (~32.83) |
| S8 | rides the wiping narrowboat in on its stern (32.97: the carrier), steps off 33.00, lands on (450, 1205) at 33.20 and rides the truck to `BOARD_BOLLARD`; `earsDown` at 33.78, `lookUp` at W on "not" 37.70; on the un-build it settles 30 px down to f0's bollard (700, 1235) (no hop) and ends in frame 0's state (its tinted line, the cascade's pale fill) |

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
