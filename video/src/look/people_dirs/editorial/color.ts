// Editorial people: colour (dir_editorial.md §5). Self-contained CIE L*C*h (D65) so the direction never depends on a
// film's palette module. Every material is ONE lit colour; the painter derives its one soft gradient from it:
//   hi (the key side, a touch lighter and warmer) -> base -> shade (proportional: L* x ~0.82, the hue turned a few
//   degrees toward warm red, the chroma kept) -> deep (crisp cast shapes only: under the jaw, inside the coat).
// Skin's shade turns toward red and gains chroma (design_research V5), never toward grey or violet; the hero teal keeps
// its hue (the film's colour stays itself in the shade).

const XN = 0.95047;
const ZN = 1.08883;
const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c: number) => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(1, v));
};
const fLab = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fInv = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
const hexRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255];
};
const rgbHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

export function lab(hex: string): [number, number, number] {
  const [r, g, b] = hexRgb(hex).map(toLin);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN;
  const fy = fLab(Y);
  return [116 * fy - 16, 500 * (fLab(X) - fy), 200 * (fy - fLab(Z))];
}
export function lch(hex: string): {L: number; C: number; h: number} {
  const [L, a, b] = lab(hex);
  return {L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360};
}
function labRgb(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const X = fInv(fy + a / 500) * XN;
  const Y = fInv(fy);
  const Z = fInv(fy - b / 200) * ZN;
  return [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
}
export function fromLch(L: number, C: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  let c = Math.max(0, C);
  for (let i = 0; i < 60; i++) {
    const rgb = labRgb(L, c * Math.cos(hr), c * Math.sin(hr));
    if (rgb.every((v) => v >= -0.001 && v <= 1.001) || c < 0.5) return rgbHex(toGam(rgb[0]), toGam(rgb[1]), toGam(rgb[2]));
    c *= 0.95;
  }
  const rgb = labRgb(L, 0, 0);
  return rgbHex(toGam(rgb[0]), toGam(rgb[1]), toGam(rgb[2]));
}
export const mix = (a: string, b: string, k: number) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k);
};
const turn = (h: number, to: number, max: number) => {
  const d = ((to - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), max);
};

/** What a material is made of: it sets how its shade turns (dir_editorial.md §5). */
export type Kind = 'cloth' | 'skin' | 'hair' | 'hero' | 'leather' | 'satin' | 'denim' | 'light' | 'lens';
export type Ramp = {hi: string; base: string; shade: string; deep: string; sheen: string};

/** The warm red the shades lean to (a plum-brown family: "shadows are colour, never grey", DIRECTION rule 5). */
const SHADE_TO = 28;
/** The key's gold: the lit side leans to it. */
const KEY_TO = 72;

export function ramp(base: string, kind: Kind = 'cloth', k = 1): Ramp {
  const q = lch(base);
  // the shade step: proportional, so a dark coat keeps a readable step and a cream knit does not go grey
  const dS = kind === 'skin' ? Math.max(6, q.L * 0.15) : kind === 'hair' ? Math.max(4, q.L * 0.2) : Math.max(5, q.L * 0.17 + 1.5);
  const hueTo = kind === 'hero' ? q.h : kind === 'skin' ? 32 : SHADE_TO;
  const hueMax = kind === 'hero' ? 0 : kind === 'skin' ? 6 : kind === 'denim' ? 4 : q.C < 8 ? 3 : 6;
  const cK = kind === 'skin' ? 1.08 : kind === 'hero' ? 1.06 : 1.0;
  const hiL = kind === 'light' ? Math.min(97, q.L + 2.5) : Math.min(97, q.L + (kind === 'hair' ? 3 : 4.5));
  const hi = fromLch(hiL, q.C * (kind === 'hero' ? 1.02 : 1.0) + 0.6, turn(q.h, KEY_TO, kind === 'hero' ? 2 : 5));
  const shade = fromLch(Math.max(3, q.L - dS * k), q.C * cK + (q.C < 6 ? 1.5 : 0), turn(q.h, hueTo, hueMax));
  const deep = fromLch(Math.max(2, q.L - dS * 1.75 * k), q.C * (kind === 'skin' ? 1.12 : 1.0) + (q.C < 6 ? 2 : 0), turn(q.h, hueTo, hueMax * 1.4));
  const sheen = fromLch(Math.min(96, q.L + (kind === 'hair' ? 13 : kind === 'satin' ? 14 : kind === 'leather' ? 18 : 9)), q.C * 0.92, turn(q.h, KEY_TO, 6));
  return {hi, base, shade, deep, sheen};
}
