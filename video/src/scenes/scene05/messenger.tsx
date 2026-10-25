// S05 messenger (fix round 2): team B's rightmost investigator, the SHARED props Messenger (seed 's5msg': ink hair,
// tealDark collar band, the envelope pulled to his RIGHT shoulder: exactly what S06 picks up). On 'was.' he pops into a
// 3/4-back RUN: the props Messenger clipped at the hip and leaned 9 deg into the run, over a local 4-pose leg cycle
// (contact R, passing L-up, contact L, passing R-up) at 10 poses/s on jointed legs (props FigureArm geometry: thigh,
// knee, shin, trouser hem, shoe), a 5-6 px body bob per step and a coat-tail flick. He accelerates out from his spot
// (0.3 s ramp, so the stride reads while he is still left of x 950 on screen) to 27 screen px/frame on the cut, half out
// of frame right, on the passing pose with his RIGHT foot up (S06's first frame: the kit walk's right leg lifted).
// World px (steps layer, parallax 1.0), scene seconds.
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, prog, useTime} from '../../lib/time';
import {rng} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {PERSON_LEGS, PERSON_SHOES, PERSON_HAIR} from '../../lib/kit';
import {mat, XG} from '../../lib/xf';
import {blob, polyPath, Pt} from '../../lib/sketch';
import {BLUEPRINT_WALL} from '../shared/sets';
import {FigureArm, Messenger} from '../shared/props';
import {camAt, Cam} from './camera';
import type {Beats} from './beats';
import {FIG_H, LEG, personGeo, TORSO} from './shims';

const FEET = BLUEPRINT_WALL.feetY; // 1470
/** The messenger: right of team B (screen x ~845 at rest), 1.12 x the round-1 size (the teams' baseline mid-ground). */
export const MESSENGER = {x: 810, h: 152, seed: 's5msg'};
const S = MESSENGER.h / FIG_H;
const G = personGeo(MESSENGER.seed);
/** props Figures inkFor(h >= 120) = 3.4 on screen, in person units. */
const W = 3.4 / S;

/** The kit Person's seeded trouser / shoe colours for the props Messenger (hair 'short', body teal and acc given: draws
 *  w, hr, round, hairColor, legs, shoes). */
const KIT = (() => {
  const r = rng(`person/${MESSENGER.seed}`);
  r.next();
  r.next();
  r.next();
  r.pick(PERSON_HAIR);
  return {legs: r.pick(PERSON_LEGS), shoes: r.pick(PERSON_SHOES)};
})();

// ---------------------------------------------------------------- the dash

/** His dash, in SCREEN px relative to the trucking camera: from 'was.' an accelerating run (0.3 s ramp) then ~810
 *  screen px/s (27 px/frame, S06's entry); his centre ~1080 on the cut (half of him still in frame). */
export const DASH = {v: 810, ramp: 0.3};
export function messengerScreenDx(t: number, b: Beats): number {
  const tau = t - b.was;
  if (tau <= 0) return 0;
  return tau < DASH.ramp ? (DASH.v * tau * tau) / (2 * DASH.ramp) : DASH.v * (tau - DASH.ramp / 2);
}
/** His world x (steps plane, f = 1): he rides the truck plus his own screen dash. */
export const messengerX = (t: number, b: Beats, cam: Cam) => MESSENGER.x + (cam.x - 540) + messengerScreenDx(t, b) / cam.zoom;

// ---------------------------------------------------------------- the run cycle

type Leg = {knee: Pt; ankle: Pt; foot: number};
/** A leg from thigh / shin angles (deg from straight down, + = forward = +x) and a foot angle (deg, + = toe up). */
const leg = (thigh: number, shin: number, foot: number): Leg => {
  const a = (thigh * Math.PI) / 180;
  const b = (shin * Math.PI) / 180;
  const knee: Pt = [31 * Math.sin(a), 31 * Math.cos(a)];
  return {knee, ankle: [knee[0] + 31 * Math.sin(b), knee[1] + 31 * Math.cos(b)], foot};
};
const REACH = leg(30, 12, -10); // the forward leg at contact (heel strike)
const KICK = leg(-28, -75, 62); // the trailing leg at contact (sole up behind)
const STANCE = leg(-4, -8, 0); // the planted leg at passing
const TUCK = leg(40, -35, 22); // the lifted leg at passing (knee up, foot tucked)
/** The four poses: [right leg, left leg, coat-tail flick, airborne lift]. */
const POSES: {R: Leg; L: Leg; flick: number; up: number}[] = [
  {R: REACH, L: KICK, flick: 14, up: 0}, // contact R
  {R: STANCE, L: TUCK, flick: 6, up: 2}, // passing, left foot up
  {R: KICK, L: REACH, flick: 14, up: 0}, // contact L
  {R: TUCK, L: STANCE, flick: 6, up: 2}, // passing, RIGHT foot up (the cut's pose: S06's first frame)
];
/** Pose index at t: 10 poses/s from 'was.', starting on (and, 0.4 s on, ending the scene on) passing-R-up. */
const poseIdx = (t: number, b: Beats) => (Math.floor((t - b.was) / 0.1 + 1e-6) + 3) % 4;
const HIP = 13; // hip joints at +-13 (3/4 back: the legs close together)

/** Body lift (person units, + = down) so the lowest shoe sole sits on the feet line, minus the airborne lift. */
function bodyDrop(p: (typeof POSES)[number]): number {
  const low = Math.max(p.R.ankle[1], p.L.ankle[1]) + 6;
  return LEG + 2 - low - p.up * 2;
}

const shoeD = (a: Pt, foot: number): string => {
  // heel at the ankle, toe forward (+x), sole 6 below the ankle, rotated by the foot angle (toe up = +)
  const r = (-foot * Math.PI) / 180;
  const P = (x: number, y: number): Pt => [a[0] + x * Math.cos(r) - y * Math.sin(r), a[1] + x * Math.sin(r) + y * Math.cos(r)];
  return polyPath([P(-7, -5), P(12, -6), P(22, -1), P(23, 6), P(-7, 6)]);
};

/** The two legs (person units, hip line at y 0): the trailing / lifted one first, then the planted / reaching one. */
const RunLegs: React.FC<{p: (typeof POSES)[number]}> = ({p}) => {
  const one = (l: Leg, hx: number, k: string) => {
    const hip: Pt = [hx, -4];
    const knee: Pt = [hx + l.knee[0], l.knee[1]];
    const ankle: Pt = [hx + l.ankle[0], l.ankle[1]];
    const sd = shoeD(ankle, l.foot);
    return (
      <g key={k}>
        <FigureArm sh={hip} hand={ankle} elbow={knee} w={26} coat={KIT.legs} W={W * 0.9} hand2={false} seed={`s5run/${k}`} />
        <Fill d={sd} color={KIT.shoes} offset={false} mode="none" seed={`s5run/${k}s`} />
        <Ink d={sd} width={W * 0.8} taper={false} seed={`s5run/${k}si`} />
      </g>
    );
  };
  const rBack = p.R === KICK || p.R === TUCK;
  return <>{rBack ? [one(p.R, HIP, 'R'), one(p.L, -HIP, 'L')] : [one(p.L, -HIP, 'L'), one(p.R, HIP, 'R')]}</>;
};

/** The coat-tail flick at his back (left) hem corner, flaring out with each contact. */
const CoatTail: React.FC<{f: number}> = ({f}) => {
  const hw = G.w * 0.5 * 1.07;
  const A: Pt = [-hw + 1, -20];
  const B: Pt = [-hw - f, 4 + f * 0.25];
  const C: Pt = [-hw + 16, 1];
  const f2 = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return (
    <>
      <Fill d={polyPath([A, B, C])} color={palette.teal} offset={false} mode="none" seed="s5tail" />
      <Ink d={`M${f2(A)}L${f2(B)}L${f2(C)}`} width={W} taper={false} seed="s5tailI" />
    </>
  );
};

/** Lean of the upper body into the run (deg), the pose pop at 'was.'. Fix round 4 (the cut snapped from this lean to
 *  S06's upright walk): it eases down to LEAN_CUT over 0.14 s and holds it for the last 4 frames (a brisk stride into
 *  the cut, not a dash). */
const LEAN = 9;
const LEAN_CUT = 3.5;
const leanAt = (t: number, b: Beats) => lerp(LEAN, LEAN_CUT, E.inOutSine(prog(t, b.end - 0.27, 0.14)));

export type MsgState = {x: number; running: boolean; hip: Pt; lean: number; drop: number; idx: number};

/** Where he is and how he stands at t (world, steps layer). */
export function messengerState(t: number, b: Beats): MsgState {
  const cam = camAt(t, b.end);
  const x = messengerX(t, b, cam);
  const running = t >= b.was;
  if (!running) return {x, running, hip: [x, FEET - LEG * S], lean: 0, drop: 0, idx: -1};
  const idx = poseIdx(t, b);
  const drop = bodyDrop(POSES[idx]);
  return {x, running, hip: [x, FEET - LEG * S + drop * S], lean: leanAt(t, b), drop, idx};
}

/** The right collar point (world): where Bit lands and ducks in (S06's stowaway spot). */
export function collarAt(t: number, b: Beats): Pt {
  const st = messengerState(t, b);
  const p: Pt = [st.hip[0] + G.w * 0.3 * S, st.hip[1] - (TORSO - 6.5) * S];
  if (!st.lean) return p;
  const a = (st.lean * Math.PI) / 180;
  const dx = p[0] - st.hip[0];
  const dy = p[1] - st.hip[1];
  return [st.hip[0] + dx * Math.cos(a) - dy * Math.sin(a), st.hip[1] + dx * Math.sin(a) + dy * Math.cos(a)];
}

/** Pops up with team B (PopRise from cast.tsx), stands, raises the envelope; runs from 'was.'. */
export const MessengerRun: React.FC<{b: Beats; Pop: React.FC<{at: number; x: number; y: number; children?: React.ReactNode}>}> = ({b, Pop}) => {
  const t = useTime();
  const id = 'mr5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const st = messengerState(t, b);
  if (!st.running) {
    return (
      <Pop at={b.teamB + 0.24} x={MESSENGER.x} y={FEET}>
        {/* fix round 3: the flat sand contact sliver under his soles (as the teams'): he stands ON the landing */}
        <Fill d={blob(st.x, FEET + 1.5 * S, G.w * 0.52 * S, 4.2 * S, {seed: 's5msg/cs'})} color={palette.sand} offset={false} mode="none" seed="s5msg/csf" />
        <Messenger x={st.x} y={FEET} h={MESSENGER.h} pullAt={b.pull} bob={1.2} seed={MESSENGER.seed} />
      </Pop>
    );
  }
  const p = POSES[st.idx];
  const local = mat.compose(mat.translate(st.hip[0], st.hip[1]), mat.scale(S));
  // the pose pop on 'was.': one frame of squash into the run
  const pop = t - b.was < 1 / 30 ? 0.94 : 1;
  return (
    <XG m={mat.about(mat.scale(1, pop), st.x, FEET)}>
      <XG m={local}>
        <RunLegs p={p} />
      </XG>
      <XG m={mat.about(mat.rotate(st.lean), st.hip[0], st.hip[1])}>
        <XG m={local}>
          <CoatTail f={p.flick} />
        </XG>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <rect x={st.x - 400} y={st.hip[1] - 800} width={800} height={800 + 1.5} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`}>
          <Messenger x={st.x} y={FEET + st.drop * S} h={MESSENGER.h} pullAt={b.pull} seed={MESSENGER.seed} />
        </g>
      </XG>
      <SpeedLines t={t} at={b.truck + 0.02} x={st.x} />
    </XG>
  );
};

/** Three short ink speed lines trailing the dash (cartoon exit), drawn in world px behind his left side. */
const SpeedLines: React.FC<{t: number; at: number; x: number}> = ({t, at, x}) => {
  if (t < at) return null;
  const q = clamp((t - at) / 0.1);
  const y0 = FEET - MESSENGER.h * 0.5;
  const len = 56 * q;
  const x1 = x - 52;
  const d = `M${x1} ${y0}H${x1 - len}M${x1 + 6} ${y0 + 26}H${x1 + 6 - len * 0.8}M${x1 - 4} ${y0 - 24}H${x1 - 4 - len * 0.6}`;
  return <Ink d={d} width={3} taper={false} seed="s5speed" />;
};

/** Run-pose index at t (-1 = standing): for checks. */
export const runPoseAt = (t: number, b: Beats) => (t < b.was ? -1 : poseIdx(t, b));
