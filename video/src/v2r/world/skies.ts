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
import {SUN0, SUN2} from './map';

/** S1's warm horizon = V2S1_set_core S1_SKY[5] (#FBD9BB), the far city's haze since L1's continuous-sky pass. */
export const S1_HORIZON = '#FBD9BB';

/** S1's evening sky (lib/sky's eveningSky): band CM.sky, horizon S1_HORIZON at y 800, the sun's warmth round SUN0. */
export const S1_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});

/** The far haze of S1's west gap (the sky's lowest colour under the sun): lib/depth's air for the far city. */
export const S1_AIR = horizonColor(S1_EVENING, SUN0.x);

// ---------------------------------------------------------------- L5: S6 (Arlington, April morning) and S7 (the forecourt at sunset)
// Both suns sit at SUN2 (260, 620) r 45 (the S6 -> S7 push-through keeps its screen spot): high in the ramp, 64 px under
// the caption band and 216 / 277 px over the horizon. A sun warmth there (any rx, strength 0.35-1, centre 620-660)
// composites the peach over the mint and crosses yellow-green at C* 10-13 (skyProblems: khaki; measured 2026-10-28), so
// these two skies carry NO sun warmth: the ramp's light band and warm horizon are the sky's warmth (khaki C* 5.8-5.9),
// and the disc stays the scene's own flat shape on top, no halo.

/** S6's April morning horizon (LIGHT.april's gold band): behind the gate's facade band at the eye-level horizon y 836. */
export const S6_HORIZON = CM.bandGold;
/** S6's April morning sky: the caption field's mint flat through the band, a pale light band, the gold horizon at y 836
 *  (hidden by the facade band from y 705: the visible sky above it carries the light band); SUN2 (the east = screen
 *  left: the gate looks south) sits on the ramp. */
export const S6_MORNING = eveningSky({band: CM.sky, horizon: S6_HORIZON, horizonY: 836, sun: null});
/** The far air of S6 (the lawn's cherries and the promenade beyond the fence): lib/depth's air. */
export const S6_AIR = horizonColor(S6_MORNING, SUN2.x);

/** The London sunset horizon S7 and S8 share (one light: TREATMENT section 8 A5; LIGHT.sunset's band). */
export const SUNSET_HORIZON = CM.bandSunset;
/** S7's sunset: the eye-level horizon of the forecourt's camera at y 897 (1.6 m eye height at the wing's 72 px/m, base
 *  y 1012), hidden by the wing and the far roofs; the west gap past the wing's corner shows the light band and the warm
 *  ramp under SUN2 (screen left = west). */
export const S7_SUNSET = eveningSky({band: CM.sky, horizon: SUNSET_HORIZON, horizonY: 897, sun: null});
/** The far air of S7's west gap (the far roofs): lib/depth's air. */
export const S7_AIR = horizonColor(S7_SUNSET, SUN2.x);
