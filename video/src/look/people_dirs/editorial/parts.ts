// Editorial people: one drawn shape (dir_editorial.md §4). A part is one closed smooth outline in screen units
// (H = 1000), a material, and how it is painted: 'form' = its one soft light gradient (the default), or one flat tone of
// the material's ramp (a crisp cast shape, a sheen, a lens). `z` is the painter's order (back to front).
import type {PP, V2} from './core';

export type Tone = 'form' | 'hi' | 'base' | 'shade' | 'deep' | 'sheen';
export type Part = {
  k: string;
  pts: PP[];
  mat: string;
  tone?: Tone;
  z: number;
  /** Clip to another part's outline (a cast shape inside its form). */
  clip?: string;
  /** Regions cut out of this part (an open coat's front opening). */
  cut?: PP[][];
  /** A true line (a strap, a lash, a sunglasses arm): the stroke width; the path is open. */
  line?: number;
  tension?: number;
  /** Opacity of a flat tone (a lip tone, a taper). */
  op?: number;
  /** A forced gradient axis (unit, screen: from the lit side toward the shade side). */
  gAxis?: V2;
  /** Gradient strength (1 = the full ramp, 0 = flat base). */
  gk?: number;
  /** A gradient group: parts of one garment (a seat and its two legs, a hair mass split in two layers) share ONE
   *  gradient computed over all their points, so no seam shows where they overlap. */
  grp?: string;
};

/** The painter's layers. */
export const Z = {
  backHair: 4,
  farArm: 10,
  farLeg: 18,
  leg: 20,
  shoe: 22,
  lower: 30,
  top: 40,
  outer: 50,
  outerDetail: 52,
  /** The neck sits under the tops (a crew or mock neck covers its base; an open collar shows the chest under it). */
  neck: 35,
  tail: 62,
  head: 66,
  face: 68,
  hair: 70,
  hairDetail: 72,
  nearArm: 80,
  hand: 82,
  frontHair: 86,
  acc: 90,
} as const;
