// V2S1 helper (lane L1): the sky flood. The World sky stays paper (frame 0 is pale shapes on paper); ONE continuous,
// gentle, dithered sky (lib/sky <Sky>, the S1_EVENING preset of world/skies.ts; the owner's "find a beautiful way to do
// a gentle gradient"; CRAFT §g) floods out of SUN0 as one growing disc (f2-f5, TREATMENT section 4), ahead of the kit's
// own cascade (lib/exit Look). The sun's disc (frame 0's half-coloured one too) is the set's flat SunDisc
// (V2S1_set_far), drawn behind the far roofs; the sky carries its warmth, so no halo.
import React, {useId} from 'react';
import {Sky} from '../../lib/sky';
import {S1_EVENING} from '../world/skies';
import {useTime} from '../../lib/time';
import * as MAP from '../world/map';

const S1_FLOOD = MAP.S1_CLOCK.flood;
/** Sky flood: radius px/s from SUN0 (covers the frame's far corner, 1512 px, by f5). */
const SKY_SPEED = 26000;

export const SkyFlood: React.FC = () => {
  const t = useTime();
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
        <Sky spec={S1_EVENING} />
      </g>
    </>
  );
};
