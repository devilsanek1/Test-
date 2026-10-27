// S12_desk (lane S12, G5b): the desk of the home base's DESK set at S12's close (29.40-31.32), dressed like S7's
// (docs/v3/density_plan_g5b.md §1 S12; cozy v2 OVERRIDES), re-laid round S12's board: THE laptop centred in the lamp
// pool with O1's tag lying under it (the subject; its ring stays clear), so
//   desk back    S7's row as built (books, pen cup, succulent, candle, speaker; the mug), imported in S12.tsx.
//   desk mid     left: the headphones, the mittens, Pip on the desk left of the tag; right: the charger into the laptop's
//                right port, sticky notes (they flutter on the ding), glasses, two clementines.
//   desk front   the spiral notebook and its pen cut by the left edge, a plate of biscuits with crumbs, letters, a clip
//                dish, your phone face down cut by the bottom edge, O1's open planner and the radio bottom right, grain.
//   Pip          (1.55x: S7's 1.4 a step up for the reaction beat; front view, so its eyes point) follows the stick in
//                from the upper left, then reads the tag, leaning in with wide eyes as $999 is struck;
//                on "pass" (the ding) it recoils with a hop back and its ears drop over its eyes; on "on" it turns to
//                us with big anxious eyes and a head tilt ('wide': the shared 'worried' brow reads cross; S13 lets it
//                sleep).
// Cool share (cozy v2 §4): the headphones, the notebook's dusk-blue cover, the cable, the pen cup, Pip's lilac; fix
// pass: the closed dusk planner, the dusk radio, airmail letters, the frost plate, the scarf's raised fold.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {circle, ellipse, blob, line, polyPath, roundRect, textLines} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Mittens} from './O1_life';
import {Clementines, Pen, PhoneDown, SpiralNotebook} from './S7_desk';
import {Cable, DeskGrain, EMBER, ease01, ring, sway, Glasses, Headphones, Pip3, pipPlace, StickyNotes, W, type LookKey, type PipHop, type PipPoseKey, type Pt} from '../kit';

// ---------------------------------------------------------------- small desk things (S7's drawings, S12 seeds)

/** A plate of biscuits (one bitten) and crumbs, on a frost-blue plate (the cool share). */
const Biscuits: React.FC<{x: number; y: number; k?: number; seed: string}> = ({x, y, k = 1, seed}) => {
  const r = rng(`${seed}/r`);
  const plate = ellipse(x, y, 84 * k, 25 * k, {seed: `${seed}/plate`});
  const rim = ellipse(x, y - 2 * k, 62 * k, 17 * k, {seed: `${seed}/rim`});
  const cookies: [number, number, number][] = [[x - 26 * k, y - 8 * k, 27 * k], [x + 22 * k, y - 2 * k, 25 * k], [x + 2 * k, y - 18 * k, 23 * k]];
  return (
    <>
      <Fill d={plate} color={EMBER.frost} seed={`${seed}/plateF`} />
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
      <Fill d={dish} color={EMBER.skyLow} seed="s12/dishF" />
      <Fill d={ellipse(x, y - 3, 38, 11, {seed: 's12/dishIn'})} color={EMBER.snow} offset={false} />
      <Ink d={dish} width={W.far} />
      {clip(x - 14, y - 4, -12, EMBER.dc, 0)}
      {clip(x + 12, y - 2, 20, EMBER.beam, 1)}
      <Fill d={ellipse(x + 2, y - 6, 9, 4, {seed: 's12/coin1'})} color={EMBER.books[0]} offset={false} />
      <Fill d={ellipse(x - 34, y + 24, 10, 5, {seed: 's12/coin2'})} color={EMBER.ring} seed="s12/coin2F" />
      <Ink d={ellipse(x - 34, y + 24, 10, 5, {seed: 's12/coin2I'})} width={W.hair} />
    </>
  );
};

/** A dusk-blue knitted scarf folded into a loose nest on the desk (Pip sits on it), snow-white bands, its tail running
 *  off the left edge with a fringe: the close's cool patch (cozy v2 §4) and a contrasting ground for Pip's lilac. */
const ScarfNest: React.FC = () => {
  const t = useTime();
  const nest = blob(206, 1446, 128, 40, {seed: 's12/scarfA', wobble: 0.05});
  const fold = blob(196, 1430, 98, 26, {seed: 's12/scarfB', wobble: 0.06});
  const tail = 'M96 1438C40 1446 0 1470 -70 1478L-70 1530C2 1520 52 1494 112 1470Z';
  // knit bands across the tail and the front of the nest (snow, two thin rows each)
  const band = (x0: number, y0: number, x1: number, y1: number, k: number) => (
    <path key={k} d={`M${x0} ${y0}L${x1} ${y1}`} stroke={EMBER.snow} strokeWidth={7} strokeLinecap="butt" />
  );
  // the fringe at the tail's end, off the edge, and a short loose end by the nest that stirs in the room's air
  const loose = sway(t, 3, 2.6, 0.7);
  // one knitted fold rising behind Pip (a loop standing up off the nest, ribbed), so the nest reads as fabric
  const loop = 'M112 1440C104 1380 150 1336 206 1334C266 1332 312 1376 304 1440L270 1440C270 1400 244 1372 208 1372C170 1372 144 1402 148 1440Z';
  let loopRibs = '';
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (1.05 + (k * 0.9) / 8);
    const cx = 208;
    const cy = 1430;
    loopRibs += `M${(cx + Math.cos(a) * 66).toFixed(1)} ${(cy + Math.sin(a) * 82).toFixed(1)}L${(cx + Math.cos(a) * 90).toFixed(1)} ${(cy + Math.sin(a) * 96).toFixed(1)}`;
  }
  return (
    <>
      <Fill d={loop} color={EMBER.dc} seed="s12/scarfL" />
      <path d={loopRibs} stroke={EMBER.dcSide} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <path d="M128 1396C150 1356 180 1346 206 1345" stroke={EMBER.snow} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Ink d={loop} width={W.far} />
      <Fill d={tail} color={EMBER.dc} seed="s12/scarfT" />
      {band(36, 1452, 56, 1500, 0)}
      {band(-10, 1466, 4, 1514, 1)}
      <path d={[10, 24, 70, 84].map((x) => `M${x} ${1462 - x * 0.28}l-4 ${40 - x * 0.06}`).join('')} stroke={EMBER.dcSide} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Ink d={'M96 1438C40 1446 0 1470 -70 1478M112 1470C52 1494 2 1520 -70 1530'} width={W.far} />
      <Fill d={nest} color={EMBER.dc} seed="s12/scarfN" />
      <Fill d={blob(214, 1458, 112, 22, {seed: 's12/scarfS', wobble: 0.05})} color={EMBER.dcSide} offset={false} />
      <Fill d={fold} color={EMBER.dc} seed="s12/scarfF" />
      {band(150, 1412, 156, 1452, 2)}
      {band(244, 1410, 240, 1452, 3)}
      <Ink d={nest} width={W.far} />
      <Ink d={fold} width={W.hair} />
      <path d={`M316 1450q16 6 ${24 + loose} ${18}M322 1446q20 2 ${32 + loose} 10`} fill="none" stroke={EMBER.dc} strokeWidth={4} strokeLinecap="round" />
    </>
  );
};

/** A dusk-blue thermos flask on the back row, right of the laptop (its cup-lid and a snow-white band). */
export const S12Thermos: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 50, h = 128}) => {
  const body = `M${x - w / 2} ${y - h + 22}L${x - w / 2} ${y - 8}Q${x - w / 2} ${y} ${x - w / 2 + 8} ${y}L${x + w / 2 - 8} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y - 8}L${x + w / 2} ${y - h + 22}Z`;
  const cap = `M${x - w / 2 + 3} ${y - h + 24}L${x - w / 2 + 6} ${y - h + 4}Q${x} ${y - h - 4} ${x + w / 2 - 6} ${y - h + 4}L${x + w / 2 - 3} ${y - h + 24}Z`;
  return (
    <>
      <Fill d={body} color={EMBER.dc} seed="s12/thermB" />
      <Fill rect={[x - w / 2, y - h * 0.46, w, 12]} color={EMBER.snow} offset={false} />
      <Fill d={cap} color={EMBER.dcSide} seed="s12/thermC" />
      <Ink d={body + cap} width={W.far} />
      <Ink d={`M${x - w * 0.26} ${y - h + 34}L${x - w * 0.26} ${y - h * 0.56}`} width={W.hair} color={EMBER.skyLow} />
    </>
  );
};


/** O1's planner, CLOSED, with a dusk-blue cloth cover (an S12 copy: the cool share), an elastic band and a ribbon
 *  tail; cut by the bottom-right corner. */
const ClosedPlanner: React.FC<{x: number; y: number}> = ({x, y}) => {
  const cover = polyPath([[x, y], [x + 400, y - 30], [x + 432, y + 330], [x + 10, y + 356]]);
  const pages = polyPath([[x + 400, y - 30], [x + 414, y - 22], [x + 446, y + 334], [x + 432, y + 330]]);
  return (
    <>
      <Fill d={pages} color={EMBER.card} seed="s12/cpP" />
      <Fill d={cover} color={EMBER.dc} seed="s12/cpC" />
      <Fill d={polyPath([[x + 330, y - 25], [x + 352, y - 27], [x + 384, y + 333], [x + 362, y + 335]])} color={EMBER.dcSide} offset={false} />
      <Fill d={polyPath([[x + 120, y + 60], [x + 250, y + 50], [x + 256, y + 116], [x + 126, y + 126]])} color={EMBER.card} offset={false} />
      <Ink d={line(x + 140, y + 82, x + 236, y + 74, {over: [0, 0], seed: 's12/cpL1'}) + line(x + 142, y + 102, x + 210, y + 97, {over: [0, 0], seed: 's12/cpL2'})} width={1.4} />
      <path d={polyPath([[x + 16, y + 14], [x + 384, y - 14], [x + 414, y + 316], [x + 26, y + 340]])} stroke={EMBER.skyLow} strokeWidth={2} strokeDasharray="8 7" fill="none" />
      <Ink d={cover + pages} width={W.mid} />
      <Fill d={polyPath([[x + 60, y + 354], [x + 72, y + 353], [x + 66, y + 400], [x + 54, y + 398]])} color={EMBER.books[4]} offset={false} />
    </>
  );
};

/** O1's little radio, an S12 copy in dusk blue (snow grille panel, warm dial): the cool share. */
const DuskRadio: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 116}) => {
  const h = w * 0.66;
  const body = roundRect(x, y - h, w, h, 12);
  const grille = [0, 1, 2, 3, 4].map((i) => line(x + 14, y - h + 22 + i * 10, x + w * 0.5, y - h + 22 + i * 10, {over: [0, 0], seed: `s12/gr${i}`})).join('');
  return (
    <>
      <Ink d={line(x + w * 0.78, y - h, x + w * 0.98, y - h - 96, {over: [0, 0], seed: 's12/ant'})} width={W.far} />
      <Fill d={body} color={EMBER.dc} seed="s12/radio" />
      <Fill d={roundRect(x + 8, y - h + 12, w * 0.5, h - 26, 6)} color={EMBER.frost} offset={false} />
      <Fill d={circle(x + w * 0.76, y - h * 0.52, w * 0.13)} color={EMBER.card} offset={false} />
      <Fill rect={[x + 10, y - 6, w - 20, 8]} color={EMBER.beam} offset={false} />
      <Ink d={body + circle(x + w * 0.76, y - h * 0.52, w * 0.13)} width={W.far} />
      <Ink d={grille} width={1.4} color={EMBER.dc} />
      <Ink d={line(x + w * 0.76, y - h * 0.52, x + w * 0.83, y - h * 0.62, {over: [0, 0], seed: 's12/needle'})} width={W.hair} />
    </>
  );
};

/** Airmail letters (an S12 copy of O1's fan): sky-low envelopes with the striped airmail border, stamps, addresses. */
const AirmailLetters: React.FC<{x: number; y: number}> = ({x, y}) => {
  const env = (cx: number, cy: number, w: number, h: number, rot: number, k: number, col: string) => {
    let stripes = '';
    for (let i = 0; i < Math.floor(w / 14); i++) stripes += `M${cx - w / 2 + 4 + i * 14} ${cy + h / 2 - 2}l8 -6`;
    return (
      <XG key={k} m={mat.about(mat.rotate(rot), cx, cy)}>
        <Fill rect={[cx - w / 2, cy - h / 2, w, h]} color={col} seed={`s12/env${k}`} />
        <path d={stripes} stroke={k === 1 ? EMBER.books[4] : EMBER.dc} strokeWidth={3} fill="none" />
        <Fill rect={[cx + w / 2 - 24, cy - h / 2 + 7, 16, 19]} color={k === 1 ? EMBER.books[4] : EMBER.houseLit} offset={false} />
        <Ink d={`M${cx - w / 2} ${cy - h / 2}h${w}v${h}h${-w}Z`} width={W.hair} />
        <Ink d={textLines(cx - w * 0.3, cy + h * 0.02, w * 0.46, {n: 2, gap: 11, seed: `s12/addr${k}`, heading: false})} width={1.4} />
        {k === 0 ? <Ink d={`M${cx - w / 2} ${cy - h / 2}L${cx} ${cy + 2}L${cx + w / 2} ${cy - h / 2}`} width={W.hair} /> : null}
      </XG>
    );
  };
  return (
    <>
      {env(x, y, 118, 70, -9, 0, EMBER.skyLow)}
      {env(x + 12, y + 26, 112, 66, 6, 1, EMBER.frost)}
      {env(x - 8, y + 52, 104, 62, -3, 2, EMBER.card)}
    </>
  );
};

/** A one-shot puff of steam over the mug (the ding's answer in the back row): three warm-white puffs that burst up,
 *  grow and thin away over 0.8 s. */
export const SteamPuff: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useTime();
  const u = (t - at) / 0.8;
  if (u < 0 || u > 1) return null;
  const e = 1 - (1 - u) * (1 - u);
  return (
    <g opacity={1 - u * u}>
      {[[-14, 0, 1], [10, 0.12, 0.85], [-2, 0.24, 0.7]].map(([dx, lag, k], i) => {
        const v = Math.max(0, (u - lag) / (1 - lag));
        const ev = 1 - (1 - v) * (1 - v);
        const r = (10 + 20 * ev) * k;
        return <path key={i} d={blob(x + dx + 8 * ev * (i - 1), y - 20 - 90 * ev - i * 14 * e, r, r * 0.86, {seed: `s12/puff${i}`})} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1.2} />;
      })}
    </g>
  );
};

const crumbs = (pts: [number, number, number][]) =>
  pts.map(([cx, cy, cr], i) => <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />);

// ---------------------------------------------------------------- the desk: mid (round the tag)

export const S12DeskMid: React.FC<{port: Pt; ding: number}> = ({port, ding}) => (
  <>
    <Headphones x={112} y={1214} w={168} seed="s12/hp" ink={W.far} />
    {/* the mittens turned more upright (cuff down, thumb out) so they read as mittens at phone size */}
    <XG m={mat.about(mat.rotate(58), 50, 1342)}>
      <Mittens x={24} y={1330} />
    </XG>
    <ScarfNest />
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
    <AirmailLetters x={548} y={1592} />
    <ClipDish x={718} y={1556} />
    <Pen from={[612, 1676]} to={[752, 1630]} wPx={14} color={EMBER.dc} seed="s12/pen2" />
    <PhoneDown x={560} y={1800} seed="s12/phone" />
    <DuskRadio x={944} y={1600} w={116} />
    <ClosedPlanner x={770} y={1668} />
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

const PIP = {x: 206, y: 1442, scale: 1.55};

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
    {t: -9, pose: 'sit-front', expression: 'neutral'},
    {t: strike - 0.08, pose: 'sit-front', expression: 'wide'},
    {t: ding + 0.02, pose: 'ears-cover'},
    {t: on - 0.04, pose: 'sit-front', expression: 'wide'},
  ];
  const look: LookKey[] = [
    {t: -9, v: -0.6},
    {t: stick[0] + 0.14, v: 0.75},
    {t: on - 0.04, v: 0},
  ];
  const hops: PipHop[] = [{t: ding + 0.02, to: [PIP.x - 18, PIP.y], height: 12, dur: 0.22}];
  // the lean (deg, about the feet): in toward the tag as the strike draws on, thrown back on the ding, upright by "on"
  // ... and on "on" it squares up to us with an anxious head tilt (-7 deg, a small overshoot), so the turn reads
  const lean = 6 * ease01(t, strike - 0.1, 0.26) - 11 * ease01(t, ding, 0.1) + 5 * ease01(t, ding + 0.22, 0.36) - 7 * ease01(t, on - 0.04, 0.16) + ring(t, on + 0.12, 2.5, 2.4, 5);
  const {x: fx, y: fy} = pipPlace(t, PIP.x, PIP.y, hops);
  return (
    <XG m={mat.about(mat.rotate(lean), fx, fy)}>
      <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.18} seed={7} keys={keys} look={look} lookDur={0.12} hops={hops} jolts={[on - 0.04]} />
    </XG>
  );
};
