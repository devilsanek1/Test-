// kit/Pip3.tsx: the living character, Pip (the channel's elephant, src/lib/mascot), redrawn in Autumn Ember
// (docs/v3/density_plan_g5b.md §0, docs/look/LIFE_AND_DENSITY.md §5). One actor in every shot: it perches by the
// subject and watches, points the eye (its head turns a few frames before the voice names the next thing), reacts on a
// stressed word (one big reaction per shot), idles always (blink, ears, tail, breath: the lib's idle life), sleeps in
// the calm beat, and outdoors catches the snow (a snow-lit rim along its head and back, a cap of snow that grows).
//
//   <Pip3 x={860} y={1060} />                                                    sit-back, ~96 px, idle
//   <Pip3 x={860} y={1060} keys={[{t: 0, pose: 'sit-back', look: -0.4}, {t: 4.04, pose: 'ears-cover'}]} />
//   <Pip3 ... look={[{t: 0, v: -0.5}, {t: 1.88, v: 0.6}]} />                    head turns (eased 0.16 s)
//   <Pip3 ... hops={[{t: 2.62, height: 18}]} jolts={[14.52]} />                 a small hop in place; a startle squash
//   <Pip3 ... hops={[{t: 20.7, to: [470, 1396], height: 40}]} />                 a hop to a new perch
//   <Pip3 ... outdoor snowCap={[22.68, 25.2]} />                                 snow rim + a cap that grows over the shot
//   <Pip3 ... at={0.2} />                                                       draws on (lines, then colour) from 0.2
//   <PipTiny x={420} y={1398} h={56} hopAt={21.72} />                           the S9 end silhouette (back view)
//
// The lib Elephant is used as-is (lib defaults untouched); the colourway PIP_EMBER is passed per instance.

import React from 'react';
import {useTime} from '../../../lib/time';
import {Elephant} from '../../../lib/mascot/Elephant';
import type {Colorway} from '../../../lib/mascot/colors';
import {hop as hopArc, popSwitch, poseAt, drawIn, unbuild} from '../../../lib/mascot/motion';
import type {Expression, PoseName} from '../../../lib/mascot/poses';
import {POSE_BOUNDS} from '../../../lib/mascot/poses';
import {earFlap, tailSwish, breath} from '../../../lib/mascot/idle';
import {blob, circle, smooth} from '../../../lib/sketch';
import {EMBER} from '../palette';
import {At, Pt, TPath} from './util';
import {ease01, hopY} from './idle';
import {tiered, useTierHere} from '../../../lib/tier';
import {hexToLab, isClean, labToHex, shadeL, type Tier} from '../../../lib/pen';

// ---------------------------------------------------------------- the colourway

/** Pip in Autumn Ember: lilac body (L* 61), one flat shade step darker, the room's nail peach for ear inner and cheeks,
 *  the Ember ink. ΔE76 from every ground it sits on >= 23 (the plan's table; the kit sheet prints the measured values).
 *  Lilac is used for nothing else in the film. */
export const PIP_EMBER: Colorway = {
  name: 'Pip Ember',
  body: '#A983C9',
  shade: '#8C68AE',
  earInner: EMBER.nail,
  cheek: EMBER.nail,
  nail: EMBER.wall,
  shine: EMBER.white,
  ink: EMBER.ink,
};

/** The clean pen's mascot (docs/look/CRAFT.md §b: tier B unless the line is about Pip): a softer lilac (C* <= 25 on the
 *  support tier, <= 18 on the environment tier), a same-hue line (the body's shade, -20 L*) at ~2 px, and no line at all
 *  on the environment tier; the subject keeps the full lilac with its deep shade as the line. Eyes keep the dark ink. */
const capC = (hex: string, cmax: number, dL = 0) => {
  const lab = hexToLab(hex);
  if (!lab) return hex;
  const C = Math.hypot(lab[1], lab[2]);
  const k = C > cmax ? cmax / C : 1;
  return labToHex([lab[0] + dL, lab[1] * k, lab[2] * k]);
};
export function pipLook(tier: Tier): {colorway: Colorway; lineK: number; ink: number} {
  if (!isClean()) return {colorway: PIP_EMBER, lineK: 1, ink: 1};
  if (tier === 'subject') return {colorway: {...PIP_EMBER, line: shadeL(PIP_EMBER.body, -35, 16)}, lineK: 0.8, ink: 1};
  const cmax = tier === 'support' ? 25 : 18;
  const body = capC(PIP_EMBER.body, cmax, 2);
  const shade = capC(PIP_EMBER.shade, cmax, 2);
  return {colorway: {...PIP_EMBER, body, shade, line: shadeL(body, -20, 20)}, lineK: 0.55, ink: tier === 'support' ? 1 : 0};
}

/** The snow-lit rim (an ink-only copy in snow white, nudged up-left, peeking past the outline). */
const PIP_RIM: Colorway = {name: 'Pip rim', body: EMBER.snow, shade: EMBER.snow, earInner: EMBER.snow, cheek: EMBER.snow, nail: EMBER.snow, shine: EMBER.snow, ink: EMBER.snow};

// ---------------------------------------------------------------- Pip3

export type PipPoseKey = {t: number; pose: PoseName; look?: number; expression?: Expression; amount?: number};
export type LookKey = {t: number; v: number};
/** A shrug IN THE CURRENT POSE (no pose swap, so never a pop; CRAFT §b, the mascot at tier B: "no pops", clear of the
 *  subject): over [t, t + dur] the head rises and leans out a hair (a short stretch about the grip, the 'peek' pose a
 *  step further out), shows `face` (default 'meh': the heavy-lidded "oh well") and settles back. `hold` keeps the face
 *  after it (a held state, no motion). */
export type PipShrug = {t: number; dur?: number; face?: Expression; hold?: boolean};

/** The shrug's bump at time t: 0 outside, up over the first 40 % (outCubic), held 20 %, down over the last 40 %. */
export function shrugK(t: number, s: PipShrug): number {
  const dur = s.dur ?? 0.15;
  const u = (t - s.t) / dur;
  if (u <= 0 || u >= 1) return 0;
  if (u < 0.4) return 1 - Math.pow(1 - u / 0.4, 3);
  if (u < 0.6) return 1;
  const v = (u - 0.6) / 0.4;
  return 1 - (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
}
/** How far the shrug stretches Pip (Elephant `squash`, negative = up) and leans it out (+ the 'peek' amount) at its
 *  peak: ~6 px up and ~5 px out at the thread plane's PAYOFF scale (~1.55). */
const SHRUG = {stretch: -0.09, lean: 0.1};
export type PipHop = {
  /** Take-off time (scene s). */
  t: number;
  /** Landing point (feet); omit = a hop in place. */
  to?: Pt;
  /** Airtime (default 0.3 in place, 0.42 travelling). */
  dur?: number;
  /** Apex above the higher end (px; default 16 in place, 40 travelling). */
  height?: number;
};

export type Pip3Props = {
  /** Feet anchor (canvas px). */
  x: number;
  y: number;
  /** 1 = ~96 px tall sitting (mediums and wides); 1.6-1.9 in close-ups (S8, S16). Ink stays ~3.8 px on screen. */
  scale?: number;
  /** A fixed pose (default 'sit-back'), or a pose timeline (each switch is a squash-and-stretch pop). */
  pose?: PoseName;
  keys?: PipPoseKey[];
  /** Head / eye direction -1..1 (before flip): a value, or keys eased over `lookDur` (a head turn). */
  look?: number | LookKey[];
  lookDur?: number;
  expression?: Expression;
  amount?: number;
  flip?: boolean;
  seed?: number;
  /** Idle life multiplier (blink, ears, tail, trunk, breath). Default 1: never frozen. */
  idle?: number;
  /** Hops (in place, or to a new perch: the position carries on from the last landing). */
  hops?: PipHop[];
  /** Startle squashes (anticipate, pop, settle) at these times: a reaction without a pose change. */
  jolts?: number[];
  /** Shrugs in the current pose (see PipShrug): a reaction without a pose change. */
  shrugs?: PipShrug[];
  /** Draw-on start (scene s; lines first, colour ~0.16 s after) and its length. Omit = already drawn. */
  at?: At;
  drawDur?: number;
  /** Un-build start (fills shrink, then the ink retracts, 0.5 s). */
  exitAt?: number;
  /** Outdoors: the snow-lit rim along the head and back. */
  outdoor?: boolean;
  /** A cap of snow on its head: 0..1, or [t0, t1] = it grows over that window (S10: snow slowly capping its head).
   *  `shakeAt` = it shakes the snow off (the cap is flung off in 0.15 s). */
  snowCap?: number | [number, number];
  shakeAt?: number;
  /** Line weight factor (close-ups: 1.25 so the front ink reads ~4.8 px). */
  lineWeight?: number;
  /** Override the scene time (rarely needed). */
  t?: number;
};

const lookAt = (look: number | LookKey[] | undefined, t: number, dur: number): number | undefined => {
  if (look === undefined || typeof look === 'number') return look;
  if (!look.length) return undefined;
  let v = look[0].v;
  for (let i = 1; i < look.length; i++) {
    if (t < look[i].t) break;
    v = v + (look[i].v - v) * ease01(t, look[i].t, dur);
  }
  return v;
};

/** Where Pip's feet are at time t, given its hops (pure: lanes can aim things at Pip with it). */
export function pipPlace(t: number, x: number, y: number, hops: PipHop[] = []) {
  let from: Pt = [x, y];
  let squash = 0;
  let rot = 0;
  let airborne = false;
  for (const h of hops) {
    const travel = !!h.to;
    const to: Pt = h.to ?? from;
    const dur = h.dur ?? (travel ? 0.42 : 0.3);
    const height = h.height ?? (travel ? 40 : 16);
    if (t < h.t - 0.14) break;
    const r = hopArc({t, t0: h.t, dur, from: {x: from[0], y: from[1]}, to: {x: to[0], y: to[1]}, height});
    if (t <= h.t + dur + 0.32) {
      return {x: r.x, y: r.y, squash: r.squash, rot: travel ? r.rotate : 0, airborne: r.airborne};
    }
    from = to;
  }
  return {x: from[0], y: from[1], squash, rot, airborne};
}

const Pip3Body: React.FC<Pip3Props> = ({
  x,
  y,
  scale = 1,
  pose = 'sit-back',
  keys,
  look,
  lookDur = 0.16,
  expression,
  amount,
  flip,
  seed = 3,
  idle = 1,
  hops,
  jolts,
  shrugs,
  at,
  drawDur = 0.6,
  exitAt,
  outdoor,
  snowCap,
  shakeAt,
  lineWeight = 1,
  t: tIn,
}) => {
  const tNow = useTime();
  const t = tIn ?? tNow;
  const look3 = pipLook(useTierHere());
  if (at !== undefined && t < at) return null;
  const draw = at === undefined ? 1 : drawIn(t, at, drawDur);
  const exit = exitAt === undefined ? 0 : unbuild(t, exitAt);
  if (exit >= 1) return null;
  // pose timeline
  let curPose = pose;
  let curExpr = expression;
  let curAmount = amount;
  let curLook = lookAt(look, t, lookDur) ?? 0;
  let squash = 0;
  if (keys && keys.length) {
    const {cur, prev, next} = poseAt(keys, t);
    curPose = cur.pose;
    curExpr = cur.expression ?? expression;
    curAmount = cur.amount ?? amount;
    if (cur.look !== undefined && look === undefined) curLook = cur.look;
    if (prev) squash += popSwitch(t, cur.t);
    if (next) squash += popSwitch(t, next.t);
  }
  for (const j of jolts ?? []) squash += popSwitch(t, j) * 1.4;
  // shrugs in the current pose: a smooth stretch-and-lean bump (no key switch, so no popSwitch squash)
  for (const s of shrugs ?? []) {
    const k = shrugK(t, s);
    if (k > 0) {
      squash += SHRUG.stretch * k;
      if (curPose === 'peek') curAmount = Math.min(1, (curAmount ?? 1) + SHRUG.lean * k);
    }
    if (k > 0.35 || (s.hold && t >= s.t + (s.dur ?? 0.15) * 0.4)) curExpr = s.face ?? 'meh';
  }
  const P = pipPlace(t, x, y, hops);
  squash += P.squash;
  const common = {
    x: P.x,
    y: P.y,
    scale,
    flip,
    pose: curPose,
    t,
    seed,
    look: curLook,
    expression: curExpr,
    amount: curAmount,
    idle,
    draw,
    exit,
    squash,
    rotate: P.rot,
  };
  // snow cap amount
  let cap = 0;
  if (typeof snowCap === 'number') cap = snowCap;
  else if (snowCap) cap = Math.max(0, Math.min(1, (t - snowCap[0]) / Math.max(0.01, snowCap[1] - snowCap[0])));
  let capFly = 0;
  if (shakeAt !== undefined && t >= shakeAt) {
    capFly = (t - shakeAt) / 0.15;
    if (capFly >= 1) cap = 0;
  }
  const capPose = curPose === 'sit-back' || curPose === 'sit-front' || curPose === 'trunk-up' || curPose === 'shrug' || curPose === 'ears-cover' || curPose === 'hold';
  const top = POSE_BOUNDS[curPose].y0;
  const fx = flip ? -1 : 1;
  const sx = 1 + squash * 0.55;
  const sy = 1 - squash;
  return (
    <>
      {outdoor && !isClean() ? <Elephant {...common} x={P.x - 2.2} y={P.y - 2.6} colorway={PIP_RIM} fill={0} lineWeight={lineWeight * 1.2} /> : null}
      <Elephant {...common} colorway={look3.colorway} lineWeight={lineWeight * look3.lineK} ink={look3.ink} />
      {cap > 0.02 && capPose && draw >= 1 && exit <= 0 ? (
        <g transform={`translate(${P.x.toFixed(2)} ${P.y.toFixed(2)}) rotate(${P.rot.toFixed(2)}) scale(${(fx * scale).toFixed(4)} ${scale.toFixed(4)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
          <g transform={capFly > 0 && capFly < 1 ? `translate(${(capFly * 26).toFixed(2)} ${(-capFly * 18).toFixed(2)}) rotate(${(capFly * 40).toFixed(1)} 0 ${top + 8})` : undefined}>
            <TPath d={blob(curLook * 2.4, top + 9 - 2 * cap, 6 + 11 * cap, 3 + 4.5 * cap, {seed: `pipcap${seed}`})} fill={EMBER.snow} />
            <TPath d={smooth([[curLook * 2.4 - (6 + 11 * cap), top + 10], [curLook * 2.4, top + 7.5 - 6.5 * cap], [curLook * 2.4 + 6 + 11 * cap, top + 10]])} fill="none" stroke={EMBER.ink} strokeWidth={1.6 / scale} strokeLinecap="round" />
          </g>
        </g>
      ) : null}
    </>
  );
};
export const Pip3 = tiered('support', {lines: true, tone: PIP_EMBER.body}, Pip3Body);

// ---------------------------------------------------------------- PipTiny (S9's end: two backs at the rail)

export type PipTinyProps = {
  /** Feet (canvas px), sitting on a ledge, seen from behind. */
  x: number;
  y: number;
  /** Height (px; 50-60 in S9's end frame, reads from 40). */
  h?: number;
  /** Which side its trunk curl peeks out (default 'r'). */
  side?: 'l' | 'r';
  /** A small startled hop at this time (S9: the thoom on "mountain"). */
  hopAt?: number;
  at?: At;
  seed?: number;
  /** Ink px (default 2.2: far). */
  ink?: number;
  outdoor?: boolean;
};

/** A simple back-view silhouette that reads at 40-60 px: a pear body, a round head, two big round ears sticking out,
 *  the trunk's curl peeking past one cheek, a tail with a tuft; idle ear flicks and tail swish. */
const PipTinyBody: React.FC<PipTinyProps> = ({x, y, h = 56, side = 'r', hopAt, at, seed = 5, ink = 2.2, outdoor = true}) => {
  const t = useTime();
  const pl = pipLook(useTierHere()).colorway;
  const clean = isClean();
  const mis = clean ? undefined : 'translate(1.5 1)'; // the clean pen registers fills exactly
  if (at !== undefined && t < at) return null;
  const pop = at === undefined ? 1 : Math.min(1, 0.2 + 0.8 * ease01(t, at, 0.12));
  const k = h / 56;
  const dy = hopY(t, hopAt, h * 0.34, 0.3);
  const sq = hopAt !== undefined && t > hopAt + 0.3 && t < hopAt + 0.55 ? 0.12 * Math.sin(((t - hopAt - 0.3) / 0.25) * Math.PI) : 0;
  const br = breath(t, seed) * 0.6;
  const s = side === 'r' ? 1 : -1;
  const eL = earFlap(t, seed, -1) * 0.5;
  const eR = earFlap(t, seed, 1) * 0.5;
  const tail = tailSwish(t, seed);
  // local units: 56 px tall figure, feet at 0
  const body = blob(0, -14, 17, 15 + br * 0.3, {seed: `pt/b${seed}`});
  const head = blob(0, -37, 13, 12, {seed: `pt/h${seed}`});
  const ear = (sgn: number, _flapDeg: number) => blob(sgn * 15, -39, 9, 11, {seed: `pt/e${sgn}${seed}`});
  const curl: Pt[] = [[s * 9, -30], [s * 15, -25], [s * 18, -29], [s * 15.5, -33]];
  const tailPts: Pt[] = [[s * -6, -2], [s * -15, 1], [s * -19 + tail * 2, 6], [s * -18 + tail * 3, 10]];
  const W = ink / k;
  const g = (
    <g transform={`translate(${x.toFixed(2)} ${(y + dy).toFixed(2)}) scale(${(k * pop * (1 + sq * 0.5)).toFixed(4)} ${(k * pop * (1 - sq)).toFixed(4)})`}>
      {/* rim (outdoors): a snow sliver up-left */}
      {outdoor && !clean ? (
        <g transform="translate(-1.4 -1.6)">
          <TPath d={body + head} fill={EMBER.snow} />
          <g transform={`rotate(${(-eL).toFixed(2)} -9 -39)`}>
            <TPath d={ear(-1, eL)} fill={EMBER.snow} />
          </g>
          <g transform={`rotate(${eR.toFixed(2)} 9 -39)`}>
            <TPath d={ear(1, eR)} fill={EMBER.snow} />
          </g>
        </g>
      ) : null}
      <TPath thing d={smooth(tailPts)} fill="none" stroke={EMBER.ink} strokeWidth={W} strokeLinecap="round" />
      <TPath d={circle(tailPts[3][0], tailPts[3][1] + 1.5, 2.2, {seed: `pt/tt${seed}`})} fill={EMBER.ink} />
      <g transform={`rotate(${(-eL).toFixed(2)} -9 -39)`}>
        <TPath d={ear(-1, eL)} fill={side === 'r' ? pl.shade : pl.body} transform={mis} />
        <TPath d={ear(-1, eL)} fill="none" stroke={EMBER.ink} strokeWidth={W} />
      </g>
      <g transform={`rotate(${eR.toFixed(2)} 9 -39)`}>
        <TPath d={ear(1, eR)} fill={side === 'r' ? pl.body : pl.shade} transform={mis} />
        <TPath d={ear(1, eR)} fill="none" stroke={EMBER.ink} strokeWidth={W} />
      </g>
      <TPath d={body} fill={pl.body} transform={mis} />
      <TPath d={head} fill={pl.body} transform={mis} />
      <TPath d={body} fill="none" stroke={EMBER.ink} strokeWidth={W} />
      <TPath d={head} fill="none" stroke={EMBER.ink} strokeWidth={W} />
      {/* back wrinkles (the cat's stripes) and the trunk curl */}
      <TPath d={`M-7 -22Q0 -19.5 7 -22M-5.5 -17Q0 -15 5.5 -17`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.75} strokeLinecap="round" />
      <TPath d={smooth(curl)} fill="none" stroke={EMBER.ink} strokeWidth={5.6 + W * 1.6} strokeLinecap="round" />
      <TPath thing d={smooth(curl)} fill="none" stroke={pl.body} strokeWidth={5.6} strokeLinecap="round" />
    </g>
  );
  return g;
};
export const PipTiny = tiered('support', {lines: true, tone: PIP_EMBER.body}, PipTinyBody);
