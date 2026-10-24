// time.ts — everything time-based, in SECONDS.
//
//   const t = useTime();                       // scene-local seconds (0 = scene start)
//   const p = prog(t, 1.2, 0.5, ease.outCubic); // 0..1 between t=1.2 and t=1.7
//   const s = springAt(t, 2.0, springs.pop);   // spring 0 -> 1 (with overshoot) starting at t=2.0
//   const at = stagger(i, 3.0, 0.08);          // 3.0, 3.08, 3.16, ...
//
// Main / scene compositions provide a TimeProvider. Without one, useTime() falls back to frame / fps,
// so dev compositions work unchanged.

import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

// ---------------------------------------------------------------- context

type TimeCtxValue = {
  /** Global (timeline) seconds, already computed by the provider. */
  global: number;
  /** Seconds subtracted from `global` to get scene-local time. */
  offset: number;
};

const TimeCtx = createContext<TimeCtxValue | null>(null);

/** Sets scene-local time for its subtree. `global` defaults to the parent's global time (or frame/fps). */
export const TimeProvider: React.FC<{offset?: number; global?: number; children: React.ReactNode}> = ({offset = 0, global, children}) => {
  const parentGlobal = useGlobalTime();
  const value = {global: global ?? parentGlobal, offset};
  return React.createElement(TimeCtx.Provider, {value}, children);
};

/** Shift time for a subtree: children see t - by. Handy to reuse a built-up group later in a scene. */
export const TimeShift: React.FC<{by: number; children: React.ReactNode}> = ({by, children}) => {
  const ctx = useContext(TimeCtx);
  const parentGlobal = useGlobalTime();
  const value = {global: parentGlobal, offset: (ctx?.offset ?? 0) + by};
  return React.createElement(TimeCtx.Provider, {value}, children);
};

/** Timeline seconds (independent of any <Sequence>). */
export function useGlobalTime(): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ctx = useContext(TimeCtx);
  return ctx ? ctx.global : frame / fps;
}

/** Scene-local seconds. */
export function useTime(): number {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ctx = useContext(TimeCtx);
  return ctx ? ctx.global - ctx.offset : frame / fps;
}

export function useFps(): number {
  return useVideoConfig().fps;
}

// ---------------------------------------------------------------- math

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Map v from [a,b] to [c,d], clamped. */
export const remap = (v: number, a: number, b: number, c: number, d: number) => lerp(c, d, clamp((v - a) / (b - a || 1e-9)));
export const mix2 = (a: [number, number], b: [number, number], p: number): [number, number] => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

// ---------------------------------------------------------------- easing

export type Ease = (x: number) => number;

const outBackF = (s: number): Ease => (x) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const inBackF = (s: number): Ease => (x) => (s + 1) * x * x * x - s * x * x;

export const ease = {
  linear: ((x) => x) as Ease,
  inQuad: ((x) => x * x) as Ease,
  outQuad: ((x) => 1 - (1 - x) * (1 - x)) as Ease,
  inOutQuad: ((x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)) as Ease,
  inCubic: ((x) => x * x * x) as Ease,
  outCubic: ((x) => 1 - Math.pow(1 - x, 3)) as Ease,
  inOutCubic: ((x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) as Ease,
  inQuart: ((x) => x * x * x * x) as Ease,
  outQuart: ((x) => 1 - Math.pow(1 - x, 4)) as Ease,
  inOutQuart: ((x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2)) as Ease,
  outQuint: ((x) => 1 - Math.pow(1 - x, 5)) as Ease,
  inOutQuint: ((x) => (x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2)) as Ease,
  outExpo: ((x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))) as Ease,
  inExpo: ((x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10))) as Ease,
  inOutSine: ((x) => -(Math.cos(Math.PI * x) - 1) / 2) as Ease,
  outSine: ((x) => Math.sin((x * Math.PI) / 2)) as Ease,
  inSine: ((x) => 1 - Math.cos((x * Math.PI) / 2)) as Ease,
  /** Overshoots then settles. s=1.70158 is the classic; 1.2 is subtle, 2.5 is bouncy. */
  outBack: (s = 1.70158): Ease => outBackF(s),
  inBack: (s = 1.70158): Ease => inBackF(s),
  /** Exponential ease-out normalised to reach 1 at x=1; k = sharpness (4-5 fits the reference caption roll). */
  expOut: (k = 4.5): Ease => (x) => (x >= 1 ? 1 : (1 - Math.exp(-k * x)) / (1 - Math.exp(-k))),
  /** Hand-drawn pen stroke: quick start, gentle landing. Default for Ink. */
  pen: ((x) => 1 - Math.pow(1 - x, 2.2)) as Ease,
};

// ---------------------------------------------------------------- progress

/** Clamped 0..1 progress of [start, start+dur], optionally eased. dur<=0 -> step. */
export function prog(t: number, start: number, dur: number, e: Ease = ease.linear): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  const x = clamp((t - start) / dur);
  return x <= 0 ? 0 : x >= 1 ? 1 : e(x);
}

/** Interpolate between keyframes: times (s) and values; eased per segment. */
export function keys(t: number, times: number[], values: number[], e: Ease = ease.inOutCubic): number {
  if (t <= times[0]) return values[0];
  for (let i = 1; i < times.length; i++) {
    if (t <= times[i]) return lerp(values[i - 1], values[i], e((t - times[i - 1]) / (times[i] - times[i - 1] || 1e-9)));
  }
  return values[values.length - 1];
}

/** Up then down: 0 -> 1 over [start, start+inDur], hold, 1 -> 0 over [end-outDur, end]. */
export function pulse(t: number, start: number, end: number, inDur = 0.25, outDur = 0.25, e: Ease = ease.inOutCubic): number {
  return Math.min(prog(t, start, inDur, e), 1 - prog(t, end - outDur, outDur, e));
}

// ---------------------------------------------------------------- springs (analytic, fps independent)

export type SpringCfg = {stiffness?: number; damping?: number; mass?: number; from?: number; to?: number};

/** Presets. `pop` overshoots ~12% (objects landing, settles ~0.55 s); `soft` ~2%; `snappy` ~9% (fast); `wobbly` ~25%; `gentle` slow, ~10%. */
export const springs = {
  pop: {stiffness: 170, damping: 14.5, mass: 1},
  soft: {stiffness: 120, damping: 17, mass: 1},
  snappy: {stiffness: 320, damping: 22, mass: 1},
  wobbly: {stiffness: 180, damping: 10.7, mass: 1},
  gentle: {stiffness: 60, damping: 13, mass: 1},
} satisfies Record<string, SpringCfg>;

/** Damped spring from `from` (0) to `to` (1) released at `start` seconds. Analytic; returns `from` before start. */
export function springAt(t: number, start: number, cfg: SpringCfg = springs.pop): number {
  const {stiffness = 170, damping = 14.5, mass = 1, from = 0, to = 1} = cfg;
  const x = t - start;
  if (x <= 0) return from;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  let v: number;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    v = 1 - Math.exp(-zeta * w0 * x) * (Math.cos(wd * x) + ((zeta * w0) / wd) * Math.sin(wd * x));
  } else if (zeta === 1) {
    v = 1 - Math.exp(-w0 * x) * (1 + w0 * x);
  } else {
    const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
    const c2 = r1 / (r1 - r2);
    const c1 = 1 - c2;
    v = 1 - (c1 * Math.exp(r1 * x) + c2 * Math.exp(r2 * x));
  }
  return from + (to - from) * v;
}

/** Seconds until a spring is visually settled (|error| < 0.5%). Useful for scheduling the next beat. */
export function springDuration(cfg: SpringCfg = springs.pop): number {
  const {stiffness = 170, damping = 14.5, mass = 1} = cfg;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = Math.min(1, damping / (2 * Math.sqrt(stiffness * mass)));
  return Math.log(200) / (zeta * w0);
}

// ---------------------------------------------------------------- stagger

/** start + i * each */
export const stagger = (i: number, start: number, each: number) => start + i * each;

/** Spread n items over `span` seconds starting at `start`; returns start time of item i. */
export const spread = (i: number, n: number, start: number, span: number) => (n <= 1 ? start : start + (i * span) / (n - 1));

/** Ordered beats: beats(1.0, [0.3, 0.5, 0.2]) -> [1.0, 1.3, 1.8, 2.0]. */
export function beats(start: number, gaps: number[]): number[] {
  const out = [start];
  for (const g of gaps) out.push(out[out.length - 1] + g);
  return out;
}

/** Continuous oscillation helper: sin wave in [-1, 1] with frequency hz and phase (radians). */
export const osc = (t: number, hz: number, phase = 0) => Math.sin(t * hz * Math.PI * 2 + phase);
