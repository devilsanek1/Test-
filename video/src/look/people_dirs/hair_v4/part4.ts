// HAIR v4: the part, extended. A Part4 is a graphic/part.ts Part (one closed outline, its fill, regions clipped by it, a
// z) with three optional additions that Fig4 (render.tsx) draws and the old Figure ignores (it falls back to the flat
// fill, so a v4 head still draws in the old renderer):
//   paint    a linear gradient instead of the flat fill (the soft shading: one gentle ramp across the whole hair)
//   regions  each may be blurred (a soft shadow or gloss edge) or painted with a gradient
//   rimBand  the rim light: a band inside this part along the FIGURE's silhouette on the key side (CRAFT §d.8: the
//            distance-field band x max(0, n.l), here as the part minus the whole figure shifted away from the light),
//            so it lights the hair's outer edge against the ground and never an edge against the face or another lock
import type {Part, Region} from '../graphic/part';
import type {V2} from './bez';

export type Stop = [number, string, number?];
export type Paint = {kind: 'lin'; a: V2; b: V2; stops: Stop[]};
export type Region4 = Region & {blur?: number; paint?: Paint};
export type RimBand = {dx: number; dy: number; color: string; opacity?: number; blur?: number};
export type Part4 = Omit<Part, 'regions'> & {regions?: Region4[]; paint?: Paint; rimBand?: RimBand};
