// Ink.tsx — hand-drawn linework with pen draw-on (stroke-dashoffset), round caps, tapered long strokes,
// open contours and automatic un-build.
//
//   <Ink d={rect(100, 200, 300, 180)} at={1.0} />                  // draws its 4 edges one after another
//   <Ink d={circle(480, 400, 60)} at={2} dur={0.3} width={stroke.inkBold} />
//   <Ink d={hatch(...)} at={3} order="all" />                      // all strokes at once
//   <Ink d={crown(...)} open={0.2} />                               // leave 20% of the contour un-inked
//   <Ink d={path} />                                                // no `at` -> already drawn
//   <InkGroup paths={[a, b, c]} at={1} stagger={0.08} />            // several drawings, staggered
//
// Times are scene seconds. Multi-subpath `d` (several "M") draws subpath by subpath ("seq", default,
// time split by length) or all together ("all"). Subpaths longer than 150 px taper toward both ends
// (style bible: last ~9% thins to stroke.taperEnd x width). Reads SceneExit: lines retract during an un-build.

import React, {useMemo} from 'react';
import {getLength} from '@remotion/paths';
import {palette, stroke} from './theme';
import {Ease, ease as E, prog, useTime} from './time';
import {exitInkProgress, useExit} from './exit';
import {rand, Seed} from './rng';

// ---------------------------------------------------------------- length cache

const lenCache = new Map<string, number>();
export function pathLength(d: string): number {
  let v = lenCache.get(d);
  if (v === undefined) {
    try {
      v = getLength(d);
    } catch {
      v = 0;
    }
    if (lenCache.size > 50000) lenCache.clear();
    lenCache.set(d, v);
  }
  return v;
}

type Parsed = {subs: string[]; lens: number[]; cum: number[]; total: number; maxLen: number};
const parseCache = new Map<string, Parsed>();

/** Split a path on absolute "M" commands and measure each piece (cached). */
export function parseInk(d: string): Parsed {
  let p = parseCache.get(d);
  if (!p) {
    const subs = d
      .split(/(?=M)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    const lens = subs.map(pathLength);
    const cum: number[] = [];
    let acc = 0;
    for (const l of lens) {
      cum.push(acc);
      acc += l;
    }
    p = {subs, lens, cum, total: acc, maxLen: Math.max(0, ...lens)};
    if (parseCache.size > 20000) parseCache.clear();
    parseCache.set(d, p);
  }
  return p;
}

/** Pen speed (px/s) used for default draw durations. The reference draws a window in 1-2 frames. */
export const PEN_SPEED = 2600;
/** Default draw duration for a path of `len` px (clamped 0.1..0.6 s). */
export const inkDur = (len: number) => Math.min(0.6, Math.max(0.1, len / PEN_SPEED));
/** Strokes longer than this (px) taper toward their ends. */
export const TAPER_MIN = 150;

// ---------------------------------------------------------------- Ink

export type InkProps = {
  d: string;
  /** Draw start (scene seconds). Omit = already drawn. */
  at?: number;
  /** Draw duration (s). Default from length (inkDur). */
  dur?: number;
  ease?: Ease;
  /** Stroke width (px). Default stroke.ink (3.4). Ladder: inkBold 4.8 front, ink 3.4 mid, inkThin 2.2 far, inkHair 1.6. */
  width?: number;
  color?: string;
  /** Multi-subpath: 'seq' draws pieces one after another (default), 'all' together. */
  order?: 'seq' | 'all';
  opacity?: number;
  /** Width variation per element (fraction, seeded). Default 0.08. */
  vary?: number;
  seed?: Seed;
  /** React to SceneExit (default true). */
  exit?: boolean;
  /** Taper long strokes (> 150 px) toward their ends. Default true. */
  taper?: boolean;
  /** Leave this fraction (0..0.6) of every subpath un-inked (open contours; seeded position). */
  open?: number;
  /** Static dash pattern (e.g. "2 10" dotted). Disables draw-on and taper. */
  dash?: string;
  cap?: 'round' | 'butt' | 'square';
  join?: 'round' | 'miter' | 'bevel';
  style?: React.CSSProperties;
};

type Seg = {i: number; a: number; b: number; w: number};

export const Ink: React.FC<InkProps> = ({
  d,
  at,
  dur,
  ease = E.pen,
  width = stroke.ink,
  color = palette.ink,
  order = 'seq',
  opacity,
  vary = 0.08,
  seed,
  exit = true,
  taper = true,
  open = 0,
  dash,
  cap = 'round',
  join = 'round',
  style,
}) => {
  const t = useTime();
  const e = useExit();
  const jit = useMemo(() => rand(seed ?? d.slice(0, 40), 'ink'), [seed, d]);
  const w = width * (1 + (jit * 2 - 1) * vary);
  const common = {fill: 'none', stroke: color, strokeLinecap: cap, strokeLinejoin: join, opacity, style} as const;

  if (dash) {
    if (at !== undefined && t < at) return null;
    return <path d={d} strokeDasharray={dash} strokeWidth={w} {...common} />;
  }
  const P = parseInk(d);
  const drawDur = dur ?? inkDur(P.total);
  const p = at === undefined ? 1 : prog(t, at, drawDur, ease);
  const r = exit ? exitInkProgress(e, jit) : 0;
  if (p <= 0 || r >= 1) return null;

  const tapering = taper && stroke.taperEnd < 1 && P.maxLen > TAPER_MIN;
  // fast path: fully drawn, no taper / open -> one element
  if (p >= 1 && r <= 0 && !tapering && !open) return <path d={d} strokeWidth={w} {...common} />;

  const k = stroke.taperEnd;
  const segs: Seg[] = [];
  const whole: number[] = []; // subpaths fully visible at full width (merged into one element)
  for (let i = 0; i < P.subs.length; i++) {
    const L = P.lens[i];
    if (L <= 0.5) continue;
    // visible window from draw / retract
    let a: number;
    let b: number;
    if (order === 'all') {
      a = r * L;
      b = p * L;
    } else {
      a = Math.min(L, Math.max(0, r * P.total - P.cum[i]));
      b = Math.min(L, Math.max(0, p * P.total - P.cum[i]));
    }
    // open contour: hide a seeded window of `open` * L
    if (open > 0) {
      const ow = Math.min(0.6, open) * L;
      const os = rand(`${seed ?? d.length}`, `o${i}`) * (L - ow);
      // keep the longer visible side only when the hole is interior: split into two visible windows
      const w1: [number, number] = [a, Math.min(b, os)];
      const w2: [number, number] = [Math.max(a, os + ow), b];
      for (const [aa, bb] of [w1, w2]) if (bb - aa > 0.5) pushTiers(segs, i, aa, bb, L, w, k, tapering);
      continue;
    }
    if (b - a <= 0.5) continue;
    if (!tapering || L <= TAPER_MIN) {
      if (a <= 0 && b >= L) whole.push(i);
      else segs.push({i, a, b, w});
      continue;
    }
    pushTiers(segs, i, a, b, L, w, k, true);
  }
  const out: React.ReactNode[] = [];
  if (whole.length) out.push(<path key="w" d={whole.map((i) => P.subs[i]).join('')} strokeWidth={w} {...common} />);
  for (let n = 0; n < segs.length; n++) {
    const s = segs[n];
    const L = P.lens[s.i];
    const full = s.a <= 0.01 && s.b >= L - 0.01;
    out.push(
      <path
        key={n}
        d={P.subs[s.i]}
        strokeWidth={s.w}
        strokeDasharray={full ? undefined : `${(s.b - s.a).toFixed(2)} ${(L * 2 + 50).toFixed(0)}`}
        strokeDashoffset={full || s.a === 0 ? undefined : (-s.a).toFixed(2)}
        {...common}
      />,
    );
  }
  return <>{out}</>;
};

/** Visible window [a,b] of a subpath of length L -> up to 3 width tiers (tapered ends). */
function pushTiers(segs: Seg[], i: number, a: number, b: number, L: number, w: number, k: number, tapering: boolean) {
  if (!tapering || L <= TAPER_MIN) {
    segs.push({i, a, b, w});
    return;
  }
  const tiers: [number, number, number][] = [
    [0, L, w * k],
    [0.045 * L, 0.955 * L, w * (1 + k) * 0.5],
    [0.09 * L, 0.91 * L, w],
  ];
  for (const [s0, s1, tw] of tiers) {
    const aa = Math.max(a, s0);
    const bb = Math.min(b, s1);
    if (bb - aa > 0.5) segs.push({i, a: aa, b: bb, w: tw});
  }
}

// ---------------------------------------------------------------- InkGroup

export type InkGroupProps = Omit<InkProps, 'd' | 'at'> & {
  paths: string[];
  at: number;
  /** Delay between consecutive paths (s). Default 0.08. */
  stagger?: number;
};

/** Several drawings, each starting `stagger` s after the previous. */
export const InkGroup: React.FC<InkGroupProps> = ({paths, at, stagger = 0.08, seed, ...rest}) => (
  <>
    {paths.map((d, i) => (
      <Ink key={i} d={d} at={at + i * stagger} seed={seed !== undefined ? `${seed}/${i}` : undefined} {...rest} />
    ))}
  </>
);
