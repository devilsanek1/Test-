// Ink.tsx — hand-drawn linework with pen draw-on (stroke-dashoffset), round caps, tapered long strokes,
// open contours, perspective projection (inside <Plane>) and the measured un-build (loosen, then retract).
//
//   <Ink d={rect(100, 200, 300, 180)} at={1.0} />                  // 4 edge strokes, 1 frame apart, 3-6 f each
//   <Ink d={circle(480, 400, 60)} at={2} width={stroke.inkBold} />
//   <Ink d={hatch(...)} at={3} order="all" />                      // all strokes at once
//   <Ink d={crown(...)} open={0.2} />                               // leave 20% of the contour un-inked
//   <Ink d={path} />                                                // no `at` -> already drawn
//   <InkGroup paths={[a, b, c]} at={1} stagger={0.08} />            // several drawings, staggered
//
// Pacing (docs/motion_spec.md #4, pace="spec", the default): a path with several subpaths ("M" commands) is drawn as
// separate pen strokes; each stroke takes 0.10-0.20 s WHATEVER ITS LENGTH (len / 3000 px/s, clamped) and successive
// strokes start 1 frame apart, so 3-6 strokes are in flight at once. `dur`, if given, is the time budget over which
// the stroke STARTS are spread (it never slows a stroke down). pace="free" = the old behaviour (dur = total time,
// split by length). Times are scene seconds. Subpaths longer than 150 px taper toward both ends (style bible 3).

import React, {useMemo} from 'react';
import {getBoundingBox, getLength} from '@remotion/paths';
import {palette, stroke} from './theme';
import {clamp, Ease, ease as E, prog, useTime} from './time';
import {exitInkProgress, exitLoose, useExit, useLook} from './exit';
import {rand, Seed} from './rng';
import {MOTION, strokeDur} from './spec';
import {useProjected} from './persp';

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

type Parsed = {subs: string[]; lens: number[]; cum: number[]; total: number; maxLen: number; centers?: [number, number][]};
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

function centersOf(P: Parsed): [number, number][] {
  if (!P.centers) {
    P.centers = P.subs.map((s) => {
      try {
        const b = getBoundingBox(s);
        return [(b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2] as [number, number];
      } catch {
        return [0, 0] as [number, number];
      }
    });
  }
  return P.centers;
}

/** Pen speed (px/s) used by pace="free". */
export const PEN_SPEED = 2600;
/** Total draw time of a path (s): pace "spec" = (n-1) frame staggers + the last stroke; "free" = length-based. */
export const inkDur = (len: number) => Math.min(0.6, Math.max(0.1, len / PEN_SPEED));
/** Strokes longer than this (px) taper toward their ends. */
export const TAPER_MIN = 150;

/** How long a whole path takes to draw with the spec pacing (useful to schedule what comes next). */
export function inkDrawTime(d: string, dur?: number): number {
  const P = parseInk(d);
  const n = P.subs.length;
  if (!n) return 0;
  const stg = n > 1 ? (dur !== undefined ? clamp((dur - strokeDur(P.lens[n - 1])) / (n - 1), 1 / 60, 0.12) : MOTION.stroke.stagger) : 0;
  let end = 0;
  for (let i = 0; i < n; i++) end = Math.max(end, i * stg + strokeDur(P.lens[i]));
  return end;
}

// ---------------------------------------------------------------- Ink

export type InkProps = {
  d: string;
  /** Draw start (scene seconds). Omit = already drawn. */
  at?: number;
  /** pace "spec": time budget over which the stroke starts are spread (default: 1 frame apart).
   *  pace "free": total draw time. */
  dur?: number;
  /** Easing of each stroke. Default: inOut(sin) for short strokes, ease-out for long ones (> 300 px). */
  ease?: Ease;
  /** Stroke width (px). Default stroke.ink (3.4). Ladder: inkBold 4.8 front, ink 3.4 mid, inkThin 2.2 far, inkHair 1.6. */
  width?: number;
  color?: string;
  /** Multi-subpath: 'seq' draws pieces one after another (default), 'all' together. */
  order?: 'seq' | 'all';
  /** 'spec' (default): measured pen pacing. 'free': `dur` is the total time, split by length (pre-v2 behaviour). */
  pace?: 'spec' | 'free';
  /** Static opacity (translucent hairlines only; never animate it). */
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
  d: dIn,
  at,
  dur,
  ease,
  width = stroke.ink,
  color = palette.ink,
  order = 'seq',
  pace = 'spec',
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
  const look = useLook();
  const d = useProjected(dIn);
  const jit = useMemo(() => rand(seed ?? dIn.slice(0, 40), 'ink'), [seed, dIn]);
  if (!look.ink) return null;
  const w = width * (1 + (jit * 2 - 1) * vary);
  const common = {fill: 'none', stroke: color, strokeLinecap: cap, strokeLinejoin: join, opacity, style} as const;

  if (dash) {
    if (at !== undefined && t < at) return null;
    if (exit && exitInkProgress(e, jit) >= 0.5) return null;
    return <path d={d} strokeDasharray={dash} strokeWidth={w} {...common} />;
  }
  if (at !== undefined && t < at) return null;
  const P = parseInk(d);
  const n = P.subs.length;
  const r = exit ? E.inQuad(exitInkProgress(e, jit)) : 0;
  if (r >= 1 || n === 0) return null;
  const loose = exit ? exitLoose(e) : 0;

  // ---- per-subpath draw progress (0..1)
  const drawn: number[] = new Array(n);
  if (at === undefined) drawn.fill(1);
  else if (pace === 'free') {
    const drawDur = dur ?? inkDur(P.total);
    const p = prog(t, at, drawDur, ease ?? E.pen);
    for (let i = 0; i < n; i++) drawn[i] = order === 'all' ? p : clamp((p * P.total - P.cum[i]) / (P.lens[i] || 1));
  } else {
    const stg = order === 'all' || n === 1 ? 0 : dur !== undefined ? clamp((dur - strokeDur(P.lens[n - 1])) / (n - 1), 1 / 60, 0.12) : MOTION.stroke.stagger;
    for (let i = 0; i < n; i++) {
      const L = P.lens[i];
      const sd = n === 1 && dur !== undefined ? clamp(dur, MOTION.stroke.min, MOTION.stroke.max) : strokeDur(L);
      drawn[i] = prog(t, at + i * stg, sd, ease ?? (L > 300 ? E.pen : E.inOutSine));
    }
  }

  const tapering = taper && stroke.taperEnd < 1 && P.maxLen > TAPER_MIN;
  let allDone = true;
  for (let i = 0; i < n; i++) if (drawn[i] < 1) allDone = false;
  // fast path: fully drawn, no taper / open / exit -> one element
  if (allDone && r <= 0 && loose <= 0 && !tapering && !open) return <path d={d} strokeWidth={w} {...common} />;

  const k = stroke.taperEnd;
  const segs: Seg[] = [];
  const whole: number[] = []; // subpaths fully visible at full width (merged into one element)
  for (let i = 0; i < n; i++) {
    const L = P.lens[i];
    if (L <= 0.5) continue;
    const a = r * L;
    const b = drawn[i] * L;
    if (open > 0) {
      const ow = Math.min(0.6, open) * L;
      const os = rand(`${seed ?? dIn.length}`, `o${i}`) * (L - ow);
      const w1: [number, number] = [a, Math.min(b, os)];
      const w2: [number, number] = [Math.max(a, os + ow), b];
      for (const [aa, bb] of [w1, w2]) if (bb - aa > 0.5) pushTiers(segs, i, aa, bb, L, w, k, tapering);
      continue;
    }
    if (b - a <= 0.5) continue;
    if (!tapering || L <= TAPER_MIN) {
      if (a <= 0 && b >= L && loose <= 0) whole.push(i);
      else segs.push({i, a, b, w});
      continue;
    }
    pushTiers(segs, i, a, b, L, w, k, true);
  }
  const centers = loose > 0 ? centersOf(P) : null;
  const out: React.ReactNode[] = [];
  if (whole.length) out.push(<path key="w" d={whole.map((i) => P.subs[i]).join('')} strokeWidth={w} {...common} />);
  for (let m = 0; m < segs.length; m++) {
    const s = segs[m];
    const L = P.lens[s.i];
    const full = s.a <= 0.01 && s.b >= L - 0.01;
    let tr: string | undefined;
    if (centers) {
      // lines go loose: each stroke extends past its corners and turns a hair (seeded per stroke)
      const [cx, cy] = centers[s.i];
      const q = rand(`${seed ?? dIn.length}`, `l${s.i}`);
      const sc = 1 + loose * (0.14 + 0.16 * q);
      const rot = loose * (q - 0.5) * 3;
      tr = `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${sc.toFixed(3)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})`;
    }
    out.push(
      <path
        key={m}
        d={P.subs[s.i]}
        transform={tr}
        strokeWidth={centers ? s.w / (1 + loose * 0.22) : s.w}
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
