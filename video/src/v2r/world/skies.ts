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
import {SUN0, SUN2, SUN8} from './map';

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

// ---------------------------------------------------------------- L5: S6 (Arlington, April morning) and S7 (the forecourt at sunset)
// Both suns sit at SUN2 (260, 620) r 45 (the S6 -> S7 push-through keeps its screen spot): high in the ramp, 64 px under
// the caption band and 151 / 277 px over the horizon. A sun warmth there (any rx, strength 0.35-1, centre 620-660)
// composites the peach over the mint and crosses yellow-green at C* 10-13 (skyProblems: khaki; measured 2026-10-28), so
// these two skies carry NO sun warmth: the ramp's light band and warm horizon are the sky's warmth (khaki C* 5.8-5.9),
// and the disc stays the scene's own flat shape on top, no halo.

/** S6's April morning horizon (LIGHT.april's gold band): behind the gate's facade band at the eye-level horizon y 771
 *  (V2S6_rig's camera: eye 1.6 m; the kit's 836 is the facade's foot). */
export const S6_HORIZON = CM.bandGold;
/** S6's April morning sky: the caption field's mint flat through the band, a pale light band, the gold horizon at y 771
 *  (hidden by the facade band from y 705: the visible sky above it carries the light band); SUN2 (the east = screen
 *  left: the gate looks south) sits on the ramp. */
export const S6_MORNING = eveningSky({band: CM.sky, horizon: S6_HORIZON, horizonY: 771, sun: null});
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

// ---------------------------------------------------------------- L4: S5 (Arlington, the crane, April morning)
/** S5's April morning horizon: the far city's and the hero bank's foot at the end horizon y 750 (the same gold as S6). */
export const S5_HORIZON = CM.bandGold;
/** S5's April morning sky, ONE screen-space gradient behind the whole crane (the sky is at infinity: the dolly never
 *  moves it; the far plane's 12 px drop and its pan are the far city's, and the gradient is level): the caption mint
 *  flat through the band, the pale light band, the gold at y 750. NO sun warmth (as S6): a warmth round the sun at
 *  y 646-650 crosses yellow-green at C* 11.5 (khaki; skyProblems, rx 230, measured 2026-10-28); the light band and the
 *  gold horizon are the sky's warmth and the disc stays the set's flat shape, no halo. skyProblems(S5_SKY) = [].
 *  Above y 556 it is S6_MORNING exactly (the same band and zenith), so the S5 -> S6 wipe (its tree clipped at y >= 560)
 *  shows one sky. */
export const S5_SKY = eveningSky({band: CM.sky, horizon: S5_HORIZON, horizonY: 750, sun: null});
/** The air of S5's planes (lib/depth makeAtmosphere): the sky's lowest colour (#F6D9BC). */
export const S5_AIR = horizonColor(S5_SKY);

// ---------------------------------------------------------------- S8 (lane L6): her lane at sunset, looking west
// S8_EVENING  the same evening as S1, later (the sunset state S7 shares, A5): the caption field's mint flat through the
//             band, a pale warm light band at y ~624 over the far rows, SUNSET_HORIZON (CM.bandSunset #F3C6A6) as the
//             horizon at y 680 (behind the far rows: it shows in the gaps between the gasholders, the viaduct and the
//             far roofs), the low sun's warmth 200 x 50 centred at y 650, 10 px under the SETTING disc (V2S8_set S8_SUN
//             (420, 640) r 40, half behind the far mill's level roofline at y 646; critic_L6 MUST 1), its top at y 600
//             (under the mint: skyProblems [] with the yellow-green crossing at C* 5.7, where a warmth centred on the
//             disc higher up crossed at 11; cf. L5's note above for S6 / S7), so the disc sits in peach (C* 13-33 at
//             y 620-650). The disc stays V2S8_set's flat S8Sky disc, drawn on top; no halo.
// S8_AIR      the far haze of the lane (the sky's lowest colour warmed under SUN8): lib/depth's air for S8's far planes.
// Wired (L6, V2S8_set S8Sky): <Sky spec={S8_EVENING} /> under the set; it contracts into SUN0 at the un-build (the
// loop's mirror of S1's flood).
export const S8_EVENING = eveningSky({band: CM.sky, horizon: SUNSET_HORIZON, horizonY: 680, sun: {x: SUN8.x, y: 650, rx: 200, ry: 50}, bottom: 800});

/** The far haze of S8's lane (the sky's lowest colour under SUN8): lib/depth's air for the far rows and the far bank. */
export const S8_AIR = horizonColor(S8_EVENING, SUN8.x);

// ---------------------------------------------------------------- L3: S3 (her window, a flash-forward in S8's sunset light)
// S3_SUNSET  her terrace across the water at sunset (looking north): the caption field's mint flat through the band, a
//            pale warm light band at y ~635 over her roofline, SUNSET_HORIZON (#F3C6A6, S7's and S8's) as the horizon at
//            y 700, the bottom of the sky seen in the west gap past her end wall (the far roofs, the gasholder and the
//            viaduct hide the rest), and S8's low, wide warmth (200 x 60) centred 35 px under SUN3 (96, 652) r 46
//            (V2S3_tWest SUN3), hugging the west gap's skyline: the sun sets in sky that agrees with it. skyProblems [] with
//            the yellow-green crossing at C* 5.75 (a warmth centred on the disc this high in the ramp turns khaki: L5's
//            note above). The disc stays V2S3's flat S3Sun shape on top, no halo.
// S3_AIR     the far haze of the west gap (the sky's lowest colour warmed under SUN3): lib/depth's air for S3's far planes.
// Wired (L3, V2S3.tsx): <Sky spec={S3_SUNSET} /> first in the sky plane (no float), the World's flat steps gone.
export const S3_SUNSET = eveningSky({band: CM.sky, horizon: SUNSET_HORIZON, horizonY: 700, sun: {x: 96, y: 687, rx: 200, ry: 60}});

/** The far haze of S3's west gap (the sky's lowest colour under SUN3): lib/depth's air for the far city and the roofs. */
export const S3_AIR = horizonColor(S3_SUNSET, 96);
