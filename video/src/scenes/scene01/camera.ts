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
// SUN's exponent ramps to 1.15 on the dive's inOut(sine) curve (zero slope at its start: no velocity step) and the disc
// is lifted up out of the frame in screen space (-400 x diveS^2), so the sun leaves the frame with the dive (storyboard:
// 'It leaves the frame with the dive') while it zooms less than the facades (fix round 4; was a 1.5 ramp: inverted
// parallax), instead of a big disc at the right shrinking to S02's r110 across the cut.
// The far layer keeps 0.43 (ramping it too made the far civic silhouettes loom up in the gap: inverted parallax).
import {clamp, ease as E} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import {B} from './timing';

// Hook pass (wrap-up): the opening must hit physically and never sit still before the dive. Frame 0 is unchanged (zoom
// 1, the loop seam with S12). Then: a PUNCH-IN on the press's click (0 -> 0.25 s, +6 %, out(cubic)), a continuous
// CREEP to the dive (+10 % more by 4.385, inOut(sine): zero velocity into the dive's in(quad)), both about S at the
// bottom of the caption band (roofs barely rise into the band) over govB, and an impact JOLT on each shutter slam.
export const CAM = {
  punch: {t1: 0.25, z: 1.06},
  push: {t0: 0.25, t1: B.dive, z: 1.16, S: [600, 560] as [number, number]},
  dive: {t0: B.dive, t1: B.cut, z: 3.19 / 1.16},
} as const;
/** Shutter landings (timing.ts: slamB/slamA drop 0.16 s, slamC 0.113 s half drop): screen-space jolt, px. */
const JOLTS: [number, number][] = [[B.slamB + 0.16, 9], [B.slamA + 0.16, 7], [B.slamC + 0.113, 4]];
export const joltY = (t: number) => {
  let y = 0;
  for (const [ti, a] of JOLTS) if (t >= ti && t < ti + 0.2) y += a * Math.exp(-(t - ti) * 22) * Math.cos(2 * Math.PI * 11 * (t - ti));
  return y;
};

/** The dive's match point: govB's lock box (top-left, world (543,1318)) on screen at the hold camera and at the cut. */
const LOCK_W: [number, number] = [543, 1318];
const PUSH_S = CAM.push.S;
const P0: [number, number] = [PUSH_S[0] + (LOCK_W[0] - PUSH_S[0]) * CAM.push.z, PUSH_S[1] + (LOCK_W[1] - PUSH_S[1]) * CAM.push.z];
const P1: [number, number] = [560, 1150];

/** Parallax exponents per set layer (GovernmentPlaza wrap names) during the push / hold. */
export const PARALLAX: Record<string, number> = {sun: 0.43, far: 0.43, buildings: 1, govD: 1, ground: 1, light: 1, near: 1.43};
/** Layers whose exponent ramps during the dive (so the sun leaves the frame), and the exponent they reach at the cut. */
const DIVE_RAMP: Record<string, number> = {sun: 1.15};
/** Fix round 4 (review: ramped to 1.5 the farthest layer zoomed past the facades, inverted parallax for ~5 frames): the
 *  sun's exponent ramps only to 1.15 (it still zooms LESS than the buildings) and the disc is carried up out of the
 *  frame in screen space instead: y - 400 x diveS^2 (zero slope at the dive start: no velocity step). */
const DIVE_LIFT: Record<string, number> = {sun: -400};

export const pushQ = (t: number) => E.inOutSine(clamp((t - CAM.push.t0) / (CAM.push.t1 - CAM.push.t0)));
/** Log zoom of the opening (punch + creep), 0 at frame 0. */
const pushLogZ = (t: number) => Math.log(CAM.punch.z) * E.outCubic(clamp(t / CAM.punch.t1)) + Math.log(CAM.push.z / CAM.punch.z) * pushQ(t);
const diveU = (t: number) => clamp((t - CAM.dive.t0) / (CAM.dive.t1 - CAM.dive.t0));
/** The dive's zoom curve (log zoom, in(quad)). */
export const diveQ = (t: number) => E.inQuad(diveU(t));
/** The dive's translation curve (the lock's screen point, inOut(sine)). */
export const diveS = (t: number) => E.inOutSine(diveU(t));

/** World -> screen matrix of a layer at scene time t (layer = a GovernmentPlaza wrap name, or an exponent). */
export function layerMat(t: number, layer: string | number = 1): Mat {
  const f0 = typeof layer === 'number' ? layer : PARALLAX[layer] ?? 1;
  const pz = Math.exp(pushLogZ(t) * f0);
  const jy = joltY(t);
  const push0 = pz === 1 ? mat.I : mat.about(mat.scale(pz), PUSH_S[0], PUSH_S[1]);
  const push = jy ? mat.mul(mat.translate(0, jy), push0) : push0;
  if (t <= CAM.dive.t0) return push;
  const q = diveQ(t);
  const ramp = typeof layer === 'string' ? DIVE_RAMP[layer] : undefined;
  const f = ramp === undefined ? f0 : f0 + (ramp - f0) * diveS(t);
  const dz = Math.exp(Math.log(CAM.dive.z) * q * f);
  const s = diveS(t) * f;
  const tx = (P1[0] - P0[0]) * s;
  const ty = (P1[1] - P0[1]) * s;
  // zoom about the lock's hold screen point, then carry that point along its path (scaled by the layer's exponent)
  const lift = typeof layer === 'string' && DIVE_LIFT[layer] !== undefined ? DIVE_LIFT[layer] * diveS(t) * diveS(t) : 0;
  return mat.mul(mat.translate(tx, ty + lift), mat.mul(mat.about(mat.scale(dz), P0[0], P0[1]), push));
}

/** Screen position of a world point on a layer. */
export const toScreen = (t: number, p: [number, number], layer: string | number = 1): [number, number] => {
  const m = layerMat(t, layer);
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
};
export const zoomAt = (t: number, layer: string | number = 1) => layerMat(t, layer)[0];

/** Ink compensation in the dive: the camera scales every stroke 3.07x, S02 opens at ~2-4 px. Per layer, the factor
 *  (zoom / zoom at the dive start)^-DIVE_INK_K (ENGINE.md 4b): 1.0 up to 4.385 (no step). Fix round 4: fed to an
 *  <InkScale> around EVERY layer of the set AND the scene's extras (plaza.tsx wrap), so govA's columns, govB's door,
 *  pediment and lock box are compensated too.
 *  Cut S01|S02 (phase B): k 0.6 -> 0.85. With the house 0.6 the dive kept 3.07^0.4 = 1.57x of its line growth and the
 *  last S01 frame (f141, full res, near-axis strokes) measured p50 3.5 / p75 4.9 / p90 5.7 px against S02's first frame
 *  (f142) 2.4 / 3.5 / 3.9 px, the door frame and shutter box 5.5-5.9 px against S02's 4 px loupe ring and cornice, the
 *  lock ring 4.9 px against S02's 3.9 px callout ring. At 0.85 the dive keeps 3.07^0.15 = 1.18x (a 3.4 px line lands at
 *  ~4 px), so the weight carries through the matchcut (measured after: docs/scenes/S01.md 'Cut S01|S02'). */
export const DIVE_INK_K = 0.85;
export const inkComp = (t: number, layer: string | number = 'buildings') => (t <= CAM.dive.t0 ? 1 : Math.pow(zoomAt(t, layer) / zoomAt(CAM.dive.t0, layer), -DIVE_INK_K));
