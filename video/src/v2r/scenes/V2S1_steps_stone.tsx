// V2S1 helper (lane L1, our bank): the STONE of our canal-side steps, in the clean pen (docs/v2/lanes/conform_L1.md §4,
// §7; CRAFT §c-§d): the waterline coping (y 1215-1234), the landing (1234-1302) and five broad treads stepping up toward
// us (nosings 1302 / 1392 / 1508 / 1660 / 1850). Tier C (environment): no lines, big flat shapes in two tones per step
// (the lit tread top, the step edge one shade step down), stone blocks in the two warm stones alternating; no joint
// lines, dabs, specks or hatching. The step edges are what `Shade` darkens (S1Steps), so their tone here is the lit stone.
import React, {useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {rng} from '../../lib/rng';
import {CM} from '../palette';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';

/** Our bank in world px (zoom 1.00). The lens looks level at the far bank: slab edges converge on VP. */
export const BANK = {
  coping: [1215, 1234] as [number, number],
  landing: [1234, 1302] as [number, number],
  nosings: [1302, 1392, 1508, 1660, 1850],
  bottom: 1990,
  vp: [540, 965] as Pt,
};

/** Our bank's lit stone: the stucco a hair under the frame's brightest 5 % (L* ~89 < 90.4), so the brightest area stays
 *  on the subject and the lit wing (CRAFT §d.2), not on the pale near steps. */
export const BANK_LIT = '#EFDDC9';
/** Band k: 0 = the landing, 1-5 = the treads whose front edge (nosing) is the band's top. `edge` = the visible step
 *  edge's height at the band's top (grows toward us). */
export const BANDS = [
  {k: 0, y0: BANK.landing[0], y1: BANK.nosings[0], top: CM.paving, edge: 0},
  {k: 1, y0: BANK.nosings[0], y1: BANK.nosings[1], top: BANK_LIT, edge: 7},
  {k: 2, y0: BANK.nosings[1], y1: BANK.nosings[2], top: CM.paving, edge: 9},
  {k: 3, y0: BANK.nosings[2], y1: BANK.nosings[3], top: BANK_LIT, edge: 12},
  {k: 4, y0: BANK.nosings[3], y1: BANK.nosings[4], top: CM.paving, edge: 15},
  {k: 5, y0: BANK.nosings[4], y1: BANK.bottom, top: BANK_LIT, edge: 18},
] as const;

/** A step's edge strip (band k's nosing; the landing has none), for the `Shade` step in S1Steps. */
export const edgePath = (k: number): string => {
  const b = BANDS[k];
  return b.edge > 0 ? poly([[-80, b.y0], [1160, b.y0], [1160, b.y0 + b.edge], [-80, b.y0 + b.edge]]) : '';
};

/** The joints' stone: a warm mid step under the paving (L* ~80: a value step, never a dark line). */
const JOINT = '#DCC4AE';

const xOf = (u: number, y: number) => BANK.vp[0] + u * (y - BANK.vp[1]);
const uOf = (x: number, y: number) => (x - BANK.vp[0]) / (y - BANK.vp[1]);
// warm stones only (stucco, paving): a shadow multiplied onto limestone (C* ~8) drops under C* 8 and reads grey
// (check_light)

/** One tread: the lit top as a few long slabs in neighbouring light stones (each its own Fill so the flood ripples
 *  across the steps), the step edge strip at its top. */
export const StoneBand: React.FC<{k: number; seed?: string}> = ({k, seed = 'v2s1bank'}) => {
  const b = BANDS[k];
  const g = useMemo(() => {
    const r = rng(`${seed}/${k}`);
    const top = b.y0 + b.edge;
    const bot = b.y1 + 1;
    const base = poly([[-80, b.y0 - 1], [1160, b.y0 - 1], [1160, bot + 2], [-80, bot + 2]]);
    const slabs: {d: string; color: string; seed: string}[] = [];
    const joints: string[] = [];
    // stone blocks ~1-1.4 m (120-180 px on the far tread, 230-340 px on the near ones), the two warm tones strictly
    // alternating, each course staggered by half a block: structure as flat value steps, never a joint line
    const uL = uOf(-120, top) - (k % 2) * 0.19;
    const uR = uOf(1200, top);
    // the second tone steps further from the base the nearer the tread (texture contrast falls off with distance)
    const other = k >= 3 ? CM.coatOat : b.top === BANK_LIT ? CM.paving : BANK_LIT;
    // the joints: thin flat strips along the lines to the vanishing point, finer with distance (0.8 px far, 3.4 near)
    const jw = (y: number) => 0.8 + (2.6 * (y - BANK.coping[0])) / (BANK.bottom - BANK.coping[0]);
    let u0 = uL;
    let i = 0;
    while (u0 < uR) {
      const u1 = Math.min(uR + 0.4, u0 + (k === 0 ? 0.6 : 0.38) * r.range(0.85, 1.2));
      if (i % 2) slabs.push({d: poly([[xOf(u0, top), top], [xOf(u1, top), top], [xOf(u1, bot), bot], [xOf(u0, bot), bot]]), color: other, seed: `${seed}/${k}/s${i}`});
      const a = jw(top) / 2;
      const c = jw(bot) / 2;
      joints.push(poly([[xOf(u0, top) - a, top], [xOf(u0, top) + a, top], [xOf(u0, bot) + c, bot], [xOf(u0, bot) - c, bot]]));
      u0 = u1;
      i++;
    }
    const edge = b.edge > 0 ? poly([[-80, b.y0], [1160, b.y0], [1160, b.y0 + b.edge], [-80, b.y0 + b.edge]]) : '';
    return {base, slabs, edge, joints: joints.join('')};
  }, [k, seed]);
  return (
    <>
      <Fill d={g.base} color={b.top} seed={`${seed}/base${k}`} offset={false} />
      {g.slabs.map((s) => (
        <Fill key={s.seed} d={s.d} color={s.color} seed={s.seed} offset={false} />
      ))}
      <Fill d={g.joints} color={JOINT} seed={`${seed}/joints${k}`} offset={false} />
      {g.edge ? <Fill d={g.edge} color={CM.paving} seed={`${seed}/edge${k}`} offset={false} /> : null}
    </>
  );
};

/** The coping along our waterline: a stucco top and its rounded lip one tone down (two flat tones, no line). */
export const Coping: React.FC<{seed?: string}> = ({seed = 'v2s1bank'}) => {
  const [y0, y1] = BANK.coping;
  return (
    <>
      <Fill d={poly([[-80, y0], [1160, y0], [1160, y1 + 2], [-80, y1 + 2]])} color={BANK_LIT} seed={`${seed}/copTop`} offset={false} />
      <Fill d={poly([[-80, y0], [1160, y0], [1160, y0 + 5], [-80, y0 + 5]])} color={CM.stoneShade} seed={`${seed}/copLip`} offset={false} />
    </>
  );
};
