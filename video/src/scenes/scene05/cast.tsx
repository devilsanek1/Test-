// S05 cast: the two research teams (two depths, varied poses) + the Messenger, sleeping Pip on the banner's bottom rail
// (and his hop after the messenger), Bit on the blueprint lock detail (+ his '!' balloon), the floating z, the scan beams.
// Everything is in S05 world px (BLUEPRINT_WALL anchors) and scene seconds. Fix round 1: docs/scenes/S05.md.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {ElephantTimeline, hop} from '../../lib/mascot';
import {BLUEPRINT_WALL} from '../shared/sets';
import {AlertMark, Bit, LOCK, ScanBeam} from '../shared/props';
import type {Pt} from '../../lib/sketch';
import type {Beats} from './beats';
import {camAt, Cam, LAYER_F} from './camera';
import {Investigator, InvestigatorPose, Messenger, messengerEnvelope, tabletCentre} from './shims';
import {LOCK_C, lp} from './plan';

export {LOCK_C};

/** Front row feet (on the bottom tread / landing) and back row feet (its back edge, ~0.9 scale). */
const FEET = BLUEPRINT_WALL.feetY; // 1470
const FEET_BACK = 1446;

// ---------------------------------------------------------------- the teams

type Member = {
  x: number;
  /** Pop-up order inside the team (front left first). */
  rise: number;
  h: number;
  seed: string;
  body: string;
  hair?: 'short' | 'long' | 'bun' | 'curly' | 'bald';
  back?: boolean;
  tablet?: 'left' | 'right';
  pose?: 'point' | 'clipboard' | 'hips';
};

/** Team A (x 130-310) and team B (x 555-845, the rightmost is the messenger): two depths (a back-row member behind each
 *  front pair, partly hidden), different heights and poses. One tablet per team, held at HEAD height (40 x 57 world): its
 *  top stays below the banner's bottom rail (y 1296), clear of Pip and the elephant stamp. */
export const TEAM_A: Member[] = [
  {x: 216, rise: 1, h: 117, seed: 's5a3', body: palette.teal, hair: 'curly', back: true, pose: 'point'},
  {x: 160, rise: 0, h: 130, seed: 's5a1', body: palette.sage, hair: 'bun', pose: 'clipboard'},
  {x: 272, rise: 2, h: 140, seed: 's5a2', body: palette.tan, hair: 'short', tablet: 'right'},
];
export const TEAM_B: Member[] = [
  {x: 642, rise: 1, h: 116, seed: 's5b3', body: palette.tan, hair: 'bald', back: true},
  {x: 584, rise: 0, h: 128, seed: 's5b1', body: palette.sand, hair: 'long', tablet: 'left'},
  {x: 700, rise: 2, h: 136, seed: 's5b2', body: palette.sage, hair: 'short', pose: 'hips'},
];
/** The messenger: in from the platform rail (screen x ~845, body 810-880), his envelope raised over his LEFT shoulder at
 *  screen ~(800, 1350). */
export const MESSENGER = {x: 810, h: 136, seed: 's5msg'};
const TABLET = 40;

const feetOf = (m: Member) => (m.back ? FEET_BACK : FEET);
const tabletOf = (m: Member) => tabletCentre({x: m.x, y: feetOf(m), h: m.h, seed: m.seed, arm: m.tablet, tabletSize: TABLET, tabletLift: 'head'});

/** Lean toward the lock on 'how' (about the feet): 7 deg with an out-back overshoot, settled in 0.2 s. */
const lean = (t: number, at: number, dir: number) => dir * 7 * E.outBack(1.8)(prog(t, at, 0.2));

/** Pop-up about the feet with no 'pancake' first frame: a uniform 0.6 -> 1 grow (0.16 s out-cubic) with the pop-up
 *  book's scaleY overshoot on top (1.07 -> 1 over the next 0.1 s). Frame 1 is already a whole (small) person. */
export const PopRise: React.FC<{at: number; x: number; y: number; children?: React.ReactNode}> = ({at, x, y, children}) => {
  const t = useTime();
  if (t < at) return null;
  const u = prog(t, at, 0.16, E.outCubic);
  const base = 0.6 + 0.4 * u;
  const over = u < 1 ? 1 + 0.07 * u : 1 + 0.07 * (1 - prog(t, at + 0.16, 0.1, E.inOutSine));
  if (base >= 1 && over <= 1.0001) return <>{children}</>;
  return <XG m={mat.about(mat.scale(base, base * over), x, y)}>{children}</XG>;
};

const TeamMember: React.FC<{m: Member; riseAt: number; raiseAt?: number; poseAt: number; leanAt: number; leanDir: number}> = ({m, riseAt, raiseAt, poseAt, leanAt, leanDir}) => {
  const t = useTime();
  const a = lean(t, leanAt, leanDir);
  const fy = feetOf(m);
  let pose: InvestigatorPose | undefined;
  if (m.pose === 'point') pose = {kind: 'point', at: poseAt, target: LOCK_C, side: 'right'};
  else if (m.pose === 'clipboard') pose = {kind: 'clipboard', side: 'left'};
  else if (m.pose === 'hips') pose = {kind: 'hips'};
  return (
    <PopRise at={riseAt} x={m.x} y={fy}>
      <XG m={mat.about(mat.rotate(a), m.x, fy)}>
        <Investigator x={m.x} y={fy} h={m.h} raiseAt={raiseAt} arm={m.tablet} tabletSize={TABLET} tabletLift="head" pose={pose} body={m.body} hair={m.hair} bob={1.2} seed={m.seed} />
      </XG>
    </PopRise>
  );
};

/** Both teams (back row first). Team A pops up on 'researchers' (0.10 s stagger), team B 0.35 s later (0.08 s); on 'AI'
 *  one tablet per team is raised (0.07 s apart); team A's back-row member points at the lock on 'figured'; on 'how'
 *  everyone leans in toward the lock, settled before 'bad' (its ONE focal event). The messenger: <MessengerDash>. */
export const Teams: React.FC<{b: Beats}> = ({b}) => {
  const lean0 = b.how - 0.1;
  const order = (team: Member[]) => [...team].sort((p, q) => Number(!!q.back) - Number(!!p.back));
  return (
    <>
      {order(TEAM_A).map((m) => {
        const i = m.rise;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamA + i * 0.1} raiseAt={m.tablet ? b.tablets : undefined} poseAt={b.converge} leanAt={lean0 + i * 0.02} leanDir={1} />;
      })}
      {order(TEAM_B).map((m) => {
        const i = m.rise;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamB + i * 0.08} raiseAt={m.tablet ? b.tablets + 0.07 : undefined} poseAt={b.converge} leanAt={lean0 + i * 0.02} leanDir={-1} />;
      })}
    </>
  );
};

/** The two scan beams: from each raised tablet's top to the lock detail (team A from the left, team B from the right of
 *  the lock's foot); they shoot out on 'AI'+0.25, sweep the banner in opposite phase, converge on the lock on 'figured'
 *  and retract the moment the ring finds it ('out'+0.02: gone by 2.17 s, before the hand starts drawing for 'bad').
 *  Sage at 0.3 (static translucency, light only). */
export const Beams: React.FC<{b: Beats}> = ({b}) => {
  const pa = tabletOf(TEAM_A.find((m) => m.tablet)!);
  const pb = tabletOf(TEAM_B.find((m) => m.tablet)!);
  const off = TABLET * 0.71;
  const outAt = b.ring + 0.02;
  return (
    <>
      <ScanBeam from={[pa[0] + 3, pa[1] - off]} to={LOCK_C} w0={14} w1={170} at={b.beams} sweep={{amp: 11, hz: 1.1}} convergeAt={b.converge} outAt={outAt} color={palette.sage} opacity={0.3} depth="far" />
      <ScanBeam from={[pb[0] - 3, pb[1] - off]} to={LOCK_C} w0={14} w1={170} at={b.beams + 0.05} sweep={{amp: -11, hz: 1.1}} convergeAt={b.converge} outAt={outAt} color={palette.sage} opacity={0.3} depth="far" />
    </>
  );
};

// ---------------------------------------------------------------- the messenger

/** The messenger's dash, in SCREEN px relative to the trucking camera: he starts on 'was.'+0.10, ramps up over 0.1 s
 *  (in(quad)) and then runs at a near-constant 810 screen px/s (27 px/frame: S06's entry speed), so his centre is just
 *  past the frame's right edge on the cut (half of him still in frame). World speed at the cut = camera 785 + 717 =
 *  ~1500 world px/s. */
export const DASH = {v: 810, ramp: 0.1};
export function messengerScreenDx(t: number, b: Beats): number {
  const tau = t - b.envelope;
  if (tau <= 0) return 0;
  return tau < DASH.ramp ? (DASH.v * tau * tau) / (2 * DASH.ramp) : DASH.v * (tau - DASH.ramp / 2);
}

/** His world x (steps plane, f = 1): he rides the truck plus his own screen dash. */
export const messengerX = (t: number, b: Beats, cam: Cam) => MESSENGER.x + (cam.x - 540) + messengerScreenDx(t, b) / cam.zoom;


export const MessengerDash: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const cam = camAt(t, b.end);
  const x = messengerX(t, b, cam);
  // the turn: a quick lean into the dash (about the feet)
  const go = prog(t, b.envelope, 0.12, E.outCubic);
  const ang = 7 * go;
  const walking = t >= b.envelope;
  return (
    <XG m={mat.about(mat.rotate(ang), x, FEET)}>
      <PopRise at={b.teamB + 0.24} x={MESSENGER.x} y={FEET}>
        <Messenger x={x} y={FEET} h={MESSENGER.h} pullAt={b.pull} side="left" lift="high" walk={walking ? 4.2 : undefined} bob={1.2} seed={MESSENGER.seed} />
      </PopRise>
      <SpeedLines t={t} at={b.truck + 0.02} x={x} />
    </XG>
  );
};

/** The envelope's world centre once it is up (before the dash). */
export const envelopeAt = () => messengerEnvelope({x: MESSENGER.x, y: FEET, h: MESSENGER.h, seed: MESSENGER.seed, side: 'left', lift: 'high'});

/** Three short ink speed lines trailing the dash (cartoon exit), drawn in world px behind his left side. */
const SpeedLines: React.FC<{t: number; at: number; x: number}> = ({t, at, x}) => {
  if (t < at) return null;
  const q = clamp((t - at) / 0.1);
  const y0 = FEET - MESSENGER.h * 0.5;
  const len = 56 * q;
  const x1 = x - 46;
  const d = `M${x1} ${y0}H${x1 - len}M${x1 + 6} ${y0 + 26}H${x1 + 6 - len * 0.8}M${x1 - 4} ${y0 - 24}H${x1 - 4 - len * 0.6}`;
  return <Ink d={d} width={3} taper={false} seed="s5speed" />;
};

// ---------------------------------------------------------------- Pip

/** Pip's perch on the bottom rail: the set's perchBottom (620) moved 10 left so his trunk-up wake clears the stamp
 *  (team B's tablet and beam origin stay ~25 world left of his tail). */
export const PIP_RAIL: Pt = [BLUEPRINT_WALL.perchBottom[0] - 10, BLUEPRINT_WALL.perchBottom[1]];
/** 1.2 on screen at the 1.13 lock. */
export const PIP_SCALE = 1.2 / 1.13;
/** Pip's hop off the rail after the messenger: a LOW hop (45 world) down toward the steps, take-off 0.04 s into the
 *  truck, mid-air on the cut, travelling right faster than the truck (screen ~630 -> ~830 by the cut), never above
 *  the wing's windows. */
export const pipHop = (b: Beats) => ({t0: b.truck + 0.04, dur: 0.45, to: {x: 1180, y: 1440}, height: 45});

const pipKeys = (b: Beats, t0: number) => [
  {t: -10, pose: 'sleep' as const},
  {t: b.pipWake, pose: 'trunk-up' as const, expression: 'wide' as const},
  {t: t0 - 0.14, pose: 'stand-side' as const, expression: 'wide' as const},
];

/** Pip ON THE RAIL (banner layer, riding its sway and its parallax): asleep (callback to S04), jolts awake on 'it'
 *  (trunk-up, wide), crouches; gone at take-off (<PipHop> takes over in the steps plane). */
export const PipOnRail: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const H = pipHop(b);
  if (t >= H.t0) return null;
  const h = hop({t, t0: H.t0, dur: H.dur, from: {x: PIP_RAIL[0], y: PIP_RAIL[1]}, to: H.to, height: H.height});
  const crouch = t >= H.t0 - 0.14;
  const jolt = t >= b.pipWake ? -10 * Math.sin(Math.PI * clamp((t - b.pipWake) / 0.16)) : 0;
  return <ElephantTimeline x={h.x} y={h.y + jolt} scale={PIP_SCALE} t={t} seed={5} keys={pipKeys(b, H.t0)} squash={crouch ? h.squash : 0} rotate={0} />;
};

/** Pip in the air (steps plane, f = 1): the hop starts from the rail point as the banner layer showed it at take-off
 *  (its parallax offset folded in, so there is no jump when he changes plane). */
export const PipHop: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const H = pipHop(b);
  if (t < H.t0) return null;
  const c0 = camAt(H.t0, b.end);
  const fromX = PIP_RAIL[0] + (1 - LAYER_F.banner) * (c0.x - 540);
  const h = hop({t, t0: H.t0, dur: H.dur, from: {x: fromX, y: PIP_RAIL[1]}, to: H.to, height: H.height});
  return <ElephantTimeline x={h.x} y={h.y} scale={PIP_SCALE} t={t} seed={5} keys={pipKeys(b, H.t0)} squash={h.squash} rotate={h.rotate} amount={h.airborne ? h.spread : undefined} />;
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

// ---------------------------------------------------------------- Bit: in the drawing, caught on 'bad'

/** Bit's spots: the socket mouth (posing as part of the lock drawing, 18 world = 20 px) and the lock box's top-left
 *  edge (silhouetted on the paper, 21 world = 24 px, legs and antennae clear of the linework). */
const SOCKET: Pt = (() => {
  const p = lp(LOCK.peek[0], LOCK.peek[1]);
  return [p[0] - 1, p[1] + 1];
})();
const EDGE: Pt = lp(-33, -50);
const HOP_OUT = 0.22;
const HOP_IN = 0.16;

function bitAt(t: number, outAt: number, inAt: number): {x: number; y: number; size: number; flip: boolean; out: boolean} {
  const arc = (a: Pt, c: Pt, u: number, hgt: number): Pt => [lerp(a[0], c[0], u), lerp(a[1], c[1], u) - hgt * 4 * u * (1 - u)];
  if (t < outAt) return {x: SOCKET[0], y: SOCKET[1], size: 18, flip: true, out: false};
  if (t < outAt + HOP_OUT) {
    const u = E.inOutSine((t - outAt) / HOP_OUT);
    const p = arc(SOCKET, EDGE, u, 26);
    return {x: p[0], y: p[1], size: lerp(18, 21, u), flip: true, out: true};
  }
  if (t < inAt) return {x: EDGE[0], y: EDGE[1], size: 21, flip: false, out: true};
  if (t < inAt + HOP_IN) {
    const u = E.inOutSine((t - inAt) / HOP_IN);
    const p = arc(EDGE, SOCKET, u, 14);
    return {x: p[0], y: p[1], size: lerp(21, 18, u), flip: false, out: true};
  }
  return {x: SOCKET[0], y: SOCKET[1], size: 18, flip: true, out: false};
}

/** Bit poses as part of the lock drawing in the socket mouth. Caught on 'bad': his ink '!' balloon pops ON the word and
 *  he hops OUT onto the lock box's top-left edge (the rewatcher's 'there he is' frame), looking up at the hand; he drops
 *  back into the socket on 'was.' as the balloon pops off. */
export const BitOnLock: React.FC<{alertAt: number; backAt: number}> = ({alertAt, backAt}) => {
  const t = useTime();
  const s = bitAt(t, alertAt, backAt);
  const showAlert = t >= alertAt && t < backAt;
  return (
    <>
      <Bit x={s.x} y={s.y} size={s.size} flip={s.flip} look={s.out ? 'up' : 'forward'} seed="s5bit" />
      {showAlert ? <AlertBubble x={ALERT[0]} y={ALERT[1]} tail={[EDGE[0], EDGE[1] - 12]} at={alertAt} /> : null}
    </>
  );
};

/** Where the '!' balloon sits: up-left of the lock, OUTSIDE the found ring (r92), below the L6 slip. */
const ALERT: Pt = [398, 858];

/** A small white balloon with a bold ink '!' and a tail toward Bit: it pops (7 % spring) and holds. */
const AlertBubble: React.FC<{x: number; y: number; tail: Pt; at: number}> = ({x, y, tail, at}) => {
  const t = useTime();
  if (t < at) return null;
  const r = 25;
  const dx = tail[0] - x;
  const dy = tail[1] - y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  // the tail: a short wedge from the balloon edge toward Bit (stops ~16 px short of him)
  const b0: Pt = [x + ux * r * 0.7 - uy * 9, y + uy * r * 0.7 + ux * 9];
  const b1: Pt = [x + ux * r * 0.7 + uy * 9, y + uy * r * 0.7 - ux * 9];
  const reach = Math.min(L - 16, r + 30);
  const tip: Pt = [x + ux * reach, y + uy * reach];
  const disc = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const tailD = `M${b0[0].toFixed(1)} ${b0[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}`;
  const circleOpen = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const k = springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  return (
    <XG m={mat.about(mat.scale(k), tip[0], tip[1])}>
      <path d={disc + tailD + 'Z'} fill={palette.white} />
      <Ink d={circleOpen + tailD} width={2.6} taper={false} vary={0} order="all" seed="s5bub" />
      <AlertMark x={x} y={y - 2} size={32} seed="s5alert" />
    </XG>
  );
};
