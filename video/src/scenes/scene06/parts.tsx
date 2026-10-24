// scene06/parts.tsx — S06 local helpers: the messenger's walk (warped walk clock, stops on a planted stride), his raised
// arm + envelope for the mail slot (mirrors props Messenger so the hand-over is invisible), Bit the stowaway, the makers'
// heads popping UP into the upstairs browser window, Pip (hop in, tiptoe, 'shh', ear twitch, leap after the sheet), the
// 'shh' mark, the blind's jolt ticks.

import React, {useId} from 'react';
import {captionFontStack, clamp, ease as E, Fill, Ink, lerp, line, mat, osc, palette, prog, Pt, rng, springAt, springs, useCaptionFont, useTime, XG, blob, polyPath, TimeShift} from '../../lib';
import {Elephant, hop, popSwitch, walkSpeed} from '../../lib/mascot';
import type {PoseName, Expression} from '../../lib/mascot';
import {Bit, Envelope, Maker, Messenger, messengerHand} from '../shared/props';
import type {Beats} from './beats';

// ---------------------------------------------------------------- the messenger (props Messenger, 260 px)

/** The S05 messenger (src/scenes/scene05/cast.tsx MESSENGER.seed 's5msg': same coat, hair, trousers), closer now. */
export const MSG = {seed: 's5msg', h: 260, y: 1520, x0: -140} as const;
/** props Figures.tsx constants (FIG_H / LEG / TORSO) for the mirrored arm and envelope. */
const FIG_H = 199;
const LEG = 62;
const TORSO = 95;
const S = MSG.h / FIG_H;
const HIP_Y = MSG.y - LEG * S;
/** The mail slot (WORKSHOP_LANE.slot) and its plate top (Bit's sill). */
export const SLOT: Pt = [670, 1300];
export const SILL: Pt = [698, 1290];
/** Envelope centre relative to the feet x (props messengerHand). */
const HAND0 = messengerHand(0, MSG.y, MSG.h, MSG.seed);
/** The kit Person's torso width for this seed (inverted from messengerHand: x + (w * 0.7 + 6) * s). */
const GW = (HAND0[0] / S - 6) / 0.7;
/** Feet x at the door: the envelope sits right over the slot. */
export const MSG_X1 = SLOT[0] - HAND0[0];

/** The kit Person's walk phase for a seed (mirrors kit/Person makeSpec's draw order with torsoH, hair, acc, body given:
 *  w, hr, round, hairColor, legsColor, shoeColor, packColor, hat, signColor, phase). */
function personPhase(seed: string): number {
  const r = rng(`person/${seed}`);
  r.range(86, 100);
  r.range(0.23, 0.26);
  r.range(0.36, 0.45);
  for (let i = 0; i < 6; i++) r.next();
  return r.range(0, 6.28);
}

export type MsgWalk = {x: number; tau: number; hz: number; walking: boolean};

/** The messenger's feet x and his walk clock. He comes out of S05's dash still fast (outpacing the camera, so he enters
 *  from the left edge: ~780 px/s on screen at the cut, S05 exits at ~1200) and brakes evenly (v0 (1 - u)) to a stop at
 *  the door on B.door. The walk clock tau runs at his speed, so the cadence slows with him; hz is chosen so his last
 *  step lands with both feet down (no leg snap when he stops). */
export function msgWalk(t: number, B: Beats): MsgWalk {
  const D = B.door - B.cut;
  const u = clamp((t - B.cut) / D);
  const k = u - (u * u) / 2; // integral of (1 - u)
  const x = MSG.x0 + (MSG_X1 - MSG.x0) * 2 * k;
  const tau = D * k + Math.min(0, t - B.cut);
  const tauEnd = D / 2;
  const ph = personPhase(MSG.seed);
  const n = Math.max(1, Math.round(3.4 * tauEnd + ph / Math.PI));
  const hz = (n * Math.PI - ph) / (tauEnd * Math.PI);
  return {x, tau, hz, walking: u < 1};
}

/** Envelope centre (world) while carried: props Envelope `carry` bob (hz 1.7, amp 3 figure units) on the walk clock. */
function carried(w: MsgWalk): {x: number; y: number; rot: number} {
  const bob = -Math.abs(osc(w.tau, 0.85)) * 3 * S;
  return {x: w.x + HAND0[0], y: HAND0[1] + bob, rot: -8 + osc(w.tau, 0.85, 1) * 2};
}

/** Where the wax seal sits on the envelope (world), or null once the envelope is through the slot. Mirrors props
 *  Envelope's slot motion (align 40 %, then slide down 60 %, clipped at the slot line). */
export function envSealWorld(t: number, B: Beats): {p: Pt; clipY: number | null; sx: number} | null {
  const w = msgWalk(t, B);
  const c = carried(w);
  const h = 60 * 0.66;
  let x = c.x;
  let y = c.y;
  let sx = 1;
  let clipY: number | null = null;
  if (t >= B.a) {
    const dur = 0.25;
    const a = prog(t, B.a, dur * 0.4, E.inOutSine);
    const b = prog(t, B.a + dur * 0.4, dur * 0.6, E.inCubic);
    if (b >= 1) return null;
    x = lerp(x, SLOT[0], a);
    y = lerp(y, SLOT[1] - h / 2, a) + b * h;
    sx = lerp(1, Math.min(1, (50 * 0.92) / 60), a);
    clipY = SLOT[1];
  }
  return {p: [x, y + 60 * 0.03], clipY, sx};
}

/** A sleeve from the shoulder to the hand (person units): mirrors the props Messenger's arm. */
const Arm: React.FC<{sh: Pt; hand: Pt; w?: number; coat: string; W: number; seed: string}> = ({sh, hand, w = 19, coat, W, seed}) => {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  const tipW = 0.85;
  const poly: Pt[] = [
    [sh[0] + nx, sh[1] + ny],
    [hand[0] + nx * tipW, hand[1] + ny * tipW],
    [hand[0] - nx * tipW, hand[1] - ny * tipW],
    [sh[0] - nx, sh[1] - ny],
  ];
  const f = (v: number) => v.toFixed(1);
  return (
    <>
      <Fill d={blob(hand[0] + (dx / L) * 4, hand[1] + (dy / L) * 4, w * 0.42, w * 0.46, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} />
      <Fill d={polyPath(poly)} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`M${f(poly[0][0])} ${f(poly[0][1])}L${f(poly[1][0])} ${f(poly[1][1])}M${f(poly[2][0])} ${f(poly[2][1])}L${f(poly[3][0])} ${f(poly[3][1])}M${f(poly[1][0])} ${f(poly[1][1])}L${f(poly[2][0])} ${f(poly[2][1])}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** The messenger: props Messenger (holding the envelope up) while he walks; from B.a the arm + envelope are drawn here
 *  with the same geometry so the envelope can go through the slot (props Envelope `slot`) and the arm can drop. */
export const MessengerS06: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const w = msgWalk(t, B);
  const own = t >= B.a;
  const W = 4.8 / S; // props inkFor(260) = front 4.8, in person units
  const sh: Pt = [GW * 0.34, -TORSO * 0.8];
  const up: Pt = [GW * 0.7, -TORSO * 0.92];
  const down: Pt = [GW * 0.48, -TORSO * 0.2];
  // after posting, the arm drops (0.25 s)
  const q = 1 - prog(t, B.a + 0.27, 0.25, E.inOutCubic);
  const hand: Pt = [lerp(down[0], up[0], q), lerp(down[1], up[1], q)];
  const c = carried(w);
  return (
    <>
      <TimeShift by={t - w.tau}>
        <Messenger x={w.x} y={MSG.y} h={MSG.h} holdEnvelope={!own} walk={{hz: w.hz}} seed={MSG.seed} />
      </TimeShift>
      {own ? (
        <XG m={mat.compose(mat.translate(w.x, HIP_Y), mat.scale(S))}>
          <Envelope x={(c.x - w.x) / S} y={(c.y - HIP_Y) / S} size={60 / S} rot={c.rot} slot={{at: B.a, x: (SLOT[0] - w.x) / S, y: (SLOT[1] - HIP_Y) / S, w: 50 / S}} depth="mid" seed={`${MSG.seed}/env`} />
          {q > 0.02 ? <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${MSG.seed}/arm`} /> : null}
        </XG>
      ) : null}
    </>
  );
};

/** The messenger's body bob from the kit Person walk (so Bit rides the shoulder). */
function msgBob(w: MsgWalk): number {
  const ph = w.tau * w.hz * Math.PI + personPhase(MSG.seed);
  return -Math.abs(Math.sin(ph)) * LEG * 0.035 * S;
}

// ---------------------------------------------------------------- Bit, the stowaway (20 px)

/** Bit: hidden in the messenger's collar, peeks out on 'gave' and rides his right shoulder; on 'a' he hops onto the
 *  mail slot's plate (the sill) and watches the envelope go in. */
export const BitS06: React.FC<{B: Beats; size?: number}> = ({B, size = 20}) => {
  const t = useTime();
  const id = 'b6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < B.gave) return null;
  const w = msgWalk(t, B);
  // on the shoulder curve, right of the collar (person units -> world)
  const shoulder: Pt = [w.x + GW * 0.3 * S, HIP_Y - (TORSO - 6.5) * S + msgBob(w)];
  const hopAt = B.a + 0.02;
  const hopDur = 0.3;
  if (t < hopAt) {
    // peek: rises out from behind the shoulder line (clipped), then rides
    const k = prog(t, B.gave, 0.2, E.outBack(1.6));
    const rise = (1 - k) * size * 0.75;
    return (
      <>
        <defs>
          <clipPath id={id}>
            <rect x={shoulder[0] - 60} y={shoulder[1] - 80} width={120} height={80 + 1.5} />
          </clipPath>
        </defs>
        <g clipPath={k < 1 ? `url(#${id})` : undefined}>
          <Bit x={shoulder[0]} y={shoulder[1] + rise} size={size} state="ride" look={k < 1 ? 'up' : 'forward'} seed="s6bit" />
        </g>
      </>
    );
  }
  // hop from the shoulder onto the sill (ballistic, landing squash), then sit facing the slot
  const from: Pt = [MSG_X1 + GW * 0.3 * S, HIP_Y - (TORSO - 6.5) * S];
  const u = prog(t, hopAt, hopDur);
  const x = lerp(from[0], SILL[0], E.inOutSine(u));
  const apex = Math.min(from[1], SILL[1]) - 34;
  const cy = 2 * apex - (from[1] + SILL[1]) / 2;
  const y = (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * cy + u * u * SILL[1];
  const land = t - (hopAt + hopDur);
  const sq = land >= 0 && land < 0.16 ? 1 - 0.22 * Math.sin((land / 0.16) * Math.PI) : u < 1 && u > 0 ? 1.08 : 1;
  return (
    <XG m={mat.about(mat.scale(2 - sq, sq), x, y)}>
      <Bit x={x} y={y} size={size} flip={u >= 1} state={u < 1 ? 'hop' : 'idle'} look={u >= 1 ? 'forward' : 'up'} seed="s6bit" />
    </XG>
  );
};

// ---------------------------------------------------------------- the makers' heads (upstairs browser window)

/** Three makers (props Maker, waist-up, back view) pop UP into the browser window's screen: rise 0.2 s, 0.06 s apart,
 *  clipped to the screen rect (the window frame stays in front of their shoulders). */
export const MakerHeads: React.FC<{screen: {x: number; y: number; w: number; h: number}; at: number; seed?: string}> = ({screen, at, seed = 's6mk'}) => {
  const t = useTime();
  const id = 'mh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < at) return null;
  const h = 104;
  const hipY = screen.y + screen.h + 50;
  const xs = [screen.x + screen.w * 0.2, screen.x + screen.w * 0.5, screen.x + screen.w * 0.8];
  const order = [1, 0, 2]; // the middle one first
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={screen.x} y={screen.y} width={screen.w} height={screen.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {xs.map((x, i) => {
          const a = at + order[i] * 0.06;
          if (t < a) return null;
          const k = prog(t, a, 0.2, E.outBack(1.5));
          return (
            <XG key={i} m={mat.translate(0, (1 - k) * 78)}>
              <Maker x={x} y={hipY + (i === 1 ? -4 : 3)} h={h} bust work={1.6 + i * 0.35} flip={i === 2} seed={`${seed}${i}`} />
            </XG>
          );
        })}
      </g>
    </>
  );
};

// ---------------------------------------------------------------- Pip

export const PIP = {scale: 1.2, y: 1480, land: [300, 1480] as Pt, hopFrom: [-100, 1350] as Pt} as const;

type PipState = {x: number; y: number; pose: PoseName; flip: boolean; squash: number; rotate: number; amount?: number; expression?: Expression; walkRate?: number};

/** Pip's choreography (world, f = 1): mid-leap at the cut (he jumped off S05's rail to follow), lands behind the
 *  messenger, tiptoes; 'shh' (hold pose, trunk curled to his mouth) after the seal; tiptoes on; ear twitch at the
 *  sheet (he turns to it); leaps after it toward the lens. */
export function pipAt(t: number, B: Beats): PipState {
  const landT = B.pipLand + 0.05;
  const hopDur = 0.3;
  const rate = 0.8;
  const v = walkSpeed(rate) * PIP.scale;
  const shhEnd = B.shh + 0.42;
  const leapT = B.sheet + 0.2;
  // x along the tiptoe (it pauses during the shh)
  const walked = (until: number) => Math.max(0, Math.min(until, B.shh) - landT) + Math.max(0, until - shhEnd);
  const xAt = (tt: number) => PIP.land[0] + v * walked(tt);
  if (t < landT) {
    const h = hop({t, t0: landT - hopDur, dur: hopDur, from: {x: PIP.hopFrom[0], y: PIP.hopFrom[1]}, to: {x: PIP.land[0], y: PIP.land[1]}, height: 60});
    return {x: h.x, y: h.y, pose: 'stand-side', flip: false, squash: h.squash, rotate: h.rotate, amount: h.spread};
  }
  if (t < B.shh) {
    const h = hop({t, t0: landT - hopDur, dur: hopDur, from: {x: PIP.hopFrom[0], y: PIP.hopFrom[1]}, to: {x: PIP.land[0], y: PIP.land[1]}, height: 60});
    return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: h.squash + popSwitch(t, B.shh), rotate: 0, walkRate: rate};
  }
  if (t < shhEnd) return {x: xAt(t), y: PIP.y, pose: 'hold', flip: false, squash: popSwitch(t, B.shh) + popSwitch(t, shhEnd), rotate: 0, expression: 'closed'};
  if (t < B.sheet) return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: popSwitch(t, shhEnd) + popSwitch(t, B.sheet), rotate: 0, walkRate: rate};
  const x0 = xAt(B.sheet);
  if (t < leapT - 0.14) return {x: x0, y: PIP.y, pose: 'stand-side', flip: true, squash: popSwitch(t, B.sheet), rotate: 0, expression: 'wide', amount: 0.25};
  const h = hop({t, t0: leapT, dur: 0.42, from: {x: x0, y: PIP.y}, to: {x: x0 - 260, y: 1150}, height: 150});
  return {x: h.x, y: h.y, pose: 'stand-side', flip: true, squash: h.squash, rotate: h.rotate, amount: Math.max(0.25, h.spread), expression: 'wide'};
}

export const PipS06: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const p = pipAt(t, B);
  return <Elephant x={p.x} y={p.y} scale={PIP.scale} pose={p.pose} flip={p.flip} t={t} seed={6} squash={p.squash} rotate={p.rotate} amount={p.amount} expression={p.expression} walkRate={p.walkRate ?? 0.8} look={p.pose === 'hold' ? 0.5 : 0} />;
};

/** 'shh' lettered beside Pip's trunk: pops in (7 % spring), shrinks away in 0.12 s. */
export const ShhMark: React.FC<{x: number; y: number; at: number; outAt: number; size?: number}> = ({x, y, at, outAt, size = 50}) => {
  const t = useTime();
  useCaptionFont();
  if (t < at || t >= outAt + 0.12) return null;
  const k = springAt(t, at, springs.pop) * (1 - E.inCubic(prog(t, outAt, 0.12)));
  if (k <= 0.01) return null;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(-8), mat.scale(k))}>
      <text x={0} y={0} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={palette.ink}>
        shh
      </text>
      <Ink d={line(size * 0.95, -size * 0.62, size * 1.25, -size * 0.85, {over: 0, seed: 's6shh1'}) + line(size * 1.0, -size * 0.25, size * 1.4, -size * 0.3, {over: 0, seed: 's6shh2'})} width={2.6} taper={false} seed="s6shhi" />
    </XG>
  );
};

// ---------------------------------------------------------------- blind jolt

/** Two little ink jolt ticks at the blind's bottom corners (the blind jolts once). */
export const BlindJolt: React.FC<{x0: number; x1: number; y: number; at: number}> = ({x0, x1, y, at}) => {
  const t = useTime();
  if (t < at || t > at + 0.22) return null;
  const k = Math.sin(Math.PI * prog(t, at, 0.22));
  const L = 16 * k;
  const d = `M${x0 - 6} ${y - 4}l${-L * 0.8} ${-L * 0.5}M${x0 - 6} ${y + 8}l${-L} ${L * 0.15}M${x1 + 6} ${y - 4}l${L * 0.8} ${-L * 0.5}M${x1 + 6} ${y + 8}l${L} ${L * 0.15}`;
  return <Ink d={d} width={2.6} taper={false} order="all" seed="s6jolt" />;
};
