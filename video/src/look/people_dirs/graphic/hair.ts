// MODERN GRAPHIC people: hair is the face (fashion.md §1.6). ONE bold mass with a designed cut line, 0-2 secondary
// masses, ONE crisp sheen band (+16 L*), partings as crisp notches, the back view as the showcase (design_research.md
// R1-R7). Everything in head units (u = the skull's height; the crown at y -0.5, the chin at 0.5, the shoulders at
// ~0.92, the bust at ~1.57).
import {V2, RV, poly} from './geo';
import type {HeadFrame} from './head';
import type {Tone} from './color';
import type {Part, Region} from './part';

export type HairCtx = {hf: HeadFrame; view: 'q' | 'p' | 'b'; faceX: number; t: Tone; /** walking: the fall swings back */ swing?: number; turn?: number};

const R = (c: HairCtx, pts: RV[]) => c.hf.R(pts);
const PG = (c: HairCtx, pts: V2[]) => poly(c.hf.PP(pts));
/** The shade plane right of a line (head units), for clipping inside a hair mass. */
const rightOf = (c: HairCtx, line: V2[]) => PG(c, [...line, [3, line[line.length - 1][1]], [3, line[0][1]]]);

/** A crisp crescent (a sheen band) along an arc: centre, radii, from angle a0 to a1 (degrees, 0 = right, 90 = down),
 *  thickness th; its ends taper to points. */
export function crescent(c: HairCtx, cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, th: number): string {
  const N = 12;
  const outer: V2[] = [];
  const inner: V2[] = [];
  for (let i = 0; i <= N; i++) {
    const a = ((a0 + ((a1 - a0) * i) / N) * Math.PI) / 180;
    const w = th * Math.sin((Math.PI * i) / N); // tapered ends
    outer.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    inner.push([cx + (rx - w) * Math.cos(a), cy + (ry - w) * Math.sin(a)]);
  }
  return PG(c, outer.concat(inner.reverse()));
}

// ---------------------------------------------------------------- H2: long layers, curtain bangs, bouncy ends
export function hairLong(c: HairCtx, o: {len?: number} = {}): Part[] {
  const t = c.t;
  const L = o.len ?? 1.66; // where the ends sit below the head's centre
  const parts: Part[] = [];
  if (c.view === 'q') {
    const fx = c.faceX;
    const part: V2 = [fx + 0.16, -0.555];
    // the back mass: behind the neck, framing it in the deep tone
    parts.push({
      name: 'hairBack',
      d: R(c, [
        [-0.38, -0.25, 0.1],
        [-0.55, 0.12, 0.14],
        [-0.6, 0.55, 0.14],
        [-0.58, 0.98, 0.12],
        [-0.4, 1.12, 0.1],
        [0.1, 1.1, 0.1],
        [0.52, 1.0, 0.12],
        [0.62, 0.55, 0.14],
        [0.56, 0.0, 0.14],
        [0.3, -0.4, 0.14],
      ]),
      fill: t.deep,
      z: 18,
    });
    // the near mass: the crown, the near curtain and the long lock over the near shoulder with its bouncy end
    const near: RV[] = [
      [part[0], part[1], 0],
      [0.06, -0.59, 0.16],
      [0.36, -0.5, 0.14],
      [0.54, -0.25, 0.14],
      [0.56, 0.04, 0.12],
      [0.5, 0.32, 0.1],
      [0.52, 0.66, 0.12],
      [0.6, 0.98, 0.16],
      [0.62, L - 0.36, 0.14],
      [0.59, L - 0.1, 0.1],
      [0.47, L + 0.02, 0.09],
      [0.33, L - 0.02, 0.06],
      [0.29, L - 0.13, 0.04],
      [0.35, L - 0.2, 0.01],
      [0.3, L - 0.48, 0.16],
      [0.25, 0.86, 0.12],
      [0.21, 0.56, 0.1],
      [0.17, 0.32, 0.06],
      [0.11, 0.1, 0.06],
      [0.05, -0.1, 0.07],
      [-0.02, -0.28, 0.1],
      [-0.08, -0.43, 0.08],
    ];
    const nearRegs: Region[] = [
      // the side of the head and the lock's outer half in the shade plane
      {d: rightOf(c, [[0.2, -0.75], [0.4, 0.1], [0.44, 0.9], [0.46, L + 0.2]]), fill: t.shade},
      // the sheen: one crisp band across the crown
      {d: crescent(c, 0.06, -0.05, 0.5, 0.52, 212, 302, 0.07), fill: t.sheen},
      // a second, small one on the curl's lit side
      {d: crescent(c, 0.44, L - 0.12, 0.12, 0.11, 140, 215, 0.035), fill: t.sheen},
    ];
    parts.push({name: 'hairNear', d: R(c, near), fill: t.lit, regions: nearRegs, z: 75});
    // the far curtain: from the parting over the far temple to the cheekbone
    const far: RV[] = [
      [part[0], part[1], 0],
      [fx - 0.04, -0.54, 0.12],
      [-0.48, -0.36, 0.12],
      [-0.52, -0.1, 0.1],
      [-0.5, 0.06, 0.05],
      [-0.44, 0.15, 0.01],
      [-0.41, 0.0, 0.08],
      [-0.31, -0.2, 0.1],
      [-0.22, -0.37, 0.08],
    ];
    parts.push({
      name: 'hairFar',
      d: R(c, far),
      fill: t.lit,
      regions: [{d: crescent(c, 0.0, -0.02, 0.52, 0.52, 222, 258, 0.06), fill: t.sheen}],
      z: 56,
    });
    // the far side's length, falling behind the far shoulder (seen beside the jaw)
    parts.push({
      name: 'hairFarFall',
      d: R(c, [
        [-0.5, 0.0, 0.05],
        [-0.56, 0.4, 0.12],
        [-0.6, 0.85, 0.14],
        [-0.5, 1.0, 0.08],
        [-0.42, 0.7, 0.12],
        [-0.4, 0.3, 0.1],
        [-0.42, 0.1, 0.04],
      ]),
      fill: t.shade,
      z: 19,
    });
  } else if (c.view === 'p') {
    const sw = c.swing ?? 0;
    // the fall: down the back, behind the shoulders, swinging back a little in the walk
    parts.push({
      name: 'hairFall',
      d: R(c, [
        [0.1, -0.35, 0.1],
        [0.56, -0.25, 0.16],
        [0.63, 0.2, 0.14],
        [0.63 + sw * 0.4, 0.7, 0.14],
        [0.7 + sw, L - 0.45, 0.14],
        [0.72 + sw, L - 0.1, 0.1],
        [0.6 + sw, L + 0.04, 0.09],
        [0.46 + sw, L + 0.0, 0.06],
        [0.41 + sw, L - 0.12, 0.04],
        [0.47 + sw, L - 0.2, 0.01],
        [0.41 + sw, L - 0.48, 0.16],
        [0.28 + sw * 0.5, 0.8, 0.14],
        [0.16, 0.4, 0.1],
      ]),
      fill: t.shade,
      regions: [
        {d: crescent(c, 0.6 + sw, L - 0.12, 0.13, 0.11, 140, 215, 0.035), fill: t.lit},
        {d: PG(c, [[-1, -1], [0.44, -1], [0.5, 0.4], [-1, 0.4]]), fill: t.lit},
      ],
      z: 18,
    });
    // the cap over the head, the hairline in front of the ear and the curtain bang to the cheekbone
    const cap: RV[] = [
      [-0.34, -0.44, 0.08],
      [0.0, -0.585, 0.2],
      [0.42, -0.48, 0.16],
      [0.6, -0.2, 0.14],
      [0.6, 0.14, 0.12],
      [0.52, 0.42, 0.1],
      [0.34, 0.52, 0.06],
      [0.13, 0.44, 0.06],
      [0.03, 0.24, 0.08],
      [-0.05, 0.05, 0.06],
      [-0.11, -0.08, 0.04],
      [-0.27, 0.11, 0.01],
      [-0.4, -0.06, 0.06],
      [-0.45, -0.24, 0.08],
    ];
    parts.push({
      name: 'hairCap',
      d: R(c, cap),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.22, -0.8], [0.3, 0.1], [0.24, 0.7]]), fill: t.shade},
        {d: crescent(c, 0.04, -0.02, 0.54, 0.55, 205, 292, 0.07), fill: t.sheen},
      ],
      z: 56,
    });
  } else {
    // from behind (the head may be turned toward screen-left: the cheek's sliver shows past the hair)
    const tn = c.turn ?? 0;
    const sw = c.swing ?? 0;
    const pts: RV[] = [
      [0.0, -0.59, 0.2],
      [0.42, -0.46, 0.16],
      [0.54, -0.16, 0.14],
      [0.52, 0.26, 0.12],
      [0.52, 0.68, 0.12],
      [0.58 + sw, 1.1, 0.14],
      [0.64 + sw, L - 0.2, 0.1],
      [0.58 + sw, L + 0.02, 0.07],
      [0.46 + sw, L + 0.09, 0.06],
      [0.36 + sw, L + 0.03, 0.01],
      [0.22 + sw, L + 0.13, 0.07],
      [0.05 + sw, L + 0.08, 0.05],
      [-0.04 + sw, L + 0.02, 0.01],
      [-0.18 + sw, L + 0.12, 0.07],
      [-0.36 + sw, L + 0.07, 0.06],
      [-0.44 + sw, L + 0.0, 0.01],
      [-0.56 + sw, L + 0.03, 0.06],
      [-0.63 + sw, L - 0.16, 0.08],
      [-0.6, 1.1, 0.14],
      [-0.5, 0.66, 0.12],
      [-0.4 + 0.1 * tn, 0.42, 0.08],
      [-0.36 + 0.06 * tn, 0.14, 0.06],
      [-0.44 + 0.04 * tn, -0.12, 0.1],
      [-0.4, -0.42, 0.16],
    ];
    parts.push({
      name: 'hairBackView',
      d: R(c, pts),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.1, -0.8], [0.2, 0.2], [0.2 + sw, 1.0], [0.26 + sw, L + 0.3]]), fill: t.shade},
        // two clump separations: crisp tapered spindles in the deep tone
        {
          d: PG(c, [
            [-0.06, 0.34],
            [-0.03, 0.9],
            [-0.04 + sw * 0.6, L - 0.08],
            [-0.08 + sw * 0.6, 0.9],
          ]),
          fill: t.shade,
        },
        {
          d: PG(c, [
            [0.33, 0.62],
            [0.38 + sw * 0.6, 1.2],
            [0.36 + sw, L - 0.02],
            [0.3 + sw * 0.6, 1.2],
          ]),
          fill: t.deep,
        },
        {d: crescent(c, 0.0, 0.02, 0.5, 0.55, 198, 290, 0.075), fill: t.sheen},
      ],
      z: 76,
    });
  }
  return parts;
}
