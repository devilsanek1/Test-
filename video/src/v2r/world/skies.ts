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
import {eveningSky, horizonColor, oklabToLch, toOklab} from '../../lib/sky';
import {SUN0} from './map';

/** S1's warm horizon = V2S1_set_core S1_SKY[5] (#FBD9BB), the far city's haze since L1's continuous-sky pass. */
export const S1_HORIZON = '#FBD9BB';

/** S1's evening sky (lib/sky's eveningSky): band CM.sky, horizon S1_HORIZON at y 800, the sun's warmth round SUN0. */
export const S1_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});

/** The far haze of S1's west gap (the sky's lowest colour under the sun): lib/depth's air for the far city. */
export const S1_AIR = horizonColor(S1_EVENING, SUN0.x);

/** S2's evening sky (lane L2; the same golden evening as S1, looking north from the south towpath): band CM.sky flat
 *  through the caption band, the horizon at the wall's vanishing height (y 700, behind the tiers: the light band and the
 *  horizon's warmth show only over the far tiers near the vanishing point, right), the low sun OFF-SCREEN LEFT (west):
 *  its warmth hugs the left horizon behind the tiers, low and wide. S2 is the film's one shot with no disc. */
const S2_LIGHT = (() => {
  const b = oklabToLch(toOklab(CM.sky));
  const hz = oklabToLch(toOklab(S1_HORIZON));
  // eveningSky's default light key at a lower chroma (0.010, not 0.014): S2's ramp is short (556 -> 700), and with the
  // sun's warmth at the left the default crossed yellow-green at C* 7.3; at 0.010 it crosses at ~6.6 (skyProblems [])
  return {l: Math.max(b.l, hz.l) + 0.022, c: 0.01, h: hz.h + 8};
})();
export const S2_EVENING = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 700, light: S2_LIGHT, sun: {x: -260, y: 700, rx: 480}});

/** S2's air for lib/depth's makeAtmosphere: the sky's lowest colour behind the far end of the canal (the VP side, away
 *  from the sun). */
export const S2_AIR = horizonColor(S2_EVENING, 1000);
