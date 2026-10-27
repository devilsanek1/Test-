// P3 helpers (lane L3-people): P3's interview room and table, LOCAL copies of kit Interview.tsx InterviewRoom and kit
// Staffer.tsx InterviewTable (same room, same pieces, same seeds) with the art director's P3 fixes the kit API can't take
// yet (fold back into the kit: REQUESTS lines in the lane report):
//   - VALUES STEP BY DEPTH (the room was one pale periwinkle value, depth only from the ink): a lighter frosted partition
//     (lit from the office beyond), the table top one value step deeper so both cream papers pop, a mid table front, a
//     deeper floor and deeper chairs in the foreground.
//   - the SOFTBOX is mirrored: its diffuser faces the two staffers it lights (it faced the window and the mic), and its
//     back is a mid periwinkle (it was the anchor navy, the biggest solid dark shape in the panel).
//   - the foreground chairs read as chairs (a seam, a mesh, an armrest edge; they read as two dark monitors on poles),
//     a camel coat hangs over the left one; the cable tray has a power strip with a lit dot; a laptop bag leans on the
//     table's front panel.
import React, {useId} from 'react';
import {blob, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {CC, DuskTown, Fill, fillAt, INTERVIEW, Ink, leafD, Live, loopT, onOff, PotPlant, W, WallClock, b, type At, type Pt} from '../kit';

/** P3's value steps (local roles; fold into palette.ts with the kit change). */
export const P3C = {
  partition: '#CDD0EE', // the frosted glass, lit from the office beyond (lighter than the wall)
  frost: '#DCDFF4', // the frosted band across it
  table: '#C3BEE5', // the table top, one value step under the old pale lilac: the cream pages pop on it
  tableShade: '#ADA8DA', // a page's flat shadow on the top
  tableFront: '#A49ED2', // the front panel (mid)
  tray: '#8F96CC', // the cable tray channel
  floor: '#7C83BF', // the carpet (deeper: the foreground)
  carpet: '#6A71AE', // its tile seams and flecks
  chair: '#55537F', // the chair backs (the deepest step, never the anchor)
  chairMesh: '#6B6996',
  softBack: CC.shelfMetal, // the softbox's back: a mid periwinkle, not the anchor navy
  coat: '#C29A6B', // a camel coat over a chair (it echoes the archive boxes: the room's one warm accent)
  coatShade: '#A67E52',
  coatLining: '#7E5A44',
  bag: '#4F4C7A',
  bagFlap: '#625F90',
  lit: '#9FE0A0', // the power strip's lit switch (a small green dot)
} as const;

/** The open-plan office beyond the frosted partition (kit OfficeBeyond, unchanged). */
const OfficeBeyond: React.FC<{seed: string}> = ({seed}) => {
  const t = useTime();
  const {x0, x1, top, bottom} = INTERVIEW.partition;
  const deskY = 1196;
  const F = CC.officeFar;
  const out: React.ReactNode[] = [];
  out.push(<rect key="d1" x={x0 - 10} y={deskY} width={x1 - x0 + 20} height={16} fill={F} />);
  [x0 + 40, x0 + 300, x1 - 40].forEach((lx, i) => out.push(<rect key={`l${i}`} x={lx - 5} y={deskY} width={10} height={bottom - deskY} fill={F} />));
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
  const lean = onOff(t, `${seed}/lean`, 4.6, 0.35) ? 14 : 0;
  [[x0 + 150, 0], [x0 + 560, lean]].forEach(([cx, dx], i) => {
    out.push(
      <g key={`p${i}`}>
        <circle cx={(cx as number) + (dx as number)} cy={deskY - 104} r={24} fill={F} />
        <path d={roundRect((cx as number) - 44 + (dx as number) * 0.5, deskY - 80, 88, 84, 30)} fill={F} />
      </g>,
    );
  });
  out.push(<path key="pl" d={polyPath([[x1 - 160, bottom], [x1 - 150, deskY + 40], [x1 - 110, deskY + 40], [x1 - 100, bottom]])} fill={F} />);
  [-60, -30, 0, 30, 60].forEach((a, i) => out.push(<path key={`pf${i}`} d={leafD(x1 - 130, deskY + 44, 110 - Math.abs(a), -90 + a, 0.32)} fill={F} />));
  out.push(<rect key="cr" x={x0 + 30} y={top + 120} width={9} height={bottom - top - 120} fill={F} />);
  out.push(<path key="cc" d={roundRect(x0 + 6, top + 150, 58, 210, 24)} fill={F} />);
  out.push(<rect key="ch" x={x0 + 10} y={top + 120} width={50} height={8} fill={F} />);
  out.push(<rect key="lt" x={x0} y={top + 40} width={x1 - x0} height={10} fill={CC.officeGlow} />);
  return <>{out}</>;
};

/** The room behind the staffers (kit InterviewRoom with the lighter partition and the mirrored softbox). */
export const P3Room: React.FC<{at?: At; seed?: string}> = ({at, seed = 'p3room'}) => {
  const t = useTime();
  const r = rng(`iroom/${seed}`);
  const [gx, gy, gw, gh] = INTERVIEW.glass;
  const PT = INTERVIEW.partition;
  const clipId = ('p3glass' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  const partId = ('p3part' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  const wt = Math.floor(t * 12) / 12;
  const wp = loopT(wt, 3.6, 0.9) / 2.2;
  const wdir = Math.floor((wt + 0.9) / 3.6) % 2 === 0 ? -1 : 1;
  const wx = wdir === 1 ? PT.x0 - 80 + (PT.x1 - PT.x0 + 160) * wp : PT.x1 + 80 - (PT.x1 - PT.x0 + 160) * wp;
  const step = Math.floor(t * 6) % 2;
  const feet = PT.bottom - 6;
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
  const tiles = [-60, 150, 360, 570, 780, 990].map((x, i) => vline(x, -40, 120, {over: [0, 0], seed: `${seed}/tile${i}`})).join('') + hline(-60, 1140, 50, {over: [0, 0], seed: `${seed}/tileH`});
  const panels = [70, 260, 450, 640, 830].map((x) => roundRect(x, 150, 150, 112, 14));
  // the softbox, mirrored: the back (a tapered box) left, the diffuser right, facing the staffers
  const sbBack: Pt[] = [[394, 700], [290, 760], [290, 940], [394, 1000]];
  const sbFace: Pt[] = [[380, 690], [440, 660], [440, 1040], [380, 1010]];
  return (
    <>
      <Fill rect={[-200, -200, 1480, 2320]} color={CC.studio} offset={false} mode="snap" at={at} />
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
      <defs>
        <clipPath id={partId} clipPathUnits="userSpaceOnUse">
          <rect x={PT.x0} y={PT.top} width={PT.x1 - PT.x0} height={PT.bottom - PT.top} />
        </clipPath>
      </defs>
      <Fill rect={[PT.x0, PT.top, PT.x1 - PT.x0, PT.bottom - PT.top]} color={P3C.partition} offset={false} at={fillAt(at)} />
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
          <rect x={PT.x0} y={960} width={PT.x1 - PT.x0} height={52} fill={P3C.frost} />
        </g>
      </Live>
      <Fill rect={[PT.x0, 600, PT.x1 - PT.x0 + 8, PT.top - 600]} color={CC.studio} offset={false} at={fillAt(at)} />
      {PT.mullions.map((mx, i) => (
        <Fill key={`mu${i}`} rect={[mx - 6, PT.top, 12, PT.bottom - PT.top]} color={CC.shelfMetal} offset={false} at={fillAt(at, 0.02)} />
      ))}
      <Ink d={rect(PT.x0, PT.top, PT.x1 - PT.x0, PT.bottom - PT.top, {seed: `${seed}/panel`, over: 'small'}) + PT.mullions.map((mx, i) => vline(mx - 6, PT.top, PT.bottom, {over: [0, 0], seed: `${seed}/ps${i}`}) + vline(mx + 6, PT.top, PT.bottom, {over: [0, 0], seed: `${seed}/pt${i}`})).join('')} width={W.far} at={at} />
      <WallClock cx={800} cy={652} r={40} rim={CC.stand} seed={`${seed}/clock`} at={at} />
      <Fill rect={[gx - 14, gy - 14, gw + 28, gh + 14]} color={CC.shelfMetal} offset={false} at={fillAt(at)} />
      <DuskTown x={gx} y={gy} w={gw} h={gh} horizon={gy + gh * 0.4} k={0.85} moon={[gx + gw * 0.7, gy + 70]} stars={5} clouds={2} seed={`${seed}/town`} at={at} />
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={gx} y={gy} width={gw} height={gh} />
        </clipPath>
      </defs>
      <Ink d={vline(gx + gw * 0.5, gy, gy + gh, {over: [0, 0], seed: `${seed}/gm1`}) + hline(gx, gx + gw, gy + gh * 0.55, {over: [0, 0], seed: `${seed}/gm2`})} width={10} color={CC.shelfMetal} taper={false} at={at} />
      <Ink d={rect(gx, gy, gw, gh, {seed: `${seed}/gI`, over: 'small'})} width={W.mid} at={at} />
      {/* the softbox on its stand, its diffuser turned to the staffers */}
      <Ink d={line(350, 860, 346, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/stand`}) + line(346, 1180, 292, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/leg1`}) + line(346, 1180, 400, INTERVIEW.tableTop, {over: [0, 0], seed: `${seed}/leg2`})} width={7} color={CC.stand} taper={false} at={at} />
      <Fill d={polyPath(sbBack)} color={P3C.softBack} at={fillAt(at)} seed={`${seed}/sbBack`} />
      <Fill d={roundRect(272, 818, 26, 64, 6)} color={P3C.softBack} at={fillAt(at)} offset={false} />
      <Fill d={polyPath(sbFace)} color={CC.softbox} at={fillAt(at, 0.02)} seed={`${seed}/sb`} />
      <Ink d={poly(sbBack, {closed: true, seed: `${seed}/sbBI`, over: 'small'}) + poly(sbFace, {closed: true, seed: `${seed}/sbI`, over: 'small'}) + roundRect(272, 818, 26, 64, 6, {seed: `${seed}/sbHead`})} width={W.mid} at={at} />
      <Fill rect={[shelfX, 600, 200, 780]} color={CC.studioDeep} offset={false} at={fillAt(at)} />
      {boxes}
      {boards.map((by, i) => (
        <Fill key={i} rect={[shelfX, by, 200, 12]} color={CC.shelfMetal} offset={false} at={fillAt(at)} />
      ))}
      <Ink d={boxInk} width={W.far} at={at} />
      <Ink d={vline(shelfX, 600, 1362, {over: [0, 0], seed: `${seed}/sh1`}) + vline(shelfX + 12, 600, 1362, {over: [0, 0], seed: `${seed}/sh2`}) + boards.map((by, i) => hline(shelfX, 1140, by, {over: [0, 0], seed: `${seed}/sb${i}`})).join('')} width={W.mid} at={at} />
      <PotPlant x={884} y={1200} w={70} h={80} kind="leafy" leaves={9} seed={`${seed}/plant`} at={at} />
    </>
  );
};

/** The interview table (kit InterviewTable with the value steps, real chairs, a coat, a bag, a lit power strip). */
export const P3Table: React.FC<{top?: number; front?: number; bottom?: number; at?: At; seed?: string}> = ({top = 1362, front = 1532, bottom = 1732, at, seed = 'p3table'}) => {
  const x0 = -60;
  const x1 = 1140;
  const seams = [300, 640, 980].map((x, i) => line(x, front + 22, x, bottom - 4, {over: [0, 0], seed: `${seed}/sm${i}`})).join('');
  const tray = front + 22;
  const vp: Pt = [540, 900];
  const tileX = [-300, -60, 180, 420, 660, 900, 1140, 1380];
  const carpet =
    tileX
      .map((bx, i) => {
        const u = (bottom - vp[1]) / (2000 - vp[1]);
        return line(vp[0] + (bx - vp[0]) * u, bottom, bx, 2000, {over: [0, 0], seed: `${seed}/ct${i}`});
      })
      .join('') + [1800, 1890].map((yy, i) => hline(x0, x1, yy, {over: [0, 0], seed: `${seed}/ch${i}`})).join('');
  const flecks: Pt[] = [];
  for (let i = 0; i < 46; i++) flecks.push([((i * 197) % 1180) - 40, bottom + 18 + ((i * 89) % 170)]);
  // a chair back: frame, a mesh panel with a centre seam, the armrest's edge on one side, the post
  const chairBack = (cx: number, cy: number, w: number, arm: 1 | -1, k: string) => {
    const back = roundRect(cx - w / 2, cy, w, w * 0.62, w * 0.16);
    const inner = roundRect(cx - w * 0.38, cy + w * 0.08, w * 0.76, w * 0.42, w * 0.1);
    let mesh = '';
    for (let i = 1; i < 7; i++) {
      const xx = cx - w * 0.38 + (w * 0.76 * i) / 7;
      mesh += line(xx - w * 0.06, cy + w * 0.1, xx + w * 0.06, cy + w * 0.48, {over: [0, 0], seed: `${seed}/${k}m${i}`});
    }
    const armX = cx + arm * w * 0.56;
    return (
      <React.Fragment key={k}>
        <Fill rect={[cx - w * 0.07, cy + w * 0.6, w * 0.14, 2000 - cy]} color={CC.stand} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={roundRect(armX - w * 0.1, cy + w * 0.36, w * 0.2, w * 0.1, w * 0.04)} color={P3C.chair} offset={false} at={fillAt(at, 0.02)} />
        <Fill rect={[armX - w * 0.02, cy + w * 0.44, w * 0.04, w * 0.4]} color={CC.stand} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={back} color={P3C.chair} at={fillAt(at, 0.02)} seed={`${seed}/${k}`} />
        <Fill d={inner} color={P3C.chairMesh} offset={false} at={fillAt(at, 0.03)} />
        <Ink d={mesh} width={W.hair} color={P3C.chair} at={b(at, 0.05)} />
        <Ink d={back + roundRect(armX - w * 0.1, cy + w * 0.36, w * 0.2, w * 0.1, w * 0.04, {seed: `${seed}/${k}a`})} width={W.mid} at={b(at, 0.02)} />
        <Ink d={inner + line(cx, cy + w * 0.08, cx, cy + w * 0.5, {over: [0, 0], seed: `${seed}/${k}s`})} width={W.far} at={b(at, 0.04)} />
      </React.Fragment>
    );
  };
  // a camel coat hung over the left chair's back: its shoulders over the top edge, the collar's V with the lining,
  // lapels, buttons, one sleeve hanging down the side and the hem below the chair back (fabric, never a bag)
  const coat = (cx: number, cy: number, w: number) => {
    const hw = w / 2;
    const body: Pt[] = [[cx - hw, cy + 10], [cx - hw * 0.92, cy - 8], [cx - hw * 0.5, cy - 14], [cx + hw * 0.5, cy - 14], [cx + hw * 0.92, cy - 8], [cx + hw, cy + 10], [cx + hw * 1.04, cy + 120], [cx + hw * 1.08, cy + 226], [cx - hw * 1.06, cy + 230], [cx - hw * 1.02, cy + 120]];
    const lining: Pt[] = [[cx - 30, cy - 13], [cx + 30, cy - 13], [cx + 2, cy + 78]];
    const lapL: Pt[] = [[cx - 56, cy - 11], [cx - 30, cy - 13], [cx + 2, cy + 78], [cx - 22, cy + 62]];
    const lapR: Pt[] = [[cx + 56, cy - 11], [cx + 30, cy - 13], [cx + 2, cy + 78], [cx + 24, cy + 60]];
    const sleeve: Pt[] = [[cx + hw * 0.84, cy + 4], [cx + hw * 1.06, cy + 96], [cx + hw * 1.1, cy + 214]];
    const d = smooth(body, {closed: true, tension: 0.32});
    const sl = smooth([[sleeve[0][0] - 20, sleeve[0][1]], [sleeve[1][0] - 22, sleeve[1][1]], [sleeve[2][0] - 20, sleeve[2][1]], [sleeve[2][0] + 22, sleeve[2][1] + 4], [sleeve[1][0] + 22, sleeve[1][1]], [sleeve[0][0] + 22, sleeve[0][1] + 6]], {closed: true, tension: 0.32});
    return (
      <>
        <Fill d={d} color={P3C.coat} at={fillAt(at, 0.03)} seed={`${seed}/coat`} />
        <Fill d={polyPath(lining)} color={P3C.coatLining} offset={false} at={fillAt(at, 0.04)} />
        <Fill d={polyPath(lapL) + polyPath(lapR)} color={P3C.coatShade} offset={false} at={fillAt(at, 0.04)} />
        <Fill d={sl} color={P3C.coatShade} at={fillAt(at, 0.04)} seed={`${seed}/sleeve`} />
        <Fill rect={[sleeve[2][0] - 20, sleeve[2][1] - 18, 42, 16]} color={P3C.coat} offset={false} at={fillAt(at, 0.05)} />
        <Ink d={d + poly(lapL, {closed: true, seed: `${seed}/lapL`, over: [0, 0]}) + poly(lapR, {closed: true, seed: `${seed}/lapR`, over: [0, 0]}) + sl + line(cx + 2, cy + 78, cx + 4, cy + 228, {over: [0, 0], seed: `${seed}/coatF`})} width={W.mid} at={b(at, 0.03)} />
        <Ink d={line(cx - hw * 0.62, cy + 150, cx - hw * 0.2, cy + 156, {over: [0, 0], seed: `${seed}/pk`})} width={W.far} at={b(at, 0.05)} />
        {[110, 150, 190].map((v, i) => (
          <Fill key={i} d={blob(cx - 14, cy + v, 6, 6, {seed: `${seed}/btn${i}`})} color={CC.anchor} offset={false} at={fillAt(at, 0.05)} />
        ))}
      </>
    );
  };
  // a laptop bag leaning on the table's front panel, standing on the floor
  const bag = (bx: number, by: number) => {
    const d = roundRect(bx, by - 96, 150, 96, 12);
    const flap = roundRect(bx, by - 96, 150, 44, 12);
    return (
      <>
        <Ink d={smooth([[bx + 26, by - 92], [bx + 60, by - 150], [bx + 110, by - 148], [bx + 126, by - 92]])} width={8} color={P3C.bag} taper={false} at={b(at, 0.02)} />
        <Fill d={d} color={P3C.bag} at={fillAt(at, 0.02)} seed={`${seed}/bag`} />
        <Fill d={flap} color={P3C.bagFlap} offset={false} at={fillAt(at, 0.03)} />
        <Fill d={roundRect(bx + 64, by - 58, 22, 14, 3)} color={CC.shelfMetal} offset={false} at={fillAt(at, 0.04)} />
        <Ink d={d + flap} width={W.mid} at={b(at, 0.02)} />
      </>
    );
  };
  return (
    <>
      <Fill rect={[x0, top, x1 - x0, front - top]} color={P3C.table} at={fillAt(at)} mode="snap" offset={false} />
      <Fill rect={[x0, front, x1 - x0, bottom - front]} color={P3C.tableFront} at={fillAt(at)} mode="snap" offset={false} />
      <Fill rect={[x0, bottom, x1 - x0, 2000 - bottom]} color={P3C.floor} at={fillAt(at)} mode="snap" offset={false} />
      <Ink d={carpet} width={W.hair} color={P3C.carpet} at={b(at, 0.04)} />
      <Live at={at} c={[540, bottom + 90]}>
        {flecks.map(([fx, fy], i) => (
          <rect key={i} x={fx} y={fy} width={7} height={4} fill={P3C.carpet} />
        ))}
      </Live>
      {/* the cable tray under the lip: a darker channel, cables sagging out of it, a power strip with its lit switch */}
      <Fill rect={[x0, tray, x1 - x0, 26]} color={P3C.tray} offset={false} at={fillAt(at, 0.02)} />
      <Fill d={roundRect(700, tray + 4, 150, 18, 5)} color={CC.studioPanel} offset={false} at={fillAt(at, 0.03)} />
      <Live at={at} c={[830, tray + 13]}>
        <circle cx={830} cy={tray + 13} r={5} fill={P3C.lit} />
        {[724, 752, 780].map((sx) => (
          <rect key={sx} x={sx} y={tray + 9} width={12} height={8} rx={2} fill={P3C.tray} />
        ))}
      </Live>
      <Ink d={smooth([[120, tray + 26], [180, tray + 70], [260, tray + 64], [330, tray + 26]]) + smooth([[860, tray + 22], [900, tray + 64], [960, tray + 70]])} width={4} color={CC.cable} taper={false} at={b(at, 0.06)} />
      <Ink d={hline(x0, x1, top, {seed: `${seed}/t`, over: [0, 0]}) + hline(x0, x1, front, {seed: `${seed}/f`, over: [0, 0]}) + hline(x0, x1, bottom, {seed: `${seed}/b`, over: [0, 0]}) + hline(x0, x1, tray + 26, {seed: `${seed}/tr`, over: [0, 0]})} width={W.mid} at={at} />
      <Ink d={hline(x0, x1, front + 16, {seed: `${seed}/e`, over: [0, 0]}) + seams} width={W.hair} at={b(at, 0.05)} />
      {bag(468, bottom + 4)}
      {chairBack(210, 1660, 300, -1, 'chA')}
      {coat(206, 1654, 210)}
      {chairBack(820, 1690, 280, 1, 'chB')}
    </>
  );
};
