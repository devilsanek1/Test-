// V2S4_wcanal.tsx (lane L3, V2S4 WORLD helpers): THE CANAL STRIP between her coping and our boat (the 1.0x canal plane,
// plane px at the 17.96 pose; y 1082 -> under our boat's roof at ~1222). TIER C. The water itself is the isolated flat
// placeholder (V2S4_water S4Water 'canal': no motion of its own, no styling spent until lib/water lands); on it two
// ducks paddling west (the shot's one small water life, conform_L3 §2) and the angler's line and float, still (no
// nibble, no ring: the life budget). No reflection of her (no teal off her, no dark water behind her).
import React from 'react';
import {CM} from '../palette';
import {Batch, Paint, P} from '../kit/canal/core';
import {Ducks} from '../kit/canal/life';
import {PLANE_X} from './V2S4_wcore';
import {rodTip} from './V2S4_wcast';
import {S4Water, S4_WATER} from './V2S4_water';

const [X0, X1] = PLANE_X(1);
const FLOAT = S4_WATER.standing[0];

/** The angler's line (a hairline that IS the thing, in the water's own shade: never a dark line) and the float. */
function floatBatch(): Batch {
  const b = new Batch();
  const [tx, ty] = rodTip();
  const fx = FLOAT.x;
  const fy = FLOAT.y;
  b.fill(CM.waterDeep, `M${P(fx - 9, fy + 3)}Q${P(fx, fy + 0.6)} ${P(fx + 9, fy + 3)}Q${P(fx, fy + 5.4)} ${P(fx - 9, fy + 3)}Z`);
  b.poly(CM.box, [[fx - 2.6, fy - 9], [fx + 2.6, fy - 9], [fx + 3.4, fy + 1], [fx - 3.4, fy + 1]]);
  b.poly(CM.paper, [[fx - 3.4, fy - 1], [fx + 3.4, fy - 1], [fx + 2.4, fy + 3], [fx - 2.4, fy + 3]]);
  b.ink(`M${P(tx, ty)}Q${P(tx - 4, (ty + fy) / 2)} ${P(fx, fy - 9)}`, 1.2, CM.waterDeep, 0, {thing: true, tone: CM.water});
  return b;
}
const FLOAT_B = floatBatch();

export const CanalPlane: React.FC = () => (
  <>
    <S4Water part="canal" />
    <Paint b={FLOAT_B} seed="s4float" misreg={false} />
    <Ducks ducks={[{x: 1040, y: 1168, size: 32, vx: -24, drake: true}, {x: 1096, y: 1184, size: 29, vx: -24}]} seed="s4ducks" x0={X0} x1={X1} />
  </>
);
