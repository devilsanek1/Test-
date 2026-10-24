// BlueprintWall — S4 (S05 "found it", the one low angle). Canvas coords at S05 rest (the scene lands at zoom 1.08).
//
// A low-angle civic facade x -140..800 whose pilasters lean 4-6 deg toward the top, an attic cornice y 610-650 (double
// line + tan band) with a flat sage shadow band under it, brick hints; a low right wing (x 800-1220, roof y 840) and the
// sun NOTCH between them (the scene's sun sits at screen (930, 725)); a broad flight of steps y 1320-1480.
// The MASTER BLUEPRINT hangs as a banner from a rod at y 680: white sheet (200, 680, 576, 620), teal frame 12 px, an ink
// door elevation with THE LOCK DETAIL big at (488, 960) 60x75 (the props-lane Lock, state 'blueprint'), an elephant
// stamp r40 at (720, 1230), dimension lines and a title block. Its linework draws OUTWARD from the lock (`drawAt`).
// Slots: the rod perch (Pip, 700, 680), the calendar on the facade (90, 760, 70, 90).
//
//   <BlueprintWall drawAt={21.6} sun={<Sun cx={930} cy={725} r={110} />} calendar={<Calendar ... />} />

import React from 'react';
import {palette} from '../../../lib/theme';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {arrow, circle, line, polyPath, rect, rectPath, Pt} from '../../../lib/sketch';
import {brickHints, cornice, glintAt, LayerWrap, noWrap, SetPlace, SI, windowInk} from './common';
import {Foreground, ForegroundSpec, groundMarks, GroundMarks} from './ground';
import {CalendarSlot, ElephantStampSlot, LockProps} from './propSlots';
import {Lock} from '../props';

export const BLUEPRINT_WALL = {
  facade: {x0: -140, x1: 800, corn: [610, 650] as [number, number], base: 1320},
  wing: {x0: 800, x1: 1220, roof: 840},
  sheet: [200, 680, 576, 620] as [number, number, number, number],
  rodY: 680,
  lock: {x: 488, y: 960, w: 60, h: 75},
  stamp: {x: 720, y: 1230, r: 40},
  calendar: [90, 760, 70, 90] as [number, number, number, number],
  /** Pip's perch on the rod. */
  perch: [700, 680] as Pt,
  /** The sun notch (screen centre at rest; r110). */
  sun: {x: 930, y: 725, r: 110},
  steps: {y0: 1320, y1: 1480, n: 4},
  /** Team feet line at the foot of the steps. */
  feetY: 1470,
  /** v3: the sheet's clean TOP MARGIN (inside the frame, no linework: the S02 tight framing and the L6 slip, two 38 px
   *  lines at zoom 1.13 = ~85 world px, e.g. S05's (205-650, 688-784)); everything on the plan starts at y >= 796 (the
   *  door elevation's head and its dimension tick); the paper glint sits low right (y ~1150). */
  topMargin: [212, 692, 764, 790] as [number, number, number, number],
  /** v3: the banner's BOTTOM RAIL (a wooden weight bar along the sheet's foot) and Pip's S05 perch on it (feet). */
  bottomRail: {x0: 178, x1: 798, y: 1296, h: 11},
  perchBottom: [620, 1296] as Pt,
} as const;

// pilasters lean in toward the top: base x -> top x (vertical vanishing point far above the centre)
const lean = (xb: number) => 330 + (xb - 330) * 0.91;

const G = (() => {
  const s = 'bpw';
  const F = BLUEPRINT_WALL.facade;
  const top = F.corn[1];
  const base = F.base;
  const corner = {b: 846, t: lean(846)}; // corner pilaster right edge
  const facade = polyPath([[F.x0 - 20, top], [corner.t, top], [corner.b, base], [F.x0 - 40, base]]);
  const pil = (xb: number, w: number) => {
    const xt = lean(xb);
    const xt2 = lean(xb + w);
    return {fill: polyPath([[xt, top], [xt2, top], [xb + w, base], [xb, base]]), shade: polyPath([[xt, top], [xt + w * 0.28, top], [xb + w * 0.28, base], [xb, base]]), ink: line(xb, base, xt, top, {seed: `${s}/p${xb}a`, over: [0, 4]}) + line(xb + w, base, xt2, top, {seed: `${s}/p${xb}b`, over: [0, 4]})};
  };
  const pils = [pil(-60, 40), pil(120, 40), pil(corner.b - 46, 46)];
  const wing = BLUEPRINT_WALL.wing;
  const wingFill = rectPath(wing.x0, wing.roof, wing.x1 - wing.x0, base - wing.roof);
  const wingInk = line(wing.x0 + 10, wing.roof, wing.x1 + 20, wing.roof, {seed: `${s}/wr`, over: [0, 10]}) + line(wing.x0 + 10, wing.roof + 14, wing.x1 + 20, wing.roof + 14, {seed: `${s}/wr2`, over: [0, 10]}) + windowInk(900, 920, 60, 90, `${s}/ww1`) + windowInk(1020, 920, 60, 90, `${s}/ww2`) + windowInk(900, 1100, 60, 90, `${s}/ww3`);
  const wingGlass = rectPath(901, 921, 58, 50) + rectPath(1021, 960, 58, 49) + rectPath(901, 1101, 58, 50);
  const corn = cornice(F.x0 - 30, corner.t + 16, F.corn[0], F.corn[1] - F.corn[0], `${s}/c`, 40);
  // steps (broad flight)
  const st = BLUEPRINT_WALL.steps;
  const sh = (st.y1 - st.y0) / st.n;
  let stepInk = '';
  let treads = '';
  let risers = '';
  for (let i = 0; i < st.n; i++) {
    const y = st.y0 + i * sh;
    treads += rectPath(-160, y, 1400, sh * 0.3);
    risers += rectPath(-160, y + sh * 0.3, 1400, sh * 0.7);
    stepInk += line(-160, y, 1240, y + 2, {seed: `${s}/st${i}`, over: [0, 0]}) + line(-160, y + sh * 0.3, 1240, y + sh * 0.3 + 1, {seed: `${s}/sr${i}`, over: [0, 0]});
  }
  stepInk += line(-160, st.y1, 1240, st.y1 + 2, {seed: `${s}/stE`, over: [0, 0]});
  // blueprint sheet
  const [bx, by, bw, bh] = BLUEPRINT_WALL.sheet;
  const frame = 12;
  const L = BLUEPRINT_WALL.lock;
  // door elevation around the lock: door 330..646 x 796..1190 (its head kept below the clean top margin, y 790), panels,
  // the lock box drawn by the Lock prop
  const DT = BLUEPRINT_WALL.topMargin[3] + 6;
  const doorEl = rect(330, DT, 316, 1190 - DT, {seed: `${s}/door`, over: 'small'}) + rect(352, DT + 22, 272, 1168 - DT - 22, {seed: `${s}/door2`, over: 'small'}) + line(488, DT + 22, 488, 894, {seed: `${s}/dm`, over: 0}) + line(488, 1020, 488, 1168, {seed: `${s}/dm2`, over: 0});
  const panels = rect(370, DT + 36, 98, 894 - DT - 36, {seed: `${s}/pn1`, over: 'small'}) + rect(508, DT + 36, 98, 894 - DT - 36, {seed: `${s}/pn2`, over: 'small'}) + rect(370, 1040, 98, 110, {seed: `${s}/pn3`, over: 'small'}) + rect(508, 1040, 98, 110, {seed: `${s}/pn4`, over: 'small'});
  const dims = arrow(310, DT, 310, 1190, {seed: `${s}/d1`, head: 10}) + arrow(310, 1190, 310, DT, {seed: `${s}/d2`, head: 10}) + arrow(330, 1214, 646, 1214, {seed: `${s}/d3`, head: 10}) + arrow(646, 1214, 330, 1214, {seed: `${s}/d4`, head: 10}) + line(300, DT, 330, DT, {seed: `${s}/d5`, over: 0}) + line(300, 1190, 330, 1190, {seed: `${s}/d6`, over: 0}) + line(L.x + 44, L.y - 30, L.x + 120, L.y - 70, {seed: `${s}/lead`, over: 0}) + line(L.x + 120, L.y - 70, L.x + 200, L.y - 70, {seed: `${s}/lead2`, over: 0});
  const callout = circle(L.x, L.y, 64, {seed: `${s}/call`, overlap: 10});
  const title = rect(bx + 26, by + bh - 96, 176, 70, {seed: `${s}/tb`, over: 'small'}) + line(bx + 26, by + bh - 70, bx + 202, by + bh - 70, {seed: `${s}/tb1`, over: 0}) + line(bx + 40, by + bh - 84, bx + 140, by + bh - 84, {seed: `${s}/tb2`, over: 0}) + line(bx + 40, by + bh - 52, bx + 120, by + bh - 52, {seed: `${s}/tb3`, over: 0}) + line(bx + 40, by + bh - 38, bx + 150, by + bh - 38, {seed: `${s}/tb4`, over: 0});
  const sheetEdge = rect(bx, by, bw, bh, {seed: `${s}/sheet`, over: 'small'}) + rect(bx + frame, by + frame, bw - frame * 2, bh - frame * 2, {seed: `${s}/sheet2`, over: 'small'});
  const tealFrame = rectPath(bx, by, bw, bh) + rectPath(bx + frame, by + frame, bw - frame * 2, bh - frame * 2);
  const rod = line(bx - 26, by, bx + bw + 26, by, {seed: `${s}/rod`, over: [0, 0]}) + circle(bx - 30, by, 7, {seed: `${s}/f1`}) + circle(bx + bw + 30, by, 7, {seed: `${s}/f2`}) + line(bx - 6, by, bx - 40, BLUEPRINT_WALL.facade.corn[1] + 2, {seed: `${s}/h1`, over: 0}) + line(bx + bw + 6, by, bx + bw + 40, BLUEPRINT_WALL.facade.corn[1] + 2, {seed: `${s}/h2`, over: 0});
  // the forecourt: one flat field with a few broken paving lines + specks (no tile grid)
  const ground = groundMarks({vp: [540, 1250], top: st.y1 + 8, bottom: 1920, x0: -380, x1: 1460, rays: 4, cross: 2, specks: 14, reach: 0.55, seed: `${s}/gm`});
  // v3 bottom rail: a wooden bar along the sheet's foot with turned end knobs (Pip's S05 perch)
  const BR = BLUEPRINT_WALL.bottomRail;
  const railFill = rectPath(BR.x0, BR.y, BR.x1 - BR.x0, BR.h) + `M${BR.x0 - 15} ${BR.y + BR.h / 2}a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z` + `M${BR.x1 - 1} ${BR.y + BR.h / 2}a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z`;
  const railInk = line(BR.x0 - 4, BR.y, BR.x1 + 4, BR.y, {seed: `${s}/br1`, over: [2, 2]}) + line(BR.x0 - 4, BR.y + BR.h, BR.x1 + 4, BR.y + BR.h, {seed: `${s}/br2`, over: [2, 2]}) + circle(BR.x0 - 7, BR.y + BR.h / 2, 8, {seed: `${s}/bk1`}) + circle(BR.x1 + 7, BR.y + BR.h / 2, 8, {seed: `${s}/bk2`});
  return {facade, pils, wingFill, wingInk, wingGlass, corn, top, treads, risers, stepInk, doorEl, panels, dims, callout, title, sheetEdge, tealFrame, rod, corner, ground, railFill, railInk};
})();

export type BlueprintWallProps = {
  /** The blueprint linework draws OUTWARD from the lock (lock first, then the door, dimensions, title, frame). */
  drawAt?: number;
  /** The lock detail: props-lane Lock props (state is 'blueprint'). */
  lock?: Partial<LockProps>;
  /** The corner elephant stamp slams (omit = printed). */
  stampAt?: number;
  /** Calendar slot (default: a props-lane Calendar); false = none. */
  calendar?: React.ReactNode | false;
  /** Foreground framing in the bottom band (ground.tsx presets; default 'heads': back-view heads looking up at the
   *  blueprint, cut by the bottom edge, the centre left open). false = none. */
  foreground?: ForegroundSpec;
  /** v3: the banner's bottom rail (BLUEPRINT_WALL.bottomRail, Pip's S05 perch). Default true; false = none. */
  bottomRail?: boolean;
  sun?: React.ReactNode;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

export const BlueprintWall: React.FC<BlueprintWallProps> = ({drawAt, lock = {}, stampAt, calendar, foreground = 'heads', bottomRail = true, sun, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'bpw'}) => {
  const F = BLUEPRINT_WALL.facade;
  const [bx, by, bw, bh] = BLUEPRINT_WALL.sheet;
  const L = BLUEPRINT_WALL.lock;
  const d = (dt: number) => (drawAt === undefined ? undefined : drawAt + dt);
  const wing = (
    <>
      <Fill d={G.wingFill} color={palette.sand} seed={`${seed}/wing`} />
      <Fill d={G.wingGlass} color={palette.sage} seed={`${seed}/wingG`} />
      <Ink d={G.wingInk} width={SI.far} taper={false} seed={`${seed}/wingI`} />
    </>
  );
  const facade = (
    <>
      <Fill d={G.facade} color={palette.cream} seed={`${seed}/fac`} />
      {G.pils.map((p, i) => (
        <React.Fragment key={i}>
          <Fill d={p.fill} color={palette.cream} offset={false} seed={`${seed}/pf${i}`} />
          <Fill d={p.shade} color={palette.sand} offset={false} seed={`${seed}/ps${i}`} />
        </React.Fragment>
      ))}
      <Fill rect={[F.x0 - 40, F.corn[0], G.corner.t + 60 - F.x0, F.corn[1] - F.corn[0]]} color={palette.tan} offset={false} seed={`${seed}/band`} />
      <Fill d={polyPath([[F.x0 - 40, G.top], [G.corner.t, G.top], [lean(G.corner.b - 2) + 1, G.top + 30], [F.x0 - 40, G.top + 30]])} color={palette.sage} offset={false} seed={`${seed}/shadow`} />
      <Ink d={G.corn} width={SI.mid} seed={`${seed}/corn`} />
      <Ink d={G.pils.map((p) => p.ink).join('')} width={SI.mid} seed={`${seed}/pil`} />
      <Ink d={brickHints(-120, 720, 300, 560, `${seed}/bk`, 6, 24) + brickHints(790, 880, 10, 10, `${seed}/bk2`, 0)} width={SI.far} taper={false} />
      {calendar === false ? null : calendar ?? <CalendarSlot x={BLUEPRINT_WALL.calendar[0]} y={BLUEPRINT_WALL.calendar[1]} w={BLUEPRINT_WALL.calendar[2]} h={BLUEPRINT_WALL.calendar[3]} pages={[{kind: 'summer'}]} seed={`${seed}/cal`} />}
    </>
  );
  const steps = (
    <>
      <Fill rect={[-160, BLUEPRINT_WALL.steps.y1, 1400, 600]} color={palette.mintPale} offset={false} seed={`${seed}/ground`} />
      <GroundMarks marks={G.ground} width={SI.far} seed={`${seed}/gm`} />
      <Fill d={G.risers} color={palette.cream} offset={false} seed={`${seed}/ris`} />
      <Fill d={G.treads} color={palette.sand} offset={false} seed={`${seed}/tre`} />
      <Ink d={G.stepInk} width={SI.mid} seed={`${seed}/steps`} />
    </>
  );
  const banner = (
    <>
      <Ink d={G.rod} width={SI.mid} taper={false} seed={`${seed}/rod`} />
      <Fill rect={[bx, by, bw, bh]} color={palette.white} seed={`${seed}/paper`} />
      <Fill d={G.tealFrame} rule="evenodd" color={palette.teal} offset={false} seed={`${seed}/frame`} />
      {/* outward from the lock: the lock detail, the door elevation, dimensions, title block, the frame lines */}
      <Lock x={L.x} y={L.y} size={L.h} state="blueprint" at={d(0)} seed={`${seed}/lock`} ink={SI.mid} {...lock} />
      <Ink d={G.callout} width={SI.far} at={d(0.12)} taper={false} seed={`${seed}/call`} />
      <Ink d={G.panels + G.doorEl} width={SI.far} at={d(0.2)} taper={false} seed={`${seed}/door`} />
      <Ink d={G.dims} width={SI.hair} at={d(0.45)} taper={false} seed={`${seed}/dims`} />
      <Ink d={G.title} width={SI.hair} at={d(0.6)} taper={false} seed={`${seed}/title`} />
      <Ink d={G.sheetEdge} width={SI.far} at={d(0.7)} taper={false} seed={`${seed}/edge`} />
      <ElephantStampSlot x={BLUEPRINT_WALL.stamp.x} y={BLUEPRINT_WALL.stamp.y} rx={BLUEPRINT_WALL.stamp.r} ry={BLUEPRINT_WALL.stamp.r} ring={7} at={stampAt} seed={`${seed}/stamp`} />
      {/* the paper's glint sits low on the right: the top margin stays clean (v3) */}
      <Ink d={glintAt(bx + bw - 60, by + 470, 40, `${seed}/gl`)} width={SI.hair} taper={false} />
      {bottomRail ? (
        <>
          <Fill d={G.railFill} color={palette.brown} seed={`${seed}/rail`} />
          <Ink d={G.railInk} width={SI.mid} taper={false} seed={`${seed}/railI`} />
        </>
      ) : null}
    </>
  );
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {sun ? wrap('sun', 0.1, sun) : null}
      {wrap('wing', 0.3, wing)}
      {wrap('facade', 0.5, facade)}
      {wrap('banner', 0.5, banner)}
      {wrap('steps', 0.75, steps)}
      {wrap('foreground', 1.0, <Foreground spec={foreground} seed={`${seed}/fg`} />)}
    </SetPlace>
  );
};
