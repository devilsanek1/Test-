// S04 camera (storyboard v3, ONE owner per move: this scene's own keys; Film adds no camera on a 'matchcut').
// screen = (world - cam) x zoom + (540, 960)
//   cut(it) -> 'years'           push-in (330, 900, 1.50) -> (330, 891.6, 1.55), inOut(sine): a slow 3 % creep during
//                                the time-lapse (log zoom) ABOUT THE HERO CORNICE: the creep's y is solved so the cornice
//                                (world 640) holds at screen 570 (fix round 1: the storyboard's 898 raised it to 560,
//                                into caption line 2's descenders)
//   'years' -> cut(years)        dive (330, 891.6, 1.55) -> (360, 1130, 1.90), 0.365 s ending on the cut. Fix round 3:
//                                it starts ON w54 'years' (16.225, one frame before the storyboard's cut - 0.33) so the
//                                first frame is not a jump from rest, and
//                                - log zoom on a cubic Hermite p(u) = (3 - m) u^2 + (m - 2) u^3, p'(0) = 0, end slope
//                                  m = 1.5 (was in(quad), m = 2: 1.23 /s into the cut, a 2.1x brake against S05's old
//                                  landing). The handoff rate is ~0.8 /s on both sides: S04's last frame pair ~0.83 /s
//                                  (0.84 /s at the cut), S05's first pair ~0.79 /s (its A1 landing: K_LAND 1.055,
//                                  LAND_K 8);
//                                - lock4's SCREEN position travels (540, 1330) -> (483, 960) on a TRAPEZOID velocity
//                                  profile over the first 85 % of the dive (accelerate over its first 42 %, constant,
//                                  decelerate over the last 42 %; A1 fix round: was 30 %, the whole acceleration in
//                                  ~3 frames), so the last frame pair is a pure zoom about the lock.
//                                Measured (camspeed on S04seam f232-f255, A1 fix round), px / frame:
//                                0.03 | 13 37 60 81 91 89 73 56 39 29 | cut | S05 28 19 13 9: the onset ramps over five
//                                frames, peak 91, 29 into the cut and 28 out of it (velocity-continuous).
// The creep ends at zero velocity and the dive starts from zero velocity: velocity-continuous, no step.

import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type Cam = {x: number; y: number; zoom: number};

export const K_REST: Cam = {x: 330, y: 900, zoom: 1.5};
/** The cornice anchor of the creep: world y 640 (the hero cornice) stays at screen 570. */
export const CORNICE: {world: number; screen: number} = {world: 640, screen: 570};
export const K_CREEP: Cam = {x: 330, y: CORNICE.world - (CORNICE.screen - 960) / 1.55, zoom: 1.55};
export const K_LOCK: Cam = {x: 360, y: 1130, zoom: 1.9};
/** The dive's length (s), ending on the cut: from w54 'years' (16.225) to cut(years) (16.59). */
export const DIVE = 0.365;
/** lock4's centre (world): the dive's target. */
export const LOCK4: Pt = [330, 1130];

/** World point -> screen point. */
export const toScreen = (c: Cam, p: Pt): Pt => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
/** Screen point -> world point. */
export const toWorld = (c: Cam, p: Pt): Pt => [(p[0] - 540) / c.zoom + c.x, (p[1] - 960) / c.zoom + c.y];

/** The share of the dive over which lock4's screen position travels (the rest is a pure zoom about the lock). */
export const TRAVEL = 0.85;
/** The travel's trapezoid: accelerate over [0, ACC], constant to 1 - ACC, decelerate (normalised travel time). A1 fix
 *  round: 0.3 -> 0.42, the onset ramps over ~4-5 frames instead of 3 (simulated corner speed 1.5 -> 21 -> 45 -> 68 ->
 *  88 px / frame, peak ~93; the cut side is unchanged: the last 15 % is still a pure zoom). */
const ACC = 0.42;
/** The zoom's end slope (p'(1)): log-zoom rate at the cut = m x ln(1.9 / 1.55) / DIVE = 0.84 /s. */
const ZOOM_END_SLOPE = 1.5;

/** Normalised trapezoid-velocity position 0..1 (zero velocity at both ends, constant in the middle). */
export function trapezoid(x: number, acc = ACC): number {
  const u = Math.min(1, Math.max(0, x));
  const v = 1 / (1 - acc);
  if (u < acc) return (0.5 * v * u * u) / acc;
  if (u < 1 - acc) return 0.5 * v * acc + v * (u - acc);
  const r = 1 - u;
  return 1 - (0.5 * v * r * r) / acc;
}

/** The dive's log-zoom progress (cubic Hermite, zero start slope, end slope m). */
export const diveZoomEase = (u: number, m = ZOOM_END_SLOPE) => (3 - m) * u * u + (m - 2) * u * u * u;

/** Dive progress 0..1 (0 before the dive). */
export const diveK = (t: number, end: number) => prog(t, end - DIVE, DIVE, E.linear);

/** Camera at scene time t; `end` = the scene length (the cut into S05). */
export function camAt(t: number, end: number): Cam {
  const d0 = end - DIVE;
  if (t < d0) {
    const p = prog(t, 0, d0, E.inOutSine);
    const zoom = Math.exp(lerp(Math.log(K_REST.zoom), Math.log(K_CREEP.zoom), p));
    // y solved per frame so the cornice holds exactly (K_REST.y = 640 + 390 / 1.5 = 900 is on the same curve)
    return {x: lerp(K_REST.x, K_CREEP.x, p), y: CORNICE.world - (CORNICE.screen - 960) / zoom, zoom};
  }
  const u = Math.min(1, (t - d0) / DIVE);
  const zoom = Math.exp(lerp(Math.log(K_CREEP.zoom), Math.log(K_LOCK.zoom), diveZoomEase(u)));
  const s0 = toScreen(K_CREEP, LOCK4);
  const s1 = toScreen(K_LOCK, LOCK4);
  const q = trapezoid(u / TRAVEL);
  const sx = lerp(s0[0], s1[0], q);
  const sy = lerp(s0[1], s1[1], q);
  // the camera that puts LOCK4 at (sx, sy) with this zoom
  return {x: LOCK4[0] - (sx - 540) / zoom, y: LOCK4[1] - (sy - 960) / zoom, zoom};
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));
