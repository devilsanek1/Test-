// lib/figure wind: the ONE flowing element's secondary motion (the scarf's free end; docs/look/paint_recipes/people.md
// §e). Measured on the owner's 9:16 motion reference (refs_human_scale/04_cloud_beast_motion.mp4): her ribbons flutter
// with a period of ~1.0 s (0.75-1.25 s, never quite regular) under a slower gust swell of ~2.2 s; the tip swings about
// +-25 degrees while the root, pinned at the head, barely moves; the bend travels from the root to the tip (the tip is
// over half a cycle behind); the body stays still. A flag's flutter obeys f ~ St U / L (St 0.1-1): a gentle breeze on
// a ~0.5 m scarf end gives ~1 Hz, the same number.
//
// The end is an INEXTENSIBLE chain: each segment's angle is the rest angle plus a travelling wave whose amplitude grows
// toward the tip (overlapping action: every segment repeats the one before it, later and bigger), so the scarf never
// stretches or shrinks as it moves. Two incommensurate periods (T1, T2) keep it from looping visibly.
import {type Pt, add, deg, norm, sub} from './geom';

export type Wind = {
  /** Time in seconds (the phase of the cycle). */
  t: number;
  /** 0 = still air (the end hangs), 1 = the reference's breeze (default 1). */
  strength?: number;
};

export const WIND = {
  /** The flutter period (s): the reference's ~1.0 s. */
  T1: 1.0,
  /** The gust swell (s): the reference's ~2.2 s; incommensurate with T1. */
  T2: 2.3,
  /** Phase lag root -> tip, in cycles of T1 (the tip ~0.6 of a cycle behind the root). */
  lag: 0.6,
  /** Wave amplitude (degrees of bend per segment) at the root and at the tip. */
  ampRoot: 8,
  ampTip: 36,
  /** The gust's swing of the whole end (degrees) and the second wave's share. */
  gustSwing: 7,
  gustK: 0.35,
  /** The weight: each segment hangs this much more (degrees) from the root to the tip (wool, not silk). */
  sag: 34,
} as const;

/** The centreline of a free end: from `root`, `length` long, its rest direction `rest` degrees (screen angle: 0 = to
 *  the screen right, 90 = straight down), sagging toward hanging (90) as the wind drops. `side` = +1 if the wind blows
 *  toward the screen right, -1 toward the left (mirrors the bend). */
export function endChain(root: Pt, length: number, rest: number, wind: Wind, side: 1 | -1 = 1, n = 12): Pt[] {
  const s0 = wind.strength ?? 1;
  const t = wind.t;
  const base = rest + (90 - rest) * (1 - s0) * 0.85;
  const pts: Pt[] = [root];
  let p = root;
  const segL = length / n;
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) / n;
    const amp = (WIND.ampRoot + (WIND.ampTip - WIND.ampRoot) * Math.pow(s, 1.3)) * s0;
    const w1 = Math.sin(2 * Math.PI * (t / WIND.T1 - WIND.lag * s));
    const w2 = Math.sin(2 * Math.PI * (t / WIND.T2 - 0.35 * s) + 1.3);
    const gust = WIND.gustSwing * s0 * Math.sin(2 * Math.PI * (t / WIND.T2));
    // each segment's angle: the rest, the gust lift, and the travelling bend (cumulative bends are kept small)
    const a = base + WIND.sag * s - gust + (amp * w1 + amp * WIND.gustK * w2) * (i === 0 ? 0.3 : 1);
    const dir: Pt = [Math.cos(deg(a)) * side, Math.sin(deg(a))];
    p = add(p, [dir[0] * segL, dir[1] * segL]);
    pts.push(p);
  }
  return pts;
}

/** A ribbon's outline around a centreline: half-width w0 at the root to w1 at the tip; returns the two edges (left =
 *  the upper edge for an end blowing to the right) and the loop's control points. */
export function ribbonEdges(c: Pt[], w0: number, w1: number): {top: Pt[]; bot: Pt[]} {
  const n = c.length;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(n - 1, i + 1)];
    const tv = norm(sub(b, a));
    const nv: Pt = [tv[1], -tv[0]];
    const w = w0 + (w1 - w0) * (i / (n - 1));
    top.push([c[i][0] + nv[0] * w, c[i][1] + nv[1] * w]);
    bot.push([c[i][0] - nv[0] * w, c[i][1] - nv[1] * w]);
  }
  return {top, bot};
}
