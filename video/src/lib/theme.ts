// Shared design tokens. Every component must read colors and geometry from here (never hardcode).
// Seeded from pixel samples of the reference; the style bible stream may refine values (same keys).

export const palette = {
  bg: '#A6CABB', // mint page background (also the "sky" block inside panels)
  card: '#FFFFFF',
  ink: '#2B1B0A', // dark brown linework + caption text
  sun: '#EC6B2E', // the orange disc / primary accent
  highlight: '#F6B892', // caption keyword highlight box (peach)
  peach: '#F6B892', // placards, screens, awnings (same paint as highlight)
  salmon: '#F6B892', // alias of peach (no second salmon in the reference)
  cream: '#F3E0CB', // light walls
  tan: '#BA977E', // dark walls, shade step ('clay')
  brown: '#88652F', // ochre: hair, jackets, trunks, posts
  teal: '#547977', // doors, frames, coats
  tealDark: '#3E605F', // darkest fill: shade step, kick panels, dusk sky
  sage: '#6D988B', // glass panes, tree crowns, cladding
  mintPale: '#EBF6E5', // ground / glass fill
  olive: '#3E605F', // alias of tealDark (not in the reference; avoid)
  grey: '#D9BBA1', // alias of sand (not in the reference; avoid)
  sky: '#A6CABB', // panel sky block
  sand: '#D9BBA1', // mid walls, necks/skin, light hair, paper dog-ears
  clay: '#BA977E', // alias of tan
  ochre: '#88652F', // alias of brown
  white: '#FFFFFF', // paper, signs, unfilled line-art people, glass glare
} as const;

export type PaletteKey = keyof typeof palette;

export const canvas = {width: 1080, height: 1920, fps: 30} as const;

// Card (polaroid) in canvas coordinates. Scene content is authored in CARD-LOCAL coordinates (0..card.w, 0..card.h).
export const card = {x: 60, y: 120, w: 960, h: 1400, radius: 0} as const;

// Illustration panel (the colored block) in card-local coordinates. Linework may overshoot outside it, like the reference.
export const panel = {x: 96, y: 96, w: 768, h: 944} as const;

// Caption zone in card-local coordinates (centered text, max two lines).
export const captionZone = {x: 90, y: 1136, w: 780, h: 220} as const;

// The orange disc in card-local coordinates.
export const sun = {cx: 480, cy: 132, r: 72} as const;

export const stroke = {
  ink: 3.4, // default (mid-depth) line weight at 1080 px width
  inkThin: 2.2, // far / detail lines
  inkBold: 4.8, // foreground figures, heavy ledges
  inkHair: 1.6, // glints, paper text lines, cables
  taperEnd: 0.45, // long lines thin to this fraction of width at their ends
} as const;

export const type = {
  family: 'CaptionHand', // @font-face name; the style stream installs the font file in public/fonts
  size: 82,
  lineHeight: 1.17, // 96 px baseline-to-baseline
  color: palette.ink,
  weight: 400, // Patrick Hand has one weight; never fake-bold
  letterSpacing: 0,
  maxLineWidth: 780,
  baselines: {line1: 1208, line2: 1304, punch: 1265}, // card-local
  punchScale: 1.16, // one-line punch captions
  hookScale: 1.06, // opening / loop caption
  clip: {top: 1070, bottom: 1400}, // card-local caption viewport for the roll
} as const;

// ---- engine additions (engine stream). New keys only; values above are owned by the style stream.

/** Fill misregistration: fills sit offset from their linework like a slightly misaligned print. */
export const misreg = {dx: 1.5, dy: 1, jitter: 3} as const;

/** Default motion timings (seconds). */
export const timing = {
  fillDelay: 0.12, // fill lands this long after its linework finishes
  fillDur: 0.32,
  captionRoll: 0.42, // whole caption rolls up/out as the next rolls in
  captionLine: 0.37, // line 2 rolls in when its word is spoken
  highlightWipe: 0.25, // ease-out
} as const;

// ---- style-bible additions (docs/style_bible.md, docs/theme_proposal.json)

/** Caption highlight box geometry, in em of the caption font size. One box spans a multi-word phrase; trailing punctuation stays outside. */
export const highlightBox = {padLeftEm: 0.02, padRightEm: 0.11, topEm: 0.671, bottomEm: 0.305, radiusEm: 0.035} as const;

/** The reference card is flat white with a hard edge: no grain, no shadow. */
export const cardSurface = {grain: false, shadow: false} as const;

/** How far ink may run past the panel block (px). */
export const overshoot = {maxSide: 60, maxTop: 80, maxBottom: 50, structural: [30, 62], medium: [6, 15], small: [3, 8]} as const;
