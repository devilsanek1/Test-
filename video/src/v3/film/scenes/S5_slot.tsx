// S5_slot (S5 lane, G5b fix): the empty BETTER slot dressed as a display WAITING for a laptop (review S5 #3: before the
// pop it was a 344 px blank field beside your face). Thin, low-contrast pieces in ink and shelf tones, every one either
// hidden by the new laptop or lit by the pop:
//   back (drawn before the display light, so the light and the laptop cover them): an acrylic laptop riser on the plank
//     at the slot's centre (a clear back plate with glints and a front lip), four empty slatwall hooks with blank price
//     clips (all inside the new laptop's lid);
//   spots (drawn after the light): a track rail under the panel top with two spot cans angled at the slot, their lenses
//     dark until the pop, then lit (the light that snaps on);
//   card (drawn after the plank): a blank shelf-edge card clipped to the plank front under the slot; on the pop it gets
//     its print.
// Nothing enters the caption band (all y >= 624), your head's ring (all x >= 506) or the BETTER label (x ~590-782,
// y ~600-664: the cans sit either side of it).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, glint, line, roundRect} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, W, rings, sway} from '../kit';

/** The slot's centre x (S5.tsx NEW.x) and the plank top (S5.tsx SHELF.y). */
const CX = 690;
const PLANK = 958;
/** The track rail under the panel top. */
const RAIL_Y = 630;
/** A soft clear-acrylic edge (one warm-white step over the slatwall). */
const ACRYLIC = '#EFCDB4';
/** The acrylic's lit edge (a soft warm white, never the card white). */
const ACRYLIC_EDGE = '#F8E0CE';

/** One empty slatwall hook (base on the groove at x, y) with a blank price clip on its tip that swings a little. */
const Hook: React.FC<{x: number; y: number; dir: 1 | -1; t: number; i: number; popAt: number}> = ({x, y, dir, t, i, popAt}) => {
  const tipX = x + dir * 26;
  const tipY = y + 10;
  const a = sway(t, 2.2, 2.6 + i * 0.35, i * 1.7) + rings(t, [popAt + 0.02 * i], 4, 2.6, 3.5);
  return (
    <>
      <path d={`M${x} ${y - 6}v12`} stroke={EMBER.beam} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${x} ${y}L${tipX} ${tipY}l${dir * 4} -6`} fill="none" stroke={EMBER.beam} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <XG m={mat.about(mat.rotate(a), tipX, tipY)}>
        <path d={roundRect(tipX - 10, tipY + 2, 20, 14, 2)} fill={EMBER.card} stroke={EMBER.beam} strokeWidth={1.4} />
      </XG>
    </>
  );
};

/** Behind the display light: the acrylic riser and the empty hooks (all covered once the laptop pops). */
export const S5SlotBack: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  // the riser's clear back plate (a slight lean) and its front lip on the plank
  const plate = `M${CX - 78} 776L${CX + 76} 770L${CX + 82} ${PLANK - 12}L${CX - 84} ${PLANK - 10}Z`;
  return (
    <>
      <path d={plate} fill={ACRYLIC} />
      <path d={plate} fill="none" stroke={ACRYLIC_EDGE} strokeWidth={2.2} strokeLinejoin="round" />
      <Ink d={line(CX - 78, 776, CX - 84, PLANK - 10, {seed: 's5sl/plL', over: [0, 0]}) + line(CX - 78, 776, CX + 76, 770, {seed: 's5sl/plT', over: [0, 0]})} width={W.hair} />
      <path d={glint(CX + 40, 806, 38, {seed: 's5sl/g1'}) + glint(CX - 30, 880, 26, {seed: 's5sl/g2'})} fill="none" stroke={EMBER.white} strokeWidth={2.4} strokeLinecap="round" />
      {/* the lip: a clear strip standing on the plank, its top edge catching the light */}
      <path d={`M${CX - 96} ${PLANK}V${PLANK - 16}H${CX + 94}V${PLANK}`} fill={ACRYLIC} stroke={ACRYLIC_EDGE} strokeWidth={2.2} />
      <Ink d={line(CX - 96, PLANK - 16, CX + 94, PLANK - 16, {seed: 's5sl/lip', over: [0, 0]})} width={W.hair} />
      {/* four empty hooks, inside the new laptop's lid */}
      <Hook x={572} y={712} dir={1} t={t} i={0} popAt={popAt} />
      <Hook x={808} y={712} dir={-1} t={t} i={1} popAt={popAt} />
      <Hook x={566} y={830} dir={1} t={t} i={2} popAt={popAt} />
      <Hook x={814} y={830} dir={-1} t={t} i={3} popAt={popAt} />
    </>
  );
};

/** One spot can on the rail, angled at the slot; its lens dark until `popAt`, then lit with a small warm halo. */
const Spot: React.FC<{x: number; ang: number; lit: boolean; seed: string}> = ({x, ang, lit, seed}) => (
  <>
    <path d={`M${x} ${RAIL_Y + 6}v10`} stroke={EMBER.beam} strokeWidth={3} />
    <XG m={mat.about(mat.rotate(ang), x, RAIL_Y + 16)}>
      {lit ? <path d={blob(x, RAIL_Y + 50, 26, 15, {seed: `${seed}/h`, wobble: 0.03})} fill={EMBER.ring} /> : null}
      <Fill d={`M${x - 11} ${RAIL_Y + 14}h22l5 30h-32Z`} color={EMBER.shelf} seed={`${seed}/c`} offset={false} />
      <path d={`M${x - 15} ${RAIL_Y + 44}h30`} stroke={lit ? EMBER.core : EMBER.dcSide} strokeWidth={5} strokeLinecap="round" />
      <Ink d={`M${x - 11} ${RAIL_Y + 14}h22l5 30h-32Z`} width={W.hair} />
    </XG>
  </>
);

/** Over the display light: the track rail and its two spot cans (lit by the pop). */
export const S5SlotSpots: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  const lit = t >= popAt;
  return (
    <>
      <Fill rect={[508, RAIL_Y, 362, 7]} color={EMBER.shelf} offset={false} />
      <Ink d={line(508, RAIL_Y, 870, RAIL_Y, {seed: 's5sl/rT', over: [0, 0]}) + line(508, RAIL_Y + 7, 870, RAIL_Y + 7, {seed: 's5sl/rB', over: [0, 0]})} width={W.hair} />
      <Spot x={548} ang={-24} lit={lit} seed="s5sl/sp1" />
      <Spot x={834} ang={24} lit={lit} seed="s5sl/sp2" />
    </>
  );
};

/** The blank shelf-edge card clipped to the plank front under the slot; its print appears with the pop. */
export const S5SlotCard: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  const x0 = CX - 34;
  const y0 = PLANK + 5;
  return (
    <>
      <path d={roundRect(x0, y0, 68, 24, 3)} fill={EMBER.card} />
      <path d={roundRect(x0, y0, 68, 24, 3)} fill="none" stroke={EMBER.beam} strokeWidth={1.4} />
      <rect x={CX - 7} y={y0 - 4} width={14} height={8} fill={EMBER.anchor} />
      {t >= popAt ? <path d={`M${x0 + 9} ${y0 + 10}h34M${x0 + 9} ${y0 + 17}h22`} stroke={EMBER.ink} strokeWidth={1.6} strokeLinecap="round" /> : null}
    </>
  );
};
