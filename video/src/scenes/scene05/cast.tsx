// S05 cast: the two research teams (two depths, varied poses, one 'tech' accessory each), the scan beams, sleeping Pip
// on the banner's bottom rail (+ S04's leaf on his ear, his hop after the messenger), Bit on the blueprint lock detail
// (+ his '!' balloon, his leap onto the messenger's collar), the floating z. The messenger: scene05/messenger.tsx.
// Everything is in S05 world px (BLUEPRINT_WALL anchors) and scene seconds. Notes: docs/scenes/S05.md.
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ElephantTimeline, hop} from '../../lib/mascot';
import {BLUEPRINT_WALL} from '../shared/sets';
import {AlertMark, Bit, LOCK, ScanBeam} from '../shared/props';
import type {Acc, Hair} from '../../lib/kit';
import type {Pt} from '../../lib/sketch';
import type {Beats} from './beats';
import {camAt, layerCam, LAYER_F, toScreen, toWorld} from './camera';
import {Investigator, InvestigatorPose, LEG, tabletCentre} from './shims';
import {LOCK_C, lp} from './plan';
import {collarAt, MessengerRun} from './messenger';

export {LOCK_C};

/** Front row feet (on the bottom tread / landing) and back row feet (its back edge). */
const FEET = BLUEPRINT_WALL.feetY; // 1470
const FEET_BACK = 1446;
/** Fix round 2: the teams 1.12 x (the baseline playbook's mid-ground, ~0.09-0.10 H on screen). */
const K = 1.12;

// ---------------------------------------------------------------- the teams

type Member = {
  x: number;
  /** Pop-up order inside the team (front left first). */
  rise: number;
  h: number;
  seed: string;
  body: string;
  hair?: Hair;
  hairColor?: string;
  acc?: Acc[];
  back?: boolean;
  tablet?: 'left' | 'right';
  pose?: 'point' | 'clipboard' | 'hips';
};

/** Team A (x 130-320) and team B (x 545-735; the messenger right of them): two depths (a back-row member behind each
 *  front pair, partly hidden), different heights and poses, ONE ref-2 'tech' accessory each (a bun, headphones, a laptop
 *  backpack, a cap, a ponytail, a bag strap) and the lanyard strap at the nape (no back badges). One tablet per team,
 *  held at HEAD height. */
export const TEAM_A: Member[] = [
  {x: 214, rise: 1, h: 117 * K, seed: 's5a3', body: palette.teal, hair: 'curly', hairColor: palette.ink, acc: ['headphones'], back: true, pose: 'point'},
  {x: 156, rise: 0, h: 130 * K, seed: 's5a1', body: palette.sage, hair: 'bun', hairColor: palette.brown, pose: 'clipboard'},
  {x: 274, rise: 2, h: 140 * K, seed: 's5a2', body: palette.tan, hair: 'short', hairColor: palette.ink, acc: ['backpack'], tablet: 'right'},
];
export const TEAM_B: Member[] = [
  {x: 644, rise: 1, h: 116 * K, seed: 's5b3', body: palette.tan, hair: 'cap', back: true},
  {x: 586, rise: 0, h: 128 * K, seed: 's5b1', body: palette.sand, hair: 'long', hairColor: palette.tan, tablet: 'left'},
  {x: 702, rise: 2, h: 136 * K, seed: 's5b2', body: palette.sage, hair: 'short', hairColor: palette.brown, acc: ['strap'], pose: 'hips'},
];
const TABLET = 42;

const feetOf = (m: Member) => (m.back ? FEET_BACK : FEET);
const tabletOf = (m: Member) => tabletCentre({x: m.x, y: feetOf(m), h: m.h, seed: m.seed, arm: m.tablet, tabletSize: TABLET, tabletLift: 'head'});

/** Lean toward the lock on 'how': the TORSO and head only, about the hip line (the legs stay planted): 7 deg with an
 *  out-back overshoot, settled in 0.2 s. */
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

/** Draws `children` twice when leaning: the legs (below the hip line) as they are, the coat, head and arms (above it)
 *  rotated about the hip. */
const HipLean: React.FC<{x: number; hipY: number; deg: number; children: React.ReactNode}> = ({x, hipY, deg, children}) => {
  const id = 'hl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (Math.abs(deg) < 0.01) return <>{children}</>;
  return (
    <>
      <defs>
        <clipPath id={`${id}u`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 400} y={hipY - 800} width={800} height={800 + 1.2} />
        </clipPath>
        <clipPath id={`${id}l`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 400} y={hipY + 1.2} width={800} height={400} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}l)`}>{children}</g>
      <XG m={mat.about(mat.rotate(deg), x, hipY)}>
        <g clipPath={`url(#${id}u)`}>{children}</g>
      </XG>
    </>
  );
};

const TeamMember: React.FC<{m: Member; riseAt: number; raiseAt?: number; poseAt: number; leanAt: number; leanDir: number}> = ({m, riseAt, raiseAt, poseAt, leanAt, leanDir}) => {
  const t = useTime();
  const a = lean(t, leanAt, leanDir);
  const fy = feetOf(m);
  let pose: InvestigatorPose | undefined;
  if (m.pose === 'point') pose = {kind: 'point', at: poseAt, target: LOCK_C, side: 'right'};
  else if (m.pose === 'clipboard') pose = {kind: 'clipboard', side: 'left'};
  else if (m.pose === 'hips') pose = {kind: 'hips'};
  const hipY = fy - (LEG * m.h) / 199;
  return (
    <PopRise at={riseAt} x={m.x} y={fy}>
      <HipLean x={m.x} hipY={hipY} deg={a}>
        <Investigator x={m.x} y={fy} h={m.h} raiseAt={raiseAt} arm={m.tablet} tabletSize={TABLET} tabletLift="head" pose={pose} body={m.body} hair={m.hair} hairColor={m.hairColor} acc={m.acc} bob={1.2} seed={m.seed} />
      </HipLean>
    </PopRise>
  );
};

/** Both teams (back row first). Team A pops up on 'researchers' (0.10 s stagger), team B 0.35 s later (0.08 s); on 'AI'
 *  one tablet per team is raised (0.07 s apart); team A's back-row member points at the lock on 'figured'; on 'how'
 *  everyone leans in toward the lock (torso + head about the hips), settled before 'bad' (its ONE focal event). */
export const Teams: React.FC<{b: Beats}> = ({b}) => {
  const lean0 = b.how - 0.1;
  const order = (team: Member[]) => [...team].sort((p, q) => Number(!!q.back) - Number(!!p.back));
  return (
    <>
      {order(TEAM_A).map((m) => {
        const i = m.rise;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamA + i * 0.1} raiseAt={m.tablet ? b.tablets : undefined} poseAt={b.look} leanAt={lean0 + i * 0.02} leanDir={1} />;
      })}
      {order(TEAM_B).map((m) => {
        const i = m.rise;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamB + i * 0.08} raiseAt={m.tablet ? b.tablets + 0.07 : undefined} poseAt={b.look} leanAt={lean0 + i * 0.02} leanDir={-1} />;
      })}
    </>
  );
};

/** The messenger (scene05/messenger.tsx), popping up with team B. */
export const MessengerDash: React.FC<{b: Beats}> = ({b}) => <MessengerRun b={b} Pop={PopRise} />;

/** The two scan beams: from each raised tablet's top to the lock detail; they shoot out on 'AI'+0.25, sweep the banner in
 *  opposite phase, converge on the lock on 'figured' and retract the moment the ring finds it ('out'-0.04). Fix round 2:
 *  OPAQUE white light wedges drawn in the BANNER layer under the plan's cream panels and its re-stroked ink (paper <
 *  beam < cream < ink: every pixel a palette colour). The camera is locked while they live, so the two planes agree. */
export const Beams: React.FC<{b: Beats}> = ({b}) => {
  const pa = tabletOf(TEAM_A.find((m) => m.tablet)!);
  const pb = tabletOf(TEAM_B.find((m) => m.tablet)!);
  const off = TABLET * 0.71;
  const outAt = b.ring + 0.02;
  return (
    <>
      <ScanBeam from={[pa[0] + 3, pa[1] - off]} to={LOCK_C} w0={14} w1={170} at={b.beams} sweep={{amp: 11, hz: 1.1}} convergeAt={b.converge} outAt={outAt} color={palette.white} opacity={1} depth="far" />
      <ScanBeam from={[pb[0] - 3, pb[1] - off]} to={LOCK_C} w0={14} w1={170} at={b.beams + 0.05} sweep={{amp: -11, hz: 1.1}} convergeAt={b.converge} outAt={outAt} color={palette.white} opacity={1} depth="far" />
    </>
  );
};

// ---------------------------------------------------------------- Pip

/** Pip's perch on the bottom rail: the set's perchBottom (620) moved 10 left so his trunk-up wake clears the stamp. */
export const PIP_RAIL: Pt = [BLUEPRINT_WALL.perchBottom[0] - 10, BLUEPRINT_WALL.perchBottom[1]];
/** 1.2 on screen at the 1.13 lock. */
export const PIP_SCALE = 1.2 / 1.13;
/** Pip's leap off the rail after the messenger (fix round 2: a HIGH arc, apex ~world 1100 = screen ~1140, so he clears
 *  the elephant stamp by > 60 px instead of crossing it): take-off 0.04 s into the truck, mid-air (past the apex) on
 *  the cut, travelling right faster than the truck. */
export const pipHop = (b: Beats) => ({t0: b.truck + 0.04, dur: 0.45, to: {x: 1180, y: 1440}, height: 196});

const pipKeys = (b: Beats, t0: number) => [
  {t: -10, pose: 'sleep' as const},
  {t: b.pipWake, pose: 'trunk-up' as const, expression: 'wide' as const},
  {t: t0 - 0.14, pose: 'stand-side' as const, expression: 'wide' as const},
];

/** The roll-over settle on the match cut (S04 leaves him asleep elsewhere on screen: the pop reads as him rolling over
 *  in his sleep): -14 deg and a squash that settle in 0.18 s. */
const rollOver = (t: number) => {
  const u = clamp(t / 0.18);
  return {rot: -14 * (1 - E.outCubic(u)), sq: 0.12 * (1 - E.outCubic(u))};
};

/** Pip ON THE RAIL (banner layer, riding its sway and its parallax): asleep (callback to S04, its leaf still on his
 *  ear), jolts awake on 'it' (trunk-up, wide), crouches; gone at take-off (<PipHop> takes over in the steps plane). */
export const PipOnRail: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const H = pipHop(b);
  if (t >= H.t0) return null;
  const h = hop({t, t0: H.t0, dur: H.dur, from: {x: PIP_RAIL[0], y: PIP_RAIL[1]}, to: H.to, height: H.height});
  const crouch = t >= H.t0 - 0.14;
  const jolt = t >= b.pipWake ? -10 * Math.sin(Math.PI * clamp((t - b.pipWake) / 0.16)) : 0;
  const ro = rollOver(t);
  const el = <ElephantTimeline x={h.x} y={h.y + jolt} scale={PIP_SCALE} t={t} seed={5} keys={pipKeys(b, H.t0)} squash={(crouch ? h.squash : 0) + ro.sq} rotate={0} />;
  return ro.rot !== 0 ? <XG m={mat.about(mat.rotate(ro.rot), PIP_RAIL[0], PIP_RAIL[1])}>{el}</XG> : el;
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

// ---------------------------------------------------------------- S04's leaf (continuity) and the z

/** The sleeping ear (sleep pose, local px at scale 1, feet = (0, 0)): S04 scene04/cast.tsx SLEEP_EAR. */
const SLEEP_EAR: Pt = [14, -25];
/** S04's orange leaf at its landing pose (rot -9, flip 0.48), the same on-screen size relative to Pip. */
const LEAF_S = 12;
const leafD = (s: number) => `M${-s} 0C${-s * 0.5} ${-s * 0.8} ${s * 0.55} ${-s * 0.75} ${s} 0C${s * 0.55} ${s * 0.75} ${-s * 0.5} ${s * 0.8} ${-s} 0Z`;
const leafRib = (s: number) => `M${-s * 1.3} 0.6L${s * 0.75} 0M${-s * 0.1} 0L${s * 0.25} ${-s * 0.32}M${-s * 0.1} 0L${s * 0.25} ${s * 0.32}`;
const LeafShape: React.FC<{x: number; y: number; rot: number; fy: number}> = ({x, y, rot, fy}) => (
  <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(1, fy))}>
    <Fill d={leafD(LEAF_S)} color={palette.sun} offset={false} mode="none" seed="s5leaf" />
    <Ink d={leafD(LEAF_S) + leafRib(LEAF_S)} width={1.6} taper={false} seed="s5leafi" />
  </XG>
);
const EAR: Pt = [PIP_RAIL[0] + SLEEP_EAR[0] * PIP_SCALE, PIP_RAIL[1] + SLEEP_EAR[1] * PIP_SCALE];
/** Where the flicked leaf lands: the second tread, right of the rail's end of the stamp. */
const LEAF_LAND: Pt = [668, 1352];
const LEAF_FALL = 0.25;

/** The leaf on Pip's ear (banner layer, riding the sway and his roll-over) until he jolts awake on 'it'. */
export const LeafOnEar: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  if (t >= b.pipWake) return null;
  const ro = rollOver(t);
  return (
    <XG m={ro.rot !== 0 ? mat.about(mat.rotate(ro.rot), PIP_RAIL[0], PIP_RAIL[1]) : mat.I}>
      <LeafShape x={EAR[0]} y={EAR[1]} rot={-9} fy={0.48} />
    </XG>
  );
};

/** The jolt flicks it off: a 0.25 s tumble (up, spinning, then down) onto the steps, where it stays (steps layer). */
export const LeafFall: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  if (t < b.pipWake) return null;
  const u = clamp((t - b.pipWake) / LEAF_FALL);
  const x = lerp(EAR[0], LEAF_LAND[0], E.outQuad(u));
  const y = lerp(EAR[1], LEAF_LAND[1], u * u) - 46 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.4);
  const rot = -9 + 300 * E.outCubic(u);
  const fy = u < 1 ? 0.48 + 0.5 * Math.abs(Math.sin(u * Math.PI * 2.2)) : 0.42;
  return <LeafShape x={x} y={y} rot={u < 1 ? rot : 8} fy={fy} />;
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

// ---------------------------------------------------------------- Bit: in the drawing, caught on 'bad', stows away

/** Bit's spots: the socket mouth (posing as part of the lock drawing, 18 world = 20 px) and the lock box's top-left
 *  edge (silhouetted on the paper, 21 world = 24 px, legs and antennae clear of the linework). */
const SOCKET: Pt = (() => {
  const p = lp(LOCK.peek[0], LOCK.peek[1]);
  return [p[0] - 1, p[1] + 1];
})();
const EDGE: Pt = lp(-33, -50);
const HOP_OUT = 0.22;
/** The leap onto the messenger's collar (S06: Bit hides in the collar and peeks out on 'gave'). */
const LEAP = {dur: 0.24, height: 150, sit: 0.05, duck: 0.1};

function bitOnLockAt(t: number, outAt: number): {x: number; y: number; size: number; flip: boolean; out: boolean} {
  const arc = (a: Pt, c: Pt, u: number, hgt: number): Pt => [lerp(a[0], c[0], u), lerp(a[1], c[1], u) - hgt * 4 * u * (1 - u)];
  if (t < outAt) return {x: SOCKET[0], y: SOCKET[1], size: 18, flip: true, out: false};
  if (t < outAt + HOP_OUT) {
    const u = E.inOutSine((t - outAt) / HOP_OUT);
    const p = arc(SOCKET, EDGE, u, 26);
    return {x: p[0], y: p[1], size: lerp(18, 21, u), flip: true, out: true};
  }
  return {x: EDGE[0], y: EDGE[1], size: 21, flip: false, out: true};
}

/** Bit poses as part of the lock drawing in the socket mouth (banner layer). Caught on 'bad': his ink '!' balloon pops
 *  0.08 s BEFORE the word (readable on it) and he hops OUT onto the lock box's top-left edge ON the word, looking up at
 *  the hand; at `leapAt` he leaves the plan (<BitLeap> takes over in the steps layer) and the balloon pops off. */
export const BitOnLock: React.FC<{alertAt: number; balloonAt: number; leapAt: number}> = ({alertAt, balloonAt, leapAt}) => {
  const t = useTime();
  const s = bitOnLockAt(t, alertAt);
  const showAlert = t >= balloonAt && t < leapAt;
  return (
    <>
      {t < leapAt ? <Bit x={s.x} y={s.y} size={s.size} flip={s.flip} look={s.out ? 'up' : 'forward'} seed="s5bit" /> : null}
      {showAlert ? <AlertBubble x={ALERT[0]} y={ALERT[1]} tail={[EDGE[0], EDGE[1] - 12]} at={balloonAt} /> : null}
    </>
  );
};

/** Bit's leap (steps layer): from the lock box edge (where the banner layer shows it) along a high arc onto the
 *  messenger's right collar (tracking it as he starts to run), a 0.05 s sit, then he ducks INTO the collar (clipped at
 *  the collar line) by ~19.63: S06's stowaway, peeking out of the same collar on 'gave'. */
export const BitLeap: React.FC<{b: Beats; leapAt: number}> = ({b, leapAt}) => {
  const t = useTime();
  const id = 'bl5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < leapAt) return null;
  const tl = t - leapAt;
  const duck0 = LEAP.dur + LEAP.sit;
  if (tl > duck0 + LEAP.duck) return null;
  const cam = camAt(t, b.end);
  const steps = layerCam(cam, LAYER_F.steps);
  const from = toWorld(steps, toScreen(layerCam(cam, LAYER_F.banner), EDGE));
  const to = collarAt(t, b);
  if (tl < LEAP.dur) {
    const u = E.inOutSine(tl / LEAP.dur);
    const x = lerp(from[0], to[0], u);
    const y = lerp(from[1], to[1], u) - LEAP.height * 4 * u * (1 - u);
    return <Bit x={x} y={y} size={lerp(21, 20, u)} state="hop" look="forward" seed="s5bit" />;
  }
  const k = clamp((tl - duck0) / LEAP.duck);
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={to[0] - 60} y={to[1] - 80} width={120} height={80 + 1.5} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Bit x={to[0]} y={to[1] + k * 20 * 0.9} size={20} state="ride" look={k > 0 ? 'down' : 'forward'} seed="s5bit" />
      </g>
    </>
  );
};

/** Where the '!' balloon sits: up-left of the lock, OUTSIDE the found ring (r92), below the L6 slip. */
const ALERT: Pt = [392, 856];

/** A white balloon (r 30 world = 34 px on screen) with a bold ink '!' and a tail toward Bit: it pops (7 % spring) and
 *  holds. */
const AlertBubble: React.FC<{x: number; y: number; tail: Pt; at: number}> = ({x, y, tail, at}) => {
  const t = useTime();
  if (t < at) return null;
  const r = 30;
  const dx = tail[0] - x;
  const dy = tail[1] - y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  // the tail: a short wedge from the balloon edge toward Bit (stops ~16 px short of him)
  const b0: Pt = [x + ux * r * 0.7 - uy * 10, y + uy * r * 0.7 + ux * 10];
  const b1: Pt = [x + ux * r * 0.7 + uy * 10, y + uy * r * 0.7 - ux * 10];
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
      <Ink d={circleOpen + tailD} width={2.8} taper={false} vary={0} order="all" seed="s5bub" />
      <AlertMark x={x} y={y - 2} size={38} seed="s5alert" />
    </XG>
  );
};
