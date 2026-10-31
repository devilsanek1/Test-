// FLOW v5, GUST: the head. A near-blank face: the contour and the light on the head; one small open eye looking away
// (never at us) only where the head is big enough; from behind, the dark cap with a sliver of the cheek (the lost
// profile, looking out where the wind comes from). Authored in HEAD UNITS (the crown at 0,0, the chin at y = 100,
// facing the screen left) and placed on the rig's head frame. Women read feminine (a small upturned nose, a soft chin,
// full lips on the profile line), men manly (a straighter brow and nose, a squarer jaw); never caricature.
import {type V2, type Node, N, add, mul, rot, outline, mapNodes, ellipse, limb} from './geo';
import type {Rig, Sex, View} from './body';

export type HeadShapes = {skin: Node[]; eye?: {c: V2; w: number; h: number; look: number}; brow?: V2[]};

// ---------------------------------------------------------------- her (women)
const F_P: Node[] = [
  N(4, 1, 'smooth'),
  N(38, 13, 'smooth'),
  N(49, 43, 'smooth'),
  N(43, 71, 'smooth'),
  N(29, 86, 'smooth'),
  N(16, 90, 'round', 8),
  N(-8, 99, 'smooth'),
  N(-23, 101, 'round', 6),
  N(-32, 94.5, 'smooth'),
  N(-32.6, 89, 'round', 2),
  N(-36, 84.5, 'smooth'),
  N(-34.6, 81, 'round', 1.2),
  N(-37.6, 77.2, 'smooth'),
  N(-35.8, 72.6, 'round', 1.6),
  N(-42.4, 67.6, 'round', 2.6),
  N(-37.6, 57, 'smooth'),
  N(-38.4, 47, 'smooth'),
  N(-35, 30, 'smooth'),
  N(-22, 9, 'smooth'),
];
const F_Q: Node[] = [
  N(4, 0, 'smooth'),
  N(36, 12, 'smooth'),
  N(46, 40, 'smooth'),
  N(42, 62, 'smooth'),
  N(30, 82, 'smooth'),
  N(12, 96, 'smooth'),
  N(-6, 102, 'round', 6),
  N(-16, 97, 'smooth'),
  N(-25, 87, 'smooth'),
  N(-30.5, 77, 'smooth'),
  N(-32.4, 72, 'round', 1.6),
  N(-36, 67, 'round', 2.2),
  N(-32.8, 59, 'smooth'),
  N(-35.4, 48, 'smooth'),
  N(-33.6, 30, 'smooth'),
  N(-22, 9, 'smooth'),
];
const F_B: Node[] = [
  N(4, 0, 'smooth'),
  N(38, 14, 'smooth'),
  N(46, 46, 'smooth'),
  N(40, 80, 'smooth'),
  N(16, 98, 'smooth'),
  N(-14, 100, 'round', 8),
  N(-32, 92, 'smooth'),
  N(-43, 78, 'smooth'),
  N(-47, 64, 'round', 3),
  N(-43, 50, 'smooth'),
  N(-36, 26, 'smooth'),
  N(-22, 8, 'smooth'),
];

// ---------------------------------------------------------------- him (men): a longer, squarer jaw with a corner under
// the ear, a firm chin, a firmer brow over a straighter nose (the jaw's corner reads on the neck: figure.ts shades the
// neck under the jaw for men)
const M_P: Node[] = [
  N(4, 1, 'smooth'),
  N(38, 11, 'smooth'),
  N(50, 40, 'smooth'),
  N(47, 66, 'smooth'),
  N(37, 82, 'smooth'),
  N(22, 97, 'round', 3),
  N(-4, 104, 'smooth'),
  N(-20, 109, 'round', 3),
  N(-31.5, 104, 'round', 3),
  N(-33, 97, 'smooth'),
  N(-33.6, 91, 'round', 2),
  N(-35.4, 86.5, 'smooth'),
  N(-34.6, 82.6, 'round', 1),
  N(-37, 78.6, 'smooth'),
  N(-36.4, 73.6, 'round', 1.4),
  N(-44, 69, 'round', 2),
  N(-40.2, 57, 'smooth'),
  N(-39.6, 51.5, 'round', 2),
  N(-43, 45, 'round', 2.5),
  N(-38.5, 30, 'smooth'),
  N(-23, 8, 'smooth'),
];
const M_Q: Node[] = [
  N(4, 0, 'smooth'),
  N(37, 12, 'smooth'),
  N(49, 42, 'smooth'),
  N(47, 72, 'smooth'),
  N(40, 92, 'round', 3),
  N(10, 106, 'smooth'),
  N(-10, 110, 'round', 4),
  N(-22, 104, 'smooth'),
  N(-28.5, 90, 'smooth'),
  N(-32, 78, 'smooth'),
  N(-33.6, 72, 'round', 1.4),
  N(-36.6, 67, 'round', 2),
  N(-33.8, 57, 'smooth'),
  N(-38, 46, 'round', 2.5),
  N(-35, 30, 'smooth'),
  N(-22, 9, 'smooth'),
];

export function headShapes(sex: Sex, view: View): HeadShapes {
  const f = sex === 'f';
  if (view === 'p') return {skin: f ? F_P : M_P, eye: {c: [-28.5, 57.5], w: 6.4, h: 3.6, look: -1}, brow: f ? [[-35, 49], [-28, 47.6], [-22, 49]] : [[-37.5, 48.4], [-29, 47.8], [-20, 48.6]]};
  if (view === 'q') return {skin: f ? F_Q : M_Q, eye: {c: [-8, 58.5], w: 10.4, h: 5, look: -1}, brow: f ? [[-16, 50.2], [-7, 48.8], [2, 50.4]] : [[-18, 49.4], [-7, 48.4], [4, 49.4]]};
  return {skin: F_B};
}

/** Head units -> figure units on the rig's head frame. */
export const headMap = (r: Rig) => (p: V2): V2 => add(r.head.o, rot(mul(p, r.head.k), r.head.tilt));

/** The skin of the head (face) as a path, in figure units. */
export function skinPath(r: Rig, sex: Sex): string {
  return outline(mapNodes(headShapes(sex, r.hv).skin, headMap(r)));
}

/** The eye: a small dark almond, the white showing on the side away from where it looks (it looks at the screen
 *  left, never at us), a lid line carried a touch past the outer corner. Returns [white, iris + lid] paths. */
export function eyePaths(r: Rig, sex: Sex): {white: string; dark: string; brow: string} | null {
  const hs = headShapes(sex, r.hv);
  if (!hs.eye) return null;
  const m = headMap(r);
  const {c, w, h} = hs.eye;
  const x0 = c[0] - w / 2;
  const x1 = c[0] + w / 2;
  // the almond: the outer corner (screen left in these views) a touch higher, a fuller upper lid
  const al: Node[] = [
    {p: [x0, c[1] - h * 0.18], k: 'sharp'},
    {p: [c[0] - w * 0.12, c[1] - h * 0.62], k: 'smooth'},
    {p: [x1, c[1] + h * 0.02], k: 'sharp'},
    {p: [c[0] + w * 0.05, c[1] + h * 0.42], k: 'smooth'},
  ];
  const white = outline(mapNodes(al, m));
  // the iris: toward the outer corner, under the upper lid
  const iris = ellipse(m([c[0] - w * 0.2, c[1] - h * 0.02]), (w * 0.3 * r.head.k) / 1, (h * 0.5 * r.head.k) / 1);
  // the upper lid line, carried past the outer corner (a soft flick, not a lash fan)
  const lidC: V2[] = [
    [x1 + w * 0.02, c[1] - h * 0.02],
    [c[0] + w * 0.1, c[1] - h * 0.55],
    [c[0] - w * 0.3, c[1] - h * 0.62],
    [x0 - w * 0.12, c[1] - h * 0.3],
  ].map((q) => m(q as V2));
  const lid = limb(lidC, (u) => (0.6 + 1.2 * Math.sin(Math.PI * Math.min(1, u * 1.1))) * r.head.k);
  const brow = hs.brow ? limb(hs.brow.map(m), (u) => (sex === 'm' ? 1.5 + 1.2 * Math.sin(Math.PI * Math.min(1, u * 1.3)) : 0.9 + 1.4 * Math.sin(Math.PI * u)) * r.head.k * (sex === 'm' ? 1.2 : 0.9)) : '';
  return {white, dark: iris + lid, brow};
}
