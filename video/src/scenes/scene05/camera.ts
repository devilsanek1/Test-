// S05 camera (storyboard v3, ONE owner per move: this scene's own keys; Film adds no camera on a 'matchcut').
// screen = (world - cam) x zoom + (540, 960)
//   cut(years) -> +0.30      push-in (540, 960, 1.08) -> (540, 960, 1.13), out(expo): the S04 dive lands still moving IN
//                            (log-zoom ~1.05 /s at the cut vs the dive's ~1.23 /s) and settles
//   +0.30 -> cut(was)-0.30   hold (540, 960, 1.13): locked while the teams, tablets, beams and the ring build
//   cut(was)-0.30 -> cut     truck-right (540 -> 690, 960, 1.13), in(sine): follows the messenger out of frame right; a
//                            FIXED 0.30 s ending on the cut, exiting at pi/2 x 150 / 0.30 x 1.13 = ~888 screen px/s
// Zoom is interpolated in log space. Every segment meets the next at zero velocity except the cut-on-action exit.

import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type Cam = {x: number; y: number; zoom: number};

export const K_LAND: Cam = {x: 540, y: 960, zoom: 1.08};
export const K_LOCK: Cam = {x: 540, y: 960, zoom: 1.13};
export const K_EXIT: Cam = {x: 690, y: 960, zoom: 1.13};
export const LAND = 0.3;
export const TRUCK = 0.3;

/** Camera at scene time t; `end` = the scene length (the cut on action). */
export function camAt(t: number, end: number): Cam {
  if (t < LAND) {
    const q = prog(t, 0, LAND, E.outExpo);
    return {x: K_LAND.x, y: K_LAND.y, zoom: Math.exp(lerp(Math.log(K_LAND.zoom), Math.log(K_LOCK.zoom), q))};
  }
  const q = prog(t, end - TRUCK, TRUCK, E.inSine);
  return {x: lerp(K_LOCK.x, K_EXIT.x, q), y: K_LOCK.y, zoom: K_LOCK.zoom};
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: Pt): Pt => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];

/** Screen point -> world point. */
export const toWorld = (c: Cam, p: Pt): Pt => [(p[0] - 540) / c.zoom + c.x, (p[1] - 960) / c.zoom + c.y];
