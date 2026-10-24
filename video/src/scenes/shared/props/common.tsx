// props/common.tsx — the shared contract of every PROPS-lane component (src/scenes/shared/props/**).
//
// Every prop is PARAMETRIC and TIME-DRIVEN in seconds (the script may still change, so no beat time is hard-coded):
//   x, y        anchor in the parent's coordinates (world px at camera rest; each prop documents its anchor)
//   scale       1 = the prop's design size; most props also take a `size` (the main dimension in px) instead
//   depth       ink ladder: 'front' 4.8 | 'mid' 3.4 | 'far' 2.2 | 'hair' 1.6 | 'none' (fill-only far things)
//   ink         explicit ink width in WORLD px (overrides depth). Ink scales with the camera like the reference push-in.
//   at, dur     build-in: draw-on starts at `at` (omit = already built); `dur` stretches/squeezes the build schedule
//   outAt, outDur  build-out: the measured un-build (lines loosen, fills shrink, ink retracts), default 0.5 s
//   seed        deterministic variation
//   state       the prop's named rest state; named event times (screwsOutAt, swingAt, ...) animate from it
// Fills are MISREGISTERED in SCREEN space (2.4-4 px, one offset per object, 2/3 right-down): the offset is divided by the
// accumulated screen scale (camera zoom x prop scale), so a zoom-6 hidden match keeps the same print offset on screen.
// Detail drops with ON-SCREEN size (lod) through the same screen scale. Opacity is never animated.

import React from 'react';
import {depthInk} from '../../../lib/theme';
import {rand, Seed} from '../../../lib/rng';
import {mat, Mat, useXf, XG} from '../../../lib/xf';
import {UnBuild} from '../../../lib/exit';
import {clamp, ease as E, prog} from '../../../lib/time';
import {MOTION} from '../../../lib/spec';
import type {Pt} from '../../../lib/sketch';

export type Depth = 'front' | 'mid' | 'far' | 'hair' | 'none';
export const DEPTH_INK: Record<Depth, number> = {front: depthInk.front, mid: depthInk.mid, far: depthInk.far, hair: depthInk.hair, none: 0};

/** Props shared by every component of this lane. */
export type PropBase = {
  x?: number;
  y?: number;
  scale?: number;
  depth?: Depth;
  /** Ink width in world px (overrides depth). */
  ink?: number;
  at?: number;
  dur?: number;
  outAt?: number;
  outDur?: number;
  seed?: Seed;
  rot?: number;
  flip?: boolean;
};

/** at + dt keeping "undefined = already built". */
export const bt = (at: number | undefined, dt: number): number | undefined => (at === undefined ? undefined : at + dt);

/** Uniform scale of a matrix. */
export const matScale = (m: Mat) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

export type PropFrame = {
  /** Prop scale (local unit -> parent unit). */
  s: number;
  /** On-screen px per local unit (camera x parents x prop scale). */
  k: number;
  /** Local ink width for the depth ladder (world px / s). 0 = no ink. */
  W: number;
  /** World ink width. */
  Ww: number;
  /** Local misregistration offset (screen 2.4-4 px). */
  off: [number, number];
  /** Schedule helper: at + dt * stretch (undefined stays undefined). */
  T: (dt: number) => number | undefined;
};

/** Per-object misregistration in SCREEN px (one offset per object; 2/3 right-down like the reference). */
export function misregScreen(seed: Seed): Pt {
  const r1 = rand(seed, 'mr-dir');
  const r2 = rand(seed, 'mr-mag');
  const a = r1 < 0.67 ? (15 + r1 * 90) * (Math.PI / 180) : (195 + (r1 - 0.67) * 180) * (Math.PI / 180);
  const m = 2.4 + r2 * 1.6;
  return [Math.cos(a) * m, Math.sin(a) * m];
}

/** Resolve the frame of a prop (call at the top of the component, OUTSIDE its own <PropRoot>). */
export function usePropFrame(o: {scale?: number; depth?: Depth; ink?: number; at?: number; dur?: number; baseDur?: number; seed?: Seed; defDepth?: Depth}): PropFrame {
  const m = useXf();
  const s = o.scale ?? 1;
  const k = Math.max(1e-4, matScale(m) * s);
  const Ww = o.ink ?? DEPTH_INK[o.depth ?? o.defDepth ?? 'mid'];
  const ms = misregScreen(o.seed ?? 'prop');
  const stretch = o.dur !== undefined && o.baseDur ? o.dur / o.baseDur : 1;
  return {
    s,
    k,
    W: Ww / Math.max(1e-4, s),
    Ww,
    off: [ms[0] / k, ms[1] / k],
    T: (dt: number) => (o.at === undefined ? undefined : o.at + dt * stretch),
  };
}

/** Level of detail from an on-screen size (px) and thresholds [dot, simple] (below dot -> 0, below simple -> 1, else 2). */
export const lodOf = (screenPx: number, dot: number, simple: number): 0 | 1 | 2 => (screenPx < dot ? 0 : screenPx < simple ? 1 : 2);

/** Place a prop: translate (x, y), rotate, scale, flip; wraps the build-out (un-build) when outAt is given. */
export const PropRoot: React.FC<{x?: number; y?: number; s?: number; rot?: number; flip?: boolean; outAt?: number; outDur?: number; children?: React.ReactNode}> = ({
  x = 0,
  y = 0,
  s = 1,
  rot = 0,
  flip = false,
  outAt,
  outDur,
  children,
}) => {
  let m = mat.translate(x, y);
  if (rot) m = mat.mul(m, mat.rotate(rot));
  if (s !== 1 || flip) m = mat.mul(m, mat.scale(flip ? -s : s, s));
  const inner = outAt !== undefined ? <UnBuild at={outAt} dur={outDur ?? MOTION.unbuild.total}>{children}</UnBuild> : <>{children}</>;
  return <XG m={m}>{inner}</XG>;
};

/** Damped pendulum angle (deg): starts at `amp`, period `period`, settles in ~`settle` s (motion spec #14: -16 -> 0, ~0.5 s). */
export function pendulum(t: number, at: number | undefined, amp = -16, period = 0.5, settle = 0.8): number {
  if (at === undefined || t < at) return 0;
  const dt = t - at;
  if (dt > settle * 1.6) return 0;
  const decay = Math.exp((-dt * 4.6) / settle);
  return amp * decay * Math.cos((2 * Math.PI * dt) / period);
}

/** A 0..1 pop with the measured 7% overshoot (springs.pop), 0 before at. */
export { springAt, springs } from '../../../lib/time';

/** Squash at a landing: sy dips to `depth` then recovers (0.07 + 0.13 s, motion spec hop). Returns [sx, sy]. */
export function landSquash(t: number, at: number | undefined, depth = 0.86): [number, number] {
  if (at === undefined || t < at) return [1, 1];
  const dt = t - at;
  const {land, recover} = MOTION.hop;
  if (dt > land + recover) return [1, 1];
  const k = dt < land ? E.outCubic(dt / land) : 1 - E.outCubic((dt - land) / recover);
  const sy = 1 - (1 - depth) * k;
  return [1 + (1 - sy) * 0.6, sy];
}

/** Ballistic hop offset (px, negative = up) of height h over [at, at + dur]. */
export function hopY(t: number, at: number | undefined, dur: number, h: number): number {
  if (at === undefined || t <= at || t >= at + dur) return 0;
  const u = (t - at) / dur;
  return -4 * h * u * (1 - u);
}

/** Point and tangent angle (deg) along a polyline at arc length `d`. */
export function alongPath(path: Pt[], d: number): {p: Pt; ang: number; done: boolean} {
  if (path.length < 2) return {p: path[0] ?? [0, 0], ang: 0, done: true};
  let rest = Math.max(0, d);
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (rest <= L || i === path.length - 2) {
      const u = L > 0 ? clamp(rest / L) : 1;
      return {p: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, done: rest > L};
    }
    rest -= L;
  }
  const a = path[path.length - 2];
  const b = path[path.length - 1];
  return {p: b, ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, done: true};
}

/** Total length of a polyline. */
export const pathLen = (path: Pt[]) => path.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);

/** Stroke-on progress helper: 0..1 over [at, at + dur] with the pen ease (for hand-built marks). */
export const strokeP = (t: number, at: number | undefined, dur: number) => (at === undefined ? 1 : prog(t, at, dur, E.inOutSine));
