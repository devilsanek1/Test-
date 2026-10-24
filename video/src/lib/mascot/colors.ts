// The ONE place where the mascot's own colorway is defined. Everything else comes from theme tokens.
import {palette} from '../theme';

export type Colorway = {
  name: string;
  body: string; // main flat fill
  shade: string; // far legs, back of the ears, inside of a curled trunk
  earInner: string; // inner ear
  cheek: string; // tiny blush
  nail: string; // toenails
  shine: string; // tiny eye highlight (wide eyes only)
  ink: string; // linework (always the theme ink)
};

export const COLORWAYS = {
  // (a) muted PHP periwinkle, nudged a touch warmer/brighter so it sits in the reference's earthy palette.
  periwinkle: {
    name: 'Periwinkle',
    body: '#8D90CC',
    shade: '#7377B5',
    earInner: palette.salmon,
    cheek: palette.salmon,
    nail: palette.cream,
    shine: palette.card,
    ink: palette.ink,
  },
  // (b) warm peach / salmon
  peach: {
    name: 'Peach',
    body: '#EFA27E',
    shade: '#D98763',
    earInner: '#F7CDB6',
    cheek: '#E2735A',
    nail: palette.cream,
    shine: palette.card,
    ink: palette.ink,
  },
  // (c) the reference cat's orange accent
  orange: {
    name: 'Orange',
    body: palette.sun,
    shade: '#C9531F',
    earInner: palette.highlight,
    cheek: '#F6B892',
    nail: palette.cream,
    shine: palette.card,
    ink: palette.ink,
  },
} satisfies Record<string, Colorway>;

export type ColorwayKey = keyof typeof COLORWAYS;

/** The chosen colorway (see docs/mascot.md). */
export const MASCOT_COLORWAY: ColorwayKey = 'periwinkle';
export const MASCOT: Colorway = COLORWAYS[MASCOT_COLORWAY];
