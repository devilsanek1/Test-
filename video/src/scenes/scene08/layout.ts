// S08 layout: anchors the scene choreography reads, on top of the shared DomeCity v3 (dome="district", DOME.*).
import type {Pt} from '../../lib/sketch';
import {DOME, domeArcY} from '../shared/sets';

/** The coping's top y at x (DOME.parapet: sloping 1452 -> 1440 over x -160 .. 1240). */
export const copingY = (x: number) => DOME.parapet.top[0] + ((DOME.parapet.top[1] - DOME.parapet.top[0]) * (x + 160)) / 1400;

/** Multiplane parallax factor f = 1 - depth per DomeCity v3 layer name. The storyboard's 0.85 / 0.7 / 0.45 / 0.2 would
 *  put rows 1-3 over the sun on the crane's first frame (camera (540, 1260) zoom 1.3: the S07 match wants the sun at
 *  (640, 1021) r110 HALF behind the skyline); with these the far rooftops line up on that skyline at the cut, row 3 is
 *  still mostly behind our parapet, and the crane opens the city row by row. Rows 0-1, the dome and its glass share one
 *  depth so the glass copies stay registered on the dome through every move. */
export const F: Record<string, number> = {sky: 0, domeGlass: 0.02, row0: 0.02, row1: 0.02, dome: 0.02, row2: 0.25, near: 0.62, fg: 1};
export const depthOf = (name: string) => 1 - (F[name] ?? 1);

/** The counter board on our parapet (world x 430-890; the storyboard's labels need 1046-1440 to hold their sizes). */
export const BOARD = {x0: 430, x1: 890, y0: 1046, y1: 1436};
/** Pip on the coping at the right (the board would hide him at DOME.pip (500, 1448), and he would cover L9b). */
export const PIP: Pt = [915, copingY(915)];
/** The district dome's foot line (the rim crowd taps the glass here). */
export const DOME_FOOT = DOME.district.by;
export const domeY = (x: number) => domeArcY(x, 'district');
export const inDome = (x: number, y: number) => {
  const a = DOME.district;
  const u = (x - a.cx) / a.rx;
  const v = (a.by - y) / a.ry;
  return y < a.by && u * u + v * v < 1;
};

/** Row-3 doors: the set's five (DOME.rattlers.row3) + three the scene adds (x 30 left edge, 240 and 415: the doors
 *  two rattlers hop to on 'attempts'). Feet points + the attempter height there. */
export const R3 = DOME.rattlers.row3;
export const EXTRA_DOORS3 = [
  {x: 30, y: 1443, h: 60},
  {x: 240, y: 1440.5, h: 60},
  {x: 413, y: 1439, h: 60},
];
export const R2 = DOME.rattlers.row2;

