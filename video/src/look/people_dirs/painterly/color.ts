// people_dirs/painterly: colour in CIE L*C*h (D65), and the painted planes of a material under the dusk rig
// (dir_painterly.md "Palette"): LIT (the warm key), SHADE (the form shade: cool for cloth and hair, toward red for
// skin), DEEP (occlusion accents), HI (the warm highlight), RIM (the cool sky rim on the side away from the key),
// GLOW (skin only: the warm, saturated band along the terminator), UNDER (the inside of an open shell).
export type LCh = {L: number; C: number; h: number};

const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const Xn = 0.95047;
const Zn = 1.08883;
const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fi = (t: number) => (t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27));

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16) / 255, parseInt(v.slice(2, 4), 16) / 255, parseInt(v.slice(4, 6), 16) / 255];
}
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
export function lch(hex: string): LCh {
  const [r, g, b] = hexToRgb(hex).map(toLin);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / Xn;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / Zn;
  const L = 116 * f(Y) - 16;
  const A = 500 * (f(X) - f(Y));
  const B = 200 * (f(Y) - f(Z));
  const C = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return {L, C, h};
}
/** From L*C*h to hex; out-of-gamut colours lose chroma until they fit (never a hue shift). */
export function hexOf(L: number, C: number, h: number): string {
  let c = Math.max(0, C);
  for (let k = 0; k < 24; k++) {
    const A = c * Math.cos((h * Math.PI) / 180);
    const B = c * Math.sin((h * Math.PI) / 180);
    const fy = (L + 16) / 116;
    const X = Xn * fi(fy + A / 500);
    const Y = fi(fy);
    const Z = Zn * fi(fy - B / 200);
    const r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
    const g = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z;
    const b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
    const ok = [r, g, b].every((v) => v >= -0.001 && v <= 1.001);
    if (ok || c < 0.5) return rgbToHex(toGam(r), toGam(g), toGam(b));
    c *= 0.92;
  }
  return '#808080';
}
export const lchHex = (q: LCh) => hexOf(q.L, q.C, q.h);
/** Turn hue h toward `to` by at most `max` degrees. */
export const turn = (h: number, to: number, max: number) => {
  const d = ((to - h + 540) % 360) - 180;
  return (h + Math.sign(d) * Math.min(Math.abs(d), Math.abs(max)) + 360) % 360;
};
/** Mix two hex colours in Lab (k = 0 -> a, 1 -> b). */
export function mixLab(a: string, b: string, k: number): string {
  const p = lch(a);
  const q = lch(b);
  const pa = [p.C * Math.cos((p.h * Math.PI) / 180), p.C * Math.sin((p.h * Math.PI) / 180)];
  const qa = [q.C * Math.cos((q.h * Math.PI) / 180), q.C * Math.sin((q.h * Math.PI) / 180)];
  const A = pa[0] + (qa[0] - pa[0]) * k;
  const B = pa[1] + (qa[1] - pa[1]) * k;
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return hexOf(p.L + (q.L - p.L) * k, Math.hypot(A, B), h);
}
export const shiftL = (hex: string, dL: number) => {
  const q = lch(hex);
  return hexOf(q.L + dL, q.C, q.h);
};

/** The dusk rig's colours (warm key, cool sky). A film passes its own. */
export type Rig = {
  /** The key's hue (gold): lit planes and highlights lean toward it. */
  keyHue: number;
  /** The cool sky's hue (lilac-blue): the rim and the shade of cloth and hair lean toward it. */
  skyHue: number;
  /** How strongly the rim takes the sky's hue (0..1). */
  rimTint: number;
};
export const DUSK: Rig = {keyHue: 68, skyHue: 288, rimTint: 0.62};

export type Kind = 'skin' | 'cloth' | 'hair' | 'leather' | 'satin' | 'denim' | 'suede' | 'glass' | 'metal';
export type Tones = {lit: string; shade: string; deep: string; hi: string; rim: string; glow: string; under: string};

/** The painted planes of one material. `base` is the colour as worn (in daylight); the planes are derived. */
export function planes(base: string, kind: Kind, rig: Rig = DUSK): Tones {
  const q = lch(base);
  const dark = q.L < 30;
  const light = q.L > 78;
  // LIT: the warm key lifts and warms a little
  const lit = hexOf(q.L + (dark ? 3 : 1.5), q.C * 1.04 + 1, turn(q.h, rig.keyHue, q.C < 8 ? 30 : 5));
  let shade: string;
  let deep: string;
  if (kind === 'skin') {
    // skin: L* x 0.8, the hue toward red, a little more chroma (design_research V5): never grey, never violet
    shade = hexOf(q.L * 0.8, q.C * 1.1, turn(q.h, 30, 7));
    deep = hexOf(q.L * 0.68, q.C * 1.08, turn(q.h, 25, 11));
  } else {
    // cloth and hair: the cool sky fill (dusk), colour never grey; dark materials have little room below them
    const dS = dark ? -6.5 : light ? -15 : -17;
    const tS = q.C < 10 ? 34 : 13;
    shade = hexOf(Math.max(5, q.L + dS), Math.max(q.C * 0.95, light ? 6 : 3), turn(q.h, rig.skyHue, tS));
    deep = hexOf(Math.max(4, q.L + dS - (dark ? 5 : 11)), Math.max(q.C * 0.9, 3), turn(q.h, rig.skyHue, tS + 4));
  }
  // HI: the warm key's brightest band (+6..+10 L*), warmer
  const hiDL = kind === 'satin' ? 13 : kind === 'leather' ? 18 : kind === 'hair' ? 13 : dark ? 9 : light ? 4 : 7;
  const hi = hexOf(Math.min(97, q.L + hiDL), q.C * (kind === 'satin' ? 0.92 : 1.02) + (kind === 'leather' ? 3 : 1), turn(q.h, rig.keyHue, q.C < 8 ? 40 : 9));
  // RIM: the cool sky catching the edge away from the key; strongest on dark materials, a soft cool lift on light ones
  // (never a saturated lilac stripe: the hue turns toward the sky by at most ~75 degrees and the chroma stays low)
  const rimDL = dark ? 18 : light ? 2 : kind === 'skin' ? 7 : 10;
  const rimC = q.C < 10 ? 7 : Math.min(q.C * 0.55 + 4, 18);
  const rim = hexOf(Math.min(95, q.L + rimDL), rimC, q.C < 10 ? rig.skyHue : turn(q.h, rig.skyHue, 120 * rig.rimTint));
  // GLOW (skin): the terminator's saturated warm band (light scattering in skin)
  const glow = kind === 'skin' ? hexOf(q.L * 0.9, q.C * 1.35 + 3, turn(q.h, 32, 10)) : lit;
  const under = hexOf(Math.max(4, q.L + (dark ? -8 : -24)), Math.max(3, q.C * 0.85), turn(q.h, rig.skyHue, 18));
  return {lit, shade, deep, hi, rim, glow, under};
}
