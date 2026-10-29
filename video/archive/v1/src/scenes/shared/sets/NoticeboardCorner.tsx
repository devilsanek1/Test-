// NoticeboardCorner — S6 (S07 "pinned for everyone", the town square corner). Golden. Canvas coords at S07 rest.
//
// A sand public wall x 0-780 (tan cornice 840-880 + bold roof line, tan shade plane on its left 30 %), far rooftop
// silhouettes behind its top (fill-only half-sand #E6CEB6, y 780-860, a half step off the golden sky) where the sun sits half hidden, a flat peach horizon band; the makers' WORKSHOP corner at
// the right edge (the same <Workshop/> as S06, preset WORKSHOP_CORNER); a pole on its roof at (1000, 620-700) with three
// TELEPHONE WIRES sweeping left across the sky (y 700 / 730 / 760 at frame centre; the same wire spec continues in S08 at
// y 1211 / 1235.5 / 1260 at zoom 1.3: `TelephoneWires`, `WIRES`) with pigeons; the noticeboard slot (frame 140, 930,
// 600, 430; address rail 220, 900, 440, 30; legs to 1490: the props-lane RailBoard) and edge-reader slots.
//
//   <NoticeboardCorner sun={<Sun cx={640} cy={820} r={110}/>} board={{railLightAt: 32.2, pane1: (r) => <LeakSheet .../>}}
//     workshop={{doorOpenAt: 34.6}} readers={{riseAt: 30.9}} />

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, polyPath, Pt} from '../../../lib/sketch';
import {Bird} from '../../../lib/kit';
import {brickHints, cornice, HALF, LayerWrap, noWrap, SetPlace, SI} from './common';
import {Foreground, ForegroundSpec, groundMarks, GroundMarks} from './ground';
import {NoticeboardSlot, OnlookerSlot, PaneRect} from './propSlots';
import {Workshop, WORKSHOP_CORNER, WorkshopProps} from './MakersLane';
import type {Acc, Hair} from '../../../lib/kit';

// ---------------------------------------------------------------- telephone wires (shared S07 -> S08)

export type WireSpec = {
  /** Wire heights at the frame centre x = 540 (world y). */
  ys: [number, number, number];
  /** Left / right ends (world). */
  x0: number;
  x1: number;
  /** End heights relative to the centre height (left, right). */
  rise: [number, number];
  /** Storyboard v3: the wires END at a pole at pole.x (world), each tied off at its own height ys[i] there (the S07 / S08
   *  contract heights, so x1 should equal pole.x); the pole stands on `base` (our parapet's coping) and rises to `top`. */
  pole?: {x: number; base: number; top: number};
};

/** S07: from the pole on the workshop roof sweeping left; S08 (storyboard v3): from the left edge to a rooftop pole at
 *  x 540 on the DomeCity parapet (draw the counter board after the wires: it covers their ends); S08wide = review 5's
 *  wires sagging across the whole frame. */
export const WIRES = {
  S07: {ys: [700, 730, 760], x0: -260, x1: 1000, rise: [-34, -60]} as WireSpec,
  S08: {ys: [1211, 1235.5, 1260], x0: -260, x1: 540, rise: [-60, 0], pole: {x: 540, base: 1446, top: 1178}} as WireSpec,
  S08wide: {ys: [1211, 1235.5, 1260], x0: -260, x1: 1340, rise: [-60, -60]} as WireSpec,
} as const;

/** Quadratic through (x0, yc + rise[0]), (540, yc) and (x1, yc + rise[1]): returns its control point. With a pole the
 *  wire ends ON the pole at (pole.x, yc) and sags 22 px between its ends. */
function wireCtrl(spec: WireSpec, i: number): {a: Pt; c: Pt; b: Pt} {
  const yc = spec.ys[i];
  if (spec.pole) {
    const a: Pt = [spec.x0, yc + spec.rise[0] + i * 3];
    const b: Pt = [spec.pole.x, yc];
    return {a, c: [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 22], b};
  }
  const a: Pt = [spec.x0, yc + spec.rise[0] + i * 3];
  const b: Pt = [spec.x1, yc + spec.rise[1] - i * 6];
  const cx = (a[0] + b[0]) / 2;
  const u = (540 - a[0]) / (b[0] - a[0]);
  const cy = (yc - (1 - u) * (1 - u) * a[1] - u * u * b[1]) / (2 * u * (1 - u));
  return {a, c: [cx, cy], b};
}

/** A point on wire i at x (for pegged copies, pigeons). */
export function wireAt(spec: WireSpec, i: number, x: number): Pt {
  const {a, c, b} = wireCtrl(spec, i);
  const u = (x - a[0]) / (b[0] - a[0]);
  return [x, (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
}

export const TelephoneWires: React.FC<{spec: WireSpec; width?: number; at?: number; pigeons?: {i: number; x: number}[]; pigeonsFlyAt?: number; seed?: string}> = ({spec, width = SI.far, at, pigeons = [], pigeonsFlyAt, seed = 'wires'}) => {
  let d = '';
  for (let i = 0; i < 3; i++) {
    const {a, c, b} = wireCtrl(spec, i);
    d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  const P = spec.pole;
  return (
    <>
      {P ? (
        <>
          {/* the rooftop pole on our parapet: an ochre post with a cap, three insulator pins where the wires tie off */}
          <Fill d={polyPath([[P.x - 8, P.base], [P.x - 6, P.top], [P.x + 6, P.top], [P.x + 8, P.base]])} color={palette.brown} at={at} seed={`${seed}/pole`} />
          <Ink
            d={
              line(P.x - 8, P.base, P.x - 6, P.top, {seed: `${seed}/p1`, over: [0, 3]}) +
              line(P.x + 8, P.base, P.x + 6, P.top, {seed: `${seed}/p2`, over: [0, 3]}) +
              line(P.x - 11, P.top, P.x + 11, P.top, {seed: `${seed}/pc`, over: [2, 2]}) +
              spec.ys.map((yy, i) => `M${(P.x - 6).toFixed(1)} ${yy.toFixed(1)}l${(i % 2 ? 14 : -10).toFixed(1)} 0`).join('')
            }
            width={SI.front * 0.8}
            at={at}
            taper={false}
            seed={`${seed}/pi`}
          />
        </>
      ) : null}
      <Ink d={d} width={width} at={at} order="all" taper={false} seed={`${seed}/w`} />
      {pigeons.map((p, k) => {
        const q = wireAt(spec, p.i, p.x);
        return <Bird key={k} x={q[0]} y={q[1] + 1} s={0.8} seed={`${seed}/pg${k}`} flyAt={pigeonsFlyAt !== undefined ? pigeonsFlyAt + k * 0.08 : undefined} color={k % 2 ? palette.sand : palette.white} flip={k === 1} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- the corner

export const NOTICE_CORNER = {
  wall: {x0: -140, x1: 780, top: 840, corn: 40, base: 1500},
  band: [760, 860] as [number, number],
  pole: {x: 1000, top: 620, base: 700},
  board: {frame: [140, 930, 600, 430] as [number, number, number, number], rail: [220, 900, 440, 30] as [number, number, number, number], legsY: 1490},
  /** Pip on the board top, right of the rail. */
  pip: [705, 928] as Pt,
  sun: {x: 640, y: 820, r: 110},
  readers: [
    {head: [80, 1280] as Pt, hair: 'short' as Hair, body: palette.teal, acc: ['hood'] as Acc[]},
    {head: [190, 1330] as Pt, hair: 'bun' as Hair, body: palette.sand, acc: ['scarf'] as Acc[]},
    {head: [900, 1300] as Pt, hair: 'cap' as Hair, body: palette.sage, acc: ['collar'] as Acc[]},
    {head: [1010, 1260] as Pt, hair: 'long' as Hair, body: palette.brown, acc: [] as Acc[]},
  ],
  /** Fix cart start (rolls left to 720, 1450). */
  cart: [900, 1450] as Pt,
} as const;

const G = (() => {
  const s = 'nc';
  const W = NOTICE_CORNER.wall;
  const roofs = polyPath([[-160, 862], [-160, 812], [-60, 812], [-60, 790], [40, 790], [60, 772], [80, 790], [190, 790], [190, 808], [300, 808], [300, 784], [372, 784], [372, 800], [470, 800], [500, 780], [530, 800], [640, 800], [640, 812], [780, 812], [780, 862]]);
  const wallInk = cornice(W.x0, W.x1 + 10, W.top, W.corn, `${s}/c`, 30) + line(W.x0, W.base, W.x1 + 20, W.base, {seed: `${s}/b`, over: [0, 10]});
  const kerb = line(-160, W.base + 20, 1240, W.base + 22, {seed: `${s}/k`, over: 0}) + line(-160, W.base + 40, 1240, W.base + 43, {seed: `${s}/k2`, over: 0});
  const pole = NOTICE_CORNER.pole;
  const poleFill = polyPath([[pole.x - 7, pole.base], [pole.x - 5, pole.top], [pole.x + 5, pole.top], [pole.x + 7, pole.base]]);
  const poleInk = line(pole.x - 7, pole.base, pole.x - 5, pole.top, {seed: `${s}/p1`, over: [0, 4]}) + line(pole.x + 7, pole.base, pole.x + 5, pole.top, {seed: `${s}/p2`, over: [0, 3]}) + line(pole.x - 46, pole.top + 18, pole.x + 46, pole.top + 18, {seed: `${s}/pb`, over: [3, 3]}) + `M${pole.x - 34} ${pole.top + 18}l0 -9M${pole.x + 34} ${pole.top + 18}l0 -9M${pole.x - 14} ${pole.top + 18}l0 -9`;
  const ground = groundMarks({vp: [540, 1240], top: W.base + 50, bottom: 1920, x0: -300, x1: 1380, rays: 3, cross: 1, specks: 12, reach: 0.5, seed: `${s}/gm`});
  return {roofs, wallInk, kerb, poleFill, poleInk, ground};
})();

export type NoticeboardCornerProps = {
  sun?: React.ReactNode;
  /** Board props (RailBoard: riseAt, railLightAt, pane1/pane2 renderers, paneDarkAt...). false = no board. */
  board?: {at?: number; riseAt?: number; railLightAt?: number; pane1?: (r: PaneRect) => React.ReactNode; pane2?: (r: PaneRect) => React.ReactNode; paneDarkAt?: number; pane2ScaleInAt?: number} | false;
  workshop?: WorkshopProps;
  /** Edge readers (props EdgeOnlooker): true / {riseAt, phonesAt} / false. */
  readers?: boolean | {riseAt?: number; phonesAt?: number};
  /** Pigeons on the wires (default 3); flyAt scatters them. */
  pigeons?: boolean;
  pigeonsFlyAt?: number;
  band?: boolean;
  /** Extra foreground framing (ground.tsx presets). Default none: the edge readers frame the shot. */
  foreground?: ForegroundSpec;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

export const NoticeboardCorner: React.FC<NoticeboardCornerProps> = ({sun, board = {}, workshop, readers = true, pigeons = true, pigeonsFlyAt, band = true, foreground, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'nc'}) => {
  useTime();
  const W = NOTICE_CORNER.wall;
  const B = NOTICE_CORNER.board;
  const far = band ? <Fill rect={[-160, NOTICE_CORNER.band[0], 1400, NOTICE_CORNER.band[1] - NOTICE_CORNER.band[0] + 4]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/band`} /> : null;
  // far roofs one half-step off the golden sky (haze), so the wall's tan cornice + bold roof line keep their silhouette
  const roofs = <Fill d={G.roofs} color={HALF.sand} offset={false} mode="snap" seed={`${seed}/roofs`} />;
  const wires = <TelephoneWires spec={WIRES.S07} pigeons={pigeons ? [{i: 0, x: 380}, {i: 0, x: 420}, {i: 1, x: 700}] : []} pigeonsFlyAt={pigeonsFlyAt} seed={`${seed}/wires`} />;
  const wall = (
    <>
      <Fill rect={[W.x0, W.top, W.x1 - W.x0, W.base - W.top]} color={palette.sand} seed={`${seed}/wall`} />
      <Fill rect={[W.x0, W.top + W.corn, (W.x1 - W.x0) * 0.3, W.base - W.top - W.corn]} color={palette.tan} offset={false} seed={`${seed}/shade`} />
      <Fill rect={[W.x0 - 10, W.top, W.x1 - W.x0 + 30, W.corn]} color={palette.tan} offset={false} seed={`${seed}/corn`} />
      <Ink d={G.wallInk} width={SI.mid} seed={`${seed}/wallI`} />
      <Ink d={brickHints(20, 900, 120, 500, `${seed}/bk`, 3, 24) + brickHints(560, 960, 200, 120, `${seed}/bk2`, 2, 22)} width={SI.far} taper={false} />
    </>
  );
  const ground = (
    <>
      <Fill rect={[-160, W.base, 1400, 600]} color={palette.mintPale} offset={false} seed={`${seed}/pave`} />
      <Ink d={G.kerb} width={SI.far} seed={`${seed}/kerb`} />
      <GroundMarks marks={G.ground} width={SI.far} seed={`${seed}/gm`} />
    </>
  );
  const corner = (
    <>
      <Workshop layout={WORKSHOP_CORNER} blind="down" glowAt={false} makersAt={false} seed={`${seed}/ws`} {...workshop} />
      <Fill d={G.poleFill} color={palette.brown} seed={`${seed}/pole`} />
      <Ink d={G.poleInk} width={SI.mid} taper={false} />
    </>
  );
  const boardNode = board === false ? null : <NoticeboardSlot x={B.frame[0]} y={B.frame[1]} w={B.frame[2]} h={B.frame[3]} legsY={B.legsY} rail={B.rail} seed={`${seed}/board`} {...board} />;
  const rd = readers === false ? null : NOTICE_CORNER.readers.map((r, i) => <OnlookerSlot key={i} x={r.head[0]} y={r.head[1]} head={82} hair={r.hair} body={r.body} acc={r.acc} riseAt={typeof readers === 'object' && readers.riseAt !== undefined ? readers.riseAt + i * 0.06 : undefined} raisePhoneAt={typeof readers === 'object' && readers.phonesAt !== undefined ? readers.phonesAt + i * 0.1 : undefined} rim={i < 2 ? 'left' : 'right'} seed={`${seed}/rd${i}`} />);
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {wrap('far', 0.05, far)}
      {sun ? wrap('sun', 0.1, sun) : null}
      {wrap('roofs', 0.2, roofs)}
      {wrap('wires', 0.2, wires)}
      {wrap('wall', 0.5, wall)}
      {wrap('ground', 0.7, ground)}
      {wrap('corner', 0.5, corner)}
      {wrap('board', 0.7, boardNode)}
      {wrap('readers', 1.0, rd)}
      {wrap('foreground', 1.0, <Foreground spec={foreground} seed={`${seed}/fg`} />)}
    </SetPlace>
  );
};
