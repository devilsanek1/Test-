// V2S4_wcast.tsx (lane L3, V2S4 WORLD helpers): the public on her towpath (the 1.0x path plane, plane px at the 17.96
// pose). Small and simple (K4 `Person` in profile, round heads, one accessory, never teal, never a look-alike of her);
// every walker's position is in PLANE coordinates and its walk is clocked by its own speed in the plane, so the feet
// never slide (12 drawings/s; `honestStep` makes the planted foot track the ground linearly, as V2S4_her does for her).
//   jogger      westbound, faster than her: overtakes her at the cut (passes BEHIND her), runs off west by ~18.6
//   pair        a parent and a toddler, westbound at a toddler's pace: she passes them (they slide right on screen,
//               behind her, 15.96-17.36), then they stop hand in hand to watch the water
//   cyclist     eastbound, early, on the right
//   dog walker  westbound, a dog leading on its lead, arrives from the right after the stop
//   reader      on a bench by the garden wall, head bowed over a book; one page turn
//   angler      on a folding stool at the coping, rod out over the water (the line + float: V2S4_wcanal)
// None crosses the plates (x 100-566 after 18.85) or the tag; all are drawn under her (the path plane).
import React from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {Person, Seated, TraitOverrides} from '../kit/cast';
import {Batch, Paint, P, ovalPath, lerp, rng} from '../kit/canal/core';
import {S4_START, s4PlaneDx} from './V2S4_rig';
import {SHADOW, q12, clamp01, smooth01} from './V2S4_wcore';

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
  pose: 'walk' | 'jog' | 'cycle';
  traits: TraitOverrides;
  /** Stops (stands) from this time. */
  stopAt?: number;
  /** Half-width for the visibility test. */
  hw: number;
  phase?: number;
  /** A K4 reach target (relative to the feet, drawn facing left): holding a hand, a lead. */
  reach?: [number, number];
  elbow?: [number, number];
};

export const walkerX = (w: Walker, t: number) => w.x0 + w.dir * w.speed * (Math.min(t, w.stopAt ?? Infinity) - S4_START);
const visible = (w: Walker, t: number) => {
  const sx = walkerX(w, t) + s4PlaneDx(1, t);
  return sx + w.hw > -40 && sx - w.hw < 1120;
};

/** A walker's step count at t (12 drawings/s, sampled mid-hold), honest. */
export function walkerStep(w: Walker, t: number): number {
  const tq = q12(t) + 1 / 24;
  const travel = w.speed * (Math.min(tq, w.stopAt ?? Infinity) - S4_START);
  const A = swingFor(w.stepPx, w.h);
  return honestStep((w.phase ?? 0) + travel / w.stepPx, A);
}

const PARENT_H = 146;
const KID_H = 84;
/** Where the parent's and the toddler's hands meet (relative to the parent's feet). */
const HANDS: [number, number] = [-12, -71];

export const WALKERS: Record<string, Walker> = {
  jogger: {seed: 's4jog', x0: 760 + 310, dir: -1, speed: 300, stepPx: 118, feet: 1061, h: 150, pose: 'jog', hw: 22, phase: 0.3, traits: {hair: 'cap', hairColor: CM.hair[2], hatColor: CM.coatSlate, coat: CM.leafRust, coatLen: 'jacket', trousers: CM.anchor, shoes: CM.paper, acc: 'headphones', accColor: CM.coatOat, broad: 0.95}},
  parent: {seed: 's4parent', x0: 590 + 310, dir: -1, speed: 15, stepPx: 30, feet: 1045, h: PARENT_H, pose: 'walk', hw: 40, phase: 0.1, reach: HANDS, traits: {hair: 'curls', hairColor: CM.hair[1], coat: CM.coatSlate, coatLen: 'jacket', trousers: CM.line, shoes: CM.hair[0], acc: 'backpack', accColor: CM.coatMustard, broad: 1.04}},
  kid: {seed: 's4kid', x0: 590 + 310 - 22, dir: -1, speed: 15, stepPx: 15, feet: 1052, h: KID_H, pose: 'walk', hw: 18, phase: 0.6, reach: [HANDS[0] + 22, HANDS[1] - 7], traits: {hair: 'beanie', hairColor: CM.hair[4], hatColor: CM.coatMustard, coat: CM.box, coatLen: 'jacket', trousers: CM.coatPlum, shoes: CM.brickDeep, acc: 'none', broad: 1.08}},
  cyclist: {seed: 's4cyc', x0: 820 + 310, dir: 1, speed: 340, stepPx: 1, feet: 1063, h: 152, pose: 'cycle', hw: 50, traits: {hair: 'cap', hairColor: CM.hair[3], hatColor: CM.brick, coat: CM.coatMustard, trousers: CM.coatSlate, shoes: CM.anchor, acc: 'none'}},
  dogger: {seed: 's4dogw', x0: 1110 + 310, dir: -1, speed: 80, stepPx: 52, feet: 1058, h: 142, pose: 'walk', hw: 60, phase: 0.4, reach: [-30, -62], elbow: [-14, -82], traits: {hair: 'beanie', hairColor: CM.hair[1], hatColor: CM.coatSlate, coat: CM.coatOat, coatLen: 'mid', trousers: CM.shadeWarm, shoes: CM.line, acc: 'scarf', accColor: CM.brick, broad: 1.0}},
};

/** The dog on the lead (leads its walker west by ~64 px; trots 12 drawings/s, tail wagging). */
export const DOG = {lead: 64, h: 40, step: 26};

function dogInto(b: Batch, x: number, y: number, t: number, moving: boolean, seed: string) {
  const H = DOG.h;
  const r = rng(seed);
  const tq = q12(t);
  const ph = moving ? (tq * 9.5) % (Math.PI * 2) : 0;
  const bob = moving ? Math.abs(Math.sin(ph)) * 1.4 : 0;
  const body = CM.coatOat;
  const patch = CM.line;
  const by = y - H * 0.55 - bob;
  // legs: far pair (shade) then near pair, trotting in diagonal pairs
  const leg = (lx: number, a: number, c: string) => {
    const fx = lx + Math.sin(a) * H * 0.18;
    b.poly(c, [[lx - 2.2, by + 2], [lx + 2.2, by + 2], [fx + 1.8, y], [fx - 2.2, y]]);
  };
  leg(x + H * 0.32, ph + Math.PI, CM.shadeWarm);
  leg(x - H * 0.36, ph, CM.shadeWarm);
  leg(x + H * 0.38, ph, body);
  leg(x - H * 0.3, ph + Math.PI, body);
  // body, the brown saddle, chest
  b.fill(body, ovalPath(x, by, H * 0.52, H * 0.22));
  b.fill(patch, ovalPath(x + H * 0.1, by - H * 0.06, H * 0.28, H * 0.14));
  // tail: wags (12 drawings/s)
  const wag = Math.sin(tq * 18 + r.next()) * 0.5;
  b.poly(body, [[x + H * 0.48, by - 3], [x + H * 0.52, by + 1], [x + H * 0.8, by - H * (0.3 + wag * 0.25)], [x + H * 0.74, by - H * (0.34 + wag * 0.25)]]);
  // head (facing west / left) with a snout, a floppy brown ear, the collar
  const hx = x - H * 0.56;
  const hy = by - H * 0.3 - (moving ? Math.sin(ph * 2) * 0.6 : Math.sin(t * 1.6) * 1.2);
  b.fill(body, ovalPath(hx, hy, H * 0.2, H * 0.17));
  b.fill(body, ovalPath(hx - H * 0.2, hy + H * 0.06, H * 0.13, H * 0.08));
  b.fill(CM.anchor, ovalPath(hx - H * 0.31, hy + H * 0.04, 2.2, 2));
  b.fill(patch, `M${P(hx + H * 0.02, hy - H * 0.14)}Q${P(hx + H * 0.16, hy - H * 0.12)} ${P(hx + H * 0.12, hy + H * 0.2)}Q${P(hx + H * 0.02, hy + H * 0.14)} ${P(hx + H * 0.02, hy - H * 0.14)}Z`);
  b.rect(CM.box, hx + H * 0.08, hy + H * 0.08, 4, H * 0.2);
  b.fill(body, `M${P(hx + H * 0.06, hy + H * 0.08)}L${P(x - H * 0.36, by - H * 0.12)}L${P(x - H * 0.3, by + H * 0.12)}L${P(hx + H * 0.06, hy + H * 0.22)}Z`);
  b.ink(`M${P(x - H * 0.5, by - H * 0.2)}Q${P(x, by - H * 0.28)} ${P(x + H * 0.48, by - H * 0.18)}`, 1.4, CM.ink, 0.3);
}

/** A short colour shadow east of a walker's feet (STYLE: <= ~40 px, flat). */
function footShadow(b: Batch, x: number, y: number, w: number) {
  b.poly(CM.stoneShade, [[x - w * 0.5, y - 1], [x + w * 0.5, y - 2], [x + w * 0.5 + SHADOW.len, y + 4], [x - w * 0.3 + SHADOW.len * 0.9, y + 6]]);
}

export const Walkers: React.FC = () => {
  const t = useTime();
  const sh = new Batch();
  const fx = new Batch();
  const figs: React.ReactNode[] = [];
  const order = ['dogger', 'parent', 'kid', 'jogger', 'cyclist'];
  for (const id of order) {
    const w = WALKERS[id];
    if (!visible(w, t)) continue;
    const x = walkerX(w, t);
    const moving = t < (w.stopAt ?? Infinity);
    footShadow(sh, x, w.feet, w.pose === 'cycle' ? 110 : w.h * 0.22);
    if (w.pose === 'cycle') {
      figs.push(<Person key={id} x={x} y={w.feet} h={w.h} exact seed={w.seed} pose="cycle" view="profile" flip={w.dir > 0} traits={w.traits} pedal={1.2} />);
      continue;
    }
    const stride = strideOf(swingFor(w.stepPx, w.h), w.pose);
    const pose = w.reach ? 'reach' : moving ? w.pose : 'stand';
    figs.push(
      <Person key={id} x={x} y={w.feet} h={w.h} exact seed={w.seed} pose={pose} view="profile" flip={w.dir > 0} step={moving ? walkerStep(w, t) : undefined} stride={stride} traits={w.traits} reach={w.reach} elbow={w.elbow} />,
    );
    if (id === 'dogger') {
      // the dog leads west on its lead (it trots at the walker's speed; the lead sags)
      const dx = x - DOG.lead;
      dogInto(fx, dx, w.feet + 4, t, moving, 's4dog');
      const hx = x + (w.reach as [number, number])[0];
      const hy = w.feet + (w.reach as [number, number])[1];
      const cx = dx - DOG.h * 0.44;
      const cy = w.feet + 4 - DOG.h * 0.62;
      fx.ink(`M${P(hx, hy)}Q${P((hx + cx) / 2, Math.max(hy, cy) + 9)} ${P(cx, cy)}`, 1.2, CM.ink);
      footShadow(sh, dx, w.feet + 4, 50);
    }
  }
  return (
    <>
      <Paint b={sh} seed="s4walkSh" misreg={false} />
      {figs}
      <Paint b={fx} seed="s4walkFx" />
    </>
  );
};

// ---------------------------------------------------------------- the reader on a bench

export const READER = {x: 1150, seat: 1006, h: 96, pageAt: [15.62]};

/** A bench by the garden wall (front view) with a reader, head bowed over a book: one page turns. */
export function benchReaderInto(b: Batch, t: number) {
  const {x, seat} = READER;
  const bw = 132;
  const foot = 1030;
  // bench: two iron ends, slats, the backrest (wood + plum iron)
  footShadow(b, x + 30, foot, bw * 0.9);
  b.layer();
  for (const k of [-0.44, 0.44]) {
    b.rect(CM.anchor, x + k * bw - 3, seat - 4, 6, foot - seat + 4);
    b.rect(CM.anchor, x + k * bw - 3, seat - 52, 6, 50);
  }
  for (let s = 0; s < 3; s++) b.rect(s === 1 ? CM.brickDeep : CM.line, x - bw / 2, seat - 50 + s * 13, bw, 9);
  b.rect(CM.line, x - bw / 2 - 4, seat - 6, bw + 8, 9);
  b.rect(CM.shadeWarm, x - bw / 2, seat + 3, bw, 3);
  b.ink(`M${P(x - bw / 2 - 4, seat - 6)}L${P(x + bw / 2 + 4, seat - 6)}M${P(x - bw / 2, seat - 50)}L${P(x + bw / 2, seat - 50)}`, INK_PX.far * 0.8, CM.ink);
  b.layer();
  // the reader: front view, head BOWED (we see the crown of the hair, never a face), shoulders, knees, shoes
  const rx = x - 18;
  const coat = CM.sage;
  const hy = seat - 70;
  // legs: thighs toward us (short), shins down, shoes
  b.rect(CM.coatPlum, rx - 15, seat - 4, 13, 10);
  b.rect(CM.coatPlum, rx + 2, seat - 4, 13, 10);
  b.rect(CM.coatPlum, rx - 14, seat + 4, 11, foot - seat - 8);
  b.rect(CM.coatPlum, rx + 3, seat + 4, 11, foot - seat - 8);
  b.fill(CM.line, ovalPath(rx - 9, foot - 3, 9, 4));
  b.fill(CM.line, ovalPath(rx + 9, foot - 3, 9, 4));
  // torso: a cardigan, rounded shoulders leaning forward
  b.fill(coat, `M${P(rx - 22, seat + 2)}L${P(rx - 24, hy + 24)}Q${P(rx - 22, hy + 10)} ${P(rx, hy + 9)}Q${P(rx + 22, hy + 10)} ${P(rx + 24, hy + 24)}L${P(rx + 22, seat + 2)}Z`);
  b.rect(CM.coatMustard, rx - 1.2, hy + 14, 2.4, seat - hy - 14);
  // head bowed: the crown (hair) with a bun knot, no face
  b.fill(CM.hair[2], ovalPath(rx, hy + 3, 12.5, 12));
  b.fill(CM.hair[2], ovalPath(rx + 1, hy - 8, 6, 5));
  // arms down to the book in the lap
  b.fill(coat, `M${P(rx - 22, hy + 22)}Q${P(rx - 26, seat - 22)} ${P(rx - 10, seat - 12)}L${P(rx - 6, seat - 17)}Q${P(rx - 16, seat - 26)} ${P(rx - 15, hy + 26)}Z`);
  b.fill(coat, `M${P(rx + 22, hy + 22)}Q${P(rx + 26, seat - 22)} ${P(rx + 10, seat - 12)}L${P(rx + 6, seat - 17)}Q${P(rx + 16, seat - 26)} ${P(rx + 15, hy + 26)}Z`);
  // the open book: two pages + the cover; a page turns at READER.pageAt (0.4 s, right -> left)
  const by = seat - 16;
  b.poly(CM.brickDeep, [[rx - 17, by - 1], [rx + 17, by - 1], [rx + 16, by + 8], [rx - 16, by + 8]]);
  b.poly(CM.paper, [[rx - 15, by - 2], [rx - 0.5, by], [rx - 0.5, by + 6], [rx - 15, by + 5]]);
  b.poly(CM.paper, [[rx + 0.5, by], [rx + 15, by - 2], [rx + 15, by + 5], [rx + 0.5, by + 6]]);
  for (const a of READER.pageAt) {
    const k = (t - a) / 0.4;
    if (k <= 0 || k >= 1) continue;
    const e = smooth01(k);
    const ex = lerp(rx + 15, rx - 15, e);
    const lift = Math.sin(e * Math.PI) * 9;
    b.poly(CM.paper, [[rx, by], [ex, by - 2 - lift], [ex, by + 5 - lift * 0.6], [rx, by + 6]]);
    b.ink(`M${P(rx, by)}L${P(ex, by - 2 - lift)}`, 0.8, CM.line);
  }
  b.ink(`M${P(rx - 24, hy + 24)}Q${P(rx - 22, hy + 10)} ${P(rx, hy + 9)}M${P(rx + 9, hy - 6)}A12 12 0 0 1 ${P(rx + 12, hy + 6)}`, INK_PX.far, CM.ink);
  // a tote on the bench beside them, a flask
  b.poly(CM.coatOat, [[x + 22, seat - 30], [x + 48, seat - 30], [x + 50, seat - 2], [x + 20, seat - 2]]);
  b.ink(`M${P(x + 26, seat - 30)}Q${P(x + 35, seat - 46)} ${P(x + 44, seat - 30)}`, 1.2, CM.line);
  b.rect(CM.coatSlate, x + 55, seat - 24, 8, 22);
  b.rect(CM.paper, x + 55, seat - 26, 8, 3);
}

// ---------------------------------------------------------------- the angler on the coping

export const ANGLER = {x: 404, seat: 1058, foot: 1077, nibbleAt: 16.55};

/** The rod tip (plane px) at t: it nods with the float and twitches on the nibble. */
export function rodTip(t: number): [number, number] {
  const nib = Math.max(0, 1 - Math.abs(t - ANGLER.nibbleAt - 0.12) / 0.2) * 7;
  return [ANGLER.x - 168, ANGLER.seat - 52 + Math.sin(t * 1.9) * 1.2 + nib];
}

/** A seated angler in profile (facing west), a folding stool, a rod, a tackle box and a flask. */
export function anglerInto(b: Batch, t: number) {
  const {x, seat, foot} = ANGLER;
  footShadow(b, x + 6, foot, 50);
  b.layer();
  // stool: crossed legs + canvas seat
  b.ink(`M${P(x - 12, foot)}L${P(x + 10, seat + 2)}M${P(x + 12, foot)}L${P(x - 10, seat + 2)}`, 2, CM.line);
  b.rect(CM.coatSlate, x - 14, seat - 2, 28, 5);
  // tackle box and flask behind the stool
  b.rect(CM.sage, x + 18, foot - 22, 30, 22);
  b.rect(CM.coatMustard, x + 18, foot - 16, 30, 3);
  b.rect(CM.coatSlate, x + 52, foot - 30, 9, 30);
  b.rect(CM.paper, x + 52, foot - 33, 9, 4);
  b.layer();
  // legs: thigh forward, shin down, boots (far leg in shade)
  for (const [dx, c] of [[3, CM.shadeWarm], [0, CM.paneUnlit]] as [number, string][]) {
    b.poly(c, [[x - 6 + dx, seat - 6], [x - 34 + dx, seat - 4], [x - 34 + dx, seat + 6], [x - 6 + dx, seat + 5]]);
    b.poly(c, [[x - 36 + dx, seat - 2], [x - 26 + dx, seat - 2], [x - 26 + dx, foot - 4], [x - 36 + dx, foot - 4]]);
    b.poly(CM.anchor, [[x - 44 + dx, foot - 7], [x - 25 + dx, foot - 7], [x - 25 + dx, foot], [x - 46 + dx, foot]]);
  }
  // torso: a padded jacket leaning forward, a bobble hat (round head, no features)
  const sx = x - 8;
  const sy = seat - 56;
  b.fill(CM.coatMustard, `M${P(x + 12, seat + 2)}L${P(x - 14, seat + 2)}Q${P(sx - 22, sy + 30)} ${P(sx - 10, sy + 4)}Q${P(sx + 2, sy - 4)} ${P(sx + 14, sy + 4)}Q${P(x + 18, sy + 30)} ${P(x + 12, seat + 2)}Z`);
  const hx = sx - 14;
  const hy = sy - 12;
  b.fill(CM.brickLight, ovalPath(hx - 5, hy + 4, 6, 7));
  b.fill(CM.hair[1], ovalPath(hx, hy, 12, 12));
  b.fill(CM.brick, `M${P(hx - 13, hy - 1)}A13 12 0 0 1 ${P(hx + 13, hy - 1)}L${P(hx + 13, hy + 2)}L${P(hx - 13, hy + 2)}Z`);
  b.fill(CM.paper, ovalPath(hx + 1, hy - 13, 4.2, 4));
  // arms forward to the rod butt
  b.fill(CM.coatMustard, `M${P(sx - 4, sy + 10)}Q${P(sx - 26, sy + 30)} ${P(sx - 30, sy + 44)}L${P(sx - 22, sy + 48)}Q${P(sx - 16, sy + 30)} ${P(sx + 6, sy + 18)}Z`);
  b.fill(CM.brickLight, ovalPath(sx - 28, sy + 46, 4, 4));
  // the rod: butt at the hands, a long thin taper west over the water
  const [tx, ty] = rodTip(t);
  const bx = sx - 18;
  const byy = sy + 54;
  b.poly(CM.anchor, [[bx + 8, byy + 2], [bx + 8, byy - 2], [tx, ty - 0.6], [tx, ty + 0.6]]);
  b.rect(CM.coatMustard, bx - 4, byy - 3, 6, 6);
  b.ink(`M${P(bx + 6, byy)}L${P(tx, ty)}`, 1.4, CM.ink);
  b.ink(`M${P(sx - 10, sy + 4)}Q${P(sx + 2, sy - 4)} ${P(sx + 14, sy + 4)}M${P(hx - 12, hy)}A12 12 0 0 1 ${P(hx + 12, hy)}`, INK_PX.far, CM.ink);
}

export {Seated, clamp01};
