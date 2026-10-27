// pen.ts — the CLEAN PEN switch and the ATTENTION TIERS (opt-in; every film keeps the sketch pen unless its entry
// switches). Pure TS (no React): lib/sketch.ts reads the mode at call time; lib/Ink, lib/Fill and lib/mascot read the
// tier specs through lib/tier.tsx. Owner, 2026-10-27 (v3 G5b): "too busy ... too rough and messy, a lot of rough
// lines ... cleaner, more refined, gentle, premium"; the supporting life "a bit more subtle but yet alive".
// Spec and defaults: src/v3/film/kit/README.md "Clean pen and tiers" (measured on v3 G5b vs the references).
//
//   setPen('clean')          // once, at module load, in a film's look module (src/v3/film/look.ts); default 'sketch'
//
// SKETCH (default, every film before v3's rework): lines overshoot, drift, bow and break; rects are 4 strokes; loops
//   overlap; fills misregister; ink is the near-black house ink at depth weights. Nothing here changes it.
// CLEAN: one closed subpath per shape (round joins, Z), ruler-true straight edges, true ellipses, no overshoot, no
//   breaks, no jitter, no texture marks; fills registered exactly; ink by ATTENTION TIER, not by depth:
//   subject      the story's 1-3 objects: a clean contour 3.0 px (details 2.0, hairs 1.4) in the object's OWN shade
//                (its tone L* -35, hue kept, never below L* 16; no tone known: a warm deep brown, never near-black);
//                fills untouched; full motion.
//   support      what the story touches and the supporting life (the desk, window, lamp, Pip, a crowd's front row, the
//                van): tone-on-tone lines 1.8 / 1.3 px (tone L* -22, or the authored ink at 30 % over whatever is
//                under it); fills a little calmer (value contrast 0.85x about the key, chroma 0.85x, <= 38); motion 0.5x.
//   environment  dressing and ambient life (shelves' contents, plants, mugs, crowds far, birds, snow, the town): NO
//                contours (closed outlines dropped, specks < 30 px dropped); open strokes that ARE the thing (wires,
//                a bird's V, steam) as faint hairlines (1.2 px, 22 %); fills calm (value 0.72x, chroma 0.75x, <= 32);
//                motion 0.35x.
//   Light lines (an ink lighter than L* 64: glints, snow edges, rims) stay light at <= 1.6 px on every tier.

export type PenMode = 'sketch' | 'clean';
export type Tier = 'subject' | 'support' | 'environment';
/** environment < support < subject: a piece is never more prominent than the tier it sits in. */
export const TIER_RANK: Record<Tier, number> = {environment: 0, support: 1, subject: 2};

export type TierSpec = {
  /** Line widths (screen px, before camera ink compensation) for authored widths >= 2.8 (contours), 1.9-2.8
   *  (details), < 1.9 (hairs). Authored widths >= 6 are graphic marks (a chart line) and keep their width. */
  contour: number;
  detail: number;
  hair: number;
  /** Line colour = the tone (the object's main fill) darkened by this many L*. */
  lineDrop: number;
  /** No tone known: a solid line colour (subject) ... */
  lineColor?: string;
  /** ... or the authored ink at this opacity, so it darkens whatever it sits on by a relative step (tone-on-tone). */
  lineAlpha?: number;
  /** Closed subpaths (outlines of filled shapes) are not drawn. */
  dropContours: boolean;
  /** Open subpaths shorter than this (px) are not drawn (specks, ticks, crumbs). 0 = keep all. */
  minStroke: number;
  /** Fills: value contrast kept about the key L* (1 = unchanged), chroma factor and cap (CIE Lab C*). */
  valueK: number;
  chromaK: number;
  chromaMax: number;
  /** Idle-motion amplitude factor (kit life reads it with useTierMotion()). */
  motion: number;
};

export const CLEAN_TIERS: Record<Tier, TierSpec> = {
  subject: {contour: 3.0, detail: 2.0, hair: 1.4, lineDrop: 35, lineColor: '#4B2A1E', dropContours: false, minStroke: 0, valueK: 1, chromaK: 1, chromaMax: 200, motion: 1},
  support: {contour: 1.8, detail: 1.3, hair: 1.1, lineDrop: 22, lineAlpha: 0.3, dropContours: false, minStroke: 0, valueK: 0.85, chromaK: 0.85, chromaMax: 38, motion: 0.5},
  environment: {contour: 1.2, detail: 1.2, hair: 1.0, lineDrop: 14, lineAlpha: 0.22, dropContours: true, minStroke: 30, valueK: 0.72, chromaK: 0.75, chromaMax: 32, motion: 0.35},
};

export const PEN = {
  mode: 'sketch' as PenMode,
  tiers: CLEAN_TIERS,
  /** Ink / Fill outside any <Tier> (a scene's own hand-drawn pieces). */
  untagged: 'support' as Tier,
  /** The value key the calmer tiers are pulled toward (L*; the room's mid between the wall and the desk). */
  key: 76,
  /** Fills at least this big (sqrt of the frame fraction; 0.55 = 30 % of the frame) are backdrops: never recoloured. */
  backdrop: 0.55,
  /** An ink at least this light (L*) is a LIGHT line (glint, snow edge, rim): kept light and thin on every tier. */
  light: 64,
  /** Corner radius of a clean rect() outline: clamp(k * min(w, h), min, max). */
  corner: {k: 0.04, min: 2, max: 6},
};

/** True when the clean pen is on (read at call time). */
export const isClean = () => PEN.mode === 'clean';

/** Switch the pen for this bundle (call once, at module load, before the first frame renders). */
export function setPen(mode: PenMode, o: {untagged?: Tier; key?: number; tiers?: Partial<Record<Tier, Partial<TierSpec>>>} = {}) {
  PEN.mode = mode;
  if (o.untagged) PEN.untagged = o.untagged;
  if (o.key !== undefined) PEN.key = o.key;
  if (o.tiers) for (const k of Object.keys(o.tiers) as Tier[]) PEN.tiers[k] = {...PEN.tiers[k], ...o.tiers[k]};
  COLOR_CACHE.clear();
}

/** Lower of two tiers (a piece inside an environment group is environment). */
export const minTier = (a: Tier, b: Tier): Tier => (TIER_RANK[a] <= TIER_RANK[b] ? a : b);

// ---------------------------------------------------------------- colour (sRGB <-> CIE Lab, D65)

type Lab = [number, number, number];
const COLOR_CACHE = new Map<string, string>();

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const toLin = (x: number) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
const toGam = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

export function hexToLab(hex: string): Lab | null {
  if (!HEX.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255));
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
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

/** The colour `dL` L* darker (negative = darker), hue kept, chroma eased a little as it darkens, L* >= floor. */
export function shadeL(hex: string, dL: number, floor = 16): string {
  const key = `s${hex}${dL}${floor}`;
  let v = COLOR_CACHE.get(key);
  if (v === undefined) {
    const lab = hexToLab(hex);
    if (!lab) v = hex;
    else {
      const L = Math.max(Math.min(lab[0], floor), lab[0] + dL);
      const k = L / Math.max(1, lab[0]);
      const ck = 0.75 + 0.25 * k; // keep most of the hue's chroma: an own-colour shade, never grey
      v = labToHex([L, lab[1] * ck, lab[2] * ck]);
    }
    COLOR_CACHE.set(key, v);
  }
  return v;
}

/** A fill colour on a tier: value contrast pulled toward the key L*, chroma eased and capped. Non-hex paints pass. */
export function tierFill(hex: string, tier: Tier): string {
  const s = PEN.tiers[tier];
  if (s.valueK === 1 && s.chromaK === 1 && s.chromaMax >= 200) return hex;
  const key = `f${hex}${tier}`;
  let v = COLOR_CACHE.get(key);
  if (v === undefined) {
    const lab = hexToLab(hex);
    if (!lab) v = hex;
    else {
      const L = PEN.key + (lab[0] - PEN.key) * s.valueK;
      const C = Math.hypot(lab[1], lab[2]);
      const C2 = Math.min(C * s.chromaK, s.chromaMax);
      const k = C > 1e-6 ? C2 / C : 0;
      v = labToHex([L, lab[1] * k, lab[2] * k]);
    }
    COLOR_CACHE.set(key, v);
  }
  return v;
}

/** Clean width for an authored width on a tier (graphic marks >= 6 px keep theirs). */
export function tierWidth(w: number, tier: Tier): number {
  if (w >= 6) return w;
  const s = PEN.tiers[tier];
  return w >= 2.8 ? s.contour : w >= 1.9 ? s.detail : s.hair;
}
