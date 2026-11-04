// PEOPLE v4 ASSEMBLED: the test motions on the assembled figures (the strips in final/03). Each animates only what a
// scene would (the head's yaw, the body's path, the air) on the v4 body's own head track (asm_people.ts poseHead), and
// hands the hair a MotionState; the springs (sim.ts) do the rest. As in motion4.ts:
//   turn   standing in 3/4, the head turns to profile in 0.4 s (yaw -36 -> -90, eased); the face's drawing swaps at
//          63 degrees exactly where the hair's 3/4 -> profile morph ends (hair.ts SWITCH)
//   walk   from standing, walking toward screen-left in profile (to 1.3 m/s in 0.35 s), the head bobbing twice a
//          stride; the camera tracks her, so the body stays in its cell while the hair feels the real motion
//   gust   seen from behind (the lost profile), the air rises from still to a 2.5 m/s gust from screen-left, holds,
//          and dies away; gustq the same in 3/4
import type {V2} from './bez';
import type {MotionState} from './sim';
import {poseHead, type Pose5, type Who5} from './asm_people';

export type Kind5 = 'turn' | 'walk' | 'gust' | 'gustq';
export type Motion5 = {
  kind: Kind5;
  pose: (t: number) => Pose5;
  /** the whole figure's offset (figure units) */
  bob: (t: number) => V2;
  wind: (t: number) => V2;
  frames: number[];
  label: string;
};

const ease = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const V = 770; // 1.3 m/s in figure units (1 m ~ 590)
const T0 = 0.15;
const TA = 0.35;
const walkX = (t: number) => {
  const s = Math.max(0, t - T0);
  return s < TA ? (V * s * s) / (2 * TA) : (V * TA) / 2 + V * (s - TA);
};
const gust = (t: number): V2 => {
  const g = smooth(0.1, 0.45, t) * (1 - smooth(0.75, 1.35, t));
  return [1480 * g, -170 * g];
};

export const MOTIONS5: Record<Kind5, Motion5> = {
  turn: {
    kind: 'turn',
    pose: (t) => ({pose: 'stand', bodyYaw: -58, headYaw: 22 + (-32 - 22) * ease((t - 0.1) / 0.4)}),
    bob: () => [0, 0],
    wind: () => [0, 0],
    frames: [0, 0.2, 0.27, 0.33, 0.42, 0.55, 0.75, 1.1],
    label: 'the head turns 3/4 to profile in 0.4 s, then holds',
  },
  walk: {
    kind: 'walk',
    pose: () => ({pose: 'walk', bodyYaw: -90, headYaw: 0}),
    bob: (t) => {
      const ramp = smooth(T0, T0 + 0.3, t);
      const y = 13 * 0.5 * (1 - Math.cos(4 * Math.PI * Math.max(0, t - T0))) * ramp;
      return [-walkX(t), y];
    },
    wind: () => [0, 0],
    frames: [0, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92, 1.1],
    label: 'a walk from standing (to 1.3 m/s in 0.35 s), the head bobbing; the camera tracks',
  },
  gust: {
    kind: 'gust',
    pose: () => ({pose: 'stand', bodyYaw: 196, headYaw: 26}),
    bob: () => [0, 0],
    wind: gust,
    frames: [0, 0.25, 0.4, 0.55, 0.75, 0.95, 1.2, 1.7],
    label: 'a gust from the left: still, rising, holding, dying away, settled',
  },
  gustq: {
    kind: 'gustq',
    pose: () => ({pose: 'stand', bodyYaw: -58, headYaw: 22}),
    bob: () => [0, 0],
    wind: gust,
    frames: [0, 0.25, 0.4, 0.55, 0.75, 0.95, 1.2, 1.7],
    label: 'a gust from the left, 3/4',
  },
};

/** The MotionState for a person: the head frame over time from the same pose the figure is built with. */
export function motion5(kind: Kind5, w: Who5, t: number): MotionState {
  const m = MOTIONS5[kind];
  return {t, key: `v4|${kind}|${w.id}`, head: (tt: number) => poseHead(w.sex, w.build, m.pose(tt), m.bob(tt)), wind: m.wind};
}
