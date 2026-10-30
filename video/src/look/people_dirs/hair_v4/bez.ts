// HAIR v4: the authored-shape primitive. A hair piece is drawn the way an illustrator draws it with the pen tool: a
// closed path of cubic Béziers through a FEW deliberate anchors, each with its two handles. The rig (rig.ts) moves
// these exact anchors and handles; nothing is ever regenerated from parameters.
//
// Authoring notation, in head units (u = the skull's height; origin the skull's centre; y down; crown -0.5, chin 0.5):
//   [x, y]                      a corner (no handles: the segments meet at a point, a tip or a notch)
//   [x, y, hx, hy]              a smooth node: out-handle (hx, hy) relative to the anchor, in-handle its mirror
//   [x, y, ix, iy, ox, oy]      a broken node (a cusp: the flip of a hem, a lock's tip): in- and out-handle apart
export type V2 = [number, number];
export type N = [number, number] | [number, number, number, number] | [number, number, number, number, number, number];
/** A node in absolute coordinates: the anchor and its in- and out-handle points. */
export type Node = {p: V2; i: V2; o: V2};
export type Shape = Node[];

export const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
export const lerp = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const len = (a: V2) => Math.hypot(a[0], a[1]);
export const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const norm = (a: V2): V2 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
export const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
export const cross = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Authored nodes -> absolute nodes. */
export function nodes(ns: N[]): Shape {
  return ns.map((n) => {
    const p: V2 = [n[0], n[1]];
    if (n.length === 2) return {p, i: p, o: p};
    if (n.length === 4) return {p, i: [n[0] - n[2], n[1] - n[3]], o: [n[0] + n[2], n[1] + n[3]]};
    return {p, i: [n[0] + n[2], n[1] + n[3]], o: [n[0] + n[4], n[1] + n[5]]};
  });
}

/** Every point of a shape through f (an affine map keeps smooth nodes smooth). */
export const mapShape = (s: Shape, f: (p: V2) => V2): Shape => s.map((n) => ({p: f(n.p), i: f(n.i), o: f(n.o)}));
/** Two node-compatible shapes blended (the morph between two authored views of the same piece). */
export function lerpShape(a: Shape, b: Shape, t: number): Shape {
  if (t <= 0) return a;
  if (t >= 1) return b;
  if (a.length !== b.length) throw new Error(`lerpShape: ${a.length} vs ${b.length} nodes`);
  return a.map((n, k) => ({p: lerp(n.p, b[k].p, t), i: lerp(n.i, b[k].i, t), o: lerp(n.o, b[k].o, t)}));
}

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
const P = (p: V2) => `${f1(p[0])} ${f1(p[1])}`;
/** SVG path data (absolute M/C/Z, one decimal: figure-local units). */
export function dOf(s: Shape, closed = true): string {
  const n = s.length;
  if (!n) return '';
  let d = `M${P(s[0].p)}`;
  const last = closed ? n : n - 1;
  for (let k = 0; k < last; k++) {
    const a = s[k];
    const b = s[(k + 1) % n];
    d += `C${P(a.o)} ${P(b.i)} ${P(b.p)}`;
  }
  return closed ? d + 'Z' : d;
}

/** The cubic between node k and node k+1 at t. */
export function bezAt(a: Node, b: Node, t: number): V2 {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return [w0 * a.p[0] + w1 * a.o[0] + w2 * b.i[0] + w3 * b.p[0], w0 * a.p[1] + w1 * a.o[1] + w2 * b.i[1] + w3 * b.p[1]];
}
/** A polyline through the shape (per segment n points). */
export function sample(s: Shape, per = 16, closed = true): V2[] {
  const out: V2[] = [];
  const n = s.length;
  const last = closed ? n : n - 1;
  for (let k = 0; k < last; k++) {
    const a = s[k];
    const b = s[(k + 1) % n];
    for (let j = 0; j < per; j++) out.push(bezAt(a, b, j / per));
  }
  if (!closed && n) out.push(s[n - 1].p);
  return out;
}
/** A polyline's length and the point at a fraction of it. */
export function plen(pl: V2[]): number {
  let L = 0;
  for (let i = 1; i < pl.length; i++) L += dist(pl[i - 1], pl[i]);
  return L;
}
export function pat(pl: V2[], t: number): V2 {
  const L = plen(pl);
  let goal = L * clamp(t, 0, 1);
  for (let i = 1; i < pl.length; i++) {
    const s = dist(pl[i - 1], pl[i]);
    if (goal <= s || i === pl.length - 1) return lerp(pl[i - 1], pl[i], s ? clamp(goal / s, 0, 1) : 0);
    goal -= s;
  }
  return pl[pl.length - 1];
}
/** The parameter (0..1 by length) of the point on a polyline nearest to q, and the distance. */
export function project(pl: V2[], q: V2): {t: number; d: number; side: number} {
  let best = {t: 0, d: Infinity, side: 0};
  const L = plen(pl) || 1;
  let acc = 0;
  for (let i = 1; i < pl.length; i++) {
    const a = pl[i - 1];
    const b = pl[i];
    const ab = sub(b, a);
    const l2 = dot(ab, ab) || 1e-9;
    const u = clamp(dot(sub(q, a), ab) / l2, 0, 1);
    const c = lerp(a, b, u);
    const d = dist(c, q);
    if (d < best.d) best = {t: (acc + u * Math.sqrt(l2)) / L, d, side: Math.sign(cross(ab, sub(q, a)))};
    acc += Math.sqrt(l2);
  }
  return best;
}

/** Does a closed polyline cross itself? (the rig's guard: a deformation must never fold a shape) */
export function selfCrosses(pl: V2[]): boolean {
  const n = pl.length;
  const segX = (a: V2, b: V2, c: V2, d: V2) => {
    const d1 = cross(sub(b, a), sub(c, a));
    const d2 = cross(sub(b, a), sub(d, a));
    const d3 = cross(sub(d, c), sub(a, c));
    const d4 = cross(sub(d, c), sub(b, c));
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  for (let i = 0; i < n; i++) {
    const a = pl[i];
    const b = pl[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (segX(a, b, pl[j], pl[(j + 1) % n])) return true;
    }
  }
  return false;
}

/** A tapered ribbon (a flow line, a flyaway strand) around an open centre curve: width w at its widest (at `at`),
 *  pointed at both ends (or blunt at the root with root > 0). Returns a closed shape of smooth nodes. */
export function ribbon(c: Shape, w: number, o: {at?: number; root?: number; per?: number} = {}): V2[] {
  const pl = sample(c, o.per ?? 10, false);
  const n = pl.length;
  const at = o.at ?? 0.4;
  const root = o.root ?? 0;
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    const a = pl[Math.max(0, i - 1)];
    const b = pl[Math.min(n - 1, i + 1)];
    const t = norm(sub(b, a));
    const nr: V2 = [-t[1], t[0]];
    const prof = s < at ? root + (1 - root) * Math.sin((Math.PI / 2) * (s / at)) : Math.cos((Math.PI / 2) * ((s - at) / (1 - at)));
    const h = (w / 2) * Math.max(0, prof);
    L.push(add(pl[i], mul(nr, h)));
    R.push(add(pl[i], mul(nr, -h)));
  }
  return L.concat(R.reverse());
}
/** A smooth closed path through polyline points (Catmull-Rom as cubics). */
export function loopD(pts: V2[], tension = 0.5): string {
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
/** A polyline as a plain closed path. */
export const polyD = (pts: V2[]) => (pts.length ? `M${pts.map(P).join('L')}Z` : '');
