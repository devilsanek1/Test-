// lib/wind.ts: ONE gentle wind for all foliage (city-poster study 2026-10-28, `pro_3_nature.md` N7 and §5.4, STUDY.md
// §3 and §10 item 8). "In film, the motion decides": lockstep sway, wobbling outlines or puppet bends are what make
// nature cheap; a calm wind that passes THROUGH the set is the "real effect" a still cannot show.
//
// One field per set (Ghost of Tsushima's one wind, GDC 2021; Crysis's main + detail bending, GPU Gems 3 ch. 16):
//   * a direction, and a calm base sway whose phase TRAVELS across the set at `speed` px/s (the wind passing through:
//     neighbours never sway in lockstep);
//   * designed gusts (a G3 decision: none by default), each one front crossing the set: for its width / speed seconds
//     a point sways a little wider and leans downwind, then settles. A gust is ONE noticeable mover (rule 3), and never
//     arrives in the 0.4 s round a join (windProblems).
// Three responses, each a pure function of (t, position, seed), so every frame is deterministic and nothing boils:
//   crownDeg      main bending: a crown rotates about its base, ±0.5-1.0 deg at 0.12-0.25 Hz
//   clusterShift  detail bending: a leaf cluster shifts as a whole, ±1.5-3 px at 0.3-0.5 Hz, phased by its position
//   leafFlutter   a near leaf turns about its stalk (±2-4 deg) and shifts (±1-2 px) at 0.6-1.2 Hz
// Planes +3 and farther never sway (`planeSway`). The foliage's geometry is built ONCE (lib/foliage memoizes it): the
// wind only moves it by transforms, never rebuilds a path.
//
//   const WIND = makeWind({seed: 's1', dir: 0, gusts: [{t: 2.6}]});    // one per set, shared by every tree and spray
//   <Crown spec={PLANE} wind={WIND} />   <LeafSpray spec={SPRAY} wind={WIND} />
//   windProblems(WIND, [{name: 'plane', x: 160, y: 1100, plane: -1, kind: 'crown'}], {t0: 0, t1: 7})   // [] = OK
//
// Noise: @remotion/noise (seeded simplex, the project's pinned 4.0.538): deterministic and maintained, so we do not
// write our own (the libraries note: docs/studies/2026-10-28_city_posters/test/ENGINE_NATURE.md §2).

import {noise2D} from '@remotion/noise';
import {rand} from './rng';

export type Pt = [number, number];

/** A designed gust: its front crosses the reference point `WindSpec.at` at scene time `t`. */
export type Gust = {
  /** When the front's centre crosses the reference point (scene seconds). */
  t: number;
  /** 0..1 (default 0.6): at the peak a point sways up to x(1 + 0.35 s) wider and leans 0.3 s x its amplitude downwind. */
  strength?: number;
  /** The front's width along the wind (px, default 520): a point feels it for width / speed seconds. */
  width?: number;
};

export type WindSpec = {
  seed: string;
  /** Screen direction the wind blows TOWARD (deg: 0 right, 90 down, 180 left). Default 0 (v2 S1's light westerly). */
  dir?: number;
  /** How fast the sway's phase and the gusts travel across the set (canvas px/s at rest). Default 180. */
  speed?: number;
  /** Main bending: a crown's rotation about its base (deg, Hz). Default ±0.6 deg at 0.18 Hz. */
  crown?: {deg?: number; hz?: number};
  /** Detail bending: a cluster's shift (px, Hz). Default ±2 px at 0.4 Hz. */
  cluster?: {px?: number; hz?: number};
  /** Flutter: a near leaf's shift and turn about its stalk (px, deg, Hz). Default ±1.2 px, ±3 deg at 0.85 Hz. */
  leaf?: {px?: number; deg?: number; hz?: number};
  /** Designed gusts (default none: G3 times them). */
  gusts?: Gust[];
  /** The point gusts are timed at (canvas px). Default the frame's centre [540, 960]. */
  at?: Pt;
  /** Overall strength, multiplies every amplitude (default 1). */
  strength?: number;
  /** The film's join times: windProblems flags a gust that peaks or enters within 0.2 s of one. */
  joins?: number[];
};

export type Wind = {
  seed: string;
  dir: number;
  speed: number;
  crown: {deg: number; hz: number};
  cluster: {px: number; hz: number};
  leaf: {px: number; deg: number; hz: number};
  gusts: Required<Gust>[];
  at: Pt;
  strength: number;
  joins: number[];
  /** Unit vector the wind blows toward (screen). */
  u: Pt;
};

/** The calm defaults (pro_3_nature.md N7's ranges; est., tuned in the G4 look clip). */
export const WIND_DEFAULTS = {
  dir: 0,
  speed: 180,
  crown: {deg: 0.6, hz: 0.18},
  cluster: {px: 2, hz: 0.4},
  leaf: {px: 1.2, deg: 3, hz: 0.85},
  gust: {strength: 0.6, width: 520},
} as const;

/** N7's ranges, the bounds windProblems checks (crown amplitude, rate; cluster; leaf; hard caps incl. gusts). */
export const WIND_RANGES = {
  crownDeg: [0.5, 1.0],
  crownHz: [0.12, 0.25],
  clusterPx: [1.5, 3],
  clusterHz: [0.3, 0.5],
  leafPx: [0, 2],
  leafDeg: [0, 4],
  leafHz: [0.4, 1.2],
  speed: [60, 400],
  joinGap: 0.2,
} as const;

/** ONE wind per set (W1 names it with the light rig; G3 times its gusts). */
export function makeWind(s: WindSpec): Wind {
  const dir = s.dir ?? WIND_DEFAULTS.dir;
  const r = (dir * Math.PI) / 180;
  return {
    seed: s.seed,
    dir,
    speed: Math.max(1, s.speed ?? WIND_DEFAULTS.speed),
    crown: {deg: s.crown?.deg ?? WIND_DEFAULTS.crown.deg, hz: s.crown?.hz ?? WIND_DEFAULTS.crown.hz},
    cluster: {px: s.cluster?.px ?? WIND_DEFAULTS.cluster.px, hz: s.cluster?.hz ?? WIND_DEFAULTS.cluster.hz},
    leaf: {px: s.leaf?.px ?? WIND_DEFAULTS.leaf.px, deg: s.leaf?.deg ?? WIND_DEFAULTS.leaf.deg, hz: s.leaf?.hz ?? WIND_DEFAULTS.leaf.hz},
    gusts: (s.gusts ?? []).map((g) => ({t: g.t, strength: Math.max(0, Math.min(1, g.strength ?? WIND_DEFAULTS.gust.strength)), width: Math.max(40, g.width ?? WIND_DEFAULTS.gust.width)})),
    at: s.at ?? [540, 960],
    strength: s.strength ?? 1,
    joins: s.joins ?? [],
    u: [Math.cos(r), Math.sin(r)],
  };
}

/** A still wind (nothing sways): for locked frames, the cover, A/B stills. */
export const STILL_WIND: Wind = {...makeWind({seed: 'still'}), strength: 0};

/** How much a plane sways (lib/depth planes): the near world 1, the subject's plane 0.85, +1 0.6, +2 0.35, +3 and
 *  farther 0 (far planes never sway: N7). Fractional planes interpolate. */
export function planeSway(plane = 0): number {
  if (plane <= -1) return 1;
  if (plane >= 3) return 0;
  const P: [number, number][] = [[-1, 1], [0, 0.85], [1, 0.6], [2, 0.35], [3, 0]];
  for (let i = 0; i < P.length - 1; i++) {
    const [p0, k0] = P[i];
    const [p1, k1] = P[i + 1];
    if (plane <= p1) return k0 + ((k1 - k0) * (plane - p0)) / (p1 - p0);
  }
  return 0;
}

const TAU = Math.PI * 2;
const clampAbs = (v: number, m: number) => (v > m ? m : v < -m ? -m : v);
const along = (w: Wind, x: number, y: number) => x * w.u[0] + y * w.u[1];

/** The local time of the travelling sway at (x, y): a point downwind lags behind (the wind passes through the set). */
export const lagT = (w: Wind, t: number, x: number, y: number) => t - (along(w, x, y) - along(w, w.at[0], w.at[1])) / w.speed;

/** The gusts' strength at (x, y) at time t, 0..1: a raised-cosine front of `width` px travelling downwind. */
export function gustAt(w: Wind, t: number, x: number, y: number): number {
  if (!w.gusts.length) return 0;
  const a = along(w, x, y) - along(w, w.at[0], w.at[1]);
  let g = 0;
  for (const q of w.gusts) {
    const s = (a - w.speed * (t - q.t)) / (q.width / 2);
    if (s > -1 && s < 1) g += q.strength * 0.5 * (1 + Math.cos(Math.PI * s));
  }
  return Math.min(1, g);
}

/** When gust `q` peaks at (x, y) (scene s). */
export const gustPeakAt = (w: Wind, q: Required<Gust>, x: number, y: number) => q.t + (along(w, x, y) - along(w, w.at[0], w.at[1])) / w.speed;

/** Per-object constants from its seed: a phase and a small spread of the rate (no two trees in lockstep). */
function objectPhase(seed: string, key: string): {phase: number; rate: number; k: number} {
  return {phase: rand(seed, `${key}p`) * TAU, rate: 0.88 + rand(seed, `${key}r`) * 0.24, k: rand(seed, `${key}k`) * 97};
}

export type SwayAt = {x: number; y: number; plane?: number; seed?: string; i?: number};

/** MAIN BENDING: a crown's rotation about its base (deg, + = clockwise on screen), at time t. At rest (no gust) within
 *  ±crown.deg; a gust widens it and leans the crown downwind; hard cap 1.0 deg (N7). */
export function crownDeg(w: Wind, t: number, o: SwayAt): number {
  const pf = planeSway(o.plane ?? 0) * w.strength;
  if (!(pf > 0)) return 0;
  const {phase, rate, k} = objectPhase(o.seed ?? `${o.x}|${o.y}`, `c${o.i ?? 0}`);
  const tl = lagT(w, t, o.x, o.y);
  const f = w.crown.hz * rate;
  const base = 0.74 * Math.sin(TAU * f * tl + phase) + 0.26 * noise2D(w.seed, tl * f * 0.9, k);
  const g = gustAt(w, t, o.x, o.y);
  const lean = w.u[0] >= 0 ? 1 : -1; // a downwind bend: the top moves with the wind's horizontal part
  return clampAbs(w.crown.deg * pf * ((1 + 0.35 * g) * base + 0.3 * g * lean), 1.0);
}

/** DETAIL BENDING: a leaf cluster's shift as a whole (px), phased by its position; cap 3 px (N7). */
export function clusterShift(w: Wind, t: number, o: SwayAt): Pt {
  const pf = planeSway(o.plane ?? 0) * w.strength;
  if (!(pf > 0)) return [0, 0];
  const {phase, rate, k} = objectPhase(o.seed ?? `${o.x}|${o.y}`, `k${o.i ?? 0}`);
  const tl = lagT(w, t, o.x, o.y);
  const f = w.cluster.hz * rate;
  const u = 0.78 * Math.sin(TAU * f * tl + phase) + 0.22 * noise2D(w.seed, tl * f, k + 11.3);
  const v = 0.5 * noise2D(w.seed, tl * f * 0.8, k + 31.7);
  const g = gustAt(w, t, o.x, o.y);
  const amp = w.cluster.px * pf * (1 + 0.25 * g);
  const a = amp * u + 0.25 * g * w.cluster.px * pf;
  const b = amp * 0.45 * v;
  let dx = a * w.u[0] - b * w.u[1];
  let dy = a * w.u[1] + b * w.u[0];
  const m = Math.hypot(dx, dy);
  if (m > 3) {
    dx *= 3 / m;
    dy *= 3 / m;
  }
  return [dx, dy];
}

/** FLUTTER: a near leaf's turn about its stalk (deg) and shift (px); caps 4 deg, 2 px (N7). */
export function leafFlutter(w: Wind, t: number, o: SwayAt): {dx: number; dy: number; deg: number} {
  const pf = planeSway(o.plane ?? 0) * w.strength;
  if (!(pf > 0)) return {dx: 0, dy: 0, deg: 0};
  const {phase, rate, k} = objectPhase(o.seed ?? `${o.x}|${o.y}`, `l${o.i ?? 0}`);
  const tl = lagT(w, t, o.x, o.y);
  const f = w.leaf.hz * rate;
  const g = gustAt(w, t, o.x, o.y);
  const turn = 0.62 * Math.sin(TAU * f * tl + phase) + 0.38 * noise2D(w.seed, tl * f * 1.4, k + 53.9);
  const deg = clampAbs(w.leaf.deg * pf * (1 + 0.4 * g) * turn, 4);
  const s = 0.7 * Math.sin(TAU * f * 0.83 * tl + phase * 1.7) + 0.3 * noise2D(w.seed, tl * f, k + 77.1);
  const c = 0.5 * noise2D(w.seed, tl * f * 0.9, k + 91.3);
  const amp = w.leaf.px * pf * (1 + 0.3 * g);
  let dx = amp * (s * w.u[0] - c * w.u[1]);
  let dy = amp * (s * w.u[1] + c * w.u[0]);
  const m = Math.hypot(dx, dy);
  if (m > 2) {
    dx *= 2 / m;
    dy *= 2 / m;
  }
  return {dx, dy, deg};
}

/** A thing the wind moves, for windProblems (its position at rest, its plane, what kind of response it reads). */
export type WindThing = {name: string; x: number; y: number; plane?: number; kind: 'crown' | 'cluster' | 'leaf'; seed?: string};

/** The wind's checks (empty = OK): N7's ranges on the spec; the sampled maxima per thing over [t0, t1] (crown <= 1.0
 *  deg, cluster <= 3 px, leaf <= 2 px and 4 deg); far planes (+3 and farther) still; no gust peaking at a thing or
 *  entering the frame within 0.2 s of a join; at most one gust on screen at a time (one noticeable mover, rule 3). */
export function windProblems(w: Wind, things: WindThing[] = [], o: {t0?: number; t1?: number; fps?: number; frame?: [number, number]} = {}): string[] {
  const out: string[] = [];
  const R = WIND_RANGES;
  const inR = (v: number, r: readonly [number, number]) => v >= r[0] - 1e-9 && v <= r[1] + 1e-9;
  if (!inR(w.crown.deg, R.crownDeg)) out.push(`crown sway ±${w.crown.deg} deg (N7: ${R.crownDeg[0]}-${R.crownDeg[1]})`);
  if (!inR(w.crown.hz, R.crownHz)) out.push(`crown sway ${w.crown.hz} Hz (N7: ${R.crownHz[0]}-${R.crownHz[1]})`);
  if (!inR(w.cluster.px, R.clusterPx)) out.push(`cluster sway ±${w.cluster.px} px (N7: ${R.clusterPx[0]}-${R.clusterPx[1]})`);
  if (!inR(w.cluster.hz, R.clusterHz)) out.push(`cluster sway ${w.cluster.hz} Hz (N7: ${R.clusterHz[0]}-${R.clusterHz[1]})`);
  if (!inR(w.leaf.px, R.leafPx)) out.push(`leaf flutter ±${w.leaf.px} px (N7: <= ${R.leafPx[1]})`);
  if (!inR(w.leaf.deg, R.leafDeg)) out.push(`leaf flutter ±${w.leaf.deg} deg (<= ${R.leafDeg[1]})`);
  if (!inR(w.leaf.hz, R.leafHz)) out.push(`leaf flutter ${w.leaf.hz} Hz (calm: ${R.leafHz[0]}-${R.leafHz[1]})`);
  if (!inR(w.speed, R.speed)) out.push(`the wind travels ${w.speed} px/s (${R.speed[0]}-${R.speed[1]}: a breeze crossing the set in 3-18 s)`);
  const t0 = o.t0 ?? 0;
  const t1 = o.t1 ?? 7;
  const fps = o.fps ?? 60;
  for (const th of things) {
    let mx = 0;
    for (let f = Math.floor(t0 * fps); f <= Math.ceil(t1 * fps); f++) {
      const t = f / fps;
      const at = {x: th.x, y: th.y, plane: th.plane, seed: th.seed};
      const v = th.kind === 'crown' ? Math.abs(crownDeg(w, t, at)) : th.kind === 'cluster' ? Math.hypot(...clusterShift(w, t, at)) : Math.hypot(leafFlutter(w, t, at).dx, leafFlutter(w, t, at).dy);
      mx = Math.max(mx, v);
    }
    const cap = th.kind === 'crown' ? 1.0 : th.kind === 'cluster' ? 3 : 2;
    if (mx > cap + 1e-6) out.push(`${th.name}: ${th.kind} sway peaks at ${mx.toFixed(2)} ${th.kind === 'crown' ? 'deg' : 'px'} (cap ${cap})`);
    if ((th.plane ?? 0) >= 3 && mx > 0) out.push(`${th.name}: plane ${th.plane} sways (far planes never sway)`);
  }
  const [fw, fh] = o.frame ?? [1080, 1920];
  for (const [gi, q] of w.gusts.entries()) {
    const corners: Pt[] = [[0, 0], [fw, 0], [0, fh], [fw, fh]];
    const ent = Math.min(...corners.map((c) => gustPeakAt(w, q, c[0], c[1]))) - q.width / 2 / w.speed;
    for (const j of w.joins) {
      if (Math.abs(ent - j) < R.joinGap) out.push(`gust ${gi} (t ${q.t}) enters the frame at ${ent.toFixed(2)} s, within ${R.joinGap} s of the join at ${j}`);
      for (const th of things) {
        const pk = gustPeakAt(w, q, th.x, th.y);
        if (Math.abs(pk - j) < R.joinGap) out.push(`gust ${gi} peaks at ${th.name} at ${pk.toFixed(2)} s, within ${R.joinGap} s of the join at ${j}`);
      }
    }
    for (const [gj, p] of w.gusts.entries()) {
      if (gj <= gi) continue;
      // the frame's extent along the wind, plus both fronts: how long one gust is on screen
      const span = (Math.abs(fw * w.u[0]) + Math.abs(fh * w.u[1]) + (q.width + p.width) / 2) / w.speed;
      if (Math.abs(p.t - q.t) < span) out.push(`gusts ${gi} and ${gj} (t ${q.t}, ${p.t}) are on screen together (one noticeable mover at a time)`);
    }
  }
  return out;
}
