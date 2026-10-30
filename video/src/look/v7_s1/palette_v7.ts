// v7's ONE COLOUR KEY, at the SOURCE (docs/look/ORGANIC.md §4.3 and §6 step 1; the owner, 2026-10-30, on the darks
// and the key: "that's very doable that's just color palette and selection? Similarly point 2"; playbook PROPER LIGHT:
// "ONE COLOUR KEY per scene (one strong colour family with one hot accent, never a mix of unrelated pastels)").
// Pure data and pure functions: importing this module changes nothing; the scene applies it.
//
// How it reaches the frame: every vector fill of S1 passes through ONE colour map (lib/tod `<Tod map>`, which every
// <Fill> and every kit Batch applies to its colour before the clean pen's tier calm): `keyV7(hex)` = the role table below
// (v2's role hex -> its keyed hex, designed), else the family function (a hue outside the dusk arc turns to its nearer
// end with its chroma kept, C* >= 8, never olive or beige; living greens stay ONE green family). Colour -> colour, once
// per colour (memoised): 0 ms a frame, it rides every shape and every motion, never a per-pixel grade. The painted
// pieces take the same key from the painter's light table (scripts/look/paint/v2s1_v7.json). key.py stays a MEASURE.
//   the family   the dusk sky's own: violet shade -> rose-plum -> rose -> peach -> cream-gold light
//   the accent   ONE: the lit doorway's gold (`ACCENT_V7`: the lobby only, by its own map `accentV7` in the scene)
//   the lights   every other light calms into its mass: the lit panes a quiet warm cream (C* <= 20), never a yellow
//   the cools    glass, slate, mint, the water's teal: turned to the family's violet end, chroma kept (glass C* ~10,
//                never the proof's C* 4 grey)
//   the greens   one green family, h 138-152 (the cool deep end; PAINT_RECIPES C8), C* 12-26, never olive
//   the darks    the 10b darks re-hued into the family (slate -> violet), their value kept; the light bake deepens them
// Her teal is NOT keyed (the subject keeps her colour: against the door's gold it is the complementary pair the eye
// goes to); the captions are outside the scene.
import {fromLch, lch} from '../../lib/light';
import {neverBand} from '../../lib/water';
import {tierFill} from '../../lib/pen';
import {CM_V2} from '../paint_s1/palette_10b';
import {DARK, forTier} from '../paint_s1/darks';
import {S1_IRON} from '../paint_s1/V2S1_set_core';

const hx = (L: number, C: number, h: number) => fromLch(L, C, h);

/** The caption field of v7's sky (L* 77, C* 13, h 322: T3's band, a warm rose-lilac; the caption ink 9:1): also the
 *  page the clean pen's calm tiers pull toward (PEN.bg), so the world's value calm follows the sky it sits under. */
export const V7_BG = '#CBB8CD';

/** The keyed roles: v2's role hex (CM_V2, as every module draws it) -> v7's. Unlisted roles keep their colour when it
 *  is in the family, else they take `family()`. Values are the AUTHORED colours; the clean pen's tier C then calms
 *  them (pull 0.16 toward V7_BG, chroma x0.85): `problems()` checks what SHOWS. */
export const V7_ROLES: Readonly<Record<string, string>> = {
  // ---- the cools, turned to the family's violet end with their chroma kept (C* >= 8 as shown)
  [CM_V2.glass]: hx(86, 11, 296), // the wing's glass: a pale slate-violet (the proof's #A6A5AC at C* 4 read grey)
  [CM_V2.skyHigh]: hx(89, 9, 302), // the glass's sky reflection, the lanterns' highlight
  [CM_V2.sky]: V7_BG, // the vector sky (behind the painted one) and anything drawn in the sky's colour
  [CM_V2.bandDusk]: hx(81, 11, 302),
  [CM_V2.water]: hx(72, 16, 296), // the vector canal (the painted canal covers it in the picture)
  [CM_V2.waterDeep]: hx(60, 18, 296), // the far towpath's waterline strip (v6's mint stripe)
  [CM_V2.paneUnlit]: hx(44, 17, 292), // unlit panes, hulls, the boat's portholes (also coatSlate: the same hex)
  [CM_V2.shadeCool]: hx(52, 20, 292),
  [CM_V2.stoneShade]: hx(78, 11, 300),
  [S1_IRON]: hx(60, 12, 294), // the lamp posts' iron (S1_IRON #939AAD: C* 9 h 275)
  '#868FA4': hx(58, 12, 292), // the wing's glass foot band
  // ---- the lights: the lit panes calm into the facade's mass (R11), never a saturated yellow
  [CM_V2.lamp]: hx(80, 19, 72), // a quiet warm cream (v6's #F7CF86: C* 41, the colour formula's #1 call)
  [CM_V2.lampCore]: hx(88, 13, 76),
  // ---- the warm confetti a little calmer, out of the beige band
  [CM_V2.coatMustard]: hx(70, 28, 68),
  [CM_V2.leafGold]: hx(71, 32, 70),
  [CM_V2.coatOat]: hx(84, 19, 62),
  // ---- the living greens: ONE family (the roof planting, the lobby's plant)
  [CM_V2.sage]: hx(74, 15, 146),
};

/** THE ONE HOT ACCENT: the lobby's light (the story light's source; the playbook's "one hot accent", R11): its warm
 *  wall and its back wall. Drawn by the scene through `accentV7` (the lobby's own map), never anywhere else. */
export const ACCENT_V7 = {
  lamp: hx(85, 50, 74), // the lobby's warm wall: apricot gold (C* 50; h 74 keeps it off the sickly green-yellow)
  lampCore: hx(92, 24, 78), // its back wall, under the lamps
} as const;

/** The 10b darks (darks.ts DARK, authored for tier C through `forTier`) re-hued into the family, their value kept:
 *  the slate panes and the iron to violet, the leaf shade to the green family. */
export const V7_DARK: Readonly<Partial<Record<keyof typeof DARK, string>>> = {
  pane: hx(33, 16, 292),
  iron: hx(30, 14, 292),
  leaf: hx(34, 14, 150),
};

/** The family's arc: in family where h <= GOLD_END or h >= VIOLET_END (violet .. plum .. rose .. peach .. gold). */
const GOLD_END = 88;
const VIOLET_END = 282;

/** The family function (a colour no table names: derived colours, hazed and calmed ones, module constants): */
export function family(hex: string): string {
  const {L, C, h} = lch(hex);
  if (C < 2.5) return hex; // a designed neutral (paper, ink, white): left alone
  let H = h;
  let Cn = C;
  if (h > GOLD_END && h < VIOLET_END) {
    if (h >= 120 && h <= 175) {
      // a living green: ONE green family, the cool deep end (C8), never olive
      H = 146 + (h - 146) * 0.3;
      Cn = Math.max(12, Math.min(C, 26));
    } else if (h < 120) {
      // olive and yellow-green: to the gold end
      H = 80;
      Cn = Math.max(C, 18);
    } else {
      // teal, mint, blue, slate: to the violet end, chroma kept
      H = 292 + Math.max(0, h - 262) * 0.4;
      Cn = Math.max(C, 9);
    }
  } else if (C < 9) {
    Cn = 9; // an in-family grey a little richer: C* >= 8 as shown
  }
  let out = fromLch(L, Cn, H);
  const band = neverBand(out);
  if (band === 'beige') {
    // a darkened warm out of the beige band: its warm chroma back, as terracotta (near.ts noBeige)
    out = fromLch(L, Math.max(19, Cn), Math.min(H, 50));
  } else if (band === 'olive') out = fromLch(L, Math.max(Cn, 18), 80);
  return out;
}

const MEMO = new Map<string, string>();
const DARK_ROWS = new Map<string, Map<string, string>>();

/** The darks as AUTHORED (forTier: the clean pen's pull inverted, so the frame SHOWS DARK's values) -> v7's darks
 *  authored the same way. Depends on the pen's background: built per PEN.bg. */
function darkRows(bg: string): Map<string, string> {
  let m = DARK_ROWS.get(bg);
  if (m) return m;
  m = new Map();
  for (const [role, v7] of Object.entries(V7_DARK) as [keyof typeof DARK, string][]) {
    m.set(forTier(DARK[role], 'environment', bg).toUpperCase(), forTier(v7, 'environment', bg));
    m.set(DARK[role].toUpperCase(), v7); // a dark drawn as authored (the subject tier: the door's frame)
  }
  DARK_ROWS.set(bg, m);
  return m;
}

/** THE KEY: v2's colour -> v7's (the role table, then the darks, then the family function). Memoised per colour. */
export function keyV7(hex: string, bg: string = V7_BG): string {
  if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
  const k = hex.toUpperCase();
  const hit = MEMO.get(k + bg);
  if (hit) return hit;
  const out = V7_ROLES[k] ?? V7_ROLES[hex] ?? darkRows(bg).get(k) ?? family(hex);
  MEMO.set(k + bg, out);
  return out;
}

/** The lobby's map: its lamp and core take THE accent; everything else in it as keyV7. */
export function accentV7(hex: string): string {
  if (!hex || hex[0] !== '#') return hex;
  const k = hex.toUpperCase();
  if (k === CM_V2.lamp.toUpperCase()) return ACCENT_V7.lamp;
  if (k === CM_V2.lampCore.toUpperCase()) return ACCENT_V7.lampCore;
  return keyV7(hex);
}

/** The identity map (her: the subject keeps her colour). */
export const identityV7 = (hex: string) => hex;

/** What SHOWS for a tier-C fill authored `hex` under v7's key (the key, then the clean pen's calm toward V7_BG). */
export const shownV7 = (hex: string) => tierFill(keyV7(hex), 'environment', V7_BG);

/** The key's checks (empty = OK), on what shows: every keyed role C* >= 8 (but the designed neutrals) and outside the
 *  never bands (beige, olive, grey); no keyed role in the dusk arc's gap (h 88-282) but the one green family; ONE accent
 *  (the only warm light at C* >= 40 is the lobby's); the caption ink >= 7:1 on the band. */
export function problems(): string[] {
  const out: string[] = [];
  const neutrals = new Set(['paper', 'white', 'ink', 'ghostPaper', 'name', 'ghostInkPx']);
  for (const [role, v] of Object.entries(CM_V2)) {
    if (neutrals.has(role) || typeof v !== 'string' || !v.startsWith('#')) continue;
    if (role === 'hero') continue; // her teal: not keyed (the subject)
    if (role === 'pop' || role === 'sun' || role === 'box') continue; // the sun disc (painted) and the caption box (UI)
    const shown = shownV7(v);
    const c = lch(shown);
    if (c.C < 7.95) out.push(`${role} ${v} -> ${shown}: C* ${c.C.toFixed(1)} < 8 as shown`);
    const band = neverBand(shown);
    if (band) out.push(`${role} ${v} -> ${shown}: in the ${band} band`);
    const off = c.h > GOLD_END && c.h < VIOLET_END && c.C >= 8;
    const green = c.h >= 125 && c.h <= 160;
    if (off && !green) out.push(`${role} ${v} -> ${shown}: h ${c.h.toFixed(0)} outside the dusk family`);
    if (c.L > 60 && (c.h < 100 || c.h > 340) && c.C >= 40) out.push(`${role} ${v} -> ${shown}: a second hot accent (C* ${c.C.toFixed(0)})`);
  }
  for (const [role, v] of Object.entries(V7_DARK)) {
    const c = lch(v as string);
    if (c.C < 8) out.push(`dark ${role} ${v}: C* ${c.C.toFixed(1)} < 8`);
  }
  const acc = lch(ACCENT_V7.lamp);
  if (acc.C < 40) out.push(`the accent ${ACCENT_V7.lamp} is only C* ${acc.C.toFixed(0)}`);
  if (neverBand(ACCENT_V7.lamp)) out.push(`the accent ${ACCENT_V7.lamp} is in the ${neverBand(ACCENT_V7.lamp)} band`);
  // the ink on the band (WCAG relative luminance)
  const rl = (h: string) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ink = (rl(V7_BG) + 0.05) / (rl(CM_V2.ink) + 0.05);
  if (ink < 7) out.push(`the ink on the band ${ink.toFixed(2)}:1 (< 7:1)`);
  return out;
}
