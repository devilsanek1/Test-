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

/** Default motion timings (seconds), calibrated to docs/motion_spec.md (see also lib/spec.ts MOTION). */
export const timing = {
  fillDelay: 0.18, // a fill lands 0.13-0.27 s after its OUTLINE STARTS (ink-first mode)
  fillDur: 0.12, // grow 20% -> 100% over 3-4 frames (or a 1-frame pop)
  captionRoll: 0.45, // page change: whole stack scrolls up
  captionLine: 0.42, // line 2 rises
  highlightWipe: 0.19, // + 0.3 ms per px of box width
} as const;

// ---- style-bible additions (docs/style_bible.md, docs/theme_proposal.json)

/** Caption highlight box geometry, in em of the caption font size. One box spans a multi-word phrase; trailing punctuation stays outside. */
export const highlightBox = {padLeftEm: 0.02, padRightEm: 0.11, topEm: 0.671, bottomEm: 0.305, radiusEm: 0.035} as const;

/** The reference card is flat white with a hard edge: no grain, no shadow. */
export const cardSurface = {grain: false, shadow: false} as const;

/** How far ink may run past the panel block (px). */
export const overshoot = {maxSide: 60, maxTop: 80, maxBottom: 50, structural: [30, 62], medium: [6, 15], small: [3, 8]} as const;

// ---- engine v2: FULL-BLEED world (docs/BRIEF.md "CINEMATIC DIRECTION"). New keys only.

/** The full-bleed world: world coordinates = canvas pixels at camera rest (0..1080 x 0..1920). */
export const world = {
  w: 1080,
  h: 1920,
  /** Default eye-level horizon (y). Low camera: towers rise into the sky above it. */
  horizon: 768, // reference 2 median 0.40 H (docs/style_bible_ref2.md); peaks go lower (0.58-0.70 H)
  /** Default vanishing point. */
  vp: [540, 768] as [number, number],
  /** Author scenes this far past every frame edge (camera-continuous / push transitions zoom out by up to ~12%). */
  bleed: 140,
} as const;

/** Platform UI safe zones (canvas px). Captions + key action inside `action`; the bottom holds ground/foreground only. */
export const safe = {
  top: 180,
  bottom: 1520,
  /** Right-rail buttons cover x > rail.x for y in [rail.y0, rail.y1]. */
  rail: {x: 950, y0: 900, y1: 1500},
  action: {x0: 90, x1: 990, y0: 200, y1: 1480},
} as const;

/** The sun in full-bleed scenes, sitting on the far hills (reference 2 measured: r 94 median, centre y 639). Baseline r 94-120; peaks only: r 270-490. */
export const sunWorld = {cx: 540, cy: 650, r: 100} as const;

/** Captions in the SKY (screen space, upper third). Baselines in canvas px. */
export const skyCaption = {
  cx: 520, // reference 2 centres captions slightly left of frame centre (clears the right rail)
  line1: 387,
  line2: 510,
  /** A one-line page sits centred between the two slots (motion spec 4). */
  oneLine: 448,
  size: 98, // reference 2 measured (emphasis pages ~168)
  maxWidth: 850,
  /** Roll window: text outside [clipTop, clipBottom] is hidden (lines rise into it; pages scroll out of it). */
  clipTop: 280,
  clipBottom: 570,
  /** 'scroll' = reference 1's measured page scroll / line-2 rise / highlight wipe (docs/motion_spec.md 4).
   *  'pop' = reference 2's grammar (docs/style_bible_ref2.md 3): pages, lines and highlight boxes pop in 1 frame. */
  motion: 'scroll' as 'scroll' | 'pop',
} as const;

/** Caption tones: dark ink on light skies, white on dark (dusk/night) skies. The highlight word is ink on peach in both. */
export const captionTones = {
  dark: {text: palette.ink, highlight: palette.highlight, highlightText: palette.ink},
  light: {text: palette.white, highlight: palette.highlight, highlightText: palette.ink},
} as const;
export type CaptionTone = keyof typeof captionTones;

/** Ink weight by depth (style bible 3 + 6): on-screen px. Far things get no ink at all (fill-only). */
export const depthInk = {front: 4.8, mid: 3.4, far: 2.2, hair: 1.6} as const;

/** Sky colours for the time of day (flat; switch with a pop or a wipe, never a fade). */
export const skies = {
  day: '#ACD1BF', // reference 2 day sky
  golden: palette.cream,
  dusk: palette.sage,
  night: '#588077', // reference 2 night sky (never darker behind captions)
  deep: palette.tealDark,
} as const;

// ---- engine v2.1 (review 2). New keys only.

/** Full-bleed (sky) caption highlight box, reference 2 measured (style_bible_ref2 3): square corners, 0.19 em padding on
 *  BOTH sides, top 0.90 em above the baseline (ascenders stay inside), bottom 0.19 em below it, trailing punctuation
 *  INSIDE the box ('asking.', 'cool.', 'jobs,'). In em of the caption font size. `highlightBox` stays for card captions. */
export const skyHighlightBox = {padEm: 0.19, topEm: 0.9, bottomEm: 0.19, radiusEm: 0.02, includePunct: true} as const;

/** Time of day (the same names as the cine lane's `Tod`). */
export type TodName = 'day' | 'golden' | 'dusk' | 'night' | 'dawn';

/** Sky colour per time of day: what a World sky key with only `tod` uses. */
export const todSky: Record<TodName, string> = {day: skies.day, golden: skies.golden, dusk: skies.dusk, night: skies.night, dawn: skies.day};

/** Caption tone that reads on each time of day's sky (ref 2: ink on day and dusk, white once the sky is night). */
export const todTone: Record<TodName, CaptionTone> = {day: 'dark', golden: 'dark', dusk: 'dark', night: 'light', dawn: 'dark'};

/** Subtree roles with their own relight row: far hills / skyline, clouds, foreground framing (palm fronds). */
export type TodRole = 'base' | 'far' | 'cloud' | 'framing';

/** Reference 2's night haze step (style_bible_ref2 8: night sky #588077 -> far #4B706B -> tealDark #3E605F). */
export const nightFar = '#4B706B';

/** THE SHARED RELIGHT STEP TABLE (style_bible_ref2 4, pixel-mapped across reference 2's dusk tween). Only the LIGHT
 *  fields step down: one palette step at dusk, two for the near ground at night. Whites stay white (they read as lit);
 *  mid and dark tones, ink, the sun and the highlight never move. Rows are per TodRole (`base` = everything, the other
 *  roles fall back to `base` for colours they do not list); keys are palette token names, values colours.
 *  Read by <Fill> through the <Tod> context (lib/tod.tsx); <World sky> keys with `tod` switch it with the sky wipe. */
export const todSteps: Record<TodName, Partial<Record<TodRole, Partial<Record<PaletteKey, string>>>>> = {
  day: {},
  golden: {},
  dawn: {},
  dusk: {
    base: {mintPale: palette.sky, cream: palette.sand, sand: palette.tan},
    // far mintPale follows the base row (-> sky): sage would BE the dusk sky
    far: {sage: palette.teal, teal: palette.tealDark},
    // framing: teal fronds stay teal on the sage dusk sky (a darker silhouette, ref 2); teal -> sage would vanish
    // into the sky and leave only the ink (review 3). Sage fronds step down to teal for the same reason.
    framing: {sage: palette.teal},
  },
  night: {
    base: {mintPale: palette.sage, sky: palette.sage, cream: palette.sand, sand: palette.tan},
    far: {mintPale: nightFar, cream: palette.tan, sand: palette.tan, sage: nightFar, teal: palette.tealDark},
    cloud: {white: palette.sage, mintPale: palette.sage},
    // teal fronds one step LIGHTER than the night sky; tealDark stays (teal would be ~the night sky: 1.09:1)
    framing: {teal: palette.sage},
  },
};

/** Minimum contrast (WCAG ratio) between a relit fill and its sky: one palette step (the smallest designed step is
 *  reference 2's night haze, #4B706B on #588077 = 1.25:1). */
export const RELIGHT_MIN_STEP = 1.15;

const lum = (hex: string) => {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** WCAG contrast ratio of two hex colours (pure; also in Captions as `contrast`). */
export const contrastHex = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => p - q);
  return (y + 0.05) / (x + 0.05);
};

/** Colours each role puts AGAINST THE SKY (checked even when the table leaves them unchanged). */
const SKY_FACING: Partial<Record<TodRole, PaletteKey[]>> = {framing: ['teal', 'tealDark', 'sage'], far: ['sage', 'teal', 'mintPale'], cloud: ['white', 'mintPale']};

/** Relight table check (scripts/engine-numbers.mjs --check runs it): every fill the table relights, and every
 *  sky-facing colour of the far / cloud / framing roles, must stay at least one palette step (RELIGHT_MIN_STEP) off
 *  the sky of its time of day. Returns human-readable problems (empty = OK). */
export function relightProblems(): string[] {
  const out: string[] = [];
  const roles: TodRole[] = ['base', 'far', 'cloud', 'framing'];
  for (const tod of Object.keys(todSteps) as TodName[]) {
    const sky = todSky[tod];
    for (const role of roles) {
      const row = {...(todSteps[tod].base ?? {}), ...(role === 'base' ? {} : todSteps[tod][role] ?? {})} as Partial<Record<PaletteKey, string>>;
      const keys = new Set<PaletteKey>([...(Object.keys(row) as PaletteKey[]), ...(SKY_FACING[role] ?? [])]);
      for (const k of keys) {
        const c = row[k] ?? palette[k];
        const r = contrastHex(c, sky);
        if (r < RELIGHT_MIN_STEP) out.push(`${tod}/${role}: ${k} -> ${c} on the ${tod} sky ${sky} is ${r.toFixed(2)}:1 (< ${RELIGHT_MIN_STEP}: it vanishes into the sky)`);
      }
    }
  }
  return out;
}
