// V2S4_wcast.tsx (lane L3, V2S4 WORLD helpers): the people on her towpath (the 1.0x path plane, plane px at the 17.96
// pose). Small and simple (K4 `Person` in profile, round heads, never teal, never a look-alike of her); a walker's position
// is in PLANE coordinates and its walk is clocked by its own speed in the plane, so the feet never slide (12 drawings/s;
// `honestStep` makes the planted foot track the ground linearly, as V2S4_her does for her).
//   pair    a parent and a toddler hand in hand, westbound at a toddler's pace: she passes them (they slide right on
//           screen, BEHIND her, 15.07-16.27), then dawdle on. TIER B (the walkers she passes): no outline, fills that
//           part by value (CRAFT §c B); the only walkers in the shot (the life budget, conform_L3 §2: the jogger, the
//           cyclist and the dog walker are cut: every path either crossed her at 17.0 or the plates after 18.85)
//   reader  on a bench by the garden wall, head bowed over a book; STILL (no page turn), tier C
//   angler  on a folding stool at the coping, rod out over the water; STILL (no nibble), tier C
// Their ground shadows are the light layer's (V2S4_light S4Ground, one ShadowLayer for the whole towpath: `walkerStanders`,
// `READER_STANDERS`, `ANGLER_STANDERS`).
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {mixHex} from '../../lib/light';
import {Person, Seated, TraitOverrides} from '../kit/cast';
import {Batch, P, ovalPath} from '../kit/canal/core';
import {S4_START, s4PlaneDx} from './V2S4_rig';
import {q12, clamp01} from './V2S4_wcore';
import type {Stander} from './V2S4_light';

// ---------------------------------------------------------------- honest feet

/** Profile leg swing amplitude (rad) for a step of `stepPx` by a figure `h` px tall (body.ts: L = 0.47 h). */
export const swingFor = (stepPx: number, h: number) => Math.asin(Math.min(0.9, stepPx / (2 * 0.47 * h)));
/** K4 stride factor for that swing (walk: 22 deg x stride; jog: 30 deg x 1.45 x stride). */
export const strideOf = (A: number, pose: 'walk' | 'jog') => A / (((pose === 'jog' ? 30 * 1.45 : 22) * Math.PI) / 180);

/** Warp a travel-linear step count so the planted foot moves linearly with the ground (identity at each half step). */
export function honestStep(s: number, A: number): number {
  const sp = s - 0.5;
  const n = Math.floor(sp);
  const u = sp - n;
  const g = Math.asin((1 - 2 * u) * Math.sin(A)) / A;
  return n + 0.5 + Math.acos(Math.max(-1, Math.min(1, g))) / Math.PI;
}

// ---------------------------------------------------------------- walkers

export type Walker = {
  seed: string;
  /** Plane x at the cut (14.86). */
  x0: number;
  dir: -1 | 1;
  /** Speed in the plane (px/s) and the step length (px). */
  speed: number;
  stepPx: number;
  feet: number;
  h: number;
  pose: 'walk' | 'jog';
  traits: TraitOverrides;
  /** Half-width for the visibility test. */
  hw: number;
  phase?: number;
  /** A K4 reach target (relative to the feet, drawn facing left): holding a hand. */
  reach?: [number, number];
};

export const walkerX = (w: Walker, t: number) => w.x0 + w.dir * w.speed * (t - S4_START);
const visible = (w: Walker, t: number) => {
  const sx = walkerX(w, t) + s4PlaneDx(1, t);
  return sx + w.hw > -40 && sx - w.hw < 1120;
};

/** A walker's step count at t (12 drawings/s, sampled mid-hold), honest. */
export function walkerStep(w: Walker, t: number): number {
  const tq = q12(t) + 1 / 24;
  const travel = w.speed * (tq - S4_START);
  const A = swingFor(w.stepPx, w.h);
  return honestStep((w.phase ?? 0) + travel / w.stepPx, A);
}

const PARENT_H = 140;
const KID_H = 80;
/** Where the parent's and the toddler's hands meet (relative to the parent's feet). */
const HANDS: [number, number] = [-12, -71];

export const WALKERS: Record<string, Walker> = {
  parent: {seed: 's4parent', x0: 650 + 310, dir: -1, speed: 15, stepPx: 30, feet: 1021, h: PARENT_H, pose: 'walk', hw: 40, phase: 0.1, reach: HANDS, traits: {hair: 'curls', hairColor: CM.hair[2], coat: CM.sage, coatLen: 'jacket', trousers: CM.line, shoes: CM.shadeWarm, acc: 'backpack', accColor: CM.coatMustard, broad: 1.04}},
  kid: {seed: 's4kid', x0: 650 + 310 - 22, dir: -1, speed: 15, stepPx: 15, feet: 1027, h: KID_H, pose: 'walk', hw: 18, phase: 0.6, reach: [HANDS[0] + 22, HANDS[1] - 7], traits: {hair: 'beanie', hairColor: CM.hair[4], hatColor: CM.coatMustard, coat: CM.box, coatLen: 'jacket', trousers: CM.shadeWarm, shoes: CM.brickDeep, acc: 'none', broad: 1.08}},
};

/** The walkers' ground shadows at t (plane px; the light layer's S4Ground draws them under everything on the towpath). */
export function walkerStanders(t: number): Stander[] {
  const out: Stander[] = [];
  for (const id of Object.keys(WALKERS)) {
    const w = WALKERS[id];
    if (!visible(w, t)) continue;
    out.push({x: walkerX(w, t), y: w.feet, w: w.h * 0.26, h: w.h, w2: w.h * 0.2, person: true});
  }
  return out;
}

/** The walkers (tier B: the walkers she passes; no outline, ink 0: fills that part by value). */
export const Walkers: React.FC = () => {
  const t = useTime();
  const figs: React.ReactNode[] = [];
  const order = Object.keys(WALKERS).sort((a, b) => WALKERS[a].feet - WALKERS[b].feet);
  for (const id of order) {
    const w = WALKERS[id];
    if (!visible(w, t)) continue;
    const stride = strideOf(swingFor(w.stepPx, w.h), w.pose);
    figs.push(<Person key={id} x={walkerX(w, t)} y={w.feet} h={w.h} exact seed={w.seed} pose={w.reach ? 'reach' : w.pose} view="profile" flip={w.dir > 0} step={walkerStep(w, t)} stride={stride} traits={w.traits} reach={w.reach} ink={0} />);
  }
  return <Tier tier="support">{figs}</Tier>;
};

// ---------------------------------------------------------------- the reader on a bench (still)

export const READER = {x: 1150, seat: 1006, h: 96};
/** The bench's irons and the stool's legs: a calm mid slate (never plum, never a dark line: CRAFT §c). */
export const S4_IRON = '#9A8C95';
/** Wood (slats, the planter's box, rods, posts) lifted to a mid oak: on the towpath a thin dark wood reads as a line. */
export const S4_WOOD = mixHex(CM.line, CM.coatOat, 0.45);
const BENCH = {bw: 132, foot: 1030};
export const READER_STANDERS: Stander[] = [{x: READER.x, y: BENCH.foot, w: BENCH.bw * 1.05, h: 56, w2: BENCH.bw * 0.95}];

/** A bench by the garden wall (front view) with a reader, head bowed over a book (we see the crown, never a face). */
export function benchReaderInto(b: Batch) {
  const {x, seat} = READER;
  const {bw, foot} = BENCH;
  for (const k of [-0.44, 0.44]) {
    b.rect(S4_IRON, x + k * bw - 3, seat - 4, 6, foot - seat + 4);
    b.rect(S4_IRON, x + k * bw - 3, seat - 52, 6, 50);
  }
  b.rect(S4_WOOD, x - bw / 2, seat - 50, bw, 35);
  b.rect(S4_WOOD, x - bw / 2 - 4, seat - 6, bw + 8, 9);
  b.layer();
  // the reader: legs, shoes, a cardigan with rounded shoulders, the bowed head with a bun, the book in the lap
  const rx = x - 18;
  const coat = CM.sage;
  const hy = seat - 70;
  b.rect(CM.coatPlum, rx - 15, seat - 4, 30, 10);
  b.rect(CM.coatPlum, rx - 14, seat + 4, 28, foot - seat - 8);
  b.fill(CM.line, `M${P(rx - 18, foot - 7)}L${P(rx + 18, foot - 7)}L${P(rx + 18, foot)}L${P(rx - 18, foot)}Z`);
  b.fill(coat, `M${P(rx - 22, seat + 2)}L${P(rx - 24, hy + 24)}Q${P(rx - 22, hy + 10)} ${P(rx, hy + 9)}Q${P(rx + 22, hy + 10)} ${P(rx + 24, hy + 24)}L${P(rx + 22, seat + 2)}Z`);
  b.layer();
  b.fill(CM.hair[2], ovalPath(rx, hy + 3, 12.5, 12));
  b.fill(CM.hair[2], ovalPath(rx + 1, hy - 8, 6, 5));
  b.poly(CM.brickDeep, [[rx - 17, seat - 17], [rx + 17, seat - 17], [rx + 16, seat - 8], [rx - 16, seat - 8]]);
  b.layer();
  b.poly(CM.paper, [[rx - 15, seat - 18], [rx + 15, seat - 18], [rx + 15, seat - 11], [rx - 15, seat - 11]]);
  // a tote on the bench beside them
  b.poly(CM.coatOat, [[x + 22, seat - 30], [x + 48, seat - 30], [x + 50, seat - 2], [x + 20, seat - 2]]);
}

// ---------------------------------------------------------------- the angler on the coping (still)

export const ANGLER = {x: 404, seat: 1058, foot: 1077};
export const ANGLER_STANDERS: Stander[] = [{x: ANGLER.x - 14, y: ANGLER.foot, w: 64, h: 0}];

/** The rod tip (plane px): still (the float rides the water; no nibble: the life budget). */
export const rodTip = (): [number, number] => [ANGLER.x - 168, ANGLER.seat - 52];

/** A seated angler in profile (facing west), a folding stool, a rod, a tackle box and a flask. */
export function anglerInto(b: Batch) {
  const {x, seat, foot} = ANGLER;
  // stool: a canvas seat on its legs (one closed shape each, mid slate)
  b.poly(S4_IRON, [[x - 12, foot], [x - 9, foot], [x + 11, seat + 3], [x + 8, seat + 3]]);
  b.poly(S4_IRON, [[x + 12, foot], [x + 9, foot], [x - 11, seat + 3], [x - 8, seat + 3]]);
  b.rect(CM.coatSlate, x - 14, seat - 2, 28, 5);
  // tackle box and flask behind the stool
  b.rect(CM.sage, x + 18, foot - 22, 30, 22);
  b.rect(CM.coatMustard, x + 18, foot - 16, 30, 3);
  b.rect(CM.coatSlate, x + 52, foot - 30, 9, 30);
  b.layer();
  // legs: thigh forward, shin down, boots
  for (const [dx, c] of [[3, CM.shadeWarm], [0, CM.paneUnlit]] as [number, string][]) {
    b.poly(c, [[x - 6 + dx, seat - 6], [x - 34 + dx, seat - 4], [x - 34 + dx, seat + 6], [x - 6 + dx, seat + 5]]);
    b.poly(c, [[x - 36 + dx, seat - 2], [x - 26 + dx, seat - 2], [x - 26 + dx, foot - 4], [x - 36 + dx, foot - 4]]);
    b.poly(CM.coatPlum, [[x - 44 + dx, foot - 7], [x - 25 + dx, foot - 7], [x - 25 + dx, foot], [x - 46 + dx, foot]]);
  }
  // torso: a padded jacket leaning forward, a bobble hat (round head, no features)
  const sx = x - 8;
  const sy = seat - 56;
  b.fill(CM.coatMustard, `M${P(x + 12, seat + 2)}L${P(x - 14, seat + 2)}Q${P(sx - 22, sy + 30)} ${P(sx - 10, sy + 4)}Q${P(sx + 2, sy - 4)} ${P(sx + 14, sy + 4)}Q${P(x + 18, sy + 30)} ${P(x + 12, seat + 2)}Z`);
  const hx = sx - 14;
  const hy = sy - 12;
  b.layer();
  b.fill(CM.brickLight, ovalPath(hx - 5, hy + 4, 6, 7));
  b.fill(CM.hair[1], ovalPath(hx, hy, 12, 12));
  b.layer();
  b.fill(CM.brick, `M${P(hx - 13, hy - 1)}A13 12 0 0 1 ${P(hx + 13, hy - 1)}L${P(hx + 13, hy + 2)}L${P(hx - 13, hy + 2)}Z`);
  // arms forward to the rod butt
  b.fill(CM.coatMustard, `M${P(sx - 4, sy + 10)}Q${P(sx - 26, sy + 30)} ${P(sx - 30, sy + 44)}L${P(sx - 22, sy + 48)}Q${P(sx - 16, sy + 30)} ${P(sx + 6, sy + 18)}Z`);
  b.fill(CM.brickLight, ovalPath(sx - 28, sy + 46, 4, 4));
  // the rod: one long thin taper west over the water, a mid oak (no dark line)
  const [tx, ty] = rodTip();
  const bx = sx - 18;
  const byy = sy + 54;
  b.poly(S4_WOOD, [[bx + 8, byy + 2.4], [bx + 8, byy - 2.4], [tx, ty - 1], [tx, ty + 1]]);
}

export {Seated, clamp01};
