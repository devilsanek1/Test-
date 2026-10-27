// colours.ts — Pip's colourway, from the film's role tokens (src/v2r/palette.ts, CM.pip*): periwinkle body #9497D8
// (dE76 39-59 from every ground of 10 Canal Mint), shade #7579C0 (the far ear, far legs: depth is colour, never grey),
// the pink of the inner ear, cheeks and teddy-bear soles #F2C3CC, the knitted mustard scarf #D4A960, ink #2B1B0A.

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
