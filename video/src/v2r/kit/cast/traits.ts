// K4 cast: the public's trait tables (hair x coat x accessory), drawn from the Canal Mint role tokens only.
// TREATMENT section 3: round heads, tombstone torsos, ONE accessory each, no two neighbours alike, never teal, half at
// rest. Everything is seeded (rng), never Math.random.
//
//   traitsFor('s1/steps/3')                    one person's traits (stable for its seed)
//   castRow('s1/near', 5, {hair: ['hood', 'beanie', 'bun', 'curls', 'cap']})   n neighbours, no two alike
//   NO_TEAL(color)                             false for any colour within dE 20 of the hero (the kit asserts it)

import {CM, deltaE} from '../../palette';
import {rng, Seed} from '../../../lib/rng';

/** Hair / headwear kinds (the back of a head IS the hair). */
export type HairKind = 'short' | 'long' | 'bun' | 'lowBun' | 'curls' | 'cap' | 'beanie' | 'hood' | 'crop';
/** The one accessory (torso): bags, scarf, headphones, or none (a plain coat still reads by its colour). */
export type AccKind = 'backpack' | 'tote' | 'strap' | 'scarf' | 'headphones' | 'none';
/** Coat length: a jacket (hem ~0.30 H above the feet), a mid coat, a long coat (below the knee). */
export type CoatLen = 'jacket' | 'mid' | 'long';

export type Traits = {
  hair: HairKind;
  hairColor: string;
  /** Beanie / cap / hood colour (headwear only). */
  hatColor: string;
  coat: string;
  coatLen: CoatLen;
  trousers: string;
  shoes: string;
  skin: string;
  acc: AccKind;
  accColor: string;
  /** Height factor about the nominal size (0.92-1.06): no two people the same height. */
  tall: number;
  /** Width factor (0.92-1.1): slim to broad. */
  broad: number;
};

// ---------------------------------------------------------------- the tables (role tokens, never raw hex)

/** Hair (TREATMENT confetti): dark plum-brown, brown, auburn, silver, blonde. */
export const HAIR: string[] = CM.hair;
/** Coats of the public: the confetti coats, then the light / mid page colours. NEVER the canal teal (hers only) and
 *  never the cool water greens (a muted teal reads as hers at 216 px). */
export const COAT: string[] = [CM.coatSlate, CM.coatMustard, CM.coatOat, CM.coatPlum, CM.sage, CM.brick, CM.brickLight, CM.stoneShade, CM.box, CM.leafRust, CM.brickDeep];
/** Trousers / tights: the dark and warm mids. */
export const TROUSERS: string[] = [CM.anchor, CM.coatSlate, CM.shadeWarm, CM.line, CM.coatPlum, CM.hair[0], CM.shadeCool];
export const SHOES: string[] = [CM.hair[0], CM.line, CM.paper, CM.brickDeep, CM.anchor];
/** Skin (necks, ears, hands: tiny areas) from the warm page and brick steps. */
export const SKIN: string[] = [CM.paving, CM.brickLight, CM.brick, CM.brickDeep, CM.box];
/** Bags, scarves, hats: confetti + mids. */
export const ACC_COLOR: string[] = [CM.coatOat, CM.coatMustard, CM.coatSlate, CM.brick, CM.sage, CM.stoneShade, CM.paper, CM.leafRust, CM.coatPlum];
export const HAT: string[] = [CM.coatMustard, CM.coatSlate, CM.coatPlum, CM.brick, CM.sage, CM.leafRust, CM.brickDeep];

const HAIR_W: [HairKind, number][] = [
  ['short', 5],
  ['long', 2.4],
  ['bun', 1.2],
  ['lowBun', 1],
  ['curls', 1.4],
  ['crop', 1.2],
  ['cap', 1],
  ['beanie', 1.1],
  ['hood', 0.8],
];
const ACC_W: [AccKind, number][] = [
  ['backpack', 2.4],
  ['tote', 1.8],
  ['strap', 1.6],
  ['scarf', 1.6],
  ['headphones', 1.1],
  ['none', 0.9],
];
const LEN_W: [CoatLen, number][] = [
  ['jacket', 5],
  ['mid', 3],
  ['long', 1.4],
];

/** true when `c` may be worn by the public (dE76 >= 20 from the canal teal). */
export const NO_TEAL = (c: string) => deltaE(c, CM.hero) >= 20;

export type TraitOverrides = Partial<Traits>;

// ---------------------------------------------------------------- near her: no look-alike, no ghost cue

/** Within this distance (px, feet to feet) of her or a ghost the public must not look like her or carry a ghost cue
 *  (the art director, 2026-10-27: the S1 cover read a look-alike and a silver-haired walker beside her). */
export const NEAR_HER_PX = 300;
const lc = (c: string | undefined) => (c ?? '').toLowerCase();
/** Her hair family: plum and the dark browns. */
const DARK_HAIR = new Set([CM.anchor, CM.hair[0], CM.hair[1]].map(lc));
/** The ghosts' heads: silver and white. */
const SILVER_HAIR = new Set([CM.hair[3], ...CM.ghostHead.slice(1)].map(lc));
/** The ghosts' fill: paper and oat (and the pale page / stone colours that read as paper at 216 px). */
const PALE_COAT = new Set([CM.coatOat, CM.paper, CM.ghostPaper, CM.white, CM.stucco, CM.limestone, CM.paving, CM.glass, CM.stoneShade].map(lc));
const SAFE_HAIR_KINDS: HairKind[] = ['short', 'curls', 'crop', 'cap', 'beanie', 'long'];

/** What makes a figure near her read as her or as a ghost: plum / dark hair in a bun, a long coat (her cut), silver
 *  or white hair, a paper or oat coat. [] = safe. */
export function nearHerIssues(t: Partial<Traits>): string[] {
  const out: string[] = [];
  const bunned = t.hair === 'bun' || t.hair === 'lowBun';
  if (bunned && DARK_HAIR.has(lc(t.hairColor))) out.push('plum/dark hair in a bun (her look-alike)');
  if (t.coatLen === 'long') out.push('a long coat (her cut)');
  if (t.hair !== 'hood' && SILVER_HAIR.has(lc(t.hairColor))) out.push('silver/white hair (a ghost cue)');
  if (PALE_COAT.has(lc(t.coat))) out.push('a paper/oat coat (the ghosts\' fill)');
  return out;
}

/** The same person made safe near her: only the offending traits are re-picked (deterministic for the seed), and
 *  never one a lane pinned in `keep` (pinned traits are reported by traitProblems instead). */
export function nearHerSafe(t: Traits, seed: Seed, keep: TraitOverrides = {}): Traits {
  const r = rng(`cast/nearHer/${seed}`);
  const out: Traits = {...t};
  if (keep.coatLen === undefined && out.coatLen === 'long') out.coatLen = r.chance(0.6) ? 'jacket' : 'mid';
  if (keep.coat === undefined && PALE_COAT.has(lc(out.coat))) {
    out.coat = r.pick(COAT.filter((c) => !PALE_COAT.has(lc(c)) && c !== out.accColor));
    if (out.hair === 'hood' && keep.hatColor === undefined) out.hatColor = out.coat;
  }
  if (keep.hairColor === undefined && out.hair !== 'hood' && SILVER_HAIR.has(lc(out.hairColor))) out.hairColor = r.pick(HAIR.filter((c) => !SILVER_HAIR.has(lc(c))));
  const bunned = out.hair === 'bun' || out.hair === 'lowBun';
  if (bunned && DARK_HAIR.has(lc(out.hairColor))) {
    if (keep.hair === undefined) out.hair = r.pick(SAFE_HAIR_KINDS);
    else if (keep.hairColor === undefined) out.hairColor = r.pick(HAIR.filter((c) => !DARK_HAIR.has(lc(c)) && !SILVER_HAIR.has(lc(c))));
  }
  if ((out.hair === 'cap' || out.hair === 'beanie') && keep.hatColor === undefined && out.hatColor === out.coat) out.hatColor = r.pick(HAT.filter((c) => c !== out.coat));
  return out;
}

export type TraitOpts = {
  /** The figure stands within NEAR_HER_PX of her or a ghost: no look-alike, no ghost cue (nearHerSafe). */
  nearHer?: boolean;
};

/** One person's traits, stable for its seed. Overrides win. Headwear kinds pick a hat colour; a hood is the coat. */
export function traitsFor(seed: Seed, o: TraitOverrides = {}, opts: TraitOpts = {}): Traits {
  const t = traitsRaw(seed, o);
  return opts.nearHer ? nearHerSafe(t, seed, o) : t;
}

function traitsRaw(seed: Seed, o: TraitOverrides): Traits {
  const r = rng(`cast/traits/${seed}`);
  const hair = o.hair ?? r.weighted(HAIR_W);
  const coat = o.coat ?? r.pick(COAT);
  let acc = o.acc ?? r.weighted(ACC_W);
  // a hood up already reads as headwear; headphones over a hood / cap / beanie hide in it: give a bag instead
  if (!o.acc && acc === 'headphones' && (hair === 'hood' || hair === 'cap' || hair === 'beanie')) acc = 'tote';
  // a scarf under a hood is hidden but its tail still shows (an odd stripe): give a backpack instead
  if (!o.acc && acc === 'scarf' && hair === 'hood') acc = 'backpack';
  const accColor = o.accColor ?? pickNot(r, ACC_COLOR, [coat]);
  const t: Traits = {
    hair,
    hairColor: o.hairColor ?? r.pick(HAIR),
    hatColor: o.hatColor ?? (hair === 'hood' ? coat : pickNot(r, HAT, [coat])),
    coat,
    coatLen: o.coatLen ?? r.weighted(LEN_W),
    trousers: o.trousers ?? pickNot(r, TROUSERS, [coat]),
    shoes: o.shoes ?? r.pick(SHOES),
    skin: o.skin ?? r.pick(SKIN),
    acc,
    accColor,
    tall: o.tall ?? r.range(0.93, 1.05),
    broad: o.broad ?? r.range(0.93, 1.1),
  };
  if (t.hair === 'hood' && !o.hatColor) t.hatColor = t.coat;
  return t;
}

function pickNot(r: ReturnType<typeof rng>, list: string[], avoid: string[]): string {
  const pool = list.filter((c) => !avoid.includes(c));
  return r.pick(pool.length ? pool : list);
}

/** n neighbours left to right: no two adjacent share their hair colour OR their coat (stricter than the house rule:
 *  "never both"), no two adjacent share a hair kind or an accessory. `hair` / `acc` / `coat` lists pin the kinds in
 *  order (TREATMENT S1's near row: a hood, a beanie, a low bun with a mustard scarf, curls, a cap). `nearHer` (one flag
 *  for all, or per index) keeps figures near her or a ghost free of look-alike and ghost cues. */
export function castRow(
  seed: Seed,
  n: number,
  pin: {hair?: (HairKind | undefined)[]; acc?: (AccKind | undefined)[]; coat?: (string | undefined)[]; over?: TraitOverrides[]; nearHer?: boolean | boolean[]} = {},
): Traits[] {
  const out: Traits[] = [];
  for (let i = 0; i < n; i++) {
    const prev = out[i - 1];
    let best: Traits | null = null;
    const nearHer = Array.isArray(pin.nearHer) ? !!pin.nearHer[i] : !!pin.nearHer;
    for (let k = 0; k < 40; k++) {
      const o: TraitOverrides = {...(pin.over?.[i] ?? {})};
      if (pin.hair?.[i]) o.hair = pin.hair[i];
      if (pin.acc?.[i]) o.acc = pin.acc[i];
      if (pin.coat?.[i]) o.coat = pin.coat[i];
      const t = traitsFor(`${seed}/${i}/${k}`, o, {nearHer});
      best = t;
      if (!prev) break;
      const clash = t.hairColor === prev.hairColor || t.coat === prev.coat || (t.hair === prev.hair && !o.hair) || (t.acc === prev.acc && !o.acc && t.acc !== 'none');
      if (!clash) break;
    }
    out.push(best!);
  }
  return out;
}

/** A figure placed in a shot, for the near-her check. */
export type PlacedTraits = {x: number; y: number; traits: Partial<Traits>; id?: string};

export type TraitProblemOpts = {
  /** Her and the ghosts (`anchors`, feet points) and the public around them (`figures`): any figure within `radius`
   *  (default NEAR_HER_PX = 300) of an anchor that reads as her or a ghost is a problem (nearHerIssues). */
  nearHer?: {anchors: {x: number; y: number}[]; figures: PlacedTraits[]; radius?: number};
};

/** Self-check of the tables (the KitCast sheet prints it): nothing near teal, every list non-empty; with `nearHer`, no
 *  look-alike or ghost cue within 300 px of her or a ghost. */
export function traitProblems(opts: TraitProblemOpts = {}): string[] {
  const out: string[] = [];
  for (const [name, list] of [['COAT', COAT], ['TROUSERS', TROUSERS], ['ACC_COLOR', ACC_COLOR], ['HAT', HAT], ['HAIR', HAIR], ['SKIN', SKIN]] as const) {
    if (!list.length) out.push(`${name} is empty`);
    for (const c of list) if (!NO_TEAL(c)) out.push(`${name} ${c} is within dE 20 of the hero teal`);
  }
  const nh = opts.nearHer;
  if (nh) {
    const R = nh.radius ?? NEAR_HER_PX;
    nh.figures.forEach((f, i) => {
      const d = Math.min(...nh.anchors.map((a) => Math.hypot(a.x - f.x, a.y - f.y)));
      if (d > R) return;
      for (const issue of nearHerIssues(f.traits)) out.push(`${f.id ?? `figure ${i}`} (${Math.round(d)} px from her / a ghost): ${issue}`);
    });
  }
  return out;
}

/** True when a point is within NEAR_HER_PX of any anchor (her, the ghosts). */
export const isNearHer = (p: {x: number; y: number}, anchors: {x: number; y: number}[], radius = NEAR_HER_PX) => anchors.some((a) => Math.hypot(a.x - p.x, a.y - p.y) <= radius);
