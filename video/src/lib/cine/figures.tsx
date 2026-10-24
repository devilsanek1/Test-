// cine/figures.tsx — tiny back-view people for the far distance (6-30 px tall), fill-only like the reference's
// far crowd (style bible 6, tier D/C): round head (= hair colour), tombstone torso, two leg blocks. Batched by
// colour, so a few hundred cost a handful of paths. They pop up (spring from the feet), idle-bob, and walkers
// stroll with a step bob — tiny constant life that keeps a wide shot busy (>= 5 events/s).
//
//   <TinyCrowd n={80} area={[120, 1250, 960, 1420]} horizon={1010} k={0.07} at={0.5} span={2} walk={0.25} tod="golden" />
//   <TinyFigure x={540} y={1300} h={22} coat={palette.teal} hair={palette.ink} />

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {springAt, springs, useTime} from '../time';
import {rng, Seed} from '../rng';
import {atmos, Tod, TodPalette} from './atmosphere';
import {PathBuf, r1} from './util';

const COATS = [palette.teal, palette.sage, palette.tan, palette.sand, palette.cream, palette.brown, palette.tealDark, palette.peach] as const;
const HAIR = [palette.ink, palette.brown, palette.tan, palette.tealDark, palette.ink, palette.sand] as const;
const LEGS = [palette.tealDark, palette.teal, palette.brown, palette.ink] as const;

/** Add one tiny back-view figure (feet at x,y, height h) to three path buffers. */
export function tinyFigure(head: PathBuf, body: PathBuf, legs: PathBuf, x: number, y: number, h: number, sy = 1) {
  const hh = h * sy;
  const hr = h * 0.11;
  const tw = h * 0.33;
  const th = hh * 0.4;
  const lh = hh * 0.38;
  const lw = h * 0.115;
  const g = h * 0.035;
  const top = y - lh - th;
  // legs
  legs.rect(x - g - lw, y - lh - 0.5, lw, lh + 0.5);
  legs.rect(x + g, y - lh - 0.5, lw, lh + 0.5);
  // tombstone torso (rounded shoulders)
  const rr = Math.min(tw * 0.42, th * 0.6);
  const L = x - tw / 2;
  const R = x + tw / 2;
  const B = y - lh + 0.6;
  body.raw(
    `M${r1(L)} ${r1(B)}L${r1(L)} ${r1(top + rr)}Q${r1(L)} ${r1(top)} ${r1(L + rr)} ${r1(top)}L${r1(R - rr)} ${r1(top)}Q${r1(R)} ${r1(top)} ${r1(R)} ${r1(top + rr)}L${r1(R)} ${r1(B)}z`,
  );
  head.circle(x, top - hr * 0.85, hr);
}

export type TinyFigureProps = {x: number; y: number; h?: number; coat?: string; hair?: string; legs?: string};

/** One tiny back-view figure (fill-only). */
export const TinyFigure: React.FC<TinyFigureProps> = ({x, y, h = 20, coat = palette.teal, hair = palette.ink, legs = palette.tealDark}) => {
  const a = new PathBuf();
  const b = new PathBuf();
  const c = new PathBuf();
  tinyFigure(a, b, c, x, y, h);
  return (
    <>
      <path d={c.d} fill={legs} />
      <path d={b.d} fill={coat} />
      <path d={a.d} fill={hair} />
    </>
  );
};

export type TinyCrowdProps = {
  /** Explicit spots, or scatter `n` figures in `area` [x0, y0, x1, y1] (feet positions). */
  spots?: {x: number; y: number; h?: number}[];
  n?: number;
  area?: [number, number, number, number];
  /** Ground perspective: height = k * (y - horizon). Default flat h. */
  horizon?: number;
  k?: number;
  /** Fixed height when no horizon. */
  h?: number;
  /** Pop-in: figures spring up from their feet over [at, at + span] (front-to-back order by default). */
  at?: number;
  span?: number;
  order?: 'random' | 'front' | 'back' | 'left' | 'right';
  /** Fraction that walk; walking speed in body-heights per second; direction (deg, 0 = right, -90 = away). */
  walk?: number;
  walkSpeed?: number;
  walkDir?: number;
  /** Tint toward the haze (0 near .. 1 far) and time of day. */
  depth?: number;
  tod?: Tod | TodPalette;
  /** Single-colour silhouettes (backlit). */
  silhouette?: string;
  seed?: Seed;
};

type Fig = {x: number; y: number; h: number; coat: number; hair: number; legs: number; at: number; walk: boolean; ph: number; spd: number};

export const TinyCrowd: React.FC<TinyCrowdProps> = ({
  spots,
  n = 40,
  area = [100, 1200, 980, 1400],
  horizon,
  k = 0.08,
  h = 16,
  at,
  span = 2,
  order = 'front',
  walk = 0.2,
  walkSpeed = 0.9,
  walkDir = -90,
  depth = 0,
  tod = 'day',
  silhouette,
  seed = 'tc',
}) => {
  const t = useTime();
  const figs = useMemo(() => {
    const r = rng(`tc/${seed}`);
    const raw = spots ?? Array.from({length: n}, () => ({x: r.range(area[0], area[2]), y: area[1] + (area[3] - area[1]) * Math.pow(r.next(), 0.8), h: undefined as number | undefined}));
    const list: Fig[] = raw.map((s) => {
      const hh = s.h ?? (horizon !== undefined ? Math.max(3, k * (s.y - horizon)) : h);
      return {x: s.x, y: s.y, h: hh, coat: r.int(0, COATS.length - 1), hair: r.int(0, HAIR.length - 1), legs: r.int(0, LEGS.length - 1), at: 0, walk: r.chance(walk), ph: r.range(0, 6.28), spd: r.range(0.7, 1.3)};
    });
    // pop-in order
    const ys = list.map((f) => f.y);
    const xs = list.map((f) => f.x);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    for (const f of list) {
      const j = r.next();
      const base =
        order === 'front' ? 1 - (f.y - y0) / Math.max(1, y1 - y0) : order === 'back' ? (f.y - y0) / Math.max(1, y1 - y0) : order === 'left' ? (f.x - x0) / Math.max(1, x1 - x0) : order === 'right' ? 1 - (f.x - x0) / Math.max(1, x1 - x0) : j;
      f.at = 0.75 * base + 0.25 * j;
    }
    // draw far -> near
    return list.sort((a, b) => a.y - b.y);
  }, [spots, n, area.join(), horizon, k, h, walk, order, seed]);

  const coats = COATS.map((c) => silhouette ?? atmos(c, depth, tod));
  const hairs = HAIR.map((c) => silhouette ?? atmos(c, depth, tod));
  const legsC = LEGS.map((c) => silhouette ?? atmos(c, depth, tod));
  const bufs = {
    head: hairs.map(() => new PathBuf()),
    body: coats.map(() => new PathBuf()),
    legs: legsC.map(() => new PathBuf()),
  };
  const dir = (walkDir * Math.PI) / 180;
  for (const f of figs) {
    let sy = 1;
    if (at !== undefined) {
      const a0 = at + f.at * span;
      if (t < a0) continue;
      sy = springAt(t, a0, springs.snappy);
    }
    let x = f.x;
    let y = f.y;
    if (f.walk) {
      const dist = (t * walkSpeed * f.spd * f.h) % (f.h * 6);
      // walking away shrinks toward the horizon a little; sideways walkers just slide
      x += Math.cos(dir) * dist;
      y += Math.sin(dir) * dist * 0.35;
      y -= Math.abs(Math.sin(t * 7 * f.spd + f.ph)) * f.h * 0.05;
    } else {
      y -= Math.max(0, Math.sin(t * 0.9 + f.ph * 3)) * f.h * 0.02;
    }
    tinyFigure(bufs.head[f.hair], bufs.body[f.coat], bufs.legs[f.legs], x, y, f.h, sy);
  }
  const out: React.ReactNode[] = [];
  bufs.legs.forEach((b, i) => !b.empty && out.push(<path key={`l${i}`} d={b.d} fill={legsC[i]} />));
  bufs.body.forEach((b, i) => !b.empty && out.push(<path key={`b${i}`} d={b.d} fill={coats[i]} />));
  bufs.head.forEach((b, i) => !b.empty && out.push(<path key={`h${i}`} d={b.d} fill={hairs[i]} />));
  return <>{out}</>;
};
