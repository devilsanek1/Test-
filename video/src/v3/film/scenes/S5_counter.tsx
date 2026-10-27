// S5_counter (S5 lane, G5b): the shop counter and the shop assistant (docs/v3/density_plan_g5b.md S5).
// The camera stands behind the counter, on the till side, beside the assistant: the counter's far edge cuts you at the
// waist (LOCKED, y 1395); we see its top (a wooden top with grain, the things on it) and, under its near edge, the
// staff side's open cubbies: paper bags, binders, receipt rolls, a cable box, boxed laptops, a pen cup, a stapler, a
// toolbox, flyers, an extension lead, a cash box. On the top: a counter bell, the card reader (LED blinks), the receipt
// printer (your receipt feeds out and curls over the near edge: the loop, 9.70-10.30 VO), a jar of USB sticks, a
// business-card stand, a pen. In front of it all, the assistant: a big back view cut by the left and bottom edges
// (the shop's dusk-blue polo, the S4 shopkeeper's hair, a lanyard), breathing; the head turns after the pop.
// Nothing here enters your laptop's and tag's ring (x ~370-670, y ~1090-1400) or Pip's spot (x ~220-330).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {line, rect as rectInk, roundRect} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  CardReader,
  CounterBell,
  DeskGrain,
  EMBER,
  LaptopBox,
  PenCup,
  Plant,
  ReceiptPrinter,
  UsbJar,
  W,
  WinterPerson,
  personGeo,
  winterPersonMat,
} from '../kit';
import type {PersonMove, WinterPersonProps} from '../kit';
import {KRAFT} from './S5_shop';

/** The counter: far edge (LOCKED: cuts you at the waist), near edge of the top, the top's front lip. */
export const COUNTER_Y = 1395;
const NEAR_Y = 1488;
const LIP_Y = 1510;
/** The cubbies under the near edge (staff side). */
const COLS: [number, number][] = [
  [-60, 236],
  [258, 516],
  [538, 796],
  [818, 1140],
];
const ROWS: [number, number][] = [
  [1532, 1712],
  [1734, 1990],
];
/** Cubby insides (a shade of the desk wood: shadows are colour) and the short shadow under each shelf. */
const CUBBY = '#B9714F';
const CUBBY_SHADOW = '#9C573F';
const KRAFT2 = '#D9A07A';

// ---------------------------------------------------------------- the cubbies' contents

const PaperBags: React.FC<{x: number; floor: number}> = ({x, floor}) => {
  const bags = [0, 1, 2, 3, 4].map((i) => ({x: x + [0, 8, -4, 10, 2][i], y: floor - (i + 1) * 17, w: [214, 206, 218, 200, 210][i], c: i % 2 ? KRAFT2 : KRAFT}));
  const top = bags[bags.length - 1];
  return (
    <>
      {bags.map((bg, i) => (
        <React.Fragment key={i}>
          <rect x={bg.x} y={bg.y} width={bg.w} height={17} fill={bg.c} />
          <path d={`M${bg.x} ${bg.y + 17}h${bg.w}`} stroke={EMBER.beam} strokeWidth={1.6} />
        </React.Fragment>
      ))}
      <path d={`M${top.x + 50} ${top.y}q20 -26 40 0M${top.x + 120} ${top.y}q20 -26 40 0`} fill="none" stroke={EMBER.beam} strokeWidth={3} />
      <Ink d={rectInk(x - 6, floor - 85, 230, 85, {seed: 's5ct/bagsI', over: [0, 0], edges: 'tlr'})} width={W.hair} />
      {/* a roll of tape on the stack */}
      <circle cx={x + 186} cy={top.y - 18} r={20} fill={EMBER.frost} stroke={EMBER.ink} strokeWidth={1.8} />
      <circle cx={x + 186} cy={top.y - 18} r={9} fill={CUBBY} stroke={EMBER.ink} strokeWidth={1.4} />
    </>
  );
};

const Binders: React.FC<{x: number; floor: number}> = ({x, floor}) => {
  const specs = [
    {w: 34, h: 168, c: EMBER.dc},
    {w: 30, h: 160, c: EMBER.beam},
    {w: 38, h: 170, c: EMBER.ring},
    {w: 32, h: 164, c: EMBER.card},
    {w: 36, h: 166, c: EMBER.skyLow},
  ];
  let xx = x;
  const out: React.ReactNode[] = [];
  specs.forEach((s, i) => {
    const y = floor - s.h;
    out.push(
      <React.Fragment key={i}>
        <rect x={xx} y={y} width={s.w} height={s.h} fill={s.c} />
        <rect x={xx + 6} y={y + 28} width={s.w - 12} height={40} fill={EMBER.card} />
        <path d={`M${xx + 9} ${y + 40}h${s.w - 18}M${xx + 9} ${y + 50}h${s.w - 22}`} stroke={EMBER.ink} strokeWidth={1.2} />
        <circle cx={xx + s.w / 2} cy={floor - 30} r={6} fill={CUBBY} stroke={EMBER.ink} strokeWidth={1.2} />
        <path d={`M${xx} ${y}h${s.w}v${s.h}h${-s.w}Z`} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
      </React.Fragment>,
    );
    xx += s.w + 2;
  });
  // the last binder leans on the stack
  out.push(
    <XG key="lean" m={mat.about(mat.rotate(16), xx + 2, floor)}>
      <rect x={xx + 2} y={floor - 158} width={34} height={158} fill={EMBER.books[4]} />
      <rect x={xx + 8} y={floor - 130} width={22} height={36} fill={EMBER.card} />
      <path d={`M${xx + 2} ${floor - 158}h34v158h-34Z`} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
    </XG>,
  );
  return <>{out}</>;
};

const ReceiptRolls: React.FC<{x: number; floor: number}> = ({x, floor}) => {
  const roll = (cx: number, cy: number, k: number) => (
    <React.Fragment key={k}>
      <circle cx={cx} cy={cy} r={25} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1.8} />
      <circle cx={cx} cy={cy} r={16} fill="none" stroke={EMBER.frost} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={6} fill={CUBBY} />
    </React.Fragment>
  );
  return (
    <>
      {roll(x + 25, floor - 25, 0)}
      {roll(x + 76, floor - 25, 1)}
      {roll(x + 50, floor - 68, 2)}
      {/* a box of cables, one spilling over its edge */}
      <LaptopBox x={x + 120} y={floor - 72} w={124} h={72} color={KRAFT} seed="s5ct/cablebox" ink={W.hair} />
      <path d={`M${x + 150} ${floor - 72}c-10 -30 40 -40 44 -6c4 30 -40 26 -30 -4M${x + 214} ${floor - 72}c10 -14 26 -4 20 16c-4 18 6 30 12 40`} fill="none" stroke={EMBER.dcSide} strokeWidth={5} strokeLinecap="round" />
    </>
  );
};

const BottomRow: React.FC = () => {
  return (
    <>
      {/* c2: boxed laptops (kraft and cream: never the hero) */}
      <LaptopBox x={270} y={1846} w={232} h={80} color={KRAFT} seed="s5ct/bx1" ink={W.hair} />
      <LaptopBox x={284} y={1784} w={204} h={62} color={EMBER.card} seed="s5ct/bx2" ink={W.hair} />
      {/* c3: a pen cup, a stapler, a toolbox */}
      <PenCup x={588} y={1900} w={58} color={EMBER.dc} seed="s5ct/pens" ink={W.hair} />
      <path d={`M640 1900h74v-14l-60 -10h-14Z`} fill={EMBER.anchor} />
      <path d={`M644 1876l66 8`} stroke={EMBER.frost} strokeWidth={2} />
      <Fill d={roundRect(690, 1838, 98, 62, 6)} color={EMBER.dcSide} seed="s5ct/tool" offset={false} />
      <path d={`M716 1838v-16h46v16`} fill="none" stroke={EMBER.ink} strokeWidth={4} />
      <path d={`M690 1858h98`} stroke={EMBER.dc} strokeWidth={4} />
      <Ink d={roundRect(690, 1838, 98, 62, 6, {closed: false, seed: 's5ct/toolI'})} width={W.hair} />
      {/* c4: flyers, an extension lead, a cash box */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={836 + i * 8} y={1820 - i * 6} width={110} height={80 + i * 6} fill={[EMBER.card, EMBER.ring, EMBER.hl][i]} stroke={EMBER.ink} strokeWidth={1.2} transform={`rotate(${-4 + i * 3} ${890} ${1900})`} />
      ))}
      <path d={`M962 1896c-30 -4 -34 -40 0 -42c34 -2 36 36 4 40c-24 2 -26 -24 -4 -26`} fill="none" stroke={EMBER.dcSide} strokeWidth={6} />
      <Fill d={roundRect(1000, 1832, 110, 70, 6)} color={EMBER.dc} seed="s5ct/cash" offset={false} />
      <rect x={1040} y={1856} width={22} height={8} fill={EMBER.dcDark} />
      <path d={`M1030 1832v-10h50v10`} fill="none" stroke={EMBER.ink} strokeWidth={3} />
      <Ink d={roundRect(1000, 1832, 110, 70, 6, {closed: false, seed: 's5ct/cashI'})} width={W.hair} />
    </>
  );
};

/** The counter: the wooden top (grain), its lip, the staff side's cubbies and what is in them. */
export const S5Counter: React.FC = () => (
  <>
    {/* cubbies: frame, insides, the short shadow under each shelf, contents */}
    <Fill rect={[-60, LIP_Y, 1200, 520]} color={EMBER.desk} offset={false} />
    {ROWS.map(([y0, y1], r) =>
      COLS.map(([x0, x1], c) => (
        <React.Fragment key={`${r}${c}`}>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={CUBBY} />
          <rect x={x0} y={y0} width={x1 - x0} height={12} fill={CUBBY_SHADOW} />
        </React.Fragment>
      )),
    )}
    <PaperBags x={278} floor={ROWS[0][1]} />
    <Binders x={552} floor={ROWS[0][1]} />
    <ReceiptRolls x={832} floor={ROWS[0][1]} />
    <BottomRow />
    <Ink
      d={COLS.flatMap(([x0, x1], c) => ROWS.map(([y0, y1], r) => rectInk(x0, y0, x1 - x0, y1 - y0, {seed: `s5ct/cb${r}${c}`, over: [0, 0]}))).join('')}
      width={W.mid}
    />
    {/* a sticky note and a taped staff rota on the frame */}
    <path d={`M528 1520h46v44h-46Z`} fill={EMBER.hl} transform="rotate(-7 551 1542)" />
    <path d={`M534 1534h30M534 1544h22`} stroke={EMBER.ink} strokeWidth={1.4} transform="rotate(-7 551 1542)" />
    {/* the top: wood with grain, its near edge and lip */}
    <Fill rect={[-60, COUNTER_Y, 1200, NEAR_Y - COUNTER_Y]} color={EMBER.shelf} seed="s5ct/top" />
    <DeskGrain x={20} y={COUNTER_Y + 18} w={1040} h={NEAR_Y - COUNTER_Y - 30} n={9} seed="s5ct/grain" />
    <Fill rect={[-60, NEAR_Y, 1200, LIP_Y - NEAR_Y]} color={EMBER.beam} offset={false} />
    <Ink d={line(-60, COUNTER_Y, 1140, COUNTER_Y, {seed: 's5/c1', over: 'structural'})} width={W.front} />
    <Ink d={line(-60, NEAR_Y, 1140, NEAR_Y, {seed: 's5ct/near', over: 'structural'})} width={W.front} />
    <Ink d={line(-60, LIP_Y, 1140, LIP_Y, {seed: 's5ct/lip', over: [0, 0]})} width={W.mid} />
  </>
);

// ---------------------------------------------------------------- on the counter top

/** The things on the counter top (bases between the far edge and the near edge). `feedAt`: your receipt prints. */
export const S5CounterTop: React.FC<{feedAt: number; feedDur: number}> = ({feedAt, feedDur}) => (
  <>
    {/* a pen and a business-card stand in front of you (low: under your tag) */}
    <path d={`M404 1466L486 1452`} stroke={EMBER.anchor} strokeWidth={7} strokeLinecap="round" />
    <path d={`M470 1455l14 -2`} stroke={EMBER.frost} strokeWidth={3} strokeLinecap="round" />
    <Fill d={`M560 1472h64l-8 -14h-48Z`} color={EMBER.dcSide} seed="s5ct/cards" offset={false} />
    <path d={`M570 1460l4 -20h40l-2 20`} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1.4} />
    <path d={`M580 1450h24`} stroke={EMBER.dc} strokeWidth={2} />
    <CounterBell x={694} y={1446} w={62} seed="s5ct/bell" ink={W.mid} />
    <CardReader x={772} y={1436} w={76} seed="s5ct/reader" ink={W.mid} />
    <Plant x={1066} y={1436} kind="snake" size={124} seed="s5ct/snake" ink={W.mid} />
    <UsbJar x={996} y={1446} w={70} seed="s5ct/usb" ink={W.mid} />
    <ReceiptPrinter x={884} y={1476} w={124} feedAt={feedAt} feedDur={feedDur} len={260} seed="s5ct/printer" ink={W.mid} />
  </>
);

// ---------------------------------------------------------------- the assistant (foreground, behind the counter)

const STAFF_SEED = 's5ct/staff';
const STAFF_S = 4.4;
const STAFF_TORSO = 175;
/** The assistant's head top (canvas px) and hip x: the whole head in frame, the shoulders cut by the left edge. */
const STAFF_TOP = 1262;
const STAFF_X = 92;

/** A big back view cut by the left edge and the bottom: the shop's dusk-blue polo with a yoke seam and collar, the S4
 *  shopkeeper's red-brown hair in a bun, a lanyard cord round the neck; breathing, a look-around after the pop. */
export const S5Assistant: React.FC<{turnAt: number}> = ({turnAt}) => {
  const t = useTime();
  const g = personGeo(STAFF_SEED, {torsoH: STAFF_TORSO});
  const hip = STAFF_TOP - g.headTop * STAFF_S;
  const moves: PersonMove[] = [{t: turnAt, kind: 'turn', amp: 1.3}];
  const props: WinterPersonProps = {
    x: STAFF_X,
    y: hip,
    s: STAFF_S,
    seed: STAFF_SEED,
    torsoH: STAFF_TORSO,
    hair: 'bun',
    hairColor: '#7A3A24',
    coat: EMBER.dc,
    acc: ['collar'],
    coatDetail: ['yoke'],
    moves,
    breathe: 2.2,
    ink: W.front,
    hero: true,
    rim: false,
  };
  // the lanyard: a cord round the back of the neck, in the figure's own space (it breathes and turns with it)
  const m = winterPersonMat(props, t);
  const neckY = -g.h - g.hr * 0.1;
  // the shop's mark printed on the upper back (S4's COMPUTERS fascia: a laptop and the name)
  const ly = -g.h + g.w * 0.36;
  const k = 1 / STAFF_S;
  return (
    <>
      <WinterPerson {...props} />
      <XG m={m}>
        <path d={`M${-g.hr * 0.95} ${neckY + g.hr * 0.25}Q0 ${neckY + g.hr * 0.95} ${g.hr * 0.95} ${neckY + g.hr * 0.25}`} fill="none" stroke={EMBER.hl} strokeWidth={5 * k} strokeLinecap="round" />
        <path d={`M-10 ${ly - 8}h20v12h-20ZM-14 ${ly + 6}h28l-3 3.4h-22Z`} fill="none" stroke={EMBER.core} strokeWidth={3.4 * k} strokeLinejoin="round" />
        <path d={`M-17 ${ly + 17}h34`} stroke={EMBER.skyLow} strokeWidth={4.4 * k} strokeLinecap="round" />
      </XG>
    </>
  );
};
