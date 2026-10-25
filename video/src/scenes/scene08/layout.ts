// S08 layout: anchors the scene choreography reads, on top of the shared DomeCity v3 (DOME.*).
import type {Pt} from '../../lib/sketch';
import {DOME} from '../shared/sets';
import type {DomeArc} from '../shared/sets';

/** The coping's top y at x (DOME.parapet: sloping 1452 -> 1440 over x -160 .. 1240). */
export const copingY = (x: number) => DOME.parapet.top[0] + ((DOME.parapet.top[1] - DOME.parapet.top[0]) * (x + 160)) / 1400;

/** Multiplane parallax factor f = 1 - depth per DomeCity v3 layer name. The storyboard's 0.85 / 0.7 / 0.45 / 0.2 would
 *  put rows 1-3 over the sun on the crane's first frame (camera (540, 1260) zoom 1.3: the S07 match wants the sun at
 *  (640, 1021) r110 HALF behind the skyline); with these the far rooftops line up on that skyline at the cut, row 3 is
 *  still mostly behind our parapet, and the crane opens the city row by row. Rows 0-1, the dome and its glass share one
 *  depth so the glass copies stay registered on the dome through every move. */
export const F: Record<string, number> = {sky: 0, domeGlass: 0.02, row0: 0.02, row1: 0.02, dome: 0.02, row2: 0.25, near: 0.62, fg: 1};
export const depthOf = (name: string) => 1 - (F[name] ?? 1);

/** The counter board on our parapet. Fix round 1: x 440-880 (was 430-890) so that with the push camera at x 530 it
 *  spans screen 437-943 at the 1.15 push (left of the right rail) and 440-880 at rest, and the dome district + its
 *  watchtower stand CLEAR of it on the left (>= 20 px of air at rest and at the push). */
export const BOARD = {x0: 440, x1: 880, y0: 1046, y1: 1436};
/** The baseline push target (camera x): 530 keeps the whole board left of x 950 at 1.15. */
export const PUSH_X = 530;

/** The district dome, slid LEFT of the board. Fix round 2 (polish): narrowed to rx 150 and moved right (feet (120, 1080)
 *  / (420, 1080), apex (270, 835)) so the counted pile at its foot and flank stands at screen x >= 120: in the assembled
 *  film the paint edge eats the left ~85 px (fix round 1's pile at x 0-85 was mostly paper there). Still ~1/5 of the
 *  visible city and clear of the board (>= 16 px at the 1.15 push). */
export const DOME8: DomeArc = {cx: 270, by: 1080, rx: 150, ry: 245};

/** Pip on the coping LEFT of the board (fix round 1: at x 915 he sat on the board's corner and in the right rail). */
export const PIP: Pt = [390, copingY(390)];

/** The watchtower, standing INSIDE the glass by the dome's right flank (it would otherwise stand in the board):
 *  lattice from row 1 (y 1100) up to a 40 x 38 cabin (334-374 x 922-960, roof apex 908); the searchlight lamp on the
 *  cabin's left side points across the dome at its far (left) flank and down at the pile. */
export const TOWER8 = {x0: 336, x1: 372, base: 1100, cabin: [334, 922, 40, 38] as [number, number, number, number], top: 908, light: [330, 941] as Pt};

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
