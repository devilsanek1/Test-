// sets/common.tsx — shared plumbing for the SETS lane (src/scenes/shared/sets/**): palette steps, the lights-out and
// pop-up states, screen-space helpers, batched linework and a few drawing helpers every set uses (brick hints, shade
// planes, kerbs, one-point paving, hand-drawn windows merged into ONE ink path per facade).
//
// Conventions (every set):
//   - World coordinates = canvas px at camera rest (1080 x 1920). Sets draw in those coordinates; x / y / scale on a
//     set component only offset the whole set (thumbnails, reuse), they never change its internal layout.
//   - Time is scene seconds (useTime()). Every event time is a PROP (nothing hard-coded: the storyboard is still
//     being re-timed). "omit = already there" for builds, "omit = never" for events (shutters, lights out...).
//   - No opacity animation anywhere. States switch by 1-frame pops, scale pops, wipes or draw-ons.
//   - Ink by depth: 4.8 front, 3.4 mid, 2.2 far, 1.6 hair; far layers fill-only.

import React from 'react';
import {palette, misreg, stroke} from '../../../lib/theme';
import {ease as E, prog, useTime} from '../../../lib/time';
import {Tod as TodCtx} from '../../../lib/tod';
import {mat, useXf, XG} from '../../../lib/xf';
import {line, rect as sketchRect, wallTicks, Pt} from '../../../lib/sketch';
import {Ink} from '../../../lib/Ink';
import {Look, UnBuild, useLook} from '../../../lib/exit';
import {MOTION} from '../../../lib/spec';
import {Fill} from '../../../lib/Fill';
import {Place} from '../../../lib/kit/common';
import {rng, Seed} from '../../../lib/rng';

export type {Pt, Seed};

/** Ink weights (on-screen px at camera rest). */
export const SI = {front: 4.8, mid: 3.4, far: 2.2, hair: 1.6} as const;

/** The film's day sky (sets that render their own sky in thumbnails use these). */
export type SetTod = 'day' | 'golden' | 'dusk' | 'night' | 'dawn' | 'morning';

// ---------------------------------------------------------------- palette steps

const STEP_DARK: Record<string, string> = {
  [palette.cream.toUpperCase()]: palette.sand,
  [palette.sand.toUpperCase()]: palette.tan,
  [palette.mintPale.toUpperCase()]: palette.sage,
  [palette.sage.toUpperCase()]: palette.teal,
  [palette.teal.toUpperCase()]: palette.tealDark,
  [palette.peach.toUpperCase()]: palette.tan,
  [palette.sky.toUpperCase()]: palette.sage,
  ['#ACD1BF']: palette.sage,
};
/** One palette step darker (cream -> sand -> tan, mintPale -> sage -> teal -> tealDark, peach -> tan). White, tan,
 *  ochre, tealDark, ink and the sun do not move (whites read as lit: the clock face stays white). */
export const stepDarker = (c: string): string => (c && c[0] === '#' ? STEP_DARK[c.toUpperCase()] ?? c : c);

const STEP_LIGHT: Record<string, string> = {
  [palette.tan.toUpperCase()]: palette.sand,
  [palette.sand.toUpperCase()]: palette.cream,
  [palette.cream.toUpperCase()]: palette.white,
  [palette.sage.toUpperCase()]: '#ACD1BF',
  [palette.teal.toUpperCase()]: palette.sage,
  [palette.tealDark.toUpperCase()]: palette.teal,
  [palette.mintPale.toUpperCase()]: palette.white,
  [palette.brown.toUpperCase()]: palette.tan,
  ['#ACD1BF']: palette.mintPale,
  [palette.peach.toUpperCase()]: palette.cream,
};
/** One palette step lighter (the dome glass: tan -> sand -> cream -> white, sage -> sky, teal -> sage). */
export const stepLighter = (c: string): string => (c && c[0] === '#' ? STEP_LIGHT[c.toUpperCase()] ?? c : c);

/** Half palette steps (50/50 mixes of neighbouring tokens, style_bible_ref2 8's haze rule). */
export const HALF = {
  cream: '#F9F0E5', // cream -> white
  sand: '#E6CEB6', // sand -> cream
  peach: '#F5CCAF', // peach -> cream
  daySky: '#CCE4D2', // day sky -> mintPale
  mintPale: '#F5FBF2', // mintPale -> white
} as const;

const GLASS: Record<string, string> = {
  [palette.cream.toUpperCase()]: HALF.cream,
  [palette.sand.toUpperCase()]: HALF.sand,
  [HALF.sand.toUpperCase()]: HALF.sand,
  [palette.peach.toUpperCase()]: HALF.peach,
  [palette.tan.toUpperCase()]: palette.sand,
  [palette.brown.toUpperCase()]: palette.tan,
  [palette.sage.toUpperCase()]: '#ACD1BF',
  ['#ACD1BF']: HALF.daySky,
  [palette.teal.toUpperCase()]: palette.sage,
  [palette.tealDark.toUpperCase()]: palette.teal,
  [palette.mintPale.toUpperCase()]: HALF.mintPale,
};
/** The dome glass: one step lighter for the mid / dark tones, HALF a step for the light ones, so nothing behind the glass
 *  turns paper-white (cream -> #F9F0E5, sand -> #E6CEB6, peach -> #F5CCAF; whites stay white). */
export const glassStep = (c: string): string => (c && c[0] === '#' ? GLASS[c.toUpperCase()] ?? c : c);

/** Behind glass: every <Fill> inside takes the glassStep (the dome interior). */
export const Glass: React.FC<{on?: boolean; children?: React.ReactNode}> = ({on = true, children}) =>
  on ? <TodCtx map={glassStep}>{children}</TodCtx> : <>{children}</>;

/** Reference 2's night mapping for the LIGHT ground fields (style_bible_ref2 4: mintPale -> sage, sky -> sage,
 *  cream -> sand, sand -> tan); facades that must keep their day fills simply stay outside it. */
const NIGHT_GROUND: Record<string, string> = {
  [palette.mintPale.toUpperCase()]: palette.sage,
  ['#ACD1BF']: palette.sage,
  [palette.sky.toUpperCase()]: palette.sage,
  [palette.cream.toUpperCase()]: palette.sand,
  [palette.sand.toUpperCase()]: palette.tan,
};
export const nightGroundStep = (c: string): string => (c && c[0] === '#' ? NIGHT_GROUND[c.toUpperCase()] ?? c : c);
/** Relights its <Fill>s with the night ground mapping while `on`. */
export const NightGround: React.FC<{on?: boolean; children?: React.ReactNode}> = ({on = true, children}) =>
  on ? <TodCtx map={nightGroundStep}>{children}</TodCtx> : <>{children}</>;

/** A glow as OPAQUE stepped flat discs (outer first), never translucent rings; light exists only in the coloured state.
 *  steps = [[radius, colour], ...] outer -> inner. */
export const GlowDiscs: React.FC<{cx: number; cy: number; steps: [number, string][]; at?: number}> = ({cx, cy, steps, at}) => {
  const look = useLook();
  const t = useTime();
  if (look.fills !== 'color' || (at !== undefined && t < at)) return null;
  return (
    <>
      {steps.map(([r, c], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={c} />
      ))}
    </>
  );
};

/** Lights out: from `at` every <Fill> inside steps one palette step darker (a 1-frame pop; `stagger` > 0 lets the
 *  caller cascade several groups). `on` forces the state (the 'off' end state). */
export const LightsOut: React.FC<{at?: number; on?: boolean; children?: React.ReactNode}> = ({at, on, children}) => {
  const t = useTime();
  const dark = on ?? (at !== undefined && t >= at);
  if (!dark) return <>{children}</>;
  return <TodCtx map={stepDarker}>{children}</TodCtx>;
};

/** Glass: every <Fill> inside steps one palette step lighter (the dome interior). */
export const Lighter: React.FC<{on?: boolean; children?: React.ReactNode}> = ({on = true, children}) =>
  on ? <TodCtx map={stepLighter}>{children}</TodCtx> : <>{children}</>;

// ---------------------------------------------------------------- pop-ups

/** scaleY 0 -> 1.06 -> 1 about the base point (x, y): a pop-up-book building. 0.16 s up (out-cubic), 0.1 s settle. */
export function popUpK(t: number, at: number | undefined, over = 0.06): number {
  if (at === undefined) return 1;
  if (t < at) return 0;
  const a = prog(t, at, 0.16, E.outCubic);
  if (a < 1) return a * (1 + over);
  return 1 + over * (1 - prog(t, at + 0.16, 0.1, E.inOutSine));
}

export const PopUp: React.FC<{at?: number; x: number; y: number; over?: number; axis?: 'y' | 'xy'; children?: React.ReactNode}> = ({at, x, y, over = 0.06, axis = 'y', children}) => {
  const t = useTime();
  const k = popUpK(t, at, over);
  if (k <= 0.001) return null;
  if (k === 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(axis === 'xy' ? k : 1, k), x, y)}>{children}</XG>;
};

/** Pop with overshoot about a point (scale 0 -> 1 + over -> 1), 0.2 s. For signs, tags, small parts. */
export function popK(t: number, at: number | undefined, over = 0.08, dur = 0.2): number {
  if (at === undefined) return 1;
  if (t < at) return 0;
  const p = prog(t, at, dur);
  if (p >= 1) return 1;
  // out-back shaped: reach 1 + over at 60 %, settle to 1
  return p < 0.6 ? E.outCubic(p / 0.6) * (1 + over) : 1 + over * (1 - E.inOutSine((p - 0.6) / 0.4));
}

export const PopAt: React.FC<{at?: number; x: number; y: number; over?: number; dur?: number; children?: React.ReactNode}> = ({at, x, y, over = 0.08, dur = 0.2, children}) => {
  const t = useTime();
  const k = popK(t, at, over, dur);
  if (k <= 0.001) return null;
  if (k === 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(k), x, y)}>{children}</XG>;
};

/** A 1-frame switch: children appear at `at` and vanish at `outAt` (never a fade). */
export const Between: React.FC<{at?: number; outAt?: number; children?: React.ReactNode}> = ({at, outAt, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt) return null;
  return <>{children}</>;
};

// ---------------------------------------------------------------- placement / screen space

/** Offsets a whole set (thumbnails, reuse; identity when x = y = 0 and scale = 1) and runs its build-out: the measured
 *  un-build of just this set from `outAt` over `outDur` (default 0.5 s), like every prop's outAt. */
export const SetPlace: React.FC<{x?: number; y?: number; scale?: number; outAt?: number; outDur?: number; children?: React.ReactNode}> = ({x = 0, y = 0, scale = 1, outAt, outDur, children}) => {
  const inner = outAt !== undefined ? <UnBuild at={outAt} dur={outDur ?? MOTION.unbuild.total}>{children}</UnBuild> : <>{children}</>;
  return x === 0 && y === 0 && scale === 1 ? inner : (
    <Place x={x} y={y} s={scale}>
      {inner}
    </Place>
  );
};

/** Props every set takes (placement + build-out). */
export type SetBase = {x?: number; y?: number; scale?: number; seed?: Seed; /** Un-build just this set from here (s). */ outAt?: number; outDur?: number};

/** Uniform screen scale of the current subtree (camera zoom x layer scale x set scale). */
export const useZoom = () => {
  const m = useXf();
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
};

/** Screen-space misregistration for a fill drawn under a zoom (S10's zoom-6 hidden match): the offset stays
 *  ~misreg px ON SCREEN whatever the zoom. */
export function screenMisreg(zoom: number, seed: Seed, k = 1): [number, number] {
  const r = rng(`smr/${seed}`);
  return [((misreg.dx + r.jitter(misreg.jitter)) * k) / zoom, ((misreg.dy + r.jitter(misreg.jitter)) * k) / zoom];
}

/** A layer wrapper callback: scenes pass (name, nearness, node) => <Layer depth={...}>{node}</Layer> to split a set
 *  into multiplane layers. nearness follows the storyboard (0.1 far ... 1.0 foreground). */
export type LayerWrap = (name: string, nearness: number, node: React.ReactNode) => React.ReactNode;
export const noWrap: LayerWrap = (_n, _d, node) => node;

// ---------------------------------------------------------------- drawing helpers (pure path builders)

/** Brick hints: n short marks (L, T, -, corner) over a wall box (style bible: 4-8 per wall, 18-30 px). */
export const brickHints = (x: number, y: number, w: number, h: number, seed: Seed, n = 6, size = 22) => wallTicks(x, y, w, h, {seed: `bk/${seed}`, n, size});

/** Window opening: frame strokes (one side often left open), one mullion, a sill overshooting both sides. */
export function windowInk(x: number, y: number, w: number, h: number, seed: Seed, o: {mullion?: boolean; transom?: number; sill?: boolean; open?: boolean} = {}): string {
  const r = rng(`wi/${seed}`);
  const edges = o.open === false ? 'tlrb' : r.chance(0.5) ? 'tlb' : 'tlr';
  let d = sketchRect(x, y, w, h, {seed: `wi/${seed}`, edges, over: 'small'});
  if (o.mullion !== false && w > 18) d += line(x + w / 2, y, x + w / 2, y + h, {seed: `wm/${seed}`, over: [1, 2], breaks: false});
  if (o.transom) d += line(x, y + h * o.transom, x + w, y + h * o.transom, {seed: `wt/${seed}`, over: [1, 3], breaks: false});
  if (o.sill !== false) d += line(x - Math.min(10, w * 0.12), y + h + 4, x + w + Math.min(10, w * 0.12), y + h + 4, {seed: `ws/${seed}`, over: [2, 4], breaks: false});
  return d;
}

/** Partial pane fill (style bible: panes are 40-70 % filled, a block of colour in one corner). Returns a closed path. */
export function paneFill(x: number, y: number, w: number, h: number, seed: Seed): string {
  const r = rng(`pf/${seed}`);
  const k = r.range(0.45, 0.75);
  const top = r.chance(0.5);
  const hh = h * k;
  const yy = top ? y : y + h - hh;
  return `M${(x + 1).toFixed(1)} ${yy.toFixed(1)}h${(w - 2).toFixed(1)}v${hh.toFixed(1)}h${(-(w - 2)).toFixed(1)}z`;
}

/** Glass glint "//" (two hair diagonals, upper left). */
export function glintAt(x: number, y: number, len: number, seed: Seed): string {
  const a = (-62 * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const gap = Math.max(4, len * 0.25);
  const l2 = len * (0.5 + rng(`gl/${seed}`).next() * 0.2);
  const nx = -uy;
  const ny = ux;
  const ox = x + nx * gap + ux * len * 0.12;
  const oy = y + ny * gap + uy * len * 0.12;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x)} ${f(y)}L${f(x + ux * len)} ${f(y + uy * len)}M${f(ox)} ${f(oy)}L${f(ox + ux * l2)} ${f(oy + uy * l2)}`;
}

/** Doubled cornice: 2 long lines `gap` apart overshooting `over` px on both sides (the band between holds a fill). */
export function cornice(x0: number, x1: number, y: number, gap: number, seed: Seed, over = 24): string {
  return line(x0, y, x1, y, {seed: `c1/${seed}`, over: [over, over * 0.8]}) + line(x0 - 4, y + gap, x1 + 4, y + gap, {seed: `c2/${seed}`, over: [over * 0.7, over]});
}

/** One-point perspective ground joints: lines from points on the bottom edge toward the vanishing point, cut at
 *  `yTop`, plus cross joints at perspective depths. */
export function pavingJoints(vp: Pt, yTop: number, yBot: number, x0: number, x1: number, n: number, cross: number, seed: Seed, skip?: (x: number) => boolean): string {
  let d = '';
  const ray = (xb: number, y: number) => vp[0] + ((xb - vp[0]) * (y - vp[1])) / (yBot - vp[1]);
  for (let i = 0; i <= n; i++) {
    const xb = x0 + ((x1 - x0) * i) / n;
    if (skip && skip(xb)) continue;
    d += line(ray(xb, yTop), yTop, xb, yBot, {seed: `pj/${seed}/${i}`, over: [0, 0], breaks: false, drift: 0.2});
  }
  for (let k = 1; k <= cross; k++) {
    const y = vp[1] + (yBot - vp[1]) * Math.pow(k / (cross + 1), 1.7);
    if (y <= yTop + 4) continue;
    d += line(ray(x0, y), y, ray(x1, y), y, {seed: `pc/${seed}/${k}`, over: [0, 0], breaks: false});
  }
  return d;
}

/** x on the ray from vp through (xb, yb), at height y. */
export const rayX = (vp: Pt, xb: number, yb: number, y: number) => vp[0] + ((xb - vp[0]) * (y - vp[1])) / (yb - vp[1]);

// ---------------------------------------------------------------- small components

/** A static ink path that skips the taper machinery (merged texture: grids, joints, hatching). */
export const Lines: React.FC<{d: string; w?: number; at?: number; dur?: number; color?: string; dash?: string; seed?: Seed; order?: 'seq' | 'all'}> = ({d, w = SI.mid, at, dur, color, dash, seed, order}) =>
  d ? <Ink d={d} width={w} at={at} dur={dur} color={color} taper={false} vary={0} dash={dash} seed={seed} order={order} /> : null;

/** Flat shade plane (fill-only, one palette step darker, no outline). */
export const Shade: React.FC<{d?: string; rect?: [number, number, number, number]; color?: string; at?: number; seed?: Seed}> = ({d, rect, color = palette.tan, at, seed}) => <Fill d={d} rect={rect} color={color} at={at} offset={false} mode="snap" seed={seed} />;

/** Hand-drawn rectangle helper re-export (sets mostly use these two). */
export {sketchRect as rectInk, line};

/** Stroke widths compensated for a set scale (thumbnails stay readable): width / sqrt(scale). */
export const wk = (w: number, scale = 1) => w / Math.sqrt(Math.max(0.05, scale));

/** Default ink weights for sets that are re-used far away (multiply). */
export const inkScale = (k: number) => ({front: SI.front * k, mid: SI.mid * k, far: SI.far * k, hair: SI.hair * k});

export const ink = stroke;

// ---------------------------------------------------------------- render-state helpers

/** true while the piece at world point p is still paper: the paper Look, or the opening cascade has not reached it. */
export function usePaperAt(p: Pt): boolean {
  const look = useLook();
  const t = useTime();
  const m = useXf();
  if (look.fills === 'paper') return true;
  if (!look.cascade) return false;
  const c = look.cascade;
  const q: Pt = [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
  return t < c.at + Math.hypot(q[0] - c.origin[0], q[1] - c.origin[1]) / (c.speed ?? 2600);
}

/** Children render in the paper Look until the cascade wave reaches p (for raw-SVG / prop pieces that ignore it). */
export const PaperUntilCascade: React.FC<{p: Pt; children?: React.ReactNode}> = ({p, children}) => {
  const paper = usePaperAt(p);
  return paper ? <Look fills="paper">{children}</Look> : <>{children}</>;
};

/** Children render only while the piece at p is paper (hairline outlines for fill-only shapes in the line-art frame). */
export const OnlyWhilePaper: React.FC<{p: Pt; children?: React.ReactNode}> = ({p, children}) => (usePaperAt(p) ? <>{children}</> : null);
