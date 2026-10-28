// V2S7_float.tsx (lane L5): one PLANE GROUP of V2S7 under the shot's camera (DIRECTION rule 8; lib/depth parallax;
// S1's V2S1_float the model). V2S7.tsx holds ONE XG for the story push (V2S7_pip s7PushAt: the 4 % push about B's
// centre 28.40-30.04, identical for every plane: a story move, never a float); inside it each plane's group adds its
// own share of the parallax float (s7PlaneOffset: the legs 30.20-32.50, home at 30.04 and from 32.50), sub-pixel,
// never rounded; translate(0 0) at rest (the same tree every frame: nothing remounts). The sky and SUN2 never float;
// the captions are the Film's (untouched).
import React from 'react';
import {useTime} from '../../lib/time';
import {s7PlaneOffset, S7_T0} from './V2S7_pip';

export const S7Plane: React.FC<{plane: number; children?: React.ReactNode}> = ({plane, children}) => {
  const t = useTime();
  const o = s7PlaneOffset(S7_T0 + t, plane);
  return <g transform={`translate(${o.x.toFixed(3)} ${o.y.toFixed(3)})`}>{children}</g>;
};
