// Editorial people: proportions and the pose skeleton (dir_editorial.md §1, §6). Slightly elongated fashion-illustration
// proportions at the dose beauty research finds attractive (design_research.md §3): ~8.1 heads for a woman, ~8.3 for a
// man (never the croquis's 9-10), the extra length in the legs (the hip joint at 0.55 H), a long visible neck, real-size
// hands (~0.1 H) and feet (~0.15 H). All in H = 1000, feet on Y = 0 (core.ts conventions).
import {type V3, add3, clamp, ik3, lerp, norm3, pchip, sub3} from './core';

export type Sex = 'f' | 'm';
export type Build = {
  sex: Sex;
  /** Crown to chin. */
  skull: number;
  crownY: number;
  /** The head's pivot (the top of the neck, behind the jaw) and the neck's base. */
  pivotY: number;
  neckBaseY: number;
  neckR: number;
  neckD: number;
  /** The shoulder joints (the arms' pivots) and the shoulder's outer half-width (deltoid). */
  shY: number;
  shX: number;
  shOuter: number;
  armpitY: number;
  chestY: number;
  chestA: number;
  chestBf: number;
  chestBb: number;
  waistY: number;
  waistA: number;
  waistBf: number;
  waistBb: number;
  hipY: number;
  hipA: number;
  hipBf: number;
  hipBb: number;
  hipJY: number;
  hipJX: number;
  crotchY: number;
  kneeY: number;
  ankleY: number;
  upperArm: number;
  foreArm: number;
  hand: number;
  foot: number;
  /** Leg radii (lateral) at the thigh top, above the knee, the knee, the calf's peak, the ankle. */
  legR: [number, number, number, number, number];
  armR: [number, number, number, number];
};

/** A woman (the "you"): 8.1 heads (skull 0.123 H), the hip joint at 0.548 H, the crotch at 0.49 H. */
export const WOMAN: Build = {
  sex: 'f',
  skull: 123,
  crownY: 1000,
  pivotY: 902,
  neckBaseY: 832,
  neckR: 21,
  neckD: 23,
  shY: 806,
  shX: 88,
  shOuter: 114,
  armpitY: 760,
  chestY: 738,
  chestA: 88,
  chestBf: 68,
  chestBb: 56,
  waistY: 632,
  waistA: 73,
  waistBf: 49,
  waistBb: 48,
  hipY: 516,
  hipA: 101,
  hipBf: 56,
  hipBb: 70,
  hipJY: 548,
  hipJX: 78,
  crotchY: 490,
  kneeY: 292,
  ankleY: 40,
  upperArm: 178,
  foreArm: 146,
  hand: 96,
  foot: 148,
  legR: [50, 34, 26, 30, 14.5],
  armR: [25, 19, 20.5, 14],
};

/** A man: 8.3 heads (skull 0.121 H), broader shoulders (0.27 H outer), a straighter waist and hip. */
export const MAN: Build = {
  sex: 'm',
  skull: 121,
  crownY: 1000,
  pivotY: 902,
  neckBaseY: 828,
  neckR: 27,
  neckD: 29,
  shY: 800,
  shX: 106,
  shOuter: 136,
  armpitY: 750,
  chestY: 728,
  chestA: 110,
  chestBf: 64,
  chestBb: 62,
  waistY: 612,
  waistA: 90,
  waistBf: 55,
  waistBb: 52,
  hipY: 510,
  hipA: 97,
  hipBf: 56,
  hipBb: 64,
  hipJY: 540,
  hipJX: 84,
  crotchY: 482,
  kneeY: 288,
  ankleY: 42,
  upperArm: 186,
  foreArm: 152,
  hand: 104,
  foot: 158,
  legR: [56, 40, 30, 34, 17.5],
  armR: [29, 23, 24.5, 17],
};

// ---------------------------------------------------------------- the pose

export type Side = 'l' | 'r';
export type ArmKind = 'hang' | 'pocket' | 'jeansPocket' | 'backPocket' | 'phone' | 'phoneLow' | 'strap' | 'swing' | 'hold';
export type ArmPose = {kind: ArmKind; amount?: number};

export type Pose = {
  /** The figure's view (degrees, core.ts View.yaw). */
  yaw: number;
  /** Standing: the weight leg (the figure's own side). */
  weight?: Side;
  /** Contrapposto strength 0..1 (1 = the pelvis tilts 6 degrees, the shoulders 3 the other way). */
  contra?: number;
  /** The free foot: forward and outward (units), its turn-out (degrees). */
  free?: {fwd?: number; out?: number; turn?: number; heel?: number};
  /** Walking (profile): the phase in steps (0 = contact, the LEFT leg forward). */
  walk?: number;
  /** The head relative to the torso (degrees): turn (+ toward the figure's LEFT... see head.ts), nod (+ chin down),
   *  roll (+ drops the left ear). */
  head?: {turn?: number; nod?: number; roll?: number};
  armL?: ArmPose;
  armR?: ArmPose;
  /** Lean forward (degrees) for walks. */
  lean?: number;
};

export type Skeleton = {
  b: Build;
  pose: Pose;
  /** The spine: lateral centre, forward centre and frontal tilt by height. */
  cx: (y: number) => number;
  cz: (y: number) => number;
  tilt: (y: number) => number;
  /** Lean (a forward rotation of everything above the hips, degrees) for the walk. */
  leanXf: (p: V3) => V3;
  hip: Record<Side, V3>;
  knee: Record<Side, V3>;
  ankle: Record<Side, V3>;
  /** The foot's heading (degrees about the vertical: 0 = forward +Z, + = turned toward the figure's LEFT / outward
   *  for the left foot) and its pitch (+ = heel up). */
  footYaw: Record<Side, number>;
  footPitch: Record<Side, number>;
  sh: Record<Side, V3>;
  elbow: Record<Side, V3>;
  wrist: Record<Side, V3>;
  /** The neck's base and the head's pivot (world). */
  neckBase: V3;
  pivot: V3;
  /** The hand's orientation hint per side: 'side' | 'back' | 'grip' | 'hidden'. */
  hand: Record<Side, 'relaxed' | 'grip' | 'hidden' | 'thumb'>;
  /** The vertical drop of the body in the walk (the contact's down). */
  bob: number;
};

const sgn = (s: Side) => (s === 'l' ? 1 : -1);

/** The walk's feet (profile, after Williams; the locked contact of ref 03: a span of ~0.5 H). */
function walkFeet(b: Build, phase: number): {ankle: Record<Side, V3>; pitch: Record<Side, number>; hipY: number} {
  // phase 0: contact, LEFT foot forward (heel down, toe up), RIGHT foot behind (heel up, toe pushing)
  const u = ((phase % 2) + 2) % 2;
  const reach = b.hipJY - b.ankleY - 2;
  const lead: Side = u < 1 ? 'l' : 'r';
  const trail: Side = lead === 'l' ? 'r' : 'l';
  const k = u % 1; // 0 = contact .. 1 = the next contact
  // a still at k = 0 (contact) or a little after: the front heel planted, the back foot rolling to its toe
  const front = 168 - 60 * smoothStep(k);
  const back = -132 - 40 * k;
  const ankle = {} as Record<Side, V3>;
  const pitch = {} as Record<Side, number>;
  ankle[lead] = [0, b.ankleY, front];
  pitch[lead] = -12 * (1 - smoothStep(k * 3));
  // the back foot: its toe on the ground, the heel lifted ~30 degrees
  const heelUp = 24 + 10 * k;
  const toeLen = b.foot * 0.72;
  ankle[trail] = [0, b.ankleY + Math.sin((heelUp * Math.PI) / 180) * toeLen * 0.55, back];
  pitch[trail] = heelUp;
  const dzF = front;
  const hipY = Math.min(b.hipJY, b.ankleY + Math.sqrt(Math.max(0, reach * reach - dzF * dzF)));
  return {ankle, pitch, hipY};
}
const smoothStep = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};

/** Build the skeleton for a pose. */
export function skeleton(b: Build, pose: Pose): Skeleton {
  const walking = pose.walk !== undefined;
  const w: Side = pose.weight ?? 'l';
  const ws = sgn(w);
  const c = walking ? 0 : (pose.contra ?? 1);
  // contrapposto: the pelvis shifts toward the weight leg and tilts up on that side; the ribcage tilts the other way;
  // the pit of the neck sits over the weight foot (design_research A2)
  const shift = 16 * c * ws;
  const ht = 6 * c * ws;
  const st = -3.2 * c * ws;
  let bob = 0;
  let ankle = {} as Record<Side, V3>;
  const footYaw = {l: 0, r: 0} as Record<Side, number>;
  const footPitch = {l: 0, r: 0} as Record<Side, number>;
  if (walking) {
    const wf = walkFeet(b, pose.walk!);
    bob = b.hipJY - wf.hipY;
    ankle = {l: [b.hipJX * 0.55, wf.ankle.l[1], wf.ankle.l[2]], r: [-b.hipJX * 0.55, wf.ankle.r[1], wf.ankle.r[2]]};
    footPitch.l = wf.pitch.l;
    footPitch.r = wf.pitch.r;
    footYaw.l = 4;
    footYaw.r = -4;
  }
  const yPel = b.hipJY - bob;
  const cxF = pchip(
    [-(b.crotchY - 60), -b.hipJY, -b.waistY, -b.chestY, -b.neckBaseY, -b.pivotY],
    [shift, shift, shift * 0.55, shift * 0.55, shift * 0.75, shift * 0.85],
  );
  const tiltF = pchip([-(b.crotchY - 60), -b.hipJY, -(b.waistY + 10), -b.chestY, -b.neckBaseY], [ht, ht, ht * 0.25, st, st]);
  const czF = pchip([-(b.crotchY - 60), -b.hipJY, -b.waistY, -b.chestY, -b.neckBaseY], [0, 0, 1, 0, -3]);
  const cx = (y: number) => cxF(-(y + bob));
  const tilt = (y: number) => tiltF(-(y + bob));
  const cz = (y: number) => czF(-(y + bob));
  const lean = pose.lean ?? (walking ? 2.5 : 0);
  const leanC: V3 = [0, yPel, 0];
  const leanXf = (p: V3): V3 => {
    if (!lean || p[1] <= yPel - 20) return p;
    // rotate about the hip line, ramping in over the pelvis
    const k = clamp((p[1] - (yPel - 20)) / 60, 0, 1);
    const a = (lean * k * Math.PI) / 180;
    const dy = p[1] - leanC[1];
    const dz = p[2] - leanC[2];
    return [p[0], leanC[1] + dy * Math.cos(a) - dz * Math.sin(a), leanC[2] + dy * Math.sin(a) + dz * Math.cos(a)];
  };
  // hips (pelvis frame: tilt about the pelvis centre)
  const tanH = Math.tan((ht * Math.PI) / 180);
  const hip: Record<Side, V3> = {
    l: [shift + b.hipJX, yPel + b.hipJX * tanH, 0],
    r: [shift - b.hipJX, yPel - b.hipJX * tanH, 0],
  };
  if (!walking) {
    const f: Side = w === 'l' ? 'r' : 'l';
    const fs = sgn(f);
    // the weight foot under the pit of the neck (near the midline), turned out a little; the free foot forward and out
    ankle[w] = [shift * 0.9 + ws * 18, b.ankleY, 0];
    const fr = pose.free ?? {};
    ankle[f] = [shift + fs * (b.hipJX + (fr.out ?? 26)), b.ankleY + (fr.heel ?? 0), fr.fwd ?? 52];
    footYaw[w] = ws * 12;
    footYaw[f] = fs * (fr.turn ?? 24);
    footPitch[f] = fr.heel ? Math.min(40, fr.heel * 0.9) : 0;
  }
  const thigh = b.hipJY - b.kneeY;
  const shin = b.kneeY - b.ankleY;
  const knee: Record<Side, V3> = {
    l: ik3(hip.l, ankle.l, thigh, shin, norm3([0.12, 0, 1])),
    r: ik3(hip.r, ankle.r, thigh, shin, norm3([-0.12, 0, 1])),
  };
  // arms: the shoulders on the ribcage's tilt
  const tanS = Math.tan((st * Math.PI) / 180);
  const shx = cx(b.shY);
  const sh: Record<Side, V3> = {
    l: leanXf([shx + b.shX, b.shY - bob + b.shX * tanS, -4]),
    r: leanXf([shx - b.shX, b.shY - bob - b.shX * tanS, -4]),
  };
  const elbow = {} as Record<Side, V3>;
  const wrist = {} as Record<Side, V3>;
  const hand = {} as Record<Side, 'relaxed' | 'grip' | 'hidden' | 'thumb'>;
  (['l', 'r'] as Side[]).forEach((s) => {
    const ss = sgn(s);
    const ap = (s === 'l' ? pose.armL : pose.armR) ?? {kind: 'hang'};
    const S = sh[s];
    const ua = b.upperArm;
    const fa = b.foreArm;
    let target: V3;
    let pole: V3;
    let hd: 'relaxed' | 'grip' | 'hidden' | 'thumb' = 'relaxed';
    switch (ap.kind) {
      case 'pocket': {
        // a coat or trouser side pocket at the hip's front: the hand gone, the arm nearly straight, the elbow soft and
        // turned back (never a chicken wing: design_research A5, the forearm 20-40 degrees off the body)
        target = [cx(b.hipY) + ss * (b.hipA + 16), b.hipY - 6 - bob, 40];
        pole = [ss * 0.35, 0, -1];
        hd = 'hidden';
        break;
      }
      case 'jeansPocket': {
        // the front jeans pocket: the fingers in, the thumb hooked out
        target = [cx(b.hipY) + ss * (b.hipA - 26), b.hipY + 58 - bob, 50];
        pole = [ss * 1, 0, -0.6];
        hd = 'thumb';
        break;
      }
      case 'phone': {
        // the phone at the chest, the forearm up (design_research A5: the hand at 0.68-0.72 H)
        target = [cx(b.chestY) + ss * 24, 690 - bob, 150];
        pole = [ss * 0.6, -1, -0.4];
        hd = 'grip';
        break;
      }
      case 'phoneLow': {
        // the phone held low by the hip, looked at
        target = [cx(b.waistY) + ss * 62, 600 - bob, 120];
        pole = [ss * 0.8, -0.3, -1];
        hd = 'grip';
        break;
      }
      case 'strap': {
        // the hand on the bag's strap at the shoulder's front (0.78 H)
        target = [S[0] - ss * 6, b.shY - 60 - bob, 62];
        pole = [ss * 0.7, -1, -0.5];
        hd = 'grip';
        break;
      }
      case 'backPocket': {
        // the hand slipped into the back jeans pocket: the elbow out and back, the hand hidden on the seat
        target = [cx(b.hipY) + ss * (b.hipA - 34), b.hipY + 18 - bob, -b.hipBb + 6];
        pole = [ss * 1, -0.1, -0.35];
        hd = 'hidden';
        break;
      }
      case 'hold': {
        // carrying something by its handle at the side (a tote, a cup)
        target = [S[0] + ss * 16, b.hipY - 10 - bob, 36];
        pole = [ss * 0.4, 0, -1];
        hd = 'grip';
        break;
      }
      case 'swing': {
        // the walk's swing: + = the arm forward
        const a = ap.amount ?? 0;
        const r = (a * Math.PI) / 180;
        const elb: V3 = add3(S, [ss * 8, -ua * Math.cos(r), ua * Math.sin(r)]);
        const r2 = r + ((10 + Math.max(0, a) * 0.8) * Math.PI) / 180;
        target = add3(elb, [ss * 4, -fa * Math.cos(r2), fa * Math.sin(r2)]);
        pole = [ss * 0.2, 0, -1];
        break;
      }
      default: {
        // hanging, the elbow soft (8-20 degrees), the hand a little behind the thigh's centre line, turned in
        target = [S[0] + ss * 12, S[1] - (ua + fa) * 0.975, 12];
        pole = [ss * 0.3, 0, -1];
      }
    }
    const e = ik3(S, target, ua, fa, norm3(pole));
    elbow[s] = e;
    // the wrist on the target (or short of it: ik clamps reach)
    const dir = norm3(sub3(target, e));
    const d = Math.min(fa, Math.hypot(...sub3(target, e)));
    wrist[s] = add3(e, [dir[0] * d, dir[1] * d, dir[2] * d]);
    hand[s] = hd;
  });
  const neckBase = leanXf([cx(b.neckBaseY), b.neckBaseY - bob, -14]);
  const pivot = leanXf([cx(b.pivotY), b.pivotY - bob, -2]);
  return {b, pose, cx, cz, tilt, leanXf, hip, knee, ankle, footYaw, footPitch, sh, elbow, wrist, neckBase, pivot, hand, bob};
}

/** The leg's radius profile (lateral, depth, the calf's offset back, its offset toward the inner side) at the bone
 *  fraction s (0 hip .. 1 ankle): a slim knee, the calf's peak high and behind (its inner bulge a little lower), a long
 *  concave sweep down to a slim ankle (design_research S2, S6: thigh : ankle ~3.4 : 1). `medial` = +1 for the left leg
 *  (the tube's +u axis points to the figure's right), -1 for the right. */
export function legRadius(b: Build, s: number, medial = 0): {ru: number; rv: number; off: number; offU: number} {
  const [th, ak, kn, cf, an] = b.legR;
  const xs = [0, 0.2, 0.42, 0.5, 0.6, 0.7, 0.8, 0.9, 0.97, 1];
  const ru = pchip(xs, [th, th * 0.86, ak, kn, cf, cf * 0.93, cf * 0.72, an * 1.12, an, an * 1.04])(s);
  const rv = pchip(xs, [th * 1.05, th * 0.9, ak * 1.05, kn * 1.1, cf * 1.2, cf * 1.1, cf * 0.8, an * 1.2, an * 1.1, an * 1.1])(s);
  const off = pchip(xs, [0, 0, 0, -1, -7, -6.5, -3.5, -1, 0, 0])(s);
  const offU = medial * pchip(xs, [0, 0, 0, 0.5, 2.6, 3.0, 1.6, 0.3, 0, 0])(s);
  return {ru, rv, off, offU};
}
export function armRadius(b: Build, s: number): {ru: number; rv: number; off: number} {
  const [ua, el, fa, wr] = b.armR;
  const xs = [0, 0.15, 0.5, 0.56, 0.68, 0.9, 1];
  const ru = pchip(xs, [ua * 1.1, ua, el, el * 1.04, fa, wr * 1.06, wr])(s);
  const rv = pchip(xs, [ua * 1.2, ua * 1.05, el * 1.05, el * 1.1, fa * 1.06, wr * 0.8, wr * 0.75])(s);
  return {ru, rv, off: 0};
}

export {lerp};
