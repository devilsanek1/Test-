// skies.ts: the film's skies, ONE per set and light state (docs/look/DIRECTION.md rule 6, CRAFT.md §g; the engine is
// src/lib/sky.tsx, how-to src/lib/SKY.md). Lanes IMPORT these and never redefine them (as rigs.ts does for the light).
//
//   S1_EVENING  S1's golden evening (the owner, v2 G4: "why is it blue sky and then suddenly abruptly orange, weird ...
//               a beautiful way to do a gentle gradient"): the caption field's mint flat through the band (y 317-556),
//               a gentle zenith, a pale warm light band, the peach horizon at y 800 behind the far roofs, the low sun's
//               warmth 340 x 153 around SUN0, low and wide (the disc stays the set's flat SunDisc, drawn on top; no halo
//               with it).
//
// Wired (L1, V2S1_sky.tsx): <Sky spec={S1_EVENING} /> where the six flat S1_SKY steps were (inside the flood's clip),
// no 1.6x halo, and the far city's haze from horizonColor(S1_EVENING, SUN0.x) (the air of
// lib/depth's makeAtmosphere: the sky's lowest colour, warmed under the sun). skyProblems(S1_EVENING, {ink: CM.ink})
// is [] (band dL* 0, ink 11.3:1, the yellow-green crossing at C* 5.9 on the ramp, 6.2 in the sun's warmth). The master
// render keeps its dither: scripts/render-media.mjs --master (CRAFT §g); the check on S1's OPEN sky (3.0 s):
// scripts/qa/check_banding.py --region 0,560,250,712 (the west gap), 400,0,1080,170 (the zenith), 0,270,1080,560 (the
// band); 0,0,330,712 holds the pale cloud strip and the far tower, which read as steps.
import {CM} from '../palette';
import {eveningSky, horizonColor} from '../../lib/sky';
import {SUN0} from './map';

/** S1's warm horizon = V2S1_set_core S1_SKY[5] (#FBD9BB), the far city's haze since L1's continuous-sky pass. */
export const S1_HORIZON = '#FBD9BB';

/** S1's evening sky (lib/sky's eveningSky): band CM.sky, horizon S1_HORIZON at y 800, the sun's warmth round SUN0. */
export const S1_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});

/** The far haze of S1's west gap (the sky's lowest colour under the sun): lib/depth's air for the far city. */
export const S1_AIR = horizonColor(S1_EVENING, SUN0.x);

/** S5's April morning over Arlington (lane L4; S6 may share it: the set's sky): the caption mint flat through the band,
 *  the gentle zenith and pale light band of `eveningSky`, the April gold (CM.bandGold) at the horizon y 750 behind the
 *  cloud bank and the far city, the morning sun's warmth low and wide round the sun. The crane moves the sun across the
 *  sky (SUN1 (250, 650) in the slot at the start -> (1058.5, 646) cut by the right edge at the end): pass its screen spot
 *  each frame (`s5Sky`; animating the sun, never the keys, costs nothing). */
export const S5_HORIZON = CM.bandGold;
export const s5Sky = (sun: {x: number; y: number}) => eveningSky({band: CM.sky, horizon: S5_HORIZON, horizonY: 750, sun: {x: sun.x, y: sun.y, rx: 230}});
/** S5's sky at the end of the crane (the landing hold): the reference for the checks. */
export const S5_SKY = s5Sky({x: 1058.5, y: 646});
/** The air of S5's planes (lib/depth makeAtmosphere): the sky's lowest colour across the view (the April gold). */
export const S5_AIR = horizonColor(S5_SKY, 540);
