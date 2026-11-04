// FLOW v5, BREEZE: ONE wind per shot. A breeze, not a gale: a steady air with a slow swell and, when a shot wants it,
// a passing gust that rises and settles. Everything that flows (hair ribbons, hem points, a coat's tail, belt ends)
// reads the SAME air, each a little later the farther it is from where it is held (the root leads, the tip follows)
// and with its own gentle flutter, a travelling wave whose swing grows toward the tip. Every shape is a pure function
// of time (no simulation state): a frame can be drawn alone, in any order, and never pops.
import {clamp, smooth} from './v';

export type Gust = {t: number; dur: number; amp: number};
export type Air = {
  /** +1 blows toward screen-right, -1 toward the left */
  dir: 1 | -1;
  /** the steady strength (0 still .. 1 strong): the BREEZE look is drawn at 0.5 */
  base: number;
  gusts?: Gust[];
  /** the slow swell's share (default 0.1) */
  swell?: number;
  /** a walk's headwind added on top (0 when standing) */
  head?: number;
};
/** The air the breeze shapes are authored at. */
export const W0 = 0.5;

/** The strength of the air at time t (a gust: a quick rise, a slow settle). */
export function airAt(a: Air, t: number): number {
  const sw = a.swell ?? 0.1;
  let w = a.base * (1 + sw * Math.sin((2 * Math.PI * t) / 2.3 + 0.7) + sw * 0.5 * Math.sin((2 * Math.PI * t) / 3.7 + 2.1));
  for (const g of a.gusts ?? []) {
    const u = (t - g.t) / g.dur;
    if (u <= 0 || u >= 1) continue;
    // up in the first third, down over the rest, smooth at both ends
    const env = u < 0.32 ? smooth(0, 0.32, u) : 1 - smooth(0.32, 1, u);
    w += g.amp * env;
  }
  return clamp(w + (a.head ?? 0), 0, 1.4);
}

/** The flutter: a travelling wave along a flowing piece (s = 0 at its root .. 1 at its tip), the tip later and wider. */
export function flutter(t: number, s: number, ph: number, T = 0.82): number {
  const a = Math.sin(2 * Math.PI * (t / T - 0.85 * s) + ph);
  const b = Math.sin(2 * Math.PI * (t / (T * 2.37) - 0.5 * s) + ph * 1.7 + 1.1);
  return 0.72 * a + 0.28 * b;
}

/** A flowing piece's angles (degrees, screen) at strength w: authored at W0 (`rest`), lifted toward `flat` as the
 *  air rises and falling toward `hang` as it drops; plus the flutter, `amp` degrees at the tip at W0. */
export function flowAngles(rest: number[], o: {flat: number[]; hang: number[]; w: (s: number) => number; t: number; ph: number; amp: number; dir: 1 | -1; T?: number}): number[] {
  const n = rest.length;
  return rest.map((r, i) => {
    const s = (i + 0.5) / n;
    const w = o.w(s);
    let a: number;
    if (w >= W0) a = r + (o.flat[i] - r) * clamp((w - W0) / (1 - W0), 0, 1.3);
    else a = r + (o.hang[i] - r) * clamp((W0 - w) / W0, 0, 1);
    const amp = o.amp * (0.18 + 0.82 * Math.pow(s, 1.1)) * clamp(w / W0, 0.25, 1.6);
    return a + amp * flutter(o.t, s, o.ph, o.T) * (i === 0 ? 0.35 : 1);
  });
}

/** Mirror a screen angle authored for a wind to the right into the given wind direction. */
export const mirrorA = (a: number, dir: 1 | -1) => (dir === 1 ? a : 180 - a);
