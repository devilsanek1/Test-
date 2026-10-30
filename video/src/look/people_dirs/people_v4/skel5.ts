// PEOPLE v4, BODIES (docs/look/people_design/bodies_v4/NOTES.md): THE POSE. A pose is the torso as a bent, leaned
// chain (the contrapposto's tilts and twists in the pelvis and chest frames; the whole torso lowered, leaned about the
// hip joints and its upper back rounded about the waist) and four limbs placed by TWO-BONE IK (a target for the ankle or
// the wrist and a pole for the knee or the elbow), or an arm by its angles from the shoulder. The torso is authored
// upright (the rings of body5.ts, at the standing heights) and mapped by X into the pose, so one set of garment rings
// serves standing, walking, sitting and leaning. Body space as in graphic/rig.ts: x = her left, y = up, z = her front;
// H = 1000 from the crown to the sole when standing.
// The library (design_research.md §10, A1-A8; RECIPE §4: never the hip-out "model" stance):
//   stand   contrapposto: the weight on her right leg (the leg straight, its hip up 6 degrees, the pelvis over it),
//           the shoulders tilting the other way, the free knee eased forward and its foot turned out, the pit of the
//           neck over the weight foot; the far hand in a pocket, the near arm loose with the elbow eased
//   walk    a cycle (phase 0..1): contact, down, passing, up for each leg; the arms swinging against the legs, the
//           hips turning and dropping on the swing side, the shoulders against the hips, the body lowest at the down
//   ledge   seated on a ledge (ref 05): the thighs along the top, the shins hanging over the edge, the back rounded
//           forward, the forearms on the thighs, the head bowed to the hands
//   ground  seated on the ground (ref 01): knees up, one forearm over the near knee, the far hand on the ground behind
//   lean    leaning back on a rail at hip height: the ankles crossed, both hands on the rail, the head turned
import {add3, sub3, mul3, dot3, cross3, norm3, len3, lerp3, clamp, type V3} from '../graphic/geo';
import {framePt, armByAngles, type Build, type Frame} from '../graphic/body';
import type {BuildName, SkelV2} from '../hair_v2/stance';
import {buildV4} from './body';
import type {Sex} from './faces';

export type HandPose = 'relax' | 'swing' | 'pocket' | 'rest' | 'grip' | 'lap' | 'hidden';
export type ArmT = {
  /** the wrist's target (body space) for IK */
  wr?: V3;
  /** or the arm by angles from the shoulder: swing (forward +), abduction, the elbow's bend, the forearm's turn in */
  ang?: [number, number, number, number];
  /** where the elbow points (IK) */
  pole?: V3;
  hand: HandPose;
  /** the hand's axis (wrist -> fingertips) and the palm's normal, body space (defaults from the forearm and the pose) */
  hd?: V3;
  pn?: V3;
};
export type LegT = {ankle: V3; fy: number; fp: number; pole?: V3};
export type TorsoT = {dx?: number; dy?: number; dz?: number; pitch?: number; bend?: number};
export type PoseKind = 'stand' | 'walk' | 'ledge' | 'ground' | 'lean';
export type Pose5 = {
  kind: PoseKind;
  pelvis: Frame;
  chest: Frame;
  waist?: Partial<Frame>;
  torso?: TorsoT;
  head: {yaw: number; roll: number; pitch: number; dx?: number};
  neck?: {fwd: number; lean: number; nbz: number};
  legs: {l: LegT; r: LegT};
  arms: {l: ArmT; r: ArmT};
  /** the walk's phase (for the coat's swing) */
  phase?: number;
};
export type Hand5 = {pose: HandPose; hd: V3; pn: V3; th: V3};
export type Skel5 = SkelV2 & {
  /** standing (authored) torso space -> the pose */
  X: (p: V3) => V3;
  /** a torso normal at an authored height -> the pose */
  Xn: (n: V3, y: number) => V3;
  hand: {l: Hand5; r: Hand5};
  pose: Pose5;
  lens: {thigh: number; shin: number; upper: number; fore: number};
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Rotate about the x axis: + leans forward (a point above the pivot moves to +z). */
const rotX = (v: V3, deg: number): V3 => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};

/** Two-bone IK: from a toward the target, the middle joint bent toward the pole. */
export function ik2(a: V3, tgt: V3, l1: number, l2: number, pole: V3): {m: V3; e: V3} {
  const d = sub3(tgt, a);
  const L = len3(d);
  const Lc = clamp(L, Math.abs(l1 - l2) + 1, l1 + l2 - 0.4);
  const u = norm3(d);
  const e = add3(a, mul3(u, Lc));
  const x = (l1 * l1 - l2 * l2 + Lc * Lc) / (2 * Lc);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  let pp = sub3(pole, mul3(u, dot3(pole, u)));
  if (len3(pp) < 1e-6) pp = [0, 0, 1];
  pp = norm3(pp);
  return {m: add3(add3(a, mul3(u, x)), mul3(pp, h)), e};
}

/** The pose -> the skeleton (SkelV2-compatible: headFrame() and the old helpers read it). */
export function skel5(sex: Sex, kind: BuildName, p: Pose5): Skel5 {
  const b: Build = buildV4(sex, kind);
  const T = p.torso ?? {};
  const pitch = T.pitch ?? 0;
  const bend = T.bend ?? 0;
  const P0: V3 = [p.pelvis.x, b.hipJ, p.pelvis.z];
  const W0: V3 = [p.pelvis.x, b.waistY + 10, p.pelvis.z + 4];
  const wOf = (y: number) => smoothstep(b.waistY - 50, b.chestY + 20, y);
  const X = (q: V3): V3 => {
    let v = q;
    if (bend) v = add3(rotX(sub3(v, W0), bend * wOf(q[1])), W0);
    if (pitch) v = add3(rotX(sub3(v, P0), pitch), P0);
    return [v[0] + (T.dx ?? 0), v[1] + (T.dy ?? 0), v[2] + (T.dz ?? 0)];
  };
  const Xn = (n: V3, y: number): V3 => rotX(n, pitch + bend * wOf(y));
  const lens = {thigh: b.hipJ - b.knee, shin: b.knee - b.ankle, upper: b.upperArm, fore: b.forearm};
  // the torso's joints
  const hipY = b.hipJ;
  const shY = b.shoulderY - 14 - 7;
  const hipL = X(framePt(p.pelvis, 48 * (b.hipW / 210), hipY, 0));
  const hipR = X(framePt(p.pelvis, -48 * (b.hipW / 210), hipY, 0));
  // the shoulder joint sits an arm's radius inside the shoulders' width (the deltoid's edge is the width), so a sleeve
  // round the arm meets the shoulder line instead of standing out past it
  const shX = b.shoulderW / 2 - Math.max(13, b.armR * 0.9);
  const shL = X(framePt(p.chest, shX, shY, -16));
  const shR = X(framePt(p.chest, -shX, shY, -16));
  const nk = p.neck ?? {fwd: 6, lean: 6, nbz: -14};
  const nbL: V3 = [p.chest.x, b.shoulderY + 8, p.chest.z + nk.nbz];
  const topY = 1000 - b.skull - 4;
  const dzLean = (topY - nbL[1]) * Math.tan((nk.lean * Math.PI) / 180);
  const ntL: V3 = [p.chest.x + (p.head.dx ?? 0) * 0.6, topY, nbL[2] + dzLean];
  const hcL: V3 = [p.chest.x + (p.head.dx ?? 0), 1000 - b.skull / 2, p.chest.z + 4 + nk.fwd];
  const waist: Frame = {
    x: (p.pelvis.x + p.chest.x) / 2,
    z: (p.pelvis.z + p.chest.z) / 2,
    roll: (p.pelvis.roll + p.chest.roll) / 2,
    tw: (p.pelvis.tw + p.chest.tw) / 2,
    ...p.waist,
  };
  // the legs
  const leg = (side: 'l' | 'r', hip: V3) => {
    const t = p.legs[side];
    const s = side === 'l' ? 1 : -1;
    const pole = t.pole ?? [s * 0.12, 0, 1];
    const r = ik2(hip, t.ankle, lens.thigh, lens.shin, pole);
    return {hip, knee: r.m, ankle: r.e, fy: t.fy, fp: t.fp};
  };
  // the arms
  const arm = (side: 'l' | 'r', sh: V3) => {
    const t = p.arms[side];
    const s = side === 'l' ? 1 : -1;
    let el: V3;
    let wr: V3;
    if (t.wr) {
      const r = ik2(sh, t.wr, lens.upper, lens.fore, t.pole ?? [s * 0.5, -0.2, -1]);
      el = r.m;
      wr = r.e;
    } else {
      const [sw, ab, bd, inw] = t.ang ?? [3, 8, 14, 5];
      const a = armByAngles(b, sh, side, sw, ab, bd, inw);
      el = a.el;
      wr = a.wr;
    }
    return {sh, el, wr, hd: [0, -1, 0] as V3, hp: 'relaxed' as const};
  };
  const legs = {l: leg('l', hipL), r: leg('r', hipR)};
  const arms = {l: arm('l', shL), r: arm('r', shR)};
  // the hands: the axis from the forearm with the wrist's relaxed break, the palm's normal, the thumb
  const hand = (side: 'l' | 'r'): Hand5 => {
    const t = p.arms[side];
    const A = arms[side];
    const s = side === 'l' ? 1 : -1;
    const fd = norm3(sub3(A.wr, A.el));
    let hd: V3;
    let pn: V3;
    if (t.hd && t.pn) {
      hd = norm3(t.hd);
      pn = norm3(t.pn);
    } else {
      // relaxed: the hand angles a little back (ulnar) and in from the forearm; the palm faces the body
      hd = norm3(add3(fd, [-s * 0.08, 0, -0.16]));
      pn = t.pn ? norm3(t.pn) : ([-s, 0, 0] as V3);
    }
    // keep the palm's normal square to the axis
    pn = norm3(sub3(pn, mul3(hd, dot3(pn, hd))));
    const th = side === 'l' ? norm3(cross3(pn, hd)) : norm3(cross3(hd, pn));
    return {pose: t.hand, hd, pn, th};
  };
  return {
    b,
    pelvis: p.pelvis,
    chest: p.chest,
    waist,
    head: {c: X(hcL), yaw: p.head.yaw, roll: p.head.roll, pitch: p.head.pitch},
    neckTop: X(ntL),
    neckBase: X(nbL),
    arm: {l: arms.l, r: arms.r},
    leg: legs,
    X,
    Xn,
    hand: {l: hand('l'), r: hand('r')},
    pose: p,
    lens,
  };
}

// ---------------------------------------------------------------- the library
/** Standing in contrapposto (A2 at its gentle end): the weight on her right leg. `arms` picks the hands: the far
 *  (right) hand in a pocket and the near arm loose (default), both loose, or both in the pockets. */
export function stand5(sex: Sex, o: {headYaw?: number; arms?: 'pocket' | 'loose' | 'pockets' | 'thumb'; coat?: boolean} = {}): Pose5 {
  const m = sex === 'm';
  const pelvis: Frame = {x: -16, z: -6, roll: m ? -4.5 : -6, tw: 7};
  const chest: Frame = {x: -11, z: -3, roll: m ? 3 : 4, tw: -5};
  const armsMode = o.arms ?? 'pocket';
  // a pocket: the wrist at the front of the hip (the coat's pocket sits further out and forward)
  const pocket = (s: 1 | -1): ArmT => ({wr: framePt(pelvis, s * (o.coat ? 92 : 80), o.coat ? 518 : 548, o.coat ? 66 : 50), pole: [s * 0.9, -0.1, -0.7], hand: 'pocket'});
  // the loose arm: off the body, the elbow eased 20-25 degrees, the forearm turned in, the hand a little forward (A5)
  const loose = (s: 1 | -1, k = 1): ArmT => ({ang: [(o.coat ? 8 : 5) * k, (m ? 10 : 12) * k, (o.coat ? 28 : 22) * k, 12], hand: 'relax'});
  return {
    kind: 'stand',
    pelvis,
    chest,
    waist: {x: -14, z: 4},
    torso: {dy: -7},
    head: {yaw: o.headYaw ?? 22, roll: 3, pitch: 1, dx: 2},
    neck: {fwd: 6, lean: 6, nbz: -14},
    legs: {
      r: {ankle: [-30, 40, -6], fy: -12, fp: 0, pole: [-0.1, 0, 1]},
      l: {ankle: [44, 47, 70], fy: 24, fp: 7, pole: [-0.25, 0, 1]},
    },
    arms: {
      r: armsMode === 'loose' ? loose(-1, 0.8) : pocket(-1),
      l: armsMode === 'pockets' ? pocket(1) : loose(1),
    },
  };
}

/** The walk cycle in profile at phase ph (0 = her right heel strikes in front). The camera tracks: the pelvis stays at
 *  z ~ 0 and the planted foot slides back. Stance 62 % of the cycle, swing 38 %; two bobs a cycle (lowest just after
 *  each contact, highest at the passing position); the arms against the legs (A6: +-15 degrees, the elbow bending more
 *  on the forward swing, the forearm lagging). */
export function walk5(sex: Sex, ph: number): Pose5 {
  const m = sex === 'm';
  const TAU = Math.PI * 2;
  const f = ((ph % 1) + 1) % 1;
  const ZF = m ? 178 : 168;
  const ZB = m ? 196 : 184;
  const ST = 0.62;
  const F = m ? 160 : 140;
  /** the ankle's height when the ball (fp > 0) or the heel (fp < 0) is on the ground (shoe5 turns the foot about the
   *  ankle: the ankle 40 above the sole, the ball 0.42 f in front of it, the heel 0.24 f behind) */
  const onGround = (fp: number) => {
    const r = (fp * Math.PI) / 180;
    return 40 * Math.cos(r) + (fp >= 0 ? 0.42 : 0.24) * F * Math.abs(Math.sin(r));
  };
  const foot = (s: number, side: 'l' | 'r'): LegT => {
    const sg = side === 'l' ? 1 : -1;
    const x = sg * (m ? 34 : 24);
    let z: number;
    let y = 40;
    let fp = 0;
    if (s < ST) {
      const u = s / ST;
      z = ZF - (ZF + ZB) * u;
      // heel strike (toes up, on the heel) -> flat -> the heel rising to the toe-off (on the ball)
      fp = u < 0.12 ? -15 * (1 - u / 0.12) : u < 0.58 ? 0 : 40 * Math.pow((u - 0.58) / 0.42, 1.4);
      y = onGround(fp);
    } else {
      const u = (s - ST) / (1 - ST);
      const e = u * u * (3 - 2 * u);
      z = -ZB + (ZF + ZB) * e;
      fp = u < 0.35 ? 40 - 34 * (u / 0.35) : 6 - 21 * ((u - 0.35) / 0.65);
      y = onGround(fp) + 46 * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u * 0.45);
    }
    return {ankle: [x, y, z], fy: sg * 4, fp, pole: [sg * 0.08, 0, 1]};
  };
  const sR = f;
  const sL = (f + 0.5) % 1;
  const c1 = Math.cos(TAU * f);
  const s1 = Math.sin(TAU * f);
  const bob = 11 * Math.cos(2 * TAU * (f - 0.3));
  const pelvis: Frame = {x: -6 * s1, z: -4, roll: -3.5 * s1, tw: 8 * c1};
  const chest: Frame = {x: -3 * s1, z: 6, roll: 2 * s1, tw: -6 * c1};
  // the arms: the forearm lags the upper arm (follow-through)
  const arm = (side: 'l' | 'r'): ArmT => {
    const sg = side === 'l' ? 1 : -1;
    const sw = (k: number) => sg * 16 * Math.cos(TAU * (f - k)) + 2;
    const s0 = sw(0);
    const lag = sw(0.07);
    const bend = 9 + 22 * Math.pow(clamp((lag + 14) / 32, 0, 1), 1.6);
    return {ang: [s0, m ? 9 : 10, bend, 6], hand: 'swing'};
  };
  return {
    kind: 'walk',
    pelvis,
    chest,
    waist: {z: 8},
    torso: {dy: -18 + bob, pitch: 3},
    head: {yaw: 0, roll: 0, pitch: -1},
    neck: {fwd: 8, lean: 8, nbz: -14},
    legs: {r: foot(sR, 'r'), l: foot(sL, 'l')},
    arms: {l: arm('l'), r: arm('r')},
    phase: f,
  };
}

/** Seated on a ledge whose top is at y = top and whose edge is at z = edge (ref 05, mirrored to face screen-left): the
 *  sit bones on the top, the thighs along it, the knees just past the edge, the shins hanging, the near foot a little
 *  forward; the back rounded forward, the forearms on the thighs, the hands loosely together by the knees, the head
 *  bowed to them. */
export function ledge5(sex: Sex, top = 330, edge = 230): Pose5 {
  void sex;
  const hipY = top + 64;
  const pelvis: Frame = {x: 0, z: -6, roll: 0, tw: 0};
  const chest: Frame = {x: 0, z: -2, roll: 0, tw: 0};
  const kz = edge + 8;
  return {
    kind: 'ledge',
    pelvis,
    chest,
    waist: {z: 0},
    torso: {dy: hipY - 545, pitch: -4, bend: 26},
    head: {yaw: 0, roll: 0, pitch: -24},
    neck: {fwd: 10, lean: 12, nbz: -14},
    legs: {
      // the near shin crossed over the far one at the ankles, the feet relaxed (ref 05's hanging legs)
      l: {ankle: [-12, top - 232, kz + 26], fy: -10, fp: 30, pole: [0.05, 0.4, 1]},
      r: {ankle: [8, top - 222, kz - 18], fy: 8, fp: 24, pole: [-0.05, 0.4, 1]},
    },
    arms: {
      // the hands rest on the knees, the wrists turned so the backs face out and up (palms down and in)
      l: {wr: [14, hipY + 52, kz - 56], pole: [0.6, -0.5, -0.3], hand: 'lap', hd: [-0.1, -0.45, 1], pn: [-0.72, -0.68, 0.05]},
      r: {wr: [-14, hipY + 56, kz - 72], pole: [-0.6, -0.5, -0.3], hand: 'lap', hd: [0.1, -0.4, 1], pn: [0.72, -0.68, 0.05]},
    },
  };
}

/** Seated on the ground (ref 01): the sit bones on the ground, the knees up, the feet flat in front; the back rounded
 *  forward over the knees, the arms round them (the left forearm over the left knee, the right hand round the front),
 *  the head turned to the view: a compact shape that reads from behind by posture alone. */
export function ground5(sex: Sex): Pose5 {
  const m = sex === 'm';
  const hipY = 74;
  const pelvis: Frame = {x: 0, z: -4, roll: 2, tw: -4};
  const chest: Frame = {x: 4, z: -2, roll: -3, tw: 6};
  return {
    kind: 'ground',
    pelvis,
    chest,
    torso: {dy: hipY - 545, pitch: 2, bend: 28},
    head: {yaw: 30, roll: 5, pitch: 0},
    neck: {fwd: 8, lean: 9, nbz: -14},
    legs: {
      l: {ankle: [58, 40, m ? 360 : 340], fy: 10, fp: 0, pole: [0.25, 1, 0.2]},
      r: {ankle: [-50, 40, m ? 330 : 312], fy: -8, fp: 0, pole: [-0.2, 1, 0.3]},
    },
    arms: {
      // hugging the knees (ref 01): the left forearm over the left knee, the right hand round the front of the knees,
      // the elbows out
      l: {wr: [92, 290, 262], pole: [0.7, -0.4, -0.6], hand: 'relax', hd: [0.05, -0.6, 0.8], pn: [-1, 0, 0]},
      r: {wr: [-20, 250, 268], pole: [-0.9, -0.2, -0.4], hand: 'relax', hd: [0.7, -0.5, 0.4], pn: [0, 0, -1]},
    },
  };
}

/** Leaning back on a rail at y = rail, z = rz: the seat against it, the body a straight line back from the crossed
 *  ankles, both hands on the rail beside the hips (the elbows back), the head turned to look along the quay. */
export function lean5(sex: Sex, rail = 520, rz = -96): Pose5 {
  const m = sex === 'm';
  const pelvis: Frame = {x: -4, z: rz + 80, roll: -2, tw: 5};
  const chest: Frame = {x: -2, z: rz + 72, roll: 1.5, tw: -4};
  const az = rz + 80 + (m ? 150 : 138);
  return {
    kind: 'lean',
    pelvis,
    chest,
    waist: {x: -3, z: rz + 82},
    torso: {dy: -16, pitch: 3, bend: 4},
    head: {yaw: -18, roll: 4, pitch: 2, dx: 2},
    neck: {fwd: 8, lean: 4, nbz: -14},
    legs: {
      // the near (left) ankle crossed over the far one, in front of it
      l: {ankle: [-40, 50, az + 22], fy: -14, fp: 10, pole: [-0.5, 0, 1]},
      r: {ankle: [30, 40, az - 16], fy: 16, fp: 0, pole: [0.15, 0, 1]},
    },
    arms: {
      l: {wr: [(m ? 132 : 122), rail + 14, rz + 8], pole: [0.5, 0, -1], hand: 'grip', hd: [0.2, -0.45, 0.85], pn: [0, -0.6, -0.8]},
      r: {wr: [-(m ? 132 : 122), rail + 14, rz + 8], pole: [-0.5, 0, -1], hand: 'grip', hd: [-0.2, -0.45, 0.85], pn: [0, -0.6, -0.8]},
    },
  };
}
