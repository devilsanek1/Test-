// MODERN GRAPHIC people: what sits on the head. A cap (its brim's crisp shadow hides the eyes), oversized sunglasses
// (the most current generic face: fashion.md §1.7), over-ear headphones (they change the head's silhouette), and the
// ear when the hair is pulled back. Head units as in head.ts (u = the skull's height, the crown at y -0.5).
import {V2, RV, poly} from '../graphic/geo';
import type {HeadFrame} from './head';
import type {Tone} from '../graphic/color';
import type {Part} from '../graphic/part';

type V = 'q' | 'p' | 'b';
const rightOf = (hf: HeadFrame, line: V2[]) => poly(hf.PP([...line, [3, line[line.length - 1][1]], [3, line[0][1]]]));

/** A baseball cap: the crown, the brim (its underside a darker band), the brim's shadow on the face, and from behind
 *  the back opening with its strap (the ponytail comes through it). */
export function cap(hf: HeadFrame, view: V, t: Tone, skinShade: string, turn = 0): Part[] {
  const parts: Part[] = [];
  if (view === 'q') {
    const crown: RV[] = [
      [-0.44, -0.17, 0.02],
      [-0.48, -0.36, 0.12],
      [-0.2, -0.65, 0.22],
      [0.2, -0.64, 0.2],
      [0.5, -0.4, 0.16],
      [0.54, -0.1, 0.06],
      [0.46, -0.02, 0.03],
      [0.2, -0.11, 0.1],
      [-0.06, -0.17, 0.06],
      [-0.2, -0.19, 0.02],
    ];
    parts.push({
      name: 'capCrown',
      d: hf.R(crown),
      fill: t.lit,
      regions: [
        {d: rightOf(hf, [[0.08, -0.8], [0.16, -0.3], [0.22, 0.1]]), fill: t.shade},
        // the front seam: one crisp sliver from the button to the brim
        {d: poly(hf.PP([[-0.2, -0.645], [-0.185, -0.645], [-0.3, -0.19], [-0.32, -0.19]])), fill: t.shade},
      ],
      z: 70,
    });
    parts.push({name: 'capButton', d: hf.R([[-0.24, -0.66, 0.02], [-0.16, -0.67, 0.02], [-0.17, -0.63, 0.02], [-0.24, -0.62, 0.02]]), fill: t.shade, z: 70.1});
    // the brim: forward and a little down, its top lit, its underside a band along the front edge
    const brim: RV[] = [
      [-0.16, -0.19, 0.02],
      [-0.4, -0.085, 0.08],
      [-0.66, -0.095, 0.1],
      [-0.8, -0.175, 0.04],
      [-0.5, -0.215, 0.02],
    ];
    parts.push({
      name: 'capBrim',
      d: hf.R(brim),
      fill: t.lit,
      regions: [{d: poly(hf.PP([[-0.2, -0.14], [-0.42, -0.105], [-0.67, -0.115], [-0.82, -0.18], [-0.85, 0.0], [-0.1, 0.0]])), fill: t.deep}],
      z: 71,
    });
    // the brim's shadow across the brow and the eyes (a crisp band, the face's deep tone)
    parts.push({name: 'brimShadow', d: poly(hf.PP([[-0.5, -0.2], [0.25, -0.2], [0.2, -0.06], [-0.1, 0.0], [-0.5, -0.02]])), fill: skinShade, z: 53.6});
  } else if (view === 'p') {
    const crown: RV[] = [
      [-0.4, -0.16, 0.02],
      [-0.45, -0.38, 0.14],
      [-0.06, -0.65, 0.22],
      [0.44, -0.5, 0.18],
      [0.6, -0.2, 0.08],
      [0.56, -0.04, 0.02],
      [0.3, -0.08, 0.1],
      [0.0, -0.14, 0.08],
      [-0.3, -0.17, 0.02],
    ];
    parts.push({
      name: 'capCrown',
      d: hf.R(crown),
      fill: t.lit,
      regions: [{d: rightOf(hf, [[0.22, -0.8], [0.28, -0.2], [0.3, 0.1]]), fill: t.shade}],
      z: 70,
    });
    const brim: RV[] = [
      [-0.3, -0.185, 0.02],
      [-0.72, -0.21, 0.12],
      [-0.98, -0.13, 0.03],
      [-0.7, -0.115, 0.06],
      [-0.4, -0.145, 0.02],
    ];
    parts.push({
      name: 'capBrim',
      d: hf.R(brim),
      fill: t.lit,
      regions: [{d: poly(hf.PP([[-0.3, -0.165], [-0.72, -0.17], [-1.0, -0.13], [-1.0, 0.0], [-0.3, 0.0]])), fill: t.deep}],
      z: 71,
    });
    parts.push({name: 'brimShadow', d: poly(hf.PP([[-0.6, -0.2], [0.0, -0.17], [-0.06, -0.06], [-0.6, 0.0]])), fill: skinShade, z: 53.6});
    // the strap across the back opening
    parts.push({name: 'capStrap', d: hf.R([[0.5, -0.13, 0.01], [0.6, -0.12, 0.01], [0.585, -0.06, 0.01], [0.49, -0.08, 0.01]]), fill: t.shade, z: 70.2});
  } else {
    const crown: RV[] = [
      [-0.47, -0.08, 0.02],
      [-0.47, -0.38, 0.14],
      [0.0, -0.65, 0.25],
      [0.47, -0.38, 0.14],
      [0.47, -0.08, 0.02],
      [0.18, -0.05, 0.01],
      [0.13, -0.2, 0.06],
      [-0.13, -0.2, 0.06],
      [-0.18, -0.05, 0.01],
    ];
    parts.push({
      name: 'capCrown',
      d: hf.R(crown),
      fill: t.lit,
      regions: [{d: rightOf(hf, [[0.12, -0.8], [0.18, -0.2], [0.2, 0.1]]), fill: t.shade}],
      z: 77,
    });
    parts.push({name: 'capStrap', d: hf.R([[-0.18, -0.085, 0.01], [0.18, -0.085, 0.01], [0.18, -0.04, 0.01], [-0.18, -0.04, 0.01]]), fill: t.shade, z: 77.2});
    if (turn > 0.2) {
      // the brim's edge just shows past the cheek as the head turns
      parts.push({name: 'capBrim', d: hf.R([[-0.44, -0.12, 0.02], [-0.62, -0.1, 0.04], [-0.64, -0.06, 0.02], [-0.46, -0.06, 0.02]]), fill: t.deep, z: 76.9});
    }
  }
  return parts;
}

/** The ear, when the hair is pulled back: one small shape with the inner shade (design_research.md R6). */
export function ear(hf: HeadFrame, view: V, t: Tone, side: 1 | -1 = 1): Part[] {
  if (view === 'q') {
    const e: RV[] = [
      [0.21, -0.07, 0.03],
      [0.31, -0.06, 0.06],
      [0.335, 0.06, 0.06],
      [0.3, 0.17, 0.05],
      [0.245, 0.185, 0.03],
      [0.22, 0.1, 0.02],
    ];
    return [
      {
        name: 'ear',
        d: hf.R(e),
        fill: t.lit,
        regions: [{d: hf.R([[0.25, -0.02, 0.02], [0.3, 0.0, 0.03], [0.3, 0.1, 0.03], [0.26, 0.12, 0.02]]), fill: t.shade}],
        z: 52.5,
      },
    ];
  }
  if (view === 'p') {
    const e: RV[] = [
      [0.07, -0.05, 0.03],
      [0.16, -0.06, 0.06],
      [0.2, 0.05, 0.06],
      [0.17, 0.17, 0.05],
      [0.11, 0.2, 0.03],
      [0.08, 0.12, 0.02],
    ];
    return [
      {
        name: 'ear',
        d: hf.R(e),
        fill: t.lit,
        regions: [{d: hf.R([[0.1, -0.0, 0.02], [0.16, 0.0, 0.03], [0.16, 0.1, 0.03], [0.11, 0.12, 0.02]]), fill: t.shade}],
        z: 52.5,
      },
    ];
  }
  const x = 0.44 * side;
  return [{name: 'ear', d: hf.R([[x, -0.05, 0.03], [x + 0.06 * side, -0.03, 0.04], [x + 0.06 * side, 0.12, 0.04], [x, 0.16, 0.03]]), fill: side < 0 ? t.lit : t.shade, z: 51.5}];
}

/** Oversized sunglasses in 3/4 (facing screen-left): the far lens past the face's contour, the near lens big, a
 *  bridge, the near temple arm, and ONE reflection streak (design_research.md §11.6). */
export function sunglasses(hf: HeadFrame, faceX: number, frame: string, glint: string): Part[] {
  const fx = faceX;
  const far: RV[] = [
    [-0.45, -0.105, 0.03],
    [fx - 0.02, -0.115, 0.03],
    [fx - 0.035, 0.085, 0.06],
    [-0.41, 0.1, 0.06],
  ];
  const near: RV[] = [
    [fx + 0.03, -0.12, 0.03],
    [fx + 0.35, -0.11, 0.04],
    [fx + 0.335, 0.1, 0.08],
    [fx + 0.05, 0.115, 0.07],
  ];
  return [
    {name: 'lensFar', d: hf.R(far), fill: frame, z: 55},
    {
      name: 'lensNear',
      d: hf.R(near),
      fill: frame,
      regions: [{d: poly(hf.PP([[fx + 0.12, -0.13], [fx + 0.17, -0.13], [fx + 0.09, 0.13], [fx + 0.04, 0.13]])), fill: glint}],
      z: 55,
    },
    {name: 'bridge', d: hf.R([[fx - 0.03, -0.085, 0.01], [fx + 0.04, -0.09, 0.01], [fx + 0.04, -0.06, 0.01], [fx - 0.03, -0.055, 0.01]]), fill: frame, z: 55.1},
    {name: 'temple', d: hf.R([[fx + 0.33, -0.1, 0.01], [0.3, -0.07, 0.01], [0.3, -0.045, 0.01], [fx + 0.33, -0.065, 0.01]]), fill: frame, z: 54.9},
  ];
}

/** Over-ear headphones in 3/4: the band over the crown and the near cup over the ear (fashion.md A3). */
export function headphones(hf: HeadFrame, t: Tone, cushion: string): Part[] {
  const band: RV[] = [
    [0.27, -0.12, 0.03],
    [0.36, -0.42, 0.14],
    [0.08, -0.74, 0.22],
    [-0.3, -0.62, 0.16],
    [-0.36, -0.55, 0.04],
    [-0.27, -0.56, 0.1],
    [0.06, -0.67, 0.2],
    [0.29, -0.4, 0.12],
    [0.21, -0.12, 0.03],
  ];
  const cup: RV[] = [
    [0.16, -0.14, 0.1],
    [0.42, -0.15, 0.12],
    [0.47, 0.12, 0.12],
    [0.36, 0.27, 0.1],
    [0.18, 0.24, 0.1],
    [0.12, 0.06, 0.08],
  ];
  return [
    {name: 'phonesBand', d: hf.R(band), fill: t.lit, regions: [{d: rightOf(hf, [[0.12, -0.9], [0.2, -0.3], [0.26, 0.0]]), fill: t.shade}], z: 72},
    {name: 'phonesCushion', d: hf.R([[0.1, -0.12, 0.08], [0.2, -0.13, 0.06], [0.2, 0.22, 0.06], [0.12, 0.2, 0.08], [0.08, 0.05, 0.06]]), fill: cushion, z: 72.5},
    {
      name: 'phonesCup',
      d: hf.R(cup),
      fill: t.lit,
      regions: [{d: rightOf(hf, [[0.33, -0.3], [0.34, 0.1], [0.3, 0.4]]), fill: t.shade}],
      z: 73,
    },
  ];
}
