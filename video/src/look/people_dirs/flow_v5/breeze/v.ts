// FLOW v5, BREEZE: 2D vectors and the two path builders every shape is drawn with (figure units: y down, the crown at
// 0 and the soles at 1000, x = 0 between the feet). OUTLINE: a closed or open run of nodes, each SMOOTH (the curve
// passes through it with one tangent) or a CORNER (a sharp point: a hem's tip, a notch where hair splits); two corners
// in a row give a straight run, a smooth node between them bows it a little. RIBBON: a tapered band round a centre
// line, crisp at the root, a needle at the tip (a hair ribbon, a belt tail, a leg).
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
/** The normal to the left of travel on screen (y down): for travel to the right, it points up. */
export const nrm = (a: V2): V2 => [a[1], -a[0]];
export const D2R = Math.PI / 180;
/** A unit vector at a screen angle (degrees: 0 right, 90 down, -90 up). */
export const dirA = (deg: number): V2 => [Math.cos(deg * D2R), Math.sin(deg * D2R)];
export const angOf = (v: V2) => Math.atan2(v[1], v[0]) / D2R;
/** Rotate p about c by deg (screen space: + turns clockwise on screen). */
export const rot = (p: V2, c: V2, deg: number): V2 => {
  const r = deg * D2R;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------- outlines
/** An outline node: a point; c = a corner (sharp); k = the handle scale at a smooth node (1 = Catmull-Rom). */
export type Nd = {p: V2; c?: boolean; k?: number};
export const S = (x: number, y: number, k?: number): Nd => ({p: [x, y], k});
export const C = (x: number, y: number): Nd => ({p: [x, y], c: true});
export const Sp = (p: V2, k?: number): Nd => ({p, k});
export const Cp = (p: V2): Nd => ({p, c: true});

const f1 = (v: number) => (Math.round(v * 100) / 100).toString();
const P = (p: V2) => `${f1(p[0])} ${f1(p[1])}`;

/** The cubic segments through the nodes: [start, c1, c2, end] each. */
export function outlineSegs(nodes: Nd[], closed = true): [V2, V2, V2, V2][] {
  const m = nodes.length;
  const g = (i: number) => (closed ? nodes[((i % m) + m) % m] : nodes[clamp(i, 0, m - 1)]);
  const tangent = (i: number): {in: V2; out: V2} => {
    const n0 = g(i - 1).p;
    const n1 = g(i).p;
    const n2 = g(i + 1).p;
    const k = g(i).k ?? 1;
    const dIn = dist(n0, n1);
    const dOut = dist(n1, n2);
    const atEnd = !closed && (i === 0 || i === m - 1);
    if (g(i).c || atEnd) {
      // a corner: each handle aims along its own chord (straight runs between corners)
      return {in: mul(norm(sub(n0, n1)), dIn / 3), out: mul(norm(sub(n2, n1)), dOut / 3)};
    }
    // smooth: one tangent through the node (centripetal-weighted), handles a third of each chord
    const t = norm(add(mul(norm(sub(n1, n0)), Math.sqrt(dOut) + 1e-6), mul(norm(sub(n2, n1)), Math.sqrt(dIn) + 1e-6)));
    return {in: mul(t, (-dIn / 3) * k), out: mul(t, (dOut / 3) * k)};
  };
  const tg = nodes.map((_, i) => tangent(i));
  const out: [V2, V2, V2, V2][] = [];
  const last = closed ? m : m - 1;
  for (let i = 0; i < last; i++) {
    const j = (i + 1) % m;
    const a = nodes[i].p;
    const b = nodes[j].p;
    out.push([a, add(a, tg[i].out), add(b, tg[j].in), b]);
  }
  return out;
}

export function segsD(ss: [V2, V2, V2, V2][], close = true): string {
  if (!ss.length) return '';
  let d = `M${P(ss[0][0])}`;
  for (const s of ss) d += `C${P(s[1])} ${P(s[2])} ${P(s[3])}`;
  return close ? d + 'Z' : d;
}
export const outline = (nodes: Nd[], closed = true) => segsD(outlineSegs(nodes, closed), closed);
/** A straight polygon (for planes seen only through a clip). */
export const poly = (pts: V2[]) => (pts.length ? `M${pts.map(P).join('L')}Z` : '');

/** Points along a smooth curve through the given points (Catmull-Rom), n per span. */
export function resample(pts: V2[], n = 4): V2[] {
  if (pts.length < 3) return pts.slice();
  const ss = outlineSegs(pts.map((p) => ({p})), false);
  const out: V2[] = [pts[0]];
  for (const s of ss) {
    for (let q = 1; q <= n; q++) {
      const t = q / n;
      const u = 1 - t;
      out.push([
        u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
        u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1],
      ]);
    }
  }
  return out;
}
/** The length of a polyline and its cumulative arc lengths. */
export function arcs(pts: V2[]): {L: number; s: number[]} {
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + dist(pts[i - 1], pts[i]));
  return {L: s[s.length - 1], s};
}

// ---------------------------------------------------------------- ribbons
export type RibbonOpts = {
  /** the root: 'flat' (hidden under another shape), 'round' */
  root?: 'flat' | 'round';
  /** the samples per span of the centre line */
  n?: number;
};
/** A tapered band round a centre line (its joints, root first); w(s) = the full width at s (0 root .. 1 tip). The
 *  tip is one sharp point; returns the closed path and its two edges (left = the edge to the left of travel). */
export function ribbon(centre: V2[], w: (s: number) => number, o: RibbonOpts = {}): {d: string; left: V2[]; right: V2[]; tip: V2} {
  const c = resample(centre, o.n ?? 3);
  const {L, s} = arcs(c);
  const left: V2[] = [];
  const right: V2[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    const nv = nrm(norm(sub(b, a)));
    const hw = w(L ? s[i] / L : 0) / 2;
    left.push(add(c[i], mul(nv, hw)));
    right.push(add(c[i], mul(nv, -hw)));
  }
  const tip = c[c.length - 1];
  const nodes: Nd[] = [];
  // the root's two corners, the left edge out, the tip, the right edge back
  nodes.push({p: left[0], c: o.root !== 'round'});
  for (let i = 1; i < c.length - 1; i++) nodes.push({p: left[i]});
  nodes.push({p: tip, c: true});
  for (let i = c.length - 2; i >= 1; i--) nodes.push({p: right[i]});
  nodes.push({p: right[0], c: o.root !== 'round'});
  if (o.root === 'round') {
    const back = norm(sub(c[0], c[1]));
    const hw0 = w(0) / 2;
    nodes.push({p: add(c[0], mul(back, hw0 * 0.8))});
  }
  return {d: outline(nodes, true), left, right, tip};
}

/** A chain from a root by segment angles (degrees, screen) and lengths: inextensible by construction. */
export function chainOf(root: V2, angles: number[], lens: number[]): V2[] {
  const pts: V2[] = [root];
  let p = root;
  for (let i = 0; i < angles.length; i++) {
    p = add(p, mul(dirA(angles[i]), lens[i]));
    pts.push(p);
  }
  return pts;
}

/** A deterministic hash noise in [-1, 1] (for small per-person variations). */
export function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** A smooth minimum / maximum (k = the blend width): a cloth point that follows whichever knee leads hands over
 *  softly instead of reversing in one frame. */
export const smin = (a: number, b: number, k: number) => -k * Math.log(Math.exp(-a / k) + Math.exp(-b / k));
export const smax = (a: number, b: number, k: number) => k * Math.log(Math.exp(a / k) + Math.exp(b / k));
