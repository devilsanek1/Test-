// FLOW v5, BREEZE: the cast. Today's 20-30-year-olds in New York and Los Angeles, never children, never a costume. The
// "you" wears the film's one saturated colour (her long coat); each stranger wears one calmer related colour, so a
// crowd never becomes a field of saturated coats; hair and legs are the dark accent; skin across the range.
import {BUILDS} from './body';
import {CUTS} from './hair';
import type {Look} from './figure';

export const HER: Look = {
  id: 'her',
  b: BUILDS.her,
  skin: '#E9BC9E',
  hair: '#2A1F28',
  legs: '#2B2430',
  cut: CUTS.long,
  outfit: {kind: 'coat', color: '#C42E3C', hem: 764},
  view: 'q',
  pose: {kind: 'stand'},
};

/** Her friend: a big shirt, its centre front tucked into wide high-waisted trousers in a deep shade of its colour, a
 *  hand on her hip; natural coily hair. */
export const W2: Look = {
  id: 'w2',
  b: BUILDS.womanSoft,
  skin: '#7E4E37',
  hair: '#221A1C',
  legs: '#2A2630',
  cut: CUTS.curls,
  outfit: {kind: 'shirtTrousers', color: '#C9805E', bottom: '#674332', waist: 462, hemW: 92},
  arm: 'akimbo',
  view: 'q',
  pose: {kind: 'stand', wide: 22},
};

/** A cropped knit over a long bias skirt, seen from behind; the calm bun. */
export const W3: Look = {
  id: 'w3',
  b: BUILDS.womanSlim,
  skin: '#F1D3BD',
  hair: '#1E1A22',
  legs: '#2C2731',
  cut: CUTS.bun,
  outfit: {kind: 'knitSkirt', color: '#E2C7CB', bottom: '#8F5E79', waist: 430, hem: 840, w: 270},
  view: 'b',
  pose: {kind: 'stand'},
};

/** A long camel overcoat open over a dark column, walking into the wind; a short crop. */
export const M1: Look = {
  id: 'm1',
  b: BUILDS.manAthletic,
  skin: '#A06B4C',
  hair: '#1F1A1A',
  legs: '#2A2731',
  cut: CUTS.crop,
  outfit: {kind: 'overcoat', color: '#B98B5E', inner: '#2E2A35', hem: 770},
  view: 'p',
  pose: {kind: 'walk', phase: 0.3},
};

/** A big short-sleeved shirt worn loose over wide trousers in a deep shade of its blue, a hand in a pocket; a longer
 *  cut swept back. */
export const M2: Look = {
  id: 'm2',
  b: BUILDS.manSlim,
  skin: '#DDB08C',
  hair: '#2B211D',
  legs: '#2A2731',
  cut: CUTS.flowm,
  outfit: {kind: 'shortShirt', color: '#8E9DB4', bottom: '#3F4A59', hem: 600, hemW: 100, waist: 536},
  arm: 'pocket',
  view: 'q',
  pose: {kind: 'stand', wide: 26},
};

/** A short boxy chore jacket over wide trousers in a deep shade of its brick, standing in profile, the hands in its
 *  pockets; a fade. */
export const M3: Look = {
  id: 'm3',
  b: BUILDS.manBroad,
  skin: '#5E3B2C',
  hair: '#161314',
  legs: '#26232A',
  cut: CUTS.fade,
  outfit: {kind: 'jacket', color: '#A8584A', bottom: '#633A32', hem: 548, hemW: 96},
  view: 'p',
  pose: {kind: 'stand', wide: 24},
};

export const CAST: Look[] = [HER, W2, W3, M1, M2, M3];
/** Statures (cm), for placing the cast at one scale. */
export const STATURE: Record<string, number> = {her: 168, w2: 164, w3: 160, m1: 184, m2: 178, m3: 186};
