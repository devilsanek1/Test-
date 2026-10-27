// idle.ts — Pip's idle life: always on, pure functions of (seconds, seed). Blink every 2.6-5 s (sometimes double), one
// ear FOLD-AND-FLICK every 4-8 s (the leaf ear folds a little and snaps up, like a leaf turning in the wind), slow ear
// sway, breathing (3.4 s), the scarf tails fluttering, the tuft and the tail swaying, the trunk curling a hair, a tiny
// head drift. Every value is a DELTA added to the pose (see applyIdle), scaled by `amount` (0 = frozen).

import {rand, Seed} from '../../../lib/rng';
import {clamp} from './geom';
import {PoseParams} from './model';

const TAU = Math.PI * 2;

/** Scheduled events (blinks, flicks) from a seed: times in [-20, 120] s, gaps in [lo, hi]. Cached per seed. */
const schedCache = new Map<string, number[]>();
function schedule(seed: Seed, key: string, lo: number, hi: number): number[] {
  const id = `${seed}/${key}/${lo}/${hi}`;
  let s = schedCache.get(id);
  if (!s) {
    s = [];
    let t = -20 + rand(seed, `${key}0`) * hi;
    for (let i = 1; t < 120 && i < 400; i++) {
      s.push(t);
      t += lo + (hi - lo) * rand(seed, `${key}${i}`);
    }
    schedCache.set(id, s);
  }
  return s;
}

/** The event at or just before t (index, start), or null. */
function lastEvent(ev: number[], t: number): [number, number] | null {
  let lo = 0;
  let hi = ev.length - 1;
  if (hi < 0 || ev[0] > t) return null;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (ev[m] <= t) lo = m;
    else hi = m - 1;
  }
  return [lo, ev[lo]];
}

/** Blink 0..1 (1 = shut) at t. 0.13 s close-open; ~25 % of blinks are doubles. */
export function blinkAt(t: number, seed: Seed): number {
  const e = lastEvent(schedule(seed, 'blink', 2.6, 5.0), t);
  if (!e) return 0;
  const [i, t0] = e;
  const one = (u: number) => (u < 0 || u > 1 ? 0 : Math.sin(Math.PI * u));
  const dbl = rand(seed, `dbl${i}`) < 0.25;
  return Math.max(one((t - t0) / 0.13), dbl ? one((t - t0 - 0.22) / 0.13) : 0);
}

/** Ear fold-and-flick: {side: 1 (ear A) | -1 (ear B), k 0..1 with a small settle overshoot} or k 0. */
export function earFlickAt(t: number, seed: Seed): {side: 1 | -1; k: number} {
  const e = lastEvent(schedule(seed, 'flick', 4.0, 8.0), t);
  if (!e) return {side: 1, k: 0};
  const [i, t0] = e;
  return {side: rand(seed, `fs${i}`) < 0.5 ? 1 : -1, k: flickShape(t - t0)};
}

/** The flick curve over 0.34 s: snaps up in 0.06 s, falls back, dips a hair below rest, settles. */
export function flickShape(dt: number): number {
  if (dt < 0 || dt > 0.42) return 0;
  if (dt < 0.06) return Math.sin((dt / 0.06) * (Math.PI / 2));
  if (dt < 0.26) return Math.cos(((dt - 0.06) / 0.2) * (Math.PI / 2));
  return -0.22 * Math.sin(((dt - 0.26) / 0.16) * Math.PI);
}

export type IdleOpts = {
  /** 0..1 multiplier (0 = frozen). */
  amount?: number;
  /** Extra flutter speed (wind; a moving boat), 1 = canal breeze. */
  breeze?: number;
  /** Disable the scheduled ear flick (a scene drives its own). */
  flick?: boolean;
};

/** Add idle life to a pose (returns a new object). */
export function applyIdle(p: PoseParams, t: number, seed: Seed, o: IdleOpts = {}): PoseParams {
  const a = clamp(o.amount ?? 1, 0, 1);
  if (a <= 0) return p;
  const br = o.breeze ?? 1;
  const ph = rand(seed, 'ph') * TAU;
  const q = {...p};
  // breathing
  q.breath += a * Math.sin((t / 3.4) * TAU + ph);
  // blink
  q.eyes = Math.min(q.eyes, 1 - blinkAt(t, seed) * a);
  // ear sway (each ear its own phase) + the fold-and-flick
  q.earDroopA += a * 2.6 * Math.sin(t * 0.27 * TAU + ph);
  q.earDroopB += a * 2.6 * Math.sin(t * 0.25 * TAU + ph + 1.9);
  if (o.flick !== false) {
    const f = earFlickAt(t, seed);
    if (f.k) {
      const k = f.k * a;
      if (f.side === 1) {
        q.earDroopA -= 26 * k;
        q.earSwingA += 12 * k;
        q.earFoldA += 0.28 * Math.max(0, k);
      } else {
        q.earDroopB -= 26 * k;
        q.earSwingB += 12 * k;
        q.earFoldB += 0.28 * Math.max(0, k);
      }
    }
  }
  // scarf: the tails flutter (a travelling wave), the lift breathes with the gusts
  q.flutter += t * (0.9 + 0.7 * br) + 0.15 * Math.sin(t * 0.5 * TAU + ph);
  q.scarfLift += a * (0.1 * Math.sin(t * 0.21 * TAU + ph) + 0.05 * Math.sin(t * 0.67 * TAU)) * br;
  // tuft, tail, trunk, a tiny head drift
  q.tuftLean += a * (7 * Math.sin(t * 0.45 * TAU + ph) + 3 * Math.sin(t * 1.3 * TAU)) * br + q.wind * 6;
  q.tailAngle += a * 8 * Math.sin(t * 0.22 * TAU + ph + 0.7);
  q.trunkSide += a * 5 * Math.sin(t * 0.31 * TAU + ph + 2.3);
  q.trunkCurl += a * 0.05 * Math.sin(t * 0.4 * TAU + ph);
  q.look += a * 0.035 * Math.sin(t * 0.13 * TAU + ph + 0.4);
  q.lookUp += a * 0.03 * Math.sin(t * 0.17 * TAU + ph + 1.1);
  return q;
}
