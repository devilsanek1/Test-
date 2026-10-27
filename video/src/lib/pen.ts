// pen.ts — the CLEAN PEN and the ATTENTION TIERS (opt-in). Every film keeps the sketch pen unless its entry switches.
// Pure TS (no React, no imports): lib/sketch.ts reads the mode at call time; lib/Ink, lib/Fill and lib/mascot/Elephant
// read it at render time and get the tier of what they draw from lib/tier.tsx (a React context the kit sets).
// Owner, 2026-10-27 (v3 G5b): "too busy ... too rough and messy, a lot of rough lines, not looking clean at all ...
// cleaner, more refined, gentle, premium"; the supporting life "a bit more subtle but yet alive". Measured spec:
// docs/look/CRAFT.md §b-§c (the retro: it wins) and src/v3/film/kit/README.md "Clean pen and tiers".
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
//   set by ATTENTION TIER (CRAFT §b), by story role, never by depth:
//   subject      A: the beat's 1-3 objects (THE laptop, the tag, the phone, you, the stick, the chart): the only full
//                outline, in the object's OWN deep shade (its tone L* -35, hue kept, never below L* 16; no tone: a deep
//                warm brown, never near-black), widths x0.88 of the authored (3.4 -> 3.0 outline, 2.2 -> 1.9 detail,
//                1.6 -> 1.4 hair; <= 3.0); an outline given `inside` (its fill) is drawn inside the fill at 2x, so
//                the silhouette is the clean fill edge. Fills and motion untouched.
//   support      B: supporting life (Pip, people, an audience, steam) and story objects off-beat (the data center):
//                NO outline: shapes part by value; a scope with `lines` (close values touch; the mascot) draws
//                same-hue lines x0.53 (3.4 -> 1.8; 1.6-2.2 px) at the tone's L* -20, or with no tone a deep warm
//                brown at 42 % over what is under it; fills' value pulled 8 % toward the background's, chroma x0.9
//                (<= 40), hue kept; motion x0.5.
//   environment  C: the room, shelves, desk dressing, the street, the town, weather: NO line. Strokes that ARE the
//                thing (wires, rails, a bird's V) as hairlines 1.2-1.6 px near their background's value; fills' value
//                pulled 16 % toward the background's, chroma x0.85 (<= 36), hue kept; motion x0.4.
//   Untagged ink (a scene's own hand-drawn pieces) is 'support' WITH lines (thin, tinted) until the scene tiers it.
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
  subject: {k: 0.88, min: 1.2, max: 3.0, drop: 35, floor: 16, color: '#4B2A1E', alpha: 1, contours: true, strokes: true, minStroke: 0, pull: 0, chromaK: 1, chromaMax: 200, motion: 1},
  support: {k: 0.53, min: 1.6, max: 2.2, drop: 20, floor: 20, color: '#5A2E1E', alpha: 0.42, contours: false, strokes: false, minStroke: 8, pull: 0.08, chromaK: 0.9, chromaMax: 40, motion: 0.5},
  environment: {k: 0.4, min: 1.2, max: 1.6, drop: 14, floor: 24, color: '#5A2E1E', alpha: 0.34, contours: false, strokes: false, minStroke: 24, pull: 0.16, chromaK: 0.85, chromaMax: 36, motion: 0.4},
};

export type PenConfig = {
  mode: PenMode;
  tiers: Record<Tier, TierSpec>;
  /** The tier of Ink / Fill drawn outside any tier scope (a scene's own hand-drawn pieces) ... */
  untagged: Tier;
  /** ... and whether its contours and strokes are drawn (as the tier's tinted lines) until the scene tiers them. */
  untaggedLines: boolean;
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
  untaggedLines: true,
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
  untaggedLines?: boolean;
  bg?: string;
  emissive?: string[];
  tiers?: Partial<Record<Tier, Partial<TierSpec>>>;
};

/** Switch the pen for this bundle: call once, at module load, before the first frame renders (a film's look module). */
export function setPen(mode: PenMode, o: SetPenOpts = {}) {
  PEN.mode = mode;
  if (o.untagged) PEN.untagged = o.untagged;
  if (o.untaggedLines !== undefined) PEN.untaggedLines = o.untaggedLines;
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

/** A fill colour on a calmer tier: its VALUE pulled toward the background's by spec.pull (the local contrast drops),
 *  its chroma x chromaK capped at chromaMax, its hue kept (never mixed toward the background's hue: a blue pulled
 *  toward a peach wall would go grey; "warm, never sickly"). Identity for the subject, emissive colours and non-hex
 *  paints. */
export function tierFill(hex: string, tier: Tier, bg: string = PEN.bg): string {
  const s = PEN.tiers[tier];
  if (s.pull <= 0 && s.chromaK >= 1 && s.chromaMax >= 200) return hex;
  if (isEmissive(hex)) return hex;
  return cached(`f${hex}|${tier}|${bg}`, () => {
    const lab = hexToLab(hex);
    if (!lab) return hex;
    const gL = hexToLab(bg)?.[0] ?? lab[0];
    const L = lab[0] + (gL - lab[0]) * s.pull;
    const C = Math.hypot(lab[1], lab[2]);
    const k = C > 1e-6 ? Math.min(C * s.chromaK, s.chromaMax) / C : 0;
    return labToHex([L, lab[1] * k, lab[2] * k]);
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

/** Clean screen width of a LIGHT line (glint, snow edge, rim, a steam wisp) on a tier: a hairline on every tier
 *  (CRAFT §c: 1.2-1.8 px). */
export function tierLightWidth(screenW: number, tier: Tier): number {
  const s = PEN.tiers[tier];
  return Math.min(1.8, Math.max(1.2, screenW * s.k));
}
