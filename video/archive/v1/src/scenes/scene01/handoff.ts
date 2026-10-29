// S01 -> S02 Pip handoff across the matchcut (fix round 4, review: Pip blinked out through the right rail 6 frames
// before the cut and S02 brought him back in moving LEFT). S01 now flies him in SCREEN space (PipLeap, cast.tsx) and
// delivers EXACTLY S02's pickup state on S02's first frame: position, velocity, scale, pose, facing, seed.
//
// READ-ONLY MIRROR of S02's code as of this round (do not import it: a half-written S02 file must not break S01's
// isolated preview entry): src/scenes/Scene02.tsx `Pip` (hIn = hop({t0: B.pipLand - 0.23, dur: 0.23, from: {x: 975,
// y: 860}, to: PIP_PERCH, height: 22}), PIP_SCALE 1.2 / 1.3, seed 22, flip while t < pipLand, pose 'stand-side' with
// amount = hop spread), src/scenes/scene02/camera.ts (K0 (470.6, 794.8, 1.15) -> K1 (472.6, 813.8, 1.30) over LAND 0.4
// s, out(quad), log zoom), src/scenes/scene02/beats.ts (S02_START 4.715, pipLand 4.865 absolute) and BlueprintWall's
// perch (700, 680) + 14. If S02 changes any of these, update this block (docs/scenes/S01.md 'Pip handoff').
import {clamp, lerp} from '../../lib/time';

export const S02_PIP = {
  start: 4.715, // S02_START (film s)
  t0: 4.865 - 0.23 - 4.715, // hIn take-off, S02-local (B.pipLand - 0.23) = -0.08
  dur: 0.23,
  from: [975, 860] as [number, number],
  to: [714, 680] as [number, number], // BLUEPRINT_WALL.perch + (14, 0)
  height: 22,
  scale: 1.2 / 1.3, // PIP_SCALE (world)
  seed: 22,
  K0: {x: 470.6, y: 794.8, zoom: 1.15},
  K1: {x: 472.6, y: 813.8, zoom: 1.3},
  land: 0.4,
} as const;

/** S02's camera at S02-local time (camAt for t <= LAND; constant K0 before S02's first frame). */
const camS02 = (tau: number) => {
  const u = clamp(tau / S02_PIP.land);
  const q = 1 - (1 - u) * (1 - u);
  const {K0, K1} = S02_PIP;
  return {x: lerp(K0.x, K1.x, q), y: lerp(K0.y, K1.y, q), zoom: Math.exp(lerp(Math.log(K0.zoom), Math.log(K1.zoom), q))};
};

export type PipScreenState = {x: number; y: number; scale: number; squash: number; rotate: number; amount: number; k: number};

/** S02's Pip (feet anchor) in SCREEN px at S02-local time tau (valid on the hop in; k may run below 0 / above 1 when
 *  extrapolated). Same formulas as lib/mascot hop() + Scene02's camera. */
export function s02PipState(tau: number): PipScreenState {
  const {t0, dur, from, to, height} = S02_PIP;
  const k = (tau - t0) / dur;
  const top = Math.min(from[1], to[1]) - height;
  const cy = 2 * top - (from[1] + to[1]) / 2;
  const wx = lerp(from[0], to[0], k);
  const wy = (1 - k) * (1 - k) * from[1] + 2 * (1 - k) * k * cy + k * k * to[1];
  const c = camS02(tau);
  const dir = Math.sign(to[0] - from[0]) || 1;
  const kk = clamp(k);
  return {
    x: (wx - c.x) * c.zoom + 540,
    y: (wy - c.y) * c.zoom + 960,
    scale: S02_PIP.scale * c.zoom,
    squash: -0.22 * (1 - Math.sin(Math.PI * kk)) * (kk < 0.5 ? 1 : 0.6) - 0.04,
    rotate: -dir * 10 * Math.cos(Math.PI * k),
    amount: Math.sqrt(Math.max(0, Math.sin(Math.PI * kk))),
    k,
  };
}

/** The pickup: S02's state on the first S02 frame of the film (f142 = 4.7333 s) and its screen velocity (px/s) and
 *  scale rate (/s) there. S01's leap is a Hermite curve that ARRIVES at this state at this time. */
export const PICKUP_T = Math.ceil(S02_PIP.start * 30) / 30; // 4.7333
export const pickup = (() => {
  const tau = PICKUP_T - S02_PIP.start;
  const h = 1e-4;
  const p = s02PipState(tau);
  const a = s02PipState(tau - h);
  const b = s02PipState(tau + h);
  return {p, v: [(b.x - a.x) / (2 * h), (b.y - a.y) / (2 * h)] as [number, number], vs: (b.scale - a.scale) / (2 * h)};
})();
