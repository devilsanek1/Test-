// dc/core.tsx: the Arlington kit's drawing core (K7, docs/v2/TREATMENT.md sections 6 and 9).
//
//   Batch + Paint   many shapes in ONE <Fill> per colour and ONE <Ink> per weight, layer by layer (z-order kept): a
//                   thousand windows, roofs or petals cost a handful of SVG paths. Static parts build once (useMemo).
//   STEP / atm()    the flat atmospheric steps of a scale wide (CINEMATIC_GUIDE "Scale cues" 5): each farther plane is
//                   ONE fixed mix toward the sky, 0 / 12 / 22 / 40 / 65 %, never a gradient; ink full, full, hairline,
//                   none, none.
//   shapes          lobed crowns, cloud lobes, blossom clusters, small screen-space helpers (paths only).
// Colours come only from the palette's role tokens (CM) and their steps toward the sky. Nothing fades.

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {polyPath, rectPath, type Pt} from '../../../lib/sketch';
import {rand, rng, type Rng} from '../../../lib/rng';

export type {Pt, Rng};
export {rand, rng};

// ---------------------------------------------------------------- numbers

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth01 = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};
/** Smoothstep of (t - at) / dur. */
export const ease01 = (t: number, at: number, dur: number) => smooth01((t - at) / Math.max(1e-6, dur));
export const frac = (v: number) => v - Math.floor(v);

// ---------------------------------------------------------------- colour: flat steps toward the sky

const hex2 = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
};
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const mixCache = new Map<string, string>();
/** sRGB mix a -> b by k (0 = a). Cached. A flat colour step, never drawn as a gradient. */
export function mix(a: string, b: string, k: number): string {
  const key = `${a}|${b}|${k.toFixed(3)}`;
  let v = mixCache.get(key);
  if (!v) {
    const A = hex2(a);
    const B = hex2(b);
    v = toHex(A.map((x, i) => x + (B[i] - x) * k));
    mixCache.set(key, v);
  }
  return v;
}

/** The scale wide's planes, near -> far: deck 0, near-mid 1, mid 2, river 3, far 4 (CINEMATIC_GUIDE Scale cues 5). */
export const STEP = [0, 0.12, 0.22, 0.4, 0.65] as const;
export type Depth = 0 | 1 | 2 | 3 | 4;
/** A role colour seen at plane `d`: one fixed flat mix toward the sky (mint). */
export const atm = (c: string, d: Depth) => (d === 0 ? c : mix(c, CM.sky, STEP[d]));
/** A SHADE colour at plane `d`: it also leans toward the cool shade as it recedes (warm near, dusty-cool far). */
export const atmShade = (c: string, d: Depth) => (d === 0 ? c : mix(mix(c, CM.shadeCool, [0, 0.1, 0.2, 0.3, 0.4][d]), CM.sky, STEP[d]));
/** Ink by plane: full, full, hairline, none, none. */
export const INK_AT: Record<Depth, number> = {0: INK_PX.mid, 1: INK_PX.far, 2: INK_PX.hair, 3: 0, 4: 0};
/** Ink colour by plane (far ink turns toward the shade: never a black line on a pale far plane). */
export const inkCol = (d: Depth) => (d <= 1 ? CM.ink : mix(CM.ink, CM.shadeWarm, 0.45));

// ---------------------------------------------------------------- Batch: shapes grouped by colour, layer by layer

type InkRun = {w: number; color: string; open: number; parts: string[]};
type BLayer = {fills: Map<string, string[]>; inks: Map<string, InkRun>};

/** Collects flat fills (one path per colour) and ink (one path per weight) in z-ordered layers. */
export class Batch {
  layers: BLayer[] = [];
  constructor() {
    this.layer();
  }
  /** Start a new z-level: everything added after it draws over everything before (that level's fills, then its ink). */
  layer(): this {
    this.layers.push({fills: new Map(), inks: new Map()});
    return this;
  }
  private get L(): BLayer {
    return this.layers[this.layers.length - 1];
  }
  fill(color: string, d: string): this {
    if (!d) return this;
    const a = this.L.fills.get(color);
    if (a) a.push(d);
    else this.L.fills.set(color, [d]);
    return this;
  }
  rect(color: string, x: number, y: number, w: number, h: number): this {
    if (w <= 0.15 || h <= 0.15) return this;
    return this.fill(color, rectPath(x, y, w, h));
  }
  poly(color: string, pts: Pt[]): this {
    return pts.length > 2 ? this.fill(color, polyPath(pts)) : this;
  }
  /** Ink (path data, e.g. lib/sketch). w 0 = skipped (fill-only LOD). */
  ink(d: string, w: number = INK_PX.mid, color: string = CM.ink, open = 0): this {
    if (!d || w <= 0) return this;
    const key = `${w.toFixed(2)}|${color}|${open}`;
    const a = this.L.inks.get(key);
    if (a) a.parts.push(d);
    else this.L.inks.set(key, {w, color, open, parts: [d]});
    return this;
  }
  get empty(): boolean {
    return this.layers.every((l) => l.fills.size === 0 && l.inks.size === 0);
  }
}

export type PaintProps = {
  b: Batch;
  seed: string;
  /** Build time (scene s): fills pop, ink draws on. Omit = already there. */
  at?: number;
  stagger?: number;
  /** Misregistration of fills vs ink (screen px, 2-5 by the house rule). false/0 = exact (far planes: no ink). */
  misreg?: number | false;
  /** Divide the misregistration by this (the plane's current scale), so it stays 2-5 px ON SCREEN. */
  misregScale?: number;
  exit?: boolean;
};

/** Renders a Batch: per layer, one <Fill> per colour then one <Ink> per weight. */
export const Paint: React.FC<PaintProps> = ({b, seed, at, stagger = 0.03, misreg = 3, misregScale = 1, exit = true}) => (
  <>
    {b.layers.map((l, i) => {
      const lat = at === undefined ? undefined : at + i * stagger;
      const out: React.ReactNode[] = [];
      l.fills.forEach((parts, color) => {
        let off: [number, number] | false = false;
        if (misreg) {
          const a = rand(`${seed}/${i}/${color}`, 'mx');
          const m = (misreg * (0.75 + 0.5 * rand(`${seed}/${i}/${color}`, 'mm'))) / Math.max(0.05, misregScale);
          off = [Math.cos(a * 6.283) * m * 0.8 + m * 0.4, Math.sin(a * 6.283) * m * 0.5 + m * 0.3];
        }
        out.push(<Fill key={`f${i}${color}`} d={parts.join('')} color={color} seed={`${seed}/${i}/${color}`} at={lat} offset={off} exit={exit} />);
      });
      l.inks.forEach((run, k) => {
        out.push(<Ink key={`i${i}${k}`} d={run.parts.join('')} width={run.w} color={run.color} seed={`${seed}/${i}/${k}`} at={lat} order="all" open={run.open} exit={exit} />);
      });
      return <React.Fragment key={i}>{out}</React.Fragment>;
    })}
  </>
);

// ---------------------------------------------------------------- shapes (path strings)

/** A closed polygon path through points (no ink). */
export const polyD = (pts: Pt[]) => polyPath(pts);

/** A closed smooth blob through points (quadratic midpoints): crowns, cloud lobes, drifts. */
export function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return '';
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${P(...mid(pts[n - 1], pts[0]))}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += `Q${P(pts[i][0], pts[i][1])} ${P(m[0], m[1])}`;
  }
  return d + 'Z';
}

/** A lobed crown (tree, shrub, blossom mass) centred (cx, cy), radii rx/ry, `lobes` bumps, flat-ish base `flat` 0..1. */
export function crownD(cx: number, cy: number, rx: number, ry: number, seed: string, lobes = 9, flat = 0.35): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = lobes * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const bump = i % 2 === 0 ? 1 + r.range(0.04, 0.16) : 1 - r.range(0.04, 0.12);
    let x = Math.cos(a) * rx * bump;
    let y = Math.sin(a) * ry * bump;
    if (y > 0) y *= 1 - flat;
    x += r.jitter(rx * 0.03);
    pts.push([cx + x, cy + y]);
  }
  return smoothClosed(pts);
}

/** A flat lobed cloud: a flat base at `baseY`, lobes along the top (each lobe [x, w, h]). */
export function cloudD(x0: number, x1: number, baseY: number, lobes: [number, number, number][]): string {
  const pts: Pt[] = [[x1, baseY]];
  const sorted = lobes.slice().sort((a, b) => b[0] - a[0]);
  for (const [cx, w, h] of sorted) {
    pts.push([cx + w / 2, baseY - h * 0.45]);
    pts.push([cx + w * 0.32, baseY - h * 0.92]);
    pts.push([cx, baseY - h]);
    pts.push([cx - w * 0.32, baseY - h * 0.92]);
    pts.push([cx - w / 2, baseY - h * 0.45]);
  }
  pts.push([x0, baseY]);
  return smoothClosed(pts);
}

/** A small 5-petal blossom cluster (flat), r = cluster radius: a few overlapping dots. */
export function blossomD(cx: number, cy: number, r: number, seed: string, n = 4): string {
  const g = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = g.range(0, Math.PI * 2);
    const rr = r * g.range(0.35, 0.6);
    const x = cx + Math.cos(a) * r * g.range(0, 0.55);
    const y = cy + Math.sin(a) * r * g.range(0, 0.45);
    d += circleD(x, y, rr);
  }
  return d;
}

/** A closed circle path. */
export const circleD = (cx: number, cy: number, rr: number) => `M${P(cx - rr, cy)}a${r1(rr)} ${r1(rr)} 0 1 0 ${r1(rr * 2)} 0a${r1(rr)} ${r1(rr)} 0 1 0 ${r1(-rr * 2)} 0Z`;
/** A closed ellipse path. */
export const ellD = (cx: number, cy: number, rx: number, ry: number) => `M${P(cx - rx, cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(rx * 2)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-rx * 2)} 0Z`;
/** An open polyline path (ink). */
export const lineD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('');
/** A quadrilateral path. */
export const quadD = (a: Pt, b: Pt, c: Pt, d: Pt) => `M${P(...a)}L${P(...b)}L${P(...c)}L${P(...d)}Z`;
/** A thick polyline as a closed ribbon (roads, rivers seen flat): width at each point. */
export function ribbonD(pts: Pt[], w: number[] | number): string {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const ww = (Array.isArray(w) ? w[i] : w) / 2;
    L.push([pts[i][0] - (dy / len) * ww, pts[i][1] + (dx / len) * ww]);
    R.push([pts[i][0] + (dy / len) * ww, pts[i][1] - (dx / len) * ww]);
  }
  return polyPath([...L, ...R.reverse()]);
}
/** Point at arc-length fraction u (0..1) along a polyline, and its direction (unit). */
export function along(pts: Pt[], u: number): {p: Pt; dir: Pt} {
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(l);
    total += l;
  }
  let s = frac(u) * total;
  for (let i = 0; i < segs.length; i++) {
    if (s <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? s / segs[i] : 0;
      const a = pts[i];
      const b = pts[i + 1];
      const len = segs[i] || 1;
      return {p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], dir: [(b[0] - a[0]) / len, (b[1] - a[1]) / len]};
    }
    s -= segs[i];
  }
  return {p: pts[pts.length - 1], dir: [1, 0]};
}

// ---------------------------------------------------------------- the 4-frame blossom burst

/** Blossom burst (TREATMENT section 6, "the slot's trees burst into blossom in 4 frames"): cluster i of n pops at
 *  at + (i mod 4) frames, overshoots to 1.18 and settles in 3 more frames. Returns the cluster's scale 0..1.18. */
export function burstScale(t: number, at: number | undefined, i: number, fps = 60): number {
  if (at === undefined) return 1;
  const t0 = at + ((i * 7) % 4) / fps;
  if (t < t0) return 0;
  const k = (t - t0) * fps; // frames since its pop
  if (k >= 6) return 1;
  // 0 -> 1.18 over 2 frames, back to 1 over the next 4
  return k < 2 ? 0.25 + (1.18 - 0.25) * (k / 2) : 1.18 - 0.18 * ((k - 2) / 4);
}
