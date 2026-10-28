// lib/depth.ts: DEPTH AND SEPARATION in flat colour, an ENGINE primitive (owner, v2 G4, 2026-10-27: "the foreground and
// the main focus still blurs with the background ... no distance effect nor perspective ... the bottom part ... little
// to no perspective or depth"; the playbook's DEPTH AND SEPARATION, DIRECTION rule 2). The numbers are
// docs/look/CRAFT.md §f (it wins over this file); the how-to and the numbers it implements: lib/DEPTH.md; the pixel
// check: scripts/qa/check_depth.py. Opt-in and pure (no React, no frame state, no clock): nothing here runs unless a
// scene calls it, so a film that does not import it renders exactly as before.
//
// Two axes, and both apply to everything: the TIER (story role, lib/tier.tsx) sets the weight (outline, contrast inside
// its plane, motion); the PLANE (distance) sets the colour, the size, the texture scale and how simple a thing is.
// Plane 0 = the subject's plane; -1, -2 the foreground; +1 ... +4 farther. Everything stays FLAT: one fixed colour step
// per plane (never a gradient, a blur or a fog), a ground drawn from ONE camera (it recedes), and a calm field behind
// every subject's edge.
//
//   const ATM = makeAtmosphere({name: 'canal', air: CM.bandGold});   // the air = the sky's lowest step behind the planes
//   recede(CM.brick, 3, ATM)               // a far brick, converging on the gold air (never grey, never olive) -> #DCA38A
//   const FAR = recedeAll({brick: CM.brick, stucco: CM.stucco}, 3, ATM)  // a whole plane's palette at once
//   planeLod(3)                            // {values: 3, hairlines: false, minFeature: 8, windows: 'tone', ...}
//   toneOnTone(FAR.brick)                  // a far window: the wall's own colour one soft step, never a dark speck
//   backing(CM.stucco, CM.bandGold)        // the calm field behind a lit edge: the band moved >= 15 L* darker, hue kept
//   const cam = groundCam({horizon: 965, f: 1400, height: 1.3});      // ONE camera per shot (v2 S1's lens)
//   receding(cam, [-2, 0, 2], 3, 30)       // joints that run INTO the picture: they converge on cam.vp
//   flight(cam, {x0: -6, x1: 6, z0: 2.2, tread: 0.42, rise: 0.16, n: 5})  // steps down to the water, foreshortened
//   <Plane quad={quadForPlane(cam, -6, 6, 3, 14)} w={1200} h={1100}> ...dressing laid out flat... </Plane>

import {fromLch, lab, lch} from './light';
import type {Quad} from './persp';
import {isClean, PEN, type Tier} from './pen';
import {rng} from './rng';
import type {Pt} from './sketch';

// ================================================================= small numbers and colour

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** True for '#rgb' / '#rrggbb' (anything else, 'none', 'url(...)', passes through every operator unchanged). */
export const isHex = (c: unknown): c is string => typeof c === 'string' && HEX.test(c);
/** Signed shortest hue turn a -> b (degrees, -180..180). */
const hueTurnTo = (a: number, b: number) => ((b - a + 540) % 360) - 180;

/** CIE ΔE76 between two hex colours (the measure CRAFT §f and check_depth.py use). */
export function dE76(a: string, b: string): number {
  const p = lab(a);
  const q = lab(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

const CACHE = new Map<string, string>();
const cached = (key: string, make: () => string): string => {
  let v = CACHE.get(key);
  if (v === undefined) {
    v = make();
    if (CACHE.size > 8000) CACHE.clear();
    CACHE.set(key, v);
  }
  return v;
};

// ================================================================= the atmospheric step (CRAFT §f.2)

export type AtmosOpts = {
  /** A colour across from the air: its chroma drop at k = 1, C* x (1 - chroma x k). Default 0.8 (k 0.40 keeps 0.68). */
  chroma?: number;
  /** A colour across from the air: degrees its hue turns toward the air's at k = 1 (default 0: kept; at most 30). A
   *  straight mix between a warm colour and an air of the other temperature crosses grey (brick toward a mint sky
   *  turns tan, then olive-grey: research/2026-10-27_effects_libraries.md §4). */
  hueTurn?: number;
  /** A far colour never drops under this C* (never grey), unless it was already greyer. Default 8. */
  chromaFloor?: number;
};

/** CIELCh hues of the olive-khaki band a mix must not enter (a low-chroma yellow-green reads sick at our levels). */
const OLIVE: [number, number] = [88, 118];

/** The atmospheric step in flat colour (Koschmieder's airlight: the colour converges on the AIR behind it), one fixed
 *  step per plane (never a gradient); k = 0 returns the colour. L* moves toward the air's L* by k (a light colour can
 *  darken: "toward the haze's value", not "lighter"). The colour itself:
 *  - a hue on the AIR'S SIDE (within 90 deg of it, or nearly grey): the straight mix of a*, b* toward the air's, so its
 *    hue and chroma converge on the air (a far brick under a gold band turns a little gold; a cream gains the band's
 *    warmth); never under C* 8 unless both already were;
 *  - a hue ACROSS from the air (a warm colour under a cool air, a cool one under a warm air): the straight mix would
 *    cross grey (brick toward a mint sky turns tan, then olive-grey: research/2026-10-27_effects_libraries.md §4), so
 *    the hue is KEPT (or turned by `hueTurn` x k, at most 30) and the chroma eases x (1 - 0.8 k), never under C* 8:
 *    warm near, dusty-cool far, never grey.
 *  Gamut-fit by keeping L* and hue and lowering chroma. */
export function atmos(color: string, k: number, air: string, o: AtmosOpts = {}): string {
  if (!isHex(color) || !isHex(air) || !(k > 0)) return color;
  const kk = Math.min(1, k);
  const chroma = o.chroma ?? 0.8;
  const turnMax = clamp(o.hueTurn ?? 0, 0, 30);
  const floor0 = o.chromaFloor ?? 8;
  return cached(`a${color}|${kk.toFixed(4)}|${air}|${chroma}|${turnMax}|${floor0}`, () => {
    const c = lch(color);
    const a = lch(air);
    const L = c.L + (a.L - c.L) * kk;
    const d = hueTurnTo(c.h, a.h);
    if (Math.abs(d) <= 90 || c.C < 4) {
      const p = lab(color);
      const q = lab(air);
      const A = p[1] + (q[1] - p[1]) * kk;
      const B = p[2] + (q[2] - p[2]) * kk;
      const floor = Math.min(c.C, a.C, floor0);
      const C = Math.max(floor, Math.hypot(A, B));
      let h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
      // never INTO the olive-khaki band from outside it (a sage under a gold air, a yellow under a mint one): the hue
      // stops at the band's edge on its own side ("never beige, muddy tan, olive or grey": DIRECTION rule 6)
      if (C < 30 && h > OLIVE[0] && h < OLIVE[1] && !(c.h > OLIVE[0] && c.h < OLIVE[1])) h = c.h >= OLIVE[1] && c.h < 300 ? OLIVE[1] : OLIVE[0];
      return fromLch(L, C, h);
    }
    const C = Math.max(Math.min(c.C, floor0), c.C * (1 - chroma * kk));
    const h = c.h + Math.sign(d) * Math.min(Math.abs(d), turnMax * kk);
    return fromLch(L, C, (h + 360) % 360);
  });
}

/** The flat step toward the air per plane, for planes 0 ... +4 (CINEMATIC_GUIDE "Scale cues" 5, measured on Arcane: about
 *  Koschmieder's law with each plane twice as far). */
export const PLANE_STEPS = [0, 0.12, 0.22, 0.4, 0.65] as const;
/** The foreground's value steps, planes -1 ... -4: L* darker than the subject's plane, cumulative (COZY_AND_SCALE §4). */
export const NEAR_STEPS = [5, 10, 13, 14] as const;

export type Atmosphere = {
  name: string;
  /** The air behind plane p: the lowest sky step right behind it (one continuous sky, DIRECTION rule 6; v2 S1: the gold
   *  band, never the mint caption sky above it). */
  air: (plane: number) => string;
  /** k per plane, index = plane (0 ... +4); fractional planes interpolate, farther ones take the last. */
  steps: readonly number[];
  /** Foreground value steps (L* darker), index 0 = plane -1. */
  near: readonly number[];
  opts: Required<AtmosOpts>;
};

/** ONE atmosphere per set (written in the W1 world bible with the set's light rig). `air`: one colour (the same air
 *  behind every plane) or a list indexed by plane (air[2] = behind plane +2; missing planes take the nearest one
 *  before them). Take it from the SKY, never a hand-picked haze: the sky's lowest step behind each plane. */
export function makeAtmosphere(o: {name: string; air: string | readonly string[]; steps?: readonly number[]; near?: readonly number[]} & AtmosOpts): Atmosphere {
  const airs = typeof o.air === 'string' ? [o.air] : o.air;
  if (!airs.length || !airs.every(isHex)) throw new Error(`makeAtmosphere(${o.name}): air must be hex colour(s)`);
  const air = (plane: number) => airs[clamp(Math.ceil(plane), 0, airs.length - 1)] ?? airs[airs.length - 1];
  return {
    name: o.name,
    air,
    steps: o.steps ?? PLANE_STEPS,
    near: o.near ?? NEAR_STEPS,
    opts: {chroma: o.chroma ?? 0.8, hueTurn: clamp(o.hueTurn ?? 0, 0, 30), chromaFloor: o.chromaFloor ?? 8},
  };
}

/** The sky's lowest step (the air behind the farthest plane) from a list of sky colours, top -> horizon. A film drawn
 *  with lib/sky's ONE continuous sky takes its air from `horizonColor(spec, x)` instead (CRAFT §g.3: the sky's lowest
 *  colour, warmed under the sun; v2 S1: skies.ts `S1_AIR`), and a per-plane air from `skyColorAt(spec, y, x)`. */
export const hazeFromSky = (skyTopToHorizon: readonly string[]): string => skyTopToHorizon[skyTopToHorizon.length - 1];

/** k of plane p (0 for the subject's plane and nearer). The SUBJECT (tier A) takes at most half its plane's step: it
 *  may read one plane nearer and keeps its separation (Arcane's landmark: the darkest far shape on the palest cloud). */
export function planeK(atm: Atmosphere, plane: number, tier?: Tier): number {
  if (!(plane > 0)) return 0;
  const s = atm.steps;
  const i = Math.floor(plane);
  const k = i >= s.length - 1 ? s[s.length - 1] : s[i] + (s[i + 1] - s[i]) * (plane - i);
  return tier === 'subject' ? k * 0.5 : k;
}

/** A foreground colour (plane -1, -2 ...): darker by the near steps (5 / 10 / 13 / 14 L*, cumulative), hue kept, chroma
 *  kept: it reads near by size, overlap and value, never by air. Fractional planes interpolate. */
export function nearStep(color: string, plane: number, atm?: Atmosphere): string {
  if (!isHex(color) || !(plane < 0)) return color;
  const steps = [0, ...(atm?.near ?? NEAR_STEPS)];
  const p = Math.min(-plane, steps.length - 1);
  const i = Math.floor(p);
  const dL = i >= steps.length - 1 ? steps[steps.length - 1] : steps[i] + (steps[i + 1] - steps[i]) * (p - i);
  return cached(`n${color}|${dL.toFixed(3)}`, () => {
    const c = lch(color);
    return fromLch(Math.max(0, c.L - dL), c.C, c.h);
  });
}

/** A colour on plane `plane` (CRAFT §f.2): the subject's plane unchanged; each farther plane ONE fixed flat step toward
 *  its air (`atmos`: never grey, never olive); a nearer plane a value step darker. `tier: 'subject'` takes half the step (`planeK`). Every
 *  fill of the plane takes it, windows and small parts included (their colours: `toneOnTone`). */
export function recede(color: string, plane: number, atm: Atmosphere, o: {tier?: Tier} = {}): string {
  if (!isHex(color)) return color;
  if (plane < 0) return nearStep(color, plane, atm);
  const k = planeK(atm, plane, o.tier);
  return k > 0 ? atmos(color, k, atm.air(plane), atm.opts) : color;
}

/** `recede` over a palette object (strings and string arrays; anything else passes through): `recedeAll(CM, 3, ATM).brick`. */
export function recedeAll<T extends Record<string, unknown>>(colors: T, plane: number, atm: Atmosphere, o: {tier?: Tier} = {}): T {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(colors)) {
    if (isHex(v)) out[key] = recede(v, plane, atm, o);
    else if (Array.isArray(v)) out[key] = v.map((x) => (isHex(x) ? recede(x, plane, atm, o) : x));
    else out[key] = v;
  }
  return out as T;
}

// ================================================================= simpler with distance (CRAFT §f.2, Scale cues 2 and 5)

export type PlaneLod = {
  plane: number;
  /** Most distinct values (flat fills) the plane holds: 5 / 5 / 4 / 3 / 2 for planes 0 ... +4. */
  values: number;
  /** Things that ARE lines (wires, rails, a bird's V) may draw as tier C hairlines here; none past plane +2. */
  hairlines: boolean;
  /** The smallest part drawn (px at 1080); smaller parts merge into their mass. */
  minFeature: number;
  /** Windows and small parts: 'lit' (their own colours), 'tone' (the wall's own colour one soft step: toneOnTone), 'none'. */
  windows: 'lit' | 'tone' | 'none';
  /** The widest ΔE76 between two values on the plane (planePalette pulls them together): the far planes become calm
   *  bands whose parts no longer read as edges (v1's far city: 1-4 values, L* range 6-15). */
  spread: number;
  /** Size of a repeated thing (a building, a window period, a texture) against the subject's plane: ratio^-plane
   *  (2.2-3x smaller per plane on a vista; ratio 2.5). A ground drawn from groundCam gives true sizes instead. */
  scale: number;
};

const LOD: Omit<PlaneLod, 'plane' | 'scale'>[] = [
  {values: 5, hairlines: true, minFeature: 0, windows: 'lit', spread: 100},
  {values: 5, hairlines: true, minFeature: 3, windows: 'lit', spread: 100},
  {values: 4, hairlines: true, minFeature: 4, windows: 'tone', spread: 24},
  {values: 3, hairlines: false, minFeature: 8, windows: 'tone', spread: 12},
  {values: 2, hairlines: false, minFeature: 12, windows: 'none', spread: 5},
];

/** What a plane may draw (planes nearer than the subject draw like the subject's plane). */
export function planeLod(plane: number, ratio = 2.5): PlaneLod {
  const i = clamp(Math.round(plane), 0, LOD.length - 1);
  return {plane, ...LOD[i], scale: Math.pow(ratio, -plane)};
}

/** Draw a part this big (px at 1080) on this plane? */
export const keepDetail = (sizePx: number, plane: number) => sizePx >= planeLod(plane).minFeature;

/** A plane's palette, simpler with distance: every source colour receded to the plane (`recede`), merged into at most
 *  `planeLod(plane).values` values (5 / 5 / 4 / 3 / 2: the receded colours sorted by L* fall into that many groups of
 *  neighbours, each group takes its mean), and those values pulled toward the plane's mean until no two are more than
 *  `planeLod(plane).spread` ΔE76 apart (+3: 12, +4: 5). Returns source -> the colour to draw. A far row of four
 *  materials shows two close values: a calm band, never the busiest region of the frame. */
export function planePalette(colors: string[], plane: number, atm: Atmosphere, o: {tier?: Tier; values?: number; spread?: number} = {}): Record<string, string> {
  const src = Array.from(new Set(colors.filter(isHex)));
  const rec = src.map((c) => ({c, v: lab(recede(c, plane, atm, o))}));
  rec.sort((a, b) => a.v[0] - b.v[0]);
  const n = Math.max(1, Math.min(o.values ?? planeLod(plane).values, rec.length));
  const groups: {cs: string[]; m: number[]}[] = [];
  for (let g = 0; g < n; g++) {
    const grp = rec.slice(Math.floor((g * rec.length) / n), Math.floor(((g + 1) * rec.length) / n));
    if (grp.length) groups.push({cs: grp.map((x) => x.c), m: [0, 1, 2].map((i) => grp.reduce((s, x) => s + x.v[i], 0) / grp.length)});
  }
  const mean = [0, 1, 2].map((i) => groups.reduce((s, g) => s + g.m[i] * g.cs.length, 0) / Math.max(1, rec.length));
  let widest = 0;
  for (const a of groups) for (const b of groups) widest = Math.max(widest, Math.hypot(a.m[0] - b.m[0], a.m[1] - b.m[1], a.m[2] - b.m[2]));
  const cap = o.spread ?? planeLod(plane).spread;
  const k = widest > cap ? cap / widest : 1;
  const out: Record<string, string> = {};
  for (const g of groups) {
    const v = [0, 1, 2].map((i) => mean[i] + (g.m[i] - mean[i]) * k);
    const hex = fromLch(v[0], Math.hypot(v[1], v[2]), ((Math.atan2(v[2], v[1]) * 180) / Math.PI + 360) % 360);
    for (const c of g.cs) out[c] = hex;
  }
  return out;
}

/** A small part on a plane that draws no detail colours (a far window, a far door): the wall's own colour one soft step
 *  (ΔE76 = `dE`, default 4, at most 6; lighter for a lit window, darker otherwise), hue and chroma kept: never a dark
 *  speck, never the lamp colour (CRAFT §f.2: one story window may be one soft step lighter). */
export function toneOnTone(wall: string, o: {lit?: boolean; dE?: number} = {}): string {
  if (!isHex(wall)) return wall;
  const d = clamp(o.dE ?? 4, 1, 6);
  return cached(`t${wall}|${d}|${o.lit ? 1 : 0}`, () => {
    const c = lch(wall);
    const up = !!o.lit;
    const L = up ? (c.L + d > 99 ? c.L - d : c.L + d) : c.L - d < 2 ? c.L + d : c.L - d;
    return fromLch(L, c.C, c.h);
  });
}

/** A seam or joint's tone on a stone or a plank (CRAFT §c: long bands at dL* 6-8): `dL` darker, hue kept. A receding
 *  joint counts as visible perspective at |dL*| >= 6 (CRAFT §f.4); 3.6 read as nothing at phone size (v2's G4 clip). */
export function seamTone(color: string, dL = 7): string {
  if (!isHex(color)) return color;
  return cached(`s${color}|${dL}`, () => {
    const c = lch(color);
    return fromLch(clamp(c.L - dL, 0, 100), c.C * 1.05, c.h);
  });
}

// ================================================================= separation (CRAFT §f.3)

/** Median |ΔL*| targets along a silhouette: a tier-A subject >= 15 (references 15-38), a big mass of the subject's plane
 *  against the plane behind it >= 12. */
export const SEPARATION = {subject: 15, mass: 12} as const;

/** How an edge colour parts from the field right behind it: signed dL* (edge - field), ΔE76, and whether it meets `min`. */
export function separationOf(edge: string, field: string, min: number = SEPARATION.subject): {dL: number; dE: number; ok: boolean} {
  const dL = lab(edge)[0] - lab(field)[0];
  return {dL, dE: dE76(edge, field), ok: Math.abs(dL) >= min};
}

/** The calm field behind a subject's edge (CRAFT §f.3, the value sandwich): the FIELD's own colour moved in L* until it
 *  parts from the edge by `min` (default 15), its hue kept and its chroma never raised. A LIT edge (lighter than the
 *  field) gets a darker field, a shaded edge a lighter one (counterchange); `dir` forces the side. Returns the field
 *  unchanged when it already parts. Use it for the strip of the plane behind the silhouette (a far row rising behind a
 *  lit corner, a darker band of a bridge behind light figures), as a flat shape: never a halo, a glow or an outline.
 *  Under the clean pen a calmer tier pulls a fill's value toward the background (lib/pen CLEAN_TIERS: environment 16 %),
 *  which eats part of the step: pass the EDGE as it shows (`tierFill(edge, itsTier)` when it is calmed too) and `tier`,
 *  the tier the field is drawn in, and the field comes back pre-compensated so the step SHOWN still meets `min`. */
export function backing(edge: string, field: string, o: {min?: number; dir?: 'auto' | 'darker' | 'lighter'; tier?: Tier; bg?: string} = {}): string {
  if (!isHex(edge) || !isHex(field)) return field;
  const min = o.min ?? SEPARATION.subject;
  const pull = o.tier && isClean() ? PEN.tiers[o.tier].pull : 0;
  const bg = o.bg ?? PEN.bg;
  return cached(`b${edge}|${field}|${min}|${o.dir ?? 'auto'}|${pull}|${bg}`, () => {
    const e = lch(edge);
    const f = lch(field);
    const bgL = pull > 0 && isHex(bg) ? lab(bg)[0] : 0;
    const shown = (L: number) => L + (bgL - L) * pull;
    const dL = e.L - shown(f.L);
    if (Math.abs(dL) >= min) return field;
    let dir = o.dir ?? 'auto';
    if (dir === 'auto') dir = dL >= 0 ? 'darker' : 'lighter';
    const m = min + 0.5; // the 8-bit hex rounds L* by up to ~0.4
    let Ls = dir === 'darker' ? e.L - m : e.L + m;
    if (Ls < 4 || Ls > 98) Ls = dir === 'darker' ? e.L + m : e.L - m; // no room on that side: the other
    // the value to author so that the pen SHOWS Ls
    const L = clamp(pull > 0 ? (clamp(Ls, 4, 98) - bgL * pull) / (1 - pull) : Ls, 2, 99);
    const C = f.C * (0.8 + 0.2 * Math.min(1, L / Math.max(1, f.L)));
    return fromLch(L, C, f.h);
  });
}

// ================================================================= ONE camera over the ground (CRAFT §f.4, §f.5)

export type GroundCam = {
  horizon: number;
  vpx: number;
  /** Focal length, px. */
  f: number;
  /** Camera height above level 0, metres. */
  height: number;
  /** The camera's turn to the right, degrees (0 = one-point; 15-30 = two-point: the risers converge too). */
  yaw: number;
  /** World point (x metres right of the axis, z metres ahead, `level` metres up) -> screen px. */
  pt: (x: number, z: number, level?: number) => Pt;
  /** Screen y of a ground line at depth z on `level` (along the axis). */
  y: (z: number, level?: number) => number;
  /** Depth (m) of the ground line at screen y on `level` (along the axis): the inverse of `y`. */
  z: (y: number, level?: number) => number;
  /** px per metre of anything at depth z: sizes fall as 1/z. */
  scale: (z: number) => number;
  /** px per metre of a thing whose BASE stands at screen y on `level`: (y - horizon) / (height - level). One camera
   *  keeps it consistent for everything in the shot (the analyst's k); a nearer thing is never smaller per metre. */
  pxPerM: (y: number, level?: number) => number;
  /** The vanishing point of every line running into the picture (world z). */
  vp: Pt;
  /** Under a yaw, the vanishing point of the lines across (world x); null in one-point. */
  vpX: Pt | null;
};

/** ONE camera per shot, shared by every ground, wall, figure and particle in it (CRAFT §f.5): a pinhole at `height`
 *  metres over level 0, looking level (the horizon is its eye line), `f` px focal length, turned `yaw` degrees right.
 *  v2 S1's lens is groundCam({horizon: 965, f: 1400, height: 1.3}) (its 100 px/m at the towpath, y 1095). */
export function groundCam(o: {horizon: number; vpx?: number; f?: number; height: number; yaw?: number; near?: number}): GroundCam {
  const horizon = o.horizon;
  const vpx = o.vpx ?? 540;
  const f = o.f ?? 1400;
  const height = o.height;
  const yaw = o.yaw ?? 0;
  const near = o.near ?? 0.05;
  const th = (yaw * Math.PI) / 180;
  const cs = Math.cos(th);
  const sn = Math.sin(th);
  const pt = (x: number, z: number, level = 0): Pt => {
    const xc = x * cs - z * sn;
    const zc = Math.max(near, x * sn + z * cs);
    return [vpx + (f * xc) / zc, horizon + (f * (height - level)) / zc];
  };
  return {
    horizon,
    vpx,
    f,
    height,
    yaw,
    pt,
    y: (z, level = 0) => horizon + (f * (height - level)) / Math.max(near, z),
    z: (y, level = 0) => (f * (height - level)) / Math.max(1e-6, y - horizon),
    scale: (z) => f / Math.max(near, z),
    pxPerM: (y, level = 0) => (y - horizon) / Math.max(1e-6, height - level),
    vp: [vpx - f * Math.tan(th), horizon],
    vpX: Math.abs(sn) > 1e-6 ? [vpx + f / Math.tan(th), horizon] : null,
  };
}

/** A camera from a scale sheet: the horizon, and px per metre at one ground line y that lies `z` metres ahead. */
export function camFromSheet(o: {horizon: number; vpx?: number; y: number; pxPerM: number; z: number; yaw?: number}): GroundCam {
  const height = (o.y - o.horizon) / o.pxPerM;
  return groundCam({horizon: o.horizon, vpx: o.vpx, f: o.pxPerM * o.z, height, yaw: o.yaw});
}

export type Seg = [Pt, Pt];

/** n + 1 depths equally spaced between z0 (near) and z1 (far): rows, joints, treads, bollards at an even world spacing. */
export const rowsZ = (z0: number, z1: number, n: number): number[] => Array.from({length: n + 1}, (_, i) => z0 + ((z1 - z0) * i) / Math.max(1, n));

/** The camera-free construction: n + 1 screen ys from a near ground line to a far one (both under the horizon) for EQUAL
 *  steps in world depth. The spacing grows toward the viewer (a tread's screen depth falls about as 1/z^2). */
export function rowYs(horizon: number, yNear: number, yFar: number, n: number): number[] {
  // depth z ~ 1 / (y - horizon): equal steps in z between the two lines, back to screen y
  const a = 1 / Math.max(1e-6, yNear - horizon);
  const b = 1 / Math.max(1e-6, yFar - horizon);
  return Array.from({length: n + 1}, (_, i) => horizon + 1 / (a + ((b - a) * i) / Math.max(1, n)));
}

/** Lines running INTO the picture (paving joints, kerbs, a quay edge, rails, stair cheeks): at each world x, from depth
 *  z0 to z1 on `level`. They converge on cam.vp: the lines that make a ground recede (CRAFT §f.4: >= 20 % of the
 *  ground's visible line length). */
export const receding = (cam: GroundCam, xs: number[], z0: number, z1: number, level = 0): Seg[] => xs.map((x) => [cam.pt(x, z0, level), cam.pt(x, z1, level)] as Seg);

/** Level lines ACROSS the picture (cross joints, nosings, a coping) at each depth, from x0 to x1. */
export const crossing = (cam: GroundCam, zs: number[], x0: number, x1: number, level = 0): Seg[] => zs.map((z) => [cam.pt(x0, z, level), cam.pt(x1, z, level)] as Seg);

/** A ground rectangle x0..x1 by z0..z1 on `level`: near-left, near-right, far-right, far-left. */
export const groundPoly = (cam: GroundCam, x0: number, x1: number, z0: number, z1: number, level = 0): Pt[] => [cam.pt(x0, z0, level), cam.pt(x1, z0, level), cam.pt(x1, z1, level), cam.pt(x0, z1, level)];

/** A frontal vertical face at depth z (a riser, a quay wall, a step front): x0..x1 by level0..level1. */
export const frontFace = (cam: GroundCam, x0: number, x1: number, z: number, level0: number, level1: number): Pt[] => [cam.pt(x0, z, level0), cam.pt(x1, z, level0), cam.pt(x1, z, level1), cam.pt(x0, z, level1)];

/** A vertical face running into the picture at x (a stair cheek, a wall end, a kerb's side): z0..z1 by level0..level1. */
export const sideFace = (cam: GroundCam, x: number, z0: number, z1: number, level0: number, level1: number): Pt[] => [cam.pt(x, z0, level0), cam.pt(x, z1, level0), cam.pt(x, z1, level1), cam.pt(x, z0, level1)];

/** A joint or seam as a FLAT TONE BAND of world width `w` (metres) from ground point a to b ([x, z]): it narrows with
 *  distance by itself (a texture gradient), so a near joint is a band (>= 3 px reads at phone size) and a far one a
 *  hairline. Colour it with seamTone (|dL*| >= 6). */
export function band(cam: GroundCam, a: [number, number], b: [number, number], w: number, level = 0): Pt[] {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l = Math.hypot(dx, dz) || 1;
  const nx = (-dz / l) * (w / 2);
  const nz = (dx / l) * (w / 2);
  return [cam.pt(a[0] + nx, a[1] + nz, level), cam.pt(b[0] + nx, b[1] + nz, level), cam.pt(b[0] - nx, b[1] - nz, level), cam.pt(a[0] - nx, a[1] - nz, level)];
}

export type Step = {
  /** The tread (near-left, near-right, far-right, far-left). */
  tread: Pt[];
  /** The riser face toward the camera (an 'up' flight: at the tread's near edge, from the level below), or null when
   *  it faces away (a 'down' flight shows nosings only). */
  riser: Pt[] | null;
  /** The tread's near depth and its level. */
  z: number;
  level: number;
};

export type FlightOpts = {x0: number; x1: number; z0: number; tread: number; rise: number; n: number; level0?: number; dir?: 'down' | 'up'};

/** A flight of n steps (tread depth `tread`, rise `rise`, metres) from x0 to x1, the first tread at depth z0 on level0,
 *  going 'down' (away from the camera, toward lower levels: steps to the water; risers face away, so each nosing hides
 *  the near part of the tread below it) or 'up' (each riser faces us, the first one rising from level0 - rise). FAR
 *  FIRST, the order to draw them in (a nearer step covers what it hides); foreshortened by the camera, so the treads
 *  compress toward the horizon. */
export function flight(cam: GroundCam, o: FlightOpts): Step[] {
  const out: Step[] = [];
  const sgn = (o.dir ?? 'down') === 'down' ? -1 : 1;
  const l0 = o.level0 ?? 0;
  for (let i = o.n - 1; i >= 0; i--) {
    const z = o.z0 + i * o.tread;
    const level = l0 + sgn * i * o.rise;
    const tread = groundPoly(cam, o.x0, o.x1, z, z + o.tread, level);
    const riser = sgn > 0 ? frontFace(cam, o.x0, o.x1, z, level - o.rise, level) : null;
    out.push({tread, riser, z, level});
  }
  return out;
}

/** The side of a flight at x (its cheek: the stepped profile seen from the side, down to `base`), one closed polygon:
 *  a vertical face running into the picture, so its edges converge on the VP. Draw it on the side that faces the camera
 *  (x0 when the camera is right of the flight, x1 when it is left). */
export function flightCheek(cam: GroundCam, o: FlightOpts, x: number, base?: number): Pt[] {
  const sgn = (o.dir ?? 'down') === 'down' ? -1 : 1;
  const l0 = o.level0 ?? 0;
  const lastL = l0 + sgn * (o.n - 1) * o.rise;
  const b = base ?? Math.min(l0 - (sgn > 0 ? o.rise : 0), lastL) - 0.001;
  const pts: Pt[] = [cam.pt(x, o.z0, b)];
  for (let i = 0; i < o.n; i++) {
    const z = o.z0 + i * o.tread;
    const level = l0 + sgn * i * o.rise;
    pts.push(cam.pt(x, z, level), cam.pt(x, z + o.tread, level));
  }
  pts.push(cam.pt(x, o.z0 + o.n * o.tread, b));
  return pts;
}

/** The lib/persp.tsx Quad (TL, TR, BR, BL) of a ground rectangle, for <Plane quad={...} w h>: lay the dressing out flat in
 *  the plane's own px (local x left -> right, local y FAR (0) -> NEAR (h)), and the homography gives the convergence,
 *  the foreshortening and the size and texture gradients. */
export const quadForPlane = (cam: GroundCam, x0: number, x1: number, z0: number, z1: number, level = 0): Quad => [cam.pt(x0, z1, level), cam.pt(x1, z1, level), cam.pt(x1, z0, level), cam.pt(x0, z0, level)];

/** Points of a polyline in plane coordinates, projected (a curb's curve, a puddle's outline, a coil of rope). */
export const projectPts = (cam: GroundCam, pts: [number, number][], level = 0): Pt[] => pts.map(([x, z]) => cam.pt(x, z, level));

// ================================================================= natural scatter (Bridson's Poisson disk)

const PD_CACHE = new Map<string, Pt[]>();

/** An even, natural, never-gridded scatter in a w x h rectangle with minimum spacing r (Bridson 2007), deterministic per
 *  seed (lib/rng) and cached (computed once per argument set, never per frame). Lay litter, leaves, pebbles, tufts and
 *  people's spots out in the plane's OWN coordinates (metres, or a <Plane>'s px), then project them: the camera makes
 *  the density and the size gradient. */
export function poissonDisk(o: {w: number; h: number; r: number; seed: string; k?: number; max?: number}): Pt[] {
  const key = `${o.w}|${o.h}|${o.r}|${o.seed}|${o.k ?? 20}|${o.max ?? 4000}`;
  const hit = PD_CACHE.get(key);
  if (hit) return hit;
  const R = rng(`pd/${o.seed}`);
  const cell = o.r / Math.SQRT2;
  const gw = Math.max(1, Math.ceil(o.w / cell));
  const gh = Math.max(1, Math.ceil(o.h / cell));
  const grid = new Int32Array(gw * gh).fill(-1);
  const pts: Pt[] = [];
  const active: number[] = [];
  const put = (p: Pt) => {
    pts.push(p);
    active.push(pts.length - 1);
    grid[Math.min(gh - 1, Math.floor(p[1] / cell)) * gw + Math.min(gw - 1, Math.floor(p[0] / cell))] = pts.length - 1;
  };
  const far = (p: Pt) => {
    const gx = Math.floor(p[0] / cell);
    const gy = Math.floor(p[1] / cell);
    for (let y = Math.max(0, gy - 2); y <= Math.min(gh - 1, gy + 2); y++)
      for (let x = Math.max(0, gx - 2); x <= Math.min(gw - 1, gx + 2); x++) {
        const j = grid[y * gw + x];
        if (j >= 0 && Math.hypot(pts[j][0] - p[0], pts[j][1] - p[1]) < o.r) return false;
      }
    return true;
  };
  put([R.range(0, o.w), R.range(0, o.h)]);
  const k = o.k ?? 20;
  const max = o.max ?? 4000;
  while (active.length && pts.length < max) {
    const ai = Math.floor(R.next() * active.length);
    const p = pts[active[ai]];
    let found = false;
    for (let t = 0; t < k; t++) {
      const a = R.next() * Math.PI * 2;
      const d = o.r * (1 + R.next());
      const q: Pt = [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d];
      if (q[0] < 0 || q[1] < 0 || q[0] >= o.w || q[1] >= o.h || !far(q)) continue;
      put(q);
      found = true;
      break;
    }
    if (!found) active.splice(ai, 1);
  }
  if (PD_CACHE.size > 200) PD_CACHE.clear();
  PD_CACHE.set(key, pts);
  return pts;
}

// ================================================================= the checks a lane can run in code (CRAFT §f)

/** The CRAFT §f targets (warnings with a declared exception, like §b; check_depth.py measures them on pixels). */
export const DEPTH_TARGETS = {
  /** The farthest plane's mean within this ΔE76 of its air (references 5.9-10.4; v2's G4 clip 12.5-18.3). */
  farAirDE: 10,
  /** ΔE to the air falls at least this much per plane going away. */
  ladderDE: 3,
  /** The subject's plane against the plane right behind it, ΔE76 between their means (references 11-22.6; G4 5.7). */
  subjectStepDE: 12,
  /** The farthest plane's darks (L* p5) within this of its air's L* (v1 2-13; G4 24-35). */
  farDarksL: 20,
  /** The farthest plane's L* range (p5-p95) and value count. */
  farRangeL: 15,
  farValues: 4,
  /** The farthest plane's local contrast against the subject plane's (v1 0.14-0.44; G4 0.82-1.09). */
  farContrastK: 0.5,
  /** Separation along a silhouette: median |ΔL*| and the share at the same value (|ΔL*| < 5), longest run (px at 1080). */
  sepSubject: {median: 15, same: 0.2, run: 60},
  sepMass: {median: 12, same: 0.25, run: 100},
  /** A ground the camera looks down on: visible line length level at most, receding to the VP(s) at least. */
  groundLevelMax: 0.65,
  groundRecedeMin: 0.2,
  /** Ground spacing grows toward the viewer at least this much, far edge to near edge. */
  spacingGrowth: 2,
  /** One camera: k (px/m per 100 px under the horizon) within +-15 % on one ground level. */
  cameraTol: 0.15,
} as const;

const meanLab = (colors: string[]): [number, number, number] => {
  const v = colors.filter(isHex).map(lab);
  const n = Math.max(1, v.length);
  return [v.reduce((s, c) => s + c[0], 0) / n, v.reduce((s, c) => s + c[1], 0) / n, v.reduce((s, c) => s + c[2], 0) / n];
};
const dLab = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Palette-level checks of a shot's planes against CRAFT §f.2 (empty = OK): each plane's colours (as built, after
 *  `recede`), plane 0 = the subject's. A quick lane lint before any render; the pixels are check_depth.py's. */
export function depthProblems(atm: Atmosphere, planes: {plane: number; colors: string[]}[]): string[] {
  const out: string[] = [];
  const ps = planes.filter((p) => p.plane >= 0 && p.colors.some(isHex)).sort((a, b) => a.plane - b.plane);
  if (ps.length < 2) return out;
  const rows = ps.map((p) => {
    const m = meanLab(p.colors);
    return {plane: p.plane, m, air: dLab(m, lab(atm.air(p.plane))), colors: p.colors.filter(isHex)};
  });
  // the ladder: from the second plane behind the subject on, each >= 3 closer to its air than the one before it (the
  // first one is the subject step below), as check_depth.py measures it
  for (let i = 1; i < rows.length; i++) {
    if (rows[i - 1].plane > 0 && rows[i].air > rows[i - 1].air - DEPTH_TARGETS.ladderDE)
      out.push(`plane +${rows[i].plane} is ${rows[i].air.toFixed(1)} from its air, not >= ${DEPTH_TARGETS.ladderDE} closer than plane +${rows[i - 1].plane} (${rows[i - 1].air.toFixed(1)}): the ladder must fall toward the air`);
  }
  const far = rows[rows.length - 1];
  const sub0 = rows.find((r) => r.plane === 0);
  if (sub0 && far.plane > 0 && far.air >= sub0.air) out.push(`no air: the farthest plane +${far.plane} is ΔE ${far.air.toFixed(1)} from its air, the subject's plane ${sub0.air.toFixed(1)}: the farthest must be the closest to the air (check_depth's FAIL)`);
  if (Math.round(far.air) > DEPTH_TARGETS.farAirDE) out.push(`farthest plane +${far.plane}: ΔE ${far.air.toFixed(1)} from its air (target <= ${DEPTH_TARGETS.farAirDE})`);
  const sub = rows.find((r) => r.plane === 0);
  const behind = rows.find((r) => r.plane > 0);
  if (sub && behind && dLab(sub.m, behind.m) < DEPTH_TARGETS.subjectStepDE) out.push(`the subject's plane and plane +${behind.plane} are ΔE ${dLab(sub.m, behind.m).toFixed(1)} apart (target >= ${DEPTH_TARGETS.subjectStepDE}): one clear step`);
  const airL = lab(atm.air(far.plane))[0];
  const darkest = Math.min(...far.colors.map((c) => lab(c)[0]));
  if (airL - darkest > DEPTH_TARGETS.farDarksL) out.push(`farthest plane's darkest colour L* ${darkest.toFixed(0)} is ${(airL - darkest).toFixed(0)} under its air (target <= ${DEPTH_TARGETS.farDarksL}): no dark specks far away`);
  for (const r of rows)
    if (r.plane >= 2)
      for (const c of r.colors) {
        const q = lch(c);
        if (q.C < 8 && q.L < 92) out.push(`plane +${r.plane}: ${c} is grey (C* ${q.C.toFixed(1)} < 8): never grey far away`);
      }
  return out;
}

/** Things of known size in one shot (`y` = the screen y of their BASE, `px` their height on screen, `m` their real
 *  height in metres, `level` metres above level 0): the size inversions (a nearer thing drawn SMALLER per metre than a
 *  farther one: the strongest depth warning, CRAFT §f.5) and k's spread on one level (one camera: +-15 %). Nearer =
 *  a lower base on the same level; across levels only with the camera's `height` (metres over level 0): depth ~
 *  (height - level) / (base y - horizon), as in check_depth.py. */
export function sizeProblems(things: {name: string; y: number; px: number; m: number; level?: number}[], o: {horizon: number; height?: number; tol?: number}): string[] {
  const out: string[] = [];
  const rows = things.map((t) => {
    const level = t.level ?? 0;
    return {...t, ppm: t.px / t.m, level, z: o.height !== undefined ? (o.height - level) / Math.max(1e-6, t.y - o.horizon) : null};
  });
  const nearer = (a: (typeof rows)[number], b: (typeof rows)[number]) => (a.level === b.level ? a.y > b.y + 4 : a.z !== null && b.z !== null && a.z < b.z * 0.97);
  for (const a of rows)
    for (const b of rows)
      if (nearer(a, b) && a.ppm < b.ppm * 0.97) out.push(`size inversion: ${a.name} (base y ${a.y.toFixed(0)}, ${a.ppm.toFixed(0)} px/m) is nearer than ${b.name} (base y ${b.y.toFixed(0)}, ${b.ppm.toFixed(0)} px/m) but smaller per metre`);
  const tol = o.tol ?? DEPTH_TARGETS.cameraTol;
  const levels = Array.from(new Set(rows.map((r) => r.level)));
  for (const lv of levels) {
    const ks = rows.filter((r) => r.level === lv && r.y > o.horizon + 1).map((r) => (r.ppm / (r.y - o.horizon)) * 100);
    if (ks.length < 2) continue;
    const lo = Math.min(...ks);
    const hi = Math.max(...ks);
    if (hi / lo > (1 + tol) / (1 - tol)) out.push(`two cameras on level ${lv} m: k ${lo.toFixed(0)}-${hi.toFixed(0)} (px/m per 100 px under the horizon; one camera keeps it within +-${Math.round(tol * 100)} %)`);
  }
  return out;
}

// ================================================================= the parallax float (DIRECTION rule 8, COZY_AND_SCALE 3b.5)

/** How much of a camera float each plane shows (owner, 2026-10-28: "planes move by depth"): the near ground the full
 *  float, the subject's plane ~0.6, the mid distance ~0.35, the far city ~0.15, the farthest ~0.05; the sky and the
 *  caption band never move (pass `PARALLAX_SKY`). Index = plane -2 ... +4 (CRAFT §f.1); fractional planes interpolate,
 *  nearer than -2 take 1, farther than +4 take the last. */
export const PARALLAX_K: Record<number, number> = {[-2]: 1, [-1]: 0.85, 0: 0.6, 1: 0.45, 2: 0.35, 3: 0.15, 4: 0.05};
/** The sky's (and the caption band's) plane: fixed, it never floats. */
export const PARALLAX_SKY = Infinity;

/** The float share of a plane (0 for the sky). */
export function parallaxK(plane: number): number {
  if (!Number.isFinite(plane)) return 0;
  const p = clamp(plane, -2, 4);
  const i = Math.floor(p);
  const a = PARALLAX_K[i];
  const b = PARALLAX_K[Math.min(4, i + 1)];
  return a + (b - a) * (p - i);
}

/** A plane's offset (px) under a camera float (the near ground's offset): float x its share. Deterministic, opt-in: a
 *  scene that never calls it never moves. Use sub-pixel values (no rounding: 3b.5). */
export const parallaxOffset = (float: Pt, plane: number): Pt => {
  const k = parallaxK(plane);
  return [float[0] * k, float[1] * k];
};

/** One leg of a float: from the previous leg's end (or home) at t0 to `to` (near-ground px from home) at t1. */
export type FloatLeg = {t0: number; t1: number; to: Pt};

/** A slow 2D float as STRAIGHT LEGS (3b.5: a steady heading, turning eased, back home): the offset at time t. Each
 *  leg ramps its speed up over the first `ease` share and down over the last (a trapezoid: the peak is
 *  1 / (1 - ease) x the leg's mean speed), so every turn and every rest is smooth. Home [0, 0] before the first leg,
 *  between legs that do not touch, and after the last (put a leg back to [0, 0] before each join and map-critical
 *  frame). `floatProblems` checks the numbers. */
export function floatAt(t: number, legs: readonly FloatLeg[], ease = 0.25): Pt {
  let from: Pt = [0, 0];
  for (const L of legs) {
    if (t < L.t0) return from;
    if (t <= L.t1) {
      const s = clamp((t - L.t0) / Math.max(1e-6, L.t1 - L.t0), 0, 1);
      const a = clamp(ease, 0, 0.5);
      const u = a <= 0 ? s : s < a ? (0.5 * s * s) / (a * (1 - a)) : s > 1 - a ? 1 - (0.5 * (1 - s) * (1 - s)) / (a * (1 - a)) : (s - a / 2) / (1 - a);
      return [from[0] + (L.to[0] - from[0]) * u, from[1] + (L.to[1] - from[1]) * u];
    }
    from = L.to;
  }
  return from;
}

/** The float's lints (3b.5): the net offset within `maxOffset` of home (default 12), the peak path speed <= `maxSpeed`
 *  px/s (default 10; 3b.5 allows 25 at the peak, the owner's cozy holds ~10), home at every `rest` time. */
export function floatProblems(legs: readonly FloatLeg[], o: {rest?: number[]; maxOffset?: number; maxSpeed?: number; ease?: number; fps?: number} = {}): string[] {
  const out: string[] = [];
  const maxO = o.maxOffset ?? 12;
  const maxV = o.maxSpeed ?? 10;
  const fps = o.fps ?? 60;
  const ease = o.ease ?? 0.25;
  if (!legs.length) return out;
  const t0 = legs[0].t0;
  const t1 = legs[legs.length - 1].t1;
  let prev = floatAt(t0, legs, ease);
  let peak = 0;
  let far = 0;
  for (let f = Math.floor(t0 * fps); f <= Math.ceil(t1 * fps); f++) {
    const p = floatAt(f / fps, legs, ease);
    peak = Math.max(peak, Math.hypot(p[0] - prev[0], p[1] - prev[1]) * fps);
    far = Math.max(far, Math.hypot(p[0], p[1]));
    prev = p;
  }
  if (far > maxO + 1e-6) out.push(`float: net offset ${far.toFixed(1)} px > ${maxO}`);
  if (peak > maxV + 0.05) out.push(`float: peak speed ${peak.toFixed(1)} px/s > ${maxV}`);
  for (const r of o.rest ?? []) {
    const p = floatAt(r, legs, ease);
    if (Math.hypot(p[0], p[1]) > 0.01) out.push(`float: not at rest at ${r} s (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`);
  }
  return out;
}
