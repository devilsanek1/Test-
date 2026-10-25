// S04 camera (storyboard v3, ONE owner per move: this scene's own keys; Film adds no camera on a 'matchcut').
// screen = (world - cam) x zoom + (540, 960)
//   cut(it) -> cut(years)-0.33   push-in (330, 900, 1.50) -> (330, 891.6, 1.55), inOut(sine): a slow 3 % creep during
//                                the time-lapse (log zoom) ABOUT THE HERO CORNICE: the creep's y is solved so the cornice
//                                (world 640) holds at screen 570 (fix round 1: the storyboard's 898 raised it to 560,
//                                into caption line 2's descenders)
//   cut(years)-0.33 -> cut(years) dive (330, 891.6, 1.55) -> (360, 1130, 1.90): a FIXED 0.33 s ending on the cut.
//                                Log zoom in(quad) (rate 2 x ln(1.9 / 1.55) / 0.33 = 1.23 /s at the cut, S05 lands at
//                                ~1.05 /s); lock4's SCREEN position travels (540, 1330) -> (483, 960) with an in-out
//                                sine over the first 85 % of the dive (fix round: 70 % made the screen speed dip to
//                                ~37 px / frame and re-accelerate to ~42 on the zoom alone; at 85 % it falls
//                                monotonically 92 -> 85 -> 71 -> 51 -> 42 px / frame into the cut).
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
/** The dive's fixed length (s), ending on the cut. */
export const DIVE = 0.33;
/** lock4's centre (world): the dive's target. */
export const LOCK4: Pt = [330, 1130];

/** World point -> screen point. */
export const toScreen = (c: Cam, p: Pt): Pt => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
/** Screen point -> world point. */
export const toWorld = (c: Cam, p: Pt): Pt => [(p[0] - 540) / c.zoom + c.x, (p[1] - 960) / c.zoom + c.y];

/** The share of the dive over which lock4's screen position travels (the rest is a pure zoom about the lock). */
export const TRAVEL = 0.85;

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
  const zoom = Math.exp(lerp(Math.log(K_CREEP.zoom), Math.log(K_LOCK.zoom), u * u));
  const s0 = toScreen(K_CREEP, LOCK4);
  const s1 = toScreen(K_LOCK, LOCK4);
  const q = E.inOutSine(Math.min(1, u / TRAVEL));
  const sx = lerp(s0[0], s1[0], q);
  const sy = lerp(s0[1], s1[1], q);
  // the camera that puts LOCK4 at (sx, sy) with this zoom
  return {x: LOCK4[0] - (sx - 540) / zoom, y: LOCK4[1] - (sy - 960) / zoom, zoom};
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));
