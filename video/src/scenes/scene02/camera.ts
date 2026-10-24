// S02 camera (storyboard v3 S02 `camera`): a flat zoom + translate, screen = (world - cam) x zoom + (540, 960).
//   cut -> +0.30 s   (470.6, 794.8, 1.15) -> (472.6, 813.8, 1.30), out(expo): the S01 dive lands and keeps moving IN
//                    while it decelerates; the lock detail stays at screen (560, 1150) (log-zoom ~2.8/s at the cut).
//   +0.30 -> end     (472.6, 813.8, 1.30) -> (474, 822, 1.34), inOut(sine): a slow 3 % creep (the cornice stays >= 560).
// Zoom is interpolated in log space; both segments meet at ~zero velocity (out(expo) ends at 0.7 % of its start speed).
import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';

export type Cam = {x: number; y: number; zoom: number};

const K0: Cam = {x: 470.6, y: 794.8, zoom: 1.15};
const K1: Cam = {x: 472.6, y: 813.8, zoom: 1.3};
const K2: Cam = {x: 474.0, y: 822.0, zoom: 1.34};
export const LAND = 0.3;

const mixCam = (a: Cam, b: Cam, q: number): Cam => ({x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), q))});

/** Camera at scene time t (end = scene length, the creep's end key). */
export function camAt(t: number, end: number): Cam {
  if (t <= LAND) return mixCam(K0, K1, prog(t, 0, LAND, E.outExpo));
  return mixCam(K1, K2, prog(t, LAND, end - LAND, E.inOutSine));
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: [number, number]): [number, number] => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
