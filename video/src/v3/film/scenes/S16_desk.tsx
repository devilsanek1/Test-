// S16_desk (lane S16, G5b): the desk at S16's eye-level close-up (38.84-41.15), dressed to the approved pilot's level
// (O1's desk world: docs/look/LIFE_AND_DENSITY.md "Approved bar"; docs/v3/density_plan_g5b.md §1 S16 under
// docs/v3/cozy_v2_application.md). The lamp pool under the tag stays the tag's calm ring; the clutter sits at both
// depths round it, cut by the edges, in the room's warm family plus the dusk-blue cool share (headphones, the
// notebook's cover, the pen, the cable), never the hero orange or the blue pop:
//   back     the pen cup cut by the right edge, the mug (steam) at the pool's right rim, behind Pip.
//   mid      the charger from the laptop's right side across the desk to the right edge, two clementines (one half
//            peeled), reading glasses, sticky notes (one flutters in the tag's air), headphones cut by the right edge.
//   front    a spiral notebook and a pen cut by the left edge, letters, your phone face down cut by the bottom edge,
//            O1's open planner cut by the bottom-right corner, crumbs, wood grain.
// Everything is built from the cut (no `at`): S16 opens on a hard cut. Raw-SVG pieces sit in ExitFade so the loop's
// un-build takes them with the fills.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitFade} from '../../../lib/exit';
import {blob, circle, ellipse, hline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {Letters, Planner} from './O1_life';
import {Clementines, Pen, PhoneDown, SpiralNotebook} from './S7_desk';
import {Cable, DeskGrain, EMBER, Glasses, Headphones, Mug, PenCup, Steam, StickyNotes, W, type Pt} from '../kit';
import {S16_TURN} from './S16_wall';

/** The desk's back edge (the wall above it). */
export const S16_DESK_Y = 1250;
/** The golden pool under the tag (as G5 built it). */
export const S16_POOL = {cx: 500, cy: 1356, rx: 440, ry: 92};

/** The desk slab, the pool and the back edge. */
export const S16Desk: React.FC = () => (
  <>
    <Fill rect={[-80, S16_DESK_Y, 1240, 800]} color={EMBER.desk} offset={false} />
    <Fill d={blob(S16_POOL.cx, S16_POOL.cy, S16_POOL.rx, S16_POOL.ry, {seed: 's16/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(S16_POOL.cx - 8, S16_POOL.cy - 4, S16_POOL.rx * 0.6, S16_POOL.ry * 0.6, {seed: 's16/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-80, 1160, S16_DESK_Y, {seed: 's16/deskE', over: 'structural'})} width={3.4} />
  </>
);

/** Wood grain outside the pool and the clutter. */
export const S16Grain: React.FC = () => (
  <>
    <DeskGrain x={330} y={1470} w={300} h={60} n={2} seed="s16/grain1" />
    <DeskGrain x={-20} y={1500} w={240} h={50} n={1} seed="s16/grain2" />
    <DeskGrain x={560} y={1840} w={520} h={60} n={2} seed="s16/grain3" />
    <DeskGrain x={760} y={1600} w={320} h={70} n={2} seed="s16/grain4" />
    <DeskGrain x={880} y={1270} w={200} h={40} n={1} seed="s16/grain5" />
  </>
);

/** Back row: the pen cup cut by the right edge, the mug at the pool's right rim (behind Pip). */
export const S16DeskBack: React.FC = () => (
  <>
    <PenCup x={1074} y={1278} w={58} seed="s16/pens" ink={W.far} />
    {/* the tea's steam: warm-white puffs that rise and shrink to nothing over the mug (the steady back-row loop) */}
    <ExitFade x={1015} y={1250}>
      <Steam x={1015} y={1272} n={6} life={2.2} rise={140} drift={-12} r0={5} r1={15} wobble={6} seed="s16/steam" color={EMBER.card} />
    </ExitFade>
    <Mug x={968} top={1286} w={94} seed="s16/mug" />
  </>
);

/** A plate of biscuits (one bitten) and crumbs (S7's plate, at S16's size). */
const Biscuits: React.FC<{x: number; y: number; k?: number; seed: string}> = ({x, y, k = 1, seed}) => {
  const r = rng(`${seed}/r`);
  const plate = ellipse(x, y, 84 * k, 25 * k, {seed: `${seed}/plate`});
  const rim = ellipse(x, y - 2 * k, 62 * k, 17 * k, {seed: `${seed}/rim`});
  const cookies: [number, number, number][] = [[x - 26 * k, y - 8 * k, 27 * k], [x + 22 * k, y - 2 * k, 25 * k], [x + 2 * k, y - 18 * k, 23 * k]];
  return (
    <>
      <Fill d={plate} color={EMBER.card} seed={`${seed}/plateF`} />
      <Ink d={plate + rim} width={W.far} />
      {cookies.map(([cx, cy, cr], i) => {
        const bite = i === 2;
        const d = bite ? `M${cx - cr} ${cy}A${cr} ${cr * 0.62} 0 1 0 ${cx + cr * 0.62} ${cy - cr * 0.5}Q${cx + cr * 0.3} ${cy - cr * 0.12} ${cx + cr * 0.55} ${cy + cr * 0.1}Q${cx + cr * 0.1} ${cy - cr * 0.3} ${cx - cr} ${cy}Z` : ellipse(cx, cy, cr, cr * 0.62, {seed: `${seed}/ck${i}`});
        const chips = [0, 1, 2, 3].map((j) => blob(cx + r.jitter(cr * 0.55), cy + r.jitter(cr * 0.3), 3.2 * k, 2.4 * k, {seed: `${seed}/chip${i}${j}`})).join('');
        return (
          <React.Fragment key={i}>
            <Fill d={d} color={EMBER.books[6]} seed={`${seed}/ckF${i}`} />
            <Ink d={d} width={W.hair} />
            <Fill d={chips} color={EMBER.anchor} offset={false} />
          </React.Fragment>
        );
      })}
      {[[x - 96 * k, y + 22 * k, 3], [x - 112 * k, y + 12 * k, 2.4], [x - 80 * k, y + 34 * k, 2]].map(([cx, cy, cr], i) => (
        <Fill key={`cr${i}`} d={circle(cx, cy, cr * k)} color={EMBER.books[6]} offset={false} />
      ))}
    </>
  );
};

/** The laptop's right side (THE laptop at x 30, y 1330, w 520): the charger plug sits in its port. */
const PORT: Pt = [306, 1396];

export const S16DeskMid: React.FC = () => (
  <>
    {/* the charger: out of the laptop's right side, across the desk front, off the right edge */}
    <ExitFade x={700} y={1600}>
      <Cable points={[PORT, [352, 1440], [420, 1566], [600, 1622], [850, 1606], [1150, 1650]]} plug width={7} color={EMBER.dcSide} />
    </ExitFade>
    <Clementines x={444} y={1522} k={1.3} seed="s16/clem" />
    {/* reading glasses on the pool's front rim (the lenses catch the lamp) */}
    <Glasses x={690} y={1438} w={150} rot={-8} seed="s16/glasses" ink={W.far} />
    <StickyNotes x={760} y={1510} n={2} size={78} flutterAt={[S16_TURN + 0.18, 1.72]} seed="s16/sticky" />
    <Headphones x={980} y={1478} w={224} seed="s16/hp" ink={W.far} />
    <Biscuits x={930} y={1652} k={1.15} seed="s16/biscuits" />
  </>
);

/** Biro doodles on the notebook's page (over the kit's three lines): a little price tag with a question mark, a star,
 *  and a two-line list with ticks. Thin blue-biro ink (the dusk family, never the pop). */
const PageDoodle: React.FC = () => {
  const c = EMBER.dc;
  const tag = 'M118 1716L176 1708L196 1726L180 1746L122 1752Z';
  const q = 'M146 1722Q150 1714 158 1716Q166 1720 160 1728Q154 1732 155 1738';
  const star = 'M244 1704L250 1718L264 1718L253 1727L258 1741L244 1732L231 1740L236 1727L225 1718L239 1717Z';
  const ticks = 'M112 1782l6 6l10 -12M112 1812l6 6l10 -12';
  const list = 'M138 1784Q170 1781 214 1780M138 1814Q160 1812 190 1811';
  return (
    <>
      <Ink d={tag + `M130 1730a4 4 0 1 0 0.1 0`} width={1.9} color={c} />
      <Ink d={q} width={1.9} color={c} />
      <Fill d={circle(155, 1744, 1.8)} color={c} offset={false} />
      <Ink d={star} width={1.7} color={c} />
      <Ink d={ticks + list} width={1.7} color={c} />
    </>
  );
};

/** Two coins on the desk. */
const Coins: React.FC<{x: number; y: number}> = ({x, y}) => (
  <>
    <Fill d={ellipse(x, y, 17, 9, {seed: 's16/coin1'})} color={EMBER.ring} seed="s16/coin1F" />
    <Ink d={ellipse(x, y, 17, 9, {seed: 's16/coin1I'})} width={W.hair} />
    <Fill d={ellipse(x + 28, y + 12, 14, 7.5, {seed: 's16/coin2'})} color={EMBER.books[0]} seed="s16/coin2F" />
    <Ink d={ellipse(x + 28, y + 12, 14, 7.5, {seed: 's16/coin2I'})} width={W.hair} />
  </>
);

export const S16DeskFront: React.FC = () => (
  <>
    <ExitFade x={140} y={1730}>
      <SpiralNotebook quad={[[-80, 1566], [318, 1538], [350, 1890], [-70, 1934]]} seed="s16/nb" />
    </ExitFade>
    <PageDoodle />
    <Pen from={[40, 1900]} to={[356, 1682]} wPx={16} seed="s16/nb/pen" />
    <Pen from={[616, 1628]} to={[772, 1596]} wPx={13} color={EMBER.books[4]} seed="s16/pencil" />
    <Coins x={668} y={1772} />
    <Letters x={548} y={1690} />
    <PhoneDown x={404} y={1790} w={220} rot={6} seed="s16/phone" />
    <Planner x={784} y={1712} />
    {/* crumbs strayed from a biscuit */}
    {[[396, 1610, 3], [420, 1622, 2.4], [372, 1628, 2]].map(([cx, cy, cr], i) => (
      <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />
    ))}
  </>
);
