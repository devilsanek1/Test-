// P6 helper (lane L3-people): P6's set, a LOCAL copy of kit Nook.tsx NookAngle (same room, same pieces, same seeds) with
// the art director's P6 fixes the kit API can't take yet (fold back into NookAngle: REQUESTS line in the lane report):
//   - the LAMP slides left and back, beside the mic (x 165, h 132; the kit had x 424, h 150): its dark shade touched her
//     near shoulder and her hair and measured as one dark mass with them, right where the bubble's tail points. Now a
//     band of lamp-lit wall separates the shade from her, and a gap of wall from the mic's head. Its wall glow is drawn
//     first (it no longer covers the clock), its pool stays on the desk in front of her (a little left, under the lamp).
//   - the succulent that stood where the lamp's base now stands is gone (the bookcase and the floor plant carry the green).
//   - her phone lies FACE UP (a warm screen, a notification lights it once, late in the shot): the kit's navy slab read
//     as a black box at phone size.
//   - a `cat` slot drawn BEFORE the big floor plant, so her cat on the desk's right end sits partly behind its leaves.
import React from 'react';
import {blob, crown, hline, line, poly, polyPath, rect, roundRect, smooth, textLines, vline} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {
  BookPile,
  Books,
  CandleFlame,
  CC,
  DuskTown,
  FloorPlant,
  FramedPicture,
  HighShelf,
  Live,
  NOOK_ANGLE,
  NookMug,
  PaperStack,
  PotPlant,
  Sway,
  TableLamp,
  WallClock,
  b,
  Fill,
  fillAt,
  Ink,
  W,
  type At,
  type DuskTownProps,
  type Pt,
} from '../kit';

/** The lamp beside the mic (screen px; base on the desk's back edge). */
export const P6_LAMP = {x: 165, h: 132};

/** Her phone face up on the desk (top-left x, y; 92 x 150): a warm screen; a notification lights it in [on0, on1). */
const PhoneUp: React.FC<{x: number; y: number; on: [number, number]; at?: At}> = ({x, y, on, at}) => {
  const t = useTime();
  const lit = t >= on[0] && t < on[1];
  return (
    <>
      <Fill d={roundRect(x + 6, y + 8, 92, 150, 16)} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(x, y, 92, 150, 16)} color={CC.anchor} seed="p6phoneB" at={fillAt(at)} />
      <Ink d={roundRect(x, y, 92, 150, 16, {seed: 'p6phoneI'})} width={W.mid} at={at} />
      <Live at={at} c={[x + 46, y + 75]}>
        <rect x={x + 8} y={y + 12} width={76} height={126} rx={8} fill={lit ? CC.core : CC.paperEdge} />
        {lit ? (
          <>
            <rect x={x + 14} y={y + 34} width={64} height={32} rx={6} fill={CC.paper} />
            <rect x={x + 20} y={y + 42} width={38} height={6} fill={CC.ink} />
            <rect x={x + 20} y={y + 54} width={26} height={6} fill={CC.ink} />
            <circle cx={x + 68} cy={y + 46} r={5} fill={CC.rug} />
          </>
        ) : (
          <rect x={x + 30} y={y + 120} width={32} height={5} rx={2} fill={CC.wallShade} />
        )}
      </Live>
    </>
  );
};

export const P6Set: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; behind?: React.ReactNode; cat?: React.ReactNode; phoneOn?: [number, number]; children?: React.ReactNode}> = ({town, slab = true, at, behind, cat, phoneOn = [3.0, 3.55], children}) => {
  const A = NOOK_ANGLE;
  const vp: Pt = [520, 1300];
  const boards = [-400, -160, 80, 320, 560, 800, 1040, 1280, 1520].map((bx, i) => {
    const u = (A.floor - vp[1]) / (2000 - vp[1]);
    return line(vp[0] + (bx - vp[0]) * u, A.floor, bx, 2000, {over: [0, 0], seed: `p6fb${i}`});
  });
  const rug: Pt[] = [[-60, 1800], [900, 1786], [1000, 2000], [-60, 2000]];
  const L = P6_LAMP;
  return (
    <>
      {slab ? <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
      {/* the lamp's warm light on the wall first (the lamp itself stands on the desk, beside the mic) */}
      <TableLamp x={L.x} y={A.deskBack + 12} h={L.h} glow={{rx: 200, ry: 124, dy: -18}} glowClip={[1160, A.deskBack]} pool={0} motes seed="p6lampglow" at={at} />
      {/* window */}
      <Fill rect={[535, 618, 600, 512]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Fill rect={[552, 632, 600, 498]} color={CC.trim} offset={false} at={fillAt(at)} />
      <DuskTown x={560} y={640} w={560} h={490} horizon={905} k={1.12} moon={[860, 740]} seed="p6town" {...town} at={at} />
      <Fill rect={[556, 636, 560, 54]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
      <Fill rect={[556, 690, 560, 8]} color={CC.winDark} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[554, 684, 560, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[893, 698, 14, 432]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={vline(535, 618, 1130, {over: [0, 0], seed: 'p6r'}) + vline(560, 640, 1130, {over: [0, 0], seed: 'p6g'}) + vline(893, 698, 1130, {over: [0, 0], seed: 'p6m1'}) + vline(907, 698, 1130, {over: [0, 0], seed: 'p6m2'}) + hline(535, 1140, 618, {over: [0, 0], seed: 'p6t'}) + hline(554, 1140, 694, {over: [0, 0], seed: 'p6b'})} width={W.mid} at={at} />
      <Fill rect={[523, 1130, 600, 12]} color={CC.sill} offset={false} at={fillAt(at)} />
      <Fill rect={[523, 1142, 600, 14]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Ink d={hline(523, 1140, 1130, {over: [4, 0], seed: 'p6s1'}) + hline(523, 1140, 1156, {over: [0, 0], seed: 'p6s2'})} width={W.mid} at={at} />
      <Fill d={roundRect(1010, 1090, 36, 40, 6)} color={CC.candle} at={fillAt(at)} seed="p6candle" />
      <Ink d={roundRect(1010, 1090, 36, 40, 6, {seed: 'p6candleI'})} width={W.far} at={at} />
      <CandleFlame x={1028} y={1088} h={22} seed="p6flame" at={at} />
      {/* the radiator under the window (right of her), its pipe */}
      <Fill rect={[770, 1196, 300, 232]} color={CC.radiator} at={fillAt(at)} seed="p6rad" />
      <Ink d={rect(770, 1196, 300, 232, {seed: 'p6radI', over: 'small'}) + Array.from({length: 11}, (_, i) => vline(770 + 27 * (i + 0.6), 1210, 1414, {over: [0, 0], seed: `p6rf${i}`})).join('')} width={W.far} at={at} />
      <Ink d={vline(1050, 1428, 1446, {over: [0, 0], seed: 'p6pipe'})} width={8} color={CC.radiator} taper={false} at={at} />
      {/* bookcase */}
      <Fill rect={[-200, 640, 340, 900]} color={CC.caseBack} offset={false} at={fillAt(at)} />
      <Books x0={-190} x1={118} base={826} hMin={120} hMax={170} seed="p6b1" at={at} />
      <Books x0={-190} x1={60} base={1016} hMin={110} hMax={160} seed="p6b2" at={at} />
      <Books x0={-190} x1={118} base={1206} hMin={120} hMax={160} seed="p6b3" at={at} />
      <Books x0={-190} x1={118} base={1396} hMin={110} hMax={150} seed="p6b4" at={at} />
      <PotPlant x={70} y={970} w={46} h={44} kind="leafy" seed="p6caseplant" at={at} />
      {[640, 826, 1016, 1206, 1396].map((y, i) => (
        <Fill key={i} rect={[-200, y, 340, 16]} color={CC.shelf} seed={`p6bb${i}`} at={fillAt(at)} />
      ))}
      <Fill rect={[118, 636, 22, 904]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Ink d={[640, 826, 1016, 1206, 1396].map((y, i) => hline(-60, 118, y, {seed: `p6bl${i}`, over: [0, 0]}) + hline(-60, 118, y + 16, {seed: `p6bm${i}`, over: [0, 0]})).join('') + vline(118, 636, 1540, {over: [0, 0], seed: 'p6u1'}) + vline(140, 636, 1540, {over: [0, 0], seed: 'p6u2'})} width={W.mid} at={at} />
      {/* the top edge: the home's high shelf, a print over the window (cut right), a trailing plant hanging */}
      <HighShelf x0={-40} x1={520} y={250} seed="p6hs" at={at} />
      <FramedPicture x={720} y={96} w={260} h={170} kind="hills" seed="p6toppic" at={at} />
      <Sway x={620} y={-20} amp={2.4} hz={0.17} seed="p6hang">
        <Ink d={line(620, -20, 604, 196, {over: [0, 0], seed: 'p6h1'}) + line(620, -20, 636, 196, {over: [0, 0], seed: 'p6h2'})} width={W.hair} at={at} />
        <PotPlant x={594} y={196} w={54} h={36} kind="trailing" seed="p6hangpot" at={at} />
      </Sway>
      {/* the wall between: prints and the clock, under the bubble's place */}
      <FramedPicture x={190} y={968} w={128} h={160} kind="hills" seed="p6pic1" at={at} />
      <FramedPicture x={346} y={1002} w={110} h={90} kind="portrait" seed="p6pic2" at={at} />
      <WallClock cx={398} cy={1180} r={40} seed="p6clock" at={at} />
      {/* her chair's back behind her shoulder (her body covers most of it) */}
      <Fill d={roundRect(690, 1306, 120, 34, 14)} color={CC.chair} at={fillAt(at)} seed="p6chairT" />
      <Fill rect={[776, 1336, 24, 110]} color={CC.chairShade} offset={false} at={fillAt(at)} />
      <Ink d={roundRect(690, 1306, 120, 34, 14, {seed: 'p6chairTI'}) + vline(776, 1340, 1440, {over: [0, 0], seed: 'p6chp1'}) + vline(800, 1340, 1440, {over: [0, 0], seed: 'p6chp2'})} width={W.mid} at={at} />
      {/* the floor under the desk: boards, the rug's edge, a wicker bin */}
      <Fill rect={[-200, A.floor, 1480, 400]} color={CC.floor} offset={false} at={fillAt(at)} />
      <Ink d={boards.join('')} width={W.hair} at={b(at, 0.04)} />
      <Fill d={polyPath(rug)} color={CC.rug} at={fillAt(at)} seed="p6rug" />
      <Ink d={hline(-60, 900, 1830, {over: [0, 0], seed: 'p6rugb'})} width={8} color={CC.rugBand} taper={false} at={b(at, 0.04)} />
      <Ink d={poly(rug, {closed: false, seed: 'p6rugI', over: [0, 0]})} width={W.mid} at={at} />
      <Fill rect={[-200, A.floor, 1480, 40]} color={CC.under} offset={false} at={fillAt(at)} />
      <Fill d={polyPath([[760, 1740], [880, 1740], [866, 1900], [774, 1900]])} color={CC.boxSide} at={fillAt(at)} seed="p6bin" />
      <Ink d={poly([[760, 1740], [880, 1740], [866, 1900], [774, 1900]], {closed: true, seed: 'p6binI', over: 'small'}) + line(800, 1750, 804, 1890, {over: [0, 0], seed: 'p6bw1'}) + line(840, 1750, 836, 1890, {over: [0, 0], seed: 'p6bw2'}) + hline(764, 876, 1790, {over: [0, 0], seed: 'p6bw3'})} width={W.far} at={at} />
      <Fill d={crown(820, 1736, 40, 18, {seed: 'p6ball', bumps: 8, round: 0.55})} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      {/* HER body (behind the desk: it hides her waist; her shins show under it) */}
      {behind}
      {/* the desk, full width, in front of her: top, apron with drawers, legs */}
      <Fill rect={[-200, A.deskBack, 1480, A.deskFront - A.deskBack]} color={CC.desk} offset={false} at={fillAt(at)} />
      <Fill d={blob(236, 1540, 290, 60, {seed: 'p6pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
      <Fill d={blob(210, 1530, 170, 34, {seed: 'p6pool2', wobble: 0.02})} color={CC.core} offset={false} at={fillAt(at)} />
      <Ink d={[1490, 1560, 1610].map((y) => smooth([[-40, y], [300, y + 4], [700, y - 3], [1120, y + 4]])).join('')} width={W.hair} color={CC.deskShade} at={at} />
      <Fill rect={[-200, A.deskFront, 1480, A.apron - A.deskFront]} color={CC.deskFront} offset={false} at={fillAt(at)} />
      {[[10, 36], [1004, 1030]].map(([l0, l1], i) => (
        <Fill key={`lg${i}`} rect={[l0, A.apron, l1 - l0, 300]} color={CC.deskFront} seed={`p6leg${i}`} at={fillAt(at)} />
      ))}
      <Ink d={hline(-60, 1140, A.deskBack, {seed: 'p6dk', over: [0, 0]}) + hline(-60, 1140, A.deskFront, {seed: 'p6dkf', over: [0, 0]}) + hline(-60, 1140, A.apron, {seed: 'p6dka', over: [0, 0]}) + rect(200, A.deskFront + 8, 280, 32, {seed: 'p6drw1', over: 'small'}) + rect(620, A.deskFront + 8, 280, 32, {seed: 'p6drw2', over: 'small'}) + [10, 36, 1004, 1030].map((lx, i) => vline(lx, A.apron, 1960, {over: [0, 0], seed: `p6lgI${i}`})).join('')} width={W.mid} at={at} />
      <Fill d={blob(340, A.deskFront + 24, 10, 6, {seed: 'p6knob1'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      <Fill d={blob(760, A.deskFront + 24, 10, 6, {seed: 'p6knob2'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      {/* on the desk: the lamp (beside the mic), a mug, books, papers, a pen, her phone face up, a standing photo, a stack */}
      <TableLamp x={L.x} y={A.deskBack + 12} h={L.h} glow={false} pool={0} motes={false} seed="p6lamp" at={at} />
      <NookMug x={18} top={1468} w={70} seed="p6mug" at={at} />
      <BookPile x={-20} y={1636} w={200} n={3} seed="p6deskbooks" at={at} />
      <Fill d={polyPath([[300, 1552], [520, 1542], [530, 1630], [306, 1640]])} color={CC.paper} at={fillAt(at)} seed="p6paper" />
      <Ink d={poly([[300, 1552], [520, 1542], [530, 1630], [306, 1640]], {closed: true, seed: 'p6paperI', over: 'small'}) + textLines(322, 1570, 170, {n: 3, gap: 20, seed: 'p6pl', heading: false})} width={W.far} at={at} />
      <Fill d={polyPath([[600, 1560], [770, 1552], [778, 1626], [606, 1634]])} color={CC.note2} at={fillAt(at)} seed="p6note" />
      <Ink d={poly([[600, 1560], [770, 1552], [778, 1626], [606, 1634]], {closed: true, seed: 'p6noteI', over: 'small'}) + textLines(620, 1578, 120, {n: 2, gap: 20, seed: 'p6nl', heading: false})} width={W.far} at={at} />
      <Ink d={line(220, 1612, 380, 1596, {over: [0, 0], seed: 'p6pen'})} width={12} color={CC.anchor} taper={false} at={at} />
      <PhoneUp x={850} y={1520} on={phoneOn} at={at} />
      <FramedPicture x={930} y={1330} w={104} h={118} kind="sea" seed="p6deskphoto" at={at} />
      <PaperStack x={960} y={1610} w={150} seed="p6stack" at={at} />
      {/* her cat on the desk's right end (partly behind the floor plant) */}
      {cat}
      {/* the big floor plant in the right foreground (in front of the desk's end: the right rail is UI anyway) */}
      <FloorPlant x={1150} y={1960} h={560} seed="p6floorplant" at={at} />
      {children}
    </>
  );
};
