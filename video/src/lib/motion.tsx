// motion.tsx — SVG motion wrappers (all render <XG>, i.e. <g transform> + transform context; compose freely;
// times in scene seconds). Children are authored at their FINAL (rest) position; motion props are offsets.
//
// Calibrated to docs/motion_spec.md: NOTHING animates opacity. Things pop, scale, wipe, slide or rise.
//   <Pop at={1.2} x={300} y={800}> ... </Pop>                  // scale-in about (x,y), 7% overshoot; hidden before `at`
//   <Rise at={1} dist={140}> <Person .../> </Rise>             // rises ~its own height from below: out(exp) 0.33 s
//   <Sink at={6} dist={160}> ... </Sink>                       // exits by sinking (0.2 s ease-in), then gone
//   <Move from={[-400, 0]} at={2} dur={0.8}> ... </Move>       // slide in from 400px left to rest
//   <Walk from={[500, 0]} at={3} dur={2.5}> <Person .../> </Walk>   // translate + step bob + sway
//   <Appear at={1} outAt={4}> ... </Appear>                      // 1-frame pop in (and out)
//   <Wobble amp={2} rot={1.5} x={480} y={600} seed="tree"> ... </Wobble>   // idle micro-motion
//   <Shake at={4} dur={0.5} amp={6}> ... </Shake>
//   <Tween at={1} dur={0.6} from={{y: 40, opacity: 0}} to={{}} ox={..} oy={..}> ... </Tween>
//   <Camera keys={[{at: 2, s: 1}, {at: 3.3, s: 1.9, x: 300, y: 500}]}> ...whole scene... </Camera>  // push-in

import React from 'react';
import {Ease, clamp, ease as E, lerp, osc, prog, springAt, springs, SpringCfg, useTime} from './time';
import {rand, Seed} from './rng';
import {mat, Mat, XG} from './xf';
import {panel} from './theme';
import {MOTION} from './spec';

type Children = {children?: React.ReactNode};

/** Matrix for: translate(x,y), then rotate r (deg) / scale s,sx,sy about (ox,oy). */
export function xfMat(o: {x?: number; y?: number; s?: number; sx?: number; sy?: number; r?: number; ox?: number; oy?: number}): Mat {
  const {x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, ox = 0, oy = 0} = o;
  let m = mat.translate(x, y);
  if (r || s !== 1 || sx !== 1 || sy !== 1) m = mat.mul(m, mat.about(mat.mul(mat.rotate(r), mat.scale(s * sx, s * sy)), ox, oy));
  return m;
}
/** Same as xfMat but as an SVG transform string (for raw <g>). Prefer the wrappers / <XG>. */
export const xf = (o: Parameters<typeof xfMat>[0]) => mat.str(xfMat(o));

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
    /** Rotation settle in degrees (starts rotated by `rot`, springs to 0). */
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
  return <XG m={xfMat({s, r, ox: x, oy: y})}>{children}</XG>;
};

// ---------------------------------------------------------------- Rise / Sink

/** Rises children ~their own height from below (people, placards: "they never walk in, they rise").
 *  Default out(exp) over 0.33 s (50% in the first frame); pass `spring` for the {damping 40, stiffness 700} feel.
 *  Put it behind something (a crowd row, the frame edge, a wall) so the entry is hidden. */
export const Rise: React.FC<Children & {at: number; dist?: number; dur?: number; spring?: SpringCfg; keep?: boolean}> = ({at, dist = 140, dur = MOTION.rise.dur, spring, keep = false, children}) => {
  const t = useTime();
  if (t < at && !keep) return null;
  const k = spring ? springAt(t, at, spring) : prog(t, at, dur, MOTION.rise.ease);
  return <XG m={mat.translate(0, (1 - k) * dist)}>{children}</XG>;
};

/** Exit by sinking: children drop `dist` px over `dur` (ease-in) starting at `at`, then unmount. */
export const Sink: React.FC<Children & {at: number; dist?: number; dur?: number}> = ({at, dist = 160, dur = MOTION.sink.dur, children}) => {
  const t = useTime();
  const k = prog(t, at, dur, E.inCubic);
  if (k >= 1) return null;
  return <XG m={mat.translate(0, k * dist)}>{children}</XG>;
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
  return <XG m={mat.translate(x, y)}>{children}</XG>;
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
  return <XG m={xfMat({x: lerp(from[0], to[0], p), y: lerp(from[1], to[1], p) + b, r, ox: x, oy: y})}>{children}</XG>;
};

// ---------------------------------------------------------------- Appear

/** Hard 1-frame pop in at `at` (and out at `outAt`). No opacity (the reference never fades). `dur`/`outDur` are
 *  accepted for old code and ignored. */
export const Appear: React.FC<
  Children & {
    at: number;
    dur?: number;
    outAt?: number;
    outDur?: number;
    keep?: boolean;
  }
> = ({at, outAt, children}) => {
  const t = useTime();
  if (t < at) return null;
  if (outAt !== undefined && t >= outAt) return null;
  return <>{children}</>;
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
  return <XG m={xfMat({x: dx, y: dy, r, s, ox: x, oy: y})}>{children}</XG>;
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
  return <XG m={xfMat({x: osc(dt, hz) * amp * k, y: osc(dt, hz * 1.3, 1) * amp * 0.4 * k, r: osc(dt, hz * 0.8, 2) * rot * k, ox: x, oy: y})}>{children}</XG>;
};

// ---------------------------------------------------------------- Tween (general)

/** opacity is treated as a visibility switch (>= 0.5 = visible), never a fade. */
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
  // opacity is a visibility switch (>= 0.5 visible): the reference never fades
  if (v('opacity', 1) < 0.5) return null;
  return (
    <XG m={xfMat({x: v('x', 0), y: v('y', 0), s: v('s', 1), r: v('r', 0), ox, oy})}>
      {children}
    </XG>
  );
};

// ---------------------------------------------------------------- Camera (push-in / pan)

export type CameraKey = {at: number; s?: number; x?: number; y?: number; ease?: Ease};

/** Scene camera: keyframes of zoom `s` centred on point (x,y) (card coords; default panel centre).
 *  Between keys it eases (default inOutCubic; the reference push-in takes ~1.3 s). Wrap the whole scene. */
export const Camera: React.FC<Children & {keys: CameraKey[]}> = ({keys, children}) => {
  const t = useTime();
  const cx0 = panel.x + panel.w / 2;
  const cy0 = panel.y + panel.h / 2;
  let s = keys[0]?.s ?? 1;
  let x = keys[0]?.x ?? cx0;
  let y = keys[0]?.y ?? cy0;
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1];
    const k1 = keys[i];
    if (t <= k0.at) break;
    const p = prog(t, k0.at, k1.at - k0.at, k1.ease ?? E.inOutCubic);
    s = lerp(k0.s ?? 1, k1.s ?? 1, p);
    x = lerp(k0.x ?? cx0, k1.x ?? cx0, p);
    y = lerp(k0.y ?? cy0, k1.y ?? cy0, p);
  }
  // focus point (x,y) moves to the panel centre as s grows
  const k = s === 1 ? 0 : clamp((s - 1) / Math.max(1e-6, s));
  const fx = lerp(x, cx0, k);
  const fy = lerp(y, cy0, k);
  return <XG m={mat.compose(mat.translate(fx, fy), mat.scale(s), mat.translate(-x, -y))}>{children}</XG>;
};
