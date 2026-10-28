// V2S5_depth.ts (lane L4): the crane's depth (CRAFT §f; conform_L4 §10; THROUGHLINE §5b; lib/depth). ONE atmosphere:
// the air = S5's sky at the horizon (world/skies S5_AIR, the April gold), never the mint above it. The crane's planes keep
// their steps 0 / 12 / 22 / 40 / 65 % through `recede` (L* toward the air, hue converging on it or kept at a lower
// chroma: never grey, tan or olive, unlike the old sRGB mix toward the mint):
//   0 the deck (terrace, the pair)  +1 the slope's crowns  +2 the valley + the Pentagon (A from 22.43: half a step)
//   +3 the river plane and the far city's front rows  +4 the far city's back rows, the hills, the infinity strip.
import {makeAtmosphere, recede, planePalette} from '../../lib/depth';
import {CM} from '../palette';
import {mix} from '../kit/dc/core';
import type {Tier} from '../../lib/tier';
import {S5_AIR} from '../world/skies';

export const S5_ATM = makeAtmosphere({name: 'v2 S5 Arlington April morning', air: S5_AIR});

export const S5_PLANE = {deck: 0, nearmid: 1, mid: 2, river: 3, cityFront: 3, far: 4} as const;

/** A colour on its plane (`tier` 'subject' takes half the step). */
export const rc = (c: string, plane: number, tier?: Tier) => recede(c, plane, S5_ATM, tier ? {tier} : {});

/** A set of materials on one plane, merged to the plane's few values (+3: 3 within dE 12; +4: 2 within 5), or to
 *  `values` values (one role: 1). */
export const rcPalette = (colors: string[], plane: number, values?: number) => planePalette(colors, plane, S5_ATM, values ? {values} : {});

/** The dc kit's `atm(c, d)` / `atmShade(c, d)` signatures through S5's atmosphere (the forks V2S5_valley and
 *  V2S5_pentagon alias them in, so their bodies stay the kit's): the colour receded to plane d; a SHADE also leans
 *  toward the cool shade as it recedes (the kit's 0 / 10 / 20 / 30 / 40 %), then recedes. `tier` 'subject': half the
 *  step (the Pentagon). */
const SHADE_LEAN = [0, 0.1, 0.2, 0.3, 0.4];
export const rcAtm = (c: string, d: number, tier?: Tier) => (d <= 0 ? c : rc(c, d, tier));
export const rcShade = (c: string, d: number, tier?: Tier) => (d <= 0 ? c : rc(mix(c, CM.shadeCool, SHADE_LEAN[Math.min(4, Math.round(d))]), d, tier));
