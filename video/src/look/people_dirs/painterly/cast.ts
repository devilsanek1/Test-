// people_dirs/painterly: the cast (dir_painterly.md "The cast"). HER, the film's lead (~27): her accent is the film's
// teal; she wears it once per outfit (the satin skirt in the evening, the cap at the weekend); everything else is a
// tonal base. Two supporting people, different looks and ethnicities from her. Garment types only (fashion.md §4);
// no artist's characters.
import {type FaceShape, type Pose, type Skeleton, FACE_F, FACE_M, MAN, WOMAN, footChain, armSurface} from './body';
import {type Person, type Piece} from './figure';
import {footSurface, shoeSurfaces, skirtSurface, sleeveSurface, sockSurface, torsoGarment, trouserSurfaces} from './garments';
import {hairOf, type HairSpec} from './hair';
import {faceMarks, type FaceMarks} from './face';
import {bagSurfaces, capSurfaces, cupSurfaces, sunglassesMarks, collarSurface} from './props';
import {smooth} from './math';

const hairPiece = (hs: HairSpec): Piece => ({build: (sk, res) => hairOf(sk, hs, res)});
const marks = (fm: FaceMarks) => (sk: Skeleton, res: number, fs: FaceShape) => faceMarks(sk, fm, res, fs);

// ---------------------------------------------------------------- HER: the autumn city evening

/** A cropped leather jacket worn open over a cream top, a teal satin slip skirt (the accent), pointed flats, a small
 *  shoulder bag; long auburn hair with curtain bangs and bouncy ends (the flowing element). */
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
    strap: {base: '#5A2329', kind: 'leather'},
    lip: {base: '#B9746A', kind: 'skin'},
  },
  pieces: [
    {
      hides: {torso: true},
      build: (sk, res) => ({
        surfaces: [torsoGarment(sk, {key: 'top', mat: 'top', hem: 610, ease: 3, neck: {dip: 46, width: 0.95}, n: {front: 2.2, back: 2.4}, bias: 4, look: {blur: 6}, covers: ['torso']}, res)],
      }),
    },
    {
      hides: {legsFrom: 330},
      build: (sk, res) => ({
        surfaces: [skirtSurface(sk, {key: 'skirt', mat: 'skirt', waist: 648, hem: 208, ease: 5, hemHalf: 122, folds: {n: 5, amp: 6, seed: 1.1}, look: {sheen: {t: 0.62, p: 3}, blur: 7}, bias: 12}, res)],
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
              hem: 606,
              top: 856,
              ease: (y) => 10 + 5 * smooth(700, 620, y),
              hang: {from: 752, k: 1.0},
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
    {
      build: (sk, res) => ({
        surfaces: [footSurface(sk, 'L', res), footSurface(sk, 'R', res), ...shoeSurfaces(sk, 'L', {key: 'shoe', mat: 'shoe', style: 'flat'}, res), ...shoeSurfaces(sk, 'R', {key: 'shoe', mat: 'shoe', style: 'flat'}, res)],
      }),
    },
    hairPiece({kind: 'long', endBack: 676, endFront: 770, vol: 0.05, part: 0.32, bangs: 0.7}),
  ],
  faceMarks: marks({brows: '#5E3426', lash: '#3B231D', lips: '#B9746A', lidsDown: true}),
};

// ---------------------------------------------------------------- the poses

/** Standing, the weight on her right leg (contrapposto); the left hand on the bag's strap at the hip. */
export const POSE_STAND: Pose = {
  pelvisAt: [-10, -3, 0],
  pelvis: {yaw: -4, pitch: 3, roll: -6},
  chest: {yaw: 6, pitch: -3, roll: 3},
  head: {yaw: 10, pitch: 7, roll: -4},
  legs: {
    R: {ankle: [-34, 42, -2], footYaw: -14},
    L: {ankle: [50, 42, 46], footYaw: 26},
  },
  arms: {
    R: {wrist: [-138, 488, 34], elbowHint: [-0.4, 0, -1], palm: [1, 0, 0.15], curl: 28},
    L: {wrist: [118, 548, 38], elbowHint: [0.6, 0, -1], palm: [-1, 0, 0.2], curl: 40},
  },
};

/** Walking (the cool walk: a short arm swing), the left foot forward at the heel strike. */
export const POSE_WALK: Pose = {
  pelvisAt: [0, -12, 0],
  pelvis: {yaw: -7, pitch: 2, roll: 2},
  chest: {yaw: 6, pitch: -2, roll: -1},
  head: {yaw: 0, pitch: 3, roll: 0},
  legs: {
    L: {ankle: [44, 46, 118], footYaw: 3, roll: -12},
    R: {ankle: [-40, 74, -128], footYaw: -3, roll: 34},
  },
  arms: {
    R: {wrist: [-104, 498, 62], elbowHint: [-0.2, 0, -1], palm: [1, 0, 0.1], curl: 26},
    L: {wrist: [116, 520, -40], elbowHint: [0.3, 0, -1], palm: [-1, 0, 0.3], curl: 34},
  },
};

/** From behind: the weight on her left leg, the head turned to her left (the lost profile toward the key). */
export const POSE_BACK: Pose = {
  pelvisAt: [10, -3, 0],
  pelvis: {yaw: 3, pitch: 3, roll: 6},
  chest: {yaw: -5, pitch: -3, roll: -3},
  head: {yaw: 38, pitch: 4, roll: 3},
  legs: {
    L: {ankle: [34, 42, -2], footYaw: 14},
    R: {ankle: [-50, 42, 40], footYaw: -24},
  },
  arms: {
    L: {wrist: [124, 480, 14], elbowHint: [0.4, 0, -1], palm: [-1, 0, 0.15], curl: 28},
    R: {wrist: [-116, 552, 34], elbowHint: [-0.6, 0, -1], palm: [1, 0, 0.2], curl: 40},
  },
};

export {FACE_M, MAN, WOMAN, footChain, armSurface, sockSurface, trouserSurfaces, bagSurfaces, capSurfaces, cupSurfaces, sunglassesMarks};

export const CAST: Record<string, Person> = {herEvening: HER_EVENING};
export const POSES: Record<string, Pose> = {stand: POSE_STAND, walk: POSE_WALK, back: POSE_BACK};
