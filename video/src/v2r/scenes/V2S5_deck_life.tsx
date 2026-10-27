// V2S5_deck_life.tsx (lane L4, TERRACE): the terrace's PEOPLE and animals in END coords (deck plane), as items with
// a foot y for depth sorting. K4 cast (Person, Seated): round heads that are the hair, tombstone backs, one accessory,
// no faces, never teal or orange (coats pinned from the confetti / mids, never CM.box or the hero), no phones or
// cameras raised, nobody pointing; walks drawn at 12 drawings/s at 0.7-1.1 body heights/s (a jogger faster). Sizes
// follow the deck camera: the rail people ~80 px, the terrace 90-120 px, seated 50-80, the pair the tiniest.
// Nobody stands in the START window (they would be 2.4x at the start) and nobody passes over the pair, the plaque or
// the Pentagon's left two thirds. Life is a pure function of scene time t.
//   at the rail: a couple looking out, a parent with a kid on the shoulders; a bench couple (a cup lifts, a head
//   turns); a jogger crossing; someone walking a dog (it trots); a parent pushing a stroller (it rolls); an older
//   reader with a guidebook; two friends chatting (cut by the right edge); a reader on the near bench; a kid at the
//   drinking fountain; pigeons pecking (three take off in the hold).
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Person, Seated, strideFor, type TraitOverrides} from '../kit/cast';
import {ellD, lineD, mix, smoothClosed, circleD, polyD, rand, type Pt} from '../kit/dc/core';
import {dpt, pxmD, RAIL, DT} from './V2S5_deck_cam';

export type LifeItem = {y: number; key: string; el: React.ReactNode};

const H = CM.hair;

/** A walker's lateral position (m) at scene time t: X0 at t = 0, speed v m/s (+ = right). */
const Xt = (X0: number, v: number, t: number) => X0 + v * t;

// ---------------------------------------------------------------- small drawn animals and things

/** A small dog in profile (facing left unless flip), trotting at 12 drawings/s; back height hb px; (x, y) = feet. */
const Dog: React.FC<{x: number; y: number; hb: number; flip?: boolean; t: number; col: string; ear: string}> = ({x, y, hb, flip, t, col, ear}) => {
  const s = flip ? -1 : 1;
  const L = hb * 1.55;
  const tq = Math.floor(t * 12) / 12;
  const ph = Math.sin(tq * Math.PI * 2 * 2.6);
  const leg = (lx: number, a: number) => lineD([[x + s * lx, y - hb * 0.52], [x + s * (lx + a * hb * 0.16), y]]);
  const body = smoothClosed([
    [x - s * L * 0.44, y - hb * 0.95],
    [x + s * L * 0.38, y - hb * 0.98],
    [x + s * L * 0.46, y - hb * 0.6],
    [x + s * L * 0.3, y - hb * 0.46],
    [x - s * L * 0.36, y - hb * 0.48],
    [x - s * L * 0.5, y - hb * 0.66],
  ]);
  const head = smoothClosed([
    [x - s * L * 0.42, y - hb * 1.32],
    [x - s * L * 0.66, y - hb * 1.12],
    [x - s * L * 0.62, y - hb * 0.98],
    [x - s * L * 0.36, y - hb * 0.9],
    [x - s * L * 0.28, y - hb * 1.16],
  ]);
  const earD = smoothClosed([
    [x - s * L * 0.36, y - hb * 1.3],
    [x - s * L * 0.28, y - hb * 1.28],
    [x - s * L * 0.3, y - hb * 1.04],
    [x - s * L * 0.38, y - hb * 1.1],
  ]);
  const tail = `M${x + s * L * 0.44} ${y - hb * 0.9}Q${x + s * L * 0.64} ${y - hb * (1.25 + 0.08 * ph)} ${x + s * L * 0.58} ${y - hb * 1.38}`;
  const legs = leg(-L * 0.3, ph) + leg(-L * 0.18, -ph) + leg(L * 0.2, -ph) + leg(L * 0.32, ph);
  return (
    <g>
      <path d={ellD(x, y + 1, L * 0.5, hb * 0.1)} fill={DT.deep} />
      <path d={legs} stroke={col} strokeWidth={Math.max(1.6, hb * 0.13)} strokeLinecap="round" fill="none" />
      <path d={body + head} fill={col} />
      <path d={earD} fill={ear} />
      <path d={tail} stroke={col} strokeWidth={Math.max(1.4, hb * 0.1)} strokeLinecap="round" fill="none" />
      <path d={circleD(x - s * L * 0.63, y - hb * 1.06, Math.max(0.9, hb * 0.05))} fill={CM.anchor} />
    </g>
  );
};

/** A stroller (pram) in profile facing right unless flip; (x, y) = its back wheel's contact; size k = px per metre. */
const Stroller: React.FC<{x: number; y: number; k: number; flip?: boolean; t: number}> = ({x, y, k, flip, t}) => {
  const s = flip ? -1 : 1;
  const wr = 0.11 * k;
  const spin = Math.floor(t * 12) / 12;
  const wheel = (cx: number) => circleD(x + s * cx, y - wr, wr);
  const spoke = (cx: number) => {
    const a = spin * 7;
    return lineD([[x + s * cx - Math.cos(a) * wr * 0.8, y - wr - Math.sin(a) * wr * 0.8], [x + s * cx + Math.cos(a) * wr * 0.8, y - wr + Math.sin(a) * wr * 0.8]]);
  };
  const bodyD = smoothClosed([
    [x + s * 0.02 * k, y - 0.62 * k],
    [x + s * 0.7 * k, y - 0.62 * k],
    [x + s * 0.74 * k, y - 0.4 * k],
    [x + s * 0.6 * k, y - 0.28 * k],
    [x + s * 0.1 * k, y - 0.28 * k],
    [x + s * 0.0 * k, y - 0.4 * k],
  ]);
  const hood = `M${x + s * 0.04 * k} ${y - 0.6 * k}Q${x + s * 0.02 * k} ${y - 0.98 * k} ${x + s * 0.38 * k} ${y - 0.96 * k}L${x + s * 0.4 * k} ${y - 0.6 * k}Z`;
  const ink = Math.max(1.2, 0.022 * k);
  return (
    <g>
      <path d={ellD(x + s * 0.36 * k, y + 1, 0.46 * k, 0.07 * k)} fill={DT.deep} />
      <path d={wheel(0.12 * k) + wheel(0.62 * k)} fill={CM.anchor} />
      <path d={spoke(0.12 * k) + spoke(0.62 * k)} stroke={mix(CM.anchor, CM.paper, 0.4)} strokeWidth={Math.max(0.8, ink * 0.6)} fill="none" />
      <path d={lineD([[x + s * 0.12 * k, y - wr], [x + s * 0.3 * k, y - 0.3 * k], [x + s * 0.62 * k, y - wr]])} stroke={CM.anchor} strokeWidth={ink} fill="none" />
      <path d={bodyD} fill={CM.coatSlate} />
      <path d={hood} fill={mix(CM.coatSlate, CM.anchor, 0.25)} />
      <path d={`M${x + s * 0.4 * k} ${y - 0.62 * k}L${x + s * 0.7 * k} ${y - 0.62 * k}L${x + s * 0.68 * k} ${y - 0.56 * k}L${x + s * 0.4 * k} ${y - 0.56 * k}Z`} fill={CM.coatOat} />
      <path d={lineD([[x + s * 0.02 * k, y - 0.58 * k], [x - s * 0.22 * k, y - 0.98 * k], [x - s * 0.3 * k, y - 0.98 * k]])} stroke={CM.anchor} strokeWidth={ink} strokeLinecap="round" fill="none" />
      <path d={bodyD} stroke={CM.ink} strokeWidth={ink} fill="none" />
    </g>
  );
};

/** Pigeons on the floor (END coords): pecking (head bobs), a step now and then; from `liftAt` some take off and fly
 *  out low over the terrace (never toward the band: the flight stays below y ~1100). */
export type PigeonSpot = {X: number; d: number; dir: 1 | -1; lift?: {at: number; to: Pt}};
const Pigeons: React.FC<{spots: PigeonSpot[]; seed: string; t: number}> = ({spots, seed, t}) => {
  let sh = '';
  let body = '';
  let wing = '';
  let head = '';
  let bar = '';
  let legs = '';
  let flyW = '';
  spots.forEach((p, i) => {
    const [x0, y0] = dpt(p.X, p.d);
    const s = pxmD(p.d) * 0.34;
    const ph = rand(seed, `p${i}`) * 6;
    let x = x0 + Math.sin((t + ph) * 0.7) * s * 0.5;
    let y = y0;
    const dir = p.dir;
    if (p.lift && t > p.lift.at) {
      // take-off: a crouch (2 f), then up and away on an arc, wings flapping 7 Hz (drawn at 12/s)
      const u = Math.min(1, (t - p.lift.at) / 0.9);
      const e = u * u * (3 - 2 * u);
      const tx = p.lift.to[0];
      const ty = p.lift.to[1];
      x = x0 + (tx - x0) * e;
      y = y0 + (ty - y0) * e - Math.sin(e * Math.PI) * 40 * (s / 16);
      const fl = Math.floor(t * 12) % 2 ? 1 : -1;
      const sc = s * (1 + 0.6 * e);
      body += smoothClosed([[x - dir * sc * 0.5, y], [x, y - sc * 0.16], [x + dir * sc * 0.4, y - sc * 0.08], [x, y + sc * 0.12]]);
      flyW += polyD([[x - sc * 0.08, y - sc * 0.04], [x - dir * sc * 0.1, y - fl * sc * 0.7], [x + dir * sc * 0.22, y - sc * 0.02]]);
      head += circleD(x + dir * sc * 0.48, y - sc * 0.1, sc * 0.12);
      return;
    }
    const peck = Math.max(0, Math.sin((t + ph) * 5.4)) * s * 0.3;
    sh += ellD(x - s * 0.08, y0 + s * 0.04, s * 0.46, s * 0.1);
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
    bar += ellD(x - dir * s * 0.04, y - s * 0.34, s * 0.16, s * 0.045);
    legs += `M${x} ${y - s * 0.12}v${s * 0.12}M${x + dir * s * 0.1} ${y - s * 0.12}v${s * 0.12}`;
  });
  const pg = mix(CM.stoneShade, CM.paneUnlit, 0.38);
  return (
    <g>
      <path d={sh} fill={DT.deep} />
      <path d={legs} stroke={CM.brickDeep} strokeWidth={1.1} fill="none" />
      <path d={body} fill={pg} />
      <path d={wing} fill={mix(pg, CM.anchor, 0.25)} />
      <path d={flyW} fill={mix(pg, CM.paper, 0.25)} />
      <path d={bar} fill={CM.paper} />
      <path d={head} fill={CM.paneUnlit} />
    </g>
  );
};

/** A little book held open (paper, a plum cover edge) at screen (x, y), w px wide. */
const Book: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    <path d={polyD([[x - w / 2, y - w * 0.04], [x, y], [x + w / 2, y - w * 0.04], [x + w / 2, y + w * 0.55], [x, y + w * 0.6], [x - w / 2, y + w * 0.55]])} fill={CM.paper} />
    <path d={lineD([[x, y], [x, y + w * 0.6]])} stroke={CM.coatPlum} strokeWidth={Math.max(0.8, w * 0.08)} fill="none" />
  </g>
);

// ---------------------------------------------------------------- the cast (END coords)

/** Coat colours for the public here (no CM.box: the peach is the caption key box's job). */
const COATS = {slate: CM.coatSlate, mustard: CM.coatMustard, oat: CM.coatOat, plum: CM.coatPlum, sage: CM.sage, brick: CM.brick, brickLight: CM.brickLight, stone: CM.stoneShade, rust: CM.leafRust, deep: CM.brickDeep};

const person = (X: number, d: number, hm: number) => {
  const [x, y] = dpt(X, d);
  return {x, y, h: hm * pxmD(d), k: pxmD(d)};
};

/** The terrace's people and animals as depth-sortable items at scene time t. */
export function lifeItems(t: number): LifeItem[] {
  const out: LifeItem[] = [];
  const add = (y: number, key: string, el: React.ReactNode) => out.push({y, key, el});

  // --- at the rail (right of the plaque): a couple looking out; a parent with a kid on the shoulders
  {
    const dR = RAIL.d - 0.62;
    const a = person(9.55, dR, 1.64);
    const b = person(10.22, dR - 0.05, 1.8);
    add(a.y, 'railA', <Person key="railA" x={a.x} y={a.y} h={a.h} seed="s5t/railA" traits={{hair: 'bun', hairColor: H[4], coat: COATS.slate, acc: 'tote', accColor: CM.coatOat} as TraitOverrides} />);
    add(b.y, 'railB', <Person key="railB" x={b.x} y={b.y} h={b.h} seed="s5t/railB" view="rear34" turn={-0.35 + 0.15 * Math.sin(t * 0.9)} traits={{hair: 'short', hairColor: H[1], coat: COATS.oat, acc: 'backpack', accColor: CM.brickDeep} as TraitOverrides} />);
    const p = person(12.75, dR - 0.1, 1.78);
    const kidSeatY = p.y - p.h * 0.83;
    add(p.y, 'railP', (
      <g key="railP">
        <Person x={p.x} y={p.y} h={p.h} exact seed="s5t/railP" traits={{hair: 'short', hairColor: H[2], coat: COATS.sage, acc: 'none'} as TraitOverrides} />
        {/* the kid's legs over the parent's shoulders, then the kid */}
        <path d={lineD([[p.x - p.h * 0.07, kidSeatY + 1], [p.x - p.h * 0.1, kidSeatY + p.h * 0.1]]) + lineD([[p.x + p.h * 0.07, kidSeatY + 1], [p.x + p.h * 0.1, kidSeatY + p.h * 0.1]])} stroke={CM.coatSlate} strokeWidth={Math.max(2, p.h * 0.045)} strokeLinecap="round" fill="none" />
        <Seated x={p.x} y={kidSeatY} h={p.h * 0.3} seed="s5t/kidUp" traits={{hair: 'beanie', hatColor: CM.coatMustard, coat: COATS.brickLight, acc: 'none'} as TraitOverrides} turn={0.3 * Math.sin(t * 1.3)} />
      </g>
    ));
  }

  // --- the bench couple (second bench, right; bench X 6.0..8.0 at d 16.5): a cup lifts, a head turns
  {
    const dB = 16.5 + 0.12;
    const a = person(6.55, dB, 0);
    const b = person(7.45, dB, 0);
    const seatA = dpt(6.55, dB, 0.45)[1];
    const k = pxmD(dB);
    const cup = Math.max(0, Math.min(1, (Math.sin((t - 0.4) * 1.6) - 0.2) * 1.6));
    add(a.y - 0.01, 'benchA', <Seated key="benchA" x={a.x} y={seatA} h={0.84 * k} seed="s5t/benchA" cup={cup} side={-1} traits={{hair: 'long', hairColor: H[1], coat: COATS.mustard, acc: 'scarf', accColor: CM.coatPlum} as TraitOverrides} />);
    add(b.y - 0.01, 'benchB', <Seated key="benchB" x={b.x} y={seatA} h={0.8 * k} seed="s5t/benchB" turn={-0.45 + 0.25 * Math.sin(t * 1.1 + 1)} traits={{hair: 'cap', hatColor: CM.brickDeep, hairColor: H[0], coat: COATS.stone, acc: 'none'} as TraitOverrides} />);
  }

  // --- the jogger crossing right -> left (enters late: off the start window and the frame until the crane opens up)
  {
    const d = 15.85;
    const X = Xt(10.6, -2.75, t);
    const j = person(X, d, 1.74);
    add(j.y, 'jogger', <Person key="jogger" x={j.x} y={j.y} h={j.h} seed="s5t/jog" pose="jog" view="profile" walk={{rate: 2.7}} stride={strideFor(2.75 / 2.7 * j.k, j.h)} traits={{hair: 'crop', hairColor: H[2], coat: COATS.rust, acc: 'headphones', accColor: CM.anchor} as TraitOverrides} />);
  }

  // --- someone walking a dog (right -> left), the dog trotting ahead on a lead
  {
    const d = 14.4;
    const v = -1.3;
    const X = Xt(10.4, v, t);
    const w = person(X, d, 1.7);
    const dog = dpt(X - 0.95, d - 0.05);
    const hand: Pt = [w.x - w.h * 0.16, w.y - w.h * 0.45];
    add(w.y, 'dogWalker', (
      <g key="dogWalker">
        <Dog x={dog[0]} y={dog[1]} hb={0.42 * w.k} t={t} col={CM.coatOat} ear={mix(CM.coatOat, CM.line, 0.45)} />
        <path d={`M${hand[0]} ${hand[1]}Q${(hand[0] + dog[0]) / 2} ${hand[1] + w.h * 0.12} ${dog[0] - 0.22 * w.k} ${dog[1] - 0.48 * w.k}`} stroke={CM.anchor} strokeWidth={1.2} fill="none" />
        <Person x={w.x} y={w.y} h={w.h} seed="s5t/dogW" pose="reach" view="profile" reach={[-w.h * 0.17, -w.h * 0.46]} walk={{rate: 2.0}} stride={strideFor(1.3 / 2 * w.k, w.h)} traits={{hair: 'beanie', hatColor: CM.leafRust, hairColor: H[0], coat: COATS.plum, acc: 'none'} as TraitOverrides} />
      </g>
    ));
  }

  // --- a parent pushing a stroller (left -> right), off the frame until the crane has opened up
  {
    const d = 13.35;
    const v = 1.15;
    const X = Xt(-4.35, v, t);
    const pp = person(X, d, 1.68);
    const st = dpt(X + 0.42, d);
    add(pp.y, 'stroller', (
      <g key="stroller">
        <Stroller x={st[0]} y={st[1]} k={pp.k} t={t} />
        <Person x={pp.x} y={pp.y} h={pp.h} seed="s5t/strollerP" pose="reach" view="profile" flip reach={[-pp.h * 0.24, -pp.h * 0.56]} walk={{rate: 1.8}} stride={strideFor((1.15 / 1.8) * pp.k, pp.h)} traits={{hair: 'lowBun', hairColor: H[3], coat: COATS.brick, acc: 'strap', accColor: CM.coatOat} as TraitOverrides} />
      </g>
    ));
  }

  // --- an older reader with a guidebook (standing, rear 3/4), beside the lectern
  {
    const g = person(5.35, 13.05, 1.62);
    add(g.y, 'guide', (
      <g key="guide">
        <Person x={g.x} y={g.y} h={g.h} seed="s5t/guide" view="rear34" turn={0.3} pose="reach" reach={[-g.h * 0.2, -g.h * 0.6]} traits={{hair: 'short', hairColor: H[3], coat: COATS.plum, acc: 'scarf', accColor: CM.coatMustard} as TraitOverrides} />
        <Book x={g.x - g.h * 0.24} y={g.y - g.h * 0.66} w={g.h * 0.16} />
      </g>
    ));
  }

  // --- two friends chatting at the right edge (one cut by it)
  {
    const d = 15.1;
    const a = person(10.15, d, 1.72);
    const b = person(10.95, d + 0.1, 1.66);
    add(a.y, 'friendA', <Person key="friendA" x={a.x} y={a.y} h={a.h} seed="s5t/frA" view="rear34" flip turn={0.4} traits={{hair: 'hood', coat: COATS.sage, acc: 'none'} as TraitOverrides} />);
    add(b.y, 'friendB', <Person key="friendB" x={b.x} y={b.y} h={b.h} seed="s5t/frB" view="profile" traits={{hair: 'curls', hairColor: H[1], coat: COATS.mustard, acc: 'tote', accColor: CM.paper} as TraitOverrides} />);
  }

  // --- a reader on the near bench (bench X -1.5..1.5 at d 10.8), a takeaway cup on the slats beside them
  {
    const dB = 10.8 + 0.1;
    const r = person(-0.85, dB, 0);
    const seat = dpt(-0.85, dB, 0.45)[1];
    add(r.y - 0.01, 'nearReader', <Seated key="nearReader" x={r.x} y={seat} h={0.82 * r.k} seed="s5t/nearR" notebook={1} side={1} turn={0.1} traits={{hair: 'curls', hairColor: H[2], coat: COATS.oat, acc: 'none'} as TraitOverrides} />);
  }

  // --- a kid at the drinking fountain (fountain X 3.0, d 11.6): reaching up to the spout
  {
    const kd = person(3.42, 11.62, 1.12);
    add(kd.y, 'kidFountain', <Person key="kidFountain" x={kd.x} y={kd.y} h={kd.h} seed="s5t/kidF" view="profile" pose="reach" reach={[-kd.h * 0.36, -kd.h * (0.78 + 0.03 * Math.sin(t * 3))]} traits={{hair: 'cap', hatColor: CM.coatSlate, hairColor: H[4], coat: COATS.mustard, acc: 'backpack', accColor: CM.brick} as TraitOverrides} />);
  }

  // --- pigeons: a flock in front of the pair (the start's life: 2.4x there), a few take off in the hold; more by the
  //     near bench
  {
    const spots: PigeonSpot[] = [
      {X: 0.7, d: 18.9, dir: 1},
      {X: 1.25, d: 18.3, dir: -1, lift: {at: 2.95, to: [-60, 1120]}},
      {X: 1.9, d: 19.1, dir: 1},
      {X: 2.4, d: 17.7, dir: -1, lift: {at: 3.05, to: [-40, 1180]}},
      {X: 2.95, d: 18.6, dir: 1},
      {X: 3.6, d: 17.4, dir: -1},
      {X: 0.2, d: 17.6, dir: 1, lift: {at: 3.12, to: [-80, 1250]}},
    ];
    add(dpt(0, 18.3)[1], 'pigeonsA', <Pigeons key="pigeonsA" spots={spots} seed="s5t/pgA" t={t} />);
    const spots2: PigeonSpot[] = [
      {X: 1.75, d: 11.5, dir: -1},
      {X: 2.2, d: 11.15, dir: 1},
      {X: 2.55, d: 11.6, dir: -1},
    ];
    add(dpt(0, 11.4)[1], 'pigeonsB', <Pigeons key="pigeonsB" spots={spots2} seed="s5t/pgB" t={t} />);
  }
  return out;
}

/** The terrace's people + animals (sorted by depth, far first) at scene time t: for use outside a prop sort. */
export const DeckLife: React.FC = () => {
  const t = useTime();
  const items = lifeItems(t).sort((a, b) => a.y - b.y);
  return <>{items.map((i) => <React.Fragment key={i.key}>{i.el}</React.Fragment>)}</>;
};
