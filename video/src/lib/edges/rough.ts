// edges/rough.ts — pure, deterministic geometry for the screen-edge treatments (lib/edges). Everything is SCREEN px
// (1080 x 1920, y down) and a pure function of (seed, amount): the shapes never change from frame to frame.
//
//   cutPoly(corners, r, {segs, dev, bow})   a HAND-CUT contour: each side a few straight scissor cuts with small
//                                           angle changes (never noise), corners slightly off 90 deg
//   organic(base, r, {amp, harmonics})      a loose hand-drawn contour: a base polyline resampled and pushed along
//                                           its normals by a smooth periodic wobble, then drawn as smooth curves
//   roundRectPts(...)                       rounded-rectangle polyline with per-corner radii (the organic base)
//   pathOf(points) / smoothClosed(points)   SVG path strings

import {Rng} from '../rng';
import type {Pt} from '../sketch';

const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;

export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Straight polygon path (closed). */
export const pathOf = (pts: Pt[], close = true) => pts.map((p, i) => `${i ? 'L' : 'M'}${P(p)}`).join('') + (close ? 'Z' : '');

/** Smooth closed curve through the points (Catmull-Rom -> cubic Beziers). */
export function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + 'Z';
}

export type CutOpts = {
  /** Number of scissor cuts per side [min, max]. Default [2, 3]. */
  segs?: [number, number];
  /** Max sideways jog of the points between cuts (px). Default 2.5. */
  dev?: number;
  /** Max bow of a side (px, random sign). Default 2. */
  bow?: number;
  /** Per-side overrides (index = side starting at corners[i]). */
  side?: (i: number) => Partial<Omit<CutOpts, 'side'>> | undefined;
};

/** One hand-cut side from a to b (b included, a not): `segs` straight cuts whose joints jog sideways a little. */
export function cutSide(a: Pt, b: Pt, r: Rng, o: CutOpts = {}): Pt[] {
  const [s0, s1] = o.segs ?? [2, 3];
  const dev = o.dev ?? 2.5;
  const bow = (o.bow ?? 2) * r.range(-1, 1);
  const n = Math.max(1, r.int(s0, s1));
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  // joints spread unevenly along the side (never closer than 0.6 / n of the side)
  const ts: number[] = [];
  let acc = 0;
  const w = Array.from({length: n}, () => r.range(0.6, 1.4));
  const tot = w.reduce((s, v) => s + v, 0);
  for (let i = 0; i < n - 1; i++) {
    acc += w[i] / tot;
    ts.push(acc);
  }
  const out: Pt[] = ts.map((t) => {
    const p = lerpPt(a, b, t);
    const off = bow * 4 * t * (1 - t) + r.jitter(dev);
    return [p[0] + nx * off, p[1] + ny * off];
  });
  out.push(b);
  return out;
}

/** A hand-cut closed contour through `corners` (clockwise). */
export function cutPoly(corners: Pt[], r: Rng, o: CutOpts = {}): Pt[] {
  const out: Pt[] = [corners[0]];
  corners.forEach((c, i) => {
    const nxt = corners[(i + 1) % corners.length];
    const so = {...o, ...(o.side?.(i) ?? {})};
    const pts = cutSide(c, nxt, r.fork(`s${i}`), so);
    if (i === corners.length - 1) pts.pop(); // closes on corners[0]
    out.push(...pts);
  });
  return out;
}

/** Rounded rectangle [x0, y0, x1, y1] with per-corner radii [tl, tr, br, bl] (a number = circular, [rx, ry] =
 *  elliptical: a corner that pulls in further along one side), as a clockwise polyline. */
export function roundRectPts(x0: number, y0: number, x1: number, y1: number, rad: (number | [number, number])[], step = 6): Pt[] {
  const out: Pt[] = [];
  const R = rad.map((v) => (typeof v === 'number' ? [v, v] : v));
  const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) => {
    const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * Math.max(rx, ry)) / step));
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
  };
  const [tl, tr, br, bl] = R;
  arc(x0 + tl[0], y0 + tl[1], tl[0], tl[1], Math.PI, Math.PI * 1.5);
  arc(x1 - tr[0], y0 + tr[1], tr[0], tr[1], -Math.PI / 2, 0);
  arc(x1 - br[0], y1 - br[1], br[0], br[1], 0, Math.PI / 2);
  arc(x0 + bl[0], y1 - bl[1], bl[0], bl[1], Math.PI / 2, Math.PI);
  return out;
}

/** Resample a closed polyline to points every ~`step` px of arc length. */
export function resampleClosed(pts: Pt[], step: number): Pt[] {
  const n = pts.length;
  const seg: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(l);
    total += l;
  }
  const m = Math.max(8, Math.round(total / step));
  const out: Pt[] = [];
  let i = 0;
  let acc = 0;
  for (let k = 0; k < m; k++) {
    const s = (k / m) * total;
    while (acc + seg[i] < s && i < n - 1) {
      acc += seg[i];
      i++;
    }
    const t = seg[i] ? (s - acc) / seg[i] : 0;
    out.push(lerpPt(pts[i], pts[(i + 1) % n], t));
  }
  return out;
}

export type OrganicOpts = {
  /** Wobble amplitude (px) along the normal. */
  amp: number;
  /** Harmonics (whole cycles per loop) and their weights. Default a slow 3-5 / 7-11 / 15-21 mix. */
  harmonics?: [number, number][];
  /** Resample step (px). Default 26. */
  step?: number;
  /** Extra per-point amplitude scale (e.g. more wobble at the corners), by the point. */
  ampAt?: (p: Pt) => number;
};

/** A loose hand-drawn closed contour around `base` (clockwise polyline): smooth periodic wobble along the normals. */
export function organic(base: Pt[], r: Rng, o: OrganicOpts): Pt[] {
  const pts = resampleClosed(base, o.step ?? 26);
  const n = pts.length;
  const harm = o.harmonics ?? [
    [r.int(3, 5), 0.55],
    [r.int(7, 11), 0.3],
    [r.int(15, 21), 0.15],
  ];
  const ph = harm.map(() => r.range(0, Math.PI * 2));
  // centroid (to orient the normals outward)
  const cx = pts.reduce((s, p) => s + p[0], 0) / n;
  const cy = pts.reduce((s, p) => s + p[1], 0) / n;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    let nx = -(b[1] - a[1]);
    let ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const u = i / n;
    let w = 0;
    harm.forEach(([k, wt], j) => (w += wt * Math.sin(Math.PI * 2 * k * u + ph[j])));
    const off = o.amp * w * (o.ampAt ? o.ampAt(p) : 1);
    return [p[0] + nx * off, p[1] + ny * off] as Pt;
  });
}

/** Is point p inside the closed polygon (even-odd)? */
export function inside(p: Pt, poly: Pt[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1] || 1e-9) + a[0]) c = !c;
  }
  return c;
}

/** Does the polygon contain every point of the rect [x0, y0, x1, y1] (sampled along its edges)? */
export function containsRect(poly: Pt[], [x0, y0, x1, y1]: [number, number, number, number], step = 20): boolean {
  for (let x = x0; x <= x1; x += step) if (!inside([x, y0], poly) || !inside([x, y1], poly)) return false;
  for (let y = y0; y <= y1; y += step) if (!inside([x0, y], poly) || !inside([x1, y], poly)) return false;
  return true;
}
