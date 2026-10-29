// The sun's glide-hop across the S03 | S04 match cut (cut continuity pass, phase B): ONE screen-space path shared by
// both scenes, so the match object moves as one motion through the cut.
//
// Before: S03 blended its slot offset out over the hop's first half (x steps 16, 14, 13, 12.5, 13, 14, 16 px / frame:
// a dip) and S04 bent the rest of the hop toward its clear-sky touch-down (22, 30, 34.5, 34, 31, 23 px / frame): the
// sun slowed down, then got a kick right after the cut (an acceleration of +5.6 / +8.5 px / frame^2 on S04's first two
// frames). Now one quartic per axis runs from S03's slot (take-off at end(it)) through the storyboard's cut point
// (810, 680) to S04's touch-down (990, 668) on 'This', with the touch-down velocity S04's landing always had: a single
// bell of speed (7, 9, 12, 16, 21, 25 | 29, 32, 33, 32, 28, 20 px / frame), the cut in the middle of the acceleration.
// The Sun component keeps its own hop key (the anticipation squash, the stretch and the landing squash); each scene adds
// the offset between this path and that hop's position (`sunGlideOffset`).

import {sunPoseAt} from '../../lib/Sun';
import type {SunHop} from '../../lib/Sun';
import type {Pt} from '../../lib/sketch';

/** Absolute film seconds and screen px. `from` = S03's slot (690, 700) + its SUN_SLOT_OFF (22, -10); `cut` = the
 *  storyboard's mid-air match point on cut(it); `touch` = S04's clear-sky touch-down (SUN_LAND.touch). `v0` = the
 *  launch velocity (px/s), `v1` = the touch-down velocity (px/s: S04's landing, ~4 px / frame right, 5 down). */
export const GLIDE = {
  t0: 13.945, // end(it): take-off
  tc: 14.17, // cut(it)
  t1: 14.395, // w46 'This': touch-down
  from: [712, 690] as Pt,
  cut: [810, 680] as Pt,
  touch: [990, 668] as Pt,
  v0: [250, -100] as Pt,
  v1: [120, 150] as Pt,
};

/** The quartic through p0 (velocity v0) at 0, pc at tc, p1 (velocity v1) at T. */
function quartic(p0: number, v0: number, pc: number, p1: number, v1: number, tc: number, T: number): number[] {
  // a0 = p0, a1 = v0; solve a2..a4 from: p(tc) = pc, p(T) = p1, p'(T) = v1
  const A = [
    [tc * tc, tc ** 3, tc ** 4],
    [T * T, T ** 3, T ** 4],
    [2 * T, 3 * T * T, 4 * T ** 3],
  ];
  const b = [pc - p0 - v0 * tc, p1 - p0 - v0 * T, v1 - v0];
  // Cramer's rule (3 x 3)
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  const col = (j: number) => A.map((row, i) => row.map((v, k) => (k === j ? b[i] : v)));
  return [p0, v0, det(col(0)) / D, det(col(1)) / D, det(col(2)) / D];
}

const TC = GLIDE.tc - GLIDE.t0;
const TT = GLIDE.t1 - GLIDE.t0;
const CX = quartic(GLIDE.from[0], GLIDE.v0[0], GLIDE.cut[0], GLIDE.touch[0], GLIDE.v1[0], TC, TT);
const CY = quartic(GLIDE.from[1], GLIDE.v0[1], GLIDE.cut[1], GLIDE.touch[1], GLIDE.v1[1], TC, TT);
const poly = (c: number[], x: number) => c[0] + x * (c[1] + x * (c[2] + x * (c[3] + x * c[4])));

/** The sun's centre (screen px) on the glide at ABSOLUTE film time `abs` (clamped to the take-off / touch-down). */
export function sunGlideAt(abs: number): Pt {
  const tau = Math.min(Math.max(abs - GLIDE.t0, 0), TT);
  return [poly(CX, tau), poly(CY, tau)];
}

/** The screen offset to add to a `<Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={hops}>` at scene-local `t`
 *  (absolute `abs`) so its centre runs on the glide: the glide minus the hop's own position. */
export function sunGlideOffset(abs: number, t: number, hops: SunHop[]): Pt {
  const p = sunPoseAt(t, {cx: 690, cy: 700, r: 110, hops});
  const g = sunGlideAt(abs);
  return [g[0] - p.x, g[1] - p.y];
}
