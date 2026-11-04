// PEOPLE v4 (docs/look/people_design/faces_v2/V4.md): the PEN. Faces and bodies are drawn the way an illustrator draws
// with a pen tool: a few deliberate NODES, each a point, a tangent direction and two handle lengths, joined by cubic
// Beziers. A smooth node keeps both handles on one line (the join is tangent-continuous by construction); a corner node
// (rare: the stomion's notch, a crisp brow shelf) gives the out-handle its own angle. Curvature varies because the
// handles do: a long handle is a flat run, a short one a tight turn. Nothing here is a rounded polygon or a generated
// ribbon: the shapes are authored data (faces.ts, body.ts) and this file only turns them into paths.
import type {V2} from '../graphic/geo';

/** A pen node. a = the tangent's direction in degrees (screen space, y down: 0 right, 90 down, 180 left, 270 up), the
 *  direction of travel along the path. i / o = the in / out handle lengths (in the drawing's units); omitted = a third
 *  of the chord to the neighbour. ao = the out-handle's own direction (a corner node). */
export type PNode = {p: V2; a: number; i?: number; o?: number; ao?: number};
/** One cubic segment: start, control 1, control 2, end. */
export type Seg = [V2, V2, V2, V2];

const D = Math.PI / 180;
export const dir = (a: number): V2 => [Math.cos(a * D), Math.sin(a * D)];
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Shorthand for a node: n(x, y, angle, in, out, outAngle). */
export const n = (x: number, y: number, a: number, i?: number, o?: number, ao?: number): PNode => ({p: [x, y], a, i, o, ao});

/** The cubic segments through a run of nodes (closed joins the last node back to the first). */
export function segs(nodes: PNode[], closed = false): Seg[] {
  const out: Seg[] = [];
  const m = nodes.length;
  const last = closed ? m : m - 1;
  for (let k = 0; k < last; k++) {
    const A = nodes[k];
    const B = nodes[(k + 1) % m];
    const ch = dist(A.p, B.p);
    const o = A.o ?? ch / 3;
    const i = B.i ?? ch / 3;
    out.push([A.p, add(A.p, mul(dir(A.ao ?? A.a), o)), sub(B.p, mul(dir(B.a), i)), B.p]);
  }
  return out;
}

/** A straight piece as a segment. */
export const line = (a: V2, b: V2): Seg => [a, add(a, mul(sub(b, a), 1 / 3)), add(a, mul(sub(b, a), 2 / 3)), b];

const f = (v: number) => (Math.round(v * 100) / 100).toString();
const P = (p: V2) => `${f(p[0])} ${f(p[1])}`;
/** Segments -> an SVG path (each point mapped by `map`, e.g. head units -> the figure's screen). */
export function toD(ss: Seg[], map: (p: V2) => V2 = (p) => p, close = true): string {
  if (!ss.length) return '';
  let d = `M${P(map(ss[0][0]))}`;
  for (const s of ss) d += `C${P(map(s[1]))} ${P(map(s[2]))} ${P(map(s[3]))}`;
  return close ? d + 'Z' : d;
}

/** A point of a cubic at t. */
export function bez(s: Seg, t: number): V2 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return [a * s[0][0] + b * s[1][0] + c * s[2][0] + e * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + e * s[3][1]];
}
/** The tangent (unnormalised) of a cubic at t. */
export function bezT(s: Seg, t: number): V2 {
  const u = 1 - t;
  return [
    3 * u * u * (s[1][0] - s[0][0]) + 6 * u * t * (s[2][0] - s[1][0]) + 3 * t * t * (s[3][0] - s[2][0]),
    3 * u * u * (s[1][1] - s[0][1]) + 6 * u * t * (s[2][1] - s[1][1]) + 3 * t * t * (s[3][1] - s[2][1]),
  ];
}
/** Points along segments (k per segment). */
export function sample(ss: Seg[], k = 12): V2[] {
  const pts: V2[] = [];
  ss.forEach((s, j) => {
    for (let q = j === 0 ? 0 : 1; q <= k; q++) pts.push(bez(s, q / k));
  });
  return pts;
}

/** Map every control point of the segments (an affine or similarity map keeps a cubic exact). */
export const mapSegs = (ss: Seg[], m: (p: V2) => V2): Seg[] => ss.map((s) => s.map(m) as Seg);
export const reverseSegs = (ss: Seg[]): Seg[] => ss.slice().reverse().map((s) => [s[3], s[2], s[1], s[0]] as Seg);

/** Split a cubic at t (de Casteljau). */
export function split(s: Seg, t: number): [Seg, Seg] {
  const l = (a: V2, b: V2): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const p01 = l(s[0], s[1]);
  const p12 = l(s[1], s[2]);
  const p23 = l(s[2], s[3]);
  const p012 = l(p01, p12);
  const p123 = l(p12, p23);
  const m = l(p012, p123);
  return [
    [s[0], p01, p012, m],
    [m, p123, p23, s[3]],
  ];
}

// ---------------------------------------------------------------- smooth curves through points (for derived shapes)
/** A smooth path through points (centripetal Catmull-Rom as cubics): for shapes derived from other curves (a tapered
 *  stroke's two edges, an offset), never for the authored contours. */
export function through(pts: V2[], closed: boolean, tension = 1): Seg[] {
  const m = pts.length;
  if (m < 2) return [];
  const g = (i: number): V2 => (closed ? pts[((i % m) + m) % m] : pts[Math.max(0, Math.min(m - 1, i))]);
  const out: Seg[] = [];
  const last = closed ? m : m - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    const d1 = Math.max(1e-6, Math.sqrt(dist(p0, p1)));
    const d2 = Math.max(1e-6, Math.sqrt(dist(p1, p2)));
    const d3 = Math.max(1e-6, Math.sqrt(dist(p2, p3)));
    // the tangents at p1 and p2 (centripetal parameterisation), as Bezier handles
    const t1: V2 = [
      (p2[0] - p1[0]) / d2 - (p2[0] - p0[0]) / (d1 + d2) + (p1[0] - p0[0]) / d1,
      (p2[1] - p1[1]) / d2 - (p2[1] - p0[1]) / (d1 + d2) + (p1[1] - p0[1]) / d1,
    ];
    const t2: V2 = [
      (p3[0] - p2[0]) / d3 - (p3[0] - p1[0]) / (d2 + d3) + (p2[0] - p1[0]) / d2,
      (p3[1] - p2[1]) / d3 - (p3[1] - p1[1]) / (d2 + d3) + (p2[1] - p1[1]) / d2,
    ];
    const k = (d2 * tension) / 3;
    out.push([p1, add(p1, mul(t1, k)), sub(p2, mul(t2, k)), p2]);
  }
  return out;
}

/** A tapered stroke along a centre curve: w(t) = the full width at t (0..1 along the curve). The two edges are offset
 *  from the sampled centre and joined into one closed smooth shape (a lash, a brow, a strand). */
export function taper(centre: Seg[], w: (t: number) => number, k = 10): Seg[] {
  const pts: V2[] = [];
  const tans: V2[] = [];
  centre.forEach((s, j) => {
    for (let q = j === 0 ? 0 : 1; q <= k; q++) {
      pts.push(bez(s, q / k));
      tans.push(bezT(s, q / k));
    }
  });
  const N = pts.length;
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const tv = tans[i];
    const l = Math.hypot(tv[0], tv[1]) || 1;
    const nr: V2 = [-tv[1] / l, tv[0] / l];
    const hw = w(t) / 2;
    L.push(add(pts[i], mul(nr, hw)));
    R.push(add(pts[i], mul(nr, -hw)));
  }
  // drop the duplicate tip points where the width is 0, then one loop: left edge out, right edge back
  const loopPts = [...L, ...R.slice().reverse().slice(1, -1)];
  return through(loopPts, true, 1);
}

// ---------------------------------------------------------------- the old rounded polygon, as segments
/** graphic/geo.ts rpath as segments (the same cut-back corners and K handles), so a piece of an old outline (the
 *  cranium that the hair round fits) can be kept EXACTLY and joined to new pen curves. */
export function rpolySegs(pts: [number, number, number?][], closed = true): Seg[] {
  const K = 0.5523;
  const m = pts.length;
  const p = (i: number): V2 => [pts[i][0], pts[i][1]];
  type C = {a: V2; b: V2; v: V2; r: number};
  const corner = (i: number): C => {
    const v = p(i);
    const r = pts[i][2] ?? 0;
    const prev = p((i - 1 + m) % m);
    const next = p((i + 1) % m);
    if (r <= 0 || (!closed && (i === 0 || i === m - 1))) return {a: v, b: v, v, r: 0};
    const d1 = dist(prev, v);
    const d2 = dist(v, next);
    const t1 = Math.min(r, d1 * 0.5);
    const t2 = Math.min(r, d2 * 0.5);
    const nv = (q: V2): V2 => {
      const l = Math.hypot(q[0], q[1]) || 1;
      return [q[0] / l, q[1] / l];
    };
    return {a: add(v, mul(nv(sub(prev, v)), t1)), b: add(v, mul(nv(sub(next, v)), t2)), v, r};
  };
  const cs = pts.map((_, i) => corner(i));
  const out: Seg[] = [];
  const last = closed ? m : m - 1;
  for (let i = 0; i < last; i++) {
    const c = cs[i];
    const nx = cs[(i + 1) % m];
    const from = c.r ? c.b : c.v;
    const to = nx.r ? nx.a : nx.v;
    if (dist(from, to) > 1e-9) out.push(line(from, to));
    if (nx.r) out.push([nx.a, add(nx.a, mul(sub(nx.v, nx.a), K)), add(nx.b, mul(sub(nx.v, nx.b), K)), nx.b]);
  }
  return out;
}

/** The angle (degrees) of a segment's tangent at its start or end. */
export const angleAt = (s: Seg, end: 0 | 1): number => {
  const t = end ? sub(s[3], s[2]) : sub(s[1], s[0]);
  return (Math.atan2(t[1], t[0]) * 180) / Math.PI;
};
