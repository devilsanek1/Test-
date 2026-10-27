// K4 cast: far crowds, batched. Figures under ~45 px are fill-only (no ink: far planes get none) and are merged into
// ONE path per colour per 240 px band, so 10 or 300 tiny people cost a handful of <Fill>s (the Look cascade and the
// un-build still travel band by band). Walkers drift and wrap; their two legs alternate at 12 drawings/s.
//
//   const spots = scatterCrowd({seed: 's5/lawn', n: 40, x0: 0, x1: 1080, yFar: 1180, yNear: 1300, hFar: 10, hNear: 22, walkers: 0.4});
//   <FarCrowd spots={spots} />
//   <FarCrowd spots={[{x: 120, y: 1100, h: 30, vx: -18, wrap: [-40, 1120]}]} />      // one far walker on a towpath

import React from 'react';
import {useTime} from '../../../lib/time';
import {rng} from '../../../lib/rng';
import {Fill} from '../../../lib/Fill';
import {COAT, HAIR, SKIN, TROUSERS} from './traits';
import {drawn} from './gait';
import {tieredAll} from '../tiers';

export type FarSpot = {
  /** Feet (canvas px) at t = 0. */
  x: number;
  y: number;
  /** Standing height (6-45 px). Seated: the seated height. */
  h: number;
  seed?: string;
  /** Walking speed (px/s, + = right); 0 / undefined = at rest. */
  vx?: number;
  /** Wrap range for a walker's x. */
  wrap?: [number, number];
  /** Seated (a head on a bump: steps, lawns, benches). */
  sit?: boolean;
  /** Pin colours. */
  coat?: string;
  hair?: string;
};

export type ScatterOpts = {
  seed: string;
  n: number;
  x0: number;
  x1: number;
  /** Feet y of the farthest and nearest rows. */
  yFar: number;
  yNear: number;
  /** Heights at yFar / yNear. */
  hFar: number;
  hNear: number;
  /** Fraction walking (the rest at rest: standing or sitting). */
  walkers?: number;
  /** Fraction of the resting ones seated. */
  sitters?: number;
  /** Walker speed range (px/s at hNear; scaled by depth). */
  speed?: [number, number];
};

/** Seeded crowd spots between two depth rows (heights scale with depth; about half at rest). */
export function scatterCrowd(o: ScatterOpts): FarSpot[] {
  const r = rng(`crowd/${o.seed}`);
  const out: FarSpot[] = [];
  const [s0, s1] = o.speed ?? [20, 34];
  for (let i = 0; i < o.n; i++) {
    const u = r.next();
    const y = o.yFar + (o.yNear - o.yFar) * u;
    const h = o.hFar + (o.hNear - o.hFar) * u;
    const x = o.x0 + (o.x1 - o.x0) * r.next();
    const walking = r.chance(o.walkers ?? 0.5);
    const k = h / Math.max(1, o.hNear);
    out.push({
      x,
      y,
      h: h * r.range(0.92, 1.06),
      seed: `${o.seed}/${i}`,
      vx: walking ? r.sign() * r.range(s0, s1) * k : 0,
      wrap: walking ? [o.x0 - 40, o.x1 + 40] : undefined,
      sit: !walking && r.chance(o.sitters ?? 0.35),
    });
  }
  return out.sort((a, b) => a.y - b.y);
}

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const disc = (cx: number, cy: number, r: number) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
const bar = (x: number, y0: number, y1: number, hw: number) => `M${f1(x - hw)} ${f1(y1)}L${f1(x - hw)} ${f1(y0 + hw)}Q${f1(x - hw)} ${f1(y0)} ${f1(x)} ${f1(y0)}Q${f1(x + hw)} ${f1(y0)} ${f1(x + hw)} ${f1(y0 + hw)}L${f1(x + hw)} ${f1(y1)}Z`;

export type FarCrowdProps = {
  spots: FarSpot[];
  /** Build: every band pops at `at` (+ a seeded stagger up to 0.2 s). */
  at?: number;
  /** Band width for batching (px). */
  band?: number;
};

/** A batched far crowd: one path per colour per band. Fill only. */
const FarCrowdBody: React.FC<FarCrowdProps> = ({spots, at, band = 240}) => {
  const t = useTime();
  const tq = drawn(t, 12);
  const groups = new Map<string, {d: string; color: string; bx: number}>();
  const add = (color: string, bx: number, d: string) => {
    const k = `${color}|${bx}`;
    const g = groups.get(k);
    if (g) g.d += d;
    else groups.set(k, {d, color, bx});
  };
  spots.forEach((s, i) => {
    const r = rng(`far/${s.seed ?? i}`);
    const coat = s.coat ?? r.pick(COAT);
    const hair = s.hair ?? r.pick(HAIR);
    const legs = r.pick(TROUSERS);
    const skin = r.pick(SKIN);
    let x = s.x;
    if (s.vx) {
      x = s.x + s.vx * t;
      if (s.wrap) {
        const [a, b] = s.wrap;
        const span = b - a;
        x = a + ((((x - a) % span) + span) % span);
      }
    }
    const h = s.h;
    const hr = h * 0.12;
    const bx = Math.floor(x / band);
    if (s.sit) {
      // seated: a bump of a torso and the head
      const top = s.y - h;
      add(coat, bx, bar(x, top + hr * 1.9, s.y, h * 0.2));
      add(hair, bx, disc(x, top + hr, hr));
      return;
    }
    const shoulder = s.y - h + hr * 2.05;
    const hem = s.y - h * 0.32;
    if (h >= 9) {
      // two legs; a walker's legs alternate at 12 drawings/s
      const ph = s.vx ? Math.floor(tq * 4 + (i % 2)) % 2 : 0;
      const lw = h * 0.05;
      const lift = h * 0.05;
      add(legs, bx, bar(x - h * 0.065, hem - lw, s.y - (ph === 0 ? 0 : lift), lw));
      add(legs, bx, bar(x + h * 0.065, hem - lw, s.y - (ph === 1 ? 0 : lift), lw));
      if (h >= 22) add(skin, bx, disc(x, shoulder - hr * 0.1, hr * 0.42));
    } else {
      add(legs, bx, bar(x, hem - h * 0.05, s.y, h * 0.09));
    }
    add(coat, bx, bar(x, shoulder, hem, h * 0.17));
    add(hair, bx, disc(x, s.y - h + hr, hr));
  });
  return (
    <>
      {[...groups.values()].map((g) => (
        <Fill key={`${g.color}${g.bx}`} d={g.d} color={g.color} offset={false} at={at === undefined ? undefined : at + (Math.abs(g.bx) % 5) * 0.04} seed={`far/${g.color}${g.bx}`} />
      ))}
    </>
  );
};
export const FarCrowd = tieredAll('environment', {}, FarCrowdBody);
