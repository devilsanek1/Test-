// BlueprintStreet — S3 (S02 "built from one blueprint"; complex, used once). Canvas coords at the S02 wide rest.
//
// The street floor is a giant cream BLUEPRINT sheet: an inkHair grid converging to VP (560, 950), dimension arrows
// along the kerbs, a title block bottom-left, the giant elephant stamp slot (330, 1400). At the end of the vista the
// generic PRESS HOUSE (a WordPress stand-in, no text, no logo): frontal 360..760, apex (560, 770), eaves 870, base
// 1180; chunky browser window (470,900,180,110), teal door (500,1010,120,170) with THE lock (595,1100) 40x50 and the
// plaque (455,1085); a cream pen-nib sign disc r34 at (795,930) on a swinging bracket; a roof vent that puffs 3 sheets.
// Nine pop-up side buildings in 1-point perspective (L1-L5 left, R1-R4 right, explicit screen boundaries), plaque +
// lock on each: 7 PHP plates (P, L1, R1, L2, R2, L4, R3) and 3 blank cream plates (L3, L5, R4).
//
//   <BlueprintStreet popAt={{L1: 7.9, R1: 7.96, ...}} plaqueAt={{P: 9.08, L1: 9.16, ...}} blankAt={{L3: 9.72, ...}}
//     gridAt={7.07} stampAt={8.1} ventAt={8.6} signSwingAt={8.7} lock={{screwsOutAt: 5.2, coverOpenAt: 5.4}} sun={...} />
//   BLUEPRINT.closeup = {cam: [580, 960], zoom: 2.0}   // S02's close-up framing of the same world (lock at screen 570,1240)

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, prog, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {arrow, blob, circle, line, polyPath, rect, rectPath, Pt} from '../../../lib/sketch';
import {Quad} from '../../../lib/persp';
import {mat, XG} from '../../../lib/xf';
import {rng} from '../../../lib/rng';
import {brickHints, LayerWrap, noWrap, PopUp, SetPlace, SI, windowInk} from './common';
import {ChromeSlot, ElephantStampSlot, LockProps, PlaqueSlot} from './propSlots';
import {Lock} from '../props';
import {FacadeDoor} from './SiteFacade';
import {PerspRow, quadRowLayout} from './rows';

export type SideId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'R1' | 'R2' | 'R3' | 'R4';
export type BlueprintId = 'P' | SideId;

const LX = [-140, 0, 95, 175, 240, 300, 360];
const RX = [1220, 1080, 985, 905, 840, 760];
const lTop = (x: number) => 560 + ((800 - 560) * x) / 360;
const lBase = (x: number) => 1560 - ((1560 - 1180) * x) / 360;
const rTop = (x: number) => 560 + ((800 - 560) * (1080 - x)) / 320;
const rBase = (x: number) => 1560 - ((1560 - 1180) * (1080 - x)) / 320;

export const BLUEPRINT = {
  vp: [560, 950] as Pt,
  press: {x0: 360, x1: 760, apex: [560, 770] as Pt, eaves: 870, base: 1180},
  window: [470, 900, 180, 110] as [number, number, number, number],
  door: [500, 1010, 120, 170] as [number, number, number, number],
  lock: {x: 595, y: 1100, w: 40, h: 50},
  plaque: {x: 455, y: 1085, size: 50},
  sign: {x: 795, y: 930, r: 34, wallX: 760},
  vent: {x: 652, y: 816},
  stamp: {x: 330, y: 1400, rx: 160, ry: 60},
  /** S02's close-up framing (camera centre, zoom): apex at screen y 580, the lock at screen (570, 1240) 80 x 100. */
  closeup: {cam: [580, 960] as Pt, zoom: 2.0},
  /** PHP plaques vs blank plates. */
  php: ['P', 'L1', 'R1', 'L2', 'R2', 'L4', 'R3'] as BlueprintId[],
  blank: ['L3', 'L5', 'R4'] as BlueprintId[],
  /** Pip's landing spot on the stamp (wide). */
  pip: [350, 1420] as Pt,
} as const;

const leftQuads: Quad[] = LX.slice(0, -1).map((x0, i) => {
  const x1 = LX[i + 1];
  return [
    [x0, lTop(x0)],
    [x1, lTop(x1)],
    [x1, lBase(x1)],
    [x0, lBase(x0)],
  ] as Quad;
});
const rightQuads: Quad[] = RX.slice(0, -1).map((x0, i) => {
  const x1 = RX[i + 1];
  // TL, TR, BR, BL as seen: x1 < x0
  return [
    [x1, rTop(x1)],
    [x0, rTop(x0)],
    [x0, rBase(x0)],
    [x1, rBase(x1)],
  ] as Quad;
});
// index 0 = the bleed sliver (beyond the frame edge), 1.. = L1..L5 / R1..R4
const LEFT_IDS: (SideId | null)[] = [null, 'L1', 'L2', 'L3', 'L4', 'L5'];
const RIGHT_IDS: (SideId | null)[] = [null, 'R1', 'R2', 'R3', 'R4'];
const plaqueOf = (id: SideId | null) => (id === null ? 'new' : BLUEPRINT.blank.includes(id) ? 'blank' : 'new');

const LEFT = quadRowLayout({quads: leftQuads, side: 'left', storeys: 4, colors: [palette.sand, palette.cream, palette.tan, palette.mintPale, palette.sand, palette.cream], plaque: (i) => plaqueOf(LEFT_IDS[i]), seed: 'bpL', plaqueK: 0.16});
const RIGHT = quadRowLayout({quads: rightQuads, side: 'right', storeys: 4, colors: [palette.cream, palette.tan, palette.sand, palette.mintPale, palette.cream], plaque: (i) => plaqueOf(RIGHT_IDS[i]), seed: 'bpR', plaqueK: 0.16});

/** Screen anchors of every building's door / plaque / lock (ids P, L1..L5, R1..R4). */
export function blueprintAnchors(): Record<BlueprintId, {plaque: {x: number; y: number; size: number}; lock: {x: number; y: number; h: number}; overDoor: Pt; base: Pt}> {
  const out = {} as Record<BlueprintId, {plaque: {x: number; y: number; size: number}; lock: {x: number; y: number; h: number}; overDoor: Pt; base: Pt}>;
  LEFT.houses.forEach((h, i) => {
    const id = LEFT_IDS[i];
    if (id) out[id] = {plaque: h.plaque, lock: h.lock, overDoor: h.overDoor, base: h.base};
  });
  RIGHT.houses.forEach((h, i) => {
    const id = RIGHT_IDS[i];
    if (id) out[id] = {plaque: h.plaque, lock: h.lock, overDoor: h.overDoor, base: h.base};
  });
  out.P = {plaque: BLUEPRINT.plaque, lock: {x: BLUEPRINT.lock.x, y: BLUEPRINT.lock.y, h: BLUEPRINT.lock.h}, overDoor: [560, 990], base: [560, 1180]};
  return out;
}

// ---------------------------------------------------------------- geometry

const G = (() => {
  const s = 'bps';
  const VP = BLUEPRINT.vp;
  const P = BLUEPRINT.press;
  // blueprint grid: rays to the VP + cross lines at perspective depths, ordered NEAR -> FAR (it draws on that way)
  let cross = '';
  for (let k = 9; k >= 1; k--) {
    const y = VP[1] + (2060 - VP[1]) * Math.pow(k / 10, 1.6);
    if (y < 1186) continue;
    cross += line(-160, y, 1240, y, {seed: `${s}/x${k}`, over: 0, breaks: false, drift: 0.1});
  }
  let rays = '';
  for (let i = 0; i <= 22; i++) {
    const xb = -1500 + i * 190;
    const yt = 1186;
    const xt = VP[0] + ((xb - VP[0]) * (yt - VP[1])) / (2060 - VP[1]);
    rays += line(xb, 2060, xt, yt, {seed: `${s}/r${i}`, over: 0, breaks: false, drift: 0.1});
  }
  // dimension arrows along the kerbs (both directions, ticks at the ends)
  const dimL = arrow(380, 1196, 120, 1440, {seed: `${s}/dl1`, head: 14}) + arrow(120, 1440, 380, 1196, {seed: `${s}/dl2`, head: 14}) + line(372, 1186, 392, 1206, {seed: `${s}/dt1`, over: 0}) + line(108, 1430, 132, 1452, {seed: `${s}/dt2`, over: 0});
  const dimR = arrow(742, 1196, 1000, 1440, {seed: `${s}/dr1`, head: 14}) + arrow(1000, 1440, 742, 1196, {seed: `${s}/dr2`, head: 14});
  // title block bottom-left
  const tb = rect(40, 1690, 300, 170, {seed: `${s}/tb`, over: 'small'}) + line(40, 1740, 340, 1740, {seed: `${s}/tb1`, over: 'small'}) + line(190, 1740, 190, 1860, {seed: `${s}/tb2`, over: 'small'}) + line(60, 1716, 200, 1716, {seed: `${s}/tb3`, over: 0}) + line(60, 1770, 170, 1770, {seed: `${s}/tb4`, over: 0}) + line(60, 1800, 150, 1800, {seed: `${s}/tb5`, over: 0}) + line(210, 1770, 320, 1770, {seed: `${s}/tb6`, over: 0});
  // press house
  const gable = polyPath([[P.x0, P.eaves], P.apex, [P.x1, P.eaves]]);
  const roofBand = polyPath([[P.x0 - 16, P.eaves + 6], P.apex, [P.x1 + 16, P.eaves + 6], [P.x1 + 16, P.eaves + 16], [P.apex[0], P.apex[1] + 12], [P.x0 - 16, P.eaves + 16]]);
  const pressInk =
    line(P.x0 - 24, P.eaves + 12, P.apex[0], P.apex[1], {seed: `${s}/g1`, over: [6, 2]}) +
    line(P.apex[0], P.apex[1], P.x1 + 24, P.eaves + 12, {seed: `${s}/g2`, over: [2, 6]}) +
    line(P.x0 - 12, P.eaves + 18, P.x1 + 12, P.eaves + 18, {seed: `${s}/e`, over: [6, 6]}) +
    line(P.x0, P.eaves + 18, P.x0, P.base, {seed: `${s}/l`, over: [0, 6]}) +
    line(P.x1, P.eaves + 18, P.x1, P.base, {seed: `${s}/r`, over: [0, 6]}) +
    line(P.x0 - 20, P.base, P.x1 + 20, P.base, {seed: `${s}/b`, over: [6, 6]});
  const sideWins = windowInk(392, 920, 50, 72, `${s}/sw1`) + windowInk(678, 920, 50, 72, `${s}/sw2`) + windowInk(392, 1040, 50, 72, `${s}/sw3`) + windowInk(678, 1040, 50, 72, `${s}/sw4`) + windowInk(538, 822, 44, 36, `${s}/sw5`, {mullion: false});
  const sideGlass = rectPath(393, 921, 48, 40) + rectPath(679, 950, 48, 41) + rectPath(393, 1072, 48, 39) + rectPath(679, 1041, 48, 40);
  // roof vent on the right slope
  const V = BLUEPRINT.vent;
  const vent = rectPath(V.x - 12, V.y - 22, 24, 26) + rectPath(V.x - 17, V.y - 28, 34, 7);
  const ventInk = rect(V.x - 12, V.y - 22, 24, 26, {seed: `${s}/v`, over: 'small', edges: 'tlr'}) + rect(V.x - 17, V.y - 28, 34, 7, {seed: `${s}/vc`, over: 'small'});
  // far city peeks
  const peeks = rectPath(296, 776, 30, 60) + rectPath(326, 792, 26, 40) + rectPath(764, 780, 26, 50) + rectPath(790, 770, 34, 64);
  return {cross, rays, dimL, dimR, tb, gable, roofBand, pressInk, sideWins, sideGlass, vent, ventInk, peeks};
})();

// ---------------------------------------------------------------- pieces

/** The pen-nib sign: cream disc r34 with an ink nib, on an iron bracket from the press-house wall; pendulum swing. */
const NibSign: React.FC<{swingAt?: number; seed: string}> = ({swingAt, seed}) => {
  const t = useTime();
  const S = BLUEPRINT.sign;
  const hookX = S.x;
  const top = S.y - S.r - 22;
  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;
  const nib = `M${S.x} ${S.y - 20}L${S.x + 13} ${S.y + 4}L${S.x} ${S.y + 22}L${S.x - 13} ${S.y + 4}Z`;
  return (
    <>
      <Ink d={line(S.wallX, top, hookX + 14, top, {seed: `${seed}/arm`, over: [0, 4]}) + line(S.wallX, top + 26, S.wallX + 26, top, {seed: `${seed}/brace`, over: 0})} width={SI.mid} taper={false} />
      <XG m={mat.about(mat.rotate(a), hookX, top)}>
        <Ink d={`M${hookX - 12} ${top}L${hookX - 14} ${S.y - S.r}M${hookX + 12} ${top}L${hookX + 14} ${S.y - S.r}`} width={SI.hair} taper={false} />
        <Fill d={blob(S.x, S.y, S.r, S.r, {seed: `${seed}/d`})} color={palette.cream} seed={`${seed}/df`} />
        <Ink d={circle(S.x, S.y, S.r, {seed: `${seed}/di`})} width={SI.mid} taper={false} />
        <Fill d={nib} color={palette.ink} offset={false} seed={`${seed}/nib`} />
        <Ink d={`M${S.x} ${S.y - 6}L${S.x} ${S.y + 20}`} width={2} color={palette.cream} taper={false} />
        <circle cx={S.x} cy={S.y - 4} r={3} fill={palette.cream} />
      </XG>
    </>
  );
};

/** Three paper sheets puffed out of the roof vent (0.12 s stagger, up and away with a tumble). */
const VentPuff: React.FC<{at?: number; seed: string}> = ({at, seed}) => {
  const t = useTime();
  if (at === undefined || t < at) return null;
  const V = BLUEPRINT.vent;
  const r = rng(`${seed}/puff`);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const t0 = at + i * 0.12;
    if (t < t0) continue;
    const p = prog(t, t0, 1.1, E.outCubic);
    if (p >= 1) continue;
    const dx = (i - 1) * 40 + r.range(-10, 10);
    const x = V.x + dx * p + Math.sin(p * 6 + i) * 8;
    const y = V.y - 30 - 260 * p;
    const rot = (i - 1) * 40 * p + Math.sin(p * 9 + i) * 20;
    out.push(
      <XG key={i} m={mat.about(mat.rotate(rot), x, y)}>
        <Fill rect={[x - 8, y - 10, 16, 20]} color={palette.white} offset={false} mode="snap" seed={`${seed}/pf${i}`} />
        <Ink d={rect(x - 8, y - 10, 16, 20, {seed: `${seed}/pi${i}`, over: 'small'}) + `M${x - 5} ${y - 4}L${x + 4} ${y - 4}M${x - 5} ${y + 1}L${x + 5} ${y + 1}`} width={SI.hair} taper={false} />
      </XG>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the set

export type BlueprintStreetProps = {
  /** Side buildings pop up (pop-up book); omit an id = standing. */
  popAt?: Partial<Record<SideId, number>>;
  /** The press house pops / draws (omit = standing). */
  pressAt?: number;
  /** PHP plaques tick on (count pops) and blank plates pop, per id. Omit = there. */
  plaqueAt?: Partial<Record<BlueprintId, number>>;
  /** The blueprint grid draws on near -> far from here (omit = drawn). */
  gridAt?: number;
  /** The elephant stamp slams (ring 0.13 s, then 2.6x -> 1.0x). Omit = printed; false = none. */
  stampAt?: number | false;
  ventAt?: number;
  signSwingAt?: number;
  /** Browser screens blink (2 frames white) at these times (every building). */
  blinkAt?: number;
  /** The press-house lock: props-lane Lock props (screwsOutAt, coverOpenAt, boltTestAt, gapMarkAt, rider ...). */
  lock?: Partial<LockProps>;
  sun?: React.ReactNode;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  seed?: string;
};

export const BlueprintStreet: React.FC<BlueprintStreetProps> = ({popAt = {}, pressAt, plaqueAt = {}, gridAt, stampAt, ventAt, signSwingAt, blinkAt, lock = {}, sun, wrap = noWrap, x = 0, y = 0, scale = 1, seed = 'bp'}) => {
  const t = useTime();
  const P = BLUEPRINT.press;
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const blink = blinkAt !== undefined && t >= blinkAt && t < blinkAt + 0.067;
  const lPop = (i: number) => (LEFT_IDS[i] ? popAt[LEFT_IDS[i] as SideId] : undefined);
  const rPop = (i: number) => (RIGHT_IDS[i] ? popAt[RIGHT_IDS[i] as SideId] : undefined);
  const lPlq = (i: number) => (LEFT_IDS[i] ? plaqueAt[LEFT_IDS[i] as SideId] : undefined);
  const rPlq = (i: number) => (RIGHT_IDS[i] ? plaqueAt[RIGHT_IDS[i] as SideId] : undefined);
  const gridP = gridAt === undefined ? 1 : prog(t, gridAt, 0.6);

  const far = <Fill d={G.peeks} color={palette.sage} offset={false} mode="snap" seed={`${seed}/peeks`} />;

  const ground = (
    <>
      <Fill rect={[-160, 1180, 1400, 900]} color={palette.cream} offset={false} mode="snap" seed={`${seed}/sheet`} />
      {gridP > 0 ? <Ink d={G.cross} width={SI.hair} at={gridAt} dur={0.45} taper={false} seed={`${seed}/cross`} /> : null}
      {gridP > 0 ? <Ink d={G.rays} width={SI.hair} at={gridAt !== undefined ? gridAt + 0.05 : undefined} order="all" taper={false} seed={`${seed}/rays`} /> : null}
      <Ink d={G.dimL + G.dimR} width={SI.far} at={gridAt !== undefined ? gridAt + 0.3 : undefined} taper={false} seed={`${seed}/dim`} />
      <Ink d={G.tb} width={SI.far} at={gridAt !== undefined ? gridAt + 0.35 : undefined} taper={false} seed={`${seed}/tb`} />
      {stampAt !== false ? <ElephantStampSlot x={BLUEPRINT.stamp.x} y={BLUEPRINT.stamp.y} rx={BLUEPRINT.stamp.rx} ry={BLUEPRINT.stamp.ry} ring={14} at={stampAt} seed={`${seed}/stamp`} /> : null}
    </>
  );

  const press = (
    <PopUp at={pressAt} x={560} y={P.base}>
      <Fill d={G.gable} color={palette.sand} seed={`${seed}/gable`} />
      <Fill rect={[P.x0, P.eaves, P.x1 - P.x0, P.base - P.eaves]} color={palette.sand} seed={`${seed}/pf`} />
      <Fill rect={[P.x0, P.eaves, (P.x1 - P.x0) * 0.24, P.base - P.eaves]} color={palette.tan} offset={false} seed={`${seed}/ps`} />
      <Fill rect={[P.x1 - 8, P.eaves + 16, 8, P.base - P.eaves - 16]} color={palette.cream} offset={false} seed={`${seed}/rim`} />
      <Fill d={G.roofBand} color={palette.teal} offset={false} seed={`${seed}/roof`} />
      <Fill d={G.vent} color={palette.tealDark} seed={`${seed}/vent`} />
      <Fill d={G.sideGlass} color={palette.sage} seed={`${seed}/sg`} />
      <Ink d={G.pressInk + G.ventInk} width={SI.mid} seed={`${seed}/pink`} />
      <Ink d={G.sideWins + brickHints(380, 900, 360, 260, `${seed}/pb`, 5, 22)} width={SI.far} taper={false} seed={`${seed}/pwin`} />
      <ChromeSlot x={wx} y={wy} w={ww} h={wh} width={SI.mid} seed={`${seed}/pbw`} />
      {blink ? <Fill rect={[wx, wy + 30, ww, wh - 30]} color={palette.white} offset={false} mode="snap" /> : null}
      <FacadeDoor r={BLUEPRINT.door} seed={`${seed}/pdoor`} width={SI.mid} />
      <PlaqueSlot x={BLUEPRINT.plaque.x} y={BLUEPRINT.plaque.y} size={BLUEPRINT.plaque.size} at={plaqueAt.P} seed={`${seed}/pplq`} width={SI.far} />
      <Lock x={BLUEPRINT.lock.x} y={BLUEPRINT.lock.y} size={BLUEPRINT.lock.h} seed={`${seed}/plock`} ink={SI.far} {...lock} />
      <NibSign swingAt={signSwingAt} seed={`${seed}/nib`} />
      <VentPuff at={ventAt} seed={seed} />
    </PopUp>
  );

  const sides = (
    <>
      <PerspRow layout={LEFT} popAt={lPop} plaqueAt={lPlq} ink={[SI.mid, SI.far]} seed={`${seed}/L`} propMin={6} />
      <PerspRow layout={RIGHT} popAt={rPop} plaqueAt={rPlq} ink={[SI.mid, SI.far]} seed={`${seed}/R`} propMin={6} />
      {blink
        ? [...LEFT.houses, ...RIGHT.houses].map((h, i) => <Fill key={i} d={h.g.screen} color={palette.white} offset={false} mode="snap" seed={`${seed}/bl${i}`} />)
        : null}
    </>
  );

  return (
    <SetPlace x={x} y={y} scale={scale}>
      {sun ? wrap('sun', 0.12, sun) : null}
      {wrap('far', 0.1, far)}
      {wrap('ground', 0.8, ground)}
      {wrap('press', 0.5, press)}
      {wrap('sides', 0.6, sides)}
    </SetPlace>
  );
};

