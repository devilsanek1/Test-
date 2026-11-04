// HAIR v3 (RECIPE.md "v3 (after the owner's note)"): the CUTS redesigned as a stylist cuts them. The owner on the v2
// heads: "incoherent ... not a proper haircut ... like a person woke up ... not stylish and not clean". v3 per head:
//   - THE CUT FIRST: the base mass carries the cut's whole silhouette (a flipped jaw bob, a long fall with a soft V, a
//     swept-back crop); 2-5 BIG SHAPES (B and M panels) fill it, all riding the mass (they lean with the whole shape
//     in the air, never scattering into strands); only accents (an outer flip, a wisp) lift on top;
//   - ONE FLOW from the parting and the crown: neighbouring shapes run nearly parallel; no crossing lock;
//   - A CLEAN HEM: the tips few and ALIKE per cut (all flipping out, or all tapering down into a V), at designed heights;
//   - INNER DETAIL: the head's one shadow shape (the terminator), one sheen per big shape (placed by the data), 1-3 thin
//     GROOVES (shade lines along the flow between big shapes) instead of a shade edge and dashes on every lock;
//   - THE LIFE AS A TOUCH: 0-1 placed loose bit at rest (a flyaway over the crown on the key side), 1-2 in the air;
//   - BROAD WAVES IN PHASE: under one wave per length (wavelength 1.5-2 u), every shape's wave starting at the same
//     height, so their edges stay parallel.
// Same coordinates and z as cuts.ts (head units, y down, the crown -0.5, the chin 0.5; z: back 18-20, far curtain 56,
// mass 75-76, panels 76-77.5, grooves 77.6, wisps 77.8). The ids match cuts.ts, so a look switches by version.
import type {V2} from '../graphic/geo';
import type {MP, Wave} from './lock';
import type {Cut, LockDef, Extra} from './cuts';

/** A groove: a thin tapered shade line along the flow between two big shapes (>= 1.5 px at film size), waving with
 *  them (the S size's wave factor 0.75 is undone by wave 1.33). */
const groove = (pts: V2[], z = 77.6, w = 0.066): LockDef => ({size: 'S', pts, w, z, tone: 'shade', root: 0.3, m: 1.15, k: 1.7, swell: 0.2, shade: 0, sheen: false, wave: 1.33});
/** The one flyaway at rest: a single thin arc hugging the crown on the key side (rooted inside the mass, leaving it
 *  gradually), never an antenna. */
const flyB = (z = 77.8): LockDef => ({size: 'W', pts: [[-0.04, -0.56], [-0.24, -0.57], [-0.41, -0.48], [-0.51, -0.33]], w: 0.032, z, rest: true, edge: true, wave: 0, free: true, air: 1.2});
const flyQ = (z = 56.5): LockDef => ({size: 'W', pts: [[-0.02, -0.59], [-0.2, -0.61], [-0.36, -0.55], [-0.46, -0.42]], w: 0.032, z, rest: true, edge: true, wave: 0, free: true, air: 1.2});
const flyP = (z = 56.8): LockDef => ({size: 'W', pts: [[0.16, -0.59], [-0.03, -0.62], [-0.2, -0.58], [-0.32, -0.48]], w: 0.032, z, rest: true, edge: true, wave: 0, free: true, air: 1.2});
/** Wisps in the air only (a breeze, a turn): streaming from the downwind temple and the ends. */
const airWisp = (pts: V2[], z = 77.8, only: LockDef['only'] = ['breeze', 'turn']): LockDef => ({size: 'W', pts, w: 0.03, z, edge: true, wave: 0.5, only, free: true});

/** The far curtain in 3/4 (from a centre-ish parting over the far temple to the cheekbone; over the face's far side). */
const FAR = (tipY = 0.18, part: [number, number] = [-0.13, -0.5]): Extra => ({
  name: 'far',
  pts: [[part[0], part[1], 1], [-0.33, -0.55], [-0.48, -0.37], [-0.53, -0.1], [-0.51, tipY - 0.11], [-0.45, tipY, 1], [-0.42, 0.0], [-0.32, -0.2], [-0.21, -0.38]],
  z: 56,
  crown: {c: [0, -0.02], r: [0.5, 0.5], a0: 224, a1: 256, th: 0.045, n: 1},
  bend: false,
  edge: true,
});
/** The profile cap with the curtain tucked behind the lash (LASH). */
const CAP: MP[] = [[-0.34, -0.44], [0.0, -0.6], [0.42, -0.49], [0.61, -0.2], [0.63, 0.14], [0.55, 0.42], [0.36, 0.55], [0.13, 0.48], [0.03, 0.33], [-0.05, 0.17], [-0.15, 0.085], [-0.24, 0.1, 1], [-0.29, 0.03], [-0.36, -0.09], [-0.4, -0.31]];
/** The 3/4 mass for longer cuts with a centre part (the crown and the back of the head; its hem hides behind the
 *  shapes; its front edge is the hairline down the near temple). */
const MASS_Q = (hem = 0.98): MP[] => [[-0.13, -0.5, 1], [0.06, -0.6], [0.36, -0.51], [0.55, -0.26], [0.58, 0.04], [0.56, 0.36], [0.6, 0.72], [0.6, hem], [0.44, hem - 0.06], [0.3, hem], [0.22, 0.7], [0.15, 0.42], [0.09, 0.2], [0.06, 0.0], [0.03, -0.19], [-0.03, -0.34], [-0.09, -0.45]];
const PART_Q: MP[] = [[-0.32, -0.548], [0.05, -0.597], [-0.1, -0.43, 1], [-0.16, -0.43]];
const CROWN_B = {c: [0, 0.04] as V2, r: [0.45, 0.51] as [number, number], a0: 192, a1: 276, th: 0.045, n: 2};
const CROWN_Q = {c: [0.08, -0.02] as V2, r: [0.45, 0.49] as [number, number], a0: 218, a1: 300, th: 0.045, n: 2};
const CROWN_P = {c: [0.08, 0.0] as V2, r: [0.47, 0.51] as [number, number], a0: 198, a1: 282, th: 0.045, n: 2};
/** A short back-view crown (the skull plus `top` above and `side` beside it), left temple over the top to the right. */
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

// ================================================================ W3: long layers with curtain bangs (her)
// The cut: a long fall to the shoulder blades, fuller toward the ends, ending in a soft V of five tips all tapering
// down (the middle lowest, a touch off-centre); curtain bangs from a centre part sweeping back to the cheekbones; one
// broad 2A wave. Big shapes from behind: three panels down the back and the two outer lengths; two grooves.
const LONG: Wave = {a0: 0.028, a1: 0.05, l0: 1.9, l1: 1.5, from: 0.25};
export const W3: Cut = {
  id: 'W3',
  gen: 3,
  name: 'long layers, curtain bangs',
  texture: 'wavy',
  wave: LONG,
  motion: 'C3',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.47, -0.14], [-0.38, -0.46], [0.0, -0.6], [0.39, -0.47], [0.5, -0.15], [0.53, 0.2], [0.56, 0.55], [0.58, 0.9], [0.56, 1.16], [0.42, 1.34], [0.22, 1.48], [0.0, 1.58], [-0.22, 1.5], [-0.42, 1.34], [-0.57, 1.14], [-0.58, 0.9], [-0.55, 0.52], [-0.5, 0.16]],
      locks: [
        // the outer lengths over the shoulders (the silhouette's sides), tips tapering down and in
        {size: 'M', pts: [[-0.38, 0.08], [-0.52, 0.55], [-0.55, 1.0], [-0.47, 1.4]], w: 0.3, z: 76.6, outer: 1, edge: true, asym: 0.5, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.4, 0.1], [0.53, 0.57], [0.56, 1.02], [0.48, 1.44]], w: 0.3, z: 76.6, outer: 1, edge: true, asym: -0.5, k: 2.2, m: 0.72, accent: true},
        // three panels down the back: the V of the hem (the middle lowest, a touch left of centre)
        {size: 'B', pts: [[-0.2, 0.0], [-0.26, 0.6], [-0.26, 1.15], [-0.2, 1.6]], w: 0.42, z: 77, outer: 0.4, asym: 0.5, k: 2.2, m: 0.72, sheen: false},
        {size: 'B', pts: [[0.24, 0.02], [0.3, 0.62], [0.3, 1.15], [0.23, 1.6]], w: 0.4, z: 77.1, outer: 0.4, asym: -0.5, k: 2.2, m: 0.72, sheen: false},
        {size: 'B', pts: [[0.02, 0.04], [0.02, 0.64], [0.0, 1.2], [-0.03, 1.74]], w: 0.42, z: 77.2, outer: 0.2, k: 2.2, m: 0.72, sheen: false},
        // two grooves along the flow, between the panels
        groove([[-0.36, 0.3], [-0.42, 0.75], [-0.42, 1.12], [-0.36, 1.44]], 77.6, 0.058),
        groove([[-0.09, 0.2], [-0.12, 0.72], [-0.13, 1.2], [-0.11, 1.62]], 77.6, 0.058),
        flyB(),
        airWisp([[0.47, -0.18], [0.58, 0.2], [0.62, 0.62]], 77.8, ['breeze', 'turn', 'walk']),
        airWisp([[0.5, 1.0], [0.6, 1.35], [0.6, 1.7]]),
      ],
      term: [[0.12, -0.7], [0.16, -0.2], [0.21, 0.35], [0.21, 0.85], [0.22, 1.3], [0.2, 1.9]],
      crown: CROWN_B,
      pivot: [0, 0.3],
      hem: 1.74,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.32, 0.3], [-0.34, 0.75], [-0.3, 1.02, 1], [0.0, 1.04], [0.3, 1.1, 1], [0.56, 1.0], [0.63, 0.55], [0.58, 0.0], [0.32, -0.42]],
      mass: MASS_Q(),
      extra: [FAR(0.18)],
      locks: [
        // behind: the far length past the far jaw (it faces the key), the near length down the back (in shade)
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.4], [-0.5, 0.82], [-0.45, 1.12]], w: 0.26, z: 19, outer: 0.8, edge: true, asym: 0.4},
        {size: 'B', pts: [[0.5, 0.3], [0.7, 0.85], [0.75, 1.28], [0.68, 1.62]], w: 0.32, z: 19.5, tone: 'shade', outer: 1, asym: -0.4, edge: true},
        // in front: the near curtain sweeping back from the part into the face-framing length over the shoulder, and
        // the length over the near shoulder; both taper down, the V continued
        {size: 'B', pts: [[-0.05, -0.47], [0.12, -0.16], [0.21, 0.3], [0.27, 0.8], [0.3, 1.3]], w: 0.3, z: 75.4, outer: 0.3, asym: -0.3, k: 2.2, m: 0.72},
        {size: 'B', pts: [[0.42, 0.0], [0.54, 0.6], [0.54, 1.2], [0.48, 1.64]], w: 0.36, z: 74.8, outer: 0.6, asym: 0.3, k: 2.2, m: 0.72, edge: true, accent: true},
        groove([[0.36, 0.55], [0.42, 0.98], [0.42, 1.32], [0.39, 1.5]], 75.2),
        flyQ(),
        airWisp([[0.53, -0.12], [0.64, 0.24], [0.68, 0.6]], 75.9, ['breeze', 'turn', 'walk']),
      ],
      parting: PART_Q,
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.55], [0.44, 1.1], [0.46, 1.9]],
      crown: CROWN_Q,
      pivot: [0.4, 0.3],
      hem: 1.7,
    },
    p: {
      massZ: 56,
      mass: CAP,
      extra: [
        // the fall: one long shape down the upper back, a gentle S on its back edge, the hem in two alike tips
        {name: 'fall', pts: [[0.22, -0.42], [0.56, -0.34], [0.7, 0.0], [0.77, 0.4], [0.86, 0.8], [0.93, 1.12], [0.95, 1.34], [0.86, 1.5], [0.76, 1.46], [0.66, 1.4, 1], [0.58, 1.22], [0.49, 0.95], [0.37, 0.6], [0.26, 0.32]], z: 55, edge: true},
      ],
      locks: [
        // the length along the fall's back edge (the outline), and the layer by the ear (behind the lash)
        {size: 'B', pts: [[0.44, -0.15], [0.72, 0.36], [0.9, 0.95], [0.95, 1.34], [0.88, 1.62]], w: 0.32, z: 55.4, outer: 1, edge: true, asym: -0.3, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.1, 0.0], [0.2, 0.4], [0.24, 0.72], [0.21, 0.98]], w: 0.18, z: 56.5, outer: 0.2},
        groove([[0.42, 0.12], [0.58, 0.55], [0.71, 1.0], [0.75, 1.32]], 55.6),
        flyP(),
        airWisp([[0.62, 0.1], [0.78, 0.5], [0.86, 0.9]], 55.8, ['breeze', 'walk', 'turn']),
      ],
      term: [[0.2, -0.8], [0.28, 0.1], [0.4, 0.6], [0.6, 1.1], [0.72, 1.9]],
      crown: CROWN_P,
      pivot: [0.5, 0.3],
      hem: 1.6,
    },
  },
};

// ================================================================ W1: the flipped jaw bob (ref 03's girl)
// The cut: a jaw-length bob from a deep side part, the sides falling straight, then EVERY end flipping out at the jaw
// (one line of flips), the light side tucked behind the ear in 3/4. Big shapes: the crown, two side panels, the back.
const BOB: Wave = {a0: 0.012, a1: 0.02, l0: 1.6, l1: 1.4, from: 0.3};
export const W1: Cut = {
  id: 'W1',
  gen: 3,
  name: 'the flipped jaw bob',
  texture: 'straight',
  wave: BOB,
  motion: 'C1',
  mess: 1,
  ears: ['q'],
  views: {
    b: {
      massZ: 76,
      // the back hem: one smooth line, a touch lower at the sides where the flips begin
      mass: [[-0.47, -0.12], [-0.38, -0.47], [0.0, -0.59], [0.4, -0.46], [0.5, -0.12], [0.53, 0.18], [0.54, 0.4], [0.46, 0.52], [0.24, 0.55], [0.0, 0.56], [-0.24, 0.55], [-0.46, 0.52], [-0.54, 0.4], [-0.53, 0.16]],
      locks: [
        // the sides, flipping out at the jaw (left turns left and up, right turns right and up): the cut's signature
        {size: 'M', pts: [[-0.42, 0.0], [-0.52, 0.26], [-0.55, 0.44], [-0.64, 0.54]], w: 0.3, z: 76.6, outer: 1, edge: true, hook: 58, hookFrom: 0.6, m: 0.75, accent: true},
        {size: 'M', pts: [[0.44, 0.02], [0.53, 0.27], [0.56, 0.44], [0.65, 0.53]], w: 0.3, z: 76.6, outer: 1, edge: true, hook: -58, hookFrom: 0.6, m: 0.75, accent: true},
        groove([[-0.1, 0.0], [-0.12, 0.28], [-0.14, 0.5]], 77.6, 0.058),
        flyB(),
        airWisp([[0.3, 0.2], [0.46, 0.45], [0.62, 0.58]], 77.8),
      ],
      term: [[0.1, -0.7], [0.16, -0.1], [0.2, 0.4], [0.18, 0.9]],
      crown: CROWN_B,
      pivot: [0, -0.05],
      hem: 0.58,
    },
    q: {
      // the deep side part on the near side; the near side tucked behind the ear; the heavy side sweeping over the
      // crown to the far cheek, its end flipping out at the jaw
      massZ: 75,
      mass: [[0.0, -0.53, 1], [0.2, -0.58], [0.42, -0.47], [0.54, -0.2], [0.56, 0.12], [0.57, 0.38], [0.52, 0.5], [0.44, 0.46], [0.4, 0.34], [0.37, 0.16], [0.38, -0.02], [0.32, -0.13], [0.22, -0.15], [0.14, -0.27], [0.06, -0.42]],
      extra: [
        {name: 'far', pts: [[0.0, -0.53, 1], [-0.22, -0.6], [-0.44, -0.47], [-0.55, -0.2], [-0.55, 0.06], [-0.47, 0.2, 1], [-0.43, 0.02], [-0.34, -0.2], [-0.2, -0.38], [-0.08, -0.47]], z: 56, crown: {c: [0, 0.0], r: [0.5, 0.5], a0: 222, a1: 262, th: 0.045, n: 1}, bend: false, edge: true},
      ],
      locks: [
        // the far side's length along the far cheek to the jaw, flipping out (away from the face)
        {size: 'B', pts: [[-0.44, -0.05], [-0.5, 0.22], [-0.52, 0.44], [-0.6, 0.56]], w: 0.3, z: 19, outer: 0.7, edge: true, hook: 55, hookFrom: 0.6, m: 0.75},
        // the heavy side sweeping from the part over the far temple (one shape, one sheen)
        {size: 'M', pts: [[-0.04, -0.52], [-0.2, -0.38], [-0.36, -0.18], [-0.46, 0.06]], w: 0.17, z: 56.3, outer: 0.4, wave: 0},
        // the back behind the ear to the nape, flipping out at the jaw line
        {size: 'B', pts: [[0.44, -0.02], [0.52, 0.26], [0.55, 0.46], [0.66, 0.56]], w: 0.26, z: 75.5, outer: 1, edge: true, hook: -55, hookFrom: 0.6, m: 0.75, accent: true},
        airWisp([[-0.38, 0.3], [-0.5, 0.5], [-0.58, 0.64]], 56.4),
      ],
      parting: [[-0.2, -0.597], [0.18, -0.578], [0.04, -0.45, 1], [-0.01, -0.46]],
      term: [[0.18, -0.75], [0.3, 0.0], [0.36, 0.5], [0.4, 0.9]],
      crown: {c: [0.1, 0.0], r: [0.45, 0.49], a0: 226, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, -0.05],
      hem: 0.6,
    },
  },
};

// ================================================================ W2: the lob (shoulder length, one broad wave)
// The cut: to the shoulders, a soft middle part, one broad wave, the ends all flicking OUT a little at the shoulder
// line; one length lies forward in 3/4. Big shapes from behind: two panels, the two outer lengths.
const LOB: Wave = {a0: 0.03, a1: 0.045, l0: 1.6, l1: 1.3, from: 0.25};
export const W2: Cut = {
  id: 'W2',
  gen: 3,
  name: 'the lob',
  texture: 'wavy',
  wave: LOB,
  motion: 'C2',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.48, -0.12], [-0.39, -0.47], [0.0, -0.6], [0.4, -0.46], [0.52, -0.1], [0.56, 0.25], [0.58, 0.52], [0.56, 0.78], [0.36, 0.9], [0.0, 0.93], [-0.36, 0.9], [-0.56, 0.78], [-0.58, 0.5], [-0.53, 0.15]],
      locks: [
        {size: 'M', pts: [[-0.42, 0.04], [-0.55, 0.4], [-0.59, 0.72], [-0.64, 0.94]], w: 0.3, z: 76.6, outer: 1, edge: true, hook: 18, hookFrom: 0.7, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.44, 0.06], [0.57, 0.42], [0.6, 0.74], [0.65, 0.95]], w: 0.3, z: 76.6, outer: 1, edge: true, hook: -18, hookFrom: 0.7, k: 2.2, m: 0.72, accent: true},
        {size: 'B', pts: [[-0.12, 0.0], [-0.17, 0.45], [-0.18, 0.8], [-0.16, 1.05]], w: 0.5, z: 77, outer: 0.3, asym: 0.3, k: 2.2, m: 0.72},
        {size: 'B', pts: [[0.16, 0.02], [0.21, 0.46], [0.22, 0.8], [0.2, 1.03]], w: 0.48, z: 77.05, outer: 0.3, asym: -0.3, k: 2.2, m: 0.72},
        groove([[-0.36, 0.25], [-0.42, 0.6], [-0.44, 0.9]], 77.6, 0.058),
        groove([[-0.08, 0.15], [-0.1, 0.6], [-0.11, 1.0]], 77.6, 0.058),
        flyB(),
        airWisp([[0.46, -0.16], [0.58, 0.18], [0.64, 0.5]], 77.8, ['breeze', 'turn', 'walk']),
        airWisp([[0.5, 0.62], [0.62, 0.88], [0.66, 1.08]]),
      ],
      term: [[0.12, -0.7], [0.16, -0.2], [0.21, 0.3], [0.21, 0.7], [0.23, 1.2]],
      crown: CROWN_B,
      pivot: [0, 0.15],
      hem: 1.1,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.3, 0.7, 1], [0.0, 0.7], [0.3, 0.8, 1], [0.56, 0.74, 1], [0.62, 0.4], [0.58, 0.0], [0.32, -0.42]],
      mass: MASS_Q(0.64),
      extra: [FAR(0.18)],
      locks: [
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.35], [-0.5, 0.64], [-0.46, 0.86]], w: 0.26, z: 19, outer: 0.8, edge: true, asym: 0.4},
        {size: 'B', pts: [[0.5, 0.2], [0.67, 0.55], [0.72, 0.84], [0.75, 1.0]], w: 0.3, z: 19.5, tone: 'shade', outer: 1, edge: true, hook: -16, hookFrom: 0.7, k: 2.2, m: 0.72},
        // the length lying forward: from the part, framing the face in one broad S, onto the near collarbone,
        // its end flicking out like the rest
        {size: 'B', pts: [[0.04, -0.3], [0.2, 0.16], [0.32, 0.6], [0.33, 0.92], [0.38, 1.06]], w: 0.34, z: 76, outer: 0.5, hook: -16, hookFrom: 0.72, k: 2.2, m: 0.72},
        groove([[0.15, 0.1], [0.24, 0.5], [0.26, 0.82]], 76.2),
        flyQ(),
        airWisp([[0.53, -0.1], [0.64, 0.22], [0.68, 0.52]], 75.9, ['breeze', 'turn', 'walk']),
      ],
      parting: PART_Q,
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.5], [0.42, 1.2]],
      crown: CROWN_Q,
      pivot: [0.4, 0.2],
      hem: 1.04,
    },
    p: {
      massZ: 56,
      mass: CAP,
      extra: [
        {name: 'fall', pts: [[0.22, -0.42], [0.56, -0.32], [0.69, 0.05], [0.75, 0.42], [0.82, 0.72], [0.9, 0.92, 1], [0.74, 0.86], [0.66, 0.94, 1], [0.54, 0.7], [0.38, 0.5], [0.25, 0.3]], z: 55, edge: true},
      ],
      locks: [
        {size: 'B', pts: [[0.42, -0.15], [0.66, 0.3], [0.79, 0.7], [0.88, 0.98]], w: 0.28, z: 55.4, outer: 1, edge: true, hook: -16, hookFrom: 0.7, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.1, 0.0], [0.2, 0.36], [0.22, 0.66], [0.2, 0.9]], w: 0.17, z: 56.5, outer: 0.2},
        groove([[0.38, 0.12], [0.52, 0.48], [0.62, 0.78]], 55.6),
        flyP(),
        airWisp([[0.6, 0.1], [0.74, 0.42], [0.82, 0.74]], 55.8, ['breeze', 'walk', 'turn']),
      ],
      term: [[0.2, -0.8], [0.28, 0.1], [0.4, 0.6], [0.56, 1.2]],
      crown: CROWN_P,
      pivot: [0.5, 0.2],
      hem: 1.0,
    },
  },
};

// ================================================================ W4: the butterfly cut
// The cut: long at the back, a V of three tips; short layers framing the face that all flick AWAY from it (the
// wings), from behind two short outer layers flicking out at the cheek line.
const BUTTERFLY: Wave = {a0: 0.025, a1: 0.045, l0: 1.8, l1: 1.4, from: 0.25};
export const W4: Cut = {
  id: 'W4',
  gen: 3,
  name: 'the butterfly cut',
  texture: 'wavy',
  wave: BUTTERFLY,
  motion: 'C3',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.5, -0.12], [-0.4, -0.48], [0.0, -0.62], [0.41, -0.48], [0.54, -0.12], [0.6, 0.2], [0.6, 0.5], [0.58, 0.85], [0.52, 1.1], [0.3, 1.22], [0.0, 1.28], [-0.3, 1.22], [-0.52, 1.1], [-0.6, 0.85], [-0.61, 0.5], [-0.56, 0.15]],
      locks: [
        // the wings: the short outer layers flicking out at the cheek line (alike, mirrored)
        {size: 'M', pts: [[-0.26, -0.46], [-0.48, -0.2], [-0.58, 0.08], [-0.64, 0.26]], w: 0.26, z: 77.5, outer: 1, edge: true, hook: 22, hookFrom: 0.7, k: 2.2, m: 0.72, wave: 0, accent: true},
        {size: 'M', pts: [[0.28, -0.46], [0.49, -0.2], [0.59, 0.08], [0.65, 0.26]], w: 0.26, z: 77.5, outer: 1, edge: true, hook: -22, hookFrom: 0.7, k: 2.2, m: 0.72, wave: 0, accent: true},
        {size: 'M', pts: [[-0.4, 0.2], [-0.56, 0.66], [-0.57, 1.05], [-0.48, 1.36]], w: 0.28, z: 76.6, outer: 1, edge: true, asym: 0.5},
        {size: 'M', pts: [[0.42, 0.22], [0.58, 0.68], [0.58, 1.06], [0.49, 1.38]], w: 0.28, z: 76.6, outer: 1, edge: true, asym: -0.5},
        {size: 'B', pts: [[-0.16, 0.02], [-0.22, 0.6], [-0.22, 1.12], [-0.17, 1.52]], w: 0.42, z: 77, outer: 0.3, asym: 0.5},
        {size: 'B', pts: [[0.2, 0.04], [0.26, 0.62], [0.26, 1.12], [0.2, 1.52]], w: 0.4, z: 77.05, outer: 0.3, asym: -0.5},
        {size: 'B', pts: [[0.02, 0.06], [0.02, 0.64], [0.0, 1.16], [-0.02, 1.66]], w: 0.4, z: 77.1, outer: 0.2},
        groove([[-0.08, 0.2], [-0.11, 0.7], [-0.12, 1.2], [-0.11, 1.46]]),
        groove([[-0.36, 0.42], [-0.42, 0.8], [-0.42, 1.12], [-0.38, 1.3]]),
        flyB(),
        airWisp([[0.5, -0.1], [0.66, 0.24], [0.72, 0.6]], 77.8, ['breeze', 'turn', 'walk']),
      ],
      term: [[0.12, -0.7], [0.18, -0.2], [0.23, 0.35], [0.21, 0.85], [0.23, 1.7]],
      crown: {c: [0, 0.04], r: [0.46, 0.52], a0: 192, a1: 276, th: 0.045, n: 2},
      pivot: [0, 0.3],
      hem: 1.66,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.32, 0.75], [-0.28, 1.05, 1], [0.0, 1.0], [0.3, 1.1, 1], [0.6, 0.94, 1], [0.66, 0.5], [0.6, 0.0], [0.32, -0.42]],
      mass: MASS_Q(1.0),
      extra: [FAR(0.15)],
      locks: [
        {size: 'M', pts: [[-0.42, -0.02], [-0.5, 0.4], [-0.5, 0.82], [-0.45, 1.12]], w: 0.26, z: 19, outer: 0.8, edge: true, asym: 0.4},
        {size: 'B', pts: [[0.5, 0.3], [0.7, 0.85], [0.76, 1.28], [0.69, 1.58]], w: 0.32, z: 19.5, tone: 'shade', outer: 1, edge: true, asym: -0.4},
        // the two-tier face frame: the cheekbone wing and the chin wing, both flicking away from the face
        {size: 'M', pts: [[-0.06, -0.47], [0.08, -0.2], [0.14, 0.04], [0.25, 0.17]], w: 0.2, z: 75.6, outer: 0.4, wave: 0, hook: -40, hookFrom: 0.6},
        {size: 'M', pts: [[0.1, -0.28], [0.2, 0.1], [0.26, 0.4], [0.37, 0.55]], w: 0.22, z: 75.5, outer: 0.5, wave: 0, hook: -36, hookFrom: 0.62},
        {size: 'B', pts: [[0.38, 0.3], [0.53, 0.85], [0.5, 1.35], [0.47, 1.68]], w: 0.34, z: 76, outer: 0.6, edge: true, asym: 0.3, accent: true},
        groove([[0.42, 0.62], [0.47, 1.0], [0.45, 1.36]], 76.2),
        flyQ(),
      ],
      parting: PART_Q,
      term: [[0.18, -0.75], [0.32, 0.0], [0.38, 0.55], [0.44, 1.1], [0.46, 1.9]],
      crown: {c: [0.08, -0.02], r: [0.46, 0.5], a0: 218, a1: 300, th: 0.045, n: 2},
      pivot: [0.4, 0.3],
      hem: 1.68,
    },
  },
};

// ================================================================ W5: the soft shag
// The cut: a round crown of short layers (a halo, its ends all flicking out at the ear line), the lengths narrowing
// to the nape and flicking out at the collar; a curtain fringe in 3/4. Defined, never shaggy-messy: every tip turns
// out, mirrored side to side.
export const W5: Cut = {
  id: 'W5',
  gen: 3,
  name: 'the soft shag',
  texture: 'wavy',
  wave: {a0: 0.02, a1: 0.035, l0: 1.4, l1: 1.2, from: 0.3},
  motion: 'C1',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.56, -0.08], [-0.46, -0.5], [0.0, -0.68], [0.46, -0.52], [0.6, -0.1], [0.6, 0.25], [0.5, 0.55], [0.4, 0.8], [0.2, 0.92], [0.0, 0.94], [-0.2, 0.92], [-0.4, 0.8], [-0.5, 0.55], [-0.6, 0.25]],
      locks: [
        // the halo: the crown layers' ends flicking out at the ear line
        {size: 'M', pts: [[-0.12, -0.62], [-0.4, -0.46], [-0.58, -0.18], [-0.66, 0.06]], w: 0.28, z: 77.6, outer: 1, edge: true, wave: 0, hook: 24, hookFrom: 0.7, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.14, -0.62], [0.42, -0.46], [0.6, -0.18], [0.67, 0.06]], w: 0.28, z: 77.6, outer: 1, edge: true, wave: 0, hook: -24, hookFrom: 0.7, k: 2.2, m: 0.72, accent: true},
        // the lengths narrowing to the nape, flicking out at the collar
        {size: 'B', pts: [[-0.14, -0.02], [-0.22, 0.42], [-0.3, 0.8], [-0.42, 0.98]], w: 0.4, z: 76.8, outer: 0.4, hook: 36, hookFrom: 0.64},
        {size: 'B', pts: [[0.16, 0.0], [0.24, 0.43], [0.31, 0.8], [0.43, 0.97]], w: 0.38, z: 76.9, outer: 0.4, hook: -36, hookFrom: 0.64},
        {size: 'M', pts: [[0.01, 0.14], [0.01, 0.6], [0.0, 1.0]], w: 0.26, z: 77, outer: 0.2},
        groove([[-0.07, 0.12], [-0.1, 0.5], [-0.15, 0.86]]),
        groove([[-0.3, -0.36], [-0.48, -0.16], [-0.58, 0.02]], 77.7),
        flyB(),
      ],
      term: [[0.12, -0.7], [0.2, -0.2], [0.22, 0.4], [0.2, 1.1]],
      crown: {c: [0, -0.02], r: [0.5, 0.56], a0: 196, a1: 272, th: 0.045, n: 2},
      pivot: [0, 0.0],
      hem: 1.0,
    },
    q: {
      massZ: 75,
      backTone: 'shade',
      back: [[-0.2, -0.1], [-0.3, 0.3], [-0.28, 0.66, 1], [0.0, 0.62], [0.3, 0.74, 1], [0.5, 0.64, 1], [0.6, 0.3], [0.58, 0.0], [0.32, -0.42]],
      mass: [[-0.14, -0.52, 1], [0.06, -0.68], [0.4, -0.58], [0.62, -0.3], [0.68, 0.04], [0.64, 0.34], [0.58, 0.58], [0.44, 0.56], [0.32, 0.66], [0.24, 0.5], [0.16, 0.3], [0.1, 0.12], [0.06, -0.06], [0.0, -0.22], [-0.06, -0.36], [-0.1, -0.46]],
      extra: [
        // the curtain fringe, far side: one piece over the far brow to the cheekbone
        {name: 'far', pts: [[-0.14, -0.52, 1], [-0.34, -0.6], [-0.52, -0.42], [-0.58, -0.16], [-0.54, 0.06, 1], [-0.47, -0.1], [-0.38, -0.24], [-0.26, -0.38]], z: 56, crown: {c: [0, -0.02], r: [0.52, 0.52], a0: 226, a1: 256, th: 0.045, n: 1}, bend: false, edge: true},
      ],
      locks: [
        {size: 'M', pts: [[-0.44, 0.0], [-0.54, 0.3], [-0.54, 0.56], [-0.62, 0.72]], w: 0.24, z: 19, outer: 0.8, edge: true, hook: 30, hookFrom: 0.62},
        // the near curtain falling to the cheekbone, kicking out toward the ear; the cheek layer flicking out
        {size: 'M', pts: [[-0.08, -0.5], [0.02, -0.3], [0.08, -0.06], [0.2, 0.1]], w: 0.2, z: 75.6, outer: 0.5, wave: 0, hook: -38, hookFrom: 0.6},
        {size: 'B', pts: [[0.3, -0.2], [0.48, 0.12], [0.56, 0.42], [0.7, 0.58]], w: 0.3, z: 75.6, outer: 1, edge: true, hook: -30, hookFrom: 0.62, accent: true},
        {size: 'M', pts: [[0.22, 0.2], [0.32, 0.46], [0.42, 0.7]], w: 0.2, z: 75.8, outer: 0.7, hook: -20, hookFrom: 0.6},
        groove([[0.22, -0.3], [0.38, -0.02], [0.46, 0.3]], 76.1),
        flyQ(),
      ],
      parting: [[-0.32, -0.597], [0.04, -0.668], [-0.11, -0.47, 1], [-0.17, -0.46]],
      term: [[0.2, -0.8], [0.34, 0.0], [0.4, 0.5], [0.44, 1.0]],
      crown: {c: [0.08, -0.04], r: [0.48, 0.52], a0: 222, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, 0.0],
      hem: 0.8,
    },
  },
};

// ================================================================ W6: natural coils, the round cloud
// The cut: a round, shaped cloud (a stylist shapes it), wider at the top than at the jaw; lobes nearly even (1.3 : 1),
// none popping out; one single small curl at rest on the key side.
export const W6: Cut = {
  id: 'W6',
  gen: 3,
  name: 'natural coils, the round cloud',
  texture: 'coily',
  motion: 'C0',
  mess: 1,
  views: {},
  cloud: {
    b: {
      c: [0.0, -0.08],
      rx: 0.74,
      ry: 0.66,
      lobes: [
        [196, 0.52, 0.22],
        [222, 0.55, 0.23],
        [248, 0.57, 0.24],
        [274, 0.57, 0.24],
        [300, 0.55, 0.23],
        [326, 0.53, 0.22],
        [352, 0.52, 0.21],
        [18, 0.5, 0.2],
        [44, 0.47, 0.19],
        [136, 0.47, 0.19],
        [162, 0.5, 0.2],
      ],
      curls: [[232, 0.75, 0.17, 1], [300, 0.74, 0.16, -1]],
      term: [[0.14, -0.9], [0.22, -0.2], [0.2, 0.6]],
      z: 76,
    },
    q: {
      c: [0.16, -0.12],
      rx: 0.72,
      ry: 0.64,
      lobes: [
        [188, 0.5, 0.21],
        [214, 0.55, 0.23],
        [240, 0.58, 0.24],
        [266, 0.59, 0.24],
        [292, 0.57, 0.23],
        [318, 0.55, 0.22],
        [344, 0.54, 0.22],
        [10, 0.52, 0.21],
        [36, 0.5, 0.2],
        [62, 0.47, 0.19],
      ],
      curls: [[226, 0.77, 0.17, 1], [290, 0.75, 0.16, -1]],
      term: [[0.22, -0.9], [0.32, -0.2], [0.36, 0.6]],
      z: 75,
      hairline: [[-1.2, -0.26], [-0.44, -0.26], [-0.38, -0.33], [-0.27, -0.37], [-0.16, -0.355], [-0.04, -0.38], [0.08, -0.34], [0.15, -0.22], [0.18, -0.06], [0.2, 0.12], [0.26, 0.3], [0.2, 1.4], [-1.2, 1.4]],
    },
  },
};

// ================================================================ W7: the soft pixie (a bixie)
// The cut: the top swept from a side part across the crown and forward in one flow; the fringe one wide piece across
// the brow; the nape tapered into three alike points pointing down and in; the ears out.
export const W7: Cut = {
  id: 'W7',
  gen: 3,
  name: 'the soft pixie',
  texture: 'straight',
  motion: 'C1',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.12, 0.05), [0.44, 0.22], [0.34, 0.34], [0.18, 0.4], [0.0, 0.42], [-0.18, 0.4], [-0.34, 0.34], [-0.44, 0.2]],
      locks: [
        // the swept top: two big shapes from the part (left) across the crown and down to the nape
        {size: 'B', pts: [[-0.24, -0.5], [0.0, -0.4], [0.16, -0.12], [0.18, 0.22], [0.12, 0.46]], w: 0.4, z: 77, outer: 0.5, asym: -0.5, m: 0.7},
        {size: 'B', pts: [[-0.3, -0.36], [-0.3, -0.06], [-0.24, 0.22], [-0.14, 0.46]], w: 0.36, z: 76.9, outer: 0.5, asym: 0.4, m: 0.7},
        {size: 'M', pts: [[0.32, -0.38], [0.44, -0.12], [0.44, 0.12], [0.34, 0.36]], w: 0.24, z: 76.8, outer: 1, edge: true, asym: -0.4, m: 0.7, accent: true},
        groove([[-0.12, -0.3], [-0.06, -0.02], [-0.01, 0.28]], 77.6, 0.06),
        flyB(),
      ],
      term: [[0.1, -0.8], [0.16, -0.2], [0.18, 0.6]],
      crown: {c: [0, 0.04], r: [0.44, 0.5], a0: 194, a1: 276, th: 0.045, n: 2},
      pivot: [0, -0.1],
      hem: 0.46,
      hang: 0.3,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.36], [-0.3, -0.58], [0.0, -0.66], [0.32, -0.6], [0.52, -0.38], [0.56, -0.1], [0.52, 0.16], [0.46, 0.34, 1], [0.38, 0.28], [0.36, 0.1], [0.37, -0.03], [0.3, -0.13], [0.2, -0.12], [0.16, -0.24], [0.06, -0.3], [-0.12, -0.3], [-0.3, -0.26]],
      locks: [
        // the fringe: one wide piece swept across the brow toward the far side, its tip at the far temple
        {size: 'B', pts: [[0.24, -0.6], [0.02, -0.56], [-0.2, -0.44], [-0.38, -0.27]], w: 0.3, z: 75.7, outer: 0.8, edge: true, wave: 0, asym: 0.5, k: 2.2, m: 0.75},
        // the side swept back over the ear to the nape
        {size: 'M', pts: [[0.3, -0.3], [0.44, -0.08], [0.48, 0.14], [0.44, 0.36]], w: 0.22, z: 75.5, outer: 0.6, wave: 0, asym: -0.4, m: 0.75},
        groove([[0.18, -0.46], [0.0, -0.44], [-0.2, -0.36]], 75.8, 0.055),
        flyQ(75.9),
      ],
      term: [[0.18, -0.8], [0.3, 0.0], [0.34, 0.6]],
      crown: {c: [0.08, -0.04], r: [0.45, 0.49], a0: 220, a1: 298, th: 0.045, n: 2},
      pivot: [0.2, -0.1],
      hem: 0.4,
      hang: 0.3,
    },
  },
};

// ================================================================ M1: the swept-back crop (refs 03's boy and 04)
// The v2 textured crop's tufts pointed every way off a dome (dark flames). v3: the top's locks all sweep BACK from the
// hairline in one fan, lying on the head (0.06-0.12 u above it), leaf-shaped, their tips trailing back alike; the
// sides short and clean, the ears out.
export const M1: Cut = {
  id: 'M1',
  gen: 3,
  name: 'the swept-back crop',
  texture: 'straight',
  motion: 'C0',
  mess: 1,
  views: {
    b: {
      // from behind: the swept top's ends come over the crown and lie down the back of the head toward the nape
      massZ: 76,
      mass: [...crownB(0.1, 0.04), [0.44, 0.2], [0.34, 0.3], [0.16, 0.34], [0.0, 0.35], [-0.18, 0.34], [-0.34, 0.3], [-0.45, 0.2]],
      locks: [
        {size: 'B', pts: [[-0.05, -0.46], [-0.11, -0.24], [-0.13, 0.02], [-0.11, 0.24]], w: 0.36, z: 77, outer: 0.5, asym: 0.3, k: 2.2, m: 0.72, hang: 0},
        {size: 'B', pts: [[0.15, -0.45], [0.2, -0.22], [0.2, 0.02], [0.15, 0.24]], w: 0.34, z: 77.05, outer: 0.5, asym: -0.3, k: 2.2, m: 0.72, hang: 0},
        {size: 'M', pts: [[-0.27, -0.38], [-0.38, -0.16], [-0.41, 0.06], [-0.36, 0.22]], w: 0.24, z: 76.9, outer: 1, asym: 0.3, k: 2.2, m: 0.72, hang: 0},
        {size: 'M', pts: [[0.31, -0.36], [0.42, -0.14], [0.43, 0.06], [0.38, 0.21]], w: 0.24, z: 76.9, outer: 1, asym: -0.3, k: 2.2, m: 0.72, hang: 0},
        groove([[0.04, -0.36], [0.04, -0.1], [0.03, 0.16]], 77.6, 0.055),
      ],
      term: [[0.1, -0.9], [0.16, -0.2], [0.18, 0.5]],
      crown: {c: [0, 0.02], r: [0.46, 0.52], a0: 196, a1: 270, th: 0.04, n: 2},
      pivot: [0, -0.2],
      hem: 0.36,
      hang: 0,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.34], [-0.34, -0.58], [-0.04, -0.68], [0.3, -0.64], [0.52, -0.44], [0.57, -0.14], [0.53, 0.14], [0.44, 0.28], [0.38, 0.22], [0.37, 0.02], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.13, -0.2], [0.04, -0.3], [-0.16, -0.32], [-0.32, -0.3]],
      locks: [
        // the fan: four leaf-shaped locks from the front hairline, arcing back over the dome, the tips trailing back
        // past the crown's silhouette (the scallops of the top edge), neighbours nearly parallel
        {size: 'M', pts: [[-0.34, -0.4], [-0.16, -0.66], [0.14, -0.76], [0.42, -0.68], [0.6, -0.5]], w: 0.24, z: 75.8, outer: 1, edge: true, asym: -0.5, m: 0.9, hang: 0},
        {size: 'M', pts: [[-0.24, -0.34], [-0.04, -0.56], [0.24, -0.62], [0.48, -0.5], [0.64, -0.3]], w: 0.24, z: 75.7, outer: 1, edge: true, asym: -0.5, m: 0.9, hang: 0},
        {size: 'M', pts: [[-0.1, -0.3], [0.1, -0.46], [0.34, -0.46], [0.54, -0.3], [0.62, -0.1]], w: 0.22, z: 75.6, outer: 1, edge: true, asym: -0.5, m: 0.9, hang: 0},
        {size: 'M', pts: [[0.16, -0.24], [0.34, -0.3], [0.5, -0.2], [0.58, 0.04]], w: 0.18, z: 75.5, outer: 0.8, asym: -0.4, m: 0.9, hang: 0},
        groove([[-0.12, -0.48], [0.1, -0.58], [0.34, -0.56]], 75.85, 0.05),
      ],
      term: [[0.16, -0.9], [0.28, -0.2], [0.32, 0.4]],
      crown: {c: [0.08, -0.02], r: [0.48, 0.52], a0: 226, a1: 296, th: 0.04, n: 2},
      pivot: [0.2, -0.2],
      hem: 0.3,
      hang: 0,
    },
  },
};

// ================================================================ M2: the curtains (middle-part flow)
// The cut: from a centre part, two curtains to the cheekbones kicking back toward the ears; the back to the collar,
// its ends all flicking out (mirrored).
export const M2: Cut = {
  id: 'M2',
  gen: 3,
  name: 'the curtains',
  texture: 'straight',
  wave: {a0: 0.012, a1: 0.02, l0: 1.4, l1: 1.2, from: 0.3},
  motion: 'C2',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.47, -0.12], [-0.38, -0.48], [0.0, -0.6], [0.4, -0.47], [0.5, -0.12], [0.5, 0.16], [0.48, 0.4], [0.3, 0.5], [0.0, 0.52], [-0.3, 0.5], [-0.48, 0.4], [-0.5, 0.15]],
      locks: [
        {size: 'M', pts: [[-0.4, 0.0], [-0.49, 0.3], [-0.52, 0.5], [-0.59, 0.6]], w: 0.26, z: 76.6, outer: 1, edge: true, hook: 28, hookFrom: 0.66, k: 2.2, m: 0.72, accent: true},
        {size: 'M', pts: [[0.42, 0.02], [0.5, 0.3], [0.53, 0.49], [0.6, 0.59]], w: 0.26, z: 76.6, outer: 1, edge: true, hook: -28, hookFrom: 0.66, k: 2.2, m: 0.72, accent: true},
        {size: 'B', pts: [[-0.14, -0.12], [-0.19, 0.28], [-0.22, 0.58], [-0.27, 0.72]], w: 0.42, z: 77, outer: 0.4, hook: 16, hookFrom: 0.68, k: 2.2, m: 0.72},
        {size: 'B', pts: [[0.16, -0.1], [0.21, 0.28], [0.24, 0.56], [0.29, 0.7]], w: 0.4, z: 77.05, outer: 0.4, hook: -16, hookFrom: 0.68, k: 2.2, m: 0.72},
        groove([[0.01, -0.02], [0.0, 0.3], [0.0, 0.6]]),
        flyB(),
        airWisp([[0.44, 0.1], [0.56, 0.36], [0.64, 0.56]], 77.8, ['breeze', 'turn', 'walk']),
      ],
      term: [[0.1, -0.7], [0.16, -0.1], [0.2, 0.4], [0.2, 0.9]],
      crown: CROWN_B,
      pivot: [0, -0.05],
      hem: 0.72,
    },
    q: {
      massZ: 75,
      mass: [[-0.13, -0.52, 1], [0.06, -0.62], [0.36, -0.52], [0.54, -0.26], [0.57, 0.04], [0.56, 0.32], [0.58, 0.46], [0.5, 0.5], [0.42, 0.4], [0.38, 0.18], [0.36, 0.0], [0.3, -0.12], [0.22, -0.12], [0.16, -0.24], [0.06, -0.36], [-0.04, -0.44]],
      extra: [FAR(0.12, [-0.13, -0.52])],
      locks: [
        // the near curtain falls in an S to the cheekbone and kicks back toward the ear
        {size: 'M', pts: [[-0.08, -0.5], [0.02, -0.3], [0.08, -0.08], [0.18, 0.06]], w: 0.22, z: 75.6, outer: 0.5, wave: 0, hook: -40, hookFrom: 0.6},
        // the back to the collar, flicking out
        {size: 'B', pts: [[0.42, -0.02], [0.5, 0.28], [0.54, 0.48], [0.66, 0.6]], w: 0.26, z: 75.5, outer: 1, edge: true, hook: -40, hookFrom: 0.62, m: 0.75, accent: true},
        {size: 'M', pts: [[-0.44, 0.0], [-0.5, 0.26], [-0.5, 0.46], [-0.58, 0.58]], w: 0.22, z: 19, outer: 0.8, edge: true, hook: 36, hookFrom: 0.62, m: 0.75},
        groove([[0.3, 0.0], [0.4, 0.26], [0.44, 0.46]], 75.7, 0.055),
        flyQ(),
      ],
      parting: [[-0.32, -0.548], [0.05, -0.615], [-0.1, -0.45, 1], [-0.16, -0.45]],
      term: [[0.18, -0.75], [0.3, 0.0], [0.36, 0.5], [0.4, 0.9]],
      crown: CROWN_Q,
      pivot: [0.3, -0.05],
      hem: 0.62,
    },
  },
};

// ================================================================ M3: the modern mullet, soft
// The cut: the top short and swept back, the sides close above the ears, the back flowing to the collar in two
// panels with alike tips (a soft V); the stepped line one S from the crown to the nape.
export const M3: Cut = {
  id: 'M3',
  gen: 3,
  name: 'the soft mullet',
  texture: 'wavy',
  wave: {a0: 0.02, a1: 0.03, l0: 1.4, l1: 1.2, from: 0.3},
  motion: 'C2',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [...crownB(0.14, 0.05), [0.44, 0.25], [0.38, 0.5], [0.22, 0.62], [0.0, 0.66], [-0.22, 0.62], [-0.38, 0.5], [-0.46, 0.25]],
      locks: [
        {size: 'B', pts: [[-0.12, 0.0], [-0.16, 0.42], [-0.16, 0.8], [-0.1, 1.08]], w: 0.36, z: 77, outer: 0.4, asym: 0.5},
        {size: 'B', pts: [[0.14, 0.02], [0.18, 0.42], [0.18, 0.78], [0.12, 1.02]], w: 0.34, z: 77.05, outer: 0.4, asym: -0.5},
        {size: 'M', pts: [[-0.34, 0.06], [-0.4, 0.4], [-0.38, 0.7], [-0.3, 0.92]], w: 0.24, z: 76.9, outer: 0.8, edge: true, asym: 0.5, accent: true},
        {size: 'M', pts: [[0.36, 0.08], [0.42, 0.4], [0.4, 0.68], [0.32, 0.88]], w: 0.24, z: 76.9, outer: 0.8, edge: true, asym: -0.5, accent: true},
        groove([[0.01, 0.12], [0.0, 0.5], [0.0, 0.86]]),
        groove([[-0.28, -0.52], [-0.4, -0.3], [-0.44, -0.06]], 77.6, 0.055),
      ],
      term: [[0.1, -0.9], [0.16, -0.2], [0.2, 0.4], [0.18, 1.2]],
      crown: {c: [0, 0.0], r: [0.48, 0.54], a0: 196, a1: 272, th: 0.045, n: 2},
      pivot: [0, 0.1],
      hem: 1.08,
    },
    q: {
      massZ: 75,
      mass: [[-0.42, -0.34], [-0.32, -0.6], [0.0, -0.67], [0.34, -0.62], [0.54, -0.42], [0.6, -0.12], [0.57, 0.12], [0.5, 0.3], [0.4, 0.26], [0.37, 0.04], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.12, -0.2], [0.02, -0.3], [-0.16, -0.32], [-0.32, -0.3]],
      locks: [
        // the top swept back in two shapes lying on the dome, the tips trailing back over the crown
        {size: 'M', pts: [[-0.36, -0.36], [-0.12, -0.6], [0.2, -0.68], [0.5, -0.56]], w: 0.26, z: 75.8, outer: 1, edge: true, asym: -0.5, k: 2.2, m: 0.8, wave: 0},
        {size: 'M', pts: [[-0.2, -0.3], [0.04, -0.48], [0.32, -0.52], [0.56, -0.38]], w: 0.24, z: 75.7, outer: 1, edge: true, asym: -0.5, k: 2.2, m: 0.8, wave: 0},
        // the back: one wide shape behind the ear to the collar, its tip tapering down (the mullet's length, short)
        {size: 'B', pts: [[0.44, -0.04], [0.56, 0.26], [0.6, 0.52], [0.56, 0.76]], w: 0.3, z: 75.4, outer: 1, edge: true, asym: 0.3, k: 2.2, m: 0.72, accent: true},
        groove([[-0.04, -0.46], [0.2, -0.53], [0.42, -0.46]], 75.85, 0.05),
      ],
      term: [[0.16, -0.9], [0.28, -0.2], [0.34, 0.5], [0.4, 1.0]],
      crown: {c: [0.08, -0.04], r: [0.46, 0.5], a0: 224, a1: 296, th: 0.045, n: 2},
      pivot: [0.3, 0.0],
      hem: 0.76,
    },
  },
};

// ================================================================ M4: the curly top on a low taper (ref 03's sheet)
// The cut: curls on top, the sides tighter, the nape clean. The clumps are RADIAL from the crown and form only the
// silhouette (6-7 around the top and sides); every clump ends in a hook curling down and out, mirrored side to side
// (the left side curls left, the right side right); inside, the mass with the head's one shadow shape; one single curl
// above the crown.
const HK = 58;
export const M4: Cut = {
  id: 'M4',
  gen: 3,
  name: 'the curly top',
  texture: 'curly',
  motion: 'C4',
  mess: 1,
  views: {
    b: {
      massZ: 76,
      mass: [[-0.52, 0.02], [-0.56, -0.24], [-0.47, -0.56], [-0.16, -0.74], [0.12, -0.76], [0.43, -0.6], [0.56, -0.28], [0.54, 0.02], [0.46, 0.22], [0.3, 0.3], [0.0, 0.32], [-0.3, 0.3], [-0.46, 0.22]],
      locks: [
        {size: 'M', pts: [[-0.3, -0.36], [-0.54, -0.36], [-0.68, -0.22]], w: 0.22, z: 77.1, outer: 1, edge: true, hook: -HK, hookFrom: 0.55, wave: 0, hang: 0.3},
        {size: 'M', pts: [[-0.2, -0.52], [-0.38, -0.68], [-0.58, -0.66]], w: 0.22, z: 77.2, outer: 1, edge: true, hook: -HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[-0.04, -0.56], [-0.12, -0.78], [-0.3, -0.88]], w: 0.22, z: 77.3, outer: 1, edge: true, hook: -HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.1, -0.56], [0.18, -0.78], [0.36, -0.86]], w: 0.22, z: 77.3, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.24, -0.5], [0.44, -0.64], [0.62, -0.6]], w: 0.22, z: 77.2, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.34, -0.32], [0.57, -0.3], [0.7, -0.16]], w: 0.21, z: 77.1, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.3},
        groove([[0.02, -0.5], [0.02, -0.2], [0.0, 0.1]], 77.4, 0.06),
        {size: 'W', pts: [[0.14, -0.7], [0.22, -0.84], [0.18, -0.92]], w: 0.034, z: 77.8, rest: true, edge: true, hook: -160, hookFrom: 0.35, wave: 0, free: true},
      ],
      term: [[0.12, -0.95], [0.2, -0.3], [0.2, 0.4]],
      crown: {c: [0, 0.0], r: [0.5, 0.56], a0: 200, a1: 262, th: 0.04, n: 2},
      pivot: [0, -0.35],
      hem: 0.3,
      hang: 0.1,
    },
    q: {
      massZ: 75,
      mass: [[-0.44, -0.3], [-0.4, -0.56], [-0.12, -0.72], [0.22, -0.72], [0.5, -0.56], [0.62, -0.3], [0.6, 0.02], [0.5, 0.24], [0.4, 0.24], [0.37, 0.04], [0.32, -0.11], [0.22, -0.12], [0.18, 0.04], [0.15, 0.08, 1], [0.12, -0.22], [0.0, -0.32], [-0.16, -0.36], [-0.32, -0.32]],
      locks: [
        // radial from the crown (~(0.12, -0.42)): the face side curls down and under (hook -), the back curls down
        // and back (hook +); six clumps make the whole top silhouette
        {size: 'M', pts: [[-0.06, -0.5], [-0.26, -0.44], [-0.4, -0.28]], w: 0.21, z: 75.7, outer: 0.8, edge: true, hook: -HK, hookFrom: 0.55, wave: 0},
        {size: 'M', pts: [[0.0, -0.58], [-0.2, -0.74], [-0.42, -0.74]], w: 0.22, z: 75.75, outer: 1, edge: true, hook: -HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.12, -0.6], [0.1, -0.84], [-0.06, -0.96]], w: 0.22, z: 75.8, outer: 1, edge: true, hook: -HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.24, -0.6], [0.4, -0.82], [0.6, -0.84]], w: 0.22, z: 75.8, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.36, -0.46], [0.6, -0.56], [0.78, -0.46]], w: 0.21, z: 75.75, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.3},
        {size: 'M', pts: [[0.42, -0.26], [0.64, -0.24], [0.76, -0.08]], w: 0.2, z: 75.7, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.3},
        groove([[0.2, -0.46], [0.34, -0.34], [0.42, -0.16]], 75.85, 0.055),
        {size: 'W', pts: [[0.2, -0.76], [0.28, -0.9], [0.24, -0.98]], w: 0.034, z: 75.95, rest: true, edge: true, hook: -160, hookFrom: 0.35, wave: 0, free: true},
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
        {size: 'M', pts: [[-0.1, -0.62], [-0.28, -0.52], [-0.4, -0.36]], w: 0.2, z: 56.5, outer: 0.8, edge: true, hook: -HK, hookFrom: 0.55, wave: 0},
        {size: 'M', pts: [[0.14, -0.66], [0.22, -0.88], [0.4, -0.96]], w: 0.22, z: 56.6, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.4, -0.58], [0.62, -0.7], [0.8, -0.6]], w: 0.21, z: 56.6, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.2},
        {size: 'M', pts: [[0.56, -0.26], [0.76, -0.22], [0.88, -0.06]], w: 0.2, z: 56.55, outer: 1, edge: true, hook: HK, hookFrom: 0.55, wave: 0, hang: 0.3},
        groove([[0.24, -0.5], [0.4, -0.36], [0.5, -0.14]], 56.7, 0.055),
        {size: 'W', pts: [[0.24, -0.72], [0.32, -0.86], [0.28, -0.94]], w: 0.034, z: 56.8, rest: true, edge: true, hook: -160, hookFrom: 0.35, wave: 0, free: true},
      ],
      term: [[0.18, -0.95], [0.26, -0.3], [0.3, 0.4]],
      crown: {c: [0.1, -0.04], r: [0.5, 0.54], a0: 210, a1: 270, th: 0.04, n: 2},
      pivot: [0.3, -0.35],
      hem: 0.3,
      hang: 0.1,
    },
  },
};

// ================================================================ M5: the short coils (the TWA on a taper)
// v2's twists read as a row of blocks. v3: a compact, shaped cushion of small, even coils on top (one clean rounded
// shape with a softly lobed edge), the sides faded close, a crisp hairline in front.
export const M5: Cut = {
  id: 'M5',
  gen: 3,
  name: 'the short coils',
  texture: 'coily',
  motion: 'C0',
  mess: 1,
  views: {},
  cloud: {
    b: {
      c: [0.0, -0.16],
      rx: 0.56,
      ry: 0.46,
      lobes: [
        [186, 0.44, 0.13],
        [206, 0.46, 0.13],
        [226, 0.47, 0.13],
        [246, 0.48, 0.13],
        [266, 0.48, 0.13],
        [286, 0.48, 0.13],
        [306, 0.47, 0.13],
        [326, 0.46, 0.13],
        [346, 0.44, 0.13],
      ],
      curls: [],
      term: [[0.12, -0.9], [0.18, -0.2], [0.18, 0.5]],
      z: 76,
    },
    q: {
      c: [0.08, -0.2],
      rx: 0.56,
      ry: 0.46,
      lobes: [
        [184, 0.42, 0.12],
        [204, 0.45, 0.13],
        [224, 0.47, 0.13],
        [244, 0.48, 0.13],
        [264, 0.48, 0.13],
        [284, 0.48, 0.13],
        [304, 0.47, 0.13],
        [324, 0.46, 0.13],
        [344, 0.44, 0.13],
        [4, 0.42, 0.12],
      ],
      curls: [],
      term: [[0.16, -0.9], [0.28, -0.2], [0.32, 0.4]],
      z: 75,
      hairline: [[-1.2, -0.3], [-0.44, -0.3], [-0.36, -0.36], [-0.2, -0.38], [-0.04, -0.38], [0.1, -0.34], [0.18, -0.22], [0.26, -0.12], [0.36, -0.04], [0.48, 0.08], [0.5, 1.4], [-1.2, 1.4]],
    },
  },
};

export const CUTS3: Record<string, Cut> = {W1, W2, W3, W4, W5, W6, W7, M1, M2, M3, M4, M5};
