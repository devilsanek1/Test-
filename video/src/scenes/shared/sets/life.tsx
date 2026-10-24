// sets/life.tsx — STREET LIFE for every street set (review 5): the seeded `people` layer, ink-only street furniture and
// the in-band foreground figure.
//
// Reference 1 (f_15.4) and reference 2 (f_1 / f_12 / f_33) get their charm and density from the crowd: back-view
// walkers and standers in the mid-ground, bikes, benches and carts on the pavement. A set at rest is therefore never
// deserted: each street set documents its own pavement anchors (`STOOP.walkers`, `OLD_QUARTER.walkers`, ...) and draws
// them through <People>, so scenes stop re-inventing placement. Scenes keep control:
//
//   people={false}                         // nobody (S04's "nobody did")
//   people                                 // the set's default anchors, standing / walking from frame 0
//   people={{riseAt: 1.2, walk: 1.6}}      // rise in from 1.2 s (0.33 s out-exp, 0.06 s stagger), walk from 1.6 s
//   people={{n: 2, walk: false}}           // only the first two anchors, everyone stands
//   people={{walkers: [{x, y, h, go: 'vp'}, ...]}}   // replace the anchors
//
// Walkers are props Citizen (back view, legs) at 0.10-0.24 H; a walker with `go: 'vp'` walks AWAY from the camera along
// its ray to the set's vanishing point and shrinks with perspective (constant speed in depth: `pace` = depth gained per
// second, default 0.05). People are ALWAYS seen from behind, so nobody walks toward the camera or sideways.

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {Bike} from '../../../lib/kit';
import type {Acc, Hair} from '../../../lib/kit';
import {crown, crownTicks, line, rectPath, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Seed} from '../../../lib/rng';
import {SI} from './common';
import {CitizenSlot, OnlookerSlot} from './propSlots';
import {MakersCart} from '../props';

// ---------------------------------------------------------------- people

export type WalkerAnchor = {
  /** Feet on the pavement (world px at the set's camera rest). */
  x: number;
  y: number;
  /** Total height (px). Street sets use 0.10-0.24 H (190-460 px) for mid-ground people. */
  h: number;
  /** 'vp' = walks away along its ray to the set's vanishing point; 'stand' (default) = idles (bob). */
  go?: 'vp' | 'stand';
  /** Depth gained per second while walking (0.05 = 5 % farther each second). */
  pace?: number;
  body?: string;
  hair?: Hair;
  acc?: Acc[];
  flip?: boolean;
};

export type PeopleOpts = {
  /** Rise in (0.33 s out-exp, 0.06 s stagger in anchor order). Omit = there from frame 0. */
  riseAt?: number;
  /** Walkers start walking at this time (s); false = everyone stands. Default 0 (walking from frame 0). */
  walk?: number | false;
  /** Use only the first n anchors. */
  n?: number;
  /** Replace the set's anchors. */
  walkers?: WalkerAnchor[];
  seed?: Seed;
};
/** A set's `people` prop: true / undefined = the set's anchors, false = nobody, or options. */
export type PeopleSpec = boolean | PeopleOpts;

/** Normalises a set's `people` prop (undefined -> the set default `def`). Returns null for "nobody". */
export function peopleOpts(spec: PeopleSpec | undefined, def = true): PeopleOpts | null {
  if (spec === undefined) return def ? {} : null;
  if (spec === false) return null;
  if (spec === true) return {};
  return spec;
}

/** Feet + height of a walker at time t (perspective walk away toward vp, constant speed in depth). */
export function walkerAt(w: WalkerAnchor, vp: Pt, t: number, walkAt: number | false): {x: number; y: number; h: number; walking: boolean} {
  if (w.go !== 'vp' || walkAt === false || t < walkAt) return {x: w.x, y: w.y, h: w.h, walking: false};
  const k = 1 / (1 + (w.pace ?? 0.05) * (t - walkAt)); // screen size ratio vs the start (depth grows linearly)
  return {x: vp[0] + (w.x - vp[0]) * k, y: vp[1] + (w.y - vp[1]) * k, h: w.h * k, walking: true};
}

/** The people layer: back-view walkers / standers on a set's pavement anchors. */
export const People: React.FC<{anchors: WalkerAnchor[]; vp: Pt; spec?: PeopleSpec; def?: boolean; seed?: Seed}> = ({anchors, vp, spec, def = true, seed = 'ppl'}) => {
  const t = useTime();
  const o = peopleOpts(spec, def);
  if (!o) return null;
  const list = (o.walkers ?? anchors).slice(0, o.n ?? undefined);
  const walkAt = o.walk === undefined ? 0 : o.walk;
  // far first (smaller feet y), so nearer people overlap farther ones
  const order = list.map((w, i) => ({w, i})).sort((a, b) => a.w.y - b.w.y);
  return (
    <>
      {order.map(({w, i}) => {
        const p = walkerAt(w, vp, t, walkAt);
        return (
          <CitizenSlot
            key={i}
            x={p.x}
            y={p.y}
            h={p.h}
            body={w.body}
            acc={w.acc}
            riseAt={o.riseAt === undefined ? undefined : o.riseAt + i * 0.06}
            walk={p.walking ? {hz: 1.7} : undefined}
            bob={p.walking ? 0 : 1.2}
            flip={w.flip}
            seed={`${o.seed ?? seed}/${i}`}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- street furniture (ink-led, a single flat fill)

export type FurnitureKind = 'bike' | 'bench' | 'planter' | 'cart';
export type FurnitureItem = {kind: FurnitureKind; x: number; y: number; s?: number; flip?: boolean; at?: number};

/** A bench seen from behind / three-quarter: seat + back slats, two legs. (x, y) = ground point at its centre; s = scale
 *  (1 = 150 px long). */
function benchPaths(x: number, y: number, s: number, seed: string) {
  const L = 150 * s;
  const h = 70 * s;
  const x0 = x - L / 2;
  const seat = rectPath(x0, y - h * 0.5, L, h * 0.12);
  const back = rectPath(x0 + L * 0.03, y - h, L * 0.94, h * 0.13) + rectPath(x0 + L * 0.03, y - h * 0.8, L * 0.94, h * 0.1);
  const ink =
    line(x0 - 4 * s, y - h * 0.5, x0 + L + 4 * s, y - h * 0.5, {seed: `${seed}/s1`, over: [3, 5]}) +
    line(x0, y - h * 0.38, x0 + L, y - h * 0.38, {seed: `${seed}/s2`, over: [2, 2]}) +
    line(x0 + L * 0.03, y - h, x0 + L * 0.97, y - h, {seed: `${seed}/b1`, over: [3, 3]}) +
    line(x0 + L * 0.03, y - h * 0.87, x0 + L * 0.97, y - h * 0.87, {seed: `${seed}/b2`, over: [1, 2]}) +
    line(x0 + L * 0.03, y - h * 0.8, x0 + L * 0.97, y - h * 0.8, {seed: `${seed}/b3`, over: [2, 1]}) +
    line(x0 + L * 0.08, y - h, x0 + L * 0.08, y, {seed: `${seed}/l1`, over: [0, 0]}) +
    line(x0 + L * 0.92, y - h, x0 + L * 0.92, y, {seed: `${seed}/l2`, over: [0, 0]}) +
    line(x0 + L * 0.18, y - h * 0.38, x0 + L * 0.14, y, {seed: `${seed}/l3`, over: 0}) +
    line(x0 + L * 0.82, y - h * 0.38, x0 + L * 0.86, y, {seed: `${seed}/l4`, over: 0});
  return {fill: seat + back, ink};
}

/** A planter box with a round shrub. (x, y) = ground point at its centre; s = scale (1 = 110 px wide). */
function planterPaths(x: number, y: number, s: number, seed: string) {
  const w = 110 * s;
  const h = 56 * s;
  const box = rectPath(x - w / 2, y - h, w, h);
  const boxInk = line(x - w / 2 - 6 * s, y - h, x + w / 2 + 6 * s, y - h, {seed: `${seed}/t`, over: [2, 4]}) + line(x - w / 2, y - h, x - w / 2 + 2, y, {seed: `${seed}/l`, over: [0, 2]}) + line(x + w / 2, y - h, x + w / 2 - 2, y, {seed: `${seed}/r`, over: [0, 2]}) + line(x - w / 2 + 4, y - h + 12 * s, x + w / 2 - 4, y - h + 12 * s, {seed: `${seed}/m`, over: 0});
  const cr = crown(x, y - h - 38 * s, 54 * s, 46 * s, {seed: `${seed}/c`, bumps: 8});
  const ticks = crownTicks(x, y - h - 38 * s, 54 * s, 46 * s, {seed: `${seed}/k`, n: 3, size: 10 * s});
  return {box, boxInk, cr, ticks};
}

/** Street furniture on the empty ground: kit Bike (ink only), bench, planter, the makers' cart (props MakersCart). */
export const Furniture: React.FC<{items?: FurnitureItem[] | false; ink?: number; seed?: Seed}> = ({items, ink = SI.mid, seed = 'furn'}) => {
  if (!items || !items.length) return null;
  return (
    <>
      {items.map((it, i) => {
        const s = it.s ?? 1;
        const sd = `${seed}/${i}`;
        if (it.kind === 'bike') return <Bike key={i} x={it.x} y={it.y} s={s} flip={it.flip} at={it.at} width={ink} seed={sd} basket={i % 2 === 0} />;
        if (it.kind === 'cart') return <MakersCart key={i} x={it.x} y={it.y} size={160 * s} flip={it.flip} at={it.at} seed={sd} />;
        if (it.kind === 'bench') {
          const b = benchPaths(it.x, it.y, s, sd);
          return (
            <XG key={i} m={it.flip ? mat.about(mat.scale(-1, 1), it.x, it.y) : mat.I}>
              <Fill d={b.fill} color={palette.sand} at={it.at} seed={`${sd}/f`} />
              <Ink d={b.ink} width={ink} taper={false} at={it.at} seed={`${sd}/i`} />
            </XG>
          );
        }
        const p = planterPaths(it.x, it.y, s, sd);
        return (
          <React.Fragment key={i}>
            <Fill d={p.box} color={palette.tan} at={it.at} seed={`${sd}/bf`} />
            <Fill d={p.cr} color={palette.sage} at={it.at} seed={`${sd}/cf`} />
            <Ink d={p.boxInk} width={ink} taper={false} at={it.at} seed={`${sd}/bi`} />
            <Ink d={p.cr} width={ink} open={0.12} at={it.at} seed={`${sd}/ci`} />
            <Ink d={p.ticks} width={ink * 0.7} taper={false} at={it.at} seed={`${sd}/ck`} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the in-band foreground figure

export type EdgeFigureSpec = {side: 'L' | 'R'; x?: number; y?: number; head?: number; hair?: Hair; body?: string; acc?: Acc[]};

/** A big back-view figure cropped by a side edge whose HEAD sits inside the visible band (y 1150-1500): the near layer a
 *  phone still shows (ref 2's edge-cut adult, 0.25-0.35 H; the coat runs off the frame bottom). */
export const EdgeFigure: React.FC<EdgeFigureSpec & {riseAt?: number; seed?: Seed}> = ({side, x, y = 1330, head = 124, hair, body, acc, riseAt, seed = 'edge'}) => (
  <OnlookerSlot
    x={x ?? (side === 'L' ? 46 : 1034)}
    y={y}
    head={head}
    hair={hair ?? (side === 'L' ? 'short' : 'bun')}
    body={body ?? (side === 'L' ? palette.teal : palette.sand)}
    acc={acc ?? (side === 'L' ? ['hood'] : ['scarf'])}
    rim={side === 'L' ? 'right' : 'left'}
    arms="near"
    riseAt={riseAt}
    seed={seed}
  />
);
