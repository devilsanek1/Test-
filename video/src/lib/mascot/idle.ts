// Idle life: tiny, deterministic functions of time (seconds) and seed. All return small values
// that pose builders turn into angles/offsets. Nothing here reads frames, so 30 and 60 fps match.
import {clamp, rand, smooth} from './ink';

const TAU = Math.PI * 2;

/** 0 = open, 1 = shut. Blinks every ~2.6-5 s, sometimes a double blink. */
export const blink = (t: number, seed: number): number => {
  const bin = 3.4;
  const k = Math.floor(t / bin);
  let v = 0;
  for (let j = k - 1; j <= k; j++) {
    const at = j * bin + 0.3 + rand(seed + 3, j) * (bin - 0.6);
    const one = (c: number) => {
      const d = Math.abs(t - c);
      return 1 - smooth(0.03, 0.09, d);
    };
    v = Math.max(v, one(at));
    if (rand(seed + 9, j) > 0.72) v = Math.max(v, one(at + 0.24));
  }
  return clamp(v);
};

/** Ear angle offset in degrees: slow sway plus an occasional quick flick (damped wobble). */
export const earFlap = (t: number, seed: number, side: 1 | -1 = 1): number => {
  const sway = Math.sin(t * TAU * 0.27 + seed * 1.7 + (side > 0 ? 0 : 0.9)) * 2.2;
  const bin = 4.1;
  const k = Math.floor(t / bin);
  let flick = 0;
  for (let j = k - 1; j <= k; j++) {
    const at = j * bin + 0.8 + rand(seed + 17 + (side > 0 ? 0 : 5), j) * 2.4;
    const d = t - at;
    if (d >= 0 && d < 0.7) flick += Math.sin(d * TAU * 2.6) * Math.exp(-d * 5.5) * 11;
  }
  return sway + flick;
};

/** Tail swish in -1..1: lazy pendulum with a little irregularity. */
export const tailSwish = (t: number, seed: number): number =>
  Math.sin(t * TAU * 0.42 + seed) * 0.75 + Math.sin(t * TAU * 1.13 + seed * 2.3) * 0.25;

/** Trunk sway in -1..1. */
export const trunkSway = (t: number, seed: number): number =>
  Math.sin(t * TAU * 0.31 + seed * 0.7) * 0.7 + Math.sin(t * TAU * 0.83 + seed * 3.1) * 0.3;

/** Breathing in -1..1 (about one breath every 3.2 s). */
export const breath = (t: number, seed: number, period = 3.2): number => Math.sin((t / period) * TAU + seed * 0.37);
