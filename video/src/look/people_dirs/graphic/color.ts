// MODERN GRAPHIC people: colour maths (sRGB <-> CIE Lab/LCh, D65) and the two-tone light.
// Every material is TWO flat tones (lit, shade) joined by a crisp terminator, plus a DEEP tone that is used only for
// cast shadows (under the jaw, under a brim, inside an open coat) and a SHEEN for hair and leather. Shadows are colour,
// never grey: garments turn toward a warm plum, skin and hair toward red (design_research.md V5).
export type Lch = {L: number; C: number; h: number};

const hex2rgb = (hex: string): [number, number, number] => {
  const s = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255) as [number, number, number];
};
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const fLab = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fInv = (t: number) => (t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27));
const WX = 0.95047;
const WZ = 1.08883;

export function lab(hex: string): [number, number, number] {
  const [r, g, b] = hex2rgb(hex).map(lin);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / WX;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / WZ;
  const fx = fLab(x);
  const fy = fLab(y);
  const fz = fLab(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
export function lch(hex: string): Lch {
  const [L, a, b] = lab(hex);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return {L, C: Math.hypot(a, b), h: (h + 360) % 360};
}
const to2 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
export function fromLab(L: number, a: number, b: number): string {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const x = fInv(fx) * WX;
  const y = fInv(fy);
  const z = fInv(fz) * WZ;
  const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const g = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  return `#${to2(gam(r))}${to2(gam(g))}${to2(gam(bl))}`;
}
export function fromLch(L: number, C: number, h: number): string {
  const r = (h * Math.PI) / 180;
  return fromLab(L, C * Math.cos(r), C * Math.sin(r));
}
const turn = (h: number, to: number, max: number) => {
  const d = ((to - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), max);
};
export const Lof = (hex: string) => lch(hex).L;

export type Tone = {lit: string; shade: string; deep: string; sheen: string};
export type ToneOpts = {
  /** L* factor of the shade plane (default 0.80; dark materials use a fixed step instead). */
  k?: number;
  /** the hue the shade turns toward and the most it turns (degrees) */
  toward?: number;
  maxTurn?: number;
  /** chroma factor in the shade */
  c?: number;
  /** the sheen's L* lift (hair, leather) */
  sheen?: number;
};
/** The planes of one material from its lit colour. Garments: the shade at L* x 0.80 turned up to 10 degrees toward a
 *  warm plum (h 350); skin and hair pass toward = 35 (red). Very dark materials keep a minimum step of 7 L* so their
 *  form still reads. */
export function tone(litHex: string, o: ToneOpts = {}): Tone {
  const q = lch(litHex);
  const k = o.k ?? 0.8;
  const toward = o.toward ?? 350;
  const mt = o.maxTurn ?? 10;
  const Ls = Math.min(q.L * k, q.L - 7);
  const Ld = Math.min(q.L * (k - 0.17), q.L - 12);
  const hs = turn(q.h, toward, mt);
  return {
    lit: litHex,
    shade: fromLch(Math.max(4, Ls), q.C * (o.c ?? 1.06), hs),
    deep: fromLch(Math.max(3, Ld), q.C * 1.0, turn(q.h, toward, mt * 1.4)),
    sheen: fromLch(Math.min(96, q.L + (o.sheen ?? 15)), q.C * 1.02, turn(q.h, 70, 8)),
  };
}
/** Skin: the shade L* x 0.80 turned 6 degrees toward red, C* x 1.08 (design_research.md V5). */
export const skinTone = (lit: string) => tone(lit, {k: 0.8, toward: 30, maxTurn: 6, c: 1.08, sheen: 10});
export const hairTone = (lit: string) => tone(lit, {k: 0.74, toward: 25, maxTurn: 8, c: 1.0, sheen: 16});
/** A colour with its L* moved by dL (hue and chroma kept). */
export function shiftL(hex: string, dL: number, dC = 0): string {
  const q = lch(hex);
  return fromLch(Math.max(0, Math.min(100, q.L + dL)), Math.max(0, q.C + dC), q.h);
}
/** Mix two colours in Lab. */
export function mixLab(a: string, b: string, t: number): string {
  const A = lab(a);
  const B = lab(b);
  return fromLab(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
