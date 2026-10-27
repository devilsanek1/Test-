// kit/ColdSet.tsx: THE COLD SET (P7, P9, P10, P11; lane L4). ONE cold, official setting for the deal page AND Google's
// page (fairness: equal size, ground, tone and dressing): an official desk at dusk seen straight down from above, edge
// to edge, in DUSK's blue-violet family (never the hero cobalt, never grey): a mid-violet top (COLD.table), a blotter
// under the page, a cool desk lamp's pool (top-left), the window's light falling across the desk in two panes (a
// cloud's shadow drifts through it, a branch's leaves sway in it, people passing the window cross it as crisp
// shadows), other documents and folders (an official rosette seal on one), a fountain pen that rolls a little, a cup
// of coffee with steam, a desk phone whose line lights blink, a smartphone that lights with notifications, a rubber
// stamp lying by its pad, paper clips, dust motes in the lamp's light, and once per shot an official's hand (maroon
// cuff) sliding a document onto the left pile (`slide`). The caption band (y 290-600) holds only the flat desk; the
// window light starts under it. The page is the lane's (kit <InsertPage>, never angled).
//   <ColdSet zoom variant slide at>  zoom 1 (P7, P9, P11) or 0.85 (P10: the pull-back), about the page centre (540, 950)
//   <InsertPage x y w h lift>        a warm white page on the cold set: flat drop shadow, paper, outline, a lifting corner
//   INSERT_PAGES                     the board's page boxes (P9 = P11: Google's page at the deal page's size and place)

import React, {useId} from 'react';
import {blob, crown, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, textLines} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {CC, COLD, COLD_SETS, ColdRoles, ColdSetName} from '../palette';
import {At, b, Fill, fillAt, Ink, Pt, W} from './util';
import {DustMotes, Live, loopT, Steam} from './Ambient';

/** The board's page boxes: P9 and P11 share one box (Google's page at the deal page's size, position, ground, tone). */
export const INSERT_PAGES = {
  P7: {x: 320, y: 640, w: 440, h: 600},
  P9: {x: 310, y: 640, w: 460, h: 620},
  P10: {x: 344.5, y: 686.5, w: 391, h: 527},
  P11: {x: 310, y: 640, w: 460, h: 620},
} as const;
/** The set's zoom centre (the page centre): P10's 0.85 pull-back is the same set scaled about it. */
export const COLD_CENTRE: Pt = [540, 950];

export type ColdSetProps = {
  /** 1 (P7, P9, P11) or 0.85 (P10's pull-back): the whole set scales about COLD_CENTRE. */
  zoom?: number;
  /** 'dusk' (THE pick, COLD_PICK: the default) | 'night' (the rejected comparison candidate). */
  variant?: ColdSetName;
  /** Ambient rate multiplier (default 1). */
  life?: number;
  /** Once per shot an official's hand (maroon suit cuff) slides a document onto the left pile at this scene time (s;
   *  default 1.2; false = never): in 0.5 s, holds 0.35 s, withdraws in 0.4 s; the document stays. People near, never
   *  a face; it never touches the page or the caption band. */
  slide?: number | false;
  at?: At;
  seed?: string;
};

const PAGE = INSERT_PAGES.P9;

export const ColdSet: React.FC<ColdSetProps> = ({zoom = 1, variant, life = 1, slide = 1.2, at, seed = 'cold'}) => {
  const tt = useTime();
  const t = tt * life;
  const C: ColdRoles = variant ? COLD_SETS[variant] : COLD;
  const r = rng(`coldset/${seed}`);
  const M = zoom === 1 ? mat.I : mat.about(mat.scale(zoom), COLD_CENTRE[0], COLD_CENTRE[1]);
  // the window's light: two panes falling across the desk from the upper right, drifting slowly
  const drift = Math.sin(t * 0.12) * 18;
  // (the light starts under the caption band, y 610, so captions sit on the flat desk: white 4.6:1)
  const top = 610;
  const pane = (x0: number): Pt[] => [[x0 + drift, top], [x0 + 300 + drift, top], [x0 - 120 + drift, 2300], [x0 - 420 + drift, 2300]];
  const paneA = pane(900);
  const paneB = pane(1240);
  // a cloud's shadow sliding through the light every 4.2 s; someone passing the window every 5.6 s (a head-and-
  // shoulders shadow crossing the light panes: people near, never seen)
  const cp = loopT(t, 3.0, 2) / 3.0;
  const pp = loopT(t, 3.2, 0.7) / 1.8;
  const pasDir = Math.floor((t + 0.7) / 3.2) % 2 === 0 ? 1 : -1;
  const pasX = pasDir === 1 ? 1300 - pp * 1300 : pp * 1300;
  const clipId = ('coldpanes' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  const cloudX = -300 + cp * 2000;
  const cloud: Pt[] = [[cloudX, top], [cloudX + 220, top], [cloudX + 100, 2300], [cloudX - 120, 2300]];
  // the pen rolls a little (a nudge every 3.4 s)
  const roll = Math.sin(prog(loopT(t, 3.4, 0.6), 0, 0.9, ease.inOutSine) * Math.PI) * 10;
  // the slide: a document pushed in from the left edge by a hand in a maroon cuff (then the hand withdraws)
  const slideIn = slide === false ? -1 : prog(tt, slide, 0.5, ease.outCubic);
  const slideOut = slide === false ? 0 : prog(tt, slide + 0.85, 0.4, ease.inCubic);
  const ink = (w: number) => w;
  const docs: React.ReactNode[] = [];
  // other documents: a page lower-left, a folder stack lower-right, a closed folder top-right
  const docPage = (x: number, y: number, w: number, h: number, rot: number, k: string, per = 0) => {
    // the top-right corner lifts in the draft every `per` s (0 = never)
    const u = per ? loopT(t, per, rand(seed, k) * per) / per : 1;
    const lk = per && u < 0.3 ? Math.sin((u / 0.3) * Math.PI) : 0;
    const c = 30 + 22 * lk;
    const fold: Pt[] = [[x + w - c, y], [x + w, y + c], [x + w - c * 0.92 - 8 * lk, y + c * 0.92 + 8 * lk]];
    return (
      <XG key={k} m={mat.about(mat.rotate(rot), x + w / 2, y + h / 2)}>
        <Fill rect={[x + 10, y + 12, w, h]} color={C.shade} offset={false} at={fillAt(at)} />
        <Fill rect={[x, y, w, h]} color={CC.paper} at={fillAt(at)} seed={`${seed}/${k}`} />
        <Ink d={rect(x, y, w, h, {seed: `${seed}/${k}I`, over: 'small'})} width={ink(W.mid)} color={C.ink} at={at} />
        <Ink d={textLines(x + w * 0.1, y + h * 0.14, w * 0.7, {n: Math.max(3, Math.floor(h / 46)), gap: 30, seed: `${seed}/${k}t`, heading: true})} width={W.far} color={C.ink} at={b(at, 0.06)} />
        {per ? (
          <>
            <Fill d={polyPath([[x + w - c, y - 1], [x + w + 1, y - 1], [x + w + 1, y + c]])} color={C.table} offset={false} at={fillAt(at)} />
            <Fill d={polyPath(fold)} color={CC.paperEdge} offset={false} at={fillAt(at)} />
            <Ink d={poly(fold, {closed: true, seed: `${seed}/${k}f`, over: [0, 0]})} width={W.far} color={C.ink} at={at} />
          </>
        ) : null}
      </XG>
    );
  };
  docs.push(docPage(-90, 1350, 340, 440, 7, 'docA'));
  docs.push(docPage(-60, 1300, 330, 420, -4, 'docB', 3.1));
  docs.push(docPage(420, 1740, 250, 300, -3, 'docC', 3.9));
  docs.push(docPage(380, 60, 230, 200, 5, 'docD', 5.2));
  const folder = (x: number, y: number, w: number, h: number, rot: number, col: string, k: string) => (
    <XG key={k} m={mat.about(mat.rotate(rot), x + w / 2, y + h / 2)}>
      <Fill rect={[x + 10, y + 12, w, h]} color={C.shade} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(x + w * 0.62, y - 26, w * 0.3, 34, 8)} color={col} at={fillAt(at)} seed={`${seed}/${k}tab`} />
      <Fill rect={[x, y, w, h]} color={col} at={fillAt(at)} seed={`${seed}/${k}`} />
      <Fill rect={[x + w * 0.1, y + h * 0.12, w * 0.5, h * 0.12]} color={CC.paper} offset={false} at={fillAt(at, 0.03)} />
      <Ink d={rect(x, y, w, h, {seed: `${seed}/${k}I`, over: 'small'}) + roundRect(x + w * 0.62, y - 26, w * 0.3, 34, 8, {seed: `${seed}/${k}tI`, closed: false}) + hline(x + w * 0.14, x + w * 0.5, y + h * 0.18, {over: [0, 0], seed: `${seed}/${k}l`})} width={W.mid} color={C.ink} at={at} />
    </XG>
  );
  docs.push(folder(800, 1380, 400, 300, -5, C.folder, 'fA'));
  docs.push(folder(780, 1460, 400, 300, 4, C.folder2, 'fB'));
  docs.push(folder(840, 64, 380, 200, 3, C.folder2, 'fC'));
  // an in-tray top-left (cut by the edge) with papers in it
  docs.push(
    <XG key="tray" m={mat.about(mat.rotate(-4), 90, 160)}>
      <Fill rect={[-120, 40, 380, 250]} color={C.shade} offset={false} at={fillAt(at)} />
      <Fill rect={[-130, 30, 380, 250]} color={C.folder} at={fillAt(at)} seed={`${seed}/tray`} />
      <Fill rect={[-100, 54, 300, 200]} color={CC.paper} at={fillAt(at, 0.02)} seed={`${seed}/trayP`} />
      <Ink d={rect(-130, 30, 380, 250, {seed: `${seed}/trayI`, over: 'small'}) + rect(-100, 54, 300, 200, {seed: `${seed}/trayPI`, over: [0, 0]}) + textLines(-80, 90, 240, {n: 4, gap: 30, seed: `${seed}/trayT`, heading: true})} width={W.mid} color={C.ink} at={at} />
    </XG>,
  );
  // paper clips
  const clips = [[230, 1250, 20], [880, 1330, -30], [140, 1150, 70]].map(([x, y, a], i) => (
    <XG key={`c${i}`} m={mat.about(mat.rotate(a), x, y)}>
      <Ink d={roundRect(x - 26, y - 8, 52, 16, 8, {seed: `${seed}/clip${i}`}) + roundRect(x - 18, y - 4, 38, 8, 4, {seed: `${seed}/clipb${i}`, closed: false})} width={3} color={C.metal} taper={false} at={b(at, 0.08)} />
    </XG>
  ));
  return (
    <XG m={M}>
      <InkScale zoom={zoom}>
        {/* the desk top, edge to edge (+ bleed for the 0.85 pull-back) */}
        <Fill rect={[-600, -600, 2300, 3200]} color={C.table} offset={false} mode="snap" at={at} />
        {/* the desk's grain (hairlines; none in the caption band) */}
        <Ink d={grain(seed)} width={W.hair} color={C.seam} at={at} />
        {/* the window's light, with a cloud's shadow and a passer-by's shadow drifting through it */}
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={polyPath(paneA) + polyPath(paneB)} />
          </clipPath>
        </defs>
        <Live at={at} c={[900, 900]}>
          <path d={polyPath(paneA)} fill={C.light} />
          <path d={polyPath(paneB)} fill={C.light} />
          <path d={polyPath(cloud)} fill={C.table} />
          {pp <= 1 ? (
            <g clipPath={`url(#${clipId})`}>
              <path d={passerD(pasX)} fill={C.shadow} />
            </g>
          ) : null}
          {/* a branch outside the window: its leaves' shadow sways in the light, always (crisp, flat) */}
          <g clipPath={`url(#${clipId})`}>
            <XG m={mat.about(mat.rotate(branchSway(t)), 1260, 420)}>
              <path d={branchD} fill={C.shadow} />
            </XG>
          </g>
        </Live>
        {/* the desk lamp from above (top-left) and its cool pool */}
        <Fill d={blob(250, 900, 330, 300, {seed: `${seed}/pool`, wobble: 0.02})} color={C.pool} offset={false} at={fillAt(at)} />
        <Fill d={blob(236, 880, 200, 180, {seed: `${seed}/core`, wobble: 0.02})} color={C.poolCore} offset={false} at={fillAt(at)} />
        <DustMotes cx={250} cy={900} rx={300} ry={270} n={12} r={5} color={C.metal} rate={life * 1.6} seed={`${seed}/motes`} at={at} />
        {/* the blotter under the page */}
        <Fill rect={[PAGE.x - 60, PAGE.y - 40, PAGE.w + 120, PAGE.h + 110]} color={C.blotter} at={fillAt(at)} seed={`${seed}/blot`} />
        <Fill rect={[PAGE.x - 60, PAGE.y - 40, 36, PAGE.h + 110]} color={C.blotterEdge} offset={false} at={fillAt(at, 0.02)} />
        <Fill rect={[PAGE.x + PAGE.w + 24, PAGE.y - 40, 36, PAGE.h + 110]} color={C.blotterEdge} offset={false} at={fillAt(at, 0.02)} />
        <Ink d={rect(PAGE.x - 60, PAGE.y - 40, PAGE.w + 120, PAGE.h + 110, {seed: `${seed}/blotI`, over: 'small'}) + vline2(PAGE.x - 24, PAGE.y - 40, PAGE.y + PAGE.h + 70, `${seed}/bl1`) + vline2(PAGE.x + PAGE.w + 24, PAGE.y - 40, PAGE.y + PAGE.h + 70, `${seed}/bl2`)} width={W.mid} color={C.ink} at={at} />
        {docs}
        {/* the desk lamp seen from above (top-left): its base clamped at the left edge, two arm bars with a spring,
            the round shade over its pool (a dark rim ring, the shade's top, its cap) */}
        <Fill d={blob(-30, 540, 70, 70, {seed: `${seed}/lbase`})} color={C.lamp} offset={false} at={fillAt(at)} />
        <Ink d={line(-20, 548, 40, 640, {over: [0, 0], seed: `${seed}/arm1`}) + line(40, 640, 104, 714, {over: [0, 0], seed: `${seed}/arm2`})} width={14} color={C.lamp} taper={false} at={at} />
        <Ink d={line(-8, 560, 50, 646, {over: [0, 0], seed: `${seed}/spr`})} width={3} color={C.metal} taper={false} dash="6 6" at={b(at, 0.04)} />
        <Fill d={blob(40, 640, 12, 12, {seed: `${seed}/joint`})} color={C.metal} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={blob(124, 736, 84, 84, {seed: `${seed}/rim`})} color={C.lamp} at={fillAt(at)} offset={false} />
        <Fill d={blob(120, 732, 62, 62, {seed: `${seed}/shade`})} color={C.blotterEdge} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={blob(116, 728, 24, 24, {seed: `${seed}/cap`})} color={C.lamp} offset={false} at={fillAt(at, 0.03)} />
        <Ink d={ellipse(124, 736, 84, 84, {seed: `${seed}/rimI`}) + ellipse(120, 732, 62, 62, {seed: `${seed}/shI`})} width={W.mid} color={C.ink} at={at} />
        {/* the stamp and its pad (lower left, by the documents) */}
        <Fill d={roundRect(150, 1540, 180, 120, 14)} color={C.stampPad} at={fillAt(at)} seed={`${seed}/pad`} />
        <Fill d={roundRect(166, 1556, 148, 88, 10)} color={C.blotter} offset={false} at={fillAt(at, 0.02)} />
        <Ink d={roundRect(150, 1540, 180, 120, 14, {seed: `${seed}/padI`})} width={W.mid} color={C.ink} at={at} />
        <RubberStamp x={356} y={1630} C={C} at={at} seed={`${seed}/rstamp`} />
        {clips}
        {/* the desk phone (right margin): body, handset, keys, a coiled cord, a line light that blinks */}
        <DeskPhone x={975} y={760} C={C} t={t} at={at} seed={`${seed}/phone`} />
        {/* a cup of cold coffee on its saucer, a spoon (right margin, lower) */}
        <Fill d={blob(968, 1212, 92, 88, {seed: `${seed}/saucer`})} color={CC.paper} at={fillAt(at)} offset={false} />
        <Fill d={blob(962, 1206, 58, 56, {seed: `${seed}/cup`})} color={CC.paper} at={fillAt(at, 0.02)} offset={false} />
        <Fill d={blob(962, 1206, 44, 42, {seed: `${seed}/coffee`})} color={CC.under} offset={false} at={fillAt(at, 0.03)} />
        <Ink d={ellipse(968, 1212, 92, 88, {seed: `${seed}/saucerI`}) + ellipse(962, 1206, 58, 56, {seed: `${seed}/cupI`}) + roundRect(1012, 1196, 34, 20, 9, {seed: `${seed}/hdl`, closed: false}) + line(890, 1270, 860, 1330, {over: [0, 0], seed: `${seed}/spoon`})} width={W.mid} color={C.ink} at={at} />
        <Steam x={962} y={1176} h={130} amp={12} n={3} width={8} color={C.metal} seed={`${seed}/cupsteam`} at={at} />
        {/* a smartphone face up: its screen lights with a notification every ~2.6 s */}
        <Smartphone x={846} y={1316} C={C} t={t} at={at} seed={`${seed}/mobile`} />
        {/* reading glasses (left margin) */}
        <XG m={mat.about(mat.rotate(-18), 130, 1110)}>
          <Fill d={blob(90, 1110, 36, 30, {seed: `${seed}/g1`})} color={C.glass} offset={false} at={fillAt(at)} />
          <Fill d={blob(176, 1110, 36, 30, {seed: `${seed}/g2`})} color={C.glass} offset={false} at={fillAt(at)} />
          <Ink d={ellipse(90, 1110, 36, 30, {seed: `${seed}/g1I`}) + ellipse(176, 1110, 36, 30, {seed: `${seed}/g2I`}) + smooth([[126, 1104], [133, 1096], [140, 1104]]) + line(54, 1104, 20, 1200, {over: [0, 0], seed: `${seed}/t1`}) + line(212, 1104, 232, 1204, {over: [0, 0], seed: `${seed}/t2`})} width={W.mid} color={C.ink} at={at} />
        </XG>
        {/* the fountain pen beside the page (it rolls a little) */}
        <XG m={mat.compose(mat.translate(842 + roll, 940), mat.rotate(68))}>
          <Fill d={roundRect(-150, -13, 300, 26, 13)} color={C.pen} at={fillAt(at)} offset={false} />
          <Fill rect={[30, -13, 14, 26]} color={C.penBand} offset={false} at={fillAt(at, 0.02)} />
          <Fill d={polyPath([[150, -9], [200, 0], [150, 9]])} color={C.metal} offset={false} at={fillAt(at, 0.02)} />
          <Ink d={roundRect(-150, -13, 300, 26, 13, {seed: `${seed}/penI`}) + poly([[150, -9], [200, 0], [150, 9]], {seed: `${seed}/nib`, over: [0, 0]})} width={W.mid} color={C.ink} at={at} />
        </XG>
        {/* an official rosette seal on the lower folder (ribbon tails: it reads as a seal, never a disc) */}
        <Rosette x={1036} y={1600} r={48} C={C} at={at} seed={`${seed}/seal`} />
        {/* the document the official's hand slides onto the left pile (it stays) and the hand itself */}
        {slideIn >= 0 && tt >= (slide as number) ? <SlideDoc p={slideIn} out={slideOut} C={C} at={at} seed={`${seed}/slide`} /> : null}
        {void r}
      </InkScale>
    </XG>
  );
};

const vline2 = (x: number, y0: number, y1: number, seed: string) => line(x, y0, x, y1, {over: [0, 0], seed});

/** The desk's grain: wavy hairlines across the top, none in the caption band (y 280-620). */
const grain = (seed: string): string => {
  const r = rng(`grain/${seed}`);
  let d = '';
  const ys = [40, 130, 210, 660, 740, 830, 930, 1040, 1150, 1260, 1370, 1470, 1580, 1690, 1800, 1890];
  ys.forEach((y0, i) => {
    const pts: Pt[] = [];
    const amp = r.range(4, 12);
    const ph = r.range(0, 6.28);
    const x0 = r.range(-200, 300);
    const x1 = r.range(780, 1300);
    for (let x = x0; x <= x1; x += 90) pts.push([x, y0 + Math.sin(x / 160 + ph) * amp]);
    d += smooth(pts);
    if (r.chance(0.4)) d += smooth([[x0 + 200, y0 + 18], [x0 + 260, y0 + 10], [x0 + 330, y0 + 20]]) + (i % 3 === 0 ? smooth([[x1 - 260, y0 - 16], [x1 - 200, y0 - 26], [x1 - 140, y0 - 14]]) : '');
  });
  return d;
};

/** An official desk phone seen from above (centre x, y): body, handset, keys, a coiled cord, a blinking line light. */
const DeskPhone: React.FC<{x: number; y: number; C: ColdRoles; t: number; at?: At; seed: string}> = ({x, y, C, t, at, seed}) => {
  const body: Pt[] = [[x - 96, y - 82], [x + 96, y - 82], [x + 112, y + 96], [x - 112, y + 96]];
  const keys: string[] = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) keys.push(roundRect(x - 50 + i * 36, y + 4 + j * 22, 26, 16, 4));
  const cord: Pt[] = [];
  for (let i = 0; i <= 14; i++) cord.push([x - 112 - i * 8 + Math.sin(i * 1.9) * 9, y + 40 + i * 14 + Math.cos(i * 1.9) * 9]);
  const lit = Math.floor(t * 1.6) % 2 === 0;
  return (
    <>
      <Ink d={smooth(cord)} width={5} color={C.lamp} taper={false} at={at} />
      <Fill d={polyPath(body)} color={C.lamp} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill d={roundRect(x - 112, y - 120, 224, 64, 30)} color={C.blotter} at={fillAt(at, 0.02)} seed={`${seed}/h`} />
      <Fill d={keys.join('')} color={C.metal} offset={false} at={fillAt(at, 0.04)} />
      <Ink d={poly(body, {closed: true, seed: `${seed}/bI`, over: 'small'}) + roundRect(x - 112, y - 120, 224, 64, 30, {seed: `${seed}/hI`})} width={W.mid} color={C.ink} at={at} />
      <Live at={at} c={[x + 70, y + 30]}>
        <circle cx={x + 76} cy={y + 30} r={14} fill={lit ? CC.recLight : C.blotter} />
        <circle cx={x + 76} cy={y + 64} r={9} fill={!lit ? CC.recLight : C.blotter} />
      </Live>
    </>
  );
};

/** A smartphone lying face up (top-left x, y): dark glass; every ~2.6 s the screen lights for ~1.1 s with a
 *  notification (two lines and a dot), stepped on / off. */
const Smartphone: React.FC<{x: number; y: number; C: ColdRoles; t: number; at?: At; seed: string}> = ({x, y, C, t, at, seed}) => {
  const on = loopT(Math.floor(t * 12) / 12, 2.6, 0.4) < 1.1;
  return (
    <>
      <Fill d={roundRect(x + 8, y + 10, 96, 184, 18)} color={C.shade} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(x, y, 96, 184, 18)} color={C.pen} at={fillAt(at)} seed={`${seed}/b`} />
      <Ink d={roundRect(x, y, 96, 184, 18, {seed: `${seed}/bI`})} width={W.mid} color={C.ink} at={at} />
      <Live at={at} c={[x + 48, y + 92]}>
        <rect x={x + 9} y={y + 14} width={78} height={156} rx={8} fill={on ? C.poolCore : C.blotter} />
        {on ? (
          <>
            <rect x={x + 16} y={y + 40} width={64} height={34} rx={6} fill={CC.paper} />
            <rect x={x + 22} y={y + 48} width={40} height={6} fill={C.ink} />
            <rect x={x + 22} y={y + 60} width={28} height={6} fill={C.ink} />
            <circle cx={x + 70} cy={y + 52} r={5} fill={CC.recLight} />
          </>
        ) : null}
      </Live>
    </>
  );
};

/** The branch's sway (deg): three incommensurate sines, so it never rests. */
const branchSway = (t: number) => Math.sin(t * 2.1) * 5.5 + Math.sin(t * 5.3) * 2.2 + Math.sin(t * 8.9) * 1;

/** A leafy branch's shadow (in the window light, upper right): a stem from off-frame and seven leaves. */
const branchD = (() => {
  const stem: Pt[] = [[1260, 420], [1130, 640], [1020, 860], [930, 1100]];
  let d = smooth(stem.map(([x, y]) => [x - 7, y] as Pt).concat([...stem].reverse().map(([x, y]) => [x + 7, y] as Pt)), {closed: true});
  const leaves: [number, number, number, number][] = [[1150, 610, 90, 200], [1095, 700, 80, -30], [1060, 790, 96, 160], [1010, 880, 84, -20], [985, 960, 92, 190], [950, 1040, 80, -40], [925, 1120, 76, 110]];
  const leaf = (x: number, y: number, len: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    const u: Pt = [Math.cos(a), Math.sin(a)];
    const n: Pt = [-u[1], u[0]];
    const w = len * 0.42;
    return `M${x} ${y}Q${x + u[0] * len * 0.5 + n[0] * w} ${y + u[1] * len * 0.5 + n[1] * w} ${x + u[0] * len} ${y + u[1] * len}Q${x + u[0] * len * 0.5 - n[0] * w} ${y + u[1] * len * 0.5 - n[1] * w} ${x} ${y}Z`;
  };
  for (const [x, y, l, deg] of leaves) d += leaf(x, y, l, deg);
  return d;
})();

/** A passer-by's shadow across the window light: head, neck, shoulders and arms (crisp, flat). */
const passerD = (x: number): string =>
  blob(x, 830, 74, 82, {seed: 'passerH', wobble: 0.01}) +
  polyPath([[x - 30, 890], [x + 30, 890], [x + 34, 940], [x - 34, 940]]) +
  smooth([[x - 40, 930], [x - 150, 960], [x - 205, 1040], [x - 220, 1400], [x - 200, 2300], [x + 200, 2300], [x + 220, 1400], [x + 205, 1040], [x + 150, 960], [x + 40, 930]], {closed: true, tension: 0.3});

/** A rubber stamp lying on its side (x = the knob's centre, y = its axis): knob, neck, wooden block, the rubber face. */
const RubberStamp: React.FC<{x: number; y: number; C: ColdRoles; at?: At; seed: string}> = ({x, y, C, at, seed}) => {
  const knob = blob(x, y, 32, 30, {seed: `${seed}/k`});
  const neck = roundRect(x + 26, y - 13, 52, 26, 6);
  const block = roundRect(x + 74, y - 38, 80, 76, 8);
  const rubber = roundRect(x + 152, y - 34, 14, 68, 4);
  return (
    <>
      <Fill d={roundRect(x - 20, y + 26, 190, 18, 8)} color={C.shade} offset={false} at={fillAt(at)} />
      <Fill d={neck} color={C.stampWood} at={fillAt(at)} seed={`${seed}/n`} />
      <Fill d={block} color={C.stampWood} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill d={rubber} color={C.stampPad} at={fillAt(at, 0.02)} offset={false} />
      <Fill d={knob} color={C.lamp} at={fillAt(at)} seed={`${seed}/kf`} />
      <Ink d={knob + neck + block + rubber + line(x + 84, y - 30, x + 84, y + 30, {over: [0, 0], seed: `${seed}/g`})} width={W.mid} color={C.ink} at={at} />
    </>
  );
};

/** An official rosette seal (scalloped disc, inner ring, a star) with two V-notched ribbon tails. */
const Rosette: React.FC<{x: number; y: number; r: number; C: ColdRoles; at?: At; seed: string}> = ({x, y, r, C, at, seed}) => {
  const tail = (dx: number, rot: number) => {
    const a = (rot * Math.PI) / 180;
    const P = (u: number, v: number): Pt => [x + dx + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)];
    return polyPath([P(-16, 0), P(16, 0), P(16, r * 2.2), P(0, r * 1.9), P(-16, r * 2.2)]);
  };
  const tails = tail(-14, 16) + tail(14, -16);
  const star = polyPath(Array.from({length: 10}, (_, i): Pt => {
    const rr = i % 2 ? r * 0.2 : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  }));
  return (
    <>
      <Fill d={tails} color={C.sealRib} at={fillAt(at)} seed={`${seed}/t`} />
      <Ink d={tails} width={W.far} color={C.ink} at={at} />
      <Fill d={crown(x, y + r, r, r * 2, {seed: `${seed}/c`, bumps: 16, round: 0.7})} color={C.seal} at={fillAt(at)} offset={false} />
      <Fill d={blob(x, y, r, r, {seed: `${seed}/d`, wobble: 0.01})} color={C.seal} at={fillAt(at)} seed={`${seed}/df`} />
      <Ink d={ellipse(x, y, r, r, {seed: `${seed}/dI`}) + ellipse(x, y, r * 0.66, r * 0.66, {seed: `${seed}/iI`})} width={W.mid} color={C.ink} at={at} />
      <Fill d={star} color={C.sealRib} offset={false} at={fillAt(at, 0.03)} />
    </>
  );
};

/** The slid-in document and the official's hand (p: slide-in progress 0..1, out: the hand's withdrawal 0..1). */
const SlideDoc: React.FC<{p: number; out: number; C: ColdRoles; at?: At; seed: string}> = ({p, out, C, at, seed}) => {
  const dx = -380 * (1 - p);
  const doc = {x: -70 + dx, y: 1236, w: 300, h: 370};
  const hx = doc.x + 96 - 460 * out;
  const hy = doc.y + 200;
  const M = mat.about(mat.rotate(-6), doc.x + doc.w / 2, doc.y + doc.h / 2);
  const sleeve = roundRect(hx - 520, hy - 56, 470, 112, 30);
  const cuff = roundRect(hx - 66, hy - 50, 30, 100, 8);
  const hand = smooth([[hx - 40, hy - 46], [hx + 30, hy - 52], [hx + 70, hy - 30], [hx + 76, hy + 6], [hx + 50, hy + 40], [hx - 40, hy + 46]], {closed: true, tension: 0.35});
  const fingers = [-26, -6, 14].map((fy, i) => line(hx + 24, hy + fy, hx + 66, hy + fy + 4, {over: [0, 0], seed: `${seed}/f${i}`})).join('');
  return (
    <>
      <XG m={M}>
        <Fill rect={[doc.x + 10, doc.y + 12, doc.w, doc.h]} color={C.shade} offset={false} at={fillAt(at)} />
        <Fill rect={[doc.x, doc.y, doc.w, doc.h]} color={CC.paper} offset={false} at={fillAt(at)} />
        <Ink d={rect(doc.x, doc.y, doc.w, doc.h, {seed: `${seed}/dI`, over: 'small'}) + textLines(doc.x + 30, doc.y + 50, 220, {n: 7, gap: 34, seed: `${seed}/dt`, heading: true})} width={W.mid} color={C.ink} at={at} />
      </XG>
      {out < 1 ? (
        <>
          <Fill d={sleeve} color={C.cuff} offset={false} at={fillAt(at)} />
          <Fill d={cuff} color={C.shirt} offset={false} at={fillAt(at)} />
          <Fill d={hand} color={CC.skin2} offset={false} at={fillAt(at)} />
          <Ink d={sleeve + cuff + hand} width={W.mid} color={C.ink} at={at} />
          <Ink d={fingers} width={W.far} color={C.ink} at={at} />
        </>
      ) : null}
    </>
  );
};

export type InsertPageProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The lower-right corner lifts in a draft every ~4.5 s (default true): a page corner that lives, never on the text. */
  lift?: boolean;
  at?: At;
  seed?: string;
  children?: React.ReactNode;
};

/** A warm white page on the cold set: a flat drop shadow (COLD.shade), the paper, the ink outline, a lifting corner.
 *  Children draw on it in canvas px (use <Letter> for its words; pages are never angled). */
export const InsertPage: React.FC<InsertPageProps> = ({x, y, w, h, lift = true, at, seed = 'ipage', children}) => {
  const t = useTime();
  const u = loopT(t, 4.5, 1.3) / 4.5;
  const k = lift ? Math.sin(Math.min(1, u / 0.3) * Math.PI) : 0;
  const c = 26 + 18 * k;
  const corner: Pt[] = [[x + w - c, y + h], [x + w, y + h - c], [x + w - c * 0.95 - 6 * k, y + h - c * 0.95 - 6 * k]];
  return (
    <>
      <Fill rect={[x + 14, y + 16, w, h]} color={COLD.shade} offset={false} at={fillAt(at)} />
      <Fill rect={[x, y, w, h]} color={CC.paper} offset={false} at={fillAt(at)} />
      <Ink d={rect(x, y, w, h, {seed: `${seed}/I`, over: 'small'})} width={W.mid} at={at} />
      {children}
      {lift ? (
        <>
          <Fill d={polyPath([[x + w - c, y + h + 1], [x + w + 1, y + h + 1], [x + w + 1, y + h - c]])} color={COLD.table} offset={false} at={fillAt(at)} />
          <Fill d={polyPath(corner)} color={CC.paperEdge} offset={false} at={fillAt(at)} />
          <Ink d={poly(corner, {closed: true, seed: `${seed}/cI`, over: [0, 0]})} width={W.far} at={at} />
        </>
      ) : null}
    </>
  );
};

/** THE cold ground alone (a flat COLD.table slab), for a lane that must draw something before the set. */
export const ColdGround: React.FC<{at?: At; color?: string}> = ({at, color = COLD.table}) => <Fill rect={[-200, -200, 1480, 2320]} color={color} at={at} mode="snap" offset={false} />;
