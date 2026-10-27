// lib/sky.tsx: ONE CONTINUOUS SKY, a gentle, natural gradient that survives video. Film-agnostic and OPT-IN: nothing
// changes until a film draws <Sky> (v1 / v3 never import it). The owner, v2 G4 (2026-10-27): "why is it blue sky and
// then suddenly abruptly orange, weird ... maybe when it comes to sky we can find a beautiful way to do a gentle
// gradient ... again find the pro way and tools to do it the best way you can". The rules: DIRECTION rules 5-6 (the sky
// is the ONE place a gradient is welcome: one gentle gradient from the frame top to the horizon, warmest at the sun and
// the horizon, nearly flat inside the caption band, dithered so it never bands, the far haze takes the sky's lowest
// colour); the numbers and the check: docs/look/CRAFT.md §g; the how-to: lib/SKY.md; why this method and the sources:
// docs/look/research/2026-10-27_sky_gradients.md.
//
// THE METHOD (what colour scientists, illustrators and graphics engineers do, adopted):
//  1. KEY COLOURS IN OKLCH, MIXED IN OKLAB (Björn Ottosson's Oklab, 2020; the matrices of the CSS Color 4 reference
//     code). Oklab is built so a straight mix keeps the hue and the lightness even: no muddy grey or khaki midpoint
//     between the mint and the peach (a plain sRGB mix of #BCDCCF and #FBD9BB goes through khaki #DCDBC5).
//  2. EASED, NEVER LINEAR: one smooth curve through the keys (a monotone cubic, Fritsch-Carlson), so the colour's slope
//     never jumps: a linear multi-stop gradient has a kink at every stop, and the eye draws a line there (Mach bands;
//     the "easing gradients" technique). Where a key is a plateau (the caption band) or a turn (the light band), the
//     curve eases in and out of it like smoothstep.
//  3. DENSE SVG STOPS IN FLOAT PRECISION: the curve is sampled into as many stops as it needs (a stop wherever a straight
//     run would leave the curve by more than 0.25 of a code value), written as color(srgb r g b) floats, which Chrome
//     keeps at sub-code precision (hex and rgb() stops are rounded to whole codes).
//  4. THE SUN IS PART OF THE SKY: a soft elliptical warmth around a low sun, wider than tall, falling to nothing with a
//     smootherstep (no edge, no disc); the disc itself stays a flat shape the film draws on top.
//  5. DITHERED, TWICE: Chrome already dithers every gradient by +-0.5 of a code (Skia), which keeps the RAW frame
//     smooth but is erased by any encoder; on top we add a static BLUE-NOISE texture of +-amp codes per channel (a 64 px
//     void-and-cluster tile, our own: scripts/look/make_blue_noise.py), added exactly in 8-bit with `plus-lighter` /
//     `difference` blends, so it is zero-mean (the colour stays what the curve says), invisible (+-0.4-0.8 L*, all at
//     the finest grain) and still strong enough for the master encode to keep (CRAFT §g has the numbers).
//  6. THE CAPTION BAND GUARD: inside the caption band (default y 317-556) the sky stays nearly flat (max dL* 1.5 by
//     default): keys inside it are pulled toward their mean until it holds, and the sun's warmth never reaches it.
//
//   const sky = eveningSky({band: CM.sky, horizon: '#FBD9BB', horizonY: 800, sun: {x: 196, y: 772, rx: 340}});
//   <Sky spec={sky} />            // the set's bottom layer, inside its camera group (the dither moves with the sky)
//   horizonColor(sky)              // the far haze (lib/depth's atmosphere), = the sky's lowest colour
//   skyColorAt(sky, 640, 196)      // the sky at a point (a far plane's air, a window's reflection)
//   skyProblems(sky, {ink: CM.ink}) // [] = OK: band flatness, caption contrast, no khaki or grey zone
//
// Deterministic: a pure function of the spec (no Math.random, no clock); the same spec renders the same pixels on
// every frame and every machine (Chrome's own dither aside, which is ordered). Unlit (CRAFT §d.9): never put the sky
// under a light layer; the clean pen never recolours it (raw SVG, no Ink / Fill).
import React, {useId, useMemo} from 'react';

// ================================================================= OKLab (Ottosson 2020; CSS Color 4 matrices)

export type Oklab = [number, number, number];
/** OKLCH: l 0..1, c chroma (0..~0.37 in sRGB), h degrees. */
export type Oklch = {l: number; c: number; h: number};
/** A sky colour: '#RRGGBB' / '#RGB', or OKLCH. */
export type SkyColor = string | Oklch;
type Rgb = [number, number, number];

// linear sRGB -> LMS: CSS Color 4's exact sRGB -> XYZ matrix times its XYZ -> LMS matrix (= Ottosson's M1 to 1e-8)
const M1 = [
  [0.4122214695, 0.5363325373, 0.0514459933],
  [0.2119034958, 0.6806995506, 0.1073969535],
  [0.0883024592, 0.2817188391, 0.6299787017],
];
const M1I = [
  [4.0767416361, -3.3077115393, 0.2309699032],
  [-1.2684379733, 2.6097573493, -0.341319376],
  [-0.0041960761, -0.7034186179, 1.7076146941],
];
const M2 = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
];
const M2I = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092],
];
const mul = (M: number[][], v: number[]): Rgb => [
  M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
  M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
  M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
];
const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055);

/** '#RRGGBB' / '#RGB' -> sRGB 0..1 (gamma-encoded). */
export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`sky: not a hex colour: ${hex}`);
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}
/** sRGB 0..1 -> OKLab. */
export function rgbToOklab(rgb: Rgb): Oklab {
  const lms = mul(M1, rgb.map(toLin));
  return mul(M2, lms.map(Math.cbrt));
}
/** OKLab -> sRGB 0..1 (unclamped: out of gamut when any channel leaves 0..1). */
export function oklabToRgb(lab: Oklab): Rgb {
  const l = mul(M2I, lab).map((v) => v * v * v);
  return mul(M1I, l).map(toGam) as Rgb;
}
const inGamut = (rgb: Rgb, e = 1e-5) => rgb[0] >= -e && rgb[0] <= 1 + e && rgb[1] >= -e && rgb[1] <= 1 + e && rgb[2] >= -e && rgb[2] <= 1 + e;
/** OKLab -> sRGB inside the gamut: keep L and hue, lower the chroma until it fits (CSS Color 4's idea; skies are in
 *  gamut, this only guards a wild key). */
export function oklabToRgbInGamut(lab: Oklab): Rgb {
  let rgb = oklabToRgb(lab);
  if (inGamut(rgb)) return rgb;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const k = (lo + hi) / 2;
    const t = oklabToRgb([lab[0], lab[1] * k, lab[2] * k]);
    if (inGamut(t)) lo = k;
    else hi = k;
  }
  rgb = oklabToRgb([lab[0], lab[1] * lo, lab[2] * lo]);
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as Rgb;
}
export const oklabToLch = ([l, a, b]: Oklab): Oklch => ({l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360});
export const lchToOklab = ({l, c, h}: Oklch): Oklab => [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
/** Any sky colour -> OKLab. */
export const toOklab = (c: SkyColor): Oklab => (typeof c === 'string' ? rgbToOklab(hexToRgb(c)) : lchToOklab(c));
/** OKLCH of a hex colour. */
export const oklch = (hex: string): Oklch => oklabToLch(rgbToOklab(hexToRgb(hex)));
const hx = (v: number) => {
  const s = Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).toUpperCase();
  return s.length < 2 ? '0' + s : s;
};
/** OKLab -> '#RRGGBB' (gamut-mapped, rounded to whole codes). */
export const oklabToHex = (lab: Oklab): string => {
  const [r, g, b] = oklabToRgbInGamut(lab);
  return '#' + hx(r) + hx(g) + hx(b);
};
/** OKLCH -> '#RRGGBB'. */
export const fromOklch = (o: Oklch): string => oklabToHex(lchToOklab(o));
/** A straight OKLab mix (t = 0: a, 1: b). */
export const mixOklab = (a: Oklab, b: Oklab, t: number): Oklab => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** Mix two sky colours in OKLab -> hex. */
export const mixSky = (a: SkyColor, b: SkyColor, t: number): string => oklabToHex(mixOklab(toOklab(a), toOklab(b), t));
/** Delta E in OKLab (x100 ~ CIE dE units). */
export const deltaEOK = (a: Oklab, b: Oklab) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// CIE L*a*b* (D65) for the house measures (CRAFT speaks CIE L* and C*)
const cieF = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
/** CIE L*, a*, b* (D65) of sRGB 0..1. */
export function rgbToCieLab(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(toLin);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const fy = cieF(Y);
  return [116 * fy - 16, 500 * (cieF(X) - fy), 200 * (fy - cieF(Z))];
}
const relLum = (rgb: Rgb) => 0.2126 * toLin(rgb[0]) + 0.7152 * toLin(rgb[1]) + 0.0722 * toLin(rgb[2]);
/** WCAG contrast ratio of two sRGB colours. */
export const contrastRgb = (a: Rgb, b: Rgb) => {
  const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// ================================================================= the spec

/** A key colour at a canvas y (px at 1080 x 1920, the set's own coordinates). */
export type SkyKey = {y: number; color: SkyColor};
/** The caption band: inside it the sky stays nearly flat (max dL*, CIE). */
export type SkyBand = {y0: number; y1: number; maxDL?: number};
/** A low sun's warmth: an ellipse (rx wide, ry tall) of `color` around the disc centre, strongest at the centre
 *  (`strength`, 0..1, default 1) and gone at the rim with a smootherstep. Part of the sky, below everything. */
export type SkySun = {x: number; y: number; color: SkyColor; rx: number; ry?: number; strength?: number};
/** The blue-noise dither: +-amp code values per channel (TPDF-shaped integers, default 2), at `grain` px per texel
 *  (default 1), the tile shifted by `offset` texels. */
export type SkyDither = {amp?: number; grain?: number; offset?: [number, number]};
export type SkySpec = {
  /** At least 2 keys, top to horizon (y ascending). Above the first and below the last the colour holds. */
  keys: SkyKey[];
  /** The drawn rect (default x -120, width 1320, top min(-120, first key), bottom 2040: room for a camera float). */
  x?: number;
  width?: number;
  top?: number;
  bottom?: number;
  /** The caption band guard (default CAPTION_BAND; null = none). */
  band?: SkyBand | null;
  sun?: SkySun | null;
  /** Default {amp: 2, grain: 1}; false = Chrome's own +-0.5 code dither only. */
  dither?: SkyDither | false;
  /** 'eased' (default): the monotone cubic; 'linear': straight OKLab runs between keys (kinks at the keys). */
  interp?: 'eased' | 'linear';
};

/** The house caption band (the 317-556 block, DIRECTION rule 10) and its flatness budget (CRAFT §g). */
export const CAPTION_BAND: SkyBand = {y0: 317, y1: 556, maxDL: 1.5};
export const DEFAULT_DITHER: Required<SkyDither> = {amp: 2, grain: 1, offset: [0, 0]};

// ================================================================= the curve: a monotone cubic through the keys

/** Fritsch-Carlson (Fritsch-Butland weights) slopes: no overshoot, 0 at turns and plateaus, 0 at both ends (eased). */
function monoSlopes(x: number[], v: number[]): number[] {
  const n = x.length;
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const h0 = x[i] - x[i - 1];
    const h1 = x[i + 1] - x[i];
    const d0 = (v[i] - v[i - 1]) / h0;
    const d1 = (v[i + 1] - v[i]) / h1;
    if (d0 * d1 <= 0) continue;
    m[i] = (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
  }
  return m;
}
function hermite(x: number[], v: number[], m: number[], t: number): number {
  const n = x.length;
  if (t <= x[0]) return v[0];
  if (t >= x[n - 1]) return v[n - 1];
  let i = 0;
  while (i < n - 2 && t >= x[i + 1]) i++;
  const h = x[i + 1] - x[i];
  const s = (t - x[i]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * v[i + 1] + (s3 - s2) * h * m[i + 1];
}
const smootherstep = (t: number) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * u * (u * (u * 6 - 15) + 10);
};

type Curve = {ky: number[]; kl: Oklab[]; m: number[][]; linear: boolean};
function makeCurve(keys: {y: number; lab: Oklab}[], linear: boolean): Curve {
  const ky = keys.map((k) => k.y);
  const kl = keys.map((k) => k.lab);
  const m = [0, 1, 2].map((c) => (linear ? ky.map(() => 0) : monoSlopes(ky, kl.map((l) => l[c]))));
  return {ky, kl, m, linear};
}
function curveAt(cv: Curve, y: number): Oklab {
  const {ky, kl, m} = cv;
  if (cv.linear) {
    if (y <= ky[0]) return kl[0];
    if (y >= ky[ky.length - 1]) return kl[kl.length - 1];
    let i = 0;
    while (i < ky.length - 2 && y >= ky[i + 1]) i++;
    return mixOklab(kl[i], kl[i + 1], (y - ky[i]) / (ky[i + 1] - ky[i]));
  }
  return [0, 1, 2].map((c) => hermite(ky, kl.map((l) => l[c]), m[c], y)) as Oklab;
}

// ================================================================= the model (resolved spec + guard), cached

export type SkyModel = {
  x: number;
  width: number;
  top: number;
  bottom: number;
  curve: Curve;
  band: Required<SkyBand> | null;
  /** How far the band's keys were pulled toward their mean by the guard (0 = untouched). */
  bandPull: number;
  sun: {x: number; y: number; rx: number; ry: number; strength: number; lab: Oklab} | null;
  dither: Required<SkyDither> | null;
  /** What the guard changed, for skyProblems() and the reports. */
  notes: string[];
};

const MODELS = new Map<string, SkyModel>();
const cieLAt = (lab: Oklab) => rgbToCieLab(oklabToRgbInGamut(lab))[0];

function bandRangeL(cv: Curve, band: Required<SkyBand>): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let y = band.y0; y <= band.y1; y += 2) {
    const L = cieLAt(curveAt(cv, y));
    lo = Math.min(lo, L);
    hi = Math.max(hi, L);
  }
  return [lo, hi];
}

/** Resolve a spec: sorted keys in OKLab, the caption-band guard, the sun clamp, the dither. Cached by value. */
export function skyModel(spec: SkySpec): SkyModel {
  const key = JSON.stringify(spec);
  const hit = MODELS.get(key);
  if (hit) return hit;
  if (!spec.keys || spec.keys.length < 2) throw new Error('sky: at least 2 keys');
  const notes: string[] = [];
  const linear = spec.interp === 'linear';
  let keys = spec.keys.map((k) => ({y: k.y, lab: toOklab(k.color)})).sort((a, b) => a.y - b.y);
  for (let i = 1; i < keys.length; i++) if (keys[i].y - keys[i - 1].y < 1) throw new Error(`sky: keys closer than 1 px at y ${keys[i].y}`);
  let curve = makeCurve(keys, linear);
  // ---- the caption band guard
  const b0 = spec.band === undefined ? CAPTION_BAND : spec.band;
  const band = b0 ? {y0: b0.y0, y1: b0.y1, maxDL: b0.maxDL ?? 1.5} : null;
  let bandPull = 0;
  if (band) {
    // keys at both band edges (from the curve as given), so the band's span is decided by its own keys
    for (const y of [band.y0, band.y1]) {
      if (!keys.some((k) => Math.abs(k.y - y) < 0.5)) keys.push({y, lab: curveAt(curve, y)});
    }
    keys.sort((a, b) => a.y - b.y);
    curve = makeCurve(keys, linear);
    const [lo, hi] = bandRangeL(curve, band);
    if (hi - lo > band.maxDL) {
      const inside = keys.filter((k) => k.y >= band.y0 - 0.5 && k.y <= band.y1 + 0.5);
      const orig = inside.map((k) => k.lab);
      const mean = orig.reduce((s, l) => [s[0] + l[0] / orig.length, s[1] + l[1] / orig.length, s[2] + l[2] / orig.length] as Oklab, [0, 0, 0] as Oklab);
      let a = 0;
      let z = 1;
      for (let it = 0; it < 30; it++) {
        const k = (a + z) / 2;
        inside.forEach((kk, i) => (kk.lab = mixOklab(orig[i], mean, k)));
        const c = makeCurve(keys, linear);
        const [l2, h2] = bandRangeL(c, band);
        if (h2 - l2 <= band.maxDL * 0.98) z = k;
        else a = k;
      }
      inside.forEach((kk, i) => (kk.lab = mixOklab(orig[i], mean, z)));
      curve = makeCurve(keys, linear);
      bandPull = z;
      notes.push(`band guard: the keys in y ${band.y0}-${band.y1} pulled ${(z * 100).toFixed(0)} % toward their mean (dL* ${(hi - lo).toFixed(2)} -> <= ${band.maxDL})`);
    }
  }
  // ---- the sun's warmth (never inside the band)
  let sun: SkyModel['sun'] = null;
  if (spec.sun) {
    const s = spec.sun;
    let ry = s.ry ?? s.rx * 0.6;
    if (band) {
      const room = s.y >= band.y1 ? s.y - band.y1 - 2 : s.y <= band.y0 ? band.y0 - s.y - 2 : 0;
      if (room < ry) {
        notes.push(room < 8 ? `sun warmth off: the sun at y ${s.y} sits in or against the caption band` : `sun warmth ry ${ry.toFixed(0)} -> ${room.toFixed(0)} (stays out of the caption band)`);
        ry = room;
      }
    }
    if (ry >= 8 && s.rx >= 8) sun = {x: s.x, y: s.y, rx: s.rx, ry, strength: Math.min(1, Math.max(0, s.strength ?? 1)), lab: toOklab(s.color)};
  }
  const d = spec.dither === false ? null : {...DEFAULT_DITHER, ...(spec.dither ?? {})};
  if (d) {
    d.amp = Math.min(3, Math.max(0.5, d.amp));
    d.grain = Math.max(1, Math.round(d.grain));
  }
  const model: SkyModel = {
    x: spec.x ?? -120,
    width: spec.width ?? 1320,
    top: spec.top ?? Math.min(-120, keys[0].y),
    bottom: spec.bottom ?? Math.max(2040, keys[keys.length - 1].y),
    curve,
    band,
    bandPull,
    sun,
    dither: d,
    notes,
  };
  if (MODELS.size > 64) MODELS.clear();
  MODELS.set(key, model);
  return model;
}

// ================================================================= sampling: colours anywhere in the sky

const css = (rgb: Rgb) => `color(srgb ${rgb.map((v) => v.toFixed(6)).join(' ')})`;
/** Keep `room` codes clear of 0 and 255 so the dither never clips (a clipped dither shifts the mean). */
const headroom = (rgb: Rgb, room: number) => rgb.map((v) => Math.min(1 - room / 255, Math.max(room / 255, v))) as Rgb;

/** The sun's warmth weight at (x, y), 0..strength. */
export function sunWeight(m: SkyModel, x: number, y: number): number {
  const s = m.sun;
  if (!s) return 0;
  const d = Math.hypot((x - s.x) / s.rx, (y - s.y) / s.ry);
  return d >= 1 ? 0 : s.strength * smootherstep(1 - d);
}
/** The dither's clearance from 0 and 255 (codes): the drawn colours keep it so the noise never clips. */
const roomOf = (m: SkyModel) => (m.dither ? Math.ceil(m.dither.amp) : 0);
/** EXACTLY what <Sky> draws at (x, y) before the zero-mean dither, as sRGB 0..1: the eased OKLab curve (clear of 0 and
 *  255 by the dither's amplitude), then the sun's warmth composited over it the way the browser does (sRGB alpha, the
 *  warm colour at the smootherstep weight). Without x, the vertical gradient alone. */
export function skyRgbAt(spec: SkySpec, y: number, x?: number): Rgb {
  const m = skyModel(spec);
  const room = roomOf(m);
  const base = headroom(oklabToRgbInGamut(curveAt(m.curve, y)), room);
  if (x === undefined || !m.sun) return base;
  const w = sunWeight(m, x, y);
  if (w <= 0) return base;
  const warm = headroom(oklabToRgbInGamut(m.sun.lab), room);
  return [0, 1, 2].map((c) => base[c] + (warm[c] - base[c]) * w) as Rgb;
}
/** The sky in OKLab at (x, y) (what is drawn); without x, the vertical gradient alone (no sun). */
export const skyLabAt = (spec: SkySpec, y: number, x?: number): Oklab => rgbToOklab(skyRgbAt(spec, y, x));
/** The sky's colour at canvas y (and x: with the sun's warmth), as '#RRGGBB'. */
export const skyColorAt = (spec: SkySpec, y: number, x?: number): string => {
  const [r, g, b] = skyRgbAt(spec, y, x);
  return '#' + hx(r) + hx(g) + hx(b);
};
/** THE FAR HAZE: the sky's lowest colour (its last key), what lib/depth's atmosphere mixes far planes toward
 *  (DIRECTION rule 6: "the far haze takes the sky's lowest colour"). With `x`, the sun's warmth at the horizon there
 *  (a far plane right under the sun takes a warmer air). */
export function horizonColor(spec: SkySpec, x?: number): string {
  const m = skyModel(spec);
  const y = m.curve.ky[m.curve.ky.length - 1];
  return skyColorAt(spec, y, x);
}

// ================================================================= the SVG stops

export type SkyStop = {offset: number; color: string; y: number; rgb: Rgb};

/** The vertical gradient as the fewest stops that stay within `tol` code values of the curve between them (checked
 *  for both a straight sRGB run and a straight OKLab run, the two ways a browser interpolates color() stops). */
export function skyStops(spec: SkySpec, tol = 0.25): SkyStop[] {
  const m = skyModel(spec);
  const room = roomOf(m);
  const step = 2;
  const ys: number[] = [];
  for (let y = m.top; y < m.bottom; y += step) ys.push(y);
  ys.push(m.bottom);
  const labs = ys.map((y) => curveAt(m.curve, y));
  const rgbs = labs.map((l) => headroom(oklabToRgbInGamut(l), room));
  const out: number[] = [0];
  let i = 0;
  const fits = (a: number, b: number) => {
    for (let k = a + 1; k < b; k++) {
      const t = (ys[k] - ys[a]) / (ys[b] - ys[a]);
      const ok = headroom(oklabToRgbInGamut(mixOklab(labs[a], labs[b], t)), room);
      for (let c = 0; c < 3; c++) {
        const lin = rgbs[a][c] + (rgbs[b][c] - rgbs[a][c]) * t;
        if (Math.abs(lin - rgbs[k][c]) * 255 > tol || Math.abs(ok[c] - rgbs[k][c]) * 255 > tol) return false;
      }
    }
    return true;
  };
  while (i < ys.length - 1) {
    let j = i + 1;
    while (j + 1 < ys.length && fits(i, j + 1)) j++;
    out.push(j);
    i = j;
  }
  const span = m.bottom - m.top;
  return out.map((k) => ({offset: (ys[k] - m.top) / span, color: css(rgbs[k]), y: ys[k], rgb: rgbs[k]}));
}

/** The sun's warmth as radial stops (offset = elliptical distance 0..1, opacity = the smootherstep weight). */
export function sunStops(spec: SkySpec, tol = 0.001): {offset: number; opacity: number}[] {
  const m = skyModel(spec);
  if (!m.sun) return [];
  const n = 256;
  const w = (d: number) => m.sun!.strength * smootherstep(1 - d);
  const out: number[] = [0];
  let i = 0;
  while (i < n) {
    let j = i + 1;
    const fits = (b: number) => {
      for (let k = i + 1; k < b; k++) {
        const t = (k - i) / (b - i);
        if (Math.abs(w(i / n) + (w(b / n) - w(i / n)) * t - w(k / n)) > tol) return false;
      }
      return true;
    };
    while (j + 1 <= n && fits(j + 1)) j++;
    out.push(j);
    i = j;
  }
  return out.map((k) => ({offset: k / n, opacity: w(k / n)}));
}

// ================================================================= the dither: a static blue-noise tile

// 64 x 64 void-and-cluster thresholds (sigma 1.5, seed 20261027; scripts/look/make_blue_noise.py), 8-bit, row-major.
const BLUE_NOISE_64_B64 =
  '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';
let TILE: Uint8Array | null = null;
/** The 64 x 64 blue-noise threshold tile (0..255, every value 16 times). */
export function blueNoiseTile(): Uint8Array {
  if (TILE) return TILE;
  const s = atob(BLUE_NOISE_64_B64);
  const t = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) t[i] = s.charCodeAt(i);
  if (t.length !== 4096) throw new Error('sky: blue-noise tile is not 64 x 64');
  TILE = t;
  return t;
}
/** Integer dither levels for a TPDF of half-width `amp` codes: P(n) = the triangle's mass in [n - 0.5, n + 0.5]. */
export function tpdfLevels(amp: number): {n: number; p: number}[] {
  const A = amp;
  const N = Math.ceil(A - 0.5 + 1e-9);
  const cdf = (x: number) => (x <= -A ? 0 : x >= A ? 1 : x < 0 ? ((A + x) * (A + x)) / (2 * A * A) : 1 - ((A - x) * (A - x)) / (2 * A * A));
  const out: {n: number; p: number}[] = [];
  for (let n = -N; n <= N; n++) out.push({n, p: cdf(n + 0.5) - cdf(n - 0.5)});
  return out;
}
const CHANNEL_SHIFT: [number, number][] = [
  [0, 0],
  [21, 37],
  [42, 11],
];
type DitherPaths = {plus: {color: string; d: string}[]; minus: {color: string; d: string}[]; size: number; sigma: number};
const DITHERS = new Map<string, DitherPaths>();
/** The dither tile as grouped squares: `plus` (added with plus-lighter) and `minus` (taken off with difference), each
 *  path one exact colour (e.g. rgb(1,0,2)); R, G and B read the tile at three toroidal shifts (decorrelated). */
export function ditherPaths(d: Required<SkyDither>): DitherPaths {
  const key = `${d.amp}/${d.grain}/${d.offset[0]},${d.offset[1]}`;
  const hit = DITHERS.get(key);
  if (hit) return hit;
  const tile = blueNoiseTile();
  const lv = tpdfLevels(d.amp);
  const cum: number[] = [];
  let acc = 0;
  for (const l of lv) cum.push((acc += l.p));
  const level = (t8: number) => {
    const u = (t8 + 0.5) / 256;
    for (let i = 0; i < lv.length; i++) if (u < cum[i]) return lv[i].n;
    return lv[lv.length - 1].n;
  };
  const g = d.grain;
  const plus = new Map<string, string[]>();
  const minus = new Map<string, string[]>();
  let ss = 0;
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      const n = CHANNEL_SHIFT.map(([sy, sx]) => level(tile[((i + sy + d.offset[1]) & 63) * 64 + ((j + sx + d.offset[0]) & 63)]));
      ss += n[0] * n[0] + n[1] * n[1] + n[2] * n[2];
      const sq = `M${j * g} ${i * g}h${g}v${g}h${-g}z`;
      const p = n.map((v) => Math.max(v, 0));
      const q = n.map((v) => Math.max(-v, 0));
      if (p[0] || p[1] || p[2]) {
        const c = `rgb(${p.join(',')})`;
        (plus.get(c) ?? plus.set(c, []).get(c)!).push(sq);
      }
      if (q[0] || q[1] || q[2]) {
        const c = `rgb(${q.join(',')})`;
        (minus.get(c) ?? minus.set(c, []).get(c)!).push(sq);
      }
    }
  }
  const flat = (mp: Map<string, string[]>) => {
    const out: {color: string; d: string}[] = [];
    mp.forEach((v, color) => out.push({color, d: v.join('')}));
    return out.sort((a, b) => (a.color < b.color ? -1 : 1));
  };
  const res = {plus: flat(plus), minus: flat(minus), size: 64 * g, sigma: Math.sqrt(ss / (3 * 4096))};
  DITHERS.set(key, res);
  return res;
}

// ================================================================= the component

export type SkyProps = {spec: SkySpec};

/** ONE CONTINUOUS SKY: the eased OKLab gradient, the sun's warmth and the blue-noise dither, in one isolated group.
 *  Draw it first in the set (the bottom layer), inside the set's camera group. */
export const Sky: React.FC<SkyProps> = ({spec}) => {
  const m = skyModel(spec);
  const id = 'sky' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const stops = useMemo(() => skyStops(spec), [spec]);
  const warm = useMemo(() => sunStops(spec), [spec]);
  const dither = m.dither ? ditherPaths(m.dither) : null;
  const {x, width, top, bottom, sun} = m;
  const h = bottom - top;
  const warmRgb = sun ? css(headroom(oklabToRgbInGamut(sun.lab), roomOf(m))) : '';
  return (
    <g style={{isolation: 'isolate'}}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={bottom}>
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        {sun ? (
          <radialGradient
            id={`${id}w`}
            gradientUnits="userSpaceOnUse"
            cx={sun.x}
            cy={sun.y}
            r={sun.rx}
            gradientTransform={`translate(${sun.x} ${sun.y}) scale(1 ${sun.ry / sun.rx}) translate(${-sun.x} ${-sun.y})`}
          >
            {warm.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={warmRgb} stopOpacity={s.opacity} />
            ))}
          </radialGradient>
        ) : null}
        {dither ? (
          <>
            <pattern id={`${id}p`} patternUnits="userSpaceOnUse" x={0} y={0} width={dither.size} height={dither.size}>
              {dither.plus.map((p) => (
                <path key={p.color} d={p.d} fill={p.color} shapeRendering="crispEdges" />
              ))}
            </pattern>
            <pattern id={`${id}m`} patternUnits="userSpaceOnUse" x={0} y={0} width={dither.size} height={dither.size}>
              {dither.minus.map((p) => (
                <path key={p.color} d={p.d} fill={p.color} shapeRendering="crispEdges" />
              ))}
            </pattern>
          </>
        ) : null}
      </defs>
      <rect x={x} y={top} width={width} height={h} fill={`url(#${id}g)`} />
      {sun ? (
        <rect
          x={Math.max(x, sun.x - sun.rx)}
          y={Math.max(top, sun.y - sun.ry)}
          width={Math.min(x + width, sun.x + sun.rx) - Math.max(x, sun.x - sun.rx)}
          height={Math.min(bottom, sun.y + sun.ry) - Math.max(top, sun.y - sun.ry)}
          fill={`url(#${id}w)`}
        />
      ) : null}
      {dither ? (
        <>
          <rect x={x} y={top} width={width} height={h} fill={`url(#${id}p)`} style={{mixBlendMode: 'plus-lighter'}} />
          <rect x={x} y={top} width={width} height={h} fill={`url(#${id}m)`} style={{mixBlendMode: 'difference'}} />
        </>
      ) : null}
    </g>
  );
};

// ================================================================= the evening sky (how illustrators paint it)

export type EveningSkyOpts = {
  /** The caption field's colour: flat across the caption band (the film's quiet sky, e.g. Canal Mint #BCDCCF). */
  band: SkyColor;
  /** The warm colour at the horizon (= the far haze). */
  horizon: SkyColor;
  /** Where the horizon colour is reached (behind the far skyline). */
  horizonY: number;
  /** The top of the sky: the band colour a touch deeper and cooler (default OKLCH L -0.022, C +0.008, h +8). */
  zenith?: SkyColor;
  /** The light band just above the warm horizon: lighter than both, low chroma, the horizon's hue turned warm-cream
   *  (default L max + 0.022, C 0.014, h horizon + 8); false = none. The mint crosses to the peach through light, never
   *  through khaki. */
  light?: SkyColor | false;
  /** Where the light band peaks (default 55 % of the way from the band's foot to horizonY). */
  lightY?: number;
  /** The caption band (default CAPTION_BAND). */
  captionBand?: SkyBand | null;
  /** Where the zenith colour sits (default -120: above the frame, so the frame top is already easing). */
  top?: number;
  /** The low sun: its warmth defaults to the horizon colour warmer and richer (L -0.004, C +0.028, h -6). */
  sun?: {x: number; y: number; rx: number; ry?: number; strength?: number; color?: SkyColor} | null;
  dither?: SkyDither | false;
  x?: number;
  width?: number;
  bottom?: number;
};

/** An evening sky as illustrators paint it: a slightly deeper, cooler zenith; the caption field flat through the band;
 *  then lighter toward the horizon through a pale warm light band (the lightest part of a clear sky is near the
 *  horizon) into the warm horizon; and the warmth gathered around the low sun. Returns a SkySpec for <Sky>. */
export function eveningSky(o: EveningSkyOpts): SkySpec {
  const band = o.captionBand === undefined ? CAPTION_BAND : o.captionBand;
  const b = oklabToLch(toOklab(o.band));
  const hz = oklabToLch(toOklab(o.horizon));
  const zenith = o.zenith ?? {l: b.l - 0.022, c: b.c + 0.008, h: b.h + 8};
  const y1 = band ? band.y1 : Math.min(o.horizonY - 120, 556);
  const keys: SkyKey[] = [{y: o.top ?? -120, color: zenith}];
  if (band) keys.push({y: band.y0, color: o.band}, {y: band.y1, color: o.band});
  else keys.push({y: y1, color: o.band});
  if (o.light !== false) {
    const light = o.light ?? {l: Math.max(b.l, hz.l) + 0.022, c: 0.014, h: hz.h + 8};
    keys.push({y: o.lightY ?? y1 + (o.horizonY - y1) * 0.55, color: light});
  }
  keys.push({y: o.horizonY, color: o.horizon});
  const sun = o.sun
    ? {x: o.sun.x, y: o.sun.y, rx: o.sun.rx, ry: o.sun.ry, strength: o.sun.strength, color: o.sun.color ?? {l: hz.l - 0.004, c: hz.c + 0.028, h: hz.h - 6}}
    : null;
  return {keys, band, sun, dither: o.dither, x: o.x, width: o.width, bottom: o.bottom};
}

// ================================================================= the checks

export type SkyCheck = {
  /** CIE L* range across the caption band (the whole band area, sun warmth included). */
  bandDL: number;
  /** Largest dE (OKLab x 100) from the band's mean colour inside the band. */
  bandDE: number;
  /** Lowest WCAG contrast of `ink` on the band (when an ink is given). */
  inkContrast: number | null;
  /** The khaki / olive zone: the largest CIE C* on the vertical ramp where the hue is 95-140 deg (yellow-green). */
  khakiC: number;
  /** The longest run (px) of the vertical ramp under C* 2.5 (a grey band). */
  greyRun: number;
  stops: number;
  notes: string[];
};

/** Measure a sky against CRAFT §g. */
export function skyCheck(spec: SkySpec, o: {ink?: string} = {}): SkyCheck {
  const m = skyModel(spec);
  let bandDL = 0;
  let bandDE = 0;
  let inkContrast: number | null = null;
  if (m.band) {
    const xs: number[] = [];
    for (let x = Math.max(0, m.x); x <= Math.min(1080, m.x + m.width); x += 24) xs.push(x);
    const pts: Oklab[] = [];
    for (let y = m.band.y0; y <= m.band.y1; y += 3) for (const x of xs) pts.push(skyLabAt(spec, y, x));
    const Ls = pts.map(cieLAt);
    bandDL = Math.max(...Ls) - Math.min(...Ls);
    const mean = pts.reduce((s, l) => [s[0] + l[0] / pts.length, s[1] + l[1] / pts.length, s[2] + l[2] / pts.length] as Oklab, [0, 0, 0] as Oklab);
    bandDE = Math.max(...pts.map((p) => deltaEOK(p, mean) * 100));
    if (o.ink) {
      const ink = hexToRgb(o.ink);
      inkContrast = Math.min(...pts.map((p) => contrastRgb(ink, oklabToRgbInGamut(p))));
    }
  }
  let khakiC = 0;
  let greyRun = 0;
  let run = 0;
  const yEnd = m.curve.ky[m.curve.ky.length - 1];
  for (let y = m.curve.ky[0]; y <= yEnd; y += 1) {
    const [, a, b] = rgbToCieLab(oklabToRgbInGamut(curveAt(m.curve, y)));
    const C = Math.hypot(a, b);
    const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
    if (h >= 95 && h <= 140) khakiC = Math.max(khakiC, C);
    run = C < 2.5 ? run + 1 : 0;
    greyRun = Math.max(greyRun, run);
  }
  return {bandDL, bandDE, inkContrast, khakiC, greyRun, stops: skyStops(spec).length, notes: m.notes};
}

/** CRAFT §g's budgets, empty = OK: band dL* <= maxDL (default 1.5); ink >= 7:1 on the band; the yellow-green zone of the
 *  ramp at C* <= 7 (pale light, never khaki or olive); no grey run over 60 px. The guard's own actions come as notes. */
export function skyProblems(spec: SkySpec, o: {ink?: string} = {}): string[] {
  const m = skyModel(spec);
  const c = skyCheck(spec, o);
  const out: string[] = [];
  if (m.band && c.bandDL > m.band.maxDL + 1e-6) out.push(`caption band y ${m.band.y0}-${m.band.y1}: dL* ${c.bandDL.toFixed(2)} (> ${m.band.maxDL})`);
  if (c.inkContrast !== null && c.inkContrast < 7) out.push(`ink ${o.ink} on the caption band: ${c.inkContrast.toFixed(2)}:1 (< 7:1)`);
  if (c.khakiC > 7) out.push(`the ramp crosses yellow-green at C* ${c.khakiC.toFixed(1)} (> 7: reads khaki / olive); lower the light key's chroma`);
  if (c.greyRun > 60) out.push(`a grey run of ${c.greyRun} px (C* < 2.5): give the light band some warmth`);
  return out.concat(c.notes.map((n) => `note: ${n}`));
}
