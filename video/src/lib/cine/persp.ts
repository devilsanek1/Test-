// cine/persp.ts — perspective helpers for deep, converging compositions.
//
//   const m = quadMap([[100, 200], [900, 300], [900, 1500], [100, 1700]]);  // TL, TR, BR, BL
//   m(0.5, 0.5)                    // projective (homography) map of the unit square onto the quad:
//                                  // rows and columns foreshorten like a real plane in perspective
//   const P = persp1({vx: 540, vy: 900, f: 1000, camH: 170});
//   P(x, y, z)                     // 3D (x right, y UP, z into the scene) -> [sx, sy, scale]
//   affineFromTri(rect, p0, p1, p3)  // matrix that places a rect drawing onto 3 screen corners
//
// Map geometry FIRST, then draw it with the sketch helpers (line(), rect() ...) in screen space so the hand-drawn
// overshoot / wobble stays the same size everywhere.

import type {Pt} from '../sketch';
import type {Mat} from '../xf';
import type {Quad} from '../persp';

/** [TL, TR, BR, BL] — the same type as the core lane's persp.tsx Quad (re-exported, not redeclared). */
export type {Quad};
export type UV = (u: number, v: number) => Pt;

/** Projective map of the unit square (u right, v down) onto quad [TL, TR, BR, BL]. */
export function quadMap(q: Quad): UV {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0;
    b = x3 - x0;
    c = x0;
    d = y1 - y0;
    e = y3 - y0;
    f = y0;
    g = 0;
    h = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1;
    b = x3 - x0 + h * x3;
    c = x0;
    d = y1 - y0 + g * y1;
    e = y3 - y0 + h * y3;
    f = y0;
  }
  return (u, v) => {
    const w = g * u + h * v + 1;
    return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
  };
}

/** Sub-quad of a mapped plane: cell [u0,u1] x [v0,v1] -> screen quad [TL, TR, BR, BL]. */
export const cell = (m: UV, u0: number, v0: number, u1: number, v1: number): Quad => [m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)];

/** One-point perspective camera: vanishing point (vx, vy), focal length f (px), camera height camH (world units,
 *  y up; ground y = 0). Returns [screenX, screenY, scale] where scale = f / z (1 at z = f). */
export function persp1(o: {vx: number; vy: number; f?: number; camH?: number}) {
  const F = o.f ?? 1000;
  const H = o.camH ?? 160;
  return (x: number, y: number, z: number): [number, number, number] => {
    const zz = Math.max(1e-3, z);
    const k = F / zz;
    return [o.vx + x * k, o.vy + (H - y) * k, k];
  };
}
export type Persp1 = ReturnType<typeof persp1>;

/** Point along the ray from p toward a vanishing point v at fraction k (0 = p, 1 = v). */
export const toward = (p: Pt, v: Pt, k: number): Pt => [p[0] + (v[0] - p[0]) * k, p[1] + (v[1] - p[1]) * k];

/** Affine matrix mapping rect (x, y, w, h) so that its TL -> p0, TR -> p1, BL -> p3. */
export function affineFromTri(r: [number, number, number, number], p0: Pt, p1: Pt, p3: Pt): Mat {
  const [x, y, w, h] = r;
  const a = (p1[0] - p0[0]) / w;
  const b = (p1[1] - p0[1]) / w;
  const c = (p3[0] - p0[0]) / h;
  const d = (p3[1] - p0[1]) / h;
  return [a, b, c, d, p0[0] - a * x - c * y, p0[1] - b * x - d * y];
}

/** Lerp two points. */
export const lerpPt = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
