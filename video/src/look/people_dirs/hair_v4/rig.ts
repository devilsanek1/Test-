// HAIR v4: the 2D cut-out rig. The cap is rigid on the head; every hanging piece is SKINNED to its bone chain(s): each
// anchor gets weights by where it lies along the chain (a C1 partition of unity over the bones, the top share glued to
// the head), and the anchor and its two handles move with ONE blended transform (an affine map keeps a smooth node
// smooth: no kinks by construction). This is linear blend skinning as Spine and Live2D do it on mesh vertices, applied
// straight to the Bézier control points (RESEARCH.md §2).
import {type V2, type Shape, type Node, sample, project, plen, dist, lerp, smooth, clamp, selfCrosses, lerpShape} from './bez';
import type {Chain} from './cut';

/** A 2D affine transform: x' = a x + c y + e, y' = b x + d y + f. */
export type Xf = [number, number, number, number, number, number];
export const ID: Xf = [1, 0, 0, 1, 0, 0];
export const ap = (m: Xf, p: V2): V2 => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

/** The transform that carries a rest bone (r0 -> r1) onto its posed bone (p0 -> p1): a rotation about the joint and a
 *  translation (the bone keeps its length; sim.ts keeps the chain inextensible). */
export function boneXf(r0: V2, r1: V2, p0: V2, p1: V2): Xf {
  const th = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) - Math.atan2(r1[1] - r0[1], r1[0] - r0[0]);
  const c = Math.cos(th);
  const s = Math.sin(th);
  return [c, s, -s, c, p0[0] - (c * r0[0] - s * r0[1]), p0[1] - (s * r0[0] + c * r0[1])];
}

/** Weights of one point on one chain: [head, bone 0, bone 1, ...] (sum 1). t = where it projects along the chain
 *  (0 root .. 1 tip, by length). */
export function chainWeights(ch: V2[], t: number, rigid: number): number[] {
  const n = ch.length - 1;
  const w = new Array(n + 1).fill(0);
  // the joints' arc-length parameters and the bones' centres
  const L: number[] = [0];
  for (let i = 1; i <= n; i++) L.push(L[i - 1] + dist(ch[i - 1], ch[i]));
  const tot = L[n] || 1;
  const s = L.map((v) => v / tot);
  const c = Array.from({length: n}, (_, j) => (s[j] + s[j + 1]) / 2);
  // the head's share: everything above `rigid`, fading out over 0.14 of the chain
  const head = 1 - smooth(rigid, rigid + 0.14, t);
  w[0] = head;
  const rest = 1 - head;
  if (rest <= 0) return w;
  let bw: number[] = new Array(n).fill(0);
  if (t <= c[0]) bw[0] = 1;
  else if (t >= c[n - 1]) bw[n - 1] = 1;
  else {
    for (let j = 0; j < n - 1; j++) {
      if (t >= c[j] && t <= c[j + 1]) {
        const k = smooth(c[j], c[j + 1], t);
        bw[j] = 1 - k;
        bw[j + 1] = k;
        break;
      }
    }
  }
  bw = bw.map((v) => v * rest);
  for (let j = 0; j < n; j++) w[j + 1] = bw[j];
  return w;
}

/** A piece's binding: per node, per chain, the weights (computed once on the rest shape, in head units). */
export type Binding = {per: {chain: number; w: number[]; share: number}[][]};

/** Bind a shape's anchors to chains (head units). Several chains side by side: each anchor blends its two nearest. */
export function bind(shape: Shape, chains: Chain[]): Binding {
  const pls = chains.map((c) => c.pts);
  const per = shape.map((nd) => {
    const pr = pls.map((pl, k) => ({k, ...project(pl, nd.p)}));
    pr.sort((a, b) => a.d - b.d);
    const near = pr.slice(0, Math.min(2, pr.length));
    // inverse-square blend between the two nearest chains, so a wide fall bends as one cloth
    const inv = near.map((q) => 1 / Math.pow(q.d + 0.04, 2));
    const sum = inv.reduce((a, b) => a + b, 0);
    return near.map((q, i) => ({chain: q.k, w: chainWeights(pls[q.k], q.t, chains[q.k].rigid ?? 0.18), share: inv[i] / sum}));
  });
  return {per};
}

/** The blended transform of node k from the chains' bone transforms (xfs[chain][bone]; the head is the identity). */
function blended(b: Binding, k: number, xfs: Xf[][]): Xf {
  const m: Xf = [0, 0, 0, 0, 0, 0];
  for (const e of b.per[k]) {
    const X = xfs[e.chain];
    for (let j = 0; j < e.w.length; j++) {
      const w = e.w[j] * e.share;
      if (!w) continue;
      const x = j === 0 ? ID : X[j - 1];
      for (let q = 0; q < 6; q++) m[q] += w * x[q];
    }
  }
  return m;
}

/** Skin a shape (in figure-local coordinates, already through the head frame) with the chains' bone transforms. */
export function skin(shape: Shape, b: Binding, xfs: Xf[][]): Shape {
  return shape.map((nd: Node, k) => {
    const m = blended(b, k, xfs);
    return {p: ap(m, nd.p), i: ap(m, nd.i), o: ap(m, nd.o)};
  });
}

/** The bone transforms of a chain from its rest joints and its posed joints (figure-local). */
export function chainXfs(rest: V2[], pose: V2[]): Xf[] {
  const out: Xf[] = [];
  for (let j = 0; j < rest.length - 1; j++) out.push(boneXf(rest[j], rest[j + 1], pose[j], pose[j + 1]));
  return out;
}

/** The guard: if a skinned shape folds over itself, ease it back toward the rest shape until it does not. */
export function unfold(rest: Shape, posed: Shape): Shape {
  if (!selfCrosses(sample(posed, 10))) return posed;
  for (const t of [0.8, 0.6, 0.4, 0.2, 0]) {
    const s = lerpShape(rest, posed, t);
    if (!selfCrosses(sample(s, 10))) return s;
  }
  return rest;
}

/** A chain's length (head units) and a point along it. */
export const chainLen = (c: Chain) => plen(c.pts);
export const chainAt = (c: Chain, t: number): V2 => {
  const L = plen(c.pts) * clamp(t, 0, 1);
  let acc = 0;
  for (let i = 1; i < c.pts.length; i++) {
    const s = dist(c.pts[i - 1], c.pts[i]);
    if (acc + s >= L) return lerp(c.pts[i - 1], c.pts[i], s ? (L - acc) / s : 0);
    acc += s;
  }
  return c.pts[c.pts.length - 1];
};
