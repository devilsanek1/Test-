// V2S1 helper (lane L1): the sky flood. The World sky stays paper (frame 0 is pale shapes on paper); ONE continuous sky
// (S1_SKY: the caption field's mint, then five flat steps to the warm horizon) floods out of SUN0 as one growing disc
// (f2-f5, TREATMENT section 4), ahead of the kit's own cascade (lib/exit Look). The sun itself (frame 0's half-coloured
// disc too) is the set's SunDisc (V2S1_set_far), drawn behind the far roofs.
import React, {useId} from 'react';
import {Fill} from '../../lib/Fill';
import {S1_SKY, S1_SKY_Y} from './V2S1_set_core';
import {useTime} from '../../lib/time';
import {CM} from '../palette';
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
        {S1_SKY.map((c, i) => {
          const y0 = i === 0 ? -120 : S1_SKY_Y[i - 1];
          const y1 = i < S1_SKY_Y.length ? S1_SKY_Y[i] + 1 : 1120;
          return <Fill key={i} rect={[-120, y0, 1320, y1 - y0]} color={c} offset={false} lookExempt exit={false} seed={`s1sky${i}`} />;
        })}
      </g>
    </>
  );
};
