// colours.ts — Pip's colourway, from the film's role tokens (src/v2r/palette.ts, CM.pip*), tier B since 2026-10-27
// (DIRECTION rule 2: every Pip colour at C* <= 25): periwinkle body #9495C1 (L* 63 / C* 25; dE76 23-50 from every ground
// of 10 Canal Mint), shade #73739D (the far ear, far legs: depth is colour, never grey; 13 L* under the body), the pink
// of the inner ear, cheeks and teddy-bear soles #F2C3CC, the knitted straw-mustard scarf #D8C599. Under the clean pen the
// line is the body's own shade (the pen's B line, 1.6-2.2 px), never the ink #2B1B0A.

import {CM} from '../../palette';
import type {FillRole} from './model';

export const PIP_COLOURS = {
  body: CM.pipBody,
  shade: CM.pipShade,
  inner: CM.pipEar,
  sole: CM.pipEar,
  cheek: CM.pipEar,
  scarf: CM.pipScarf,
  eye: CM.ink,
  glint: CM.paper,
  ink: CM.ink,
  paper: CM.paper,
} as const;

export const PIP_INK = CM.ink;

export function pipFill(role: FillRole | 'paper'): string {
  return (PIP_COLOURS as Record<string, string>)[role] ?? CM.pipBody;
}
