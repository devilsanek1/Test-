// HAIR v4: the three test motions for the strips. Each animates only what a scene would (the head's yaw, the body's
// path, the air) and hands the hair a MotionState; the springs do the rest.
//   turn  standing in 3/4, the head turns to profile in 0.4 s (yaw -38 -> -90, eased), then holds
//   walk  from standing, she walks toward screen-left (accelerating to 1.3 m/s in 0.35 s), the head bobbing twice a
//         stride; the camera tracks her, so the body stays in its cell while the hair feels the real motion
//   gust  standing in 3/4, the air rises from still to a 2.5 m/s gust from screen-left, holds, and dies away
import type {V2} from './bez';
import type {View} from './cut';
import type {MotionState} from './sim';
import {headOf, type Who} from './people4';

export type MotionKind = 'turn' | 'walk' | 'gust' | 'gustb';
export type MotionDef = {
  kind: MotionKind;
  view: View;
  headYaw: (t: number) => number | undefined;
  /** the whole figure's offset (figure-local units) */
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
/** the walk's distance from its start (units, toward screen-left) */
const walkX = (t: number) => {
  const s = Math.max(0, t - T0);
  return s < TA ? (V * s * s) / (2 * TA) : (V * TA) / 2 + V * (s - TA);
};

export const MOTIONS: Record<MotionKind, MotionDef> = {
  turn: {
    kind: 'turn',
    view: 'q',
    headYaw: (t) => 20 + (-32 - 20) * ease((t - 0.1) / 0.4),
    bob: () => [0, 0],
    wind: () => [0, 0],
    frames: [0, 0.22, 0.28, 0.33, 0.42, 0.55, 0.75, 1.1],
    label: 'head turn, 3/4 to profile in 0.4 s, then hold',
  },
  walk: {
    kind: 'walk',
    view: 'p',
    headYaw: () => undefined,
    bob: (t) => {
      const ramp = smooth(T0, T0 + 0.3, t);
      const y = 13 * 0.5 * (1 - Math.cos(4 * Math.PI * Math.max(0, t - T0))) * ramp;
      return [-walkX(t), y];
    },
    wind: () => [0, 0],
    frames: [0, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92, 1.1],
    label: 'walk from standing (to 1.3 m/s in 0.35 s), the head bobbing; the camera tracks',
  },
  gust: {
    kind: 'gust',
    view: 'q',
    headYaw: () => undefined,
    bob: () => [0, 0],
    wind: (t) => {
      const g = smooth(0.1, 0.45, t) * (1 - smooth(0.75, 1.35, t));
      return [1480 * g, -170 * g];
    },
    frames: [0, 0.25, 0.4, 0.55, 0.75, 0.95, 1.2, 1.7],
    label: 'a gust from the left: still, rising, holding, dying away, settled',
  },
  gustb: {
    kind: 'gustb',
    view: 'b',
    headYaw: () => 14,
    bob: () => [0, 0],
    wind: (t) => {
      const g = smooth(0.1, 0.45, t) * (1 - smooth(0.75, 1.35, t));
      return [1480 * g, -170 * g];
    },
    frames: [0, 0.25, 0.4, 0.55, 0.75, 0.95, 1.2, 1.7],
    label: 'the same gust seen from behind',
  },
};

/** The MotionState for a figure: the head frame over time comes from the same pose the figure is built with. */
export function motionState(kind: MotionKind, who: Who, t: number): MotionState {
  const m = MOTIONS[kind];
  return {
    t,
    key: `${kind}|${who}`,
    head: (tt: number) => headOf(who, m.view, m.headYaw(tt), m.bob(tt)),
    wind: m.wind,
  };
}
