// S12_desk (lane S12, G5b): the desk of the home base's DESK set at S12's close (29.40-31.32), dressed like S7's
// (docs/v3/density_plan_g5b.md §1 S12; cozy v2 OVERRIDES), re-laid round S12's board: THE laptop centred in the lamp
// pool with O1's tag lying under it (the subject; its ring stays clear), so
//   desk back    S7's row as built (books, pen cup, succulent, candle, speaker; the mug), imported in S12.tsx.
//   desk mid     left: the headphones, the mittens, Pip on the desk left of the tag; right: the charger into the laptop's
//                right port, sticky notes (they flutter on the ding), glasses, two clementines.
//   desk front   the spiral notebook and its pen cut by the left edge, a plate of biscuits with crumbs, letters, a clip
//                dish, your phone face down cut by the bottom edge, O1's open planner and the radio bottom right, grain.
//   Pip          (1.4x, S7's size) follows the stick in from the upper left, leans in to read the tag as $999 is struck;
//                on "pass" (the ding) it recoils with a hop back and its ears drop over its eyes; on "on" it turns to
//                us, worried (S11 handed it over worried; S13 lets it sleep).
// Cool share (cozy v2 §4): the headphones, the notebook's dusk-blue cover, the cable, the pen cup, Pip's lilac.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {circle, ellipse, blob} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Letters, Mittens, Planner, Radio} from './O1_life';
import {Clementines, Pen, PhoneDown, SpiralNotebook} from './S7_desk';
import {Cable, DeskGrain, EMBER, ease01, Glasses, Headphones, Pip3, pipPlace, StickyNotes, W, type LookKey, type PipHop, type PipPoseKey, type Pt} from '../kit';

// ---------------------------------------------------------------- small desk things (S7's drawings, S12 seeds)

/** A plate of biscuits (one bitten) and crumbs. */
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
    </>
  );
};

/** A small ceramic dish of paper clips and coins. */
const ClipDish: React.FC<{x: number; y: number}> = ({x, y}) => {
  const dish = ellipse(x, y, 52, 18, {seed: 's12/dish'});
  const clip = (cx: number, cy: number, rot: number, col: string, i: number) => (
    <path key={i} d={`M${cx - 14} ${cy}a5 5 0 0 1 5 -5h18a5 5 0 0 1 0 10h-16a3.5 3.5 0 0 1 0 -7h14`} transform={`rotate(${rot} ${cx} ${cy})`} fill="none" stroke={col} strokeWidth={2.2} strokeLinecap="round" />
  );
  return (
    <>
      <Fill d={dish} color={EMBER.reveal} seed="s12/dishF" />
      <Fill d={ellipse(x, y - 3, 38, 11, {seed: 's12/dishIn'})} color={EMBER.wall} offset={false} />
      <Ink d={dish} width={W.far} />
      {clip(x - 14, y - 4, -12, EMBER.dc, 0)}
      {clip(x + 12, y - 2, 20, EMBER.beam, 1)}
      <Fill d={ellipse(x + 2, y - 6, 9, 4, {seed: 's12/coin1'})} color={EMBER.books[0]} offset={false} />
      <Fill d={ellipse(x - 34, y + 24, 10, 5, {seed: 's12/coin2'})} color={EMBER.ring} seed="s12/coin2F" />
      <Ink d={ellipse(x - 34, y + 24, 10, 5, {seed: 's12/coin2I'})} width={W.hair} />
    </>
  );
};

const crumbs = (pts: [number, number, number][]) =>
  pts.map(([cx, cy, cr], i) => <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />);

// ---------------------------------------------------------------- the desk: mid (round the tag)

export const S12DeskMid: React.FC<{port: Pt; ding: number}> = ({port, ding}) => (
  <>
    <Headphones x={112} y={1214} w={168} seed="s12/hp" ink={W.far} />
    <Mittens x={-6} y={1350} />
    {/* the charger: from the right edge across the desk into the laptop's right port (it leads the eye in) */}
    <Cable points={[port, [812, port[1] + 30], [900, port[1] + 62], [1004, port[1] + 50], [1130, port[1] + 96]]} plug width={7} color={EMBER.dcSide} />
    <StickyNotes x={806} y={1318} n={2} size={64} flutterAt={[ding + 0.06]} seed="s12/sticky" />
    <Glasses x={972} y={1300} w={118} rot={-14} seed="s12/glasses" ink={W.far} />
    <Clementines x={872} y={1458} seed="s12/clem" />
  </>
);

// ---------------------------------------------------------------- the desk: front (y > 1480)

export const S12DeskFront: React.FC = () => (
  <>
    <SpiralNotebook quad={[[-70, 1566], [300, 1546], [330, 1856], [-60, 1896]]} pen={[[40, 1900], [344, 1700]]} seed="s12/nb" />
    <Biscuits x={226} y={1512} seed="s12/biscuits" />
    {crumbs([[326, 1540, 3], [348, 1526, 2.4], [312, 1560, 2], [380, 1552, 2.2]])}
    <Letters x={548} y={1592} />
    <ClipDish x={718} y={1556} />
    <Pen from={[612, 1676]} to={[752, 1630]} wPx={14} color={EMBER.dc} seed="s12/pen2" />
    <PhoneDown x={420} y={1716} seed="s12/phone" />
    <Radio x={944} y={1600} w={116} />
    <Planner x={770} y={1668} />
  </>
);

/** Wood grain on the desk, outside the pool and the clutter. */
export const S12Grain: React.FC = () => (
  <>
    <DeskGrain x={-20} y={1040} w={300} h={110} n={2} seed="s12/grain1" />
    <DeskGrain x={400} y={1500} w={260} h={60} n={2} seed="s12/grain2" />
    <DeskGrain x={-20} y={1860} w={1120} h={60} n={2} seed="s12/grain3" />
    <DeskGrain x={780} y={1530} w={160} h={60} n={1} seed="s12/grain4" />
    <DeskGrain x={760} y={1180} w={300} h={60} n={1} seed="s12/grain5" />
  </>
);

// ---------------------------------------------------------------- Pip

const PIP = {x: 192, y: 1440, scale: 1.4};

export type S12PipBeats = {
  /** The stick's flight (it pops in upper left at t0 and is in the keyboard by t1). */
  stick: [number, number];
  /** "makers": the strike draws on over $999. */
  strike: number;
  /** "pass" = the ding: $1,099 pops. */
  ding: number;
  /** "on": it turns to us. */
  on: number;
};

/** Pip on the desk left of the tag: it follows the stick in from the upper left (head turned left, then right), leans
 *  in to read the tag as the strike draws on; on the ding it recoils (a hop back, its ears drop over its eyes); on
 *  "on" it turns to us, worried. */
export const S12Pip: React.FC<{beats: S12PipBeats}> = ({beats}) => {
  const t = useTime();
  const {stick, strike, ding, on} = beats;
  const keys: PipPoseKey[] = [
    {t: -9, pose: 'sit-back'},
    {t: ding + 0.02, pose: 'ears-cover'},
    {t: on - 0.04, pose: 'sit-front', expression: 'worried'},
  ];
  const look: LookKey[] = [
    {t: -9, v: -0.6},
    {t: stick[0] + 0.12, v: 0.55},
    {t: on - 0.04, v: 0.1},
  ];
  const hops: PipHop[] = [{t: ding + 0.02, to: [PIP.x - 18, PIP.y], height: 12, dur: 0.22}];
  // the lean (deg, about the feet): in toward the tag as the strike draws on, thrown back on the ding, upright by "on"
  const lean = 6 * ease01(t, strike - 0.1, 0.26) - 11 * ease01(t, ding, 0.1) + 5 * ease01(t, ding + 0.22, 0.36);
  const {x: fx, y: fy} = pipPlace(t, PIP.x, PIP.y, hops);
  return (
    <XG m={mat.about(mat.rotate(lean), fx, fy)}>
      <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.12} seed={7} keys={keys} look={look} lookDur={0.2} hops={hops} />
    </XG>
  );
};
