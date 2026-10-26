// kit/Interview.tsx: P3's INTERVIEW ROOM (lane L3): a real place, dense but not cozy, not her home and not the cold
// set: a cool periwinkle studio corner (CC.studio*). Left, a glass wall onto the city at dusk (kit DuskTown with
// walkers on the far pavement: people passing far away, windows switching); a softbox light on a stand; plain studio
// panels behind the staffers' heads (calm behind the faces); metal shelving with archive boxes cut by the right edge;
// ceiling track lights above the caption band; a tall plant. The table dressing (draw after the table): a recorder with
// a blinking light, two water glasses (a ripple), a cable to the mic, a pen. The staffers, the mic, the CONTRACT page
// and NAME WITHHELD are the lane's (kit Staffer, Mic, TablePage, Letter). Screen px, the board's numbers: table top
// 1362, front 1532 .. 1732; mic (185, 1352, w 150); A (640, 1780, h 900); B (905, 1780, h 820).
//   <InterviewRoom>       everything behind the staffers (wall, glass wall + town, softbox, panels, shelves, ceiling)
//   <InterviewTableTop>   the dressing on the table (recorder, glasses, cable, pen): after <InterviewTable/>

import React, {useId} from 'react';
import {blob, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {CC} from '../palette';
import {At, b, Fill, fillAt, Ink, W} from './util';
import {Live, loopT, onOff} from './Ambient';
import {DuskTown} from './Town';
import {PotPlant} from './Nook';

export const INTERVIEW = {tableTop: 1362, tableFront: 1532, tableBottom: 1732, glass: [-20, 640, 330, 722] as [number, number, number, number], mic: {x: 185, y: 1352, w: 150}};

export const InterviewRoom: React.FC<{at?: At; seed?: string}> = ({at, seed = 'iroom'}) => {
  const t = useTime();
  const r = rng(`iroom/${seed}`);
  const [gx, gy, gw, gh] = INTERVIEW.glass;
  const clipId = ('iglass' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  // a colleague walks past outside the glass every 4.4 s (a silhouette crossing in 2 s, stepped like a drawn walk)
  const wp = loopT(Math.floor(t * 12) / 12, 4.4, 1.2) / 2;
  const wx = gx - 80 + (gw + 160) * wp;
  const step = Math.floor(t * 6) % 2;
  // archive shelving (right, cut by the edge): boards and boxes
  const shelfX = 960;
  const boards = [700, 880, 1060, 1240];
  const boxes: React.ReactNode[] = [];
  let boxInk = '';
  boards.forEach((by, j) => {
    let x = shelfX + 14;
    while (x < 1110) {
      const w = r.range(56, 74);
      const h = r.range(118, 150);
      const c = r.chance(0.2) ? CC.archiveSide : CC.archive;
      boxes.push(<Fill key={`${j}/${x}`} rect={[x, by - h, w, h]} color={c} at={fillAt(at)} seed={`${seed}/bx${j}${x}`} />);
      boxes.push(<Fill key={`${j}/${x}l`} rect={[x + w * 0.2, by - h * 0.62, w * 0.6, h * 0.18]} color={CC.paper} offset={false} at={fillAt(at, 0.02)} />);
      boxInk += rect(x, by - h, w, h, {seed: `${seed}/bxI${j}${x}`, over: 'small'}) + ellipse(x + w / 2, by - h * 0.22, w * 0.14, h * 0.05, {seed: `${seed}/hole${j}${x}`});
      x += w + r.range(2, 6);
    }
  });
  return (
    <>
      <Fill rect={[-200, -200, 1480, 2320]} color={CC.studio} offset={false} mode="snap" at={at} />
      {/* the ceiling track and its lights (above the caption band) */}
      <Fill rect={[-200, -200, 1480, 330]} color={CC.studioPanel} offset={false} at={fillAt(at)} />
      <Ink d={hline(-60, 1140, 130, {seed: `${seed}/ceil`, over: [0, 0]})} width={W.mid} at={at} />
      <Ink d={hline(40, 1060, 196, {seed: `${seed}/track`, over: [0, 0]})} width={10} color={CC.stand} taper={false} at={at} />
      {[150, 420, 700, 960].map((x, i) => (
        <React.Fragment key={i}>
          <Fill d={roundRect(x - 22, 200, 44, 62, 10)} color={CC.stand} at={fillAt(at)} offset={false} />
          <Fill d={blob(x, 262, 20, 6, {seed: `${seed}/sp${i}`})} color={CC.core} offset={false} at={fillAt(at, 0.02)} />
        </React.Fragment>
      ))}
      {/* the plain studio panels behind the staffers (calm behind the faces) */}
      <Fill rect={[352, 620, 600, 760]} color={CC.studioPanel} offset={false} at={fillAt(at)} />
      <Ink d={rect(352, 620, 600, 760, {seed: `${seed}/panel`, over: 'small'}) + vline(552, 620, 1362, {over: [0, 0], seed: `${seed}/ps1`}) + vline(752, 620, 1362, {over: [0, 0], seed: `${seed}/ps2`})} width={W.far} at={at} />
      {/* the glass wall onto the city (left): the town with walkers, the mullion grid */}
      <Fill rect={[gx - 14, gy - 14, gw + 28, gh + 14]} color={CC.shelfMetal} offset={false} at={fillAt(at)} />
      <DuskTown x={gx} y={gy} w={gw} h={gh} horizon={gy + gh * 0.4} k={0.85} moon={[gx + gw * 0.7, gy + 70]} stars={5} clouds={2} seed={`${seed}/town`} at={at} />
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={gx} y={gy} width={gw} height={gh} />
        </clipPath>
      </defs>
      {wp <= 1 ? (
        <Live at={at} c={[gx + gw / 2, gy + gh * 0.7]}>
          <g clipPath={`url(#${clipId})`}>
            <circle cx={wx} cy={gy + gh - 300} r={26} fill={CC.neighbour} />
            <path d={roundRect(wx - 34, gy + gh - 268, 68, 160, 26)} fill={CC.neighbour} />
            <path d={`M${wx - 14} ${gy + gh - 116}L${wx - (step ? 30 : 6)} ${gy + gh}M${wx + 14} ${gy + gh - 116}L${wx + (step ? 30 : 6)} ${gy + gh}`} stroke={CC.neighbour} strokeWidth={22} strokeLinecap="round" />
          </g>
        </Live>
      ) : null}
      <Ink d={vline(gx + gw * 0.5, gy, gy + gh, {over: [0, 0], seed: `${seed}/gm1`}) + hline(gx, gx + gw, gy + gh * 0.55, {over: [0, 0], seed: `${seed}/gm2`})} width={10} color={CC.shelfMetal} taper={false} at={at} />
      <Ink d={rect(gx, gy, gw, gh, {seed: `${seed}/gI`, over: 'small'})} width={W.mid} at={at} />
      {/* the softbox on its stand (between the glass and the staffers) */}
      <Ink d={line(380, 860, 384, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/stand`}) + line(384, 1180, 330, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/leg1`}) + line(384, 1180, 440, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/leg2`})} width={7} color={CC.stand} taper={false} at={at} />
      <Fill d={polyPath([[336, 700], [440, 760], [440, 940], [336, 1000]])} color={CC.stand} at={fillAt(at)} seed={`${seed}/sbBack`} />
      <Fill d={polyPath([[290, 660], [350, 690], [350, 1010], [290, 1040]])} color={CC.softbox} at={fillAt(at, 0.02)} seed={`${seed}/sb`} />
      <Ink d={poly([[336, 700], [440, 760], [440, 940], [336, 1000]], {closed: true, seed: `${seed}/sbBI`, over: 'small'}) + poly([[290, 660], [350, 690], [350, 1010], [290, 1040]], {closed: true, seed: `${seed}/sbI`, over: 'small'})} width={W.mid} at={at} />
      {/* archive shelving, cut by the right edge */}
      <Fill rect={[shelfX, 600, 200, 780]} color={CC.studioDeep} offset={false} at={fillAt(at)} />
      {boxes}
      {boards.map((by, i) => (
        <Fill key={i} rect={[shelfX, by, 200, 12]} color={CC.shelfMetal} offset={false} at={fillAt(at)} />
      ))}
      <Ink d={boxInk} width={W.far} at={at} />
      <Ink d={vline(shelfX, 600, 1362, {over: [0, 0], seed: `${seed}/sh1`}) + vline(shelfX + 12, 600, 1362, {over: [0, 0], seed: `${seed}/sh2`}) + boards.map((by, i) => hline(shelfX, 1140, by, {over: [0, 0], seed: `${seed}/sb${i}`})).join('')} width={W.mid} at={at} />
      {/* a tall plant by the shelving */}
      <PotPlant x={884} y={1200} w={70} h={80} kind="leafy" leaves={9} seed={`${seed}/plant`} at={at} />
    </>
  );
};

/** The table's dressing (draw after the table, before the staffers' arms): a recorder with a blinking light, two
 *  water glasses (a ripple), the mic's cable, a pen. */
export const InterviewTableTop: React.FC<{at?: At; seed?: string}> = ({at, seed = 'itop'}) => {
  const t = useTime();
  const m = INTERVIEW.mic;
  const rec = {x: 680, y: 1420, w: 110, h: 56};
  const blink = onOff(t, `${seed}/rec`, 1.1, 0.55);
  const glass = (x: number, y: number, k: string, ph: number) => {
    const rp = loopT(t, 2.4, ph) / 2.4;
    return (
      <React.Fragment key={k}>
        <Fill d={roundRect(x - 26, y - 76, 52, 76, 8)} color={CC.glass} at={fillAt(at)} seed={`${seed}/${k}`} />
        <Fill rect={[x - 22, y - 46, 44, 42]} color={CC.studioPanel} offset={false} at={fillAt(at, 0.02)} />
        <Ink d={roundRect(x - 26, y - 76, 52, 76, 8, {seed: `${seed}/${k}I`}) + hline(x - 22, x + 22, y - 46, {over: [0, 0], seed: `${seed}/${k}w`})} width={W.far} at={at} />
        <Live at={at} c={[x, y - 46]}>
          <path d={`M${x - 18 + rp * 14} ${y - 46}h${8 - rp * 4}`} stroke={CC.white} strokeWidth={3} strokeLinecap="round" />
        </Live>
      </React.Fragment>
    );
  };
  return (
    <>
      <Ink d={smooth([[m.x + 20, m.y - 4], [m.x + 120, m.y + 30], [rec.x - 60, rec.y + 40], [rec.x, rec.y + 30]])} width={4} color={CC.cable} taper={false} at={b(at, 0.06)} />
      <Fill d={roundRect(rec.x, rec.y, rec.w, rec.h, 10)} color={CC.stand} at={fillAt(at)} seed={`${seed}/rec`} />
      <Fill d={roundRect(rec.x + 12, rec.y + 12, 54, 30, 4)} color={CC.studioDeep} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={roundRect(rec.x, rec.y, rec.w, rec.h, 10, {seed: `${seed}/recI`})} width={W.mid} at={at} />
      <Live at={at} c={[rec.x + 88, rec.y + 26]}>
        <circle cx={rec.x + 88} cy={rec.y + 26} r={9} fill={blink ? CC.recLight : CC.studioDeep} />
      </Live>
      {glass(250, 1440, 'g1', 0)}
      {glass(1010, 1460, 'g2', 1.1)}
      <Ink d={line(820, 1500, 940, 1470, {over: [0, 0], seed: `${seed}/pen`})} width={12} color={CC.anchor} taper={false} at={at} />
    </>
  );
};
