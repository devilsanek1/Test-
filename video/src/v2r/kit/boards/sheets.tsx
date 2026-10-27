// boards/sheets.tsx: K3's review compositions, registered by src/entry-v2r-boards.tsx (palette import first):
//   KitBoards     the contact sheet (2160 x 3000): every piece 1:1 at its film size and spot, built, on a plain
//                 stand-in of its shot's ground; the eight key frames at phone width (216 px); the one type scale.
//   Boards-Deal / -Google / -Her / -BBC / -S4 / -S5   1080 x 1920 at 60 fps: each piece's timeline on its shot's
//                 stand-in ground, with the shot's move on it (S6 truck, S7 push, S8 truck, S2 slide, S4 truck).
//   BoardActions  1080 x 1920: every preset's timeline in sequence, the landing, then the loop un-build.
// The grounds are flat CM rects (NOT the film's sets: the lanes own those); Pip (K5) and her (K4) stand in only to
// judge clearances and the read. Clocks: Deal / Google / Her / S4 / S5 run on SCENE-LOCAL seconds (the presets'
// defaults); BBC runs on FILM seconds exactly as lane L2's scene does (<TimeShift by={-6.1}>), so its times are film
// times. Not exported from the barrel (index.ts): lanes never import review code.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CM, INK_PX} from '../../palette';
import {TimeProvider, TimeShift, ease, prog, useTime} from '../../../lib/time';
import {UnBuild} from '../../../lib/exit';
import {XG, mat} from '../../../lib/xf';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {captionFontStack, useCaptionFont} from '../../../lib/font';
import {B, BOARD_BOLLARD, S2, S4, S5, S6, S7, S8, SUN2, SUN8, rectCentre, s6BoardAt, s6PipSeatAt, s8TruckU, shotById, zoomAt} from '../../world/map';
import {Pip} from '../pip';
import {Her} from '../cast';
import {DealBoard, GoogleBoard, HerBoard, ToldTheBBCBoard, herWipe, wipeEdgeX, weightFor} from './StatementBoard';
import {DoorSign, Fingerpost, NameTag, NewsBox, Plaque, PLAQUE_MOUNT, tone} from './small';
import {TYPE, WorldText} from './WorldText';
import {TXT_DEAL, TXT_GOOGLE, TXT_TOLD_THE_BBC} from './texts';

// ---------------------------------------------------------------- clocks

/** Shot starts (film s, map.ts SHOTS). */
export const START = {
  S2: shotById('V2S2').start,
  S4: shotById('V2S4').start,
  S5: shotById('V2S5').start,
  S6: shotById('V2S6').start,
  S7: shotById('V2S7').start,
  S8: shotById('V2S8').start,
} as const;
const frames = (s: number) => Math.round(s * 60);
/** Composition lengths (frames at 60 fps): each shot whole; the BBC clip is film 7.94-10.94 around the slide. */
export const BBC_WINDOW = {from: S2.aBoardOutAt - 0.5, dur: 3} as const;
export const COMP_FRAMES = {
  deal: frames(shotById('V2S6').end - START.S6),
  google: frames(shotById('V2S7').end - START.S7),
  her: frames(shotById('V2S8').end - START.S8),
  bbc: frames(BBC_WINDOW.dur),
  s4: frames(shotById('V2S4').end - START.S4),
  s5: frames(shotById('V2S5').end - START.S5),
} as const;

/** Freeze a subtree at scene time `t` (the sheet shows built states, whatever frame it is rendered at). */
const At: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => <TimeProvider global={t}>{children}</TimeProvider>;

// ---------------------------------------------------------------- stand-in grounds (flat CM rects, oversized)

const R: React.FC<{x: number; y: number; w: number; h: number; c: string}> = ({x, y, w, h, c}) => <rect x={x} y={y} width={w} height={h} fill={c} />;
const Sky: React.FC = () => <R x={-300} y={-300} w={1680} h={2600} c={CM.sky} />;

/** Pip's board bollard (top = BOARD_BOLLARD, the seat) on the paving at 1250. */
const Bollard: React.FC = () => (
  <>
    <R x={BOARD_BOLLARD.x - 22} y={BOARD_BOLLARD.y + 8} w={44} h={1250 - BOARD_BOLLARD.y - 8} c={CM.stoneShade} />
    <R x={BOARD_BOLLARD.x - 26} y={BOARD_BOLLARD.y} w={52} h={9} c={CM.limestone} />
  </>
);

/** S2 (golden): the wing across the canal, the water, our towpath (the board's legs stand at 1298). */
const GroundS2: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={60} c={CM.bandGold} />
    <R x={-300} y={650} w={1680} h={360} c={CM.brickLight} />
    {[0, 1].map((r) => [0, 1, 2, 3, 4, 5, 6].map((i) => <R key={`${r}-${i}`} x={40 + i * 150} y={700 + r * 170} w={96} h={110} c={CM.glass} />))}
    <R x={-300} y={1010} w={1680} h={100} c={CM.water} />
    <R x={-300} y={1110} w={1680} h={12} c={CM.limestone} />
    <R x={-300} y={1122} w={1680} h={1200} c={CM.paving} />
  </>
);
/** The newsstand's kiosk corner the board slides out from behind (drawn over the board; ends left of the board's
 *  final frame, x 134). */
const KIOSK_X1 = 124;
const Kiosk: React.FC = () => (
  <>
    <R x={-300} y={880} w={300 + KIOSK_X1} h={440} c={CM.brick} />
    <R x={-300} y={860} w={320 + KIOSK_X1} h={30} c={CM.anchor} />
  </>
);
/** Before the slide the whole board hides behind the kiosk, its ground shadow included (the shadow runs ~75 px right
 *  of the frame: 0.26 x the board's height). */
const BBC_HIDDEN_DX = -540;

/** S4 (low sun): far roofs 0.3x, her towpath (y 860-1080), the water, our boat's cabin (sage, plum gunwale). */
const GroundS4: React.FC<{dx: number}> = ({dx}) => {
  const far = dx * 0.3;
  const roofs: [number, number, string][] = [];
  for (let i = 0; i < 16; i++) roofs.push([-200 + i * 95, 690 + ((i * 37) % 70), i % 3 === 0 ? CM.brick : i % 3 === 1 ? CM.brickLight : CM.stucco]);
  return (
    <>
      <Sky />
      <R x={-300} y={600} w={1680} h={300} c={CM.bandGold} />
      <circle cx={S4.sunAtPose.x} cy={S4.sunAtPose.y} r={S4.sunAtPose.r} fill={CM.sun} />
      <g transform={`translate(${far.toFixed(2)} 0)`}>
        {roofs.map(([x, y, c], i) => (
          <R key={i} x={x} y={y} w={90} h={900 - y} c={c} />
        ))}
      </g>
      <R x={-300} y={860} w={1680} h={220} c={CM.paving} />
      <R x={-300} y={1080} w={1680} h={140} c={CM.water} />
      <R x={-300} y={1220} w={1680} h={1100} c={CM.sage} />
      <R x={-300} y={1290} w={1680} h={40} c={CM.anchor} />
    </>
  );
};

/** S5 start (warm-dark under the canopy; the slot with SUN1; the bench) and end (the terrace at the balustrade). */
const GroundS5Start: React.FC = () => (
  <>
    <R x={-300} y={-300} w={1680} h={2600} c={tone(CM.shadeWarm, CM.anchor, 0.2)} />
    <R x={S5.start.slot.x0} y={S5.start.slot.y0} w={S5.start.slot.x1 - S5.start.slot.x0} h={S5.start.slot.y1 - S5.start.slot.y0} c={CM.bandGold} />
    <circle cx={S5.start.sun.x} cy={S5.start.sun.y} r={S5.start.sun.r} fill={CM.sun} />
    <R x={-300} y={880} w={1680} h={1400} c={tone(CM.paving, CM.shadeWarm, 0.25)} />
    <R x={-300} y={1230} w={1680} h={1100} c={CM.paving} />
    <R x={230} y={1130} w={230} h={30} c={CM.brick} />
  </>
);
const GroundS5End: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={200} c={CM.skyHigh} />
    <R x={-300} y={800} w={1680} h={420} c={tone(CM.sage, CM.sky, 0.3)} />
    <R x={322} y={846} w={1058} h={258} c={CM.limestone} />
    <R x={-300} y={1180} w={1680} h={46} c={CM.stoneShade} />
    <R x={-300} y={1172} w={1680} h={10} c={CM.limestone} />
    <R x={-300} y={1226} w={1680} h={1100} c={CM.paving} />
  </>
);

/** S6 (April morning): the low limestone facade band + its service door, the lawn, the footpath kerb at 1248-1255. */
const GroundS6: React.FC = () => (
  <>
    <Sky />
    <circle cx={SUN2.x} cy={SUN2.y} r={SUN2.r} fill={CM.sun} />
    <R x={-300} y={S6.facadeBandY[0]} w={1680} h={S6.facadeBandY[1] - S6.facadeBandY[0]} c={CM.limestone} />
    <R x={S6.serviceDoor0.x0} y={S6.serviceDoor0.y0} w={S6.serviceDoor0.x1 - S6.serviceDoor0.x0} h={S6.serviceDoor0.y1 - S6.serviceDoor0.y0} c={CM.stoneShade} />
    <R x={-300} y={835} w={1680} h={420} c={CM.sage} />
    <R x={-300} y={1236} w={1680} h={1100} c={CM.paving} />
    <R x={-300} y={1248} w={1680} h={7} c={CM.limestone} />
  </>
);
/** The fence's tall corner post (Pip's seat at its cap: S6.pipSeat0), on the board's (mid) plane. */
const CornerPost: React.FC = () => (
  <>
    <R x={S6.pipSeat0.x - 27} y={S6.pipSeat0.y + 10} w={54} h={1250 - S6.pipSeat0.y - 10} c={CM.limestone} />
    <R x={S6.pipSeat0.x - 33} y={S6.pipSeat0.y} w={66} h={11} c={CM.stoneShade} />
  </>
);

/** S7 (sunset): the wing's lit front with a window row and the canopy, SUN2, the forecourt paving. */
const GroundS7: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={60} c={CM.bandSunset} />
    <circle cx={SUN2.x} cy={SUN2.y} r={SUN2.r} fill={CM.sun} />
    <R x={330} y={604} w={1050} h={660} c={CM.brickLight} />
    <R x={-300} y={660} w={630} h={600} c={CM.stucco} />
    <R x={-300} y={700} w={1680} h={120} c={CM.glass} />
    <R x={S7.canopyGoogle.x0} y={S7.canopyGoogle.y0} w={S7.canopyGoogle.x1 - S7.canopyGoogle.x0} h={S7.canopyGoogle.y1 - S7.canopyGoogle.y0} c={CM.stucco} />
    <R x={-300} y={1250} w={1680} h={1100} c={CM.paving} />
  </>
);

/** S8 (sunset): the band, the far roofs, the canal past the board, SUN8, the towpath paving. */
const GroundS8: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={200} c={CM.bandSunset} />
    <circle cx={SUN8.x} cy={SUN8.y} r={SUN8.r} fill={CM.sun} />
    <R x={-300} y={760} w={1680} h={60} c={CM.brick} />
    <R x={-300} y={820} w={1680} h={440} c={CM.water} />
    <R x={-300} y={1250} w={1680} h={1100} c={CM.paving} />
  </>
);

// ---------------------------------------------------------------- the shots' pieces on their grounds (SVG content)

/** S6 (scene s, 0 = 24.00): the deal board on the mid plane's lateral truck (24.63 px/s, parallel to the lens), Pip
 *  on the fence's tall corner post right of it (the same plane). */
export const DealScene: React.FC = () => {
  const t = useTime();
  const film = t + START.S6;
  const dx = s6BoardAt(film).x0 - S6.board0.x0;
  const pip = s6PipSeatAt(film);
  return (
    <>
      <GroundS6 />
      <XG m={mat.translate(dx, 0)}>
        <CornerPost />
        <DealBoard />
      </XG>
      <Pip x={pip.x} y={pip.y} size={96} pose="sit" facing="backRight" idle={{flick: false}} seed="k3/s6pip" />
    </>
  );
};

/** S7 (scene s, 0 = 28.06): Google's board at B inside the ONE 4 % push about B's centre (lands 30.04 = 1.98). */
export const GoogleScene: React.FC = () => {
  const t = useTime();
  const z = zoomAt(S7.camera.push, t + START.S7);
  const c = rectCentre(B);
  return (
    <XG m={mat.about(mat.scale(z), c.x, c.y)}>
      <GroundS7 />
      <GoogleBoard />
      <Bollard />
      <Pip x={BOARD_BOLLARD.x} y={BOARD_BOLLARD.y} size={100} pose="sit" facing="backLeft" idle={{flick: false}} seed="k3/s7pip" />
    </XG>
  );
};

/** A stand-in cloth (lane L6 draws the cafe owner): held on the wipe's edge, in the board's own coordinates. */
const Cloth: React.FC<{x: number; y: number}> = ({x, y}) => {
  const x0 = x - 12;
  const x1 = x + 34;
  const y0 = y - 56;
  const y1 = y + 56;
  const r = 11;
  const d = `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  return (
    <>
      <Fill d={d} color={CM.coatOat} offset={false} seed="k3/cloth" />
      <Ink d={d} width={INK_PX.mid} open={0.1} seed="k3/clothI" />
    </>
  );
};

/** S8 (scene s, 0 = 32.93): her board on the board plane (x -100-380 before the ONE truck 34.99-35.60, B after), SHE
 *  SAYS pops with the clack on "She" (0.23), the cafe owner's ONE stroke 2.79, the quote pen 3.61-4.77. */
export const HerScene: React.FC = () => {
  const t = useTime();
  const dx = -S8.truck.boardPlaneDx * (1 - s8TruckU(t + START.S8));
  const ex = wipeEdgeX(B, herWipe(), t, rectCentre(B).y);
  return (
    <>
      <GroundS8 />
      <XG m={mat.translate(dx, 0)}>
        <HerBoard headerAt={0.23} />
        {ex !== null ? <Cloth x={ex} y={rectCentre(B).y} /> : null}
        <Bollard />
        <Pip x={BOARD_BOLLARD.x} y={BOARD_BOLLARD.y} size={100} pose="sit" facing="backLeft" idle={{flick: false}} seed="k3/s8pip" />
      </XG>
    </>
  );
};

/** S2 on FILM seconds (lane L2's clock): the newsagent slides the board out from behind the kiosk 8.44-8.74 (L2's own
 *  transform), and it clacks as it settles (clackAt 8.74, film s). */
export const BBCScene: React.FC = () => {
  const t = useTime();
  const t0 = S2.aBoardOutAt;
  const dx = BBC_HIDDEN_DX * (1 - ease.outCubic(prog(t, t0, 0.3)));
  return (
    <>
      <GroundS2 />
      <XG m={mat.translate(dx, 0)}>
        <ToldTheBBCBoard clackAt={t0 + 0.3} />
      </XG>
      <Kiosk />
    </>
  );
};

/** S4 (scene s, 0 = 14.86): the path plane trucks to its pose by 3.10 ("objected" 17.96); her walking LEFT, screen-
 *  fixed; the name tag over her (0.21 / 1.74, off 3.94); the fingerpost on the path plane (4.06 / 4.59-4.94). */
export const S4Scene: React.FC = () => {
  const t = useTime();
  const stop = S4.stopAt - START.S4;
  const dx = t < stop - 0.6 ? -280 + 100 * t : t < stop ? -30 + 100 * (t - stop + 0.6) - (100 / 1.2) * (t - stop + 0.6) ** 2 : 0;
  return (
    <>
      <GroundS4 dx={dx} />
      <XG m={mat.translate(dx, 0)}>
        <Fingerpost />
      </XG>
      <Her x={S4.her.x} y={S4.her.feetY} h={S4.her.h} pose={t < stop ? 'walk' : 'stopLook'} view="profile" walk={t < stop ? {rate: 1.8} : undefined} />
      <NameTag />
    </>
  );
};

/** S5 (scene s, 0 = 20.55): the news box in START coords (already there), then the end terrace with the plaque
 *  popping ON "Pentagon" (1.88). The crane between them is lane L4's; this stand-in cuts at 1.5. */
export const S5Scene: React.FC = () => {
  const t = useTime();
  return t < 1.5 ? (
    <>
      <GroundS5Start />
      <NewsBox />
    </>
  ) : (
    <>
      <GroundS5End />
      <Plaque />
    </>
  );
};

/** Any door: the DoorSign at three sizes on a limestone wall (the S6 service door draws dc's own plate). */
export const DoorScene: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={1720} c={CM.limestone} />
    <R x={340} y={760} w={400} h={640} c={CM.stoneShade} />
    <R x={370} y={790} w={340} h={610} c={tone(CM.coatSlate, CM.sky, 0.3)} />
    <DoorSign x={540} y={880} at={0.1} />
    <DoorSign x={540} y={1120} size={20} at={0.3} seed="door2" />
    <DoorSign x={300} y={1500} size={34} lines={['CLASSIFIED']} at={0.45} seed="door3" />
  </>
);

/** The landing (prop `at`): a board drops its last 34 px onto its feet in 0.1 s, then clacks. */
const LandScene: React.FC = () => (
  <>
    <GroundS2 />
    <ToldTheBBCBoard at={0.2} />
  </>
);

/** Every small piece built, then the loop un-build (0.5 s). */
const ExitSmall: React.FC = () => (
  <>
    <Sky />
    <R x={-300} y={600} w={1680} h={1720} c={CM.bandGold} />
    <UnBuild at={0.3}>
      <NameTag at={null} growAt={null} off={null} />
      <Fingerpost decAt={null} aprAt={null} />
      <NewsBox rect={{x0: 640, y0: 1300, x1: 950, y1: 1650}} />
      <Plaque x={300} y={1420} at={null} />
      <DoorSign x={300} y={1560} />
    </UnBuild>
  </>
);

// ---------------------------------------------------------------- the 1080 x 1920 compositions

const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {children}
    </svg>
  </AbsoluteFill>
);

export const BoardsDeal: React.FC = () => (
  <Frame>
    <DealScene />
  </Frame>
);
export const BoardsGoogle: React.FC = () => (
  <Frame>
    <GoogleScene />
  </Frame>
);
export const BoardsHer: React.FC = () => (
  <Frame>
    <HerScene />
  </Frame>
);
/** t 0 = film 7.94 (the scene inside sees FILM seconds, like L2's). */
export const BoardsBBC: React.FC = () => (
  <Frame>
    <TimeShift by={-BBC_WINDOW.from}>
      <BBCScene />
    </TimeShift>
  </Frame>
);
export const BoardsS4: React.FC = () => (
  <Frame>
    <S4Scene />
  </Frame>
);
export const BoardsS5: React.FC = () => (
  <Frame>
    <S5Scene />
  </Frame>
);

// ---------------------------------------------------------------- BoardActions: every timeline in sequence

type Act = {label: string; from: number; dur: number; node: React.ReactNode};
const ACTS: Act[] = [
  {label: 'S6 DealBoard (scene s): clack 0.00 · purpose pops 0.03 "any" · F12 + divider 2.40 "veto"', from: -0.2, dur: 3.1, node: <DealScene />},
  {label: 'S7 GoogleBoard: header + credit + clack 0.30 · pen 1.59-1.98 · small row 2.24 · pen 2.68-4.02', from: 0, dur: 4.6, node: <GoogleScene />},
  {label: 'S8 HerBoard: SHE SAYS + clack 0.23 · truck 2.06-2.67 · wipe 2.79 · quote 3.61-4.77', from: 0, dur: 5.4, node: <HerScene />},
  {label: 'S2 ToldTheBBCBoard (FILM s, as L2): slides out 8.44-8.74 · clack 8.74', from: 8.2, dur: 1.3, node: <BBCScene />},
  {label: 'landing (prop at): a 34 px drop in 0.1 s onto its feet, then the clack', from: -0.2, dur: 1.0, node: <LandScene />},
  {label: 'S4 NameTag: build 1 0.21 · build 2 1.74 · pops off 3.94', from: 0, dur: 4.1, node: <S4Scene />},
  {label: 'S4 Fingerpost: DEC 4.06 (pen to 4.52) · APR 4.59 (pen to 4.94 "heading")', from: 3.9, dur: 1.5, node: <S4Scene />},
  {label: 'S5 NewsBox (start coords) · Plaque pops 1.88 "Pentagon" (end coords)', from: 0.6, dur: 2.0, node: <S5Scene />},
  {label: 'DoorSign (any door): pops', from: 0, dur: 0.9, node: <DoorScene />},
  {
    label: 'the loop un-build: a board (fills shrink, then the ink retracts; no fades)',
    from: 0,
    dur: 1.0,
    node: (
      <UnBuild at={0.3}>
        <At t={5.4}>
          <HerScene />
        </At>
      </UnBuild>
    ),
  },
  {label: 'the loop un-build: the small pieces', from: 0, dur: 1.0, node: <ExitSmall />},
];
const ACT_STARTS = ACTS.reduce<number[]>((a, x, i) => [...a, i === 0 ? 0 : a[i - 1] + ACTS[i - 1].dur], []);
export const ACTIONS_DUR = ACTS.reduce((s, a) => s + a.dur, 0);

export const BoardActions: React.FC = () => {
  useCaptionFont();
  const t = useTime();
  let i = ACT_STARTS.findIndex((s, k) => t >= s && t < s + ACTS[k].dur);
  if (i < 0) i = ACTS.length - 1;
  const a = ACTS[i];
  return (
    <Frame>
      <TimeShift by={ACT_STARTS[i] - a.from}>{a.node}</TimeShift>
      <rect x={0} y={20} width={1080} height={74} fill={CM.paper} />
      <text x={24} y={68} fontFamily={captionFontStack} fontSize={27} fill={CM.ink}>
        {`${i + 1}/${ACTS.length}  ${a.label}`}
      </text>
    </Frame>
  );
};

// ---------------------------------------------------------------- KitBoards: the contact sheet

export const SHEET_BOARDS = {w: 2160, h: 3000} as const;
const LABEL_H = 44;

/** A 1:1 crop of a scene (vb in film px; w / h = the tile's size on the sheet) with its label strip. */
const Tile: React.FC<{x: number; y: number; vb: [number, number, number, number]; label: string; children: React.ReactNode; w?: number; h?: number}> = ({x, y, vb, label, children, w = vb[2], h = vb[3]}) => (
  <g>
    <svg x={x} y={y} width={w} height={h} viewBox={vb.join(' ')} preserveAspectRatio="xMidYMid slice">
      {children}
    </svg>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={CM.ink} strokeWidth={3} />
    <rect x={x} y={y + h} width={w} height={LABEL_H} fill={CM.stucco} />
    <text x={x + 10} y={y + h + 30} fontFamily={captionFontStack} fontSize={w < 300 ? 19 : 24} fill={CM.ink}>
      {label}
    </text>
  </g>
);

/** A whole frame at phone width (216 x 384): the cold read. */
const Thumb: React.FC<{x: number; y: number; label: string; children: React.ReactNode}> = ({x, y, label, children}) => (
  <g>
    <svg x={x} y={y} width={216} height={384} viewBox="0 0 1080 1920">
      {children}
    </svg>
    <rect x={x} y={y} width={216} height={384} fill="none" stroke={CM.ink} strokeWidth={2} />
    <text x={x + 4} y={y + 384 + 28} fontFamily={captionFontStack} fontSize={21} fill={CM.ink}>
      {label}
    </text>
  </g>
);

const SPEC: {size: number; role: string; text: string}[] = [
  {size: TYPE.header, role: 'header 60', text: TXT_GOOGLE.header},
  {size: TYPE.key, role: 'key 56 (read at 216 px)', text: `${TXT_DEAL.purpose[0]} ${TXT_DEAL.purpose[1]}`},
  {size: TYPE.body, role: 'body 34 (read at ~390 px)', text: TXT_DEAL.clause[0]},
  {size: TYPE.bodySmall, role: 'body 30', text: TXT_TOLD_THE_BBC.body[0]},
  {size: TYPE.creditLarge, role: 'credit / small row 20', text: TXT_GOOGLE.small},
  {size: TYPE.credit, role: 'credit 18', text: TXT_DEAL.credit},
];

export const KitBoards: React.FC = () => {
  useCaptionFont();
  const W3 = [30, 740, 1450];
  const big: [number, number, number, number] = [90, 655, 680, 640];
  const rowD = 2100;
  const thumbs: {label: string; node: React.ReactNode}[] = [
    {label: 'S6 deal 3.00', node: <At t={3.0}><DealScene /></At>},
    {label: 'S7 Google 4.50', node: <At t={4.5}><GoogleScene /></At>},
    {label: 'S8 her 5.20', node: <At t={5.2}><HerScene /></At>},
    {label: 'S2 BBC (film 9.60)', node: <At t={9.6}><BBCScene /></At>},
    {label: 'S4 tag 3.00', node: <At t={3.0}><S4Scene /></At>},
    {label: 'S4 plates 5.40', node: <At t={5.4}><S4Scene /></At>},
    {label: 'S5 news box 0.80', node: <At t={0.8}><S5Scene /></At>},
    {label: 'S5 plaque 2.60', node: <At t={2.6}><S5Scene /></At>},
  ];
  const specY = 2560;
  return (
    <AbsoluteFill style={{backgroundColor: CM.paper}}>
      <svg width={SHEET_BOARDS.w} height={SHEET_BOARDS.h} viewBox={`0 0 ${SHEET_BOARDS.w} ${SHEET_BOARDS.h}`}>
        <text x={30} y={60} fontFamily={captionFontStack} fontSize={42} fill={CM.ink}>
          K3 lettering + boards (src/v2r/kit/boards): every piece 1:1 at its film size and spot, built, on a stand-in of its shot's ground
        </text>
        {/* row A: the three equal big boards (A5): deal (S6), Google's (S7), hers (S8), each fully built */}
        <Tile x={W3[0]} y={90} vb={[100, 655, 680, 640]} label="S6 DealBoard at 3.00 (S6_FACE 160-640 x 700-1220, drifting 24.63 px/s)">
          <At t={3.0}>
            <DealScene />
          </At>
        </Tile>
        <Tile x={W3[1]} y={90} vb={big} label="S7 GoogleBoard at 4.50 (face B 150-630 x 700-1220, legs 1250)">
          <At t={4.5}>
            <GoogleScene />
          </At>
        </Tile>
        <Tile x={W3[2]} y={90} vb={big} label="S8 HerBoard at 5.20 (the same face at B; quote + credit)">
          <At t={5.2}>
            <HerScene />
          </At>
        </Tile>
        {/* row B: her board's menu and the ONE stroke; the S2 newsstand board */}
        <Tile x={W3[0]} y={800} vb={big} label="S8 HerBoard at 2.72: SHE SAYS over the half-wiped menu">
          <At t={2.72}>
            <HerScene />
          </At>
        </Tile>
        <Tile x={W3[1]} y={800} vb={big} label="S8 HerBoard at 2.95: the wipe (stand-in cloth on wipeEdgeX)">
          <At t={2.95}>
            <HerScene />
          </At>
        </Tile>
        <Tile x={W3[2]} y={800} vb={[100, 760, 680, 640]} label="S2 ToldTheBBCBoard (film 9.60; face 160-560 x 1050-1250, legs 1298)">
          <At t={9.6}>
            <BBCScene />
          </At>
        </Tile>
        {/* row C: the small pieces */}
        <Tile x={30} y={1510} vb={[560, 590, 360, 500]} label="S4 NameTag at 3.00 (both builds)">
          <At t={3.0}>
            <S4Scene />
          </At>
        </Tile>
        <Tile x={420} y={1510} vb={[80, 690, 560, 400]} label="S4 Fingerpost at 5.40 (DEC over APR, pointing west)">
          <At t={5.4}>
            <S4Scene />
          </At>
        </Tile>
        <Tile x={1010} y={1510} vb={[440, 860, 420, 420]} label="S5 NewsBox (START coords)">
          <At t={0.8}>
            <S5Scene />
          </At>
        </Tile>
        <Tile x={1460} y={1510} vb={[420, 990, 400, 230]} label="S5 Plaque key 56 / body 30 (dashed: dc TERRACE.plaqueMount)">
          <At t={2.6}>
            <S5Scene />
          </At>
          <rect x={PLAQUE_MOUNT.x0} y={PLAQUE_MOUNT.y0} width={PLAQUE_MOUNT.x1 - PLAQUE_MOUNT.x0} height={PLAQUE_MOUNT.y1 - PLAQUE_MOUNT.y0} fill="none" stroke={CM.shadeCool} strokeWidth={2} strokeDasharray="8 6" />
        </Tile>
        <Tile x={1460} y={1800} vb={[460, 1030, 300, 160]} label="Plaque key 40 / body 24">
          <At t={2.6}>
            <GroundS5End />
            <Plaque keySize={40} at={null} seed="plaque40" />
          </At>
        </Tile>
        <Tile x={1790} y={1800} vb={[440, 860, 220, 150]} label="DoorSign (30)">
          <At t={1.0}>
            <DoorScene />
          </At>
        </Tile>
        {/* row D: the key frames at phone width (216 px: the cold read; key lines must read here) */}
        <text x={30} y={rowD - 14} fontFamily={captionFontStack} fontSize={28} fill={CM.ink}>
          At phone width (216 px wide, the cold read): key lines (56+) must read here; body and credits are judged at ~390 px.
        </text>
        {thumbs.map((th, i) => (
          <Thumb key={th.label} x={30 + i * 241} y={rowD} label={th.label}>
            {th.node}
          </Thumb>
        ))}
        {/* row E: the one type scale (1:1), with the faux weight each size gets on every board */}
        <rect x={30} y={specY} width={2100} height={420} fill={CM.white} stroke={CM.ink} strokeWidth={2} />
        {SPEC.map((s, i) => {
          const y = specY + 70 + i * 62;
          return (
            <g key={s.role}>
              <text x={50} y={y} fontFamily={captionFontStack} fontSize={24} fill={CM.shadeWarm}>
                {`${s.role} · weight ${weightFor(s.size)}`}
              </text>
              <WorldText x={470} y={y} size={s.size} text={s.text} weight={weightFor(s.size)} seed={`spec${i}`} />
            </g>
          );
        })}
        <text x={1240} y={specY + 70} fontFamily={captionFontStack} fontSize={24} fill={CM.ink}>
          ONE scale (TYPE): keys 56+ read at 216 px; body 30-34 and credits 18-20 at ~390 px.
        </text>
        <text x={1240} y={specY + 110} fontFamily={captionFontStack} fontSize={24} fill={CM.ink}>
          Fairness (A5): deal, Google and her boards = one face 480 x 520, one frame,
        </text>
        <text x={1240} y={specY + 146} fontFamily={captionFontStack} fontSize={24} fill={CM.ink}>
          one seed, one light, one type scale and weight; words only from texts.ts.
        </text>
      </svg>
    </AbsoluteFill>
  );
};
