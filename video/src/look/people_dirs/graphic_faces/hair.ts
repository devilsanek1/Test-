// MODERN GRAPHIC people: hair is the face (fashion.md §1.6). ONE bold mass with a designed cut line, 0-2 secondary
// masses, ONE crisp sheen band (+16 L*), partings as crisp notches, the back view as the showcase (design_research.md
// R1-R7). Everything in head units (u = the skull's height; the crown at y -0.5, the chin at 0.5, the shoulders at
// ~0.92, the bust at ~1.57).
import {V2, RV, poly} from '../graphic/geo';
import type {HeadFrame} from './head';
import type {Tone} from '../graphic/color';
import type {Part, Region} from '../graphic/part';

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
    const part: V2 = [fx + 0.16, -0.5];
    // the parting: the notch between the two curtains shows the hair's shade, never the background
    parts.push({name: 'hairParting', d: PG(c, [[part[0] - 0.07, -0.53], [part[0] + 0.08, -0.55], [part[0] + 0.02, -0.42], [part[0] - 0.03, -0.42]]), fill: t.deep, z: 54});
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
      [0.2, 0.58, 0.1],
      [0.13, 0.36, 0.08],
      [0.075, 0.16, 0.06],
      [0.05, -0.02, 0.06],
      [0.02, -0.19, 0.08],
      [-0.04, -0.33, 0.08],
      [-0.1, -0.44, 0.06],
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
      [0.34, 0.53, 0.06],
      [0.12, 0.47, 0.06],
      [0.03, 0.33, 0.08],
      [-0.05, 0.17, 0.06],
      [-0.15, 0.085, 0.04],
      [-0.27, 0.085, 0.06],
      [-0.355, 0.0, 0.08],
      [-0.405, -0.13, 0.1],
      [-0.4, -0.31, 0.1],
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

// ---------------------------------------------------------------- H5-under-a-cap: the ponytail pulled through the cap
/** The hair under a cap: the sides pulled back above the ear, a face-framing wisp, and the ponytail through the cap's
 *  back opening (the flowing element). */
export function hairPonytail(c: HairCtx): Part[] {
  const t = c.t;
  const sw = c.swing ?? 0;
  const parts: Part[] = [];
  if (c.view === 'q') {
    parts.push({
      name: 'hairSide',
      d: R(c, [
        [0.0, -0.19, 0.02],
        [0.3, -0.12, 0.08],
        [0.48, -0.02, 0.08],
        [0.5, 0.14, 0.08],
        [0.42, 0.3, 0.06],
        [0.33, 0.24, 0.04],
        [0.36, 0.1, 0.05],
        [0.2, -0.08, 0.06],
        [0.08, -0.12, 0.04],
      ]),
      fill: t.lit,
      regions: [{d: rightOf(c, [[0.3, -0.4], [0.36, 0.1], [0.4, 0.5]]), fill: t.shade}],
      z: 54,
    });
    parts.push({
      name: 'hairWisp',
      d: R(c, [
        [-0.36, -0.19, 0.02],
        [-0.47, -0.17, 0.04],
        [-0.48, -0.02, 0.06],
        [-0.44, 0.13, 0.01],
        [-0.42, 0.0, 0.06],
        [-0.37, -0.12, 0.04],
      ]),
      fill: t.lit,
      z: 56,
    });
    parts.push({
      name: 'ponytail',
      d: R(c, [
        [0.4, -0.14, 0.04],
        [0.64, -0.1, 0.12],
        [0.74, 0.28, 0.14],
        [0.78, 0.78, 0.14],
        [0.72, 1.16, 0.1],
        [0.58, 1.22, 0.08],
        [0.52, 1.1, 0.03],
        [0.56, 1.02, 0.01],
        [0.52, 0.66, 0.14],
        [0.44, 0.28, 0.1],
        [0.38, 0.02, 0.04],
      ]),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.6, -0.2], [0.64, 0.5], [0.66, 1.3]]), fill: t.shade},
        {d: crescent(c, 0.86, 0.36, 0.32, 0.5, 168, 214, 0.05), fill: t.sheen},
      ],
      z: 19,
    });
  } else if (c.view === 'p') {
    parts.push({
      name: 'hairSide',
      d: R(c, [
        [-0.32, -0.17, 0.02],
        [0.3, -0.09, 0.06],
        [0.56, -0.05, 0.06],
        [0.56, 0.12, 0.08],
        [0.42, 0.3, 0.06],
        [0.3, 0.27, 0.04],
        [0.26, 0.08, 0.06],
        [0.1, -0.06, 0.05],
        [-0.1, -0.05, 0.05],
        [-0.22, 0.04, 0.02],
        [-0.3, -0.06, 0.04],
      ]),
      fill: t.lit,
      regions: [{d: rightOf(c, [[0.36, -0.4], [0.4, 0.1], [0.42, 0.5]]), fill: t.shade}],
      z: 54,
    });
    parts.push({
      name: 'ponytail',
      d: R(c, [
        [0.46, -0.16, 0.04],
        [0.72, -0.12, 0.12],
        [0.88 + sw * 0.5, 0.22, 0.14],
        [0.94 + sw, 0.62, 0.14],
        [0.88 + sw, 1.0, 0.1],
        [0.74 + sw, 1.05, 0.08],
        [0.69 + sw, 0.94, 0.03],
        [0.74 + sw, 0.86, 0.01],
        [0.72 + sw * 0.8, 0.5, 0.14],
        [0.6 + sw * 0.4, 0.14, 0.1],
        [0.5, 0.0, 0.04],
      ]),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.7, -0.2], [0.82 + sw, 0.5], [0.84 + sw, 1.2]]), fill: t.shade},
        {d: crescent(c, 1.02 + sw, 0.42, 0.36, 0.5, 165, 210, 0.05), fill: t.sheen},
      ],
      z: 18,
    });
  } else {
    const tn = c.turn ?? 0;
    parts.push({
      name: 'hairNape',
      d: R(c, [
        [-0.46, -0.08, 0.02],
        [0.46, -0.08, 0.02],
        [0.44, 0.12, 0.08],
        [0.26, 0.32, 0.1],
        [0.0, 0.36, 0.1],
        [-0.26, 0.32, 0.1],
        [-0.42 + 0.04 * tn, 0.12, 0.08],
      ]),
      fill: t.lit,
      regions: [{d: rightOf(c, [[0.1, -0.2], [0.14, 0.4]]), fill: t.shade}],
      z: 76,
    });
    parts.push({
      name: 'ponytail',
      d: R(c, [
        [-0.13, -0.16, 0.04],
        [0.13, -0.16, 0.04],
        [0.2 + sw * 0.3, 0.3, 0.12],
        [0.2 + sw, 0.82, 0.12],
        [0.12 + sw, 1.2, 0.1],
        [-0.04 + sw, 1.24, 0.08],
        [-0.1 + sw, 1.12, 0.03],
        [-0.02 + sw, 1.06, 0.01],
        [-0.12 + sw * 0.8, 0.7, 0.12],
        [-0.16 + sw * 0.3, 0.3, 0.1],
      ]),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.05, -0.2], [0.08 + sw, 0.6], [0.06 + sw, 1.3]]), fill: t.shade},
        {d: crescent(c, 0.26, 0.4, 0.3, 0.45, 160, 205, 0.045), fill: t.sheen},
      ],
      z: 78,
    });
  }
  return parts;
}

// ---------------------------------------------------------------- H10: soft curtains with a longer nape (men)
export function hairCurtains(c: HairCtx): Part[] {
  const t = c.t;
  const fx = c.faceX;
  if (c.view !== 'q') return [];
  const part: V2 = [fx + 0.13, -0.4];
  return [
    {
      name: 'hairMan',
      d: R(c, [
        [-0.47, -0.08, 0.02],
        [-0.5, -0.34, 0.12],
        [-0.22, -0.66, 0.2],
        [0.18, -0.67, 0.22],
        [0.5, -0.44, 0.16],
        [0.55, -0.08, 0.1],
        [0.5, 0.2, 0.06],
        [0.42, 0.27, 0.04],
        [0.36, 0.1, 0.06],
        [0.2, -0.1, 0.05],
        [0.05, -0.13, 0.04],
        // the near curtain's tip at the brow, the part, the far curtain down to the cheekbone
        [fx + 0.27, -0.06, 0.02],
        [part[0] + 0.03, -0.27, 0.06],
        [part[0], part[1], 0],
        [part[0] - 0.05, -0.26, 0.06],
        [-0.4, -0.03, 0.02],
      ]),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.1, -0.8], [0.2, -0.3], [0.28, 0.3]]), fill: t.shade},
        {d: crescent(c, 0.0, -0.04, 0.52, 0.56, 214, 300, 0.07), fill: t.sheen},
        // the part as a crisp notch of shade
        {d: PG(c, [[part[0] - 0.012, part[1] + 0.002], [part[0] + 0.03, -0.6], [part[0] + 0.05, -0.6], [part[0] + 0.012, part[1] + 0.01]]), fill: t.shade},
      ],
      z: 56,
    },
  ];
}

// ---------------------------------------------------------------- H6: boho knotless braids, half-up, curly ends
export function hairBraids(c: HairCtx, ends: Tone, o: {len?: number} = {}): Part[] {
  const t = c.t;
  const L = o.len ?? 2.3;
  if (c.view !== 'q') return [];
  const grooves = (xs: number[], y0: number, y1: number, lean = 0): {d: string; fill: string}[] =>
    xs.map((x, i) => ({
      d: PG(c, [
        [x, y0],
        [x + 0.012 + lean * 0.3, (y0 + y1) / 2],
        [x + lean, y1],
        [x - 0.012 + lean * 0.3, (y0 + y1) / 2],
      ]),
      fill: i % 2 ? t.deep : t.shade,
    }));
  const curls = (cx: number, cy: number, w: number): string => {
    // a row of small loose curls: unequal round lobes along the braids' ends
    const pts: RV[] = [];
    const n = 6;
    pts.push([cx - w / 2, cy - 0.06, 0.02]);
    for (let i = 0; i <= n; i++) {
      const x = cx - w / 2 + (w * i) / n;
      pts.push([x, cy + 0.07 + (i % 2 ? 0.035 : 0.0) + (i % 3 === 0 ? 0.015 : 0), 0.03]);
      if (i < n) pts.push([x + w / n / 2, cy + 0.03, 0.005]);
    }
    pts.push([cx + w / 2, cy - 0.06, 0.02]);
    return R(c, pts);
  };
  return [
    // the length behind the shoulders, framing the neck
    {
      name: 'braidsBack',
      d: R(c, [
        [-0.46, -0.2, 0.1],
        [-0.6, 0.3, 0.14],
        [-0.64, 1.0, 0.14],
        [-0.5, 1.2, 0.08],
        [0.3, 1.2, 0.08],
        [0.6, 1.0, 0.14],
        [0.6, 0.3, 0.14],
        [0.44, -0.3, 0.14],
      ]),
      fill: t.deep,
      regions: grooves([-0.5, -0.36], 0.1, 1.1),
      z: 18,
    },
    // the head: the braids' roots pulled back from a centre part, a top knot at the crown
    {
      name: 'braidsCap',
      d: R(c, [
        [-0.43, -0.06, 0.02],
        [-0.49, -0.32, 0.12],
        [-0.22, -0.6, 0.2],
        [0.2, -0.6, 0.2],
        [0.5, -0.38, 0.16],
        [0.54, 0.0, 0.1],
        [0.5, 0.3, 0.06],
        [0.3, 0.32, 0.04],
        [0.24, 0.1, 0.06],
        [0.1, -0.16, 0.08],
        [c.faceX + 0.16, -0.36, 0.02],
        [-0.3, -0.24, 0.1],
        [-0.38, -0.08, 0.02],
      ]),
      fill: t.lit,
      regions: [
        {d: rightOf(c, [[0.12, -0.8], [0.22, -0.2], [0.3, 0.4]]), fill: t.shade},
        ...grooves([-0.2, 0.0, 0.2, 0.36], -0.56, -0.1, 0.06),
        {d: crescent(c, 0.0, -0.02, 0.5, 0.54, 212, 262, 0.05), fill: t.sheen},
      ],
      z: 56,
    },
    {
      name: 'topKnot',
      d: R(c, [[0.02, -0.62, 0.1], [0.18, -0.78, 0.12], [0.38, -0.7, 0.1], [0.36, -0.5, 0.08], [0.16, -0.48, 0.08]]),
      fill: t.lit,
      regions: [{d: rightOf(c, [[0.22, -0.9], [0.26, -0.4]]), fill: t.shade}, {d: crescent(c, 0.2, -0.6, 0.15, 0.12, 200, 280, 0.035), fill: t.sheen}],
      z: 57,
    },
    // a group of braids over the near shoulder, down the front, breaking into curly ends
    {
      name: 'braidsFront',
      d: R(c, [
        [0.26, 0.08, 0.04],
        [0.5, 0.2, 0.1],
        [0.58, 0.7, 0.14],
        [0.62, L - 0.4, 0.12],
        [0.6, L - 0.1, 0.06],
        [0.3, L - 0.1, 0.06],
        [0.3, L - 0.5, 0.14],
        [0.26, 0.7, 0.14],
        [0.22, 0.3, 0.08],
      ]),
      fill: t.lit,
      regions: [{d: rightOf(c, [[0.46, 0.0], [0.5, 1.0], [0.52, L]]), fill: t.shade}, ...grooves([0.36, 0.44, 0.52], 0.25, L - 0.15, 0.02)],
      z: 75,
    },
    {name: 'braidsEnds', d: curls(0.45, L - 0.02, 0.36), fill: ends.lit, regions: [{d: rightOf(c, [[0.5, L - 0.3], [0.52, L + 0.3]]), fill: ends.shade}], z: 74.9},
  ];
}
