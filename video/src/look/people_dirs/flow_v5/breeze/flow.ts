// FLOW v5, BREEZE: cloth in the air. A garment is authored as it looks in the breeze (air.ts W0); each outline node
// carries a FLOW weight (0 = held by the body: the shoulders, the upwind side; up to 1 = free: a hem's tip, a coat's
// tail) and U, where it sits along its free edge (0 = the held end, 1 = the tail). Each free node swings about a pivot
// a short way above it: out downwind as the air rises, back toward hanging as it falls; on top, ONE FLICK travels along
// the hem, quick out and slower back, from the held end to the tail, which it reaches last, and the freest points
// flap up and down a quarter later and lift as the air rises, so a tail's height lives. The shoulders never move. Pure
// in time.
import {rot, clamp, type Nd, type V2} from './v';
import {W0, type Air} from './air';

/** A flowing outline node: f = the flow weight, u = its place along the free edge (default f), py = the pivot's height
 *  (default: a short way above), ph = its phase, amp = its flick (degrees at W0; default 5). */
export type FN = Nd & {f?: number; u?: number; py?: number; ph?: number; amp?: number};
export const F = (x: number, y: number, f: number, o: {c?: boolean; k?: number; ph?: number; py?: number; amp?: number; u?: number} = {}): FN => ({p: [x, y], f, ...o});

export type FlowCtx = {air: Air; t: number; w: (t: number) => number; top: number};

/** The wave along a free edge (u = 0 the held end .. 1 the tail): one flick, quick out and slower back, that reaches
 *  the tail last, and a slow swell under it. */
export function edgeWave(t: number, u: number, ph: number, T = 0.95): number {
  const th = 2 * Math.PI * (t / T - 0.62 * u) + ph;
  const flick = Math.sin(th + 0.6 * Math.sin(th));
  const slow = Math.sin(2 * Math.PI * (t / (T * 2.7) - 0.25 * u) + 0.6 * ph + 1.3);
  return 0.8 * flick + 0.2 * slow;
}

/** The nodes moved by the air now. */
export function flowNodes(ns: FN[], cx: FlowCtx): Nd[] {
  const d = cx.air.dir;
  return ns.map((n) => {
    const f = n.f ?? 0;
    if (f <= 0) return {p: n.p, c: n.c, k: n.k};
    const u = n.u ?? f;
    const ph = n.ph ?? 0;
    // the air reaches the tail a little later than the held end
    const wl = cx.w(cx.t - 0.35 * u);
    const k = clamp(wl / W0, 0.3, 1.8);
    const amp = n.amp ?? 5;
    // the swing (degrees): downwind above the breeze, toward hanging in a lull, and the flick on top; the pivot sits a
    // short way above the node (cloth swings from where it is last held)
    const deg = f * (16 * (wl - W0)) / W0 + (0.3 + 0.7 * f) * amp * k * edgeWave(cx.t, u, ph);
    const R = clamp(n.p[1] - (n.py ?? cx.top), 70, 170);
    const piv: V2 = [n.p[0] - d * 8, n.p[1] - R];
    const p = rot(n.p, piv, -d * deg);
    // the flap: the freest points rise and drop with the same wave a quarter later; and they lift as the air rises
    // above the breeze (a gust lifts a tail, a lull lets it down)
    const flap = f * f * k * amp * 1.6 * edgeWave(cx.t - 0.24, u, ph + 1.2);
    const lift = Math.pow(f, 1.5) * 34 * clamp((wl - W0) / W0, -0.6, 1.2);
    return {p: [p[0], p[1] - flap - lift], c: n.c, k: n.k};
  });
}
