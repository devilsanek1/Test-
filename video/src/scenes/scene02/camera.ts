// S02 camera (storyboard v3 S02 `camera`): a flat zoom + translate, screen = (world - cam) x zoom + (540, 960).
//   cut -> +0.40 s   (470.6, 794.8, 1.15) -> (472.6, 813.8, 1.30), out(quad): the S01 dive lands and keeps moving IN
//                    while it decelerates; the lock detail stays at screen (560, 1150).
//   +0.40 -> end     (472.6, 813.8, 1.30) -> (474, 807.7, 1.44), inOut(sine): an 11 % creep (the cornice pinned at ~684).
// Zoom is interpolated in log space; both segments meet at zero velocity.
// Fix round 1: the storyboard's out(expo) 0.30 s halved the frame's speed every frame (camspeed: 16.7 -> 7.7 -> 3.6
// px/f, a slam right after the cut). The dive's RATE is now carried on the match object by the loupe (Scene02 loupeK:
// camera + loupe follow one out(cubic) log-zoom curve from ~6.3/s), so the camera itself lands with a constant
// deceleration: out(quad) over 0.40 s = ~26 px/f at the frame corners decelerating ~2.2 px/f per frame (gate 1 limit 2.5).
import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';

export type Cam = {x: number; y: number; zoom: number};

const K0: Cam = {x: 470.6, y: 794.8, zoom: 1.15};
const K1: Cam = {x: 472.6, y: 813.8, zoom: 1.3};
// hook pass (wrap-up): a real creep instead of 3 % (1.30 -> 1.44 over ~3.3 s) so the board never sits still; y pans up
// so the cornice stays at screen y ~684 (world 616), the sky and the sun's cap above it unchanged
const K2: Cam = {x: 474.0, y: 807.7, zoom: 1.44};
export const LAND = 0.4;

const mixCam = (a: Cam, b: Cam, q: number): Cam => ({x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), q))});

/** Camera at scene time t (end = scene length, the creep's end key). */
export function camAt(t: number, end: number): Cam {
  if (t <= LAND) return mixCam(K0, K1, prog(t, 0, LAND, E.outQuad));
  return mixCam(K1, K2, prog(t, LAND, end - LAND, E.inOutSine));
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: [number, number]): [number, number] => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
