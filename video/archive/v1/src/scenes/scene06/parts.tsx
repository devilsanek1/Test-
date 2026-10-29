// scene06/parts.tsx — S06 local helpers: the messenger's walk (warped walk clock, stops on a planted stride), his raised
// arm (props FigureArm, the kit's own) + envelope (one state function: carried, lined up with the slot BEFORE 'a', slid
// in on 'a'), the door beat (lean, two knocks), his hero detail (scene06/msgDetail: satchel, seams, soles, peach rim),
// Bit the stowaway, the makers' heads popping UP into the upstairs browser window, Pip (leaps in BEHIND the messenger,
// tiptoes, 'shh' with a J-curled trunk on his lips, ear twitch, leap after the sheet), the 'shh' mark, the blind's jolt
// ticks, and the low sun's shadows (one length rule for everyone on the lane, radial from the sun's ground point).

import React, {useId} from 'react';
import {captionFontStack, clamp, ease as E, Fill, Ink, lerp, line, mat, Mat, osc, palette, prog, Pt, rng, springAt, springs, stroke, useCaptionFont, useTime, XG, polyPath, TimeShift, PERSON_HAIR, PERSON_LEGS, PERSON_SHOES} from '../../lib';
import {useInkScale} from '../../lib/inkComp';
import {Elephant, hop, MASCOT, popSwitch, walkSpeed, breath, trunkSway} from '../../lib/mascot';
import type {PoseName, Expression} from '../../lib/mascot';
import {brush, spline, tp, tpt, polyPath as mPoly} from '../../lib/mascot/ink';
import type {Pt as MPt} from '../../lib/mascot/ink';
import {cappedTube} from '../../lib/mascot/pen';
import {Bit, bitPath, Envelope, FigureArm, Maker, Messenger, messengerHand} from '../shared/props';
import {MAKERS_LANE, walkerAt} from '../shared/sets';
import type {WalkerAnchor} from '../shared/sets';
import {MessengerDetail} from './msgDetail';
import type {Beats} from './beats';
import {camAt} from './camera';
import {speedLines as smearLines} from '../../lib/sketch';

// ---------------------------------------------------------------- the messenger (props Messenger, 260 px)

/** The S05 messenger (src/scenes/scene05/messenger.tsx MESSENGER.seed 's5msg': same coat, trousers, ink hair, collar
 *  band: the props Messenger defaults), closer now. */
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
/** Braking profile: x = x0 + L (1 - (1 - u)^P). P 2.4 enters at ~1100 px/s on screen (S05 exits at ~1200), and still
 *  comes to rest with zero speed on the door beat. */
const BRAKE_P = 2.4;
/** Envelope (60 world wide, 2/3 high). */
const ENV_W = 60;
const ENV_H = ENV_W * 0.66;
/** The slot squeezes it to 92 % of the slot width (props Envelope `slot`). */
const ENV_SX = Math.min(1, (50 * 0.92) / ENV_W);

/** The kit Person's random draws for a seed (mirrors kit/Person makeSpec's draw order with torsoH, hair, acc, body
 *  given: w, hr, round, hairColor, legsColor, shoeColor, packColor, hat, signColor, phase). */
function personDraws(seed: string) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  r.range(0.36, 0.45);
  const hairColor = r.pick(PERSON_HAIR as unknown as string[]);
  const legsColor = r.pick(PERSON_LEGS as unknown as string[]);
  const shoeColor = r.pick(PERSON_SHOES as unknown as string[]);
  for (let i = 0; i < 3; i++) r.next();
  return {w, hr, hairColor, legsColor, shoeColor, phase: r.range(0, 6.28)};
}
const personPhase = (seed: string) => personDraws(seed).phase;

export type MsgWalk = {x: number; tau: number; hz: number; walking: boolean};

/** The messenger's feet x and his walk clock. He comes out of S05's dash still fast (outpacing the camera, so he enters
 *  from the left edge: ~1100 px/s on screen at the cut) and brakes to a stop at the door on B.door. The walk clock tau
 *  runs with the distance covered, so the cadence slows with him; hz is chosen so his last step lands with both feet
 *  down (no leg snap when he stops). */
export function msgWalk(t: number, B: Beats): MsgWalk {
  const D = B.door - B.cut;
  const u = clamp((t - B.cut) / D);
  const frac = 1 - Math.pow(1 - u, BRAKE_P);
  const x = MSG.x0 + (MSG_X1 - MSG.x0) * frac;
  const tau = (D * frac) / 2 + Math.min(0, t - B.cut);
  const tauEnd = D / 2;
  const ph = personPhase(MSG.seed);
  const n = Math.max(1, Math.round(3.4 * tauEnd + ph / Math.PI));
  const hz = (n * Math.PI - ph) / (tauEnd * Math.PI);
  return {x, tau, hz, walking: u < 1};
}

/** The kit walk phase (lib/kit/Person: ph = t * walk * PI + phase) on the messenger's own clock. */
const msgPh = (w: MsgWalk) => w.tau * w.hz * Math.PI + personPhase(MSG.seed);

// ---- the door beat (fix round 1): he leans in, knocks twice with the envelope hand, lines the envelope up with the slot

/** Knock times (film-relative to the beats): on 'people' and 0.12 s later. */
export const knocks = (B: Beats) => [B.people + 0.08, B.people + 0.2];
/** The line-up window (fix round 2: the mail-slot hiccup): the envelope reaches the slot's top BEFORE 'a', so the slide
 *  starts on 'a' with nothing to correct (the props Envelope `slot` align phase used to start below its clip line). */
const alignWin = (B: Beats) => [knocks(B)[1] + 0.02, B.a] as const;

/** Lean toward the door (deg, about his feet): fix round 3, in as he arrives (door + 0.06, 0.2 s: it fills the quiet
 *  pocket between the curtain and the screen), held through the knocks, back upright by 'a' (the slot needs him square). */
function leanAt(t: number, B: Beats): number {
  return 3.2 * (E.outCubic(prog(t, B.door + 0.06, 0.2)) - E.inOutSine(prog(t, B.a - 0.12, 0.12)));
}

/** The envelope hand's offset (person units) and the envelope's extra rotation: a 1-frame jab toward the door per knock
 *  (back in 2 frames), then a small wiggle that squares the envelope to the slot by 'a'. */
function handFx(t: number, B: Beats): {dx: number; dy: number; rot: number} {
  let dx = 0;
  let dy = 0;
  for (const k of knocks(B)) {
    const d = t - k;
    if (d >= -0.034 && d < 0.1) {
      const j = d < 0 ? (d + 0.034) / 0.034 : 1 - E.outQuad(d / 0.1);
      dx += 9 * j;
      dy += -2 * j;
    }
  }
  const [w0, w1] = alignWin(B);
  const wq = prog(t, w0, w1 - w0);
  const rot = wq > 0 && wq < 1 ? 6 * Math.sin(wq * Math.PI * 2) * (1 - wq) : 0;
  return {dx, dy, rot};
}

/** World matrix of the messenger's lean (about his feet). */
const leanMat = (t: number, B: Beats, w: MsgWalk): Mat => {
  const a = leanAt(t, B);
  return a === 0 ? mat.I : mat.about(mat.rotate(a), w.x, MSG.y);
};

export type EnvState = {x: number; y: number; rot: number; sx: number; clipY: number | null; slide: number};

/** THE envelope state (world, before the lean), or null once it is through the slot:
 *   walking   the props Envelope `carry` bob (hz 1.7, amp 3 figure units) on the walk clock
 *   stopped   at the hand + the knock jabs
 *   lining up [knocks[1] + 0.02, 'a']: centre -> (slot x, slot y - h/2) (its bottom edge ON the slot line), square,
 *             squeezed to the slot width, all inOut(sine): at 'a' nothing is left to correct
 *   'a'       slides straight down through the slot (0.22 s, in(quad)), clipped at the slot line. */
export function envState(t: number, B: Beats, w = msgWalk(t, B)): EnvState | null {
  let x: number;
  let y: number;
  let rot: number;
  if (w.walking) {
    const bob = -Math.abs(osc(w.tau, 0.85)) * 3 * S;
    x = w.x + HAND0[0];
    y = HAND0[1] + bob;
    rot = -8 + osc(w.tau, 0.85, 1) * 2;
  } else {
    const f = handFx(t, B);
    x = w.x + HAND0[0] + f.dx * S;
    y = HAND0[1] + f.dy * S;
    rot = -8 + f.rot;
  }
  const [a0, a1] = alignWin(B);
  const q = E.inOutSine(prog(t, a0, a1 - a0));
  const top = SLOT[1] - ENV_H / 2;
  x = lerp(x, SLOT[0], q);
  y = lerp(y, top, q);
  rot = lerp(rot, 0, q);
  const sx = lerp(1, ENV_SX, q);
  if (t < B.a) return {x, y, rot, sx, clipY: null, slide: 0};
  const b = E.inQuad(prog(t, B.a, 0.22));
  if (b >= 1) return null;
  return {x: SLOT[0], y: top + b * ENV_H, rot: 0, sx: ENV_SX, clipY: SLOT[1], slide: b};
}

const applyM = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

/** Where the wax seal sits on the envelope (world), or null once the envelope is through the slot. */
export function envSealWorld(t: number, B: Beats): {p: Pt; clipY: number | null; sx: number} | null {
  const w = msgWalk(t, B);
  const e = envState(t, B, w);
  if (!e) return null;
  return {p: applyM(leanMat(t, B, w), [e.x, e.y + ENV_W * 0.03]), clipY: e.clipY, sx: e.sx};
}

/** Two short ink knock ticks at the door beside the envelope, 0.12 s each. */
const KnockTicks: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const parts: React.ReactNode[] = [];
  const base: Pt = [MSG_X1 + HAND0[0] + 40, HAND0[1] - 8];
  knocks(B).forEach((k, i) => {
    const d = t - k;
    if (d < 0 || d >= 0.13) return;
    const g = 0.6 + 0.4 * E.outCubic(d / 0.06);
    const L = 15 * g;
    const o = 9 + 6 * E.outCubic(d / 0.13);
    const [x, y] = [base[0] + i * 4, base[1] + i * 10];
    const dd = `M${x + o} ${y - o * 0.7}l${L} ${-L * 0.65}M${x + o + 2} ${y + 2}l${L * 1.1} 0M${x + o} ${y + o * 0.7}l${L} ${L * 0.65}`;
    parts.push(<Ink key={i} d={dd} width={3.2} taper={false} order="all" seed={`s6knock${i}`} />);
  });
  return <>{parts}</>;
};

/** The messenger's body bob from the kit Person walk (so Bit and the detail ride it), world px. */
function msgBob(w: MsgWalk): number {
  if (!w.walking) return 0;
  return -Math.abs(Math.sin(msgPh(w))) * LEG * 0.035 * S;
}

// ---- his walking legs (fix round 3: "two rigid parallel leg rectangles that only alternate a small lift")

const MSG_DRAWS = personDraws(MSG.seed);
/** The lifted foot swings in toward the midline by up to 7 px (world) and its leg tapers 16 % at the foot (the bent knee
 *  foreshortens it); the kit's lift (0.16 leg) stays; the planted foot stays ON the ground while the body bobs. */
const FOOT_DX = 7 / S;
const LEG_TAPER = 0.16;

type LegsGeo = {legs: string; shoes: string; ink: string; dx: [number, number]; bw: [number, number]; drop: number};

/** Both legs (person units: feet x / hip y origin, under the body bob), mirroring the kit Person's back-view walk
 *  (lib/kit/Person: lw 0.31 w, gap 0.05 w, lift 0.16 legH on sin(ph)) plus the foot shift, the taper and the drop. */
function legsGeo(ph: number, bobWorld: number): LegsGeo {
  const lw = MSG_DRAWS.w * 0.31;
  const g = MSG_DRAWS.w * 0.05;
  const sn = Math.sin(ph);
  const f: [number, number] = [Math.max(0, sn), Math.max(0, -sn)];
  const drop = -bobWorld / S;
  let legs = '';
  let shoes = '';
  let ink = '';
  const dx: [number, number] = [0, 0];
  const bw: [number, number] = [lw, lw];
  ([0, 1] as const).forEach((i) => {
    const x0 = i === 0 ? -g - lw : g;
    const lift = f[i] * LEG * 0.16;
    dx[i] = (i === 0 ? 1 : -1) * FOOT_DX * f[i];
    bw[i] = lw * (1 - LEG_TAPER * f[i]);
    const yb = LEG - lift + drop;
    const bl = x0 + dx[i] + (lw - bw[i]) / 2;
    legs += polyPath([[x0, -2], [x0 + lw, -2], [bl + bw[i], yb], [bl, yb]]);
    shoes += polyPath([[bl - (i === 0 ? 1 : 2), yb - 12], [bl - (i === 0 ? 1 : 2) + bw[i] + 3, yb - 12], [bl - (i === 0 ? 1 : 2) + bw[i] + 3, yb + 2], [bl - (i === 0 ? 1 : 2), yb + 2]]);
    const inner = i === 0 ? [x0 + lw, bl + bw[i]] : [x0, bl];
    const outer = i === 0 ? [x0, bl] : [x0 + lw, bl + bw[i]];
    ink += `M${outer[0].toFixed(2)} 0L${outer[1].toFixed(2)} ${yb.toFixed(2)}M${inner[0].toFixed(2)} 0L${inner[1].toFixed(2)} ${(yb - 2).toFixed(2)}`;
  });
  return {legs, shoes, ink, dx, bw, drop};
}

/** Speed lines off his back (left) edge on the cut on action (~1100 px/s on screen: S05's run-out speed): three short
 *  ink dashes trailing the coat and a leg (his back edge is at the frame edge for the first frames, so they hold to
 *  cut + 0.15 and retract into him by cut + 0.21, the speed down to ~600 px/s by then; person units). */
function speedLines(d: number): string {
  if (d < 0 || d >= 0.21) return '';
  const k = d < 0.15 ? 1 : 1 - (d - 0.15) / 0.06;
  const edge = -MSG_DRAWS.w * 0.535 - 8 / S;
  let out = '';
  for (const [y, Lpx, o] of [[-TORSO * 0.74, 66, 0], [-TORSO * 0.36, 88, 10], [LEG * 0.55, 52, 22]] as const) {
    const L = (Lpx / S) * k;
    const x = edge + o / S;
    out += `M${x.toFixed(2)} ${y.toFixed(2)}L${(x - L).toFixed(2)} ${(y + L * 0.03).toFixed(2)}`;
  }
  return out;
}

/** The messenger: props Messenger (ink hair, collar band: the kit defaults; holding the envelope up) while he walks;
 *  from the door beat the arm (props FigureArm, the kit's own arm: no shape change at the hand-over) + envelope are
 *  drawn here so the hand can knock, the envelope can line up and go through the slot and the arm can drop. His hero
 *  detail (satchel, seams, soles, peach rim) rides on top; the whole figure leans in at the door.
 *  Fix round 3: while he walks, the kit's legs are clipped off below the coat hem and drawn here (legsGeo: the lifted
 *  foot swings in, its leg tapers, the planted foot stays down while the body bobs), the satchel lags the body by a
 *  frame (a 2.6 deg swing + the bob lag), and three speed lines trail his back edge on the cut. */
export const MessengerS06: React.FC<{B: Beats; zoom?: number}> = ({B, zoom = 1.05}) => {
  const t = useTime();
  const id = 'm6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const w = msgWalk(t, B);
  const own = !w.walking;
  const W = 4.8 / S; // props inkFor(260) = front 4.8, in person units
  const sh: Pt = [GW * 0.34, -TORSO * 0.8];
  const up: Pt = [GW * 0.7, -TORSO * 0.92];
  const down: Pt = [GW * 0.48, -TORSO * 0.2];
  const e = envState(t, B, w);
  // the hand holds the envelope's lower-left (props: envelope centre = hand + (6, -16), exactly the kit arm's hand at
  // the hand-over); from 'a' it stays at the slot plate while the envelope slides in, then the arm drops (0.25 s)
  const q = 1 - prog(t, B.a + 0.27, 0.25, E.inOutCubic);
  const eh = t < B.a ? e : envState(B.a - 1e-4, B, w);
  const hold: Pt = eh ? [(eh.x - w.x) / S - 6, (eh.y - HIP_Y) / S + 16] : up;
  const hand: Pt = [lerp(down[0], hold[0], q), lerp(down[1], hold[1], q)];
  const bob = msgBob(w);
  const k = S * zoom;
  const slotY = (SLOT[1] - HIP_Y) / S;
  // walking legs + the satchel's one-frame lag
  const legs = w.walking ? legsGeo(msgPh(w), bob) : null;
  const wPrev = msgWalk(t - 1 / 30, B);
  const bagFx = w.walking || wPrev.walking ? {rot: 2.6 * Math.sin(msgPh(wPrev)), dy: (msgBob(wPrev) - bob) / S} : undefined;
  const speed = speedLines(t - B.cut);
  const body = (
    <TimeShift by={t - w.tau}>
      <Messenger x={w.x} y={MSG.y} h={MSG.h} holdEnvelope={!own} walk={{hz: w.hz}} seed={MSG.seed} />
    </TimeShift>
  );
  return (
    <>
      <XG m={leanMat(t, B, w)}>
        {legs ? (
          <>
            <XG m={mat.compose(mat.translate(w.x, HIP_Y + bob), mat.scale(S))}>
              <Fill d={legs.legs} color={MSG_DRAWS.legsColor} offset={false} mode="none" seed={`${MSG.seed}/s6legs`} />
              <Fill d={legs.shoes} color={MSG_DRAWS.shoeColor} offset={false} mode="none" seed={`${MSG.seed}/s6shoes`} />
              <Ink d={legs.ink} width={W * 0.9} seed={`${MSG.seed}/s6legI`} />
            </XG>
            <defs>
              <clipPath id={`${id}h`}>
                <rect x={w.x - 1000} y={HIP_Y + bob - 2000} width={2000} height={2000 + 2.6 * S} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}h)`}>{body}</g>
          </>
        ) : (
          body
        )}
        {own && e ? (
          <XG m={mat.compose(mat.translate(w.x, HIP_Y), mat.scale(S))}>
            {e.clipY !== null ? (
              <defs>
                <clipPath id={id}>
                  <rect x={-2000} y={-2000} width={4000} height={2000 + slotY} />
                </clipPath>
              </defs>
            ) : null}
            <g clipPath={e.clipY !== null ? `url(#${id})` : undefined}>
              <XG m={mat.about(mat.scale(e.sx, 1), (e.x - w.x) / S, (e.y - HIP_Y) / S)}>
                <Envelope x={(e.x - w.x) / S} y={(e.y - HIP_Y) / S} size={ENV_W / S} rot={e.rot} depth="mid" seed={`${MSG.seed}/env`} />
              </XG>
            </g>
          </XG>
        ) : null}
        {own && q > 0.02 ? (
          <XG m={mat.compose(mat.translate(w.x, HIP_Y), mat.scale(S))}>
            <FigureArm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${MSG.seed}/arm`} />
          </XG>
        ) : null}
        <XG m={mat.compose(mat.translate(w.x, HIP_Y + bob), mat.scale(S))}>
          <MessengerDetail seed={MSG.seed} k={k} ph={w.walking ? msgPh(w) : undefined} arm={own ? (q > 0.6 ? {sh, hand} : undefined) : {sh, hand: up}} feet={legs ? {dx: legs.dx, bw: legs.bw, drop: legs.drop} : undefined} bag={bagFx} />
          {speed ? <Ink d={speed} width={3.4 / S} taper={false} order="all" seed="s6speed" /> : null}
        </XG>
      </XG>
      <KnockTicks B={B} />
    </>
  );
};

// ---------------------------------------------------------------- shadows (low sun at the lane end)

/** The left row's teal shade wedge (MakersLane G.shade, floor-layer world): a shadow inside it would not show. */
const SHADE: Pt[] = (() => {
  const rayAt = (xb: number, y: number) => 430 + ((xb - 430) * (y - 1040)) / 880;
  const baseX = (y: number) => 330 - ((330 + 140) * (y - 1120)) / 580;
  return [[330, 1121], [rayAt(150, 1121), 1121], [rayAt(150, 2060), 2060], [-200, 2060], [-200, 1760], [baseX(1700), 1700]];
})();

/** The sun's ground point: every shadow runs radially away from it (toward the camera). */
export const SUN_GROUND: Pt = [420, 1040];
/** ONE length rule for everybody on the lane (the sun sits on the horizon ahead): the shadow's length along its ray is
 *  2.13 x the figure's height x (depth below the horizon / 260)^1.2, so a nearer, taller figure throws a much longer
 *  shadow: the passer at (455, 1300) ends at y ~1600, Pip and the messenger run off the bottom edge. */
export const shadowLen = (h: number, footY: number) => 2.13 * h * Math.pow(Math.max(1, footY - SUN_GROUND[1]) / 260, 1.2);

/** A figure's flat shadow on the lane: a band from the feet along the ray away from the sun's ground point, widening
 *  with the perspective toward the camera, shoulders at 70 %, a rounded head at the tip. */
export function shadowPath(fx: number, fy: number, h: number, hw0: number): string {
  const ux0 = fx - SUN_GROUND[0];
  const uy0 = fy - SUN_GROUND[1];
  const n = Math.hypot(ux0, uy0) || 1;
  const [ux, uy] = [ux0 / n, uy0 / n];
  const [px, py] = [-uy, ux];
  const L = shadowLen(h, fy);
  const d0 = fy - SUN_GROUND[1];
  const wAt = (s: number) => hw0 * Math.min(2.6, (d0 + uy * L * s) / d0);
  const P = (s: number, o: number): Pt => [fx + ux * L * s + px * o, fy + uy * L * s + py * o];
  const pts: Pt[] = [P(0, -wAt(0)), P(0.55, -wAt(0.55) * 1.12), P(0.74, -wAt(0.74) * 1.22), P(0.8, -wAt(0.8) * 0.78), P(0.93, -wAt(0.93) * 0.62), P(1, 0), P(0.93, wAt(0.93) * 0.62), P(0.8, wAt(0.8) * 0.78), P(0.74, wAt(0.74) * 1.22), P(0.55, wAt(0.55) * 1.12), P(0, wAt(0))];
  return polyPath(pts);
}


/** Flat tan shadows of everyone on the lane (the messenger, Pip, the passers), fill only, on the floor layer (dx = near
 *  -> floor world offset during the truck), clipped out of the row's teal shade. */
export const Shadows: React.FC<{B: Beats; dx: number; walkers: WalkerAnchor[]}> = ({B, dx, walkers}) => {
  const t = useTime();
  const id = 's6sh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  let d = '';
  // passers (floor layer already)
  for (const a of walkers) {
    const p = walkerAt(a, MAKERS_LANE.vp, t, 0);
    d += shadowPath(p.x, p.y - 2, p.h, p.h * 0.17);
  }
  const w = msgWalk(t, B);
  d += shadowPath(w.x + dx, MSG.y - 4, MSG.h, MSG.h * 0.17);
  const p = pipAt(t, B);
  const air = clamp(1 - (PIP.y - p.y) / 160);
  if (air > 0.05) d += shadowPath(p.x + dx, PIP.y - 3, PIP_H * air, 40 * air);
  const shade = polyPath(SHADE);
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={`M-400 600H1500V2400H-400Z${shade}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Fill d={d} color={palette.tan} offset={false} mode="none" seed="s6shadow" />
      </g>
    </>
  );
};

// ---------------------------------------------------------------- Bit, the stowaway (22 px)

/** Bit: hidden in the messenger's collar, peeks out on 'gave' and rides on the TOP LINE of his right shoulder (his shell
 *  breaks the silhouette against the lane, a 2 px cream rim keeps him off the dark coat and hair); on 'a' he hops onto
 *  the mail slot's plate (the sill) and watches the envelope go in. */
export const BIT_SIZE = 22;
const BitRim: React.FC<{x: number; y: number; size: number; flip?: boolean}> = ({x, y, size, flip}) => <Ink d={bitPath(x, y, size, flip)} width={4.4} color={palette.cream} taper={false} seed="s6bitrim" />;

export const BitS06: React.FC<{B: Beats; size?: number}> = ({B, size = BIT_SIZE}) => {
  const t = useTime();
  const id = 'b6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  // fix round 3 (rule 5): a small element leads its word by 0.10 s, so his shell clears the collar AS 'gave' is said
  const peekAt = B.gave - 0.1;
  if (t < peekAt) return null;
  const w = msgWalk(t, B);
  // on the shoulder's top line, right of the collar band (person units -> world), 8 px out and 6 px up of the collar
  const shoulderAt = (x: number, bob: number): Pt => [x + GW * 0.3 * S + 7, HIP_Y - TORSO * S - 1.5 + bob];
  const shoulder = shoulderAt(w.x, msgBob(w));
  const hopAt = B.a + 0.02;
  const hopDur = 0.3;
  if (t < hopAt) {
    // peek: rises out from behind the shoulder line (clipped), then rides
    const k = prog(t, peekAt, 0.2, E.outBack(1.6));
    const rise = (1 - k) * size * 0.75;
    return (
      <XG m={leanMat(t, B, w)}>
        <defs>
          <clipPath id={id}>
            <rect x={shoulder[0] - 60} y={shoulder[1] - 80} width={120} height={80 + 1.5} />
          </clipPath>
        </defs>
        <g clipPath={k < 1 ? `url(#${id})` : undefined}>
          <BitRim x={shoulder[0]} y={shoulder[1] + rise} size={size} />
          <Bit x={shoulder[0]} y={shoulder[1] + rise} size={size} state="ride" look={k < 1 ? 'up' : 'forward'} seed="s6bit" />
        </g>
      </XG>
    );
  }
  // hop from the shoulder onto the sill (ballistic, landing squash), then sit facing the slot
  const from = shoulderAt(MSG_X1, 0);
  const u = prog(t, hopAt, hopDur);
  const x = lerp(from[0], SILL[0], E.inOutSine(u));
  const apex = Math.min(from[1], SILL[1]) - 34;
  const cy = 2 * apex - (from[1] + SILL[1]) / 2;
  const y = (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * cy + u * u * SILL[1];
  const land = t - (hopAt + hopDur);
  const sq = land >= 0 && land < 0.16 ? 1 - 0.22 * Math.sin((land / 0.16) * Math.PI) : u < 1 && u > 0 ? 1.08 : 1;
  return (
    <XG m={mat.about(mat.scale(2 - sq, sq), x, y)}>
      <BitRim x={x} y={y} size={size} flip={u >= 1} />
      <Bit x={x} y={y} size={size} flip={u >= 1} state={u < 1 ? 'hop' : 'idle'} look={u >= 1 ? 'forward' : 'up'} seed="s6bit" />
    </XG>
  );
};

// ---------------------------------------------------------------- the makers' heads (upstairs browser window)

/** The third maker's seed: the first candidate whose kit hair is clay or ochre (never the tealDark 'blob'). */
const MAKER_SEEDS = (() => {
  const ok = (s: string) => {
    const c = personDraws(s).hairColor;
    return c === palette.tan || c === palette.brown;
  };
  const pickSeed = (base: string, avoid: string[]) => {
    for (let i = 0; i < 40; i++) {
      const s = `${base}${i ? `v${i}` : ''}`;
      if (ok(s) && !avoid.includes(personDraws(s).hairColor)) return s;
    }
    return base;
  };
  const s0 = 's6mk0';
  const s1 = 's6mk1';
  const s2 = pickSeed('s6mk2', [personDraws(s1).hairColor]);
  return [s0, s1, s2];
})();

/** Three makers (props Maker, waist-up, back view) pop UP into the browser window's screen: rise 0.2 s, 0.06 s apart,
 *  middle first, led so the middle one's overshoot lands ON 'heads'; three ink pop ticks above the window. Then they lean
 *  toward the door below (-6 deg about the hip, 5 px down: looking down at the mail slot, still back view).
 *  Fix round 3 (the heads rose into the chrome bar and covered the traffic-light dots: the window stopped reading as a
 *  browser): clipped to the CONTENT rect below the chrome bar, the heads rest 6 px under it (the outer two 10 px) and the
 *  overshoot is capped (outBack 1.3: ~6 px), so a head top reaches the bar line at most and is never flattened. */
export const MakerHeads: React.FC<{screen: {x: number; y: number; w: number; h: number; bar?: number}; at: number; tickAt?: number}> = ({screen, at, tickAt = at}) => {
  const t = useTime();
  const id = 'mh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < at) return null;
  const h = 135;
  // bust: s = h / (FIG_H 0.62); head top = hip - (TORSO + hr 1.86) s, hr ~ 23: the head tops rest 3 px under the bar
  const sB = h / (FIG_H * 0.62);
  const hipY = screen.y + 6 + (TORSO + 23 * 1.86) * sB;
  const xs = [screen.x + screen.w * 0.19, screen.x + screen.w * 0.5, screen.x + screen.w * 0.81];
  const order = [1, 0, 2]; // the middle one first
  const tick = (() => {
    const d = t - tickAt;
    if (d < 0 || d > 0.17) return null;
    const g = E.outCubic(d / 0.08);
    const o = 8 + 10 * E.outCubic(d / 0.17);
    const L = 14 * g;
    const cx = xs[1];
    // over the window's top frame (the browser bar sits between the screen and the frame)
    const cy = screen.y - (screen.bar ?? 30) - 4;
    const dd = `M${cx - 30 - o} ${cy - o * 0.3}l${-L} ${-L * 0.55}M${cx} ${cy - o * 0.6}l0 ${-L}M${cx + 30 + o} ${cy - o * 0.3}l${L} ${-L * 0.55}`;
    return <Ink d={dd} width={3.0} taper={false} order="all" seed="s6mktick" />;
  })();
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
          const k = prog(t, a, 0.2, E.outBack(1.3));
          // look down at the door (it is below-left of the window): a lean about the hip once they are up
          const look = E.inOutSine(prog(t, a + 0.24, 0.22));
          const hy = hipY + (i === 1 ? 0 : 4);
          return (
            <XG key={i} m={mat.compose(mat.translate(0, (1 - k) * 96 + 5 * look), mat.about(mat.rotate(-6 * look), x, hy))}>
              <Maker x={x} y={hy} h={h} bust work={1.6 + i * 0.35} flip={i === 2} seed={MAKER_SEEDS[i]} />
            </XG>
          );
        })}
      </g>
      {tick}
    </>
  );
};

// ---------------------------------------------------------------- Pip

/** Pip (scale 1.2) on the reference plane, behind the messenger in depth (feet 1480). PIP_H = his standing height (px)
 *  for the shadow rule.
 *  Cut S05|S06 (phase B wave 1): his leap CARRIES ACROSS the cut on action. S05 (scene05/cast.tsx PipHop) leaves him at
 *  the top of his arc, level, half out of frame RIGHT (S05's last frame: feet screen ~(1091, 1118), ~40 px/frame right);
 *  S06 picks him up on its FIRST frame at the same height, half IN at the left edge above-left of the messenger's head
 *  (feet screen ~(-8, 1120)), still moving right (~29 px/frame against the trucking camera, ~50 px/frame against the
 *  lane), hangs a frame and drops in BEHIND the messenger: he lands behind-left of him at `land` at cut + `landAt`,
 *  clear of the messenger's head, envelope, back, satchel and legs on every frame (>= ~35 px). `entry` = his state at
 *  the cut (screen px, px/frame); x is a cubic Hermite in world px from that speed to the tiptoe speed, y a parabola
 *  down from the apex. Was (fix round 2): one low leap from world (-480, 1350) landing at cut + 0.30: off frame left on
 *  Main f594-f598 (5 frames without Pip after S05 had him leaving right), then entering below the messenger's head. */
export const PIP = {scale: 1.2, y: 1480, land: [172, 1480] as Pt, landAt: 0.4, entry: {sx: -35, sy: 1118, vx: 32}, k0: 0.77} as const;
export const PIP_H = 110;

type PipState = {x: number; y: number; pose: PoseName; flip: boolean; squash: number; rotate: number; amount?: number; expression?: Expression; walkRate?: number; look?: number; shh?: boolean};

/** How long Pip holds the 'shh' (the mark stays from shh + 0.06 to shh + 0.55). */
export const SHH_HOLD = 0.52;

/** Pip's choreography (world, f = 1): leaps in behind the messenger, tiptoes (walk-side, rate 1.0); 'shh' (stand-side,
 *  the trunk J-curled back onto his lips, eyes closed: knowing) after the seal lands; tiptoes on; ear twitch at the
 *  sheet (he turns to it); leaps after it. */
export function pipAt(t: number, B: Beats): PipState {
  const landT = B.cut + PIP.landAt;
  const rate = 1.0;
  const v = walkSpeed(rate) * PIP.scale;
  const shhEnd = B.shh + SHH_HOLD;
  const leapT = B.sheet + 0.2;
  // x along the tiptoe (it pauses during the shh)
  const walked = (until: number) => Math.max(0, Math.min(until, B.shh) - landT) + Math.max(0, until - shhEnd);
  const xAt = (tt: number) => PIP.land[0] + v * walked(tt);
  if (t < landT) return pipEntry(t, B, v);
  if (t < B.shh) {
    // the landing squash (props hop's: 0.24 e^-11d cos(2 pi 3.2 d) over 0.32 s)
    const d = t - landT;
    const land = d < 0.32 ? 0.24 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2) : 0;
    return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: land + popSwitch(t, B.shh), rotate: 0, walkRate: rate};
  }
  if (t < shhEnd) return {x: xAt(t), y: PIP.y, pose: 'stand-side', flip: false, squash: popSwitch(t, B.shh) + popSwitch(t, shhEnd), rotate: 0, expression: 'closed', look: 0.3, shh: true};
  if (t < B.sheet) return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: popSwitch(t, shhEnd) + popSwitch(t, B.sheet), rotate: 0, walkRate: rate};
  const x0 = xAt(B.sheet);
  if (t < leapT - 0.14) return {x: x0, y: PIP.y, pose: 'stand-side', flip: true, squash: popSwitch(t, B.sheet), rotate: 0, expression: 'wide', amount: 0.25};
  const h = hop({t, t0: leapT, dur: 0.42, from: {x: x0, y: PIP.y}, to: {x: x0 - 260, y: 1150}, height: 150});
  return {x: h.x, y: h.y, pose: 'stand-side', flip: true, squash: h.squash, rotate: h.rotate, amount: Math.max(0.25, h.spread), expression: 'wide'};
}

/** Pip's leap in across the cut (cut S05|S06, see PIP): world state on the near plane (f = 1) for B.cut <= t < landT.
 *  The leap pose carries S05's (stand-side, 'wide', spread / stretch on the hop's own curves continued from S05's k at
 *  its cut, PIP.k0, to the landing), the nose turns from level at the apex to 10 deg down at the landing. */
function pipEntry(t: number, B: Beats, vWalk: number): PipState {
  const L = PIP.landAt;
  const c0 = camAt(B.cut, B);
  const camV = (camAt(B.cut + 1e-3, B).x - c0.x) / 1e-3;
  const x0 = (PIP.entry.sx - 540) / c0.z + c0.x;
  const v0 = (PIP.entry.vx * 30) / c0.z + camV;
  const y0 = (PIP.entry.sy - 960) / c0.z + c0.y;
  const tau = clamp(t - B.cut, 0, L);
  const s = tau / L;
  const x = (2 * s ** 3 - 3 * s ** 2 + 1) * x0 + (s ** 3 - 2 * s ** 2 + s) * L * v0 + (-2 * s ** 3 + 3 * s ** 2) * PIP.land[0] + (s ** 3 - s ** 2) * L * vWalk;
  const y = y0 + (PIP.land[1] - y0) * s * s;
  const kk = PIP.k0 + (1 - PIP.k0) * s;
  const sn = Math.sin(Math.PI * kk);
  return {x, y, pose: 'stand-side', flip: false, squash: -0.22 * (1 - sn) * 0.6 - 0.04, rotate: 10 * s, amount: Math.sqrt(Math.max(0, sn)), expression: 'wide'};
}

/** The side rig's head + trunk frame when standing (lib/mascot/poses sideRig, not walking): head centre H, tilt, the
 *  trunk base tb, the sway (deg per segment) and the mouth. */
function sideHead(t: number, seed: number, look: number, idle = 1) {
  const br = breath(t, seed) * idle;
  const bob = br * 0.5;
  const headBob = -br * 0.6;
  const H: MPt = [27 + look * 0.8, -58 + bob + headBob * 0.6];
  const tilt = look * 3;
  const hp = (p: MPt): MPt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  return {H, tilt, hp, tb: hp([15, 1]), sway: trunkSway(t, seed) * idle * 3, mouth: hp([8.6, 12.4])};
}

/** progressively rotate each segment (mascot poses bendCtrl). */
const bendCtrl = (ctrl: MPt[], degPerSeg: number): MPt[] => {
  const out: MPt[] = [ctrl[0]];
  let acc = 0;
  for (let i = 1; i < ctrl.length; i++) {
    acc += degPerSeg;
    const seg: MPt = [ctrl[i][0] - ctrl[i - 1][0], ctrl[i][1] - ctrl[i - 1][1]];
    const r = tpt(seg, {rot: acc});
    out.push([out[i - 1][0] + r[0], out[i - 1][1] + r[1]]);
  }
  return out;
};

/** The 'shh' trunk: the side rig's own trunk root, then a J curl that hooks back UP onto the lips (the finger on the
 *  lips), drawn like the mascot's trunk (lib/mascot/poses trunk(): capped tube, body fill misregistered, brush ink, two
 *  wrinkles). Control points relative to the trunk base, before tilt and sway; the first four are the rig's own, so
 *  the root below the cut line continues the original exactly. */
const SHH_TRUNK: MPt[] = [[0, 0], [5, 8], [7.4, 18], [6.6, 27], [3.4, 31.8], [-2.2, 32.2], [-6.6, 28.2], [-7.8, 21.6], [-6.4, 15.2]];
/** Local cut line (y below the head centre) between the rig's trunk root and ours. */
const SHH_CUT = 11;

export const PipS06: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const id = 'p6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const inkScale = useInkScale();
  const p = pipAt(t, B);
  const el = <Elephant x={p.x} y={p.y} scale={PIP.scale} pose={p.pose} flip={p.flip} t={t} seed={6} squash={p.squash} rotate={p.rotate} amount={p.amount} expression={p.expression} walkRate={p.walkRate ?? 1} look={p.look ?? 0} />;
  if (t < B.cut + PIP.landAt) return <><PipSmearS06 t={t} B={B} />{el}</>;
  if (!p.shh) return el;
  // ---- the shh: clip the rig's hanging trunk below the cut line, draw the J-curl in its place
  const sc = PIP.scale;
  const sx = 1 + p.squash * 0.55;
  const sy = 1 - p.squash;
  const look = p.look ?? 0;
  const g = sideHead(t, 6, look);
  const cutY = g.H[1] + SHH_CUT;
  const W = (lx: number, ly: number): Pt => [p.x + lx * sc * sx, p.y + ly * sc * sy];
  // the region the rig's trunk hangs into (right of the mouth, under the head); nothing else of Pip is there
  const exclude: Pt[] = [W(40.6, cutY), W(95, cutY), W(95, 12), W(36.4, 12), W(36.4, g.mouth[1] + 2.4), W(40.6, g.mouth[1] + 2.4)];
  const ctrl = tp(bendCtrl(SHH_TRUNK, g.sway), {x: g.tb[0], y: g.tb[1], rot: g.tilt});
  const center = spline(ctrl, false, 6);
  const {left, right, loop} = cappedTube(center, 12.4, 7.0);
  const baseW = (stroke.ink * 1.12 * inkScale) / sc;
  const inkD = brush(loop, {w: baseW, seed: 6 * 31.7 + 3.1, over: 0, tipIn: 0.1, tipOut: 0.1});
  let wr = '';
  const n = center.length;
  [0.2, 0.28].forEach((f, j) => {
    const i = Math.round(f * (n - 1));
    const a = left[i];
    const b = right[i];
    const m: MPt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const nxt = center[Math.min(n - 1, i + 2)];
    const dl = Math.hypot(nxt[0] - center[i][0], nxt[1] - center[i][1]) || 1;
    const bow: MPt = [m[0] + ((nxt[0] - center[i][0]) / dl) * 0.9, m[1] + ((nxt[1] - center[i][1]) / dl) * 0.9];
    wr += brush(spline([[lerp(a[0], b[0], 0.3), lerp(a[1], b[1], 0.3)], bow, [lerp(a[0], b[0], 0.72), lerp(a[1], b[1], 0.72)]], false, 6), {w: baseW * 0.6, seed: 77 + j, over: 0, tipIn: 0.5, tipOut: 0.35});
  });
  const misreg: Pt = [3 / sc, 2 / sc];
  return (
    <>
      <defs>
        <clipPath id={`${id}a`}>
          <path d={`M${p.x - 500} ${p.y - 700}H${p.x + 500}V${p.y + 300}H${p.x - 500}Z${polyPath(exclude)}`} clipRule="evenodd" />
        </clipPath>
        <clipPath id={`${id}b`}>
          <rect x={p.x - 500} y={W(0, cutY)[1]} width={1000} height={600} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}a)`}>{el}</g>
      <g clipPath={`url(#${id}b)`}>
        <XG m={mat.compose(mat.translate(p.x, p.y), mat.scale(sc * sx, sc * sy))}>
          <path d={mPoly(loop)} fill={MASCOT.body} transform={`translate(${misreg[0].toFixed(2)} ${misreg[1].toFixed(2)})`} />
          <path d={inkD + wr} fill={MASCOT.ink} />
        </XG>
      </g>
    </>
  );
};

/** Cut S05|S06: the speed lines S05 trails behind a fast Pip (scene05/cast.tsx PipSmear: the film's smear language,
 *  copied, never imported across scenes) carry across the cut on his leap in: 3 short ink lines behind his body centre
 *  along -(screen velocity), length with the speed, drawn only above 22 screen px / frame. World px (near plane). */
const PipSmearS06: React.FC<{t: number; B: Beats}> = ({t, B}) => {
  // the velocity over the last frame (from the cut on S06's first frame: S05 drew the smear on its last one)
  const t0 = Math.max(B.cut, t - 1 / 30);
  const dt = t - t0;
  if (dt < 1e-3) return null;
  const toS = (tt: number) => {
    const c = camAt(tt, B);
    const q = pipAt(tt, B);
    return [(q.x - c.x) * c.z, (q.y - c.y) * c.z] as const;
  };
  const a = toS(t0);
  const b = toS(t);
  const z = camAt(t, B).z;
  // world px per frame
  const vx = (b[0] - a[0]) / z / (dt * 30);
  const vy = (b[1] - a[1]) / z / (dt * 30);
  const sp = Math.hypot(vx, vy);
  if (sp * z < 22) return null;
  const p = pipAt(t, B);
  const sc = PIP.scale;
  const ux = -vx / sp;
  const uy = -vy / sp;
  const len = Math.max(20, Math.min(50, sp * z * 0.8)) / z;
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return <Ink d={smearLines(p.x + ux * 50 * sc, p.y - 46 * sc + uy * 50 * sc, {n: 3, len, gap: 15 * sc, angle: ang, seed: 's6pipSpd/l'})} width={2.6 / z} taper={false} seed="s6pipSpd/i" />;
};

/** 'shh' lettered beside Pip in CaptionHand (64 px world = ~44 px x-height-to-ascender on screen), a short ink tail
 *  pointing at his trunk tip, two hush ticks: pops in with the 7 % spring, holds, shrinks away in 0.12 s. */
export const ShhMark: React.FC<{x: number; y: number; at: number; outAt: number; flickAt?: number; tail?: Pt; size?: number}> = ({x, y, at, outAt, flickAt, tail, size = 64}) => {
  const t = useTime();
  useCaptionFont();
  if (t < at || t >= outAt + 0.12) return null;
  const k = springAt(t, at, springs.pop) * (1 - E.inCubic(prog(t, outAt, 0.12)));
  if (k <= 0.01) return null;
  // fix round 3: the two hush ticks re-flick once mid-hold (snap to 0.6 of their length, back to 1 in 0.1 s)
  const fk = flickAt !== undefined && t >= flickAt && t < flickAt + 0.1 ? lerp(0.6, 1, E.outCubic((t - flickAt) / 0.1)) : 1;
  // the tail: from under the lettering's left end toward the trunk tip (stops 30 px short of it), in the mark's frame
  let tailD = '';
  if (tail) {
    // the target in the mark's own (rotated -8 deg) frame: local = R(+8 deg) . (world - anchor)
    const r = (8 * Math.PI) / 180;
    const tx0 = tail[0] - x;
    const ty0 = tail[1] - y;
    const tL: Pt = [tx0 * Math.cos(r) - ty0 * Math.sin(r), tx0 * Math.sin(r) + ty0 * Math.cos(r)];
    const s0: Pt = [-size * 0.5, size * 0.2];
    const L = Math.hypot(tL[0] - s0[0], tL[1] - s0[1]) || 1;
    const run = Math.max(16, L - 30);
    const e: Pt = [s0[0] + ((tL[0] - s0[0]) / L) * run, s0[1] + ((tL[1] - s0[1]) / L) * run];
    const c: Pt = [(s0[0] + e[0]) / 2 + 6, (s0[1] + e[1]) / 2 - 2];
    tailD = `M${s0[0].toFixed(1)} ${s0[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
  }
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(-8), mat.scale(k))}>
      <text x={0} y={0} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={palette.ink}>
        shh
      </text>
      <Ink d={line(size * 0.82, -size * 0.6, size * (0.82 + 0.28 * fk), -size * (0.6 + 0.22 * fk), {over: 0, seed: 's6shh1'}) + line(size * 0.86, -size * 0.25, size * (0.86 + 0.36 * fk), -size * (0.25 + 0.05 * fk), {over: 0, seed: 's6shh2'})} width={3.2} taper={false} seed="s6shhi" />
      {tailD ? <Ink d={tailD} width={3.0} taper={false} seed="s6shht" /> : null}
    </XG>
  );
};

/** Where the 'shh' trunk tip is (world) while Pip holds the pose (for the mark's tail). */
export function shhTipWorld(t: number, B: Beats): Pt {
  const p = pipAt(t, B);
  const g = sideHead(t, 6, p.look ?? 0.3);
  const ctrl = tp(SHH_TRUNK, {x: g.tb[0], y: g.tb[1], rot: g.tilt});
  const tip = ctrl[ctrl.length - 1];
  return [p.x + tip[0] * PIP.scale, p.y + tip[1] * PIP.scale];
}

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
