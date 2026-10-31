// FLOW v5, GUST: the geometry. Figures are drawn the way the references are painted: long straight runs of cloth
// ending in sharp points, curves only for the hair, the head and the shoulder's roll. Three path builders:
//   outline  a closed shape from authored nodes: a node is a sharp point, a softly rounded corner or a smooth turn;
//            an edge may bow a little (cloth in the wind is never ruler-straight, never a drape either)
//   ribbon   a tapered ribbon along a centre line: crisp at the root, a needle tip (hair, belt tails, sashes)
//   limb     a tapered stroke with round ends (a leg, the one acting arm)
// Units: figure units (H = 1000 from the hair top to the sole), x to the screen right, y down.
export type V2 = [number, number];

export const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
export const lerp = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const len = (a: V2) => Math.hypot(a[0], a[1]);
export const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const norm = (a: V2): V2 => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};
export const D2R = Math.PI / 180;
export const dirOf = (deg: number): V2 => [Math.cos(deg * D2R), Math.sin(deg * D2R)];
export const angOf = (v: V2) => Math.atan2(v[1], v[0]) / D2R;
export const rot = (v: V2, deg: number): V2 => {
  const c = Math.cos(deg * D2R);
  const s = Math.sin(deg * D2R);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
};
export const rotAbout = (p: V2, o: V2, deg: number): V2 => add(o, rot(sub(p, o), deg));
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const f = (v: number) => (Math.round(v * 100) / 100).toString();
const P = (p: V2) => `${f(p[0])} ${f(p[1])}`;

// ---------------------------------------------------------------- outlines
/** k: 'sharp' a point (a hem tip, a flag's tip), 'round' a softly cut corner (r figure units), 'smooth' a smooth turn
 *  (the shoulder's roll). bow: the edge FROM this node to the next bulges outward by this fraction of its length
 *  (negative: inward). Author shapes clockwise on screen (the top, down the right side, along the hem, up the left). */
export type Node = {p: V2; k?: 'sharp' | 'round' | 'smooth'; r?: number; bow?: number; t?: number};
export const N = (x: number, y: number, k: Node['k'] = 'round', r = 6, bow = 0): Node => ({p: [x, y], k, r, bow});

/** A closed path through the nodes. */
export function outline(nodes: Node[]): string {
  const n = nodes.length;
  if (n < 3) return '';
  const at = (i: number) => nodes[((i % n) + n) % n];
  type J = {inP: V2; outP: V2; corner?: [V2, V2, V2]; tan?: V2};
  const J: J[] = nodes.map((nd, i) => {
    const p = nd.p;
    const a = at(i - 1).p;
    const b = at(i + 1).p;
    const k = nd.k ?? 'round';
    if (k === 'smooth') {
      const tn = norm(sub(b, a));
      return {inP: p, outP: p, tan: tn};
    }
    if (k === 'round') {
      const r = Math.min(nd.r ?? 6, dist(a, p) * 0.45, dist(b, p) * 0.45);
      const inP = add(p, mul(norm(sub(a, p)), r));
      const outP = add(p, mul(norm(sub(b, p)), r));
      return {inP, outP, corner: [add(inP, mul(sub(p, inP), 2 / 3)), add(outP, mul(sub(p, outP), 2 / 3)), outP]};
    }
    return {inP: p, outP: p};
  });
  let d = `M${P(J[0].outP)}`;
  for (let i = 0; i < n; i++) {
    const A = J[i];
    const B = J[(i + 1) % n];
    const s = A.outP;
    const e = B.inP;
    const L = dist(s, e);
    const bow = nodes[i].bow ?? 0;
    // outward for a clockwise (on screen) path = the left of travel
    const dv = norm(sub(e, s));
    const out: V2 = [dv[1], -dv[0]];
    const off = mul(out, (bow * L) / 0.75);
    const c1 = A.tan ? add(s, mul(A.tan, L / 3)) : add(add(s, mul(sub(e, s), 1 / 3)), off);
    const c2 = B.tan ? sub(e, mul(B.tan, L / 3)) : add(add(s, mul(sub(e, s), 2 / 3)), off);
    d += `C${P(c1)} ${P(c2)} ${P(e)}`;
    if (B.corner) d += `C${P(B.corner[0])} ${P(B.corner[1])} ${P(B.corner[2])}`;
  }
  return d + 'Z';
}

// ---------------------------------------------------------------- smooth curves
/** Points on a centripetal Catmull-Rom spline through pts, `k` per span (an open curve). */
export function spline(pts: V2[], k = 6): V2[] {
  const m = pts.length;
  if (m < 3) return pts.slice();
  const g = (i: number) => pts[clamp(i, 0, m - 1)];
  const out: V2[] = [pts[0]];
  for (let i = 0; i < m - 1; i++) {
    const p0 = i === 0 ? sub(mul(pts[0], 2), pts[1]) : g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = i + 2 >= m ? sub(mul(pts[m - 1], 2), pts[m - 2]) : g(i + 2);
    const t0 = 0;
    const t1 = t0 + Math.sqrt(Math.max(1e-6, dist(p0, p1)));
    const t2 = t1 + Math.sqrt(Math.max(1e-6, dist(p1, p2)));
    const t3 = t2 + Math.sqrt(Math.max(1e-6, dist(p2, p3)));
    for (let q = 1; q <= k; q++) {
      const t = t1 + ((t2 - t1) * q) / k;
      const A1 = add(mul(p0, (t1 - t) / (t1 - t0)), mul(p1, (t - t0) / (t1 - t0)));
      const A2 = add(mul(p1, (t2 - t) / (t2 - t1)), mul(p2, (t - t1) / (t2 - t1)));
      const A3 = add(mul(p2, (t3 - t) / (t3 - t2)), mul(p3, (t - t2) / (t3 - t2)));
      const B1 = add(mul(A1, (t2 - t) / (t2 - t0)), mul(A2, (t - t0) / (t2 - t0)));
      const B2 = add(mul(A2, (t3 - t) / (t3 - t1)), mul(A3, (t - t1) / (t3 - t1)));
      out.push(add(mul(B1, (t2 - t) / (t2 - t1)), mul(B2, (t - t1) / (t2 - t1))));
    }
  }
  return out;
}

/** A smooth open path (cubics) through points; `first` = start with M. */
function smoothThrough(pts: V2[], first: boolean): string {
  const m = pts.length;
  let d = first ? `M${P(pts[0])}` : `L${P(pts[0])}`;
  if (m === 2) return d + `L${P(pts[1])}`;
  for (let i = 0; i < m - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(m - 1, i + 2)];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}

/** Arc-length fractions of a polyline's points. */
export function fracs(c: V2[]): number[] {
  const acc = [0];
  for (let i = 1; i < c.length; i++) acc.push(acc[i - 1] + dist(c[i - 1], c[i]));
  const L = acc[acc.length - 1] || 1;
  return acc.map((a) => a / L);
}
export const polyLen = (c: V2[]) => c.reduce((s, p, i) => (i ? s + dist(c[i - 1], p) : 0), 0);

/** The two edges of a band of width w(u) round a centre line (u = arc-length fraction). */
export function edges(c: V2[], w: (u: number) => number): {L: V2[]; R: V2[]} {
  const u = fracs(c);
  const n = c.length;
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(n - 1, i + 1)];
    const tv = norm(sub(b, a));
    const nv: V2 = [tv[1], -tv[0]];
    const hw = w(u[i]) / 2;
    L.push(add(c[i], mul(nv, hw)));
    R.push(add(c[i], mul(nv, -hw)));
  }
  return {L, R};
}

/** A ribbon: crisp and blunt at the root (hidden in the cap), tapering to a needle tip. `c` should be smooth (spline
 *  it first). w(u) = the full width at u (0 root .. 1 tip; w(1) may be > 0 for a cut end). */
export function ribbon(c: V2[], w: (u: number) => number): string {
  const {L, R} = edges(c, w);
  const n = c.length;
  const tipW = w(1);
  if (tipW < 0.01) {
    // a needle: both edges meet at the tip with a corner
    const left = L.slice(0, n - 1).concat([c[n - 1]]);
    const right = R.slice(0, n - 1).reverse();
    return smoothThrough(left, true) + smoothThrough([c[n - 1], ...right], false).replace(/^L[^C]*/, '') + 'Z';
  }
  return smoothThrough(L, true) + smoothThrough(R.slice().reverse(), false) + 'Z';
}

/** A tapered limb with round ends along a centre line (w(u) full width). */
export function limb(c: V2[], w: (u: number) => number): string {
  const cs = spline(c, 6);
  const {L, R} = edges(cs, w);
  const n = cs.length;
  const w0 = w(0) / 2;
  const w1 = w(1) / 2;
  const t0 = norm(sub(cs[1], cs[0]));
  const t1 = norm(sub(cs[n - 1], cs[n - 2]));
  const K = 0.5523;
  // a round cap: two quarter arcs from a, round the tip, to b; tv = the direction of travel leaving a
  const cap = (a: V2, b: V2, r: number, tv: V2) => {
    const across = norm(sub(b, a));
    const tip = add(mul(add(a, b), 0.5), mul(tv, r));
    return (
      `C${P(add(a, mul(tv, K * r)))} ${P(sub(tip, mul(across, K * r)))} ${P(tip)}` +
      `C${P(add(tip, mul(across, K * r)))} ${P(add(b, mul(tv, K * r)))} ${P(b)}`
    );
  };
  let d = smoothThrough(L, true);
  d += cap(L[n - 1], R[n - 1], w1, t1);
  d += smoothThrough(R.slice().reverse(), false).replace(/^L[^C]*/, '');
  d += cap(R[0], L[0], w0, mul(t0, -1));
  return d + 'Z';
}

/** An ellipse as a path. */
export const ellipse = (c: V2, rx: number, ry: number) =>
  `M${f(c[0] - rx)} ${f(c[1])}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;

/** A polygon as a path (straight). */
export const poly = (pts: V2[]) => `M${pts.map(P).join('L')}Z`;

/** Map every node of a shape. */
export const mapNodes = (ns: Node[], m: (p: V2) => V2): Node[] => ns.map((q) => ({...q, p: m(q.p)}));
