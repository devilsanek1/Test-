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
//   pushCam(T)   SQE's ONE push: x1.35 about (680, 1120) (flow_v2 §7's read fallback over its x1.25) for the street and
//                the window over 24.90-25.70 (inOutSine), HELD through the queue (the van's crate, the hop into the
//                phone, the BETTER van, the 2027 flip and the overtake all play at the pushed size: early review E4,
//                OPEN 6) and released in SQF's "nothing new" stretch 36.36-36.98 (J5's continuous camera: the pull-out
//                lands as the data center's sign lights at 36.98); with depth: the town x1.2, the far field x1.08 (the
//                mountain's summit stays under the caption band). The centre x 680 keeps the notice and the lane's head
//                left of the platform's right rail (x 950) and the gate right of the phone.
//   h2Cams(T)    push x entry: what SQE and SQF draw through.
// <H2View> draws the three outside planes and this window through h2Cams at film time; the sky is the World's.
import React from 'react';
import {clamp, ease, prog} from '../../../lib/time';
import {mat, XG, type Mat} from '../../../lib/xf';
import {Tier} from '../../../lib/tier';
import {nearStep} from '../../../lib/depth';
import {EMBER, Mug, type Pt} from '../kit';
import {AMBIENT_NOOK, Ambient, ContactShadow, FormShade, LightPool, Lit, nookRig, POOL_NOOK, RIGS, Shadow, ShadowLayer, mixHex, type LightRig} from '../kit/Light';
import {ellD, roundPoly, rrect} from '../kit/Fleet';
import {FilmClock, OutsideFar, OutsideStreet, OutsideTown, PlaneCamsProvider, useFilmT} from './outside';

// ---------------------------------------------------------------- geometry (H2 canvas px at rest)

export const H2_SILL = {top: 1250, front: 1262, bottom: 1292};
/** The frost on the glass's side edges (below y 620). */
export const H2_FROST_TOP = 620;

// ---------------------------------------------------------------- cameras

export type H2Cams = {win: Mat; street: Mat; town: Mat; far: Mat};
const I = mat.I;
const zoomAbout = (s: number, c: Pt): Mat => mat.about(mat.scale(s), c[0], c[1]);

export const ENTRY = {t0: 22.35, t1: 22.95, c: [540, 1100] as Pt, win: 3.0, street: 1.12, town: 1.07, far: 1.03};
export const PUSH = {in0: 24.9, in1: 25.7, out0: 36.36, out1: 36.98, c: [680, 1120] as Pt, street: 1.35, town: 1.2, far: 1.08};

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
/** H2's nook rig (the lamp off the left edge over the desk): it lights the desk and the front plane in H2 (flow_v2 §5).
 *  The SAME rig as the home's (CRAFT §d.1: one nook, one rig): HOME_RIG's lit-terracotta pool and ambient step (kit
 *  POOL_NOOK, AMBIENT_NOOK), H2's own lamp geometry. (The kit default's cream pool, L* 88 / 93, was the brightest field
 *  of every H2 frame, under the hand: it pulled the brightest 5 % off the street's and the data center's beats.) */
export const H2_RIG: LightRig = (() => {
  const r = nookRig({lamp: H2_LAMP, pool: H2_POOL, glass: {x: -200, y: -200, w: 1480, h: H2_SILL.top + 200}});
  return {...r, tints: {...r.tints, ambient: AMBIENT_NOOK}, pool: POOL_NOOK};
})();
const RIG = H2_RIG;

/** The desk planner's cover: a muted warm rose-brown one value under the terracotta desk (tier C, CRAFT §c: within dL*
 *  ~10 of the desk it lies on; L* 58 C* 27 before the room's ambient step, ~53.5 rendered on the desk's ~63). Its band
 *  and its spine step with it. (Assembly review R2-4: the old plum-brown #97646C rendered L* 44, dL* 17-19 under the
 *  desk, and at a squint it was the frame's second-heaviest dark at 23.5 and 38.0, after the data center and ahead of
 *  every street subject but the DC truck: near dressing outweighing the beat, CRAFT §f.) */
const PLANNER = mixHex('#97646C', EMBER.desk, 0.5);
const PLANNER_SPINE = mixHex(EMBER.beam, EMBER.desk, 0.5);

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

/** The outer sill's snow ridge (canvas px) and its colour: the outside's sky-facing snow (outside.tsx's H2_SNOW = the
 *  street rig's snowCap, read from the rig here: this module loads inside outside.tsx's import cycle, so it never reads
 *  outside's constants at load time) on the nearest outdoor plane, one value step darker (CRAFT §f.2: nearer than the
 *  subject, -5 L*, hue kept): L* 84 (it was the palette's lit EMBER.snow, L* 93, the brightest band of every H2 frame,
 *  3x tall in J4's entry). */
const SILL_SNOW_C = nearStep(RIGS.street.snowCap, -1);
const SILL_SNOW = roundPoly([[-40, H2_SILL.top - 7], [180, H2_SILL.top - 11], [420, H2_SILL.top - 8], [700, H2_SILL.top - 12], [1120, H2_SILL.top - 8], [1120, H2_SILL.top + 2], [-40, H2_SILL.top + 2]], 6);

/** Our window from inside at H2 and the desk under it (canvas px; film time). */
export const H2Window: React.FC = () => {
  const mugX = 780;
  const mugTop = 1352;
  const mug = <Mug x={mugX} top={mugTop} w={112} steam={false} seed="h2/mug" />;
  const planner = rrect(470, 1580, 300, 190, 10);
  return (
    <FilmClock>
      <Tier tier="environment" bg={EMBER.wall}>
        {/* the glass's frost (the window plane) */}
        <path d={FROST} fill={mixHex(EMBER.frost, EMBER.sky, 0.25)} />
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
          {/* a closed planner and a pencil (flat, soft corners); the planner a warm rose-brown one value under the
              terracotta desk (tier C: a calm step, never a dark block that outweighs the street's beat at a squint) */}
          <path d={planner} fill={PLANNER} />
          <path d={rrect(470, 1580, 300, 14, 7)} fill={mixHex(PLANNER, EMBER.desk, 0.35)} />
          <path d={rrect(735, 1580, 18, 190, 4)} fill={PLANNER_SPINE} />
          <path d={roundPoly([[820, 1700], [990, 1640], [996, 1652], [826, 1712]], 3)} fill={EMBER.board} />
          <path d={ellD(906, 1667, 3, 3)} fill={EMBER.ink} />
          {mug}
          {/* a small pot of herbs at the desk's right (flat leaves, a terracotta pot) */}
          <path d={roundPoly([[930, 1520], [1010, 1520], [1000, 1600], [940, 1600]], 6)} fill={EMBER.pot} />
          <path d={rrect(924, 1510, 92, 16, 6)} fill={mixHex(EMBER.pot, EMBER.beam, 0.3)} />
          <path d={[[952, 1470, 14, 30, -20], [972, 1458, 13, 34, 4], [992, 1472, 14, 30, 24], [962, 1488, 11, 22, -40], [986, 1490, 11, 22, 40]].map(([x, y, rx, ry, a]) => `M${x} ${y + ry}Q${x - rx * 1.2 + a * 0.3} ${y} ${x + a * 0.4} ${y - ry}Q${x + rx * 1.2 + a * 0.3} ${y} ${x} ${y + ry}Z`).join('')} fill={'#6F8F62'} />
        </Tier>
        <FormShade of={mug} c={[mugX + 49, mugTop + 60]} size={[112, 128]} />
        {/* the room one step down outside the lamp's light, the sill included (it lies far above the pool: in H1 the
            nook's own sill is ambient too; its top was the wall's lit cream, L* 91, the frame's brightest band) */}
        <Ambient region={[-200, H2_SILL.top, 1480, 920 + DESK.y - H2_SILL.top]} holes={[{e: H2_POOL}]} />
      </Lit>
      <Tier tier="environment" bg={EMBER.wall}>
        {/* the outer sill's snow, outside the glass (never the room's ambient): SILL_SNOW_C */}
        <path d={SILL_SNOW} fill={SILL_SNOW_C} />
      </Tier>
    </FilmClock>
  );
};

/** The whole H2 view through h2Cams at film time: the far field, the town, the street, then this window and desk. */
export const H2View: React.FC<{cams?: H2Cams}> = ({cams}) => {
  const T = useFilmT();
  const c = cams ?? h2Cams(T);
  // the planes know their cameras: the street keeps its snow under the caption band in screen px and drives the trucks
  // up the town plane's road while the push scales the two planes apart
  return (
    <PlaneCamsProvider value={{far: c.far, town: c.town, street: c.street}}>
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
    </PlaneCamsProvider>
  );
};
