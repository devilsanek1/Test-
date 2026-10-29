// scene06/camera.ts — the S06 camera (storyboard S06 camera[], docs/storyboard_v3_resolved.json) as a flat multiplane
// truck: screen = (world - (cx_f, 970)) * z + (540, 960), where a layer with parallax factor f sees the camera at
// cx_f = 560 + f * (cx - 560). At rest (cx 560) every layer lines up, so the set's world coords = the storyboard
// numbers. Keys:
//   cut -> cut + 0.63   truck-right x 380 -> 560 at zoom 1.04, out(cubic): enters at 3 x 180 x 1.04 / 0.63 = 891 px/s
//                       (= S05's exit speed: cut on action), decelerates with the messenger
//   -> cut(heads-up) - 0.21   push-in 1.04 -> 1.06 about the screen centre, inOut(sine) on log zoom (a 2 % breath)
//   -> cut(heads-up)          hold (the lens wipe starts)
// Parallax factors (storyboard layers, at rest): sky band / sun / far roofs 0.1, left houses + lane floor (+ the people
// and furniture standing on it) 0.6, the workshop 0.8, the messenger / Pip / Bit 1.0. The sun is screen space (it does
// not zoom; the far roofs zoom 2 % around it: < 6 px).
//
// FIX ROUND 1 (cut-on-action speed): the layers that FILL the frame (the lane floor + left houses, the workshop) enter
// at the speed of the layer that fills S05's last frame, not at 0.6 / 0.8 of the near plane: during the truck their
// factors start at F_TRUCK (0.77 / 0.9) and blend back to the storyboard factors (smoothstep over the truck's 0.63 s,
// done by 20.403), and every layer still lands on its rest position. Measured on S06Film (scripts/camspeed.py on frames
// 585-611): S05's multiplane exit (its facade / banner 0.67, steps 1.0) leaves at 19.7 px / frame (global) and 29.3
// (steps); S06 enters at ~19.5 (lane + houses) and ~26 (the near plane), then decelerates evenly.

import {clamp, ease as E, lerp, mat, Mat, prog, Pt} from '../../lib';
import type {Beats} from './beats';

/** b = the truck weight of the layer factors (1 at the cut -> 0 when the truck lands). */
export type Cam = {x: number; y: number; z: number; b: number};
export const REST = {x: 560, y: 970} as const;
export const TRUCK_FROM = 380;
export const Z0 = 1.04;
export const Z1 = 1.06;

/** Layer parallax factors at rest (storyboard). */
export const F = {far: 0.1, sun: 0.1, floor: 0.6, houses: 0.6, workshop: 0.8, near: 1, fg: 1.12} as const;
/** Layer factors at the cut (blend to F over the truck). */
export const F_TRUCK = {far: 0.1, sun: 0.1, floor: 0.77, houses: 0.77, workshop: 0.9, near: 1, fg: 1.12} as const;
export type Layer = keyof typeof F;

export function camAt(t: number, B: Beats): Cam {
  const u = prog(t, B.cut, B.truckEnd - B.cut);
  const x = lerp(TRUCK_FROM, REST.x, E.outCubic(u));
  const q = prog(t, B.truckEnd, B.lift - B.truckEnd, E.inOutSine);
  const z = Math.exp(lerp(Math.log(Z0), Math.log(Z1), q));
  const s = clamp(u);
  return {x, y: REST.y, z, b: 1 - s * s * (3 - 2 * s)};
}

/** The effective parallax factor of a layer now. */
export const fOf = (c: Cam, l: Layer): number => F[l] + (F_TRUCK[l] - F[l]) * c.b;

/** Layer -> screen matrix for parallax factor f. */
export const layerMat = (c: Cam, f: number): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.z), mat.translate(-(REST.x + f * (c.x - REST.x)), -c.y));

/** Layer -> screen matrix for a named layer (its factor blended over the truck). */
export const layerM = (c: Cam, l: Layer): Mat => layerMat(c, fOf(c, l));

/** World point of a layer -> screen. */
export const toScreen = (c: Cam, f: number, p: Pt): Pt => [(p[0] - (REST.x + f * (c.x - REST.x))) * c.z + 540, (p[1] - c.y) * c.z + 960];

/** Screen px the reference layer (f = 1) is displaced by, relative to rest (positive while the truck runs). */
export const truckPx = (c: Cam) => (REST.x - c.x) * c.z;
