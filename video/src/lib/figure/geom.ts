// lib/figure geometry: pure helpers for the refined figure (docs/look/paint_recipes/people.md §g). Every shape is ONE
// closed smooth loop (Catmull-Rom through a few control points), so the silhouette is clean by construction: no
// corners unless asked for, no crossings, no strokes.
export type Pt = [number, number];

export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const len = (a: Pt) => Math.hypot(a[0], a[1]);
export const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
export const deg = (a: number) => (a * Math.PI) / 180;
/** Rotate p about c by a degrees (screen space, y down: a > 0 turns clockwise on screen). */
export const rot = (p: Pt, c: Pt, a: number): Pt => {
  const r = deg(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** The point at distance l from p in direction a degrees (0 = straight down, + = toward screen-left... see dirPt). */
export const polar = (p: Pt, l: number, a: number): Pt => [p[0] + l * Math.sin(deg(a)), p[1] + l * Math.cos(deg(a))];
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (u: number) => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (p: Pt) => `${f1(p[0])} ${f1(p[1])}`;

/** A closed smooth loop through pts (Catmull-Rom, tension 0..1: 0.5 = round, lower = tighter). */
export function loop(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  if (n < 3) return '';
  const k = tension / 3;
  const g = (i: number): Pt => pts[((i % n) + n) % n];
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

/** An open smooth curve through pts (for the few true lines: the closed-eye line, a strap). */
export function curve(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const g = (i: number): Pt => pts[Math.max(0, Math.min(n - 1, i))];
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

/** The points of a tube along a joint chain with half-widths w (one per joint): left side down, round end cap, right
 *  side up, round start cap; `bulge` pushes the back side out at a joint (a calf, a forearm). Returns control points
 *  for `loop`. */
export function tube(chain: Pt[], w: number[], o: {bulge?: number[]; capN?: number} = {}): Pt[] {
  const n = chain.length;
  const nrm: Pt[] = chain.map((_, i) => {
    const a = chain[Math.max(0, i - 1)];
    const b = chain[Math.min(n - 1, i + 1)];
    const t = norm(sub(b, a));
    return [-t[1], t[0]];
  });
  const bul = o.bulge ?? chain.map(() => 0);
  const left = chain.map((p, i) => add(p, mul(nrm[i], w[i] + Math.max(0, bul[i]))));
  const right = chain.map((p, i) => sub(p, mul(nrm[i], w[i] + Math.max(0, -bul[i]))));
  const capN = o.capN ?? 2;
  const end = chain[n - 1];
  const tEnd = norm(sub(chain[n - 1], chain[n - 2]));
  const start = chain[0];
  const tStart = norm(sub(chain[0], chain[1]));
  const cap = (c: Pt, t: Pt, nv: Pt, r: number, flip: boolean): Pt[] => {
    const out: Pt[] = [];
    for (let i = 1; i <= capN; i++) {
      const a = (Math.PI * i) / (capN + 1);
      const s = flip ? -1 : 1;
      out.push(add(c, add(mul(nv, s * r * Math.cos(a)), mul(t, r * Math.sin(a) * 0.9))));
    }
    return out;
  };
  return [...left, ...cap(end, tEnd, nrm[n - 1], w[n - 1], false), ...right.reverse(), ...cap(start, tStart, nrm[0], w[0], true)];
}

/** Two-bone IK: the middle joint between root and end (bone lengths a, b), bending toward `dir` (a unit-ish vector). */
export function ik(root: Pt, end: Pt, a: number, b: number, dir: Pt): Pt {
  const d = sub(end, root);
  const D = Math.min(len(d), a + b - 1e-3);
  const u = norm(d);
  const x = (a * a - b * b + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const perp: Pt = [-u[1], u[0]];
  const s = perp[0] * dir[0] + perp[1] * dir[1] >= 0 ? 1 : -1;
  return add(add(root, mul(u, x)), mul(perp, h * s));
}

export const shift = (pts: Pt[], v: Pt): Pt[] => pts.map((p) => add(p, v));
export const mirrorX = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y] as Pt);
export const ellipsePts = (c: Pt, rx: number, ry: number, n = 10, a0 = 0): Pt[] =>
  Array.from({length: n}, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2;
    return [c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a)] as Pt;
  });
