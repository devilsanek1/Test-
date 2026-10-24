// cine/state.tsx — how cine pieces take part in the core RENDER STATES: the un-build (useExit: loosen -> fills shrink,
// small first -> ink retracts -> the slab collapses last) and the Look (paper = white fills + ink, cascade = paper
// until a wave from the vanishing point reaches each piece, ink={false} = fills only). Batched cine geometry cannot
// go through <Fill>/<Ink> element by element, so each piece applies the same recipe per building / row / figure:
//
//   const S = useCineState();                         // {t, e, look, m}
//   const k = exitScale(S.e, jitter, size);          // 1 built .. 0 gone (ease-in, small pieces first)
//   const inkOn = S.look.ink && !inkGone(S.e);       // batched ink drops at exitInkProgress 0.5
//   const fill = lookPaint(S, color, [x, y]);         // white in paper / before the cascade wave
//   <CineExitShrink x y jitter size axis> ... </CineExitShrink>   // shrink a group about its base point

import React from 'react';
import {ease as E, useTime} from '../time';
import {exitFillProgress, exitInkProgress, LookV, useExit, useLook} from '../exit';
import {mat, Mat, useXf, XG} from '../xf';
import {palette, world} from '../theme';
import type {Pt} from '../sketch';

export type CineState = {t: number; e: number; look: LookV; m: Mat};

/** Scene time, exit value, Look and the accumulated transform (layer -> screen) for this subtree. */
export function useCineState(): CineState {
  return {t: useTime(), e: useExit(), look: useLook(), m: useXf()};
}

/** Fill scale while un-building: 1 (built) -> 0 (gone), ease-in. size 0..1 = sqrt(screen area share); >= 0.74 is the
 *  background slab and goes last. */
export const exitScale = (e: number, jitter = 0, size = 0) => (e <= 0 ? 1 : 1 - E.inCubic(exitFillProgress(e, jitter, size)));

/** Batched ink is dropped once its retract would be half done (core Ink undraws; a batched path pops out). */
export const inkGone = (e: number, jitter = 0) => e > 0 && exitInkProgress(e, jitter) >= 0.5;

/** Ink visible under the current state. */
export const inkOn = (S: CineState, jitter = 0) => S.look.ink && !inkGone(S.e, jitter);

/** A layer-space point on screen. */
export const toScreen = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

/** Screen-area share (sqrt) of a layer-space box, for exit ordering. */
export const screenSize = (m: Mat, w: number, h: number) => Math.sqrt(Math.min(1, (Math.abs(w * h) * Math.abs(m[0] * m[3] - m[1] * m[2])) / (world.w * world.h)));

/** Uniform screen scale of the current transform. */
export const xfScale = (m: Mat) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

/** Paint under the Look: 'paper' -> white; 'none' -> 'none'; cascade -> white until the wave (from look.cascade.origin,
 *  screen px) reaches the piece's screen point `p` (layer coords). Otherwise the colour itself. */
export function lookPaint(S: CineState, color: string, p?: Pt): string {
  const L = S.look;
  if (L.fills === 'none') return 'none';
  if (L.fills === 'paper') return palette.white;
  if (L.cascade && p) {
    const c = L.cascade;
    const q = toScreen(S.m, p);
    if (S.t < c.at + Math.hypot(q[0] - c.origin[0], q[1] - c.origin[1]) / (c.speed ?? 2600)) return palette.white;
  }
  return color;
}

/** true while the piece at `p` is still paper (paper Look, or the cascade has not reached it). Fill-only shapes get a
 *  hairline ink outline in that state, so the frame-0 / loop frame reads as line art. */
export function isPaper(S: CineState, p?: Pt): boolean {
  const L = S.look;
  if (L.fills === 'paper') return true;
  if (L.cascade && p) {
    const q = toScreen(S.m, p);
    return S.t < L.cascade.at + Math.hypot(q[0] - L.cascade.origin[0], q[1] - L.cascade.origin[1]) / (L.cascade.speed ?? 2600);
  }
  return false;
}

/** Shrink children about (x, y) with the un-build (axis 'y' = sink into the base, 'xy' = shrink to the point), with the
 *  cine exit ordering (`size` = screen size share: small first). Named CineExitShrink so the barrels never export two
 *  different `ExitShrink`s: for the MASCOT / any raw-SVG character use the core `ExitShrink` (lib/exit: shrink to the
 *  feet with the fills' window). */
export const CineExitShrink: React.FC<{x: number; y: number; jitter?: number; size?: number; axis?: 'xy' | 'y'; children?: React.ReactNode}> = ({x, y, jitter = 0.5, size = 0.2, axis = 'xy', children}) => {
  const e = useExit();
  const k = exitScale(e, jitter, size);
  if (k >= 1) return <>{children}</>;
  if (k <= 0.002) return null;
  return <XG m={mat.about(mat.scale(axis === 'y' ? 1 : k, k), x, y)}>{children}</XG>;
};

/** Seeded 0..1 jitter from a number (cheap, deterministic). */
export const jit = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
