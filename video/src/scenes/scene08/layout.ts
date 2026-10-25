// S08 layout: anchors the scene choreography reads, on top of the shared DomeCity v3 (DOME.*).
import type {Pt} from '../../lib/sketch';
import {DOME} from '../shared/sets';
import type {DomeArc} from '../shared/sets';

/** The coping's top y at x (DOME.parapet: sloping 1452 -> 1440 over x -160 .. 1240). */
export const copingY = (x: number) => DOME.parapet.top[0] + ((DOME.parapet.top[1] - DOME.parapet.top[0]) * (x + 160)) / 1400;

/** Multiplane parallax factor f = 1 - depth per DomeCity v3 layer name. The storyboard's 0.85 / 0.7 / 0.45 / 0.2 would
 *  put rows 1-3 over the sun on the crane's first frame (camera (540, 1260) zoom 1.3: the S07 match wants the sun at
 *  (640, 1021) r110 HALF behind the skyline); with these the far rooftops line up on that skyline at the cut, row 3 is
 *  still mostly behind our parapet, and the crane opens the city row by row. Fix round 3b: rows 0 / 1 step apart (0.04 /
 *  0.08, the dome and its glass between them at 0.06) so the crane separates EVERY row (rows 3 -> 0: 0.62 / 0.25 / 0.08
 *  / 0.04; the far rows used to share 0.02 and the move read as a parapet drop over two layers); the glass copies of
 *  rows 0 / 1 drift <= 4 px against the arc at the full push (inside the 4.8 px arc stroke + the fill misregistration). */
export const F: Record<string, number> = {sky: 0, domeGlass: 0.06, row0: 0.04, row1: 0.08, dome: 0.06, row2: 0.25, near: 0.62, fg: 1};
export const depthOf = (name: string) => 1 - (F[name] ?? 1);

/** The counter board on our parapet. Fix round 1: x 440-880 (was 430-890) so that with the push camera at x 530 it
 *  spans screen 437-943 at the 1.15 push (left of the right rail) and 440-880 at rest, and the dome district + its
 *  watchtower stand CLEAR of it on the left (>= 20 px of air at rest and at the push). */
export const BOARD = {x0: 440, x1: 880, y0: 1046, y1: 1436};
/** The baseline push target (camera x). Fix round 3b: 555 (was 530) keeps the board's right edge at screen x <= 915 and
 *  the tally gates / the L10 stamp <= 890 at the 1.15 push (clear of the platform's right rail, x > 950). */
export const PUSH_X = 555;

/** The district dome, LEFT of the board. Fix round 3b: a broad SHIELD profile (rx 200 / ry 212: feet (80, 1080) /
 *  (480, 1080), apex (280, 868), ~1.9:1) instead of the 1.2:1 bell jar: its right flank runs BEHIND the board's left edge
 *  (the board at depth 0 occludes it), so the dome reads bigger than the frame allows. The counted pile stands in
 *  front of its foot at x 112-404 (the paint edge eats the left ~85 px in the film); the climbers stand ON its left
 *  shoulder. */
export const DOME8: DomeArc = {cx: 280, by: 1080, rx: 200, ry: 212};

/** Pip on the coping LEFT of the board (fix round 1: at x 915 he sat on the board's corner and in the right rail). */
export const PIP: Pt = [390, copingY(390)];

/** The watchtower, standing INSIDE the glass right of the dome's centre (fix round 3b: x 302-338; the dome's right
 *  flank is behind the board): lattice from row 1 (y 1100) up to a 40 x 38 cabin (300-340 x 922-960, roof apex 908);
 *  the searchlight lamp on the cabin's left side points across the dome at its far (left) flank and down at the pile. */
export const TOWER8 = {x0: 302, x1: 338, base: 1100, cabin: [300, 922, 40, 38] as [number, number, number, number], top: 908, light: [296, 941] as Pt};

/** The dome arc's y at x (top of the glass), or the foot line outside it. */
export const domeY = (x: number) => {
  const u = (x - DOME8.cx) / DOME8.rx;
  return Math.abs(u) >= 1 ? DOME8.by : DOME8.by - DOME8.ry * Math.sqrt(1 - u * u);
};
/** The dome's outer flank x at height y (side -1 = left, +1 = right). */
export const flankX = (y: number, side: -1 | 1) => {
  const v = Math.max(0, Math.min(1, (DOME8.by - y) / DOME8.ry));
  return DOME8.cx + side * DOME8.rx * Math.sqrt(1 - v * v);
};
export const inDome = (x: number, y: number) => {
  const a = DOME8;
  const u = (x - a.cx) / a.rx;
  const v = (a.by - y) / a.ry;
  return y < a.by && u * u + v * v < 1;
};

/** Row-3 doors (fix round 2: the scene draws its own LIGHT doors, the set's teal ones are off): three big near doors
 *  x 125 / 220 / 315 (96-98 px: the nearest rattlers are 86-92 px, so 'a hooded person at a door' reads at phone
 *  size), a small one at 455 (behind the board once it rises) and one at the left edge (x 40: the hop target on
 *  'attempts'). Door centre x, sill y (just above our coping), door height. */
export const DOORS3 = [
  {x: 125, h: 96},
  {x: 220, h: 98},
  {x: 315, h: 96},
  {x: 455, h: 74},
  {x: 40, h: 96},
].map((d) => ({...d, y: copingY(d.x) - 9}));
/** Row-2 doors: the set's slots (street level y 1300 in front of low row-3 sheds), drawn light by the scene. */
export const R2 = DOME.rattlers.row2;
