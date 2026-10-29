// The look test's palette: "10b Canal Mint, full range" (city-poster study, 2026-10-29: `docs/studies/
// 2026-10-28_city_posters/pro_4_colour.md` §3.3, §3.7; STUDY.md §10 build item 3), as a COPY of v2r's palette roles
// inside the test's own folder (src/v2r is shipped: never edited). Pure data and pure checks: importing this module
// changes nothing (no theme patch, no pen); the scene chooses per preset which role map it draws with.
//
//   CM_V2    v2r's `CM` role tokens, copied verbatim (src/v2r/palette.ts, 2026-10-29); `copyProblems(CM)` says if the
//            shipped palette ever moves away from this copy.
//   TENB     what 10b moves (every hue within 7 deg of v2's; only L* and C* move) and its two new roles.
//   CM10B    CM_V2 with TENB on top: the same keys as CM, so a scene switches `const C = pass2 ? CM10B : CM`.
//   JSON10B  the study's palette JSON exactly (palettes.json's role format: colors + support groups).
//   siblings10b()  3-5 sibling tints per fill role (lib/gamut `siblings`), the study's own facade siblings first.
//   problems10b()  the DNA and the study's claims, measured (empty = OK).
//
// Owner, 2026-10-29 ("Go with your suggestions"): 10b's darks in many pieces (CRAFT §f.8: 6-10 % under L* 40) and its
// tier-A shade at -24 (CRAFT §d.3's -20 to -25); its sun-orange pop stays a "look here", never a calm far sun. The
// palette itself stays a proposal (PALETTE.md) until the owner sees it in this test.

import {fromLch, lab, lch} from '../../lib/light';
import {inMask, siblings} from '../../lib/gamut';
import {neverBand} from '../../lib/water';

/** v2r's CM role tokens, verbatim (src/v2r/palette.ts `CM`, 2026-10-29). */
export const CM_V2 = {
  name: '10 Canal Mint',
  sky: '#BCDCCF',
  skyHigh: '#CFE6DC',
  bandGold: '#F6D9BC',
  bandSunset: '#F3C6A6',
  bandDusk: '#B3CDD2',
  stucco: '#F4E4D2',
  paving: '#EFD8C2',
  limestone: '#EEE4D4',
  glass: '#CDE1DF',
  paper: '#FBF3E6',
  brickLight: '#E3A88C',
  brick: '#C9806A',
  brickDeep: '#A5604F',
  sage: '#AFC4A8',
  stoneShade: '#C8C3D3',
  water: '#9DC6BF',
  waterDeep: '#7DAEA8',
  paneUnlit: '#5E6F86',
  hero: '#0B8577',
  anchor: '#36223A',
  pop: '#EE6A2E',
  sun: '#EE6A2E',
  box: '#F6B892',
  lamp: '#F7CF86',
  lampCore: '#FBE6C2',
  ink: '#2B1B0A',
  line: '#9A563C',
  shadeWarm: '#8C5E6B',
  shadeCool: '#6F80A0',
  leafGold: '#D6A563',
  leafRust: '#B8714F',
  blossom: '#F3C3CD',
  coatSlate: '#5E6F86',
  coatMustard: '#D4A960',
  coatOat: '#E6D3B5',
  coatPlum: '#6E4A5E',
  hair: ['#3E2A3A', '#6B4A3A', '#9A5A3E', '#B9B6C4', '#D9B98A'] as string[],
  ghostPaper: '#FBF6EE',
  ghostHead: ['#3E2A3A', '#7D7387', '#A9A5B5', '#CFCCD6', '#ECEAF0', '#ECEAF0'] as string[],
  ghostInkPx: 2.2,
  pipBody: '#9495C1',
  pipShade: '#73739D',
  pipEar: '#F2C3CC',
  pipScarf: '#D8C599',
  white: '#FBF3E6',
};

export type CanalPalette = typeof CM_V2 & {pavingShade: string; eaveShade: string};

/** What 10b moves (pro_4_colour.md §3.7, its JSON mapped onto v2's roles), and its two new roles. Measured against v2
 *  (CIE LCh, D65): every hue within 7 deg (paneUnlit -6.7, the rest <= 3.3). */
export const TENB = {
  name: '10b Canal Mint, full range (proposal)',
  // ---- the calm lights: v2's hues, C* down (the lights stop carrying a pastel tint, so the accents ring)
  sky: '#C5DDD3', // bg: L* 86 / C* 10 (v2 13); the caption field, ink 11.6:1
  skyHigh: '#D6E6DF', // the high sky: C* 7 (v2 10)
  bandGold: '#EFD9C4', // the gold horizon band: C* 14 (v2 19)
  stucco: '#F0E7DD', // C* 6 (v2 11)
  limestone: '#EAE5DC', // C* 5 (v2 9)
  paper: '#F9F3E8', // C* 6 (v2 7)
  white: '#F9F3E8', // the white of paper states, signs, boards: v2's white is its paper, so it moves with it
  paving: '#E9DED3', // ground, lit paving: C* 7 (v2 14.5)
  // ---- colour in the mids: the water and the sage drop to mid-tone fields (not pale ones)
  water: '#86B4AC', // L* 70 (v2 77)
  waterDeep: '#59908A', // L* 56 (v2 68)
  sage: '#8DA889', // leaf sage L* 66 (v2 77)
  // ---- the darks in many small pieces (CRAFT §f.8) and the shade family
  paneUnlit: '#3A5065', // unlit windows L* 33 (v2 46)
  stoneShade: '#A9A3B8', // the tier-A stone shade, -24 under lit stucco (v2 80 -> 68); B and C shade with lib/light FormShade at 0.20
  coatOat: '#E7D6BC', // leaves the beige band (v2 #E6D3B5: h 84, C* 17.4 under L* 86) upward: L* 86.5, C* 15, hue kept (C* >= 18 instead would leave the gamut mask)
  // ---- new roles
  pavingShade: '#CFAFA4', // paving in shade: rose, never beige (L* 74)
  eaveShade: '#6B4B5F', // the undersides of eaves, awnings, doorways: L* 36
} as const;

/** The 10b role map: v2's keys, 10b's values (the brick family, hero, anchor, pop, line, ink and caption box unchanged). */
export const CM10B: CanalPalette = {
  ...CM_V2,
  ...TENB,
  hair: [...CM_V2.hair],
  ghostHead: [...CM_V2.ghostHead],
};

/** The study's 10b JSON (palettes.json's role format), exactly. */
export const JSON10B = {
  name: '10b Canal Mint, full range (proposal)',
  mood: "v2's Canal Mint with the city posters' value and chroma plan: a calmer mint sky, cream-paper lights, colour in the mid-tone brick, water and sage, slate and plum darks in many small pieces; hues unchanged.",
  colors: {bg: '#C5DDD3', ground: '#E9DED3', disc: '#EE6A2E', hl: '#F6B892', line: '#9A563C', skin: '#D9A27E', hero: '#0B8577', anchor: '#36223A', pop: '#EE6A2E', ink: '#2B1B0A'},
  support: {
    calm_lights: {colors: ['#F0E7DD', '#EAE5DC', '#F9F3E8', '#D6E6DF', '#EFD9C4'], role: 'stucco, limestone, paper, the high sky, the gold horizon band: C* 5-14, v2\'s hues'},
    facade_siblings: {colors: ['#F2EDE6', '#E8DACF', '#E6BFA7', '#D6A695', '#CDBCCA', '#E3A88C', '#C9806A'], role: 'facades, boats, awnings: patches under 1-3 % each'},
    darks: {colors: ['#3A5065', '#6B4B5F', '#36223A'], role: 'windows (paneUnlit, L* 33), eave and doorway shade (L* 36), the anchor: 6-10 % in many pieces'},
    shade_family: {colors: ['#A9A3B8', '#CFAFA4', '#8C5E6B', '#6F80A0'], role: 'tier-A stone shade (-24 under lit stucco), paving in shade (rose, never beige), warm and cool form shade'},
    water_greens: {colors: ['#86B4AC', '#59908A', '#8DA889'], role: 'the canal (L* 70 / 56: a mid-tone field, not a pale one), leaf sage (L* 66)'},
  },
} as const;

/** The fill roles that get sibling tints (pro_4_colour.md §3.3c: facades, boats, awnings, clothes). */
export const SIBLING_ROLES = ['stucco', 'limestone', 'paving', 'pavingShade', 'brickLight', 'brick', 'brickDeep', 'sage', 'water', 'paneUnlit', 'eaveShade'] as const;
export type SiblingRole = (typeof SIBLING_ROLES)[number];

/** The calm lights' siblings: a C* 5-7 light at L* 89-92 cannot hold 3-5 tints dE 8-14 from it and 8 apart (it can only
 *  go darker, and its chroma is held to the mask), so they take the lower bound the study sets for "reads as a mistake"
 *  (dE 6) and up to 6 L* lighter or 10 darker. */
export const LIGHT_SIBLINGS = {dE: [6, 14] as [number, number], apart: 6, dL: [4, 10] as [number, number]};
const LIGHT_ROLES = new Set<string>(['stucco', 'limestone', 'paving']);

/** 3-5 sibling tints per fill role of `cm` (default 10b), seeded (lib/gamut `siblings`: hue +-8 deg, L* +-4-10, C* +-3-6,
 *  dE76 8-14 from the role and >= 8 apart, inside the mask, never beige / olive / grey; the calm lights LIGHT_SIBLINGS).
 *  Deterministic per seed. Check `.length`: a role returns fewer when the constraints leave no more. */
export function siblings10b(n = 4, seed = 'poster-s1', cm: CanalPalette = CM10B): Record<SiblingRole, string[]> {
  const out = {} as Record<SiblingRole, string[]>;
  for (const r of SIBLING_ROLES) out[r] = siblings(cm[r], n, `${seed}/${r}`, LIGHT_ROLES.has(r) ? LIGHT_SIBLINGS : {});
  return out;
}

const dE76 = (a: string, b: string) => {
  const p = lab(a);
  const q = lab(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};
const relLum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** The copy against the shipped palette (pass v2r's CM): every role here must still equal it (empty = OK). */
export function copyProblems(cm: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(CM_V2)) {
    const got = cm[k];
    if (JSON.stringify(got) !== JSON.stringify(v)) out.push(`CM.${k} is ${JSON.stringify(got)} in src/v2r, ${JSON.stringify(v)} in this copy`);
  }
  for (const k of Object.keys(cm)) if (!(k in CM_V2)) out.push(`CM.${k} is new in src/v2r: copy it`);
  return out;
}

/** 10b's DNA and the study's claims, measured (empty = OK): every moved role within 7 deg of v2's hue; the stated L* / C*
 *  moves (+-1.5); the caption ink >= 7:1 on the sky (the study: 11.6); the new roles out of the never bands; the fills
 *  inside the gamut mask but the pop, the light sources and the caption box; the hero unique (dE >= 20 from every other
 *  role). */
export function problems10b(cm: CanalPalette = CM10B): string[] {
  const out: string[] = [];
  const v2 = CM_V2 as unknown as Record<string, unknown>;
  const now = cm as unknown as Record<string, unknown>;
  for (const k of Object.keys(TENB)) {
    if (k === 'name' || !(k in v2)) continue;
    const a = lch(v2[k] as string);
    const b = lch(now[k] as string);
    const dh = Math.abs(((b.h - a.h + 540) % 360) - 180);
    if (a.C > 4 && b.C > 4 && dh > 7.05) out.push(`${k}: hue ${dh.toFixed(1)} deg off v2's (10b keeps every hue within 7)`);
  }
  const want: [keyof CanalPalette, 'L' | 'C', number][] = [
    ['sky', 'C', 10], ['stucco', 'C', 6], ['paving', 'C', 7], ['water', 'L', 70], ['waterDeep', 'L', 56],
    ['paneUnlit', 'L', 33], ['sage', 'L', 66], ['stoneShade', 'L', 68], ['eaveShade', 'L', 36],
  ];
  for (const [k, m, v] of want) {
    const got = lch(cm[k] as string)[m];
    if (Math.abs(got - v) > 1.5) out.push(`${String(k)}: ${m}* ${got.toFixed(1)} (10b: ${v})`);
  }
  const ink = contrast(cm.ink, cm.sky);
  if (ink < 7) out.push(`ink on the sky ${ink.toFixed(2)}:1 (< 7:1)`);
  for (const k of ['pavingShade', 'eaveShade', 'coatOat', 'stucco', 'paving', 'limestone', 'paper', 'sky', 'water', 'waterDeep', 'sage'] as const) {
    const band = neverBand(cm[k]);
    if (band) out.push(`${k} ${cm[k]} is in the ${band} band`);
  }
  // outside by design (pro_4_colour.md §3.3a): the one pop, the light sources, the caption box (UI), and v2's roles the
  // study lists outside (the sunset band, the blossom, Pip's ear and scarf)
  const outsideOk = new Set(['pop', 'sun', 'lamp', 'lampCore', 'box', 'bandGold', 'bandSunset', 'blossom', 'pipEar', 'pipScarf']);
  for (const [k, v] of Object.entries(now)) {
    if (typeof v !== 'string' || !v.startsWith('#') || outsideOk.has(k)) continue;
    if (!inMask(v)) out.push(`${k} ${v} is outside the Canal Mint gamut mask`);
  }
  for (const [k, v] of Object.entries(now)) {
    if (typeof v !== 'string' || !v.startsWith('#') || k === 'hero') continue;
    if (dE76(cm.hero, v) < 20) out.push(`${k} ${v} is within dE ${dE76(cm.hero, v).toFixed(1)} of the hero (teal is hers only)`);
  }
  return out;
}

/** The coatOat fix, recomputed (the value in TENB): v2's oat lifted out of the beige band (h 55-95 at C* 6-18 under L*
 *  86) to L* 86.5 at C* 15, its hue kept, inside the mask (C* >= 18 at its own L* would leave it). */
export const coatOat10b = () => fromLch(86.5, 15, lch(CM_V2.coatOat).h);
