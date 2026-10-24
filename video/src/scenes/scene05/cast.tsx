// S05 cast: the two research teams (Investigator x5 + the Messenger), sleeping Pip on the banner's bottom rail, Bit on
// the blueprint lock detail, the floating z. Everything is in S05 world px (BLUEPRINT_WALL anchors) and scene seconds.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {ElephantTimeline, hop} from '../../lib/mascot';
import {BLUEPRINT_WALL} from '../shared/sets';
import {AlertMark, Bit, Investigator, LOCK, Messenger, ScanBeam, lockPoint} from '../shared/props';
import type {Pt} from '../../lib/sketch';
import type {Beats} from './beats';

const L = BLUEPRINT_WALL.lock;
export const LOCK_C: Pt = [L.x, L.y];
const FEET = BLUEPRINT_WALL.feetY; // 1470
const FIG_H = 199; // props Figures FIG_H (feet to head top at s = 1)

// ---------------------------------------------------------------- the teams

type Member = {x: number; h: number; seed: string; body: string; hair?: 'short' | 'long' | 'bun' | 'curly' | 'bald'; tablet?: 'left' | 'right'};

/** Team A (x 120-420) and team B (x 600-940, the rightmost is the messenger). Back view, full body, feet on 1470. */
export const TEAM_A: Member[] = [
  {x: 168, h: 130, seed: 's5a1', body: palette.sage, hair: 'bun'},
  {x: 268, h: 140, seed: 's5a2', body: palette.tan, hair: 'short', tablet: 'right'},
  {x: 372, h: 126, seed: 's5a3', body: palette.teal, hair: 'curly'},
];
export const TEAM_B: Member[] = [
  {x: 652, h: 128, seed: 's5b1', body: palette.sand, hair: 'long'},
  {x: 768, h: 138, seed: 's5b2', body: palette.sage, hair: 'short', tablet: 'left'},
];
export const MESSENGER = {x: 884, h: 136, seed: 's5msg'};

/** Kit Person geometry (props Figures personGeo): the raised tablet's centre for a member (world). */
function tabletCentre(m: Member): Pt {
  // mirrors Investigator: hand at (side * w * 0.62, hy - hr * 1.7) in person units, tablet 34 / s above the hand
  const s = m.h / FIG_H;
  const w = 93;
  const hr = w * 0.245;
  const hy = -95 - hr * 0.86;
  const side = m.tablet === 'left' ? -1 : 1;
  const hipY = FEET - 62 * s;
  return [m.x + side * w * 0.62 * s, hipY + (hy - hr * 1.7) * s - 34];
}

/** Lean toward the lock on 'how' (about the feet), with a small overshoot, then holds. */
const lean = (t: number, at: number, dir: number) => dir * 3.2 * E.outBack(1.8)(prog(t, at, 0.28));

const TeamMember: React.FC<{m: Member; riseAt: number; raiseAt?: number; leanAt: number; leanDir: number}> = ({m, riseAt, raiseAt, leanAt, leanDir}) => {
  const t = useTime();
  const a = lean(t, leanAt, leanDir);
  return (
    <XG m={mat.about(mat.rotate(a), m.x, FEET)}>
      <Investigator x={m.x} y={FEET} h={m.h} riseAt={riseAt} raiseAt={raiseAt} arm={m.tablet} body={m.body} hair={m.hair} bob={1.2} seed={m.seed} />
    </XG>
  );
};

/** Both teams. Team A rises on 'researchers' (0.10 s stagger), team B 0.35 s later; on 'AI' one tablet per team is
 *  raised (0.07 s apart); on 'how' everyone leans in toward the lock. The messenger is drawn by <MessengerDash>. */
export const Teams: React.FC<{b: Beats}> = ({b}) => (
  <>
    {TEAM_A.map((m, i) => (
      <TeamMember key={m.seed} m={m} riseAt={b.teamA + i * 0.1} raiseAt={m.tablet ? b.tablets : undefined} leanAt={b.how + i * 0.03} leanDir={1} />
    ))}
    {TEAM_B.map((m, i) => (
      <TeamMember key={m.seed} m={m} riseAt={b.teamB + i * 0.1} raiseAt={m.tablet ? b.tablets + 0.07 : undefined} leanAt={b.how + 0.04 + i * 0.03} leanDir={-1} />
    ))}
  </>
);

/** The two scan beams: from each raised tablet's top to the lock detail; they shoot out on 'AI'+0.25, sweep the banner
 *  from opposite sides (opposite phase), converge on the lock on 'figured', and go off when the ring has found it. */
export const Beams: React.FC<{b: Beats}> = ({b}) => {
  const ta = TEAM_A.find((m) => m.tablet)!;
  const tb = TEAM_B.find((m) => m.tablet)!;
  const pa = tabletCentre(ta);
  const pb = tabletCentre(tb);
  return (
    <>
      <ScanBeam from={[pa[0] + 4, pa[1] - 40]} to={LOCK_C} w0={16} w1={170} at={b.beams} sweep={{amp: 11, hz: 1.1}} convergeAt={b.converge} outAt={b.bad - 0.02} depth="far" />
      <ScanBeam from={[pb[0] - 4, pb[1] - 40]} to={LOCK_C} w0={16} w1={170} at={b.beams + 0.05} sweep={{amp: -11, hz: 1.1}} convergeAt={b.converge} outAt={b.bad - 0.02} depth="far" />
    </>
  );
};

// ---------------------------------------------------------------- the messenger

/** World x offset of the messenger's dash out of frame right: he turns on 'was.' and accelerates (in(quad)) so his
 *  centre is past the frame's right edge on the cut (the camera trucks with him; S06 picks him up entering left). */
export function messengerDx(t: number, b: Beats): number {
  const t0 = b.envelope + 0.04;
  if (t < t0) return 0;
  const T = b.end - t0;
  const D = 330; // world px by the cut: centre at screen ~1135 with the camera at x 690
  const u = (t - t0) / T;
  return D * u * u;
}

export const MessengerDash: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const dx = messengerDx(t, b);
  const x = MESSENGER.x + dx;
  // the turn: a quick lean into the dash (about the feet) with a little step bob
  const go = prog(t, b.envelope, 0.12, E.outCubic);
  const ang = 7 * go;
  const walking = t >= b.envelope;
  return (
    <XG m={mat.about(mat.rotate(ang), x, FEET)}>
      <Messenger x={x} y={FEET} h={MESSENGER.h} riseAt={b.teamB + 0.2} pullAt={b.envelope - 0.06} walk={walking ? {at: b.envelope, hz: 4.2} : undefined} bob={1.2} seed={MESSENGER.seed} />
      <SpeedLines t={t} at={b.truck + 0.06} x={x} />
    </XG>
  );
};

/** Two short ink speed lines trailing the dash (cartoon exit), drawn in world px behind his left side. */
const SpeedLines: React.FC<{t: number; at: number; x: number}> = ({t, at, x}) => {
  if (t < at) return null;
  const q = clamp((t - at) / 0.1);
  const y0 = FEET - MESSENGER.h * 0.62;
  const len = 56 * q;
  const x1 = x - 46;
  const d = `M${x1} ${y0}H${x1 - len}M${x1 + 6} ${y0 + 26}H${x1 + 6 - len * 0.8}M${x1 - 4} ${y0 - 24}H${x1 - 4 - len * 0.6}`;
  return <Ink d={d} width={3} taper={false} seed="s5speed" />;
};

// ---------------------------------------------------------------- Pip

export const PIP_RAIL: Pt = [BLUEPRINT_WALL.perchBottom[0], BLUEPRINT_WALL.perchBottom[1]];
/** 1.2 on screen at the 1.13 lock. */
export const PIP_SCALE = 1.2 / 1.13;
/** Pip's hop off the rail after the messenger: take-off (crouch 0.14 s before), mid-air on the cut. */
export const pipHop = (b: Beats) => ({t0: b.truck + 0.08, dur: 0.46, to: {x: 860, y: 1478}});

/** Asleep on the bottom rail (callback to S04), jolts awake on 'it' (trunk-up, wide), crouches and hops off to follow
 *  the messenger across the cut on action. `sway` = the banner's sway angle about its rod (deg). */
export const PipS05: React.FC<{b: Beats; sway: number}> = ({b, sway}) => {
  const t = useTime();
  const H = pipHop(b);
  const h = hop({t, t0: H.t0, dur: H.dur, from: {x: PIP_RAIL[0], y: PIP_RAIL[1]}, to: H.to, height: 90});
  const crouch = t >= H.t0 - 0.14;
  const keys = [
    {t: -10, pose: 'sleep' as const},
    {t: b.pipWake, pose: 'trunk-up' as const, expression: 'wide' as const},
    {t: H.t0 - 0.14, pose: 'stand-side' as const, expression: 'wide' as const},
  ];
  // the jolt: a small vertical pop on waking (on top of the timeline's switch squash)
  const jolt = t >= b.pipWake ? -10 * Math.sin(Math.PI * clamp((t - b.pipWake) / 0.16)) : 0;
  const node = (
    <ElephantTimeline
      x={h.x}
      y={h.y + jolt}
      scale={PIP_SCALE}
      t={t}
      seed={5}
      keys={keys}
      squash={crouch ? h.squash : 0}
      rotate={crouch ? h.rotate : 0}
      amount={crouch ? h.spread : undefined}
    />
  );
  // on the rail he rides the banner's sway; once airborne he is free
  return h.airborne || t >= H.t0 ? node : <XG m={mat.about(mat.rotate(sway), BLUEPRINT_WALL.lock.x, BLUEPRINT_WALL.rodY)}>{node}</XG>;
};

/** A big hand-drawn 'z' floats up from sleeping Pip on 'before' (grows, rises, pops off). */
export const BigZ: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at || t > at + 0.75) return null;
  const q = prog(t, at, 0.75, E.outCubic);
  const s = lerp(0.4, 1.1, E.outBack(1.6)(prog(t, at, 0.2)));
  const x = PIP_RAIL[0] + 44 + 16 * q + 4 * osc(t, 3, 0.3);
  const y = PIP_RAIL[1] - 66 - 70 * q;
  const z = 'M-10 -10H10L-10 10H10';
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(-12), mat.scale(s * 1.4))}>
      <Ink d={z} width={2.6} taper={false} vary={0} order="all" seed="s5z" />
    </XG>
  );
};

// ---------------------------------------------------------------- Bit

/** Bit poses as part of the lock drawing: in the socket mouth facing the short bolt (20 px on screen). On 'bad' he is
 *  caught: a startle hop and a big ink '!' (the prop's own '!' is 11 px: too small on a phone). */
export const BitOnLock: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const p = lockPoint(L.x, L.y, L.h, LOCK.peek);
  const x = p[0] - 2;
  const y = p[1] + 1;
  const showAlert = t >= b.bad && t < b.bad + 0.9;
  return (
    <>
      <Bit x={x} y={y} size={18} flip hopAt={b.bad} hopH={0.9} look="forward" seed="s5bit" />
      {showAlert ? <AlertMark x={x - 3} y={y - 34} size={28} at={b.bad} seed="s5alert" /> : null}
    </>
  );
};
