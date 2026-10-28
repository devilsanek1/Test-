// lib/particles.tsx: A FEW NATURAL PARTICLES, an ENGINE primitive (owner, v2 G4, 2026-10-27: "add perhaps a bit of
// particles here and there just to make things a bit more natural looking"; the playbook's DEPTH AND SEPARATION).
// Motes in the light, dust or pollen in the sun-side air, a drifting leaf, glints in the sun's glitter path on water,
// far birds. The rules are docs/look/CRAFT.md §f.6 (it wins), DIRECTION rule 3 and LIFE_AND_DENSITY §6; the how-to is
// lib/DEPTH.md. Opt-in: nothing draws unless a scene places a <Particles> field.
//
// * SEEN AT PHONE SIZE (owner, on v4: "I don't see any changes in the particles anywhere"; CRAFT §f.6): a viewer
//   points at them in a 360 px wide frame without searching, and they stay calm. Leaves 26-40 px with a visible
//   flutter and turn, 2-3 in view across a hold; glints 20-36 px sparkles, L* +15..+25, 4-6 twinkling at once for
//   0.3-0.8 s; motes sized by distance: 6-10 px in the far air, 12-16 px near (plane < 0: `nearSize`; 2-4 of them
//   drifting slowly past the nearest shade are the ones a phone sees), L* +12..+20 over the shade behind them;
//   <= ~16 on screen.
// * FLAT SHAPES: a mote is a small disc, a glint a four-point sparkle flattened toward the water, a leaf one closed
//   almond or a five-lobed palmate leaf (`leaf`), a bird one thin closed V.
//   No blur, glow, gradient or opacity: a particle GROWS in and SHRINKS out (DIRECTION rule 8), is born inside its
//   region (clear of its edge), and shrinks where it drifts to the region's edge or an avoided zone (the caption band
//   by default, the subject's box), never a hard clip. A leaf is only born when its whole fall stays clear of every
//   avoided zone (it never shrinks away mid-air and comes back); a flock crossing a band narrower than the frame shrinks
//   at the band's ends.
// * TIER C by default (the environment: slow and calm, CRAFT §b), but SEEN: its contrast is set against `on`, the
//   colour right behind it (motes a light tint L* +12..+20, glints +15..+25, birds a tone darker within 15, leaves
//   their own colours within 30: LIFT_MAX), its colour takes its plane's air step (lib/depth `recede`), and its size
//   and speed scale with the plane (1.5x per plane: near ones 2-3x the far ones), except motes nearer than the subject
//   plane: they take their own on-screen `nearSize` and still drift slowly (unit speed). Tier B only when asked (a leaf
//   near the story): x1.25, contrast +5.
// * LIT BY THE SET'S RIG (lib/light <Lit>): light kinds are a step lighter on the sun side (`sun`, or the rig's key
//   direction), a tumbling leaf shows its shade face in the rig's form tint; under lightOff the lift goes, the field stays.
// * THE MOVER BUDGET (DIRECTION rule 3, CRAFT §b): few (each kind's cap: motes 10, dust 6, glints 6, leaves 3, a
//   flock of 5; <= ~16 on screen across a shot's fields), slots staggered so they take turns (or `births`: one leaf
//   per given time, placed on the hold), a hard coverage cap (0.2 % of the frame per field); ENTRANCES (a leaf growing
//   in, a flock flying into its band: `join: 'hold'`) never touch the 0.4 s around a join, while a steady field
//   (motes, dust, glints) keeps its pace through it (a freeze reads as a glitch: CRAFT §a). Motes and dust drift at
//   most speed + drift px/s (3-12 at plane 0: the curl flow is capped at unit speed). `particleProblems()` lints a
//   shot's fields (the caps, the contrast, the speeds, and the phone-size minimums).
// * DETERMINISTIC: every particle is a pure function of (scene time, seed): seeded births (lib/rng), a fixed period per
//   slot, closed-form paths (leaves, glints, birds) or a curl-noise drift re-integrated from the particle's birth at a
//   fixed 1/30 s step with a partial last step (motes, dust), so any frame rendered alone equals the same frame in
//   sequence (Remotion's parallel tabs). @remotion/noise with ONE noise seed for the module (its cache keeps 10 seeds;
//   each field offsets its coordinates by its own seed instead). Never Math.random, requestAnimationFrame or a clock.
//
//   <Lit rig={RIG}>
//     ...the set...
//     <Particles kind="motes" seed="S1/motes" region={{poly: SUN_AIR}} on={CM.brickDeep} t0={0.3} joins={[6.1]} />
//     <Particles kind="glints" seed="S1/glints" region={{poly: glitterPath({x: 196, yFar: 1112, yNear: 1212})}} on={CM.water} horizon={965} />
//     <Particles kind="leaves" seed="S1/leaf" region={{rect: [10, 60, 80, 120]}} floor={1880} colors={[CM.leafGold, CM.leafRust]} joins={[6.1]} />
//     <Particles kind="birds" seed="S1/birds" region={{rect: [0, 640, 1080, 90]}} on={CM.bandGold} atm={ATM} joins={[6.1]} />
//   </Lit>

import React from 'react';
import {noise3D} from '@remotion/noise';
import {Fill} from './Fill';
import {ellipseD, fromLch, lch, multiply, relit, useLightOff, useRig, type Ellipse} from './light';
import {rand} from './rng';
import {useTime} from './time';
import {isHex, recede, type Atmosphere} from './depth';
import type {Pt} from './sketch';

// ================================================================= types and presets

export type ParticleKind = 'motes' | 'dust' | 'leaves' | 'glints' | 'birds';
/** [x, y, w, h], canvas px at camera rest. */
export type Rect = [number, number, number, number];
/** Where a field lives (motes: the light shape; glints: the glitter path; leaves: their source crown; birds: their
 *  flight band). Canvas px, in the same camera group as the set. */
export type Region = {rect: Rect} | {ellipse: Ellipse} | {poly: Pt[]};

export type Preset = {
  /** Alive at once by default, and the hard cap. */
  count: number;
  cap: number;
  /** One life (s) and the gap before the slot's next life (s); each slot keeps its own values. */
  life: [number, number];
  gap: [number, number];
  /** Size at plane 0, px at 1080: a mote's or dust's diameter, a leaf's length, a glint's dash length, a bird's span. */
  size: [number, number];
  /** px/s at plane 0: the curl drift (motes, dust), the fall (leaves), the flight (birds); glints stay put. */
  speed: [number, number];
  /** A constant drift, px/s (a slow rise, the wind). */
  drift: Pt;
  /** Contrast against `on`, L*: a light tint (+) or a tone darker (-). */
  lift: number;
  /** Grow in and shrink out, as shares of a life (never an opacity fade). */
  grow: number;
  shrink: number;
  /** 'keep': a steady field keeps its pace through a join; 'hold': no entrance in the 0.4 s around a join. */
  join: 'keep' | 'hold';
  /** The plane it lives on by default (sizes and speeds scale 1.5x per plane). */
  plane: number;
  /** Motes and dust nearer than the subject plane (plane < 0): their own ON-SCREEN size (CRAFT §f.6: motes sized by
   *  distance), replacing the plane scale; their speed and drift stay as given (unit factor: near motes still drift
   *  slowly). A field's `size` override is then on-screen px too. */
  nearSize?: [number, number];
};

/** The numbers of CRAFT §f.6, SEEN at phone size (owner on v4, 2026-10-28; v4's 13 px leaves, 14-24 px glints and 3-4 px
 *  motes were invisible): motes sized by distance: 6-10 px in the far air, 12-16 px near (plane < 0: `nearSize`; 2-4
 *  drifting past the nearest shade, the ones a phone sees; v5's 8-10 px motes alone read as specks), L* +15 (13 / 15 /
 *  17 in the three light steps), 6-10 in all, at 3-12 px/s; dust 5-8 px (same reason); leaves 26-40 px falling
 *  50-90 px/s with a wide flutter and a visible turn, 2 in view (cap 3); glints 20-36 px sparkles, L* +20 (18 / 20 /
 *  22), 4-6 twinkling at once for 0.3-0.8 s each (grow in over 30 % of the life, shrink out over 40 %); far birds
 *  small and pale (unchanged: a flock reads by its motion). research/2026-10-27_effects_libraries.md §6. */
export const PRESETS: Record<ParticleKind, Preset> = {
  motes: {count: 8, cap: 10, life: [3, 5], gap: [0, 0.4], size: [6, 10], speed: [3, 8], drift: [0, -2.5], lift: 15, grow: 0.15, shrink: 0.25, join: 'keep', plane: 0, nearSize: [12, 16]},
  dust: {count: 5, cap: 6, life: [5, 8], gap: [0.2, 0.8], size: [5, 8], speed: [2, 6], drift: [4, 2], lift: 12, grow: 0.15, shrink: 0.25, join: 'keep', plane: 0},
  leaves: {count: 2, cap: 3, life: [5, 8], gap: [1, 3], size: [26, 40], speed: [50, 90], drift: [20, 0], lift: 0, grow: 0.05, shrink: 0.1, join: 'hold', plane: 0},
  glints: {count: 6, cap: 6, life: [0.3, 0.8], gap: [0.02, 0.15], size: [20, 36], speed: [0, 0], drift: [-3, 0], lift: 20, grow: 0.3, shrink: 0.4, join: 'keep', plane: 0},
  birds: {count: 3, cap: 5, life: [0, 0], gap: [4, 9], size: [18, 30], speed: [120, 180], drift: [0, 0], lift: -12, grow: 0, shrink: 0, join: 'hold', plane: 2},
};

/** The contrast limit per kind (|L*| against `on`, tier C; tier B +5): motes and glints are light tints that must be
 *  SEEN (CRAFT §f.6: motes +12..+20, glints +15..+25), leaves keep their own colours (within 30 of the ground they
 *  cross), birds stay a tone darker within 15. */
export const LIFT_MAX: Record<ParticleKind, number> = {motes: 20, dust: 15, leaves: 30, glints: 25, birds: 15};
/** The phone-size floor (CRAFT §f.6): the on-screen size (after the plane and tier scale, or a near field's own
 *  `nearSize`) a field's particles reach at full growth, by plane (motes sized by distance: `near` is the floor in front
 *  of the subject plane, plane < 0), and the light kinds' least contrast. Under it a viewer does not find them at
 *  360 px wide. */
export const SEEN_MIN = {
  size: {motes: 6, dust: 5, leaves: 26, glints: 20} as Partial<Record<ParticleKind, number>>,
  near: {motes: 12} as Partial<Record<ParticleKind, number>>,
  lift: {motes: 12, glints: 15} as Partial<Record<ParticleKind, number>>,
};
/** A kind's phone-size floor on a plane (on-screen px): the near one when the plane is in front of the subject's. */
export const seenSizeMin = (kind: ParticleKind, plane: number): number | undefined => (plane < 0 ? SEEN_MIN.near[kind] : undefined) ?? SEEN_MIN.size[kind];
/** The most particles alive at once across a shot's fields (CRAFT §f.6: a few, never a texture). */
export const ALIVE_MAX = 16;

/** The caption band (G5_BLOCKING §2 "Screen zones": x 95-945, y 290-600): every field avoids it by default. */
export const CAPTION_BAND: Rect = [95, 290, 850, 310];
/** A field's hard coverage cap: its particles together never cover more than this share of the 1080 x 1920 frame. */
export const COVER_CAP = 0.002;
const FRAME_W = 1080;
const FRAME_AREA = FRAME_W * 1920;
/** The join window: no entrance within this of a join (CRAFT §a: 0.4 s around it). */
const JOIN_HALF = 0.2;

export type ParticlesProps = {
  kind: ParticleKind;
  /** One seed per field (its births and its noise offset). */
  seed: string;
  region: Region;
  /** The colour right behind the field: its contrast is set against it (motes read against shade, never the sky). */
  on: string;
  /** Alive at once (clamped to the kind's cap). */
  count?: number;
  /** Depth plane (lib/depth): sizes and speeds x 1.5^-plane (motes nearer than the subject, plane < 0, take the
   *  preset's on-screen `nearSize` at unit speed instead); with `atm`, the colour takes the plane's air step. */
  plane?: number;
  atm?: Atmosphere;
  /** 'environment' (C, the default) or 'support' (B: only when the field is near the story). */
  tier?: 'environment' | 'support';
  /** Scene-local join times: no entrance (a leaf, a flock) within 0.2 s of any. */
  joins?: number[];
  /** Zones the particles shrink out of (default: the caption band); add the subject's box. */
  avoid?: Rect[];
  /** The soft edge, px: a particle shrinks to nothing over this distance at its region's edge and an avoided zone. */
  margin?: number;
  /** No births before t0 or after t1 (scene s): a field that starts after the frame-0 flood fills in gently. */
  t0?: number;
  t1?: number;
  /** Entrances (leaves): one particle per given birth time (scene s) instead of the periodic slots, so 2-3 leaves are
   *  placed across a hold (CRAFT §f.6). Each still keeps inside [t0, t1] and out of a join's window; capped by the
   *  kind's cap. A leaf born off-frame enters later than its birth: keep its entry clear of the join's window too. */
  births?: number[];
  /** The key's screen spot (the sun): light kinds are lighter near it. Default: the rig's key direction. */
  sun?: Pt;
  /** Leaves: their palette (one per leaf, seeded). Birds: their colour (default: `on` a tone darker). */
  colors?: string[];
  /** Leaves: the ground line they land on (they rest, then shrink out). Default: they fall out of the frame. */
  floor?: number;
  /** Leaves: their silhouette: 'almond' (default) or 'palmate' (a plane or maple leaf, five pointed lobes: it still
   *  reads as a leaf at phone size, where an almond reads as a seed). */
  leaf?: 'almond' | 'palmate';
  /** Glints: the shot's horizon (dashes shorten toward it: the water's perspective). */
  horizon?: number;
  /** Birds: crossing direction (1 = to the right). Default: seeded per flock. */
  dir?: 1 | -1;
  /** Overrides of the preset (still capped by the tier's limits). */
  size?: [number, number];
  speed?: [number, number];
  life?: [number, number];
  gap?: [number, number];
  drift?: Pt;
  lift?: number;
};

/** One particle at time t (what the field draws): centre, size (px, after every scale), rotation (deg), x-scale (a
 *  tumbling leaf's flip; a bird's heading), `lift` (a bird's wing lift as a share of its span; a glint's perspective
 *  factor), `tone` (-1 away from the light, 0, +1 the sun side), `color` (a leaf's pick from its palette). */
export type ParticleState = {x: number; y: number; size: number; rot: number; sx: number; lift: number; tone: number; color: number; id: string};

// ================================================================= small helpers

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (r: [number, number], u: number) => r[0] + (r[1] - r[0]) * u;
const r2 = (v: number) => Math.round(v * 100) / 100;

const regionBox = (r: Region): Rect => {
  if ('rect' in r) return r.rect;
  if ('ellipse' in r) return [r.ellipse.cx - r.ellipse.rx, r.ellipse.cy - r.ellipse.ry, 2 * r.ellipse.rx, 2 * r.ellipse.ry];
  const xs = r.poly.map((p) => p[0]);
  const ys = r.poly.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
};

const segDist = (p: Pt, a: Pt, b: Pt) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1e-9;
  const u = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2, 0, 1);
  return Math.hypot(p[0] - (a[0] + u * dx), p[1] - (a[1] + u * dy));
};

/** Signed distance to a region (negative inside), px. Ellipses approximate. */
export function regionSdf(r: Region, p: Pt): number {
  if ('rect' in r) {
    const [x, y, w, h] = r.rect;
    const dx = Math.max(x - p[0], 0, p[0] - (x + w));
    const dy = Math.max(y - p[1], 0, p[1] - (y + h));
    if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
    return -Math.min(p[0] - x, x + w - p[0], p[1] - y, y + h - p[1]);
  }
  if ('ellipse' in r) {
    const e = r.ellipse;
    const q = Math.hypot((p[0] - e.cx) / e.rx, (p[1] - e.cy) / e.ry);
    return (q - 1) * Math.min(e.rx, e.ry);
  }
  const P = r.poly;
  let inside = false;
  let d = Infinity;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i];
    const b = P[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1] || 1e-9) + a[0]) inside = !inside;
    d = Math.min(d, segDist(p, a, b));
  }
  return inside ? -d : d;
}

/** Distance from p to the outside of a rect (0 inside it). */
const rectOut = (r: Rect, p: Pt) => {
  const dx = Math.max(r[0] - p[0], 0, p[0] - (r[0] + r[2]));
  const dy = Math.max(r[1] - p[1], 0, p[1] - (r[1] + r[3]));
  return dx > 0 || dy > 0 ? Math.hypot(dx, dy) : 0;
};

/** A seeded point inside a region and clear of the avoided zones, at least `inset` px from both when it can be (so it
 *  is born near full size, never already shrinking at an edge: a narrow glitter column with the default 22 px margin
 *  drew a quarter of its glints under 5 px); rejection sampling in its box, then without the inset, then the box
 *  centre as the last resort. The same candidates in the same order: a pure function of (seed, key). */
function spawn(r: Region, seed: string, key: string, avoid: Rect[], inset = 0): Pt {
  const [x, y, w, h] = regionBox(r);
  for (const ins of inset > 0 ? [inset, 0] : [0]) {
    for (let k = 0; k < 24; k++) {
      const p: Pt = [x + w * rand(seed, `${key}x${k}`), y + h * rand(seed, `${key}y${k}`)];
      if (regionSdf(r, p) < -ins && avoid.every((a) => rectOut(a, p) > ins)) return p;
    }
  }
  return [x + w / 2, y + h / 2];
}
/** How far inside its region (and away from an avoided zone) a particle is born: 0.6 of the soft edge. */
const SPAWN_INSET = 0.6;

/** The sun's glitter path on water (where glints live, never all over the water): a column under the sun x from the
 *  water's far edge yFar to its near edge yNear, widening toward us (a low sun gives a narrow column: its width over
 *  its length is about the sine of the sun's elevation on the water itself). Half-widths in px. */
export function glitterPath(o: {x: number; yFar: number; yNear: number; wFar?: number; wNear?: number}): Pt[] {
  const a = o.wFar ?? 26;
  const b = o.wNear ?? a + (o.yNear - o.yFar) * 0.6;
  return [
    [o.x - a, o.yFar],
    [o.x + a, o.yFar],
    [o.x + b, o.yNear],
    [o.x - b, o.yNear],
  ];
}

// ================================================================= the noise (ONE seed for the module)

const NOISE = 'lib/particles';
/** Divergence-free drift (curl of a noise stream function): motes swirl, never clump or spread. Its speed is capped at
 *  1 (the raw curl peaks near 3: motes ran up to 28 px/s against CRAFT §f.6's 3-12), so a mote's speed never passes its
 *  preset `speed` (+ the constant drift); the direction field is unchanged. */
function curl(x: number, y: number, t: number, ox: number, oy: number): Pt {
  const s = 0.0045; // ~220 px features
  const X = x * s + ox;
  const Y = y * s + oy;
  const T = t * 0.12;
  const e = 0.02;
  const dy = (noise3D(NOISE, X, Y + e, T) - noise3D(NOISE, X, Y - e, T)) / (2 * e);
  const dx = (noise3D(NOISE, X + e, Y, T) - noise3D(NOISE, X - e, Y, T)) / (2 * e);
  const vx = dy * 0.6;
  const vy = -dx * 0.6;
  const m = Math.hypot(vx, vy);
  return m > 1 ? [vx / m, vy / m] : [vx, vy];
}
const DT = 1 / 30;

// ================================================================= the field, as a pure function of t

type Resolved = Required<Pick<ParticlesProps, 'kind' | 'seed' | 'region' | 'joins' | 'avoid' | 'margin'>> & {
  p: Preset;
  n: number;
  k: number; // the plane's size and speed factor (1 for a near field on its own on-screen `nearSize`)
  t0: number;
  t1: number;
  floor?: number;
  horizon?: number;
  dir?: 1 | -1;
  sun?: Pt;
  births?: number[];
  ox: number;
  oy: number;
  tierK: number;
};

function resolve(o: ParticlesProps): Resolved {
  const base = PRESETS[o.kind];
  const tierK = o.tier === 'support' ? 1.25 : 1;
  const plane = o.plane ?? base.plane;
  // motes sized by distance (CRAFT §f.6): nearer than the subject plane, a kind with a `nearSize` takes it (or the
  // field's `size`) as its on-screen size, at unit speed; everywhere else size and speed scale 1.5x per plane
  const near = plane < 0 && base.nearSize !== undefined;
  const p: Preset = {
    ...base,
    size: o.size ?? (near && base.nearSize ? base.nearSize : base.size),
    speed: o.speed ?? base.speed,
    life: o.life ?? base.life,
    gap: o.gap ?? base.gap,
    drift: o.drift ?? base.drift,
    lift: o.lift ?? base.lift,
  };
  return {
    kind: o.kind,
    seed: o.seed,
    region: o.region,
    joins: o.joins ?? [],
    avoid: o.avoid ?? [CAPTION_BAND],
    margin: o.margin ?? 22,
    p,
    n: o.births ? Math.min(o.births.length, base.cap) : clamp(Math.round(o.count ?? base.count), 0, base.cap),
    k: near ? 1 : Math.pow(1.5, -plane),
    t0: o.t0 ?? -Infinity,
    t1: o.t1 ?? Infinity,
    floor: o.floor,
    horizon: o.horizon,
    dir: o.dir,
    sun: o.sun,
    births: o.births,
    ox: rand(o.seed, 'ox') * 400,
    oy: rand(o.seed, 'oy') * 400,
    tierK,
  };
}

/** Slot i's current life at t: a fixed life L and period P = L + gap per slot, phases staggered so the slots take
 *  turns (or, with `births`, slot i's one life from births[i]); null in its gap, when its birth was outside [t0, t1],
 *  or (entrances) when its ENTRANCE touches a join's window: `enter` = [from, to] after the birth (default the grow-in,
 *  [0, grow x L]; a flock: until its last bird is in its band), so nothing is still growing or flying in during the
 *  0.4 s around a join (CRAFT §a). */
function slot(r: Resolved, i: number, t: number, lifeOverride?: number, enter?: [number, number]): {c: number; born: number; age: number; L: number} | null {
  const L = lifeOverride ?? lerp(r.p.life, rand(r.seed, `L${i}`));
  let c = 0;
  let born: number;
  if (r.births) {
    if (i >= r.births.length) return null;
    born = r.births[i];
  } else {
    const G = lerp(r.p.gap, rand(r.seed, `G${i}`));
    const P = Math.max(0.05, L + G);
    const phase = ((i + 0.25 + 0.5 * rand(r.seed, `ph${i}`)) / Math.max(1, r.n)) * P;
    c = Math.floor((t + phase) / P);
    born = c * P - phase;
  }
  const age = t - born;
  if (age < 0 || age > L || born < r.t0 || born > r.t1) return null;
  if (r.p.join === 'hold') {
    const e0 = born + (enter?.[0] ?? 0);
    const e1 = born + (enter?.[1] ?? r.p.grow * L);
    if (r.joins.some((j) => e1 >= j - JOIN_HALF && e0 <= j + JOIN_HALF)) return null;
  }
  return {c, born, age, L};
}

const lifeScale = (u: number, grow: number, shrink: number) => clamp(Math.min(grow > 0 ? u / grow : 1, shrink > 0 ? (1 - u) / shrink : 1), 0, 1);

/** The edge factor: 1 inside, shrinking to 0 across `margin` at the region's edge (if bounded) and at avoided zones. */
function edgeK(r: Resolved, p: Pt, bounded: boolean): number {
  let k = bounded ? clamp(-regionSdf(r.region, p) / r.margin, 0, 1) : 1;
  for (const a of r.avoid) k = Math.min(k, clamp(rectOut(a, p) / r.margin, 0, 1));
  return k;
}

/** Which side of the field the light comes from: +1 sun side, 0 middle, -1 away (3 flat steps, never a gradient). */
function sunSide(r: Resolved, p: Pt, keyFrom: number | null): number {
  if (r.sun) {
    const d = Math.hypot(p[0] - r.sun[0], p[1] - r.sun[1]);
    return d < 260 ? 1 : d < 620 ? 0 : -1;
  }
  if (keyFrom === null) return 0;
  const [x, y, w, h] = regionBox(r.region);
  const c: Pt = [x + w / 2, y + h / 2];
  const u: Pt = [Math.cos((keyFrom * Math.PI) / 180), Math.sin((keyFrom * Math.PI) / 180)];
  const s = ((p[0] - c[0]) * u[0] + (p[1] - c[1]) * u[1]) / Math.max(1, Math.hypot(w, h) / 2);
  return s > 0.33 ? 1 : s < -0.33 ? -1 : 0;
}

function drifters(r: Resolved, t: number, keyFrom: number | null): ParticleState[] {
  const out: ParticleState[] = [];
  for (let i = 0; i < r.n; i++) {
    const s = slot(r, i, t);
    if (!s) continue;
    let [x, y] = spawn(r.region, r.seed, `${i}/${s.c}/`, r.avoid, r.margin * SPAWN_INSET);
    const spd = lerp(r.p.speed, rand(r.seed, `v${i}/${s.c}`)) * r.k;
    const [wx, wy] = [r.p.drift[0] * r.k, r.p.drift[1] * r.k];
    // re-integrated from the birth at a fixed step, the last step partial: a pure function of the age
    for (let a = 0; a < s.age - 1e-9; ) {
      const h = Math.min(DT, s.age - a);
      const v = curl(x, y, s.born + a, r.ox, r.oy); // one flow for the whole field: the motes swirl together
      x += (v[0] * spd + wx) * h;
      y += (v[1] * spd + wy) * h;
      a += h;
    }
    const u = s.age / s.L;
    const size = lerp(r.p.size, rand(r.seed, `s${i}/${s.c}`)) * r.k * r.tierK * lifeScale(u, r.p.grow, r.p.shrink) * edgeK(r, [x, y], true);
    if (size < 0.4) continue;
    out.push({x, y, size, rot: 0, sx: 1, lift: 0, tone: sunSide(r, [x, y], keyFrom), color: 0, id: `${i}/${s.c}`});
  }
  return out;
}

function glints(r: Resolved, t: number, keyFrom: number | null): ParticleState[] {
  const out: ParticleState[] = [];
  const box = regionBox(r.region);
  const yRef = box[1] + box[3];
  for (let i = 0; i < r.n; i++) {
    const s = slot(r, i, t);
    if (!s) continue;
    const [x0, y] = spawn(r.region, r.seed, `${i}/${s.c}/`, r.avoid, r.margin * SPAWN_INSET);
    const x = x0 + r.p.drift[0] * s.age;
    const persp = r.horizon !== undefined ? clamp((y - r.horizon) / Math.max(1, yRef - r.horizon), 0.25, 1.5) : 1;
    // the water's perspective FLATTENS a glint toward the horizon (its height x persp, drawn) and shortens it only a
    // little (x 0.78-1.15), so the far ones are still seen at phone size
    const size = lerp(r.p.size, rand(r.seed, `s${i}/${s.c}`)) * (0.7 + 0.3 * persp) * r.k * r.tierK * lifeScale(s.age / s.L, r.p.grow, r.p.shrink) * edgeK(r, [x, y], true);
    if (size < 1) continue;
    out.push({x, y, size, rot: 0, sx: 1, lift: persp, tone: sunSide(r, [x, y], keyFrom), color: 0, id: `${i}/${s.c}`});
  }
  return out;
}

/** One leaf's life: its fall speed, swing, period, phase, tumble and tilt (seeded per slot and cycle). The swing is
 *  wide enough to read at phone size (24-44 px at plane 0: CRAFT §f.6's "visible flutter"). */
type LeafLife = {v: number; A: number; w: number; ph: number; tumble: boolean; spin: number; r0: number};
function leafLife(r: Resolved, i: number, c: number): LeafLife {
  const key = `${i}/${c}`;
  return {
    v: lerp(r.p.speed, rand(r.seed, `v${key}`)) * r.k,
    A: (24 + 20 * rand(r.seed, `A${key}`)) * r.k,
    w: (Math.PI * 2) / (1.6 + 0.8 * rand(r.seed, `T${key}`)),
    ph: rand(r.seed, `ph${key}`) * Math.PI * 2,
    tumble: rand(r.seed, `tb${key}`) < 0.5,
    spin: 2.5 + 2 * rand(r.seed, `sp${key}`),
    r0: (rand(r.seed, `r0${key}`) - 0.5) * 40,
  };
}

/** A falling leaf's path (closed form): a side-to-side swing whose tilt leads the sway by a quarter period, falling
 *  slowest at the turns (the flutter of a falling plate). Half of them tumble (an x-flip: the shade face shows); the
 *  rest TURN visibly, their width narrowing to a quarter at each end of the swing (CRAFT §f.6: "a visible turn"). */
function leafAt(r: Resolved, q: LeafLife, age: number, x0: number, y0: number) {
  const th = q.w * age + q.ph;
  // y' = v (1 - 0.6 sin^2 th)  ->  y = v (age - 0.6 (age / 2 - (sin 2th - sin 2ph) / (4 w)))
  const y = y0 + q.v * (age - 0.6 * (age / 2 - (Math.sin(2 * th) - Math.sin(2 * q.ph)) / (4 * q.w)));
  const x = x0 + r.p.drift[0] * r.k * age + q.A * (Math.sin(th) - Math.sin(q.ph));
  const sx = q.tumble ? Math.cos(q.spin * age + q.ph) : 0.62 + 0.38 * Math.cos(th);
  const rot = 40 * Math.cos(th) + q.r0;
  return {x, y, sx, rot};
}

/** The age a leaf lands on the floor (y grows with the age: bisection), or Infinity when it does not within its life. */
function leafLanding(r: Resolved, q: LeafLife, L: number, x0: number, y0: number): number {
  if (r.floor === undefined || leafAt(r, q, L, x0, y0).y < r.floor) return Infinity;
  let lo = 0;
  let hi = L;
  for (let k = 0; k < 22; k++) {
    const m = (lo + hi) / 2;
    if (leafAt(r, q, m, x0, y0).y < r.floor) lo = m;
    else hi = m;
  }
  return hi;
}

/** Where a leaf starts, and until when its fall stays clear: the first seeded point in its source region whose WHOLE
 *  fall (to the floor, or to the end of its life) stays `margin` clear of every avoided zone (sampled every 0.04 s);
 *  when none does, the one that stays clear longest, `until` = the age it would first come within `margin` of one.
 *  The leaf shrinks out over the 0.45 s before `until` and never comes back: it never shrinks away at the caption
 *  band mid-air and grows again below it (`particleProblems` reports such a field). */
function leafStart(r: Resolved, q: LeafLife, key: string, L: number): {p: Pt; until: number} {
  const [x, y, w, h] = regionBox(r.region);
  const firstHit = (p: Pt) => {
    const end = Math.min(L, leafLanding(r, q, L, p[0], p[1]));
    for (let a = 0; a <= end + 1e-9; a += 0.04) {
      const s = leafAt(r, q, Math.min(a, end), p[0], p[1]);
      if (r.avoid.some((z) => rectOut(z, [s.x, s.y]) < r.margin)) return a;
    }
    return Infinity;
  };
  let best: {p: Pt; until: number} | null = null;
  for (let k = 0; k < 24; k++) {
    const p: Pt = [x + w * rand(r.seed, `${key}x${k}`), y + h * rand(r.seed, `${key}y${k}`)];
    if (regionSdf(r.region, p) >= 0) continue;
    const until = firstHit(p);
    if (until === Infinity) return {p, until};
    if (!best || until > best.until) best = {p, until};
  }
  if (best) return best;
  const c: Pt = [x + w / 2, y + h / 2];
  return {p: c, until: firstHit(c)};
}
/** A leaf that would reach an avoided zone shrinks out over this long before it would (s). */
const LEAF_AWAY = 0.45;

function leaves(r: Resolved, t: number): ParticleState[] {
  const out: ParticleState[] = [];
  for (let i = 0; i < r.n; i++) {
    const s = slot(r, i, t);
    if (!s) continue;
    const q = leafLife(r, i, s.c);
    const {p: start, until} = leafStart(r, q, `${i}/${s.c}/`, s.L);
    if (s.age >= until) continue; // gone before it reached an avoided zone, for the rest of its life
    const [x0, y0] = start;
    // landing: then it rests 0.7 s and shrinks out over the last 0.45 s of the rest; a leaf that never lands shrinks
    // out at the end of its life
    const REST = 0.7;
    const land = leafLanding(r, q, s.L, x0, y0);
    if (s.age > land + REST) continue;
    const landed = s.age >= land;
    const qq = leafAt(r, q, landed ? land : s.age, x0, y0);
    const y = landed ? Math.min(qq.y, r.floor ?? qq.y) : qq.y;
    const kLife = landed ? clamp((land + REST - s.age) / 0.45, 0, 1) : lifeScale(s.age / s.L, r.p.grow, land < Infinity ? 0 : r.p.shrink);
    const kAway = until === Infinity ? 1 : clamp((until - s.age) / LEAF_AWAY, 0, 1);
    const size = lerp(r.p.size, rand(r.seed, `s${i}/${s.c}`)) * r.k * r.tierK * kLife * kAway * edgeK(r, [qq.x, y], false);
    if (size < 1) continue;
    const pick = Math.floor(rand(r.seed, `col${i}/${s.c}`) * 1000);
    out.push({x: qq.x, y, size, rot: landed ? qq.rot * 0.3 : qq.rot, sx: landed ? 1 : qq.sx, lift: 0, tone: 0, color: pick, id: `${i}/${s.c}`});
  }
  return out;
}

function birds(r: Resolved, t: number): ParticleState[] {
  const out: ParticleState[] = [];
  const [bx, by, bw, bh] = regionBox(r.region);
  // ONE flock slot: its life is the crossing time of the WHOLE flock (the last bird 1.4 spans per rank behind the lead
  // clears the band too: it never vanishes half in view), so its period depends on its own speed; its entrance runs
  // from the birth (3 spans before the band) until the last bird is in, and never touches a join's window
  const v = lerp(r.p.speed, rand(r.seed, 'v')) * r.k;
  const span = lerp(r.p.size, rand(r.seed, 'span')) * r.k * r.tierK;
  const tail = Math.ceil((r.n - 1) / 2) * 1.4 * span;
  const L = (bw + 6 * span + 2 * tail) / Math.max(1, v);
  const flock: Resolved = {...r, n: 1};
  const s = slot(flock, 0, t, L, [0, (4 * span + tail) / Math.max(1, v)]);
  if (!s) return out;
  // a band narrower than the frame: the birds shrink at its ends (inside the frame), never pop
  const bandK = (x: number) => Math.min(bx > 0 ? clamp((x - bx) / r.margin, 0, 1) : 1, bx + bw < FRAME_W ? clamp((bx + bw - x) / r.margin, 0, 1) : 1);
  const dir: 1 | -1 = r.dir ?? (rand(r.seed, `dir${s.c}`) < 0.5 ? 1 : -1);
  const yBase = by + bh * (0.2 + 0.6 * rand(r.seed, `y${s.c}`));
  const xLead = dir > 0 ? bx - 3 * span + v * s.age : bx + bw + 3 * span - v * s.age;
  const n = r.n;
  for (let j = 0; j < n; j++) {
    const back = Math.ceil(j / 2);
    const side = j === 0 ? 0 : j % 2 ? 1 : -1;
    const wob = noise3D(NOISE, j * 7.3 + r.ox, s.c * 3.1, (s.born + s.age) * 0.4);
    const x = xLead - dir * back * span * (1.1 + 0.3 * rand(r.seed, `bx${j}`));
    const y = yBase + side * back * span * 0.45 + wob * span * 0.35;
    // flap 3-4 Hz in bursts, then glide with the wings a little up
    const f = 3 + rand(r.seed, `f${j}`);
    const cyc = 1.8 + 0.8 * rand(r.seed, `cy${j}`);
    const tt = s.born + s.age + rand(r.seed, `fp${j}`) * cyc;
    const inCyc = tt - Math.floor(tt / cyc) * cyc;
    const lift = inCyc < cyc * 0.55 ? 0.32 * Math.sin(Math.PI * 2 * f * tt) : 0.14;
    const size = span * (0.85 + 0.3 * rand(r.seed, `bs${j}`)) * edgeK(r, [x, y], false) * bandK(x);
    if (size < 1.5) continue;
    out.push({x, y, size, rot: 0, sx: dir, lift, tone: 0, color: 0, id: `${j}/${s.c}`});
  }
  return out;
}

/** The field's particles at scene time t (pure: the same t gives the same particles in any order). `keyFrom` = the
 *  screen direction the key light comes from (deg), or null. Capped: count by the kind's cap, coverage by COVER_CAP. */
export function particlesAt(t: number, props: ParticlesProps, keyFrom: number | null = null): ParticleState[] {
  const r = resolve(props);
  if (r.n <= 0) return [];
  const ps = r.kind === 'motes' || r.kind === 'dust' ? drifters(r, t, keyFrom) : r.kind === 'glints' ? glints(r, t, keyFrom) : r.kind === 'leaves' ? leaves(r, t) : birds(r, t);
  // the hard coverage cap (never reached by the presets: a safety, applied to every size alike)
  const area = ps.reduce((s, p) => s + areaOf(r.kind, p.size), 0);
  const cap = COVER_CAP * FRAME_AREA;
  if (area > cap) {
    const k = Math.sqrt(cap / area);
    for (const p of ps) p.size *= k;
  }
  return ps;
}

const areaOf = (kind: ParticleKind, size: number) => (kind === 'motes' || kind === 'dust' ? (Math.PI * size * size) / 4 : kind === 'glints' ? size * size * 0.1 : kind === 'leaves' ? size * size * 0.3 : size * 1.6);

// ================================================================= drawing (flat closed paths)

const P2 = (x: number, y: number) => `${r2(x)} ${r2(y)}`;
/** A glint: a four-point sparkle, its level arms long and its upright arms short (flattened toward the water), the
 *  sides gently concave round a solid core, so it reads at 360 px wide (a 30 px glint is a ~10 x 3 px twinkle). */
const sparkle = (x: number, y: number, len: number, ht: number) => {
  const a = len / 2;
  const b = Math.max(ht, 2.4) / 2;
  const c = Math.min(a, b) * 0.62;
  return `M${P2(x + a, y)}Q${P2(x + c, y - c)} ${P2(x, y - b)}Q${P2(x - c, y - c)} ${P2(x - a, y)}Q${P2(x - c, y + c)} ${P2(x, y + b)}Q${P2(x + c, y + c)} ${P2(x + a, y)}Z`;
};
const xf = (x: number, y: number, rot: number, sx: number) => {
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  return (px: number, py: number): string => P2(x + px * sx * c - py * s, y + px * sx * s + py * c);
};
const leafD = (p: ParticleState) => {
  const L = p.size / 2;
  const W = p.size * 0.23;
  const T = xf(p.x, p.y, p.rot, Math.abs(p.sx) < 0.08 ? 0.08 * Math.sign(p.sx || 1) : p.sx);
  return `M${T(-L, 0)}C${T(-L * 0.45, -W * 1.3)} ${T(L * 0.4, -W * 1.2)} ${T(L, 0)}C${T(L * 0.4, W * 1.2)} ${T(-L * 0.45, W * 1.3)} ${T(-L, 0)}Z`;
};
/** A palmate leaf (a plane or maple leaf): five pointed lobes round a centre a third of the way up from the stem, its
 *  axis along the particle's x (the stem at -size/2, the top lobe's tip at +size/2), turned and flipped like the almond. */
const PALM: [number, number][] = [
  [-1.75, 0.42],
  [-0.95, 0.82],
  [0, 1],
  [0.95, 0.82],
  [1.75, 0.42],
];
const palmD = (p: ParticleState) => {
  const R = p.size / 1.32;
  const T = xf(p.x, p.y, p.rot, Math.abs(p.sx) < 0.08 ? 0.08 * Math.sign(p.sx || 1) : p.sx);
  const x0 = -p.size / 2;
  const cx = x0 + 0.32 * R;
  const at = (a: number, L: number) => T(cx + Math.cos(a) * R * L, Math.sin(a) * R * L);
  const pts: string[] = [T(x0, 0)];
  PALM.forEach(([a, L], i) => {
    if (i > 0) pts.push(at((PALM[i - 1][0] + a) / 2, 0.44));
    pts.push(at(a - 0.2, L * 0.72), at(a, L), at(a + 0.2, L * 0.72));
  });
  return `M${pts.join('L')}Z`;
};
const birdD = (p: ParticleState) => {
  const s = p.size / 2; // half span
  const th = Math.max(0.9, p.size * 0.075); // the arm's thickness (a hairline: 1.2-1.6 px at the usual sizes)
  const lift = p.lift * p.size;
  const tip = s * 0.92;
  const d = p.sx; // heading (the V points where it flies: a slight forward lean)
  const lean = 0.12 * s * d;
  return `M${P2(p.x - tip + lean, p.y - lift)}L${P2(p.x + lean * 0.2, p.y)}L${P2(p.x + tip + lean, p.y - lift)}L${P2(p.x + tip + lean, p.y - lift + th)}L${P2(p.x + lean * 0.2, p.y + th * 1.2)}L${P2(p.x - tip + lean, p.y - lift + th)}Z`;
};

/** One field of particles (see the header). Place it in the set's camera group, after what it floats in front of, in
 *  the set's <Lit> (outside it the sun-side lift is off). */
export const Particles: React.FC<ParticlesProps> = (props) => {
  const t = useTime();
  const rig = useRig();
  const off = useLightOff();
  const keyFrom = !off && rig.key.kind === 'sun' ? (rig.key.toward + 180) % 360 : null;
  const ps = particlesAt(t, props, keyFrom);
  if (!ps.length) return null;
  const pal = palette(props, rig, off);
  return (
    <>
      {ps.map((p) => {
        let d: string;
        let color: string;
        if (props.kind === 'motes' || props.kind === 'dust') {
          d = ellipseD({cx: p.x, cy: p.y, rx: p.size / 2, ry: p.size / 2});
          color = pal.light[p.tone + 1];
        } else if (props.kind === 'glints') {
          d = sparkle(p.x, p.y, p.size, p.size * 0.34 * clamp(p.lift, 0.45, 1));
          color = pal.light[p.tone + 1];
        } else if (props.kind === 'leaves') {
          d = props.leaf === 'palmate' ? palmD(p) : leafD(p);
          const leaf = pal.leaves[p.color % pal.leaves.length];
          color = p.sx < 0 ? leaf.back : leaf.front;
        } else {
          d = birdD(p);
          color = pal.bird;
        }
        return <Fill key={p.id} d={d} color={color} offset={false} backdrop />;
      })}
    </>
  );
};

/** The field's flat colours: three light steps (away, middle, sun side) for the light kinds, each leaf's two faces, the
 *  birds' one tone. Contrast against `on` held inside the kind's limit (LIFT_MAX; tier B +5). Cached per field. */
const PAL = new Map<string, {light: string[]; leaves: {front: string; back: string}[]; bird: string}>();
function palette(o: ParticlesProps, rig: ReturnType<typeof useRig>, off: boolean) {
  const key = `${o.kind}|${o.on}|${o.lift ?? ''}|${o.plane ?? ''}|${o.atm?.name ?? ''}|${o.tier ?? ''}|${(o.colors ?? []).join(',')}|${rig.name}|${rig.tints.form}|${off ? 1 : 0}`;
  const hit = PAL.get(key);
  if (hit) return hit;
  const base = PRESETS[o.kind];
  const lift = o.lift ?? base.lift;
  const cap = LIFT_MAX[o.kind] + (o.tier === 'support' ? 5 : 0);
  const plane = o.plane ?? base.plane;
  const onL = isHex(o.on) ? lch(o.on).L : 80;
  const held = (c: string) => {
    if (!isHex(c)) return c;
    const q = lch(c);
    return Math.abs(q.L - onL) <= cap ? c : fromLch(onL + Math.sign(q.L - onL) * cap, q.C, q.h);
  };
  const air = (c: string) => (o.atm ? recede(c, plane, o.atm) : c);
  // three flat steps, 2 L* apart (motes +13 / +15 / +17, glints +18 / +20 / +22 on what is behind them: CRAFT §f.6's
  // +12..+20 and +15..+25)
  const light = [-2, 0, off ? 0 : 2].map((dl) => held(air(relit(o.on, Math.max(2, lift + dl), {warm: 20}))));
  const leafCols = o.colors && o.colors.length ? o.colors : ['#D6A563', '#B8714F'];
  const leaves = leafCols.map((c) => {
    const front = held(air(off ? c : relit(c, 3, {warm: 10})));
    const backTint = rig.tints.form;
    const back = held(air(backTint && backTint.toUpperCase() !== '#FFFFFF' ? multiply(c, backTint) : fromLch(Math.max(0, lch(c).L - 9), lch(c).C, lch(c).h)));
    return {front, back};
  });
  const birdBase = o.colors?.[0] ?? (isHex(o.on) ? fromLch(Math.max(0, onL - Math.abs(lift || 12)), lch(o.on).C * 0.9, lch(o.on).h) : '#7D6A70');
  const bird = held(air(birdBase));
  const v = {light, leaves, bird};
  if (PAL.size > 400) PAL.clear();
  PAL.set(key, v);
  return v;
}

// ================================================================= the lint

/** A shot's particle fields against the mover budget (DIRECTION rule 3, CRAFT §b, §f.6; empty = OK): counts within
 *  the caps (<= ~16 alive across the fields), entrances declared with the shot's joins and taking turns (<= ~0.6
 *  entries/s together), regions clear of the caption band, the contrast and speed limits, and SEEN at phone size (the
 *  sizes and the light kinds' contrast over SEEN_MIN). `joins` = the shot's scene-local join times. */
export function particleProblems(fields: ParticlesProps[], o: {joins?: number[]} = {}): string[] {
  const out: string[] = [];
  let entries = 0;
  let alive = 0;
  for (const f of fields) {
    const p = PRESETS[f.kind];
    const n = f.births ? f.births.length : f.count ?? p.count;
    if (n > p.cap) out.push(`${f.seed}: ${n} ${f.kind} asked, the cap is ${p.cap} (drawn: ${p.cap})`);
    alive += Math.min(n, p.cap);
    const lift = Math.abs(f.lift ?? p.lift);
    const liftMax = LIFT_MAX[f.kind] + (f.tier === 'support' ? 5 : 0);
    if (lift > liftMax) out.push(`${f.seed}: contrast ${lift} L* over the ${f.kind}' limit (${liftMax}: LIFT_MAX, tier B +5)`);
    const liftMin = SEEN_MIN.lift[f.kind];
    if (liftMin !== undefined && lift < liftMin) out.push(`${f.seed}: contrast ${lift} L*: under ${liftMin}, not seen at phone size (CRAFT §f.6)`);
    // SEEN at phone size: the smallest particle at full growth, on screen, sized exactly as the field draws it (resolve:
    // the plane and tier scale, or a near field's own `nearSize`), against its plane's floor (motes sized by distance)
    const rf = resolve(f);
    const plane = f.plane ?? p.plane;
    const sizeMin = seenSizeMin(f.kind, plane);
    const [s0, s1] = [rf.p.size[0] * rf.k * rf.tierK, rf.p.size[1] * rf.k * rf.tierK];
    if (sizeMin !== undefined && s0 < sizeMin - 1e-9)
      out.push(`${f.seed}: ${f.kind} ${s0.toFixed(0)}-${s1.toFixed(0)} px on screen: under the phone-size floor (${sizeMin} px${plane < 0 && SEEN_MIN.near[f.kind] !== undefined ? ' in front of the subject plane' : ''}, CRAFT §f.6: a viewer won't find them at 360 px wide)`);
    // the top speed on screen: the preset's (the curl flow is capped at unit speed) plus the constant drift, at the
    // field's own speed factor (resolve: a near field on its `nearSize` keeps unit speed)
    const k = rf.k;
    const drift = rf.p.drift;
    const sp = (rf.p.speed[1] + (f.kind === 'motes' || f.kind === 'dust' ? Math.hypot(drift[0], drift[1]) : 0)) * k;
    const spMax = f.kind === 'motes' || f.kind === 'dust' ? 12 : f.kind === 'leaves' ? 180 : f.kind === 'birds' ? 120 : 0;
    if (spMax > 0 && sp > spMax + 1e-9) out.push(`${f.seed}: ${f.kind} up to ${sp.toFixed(0)} px/s (slow life: <= ${spMax}; CRAFT §f.6)`);
    if (p.join === 'hold') {
      const life = f.kind === 'birds' ? 8 : ((f.life ?? p.life)[0] + (f.life ?? p.life)[1]) / 2;
      const gap = ((f.gap ?? p.gap)[0] + (f.gap ?? p.gap)[1]) / 2;
      if (f.births && f.births.length) {
        // given births: their average rate over the hold they cover; one that falls outside [t0, t1] or whose
        // grow-in touches a join's window never shows
        const b = [...f.births].sort((x, y) => x - y);
        entries += Math.min(b.length, p.cap) / Math.max(0.1, b[b.length - 1] - b[0] + life);
        const grow = p.grow * life;
        for (const t of b) {
          if (t < (f.t0 ?? -Infinity) || t > (f.t1 ?? Infinity)) out.push(`${f.seed}: the birth at ${t} s is outside [t0, t1]: it never shows`);
          else if ((f.joins ?? []).some((j) => t + grow >= j - JOIN_HALF && t <= j + JOIN_HALF)) out.push(`${f.seed}: the birth at ${t} s grows in inside a join's window: it never shows`);
        }
      } else entries += (f.kind === 'birds' ? 1 : Math.min(n, p.cap)) / Math.max(0.1, life + gap);
      if ((o.joins?.length ?? 0) > 0 && !(f.joins && f.joins.length)) out.push(`${f.seed}: ${f.kind} are entrances: pass the shot's joins (none may touch the 0.4 s around one)`);
    }
    const box = regionBox(f.region);
    const avoid = f.avoid ?? [CAPTION_BAND];
    const inBand = avoid.some((a) => box[0] < a[0] + a[2] && box[0] + box[2] > a[0] && box[1] < a[1] + a[3] && box[1] + box[3] > a[1]);
    if (inBand && f.kind !== 'leaves' && f.kind !== 'birds') out.push(`${f.seed}: its region overlaps an avoided zone (the caption band?): particles shrink there, so keep the region clear`);
    if (f.kind === 'birds' && (box[0] > 0 || box[0] + box[2] < FRAME_W))
      out.push(`${f.seed}: the flight band spans x ${box[0].toFixed(0)}-${(box[0] + box[2]).toFixed(0)}, not the frame: the flock shrinks in and out at its ends; give it the frame's width (x <= 0 to >= ${FRAME_W})`);
    if (f.kind === 'leaves' && n > 0) {
      // a leaf whose fall would reach an avoided zone shrinks out before it does: count the first lives that cannot
      // fall clear, and how soon after their birth they go
      const r = resolve(f);
      const cut: number[] = [];
      let tried = 0;
      for (let i = 0; i < r.n; i++)
        for (let c = 0; c < (r.births ? 1 : 6); c++) {
          tried++;
          const L = lerp(r.p.life, rand(r.seed, `L${i}`));
          const {until} = leafStart(r, leafLife(r, i, c), `${i}/${c}/`, L);
          if (until < Infinity) cut.push(until);
        }
      if (cut.length > 0)
        out.push(`${f.seed}: ${cut.length} of its first ${tried} leaves cannot fall clear of the avoided zones (the caption band, the subject's box) and shrink out ${Math.min(...cut).toFixed(1)}-${Math.max(...cut).toFixed(1)} s after their birth: fine past the shot's end; otherwise move the source, calm the drift, or narrow the margin`);
    }
  }
  if (entries > 0.6) out.push(`entrances ${entries.toFixed(2)}/s across the fields (supporting movers take turns: ~0.6/s)`);
  if (alive > ALIVE_MAX) out.push(`${alive} particles alive at once across the fields: a few, never a texture (<= ~${ALIVE_MAX}: CRAFT §f.6)`);
  return out;
}
