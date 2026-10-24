// scene06/camera.ts — the S06 camera (storyboard S06 camera[], docs/storyboard_v3_resolved.json) as a flat multiplane
// truck: screen = (world - (cx_f, 970)) * z + (540, 960), where a layer with parallax factor f sees the camera at
// cx_f = 560 + f * (cx - 560). At rest (cx 560) every layer lines up, so the set's world coords = the storyboard
// numbers. Keys:
//   cut -> cut + 0.63   truck-right x 380 -> 560 at zoom 1.04, out(cubic): enters at 3 x 180 x 1.04 / 0.63 = 891 px/s
//                       (= S05's exit speed: cut on action), decelerates with the messenger
//   -> cut(heads-up) - 0.21   push-in 1.04 -> 1.06 about the screen centre, inOut(sine) on log zoom (a 2 % breath)
//   -> cut(heads-up)          hold (the lens wipe starts)
// Parallax factors (storyboard layers): sky band / sun / far roofs 0.1, left houses + lane floor (+ the people and
// furniture standing on it) 0.6, the workshop 0.8, the messenger / Pip / Bit 1.0. The sun is screen space (it does not
// zoom; the far roofs zoom 2 % around it: < 6 px).

import {ease as E, lerp, mat, Mat, prog, Pt} from '../../lib';
import type {Beats} from './beats';

export type Cam = {x: number; y: number; z: number};
export const REST = {x: 560, y: 970} as const;
export const TRUCK_FROM = 380;
export const Z0 = 1.04;
export const Z1 = 1.06;

/** Layer parallax factors. */
export const F = {far: 0.1, sun: 0.1, floor: 0.6, houses: 0.6, workshop: 0.8, near: 1} as const;

export function camAt(t: number, B: Beats): Cam {
  const x = lerp(TRUCK_FROM, REST.x, prog(t, B.cut, B.truckEnd - B.cut, E.outCubic));
  const q = prog(t, B.truckEnd, B.lift - B.truckEnd, E.inOutSine);
  const z = Math.exp(lerp(Math.log(Z0), Math.log(Z1), q));
  return {x, y: REST.y, z};
}

/** Layer -> screen matrix for parallax factor f. */
export const layerMat = (c: Cam, f: number): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.z), mat.translate(-(REST.x + f * (c.x - REST.x)), -c.y));

/** World point of a layer -> screen. */
export const toScreen = (c: Cam, f: number, p: Pt): Pt => [(p[0] - (REST.x + f * (c.x - REST.x))) * c.z + 540, (p[1] - c.y) * c.z + 960];

/** Screen px the reference layer (f = 1) is displaced by, relative to rest (positive while the truck runs). */
export const truckPx = (c: Cam) => (REST.x - c.x) * c.z;
