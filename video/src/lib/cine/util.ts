// cine/util.ts — small shared helpers for the cinematic kit: hex colour mixing, a fast path builder for
// BATCHED geometry (thousands of windows in one <path>), module-level memo caches.
//
//   mix('#547977', '#2B1B0A', 0.3)          // flat mixed colour (memoised)
//   const pb = new PathBuf(); pb.rect(10, 10, 4, 6); pb.quad(a, b, c, d); <path d={pb.d} />

import type {Pt} from '../sketch';
import {line as skLine} from '../sketch';
import {rng as skRng} from '../rng';

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const r2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------- colour

const rgbCache = new Map<string, [number, number, number]>();
export function hexToRgb(h: string): [number, number, number] {
  let v = rgbCache.get(h);
  if (!v) {
    let s = h.replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    rgbCache.set(h, v);
  }
  return v;
}
const hx = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export const rgbToHex = (r: number, g: number, b: number) => `#${hx(r)}${hx(g)}${hx(b)}`.toUpperCase();

const mixCache = new Map<string, string>();
/** Flat mix of two hex colours (t = 0 -> a, 1 -> b). Memoised. */
export function mix(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const k = `${a}|${b}|${t.toFixed(3)}`;
  let v = mixCache.get(k);
  if (!v) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    v = rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
    if (mixCache.size > 5000) mixCache.clear();
    mixCache.set(k, v);
  }
  return v;
}

/** Relative luminance 0..1 (sRGB, rough). Used to pick cream vs ink text on a sky. */
export function luma(h: string): number {
  const [r, g, b] = hexToRgb(h);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// ---------------------------------------------------------------- batched paths

/** String builder for one big path made of many closed shapes (rects, quads, polys, circles). */
export class PathBuf {
  private parts: string[] = [];
  private q: (n: number) => number;
  /** precision: decimals kept (1 default; use 2-3 for geometry that a camera zooms into 10x+). */
  constructor(precision = 1) {
    const k = Math.pow(10, precision);
    this.q = precision === 1 ? r1 : (n: number) => Math.round(n * k) / k;
  }
  rect(x: number, y: number, w: number, h: number) {
    if (w <= 0 || h <= 0) return this;
    const q = this.q;
    this.parts.push(`M${q(x)} ${q(y)}h${q(w)}v${q(h)}h${q(-w)}z`);
    return this;
  }
  quad(a: Pt, b: Pt, c: Pt, d: Pt) {
    const q = this.q;
    this.parts.push(`M${q(a[0])} ${q(a[1])}L${q(b[0])} ${q(b[1])}L${q(c[0])} ${q(c[1])}L${q(d[0])} ${q(d[1])}z`);
    return this;
  }
  poly(pts: Pt[], close = true) {
    if (pts.length < 2) return this;
    const q = this.q;
    this.parts.push(pts.map(([x, y], i) => `${i ? 'L' : 'M'}${q(x)} ${q(y)}`).join('') + (close ? 'z' : ''));
    return this;
  }
  circle(cx: number, cy: number, r: number) {
    if (r <= 0) return this;
    const q = this.q;
    this.parts.push(`M${q(cx - r)} ${q(cy)}a${q(r)} ${q(r)} 0 1 0 ${q(2 * r)} 0a${q(r)} ${q(r)} 0 1 0 ${q(-2 * r)} 0z`);
    return this;
  }
  raw(d: string) {
    if (d) this.parts.push(d);
    return this;
  }
  get empty() {
    return this.parts.length === 0;
  }
  get d() {
    return this.parts.join('');
  }
}

// ---------------------------------------------------------------- memo

/** Module-level memo for expensive pure geometry (keyed by a string; bounded). */
export function memoize<V>(cache: Map<string, V>, key: string, make: () => V, max = 400): V {
  let v = cache.get(key);
  if (v === undefined) {
    v = make();
    if (cache.size > max) cache.clear();
    cache.set(key, v);
  }
  return v;
}

/** Smooth 0..1 hash noise in time (sum of sines), deterministic per phase. Range ~[-1, 1]. */
export const drift = (t: number, hz: number, ph: number) => 0.62 * Math.sin(t * hz * 6.2832 + ph) + 0.38 * Math.sin(t * hz * 2.31 * 6.2832 + ph * 1.7);

// ---------------------------------------------------------------- hand-drawn line helpers

/** A long hand-drawn line broken into pen strokes every `every` px (random in the range) with `gap` px gaps
 *  (reference 1: step nosings, paving joints, long mouldings never run unbroken). Screen px. */
export function brokenLine(x1: number, y1: number, x2: number, y2: number, o: {seed: string; every?: [number, number]; gap?: [number, number]; over?: [number, number]} = {seed: 'bl'}): string {
  const r = skRng(`bl/${o.seed}`);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return '';
  const [e0, e1] = o.every ?? [80, 160];
  const [g0, g1] = o.gap ?? [6, 14];
  let d = '';
  let s = 0;
  let i = 0;
  while (s < len) {
    const seg = Math.min(len - s, r.range(e0, e1));
    const a = s / len;
    const b = (s + seg) / len;
    const first = s === 0;
    const last = s + seg >= len - 0.5;
    d += skLine(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b, {seed: `${o.seed}/${i++}`, over: [first ? o.over?.[0] ?? 0 : 0, last ? o.over?.[1] ?? 0 : 0], breaks: false, bow: 0.4});
    s += seg + r.range(g0, g1);
  }
  return d;
}
