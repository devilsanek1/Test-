// kit/Her.tsx: HER, the protagonist: ONE model for every lane (a generic figure, never a likeness of the real person):
// a long dark hair mass (the anchor), the cobalt sweater (the hero; darker rib cuffs, collar and hem), muted plum
// trousers, warm skin, a simple house-style face (dot eyes, one brow line each, a small nose hook, one mouth line) with
// 'calm' / 'worried' faces and a talking mouth. Optional lanyard + badge (she quit: off by default).
// Placement = the G3 board's figure box, so a lane copies the board numbers: x = between the feet, y = the ground,
// h = standing height (head radius 0.09 h; seated: seat at y - 0.29 h), facing 'l' | 'r'. Poses:
//   <HerStanding>  P2 (wide: h 640): 3/4 front, both hands up (holding her contract: pass it as children, drawn
//                  between her arms and her fingers)
//   <HerSeated>    view 'side' (P4 at 1.4x: h 840; P13 at 1.2x: h 720): seated, 3/4 side, facing the mic, forearms on
//                  the desk; view 'front34' (P6: h 1100, facing l): medium close, 3/4 front, the worried face to the mic
//   <HerBack>      P5 (h 1100): over-the-shoulder back view at her desk: hair mass, shoulder and arm cut by the frame,
//                  a sliver of cheek (no face), one hand on her laptop
//   <HerArm>       O1 / P12: the sleeve + hand from the bottom-left (the style frame's Arm), with the highlighter
// Ink by head size (inkForHead): 3.5 at P2, 3.9 at P13, 4.5 at P4, 4.8 at P5 / P6.

import React from 'react';
import {blob, ellipse, line, polyPath, roundRect, smooth} from '../../../lib/sketch';
import {rand} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {CC} from '../palette';
import {add, At, b, dirDeg, Fill, fillAt, Ink, inkForHead, lerp, Pt, W} from './util';
import {loopT} from './Ambient';
import {Badge} from './Props';

export const HER = {hair: CC.hair, hairShade: CC.hairShade, skin: CC.skin, sweater: CC.sweater, rib: CC.sweaterRib, trousers: CC.trousers, shoe: CC.shoe} as const;

export type HerFace = 'calm' | 'worried';
export type Facing = 'l' | 'r';
/** Talking: true (all the time), or time windows [t0, t1] (scene s) where the mouth moves. */
export type Talking = boolean | [number, number][];

export type HerBase = {
  /** The board's figure box: x between the feet, y the ground, h standing height (canvas px). */
  x: number;
  y: number;
  h: number;
  facing?: Facing;
  at?: At;
  seed?: string;
  /** Outline weight (default from the head size). */
  ink?: number;
};

// ---------------------------------------------------------------- geometry helpers

/** A tube (sleeve, leg) along a polyline with a width per point: a closed smooth outline. */
export function tube(pts: Pt[], widths: number[]): string {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const n: Pt = [-dy / l, dx / l];
    const w = widths[Math.min(i, widths.length - 1)] / 2;
    L.push([pts[i][0] + n[0] * w, pts[i][1] + n[1] * w]);
    R.push([pts[i][0] - n[0] * w, pts[i][1] - n[1] * w]);
  }
  return smooth([...L, ...R.reverse()], {closed: true, tension: 0.4});
}

/** Two-bone reach: the elbow for shoulder A, hand Z, bone lengths l1 / l2; `bend` = which side the elbow goes
 *  (+1 / -1: the left-hand normal of A -> Z). A hand out of reach gets a straight arm toward it. */
export function elbow(A: Pt, Z: Pt, l1: number, l2: number, bend: number): Pt {
  const dx = Z[0] - A[0];
  const dy = Z[1] - A[1];
  const d = Math.min(Math.hypot(dx, dy) || 1, l1 + l2 - 0.01);
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const hgt = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return [A[0] + ux * a - uy * hgt * bend, A[1] + uy * a + ux * hgt * bend];
}

const talkingAt = (t: number, talking?: Talking): boolean => {
  if (!talking) return false;
  if (talking === true) return true;
  return talking.some(([a, z]) => t >= a && t < z);
};
/** Mouth state: 0 closed, 1 half, 2 open (stepped at 10 drawings / s while talking). */
const MOUTH_STEPS = [2, 1, 2, 0, 1, 2, 1, 0, 2, 1];
/** Her WORRIED talking: the half step most of the time (2 open, 6 half, 2 closed), so she never reads "Oh!". */
const WORRY_STEPS = [1, 2, 1, 0, 1, 1, 2, 1, 0, 1];
const mouthStep = (t: number, talking?: Talking, steps = MOUTH_STEPS) => (talkingAt(t, talking) ? steps[Math.floor(t * 10) % steps.length] : 0);

/** A downturned open mouth: a dome (the corners low, the top arched, the bottom nearly straight between the corners),
 *  so her worried talking reads as a worried "frown, talking", never a round "o". W = half width, H = height. */
const capMouth = (mx: number, my: number, W: number, H: number): string =>
  smooth(
    [
      [mx - W, my + 0.34 * H],
      [mx - 0.66 * W, my - 0.36 * H],
      [mx, my - 0.62 * H],
      [mx + 0.66 * W, my - 0.36 * H],
      [mx + W, my + 0.34 * H],
      [mx + 0.45 * W, my + 0.4 * H],
      [mx - 0.45 * W, my + 0.4 * H],
    ],
    {closed: true, tension: 0.34},
  );
/** A blink every ~3.3 s (0.1 s), phase by seed. */
const blinking = (t: number, seed: string) => (t + rand(seed, 'blink') * 3.3) % 3.3 < 0.1;
/** Idle life (kit/README.md "Keep a panel alive"): the hair's slow sway (head radii) and a hand fidget (px offset,
 *  stepped at 12 drawings / s: every ~2.9 s the hands shift a little and settle). */
export const hairSway = (t: number, seed: string) => 0.05 * Math.sin(t * 1.1 + rand(seed, 'hs') * 6.28);
export const fidget = (t: number, seed: string, amp: number): Pt => {
  const per = 2.6 + rand(seed, 'fp') * 0.8;
  const tt = Math.floor(t * 12) / 12;
  const u = (((tt + rand(seed, 'fo') * per) % per) + per) % per;
  const k = u < 0.7 ? Math.sin((u / 0.7) * Math.PI) : 0;
  const a = rand(seed, `fa${Math.floor((tt + rand(seed, 'fo') * per) / per)}`) * 6.28;
  return [Math.cos(a) * amp * k, Math.sin(a) * amp * k * 0.6];
};
/** Talking: the head nods a hair on the stresses (stepped). */
const talkNod = (t: number, talking: Talking | undefined, r: number) => (talkingAt(t, talking) ? Math.sin(Math.floor(t * 8) * 1.7) * r * 0.035 : 0);

// ---------------------------------------------------------------- the head (face, hair cap, hair mass)

type HeadSpec = {
  c: Pt; // head centre
  r: number; // head radius
  s: number; // facing sign (+1 right)
  turn: number; // 0 front .. 1 profile
  face: HerFace;
  talking?: Talking;
  ink: number;
  at: At;
  seed: string;
  /** Idle life: the hair mass's lower half sways by this much (head radii). */
  sway?: number;
  /** Cast variants (staffers): 'long' (HER) | 'short' | 'bald'; hair colour, skin, round glasses. */
  hairStyle?: 'long' | 'short' | 'bald';
  hairColor?: string;
  skin?: string;
  glasses?: boolean;
};

// short / bald caps (staffers), front view, in head radii
const CAP_SHORT: Pt[] = [[-0.95, -0.05], [-1.0, -0.55], [-0.62, -1.02], [0, -1.13], [0.62, -1.02], [1.0, -0.55], [0.95, -0.05], [0.84, -0.42], [0.42, -0.6], [-0.18, -0.64], [-0.78, -0.44]];
// staffer B: a grey-white fringe round the back of the head from the temple to the nape, ABOVE and behind the ear (the
// ear is drawn over it, so it never reads as headphones)
const TUFT: Pt[] = [[-0.6, -0.66], [-0.9, -0.46], [-1.05, -0.1], [-1.02, 0.3], [-0.88, 0.52], [-0.8, 0.34], [-0.86, -0.04], [-0.76, -0.38], [-0.52, -0.56]];

// hair cap outlines in head radii (u toward the facing side, v down), front (turn 0) and side (turn 1)
const CAP_FRONT: Pt[] = [[-0.9, 0.12], [-1.05, -0.3], [-0.86, -0.86], [-0.3, -1.1], [0.35, -1.08], [0.88, -0.8], [1.05, -0.3], [0.9, 0.12], [0.7, -0.28], [0.36, -0.52], [-0.18, -0.5], [-0.68, -0.25]];
const CAP_SIDE: Pt[] = [[-0.3, 0.72], [-1.06, 0.05], [-0.86, -0.82], [-0.2, -1.1], [0.46, -1.02], [0.86, -0.62], [0.86, -0.45], [0.62, -0.46], [0.4, -0.4], [0.2, -0.2], [0.05, 0.15], [-0.06, 0.56]];
// the long mass hanging behind (front: behind both shoulders; side: down the back)
const MASS_FRONT: Pt[] = [[0, -1.06], [-1.05, -0.55], [-1.22, 0.8], [-1.28, 2.2], [-0.9, 2.6], [-0.3, 1.7], [0.3, 1.7], [0.9, 2.6], [1.28, 2.2], [1.22, 0.8], [1.05, -0.55]];
const MASS_SIDE: Pt[] = [[0.1, -1.08], [-0.92, -0.78], [-1.28, 0.2], [-1.4, 1.5], [-1.3, 2.75], [-0.72, 2.95], [-0.36, 2.25], [-0.26, 1.2], [-0.05, 0.7], [0.2, 0.0], [0.5, -0.6]];

const blendPts = (a: Pt[], z: Pt[], k: number): Pt[] => a.map((p, i) => [lerp(p[0], z[i][0], k), lerp(p[1], z[i][1], k)]);
const ptsAt = (h: HeadSpec, pts: Pt[]): Pt[] => pts.map(([u, v]) => [h.c[0] + h.s * u * h.r, h.c[1] + v * h.r]);

/** The hair mass behind the head (drawn BEHIND the torso for front views, OVER it for side views). */
const HairMass: React.FC<{h: HeadSpec}> = ({h}) => {
  const k = h.turn;
  // the front mass's 11 points vs the side mass's 11: blend
  const sw = h.sway ?? 0;
  const pts = ptsAt(h, blendPts(MASS_FRONT, MASS_SIDE, k).map(([u, v]): Pt => [u + (v > 0.8 ? sw * Math.min(1, (v - 0.8) / 1.6) : 0), v]));
  const d = smooth(pts, {closed: true, tension: 0.42});
  return (
    <>
      <Fill d={d} color={HER.hair} at={fillAt(h.at, 0.04)} seed={`${h.seed}/mass`} />
      <Ink d={d} width={h.ink * 0.8} at={b(h.at, 0.04)} open={0.12} />
    </>
  );
};

/** Two locks falling in front of the shoulders (front views only). */
const HairLocks: React.FC<{h: HeadSpec}> = ({h}) => {
  if (h.turn >= 0.55) return null;
  const k = 1 - h.turn / 0.55; // 1 at front .. 0 at 0.55
  const lock = (side: number, len: number) => {
    const P = (u: number, v: number): Pt => [h.c[0] + h.s * side * u * h.r, h.c[1] + v * h.r];
    return smooth([P(0.72, -0.2), P(1.08, 0.3), P(1.16, 1.2), P(1.2, 1.2 + len), P(0.96, 1.4 + len), P(0.86, 1.0), P(0.8, 0.4)], {closed: true, tension: 0.4});
  };
  // the face-side lock is narrower as she turns
  const back = lock(-1, 1.2);
  const front = lock(1, 0.6 + 0.6 * k);
  return (
    <>
      <Fill d={back} color={HER.hair} at={fillAt(h.at, 0.08)} seed={`${h.seed}/lockB`} />
      <Ink d={back} width={h.ink * 0.7} at={b(h.at, 0.08)} open={0.2} />
      <Fill d={front} color={HER.hair} at={fillAt(h.at, 0.08)} seed={`${h.seed}/lockF`} />
      <Ink d={front} width={h.ink * 0.7} at={b(h.at, 0.08)} open={0.2} />
    </>
  );
};

/** Head + face + hair cap (the mass and locks are separate layers). HER worried face (long hair, face 'worried': lane
 *  L3's P6 face, folded back by the assembler): the brows at full ink with a steep inner rise, drawn OVER the hair cap
 *  (the far one lower and shorter, under the hairline), the talking mouth a downturned dome on the half step most of
 *  the time, the closed mouth a heavier downturned arc. */
const Head: React.FC<{h: HeadSpec}> = ({h}) => {
  const t = useTime();
  const {c, r, s, turn, face, ink, at, seed} = h;
  const style = h.hairStyle ?? 'long';
  const herWorry = face === 'worried' && style === 'long';
  const headD = blob(c[0], c[1], r * 0.92, r, {seed: `${seed}/head`, wobble: 0.012});
  const inner = Math.max(1.8, ink * 0.62);
  // features: the face's centre line slides toward the facing side as she turns
  const fx = c[0] + s * turn * 0.6 * r;
  const ey = c[1] + 0.04 * r;
  const e = 0.3 * r * (1 - 0.42 * turn);
  const eyes: Pt[] = [[fx - s * e, ey], [fx + s * e * (1 - 0.25 * turn), ey - 0.02 * r]];
  const blink = blinking(t, seed);
  const brow = (i: number) => {
    const [x, y] = eyes[i];
    const side = i === 0 ? -1 : 1; // 0 = the eye away from the facing side
    const inX = x + s * -side * 0.13 * r; // inner end (toward the nose)
    const outX = x + s * side * 0.13 * r;
    const by = y - 0.26 * r;
    return face === 'worried'
      ? line(outX, by + 0.04 * r, inX, by - 0.1 * r, {over: [0, 0], seed: `${seed}/bw${i}`})
      : smooth([[outX, by + 0.02 * r], [x, by - 0.05 * r], [inX, by]]);
  };
  // her worried brows: the inner end 0.16 r above the outer, a slight arch; the far brow (eye 0) lower and shorter
  const worryBrow = (i: number) => {
    const [x, y] = eyes[i];
    const side = i === 0 ? -1 : 1;
    const far = i === 0;
    const half = (far ? 0.12 : 0.15) * r;
    const inX = x + s * -side * half;
    const outX = x + s * side * half;
    const by = y - (far ? 0.2 : 0.25) * r;
    return smooth([[outX, by + 0.05 * r], [(outX + inX) / 2, by - 0.025 * r], [inX, by - 0.11 * r]]);
  };
  const nose = smooth([[fx + s * 0.07 * r, ey + 0.02 * r], [fx + s * (0.2 + 0.1 * turn) * r, ey + 0.26 * r], [fx + s * 0.04 * r, ey + 0.31 * r]]);
  const mx = fx + s * 0.04 * r;
  const my = c[1] + 0.56 * r;
  const mw = 0.17 * r * (1 - 0.3 * turn);
  const step = mouthStep(t, h.talking, herWorry ? WORRY_STEPS : MOUTH_STEPS);
  let mouth: React.ReactNode;
  if (herWorry && step > 0) {
    const md = capMouth(mx, my + 0.02 * r, step === 2 ? 1.3 * mw : 1.26 * mw, step === 2 ? 0.22 * r : 0.13 * r);
    mouth = (
      <>
        <Fill d={md} color={CC.mouth} offset={false} at={fillAt(at, 0.12)} />
        <Ink d={md} width={inner * 1.1} at={b(at, 0.12)} />
      </>
    );
  } else if (herWorry) {
    const md = smooth([[mx - mw * 1.1, my + 0.08 * r], [mx - mw * 0.45, my - 0.02 * r], [mx + mw * 0.4, my - 0.02 * r], [mx + mw * 1.1, my + 0.09 * r]]);
    mouth = <Ink d={md} width={ink * 0.82} at={b(at, 0.12)} />;
  } else if (step > 0) {
    const ry = step === 2 ? 0.13 * r : 0.07 * r;
    const md = blob(mx, my + ry * 0.3, mw * 0.85, ry, {seed: `${seed}/m${step}`, wobble: 0.04});
    mouth = (
      <>
        <Fill d={md} color={CC.mouth} offset={false} at={fillAt(at, 0.12)} />
        <Ink d={md} width={inner} at={b(at, 0.12)} />
      </>
    );
  } else {
    const md =
      face === 'worried'
        ? smooth([[mx - mw, my + 0.05 * r], [mx - mw * 0.35, my - 0.03 * r], [mx + mw * 0.3, my - 0.01 * r], [mx + mw, my + 0.06 * r]])
        : smooth([[mx - mw, my - 0.02 * r], [mx, my + 0.05 * r], [mx + mw, my - 0.02 * r]]);
    mouth = <Ink d={md} width={inner} at={b(at, 0.12)} />;
  }
  const hairC = h.hairColor ?? HER.hair;
  const skin = h.skin ?? HER.skin;
  const shift = (pts: Pt[]): Pt[] => pts.map(([u, v]) => [u - turn * 0.22, v]);
  const cap =
    style === 'long'
      ? smooth(ptsAt(h, blendPts(CAP_FRONT, CAP_SIDE, turn)), {closed: true, tension: 0.4})
      : style === 'short'
        ? smooth(ptsAt(h, shift(CAP_SHORT)), {closed: true, tension: 0.4})
        : smooth(ptsAt(h, shift(TUFT)), {closed: true, tension: 0.4}) + smooth(ptsAt(h, shift(TUFT.map(([u, v]): Pt => [-u, v]))), {closed: true, tension: 0.4});
  const ears =
    style === 'long'
      ? ''
      : ellipse(...ptsAt(h, [[-0.92 - turn * 0.1, 0.12]])[0], 0.13 * r, 0.2 * r, {seed: `${seed}/earA`}) + (turn < 0.5 ? ellipse(...ptsAt(h, [[0.92 - turn * 0.3, 0.12]])[0], 0.12 * r, 0.2 * r, {seed: `${seed}/earB`}) : '');
  const earIn =
    style === 'long'
      ? ''
      : smooth(ptsAt(h, [[-0.95 - turn * 0.1, 0.02], [-0.88 - turn * 0.1, 0.12], [-0.93 - turn * 0.1, 0.22]])) + (turn < 0.5 ? smooth(ptsAt(h, [[0.95 - turn * 0.3, 0.02], [0.88 - turn * 0.3, 0.12], [0.93 - turn * 0.3, 0.22]])) : '');
  const glasses = h.glasses ? eyes.map(([x, yy], i) => ellipse(x, yy, 0.2 * r, 0.17 * r, {seed: `${seed}/gl${i}`})).join('') + line(eyes[0][0] + (eyes[1][0] > eyes[0][0] ? 0.2 : -0.2) * r, ey, eyes[1][0] - (eyes[1][0] > eyes[0][0] ? 0.2 : -0.2) * r, ey, {over: [0, 0], seed: `${seed}/br`}) : '';
  return (
    <>
      <Fill d={headD} color={skin} at={fillAt(at, 0.02)} seed={`${seed}/headF`} />
      <Ink d={headD} width={ink} at={b(at, 0.02)} open={0.08} />
      {eyes.map(([x, y], i) =>
        blink ? (
          <Ink key={i} d={line(x - 0.08 * r, y, x + 0.08 * r, y, {over: [0, 0], seed: `${seed}/bl${i}`})} width={inner} at={b(at, 0.1)} />
        ) : (
          <Fill key={i} d={blob(x, y, 0.072 * r * (i === 1 ? 1 - 0.25 * turn : 1), 0.105 * r, {seed: `${seed}/e${i}`})} color={CC.ink} offset={false} at={fillAt(at, 0.08)} />
        ),
      )}
      {herWorry ? null : <Ink d={brow(0) + brow(1)} width={inner} at={b(at, 0.1)} />}
      <Ink d={nose} width={Math.max(1.6, inner * 0.85)} at={b(at, 0.1)} />
      {mouth}
      <Fill d={cap} color={hairC} at={fillAt(at, 0.06)} seed={`${seed}/cap`} />
      <Ink d={cap} width={inner} at={b(at, 0.06)} open={0.15} />
      {herWorry ? <Ink d={worryBrow(0) + worryBrow(1)} width={ink * 1.15} at={b(at, 0.1)} /> : null}
      {ears ? <Fill d={ears} color={skin} at={fillAt(at, 0.07)} offset={false} /> : null}
      {ears ? <Ink d={ears + earIn} width={inner} at={b(at, 0.07)} /> : null}
      {glasses ? <Ink d={glasses} width={inner} at={b(at, 0.12)} /> : null}
    </>
  );
};

/** A crew-neck collar (rib) at the shoulders' centre. */
const collarD = (cx: number, y: number, w: number, s: number, turn: number) => {
  const o = s * turn * w * 0.25;
  return smooth([[cx - w + o, y - w * 0.12], [cx + o, y + w * 0.32], [cx + w + o, y - w * 0.12], [cx + w * 0.8 + o, y - w * 0.3], [cx + o, y + w * 0.08], [cx - w * 0.8 + o, y - w * 0.3]], {closed: true});
};

/** A hand: palm blob with a thumb; `grip` curls the fingers over an edge (holding a page); `open` spreads four fingers
 *  toward `dir` (a talking gesture: an open palm reads at phone size, a blob reads as a fist). */
const HandShape: React.FC<{p: Pt; r: number; dir: Pt; ink: number; at: At; seed: string; grip?: boolean; open?: boolean}> = ({p, r, dir, ink, at, seed, grip, open}) => {
  const d = blob(p[0], p[1], r * 1.05, r * 0.92, {seed: `${seed}/palm`, wobble: 0.05});
  const n: Pt = [-dir[1], dir[0]];
  const thumb = smooth([add(p, n, r * 0.7), add(add(p, n, r * 1.15), dir, r * 0.4), add(add(p, n, r * 0.8), dir, r * 0.95)]);
  const knuckles = grip ? smooth([add(add(p, n, -r * 0.6), dir, r * 0.5), add(p, dir, r * 0.75), add(add(p, n, r * 0.4), dir, r * 0.62)]) : '';
  const fingers = open
    ? [-0.55, -0.18, 0.18, 0.52]
        .map((k, i) => {
          const a = Math.atan2(dir[1], dir[0]) + k * 0.75;
          const u: Pt = [Math.cos(a), Math.sin(a)];
          const base = add(p, u, r * 0.7);
          return tube([base, add(base, u, r * (i === 0 ? 0.75 : 1.0))], [r * 0.42, r * 0.36]);
        })
        .join('')
    : '';
  return (
    <>
      {open ? <Fill d={fingers} color={HER.skin} at={fillAt(at, 0.1)} offset={false} /> : null}
      {open ? <Ink d={fingers} width={ink * 0.6} at={b(at, 0.1)} /> : null}
      <Fill d={d} color={HER.skin} at={fillAt(at, 0.1)} seed={`${seed}/palmF`} />
      <Ink d={d} width={ink * 0.75} at={b(at, 0.1)} open={0.15} />
      <Ink d={thumb + knuckles} width={Math.max(1.6, ink * 0.55)} at={b(at, 0.12)} />
    </>
  );
};

/** A sleeve from the shoulder through the elbow to the wrist, with a rib cuff; the hand at the end. */
const Sleeve: React.FC<{A: Pt; E: Pt; Z: Pt; w: number; ink: number; at: At; seed: string; color?: string}> = ({A, E, Z, w, ink, at, seed, color = HER.sweater}) => {
  const dz: Pt = [Z[0] - E[0], Z[1] - E[1]];
  const l = Math.hypot(dz[0], dz[1]) || 1;
  const u: Pt = [dz[0] / l, dz[1] / l];
  const wrist = add(Z, u, -w * 0.45);
  const d = tube([A, E, wrist], [w * 1.08, w, w * 0.86]);
  const cuffA = add(wrist, u, -w * 0.42);
  const cuff = tube([cuffA, wrist], [w * 0.9, w * 0.88]);
  return (
    <>
      <Fill d={d} color={color} at={fillAt(at, 0.06)} seed={`${seed}/sl`} />
      <Fill d={cuff} color={HER.rib} at={fillAt(at, 0.07)} offset={false} />
      <Ink d={d} width={ink * 0.85} at={b(at, 0.06)} open={0.1} />
    </>
  );
};

// ---------------------------------------------------------------- standing (P2)

export type HerStandingProps = HerBase & {
  face?: HerFace;
  talking?: Talking;
  /** 0 front .. 1 profile (default 0.3: 3/4 toward `facing`). */
  turn?: number;
  /** Hands (canvas px). Default: the board's 'hold' pose (both hands up in front, toward `facing`). */
  hands?: [Pt, Pt];
  /** The fingers curl over an edge (holding her contract up). Default true when hands are given. */
  grip?: boolean;
  /** Her lanyard + badge on the chest (she quit: default off). */
  lanyard?: boolean;
  /** The held prop (her contract): drawn over her arms and under her fingers; it moves with her hands' fidget. */
  children?: React.ReactNode;
  /** Idle life (default true): breath, blink, hair sway, a hand fidget (the held prop moves with it). */
  life?: boolean;
};

export const HerStanding: React.FC<HerStandingProps> = ({x, y, h, facing = 'r', face = 'calm', talking, turn = 0.3, hands, grip, lanyard = false, at, seed = 'herStand', ink: inkP, children, life = true}) => {
  const t = useTime();
  const s = facing === 'r' ? 1 : -1;
  const r = 0.09 * h;
  const ink = inkP ?? inkForHead(r);
  const bob = life ? Math.sin(t * 1.8) * 0.002 * h : 0;
  const P = (u: number, v: number): Pt => [x + s * u * h, y - v * h + bob];
  const H0 = P(0.01, 0.905);
  const H: Pt = [H0[0], H0[1] + talkNod(t, talking, r)];
  const head: HeadSpec = {c: H, r, s, turn, face, talking, ink, at, seed, sway: life ? hairSway(t, seed) : 0};
  const fg = life ? fidget(t, seed, 0.006 * h) : ([0, 0] as Pt);
  const shY = y - 0.77 * h + bob;
  const cx = x + s * 0.0 * h;
  const sw = 0.105 * h; // shoulder half-width
  const off = -s * turn * 0.012 * h; // the turn shifts the torso's mass back a little
  const torso = smooth(
    [
      [cx - sw * 0.35 + off, shY - 0.01 * h],
      [cx - sw * 0.85 + off, shY + 0.004 * h],
      [cx - sw + off, shY + 0.04 * h],
      [cx - 0.088 * h + off, y - 0.62 * h],
      [cx - 0.092 * h + off, y - 0.47 * h],
      [cx + 0.092 * h + off, y - 0.47 * h],
      [cx + 0.088 * h + off, y - 0.62 * h],
      [cx + sw + off, shY + 0.04 * h],
      [cx + sw * 0.85 + off, shY + 0.004 * h],
      [cx + sw * 0.35 + off, shY - 0.01 * h],
    ],
    {closed: true, tension: 0.35},
  );
  const hem = polyPath([[cx - 0.093 * h + off, y - 0.5 * h], [cx + 0.093 * h + off, y - 0.5 * h], [cx + 0.092 * h + off, y - 0.465 * h], [cx - 0.092 * h + off, y - 0.465 * h]]);
  // legs: hips -> knees -> feet (trousers), shoes
  const leg = (side: number) => {
    const hip = P(side * 0.045, 0.48);
    const knee = P(side * 0.05, 0.24);
    const foot = P(side * 0.065, 0.025);
    return tube([hip, knee, foot], [0.085 * h, 0.07 * h, 0.06 * h]);
  };
  const shoe = (side: number) => {
    const f = P(side * 0.065, 0);
    return roundRect(f[0] - 0.035 * h + s * 0.015 * h, f[1] - 0.04 * h, 0.085 * h, 0.04 * h, 0.018 * h);
  };
  // arms: shoulders -> elbows (two-bone reach) -> hands
  const handsP0: [Pt, Pt] = hands ?? [P(0.19, 0.64), P(0.22, 0.67)];
  const handsP: [Pt, Pt] = [add(handsP0[0], fg), add(handsP0[1], fg)];
  const shL: Pt = [cx - s * sw * 0.86 + off, shY + 0.025 * h];
  const shR: Pt = [cx + s * sw * 0.86 + off, shY + 0.025 * h];
  const l1 = 0.17 * h;
  const l2 = 0.16 * h;
  const E0 = elbow(shL, handsP[0], l1, l2, s);
  const E1 = elbow(shR, handsP[1], l1, l2, s);
  const aw = 0.058 * h;
  const neckD = polyPath([[H[0] - 0.33 * r, H[1] + 0.7 * r], [H[0] + 0.33 * r, H[1] + 0.7 * r], [H[0] + 0.36 * r, shY + 0.01 * h], [H[0] - 0.36 * r, shY + 0.01 * h]]);
  const dirOf = (E: Pt, Z: Pt): Pt => {
    const l = Math.hypot(Z[0] - E[0], Z[1] - E[1]) || 1;
    return [(Z[0] - E[0]) / l, (Z[1] - E[1]) / l];
  };
  return (
    <>
      <HairMass h={head} />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <Fill d={leg(side)} color={HER.trousers} at={fillAt(at)} seed={`${seed}/leg${side}`} />
          <Ink d={leg(side)} width={ink * 0.8} at={at} open={0.1} />
          <Fill d={shoe(side)} color={HER.shoe} at={fillAt(at, 0.02)} offset={false} />
        </React.Fragment>
      ))}
      <Fill d={torso} color={HER.sweater} at={fillAt(at)} seed={`${seed}/torso`} />
      <Fill d={hem} color={HER.rib} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={torso} width={ink} at={at} open={0.05} />
      <Fill d={neckD} color={HER.skin} at={fillAt(at, 0.02)} offset={false} />
      <Fill d={collarD(H[0], shY, 0.36 * r * 1.6, s, turn)} color={HER.rib} at={fillAt(at, 0.03)} offset={false} />
      {lanyard ? <Badge x={cx + s * 0.03 * h + off} y={shY + 0.12 * h} w={Math.max(40, 0.075 * h)} strap={[[H[0] - 0.4 * r, shY + 0.005 * h], [H[0] + 0.4 * r, shY + 0.005 * h]]} at={b(at, 0.1)} seed={`${seed}/badge`} /> : null}
      <Head h={head} />
      <HairLocks h={head} />
      <Sleeve A={shL} E={E0} Z={handsP[0]} w={aw} ink={ink} at={at} seed={`${seed}/a0`} />
      <Sleeve A={shR} E={E1} Z={handsP[1]} w={aw} ink={ink} at={at} seed={`${seed}/a1`} />
      {children ? <XG m={mat.translate(fg[0], fg[1])}>{children}</XG> : null}
      <HandShape p={handsP[0]} r={0.034 * h} dir={dirOf(E0, handsP[0])} ink={ink} at={at} seed={`${seed}/h0`} grip={grip ?? !!hands} />
      <HandShape p={handsP[1]} r={0.034 * h} dir={dirOf(E1, handsP[1])} ink={ink} at={at} seed={`${seed}/h1`} grip={grip ?? !!hands} />
    </>
  );
};

// ---------------------------------------------------------------- seated at her desk, facing the mic (P4, P13, P6)

export type HerSeatedProps = HerBase & {
  /** 'side' = 3/4 side (P4, P13); 'front34' = medium close 3/4 front (P6). */
  view?: 'side' | 'front34';
  face?: HerFace;
  talking?: Talking;
  /** Override the turn (side 0.72, front34 0.32). */
  turn?: number;
  /** Hands (canvas px). Default: the REST pose: forearms resting on the desk, elbows down, hands open near the mic. */
  hands?: [Pt, Pt];
  /** Elbows (canvas px; default: under the shoulders, at / below the desk top: an elbow break, never an IK loop). */
  elbows?: [Pt, Pt];
  /** Time windows (scene s) of the worried fist clutch (both hands together at the chest): keep it for ONE beat. */
  clutch?: [number, number][];
  /** While talking, the near hand rises open to gesture (every ~2.4 s for ~0.9 s; default true). */
  gesture?: boolean;
  lanyard?: boolean;
  /** Draw the legs (default true; P6 shows only the shins under the desk). */
  legs?: boolean;
  /** 'all' (default) | 'body' (hair, legs, torso, head: draw it BEHIND the desk) | 'arms' (the sleeves and hands that
   *  rest ON the desk: draw them after it). P6: <NookAngle behind={<HerSeated part="body"/>}> <HerSeated part="arms"/>. */
  part?: 'all' | 'body' | 'arms';
  /** Idle life (default true): breath, blink, hair sway, a hand fidget, a nod and a gesture while talking. */
  life?: boolean;
};

/** Her seated hands / elbows in figure units (u toward `facing`, v up from the ground, x h): rest, gesture, clutch. */
const SEAT_POSE = {
  side: {
    rest: {hands: [[0.17, 0.52], [0.2, 0.515]], elbows: [[0.03, 0.455], [0.05, 0.45]]},
    gesture: [0.15, 0.62],
    clutch: {hands: [[0.12, 0.53], [0.14, 0.545]], elbows: [[0.02, 0.44], [0.06, 0.445]]},
  },
  front34: {
    rest: {hands: [[0.02, 0.405], [0.2, 0.42]], elbows: [[-0.085, 0.455], [0.115, 0.455]]},
    gesture: [0.19, 0.53],
    clutch: {hands: [[0.05, 0.47], [0.1, 0.46]], elbows: [[-0.08, 0.43], [0.12, 0.43]]},
  },
} as const;

export const HerSeated: React.FC<HerSeatedProps> = ({x, y, h, facing = 'r', view = 'side', face = 'calm', talking, turn: turnP, hands, elbows, clutch, gesture = true, lanyard = false, legs = true, part = 'all', at, seed = 'herSeat', ink: inkP, life = true}) => {
  const t = useTime();
  const s = facing === 'r' ? 1 : -1;
  const r = 0.09 * h;
  const ink = inkP ?? inkForHead(r);
  const front = view === 'front34';
  const turn = turnP ?? (front ? 0.32 : 0.72);
  const bob = life ? Math.sin(t * 1.6) * 0.0018 * h : 0;
  const P = (u: number, v: number): Pt => [x + s * u * h, y - v * h];
  const Pb = (u: number, v: number): Pt => [x + s * u * h, y - v * h + bob];
  const H0 = Pb(0.04, 0.755);
  const H: Pt = [H0[0], H0[1] + (life ? talkNod(t, talking, r) : 0)];
  const head: HeadSpec = {c: H, r, s, turn, face, talking, ink, at, seed, sway: life ? hairSway(t, seed) : 0};
  const fg = life ? fidget(t, seed, 0.005 * h) : ([0, 0] as Pt);
  const S = Pb(0.02, 0.62);
  const Hp = P(-0.02, 0.33);
  // torso: side = a bean along the line of action (chest forward); front34 = a wider bean, turned
  const torso = front
    ? smooth(
        [
          [S[0] - s * 0.04 * h, S[1] - 0.012 * h],
          [S[0] - s * 0.1 * h, S[1] + 0.004 * h],
          [S[0] - s * 0.118 * h, S[1] + 0.05 * h],
          [Hp[0] - s * 0.098 * h, Hp[1] - 0.12 * h],
          [Hp[0] - s * 0.1 * h, Hp[1] + 0.01 * h],
          [Hp[0] + s * 0.09 * h, Hp[1] + 0.01 * h],
          [Hp[0] + s * 0.085 * h, Hp[1] - 0.12 * h],
          [S[0] + s * 0.105 * h, S[1] + 0.05 * h],
          [S[0] + s * 0.09 * h, S[1] + 0.004 * h],
          [S[0] + s * 0.04 * h, S[1] - 0.012 * h],
        ],
        {closed: true, tension: 0.35},
      )
    : smooth(
        [
          [S[0] - s * 0.02 * h, S[1] - 0.015 * h],
          [S[0] - s * 0.07 * h, S[1] + 0.012 * h],
          [S[0] - s * 0.078 * h, S[1] + 0.09 * h],
          [Hp[0] - s * 0.07 * h, Hp[1] - 0.08 * h],
          [Hp[0] - s * 0.078 * h, Hp[1] + 0.012 * h],
          [Hp[0] + s * 0.07 * h, Hp[1] + 0.02 * h],
          [Hp[0] + s * 0.068 * h, Hp[1] - 0.1 * h],
          [S[0] + s * 0.082 * h, S[1] + 0.1 * h],
          [S[0] + s * 0.07 * h, S[1] + 0.02 * h],
          [S[0] + s * 0.03 * h, S[1] - 0.012 * h],
        ],
        {closed: true, tension: 0.35},
      );
  const hemY = Hp[1] - 0.03 * h;
  const hw = front ? 0.1 * h : 0.078 * h;
  const hem = polyPath([[Hp[0] - s * hw, hemY], [Hp[0] + s * hw * 0.92, hemY], [Hp[0] + s * hw * 0.92, Hp[1] + 0.012 * h], [Hp[0] - s * hw, Hp[1] + 0.012 * h]]);
  // legs: thighs forward, shins down; the far leg first (one step darker: the rib shade on trousers is not used)
  const legD = (k: number) => {
    const hip = P(-0.01 + 0.03 * k, 0.33);
    const knee = P(0.18 + 0.03 * k, 0.33 - 0.01 * k);
    const foot = P(0.17 + 0.04 * k, 0.03);
    return {d: tube([hip, knee, foot], [0.1 * h, 0.075 * h, 0.06 * h]), foot};
  };
  const shoeD = (f: Pt) => roundRect(Math.min(f[0] - 0.03 * h, f[0] + s * 0.09 * h), f[1] - 0.012 * h, 0.12 * h, 0.042 * h, 0.02 * h);
  // arms: shoulder -> elbow (down, at or below the desk top) -> hand (open, resting on the desk near the mic). The
  // elbows are PLACED (an elbow break), never solved, so an arm can't loop. While talking the near hand rises open to
  // gesture; in a `clutch` window both fists come together at the chest (the one worried beat).
  const SP = SEAT_POSE[front ? 'front34' : 'side'];
  const clutching = !!clutch && clutch.some(([a, z]) => t >= a && t < z);
  const gper = 2.4 + rand(seed, 'gper') * 0.5;
  const gu = loopT(Math.floor(t * 12) / 12, gper, rand(seed, 'gph') * gper);
  const gk = life && gesture && !clutching && !hands && talkingAt(t, talking) && gu < 0.9 ? Math.sin((Math.min(gu, 0.9) / 0.9) * Math.PI) : 0;
  const pose = clutching ? SP.clutch : SP.rest;
  const PU = (q: readonly [number, number]): Pt => P(q[0], q[1]);
  const restNear = PU(pose.hands[1]);
  const gestNear = PU(SP.gesture);
  const handsP0: [Pt, Pt] = hands ?? [PU(pose.hands[0]), [lerp(restNear[0], gestNear[0], gk), lerp(restNear[1], gestNear[1], gk)]];
  const handsP: [Pt, Pt] = [handsP0[0], add(handsP0[1], fg, gk > 0 ? 0 : 1)];
  const shBack: Pt = front ? [S[0] - s * 0.09 * h, S[1] + 0.03 * h] : [S[0] - s * 0.01 * h, S[1] + 0.025 * h];
  const shFront: Pt = front ? [S[0] + s * 0.085 * h, S[1] + 0.03 * h] : [S[0] + s * 0.035 * h, S[1] + 0.03 * h];
  const E0: Pt = elbows ? elbows[0] : hands ? elbow(shBack, handsP[0], 0.16 * h, 0.15 * h, -s) : PU(pose.elbows[0]);
  const E1: Pt = elbows ? elbows[1] : hands ? elbow(shFront, handsP[1], 0.16 * h, 0.15 * h, -s) : PU(pose.elbows[1]);
  const aw = 0.056 * h;
  const neckD = polyPath([[H[0] - 0.32 * r, H[1] + 0.7 * r], [H[0] + 0.32 * r, H[1] + 0.7 * r], [H[0] + 0.36 * r + s * 0.01 * h, S[1] + 0.01 * h], [H[0] - 0.36 * r + s * 0.01 * h, S[1] + 0.01 * h]]);
  const dirOf = (E: Pt, Z: Pt): Pt => {
    const l = Math.hypot(Z[0] - E[0], Z[1] - E[1]) || 1;
    return [(Z[0] - E[0]) / l, (Z[1] - E[1]) / l];
  };
  const massOver = turn >= 0.5;
  const L0 = legD(0);
  const L1 = legD(1);
  const B = part !== 'arms';
  const A = part !== 'body';
  return (
    <>
      {B && !massOver ? <HairMass h={head} /> : null}
      {B && legs ? (
        <>
          {[L0, L1].map((L, i) => (
            <React.Fragment key={i}>
              <Fill d={L.d} color={HER.trousers} at={fillAt(at)} seed={`${seed}/leg${i}`} />
              <Ink d={L.d} width={ink * 0.8} at={at} open={0.08} />
              <Fill d={shoeD(L.foot)} color={HER.shoe} at={fillAt(at, 0.02)} offset={false} />
            </React.Fragment>
          ))}
        </>
      ) : null}
      {/* the arm on the far side goes behind the torso in the side view */}
      {B && !front ? <Sleeve A={shBack} E={E0} Z={handsP[0]} w={aw} ink={ink} at={at} seed={`${seed}/a0`} color={HER.rib} /> : null}
      {B ? (
        <>
          <Fill d={torso} color={HER.sweater} at={fillAt(at)} seed={`${seed}/torso`} />
          <Fill d={hem} color={HER.rib} at={fillAt(at, 0.02)} offset={false} />
          <Ink d={torso} width={ink} at={at} open={0.05} />
          <Fill d={neckD} color={HER.skin} at={fillAt(at, 0.02)} offset={false} />
          <Fill d={collarD(H[0] + s * 0.008 * h, S[1], 0.36 * r * 1.55, s, turn)} color={HER.rib} at={fillAt(at, 0.03)} offset={false} />
          {lanyard ? <Badge x={S[0] + s * 0.03 * h} y={S[1] + 0.12 * h} w={Math.max(40, 0.075 * h)} strap={[[H[0] - 0.35 * r, S[1] + 0.004 * h], [H[0] + 0.35 * r, S[1] + 0.004 * h]]} at={b(at, 0.1)} seed={`${seed}/badge`} /> : null}
          {massOver ? <HairMass h={head} /> : null}
          <Head h={head} />
          <HairLocks h={head} />
        </>
      ) : null}
      {A ? (
        <>
          {front ? <Sleeve A={shBack} E={E0} Z={handsP[0]} w={aw} ink={ink} at={at} seed={`${seed}/a0`} /> : null}
          <HandShape p={handsP[0]} r={0.032 * h} dir={dirOf(E0, handsP[0])} ink={ink} at={at} seed={`${seed}/h0`} grip={clutching} />
          <Sleeve A={shFront} E={E1} Z={handsP[1]} w={aw} ink={ink} at={at} seed={`${seed}/a1`} />
          <HandShape p={handsP[1]} r={0.032 * h} dir={gk > 0.3 ? [s * 0.35, -0.94] : dirOf(E1, handsP[1])} ink={ink} at={at} seed={`${seed}/h1`} grip={clutching} open={gk > 0.3} />
        </>
      ) : null}
    </>
  );
};

/** Where her mouth is (canvas px), for a bubble's tail: the same numbers the model draws with. */
export const herMouth = (p: {x: number; y: number; h: number; facing?: Facing; view?: 'side' | 'front34' | 'stand'}): Pt => {
  const s = (p.facing ?? 'r') === 'r' ? 1 : -1;
  const r = 0.09 * p.h;
  const stand = p.view === 'stand';
  const turn = p.view === 'front34' ? 0.32 : stand ? 0.3 : 0.72;
  const H: Pt = stand ? [p.x + s * 0.01 * p.h, p.y - 0.905 * p.h] : [p.x + s * 0.04 * p.h, p.y - 0.755 * p.h];
  return [H[0] + s * (turn * 0.6 + 0.04) * r, H[1] + 0.56 * r];
};

// ---------------------------------------------------------------- over the shoulder, from behind (P5)

export type HerBackProps = HerBase & {
  /** The hand on the laptop (canvas px). Default: the board's sit-pose hand. */
  hand?: Pt;
  /** Her chair's back across her waist (default true): a wooden top rail, a lower rail, the posts and a centre slat. */
  chair?: boolean;
  /** Idle life (default true): breath, the hair's sway, the hand's fidget (typing). */
  life?: boolean;
};

export const HerBack: React.FC<HerBackProps> = ({x, y, h, facing = 'r', hand, chair = true, at, seed = 'herBack', ink: inkP, life = true}) => {
  const t = useTime();
  const swh = life ? hairSway(t, seed) * 1.4 : 0;
  const fgb0 = life ? fidget(t, seed, 0.008 * h) : ([0, 0] as Pt);
  // typing: the hand taps in bursts (0.6 s every 1.4 s, stepped at 8 drawings / s); the head dips to the screen and back
  const tt8 = Math.floor(t * 8) / 8;
  const burst = life && ((tt8 % 1.4) + 1.4) % 1.4 < 0.6;
  const tap = burst ? (Math.floor(t * 8) % 2) * 0.007 * h : 0;
  const fgb: Pt = [fgb0[0], fgb0[1] + tap];
  const dip = life ? Math.max(0, Math.sin(((t % 3.3) / 3.3) * Math.PI * 2)) * 0.008 * h : 0;
  const s = facing === 'r' ? 1 : -1;
  const r = 0.09 * h;
  const ink = inkP ?? inkForHead(r);
  const bob = Math.sin(t * 1.6) * 0.0015 * h;
  const P = (u: number, v: number): Pt => [x + s * u * h, y - v * h + bob];
  const H0 = P(0.04, 0.755);
  const H: Pt = [H0[0], H0[1] + dip];
  const S = P(0.02, 0.62);
  const bottom = y + 0.4 * h;
  // the back: broad shoulders, straight down past the frame (and the left edge)
  const torso = smooth(
    [
      [S[0] - s * 0.03 * h, S[1] - 0.02 * h],
      [S[0] - s * 0.1 * h, S[1] - 0.005 * h],
      [S[0] - s * 0.135 * h, S[1] + 0.04 * h],
      [S[0] - s * 0.15 * h, S[1] + 0.25 * h],
      [S[0] - s * 0.15 * h, bottom],
      [S[0] + s * 0.13 * h, bottom],
      [S[0] + s * 0.135 * h, S[1] + 0.25 * h],
      [S[0] + s * 0.125 * h, S[1] + 0.04 * h],
      [S[0] + s * 0.09 * h, S[1] - 0.005 * h],
      [S[0] + s * 0.03 * h, S[1] - 0.02 * h],
    ],
    {closed: true, tension: 0.35},
  );
  // the arm toward the laptop: upper arm down the side, the forearm reaching forward (up the frame) to the hand
  const Z: Pt = add(hand ?? P(0.21, 0.47), fgb);
  const A: Pt = [S[0] + s * 0.105 * h, S[1] + 0.035 * h];
  const E: Pt = [A[0] + s * 0.06 * h, A[1] + 0.2 * h];
  const aw = 0.075 * h;
  // head: the back of it, turned a little toward the laptop (a sliver of cheek on the facing side, no face)
  const headD = blob(H[0], H[1], r * 0.92, r, {seed: `${seed}/head`, wobble: 0.012});
  const hair = smooth(
    (
      [
        [0.3, -1.06],
        [-0.6, -0.96],
        [-1.08, -0.3],
        [-1.16, 0.8],
        [-1.22, 2.2],
        [-1.06, 3.3],
        [-0.4, 3.55],
        [0.35, 3.3],
        [0.88, 2.4],
        [0.92, 1.2],
        [0.66, 0.55],
        [0.7, -0.05],
        [0.86, -0.6],
      ] as Pt[]
    ).map(([u, v]): Pt => [H[0] + s * (u + (v > 1 ? swh * Math.min(1, (v - 1) / 2) : 0)) * r, H[1] + v * r]),
    {closed: true, tension: 0.42},
  );
  const strands = [0.1, -0.35, -0.75].map((u, i) => smooth(([[u + 0.1, -0.7], [u - 0.05, 0.6], [u - 0.02, 2.0], [u + 0.08, 3.0 - i * 0.2]] as Pt[]).map(([uu, v]): Pt => [H[0] + s * uu * r, H[1] + v * r]))).join('');
  // a group of lit strands on the lamp side (the lamp is ahead of her, toward `facing`), swaying with the mass
  const hiStrands = [0.42, 0.55, 0.66, 0.3]
    .map((u, i) => smooth(([[u - 0.05, -0.62 + i * 0.05], [u + 0.04, 0.2], [u - 0.02 + swh * 0.4, 1.4], [u - 0.12 + swh * 0.8, 2.3 - i * 0.25]] as Pt[]).map(([uu, v]): Pt => [H[0] + s * uu * r, H[1] + v * r])))
    .join('');
  // the sweater's shadow side (away from the lamp) and its folds: shoulder blade, the armpit crease, the sleeve's
  // crease at the elbow, a drag line down the back
  const shadowSide = smooth(
    [
      [S[0] - s * 0.1 * h, S[1] - 0.004 * h],
      [S[0] - s * 0.136 * h, S[1] + 0.04 * h],
      [S[0] - s * 0.152 * h, S[1] + 0.25 * h],
      [S[0] - s * 0.152 * h, bottom],
      [S[0] - s * 0.07 * h, bottom],
      [S[0] - s * 0.075 * h, S[1] + 0.3 * h],
      [S[0] - s * 0.095 * h, S[1] + 0.1 * h],
      [S[0] - s * 0.08 * h, S[1] + 0.02 * h],
    ],
    {closed: true, tension: 0.35},
  );
  const folds = [
    smooth([[S[0] - s * 0.06 * h, S[1] + 0.07 * h], [S[0] - s * 0.025 * h, S[1] + 0.15 * h], [S[0] + s * 0.005 * h, S[1] + 0.24 * h]]),
    smooth([[S[0] + s * 0.105 * h, S[1] + 0.12 * h], [S[0] + s * 0.07 * h, S[1] + 0.2 * h], [S[0] + s * 0.06 * h, S[1] + 0.3 * h]]),
    smooth([[S[0] - s * 0.01 * h, S[1] + 0.34 * h], [S[0] + s * 0.02 * h, S[1] + 0.45 * h], [S[0] + s * 0.01 * h, S[1] + 0.56 * h]]),
    smooth([[E[0] - s * 0.025 * h, E[1] - 0.02 * h], [E[0] + s * 0.005 * h, E[1] + 0.01 * h], [E[0] + s * 0.035 * h, E[1] - 0.005 * h]]),
  ].join('');
  const dz: Pt = [Z[0] - E[0], Z[1] - E[1]];
  const dl = Math.hypot(dz[0], dz[1]) || 1;
  // her chair's back, across her waist (between the camera and her): top rail, lower rail, two posts, a centre slat
  const cTop = S[1] + 0.5 * h;
  const cx0 = S[0] - s * 0.2 * h;
  const cx1 = S[0] + s * 0.17 * h;
  const cl = Math.min(cx0, cx1);
  const cr = Math.max(cx0, cx1);
  const cw = cr - cl;
  const rail = (y0: number, hh: number) => roundRect(cl, y0, cw, hh, hh * 0.4);
  const post = (px: number) => roundRect(px - 0.016 * h, cTop + 0.02 * h, 0.032 * h, 2200 - cTop, 0.012 * h);
  const chairD = rail(cTop, 0.055 * h) + rail(cTop + 0.17 * h, 0.04 * h);
  const postsD = post(cl + cw * 0.06) + post(cl + cw * 0.94) + roundRect(cl + cw * 0.46, cTop + 0.05 * h, cw * 0.1, 0.13 * h, 0.01 * h);
  return (
    <>
      <Fill d={torso} color={HER.sweater} at={fillAt(at)} seed={`${seed}/torso`} />
      <Fill d={shadowSide} color={HER.rib} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={folds} width={Math.max(2.2, ink * 0.55)} color={HER.rib} at={b(at, 0.06)} />
      <Ink d={torso} width={ink} at={at} open={0.05} />
      <Sleeve A={A} E={E} Z={Z} w={aw} ink={ink} at={at} seed={`${seed}/arm`} />
      <HandShape p={Z} r={0.034 * h} dir={[dz[0] / dl, dz[1] / dl]} ink={ink} at={at} seed={`${seed}/hand`} />
      <Fill d={headD} color={HER.skin} at={fillAt(at, 0.02)} seed={`${seed}/headF`} />
      <Ink d={headD} width={ink} at={b(at, 0.02)} open={0.1} />
      <Fill d={hair} color={HER.hair} at={fillAt(at, 0.04)} seed={`${seed}/hair`} />
      <Ink d={hair} width={ink * 0.8} at={b(at, 0.04)} open={0.1} />
      <Ink d={strands} width={Math.max(1.6, ink * 0.4)} color={HER.hairShade} at={b(at, 0.08)} />
      <Ink d={hiStrands} width={Math.max(2.4, ink * 0.75)} color={CC.hairHi} at={b(at, 0.08)} />
      {chair ? (
        <>
          <Fill d={postsD} color={CC.chairShade} at={fillAt(at, 0.04)} seed={`${seed}/posts`} />
          <Ink d={postsD} width={ink * 0.8} at={b(at, 0.04)} />
          <Fill d={chairD} color={CC.chair} at={fillAt(at, 0.04)} seed={`${seed}/chair`} />
          <Ink d={chairD} width={ink * 0.85} at={b(at, 0.04)} />
          <Ink d={hline2(cl + 12, cr - 12, cTop + 0.016 * h)} width={Math.max(1.6, ink * 0.35)} color={CC.chairShade} at={b(at, 0.08)} />
        </>
      ) : null}
    </>
  );
};

const hline2 = (x0: number, x1: number, y: number) => line(x0, y, x1, y, {over: [0, 0], seed: `hl${x0.toFixed(0)}`});

// ---------------------------------------------------------------- her sleeve + hand (O1, P12: the style frame's Arm)

export type HerArmProps = {
  /** The highlighter's tip (canvas px). */
  tip: Pt;
  /** How far the sleeve runs back toward her (px; the style frame 820, the opening's glide 1040). */
  reach?: number;
  /** 'highlighter' (O1 / P12) | 'none' (an empty fist). */
  holding?: 'highlighter' | 'none';
  /** The marker's axis (deg, from the tip toward her hand) and the forearm's direction (deg, toward her). */
  axis?: number;
  forearm?: number;
  at?: At;
  seed?: string;
};

export const HerArm: React.FC<HerArmProps> = ({tip, reach = 820, holding = 'highlighter', axis = 112, forearm = 121, at, seed = 'herArm'}) => {
  const u = dirDeg(axis);
  const v = dirDeg(forearm);
  const pv: Pt = [-v[1], v[0]];
  const Wc = add(tip, u, 188); // the cuff
  const C1 = add(Wc, v, reach);
  const mid = add(Wc, v, 400);
  const sideA: Pt[] = [add(Wc, pv, 62), add(mid, pv, 96), add(C1, pv, 112)];
  const sideB: Pt[] = [add(Wc, pv, -62), add(mid, pv, -90), add(C1, pv, -104)];
  const sleeve = smooth([...sideA, ...[...sideB].reverse()], {closed: true, tension: 0.35});
  const cuff2 = add(Wc, v, 34);
  const fold = (k: number, sd: number, l: number) => {
    const c = add(add(Wc, v, k), pv, sd);
    return line(...c, ...add(c, v, l), {over: [0, 0], seed: `${seed}/fold${k}`});
  };
  const a = (dt: number) => b(at, dt);
  const f = (dt: number) => fillAt(at, dt);
  return (
    <>
      <Fill d={sleeve} color={HER.sweater} seed={`${seed}/sleeve`} at={f(0)} />
      <Ink d={smooth(sideA) + smooth(sideB)} width={W.front} at={a(0)} />
      <Ink d={line(...add(Wc, pv, 62), ...add(Wc, pv, -62), {seed: `${seed}/cuf1`, over: [3, 3]}) + line(...add(cuff2, pv, 64), ...add(cuff2, pv, -64), {seed: `${seed}/cuf2`, over: [0, 0]})} width={W.mid} at={a(0.04)} />
      <Ink d={fold(150, 30, 70) + fold(250, -20, 90) + fold(330, 46, 60)} width={W.far} at={a(0.06)} />
      <XG m={mat.compose(mat.translate(tip[0], tip[1]), mat.rotate(axis))}>
        <Fill d={roundRect(150, -34, 56, 66, 26)} color={HER.skin} seed={`${seed}/wrist`} at={f(0.04)} />
        <Ink d={line(156, -34, 200, -36, {seed: `${seed}/wr1`, over: [0, 0]}) + line(156, 32, 200, 30, {seed: `${seed}/wr2`, over: [0, 0]})} width={W.mid} at={a(0.04)} />
        {holding === 'highlighter' ? (
          <>
            <Fill d={polyPath([[0, -5], [18, -12], [18, 12], [0, 5]])} color={CC.pop} offset={false} at={f(0.06)} />
            <Fill d={roundRect(18, -15, 152, 30, 8)} color={CC.anchor} seed={`${seed}/hlb`} at={f(0.06)} />
            <Fill rect={[30, -15, 8, 30]} color={CC.badge} offset={false} at={f(0.07)} />
            <Ink d={roundRect(18, -15, 152, 30, 8, {seed: `${seed}/hlbI`}) + polyPath([[18, -12], [0, -5], [0, 5], [18, 12]]).replace('Z', '')} width={W.mid} at={a(0.06)} />
          </>
        ) : null}
        <Fill d={roundRect(84, -46, 94, 90, 32)} color={HER.skin} seed={`${seed}/fist`} at={f(0.08)} />
        <Ink d={roundRect(84, -46, 94, 90, 32, {seed: `${seed}/fistI`})} width={W.front} at={a(0.08)} />
        {[88, 110, 132, 154].map((fx, i) => (
          <React.Fragment key={i}>
            <Fill d={roundRect(fx, -62, 24, 36, 12)} color={HER.skin} seed={`${seed}/fg${i}`} at={f(0.1)} />
            <Ink d={roundRect(fx, -62, 24, 36, 12, {seed: `${seed}/fgI${i}`, closed: false})} width={W.mid} at={a(0.1)} />
          </React.Fragment>
        ))}
        <Fill d={roundRect(58, 6, 80, 32, 16)} color={HER.skin} seed={`${seed}/thumb`} at={f(0.1)} />
        <Ink d={roundRect(58, 6, 80, 32, 16, {seed: `${seed}/thumbI`, closed: false})} width={W.front} at={a(0.1)} />
        <Fill d={roundRect(63, 12, 20, 20, 8)} color={CC.nail} offset={false} at={f(0.12)} />
        <Ink d={roundRect(63, 12, 20, 20, 8, {seed: `${seed}/tnail`})} width={W.hair} at={a(0.12)} />
      </XG>
    </>
  );
};

/** For lanes that draw their own head-and-shoulders: the shared head (face + cap) and hair layers. */
export const HerHeadParts = {Head, HairMass, HairLocks};
export type {HeadSpec};
