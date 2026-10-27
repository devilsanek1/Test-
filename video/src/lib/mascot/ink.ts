// Self-contained hand-ink helpers for the mascot (no dependency on the engine's primitives).
// Lines are rendered as filled, tapered brush polygons built from a centerline, so they swell and
// thin like a real pen, overshoot their ends a little and never look like a mechanical SVG stroke.

export type Pt = [number, number];

// ---------- deterministic randomness ----------
const fract = (v: number) => v - Math.floor(v);
export const hash = (n: number): number => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
/** Deterministic 0..1 value for (seed, k). */
export const rand = (seed: number, k: number): number => hash(seed * 13.37 + k * 7.913 + 0.5);
/** Smooth 1D value noise in -1..1. */
export const noise1 = (x: number, seed: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 57.31);
  const b = hash(i + 1 + seed * 57.31);
  return (a + (b - a) * u) * 2 - 1;
};

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (e0: number, e1: number, v: number) => {
  const k = clamp((v - e0) / (e1 - e0));
  return k * k * (3 - 2 * k);
};
export const deg = (d: number) => (d * Math.PI) / 180;

// ---------- transforms ----------
export type Xf = {
  /** where the pivot lands */
  x?: number;
  y?: number;
  /** degrees, positive = clockwise on screen */
  rot?: number;
  /** pivot in the part's own coordinates */
  px?: number;
  py?: number;
  sx?: number;
  sy?: number;
};

export const tp = (pts: Pt[], xf: Xf): Pt[] => {
  const {x = 0, y = 0, rot = 0, px = 0, py = 0, sx = 1, sy = 1} = xf;
  const c = Math.cos(deg(rot));
  const s = Math.sin(deg(rot));
  return pts.map(([a, b]) => {
    const u = (a - px) * sx;
    const v = (b - py) * sy;
    return [u * c - v * s + x, u * s + v * c + y] as Pt;
  });
};
export const tpt = (p: Pt, xf: Xf): Pt => tp([p], xf)[0];
export const mirror = (pts: Pt[]): Pt[] => pts.map(([a, b]) => [-a, b] as Pt);
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

// ---------- splines ----------
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

/** Dense polyline through control points (Catmull-Rom). Closed loops do not repeat the first point. */
export const spline = (pts: Pt[], closed = false, perSeg = 8): Pt[] => {
  const n = pts.length;
  if (n < 2) return pts.slice();
  const out: Pt[] = [];
  const get = (i: number): Pt => {
    if (closed) return pts[((i % n) + n) % n];
    if (i < 0) return [2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]];
    if (i >= n) return [2 * pts[n - 1][0] - pts[n - 2][0], 2 * pts[n - 1][1] - pts[n - 2][1]];
    return pts[i];
  };
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg;
      out.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
};

/** Sub-range of a dense closed loop, u in loop fractions; u1 may exceed 1 to wrap. */
export const loopRange = (loop: Pt[], u0: number, u1: number): Pt[] => {
  const n = loop.length;
  const i0 = Math.round(u0 * n);
  const i1 = Math.round(u1 * n);
  const out: Pt[] = [];
  for (let i = i0; i <= i1; i++) out.push(loop[((i % n) + n) % n]);
  return out;
};

export const polyPath = (pts: Pt[], closed = true): string => {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) d += `L${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  return closed ? d + 'Z' : d;
};

export const ellipsePts = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 24): Pt[] => {
  const out: Pt[] = [];
  const c = Math.cos(deg(rot));
  const s = Math.sin(deg(rot));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const u = Math.cos(a) * rx;
    const v = Math.sin(a) * ry;
    out.push([cx + u * c - v * s, cy + u * s + v * c]);
  }
  return out;
};

/** Offset a centerline into a closed tube outline (for trunk, tail, legs). */
export const tube = (center: Pt[], w0: number, w1: number): {left: Pt[]; right: Pt[]; loop: Pt[]} => {
  const n = center.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = center[Math.max(0, i - 1)];
    const b = center[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const hw = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    left.push([center[i][0] - ty * hw, center[i][1] + tx * hw]);
    right.push([center[i][0] + ty * hw, center[i][1] - tx * hw]);
  }
  return {left, right, loop: [...left, ...right.slice().reverse()]};
};

// ---------- the brush ----------
export type BrushOpts = {
  w: number; // peak width (local units)
  seed: number;
  wobble?: number; // centerline wander amplitude
  over?: number; // overshoot at both ends (local units); negative shortens
  overStart?: number;
  overEnd?: number;
  tipIn?: number; // width ratio at the start tip
  tipOut?: number; // width ratio at the end tip
  draw?: number; // 0..1 reveal along the stroke
  press?: number; // pressure noise amplitude (default 0.14; the clean pen: 0)
  wVar?: number; // per-stroke width variation range (default 0.28: x0.86-1.14; the clean pen: 0)
};

const lengths = (pts: Pt[]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return L;
};

/** A tapered ink stroke along a dense centerline, returned as a filled path. */
export const brush = (center: Pt[], o: BrushOpts): string => {
  if (center.length < 2) return '';
  const seed = o.seed;
  const pts = center.slice();
  // overshoot along the end tangents
  const oS = o.overStart ?? o.over ?? 0.6 + rand(seed, 1) * 1.4;
  const oE = o.overEnd ?? o.over ?? 0.6 + rand(seed, 2) * 1.6;
  const extend = (p: Pt, q: Pt, d: number): Pt => {
    const dx = p[0] - q[0];
    const dy = p[1] - q[1];
    const l = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / l) * d, p[1] + (dy / l) * d];
  };
  if (oS > 0) pts.unshift(extend(pts[0], pts[Math.min(2, pts.length - 1)], oS));
  if (oE > 0) pts.push(extend(pts[pts.length - 1], pts[Math.max(0, pts.length - 3)], oE));
  let L = lengths(pts);
  let total = L[L.length - 1];
  if (total < 0.01) return '';
  // progressive reveal
  const draw = o.draw ?? 1;
  if (draw <= 0) return '';
  let used = pts;
  if (draw < 1) {
    const cut = total * draw;
    used = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (L[i] <= cut) used.push(pts[i]);
      else {
        const k = (cut - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
        used.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]);
        break;
      }
    }
    if (used.length < 2) return '';
    L = lengths(used);
  }
  const n = used.length;
  const full = total;
  total = L[n - 1];
  const wob = o.wobble ?? 0.45;
  const wv = o.wVar ?? 0.28;
  const wMul = 1 - wv / 2 + rand(seed, 3) * wv;
  const pressK = o.press ?? 0.14;
  const tipIn = o.tipIn ?? 0.35;
  const tipOut = o.tipOut ?? 0.18;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = used[Math.max(0, i - 1)];
    const b = used[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const s = L[i];
    const u = s / full; // position along the full stroke
    const wander = noise1(s / 16, seed + 11) * wob;
    const cx = used[i][0] - ty * wander;
    const cy = used[i][1] + tx * wander;
    // pressure profile: quick press-in, long gentle release
    const inK = smooth(0, Math.min(0.22, 5 / full + 0.04), u);
    const outK = 1 - smooth(1 - Math.min(0.32, 7 / full + 0.08), 1, u);
    const prof = lerp(tipIn, 1, inK) * lerp(tipOut, 1, outK) / 1;
    const press = 1 + (pressK ? noise1(s / 9, seed + 23) * pressK : 0);
    let hw = (o.w * wMul * prof * press) / 2;
    // the moving tip of a stroke being drawn is round, not cut
    if (draw < 1 && i === n - 1) hw *= 0.7;
    left.push([cx - ty * hw, cy + tx * hw]);
    right.push([cx + ty * hw, cy - tx * hw]);
  }
  return polyPath([...left, ...right.reverse()], true);
};
