// dc/crane.ts: the S5 pull-back crane rig for the Arlington planes (TREATMENT section 6; src/v3/film/kit/Pullback.tsx
// PullLayer / planeMat / cubicBezier; the K2 contract src/v2r/world/map.ts S5).
//
// ONE progress p on ONE ease, cubicBezier(0.35, 0.03, 0.45, 1.0) over 21.30-23.40 (p 0.15 at 21.75, 0.48 at 22.16,
// 0.70 at 22.43 "Pentagon", 0.96 at 23.02), drives every plane: the dolly back + crane up + the arc (~75 deg round the
// two backs) is ONE move; hold 20.55-21.30 before it, 23.40-24.00 after. Scene time t = film time - 20.55.
//
// The planes (END coords; at p 0 each is scaled k about its pivot and slid by `off`):
//   FAR       sky bands, high bars, the SUN (it lands cut by the right edge and IS SUN1 (250, 650) r 65 at the
//             start: exact), the cloud bank, hills, the low white city, the obelisk.     k 1.08, slides 850 px right
//   RIVER     the far shore's cherries, the Potomac, the bridges, the near bank.          k 1.15, slides 780 right
//   MID       the Pentagon + its lawns, boulevard, groves (lens.ts MID camera).          k 1.35, slides 640 right and
//             RISES 380 px into place (the dolly's share: it starts below the slope's crowns, hidden)
//   NEAR_MID  the slope's warm-dark blossoming crowns (start coords): the slot's bottom edge and the big tree that
//             stands where the Pentagon will land; they sink 560 px below the balustrade (the crane's share).
//   DECK      the terrace, pinned on the stranger (the pivot): k = 150 / 62 from the contract's start / end figures.
//   T1 box    the terrace tree, sliding in from the left as the LEFT frame (its top held at y 642).
//   L2 box    the end lamppost, sliding in from the right as the RIGHT frame (late, p > 0.7).
//   WIPE      the lamppost with two hanging baskets that sweeps right -> left across the backs at the peak
//             (contact >= 10 frames round 22.10; the tiny drawings swap behind it at `swapAt`).
// Parallax reads as an orbit: the far slides right (the sun goes from the slot to the upper right), the deck holds,
// the foreground sweeps left; the near slope sinks while the valley rises into view (crane + dolly).

import {S5, S5_EASE, SUN1} from '../../world/map';
import {cubicBezier, planeMat, boxMat, startMat, planeScale, applyMat, matScale, planeSpeed, type PullPlane, type PullBox} from '../../../v3/film/kit/Pullback';
import {mat, type Mat} from '../../../lib/xf';
import type {Pt} from '../../../lib/sketch';
import {VISTA} from './vista';
import {TREE_LEFT, LAMP_RIGHT} from './terrace';

export {planeMat, boxMat, startMat, planeScale, applyMat, matScale, cubicBezier};
export type {PullPlane, PullBox};

/** S5 starts at this film time; every time below is SCENE time (film - S5_T0). */
export const S5_T0 = 20.55;
const sc = (film: number) => film - S5_T0;

export const CRANE_T = {
  /** The move: hold to 0.75, ONE ease 0.75-2.85, hold to 3.45 (24.00). */
  t0: sc(S5.move.t0),
  t1: sc(S5.move.t1),
  end: sc(S5.move.holdEnd),
  /** 20.76 "April": the calendar flip (to 21.20) and the 4-frame blossom burst. */
  april: sc(S5.start.calendarFlip.t0),
  flip: [sc(S5.start.calendarFlip.t0), sc(S5.start.calendarFlip.t1)] as [number, number],
  /** 23.08: windows warm on along one wing. */
  warm: sc(S5.windowsWarmAt),
  /** 23.90: Pip leaps. */
  pipLeap: sc(S5.pipLeapAt),
};

/** The ease (the K2 contract's, re-fit for this cut). */
export const CRANE_EASE = S5_EASE;
/** Crane progress at scene time t. */
export const craneP = (t: number) => CRANE_EASE((t - CRANE_T.t0) / (CRANE_T.t1 - CRANE_T.t0));

// ---------------------------------------------------------------- the planes

export const FAR: PullPlane = {o: [540, VISTA.horizonY], off: [-850, 0], k: 1.08};
export const RIVER: PullPlane = {o: [540, 846], off: [-780, 0], k: 1.15};
export const MID_PL: PullPlane = {o: [540, 980], off: [-640, 380], k: 1.35};
export const NEAR_MID_PL: PullPlane = {o: [540, 1200], off: [-300, -560], k: 1.5};
/** The deck, pinned on the stranger's feet: the contract's start (300, 1225) h 150 -> end (318, 1238) h 62. */
export const DECK: PullPlane = (() => {
  const s = S5.start.stranger;
  const e = S5.end.stranger;
  return {o: [e.x, e.feetY], off: [s.x - e.x, s.feetY - e.feetY], k: s.h / e.h};
})();
/** The terrace tree: its crown's top-left corner travels from 520 px left of its landing; top held at y 642. */
export const T1_BOX: PullBox = {from: [TREE_LEFT.crown.x0 - 520, TREE_LEFT.crown.y0], to: [TREE_LEFT.crown.x0, TREE_LEFT.crown.y0], s0: 1.3};
/** The end lamppost: its base travels in from beyond the bottom-right. */
export const L2_BOX: PullBox = {from: [LAMP_RIGHT.x + 430, LAMP_RIGHT.base + 260], to: [LAMP_RIGHT.x, LAMP_RIGHT.base], s0: 1.35};

/** Check: the far plane puts the end sun exactly on SUN1 at p 0 (the S4 -> S5 match). */
export const sunAtStart = (): {x: number; y: number; r: number} => {
  const m = planeMat(FAR, 0);
  const q = applyMat(m, [VISTA.sun.x, VISTA.sun.y]);
  return {x: q[0], y: q[1], r: VISTA.sun.r * matScale(m)};
};
export const SUN1_SPEC = SUN1;

// ---------------------------------------------------------------- the wipe lamppost (screen path)

/** The wipe: a lamppost (finial h px) whose two baskets span ~0.82 h; its pole crosses the stranger's x at p 0.44
 *  (~22.10) at ~40 px/f, moving LEFT (foreground of the orbit). Base y sinks as the crane rises; finial >= 600. */
export const WIPE = {h: 560, pCross: 0.44, xCross: 330, dxdp: -2740, baseCross: 1560, dbdp: 400};
export function wipeAt(p: number): {x: number; base: number; s: number} {
  const x = WIPE.xCross + WIPE.dxdp * (p - WIPE.pCross);
  const base = WIPE.baseCross + WIPE.dbdp * (p - WIPE.pCross);
  const s = 1 + 0.12 * (1 - Math.abs(p - WIPE.pCross) / 0.45);
  return {x, base, s};
}
/** The wipe's map (its local drawing has the base at 0, 0). */
export const wipeMat = (p: number): Mat => {
  const w = wipeAt(p);
  return mat.compose(mat.translate(w.x, w.base), mat.scale(w.s));
};
/** Scene time at which the baskets cover the stranger fully (the tiny drawings swap behind the wipe here). */
export const swapAt = (() => {
  // the first frame whose pole sits within 40 px of the stranger's x at that time
  for (let f = Math.round(CRANE_T.t0 * 60); f < Math.round(CRANE_T.t1 * 60); f++) {
    const t = f / 60;
    const p = craneP(t);
    const m = planeMat(DECK, p);
    const sx = applyMat(m, [S5.end.stranger.x, S5.end.stranger.feetY])[0];
    if (wipeAt(p).x <= sx + 12) return t;
  }
  return sc(22.1);
})();

// ---------------------------------------------------------------- speeds (px per 60 fps frame)

export type SpeedRow = {layer: string; max: number; at: number};

/** Fastest on-screen motion per layer over the move (representative points of each plane, end coords). */
export function craneSpeeds(): SpeedRow[] {
  const t0 = CRANE_T.t0 - 0.05;
  const t1 = CRANE_T.t1 + 0.05;
  const grid = (xs: number[], ys: number[]): Pt[] => xs.flatMap((x) => ys.map((y) => [x, y] as Pt));
  const rows: [string, (t: number) => Mat, Pt[]][] = [
    ['far (city, bank, obelisk)', (t) => planeMat(FAR, craneP(t)), grid([0, 540, 1080, 1500], [626, 800, 836])],
    ['river', (t) => planeMat(RIVER, craneP(t)), grid([0, 540, 1080, 1500], [836, 870])],
    ['mid (Pentagon, lawns)', (t) => planeMat(MID_PL, craneP(t)), grid([0, 322, 800, 1080, 1280], [846, 980, 1104])],
    ['near-mid (slope crowns)', (t) => startMat(NEAR_MID_PL, craneP(t)), grid([0, 300, 600, 900, 1080], [598, 880, 1010])],
    ['deck (terrace, figures)', (t) => planeMat(DECK, craneP(t)), grid([0, 318, 700, 1080], [1180, 1238, 1600, 1920])],
    ['terrace tree (T1 box)', (t) => boxMat(T1_BOX, craneP(t)), grid([-170, 100, 290], [642, 1000, 1268])],
    ['end lamppost (L2 box)', (t) => boxMat(L2_BOX, craneP(t)), grid([LAMP_RIGHT.x], [LAMP_RIGHT.base - LAMP_RIGHT.h, LAMP_RIGHT.base - 200])],
    ['wipe lamppost (flat mass)', (t) => wipeMat(craneP(t)), [[0, -560] as Pt, [0, -380] as Pt, [-230, -380] as Pt, [230, -380] as Pt]],
  ];
  return rows.map(([layer, at, pts]) => {
    const s = planeSpeed(at, pts, t0, t1);
    return {layer, max: Math.round(s.max * 10) / 10, at: Math.round((s.at + S5_T0) * 100) / 100};
  });
}

void cubicBezier;
