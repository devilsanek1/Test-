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
// 1, the loop seam with S12). All moves are zooms about S (the push anchor, at the bottom of the caption band: nothing
// below y 560 can rise into the band) over govB, multiplied on log zoom:
//   click    0 -> 0.12      x1.025 out(cubic): the frame-0 press's click
//   punch    0.19 -> 0.36   x1.035 out(cubic): 'Governments', landing with shutdown ring 1 (as heads turn at 0.34)
//   creep    0.12 -> dive   inOut(sine), so click x punch x creep = 1.16 at the dive (as before)
//   purpose  3.885 -> 3.955 x1.10 out(cubic): a SNAP landing ON 'PURPOSE' (with govB's tag slap), then it relaxes
//            3.955 -> 4.25  to x1.04 inOut(sine) (fix round, hook review: the old x1.04 punch was ~17 px of motion at
//                           the tag, weaker than the shutter slams), with a 14 px jolt; net x1.04, so the zoom at the
//                           dive (1.2245), the dive maths, the lock across the cut and Pip's leap are unchanged
//   drift    3.84 -> dive   x1.015, velocity ~ (1 - u^4): the camera keeps creeping after the punch, slowing only in
//                          the last frames into the dive's zero-velocity start (3.96-4.38 is never still)
// and an impact JOLT on each shutter slam. The dive is built on the ACTUAL push matrix at B.dive (P0 = the lock box's
// screen point there, dive zoom = 3.19 / the zoom there), so the cut lands exactly as before.
export const CAM = {
  S: [600, 560] as [number, number],
  click: {t0: 0, t1: 0.12, z: 1.025},
  punch: {t0: B.ring[0].at, t1: 0.36, z: 1.035},
  creep: {t0: 0.12, t1: B.dive, z: 1.16 / (1.025 * 1.035)},
  purpose: {t0: B.purposeSlap - 0.07, t1: B.purposeSlap, z: 1.1, settle: 4.25, zEnd: 1.04},
  drift: {t0: 3.84, t1: B.dive, z: 1.015},
  dive: {t0: B.dive, t1: B.cut, zEnd: 3.19},
} as const;
/** Shutter landings (timing.ts: slamB/slamA drop 0.16 s, slamC 0.113 s half drop): screen-space jolt, px. */
const JOLTS: [number, number][] = [[B.slamB + 0.16, 9], [B.slamA + 0.16, 7], [B.slamC + 0.113, 4], [B.purposeSlap, 14]];
export const joltY = (t: number) => {
  let y = 0;
  for (const [ti, a] of JOLTS) if (t >= ti && t < ti + 0.2) y += a * Math.exp(-(t - ti) * 22) * Math.cos(2 * Math.PI * 11 * (t - ti));
  return y;
};

/** Parallax exponents per set layer (GovernmentPlaza wrap names) during the push / hold. */
export const PARALLAX: Record<string, number> = {sun: 0.43, far: 0.43, buildings: 1, govD: 1, ground: 1, light: 1, near: 1.43};
/** Layers whose exponent ramps during the dive (so the sun leaves the frame), and the exponent they reach at the cut. */
const DIVE_RAMP: Record<string, number> = {sun: 1.15};
/** Fix round 4 (review: ramped to 1.5 the farthest layer zoomed past the facades, inverted parallax for ~5 frames): the
 *  sun's exponent ramps only to 1.15 (it still zooms LESS than the buildings) and the disc is carried up out of the
 *  frame in screen space instead: y - 400 x diveS^2 (zero slope at the dive start: no velocity step). */
const DIVE_LIFT: Record<string, number> = {sun: -400};

const seg = (t: number, k: {t0: number; t1: number}) => clamp((t - k.t0) / (k.t1 - k.t0));
/** The drift's profile: velocity 1.25 (1 - u^4), so it moves at full speed under the 'PURPOSE' punch and slows only in
 *  the last frames before the dive (zero velocity at u = 1, like the dive's start). */
const driftQ = (u: number) => 1.25 * (u - Math.pow(u, 5) / 5);
export const pushQ = (t: number) => E.inOutSine(seg(t, CAM.creep));
/** Log zoom of the opening (click + punch + creep + purpose + drift), 0 at frame 0, constant from B.dive on. */
const pushLogZ = (t: number) =>
  Math.log(CAM.click.z) * E.outCubic(seg(t, CAM.click)) +
  Math.log(CAM.punch.z) * E.outCubic(seg(t, CAM.punch)) +
  Math.log(CAM.creep.z) * pushQ(t) +
  Math.log(CAM.purpose.z) * E.outCubic(seg(t, CAM.purpose)) -
  Math.log(CAM.purpose.z / CAM.purpose.zEnd) * E.inOutSine(seg(t, {t0: CAM.purpose.t1, t1: CAM.purpose.settle})) +
  Math.log(CAM.drift.z) * driftQ(seg(t, CAM.drift));
/** The push matrix of a layer (exponent f0) at t: the zoom about S, then the screen-space jolt. Constant from B.dive on. */
const pushMat = (t: number, f0: number): Mat => {
  const pz = Math.exp(pushLogZ(t) * f0);
  const jy = joltY(t);
  const push0 = pz === 1 ? mat.I : mat.about(mat.scale(pz), CAM.S[0], CAM.S[1]);
  return jy ? mat.mul(mat.translate(0, jy), push0) : push0;
};
const apply = (m: Mat, p: [number, number]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
/** The push's zoom at the dive start (layer exponent 1) and the dive's own zoom factor: 3.19 at the cut. */
export const ZOOM_AT_DIVE = pushMat(CAM.dive.t0, 1)[0];
const DIVE_Z = CAM.dive.zEnd / ZOOM_AT_DIVE;
/** The dive's match point: govB's lock box (top-left, world (543,1318)) on screen under the ACTUAL push matrix at
 *  B.dive (P0), and where S02's blueprint lock picks it up at the cut (P1). */
const LOCK_W: [number, number] = [543, 1318];
const P0: [number, number] = apply(pushMat(CAM.dive.t0, 1), LOCK_W);
const P1: [number, number] = [560, 1150];
const diveU = (t: number) => clamp((t - CAM.dive.t0) / (CAM.dive.t1 - CAM.dive.t0));
/** The dive's zoom curve (log zoom, u^p from zero velocity). p = 2 (in(quad)) at the old 1.16 hold; hook pass 2 raises
 *  the hold, so p is solved to keep the dive's END log-zoom velocity (p x ln(dive zoom) = 2 x ln(3.19 / 1.16)): the lock
 *  still grows ~1.2x per frame into the cut, as S02's blueprint lock does after it. */
const DIVE_POW = (2 * Math.log(3.19 / 1.16)) / Math.log(DIVE_Z);
export const diveQ = (t: number) => Math.pow(diveU(t), DIVE_POW);
/** The dive's translation curve (the lock's screen point, inOut(sine)). */
export const diveS = (t: number) => E.inOutSine(diveU(t));

/** World -> screen matrix of a layer at scene time t (layer = a GovernmentPlaza wrap name, or an exponent). */
export function layerMat(t: number, layer: string | number = 1): Mat {
  const f0 = typeof layer === 'number' ? layer : PARALLAX[layer] ?? 1;
  const push = pushMat(t, f0);
  if (t <= CAM.dive.t0) return push;
  const q = diveQ(t);
  const ramp = typeof layer === 'string' ? DIVE_RAMP[layer] : undefined;
  const f = ramp === undefined ? f0 : f0 + (ramp - f0) * diveS(t);
  const dz = Math.exp(Math.log(DIVE_Z) * q * f);
  const s = diveS(t) * f;
  const tx = (P1[0] - P0[0]) * s;
  const ty = (P1[1] - P0[1]) * s;
  // zoom about the lock's hold screen point, then carry that point along its path (scaled by the layer's exponent)
  const lift = typeof layer === 'string' && DIVE_LIFT[layer] !== undefined ? DIVE_LIFT[layer] * diveS(t) * diveS(t) : 0;
  return mat.mul(mat.translate(tx, ty + lift), mat.mul(mat.about(mat.scale(dz), P0[0], P0[1]), push));
}

/** Screen position of a world point on a layer. */
export const toScreen = (t: number, p: [number, number], layer: string | number = 1): [number, number] => apply(layerMat(t, layer), p);
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
/** Hook pass 2: the 'PURPOSE' punch and the drift raise the zoom at the dive start (1.16 -> ZOOM_AT_DIVE), so the dive
 *  itself zooms less (3.19 / ZOOM_AT_DIVE); k is solved so a buildings stroke lands at the cut with the SAME scale as
 *  before (1.16 x 2.75^0.15 = 1.350, i.e. k 0.85 at the old 1.16 hold): the matchcut line weights are unchanged. */
const INK_AT_CUT = 1.16 * Math.pow(3.19 / 1.16, 1 - 0.85);
export const DIVE_INK_K = 1 - Math.log(INK_AT_CUT / ZOOM_AT_DIVE) / Math.log(DIVE_Z);
export const inkComp = (t: number, layer: string | number = 'buildings') => (t <= CAM.dive.t0 ? 1 : Math.pow(zoomAt(t, layer) / zoomAt(CAM.dive.t0, layer), -DIVE_INK_K));
