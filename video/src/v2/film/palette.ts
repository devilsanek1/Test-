// Video 2 G5: the Cream & Cobalt palette applied to the house theme tokens (src/lib/theme.ts) for this film's entries,
// plus the CC role tokens every set and prop of the film draws with (kit/README.md "Colour jobs"), and the DUSK role
// tokens of the one scale beat (P8, the Pentagon rise; src/v2/StylePentagon.tsx's DUSK, verbatim).
//
// Import this module FIRST in every v2 film entry (src/entry-v2-film.tsx, src/entry-v2-kit.tsx), before any lib or kit
// module: it rewrites the house tokens IN PLACE at module load, so every house module evaluated after it (lib/Ink,
// lib/Fill, lib/World, lib/kit, lib/cine; their module-level colour tables included, e.g. Person's PERSON_BODIES or the
// cine TOD palettes) draws in Cream & Cobalt. Only theme.ts is evaluated before this body (this file imports nothing
// else), and theme.ts's own derived tables (skies, todSky, todSteps, captionTones, glow, type.color, ...) are patched
// here explicitly. Other entries (v1, v3, the G3/G4 v2 entry) are separate bundles and keep their palettes.
// `ccProblems()` re-checks all of it at render time (the KitSheet2 composition prints the result).
//
// TIME OF DAY (one for the whole film): EVENING. Inside, her warm lamp-lit home (the desk of O1/P12 and the nook of
// P2/P4/P5/P6/P13 are the same home: cream wall, apricot desk, red-brown wood, golden lamp pool). Outside her window,
// the saturated dusk blue of the approved style frame (#4D5C99, never grey) over a DENSE town in flat value steps (a
// peach-lilac last light at the horizon, a far skyline in haze, rows of roofs, the facades across the street, many
// windows, a few switching on and off), a crescent moon, a few stars, drifting clouds, birds. Every house time-of-day
// name maps to that one moment (no relight steps). The cold pages (P7, P9, P10, P11) lie on THE COLD SET (kit/ColdSet.tsx,
// `CC.cold*`: one official mid-violet desk, the same for the deal page and Google's page); P3's interview room is a cool
// periwinkle studio (`CC.studio*`: not her home, not the cold set); P8 is the sister palette DUSK.

import {captionTones, glow, palette, skies, todBulbHalo, todSky, todSteps, todTone, type as typeTok, TodName} from '../../lib/theme';

// ---------------------------------------------------------------- the role tokens (StyleDesk's A DeskPal, extended)

export const CC = {
  name: 'Cream & Cobalt',
  ink: '#2B1B0A',
  // ---- the room (StyleDesk A, verbatim)
  wall: '#F3E6D6', // the page
  wallShade: '#EBCFB5', // bookcase back, window reveal, baseboard, the soffit's face
  shelf: '#DFA27A', // bookcase wood
  books: ['#F6B892', '#C8714E', '#EBCFB5', '#9A5236', '#E9B47A', '#F3E6D6', '#D98A62'] as string[],
  desk: '#DC9C74', // desk top (L* <= 80 so the pool reads)
  deskFront: '#C27D57', // apron + legs
  deskShade: '#C9875F', // warm cast shadows on the desk
  floor: '#CB8C66',
  under: '#A8644A', // under the desk (warm shade, never grey)
  ring: '#F7CF9C', // lamp pool, outer ring
  core: '#FBE6C6', // lamp pool core + the lit lamp mouth
  paper: '#FFF8EE', // the contract, every page (the lightest thing in the frame)
  paperEdge: '#E9C9AA', // a page's underside / folder
  box: '#E3B07B', // cardboard
  boxSide: '#CC9260',
  boxIn: '#A9704A',
  pot: '#C8714E',
  leaf: '#5E8C6A',
  frame: '#9A5236', // the photo frame in the box
  badge: '#FFF8EE',
  badgeBand: '#F6B892',
  photo: '#EBCFB5',
  skin: '#EDB894',
  nail: '#F8DAC4',
  mug: '#F3E6D6',
  mugBand: '#F6B892',
  trim: '#A65A3C', // window frame, mullion, the chair (red-brown wood)
  sill: '#F3E6D6',
  // ---- the window (the evening outside)
  sky: '#4D5C99', // saturated dusk blue; white text on it (6.4:1)
  cloud: '#5C6BA6',
  far: '#3D4A85', // far roofs
  roofs: '#2B2A44', // near roofs
  lit: '#F7C98B', // lit windows
  moon: '#FBE6C6',
  star: '#F3E6D6',
  // ---- the nook (extended for G5)
  curtain: '#E9B47A', // a honey curtain (warm, not the pop)
  curtainShade: '#D9985E', // its folds
  soffit: '#EBCFB5', // the soffit's face (= wallShade)
  chair: '#A65A3C', // = trim (red-brown wood)
  chairShade: '#8A4A30',
  lampShade: '#2B2A44', // = anchor
  laptop: '#2B2A44', // her laptop: anchor dark lid and bezel
  laptopDeck: '#4A4868', // its deck, one step lighter
  screen: '#DCE0F5', // a lit screen: pale cool light (no logos)
  screenInk: '#2B2A44', // the network drawn on it
  mic: '#2B2A44', // the plain interview mic (anchor)
  micGrille: '#5C5A7A', // its grille band
  micStand: '#4A4868',
  // ---- HER (the protagonist: one model, kit/Her.tsx). Generic figure, never a likeness.
  hair: '#2B2A44', // long dark hair mass = the anchor
  hairShade: '#1F1E33', // one flat step darker (the underside of the mass)
  sweater: '#3F7FE0', // = hero cobalt (her sweater: sleeve, torso)
  sweaterRib: '#2F66BF', // the hero's own flat shade step (cuffs, collar, hem): on her only
  trousers: '#5B4B66', // muted plum (dark-mid, warm)
  shoe: '#2B2A44',
  mouth: '#8A3F36', // an open mouth (talking)
  cheek: '#F2A98C', // a worried flush (tiny)
  // ---- the staffers (P3): clearly NOT her (short hair or none, non-hero clothes, non-hero lanyards)
  staffA: '#8E4A52', // wine sweater (the one who spoke)
  staffAShade: '#743C43',
  staffAHair: '#4A3328', // short dark-brown hair
  staffB: '#C48B5C', // camel jacket
  staffBShade: '#A9744A',
  staffBShirt: '#F3E6D6',
  staffBHair: '#8A6A58', // a little side hair (bald on top)
  skin2: '#D9A07C', // staffer B's skin (a second warm skin)
  lanyardA: '#2B2A44', // non-hero lanyards
  lanyardB: '#9A5236',
  // ---- P3's interview table (kit/Interview.tsx; the room's roles are `studio*` below)
  table: '#E1DDF3', // a pale lilac laminate top
  tableFront: '#B7B2DE',
  // ---- the cold set (P7, P9, P10, P11): THE picked COLD_SETS variant (kit/ColdSet.tsx; kit/README.md "The cold set")
  cold: '#716DB0', // the official desk top (= COLD_SETS.dusk.table, the pick)
  coldShade: '#55509A', // a page's flat drop shadow on it
  stamp: '#2B2A44', // APRIL 2026 / NO VETO stamps (anchor ink, never the pop)
  // ---- her home, more of it (G5 density: kit/Nook.tsx)
  wallDeep: '#E2C3A6', // the wall in shadow (under the desk, behind the bookcase's books)
  caseBack: '#D9A27E', // the bookcase's back panel (one step under the shelf wood)
  rug: '#C8714E', // the rug (terracotta) ...
  rugBand: '#F6B892', // ... its peach bands ...
  rugEdge: '#9A5236', // ... and its border
  radiator: '#EBD9C6',
  cork: '#D49A66', // the corkboard
  note: '#FFF8EE', // notes pinned on it
  note2: '#F7CF9C',
  note3: '#F6B892',
  pin: '#C8714E',
  coat: '#B07A8C', // her coat on its hook (dusty mauve: soft, recedes; not the hero)
  coatShade: '#96657A',
  scarf: '#E9B47A',
  leafDark: '#467A5A', // a plant's back leaves (one step under `leaf`)
  leafLight: '#7FA884',
  blind: '#F2D3AE', // the roller blind (honey cream)
  candle: '#FBE6C6',
  flame: '#F7CF9C',
  cable: '#2B2A44',
  pictures: ['#F6B892', '#E9B47A', '#C8714E', '#5E8C6A', '#9C8CC4', '#F7CF9C'] as string[], // framed prints (no hero blues)
  wallGlow: '#F7DDB8', // the lamp's warm light on the wall (one flat step over the wall)
  // ---- her cat (kit/Cat.tsx): a warm dark tabby; never the hero, never the pop; reads on cream, apricot and dusk blue
  catBody: '#7A4A38',
  catStripe: '#4A2C22',
  catLight: '#F6E3CC', // chest, muzzle, paws, tail tip underside
  catEar: '#E9A08A', // inner ears, nose
  catEye: '#E9C46A',
  // ---- the town outside her window (kit/Town.tsx), back to front in flat value steps (no ink: a far plane)
  skyLow: '#5B69A6', // one flat step lighter toward the horizon
  glowHi: '#9A88BC', // the last light: lilac ...
  glow: '#E6A48E', // ... then peach at the horizon
  cloudLit: '#7E86C0', // a cloud's lit underside
  skyline: '#8A82BC', // the far skyline in haze
  skylineLit: '#D9B2C2',
  townMid: '#56609B', // rows of roofs
  townMidSide: '#48518C',
  townNear: '#3D4A85', // the near roofs (= the style frame's `far`)
  facade: '#5D5287', // the facades across the street (plum dusk brick)
  facadeSide: '#4A4275',
  cornice: '#7A6DA3',
  winDark: '#2F3462', // an unlit window
  litWarm: '#F6B892', // a second, peachier lit window
  neighbour: '#3A3360', // a figure seen in a lit window
  // ---- P3: the interview room (kit/Interview.tsx): a cool periwinkle studio, dense but not cozy
  studio: '#C6C9EA',
  studioPanel: '#B3B8E2',
  studioDeep: '#9EA4D6',
  studioFloor: '#8F96CC',
  shelfMetal: '#6F76B4',
  archive: '#E3B07B', // archive boxes (cardboard: the one warm accent of the room)
  archiveSide: '#CC9260',
  softbox: '#FFF8EE',
  stand: '#2B2A44',
  glass: '#DCE0F5', // a water glass
  recLight: '#F7C98B', // the recorder's small blinking light (never the pop)
  // ---- the colour jobs
  hero: '#3F7FE0', // cobalt: HER ONLY (sweater, sleeve, her badge lanyard). Never Google, the deal or the Pentagon.
  heroDeep: '#2F66BF',
  anchor: '#2B2A44', // the dark anchor (hair, lamp shade, mic, laptop, pen, near roofs)
  pop: '#EC6B2E', // the ONE pop: the highlighted clause (band + highlighter tip) and FOR LIFE only
  hl: '#F6B892', // caption highlight box
  muted: '#7A5038', // credit lines
  white: '#FFFFFF',
};

export type CCRole = keyof typeof CC;

/** P8's sister palette "6 Dusk" (StylePentagon's DUSK roles, verbatim): saturated blue-violet with peach accents,
 *  never grey mist. Its hero (#3E5BD0) and pop (#FF7A4D) are unused: they belong to her. */
export const DUSK = {
  name: '6 Dusk',
  ink: '#1C1A26',
  hl: '#F3B27E',
  sky: '#A9B5EC',
  dusk: '#C7B9EA',
  glow: '#F7CDB3',
  halo: '#F6C29E',
  sun: '#F3B27E',
  post: '#3A3570',
  far: '#B4AEDF',
  woods: '#9893D3',
  roof: '#BEBDE8',
  well: '#7C78BA',
  facade: '#716DB0',
  win: '#55509A',
  lit: '#F7C98B',
  sideLit: '#E9AE9C',
  sideShade: '#5D599F',
  lawn: '#7C9EBB',
  courtTree: '#5D7BA6',
  walk: '#C9C7EC',
  lot: '#9D9AD3',
  lotLine: '#C3C1EC',
  car: '#38357A',
  carGlass: '#B3B9EC',
  wheel: '#1F1C33',
  road: '#B3B0E1',
  roadLine: '#F3D2B8',
  verge: '#716AAE',
  bush: '#5E5498',
  coping: '#7E6BA6',
  lip: '#2F2346',
  wall: '#5E4F8C',
  joint: '#2C2045',
};

export type DuskRole = keyof typeof DUSK;

/** THE COLD SET candidates (kit/ColdSet.tsx): one official desk, straight-on from above, edge to edge, for the deal page
 *  AND Google's page (fairness: the same ground, tone and dressing). Both in DUSK's family (blue-violet, never grey,
 *  never the hero cobalt). PICKED 'dusk' (kit/README.md "The cold set"): a mid-violet official desk (DUSK.facade, the
 *  Pentagon's own facade colour) under a cool desk lamp, the window's light falling across its lower half: it reads
 *  cold and official against her apricot home, yet belongs to this film (P7 -> P8 -> P9 stay in one Dusk family), the
 *  warm white pages read hard on it, white captions hold 4.6:1 over it, and its dark share is ~7 % (the anchor budget).
 *  'night' (rejected, kept for the comparison sheet): the same desk in DUSK.post: colder still, but ~49 % of the frame
 *  dark (L* < 30), the heaviest frame in the film for 12 s, and it breaks from both approved style frames' lightness. */
export const COLD_SETS = {
  night: {
    table: '#3A3570', // DUSK.post
    seam: '#2E2A5E',
    light: '#4B4690', // the window's light falling across the desk (one flat step up)
    pool: '#5D599F', // the desk lamp's cool pool, outer ring (DUSK.sideShade)
    poolCore: '#716DB0', // its core (DUSK.facade)
    shade: '#26234A', // flat drop shadows
    blotter: '#2B2A44',
    blotterEdge: '#55509A',
    folder: '#7C78BA', // DUSK.well
    folder2: '#9D9AD3', // DUSK.lot
    folderTab: '#B4AEDF', // DUSK.far
    lamp: '#1F1C33', // the desk lamp (DUSK.wheel)
    lampMouth: '#C9C7EC',
    pen: '#1F1C33',
    penBand: '#B4AEDF',
    glass: '#B3B9EC', // DUSK.carGlass
    water: '#8F9BD8',
    metal: '#C3C1EC', // clips, the lamp's arm highlight
    stampPad: '#1F1C33',
    ink: '#1C1A26', // DUSK.ink: the cold set's outlines
  },
  dusk: {
    table: '#716DB0',
    seam: '#625EA3',
    light: '#8C88C8',
    pool: '#A9B5EC',
    poolCore: '#C9C7EC',
    shade: '#55509A',
    blotter: '#38357A',
    blotterEdge: '#7C78BA',
    folder: '#B4AEDF',
    folder2: '#BEBDE8',
    folderTab: '#55509A',
    lamp: '#38357A',
    lampMouth: '#E6E5F7',
    pen: '#1F1C33',
    penBand: '#B4AEDF',
    glass: '#DCE0F5',
    water: '#A9B5EC',
    metal: '#E6E5F7',
    stampPad: '#1F1C33',
    ink: '#1C1A26',
  },
};
export type ColdSetName = keyof typeof COLD_SETS;
export type ColdRoles = (typeof COLD_SETS)['night'];
/** The picked cold set (kit/README.md). */
export const COLD_PICK: ColdSetName = 'dusk';
export const COLD: ColdRoles = COLD_SETS[COLD_PICK];

/** The film's one time of day (kit/README.md). Use this name for every <World sky> key: `{t: 0, tod: FILM_TOD}`
 *  (the dusk blue). Interiors and inserts pass a colour instead: `<World sky={CC.wall}>` / `COLD.table` / `CC.studio`. */
export const FILM_TOD: TodName = 'night';
export const PALETTE_NAME = CC.name;

// ---------------------------------------------------------------- the house tokens, rewritten in place

type Mut = Record<string, unknown>;

/** House palette keys -> Cream & Cobalt. The house kit's semantics, translated: the warm light family (cream, sand,
 *  tan, peach) is her room; ochre/brown is the red-brown wood; the cool family (mintPale, sage, teal, tealDark, sky) is
 *  the dusk outside her window, so a house kit piece drawn with its default colours lands in the right world. No house
 *  key maps to the hero cobalt or the pop orange (the colour jobs stay with the kit). */
export const HOUSE_PALETTE = {
  bg: CC.wall,
  card: CC.white,
  ink: CC.ink,
  sun: CC.ring, // the "disc": the golden lamp light (no sun in her evening)
  highlight: CC.hl,
  peach: CC.hl,
  salmon: CC.hl,
  cream: CC.wall,
  tan: CC.desk,
  brown: CC.trim,
  teal: CC.far,
  tealDark: CC.roofs,
  sage: CC.cloud,
  mintPale: CC.screen,
  olive: CC.roofs,
  grey: CC.wallShade,
  sky: CC.sky,
  sand: CC.wallShade,
  clay: CC.desk,
  ochre: CC.trim,
  white: CC.white,
} as const;

const TODS: TodName[] = ['day', 'golden', 'dusk', 'night', 'dawn'];

function apply() {
  Object.assign(palette as unknown as Mut, HOUSE_PALETTE);
  Object.assign(skies as unknown as Mut, {day: CC.sky, golden: CC.sky, dusk: CC.sky, night: CC.sky, deep: CC.roofs, cream: CC.wall});
  for (const n of TODS) {
    (todSky as Mut)[n] = CC.sky;
    (todTone as Mut)[n] = 'light'; // every sky of this film is the dusk blue: white captions (interiors set 'dark')
    (todSteps as Mut)[n] = {}; // one moment, no relight steps
    (todBulbHalo as Mut)[n] = CC.cloud;
  }
  Object.assign(glow as unknown as Mut, {bulbHalo: CC.cloud, lamp: CC.ring});
  Object.assign(captionTones.dark as unknown as Mut, {text: CC.ink, highlight: CC.hl, highlightText: CC.ink});
  Object.assign(captionTones.light as unknown as Mut, {text: CC.white, highlight: CC.hl, highlightText: CC.ink});
  (typeTok as unknown as Mut).color = CC.ink;
}
apply();

/** Render-time check that the house tokens really are Cream & Cobalt (empty = OK). `captured` = colours some module
 *  copied at ITS import time (e.g. Person's PERSON_BODIES[0] must equal palette.sand): pass [label, got, want]. */
export function ccProblems(captured: [string, string, string][] = []): string[] {
  const out: string[] = [];
  const eq = (label: string, got: unknown, want: string) => {
    if (String(got).toUpperCase() !== want.toUpperCase()) out.push(`${label} = ${String(got)} (want ${want})`);
  };
  for (const [k, v] of Object.entries(HOUSE_PALETTE)) eq(`palette.${k}`, (palette as unknown as Mut)[k], v);
  for (const n of TODS) {
    eq(`todSky.${n}`, todSky[n], CC.sky);
    eq(`todTone.${n}`, todTone[n], 'light');
    if (Object.keys(todSteps[n] ?? {}).length) out.push(`todSteps.${n} is not empty`);
  }
  eq('skies.night', skies.night, CC.sky);
  eq('skies.cream', skies.cream, CC.wall);
  eq('captionTones.dark.text', captionTones.dark.text, CC.ink);
  eq('captionTones.dark.highlight', captionTones.dark.highlight, CC.hl);
  eq('captionTones.light.text', captionTones.light.text, CC.white);
  eq('type.color', typeTok.color, CC.ink);
  eq('glow.lamp', glow.lamp, CC.ring);
  // the colour jobs: no house key may carry the hero or the pop
  for (const [k, v] of Object.entries(palette as unknown as Record<string, string>)) {
    if (v.toUpperCase() === CC.hero.toUpperCase()) out.push(`palette.${k} is the hero cobalt (hers only)`);
    if (v.toUpperCase() === CC.pop.toUpperCase()) out.push(`palette.${k} is the pop orange (the clause only)`);
  }
  eq('CC.cold', CC.cold, COLD.table);
  for (const [label, got, want] of captured) eq(label, got, want);
  return out;
}
