// MakersLane + Workshop — S5 (S06 "a quiet letter"; the Workshop is reused as the S07 corner, the cart shows up in S10
// and S12). Golden hour. Canvas coords at S06 rest.
//
// The lane: vanishing point (430, 1040) at the lane's end where the scene's sun sits (420, 985, r120) with far-roof
// silhouettes across its lower part (fill-only tan); a flat peach horizon band (920-1040); the neighbours' houses on the
// left (sand / tan: their roofline meets the golden sky) receding from x -140 (roof 700, base 1700) to x 330 (roof 900,
// base 1120) with curtains that pop drawn and two "Zzz" windows; the lane is ONE flat sand field with 4 thin, broken tan
// shadow bands (long shadows cast toward us by the low sun) and sparse cobble specks. The Workshop sits on a cream kerb /
// step plane whose left end follows the lane's ray from the VP.
// The WORKSHOP (exported on its own, two layout presets): 3-storey tan brick, browser window upstairs, a round elephant
// sign on a bracket (pendulum swing), a shop window with a peach stepped glow, three makers at a bench and a crate, a
// roller blind (half down, then rolls up), a teal door with a mail slot and an ink lock tick (doorOpenAt).
//
//   <MakersLane sun={<Sun .../>} curtainsAt={26.2} workshop={{glowAt: 27.4, makersAt: 27.4, blindDownAt: 28.9, signSwingAt: 27.9}} />
//   <Workshop layout={WORKSHOP_CORNER} blind="down" signSwingAt={31.2} doorOpenAt={34.6} />     // S07 corner

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, prog, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, polyPath, rect, rectPath, Pt} from '../../../lib/sketch';
import {Quad} from '../../../lib/persp';
import {mat, XG} from '../../../lib/xf';
import {rng} from '../../../lib/rng';
import {brickHints, cornice, glintAt, LayerWrap, noWrap, SetPlace, SI, windowInk} from './common';
import {ChromeSlot, MailSlotSlot, MakerSlot, RoundSignSlot} from './propSlots';
import {perspRowLayout, PerspRow} from './rows';
import {Furniture, FurnitureItem, People, PeopleSpec, WalkerAnchor} from './life';

type R4 = [number, number, number, number];

export type WorkshopLayout = {
  x0: number;
  x1: number;
  roof: number;
  base: number;
  /** Upstairs browser window. */
  browser?: R4;
  door: R4;
  /** Mail slot centre (50 x 10). */
  slot?: Pt;
  sign: {x: number; y: number; r: number; wallX: number};
  /** Shop (or blind) window; the roller-blind box sits above it. */
  shop: R4;
  /** Blind travel (y of the blind's bottom edge when down). */
  blindTo: number;
  /** Bench line and crate (S06 only). */
  bench?: {y: number; x0: number; x1: number};
  crate?: R4;
  makers?: Pt[];
  windows?: R4[];
};

export const WORKSHOP_LANE: WorkshopLayout = {
  x0: 600,
  x1: 1000,
  roof: 720,
  base: 1500,
  browser: [680, 790, 220, 110],
  door: [620, 1150, 100, 300],
  slot: [670, 1300],
  sign: {x: 700, y: 980, r: 45, wallX: 612},
  shop: [740, 1060, 200, 240],
  blindTo: 1180,
  bench: {y: 1260, x0: 748, x1: 932},
  crate: [860, 1230, 70, 60],
  makers: [
    [782, 1262],
    [836, 1262],
    [892, 1262],
  ],
  windows: [
    [620, 800, 44, 70],
    [930, 800, 50, 70],
    [640, 940, 50, 72],
    [930, 940, 50, 72],
  ],
};

export const WORKSHOP_CORNER: WorkshopLayout = {
  x0: 780,
  x1: 1220,
  roof: 700,
  base: 1500,
  browser: [880, 770, 170, 110],
  door: [800, 1150, 120, 310],
  sign: {x: 850, y: 1080, r: 40, wallX: 790},
  shop: [800, 950, 140, 150],
  blindTo: 1100,
  windows: [
    [960, 950, 60, 90],
    [960, 1160, 60, 90],
  ],
};

export type WorkshopProps = {
  layout?: WorkshopLayout;
  /** Shop window glows peach (stepped: peach pane + cream inner rect). Default: lit. false = dark glass. */
  glowAt?: number | false;
  /** Makers rise in at the bench (S06). false = none. */
  makersAt?: number | false;
  /** Blind: 'up' (default) | 'down' (fully down from the start); half-down at blindDownAt, rolls up at blindUpAt. */
  blind?: 'up' | 'down';
  blindDownAt?: number;
  blindUpAt?: number;
  signSwingAt?: number;
  doorOpenAt?: number;
  /** Mail slot flap clicks. */
  slotClickAt?: number | number[];
  chromeAt?: number;
  screenOnAt?: number;
  seed?: string;
};

export const Workshop: React.FC<WorkshopProps> = ({layout = WORKSHOP_LANE, glowAt, makersAt, blind = 'up', blindDownAt, blindUpAt, signSwingAt, doorOpenAt, slotClickAt, chromeAt, screenOnAt, seed = 'ws'}) => {
  const t = useTime();
  const L = layout;
  const H = L.base - L.roof;
  const glow = glowAt === undefined || (glowAt !== false && t >= glowAt);
  const [sx, sy, sw, sh] = L.shop;
  // blind: fraction of the window covered
  const half = (L.blindTo - sy) / sh;
  let bk = blind === 'down' ? 1 : 0;
  if (blindDownAt !== undefined && t >= blindDownAt) bk = Math.max(bk, half * E.outCubic(prog(t, blindDownAt, 0.3)));
  if (blindUpAt !== undefined && t >= blindUpAt) bk = bk * (1 - E.inOutCubic(prog(t, blindUpAt, 0.35)));
  const open = doorOpenAt !== undefined ? E.inOutCubic(prog(t, doorOpenAt, 0.5)) : 0;
  const [dx, dy, dw, dh] = L.door;
  let ribs = '';
  for (let yy = sy + 12; yy < sy + sh * bk - 4; yy += 12) ribs += `M${sx + 2} ${yy.toFixed(1)}L${sx + sw - 2} ${yy.toFixed(1)}`;
  return (
    <>
      {/* brick body */}
      <Fill rect={[L.x0, L.roof, L.x1 - L.x0, H]} color={palette.tan} seed={`${seed}/body`} />
      <Fill rect={[L.x0, L.roof, (L.x1 - L.x0) * 0.2, H]} color={palette.tan} offset={false} seed={`${seed}/shade`} />
      <Fill rect={[L.x0 - 8, L.roof - 14, L.x1 - L.x0 + 16, 14]} color={palette.sand} offset={false} seed={`${seed}/corn`} />
      {(L.windows ?? []).map((q, i) => (
        <Fill key={i} rect={q} color={i % 2 ? palette.sage : palette.tealDark} seed={`${seed}/w${i}`} />
      ))}
      {/* shop window: stepped glow (peach pane + cream inner) or dark glass */}
      <Fill rect={L.shop} color={glow ? palette.peach : palette.tealDark} seed={`${seed}/shop`} />
      {glow ? <Fill rect={[sx + sw * 0.18, sy + sh * 0.16, sw * 0.64, sh * 0.6]} color={palette.cream} offset={false} mode="snap" seed={`${seed}/shopIn`} /> : null}
      {L.makers && makersAt !== false ? L.makers.map((m, i) => <MakerSlot key={i} x={m[0]} y={m[1]} h={92} bust work={0.9 + i * 0.2} riseAt={makersAt === undefined ? undefined : makersAt + i * 0.08} seed={`${seed}/mk${i}`} />) : null}
      {L.bench ? (
        <>
          <Fill rect={[L.bench.x0, L.bench.y, L.bench.x1 - L.bench.x0, 14]} color={palette.brown} seed={`${seed}/bench`} />
          <Ink d={line(L.bench.x0 - 4, L.bench.y, L.bench.x1 + 4, L.bench.y, {seed: `${seed}/bi`, over: [2, 2]})} width={SI.far} taper={false} />
        </>
      ) : null}
      {L.crate ? (
        <>
          <Fill rect={L.crate} color={palette.sand} seed={`${seed}/crate`} />
          <Ink d={rect(L.crate[0], L.crate[1], L.crate[2], L.crate[3], {seed: `${seed}/ci`, over: 'small'}) + line(L.crate[0], L.crate[1] + L.crate[3] * 0.5, L.crate[0] + L.crate[2], L.crate[1] + L.crate[3] * 0.5, {seed: `${seed}/cs`, over: 0})} width={SI.far} taper={false} />
        </>
      ) : null}
      {/* roller blind */}
      {bk > 0.01 ? (
        <>
          <Fill rect={[sx, sy, sw, sh * bk]} color={palette.sand} offset={false} mode="snap" seed={`${seed}/blind`} />
          <Ink d={ribs + line(sx - 2, sy + sh * bk, sx + sw + 2, sy + sh * bk, {seed: `${seed}/bb`, over: 0})} width={SI.hair} taper={false} />
        </>
      ) : null}
      <Fill rect={[sx - 6, sy - 30, sw + 12, 30]} color={palette.tealDark} offset={[1.5, 1]} seed={`${seed}/box`} />
      <Ink d={rect(sx - 6, sy - 30, sw + 12, 30, {seed: `${seed}/boxi`, over: 'small'}) + rect(sx, sy, sw, sh, {seed: `${seed}/shopi`, over: 'small'}) + line(sx - 10, sy + sh + 5, sx + sw + 10, sy + sh + 5, {seed: `${seed}/sill`, over: 'small'})} width={SI.mid} taper={false} />
      {/* door with mail slot + lock tick; opens (dark interior, the leaf swings) */}
      <Fill rect={[dx - 12, dy - 12, dw + 24, dh + 12]} color={palette.sand} offset={false} seed={`${seed}/dframe`} />
      {open > 0 ? <Fill rect={L.door} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/dark`} /> : null}
      <XG m={open > 0 ? mat.about(mat.scale(1 - open * 0.8, 1), dx, dy) : mat.I}>
        <Fill rect={L.door} color={palette.teal} seed={`${seed}/door`} />
        <Fill rect={[dx + dw * 0.15, dy + dh * 0.08, dw * 0.7, dh * 0.38]} color={palette.sage} offset={false} seed={`${seed}/dglass`} />
        <Fill rect={[dx + dw * 0.15, dy + dh * 0.7, dw * 0.7, dh * 0.22]} color={palette.tealDark} offset={false} seed={`${seed}/dkick`} />
        <Ink d={rect(dx, dy, dw, dh, {seed: `${seed}/di`, edges: 'tlr', over: 'small'}) + rect(dx + dw * 0.15, dy + dh * 0.08, dw * 0.7, dh * 0.38, {seed: `${seed}/dgi`, over: 'small'}) + glintAt(dx + dw * 0.3, dy + dh * 0.32, dh * 0.1, `${seed}/dgl`) + line(dx + dw * 0.82, dy + dh * 0.55, dx + dw * 0.82, dy + dh * 0.62, {seed: `${seed}/tick`, over: 0})} width={SI.mid} taper={false} />
        {L.slot && open < 0.1 ? <MailSlotSlot x={L.slot[0]} y={L.slot[1]} clickAt={slotClickAt} seed={`${seed}/slot`} /> : null}
      </XG>
      {/* structure ink */}
      <Ink d={cornice(L.x0, L.x1, L.roof - 14, 14, `${seed}/c`, 16) + line(L.x0, L.roof, L.x0, L.base, {seed: `${seed}/l`, over: [0, 6]}) + (L.x1 < 1100 ? line(L.x1, L.roof, L.x1, L.base, {seed: `${seed}/r`, over: [0, 6]}) : '')} width={SI.mid} seed={`${seed}/st`} />
      <Ink d={(L.windows ?? []).map((q, i) => windowInk(q[0], q[1], q[2], q[3], `${seed}/wi${i}`)).join('') + brickHints(L.x0 + 20, L.roof + 20, L.x1 - L.x0 - 40, H - 60, `${seed}/bk`, 7, 24)} width={SI.far} taper={false} />
      {L.browser ? <ChromeSlot x={L.browser[0]} y={L.browser[1]} w={L.browser[2]} h={L.browser[3]} chromeAt={chromeAt} screenOnAt={screenOnAt} width={SI.mid} seed={`${seed}/bw`} /> : null}
      <RoundSignSlot x={L.sign.x} y={L.sign.y} r={L.sign.r} wallX={L.sign.wallX} swingAt={signSwingAt} seed={`${seed}/sign`} />
    </>
  );
};

// ---------------------------------------------------------------- the lane

export const MAKERS_LANE = {
  vp: [430, 1040] as Pt,
  sun: {x: 420, y: 985, r: 120},
  band: [920, 1040] as [number, number],
  /** "Zzz" windows on the neighbours' houses. */
  zzz: [
    [120, 960],
    [230, 1010],
  ] as Pt[],
  /** The messenger's walk line (feet y) and Pip's. */
  messengerY: 1520,
  pipY: 1480,
  /** Leak sheet entry point (off-frame left). */
  leakEntry: [0, 1350] as Pt,
  /** People layer (life.tsx): two passers walking up the lane to the sun, one stander in the left row's shade
   *  (heights (feet - 1040) / 1.1); clear of the Workshop door and the messenger's line (feet y 1520). */
  walkers: [
    {x: 512, y: 1250, h: 190, go: 'vp', body: palette.teal, hair: 'short', acc: ['backpack']},
    {x: 360, y: 1340, h: 272, go: 'vp', body: palette.sage, hair: 'bun'},
    {x: 150, y: 1418, h: 340, go: 'stand', body: palette.sand, hair: 'curly', acc: ['scarf']},
  ] as WalkerAnchor[],
  /** The makers' cart parked on the lane (props MakersCart) and a bike by the left row. */
  furniture: [
    {kind: 'cart', x: 300, y: 1600, s: 1.25},
    {kind: 'bike', x: 268, y: 1250, s: 0.62, flip: true},
  ] as FurnitureItem[],
} as const;

const LEFT_Q: Quad = [
  [-140, 700],
  [330, 900],
  [330, 1120],
  [-140, 1700],
];
// golden: the row's roofline meets the cream sky, so its facades sit a step off it (sand / tan, never cream)
const LEFT = perspRowLayout({quad: LEFT_Q, n: 6, H: 700, hw: 700 * 0.5, storeys: 3, side: 'left', seed: 'laneL', colors: [palette.sand, palette.tan, palette.sand, palette.sand, palette.tan, palette.sand], litFraction: 0.8});
/** Ref-1 dusk wall: sand / clay walls carrying tealDark / teal (~25-30 %): teal doors, glass, awnings and shutters. */
const ROW_TEAL = {glass: palette.teal, awning: palette.tealDark, shutters: palette.teal} as const;

const G = (() => {
  const s = 'lane';
  const VP = MAKERS_LANE.vp;
  const rayAt = (xb: number, y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (1920 - VP[1]);
  // review 5 (ref-1 dusk-wall recipe): the lane's light reads as LIGHT, not road markings. (1) ONE flat teal shade wedge
  // over the left third: the left row's own shadow, between its base line and a ray from the sun / VP; (2) two WIDE tan
  // shadow wedges of off-frame posts, unbroken, on rays from the sun (narrow far, wide near: one direction).
  const baseX = (y: number) => 330 - ((330 + 140) * (y - 1120)) / (1700 - 1120);
  const shade = polyPath([[330, 1121], [rayAt(150, 1121), 1121], [rayAt(150, 2060), 2060], [-200, 2060], [-200, 1760], [baseX(1700), 1700]]);
  let bandsTan = '';
  const bands: [number, number, number, number][] = [
    // [x at the frame bottom, half width there, start y, end y]
    [470, 78, 1300, 2060],
    [1080, 120, 1700, 2060],
  ];
  for (const [xb, hw, y0, y1] of bands) bandsTan += polyPath([[rayAt(xb - hw * 0.35, y0), y0], [rayAt(xb + hw * 0.35, y0), y0], [rayAt(xb + hw, y1), y1], [rayAt(xb - hw, y1), y1]]);
  // a cream kerb strip along the left row's foot (the doorsteps' edge), thinning with distance
  const kerbL = polyPath([[330, 1121], [baseX(1700) + 0.5, 1700], [baseX(1700) + 0.5, 1722], [330, 1125]]);
  const kerbLInk = line(330, 1125, baseX(1720), 1722, {seed: `${s}/kl`, over: [0, 0], breaks: false});
  // the Workshop's kerb / step plane + a cream pavement brought FORWARD in front of it (the right of the lane is
  // pavement down to y 1660, so the dead sand field is shorter); left ends on the lane's ray through (600, 1500)
  const W = WORKSHOP_LANE;
  const kx = (y: number) => VP[0] + ((W.x0 - VP[0]) * (y - VP[1])) / (W.base - VP[1]);
  const kerbTop = polyPath([[W.x0 - 2, W.base], [1240, W.base], [1240, W.base + 40], [kx(W.base + 40), W.base + 40]]);
  const kerbFace = polyPath([[kx(W.base + 40), W.base + 40], [1240, W.base + 40], [1240, W.base + 58], [kx(W.base + 40), W.base + 58]]);
  const pave = polyPath([[kx(W.base + 58), W.base + 58], [1240, W.base + 58], [1240, 1646], [kx(1646), 1646]]);
  const paveFace = polyPath([[kx(1646), 1646], [1240, 1646], [1240, 1660], [kx(1646), 1660]]);
  const paveFace2 = polyPath([[kx(1660), 1660], [1240, 1660], [1240, 1676], [kx(1660), 1676]]);
  const kerbInk =
    line(kx(W.base + 40), W.base + 40, 900, W.base + 40, {seed: `${s}/k1`, over: [2, 0], breaks: false}) + line(924, W.base + 40, 1240, W.base + 41, {seed: `${s}/k2`, over: 0, breaks: false}) + line(kx(W.base + 40), W.base + 58, 1240, W.base + 60, {seed: `${s}/k3`, over: [3, 0]}) + line(W.x0, W.base, kx(W.base + 40), W.base + 40, {seed: `${s}/k4`, over: [0, 0], breaks: false}) + line(kx(W.base + 40), W.base + 40, kx(W.base + 40), W.base + 58, {seed: `${s}/k5`, over: [0, 2], breaks: false}) +
    line(kx(W.base + 58), W.base + 58, kx(1660), 1660, {seed: `${s}/k6`, over: [0, 0], breaks: false}) + line(kx(1646), 1646, 1240, 1648, {seed: `${s}/k7`, over: [2, 0]}) + line(kx(1660), 1676, 1240, 1679, {seed: `${s}/k8`, over: [2, 0]});
  // cobble dashes (short, sparse), denser near
  const r = rng(`${s}/cob`);
  let cobbles = '';
  for (let i = 0; i < 26; i++) {
    const v = Math.pow(r.next(), 0.6);
    const y = VP[1] + 70 + v * 900;
    const half = (y - VP[1]) * 1.25;
    const x = VP[0] + r.range(-half, half);
    const L = 3 + v * 8;
    cobbles += `M${x.toFixed(1)} ${y.toFixed(1)}l${L.toFixed(1)} ${(r.range(-0.6, 0.6)).toFixed(1)}`;
  }
  // far rooftop silhouettes across the sun's lower part
  const roofs = polyPath([[250, 1080], [250, 1030], [292, 1030], [292, 1004], [338, 1004], [338, 1022], [380, 1022], [396, 998], [412, 1022], [470, 1022], [470, 1008], [520, 1008], [520, 1030], [575, 1030], [575, 1014], [620, 1014], [620, 1080]]);
  return {shade, bandsTan, kerbL, kerbLInk, cobbles, roofs, kerbTop, kerbFace, pave, paveFace, paveFace2, kerbInk};
})();

export type MakersLaneProps = {
  sun?: React.ReactNode;
  /** Neighbours' curtains pop drawn (sand) at this time (omit = drawn). */
  curtainsAt?: number;
  workshop?: WorkshopProps;
  /** The peach horizon band (golden). Default true. */
  band?: boolean;
  /** Back-view passers on MAKERS_LANE.walkers (life.tsx). Default on; false = nobody. */
  people?: PeopleSpec;
  /** Street furniture (default MAKERS_LANE.furniture: the parked cart + a bike); false = none. */
  furniture?: FurnitureItem[] | false;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

export const MakersLane: React.FC<MakersLaneProps> = ({sun, curtainsAt, workshop, band = true, people, furniture = MAKERS_LANE.furniture, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'lane'}) => {
  const t = useTime();
  const VP = MAKERS_LANE.vp;
  const curtains = curtainsAt === undefined || t >= curtainsAt;
  const far = (
    <>
      {band ? <Fill rect={[-160, MAKERS_LANE.band[0], 1400, MAKERS_LANE.band[1] - MAKERS_LANE.band[0] + 4]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/band`} /> : null}
    </>
  );
  const farRoofs = <Fill d={G.roofs} color={palette.tan} offset={false} mode="snap" seed={`${seed}/roofs`} />;
  const floor = (
    <>
      <Fill rect={[-160, VP[1], 1400, 1100]} color={palette.sand} offset={false} seed={`${seed}/floor`} />
      <Fill d={G.bandsTan} color={palette.tan} offset={false} mode="snap" seed={`${seed}/bands`} />
      <Fill d={G.shade} color={palette.teal} offset={false} mode="snap" seed={`${seed}/shade`} />
      <Fill d={G.kerbL} color={palette.cream} offset={false} mode="snap" seed={`${seed}/kerbL`} />
      <Ink d={G.kerbLInk} width={SI.mid} taper={false} seed={`${seed}/kerbLi`} />
      <Ink d={G.cobbles} width={SI.far} taper={false} seed={`${seed}/cob`} />
    </>
  );
  // curtains drawn = warm lit panes (peach) at golden hour
  const houses = <PerspRow layout={LEFT} lit={curtains} litColor={palette.peach} stagger={0} {...ROW_TEAL} seed={`${seed}/L`} />;
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {wrap('far', 0.05, far)}
      {sun ? wrap('sun', 0.1, sun) : null}
      {wrap('roofs', 0.1, farRoofs)}
      {wrap('floor', 0.8, floor)}
      {wrap('houses', 0.4, houses)}
      {wrap(
        'workshop',
        0.6,
        <>
          <Workshop layout={WORKSHOP_LANE} seed={`${seed}/ws`} {...workshop} />
          {/* the kerb / step plane the workshop sits on, in the lane's perspective */}
          <Fill d={G.kerbTop} color={palette.cream} offset={false} seed={`${seed}/kerbT`} />
          <Fill d={G.kerbFace} color={palette.tan} offset={false} seed={`${seed}/kerbF`} />
          {/* the pavement brought forward: sand, with a cream kerb strip (peach at golden) and a tan face */}
          <Fill d={G.pave} color={palette.sand} offset={false} seed={`${seed}/pave`} />
          <Fill d={G.paveFace} color={palette.cream} offset={false} seed={`${seed}/paveK`} />
          <Fill d={G.paveFace2} color={palette.tan} offset={false} seed={`${seed}/paveF`} />
          <Ink d={G.kerbInk} width={SI.mid} seed={`${seed}/kerbI`} />
        </>,
      )}
      {wrap(
        'people',
        0.85,
        <>
          <Furniture items={furniture} seed={`${seed}/furn`} />
          <People anchors={MAKERS_LANE.walkers} vp={MAKERS_LANE.vp} spec={people} seed={`${seed}/ppl`} />
        </>,
      )}
    </SetPlace>
  );
};

