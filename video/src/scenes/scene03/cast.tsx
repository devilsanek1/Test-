// S03 cast: Pip (his drop in from S02, the stamp bounce, the proud puff, the glance, the hop-off crouch), Bit riding the
// pen-nib sign, and the street life ('everyone': six small walkers pop up out of the plan like the buildings, a walker
// steps out of a doorway, one stops and looks up, one waves; the two near walkers slide in at the frame edges).

import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, speedLines} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {ElephantTimeline, PoseKey, popSwitch, poseAt} from '../../lib/mascot';
import {BLUEPRINT, popUpK} from '../shared/sets';
import {Bit, Citizen, EdgeOnlooker} from '../shared/props';
import type {Acc, Hair} from '../../lib/kit';
import {beats, S03_END, S03_START, type Beats} from './beats';
import {CAM_REST} from './camera';
import {ROOF_SIGN, signAngle} from './plan';
import type {Pt} from '../../lib/sketch';

// ---------------------------------------------------------------- Pip

const PIP_SCALE = 1.2;
/** A1 polish (blocker: S02 still steers its hop-out to the FR2 pickup, so S03's FR3 arc, which started higher on a
 *  different parabola, made Pip jump ~(-172, -74) px against his fall on the cut): S03 now picks Pip up EXACTLY where
 *  S02's live hop-out leaves him. On S02's last film frame (8.3667, scene02 LAST_FRAME_ABS) S02's Hermite ends at its
 *  `S03_PICKUP.screen` (860, 906) (his FEET, screen px; S03's rest framing = S02's at the cut). From there S03 runs ONE
 *  ballistic arc (gravity PIP_G, the sideways speed easing up from S02's) onto the stamp's rump on 'in'. S02's last vertical step is ~+32 px/frame
 *  (its Hermite brakes into the pickup: +45, +56, +32), so the arc's first step is chosen to CONTINUE that step (~+30,
 *  then rising every frame to ~+59 at contact) rather than S02's instantaneous end tangent (+257 px/s = +9 px/frame,
 *  which braked to +12-16 on S03's first frames, the earlier finding). Horizontally -31 (S02's last step) easing up to
 *  -48 px per frame at contact. If S02 moves its pickup, update PIP_HANDOFF here (or S02 imports it). */
export const PIP_HANDOFF = {
  /** absolute time of S02's last film frame (30 fps): frame 251 */
  t: Math.floor(S03_START * 30 - 1e-6) / 30,
  /** Pip's FEET on that frame, SCREEN px (scene02 S03_PICKUP.screen) */
  screen: [860, 906] as Pt,
};
/** The arc's gravity (screen px/s2 at S03's rest zoom 1.0): ~physical for a 115 px elephant; chosen so the first S03
 *  step continues S02's last one (~30 px/frame) and the landing still falls on 'in'. */
export const PIP_G = 2400;
/** Fix round 1: Pip sits on the stamp's RUMP (its right end), not its centre (BLUEPRINT.pip (350, 1420) hid ~80 % of
 *  the print): the reversed-out elephant faces left, so its trunk, ear and legs stay clear. Fix round 3: the stamp and
 *  Pip moved 22 px left (STAMP in stamp.tsx) so the title card clears his rump and the print's tip by >= 30 px. Screen
 *  at the 1.04 lock: (387.1, 1438.4), where he crouches on the cut (S04 imports this and continues from there). */
export const PIP_AT: Pt = [398, 1405];
/** S02's last horizontal step (its Hermite's feet, -9, -19, -31 px over film f248-f251): the arc starts at this
 *  sideways speed and eases up to ~-48 px/frame at contact (a constant -40 jumped the centroid step from S02's -24 to
 *  S03's -41 on the cut). */
const PIP_VX_HANDOFF = -930;
/** The arc, from S02's last frame (world = screen - (0, 10) under S03's rest camera): position p0 at scene-local tL,
 *  velocity v0, constant acceleration acc (x: the sideways ease-up, y: gravity), landing on the stamp's rump at
 *  b.pipLand ('in'). */
const ARC = (() => {
  const b = beats();
  const p0: Pt = [PIP_HANDOFF.screen[0] - 540 + CAM_REST.x, PIP_HANDOFF.screen[1] - 960 + CAM_REST.y];
  const tL = PIP_HANDOFF.t - S03_START; // S02's last frame, scene-local (~ -0.026)
  const T = b.pipLand - tL;
  const ax = (2 * (PIP_AT[0] - p0[0] - PIP_VX_HANDOFF * T)) / (T * T);
  const vyL = (PIP_AT[1] - p0[1] - 0.5 * PIP_G * T * T) / T;
  return {p0, tL, T, v0: [PIP_VX_HANDOFF, vyL] as Pt, acc: [ax, PIP_G] as Pt};
})();
/** Pip on the arc at scene-local `tl` (world feet + velocity, world px/s); clamped to [tL, landing]. */
function arcAt(tl: number): {p: Pt; v: Pt} {
  const tau = Math.min(Math.max(tl - ARC.tL, 0), ARC.T);
  return {
    p: [ARC.p0[0] + ARC.v0[0] * tau + 0.5 * ARC.acc[0] * tau * tau, ARC.p0[1] + ARC.v0[1] * tau + 0.5 * ARC.acc[1] * tau * tau],
    v: [ARC.v0[0] + ARC.acc[0] * tau, ARC.v0[1] + ARC.acc[1] * tau],
  };
}
/** Where Pip is on the hard cut (world, = screen - (0, 10) at the rest camera) and his vertical speed there. */
export const PIP_FROM: Pt = arcAt(beats().cut).p;
export const PIP_VY0 = arcAt(beats().cut).v[1];
/** Pip faces LEFT (flip) in his hop-off crouch at the cut (polish round 1): S04 must keep `flip` true through its
 *  settle-hop so he never flips across the cut (import this). */
export const PIP_CUT_FLIP = true;

/** Pip's body tilt into the fall at contact (screen deg, feet first). */
const FALL_TILT = 20;

/** Max total squash (incl. the pose pops) so Pip's head keeps its silhouette (sy >= 0.75). */
const SQUASH_CAP = 0.25;
/** The hop-off crouch (A1 fix round 1): total squash from the stand-side pop to the cut (ease-in), and its lean toward
 *  screen-left (deg, the way S04's hop takes him), about his feet. */
const CROUCH = [0.14, 0.28];
const CROUCH_LEAN = -3;

/** Pip's arc at scene-local time `tl` (valid from S02's last frame, tl = PIP_HANDOFF.t - S03_START ~ -0.026, where it
 *  returns PIP_HANDOFF.screen, to the landing), in SCREEN px under S03's rest camera (540, 950, 1.0) = S02's framing
 *  of the same screen, and his velocity (screen px/s). A Phase-B cut agent can give S02's Hermite this end velocity
 *  (`pipDropState(PIP_HANDOFF.t - S03_START).v`, ~(-930, +850)) so its last frames stop braking. */
export function pipDropState(tl: number): {screen: Pt; v: Pt} {
  const {p, v} = arcAt(tl);
  return {screen: [p[0] - CAM_REST.x + 540, p[1] - CAM_REST.y + 960], v: [v[0] * CAM_REST.zoom, v[1] * CAM_REST.zoom]};
}

/** Pip's pose on the arc at the cut (what S02's hop-out arrives at on its last frame): stand-side, spread 0.85, FLIPPED
 *  (facing left), stretch -0.2, screen rotation +6 deg (the body axis leaning into the fall), scale 1.2 on screen. */
export const PIP_CUT_POSE = {pose: 'stand-side', amount: 0.85, flip: true, squash: -0.2, rotate: 6, scale: PIP_SCALE} as const;

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

/** Pip's shadow on the plan under his landing point: a flat tan ellipse that GROWS as he falls (so the drop reads as a
 *  drop toward the plan, not a slide along the horizon); he lands on it; the stamp's print covers it. Ground layer. */
export const PipShadow: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  if (t >= b.contact) return null;
  const u = E.inQuad(clamp((t - b.cut) / (b.pipLand - b.cut)));
  const rx = lerp(14, 50, u);
  const ry = lerp(5, 15, u);
  const [x, y] = [PIP_AT[0] - 2, PIP_AT[1] + 3];
  return <Fill d={`M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`} color={palette.tan} offset={false} mode="none" seed="s03/pipsh" />;
};

export const PipS03: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const t0 = b.cut; // picks S02's hop-off up at the hard cut (S02 takes off at cut(password)-0.04)
  const printLand = b.contact; // the stamp's print CONTACT (ring 0.06 + drop 0.10): the jolt and the bounce start here
  const b1 = {at: printLand, T: 0.4, h: 64};
  const b2 = {at: printLand + 0.4, T: 0.25, h: 16};
  const settle = b2.at + b2.T;

  const keys: PoseKey[] = [
    {t: -10, pose: 'stand-side', amount: 0.85},
    {t: b.pipLand, pose: 'sit-back', look: 0.25},
    // 'loves': pride, straight-faced (fix round 3: SMUG, not happy: the 'happy' U-arc eyes + pink cheeks read as a
    // generic happy face): sit-front, half-lidded ('meh' heavy lids over open eyes) + the closed smile, chin up, chest out
    {t: b.loves, pose: 'sit-front', expression: 'meh', look: 0},
    // 'about' (fix round 3): the gag's button: he drops the pose, eyes open, and looks up-right at the sun pie, so he
    // watches the count
    {t: b.proudOff, pose: 'sit-front', expression: 'neutral', look: 0.55},
    // 'run': the glance down the street (open eyes, look 0.85, and a +5 deg lean toward the VP below)
    {t: b.run, pose: 'sit-front', expression: 'neutral', look: 0.85},
    {t: b.pipHop, pose: 'stand-side', amount: 0},
  ];

  let x = PIP_AT[0];
  let y = PIP_AT[1];
  let squash = 0;
  let rotate = 0;
  let smear: React.ReactNode = null;
  let crouchLean = 0;
  let ghost: React.ReactNode = null;
  if (t < b.pipLand) {
    // the drop: S02's live hop-out continued from its last frame (PIP_HANDOFF: one arc, g 2,400, the sideways speed easing up from S02's),
    // falling down-left onto the bare plan. Fix round 3 (finding: the last frames moved ~75 px/frame on flat ink, a
    // jump-cut): the body STRETCHES along the velocity as he speeds up (-0.2 at the cut, S02's hand-off, -> -0.28 at
    // contact; the pose key's anticipation squash is cancelled here, it would fight the stretch) and its axis turns into
    // the fall (screen +6 deg at the cut, S02's hand-off pose, -> FALL_TILT 20 deg at contact: feet first; the velocity's
    // own angle, ~34 deg, tipped him too far); 3 short ink speed lines trail above him on the last 3 frames.
    const T = b.pipLand - t0;
    const arc = arcAt(t);
    [x, y] = arc.p;
    const u = clamp((t - t0) / T);
    squash = -0.2 - 0.08 * E.inCubic(u) - popSwitch(t, b.pipLand);
    const [vx, vy] = arc.v;
    const velAng = (Math.atan2(-vx, vy) * 180) / Math.PI; // screen deg the body's up axis leans (clockwise +)
    const screenRot = lerp(6, Math.min(velAng, FALL_TILT), E.inQuad(u));
    rotate = -screenRot; // flipped while he falls: the ElephantTimeline gets -rotate (below)
    if (t >= b.pipLand - 0.1) {
      const sp = Math.hypot(vx, vy);
      const ux = -vx / sp;
      const uy = -vy / sp; // the trailing direction (up-right)
      const reach = 108 * PIP_SCALE; // just past the top of his stretched head
      const sx = x + ux * reach;
      const sy = y + uy * reach;
      const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
      smear = <Ink d={speedLines(sx, sy, {n: 3, len: 40, gap: 15, angle: ang, seed: 's03/pipSpd'})} width={2.2} taper={false} seed="s03/pipSpdI" />;
    }
    // A1 fix round 1 (finding: the last frames before contact step ~76 px a frame and read as a jump on a phone): on the
    // last 2 frames an INK-ONLY smear copy of his silhouette (no fill, thinner line) trails half a frame behind him on
    // the arc, so the eye gets an in-between
    if (t >= b.pipLand - 0.07) {
      const g = arcAt(t - 1 / 60).p;
      ghost = <ElephantTimeline x={g[0]} y={g[1]} scale={PIP_SCALE} t={t} seed={3} keys={keys} squash={squash} rotate={screenRot} flip fill={0} lineWeight={0.7} />;
    }
  } else {
    // the impact: his fall tilt (screen FALL_TILT) comes back upright over 2 frames under the landing squash
    rotate = FALL_TILT * (1 - E.outQuad(prog(t, b.pipLand, 0.067)));
    y -= bounce(t, b1.at, b1.T, b1.h) + bounce(t, b2.at, b2.T, b2.h);
    if (t >= b1.at && t < b1.at + b1.T) squash = -0.12 * Math.sin(Math.PI * clamp((t - b1.at) / b1.T));
    squash += landSq(t, b.pipLand, 0.26) + landSq(t, b2.at, 0.18) + landSq(t, settle, 0.12);
    // the slam's impact jolt AT contact (two frames squashed), as the bounce launches him
    if (t >= printLand && t < printLand + 0.07) squash += 0.16 * Math.sin(Math.PI * ((t - printLand) / 0.07));
    // 'loves': the proud PUFF as one clear beat (fix round 3: the 1.10 stretch and -7 deg lean hardly showed at phone
    // size): the chest swells 1.0 -> 1.14 in 3 frames (out-quad, on top of the pose pop's anticipation squash), settles
    // to 1.04 by +0.25 s and HOLDS (the pose stays puffed), chin up -12 deg (out-back); both release on 'about'
    if (t >= b.loves) {
      const d = t - b.loves;
      const puff = d < 0.1 ? -0.14 * E.outQuad(d / 0.1) : lerp(-0.14, -0.04, E.inOutSine(clamp((d - 0.1) / 0.15)));
      squash += puff * (1 - E.inOutSine(prog(t, b.proudOff, 0.12)));
      rotate = -12 * E.outBack(1.6)(prog(t, b.loves, 0.16)) * (1 - E.inOutSine(prog(t, b.proudOff, 0.14)));
    }
    // 'run': the glance down the street: a +5 deg lean toward the VP (out-back, 0.25 s), eased back in the 0.1 s before
    // the hop-off pop
    if (t >= b.run) rotate += 5 * E.outBack(1.6)(prog(t, b.run, 0.25)) * (1 - E.inOutSine(prog(t, b.pipHop - 0.1, 0.1)));
    // the hop-off crouch (S04 owns the leap: take-off after the cut). A1 fix round 1 (finding: from the pose pop to the
    // cut his centroid and bbox were identical for 4 frames: the 0.2 sin crouch grew exactly as fast as the stand-side
    // pop's settle wobble shrank, a dead hold, then S04's first frame is already airborne): the pop is cancelled here
    // and the crouch is driven directly as a TOTAL squash, 0.14 (the pop's peak) -> 0.28 on an ease-in into the cut (feet fixed), so the
    // body keeps sinking (~2, 3, 5 px/frame of centroid) and S04's stretched take-off reads as its release
    if (t >= b.pipHop) {
      const cut = b.cut + (S03_END - S03_START);
      squash = CROUCH[0] + (CROUCH[1] - CROUCH[0]) * E.inQuad(clamp((t - b.pipHop) / (cut - b.pipHop))) - popSwitch(t, b.pipHop);
      crouchLean = CROUCH_LEAN * E.inOutSine(clamp((t - b.pipHop) / (cut - b.pipHop)));
    }
  }
  // fix round 2b (finding: on the landing frames the sit-back pop (0.14) + the landing squash (0.26) flattened his head
  // into his body, ~55 % head height): the TOTAL squash, the timeline's pose pops included, is capped at 0.25, so he
  // stays on model on the impact frame
  if (t < b.pipHop) {
    const {cur, prev, next} = poseAt(keys, t);
    const pops = (prev ? popSwitch(t, cur.t) : 0) + (next ? popSwitch(t, next.t) : 0);
    squash = Math.min(squash, SQUASH_CAP - pops);
  }
  // faces left while dropping in; polish round 1: faces LEFT again from the hop-off pop, the way S04 carries him (S04's
  // settle-hop travels left, screen x ~425 -> ~374): PIP_CUT_FLIP is the contract (S04 keeps flip = true to its landing)
  const flip = t < b.pipLand || (PIP_CUT_FLIP && t >= b.pipHop);
  return (
    <>
      {smear}
      {ghost}
      <XG m={mat.about(mat.rotate(crouchLean), x, y)}>
        <ElephantTimeline x={x} y={y} scale={PIP_SCALE} t={t} seed={3} keys={keys} squash={squash} rotate={flip ? -rotate : rotate} flip={flip} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- Bit on the pen-nib sign

export {signAngle};

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

/** A mitten in local coords (origin = the wrist, -y = along the forearm toward the fingertips): an oval 1.9 wd long,
 *  1.25 wd wide, with a thumb nub on the inner side (side: the arm's side of the body). */
const mitten = (wd: number, side: number): string => {
  const L = wd * 1.9;
  const W = wd * 0.62;
  const tx = -side * W * 0.95;
  return (
    `M${-W} ${-wd * 0.2}C${-W} ${-L * 0.75} ${-W * 0.7} ${-L} 0 ${-L}C${W * 0.7} ${-L} ${W} ${-L * 0.75} ${W} ${-wd * 0.2}` +
    `C${W} ${wd * 0.3} ${-W} ${wd * 0.3} ${-W} ${-wd * 0.2}Z` +
    `M${tx} ${-L * 0.28}c${-side * wd * 0.42} ${-wd * 0.12} ${-side * wd * 0.5} ${-wd * 0.62} ${-side * wd * 0.12} ${-wd * 0.8}c${side * wd * 0.2} ${-wd * 0.08} ${side * wd * 0.3} ${wd * 0.1} ${side * wd * 0.3} ${wd * 0.3}Z`
  );
};

/** Two tiny motion ticks beside a waving hand at `hd` (sleeve width wd), on side `dir` (+1 right, -1 left): short arcs
 *  that read as 'waving' at phone size. */
const waveTicks = (hd: Pt, wd: number, dir: number): string => {
  const at = (rr: number, deg: number): string => {
    const a = (deg * Math.PI) / 180;
    return `${(hd[0] + dir * rr * Math.cos(a)).toFixed(1)} ${(hd[1] + rr * Math.sin(a)).toFixed(1)}`;
  };
  let d = '';
  for (const rr of [wd * 2.1, wd * 3.2]) d += `M${at(rr, -64)}L${at(rr * 1.04, -45)}L${at(rr, -26)}`;
  return d;
};

/** One small walker: pops up out of the plan (scaleY 0 -> 1.06 -> 1 about the feet), walks / stops / looks up / waves /
 *  bobs on 'run'. */
const SmallWalker: React.FC<{w: Walker; bobAt: number}> = ({w, bobAt}) => {
  const t = useTime();
  const k = popUpK(t, w.at, 0.08);
  if (k <= 0.001) return null;
  const p = walkerPos(w, t);
  const bob = t >= bobAt && t < bobAt + 0.24 ? 5 * Math.sin(Math.PI * ((t - bobAt) / 0.24)) * (p.h / 100) : 0;
  // the look-up (A1, finding: a 5 deg lean changed < 2,000 px2 a frame and did not register as an event, leaving the
  // bait's longest gap at 0.73 s): he leans back 9 deg (out-back, 0.2 s) and lifts the street-side hand to his brow,
  // shading his eyes to look up at the press house; held ~1.75 s, then the hand drops (0.15 s)
  const lookK = w.lookUpAt !== undefined && t >= w.lookUpAt ? E.outBack(1.6)(clamp((t - w.lookUpAt) / 0.2)) * (1 - E.inOutSine(prog(t, w.lookUpAt + 1.75, 0.15))) : 0;
  const lean = -9 * lookK;
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
        {/* fix round 3 (finding: a pale disc on a stick arm read as a lollipop): the hand is a MITTEN in the sleeve
            colour, outlined, and two tiny motion ticks flick on the side the wave swings toward */}
        <XG m={mat.compose(mat.translate(hd[0], hd[1]), mat.rotate(ang + 90))}>
          {/* the mitten: an oval along the arm (its long axis = the forearm's), a thumb nub on the inner side */}
          <Fill d={mitten(wd, side)} color={w.body ?? palette.teal} offset={false} mode="none" seed={`s03/hand${w.id}`} />
          <Ink d={mitten(wd, side)} width={1.5} taper={false} seed={`s03/handI${w.id}`} />
        </XG>
        {raise > 0.6 ? <Ink d={waveTicks(hd, wd, Math.cos((t - w.waveAt) * Math.PI * 2 * 3) >= 0 ? side : -side)} width={1.5} taper={false} seed={`s03/wv${w.id}`} /> : null}
      </>
    );
  }
  // the brow hand: upper arm out and up to the elbow, forearm back in to the brow, a sleeve-coloured mitten at the
  // forehead (drawn over the figure: the arm is raised in front of the head's side)
  let brow: React.ReactNode = null;
  if (lookK > 0.02) {
    const side = p.x < VP[0] ? 1 : -1;
    const q = Math.min(1, lookK);
    const sh: Pt = [p.x + side * p.h * 0.13, fy - p.h * 0.66];
    const rest: Pt = [p.x + side * p.h * 0.16, fy - p.h * 0.36];
    const el: Pt = [lerp(rest[0], p.x + side * p.h * 0.29, q), lerp(rest[1], fy - p.h * 0.76, q)];
    const hd: Pt = [lerp(rest[0], p.x + side * p.h * 0.1, q), lerp(rest[1] + p.h * 0.1, fy - p.h * 0.9, q)];
    const wd = Math.max(2.4, p.h * 0.06);
    const d = `M${sh[0].toFixed(1)} ${sh[1].toFixed(1)}L${el[0].toFixed(1)} ${el[1].toFixed(1)}L${hd[0].toFixed(1)} ${hd[1].toFixed(1)}`;
    const ang = (Math.atan2(hd[1] - el[1], hd[0] - el[0]) * 180) / Math.PI;
    brow = (
      <>
        <Ink d={d} width={wd + 3.2} color={palette.ink} taper={false} cap="round" seed={`s03/brow${w.id}o`} />
        <Ink d={d} width={wd} color={w.body ?? palette.teal} taper={false} cap="round" seed={`s03/brow${w.id}i`} />
        <XG m={mat.compose(mat.translate(hd[0], hd[1]), mat.rotate(ang + 90))}>
          <Fill d={mitten(wd, side)} color={w.body ?? palette.teal} offset={false} mode="none" seed={`s03/browH${w.id}`} />
          <Ink d={mitten(wd, side)} width={1.5} taper={false} seed={`s03/browHI${w.id}`} />
        </XG>
      </>
    );
  }
  return (
    <XG m={mat.compose(mat.about(mat.scale(1, k), p.x, p.y), mat.about(mat.rotate(lean), p.x, fy))}>
      {arm}
      <Citizen x={p.x} y={fy} h={p.h} body={w.body} hair={w.hair} acc={w.acc} walk={p.walking ? {hz: 1.8} : undefined} bob={p.walking ? 0 : 1.0} seed={`s03/w${w.id}`} />
      {brow}
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
    {id: 'door', x: 800, y: 1228, h: 80, at: b.doorway, walkAt: b.doorway + 0.12, pace: 0.05, body: palette.tan, hair: 'bun'},
    // the six: pop up out of the plan near -> far, alternating sides (0.05 s apart)
    {id: 'a', x: 318, y: 1296, h: 146, at: e, body: palette.teal, hair: 'short', acc: ['backpack']},
    {id: 'b', x: 716, y: 1298, h: 140, at: e + 0.05, walkAt: e + 0.4, pace: 0.05, body: palette.brown, hair: 'long'},
    {id: 'c', x: 545, y: 1290, h: 120, at: e + 0.1, body: palette.sage, hair: 'curly', waveAt: b.heads},
    {id: 'd', x: 652, y: 1268, h: 115, at: e + 0.15, walkAt: e + 0.3, stop: b.looksUp, lookUpAt: b.looksUp, pace: 0.07, body: palette.tealDark, hair: 'bun'},
    {id: 'e', x: 400, y: 1248, h: 98, at: e + 0.2, walkAt: e + 0.35, pace: 0.05, body: palette.tan, hair: 'short'},
    {id: 'f', x: 758, y: 1256, h: 101, at: e + 0.25, body: palette.teal, hair: 'beanie'},
  ];
}

/** Fix round 3 (finding: six 98-146 px walkers + two corner onlookers made 'everyone' land weakly next to reference
 *  1's crowded street; the middle distance by the press house was empty pavement): NINE tiny far figures (44-64 px,
 *  back view, hairline ink by size) along both building lines and at the press house's steps, popping up out of the
 *  plan in the same 0.05 s stagger on 'everyone' (interleaved with the six walkers), then STILL (the kit's small idle
 *  bob only), so the bait frame stays calm. All clear of the sticker, the sign and the card (world feet / heights at
 *  the 1.04 lock). Far first in the list. */
const FAR_CROWD: {x: number; y: number; h: number; body: string; hair: Hair; acc?: Acc[]}[] = [
  {x: 488, y: 1186, h: 44, body: palette.sage, hair: 'short'},
  {x: 590, y: 1190, h: 46, body: palette.peach, hair: 'long'},
  {x: 432, y: 1192, h: 50, body: palette.tan, hair: 'bun'},
  {x: 676, y: 1194, h: 50, body: palette.teal, hair: 'curly'},
  {x: 742, y: 1202, h: 54, body: palette.brown, hair: 'short', acc: ['backpack']},
  {x: 352, y: 1208, h: 56, body: palette.tealDark, hair: 'beanie'},
  {x: 616, y: 1214, h: 56, body: palette.sand, hair: 'bun'},
  {x: 776, y: 1232, h: 60, body: palette.sage, hair: 'long'},
  {x: 312, y: 1236, h: 64, body: palette.teal, hair: 'curly'},
];
export const FarCrowd: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  if (t < b.everyone) return null;
  return (
    <>
      {FAR_CROWD.map((f, i) => {
        const k = popUpK(t, b.everyone + 0.025 + i * 0.05, 0.08);
        if (k <= 0.001) return null;
        return (
          <XG key={i} m={mat.about(mat.scale(1, k), f.x, f.y)}>
            <Citizen x={f.x} y={f.y} h={f.h} body={f.body} hair={f.hair} acc={f.acc} bob={0.6} seed={`s03/far${i}`} />
          </XG>
        );
      })}
    </>
  );
};

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

/** The near walkers' sleeve ends. Fix round 2b (finding: each sleeve ended in a bare sand disc under a cuff band, a
 *  'lollipop' hand; ref-2's back-view people show no hands, style bible 6): the hand is TUCKED: a coat-coloured patch
 *  covers the kit's hand disc below the sleeve end (the kit's cuff line stays as the sleeve's edge) and a short pocket
 *  welt under it, slanting toward the body, so the hand reads as in the coat pocket. Offsets from the head centre, from
 *  the kit EdgeOnlooker geometry for these seeds / head sizes (personGeo: 's03/nearL' w 90.1, s 2.323, the near (right)
 *  sleeve x +67..+105, sleeve end +264.6, hand disc to ~+305; 's03/nearR' w 99.4, s 2.191, the near (left) sleeve x
 *  -109..-70, sleeve end +276.7, hand disc to ~+318). If the seed, head size or kit geometry changes, re-measure. */
const NEAR_CUFF = {
  // seam: the sleeve's inner seam line (kept), rim: the white rim strip (redrawn over the patch), outer: the coat's
  // outline (kept), y: the sleeve end (the kit's cuff line, redrawn); measured from renders (fix round 2b)
  L: {seam: 68.4, rim: [100.4, 102.4], outer: 103.2, y: 264.6, side: 1},
  R: {seam: -71.6, rim: [-108.4, -105.6], outer: -109.2, y: 276.7, side: -1},
};
const SleevePocket: React.FC<{x: number; y: number; band: (typeof NEAR_CUFF)['L']; coat: string; seed: string}> = ({x, y, band, coat, seed}) => {
  const sx = band.side;
  const xs = x + band.seam;
  const xo = x + band.outer;
  const yc = y + band.y;
  const [xa, xb] = [Math.min(xs, xo), Math.max(xs, xo)];
  // the patch: from just above the cuff line (the disc's top showed over it) to below the hand disc's ink, between the
  // seam and the outline (both kept)
  const patch = `M${xa} ${yc - 6}L${xb} ${yc - 6}L${xb} ${yc + 46}L${xa} ${yc + 46}Z`;
  const rim = `M${x + band.rim[0]} ${yc - 7}L${x + band.rim[1]} ${yc - 7}L${x + band.rim[1]} ${yc + 47}L${x + band.rim[0]} ${yc + 47}Z`;
  const cuff = `M${xs} ${yc + 0.6}L${xo - sx * 1.5} ${yc}`;
  // the pocket welt: a short slanted stroke under the sleeve end, running in toward the body
  const welt = sx > 0 ? `M${xs - 18} ${yc + 17}Q${(xs + xo) / 2 - 8} ${yc + 13} ${xo - 3} ${yc + 8}` : `M${xo + 3} ${yc + 8}Q${(xs + xo) / 2 + 8} ${yc + 13} ${xs + 18} ${yc + 17}`;
  return (
    <>
      <Fill d={patch} color={coat} offset={false} mode="none" seed={`${seed}/f`} />
      <Fill d={rim} color={palette.white} offset={false} mode="none" seed={`${seed}/r`} />
      <Ink d={cuff} width={2.9} taper={false} seed={`${seed}/c`} />
      <Ink d={welt} width={3.2} taper={false} seed={`${seed}/i`} />
    </>
  );
};

/** The two near walkers: big back-view figures cropped by the frame edges, sliding in on 'everyone' (0.3 s, out cubic),
 *  turning their heads toward the press house at w42+0.30 and bobbing on 'run'.
 *  Polish round 1: raised (L 112, R 84 world px) so the heads sit at screen y ~1400 / ~1360 (they were ~85 % in the
 *  bottom UI zone), still clear of the stamp (L x < 150) and the card (R x > 930); the 'look' tilts each figure 6 deg
 *  about its NECK (head toward the centre, shoulders out), not a 3 deg sway about a pivot under the feet (it slid).
 *  Fix round 2 (they read as flat slabs): both carry their arms again (the near arm: sleeve seam, cuff, sand hand), the
 *  left one a HOOD over short hair and a diagonal bag STRAP, the right one her bun over a coat COLLAR; each has the 3 px
 *  white rim strip on its sun side (the sun is between them: the left figure's right edge, the right figure's left
 *  edge); and both sit 40 px lower so the corners hold head + shoulders + upper arm.
 *  Fix round 2b: no hand discs: the hands are tucked into the coat pockets (SleevePocket). */
export const NearWalkers: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const slide = (side: number, delay: number) => (1 - E.outCubic(prog(t, b.everyone + delay, 0.3))) * 260 * side;
  if (t < b.everyone) return null;
  const turn = (side: number) => -side * 6 * E.outBack(1.4)(prog(t, b.heads, 0.3));
  const bobY = (delay: number) => (t >= b.run + delay && t < b.run + delay + 0.26 ? -7 * Math.sin(Math.PI * ((t - b.run - delay) / 0.26)) : 0);
  const L: Pt = [58, 1420];
  const R: Pt = [1040, 1388];
  const neck = (p: Pt, head: number): [number, number] => [p[0], p[1] + head * 0.62];
  // the kit's idle hip bob (1.5 px), applied here to the figure AND its cuff overlay so they move together
  const idle = (ph: number) => 1.5 * Math.sin(Math.PI * 2 * 0.5 * t + ph);
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0), bobY(0) + idle(0.4)), mat.about(mat.rotate(turn(-1)), ...neck(L, 104)))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" hairColor={palette.brown} acc={['hood', 'strap']} body={palette.teal} rim="right" arms="near" bob={0} seed="s03/nearL" />
        <SleevePocket x={L[0]} y={L[1]} band={NEAR_CUFF.L} coat={palette.teal} seed="s03/pocketL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04) + idle(2.1)), mat.about(mat.rotate(turn(1)), ...neck(R, 112)))}>
        <EdgeOnlooker x={R[0]} y={R[1]} head={112} hair="bun" acc={['collar']} body={palette.tan} rim="left" arms="near" bob={0} seed="s03/nearR" />
        <SleevePocket x={R[0]} y={R[1]} band={NEAR_CUFF.R} coat={palette.tan} seed="s03/pocketR" />
      </XG>
    </>
  );
};
