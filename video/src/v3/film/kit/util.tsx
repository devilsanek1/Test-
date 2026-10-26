// kit/util.tsx: shared helpers for the v3 film kit (build timing, pops, text, ink by depth).
// Convention (kit/README.md): every prop takes canvas-px geometry, an optional `at` (build start, scene seconds; omit =
// already built; negative = part-drawn on frame 0, for the opening), and a `seed`. Ink draws first, the fill lands
// FILL_LAG later (the house "ink-first" grammar); raw SVG pieces (text, LED ticks) appear with the fills.

import React from 'react';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {depthInk} from '../../../lib/theme';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';

export type At = number | undefined;
/** at + dt, keeping "undefined = already built". */
export const b = (at: At, dt: number): At => (at === undefined ? undefined : at + dt);
/** A fill lands this long after its outline starts (house: 0.13-0.27 s). */
export const FILL_LAG = 0.18;
export const fillAt = (at: At, dt = 0): At => b(at, dt + FILL_LAG);

/** Ink weight by depth (screen px): front 4.8, mid 3.4, far 2.2, hair 1.6. Far planes get no ink at all. */
export const W = depthInk;

/** Shown from `at` (1-frame pop) and, optionally, until `until`. For raw SVG pieces with no <Fill>. */
export const Show: React.FC<{at?: number; until?: number; children?: React.ReactNode}> = ({at, until, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (until !== undefined && t >= until) return null;
  return <>{children}</>;
};

/** Scale `from` -> 1 over `dur` about (x, y) from `at` (the house fill pop, for raw pieces and value swaps). */
export const Pop: React.FC<{at?: number; x: number; y: number; dur?: number; from?: number; overshoot?: boolean; children?: React.ReactNode}> = ({at, x, y, dur = 0.12, from = 0.2, overshoot, children}) => {
  const t = useTime();
  if (at === undefined) return <>{children}</>;
  if (t < at) return null;
  const p = prog(t, at, dur, overshoot ? ease.outBack(1.4) : ease.outCubic);
  const s = from + (1 - from) * p;
  if (s >= 0.999 && p >= 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(s), x, y)}>{children}</XG>;
};

/** Caption-font text (the house hand). `fit` shrinks the size so the text stays within that width. */
export const Txt: React.FC<{x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; fit?: number; rot?: number; children: string}> = ({x, y, size, fill = EMBER.ink, anchor = 'middle', fit, rot, children}) => {
  const ok = useCaptionFont();
  if (!ok) return null;
  let s = size;
  if (fit) {
    const w = measureCaption(children, size);
    if (w > fit) s = Math.floor((size * fit) / w);
  }
  return (
    <text x={x} y={y} fontFamily={captionFontStack} fontSize={s} fill={fill} textAnchor={anchor} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      {children}
    </text>
  );
};

/** Text width in the caption font (exact once the font has loaded). */
export const textW = (s: string, size: number) => measureCaption(s, size);

/** Rotate children by `deg` about (x, y). */
export const Rot: React.FC<{deg?: number; x: number; y: number; children?: React.ReactNode}> = ({deg = 0, x, y, children}) =>
  deg ? <XG m={mat.about(mat.rotate(deg), x, y)}>{children}</XG> : <>{children}</>;

/** Scale children by `s` about (x, y) (non-uniform with sx / sy). */
export const Scale: React.FC<{s?: number; sx?: number; sy?: number; x: number; y: number; children?: React.ReactNode}> = ({s = 1, sx = 1, sy = 1, x, y, children}) =>
  s * sx === 1 && s * sy === 1 ? <>{children}</> : <XG m={mat.about(mat.scale(s * sx, s * sy), x, y)}>{children}</XG>;

export const lerp = (a: number, b2: number, p: number) => a + (b2 - a) * p;
export const clamp01 = (v: number) => clamp(v, 0, 1);
export type Pt = [number, number];
/** Bilinear point in a quad [tl, tr, br, bl] at (u, v) in 0..1. */
export const quadPt = (q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt => {
  const top: Pt = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)];
  const bot: Pt = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)];
  return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
};
