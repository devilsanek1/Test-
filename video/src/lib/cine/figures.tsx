// cine/figures.tsx — tiny back-view people for the far distance (6-30 px tall), fill-only like the reference's
// far crowd (style bible 6, tier D/C): round head (= hair colour), tombstone torso, two leg blocks. Batched by
// colour, so a few hundred cost a handful of paths. They pop up (spring from the feet), idle-bob, and walkers
// stroll with a step bob — tiny constant life that keeps a wide shot busy (>= 5 events/s).
//
//   <TinyCrowd n={80} area={[120, 1250, 960, 1420]} horizon={1010} k={0.07} at={0.5} span={2} walk={0.25} tod="golden" />
//   <TinyFigure x={540} y={1300} h={22} coat={palette.teal} hair={palette.ink} />
// Figures taller than `personAbove` (40 px, the legibility floor) are drawn as the kit <Person> (inked, legs, back
// view), depth-sorted far -> near after the tiny ones. Tiny ones are batched in small depth-sorted chunks, so a head
// never lands on a nearer body. Un-build: they sink into their feet (small first). Look: paper = white + hairline.

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {springAt, springs, useTime} from '../time';
import {rng, Seed} from '../rng';
import {atmos, Tod, TodPalette} from './atmosphere';
import {PathBuf, r1} from './util';
import {Person} from '../kit';
import {FlatColor} from './light';
import {exitScale, isPaper, useCineState} from './state';

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
  /** Figures at least this tall (px, layer units) become kit Persons with ink and legs. Default 40. 0 = never. */
  personAbove?: number;
};

/** Height of a kit Person with legs at s = 1 (head top to soles), and its feet below its `y` (hip line). */
export const PERSON_H = 205;
export const PERSON_FEET = 60;
/** On-screen ink for a person of height h px (style bible ladder, by size = depth). */
export const personInk = (h: number) => (h >= 260 ? 4.8 : h >= 120 ? 3.4 : h >= 70 ? 2.2 : 1.6);

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
  personAbove = 40,
}) => {
  const S = useCineState();
  const t = S.t;
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
  const dir = (walkDir * Math.PI) / 180;
  const out: React.ReactNode[] = [];
  const big: {f: Fig; x: number; y: number; sy: number; i: number}[] = [];
  // tiny figures: depth-sorted chunks, each chunk batched by colour (legs, then bodies, then heads)
  const CH = 10;
  let chunk: {f: Fig; x: number; y: number; sy: number}[] = [];
  let ci = 0;
  const flush = () => {
    if (!chunk.length) return;
    const cx = chunk.reduce((a, c) => a + c.x, 0) / chunk.length;
    const cy = chunk.reduce((a, c) => a + c.y, 0) / chunk.length;
    const paper = isPaper(S, [cx, cy]);
    const head = hairs.map(() => new PathBuf());
    const body = coats.map(() => new PathBuf());
    const legs = legsC.map(() => new PathBuf());
    for (const c of chunk) tinyFigure(head[c.f.hair], body[c.f.coat], legs[c.f.legs], c.x, c.y, c.f.h, c.sy);
    const key = `c${ci++}`;
    if (S.look.fills === 'none') return void (chunk = []);
    if (paper) {
      const d = [...legs, ...body, ...head].filter((b) => !b.empty).map((b) => b.d).join('');
      out.push(<path key={key} d={d} fill={palette.white} stroke={S.look.ink ? palette.ink : 'none'} strokeWidth={1} />);
    } else {
      legs.forEach((b, i) => !b.empty && out.push(<path key={`${key}l${i}`} d={b.d} fill={legsC[i]} />));
      body.forEach((b, i) => !b.empty && out.push(<path key={`${key}b${i}`} d={b.d} fill={coats[i]} />));
      head.forEach((b, i) => !b.empty && out.push(<path key={`${key}h${i}`} d={b.d} fill={hairs[i]} />));
    }
    chunk = [];
  };
  figs.forEach((f, i) => {
    let sy = 1;
    if (at !== undefined) {
      const a0 = at + f.at * span;
      if (t < a0) return;
      sy = springAt(t, a0, springs.snappy);
    }
    sy *= exitScale(S.e, f.ph / 6.28, 0.01);
    if (sy <= 0.002) return;
    let x = f.x;
    let y = f.y;
    let hh = f.h;
    if (f.walk) {
      const dist = (t * walkSpeed * f.spd * f.h) % (f.h * 6);
      // walking away recedes toward the horizon (and shrinks with the ground perspective); sideways walkers slide
      x += Math.cos(dir) * dist;
      y += Math.sin(dir) * dist * 0.35;
      if (horizon !== undefined && f.y > horizon + 1) hh = f.h * Math.max(0.05, (y - horizon) / (f.y - horizon));
      y -= Math.abs(Math.sin(t * 7 * f.spd + f.ph)) * hh * 0.05;
    } else {
      y -= Math.max(0, Math.sin(t * 0.9 + f.ph * 3)) * f.h * 0.02;
    }
    const ff = hh === f.h ? f : {...f, h: hh};
    if (personAbove > 0 && f.h >= personAbove) {
      big.push({f: ff, x, y, sy, i});
      return;
    }
    chunk.push({f: ff, x, y, sy});
    if (chunk.length >= CH) flush();
  });
  flush();
  // big ones: kit Persons (figs are already sorted far -> near)
  if (big.length) {
    const people = big.map(({f, x, y, sy, i}) => {
      const s = (f.h / PERSON_H) * Math.min(1, sy);
      return (
        <Person
          key={`p${i}`}
          x={x}
          y={y - PERSON_FEET * s}
          s={s}
          legs
          seed={`${seed}/p${i}`}
          body={silhouette ?? COATS[f.coat]}
          hairColor={silhouette ?? (HAIR[f.hair] === palette.sand ? palette.tan : HAIR[f.hair])}
          legsColor={silhouette ?? LEGS[f.legs]}
          ink={silhouette ? 0 : personInk(f.h)}
          idle={f.walk ? 0 : f.h * 0.01}
          lod={f.h < 70 ? 1 : 0}
        />
      );
    });
    out.push(silhouette ? <FlatColor key="ppl" color={silhouette}>{people}</FlatColor> : <React.Fragment key="ppl">{people}</React.Fragment>);
  }
  return <>{out}</>;
};
