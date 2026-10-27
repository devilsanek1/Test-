// V2S1 helper (lane L1): the sky flood and the frame-0 sun. The World sky stays paper (frame 0 is ink on paper); the
// mint sky and the gold band flood out of SUN0 as one growing disc (f2-f5, TREATMENT section 4), ahead of the kit's own
// cascade (lib/exit Look). Before the flood the sun is half-coloured (ref 1's sun on the bare page) with a loose ink
// ring for its other half; from the flood on, the set's SunDisc carries it.
import React, {useId} from 'react';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {useTime} from '../../lib/time';
import {CM, INK_PX} from '../palette';
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

/** Frame 0's sun: the lower-left half in colour, a loose ink ring for the rest (only before the flood reaches it). */
export const SunHalf: React.FC = () => {
  const t = useTime();
  if (t >= S1_FLOOD.t0) return null;
  const {x, y, r} = MAP.SUN0;
  // a half disc cut on a diagonal (the colour already pouring in from the low-left)
  const a0 = (200 * Math.PI) / 180;
  const half = `M${x + r * Math.cos(a0 - Math.PI)} ${y + r * Math.sin(a0 - Math.PI)}A${r} ${r} 0 0 1 ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)}Z`;
  const ring = `M${x + r * 1.02 * Math.cos(a0 + 0.1)} ${y + r * 1.02 * Math.sin(a0 + 0.1)}A${r * 1.02} ${r * 1.02} 0 0 1 ${x + r * 1.02 * Math.cos(a0 - Math.PI - 0.25)} ${y + r * 1.02 * Math.sin(a0 - Math.PI - 0.25)}`;
  return (
    <>
      <Fill d={half} color={CM.sun} offset={false} lookExempt exit={false} seed="s1sunhalf" />
      <Ink d={ring} width={INK_PX.mid} seed="s1sunring" exit={false} />
    </>
  );
};
