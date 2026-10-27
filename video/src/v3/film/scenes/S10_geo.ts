// S10_geo: the perspective of the queue set (S10 / S14, G5b density lane). The locked G5 road (S10_set.tsx: its far end
// at the factory door, its edges at the board's slopes) fixes ONE camera: the road edges meet at the vanishing point
// VP (977, 756), the ground scale at a screen row y is K(y) = 0.0943 (y - 756) px per metre (the road is 8.5 m wide),
// and the camera stands HC = 10.6 m above the road (the van, 3 m tall, measures it). Everything new in the set is
// placed in world metres with P(X, k, h): X across (0 = the VP's line, the road from X -15.4 to -6.87), the depth as
// the ground scale k (px per metre: the van's ground 63.5, the first data center's 31.9, the factory 9.43) and the
// height h. Z = F / k is the distance in metres (F, the focal length, is a choice: a 50 degree lens).
//
// Storybook scale: the far people and gate props are drawn bigger than true perspective (the board's chip maker is
// 92 px at the door), easing back to true size by the first data center's base: figure(k) does it.
import type {Pt} from '../kit';

export const VP: Pt = [977, 756];
export const HC = 10.6;
export const F = 1158;
/** Ground scale (px / m) at a screen row. */
export const kAtY = (y: number) => (y - VP[1]) / HC;
/** Screen row of the ground at ground scale k. */
export const yAtK = (k: number) => VP[1] + HC * k;
/** Depth (m) <-> ground scale. */
export const kAtZ = (z: number) => F / z;
export const zAtK = (k: number) => F / k;
/** A world point (X across, k depth, h up) on screen. */
export const P = (X: number, k: number, h = 0): Pt => [VP[0] + k * X, VP[1] + k * (HC - h)];
/** The k of a point `d` metres beyond the depth k (toward the VP). */
export const kBeyond = (k: number, d: number) => F / (F / k + d);

/** The road's edges (X) and the pavements. */
export const X_ROAD_L = -15.4;
export const X_ROAD_R = -6.87;
/** Left street: the house walls stand on X_WALL_L; the right yard fence on X_FENCE. */
export const X_WALL_L = -18.4;
export const X_FENCE = -3.9;

/** Storybook figure scale at depth k: true size from the first data center's base (k >= 31.9) on, up to 2.5x at the
 *  factory door (k 9.43). Returns px per metre for people and small props. */
export function figK(k: number) {
  const u = Math.max(0, Math.min(1, (31.9 - k) / (31.9 - 9.43)));
  return k * (1 + 1.5 * u);
}

/** Mix two hex colours (flat steps only: the result is a new flat token). */
export function mixHex(a: string, b: string, u: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join('');
}

/** A quad's path (screen points). */
export const quad = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';

/** The beats that differ between S10 and S14 (panel-local seconds). Every idle motion is a function of time, so S14's
 *  frame 0 is S10's frame 0 exactly; only these scripted beats tell the panels apart. */
export type QueueBeats = {
  /** The guard steps out of the booth (S10 "pay") and waves (S10 "first dibs"). */
  guardStepAt?: number;
  guardWaveAt?: number;
  /** The barrier lifts (S10 "first dibs"; S14 for the second data center). */
  barrierLiftAt?: number[];
  /** A car crosses on the far cross street. */
  carPass?: [number, number];
  /** Pip's ears droop (a worried look) on "first dibs". */
  pipDroopAt?: number;
  /** The workers at the door stop and turn to the chip maker (S14 "chip"). */
  workersStopAt?: number;
  /** The birds lift off the wire, the bus stop turns, the kid points (S14: the second data center cuts in). */
  birdsLiftAt?: number;
  busTurnAt?: number;
  kidPointAt?: number;
  /** A phone goes up in the front row. */
  phoneWin?: [number, number];
  /** S14: the van is shoved (Pip slides and clings, snow falls off the roof), Pip shakes the snow off. */
  pushAt?: number;
  pushDur?: number;
  pipShakeAt?: number;
};
