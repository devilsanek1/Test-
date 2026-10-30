// people_dirs/painterly: the cast (dir_painterly.md "The cast"). HER, the film's lead (~27): her accent is the film's
// teal, worn once per outfit (the satin skirt in the evening, the cap at the weekend); everything else is a tonal base.
// Two supporting people with different looks and ethnicities from her. Garment types only (fashion.md §4); no artist's
// characters. Each person has a pose per view (the front 3/4 stands, the profile walks, the back stands and turns).
import {type FaceShape, type Pose, type Skeleton, FACE_F, FACE_M, MAN, WOMAN} from './body';
import {type Person, type Piece, type Part} from './figure';
import {footSurface, shoeSurfaces, skirtSurface, sleeveSurface, sockSurface, torsoGarment, trouserSurfaces} from './garments';
import {hairOf, type HairSpec} from './hair';
import {faceMarks, type FaceMarks} from './face';
import {bagSurfaces, capSurfaces, cupSurfaces, sunglassesMarks} from './props';
import {smooth, mix} from './math';

const hairPiece = (hs: HairSpec): Piece => ({build: (sk, res) => hairOf(sk, hs, res)});
const marks =
  (fm: FaceMarks, extra?: (sk: Skeleton, fs: FaceShape) => Part) =>
  (sk: Skeleton, res: number, fs: FaceShape): Part => {
    const a = faceMarks(sk, fm, res, fs);
    if (!extra) return a;
    const b = extra(sk, fs);
    return {surfaces: [...a.surfaces, ...b.surfaces], decals: [...(a.decals ?? []), ...(b.decals ?? [])]};
  };
const feet = (style: 'flat' | 'sneaker' | 'loafer', mat: string, opt: {bare?: boolean; sole?: string; socks?: {mat: string; top: number}} = {}): Piece => ({
  build: (sk, res) => ({
    surfaces: [
      ...(opt.bare ? [footSurface(sk, 'L', res), footSurface(sk, 'R', res)] : []),
      ...(opt.socks ? [sockSurface(sk, 'L', opt.socks.mat, opt.socks.top, res), sockSurface(sk, 'R', opt.socks.mat, opt.socks.top, res)] : []),
      ...shoeSurfaces(sk, 'L', {key: 'shoe', mat, style, sole: opt.sole}, res),
      ...shoeSurfaces(sk, 'R', {key: 'shoe', mat, style, sole: opt.sole}, res),
    ],
  }),
});

// ---------------------------------------------------------------- HER: the autumn city evening

/** A cropped leather jacket worn open over a cream top, a teal satin slip skirt (the accent), pointed flats, a slouchy
 *  burgundy bag under the arm; long auburn hair with curtain bangs and bouncy ends (the flowing element). */
export const HER_EVENING: Person = {
  name: 'her-evening',
  build: WOMAN,
  face: FACE_F,
  skin: '#E0B196',
  mats: {
    hair: {base: '#8C4C33', kind: 'hair'},
    top: {base: '#EFE5D8', kind: 'cloth'},
    skirt: {base: '#0B8577', kind: 'satin'},
    jacket: {base: '#2E2426', kind: 'leather'},
    shoe: {base: '#2B2224', kind: 'leather'},
    bag: {base: '#6E2E33', kind: 'leather'},
    strap: {base: '#4E2026', kind: 'leather'},
  },
  pieces: [
    {
      hides: {torso: true},
      build: (sk, res) => ({
        surfaces: [torsoGarment(sk, {key: 'top', mat: 'top', hem: 610, ease: 3, neck: {dip: 30, width: 0.9}, n: {front: 2.2, back: 2.4}, bias: 4, look: {blur: 6}}, res)],
      }),
    },
    {
      hides: {legsFrom: 330},
      build: (sk, res) => ({
        surfaces: [skirtSurface(sk, {key: 'skirt', mat: 'skirt', waist: 648, hem: 208, ease: 5, hemHalf: 122, folds: {n: 5, amp: 6, seed: 1.1}, look: {hi: 0.975, blur: 8}, bias: 12}, res)],
      }),
    },
    {
      hides: {armsTo: 318},
      build: (sk, res) => ({
        surfaces: [
          torsoGarment(
            sk,
            {
              key: 'jacket',
              mat: 'jacket',
              hem: 606,
              top: 866,
              ease: (y) => 10 + 5 * smooth(700, 620, y),
              hang: {from: 752, k: 1.0},
              drop: 12,
              n: {front: 2.5, back: 2.9},
              open: (y) => 0.34 + 0.2 * smooth(830, 640, y),
              look: {spec: {p: 22, t: 0.42}, blur: 5},
              bias: 30,
              covers: ['top', 'torso', 'neck', 'skirt'],
            },
            res,
          ),
          sleeveSurface(sk, 'L', {key: 'sleeve', mat: 'jacket', to: 318, ease: (d) => 8 + 4 * smooth(150, 300, d), look: {spec: {p: 22, t: 0.42}, blur: 5}, bias: 31}, res),
          sleeveSurface(sk, 'R', {key: 'sleeve', mat: 'jacket', to: 318, ease: (d) => 8 + 4 * smooth(150, 300, d), look: {spec: {p: 22, t: 0.42}, blur: 5}, bias: 31}, res),
        ],
      }),
    },
    feet('flat', 'shoe', {bare: true}),
    {build: (sk, res) => bagSurfaces(sk, 'L', {mat: 'bag', strap: 'strap', ease: 13, at: [124, 22, -26], size: 0.85}, res)},
    hairPiece({kind: 'long', endBack: 676, endFront: 770, vol: 0.06, part: 0.32, bangs: 0.7, curtain: {halfW: [54, 64], back: [42, 44], zOff: 34}}),
  ],
  faceMarks: marks({brows: '#5E3426', lash: '#3B231D', lips: '#B9746A', lidsDown: true}),
};

// ---------------------------------------------------------------- HER: the casual weekend

/** An oversized cloud-white shirt, half-tucked, sleeves pushed up; relaxed straight jeans; slim cream sneakers; the
 *  teal cap (the accent) with her ponytail through its back; an iced coffee in one hand, the other in a pocket. */
export const HER_WEEKEND: Person = {
  name: 'her-weekend',
  build: WOMAN,
  face: FACE_F,
  skin: '#E0B196',
  mats: {
    hair: {base: '#8C4C33', kind: 'hair'},
    tie: {base: '#3A2522', kind: 'cloth'},
    shirt: {base: '#F0EAE1', kind: 'cloth'},
    jeans: {base: '#476E8E', kind: 'denim'},
    shoe: {base: '#ECE3D6', kind: 'cloth'},
    sole: {base: '#F5F0E8', kind: 'cloth'},
    cap: {base: '#0B8577', kind: 'cloth'},
    cup: {base: '#8E5E40', kind: 'glass'},
    cupTop: {base: '#D8C3A8', kind: 'glass'},
    lid: {base: '#EEE9E2', kind: 'glass'},
  },
  pieces: [
    {
      hides: {torso: true, armsTo: 236},
      build: (sk, res) => ({
        surfaces: [
          torsoGarment(
            sk,
            {
              key: 'shirt',
              mat: 'shirt',
              // the half tuck: tucked at the front, the back hem loose and longer
              hem: (phi) => mix(596, 462, smooth(0.5, 2.3, Math.abs(Math.atan2(Math.sin(phi), Math.cos(phi))))),
              ease: (y) => 7 + 8 * smooth(760, 640, y) - 6 * smooth(640, 600, y),
              hang: {from: 760, k: 1.0},
              drop: 14,
              n: {front: 2.3, back: 2.6},
              neck: {dip: 44, width: 0.5},
              folds: {n: 5, amp: 5, from: 700, seed: 2.2},
              look: {blur: 7},
              bias: 14,
              covers: ['torso', 'neck', 'jeans'],
            },
            res,
          ),
          sleeveSurface(sk, 'L', {key: 'shSleeve', mat: 'shirt', to: 236, ease: (d) => 5 + 7 * smooth(30, 120, d), bunch: 3, look: {blur: 6}, bias: 15}, res),
          sleeveSurface(sk, 'R', {key: 'shSleeve', mat: 'shirt', to: 236, ease: (d) => 5 + 7 * smooth(30, 120, d), bunch: 3, look: {blur: 6}, bias: 15}, res),
        ],
      }),
    },
    {
      hides: {legs: true},
      build: (sk, res) => ({
        surfaces: trouserSurfaces(sk, {key: 'jeans', mat: 'jeans', waist: 600, hem: 26, ease: 5, legHalf: 44, cut: 'straight', stack: 4, look: {blur: 6}, bias: 6}, res),
      }),
    },
    feet('sneaker', 'shoe', {sole: 'sole'}),
    {build: (sk, res) => capSurfaces(sk, {mat: 'cap'}, res)},
    hairPiece({kind: 'pony', length: 240}),
    {build: (sk, res) => cupSurfaces(sk, 'L', res)},
  ],
  faceMarks: marks({brows: '#5E3426', lash: '#3B231D', lips: '#B9746A', lidsDown: true}),
};

// ---------------------------------------------------------------- the man: suede and white socks

/** A boxy caramel suede chore jacket, open, over a cream tee; relaxed navy trousers cropped to show white crew socks;
 *  dark loafers; curls on a low taper. Deep brown skin with a soft sheen on the key side. */
export const MAN_SUEDE: Person = {
  name: 'man',
  build: MAN,
  face: FACE_M,
  skin: '#8B5A42',
  mats: {
    hair: {base: '#2B2324', kind: 'hair'},
    taper: {base: '#3E302D', kind: 'hair'},
    tee: {base: '#E9DBCA', kind: 'cloth'},
    jacket: {base: '#B58058', kind: 'suede'},
    trousers: {base: '#254161', kind: 'cloth'},
    sock: {base: '#F0EAE1', kind: 'cloth'},
    shoe: {base: '#3D2C2D', kind: 'leather'},
  },
  pieces: [
    {
      hides: {torso: true},
      build: (sk, res) => ({
        surfaces: [torsoGarment(sk, {key: 'tee', mat: 'tee', hem: 520, ease: 6, neck: {dip: 22, width: 0.9}, n: {front: 2.3, back: 2.5}, bias: 4, look: {blur: 6}}, res)],
      }),
    },
    {
      hides: {legs: true},
      build: (sk, res) => ({
        surfaces: trouserSurfaces(sk, {key: 'trousers', mat: 'trousers', waist: 590, hem: 74, ease: 8, legHalf: 50, cut: 'straight', look: {blur: 6}, bias: 6, covers: ['leg', 'torso', 'tee']}, res),
      }),
    },
    {
      hides: {armsTo: 322},
      build: (sk, res) => ({
        surfaces: [
          torsoGarment(
            sk,
            {
              key: 'jacket',
              mat: 'jacket',
              hem: 488,
              top: 858,
              ease: (y) => 16 + 8 * smooth(740, 600, y),
              hang: {from: 742, k: 1.0},
              drop: 18,
              n: {front: 2.6, back: 3.0},
              open: (y) => 0.3 + 0.16 * smooth(830, 600, y),
              folds: {n: 4, amp: 4, from: 640, seed: 0.6},
              look: {blur: 6, hi: 0.86},
              bias: 30,
              covers: ['tee', 'torso', 'neck', 'trousersSeat'],
            },
            res,
          ),
          sleeveSurface(sk, 'L', {key: 'sleeve', mat: 'jacket', to: 322, ease: (d) => 7 + 8 * smooth(30, 150, d), look: {blur: 6, hi: 0.86}, bias: 31}, res),
          sleeveSurface(sk, 'R', {key: 'sleeve', mat: 'jacket', to: 322, ease: (d) => 7 + 8 * smooth(30, 150, d), look: {blur: 6, hi: 0.86}, bias: 31}, res),
        ],
      }),
    },
    feet('loafer', 'shoe', {socks: {mat: 'sock', top: 82}}),
    hairPiece({kind: 'crop', top: 0.17, seed: 2.4, curls: true}),
  ],
  faceMarks: marks({brows: '#2B2120', lash: '#2B2120', lips: '#7A4535', lidsDown: false, sheen: '#A5836A', sockets: 0.35}),
};

// ---------------------------------------------------------------- the woman: the long open coat

/** A long chocolate wool coat, open and unbelted, over a dark column (a fine near-black knit and wide trousers in one
 *  tone); near-black loafers; oversized sunglasses; a textured espresso bob. Medium golden skin. */
export const WOMAN_COAT: Person = {
  name: 'woman',
  build: {...WOMAN, slim: 0.97},
  face: {...FACE_F, nose: 0.078, cheek: 1.15, jaw: 0.95},
  skin: '#C79671',
  mats: {
    hair: {base: '#3A2B27', kind: 'hair'},
    knit: {base: '#2E2426', kind: 'cloth'},
    trousers: {base: '#2E2426', kind: 'cloth'},
    coat: {base: '#664334', kind: 'cloth'},
    shoe: {base: '#2A2123', kind: 'leather'},
  },
  pieces: [
    {
      hides: {torso: true},
      build: (sk, res) => ({
        surfaces: [torsoGarment(sk, {key: 'knit', mat: 'knit', hem: 590, ease: 4, neck: {dip: 18, width: 0.9}, n: {front: 2.2, back: 2.4}, bias: 4, look: {blur: 6}}, res)],
      }),
    },
    {
      hides: {legs: true},
      build: (sk, res) => ({
        surfaces: trouserSurfaces(sk, {key: 'trousers', mat: 'trousers', waist: 612, hem: 10, ease: 9, legHalf: 64, cut: 'wide', look: {blur: 6}, bias: 6, covers: ['leg', 'torso', 'knit']}, res),
      }),
    },
    {
      hides: {armsTo: 326},
      build: (sk, res) => ({
        surfaces: [
          torsoGarment(
            sk,
            {
              key: 'coat',
              mat: 'coat',
              hem: 190,
              top: 858,
              ease: (y) => 14 + 6 * smooth(760, 560, y),
              hang: {from: 748, k: 1.02},
              drop: 18,
              wrapLegs: true,
              n: {front: 2.4, back: 2.8},
              open: (y) => 0.3 + 0.12 * smooth(800, 600, y) + 0.04 * smooth(600, 250, y),
              folds: {n: 4, amp: 7, from: 520, seed: 1.7},
              look: {blur: 7},
              bias: 30,
              covers: ['knit', 'torso', 'neck', 'trousers'],
            },
            res,
          ),
          sleeveSurface(sk, 'L', {key: 'sleeve', mat: 'coat', to: 326, ease: (d) => 7 + 10 * smooth(30, 160, d), look: {blur: 7}, bias: 31}, res),
          sleeveSurface(sk, 'R', {key: 'sleeve', mat: 'coat', to: 326, ease: (d) => 7 + 10 * smooth(30, 160, d), look: {blur: 7}, bias: 31}, res),
        ],
      }),
    },
    feet('loafer', 'shoe'),
    hairPiece({
      kind: 'long',
      endBack: 868,
      endFront: 872,
      vol: 0.045,
      part: -0.45,
      bangs: 0.15,
      curtain: {halfW: [52, 56], back: [44, 42], front: 30, zOff: 24, ramp: 36, lobes: 4.2, lobeAmp: 7, flip: 3, window: 1.12},
    }),
  ],
  faceMarks: marks({brows: '#2E2220', lips: '#A3624F', noEyes: true, sockets: 0.2}, (sk, fs) => sunglassesMarks(sk, fs, {color: '#221A1B', glint: '#C9B8C6'})),
};

// ---------------------------------------------------------------- the poses

/** Contrapposto: the weight on the right leg (its hip up, the shoulders the other way), the left foot forward and out. */
const standR = (arms: Pose['arms'], head: Pose['head'] = {yaw: 10, pitch: 7, roll: -4}): Pose => ({
  pelvisAt: [-10, -3, 0],
  pelvis: {yaw: -4, pitch: 3, roll: -6},
  chest: {yaw: 6, pitch: -3, roll: 3},
  head,
  legs: {
    R: {ankle: [-34, 42, -2], footYaw: -14},
    L: {ankle: [50, 42, 46], footYaw: 26},
  },
  arms,
});
/** The cool walk: a short stride, the left foot forward at the heel strike, a little lean. */
const walk = (arms: Pose['arms'], head: Pose['head'] = {yaw: 0, pitch: 3, roll: 0}): Pose => ({
  pelvisAt: [0, -12, 0],
  pelvis: {yaw: -7, pitch: 2, roll: 2},
  chest: {yaw: 6, pitch: -2, roll: -1},
  head,
  legs: {
    L: {ankle: [44, 46, 118], footYaw: 3, roll: -12},
    R: {ankle: [-40, 74, -128], footYaw: -3, roll: 34},
  },
  arms,
});
/** From behind: the weight on the left leg, the head turned to her left (the lost profile toward the key). */
const standL = (arms: Pose['arms'], head: Pose['head'] = {yaw: 38, pitch: 4, roll: 3}): Pose => ({
  pelvisAt: [10, -3, 0],
  pelvis: {yaw: 3, pitch: 3, roll: 6},
  chest: {yaw: -5, pitch: -3, roll: -3},
  head,
  legs: {
    L: {ankle: [34, 42, -2], footYaw: 14},
    R: {ankle: [-50, 42, 40], footYaw: -24},
  },
  arms,
});

type Arm = Pose['arms']['L'];
const RELAX_R: Arm = {wrist: [-138, 488, 34], elbowHint: [-0.4, 0, -1], palm: [1, 0, 0.15], curl: 28};
const RELAX_L: Arm = {wrist: [138, 488, 34], elbowHint: [0.4, 0, -1], palm: [-1, 0, 0.15], curl: 28};
/** The left hand holding the bag's strap in front of the shoulder. */
const STRAP_L: Arm = {wrist: [96, 696, 62], elbowHint: [0.35, -1, -0.25], handDir: [0.05, 1, 0.1], palm: [-0.25, 0, -1], curl: 70, holds: ['strapF']};
/** The left hand carrying the iced coffee at the waist, the forearm forward. */
const CUP_L: Arm = {wrist: [120, 640, 150], elbowHint: [0.3, -1, -0.4], handDir: [0, 0.3, 1], palm: [-1, 0, 0], curl: 62, holds: ['cup', 'lid']};
const POCKET_R: Arm = {wrist: [-90, 528, 44], elbowHint: [-1, 0, -0.6], hidden: true};
const POCKET_L: Arm = {wrist: [90, 528, 44], elbowHint: [1, 0, -0.6], hidden: true};

export type Views = {front34: Pose; profile: Pose; back: Pose};

export const HER_EVENING_POSES: Views = {
  front34: standR({R: RELAX_R, L: STRAP_L}),
  profile: walk({R: {wrist: [-112, 500, 70], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26}, L: STRAP_L}),
  back: standL({L: STRAP_L, R: {wrist: [-134, 488, 30], elbowHint: [-0.4, 0, -1], palm: [1, 0, 0.15], curl: 28}}),
};
export const HER_WEEKEND_POSES: Views = {
  front34: standR({R: POCKET_R, L: CUP_L}),
  profile: walk({R: {wrist: [-110, 498, 66], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26}, L: CUP_L}),
  back: standL({L: CUP_L, R: POCKET_R}),
};
export const MAN_POSES: Views = {
  front34: standR({R: {wrist: [-146, 476, 26], elbowHint: [-0.4, 0, -1], palm: [1, 0, 0.1], curl: 30}, L: POCKET_L}, {yaw: -14, pitch: 2, roll: -3}),
  profile: walk({R: {wrist: [-118, 500, 70], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26}, L: POCKET_L}),
  back: standL({L: POCKET_L, R: RELAX_R}),
};
export const WOMAN_POSES: Views = {
  front34: walk({R: {wrist: [-118, 500, 76], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26}, L: POCKET_L}, {yaw: 12, pitch: 2, roll: 0}),
  profile: walk({R: {wrist: [-118, 500, 70], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26}, L: POCKET_L}),
  back: standL({L: POCKET_L, R: RELAX_R}),
};

export const CAST: Record<string, Person> = {herEvening: HER_EVENING, herWeekend: HER_WEEKEND, man: MAN_SUEDE, woman: WOMAN_COAT};
export const CAST_POSES: Record<string, Views> = {herEvening: HER_EVENING_POSES, herWeekend: HER_WEEKEND_POSES, man: MAN_POSES, woman: WOMAN_POSES};
export const POSES: Record<string, Pose> = {stand: HER_EVENING_POSES.front34, walk: HER_EVENING_POSES.profile, back: HER_EVENING_POSES.back};
export {RELAX_L};
