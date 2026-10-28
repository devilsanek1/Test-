// V2S7_pip.ts (lane L5): S7's camera clock, shared by V2S7's parts. (The file name stays from the retired S6 -> S7 hop:
// conform_L5.md retired it, 2026-10-28; Pip now sits on the bollard from S7's first frame.)
//   1. The ONE 4 % story push about B's centre (map S7.camera.push, 28.40-30.04, ease in-out, landing on "principles":
//      B exact), the same on every world plane (a story move, never a float).
//   2. A gentle PARALLAX float in the hold after it (DIRECTION rule 8; lib/depth floatAt / parallaxOffset, as S1's
//      V2S1_float): two straight legs 30.20-32.50, home at 30.04 (the push lands, B exact) and from 32.50 (the narrowboat
//      wipe starts 32.70 from rest); each plane shows its share of the float, the sky and SUN2 nothing.
// FILM seconds everywhere (scene-local = film - S7_T0).
import {S7, zoomAt, type XY} from '../world/map';
import {floatAt, floatProblems, parallaxOffset, PARALLAX_SKY, type FloatLeg} from '../../lib/depth';

/** S7 starts at 28.10 (pulled back out of SUN2 by the S6 -> S7 push-through, 28.10-28.25). */
export const S7_T0 = 28.1;
export const S7_POSE_T = 30.04;

/** The push at film time T: zoom z about (ax, ay); world coords = the 30.04 pose. */
export function s7PushAt(T: number): {z: number; ax: number; ay: number} {
  const k = S7.camera.push;
  return {z: zoomAt(k, T), ax: k.anchor.x, ay: k.anchor.y};
}

/** The float's legs (near-ground px from home, FILM s): out after the push has landed, home before the wipe. */
export const S7_FLOAT_LEGS: FloatLeg[] = [
  {t0: 30.2, t1: 31.35, to: [7, -3]},
  {t0: 31.35, t1: 32.5, to: [0, 0]},
];
/** Home at these times (floatProblems): the join in (28.10-28.25), the push's landing (30.04), the wipe (32.50 on). */
export const S7_FLOAT_REST = [28.1, 28.25, 30.04, 32.5, 32.7, 33.16];
/** floatProblems(S7_FLOAT_LEGS, {rest: S7_FLOAT_REST}) must be [] (net <= 12 px, peak <= 10 px/s, home at the rests). */
export const s7FloatProblems = () => floatProblems(S7_FLOAT_LEGS, {rest: S7_FLOAT_REST});

/** The near-ground float at film time T. */
export const s7FloatAt = (T: number): [number, number] => floatAt(T, S7_FLOAT_LEGS) as [number, number];

/** S7's planes (lib/depth parallax planes): -1 the cafe tables and things, 0 the board + forecourt, +1 the wing, +2 the
 *  plane trees on the sunset band, +3 the far roofs in the west gap; the sky and SUN2 never float. */
export const S7_PLANE = {sky: PARALLAX_SKY, farRoofs: 3, trees: 2, wing: 1, subject: 0, cafe: -1} as const;

/** One plane's float offset (px) at film time T. */
export const s7PlaneOffset = (T: number, plane: number): XY => {
  const [dx, dy] = parallaxOffset(s7FloatAt(T), plane);
  return {x: dx, y: dy};
};

/** S7's camera at film time T for a world point on `plane` (default the subject's plane): the push, then the plane's
 *  float share. World coords = the 30.04 pose. */
export function s7CamAt(T: number, plane: number = S7_PLANE.subject): {z: number; ax: number; ay: number; dx: number; dy: number} {
  const p = s7PushAt(T);
  const o = s7PlaneOffset(T, plane);
  return {...p, dx: o.x, dy: o.y};
}

/** A world point (S7's 30.04 pose) on screen at film time T. */
export function s7Screen(p: XY, T: number, plane: number = S7_PLANE.subject): XY {
  const c = s7CamAt(T, plane);
  return {x: c.ax + (p.x - c.ax) * c.z + c.dx, y: c.ay + (p.y - c.ay) * c.z + c.dy};
}

/** Pip's size (seat to head top, world px at S7's pose): the same pose and size as at her board in S8 (A5). */
export const PIP_SIZE_S7 = 100;
