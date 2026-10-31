// motion.ts: the shared G3 kit's clock math: eases (with the PEAKED ease: still at both ends, fastest on a named
// moment), the multi-key camera, element moves (translate, scale about a pivot, loops), draw / undraw progress.
// scripts/g3/board_lint.py mirrors every formula here (its speed, thread and staging checks): change both together.

import {Easing} from 'remotion';
import type {Cam, CamKey, Camera, Ease, Move, Pt} from './types';

// unveil = trapezoid(0.1, 0.6): accelerate over the first 10 %, cruise, decelerate over the last 60 % (Arcane's reveals)
const trapezoid = (a: number, d: number) => {
  const v = 1 / (1 - a / 2 - d / 2);
  return (u: number) => (u < a ? (v * u * u) / (2 * a) : u <= 1 - d ? v * (u - a / 2) : 1 - (v * (1 - u) * (1 - u)) / (2 * d));
};
const EASE: Record<Exclude<Ease, number[]>, (x: number) => number> = {
  inout: Easing.inOut(Easing.sin), out: Easing.out(Easing.cubic), in: Easing.in(Easing.cubic), linear: (x: number) => x,
  unveil: trapezoid(0.1, 0.6), inQuad: Easing.in(Easing.quad), outSine: Easing.out(Easing.sin),
};
export const easeOf = (e: Ease = 'inout') => (Array.isArray(e) ? Easing.bezier(e[0], e[1], e[2], e[3]) : EASE[e] ?? EASE.inout);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** The PEAKED ease from t0 to t1 with its fastest moment at tp: a quarter sine up to the peak, a quarter sine down
 *  after it, their speeds matched at the peak (pi / 2 x the average there, like a sine in-out's), still at both ends.
 *  The progress at the peak is (tp - t0) / (t1 - t0). */
export function peaked(t: number, t0: number, t1: number, tp: number): number {
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  const T = t1 - t0;
  const p = Math.max(t0 + T * 0.02, Math.min(t1 - T * 0.02, tp));
  const up = (p - t0) / T;
  if (t < p) return up * (1 - Math.cos((Math.PI / 2) * ((t - t0) / (p - t0))));
  return up + (1 - up) * Math.sin((Math.PI / 2) * ((t - p) / (t1 - p)));
}

/** progress 0..1 from t0 to t1: peaked when a peak is given, else the ease */
export function progress(t: number, t0: number, t1: number, ease?: Ease, peak?: number): number {
  if (t1 <= t0) return t >= t0 ? 1 : 0;
  if (peak !== undefined) return peaked(t, t0, t1, peak);
  return easeOf(ease)(clamp01((t - t0) / (t1 - t0)));
}

/** The camera's keys in film seconds: camera.keys, or the v3 form's two (from at start, to at end). */
export function camKeys(cam: Camera, shot: {s: number; e: number}): CamKey[] {
  if (cam.keys && cam.keys.length) return [...cam.keys].sort((a, b) => a.t - b.t);
  const from = cam.from ?? cam.to ?? {x: 540, y: 960, z: 1};
  const to = cam.to ?? from;
  return [
    {...from, t: cam.start ?? shot.s},
    {...to, t: Math.max((cam.start ?? shot.s) + 0.01, cam.end ?? shot.e), ease: cam.ease, peak: cam.peak, word: cam.word,
      anchor: cam.anchor, pivot: cam.pivot},
  ];
}

const W = 1080;
const H = 1920;

/** The camera at film time t. Zoom interpolates geometrically (a push of 2x feels even all the way); the centre
 *  travels a straight line, or, with a pivot, the pivot's screen spot travels a straight line (still if it starts and
 *  ends at the same spot: a zoom about it). Roll interpolates linearly. */
export function camAtKeys(keys: CamKey[], t: number): Cam {
  if (!keys.length) return {x: W / 2, y: H / 2, z: 1, r: 0};
  if (t <= keys[0].t) return {x: keys[0].x, y: keys[0].y, z: keys[0].z, r: keys[0].r ?? 0};
  const last = keys[keys.length - 1];
  if (t >= last.t) return {x: last.x, y: last.y, z: last.z, r: last.r ?? 0};
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const u = progress(t, a.t, b.t, b.ease, b.peak);
  const z = a.z * Math.pow(b.z / a.z, u);
  const r = (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * u;
  if (b.pivot) {
    const [px, py] = b.pivot;
    const s0: Pt = [(px - a.x) * a.z, (py - a.y) * a.z];
    const s1: Pt = [(px - b.x) * b.z, (py - b.y) * b.z];
    const sx = s0[0] + (s1[0] - s0[0]) * u;
    const sy = s0[1] + (s1[1] - s0[1]) * u;
    return {x: px - sx / z, y: py - sy / z, z, r};
  }
  return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z, r};
}

export const camAt = (cam: Camera, shot: {s: number; e: number}, t: number) => camAtKeys(camKeys(cam, shot), t);

/** SVG transform of a camera (world -> screen) */
export const camTf = (c: Cam) => `translate(${W / 2} ${H / 2}) rotate(${c.r ?? 0}) scale(${c.z}) translate(${-c.x} ${-c.y})`;

/** world point -> screen point under a camera (roll ignored: the board's moves never roll) */
export const toScreen = (c: Cam, [x, y]: Pt): Pt => [(x - c.x) * c.z + W / 2, (y - c.y) * c.z + H / 2];

/** v3's parallax: the camera a plane at depth factor f sees (the same end frame, f times the move) */
export function camForDepth(end: Cam, c: Cam, f: number): Cam {
  return {x: end.x + (c.x - end.x) * f, y: end.y + (c.y - end.y) * f, z: end.z * Math.pow(c.z / end.z, f), r: c.r};
}

/** a move's eased progress at `local` s after the shot start (loops repeat with period dur + gap, always running) */
export function moveU(m: Move, local: number): number {
  let l = local;
  if (m.loop) {
    const P = Math.max(1e-3, m.dur + (m.gap ?? 0));
    l = m.at + ((((local - m.at) % P) + P) % P);
  }
  return progress(l, m.at, m.at + m.dur, m.ease, m.peak);
}

/** The element's transform after its moves at `local` (translation-only moves add up; scale moves compose in list
 *  order, SVG applying the list right to left): {tf, scaled}. */
export function moveTf(moves: Move[], local: number): {tf: string; scaled: boolean; dx: number; dy: number} {
  let dx = 0;
  let dy = 0;
  const tfs: string[] = [];
  let scaled = false;
  for (const m of moves) {
    const u = moveU(m, local);
    if (m.s !== undefined && m.s !== 1) {
      const S = m.lin ? 1 + (m.s - 1) * u : Math.pow(m.s, u);
      const [ox, oy] = m.o ?? [0, 0];
      tfs.unshift(`translate(${ox + m.dx * u} ${oy + m.dy * u}) scale(${S}) translate(${-ox} ${-oy})`);
      scaled = true;
    } else if (scaled) {
      tfs.unshift(`translate(${m.dx * u} ${m.dy * u})`);
    } else {
      dx += m.dx * u;
      dy += m.dy * u;
    }
  }
  return {tf: [...tfs, `translate(${dx} ${dy})`].join(' '), scaled, dx, dy};
}

/** the draw-on progress (1 = drawn) after the undraw is applied (1 -> 0 while the pen lifts the strokes off) */
export function drawProgress(draw: [number, number] | [number, number, Ease] | undefined,
  undraw: [number, number] | [number, number, Ease] | undefined, local: number): number {
  let u = 1;
  if (draw) u = progress(local, draw[0], draw[0] + Math.max(0.01, draw[1]), (draw[2] as Ease) ?? 'linear');
  if (undraw) u *= 1 - progress(local, undraw[0], undraw[0] + Math.max(0.01, undraw[1]), (undraw[2] as Ease) ?? 'linear');
  return u;
}

/** piecewise-linear keys [[s, v], ...] at local s (clamped at both ends); undefined keys -> dflt */
export function keyed(keys: [number, number][] | undefined, local: number, dflt: number): number {
  if (!keys || !keys.length) return dflt;
  const k = [...keys].sort((a, b) => a[0] - b[0]);
  if (local <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (local < k[i + 1][0]) {
      const f = (local - k[i][0]) / Math.max(1e-6, k[i + 1][0] - k[i][0]);
      return k[i][1] + (k[i + 1][1] - k[i][1]) * f;
    }
  }
  return k[k.length - 1][1];
}

/** a stepped pose test idiom (G3_ANIMATIC §4): the instant a move starts so no 60 fps frame lands mid-jump */
export const snap = (t: number, fps = 60) => Math.round((Math.floor(t * fps + 1e-9) / fps + 0.5 / fps / 2) * 10000) / 10000;
