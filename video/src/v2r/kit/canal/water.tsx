// canal/water.tsx: the canal. A flat water band that is never bare: the far bank's shadow, broken reflections of
// what stands on the bank, ripple dashes drifting with the current, glints that switch on and off (life), and an
// optional wake behind a moving boat. No gradient, no opacity: every mark is a flat shape in the palette.

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {Batch, Paint, P, rng, frac, lerp, ovalPath} from './core';

export type Reflection = {
  /** Screen x range of the thing reflected (a facade, a boat, a lamp post). */
  x0: number;
  x1: number;
  color: string;
  /** How far down the water it reaches (px from the water's top edge). */
  depth?: number;
};

export type WaterProps = {
  y0: number;
  y1: number;
  x0?: number;
  x1?: number;
  seed: string;
  reflections?: Reflection[];
  /** Height of the dark band under the far coping (px). */
  bankShade?: number;
  /** Ripple dashes (count) and glints (count). */
  ripples?: number;
  glints?: number;
  /** Current speed (px/s, negative = flowing left). */
  current?: number;
  /** A wake behind a boat: its stern x (screen) at t, the water line y and the wake's direction (-1 = boat moves left). */
  wake?: {x: (t: number) => number; y: number; dir: 1 | -1; len?: number};
  /** Perspective: ripples near the bottom grow by this factor (1 = flat). */
  near?: number;
  /** Where the reflections start (the far coping's foot); default y0 + bankShade. */
  reflTop?: number;
};

export const Water: React.FC<WaterProps> = ({y0, y1, x0 = -40, x1 = 1120, seed, reflections = [], bankShade = 10, ripples = 26, glints = 14, current = -10, wake, near = 1.6, reflTop}) => {
  const t = useTime();
  const H = y1 - y0;
  // static base: the water, the bank shade, the reflections' broken strips (they wobble slowly: per frame below)
  const base = useMemo(() => {
    const b = new Batch();
    b.rect(CM.water, x0, y0, x1 - x0, H);
    b.rect(CM.waterDeep, x0, y0, x1 - x0, bankShade);
    return b;
  }, [x0, x1, y0, H, bankShade]);
  const b = new Batch();
  const r = rng(seed);
  // reflections: stacked horizontal dashes under each source, shorter and sparser with depth, wobbling sideways
  reflections.forEach((ref, i) => {
    const rt = reflTop ?? y0 + bankShade;
    const depth = Math.min(y1 - rt - 4, ref.depth ?? (y1 - rt) * 0.6);
    const rows = Math.max(3, Math.round(depth / 7));
    const W = ref.x1 - ref.x0;
    for (let k = 0; k < rows; k++) {
      const yy = rt + 2 + (k / rows) * depth;
      const keep = 1 - k / rows;
      const hh = Math.max(2, 3 + k * 0.3);
      // short broken dashes scattered across the source's width, sparser and shorter with depth
      let x = ref.x0 + r.range(0, 30);
      while (x < ref.x1) {
        const len = Math.min(ref.x1 - x, r.range(14, 46) * (0.5 + keep * 0.6) * Math.max(0.5, Math.min(1.4, W / 300)));
        if (r.chance(0.35 + 0.5 * keep)) {
          const xx = x + Math.sin(t * 1.1 + k * 0.9 + i + x * 0.01) * (2 + k * 0.4);
          b.fill(ref.color, `M${P(xx, yy)}L${P(xx + len, yy)}L${P(xx + len - 2, yy + hh)}L${P(xx + 2, yy + hh)}Z`);
        }
        x += len + r.range(8, 30) * (1.2 - keep * 0.5);
      }
    }
  });
  b.layer();
  // ripple dashes: thin lenses in the deep water colour, drifting with the current, bigger near the bottom
  const span = x1 - x0;
  for (let i = 0; i < ripples; i++) {
    const v = r.next();
    const yy = y0 + bankShade + 6 + v * (H - bankShade - 10);
    const s = lerp(1, near, v);
    const w = r.range(22, 70) * s;
    const x = x0 + frac((r.range(0, span) + current * s * t) / span) * span;
    const hh = 2.2 * s;
    b.fill(CM.waterDeep, `M${P(x - w / 2, yy)}Q${P(x, yy - hh)} ${P(x + w / 2, yy)}Q${P(x, yy + hh)} ${P(x - w / 2, yy)}Z`);
  }
  // glints: short paper dashes that switch on and off (each on a seeded 1.4-3 s clock, lit ~40 % of it)
  for (let i = 0; i < glints; i++) {
    const v = r.next();
    const yy = y0 + bankShade + 4 + v * (H - bankShade - 8);
    const per = r.range(1.4, 3);
    const on = frac(t / per + r.next()) < 0.42;
    const s = lerp(1, near, v);
    const x = r.range(x0 + 20, x1 - 20) + Math.sin(t * 0.8 + i) * 6;
    if (on) b.fill(CM.paper, `M${P(x - 9 * s, yy)}L${P(x + 9 * s, yy - 1)}L${P(x + 7 * s, yy + 2.2 * s)}L${P(x - 7 * s, yy + 2.2 * s)}Z`);
  }
  // wake: a fan of paper dashes trailing a moving stern
  if (wake) {
    const sx = wake.x(t);
    const len = wake.len ?? 260;
    for (let k = 0; k < 9; k++) {
      const u = (k + frac(t * 1.5)) / 9;
      const xx = sx - wake.dir * u * len;
      const spread = 6 + u * 34;
      const w = 18 * (1 - u * 0.6);
      b.fill(CM.paper, ovalPath(xx, wake.y + spread * 0.25, w, 2.2));
      b.fill(CM.paper, ovalPath(xx - wake.dir * 8, wake.y + spread, w * 0.8, 2.2));
    }
  }
  return (
    <>
      <Paint b={base} seed={`water/${seed}`} misreg={false} />
      <Paint b={b} seed={`waterlife/${seed}`} misreg={false} />
    </>
  );
};

/** A stone coping (the canal's edge): a thin limestone strip with joints and a dark lip line toward the water. */
export function copingInto(b: Batch, x0: number, x1: number, y: number, h: number, seed: string, ink = 2.2) {
  const r = rng(seed);
  b.rect(CM.limestone, x0, y, x1 - x0, h);
  b.rect(CM.stoneShade, x0, y + h * 0.72, x1 - x0, h * 0.28);
  let x = x0;
  let d = '';
  while (x < x1) {
    x += r.range(70, 130) * Math.max(0.5, h / 14);
    d += `M${P(x, y + 1)}L${P(x + r.jitter(1), y + h * 0.7)}`;
  }
  b.ink(d, Math.max(1.2, ink * 0.6));
  b.ink(`M${P(x0, y)}L${P(x1, y + r.jitter(1))}`, ink, CM.ink, 0.25);
}
