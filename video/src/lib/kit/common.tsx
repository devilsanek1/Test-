// kit/common.tsx — shared helpers for kit components.
//
// Kit convention: every component takes `at` (build start, scene seconds; omit = already built), a `seed`,
// a position (x, y) and usually a scale `s`. Components draw in their own local coordinates and are placed
// with <Place>. Linework compensates for scale (thinner, but not proportionally thinner, when small).

import React from 'react';
import {stroke} from '../theme';

export type At = number | undefined;
/** at + dt, preserving "undefined = already built". */
export const b = (at: At, dt: number): At => (at === undefined ? undefined : at + dt);

/** Local stroke width so that on-screen width ~ base * s^0.45 (small things get slightly thinner lines). */
export const inkW = (s: number, base: number = stroke.ink) => (base * Math.pow(Math.max(0.15, s), 0.45)) / Math.max(0.15, s);

/** Translate + scale (+ optional rotation in degrees) group. */
export const Place: React.FC<{x?: number; y?: number; s?: number; rot?: number; flip?: boolean; children?: React.ReactNode}> = ({x = 0, y = 0, s = 1, rot = 0, flip = false, children}) => {
  const parts: string[] = [];
  if (x || y) parts.push(`translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  if (rot) parts.push(`rotate(${rot.toFixed(2)})`);
  if (s !== 1 || flip) parts.push(`scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)})`);
  return <g transform={parts.length ? parts.join(' ') : undefined}>{children}</g>;
};
