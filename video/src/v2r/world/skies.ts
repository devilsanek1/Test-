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
import {SUN0, SUN8} from './map';

/** S1's warm horizon = V2S1_set_core S1_SKY[5] (#FBD9BB), the far city's haze since L1's continuous-sky pass. */
export const S1_HORIZON = '#FBD9BB';

/** S1's evening sky (lib/sky's eveningSky): band CM.sky, horizon S1_HORIZON at y 800, the sun's warmth round SUN0. */
export const S1_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});

/** The far haze of S1's west gap (the sky's lowest colour under the sun): lib/depth's air for the far city. */
export const S1_AIR = horizonColor(S1_EVENING, SUN0.x);

// ---------------------------------------------------------------- S8 (lane L6): her lane at sunset, looking west
// S8_EVENING  the same evening as S1, later (the sunset state S7 shares, A5): the caption field's mint flat through the
//             band, a pale warm light band at y ~624 over the far rows, the sunset band CM.bandSunset (#F3C6A6) as the
//             horizon at y 680 (behind the far rows: it shows in the gaps between the gasholders, the viaduct and the
//             far roofs), the low sun's warmth 200 x 60 centred 35 px under SUN8 (420, 625), low and wide, hugging the
//             skyline (its top stays under the mint: skyProblems [] with the yellow-green crossing at C* 5.7). The disc
//             stays V2S8_set's flat S8Sky disc, drawn on top; no halo.
// S8_AIR      the far haze of the lane (the sky's lowest colour warmed under SUN8): lib/depth's air for S8's far planes.
// Wired (L6, V2S8_set S8Sky): <Sky spec={S8_EVENING} /> under the set; it contracts into SUN0 at the un-build (the
// loop's mirror of S1's flood), V2S8_set S8SkyExit.
export const S8_EVENING = eveningSky({band: CM.sky, horizon: CM.bandSunset, horizonY: 680, sun: {x: SUN8.x, y: SUN8.y + 35, rx: 200, ry: 60}, bottom: 800});

/** The far haze of S8's lane (the sky's lowest colour under SUN8): lib/depth's air for the far rows and the far bank. */
export const S8_AIR = horizonColor(S8_EVENING, SUN8.x);
