// kit/idle.ts: the idle layer's clocks (docs/look/LIFE_AND_DENSITY.md §6). Pure functions of scene seconds and a seed:
// deterministic, frame-rate free (60 fps moves every frame), no opacity anywhere. Pieces call these with useTime().
//
//   sway(t, 3, 3)                      +-3 px over a 3 s period (a pothos vine, a sign, laundry)
//   bob(t, 2, 0.5, ph)                 breathing / bobbing
//   ring(t, at, 6)                     a damped jolt after a cause (secondary motion: things hop, a sign swings)
//   twinkle(t, seed, i, n)             is bulb i of n dimmed right now (one bulb somewhere every ~0.5 s)
//   windowLit(t, seed, i, n)           is window i of n lit (one window somewhere switches every 0.6-1.5 s)
//   loopPos(t, from, to, speed)        a walker / car that crosses and wraps
//   puffs(t, opts)                     a smoke / steam / plume puff train that rises, drifts and shrinks to nothing
//   sweep(t, ats, dur)                 a headlight band crossing a wall (progress 0..1, or null)
//   stepped(t, 12)                     time quantised to drawn poses (12-24 drawings/s); ambient motion never steps

import {rand} from '../../../lib/rng';

export const TAU = Math.PI * 2;
const frac = (v: number) => v - Math.floor(v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth01 = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};

/** Sinusoidal sway: amplitude `amp` (px or deg), one cycle per `period` s. */
export const sway = (t: number, amp: number, period = 3, phase = 0) => amp * Math.sin((t / period) * TAU + phase);

/** Two-frequency sway (less mechanical: leaves, hanging things). */
export const sway2 = (t: number, amp: number, period = 3, phase = 0) => amp * (0.72 * Math.sin((t / period) * TAU + phase) + 0.28 * Math.sin((t / period) * TAU * 2.37 + phase * 1.9));

/** Bob / breath: amplitude `amp`, `hz` cycles per second. */
export const bob = (t: number, amp: number, hz = 0.5, phase = 0) => amp * Math.sin(t * hz * TAU + phase);

/** A damped oscillation that starts at `at` (0 before): a jolt, a swing after a push, a hop that settles. */
export const ring = (t: number, at: number | undefined, amp: number, hz = 3, decay = 5) => {
  if (at === undefined || t < at) return 0;
  const d = t - at;
  return amp * Math.sin(d * hz * TAU) * Math.exp(-d * decay);
};

/** Sum of ring() over several causes. */
export const rings = (t: number, ats: number[] | undefined, amp: number, hz = 3, decay = 5) => (ats ?? []).reduce((s, a) => s + ring(t, a, amp, hz, decay), 0);

/** A quick up-and-down hop (0 -> -h -> 0) over `dur` from `at`; 0 outside. */
export const hopY = (t: number, at: number | undefined, h: number, dur = 0.28) => {
  if (at === undefined || t < at || t > at + dur) return 0;
  const k = (t - at) / dur;
  return -h * 4 * k * (1 - k);
};

/** Time quantised to `fps` drawings per second (drawn poses only; ambient motion animates every frame). */
export const stepped = (t: number, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

/** Eased 0..1 progress of [at, at + dur] (smoothstep); 0 before, 1 after. */
export const ease01 = (t: number, at: number, dur: number) => smooth01((t - at) / Math.max(1e-6, dur));

// ---------------------------------------------------------------- seeded event schedules (cached)

const evCache = new Map<string, number[]>();

/** Seeded event times in [t0, t1): successive gaps uniform in [g0, g1]. Cached per argument set. */
export function events(seed: string, t0 = -6, t1 = 90, gap: [number, number] = [0.6, 1.5]): number[] {
  const key = `${seed}|${t0}|${t1}|${gap[0]}|${gap[1]}`;
  let ev = evCache.get(key);
  if (!ev) {
    ev = [];
    let x = t0 + rand(seed, 'first') * gap[1];
    let k = 0;
    while (x < t1 && k < 4000) {
      ev.push(x);
      x += gap[0] + (gap[1] - gap[0]) * rand(seed, `g${k}`);
      k++;
    }
    if (evCache.size > 500) evCache.clear();
    evCache.set(key, ev);
  }
  return ev;
}

/** Index of the last event <= t (-1 if none). */
function lastIdx(ev: number[], t: number): number {
  let lo = 0;
  let hi = ev.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (ev[m] <= t) {
      ans = m;
      lo = m + 1;
    } else hi = m - 1;
  }
  return ans;
}

/** Bulb `i` of `n` is dimmed for `dur` at seeded moments; across the string a bulb twinkles about every `every` s
 *  (the plan: a bulb twinkles every ~0.5 s). */
export function twinkle(t: number, seed: string, i: number, n: number, every = 0.5, dur = 0.14): boolean {
  if (n <= 0) return false;
  const ev = events(`tw/${seed}`, -4, 120, [every * 0.6, every * 1.4]);
  const k = lastIdx(ev, t);
  for (let j = k; j >= 0 && t - ev[j] < dur; j--) {
    if (Math.floor(rand(`tw/${seed}`, `i${j}`) * n) === i) return true;
  }
  return false;
}

export type WindowForce = {i: number; t: number; on: boolean};

const winCache = new Map<string, {init: boolean[]; toggles: number[][]}>();

/** Window `i` of `n` is lit? One window somewhere toggles at each event (gaps 0.6-1.5 s by default); `litFrac` of the
 *  windows start lit. `force` pins a window's state from a time on (a scripted "the neighbour's light goes off at 4.6"). */
export function windowLit(t: number, seed: string, i: number, n: number, opts: {gap?: [number, number]; litFrac?: number; force?: WindowForce[]} = {}): boolean {
  const gap = opts.gap ?? [0.6, 1.5];
  const litFrac = opts.litFrac ?? 0.7;
  const key = `${seed}|${n}|${gap.join(',')}|${litFrac}`;
  let W = winCache.get(key);
  if (!W) {
    const init = Array.from({length: n}, (_, k) => rand(`win/${seed}`, `init${k}`) < litFrac);
    const toggles: number[][] = Array.from({length: n}, () => []);
    const ev = events(`win/${seed}`, -6, 120, gap);
    ev.forEach((e, k) => {
      toggles[Math.floor(rand(`win/${seed}`, `w${k}`) * n) % n].push(e);
    });
    W = {init, toggles};
    if (winCache.size > 400) winCache.clear();
    winCache.set(key, W);
  }
  // a forced state wins from its time on
  let forced: WindowForce | null = null;
  for (const f of opts.force ?? []) if (f.i === i && t >= f.t && (!forced || f.t > forced.t)) forced = f;
  if (forced) return forced.on;
  const c = lastIdx(W.toggles[i] ?? [], t) + 1;
  return c % 2 === 1 ? !W.init[i] : W.init[i];
}

// ---------------------------------------------------------------- movers

/** A mover that crosses from `from` to `to` at `speed` px/s and wraps (with `pause` s off-screen between passes);
 *  `phase` 0..1 = where it is at t = 0. Returns the point, the progress u (0..1) and whether it is on the path. */
export function loopPos(t: number, from: [number, number], to: [number, number], speed: number, phase = 0, pause = 0) {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  const T = L / Math.max(1e-6, speed) + pause;
  const v = frac(t / T + phase) * T;
  const u = v / (L / Math.max(1e-6, speed));
  const on = u <= 1;
  const k = Math.min(1, u);
  return {x: from[0] + (to[0] - from[0]) * k, y: from[1] + (to[1] - from[1]) * k, u: k, on};
}

/** A one-off crossing between t0 and t1 (linear); null outside the window. */
export function crossing(t: number, t0: number, t1: number, from: [number, number], to: [number, number]) {
  if (t < t0 || t > t1) return null;
  const k = (t - t0) / Math.max(1e-6, t1 - t0);
  return {x: from[0] + (to[0] - from[0]) * k, y: from[1] + (to[1] - from[1]) * k, u: k};
}

/** Back-and-forth between a and b: travel `dur` s each way, `hold` s at each end (a forklift, a pacing worker).
 *  Returns x, the direction of travel (+1 toward b), whether it is holding, at which end, and the progress through the
 *  hold (0..1). */
export function shuttle(t: number, a: number, b: number, dur: number, hold = 0.6, phase = 0) {
  const T = 2 * (dur + hold);
  const v = frac(t / T + phase) * T;
  const hk = (u: number) => (hold > 0 ? u / hold : 1);
  if (v < dur) return {x: a + (b - a) * smooth01(v / dur), dir: Math.sign(b - a) || 1, holding: false, end: 0, holdK: 0};
  if (v < dur + hold) return {x: b, dir: Math.sign(b - a) || 1, holding: true, end: 1, holdK: hk(v - dur)};
  if (v < 2 * dur + hold) return {x: b + (a - b) * smooth01((v - dur - hold) / dur), dir: -(Math.sign(b - a) || 1), holding: false, end: 1, holdK: 0};
  return {x: a, dir: -(Math.sign(b - a) || 1), holding: true, end: 0, holdK: hk(v - 2 * dur - hold)};
}

// ---------------------------------------------------------------- puff trains (smoke, steam, plumes)

export type PuffOpts = {
  /** Puffs alive at once (default 5). */
  n?: number;
  /** Seconds from birth to nothing (default 2.6: the plan's 2-3 s loop). */
  life?: number;
  /** Rise over a life (px, default 120). */
  rise?: number;
  /** Sideways drift over a life (px, default 40; + = right). */
  drift?: number;
  /** Radius at birth and at the widest (px). */
  r0?: number;
  r1?: number;
  /** Sideways wobble (px). */
  wobble?: number;
  seed?: string;
  /** Puffs never go above this screen y: they shrink to nothing before it (the caption band rule, default none). */
  ceil?: number;
};

export type Puff = {x: number; y: number; r: number; k: number};

/** The puffs of a train rising from (0, 0) (relative): each grows, then SHRINKS TO NOTHING (no fade), drifting. */
export function puffs(t: number, o: PuffOpts = {}, originY = 0): Puff[] {
  const n = o.n ?? 5;
  const life = o.life ?? 2.6;
  const rise = o.rise ?? 120;
  const drift = o.drift ?? 40;
  const r0 = o.r0 ?? 6;
  const r1 = o.r1 ?? 22;
  const wob = o.wobble ?? 5;
  const seed = o.seed ?? 'puff';
  const out: Puff[] = [];
  for (let i = 0; i < n; i++) {
    const ph = rand(`pf/${seed}`, i) * 0.35;
    const u = frac(t / life + i / n + ph);
    const e = 1 - Math.pow(1 - u, 1.6);
    const x = drift * u + Math.sin(u * 5.2 + i * 1.7) * wob;
    const y = -rise * e;
    let r = u < 0.55 ? r0 + (r1 - r0) * (u / 0.55) : r1 * Math.pow(1 - (u - 0.55) / 0.45, 0.85);
    if (o.ceil !== undefined) {
      const sy = originY + y;
      const room = sy - r - o.ceil;
      if (room < 0) r = Math.max(0, r + room * 1.2);
    }
    if (r > 0.6) out.push({x, y, r, k: u});
  }
  return out;
}

// ---------------------------------------------------------------- sweeps

/** Progress (0..1) of the sweep running at time t among `ats` (each lasting `dur`), or null. */
export function sweep(t: number, ats: number[], dur = 0.8): number | null {
  for (const a of ats) if (t >= a && t <= a + dur) return (t - a) / dur;
  return null;
}

// ---------------------------------------------------------------- the cozy float (a camera that drifts, translation only)

export type FloatOpts = {
  /** The shot's length (s): the legs fill [0, dur]. */
  dur: number;
  seed: string;
  /** Leg speed range (px/s; COZY_AND_SCALE / cozy v2 §3: 8-12, peak <= 25). */
  speed?: [number, number];
  /** Half-extent of the drift box about home (px): [x, y]. Default [12, 10] (O1's set: the window top stays >= 603). */
  box?: [number, number];
  /** Leg length range (s; a turn every 0.6-1.5 s). */
  leg?: [number, number];
  /** Start exactly at home (a matched frame at the cut in). Default true. */
  startHome?: boolean;
  /** Pass through home on the last frame, still moving (the next shot cuts in on axis). Default true. */
  endHome?: boolean;
  /** Eased turn length (s; clamped to under half the shorter leg). Default 0.34. */
  turn?: number;
};

type FloatPlan = {pts: [number, number][]; t: number[]; u: [number, number][]; tau: number};
const FLOAT_CACHE = new Map<string, FloatPlan>();

function floatPlan(o: FloatOpts): FloatPlan {
  const key = JSON.stringify(o);
  const hit = FLOAT_CACHE.get(key);
  if (hit) return hit;
  const [v0, v1] = o.speed ?? [8, 12];
  const [bx, by] = o.box ?? [12, 10];
  const [l0, l1] = o.leg ?? [0.6, 1.5];
  const startHome = o.startHome ?? true;
  const endHome = o.endHome ?? true;
  const n = Math.max(1, Math.round(o.dur / ((l0 + l1) / 2 + 0.0)));
  let best: FloatPlan | null = null;
  let bestErr = Infinity;
  for (let tri = 0; tri < 400 && bestErr > 0; tri++) {
    const R = (k: string) => rand(`float/${o.seed}`, `${tri}/${k}`);
    // leg times: seeded weights, normalised to the shot, each within [l0, l1] when the shot allows
    const wts = Array.from({length: n}, (_, i) => 0.75 + 0.5 * R(`w${i}`));
    const sum = wts.reduce((a, b) => a + b, 0);
    const d = wts.map((w) => (w / sum) * o.dur);
    const t = [0];
    for (const di of d) t.push(t[t.length - 1] + di);
    const pts: [number, number][] = [startHome ? [0, 0] : [(R('sx') * 2 - 1) * bx * 0.6, (R('sy') * 2 - 1) * by * 0.6]];
    let err = 0;
    let prevA = R('a0') * TAU;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      if (i === n - 1 && endHome) {
        pts.push([0, 0]);
        const v = Math.hypot(p[0], p[1]) / d[i];
        err += v < v0 ? v0 - v : v > v1 ? v - v1 : 0;
      } else {
        // a straight leg at a seeded speed, turning 70-180 deg from the last one ("and back")
        const v = v0 + (v1 - v0) * R(`v${i}`);
        const a = i === 0 ? prevA : prevA + Math.PI * (0.39 + 0.61 * R(`a${i}`)) * (R(`s${i}`) < 0.5 ? -1 : 1);
        prevA = a;
        pts.push([p[0] + Math.cos(a) * v * d[i], p[1] + Math.sin(a) * v * d[i]]);
      }
      const q = pts[i + 1];
      err += Math.max(0, Math.abs(q[0]) - bx) + Math.max(0, Math.abs(q[1]) - by);
      err += d[i] < l0 && o.dur >= l0 * n ? l0 - d[i] : d[i] > l1 ? d[i] - l1 : 0;
    }
    if (err < bestErr) {
      bestErr = err;
      const u = d.map((di, i) => [(pts[i + 1][0] - pts[i][0]) / di, (pts[i + 1][1] - pts[i][1]) / di] as [number, number]);
      const tau = Math.min(o.turn ?? 0.34, 0.45 * Math.min(...d));
      best = {pts, t, u, tau};
    }
  }
  FLOAT_CACHE.set(key, best!);
  return best!;
}

/** The cozy float (cozy v2 §3, COZY_AND_SCALE §7.6): the camera's offset from home at t, [dx, dy] px, sub-pixel and
 *  seeded. Straight legs at 8-12 px/s, each turn eased (the velocity blends over `turn` s, so the path keeps the legs'
 *  ends and never leaves the box), a turn every 0.6-1.5 s and back, inside +-box of home; from home at t 0 (a matched
 *  cut in) and back through home on the last frame, still moving (the next shot cuts in on axis). Move the WORLD by
 *  the offset (`mat.translate(dx, dy)` round the set): the captions, UI and paper edge stay fixed. */
export function floatCam(t: number, o: FloatOpts): [number, number] {
  const P = floatPlan(o);
  const n = P.u.length;
  const tt = Math.max(0, Math.min(o.dur, t));
  let i = 0;
  while (i < n - 1 && tt >= P.t[i + 1]) i++;
  // the polyline position, then the eased turn near a corner (a symmetric velocity blend keeps the corners' ends)
  let x = P.pts[i][0] + P.u[i][0] * (tt - P.t[i]);
  let y = P.pts[i][1] + P.u[i][1] * (tt - P.t[i]);
  const h = P.tau / 2;
  const corr = (c: number, ua: [number, number], ub: [number, number]) => {
    // offset of the blended path from the polyline inside [c - h, c + h]
    const s = tt - (c - h);
    if (s <= 0 || s >= P.tau) return;
    const k = s / P.tau;
    const blend = P.tau * (k * k * k - (k * k * k * k) / 2); // integral of smoothstep over [0, k] (times tau)
    // blended: ua * s + (ub - ua) * blend; polyline: ua * s before c, ua * h + ub * (s - h) after
    const poly = s <= h ? [ua[0] * s, ua[1] * s] : [ua[0] * h + ub[0] * (s - h), ua[1] * h + ub[1] * (s - h)];
    x += ua[0] * s + (ub[0] - ua[0]) * blend - poly[0];
    y += ua[1] * s + (ub[1] - ua[1]) * blend - poly[1];
  };
  if (i > 0) corr(P.t[i], P.u[i - 1], P.u[i]);
  if (i < n - 1) corr(P.t[i + 1], P.u[i], P.u[i + 1]);
  return [x, y];
}
