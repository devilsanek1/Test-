// Video 2 (restart): the film-wide CLEAN PEN WITH ATTENTION TIERS (owner, 2026-10-27, after v3 G5b: "too rough and messy,
// a lot of rough lines; cleaner, more refined, gentle, premium"; "too many moving parts and I'm not sure what to keep my
// attention on"). docs/look/DIRECTION.md rules 2 and 4, docs/look/CRAFT.md §b-§c (they win), docs/v2/STYLE.md §3.
//
// Imported FIRST by palette.ts, so the pen is set before any kit or scene module draws (or builds a path at module
// load): lib/sketch's own clean line (one confident stroke) AND lib/pen.ts's full clean pen (every shape one closed
// subpath, fills registered exactly, no taper / boil / texture marks) with the line weight, line colour, fill calm and
// idle motion set by each piece's ATTENTION TIER, by story role (lib/tier.tsx):
//   subject      the beat's 1-3 objects: the only full outline, in the object's own deep shade (her, a board on its beat)
//   support      supporting life (Pip, the public near the story, staff): no outline unless the scope says `lines`
//                (line-drawn figures and Pip keep a thin same-hue line); fills calmer, C* <= 25 (CRAFT §b B)
//   environment  canal, buildings, water, towpath, far city, Arlington: no line (things that ARE lines as hairlines)
// Every v2r kit export has a default tier (each kit README, "Tiers"); scenes force a group with
// <Tier tier="environment">...</Tier> and promote the beat's subject with tier="subject". Untagged scene ink is
// 'support' WITH its tinted lines (thin, never black) until the lane tiers it.
// Other films keep their own pen (separate bundles): v1 / v2 stay on the sketch pen, v3 sets its own in look.ts.
import {setPenMode} from '../lib/sketch';
import {setPen} from '../lib/pen';

/** The Canal Mint tokens the pen needs, mirrored from palette.ts `CM` (palette.ts imports this module first, so it
 *  cannot import them back; `penProblems()` checks they still agree). */
export const PEN_TOKENS = {
  /** CM.sky: the page / sky / caption field, what the calmer tiers' fills are pulled toward. */
  sky: '#BCDCCF',
  /** CM.lamp: lit windows, lamp pools, bulbs (flat). */
  lamp: '#F7CF86',
  /** CM.lampCore: the lit core of a pane or a lamp. */
  lampCore: '#FBE6C2',
  /** CM.sun (= CM.pop): the sun disc. */
  sun: '#EE6A2E',
} as const;

/** Light sources: never recoloured by a tier (lit windows, the lamp pools and cores, the sun). */
export const V2R_EMISSIVE: string[] = [PEN_TOKENS.lamp, PEN_TOKENS.lampCore, PEN_TOKENS.sun];

setPenMode('clean');
setPen('clean', {
  bg: PEN_TOKENS.sky,
  emissive: V2R_EMISSIVE,
  untagged: 'support',
  untaggedLines: true,
  // CRAFT §b, tier B: "C* <= 25; never the hero or pop hue" (lib's default cap is v3's 40; Pip's periwinkle sat at 37)
  tiers: {support: {chromaMax: 25}},
});

/** The pen's mirrored tokens against the palette (empty = OK). Call it at render time (the palette is loaded then). */
export function penProblems(cm: {sky: string; lamp: string; lampCore: string; sun: string}): string[] {
  const out: string[] = [];
  for (const k of ['sky', 'lamp', 'lampCore', 'sun'] as const) {
    if (cm[k].toUpperCase() !== PEN_TOKENS[k].toUpperCase()) out.push(`pen token ${k} ${PEN_TOKENS[k]} != CM.${k} ${cm[k]}`);
  }
  return out;
}
