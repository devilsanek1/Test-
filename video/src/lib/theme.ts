// Shared design tokens. Every component must read colors and geometry from here (never hardcode).
// Seeded from pixel samples of the reference; the style bible stream may refine values (same keys).

export const palette = {
  bg: '#A6CABB', // mint page background (also the "sky" block inside panels)
  card: '#FFFFFF',
  ink: '#302013', // dark brown linework + caption text
  sun: '#EC6B2E', // the orange disc / primary accent
  highlight: '#F6B892', // caption keyword highlight box (peach)
  peach: '#E4BC9E',
  salmon: '#F2A57E',
  cream: '#F3E3CC',
  tan: '#B79A83',
  brown: '#836C54',
  teal: '#506E6A', // deep teal (doors, glass, shadows)
  tealDark: '#3F615F',
  sage: '#769689',
  mintPale: '#EAF6E5', // ground / glass fill
  olive: '#444233',
  grey: '#D6D6CB',
} as const;

export type PaletteKey = keyof typeof palette;

export const canvas = {width: 1080, height: 1920, fps: 30} as const;

// Card (polaroid) in canvas coordinates. Scene content is authored in CARD-LOCAL coordinates (0..card.w, 0..card.h).
export const card = {x: 60, y: 120, w: 960, h: 1400, radius: 0} as const;

// Illustration panel (the colored block) in card-local coordinates. Linework may overshoot outside it, like the reference.
export const panel = {x: 70, y: 95, w: 820, h: 1000} as const;

// Caption zone in card-local coordinates (centered text, max two lines).
export const captionZone = {x: 60, y: 1120, w: 840, h: 240} as const;

// The orange disc in card-local coordinates.
export const sun = {cx: 480, cy: 100, r: 78} as const;

export const stroke = {
  ink: 3, // default line weight at 1080 px width
  inkThin: 2,
  inkBold: 4.5,
} as const;

export const type = {
  family: 'CaptionHand', // @font-face name; the style stream installs the font file in public/fonts
  size: 64,
  lineHeight: 1.32,
  color: palette.ink,
} as const;
