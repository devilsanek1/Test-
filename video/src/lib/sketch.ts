// sketch.ts — pure functions returning SVG path strings in the reference's loose ARCHITECTURAL INK look:
// straight-ish lines that overshoot their endpoints, rect edges drawn as separate strokes, wobbly circles
// that don't quite close, scalloped tree crowns, glass glints, hatching, arrows, check/cross marks.
// Every function is deterministic for a given seed (default seed = derived from the coordinates).
// Feed the result to <Ink d={...}/> (linework) or <Fill d={...}/> (closed shapes: use the *Fill helpers).
//
//   <Ink d={rect(100, 200, 300, 180, {seed: 'win'})} at={1} dur={0.6} />
//   <Ink d={line(80, 500, 880, 500, {over: [4, 40]})} at={0.2} />
//   <Fill d={rectPath(100, 200, 300, 180)} color={palette.mintPale} at={1.5} />
//
// Coordinates are card-local px (960 x 1400). Angles are DEGREES, 0 = right, 90 = down (SVG y-down).

import {Rng, rng, Seed} from './rng';

export type Pt = [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
const D2R = Math.PI / 180;

const autoSeed = (...n: number[]) => n.map((v) => Math.round(v)).join(',');

// ---------------------------------------------------------------- lines

export type LineOpts = {
  seed?: Seed;
  /** Overshoot past the ends (px). number = both ends (randomised 0.5–1.4x); [start, end] = exact; 0 = none.
   *  Default: ~4–18 px scaled by length, ~14% chance of a long 16–40 px "construction" tail on one end. */
  over?: number | [number, number];
  /** Max sideways bow (px), random sign. Default ~0.5% of length (min 0.4). */
  bow?: number;
  /** Endpoint jitter (px). Default 0.8. */
  jitter?: number;
};

function overs(r: Rng, over: LineOpts['over'], len: number): [number, number] {
  if (Array.isArray(over)) return over;
  if (typeof over === 'number') return [over * r.range(0.5, 1.4), over * r.range(0.5, 1.4)];
  const base = Math.min(15, Math.max(4, len * 0.05));
  const a = base * r.range(0.3, 1.25);
  const b = base * r.range(0.3, 1.45);
  if (len > 60 && r.chance(0.14)) {
    const tail = r.range(16, 40);
    return r.chance(0.5) ? [tail, b] : [a, tail];
  }
  return [a, b];
}

/** A single hand-drawn straight stroke from (x1,y1) to (x2,y2), extended past both ends. */
export function line(x1: number, y1: number, x2: number, y2: number, o: LineOpts = {}): string {
  const r = rng(o.seed ?? autoSeed(x1, y1, x2, y2));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const [o1, o2] = overs(r, o.over, len);
  const j = o.jitter ?? 0.8;
  const ax = x1 - ux * o1 + r.jitter(j);
  const ay = y1 - uy * o1 + r.jitter(j);
  const bx = x2 + ux * o2 + r.jitter(j);
  const by = y2 + uy * o2 + r.jitter(j);
  const bow = (o.bow ?? Math.max(0.4, len * 0.005)) * r.range(-1, 1);
  const cx = (ax + bx) / 2 - uy * bow * 2;
  const cy = (ay + by) / 2 + ux * bow * 2;
  return `M${P(ax, ay)}Q${P(cx, cy)} ${P(bx, by)}`;
}

/** Horizontal line helper. */
export const hline = (x1: number, x2: number, y: number, o: LineOpts = {}) => line(x1, y, x2, y, o);
/** Vertical line helper. */
export const vline = (x: number, y1: number, y2: number, o: LineOpts = {}) => line(x, y1, x, y2, o);

export type RectOpts = LineOpts & {
  /** Which edges to draw, in drawing order: any of 't','l','r','b'. Default 'tlrb'. */
  edges?: string;
};

/** Rectangle as separate edge strokes that overshoot at the corners (reference windows/boards/facades). */
export function rect(x: number, y: number, w: number, h: number, o: RectOpts = {}): string {
  const seed = o.seed ?? autoSeed(x, y, w, h);
  const r = rng(seed);
  const edges = o.edges ?? 'tlrb';
  const base: LineOpts = {over: o.over, bow: o.bow, jitter: o.jitter};
  const out: string[] = [];
  for (const e of edges) {
    const s = `${seed}/${e}${r.int(0, 999)}`;
    if (e === 't') out.push(line(x, y, x + w, y, {...base, seed: s}));
    if (e === 'b') out.push(line(x, y + h, x + w, y + h, {...base, seed: s}));
    if (e === 'l') out.push(line(x, y, x, y + h, {...base, seed: s}));
    if (e === 'r') out.push(line(x + w, y, x + w, y + h, {...base, seed: s}));
  }
  return out.join('');
}

export type PolyOpts = LineOpts & {
  closed?: boolean;
  /** true: one continuous stroke (slight vertex jitter). false (default): one overshooting stroke per segment. */
  joined?: boolean;
};

/** Polyline through points. Default: each segment its own overshooting stroke (roofs, frames, perspective lines). */
export function poly(points: Pt[], o: PolyOpts = {}): string {
  const seed = o.seed ?? autoSeed(...points.flat());
  const pts = o.closed ? [...points, points[0]] : points;
  if (o.joined) {
    const r = rng(seed);
    const j = o.jitter ?? 0.8;
    return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x + r.jitter(j), y + r.jitter(j))}`).join('');
  }
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], {over: o.over, bow: o.bow, jitter: o.jitter, seed: `${seed}/${i}`}));
  }
  return out.join('');
}

// ---------------------------------------------------------------- curves

/** Smooth Catmull-Rom curve through points (cubic beziers). tension 0.5 = standard. */
export function smooth(points: Pt[], o: {closed?: boolean; tension?: number} = {}): string {
  const pts = points;
  const n = pts.length;
  if (n < 2) return '';
  const k = (o.tension ?? 0.5) / 3;
  const get = (i: number): Pt => (o.closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P(pts[0][0], pts[0][1])}`;
  const segs = o.closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${P(c1x, c1y)} ${P(c2x, c2y)} ${P(p2[0], p2[1])}`;
  }
  return o.closed ? d + 'Z' : d;
}

export type CircleOpts = {
  seed?: Seed;
  /** Radius wobble as a fraction of the radius. Default 0.035. */
  wobble?: number;
  /** Extra sweep past 360 deg (degrees). Negative = small gap. Default random -8..+28. */
  overlap?: number;
  /** Start angle in degrees. Default random. */
  start?: number;
};

function ellipsePts(cx: number, cy: number, rx: number, ry: number, o: CircleOpts, closedLoop: boolean): Pt[] {
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const wob = o.wobble ?? 0.035;
  const a0 = (o.start ?? r.range(0, 360)) * D2R;
  const over = closedLoop ? 0 : (o.overlap ?? r.range(-8, 28)) * D2R;
  const per = Math.PI * (rx + ry);
  const n = Math.max(8, Math.min(28, Math.round(per / 22)));
  const ph1 = r.range(0, 6.28);
  const ph2 = r.range(0, 6.28);
  const k1 = r.range(0.5, 1);
  const k2 = r.range(0.2, 0.6);
  const drift = closedLoop ? 0 : r.range(-0.6, 0.6) * wob;
  const sweep = Math.PI * 2 + over;
  const pts: Pt[] = [];
  const count = closedLoop ? n : n + Math.max(1, Math.round((n * over) / (Math.PI * 2)));
  for (let i = 0; i <= (closedLoop ? n - 1 : count); i++) {
    const u = closedLoop ? i / n : i / count;
    const a = a0 + sweep * u;
    const f = 1 + wob * (k1 * Math.sin(2 * a + ph1) + k2 * Math.sin(3 * a + ph2)) / 1.4 + drift * u;
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  return pts;
}

/** Hand-drawn ellipse outline: slightly wobbly, ends overlap (or leave a tiny gap) like a pen loop. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, o: CircleOpts = {}): string {
  return smooth(ellipsePts(cx, cy, rx, ry, o, false));
}

/** Hand-drawn circle outline. */
export const circle = (cx: number, cy: number, rad: number, o: CircleOpts = {}) => ellipse(cx, cy, rad, rad, o);

/** Closed wobbly blob (for fills under circles/ellipses). Same wobble family as ellipse(). */
export function blob(cx: number, cy: number, rx: number, ry: number, o: CircleOpts = {}): string {
  return smooth(ellipsePts(cx, cy, rx, ry, o, true), {closed: true});
}

/** Partial ellipse arc from a0 to a1 (degrees, clockwise when a1 > a0). Slight wobble. */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, o: {seed?: Seed; wobble?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, a0, a1));
  const wob = o.wobble ?? 0.02;
  const span = Math.abs(a1 - a0) * D2R * (rx + ry) * 0.5;
  const n = Math.max(3, Math.min(24, Math.round(span / 20)));
  const ph = r.range(0, 6.28);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * D2R;
    const f = 1 + wob * Math.sin(2.3 * a + ph);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  return smooth(pts);
}

/** Sagging wire / cable from (x1,y1) to (x2,y2); sag in px (positive = down). */
export function wire(x1: number, y1: number, x2: number, y2: number, sag = 18, o: LineOpts = {}): string {
  const r = rng(o.seed ?? autoSeed(x1, y1, x2, y2, sag));
  const [o1, o2] = Array.isArray(o.over) ? o.over : [r.range(2, 10), r.range(2, 10)];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return `M${P(x1 - ux * o1, y1 - uy * o1)}Q${P((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2)} ${P(x2 + ux * o2, y2 + uy * o2)}`;
}

/** Point on a wire() at u in 0..1 (ignores the overshoot). Use to sit birds / lamps on a wire. */
export function wirePoint(x1: number, y1: number, x2: number, y2: number, sag: number, u: number): Pt {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return [a * x1 + b * cx + c * x2, a * y1 + b * cy + c * y2];
}

// ---------------------------------------------------------------- organic

export type CrownOpts = {seed?: Seed; bumps?: number; /** bump roundness 0.5 (flat) .. 0.9 (round). */ round?: number};

/** Scalloped tree crown (cloud-like bumpy outline, closed). Use as both Ink and Fill. */
export function crown(cx: number, cy: number, rx: number, ry: number, o: CrownOpts = {}): string {
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, ry));
  const per = Math.PI * (rx + ry);
  const n = o.bumps ?? Math.max(6, Math.round(per / 52));
  const a0 = r.range(0, 360) * D2R;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((i + r.jitter(0.22)) / n) * Math.PI * 2;
    const f = 1 + r.jitter(0.06);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  const round = o.round ?? 0.62;
  let d = `M${P(pts[0][0], pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x2, y2] = pts[(i + 1) % n];
    const [x1, y1] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    const rad = chord * (round + r.jitter(0.06));
    d += `A${r1(rad)} ${r1(rad)} 0 0 1 ${P(x2, y2)}`;
  }
  return d + 'Z';
}

/** Small "smile" ticks inside a crown (the reference's leaf marks). */
export function crownTicks(cx: number, cy: number, rx: number, ry: number, o: {seed?: Seed; n?: number; size?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, ry, 7));
  const n = o.n ?? Math.max(3, Math.min(7, Math.round((rx * ry) / 1800)));
  const s = o.size ?? Math.max(6, Math.min(12, rx * 0.095));
  let d = '';
  const a0 = r.range(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    // spread around a ring (golden-angle steps) biased to the lower half; avoids accidental faces
    const a = a0 + i * 2.39996 + r.jitter(0.3);
    const rr = r.range(0.42, 0.7);
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.abs(Math.sin(a)) * ry * rr * (Math.sin(a) < 0 ? 0.35 : 1);
    const w = s * r.range(0.6, 1.25);
    const tilt = r.jitter(0.25);
    d += `M${P(x - w, y - w * (0.32 + tilt))}C${P(x - w * 0.75, y + w * 0.38)} ${P(x + w * 0.75, y + w * 0.38)} ${P(x + w, y - w * (0.32 - tilt))}`;
  }
  return d;
}

// ---------------------------------------------------------------- marks & details

/** Window glint: two parallel diagonal strokes "//" (default rising to the right). */
export function glint(x: number, y: number, len = 40, o: {seed?: Seed; angle?: number; gap?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, len));
  const a = (o.angle ?? -62) * D2R;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const gap = o.gap ?? Math.max(6, len * 0.22);
  const l2 = len * r.range(0.45, 0.7);
  const nx = -uy;
  const ny = ux;
  const ox = x + nx * gap + ux * len * 0.12;
  const oy = y + ny * gap + uy * len * 0.12;
  return `M${P(x, y)}L${P(x + ux * len, y + uy * len)}M${P(ox, oy)}L${P(ox + ux * l2, oy + uy * l2)}`;
}

/** Parallel hatching clipped to a rect. angle in degrees, gap in px. */
export function hatch(x: number, y: number, w: number, h: number, o: {seed?: Seed; angle?: number; gap?: number; jitter?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, w, h, 3));
  const a = (o.angle ?? 45) * D2R;
  const gap = o.gap ?? 12;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const corners: Pt[] = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];
  const projs = corners.map(([px, py]) => px * nx + py * ny);
  const lo = Math.min(...projs);
  const hi = Math.max(...projs);
  let d = '';
  for (let s = lo + gap * 0.5; s < hi; s += gap) {
    // point on the line: s * n; clip param t along d to rect (Liang-Barsky)
    const px = nx * s;
    const py = ny * s;
    let t0 = -1e6;
    let t1 = 1e6;
    const clip = (p: number, q: number) => {
      if (Math.abs(p) < 1e-9) return q >= 0;
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      return true;
    };
    if (!clip(-dx, px - x) || !clip(dx, x + w - px) || !clip(-dy, py - y) || !clip(dy, y + h - py)) continue;
    if (t1 - t0 < 2) continue;
    const j = o.jitter ?? 1.5;
    const ta = t0 + r.range(0, j * 2);
    const tb = t1 - r.range(0, j * 2);
    d += `M${P(px + dx * ta, py + dy * ta)}L${P(px + dx * tb, py + dy * tb)}`;
  }
  return d;
}

/** Arrow from (x1,y1) to (x2,y2): bowed shaft + two head strokes. */
export function arrow(x1: number, y1: number, x2: number, y2: number, o: {seed?: Seed; head?: number; bow?: number; spread?: number} = {}): string {
  const seed = o.seed ?? autoSeed(x1, y1, x2, y2);
  const r = rng(seed);
  const head = o.head ?? 18;
  const spread = (o.spread ?? 30) * D2R;
  const shaft = line(x1, y1, x2, y2, {seed: `${seed}/s`, over: [r.range(0, 4), 0], bow: o.bow});
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI;
  const h1 = `M${P(x2 + Math.cos(a - spread) * head, y2 + Math.sin(a - spread) * head)}L${P(x2, y2)}`;
  const h2 = `L${P(x2 + Math.cos(a + spread) * head * r.range(0.85, 1.1), y2 + Math.sin(a + spread) * head * r.range(0.85, 1.1))}`;
  return shaft + h1 + h2;
}

/** Check mark (one continuous stroke: short down-stroke, long up-stroke) centred at (x,y). */
export function check(x: number, y: number, size = 80, o: {seed?: Seed} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, size, 1));
  const s = size;
  const a: Pt = [x - 0.38 * s, y + 0.02 * s + r.jitter(0.03 * s)];
  const b: Pt = [x - 0.12 * s, y + 0.42 * s];
  const c: Pt = [x + 0.42 * s + r.jitter(0.03 * s), y - 0.5 * s];
  return `M${P(...a)}Q${P(a[0] + 0.12 * s, b[1] - 0.15 * s)} ${P(...b)}Q${P(x + 0.1 * s, y - 0.05 * s)} ${P(...c)}`;
}

/** Cross mark: two overshooting diagonal strokes centred at (x,y). */
export function cross(x: number, y: number, size = 80, o: {seed?: Seed} = {}): string {
  const seed = o.seed ?? autoSeed(x, y, size, 2);
  const h = size / 2;
  return (
    line(x - h, y - h, x + h, y + h, {seed: `${seed}/a`, over: [2, 6], bow: size * 0.03}) +
    line(x + h, y - h, x - h, y + h, {seed: `${seed}/b`, over: [2, 8], bow: size * 0.03})
  );
}

/** Text placeholder lines (documents, notices, web pages). First line = heading (shorter) unless heading=false. */
export function textLines(x: number, y: number, w: number, o: {seed?: Seed; n?: number; gap?: number; heading?: boolean; align?: 'left' | 'center'} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, w, 9));
  const n = o.n ?? 4;
  const gap = o.gap ?? 22;
  let d = '';
  for (let i = 0; i < n; i++) {
    const frac = i === 0 && o.heading !== false ? r.range(0.3, 0.45) : i === n - 1 ? r.range(0.35, 0.6) : r.range(0.72, 1);
    const lw = w * frac;
    const lx = o.align === 'center' ? x + (w - lw) / 2 : x;
    const ly = y + i * gap + (i > 0 && o.heading !== false ? gap * 0.35 : 0);
    d += `M${P(lx, ly + r.jitter(0.6))}L${P(lx + lw, ly + r.jitter(0.8))}`;
  }
  return d;
}

/** Scattered little wall marks ("-", "L", "_|", "⌐") like the reference brick ticks. */
export function wallTicks(x: number, y: number, w: number, h: number, o: {seed?: Seed; n?: number; size?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, w, h, 5));
  const n = o.n ?? Math.max(3, Math.round((w * h) / 22000));
  const s = o.size ?? 22;
  let d = '';
  for (let i = 0; i < n; i++) {
    const px = x + r.range(0.05, 0.95) * w;
    const py = y + r.range(0.05, 0.95) * h;
    const L = s * r.range(0.6, 1.3);
    const kind = r.int(0, 3);
    if (kind === 0) d += `M${P(px, py)}L${P(px + L, py + r.jitter(0.6))}`;
    else if (kind === 1) d += `M${P(px, py - L * 0.45)}L${P(px, py)}L${P(px + L, py)}`;
    else if (kind === 2) d += `M${P(px, py)}L${P(px + L, py)}L${P(px + L, py - L * 0.45)}`;
    else d += `M${P(px, py + L * 0.45)}L${P(px, py)}L${P(px + L, py)}`;
  }
  return d;
}

/** Small speed / motion marks: n short parallel strokes trailing behind a moving object (pointing -dir). */
export function speedLines(x: number, y: number, o: {seed?: Seed; n?: number; len?: number; gap?: number; angle?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, 11));
  const n = o.n ?? 3;
  const len = o.len ?? 30;
  const gap = o.gap ?? 12;
  const a = (o.angle ?? 180) * D2R;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  let d = '';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * gap;
    const sx = x - uy * off + ux * r.range(0, len * 0.3);
    const sy = y + ux * off + uy * r.range(0, len * 0.3);
    const l = len * r.range(0.6, 1);
    d += `M${P(sx, sy)}L${P(sx + ux * l, sy + uy * l)}`;
  }
  return d;
}

/** Zig-zag scribble (crossing things out). */
export function scribble(x: number, y: number, w: number, h: number, o: {seed?: Seed; n?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, w, h, 13));
  const n = o.n ?? 6;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n + r.jitter(w * 0.03), i % 2 ? y + h + r.jitter(h * 0.1) : y + r.jitter(h * 0.1)]);
  return smooth(pts, {tension: 0.3});
}

// ---------------------------------------------------------------- closed shapes for fills

/** Plain closed rectangle path (fills). */
export const rectPath = (x: number, y: number, w: number, h: number) => `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;

/** Rounded rectangle; closed (fills) or as one pen stroke with a slight overlap (closed=false, for Ink). */
export function roundRect(x: number, y: number, w: number, h: number, rad: number, o: {seed?: Seed; closed?: boolean} = {}): string {
  const rr = Math.min(rad, w / 2, h / 2);
  const r = rng(o.seed ?? autoSeed(x, y, w, h, rad));
  const j = (a: number) => a + r.jitter(0.6);
  let d = `M${P(x + rr, y)}H${r1(j(x + w - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w, y + rr)}V${r1(j(y + h - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w - rr, y + h)}H${r1(j(x + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x, y + h - rr)}V${r1(j(y + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + rr, y)}`;
  if (o.closed === false) d += `H${r1(x + rr + Math.min(w * 0.12, 14))}`;
  else d += 'Z';
  return d;
}

/** Closed polygon path (fills). */
export const polyPath = (points: Pt[]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';

/** Shoulders / torso silhouette (back view): bottom-centre at (x,y), shoulder width w, height h.
 *  round = shoulder corner radius as a fraction of w (0.38 = soft, round shoulders); flare = extra width at the
 *  bottom (A-line). Open at the bottom (use as Ink and as Fill). */
export function torso(x: number, y: number, w: number, h: number, round = 0.38, flare = 0.06): string {
  const hw = w / 2;
  const bx = hw * (1 + flare);
  const R = Math.min(w * round, h * 0.8);
  const top = y - h;
  const k = 0.42;
  return (
    `M${P(x - bx, y)}L${P(x - hw, top + R)}C${P(x - hw, top + R * k)} ${P(x - hw + R * k, top)} ${P(x - hw + R, top)}` +
    `L${P(x + hw - R, top)}C${P(x + hw - R * k, top)} ${P(x + hw, top + R * k)} ${P(x + hw, top + R)}L${P(x + bx, y)}`
  );
}

/** Translate a list of points. */
export const offsetPts = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
