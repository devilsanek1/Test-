// cine/atmosphere.ts — time-of-day palettes and STEPPED atmospheric perspective, all derived from the
// reference palette (theme.palette). No gradients: depth tints snap to a few flat steps.
//
//   const P = TOD.dusk;                       // full theme-compatible palette (same keys as `palette`) + sky extras
//   P.skyBands                                // flat sky value steps, top -> horizon
//   atmos(palette.tan, 0.8, 'dusk')           // a far building: ambient-shifted, then pulled toward the haze
//   ambient(palette.cream, 'night')           // the same paint seen at night (no depth tint)
//   tone(depth)                               // which haze step a depth falls into (0..steps)
//
// Measured anchors: reference 2's dusk sky is sage #6D988B (f_33), its night sky teal #547977 (f_38, f_42);
// lit bulbs are peach with a sage halo disc (f_38). Deeper night steps are tealDark at 78% / 60% value.
// RELIGHT RULE (style_bible_ref2 4, measured): time of day never MIXES paint. Only the light fields step down one
// palette step at dusk (sky -> teal, mintPale -> sky, sand -> tan, cream -> sand) and the near ground a second step at
// night (mintPale -> sage). Whites, mid and dark tones, ochre, ink, peach and the sun never move (TOD_STEPS).
// ONE TABLE FOR BOTH LANES: the caption-band sky (skyBands[0]) and the caption tone come from theme `skies` / `todTone`
// (day and golden: the flat day sky #ACD1BF + ink, style_bible_ref2 8 "golden = same flat sky + peach-lit faces";
// dusk: sage + ink; night: #588077 + white). Pieces default `tod` to the core <Tod> context (useTodPal), so inside a
// timed <World> they relight with it; pass `tod` to pin one.

import {captionTones, nightFar, palette, skies, todSky, todSteps, todTone, TodName, TodRole} from '../theme';
import {relight, useTodValue} from '../tod';
import {hexToRgb, mix, rgbToHex} from './util';

/** A time of day name (the same names as the core `TodName`). Renamed from `Tod` (which clashed with the core <Tod>
 *  component in the barrels). */
export type TodLike = TodName;
/** @deprecated use `TodLike` (kept for deep imports from './atmosphere'; not re-exported by the cine barrel). */
export type Tod = TodLike;
export const TODS: TodLike[] = ['day', 'golden', 'dusk', 'night', 'dawn'];

/** Multiply a colour's RGB by k (k < 1 darkens, keeps hue). */
export function shade(hex: string, k: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * k, g * k, b * k);
}

const P = palette;

/** Deep teal steps for night skies (tealDark at lower value: same hue, no new pigment). */
export const deep = {
  teal78: shade(P.tealDark, 0.78),
  teal60: shade(P.tealDark, 0.6),
  teal45: shade(P.tealDark, 0.45),
} as const;

type Base = {-readonly [K in keyof typeof palette]: string};

/** Palette steps per time of day (hex -> hex), the `base` row of the SHARED table `todSteps` (theme.ts, read by core
 *  <Fill> through <Tod> too), so cine and core relight identically. Anything not listed keeps its paint. */
export const TOD_STEPS: Record<TodLike, Readonly<Record<string, string>>> = Object.fromEntries(
  TODS.map((name) => {
    const row = todSteps[name]?.base ?? {};
    const m: Record<string, string> = {};
    for (const k of Object.keys(row) as (keyof typeof palette)[]) m[P[k].toUpperCase()] = row[k]!;
    return [name, m];
  }),
) as Record<TodLike, Readonly<Record<string, string>>>;

export type TodPalette = Base & {
  name: TodLike;
  /** Relight row the base keys were stepped with ('base'; 'far' / 'cloud' / 'framing' from a core <Tod role>). */
  role: TodRole;
  /** Flat sky value steps, top -> horizon (draw with <Sky>). [0] = the caption-band sky = theme todSky (golden: day). */
  skyBands: string[];
  /** Colour far layers are pulled toward (atmospheric perspective). */
  haze: string;
  /** Flat band right on the horizon / around a low sun. */
  horizonGlow: string;
  /** Halo colour for stepped glows (sun, lamps, bulbs). */
  glow: string;
  sunColor: string;
  cloud: string;
  cloudShade: string;
  /** Clouds get ink on their top (day) or are fill-only (dusk / night, like ref 2 f_42). */
  cloudInk: boolean;
  star: string;
  /** Star density 0..1 (0 in daylight). */
  stars: number;
  windowLit: string[];
  windowDark: string;
  /** Building fill choices for the nearest row (atmos() tints them with depth). */
  facade: string[];
  /** Fill-only dark shapes (far silhouettes, backlit figures). */
  silhouette: string;
  /** Rim light / lit edge colour. */
  rim: string;
  ground: string;
  /** Caption text colour on this sky (= theme captionTones[todTone[name]].text: ink on day / golden / dusk, white at night). */
  text: string;
  /** Palette steps this light applies (TOD_STEPS[name]; see ambient()). */
  steps: Readonly<Record<string, string>>;
  /** Max haze mix for depth 1 (atmos()). */
  hazeMax: number;
  /** FAR-LAYER LADDER (dusk / night): flat palette steps from the horizon toward the viewer. With a ladder, atmos()
   *  does not MIX far rows toward a haze: each far band (depth >= 0.75 / 0.5 / 0.3) takes one step of the ladder (light
   *  paints that step, dark paints the next), so far rows read as flat silhouettes one value step off the sky that
   *  is actually drawn (style_bible_ref2 8: night sky #588077 -> far #4B706B -> tealDark -> ink-dark; Arcane: haze
   *  layers step in value toward the sky). Without it (day / golden / dawn) far rows mix toward `haze` (= the sky). */
  ladder?: string[];
};

type Opts = Omit<TodPalette, keyof Base | 'name' | 'steps' | 'role' | 'text'>;

function make(name: TodLike, o0: Opts, role: TodRole = 'base'): TodPalette {
  const steps = TOD_STEPS[name];
  // the caption-band sky is READ from the core table (theme todSky), never restated here: the World sky and a cine
  // <Sky> / haze can't disagree (review: golden used to be cream in core and the day sky in cine)
  const o: Opts = {...o0, skyBands: [todSky[name], ...o0.skyBands.slice(1)]};
  const base = {} as Base;
  for (const k of Object.keys(P) as (keyof typeof P)[]) base[k] = relight(P[k], name, role);
  base.sky = o.skyBands[0];
  base.bg = o.skyBands[Math.min(1, o.skyBands.length - 1)];
  return {...base, name, role, steps, text: captionTones[todTone[name]].text, ...o};
}

/** Table check (engine-numbers --check runs it): every TOD palette's caption-band sky equals the core todSky, and its
 *  caption colour the core todTone. Returns problems (empty = OK). */
export function todTableProblems(): string[] {
  const out: string[] = [];
  for (const n of TODS) {
    if (TOD[n].skyBands[0].toUpperCase() !== todSky[n].toUpperCase()) out.push(`TOD.${n}.skyBands[0] ${TOD[n].skyBands[0]} != todSky.${n} ${todSky[n]}`);
    if (TOD[n].text !== captionTones[todTone[n]].text) out.push(`TOD.${n}.text ${TOD[n].text} != the ${todTone[n]} caption tone`);
  }
  return out;
}

const OPTS: Record<TodLike, Opts> = {
  day: {
    // ONE flat value (ref 2 day skies are flat: no steps, no divider line under the caption band)
    skyBands: [skies.day],
    // ref 2 day: far layers step from sage toward the sky (#98C0AE ~ mix(sky, sage, 0.25)), never lighter than it
    haze: P.sky,
    horizonGlow: mix(P.sky, P.mintPale, 0.55),
    glow: P.mintPale,
    sunColor: P.sun,
    cloud: P.white,
    cloudShade: P.mintPale,
    cloudInk: true,
    star: P.cream,
    stars: 0,
    windowLit: [P.cream, P.white],
    windowDark: P.teal,
    facade: [P.cream, P.sand, P.white, P.mintPale, P.tan],
    silhouette: P.sage,
    rim: P.white,
    ground: P.mintPale,
    hazeMax: 0.78,
  },
  golden: {
    // style_bible_ref2 8: golden = the same flat day sky + peach-lit faces and a low sun (no sky steps)
    skyBands: [skies.day],
    haze: mix(P.cream, P.sky, 0.3),
    horizonGlow: mix(P.peach, P.cream, 0.45),
    glow: P.peach,
    sunColor: P.sun,
    cloud: P.cream,
    cloudShade: P.sand,
    cloudInk: true,
    star: P.cream,
    stars: 0,
    windowLit: [P.peach, P.cream],
    windowDark: P.teal,
    facade: [P.cream, P.sand, P.tan, P.mintPale],
    silhouette: mix(P.sky, P.teal, 0.45),
    rim: P.cream,
    ground: P.cream,
    hazeMax: 0.75,
  },
  dusk: {
    // ref 2 dusk sky = sage #6D988B (f_33) = theme skies.dusk, ink captions (todTone.dusk); value steps toward peach
    // only BELOW y 600 (Sky keeps the caption band on skyBands[0]); teal / #588077 is night's
    skyBands: [skies.dusk, mix(P.sage, P.sky, 0.55), mix(P.sky, P.peach, 0.45), mix(P.peach, P.cream, 0.3)],
    // far rows are SILHOUETTES one step darker than the flat sage sky the core World draws (teal 1.36:1), stepping
    // darker toward the viewer; never a light peach-grey mix (that read as fog: 1.2-1.4:1 LIGHTER than the sky)
    haze: P.teal,
    ladder: [P.teal, nightFar, P.tealDark, deep.teal78],
    horizonGlow: mix(P.peach, P.cream, 0.45),
    glow: P.peach,
    sunColor: P.sun,
    cloud: mix(P.sage, P.teal, 0.5),
    cloudShade: P.teal,
    cloudInk: false,
    star: P.cream,
    stars: 0.25,
    windowLit: [P.peach, P.cream],
    windowDark: P.tealDark,
    facade: [P.tealDark, P.teal, P.tan, P.brown],
    silhouette: P.tealDark,
    rim: P.peach,
    ground: P.teal,
    hazeMax: 0.8,
  },
  night: {
    // = theme skies.night #588077 behind the captions (never darker, style_bible_ref2 8); lighter steps toward the
    // horizon (city glow), all below y 600
    skyBands: [skies.night, mix(skies.night, P.sage, 0.3), mix(skies.night, P.sage, 0.55)],
    // ref 2 night far step #4B706B = mix(teal, tealDark, 0.5) (theme nightFar)
    haze: nightFar,
    ladder: [nightFar, P.tealDark, deep.teal78, deep.teal60],
    horizonGlow: P.teal,
    glow: P.sage,
    sunColor: P.sun,
    cloud: P.teal,
    cloudShade: P.tealDark,
    cloudInk: false,
    star: P.cream,
    stars: 1,
    windowLit: [P.peach, P.cream],
    windowDark: deep.teal78,
    facade: [P.tealDark, P.teal, P.tan],
    silhouette: deep.teal60,
    rim: P.sage,
    ground: P.tealDark,
    hazeMax: 0.72,
  },
  dawn: {
    skyBands: [skies.day, mix(P.sky, P.peach, 0.25), mix(P.peach, P.cream, 0.5)],
    haze: mix(P.sky, P.cream, 0.45),
    horizonGlow: P.cream,
    glow: P.cream,
    sunColor: P.sun,
    cloud: P.cream,
    cloudShade: P.sand,
    cloudInk: true,
    star: P.cream,
    stars: 0.15,
    windowLit: [P.cream, P.peach],
    windowDark: P.teal,
    facade: [P.sand, P.tan, P.cream, P.teal],
    silhouette: P.teal,
    rim: P.cream,
    ground: P.sand,
    hazeMax: 0.75,
  },
};

export const TOD: Record<TodLike, TodPalette> = Object.fromEntries(TODS.map((n) => [n, make(n, OPTS[n])])) as Record<TodLike, TodPalette>;

const ROLE_PAL = new Map<string, TodPalette>();
/** TOD[name] with its base keys stepped by a relight `role` row (core <Tod role="far">). */
export function todPalRole(name: TodLike, role: TodRole = 'base'): TodPalette {
  if (role === 'base') return TOD[name];
  const k = `${name}/${role}`;
  let v = ROLE_PAL.get(k);
  if (!v) ROLE_PAL.set(k, (v = make(name, OPTS[name], role)));
  return v;
}

/** The palette a cine piece paints with: its own `tod` prop when given, else the core <Tod> context (time of day AND
 *  relight role), so pieces inside a timed <World> relight with it. A hook: call it in the piece itself (below the
 *  World / <Tod>); outside any <Tod> the context is 'day'. */
export function useTodPal(tod?: TodLike | TodPalette): TodPalette {
  const v = useTodValue();
  return tod !== undefined ? todPal(tod) : todPalRole(v.tod, v.role);
}

export const todPal = (tod: TodLike | TodPalette): TodPalette => (typeof tod === 'string' ? TOD[tod] : tod);

/** The paint `color` under this time of day's light (no depth tint): a palette STEP for the light fields (the shared
 *  todSteps table via core relight(); `role` picks its far / cloud / framing row, default the palette's own role),
 *  every other paint unchanged. Never a mix. */
export function ambient(color: string, tod: TodLike | TodPalette, role?: TodRole): string {
  const p = todPal(tod);
  return relight(color, p.name, role ?? p.role);
}

export type AtmosOpts = {
  /** Number of flat steps between depth 0 and 1. Default 4. */
  steps?: number;
  /** Haze mix at depth 1. Default palette.hazeMax. */
  max?: number;
  /** >1 keeps mid layers clearer. Default 1.35. */
  gamma?: number;
  /** Skip the ambient shift (colour is already a tod colour). */
  raw?: boolean;
  /** Depths below this keep their paint exactly (only FAR layers take haze steps). Default 0.3. */
  clear?: number;
};

/** Which flat haze step a depth falls into, as a 0..1 value (stepped). */
export const tone = (depth: number, steps = 4) => Math.round(Math.max(0, Math.min(1, depth)) * steps) / steps;

/** Relative luminance (WCAG) of a hex colour. */
function lumOf(hex: string): number {
  const c = hexToRgb(hex).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/** Paints at least this light take the LIGHT step of a ladder band (sage and lighter); darker ones the next step. */
const LADDER_LIGHT = 0.22;

/** Depth-tinted flat colour: ambient-shifted paint pulled toward the sky haze in a few STEPS (far = flatter,
 *  closer to the sky). depth 0 = near, 1 = horizon. At dusk / night (palettes with a `ladder`) far rows take flat
 *  palette steps of the ladder instead (silhouettes one step off the sky; no mixes), and `raw` colours (lights, rims,
 *  top faces: already tod colours) keep their paint, taking the shared FAR relight step only past depth 0.75. */
export function atmos(color: string, depth: number, tod: TodLike | TodPalette, o: AtmosOpts = {}): string {
  const p = todPal(tod);
  if (p.ladder) {
    if (o.raw) return depth >= 0.75 ? relight(color, p.name, 'far') : color;
    if (depth < (o.clear ?? 0.3)) return ambient(color, p);
    const band = depth >= 0.75 ? 0 : depth >= 0.5 ? 1 : 2;
    const L = p.ladder;
    return L[Math.min(L.length - 1, band + (lumOf(ambient(color, p)) >= LADDER_LIGHT ? 0 : 1))];
  }
  const q = depth < (o.clear ?? 0.3) ? 0 : tone(depth, o.steps ?? 4);
  const amt = (o.max ?? p.hazeMax) * Math.pow(q, o.gamma ?? 1.35);
  return mix(o.raw ? color : ambient(color, p), p.haze, amt);
}

/** Ink weight for a depth (style bible ladder: 4.8 front, 3.4 mid, 2.2 far, 1.6 hair; none past `none`). */
export function inkForDepth(depth: number, none = 0.72): number {
  if (depth >= none) return 0;
  if (depth <= 0) return 4.8;
  if (depth < 0.25) return 3.4;
  if (depth < 0.5) return 2.2;
  return 1.6;
}
