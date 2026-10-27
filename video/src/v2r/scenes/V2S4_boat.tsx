// V2S4_boat.tsx (lane L3, V2S4 WORLD part): our narrowboat gliding with the camera (screen-fixed), the bottom third:
// roof dressing on the roof edge y ~1220 (Pip rides it: V2S4_pip), the sage cabin side y 1290-1660, the hull to the
// waterline ~1700, and the near water y 1700-1920 streaming right at 2.0x.
// v1: the kit's S4Set boat layers, ported (the world build replaces them).
import React from 'react';
import {CM} from '../palette';
import {Water} from '../kit/canal/water';
import {FloatingLeaves} from '../kit/canal/life';
import {Narrowboat} from '../kit/canal/boat';

export const S4Boat: React.FC = () => (
  <>
    <Water y0={1700} y1={1940} seed="s4near" bankShade={0} ripples={14} glints={8} near={2.2} wake={{x: () => 1240, y: 1712, dir: -1, len: 400}} />
    <FloatingLeaves y0={1740} y1={1900} n={8} size={20} seed="s4fl" current={18} />
    <Narrowboat x={-420} water={1712} len={1780} h={370} dir={-1} seed="s4boat" cabin={CM.sage} topView={44} hullK={0.11} roofItems panel fenders chimney={0.62} />
  </>
);
