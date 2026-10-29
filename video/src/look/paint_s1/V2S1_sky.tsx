// V2S1 helper (lane L1): the sky flood. The World sky stays paper (frame 0 is pale shapes on paper); ONE continuous,
// gentle, dithered sky (lib/sky <Sky>, the S1_EVENING preset of world/skies.ts; the owner's "find a beautiful way to do
// a gentle gradient"; CRAFT §g) floods out of SUN0 as one growing disc (f2-f5, TREATMENT section 4), ahead of the kit's
// own cascade (lib/exit Look). The sun's disc (frame 0's half-coloured one too) is the set's flat SunDisc
// (V2S1_set_far), drawn behind the far roofs; the sky carries its warmth, so no halo.
import React, {useId} from 'react';
import {Sky, eveningSky, type SkySpec} from '../../lib/sky';
import {S1_EVENING, S1_HORIZON} from '../../v2r/world/skies';
import {CM10B} from './palette_10b';
import {useSwitches} from './switches';
import {PaintedLayer} from '../../lib/paint';
import {PAINT} from './paint_set';

/** (the look test's 10b palette) S1's evening sky with 10b's calmer mint band (C* 10, v2 13): v2's S1_EVENING recipe
 *  (world/skies.ts) on 10b's sky; the horizon, the sun's warmth and so S1's air stay v2's. */
export const S1_EVENING_10B: SkySpec = eveningSky({band: CM10B.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: MAP.SUN0.x, y: MAP.SUN0.y, rx: 340}});
/** The S1 sky in effect. */
export const s1Sky = (palette10b: boolean): SkySpec => (palette10b ? S1_EVENING_10B : S1_EVENING);
import {useTime} from '../../lib/time';
import * as MAP from '../../v2r/world/map';

const S1_FLOOD = MAP.S1_CLOCK.flood;
/** Sky flood: radius px/s from SUN0 (covers the frame's far corner, 1512 px, by f5). */
const SKY_SPEED = 26000;

export const SkyFlood: React.FC = () => {
  const t = useTime();
  const {palette10b} = useSwitches();
  const id = 'sk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = (t - S1_FLOOD.t0) * SKY_SPEED;
  if (r <= 0) return null;
  const {x, y} = MAP.SUN0;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <circle cx={x} cy={y} r={Math.min(r, 2400)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {/* ONE continuous, gentle, dithered sky (lib/sky; the film's preset in world/skies.ts; CRAFT §g): the caption
            field flat through the band, a pale warm light band, the warm horizon, the low sun's warmth round SUN0 */}
        {/* (the paint test) the painted sky in the flood's clip, the same disc: it floods in painted */}
        <PaintedLayer piece={PAINT.sky}>
          <Sky spec={s1Sky(palette10b)} />
        </PaintedLayer>
      </g>
    </>
  );
};
