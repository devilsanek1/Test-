// V2S5_start.tsx (lane L4): the START-only layers in screen space, given the crane progress p: S5StartBack (behind
// every plane) and S5StartFore (over everything): the warm-dark canopy and the near foreground of the held start
// (20.55-21.30) that drop out down-left as the crane rises; gone by the end.
//   S5StartFore  the canopy tree's ROOT FOOT cut by the bottom-left corner (conform_L4 §4: the start's bottom third holds
//                things): ONE calm warm-dark mass (tier C, plane -2: a value step under the deck, never near-black; two
//                flat tones, its top lit by the slot's sun), lying on the shaded paving with its short cast to the right
//                (the rig's family, the sun in the slot at the upper left). Held through the start, it drops out down-left
//                as the crane rises (p 0 -> 0.5, <= 13 px/f) and is gone before the swap (22.12) shows the end's terrace.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports the slot files).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {fromLch, Shadow, ShadowLayer} from '../../lib/light';
import {smoothClosed, type Pt} from '../kit/dc/core';
import {rc} from './V2S5_depth';

export const S5StartBack: React.FC<{p: number}> = () => null;

/** The root's two flat tones (plane -2 of a warm bark: L* 50 mass, L* 59 lit top; dL* 9 inside the plane). */
export const ROOT5 = {
  mass: rc(fromLch(60, 18, 14), -2),
  lit: rc(fromLch(69, 16, 26), -2),
};

/** The root's top edge at the start (screen px, left -> right): the trunk's foot comes in off the left edge and its
 *  root runs down to the bottom edge, x <= 540 (the bench, the bag and the news box stay clear). */
const ROOT_TOP: Pt[] = [
  [-70, 1586],
  [8, 1600],
  [64, 1632],
  [112, 1684],
  [166, 1742],
  [236, 1786],
  [322, 1816],
  [416, 1846],
  [492, 1884],
  [536, 1932],
];
const ROOT_D = smoothClosed([...ROOT_TOP, [560, 2000], [-70, 2000]]);
/** The lit top: a band along the upper edge (the slot's sun), widest on the trunk's shoulder, tapering out on the root. */
const ROOT_LIT_D = (() => {
  const n = ROOT_TOP.length;
  const lower: Pt[] = ROOT_TOP.slice(0, n - 2).map(([x, y], i) => {
    const w = 18 * (1 - i / (n - 2)) + 3;
    return [x + w * 0.35, y + w];
  });
  return smoothClosed([...ROOT_TOP.slice(0, n - 2), ...lower.reverse()]);
})();

/** The drop-out: down and a little left, eased over p 0 -> 0.5 (the crane rising past a near root). */
const EXIT: Pt = [-120, 330];
const P_OUT = 0.5;
export const rootOffset = (p: number): Pt => {
  const u = Math.max(0, Math.min(1, p / P_OUT));
  const e = u * u * (3 - 2 * u);
  return [EXIT[0] * e, EXIT[1] * e];
};

export const S5StartFore: React.FC<{p: number}> = ({p}) => {
  if (p >= P_OUT) return null;
  const [dx, dy] = rootOffset(p);
  return (
    <g transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`}>
      {/* its cast on the paving: the sun in the slot (upper left) lays a short strip along its right side */}
      <ShadowLayer>
        <Shadow d={ROOT_D} dx={11} dy={5} tint="cast" soft={4} />
      </ShadowLayer>
      <Tier tier="environment">
        <defs>
          <clipPath id="s5rootClip">
            <path d={ROOT_D} />
          </clipPath>
        </defs>
        <Fill d={ROOT_D} color={ROOT5.mass} offset={false} backdrop seed="s5start/root" />
        <g clipPath="url(#s5rootClip)">
          <Fill d={ROOT_LIT_D} color={ROOT5.lit} offset={false} backdrop seed="s5start/rootLit" />
        </g>
      </Tier>
    </g>
  );
};
