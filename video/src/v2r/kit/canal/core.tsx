// canal/core.tsx: the canal kit's drawing core. Every set in this folder draws through these few pieces:
//   Batch + Paint   many shapes in ONE <Fill> per colour and ONE <Ink> per weight, layer by layer (z-order kept):
//                   hundreds of windows, paving joints or leaves cost a handful of SVG paths, not hundreds.
//   ink()           the line weight for a thing of a given on-screen size (LOD: far things are fill-only).
//   H / proj        a plane's homography (a facade drawn flat in metres, mapped onto its screen quad): CanalWing,
//                   Terrace and the lane use it so a slight 3/4 or a receding wall stays true.
//   T               the scene clock, plus the shared idle clocks from src/v3/film/kit/idle.ts (a palette-free TOOL).
// Colours come only from the palette's role tokens (CM). Nothing fades: shapes pop, grow, slide or switch.

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {polyPath, rectPath, Pt} from '../../../lib/sketch';
import {homography, applyH, Quad} from '../../../lib/persp';
import type {Homography} from '../../../lib/xf';
import {rand, rng, Rng} from '../../../lib/rng';

export type {Pt, Quad, Rng};
export {rand, rng};

// ---------------------------------------------------------------- numbers

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const frac = (v: number) => v - Math.floor(v);
/** Smoothstep of (t - at) / dur. */
export const ease01 = (t: number, at: number, dur: number) => {
  const k = clamp01((t - at) / Math.max(1e-6, dur));
  return k * k * (3 - 2 * k);
};
/** Ease-out cubic of (t - at) / dur. */
export const out01 = (t: number, at: number, dur: number) => 1 - Math.pow(1 - clamp01((t - at) / Math.max(1e-6, dur)), 3);

// ---------------------------------------------------------------- line weight by size (LOD)

/** Ink weight for a thing `px` tall/wide on screen: front 4.8 (> 500 px), mid 3.4, far 2.2, hair 1.6, 0 = fill only. */
export function inkFor(px: number): number {
  if (px >= 520) return INK_PX.front;
  if (px >= 150) return INK_PX.mid;
  if (px >= 55) return INK_PX.far;
  if (px >= 26) return INK_PX.hair;
  return 0;
}

// ---------------------------------------------------------------- Batch: shapes grouped by colour, layer by layer

type InkRun = {w: number; color: string; open: number; parts: string[]};
type Layer = {fills: Map<string, string[]>; inks: Map<string, InkRun>};

/** Collects flat fills (one path per colour) and ink (one path per weight), in z-ordered layers. Pure and cheap:
 *  build it inside a useMemo for the static parts, per frame for the moving ones. */
export class Batch {
  layers: Layer[] = [];
  constructor() {
    this.layer();
  }
  /** Start a new z-level: everything added after it draws over everything before (fills, then that layer's ink). */
  layer(): this {
    this.layers.push({fills: new Map(), inks: new Map()});
    return this;
  }
  private get L(): Layer {
    return this.layers[this.layers.length - 1];
  }
  fill(color: string, d: string): this {
    if (!d) return this;
    const m = this.L.fills;
    const a = m.get(color);
    if (a) a.push(d);
    else m.set(color, [d]);
    return this;
  }
  rect(color: string, x: number, y: number, w: number, h: number): this {
    if (w <= 0.2 || h <= 0.2) return this;
    return this.fill(color, rectPath(x, y, w, h));
  }
  poly(color: string, pts: Pt[]): this {
    return pts.length > 2 ? this.fill(color, polyPath(pts)) : this;
  }
  /** Ink (hand-drawn path data, e.g. from lib/sketch). w 0 = skipped (fill-only LOD). */
  ink(d: string, w: number = INK_PX.mid, color: string = CM.ink, open = 0): this {
    if (!d || w <= 0) return this;
    const key = `${w.toFixed(2)}|${color}|${open}`;
    const m = this.L.inks;
    const a = m.get(key);
    if (a) a.parts.push(d);
    else m.set(key, {w, color, open, parts: [d]});
    return this;
  }
  /** Append another batch's layers (keeps their order, on top of this one's). */
  add(b: Batch): this {
    for (const l of b.layers) this.layers.push(l);
    this.layer();
    return this;
  }
  get empty(): boolean {
    return this.layers.every((l) => l.fills.size === 0 && l.inks.size === 0);
  }
}

export type PaintProps = {
  b: Batch;
  seed: string;
  /** Build time (scene s): fills pop, ink draws on (all strokes of a layer together). Omit = already there. */
  at?: number;
  /** Seconds between layers when building. */
  stagger?: number;
  /** false = exact registration (tiny things whose fill would slip off their ink). Default: the house offset. */
  misreg?: boolean;
  /** Follow the scene un-build (default true). */
  exit?: boolean;
};

/** Renders a Batch: per layer, one <Fill> per colour then one <Ink> per weight. */
export const Paint: React.FC<PaintProps> = ({b, seed, at, stagger = 0.03, misreg = true, exit = true}) => (
  <>
    {b.layers.map((l, i) => {
      const lat = at === undefined ? undefined : at + i * stagger;
      const out: React.ReactNode[] = [];
      l.fills.forEach((parts, color) => {
        out.push(<Fill key={`f${i}${color}`} d={parts.join('')} color={color} seed={`${seed}/${i}/${color}`} at={lat} offset={misreg ? undefined : false} exit={exit} />);
      });
      l.inks.forEach((run, k) => {
        out.push(<Ink key={`i${i}${k}`} d={run.parts.join('')} width={run.w} color={run.color} seed={`${seed}/${i}/${k}`} at={lat} order="all" open={run.open} exit={exit} />);
      });
      return <React.Fragment key={i}>{out}</React.Fragment>;
    })}
  </>
);

// ---------------------------------------------------------------- planes (a flat drawing mapped onto a screen quad)

/** A plane: local metres (u right, v DOWN from the top edge) mapped onto a screen quad. Used for facades drawn flat
 *  at true proportions and seen frontal, slightly 3/4 or receding. */
export class PlaneMap {
  H: Homography;
  constructor(public wM: number, public hM: number, public quad: Quad) {
    this.H = homography(
      [
        [0, 0],
        [wM, 0],
        [wM, hM],
        [0, hM],
      ],
      quad,
    );
  }
  /** Screen point of local (u, v) metres. */
  p(u: number, v: number): Pt {
    return applyH(this.H, u, v);
  }
  /** Screen polygon of a local rect (u, v, w, h) in metres: TL, TR, BR, BL. */
  q(u: number, v: number, w: number, h: number): Pt[] {
    return [this.p(u, v), this.p(u + w, v), this.p(u + w, v + h), this.p(u, v + h)];
  }
  /** Local screen scale (px per metre, horizontal) at local u. */
  pxPerM(u: number, v = this.hM / 2): number {
    const a = this.p(u, v);
    const b = this.p(u + 0.1, v);
    return Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1;
  }
  /** Local u (metres) whose screen x is `x` along the line v. Bisection (monotone along a facade). */
  uAt(x: number, v = this.hM / 2): number {
    let lo = -this.wM;
    let hi = this.wM * 2;
    const inc = this.p(this.wM, v)[0] > this.p(0, v)[0];
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2;
      const sx = this.p(m, v)[0];
      if (sx < x === inc) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }
  /** Local v whose screen y is `y` at local u. */
  vAt(y: number, u: number): number {
    let lo = -this.hM;
    let hi = this.hM * 2;
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2;
      if (this.p(u, m)[1] < y) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }
}

// ---------------------------------------------------------------- small shape helpers (screen space)

/** Path of a polygon (no ink): a filled quad from 4 points. */
export const quadPath = (q: Pt[]) => polyPath(q);

/** A closed lens/leaf shape centred at (x, y), length L, width w, angle (deg). */
export function leafPath(x: number, y: number, L: number, w: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = -uy;
  const ny = ux;
  const ax = x - (ux * L) / 2;
  const ay = y - (uy * L) / 2;
  const bx = x + (ux * L) / 2;
  const by = y + (uy * L) / 2;
  return `M${P(ax, ay)}Q${P(x + nx * w, y + ny * w)} ${P(bx, by)}Q${P(x - nx * w, y - ny * w)} ${P(ax, ay)}Z`;
}

/** Closed ellipse path (fills) without wobble: cheap for tiny things. */
export function ovalPath(cx: number, cy: number, rx: number, ry: number): string {
  if (rx <= 0 || ry <= 0) return '';
  return `M${P(cx - rx, cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${P(cx + rx, cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${P(cx - rx, cy)}Z`;
}

/** Closed half-ellipse (dome) path: flat bottom at y, height h. */
export function domePath(cx: number, y: number, rx: number, h: number): string {
  return `M${P(cx - rx, y)}A${r1(rx)} ${r1(h)} 0 0 1 ${P(cx + rx, y)}Z`;
}

/** A soft lobed cloud / bush mass from a row of circles (closed outline along the top, flat bottom). */
export function lobes(x0: number, x1: number, base: number, hMax: number, seed: string, n?: number): string {
  const r = rng(seed);
  const k = n ?? Math.max(3, Math.round((x1 - x0) / Math.max(18, hMax * 0.9)));
  const pts: Pt[] = [];
  let d = `M${P(x0, base)}`;
  for (let i = 0; i < k; i++) {
    const xa = x0 + ((x1 - x0) * i) / k;
    const xb = x0 + ((x1 - x0) * (i + 1)) / k;
    const mid = (i + 0.5) / k;
    const env = Math.sin(Math.PI * (0.15 + 0.7 * mid));
    const h = hMax * (0.55 + 0.45 * env) * r.range(0.8, 1.1);
    const ry = h * 0.62;
    const rx = (xb - xa) * 0.62;
    d += `L${P(xa, base - h + ry)}A${r1(rx)} ${r1(ry)} 0 0 1 ${P(xb, base - h + ry * r.range(0.85, 1.05))}`;
    pts.push([xa, base - h]);
  }
  return d + `L${P(x1, base)}Z`;
}

/** Seeded pick from the palette's hair colours / coats. */
export const pickOf = <T,>(arr: readonly T[], seed: string, key: string | number = 0): T => arr[Math.floor(rand(seed, key) * arr.length) % arr.length];

/** Screen polyline (open) as hand-drawn joined stroke points -> simple path (no overshoot). */
export const pl = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('');

/** Width of the canvas (1080) and height (1920); the caption band no set may draw into (y 317-556). */
export const FRAME = {w: 1080, h: 1920, band: [317, 556] as [number, number]} as const;
