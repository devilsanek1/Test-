// scenes/h2_window.tsx: H2's WINDOW from inside and its cameras (the WINDOW lane owns it; docs/v3/flow_v2.md §3, §6).
// Standing at the glass: the glass runs past every edge of the frame (no head, no jambs: the outside fills it), flat
// frost on its side edges below y 620, the sill at 1250-1292, and under it the nook's desk (terracotta, the lamp's pool
// at the lower left where the hand holds the phone: the nook rig lights the front plane in H2 too). Everything on FILM
// time (shared across J4 and J5).
//
// Cameras (each returns one matrix per plane: win = this window and the desk, street, town, far; identity = H2 at rest):
//   entryCam(T)  J4 (22.35-22.95, inOutCubic, log-linear zoom about (540, 1100)): the window x3.0 -> 1, the street
//                x1.12 -> 1, the town x1.07 -> 1, the far field x1.03 -> 1 (we pull back in through our own glass; a
//                declared light change: into the warm room). Before 22.35 it holds the start state (SQD's last frames
//                draw H2View there), after 22.95 identity.
//   pushCam(T)   SQE's one push: x1.35 about (600, 1120) (flow_v2 §7's read fallback over its x1.25) for the street and the window over 24.90-25.70 (inOutSine),
//                released over 28.93-29.60; with depth: the town x1.2, the far field x1.08 (the mountain's summit stays
//                under the caption band).
//   h2Cams(T)    push x entry: what SQE and SQF draw through.
// <H2View> draws the three outside planes and this window through h2Cams at film time; the sky is the World's.
import React from 'react';
import {clamp, ease, prog} from '../../../lib/time';
import {mat, XG, type Mat} from '../../../lib/xf';
import {Tier} from '../../../lib/tier';
import {EMBER, Mug, type Pt} from '../kit';
import {Ambient, ContactShadow, FormShade, LightPool, Lit, nookRig, Shadow, ShadowLayer, mixHex} from '../kit/Light';
import {ellD, roundPoly, rrect} from '../kit/Fleet';
import {FilmClock, OutsideFar, OutsideStreet, OutsideTown, useFilmT} from './outside';

// ---------------------------------------------------------------- geometry (H2 canvas px at rest)

export const H2_SILL = {top: 1250, front: 1262, bottom: 1292};
/** The frost on the glass's side edges (below y 620). */
export const H2_FROST_TOP = 620;

// ---------------------------------------------------------------- cameras

export type H2Cams = {win: Mat; street: Mat; town: Mat; far: Mat};
const I = mat.I;
const zoomAbout = (s: number, c: Pt): Mat => mat.about(mat.scale(s), c[0], c[1]);

export const ENTRY = {t0: 22.35, t1: 22.95, c: [540, 1100] as Pt, win: 3.0, street: 1.12, town: 1.07, far: 1.03};
export const PUSH = {in0: 24.9, in1: 25.7, out0: 28.93, out1: 29.6, c: [600, 1120] as Pt, street: 1.35, town: 1.2, far: 1.08};

/** J4's move (see the header): one progress, each plane its own start scale, log-linear. */
export function entryCam(T: number): H2Cams {
  if (T >= ENTRY.t1) return {win: I, street: I, town: I, far: I};
  const u = ease.inOutCubic(prog(T, ENTRY.t0, ENTRY.t1 - ENTRY.t0));
  const z = (s0: number) => zoomAbout(Math.pow(s0, 1 - u), ENTRY.c);
  return {win: z(ENTRY.win), street: z(ENTRY.street), town: z(ENTRY.town), far: z(ENTRY.far)};
}

/** SQE's push toward the gate's pool and its release (see the header). */
export function pushCam(T: number): H2Cams {
  const p = ease.inOutSine(prog(T, PUSH.in0, PUSH.in1 - PUSH.in0)) - ease.inOutSine(prog(T, PUSH.out0, PUSH.out1 - PUSH.out0));
  if (p <= 0) return {win: I, street: I, town: I, far: I};
  const z = (s1: number) => zoomAbout(1 + (s1 - 1) * clamp(p), PUSH.c);
  return {win: z(PUSH.street), street: z(PUSH.street), town: z(PUSH.town), far: z(PUSH.far)};
}

/** What SQE / SQF (and SQD's last 0.6 s) draw through. */
export function h2Cams(T: number): H2Cams {
  const e = entryCam(T);
  const p = pushCam(T);
  return {win: mat.mul(p.win, e.win), street: mat.mul(p.street, e.street), town: mat.mul(p.town, e.town), far: mat.mul(p.far, e.far)};
}

/** A canvas point of a plane, on screen (e.g. where the van's crate is, for the thread plane's carry). */
export const onScreen = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

// ---------------------------------------------------------------- the window and the desk

const DESK = {y: H2_SILL.bottom};
/** The lamp (off the left edge, over the desk): its mouth lights a pool under the hand and the phone. */
const H2_LAMP = {base: [-230, 1700] as Pt, head: [-60, 1236] as Pt, rot: 26, scale: 1.4};
const H2_POOL = {cx: 250, cy: 1560, rx: 360, ry: 112};
const RIG = nookRig({lamp: H2_LAMP, pool: H2_POOL, glass: {x: -200, y: -200, w: 1480, h: H2_SILL.top + 200}});

/** The frost on the glass's side edges: flat, soft-edged columns (no ticks, no stars). */
const FROST = (() => {
  const col = (x0: number, side: 1 | -1) => {
    const pts: Pt[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const y = H2_FROST_TOP + ((H2_SILL.top - H2_FROST_TOP) * i) / n;
      const w = 18 + 26 * (i / n) + (i % 2 ? 7 : 0);
      pts.push([x0 + side * w, y]);
    }
    const edge = [[x0, H2_FROST_TOP - 30] as Pt, ...pts, [x0 + side * 70, H2_SILL.top] as Pt, [x0, H2_SILL.top] as Pt];
    return roundPoly(edge, 18);
  };
  return col(-6, 1) + col(1086, -1);
})();

/** Our window from inside at H2 and the desk under it (canvas px; film time). */
export const H2Window: React.FC = () => {
  const mugX = 780;
  const mugTop = 1352;
  const mug = <Mug x={mugX} top={mugTop} w={112} steam={false} seed="h2/mug" />;
  const planner = rrect(470, 1580, 300, 190, 10);
  return (
    <FilmClock>
      <Tier tier="environment" bg={EMBER.wall}>
        {/* the glass's frost (the window plane), the outer sill's snow */}
        <path d={FROST} fill={mixHex(EMBER.frost, EMBER.sky, 0.25)} />
        <path d={roundPoly([[-40, H2_SILL.top - 7], [180, H2_SILL.top - 11], [420, H2_SILL.top - 8], [700, H2_SILL.top - 12], [1120, H2_SILL.top - 8], [1120, H2_SILL.top + 2], [-40, H2_SILL.top + 2]], 6)} fill={EMBER.snow} />
        {/* the sill: its top face and its front (the wall's own cream) */}
        <path d={`M-200 ${H2_SILL.top}H1280V${H2_SILL.front}H-200Z`} fill={EMBER.sillTop} />
        <path d={`M-200 ${H2_SILL.front}H1280V${H2_SILL.bottom}H-200Z`} fill={EMBER.sillFront} />
        {/* the desk, from the sill down past the frame */}
        <path d={`M-200 ${DESK.y}H1280V2200H-200Z`} fill={EMBER.desk} />
      </Tier>
      <Lit rig={RIG}>
        <LightPool />
        <ShadowLayer>
          {/* the sill's shadow on the desk (a thin cast strip), the planner's and the mug's contact */}
          <Shadow d={`M-200 ${DESK.y}H1280V${DESK.y + 12}H-200Z`} tint="cast" soft={6} />
          <ContactShadow x={mugX + 49} y={mugTop + 128} w={112} h={12} />
          <ContactShadow x={620} y={1770} w={300} d={rrect(470, 1764, 300, 12, 6)} />
          <ContactShadow x={970} y={1600} w={70} h={10} />
        </ShadowLayer>
        <Tier tier="environment" bg={EMBER.wall}>
          {/* a closed planner and a pencil (flat, soft corners) */}
          <path d={planner} fill={EMBER.dcSide} />
          <path d={rrect(470, 1580, 300, 14, 7)} fill={mixHex(EMBER.dcSide, EMBER.sky, 0.4)} />
          <path d={rrect(735, 1580, 18, 190, 4)} fill={EMBER.beam} />
          <path d={roundPoly([[820, 1700], [990, 1640], [996, 1652], [826, 1712]], 3)} fill={EMBER.board} />
          <path d={ellD(906, 1667, 3, 3)} fill={EMBER.ink} />
          {mug}
          {/* a small pot of herbs at the desk's right (flat leaves, a terracotta pot) */}
          <path d={roundPoly([[930, 1520], [1010, 1520], [1000, 1600], [940, 1600]], 6)} fill={EMBER.pot} />
          <path d={rrect(924, 1510, 92, 16, 6)} fill={mixHex(EMBER.pot, EMBER.beam, 0.3)} />
          <path d={[[952, 1470, 14, 30, -20], [972, 1458, 13, 34, 4], [992, 1472, 14, 30, 24], [962, 1488, 11, 22, -40], [986, 1490, 11, 22, 40]].map(([x, y, rx, ry, a]) => `M${x} ${y + ry}Q${x - rx * 1.2 + a * 0.3} ${y} ${x + a * 0.4} ${y - ry}Q${x + rx * 1.2 + a * 0.3} ${y} ${x} ${y + ry}Z`).join('')} fill={'#6F8F62'} />
        </Tier>
        <FormShade of={mug} c={[mugX + 49, mugTop + 60]} size={[112, 128]} />
        <Ambient region={[-200, DESK.y, 1480, 920]} holes={[{e: H2_POOL}]} />
      </Lit>
    </FilmClock>
  );
};

/** The whole H2 view through h2Cams at film time: the far field, the town, the street, then this window and desk. */
export const H2View: React.FC<{cams?: H2Cams}> = ({cams}) => {
  const T = useFilmT();
  const c = cams ?? h2Cams(T);
  return (
    <>
      <XG m={c.far}>
        <OutsideFar />
      </XG>
      <XG m={c.town}>
        <OutsideTown />
      </XG>
      <XG m={c.street}>
        <OutsideStreet />
      </XG>
      <XG m={c.win}>
        <H2Window />
      </XG>
    </>
  );
};
