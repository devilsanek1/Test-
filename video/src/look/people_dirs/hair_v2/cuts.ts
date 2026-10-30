// HAIR v2: the CUTS as data (RECIPE.md (b)). Each cut is its texture, motion class and mess level, plus per view
// (q = 3/4 facing screen-left at a head yaw near -38, p = profile facing screen-left, b = from behind, the head may
// turn toward screen-left) a base mass, its locks, wisps, gaps, parting, terminator and crown sheen, all in head units
// (u = the skull, crown to chin; origin at the skull's centre; y down: the crown at -0.5, the chin at 0.5, the shoulder
// line at ~0.92). Adding a cut from a new reference = one entry here (RECIPE (b) "Adding a cut"); hair.ts never knows
// a cut by name.
// z: the back mass 18, locks behind the body 19-20, the far curtain 54-56 (over the face's far side), the base mass 75
// (3/4) or 76 (back), locks in front 75.5-78, wisps on top. In profile the fall sits at 46-55 (over the coat's back,
// behind the near arm).
import type {V2} from '../graphic/geo';
import type {MP, Wave} from './lock';
import type {Motion, StateName} from './states';

export type HView = 'q' | 'p' | 'b';

export type LockDef = {
  /** B big, M medium, S small, W a wisp */
  size: 'B' | 'M' | 'S' | 'W';
  /** the spine's control points (u), root first, in the calm state */
  pts: V2[];
  w?: number;
  z: number;
  /** the cut's wave on this lock: a multiplier (0 = straight) and a phase (turns) */
  wave?: number;
  ph?: number;
  hook?: number;
  hookFrom?: number;
  asym?: number;
  twist?: number;
  root?: number;
  swell?: number;
  /** the taper (a.2): w x (1 - s^k)^m; a smaller m gives a blunter, softer tip (a bob's pieces, twists) */
  k?: number;
  m?: number;
  /** the least level of detail that draws it (3 close, 2 film, 1 small, 0 tiny); defaults by size */
  lod?: number;
  /** a wisp shown at rest too (wisps show only in wind, a walk or a turn otherwise) */
  rest?: boolean;
  only?: StateName[];
  not?: StateName[];
  /** its response to the air (default by size: B 0.75, M 0.9, S 1.05, W 1.8) and how outer it is (0..1) */
  air?: number;
  outer?: number;
  /** how fully it hangs under gravity (1: it counter-rotates against the head's roll) */
  hang?: number;
  tone?: 'lit' | 'shade' | 'deep';
  /** its own shade edge as a fraction of its width (0 = none) */
  shade?: number;
  sheen?: boolean | number[];
  /** the side it fans to in a turn (-1 left, +1 right; default by where its tip is) */
  fan?: number;
  /** an extra fixed bend (degrees) */
  bend?: number;
  /** on the silhouette (it takes the rim, the subject only) */
  edge?: boolean;
  /** casts no sliver on the hair behind (a crossing lock) */
  sliver?: boolean;
  /** v3 (gen 3 cuts): an ACCENT lifts in the air on top of the mass's lean (an outer flip, a wisp); every other lock
   *  rides the mass (it leans with the whole shape, never scattering into strands) */
  accent?: boolean;
  /** v3: does not ride the mass (a wisp rooted at the crown, a front piece on the face) */
  free?: boolean;
};

export type Extra = {
  name: string;
  pts: MP[];
  z: number;
  tone?: 'lit' | 'shade' | 'deep';
  shade?: boolean;
  crown?: Crown;
  lod?: number;
  only?: StateName[];
  bend?: boolean;
  edge?: boolean;
};
export type Crown = {c: V2; r: [number, number]; a0: number; a1: number; th: number; n?: number};

export type ViewDef = {
  mass: MP[];
  massZ: number;
  back?: MP[];
  backZ?: number;
  /** the back mass's tone: deep (default: behind the neck, in the head's shadow) or shade */
  backTone?: 'deep' | 'shade';
  extra?: Extra[];
  locks: LockDef[];
  gaps?: {pts: MP[]; lod?: number; only?: StateName[]}[];
  /** the head-scale terminator: the hair right of this line (u) is in the shade plane */
  term: V2[];
  crown?: Crown;
  parting?: MP[];
  /** the point the lengths swing about, and the lowest hem (u) */
  pivot: V2;
  hem: number;
  /** how fully the mass hangs under gravity when the head bows (1 long hair, 0 a crop) */
  hang?: number;
};

/** Coils at film size: a cloud of lobes (RECIPE a.4): its centre and base radii, the lobes as [angle (deg, 0 = right,
 *  90 = down), the lobe centre's distance, the lobe's radius], the single curls as [angle, root distance, length,
 *  turn direction], a terminator and an optional hairline cut (the face side). */
export type CloudDef = {
  c: V2;
  rx: number;
  ry: number;
  lobes: [number, number, number][];
  curls: [number, number, number, number?][];
  term: V2[];
  z: number;
  hairline?: MP[];
};

export type Cut = {
  id: string;
  name: string;
  /** 3 = a v3 cut (cuts3.ts, RECIPE "v3 (after the owner's note)"): the cut's silhouette first, 2-5 big shapes riding
   *  the mass, one flow, alike tips, no per-lock shade edges or sheen unless the data asks; absent = v2 */
  gen?: 2 | 3;
  /** the views in which the ears show (a cut tucked behind the ear, a crop) */
  ears?: HView[];
  texture: 'straight' | 'wavy' | 'curly' | 'coily';
  wave?: Wave;
  motion: Motion;
  mess: 1 | 2 | 3;
  views: Partial<Record<HView, ViewDef>>;
  cloud?: Partial<Record<HView, CloudDef>>;
};

// ================================================================ W3: long shattered layers with curtain bangs (her)
// 2.0-2.5 u (the shoulder blades), the shortest layer at the face, curtain bangs to the cheekbones, a 2B wave; a V hem
// of tapered tips spread ~0.3 u, the lowest off-centre; two big locks, three medium, two small, one crossing; 1-2 gaps
// at the ends; one flyaway at rest hugging the crown.
/** A lazy 2B wave: 1.5-2 waves down a long lock (looser at the root, tighter at the ends). */
export const W2B: Wave = {a0: 0.024, a1: 0.058, l0: 1.0, l1: 0.72, from: 0.2};

export const W3: Cut = {
  id: 'W3',
  name: 'long shattered layers, curtain bangs',
  texture: 'wavy',
  wave: W2B,
  motion: 'C3',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [
        [-0.47, -0.14],
        [-0.38, -0.46],
        [0.0, -0.6],
        [0.39, -0.47],
        [0.5, -0.15],
        [0.52, 0.22],
        [0.55, 0.58],
        [0.6, 0.95],
        [0.58, 1.12],
        [0.46, 1.24],
        [0.3, 1.2],
        [0.14, 1.34],
        [-0.04, 1.28],
        [-0.2, 1.38],
        [-0.34, 1.22],
        [-0.48, 1.24],
        [-0.58, 1.1],
        [-0.59, 0.9],
        [-0.53, 0.52],
        [-0.5, 0.16],
      ],
      locks: [
        // the two big locks down the back, the lowest tip off-centre (left)
        {size: 'B', pts: [[-0.1, 0.0], [-0.2, 0.6], [-0.15, 1.2], [-0.22, 1.8]], w: 0.4, z: 77, outer: 0.25, asym: 1},
        {size: 'B', pts: [[0.13, 0.05], [0.23, 0.66], [0.18, 1.2], [0.25, 1.67]], w: 0.36, z: 77.2, ph: 0.06, outer: 0.3, asym: -1},
        // the outer medium locks break the silhouette over the shoulders
        {size: 'M', pts: [[-0.38, 0.12], [-0.56, 0.7], [-0.58, 1.14], [-0.47, 1.5]], w: 0.22, z: 76.6, outer: 1, edge: true, asym: 1, ph: -0.04},
        {size: 'M', pts: [[0.4, 0.18], [0.59, 0.75], [0.63, 1.15], [0.53, 1.55]], w: 0.22, z: 76.7, ph: 0.1, outer: 1, edge: true, asym: -1},
        // the centre medium lock between the big ones, shorter
        {size: 'M', pts: [[0.01, 0.42], [0.02, 0.95], [-0.01, 1.32], [0.05, 1.6]], w: 0.18, z: 77.4, ph: 0.03, outer: 0.15},
        // one crossing lock: from the right of the crown, over the big lock, toward the left (mess level 2)
        {size: 'M', pts: [[0.3, -0.3], [0.12, 0.2], [-0.04, 0.62], [-0.08, 0.98]], w: 0.17, z: 77.6, ph: 0.08, outer: 0.3, asym: 1, sliver: false},
        // small locks at the ends
        {size: 'S', pts: [[0.33, 0.8], [0.39, 1.15], [0.37, 1.45]], w: 0.1, z: 77.5, ph: 0.12, outer: 0.6},
        // wisps: one flyaway at rest, hugging the crown's edge; in the air, more stream off the temple and the ends
        {size: 'W', pts: [[-0.04, -0.56], [-0.24, -0.56], [-0.41, -0.47], [-0.52, -0.31]], w: 0.034, z: 77.8, rest: true, edge: true, wave: 0, air: 1.2},
        {size: 'W', pts: [[0.46, -0.18], [0.58, 0.2], [0.62, 0.62]], w: 0.03, z: 77.8, edge: true, wave: 0.6, only: ['breeze', 'turn', 'walk']},
        {size: 'W', pts: [[0.5, 1.0], [0.6, 1.35], [0.6, 1.72]], w: 0.03, z: 77.8, edge: true, wave: 0.6, only: ['breeze', 'turn']},
        {size: 'W', pts: [[-0.3, -0.5], [-0.48, -0.47], [-0.58, -0.34]], w: 0.03, z: 77.8, edge: true, wave: 0, only: ['breeze'], air: 1.4},
      ],
      gaps: [{pts: [[-0.38, 1.12], [-0.33, 1.34], [-0.38, 1.62, 1], [-0.44, 1.36]]}, {pts: [[0.36, 1.3], [0.42, 1.44], [0.4, 1.6, 1], [0.33, 1.45]], lod: 3}],
      term: [[0.12, -0.7], [0.16, -0.2], [0.22, 0.35], [0.2, 0.85], [0.24, 1.3], [0.22, 1.9]],
      crown: {c: [0, 0.04], r: [0.45, 0.51], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, 0.3],
      hem: 1.8,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      // behind the neck only, in the shade tone (never a dark hole under the jaw)
      back: [
        [-0.2, -0.1],
        [-0.32, 0.3],
        [-0.34, 0.75],
        [-0.3, 1.05, 1],
        [-0.1, 1.0],
        [0.2, 1.1, 1],
        [0.42, 1.0],
        [0.6, 0.94, 1],
        [0.64, 0.55],
        [0.58, 0.0],
        [0.32, -0.42],
      ],
      mass: [
        [-0.13, -0.5, 1],
        [0.06, -0.6],
        [0.36, -0.51],
        [0.55, -0.26],
        [0.58, 0.04],
        [0.55, 0.36],
        [0.6, 0.72],
        [0.62, 0.98, 1],
        [0.44, 0.92],
        [0.3, 0.98, 1],
        [0.22, 0.7],
        [0.15, 0.42],
        [0.09, 0.2],
        [0.06, 0.0],
        [0.03, -0.19],
        [-0.03, -0.34],
        [-0.09, -0.45],
      ],
      extra: [
        // the far curtain: from the parting over the far temple to the cheekbone (over the face's far side)
        {
          name: 'far',
          pts: [[-0.13, -0.5, 1], [-0.33, -0.55], [-0.48, -0.37], [-0.53, -0.1], [-0.51, 0.07], [-0.45, 0.18, 1], [-0.42, 0.0], [-0.32, -0.2], [-0.21, -0.38]],
          z: 56,
          crown: {c: [0, -0.02], r: [0.52, 0.52], a0: 222, a1: 258, th: 0.05, n: 1},
          bend: false,
          edge: true,
        },
      ],
      locks: [
        // the far side's length past the far jaw (lit: it faces the key), and a lock behind the near shoulder
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.4], [-0.5, 0.82], [-0.44, 1.12]], w: 0.25, z: 19, outer: 0.8, ph: 0.04, edge: true, asym: 1},
        {size: 'M', pts: [[0.5, 0.3], [0.72, 0.85], [0.78, 1.28], [0.71, 1.58]], w: 0.22, z: 19.5, tone: 'shade', outer: 1, ph: 0.08},
        {size: 'M', pts: [[-0.22, 0.05], [-0.28, 0.45], [-0.25, 0.8], [-0.18, 1.06]], w: 0.2, z: 18.5, tone: 'deep', outer: 0.4, ph: 0.1},
        // the near curtain running into the face-framing layer, to the collarbone
        {size: 'M', pts: [[-0.05, -0.47], [0.12, -0.1], [0.2, 0.35], [0.29, 0.8], [0.32, 1.22]], w: 0.24, z: 75.4, outer: 0.3, ph: 0.02, asym: -1},
        // the big lock over the near shoulder, down the coat, the lowest tip
        {size: 'B', pts: [[0.38, 0.28], [0.53, 0.85], [0.47, 1.35], [0.51, 1.74]], w: 0.34, z: 76, outer: 0.6, asym: 1, edge: true},
        // a medium lock flicking out past the shoulder, a small one between
        {size: 'M', pts: [[0.52, 0.45], [0.67, 0.95], [0.69, 1.3], [0.61, 1.52]], w: 0.17, z: 75.7, outer: 1, ph: 0.06, edge: true, asym: -1},
        {size: 'S', pts: [[0.3, 0.92], [0.37, 1.24], [0.35, 1.5]], w: 0.09, z: 76.4, ph: 0.1, outer: 0.5},
        // wisps
        {size: 'W', pts: [[-0.02, -0.59], [-0.2, -0.6], [-0.36, -0.54], [-0.47, -0.4]], w: 0.034, z: 56.5, rest: true, edge: true, wave: 0, air: 1.2},
        {size: 'W', pts: [[0.52, -0.12], [0.64, 0.24], [0.68, 0.6]], w: 0.03, z: 75.9, edge: true, wave: 0.6, only: ['breeze', 'turn', 'walk']},
        {size: 'W', pts: [[0.58, 0.95], [0.66, 1.3], [0.64, 1.62]], w: 0.03, z: 76.2, edge: true, wave: 0.6, only: ['breeze', 'turn']},
      ],
      parting: [[-0.32, -0.548], [0.05, -0.597], [-0.1, -0.43, 1], [-0.16, -0.43]],
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.55], [0.44, 1.1], [0.46, 1.9]],
      crown: {c: [0.08, -0.02], r: [0.45, 0.49], a0: 218, a1: 300, th: 0.045, n: 2},
      pivot: [0.4, 0.3],
      hem: 1.75,
    },
    p: {
      massZ: 56,
      // the cap: over the skull, the hairline in front of the ear, the curtain tucked behind the lash (LASH)
      mass: [
        [-0.34, -0.44],
        [0.0, -0.6],
        [0.42, -0.49],
        [0.61, -0.2],
        [0.63, 0.14],
        [0.55, 0.42],
        [0.36, 0.55],
        [0.13, 0.48],
        [0.03, 0.33],
        [-0.05, 0.17],
        [-0.15, 0.085],
        [-0.24, 0.1, 1],
        [-0.29, 0.03],
        [-0.36, -0.09],
        [-0.4, -0.31],
      ],
      extra: [
        // the fall: from the back of the head down the upper back (over the coat, behind the near arm)
        {
          name: 'fall',
          pts: [[0.22, -0.42], [0.56, -0.32], [0.68, 0.05], [0.74, 0.45], [0.86, 0.85], [0.98, 1.15], [1.02, 1.38], [0.9, 1.5, 1], [0.72, 1.36], [0.6, 1.1], [0.46, 0.8], [0.34, 0.55], [0.24, 0.3]],
          z: 55,
          edge: true,
        },
      ],
      locks: [
        {size: 'B', pts: [[0.42, -0.15], [0.7, 0.35], [0.95, 0.95], [1.05, 1.4], [1.0, 1.74]], w: 0.3, z: 55.4, outer: 1, edge: true, asym: -1},
        {size: 'M', pts: [[0.32, 0.2], [0.52, 0.7], [0.78, 1.15], [0.84, 1.56]], w: 0.2, z: 55.6, outer: 0.5, ph: 0.06},
        {size: 'S', pts: [[0.9, 1.05], [1.04, 1.36], [1.13, 1.58]], w: 0.09, z: 55.7, outer: 1, ph: 0.1, edge: true},
        // the front piece by the ear: a short layer falling over the jaw's back (behind the lash, never over it)
        {size: 'M', pts: [[0.1, 0.0], [0.2, 0.4], [0.24, 0.72], [0.2, 0.96]], w: 0.18, z: 56.5, outer: 0.2, ph: 0.02},
        {size: 'W', pts: [[0.16, -0.59], [-0.03, -0.62], [-0.2, -0.58], [-0.32, -0.48]], w: 0.034, z: 56.8, rest: true, edge: true, wave: 0, air: 1.2},
        {size: 'W', pts: [[0.62, 0.1], [0.78, 0.5], [0.86, 0.9]], w: 0.03, z: 55.8, edge: true, wave: 0.6, only: ['breeze', 'walk', 'turn']},
      ],
      term: [[0.2, -0.8], [0.28, 0.1], [0.4, 0.6], [0.6, 1.1], [0.72, 1.9]],
      crown: {c: [0.08, 0.0], r: [0.47, 0.51], a0: 198, a1: 282, th: 0.045, n: 2},
      pivot: [0.5, 0.3],
      hem: 1.74,
    },
  },
};

// ---------------------------------------------------------------- shared pieces
/** The far curtain in 3/4 (from a centre-ish parting over the far temple to the cheekbone; over the face's far side,
 *  never past its contour). */
const FAR_CURTAIN = (tipY = 0.18, part: [number, number] = [-0.13, -0.5]): Extra => ({
  name: 'far',
  pts: [[part[0], part[1], 1], [-0.33, -0.55], [-0.48, -0.37], [-0.53, -0.1], [-0.51, tipY - 0.11], [-0.45, tipY, 1], [-0.42, 0.0], [-0.32, -0.2], [-0.21, -0.38]],
  z: 56,
  crown: {c: [0, -0.02], r: [0.5, 0.5], a0: 224, a1: 256, th: 0.045, n: 1},
  bend: false,
  edge: true,
});
/** The profile cap for long hair with the curtain tucked behind the lash (LASH). */
const CAP_TUCK: MP[] = [
  [-0.34, -0.44],
  [0.0, -0.6],
  [0.42, -0.49],
  [0.61, -0.2],
  [0.63, 0.14],
  [0.55, 0.42],
  [0.36, 0.55],
  [0.13, 0.48],
  [0.03, 0.33],
  [-0.05, 0.17],
  [-0.15, 0.085],
  [-0.24, 0.1, 1],
  [-0.29, 0.03],
  [-0.36, -0.09],
  [-0.4, -0.31],
];
/** A short back-view crown (the skull plus `top` above and `side` beside it), from the left temple over the top to the
 *  right temple: the start of a short cut's mass. */
const crownB = (top: number, side: number): MP[] => [
  [-0.41 - side, 0.0],
  [-0.4 - side, -0.22],
  [-0.33 - side * 0.8, -0.44 - top * 0.4],
  [-0.14, -0.5 - top * 0.9],
  [0.06, -0.5 - top],
  [0.26, -0.48 - top * 0.7],
  [0.38 + side * 0.8, -0.36 - top * 0.3],
  [0.42 + side, -0.12],
  [0.41 + side, 0.06],
];

// ================================================================ W1: the soft swing bob (the ripped bob)
// Chin to collar (the back 1.05-1.2 u below the crown, the front longer), a deep side part, the light side tucked behind
// the ear, the ends swinging out; the hem in 4-6 separate pieces, the lowest off-centre, one nape flick, one gap.
const BOBW: Wave = {a0: 0.012, a1: 0.028, l0: 0.9, l1: 0.7, from: 0.25};
export const W1: Cut = {
  id: 'W1',
  name: 'the soft swing bob',
  texture: 'straight',
  wave: BOBW,
  motion: 'C1',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.47, -0.12], [-0.38, -0.47], [0.0, -0.59], [0.4, -0.46], [0.5, -0.12], [0.5, 0.18], [0.54, 0.4], [0.48, 0.52], [0.25, 0.5], [0.0, 0.54], [-0.26, 0.5], [-0.5, 0.5], [-0.54, 0.38], [-0.5, 0.16]],
      locks: [
        {size: 'B', pts: [[-0.14, -0.15], [-0.2, 0.3], [-0.26, 0.7]], w: 0.38, z: 77, outer: 0.3, asym: 1, m: 0.6},
        {size: 'M', pts: [[0.16, -0.1], [0.23, 0.32], [0.27, 0.64]], w: 0.3, z: 77.1, outer: 0.3, asym: -1, ph: 0.05, m: 0.6},
        {size: 'M', pts: [[-0.4, -0.05], [-0.54, 0.32], [-0.66, 0.6]], w: 0.22, z: 76.6, outer: 1, edge: true, asym: 1, m: 0.6},
        {size: 'M', pts: [[0.42, 0.0], [0.55, 0.34], [0.65, 0.58]], w: 0.22, z: 76.7, outer: 1, edge: true, asym: -1, ph: 0.1, m: 0.6},
        {size: 'S', pts: [[0.0, 0.15], [0.01, 0.42], [0.04, 0.63]], w: 0.13, z: 77.3, outer: 0.2, m: 0.6},
        {size: 'S', pts: [[0.32, 0.3], [0.42, 0.52], [0.52, 0.66]], w: 0.08, z: 77.4, outer: 0.8, edge: true, hook: -25},
        {size: 'W', pts: [[0.28, 0.2], [0.44, 0.45], [0.6, 0.6]], w: 0.03, z: 77.6, edge: true, only: ['breeze', 'turn']},
      ],
      gaps: [{pts: [[0.12, 0.42], [0.16, 0.54], [0.13, 0.66, 1], [0.08, 0.54]]}],
      term: [[0.1, -0.7], [0.16, -0.1], [0.2, 0.4], [0.18, 0.9]],
      crown: {c: [0, 0.04], r: [0.45, 0.51], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, -0.05],
      hem: 0.72,
    },
    q: {
      // a deep side part on the near side; the near side tucked behind the ear (the ear shows), the heavy side sweeping
      // over the crown to the far side, its big lock along the far cheek to the jaw, the tip kicking forward
      massZ: 75,
      mass: [[0.0, -0.53, 1], [0.2, -0.58], [0.42, -0.47], [0.54, -0.2], [0.56, 0.12], [0.57, 0.42], [0.6, 0.62, 1], [0.46, 0.58], [0.4, 0.4], [0.37, 0.16], [0.38, -0.02], [0.32, -0.13], [0.22, -0.15], [0.14, -0.27], [0.06, -0.42]],
      extra: [
        {
          name: 'far',
          pts: [[0.0, -0.53, 1], [-0.22, -0.6], [-0.44, -0.47], [-0.55, -0.2], [-0.55, 0.06], [-0.47, 0.2, 1], [-0.43, 0.02], [-0.34, -0.2], [-0.2, -0.38], [-0.08, -0.47]],
          z: 56,
          crown: {c: [0, 0.0], r: [0.5, 0.5], a0: 222, a1: 262, th: 0.045, n: 1},
          bend: false,
          edge: true,
        },
      ],
      locks: [
        {size: 'B', pts: [[-0.44, -0.05], [-0.5, 0.25], [-0.5, 0.48], [-0.6, 0.66]], w: 0.26, z: 19, outer: 0.7, edge: true, asym: 1, hook: 18},
        {size: 'M', pts: [[0.45, 0.0], [0.52, 0.3], [0.56, 0.5], [0.64, 0.64]], w: 0.17, z: 75.5, outer: 1, edge: true, asym: -1},
        {size: 'S', pts: [[0.4, 0.2], [0.44, 0.45], [0.47, 0.64]], w: 0.09, z: 75.6, outer: 0.6},
        {size: 'M', pts: [[-0.04, -0.52], [-0.2, -0.36], [-0.36, -0.16], [-0.46, 0.1]], w: 0.15, z: 56.3, outer: 0.4, sheen: [0.3], wave: 0, sliver: false},
        {size: 'W', pts: [[-0.38, 0.3], [-0.5, 0.5], [-0.58, 0.66]], w: 0.03, z: 56.4, edge: true, only: ['breeze', 'turn']},
      ],
      parting: [[-0.2, -0.597], [0.18, -0.578], [0.04, -0.45, 1], [-0.01, -0.46]],
      term: [[0.18, -0.75], [0.3, 0.0], [0.36, 0.5], [0.4, 0.9]],
      crown: {c: [0.1, 0.0], r: [0.45, 0.49], a0: 226, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, -0.05],
      hem: 0.68,
    },
  },
};

// ================================================================ W2: the lazy wavy lob
// To the shoulders, bending over them; a soft middle part; widest from the jaw to the ends; one lock lies forward over a
// shoulder (one side reads shorter from behind); 1-3 wisps; the waves spring on the step.
const LOBW: Wave = {a0: 0.028, a1: 0.062, l0: 0.85, l1: 0.62, from: 0.18};
export const W2: Cut = {
  id: 'W2',
  name: 'the lazy wavy lob',
  texture: 'wavy',
  wave: LOBW,
  motion: 'C2',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.48, -0.12], [-0.39, -0.47], [0.0, -0.6], [0.4, -0.46], [0.52, -0.1], [0.56, 0.25], [0.6, 0.52], [0.6, 0.74], [0.48, 0.84], [0.2, 0.86], [-0.1, 0.9], [-0.38, 0.8], [-0.53, 0.64], [-0.56, 0.42], [-0.52, 0.15]],
      locks: [
        {size: 'B', pts: [[-0.14, 0.0], [-0.24, 0.45], [-0.2, 0.8], [-0.27, 1.1]], w: 0.36, z: 77, outer: 0.3, asym: 1},
        {size: 'B', pts: [[0.17, 0.05], [0.26, 0.45], [0.24, 0.76], [0.3, 1.02]], w: 0.32, z: 77.2, outer: 0.3, asym: -1, ph: 0.06},
        {size: 'M', pts: [[0.44, 0.12], [0.6, 0.5], [0.66, 0.78], [0.6, 1.0]], w: 0.2, z: 76.7, outer: 1, edge: true, asym: -1, ph: 0.1},
        // the left side reads shorter: its lock went forward over the shoulder; the outer piece flicks out higher
        {size: 'M', pts: [[-0.42, 0.08], [-0.56, 0.38], [-0.6, 0.6], [-0.66, 0.78]], w: 0.18, z: 76.6, outer: 1, edge: true, asym: 1, hook: 12},
        {size: 'M', pts: [[0.0, 0.32], [0.02, 0.66], [0.05, 0.97]], w: 0.16, z: 77.4, outer: 0.15, ph: 0.04},
        {size: 'S', pts: [[0.42, 0.52], [0.47, 0.76], [0.45, 0.97]], w: 0.09, z: 77.5, outer: 0.6, ph: 0.12},
        {size: 'W', pts: [[-0.04, -0.56], [-0.24, -0.56], [-0.41, -0.47], [-0.5, -0.32]], w: 0.034, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.46, -0.16], [0.58, 0.18], [0.64, 0.5]], w: 0.03, z: 77.8, edge: true, wave: 0.6, only: ['breeze', 'turn', 'walk']},
        {size: 'W', pts: [[0.5, 0.65], [0.62, 0.9], [0.66, 1.1]], w: 0.03, z: 77.8, edge: true, wave: 0.6, only: ['breeze', 'turn']},
      ],
      gaps: [{pts: [[0.42, 0.72], [0.47, 0.86], [0.44, 1.0, 1], [0.38, 0.86]]}],
      term: [[0.12, -0.7], [0.16, -0.2], [0.22, 0.3], [0.2, 0.7], [0.24, 1.2]],
      crown: {c: [0, 0.04], r: [0.45, 0.51], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, 0.15],
      hem: 1.1,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.3, 0.7, 1], [0.0, 0.66], [0.3, 0.78, 1], [0.55, 0.72, 1], [0.62, 0.4], [0.58, 0.0], [0.32, -0.42]],
      mass: [[-0.13, -0.5, 1], [0.06, -0.6], [0.36, -0.52], [0.56, -0.26], [0.6, 0.04], [0.61, 0.38], [0.64, 0.64, 1], [0.46, 0.6], [0.3, 0.68, 1], [0.22, 0.5], [0.15, 0.35], [0.09, 0.18], [0.06, 0.0], [0.03, -0.19], [-0.03, -0.34], [-0.09, -0.45]],
      extra: [FAR_CURTAIN()],
      locks: [
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.35], [-0.48, 0.62], [-0.4, 0.84]], w: 0.24, z: 19, outer: 0.8, edge: true, asym: 1, ph: 0.04},
        {size: 'M', pts: [[0.5, 0.2], [0.68, 0.55], [0.72, 0.85], [0.66, 1.02]], w: 0.2, z: 19.5, tone: 'shade', outer: 1, ph: 0.08},
        // the front lock frames the face from the cheekbone in an S and lies over the near collarbone
        {size: 'B', pts: [[0.04, -0.3], [0.2, 0.18], [0.34, 0.6], [0.3, 1.08]], w: 0.3, z: 76, outer: 0.5, asym: -1, ph: 0.02},
        {size: 'M', pts: [[0.5, 0.3], [0.64, 0.66], [0.64, 0.98]], w: 0.17, z: 75.6, outer: 1, edge: true, asym: -1, ph: 0.06},
        {size: 'S', pts: [[0.38, 0.62], [0.46, 0.84], [0.44, 1.02]], w: 0.09, z: 76.3, outer: 0.5},
        {size: 'W', pts: [[-0.02, -0.59], [-0.2, -0.6], [-0.36, -0.54], [-0.47, -0.4]], w: 0.034, z: 56.5, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.52, -0.1], [0.64, 0.22], [0.68, 0.52]], w: 0.03, z: 75.9, edge: true, wave: 0.6, only: ['breeze', 'turn', 'walk']},
      ],
      parting: [[-0.32, -0.548], [0.05, -0.597], [-0.1, -0.43, 1], [-0.16, -0.43]],
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.5], [0.42, 1.2]],
      crown: {c: [0.08, -0.02], r: [0.45, 0.49], a0: 218, a1: 300, th: 0.045, n: 2},
      pivot: [0.4, 0.2],
      hem: 1.08,
    },
    p: {
      massZ: 56,
      mass: CAP_TUCK,
      extra: [
        {name: 'fall', pts: [[0.22, -0.42], [0.56, -0.32], [0.68, 0.05], [0.74, 0.42], [0.82, 0.72], [0.8, 0.92, 1], [0.64, 0.84], [0.5, 0.66], [0.36, 0.5], [0.24, 0.3]], z: 55, edge: true},
      ],
      locks: [
        {size: 'B', pts: [[0.42, -0.15], [0.66, 0.3], [0.8, 0.7], [0.86, 1.04]], w: 0.28, z: 55.4, outer: 1, edge: true, asym: -1},
        {size: 'M', pts: [[0.3, 0.2], [0.46, 0.55], [0.6, 0.82], [0.62, 1.0]], w: 0.18, z: 55.6, outer: 0.5, ph: 0.06},
        // one lock in front of the fall, by the ear, over the shoulder's front (behind the lash)
        {size: 'M', pts: [[0.1, 0.0], [0.2, 0.36], [0.22, 0.66], [0.16, 0.92]], w: 0.17, z: 56.5, outer: 0.2, ph: 0.02},
        {size: 'W', pts: [[0.16, -0.59], [-0.03, -0.62], [-0.2, -0.58], [-0.32, -0.48]], w: 0.034, z: 56.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.6, 0.1], [0.74, 0.42], [0.82, 0.74]], w: 0.03, z: 55.8, edge: true, wave: 0.6, only: ['breeze', 'walk', 'turn']},
      ],
      term: [[0.2, -0.8], [0.28, 0.1], [0.4, 0.6], [0.56, 1.2]],
      crown: {c: [0.08, 0.0], r: [0.47, 0.51], a0: 198, a1: 282, th: 0.045, n: 2},
      pivot: [0.5, 0.2],
      hem: 1.04,
    },
  },
};

// ================================================================ W4: the butterfly cut
// Long at the back (1.9-2.3 u) with short wings at the cheekbone and the chin flicking away from the face; feathered
// crown layers as overlapping medium locks; widest at the cheek and jaw.
export const W4: Cut = {
  id: 'W4',
  name: 'the butterfly cut',
  texture: 'wavy',
  wave: {a0: 0.02, a1: 0.05, l0: 1.0, l1: 0.75, from: 0.22},
  motion: 'C3',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.5, -0.12], [-0.4, -0.48], [0.0, -0.62], [0.41, -0.48], [0.54, -0.12], [0.6, 0.2], [0.63, 0.5], [0.62, 0.85], [0.56, 1.12], [0.4, 1.2], [0.18, 1.32], [-0.06, 1.26], [-0.24, 1.36], [-0.42, 1.18], [-0.58, 1.06], [-0.63, 0.72], [-0.62, 0.42], [-0.56, 0.15]],
      locks: [
        {size: 'B', pts: [[-0.1, 0.1], [-0.18, 0.66], [-0.14, 1.2], [-0.2, 1.66]], w: 0.38, z: 77, outer: 0.25, asym: 1},
        {size: 'B', pts: [[0.14, 0.12], [0.22, 0.68], [0.18, 1.18], [0.24, 1.56]], w: 0.34, z: 77.2, outer: 0.3, asym: -1, ph: 0.06},
        // the feathered crown layers flicking out at the sides
        {size: 'M', pts: [[-0.12, -0.5], [-0.42, -0.3], [-0.6, 0.0], [-0.7, 0.28]], w: 0.2, z: 77.5, outer: 1, edge: true, asym: 1, wave: 0, hook: -16},
        {size: 'M', pts: [[0.14, -0.5], [0.44, -0.28], [0.62, 0.02], [0.72, 0.3]], w: 0.2, z: 77.5, outer: 1, edge: true, asym: -1, wave: 0, hook: 16},
        {size: 'M', pts: [[-0.4, 0.2], [-0.6, 0.66], [-0.6, 1.05], [-0.48, 1.36]], w: 0.2, z: 76.6, outer: 1, edge: true, asym: 1},
        {size: 'M', pts: [[0.42, 0.24], [0.62, 0.7], [0.62, 1.06], [0.5, 1.38]], w: 0.2, z: 76.7, outer: 1, edge: true, asym: -1, ph: 0.1},
        {size: 'S', pts: [[0.32, 0.86], [0.38, 1.18], [0.35, 1.44]], w: 0.09, z: 77.4, outer: 0.6},
        {size: 'W', pts: [[0.1, -0.6], [-0.1, -0.66], [-0.28, -0.62], [-0.4, -0.52]], w: 0.034, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.5, -0.1], [0.66, 0.24], [0.72, 0.6]], w: 0.03, z: 77.8, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      gaps: [{pts: [[-0.34, 1.0], [-0.3, 1.2], [-0.34, 1.42, 1], [-0.4, 1.2]]}],
      term: [[0.12, -0.7], [0.18, -0.2], [0.24, 0.35], [0.2, 0.85], [0.24, 1.7]],
      crown: {c: [0, 0.04], r: [0.46, 0.52], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, 0.3],
      hem: 1.66,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.32, 0.75], [-0.28, 1.05, 1], [0.0, 1.0], [0.3, 1.1, 1], [0.6, 0.94, 1], [0.66, 0.5], [0.6, 0.0], [0.32, -0.42]],
      mass: [[-0.13, -0.5, 1], [0.06, -0.62], [0.38, -0.53], [0.58, -0.26], [0.63, 0.06], [0.62, 0.4], [0.64, 0.74], [0.64, 1.0, 1], [0.46, 0.94], [0.3, 1.0, 1], [0.24, 0.72], [0.2, 0.5], [0.13, 0.32], [0.08, 0.14], [0.06, 0.0], [0.03, -0.19], [-0.03, -0.34], [-0.09, -0.45]],
      extra: [FAR_CURTAIN(0.15)],
      locks: [
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.4], [-0.5, 0.82], [-0.44, 1.12]], w: 0.25, z: 19, outer: 0.8, edge: true, asym: 1},
        {size: 'M', pts: [[0.5, 0.3], [0.72, 0.85], [0.78, 1.28], [0.71, 1.56]], w: 0.22, z: 19.5, tone: 'shade', outer: 1, ph: 0.08},
        // the two-tier face frame: the cheekbone wing and the chin wing, flicking away from the face
        {size: 'M', pts: [[-0.06, -0.47], [0.08, -0.2], [0.14, 0.05], [0.26, 0.2]], w: 0.18, z: 75.6, outer: 0.4, wave: 0, hook: -30, asym: -1},
        {size: 'M', pts: [[0.08, -0.3], [0.18, 0.1], [0.24, 0.42], [0.36, 0.58]], w: 0.2, z: 75.5, outer: 0.5, wave: 0, hook: -26, asym: -1},
        {size: 'B', pts: [[0.38, 0.28], [0.53, 0.85], [0.47, 1.35], [0.51, 1.7]], w: 0.32, z: 76, outer: 0.6, asym: 1, edge: true},
        {size: 'M', pts: [[0.54, 0.4], [0.7, 0.9], [0.72, 1.26], [0.64, 1.5]], w: 0.17, z: 75.7, outer: 1, edge: true, asym: -1, ph: 0.06},
        {size: 'W', pts: [[0.3, 0.1], [0.46, 0.3], [0.56, 0.5]], w: 0.03, z: 75.9, edge: true, rest: true, wave: 0},
        {size: 'W', pts: [[0.54, -0.12], [0.66, 0.24], [0.7, 0.6]], w: 0.03, z: 75.9, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      parting: [[-0.32, -0.548], [0.05, -0.597], [-0.1, -0.43, 1], [-0.16, -0.43]],
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.55], [0.44, 1.1], [0.46, 1.9]],
      crown: {c: [0.08, -0.02], r: [0.46, 0.5], a0: 218, a1: 300, th: 0.045, n: 2},
      pivot: [0.4, 0.3],
      hem: 1.7,
    },
  },
};

// ================================================================ W5: the shag (soft, on wavy hair)
// Short crown layers in rows, a curtain fringe in pieces, volume at the crown and cheeks narrowing to a thinner nape
// (an upside-down teardrop); the tips point out and down in 2-3 directions; mess level 3.
export const W5: Cut = {
  id: 'W5',
  name: 'the shag',
  texture: 'wavy',
  wave: {a0: 0.03, a1: 0.06, l0: 0.75, l1: 0.55, from: 0.2},
  motion: 'C1',
  mess: 3,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.56, -0.08], [-0.46, -0.5], [0.0, -0.7], [0.46, -0.52], [0.6, -0.1], [0.62, 0.25], [0.5, 0.55], [0.4, 0.82], [0.2, 0.98], [0.0, 1.0], [-0.2, 0.96], [-0.38, 0.8], [-0.5, 0.55], [-0.62, 0.25]],
      locks: [
        // two rows of short crown layers, tips pointing out and down
        {size: 'M', pts: [[-0.05, -0.6], [-0.3, -0.44], [-0.54, -0.2], [-0.66, 0.02]], w: 0.2, z: 77.6, outer: 1, edge: true, asym: 1, wave: 0, hook: -10},
        {size: 'M', pts: [[0.08, -0.62], [0.32, -0.46], [0.56, -0.22], [0.68, 0.0]], w: 0.2, z: 77.6, outer: 1, edge: true, asym: -1, wave: 0, hook: 10},
        {size: 'M', pts: [[-0.2, -0.3], [-0.46, -0.02], [-0.62, 0.24], [-0.7, 0.42]], w: 0.18, z: 77.2, outer: 1, edge: true, asym: 1, hook: -18},
        {size: 'M', pts: [[0.22, -0.3], [0.48, 0.0], [0.64, 0.26], [0.7, 0.44]], w: 0.18, z: 77.2, outer: 1, edge: true, asym: -1, hook: 18, ph: 0.1},
        // the lengths: medium locks narrowing to the nape, tips in 2-3 directions
        {size: 'B', pts: [[-0.08, 0.0], [-0.14, 0.45], [-0.12, 0.8], [-0.2, 1.08]], w: 0.3, z: 76.8, outer: 0.3, asym: 1},
        {size: 'M', pts: [[0.12, 0.05], [0.2, 0.48], [0.2, 0.8], [0.3, 1.02]], w: 0.22, z: 76.9, outer: 0.4, asym: -1, ph: 0.08},
        {size: 'S', pts: [[0.34, 0.45], [0.42, 0.72], [0.52, 0.9]], w: 0.1, z: 77, outer: 0.9, edge: true, hook: -20},
        {size: 'S', pts: [[-0.34, 0.45], [-0.42, 0.7], [-0.5, 0.86]], w: 0.1, z: 77, outer: 0.9, edge: true, hook: 22},
        {size: 'S', pts: [[0.02, 0.5], [0.04, 0.8], [0.06, 1.04]], w: 0.1, z: 77.1, outer: 0.2, lod: 3},
        {size: 'W', pts: [[0.0, -0.66], [-0.2, -0.74], [-0.38, -0.7], [-0.5, -0.58]], w: 0.034, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.3, -0.6], [0.52, -0.6], [0.66, -0.46]], w: 0.03, z: 77.8, edge: true, wave: 0, only: ['breeze', 'turn', 'walk']},
        {size: 'W', pts: [[0.46, 0.5], [0.62, 0.74], [0.68, 0.98]], w: 0.03, z: 77.8, edge: true, only: ['breeze', 'turn']},
      ],
      gaps: [{pts: [[0.26, 0.72], [0.3, 0.86], [0.27, 1.0, 1], [0.22, 0.86]]}, {pts: [[-0.3, 0.7], [-0.27, 0.84], [-0.3, 0.98, 1], [-0.35, 0.84]], lod: 3}],
      term: [[0.12, -0.7], [0.2, -0.2], [0.22, 0.4], [0.2, 1.1]],
      crown: {c: [0, -0.02], r: [0.5, 0.56], a0: 196, a1: 272, th: 0.045, n: 2},
      pivot: [0, 0.0],
      hem: 1.08,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.28, 0.66, 1], [0.0, 0.6], [0.3, 0.72, 1], [0.5, 0.62, 1], [0.6, 0.3], [0.58, 0.0], [0.32, -0.42]],
      mass: [[-0.14, -0.52, 1], [0.06, -0.68], [0.4, -0.58], [0.62, -0.3], [0.68, 0.04], [0.64, 0.34], [0.58, 0.6, 1], [0.44, 0.56], [0.32, 0.72, 1], [0.24, 0.5], [0.16, 0.3], [0.1, 0.12], [0.06, -0.06], [0.0, -0.22], [-0.06, -0.36], [-0.1, -0.46]],
      extra: [
        // the curtain fringe in pieces on the far side, over the far brow to the cheekbone
        {name: 'far', pts: [[-0.14, -0.52, 1], [-0.34, -0.6], [-0.52, -0.42], [-0.58, -0.16], [-0.54, 0.06, 1], [-0.46, -0.08], [-0.4, -0.2], [-0.3, -0.24, 1], [-0.24, -0.36]], z: 56, crown: {c: [0, -0.02], r: [0.52, 0.52], a0: 226, a1: 256, th: 0.045, n: 1}, bend: false, edge: true},
      ],
      locks: [
        {size: 'M', pts: [[-0.44, 0.0], [-0.54, 0.3], [-0.52, 0.56], [-0.6, 0.76]], w: 0.22, z: 19, outer: 0.8, edge: true, asym: 1, hook: 16},
        {size: 'M', pts: [[0.52, 0.2], [0.66, 0.5], [0.72, 0.76]], w: 0.18, z: 19.5, tone: 'shade', outer: 1},
        // the fringe pieces to the brow, the cheek locks flicking out
        {size: 'M', pts: [[-0.1, -0.5], [-0.1, -0.36], [-0.04, -0.22]], w: 0.14, z: 75.7, outer: 0.4, wave: 0, sliver: false},
        {size: 'M', pts: [[0.0, -0.4], [0.08, -0.12], [0.14, 0.14], [0.26, 0.3]], w: 0.18, z: 75.5, outer: 0.5, hook: -28, asym: -1},
        {size: 'M', pts: [[0.3, -0.1], [0.5, 0.18], [0.62, 0.42], [0.74, 0.56]], w: 0.17, z: 75.6, outer: 1, edge: true, hook: -24, asym: -1},
        {size: 'M', pts: [[0.24, 0.3], [0.34, 0.56], [0.42, 0.8]], w: 0.15, z: 75.8, outer: 0.7, asym: -1},
        {size: 'M', pts: [[0.1, -0.62], [0.36, -0.62], [0.56, -0.46], [0.66, -0.26]], w: 0.15, z: 75.9, outer: 1, edge: true, wave: 0, hook: 6},
        {size: 'W', pts: [[-0.08, -0.65], [-0.24, -0.68], [-0.38, -0.6], [-0.46, -0.48]], w: 0.034, z: 56.5, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.56, 0.4], [0.7, 0.64], [0.74, 0.86]], w: 0.03, z: 75.9, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      parting: [[-0.32, -0.597], [0.04, -0.668], [-0.11, -0.47, 1], [-0.17, -0.46]],
      term: [[0.2, -0.8], [0.34, 0.0], [0.4, 0.5], [0.44, 1.0]],
      crown: {c: [0.08, -0.04], r: [0.48, 0.52], a0: 222, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, 0.0],
      hem: 0.9,
    },
  },
};

// ================================================================ W6: natural curls and coils, the shaped cloud
// A rounded cloud wider at the top than at the jaw, one flatter side, unequal lobes (2.5 : 1), 1-3 popping out, 2-4
// single small curls off the key side and the crown; it barely moves.
export const W6: Cut = {
  id: 'W6',
  name: 'natural curls and coils, the shaped cloud',
  texture: 'coily',
  motion: 'C0',
  mess: 2,
  views: {},
  cloud: {
    b: {
      c: [0.0, -0.08],
      rx: 0.74,
      ry: 0.66,
      lobes: [
        [192, 0.5, 0.26],
        [214, 0.56, 0.22],
        [238, 0.56, 0.27],
        [262, 0.6, 0.24],
        [286, 0.56, 0.28],
        [312, 0.54, 0.21],
        [338, 0.52, 0.25],
        [4, 0.5, 0.2],
        [28, 0.5, 0.24],
        [60, 0.5, 0.18],
        [118, 0.52, 0.2],
        [150, 0.48, 0.26],
        [172, 0.5, 0.18],
      ],
      curls: [
        [226, 0.74, 0.19, 1],
        [270, 0.76, 0.17, -1],
        [198, 0.68, 0.17, 1],
        [304, 0.74, 0.16, -1],
      ],
      term: [[0.14, -0.9], [0.22, -0.2], [0.2, 0.6]],
      z: 76,
    },
    q: {
      c: [0.16, -0.12],
      rx: 0.72,
      ry: 0.64,
      lobes: [
        [184, 0.46, 0.2],
        [206, 0.54, 0.22],
        [232, 0.6, 0.28],
        [258, 0.62, 0.24],
        [284, 0.58, 0.28],
        [310, 0.56, 0.22],
        [336, 0.56, 0.26],
        [2, 0.56, 0.22],
        [26, 0.54, 0.24],
        [52, 0.52, 0.2],
        [78, 0.46, 0.2],
      ],
      curls: [
        [218, 0.76, 0.18, 1],
        [256, 0.78, 0.17, -1],
        [292, 0.74, 0.16, -1],
      ],
      term: [[0.22, -0.9], [0.32, -0.2], [0.36, 0.6]],
      z: 75,
      // the face shows: the cloud is cut along the hairline (the brow, the temple, in front of the ear, down the jaw)
      hairline: [[-1.2, -0.26], [-0.44, -0.26], [-0.38, -0.33], [-0.27, -0.37], [-0.16, -0.355], [-0.04, -0.38], [0.08, -0.34], [0.15, -0.22], [0.18, -0.06], [0.2, 0.12], [0.26, 0.3], [0.2, 1.4], [-1.2, 1.4]],
    },
  },
};

// ================================================================ W7: the bixie (a soft razor crop)
// The top swept forward and aside, a wispy fringe to the brow, the nape in 4-6 small points pointing down and in,
// the ears out.
export const W7: Cut = {
  id: 'W7',
  name: 'the bixie',
  texture: 'straight',
  wave: {a0: 0.01, a1: 0.02, l0: 0.6, l1: 0.5, from: 0.3},
  motion: 'C1',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.12, 0.05), [0.44, 0.22], [0.36, 0.36], [0.2, 0.42], [0.0, 0.44], [-0.2, 0.42], [-0.36, 0.36], [-0.44, 0.2]],
      locks: [
        // the nape's small points, pointing down and in
        {size: 'S', pts: [[-0.3, 0.08], [-0.3, 0.28], [-0.25, 0.42]], w: 0.13, z: 77, outer: 0.6, asym: -1, wave: 0},
        {size: 'S', pts: [[-0.11, 0.12], [-0.1, 0.34], [-0.06, 0.5]], w: 0.15, z: 77.1, outer: 0.4, asym: -1, wave: 0},
        {size: 'S', pts: [[0.08, 0.12], [0.08, 0.32], [0.05, 0.46]], w: 0.14, z: 77.2, outer: 0.4, asym: 1, wave: 0},
        {size: 'S', pts: [[0.26, 0.08], [0.26, 0.26], [0.21, 0.38]], w: 0.12, z: 77.1, outer: 0.6, asym: 1, wave: 0},
        {size: 'M', pts: [[0.36, -0.3], [0.48, -0.1], [0.5, 0.1]], w: 0.15, z: 77.3, outer: 1, edge: true, wave: 0},
        {size: 'W', pts: [[0.1, -0.62], [-0.08, -0.7], [-0.26, -0.68], [-0.38, -0.6]], w: 0.032, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.4, -0.38], [0.56, -0.3], [0.64, -0.16]], w: 0.03, z: 77.8, edge: true, only: ['breeze', 'turn']},
      ],
      term: [[0.1, -0.8], [0.16, -0.2], [0.18, 0.6]],
      crown: {c: [0, 0.04], r: [0.44, 0.5], a0: 194, a1: 276, th: 0.045, n: 2},
      pivot: [0, -0.1],
      hem: 0.56,
      hang: 0.3,
    },
    q: {
      massZ: 75,
      // the hairline: the brow fringe sweeping across to the far side, the temple, the ear out, the nape behind
      mass: [[-0.42, -0.36], [-0.3, -0.58], [0.0, -0.66], [0.32, -0.6], [0.52, -0.38], [0.56, -0.1], [0.52, 0.16], [0.46, 0.34, 1], [0.38, 0.28], [0.36, 0.1], [0.37, -0.03], [0.3, -0.13], [0.2, -0.12], [0.16, -0.24], [0.06, -0.3], [-0.12, -0.3], [-0.3, -0.26]],
      locks: [
        // the fringe in tapered pieces sweeping across the brow toward the far side
        {size: 'M', pts: [[0.12, -0.52], [-0.08, -0.44], [-0.3, -0.33], [-0.46, -0.18]], w: 0.16, z: 75.6, outer: 0.8, edge: true, wave: 0, asym: 1},
        {size: 'S', pts: [[0.02, -0.46], [-0.1, -0.36], [-0.16, -0.24]], w: 0.1, z: 75.7, outer: 0.6, wave: 0, asym: 1},
        {size: 'M', pts: [[0.3, -0.62], [0.06, -0.7], [-0.22, -0.64], [-0.42, -0.48]], w: 0.16, z: 75.8, outer: 1, edge: true, wave: 0, asym: 1},
        {size: 'S', pts: [[0.4, -0.05], [0.46, 0.18], [0.44, 0.4]], w: 0.11, z: 75.5, outer: 0.6, wave: 0, asym: -1},
        {size: 'W', pts: [[0.17, -0.12], [0.19, 0.06], [0.16, 0.2]], w: 0.03, z: 75.9, rest: true, wave: 0},
        {size: 'W', pts: [[0.42, -0.5], [0.58, -0.44], [0.66, -0.3]], w: 0.03, z: 75.9, edge: true, only: ['breeze', 'turn']},
      ],
      term: [[0.18, -0.8], [0.3, 0.0], [0.34, 0.6]],
      crown: {c: [0.08, -0.04], r: [0.45, 0.49], a0: 220, a1: 298, th: 0.045, n: 2},
      pivot: [0.2, -0.1],
      hem: 0.4,
      hang: 0.3,
    },
  },
};

// ================================================================ M1: the textured crop (low taper)
// A choppy top standing 0.08-0.15 u, the fringe 0.2-0.3 u above the brow in 3-5 points angled to one side, scissor
// sides, the taper only at the sideburn and the nape's lowest edge; it holds its shape.
export const M1: Cut = {
  id: 'M1',
  name: 'the textured crop',
  texture: 'straight',
  motion: 'C0',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.12, 0.05), [0.44, 0.2], [0.34, 0.3], [0.16, 0.34], [0.0, 0.35], [-0.18, 0.34], [-0.34, 0.3], [-0.45, 0.2]],
      locks: [
        // tufts breaking the top edge, pointing up and back; one cowlick off-centre
        {size: 'S', pts: [[-0.24, -0.46], [-0.36, -0.56], [-0.46, -0.58]], w: 0.16, z: 77.2, outer: 1, edge: true, asym: 1, hang: 0, m: 0.65},
        {size: 'S', pts: [[-0.04, -0.54], [-0.14, -0.64], [-0.24, -0.68]], w: 0.17, z: 77.3, outer: 1, edge: true, asym: 1, hang: 0, m: 0.65},
        {size: 'S', pts: [[0.16, -0.56], [0.12, -0.66], [0.04, -0.7]], w: 0.16, z: 77.4, outer: 1, edge: true, asym: -1, hang: 0, m: 0.65},
        {size: 'S', pts: [[0.3, -0.44], [0.4, -0.52], [0.46, -0.56]], w: 0.14, z: 77.2, outer: 1, edge: true, asym: -1, hang: 0, m: 0.65},
        {size: 'S', pts: [[0.08, -0.3], [0.2, -0.38], [0.3, -0.38]], w: 0.1, z: 77.5, outer: 0.6, asym: -1, hang: 0, hook: 30, lod: 2},
      ],
      term: [[0.1, -0.9], [0.16, -0.2], [0.18, 0.5]],
      crown: {c: [0, 0.02], r: [0.44, 0.5], a0: 196, a1: 270, th: 0.04, n: 2},
      pivot: [0, -0.2],
      hem: 0.36,
      hang: 0,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.34], [-0.34, -0.56], [-0.04, -0.66], [0.3, -0.62], [0.5, -0.42], [0.55, -0.12], [0.52, 0.14], [0.44, 0.28], [0.38, 0.22], [0.37, 0.02], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.13, -0.2], [0.04, -0.3], [-0.16, -0.32], [-0.32, -0.3]],
      locks: [
        // the fringe's choppy points across the brow, angled toward the far side
        {size: 'S', pts: [[0.06, -0.5], [-0.06, -0.42], [-0.16, -0.34]], w: 0.14, z: 75.7, outer: 0.7, asym: 1, hang: 0, edge: true},
        {size: 'S', pts: [[-0.14, -0.52], [-0.26, -0.44], [-0.36, -0.36]], w: 0.13, z: 75.6, outer: 0.8, asym: 1, hang: 0, edge: true},
        {size: 'S', pts: [[0.24, -0.5], [0.12, -0.42], [0.04, -0.33]], w: 0.13, z: 75.65, outer: 0.6, asym: 1, hang: 0},
        // tufts on top, pointing up and back
        {size: 'S', pts: [[-0.1, -0.56], [-0.04, -0.7], [0.08, -0.78]], w: 0.15, z: 75.8, outer: 1, edge: true, hang: 0, hook: 16, asym: -1},
        {size: 'S', pts: [[0.16, -0.56], [0.3, -0.68], [0.44, -0.7]], w: 0.14, z: 75.8, outer: 1, edge: true, hang: 0, hook: 18, asym: -1},
        {size: 'S', pts: [[0.36, -0.44], [0.5, -0.5], [0.6, -0.48]], w: 0.12, z: 75.7, outer: 1, edge: true, hang: 0, hook: 14, asym: -1, lod: 2},
      ],
      term: [[0.16, -0.9], [0.28, -0.2], [0.32, 0.4]],
      crown: {c: [0.08, -0.02], r: [0.44, 0.48], a0: 226, a1: 296, th: 0.04, n: 2},
      pivot: [0.2, -0.2],
      hem: 0.3,
      hang: 0,
    },
  },
};

// ================================================================ M2: the middle-part flow (curtains)
// Jaw to collar, curtains from a centre part to the cheekbones, launched off the part; the flow down the back of the
// head flicks out at the collar, one side longer.
export const M2: Cut = {
  id: 'M2',
  name: 'the middle-part flow',
  texture: 'straight',
  wave: {a0: 0.015, a1: 0.03, l0: 0.8, l1: 0.6, from: 0.3},
  motion: 'C2',
  mess: 2,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.47, -0.12], [-0.38, -0.48], [0.0, -0.6], [0.4, -0.47], [0.5, -0.12], [0.5, 0.16], [0.48, 0.4], [0.3, 0.5], [0.0, 0.52], [-0.3, 0.5], [-0.48, 0.4], [-0.5, 0.15]],
      locks: [
        {size: 'B', pts: [[-0.12, -0.1], [-0.18, 0.3], [-0.22, 0.62], [-0.32, 0.8]], w: 0.32, z: 77, outer: 0.4, asym: 1, hook: 20},
        {size: 'B', pts: [[0.14, -0.08], [0.2, 0.3], [0.24, 0.58], [0.34, 0.72]], w: 0.3, z: 77.1, outer: 0.4, asym: -1, hook: -22, ph: 0.06},
        {size: 'M', pts: [[-0.4, 0.0], [-0.48, 0.3], [-0.5, 0.5], [-0.6, 0.62]], w: 0.18, z: 76.6, outer: 1, edge: true, asym: 1, hook: 16},
        {size: 'M', pts: [[0.42, 0.02], [0.48, 0.3], [0.5, 0.48], [0.6, 0.58]], w: 0.18, z: 76.7, outer: 1, edge: true, asym: -1, hook: -16},
        {size: 'S', pts: [[0.0, 0.2], [0.02, 0.46], [0.06, 0.66]], w: 0.11, z: 77.3, outer: 0.2},
        {size: 'W', pts: [[0.02, -0.57], [-0.18, -0.59], [-0.34, -0.52], [-0.44, -0.38]], w: 0.032, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.44, 0.1], [0.56, 0.36], [0.64, 0.56]], w: 0.03, z: 77.8, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      gaps: [{pts: [[0.32, 0.5], [0.36, 0.6], [0.34, 0.72, 1], [0.28, 0.6]]}],
      term: [[0.1, -0.7], [0.16, -0.1], [0.2, 0.4], [0.2, 0.9]],
      crown: {c: [0, 0.04], r: [0.45, 0.51], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, -0.05],
      hem: 0.8,
    },
    q: {
      massZ: 75,
      mass: [[-0.13, -0.52, 1], [0.06, -0.62], [0.36, -0.52], [0.54, -0.26], [0.57, 0.04], [0.56, 0.32], [0.6, 0.5], [0.66, 0.62, 1], [0.48, 0.58], [0.4, 0.4], [0.37, 0.18], [0.36, 0.0], [0.3, -0.12], [0.22, -0.12], [0.16, -0.24], [0.06, -0.36], [-0.04, -0.44]],
      extra: [FAR_CURTAIN(0.12, [-0.13, -0.52])],
      locks: [
        // the near curtain falls in an S to the cheekbone and kicks back toward the ear
        {size: 'M', pts: [[-0.08, -0.5], [0.02, -0.3], [0.08, -0.08], [0.18, 0.08]], w: 0.2, z: 75.6, outer: 0.5, wave: 0, hook: -34, asym: -1},
        {size: 'M', pts: [[0.42, 0.0], [0.5, 0.3], [0.56, 0.5], [0.66, 0.62]], w: 0.17, z: 75.5, outer: 1, edge: true, asym: -1, hook: -14},
        {size: 'S', pts: [[0.42, 0.26], [0.46, 0.46], [0.5, 0.62]], w: 0.09, z: 75.6, outer: 0.6},
        {size: 'M', pts: [[-0.44, 0.0], [-0.5, 0.26], [-0.48, 0.46], [-0.56, 0.6]], w: 0.2, z: 19, outer: 0.8, edge: true, asym: 1, hook: 18},
        {size: 'W', pts: [[-0.02, -0.6], [-0.2, -0.61], [-0.36, -0.55], [-0.46, -0.42]], w: 0.032, z: 56.5, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.5, 0.1], [0.62, 0.34], [0.68, 0.56]], w: 0.03, z: 75.9, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      parting: [[-0.32, -0.548], [0.05, -0.615], [-0.1, -0.45, 1], [-0.16, -0.45]],
      term: [[0.18, -0.75], [0.3, 0.0], [0.36, 0.5], [0.4, 0.9]],
      crown: {c: [0.08, -0.02], r: [0.45, 0.49], a0: 220, a1: 300, th: 0.045, n: 2},
      pivot: [0.3, -0.05],
      hem: 0.66,
    },
  },
};

// ================================================================ M3: the modern mullet (a soft wolf cut)
// A short front in pieces, a lifted crown in short layers, a long nape: 3-4 locks hanging to the collar with unequal
// tips; the stepped line in one S.
export const M3: Cut = {
  id: 'M3',
  name: 'the modern mullet',
  texture: 'wavy',
  wave: {a0: 0.02, a1: 0.045, l0: 0.7, l1: 0.5, from: 0.25},
  motion: 'C2',
  mess: 3,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.16, 0.06), [0.46, 0.25], [0.4, 0.5], [0.24, 0.62], [0.0, 0.66], [-0.24, 0.62], [-0.4, 0.5], [-0.47, 0.25]],
      locks: [
        // crown tufts
        {size: 'S', pts: [[-0.08, -0.6], [-0.28, -0.56], [-0.44, -0.4]], w: 0.15, z: 77.4, outer: 1, edge: true, asym: 1, hang: 0.3, wave: 0, m: 0.7},
        {size: 'S', pts: [[0.08, -0.62], [0.27, -0.58], [0.43, -0.42]], w: 0.15, z: 77.4, outer: 1, edge: true, asym: -1, hang: 0.3, wave: 0, m: 0.7},
        {size: 'S', pts: [[-0.38, -0.3], [-0.5, -0.18], [-0.56, -0.02]], w: 0.13, z: 77.2, outer: 1, edge: true, asym: 1, wave: 0, m: 0.7},
        {size: 'S', pts: [[0.4, -0.28], [0.52, -0.16], [0.57, 0.0]], w: 0.13, z: 77.2, outer: 1, edge: true, asym: -1, wave: 0, m: 0.7},
        // the nape locks to the collar, unequal tips
        {size: 'M', pts: [[-0.26, 0.15], [-0.32, 0.5], [-0.3, 0.82], [-0.36, 1.02]], w: 0.2, z: 77, outer: 0.7, asym: 1},
        {size: 'M', pts: [[-0.06, 0.2], [-0.08, 0.6], [-0.05, 0.94], [-0.1, 1.14]], w: 0.2, z: 77.1, outer: 0.4, asym: 1, ph: 0.05},
        {size: 'M', pts: [[0.14, 0.18], [0.16, 0.56], [0.14, 0.86], [0.2, 1.06]], w: 0.19, z: 77.15, outer: 0.4, asym: -1, ph: 0.1},
        {size: 'M', pts: [[0.32, 0.12], [0.38, 0.46], [0.38, 0.72], [0.46, 0.9]], w: 0.17, z: 77.05, outer: 0.8, edge: true, asym: -1, hook: -14},
        {size: 'W', pts: [[0.0, -0.66], [-0.18, -0.74], [-0.34, -0.7]], w: 0.032, z: 77.8, rest: true, edge: true, wave: 0},
        {size: 'W', pts: [[0.4, 0.6], [0.52, 0.84], [0.56, 1.06]], w: 0.03, z: 77.8, edge: true, only: ['breeze', 'turn', 'walk']},
      ],
      gaps: [{pts: [[0.24, 0.74], [0.28, 0.86], [0.25, 1.0, 1], [0.2, 0.86]]}],
      term: [[0.1, -0.9], [0.16, -0.2], [0.2, 0.4], [0.18, 1.2]],
      crown: {c: [0, 0.0], r: [0.48, 0.54], a0: 196, a1: 272, th: 0.045, n: 2},
      pivot: [0, 0.1],
      hem: 1.12,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.34], [-0.32, -0.62], [0.0, -0.7], [0.34, -0.64], [0.54, -0.42], [0.6, -0.12], [0.56, 0.12], [0.5, 0.3], [0.4, 0.26], [0.37, 0.04], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.12, -0.2], [0.02, -0.3], [-0.16, -0.32], [-0.32, -0.3]],
      locks: [
        // the fringe in pieces
        {size: 'S', pts: [[0.04, -0.52], [-0.06, -0.38], [-0.12, -0.24]], w: 0.14, z: 75.7, outer: 0.6, asym: 1, wave: 0},
        {size: 'S', pts: [[-0.16, -0.54], [-0.28, -0.42], [-0.36, -0.28]], w: 0.13, z: 75.6, outer: 0.8, asym: 1, wave: 0, edge: true},
        // the lifted crown layers
        {size: 'S', pts: [[0.0, -0.62], [0.16, -0.72], [0.32, -0.72]], w: 0.15, z: 75.8, outer: 1, edge: true, wave: 0, asym: -1, m: 0.7},
        {size: 'S', pts: [[0.3, -0.6], [0.46, -0.6], [0.58, -0.48]], w: 0.13, z: 75.8, outer: 1, edge: true, wave: 0, asym: -1, m: 0.7},
        // the back locks behind the neck, to the collar
        {size: 'M', pts: [[0.4, 0.1], [0.5, 0.42], [0.52, 0.74], [0.6, 0.94]], w: 0.2, z: 19.5, outer: 1, edge: true, asym: -1},
        {size: 'M', pts: [[0.48, 0.0], [0.6, 0.3], [0.68, 0.56], [0.76, 0.72]], w: 0.16, z: 75.4, outer: 1, edge: true, asym: -1, hook: -12},
        {size: 'W', pts: [[0.1, -0.7], [0.3, -0.8], [0.48, -0.76]], w: 0.03, z: 75.9, rest: true, edge: true, wave: 0},
      ],
      term: [[0.16, -0.9], [0.28, -0.2], [0.34, 0.5], [0.4, 1.0]],
      crown: {c: [0.08, -0.04], r: [0.46, 0.5], a0: 224, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, 0.0],
      hem: 0.96,
    },
  },
};

// ================================================================ M4: the curly mop (low taper; ref 03's boy)
// 8-14 curl clumps, each a tapered lock bending into a hook at its tip, pointing out in 3-4 directions; 1-2 single
// curls above the crown; 2-3 gaps at the edge; the sides tighter, the nape clean; the curls bounce, never unwind.
export const M4: Cut = {
  id: 'M4',
  name: 'the curly mop',
  texture: 'curly',
  wave: {a0: 0.02, a1: 0.03, l0: 0.3, l1: 0.24, from: 0.2},
  motion: 'C4',
  mess: 3,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.52, 0.02], [-0.56, -0.24], [-0.46, -0.56], [-0.16, -0.74], [0.12, -0.76], [0.42, -0.6], [0.56, -0.28], [0.54, 0.02], [0.46, 0.22], [0.3, 0.3], [0.0, 0.32], [-0.3, 0.3], [-0.46, 0.22]],
      locks: [
        // clumps radiating from the crown, each ending in a hook
        {size: 'M', pts: [[-0.1, -0.5], [-0.3, -0.66], [-0.52, -0.66]], w: 0.2, z: 77.2, outer: 1, edge: true, hook: -115, hookFrom: 0.58, asym: 1, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.06, -0.52], [0.1, -0.74], [0.0, -0.9]], w: 0.2, z: 77.3, outer: 1, edge: true, hook: -115, hookFrom: 0.58, asym: 1, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.2, -0.46], [0.42, -0.6], [0.6, -0.56]], w: 0.19, z: 77.25, outer: 1, edge: true, hook: 115, hookFrom: 0.58, asym: -1, wave: 0, hang: 0.2},
        {size: 'M', pts: [[-0.3, -0.3], [-0.54, -0.32], [-0.68, -0.2]], w: 0.18, z: 77.1, outer: 1, edge: true, hook: -110, hookFrom: 0.58, asym: 1, wave: 0, hang: 0.3},
        {size: 'M', pts: [[0.34, -0.26], [0.56, -0.24], [0.7, -0.1]], w: 0.18, z: 77.1, outer: 1, edge: true, hook: 110, hookFrom: 0.58, asym: -1, wave: 0, hang: 0.3},
        {size: 'S', pts: [[-0.36, -0.04], [-0.52, 0.06], [-0.6, 0.2]], w: 0.13, z: 77.0, outer: 1, edge: true, hook: -100, hookFrom: 0.55, asym: 1, wave: 0},
        {size: 'S', pts: [[0.38, -0.02], [0.52, 0.08], [0.6, 0.22]], w: 0.13, z: 77.0, outer: 1, edge: true, hook: 100, hookFrom: 0.55, asym: -1, wave: 0},
        {size: 'S', pts: [[-0.14, -0.2], [-0.24, -0.04], [-0.24, 0.12]], w: 0.13, z: 77.4, outer: 0.4, hook: 105, hookFrom: 0.55, wave: 0},
        {size: 'S', pts: [[0.16, -0.2], [0.24, -0.02], [0.22, 0.14]], w: 0.13, z: 77.45, outer: 0.4, hook: -105, hookFrom: 0.55, wave: 0},
        {size: 'S', pts: [[-0.02, -0.08], [-0.02, 0.1], [0.06, 0.24]], w: 0.12, z: 77.5, outer: 0.3, hook: -110, hookFrom: 0.55, wave: 0, lod: 2},
        // single-curl flyaways above the crown
        {size: 'W', pts: [[0.24, -0.66], [0.36, -0.86], [0.3, -0.98]], w: 0.034, z: 77.8, rest: true, edge: true, hook: -230, hookFrom: 0.3, wave: 0},
        {size: 'W', pts: [[-0.3, -0.62], [-0.44, -0.8], [-0.38, -0.92]], w: 0.03, z: 77.8, edge: true, hook: 220, hookFrom: 0.3, wave: 0, only: ['breeze', 'turn', 'walk']},
      ],
      gaps: [{pts: [[0.42, -0.42], [0.5, -0.4], [0.58, -0.42, 1], [0.5, -0.34]], lod: 3}],
      term: [[0.12, -0.95], [0.2, -0.3], [0.2, 0.4]],
      crown: {c: [0, 0.0], r: [0.5, 0.56], a0: 200, a1: 262, th: 0.04, n: 2},
      pivot: [0, -0.35],
      hem: 0.3,
      hang: 0.1,
    },
    q: {
      massZ: 75,
      mass: [[-0.44, -0.3], [-0.42, -0.6], [-0.12, -0.78], [0.22, -0.78], [0.52, -0.6], [0.64, -0.3], [0.6, 0.02], [0.5, 0.24], [0.4, 0.24], [0.37, 0.04], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.12, -0.22], [0.0, -0.32], [-0.16, -0.36], [-0.32, -0.32]],
      locks: [
        // the fringe's curl hooks over the brow
        {size: 'M', pts: [[0.0, -0.6], [-0.16, -0.46], [-0.24, -0.3]], w: 0.18, z: 75.7, outer: 0.7, edge: true, hook: 105, hookFrom: 0.55, wave: 0},
        {size: 'M', pts: [[-0.2, -0.62], [-0.38, -0.52], [-0.48, -0.36]], w: 0.17, z: 75.6, outer: 0.9, edge: true, hook: 105, hookFrom: 0.55, wave: 0},
        {size: 'S', pts: [[0.16, -0.56], [0.06, -0.4], [0.0, -0.26]], w: 0.13, z: 75.75, outer: 0.5, hook: 100, hookFrom: 0.55, wave: 0},
        // the crown's clumps pointing up and out
        {size: 'M', pts: [[0.1, -0.64], [0.12, -0.86], [0.02, -0.98]], w: 0.2, z: 75.8, outer: 1, edge: true, hook: -115, hookFrom: 0.58, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.3, -0.6], [0.5, -0.74], [0.66, -0.66]], w: 0.19, z: 75.8, outer: 1, edge: true, hook: 115, hookFrom: 0.58, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.46, -0.36], [0.66, -0.36], [0.78, -0.22]], w: 0.18, z: 75.7, outer: 1, edge: true, hook: 110, hookFrom: 0.58, wave: 0, hang: 0.3},
        {size: 'S', pts: [[0.46, -0.06], [0.6, 0.04], [0.66, 0.18]], w: 0.13, z: 75.6, outer: 1, edge: true, hook: 100, hookFrom: 0.55, wave: 0},
        {size: 'S', pts: [[0.3, -0.36], [0.38, -0.2], [0.36, -0.06]], w: 0.13, z: 75.9, outer: 0.4, hook: -105, hookFrom: 0.55, wave: 0, lod: 2},
        {size: 'W', pts: [[0.2, -0.74], [0.3, -0.94], [0.24, -1.06]], w: 0.034, z: 75.95, rest: true, edge: true, hook: -230, hookFrom: 0.3, wave: 0},
        {size: 'W', pts: [[-0.3, -0.66], [-0.44, -0.84], [-0.38, -0.96]], w: 0.03, z: 75.95, edge: true, hook: 220, hookFrom: 0.3, wave: 0, only: ['breeze', 'turn', 'walk']},
      ],
      term: [[0.18, -0.95], [0.3, -0.3], [0.34, 0.4]],
      crown: {c: [0.1, -0.04], r: [0.48, 0.52], a0: 226, a1: 290, th: 0.04, n: 2},
      pivot: [0.2, -0.35],
      hem: 0.24,
      hang: 0.1,
    },
    p: {
      massZ: 56,
      mass: [[-0.38, -0.32], [-0.36, -0.6], [-0.08, -0.78], [0.3, -0.76], [0.6, -0.56], [0.72, -0.24], [0.66, 0.06], [0.54, 0.26], [0.36, 0.32], [0.24, 0.24], [0.2, 0.02], [0.1, -0.06], [0.04, 0.06, 1], [0.0, -0.18], [-0.16, -0.3], [-0.3, -0.28]],
      locks: [
        {size: 'M', pts: [[-0.1, -0.6], [-0.3, -0.5], [-0.42, -0.34]], w: 0.17, z: 56.5, outer: 0.8, edge: true, hook: 105, hookFrom: 0.55, wave: 0},
        {size: 'M', pts: [[0.12, -0.64], [0.14, -0.86], [0.04, -0.98]], w: 0.2, z: 56.6, outer: 1, edge: true, hook: -115, hookFrom: 0.58, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.4, -0.58], [0.62, -0.7], [0.78, -0.6]], w: 0.19, z: 56.6, outer: 1, edge: true, hook: 115, hookFrom: 0.58, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.56, -0.24], [0.76, -0.2], [0.86, -0.04]], w: 0.18, z: 56.55, outer: 1, edge: true, hook: 110, hookFrom: 0.58, wave: 0, hang: 0.3},
        {size: 'S', pts: [[0.52, 0.06], [0.64, 0.18], [0.66, 0.32]], w: 0.13, z: 56.5, outer: 1, edge: true, hook: 100, hookFrom: 0.55, wave: 0},
        {size: 'S', pts: [[0.24, -0.36], [0.34, -0.2], [0.32, -0.06]], w: 0.13, z: 56.7, outer: 0.4, hook: -105, hookFrom: 0.55, wave: 0, lod: 2},
        {size: 'W', pts: [[0.24, -0.72], [0.34, -0.92], [0.28, -1.04]], w: 0.034, z: 56.8, rest: true, edge: true, hook: -230, hookFrom: 0.3, wave: 0},
      ],
      term: [[0.18, -0.95], [0.26, -0.3], [0.3, 0.4]],
      crown: {c: [0.1, -0.04], r: [0.5, 0.54], a0: 210, a1: 270, th: 0.04, n: 2},
      pivot: [0.3, -0.35],
      hem: 0.3,
      hang: 0.1,
    },
  },
};

// ================================================================ M5: twists on a taper
// 8-14 short twists, rounded-pointed tufts pointing up and out, unequal; the sides faded close with a soft hairline;
// sheen on the tips facing the key; the twists tremble, nothing swings.
export const M5: Cut = {
  id: 'M5',
  name: 'twists on a taper',
  texture: 'coily',
  motion: 'C0',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.06, 0.02), [0.42, 0.2], [0.3, 0.3], [0.0, 0.33], [-0.3, 0.3], [-0.43, 0.2]],
      locks: [
        {size: 'S', pts: [[-0.36, -0.34], [-0.46, -0.44]], w: 0.1, z: 77.1, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[-0.22, -0.46], [-0.27, -0.6]], w: 0.11, z: 77.2, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[-0.06, -0.5], [-0.07, -0.66]], w: 0.12, z: 77.3, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.1, -0.5], [0.13, -0.62]], w: 0.11, z: 77.25, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.25, -0.44], [0.33, -0.57]], w: 0.11, z: 77.2, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.37, -0.32], [0.47, -0.38]], w: 0.09, z: 77.1, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[-0.14, -0.32], [-0.18, -0.44]], w: 0.09, z: 77.4, outer: 0.5, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.18, -0.32], [0.22, -0.43]], w: 0.09, z: 77.4, outer: 0.5, hang: 0, swell: 0.45, m: 0.5},
      ],
      term: [[0.1, -0.9], [0.16, -0.2], [0.18, 0.5]],
      pivot: [0, -0.2],
      hem: 0.33,
      hang: 0,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.32], [-0.3, -0.56], [0.0, -0.6], [0.3, -0.56], [0.48, -0.38], [0.52, -0.1], [0.48, 0.14], [0.4, 0.26], [0.38, 0.06], [0.32, -0.11], [0.22, -0.12], [0.18, 0.02], [0.15, 0.06, 1], [0.13, -0.2], [0.02, -0.3], [-0.16, -0.32], [-0.32, -0.3]],
      locks: [
        {size: 'S', pts: [[-0.3, -0.44], [-0.4, -0.54]], w: 0.1, z: 75.6, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[-0.12, -0.52], [-0.15, -0.67]], w: 0.11, z: 75.7, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.06, -0.54], [0.09, -0.69]], w: 0.12, z: 75.75, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.24, -0.5], [0.31, -0.63]], w: 0.11, z: 75.7, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[0.4, -0.36], [0.5, -0.44]], w: 0.1, z: 75.6, outer: 1, edge: true, hang: 0, swell: 0.45, m: 0.5},
        {size: 'S', pts: [[-0.02, -0.38], [-0.04, -0.5]], w: 0.09, z: 75.85, outer: 0.5, hang: 0, swell: 0.45, m: 0.5},
      ],
      term: [[0.16, -0.9], [0.28, -0.2], [0.32, 0.4]],
      pivot: [0.2, -0.2],
      hem: 0.26,
      hang: 0,
    },
  },
};

export const CUTS: Record<string, Cut> = {W1, W2, W3, W4, W5, W6, W7, M1, M2, M3, M4, M5};
