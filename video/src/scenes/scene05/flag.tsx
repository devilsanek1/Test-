// S05 flagpole on the wing's roof (fix round 3): the low angle needs something up in the top third (ref 2 always has
// string lights / a cloud / palms there): a slim pole rising from the wing's roof (world y 840) to screen y ~200 at the
// frame's right (screen x ~1022 -> 1012 at the top: it leans in a touch like the pilasters), a white ball finial and a
// small teal flag (cream stripe) streaming LEFT into the sky right of the caption column (x 945) and above its band (y
// 280). The flag waves on a travelling wave and SNAPS (a quick gust: amplitude + rate up, 0.25 s) on 'researchers' and
// 'using'; it goes slack during 'bad' (the ONE focal event). Wing layer (parallax 0.4). World px, scene seconds.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import type {Pt} from '../../lib/sketch';
import {SI} from '../shared/sets';

/** Pole base (on the wing roof) and top, world (wing layer: at rest screen = (w - 540) 1.13 + 540, (w - 940) 1.13 + 960). */
const BASE: Pt = [977, 842];
const TOP: Pt = [968, 268];
const FLAG = {w: 84, h: 50};

/** One unbroken stroke (a sketchy line() breaks into dashes over this length). */
const POLE_INK = `M${BASE[0]} ${BASE[1]}L${TOP[0]} ${TOP[1]}`;

/** Gust envelope 1 .. ~2.2: snaps at `snaps`, slack (0.35) during `slack`. */
function gust(t: number, snaps: number[], slack: [number, number]): number {
  let g = 1;
  for (const s of snaps) {
    const u = (t - s) / 0.25;
    if (u >= 0 && u < 1) g = Math.max(g, 1 + 1.2 * Math.sin(Math.PI * u));
  }
  const [a, b] = slack;
  if (t > a - 0.1 && t < b + 0.15) {
    const k = clamp(Math.min((t - (a - 0.1)) / 0.1, (b + 0.15 - t) / 0.15));
    g *= 1 - 0.65 * k;
  }
  return g;
}

/** The flag outline at t: hoist at the pole (x 0), streaming to -x; a travelling wave along it whose amplitude grows
 *  toward the free edge. */
function flagPts(t: number, g: number): {outline: Pt[]; stripe: Pt[]} {
  const n = 8;
  const [px, py] = TOP;
  const y0 = py + 4;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const mid: Pt[][] = [[], []];
  const phase = t * 2 * Math.PI * 2.4;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = px - 3 - u * FLAG.w * (0.9 + 0.1 * Math.min(1.4, g));
    const a = Math.pow(u, 0.8) * 6 * g;
    const dy = a * Math.sin(phase - u * 4.6);
    const sag = (1 - Math.min(1, g)) * u * 10;
    top.push([x, y0 + dy + sag]);
    bot.push([x, y0 + FLAG.h * (1 - 0.08 * u) + dy * 0.8 + sag]);
    mid[0].push([x, y0 + FLAG.h * 0.4 + dy * 0.93 + sag]);
    mid[1].push([x, y0 + FLAG.h * 0.6 + dy * 0.9 + sag]);
  }
  return {outline: [...top, ...bot.slice().reverse()], stripe: [...mid[0], ...mid[1].slice().reverse()]};
}

const path = (P: Pt[], close = true) => P.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + (close ? 'Z' : '');

export const Flagpole: React.FC<{snaps: number[]; slack: [number, number]}> = ({snaps, slack}) => {
  const t = useTime();
  const g = gust(t, snaps, slack);
  const {outline, stripe} = flagPts(t, g);
  const ball = `M${TOP[0] - 5} ${TOP[1] - 2}a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z`;
  return (
    <>
      <Fill d={path(outline)} color={palette.teal} offset={false} mode="none" seed="s5flagF" />
      <Fill d={path(stripe)} color={palette.cream} offset={false} mode="none" seed="s5flagS" />
      <Ink d={path(outline)} width={SI.far} taper={false} vary={0} seed="s5flagI" />
      <Ink d={POLE_INK} width={SI.mid} taper={false} vary={0} seed="s5poleI" />
      <Fill d={ball} color={palette.white} offset={false} mode="none" seed="s5ball" />
      <Ink d={ball} width={SI.hair} taper={false} vary={0} seed="s5ballI" />
    </>
  );
};
