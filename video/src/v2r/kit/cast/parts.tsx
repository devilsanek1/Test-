// K4 cast: the drawing core shared by every figure. A figure is a list of PARTS (back to front), each a closed fill
// path and/or an ink path in the figure's LOCAL px (feet at 0,0, y up = negative, facing LEFT for profile / rear 3/4
// views; a flip mirrors it). <Parts> renders them with the engine's <Fill> / <Ink>, so the Look states (paper / ink
// only / cascade), the time-of-day relight and the un-build all work; <FigureG> places one figure (translate, mirror,
// the optional 4-frame scale settle of a pop) inside ONE <ExitSync> so it leaves as one.
//
// Build ("at"): ink draws on from `at` (the engine's pen pacing, 1 frame between parts), each fill pops 0.15 s after
// (or `fillLag`). No `at` = already built. Nothing fades.

import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitSync} from '../../../lib/exit';
import {mat, XG} from '../../../lib/xf';
import {useTime} from '../../../lib/time';
import {rng, Seed} from '../../../lib/rng';
import {CM} from '../../palette';

export type Pt = [number, number];

/** One drawable piece of a figure. */
export type Part = {
  /** Stable key (also the seed of its misregistration). */
  k: string;
  /** Closed path to fill (local px). */
  d?: string;
  fill?: string;
  /** Ink path (open or closed strokes). '' / undefined = no line. */
  ink?: string;
  /** Ink width multiplier (1 = the figure's ink px). */
  w?: number;
  inkColor?: string;
  /** No misregistration for this fill (tiny details: eyelets, soles). */
  exact?: boolean;
};

// ---------------------------------------------------------------- number formatting + path helpers (pure)

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (x: number, y: number) => `${f(x)} ${f(y)}`;

/** Closed circle as two arcs (fills). */
export const circlePath = (cx: number, cy: number, r: number) => `M${P(cx - r, cy)}A${f(r)} ${f(r)} 0 1 0 ${P(cx + r, cy)}A${f(r)} ${f(r)} 0 1 0 ${P(cx - r, cy)}Z`;
/** Closed ellipse. */
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `M${P(cx - rx, cy)}A${f(rx)} ${f(ry)} 0 1 0 ${P(cx + rx, cy)}A${f(rx)} ${f(ry)} 0 1 0 ${P(cx - rx, cy)}Z`;

/** A hand pen loop round a circle: starts at a seeded angle, overlaps its start by `over` deg (0 = exactly closed),
 *  tiny radius wobble. Deterministic for the seed; the same seed at another size keeps the same character. */
export function penLoop(cx: number, cy: number, rx: number, ry: number, seed: Seed, over = 16, wob = 0.018): string {
  const r = rng(`loop/${seed}`);
  const a0 = r.range(0, Math.PI * 2);
  const ph = r.range(0, 6.28);
  const n = Math.max(10, Math.min(30, Math.round((rx + ry) / 4)));
  const sweep = Math.PI * 2 + (over * Math.PI) / 180;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (sweep * i) / n;
    const k = 1 + wob * Math.sin(2 * a + ph) + wob * 0.5 * Math.sin(3 * a + ph * 1.7);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return curve(pts);
}

/** Catmull-Rom curve through points (open). */
export function curve(pts: Pt[], closed = false, tension = 0.5): string {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const get = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${P(pts[0][0], pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    d += `C${P(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k)} ${P(p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k)} ${P(p2[0], p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

/** Straight polyline (open) / polygon (closed). */
export const polyline = (pts: Pt[], closed = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + (closed ? 'Z' : '');

/** A capsule (limb) from a to b, half-width hw: closed outline (fill and ink). */
export function capsule(a: Pt, b: Pt, hw: number, hwB = hw): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / L;
  const ny = dx / L;
  const a1: Pt = [a[0] + nx * hw, a[1] + ny * hw];
  const a2: Pt = [a[0] - nx * hw, a[1] - ny * hw];
  const b1: Pt = [b[0] + nx * hwB, b[1] + ny * hwB];
  const b2: Pt = [b[0] - nx * hwB, b[1] - ny * hwB];
  return `M${P(...a1)}L${P(...b1)}A${f(hwB)} ${f(hwB)} 0 0 0 ${P(...b2)}L${P(...a2)}A${f(hw)} ${f(hw)} 0 0 0 ${P(...a1)}Z`;
}

/** Tombstone torso (back view): bottom-centre (cx, by), shoulder width w, height h, corner radius as a fraction of w,
 *  hem flare (fraction of the half width). `closed` adds the hem (fills); the ink version is open at the hem. */
export function tomb(cx: number, by: number, w: number, h: number, round = 0.42, flare = 0.06, closed = true): string {
  const hw = w / 2;
  const bx = hw * (1 + flare);
  const R = Math.min(w * round, h * 0.85);
  const top = by - h;
  const k = 0.45;
  const d =
    `M${P(cx - bx, by)}L${P(cx - hw, top + R)}C${P(cx - hw, top + R * k)} ${P(cx - hw + R * k, top)} ${P(cx - hw + R, top)}` +
    `L${P(cx + hw - R, top)}C${P(cx + hw - R * k, top)} ${P(cx + hw, top + R * k)} ${P(cx + hw, top + R)}L${P(cx + bx, by)}`;
  return closed ? d + 'Z' : d;
}

/** A hem stroke under a torso with small gaps at both corners (the open-contour feel). */
export function hemLine(cx: number, by: number, w: number, flare: number, seed: Seed, gap = 0.08): string {
  const r = rng(`hem/${seed}`);
  const hw = (w / 2) * (1 + flare);
  const g1 = hw * 2 * gap * r.range(0.4, 1.2);
  const g2 = hw * 2 * gap * r.range(0.2, 1);
  return `M${P(cx - hw + g1, by + r.jitter(0.6))}L${P(cx + hw - g2, by + r.jitter(0.6))}`;
}

/** Points on a circle arc (angles in degrees, 0 = right, 90 = down). */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Scalloped head (curls): bumps round a circle, closed. */
export function curlsPath(cx: number, cy: number, r: number, seed: Seed, bumps = 9): string {
  const g = rng(`curls/${seed}`);
  const a0 = g.range(0, Math.PI * 2);
  const pts: Pt[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = a0 + ((i + g.jitter(0.15)) / bumps) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  let d = `M${P(pts[0][0], pts[0][1])}`;
  for (let i = 0; i < bumps; i++) {
    const [x2, y2] = pts[(i + 1) % bumps];
    const [x1, y1] = pts[i];
    const rad = Math.hypot(x2 - x1, y2 - y1) * 0.62;
    d += `A${f(rad)} ${f(rad)} 0 0 1 ${P(x2, y2)}`;
  }
  return d + 'Z';
}

// ---------------------------------------------------------------- ink weights, misregistration, level of detail

/** Default on-screen ink px for a figure of height `h` (the depth ladder 4.8 / 3.4 / 2.2 / 1.6; none when tiny). */
export function inkFor(h: number): number {
  if (h >= 240) return 4.8;
  if (h >= 130) return 3.4;
  if (h >= 72) return 2.2;
  if (h >= 42) return 1.6;
  return 0;
}

/** Level of detail for a standing height h: 0 full, 1 simplified, 2 fill-only, 3 dot + bar. */
export type Lod = 0 | 1 | 2 | 3;
export const lodFor = (h: number): Lod => (h >= 105 ? 0 : h >= 42 ? 1 : h >= 16 ? 2 : 3);

/** Fill misregistration for a figure of height h: 2-5 px at full size (TREATMENT), scaled down for small figures. */
export function misregFor(h: number, seed: Seed): [number, number] {
  const r = rng(`mis/${seed}`);
  const k = Math.max(0.3, Math.min(1.7, h / 170));
  return [(2.4 + r.jitter(0.6)) * k, (1.6 + r.jitter(0.5)) * k];
}

// ---------------------------------------------------------------- rendering

export type PartsProps = {
  parts: Part[];
  /** Build start (scene s): ink draws on, then the fills pop. Omit = built. */
  at?: number;
  /** Fill lag after `at` (s). Default 0.15. */
  fillLag?: number;
  /** Ink px (on screen, for the figure). 0 = fill-only. */
  inkPx: number;
  /** Fill misregistration [dx, dy] px; false = exact. */
  offset: [number, number] | false;
  /** Ink draw order: 'seq' (1 frame between parts) or 'all' (every stroke at once: the ghosts' 0.10 s outline). */
  inkOrder?: 'seq' | 'all';
  /** Ink pace budget (s) per part when inkOrder 'all'. */
  inkDur?: number;
  inkColor?: string;
  /** Fill entrance mode (default pop: grow 20 -> 100 % in 0.12 s). */
  fillMode?: 'pop' | 'snap';
  /** Ink only, with the hidden lines knocked out: each part's line is masked by the shapes of the parts in front of
   *  it (the bare outlines: no fill, yet no tangle of hidden strokes). */
  knockout?: boolean;
  seed: Seed;
};

/** Render a figure's parts, back to front: each part's fill, then its ink. */
export const Parts: React.FC<PartsProps> = ({parts, at, fillLag = 0.15, inkPx, offset, inkOrder = 'seq', inkDur, inkColor = CM.ink, fillMode = 'pop', knockout, seed}) => {
  const uid = 'ko' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const out: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  const stg = inkOrder === 'all' ? 0 : 1 / 60;
  parts.forEach((p, i) => {
    if (!knockout && p.d && p.fill && p.fill !== 'none') {
      out.push(
        <Fill
          key={`f${p.k}`}
          d={p.d}
          color={p.fill}
          at={at === undefined ? undefined : at + fillLag + i * 0.004}
          mode={fillMode}
          offset={p.exact || offset === false ? false : offset}
          seed={`${seed}/${p.k}`}
        />,
      );
    }
    if (p.ink && inkPx > 0) {
      const ink = (
        <Ink
          key={`i${p.k}`}
          d={p.ink}
          width={inkPx * (p.w ?? 1)}
          color={p.inkColor ?? inkColor}
          at={at === undefined ? undefined : at + i * stg}
          order={inkOrder}
          dur={inkDur}
          taper={false}
          vary={0.04}
          seed={`${seed}/${p.k}`}
        />
      );
      const front = knockout ? parts.slice(i + 1).filter((q) => q.d) : [];
      if (front.length) {
        const id = `${uid}m${i}`;
        defs.push(
          <mask key={id} id={id} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={8000} height={8000}>
            <rect x={-4000} y={-4000} width={8000} height={8000} fill="#fff" />
            {front.map((q) => (
              <path key={q.k} d={q.d} fill="#000" />
            ))}
          </mask>,
        );
        out.push(
          <g key={`g${p.k}`} mask={`url(#${id})`}>
            {ink}
          </g>,
        );
      } else out.push(ink);
    }
  });
  return (
    <>
      {defs.length ? <defs>{defs}</defs> : null}
      {out}
    </>
  );
};

export type FigureGProps = {
  x: number;
  y: number;
  /** Mirror (the geometry faces left; flip = facing right). */
  flip?: boolean;
  /** Extra uniform scale about the feet (lanes animate size with h instead; this is for a pop settle). */
  scale?: number;
  /** A pop's scale settle: from `settle.from` (default 1.08) to 1 over `settle.dur` (default 4 frames) from `settle.at`. */
  settle?: {at: number; from?: number; dur?: number};
  seed: Seed;
  /** Inside a parent's ExitSync already (a group that leaves as one). */
  noSync?: boolean;
  children?: React.ReactNode;
};

/** Place one figure: translate to its feet, mirror, settle; one un-build window for the whole figure. */
export const FigureG: React.FC<FigureGProps> = ({x, y, flip, scale = 1, settle, seed, noSync, children}) => {
  const t = useTime();
  let s = scale;
  if (settle && t >= settle.at) {
    const k = Math.min(1, (t - settle.at) / (settle.dur ?? 4 / 60));
    s *= 1 + ((settle.from ?? 1.08) - 1) * (1 - k) * (1 - k);
  }
  const m = mat.compose(mat.translate(x, y), mat.scale(flip ? -s : s, s));
  const g = <XG m={m}>{children}</XG>;
  return noSync ? g : <ExitSync seed={`fig/${seed}`}>{g}</ExitSync>;
};

// ---------------------------------------------------------------- a small bounded cache for built geometry

const GEO = new Map<string, Part[]>();
/** Memoise a pure geometry builder by key (bounded). */
export function cached(key: string, build: () => Part[]): Part[] {
  let v = GEO.get(key);
  if (!v) {
    v = build();
    if (GEO.size > 6000) GEO.clear();
    GEO.set(key, v);
  }
  return v;
}

/** Round a size to the cache grid (0.5 px). */
export const q2 = (v: number) => Math.round(v * 2) / 2;
/** Round a phase to the cache grid. */
export const q100 = (v: number) => Math.round(v * 100) / 100;
