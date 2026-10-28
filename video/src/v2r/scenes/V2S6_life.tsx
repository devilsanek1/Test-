// V2S6_life.tsx (lane L5): S6's life on the inner clock (film - 24.00) and V2S6_rig's ONE camera (people sized by
// adultH(feet)). <= 3 noticeable movers at once, taking turns (conform_L5 §2):
//   S6LawnTrees   the lawn's flowering cherries beyond the fence (plane +2)
//   S6Promenade   ONE jogger on the far promenade, left of the board, 24.45 on (tier C) (plane +2)
//   S6Staff       the service door (in the facade's doorway slot, plane +3): one walks in, already under way at the
//                 cut (the door shuts 25.0 behind them), one steps out 26.62 for a breath of air and goes back in
//                 27.08-27.62 (the door shuts 27.4, never on anyone); small backs and profiles (tier B)
//   S6Petals      S6's own declared falling weather: blossom petals from the near shrub (bottom left), <= 8 at once, no
//                 gust, growing in and shrinking out, never over the board, Pip or the band; none born in the quiet
//                 windows round the joins (film 23.60-24.00, 27.90-28.30) (plane -1)
//   S6Clouds      S5's far sky draws it (V2S5_far); S6's own sky is lib/sky's one gradient and carries none
// Fairness: no uniforms, lanyards, badges, guards, cameras, vehicles or deliveries; staff are small backs / profiles
// that never look at us; nothing teal (her colour); no Google letters on any prop.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Person} from '../kit/cast';
import {Batch, Paint, mix, ellD, lineD, cloudD} from '../kit/dc/core';
import {BloomCrowns, BLOOM_NEAR, type BloomTones, type CrownSpec} from '../kit/dc/bloom';
import {GATE} from '../kit/dc/gate';
import {Tier} from '../kit/tiers';
import {CastShadow, ContactShadow, ShadowLayer} from '../../lib/light';
import {adultH, QUIET} from './V2S6_rig';
import {S6_AIR} from '../world/skies';

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

/** S6's steps toward the April air, one flat step per plane (lib/depth PLANE_STEPS are 0.12 / 0.22 / 0.40; S6 takes
 *  more, so the ladder reads at a squint: the fence + lawn, then the cherries, then the facade, each >= 3 dE closer to
 *  the air; check_depth at 25.0). */
export const S6_AIR_K = {fence: 0.15, lawn: 0.62, facade: 0.72} as const;

const LT = {
  trunkFar: mix(mix(CM.anchor, CM.line, 0.25), S6_AIR, S6_AIR_K.lawn),
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

// ---------------------------------------------------------------- the lawn trees (lawn plane, behind the promenade)

type TreeSpec = {x: number; base: number; rx: number; ry: number; cy: number; bloom: number; seed: string};
/** Flowering cherries rooted at the facade's foot, drawn like S5's (the dc kit's BloomCrowns: a dark mass, plum limbs,
 *  pink clumps lit on the sun's side = screen left, single flowers), so the April morning is one world across the cut.
 *  Crown tops = cy - 1.16 ry >= 612 (never above y 600). Lawn coords. Kept off the sun (x 215-305), off Pip's calm ring
 *  (x 690-900) and off the service door (x 900-1060). */
const LAWN_TREES: TreeSpec[] = [
  {x: -26, base: 872, rx: 74, ry: 58, cy: 786, bloom: 2.4, seed: 'lt0'},
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
const BLOOM_FAR: BloomTones = Object.fromEntries(Object.entries(BLOOM_S6).map(([k, v]) => [k, mix(v, S6_AIR, S6_AIR_K.lawn)])) as BloomTones;
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
  B.poly(LT.trunkFar, [
    [s.x - 7, s.base],
    [s.x - 5, top],
    [s.x + 5, top],
    [s.x + 7, s.base],
  ]);
  B.poly(mix(LT.trunkFar, CM.paper, 0.25), [
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

/** The one jogger (tier C): in from the left edge after the join's quiet window, running right on the far promenade
 *  until the board hides them (x 120, ~25.5). */
const JOG = {t0: 0.45, x0: -62, v: 168, feet: 874, rate: 2.9, traits: {coat: CM.sage, hair: 'bun', hairColor: CM.hair[4], acc: 'none', coatLen: 'jacket', trousers: CM.stoneShade} as const};

/** The far promenade (lawn plane): the jogger and their shadows (the rig's: contact + cast). */
export const S6Promenade: React.FC = () => {
  const t = useTime();
  if (t < JOG.t0) return null;
  const x = JOG.x0 + JOG.v * (t - JOG.t0);
  if (x > 160) return null;
  const h = adultH(JOG.feet);
  return (
    <Tier tier="environment">
      <ShadowLayer>
        <ContactShadow x={x} y={JOG.feet} w={h * 0.24} k={1.2} />
        <CastShadow x={x} y={JOG.feet} w={h * 0.2} h={h} />
      </ShadowLayer>
      <Person x={x} y={JOG.feet} h={h} seed="s6/jogB" pose="jog" view="profile" flip walk={{rate: JOG.rate, phase: rand('s6walk', 'jogB') * 4}} traits={JOG.traits} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the staff at the service door (far plane)

const D = GATE.door; // x 900-1020, y 735-835 (far coords)
/** Heights by the camera: 1.7 m at the doorway's foot (y 835: 68 px) and on the apron (y 842: 75 px). */
const H_OUT = 75;
const H_IN = 68;

type StaffKey = {t: number; x: number; feet: number; h: number};
type StaffPhase = {t0: number; t1: number; view: 'back' | 'profile'; dir: 1 | -1; walking: boolean};
const STAFF1_KEYS: Key4[] = [
  [-0.3, 945, 849, H_OUT + 7],
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
  return [x, feet - h * 0.85];
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
      <ShadowLayer>
        <ContactShadow x={x} y={feet} w={h * 0.24} k={1.2} />
        <CastShadow x={x} y={feet} w={h * 0.2} h={h} />
      </ShadowLayer>
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

// ---------------------------------------------------------------- petals: S6's own falling weather (plane -1)

/** The petals: 6 slots, each born every 4.2-5.4 s inside the near shrub's lower crown (bottom left: x 20-90, y 1380-1500,
 *  under the board's feet), carried right by the breeze 50-90 px/s and falling 25-40 px/s with a sway, living 3.5-5.0 s
 *  (grow in 0.25 s among the shrub's blossom, shrink out 0.35 s): <= 6 at once, 20-28 px long (near the lens: seen at
 *  phone size), crossing the tulips and then the calm paving in rose steps that read on it; never over the board (born
 *  under its feet), never near Pip (they pass x 310 below y 1440), never in the band. None born in the quiet windows
 *  (V2S6_rig QUIET: film 23.60-24.00, 27.90-28.30). */
const PET = {n: 6, period: [4.2, 5.4], life: [3.5, 5.0], grow: 0.25, shrink: 0.35, size: [20, 28]} as const;
const PET_TONES = [mix(CM.blossom, CM.shadeWarm, 0.18), mix(CM.blossom, CM.shadeWarm, 0.32), CM.blossom];
type Petal = {x: number; y: number; s: number; flip: number; rot: number; tone: 0 | 1 | 2};
const quiet = (tb: number) => QUIET.some(([a, b]) => tb >= a && tb <= b);

/** Where the petals born at these inner times are at time t (pure: also the checks' source). */
export const petalsAt = (t: number): Petal[] => {
  const ps: Petal[] = [];
  for (let i = 0; i < PET.n; i++) {
    const r = (k: string) => rand('s6pet', `${k}${i}`);
    const P = PET.period[0] + r('p') * (PET.period[1] - PET.period[0]);
    const ph = r('ph') * P - 4.5;
    for (let k = Math.floor((t - ph) / P); k >= Math.floor((t - ph) / P) - 1; k--) {
      const tb = ph + k * P;
      if (quiet(tb)) continue;
      const rk = (q: string) => rand('s6pet', `${q}${i}/${k}`);
      const L = PET.life[0] + rk('L') * (PET.life[1] - PET.life[0]);
      const age = t - tb;
      if (age < 0 || age > L) continue;
      const x0 = 20 + rk('x') * 70;
      const y0 = 1380 + rk('y') * 120;
      const vx = 50 + rk('vx') * 40;
      const vy = 25 + rk('vy') * 15;
      const x = x0 + vx * age + 8 * Math.sin(age * 1.9 + i);
      const y = y0 + vy * age + 5 * Math.sin(age * 2.7 + i * 0.7);
      const g = Math.min(1, age / PET.grow, (L - age) / PET.shrink);
      const s = (PET.size[0] + rk('s') * (PET.size[1] - PET.size[0])) * g;
      if (s < 1) continue;
      ps.push({x, y, s, flip: Math.abs(Math.cos(age * 2.4 + i * 1.7)), rot: (age * 70 + i * 50) % 360, tone: ((i + k) % 3) as 0 | 1 | 2});
    }
  }
  return ps;
};

/** A petal: a rounded teardrop with a small notch, flipping (its width) as it tumbles. */
const petalD = (p: Petal): string => {
  const L = p.s;
  const W = L * (0.22 + 0.36 * p.flip);
  const a = (p.rot * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const P2 = (u: number, v: number) => `${(p.x + u * c - v * sn).toFixed(1)} ${(p.y + u * sn + v * c).toFixed(1)}`;
  return `M${P2(-L / 2, 0)}C${P2(-L / 4, -W)} ${P2(L / 4, -W)} ${P2(L / 2, -W * 0.2)}L${P2(L * 0.4, 0)}L${P2(L / 2, W * 0.2)}C${P2(L / 4, W)} ${P2(-L / 4, W)} ${P2(-L / 2, 0)}Z`;
};

export const S6Petals: React.FC = () => {
  const t = useTime();
  const d: [string, string, string] = ['', '', ''];
  for (const p of petalsAt(t)) d[p.tone] += petalD(p);
  return (
    <Tier tier="environment">
      <path d={d[0]} fill={PET_TONES[0]} />
      <path d={d[1]} fill={PET_TONES[1]} />
      <path d={d[2]} fill={PET_TONES[2]} />
    </Tier>
  );
};

