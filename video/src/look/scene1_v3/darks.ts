// The look test's DARKS (STUDY.md §10 item 5; owner, 2026-10-29: decision 2 (b), "Go with your suggestions": real darks,
// 6-10 % of the frame under L* 40, in many small pieces, the near world in mid-tones; pro_4_colour.md §3.1, §3.7, §4).
// The darks are DRAWN THINGS, never a grade: unlit panes and their reveals, doorways, the undersides of eaves, awnings,
// sills and boats, the shade under the bay tree, hulls, iron posts, a pedestal; none in the caption band or on the far
// planes. Their colours are 10b's dark roles (pro_4 §3.7: windows #3A5065 L* 33, eave and doorway shade #6B4B5F L* 36,
// the anchor #36223A) plus three of the same family (a slate iron, a deep leaf shade at h 159, a plum-brown wood shade).
// The clean pen pulls a tier-C fill 16 % toward the sky (lib/pen tierFill: #3A5065 would SHOW at L* 41.6, out of the
// band), so every dark is authored through `forTier`, the pull inverted: the frame shows the value written here.
import {hexToLab, labToHex, PEN, type Tier} from '../../lib/pen';
import type {Batch} from '../../v2r/kit/canal/core';

/** The darks as SHOWN (CIE L* in the comment): the slate-plum family of 10b's "slate and plum darks in many small
 *  pieces", and a deep leaf shade for the underside of a crown (greens h 154-171, never olive). */
export const DARK = {
  /** unlit panes' rooms, dark glass (10b paneUnlit, L* 33) */
  pane: '#3A5065',
  /** reveals, eaves, soffits, doorway and awning undersides (10b eaveShade, L* 36) */
  eave: '#6B4B5F',
  /** the deepest: thresholds, a slot under a sill (the anchor, L* 17) */
  deep: '#36223A',
  /** iron: posts, bollards, a pedestal, a hull (L* 30) */
  iron: '#364958',
  /** the shade under a crown (L* 34, h 159) */
  leaf: '#3C5648',
  /** the underside of wood and rattan, soil (L* 35, h 20) */
  wood: '#6F4849',
} as const;
export type DarkRole = keyof typeof DARK;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const CACHE = new Map<string, string>();

/** The colour to AUTHOR so that the clean pen SHOWS `hex` on `tier` (lib/pen tierFill inverted: its value pull toward
 *  the scope's background and its chroma calm). Identity under the sketch pen or a tier with no pull. */
export function forTier(hex: string, tier: Tier = 'environment', bg: string = PEN.bg): string {
  if (PEN.mode !== 'clean') return hex;
  const s = PEN.tiers[tier];
  if (s.pull <= 0 && s.chromaK >= 1) return hex;
  const key = `${hex}|${tier}|${bg}|${s.pull}|${s.chromaK}|${s.chromaMax}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const lab = hexToLab(hex);
  const g = hexToLab(bg);
  if (!lab || !g) return hex;
  const L0 = s.pull < 1 ? (lab[0] - g[0] * s.pull) / (1 - s.pull) : lab[0];
  const C = Math.hypot(lab[1], lab[2]);
  // shown C = min(C0 * chromaK, chromaMax): invert under the cap (a dark never reaches it)
  const k = C > 1e-6 && s.chromaK > 0 ? Math.min(C / s.chromaK, s.chromaMax / s.chromaK) / C : 1;
  const out = labToHex([clamp(L0, 0, 100), lab[1] * k, lab[2] * k]);
  CACHE.set(key, out);
  return out;
}

/** A dark role, authored for `tier` (default tier C, the world's). */
export const dark = (role: DarkRole, tier: Tier = 'environment'): string => forTier(DARK[role], tier);

/** Recolour a built Batch's fills in place (kit pieces that take no colour option: the boats' hull): `map` source ->
 *  new colour, on the given layers only (default all). Returns the batch. */
export function recolourBatch(b: Batch, map: Record<string, string>, layers?: number[]): Batch {
  b.layers.forEach((l, i) => {
    if (layers && !layers.includes(i)) return;
    const fills = new Map<string, string[]>();
    l.fills.forEach((ds, c) => {
      const m = map[c] ?? c;
      const a = fills.get(m);
      if (a) a.push(...ds);
      else fills.set(m, [...ds]);
    });
    l.fills = fills;
  });
  return b;
}
