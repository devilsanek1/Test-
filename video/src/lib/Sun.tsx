// Sun.tsx — the orange disc, the video's anchor AND a character (docs/motion_spec.md 5, #19-#24). Render it inside
// your scene where you want it in the z-order (before a wall/skyline so it can set behind it).
//
//   <Sun />                                                   // static: card slot (card) / sunWorld (in a <World>)
//   <Sun cx={540} cy={840} r={150} horizon={900} />           // big, low, half set behind the horizon line y=900
//   <Sun rise={{at: 0, from: [540, 1010]}} />                 // opening: emerges from the vanishing point (0.37 s) + 7% pulse
//   <Sun beats={[1.33, {t: 2.0, amp: 0.13}]} />               // beat pulses on stressed words (+4..+13%, default 8%)
//   <Sun bounce={{times: [3.1, 3.7, 4.25], h: 40}} />         // bounces whose TOUCH-DOWNS land on those word times
//   <Sun hops={[{t: 6.0, to: [700, 840]}]} />                 // squash-and-stretch hop: take-off at t (anticipation before)
//   <Sun drift={[12, 0]} />                                   // idle drift px/s (never perfectly still; in a <World>
//                                                             // the default is SUN_IDLE_DRIFT, 10 px/s to the right)
//   <Sun drift={[0, 0]} />                                    // pinned (a match-cut frame on the sun)
//   <Sun moves={[{at: 6, dur: 1.5, y: 960}]} horizon={900} /> // sets behind a horizon line
//   <Sun>{(r) => <PowerSymbol r={r} at={3} />}</Sun>          // overlays in sun-local coords (0,0 = centre)
//
// No rays, no outline, no gradient: a perfect flat disc. During a card flip the Sun counter-scales so it stays round.
// Un-build: the disc shrinks to its centre with the fills.

import React, {useId} from 'react';
import {palette, stroke, sun as sunGeo, sunWorld} from './theme';
import {Ease, ease as E, lerp, osc, prog, springAt, springs, useTime} from './time';
import {useCardRotY} from './Card';
import {ExitFade, exitFillProgress, useExit} from './exit';
import {Ink} from './Ink';
import {arc, line} from './sketch';
import {MOTION} from './spec';
import {useStageKind} from './stage';

export type SunMove = {at: number; dur?: number; x?: number; y?: number; r?: number; ease?: Ease};
export type SunBeat = number | {t: number; amp?: number};
export type SunHop = {/** take-off time (anticipation squash starts 0.1 s earlier) */ t: number; to: [number, number]; /** apex px. Default 74. */ h?: number; /** airtime s. Default 1.03 (floaty); 0.5-0.7 for a quick hop. */ air?: number};
export type SunBounce = {/** touch-down times (word onsets) */ times: number[]; /** bounce height px (26-62). Default: by interval */ h?: number};

export type SunProps = {
  /** Pop-in time (7% overshoot spring). Omit = already there. */
  at?: number;
  cx?: number;
  cy?: number;
  r?: number;
  color?: string;
  /** Opening rise: the sun travels from `from` (e.g. the vanishing point) to its slot in 0.37 s (ease-out), then pulses +7%. */
  rise?: {at: number; from: [number, number]; dur?: number};
  /** Sequential moves (set / rise / slide / grow). Each interpolates from the previous state. */
  moves?: SunMove[];
  /** Beat pulses (alias of `beats`). */
  pulse?: SunBeat | SunBeat[];
  /** Beat pulses: attack 0.08 s, hold 0.08 s, release 0.27 s; amp default 0.08 (range 0.04-0.13). */
  beats?: SunBeat[];
  /** Bounces landing on word onsets (ballistic, landing squash). */
  bounce?: SunBounce;
  /** Hops with anticipation squash, stretch, landing squash (positions chain: each hop starts where the last landed). */
  hops?: SunHop[];
  /** Idle linear drift (px/s), applied on top of everything (from scene t 0). Default in a <World>: SUN_IDLE_DRIFT
   *  (10 px/s, ENGINE rule 6 / motion spec 9: never perfectly still); [0, 0] pins it (match-cuts on the sun: its x at
   *  the cut is cx + drift x t). Card layout: none. */
  drift?: [number, number];
  /** Idle breathing (true = 1.2%, or a fraction). */
  breathe?: boolean | number;
  /** Clip the disc below this y: the sun "sets" behind a horizon/wall line. */
  horizon?: number;
  /** Shrink away during scene un-build (default true). */
  exit?: boolean;
  children?: React.ReactNode | ((r: number) => React.ReactNode);
};

/** The sun's default idle drift in full-bleed scenes (px/s): motion spec 9 "sun drift >= 10 px/s or a bob". */
export const SUN_IDLE_DRIFT: [number, number] = [10, 0];

/** Beat pulse scale factor (1 = rest) at time t for a list of beats. */
export function sunBeatScale(t: number, beats: SunBeat[] | undefined): number {
  if (!beats || !beats.length) return 1;
  const {attack, hold, release, amp: defAmp} = MOTION.sunPulse;
  let s = 1;
  for (const b of beats) {
    const bt = typeof b === 'number' ? b : b.t;
    const amp = typeof b === 'number' ? defAmp : b.amp ?? defAmp;
    // the peak lands ON the beat: attack starts `attack` earlier
    const t0 = bt - attack;
    if (t < t0 || t > t0 + attack + hold + release) continue;
    const up = prog(t, t0, attack, E.outCubic);
    const down = prog(t, t0 + attack + hold, release, E.inOutSine);
    s *= 1 + amp * (up - down);
  }
  return s;
}

type Squash = {sx: number; sy: number};
const NO_SQ: Squash = {sx: 1, sy: 1};
const mulSq = (a: Squash, b: Squash): Squash => ({sx: a.sx * b.sx, sy: a.sy * b.sy});
const lerpSq = (a: Squash, b: Squash, p: number): Squash => ({sx: lerp(a.sx, b.sx, p), sy: lerp(a.sy, b.sy, p)});
const landSquash = (dt: number): Squash => {
  const {land, recover, squash} = MOTION.hop;
  const sq = {sx: squash[0], sy: squash[1]};
  if (dt < 0 || dt > land + recover) return NO_SQ;
  if (dt < land) return lerpSq(NO_SQ, sq, E.outCubic(dt / land));
  return lerpSq(sq, NO_SQ, E.outCubic((dt - land) / recover));
};

/** Bounce offset (px, negative = up) and squash at t: touch-downs at `times`. */
export function sunBounceAt(t: number, b: SunBounce | undefined): {dy: number; sq: Squash} {
  if (!b || b.times.length < 2) return {dy: 0, sq: b && b.times.length ? landSquash(t - b.times[0]) : NO_SQ};
  const ts = b.times;
  let sq = NO_SQ;
  for (const tt of ts) sq = mulSq(sq, landSquash(t - tt));
  for (let i = 0; i < ts.length - 1; i++) {
    const a = ts[i];
    const c = ts[i + 1];
    if (t > a && t < c) {
      const u = (t - a) / (c - a);
      const [lo, hi] = MOTION.sunBounce.h;
      const h = b.h ?? Math.min(hi, Math.max(lo, (c - a) * 70));
      return {dy: -4 * h * u * (1 - u), sq};
    }
  }
  return {dy: 0, sq};
}

type Pose = {x: number; y: number; r: number; sq: Squash};

/** Position / radius / squash at time t from rise, moves and hops (no beats, bounce, drift). */
export function sunPoseAt(t: number, o: {cx: number; cy: number; r: number; rise?: SunProps['rise']; moves?: SunMove[]; hops?: SunHop[]}): Pose {
  let x = o.cx;
  let y = o.cy;
  let rad = o.r;
  let sq = NO_SQ;
  if (o.rise) {
    const p = prog(t, o.rise.at, o.rise.dur ?? 0.37, E.outCubic);
    x = lerp(o.rise.from[0], o.cx, p);
    y = lerp(o.rise.from[1], o.cy, p);
  }
  // moves and hops are applied in time order (each starts from where the previous one left the sun)
  const H = MOTION.hop;
  type Ev = {start: number; m?: SunMove; h?: SunHop};
  const evs: Ev[] = [...(o.moves ?? []).map((m) => ({start: m.at, m})), ...(o.hops ?? []).map((h) => ({start: h.t - H.antic, h}))].sort((p, q) => p.start - q.start);
  for (const ev of evs) {
    if (t < ev.start) break;
    if (ev.m) {
      const m = ev.m;
      const p = prog(t, m.at, m.dur ?? 1, m.ease ?? E.inOutCubic);
      x = lerp(x, m.x ?? x, p);
      y = lerp(y, m.y ?? y, p);
      rad = lerp(rad, m.r ?? rad, p);
      continue;
    }
    const hp = ev.h!;
    const air = hp.air ?? H.air;
    const [tx, ty] = hp.to;
    if (t < hp.t) {
      sq = lerpSq(NO_SQ, {sx: H.antSquash[0], sy: H.antSquash[1]}, E.outCubic(prog(t, hp.t - H.antic, H.antic)));
      continue;
    }
    if (t < hp.t + air) {
      const u = (t - hp.t) / air;
      const h = hp.h ?? H.height;
      const st = u < 0.35 ? lerpSq({sx: H.stretch[0], sy: H.stretch[1]}, NO_SQ, u / 0.35) : u > 0.8 ? lerpSq(NO_SQ, {sx: H.stretch[0], sy: H.stretch[1]}, (u - 0.8) / 0.2) : NO_SQ;
      // rise ease-out, fall ease-in: a parabola in time
      x = lerp(x, tx, u);
      y = lerp(y, ty, u) - 4 * h * u * (1 - u);
      sq = st;
      continue;
    }
    x = tx;
    y = ty;
    sq = landSquash(t - (hp.t + air));
  }
  return {x, y, r: rad, sq};
}

export const Sun: React.FC<SunProps> = ({at, cx, cy, r, color = palette.sun, rise, moves = [], pulse, beats, bounce, hops, drift: driftIn, breathe, horizon, exit = true, children}) => {
  const t = useTime();
  const rotY = useCardRotY();
  const kind = useStageKind();
  const drift = driftIn ?? (kind === 'world' ? SUN_IDLE_DRIFT : undefined);
  const e = useExit();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  if (at !== undefined && t < at) return null;
  const geo = kind === 'world' ? sunWorld : sunGeo;
  const pose = sunPoseAt(t, {cx: cx ?? geo.cx, cy: cy ?? geo.cy, r: r ?? geo.r, rise, moves, hops});
  const bnc = sunBounceAt(t, bounce);
  let x = pose.x + (drift ? drift[0] * t : 0);
  let y = pose.y + bnc.dy + (drift ? drift[1] * t : 0);
  const rad = pose.r;
  const sq = mulSq(pose.sq, bnc.sq);

  let s = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const allBeats: SunBeat[] = [...(beats ?? []), ...(pulse === undefined ? [] : Array.isArray(pulse) ? pulse : [pulse])];
  if (rise) allBeats.push({t: rise.at + (rise.dur ?? 0.37) + 0.08, amp: 0.07});
  s *= sunBeatScale(t, allBeats);
  if (breathe) s *= 1 + (typeof breathe === 'number' ? breathe : 0.012) * osc(t, 0.45);
  if (exit && e > 0) s *= 1 - E.inCubic(exitFillProgress(e, 0.3));
  if (s <= 0.001) return null;

  // squash/stretch is anchored at the disc BOTTOM
  const sx = s * sq.sx;
  const sy = s * sq.sy;
  const by = y + rad; // bottom
  y = by - rad * sq.sy;
  x = +x.toFixed(2);

  // keep round while the card is rotated about Y
  const k = Math.cos((rotY * Math.PI) / 180);
  const counter = rotY !== 0 && k > 0.02 ? 1 / k : 1;
  const tr = `translate(${x} ${y.toFixed(2)}) scale(${(sx * counter).toFixed(4)} ${sy.toFixed(4)})`;
  const body = (
    <g transform={tr}>
      <circle cx={0} cy={0} r={rad} fill={color} />
      {typeof children === 'function' ? children(rad) : children}
    </g>
  );
  if (horizon === undefined) return body;
  return (
    <>
      <defs>
        <clipPath id={`sunclip${id}`}>
          <rect x={-4000} y={-4000} width={9000} height={horizon + 4000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#sunclip${id})`}>{body}</g>
    </>
  );
};

// ---------------------------------------------------------------- overlays (sun-local coordinates)

/** Power symbol drawn on the sun (switch-off motif). */
export const PowerSymbol: React.FC<{r: number; at?: number; color?: string; width?: number}> = ({r, at, color = palette.card, width = stroke.inkBold + 1.5}) => {
  const rr = r * 0.48;
  return (
    <>
      <Ink d={arc(0, r * 0.04, rr, rr, -60, 240, {seed: 'pwr'})} at={at} dur={0.2} color={color} width={width * (r / 72) ** 0.5} exit={false} />
      <Ink d={line(0, -r * 0.58, 0, -r * 0.08, {over: 0, seed: 'pwr2'})} at={at !== undefined ? at + 0.15 : undefined} color={color} width={width * (r / 72) ** 0.5} exit={false} />
    </>
  );
};

/** Clock hands on the sun. Minute hand turns `speed` revolutions per second after `at`. */
export const ClockHands: React.FC<{r: number; at?: number; speed?: number; color?: string; width?: number; ticks?: boolean}> = ({
  r,
  at = 0,
  speed = 0.5,
  color = palette.card,
  width = stroke.inkBold,
  ticks = true,
}) => {
  const t = useTime();
  if (t < at) return null;
  const pop = springAt(t, at, springs.pop);
  const run = Math.max(0, t - at - 0.3);
  const mA = -90 + 360 * speed * run + 30;
  const hA = -90 + 30 * speed * run + 120;
  const hand = (a: number, len: number) => {
    const rad = (a * Math.PI) / 180;
    return `M0 0L${(Math.cos(rad) * len).toFixed(1)} ${(Math.sin(rad) * len).toFixed(1)}`;
  };
  return (
    <ExitFade x={0} y={0}>
      <g transform={`scale(${pop.toFixed(3)})`}>
        {ticks
          ? [0, 90, 180, 270].map((a) => {
              const rad = (a * Math.PI) / 180;
              return <line key={a} x1={Math.cos(rad) * r * 0.72} y1={Math.sin(rad) * r * 0.72} x2={Math.cos(rad) * r * 0.84} y2={Math.sin(rad) * r * 0.84} stroke={color} strokeWidth={width * 0.8} strokeLinecap="round" />;
            })
          : null}
        <path d={hand(hA, r * 0.38)} stroke={color} strokeWidth={width * 1.15} strokeLinecap="round" fill="none" />
        <path d={hand(mA, r * 0.6)} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
        <circle r={width * 0.9} fill={color} />
      </g>
    </ExitFade>
  );
};
