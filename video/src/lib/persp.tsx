// persp.tsx — one-point perspective for the full-bleed world: draw a facade (or a ground grid, a poster, a whole
// kit Building) FLAT in its own rectangle and map it onto a receding quadrilateral. Lines stay hand-drawn (the
// sketch paths are projected point by point), stroke widths stay in screen px, fills keep their misregistration.
//
//   const q = wallQuad({vp: [540, 880], x: 120, top: 380, bottom: 1240, depth: 0.55});   // left wall receding to the VP
//   <Plane quad={q} w={1400} h={860}>                       // children in plane-local px (0..1400 x 0..860)
//     <Building x={0} y={860} w={420} floors={4} floorH={200} at={0.4} seed="L1" />
//     <Window x={600} y={300} w={120} h={180} at={1} />
//   </Plane>
//   const g = groundQuad({vp: [540, 880], y: 1920, x0: -300, x1: 1380, depth: 0.9});    // a floor plane
//   rayPoint([540, 880], [100, 1500], 0.6)   // a point 60% of the way from (100,1500) to the VP
//
// Only <Ink>/<Fill> (and kit components built from them) are projected. Raw SVG elements (<circle>, <text>) inside a
// Plane are NOT: keep those outside, or draw them with Fill/Ink. Nested Place/Pop/Move inside a Plane work.

import React from 'react';
import {parsePath, reduceInstructions} from '@remotion/paths';
import {composeHA, homKey, Homography, ProjProvider, useProj} from './xf';
import type {Pt} from './sketch';

export type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

// ---------------------------------------------------------------- homography math

/** Homography mapping the 4 `src` points onto the 4 `dst` points. */
export function homography(src: Quad, dst: Quad): Homography {
  // 8x8 linear system A h = b with h33 = 1
  const A: number[][] = [];
  const bv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    bv.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    bv.push(v);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [bv[c], bv[p]] = [bv[p], bv[c]];
    const d = A[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / d;
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      bv[r] -= f * bv[c];
    }
  }
  const h = bv.map((v, i) => v / (A[i][i] || 1e-12));
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/** Map local (w x h) rectangle onto `quad`. */
export const rectToQuad = (w: number, h: number, quad: Quad): Homography =>
  homography(
    [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ],
    quad,
  );

export function applyH(H: Homography, x: number, y: number): Pt {
  const w = H[6] * x + H[7] * y + H[8] || 1e-9;
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const projCache = new Map<string, string>();

/** Rewrite path data through a homography (lines exact, curves via their control points). Cached. */
export function projectPath(d: string, H: Homography, key = homKey(H)): string {
  const ck = key + '|' + d;
  let out = projCache.get(ck);
  if (out !== undefined) return out;
  let ins;
  try {
    ins = reduceInstructions(parsePath(d));
  } catch {
    return d;
  }
  const P = (x: number, y: number) => {
    const [u, v] = applyH(H, x, y);
    return `${r1(u)} ${r1(v)}`;
  };
  let s = '';
  for (const i of ins) {
    if (i.type === 'M') s += `M${P(i.x, i.y)}`;
    else if (i.type === 'L') s += `L${P(i.x, i.y)}`;
    else if (i.type === 'C') s += `C${P(i.cp1x, i.cp1y)} ${P(i.cp2x, i.cp2y)} ${P(i.x, i.y)}`;
    else if (i.type === 'Z') s += 'Z';
  }
  if (projCache.size > 60000) projCache.clear();
  projCache.set(ck, s);
  return s;
}

/** Hook for primitives: project `d` if inside a <Plane>, else return it unchanged. */
export function useProjected(d: string): string {
  const proj = useProj();
  return proj && d ? projectPath(d, proj.H, proj.key) : d;
}

/** Project a point through the active plane (or return it). */
export function useProjectPoint(): (x: number, y: number) => Pt {
  const proj = useProj();
  return proj ? (x, y) => applyH(proj.H, x, y) : (x, y) => [x, y];
}

// ---------------------------------------------------------------- Plane

/** Children are drawn in plane-local px (0..w x 0..h) and mapped onto `quad` (TL, TR, BR, BL in parent coords). */
export const Plane: React.FC<{quad: Quad; w: number; h: number; children?: React.ReactNode}> = ({quad, w, h, children}) => {
  const parent = useProj();
  let H = rectToQuad(w, h, quad);
  if (parent) H = composeH(parent.H, H);
  return <ProjProvider value={{H, key: homKey(H)}}>{children}</ProjProvider>;
};

function composeH(A: Homography, B: Homography): Homography {
  const r: number[] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]);
  return r as Homography;
}
export {composeHA};

// ---------------------------------------------------------------- one-point perspective helpers

/** Point `k` of the way from `p` toward the vanishing point (k = 0 at p, 1 at the VP). */
export const rayPoint = (vp: Pt, p: Pt, k: number): Pt => [p[0] + (vp[0] - p[0]) * k, p[1] + (vp[1] - p[1]) * k];

/** A vertical wall parallel to the view direction (a street facade): its near edge is the vertical screen segment
 *  x, [top, bottom]; its far edge is `depth` (0..1) of the way to the VP. Returns TL, TR, BR, BL with the plane's
 *  local x running from near (0) to far (w) for a LEFT wall (x < vp.x); for a right wall local x runs far -> near,
 *  so the facade still reads left-to-right. */
export function wallQuad(o: {vp: Pt; x: number; top: number; bottom: number; depth: number}): Quad {
  const nT: Pt = [o.x, o.top];
  const nB: Pt = [o.x, o.bottom];
  const fT = rayPoint(o.vp, nT, o.depth);
  const fB = rayPoint(o.vp, nB, o.depth);
  return o.x < o.vp[0] ? [nT, fT, fB, nB] : [fT, nT, nB, fB];
}

/** A horizontal ground (or ceiling) plane: near edge = screen segment [x0, x1] at height y; far edge `depth` of the
 *  way to the VP. Local x runs left -> right, local y runs FAR (0) -> NEAR (h). */
export function groundQuad(o: {vp: Pt; y: number; x0: number; x1: number; depth: number}): Quad {
  const nL: Pt = [o.x0, o.y];
  const nR: Pt = [o.x1, o.y];
  return [rayPoint(o.vp, nL, o.depth), rayPoint(o.vp, nR, o.depth), nR, nL];
}

/** A frontal plane (facing the camera) at relative depth: the rectangle [x, y, w, h] defined at depth 0 shrunk toward
 *  the VP by `depth` (0..1). Use for buildings at the end of the street, the far skyline, a gate. */
export function frontQuad(o: {vp: Pt; x: number; y: number; w: number; h: number; depth: number}): Quad {
  const c = (p: Pt) => rayPoint(o.vp, p, o.depth);
  return [c([o.x, o.y]), c([o.x + o.w, o.y]), c([o.x + o.w, o.y + o.h]), c([o.x, o.y + o.h])];
}

/** Screen scale of something at relative depth `depth` (0 = at the near plane, 1 = at the VP). */
export const depthScale = (depth: number) => Math.max(0, 1 - depth);
