// lib/gamut.ts: THE PALETTE'S SHAPE, an ENGINE primitive (city-poster study, 2026-10-29: `docs/studies/
// 2026-10-28_city_posters/pro_4_colour.md` §3.2-3.3; Gurney's gamut masking, Color and Light 2010). The posters' colour
// reads "premium" by where the chroma lives (the mids), calm lights, and many sibling tints of a few inks (>= 20 colours
// cover 90 % of a frame; v2 had 9-21, one hex per role). This module holds:
//   the Canal Mint GAMUT MASK: the most chroma a fill may carry at each hue (three lobes: terracotta-gold, teal-mint,
//     slate-plum; olive held near-neutral) times a VALUE-CHROMA ENVELOPE (chroma peaks in the mids, lights stay paper),
//     ported exactly from scripts/look/posters/pro_4_colour.py (MASK_HUE, envelope), so the engine and the meter agree;
//   calmLight: a big light fill's chroma held to C* 4-8 (the one cool field 9-11);
//   SIBLINGS: 3-5 tints per fill role (hue +-8 deg, L* +-4-10, C* +-3-6, dE76 8-14 from the role, >= 8 apart, inside the
//     mask, never in a never band), so a facade row, the boats and the awnings reuse a role's few inks like a poster.
// Pure and deterministic (lib/rng seeds; no React, no frame state): CIE L*a*b* D65 and dE76 as lib/light, lib/depth and
// the QA meters measure them. Opt-in: nothing here runs unless a film calls it.
//
//   inMask('#C9806A')                       // true: brick sits inside the warm lobe
//   siblings(CM.stucco, 4, 'facades')       // 4 tints of the stucco role for a facade row
//   calmLight(CM.paving)                    // the lit paving at C* <= 8 (10b: 14.5 -> 7)
//   siblingProblems(CM.brick, sibs)         // empty = OK

import {fromLch, lab, lch} from './light';
import {rng} from './rng';
import {neverBand} from './water';

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const isHex = (c: unknown): c is string => typeof c === 'string' && HEX.test(c);
const dE76 = (a: string, b: string) => {
  const p = lab(a);
  const q = lab(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};
/** Linear interpolation in a table of [x, y] rows (x ascending), clamped to its ends (numpy.interp). */
const interp = (x: number, rows: readonly (readonly [number, number])[]) => {
  if (x <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) {
    const [x1, y1] = rows[i];
    if (x <= x1) {
      const [x0, y0] = rows[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return rows[rows.length - 1][1];
};

// ================================================================= the gamut mask (pro_4_colour.py, exactly)

/** The Canal Mint hue mask: [hue deg, the most C* a fill may carry there] (pro_4_colour.py MASK_HUE). */
export const MASK_HUE: readonly (readonly [number, number])[] = [
  [0, 28], [20, 40], [35, 52], [60, 50], [85, 44], [95, 7], [118, 7], [130, 18], [150, 22], [165, 32],
  [185, 38], [205, 24], [240, 18], [270, 26], [300, 26], [330, 24], [360, 28],
];
/** The value-chroma envelope: the share of the hue mask a fill may use at L* (1 in the mids; pro_4_colour.py). */
export const ENVELOPE: readonly (readonly [number, number])[] = [[0, 0.7], [15, 0.8], [72, 1], [80, 0.55], [88, 0.3], [96, 0.22], [101, 0.2]];

/** The mask's chroma limit at (L*, hue). `mask` = another hue table (a film's own palette shape). */
export function maskChroma(L: number, h: number, mask: readonly (readonly [number, number])[] = MASK_HUE): number {
  return interp(((h % 360) + 360) % 360, mask) * interp(L, ENVELOPE);
}

/** Inside the mask (the meter's test: C* <= the limit + `slack`, default 1)? Outside by design: the one pop and light
 *  sources (the sun, lamps) and the caption box (UI). */
export function inMask(hex: string, o: {slack?: number; mask?: readonly (readonly [number, number])[]} = {}): boolean {
  if (!isHex(hex)) return true;
  const {L, C, h} = lch(hex);
  return C <= maskChroma(L, h, o.mask) + (o.slack ?? 1);
}

/** The colour pulled into the mask (L* and hue kept, chroma lowered to the limit); inside already: unchanged. */
export function toMask(hex: string, o: {mask?: readonly (readonly [number, number])[]} = {}): string {
  if (!isHex(hex)) return hex;
  const {L, C, h} = lch(hex);
  const lim = maskChroma(L, h, o.mask);
  return C <= lim + 1 ? hex : fromLch(L, lim, h);
}

// ================================================================= calm lights (pro_4_colour.md §3.2a)

/** A big LIGHT fill calmed (L* >= `minL`, default 86: walls in light, lit paving, paper): C* into 4-8, the hue kept (a
 *  warm cream at h 70-90 is not beige above L* 86: lib/water neverBand); `cool: true` for the one cool field (the sky or
 *  the canal): C* 9-11. A darker colour is returned unchanged (the mids keep their colour: C* 18-32). */
export function calmLight(hex: string, o: {cool?: boolean; minL?: number; range?: [number, number]} = {}): string {
  if (!isHex(hex)) return hex;
  const {L, C, h} = lch(hex);
  if (L < (o.minL ?? 86)) return hex;
  const [lo, hi] = o.range ?? (o.cool ? [9, 11] : [4, 8]);
  const C2 = clamp(C, lo, hi);
  return Math.abs(C2 - C) < 0.05 ? hex : fromLch(L, C2, h);
}

// ================================================================= sibling tints (pro_4_colour.md §3.3c)

export type SiblingOpts = {
  /** Hue turn, deg (default 8: +-8). */
  dh?: number;
  /** |dL*| range (default [4, 10]). */
  dL?: [number, number];
  /** |dC*| range (default [3, 6]). */
  dC?: [number, number];
  /** dE76 from the role's own colour (default [8, 14]). */
  dE?: [number, number];
  /** dE76 between any two of the set, the role included (default 8; "tints under dE 6 apart read as mistakes"). */
  apart?: number;
  /** Keep inside the gamut mask (default true; a role already outside it may go as far as its own chroma). */
  mask?: boolean;
  /** Lighter or darker only (a facade row in shade: 'darker'). Default both. */
  side?: 'both' | 'lighter' | 'darker';
};

const SIB_CACHE = new Map<string, string[]>();

/** `n` sibling tints of `hex` (default 4), deterministic per `seed`: candidates on a grid of hue +-8 deg, L* +-4-10, C*
 *  +-3-6 (seeded jitter), each gamut-fit, inside the mask, out of the never bands (lib/water: beige, olive, grey), dE76
 *  8-14 from the role; then picked farthest-first (the first by seed), every pick >= 8 from the role and from every
 *  pick before it, so the set spreads instead of clustering. Fewer than `n` come back when the constraints leave no
 *  more (a very light or very saturated role: check `.length`). */
export function siblings(hex: string, n = 4, seed: string | number = 'sib', o: SiblingOpts = {}): string[] {
  if (!isHex(hex) || n <= 0) return [];
  const dh = o.dh ?? 8;
  const [l0, l1] = o.dL ?? [4, 10];
  const [c0, c1] = o.dC ?? [3, 6];
  const [e0, e1] = o.dE ?? [8, 14];
  const apart = o.apart ?? 8;
  const side = o.side ?? 'both';
  const key = `${hex}|${n}|${seed}|${dh}|${l0},${l1}|${c0},${c1}|${e0},${e1}|${apart}|${o.mask ?? true}|${side}`;
  const hit = SIB_CACHE.get(key);
  if (hit) return hit;
  const base = lch(hex);
  const R = rng(`gamut/siblings/${seed}/${hex}`);
  const Ls = [l0, (2 * l0 + l1) / 3, (l0 + 2 * l1) / 3, l1].flatMap((d) => (side === 'lighter' ? [d] : side === 'darker' ? [-d] : [d, -d]));
  const Hs = [-dh, -dh / 2, 0, dh / 2, dh];
  const Cs = [c0, (c0 + c1) / 2, c1].flatMap((d) => [d, -d]);
  const baseIn = base.C <= maskChroma(base.L, base.h) + 1; // a role outside the mask (a gold band) may keep its own chroma
  const cands: string[] = [];
  for (const dl of Ls)
    for (const dhh of Hs)
      for (const dc of Cs) {
        const L = clamp(base.L + dl + R.jitter(0.6), 2, 98.5);
        const C = Math.max(0, base.C + dc + R.jitter(0.4));
        const h = (base.h + dhh + R.jitter(0.8) + 360) % 360;
        const c = fromLch(L, C, h);
        const q = lch(c);
        if (Math.abs(q.L - base.L) < l0 - 0.6) continue; // gamut-fit moved it back onto the role's value
        if (o.mask ?? true) {
          const lim = maskChroma(q.L, q.h) + 1;
          if (baseIn ? q.C > lim : q.C > Math.max(lim, base.C + 0.5)) continue;
        }
        if (neverBand(c)) continue;
        const d = dE76(c, hex);
        if (d < e0 || d > e1) continue;
        if (!cands.includes(c)) cands.push(c);
      }
  const out: string[] = [];
  if (cands.length) {
    const order = R.shuffle(cands);
    out.push(order[0]);
    while (out.length < n) {
      let best = '';
      let bestD = -1;
      for (const c of order) {
        if (out.includes(c)) continue;
        const dMin = Math.min(dE76(c, hex), ...out.map((x) => dE76(c, x)));
        if (dMin >= apart && dMin > bestD) {
          best = c;
          bestD = dMin;
        }
      }
      if (!best) break;
      out.push(best);
    }
  }
  if (SIB_CACHE.size > 400) SIB_CACHE.clear();
  SIB_CACHE.set(key, out);
  return out;
}

/** Siblings for several roles at once: {role: [tints]} (each role seeded by its name). */
export function siblingSet(roles: Record<string, string>, n = 4, seed: string | number = 'sib', o: SiblingOpts = {}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(roles)) if (isHex(v)) out[k] = siblings(v, n, `${seed}/${k}`, o);
  return out;
}

/** A role's tints against the spec (empty = OK): 3-5 of them, each dE76 8-14 from the role (`o.dE`), every pair >= 8
 *  apart (under 6 reads as a mistake), hue within +-8 deg, inside the mask, none in a never band. */
export function siblingProblems(hex: string, sibs: readonly string[], o: {dE?: [number, number]; apart?: number; dh?: number; mask?: boolean} = {}): string[] {
  const out: string[] = [];
  const [e0, e1] = o.dE ?? [8, 14];
  const apart = o.apart ?? 8;
  const dh = o.dh ?? 8;
  if (sibs.length < 3 || sibs.length > 5) out.push(`${hex}: ${sibs.length} siblings (want 3-5)`);
  const h0 = lch(hex).h;
  const b = lch(hex);
  const baseIn = b.C <= maskChroma(b.L, b.h) + 1;
  sibs.forEach((s, i) => {
    const d = dE76(s, hex);
    if (d < e0 - 0.05 || d > e1 + 0.05) out.push(`${s}: dE ${d.toFixed(1)} from ${hex} (want ${e0}-${e1})`);
    const turn = Math.abs(((lch(s).h - h0 + 540) % 360) - 180);
    if (lch(s).C > 4 && turn > dh + 1) out.push(`${s}: hue ${turn.toFixed(1)} deg off the role (want <= ${dh})`);
    if ((o.mask ?? true) && !inMask(s) && (baseIn || lch(s).C > b.C + 0.5)) out.push(`${s}: outside the gamut mask`);
    const band = neverBand(s);
    if (band) out.push(`${s}: in the ${band} band`);
    for (let j = i + 1; j < sibs.length; j++) {
      const dd = dE76(s, sibs[j]);
      if (dd < apart - 0.05) out.push(`${s} and ${sibs[j]}: dE ${dd.toFixed(1)} apart (want >= ${apart}; under 6 reads as a mistake)`);
    }
  });
  return out;
}
