// kit/util.tsx: shared helpers for the v2 film kit (build timing, the opening build wave, pops, hand lettering, ink by
// depth, scaled groups with constant ink).
// Convention (kit/README.md): every prop takes canvas-px geometry, an optional `at` (build start, scene seconds; omit =
// already built; negative = part-drawn on frame 0, for the opening), and a `seed`. Ink draws first, the fill lands
// FILL_LAG later (the house "ink-first" grammar); raw SVG pieces (text, small lights) appear with the fills.
//
// THE BUILD WAVE (the approved opening, src/v2/StyleDeskOpen.tsx): inside <BuildWave value={...}> every kit piece whose
// `at` is omitted is MADE by position: its ink draws on when the ink wave reaches its centre, its fill is plain paper
// until the colour wave reaches its centre and then flips whole in one frame, and hand lettering writes on left to
// right. Centres are world points (the camera removed via `uncam`). Outside a BuildWave, `at` alone decides.

import React, {createContext, useContext} from 'react';
import {Ink as LibInk, InkProps, parseInk} from '../../../lib/Ink';
import {bbox, Fill as LibFill, FillProps} from '../../../lib/Fill';
import {InkScale} from '../../../lib/inkComp';
import {rectPath} from '../../../lib/sketch';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {depthInk} from '../../../lib/theme';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {mat, Mat, useXf, XG} from '../../../lib/xf';
import {ExitFade} from '../../../lib/exit';
import {CC} from '../palette';

export type At = number | undefined;
export type Pt = [number, number];
/** at + dt, keeping "undefined = already built". */
export const b = (at: At, dt: number): At => (at === undefined ? undefined : at + dt);
/** A fill lands this long after its outline starts (house: 0.13-0.27 s). */
export const FILL_LAG = 0.18;
export const fillAt = (at: At, dt = 0): At => b(at, dt + FILL_LAG);

/** Ink weight by depth (screen px): front 4.8, mid 3.4, far 2.2, hair 1.6. Far planes get no ink at all. */
export const W = depthInk;
/** A figure's outline weight from its head radius (screen px): 2.2 at r 30, 3.4 at r 55, 4.8 at r >= 80. */
export const inkForHead = (r: number) => clamp(1.0 + r * 0.048, 2.2, 4.8);

export const lerp = (a: number, b2: number, p: number) => a + (b2 - a) * p;
export const lerpPt = (a: Pt, b2: Pt, p: number): Pt => [lerp(a[0], b2[0], p), lerp(a[1], b2[1], p)];
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const add = (a: Pt, d: Pt, k = 1): Pt => [a[0] + d[0] * k, a[1] + d[1] * k];
export const dirDeg = (deg: number): Pt => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
export const applyM = (m: Mat, x: number, y: number): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
/** Bilinear point in a quad [tl, tr, br, bl] at (u, v) in 0..1. */
export const quadPt = (q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt => {
  const top: Pt = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)];
  const bot: Pt = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)];
  return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
};

// ---------------------------------------------------------------- the build wave (the opening)

export type BuildWaveV = {
  /** Draw-on start (s) of an ink drawing centred at world point c. */
  inkAt: (c: Pt) => number;
  /** Time (s) the colour reaches world point c (paper before). */
  colourAt: (c: Pt) => number;
  /** The bare-line state's paper colour (default CC.wall). */
  paper?: string;
  /** Inverse of the camera matrix (screen -> world); identity when the lane draws in world coords already. */
  uncam?: Mat;
};
export const BuildWaveCtx = createContext<BuildWaveV | null>(null);
/** Every kit piece inside it with no explicit `at` builds by position (the opening). */
export const BuildWave: React.FC<{value: BuildWaveV; children?: React.ReactNode}> = ({value, children}) => (
  <BuildWaveCtx.Provider value={value}>{children}</BuildWaveCtx.Provider>
);
/** A radial wave from origin o: starts at t0 and travels `speed` px/s (StyleDeskOpen: ink 3000 from the contract at
 *  -0.26, colour 2200 from the lamp pool at 0.16). */
export const radialWave = (o: Pt, t0: number, speed: number) => (c: Pt) => t0 + Math.hypot(c[0] - o[0], c[1] - o[1]) / speed;

const centreOf = (w: BuildWaveV, m: Mat, d: string): Pt => {
  const bb = bbox(d);
  return applyM(mat.mul(w.uncam ?? mat.I, m), bb.x + bb.w / 2, bb.y + bb.h / 2);
};

/** Kit Ink: lib Ink; inside a BuildWave with no `at`, it draws on when the ink wave reaches it. */
export const Ink: React.FC<InkProps> = (p) => {
  const w = useContext(BuildWaveCtx);
  const m = useXf();
  if (!w || p.at !== undefined) return <LibInk {...p} />;
  const n = parseInk(p.d).subs.length;
  return <LibInk {...p} at={w.inkAt(centreOf(w, m, p.d))} order={n > 5 ? 'all' : p.order} />;
};

/** Kit Fill: lib Fill; inside a BuildWave with no `at`, it is paper until the colour wave reaches it, then flips. */
export const Fill: React.FC<FillProps> = (p) => {
  const w = useContext(BuildWaveCtx);
  const m = useXf();
  const t = useTime();
  if (!w || p.at !== undefined) return <LibFill {...p} />;
  const d = p.d ?? (p.rect ? rectPath(p.rect[0], p.rect[1], p.rect[2], p.rect[3]) : '');
  return <LibFill {...p} color={t < w.colourAt(centreOf(w, m, d)) ? w.paper ?? CC.wall : p.color} />;
};

/** For raw SVG pieces with one colour (a moon, a lit window): the colour, or paper before the colour wave. */
export const useWaveColour = (c: Pt, color: string, at?: number): string | null => {
  const w = useContext(BuildWaveCtx);
  const m = useXf();
  const t = useTime();
  if (at !== undefined) return t < at ? null : color;
  if (!w) return color;
  const wc = applyM(mat.mul(w.uncam ?? mat.I, m), c[0], c[1]);
  return t < w.colourAt(wc) ? w.paper ?? CC.wall : color;
};

// ---------------------------------------------------------------- show / pop / transforms

/** Shown from `at` (1-frame pop) and, optionally, until `until`. For raw SVG pieces with no <Fill>. */
export const Show: React.FC<{at?: number; until?: number; children?: React.ReactNode}> = ({at, until, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (until !== undefined && t >= until) return null;
  return <>{children}</>;
};

/** Scale `from` -> 1 over `dur` about (x, y) from `at` (the house pop; overshoot = a springy landing). */
export const Pop: React.FC<{at?: number; x: number; y: number; dur?: number; from?: number; overshoot?: boolean; children?: React.ReactNode}> = ({at, x, y, dur = 0.12, from = 0.2, overshoot, children}) => {
  const t = useTime();
  if (at === undefined) return <>{children}</>;
  if (t < at) return null;
  const p = prog(t, at, dur, overshoot ? ease.outBack(1.6) : ease.outCubic);
  const s = from + (1 - from) * p;
  if (s >= 0.999 && p >= 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(s), x, y)}>{children}</XG>;
};

/** Rotate children by `deg` about (x, y). */
export const Rot: React.FC<{deg?: number; x: number; y: number; children?: React.ReactNode}> = ({deg = 0, x, y, children}) =>
  deg ? <XG m={mat.about(mat.rotate(deg), x, y)}>{children}</XG> : <>{children}</>;

/** A group drawn in its own local units, placed by translate (x, y), rotate `rot` and scale `s` (local px x s =
 *  screen px). Ink inside is compensated (InkScale 1/s), so a 0.3x prop keeps the screen ink weight it is given.
 *  The kit draws authored-size props (Box, Badge, ContractPage, the desk insert) through it. */
export const Placed: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, children}) => {
  const m = mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(s));
  return (
    <XG m={m}>
      <InkScale value={1 / s}>{children}</InkScale>
    </XG>
  );
};

// ---------------------------------------------------------------- hand lettering (pages, stamps, bubbles)

/** Text width in the caption font (exact once the font has loaded; an estimate before). */
export const textW = (s: string, size: number) => measureCaption(s, size);

export type LetterProps = {
  x: number;
  y: number;
  size: number;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  /** Shrink the size so the text stays within this width (px). */
  fit?: number;
  rot?: number;
  /** Write on left to right from `at` over `dur` (default 0.2 s; inside a BuildWave with no `at`: when the ink wave
   *  reaches the text). Omit = already written. */
  at?: number;
  dur?: number;
  /** Letter spacing (px). */
  spacing?: number;
  children: string;
};

/** THE hand lettering (the caption hand, as in the style frame's JOB CONTRACT, GOOGLE badge, years and FACTS). */
export const Letter: React.FC<LetterProps> = ({x, y, size, fill = CC.ink, anchor = 'start', fit, rot, at, dur = 0.2, spacing, children}) => {
  const ok = useCaptionFont();
  const w = useContext(BuildWaveCtx);
  const m = useXf();
  const t = useTime();
  if (!ok) return null;
  let s = size;
  if (fit) {
    const tw = measureCaption(children, size);
    if (tw > fit) s = Math.floor((size * fit) / tw);
  }
  let start = at;
  if (start === undefined && w) {
    const tw = measureCaption(children, s);
    const x0 = anchor === 'start' ? x : anchor === 'middle' ? x - tw / 2 : x - tw;
    start = w.inkAt(applyM(mat.mul(w.uncam ?? mat.I, m), x0 + s, y - s * 0.35));
  }
  let style: React.CSSProperties | undefined;
  if (start !== undefined) {
    const p = prog(t, start, dur);
    if (p <= 0) return null;
    if (p < 1) style = {clipPath: `inset(-30% ${((1 - p) * 100).toFixed(1)}% -30% -5%)`};
  }
  // in an un-build the words shrink about their middle with the fills (lib/exit ExitFade: never a fade, never left
  // floating on the loop's last frame; lane L2's request, folded back by the assembler)
  const tw = measureCaption(children, s);
  const mx = anchor === 'start' ? x + tw / 2 : anchor === 'middle' ? x : x - tw / 2;
  return (
    <ExitFade x={mx} y={y - s * 0.35}>
      <text
        x={x}
        y={y}
        fontFamily={captionFontStack}
        fontSize={s}
        fill={fill}
        textAnchor={anchor}
        letterSpacing={spacing}
        transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
        style={style}
      >
        {children}
      </text>
    </ExitFade>
  );
};

/** v3-compatible alias: caption-font text with `fit`, no write-on. */
export const Txt: React.FC<{x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; fit?: number; rot?: number; children: string}> = (p) => (
  <Letter anchor="middle" {...p} />
);
