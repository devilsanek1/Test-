// S01 camera (storyboard v3 S01 'Camera'): world = canvas px at rest, screen = (world - cam) x zoom + (540, 960).
//   START -> w6 'down'      push-in (540,960,1.00) -> (552,972,1.04), inOut(sine), from REST (the loop seam)
//   w6 'down' -> 4.385      hold (552,972,1.04)
//   4.385 -> cut (0.33 s)   the dive (552,972,1.04) -> (536.7,1258.4,3.19): govB's lock box lands at screen (560,1150)
//                           at 70 x 86 px, exactly where S02's blueprint lock lands
// The push is a zoom about its key pair's FIXED screen point, on log zoom. The dive (fix round 1) is anchored ON THE
// LOCK: the lock box's screen point p(u) eases from its hold position to (560,1150) with inOut(sine) while the zoom
// grows about it on log zoom with in(quad) (the storyboard's profile), so the lock's screen velocity is ZERO at the cut,
// like S02's lock, which holds still at (560,1150) from its first frame (gate 1: no translation stop across the cut);
// the end camera is unchanged. Light multiplane parallax (storyboard: far x0.3 / buildings x0.7 / near x1.0) = the same
// move raised to f = ratio / 0.7 per layer: far + sun 0.43, buildings / ground / light 1, near 1.43. During the dive the
// SUN's exponent ramps to 1.5 on the dive's inOut(sine) curve (zero slope at its start: no velocity step), so the sun
// leaves the frame with the dive (storyboard: 'It leaves the frame with the dive'): its disc is fully above the frame on
// the last frame (f141: bottom edge y -168), instead of a big disc at the right shrinking to S02's r110 across the cut.
// The far layer keeps 0.43 (ramping it too made the far civic silhouettes loom up in the gap: inverted parallax).
import {clamp, ease as E} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import {B} from './timing';

export const CAM = {
  push: {t0: 0, t1: B.dive - 2.405, z: 1.04, S: [852, 1272] as [number, number]}, // t1 = 1.98 ('down')
  dive: {t0: B.dive, t1: B.cut, z: 3.19 / 1.04},
} as const;

/** The dive's match point: govB's lock box (top-left, world (543,1318)) on screen at the hold camera and at the cut. */
const LOCK_W: [number, number] = [543, 1318];
const P0: [number, number] = [(LOCK_W[0] - 552) * 1.04 + 540, (LOCK_W[1] - 972) * 1.04 + 960]; // (530.64, 1319.84)
const P1: [number, number] = [560, 1150];
const PUSH_S = CAM.push.S;

/** Parallax exponents per set layer (GovernmentPlaza wrap names) during the push / hold. */
export const PARALLAX: Record<string, number> = {sun: 0.43, far: 0.43, buildings: 1, govD: 1, ground: 1, light: 1, near: 1.43};
/** Layers whose exponent ramps during the dive (so the sun leaves the frame), and the exponent they reach at the cut. */
const DIVE_RAMP: Record<string, number> = {sun: 1.5};

export const pushQ = (t: number) => E.inOutSine(clamp((t - CAM.push.t0) / (CAM.push.t1 - CAM.push.t0)));
const diveU = (t: number) => clamp((t - CAM.dive.t0) / (CAM.dive.t1 - CAM.dive.t0));
/** The dive's zoom curve (log zoom, in(quad)). */
export const diveQ = (t: number) => E.inQuad(diveU(t));
/** The dive's translation curve (the lock's screen point, inOut(sine)). */
export const diveS = (t: number) => E.inOutSine(diveU(t));

/** World -> screen matrix of a layer at scene time t (layer = a GovernmentPlaza wrap name, or an exponent). */
export function layerMat(t: number, layer: string | number = 1): Mat {
  const f0 = typeof layer === 'number' ? layer : PARALLAX[layer] ?? 1;
  const pz = Math.exp(Math.log(CAM.push.z) * pushQ(t) * f0);
  const push = pz === 1 ? mat.I : mat.about(mat.scale(pz), PUSH_S[0], PUSH_S[1]);
  if (t <= CAM.dive.t0) return push;
  const q = diveQ(t);
  const ramp = typeof layer === 'string' ? DIVE_RAMP[layer] : undefined;
  const f = ramp === undefined ? f0 : f0 + (ramp - f0) * diveS(t);
  const dz = Math.exp(Math.log(CAM.dive.z) * q * f);
  const s = diveS(t) * f;
  const tx = (P1[0] - P0[0]) * s;
  const ty = (P1[1] - P0[1]) * s;
  // zoom about the lock's hold screen point, then carry that point along its path (scaled by the layer's exponent)
  return mat.mul(mat.translate(tx, ty), mat.mul(mat.about(mat.scale(dz), P0[0], P0[1]), push));
}

/** Screen position of a world point on a layer. */
export const toScreen = (t: number, p: [number, number], layer: string | number = 1): [number, number] => {
  const m = layerMat(t, layer);
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
};
export const zoomAt = (t: number, layer: string | number = 1) => layerMat(t, layer)[0];
