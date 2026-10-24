// cine/atmosphere.ts — time-of-day palettes and STEPPED atmospheric perspective, all derived from the
// reference palette (theme.palette). No gradients: depth tints snap to a few flat steps.
//
//   const P = TOD.dusk;                       // full theme-compatible palette (same keys as `palette`) + sky extras
//   P.skyBands                                // flat sky value steps, top -> horizon
//   atmos(palette.tan, 0.8, 'dusk')           // a far building: ambient-shifted, then pulled toward the haze
//   ambient(palette.cream, 'night')           // the same paint seen at night (no depth tint)
//   tone(depth)                               // which haze step a depth falls into (0..steps)
//
// Measured anchors: reference 2's dusk sky is sage #6D988B (f_33), its night sky teal #547977 (f_38, f_42);
// lit bulbs are peach with a sage halo disc (f_38). Deeper night steps are tealDark at 78% / 60% value.

import {palette} from '../theme';
import {hexToRgb, mix, rgbToHex} from './util';

export type Tod = 'day' | 'golden' | 'dusk' | 'night' | 'dawn';
export const TODS: Tod[] = ['day', 'golden', 'dusk', 'night', 'dawn'];

/** Multiply a colour's RGB by k (k < 1 darkens, keeps hue). */
export function shade(hex: string, k: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * k, g * k, b * k);
}

const P = palette;

/** Deep teal steps for night skies (tealDark at lower value: same hue, no new pigment). */
export const deep = {
  teal78: shade(P.tealDark, 0.78),
  teal60: shade(P.tealDark, 0.6),
  teal45: shade(P.tealDark, 0.45),
} as const;

type Base = {-readonly [K in keyof typeof palette]: string};

export type TodPalette = Base & {
  name: Tod;
  /** Flat sky value steps, top -> horizon (draw with <Sky>). */
  skyBands: string[];
  /** Colour far layers are pulled toward (atmospheric perspective). */
  haze: string;
  /** Flat band right on the horizon / around a low sun. */
  horizonGlow: string;
  /** Halo colour for stepped glows (sun, lamps, bulbs). */
  glow: string;
  sunColor: string;
  cloud: string;
  cloudShade: string;
  /** Clouds get ink on their top (day) or are fill-only (dusk / night, like ref 2 f_42). */
  cloudInk: boolean;
  star: string;
  /** Star density 0..1 (0 in daylight). */
  stars: number;
  windowLit: string[];
  windowDark: string;
  /** Building fill choices for the nearest row (atmos() tints them with depth). */
  facade: string[];
  /** Fill-only dark shapes (far silhouettes, backlit figures). */
  silhouette: string;
  /** Rim light / lit edge colour. */
  rim: string;
  ground: string;
  /** Caption text colour on this sky (ref 2: ink on light skies, white on teal). */
  text: string;
  /** How strongly ordinary paint is shifted toward `ambientTo` (see ambient()). */
  ambientK: number;
  ambientTo: string;
  /** Max haze mix for depth 1 (atmos()). */
  hazeMax: number;
};

function make(name: Tod, o: Omit<TodPalette, keyof Base | 'name'>): TodPalette {
  const base = {} as Base;
  for (const k of Object.keys(P) as (keyof typeof P)[]) {
    const keep = k === 'ink' || k === 'sun' || k === 'highlight' || k === 'card';
    base[k] = keep ? P[k] : mix(P[k], o.ambientTo, o.ambientK);
  }
  base.sky = o.skyBands[0];
  base.bg = o.skyBands[Math.min(1, o.skyBands.length - 1)];
  return {...base, name, ...o};
}

export const TOD: Record<Tod, TodPalette> = {
  day: make('day', {
    skyBands: [P.sky, P.sky, mix(P.sky, P.mintPale, 0.3)],
    haze: mix(P.sky, P.mintPale, 0.3),
    horizonGlow: mix(P.sky, P.mintPale, 0.55),
    glow: P.mintPale,
    sunColor: P.sun,
    cloud: P.white,
    cloudShade: P.mintPale,
    cloudInk: true,
    star: P.cream,
    stars: 0,
    windowLit: [P.cream, P.white],
    windowDark: P.teal,
    facade: [P.cream, P.sand, P.white, P.mintPale, P.tan],
    silhouette: P.sage,
    rim: P.white,
    ground: P.mintPale,
    text: P.ink,
    ambientK: 0,
    ambientTo: P.sky,
    hazeMax: 0.78,
  }),
  golden: make('golden', {
    skyBands: [P.sky, mix(P.sky, P.cream, 0.4), mix(P.cream, P.peach, 0.3)],
    haze: mix(P.cream, P.sky, 0.3),
    horizonGlow: mix(P.peach, P.cream, 0.45),
    glow: P.peach,
    sunColor: P.sun,
    cloud: P.cream,
    cloudShade: P.sand,
    cloudInk: true,
    star: P.cream,
    stars: 0,
    windowLit: [P.peach, P.cream],
    windowDark: P.teal,
    facade: [P.cream, P.sand, P.tan, P.mintPale],
    silhouette: mix(P.sky, P.teal, 0.45),
    rim: P.cream,
    ground: P.cream,
    text: P.ink,
    ambientK: 0.1,
    ambientTo: P.peach,
    hazeMax: 0.75,
  }),
  dusk: make('dusk', {
    skyBands: [P.teal, P.sage, P.sky, mix(P.peach, P.cream, 0.25)],
    haze: mix(P.sky, P.peach, 0.35),
    horizonGlow: mix(P.peach, P.cream, 0.45),
    glow: P.peach,
    sunColor: P.sun,
    cloud: P.sage,
    cloudShade: P.teal,
    cloudInk: false,
    star: P.cream,
    stars: 0.45,
    windowLit: [P.peach, P.cream],
    windowDark: P.tealDark,
    facade: [P.tealDark, P.teal, P.tan, P.brown],
    silhouette: P.tealDark,
    rim: P.peach,
    ground: P.teal,
    text: P.white,
    ambientK: 0.22,
    ambientTo: P.teal,
    hazeMax: 0.8,
  }),
  night: make('night', {
    skyBands: [deep.teal60, deep.teal78, P.tealDark, P.teal],
    haze: mix(P.teal, P.tealDark, 0.35),
    horizonGlow: P.teal,
    glow: P.sage,
    sunColor: P.sun,
    cloud: P.teal,
    cloudShade: P.tealDark,
    cloudInk: false,
    star: P.cream,
    stars: 1,
    windowLit: [P.peach, P.cream],
    windowDark: deep.teal78,
    facade: [P.tealDark, P.teal, deep.teal78],
    silhouette: deep.teal60,
    rim: P.sage,
    ground: P.tealDark,
    text: P.white,
    ambientK: 0.42,
    ambientTo: deep.teal78,
    hazeMax: 0.72,
  }),
  dawn: make('dawn', {
    skyBands: [P.sage, mix(P.sky, P.peach, 0.25), mix(P.peach, P.cream, 0.5)],
    haze: mix(P.sky, P.cream, 0.45),
    horizonGlow: P.cream,
    glow: P.cream,
    sunColor: P.sun,
    cloud: P.cream,
    cloudShade: P.sand,
    cloudInk: true,
    star: P.cream,
    stars: 0.15,
    windowLit: [P.cream, P.peach],
    windowDark: P.teal,
    facade: [P.sand, P.tan, P.cream, P.teal],
    silhouette: P.teal,
    rim: P.cream,
    ground: P.sand,
    text: P.ink,
    ambientK: 0.12,
    ambientTo: P.peach,
    hazeMax: 0.75,
  }),
};

export const todPal = (tod: Tod | TodPalette): TodPalette => (typeof tod === 'string' ? TOD[tod] : tod);

/** The paint `color` under this time of day's ambient light (no depth tint). ink / sun / highlight never shift. */
export function ambient(color: string, tod: Tod | TodPalette): string {
  const p = todPal(tod);
  if (color === P.ink || color === P.sun || color === P.highlight || p.ambientK <= 0) return color;
  return mix(color, p.ambientTo, p.ambientK);
}

export type AtmosOpts = {
  /** Number of flat steps between depth 0 and 1. Default 4. */
  steps?: number;
  /** Haze mix at depth 1. Default palette.hazeMax. */
  max?: number;
  /** >1 keeps mid layers clearer. Default 1.35. */
  gamma?: number;
  /** Skip the ambient shift (colour is already a tod colour). */
  raw?: boolean;
};

/** Which flat haze step a depth falls into, as a 0..1 value (stepped). */
export const tone = (depth: number, steps = 4) => Math.round(Math.max(0, Math.min(1, depth)) * steps) / steps;

/** Depth-tinted flat colour: ambient-shifted paint pulled toward the sky haze in a few STEPS (far = flatter,
 *  closer to the sky). depth 0 = near, 1 = horizon. */
export function atmos(color: string, depth: number, tod: Tod | TodPalette, o: AtmosOpts = {}): string {
  const p = todPal(tod);
  const q = tone(depth, o.steps ?? 4);
  const amt = (o.max ?? p.hazeMax) * Math.pow(q, o.gamma ?? 1.35);
  return mix(o.raw ? color : ambient(color, p), p.haze, amt);
}

/** Ink weight for a depth (style bible ladder: 4.8 front, 3.4 mid, 2.2 far, 1.6 hair; none past `none`). */
export function inkForDepth(depth: number, none = 0.72): number {
  if (depth >= none) return 0;
  if (depth <= 0) return 4.8;
  if (depth < 0.25) return 3.4;
  if (depth < 0.5) return 2.2;
  return 1.6;
}
