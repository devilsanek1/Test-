// lib/figure tones: every material of the figure as 2-3 flat planes and a rim (docs/look/paint_recipes/people.md §b):
// LIT (the base, the key side), SHADE (the form shade away from the key: the subject's -18 to -22 L*, DIRECTION rule 5),
// DEEP (small accents only: under the arm, under the scarf, the bun's underside, the far limbs), RIM (a thin warm edge on
// the key-facing contour, +12 to +16 L*: rim light only on the subject). Shadows are colour, never grey: the shade turns
// the hue toward the shade family (cool violet-blue under a warm sun) and keeps its chroma; the rim turns toward gold.
import {fromLch, lch} from '../light';

export type Tone = {lit: string; shade: string; deep: string; rim: string};

/** The hue of the shade family under a low warm sun (a cool violet-blue sky fill): shades turn toward it. */
export const SHADE_HUE = 285;
/** The hue of the warm key (gold): rims and lit edges turn toward it. */
export const KEY_HUE = 70;

const turn = (h: number, to: number, max: number) => {
  const d = ((to - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), max);
};

export type ToneOpts = {
  /** dL* of the form shade (default -20: tier A's subject step). */
  shade?: number;
  /** dL* of the deep accent (default -30). */
  deep?: number;
  /** dL* of the rim (default +14). */
  rim?: number;
  /** Max hue turn of the shade toward SHADE_HUE (default 14 degrees) and of the rim toward KEY_HUE (default 22). */
  shadeTurn?: number;
  rimTurn?: number;
  /** Chroma factor in the shade (default 0.95: colour, never grey). */
  shadeC?: number;
};

/** The planes of one material from its lit colour. Very dark materials (hair, boots) get a smaller shade step (the
 *  value range has no room below them) and a stronger rim, so their form still reads. */
export function tone(lit: string, o: ToneOpts = {}): Tone {
  const q = lch(lit);
  const dark = q.L < 30;
  const dS = o.shade ?? (dark ? -7 : -20);
  const dD = o.deep ?? (dark ? -11 : -30);
  const dR = o.rim ?? (dark ? 16 : 14);
  const hs = turn(q.h, SHADE_HUE, o.shadeTurn ?? 14);
  const hr = turn(q.h, KEY_HUE, o.rimTurn ?? 22);
  return {
    lit,
    shade: fromLch(Math.max(4, q.L + dS), q.C * (o.shadeC ?? 0.95), hs),
    deep: fromLch(Math.max(3, q.L + dD), q.C * 0.9, hs),
    rim: fromLch(Math.min(97, q.L + dR), q.C * 1.05 + 3, hr),
  };
}

/** A colour lifted by a local light (a phone screen, a lit doorway): L* + dL, its hue turned toward the light's hue. */
export function litBy(base: string, light: string, dL: number, maxTurn = 40): string {
  const q = lch(base);
  const l = lch(light);
  return fromLch(Math.min(97, q.L + dL), q.C * 0.85 + l.C * 0.25, turn(q.h, l.h, maxTurn));
}
