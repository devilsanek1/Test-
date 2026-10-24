// S03 cast: Pip (his drop in from S02, the stamp bounce, the proud puff, the glance, the hop-off crouch), Bit riding the
// pen-nib sign, and the street life ('everyone': six small walkers pop up out of the plan like the buildings, a walker
// steps out of a doorway, one stops and looks up, one waves; the two near walkers slide in at the frame edges).

import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {ElephantTimeline, PoseKey} from '../../lib/mascot';
import {BLUEPRINT, popUpK} from '../shared/sets';
import {Bit, Citizen, EdgeOnlooker} from '../shared/props';
import type {Acc, Hair} from '../../lib/kit';
import type {Beats} from './beats';
import {ROOF_SIGN} from './plan';
import type {Pt} from '../../lib/sketch';

// ---------------------------------------------------------------- Pip

const PIP_SCALE = 1.2;
/** Where Pip is on the hard cut: S02 hops him off its rod perch toward the lens at cut(password)-0.04; this being a
 *  hard cut, S03 picks him up already lower and closer (world (700, 1000) = screen (700, 1010) at the rest camera),
 *  still rising a little (vy0) and dropping onto the plan: dx 280, dy 405 in 0.362 s, g ~7,000 px/s2, landing at
 *  ~80 px/frame (motion_spec #25: g 3,000-8,000, <= ~93 px/frame). */
const PIP_FROM: Pt = [700, 1000];
/** Fix round 1: Pip sits on the stamp's RUMP (its right end), not its centre (BLUEPRINT.pip (350, 1420) hid ~80 % of
 *  the print): the reversed-out elephant faces left, so its trunk, ear and legs stay clear (and his ear clears the title
 *  card). Screen at the 1.04 lock: (410.0, 1438.4), where he crouches on the cut (S04 continues from there). */
export const PIP_AT: Pt = [420, 1405];

/** Ballistic drop with an initial upward kick vy0 (px/s) landing exactly at `to` after T. */
function drop(t: number, t0: number, T: number, from: Pt, to: Pt, vy0: number): Pt {
  const u = clamp((t - t0) / T);
  const tau = u * T;
  const g = (2 * (to[1] - from[1] - vy0 * T)) / (T * T);
  return [lerp(from[0], to[0], u), from[1] + vy0 * tau + 0.5 * g * tau * tau];
}

/** Bounce in place: height h, airtime T, from t0. Returns the lift (px, up positive) and the airborne flag. */
const bounce = (t: number, t0: number, T: number, h: number) => {
  if (t < t0 || t > t0 + T) return 0;
  const u = (t - t0) / T;
  return 4 * h * u * (1 - u);
};

/** Landing squash (hop() post-landing curve): +squash, decaying wobble. */
const landSq = (t: number, at: number, amp = 0.24) => {
  const d = t - at;
  if (d < 0 || d > 0.4) return 0;
  return amp * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2);
};

export const PipS03: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const t0 = b.cut; // picks S02's hop-off up at the hard cut (S02 takes off at cut(password)-0.04)
  const printLand = b.stamp + 0.4; // the stamp's print lands (ring 0.13 + slam 0.27)
  const b1 = {at: printLand, T: 0.4, h: 64};
  const b2 = {at: printLand + 0.4, T: 0.25, h: 16};
  const settle = b2.at + b2.T;

  let x = PIP_AT[0];
  let y = PIP_AT[1];
  let squash = 0;
  let rotate = 0;
  if (t < b.pipLand) {
    // the drop from S02's rod: falling down-left onto the bare plan, nose dipping
    [x, y] = drop(t, t0, b.pipLand - t0, PIP_FROM, PIP_AT, -150);
    const u = clamp((t - t0) / (b.pipLand - t0));
    squash = -0.16 * (1 - u) - 0.04;
    rotate = lerp(-6, 14, u);
  } else {
    y -= bounce(t, b1.at, b1.T, b1.h) + bounce(t, b2.at, b2.T, b2.h);
    if (t >= b1.at && t < b1.at + b1.T) squash = -0.12 * Math.sin(Math.PI * clamp((t - b1.at) / b1.T));
    squash += landSq(t, b.pipLand, 0.26) + landSq(t, b2.at, 0.18) + landSq(t, settle, 0.12);
    // the slam's impact jolt just before the bounce
    if (t >= printLand - 0.06 && t < printLand) squash += 0.14 * Math.sin(Math.PI * ((t - (printLand - 0.06)) / 0.06));
    // 'loves': the proud puff (chest out: a stretch pulse -0.06 -> 0 over 0.3 s, on top of the pose pop)
    if (t >= b.loves && t < b.loves + 0.3) squash += -0.06 * (1 - E.outCubic((t - b.loves) / 0.3));
    // the hop-off crouch (S04 owns the leap: take-off after the cut)
    if (t >= b.pipHop) squash += 0.2 * Math.sin((Math.min(1, (t - b.pipHop) / 0.14) * Math.PI) / 2);
  }
  const keys: PoseKey[] = [
    {t: -10, pose: 'stand-side', amount: 0.85},
    {t: b.pipLand, pose: 'sit-back', look: 0.25},
    {t: b.loves, pose: 'sit-front', expression: 'happy', look: 0},
    {t: b.run, pose: 'sit-front', expression: 'happy', look: 0.7},
    {t: b.pipHop, pose: 'stand-side', amount: 0},
  ];
  const flip = t < b.pipLand; // faces left while dropping in; faces right for the hop toward the stoop
  return <ElephantTimeline x={x} y={y} scale={PIP_SCALE} t={t} seed={3} keys={keys} squash={squash} rotate={flip ? -rotate : rotate} flip={flip} />;
};

// ---------------------------------------------------------------- Bit on the pen-nib sign

/** The pen-nib sign's swing (same formula as the set's NibSign: -16 deg, decaying) about its hook. */
export const signAngle = (t: number, swingAt: number) => (t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0);

/** Bit sits on top of the pen-nib sign (S03's visible roof sign, ROOF_SIGN) and swings with it; antennae twitch. */
export const BitOnSign: React.FC<{swingAt: number; twitchAt: number; size?: number}> = ({swingAt, twitchAt, size = 19}) => {
  const t = useTime();
  const S = ROOF_SIGN;
  const a = signAngle(t, swingAt);
  // antennae twitch: a quick stretch up and a look up
  const tw = t >= twitchAt && t < twitchAt + 0.18 ? Math.sin(Math.PI * ((t - twitchAt) / 0.18)) : 0;
  const feet: Pt = [S.x + 1, S.y - S.r + 1];
  const look = t >= twitchAt && t < twitchAt + 0.7 ? 'up' : t >= swingAt && t < swingAt + 0.9 ? 'down' : 'auto';
  return (
    <XG m={mat.about(mat.rotate(a), S.hook[0], S.top + 8)}>
      <XG m={mat.about(mat.scale(1 - 0.06 * tw, 1 + 0.2 * tw), feet[0], feet[1])}>
        <Bit x={feet[0]} y={feet[1]} size={size} look={look} blinkAt={[twitchAt + 0.3]} seed="s03/bit" />
      </XG>
    </XG>
  );
};

// ---------------------------------------------------------------- the street life

type Walker = {
  id: string;
  x: number;
  y: number;
  h: number;
  /** pop-up time (scaleY from the feet, like the buildings) */
  at: number;
  /** walks away toward the VP from this time (constant speed in depth); stop = stops (looks up) */
  walkAt?: number;
  stop?: number;
  pace?: number;
  body?: string;
  hair?: Hair;
  acc?: Acc[];
  /** waves at this time (arm up, three swings) */
  waveAt?: number;
  /** looks up (lean back) at this time */
  lookUpAt?: number;
};

const VP = BLUEPRINT.vp;

function walkerPos(w: Walker, t: number): {x: number; y: number; h: number; walking: boolean} {
  if (w.walkAt === undefined || t < w.walkAt) return {x: w.x, y: w.y, h: w.h, walking: false};
  const tEnd = w.stop !== undefined ? Math.min(t, w.stop) : t;
  const k = 1 / (1 + (w.pace ?? 0.06) * (tEnd - w.walkAt));
  return {x: VP[0] + (w.x - VP[0]) * k, y: VP[1] + (w.y - VP[1]) * k, h: w.h * k, walking: w.stop === undefined || t < w.stop};
}

/** One small walker: pops up out of the plan (scaleY 0 -> 1.06 -> 1 about the feet), walks / stops / looks up / waves /
 *  bobs on 'run'. */
const SmallWalker: React.FC<{w: Walker; bobAt: number}> = ({w, bobAt}) => {
  const t = useTime();
  const k = popUpK(t, w.at, 0.08);
  if (k <= 0.001) return null;
  const p = walkerPos(w, t);
  const bob = t >= bobAt && t < bobAt + 0.24 ? 5 * Math.sin(Math.PI * ((t - bobAt) / 0.24)) * (p.h / 100) : 0;
  const lean = w.lookUpAt !== undefined && t >= w.lookUpAt ? -5 * E.outBack(1.6)(clamp((t - w.lookUpAt) / 0.25)) : 0;
  const fy = p.y - bob;
  // the waving arm (coat sleeve + sand hand), from the shoulder on the street side
  let arm: React.ReactNode = null;
  if (w.waveAt !== undefined && t >= w.waveAt && t < w.waveAt + 0.95) {
    const q = clamp((t - w.waveAt) / 0.12);
    const down = clamp((t - (w.waveAt + 0.8)) / 0.15);
    const raise = q * (1 - down);
    const side = p.x < VP[0] ? 1 : -1;
    const sh: Pt = [p.x + side * p.h * 0.13, fy - p.h * 0.66];
    const ang = (-90 + side * (28 + 16 * Math.sin((t - w.waveAt) * Math.PI * 2 * 3))) * raise + (1 - raise) * 90;
    const L = p.h * 0.33;
    const hd: Pt = [sh[0] + Math.cos((ang * Math.PI) / 180) * L, sh[1] + Math.sin((ang * Math.PI) / 180) * L];
    const wd = Math.max(2.4, p.h * 0.055);
    arm = (
      <>
        <Ink d={`M${sh[0].toFixed(1)} ${sh[1].toFixed(1)}L${hd[0].toFixed(1)} ${hd[1].toFixed(1)}`} width={wd + 3.2} color={palette.ink} taper={false} cap="round" seed={`s03/arm${w.id}o`} />
        <Ink d={`M${sh[0].toFixed(1)} ${sh[1].toFixed(1)}L${hd[0].toFixed(1)} ${hd[1].toFixed(1)}`} width={wd} color={w.body ?? palette.teal} taper={false} cap="round" seed={`s03/arm${w.id}i`} />
        <Fill d={blob(hd[0], hd[1], wd * 0.75, wd * 0.8, {seed: `s03/hand${w.id}`})} color={palette.sand} offset={false} mode="none" seed={`s03/hand${w.id}`} />
      </>
    );
  }
  return (
    <XG m={mat.compose(mat.about(mat.scale(1, k), p.x, p.y), mat.about(mat.rotate(lean), p.x, fy))}>
      {arm}
      <Citizen x={p.x} y={fy} h={p.h} body={w.body} hair={w.hair} acc={w.acc} walk={p.walking ? {hz: 1.8} : undefined} bob={p.walking ? 0 : 1.0} seed={`s03/w${w.id}`} />
    </XG>
  );
};

/** The six small walkers + the doorway walker (world feet / heights at the 1.04 lock). */
export function walkersFor(b: Beats): Walker[] {
  const e = b.everyone;
  return [
    // the doorway walker: R4's door, steps out and heads up the street toward the press house
    // fix round 1: x1.4 (the press-house door is 170 px: they were figurines beside it), re-placed clear of Pip on the
    // stamp's rump, the title card, the sticker and the count badges
    {id: 'door', x: 800, y: 1228, h: 80, at: b.doorway, walkAt: b.doorway + 0.25, pace: 0.05, body: palette.tan, hair: 'bun'},
    // the six: pop up out of the plan near -> far, alternating sides (0.05 s apart)
    {id: 'a', x: 318, y: 1296, h: 146, at: e, body: palette.teal, hair: 'short', acc: ['backpack']},
    {id: 'b', x: 716, y: 1298, h: 140, at: e + 0.05, walkAt: e + 0.4, pace: 0.05, body: palette.brown, hair: 'long'},
    {id: 'c', x: 545, y: 1290, h: 120, at: e + 0.1, body: palette.sage, hair: 'curly', waveAt: b.heads},
    {id: 'd', x: 652, y: 1268, h: 115, at: e + 0.15, walkAt: e + 0.3, stop: b.looksUp, lookUpAt: b.looksUp, pace: 0.07, body: palette.tealDark, hair: 'bun'},
    {id: 'e', x: 400, y: 1248, h: 98, at: e + 0.2, walkAt: e + 0.35, pace: 0.05, body: palette.tan, hair: 'short'},
    {id: 'f', x: 758, y: 1256, h: 101, at: e + 0.25, body: palette.teal, hair: 'beanie'},
  ];
}

export const StreetLife: React.FC<{b: Beats}> = ({b}) => {
  const ws = walkersFor(b);
  // far first (smaller feet y) so nearer people overlap farther ones
  const order = ws.slice().sort((p, q) => p.y - q.y);
  return (
    <>
      {order.map((w, i) => (
        <SmallWalker key={w.id} w={w} bobAt={b.run + i * 0.03} />
      ))}
    </>
  );
};

/** The two near walkers: big back-view figures cropped by the frame edges, sliding in on 'everyone' (0.3 s, out cubic),
 *  turning toward the press house at w42+0.30 (a small lean toward the centre) and bobbing on 'run'. */
export const NearWalkers: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const slide = (side: number, delay: number) => (1 - E.outCubic(prog(t, b.everyone + delay, 0.3))) * 260 * side;
  if (t < b.everyone) return null;
  const turn = (side: number) => -side * 3.2 * E.outBack(1.4)(prog(t, b.heads, 0.3));
  const bobY = (delay: number) => (t >= b.run + delay && t < b.run + delay + 0.26 ? -7 * Math.sin(Math.PI * ((t - b.run - delay) / 0.26)) : 0);
  const L: Pt = [64, 1492];
  const R: Pt = [1036, 1432];
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0) , bobY(0)), mat.about(mat.rotate(turn(-1)), L[0], L[1] + 400))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" body={palette.teal} rim="right" arms={false} seed="s03/nearL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04)), mat.about(mat.rotate(turn(1)), R[0], R[1] + 400))}>
        <EdgeOnlooker x={R[0]} y={R[1]} head={112} hair="bun" body={palette.tan} rim="left" arms={false} seed="s03/nearR" />
      </XG>
    </>
  );
};
