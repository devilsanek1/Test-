// S8_edges (lane S7-S8, G5b): the desk world round S8's extreme close (18.28-19.40), EDGES ONLY: the 700 px stick owns
// the frame (docs/v3/density_plan_g5b.md §1 S8, cozy v2 overrides). S8 is S7 redrawn at 3.3x on its axis, so the desk
// clutter is S7's, cheated in at the frame edges at close size:
//   wall top     (y < 290) the lowest string-light bulbs, big (the strand hangs closer here), a pothos trailing from the
//                shelf above the top-right corner, plaster ticks. The strip under them is the calm caption band.
//   the laptop   a sticky note with a scribble on the bezel's top-left corner (it lifts when the stick lands), hairline
//                legends on the visible key caps, three caps that spring back up after the stick leaves the slot.
//   desk         the spiral notebook and its pen cut by the left edge, a biscuit and crumbs, a sticky note and your phone's
//                corner cut by the bottom edge, the charger's cable cut by the right edge, wood grain; the pool as built.
//   Pip          bottom right (1.85x, S7's side), sitting on the desk in front of the deck with its head over the deck's
//                front edge, eyes wide at the rising stick; on "chips" (18.76) its trunk reaches toward the stick and sniffs.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, line, polyPath, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Cable, DeskGrain, EMBER, FramedPrint, Glasses, Leaf, Pip3, quadPt, ring, StringLights3, sway, Txt, WallMarks, W, type LookKey, type PipPoseKey, type Pt} from '../kit';
import {PhotoLine} from './O1_life';
import {Clementines, Pen, PhoneDown, SpiralNotebook} from './S7_desk';

type Quad = [Pt, Pt, Pt, Pt];

// ---------------------------------------------------------------- timing (S8-local seconds; VO = 18.28 + t)

/** The stick lands (S8.tsx: rise 0 -> 0.4 s on an overshoot). */
export const S8_LAND = 0.4;
/** "chips" (18.76). */
const CHIPS = 18.76 - 18.28;

// ---------------------------------------------------------------- the wall above the band

/** Two pothos vines trailing from the shelf above the frame (top-right corner); they sway (+-2 deg, 3.6 s). */
const Vines: React.FC = () => {
  const t = useTime();
  const vine = (x0: number, len: number, k: number, seedK: number) => {
    const a = sway(t, 2, 3.6, k);
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++) pts.push([x0 + Math.sin(i * 0.9 + k) * 10, -40 + (len * i) / 5]);
    const leaves = pts.slice(1).map(([lx, ly], i) => <Leaf key={i} x={lx + (i % 2 ? 6 : -6)} y={ly + 8} s={30 - i * 2} rot={i % 2 ? 40 : -40} color={i % 3 === 1 ? EMBER.leaf : '#4C6A47'} seed={`s8/vl${seedK}${i}`} ink={W.far} vein />);
    return (
      <XG key={seedK} m={mat.about(mat.rotate(a), x0, -40)}>
        <Ink d={smooth(pts)} width={W.far} color={EMBER.leaf} />
        {leaves}
      </XG>
    );
  };
  return (
    <>
      {vine(968, 238, 0.4, 0)}
      {vine(1046, 262, 1.7, 1)}
    </>
  );
};

export const S8WallTop: React.FC = () => (
  <>
    <WallMarks x={60} y={30} w={500} h={160} n={4} seed="s8/wm1" />
    <WallMarks x={330} y={206} w={560} h={60} n={4} seed="s8/wm2" />
    {/* S7's sea print, at close size, between the bulbs */}
    <FramedPrint x={486} y={126} w={136} h={146} picture="sea" seed="s8/print" ink={W.far} />
    {/* S7's instant photos on their cord, at close size (top left, bottoms ~214) */}
    <XG m={mat.scale(2)}>
      <PhotoLine x0={-30} y0={30} x1={150} y1={24} sag={10} />
    </XG>
    {/* the lowest bulbs of S7's strand, at close size (bulbs ~y 120-225, halos clear of the band) */}
    <StringLights3 points={[[260, -40], [560, 116], [900, 100], [1160, -40]]} sag={20} n={3} r={20} sway={2.4} ink={W.far} seed="s8/lights" />
    <Vines />
  </>
);

// ---------------------------------------------------------------- the laptop's edges

/** A sticky note stuck on the bezel's top-left corner, with a scribble (a reminder) and a doodle; it lifts on the landing. */
export const BezelNote: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 136}) => {
  const t = useTime();
  const a = -7 + ring(t, S8_LAND - 0.02, 7, 3, 3.6) + sway(t, 0.6, 3.1);
  const s = size;
  // the note curls a little at its free (bottom) edge
  const d = `M${x} ${y}L${x + s} ${y + 2}L${x + s + 2} ${y + s * 0.92}Q${x + s * 0.5} ${y + s * 1.04} ${x - 2} ${y + s * 0.96}Z`;
  const scribble = smooth([[x + s * 0.14, y + s * 0.34], [x + s * 0.3, y + s * 0.28], [x + s * 0.46, y + s * 0.36], [x + s * 0.62, y + s * 0.3], [x + s * 0.8, y + s * 0.34]]) + smooth([[x + s * 0.14, y + s * 0.54], [x + s * 0.32, y + s * 0.5], [x + s * 0.52, y + s * 0.57], [x + s * 0.66, y + s * 0.52]]);
  return (
    <XG m={mat.about(mat.rotate(a), x + s * 0.5, y)}>
      <Fill d={d} color={EMBER.ring} seed="s8/note" />
      <Fill rect={[x, y, s, s * 0.16]} color={EMBER.books[0]} offset={false} />
      <Ink d={d} width={W.far} />
      <Ink d={scribble} width={W.hair * 1.4} />
      {/* a little heart doodle */}
      <Ink d={`M${x + s * 0.74} ${y + s * 0.76}c-6 -10 -20 -4 -12 6l12 10l12 -10c8 -10 -6 -16 -12 -6z`} width={W.hair * 1.2} />
    </XG>
  );
};

/** A round sticker on the lid's bottom bezel, right of the stick (the old laptop's: a snowflake on dusk blue). */
export const BezelSticker: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 30}) => {
  let flake = '';
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3 + 0.2;
    const dx = Math.cos(a) * r * 0.62;
    const dy = Math.sin(a) * r * 0.62;
    flake += `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
  }
  return (
    <>
      <Fill d={circle(x, y, r)} color={EMBER.skyLow} seed="s8/stk" />
      <path d={flake} stroke={EMBER.snow} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Ink d={circle(x, y, r, {seed: 's8/stkI'})} width={W.far} />
    </>
  );
};

/** The kit laptop's key-cap layout (Laptop.tsx, w >= 800): centre of cap j on row i. */
const capCentre = (deck: Quad, i: number, j: number): Pt => {
  const v = [0.18, 0.36, 0.54][i];
  const u0 = 0.09 - i * 0.012;
  const u1 = 0.91 + i * 0.012;
  const step = (u1 - u0) / 12;
  return quadPt(deck, u0 + j * step + step * 0.5, v);
};
const capQuad = (deck: Quad, i: number, j: number): Pt[] => {
  const v = [0.18, 0.36, 0.54][i];
  const u0 = 0.09 - i * 0.012;
  const u1 = 0.91 + i * 0.012;
  const step = (u1 - u0) / 12;
  const a = u0 + j * step + step * 0.12;
  const c = a + step * 0.76;
  const hv = 0.055;
  return [quadPt(deck, a, v - hv), quadPt(deck, c, v - hv), quadPt(deck, c, v + hv), quadPt(deck, a, v + hv)];
};

/** Hairline legends on every cap (the stick covers the middle ones once it stands), the speaker grilles either side of
 *  the trackpad and the webcam dot on the top bezel: the close-up's fine detail on the subject, all one step off its
 *  ground (light legends on the dark caps, heroDeep dots on the hero deck). */
export const KeyLegends: React.FC<{deck: Quad; lid: Quad}> = ({deck, lid}) => {
  const rows = ['QWERTYUIOP[]', "ASDFGHJKL;'#", 'ZXCVBNM,./?^'];
  const out: React.ReactNode[] = [];
  rows.forEach((row, i) => {
    for (let j = 0; j < 12; j++) {
      const [cx, cy] = capCentre(deck, i, j);
      if (cx < -30 || cx > 1110) continue;
      out.push(
        <Txt key={`${i}_${j}`} x={cx - 4} y={cy + 8} size={26} fill={EMBER.reveal}>
          {row[j]}
        </Txt>,
      );
    }
  });
  // speaker grilles: dots in two blocks beside the trackpad
  let dots = '';
  for (const [u0, u1] of [[0.13, 0.31], [0.69, 0.87]] as const) {
    for (let r = 0; r < 4; r++) {
      for (let k = 0; k < 9; k++) {
        const [x, y] = quadPt(deck, u0 + ((u1 - u0) * (k + 0.5)) / 9, 0.72 + r * 0.055);
        if (x < -10 || x > 1090) continue;
        dots += `M${(x - 3.2).toFixed(1)} ${y.toFixed(1)}a3.2 2.6 0 1 0 6.4 0a3.2 2.6 0 1 0 -6.4 0`;
      }
    }
  }
  const cam = quadPt(lid, 0.5, 0.09);
  return (
    <>
      {out}
      <path d={dots} fill={EMBER.anchor} />
      <circle cx={cam[0]} cy={cam[1]} r={9} fill={EMBER.anchor} stroke={EMBER.ink} strokeWidth={1.6} />
      <circle cx={cam[0] + 2.5} cy={cam[1] - 2.5} r={2.6} fill={EMBER.skyLow} />
    </>
  );
};

/** Three caps by the slot that the rising stick pushed down: they spring back up (secondary, damped 0.1-0.5 s). */
export const KeySprings: React.FC<{deck: Quad}> = ({deck}) => {
  const t = useTime();
  const caps: [number, number, number][] = [
    [2, 1, 0.1],
    [1, 10, 0.16],
    [2, 10, 0.2],
  ];
  return (
    <>
      {caps.map(([i, j, at], k) => {
        // pressed (6 px down) until `at`, then a damped spring back
        const dy = t < at ? 6 : 6 * Math.cos((t - at) * 5.5 * 2 * Math.PI) * Math.exp(-(t - at) * 9);
        const q = capQuad(deck, i, j).map(([x, y]) => [x, y + dy] as Pt);
        return (
          <React.Fragment key={k}>
            <path d={polyPath(capQuad(deck, i, j))} fill={EMBER.hero} />
            <path d={polyPath(q)} fill={EMBER.anchor} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the desk in front

/** One big biscuit (chocolate chips) and crumbs. */
const Biscuit: React.FC<{x: number; y: number; r?: number; seed: string}> = ({x, y, r = 58, seed}) => {
  const R = rng(`${seed}/r`);
  const d = `M${x - r} ${y}A${r} ${r * 0.6} 0 1 0 ${x + r * 0.7} ${y - r * 0.44}Q${x + r * 0.36} ${y - r * 0.1} ${x + r * 0.62} ${y + r * 0.12}Q${x + r * 0.12} ${y - r * 0.26} ${x - r} ${y}Z`;
  const chips = Array.from({length: 6}, (_, j) => blob(x + R.jitter(r * 0.6), y + R.jitter(r * 0.3), 6, 4.5, {seed: `${seed}/c${j}`})).join('');
  return (
    <>
      <Fill d={d} color={EMBER.books[6]} seed={`${seed}/f`} />
      <Ink d={d} width={W.far} />
      <Fill d={chips} color={EMBER.anchor} offset={false} />
      {[[x + r * 1.3, y + r * 0.5, 5], [x + r * 1.6, y + r * 0.2, 4], [x + r * 1.1, y + r * 0.8, 3.4], [x - r * 1.2, y + r * 0.6, 4]].map(([cx, cy, cr], i) => (
        <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />
      ))}
    </>
  );
};

/** A sticky note lying on the desk, flat, a line of writing. */
const DeskNote: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; seed: string}> = ({x, y, s = 120, rot = 10, color = EMBER.hl, seed}) => (
  <XG m={mat.about(mat.rotate(rot), x + s / 2, y + s / 2)}>
    <Fill rect={[x, y, s, s * 0.9]} color={color} seed={`${seed}/f`} />
    <Ink d={`M${x} ${y}h${s}v${s * 0.9}h${-s}Z`} width={W.hair} />
    <Ink d={line(x + s * 0.15, y + s * 0.34, x + s * 0.8, y + s * 0.32, {over: [0, 0], seed: `${seed}/l1`}) + line(x + s * 0.15, y + s * 0.56, x + s * 0.6, y + s * 0.56, {over: [0, 0], seed: `${seed}/l2`})} width={W.hair} />
  </XG>
);

export const S8DeskFront: React.FC = () => (
  <>
    <DeskGrain x={240} y={1560} w={520} h={120} n={2} seed="s8/grain1" />
    <DeskGrain x={-20} y={1800} w={1100} h={80} n={2} seed="s8/grain2" />
    {/* the spiral notebook and its pen, cut by the left edge (S7's notebook at close size) */}
    <SpiralNotebook quad={[[-330, 1508], [150, 1494], [190, 1900], [-300, 1930]]} rings={8} ringR={1.7} pen={[[-40, 1780], [236, 1590]]} penW={26} ink={W.front} seed="s8/nb" />
    <Biscuit x={378} y={1660} seed="s8/biscuit" />
    <Pen from={[452, 1748]} to={[700, 1700]} wPx={22} color={EMBER.dc} seed="s8/pen2" />
    <Clementines x={236} y={1548} k={1.9} seed="s8/clem" />
    <Glasses x={598} y={1612} w={230} rot={9} seed="s8/glasses" ink={W.mid} />
    {[[488, 1560, 4], [520, 1590, 3], [460, 1600, 3.4], [640, 1700, 4]].map(([cx, cy, cr], i) => (
      <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />
    ))}
    {/* your phone's corner and a sticky note cut by the bottom edge */}
    <PhoneDown x={520} y={1772} w={330} rot={-6} seed="s8/phone" />
    <DeskNote x={286} y={1790} s={128} rot={-12} color={EMBER.ring} seed="s8/note2" />
    {/* the charger's cable on the desk, out by the right edge (S7's runs to the right port) */}
    <Cable points={[[1130, 1560], [1040, 1600], [960, 1690], [1000, 1800], [1130, 1846]]} width={11} color={EMBER.dcSide} ink={W.far} />
  </>
);

// ---------------------------------------------------------------- Pip

const PIP = {x: 806, y: 1586, scale: 1.85};
/** Pip in front of the deck (S7's side), eyes wide at the rising stick; on "chips" the trunk reaches up toward the stick
 *  ('hold' pose, flipped so it curls left to the stick) and sniffs twice. */
const PIP_KEYS: PipPoseKey[] = [
  {t: -9, pose: 'sit-front', expression: 'wide'},
  {t: CHIPS - 0.02, pose: 'hold', expression: 'wide'},
];
const PIP_LOOK: LookKey[] = [
  {t: -9, v: 0.7},
  {t: 0.2, v: 0.9},
];

export const S8Pip: React.FC = () => (
  <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.25} seed={7} flip keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.16} jolts={[0.14, CHIPS + 0.2, CHIPS + 0.38]} />
);

