// HAIR v2 iteration, PROPORTIONS AND STATURE (RECIPE.md (d)): the new parameter set the new figures use (graphic/'s
// WOMAN and MAN keep working unchanged). The body stays adult and long-legged (7.8 heads for her, legs 5 % long); the
// neck is a little slimmer for women and leans forward from its base (a craniovertebral angle of ~55-60 degrees, not
// ~72: the ramrod we measured); the head sits forward of the neck's base; the back has its S (the seat back, the lower
// back forward, the ribcage a touch back); the weight shift shows (the hip shift pushes the coat's side, the hem
// tilts); one arm hangs off the body. Heights vary by the legs (d.4): the skull scales with H^0.3.
// Body space as in graphic/rig.ts: x = her left, y = up from the sole, z = her front; H = 1000.
import {type V3} from '../graphic/geo';
import {WOMAN, MAN, armByAngles, framePt, type Build, type Frame, type Skel} from '../graphic/body';

// ---------------------------------------------------------------- the builds (d.1, d.4)
/** Her (and the average woman): neck 0.042 H wide (was 0.046), shoulders sloping 15-20 degrees, legs as before. */
export const WOMAN_V2: Build = {...WOMAN, neckW: 42, shoulderW: 238};
/** The average man: neck 0.055 H. */
export const MAN_V2: Build = {...MAN, neckW: 55, shoulderW: 270};

export type BuildName = 'slim' | 'average' | 'athletic' | 'soft';
/** A build's widths and limb factor (d.4). */
export function build(sex: 'f' | 'm', kind: BuildName): Build {
  const base = sex === 'f' ? WOMAN_V2 : MAN_V2;
  const W: Record<'f' | 'm', Record<BuildName, {sh: number; wa: number; hip: number; limb: number; thigh?: number; neck?: number}>> = {
    f: {
      slim: {sh: 228, wa: 150, hip: 200, limb: 0.92, thigh: 0.9},
      average: {sh: 238, wa: 158, hip: 210, limb: 1},
      athletic: {sh: 246, wa: 162, hip: 208, limb: 1.06},
      soft: {sh: 236, wa: 172, hip: 230, limb: 1.12, thigh: 1.14},
    },
    m: {
      slim: {sh: 255, wa: 175, hip: 188, limb: 0.92},
      average: {sh: 270, wa: 184, hip: 195, limb: 1},
      athletic: {sh: 285, wa: 190, hip: 198, limb: 1.08, neck: 60},
      soft: {sh: 275, wa: 205, hip: 205, limb: 1.12},
    },
  };
  const w = W[sex][kind];
  const L = w.limb;
  const T = w.thigh ?? L;
  return {
    ...base,
    shoulderW: w.sh,
    waistW: w.wa,
    hipW: w.hip,
    chestW: base.chestW * (w.sh / base.shoulderW),
    neckW: w.neck ?? base.neckW,
    thighR: base.thighR * T,
    kneeR: base.kneeR * (0.5 + 0.5 * L),
    calfR: base.calfR * L,
    ankleR: base.ankleR * (sex === 'f' && kind === 'slim' ? 0.94 : 1),
    armR: base.armR * L,
    elbowR: base.elbowR * (0.5 + 0.5 * L),
    wristR: base.wristR * (0.6 + 0.4 * L),
    waistD: base.waistD * (w.wa / base.waistW),
    hipD: base.hipD * (0.6 + 0.4 * (w.hip / base.hipW)),
    chestD: base.chestD * (0.7 + 0.3 * (w.sh / base.shoulderW)),
  };
}

// ---------------------------------------------------------------- heights (d.4): the head and torso stay, the legs carry
export type Height = {who: string; sex: 'f' | 'm'; cm: number; build: BuildName};
/** heads tall = 7.8 x (H / 168)^0.7 (women), men's skulls 2 % larger at a given height; the crotch near +5 % legs. */
export function heightNumbers(h: Height): {heads: number; skull: number; crotch: number} {
  const heads = 7.8 * Math.pow(h.cm / 168, 0.7) / (h.sex === 'm' ? 1.02 : 1);
  const skull = 1000 / heads;
  // the crotch: her 0.485 at 168 cm; the legs carry the difference in height (half of it in the crotch's fraction)
  const crotch = Math.min(505, 485 + (h.cm - 168) * 0.95 + (h.sex === 'm' ? -2 : 0));
  return {heads, skull, crotch};
}
export const LINEUP: Height[] = [
  {who: 'w152', sex: 'f', cm: 152, build: 'soft'},
  {who: 'w160', sex: 'f', cm: 160, build: 'athletic'},
  {who: 'her', sex: 'f', cm: 168, build: 'average'},
  {who: 'w175', sex: 'f', cm: 175, build: 'slim'},
  {who: 'm167', sex: 'm', cm: 167, build: 'soft'},
  {who: 'm177', sex: 'm', cm: 177, build: 'average'},
  {who: 'm182', sex: 'm', cm: 182, build: 'athletic'},
  {who: 'm188', sex: 'm', cm: 188, build: 'slim'},
];

/** The piecewise map from her body heights to a figure's (y up from the sole, H = 1000): the head from the crown to the
 *  chin scales with the skull, the neck and torso from the chin to the crotch keep their length (stretched to fit),
 *  the legs take the rest. Garments drawn in her heights are mapped through it (people.ts warps the paths). */
export function yMap(base: Build, skull: number, crotch: number): (y: number) => number {
  const chin0 = 1000 - base.skull;
  const chin1 = 1000 - skull;
  const c0 = base.crotch;
  const c1 = crotch;
  return (y: number) => {
    if (y >= chin0) return chin1 + (y - chin0) * (skull / base.skull);
    if (y >= c0) return c1 + ((y - c0) * (chin1 - c1)) / (chin0 - c0);
    return (y * c1) / c0;
  };
}

// ---------------------------------------------------------------- the skeleton with the new neck and the S
export type SkelV2 = Skel & {waist: Frame};
export type PoseV2 = {
  b: Build;
  pelvis: Frame;
  chest: Frame;
  /** the lumbar curve: the waist frame (the S in profile: forward of the line from the chest to the pelvis) */
  waist?: Partial<Frame>;
  head: {yaw: number; roll: number; pitch: number; dx?: number};
  /** the head forward of the chest (body units; ~34: the ear ~0.03 H in front of the shoulder joint) */
  fwd?: number;
  /** the neck's lean from its base (degrees forward of vertical) */
  lean?: number;
  /** the shoulder joints lowered (d.1: 0.005-0.01 H) */
  drop?: number;
  legs: {l: {knee: V3; ankle: V3; fy: number; fp: number}; r: {knee: V3; ankle: V3; fy: number; fp: number}};
  arms: {l: {el: V3; wr: V3}; r: {el: V3; wr: V3}};
  /** the whole body lifted (a seated pose: the hips stay where the legs say) */
  lift?: number;
};

export function skelV2(p: PoseV2): SkelV2 {
  const b = p.b;
  const hipY = b.hipJ;
  const shY = b.shoulderY - 14 - (p.drop ?? 7);
  const hipL = framePt(p.pelvis, 48 * (b.hipW / 210), hipY, 0);
  const hipR = framePt(p.pelvis, -48 * (b.hipW / 210), hipY, 0);
  const shL = framePt(p.chest, b.shoulderW / 2 - 13, shY, -16);
  const shR = framePt(p.chest, -(b.shoulderW / 2 - 13), shY, -16);
  const fwd = p.fwd ?? 34;
  const lean = p.lean ?? 20;
  // the neck: its base a little back, its axis leaning forward; the head forward of it with the face plane vertical
  const neckBase: V3 = [p.chest.x, b.shoulderY + 8, p.chest.z - 19];
  const topY = 1000 - b.skull - 4;
  const dzLean = (topY - neckBase[1]) * Math.tan((lean * Math.PI) / 180);
  const neckTop: V3 = [p.chest.x + (p.head.dx ?? 0) * 0.6, topY, neckBase[2] + dzLean];
  const headC: V3 = [p.chest.x + (p.head.dx ?? 0), 1000 - b.skull / 2, p.chest.z + 4 + fwd];
  const waist: Frame = {
    x: (p.pelvis.x + p.chest.x) / 2,
    z: (p.pelvis.z + p.chest.z) / 2,
    roll: (p.pelvis.roll + p.chest.roll) / 2,
    tw: (p.pelvis.tw + p.chest.tw) / 2,
    ...p.waist,
  };
  return {
    b,
    pelvis: p.pelvis,
    chest: p.chest,
    waist,
    head: {c: headC, yaw: p.head.yaw, roll: p.head.roll, pitch: p.head.pitch},
    neckTop,
    neckBase,
    arm: {
      l: {sh: shL, el: p.arms.l.el, wr: p.arms.l.wr, hd: [0, -1, 0], hp: 'relaxed'},
      r: {sh: shR, el: p.arms.r.el, wr: p.arms.r.wr, hd: [0, -1, 0], hp: 'relaxed'},
    },
    leg: {
      l: {hip: hipL, knee: p.legs.l.knee, ankle: p.legs.l.ankle, fy: p.legs.l.fy, fp: p.legs.l.fp},
      r: {hip: hipR, knee: p.legs.r.knee, ankle: p.legs.r.ankle, fy: p.legs.r.fy, fp: p.legs.r.fp},
    },
  };
}

/** The craniovertebral angle of a skeleton (degrees): the line from C7 (the back of the neck's base) to the ear (a
 *  little behind and below the head's centre), from the horizontal. ~54 relaxed (F16); ours was ~72. */
export function cva(sk: Skel): number {
  const c7: [number, number] = [sk.neckBase[2] - sk.b.neckW / 2, sk.neckBase[1]];
  const ear: [number, number] = [sk.head.c[2] - 0.13 * sk.b.skull, sk.head.c[1] - 0.07 * sk.b.skull];
  return (Math.atan2(ear[1] - c7[1], ear[0] - c7[0]) * 180) / Math.PI;
}

/** Arm joints by angles from the shoulder (graphic/body.ts armByAngles), as a pose's arm. */
export function armAt(b: Build, sh: V3, side: 'l' | 'r', swing: number, abd: number, bend: number, inw = 0): {el: V3; wr: V3} {
  const a = armByAngles(b, sh, side, swing, abd, bend, inw);
  return {el: a.el, wr: a.wr};
}

/** The shoulder joint a pose will have (for arm angles): mirrors skelV2. */
export function shoulderOf(b: Build, chest: Frame, side: 'l' | 'r', drop = 7): V3 {
  const s = side === 'l' ? 1 : -1;
  return framePt(chest, s * (b.shoulderW / 2 - 13), b.shoulderY - 14 - drop, -16);
}

// ---------------------------------------------------------------- the stances (d.2)
type ArmsIn = PoseV2['arms'];
/** Standing, relaxed and confident: the weight on her right leg, the hip shifted 0.02 H over it and the pelvis tilted 7
 *  degrees (the weight hip up), the shoulders 4.5 the other way, the free knee bent and its foot forward and turned
 *  out; the seat back, the lower back forward; the head forward on a leaning neck, tilted and turned off the torso. */
export function standV2(b: Build, arms: (chest: Frame) => ArmsIn, o: {headYaw?: number; roll?: number; tilt?: number; mirror?: boolean} = {}): PoseV2 {
  const r = o.roll ?? 7;
  const chest: Frame = {x: -4, z: -3, roll: r * 0.64, tw: -6};
  const pelvis: Frame = {x: -20, z: -8, roll: -r, tw: 6};
  return {
    b,
    pelvis,
    chest,
    waist: {x: -13, z: 5},
    head: {yaw: o.headYaw ?? 18, roll: o.tilt ?? 6, pitch: 2, dx: 3},
    fwd: 30,
    lean: 20,
    legs: {
      r: {knee: [-50, 296, 2], ankle: [-30, 40, -8], fy: -14, fp: 0},
      l: {knee: [44, 306, 40], ankle: [62, 42, 70], fy: 28, fp: 0},
    },
    arms: arms(chest),
  };
}
/** The walk's contact pose (profile): the near (left) leg forward, the right pushing off, a 3-degree lean, the hips
 *  turned 8 degrees and the shoulders against them; the head forward on the leaning neck. */
export function walkV2(b: Build, arms: (chest: Frame) => ArmsIn): PoseV2 {
  const chest: Frame = {x: 0, z: 8, roll: 0, tw: 7};
  const pelvis: Frame = {x: 0, z: -4, roll: 0, tw: -8};
  return {
    b,
    pelvis,
    chest,
    waist: {z: 8},
    head: {yaw: 0, roll: 0, pitch: 0},
    fwd: 36,
    lean: 22,
    legs: {
      l: {knee: [48, 300, 82], ankle: [46, 40, 162], fy: 4, fp: 0},
      r: {knee: [-46, 298, -52], ankle: [-44, 74, -150], fy: -4, fp: 32},
    },
    arms: arms(chest),
  };
}
/** From behind, the weight on her left leg, looking back over her left shoulder (the lost profile). */
export function backV2(b: Build, arms: (chest: Frame) => ArmsIn, headYaw = 34): PoseV2 {
  const chest: Frame = {x: 3, z: -3, roll: -4.5, tw: 5};
  const pelvis: Frame = {x: 20, z: -8, roll: 7, tw: -5};
  return {
    b,
    pelvis,
    chest,
    waist: {x: 13, z: 5},
    head: {yaw: headYaw, roll: 6, pitch: 1, dx: -2},
    fwd: 34,
    lean: 20,
    legs: {
      l: {knee: [50, 296, 2], ankle: [30, 40, -8], fy: 14, fp: 0},
      r: {knee: [-46, 306, 36], ankle: [-66, 42, 60], fy: -28, fp: 0},
    },
    arms: arms(chest),
  };
}
/** The old (graphic/faces cast) stand's head, for reference: yaw 6, roll -5, pitch 3. */
export const OLD_HEAD = {yaw: 6, roll: -5, pitch: 3};
export {WOMAN, MAN};
