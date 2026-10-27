// kit/Interview.tsx: P3's INTERVIEW ROOM (lane L3): a real place, dense but not cozy, not her home and not the cold
// set: a cool periwinkle studio corner (CC.studio*). Left, a glass wall onto the city at dusk (kit DuskTown: walkers,
// cars, windows switching); a softbox light on a stand; behind the staffers a frosted glass partition onto the
// open-plan office (soft silhouettes at ~35 % contrast: desks, monitors, two seated colleagues, a plant, a coat rack;
// a colleague walks past every 3.6 s as a clear darker silhouette); a wall clock over it; metal shelving with archive
// boxes cut by the right edge; ceiling tiles, felt acoustic panels and track lights above the caption band; a tall
// plant. The table dressing (draw after the table): a recorder with a blinking light, two water glasses (a ripple), a
// cable to the mic, a pen. The staffers, the mic, the CONTRACT page and the NAME WITHHELD tent are the lane's (kit
// Staffer, Mic, TablePage at INTERVIEW.page, NameTent at INTERVIEW.tent). Screen px, the board's numbers: table top
// 1362, front 1532 .. 1732; mic (185, 1352, w 150); A (640, 1780, h 900); B (905, 1780, h 820).
//   <InterviewRoom>       everything behind the staffers (wall, glass wall + town, softbox, partition + office, shelves)
//   <InterviewTableTop>   the dressing on the table (recorder, glasses, cable, pen): after <InterviewTable/>
//   <NameTent>            a folded name tent on the table: NAME WITHHELD as an object in the room

import React, {useId} from 'react';
import {blob, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {CC} from '../palette';
import {At, b, Fill, fillAt, Ink, Letter, W} from './util';
import {leafD, Live, loopT, onOff, WallClock} from './Ambient';
import {DuskTown} from './Town';
import {PotPlant} from './Nook';

export const INTERVIEW = {
  tableTop: 1362,
  tableFront: 1532,
  tableBottom: 1732,
  glass: [-20, 640, 330, 722] as [number, number, number, number],
  mic: {x: 185, y: 1352, w: 150},
  /** The frosted glass partition behind the staffers (the office beyond it) and the wall band above it (the clock). */
  partition: {x0: 352, x1: 952, top: 700, bottom: 1362, mullions: [552, 752]},
  /** P3's page and name tent (screen px): CONTRACT at x 220 (A's hands fold to its right: the title stays clear), the
   *  name tent in front of the one who spoke. */
  page: {x: 220, y: 1380, w: 320, h: 140},
  tent: {x: 650, y: 1520, w: 300, h: 74},
};

/** The open-plan office beyond the frosted partition (screen px, ~35 % contrast): desks with monitors (one glows),
 *  two colleagues seated at them, a plant, a coat rack with a coat; flat fills in two tones, no ink (a far plane). */
const OfficeBeyond: React.FC<{seed: string}> = ({seed}) => {
  const t = useTime();
  const {x0, x1, top, bottom} = INTERVIEW.partition;
  const deskY = 1196;
  const F = CC.officeFar;
  const out: React.ReactNode[] = [];
  // desks (a long bench of two), their legs
  out.push(<rect key="d1" x={x0 - 10} y={deskY} width={x1 - x0 + 20} height={16} fill={F} />);
  [x0 + 40, x0 + 300, x1 - 40].forEach((lx, i) => out.push(<rect key={`l${i}`} x={lx - 5} y={deskY} width={10} height={bottom - deskY} fill={F} />));
  // monitors (one switches between two glows: someone working)
  [[x0 + 70, 1, 'a'], [x0 + 250, 0, 'b'], [x0 + 470, 1, 'c']].forEach(([mx, lit, k]) => {
    const on = (lit as number) === 1 || onOff(t, `${seed}/mon${k}`, 3.1, 0.55);
    out.push(
      <g key={`m${k}`}>
        <rect x={(mx as number) - 46} y={deskY - 92} width={92} height={64} rx={6} fill={F} />
        <rect x={(mx as number) - 38} y={deskY - 85} width={76} height={50} fill={on ? CC.officeGlow : F} />
        <rect x={(mx as number) - 6} y={deskY - 28} width={12} height={28} fill={F} />
      </g>,
    );
  });
  // two seated colleagues (head + shoulders over the desk), one leans and comes back now and then
  const lean = onOff(t, `${seed}/lean`, 4.6, 0.35) ? 14 : 0;
  [[x0 + 150, 0], [x0 + 560, lean]].forEach(([cx, dx], i) => {
    out.push(
      <g key={`p${i}`}>
        <circle cx={(cx as number) + (dx as number)} cy={deskY - 104} r={24} fill={F} />
        <path d={roundRect((cx as number) - 44 + (dx as number) * 0.5, deskY - 80, 88, 84, 30)} fill={F} />
      </g>,
    );
  });
  // a plant by the far wall, a coat rack with a coat
  out.push(<path key="pl" d={polyPath([[x1 - 160, bottom], [x1 - 150, deskY + 40], [x1 - 110, deskY + 40], [x1 - 100, bottom]])} fill={F} />);
  [-60, -30, 0, 30, 60].forEach((a, i) => out.push(<path key={`pf${i}`} d={leafD(x1 - 130, deskY + 44, 110 - Math.abs(a), -90 + a, 0.32)} fill={F} />));
  out.push(<rect key="cr" x={x0 + 30} y={top + 120} width={9} height={bottom - top - 120} fill={F} />);
  out.push(<path key="cc" d={roundRect(x0 + 6, top + 150, 58, 210, 24)} fill={F} />);
  out.push(<rect key="ch" x={x0 + 10} y={top + 120} width={50} height={8} fill={F} />);
  // a ceiling lamp line beyond
  out.push(<rect key="lt" x={x0} y={top + 40} width={x1 - x0} height={10} fill={CC.officeGlow} />);
  return <>{out}</>;
};

export const InterviewRoom: React.FC<{at?: At; seed?: string}> = ({at, seed = 'iroom'}) => {
  const t = useTime();
  const r = rng(`iroom/${seed}`);
  const [gx, gy, gw, gh] = INTERVIEW.glass;
  const PT = INTERVIEW.partition;
  const clipId = ('iglass' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  const partId = ('ipart' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  // a colleague walks past BEHIND the frosted partition every 3.6 s (a clear darker-periwinkle silhouette ~300 px tall,
  // crossing in 2.2 s, a stepped walk), right to left, then left to right
  const wt = Math.floor(t * 12) / 12;
  const wp = loopT(wt, 3.6, 0.9) / 2.2;
  const wdir = Math.floor((wt + 0.9) / 3.6) % 2 === 0 ? -1 : 1;
  const wx = wdir === 1 ? PT.x0 - 80 + (PT.x1 - PT.x0 + 160) * wp : PT.x1 + 80 - (PT.x1 - PT.x0 + 160) * wp;
  const step = Math.floor(t * 6) % 2;
  const feet = PT.bottom - 6;
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
  // ceiling tiles and the acoustic panels on the upper wall (all above the caption band, y < 290)
  const tiles = [-60, 150, 360, 570, 780, 990].map((x, i) => vline(x, -40, 120, {over: [0, 0], seed: `${seed}/tile${i}`})).join('') + hline(-60, 1140, 50, {over: [0, 0], seed: `${seed}/tileH`});
  const panels = [70, 260, 450, 640, 830].map((x) => roundRect(x, 150, 150, 112, 14));
  return (
    <>
      <Fill rect={[-200, -200, 1480, 2320]} color={CC.studio} offset={false} mode="snap" at={at} />
      {/* the ceiling (tiles), the track and its lights; felt acoustic panels on the upper wall (above the band) */}
      <Fill rect={[-200, -200, 1480, 330]} color={CC.studioPanel} offset={false} at={fillAt(at)} />
      <Ink d={tiles} width={W.hair} color={CC.studioDeep} at={at} />
      <Ink d={hline(-60, 1140, 130, {seed: `${seed}/ceil`, over: [0, 0]})} width={W.mid} at={at} />
      {panels.map((d, i) => (
        <Fill key={`ap${i}`} d={d} color={i % 2 ? CC.acoustic : CC.studioDeep} at={fillAt(at, 0.02)} seed={`${seed}/ap${i}`} />
      ))}
      <Ink d={panels.join('') + [70, 260, 450, 640, 830].map((x, i) => hline(x + 16, x + 134, 206, {over: [0, 0], seed: `${seed}/apl${i}`})).join('')} width={W.far} at={at} />
      <Ink d={hline(40, 1060, 196, {seed: `${seed}/track`, over: [0, 0]})} width={10} color={CC.stand} taper={false} at={at} />
      {[150, 420, 700, 960].map((x, i) => (
        <React.Fragment key={i}>
          <Fill d={roundRect(x - 22, 200, 44, 62, 10)} color={CC.stand} at={fillAt(at)} offset={false} />
          <Fill d={blob(x, 262, 20, 6, {seed: `${seed}/sp${i}`})} color={CC.core} offset={false} at={fillAt(at, 0.02)} />
        </React.Fragment>
      ))}
      {/* the frosted partition behind the staffers: the office beyond at ~35 % contrast, a colleague walking past */}
      <defs>
        <clipPath id={partId} clipPathUnits="userSpaceOnUse">
          <rect x={PT.x0} y={PT.top} width={PT.x1 - PT.x0} height={PT.bottom - PT.top} />
        </clipPath>
      </defs>
      <Fill rect={[PT.x0, PT.top, PT.x1 - PT.x0, PT.bottom - PT.top]} color={CC.studioPanel} offset={false} at={fillAt(at)} />
      <Live at={at} c={[(PT.x0 + PT.x1) / 2, (PT.top + PT.bottom) / 2]}>
        <g clipPath={`url(#${partId})`}>
          <OfficeBeyond seed={seed} />
          {wp <= 1 ? (
            <g>
              <circle cx={wx} cy={feet - 268} r={27} fill={CC.officeWalker} />
              <path d={roundRect(wx - 36, feet - 236, 72, 150, 26)} fill={CC.officeWalker} />
              <path d={`M${wx - 13} ${feet - 96}L${wx - (step ? 30 : 6)} ${feet}M${wx + 13} ${feet - 96}L${wx + (step ? 30 : 6)} ${feet}`} stroke={CC.officeWalker} strokeWidth={24} strokeLinecap="round" />
              <path d={`M${wx - 30} ${feet - 220}L${wx - 30 - wdir * (step ? 16 : -10)} ${feet - 120}M${wx + 30} ${feet - 220}L${wx + 30 + wdir * (step ? 16 : -10)} ${feet - 120}`} stroke={CC.officeWalker} strokeWidth={18} strokeLinecap="round" />
            </g>
          ) : null}
          {/* the frosted band across the glass (eye height) */}
          <rect x={PT.x0} y={960} width={PT.x1 - PT.x0} height={52} fill={CC.frost} />
        </g>
      </Live>
      <Fill rect={[PT.x0, 600, PT.x1 - PT.x0 + 8, PT.top - 600]} color={CC.studio} offset={false} at={fillAt(at)} />
      {PT.mullions.map((mx, i) => (
        <Fill key={`mu${i}`} rect={[mx - 6, PT.top, 12, PT.bottom - PT.top]} color={CC.shelfMetal} offset={false} at={fillAt(at, 0.02)} />
      ))}
      <Ink d={rect(PT.x0, PT.top, PT.x1 - PT.x0, PT.bottom - PT.top, {seed: `${seed}/panel`, over: 'small'}) + PT.mullions.map((mx, i) => vline(mx - 6, PT.top, PT.bottom, {over: [0, 0], seed: `${seed}/ps${i}`}) + vline(mx + 6, PT.top, PT.bottom, {over: [0, 0], seed: `${seed}/pt${i}`})).join('')} width={W.far} at={at} />
      {/* the wall clock above the partition (under the caption band) */}
      <WallClock cx={800} cy={652} r={40} rim={CC.stand} seed={`${seed}/clock`} at={at} />
      {/* the glass wall onto the city (left): the town with walkers, the mullion grid */}
      <Fill rect={[gx - 14, gy - 14, gw + 28, gh + 14]} color={CC.shelfMetal} offset={false} at={fillAt(at)} />
      <DuskTown x={gx} y={gy} w={gw} h={gh} horizon={gy + gh * 0.4} k={0.85} moon={[gx + gw * 0.7, gy + 70]} stars={5} clouds={2} seed={`${seed}/town`} at={at} />
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={gx} y={gy} width={gw} height={gh} />
        </clipPath>
      </defs>
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

/** A folded name tent standing on the table (the bottom edge's centre x, y; w, h): its front face with the lettering
 *  (P3: NAME WITHHELD in front of the one who spoke: an object in the room, never a floating caption), the top ridge,
 *  and optionally a black redaction bar over a name line above the words (`redact`). Words stay above y 1520. */
export const NameTent: React.FC<{x: number; y: number; w?: number; h?: number; text?: string; redact?: boolean; at?: At; seed?: string}> = ({x, y, w = 300, h = 74, text = 'NAME WITHHELD', redact = false, at, seed = 'tent'}) => {
  const x0 = x - w / 2;
  const top = y - h;
  const face: [number, number][] = [[x0 + 8, top], [x0 + w - 8, top], [x0 + w, y], [x0, y]];
  const back: [number, number][] = [[x0 + 14, top - 10], [x0 + w - 14, top - 10], [x0 + w - 8, top], [x0 + 8, top]];
  return (
    <>
      <Fill d={polyPath([[x0 + 6, y + 6], [x0 + w + 10, y + 6], [x0 + w + 4, y - 4], [x0 + 10, y - 4]])} color={CC.tableFront} offset={false} at={fillAt(at)} />
      <Fill d={polyPath(back)} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      <Fill d={polyPath(face)} color={CC.paper} at={fillAt(at)} seed={`${seed}/f`} />
      <Ink d={poly(face, {closed: true, seed: `${seed}/fI`, over: 'small'}) + poly(back, {closed: false, seed: `${seed}/bI`, over: [0, 0]})} width={W.mid} at={at} />
      {redact ? <Fill rect={[x - w * 0.3, top + h * 0.14, w * 0.6, h * 0.26]} color={CC.anchor} offset={false} at={fillAt(at, 0.04)} /> : null}
      <Letter x={x} y={redact ? y - h * 0.16 : y - h * 0.3} size={redact ? h * 0.34 : h * 0.46} fit={w * 0.88} anchor="middle" at={b(at, 0.08)}>
        {text}
      </Letter>
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
