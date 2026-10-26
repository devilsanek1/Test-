// kit/Pullback.tsx: the S5 pull-back crane rig (docs/look/CINEMATIC_GUIDE.md S5; v3 S9 is the reference use).
//
// ONE progress p (0 -> 1) on the S5 ease drives every plane, so the whole frame is one camera move. Each plane is a
// depth-graded map authored in END-frame coordinates (= screen at rest, p = 1):
//   PullPlane  a dolly plane: scale k^(1 - p) (geometric: a constant-rate pull-back) about a pivot that travels on a
//              straight line from o + off (p 0) to o (p 1). far k ~1.1 with a 1 W slide, mid ~2, the pinned deck ~5
//              (off 0: the figures are the pivot). Matches the board's SketchReel moves ({s, o}, non-lin).
//   PullBox    near clutter that goes box to box (every point on a straight line, size s0 -> 1 linearly; the board's
//              `lin` moves): the stack that starts where the landmark will land and ends as the left frame.
// <PullLayer m> draws its children through a map with ink compensation (screen width = authored width x
// scale^(1 - inkExp)), so a 5x near plane keeps a front line, not a 5x one. Raw <path strokeWidth> is not compensated.
//
//   const p = s5Ease(t / MOVE);
//   <PullLayer m={planeMat(FAR, p)}> ...far town, hall, mountain... </PullLayer>
//   <PullLayer m={boxMat(STACK, p)}> <BrickStack .../> </PullLayer>
// Speed: the parallax law shift = 1 - D/Z sets the planes' slides; check px per 60 fps frame with planeSpeed().
import React from 'react';
import {mat, XG, type Mat} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {clamp} from '../../../lib/time';
import type {Pt} from './util';

/** The S5 ease (Arcane #55, measured): a creep that is never still, one peak at 2.1x the mean speed, a long decelerate. */
export const S5_EASE: [number, number, number, number] = [0.55, 0.03, 0.5, 1.0];

/** CSS cubic-bezier(x1, y1, x2, y2) as an ease u -> p (bisection on x; exact to 1e-9). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (u: number) => number {
  const bx = (m: number) => 3 * (1 - m) * (1 - m) * m * x1 + 3 * (1 - m) * m * m * x2 + m * m * m;
  const by = (m: number) => 3 * (1 - m) * (1 - m) * m * y1 + 3 * (1 - m) * m * m * y2 + m * m * m;
  return (u: number) => {
    const x = clamp(u, 0, 1);
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (bx(m) < x) lo = m;
      else hi = m;
    }
    return by((lo + hi) / 2);
  };
}

/** The S5 move's progress for u = time / move length (0..1). */
export const s5Ease = cubicBezier(...S5_EASE);

/** A dolly plane: authored in end coords; at p it is scaled k^(1 - p) about its pivot, which moves o + off -> o. */
export type PullPlane = {o: Pt; off?: Pt; k: number};
/** Near clutter box to box: the authored box's top-left `to` (end) starts at `from`, its size s0 x -> 1 x (linear). */
export type PullBox = {from: Pt; to: Pt; s0: number};

export const planeScale = (pl: PullPlane, p: number) => Math.pow(pl.k, 1 - p);

export function planeMat(pl: PullPlane, p: number): Mat {
  const k = planeScale(pl, p);
  const off = pl.off ?? [0, 0];
  return mat.compose(mat.translate(pl.o[0] + (1 - p) * off[0], pl.o[1] + (1 - p) * off[1]), mat.scale(k), mat.translate(-pl.o[0], -pl.o[1]));
}

export function boxMat(bx: PullBox, p: number): Mat {
  const s = bx.s0 + (1 - bx.s0) * p;
  const x = bx.from[0] + (bx.to[0] - bx.from[0]) * p;
  const y = bx.from[1] + (bx.to[1] - bx.from[1]) * p;
  return mat.compose(mat.translate(x, y), mat.scale(s), mat.translate(-bx.to[0], -bx.to[1]));
}

/** A drawing authored at its START size inside a plane (the close figure before the hand-over): start coords -> the
 *  plane at p (the plane's start map undone, then its map at p). */
export function startMat(pl: PullPlane, p: number): Mat {
  return mat.mul(planeMat(pl, p), mat.inv(planeMat(pl, 0)));
}

/** Apply a map to a point. */
export const applyMat = (m: Mat, q: Pt): Pt => [m[0] * q[0] + m[2] * q[1] + m[4], m[1] * q[0] + m[3] * q[1] + m[5]];
/** A map's uniform scale. */
export const matScale = (m: Mat) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

/** Children drawn through a map (screen px), ink compensated: screen width = authored width x scale^(1 - inkExp). */
export const PullLayer: React.FC<{m: Mat; inkExp?: number; children?: React.ReactNode}> = ({m, inkExp = 0.8, children}) => (
  <XG m={m}>
    <InkScale value={Math.pow(matScale(m), -inkExp)}>{children}</InkScale>
  </XG>
);

/** Fastest on-screen motion (px per frame at `fps`) of an end-coords point set under a map path over [t0, t1]. */
export function planeSpeed(pathAt: (t: number) => Mat, pts: Pt[], t0: number, t1: number, fps = 60): {max: number; at: number} {
  let best = {max: 0, at: t0};
  for (let f = Math.round(t0 * fps); f < Math.round(t1 * fps); f++) {
    const a = pathAt(f / fps);
    const b2 = pathAt((f + 1) / fps);
    for (const q of pts) {
      const pa = applyMat(a, q);
      const pb = applyMat(b2, q);
      const v = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
      if (v > best.max) best = {max: v, at: f / fps};
    }
  }
  return best;
}
