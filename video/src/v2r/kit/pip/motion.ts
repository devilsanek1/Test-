// motion.ts — Pip's actions as pure functions of seconds: the hop / leap arc (crouch, take-off stretch, a parabola,
// landing squash with the ears flopping after), riding a boat roof (bob + roll), aiming the head at a screen point,
// and the draw-on / un-build progress curves. Pip.tsx and PipTrack.tsx use them; scenes may too.

import {clamp, lerp, smooth, V2} from './geom';
import {PoseName} from './poses';

export type HopSpec = {
  /** Take-off time (seconds, the feet leave the seat). The crouch starts `crouch` s before. */
  t0: number;
  /** Airtime (s). A small hop 0.32-0.45, a big leap 0.5-0.75. */
  dur: number;
  /** Feet anchors (screen px): the seat it leaves and the seat it lands on (may be off-frame: a leap out of shot). */
  from: V2;
  to: V2;
  /** Apex height above the straight line from -> to (px). */
  height: number;
  /** Airborne shape: 'tuck' (small hop) or 'leap' (big leap). Default by distance. */
  style?: 'tuck' | 'leap';
  /** Crouch before take-off (s). Default 0.12. */
  crouch?: number;
  /** Landing squash + settle (s). Default 0.2. */
  land?: number;
};

export type HopState = {
  x: number;
  y: number;
  /** + squash / - stretch about the feet. */
  squash: number;
  /** Degrees about the feet (leans into the travel direction). */
  rotate: number;
  /** 0..1: blend toward the airborne pose. */
  air: number;
  /** 0..1: blend toward the crouch / landing squash pose. */
  crouch: number;
  /** Ear flop after landing (degrees added to the droop; a damped wobble). */
  earKick: number;
  airborne: PoseName;
  phase: 'before' | 'crouch' | 'air' | 'land' | 'after';
  /** Travel direction on screen: -1 left, +1 right. */
  dir: -1 | 1;
};

export function hopAt(t: number, h: HopSpec): HopState {
  const cr = h.crouch ?? 0.12;
  const ld = h.land ?? 0.2;
  const dir: -1 | 1 = h.to[0] < h.from[0] ? -1 : 1;
  const span = Math.hypot(h.to[0] - h.from[0], h.to[1] - h.from[1]);
  const airborne: PoseName = h.style ?? (span > 260 || h.dur > 0.5 ? 'leap' : 'tuck');
  const base = {earKick: 0, airborne, dir};
  if (t < h.t0 - cr) return {x: h.from[0], y: h.from[1], squash: 0, rotate: 0, air: 0, crouch: 0, phase: 'before', ...base};
  if (t < h.t0) {
    const k = smooth((t - (h.t0 - cr)) / cr);
    return {x: h.from[0], y: h.from[1], squash: 0.16 * k, rotate: -dir * 3 * k, air: 0, crouch: k, phase: 'crouch', ...base};
  }
  const t1 = h.t0 + h.dur;
  if (t < t1) {
    const k = (t - h.t0) / h.dur;
    const x = lerp(h.from[0], h.to[0], k);
    const y = lerp(h.from[1], h.to[1], k) - h.height * 4 * k * (1 - k);
    // stretch on take-off, round at the apex, a little stretch before the landing
    const squash = k < 0.5 ? -0.16 * (1 - k * 2) : -0.06 * smooth((k - 0.5) * 2);
    const vy = (h.to[1] - h.from[1]) - h.height * 4 * (1 - 2 * k);
    const vx = h.to[0] - h.from[0];
    const lean = clamp((Math.atan2(vy, Math.abs(vx) + 1e-6) * 180) / Math.PI, -60, 60) * 0.18 * dir;
    const air = smooth(Math.min(1, k / 0.18)) * (1 - smooth((k - 0.86) / 0.14));
    return {x, y, squash, rotate: lean, air, crouch: Math.max(0, 1 - k / 0.15), phase: 'air', ...base};
  }
  if (t < t1 + ld) {
    const k = (t - t1) / ld;
    const squash = 0.2 * Math.sin(Math.PI * Math.min(1, k * 1.25)) * (1 - k * 0.3);
    return {...base, x: h.to[0], y: h.to[1], squash, rotate: 0, air: 0, crouch: Math.sin(Math.PI * k), earKick: earFlop(t - t1), phase: 'land'};
  }
  return {...base, x: h.to[0], y: h.to[1], squash: 0, rotate: 0, air: 0, crouch: 0, earKick: earFlop(t - t1), phase: 'after'};
}

/** The ears' follow-through after a landing: flop down, bounce, settle (degrees, ~0.6 s). */
export function earFlop(dt: number): number {
  if (dt < 0 || dt > 0.9) return 0;
  return 30 * Math.exp(-dt * 6.5) * Math.sin(dt * 15 + 0.3);
}

/** Riding a boat roof: a gentle bob and roll (px, degrees). `rate` = waves per second. */
export function rideAt(t: number, amp = 1.6, rate = 0.55, phase = 0): {dy: number; rotate: number} {
  const w = t * rate * Math.PI * 2 + phase;
  return {dy: amp * Math.sin(w) + amp * 0.35 * Math.sin(w * 2.3 + 1), rotate: 1.2 * Math.sin(w + 0.9)};
}

/** Head aim at a screen point from Pip's head (screen px): look -1..1 (left/right), lookUp -1..1. */
export function aimAt(head: V2, target: V2): {look: number; lookUp: number} {
  const dx = target[0] - head[0];
  const dy = target[1] - head[1];
  const look = clamp(dx / (Math.abs(dx) + 170), -1, 1) * 1.15;
  const lookUp = clamp(-dy / (Math.abs(dy) + 420), -0.6, 1) * 1.2;
  return {look: clamp(look, -1, 1), lookUp: clamp(lookUp, -0.6, 1)};
}

/** Draw-on progress for a Pip that draws itself from t0 over dur (default 0.9 s; the pen, then the fills). */
export const drawOn = (t: number, t0: number, dur = 0.9) => clamp((t - t0) / dur);
/** Un-build progress (0.5 s, the engine's recipe) from t0. */
export const unBuild = (t: number, t0: number, dur = 0.5) => clamp((t - t0) / dur);
