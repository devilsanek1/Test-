// Video 2 (restart, "One Small Window"): K1, the palette "10 Canal Mint" (docs/v2/TREATMENT.md section 2).
//
// Import this module FIRST in every v2r entry (src/entry-v2r-*.tsx), before any lib or kit module: it rewrites the
// house theme tokens (src/lib/theme.ts) IN PLACE at module load, so every house module evaluated after it (lib/Ink,
// lib/Fill, lib/World, lib/Sun, lib/Captions, lib/Film; their module-level colour tables included) draws in Canal Mint.
// Only ./pen (with lib/sketch, lib/rng and lib/pen: none reads a colour) and theme.ts are evaluated before this body; theme.ts's derived tables (skies,
// todSky, todSteps, todTone, todBulbHalo, captionTones, glow, type.color) are patched here explicitly. Other entries
// (v1, v3) are separate bundles and keep their palettes. `problems()` re-checks it all at render time.
//
// The film's own kit (src/v2r/kit/**) and scenes draw with the ROLE tokens below (`CM.*`), never raw hex and never
// the house names: the house mapping exists only so engine primitives (the paper state, the sky, captions) agree.
//
// LIGHT = STORY TIME (TREATMENT section 2): four states, one palette. The sky (= the caption field) is the SAME flat
// mint in every state; a state changes only the flat horizon bands below y 600, where the sun sits, the lamps, and
// the season dressing. World sky keys use the house TodName each state maps to (TOD.golden, TOD.lowSun, ...):
//   golden   S1, S2, the loop         gold band; lamps off; October leaves
//   lowSun   S4 (her walk home)       gold band, the sun low on the far roofs; lamps off
//   april    S5, S6 (Arlington)       a cool high step over a gold band; blossom; lamps off
//   sunset   S3 (flash-forward), S7, S8   sunset band (+ dusk mint above it late); lamps coming on
// No state relights a fill (todSteps are empty): the palette never changes, only what the shot draws.

import './pen'; // the clean pen first (STYLE.md §3), then the palette tokens
import {PEN, tierLineColor} from '../lib/pen'; // pure TS, already loaded by ./pen (problems() reads Pip's B line)
import {captionTones, contrastHex, deltaE, glow, palette, skies, todBulbHalo, todSky, todSteps, todTone, type as typeTok, TodName} from '../lib/theme';

export const PALETTE_NAME = '10 Canal Mint';

// ---------------------------------------------------------------- the role tokens (TREATMENT section 2, exact hex)

export const CM = {
  name: PALETTE_NAME,
  // ---- sky = the caption field (the ONE quiet field of every shot, y 0-600)
  sky: '#BCDCCF', // mint, L* 85 / C* 13; ink 11.3:1
  skyHigh: '#CFE6DC', // the high step (a cloud, the April morning's upper band)
  // ---- horizon bands: flat, below y 600 only, never in y 317-556
  bandGold: '#F6D9BC',
  bandSunset: '#F3C6A6',
  bandDusk: '#B3CDD2', // dusk mint (ink 10:1)
  // ---- the page (50-80 % of every frame): many light fills, never one slab
  stucco: '#F4E4D2',
  paving: '#EFD8C2',
  limestone: '#EEE4D4',
  glass: '#CDE1DF',
  paper: '#FBF3E6',
  // ---- mids: facades, roofs, trees, boat cabins
  brickLight: '#E3A88C',
  brick: '#C9806A',
  brickDeep: '#A5604F',
  sage: '#AFC4A8',
  stoneShade: '#C8C3D3',
  // ---- cool (>= 10 %)
  water: '#9DC6BF',
  waterDeep: '#7DAEA8',
  paneUnlit: '#5E6F86',
  // ---- the colour jobs
  hero: '#0B8577', // canal teal: HER ONLY (coat, door, window frame); present on her shots (she is small, ~0.3 %)
  anchor: '#36223A', // plum: her dark office window, hair, gunwale stripes, board frames, near silhouettes (~5 %)
  pop: '#EE6A2E', // sun orange: the sun disc only (1-3 %)
  sun: '#EE6A2E',
  // ---- support
  box: '#F6B892', // the caption highlight box (peach)
  lamp: '#F7CF86',
  lampCore: '#FBE6C2',
  ink: '#2B1B0A',
  line: '#9A563C', // warm line colour (wood, frames, posts)
  shadeWarm: '#8C5E6B', // shadows are colour, never grey
  shadeCool: '#6F80A0',
  // ---- confetti (< 1 % each, C* <= 45): people and dressing
  leafGold: '#D6A563',
  leafRust: '#B8714F',
  blossom: '#F3C3CD',
  coatSlate: '#5E6F86',
  coatMustard: '#D4A960',
  coatOat: '#E6D3B5',
  coatPlum: '#6E4A5E',
  hair: ['#3E2A3A', '#6B4A3A', '#9A5A3E', '#B9B6C4', '#D9B98A'] as string[],
  // ---- the ghosts (S1; S8 callback): paper fill, 2.2 px ink; age by whole-head value G1 -> G6
  ghostPaper: '#FBF6EE',
  ghostHead: ['#3E2A3A', '#7D7387', '#A9A5B5', '#CFCCD6', '#ECEAF0', '#ECEAF0'] as string[],
  ghostInkPx: 2.2,
  // ---- Pip ("towpath Pip", K5): tier B (docs/look/DIRECTION.md rule 2, CRAFT §b-§c): every Pip colour at C* <= 25,
  //      the periwinkle hue (292 deg) kept. On screen the clean pen calms it once more (support: chroma x0.9, value 8 %
  //      toward the ground: the body reads ~#999AC2, L* 65 / C* 22) and draws its same-hue line at the body's L* -20
  //      (#616389, L* 43 / C* 23, 1.6-2.2 px). Before 2026-10-27: #9497D8 / #7579C0 / #D4A960 (C* 36 / 41 / 44).
  pipBody: '#9495C1', // L* 63.0 / C* 24.6; dE76 23-50 from every ground (GROUNDS)
  pipShade: '#73739D', // L* 49.9 / C* 24.6: the far ear, the far legs (13 L* under the body: B parts by value)
  pipEar: '#F2C3CC', // L* 83.1 / C* 18.2: inner ear, cheeks, soles
  pipScarf: '#D8C599', // L* 80.1 / C* 24.5: a soft straw mustard (the coats' mustard #D4A960 is C* 44: never on Pip)
  // ---- the white of paper states, signs, boards (warm; Look fills="paper" paints this)
  white: '#FBF3E6',
};

/** Coats of the public (never teal: the hero is hers only). */
export const COATS: string[] = [CM.coatSlate, CM.coatMustard, CM.coatOat, CM.coatPlum];
/** AUTHORED ink widths (on-screen px at 1080), the sketch-era depth ladder front / mid / far / hair. Under the film's
 *  clean pen (./pen.ts) a line's width and colour come from its attention TIER, by story role, never by depth (DIRECTION
 *  rule 4, CRAFT §c): A 3.0 outline / ~1.9 detail in the object's own deep shade; B none, or a same-hue 1.6-2.2 px line;
 *  C none. Author an A outline at `INK_PX.mid` or wider (the pen makes it 3.0 px); never strip these by hand. */
export const INK_PX = {front: 4.8, mid: 3.4, far: 2.2, hair: 1.6} as const;
/** RETIRED (2026-10-27, DIRECTION "Retired": misregistered fills): the clean pen registers every fill exactly (offset 0).
 *  Kept only so built code compiles. */
export const MISREG_PX = [2, 5] as const;

export type CanalRole = keyof typeof CM;

// ---------------------------------------------------------------- the four light states

export type LightState = 'golden' | 'lowSun' | 'april' | 'sunset';

/** The house TodName each light state rides on (World sky keys: `{t, tod: TOD.sunset}`). */
export const TOD: Record<LightState, TodName> = {golden: 'golden', lowSun: 'day', april: 'dawn', sunset: 'dusk'};

export type LightSpec = {
  tod: TodName;
  /** The sky (= caption field). The same mint in every state. */
  sky: string;
  /** Flat horizon bands, TOP -> horizon, drawn below y 600 only (never in the caption band y 317-556). */
  bands: string[];
  /** A later, deeper version of the bands (S8's end, S7 late): dusk mint above the sunset band. */
  bandsLate?: string[];
  /** Lamps (towpath lamps, string lights, lit windows): off, or allowed to come on in this state. */
  lamps: 'off' | 'on';
  /** The season dressing that tells the date without words (V13). */
  season: 'october' | 'april';
  /** Caption tone over this state's sky (always ink on the mint). */
  captionTone: 'dark';
};

export const LIGHT: Record<LightState, LightSpec> = {
  golden: {tod: TOD.golden, sky: CM.sky, bands: [CM.bandGold], lamps: 'off', season: 'october', captionTone: 'dark'},
  lowSun: {tod: TOD.lowSun, sky: CM.sky, bands: [CM.bandGold], lamps: 'off', season: 'october', captionTone: 'dark'},
  april: {tod: TOD.april, sky: CM.sky, bands: [CM.skyHigh, CM.bandGold], lamps: 'off', season: 'april', captionTone: 'dark'},
  sunset: {tod: TOD.sunset, sky: CM.sky, bands: [CM.bandSunset], bandsLate: [CM.bandDusk, CM.bandSunset], lamps: 'on', season: 'october', captionTone: 'dark'},
};

/** Which light state each shot is in (TREATMENT section 2: S3 is a flash-forward in S8's sunset state). */
export const SHOT_LIGHT: Record<string, LightState> = {
  V2S1: 'golden',
  V2S2: 'golden',
  V2S3: 'sunset',
  V2S4: 'lowSun',
  V2S5: 'april',
  V2S6: 'april',
  V2S7: 'sunset',
  V2S8: 'sunset',
};

/** World sky bands for a light state, top -> horizon: the mint caption field, then the state's flat bands
 *  (`late`: S8 / S7 late sunset, dusk mint above the sunset band). Pass World `horizon` >= 760: lib/World starts the
 *  2nd band at y = horizon - max(160, horizon - 600), so it lands on y 600 exactly only when horizon - 600 >= 160 (a
 *  lower horizon pulls a band up into the caption block y 317-556). A 3rd band starts 110 px above the horizon. */
export function skyBands(state: LightState, late = false): string[] {
  const L = LIGHT[state];
  return [L.sky, ...(late && L.bandsLate ? L.bandsLate : L.bands)];
}

/** A World sky key for a light state (structurally lib/World's SkyKey; this module imports only theme.ts). */
export function skyKey(state: LightState, t = 0, o: {late?: boolean; wipe?: 'down' | 'up' | 'left' | 'right' | 'snap'; dur?: number} = {}) {
  return {t, color: skyBands(state, o.late), tod: TOD[state], wipe: o.wipe, dur: o.dur};
}

/** Caption tones: ink on the mint in every shot, the peach box under the key word. */
export const CAPTION_TONE = 'dark' as const;
export const CAPTION_COLORS = {text: CM.ink, highlight: CM.box, highlightText: CM.ink} as const;

// ---------------------------------------------------------------- the house tokens, rewritten in place

type Mut = Record<string, unknown>;

/** House palette keys -> Canal Mint. The house semantics translated so an engine primitive drawn with a house colour
 *  lands in this world: the mint page/sky stays the mint, cream / sand are the light page fills (stucco, paving), the
 *  dark walls step to brick, ochre to the warm line colour, and the house "teal" family goes to the COOL water / pane
 *  colours, never the hero (the canal teal is hers only and is reached through CM.hero). */
export const HOUSE_PALETTE = {
  bg: CM.sky,
  card: CM.paper,
  ink: CM.ink,
  sun: CM.sun,
  highlight: CM.box,
  peach: CM.box,
  salmon: CM.box,
  cream: CM.stucco,
  tan: CM.brick,
  brown: CM.line,
  teal: CM.waterDeep,
  tealDark: CM.paneUnlit,
  sage: CM.sage,
  mintPale: CM.glass,
  olive: CM.paneUnlit,
  grey: CM.paving,
  sky: CM.sky,
  sand: CM.paving,
  clay: CM.brick,
  ochre: CM.line,
  white: CM.white,
} as const;

const TODS: TodName[] = ['day', 'golden', 'dusk', 'night', 'dawn'];

function apply() {
  Object.assign(palette as unknown as Mut, HOUSE_PALETTE);
  Object.assign(skies as unknown as Mut, {day: CM.sky, golden: CM.sky, dusk: CM.sky, night: CM.sky, deep: CM.paneUnlit, cream: CM.paper});
  for (const n of TODS) {
    (todSky as Mut)[n] = CM.sky; // one sky in every state: the caption field
    (todTone as Mut)[n] = 'dark'; // ink captions on the mint, always
    (todSteps as Mut)[n] = {}; // the palette never changes: no relight steps
    (todBulbHalo as Mut)[n] = null; // no glow, no halo
  }
  Object.assign(glow as unknown as Mut, {bulbHalo: CM.lampCore, lamp: CM.lamp});
  Object.assign(captionTones.dark as unknown as Mut, {text: CM.ink, highlight: CM.box, highlightText: CM.ink});
  // 'light' is never used (no dark sky in this film); kept legible on dark grounds just in case.
  Object.assign(captionTones.light as unknown as Mut, {text: CM.paper, highlight: CM.box, highlightText: CM.ink});
  (typeTok as unknown as Mut).color = CM.ink;
}
apply();

// ---------------------------------------------------------------- colour maths (pure)

/** CIELAB (D65) of a hex colour: [L*, a*, b*]. */
export function lab(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
/** CIE chroma C*. */
export const chroma = (hex: string) => {
  const [, a, b] = lab(hex);
  return Math.hypot(a, b);
};
export {contrastHex, deltaE};

// ---------------------------------------------------------------- problems(): the render-time checks

/** The grounds Pip may stand in front of (every flat field of the film). */
export const GROUNDS: string[] = [
  CM.sky, CM.skyHigh, CM.bandGold, CM.bandSunset, CM.bandDusk,
  CM.stucco, CM.paving, CM.limestone, CM.glass, CM.paper,
  CM.brickLight, CM.brick, CM.brickDeep, CM.sage, CM.stoneShade,
  CM.water, CM.waterDeep,
];

/** Measured frame coverage (fractions 0..1, e.g. scripts/qa/colour_meter output) for the budget checks. */
export type Coverage = {page?: number; hero?: number; pop?: number; anchor?: number; herShot?: boolean};

/** Canal Mint's rules (TREATMENT section 9 K1), empty = OK:
 *  - the house tokens really are Canal Mint (an import-order slip shows up here);
 *  - caption ink >= 7:1 on the sky and every band; the box keeps the ink legible;
 *  - Pip's body dE76 >= 20 from every ground;
 *  - Pip is tier B (DIRECTION rule 2, CRAFT §b-§c): every Pip colour C* <= 25 and dE >= 20 from the pop; the shade
 *    >= 12 L* under the body; with the clean pen on, Pip's line (the pen's B line from the body) keeps the body's hue
 *    (<= 6 deg), sits 15-25 L* under it at C* <= 25, 1.6-2.2 px wide, and the pen caps B fills at C* 25;
 *  - the hero is unique: no other role and no coat / hair / confetti within dE 20 of the canal teal;
 *  - confetti C* <= 45; nothing grey in the page (C* >= 5);
 *  - with `coverage`: page >= 50 %, hero present (<= 15 %) on her shots (0 % elsewhere is fine), pop <= 3 %, anchor <= ~8 %.
 *  `captured` = colours some module copied at ITS import time: [label, got, want]. */
export function problems(coverage?: Coverage, captured: [string, string, string][] = []): string[] {
  const out: string[] = [];
  const eq = (label: string, got: unknown, want: string | null) => {
    if (String(got).toUpperCase() !== String(want).toUpperCase()) out.push(`${label} = ${String(got)} (want ${want})`);
  };
  for (const [k, v] of Object.entries(HOUSE_PALETTE)) eq(`palette.${k}`, (palette as unknown as Mut)[k], v);
  for (const n of TODS) {
    eq(`todSky.${n}`, todSky[n], CM.sky);
    eq(`todTone.${n}`, todTone[n], 'dark');
    if (Object.keys(todSteps[n] ?? {}).length) out.push(`todSteps.${n} is not empty (the palette never changes)`);
    if (todBulbHalo[n]) out.push(`todBulbHalo.${n} = ${todBulbHalo[n]} (no glow in this film)`);
  }
  eq('skies.golden', skies.golden, CM.sky);
  eq('captionTones.dark.text', captionTones.dark.text, CM.ink);
  eq('captionTones.dark.highlight', captionTones.dark.highlight, CM.box);
  eq('type.color', typeTok.color, CM.ink);
  for (const [label, got, want] of captured) eq(label, got, want);

  // caption legibility: ink on every field a caption or the frame-0 block can sit on
  for (const [name, bg] of [['sky', CM.sky], ['skyHigh', CM.skyHigh], ['bandDusk', CM.bandDusk], ['box', CM.box]] as const) {
    const c = contrastHex(CM.ink, bg);
    if (c < 7) out.push(`ink on ${name} ${bg} is ${c.toFixed(2)}:1 (< 7:1)`);
  }
  // Pip reads on every ground
  for (const g of GROUNDS) {
    const d = deltaE(CM.pipBody, g);
    if (d < 20) out.push(`Pip body ${CM.pipBody} on ${g}: dE ${d.toFixed(1)} (< 20)`);
  }
  // Pip is tier B: soft, never the pop's hue (the hero check below covers the teal), parted by value, a same-hue line
  for (const k of ['pipBody', 'pipShade', 'pipEar', 'pipScarf'] as const) {
    if (chroma(CM[k]) > 25) out.push(`${k} ${CM[k]} C* ${chroma(CM[k]).toFixed(1)} (> 25: Pip is tier B)`);
    const dp = deltaE(CM[k], CM.pop);
    if (dp < 20) out.push(`${k} ${CM[k]} is within dE ${dp.toFixed(1)} of the pop ${CM.pop}`);
  }
  const pipStep = lab(CM.pipBody)[0] - lab(CM.pipShade)[0];
  if (pipStep < 12) out.push(`Pip shade ${CM.pipShade} is only ${pipStep.toFixed(1)} L* under the body (B parts by value: >= 12)`);
  if (PEN.mode === 'clean') {
    const sp = PEN.tiers.support;
    const pipLine = tierLineColor('support', CM.pipBody).color;
    const drop = lab(CM.pipBody)[0] - lab(pipLine)[0];
    const hue = (h: string) => {
      const [, a, b] = lab(h);
      return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
    };
    const dh = Math.abs(((hue(pipLine) - hue(CM.pipBody) + 540) % 360) - 180);
    if (drop < 15 || drop > 25) out.push(`Pip's line ${pipLine} sits ${drop.toFixed(1)} L* under the body (want 15-25)`);
    if (chroma(pipLine) > 25) out.push(`Pip's line ${pipLine} C* ${chroma(pipLine).toFixed(1)} (> 25)`);
    if (dh > 6) out.push(`Pip's line ${pipLine} turns ${dh.toFixed(1)} deg off the body's hue (same hue: <= 6)`);
    if (sp.min < 1.6 || sp.max > 2.2) out.push(`the pen's B line is ${sp.min}-${sp.max} px (Pip's line: 1.6-2.2 px)`);
    if (sp.chromaMax > 25) out.push(`the pen caps B fills at C* ${sp.chromaMax} (> 25)`);
  }
  // the hero is hers only
  const nonHero: [string, string][] = Object.entries(CM)
    .filter(([k, v]) => typeof v === 'string' && k !== 'hero' && k !== 'name' && (v as string).startsWith('#'))
    .map(([k, v]) => [k, v as string]);
  for (const [i, h] of CM.hair.entries()) nonHero.push([`hair[${i}]`, h]);
  for (const [k, v] of nonHero) {
    const d = deltaE(CM.hero, v);
    if (d < 20) out.push(`${k} ${v} is within dE ${d.toFixed(1)} of the hero ${CM.hero} (teal is hers only)`);
  }
  // confetti stays quiet; the page is warm, never grey
  for (const k of ['leafGold', 'leafRust', 'blossom', 'coatSlate', 'coatMustard', 'coatOat', 'coatPlum'] as const) {
    if (chroma(CM[k]) > 45.5) out.push(`${k} ${CM[k]} C* ${chroma(CM[k]).toFixed(1)} (> 45)`);
  }
  for (const k of ['stucco', 'paving', 'limestone', 'glass', 'paper'] as const) {
    if (chroma(CM[k]) < 4.5) out.push(`page ${k} ${CM[k]} C* ${chroma(CM[k]).toFixed(1)} reads grey`);
  }
  // coverage budgets (measured)
  if (coverage) {
    const pct = (x: number) => `${(x * 100).toFixed(1)} %`;
    if (coverage.page !== undefined && coverage.page < 0.5) out.push(`page ${pct(coverage.page)} (< 50 %)`);
    if (coverage.hero !== undefined) {
      // she is small (people rule): her coat is ~0.3 % of a frame, so her shots need the teal PRESENT, not 5-15 % (STYLE.md)
      if (coverage.herShot && (coverage.hero <= 0 || coverage.hero > 0.15)) out.push(`hero ${pct(coverage.hero)} on her shot (want > 0, <= 15 %)`);
      if (!coverage.herShot && coverage.hero > 0.15) out.push(`hero ${pct(coverage.hero)} (> 15 %)`);
    }
    if (coverage.pop !== undefined && coverage.pop > 0.03) out.push(`pop ${pct(coverage.pop)} (> 3 %)`);
    if (coverage.anchor !== undefined && coverage.anchor > 0.08) out.push(`anchor ${pct(coverage.anchor)} (> ~5 %, cap 8 %)`);
  }
  return out;
}
