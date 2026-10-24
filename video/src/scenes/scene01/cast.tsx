// S01 cast: the plaza citizens (back view, kit Person), the lamp pigeons and Pip. Everything is a pure function of
// scene time (no state between frames), so S12's rewind can replay it backwards through a TimeProvider.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, polyPath, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {mat, XG} from '../../lib/xf';
import {Person, Bird, PERSON_BODIES} from '../../lib/kit';
import type {Acc, Hair} from '../../lib/kit/Person';
import {Elephant, hop, popSwitch} from '../../lib/mascot';
import {Citizen} from '../shared/props';

// ---------------------------------------------------------------- citizens

const TORSO = 95; // the props presets' Person torso (Figures.tsx), so FIG_H = 199 local units
const LEG = 62;
const FIG_H = 199;
const inkFor = (h: number) => (h >= 260 ? 4.8 : h >= 120 ? 3.4 : h >= 70 ? 2.2 : 1.6);

export type CitizenPlan = {
  x: number;
  y: number;
  h: number;
  seed: string;
  /** Coat colour; omit = the kit Person's own pick for the seed (so the figure matches the set's citizen). */
  body?: string;
  hair?: Hair;
  acc?: Acc[];
  /** Walking away toward the VP: px/s along the ray to `vp`, legs at `hz`; slows from slowAt, stands from stopAt. */
  walk?: {speed: number; hz: number; slowAt?: number; stopAt?: number};
  /** Lean keys (deg about the feet: the head turns toward something); each eases in over 0.2 s. */
  lean?: {t: number; a: number}[];
  phone?: {up: number; down?: number};
  /** Points an arm up at something: local hand target in person units (hip line at 0). */
  point?: {at: number; side: 1 | -1; hand: Pt};
  /** Idle bob (px). */
  bob?: number;
  silhouette?: boolean;
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

const leanAt = (t: number, keys?: {t: number; a: number}[]) => {
  if (!keys || !keys.length) return 0;
  let a = 0;
  for (const k of keys) if (t >= k.t) a = lerp(a, k.a, E.outBack(1.4)(clamp((t - k.t) / 0.2)));
  return a;
};

/** A sleeve from the shoulder to the hand (person units): coat polygon + ink sides + a sand hand. */
const Arm: React.FC<{sh: Pt; hand: Pt; coat: string; W: number; seed: string}> = ({sh, hand, coat, W, seed}) => {
  const w = 19;
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  const poly: Pt[] = [
    [sh[0] + nx, sh[1] + ny],
    [hand[0] + nx * 0.85, hand[1] + ny * 0.85],
    [hand[0] - nx * 0.85, hand[1] - ny * 0.85],
    [sh[0] - nx, sh[1] - ny],
  ];
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return (
    <>
      <Fill d={blob(hand[0] + (dx / L) * 5, hand[1] + (dy / L) * 5, 8, 8.5, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} />
      <Fill d={polyPath(poly)} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`M${f(poly[0])}L${f(poly[1])}M${f(poly[2])}L${f(poly[3])}M${f(poly[1])}L${f(poly[2])}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** One back-view plaza citizen (kit Person with legs, like props Citizen) with the S01 acting: walk away and stop,
 *  lean toward govB, phone up / down, point up. (x, y) = feet. */
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
  const bob = p.bob ? osc(t, 0.55) * p.bob : 0; // phase 0: frame 0 = the set's standing citizen
  const lean = leanAt(t, p.lean);
  const phone = p.phone !== undefined && t >= p.phone.up && (p.phone.down === undefined || t < p.phone.down);
  const acc = [...(p.acc ?? []), ...(phone ? (['phone'] as Acc[]) : [])];
  const W = inkFor(p.h) / s;
  let arm: React.ReactNode = null;
  if (p.point && t >= p.point.at) {
    const q = E.outBack(1.5)(clamp((t - p.point.at) / 0.22));
    const w = rng(`person/${p.seed}`).range(86, 100);
    const sh: Pt = [p.point.side * w * 0.34, -TORSO * 0.8];
    const down: Pt = [p.point.side * w * 0.5, -TORSO * 0.1];
    const hand: Pt = [lerp(down[0], p.point.hand[0], q), lerp(down[1], p.point.hand[1], q)];
    arm = <Arm sh={sh} hand={hand} coat={p.body ?? coatOf(p.seed, p.hair !== undefined)} W={W * 0.85} seed={`${p.seed}/arm`} />;
  }
  return (
    <XG m={mat.compose(mat.translate(x, y + bob), mat.rotate(lean), mat.translate(0, -LEG * s), mat.scale(s))}>
      <Person seed={p.seed} legs torsoH={TORSO} legH={LEG} body={p.body} hair={p.hair} acc={acc} ink={W} walk={walking ? p.walk?.hz : undefined} hero={false} lod={h < 34 ? 1 : 0} />
      {arm}
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
  /** Scatters: flies to perch + flyTo over 1.1 s. */
  flyAt?: number;
  flyTo?: Pt;
  /** Comes back: flies in from perch + backFrom along an arc, lands at backAt + 0.34 s. */
  backAt?: number;
  backFrom?: Pt;
};

const FLY_IN = 0.24;
const BACK_DUR = 0.34;

const quadPt = (a: Pt, c: Pt, b: Pt, q: number): Pt => [(1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * c[0] + q * q * b[0], (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * c[1] + q * q * b[1]];

/** Wings-only flying silhouette (the kit Bird's flight shape), flapping. */
const Flyer: React.FC<{x: number; y: number; s: number; t: number; ph: number; flip?: boolean}> = ({x, y, s, t, ph, flip}) => {
  const flap = osc(t, 7, ph) * 9;
  const d = `M-16 ${(-6 - flap).toFixed(1)}Q-8 -2 0 0Q8 -2 16 ${(-6 - flap).toFixed(1)}`;
  return (
    <XG m={mat.compose(mat.translate(x, y - 12 * s), mat.scale(flip ? -s : s, s))}>
      <path d={d + 'M-3 -1Q0 3 3 -1'} fill="none" stroke={palette.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
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
    return <Flyer x={x} y={y} s={s} t={t} ph={ph} flip={x2 < x} />;
  }
  const back = p.backAt !== undefined && t >= p.backAt;
  if (p.flyAt !== undefined && t >= p.flyAt && !back) {
    const q = prog(t, p.flyAt, 1.1, E.inQuad);
    if (q >= 1) return null;
    const to = p.flyTo ?? [200, -360];
    const [x, y] = arcPt(perch, [perch[0] + to[0], perch[1] + to[1]], q, 40);
    return <Flyer x={x} y={y} s={s * (1 - q * 0.3)} t={t} ph={ph} flip={to[0] < 0} />;
  }
  if (back && t < (p.backAt as number) + BACK_DUR) {
    const q = E.outQuad((t - (p.backAt as number)) / BACK_DUR);
    const f = p.backFrom ?? [-260, -220];
    const [x, y] = arcPt([p.x + f[0], p.y + f[1]], [p.x, p.y], q, 60);
    return <Flyer x={x} y={y} s={s} t={t} ph={ph} flip={f[0] > 0} />;
  }
  // perched: a landing squash after each touch-down, a little hop on the shuffle
  const touch = back ? (p.backAt as number) + BACK_DUR : p.landAt !== undefined ? p.landAt + inDur : undefined;
  const sq = touch !== undefined && t < touch + 0.2 ? 1 - 0.18 * Math.sin(Math.PI * clamp((t - touch) / 0.2)) : 1;
  const hopY = p.shuffleAt !== undefined && t >= p.shuffleAt && t < p.shuffleAt + 0.12 ? -Math.sin(Math.PI * ((t - p.shuffleAt) / 0.12)) * 6 : 0;
  const x = back ? p.x : perch[0];
  return (
    <XG m={mat.about(mat.scale(1 / Math.sqrt(sq), sq), x, p.y)}>
      <Bird x={x} y={p.y + hopY} s={s} seed={p.seed} color={p.color} flip={p.flip} />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip

export type PipPlan = {
  x: number;
  y: number;
  /** Flinches at the click of the press (a squash jolt, still facing away). */
  flinchAt?: number;
  /** Looks at govB (head turn + popSwitch ear flick). */
  lookAt: number;
  look: number;
  /** Startle hop (trunk-up, wide) in place: takeoff, landing, back to sit-back. */
  hopAt: number;
  landAt: number;
  backAt: number;
  /** Hops toward the lens on the dive (crouch from here). */
  exitAt: number;
  exitTo: Pt;
  /** Looks back at the plaza (stays sit-back). */
  lookBackAt?: number;
};

/** Pip on his bollard, scale 1.0 (the hop gag must read in the vista). No look to camera. */
export const PipS01: React.FC<{p: PipPlan; seed?: number}> = ({p, seed = 11}) => {
  const t = useTime();
  // the dive exit: a leap toward the lens (up-right, growing), so he crosses the cut toward S02's rod
  if (t >= p.exitAt - 0.14) {
    const air = 0.34;
    const h = hop({t, t0: p.exitAt, dur: air, from: {x: p.x, y: p.y}, to: {x: p.exitTo[0], y: p.exitTo[1]}, height: 110});
    const grow = 1 + 0.7 * E.inQuad(clamp((t - p.exitAt) / air));
    return <Elephant x={h.x} y={h.y} scale={grow} t={t} seed={seed} pose={h.airborne ? 'stand-side' : 'sit-back'} amount={h.spread} squash={h.squash} rotate={h.rotate} look={p.look} />;
  }
  // the startle hop: an instant pop into trunk-up (wide), a quick vertical hop, landing squash, back to sit-back
  if (t >= p.hopAt && t < p.backAt) {
    const air = p.landAt - p.hopAt;
    let y = p.y;
    let squash = popSwitch(t, p.hopAt) * 0.6;
    if (t < p.landAt) {
      const k = (t - p.hopAt) / air;
      y = p.y - 34 * 4 * k * (1 - k);
      squash -= 0.16 * Math.sin(Math.PI * k);
    } else {
      const d = t - p.landAt;
      squash += 0.22 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2);
    }
    return <Elephant x={p.x} y={y} scale={1} t={t} seed={seed} pose="trunk-up" expression="wide" look={p.look * 0.8} squash={squash} />;
  }
  let look = 0;
  let squash = p.flinchAt !== undefined ? popSwitch(t, p.flinchAt) * 1.25 : 0;
  if (t >= p.lookAt) {
    look = p.look;
    squash += popSwitch(t, p.lookAt);
  }
  if (t >= p.backAt) squash += popSwitch(t, p.backAt);
  if (p.lookBackAt !== undefined && t >= p.lookBackAt) {
    look = p.look * 0.35;
    squash += popSwitch(t, p.lookBackAt) * 0.6;
  }
  return <Elephant x={p.x} y={p.y} scale={1} t={t} seed={seed} pose="sit-back" look={look} squash={squash} />;
};
