// PEOPLE v4, BODIES (docs/look/people_design/bodies_v4/NOTES.md): THE HANDS. Simple but real, never a paddle: a palm,
// ONE finger mass with one or two separations (index | middle, ring | little), the thumb as its own form with a notch at
// the web, the wrist narrower than the knuckles, the fingers in a relaxed curl (design_research.md H1-H3; "straights
// against curves": the back of the hand is the straight, the palm side and the curl the curves). Each hand is one of a
// few AUTHORED drawings in hand units (the wrist at 0, the fingertips toward +y, L = 1 the hand's length), picked and
// placed by the hand's 3D frame (skel5.ts Hand5: its axis, the palm's normal, the thumb) seen from the camera:
//   back    the back of the hand toward us (the thumb on +x)            palm   the same outline, the palm toward us
//   side    the thumb side toward us (+x = the palm side, the curl)      pinky  the little-finger side toward us
//   grip    a hand round a bar (+x = the palm side)                       flat   resting palm down, fingers long
//   flatside  resting on a surface seen edge-on (+x = the palm, on the surface)
// The separations and the thumb's inner edge are tapered value slivers (they read from ~40 px a hand and vanish at
// film size, where the silhouette carries it: the wrist's taper, the mass, the thumb's lobe).
import type {V2, V3} from '../graphic/geo';
import {toCam, proj, type Cam} from '../graphic/rig';
import {mixLab, type Tone} from '../graphic/color';
import {through, taper, type Seg} from './pen';
import {polySegs, type PartV4, type Region} from './paint';
import type {Hand5} from './skel5';

type HandView = 'back' | 'palm' | 'side' | 'pinky' | 'grip' | 'flat' | 'flatside';
type Design = {out: V2[]; seps: V2[][]; sepW: number[]};

const BACK: Design = {
  out: [
    [-0.122, -0.14],
    [-0.13, 0.04],
    [-0.16, 0.2],
    [-0.184, 0.37],
    [-0.188, 0.49],
    [-0.172, 0.6],
    [-0.146, 0.69],
    [-0.116, 0.716],
    [-0.092, 0.69],
    [-0.084, 0.75],
    [-0.06, 0.83],
    [-0.022, 0.874],
    [0.022, 0.876],
    [0.05, 0.85],
    [0.062, 0.806],
    [0.078, 0.83],
    [0.11, 0.808],
    [0.142, 0.74],
    [0.164, 0.64],
    [0.176, 0.53],
    [0.178, 0.47],
    [0.198, 0.53],
    [0.22, 0.6],
    [0.244, 0.632],
    [0.268, 0.616],
    [0.276, 0.56],
    [0.268, 0.44],
    [0.244, 0.31],
    [0.204, 0.17],
    [0.15, 0.05],
    [0.124, -0.14],
  ],
  seps: [
    [
      [0.063, 0.81],
      [0.06, 0.72],
      [0.054, 0.63],
    ],
    [
      [-0.091, 0.69],
      [-0.098, 0.62],
      [-0.104, 0.56],
    ],
    // the thumb's inner edge, from the web down its length
    [
      [0.18, 0.48],
      [0.2, 0.55],
      [0.222, 0.6],
    ],
  ],
  sepW: [0.022, 0.018, 0.016],
};
const FLAT: Design = {
  out: [
    [-0.124, -0.14],
    [-0.134, 0.06],
    [-0.172, 0.24],
    [-0.198, 0.44],
    [-0.204, 0.58],
    [-0.19, 0.74],
    [-0.166, 0.832],
    [-0.138, 0.842],
    [-0.118, 0.8],
    [-0.104, 0.9],
    [-0.074, 0.968],
    [-0.04, 0.986],
    [-0.012, 1.0],
    [0.03, 0.99],
    [0.05, 0.95],
    [0.07, 0.966],
    [0.108, 0.94],
    [0.14, 0.86],
    [0.168, 0.7],
    [0.19, 0.56],
    [0.246, 0.5],
    [0.296, 0.478],
    [0.318, 0.44],
    [0.298, 0.38],
    [0.25, 0.27],
    [0.2, 0.16],
    [0.15, 0.06],
    [0.126, -0.14],
  ],
  seps: [
    [
      [0.05, 0.948],
      [0.046, 0.84],
      [0.04, 0.74],
    ],
    [
      [-0.118, 0.8],
      [-0.12, 0.7],
      [-0.122, 0.62],
    ],
  ],
  sepW: [0.02, 0.018],
};
const FLATSIDE: Design = {
  out: [
    [-0.1, -0.14],
    [-0.104, 0.1],
    [-0.11, 0.3],
    [-0.106, 0.5],
    [-0.088, 0.66],
    [-0.066, 0.8],
    [-0.046, 0.92],
    [-0.02, 0.99],
    [0.012, 1.0],
    [0.03, 0.96],
    [0.036, 0.86],
    [0.044, 0.7],
    [0.06, 0.56],
    [0.08, 0.44],
    [0.092, 0.3],
    [0.096, 0.12],
    [0.094, -0.14],
  ],
  seps: [
    [
      [0.03, 0.95],
      [-0.01, 0.8],
      [-0.03, 0.66],
    ],
  ],
  sepW: [0.016],
};
const SIDE: Design = {
  out: [
    [-0.11, -0.14],
    [-0.112, 0.05],
    [-0.118, 0.24],
    [-0.12, 0.42],
    [-0.112, 0.52],
    [-0.092, 0.62],
    [-0.05, 0.722],
    [0.0, 0.798],
    [0.05, 0.842],
    [0.096, 0.84],
    [0.12, 0.8],
    [0.108, 0.746],
    [0.09, 0.708],
    [0.11, 0.668],
    [0.14, 0.64],
    [0.168, 0.598],
    [0.178, 0.52],
    [0.174, 0.4],
    [0.16, 0.27],
    [0.13, 0.12],
    [0.108, -0.14],
  ],
  seps: [
    // the index finger over the rest of the curl
    [
      [0.07, 0.83],
      [0.02, 0.75],
      [-0.03, 0.68],
      [-0.06, 0.64],
    ],
    // the thumb's inner edge, from its tip up to the web
    [
      [0.128, 0.636],
      [0.1, 0.55],
      [0.07, 0.46],
    ],
  ],
  sepW: [0.02, 0.022],
};
const PINKY: Design = {
  out: [
    [-0.108, -0.14],
    [-0.11, 0.06],
    [-0.114, 0.26],
    [-0.112, 0.44],
    [-0.1, 0.54],
    [-0.078, 0.64],
    [-0.04, 0.73],
    [0.004, 0.79],
    [0.05, 0.81],
    [0.086, 0.79],
    [0.098, 0.74],
    [0.084, 0.69],
    [0.098, 0.64],
    [0.12, 0.58],
    [0.13, 0.48],
    [0.132, 0.36],
    [0.124, 0.2],
    [0.11, 0.04],
    [0.104, -0.14],
  ],
  seps: [
    [
      [0.084, 0.69],
      [0.03, 0.66],
      [-0.03, 0.62],
    ],
  ],
  sepW: [0.018],
};
const GRIP: Design = {
  out: [
    [-0.11, -0.14],
    [-0.115, 0.1],
    [-0.122, 0.3],
    [-0.124, 0.46],
    [-0.11, 0.58],
    [-0.07, 0.68],
    [-0.01, 0.73],
    [0.06, 0.725],
    [0.12, 0.69],
    [0.16, 0.63],
    [0.17, 0.56],
    [0.168, 0.5],
    [0.17, 0.42],
    [0.16, 0.3],
    [0.13, 0.14],
    [0.11, -0.14],
  ],
  seps: [
    [
      [0.168, 0.5],
      [0.12, 0.47],
      [0.06, 0.45],
    ],
    [
      [0.12, 0.69],
      [0.06, 0.62],
      [-0.02, 0.6],
    ],
  ],
  sepW: [0.022, 0.018],
};
const DESIGNS: Record<HandView, Design> = {back: BACK, palm: BACK, side: SIDE, pinky: PINKY, grip: GRIP, flat: FLAT, flatside: FLATSIDE};

/** The screen direction of the key light (upper left). */
const LIGHT2: V2 = [-0.88, -0.47];

/** One hand as a part: the drawing for this view, at the wrist, along the hand's screen axis (foreshortened), the
 *  thumb or the palm on its screen side; lit on the key side with a crisp shade plane, the curl a touch deeper. */
export function handPart(name: string, H: Hand5, wr: V3, c: Cam, skin: Tone, len: number, wide: number, z: number, px: number): PartV4 | null {
  if (H.pose === 'pocket' || H.pose === 'hidden') return null;
  const camV = (v: V3): V3 => toCam(v, c);
  const hd = camV(H.hd);
  const pn = camV(H.pn);
  const th = camV(H.th);
  const s2 = (v: V3): V2 => [v[0], -v[1]];
  // the view
  let view: HandView;
  if (H.pose === 'grip') view = 'grip';
  else if (H.pose === 'rest') view = Math.abs(pn[2]) > 0.55 ? 'flat' : 'flatside';
  else if (Math.abs(pn[2]) > 0.62) view = pn[2] < 0 ? 'back' : 'palm';
  else view = th[2] > 0 ? 'side' : 'pinky';
  const D = DESIGNS[view];
  // the screen frame: u along the hand, v toward the drawing's +x (the thumb, or the palm side)
  const a2 = s2(hd);
  const fl = Math.hypot(a2[0], a2[1]);
  const u: V2 = fl > 1e-3 ? [a2[0] / fl, a2[1] / fl] : [0, 1];
  let v: V2 = [-u[1], u[0]];
  const ref = view === 'back' || view === 'palm' || view === 'flat' ? s2(th) : s2(pn);
  // (flatside: +x = the palm side, which lies on the surface)
  if (v[0] * ref[0] + v[1] * ref[1] < 0) v = [-v[0], -v[1]];
  const k = Math.max(0.62, Math.min(1, fl * 1.05));
  const W0 = proj(wr, c);
  const P = (q: V2): V2 => [W0[0] + u[0] * q[1] * len * k + v[0] * q[0] * len * wide, W0[1] + u[1] * q[1] * len * k + v[1] * q[0] * len * wide];
  const out = through(D.out.map(P), true, 1);
  // the shade plane: the side away from the key (in the hand's own x), the terminator a little past the centre
  const lx = LIGHT2[0] * v[0] + LIGHT2[1] * v[1];
  const sg = lx > 0 ? -1 : 1;
  const xt = sg * (view === 'side' || view === 'pinky' || view === 'grip' || view === 'flatside' ? 0.035 : 0.05);
  const shadeQ: V2[] = [
    [xt, -0.4],
    [xt * 0.6, 0.5],
    [xt * 0.2, 1.3],
    [sg * 0.9, 1.3],
    [sg * 0.9, -0.4],
  ];
  const regions: Region[] = [{segs: polySegs(shadeQ.map(P)), fill: skin.shade}];
  // the separations and the thumb's edge: tapered slivers, only where the hand is big enough to hold them
  const handPx = len * px * 0.001;
  if (handPx >= 26) {
    D.seps.forEach((s, i) => {
      const pts = s.map(P);
      const w = D.sepW[i] * len * Math.min(1.2, wide / 0.9);
      regions.push({segs: taper(through(pts, false, 1), (t) => w * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7) * (1 - 0.35 * t)), fill: mixLab(skin.shade, skin.deep, 0.45), opacity: 0.75});
    });
  }
  // the curl turns away: the fingertips a touch deeper than the back of the hand
  const g0 = P([0, 0.25]);
  const g1 = P([0, 0.95]);
  const fill = {lin: [g0, g1] as [V2, V2], stops: [[0, mixLab(skin.lit, skin.sheen, 0.1)] as [number, string], [0.55, skin.lit] as [number, string], [1, mixLab(skin.lit, skin.shade, 0.38)] as [number, string]]};
  return {name, segs: out as Seg[], fill, z, regions};
}
