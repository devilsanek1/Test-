// S01 camera (storyboard v3 S01 'Camera'): world = canvas px at rest, screen = (world - cam) x zoom + (540, 960).
//   START -> w6 'down'      push-in (540,960,1.00) -> (552,972,1.04), inOut(sine), from REST (the loop seam)
//   w6 'down' -> 4.385      hold (552,972,1.04)
//   4.385 -> cut (0.33 s)   the dive (552,972,1.04) -> (536.7,1258.4,3.19), in(quad): govB's lock box lands at screen
//                           (560,1150) at 70 x 86 px, exactly where S02's blueprint lock lands
// Both moves are zooms about a FIXED screen point (the fixed point of each storyboard key pair), on log zoom, so the
// buildings plane hits the storyboard keys exactly. Light multiplane parallax (storyboard: far x0.3 / buildings x0.7 /
// near x1.0) = the same zoom raised to f = ratio / 0.7 per layer: far 0.43, buildings / ground / light 1, near 1.43.
import {clamp, ease as E} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import {B} from './timing';

export const CAM = {
  push: {t0: 0, t1: B.dive - 2.405, z: 1.04, S: [852, 1272] as [number, number]}, // t1 = 1.98 ('down')
  dive: {t0: B.dive, t1: B.cut, z: 3.19 / 1.04},
} as const;

// The dive's fixed point: world (529.30, 1396.93) at the hold camera (552, 972, 1.04) -> screen (516.39, 1401.93).
const DIVE_S: [number, number] = [(529.302 - 552) * 1.04 + 540, (1396.93 - 972) * 1.04 + 960];
const PUSH_S = CAM.push.S;

/** Parallax exponents per set layer (GovernmentPlaza wrap names). */
export const PARALLAX: Record<string, number> = {sun: 0.43, far: 0.43, buildings: 1, govD: 1, ground: 1, light: 1, near: 1.43};

export const pushQ = (t: number) => E.inOutSine(clamp((t - CAM.push.t0) / (CAM.push.t1 - CAM.push.t0)));
export const diveQ = (t: number) => E.inQuad(clamp((t - CAM.dive.t0) / (CAM.dive.t1 - CAM.dive.t0)));

/** World -> screen matrix of a layer with parallax exponent f at scene time t. */
export function layerMat(t: number, f = 1): Mat {
  const pz = Math.exp(Math.log(CAM.push.z) * pushQ(t) * f);
  const dz = Math.exp(Math.log(CAM.dive.z) * diveQ(t) * f);
  const push = pz === 1 ? mat.I : mat.about(mat.scale(pz), PUSH_S[0], PUSH_S[1]);
  return dz === 1 ? push : mat.mul(mat.about(mat.scale(dz), DIVE_S[0], DIVE_S[1]), push);
}

/** Screen position of a world point on a layer. */
export const toScreen = (t: number, p: [number, number], f = 1): [number, number] => {
  const m = layerMat(t, f);
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
};
export const zoomAt = (t: number, f = 1) => layerMat(t, f)[0];
