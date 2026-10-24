// motion.tsx — SVG motion wrappers (all render <g transform>; compose freely; times in scene seconds).
//
//   <Pop at={1.2} x={300} y={800}> ... </Pop>                  // springy scale-in about (x,y); hidden before `at`
//   <Move from={[-400, 0]} at={2} dur={0.8}> ... </Move>       // slide in from 400px left to rest (offsets!)
//   <Walk from={[500, 0]} at={3} dur={2.5}> <Person .../> </Walk>   // translate + step bob + sway
//   <Appear at={1} dur={0.3}> ... </Appear>                      // opacity
//   <Wobble amp={2} rot={1.5} x={480} y={600} seed="tree"> ... </Wobble>   // idle micro-motion
//   <Shake at={4} dur={0.5} amp={6}> ... </Shake>
//   <Tween at={1} dur={0.6} from={{y: 40, opacity: 0}} to={{}} x={..} y={..}> ... </Tween>
//
// Children are authored at their FINAL (rest) position; motion props are offsets from it.

import React from 'react';
import {Ease, clamp, ease as E, lerp, osc, prog, springAt, springs, SpringCfg, useTime} from './time';
import {rand, Seed} from './rng';

type Children = {children?: React.ReactNode};
const f = (n: number) => Math.round(n * 100) / 100;

/** Build a transform string: translate, then rotate/scale about (ox, oy). */
export function xf(o: {x?: number; y?: number; s?: number; sx?: number; sy?: number; r?: number; ox?: number; oy?: number}): string {
  const {x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, ox = 0, oy = 0} = o;
  let out = '';
  if (x || y) out += `translate(${f(x)} ${f(y)}) `;
  if (r || s !== 1 || sx !== 1 || sy !== 1) {
    out += `translate(${f(ox)} ${f(oy)}) `;
    if (r) out += `rotate(${f(r)}) `;
    if (s !== 1 || sx !== 1 || sy !== 1) out += `scale(${f(s * sx)} ${f(s * sy)}) `;
    out += `translate(${f(-ox)} ${f(-oy)})`;
  }
  return out.trim();
}

// ---------------------------------------------------------------- Pop

/** Pop scale value at time t (spring from `from` to 1). */
export const popScale = (t: number, at: number, cfg: SpringCfg = springs.pop, from = 0) => from + (1 - from) * springAt(t, at, cfg);

export const Pop: React.FC<
  Children & {
    at: number;
    /** Scale origin. */
    x?: number;
    y?: number;
    spring?: SpringCfg;
    /** Starting scale (default 0). */
    from?: number;
    /** Slight rotation settle in degrees (default 0). */
    rot?: number;
    /** Keep rendering before `at` (at scale `from`). Default false (hidden). */
    keep?: boolean;
  }
> = ({at, x = 0, y = 0, spring = springs.pop, from = 0, rot = 0, keep = false, children}) => {
  const t = useTime();
  if (t < at && !keep) return null;
  const s = popScale(t, at, spring, from);
  if (s <= 0.001) return null;
  const r = rot ? rot * (1 - springAt(t, at, springs.soft)) : 0;
  return <g transform={xf({s, r, ox: x, oy: y}) || undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Move

export const Move: React.FC<
  Children & {
    /** Offset at the start (px). Default [0,0]. */
    from?: [number, number];
    /** Offset at the end (px). Default [0,0]. */
    to?: [number, number];
    at: number;
    dur?: number;
    ease?: Ease;
    /** Optional jump arc height (px, positive = up). */
    arc?: number;
  }
> = ({from = [0, 0], to = [0, 0], at, dur = 0.8, ease = E.inOutCubic, arc = 0, children}) => {
  const t = useTime();
  const p = prog(t, at, dur, ease);
  const x = lerp(from[0], to[0], p);
  const y = lerp(from[1], to[1], p) - (arc ? Math.sin(Math.PI * prog(t, at, dur)) * arc : 0);
  return <g transform={xf({x, y}) || undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Walk

export const Walk: React.FC<
  Children & {
    from?: [number, number];
    to?: [number, number];
    at: number;
    dur?: number;
    /** Step bob height (px). Default 5. */
    bob?: number;
    /** Stride length (px per step). Default 34. */
    stride?: number;
    /** Sway rotation (deg) about the feet origin (x,y). Default 1.5. */
    sway?: number;
    /** Feet origin for sway (rest position). */
    x?: number;
    y?: number;
    ease?: Ease;
  }
> = ({from = [0, 0], to = [0, 0], at, dur = 2, bob = 5, stride = 34, sway = 1.5, x = 0, y = 0, ease = E.inOutSine, children}) => {
  const t = useTime();
  const p = prog(t, at, dur, ease);
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const steps = Math.max(1, Math.round(dist / stride));
  const phase = p * steps * Math.PI;
  const moving = p > 0 && p < 1;
  const b = moving ? -Math.abs(Math.sin(phase)) * bob : 0;
  const r = moving ? Math.sin(phase) * sway : 0;
  const tx = lerp(from[0], to[0], p);
  const ty = lerp(from[1], to[1], p) + b;
  return <g transform={xf({x: tx, y: ty, r, ox: x, oy: y}) || undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Appear

export const Appear: React.FC<
  Children & {
    at: number;
    dur?: number;
    /** Optional fade-out start (s). */
    outAt?: number;
    outDur?: number;
    /** Keep rendering before `at` (invisible). Default false. */
    keep?: boolean;
  }
> = ({at, dur = 0.3, outAt, outDur = 0.3, keep = false, children}) => {
  const t = useTime();
  if (t < at && !keep) return null;
  let o = prog(t, at, dur, E.outCubic);
  if (outAt !== undefined) o *= 1 - prog(t, outAt, outDur, E.inOutCubic);
  if (o <= 0.001) return null;
  return <g opacity={o < 1 ? o : undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Wobble (idle)

export const Wobble: React.FC<
  Children & {
    /** Translate amplitude (px). Default 1.5. */
    amp?: number;
    /** Rotation amplitude (deg). Default 1. */
    rot?: number;
    /** Frequency (Hz). Default 0.5. */
    hz?: number;
    /** Rotation/scale origin. */
    x?: number;
    y?: number;
    /** Breathing scale amplitude (fraction). Default 0. */
    breathe?: number;
    seed?: Seed;
    /** Start time; ramps in over 0.5 s. Default: always on. */
    from?: number;
  }
> = ({amp = 1.5, rot = 1, hz = 0.5, x = 0, y = 0, breathe = 0, seed = 'w', from, children}) => {
  const t = useTime();
  const ph = rand(seed, 'wob') * Math.PI * 2;
  const k = from === undefined ? 1 : prog(t, from, 0.5, E.inOutSine);
  const dx = osc(t, hz * 0.77, ph) * amp * k;
  const dy = osc(t, hz, ph + 1.3) * amp * 0.7 * k;
  const r = osc(t, hz * 0.9, ph + 2.1) * rot * k;
  const s = 1 + osc(t, hz * 0.6, ph) * breathe * k;
  return <g transform={xf({x: dx, y: dy, r, s, ox: x, oy: y}) || undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Shake

export const Shake: React.FC<Children & {at: number; dur?: number; amp?: number; hz?: number; rot?: number; x?: number; y?: number}> = ({
  at,
  dur = 0.5,
  amp = 6,
  hz = 14,
  rot = 0,
  x = 0,
  y = 0,
  children,
}) => {
  const t = useTime();
  const p = clamp((t - at) / dur);
  const k = p > 0 && p < 1 ? Math.pow(1 - p, 1.6) : 0;
  const dt = t - at;
  return <g transform={xf({x: osc(dt, hz) * amp * k, y: osc(dt, hz * 1.3, 1) * amp * 0.4 * k, r: osc(dt, hz * 0.8, 2) * rot * k, ox: x, oy: y}) || undefined}>{children}</g>;
};

// ---------------------------------------------------------------- Tween (general)

export type TweenState = {x?: number; y?: number; s?: number; r?: number; opacity?: number};

export const Tween: React.FC<
  Children & {
    at: number;
    dur?: number;
    ease?: Ease;
    from?: TweenState;
    to?: TweenState;
    /** Origin for rotation/scale. */
    ox?: number;
    oy?: number;
  }
> = ({at, dur = 0.6, ease = E.inOutCubic, from = {}, to = {}, ox = 0, oy = 0, children}) => {
  const t = useTime();
  const p = prog(t, at, dur, ease);
  const v = (k: keyof TweenState, def: number) => lerp(from[k] ?? def, to[k] ?? def, p);
  const o = v('opacity', 1);
  if (o <= 0.001) return null;
  return (
    <g transform={xf({x: v('x', 0), y: v('y', 0), s: v('s', 1), r: v('r', 0), ox, oy}) || undefined} opacity={o < 1 ? o : undefined}>
      {children}
    </g>
  );
};
