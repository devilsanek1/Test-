// V2S6_life.tsx (lane L5): S6's life beyond the fence (BUSY: >= 3.5 medium events/s, no gap > 1 s), all scene time:
//   S6Clouds      the top gutter (y <= 285): soft April clouds drifting right 3 px/s (huge = slow)      [gate `bars`]
//   S6Birds       a pair crossing above the facade (y 615-690, never the band), past the sun 2.6        [lawn slot]
//   S6Promenade   the far promenade at the facade's foot (feet 856-880 = small, 100-125 px, heads on the eye line):
//                 jogger A (0-2.9, right strip), a dog walker + dog (all shot), a cyclist (2.45-3.6), a parent with a
//                 stroller (left strip, 0-3.5), jogger B (0.35-1.6, left), a walker (2.6-), a bench reader at rest
//                 (left), the lawn trees behind them (blossom)                                        [lawn slot]
//   S6Staff       the service door (far plane): one walks in 0-0.85 (door shuts 1.00 behind them), one steps out
//                 2.62 for a breath of air and goes back in 3.05-3.6 (door shuts 3.40, never on anyone) [doorPeople]
//   S6LawnMid     lawn-depth things that never touch the fence (y < 1000), drawn in the mid slot behind the board: a
//                 young cherry (left), the gardener kneeling at the tulip bed (right, at rest, trowel), a barrow
//   S6Petals      blossom petals falling through the mid and near planes, never over the board (zones left / right
//                 of it, drifting away from it) + the GUST burst on "any" (14 petals in 4 frames, 0.05-0.11)
// Fairness: no uniforms, lanyards, badges, guards, cameras, vehicles or deliveries; staff are small backs / profiles
// that never look at us; nothing teal (her colour); no Google letters on any prop.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {rand, rng} from '../../lib/rng';
import {Person, Seated} from '../kit/cast';
import {Batch, Paint, mix, crownD, blossomD, ellD, circleD, lineD, cloudD, frac} from '../kit/dc/core';
import {birdD} from '../kit/dc/life';
import {BloomCrowns, BLOOM_NEAR, type BloomTones, type CrownSpec} from '../kit/dc/bloom';
import {GATE, GT} from '../kit/dc/gate';
import {DRIFT, dxOf, adultH} from './V2S6_rig';
import {LEAF} from './V2S6_set';

const smooth = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Piecewise path through keys [t, x, y, h] (smoothstep between keys). */
type Key4 = [number, number, number, number];
const along4 = (keys: Key4[], t: number): [number, number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3]];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b[0]) {
      const k = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
    }
  }
  const z = keys[keys.length - 1];
  return [z[1], z[2], z[3]];
};

// ---------------------------------------------------------------- tones

const LT = {
  cloud: CM.skyHigh,
  cloudLit: CM.paper,
  cloudBelly: mix(CM.skyHigh, CM.stoneShade, 0.35),
  bird: mix(CM.anchor, CM.sky, 0.18),
  birdFar: mix(CM.anchor, CM.sky, 0.38),
  lawnShadow: mix(CM.sage, CM.shadeCool, 0.42),
  pathShadow: mix(CM.paving, CM.shadeWarm, 0.38),
  petal: CM.blossom,
  petalShade: mix(CM.blossom, CM.shadeWarm, 0.28),
  petalLit: mix(CM.blossom, CM.paper, 0.45),
  crown: CM.sage,
  crownShade: mix(CM.sage, CM.waterDeep, 0.55),
  blossomShade: mix(CM.blossom, CM.shadeWarm, 0.3),
  bark: mix(CM.anchor, CM.line, 0.25),
  wood: CM.line,
  woodLit: mix(CM.line, CM.paper, 0.35),
  iron: mix(CM.anchor, CM.paneUnlit, 0.4),
  pram: CM.coatSlate,
  pramHood: mix(CM.coatSlate, CM.anchor, 0.25),
  dog: [CM.leafGold, CM.paper, CM.line] as string[],
  apron: mix(CM.paving, CM.stoneShade, 0.25),
};

// ---------------------------------------------------------------- the top gutter: clouds (screen space)

export const S6Clouds: React.FC = () => {
  const t = useTime();
  const dx = 3 * t;
  let body = '';
  let lit = '';
  let belly = '';
  // [x0, width, base, height]: bases <= 270, so nothing ever reaches the band margin (y 290)
  for (const [x0, w, base, hh] of [
    [-210, 560, 252, 132],
    [480, 470, 150, 92],
    [990, 430, 266, 120],
  ] as [number, number, number, number][]) {
    const x = x0 + dx;
    body += cloudD(x, x + w, base, [
      [x + w * 0.18, w * 0.34, hh * 0.58],
      [x + w * 0.42, w * 0.4, hh],
      [x + w * 0.68, w * 0.36, hh * 0.76],
      [x + w * 0.88, w * 0.2, hh * 0.42],
    ]);
    lit += cloudD(x + w * 0.22, x + w * 0.78, base - hh * 0.32, [
      [x + w * 0.42, w * 0.32, hh * 0.6],
      [x + w * 0.62, w * 0.24, hh * 0.4],
    ]);
    belly += `M${(x + w * 0.1).toFixed(1)} ${base}h${(w * 0.8).toFixed(1)}v-7h${(-w * 0.8).toFixed(1)}Z`;
  }
  // thin high bars
  for (const [x0, y, w, h] of [
    [120, 70, 300, 13],
    [700, 236, 250, 12],
    [-120, 120, 220, 11],
    [860, 54, 260, 12],
  ] as [number, number, number, number][]) {
    const x = x0 + dx * 1.3;
    body += cloudD(x, x + w, y + h, [
      [x + w * 0.32, w * 0.55, h * 1.05],
      [x + w * 0.7, w * 0.5, h * 0.8],
    ]);
  }
  return (
    <>
      <path d={body} fill={LT.cloud} />
      <path d={belly} fill={LT.cloudBelly} />
      <path d={lit} fill={LT.cloudLit} />
    </>
  );
};

// ---------------------------------------------------------------- birds: a pair above the facade (lawn slot)

export const S6Birds: React.FC = () => {
  const t = useTime();
  const lawn = dxOf(DRIFT.lawn, t);
  const t0 = 0.35;
  if (t < t0 || t > 3.75) return null;
  const u = t - t0;
  // screen path: right -> left, gently undulating, always y >= 615 (wing tips >= 607: never the band margin)
  const x1 = 1130 - 380 * u;
  const y1 = 642 + 7 * Math.sin(u * 2.3);
  const x2 = x1 + 46;
  const y2 = y1 + 17 + 4 * Math.sin(u * 2.9 + 1);
  const d1 = birdD(x1 - lawn, y1, 27, (t * 3.7) % 1);
  const d2 = birdD(x2 - lawn, y2, 23, (t * 4.1 + 0.4) % 1);
  return (
    <>
      <path d={d2} stroke={LT.birdFar} strokeWidth={2.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d1} stroke={LT.bird} strokeWidth={2.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
};

/** A second, higher pair in the top gutter (y 150-250: the quiet field, never the band), left -> right from 2.85. */
export const S6SkyBirds: React.FC = () => {
  const t = useTime();
  const t0 = 2.85;
  if (t < t0) return null;
  const u = t - t0;
  const x1 = -40 + 330 * u;
  const y1 = 214 - 22 * u + 5 * Math.sin(u * 2.1);
  const x2 = x1 - 40;
  const y2 = y1 + 15 + 3 * Math.sin(u * 2.7 + 1);
  return (
    <>
      <path d={birdD(x2, y2, 20, (t * 4.0 + 0.3) % 1)} stroke={LT.birdFar} strokeWidth={2.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={birdD(x1, y1, 23, (t * 3.6) % 1)} stroke={LT.birdFar} strokeWidth={2.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
};

/** Five sparrows lift off the cherry crown peeking over the board (3.42) and fly low to the left across the sun,
 *  y >= 606 (wing tips >= 600): never in the band margin. Lawn coords (counter-drifted to a screen path). */
export const S6Sparrows: React.FC = () => {
  const t = useTime();
  const t0 = 3.42;
  if (t < t0) return null;
  const lawn = dxOf(DRIFT.lawn, t);
  const u = t - t0;
  let d = '';
  for (let i = 0; i < 5; i++) {
    const delay = (i % 3) * 0.05 + i * 0.02;
    const k = Math.max(0, u - delay);
    if (k <= 0) continue;
    const sx = 404 + i * 17 + 15 * t0;
    const sy = 640 + (i % 2) * 9;
    // up off the crown, then level and fast to the left
    const x = sx - 300 * k - 120 * k * k;
    const y = Math.max(606 + (i % 3) * 5, sy - 70 * k + 30 * k * k);
    if (x < -30) continue;
    d += birdD(x - lawn, y, 13 + (i % 2) * 2, (t * 5.2 + i * 0.27) % 1);
  }
  return <path d={d} stroke={LT.bird} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
};

// ---------------------------------------------------------------- the lawn trees (lawn plane, behind the promenade)

type TreeSpec = {x: number; base: number; rx: number; ry: number; cy: number; bloom: number; seed: string};
/** Flowering cherries rooted at the facade's foot, drawn like S5's (the dc kit's BloomCrowns: a dark mass, plum limbs,
 *  pink clumps lit on the sun's side = screen left, single flowers), so the April morning is one world across the cut.
 *  Crown tops = cy - 1.16 ry >= 612 (never above y 600). Lawn coords. Kept off the sun (x 215-305), off Pip's calm ring
 *  (x 690-900) and off the service door (x 900-1060). */
const LAWN_TREES: TreeSpec[] = [
  {x: 420, base: 852, rx: 90, ry: 72, cy: 700, bloom: 2.6, seed: 'lt1'},
  {x: 572, base: 852, rx: 94, ry: 74, cy: 704, bloom: 2.4, seed: 'lt2'},
  {x: 1152, base: 856, rx: 104, ry: 80, cy: 706, bloom: 2.6, seed: 'lt3'},
];
/** S6's cherries in the April morning, lit from the left (front-side light, not S5's backlight): a mauve mass under
 *  pink clumps, plum limbs; the far ones one small flat step back toward the sky (never a haze). */
const BLOOM_S6: BloomTones = {
  ...BLOOM_NEAR,
  base: mix(CM.shadeWarm, CM.blossom, 0.38),
  shade: mix(CM.shadeWarm, CM.blossom, 0.6),
  mid: mix(CM.blossom, CM.shadeWarm, 0.18),
  lit: mix(CM.blossom, CM.paper, 0.32),
};
const BLOOM_FAR: BloomTones = Object.fromEntries(Object.entries(BLOOM_S6).map(([k, v]) => [k, mix(v, CM.sky, 0.1)])) as BloomTones;
const LIGHT: [number, number] = [-0.95, -0.3];

const crownOf = (s: TreeSpec): CrownSpec => ({cx: s.x, cy: s.cy, rx: s.rx, ry: s.ry, seed: s.seed, light: LIGHT, bloom: s.bloom, ink: 2.2});

/** A trunk under a crown (flat bark, the lit side left) and its short flat shadow to the right on the ground. */
const trunkInto = (B: Batch, s: TreeSpec, shadow: string) => {
  const top = s.cy + s.ry * 0.55;
  B.poly(shadow, [
    [s.x - 4, s.base],
    [s.x + s.rx * 0.8, s.base - 2],
    [s.x + s.rx * 0.86, s.base + 5],
    [s.x - 2, s.base + 6],
  ]);
  B.poly(LT.bark, [
    [s.x - 7, s.base],
    [s.x - 5, top],
    [s.x + 5, top],
    [s.x + 7, s.base],
  ]);
  B.poly(mix(LT.bark, CM.paper, 0.25), [
    [s.x - 7, s.base],
    [s.x - 5, top],
    [s.x - 2, top],
    [s.x - 3, s.base],
  ]);
  B.ink(lineD([[s.x + 7, s.base], [s.x + 5, top]]), 2.2, CM.ink, 0.2);
};

export const S6LawnTrees: React.FC = () => {
  const b = useMemo(() => {
    const B = new Batch();
    for (const s of LAWN_TREES) trunkInto(B, s, LT.lawnShadow);
    return B;
  }, []);
  const crowns = useMemo(() => LAWN_TREES.map(crownOf), []);
  return (
    <>
      <Paint b={b} seed="s6lawntrunks" misreg={2} />
      <BloomCrowns crowns={crowns} tones={BLOOM_FAR} seed="s6lawncrowns" misreg={2} />
    </>
  );
};

// ---------------------------------------------------------------- the promenade (lawn plane)

type Mover = {
  /** Standing still (a pause: the walk stops mid-stride) at scene t. */
  still?: (t: number) => boolean;
  id: string;
  pose: 'walk' | 'jog' | 'cycle';
  /** screen x at scene t (the camera's drift is removed when drawing in lawn coords). */
  x: (t: number) => number;
  feet: number;
  dir: 1 | -1; // +1 = facing / moving right
  rate: number; // steps/s
  traits: Record<string, unknown>;
  on: [number, number];
};

// The service door's plate (CLASSIFIED / AUTHORIZED PERSONNEL ONLY) is lettering: nobody crosses it while it shows (the
// door shut 1.00-2.30 and from 3.40). The right strip's movers pass the door only while it stands open (0-1.0, 2.3-3.4).
const MOVERS: Mover[] = [
  // right strip, door open: a jogger and a cyclist overtaking her, both heading left behind the post and the board
  {id: 'jogA', pose: 'jog', x: (t) => 1062 - 150 * t, feet: 866, dir: -1, rate: 2.8, traits: {coat: CM.coatMustard, hair: 'cap', hatColor: CM.coatSlate, acc: 'headphones', coatLen: 'jacket'}, on: [0, 2.7]},
  {id: 'cyc', pose: 'cycle', x: (t) => 1196 - 300 * t, feet: 870, dir: -1, rate: 0, traits: {coat: CM.coatOat, hair: 'beanie', hatColor: CM.brickDeep, acc: 'backpack', accColor: CM.coatSlate}, on: [0, 1.75]},
  // right strip, left of the door: a runner at rest (stretching), who sets off left at 2.0
  {id: 'rest', pose: 'jog', x: (t) => (t < 2.0 ? 872 : 872 - 150 * (t - 2.0) * Math.min(1, (t - 2.0) / 0.25)), still: (t) => t < 2.0, feet: 862, dir: -1, rate: 2.7, traits: {coat: CM.brickLight, hair: 'bun', hairColor: CM.hair[2], acc: 'none', coatLen: 'jacket'}, on: [0, 3.2]},
  // right strip, door open again: a runner bursts out from behind the post heading right and is gone by 3.35
  {id: 'jogB2', pose: 'jog', x: (t) => 860 + 228 * (t - 2.35), feet: 874, dir: 1, rate: 3.0, traits: {coat: CM.coatSlate, hair: 'short', hairColor: CM.hair[1], acc: 'none', coatLen: 'jacket'}, on: [2.35, 3.4]},
  // left strip: a parent with a stroller heading out left; a jogger; the dog walker coming in; a late jogger
  {id: 'pram', pose: 'walk', x: (t) => 112 - 38 * t, feet: 858, dir: -1, rate: 1.5, traits: {coat: CM.coatPlum, hair: 'lowBun', hairColor: CM.hair[2], acc: 'tote', accColor: CM.coatOat, coatLen: 'long'}, on: [0, 4.1]},
  {id: 'jogB', pose: 'jog', x: (t) => -62 + 168 * (t - 0.35), feet: 874, dir: 1, rate: 2.9, traits: {coat: CM.sage, hair: 'bun', hairColor: CM.hair[4], acc: 'none', coatLen: 'jacket'}, on: [0.35, 1.9]},
  // the dog walker stops while the dog sniffs the verge (3.0-3.38), then walks on
  {id: 'dogW', pose: 'walk', x: (t) => -64 + 72 * Math.min(t - 1.5, 1.5) + 72 * Math.max(0, t - 3.38), still: (t) => t > 3.0 && t < 3.38, feet: 878, dir: 1, rate: 1.7, traits: {coat: CM.brick, hair: 'short', hairColor: CM.hair[3], acc: 'none', coatLen: 'mid'}, on: [1.5, 4.1]},
  {id: 'jogC', pose: 'jog', x: (t) => -64 + 176 * (t - 3.3), feet: 876, dir: 1, rate: 3.0, traits: {coat: CM.coatMustard, hair: 'curls', hairColor: CM.hair[1], acc: 'none', coatLen: 'jacket'}, on: [3.3, 4.1]},
];

/** The dog (a small terrier in profile, trotting): screen feet (x, y), facing dir, height h (back), gait phase. */
const dogInto = (B: Batch, x: number, y: number, dir: 1 | -1, h: number, ph: number, sniff = 0) => {
  const L = h * 1.45;
  const legA = Math.sin(ph) * h * 0.18;
  const bob = Math.abs(Math.sin(ph)) * h * 0.05;
  const by = y - h * 0.62 - bob;
  const col = LT.dog[0];
  // legs (four short bars, two pairs scissoring)
  for (const [k, s] of [
    [-0.32, 1],
    [-0.22, -1],
    [0.26, -1],
    [0.36, 1],
  ] as [number, number][]) {
    const lx = x + dir * k * L + s * legA * 0.5;
    B.rect(k > 0 ? col : mix(col, CM.shadeWarm, 0.3), lx - h * 0.05, by + h * 0.1, h * 0.1, y - by - h * 0.1);
  }
  B.fill(col, ellD(x, by, L * 0.42, h * 0.27));
  // head + ear + muzzle (in front), tail up (behind)
  const hx = x + dir * L * (0.46 + sniff * 0.08);
  const hy = by - h * 0.28 + sniff * h * 0.42;
  B.fill(col, circleD(hx, hy, h * 0.24));
  B.fill(col, ellD(hx + dir * h * 0.22, hy + h * 0.06, h * 0.14, h * 0.09));
  B.fill(LT.dog[2], ellD(hx - dir * h * 0.05, hy - h * 0.12, h * 0.08, h * 0.14));
  B.ink(lineD([[x - dir * L * 0.4, by - h * 0.05], [x - dir * L * 0.52, by - h * 0.36]]), 2.2, CM.ink);
  B.fill(LT.dog[1], ellD(x - dir * L * 0.05, by + h * 0.02, L * 0.18, h * 0.12));
};

/** The stroller (a pram seen in profile): handle toward its pusher (dir = travel direction). Screen feet line y. */
const pramInto = (B: Batch, x: number, y: number, dir: 1 | -1, s: number, ph: number) => {
  const w = s * 0.86;
  const top = y - s * 0.92;
  // wheels (ink rings with a flat hub)
  for (const k of [-0.32, 0.3]) {
    const wx = x + dir * k * w;
    B.ink(`M${(wx - s * 0.13).toFixed(1)} ${(y - s * 0.13).toFixed(1)}a${(s * 0.13).toFixed(1)} ${(s * 0.13).toFixed(1)} 0 1 0 ${(s * 0.26).toFixed(1)} 0a${(s * 0.13).toFixed(1)} ${(s * 0.13).toFixed(1)} 0 1 0 ${(-s * 0.26).toFixed(1)} 0`, 1.6, CM.ink);
    const a = ph + k;
    B.ink(lineD([[wx - Math.cos(a) * s * 0.12, y - s * 0.13 - Math.sin(a) * s * 0.12], [wx + Math.cos(a) * s * 0.12, y - s * 0.13 + Math.sin(a) * s * 0.12]]), 1.2, CM.ink);
  }
  // body (a rounded tub) + hood (a quarter dome toward the travel side) + handle back to the pusher
  B.fill(LT.pram, `M${(x - w * 0.46).toFixed(1)} ${(y - s * 0.62).toFixed(1)}Q${x.toFixed(1)} ${(y - s * 0.18).toFixed(1)} ${(x + w * 0.46).toFixed(1)} ${(y - s * 0.62).toFixed(1)}Z`);
  B.fill(LT.pramHood, `M${(x + dir * w * 0.05).toFixed(1)} ${(y - s * 0.6).toFixed(1)}Q${(x + dir * w * 0.1).toFixed(1)} ${top.toFixed(1)} ${(x + dir * w * 0.5).toFixed(1)} ${(y - s * 0.6).toFixed(1)}Z`);
  B.ink(lineD([[x - dir * w * 0.44, y - s * 0.6], [x - dir * w * 0.62, y - s * 1.0], [x - dir * w * 0.7, y - s * 1.0]]), 2.2, CM.ink);
  B.ink(lineD([[x - dir * w * 0.3, y - s * 0.3], [x + dir * w * 0.3, y - s * 0.12]]), 1.2, CM.ink);
};

/** People on the far promenade + the bench reader (lawn coordinates: drawn inside the lawn plane's group). */
export const S6Promenade: React.FC = () => {
  const t = useTime();
  const lawn = dxOf(DRIFT.lawn, t);
  const out: React.ReactNode[] = [];
  const props = new Batch();
  const shadows: string[] = [];
  for (const m of MOVERS) {
    if (t < m.on[0] || t > m.on[1]) continue;
    const sx = m.x(t);
    if (sx < -120 || sx > 1220) continue;
    const x = sx - lawn;
    const h = adultH(m.feet) * (m.pose === 'jog' ? 1.0 : 0.97);
    const flip = m.dir === 1;
    shadows.push(ellD(x + h * 0.2, m.feet + 1.5, h * 0.3, 3.2));
    if (m.pose === 'cycle') {
      out.push(<Person key={m.id} x={x} y={m.feet} h={h} seed={`s6/${m.id}`} pose="cycle" view="profile" flip={flip} traits={m.traits} pedal={1.3} />);
      continue;
    }
    const still = m.still ? m.still(t) : false;
    out.push(<Person key={m.id} x={x} y={m.feet} h={h} seed={`s6/${m.id}`} pose={still ? 'stand' : m.pose} view="profile" flip={flip} walk={still ? undefined : {rate: m.rate, phase: rand('s6walk', m.id) * 4}} traits={m.traits} />);
    if (m.id === 'dogW') {
      // the dog trots ahead on a lead; its trot runs at 12 drawings/s like the people
      const ph = Math.floor(t * 12) / 12;
      const dogX = x + 66;
      const dh = 26;
      dogInto(props, dogX, m.feet + 2, 1, dh, still ? 0.4 : ph * 13, still ? 1 : 0);
      shadows.push(ellD(dogX + 8, m.feet + 3, 24, 2.6));
      props.ink(`M${(x + h * 0.1).toFixed(1)} ${(m.feet - h * 0.46).toFixed(1)}Q${(x + 36).toFixed(1)} ${(m.feet - h * 0.2).toFixed(1)} ${(dogX + 26).toFixed(1)} ${(m.feet - dh * 0.95).toFixed(1)}`, 1.4, CM.ink);
    }
    if (m.id === 'pram') {
      const px = x - 52;
      pramInto(props, px, m.feet + 1, -1, h * 0.56, -t * 9);
      shadows.push(ellD(px + 14, m.feet + 2, 30, 2.6));
    }
  }
  return (
    <>
      <path d={shadows.join('')} fill={LT.lawnShadow} />
      {out}
      <Paint b={props} seed="s6props" misreg={2} />
    </>
  );
};

// ---------------------------------------------------------------- the staff at the service door (far plane)

const D = GATE.door; // x 900-1020, y 735-835 (far coords)
const H_OUT = 80;
const H_IN = 76;

type StaffKey = {t: number; x: number; feet: number; h: number};
type StaffPhase = {t0: number; t1: number; view: 'back' | 'profile'; dir: 1 | -1; walking: boolean};
const STAFF1_KEYS: Key4[] = [
  [0.0, 946, 842, H_OUT],
  [0.24, 949, 833, H_IN],
  [0.34, 948, 831, H_IN - 2],
  [0.86, 872, 831, H_IN - 2],
];
const STAFF1_PHASES: StaffPhase[] = [
  {t0: -1, t1: 0.3, view: 'back', dir: 1, walking: true},
  {t0: 0.3, t1: 0.9, view: 'profile', dir: -1, walking: true},
];
const STAFF2_KEYS: Key4[] = [
  [2.3, 934, 832, H_IN],
  [2.62, 934, 832, H_IN],
  [2.92, 908, 842, H_OUT],
  [3.08, 908, 842, H_OUT],
  [3.3, 918, 832, H_IN],
  [3.38, 916, 831, H_IN - 1],
  [3.62, 872, 831, H_IN - 1],
];
const STAFF2_PHASES: StaffPhase[] = [
  {t0: 2.3, t1: 2.62, view: 'profile', dir: -1, walking: false},
  {t0: 2.62, t1: 2.92, view: 'profile', dir: -1, walking: true},
  {t0: 2.92, t1: 3.08, view: 'profile', dir: -1, walking: false},
  {t0: 3.08, t1: 3.36, view: 'back', dir: 1, walking: true},
  {t0: 3.36, t1: 3.64, view: 'profile', dir: -1, walking: true},
];
const phaseAt = (ph: StaffPhase[], t: number) => ph.find((p) => t >= p.t0 && t < p.t1) ?? null;

/** Staff member 2's head on SCREEN while it is outside (Pip watches it), else null. */
export const staffHeadAt = (t: number): [number, number] | null => {
  if (t < 2.6 || t > 3.32) return null;
  const [x, feet, h] = along4(STAFF2_KEYS, t);
  return [x + dxOf(DRIFT.far, t), feet - h * 0.85];
};

const StaffMember: React.FC<{keys: Key4[]; phases: StaffPhase[]; seed: string; traits: Record<string, unknown>; clipId: string}> = ({keys, phases, seed, traits, clipId}) => {
  const t = useTime();
  const ph = phaseAt(phases, t);
  if (!ph) return null;
  const [x, feet, h] = along4(keys, t);
  const inside = feet < D.y1 - 0.5;
  const fig = (
    <Person
      x={x}
      y={feet}
      h={h}
      seed={seed}
      exact
      pose={ph.walking ? 'walk' : 'stand'}
      view={ph.view}
      flip={ph.dir === 1}
      walk={ph.walking ? {rate: 1.9} : undefined}
      traits={traits}
    />
  );
  if (inside) return <g clipPath={`url(#${clipId})`}>{fig}</g>;
  return (
    <>
      <path d={ellD(x + h * 0.18, feet + 1, h * 0.26, 2.4)} fill={LT.pathShadow} />
      {fig}
    </>
  );
};

/** The doorway's apron and the two people (FAR coords: put it in the gate's `doorPeople` slot). */
export const S6Staff: React.FC = () => {
  const clipId = 's6doorway';
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={D.x0} y={D.y0} width={D.x1 - D.x0} height={D.y1 - D.y0} />
        </clipPath>
      </defs>
      {/* the apron: a paved step out of the door onto the facade's foot */}
      <path d={`M${D.x0 - 34} ${D.y1}H${D.x1 + 34}L${D.x1 + 52} ${D.y1 + 12}H${D.x0 - 52}Z`} fill={LT.apron} />
      <path d={`M${D.x0 - 52} ${D.y1 + 12}H${D.x1 + 52}`} stroke={mix(CM.ink, CM.shadeWarm, 0.45)} strokeWidth={1.6} />
      <StaffMember keys={STAFF1_KEYS} phases={STAFF1_PHASES} seed="s6/staff1" clipId={clipId} traits={{coat: CM.coatSlate, hair: 'short', hairColor: CM.hair[0], acc: 'none', coatLen: 'jacket', trousers: CM.anchor}} />
      <StaffMember keys={STAFF2_KEYS} phases={STAFF2_PHASES} seed="s6/staff2" clipId={clipId} traits={{coat: CM.coatOat, hair: 'bun', hairColor: CM.hair[3], acc: 'none', coatLen: 'jacket', trousers: CM.coatSlate}} />
    </>
  );
};

// ---------------------------------------------------------------- lawn-depth things in the mid slot (y < 1000)

/** A young cherry on the lawn left of the board (mid coords; its own lawn-depth drift), the gardener kneeling at the
 *  kit's right tulip bed (mid coords: the bed rides the mid plane), a barrow. Nothing here reaches the fence (y 1004). */
export const S6LawnMid: React.FC = () => {
  const t = useTime();
  const md = dxOf(DRIFT.mid, t);
  // the young cherry: lawn-depth drift ~14 px/s
  const tdx = dxOf(14, t) - md;
  const young: TreeSpec = {x: 26, base: 958, rx: 96, ry: 80, cy: 728, bloom: 2.8, seed: 'ltL'};
  const tree = useMemo(() => {
    const B = new Batch();
    trunkInto(B, young, LT.lawnShadow);
    return B;
  }, []);
  const youngCrown = useMemo(() => [crownOf(young)], []);
  // the gardener: kneeling in front of the kit's right tulip bed (mid coords (1000, 930)), back to us, at rest but
  // working (the head turns over the bed, the trowel digs); a barrow and a trug beside them on the lawn
  const gx = 992;
  const gy = 972;
  const turn = 0.25 * Math.sin(t * 1.3);
  const dig = Math.sin(Math.floor(t * 12) / 12 * 7.5) * 5;
  const g = new Batch();
  g.fill(LT.lawnShadow, ellD(gx + 30, gy + 3, 46, 5));
  // barrow (left): tray, wheel, legs, handles
  const bx = 900;
  const by = gy - 4;
  g.fill(LT.lawnShadow, ellD(bx + 24, by + 5, 38, 4));
  g.poly(mix(CM.coatSlate, CM.sage, 0.3), [
    [bx - 30, by - 36],
    [bx + 30, by - 36],
    [bx + 20, by - 12],
    [bx - 22, by - 12],
  ]);
  g.fill(mix(CM.brickDeep, CM.anchor, 0.3), ellD(bx, by - 37, 28, 7));
  g.fill(LEAF.body, ellD(bx + 8, by - 41, 12, 5));
  g.ink(lineD([[bx + 30, by - 32], [bx + 54, by - 24]]), 1.6, CM.ink);
  g.ink(`M${bx + 16} ${by - 1}a10 10 0 1 0 20 0a10 10 0 1 0 -20 0`, 1.6, CM.ink);
  g.ink(lineD([[bx - 22, by - 12], [bx - 27, by]]), 1.6, CM.ink);
  // trug of bulbs (right) + kneeling pad + the trowel
  g.fill(CM.line, `M${gx + 34} ${gy - 14}h32l-5 14h-22Z`);
  g.fill(CM.coatOat, ellD(gx + 50, gy - 15, 15, 4));
  g.rect(CM.brickLight, gx - 26, gy - 5, 46, 7);
  g.ink(lineD([[gx + 12, gy - 40 + dig], [gx + 20, gy - 18 + dig]]), 2.2, CM.ink);
  return (
    <>
      <g transform={`translate(${tdx.toFixed(2)} 0)`}>
        <Paint b={tree} seed="s6youngcherry" misreg={2} />
        <BloomCrowns crowns={youngCrown} tones={BLOOM_S6} seed="s6youngcrown" misreg={3} />
      </g>
      <Paint b={g} seed="s6garden" misreg={2} />
      <Seated x={gx} y={gy - 20} h={66} seed="s6/gardener" turn={turn} traits={{coat: CM.coatOat, hair: 'cap', hatColor: CM.brickDeep, acc: 'none'}} />
    </>
  );
};

// ---------------------------------------------------------------- petals (screen space, never over the board)

type Petal = {x: number; y: number; s: number; flip: number; tone: 0 | 1 | 2};

/** Falling petals in waves: petal i is born every `period` s (phase-shifted), falls with a sway, then RESTS where it
 *  lands (never vanishes). `pos(i, tb, age)` returns its screen spot and whether it has landed. */
const waves = (n: number, seed: string, t: number, pos: (i: number, tb: number, age: number) => {x: number; y: number; landed: boolean} | null, size: [number, number], out: Petal[]) => {
  for (let i = 0; i < n; i++) {
    const period = 1.6 + rand(seed, `p${i}`) * 1.4;
    const ph = rand(seed, `ph${i}`) * period;
    const kMax = Math.floor((t - ph) / period);
    for (let k = kMax; k >= kMax - 4; k--) {
      const tb = ph + k * period;
      const age = t - tb;
      if (age < 0) continue;
      const p = pos(i * 7 + (k & 7), tb, age);
      if (!p) continue;
      out.push({x: p.x, y: p.y, s: size[0] + rand(seed, `s${i}/${k}`) * (size[1] - size[0]), flip: p.landed ? 0.35 : Math.abs(Math.cos(t * 3 + i * 1.7 + k)), tone: ((i + k) % 3) as 0 | 1 | 2});
    }
  }
};

export const S6Petals: React.FC = () => {
  const t = useTime();
  const ps: Petal[] = [];
  // LEFT zone: from the young cherry left of the board (it drifts ~14 px/s); they drift LEFT, away from the board (which
  // drifts right), fall to the lawn at y ~990-1010 and rest there (the lawn's depth, ~14 px/s)
  waves(5, 's6petL', t, (i, tb, age) => {
    const x0 = -36 + rand('s6petL', `x${i}`) * 112 + 14 * tb;
    const y0 = 690 + rand('s6petL', `y${i}`) * 100;
    const vy = 52 + rand('s6petL', `v${i}`) * 26;
    const yEnd = 990 + rand('s6petL', `e${i}`) * 22;
    const fall = Math.min(age, (yEnd - y0) / vy);
    const x = x0 - 12 * fall + 14 * (age - fall) + 9 * Math.sin(fall * 2.1 + i);
    const y = y0 + vy * fall;
    if (x < -20) return null;
    return {x, y, landed: fall < age};
  }, [5, 8], ps);
  // NEAR: petals shaken off the flowering shrub (bottom left), carried right by the breeze and the near plane's drift,
  // settling on the paving and resting there (y > 1250 always: they never cross the board)
  const nr = (tb: number) => dxOf(DRIFT.near, tb);
  waves(7, 's6petN', t, (i, tb, age) => {
    const x0 = -60 + rand('s6petN', `x${i}`) * 170 + nr(tb);
    const y0 = 1290 + rand('s6petN', `y${i}`) * 110;
    const vy = 30 + rand('s6petN', `v${i}`) * 22;
    const yEnd = 1430 + rand('s6petN', `e${i}`) * 220;
    const fall = Math.min(age, (yEnd - y0) / vy);
    const x = x0 + (65 + 30) * fall + 65 * (age - fall) + 14 * Math.sin(fall * 1.6 + i);
    const y = y0 + vy * fall;
    if (x > 1110) return null;
    return {x, y, landed: fall < age};
  }, [8, 13], ps);
  // the GUST on "any": 14 petals blown off the shrub in 4 frames (0.05-0.10), skittering right across the footpath,
  // then resting (riding the near plane). Always below y 1250.
  for (let i = 0; i < 14; i++) {
    const tb = 0.05 + (i % 4) / 60;
    if (t < tb) continue;
    const age = t - tb;
    const x0 = 4 + rand('s6gust', `x${i}`) * 112 + nr(tb);
    const y0 = 1300 + rand('s6gust', `y${i}`) * 96;
    const v0 = 240 + rand('s6gust', `o${i}`) * 220;
    const vy0 = -(30 + rand('s6gust', `u${i}`) * 50);
    const g = 260;
    const yEnd = 1440 + rand('s6gust', `e${i}`) * 200;
    // time to land: y0 + vy0 a + g a^2 / 2 = yEnd
    const aL = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * (yEnd - y0))) / g;
    const a = Math.min(age, aL);
    const x = x0 + 65 * age + (v0 * (1 - Math.exp(-a * 2.4))) / 2.4 + 8 * Math.sin(a * 5 + i);
    const y = Math.max(1262, y0 + vy0 * a + 0.5 * g * a * a);
    if (x > 1110) continue;
    ps.push({x, y, s: 8 + rand('s6gust', `s${i}`) * 5, flip: a < age ? 0.35 : Math.abs(Math.cos(t * 7 + i * 1.3)), tone: (i % 3) as 0 | 1 | 2});
  }
  const d: [string, string, string] = ['', '', ''];
  for (const p of ps) d[p.tone] += ellD(p.x, p.y, p.s, p.s * (0.25 + 0.6 * p.flip));
  return (
    <>
      <path d={d[0]} fill={LT.petal} />
      <path d={d[1]} fill={LT.petalShade} />
      <path d={d[2]} fill={LT.petalLit} />
    </>
  );
};

void GT;
