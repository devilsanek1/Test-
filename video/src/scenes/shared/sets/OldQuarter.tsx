// OldQuarter — S9 (S12 "too old to fix", S13 board finale + un-build). Golden. Canvas coords at S12 rest.
//
// Door-height eye level (y 1150): we look UP at three website sites built with <SiteFacade/>: siteL (30, 690, 315, 610,
// six storeys, cream), siteM (360, 820, 280, 480, four storeys, sand: the OLD one, an ordinary building), siteR
// (740, 700, 310, 600, six storeys, mintPale). Each has a browser window, a door (y 1150-1300) with a stoop and a lock,
// and a HANGING PLAQUE sign on a bracket at eye level (y 1190): siteL (300, 1190), siteM (590, 1190) = the plaque that
// turns old (tan, chipped, cobweb, dust, cane), siteR (800, 1190). A street gap x 640-740 recedes to the horizon with a
// second row of 9 buildings (every third plaque old) and the far city; a flat peach band only in the gap. Near layer: a
// street tree cropped at the right edge, kerb (y 1500), a bollard (700, 1450, Pip). The sites pop up on "one / in /
// three". S13 adds the noticeboard slot (300, 1090, 500, 310; rail 380, 1060, 340, 28) and edge-audience slots.
//
//   <OldQuarter sun={<Sun cx={500} cy={690} r={110}/>} sitePopAt={[61.2, 61.5, 61.8]} plaqueSwingAt={62.4}
//     oldPlaque={{flipOldAt: 63.6, cobwebAt: 64.4, dustAt: 64.5, caneAt: 64.7}} />
//   <OldQuarter board={{riseAt: 66.7, pane1: ..., pane2: ...}} audience />          // S13

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {crown, crownTicks, line, polyPath, rectPath, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {osc} from '../../../lib/time';
import {rand} from '../../../lib/rng';
import {LayerWrap, noWrap, pavingJoints, PopUp, SetPlace, SI} from './common';
import {BollardSlot, HangingPlaqueSlot, NoticeboardSlot, OnlookerSlot, PaneRect, PlaqueSlot} from './propSlots';
import {SiteFacade, SiteFacadeProps} from './SiteFacade';
import type {Acc, Hair} from '../../../lib/kit';

type R4 = [number, number, number, number];

export const OLD_QUARTER = {
  eye: 1150,
  base: 1300,
  kerb: 1500,
  sites: {
    L: {x: 30, top: 690, w: 315, storeys: 6, fill: palette.cream, browser: [100, 880, 190, 130] as R4, door: [150, 1150, 90, 150] as R4, sign: {x: 300, y: 1190, wallX: 246}},
    M: {x: 360, top: 820, w: 280, storeys: 4, fill: palette.sand, browser: [420, 920, 190, 120] as R4, door: [470, 1150, 90, 150] as R4, sign: {x: 590, y: 1190, wallX: 566}},
    R: {x: 740, top: 700, w: 310, storeys: 6, fill: palette.mintPale, browser: [770, 860, 170, 130] as R4, door: [850, 1150, 90, 150] as R4, sign: {x: 800, y: 1190, wallX: 844}},
  },
  gap: [640, 740] as [number, number],
  vp: [690, 1150] as Pt,
  band: [1040, 1150] as [number, number],
  /** Crate spots on the steps (makers ship, keepers install; never siteM). */
  crates: {L: [195, 1320] as Pt, R: [895, 1320] as Pt},
  bollard: {x: 700, y: 1450, w: 46, h: 86},
  sun: {x: 500, y: 690, r: 110},
  /** S13 board + audience. */
  board: {frame: [300, 1090, 500, 310] as R4, rail: [380, 1060, 340, 28] as R4, legsY: 1480},
  audience: [
    {head: [90, 1290] as Pt, hair: 'curly' as Hair, body: palette.teal, acc: ['hood'] as Acc[]},
    {head: [200, 1350] as Pt, hair: 'bun' as Hair, body: palette.sand, acc: ['scarf'] as Acc[]},
    {head: [890, 1320] as Pt, hair: 'short' as Hair, body: palette.sage, acc: ['collar'] as Acc[]},
    {head: [1000, 1280] as Pt, hair: 'cap' as Hair, body: palette.brown, acc: [] as Acc[]},
  ],
  /** Pip on the board top (S13). */
  pipBoard: [760, 1090] as Pt,
} as const;

type SiteId = 'L' | 'M' | 'R';

const G = (() => {
  const s = 'oq';
  const VP = OLD_QUARTER.vp;
  // street gap receding to the horizon
  const street = polyPath([[640, OLD_QUARTER.base], [740, OLD_QUARTER.base], [VP[0] + 3, VP[1]], [VP[0] - 3, VP[1]]]);
  // second row of 9 buildings (behind the near row), tops 760-800, base on the eye line
  const second: {x: number; w: number; top: number; c: string; plaque: 'new' | 'old'}[] = [];
  let x = 330;
  for (let i = 0; i < 9; i++) {
    const w = 52 + rand(s, `w${i}`) * 16;
    second.push({x, w, top: 760 + rand(s, `t${i}`) * 40, c: [palette.cream, palette.sand, palette.mintPale][i % 3], plaque: i % 3 === 2 ? 'old' : 'new'});
    x += w + 2;
  }
  let secondInk = '';
  let secondWin = '';
  for (const b of second) {
    secondInk += line(b.x, b.top, b.x + b.w, b.top, {seed: `${s}/st${b.x}`, over: 'small', breaks: false}) + line(b.x, b.top, b.x, OLD_QUARTER.eye, {seed: `${s}/sl${b.x}`, over: 0, breaks: false});
    for (let yy = b.top + 14; yy < OLD_QUARTER.eye - 40; yy += 34) secondWin += rectPath(b.x + b.w * 0.2, yy, b.w * 0.24, 16) + rectPath(b.x + b.w * 0.56, yy, b.w * 0.24, 16);
  }
  // far city at the end of the gap
  const far = rectPath(642, 1100, 22, 50) + rectPath(664, 1080, 18, 70) + rectPath(684, 1110, 26, 40) + rectPath(712, 1090, 24, 60);
  const kerb = line(-160, OLD_QUARTER.kerb, 1240, OLD_QUARTER.kerb + 2, {seed: `${s}/k`, over: 0}) + line(-160, OLD_QUARTER.kerb + 20, 1240, OLD_QUARTER.kerb + 23, {seed: `${s}/k2`, over: 0});
  const joints = pavingJoints([690, 1150], OLD_QUARTER.base + 6, OLD_QUARTER.kerb - 4, -900, 2300, 13, 2, `${s}/pj`);
  // stoops in front of each door
  const stoops = (['L', 'M', 'R'] as SiteId[]).map((id) => {
    const d = OLD_QUARTER.sites[id].door;
    return rectPath(d[0] - 14, OLD_QUARTER.base, d[2] + 28, 12) + rectPath(d[0] - 26, OLD_QUARTER.base + 12, d[2] + 52, 12);
  });
  const stoopInk = (['L', 'M', 'R'] as SiteId[])
    .map((id) => {
      const d = OLD_QUARTER.sites[id].door;
      return line(d[0] - 18, OLD_QUARTER.base, d[0] + d[2] + 18, OLD_QUARTER.base, {seed: `${s}/so${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 12, d[0] + d[2] + 30, OLD_QUARTER.base + 12, {seed: `${s}/st${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 24, d[0] + d[2] + 30, OLD_QUARTER.base + 24, {seed: `${s}/sb${id}`, over: 'small'});
    })
    .join('');
  // near street tree cropped at the right edge
  const treeCrown = crown(1040, 1050, 110, 135, {seed: `${s}/tree`, bumps: 10});
  const treeTicks = crownTicks(1040, 1050, 110, 135, {seed: `${s}/treek`, n: 4, size: 12});
  const trunk = rectPath(1022, 1150, 24, 900);
  const trunkInk = line(1022, 2000, 1022, 1160, {seed: `${s}/t1`, over: 0}) + line(1046, 2000, 1045, 1165, {seed: `${s}/t2`, over: 0});
  return {street, second, secondInk, secondWin, far, kerb, joints, stoops, stoopInk, treeCrown, treeTicks, trunk, trunkInk};
})();

export type OldQuarterProps = {
  sun?: React.ReactNode;
  /** The three sites pop up (pop-up book) [L, M, R]. Omit = standing. */
  sitePopAt?: [number?, number?, number?];
  /** Hanging plaque signs swing out (all three, 0.06 s apart). */
  plaqueSwingAt?: number;
  /** siteM's plaque ages: flip to old, cobweb, dust, cane (props ElephantPlaque events). Omit flipOldAt = already old. */
  oldPlaque?: {flipOldAt?: number; cobwebAt?: number; dustAt?: number; caneAt?: number};
  /** Second row plaques blink (every third is old). */
  secondPlaques?: boolean;
  /** S13: the noticeboard (RailBoard props) and the edge audience. */
  board?: {riseAt?: number; railLightAt?: number; pane1?: (r: PaneRect) => React.ReactNode; pane2?: (r: PaneRect) => React.ReactNode; paneDarkAt?: number; pane2ScaleInAt?: number; outAt?: number} | false;
  audience?: boolean | {riseAt?: number};
  bollard?: boolean;
  band?: boolean;
  /** Per-site SiteFacade overrides (chromeAt, offAt, lit...). */
  site?: Partial<Record<SiteId, Partial<SiteFacadeProps>>>;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  seed?: string;
};

export const OldQuarter: React.FC<OldQuarterProps> = ({sun, sitePopAt = [], plaqueSwingAt, oldPlaque = {}, secondPlaques = true, board = false, audience = false, bollard = true, band = true, site = {}, wrap = noWrap, x = 0, y = 0, scale = 1, seed = 'oq'}) => {
  const t = useTime();
  const S = OLD_QUARTER.sites;
  const far = (
    <>
      {band ? <Fill rect={[600, OLD_QUARTER.band[0], 200, OLD_QUARTER.band[1] - OLD_QUARTER.band[0] + 2]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/band`} /> : null}
      <Fill d={G.far} color={palette.sand} offset={false} mode="snap" seed={`${seed}/far`} />
    </>
  );
  const second = (
    <>
      {G.second.map((b, i) => (
        <Fill key={i} rect={[b.x, b.top, b.w, OLD_QUARTER.eye - b.top]} color={b.c} seed={`${seed}/s2${i}`} />
      ))}
      <Fill d={G.secondWin} color={palette.sage} offset={false} seed={`${seed}/s2w`} />
      <Ink d={G.secondInk} width={SI.far} taper={false} seed={`${seed}/s2i`} />
      {secondPlaques ? G.second.map((b, i) => <PlaqueSlot key={`p${i}`} x={b.x + b.w * 0.5} y={OLD_QUARTER.eye - 20} size={10} variant={b.plaque} width={SI.hair} seed={`${seed}/s2p${i}`} />) : null}
    </>
  );
  const ground = (
    <>
      <Fill rect={[-160, OLD_QUARTER.base, 1400, 800]} color={palette.mintPale} offset={false} seed={`${seed}/pave`} />
      <Fill d={G.street} color={palette.cream} offset={false} seed={`${seed}/gap`} />
      <Fill rect={[-160, OLD_QUARTER.kerb, 1400, 22]} color={palette.sand} offset={false} seed={`${seed}/kerbF`} />
      <Ink d={G.kerb} width={SI.front} seed={`${seed}/kerb`} />
      <Ink d={G.joints} width={SI.hair} taper={false} seed={`${seed}/joints`} />
    </>
  );
  const siteNode = (id: SiteId, i: number) => {
    const c = S[id];
    const node = (
      <>
        <SiteFacade x={c.x} y={OLD_QUARTER.base} w={c.w} storeys={c.storeys} storeyH={(OLD_QUARTER.base - c.top) / c.storeys} fill={c.fill} roof="cornice" browser={c.browser} door={c.door} plaque={false} lock="closed" cols={c.w > 300 ? 3 : 2} seed={`${seed}/site${id}`} {...site[id]} />
        <Fill d={G.stoops[i]} color={palette.sand} seed={`${seed}/stoop${id}`} />
      </>
    );
    return (
      <PopUp key={id} at={sitePopAt[i]} x={c.x + c.w / 2} y={OLD_QUARTER.base + 24}>
        {node}
      </PopUp>
    );
  };
  const sites = (
    <>
      {siteNode('M', 1)}
      {siteNode('L', 0)}
      {siteNode('R', 2)}
      <Ink d={G.stoopInk} width={SI.mid} taper={false} seed={`${seed}/stoopI`} />
      {(['L', 'M', 'R'] as SiteId[]).map((id, i) => {
        const sg = S[id].sign;
        const popped = sitePopAt[i] === undefined || t >= (sitePopAt[i] as number);
        if (!popped) return null;
        const swing = plaqueSwingAt !== undefined ? plaqueSwingAt + i * 0.06 : undefined;
        if (id === 'M')
          return <HangingPlaqueSlot key={id} x={sg.x} y={sg.y} size={120} wallX={sg.wallX} variant={oldPlaque.flipOldAt === undefined ? 'old' : 'new'} swingAt={swing} flipOldAt={oldPlaque.flipOldAt} cobwebAt={oldPlaque.cobwebAt} dustAt={oldPlaque.dustAt} caneAt={oldPlaque.caneAt} seed={`${seed}/plq${id}`} />;
        return <HangingPlaqueSlot key={id} x={sg.x} y={sg.y} size={112} wallX={sg.wallX} swingAt={swing} seed={`${seed}/plq${id}`} />;
      })}
    </>
  );
  const sway = osc(t, 0.3, 2.1) * 0.5;
  const near = (
    <>
      <XG m={mat.about(mat.rotate(sway), 1034, 2000)}>
        <Fill d={G.trunk} color={palette.brown} seed={`${seed}/trunk`} />
        <Ink d={G.trunkInk} width={SI.front} taper={false} />
        <Fill d={G.treeCrown} color={palette.sage} seed={`${seed}/crown`} />
        <Ink d={G.treeCrown} width={SI.front} open={0.12} seed={`${seed}/crowni`} />
        <Ink d={G.treeTicks} width={SI.mid} taper={false} />
      </XG>
      {bollard ? <BollardSlot x={OLD_QUARTER.bollard.x} y={OLD_QUARTER.bollard.y} w={OLD_QUARTER.bollard.w} h={OLD_QUARTER.bollard.h} seed={`${seed}/bollard`} /> : null}
    </>
  );
  const B = OLD_QUARTER.board;
  const boardNode = board === false ? null : <NoticeboardSlot x={B.frame[0]} y={B.frame[1]} w={B.frame[2]} h={B.frame[3]} legsY={B.legsY} rail={B.rail} seed={`${seed}/board`} {...board} />;
  const aud =
    audience === false
      ? null
      : OLD_QUARTER.audience.map((a, i) => <OnlookerSlot key={i} x={a.head[0]} y={a.head[1]} head={84} hair={a.hair} body={a.body} acc={a.acc} riseAt={typeof audience === 'object' && audience.riseAt !== undefined ? audience.riseAt + i * 0.06 : undefined} rim={i < 2 ? 'left' : 'right'} seed={`${seed}/aud${i}`} />);
  return (
    <SetPlace x={x} y={y} scale={scale}>
      {wrap('far', 0.05, far)}
      {sun ? wrap('sun', 0.1, sun) : null}
      {wrap('second', 0.3, second)}
      {wrap('ground', 0.6, ground)}
      {wrap('sites', 0.6, sites)}
      {wrap('board', 0.8, boardNode)}
      {wrap('near', 1.0, near)}
      {wrap('audience', 1.0, aud)}
    </SetPlace>
  );
};
