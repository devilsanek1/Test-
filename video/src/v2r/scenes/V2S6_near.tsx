// V2S6_near.tsx (lane L5): S6's near plane on top of the kit's GateNear (kerb, paving, bollards + chain, the flowering
// shrub, the bench + bike rack in the rail). NEAR-plane coordinates (the gate's near group drifts +65 px/s); nothing
// here ever rises above y 1250, so the near plane can slide under the deal board without crossing its lettering.
//   paving    setts along the kerb, slab tone patches and joints in the free areas, petal litter, a drain grate
//   troughs   two stone troughs of daffodils behind the chain (the heads nod), with short flat shadows
//   bench     a reader at rest on the kit's bench (a newspaper, no masthead), its backrest redrawn over them
//   pigeons   six pecking on the paving in front of the tulip border; three flutter up and away (right) as the
//             passer-by comes past (1.60 / 1.89 / 2.27)
//   readers   three head-backs cut by the bottom (hv <= 150: <= ~139 px at the shoulders), the middle one turns to
//             her neighbour 1.5-2.6; a passer-by's head-back crosses behind them left -> right (0.3-4.06)
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {rand, rng} from '../../lib/rng';
import {NearBack, Seated} from '../kit/cast';
import {Batch, Paint, mix, ellD, circleD, lineD, smoothClosed} from '../kit/dc/core';
import {benchBack} from '../kit/dc/terrace';
import {GATE} from '../kit/dc/gate';
import {DRIFT, dxOf} from './V2S6_rig';
import {LEAF} from './V2S6_set';

const smooth = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};
const f1 = (n: number) => n.toFixed(1);

const NT = {
  sett: mix(CM.paving, CM.stoneShade, 0.34),
  settLit: mix(CM.paving, CM.paper, 0.35),
  settJoint: mix(CM.paving, CM.line, 0.5),
  slabLit: mix(CM.paving, CM.paper, 0.4),
  slabWorn: mix(CM.paving, CM.brickLight, 0.26),
  slabCool: mix(CM.paving, CM.stoneShade, 0.34),
  joint: mix(CM.paving, CM.line, 0.45),
  shadow: mix(CM.paving, CM.shadeWarm, 0.4),
  shadowSoft: mix(CM.paving, CM.shadeWarm, 0.26),
  petal: CM.blossom,
  petalShade: mix(CM.blossom, CM.shadeWarm, 0.25),
  trough: mix(CM.limestone, CM.stoneShade, 0.25),
  troughLit: CM.limestone,
  troughShade: mix(CM.stoneShade, CM.shadeCool, 0.25),
  soil: mix(CM.brickDeep, CM.anchor, 0.42),
  grate: mix(CM.anchor, CM.paving, 0.3),
  pigeon: mix(CM.stoneShade, CM.paneUnlit, 0.32),
  pigeonWing: mix(CM.stoneShade, CM.paneUnlit, 0.5),
  pigeonLit: mix(CM.stoneShade, CM.paper, 0.35),
  pigeonHead: mix(CM.paneUnlit, CM.stoneShade, 0.2),
  pigeonNeck: mix(CM.sage, CM.waterDeep, 0.5),
  pigeonBar: CM.anchor,
  pigeonLeg: CM.brick,
};

// ---------------------------------------------------------------- free areas (near coords): the kit's near objects

const BOLLARDS = [-460, -130, 200, 530, 860, 1190];
/** Rects the overlays keep off (the kit's bollards, shrub, bench, rack + bike, my troughs). */
const KEEP_OFF: [number, number, number, number][] = [
  ...BOLLARDS.map((x) => [x - 26, 1396, x + 26, 1508] as [number, number, number, number]),
  [-300, 1250, 150, 1490],
  [850, 1300, 1120, 1430],
  [780, 1470, 1050, 1580],
  [226, 1300, 504, 1400],
  [556, 1300, 836, 1402],
];
const free = (x0: number, y0: number, x1: number, y1: number) => KEEP_OFF.every(([a, b, c, d]) => x1 < a || x0 > c || y1 < b || y0 > d);

// ---------------------------------------------------------------- the paving overlay (static)

const pavingBatch = (): Batch => {
  const B = new Batch();
  const r = rng('s6paving');
  const ky = GATE.kerbY; // 1252
  // setts: two rows of small granite blocks along the near kerb (x 150 .. 1120), staggered
  for (let row = 0; row < 2; row++) {
    const y = ky + 6 + row * 15;
    for (let x = 152 + (row ? 14 : 0); x < 1130; x += r.range(25, 33)) {
      const w = r.range(20, 27);
      B.rect(r.chance(0.3) ? NT.settLit : NT.sett, x, y, w, 12.5);
    }
  }
  B.ink(lineD([[150, ky + 36], [1130, ky + 36]]), 1.6, NT.settJoint, 0.15);
  B.layer();
  // slab tone patches + joints in the free areas: rows recede toward the eye line (perspective spacing)
  const rows = [1300, 1338, 1384, 1440, 1506, 1584, 1676, 1784, 1910];
  for (let i = 0; i < rows.length - 1; i++) {
    const y0 = rows[i];
    const y1 = rows[i + 1];
    const w = 90 + (y0 - 1300) * 0.35;
    for (let x = -300 + r.range(0, w); x < 1130; x += w * r.range(0.85, 1.25)) {
      const ww = w * r.range(0.8, 1.05);
      if (!free(x, y0, x + ww, y1)) continue;
      if (r.chance(0.36)) B.rect(r.pick([NT.slabLit, NT.slabWorn, NT.slabCool]), x + 2, y0 + 2, ww - 4, y1 - y0 - 4);
      const lean = (x - 540) * 0.06;
      B.ink(lineD([[x, y0 + 1], [x + lean * 0.3, y1 - 1]]), y0 > 1500 ? 2.2 : 1.6, NT.joint, 0.3);
    }
    if (i > 3) B.ink(lineD([[-300 + r.range(0, 80), y0], [1130, y0 + r.range(-1.5, 1.5)]]), y0 > 1500 ? 2.2 : 1.6, NT.joint, 0.45);
  }
  B.layer();
  // a drain grate (iron slots) and a manhole lid
  B.rect(NT.grate, 690, 1716, 64, 30);
  for (let k = 0; k < 6; k++) B.rect(NT.slabCool, 696 + k * 10, 1720, 5, 22);
  B.fill(NT.slabCool, ellD(330, 1860, 64, 18));
  B.ink(ellD(330, 1860, 64, 18), 2.2, NT.joint);
  B.ink(ellD(330, 1860, 46, 12), 1.6, NT.joint);
  B.layer();
  // petal litter: drifts along the kerb and the bollards' feet, a scatter elsewhere (never on the kit's objects)
  let pa = '';
  let pb = '';
  const add = (x: number, y: number, s: number) => {
    const d = ellD(x, y, s, s * r.range(0.35, 0.6));
    if (r.chance(0.6)) pa += d;
    else pb += d;
  };
  for (let i = 0; i < 70; i++) {
    const x = r.range(150, 1120);
    const y = ky + 40 + Math.pow(r.next(), 2) * 40;
    if (free(x - 6, y - 4, x + 6, y + 4)) add(x, y, r.range(4, 7));
  }
  for (let i = 0; i < 160; i++) {
    const x = r.range(-280, 1120);
    const y = r.range(1300, 1900);
    if (free(x - 8, y - 4, x + 8, y + 4)) add(x, y, r.range(4.5, 9));
  }
  for (const bx of BOLLARDS) for (let i = 0; i < 7; i++) add(bx + 30 + r.range(-6, 40), 1510 + r.range(-3, 6), r.range(5, 8));
  B.fill(NT.petal, pa);
  B.fill(NT.petalShade, pb);
  B.layer();
  // short flat shadows ON THE GROUND to the right of the kit's bollards and the bench (the sun is low on the left)
  for (const bx of BOLLARDS) B.poly(NT.shadow, [[bx + 20, 1498], [bx + 54, 1496], [bx + 58, 1506], [bx + 20, 1508]]);
  B.poly(NT.shadow, [[1104, 1414], [1146, 1412], [1150, 1424], [1104, 1426]]);
  return B;
};

// ---------------------------------------------------------------- troughs of daffodils (nodding heads)

type Trough = {x0: number; x1: number; top: number; base: number; seed: string};
const TROUGHS: Trough[] = [
  {x0: 236, x1: 494, top: 1336, base: 1398, seed: 'trA'},
  {x0: 566, x1: 826, top: 1338, base: 1400, seed: 'trB'},
];

const troughBatch = (): Batch => {
  const B = new Batch();
  for (const tr of TROUGHS) {
    const w = tr.x1 - tr.x0;
    const r = rng(tr.seed);
    B.poly(NT.shadow, [[tr.x1, tr.base - 4], [tr.x1 + 36, tr.base - 6], [tr.x1 + 40, tr.base + 6], [tr.x1, tr.base + 6]]);
    B.rect(NT.trough, tr.x0, tr.top, w, tr.base - tr.top);
    // dressed stone blocks: alternate tones, a lit top course
    for (let x = tr.x0; x < tr.x1 - 4; x += r.range(42, 60)) B.rect(r.chance(0.5) ? NT.troughLit : NT.trough, x + 2, tr.top + 12, Math.min(r.range(36, 54), tr.x1 - x - 18), 22);
    B.rect(CM.paper, tr.x0 - 5, tr.top - 8, w + 10, 11);
    B.rect(NT.troughShade, tr.x1 - 18, tr.top + 3, 18, tr.base - tr.top - 3);
    B.rect(NT.troughShade, tr.x0, tr.base - 9, w, 9);
    B.rect(NT.soil, tr.x0 + 4, tr.top - 13, w - 8, 6);
    B.ink(lineD([[tr.x0 - 5, tr.base], [tr.x0 - 5, tr.top - 8], [tr.x1 + 5, tr.top - 8], [tr.x1 + 5, tr.base]]), 3.4, CM.ink, 0.18);
    B.ink(lineD([[tr.x0 + 6, tr.top + 3], [tr.x1 - 8, tr.top + 3]]), 1.6, CM.ink, 0.3);
    B.ink(lineD([[tr.x0 + 6, tr.top + 35], [tr.x1 - 22, tr.top + 35]]), 1.6, NT.troughShade, 0.4);
  }
  return B;
};

/** Daffodils in the troughs: leaf blades, stems, trumpet heads facing the sun (left); they nod (12 drawings/s). */
const Daffodils: React.FC<{t: number}> = ({t}) => {
  const td = Math.floor(t * 12) / 12;
  const lv = useMemo(() => {
    const out: {x: number; base: number; hgt: number; white: boolean; ph: number; leanL: boolean}[] = [];
    for (const tr of TROUGHS) {
      const r = rng(`${tr.seed}/daff`);
      for (let x = tr.x0 + 12; x < tr.x1 - 10; x += r.range(12, 18)) out.push({x, base: tr.top - 10, hgt: r.range(40, 64), white: r.chance(0.28), ph: r.range(0, 6.28), leanL: r.chance(0.5)});
    }
    return out;
  }, []);
  let stems = '';
  let blades = '';
  let bladesS = '';
  let petY = '';
  let petW = '';
  let trumpet = '';
  for (const f of lv) {
    const sw = Math.sin(td * 1.6 + f.ph) * 2.8 + Math.sin(td * 0.7 + f.ph * 2) * 1.4;
    const hx = f.x + sw;
    const hy = f.base - f.hgt;
    stems += `M${f1(f.x)} ${f.base}Q${f1(f.x + sw * 0.4)} ${f1(f.base - f.hgt * 0.5)} ${f1(hx)} ${f1(hy + 4)}`;
    const s = f.leanL ? -1 : 1;
    const bl = `M${f1(f.x - 2.5)} ${f.base}Q${f1(f.x + s * 9)} ${f1(f.base - f.hgt * 0.5)} ${f1(f.x + s * 6)} ${f1(f.base - f.hgt * 0.78)}Q${f1(f.x + s * 2)} ${f1(f.base - f.hgt * 0.4)} ${f1(f.x + 2.5)} ${f.base}Z`;
    if (f.leanL) bladesS += bl;
    else blades += bl;
    // six petals as a star (flat) + the trumpet pointing left (toward the sun)
    let star = '';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      star += ellD(hx + Math.cos(a) * 5.5, hy + Math.sin(a) * 4.5, 4.2, 2.6);
    }
    if (f.white) petW += star;
    else petY += star;
    trumpet += `M${f1(hx + 1)} ${f1(hy - 3)}L${f1(hx - 8)} ${f1(hy - 4.5)}L${f1(hx - 8)} ${f1(hy + 4.5)}L${f1(hx + 1)} ${f1(hy + 3)}Z`;
  }
  return (
    <>
      <path d={bladesS} fill={LEAF.shade} />
      <path d={stems} stroke={LEAF.stem} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d={blades} fill={LEAF.body} />
      <path d={petY} fill={mix(CM.coatMustard, CM.lamp, 0.5)} />
      <path d={petW} fill={CM.paper} />
      <path d={trumpet} fill={CM.leafGold} />
    </>
  );
};

// ---------------------------------------------------------------- pigeons

type Pig = {x: number; y: number; dir: 1 | -1; flutter?: {at: number; dx: number; up: number}};
// the passer-by reaches ~160 px left of each startled pigeon at about these times (see passerX)
const PIGEONS: Pig[] = [
  {x: 262, y: 1700, dir: 1, flutter: {at: 1.6, dx: 200, up: 104}},
  {x: 336, y: 1726, dir: -1, flutter: {at: 1.89, dx: 170, up: 90}},
  {x: 414, y: 1690, dir: 1, flutter: {at: 2.27, dx: 220, up: 116}},
  {x: 488, y: 1736, dir: -1},
  {x: 584, y: 1704, dir: 1},
  {x: 672, y: 1738, dir: -1},
];
const PIG_S = 60;

/** One pigeon (side view, facing `dir`), feet at (x, y). peck 0..1 (head down), fly 0..1 (wings open), flap phase. */
const pigeonInto = (B: Batch, x: number, y: number, dir: 1 | -1, s: number, peck: number, fly: number, flap: number, gy: number) => {
  const X = (u: number) => x + dir * u * s;
  const Y = (v: number) => y - v * s;
  // ground shadow (stays on the ground while it flies)
  B.fill(NT.shadowSoft, ellD(x + s * 0.16, gy + 2, s * 0.42 * (1 - fly * 0.4), s * 0.07));
  // tail, body, wing, neck, head
  B.poly(NT.pigeonWing, [[X(-0.3), Y(0.36)], [X(-0.72), Y(0.42 + fly * 0.1)], [X(-0.7), Y(0.3 + fly * 0.1)], [X(-0.28), Y(0.24)]]);
  const body = smoothClosed([
    [X(0.3), Y(0.62)],
    [X(0.42), Y(0.4)],
    [X(0.24), Y(0.16)],
    [X(-0.12), Y(0.14)],
    [X(-0.42), Y(0.3)],
    [X(-0.14), Y(0.5)],
  ]);
  B.fill(NT.pigeon, body);
  B.fill(NT.pigeonLit, ellD(X(0.22), Y(0.36), s * 0.14, s * 0.1));
  const hx = X(0.38 + peck * 0.16);
  const hy = Y(0.74 - peck * 0.5);
  B.poly(NT.pigeonNeck, [[X(0.18), Y(0.52)], [hx - dir * s * 0.06, hy + s * 0.04], [hx + dir * s * 0.05, hy + s * 0.08], [X(0.38), Y(0.44)]]);
  B.fill(NT.pigeonHead, circleD(hx, hy, s * 0.11));
  B.poly(mix(CM.box, CM.paper, 0.3), [[hx + dir * s * 0.09, hy - s * 0.02], [hx + dir * s * 0.2, hy + s * 0.03], [hx + dir * s * 0.09, hy + s * 0.05]]);
  if (fly > 0.05) {
    // two wings beating ~8 Hz, raised over the back
    const up = Math.cos(flap * Math.PI * 2);
    for (const side of [0, 1]) {
      const k = side ? 0.82 : 1;
      B.poly(side ? NT.pigeonWing : mix(NT.pigeonWing, CM.paper, 0.25), [
        [X(0.18), Y(0.5)],
        [X(-0.34 + side * 0.08), Y(0.5 + up * 0.62 * k * fly)],
        [X(-0.6 + side * 0.06), Y(0.44 + up * 0.5 * k * fly)],
        [X(-0.1), Y(0.4)],
      ]);
    }
  } else {
    B.fill(NT.pigeonWing, ellD(X(-0.1), Y(0.38), s * 0.26, s * 0.12));
    B.ink(lineD([[X(-0.16), Y(0.34)], [X(-0.02), Y(0.36)]]), 2.2, NT.pigeonBar);
    B.ink(lineD([[X(-0.22), Y(0.4)], [X(-0.06), Y(0.42)]]), 2.2, NT.pigeonBar);
    B.ink(`M${f1(X(0.04))} ${f1(Y(0.15))}v${f1(s * 0.15)}M${f1(X(0.14))} ${f1(Y(0.15))}v${f1(s * 0.15)}`, 2.2, NT.pigeonLeg);
  }
  B.ink(lineD([[X(-0.42), Y(0.3)], [X(-0.14), Y(0.5)], [X(0.18), Y(0.56)]]), 2.2, CM.ink, 0.2);
  B.fill(CM.ink, circleD(hx + dir * s * 0.04, hy - s * 0.02, 1.6));
};

const Pigeons: React.FC<{t: number}> = ({t}) => {
  const td = Math.floor(t * 24) / 24;
  const B = new Batch();
  PIGEONS.forEach((p, i) => {
    const ph = rand('s6pig', `p${i}`) * 6;
    // walking: a slow wander with the head bobbing at each step; pecking in between
    const wander = Math.sin((td + ph) * 0.8) * 14;
    let x = p.x + wander;
    let y = p.y;
    const pk = Math.sin((td + ph) * 4.6);
    let peck = pk > 0.55 ? (pk - 0.55) / 0.45 : 0;
    let fly = 0;
    let dir = Math.cos((td + ph) * 0.8) >= 0 ? p.dir : (-p.dir as 1 | -1);
    let gy = y;
    if (p.flutter && t >= p.flutter.at) {
      const f = p.flutter;
      const k = Math.min(1, (t - f.at) / 0.66);
      const x0 = p.x + Math.sin((f.at + ph) * 0.8) * 14;
      x = x0 + f.dx * smooth(k);
      y = p.y - f.up * 4 * k * (1 - k);
      gy = p.y;
      fly = k < 0.94 ? Math.min(1, k / 0.08) : 0;
      peck = 0;
      dir = 1;
    }
    pigeonInto(B, x, y, dir, PIG_S, peck, fly, t * 8.5 + i * 0.37, gy);
  });
  return <Paint b={B} seed="s6pigeons" misreg={2} />;
};

// ---------------------------------------------------------------- the readers and the passer-by

/** Each near back's shoulder width = 0.84 x hv x broad: hv <= 150 with broad <= 1.1 keeps it <= ~139 px. */
export const READERS = [
  {x: 152, hv: 146, seed: 's6/reader1', traits: {hair: 'bun' as const, hairColor: CM.hair[1], coat: CM.coatOat, acc: 'scarf' as const, accColor: CM.coatMustard, broad: 1.0}},
  {x: 402, hv: 140, seed: 's6/reader2', traits: {hair: 'curls' as const, hairColor: CM.hair[4], coat: CM.brick, acc: 'tote' as const, accColor: CM.paper, broad: 1.04}},
  {x: 652, hv: 150, seed: 's6/reader3', traits: {hair: 'beanie' as const, hatColor: CM.coatMustard, hairColor: CM.hair[0], coat: CM.coatSlate, acc: 'backpack' as const, accColor: CM.leafRust, broad: 1.06}},
];
export const PASSER = {hv: 124, broad: 1.02};
export const nearBackW = (hv: number, broad: number) => 0.84 * hv * broad;

/** The passer-by (a head-back walking right behind the readers), screen x at t (or null). */
export const passerX = (t: number) => (t < 0.3 ? null : -110 + 262 * (t - 0.3));

export const S6Readers: React.FC = () => {
  const t = useTime();
  const nr = dxOf(DRIFT.near, t);
  const turn2 = t < 1.5 ? 0 : t < 1.75 ? -0.9 * smooth((t - 1.5) / 0.25) : t < 2.3 ? -0.9 : -0.9 * (1 - smooth((t - 2.3) / 0.3));
  const px = passerX(t);
  const bob = (k: number) => Math.round(Math.sin(t * 1.9 + k) * 1.2 * 2) / 2;
  return (
    <>
      {px !== null && px < 1200 ? (
        <NearBack x={px - nr} y={1924 - Math.abs(Math.sin(t * 9.4)) * 4} hv={PASSER.hv} seed="s6/passer" traits={{hair: 'short', hairColor: CM.hair[2], coat: CM.sage, acc: 'headphones', accColor: CM.anchor, broad: PASSER.broad}} />
      ) : null}
      {READERS.map((r, i) => (
        <NearBack key={r.seed} x={r.x} y={1920 + bob(i * 2.1)} hv={r.hv} seed={r.seed} traits={r.traits} turn={i === 1 ? turn2 : 0} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- everything on the near plane (near coords)

/** Behind the tulip border: the paving overlay, the troughs and their daffodils, the bench reader. */
export const S6NearBack: React.FC = () => {
  const t = useTime();
  const paving = useMemo(pavingBatch, []);
  const troughs = useMemo(troughBatch, []);
  // the kit's bench backrest, redrawn over the reader (same geometry, layer index and seed as GateNear: exact overlay)
  const backrest = useMemo(() => {
    const B = new Batch();
    for (let i = 0; i < 4; i++) B.layer();
    benchBack(B, 860, 1110, 1310, 1420, 4.8);
    return B;
  }, []);
  return (
    <>
      <Paint b={paving} seed="s6paving" misreg={2} />
      <Paint b={troughs} seed="s6troughs" misreg={3} />
      <Daffodils t={t} />
      <Seated x={985} y={1367} h={104} seed="s6/benchReader2" read traits={{coat: CM.brickLight, hair: 'long', hairColor: CM.hair[0], acc: 'none'}} />
      <Paint b={backrest} seed="near" misreg={3} />
    </>
  );
};

/** In front of the tulip border: the pigeons. */
export const S6NearFront: React.FC = () => {
  const t = useTime();
  return <Pigeons t={t} />;
};
