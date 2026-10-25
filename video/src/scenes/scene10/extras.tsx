// S10 small local pieces added in fix round 3:
//  - HalfSweep: the sun's cream HALF as a SECTOR SWEEP from the top spoke (0 -> 180 deg over 0.07 s, then a 5 % pulse
//    about the disc centre), swept back into the spoke on `solidAt`. The kit SunPie pops its slices radially from near
//    the centre, which at n = 2 showed a small cream 'D' inside the disc for 2 frames (read as a half-moon / an eye);
//    the spokes still come from the kit SunPie (cream={[]}).
//  - TreeLeafPatch: the OldQuarter tree's leaf ticks (G.treeTicks: two stacked arcs over a lower arc) read as a
//    closed-eyes smiley at the right edge: one sage leaf-cluster patch over them + three asymmetric leaf arcs, swaying
//    with the tree (same sway as the set: osc(t, 0.3, 2.1) x 0.5 deg about the trunk foot). Sets-lane request stands:
//    remove this when G.treeTicks is broken up in the set.
// Everything Ink / Fill, seconds-based, no opacity.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, osc, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {useInkScale} from '../../lib/inkComp';
import {blob} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';

const D2R = Math.PI / 180;
const pol = (a: number, r: number): [number, number] => [Math.cos(a * D2R) * r, Math.sin(a * D2R) * r];

/** A sector from angle a0 to a1 (deg, SVG angles: 0 = right, 90 = down), sun-local. */
function sector(a0: number, a1: number, r: number): string {
  const [x0, y0] = pol(a0, r);
  const [x1, y1] = pol(a1, r);
  return `M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
}
function rim(a0: number, a1: number, r: number): string {
  const [x0, y0] = pol(a0, r);
  const [x1, y1] = pol(a1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** The cream LEFT half of a 1/2 sun pie (sun-local, inside <Sun>{(r) => ...}</Sun>): sweeps from the top spoke (270 deg)
 *  counter-clockwise to the bottom spoke (90 deg) over `dur`, pulses 5 % (0.12 s), and sweeps back into the top spoke
 *  on `solidAt` (0.12 s, in-cubic). An ink rim arc rides its outer edge (the kit SunPie's slice look). */
export const HalfSweep: React.FC<{r: number; at: number; solidAt?: number; dur?: number; width?: number}> = ({r, at, solidAt, dur = 0.07, width = 2.6}) => {
  const t = useTime();
  const ks = useInkScale();
  if (t < at) return null;
  let span = 180 * E.outCubic(prog(t, at, dur));
  if (solidAt !== undefined) span *= 1 - E.inCubic(prog(t, solidAt, 0.12));
  if (span < 0.5) return null;
  const end = at + dur;
  const pulse = t >= end && t < end + 0.12 ? 1 + 0.05 * Math.sin(Math.PI * ((t - end) / 0.12)) : 1;
  const a1 = 270 - 0.6;
  const a0 = a1 - span + 1.2;
  const rr = r * 0.985;
  return (
    <XG m={mat.scale(pulse)}>
      <Fill d={sector(a0, a1, rr)} color={palette.cream} offset={false} mode="none" seed="s10/half" lookExempt />
      <path d={rim(a0, a1, rr - (width * ks) / 2)} fill="none" stroke={palette.ink} strokeWidth={width * ks} strokeLinecap="round" />
    </XG>
  );
};

/** World geometry of the leaf patch over the set tree's four ticks (crown (1040, 1050) 110 x 135; the ticks sit in its
 *  lower-left at (986, 1098), (997, 1110), (1027, 1149) world; the fourth, (1120, 1074), is under the UI rail),
 *  inside the crown's ink outline. */
const LEAF = {
  patch: blob(1004, 1122, 50, 38, {seed: 's10/leafp'}),
  arcs:
    // three leaf arcs on one DIAGONAL (no two at the same height: no 'eyes', no 'mouth'), each a different angle and length
    'M953 1090q8 9 20 5' + 'M984 1112q3 11 14 15' + 'M1018 1138q10 4 18 -4',
};

/** Covers the set tree's smiley ticks (draw after the set's 'near' node). */
export const TreeLeafPatch: React.FC = () => {
  const t = useTime();
  const sway = osc(t, 0.3, 2.1) * 0.5;
  return (
    <XG m={mat.about(mat.rotate(sway), 1034, 1464)}>
      <Fill d={LEAF.patch} color={palette.sage} offset={false} mode="none" seed="s10/leafp" />
      <Ink d={LEAF.arcs} width={3.4} taper={false} seed="s10/leafa" />
    </XG>
  );
};
