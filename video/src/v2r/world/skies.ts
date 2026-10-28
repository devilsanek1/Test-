// skies.ts: the film's skies, ONE per set and light state (docs/look/DIRECTION.md rule 6, CRAFT.md §g; the engine is
// src/lib/sky.tsx, how-to src/lib/SKY.md). Lanes IMPORT these and never redefine them (as rigs.ts does for the light).
//
//   S1_EVENING  S1's golden evening (the owner, v2 G4: "why is it blue sky and then suddenly abruptly orange, weird ...
//               a beautiful way to do a gentle gradient"): the caption field's mint flat through the band (y 317-556),
//               a gentle zenith, a pale warm light band, the peach horizon at y 800 behind the far roofs, the low sun's
//               warmth 340 x 204 around SUN0 (the disc stays the set's flat SunDisc, drawn on top; no halo with it).
//
// Wiring (L1, V2S1): draw <Sky spec={S1_EVENING} /> where the six flat S1_SKY steps are drawn (inside the flood's
// clip), drop the 1.6x halo, and take the far city's haze from horizonColor(S1_EVENING, SUN0.x) (the air of
// lib/depth's makeAtmosphere: the sky's lowest colour, warmed under the sun). skyProblems(S1_EVENING, {ink: CM.ink})
// is [] (band dL* 0, ink 11.3:1, the yellow-green crossing at C* 5.9). The master render keeps its dither:
// scripts/render-media.mjs --master (CRAFT §g); the check: scripts/qa/check_banding.py --region 0,0,330,712.
import {CM} from '../palette';
import {eveningSky, horizonColor} from '../../lib/sky';
import {SUN0} from './map';

/** S1's warm horizon = V2S1_set_core S1_SKY[5] (#FBD9BB), the far city's haze since L1's continuous-sky pass. */
export const S1_HORIZON = '#FBD9BB';

/** S1's evening sky (lib/sky's eveningSky): band CM.sky, horizon S1_HORIZON at y 800, the sun's warmth round SUN0. */
export const S1_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});

/** The far haze of S1's west gap (the sky's lowest colour under the sun): lib/depth's air for the far city. */
export const S1_AIR = horizonColor(S1_EVENING, SUN0.x);
