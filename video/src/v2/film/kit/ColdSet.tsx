// kit/ColdSet.tsx: THE COLD SET (P7, P9, P10, P11; lane L4). ONE cold, official setting for the deal page AND Google's
// page (fairness: equal size, ground, tone and dressing): an official desk at night seen straight down from above, edge
// to edge, in DUSK's blue-violet family (never the hero cobalt, never grey): a dark violet lacquered top (COLD.table), a
// blotter under the page, a cool desk lamp's pool (top-left), the window's light falling across the desk in two panes
// (and a cloud's shadow drifting through it), other documents and folders, a fountain pen that rolls a little, a glass
// of water with a ripple, a stamp and its pad, paper clips, dust motes in the lamp's light. The caption band (y 290-600)
// holds only the flat desk and the flat window light. The page is the lane's (kit <InsertPage>, never angled).
//   <ColdSet zoom variant at>   zoom 1 (P7, P9, P11) or 0.85 (P10: the pull-back), about the page centre (540, 950)
//   <InsertPage x y w h lift>    a warm white page on the cold set: flat drop shadow, paper, outline, a lifting corner
//   INSERT_PAGES                 the board's page boxes (P9 = P11: Google's page at the deal page's size and place)

import React, {useId} from 'react';
import {blob, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, textLines} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {CC, COLD, COLD_SETS, ColdRoles, ColdSetName} from '../palette';
import {At, b, Fill, fillAt, Ink, Pt, W} from './util';
import {DustMotes, Live, loopT} from './Ambient';

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
  /** 'night' (THE pick) | 'dusk' (the comparison candidate). */
  variant?: ColdSetName;
  /** Ambient rate multiplier (default 1). */
  life?: number;
  at?: At;
  seed?: string;
};

const PAGE = INSERT_PAGES.P9;

export const ColdSet: React.FC<ColdSetProps> = ({zoom = 1, variant, life = 1, at, seed = 'cold'}) => {
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
  const cp = loopT(t, 4.2, 2) / 4.2;
  const pp = loopT(t, 3.2, 0.7) / 1.8;
  const pasDir = Math.floor((t + 0.7) / 3.2) % 2 === 0 ? 1 : -1;
  const pasX = pasDir === 1 ? 1300 - pp * 1300 : pp * 1300;
  const clipId = ('coldpanes' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  const cloudX = -300 + cp * 2000;
  const cloud: Pt[] = [[cloudX, top], [cloudX + 220, top], [cloudX + 100, 2300], [cloudX - 120, 2300]];
  // the pen rolls a little (a nudge every 3.4 s)
  const roll = Math.sin(prog(loopT(t, 3.4, 0.6), 0, 0.9, ease.inOutSine) * Math.PI) * 10;
  // the glass's ripple: a ring growing from the centre every 2.2 s
  const rp = loopT(t, 2.2) / 2.2;
  const glass: Pt = [930, 1640];
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
              <circle cx={pasX} cy={860} r={70} fill={C.table} />
              <path d={roundRect(pasX - 150, 930, 300, 900, 120)} fill={C.table} />
            </g>
          ) : null}
        </Live>
        {/* the desk lamp from above (top-left) and its cool pool */}
        <Fill d={blob(250, 900, 330, 300, {seed: `${seed}/pool`, wobble: 0.02})} color={C.pool} offset={false} at={fillAt(at)} />
        <Fill d={blob(236, 880, 200, 180, {seed: `${seed}/core`, wobble: 0.02})} color={C.poolCore} offset={false} at={fillAt(at)} />
        <DustMotes cx={250} cy={900} rx={300} ry={270} n={9} r={3} color={C.metal} rate={life} seed={`${seed}/motes`} at={at} />
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
        <Fill d={blob(410, 1630, 46, 46, {seed: `${seed}/stamp`})} color={CC.trim} at={fillAt(at)} offset={false} />
        <Fill d={blob(410, 1630, 26, 26, {seed: `${seed}/stampK`})} color={CC.chairShade} offset={false} at={fillAt(at, 0.02)} />
        <Ink d={ellipse(410, 1630, 46, 46, {seed: `${seed}/stampI`})} width={W.mid} color={C.ink} at={at} />
        {clips}
        {/* the desk phone (right margin): body, handset, keys, a coiled cord, a line light that blinks */}
        <DeskPhone x={975} y={760} C={C} t={t} at={at} seed={`${seed}/phone`} />
        {/* a cup of cold coffee on its saucer, a spoon (right margin, lower) */}
        <Fill d={blob(968, 1212, 92, 88, {seed: `${seed}/saucer`})} color={CC.paper} at={fillAt(at)} offset={false} />
        <Fill d={blob(962, 1206, 58, 56, {seed: `${seed}/cup`})} color={CC.paper} at={fillAt(at, 0.02)} offset={false} />
        <Fill d={blob(962, 1206, 44, 42, {seed: `${seed}/coffee`})} color={CC.under} offset={false} at={fillAt(at, 0.03)} />
        <Ink d={ellipse(968, 1212, 92, 88, {seed: `${seed}/saucerI`}) + ellipse(962, 1206, 58, 56, {seed: `${seed}/cupI`}) + roundRect(1012, 1196, 34, 20, 9, {seed: `${seed}/hdl`, closed: false}) + line(890, 1270, 860, 1330, {over: [0, 0], seed: `${seed}/spoon`})} width={W.mid} color={C.ink} at={at} />
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
        {/* the glass of water (lower right) with its ripple */}
        <Fill d={blob(glass[0] + 10, glass[1] + 14, 78, 78, {seed: `${seed}/gsh`})} color={C.shade} offset={false} at={fillAt(at)} />
        <Fill d={blob(glass[0], glass[1], 78, 78, {seed: `${seed}/g`})} color={C.glass} offset={false} at={fillAt(at)} />
        <Fill d={blob(glass[0], glass[1], 60, 60, {seed: `${seed}/w`})} color={C.water} offset={false} at={fillAt(at, 0.02)} />
        <Ink d={ellipse(glass[0], glass[1], 78, 78, {seed: `${seed}/gI`}) + ellipse(glass[0], glass[1], 60, 60, {seed: `${seed}/wI`})} width={W.mid} color={C.ink} at={at} />
        <Live at={at} c={glass}>
          <circle cx={glass[0]} cy={glass[1]} r={8 + rp * 46} fill="none" stroke={C.glass} strokeWidth={3} />
          <path d={`M${glass[0] - 40} ${glass[1] - 40}Q${glass[0] - 50} ${glass[1] - 10} ${glass[0] - 44} ${glass[1] + 14}`} fill="none" stroke={CC.white} strokeWidth={5} strokeLinecap="round" />
        </Live>
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
        <circle cx={x + 76} cy={y + 30} r={9} fill={lit ? CC.recLight : C.blotter} />
      </Live>
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
