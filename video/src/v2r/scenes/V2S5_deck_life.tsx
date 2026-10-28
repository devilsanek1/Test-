// V2S5_deck_life.tsx (lane L4, TERRACE): the terrace's PEOPLE and animals in END coords (deck plane), as items with
// a foot y for depth sorting and their LIGHT (contact strip + a cast along the rig's sun, drawn by S5Deck in the deck's
// ONE ShadowLayer). K4 cast (Person, Seated, Dog): round heads that are the hair, tombstone backs, one accessory, no
// faces, never teal or orange, no phones or cameras raised, nobody pointing; walks drawn at 12 drawings/s. Tier C
// (V2S5_set wraps the deck in the environment tier): the hand-drawn pieces here read their paint from the tier.
// Sizes follow the deck camera: the rail people ~80 px, the terrace 90-120 px, seated 50-80, the pair the tiniest.
// Nobody stands in the START window (they would be 2.4x at the start) and nobody passes over the pair, the plaque or
// the Pentagon's left two thirds. Life is a pure function of scene time t.
// LIFE BUDGET (conform_L4 §6, CRAFT §b): the deck adds at most TWO noticeable movers at a time (the lead's birds and
// clouds take the rest): a walker with a dog (right -> left) and a parent pushing a stroller (left -> right), both
// strolling (never fast), both already walking long before the hold. The rest is small and slow: a head turning at the
// rail, a kid on a shoulder looking about, a cup lifted on a bench, a kid at the fountain, a few pigeons pecking now and
// then (no take-offs). QUIET WINDOWS: no peck starts and nothing enters, pops or starts moving in scene -0.20..0.20 (the
// push-through in, film 20.35-20.75) nor from 3.00 (film 23.55: the wipe into S6 starts 23.62).
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {useTierPaint, useTierLine} from '../../lib/tier';
import {Person, Seated, Dog, strideFor, type TraitOverrides} from '../kit/cast';
import {ellD, lineD, mix, smoothClosed, circleD, polyD, rand, type Pt} from '../kit/dc/core';
import {dpt, pxmD, RAIL} from './V2S5_deck_cam';

/** A figure's light: its footprint centre (x, y), the stance width w (contact), its height h (cast; 0 = contact only). */
export type FigLight = {x: number; y: number; w: number; h: number; k?: number; depth?: number};
export type LifeItem = {y: number; key: string; el: React.ReactNode; light?: FigLight[]};

const H = CM.hair;

/** A walker's lateral position (m) at scene time t: X0 at t = 0, speed v m/s (+ = right). */
const Xt = (X0: number, v: number, t: number) => X0 + v * t;

/** The quiet windows (scene s): nothing starts there (QA: V2S5_deck_qa). */
export const QUIET: [number, number][] = [
  [-0.2, 0.2],
  [3.0, 3.6],
];
const quiet = (t: number) => QUIET.some(([a, b]) => t >= a && t <= b);

/** A peck (0..1: the head down) for a pigeon pecking every `period` s from `phase`; a peck whose onset falls in a quiet
 *  window is skipped (one dips 0.12 s, holds 0.08 s, comes up in 0.16 s). */
export function peckAt(t: number, phase: number, period: number): number {
  const n = Math.floor((t - phase) / period);
  for (const m of [n, n - 1]) {
    const t0 = phase + m * period;
    if (quiet(t0)) continue;
    const u = t - t0;
    if (u < 0 || u > 0.36) continue;
    if (u < 0.12) return u / 0.12;
    if (u < 0.2) return 1;
    return 1 - (u - 0.2) / 0.16;
  }
  return 0;
}

// ---------------------------------------------------------------- small drawn things (tier paint)

/** A stroller (pram) in profile facing right unless flip; (x, y) = its back wheel's contact; size k = px per metre. */
const Stroller: React.FC<{x: number; y: number; k: number; flip?: boolean}> = ({x, y, k, flip}) => {
  const paint = useTierPaint();
  const line = useTierLine();
  const s = flip ? -1 : 1;
  const wr = 0.11 * k;
  const wheel = (cx: number) => circleD(x + s * cx, y - wr, wr);
  const bodyD = smoothClosed([
    [x + s * 0.02 * k, y - 0.62 * k],
    [x + s * 0.7 * k, y - 0.62 * k],
    [x + s * 0.74 * k, y - 0.4 * k],
    [x + s * 0.6 * k, y - 0.28 * k],
    [x + s * 0.1 * k, y - 0.28 * k],
    [x + s * 0.0 * k, y - 0.4 * k],
  ]);
  const hood = `M${x + s * 0.04 * k} ${y - 0.6 * k}Q${x + s * 0.02 * k} ${y - 0.98 * k} ${x + s * 0.38 * k} ${y - 0.96 * k}L${x + s * 0.4 * k} ${y - 0.6 * k}Z`;
  const w = Math.max(1.2, 0.022 * k);
  const frame = mix(CM.coatSlate, CM.anchor, 0.45);
  return (
    <g>
      <path d={wheel(0.12 * k) + wheel(0.62 * k)} fill={paint(frame)} />
      <path d={lineD([[x + s * 0.12 * k, y - wr], [x + s * 0.3 * k, y - 0.3 * k], [x + s * 0.62 * k, y - wr]])} fill="none" {...line(frame, w, {thing: true})} />
      <path d={bodyD} fill={paint(CM.coatSlate)} />
      <path d={hood} fill={paint(mix(CM.coatSlate, CM.anchor, 0.2))} />
      <path d={`M${x + s * 0.4 * k} ${y - 0.62 * k}L${x + s * 0.7 * k} ${y - 0.62 * k}L${x + s * 0.68 * k} ${y - 0.56 * k}L${x + s * 0.4 * k} ${y - 0.56 * k}Z`} fill={paint(CM.coatOat)} />
      <path d={lineD([[x + s * 0.02 * k, y - 0.58 * k], [x - s * 0.22 * k, y - 0.98 * k], [x - s * 0.3 * k, y - 0.98 * k]])} fill="none" strokeLinecap="round" {...line(frame, w, {thing: true})} />
    </g>
  );
};

/** Pigeons on the floor (END coords), pecking now and then (`peckAt`), a slow shuffle; no take-offs. */
export type PigeonSpot = {X: number; d: number; dir: 1 | -1};
const Pigeons: React.FC<{spots: PigeonSpot[]; seed: string; t: number}> = ({spots, seed, t}) => {
  const paint = useTierPaint();
  let body = '';
  let wing = '';
  let head = '';
  spots.forEach((p, i) => {
    const [x0, y] = dpt(p.X, p.d);
    const s = pxmD(p.d) * 0.34;
    const ph = rand(seed, `p${i}`);
    const x = x0 + Math.sin(t * 0.32 + ph * 6) * s * 0.25;
    const dir = p.dir;
    const peck = peckAt(t, 0.35 + ph * 1.6, 1.75 + ph * 0.6) * s * 0.3;
    body += smoothClosed([
      [x + dir * s * 0.34, y - s * 0.5],
      [x + dir * s * 0.46, y - s * 0.3],
      [x + dir * s * 0.2, y - s * 0.1],
      [x - dir * s * 0.3, y - s * 0.16],
      [x - dir * s * 0.62, y - s * 0.3],
      [x - dir * s * 0.3, y - s * 0.42],
    ]);
    wing += ellD(x - dir * s * 0.1, y - s * 0.32, s * 0.24, s * 0.08);
    head += circleD(x + dir * s * 0.44, y - s * 0.62 + peck, s * 0.13);
  });
  const pg = mix(CM.stoneShade, CM.paneUnlit, 0.32);
  return (
    <g>
      <path d={body} fill={paint(pg)} />
      <path d={wing} fill={paint(mix(pg, CM.anchor, 0.18))} />
      <path d={head} fill={paint(mix(CM.paneUnlit, CM.stoneShade, 0.45))} />
    </g>
  );
};
/** The pigeons' screen spots (END coords) at scene time t, for their contact strips. */
const pigeonLight = (spots: PigeonSpot[], seed: string, t: number): FigLight[] =>
  spots.map((p, i) => {
    const [x0, y] = dpt(p.X, p.d);
    const s = pxmD(p.d) * 0.34;
    const x = x0 + Math.sin(t * 0.32 + rand(seed, `p${i}`) * 6) * s * 0.25;
    return {x: x - p.dir * s * 0.08, y, w: s * 0.8, h: 0};
  });

/** A little book held open (paper, a plum cover edge) at screen (x, y), w px wide. */
const Book: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const paint = useTierPaint();
  return (
    <g>
      <path d={polyD([[x - w / 2, y - w * 0.04], [x, y], [x + w / 2, y - w * 0.04], [x + w / 2, y + w * 0.55], [x, y + w * 0.6], [x - w / 2, y + w * 0.55]])} fill={paint(CM.coatOat)} />
      <path d={polyD([[x - w * 0.04, y], [x + w * 0.04, y], [x + w * 0.04, y + w * 0.6], [x - w * 0.04, y + w * 0.6]])} fill={paint(CM.coatPlum)} />
    </g>
  );
};

// ---------------------------------------------------------------- the cast (END coords)

/** Coat colours for the public here (no CM.box: the peach is the caption key box's job). */
const COATS = {slate: CM.coatSlate, mustard: CM.coatMustard, oat: CM.coatOat, plum: CM.coatPlum, sage: CM.sage, brick: CM.brick, brickLight: CM.brickLight, stone: CM.stoneShade, rust: CM.leafRust, deep: CM.brickDeep};

const person = (X: number, d: number, hm: number) => {
  const [x, y] = dpt(X, d);
  return {x, y, h: hm * pxmD(d), k: pxmD(d)};
};
/** A standing figure's light: contact 1.2x a stance of 0.26 h, a cast of its height (CRAFT §d.5-6). */
const stand = (x: number, y: number, h: number): FigLight[] => [{x, y, w: h * 0.26, h, k: 1.2}];

/** Where everyone is (X m, d m, height m; walkers: X0 at t 0 and v m/s, strolling). One table for the drawing and the
 *  QA. The walkers keep their end-hold spots (the strollers slowed with X0 moved so X(3.2) is unchanged). */
export const CAST5 = {
  railA: {X: 9.55, d: RAIL.d - 0.62, hm: 1.64},
  railB: {X: 10.22, d: RAIL.d - 0.67, hm: 1.8},
  railP: {X: 12.75, d: RAIL.d - 0.72, hm: 1.78, kid: 0.42},
  benchA: {X: 6.55, d: 16.62, hm: 1.3},
  benchB: {X: 7.45, d: 16.62, hm: 1.26},
  dogWalker: {X0: 11.4, v: -1.05, d: 14.4, hm: 1.7},
  stroller: {X0: -4.86, v: 0.95, d: 13.35, hm: 1.68},
  guide: {X: 5.35, d: 13.05, hm: 1.62},
  friendA: {X: 10.47, d: 15.0, hm: 1.72},
  friendB: {X: 11.04, d: 15.1, hm: 1.66},
  nearReader: {X: -0.85, d: 10.9, hm: 1.27},
  kidFountain: {X: 3.42, d: 11.62, hm: 1.12},
};
/** The two noticeable movers (QA: their screen speed and the hold). */
export const WALKERS = ['dogWalker', 'stroller'] as const;

/** Screen boxes (END coords) of the cast at scene time t: {key, x0, y0, x1, y1, h} (for the QA: sizes on screen over
 *  the move, nobody over the pair / the plaque / the Pentagon's left two thirds). */
export function castBoxes(t: number): {key: string; x0: number; y0: number; x1: number; y1: number; h: number}[] {
  const out: {key: string; x0: number; y0: number; x1: number; y1: number; h: number}[] = [];
  for (const [key, c] of Object.entries(CAST5)) {
    const cc = c as {X?: number; X0?: number; v?: number; d: number; hm: number; kid?: number};
    const X = cc.X ?? (cc.X0 ?? 0) + (cc.v ?? 0) * t;
    const [x, y] = dpt(X, cc.d);
    const k = pxmD(cc.d);
    const h = (cc.hm + (cc.kid ?? 0)) * k;
    const w = key === 'stroller' ? 1.35 * k : key === 'dogWalker' ? 1.4 * k : 0.5 * k;
    const xc = key === 'stroller' ? x + 0.45 * k : key === 'dogWalker' ? x - 0.45 * k : x;
    out.push({key, x0: xc - w / 2, y0: y - h, x1: xc + w / 2, y1: y, h});
  }
  return out;
}

/** The pigeons: three in front of the pair (the start's life, 2.4x there), two by the near bench. */
const PIGEONS_A: PigeonSpot[] = [
  {X: 1.05, d: 17.6, dir: 1},
  {X: 1.85, d: 16.9, dir: -1},
  {X: 2.6, d: 17.9, dir: 1},
];
const PIGEONS_B: PigeonSpot[] = [
  {X: 1.9, d: 11.45, dir: -1},
  {X: 2.4, d: 11.2, dir: 1},
];

/** The terrace's people and animals as depth-sortable items at scene time t. */
export function lifeItems(t: number): LifeItem[] {
  const out: LifeItem[] = [];
  const add = (y: number, key: string, el: React.ReactNode, light?: FigLight[]) => out.push({y, key, el, light});

  // --- at the rail (right of the plaque): a couple looking out; a parent with a kid on the shoulders
  {
    const a = person(CAST5.railA.X, CAST5.railA.d, CAST5.railA.hm);
    const b = person(CAST5.railB.X, CAST5.railB.d, CAST5.railB.hm);
    add(a.y, 'railA', <Person key="railA" x={a.x} y={a.y} h={a.h} seed="s5t/railA" traits={{hair: 'bun', hairColor: H[4], coat: COATS.slate, acc: 'tote', accColor: CM.coatOat} as TraitOverrides} />, stand(a.x, a.y, a.h));
    add(b.y, 'railB', <Person key="railB" x={b.x} y={b.y} h={b.h} seed="s5t/railB" view="rear34" turn={-0.35 + 0.15 * Math.sin(t * 0.9)} traits={{hair: 'short', hairColor: H[1], coat: COATS.oat, acc: 'backpack', accColor: CM.brickDeep} as TraitOverrides} />, stand(b.x, b.y, b.h));
    const p = person(CAST5.railP.X, CAST5.railP.d, CAST5.railP.hm);
    const kidSeatY = p.y - p.h * 0.83;
    add(
      p.y,
      'railP',
      <g key="railP">
        <Person x={p.x} y={p.y} h={p.h} exact seed="s5t/railP" traits={{hair: 'short', hairColor: H[2], coat: COATS.sage, acc: 'none'} as TraitOverrides} />
        {/* the kid's legs over the parent's shoulders (they ARE lines), then the kid */}
        <KidLegs x={p.x} y={kidSeatY} h={p.h} />
        <Seated x={p.x} y={kidSeatY} h={p.h * 0.3} seed="s5t/kidUp" traits={{hair: 'beanie', hatColor: CM.coatMustard, coat: COATS.brickLight, acc: 'none'} as TraitOverrides} turn={0.3 * Math.sin(t * 1.1)} />
      </g>,
      stand(p.x, p.y, p.h * 1.2),
    );
  }

  // --- the bench couple (second bench, right; bench X 6.0..8.0 at d 16.5): a cup lifts, a head turns
  {
    const dB = CAST5.benchA.d;
    const a = person(CAST5.benchA.X, dB, 0);
    const b = person(CAST5.benchB.X, dB, 0);
    const seatA = dpt(CAST5.benchA.X, dB, 0.45)[1];
    const k = pxmD(dB);
    const cup = Math.max(0, Math.min(1, (Math.sin((t - 0.4) * 1.6) - 0.2) * 1.6));
    add(a.y - 0.01, 'benchA', <Seated key="benchA" x={a.x} y={seatA} h={0.84 * k} seed="s5t/benchA" cup={cup} side={-1} traits={{hair: 'long', hairColor: H[1], coat: COATS.mustard, acc: 'scarf', accColor: CM.coatPlum} as TraitOverrides} />);
    add(b.y - 0.01, 'benchB', <Seated key="benchB" x={b.x} y={seatA} h={0.8 * k} seed="s5t/benchB" turn={-0.45 + 0.25 * Math.sin(t * 1.1 + 1)} traits={{hair: 'cap', hatColor: CM.brickDeep, hairColor: H[0], coat: COATS.stone, acc: 'none'} as TraitOverrides} />);
  }

  // --- someone walking a dog (right -> left), the dog trotting ahead on a lead (a stroll: 1.05 m/s)
  {
    const C = CAST5.dogWalker;
    const d = C.d;
    const X = Xt(C.X0, C.v, t);
    const w = person(X, d, C.hm);
    const dog = dpt(X - 0.95, d - 0.05);
    const dk = pxmD(d - 0.05);
    const hand: Pt = [w.x - w.h * 0.17, w.y - w.h * 0.46];
    add(
      w.y,
      'dogWalker',
      <g key="dogWalker">
        <Dog x={dog[0]} y={dog[1]} h={0.55 * dk} pose="trot" walk={{rate: 2.6}} coat="brown" lead={{x: hand[0], y: hand[1]}} seed="s5t/dog" />
        <Person x={w.x} y={w.y} h={w.h} seed="s5t/dogW" pose="reach" view="profile" reach={[-w.h * 0.17, -w.h * 0.46]} walk={{rate: 1.8}} stride={strideFor((1.05 / 1.8) * w.k, w.h)} traits={{hair: 'beanie', hatColor: CM.leafRust, hairColor: H[0], coat: COATS.plum, acc: 'none'} as TraitOverrides} />
      </g>,
      [...stand(w.x, w.y, w.h), {x: dog[0], y: dog[1], w: 0.7 * dk, h: 0.5 * dk, depth: 0.08 * dk}],
    );
  }

  // --- a parent pushing a stroller (left -> right; a stroll: 0.95 m/s), off the frame until the crane has opened up
  {
    const C = CAST5.stroller;
    const d = C.d;
    const X = Xt(C.X0, C.v, t);
    const pp = person(X, d, C.hm);
    const st = dpt(X + 0.42, d);
    add(
      pp.y,
      'stroller',
      <g key="stroller">
        <Stroller x={st[0]} y={st[1]} k={pp.k} />
        <Person x={pp.x} y={pp.y} h={pp.h} seed="s5t/strollerP" pose="reach" view="profile" flip reach={[-pp.h * 0.24, -pp.h * 0.56]} walk={{rate: 1.6}} stride={strideFor((0.95 / 1.6) * pp.k, pp.h)} traits={{hair: 'lowBun', hairColor: H[3], coat: COATS.brick, acc: 'strap', accColor: CM.coatOat} as TraitOverrides} />
      </g>,
      [...stand(pp.x, pp.y, pp.h), {x: st[0] + 0.37 * pp.k, y: st[1], w: 0.8 * pp.k, h: 0.9 * pp.k, depth: 0.12 * pp.k}],
    );
  }

  // --- an older reader with a guidebook (standing, rear 3/4), beside the lectern
  {
    const g = person(CAST5.guide.X, CAST5.guide.d, CAST5.guide.hm);
    add(
      g.y,
      'guide',
      <g key="guide">
        <Person x={g.x} y={g.y} h={g.h} seed="s5t/guide" view="rear34" turn={0.3} pose="reach" reach={[-g.h * 0.2, -g.h * 0.6]} traits={{hair: 'short', hairColor: H[3], coat: COATS.plum, acc: 'scarf', accColor: CM.coatMustard} as TraitOverrides} />
        <Book x={g.x - g.h * 0.24} y={g.y - g.h * 0.66} w={g.h * 0.16} />
      </g>,
      stand(g.x, g.y, g.h),
    );
  }

  // --- two friends chatting at the right edge (one cut by it)
  {
    const a = person(CAST5.friendA.X, CAST5.friendA.d, CAST5.friendA.hm);
    const b = person(CAST5.friendB.X, CAST5.friendB.d, CAST5.friendB.hm);
    add(a.y, 'friendA', <Person key="friendA" x={a.x} y={a.y} h={a.h} seed="s5t/frA" view="rear34" flip turn={0.4} traits={{hair: 'hood', coat: COATS.sage, acc: 'none'} as TraitOverrides} />, stand(a.x, a.y, a.h));
    add(b.y, 'friendB', <Person key="friendB" x={b.x} y={b.y} h={b.h} seed="s5t/frB" view="profile" traits={{hair: 'curls', hairColor: H[1], coat: COATS.mustard, acc: 'tote', accColor: CM.paper} as TraitOverrides} />, stand(b.x, b.y, b.h));
  }

  // --- a reader on the near bench (bench X -1.5..1.5 at d 10.8), a takeaway cup on the slats beside them
  {
    const dB = CAST5.nearReader.d;
    const r = person(CAST5.nearReader.X, dB, 0);
    const seat = dpt(CAST5.nearReader.X, dB, 0.45)[1];
    add(r.y - 0.01, 'nearReader', <Seated key="nearReader" x={r.x} y={seat} h={0.82 * r.k} seed="s5t/nearR" notebook={1} side={1} turn={0.1} traits={{hair: 'curls', hairColor: H[2], coat: COATS.oat, acc: 'none'} as TraitOverrides} />);
  }

  // --- a kid at the drinking fountain (fountain X 3.0, d 11.6): reaching up to the spout (a slow reach)
  {
    const kd = person(CAST5.kidFountain.X, CAST5.kidFountain.d, CAST5.kidFountain.hm);
    add(
      kd.y,
      'kidFountain',
      <Person key="kidFountain" x={kd.x} y={kd.y} h={kd.h} seed="s5t/kidF" view="profile" pose="reach" reach={[-kd.h * 0.36, -kd.h * (0.78 + 0.03 * Math.sin(t * 1.2))]} traits={{hair: 'cap', hatColor: CM.coatSlate, hairColor: H[4], coat: COATS.mustard, acc: 'backpack', accColor: CM.brick} as TraitOverrides} />,
      stand(kd.x, kd.y, kd.h),
    );
  }

  // --- pigeons: three in front of the pair, two by the near bench; pecking now and then
  add(dpt(0, 17.3)[1], 'pigeonsA', <Pigeons key="pigeonsA" spots={PIGEONS_A} seed="s5t/pgA" t={t} />, pigeonLight(PIGEONS_A, 's5t/pgA', t));
  add(dpt(0, 11.3)[1], 'pigeonsB', <Pigeons key="pigeonsB" spots={PIGEONS_B} seed="s5t/pgB" t={t} />, pigeonLight(PIGEONS_B, 's5t/pgB', t));
  return out;
}

/** The kid's legs over the parent's shoulders: two shapes drawn with a round stroke (graphic: width kept), the tier's
 *  calm colour of the kid's trousers. */
const KidLegs: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => {
  const paint = useTierPaint();
  const d = lineD([[x - h * 0.07, y + 1], [x - h * 0.1, y + h * 0.1]]) + lineD([[x + h * 0.07, y + 1], [x + h * 0.1, y + h * 0.1]]);
  return <path d={d} fill="none" strokeLinecap="round" stroke={paint(CM.coatSlate)} strokeWidth={Math.max(2, h * 0.045)} />;
};

/** The terrace's people + animals (sorted by depth, far first) at scene time t: for use outside a prop sort. */
export const DeckLife: React.FC = () => {
  const t = useTime();
  const items = lifeItems(t).sort((a, b) => a.y - b.y);
  return <>{items.map((i) => <React.Fragment key={i.key}>{i.el}</React.Fragment>)}</>;
};
