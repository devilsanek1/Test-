// S12 camera (storyboard v3 S12 'Camera'): cut(everything) -> END, ONE slow 3 % pull-back (552,972,1.03) -> (540,960,1.0),
// inOut(sine), arriving at ZERO velocity on the last frame = frame 0's camera (S01's sine push starts from rest).
// world = canvas px at rest; screen = (world - cam) x zoom + (540, 960). Like S01 (scene01/camera.ts), the move is a zoom
// about its key pair's FIXED screen point, on log zoom: (552, 972, 1.03) fixes screen (952, 1372); the zoom runs
// 1.03 -> 1 with in-out sine. Light multiplane parallax with S01's exponents (far + sun 0.43, buildings / ground /
// light 1, near 1.43): every layer lands on the identity together, so the last frame is S01's frame-0 camera.
// The move lands one frame before END (CAM_T1): the scene's last frame (film 55.333) is EXACTLY at rest (no sub-pixel
// residue against frame 0); its speed there is ~0.
import {clamp, ease as E} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import {PARALLAX} from '../scene01/camera';
import {DUR} from './timing';

export const CAM = {z0: 1.03, x0: 552, y0: 972, t1: DUR - 0.03} as const;
/** The fixed screen point of the (552, 972, 1.03) -> rest pair: (c - 540 z0 ... ) solved per axis. */
export const FIXED: [number, number] = [(540 - CAM.x0 * CAM.z0) / (1 - CAM.z0), (960 - CAM.y0 * CAM.z0) / (1 - CAM.z0)]; // (952, 1372)

/** 0 at the cut, 1 at rest. */
export const camQ = (t: number) => E.inOutSine(clamp(t / CAM.t1));

/** World -> screen matrix of a layer (GovernmentPlaza wrap name, or an exponent) at S12-local t. */
export function layerMat(t: number, layer: string | number = 1): Mat {
  const f = typeof layer === 'number' ? layer : PARALLAX[layer] ?? 1;
  const z = Math.exp(Math.log(CAM.z0) * (1 - camQ(t)) * f);
  return z === 1 ? mat.I : mat.about(mat.scale(z), FIXED[0], FIXED[1]);
}

export const toScreen = (t: number, p: [number, number], layer: string | number = 1): [number, number] => {
  const m = layerMat(t, layer);
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
};
