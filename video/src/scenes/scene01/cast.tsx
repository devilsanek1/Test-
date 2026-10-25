// S01 cast: the plaza citizens (back view, kit Person), the edge onlooker's phone, the lamp pigeons and Pip. Everything
// is a pure function of scene time (no state between frames), so S12's rewind can replay it backwards through a
// TimeProvider.
import React from 'react';
import {canvas, palette, skies, world} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {arc, blob, circle, polyPath, rectPath, roundRect, Pt} from '../../lib/sketch';
import {rand, rng} from '../../lib/rng';
import {mat, useXf, XG} from '../../lib/xf';
import {Person, Bird, PERSON_BODIES} from '../../lib/kit';
import {inkW} from '../../lib/kit/common';
import {useInkScale} from '../../lib/inkComp';
import type {Acc, Hair} from '../../lib/kit/Person';
import {Elephant, popSwitch} from '../../lib/mascot';
import {Citizen} from '../shared/props';
import {pickup, PICKUP_T, S02_PIP, s02PipState} from './handoff';

// ---------------------------------------------------------------- shared bits: elbow arm, lit phone, head turn

/** A sleeve with an elbow from the shoulder to the hand (2-link IK, the elbow bends OUTWARD on `side` and down, so the
 *  arm folds instead of sweeping straight), coat polygon + ink sides + a sand hand. Local units of the figure. */
const ElbowArm: React.FC<{sh: Pt; hand: Pt; lu: number; lf: number; side: 1 | -1; w: number; coat: string; W: number; seed: string; showHand?: boolean}> = ({sh, hand, lu, lf, side, w, coat, W, seed, showHand = true}) => {
  let dx = hand[0] - sh[0];
  let dy = hand[1] - sh[1];
  let d = Math.hypot(dx, dy) || 1e-6;
  const maxD = (lu + lf) * 0.999;
  const H: Pt = d > maxD ? [sh[0] + (dx / d) * maxD, sh[1] + (dy / d) * maxD] : hand;
  dx = H[0] - sh[0];
  dy = H[1] - sh[1];
  d = Math.hypot(dx, dy) || 1e-6;
  const a = (lu * lu - lf * lf + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, lu * lu - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const P: Pt = [sh[0] + ux * a, sh[1] + uy * a];
  const c1: Pt = [P[0] - uy * hh, P[1] + ux * hh];
  const c2: Pt = [P[0] + uy * hh, P[1] - ux * hh];
  // prefer the elbow BELOW the hand-shoulder line (the arm folds up, never a raised elbow with the forearm hanging),
  // then outward on `side`
  const score = (c: Pt) => 0.5 * side * c[0] + c[1];
  const El = score(c1) >= score(c2) ? c1 : c2;
  const nrm = (a0: Pt, b0: Pt): Pt => {
    const L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) || 1;
    return [-(b0[1] - a0[1]) / L, (b0[0] - a0[0]) / L];
  };
  const n1 = nrm(sh, El);
  const n2 = nrm(El, H);
  let mx = n1[0] + n2[0];
  let my = n1[1] + n2[1];
  const mL = Math.hypot(mx, my) || 1;
  mx /= mL;
  my /= mL;
  const ml = Math.min(2.2, 1 / Math.max(0.45, mx * n1[0] + my * n1[1]));
  const hw = w / 2;
  const tw = hw * 0.85;
  const A: Pt[] = [[sh[0] + n1[0] * hw, sh[1] + n1[1] * hw], [El[0] + mx * hw * ml, El[1] + my * hw * ml], [H[0] + n2[0] * tw, H[1] + n2[1] * tw]];
  const Bp: Pt[] = [[sh[0] - n1[0] * hw, sh[1] - n1[1] * hw], [El[0] - mx * hw * ml, El[1] - my * hw * ml], [H[0] - n2[0] * tw, H[1] - n2[1] * tw]];
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const fx = H[0] - El[0];
  const fy = H[1] - El[1];
  const fL = Math.hypot(fx, fy) || 1;
  // fix round 2: a ROUNDED elbow (each sleeve side is one quadratic through its miter point; the old polyline read as a
  // stiff angular Z at the frame edge)
  const sideD = (P: Pt[]) => `M${f(P[0])}Q${f(P[1])} ${f(P[2])}`;
  return (
    <>
      {showHand ? <Fill d={blob(H[0] + (fx / fL) * w * 0.25, H[1] + (fy / fL) * w * 0.25, w * 0.42, w * 0.46, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      <Fill d={`${sideD(A)}L${f(Bp[2])}Q${f(Bp[1])} ${f(Bp[0])}Z`} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`${sideD(A)}${sideD(Bp)}M${f(A[2])}L${f(Bp[2])}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** A phone held up, its screen toward us (we stand behind the filmer), showing what it films (fix round 2: a single
 *  rounded shape over a dark block read as a padlock icon): the plaza in miniature, day sky, the orange sun in the
 *  gap, govB (small dome, BLACK window = the dead screen) left of it and govD's cream block right of it: everyone is
 *  filming the shutdown. The hand's thumb and two fingers wrap the phone's sides in front of
 *  it (sand + ink). Local units, the hand at (0, 0). */
const LitPhone: React.FC<{W: number; seed: string}> = ({W, seed}) => (
  <>
    <Fill d={roundRect(-12, -42, 24, 40, 4)} color={palette.card} offset={false} mode="none" seed={`${seed}/pb`} />
    <Fill d={rectPath(-9, -38, 18, 31)} color={skies.day} offset={false} mode="none" seed={`${seed}/ps`} />
    {/* the sun in the gap, govB (dome + black window) left of it, govD's cream block right of it */}
    <Fill d="M-2 -21a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0Z" color={palette.sun} offset={false} mode="none" seed={`${seed}/psun`} />
    <Fill d="M-9 -9V-20H-8A3.4 3.8 0 0 1 -1.2 -20H0V-9Z" color={palette.sand} offset={false} mode="none" seed={`${seed}/pbb`} />
    <Fill d={rectPath(4, -17.5, 5, 8.5)} color={palette.cream} offset={false} mode="none" seed={`${seed}/pbd`} />
    <Fill d={rectPath(-7.6, -17.6, 6.2, 4)} color={palette.ink} offset={false} mode="none" seed={`${seed}/pwin`} />
    <Fill d={rectPath(-9, -9, 18, 2)} color={palette.mintPale} offset={false} mode="none" seed={`${seed}/pgr`} />
    <Ink d={roundRect(-12, -42, 24, 40, 4, {seed: `${seed}/pi`})} width={W * 0.85} taper={false} seed={`${seed}/pi`} />
    <Ink d="M-9 -20H-8A3.4 3.8 0 0 1 -1.2 -20H0V-9M4 -9V-17.5H9M-9 -9H9" width={W * 0.36} taper={false} seed={`${seed}/pbi`} />
    {/* the hand around the phone: thumb at the lower left, two fingers on the right, in front of the case */}
    <Fill d={blob(-11.5, -8.5, 3.4, 5.4, {seed: `${seed}/th`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/thf`} />
    <Fill d={blob(12, -13, 3.2, 3.8, {seed: `${seed}/f1`}) + blob(12, -6.5, 3.2, 3.6, {seed: `${seed}/f2`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/fgf`} />
    <Ink d={blob(-11.5, -8.5, 3.4, 5.4, {seed: `${seed}/th`}) + blob(12, -13, 3.2, 3.8, {seed: `${seed}/f1`}) + blob(12, -6.5, 3.2, 3.6, {seed: `${seed}/f2`})} width={W * 0.6} taper={false} seed={`${seed}/hi`} />
  </>
);

type HeadGeo = {w: number; hr: number; hy: number};
const TORSO = 95; // the props presets' Person torso (Figures.tsx), so FIG_H = 199 local units
const LEG = 62;
const FIG_H = 199;
/** The kit Person's torso width / head radius for a seed (mirrors makeSpec's first draws when torsoH is given). */
const headGeo = (seed: string, torsoH = TORSO): HeadGeo => {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  return {w, hr, hy: -torsoH - hr * 0.86};
};

/** The back-view -> 3/4 head swap (review: a lean alone reads as nothing on a phone): on the turning side the cheek and
 *  jaw edge appear past the hair and the ear moves in. Grows 20 % -> 100 % about the head (no fades). */
const HeadTurn: React.FC<{g: HeadGeo; d: 1 | -1; k: number; W: number; seed: string}> = ({g, d, k, W, seed}) => {
  const {hr, hy} = g;
  const cx = d * hr * 0.6;
  const cy = hy + hr * 0.3;
  const rx = hr * 0.52;
  const ry = hr * 0.66;
  const ex = d * hr * 0.26;
  const ey = hy + hr * 0.1;
  return (
    <XG m={mat.about(mat.scale(k), d * hr * 0.15, hy + hr * 0.2)}>
      <Fill d={blob(cx, cy, rx, ry, {seed: `${seed}/ck`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/ckf`} />
      <Ink d={arc(cx, cy, rx, ry, d > 0 ? -70 : 110, d > 0 ? 75 : 250, {seed: `${seed}/jw`})} width={W} taper={false} seed={`${seed}/jw`} />
      <Fill d={blob(ex, ey, hr * 0.17, hr * 0.27, {seed: `${seed}/er`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/erf`} />
      <Ink d={arc(ex, ey, hr * 0.17, hr * 0.27, d > 0 ? 100 : -80, d > 0 ? 260 : 80, {seed: `${seed}/eri`})} width={W * 0.8} taper={false} seed={`${seed}/eri`} />
    </XG>
  );
};

// ---------------------------------------------------------------- citizens

const inkFor = (h: number) => (h >= 120 ? 3.4 : h >= 70 ? 2.2 : 1.6);

export type CitizenPlan = {
  x: number;
  y: number;
  h: number;
  seed: string;
  /** Coat colour; omit = the kit Person's own pick for the seed. */
  body?: string;
  hair?: Hair;
  acc?: Acc[];
  /** Walking away toward the VP: px/s along the ray to `vp`, legs at `hz`; slows from slowAt, stands from stopAt. */
  walk?: {speed: number; hz: number; slowAt?: number; stopAt?: number};
  /** Lean keys (deg about the feet); each eases in over 0.2 s. */
  lean?: {t: number; a: number}[];
  /** Head swaps: d = 1 / -1 = the 3/4 head turned right / left (cheek + ear show), 0 = back to the back view. */
  turn?: {t: number; d: 1 | 0 | -1}[];
  /** Raises a phone (lit screen, mini govB) on `side`, along an elbow arc; lowers it at `down`. */
  phone?: {up: number; down?: number; side?: 1 | -1};
  /** Points an arm up at something: local hand target in person units (hip line at 0); lowers it at downAt. */
  point?: {at: number; side: 1 | -1; hand: Pt; downAt?: number};
  /** Idle bob (px). */
  bob?: number;
  silhouette?: boolean;
  /** On-screen ink width override (default by height: 3.4 / 2.2 / 1.6). */
  ink?: number;
  hairColor?: string;
};

/** The coat colour the kit Person picks for a seed when neither body, hair nor acc picks are random (mirrors
 *  makeSpec with torsoH given: w, hr, round, [hair], then body). */
export function coatOf(seed: string, hairGiven = false): string {
  const r = rng(`person/${seed}`);
  for (let i = 0; i < (hairGiven ? 3 : 4); i++) r.next();
  return r.pick(PERSON_BODIES);
}

/** Distance walked along the ray (px) with a linear slow-down from slowAt to stopAt. */
function walked(t: number, w: NonNullable<CitizenPlan['walk']>): number {
  const s0 = w.slowAt ?? w.stopAt ?? 1e9;
  const s1 = w.stopAt ?? 1e9;
  if (t <= s0) return w.speed * t;
  const span = Math.max(1e-6, s1 - s0);
  const u = Math.min(t, s1) - s0;
  return w.speed * (s0 + u - (u * u) / (2 * span));
}

export const leanAt = (t: number, keys?: {t: number; a: number}[]) => {
  if (!keys || !keys.length) return 0;
  let a = 0;
  for (const k of keys) if (t >= k.t) a = lerp(a, k.a, E.outBack(1.4)(clamp((t - k.t) / 0.2)));
  return a;
};

/** The head swap state at t: the side shown and its grow (0.2 -> 1 in 0.1 s; the swap back shrinks in 0.07 s). */
const turnAt = (t: number, keys?: {t: number; d: 1 | 0 | -1}[]): {d: 1 | -1; k: number} | null => {
  if (!keys || !keys.length) return null;
  let cur: 1 | 0 | -1 = 0;
  let prev: 1 | 0 | -1 = 0;
  let at = -1e9;
  for (const k of keys) if (t >= k.t) (prev = cur), (cur = k.d), (at = k.t);
  if (cur !== 0) return {d: cur, k: 0.2 + 0.8 * E.outBack(1.6)(clamp((t - at) / 0.1))};
  if (prev !== 0 && t < at + 0.07) return {d: prev, k: 1 - 0.8 * clamp((t - at) / 0.07)};
  return null;
};

/** One back-view plaza citizen (kit Person with legs) with the S01 acting: walk away and stop, lean, swap to a 3/4 head
 *  toward govB, phone up / down (lit screen), point up. (x, y) = feet. */
export const PlazaCitizen: React.FC<{p: CitizenPlan; vp: Pt; horizon: number}> = ({p, vp, horizon}) => {
  const t = useTime();
  if (p.silhouette) return <Citizen x={p.x} y={p.y} h={p.h} silhouette seed={p.seed} />;
  // walking away along the ray to the VP: feet move toward it, the figure shrinks with perspective
  let x = p.x;
  let y = p.y;
  let h = p.h;
  let walking = false;
  if (p.walk) {
    const d = walked(t, p.walk);
    const L = Math.hypot(vp[0] - p.x, vp[1] - p.y) || 1;
    x = p.x + ((vp[0] - p.x) / L) * d;
    y = p.y + ((vp[1] - p.y) / L) * d;
    h = (p.h * (y - horizon)) / (p.y - horizon);
    walking = p.walk.stopAt === undefined || t < p.walk.stopAt;
  }
  const s = h / FIG_H;
  const bob = p.bob ? osc(t, 0.55) * p.bob : 0; // phase 0: frame 0 = standing
  const lean = leanAt(t, p.lean);
  // the dive's ink compensation comes from the enclosing <InkScale> (plaza.tsx wrap)
  const W = (p.ink ?? inkFor(p.h)) / s;
  const g = headGeo(p.seed);
  const coat = p.body ?? coatOf(p.seed, p.hair !== undefined);
  const parts: React.ReactNode[] = [];
  const turn = turnAt(t, p.turn);
  if (turn) parts.push(<HeadTurn key="turn" g={g} d={turn.d} k={turn.k} W={W * 0.85} seed={`${p.seed}/turn`} />);
  if (p.point && t >= p.point.at) {
    const up = E.outBack(1.5)(clamp((t - p.point.at) / 0.22));
    const dn = p.point.downAt !== undefined ? E.inOutCubic(clamp((t - p.point.downAt) / 0.2)) : 0;
    const q = up * (1 - dn);
    if (q > 0.01) {
      const sh: Pt = [p.point.side * g.w * 0.36, -TORSO * 0.8];
      const down: Pt = [p.point.side * g.w * 0.5, -TORSO * 0.1];
      const hand: Pt = [lerp(down[0], p.point.hand[0], q), lerp(down[1], p.point.hand[1], q)];
      const L = Math.hypot(p.point.hand[0] - sh[0], p.point.hand[1] - sh[1]);
      parts.push(<ElbowArm key="point" sh={sh} hand={hand} lu={L * 0.52} lf={L * 0.52} side={p.point.side} w={19} coat={coat} W={W * 0.85} seed={`${p.seed}/pt`} />);
    }
  }
  if (p.phone && t >= p.phone.up) {
    const side = p.phone.side ?? 1;
    const up = E.outBack(1.2)(clamp((t - p.phone.up) / 0.24));
    const dn = p.phone.down !== undefined ? E.inOutCubic(clamp((t - p.phone.down) / 0.22)) : 0;
    const q = up * (1 - dn);
    if (q > 0.01) {
      const sh: Pt = [side * g.w * 0.38, -TORSO * 0.8];
      const hd: Pt = [side * g.w * 0.52, -TORSO * 0.06];
      const hu: Pt = [side * (g.w * 0.38 + 32), g.hy - g.hr * 0.25];
      const hand: Pt = [lerp(hd[0], hu[0], q) + side * 6 * Math.sin(Math.PI * clamp(q)), lerp(hd[1], hu[1], q)];
      const L = Math.hypot(hd[0] - sh[0], hd[1] - sh[1]);
      parts.push(
        <g key="phone">
          <ElbowArm sh={sh} hand={hand} lu={L * 0.5} lf={L * 0.52} side={side} w={19} coat={coat} W={W * 0.85} seed={`${p.seed}/ph`} />
          {q > 0.35 ? (
            <XG m={mat.compose(mat.translate(hand[0], hand[1] - 4), mat.rotate(side * 6 * (1 - q)), mat.scale(1.05))}>
              <LitPhone W={W} seed={`${p.seed}/lp`} />
            </XG>
          ) : null}
        </g>,
      );
    }
  }
  return (
    <XG m={mat.compose(mat.translate(x, y + bob), mat.rotate(lean), mat.translate(0, -LEG * s), mat.scale(s))}>
      <Person seed={p.seed} legs torsoH={TORSO} legH={LEG} body={p.body} hair={p.hair} hairColor={p.hairColor} acc={p.acc} ink={W} walk={walking ? p.walk?.hz : undefined} hero={false} lod={h < 34 ? 1 : 0} />
      {parts}
    </XG>
  );
};

// ---------------------------------------------------------------- the left edge onlooker's phone (elbow arc)

/** The phone arm of a props EdgeOnlooker drawn by the scene (the prop's own raise sweeps a stiff straight arm across the
 *  plaza): render the onlooker with arms 'near' before `up` and none after, and this on top. Mirrors the prop's figure
 *  frame (head diameter -> scale, shoulder, hanging hand, breathing bob) for the seed. Near side = +1 (left edge). */
export const OnlookerPhoneArm: React.FC<{x: number; y: number; head: number; seed: string; coat: string; up: number; down?: number; hand: Pt}> = ({x, y, head, seed, coat, up, down, hand: handW}) => {
  const t = useTime();
  if (t < up) return null;
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const s = head / (hr * 2);
  const torsoH = Math.min(8000, Math.max(220, Math.ceil(((1920 + 140 + 30 - y) / s - hr * 0.86) / 64) * 64));
  const hw = w / 2;
  const R = Math.min(w * round, torsoH * 0.8);
  const dd = w * 0.18;
  const bob = osc(t, 0.5, rand(seed, 'b') * 6) * 1.5;
  const hipY = y + (torsoH + hr * 0.86) * s + bob;
  // local frame = the prop's (hip line at 0, torso top at -torsoH)
  const sh: Pt = [hw - dd * 0.5, -torsoH + R * 0.55];
  const yCuff = -torsoH + w * 1.05;
  const xc = hw + (hw * 0.07 * (yCuff - (-torsoH + R))) / (torsoH - R);
  const hd: Pt = [xc - dd * 0.5, yCuff + w * 0.06];
  const hu: Pt = [(handW[0] - x) / s, (handW[1] - hipY) / s];
  const qUp = E.outBack(1.15)(clamp((t - up) / 0.26));
  const qDn = down !== undefined ? E.inOutCubic(clamp((t - down) / 0.25)) : 0;
  const q = qUp * (1 - qDn);
  const hand: Pt = [lerp(hd[0], hu[0], q) + 10 * Math.sin(Math.PI * clamp(q)), lerp(hd[1], hu[1], q)];
  const L = Math.hypot(hd[0] - sh[0], hd[1] - sh[1]);
  const W = 4.8 / s;
  return (
    <XG m={mat.compose(mat.translate(x, hipY), mat.scale(s))}>
      <ElbowArm sh={sh} hand={hand} lu={L * 0.5} lf={L * 0.52} side={1} w={dd * 1.05} coat={coat} W={W * 0.9} seed={`${seed}/parm`} />
      {q > 0.3 ? (
        <XG m={mat.compose(mat.translate(hand[0], hand[1] - 3), mat.rotate(8 * (1 - q)), mat.scale(0.9))}>
          <LitPhone W={W} seed={`${seed}/lp`} />
        </XG>
      ) : null}
    </XG>
  );
};

// ---------------------------------------------------------------- pigeons

export type PigeonPlan = {
  x: number;
  y: number;
  seed: string;
  color: string;
  flip?: boolean;
  /** Flies in from landAt and touches down at landAt + inDur: from `from` (offset from the perch) or `fromAbs`, along
   *  a quadratic arc through `via` (absolute; default: a lift above the chord). */
  landAt?: number;
  inDur?: number;
  from?: Pt;
  fromAbs?: Pt;
  via?: Pt;
  /** A small sideways hop on the bar. */
  shuffleAt?: number;
  shuffleDx?: number;
  /** Scatters: flies to perch + flyTo over 0.9 s (out(quad) burst). */
  flyAt?: number;
  flyTo?: Pt;
  /** Comes back: flies in from perch + backFrom along an arc, lands at backAt + 0.34 s. */
  backAt?: number;
  backFrom?: Pt;
};

const FLY_IN = 0.24;
const BACK_DUR = 0.34;

const quadPt = (a: Pt, c: Pt, b: Pt, q: number): Pt => [(1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * c[0] + q * q * b[0], (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * c[1] + q * q * b[1]];

/** A flying pigeon (fix round 4, review: the white fish body with two bare ink strokes rising from its back read as an
 *  insect, a false Bit sighting): a BIRD silhouette, faces right (flip = left). Body in the pigeon's colour, a tealDark
 *  head with a sun beak and a cream eye, a fanned tail, and two FILLED wings (~1.2 x the body, the other light step,
 *  ink outline) hinged at mid-back that flap at 7 Hz between a raised 'V' and a lowered 'Λ': no bare stroke sticks up.
 *  The far wing is drawn behind the body, the near wing in front. Raw paths (the shape changes every frame), stroke x
 *  the InkScale factor. */
const Flyer: React.FC<{x: number; y: number; s: number; t: number; ph: number; color: string; flip?: boolean; seed: string}> = ({x, y, s, t, ph, color, flip}) => {
  const ks = useInkScale();
  const up = (osc(t, 7, ph) + 1) / 2; // 0 = wings down (Λ), 1 = wings up (V)
  const wing = color === palette.tan ? palette.sand : palette.tan;
  const L = 33;
  const W = (2.1 / s) * ks;
  // a wing in its own frame: hinge at (0, 0), pointing along -y, leading edge on +x; placed by rotating -y by b degrees
  // (b -15 = up and a little back, -90 = straight back, -150 = down and back)
  const wingD = `M4.5 0Q8 ${(-L * 0.55).toFixed(1)} 1 ${-L}Q-5 ${(-L * 0.66).toFixed(1)} -6.5 -2Q-3 1 4.5 0Z`;
  const bFar = lerp(-150, -12, up) - 10;
  const bNear = lerp(-150, -12, up) + 12;
  const body = 'M-14 -10Q-6 -17.5 6 -15.5Q13 -14.5 14.5 -10Q9 -5 -2 -6Q-10 -6 -14 -10Z';
  const tail = 'M-13 -11.5L-24 -16L-23 -5L-13 -8.5Z';
  const head = 'M8.6 -14a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0 -10.4 0Z';
  const common = {stroke: palette.ink, strokeWidth: W, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(flip ? -s : s, s))}>
      <XG m={mat.compose(mat.translate(1, -13), mat.rotate(bFar))}>
        <path d={wingD} fill={wing} {...common} />
      </XG>
      <path d={tail} fill={color} {...common} />
      <path d={body} fill={color} {...common} />
      <path d={head} fill={palette.tealDark} {...common} />
      <path d="M18.6 -15L23.5 -13.6L18.6 -12.4Z" fill={palette.sun} stroke="none" />
      <path d="M14.6 -15.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" fill={palette.cream} stroke="none" />
      <XG m={mat.compose(mat.translate(-2, -11), mat.rotate(bNear))}>
        <path d={wingD} fill={wing} {...common} />
        <path d={`M0 ${(-L * 0.42).toFixed(1)}L-3.5 ${(-L * 0.62).toFixed(1)}`} fill="none" {...common} strokeWidth={W * 0.7} />
      </XG>
    </XG>
  );
};

/** The perched pigeon's head in tealDark (the flyer's head colour), drawn over the kit Bird's own head with the Bird's
 *  exact transform (Place(x, y + hop, s, flip), its idle hop and head turn: same `rand(seed, 'ph')` clock). */
const PerchedHead: React.FC<{x: number; y: number; s: number; t: number; seed: string; flip?: boolean}> = ({x, y, s, t, seed, flip}) => {
  const ph = rand(seed, 'ph') * 6.28;
  const look = Math.sin(t * 1.3 + ph) > 0.75 ? -10 : 0;
  const hop = Math.max(0, osc(t, 0.23, ph)) > 0.97 ? -3 : 0;
  const W = inkW(s) * 0.85;
  return (
    <XG m={mat.compose(mat.translate(x, y + hop), mat.scale(flip ? -s : s, s))}>
      <XG m={look ? mat.about(mat.rotate(look), 9, -16) : mat.I}>
        <Fill d={blob(10, -19, 6.5, 6, {seed: `${seed}/h`})} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/hf2`} />
        <Ink d={circle(10, -19, 6.5, {seed: `${seed}/h`, overlap: 12})} width={W} taper={false} seed={`${seed}/hi2`} />
        <Fill d="M16 -19L21 -18L16 -16.5Z" color={palette.sun} offset={false} mode="none" seed={`${seed}/bk2`} />
        <Fill d={blob(12, -20.5, 1.3, 1.3, {seed: `${seed}/eye2`})} color={palette.cream} offset={false} mode="none" seed={`${seed}/ey2`} />
      </XG>
    </XG>
  );
};

const arcPt = (a: Pt, b: Pt, q: number, lift: number): Pt => [lerp(a[0], b[0], q), lerp(a[1], b[1], q) - Math.sin(Math.PI * q) * lift];

/** A lamp-crossbar pigeon: flies in and lands, shuffles, scatters, maybe circles back (kit Bird while perched). */
export const Pigeon: React.FC<{p: PigeonPlan; s?: number}> = ({p, s = 0.8}) => {
  const t = useTime();
  const ph = (p.x % 7) * 0.9;
  const perch: Pt = [p.x + (p.shuffleAt !== undefined && t >= p.shuffleAt ? (p.shuffleDx ?? 10) * E.outCubic(clamp((t - p.shuffleAt) / 0.12)) : 0), p.y];
  // phase: before landing (flying in), perched, scattered (flying away), coming back
  const inDur = p.inDur ?? FLY_IN;
  if (p.landAt !== undefined && t < p.landAt) return null;
  if (p.landAt !== undefined && t < p.landAt + inDur) {
    const q = E.outQuad((t - p.landAt) / inDur);
    const f = p.from ?? [140, -170];
    const a: Pt = p.fromAbs ?? [p.x + f[0], p.y + f[1]];
    const b: Pt = [p.x, p.y];
    const c: Pt = p.via ?? [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 30];
    const [x, y] = quadPt(a, c, b, q);
    const [x2] = quadPt(a, c, b, Math.min(1, q + 0.02));
    return <Flyer x={x} y={y} s={s} t={t} ph={ph} color={p.color} flip={x2 < x} seed={p.seed} />;
  }
  const back = p.backAt !== undefined && t >= p.backAt;
  if (p.flyAt !== undefined && t >= p.flyAt && !back) {
    // fix round 4: a startled BURST (fast take-off, out(quad)) up and left: off the left edge in ~0.3 s
    const q = prog(t, p.flyAt, 0.9, E.outQuad);
    if (q >= 1) return null;
    const to = p.flyTo ?? [200, -360];
    const [x, y] = arcPt(perch, [perch[0] + to[0], perch[1] + to[1]], q, 40);
    return <Flyer x={x} y={y} s={s * (1 - q * 0.3)} t={t} ph={ph} color={p.color} flip={to[0] < 0} seed={p.seed} />;
  }
  if (back && t < (p.backAt as number) + BACK_DUR) {
    const q = E.outQuad((t - (p.backAt as number)) / BACK_DUR);
    const f = p.backFrom ?? [-260, -220];
    const [x, y] = arcPt([p.x + f[0], p.y + f[1]], [p.x, p.y], q, 60);
    return <Flyer x={x} y={y} s={s} t={t} ph={ph} color={p.color} flip={f[0] > 0} seed={p.seed} />;
  }
  // perched: a landing squash after each touch-down, a little hop on the shuffle
  const touch = back ? (p.backAt as number) + BACK_DUR : p.landAt !== undefined ? p.landAt + inDur : undefined;
  const sq = touch !== undefined && t < touch + 0.2 ? 1 - 0.18 * Math.sin(Math.PI * clamp((t - touch) / 0.2)) : 1;
  const hopY = p.shuffleAt !== undefined && t >= p.shuffleAt && t < p.shuffleAt + 0.12 ? -Math.sin(Math.PI * ((t - p.shuffleAt) / 0.12)) * 6 : 0;
  const x = back ? p.x : perch[0];
  return (
    <XG m={mat.about(mat.scale(1 / Math.sqrt(sq), sq), x, p.y)}>
      <Bird x={x} y={p.y + hopY} s={s} seed={p.seed} color={p.color} flip={p.flip} />
      <PerchedHead x={x} y={p.y + hopY} s={s} t={t} seed={p.seed} flip={p.flip} />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip

export type PipPlan = {
  x: number;
  y: number;
  /** Flinches at the click of the press (a squash jolt, still facing away). */
  flinchAt?: number;
  /** Looks at govB (head turn + a big popSwitch ear flick). */
  lookAt: number;
  look: number;
  /** Startle hop (trunk-up, wide) in place: takeoff, landing, back to sit-back. */
  hopAt: number;
  landAt: number;
  backAt: number;
  /** The leap toward the lens on the dive: takeoff time (a 2-frame side-pose crouch before it). From here Pip is drawn
   *  in SCREEN space by `PipLeap` (PipS01 draws nothing). */
  exitAt: number;
  /** Looks back at the plaza (stays sit-back). */
  lookBackAt?: number;
};

/** Startle ticks (fix round 3, review: the 'own' hop read as a calm step at phone size): three short ink ticks
 *  radiating from above Pip's head, popping in 0.3 -> 1 in 0.06 s, gone on landing. (x, y) = the burst centre. */
const StartleTicks: React.FC<{x: number; y: number; at: number; until: number}> = ({x, y, at, until}) => {
  const t = useTime();
  if (t < at || t >= until) return null;
  const k = 0.3 + 0.7 * E.outBack(1.6)(clamp((t - at) / 0.06));
  let d = '';
  for (const a of [-165, -125, -85]) {
    const c = Math.cos((a * Math.PI) / 180);
    const s = Math.sin((a * Math.PI) / 180);
    const r0 = 12 * k;
    const r1 = 12 * k + 17 * k;
    d += `M${(x + c * r0).toFixed(1)} ${(y + s * r0).toFixed(1)}L${(x + c * r1).toFixed(1)} ${(y + s * r1).toFixed(1)}`;
  }
  return <Ink d={d} width={3.6} taper={false} seed="s01/pip/startle" />;
};
/** The burst centre relative to Pip's feet in the flipped stand-side pose (above the head, facing left). */
const PIP_HEAD: Pt = [-40, -92];

const EXIT_CROUCH = 0.075; // 2 frames at 30 fps (f130, f131 before the 4.35 take-off)

/** Pip on his bollard, scale 1.0 (the hop gag must read in the vista). No look to camera. Drawn in the set's NEAR
 *  layer up to the take-off; the leap itself is `PipLeap` (screen space). */
export const PipS01: React.FC<{p: PipPlan; seed?: number}> = ({p, seed = 11}) => {
  const t = useTime();
  if (t >= p.exitAt) return null;
  // the dive exit: a 2-frame crouch in the side pose on the bollard (squash +0.12: the anticipation), then PipLeap
  if (t >= p.exitAt - EXIT_CROUCH) {
    const k = (t - (p.exitAt - EXIT_CROUCH)) / EXIT_CROUCH;
    return <Elephant x={p.x} y={p.y} scale={1} t={t} seed={seed} pose="stand-side" amount={0} squash={0.12 * Math.sin((Math.PI / 2) * Math.min(1, k * 1.6))} look={0.2} />;
  }
  // the startle hop (fix round 2: no look to camera): an instant pop into the PROFILE facing govB (stand-side, flipped
  // to face left), eyes wide, a quick vertical hop with the legs spread and the ears + tail up (the leap `amount`),
  // landing squash, back to sit-back. The old trunk-up pose is front-facing whatever its `look`.
  if (t >= p.hopAt && t < p.backAt) {
    const air = p.landAt - p.hopAt;
    let y = p.y;
    let squash = popSwitch(t, p.hopAt) * 0.6;
    let amount = 0.45;
    if (t < p.landAt) {
      const k = (t - p.hopAt) / air;
      y = p.y - 34 * 4 * k * (1 - k);
      squash -= 0.16 * Math.sin(Math.PI * k);
      // fix round 3: the leap spread (ears + tail up, legs fore / aft) peaks at 1 ON the apex
      amount = 0.45 + 0.55 * Math.pow(Math.sin(Math.PI * k), 0.6);
    } else {
      const d = t - p.landAt;
      squash += 0.22 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2);
      amount = 0.2 + 0.25 * Math.exp(-d * 8);
    }
    return (
      <>
        <Elephant x={p.x} y={y} scale={1} t={t} seed={seed} pose="stand-side" flip expression="wide" amount={amount} look={0.9} squash={squash} />
        <StartleTicks x={p.x + PIP_HEAD[0]} y={y + PIP_HEAD[1]} at={p.hopAt + 0.03} until={p.landAt} />
      </>
    );
  }
  let look = 0;
  let squash = p.flinchAt !== undefined ? popSwitch(t, p.flinchAt) * 1.25 : 0;
  if (t >= p.lookAt) {
    look = p.look;
    squash += popSwitch(t, p.lookAt) * 1.9;
  }
  if (t >= p.backAt) squash += popSwitch(t, p.backAt);
  if (p.lookBackAt !== undefined && t >= p.lookBackAt) {
    look = p.look * 0.2;
    squash += popSwitch(t, p.lookBackAt) * 1.4;
  }
  return <Elephant x={p.x} y={p.y} scale={1} t={t} seed={seed} pose="sit-back" look={look} squash={squash} />;
};

// ---------------------------------------------------------------- Pip's leap across the matchcut (screen space)

const hermite = (a: number, ma: number, b: number, mb: number, s: number) => {
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * a + (s3 - 2 * s2 + s) * ma + (-2 * s3 + 3 * s2) * b + (s3 - s2) * mb;
};

/** Pip's leap toward the lens on the dive, drawn in SCREEN space (fix round 4, review: driven in world space on the
 *  near layer, the dive's zoom flung him off the right rail 6 frames before the cut at ~230 px / frame, and S02 brought
 *  him back moving left). Render it AFTER the set, outside the camera. From the take-off point on the bollard (`from` =
 *  the bollard top on screen at `p.exitAt`, scale `fromScale`) one Hermite curve per coordinate ARRIVES at S02's pickup
 *  state on S02's first frame (handoff.ts: position, velocity, scale and its rate): ~51-65 px per frame, on screen on
 *  every S01 frame (feet x <= ~1036). He takes off facing right (nose up, legs spread), and turns to face left (S02's
 *  facing) in the frame where his x velocity reverses (~f140); from there squash / rotate / spread follow S02's hop
 *  formulas extrapolated, so f141 -> f142 is one continuous hop. Seed 22 = S02's Pip. */
export const PipLeap: React.FC<{p: PipPlan; from: Pt; fromScale: number; v0?: Pt}> = ({p, from, fromScale, v0 = [600, -1700]}) => {
  const t = useTime();
  if (t < p.exitAt || t >= PICKUP_T) return null;
  const D = PICKUP_T - p.exitAt;
  const s = (t - p.exitAt) / D;
  const {p: P1, v: V1, vs} = pickup;
  const x = hermite(from[0], v0[0] * D, P1.x, V1[0] * D, s);
  const y = hermite(from[1], v0[1] * D, P1.y, V1[1] * D, s);
  const x2 = hermite(from[0], v0[0] * D, P1.x, V1[0] * D, Math.min(1, s + 0.01));
  const scale = hermite(fromScale, 0.4 * D, P1.scale, vs * D, s);
  const left = x2 < x; // the x velocity has reversed: face S02's way
  let squash: number;
  let rotate: number;
  let amount: number;
  if (left) {
    const q = s02PipState(t - S02_PIP.start);
    squash = q.squash;
    rotate = q.rotate;
    amount = Math.max(0.6, q.amount);
  } else {
    squash = lerp(-0.12, -0.09, s);
    rotate = -12 * (1 - s);
    amount = Math.sqrt(clamp(s / 0.18));
  }
  return <Elephant x={x} y={y} scale={scale} t={t} seed={S02_PIP.seed} pose="stand-side" flip={left} amount={amount} squash={squash} rotate={rotate} look={left ? 0 : 0.2} />;
};

// ---------------------------------------------------------------- the near observer's shade (on a props EdgeOnlooker)

/** A tealDark shade over the RIGHT sleeve of a props EdgeOnlooker (light from the left, where its rim strip is; fix
 *  round 4, ref2 1.7: one shade step on the foreground figure). Mirrors EdgeOnlooker's figure frame for the seed (kit
 *  torso width / head radius / rounding, the coat length derived from the frame bottom, the breathing bob) and fills
 *  the band between the sleeve seam and the coat outline, from below the hood to the cuff, inset by the ink so both
 *  strokes stay on top. Render it right after the EdgeOnlooker, in the same transform. */
export const OnlookerShade: React.FC<{x: number; y: number; head: number; seed: string; bob: number; color?: string}> = ({x, y, head, seed, bob, color = palette.tealDark}) => {
  const t = useTime();
  const m = useXf();
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const s = head / (hr * 2);
  const iv = mat.inv(m);
  const Y = canvas.height + 40;
  const yb = Math.max(world.h + world.bleed, iv[3] * Y + iv[5], iv[1] * canvas.width + iv[3] * Y + iv[5]);
  const need = (yb + 30 - y) / s - hr * 0.86;
  const h = Math.min(8000, Math.max(220, Math.ceil(need / 64) * 64));
  const hy = -h - hr * 0.86;
  const hipY = y - hy * s + (bob ? osc(t, 0.5, rand(seed, 'b') * 6) * bob : 0);
  const hw = w / 2;
  const bx = hw * 1.07;
  const R = Math.min(w * round, h * 0.8);
  const xAt = (yy: number) => (yy < -h + R ? hw - R + Math.sqrt(Math.max(0, R * R - (yy - (-h + R)) ** 2)) : hw + ((bx - hw) * (yy - (-h + R))) / (h - R));
  const d = w * 0.18;
  const yTop = -h + R - Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) + w * 0.03;
  const yCuff = -h + w * 1.05;
  const xc = xAt(yCuff);
  const ink = DEPTH_INK_FRONT / s;
  const ins = ink * 0.62;
  const y0 = yTop + w * 0.2; // below the hood's shoulder
  const y1 = yCuff - ink * 0.6;
  // the seam: quadratic (hw - d, yTop) -> ctrl (hw - d + 0.012 w, mid) -> (xc - d, yCuff); sample its x at y
  const seamX = (yy: number) => {
    const u = clamp((yy - yTop) / (yCuff - yTop));
    const x0 = hw - d;
    const cx = hw - d + w * 0.012;
    const x1 = xc - d;
    return (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1;
  };
  const N = 8;
  const outer: string[] = [];
  const inner: string[] = [];
  // the top edge runs diagonally down from the outline to the seam (a soft shoulder, not a flat cut)
  const y0i = y0 + w * 0.3;
  for (let i = 0; i <= N; i++) {
    const yy = lerp(y0, y1, i / N);
    const yi = lerp(y0i, y1, i / N);
    outer.push(`${(xAt(yy) - ins).toFixed(2)} ${yy.toFixed(2)}`);
    inner.unshift(`${(seamX(yi) + ins).toFixed(2)} ${yi.toFixed(2)}`);
  }
  const dPath = `M${outer.join('L')}L${inner.join('L')}Z`;
  return (
    <XG m={mat.compose(mat.translate(x, hipY), mat.scale(s))}>
      <Fill d={dPath} color={color} offset={false} mode="none" seed={`${seed}/shade`} />
    </XG>
  );
};
/** props DEPTH_INK.front (EdgeOnlooker's default depth), screen px. */
const DEPTH_INK_FRONT = 4.8;
