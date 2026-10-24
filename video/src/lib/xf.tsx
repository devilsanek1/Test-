// xf.tsx — 2D affine transforms that also track the accumulated matrix in React context.
// All engine wrappers (Place, Pop, Move, Walk, Wobble, Shake, Tween, Camera) render <XG>, so a <Fill> deep
// inside knows its transform and can clip itself to the PANEL rectangle in card coordinates.
//
//   <XG m={mat.compose(mat.translate(100, 0), mat.about(mat.scale(0.5), 40, 40))}> ... </XG>

import React, {createContext, useContext} from 'react';

/** SVG matrix(a b c d e f). */
export type Mat = [number, number, number, number, number, number];

const D2R = Math.PI / 180;

export const mat = {
  I: [1, 0, 0, 1, 0, 0] as Mat,
  /** m * n (apply n first, then m). */
  mul: (m: Mat, n: Mat): Mat => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ],
  /** compose(a, b, c) = a * b * c, i.e. like the SVG transform list "a b c". */
  compose: (...ms: Mat[]): Mat => ms.reduce((acc, m) => mat.mul(acc, m), mat.I),
  translate: (x: number, y: number): Mat => [1, 0, 0, 1, x, y],
  scale: (sx: number, sy: number = sx): Mat => [sx, 0, 0, sy, 0, 0],
  rotate: (deg: number): Mat => {
    const c = Math.cos(deg * D2R);
    const s = Math.sin(deg * D2R);
    return [c, s, -s, c, 0, 0];
  },
  skewX: (deg: number): Mat => [1, 0, Math.tan(deg * D2R), 1, 0, 0],
  skewY: (deg: number): Mat => [1, Math.tan(deg * D2R), 0, 1, 0, 0],
  /** Apply m about the point (ox, oy). */
  about: (m: Mat, ox: number, oy: number): Mat => mat.compose(mat.translate(ox, oy), m, mat.translate(-ox, -oy)),
  inv: (m: Mat): Mat => {
    const det = m[0] * m[3] - m[1] * m[2] || 1e-9;
    const a = m[3] / det;
    const b = -m[1] / det;
    const c = -m[2] / det;
    const d = m[0] / det;
    return [a, b, c, d, -(a * m[4] + c * m[5]), -(b * m[4] + d * m[5])];
  },
  isIdentity: (m: Mat, eps = 1e-4) => Math.abs(m[0] - 1) < eps && Math.abs(m[1]) < eps && Math.abs(m[2]) < eps && Math.abs(m[3] - 1) < eps && Math.abs(m[4]) < 0.05 && Math.abs(m[5]) < 0.05,
  str: (m: Mat) => `matrix(${m.map((v) => +v.toFixed(5)).join(' ')})`,
};

const XfCtx = createContext<Mat>(mat.I);
/** Accumulated transform (card coords <- local coords) of the current subtree. */
export const useXf = () => useContext(XfCtx);

// ---------------------------------------------------------------- projective (perspective) context
// A <Plane> (lib/persp.tsx) maps its children's local rectangle onto any quadrilateral with a 3x3 homography.
// Ink and Fill read this context and rewrite their path data through it; XG transforms inside a plane are folded
// into the homography instead of emitting <g transform> (so Place/Pop/Move keep working on a receding facade).

/** Row-major 3x3 homography [a b c d e f g h i]: x' = (ax+by+c)/(gx+hy+i), y' = (dx+ey+f)/(gx+hy+i). */
export type Homography = [number, number, number, number, number, number, number, number, number];
export type ProjV = {H: Homography; key: string};
const ProjCtx = createContext<ProjV | null>(null);
/** The active projection (null outside any <Plane>). */
export const useProj = () => useContext(ProjCtx);
export const ProjProvider = ProjCtx.Provider;

/** H * affine(m): apply m first, then H. */
export function composeHA(H: Homography, m: Mat): Homography {
  const [a, b, c, d, e, f] = m; // x' = a x + c y + e ; y' = b x + d y + f
  const A: Homography = [a, c, e, b, d, f, 0, 0, 1];
  const r: number[] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(H[i * 3] * A[j] + H[i * 3 + 1] * A[3 + j] + H[i * 3 + 2] * A[6 + j]);
  return r as Homography;
}
export const homKey = (H: Homography) => H.map((v) => +v.toPrecision(6)).join(',');

/** <g transform> that also records the accumulated matrix for descendants. Skips the <g> for identity.
 *  Inside a <Plane> it folds the matrix into the projection instead. */
export const XG: React.FC<{m: Mat; opacity?: number; children?: React.ReactNode}> = ({m, opacity, children}) => {
  const parent = useContext(XfCtx);
  const proj = useContext(ProjCtx);
  const ident = mat.isIdentity(m, 1e-6) && Math.abs(m[4]) < 1e-6 && Math.abs(m[5]) < 1e-6;
  const op = opacity !== undefined && opacity < 1 ? opacity : undefined;
  if (proj && !ident) {
    const H = composeHA(proj.H, m);
    const inner = <ProjCtx.Provider value={{H, key: homKey(H)}}>{children}</ProjCtx.Provider>;
    return op !== undefined ? <g opacity={op}>{inner}</g> : inner;
  }
  if (ident && op === undefined) return <>{children}</>;
  return (
    <g transform={ident ? undefined : mat.str(m)} opacity={op}>
      <XfCtx.Provider value={ident ? parent : mat.mul(parent, m)}>{children}</XfCtx.Provider>
    </g>
  );
};
