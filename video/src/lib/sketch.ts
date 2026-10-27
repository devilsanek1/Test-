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
import {isClean as strictPen, PEN as PEN_CFG} from './pen';

export type Pt = [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
const D2R = Math.PI / 180;

const autoSeed = (...n: number[]) => n.map((v) => Math.round(v)).join(',');

/** Pen mode, set once per film bundle at import time. 'loose' (default) = the house sketch line above, unchanged.
 *  'clean' = the owner's clean, refined, premium line (2026-10-27, after v3 G5b: "too rough and messy"): every line is ONE
 *  smooth, confident stroke (no overshoot, breaks, drift or jitter, a hair of bow), loops close cleanly with a low wobble.
 *  Explicit opts can't undo it. v2r sets it in `src/v2r/pen.ts`. */
export type PenMode = 'loose' | 'clean';
let PEN: PenMode = 'loose';
export const setPenMode = (m: PenMode): void => {
  PEN = m;
  PATH_CACHE.clear();
};
export const penMode = (): PenMode => PEN;
// The FULL clean pen (lib/pen.ts setPen('clean'): v3's rework) is stricter than 'clean' above and is read at call time
// (strictPen()): every rect / closed poly / loop is ONE subpath closed with Z, straight lines are ruler-true (no bow),
// loops are true ellipses (wobble <= 0.01 only when asked), polylines are one joined stroke, no glint pairs, and the
// texture marks and board notation (hatch, scribbleMass, wallTicks, crownTicks, speedLines, scribble, cross) draw
// nothing (docs/look/CRAFT.md §c). Off by default: v1 / v2 / v2r paths are byte-identical.

// ---------------------------------------------------------------- memoisation
// All path generators are pure, so results are cached by (name, args). Kit components call them on every
// frame; the cache turns that into a Map lookup.
const PATH_CACHE = new Map<string, string>();
function memo<A extends unknown[]>(name: string, fn: (...a: A) => string): (...a: A) => string {
  return (...args: A) => {
    const key = (strictPen() ? '!' : '') + name + JSON.stringify(args);
    let v = PATH_CACHE.get(key);
    if (v === undefined) {
      v = fn(...args);
      if (PATH_CACHE.size > 200000) PATH_CACHE.clear();
      PATH_CACHE.set(key, v);
    }
    return v;
  };
}

// ---------------------------------------------------------------- lines

/** Overshoot presets (style bible 3): small details 3-8, windows/doors/frames 6-15, structural 30-62 px. */
export type OverPreset = 'none' | 'small' | 'medium' | 'structural';

export type LineOpts = {
  seed?: Seed;
  /** Overshoot past the ends (px). number = both ends (randomised 0.5-1.4x); [start, end] = exact;
   *  a preset ('small' | 'medium' | 'structural' | 'none'). Default per end: ~20% clean, ~65% medium-ish
   *  (scaled by length), ~15% long "construction" tail. */
  over?: number | [number, number] | OverPreset;
  /** Max sideways bow (px), random sign. Default ~0.4% of length (min 0.4). */
  bow?: number;
  /** Endpoint jitter (px). Default 0.8. */
  jitter?: number;
  /** Off-axis drift in degrees (default random 0.3-1; near-vertical lines get 40% of it). 0 = ruler-true. */
  drift?: number;
  /** Lines longer than 400 px are drawn as 2-4 pen strokes with 6-16 px gaps (style bible 3). Default true. */
  breaks?: boolean;
};

const OVER_RANGES: Record<Exclude<OverPreset, 'none'>, [number, number]> = {small: [3, 8], medium: [6, 15], structural: [30, 62]};

/** Board-mode pen (docs/look/STORYBOARD_STYLE.md §2, §6): one clean round-capped stroke per edge, a small overshoot
 *  (none on the subject), no breaks in long lines, low jitter and drift. Spread it into line / rect / poly / arrow opts. */
export const boardPen = (subject = false): LineOpts => ({over: subject ? 'none' : 'small', breaks: false, jitter: 0.5, drift: 0.2});
/** Board-mode loop for ellipse() / circle(): low wobble, the ends meet (subject) or overlap by at most ~6 px. */
export const boardLoop = (radius: number, subject = false): CircleOpts => ({
  wobble: 0.012,
  overlap: subject ? 0 : Math.min(12, (6 / Math.max(1, radius)) * (180 / Math.PI)),
});

function overs(r: Rng, over: LineOpts['over'], len: number): [number, number] {
  if (Array.isArray(over)) return over;
  if (typeof over === 'number') return [over * r.range(0.5, 1.4), over * r.range(0.5, 1.4)];
  if (over === 'none') return [0, 0];
  if (over) {
    const [lo, hi] = OVER_RANGES[over];
    return [r.range(lo, hi), r.range(lo, hi)];
  }
  const base = Math.min(14, Math.max(4, len * 0.05));
  const end = () => {
    const k = r.next();
    if (k < 0.2) return r.range(0, 2);
    if (k < 0.85 || len < 50) return base * r.range(0.5, 1.3);
    return Math.min(40, base * r.range(1.8, 3.2));
  };
  return [end(), end()];
}

const quadAt = (p0: number, c: number, p1: number, t: number) => (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * c + t * t * p1;

/** A single hand-drawn straight stroke from (x1,y1) to (x2,y2): overshoots, drifts slightly off-axis, bows a
 *  hair, and (if > 400 px) is broken into 2-4 strokes with small gaps. */
function _line(x1: number, y1: number, x2: number, y2: number, o: LineOpts = {}): string {
  if (strictPen()) o = {...o, over: 'none', breaks: false, jitter: 0, drift: 0, bow: 0};
  else if (PEN === 'clean') o = {...o, over: 'none', breaks: false, jitter: 0, drift: 0, bow: Math.min(o.bow ?? 0.3, 0.3)};
  const r = rng(o.seed ?? autoSeed(x1, y1, x2, y2));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const [o1, o2] = overs(r, o.over, len);
  const j = o.jitter ?? 0.8;
  const vertical = Math.abs(uy) > 0.9;
  const driftDeg = (o.drift ?? r.range(0.3, 1)) * (vertical ? 0.4 : 1) * r.sign();
  const dOff = Math.tan(driftDeg * D2R) * len; // perpendicular offset of the end point
  const ax = x1 - ux * o1 + r.jitter(j);
  const ay = y1 - uy * o1 + r.jitter(j);
  const bx = x2 + ux * o2 - uy * dOff + r.jitter(j);
  const by = y2 + uy * o2 + ux * dOff + r.jitter(j);
  const bow = (o.bow ?? Math.max(0.4, len * 0.004)) * r.range(-1, 1);
  const cx = (ax + bx) / 2 - uy * bow * 2;
  const cy = (ay + by) / 2 + ux * bow * 2;
  const total = len + o1 + o2;
  if (o.breaks === false || total <= 400) return `M${P(ax, ay)}Q${P(cx, cy)} ${P(bx, by)}`;
  // break into n strokes with small gaps (sub-curves of the same quadratic)
  const n = total > 800 ? r.int(3, 4) : r.int(2, 3);
  const cuts: number[] = [0];
  for (let i = 1; i < n; i++) cuts.push(i / n + r.jitter(0.25 / n));
  cuts.push(1);
  let d = '';
  for (let i = 0; i < n; i++) {
    const gap = i > 0 ? r.range(6, 16) / total : 0;
    const t0 = cuts[i] + gap / 2;
    const t1 = cuts[i + 1] - (i < n - 1 ? r.range(3, 8) / total : 0);
    if (t1 <= t0) continue;
    const p0x = quadAt(ax, cx, bx, t0);
    const p0y = quadAt(ay, cy, by, t0);
    const p1x = quadAt(ax, cx, bx, t1);
    const p1y = quadAt(ay, cy, by, t1);
    // control point of the sub-curve: B(t0) + (t1-t0) * B'(t0)/2
    const qx = p0x + (t1 - t0) * ((1 - t0) * (cx - ax) + t0 * (bx - cx));
    const qy = p0y + (t1 - t0) * ((1 - t0) * (cy - ay) + t0 * (by - cy));
    d += `M${P(p0x, p0y)}Q${P(qx, qy)} ${P(p1x, p1y)}`;
  }
  return d;
}
export const line = memo('line', _line);

/** Horizontal line helper. */
export const hline = (x1: number, x2: number, y: number, o: LineOpts = {}) => line(x1, y, x2, y, o);
/** Vertical line helper. */
export const vline = (x: number, y1: number, y2: number, o: LineOpts = {}) => line(x, y1, x, y2, o);

export type RectOpts = LineOpts & {
  /** Which edges to draw, in drawing order: any of 't','l','r','b'. Default 'tlrb'. */
  edges?: string;
  /** Probability (0..1) of leaving the right or bottom edge un-inked (style bible: 20-40% of contours open). */
  open?: number;
};

/** Rectangle as separate edge strokes that overshoot at the corners (reference windows/boards/facades). */
function _rect(x: number, y: number, w: number, h: number, o: RectOpts = {}): string {
  if (strictPen()) return cleanRect(x, y, w, h, o.edges ?? 'tlrb');
  const seed = o.seed ?? autoSeed(x, y, w, h);
  const r = rng(seed);
  let edges = o.edges ?? 'tlrb';
  if (o.open && r.chance(o.open)) edges = edges.replace(r.chance(0.55) ? 'r' : 'b', '');
  const base: LineOpts = {over: o.over, bow: o.bow, jitter: o.jitter, drift: o.drift ?? r.range(0.1, 0.5), breaks: o.breaks};
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
export const rect = memo('rect', _rect);

/** Clean pen rect: all four edges = ONE closed subpath (corners softened by a radius hidden under the line); some edges
 *  = one joined stroke per run of adjacent edges (clockwise t, r, b, l), never a random open edge. */
function cleanRect(x: number, y: number, w: number, h: number, edges: string): string {
  const has = (e: string) => edges.includes(e);
  if (has('t') && has('r') && has('b') && has('l')) {
    const rr = Math.min(PEN_CFG.corner.max, PEN_CFG.corner.k * Math.min(Math.abs(w), Math.abs(h)));
    if (rr < 0.5) return `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;
    return (
      `M${P(x + rr, y)}H${r1(x + w - rr)}Q${P(x + w, y)} ${P(x + w, y + rr)}V${r1(y + h - rr)}Q${P(x + w, y + h)} ${P(x + w - rr, y + h)}` +
      `H${r1(x + rr)}Q${P(x, y + h)} ${P(x, y + h - rr)}V${r1(y + rr)}Q${P(x, y)} ${P(x + rr, y)}Z`
    );
  }
  const cyc: [string, Pt, Pt][] = [
    ['t', [x, y], [x + w, y]],
    ['r', [x + w, y], [x + w, y + h]],
    ['b', [x + w, y + h], [x, y + h]],
    ['l', [x, y + h], [x, y]],
  ];
  const miss = cyc.findIndex(([e]) => !has(e));
  let d = '';
  let open = false;
  for (let k = 1; k <= 4; k++) {
    const [e, a, b] = cyc[(miss + k) % 4];
    if (!has(e)) {
      open = false;
      continue;
    }
    if (!open) d += `M${P(a[0], a[1])}`;
    d += `L${P(b[0], b[1])}`;
    open = true;
  }
  return d;
}

export type PolyOpts = LineOpts & {
  closed?: boolean;
  /** true: one continuous stroke (slight vertex jitter). false (default): one overshooting stroke per segment. */
  joined?: boolean;
};

/** Polyline through points. Default: each segment its own overshooting stroke (roofs, frames, perspective lines). */
function _poly(points: Pt[], o: PolyOpts = {}): string {
  if (strictPen()) return points.length < 2 ? '' : points.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + (o.closed ? 'Z' : '');
  const seed = o.seed ?? autoSeed(...points.flat());
  const pts = o.closed ? [...points, points[0]] : points;
  if (o.joined) {
    const r = rng(seed);
    const j = PEN === 'clean' ? 0 : o.jitter ?? 0.8;
    return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x + r.jitter(j), y + r.jitter(j))}`).join('');
  }
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], {over: o.over, bow: o.bow, jitter: o.jitter, drift: o.drift, breaks: o.breaks, seed: `${seed}/${i}`}));
  }
  return out.join('');
}
export const poly = memo('poly', _poly);

// ---------------------------------------------------------------- curves

/** Smooth Catmull-Rom curve through points (cubic beziers). tension 0.5 = standard. */
function _smooth(points: Pt[], o: {closed?: boolean; tension?: number} = {}): string {
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
export const smooth = memo('smooth', _smooth);

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
  const clean = PEN === 'clean';
  const wob = strictPen() ? Math.min(o.wobble ?? 0, 0.01) : clean ? Math.min(o.wobble ?? 0.008, 0.008) : o.wobble ?? 0.035;
  const a0 = (o.start ?? r.range(0, 360)) * D2R;
  const over = closedLoop ? 0 : clean ? 3 * D2R : (o.overlap ?? r.range(-8, 28)) * D2R;
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
function _ellipse(cx: number, cy: number, rx: number, ry: number, o: CircleOpts = {}): string {
  // clean pen: the same closed loop as blob() (so the line sits exactly on its fill), closed with Z
  if (strictPen()) return smooth(ellipsePts(cx, cy, rx, ry, o, true), {closed: true});
  return smooth(ellipsePts(cx, cy, rx, ry, o, false));
}
export const ellipse = memo('ellipse', _ellipse);

/** Hand-drawn circle outline. */
export const circle = (cx: number, cy: number, rad: number, o: CircleOpts = {}) => ellipse(cx, cy, rad, rad, o);

/** Closed wobbly blob (for fills under circles/ellipses). Same wobble family as ellipse(). */
function _blob(cx: number, cy: number, rx: number, ry: number, o: CircleOpts = {}): string {
  return smooth(ellipsePts(cx, cy, rx, ry, o, true), {closed: true});
}
export const blob = memo('blob', _blob);

/** Partial ellipse arc from a0 to a1 (degrees, clockwise when a1 > a0). Slight wobble. */
function _arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, o: {seed?: Seed; wobble?: number} = {}): string {
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, a0, a1));
  const wob = strictPen() ? Math.min(o.wobble ?? 0, 0.01) : o.wobble ?? 0.02;
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
export const arc = memo('arc', _arc);

/** Sagging wire / cable from (x1,y1) to (x2,y2); sag in px (positive = down). */
function _wire(x1: number, y1: number, x2: number, y2: number, sag = 18, o: LineOpts = {}): string {
  const r = rng(o.seed ?? autoSeed(x1, y1, x2, y2, sag));
  const [o1, o2] = strictPen() ? [0, 0] : Array.isArray(o.over) ? o.over : [r.range(2, 10), r.range(2, 10)];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return `M${P(x1 - ux * o1, y1 - uy * o1)}Q${P((x1 + x2) / 2, (y1 + y2) / 2 + sag * 2)} ${P(x2 + ux * o2, y2 + uy * o2)}`;
}
export const wire = memo('wire', _wire);

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
function _crown(cx: number, cy: number, rx: number, ry: number, o: CrownOpts = {}): string {
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
export const crown = memo('crown', _crown);

/** Small "smile" ticks inside a crown (the reference's leaf marks). */
function _crownTicks(cx: number, cy: number, rx: number, ry: number, o: {seed?: Seed; n?: number; size?: number} = {}): string {
  if (strictPen()) return ''; // texture made of strokes: G3 only
  const r = rng(o.seed ?? autoSeed(cx, cy, rx, ry, 7));
  const n = o.n ?? Math.max(3, Math.min(7, Math.round((rx * ry) / 1800)));
  const s = o.size ?? Math.max(6, Math.min(12, rx * 0.095));
  let d = '';
  // ticks hug the rim (lower half + sides), never the centre, so no accidental "faces"
  const a0 = r.range(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    let a = a0 + i * 2.39996 + r.jitter(0.3);
    if (Math.sin(a) < -0.3) a = -a; // flip upper-rim ticks to the lower half
    const rr = r.range(0.58, 0.78);
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    const w = s * r.range(0.6, 1.2);
    const tilt = Math.cos(a) * 0.35 + r.jitter(0.15);
    d += `M${P(x - w, y - w * (0.32 + tilt))}C${P(x - w * 0.75, y + w * 0.38)} ${P(x + w * 0.75, y + w * 0.38)} ${P(x + w, y - w * (0.32 - tilt))}`;
  }
  return d;
}
export const crownTicks = memo('crownTicks', _crownTicks);

// ---------------------------------------------------------------- marks & details

/** Window glint: two parallel diagonal strokes "//" (default rising to the right). */
function _glint(x: number, y: number, len = 40, o: {seed?: Seed; angle?: number; gap?: number} = {}): string {
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
  if (strictPen()) return `M${P(x, y)}L${P(x + ux * len * 0.8, y + uy * len * 0.8)}`; // one light stroke, never a pair
  return `M${P(x, y)}L${P(x + ux * len, y + uy * len)}M${P(ox, oy)}L${P(ox + ux * l2, oy + uy * l2)}`;
}
export const glint = memo('glint', _glint);

/** Parallel hatching clipped to a rect. angle in degrees, gap in px. */
function _hatch(x: number, y: number, w: number, h: number, o: {seed?: Seed; angle?: number; gap?: number; jitter?: number} = {}): string {
  if (strictPen()) return ''; // texture made of strokes: G3 only
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
export const hatch = memo('hatch', _hatch);

/** Scribble mass (G3 placeholder, docs/G3_ANIMATIC.md §3; owner asked for the sketchbook texture, 2026-10-27):
 *  hachure scanlines joined into ONE continuous wandering stroke (boustrophedon, smoothed), per-vertex seeded jitter —
 *  an urban sketcher's "indication" of a dense surface. At 25 % scale the squiggles melt into flat grey tone.
 *  gap 10-20 px (default 14), jitter 4-8 px (default 6). */
function _scribbleMass(x: number, y: number, w: number, h: number, o: {seed?: Seed; gap?: number; jitter?: number} = {}): string {
  if (strictPen()) return ''; // the G3 placeholder texture never reaches a clean film
  const r = rng(o.seed ?? autoSeed(x, y, w, h));
  const gap = o.gap ?? 14;
  const j = o.jitter ?? 6;
  const pts: Pt[] = [];
  let dir = 1;
  const yEnd = y + h - gap * 0.3;
  for (let yy = y + gap * 0.6; yy <= Math.max(yEnd, y + gap * 0.6); yy += gap * r.range(0.85, 1.2)) {
    const xa = x + r.range(0, j);
    const xb = x + w - r.range(0, j);
    const [x0, x1] = dir > 0 ? [xa, xb] : [xb, xa];
    const segs = Math.max(2, Math.round(w / 80));
    for (let k = 0; k <= segs; k++) {
      const px = x0 + ((x1 - x0) * k) / segs;
      const py = Math.min(y + h, Math.max(y, yy + r.range(-j, j)));
      pts.push([px, py]);
    }
    dir = -dir;
    if (yy > yEnd) break;
  }
  return smooth(pts);
}
export const scribbleMass = memo('scribbleMass', _scribbleMass);

/** Arrow from (x1,y1) to (x2,y2): bowed shaft + two head strokes. breaks / jitter / drift go to the shaft (see LineOpts). */
function _arrow(x1: number, y1: number, x2: number, y2: number,
  o: {seed?: Seed; head?: number; bow?: number; spread?: number} & Pick<LineOpts, 'breaks' | 'jitter' | 'drift'> = {}): string {
  const seed = o.seed ?? autoSeed(x1, y1, x2, y2);
  const r = rng(seed);
  const head = o.head ?? 18;
  const spread = (o.spread ?? 30) * D2R;
  const shaft = line(x1, y1, x2, y2, {seed: `${seed}/s`, over: [r.range(0, 4), 0], bow: o.bow, breaks: o.breaks, jitter: o.jitter, drift: o.drift});
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI;
  const h1 = `M${P(x2 + Math.cos(a - spread) * head, y2 + Math.sin(a - spread) * head)}L${P(x2, y2)}`;
  // the sketch pen draws two separate factors (x, then y): keep both draws, in order, so its paths stay identical
  const hx = strictPen() ? 1 : r.range(0.85, 1.1);
  const hy = strictPen() ? 1 : r.range(0.85, 1.1);
  const h2 = `L${P(x2 + Math.cos(a + spread) * head * hx, y2 + Math.sin(a + spread) * head * hy)}`;
  return shaft + h1 + h2;
}
export const arrow = memo('arrow', _arrow);

/** Check mark (one continuous stroke: short down-stroke, long up-stroke) centred at (x,y). */
function _check(x: number, y: number, size = 80, o: {seed?: Seed} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, size, 1));
  const s = size;
  const jj = strictPen() ? 0 : 0.03 * s;
  const a: Pt = [x - 0.38 * s, y + 0.02 * s + r.jitter(jj)];
  const b: Pt = [x - 0.12 * s, y + 0.42 * s];
  const c: Pt = [x + 0.42 * s + r.jitter(jj), y - 0.5 * s];
  return `M${P(...a)}Q${P(a[0] + 0.12 * s, b[1] - 0.15 * s)} ${P(...b)}Q${P(x + 0.1 * s, y - 0.05 * s)} ${P(...c)}`;
}
export const check = memo('check', _check);

/** Cross mark: two overshooting diagonal strokes centred at (x,y). */
function _cross(x: number, y: number, size = 80, o: {seed?: Seed} = {}): string {
  if (strictPen()) return ''; // board notation: G3 only (CRAFT §c)
  const seed = o.seed ?? autoSeed(x, y, size, 2);
  const h = size / 2;
  return (
    line(x - h, y - h, x + h, y + h, {seed: `${seed}/a`, over: [2, 6], bow: size * 0.03}) +
    line(x + h, y - h, x - h, y + h, {seed: `${seed}/b`, over: [2, 8], bow: size * 0.03})
  );
}
export const cross = memo('cross', _cross);

/** Text placeholder lines (documents, notices, web pages). First line = heading (shorter) unless heading=false. */
function _textLines(x: number, y: number, w: number, o: {seed?: Seed; n?: number; gap?: number; heading?: boolean; align?: 'left' | 'center'} = {}): string {
  const r = rng(o.seed ?? autoSeed(x, y, w, 9));
  const n = o.n ?? 4;
  const gap = o.gap ?? 22;
  let d = '';
  for (let i = 0; i < n; i++) {
    const frac = i === 0 && o.heading !== false ? r.range(0.3, 0.45) : i === n - 1 ? r.range(0.35, 0.6) : r.range(0.72, 1);
    const lw = w * frac;
    const lx = o.align === 'center' ? x + (w - lw) / 2 : x;
    const ly = y + i * gap + (i > 0 && o.heading !== false ? gap * 0.35 : 0);
    const tj = strictPen() ? 0 : 1;
    d += `M${P(lx, ly + r.jitter(0.6 * tj))}L${P(lx + lw, ly + r.jitter(0.8 * tj))}`;
  }
  return d;
}
export const textLines = memo('textLines', _textLines);

/** Scattered little wall marks ("-", "L", "_|", "⌐") like the reference brick ticks. */
function _wallTicks(x: number, y: number, w: number, h: number, o: {seed?: Seed; n?: number; size?: number} = {}): string {
  if (strictPen()) return ''; // texture made of strokes: G3 only
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
export const wallTicks = memo('wallTicks', _wallTicks);

/** Small speed / motion marks: n short parallel strokes trailing behind a moving object (pointing -dir). */
function _speedLines(x: number, y: number, o: {seed?: Seed; n?: number; len?: number; gap?: number; angle?: number} = {}): string {
  if (strictPen()) return ''; // board notation: G3 only
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
export const speedLines = memo('speedLines', _speedLines);

/** Zig-zag scribble (crossing things out). */
function _scribble(x: number, y: number, w: number, h: number, o: {seed?: Seed; n?: number} = {}): string {
  if (strictPen()) return ''; // board notation: G3 only (CRAFT §c)
  const r = rng(o.seed ?? autoSeed(x, y, w, h, 13));
  const n = o.n ?? 6;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n + r.jitter(w * 0.03), i % 2 ? y + h + r.jitter(h * 0.1) : y + r.jitter(h * 0.1)]);
  return smooth(pts, {tension: 0.3});
}
export const scribble = memo('scribble', _scribble);

// ---------------------------------------------------------------- closed shapes for fills

/** Plain closed rectangle path (fills). */
export const rectPath = (x: number, y: number, w: number, h: number) => `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;

/** Rounded rectangle; closed (fills) or as one pen stroke with a slight overlap (closed=false, for Ink). */
function _roundRect(x: number, y: number, w: number, h: number, rad: number, o: {seed?: Seed; closed?: boolean} = {}): string {
  const rr = Math.min(rad, w / 2, h / 2);
  const r = rng(o.seed ?? autoSeed(x, y, w, h, rad));
  const strict = strictPen();
  const j = (a: number) => (strict ? a : a + r.jitter(0.6));
  let d = `M${P(x + rr, y)}H${r1(j(x + w - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w, y + rr)}V${r1(j(y + h - rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + w - rr, y + h)}H${r1(j(x + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x, y + h - rr)}V${r1(j(y + rr))}A${r1(rr)} ${r1(rr)} 0 0 1 ${P(x + rr, y)}`;
  if (o.closed === false && !strict) d += `H${r1(x + rr + Math.min(w * 0.12, 14))}`;
  else d += 'Z';
  return d;
}
export const roundRect = memo('roundRect', _roundRect);

/** Closed polygon path (fills). */
export const polyPath = (points: Pt[]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';

/** Shoulders / torso silhouette (back view): bottom-centre at (x,y), shoulder width w, height h.
 *  round = shoulder corner radius as a fraction of w (0.38 = soft, round shoulders); flare = extra width at the
 *  bottom (A-line). Open at the bottom (use as Ink and as Fill). */
function _torso(x: number, y: number, w: number, h: number, round = 0.38, flare = 0.06): string {
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
export const torso = memo('torso', _torso);

/** Translate a list of points. */
export const offsetPts = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
