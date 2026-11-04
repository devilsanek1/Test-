// FLOW v5, BREEZE: colour. Every person is ONE colour mass (the garment) with the hair and legs as the dark accent and
// the skin a small warm note; each shape is painted with one soft gradient toward the key (upper left) and lit on its
// key-facing edge by a thin rim. Colours are chosen in LCh (graphic/color.ts, read-only) so a family stays a family.
import {fromLch, lch, mixLab} from '../../graphic/color';
import type {V2} from './v';
import type {Paint} from './render';

/** A colour from L* C* h. */
export const lc = (L: number, C: number, h: number) => fromLch(L, C, h);
/** Shift a colour in LCh. */
export function shift(hex: string, dL: number, dC = 0, dh = 0): string {
  const q = lch(hex);
  return fromLch(Math.max(0, Math.min(100, q.L + dL)), Math.max(0, q.C + dC), q.h + dh);
}
export {mixLab};

/** A garment's colours from its one base colour: the lit side, the turned-away side, the shade plane, the rim. */
export type Cloth = {lit: string; base: string; shade: string; deep: string; rim: string};
export function cloth(base: string, o: {rim?: string; warm?: number} = {}): Cloth {
  const q = lch(base);
  const w = o.warm ?? 1;
  return {
    lit: fromLch(Math.min(96, q.L + 7), q.C * 1.04 + 1, q.h + 4 * w),
    base,
    shade: fromLch(Math.max(4, q.L - 12), q.C * 0.92, q.h - 8 * w),
    deep: fromLch(Math.max(3, q.L - 20), q.C * 0.85, q.h - 12 * w),
    rim: o.rim ?? fromLch(Math.min(94, q.L + 26), Math.max(10, q.C * 0.72), q.h + 14 * w),
  };
}
export type Skin = {lit: string; base: string; shade: string; blush: string; rim: string};
export function skin(base: string): Skin {
  const q = lch(base);
  return {
    lit: fromLch(Math.min(96, q.L + 4), q.C + 1, q.h + 2),
    base,
    shade: fromLch(q.L - 11, q.C + 4, q.h - 10),
    blush: fromLch(q.L - 6, q.C + 16, q.h - 22),
    rim: fromLch(Math.min(96, q.L + 12), q.C * 0.8, q.h + 6),
  };
}
export type Dark = {lit: string; base: string; rim: string; eye: string};
/** The dark accent (hair, legs): near black with a hue, a lighter lift toward the key, a dim warm rim. */
export function dark(base: string, rim?: string): Dark {
  const q = lch(base);
  return {
    lit: fromLch(q.L + 9, q.C + 3, q.h + 6),
    base,
    rim: rim ?? fromLch(Math.min(70, q.L + 30), q.C + 12, q.h + 30),
    eye: fromLch(Math.max(6, q.L - 4), q.C, q.h),
  };
}

/** One soft gradient across a shape toward the key: lit at a, base at b (figure units). */
export const soft = (a: V2, b: V2, lit: string, base: string, mid = 0.5, midC?: string): Paint => ({
  lin: [a, b],
  stops: midC ? [[0, lit], [mid, midC], [1, base]] : [[0, lit], [1, base]],
});
