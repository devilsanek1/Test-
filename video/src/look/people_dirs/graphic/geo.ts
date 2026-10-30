// MODERN GRAPHIC people (docs/look/people_design/dir_graphic.md): 2D/3D maths and the path builders.
// Every outline is a ROUNDED POLYGON: straight edges joined by deliberate radii (0 = a crisp corner, small = a material
// edge, large = a smooth curve through the edge midpoints). That is the direction's whole shape language: confident
// straights against a few designed curves, never a wobbly freehand loop.
export type V2 = [number, number];
export type V3 = [number, number, number];

export const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
export const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
export const len = (a: V2) => Math.hypot(a[0], a[1]);
export const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const norm = (a: V2): V2 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
/** The left-hand perpendicular (screen space, y down: perp([0,1]) = [-1,0]... i.e. rotated -90 degrees). */
export const perp = (a: V2): V2 => [a[1], -a[0]];
export const lerp = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const mid = (a: V2, b: V2): V2 => lerp(a, b, 0.5);
export const rad = (d: number) => (d * Math.PI) / 180;
/** Rotate p about c by a degrees (screen space, y down: a > 0 turns clockwise on screen). */
export const rot = (p: V2, c: V2, a: number): V2 => {
  const r = rad(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm3 = (a: V3): V3 => {
  const l = len3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (p: V2) => `${f(p[0])} ${f(p[1])}`;

/** A rounded-polygon vertex: x, y and the corner radius (0 or absent = crisp). */
export type RV = [number, number, number?];

const K = 0.5523; // a cubic's handle for a circular quarter

/** The rounded polygon through pts. Each vertex is cut back along both edges by its radius (at most half of each
 *  edge) and the two cut points are joined by a cubic whose handles point at the vertex. closed = false gives an open
 *  chain (its two ends stay crisp). */
export function rpath(pts: RV[], closed = true): string {
  const n = pts.length;
  if (n < 2) return '';
  const p = (i: number): V2 => [pts[i][0], pts[i][1]];
  let d = '';
  const corner = (i: number): {a: V2; b: V2; v: V2; r: number} => {
    const v = p(i);
    const r = pts[i][2] ?? 0;
    const prev = p((i - 1 + n) % n);
    const next = p((i + 1) % n);
    if (r <= 0 || (!closed && (i === 0 || i === n - 1))) return {a: v, b: v, v, r: 0};
    const d1 = dist(prev, v);
    const d2 = dist(v, next);
    const t1 = Math.min(r, d1 * 0.5);
    const t2 = Math.min(r, d2 * 0.5);
    return {a: add(v, mul(norm(sub(prev, v)), t1)), b: add(v, mul(norm(sub(next, v)), t2)), v, r};
  };
  const cs = pts.map((_, i) => corner(i));
  for (let i = 0; i < n; i++) {
    const c = cs[i];
    if (i === 0) d += `M${P(c.r ? c.b : c.v)}`;
    else if (c.r) {
      d += `L${P(c.a)}C${P(add(c.a, mul(sub(c.v, c.a), K)))} ${P(add(c.b, mul(sub(c.v, c.b), K)))} ${P(c.b)}`;
    } else d += `L${P(c.v)}`;
  }
  if (closed) {
    const c = cs[0];
    if (c.r) d += `L${P(c.a)}C${P(add(c.a, mul(sub(c.v, c.a), K)))} ${P(add(c.b, mul(sub(c.v, c.b), K)))} ${P(c.b)}`;
    d += 'Z';
  }
  return d;
}

/** A plain polygon (crisp corners). */
export const poly = (pts: V2[]) => `M${pts.map(P).join('L')}Z`;
/** An open polyline. */
export const pline = (pts: V2[]) => `M${pts.map(P).join('L')}`;
/** A smooth open curve through pts (Catmull-Rom; for the few true lines: a strap, a cable, a straw). */
export function curve(pts: V2[], tension = 0.5): string {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const g = (i: number): V2 => pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    d += `C${P([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k])} ${P([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k])} ${P(p2)}`;
  }
  return d;
}
/** A smooth closed loop through pts (Catmull-Rom): only for organic masses (curls, a cloud of hair). */
export function loop(pts: V2[], tension = 0.5): string {
  const n = pts.length;
  if (n < 3) return '';
  const k = tension / 3;
  const g = (i: number): V2 => pts[((i % n) + n) % n];
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    d += `C${P([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k])} ${P([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k])} ${P(p2)}`;
  }
  return d + 'Z';
}
export const ellipse = (c: V2, rx: number, ry: number, a = 0) => {
  // four cubic quarters, rotated by a degrees
  const pts: V2[] = [];
  for (let i = 0; i < 4; i++) {
    const t = (i * Math.PI) / 2;
    pts.push([c[0] + rx * Math.cos(t), c[1] + ry * Math.sin(t)]);
  }
  const R = (q: V2) => (a ? rot(q, c, a) : q);
  let d = `M${P(R(pts[0]))}`;
  for (let i = 0; i < 4; i++) {
    const t0 = (i * Math.PI) / 2;
    const t1 = ((i + 1) * Math.PI) / 2;
    const p0: V2 = [c[0] + rx * Math.cos(t0), c[1] + ry * Math.sin(t0)];
    const p1: V2 = [c[0] + rx * Math.cos(t1), c[1] + ry * Math.sin(t1)];
    const h0: V2 = [p0[0] - rx * Math.sin(t0) * K, p0[1] + ry * Math.cos(t0) * K];
    const h1: V2 = [p1[0] + rx * Math.sin(t1) * K, p1[1] - ry * Math.cos(t1) * K];
    d += `C${P(R(h0))} ${P(R(h1))} ${P(R(p1))}`;
  }
  return d + 'Z';
};

/** Convex hull (monotone chain), counter-clockwise in screen space. */
export function hull(pts: V2[]): V2[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** The region on one side of a polyline: the line's points, then the same points pushed far along `away` (a big
 *  polygon; it is always used inside a clip, so its far edge never shows). */
export function sideOf(line: V2[], away: V2, far = 4000): string {
  const a = norm(away);
  const back = line.slice().reverse().map((q) => add(q, mul(a, far)));
  return poly(line.concat(back));
}

/** Offset a polyline by per-point distances along its left perpendicular (screen space). */
export function offset(line: V2[], w: number[] | number): V2[] {
  const n = line.length;
  return line.map((q, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(n - 1, i + 1)];
    const t = norm(sub(b, a));
    const nr = perp(t);
    const wi = Array.isArray(w) ? w[i] : w;
    return add(q, mul(nr, wi));
  });
}

/** Point at parameter t (0..1) along a polyline, by length. */
export function along(line: V2[], t: number): V2 {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += dist(line[i - 1], line[i]);
  let goal = total * clamp(t, 0, 1);
  for (let i = 1; i < line.length; i++) {
    const s = dist(line[i - 1], line[i]);
    if (goal <= s || i === line.length - 1) return lerp(line[i - 1], line[i], s ? clamp(goal / s, 0, 1) : 0);
    goal -= s;
  }
  return line[line.length - 1];
}

/** A small deterministic random (for seeded variety; never animated). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
