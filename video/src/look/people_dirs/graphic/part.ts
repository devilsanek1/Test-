// MODERN GRAPHIC people: a figure is an ordered list of PARTS. A part is one closed outline in its lit colour, with
// regions drawn inside it (clipped by it): the shade plane, a deep cast shadow, a sheen. A few parts are true lines
// (a strap, a straw, a cable): `line` instead of a fill.
import {V2, poly} from './geo';

export type Region = {d: string; fill: string; opacity?: number};
export type Part = {
  name: string;
  d: string;
  fill: string;
  regions?: Region[];
  /** draw order (bigger = later, nearer) */
  z: number;
  /** a true line: stroke width (local units) and colour; d is then an open path */
  line?: {w: number; color: string; cap?: 'round' | 'butt'};
  opacity?: number;
  /** excluded from the black silhouette test (a cast shadow on the ground) */
  ground?: boolean;
  /** a region cut out of the part (an open coat's front): a closed path, any size */
  cut?: string;
};

export const region = (pts: V2[] | string, fill: string, opacity?: number): Region => ({
  d: typeof pts === 'string' ? pts : pts.length > 2 ? poly(pts) : '',
  fill,
  opacity,
});

export type Built = {parts: Part[]; /** the figure's bounding box in local units */ box: {x0: number; x1: number; y0: number; y1: number}};
