// V2S5_depth.ts (lane L4): the crane's depth (CRAFT §f; conform_L4 §10; THROUGHLINE §5b; lib/depth). ONE atmosphere:
// the air = S5's sky at the horizon (world/skies S5_AIR, the April gold), never the mint above it. The crane's planes keep
// their steps 0 / 12 / 22 / 40 / 65 % through `recede` (L* toward the air, hue converging on it or kept at a lower
// chroma: never grey, tan or olive, unlike the old sRGB mix toward the mint):
//   0 the deck (terrace, the pair)  +1 the slope's crowns  +2 the valley + the Pentagon (A from 22.43: half a step)
//   +3 the river plane and the far city's front rows  +4 the far city's back rows, the hills, the infinity strip.
import {makeAtmosphere, recede, planePalette} from '../../lib/depth';
import type {Tier} from '../../lib/tier';
import {S5_AIR} from '../world/skies';

export const S5_ATM = makeAtmosphere({name: 'v2 S5 Arlington April morning', air: S5_AIR});

export const S5_PLANE = {deck: 0, nearmid: 1, mid: 2, river: 3, cityFront: 3, far: 4} as const;

/** A colour on its plane (`tier` 'subject' takes half the step). */
export const rc = (c: string, plane: number, tier?: Tier) => recede(c, plane, S5_ATM, tier ? {tier} : {});

/** A set of materials on one plane, merged to the plane's few values (+3: 3 within dE 12; +4: 2 within 5), or to
 *  `values` values (one role: 1). */
export const rcPalette = (colors: string[], plane: number, values?: number) => planePalette(colors, plane, S5_ATM, values ? {values} : {});
