// people_dirs/painterly: the body (dir_painterly.md "Proportions"). Natural adult proportions with the legs ~5 % long
// (design_research.md §3): the woman 7.8 heads (skull 0.128 H), the man 7.9; hip joints at 0.545 / 0.540 H; real-size
// hands (0.098 / 0.105 H) and feet. Every form is a surface of rings (mesh.ts); the skeleton comes from a pose of a few
// targets (the feet, the wrists) solved with two-bone IK, and the spine bends between the pelvis and the chest frames.
import {
  type Frame,
  type M3,
  type V3,
  add,
  bump,
  chainAt,
  chainLength,
  clamp,
  cross,
  D2R,
  dot,
  euler,
  ik3,
  lerp,
  mix,
  mulMV,
  nrm,
  rotY,
  scl,
  smooth,
  spline,
  sub,
  toWorld,
} from './math';
import type {Surface} from './mesh';

// ---------------------------------------------------------------- builds

type K = ReadonlyArray<readonly [number, number]>;
export type Build = {
  sex: 'f' | 'm';
  /** Skull height, crown to chin (units of H = 1000). */
  head: number;
  chinY: number;
  hipY: number;
  kneeY: number;
  ankleY: number;
  /** The hip joints' half spacing; the shoulder joints' half spacing and height. */
  hipJx: number;
  shJx: number;
  shJy: number;
  upperArm: number;
  foreArm: number;
  hand: number;
  foot: number;
  /** Torso profiles by height (Y): half-width, front depth, back depth, centre's z, ring exponents. */
  tA: K;
  tF: K;
  tB: K;
  tZ: K;
  /** Leg radii by straight-leg height: lateral, medial, front, back. */
  lL: K;
  lM: K;
  lF: K;
  lB: K;
  /** Arm radii by distance from the shoulder joint: front, back, lateral, medial. */
  aF: K;
  aB: K;
  aL: K;
  aM: K;
  neckR: number;
  /** Width scale (1 = average) and a bust/chest depth scale. */
  slim: number;
};

// The woman (the "you"; design_research §3, ours): skull 128 (7.8 heads), chin 872, shoulder line 818, waist 625,
// hip joints 545, crotch 485, knee 295, ankle 40; shoulders 0.24 H (with the deltoids), waist 0.16 H, hips 0.21 H.
export const WOMAN: Build = {
  sex: 'f',
  head: 128,
  chinY: 872,
  hipY: 545,
  kneeY: 295,
  ankleY: 42,
  hipJx: 50,
  shJx: 88,
  shJy: 806,
  upperArm: 183,
  foreArm: 148,
  hand: 98,
  foot: 145,
  tA: [
    [470, 90],
    [492, 99],
    [515, 104],
    [545, 104],
    [580, 95],
    [610, 84],
    [628, 80],
    [660, 82],
    [700, 88],
    [740, 93],
    [775, 97],
    [800, 99],
    [816, 97],
    [828, 88],
    [838, 70],
    [846, 47],
    [852, 27],
  ],
  tF: [
    [470, 54],
    [500, 60],
    [540, 60],
    [580, 56],
    [625, 51],
    [665, 55],
    [700, 62],
    [728, 74],
    [745, 77],
    [765, 72],
    [790, 61],
    [815, 49],
    [835, 35],
    [852, 22],
  ],
  tB: [
    [470, 60],
    [495, 73],
    [515, 74],
    [545, 67],
    [585, 54],
    [625, 46],
    [660, 50],
    [700, 56],
    [740, 59],
    [780, 59],
    [810, 54],
    [832, 41],
    [852, 25],
  ],
  tZ: [
    [470, 0],
    [560, 2],
    [625, 5],
    [700, 4],
    [760, 1],
    [820, -6],
    [852, -8],
  ],
  lL: [
    [610, 60],
    [545, 61],
    [500, 57],
    [470, 54],
    [420, 49],
    [360, 41],
    [320, 35],
    [295, 32],
    [270, 31],
    [240, 34],
    [215, 32],
    [180, 27],
    [130, 21],
    [80, 18],
    [52, 17],
    [40, 17.5],
  ],
  lM: [
    [610, 48],
    [545, 50],
    [500, 48],
    [470, 45],
    [420, 41],
    [360, 35],
    [320, 32],
    [295, 31],
    [270, 30],
    [240, 32],
    [212, 34],
    [180, 28],
    [130, 21],
    [80, 18],
    [56, 18.5],
    [40, 17],
  ],
  lF: [
    [610, 56],
    [545, 57],
    [500, 55],
    [470, 53],
    [420, 49],
    [360, 42],
    [320, 36],
    [300, 34],
    [285, 31],
    [260, 28],
    [220, 27],
    [180, 24],
    [130, 20],
    [80, 17],
    [45, 16],
  ],
  lB: [
    [610, 64],
    [545, 63],
    [500, 59],
    [470, 55],
    [420, 49],
    [360, 40],
    [320, 33],
    [295, 29],
    [270, 32],
    [240, 38],
    [215, 37],
    [180, 30],
    [130, 21],
    [80, 17],
    [45, 18],
  ],
  aF: [
    [-30, 20],
    [0, 27],
    [45, 26],
    [90, 24],
    [150, 20],
    [183, 18],
    [215, 21],
    [260, 18],
    [310, 14],
    [331, 12],
  ],
  aB: [
    [-30, 20],
    [0, 29],
    [45, 27],
    [90, 24],
    [150, 21],
    [183, 20],
    [215, 19],
    [260, 16],
    [310, 12],
    [331, 10.5],
  ],
  aL: [
    [-30, 22],
    [0, 30],
    [45, 28],
    [90, 24],
    [150, 20],
    [183, 18.5],
    [215, 22],
    [260, 18],
    [310, 15],
    [331, 14],
  ],
  aM: [
    [-30, 16],
    [0, 23],
    [45, 23],
    [90, 22],
    [150, 19],
    [183, 18],
    [215, 19],
    [260, 16],
    [310, 13],
    [331, 12.5],
  ],
  neckR: 23,
  slim: 1,
};

// The man: skull 127 (7.9 heads), hip joints 540, crotch 480, shoulders 0.27 H, waist 0.185 H, hips 0.195 H.
export const MAN: Build = {
  ...WOMAN,
  sex: 'm',
  head: 127,
  chinY: 873,
  hipY: 540,
  kneeY: 290,
  hipJx: 50,
  shJx: 100,
  shJy: 802,
  upperArm: 186,
  foreArm: 150,
  hand: 105,
  foot: 152,
  tA: [
    [465, 86],
    [490, 92],
    [520, 95],
    [550, 95],
    [590, 93],
    [612, 92],
    [650, 95],
    [700, 102],
    [740, 108],
    [775, 112],
    [800, 112],
    [815, 108],
    [828, 96],
    [840, 74],
    [848, 52],
    [856, 32],
  ],
  tF: [
    [465, 52],
    [500, 58],
    [540, 60],
    [580, 60],
    [612, 60],
    [660, 63],
    [700, 68],
    [740, 72],
    [770, 70],
    [800, 60],
    [825, 46],
    [856, 26],
  ],
  tB: [
    [465, 58],
    [492, 66],
    [520, 66],
    [550, 60],
    [590, 54],
    [612, 52],
    [660, 56],
    [700, 62],
    [740, 66],
    [780, 66],
    [810, 60],
    [835, 46],
    [856, 28],
  ],
  tZ: [
    [465, 0],
    [560, 1],
    [612, 3],
    [700, 3],
    [760, 0],
    [820, -7],
    [856, -9],
  ],
  lL: [
    [610, 60],
    [540, 60],
    [500, 56],
    [470, 53],
    [420, 49],
    [360, 42],
    [320, 36],
    [290, 33],
    [265, 33],
    [235, 37],
    [210, 34],
    [175, 28],
    [130, 22],
    [80, 19],
    [52, 18.5],
    [40, 19],
  ],
  lM: [
    [610, 46],
    [540, 47],
    [500, 46],
    [470, 44],
    [420, 41],
    [360, 36],
    [320, 33],
    [290, 32],
    [265, 32],
    [235, 34],
    [205, 36],
    [175, 29],
    [130, 22],
    [80, 19],
    [56, 19.5],
    [40, 18],
  ],
  lF: [
    [610, 55],
    [540, 57],
    [500, 56],
    [470, 54],
    [420, 51],
    [360, 44],
    [320, 38],
    [298, 35],
    [282, 32],
    [255, 29],
    [215, 28],
    [175, 25],
    [130, 21],
    [80, 18],
    [45, 17],
  ],
  lB: [
    [610, 62],
    [540, 60],
    [500, 57],
    [470, 54],
    [420, 49],
    [360, 41],
    [320, 34],
    [290, 30],
    [265, 34],
    [235, 41],
    [210, 40],
    [175, 32],
    [130, 22],
    [80, 18],
    [45, 19],
  ],
  aF: [
    [-30, 23],
    [0, 31],
    [45, 30],
    [90, 28],
    [150, 23],
    [186, 20],
    [218, 24],
    [265, 20],
    [315, 15],
    [336, 13],
  ],
  aB: [
    [-30, 23],
    [0, 33],
    [45, 30],
    [90, 27],
    [150, 23],
    [186, 22],
    [218, 21],
    [265, 18],
    [315, 13],
    [336, 11.5],
  ],
  aL: [
    [-30, 25],
    [0, 34],
    [45, 31],
    [90, 27],
    [150, 22],
    [186, 20.5],
    [218, 25],
    [265, 20],
    [315, 16],
    [336, 15.5],
  ],
  aM: [
    [-30, 18],
    [0, 26],
    [45, 26],
    [90, 25],
    [150, 21],
    [186, 20],
    [218, 21],
    [265, 18],
    [315, 14],
    [336, 13.5],
  ],
  neckR: 28,
  slim: 1,
};

// ---------------------------------------------------------------- pose and skeleton

export type LegPose = {
  /** The ankle joint (model space). */
  ankle: V3;
  /** The foot's direction (deg, about y; 0 = straight forward, + = toward the figure's left). */
  footYaw: number;
  /** Rotation of the foot about its ball (deg: + = heel up, toe-off) or its heel (- = toe up, heel strike). */
  roll?: number;
  /** Where the knee bends toward (default forward and a little out). */
  kneeHint?: V3;
};
export type ArmPose = {
  wrist: V3;
  elbowHint: V3;
  /** The hand's pointing direction (wrist -> fingertips) and the palm's facing (unit-ish vectors, model space). */
  handDir?: V3;
  palm?: V3;
  /** Finger curl (deg) at the knuckles. */
  curl?: number;
  /** The hand is hidden (in a pocket): not drawn. */
  hidden?: boolean;
};
export type Pose = {
  /** The pelvis: its shift (x, y, z) from the default and its rotation (deg). */
  pelvisAt: V3;
  pelvis: {yaw: number; pitch: number; roll: number};
  chest: {yaw: number; pitch: number; roll: number};
  head: {yaw: number; pitch: number; roll: number};
  legs: {L: LegPose; R: LegPose};
  arms: {L: ArmPose; R: ArmPose};
};

export type Skeleton = {
  b: Build;
  pelvis: Frame;
  chest: Frame;
  head: Frame;
  /** The rotation of a torso ring at height y (blended pelvis -> chest), and its centre. */
  ring: (y: number) => Frame;
  hip: {L: V3; R: V3};
  knee: {L: V3; R: V3};
  ankle: {L: V3; R: V3};
  shoulder: {L: V3; R: V3};
  elbow: {L: V3; R: V3};
  wrist: {L: V3; R: V3};
  neckBase: V3;
  pose: Pose;
};

const CHEST_Y = 740;

function lerpRot(a: {yaw: number; pitch: number; roll: number}, b: {yaw: number; pitch: number; roll: number}, k: number): M3 {
  return euler(mix(a.yaw, b.yaw, k), mix(a.pitch, b.pitch, k), mix(a.roll, b.roll, k));
}

export function skeleton(b: Build, pose: Pose): Skeleton {
  const pO: V3 = add([0, b.hipY, 0], pose.pelvisAt);
  const pelvis: Frame = {o: pO, m: euler(pose.pelvis.yaw, pose.pelvis.pitch, pose.pelvis.roll)};
  // the chest sits above the pelvis along the pelvis's up axis, then turns by its own rotation
  const cO = toWorld(pelvis, [0, CHEST_Y - b.hipY, 0]);
  const chest: Frame = {o: cO, m: euler(pose.chest.yaw, pose.chest.pitch, pose.chest.roll)};
  const ring = (y: number): Frame => {
    const w = smooth(575, 720, y);
    const zc = spline(b.tZ, y);
    const pp = toWorld(pelvis, [0, y - b.hipY, zc]);
    const cp = toWorld(chest, [0, y - CHEST_Y, zc]);
    return {o: lerp(pp, cp, w), m: lerpRot(pose.pelvis, pose.chest, w)};
  };
  const hipL = toWorld(pelvis, [b.hipJx, 0, 4]);
  const hipR = toWorld(pelvis, [-b.hipJx, 0, 4]);
  const thigh = b.hipY - b.kneeY;
  const shin = b.kneeY - b.ankleY;
  const kneeOf = (hip: V3, lp: LegPose, side: 1 | -1) => {
    const hint = lp.kneeHint ?? nrm(add(mulMV(rotY(lp.footYaw * 0.6), [0, 0, 1]), [0.12 * side, 0, 0]));
    return ik3(hip, lp.ankle, thigh, shin, hint);
  };
  const kneeL = kneeOf(hipL, pose.legs.L, 1);
  const kneeR = kneeOf(hipR, pose.legs.R, -1);
  const shL = toWorld(chest, [b.shJx, b.shJy - CHEST_Y, -6]);
  const shR = toWorld(chest, [-b.shJx, b.shJy - CHEST_Y, -6]);
  const elL = ik3(shL, pose.arms.L.wrist, b.upperArm, b.foreArm, pose.arms.L.elbowHint);
  const elR = ik3(shR, pose.arms.R.wrist, b.upperArm, b.foreArm, pose.arms.R.elbowHint);
  const neckBase = toWorld(chest, [0, 846 - CHEST_Y, -8]);
  // the head: its "ear point" (the axis of the skull, 0.42 h above the chin) rides the neck
  const earUp = b.chinY + 0.42 * b.head - 846;
  const headO = toWorld(chest, [0, 846 - CHEST_Y + earUp, -4]);
  const head: Frame = {o: headO, m: euler(pose.head.yaw, pose.head.pitch, pose.head.roll)};
  return {
    b,
    pelvis,
    chest,
    head,
    ring,
    hip: {L: hipL, R: hipR},
    knee: {L: kneeL, R: kneeR},
    ankle: {L: pose.legs.L.ankle, R: pose.legs.R.ankle},
    shoulder: {L: shL, R: shR},
    elbow: {L: elL, R: elR},
    wrist: {L: pose.arms.L.wrist, R: pose.arms.R.wrist},
    neckBase,
    pose,
  };
}

// ---------------------------------------------------------------- ring helpers

/** Quadrant radii of a ring in its local frame: front (+z), back (-z), side + (+x), side - (-x); exponents. */
export type Q4 = {f: number; b: number; p: number; m: number; nf?: number; nb?: number};
const sp = (c: number, n: number) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
/** A ring's points: `o` its centre, `ax` the + side axis, `az` the forward axis. */
export function ring4(o: V3, ax: V3, az: V3, q: Q4, cols: number, phase = 0, disp?: (phi: number) => number): V3[] {
  const out: V3[] = [];
  for (let k = 0; k < cols; k++) {
    const phi = phase + (k / cols) * Math.PI * 2;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const n = c >= 0 ? q.nf ?? 2 : q.nb ?? 2;
    const fz = sp(c, n) * (c >= 0 ? q.f : q.b);
    const fx = sp(s, n) * (s >= 0 ? q.p : q.m);
    let p = add(o, add(scl(az, fz), scl(ax, fx)));
    if (disp) {
      const d = disp(phi);
      if (d !== 0) {
        const r = nrm(add(scl(az, fz), scl(ax, fx)));
        p = add(p, scl(r, d));
      }
    }
    out.push(p);
  }
  return out;
}

/** The frame's axes as vectors. */
export const fx = (f: Frame): V3 => [f.m[0][0], f.m[1][0], f.m[2][0]];
export const fy = (f: Frame): V3 => [f.m[0][1], f.m[1][1], f.m[2][1]];
export const fz = (f: Frame): V3 => [f.m[0][2], f.m[1][2], f.m[2][2]];

/** A tube along a chain: rings at arc-length parameter t, the ring axes from a reference "side" vector. */
export function tube(
  chain: V3[],
  rows: number,
  cols: number,
  q: (t: number, d: number) => Q4,
  side: (t: number) => V3,
  opt: {capStart?: boolean; capEnd?: boolean; disp?: (t: number, phi: number) => number} = {},
): {grid: V3[][]; axis: V3[]} {
  const L = chainLength(chain);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    let t = i / (rows - 1);
    // cap rows collapse toward the ends (a rounded tip)
    const {p, d} = chainAt(chain, t);
    const s0 = side(t);
    const ax = nrm(sub(s0, scl(d, dot(s0, d))));
    const az = nrm(cross(ax, d));
    let qq = q(t, t * L);
    let o = p;
    if (opt.capEnd && i === rows - 1) {
      qq = {...qq, f: qq.f * 0.05, b: qq.b * 0.05, p: qq.p * 0.05, m: qq.m * 0.05};
    } else if (opt.capEnd && i === rows - 2) {
      o = add(p, scl(d, -0.0));
      qq = {...qq, f: qq.f * 0.62, b: qq.b * 0.62, p: qq.p * 0.62, m: qq.m * 0.62};
    }
    if (opt.capStart && i === 0) qq = {...qq, f: qq.f * 0.05, b: qq.b * 0.05, p: qq.p * 0.05, m: qq.m * 0.05};
    else if (opt.capStart && i === 1) qq = {...qq, f: qq.f * 0.62, b: qq.b * 0.62, p: qq.p * 0.62, m: qq.m * 0.62};
    const tt = t;
    grid.push(ring4(o, ax, az, qq, cols, 0, opt.disp ? (phi) => opt.disp!(tt, phi) : undefined));
    axis.push(o);
    t = tt;
  }
  return {grid, axis};
}

export const rowsFor = (n: number, res: number, min = 4) => Math.max(min, Math.round(n * res));

// ---------------------------------------------------------------- the skin surfaces

export type BodyOpts = {
  res: number;
  /** Which skin parts to build (garments hide the rest). */
  parts: {torso?: boolean; neck?: boolean; legs?: 'full' | 'below' | false; legFrom?: number; arms?: 'full' | 'forearm' | false; armFrom?: number; hands?: boolean; feet?: boolean};
};

export function torsoSurface(sk: Skeleton, res: number, key = 'torso', mat = 'skin', y0 = 468, y1?: number, inflate?: (y: number, phi: number) => number): Surface {
  const b = sk.b;
  const top = y1 ?? (b.sex === 'f' ? 852 : 856);
  const rows = rowsFor(40, res, 10);
  const cols = rowsFor(48, res, 16);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const y = mix(y0, top, i / (rows - 1));
    const f = sk.ring(y);
    const a = spline(b.tA, y) * b.slim;
    const q: Q4 = {f: spline(b.tF, y), b: spline(b.tB, y), p: a, m: a, nf: 2.25, nb: y > 690 ? 2.7 : 2.35};
    grid.push(ring4(f.o, fx(f), fz(f), q, cols, 0, inflate ? (phi) => inflate(y, phi) : undefined));
    axis.push(f.o);
  }
  return {key, mat, grid, axis, wrap: true, look: {glow: mat === 'skin'}};
}

export function neckSurface(sk: Skeleton, res: number): Surface {
  const b = sk.b;
  const top = toWorld(sk.head, [0, -0.2 * b.head, -0.1 * b.head]);
  const base = sub(sk.neckBase, [0, 14, 0]);
  const chain = [base, lerp(base, top, 0.5), top];
  const r = b.neckR;
  const t = tube(
    chain,
    rowsFor(10, res, 5),
    rowsFor(24, res, 12),
    (tt) => ({f: r * (1.02 + 0.06 * (1 - tt)), b: r * (1.06 + 0.18 * (1 - tt)), p: r * (1 + 0.25 * (1 - tt) * (1 - tt)), m: r * (1 + 0.25 * (1 - tt) * (1 - tt))}),
    () => fx(sk.chest),
  );
  return {key: 'neck', mat: 'skin', grid: t.grid, axis: t.axis, wrap: true, bias: -30, look: {glow: true}};
}

// ---- the head: rings from under the chin to the crown, a designed face profile, sockets and cheekbones

export type FaceShape = {
  /** Nose tip forward of the face front (units of h), its lift; lips' fullness; jaw width; chin. */
  nose: number;
  lips: number;
  jaw: number;
  chin: number;
  /** Cheekbones' prominence. */
  cheek: number;
  /** Brow ridge. */
  brow: number;
};
export const FACE_F: FaceShape = {nose: 0.085, lips: 1, jaw: 0.92, chin: 1, cheek: 1, brow: 0.8};
export const FACE_M: FaceShape = {nose: 0.1, lips: 0.85, jaw: 1.08, chin: 1.15, cheek: 0.9, brow: 1.2};

// u = 0 at the chin's underside, 1 at the crown (units of h; z forward of the skull's axis, h = 1)
const HZF: K = [
  [0.0, 0.25],
  [0.03, 0.33],
  [0.08, 0.345],
  [0.16, 0.335],
  [0.25, 0.335],
  [0.35, 0.34],
  [0.45, 0.35],
  [0.52, 0.37],
  [0.57, 0.392],
  [0.63, 0.392],
  [0.72, 0.37],
  [0.8, 0.325],
  [0.87, 0.26],
  [0.93, 0.18],
  [0.97, 0.1],
  [1.0, 0.0],
];
const HZB: K = [
  [0.0, -0.18],
  [0.05, -0.1],
  [0.1, -0.06],
  [0.15, -0.14],
  [0.2, -0.27],
  [0.26, -0.36],
  [0.34, -0.43],
  [0.44, -0.475],
  [0.56, -0.49],
  [0.68, -0.465],
  [0.8, -0.39],
  [0.9, -0.27],
  [0.96, -0.15],
  [1.0, 0.0],
];
const HA: K = [
  [0.0, 0.06],
  [0.03, 0.12],
  [0.08, 0.2],
  [0.14, 0.27],
  [0.2, 0.3],
  [0.3, 0.325],
  [0.42, 0.345],
  [0.55, 0.36],
  [0.68, 0.362],
  [0.8, 0.335],
  [0.9, 0.27],
  [0.96, 0.17],
  [1.0, 0.0],
];
const HNF: K = [
  [0.0, 1.5],
  [0.08, 1.45],
  [0.16, 1.6],
  [0.3, 2.1],
  [0.45, 2.35],
  [0.6, 2.3],
  [0.8, 2.2],
  [1.0, 2.0],
];

/** The head's local point at (u, phi), h = 1 (x right, y up from the ear point at u = 0.42, z forward). */
export function headPoint(u: number, phi: number, fs: FaceShape): V3 {
  const a = spline(HA, u) * (u < 0.3 ? mix(fs.jaw, 1, smooth(0.1, 0.3, u)) : 1);
  const zf = spline(HZF, u);
  const zb = spline(HZB, u);
  const nf = spline(HNF, u);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const n = c >= 0 ? nf : 2.15;
  const z0 = sp(c, n) * (c >= 0 ? zf : -zb);
  const x0 = sp(s, n) * a;
  // the mid-line features: a narrow window around the front (phi = 0)
  const ang = Math.atan2(s, c); // -pi..pi, 0 = front
  const w = (sig: number) => Math.exp(-(ang * ang) / (2 * sig * sig));
  let d = 0;
  // the nose: a ridge from the root (u 0.5) to the tip (u 0.31), its underside back to the lip (u 0.25)
  const noseAmp = fs.nose / 0.085;
  const ridge = u > 0.31 ? 0.135 * mix(1, 0.1, smooth(0.31, 0.5, u)) : 0.135 * smooth(0.235, 0.31, u) * (0.75 + 0.25 * smooth(0.27, 0.31, u));
  d += ridge * noseAmp * w(u > 0.33 ? 0.11 : 0.16) * (u > 0.22 && u < 0.53 ? 1 : 0);
  // lips: the upper (u 0.205) and the lower (u 0.15), the mouth line between them a little in
  d += fs.lips * (0.04 * bump(u, 0.205, 0.022) + 0.035 * bump(u, 0.15, 0.02) - 0.008 * bump(u, 0.178, 0.008)) * w(0.3);
  // the chin's button
  d += fs.chin * 0.028 * bump(u, 0.06, 0.035) * w(0.36);
  // the brow ridge
  d += fs.brow * 0.014 * bump(u, 0.56, 0.035) * w(0.6);
  // the eye sockets: a soft dip either side of the nose's root
  const sock = (sg: number) => Math.exp(-((ang - sg * 0.52) ** 2) / (2 * 0.2 * 0.2));
  d -= 0.034 * bump(u, 0.495, 0.045) * (sock(1) + sock(-1));
  // the cheekbones
  const chk = (sg: number) => Math.exp(-((ang - sg * 0.98) ** 2) / (2 * 0.28 * 0.28));
  d += fs.cheek * 0.02 * bump(u, 0.41, 0.06) * (chk(1) + chk(-1));
  // displace along the ring's outward direction
  const l = Math.hypot(x0, z0) || 1;
  const x = x0 + (x0 / l) * d;
  const z = z0 + (z0 / l) * d;
  return [x, u - 0.42, z];
}

export function headSurface(sk: Skeleton, res: number, fs: FaceShape): Surface {
  const h = sk.b.head;
  const rows = rowsFor(54, res, 14);
  const cols = rowsFor(72, res, 20);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    // denser rows around the face's features (u 0.1-0.6)
    const t = i / (rows - 1);
    const u = t;
    const row: V3[] = [];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      const p = headPoint(u, phi, fs);
      row.push(toWorld(sk.head, scl(p, h)));
    }
    grid.push(row);
    axis.push(toWorld(sk.head, [0, (u - 0.42) * h, 0]));
  }
  return {key: 'head', mat: 'skin', grid, axis, wrap: true, look: {glow: true, hi: 0.9}};
}

/** Head-local point (units of h) to model space. */
export const headAt = (sk: Skeleton, p: V3): V3 => toWorld(sk.head, scl(p, sk.b.head));

/** The ear (for short hair): a small flattened form on the skull's side. */
export function earSurface(sk: Skeleton, side: 1 | -1, res: number): Surface {
  const h = sk.b.head;
  const c = headAt(sk, [side * 0.335, 0.0, -0.06]);
  const up = nrm(sub(headAt(sk, [side * 0.33, 0.1, -0.1]), headAt(sk, [side * 0.33, -0.1, -0.06])));
  const out = nrm(sub(c, headAt(sk, [0, 0, -0.06])));
  const rows = rowsFor(10, res, 5);
  const cols = rowsFor(16, res, 8);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const y = (t - 0.5) * 0.27 * h;
    const w = Math.sin(Math.PI * clamp(t * 1.02, 0, 1)) * (0.06 + 0.02 * t) * h;
    const o = add(c, scl(up, y));
    const fwd = nrm(cross(up, out));
    const row: V3[] = [];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      row.push(add(o, add(scl(fwd, Math.cos(phi) * w), scl(out, (Math.sin(phi) * 0.5 + 0.4) * 0.05 * h))));
    }
    grid.push(row);
    axis.push(add(o, scl(out, 0.02 * h)));
  }
  return {key: `ear${side > 0 ? 'L' : 'R'}`, mat: 'skin', grid, axis, wrap: true, bias: 4, look: {glow: true}};
}

// ---- legs

/** One leg from above the hip joint to the ankle. `from` (a straight-leg height) starts it lower (under a skirt). */
export function legSurface(sk: Skeleton, side: 'L' | 'R', res: number, from = 610, mat = 'skin', key?: string): Surface {
  const b = sk.b;
  const s = side === 'L' ? 1 : -1;
  const hip = sk.hip[side];
  const knee = sk.knee[side];
  const ankle = sk.ankle[side];
  const up = nrm(sub(hip, knee));
  const ext = add(hip, scl(up, 610 - b.hipY));
  const full = [ext, hip, knee, add(ankle, [0, -6, 0])];
  // the leg's straight-length coordinate: 0 at the ankle - 6, up to 610 at the extension's top
  const L = chainLength(full);
  const total = 610 - (b.ankleY - 6);
  const t0 = clamp((610 - from) / total, 0, 0.95);
  const rows = rowsFor(Math.round(44 * (1 - t0)) + 6, res, 8);
  const cols = rowsFor(28, res, 12);
  const lp = sk.pose.legs[side];
  const footDir = mulMV(rotY(lp.footYaw), [0, 0, 1]);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const t = mix(t0, 1, i / (rows - 1));
    const {p, d} = chainAt(full, t);
    // the straight-leg height at this point (for the radius profiles)
    const yS = 610 - t * total;
    // lateral axis: model x (outward), turned with the foot below the knee
    const tw = smooth(0.45, 0.9, t);
    const lat = mulMV(rotY(lp.footYaw * tw), [s, 0, 0]);
    const ax = nrm(sub(lat, scl(d, dot(lat, d))));
    let azF = nrm(cross(d, ax));
    const fwd = nrm(lerp([0, 0, 1], footDir, tw));
    if (dot(azF, fwd) < 0) azF = scl(azF, -1);
    const q: Q4 = {f: spline(b.lF, yS), b: spline(b.lB, yS), p: spline(b.lL, yS), m: spline(b.lM, yS), nf: 2.1, nb: 2.1};
    // + side of ring4 is ax (outward) -> lateral radius on +, medial on -
    grid.push(ring4(p, ax, azF, q, cols));
    axis.push(p);
  }
  void L;
  return {key: key ?? `leg${side}`, mat, grid, axis, wrap: true, look: {glow: mat === 'skin'}};
}

// ---- arms and hands

export function armSurface(sk: Skeleton, side: 'L' | 'R', res: number, from = -30, to?: number, mat = 'skin', key?: string, scale = 1): Surface {
  const b = sk.b;
  const s = side === 'L' ? 1 : -1;
  const sh = sk.shoulder[side];
  const el = sk.elbow[side];
  const wr = sk.wrist[side];
  const upv = nrm(sub(sh, el));
  const ext = add(sh, scl(upv, 30));
  const chain = [ext, sh, el, wr];
  const L = chainLength(chain);
  const len0 = b.upperArm + b.foreArm + 30;
  const tA = clamp((from + 30) / len0, 0, 0.98);
  const tB = to === undefined ? 1 : clamp((to + 30) / len0, tA + 0.02, 1);
  const rows = rowsFor(Math.round(36 * (tB - tA)) + 6, res, 6);
  const cols = rowsFor(24, res, 10);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const ap = sk.pose.arms[side];
  // the forearm's twist: at the wrist the + (wide) axis points to the thumb: thumb = s * (palm x hand direction)
  const palm = ap.palm ? nrm(ap.palm) : ([-s, 0, 0] as V3);
  for (let i = 0; i < rows; i++) {
    const t = mix(tA, tB, i / (rows - 1));
    const {p, d} = chainAt(chain, t);
    const dist = t * L - 30;
    const tw = smooth(b.upperArm * 0.7, b.upperArm + b.foreArm, dist);
    const lat0: V3 = [s, 0, 0];
    const thumb = nrm(scl(cross(palm, d), s));
    const lat = nrm(lerp(lat0, thumb, tw));
    const ax = nrm(sub(lat, scl(d, dot(lat, d))));
    let az = nrm(cross(d, ax));
    // the arm's front (biceps; at the wrist the back of the hand) faces away from the palm
    const back = nrm(lerp([0, 0, 1], scl(palm, -1), tw));
    if (dot(az, back) < 0) az = scl(az, -1);
    const k = scale;
    const q: Q4 = {f: spline(b.aF, dist) * k, b: spline(b.aB, dist) * k, p: spline(b.aL, dist) * k, m: spline(b.aM, dist) * k, nf: 2.05, nb: 2.05};
    grid.push(ring4(p, ax, az, q, cols));
    axis.push(p);
  }
  return {key: key ?? `arm${side}`, mat, grid, axis, wrap: true, look: {glow: mat === 'skin'}};
}

/** The hand: a mitten (palm and joined fingers) with a thumb lobe, real size (0.098 H woman, 0.105 man). */
export function handSurfaces(sk: Skeleton, side: 'L' | 'R', res: number, mat = 'skin'): Surface[] {
  const b = sk.b;
  const s = side === 'L' ? 1 : -1;
  const ap = sk.pose.arms[side];
  if (ap.hidden) return [];
  const wr = sk.wrist[side];
  const fore = nrm(sub(wr, sk.elbow[side]));
  const dir = nrm(ap.handDir ?? add(fore, [0, -0.15, 0]));
  const palm = nrm(ap.palm ?? ([-s, 0, 0] as V3));
  const curl = ap.curl ?? 24;
  const hl = b.hand;
  const kn = add(wr, scl(dir, hl * 0.52));
  // the fingers curl toward the palm: two joints share the curl
  const bend = (v: V3, a: number): V3 => nrm(add(scl(v, Math.cos(a * D2R)), scl(palm, Math.sin(a * D2R))));
  const f1 = bend(dir, curl * 0.45);
  const mid = add(kn, scl(f1, hl * 0.25));
  const f2 = bend(dir, curl * 1.15);
  const tip = add(mid, scl(f2, hl * 0.22));
  const chain = [sub(wr, scl(dir, 6)), kn, mid, tip];
  const width = b.sex === 'f' ? 22 : 25;
  const thick = b.sex === 'f' ? 10.5 : 12;
  // the thumb's side: s * (palm x direction) (the left hand, palm in, fingers down: the thumb points forward)
  const tS = nrm(scl(cross(palm, dir), s));
  const rows = rowsFor(16, res, 6);
  const cols = rowsFor(18, res, 8);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const L = chainLength(chain);
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const {p, d} = chainAt(chain, t);
    const x = t * L;
    const w = spline(
      [
        [0, 0.62],
        [0.22, 0.92],
        [0.5, 1.0],
        [0.62, 0.94],
        [0.8, 0.8],
        [0.93, 0.56],
        [1, 0.1],
      ],
      x / L,
    );
    const th = spline(
      [
        [0, 1.0],
        [0.3, 1.05],
        [0.5, 0.9],
        [0.8, 0.75],
        [0.95, 0.5],
        [1, 0.1],
      ],
      x / L,
    );
    const ax = nrm(sub(tS, scl(d, dot(tS, d))));
    const az = nrm(cross(ax, d));
    // +z of the ring: the back of the hand (straight), -z: the palm (curved)
    const azB = dot(az, palm) > 0 ? scl(az, -1) : az;
    const q: Q4 = {f: thick * th * 0.95, b: thick * th * 1.1, p: width * w * 1.04, m: width * w * 0.96, nf: 2.6, nb: 2.0};
    grid.push(ring4(p, ax, azB, q, cols));
    axis.push(p);
  }
  // the thumb: from the palm's thumb side near the wrist, angled forward along the fingers
  const tb = add(add(wr, scl(dir, hl * 0.16)), add(scl(tS, width * 0.62), scl(palm, thick * 0.45)));
  const tdir = nrm(add(add(scl(dir, 0.82), scl(tS, 0.32)), scl(palm, 0.42)));
  const tmid = add(tb, scl(tdir, hl * 0.27));
  const ttip = add(tmid, scl(nrm(lerp(tdir, palm, 0.35)), hl * 0.2));
  const th = tube(
    [tb, tmid, ttip],
    rowsFor(10, res, 5),
    rowsFor(12, res, 8),
    (t) => {
      const r = spline(
        [
          [0, 11],
          [0.4, 9],
          [0.8, 7.2],
          [1, 5.5],
        ],
        t,
      ) * (b.sex === 'f' ? 1 : 1.1);
      return {f: r, b: r, p: r, m: r};
    },
    () => palm,
    {capEnd: true},
  );
  return [
    {key: `hand${side}`, mat, grid, axis, wrap: true, bias: 6, look: {glow: true}},
    {key: `thumb${side}`, mat, grid: th.grid, axis: th.axis, wrap: true, bias: 7, look: {glow: true}},
  ];
}

// ---- feet (the bare foot, under open shoes)

export function footChain(sk: Skeleton, side: 'L' | 'R', footLen: number): {heel: V3; ball: V3; toe: V3; dir: V3; up: V3} {
  const lp = sk.pose.legs[side];
  const a = sk.ankle[side];
  const dir0 = mulMV(rotY(lp.footYaw), [0, 0, 1]);
  const roll = lp.roll ?? 0;
  // the foot at rest: the heel 0.18 behind the ankle, the ball 0.72 ahead of the heel, the sole on y = 0
  const heelR: V3 = add([a[0], 0, a[2]], scl(dir0, -footLen * 0.2));
  const ballR = add(heelR, scl(dir0, footLen * 0.73));
  const toeR = add(heelR, scl(dir0, footLen));
  if (roll === 0) return {heel: heelR, ball: ballR, toe: toeR, dir: dir0, up: [0, 1, 0]};
  // rotate the foot about the ball (heel up, roll > 0) or the heel (toe up, roll < 0) in its sagittal plane
  const side_ = nrm(cross([0, 1, 0], dir0));
  const rot = (p: V3, c: V3, ang: number): V3 => {
    const v = sub(p, c);
    const ca = Math.cos(ang * D2R);
    const sa = Math.sin(ang * D2R);
    const k = side_;
    return add(c, add(add(scl(v, ca), scl(cross(k, v), sa)), scl(k, dot(k, v) * (1 - ca))));
  };
  if (roll > 0) {
    return {heel: rot(heelR, ballR, roll), ball: ballR, toe: rot(toeR, ballR, Math.min(roll, 8)), dir: nrm(sub(ballR, rot(heelR, ballR, roll))), up: rot([0, 1, 0], [0, 0, 0], roll)};
  }
  return {heel: heelR, ball: rot(ballR, heelR, roll), toe: rot(toeR, heelR, roll), dir: nrm(sub(rot(ballR, heelR, roll), heelR)), up: rot([0, 1, 0], [0, 0, 0], roll)};
}
