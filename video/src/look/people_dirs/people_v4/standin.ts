// PEOPLE v4: a STAND-IN haircut and shoulders for the face stills only (the hair round, hair_v4/, owns the real cuts;
// the assembler puts them on these heads). Drawn with the same pen so the face is judged next to clean shapes, never a
// helmet: her a long fall with a side-swept fringe tucked behind the ear (05's lesson: the ear shows); him a short
// cut, the top swept up and back, the sides tapered. One shade shape and one sheen each.
import type {V2} from '../graphic/geo';
import type {Tone} from '../graphic/color';
import {n, segs, type PNode, type Seg} from './pen';
import {polySegs, type PartV4} from './paint';
import type {FaceView, Sex} from './faces';

const C = (nodes: PNode[]) => segs(nodes, true);
const far = (pts: V2[]): Seg[] => polySegs(pts);

/** Hair parts in head units for a view: z 49 behind the head and neck, z 54 over the head. */
export function standinHair(sex: Sex, view: FaceView, t: Tone, fade?: string): PartV4[] {
  const sideFill = fade ?? t.shade;
  if (sex === 'f' && view === 'p') {
    const fall = C([
      n(0.02, -0.56, 8, 0.1, 0.2),
      n(0.5, -0.4, 60, 0.16, 0.16),
      n(0.645, 0.0, 88, 0.16, 0.3),
      n(0.63, 0.9, 93, 0.3, 0.25),
      n(0.58, 1.38, 120, 0.12, 0.05),
      n(0.44, 1.45, 182, 0.06, 0.08),
      n(0.27, 1.4, 250, 0.06, 0.2),
      n(0.225, 0.8, 268, 0.25, 0.25),
      n(0.19, 0.2, 262, 0.2, 0.12),
      n(0.1, -0.2, 230, 0.12, 0.1),
    ]);
    const cap = C([
      n(-0.462, -0.02, 252, 0, 0.07), // the fringe's tip, over the brow
      n(-0.495, -0.25, 280, 0.08, 0.1),
      n(-0.33, -0.525, 330, 0.11, 0.12),
      n(0.0, -0.6, 2, 0.12, 0.15),
      n(0.42, -0.48, 42, 0.13, 0.12),
      n(0.615, -0.15, 84, 0.12, 0.15),
      n(0.62, 0.3, 96, 0.12, 0.05),
      n(0.5, 0.36, 182, 0.06, 0.1),
      n(0.19, 0.31, 230, 0.1, 0.08), // behind the ear
      n(0.15, 0.1, 268, 0.08, 0.06),
      n(0.1, -0.02, 200, 0.05, 0.04), // over the ear's top
      n(-0.04, -0.075, 200, 0.05, 0.06),
      n(-0.25, -0.12, 168, 0.09, 0.1), // the fringe sweeping forward and down
      n(-0.462, -0.02, 136, 0.1, 0),
    ]);
    return [
      {name: 'hairBack', segs: fall, fill: t.shade, z: 49, regions: [{segs: far([[0.42, -1], [0.38, 1.6], [2, 1.6], [2, -1]]), fill: t.deep, opacity: 0.6}]},
      {
        name: 'hairCap',
        segs: cap,
        fill: t.lit,
        z: 54,
        regions: [
          {segs: far([[0.28, -1], [0.3, 0.2], [0.2, 0.5], [2, 0.5], [2, -1]]), fill: t.shade},
          {
            segs: C([n(-0.4, -0.36, 300, 0, 0.08), n(-0.17, -0.5, 345, 0.08, 0.1), n(0.12, -0.5, 15, 0.1, 0), n(-0.16, -0.455, 165, 0.1, 0.06), n(-0.4, -0.36, 120, 0.06, 0)]),
            fill: t.sheen,
            opacity: 0.85,
          },
        ],
      },
    ];
  }
  if (sex === 'm' && view === 'p') {
    const sides = C([
      n(-0.36, -0.3, 300, 0, 0.06),
      n(-0.2, -0.47, 330, 0.08, 0.1),
      n(0.1, -0.55, 5, 0.1, 0.12),
      n(0.45, -0.42, 50, 0.12, 0.1),
      n(0.555, -0.12, 85, 0.1, 0.1),
      n(0.53, 0.12, 105, 0.08, 0.06),
      n(0.42, 0.2, 190, 0.05, 0.05), // the nape's taper
      n(0.3, 0.12, 250, 0.05, 0.05),
      n(0.19, 0.0, 225, 0.06, 0.04), // behind the ear
      n(0.12, -0.06, 190, 0.04, 0.03),
      n(0.03, -0.03, 120, 0.03, 0.03),
      n(0.005, 0.08, 95, 0.04, 0.02), // the sideburn
      n(-0.02, 0.08, 270, 0.02, 0.06),
      n(-0.12, -0.18, 225, 0.08, 0.08),
      n(-0.36, -0.3, 200, 0.08, 0),
    ]);
    const top = C([
      n(-0.375, -0.31, 280, 0, 0.05),
      n(-0.38, -0.44, 300, 0.05, 0.05), // the lift at the front
      n(-0.25, -0.585, 340, 0.06, 0.1),
      n(0.08, -0.635, 5, 0.12, 0.14),
      n(0.42, -0.5, 45, 0.12, 0.08),
      n(0.5, -0.36, 120, 0.06, 0.06),
      n(0.3, -0.36, 185, 0.08, 0.1),
      n(-0.05, -0.36, 175, 0.12, 0.1),
      n(-0.26, -0.3, 160, 0.08, 0.05),
      n(-0.375, -0.31, 230, 0.05, 0),
    ]);
    return [
      {name: 'hairSides', segs: sides, fill: sideFill, z: 54, regions: [{segs: far([[0.32, -1], [0.26, 0.4], [2, 0.4], [2, -1]]), fill: t.shade, opacity: 0.55}]},
      {
        name: 'hairTop',
        segs: top,
        fill: t.lit,
        z: 54.5,
        regions: [
          {segs: far([[0.25, -1], [0.22, -0.2], [2, -0.2], [2, -1]]), fill: t.shade},
          {segs: C([n(-0.3, -0.5, 320, 0, 0.06), n(-0.08, -0.6, 355, 0.08, 0.08), n(0.18, -0.58, 15, 0.08, 0), n(-0.08, -0.56, 175, 0.08, 0.06), n(-0.3, -0.5, 140, 0.06, 0)]), fill: t.sheen, opacity: 0.8},
        ],
      },
    ];
  }
  if (sex === 'f' && view === 'q') {
    const back = C([
      n(-0.12, -0.6, 2, 0.1, 0.18),
      n(0.42, -0.45, 45, 0.15, 0.12),
      n(0.58, -0.05, 88, 0.14, 0.25),
      n(0.6, 0.8, 92, 0.25, 0.2),
      n(0.55, 1.32, 120, 0.1, 0.05),
      n(0.4, 1.42, 182, 0.06, 0.2),
      n(-0.3, 1.4, 178, 0.2, 0.06),
      n(-0.48, 1.3, 240, 0.06, 0.12),
      n(-0.54, 0.6, 268, 0.25, 0.2),
      n(-0.5, -0.15, 285, 0.18, 0.1),
      n(-0.36, -0.48, 320, 0.1, 0.08),
    ]);
    const cap = C([
      n(-0.432, 0.04, 262, 0, 0.08), // the fringe's end at the far brow
      n(-0.47, -0.25, 286, 0.08, 0.1),
      n(-0.3, -0.53, 332, 0.1, 0.1),
      n(0.06, -0.605, 2, 0.12, 0.14),
      n(0.41, -0.48, 42, 0.12, 0.1),
      n(0.535, -0.18, 84, 0.1, 0.1),
      n(0.525, 0.2, 98, 0.1, 0.04),
      n(0.45, 0.31, 178, 0.04, 0.04), // behind the near ear, low
      n(0.405, 0.1, 268, 0.07, 0.04),
      n(0.35, 0.02, 205, 0.04, 0.03), // over the ear's top
      n(0.26, 0.03, 158, 0.03, 0.04),
      n(0.12, -0.13, 214, 0.06, 0.08), // the hairline rising to the part
      n(-0.12, -0.1, 170, 0.1, 0.1), // the fringe sweeping across the forehead
      n(-0.432, 0.04, 140, 0.11, 0),
    ]);
    return [
      {name: 'hairBack', segs: back, fill: t.lit, z: 49, regions: [{segs: far([[0.12, -1], [0.1, 2], [2, 2], [2, -1]]), fill: t.shade}, {segs: far([[0.25, 0.3], [0.2, 2], [2, 2], [2, 0.3]]), fill: t.deep, opacity: 0.5}]},
      {
        name: 'hairCap',
        segs: cap,
        fill: t.lit,
        z: 54,
        regions: [
          {segs: far([[0.24, -1], [0.22, 0.5], [2, 0.5], [2, -1]]), fill: t.shade},
          {segs: C([n(-0.36, -0.38, 305, 0, 0.08), n(-0.1, -0.53, 350, 0.08, 0.1), n(0.2, -0.5, 18, 0.1, 0), n(-0.1, -0.49, 168, 0.1, 0.06), n(-0.36, -0.38, 125, 0.06, 0)]), fill: t.sheen, opacity: 0.85},
        ],
      },
    ];
  }
  if (sex === 'f' && view === 'l') {
    const back = C([
      n(-0.37, -0.34, 300, 0, 0.08),
      n(-0.02, -0.6, 2, 0.12, 0.15),
      n(0.44, -0.42, 52, 0.12, 0.12),
      n(0.53, 0.05, 92, 0.15, 0.25),
      n(0.52, 0.9, 94, 0.25, 0.15),
      n(0.42, 1.4, 160, 0.1, 0.08),
      n(0.05, 1.46, 182, 0.12, 0.12),
      n(-0.24, 1.38, 238, 0.08, 0.15),
      n(-0.27, 0.8, 268, 0.2, 0.15),
      n(-0.2, 0.36, 282, 0.12, 0.06), // behind the ear, low
      n(-0.172, 0.16, 262, 0.06, 0.04),
      n(-0.225, 0.02, 196, 0.04, 0.03), // over the ear's top
      n(-0.33, 0.01, 168, 0.03, 0.04),
      n(-0.41, -0.07, 250, 0.04, 0.06), // the temple
    ]);
    return [
      {name: 'hairBack', segs: back, fill: t.lit, z: 54, regions: [{segs: far([[0.13, -1], [0.1, 2], [2, 2], [2, -1]]), fill: t.shade}, {segs: C([n(-0.28, -0.36, 312, 0, 0.08), n(0.0, -0.53, 355, 0.1, 0.1), n(0.28, -0.45, 30, 0.1, 0), n(0.0, -0.48, 175, 0.1, 0.08), n(-0.28, -0.36, 132, 0.06, 0)]), fill: t.sheen, opacity: 0.85}]},
    ];
  }
  if (sex === 'm' && view === 'q') {
    const sides = C([
      n(-0.425, -0.12, 278, 0, 0.06),
      n(-0.42, -0.3, 300, 0.06, 0.08),
      n(-0.15, -0.55, 345, 0.1, 0.12),
      n(0.25, -0.53, 20, 0.12, 0.12),
      n(0.47, -0.3, 75, 0.1, 0.1),
      n(0.475, 0.06, 98, 0.1, 0.06),
      n(0.43, 0.2, 140, 0.04, 0.04), // the nape's taper
      n(0.405, 0.06, 262, 0.05, 0.03),
      n(0.35, -0.02, 205, 0.03, 0.03), // over the ear
      n(0.285, 0.0, 140, 0.03, 0.02),
      n(0.272, 0.08, 95, 0.02, 0.01), // the sideburn
      n(0.252, 0.08, 270, 0.01, 0.05),
      n(0.2, -0.14, 240, 0.06, 0.06),
      n(-0.05, -0.27, 185, 0.08, 0.1), // the front hairline
      n(-0.37, -0.2, 160, 0.1, 0.04),
    ]);
    const top = C([
      n(-0.36, -0.29, 275, 0, 0.05),
      n(-0.36, -0.44, 290, 0.05, 0.06), // the lift at the front
      n(-0.18, -0.6, 340, 0.08, 0.1),
      n(0.18, -0.64, 8, 0.12, 0.14),
      n(0.48, -0.44, 60, 0.12, 0.08),
      n(0.46, -0.3, 150, 0.05, 0.06),
      n(0.2, -0.34, 185, 0.1, 0.12),
      n(-0.12, -0.33, 178, 0.12, 0.1),
      n(-0.36, -0.29, 205, 0.06, 0),
    ]);
    return [
      {name: 'hairSides', segs: sides, fill: sideFill, z: 54, regions: [{segs: far([[0.24, -1], [0.2, 0.4], [2, 0.4], [2, -1]]), fill: t.shade, opacity: 0.55}]},
      {
        name: 'hairTop',
        segs: top,
        fill: t.lit,
        z: 54.5,
        regions: [
          {segs: far([[0.2, -1], [0.18, -0.2], [2, -0.2], [2, -1]]), fill: t.shade},
          {segs: C([n(-0.28, -0.5, 320, 0, 0.06), n(-0.04, -0.6, 355, 0.08, 0.08), n(0.24, -0.58, 15, 0.08, 0), n(-0.04, -0.56, 175, 0.08, 0.06), n(-0.28, -0.5, 140, 0.06, 0)]), fill: t.sheen, opacity: 0.8},
        ],
      },
    ];
  }
  if (sex === 'm' && view === 'l') {
    const sides = C([
      n(-0.425, -0.08, 282, 0, 0.06),
      n(-0.38, -0.36, 305, 0.08, 0.1),
      n(0.0, -0.565, 0, 0.14, 0.14),
      n(0.42, -0.4, 52, 0.12, 0.1),
      n(0.475, 0.0, 95, 0.1, 0.08),
      n(0.4, 0.23, 130, 0.06, 0.06),
      n(0.15, 0.31, 180, 0.08, 0.08), // the nape's taper
      n(-0.06, 0.28, 205, 0.06, 0.05),
      n(-0.19, 0.14, 250, 0.05, 0.04), // behind the ear
      n(-0.25, -0.02, 205, 0.04, 0.03), // over the ear
      n(-0.35, 0.0, 165, 0.03, 0.04),
    ]);
    const top = C([
      n(-0.37, -0.3, 300, 0, 0.06),
      n(-0.12, -0.6, 345, 0.1, 0.12),
      n(0.25, -0.6, 18, 0.12, 0.1),
      n(0.47, -0.36, 75, 0.08, 0.06),
      n(0.42, -0.2, 160, 0.05, 0.1),
      n(0.0, -0.17, 182, 0.14, 0.12),
      n(-0.37, -0.3, 228, 0.08, 0),
    ]);
    return [
      {name: 'hairSides', segs: sides, fill: sideFill, z: 54, regions: [{segs: far([[0.13, -1], [0.1, 0.5], [2, 0.5], [2, -1]]), fill: t.shade, opacity: 0.55}]},
      {name: 'hairTop', segs: top, fill: t.lit, z: 54.5, regions: [{segs: far([[0.14, -1], [0.12, 0.0], [2, 0.0], [2, -1]]), fill: t.shade}, {segs: C([n(-0.24, -0.46, 322, 0, 0.06), n(0.02, -0.57, 355, 0.08, 0.08), n(0.28, -0.52, 25, 0.08, 0), n(0.02, -0.53, 175, 0.08, 0.06), n(-0.24, -0.46, 140, 0.06, 0)]), fill: t.sheen, opacity: 0.8}]},
    ];
  }
  return [];
}

/** Shoulders and the top of a garment under a head, in head units (the face stills only). */
export function standinShoulders(sex: Sex, view: FaceView, t: Tone): PartV4[] {
  const m = sex === 'm';
  if (view === 'p') {
    const s = C([
      n(-0.1, 0.86, 175, 0, 0.06),
      n(-0.26, 1.04, 120, 0.1, 0.12),
      n(-0.34, 1.6, 95, 0.2, 0.1),
      n(-0.34, 2.2, 90, 0.2, 0),
      n(m ? 0.62 : 0.55, 2.2, 270, 0, 0.2),
      n(m ? 0.6 : 0.52, 1.35, 260, 0.2, 0.14),
      n(m ? 0.42 : 0.38, 0.94, 215, 0.12, 0.08),
      n(m ? 0.3 : 0.24, 0.84, 185, 0.06, 0),
    ]);
    return [{name: 'top', segs: s, fill: t.lit, z: 51, regions: [{segs: far([[0.18, 0.8], [0.25, 2.3], [2, 2.3], [2, 0.8]]), fill: t.shade}]}];
  }
  // 3/4 and the lost profile: both shoulders, the neckline between
  const w = m ? 1.12 : 1;
  const L = view === 'q' ? -0.2 : -0.28;
  const R = view === 'q' ? 0.3 : 0.24;
  const s2 = C([
    n(L, 0.87, 160, 0, 0.1),
    n(L - 0.5 * w, 1.05, 175, 0.15, 0.12),
    n(L - 0.68 * w, 1.4, 100, 0.12, 0.2),
    n(L - 0.7 * w, 2.2, 90, 0.2, 0),
    n(R + 0.75 * w, 2.2, 270, 0, 0.2),
    n(R + 0.72 * w, 1.38, 262, 0.2, 0.12),
    n(R + 0.52 * w, 1.03, 188, 0.12, 0.15),
    n(R, 0.85, 200, 0.1, 0.06),
    n((L + R) / 2, 0.93, 178, 0.06, 0.06),
  ]);
  return [{name: 'top', segs: s2, fill: t.lit, z: 51, regions: [{segs: far([[R - 0.05, 0.8], [R + 0.05, 2.3], [2, 2.3], [2, 0.8]]), fill: t.shade}]}];
}
