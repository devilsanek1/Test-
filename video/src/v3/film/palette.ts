// Video 3 G5: the Autumn Ember palette applied to the house theme tokens (src/lib/theme.ts) for this film's entries,
// plus the EMBER role tokens every set and prop of the film draws with (kit/README.md "Colour jobs").
//
// Import this module FIRST in every v3 film entry (src/entry-v3-film.tsx, src/entry-v3-kit.tsx), before any lib or kit
// module: it rewrites the house tokens IN PLACE at module load, so every house module evaluated after it (lib/Ink,
// lib/Fill, lib/World, lib/kit, lib/cine; their module-level colour tables included, e.g. Person's PERSON_BODIES or the
// cine TOD palettes) draws in Autumn Ember. Only theme.ts is evaluated before this body (this file imports nothing
// else), and theme.ts's own derived tables (skies, todSky, todSteps, captionTones, glow, type.color, ...) are patched
// here explicitly. Other entries (v1, v2, the G3/G4 v3 entry) are separate bundles and keep the house palette.
// `emberProblems()` re-checks all of it at render time (the KitSheet3 composition prints the result).
//
// TIME OF DAY (one for the whole film): BLUE HOUR, FIRST SNOW. Inside, the warm lamp-lit nook (peach cream wall,
// terracotta desk, golden lamp pool); outside, a saturated dusk-blue sky (#5B6A94, never grey), snow on the roofs and
// the ground, warm lit house windows, the data center's small cold lights. Every house time-of-day name maps to that
// one moment (no relight steps: nothing changes light during the film), and captions over the outdoor sky are white.

import {captionTones, glow, palette, skies, todBulbHalo, todSky, todSteps, todTone, type as typeTok, TodName} from '../../lib/theme';

// ---------------------------------------------------------------- the role tokens (StyleNook's EMBER, extended)

export const EMBER = {
  name: 'Autumn Ember',
  ink: '#2B1B0A',
  // ---- the room (warm family)
  wall: '#F6E3D4', // the page: peach cream
  reveal: '#EBC2A4', // window reveal (wall depth), attic slope
  slope: '#EBC2A4',
  beam: '#9A4A2E', // warm red-brown wood (the palette's "line" colour)
  shelf: '#E6B293',
  books: ['#F2B263', '#F4A988', '#EBC2A4', '#9A4A2E', '#D9805A', '#F6E3D4', '#C98A64'] as string[],
  desk: '#DA9670', // terracotta-apricot
  ring: '#F7C98B', // lamp pool, outer ring
  core: '#FBE6C2', // lamp pool core + the lit lamp mouth
  trim: '#9A4A2E', // window frame + mullion
  sillTop: '#F6E3D4',
  sillFront: '#EBC2A4',
  pot: '#D9805A',
  leaf: '#3F5A3C',
  mug: '#F6E3D4',
  mugBand: '#D9542F',
  tape: '#F6E3D4',
  paper: '#F6E3D4', // notebook pages, the listing photo panel
  card: '#FFF8F0', // insert cards, bubbles, calendar page (a warm white)
  screen: '#FFFFFF', // the phone screen (the one secondary light)
  newScreen: '#F4A988', // a lit laptop screen (the NEW / BETTER laptop)
  // ---- You (the protagonist: one model, kit/You.tsx)
  skin: '#D9926B',
  nail: '#F4A988',
  hair: '#3A1F16',
  sleeve: '#A8492F', // rust sweater (the POV hand's sleeve is the same sweater)
  sweaterRib: '#8E3C26',
  jeans: '#46527C',
  shoe: '#3A1F16',
  chair: '#9A4A2E',
  // ---- outside (the cold family: the night window colours)
  sky: '#5B6A94', // saturated dusk blue; white captions on it (5.3:1)
  skyLow: '#7D8AB6', // one flat step lighter: a horizon band, the bulb halo
  dc: '#46527C', // data center body
  dcSide: '#323A5E', // its shade side, floor bands, roof units
  dcDark: '#262B47', // the data center once it "goes dark" (the subject)
  led: '#D6E4FF', // its small cold server lights
  roofs: '#323A5E',
  snow: '#E6EBF7',
  frost: '#CBD5EC',
  houseLit: '#F7B65E', // warm lit house windows
  brick: '#9A4A2E', // the chip factory (warm brick, never the data center's blue)
  brickShade: '#7A3A24',
  road: '#B9C3DE', // a trodden snow road band (S10 / S14), one step under the snow
  // ---- the colour jobs
  hero: '#D9542F', // burnt orange: the laptops and the price tag (5-15 % of the frame)
  heroDeep: '#B5432A', // the hero's flat shade step (laptop deck edge, tag back)
  anchor: '#3A1F16', // the dark anchor (~5 %)
  pop: '#2F8EEB', // the ONE pop: "Add to cart", the cart badge, the tag's eyelet
  popText: '#FFFFFF',
  hl: '#F4A988', // caption highlight box
  // ---- the memory stick (kit/Memory.tsx): a gold board, near-black chips, light gold pins
  board: '#F2B263',
  boardDeep: '#D99A4E',
  chip: '#2E1D16',
  pin: '#FBE6C2',
  white: '#FFFFFF',
};

export type EmberRole = keyof typeof EMBER;

/** The film's one time of day (kit/README.md). Use this name for every <World sky> key: `{t: 0, tod: FILM_TOD}`. */
export const FILM_TOD: TodName = 'night';
export const PALETTE_NAME = EMBER.name;

// ---------------------------------------------------------------- the house tokens, rewritten in place

type Mut = Record<string, unknown>;

/** House palette keys -> Autumn Ember. The house kit's semantics, translated: the warm light family (cream, sand, tan,
 *  peach) is the room; ochre/brown is the warm red-brown wood; the cool family (mintPale, sage, teal, tealDark, sky) is
 *  the dusk-blue outside, so a house kit piece drawn with its default colours lands in the right world. */
export const HOUSE_PALETTE = {
  bg: EMBER.wall,
  card: EMBER.white,
  ink: EMBER.ink,
  sun: EMBER.ring, // the "disc": the golden lamp light (there is no sun in this film)
  highlight: EMBER.hl,
  peach: EMBER.hl,
  salmon: EMBER.hl,
  cream: EMBER.wall,
  tan: EMBER.desk,
  brown: EMBER.beam,
  teal: EMBER.dc,
  tealDark: EMBER.dcSide,
  sage: EMBER.skyLow,
  mintPale: EMBER.snow,
  olive: EMBER.dcSide,
  grey: EMBER.reveal,
  sky: EMBER.sky,
  sand: EMBER.reveal,
  clay: EMBER.desk,
  ochre: EMBER.beam,
  white: EMBER.white,
} as const;

const TODS: TodName[] = ['day', 'golden', 'dusk', 'night', 'dawn'];

function apply() {
  Object.assign(palette as unknown as Mut, HOUSE_PALETTE);
  Object.assign(skies as unknown as Mut, {day: EMBER.sky, golden: EMBER.sky, dusk: EMBER.sky, night: EMBER.sky, deep: EMBER.dcSide, cream: EMBER.wall});
  for (const n of TODS) {
    (todSky as Mut)[n] = EMBER.sky;
    (todTone as Mut)[n] = 'light'; // every sky of this film is the dusk blue: white captions (interiors set 'dark')
    (todSteps as Mut)[n] = {}; // one moment, no relight steps
    (todBulbHalo as Mut)[n] = EMBER.skyLow;
  }
  Object.assign(glow as unknown as Mut, {bulbHalo: EMBER.skyLow, lamp: EMBER.ring});
  Object.assign(captionTones.dark as unknown as Mut, {text: EMBER.ink, highlight: EMBER.hl, highlightText: EMBER.ink});
  Object.assign(captionTones.light as unknown as Mut, {text: EMBER.white, highlight: EMBER.hl, highlightText: EMBER.ink});
  (typeTok as unknown as Mut).color = EMBER.ink;
}
apply();

/** Render-time check that the house tokens really are Autumn Ember (empty = OK). `captured` = colours some module
 *  copied at ITS import time (e.g. Person's PERSON_BODIES[0] must equal palette.sand): pass [label, got, want]. */
export function emberProblems(captured: [string, string, string][] = []): string[] {
  const out: string[] = [];
  const eq = (label: string, got: unknown, want: string) => {
    if (String(got).toUpperCase() !== want.toUpperCase()) out.push(`${label} = ${String(got)} (want ${want})`);
  };
  for (const [k, v] of Object.entries(HOUSE_PALETTE)) eq(`palette.${k}`, (palette as unknown as Mut)[k], v);
  for (const n of TODS) {
    eq(`todSky.${n}`, todSky[n], EMBER.sky);
    if (Object.keys(todSteps[n] ?? {}).length) out.push(`todSteps.${n} is not empty`);
  }
  eq('skies.night', skies.night, EMBER.sky);
  eq('captionTones.dark.text', captionTones.dark.text, EMBER.ink);
  eq('captionTones.light.highlight', captionTones.light.highlight, EMBER.hl);
  eq('type.color', typeTok.color, EMBER.ink);
  eq('glow.lamp', glow.lamp, EMBER.ring);
  for (const [label, got, want] of captured) eq(label, got, want);
  return out;
}
