// Motion helpers for the mascot. Everything is a pure function of time in SECONDS.
import {clamp, lerp, smooth} from './ink';
import type {Expression, PoseName} from './poses';

const easeOutBack = (k: number, s = 1.9) => {
  const u = k - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};

/** Pop entrance: returns a scale multiplier (0 -> overshoot -> 1) and a squash to pass to <Elephant>. */
export const popIn = (t: number, t0: number, dur = 0.45) => {
  const k = clamp((t - t0) / dur);
  if (k <= 0) return {scale: 0, squash: 0, visible: false};
  const s = easeOutBack(k);
  // stretch on the way up, tiny squash as it settles
  const squash = -0.16 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k) + 0.05 * Math.sin(Math.PI * clamp((k - 0.55) / 0.45));
  return {scale: Math.max(0, s), squash, visible: true};
};

/** Draw-on entrance: 0..1 for <Elephant draw>. Lines draw first, fills land in the last ~40%. */
export const drawIn = (t: number, t0: number, dur = 1.0) => clamp((t - t0) / dur);

/** Reverse of drawIn (un-build): 1..0. */
export const drawOut = (t: number, t0: number, dur = 0.7) => 1 - clamp((t - t0) / dur);

export type HopOpts = {
  t: number;
  t0: number; // takeoff moment (s)
  dur?: number; // airtime (s)
  from: {x: number; y: number};
  to: {x: number; y: number};
  height?: number; // apex above the higher end (px)
};

/**
 * Hop arc with anticipation crouch (0.14 s before t0), stretch in the air and a squash on landing.
 * Pass x, y, squash, rotate to <Elephant>; during the air use pose 'stand-side' with amount={spread} for a leap
 * (legs reach fore and aft, ears and tail lift). k: 0 before takeoff .. 1 after landing.
 */
export const hop = ({t, t0, dur = 0.42, from, to, height = 40}: HopOpts) => {
  const pre = 0.14;
  const post = 0.32;
  const dir = Math.sign(to.x - from.x) || 1;
  if (t < t0 - pre) return {x: from.x, y: from.y, squash: 0, rotate: 0, airborne: false, k: 0, spread: 0};
  if (t < t0) {
    const a = smooth(t0 - pre, t0, t);
    return {x: from.x, y: from.y, squash: 0.2 * Math.sin((a * Math.PI) / 2), rotate: 0, airborne: false, k: 0, spread: 0};
  }
  if (t < t0 + dur) {
    const k = (t - t0) / dur;
    const top = Math.min(from.y, to.y) - height;
    // quadratic Bezier through an apex control point
    const cy = 2 * top - (from.y + to.y) / 2;
    const x = lerp(from.x, to.x, k);
    const y = (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * cy + k * k * to.y;
    const squash = -0.22 * (1 - Math.sin(Math.PI * k)) * (k < 0.5 ? 1 : 0.6) - 0.04;
    const rotate = -dir * 10 * Math.cos(Math.PI * k); // nose up at takeoff, down on landing
    return {x, y, squash, rotate, airborne: true, k, spread: Math.sqrt(Math.sin(Math.PI * k))};
  }
  const d = t - t0 - dur;
  if (d < post) {
    const squash = 0.24 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2);
    return {x: to.x, y: to.y, squash, rotate: 0, airborne: false, k: 1, spread: 0};
  }
  return {x: to.x, y: to.y, squash: 0, rotate: 0, airborne: false, k: 1, spread: 0};
};

/** Squash curve for a quick pose "pop" at tSwitch (anticipate, switch at peak squash, overshoot stretch, settle). */
export const popSwitch = (t: number, tSwitch: number) => {
  const d = t - tSwitch;
  if (d < -0.1 || d > 0.45) return 0;
  if (d < 0) return 0.14 * smooth(-0.1, 0, d);
  return 0.14 * Math.exp(-d * 9) * Math.cos(d * Math.PI * 2 * 3.4);
};

export type PoseKey = {
  t: number; // seconds at which this pose starts
  pose: PoseName;
  expression?: Expression;
  look?: number;
  amount?: number;
};

/** Which pose is active at t, plus the previous one and the time since the switch. */
export const poseAt = (keys: PoseKey[], t: number) => {
  let i = 0;
  for (let j = 0; j < keys.length; j++) if (t >= keys[j].t) i = j;
  return {cur: keys[i], prev: i > 0 ? keys[i - 1] : null, since: t - keys[i].t, next: keys[i + 1] ?? null};
};
