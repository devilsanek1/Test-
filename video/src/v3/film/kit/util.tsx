// kit/util.tsx: shared helpers for the v3 film kit (build timing, pops, text, ink by depth).
// Convention (kit/README.md): every prop takes canvas-px geometry, an optional `at` (build start, scene seconds; omit =
// already built; negative = part-drawn on frame 0, for the opening), and a `seed`. Ink draws first, the fill lands
// FILL_LAG later (the house "ink-first" grammar); raw SVG pieces (text, LED ticks) appear with the fills.

import React from 'react';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {depthInk} from '../../../lib/theme';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {mat, XG} from '../../../lib/xf';
import {isClean} from '../../../lib/pen';
import {useTierLine, useTierPaint, useTierScope} from '../../../lib/tier';
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
/** sRGB mix of two '#RRGGBB' colours by k (0 = a, 1 = c): a 2-step state change's half step (never animated as a fade). */
export const mixRgb = (a: string, c: string, k: number): string => {
  if (k <= 0) return a;
  if (k >= 1) return c;
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a);
  const C = p(c);
  return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
};
export const clamp01 = (v: number) => clamp(v, 0, 1);
export type Pt = [number, number];
/** Bilinear point in a quad [tl, tr, br, bl] at (u, v) in 0..1. */
export const quadPt = (q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt => {
  const top: Pt = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)];
  const bot: Pt = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)];
  return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
};

// ---------------------------------------------------------------- raw SVG on the attention tiers (clean pen)

/** Tier options of a raw SVG element (lib/tier.tsx): `thing` = the stroke IS the object (a wire, an arm, a bird's V),
 *  kept on every tier; `contour` false = an open edge stroke rather than a closed outline; `tone` = the fill it bounds;
 *  `graphic` = a shape drawn with a stroke (width and colour kept). */
export type TierSvg = {thing?: boolean; contour?: boolean; tone?: string; graphic?: boolean};

/** Resolve a raw element's paint on the tier here: a hex `fill` gets the tier's fill colour; a `stroke` gets the tier's
 *  line (width, colour, opacity) or is dropped (a dashed stroke off the subject is texture: dropped too). Under the
 *  default sketch pen everything passes through unchanged. */
function useTierSvg<P extends {fill?: string; stroke?: string; strokeWidth?: number | string; strokeDasharray?: number | string}>(p: P & TierSvg): Omit<P, keyof TierSvg> {
  const line = useTierLine();
  const paint = useTierPaint();
  const scope = useTierScope();
  const {thing, contour, tone, graphic, ...rest} = p;
  if (!isClean()) return rest as Omit<P, keyof TierSvg>;
  const out: Record<string, unknown> = {...rest};
  if (typeof rest.fill === 'string' && rest.fill.startsWith('#')) out.fill = paint(rest.fill);
  const hasFill = rest.fill !== undefined && rest.fill !== 'none';
  if (rest.stroke !== undefined && rest.stroke !== 'none') {
    const subject = (scope?.tier ?? 'support') === 'subject';
    const res = rest.strokeDasharray !== undefined && !subject && !thing ? {display: 'none' as const} : line(rest.stroke, Number(rest.strokeWidth ?? 1), {thing, contour, tone, graphic});
    if (res.display === 'none') {
      if (hasFill) out.stroke = 'none';
      else out.display = 'none';
    } else Object.assign(out, res);
  }
  return out as Omit<P, keyof TierSvg>;
}

/** <path> on the attention tiers (see TierSvg). */
export const TPath: React.FC<React.SVGProps<SVGPathElement> & TierSvg> = (p) => <path {...(useTierSvg(p as never) as React.SVGProps<SVGPathElement>)} />;
/** <rect> on the attention tiers. */
export const TRect: React.FC<React.SVGProps<SVGRectElement> & TierSvg> = (p) => <rect {...(useTierSvg(p as never) as React.SVGProps<SVGRectElement>)} />;
/** <circle> on the attention tiers. */
export const TCircle: React.FC<React.SVGProps<SVGCircleElement> & TierSvg> = (p) => <circle {...(useTierSvg(p as never) as React.SVGProps<SVGCircleElement>)} />;
/** <ellipse> on the attention tiers. */
export const TEllipse: React.FC<React.SVGProps<SVGEllipseElement> & TierSvg> = (p) => <ellipse {...(useTierSvg(p as never) as React.SVGProps<SVGEllipseElement>)} />;
