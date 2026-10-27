// V2S6_near.tsx (lane L5): S6's near plane on top of the kit's GateNear (kerb, paving, bollards + chain, the flowering
// shrub, the bench + bike rack in the rail). NEAR-plane coordinates (the gate's near group drifts +65 px/s); nothing
// here ever rises above y 1250, so the near plane can slide under the deal board without crossing its lettering.
//   paving    setts along the kerb, slab tone patches and joints in the free areas, petal litter, a drain grate
//   troughs   two stone troughs of tulips behind the chain (the heads nod), with flat shadows (the sun is left)
//   bin       a park bin in front of the shrub
//   bench     a reader at rest on the kit's bench (a newspaper, no masthead), its backrest redrawn over them
//   pigeons   six pecking on the paving; three flutter up and away (right) as the passer-by comes past (~2.2)
//   readers   three head-backs cut by the bottom (hv <= 150: <= ~140 px at the shoulders), the middle one turns to
//             her neighbour 1.5-2.3; one passer-by's head-back crosses behind them left -> right (0.9-4.06)
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {rand, rng} from '../../lib/rng';
import {NearBack, Seated} from '../kit/cast';
import {Batch, Paint, mix, ellD, circleD, lineD, smoothClosed, type Pt} from '../kit/dc/core';
import {benchBack} from '../kit/dc/terrace';
import {GT, GATE} from '../kit/dc/gate';
import {DRIFT, dxOf} from './V2S6_rig';

const smooth = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};

const NT = {
  sett: mix(CM.paving, CM.stoneShade, 0.3),
  settLit: mix(CM.paving, CM.paper, 0.35),
  settJoint: mix(CM.paving, CM.line, 0.5),
  slabLit: mix(CM.paving, CM.paper, 0.32),
  slabWorn: mix(CM.paving, CM.brickLight, 0.22),
  slabCool: mix(CM.paving, CM.stoneShade, 0.28),
  joint: mix(CM.paving, CM.line, 0.42),
  shadow: mix(CM.paving, CM.shadeWarm, 0.42),
  shadowSoft: mix(CM.paving, CM.shadeWarm, 0.24),
  petal: CM.blossom,
  petalShade: mix(CM.blossom, CM.shadeWarm, 0.25),
  trough: CM.limestone,
  troughLit: CM.paper,
  troughShade: mix(CM.stoneShade, CM.shadeWarm, 0.2),
  soil: mix(CM.brickDeep, CM.anchor, 0.38),
  leaf: CM.sage,
  leafShade: mix(CM.sage, CM.shadeCool, 0.3),
  bin: mix(CM.sage, CM.anchor, 0.42),
  binLit: mix(CM.sage, CM.anchor, 0.18),
  binRim: mix(CM.anchor, CM.sage, 0.2),
  grate: mix(CM.anchor, CM.paving, 0.35),
  pigeon: mix(CM.stoneShade, CM.paneUnlit, 0.35),
  pigeonHead: CM.paneUnlit,
  pigeonBar: CM.paper,
  pigeonLeg: CM.brickDeep,
};
const TULIPS = [CM.box, CM.blossom, CM.coatMustard, CM.paper, CM.brick];

// ---------------------------------------------------------------- free areas (near coords): the kit's near objects

const BOLLARDS = [-460, -130, 200, 530, 860, 1190];
/** Rects the overlays keep off (the kit's bollards, shrub, bench, rack + bike). */
const KEEP_OFF: [number, number, number, number][] = [
  ...BOLLARDS.map((x) => [x - 26, 1396, x + 26, 1508] as [number, number, number, number]),
  [-300, 1250, 150, 1490],
  [850, 1300, 1120, 1430],
  [780, 1470, 1050, 1580],
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
      if (r.chance(0.32)) B.rect(r.pick([NT.slabLit, NT.slabWorn, NT.slabCool]), x + 2, y0 + 2, ww - 4, y1 - y0 - 4);
      // a vertical joint (leaning toward the vanishing point at x 540)
      const lean = (x - 540) * 0.06;
      B.ink(lineD([[x, y0 + 1], [x + lean * 0.3, y1 - 1]]), y0 > 1500 ? 2.2 : 1.6, NT.joint, 0.3);
    }
    if (free(150, y0 - 2, 760, y0 + 2) || i > 3) B.ink(lineD([[-300 + r.range(0, 80), y0], [1130, y0 + r.range(-1.5, 1.5)]]), y0 > 1500 ? 2.2 : 1.6, NT.joint, 0.45);
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
  for (let i = 0; i < 150; i++) {
    const x = r.range(-280, 1120);
    const y = r.range(1300, 1900);
    if (free(x - 8, y - 4, x + 8, y + 4)) add(x, y, r.range(4.5, 9));
  }
  for (const bx of BOLLARDS) for (let i = 0; i < 7; i++) add(bx + 30 + r.range(-6, 40), 1506 + r.range(-3, 6), r.range(5, 8));
  B.fill(NT.petal, pa);
  B.fill(NT.petalShade, pb);
  B.layer();
  // flat shadows to the right of the kit's bollards and the bench (short: <= ~40 px past them)
  for (const bx of BOLLARDS) B.poly(NT.shadow, [[bx + 20, 1504], [bx + 20, 1484], [bx + 52, 1500], [bx + 50, 1510]]);
  B.poly(NT.shadow, [[1110, 1420], [1110, 1330], [1146, 1350], [1150, 1426]]);
  return B;
};

// ---------------------------------------------------------------- troughs of tulips (nodding heads)

type Trough = {x0: number; x1: number; top: number; base: number; seed: string};
const TROUGHS: Trough[] = [
  {x0: 236, x1: 494, top: 1332, base: 1396, seed: 'trA'},
  {x0: 566, x1: 826, top: 1334, base: 1398, seed: 'trB'},
];

const troughBatch = (): Batch => {
  const B = new Batch();
  for (const tr of TROUGHS) {
    const w = tr.x1 - tr.x0;
    B.poly(NT.shadow, [[tr.x1, tr.base], [tr.x1, tr.top + 8], [tr.x1 + 34, tr.top + 22], [tr.x1 + 38, tr.base + 6]]);
    B.rect(NT.trough, tr.x0, tr.top, w, tr.base - tr.top);
    B.rect(NT.troughLit, tr.x0 - 4, tr.top - 8, w + 8, 10);
    B.rect(NT.troughShade, tr.x1 - 16, tr.top + 2, 16, tr.base - tr.top - 2);
    B.rect(NT.troughShade, tr.x0, tr.base - 8, w, 8);
    B.rect(NT.soil, tr.x0 + 4, tr.top - 12, w - 8, 6);
    B.ink(lineD([[tr.x0 - 4, tr.base], [tr.x0 - 4, tr.top - 8], [tr.x1 + 4, tr.top - 8], [tr.x1 + 4, tr.base]]), 3.4, CM.ink, 0.18);
    B.ink(lineD([[tr.x0 + 8, tr.top + 2], [tr.x1 - 8, tr.top + 2]]), 1.6, CM.ink, 0.3);
  }
  return B;
};

/** Tulip stems and heads, swaying (each head nods about its stem base; 12 drawings/s like the people). */
const TulipRows: React.FC<{t: number}> = ({t}) => {
  const td = Math.floor(t * 12) / 12;
  const lv = useMemo(() => {
    const out: {x: number; base: number; hgt: number; col: string; ph: number; leanL: boolean}[] = [];
    for (const tr of TROUGHS) {
      const r = rng(tr.seed);
      for (let x = tr.x0 + 12; x < tr.x1 - 10; x += r.range(13, 19)) out.push({x, base: tr.top - 10, hgt: r.range(34, 58), col: r.pick(TULIPS), ph: r.range(0, 6.28), leanL: r.chance(0.5)});
    }
    return out;
  }, []);
  let stems = '';
  let leaves = '';
  let leavesS = '';
  const heads = new Map<string, string>();
  for (const f of lv) {
    const sw = Math.sin(td * 1.7 + f.ph) * 3.2 + Math.sin(td * 0.7 + f.ph * 2) * 1.6;
    const hx = f.x + sw;
    const hy = f.base - f.hgt + Math.abs(sw) * 0.12;
    stems += `M${f.x.toFixed(1)} ${f.base}Q${(f.x + sw * 0.4).toFixed(1)} ${(f.base - f.hgt * 0.5).toFixed(1)} ${hx.toFixed(1)} ${(hy + 6).toFixed(1)}`;
    const s = f.leanL ? -1 : 1;
    const lf = `M${(f.x - 3).toFixed(1)} ${f.base}Q${(f.x + s * 14).toFixed(1)} ${(f.base - f.hgt * 0.42).toFixed(1)} ${(f.x + s * 9).toFixed(1)} ${(f.base - f.hgt * 0.62).toFixed(1)}Q${(f.x + s * 4).toFixed(1)} ${(f.base - f.hgt * 0.3).toFixed(1)} ${(f.x + 3).toFixed(1)} ${f.base}Z`;
    if (f.leanL) leavesS += lf;
    else leaves += lf;
    // a cup: two petals and a notch
    const hd = `M${(hx - 6.5).toFixed(1)} ${(hy - 6).toFixed(1)}L${(hx - 3).toFixed(1)} ${(hy - 2.5).toFixed(1)}L${hx.toFixed(1)} ${(hy - 7.5).toFixed(1)}L${(hx + 3).toFixed(1)} ${(hy - 2.5).toFixed(1)}L${(hx + 6.5).toFixed(1)} ${(hy - 6).toFixed(1)}Q${(hx + 6.5).toFixed(1)} ${(hy + 7).toFixed(1)} ${hx.toFixed(1)} ${(hy + 7).toFixed(1)}Q${(hx - 6.5).toFixed(1)} ${(hy + 7).toFixed(1)} ${(hx - 6.5).toFixed(1)} ${(hy - 6).toFixed(1)}Z`;
    heads.set(f.col, (heads.get(f.col) ?? '') + hd);
  }
  return (
    <>
      <path d={leavesS} fill={NT.leafShade} />
      <path d={stems} stroke={mix(CM.sage, CM.shadeCool, 0.45)} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d={leaves} fill={NT.leaf} />
      {[...heads.entries()].map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the bin

const binBatch = (): Batch => {
  const B = new Batch();
  const x = 92;
  const top = 1478;
  const base = 1608;
  const w = 74;
  B.poly(NT.shadow, [[x + w / 2, base], [x + w / 2, top + 30], [x + w / 2 + 34, top + 46], [x + w / 2 + 38, base + 6]]);
  B.fill(NT.bin, `M${x - w / 2} ${top + 14}V${base - 6}Q${x} ${base + 6} ${x + w / 2} ${base - 6}V${top + 14}Z`);
  B.rect(NT.binLit, x - w / 2 + 6, top + 18, 12, base - top - 30);
  B.rect(NT.binRim, x - w / 2 - 3, top + 8, w + 6, 12);
  B.fill(NT.binRim, `M${x - w / 2 + 4} ${top + 9}Q${x} ${top - 16} ${x + w / 2 - 4} ${top + 9}Z`);
  B.rect(NT.binRim, x - w / 2, top + 64, w, 6);
  B.ink(lineD([[x - w / 2, base - 6], [x - w / 2, top + 14]]), 3.4, CM.ink);
  B.ink(lineD([[x + w / 2, top + 14], [x + w / 2, base - 6]]), 3.4, CM.ink, 0.2);
  B.ink(`M${x - w / 2 + 4} ${top + 8}Q${x} ${top - 17} ${x + w / 2 - 4} ${top + 8}`, 3.4, CM.ink, 0.25);
  return B;
};

// ---------------------------------------------------------------- pigeons

type Pig = {x: number; y: number; dir: 1 | -1; flutter?: {at: number; dx: number; up: number}};
// the passer-by reaches ~160 px left of each startled pigeon at (x - 160 + 188.6) / 197 s (see passerX)
const PIGEONS: Pig[] = [
  {x: 286, y: 1612, dir: 1, flutter: {at: 1.6, dx: 190, up: 96}},
  {x: 344, y: 1640, dir: -1, flutter: {at: 1.89, dx: 160, up: 82}},
  {x: 418, y: 1598, dir: 1, flutter: {at: 2.27, dx: 210, up: 110}},
  {x: 478, y: 1664, dir: -1},
  {x: 566, y: 1626, dir: 1},
  {x: 640, y: 1676, dir: -1},
];
const PIG_S = 54;

const pigeonInto = (B: Batch, wing: string[], x: number, y: number, dir: 1 | -1, s: number, peck: number, flying: number, flap: number) => {
  const by = y - (flying > 0 ? 0 : 0);
  B.fill(NT.shadowSoft, ellD(x + s * 0.18 + flying * 30, y + s * 0.05 + flying * 90, s * 0.46 * (1 - flying * 0.5), s * 0.1));
  B.fill(NT.pigeon, smoothClosed([
    [x + dir * s * 0.34, by - s * 0.5],
    [x + dir * s * 0.46, by - s * 0.3],
    [x + dir * s * 0.2, by - s * 0.1],
    [x - dir * s * 0.3, by - s * 0.16],
    [x - dir * s * 0.62, by - s * 0.3],
    [x - dir * s * 0.3, by - s * 0.42],
  ]));
  B.fill(NT.pigeonHead, circleD(x + dir * s * 0.44, by - s * 0.62 + peck, s * 0.13));
  B.fill(NT.pigeonBar, ellD(x - dir * s * 0.04, by - s * 0.34, s * 0.2, s * 0.06));
  if (flying > 0.05) {
    // two wings beating (8 Hz): up / down triangles
    const up = Math.cos(flap * Math.PI * 2);
    for (const side of [-1, 1]) {
      const tipX = x - dir * s * 0.1 + side * s * 0.06;
      wing.push(`M${(x - dir * s * 0.2).toFixed(1)} ${(by - s * 0.38).toFixed(1)}L${(tipX - dir * s * 0.3).toFixed(1)} ${(by - s * 0.38 - up * s * 0.55 * (side > 0 ? 1 : 0.8)).toFixed(1)}L${(x + dir * s * 0.12).toFixed(1)} ${(by - s * 0.34).toFixed(1)}Z`);
    }
  } else {
    B.ink(`M${x} ${y - s * 0.12}v${s * 0.12}M${x + dir * s * 0.1} ${y - s * 0.12}v${s * 0.12}`, 1.2, NT.pigeonLeg);
  }
};

const Pigeons: React.FC<{t: number}> = ({t}) => {
  const td = Math.floor(t * 24) / 24;
  const B = new Batch();
  const wings: string[] = [];
  PIGEONS.forEach((p, i) => {
    const ph = rand('s6pig', `p${i}`) * 6;
    let x = p.x + Math.sin((td + ph) * 0.7) * 6;
    let y = p.y;
    let peck = Math.max(0, Math.sin((td + ph) * 5.4)) * PIG_S * 0.24;
    let flying = 0;
    let dir = p.dir;
    if (p.flutter && t >= p.flutter.at) {
      const f = p.flutter;
      const k = Math.min(1, (t - f.at) / 0.62);
      const e = smooth(k);
      x = p.x + Math.sin((f.at + ph) * 0.7) * 6 + f.dx * e;
      y = p.y - f.up * 4 * k * (1 - k);
      flying = k < 1 ? 1 : 0;
      peck = flying ? 0 : peck;
      dir = 1;
    }
    pigeonInto(B, wings, x, y, dir, PIG_S, peck, flying, t * 8 + i * 0.3);
  });
  return (
    <>
      <Paint b={B} seed="s6pigeons" misreg={2} />
      <path d={wings.join('')} fill={mix(NT.pigeon, CM.paper, 0.18)} stroke={CM.ink} strokeWidth={1.4} strokeLinejoin="round" />
    </>
  );
};

// ---------------------------------------------------------------- the readers and the passer-by

/** Each near back's shoulder width = 0.84 x hv x broad: hv <= 150 with broad <= 1.1 keeps it <= ~139 px. */
const READERS = [
  {x: 152, hv: 146, seed: 's6/reader1', traits: {hair: 'bun' as const, hairColor: CM.hair[1], coat: CM.coatOat, acc: 'scarf' as const, accColor: CM.coatMustard, broad: 1.0}},
  {x: 402, hv: 140, seed: 's6/reader2', traits: {hair: 'curls' as const, hairColor: CM.hair[4], coat: CM.brick, acc: 'tote' as const, accColor: CM.paper, broad: 1.04}},
  {x: 652, hv: 150, seed: 's6/reader3', traits: {hair: 'beanie' as const, hatColor: CM.coatMustard, hairColor: CM.hair[0], coat: CM.coatSlate, acc: 'backpack' as const, accColor: CM.leafRust, broad: 1.06}},
];
export const NEAR_BACK_W = (hv: number, broad: number) => 0.84 * hv * broad;

/** The passer-by (a head-back walking right behind the readers), screen x at t (or null). */
const passerX = (t: number) => (t < 0.3 ? null : -110 + 262 * (t - 0.3));

export const S6Readers: React.FC = () => {
  const t = useTime();
  const nr = dxOf(DRIFT.near, t);
  const turn2 = t < 1.5 ? 0 : t < 1.75 ? -0.9 * smooth((t - 1.5) / 0.25) : t < 2.3 ? -0.9 : -0.9 * (1 - smooth((t - 2.3) / 0.3));
  const px = passerX(t);
  const bob = (k: number) => Math.round(Math.sin(t * 1.9 + k) * 1.2 * 2) / 2;
  return (
    <>
      {px !== null && px < 1200 ? (
        <NearBack x={px - nr} y={1920 + Math.abs(Math.sin(t * 9.4)) * -4 + 4} hv={124} seed="s6/passer" traits={{hair: 'short', hairColor: CM.hair[2], coat: CM.sage, acc: 'headphones', accColor: CM.anchor, broad: 1.02}} />
      ) : null}
      {READERS.map((r, i) => (
        <NearBack key={r.seed} x={r.x} y={1920 + bob(i * 2.1)} hv={r.hv} seed={r.seed} traits={r.traits} turn={i === 1 ? turn2 : 0} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- everything on the near plane (near coords)

export const S6Near: React.FC = () => {
  const t = useTime();
  const paving = useMemo(pavingBatch, []);
  const troughs = useMemo(troughBatch, []);
  const bin = useMemo(binBatch, []);
  // the kit's bench backrest, redrawn over the reader (same geometry, layer index and seed as GateNear: exact overlay)
  const backrest = useMemo(() => {
    const B = new Batch();
    for (let i = 0; i < 4; i++) B.layer();
    benchBack(B, 860, 1110, 1310, 1420, 4.8);
    return B;
  }, []);
  // the passer-by startles the pigeons: they flutter when it is close (times are in PIGEONS)
  return (
    <>
      <Paint b={paving} seed="s6paving" misreg={2} />
      <Paint b={troughs} seed="s6troughs" misreg={3} />
      <TulipRows t={t} />
      <Paint b={bin} seed="s6bin" misreg={3} />
      <Seated x={985} y={1367} h={104} seed="s6/benchReader2" read traits={{coat: CM.brickLight, hair: 'long', hairColor: CM.hair[0], acc: 'none'}} />
      <Paint b={backrest} seed="near" misreg={3} />
      <Pigeons t={t} />
    </>
  );
};

export type {Pt};
void GT;
