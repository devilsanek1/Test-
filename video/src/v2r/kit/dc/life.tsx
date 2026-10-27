// dc/life.tsx: the Arlington kit's moving life that is not tied to one plane (TREATMENT section 6; CINEMATIC_GUIDE
// Scale cues 11): a V of birds crossing toward the landmark in the hold, and a few gulls wheeling over the valley.
// Pure functions of scene time; never in the caption band (y 317-556); flat shapes, flapping 3-4 Hz, never a fade.

import React from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {mix} from './core';

/** One bird: a flat "m" (two wing strokes) of span w, flap phase in 0..1 (wings up -> down). */
export function birdD(x: number, y: number, w: number, phase: number): string {
  const up = Math.cos(phase * Math.PI * 2); // 1 up, -1 down
  const tip = -w * 0.26 * up;
  const mid = -w * 0.06 * up;
  return `M${(x - w / 2).toFixed(1)} ${(y + tip).toFixed(1)}Q${(x - w * 0.22).toFixed(1)} ${(y + mid - w * 0.08).toFixed(1)} ${x.toFixed(1)} ${(y + w * 0.04).toFixed(1)}Q${(x + w * 0.22).toFixed(1)} ${(y + mid - w * 0.08).toFixed(1)} ${(x + w / 2).toFixed(1)} ${(y + tip).toFixed(1)}`;
}

export type BirdVProps = {
  /** Scene time the V enters (CINEMATIC_GUIDE: at 70-80 % of the move). */
  at: number;
  /** Entry and exit points (screen), crossing in `dur` s. */
  from: [number, number];
  to: [number, number];
  dur?: number;
  /** Lead bird span (px); the others get smaller toward the back (a size ladder), far ones paler. */
  span?: number;
  n?: number;
  /** Clamp: never above this y (the caption band ends at 556). */
  minY?: number;
  seed?: string;
};

/** A V of birds (5-6 wingspans/s, flap ~3.5 Hz), crossing toward the landmark. */
export const BirdV: React.FC<BirdVProps> = ({at, from, to, dur = 2.2, span = 30, n = 7, minY = 580, seed = 'v'}) => {
  const t = useTime();
  if (t < at || t > at + dur + 0.3) return null;
  const k = (t - at) / dur;
  const hx = from[0] + (to[0] - from[0]) * k;
  const hy = from[1] + (to[1] - from[1]) * k;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  let near = '';
  let far = '';
  for (let i = 0; i < n; i++) {
    const rank = Math.ceil(i / 2);
    const side = i === 0 ? 0 : i % 2 ? 1 : -1;
    const back = rank * span * 0.95;
    const lat = side * rank * span * 0.75;
    const x = hx - ux * back - uy * lat;
    const y = Math.max(minY, hy - uy * back + ux * lat + Math.sin(t * 2 + i) * 2);
    const w = span * (1 - rank * 0.09);
    const ph = (t * 3.6 + i * 0.17 + seed.length * 0.1) % 1;
    if (rank >= 2) far += birdD(x, y, w, ph);
    else near += birdD(x, y, w, ph);
  }
  return (
    <>
      <path d={far} stroke={mix(CM.anchor, CM.sky, 0.45)} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d={near} stroke={mix(CM.anchor, CM.sky, 0.2)} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </>
  );
};

/** Gulls wheeling slowly over the valley (2-3 tiny birds on loops below the horizon band), for the hold's life. */
export const Gulls: React.FC<{seed?: string; centre?: [number, number]; r?: [number, number]; n?: number}> = ({seed = 'gull', centre = [640, 700], r = [180, 40], n = 3}) => {
  const t = useTime();
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = t * (0.35 + i * 0.07) + i * 2.1;
    const x = centre[0] + Math.cos(a) * r[0] * (0.7 + i * 0.15);
    const y = centre[1] + Math.sin(a) * r[1] * (0.8 + i * 0.1);
    d += birdD(x, y, 13 - i * 2, (t * 2.4 + i * 0.3) % 1);
  }
  return <path d={d} stroke={mix(CM.anchor, CM.sky, 0.4)} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
};
