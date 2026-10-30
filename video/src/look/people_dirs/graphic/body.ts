// MODERN GRAPHIC people: the adult build in numbers (design_research.md §3: 7.8 heads, legs 5 % long, a visible
// neck, real hands and feet) and the pose: a skeleton in body space (x = her left, y = up from the sole, z = her front;
// H = 1000 from the crown to the sole).
import {V3, rad} from './geo';

export type Build = {
  sex: 'f' | 'm';
  /** crown to chin (128 = 7.8 heads) */
  skull: number;
  /** the skull's width (front view) and depth (profile), as fractions of `skull` */
  skullW: number;
  skullD: number;
  /** full widths (front view) */
  shoulderW: number;
  chestW: number;
  waistW: number;
  hipW: number;
  neckW: number;
  /** heights above the sole */
  shoulderY: number;
  chestY: number;
  waistY: number;
  hipY: number;
  hipJ: number;
  crotch: number;
  knee: number;
  ankle: number;
  /** limb lengths */
  upperArm: number;
  forearm: number;
  hand: number;
  foot: number;
  /** limb radii (bare): thigh top, knee, calf, ankle; upper arm, elbow, wrist */
  thighR: number;
  kneeR: number;
  calfR: number;
  ankleR: number;
  armR: number;
  elbowR: number;
  wristR: number;
  /** depths (profile half-depths) of chest, waist, hips */
  chestD: number;
  waistD: number;
  hipD: number;
};

export const WOMAN: Build = {
  sex: 'f',
  skull: 128,
  skullW: 0.76,
  skullD: 0.94,
  shoulderW: 240,
  chestW: 200,
  waistW: 158,
  hipW: 210,
  neckW: 46,
  shoulderY: 818,
  chestY: 735,
  waistY: 625,
  hipY: 505,
  hipJ: 545,
  crotch: 485,
  knee: 295,
  ankle: 40,
  upperArm: 183,
  forearm: 148,
  hand: 98,
  foot: 148,
  thighR: 50,
  kneeR: 30,
  calfR: 33,
  ankleR: 17,
  armR: 25,
  elbowR: 20,
  wristR: 14.5,
  chestD: 66,
  waistD: 58,
  hipD: 70,
};

export const MAN: Build = {
  sex: 'm',
  skull: 127,
  skullW: 0.78,
  skullD: 0.96,
  shoulderW: 272,
  chestW: 236,
  waistW: 184,
  hipW: 196,
  neckW: 58,
  shoulderY: 815,
  chestY: 735,
  waistY: 610,
  hipY: 500,
  hipJ: 540,
  crotch: 480,
  knee: 290,
  ankle: 40,
  upperArm: 186,
  forearm: 150,
  hand: 104,
  foot: 156,
  thighR: 54,
  kneeR: 34,
  calfR: 37,
  ankleR: 19,
  armR: 30,
  elbowR: 24,
  wristR: 17,
  chestD: 74,
  waistD: 64,
  hipD: 68,
};

/** A torso frame: a centre offset (x, z), a roll (+ raises her left side) and a twist (yaw relative to the body). */
export type Frame = {x: number; z: number; roll: number; tw: number};

export type Side = 'l' | 'r';
export type Leg = {hip: V3; knee: V3; ankle: V3; /** foot yaw (0 = forward) and toe pitch (+ = heel up) */ fy: number; fp: number};
export type Arm = {sh: V3; el: V3; wr: V3; /** the hand: its direction in body space (unit-ish) and a pose name */ hd: V3; hp: HandPose};
export type HandPose = 'relaxed' | 'grip' | 'pocket' | 'strap' | 'hidden' | 'phone';

export type Skel = {
  b: Build;
  pelvis: Frame;
  chest: Frame;
  /** the head: its centre, its yaw relative to the body, roll (tilt, + toward her left) and pitch (+ = chin up) */
  head: {c: V3; yaw: number; roll: number; pitch: number};
  neckTop: V3;
  neckBase: V3;
  arm: {l: Arm; r: Arm};
  leg: {l: Leg; r: Leg};
};

/** A point of a frame (offset from its centre at height y), rotated by the frame's twist and roll. */
export function framePt(f: Frame, x: number, y: number, z: number): V3 {
  const t = rad(f.tw);
  const lx = x * Math.cos(t) + z * Math.sin(t);
  const lz = -x * Math.sin(t) + z * Math.cos(t);
  return [f.x + lx, y + x * Math.tan(rad(f.roll)), f.z + lz];
}

/** Arm joints from the shoulder by angles: `swing` (forward +, degrees from vertical in the sagittal plane), `abd`
 *  (out to the side +), the elbow bend `bend` (forward +) and the forearm's own twist toward the body `inw`. */
export function armByAngles(b: Build, sh: V3, side: Side, swing: number, abd: number, bend: number, inw = 0): {el: V3; wr: V3; hd: V3} {
  const s = side === 'l' ? 1 : -1;
  const dir = (sw: number, ab: number): V3 => {
    const a = rad(sw);
    const o = rad(ab);
    // down is -y; swing tilts toward +z, abduction toward the side (s * x)
    const x = s * Math.sin(o);
    const z = Math.sin(a) * Math.cos(o);
    const y = -Math.cos(a) * Math.cos(o);
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  };
  const d1 = dir(swing, abd);
  const el: V3 = [sh[0] + d1[0] * b.upperArm, sh[1] + d1[1] * b.upperArm, sh[2] + d1[2] * b.upperArm];
  const d2 = dir(swing + bend, abd - inw);
  const wr: V3 = [el[0] + d2[0] * b.forearm, el[1] + d2[1] * b.forearm, el[2] + d2[2] * b.forearm];
  return {el, wr, hd: d2};
}

export const mirrorX = (p: V3): V3 => [-p[0], p[1], p[2]];
