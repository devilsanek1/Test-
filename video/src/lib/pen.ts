// pen.ts — the CLEAN PEN and the ATTENTION TIERS (opt-in). Every film keeps the sketch pen unless its entry switches.
// Pure TS (no React, no imports): lib/sketch.ts reads the mode at call time; lib/Ink, lib/Fill and lib/mascot/Elephant
// read it at render time and get the tier of what they draw from lib/tier.tsx (a React context the kit sets).
// Owner, 2026-10-27 (v3 G5b): "too busy ... too rough and messy, a lot of rough lines, not looking clean at all ...
// cleaner, more refined, gentle, premium"; the supporting life "a bit more subtle but yet alive". Measured spec:
// docs/look/CRAFT.md (the retro) and src/v3/film/kit/README.md "Clean pen and tiers".
//
//   setPen('clean', {bg: EMBER.wall, emissive: [...]})   // once, at module load, in a film's look module (v3: look.ts)
//
// SKETCH (the default; v1, v2, every film before v3's rework): lines overshoot, drift, bow and break; rects are 4
//   strokes; loops overlap; fills misregister; strokes taper; ink is the near-black house ink at depth weights.
//   Nothing in this file changes it. (lib/sketch.ts's own setPenMode('clean') is v2r's lighter clean line: no
//   overshoot / breaks / drift / jitter. setPen('clean') includes it and adds everything below.)
// CLEAN: every shape is ONE subpath (a rect or a closed poly ends in Z, round joins), straight edges ruler-true (no
//   bow), loops are true ellipses closed with Z, no overshoot, breaks, jitter, open contours, taper, width noise or
//   loosening on the un-build, no texture marks (ticks, hatching, scribble); fills registered exactly. And the ink is
//   set by ATTENTION TIER, not by depth:
//   subject      the story's 1-3 objects (THE laptop, the tag, the phone, you, the stick, the chart): a clean line in
//                the object's OWN deep shade (its tone L* -35, hue kept, never below L* 16; no tone: a deep warm
//                brown, never near-black), widths x0.88 of the authored (3.4 -> 3.0 contour, 2.2 -> 1.9 detail,
//                1.6 -> 1.4 hair; <= 3.4). Fills and motion untouched.
//   support      what the story touches and the supporting life (the desk, the window, the lamp, Pip, people near,
//                the van): tone-on-tone lines x0.53 (3.4 -> 1.8, 1.0-2.2 px) in the tone's shade (-22 L*), or with
//                no tone a deep warm brown at 42 % over whatever is under it; specks under 8 px dropped; fills pulled
//                10 % toward the background, chroma x0.9 (<= 40); motion x0.6.
//   environment  dressing and ambient life (the shelves' contents, plants, mugs, crowds far, birds, snow, the town):
//                NO contours and no contour strokes; only strokes that ARE the thing (wires, strings, a bird's V)
//                as faint hairlines (0.9-1.6 px); fills pulled 22 % toward the background, chroma x0.8 (<= 34);
//                motion x0.4.
//   On every tier: a LIGHT line (an ink lighter than L* 64: glints, snow edges, rims) stays light and <= 1.8 px; a
//   GRAPHIC mark (a stroke >= 6 px wide, or dashed: the lamp rod, a mug handle, key rows) keeps its width and colour;
//   a backdrop fill (>= ~30 % of the frame: the wall, the sky, the desk plane) and an EMISSIVE colour (lit windows,
//   the lamp pool, screens) are never recoloured.

export type PenMode = 'sketch' | 'clean';
export type Tier = 'subject' | 'support' | 'environment';
/** environment < support < subject. */
export const TIER_RANK: Record<Tier, number> = {environment: 0, support: 1, subject: 2};
export const TIERS: Tier[] = ['subject', 'support', 'environment'];

export type TierSpec = {
  /** Line width = the authored screen width x k, clamped to [min, max] (screen px at camera rest). */
  k: number;
  min: number;
  max: number;
  /** With a known tone (the fill the line bounds): the line is the tone darkened by `drop` L* (hue kept, >= floor). */
  drop: number;
  floor: number;
  /** With no tone known: this colour at `alpha` (static) over whatever is under it (tone-on-tone by construction). */
  color: string;
  alpha: number;
  /** Closed subpaths (outlines of shapes) are drawn. */
  contours: boolean;
  /** Open strokes that are not marked `thing` (contour pieces, edge lines, bands) are drawn. */
  strokes: boolean;
  /** Open strokes shorter than this (screen px) are dropped: specks, ticks, crumbs. 0 = keep all. */
  minStroke: number;
  /** Fills: pulled toward the background colour by `pull` (CIE Lab), chroma x chromaK, capped at chromaMax. */
  pull: number;
  chromaK: number;
  chromaMax: number;
  /** Idle-motion amplitude factor (kit life reads it with useTierMotion()). */
  motion: number;
};

export const CLEAN_TIERS: Record<Tier, TierSpec> = {
  subject: {k: 0.88, min: 1.2, max: 3.4, drop: 35, floor: 16, color: '#4B2A1E', alpha: 1, contours: true, strokes: true, minStroke: 0, pull: 0, chromaK: 1, chromaMax: 200, motion: 1},
  support: {k: 0.53, min: 1.0, max: 2.2, drop: 22, floor: 20, color: '#5A2E1E', alpha: 0.42, contours: true, strokes: true, minStroke: 8, pull: 0.1, chromaK: 0.9, chromaMax: 40, motion: 0.6},
  environment: {k: 0.4, min: 0.9, max: 1.6, drop: 14, floor: 24, color: '#5A2E1E', alpha: 0.26, contours: false, strokes: false, minStroke: 24, pull: 0.22, chromaK: 0.8, chromaMax: 34, motion: 0.4},
};

export type PenConfig = {
  mode: PenMode;
  tiers: Record<Tier, TierSpec>;
  /** The tier of Ink / Fill drawn outside any tier scope (a scene's own hand-drawn pieces). */
  untagged: Tier;
  /** The background the calmer tiers' fills are pulled toward (a tier scope's `bg` wins: e.g. the sky outdoors). */
  bg: string;
  /** Fills at least this big (sqrt of the frame fraction, camera excluded; 0.55 = 30 % of the frame) are backdrops. */
  backdrop: number;
  /** An ink at least this light (L*) is a LIGHT line (glint, snow edge, rim). */
  light: number;
  /** An ink at most this dark (L*) is the house ink: it takes the tier's line colour. Between: a deliberate tone line. */
  dark: number;
  /** Strokes at least this wide (screen px) are graphic marks: width and colour kept. */
  graphic: number;
  /** Emissive colours (upper-case #RRGGBB): light sources, never recoloured by a tier. */
  emissive: Set<string>;
  /** Corner radius of a clean rect() outline: min(max, k * min(w, h)) (hidden under the line: the fill stays square). */
  corner: {k: number; max: number};
};

export const PEN: PenConfig = {
  mode: 'sketch',
  tiers: {subject: {...CLEAN_TIERS.subject}, support: {...CLEAN_TIERS.support}, environment: {...CLEAN_TIERS.environment}},
  untagged: 'support',
  bg: '#F6E3D4',
  backdrop: 0.55,
  light: 64,
  dark: 30,
  graphic: 6,
  emissive: new Set<string>(),
  corner: {k: 0.04, max: 3},
};

/** True when the clean pen is on (read at call / render time). */
export const isClean = () => PEN.mode === 'clean';

export type SetPenOpts = {
  untagged?: Tier;
  bg?: string;
  emissive?: string[];
  tiers?: Partial<Record<Tier, Partial<TierSpec>>>;
};

/** Switch the pen for this bundle: call once, at module load, before the first frame renders (a film's look module). */
export function setPen(mode: PenMode, o: SetPenOpts = {}) {
  PEN.mode = mode;
  if (o.untagged) PEN.untagged = o.untagged;
  if (o.bg) PEN.bg = o.bg;
  if (o.emissive) PEN.emissive = new Set(o.emissive.map((c) => c.toUpperCase()));
  if (o.tiers) for (const k of Object.keys(o.tiers) as Tier[]) PEN.tiers[k] = {...PEN.tiers[k], ...o.tiers[k]};
  COLOR_CACHE.clear();
}

/** The lower (less prominent) of two tiers. */
export const minTier = (a: Tier, b: Tier): Tier => (TIER_RANK[a] <= TIER_RANK[b] ? a : b);

// ---------------------------------------------------------------- colour (sRGB <-> CIE Lab, D65)

export type Lab = [number, number, number];
const COLOR_CACHE = new Map<string, string>();
const LAB_CACHE = new Map<string, Lab | null>();

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const toLin = (x: number) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
const toGam = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

/** CIE Lab of a #rgb / #rrggbb colour (null for anything else: 'none', url(...), named colours). */
export function hexToLab(hex: string): Lab | null {
  let v = LAB_CACHE.get(hex);
  if (v !== undefined) return v;
  if (!HEX.test(hex)) v = null;
  else {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255));
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    v = [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  if (LAB_CACHE.size > 4000) LAB_CACHE.clear();
  LAB_CACHE.set(hex, v);
  return v;
}

export function labToHex([L, a, b]: Lab): string {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t: number) => (t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787);
  const X = inv(fx) * 0.95047;
  const Y = inv(fy);
  const Z = inv(fz) * 1.08883;
  const r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  const g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  const bl = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  const c = (v: number) => Math.round(Math.min(1, Math.max(0, toGam(v))) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(bl)}`.toUpperCase();
}

/** L* of a colour (null for non-hex paints). */
export const lightness = (hex: string): number | null => hexToLab(hex)?.[0] ?? null;

const cached = (key: string, make: () => string): string => {
  let v = COLOR_CACHE.get(key);
  if (v === undefined) {
    v = make();
    if (COLOR_CACHE.size > 8000) COLOR_CACHE.clear();
    COLOR_CACHE.set(key, v);
  }
  return v;
};

/** The colour `dL` L* lighter (negative = darker), hue kept, most of its chroma kept (an own-colour shade, never
 *  grey), L* never below `floor` (or the colour's own L* if it is already darker). Non-hex paints pass through. */
export function shadeL(hex: string, dL: number, floor = 16): string {
  return cached(`s${hex}|${dL}|${floor}`, () => {
    const lab = hexToLab(hex);
    if (!lab) return hex;
    const L = Math.min(100, Math.max(Math.min(lab[0], floor), lab[0] + dL));
    const k = Math.min(1, L / Math.max(1, lab[0]));
    const ck = 0.8 + 0.2 * k;
    return labToHex([L, lab[1] * ck, lab[2] * ck]);
  });
}

/** True for a colour registered as emissive (a light source). */
export const isEmissive = (hex: string) => PEN.emissive.has(hex.toUpperCase());

/** A fill colour on a calmer tier: pulled toward `bg` by spec.pull (Lab), chroma x chromaK capped at chromaMax.
 *  Identity for the subject, emissive colours and non-hex paints. */
export function tierFill(hex: string, tier: Tier, bg: string = PEN.bg): string {
  const s = PEN.tiers[tier];
  if (s.pull <= 0 && s.chromaK >= 1 && s.chromaMax >= 200) return hex;
  if (isEmissive(hex)) return hex;
  return cached(`f${hex}|${tier}|${bg}`, () => {
    const lab = hexToLab(hex);
    if (!lab) return hex;
    const g = hexToLab(bg) ?? lab;
    const L = lab[0] + (g[0] - lab[0]) * s.pull;
    let a = lab[1] + (g[1] - lab[1]) * s.pull;
    let b = lab[2] + (g[2] - lab[2]) * s.pull;
    const C = Math.hypot(a, b);
    const C2 = Math.min(C * s.chromaK, s.chromaMax);
    if (C > 1e-6) {
      a *= C2 / C;
      b *= C2 / C;
    }
    return labToHex([L, a, b]);
  });
}

/** Line colour on a tier: the tone's shade when a tone is known, else the tier's own line colour (and its alpha). */
export function tierLineColor(tier: Tier, tone?: string): {color: string; alpha: number} {
  const s = PEN.tiers[tier];
  if (tone && hexToLab(tone)) return {color: shadeL(tone, -s.drop, s.floor), alpha: 1};
  return {color: s.color, alpha: s.alpha};
}

/** Clean screen width for an authored screen width on a tier (graphic marks keep theirs). */
export function tierWidth(screenW: number, tier: Tier): number {
  if (screenW >= PEN.graphic) return screenW;
  const s = PEN.tiers[tier];
  return Math.min(s.max, Math.max(s.min, screenW * s.k));
}

/** Clean screen width of a LIGHT line (glint, snow edge, rim) on a tier: thin on every tier. */
export function tierLightWidth(screenW: number, tier: Tier): number {
  const s = PEN.tiers[tier];
  return Math.min(1.8, Math.max(0.9, screenW * s.k));
}
