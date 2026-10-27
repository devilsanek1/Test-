// V2S1 helper (lane L1): the sky flood and the frame-0 sun. The World sky stays paper (frame 0 is ink on paper); the
// mint sky and the gold band flood out of SUN0 as one growing disc (f2-f5, TREATMENT section 4), ahead of the kit's own
// cascade (lib/exit Look). Before the flood the sun is half-coloured (the colour already pouring in from the low left)
// and its other half a flat PALE shape like everything else (no ink ring: no line on anything but the subject at f0);
// from the flood on, the set's SunDisc carries it.
import React, {useId} from 'react';
import {Fill} from '../../lib/Fill';
import {mixHex} from '../../lib/light';
import {S1_PALE} from './V2S1_clock';
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
        <Fill rect={[-120, -120, 1320, 720]} color={CM.sky} offset={false} lookExempt exit={false} seed="s1sky" />
        <Fill rect={[-120, 600, 1320, 520]} color={CM.bandGold} offset={false} lookExempt exit={false} seed="s1band" />
      </g>
    </>
  );
};

/** Frame 0's sun: the lower-left half in colour, the rest pale (only before the flood reaches it). */
export const SunHalf: React.FC = () => {
  const t = useTime();
  if (t >= S1_FLOOD.t0) return null;
  const {x, y, r} = MAP.SUN0;
  // a half disc cut on a diagonal (the colour already pouring in from the low-left)
  const a0 = (200 * Math.PI) / 180;
  const half = `M${x + r * Math.cos(a0 - Math.PI)} ${y + r * Math.sin(a0 - Math.PI)}A${r} ${r} 0 0 1 ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)}Z`;
  const disc = `M${x - r} ${y}A${r} ${r} 0 1 0 ${x + r} ${y}A${r} ${r} 0 1 0 ${x - r} ${y}Z`;
  return (
    <>
      <Fill d={disc} color={mixHex(CM.sun, CM.white, S1_PALE)} offset={false} lookExempt exit={false} seed="s1sunpale" />
      <Fill d={half} color={CM.sun} offset={false} lookExempt exit={false} seed="s1sunhalf" />
    </>
  );
};
