// Ink.tsx — hand-drawn linework with pen draw-on (stroke-dashoffset), round caps, auto un-build.
//
//   <Ink d={rect(100, 200, 300, 180)} at={1.0} />                  // draws its 4 edges one after another
//   <Ink d={circle(480, 400, 60)} at={2} dur={0.4} width={4} />
//   <Ink d={hatch(...)} at={3} order="all" />                      // all strokes at once
//   <Ink d={path} />                                                // no `at` -> already drawn
//   <InkGroup paths={[a, b, c]} at={1} stagger={0.12} />            // several drawings, staggered
//
// Times are scene seconds. Multi-subpath `d` (several "M") draws subpath by subpath ("seq", default,
// time split by length) or all together ("all"). Reads SceneExit: lines retract during an un-build.

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

type Parsed = {subs: string[]; lens: number[]; cum: number[]; total: number};
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
    p = {subs, lens, cum, total: acc};
    if (parseCache.size > 20000) parseCache.clear();
    parseCache.set(d, p);
  }
  return p;
}

/** Default draw duration for a path of `len` px (pen speed ~1500 px/s, clamped 0.15..0.9 s). */
export const inkDur = (len: number) => Math.min(0.9, Math.max(0.15, len / 1500));

// ---------------------------------------------------------------- Ink

export type InkProps = {
  d: string;
  /** Draw start (scene seconds). Omit = already drawn. */
  at?: number;
  /** Draw duration (s). Default from length (inkDur). */
  dur?: number;
  ease?: Ease;
  /** Stroke width (px). Default stroke.ink. */
  width?: number;
  color?: string;
  /** Multi-subpath: 'seq' draws pieces one after another (default), 'all' together. */
  order?: 'seq' | 'all';
  opacity?: number;
  /** Width variation per element (fraction, seeded). Default 0.1. */
  vary?: number;
  seed?: Seed;
  /** React to SceneExit (default true). */
  exit?: boolean;
  /** Static dash pattern (e.g. "2 10" dotted). Disables draw-on. */
  dash?: string;
  cap?: 'round' | 'butt' | 'square';
  join?: 'round' | 'miter' | 'bevel';
  /** Optional fill for the stroked path (rarely needed; use <Fill> for misregistered fills). */
  fill?: string;
  style?: React.CSSProperties;
};

export const Ink: React.FC<InkProps> = ({
  d,
  at,
  dur,
  ease = E.pen,
  width = stroke.ink,
  color = palette.ink,
  order = 'seq',
  opacity,
  vary = 0.1,
  seed,
  exit = true,
  dash,
  cap = 'round',
  join = 'round',
  fill = 'none',
  style,
}) => {
  const t = useTime();
  const e = useExit();
  const jit = useMemo(() => rand(seed ?? d.slice(0, 40), 'ink'), [seed, d]);
  const w = width * (1 + (jit * 2 - 1) * vary);
  const common = {
    fill,
    stroke: color,
    strokeWidth: w,
    strokeLinecap: cap,
    strokeLinejoin: join,
    opacity,
    style,
  } as const;

  const needsMeasure = at !== undefined || (exit && e > 0);
  const parsed = needsMeasure ? parseInk(d) : null;
  const drawDur = dur ?? (parsed ? inkDur(parsed.total) : 0.4);
  const p = at === undefined ? 1 : prog(t, at, drawDur, ease);
  const r = exit ? exitInkProgress(e, jit) : 0;

  if (p <= 0 || r >= 1) return null;
  if ((p >= 1 && r <= 0) || dash) {
    return <path d={d} strokeDasharray={dash} {...common} />;
  }
  const P = parsed!;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < P.subs.length; i++) {
    const L = P.lens[i];
    let a: number;
    let b: number;
    if (order === 'all') {
      a = r * L;
      b = p * L;
    } else {
      a = Math.min(L, Math.max(0, r * P.total - P.cum[i]));
      b = Math.min(L, Math.max(0, p * P.total - P.cum[i]));
    }
    const vis = b - a;
    if (vis < 0.5) continue;
    if (a <= 0 && b >= L) {
      out.push(<path key={i} d={P.subs[i]} {...common} />);
    } else {
      out.push(<path key={i} d={P.subs[i]} strokeDasharray={`${vis} ${L * 2 + 50}`} strokeDashoffset={-a} {...common} />);
    }
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- InkGroup

export type InkGroupProps = Omit<InkProps, 'd' | 'at'> & {
  paths: string[];
  at: number;
  /** Delay between consecutive paths (s). Default 0.1. */
  stagger?: number;
};

/** Several drawings, each starting `stagger` s after the previous. */
export const InkGroup: React.FC<InkGroupProps> = ({paths, at, stagger = 0.1, seed, ...rest}) => (
  <>
    {paths.map((d, i) => (
      <Ink key={i} d={d} at={at + i * stagger} seed={seed !== undefined ? `${seed}/${i}` : undefined} {...rest} />
    ))}
  </>
);
