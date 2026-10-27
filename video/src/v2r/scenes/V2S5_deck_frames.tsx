// V2S5_deck_frames.tsx (lane L4, TERRACE): the end frame's NEAR FRAMES and the wipe, END coords.
//   TerraceTree5   the LEFT frame: a blossoming cherry on the terrace, trunk + roots cut by the bottom-left, crown
//                  x <= ~300 and top >= 642, BACKLIT (the darkest swatches: plum mass, shade clumps; blossom lit only on
//                  the rim toward the sun, upper right). Its box (TREE5_BOX) slides it in from the left late in the move.
//   RightFrame5    the RIGHT frame: the terrace lamppost (base cut by the bottom-right, a hanging basket that nods) in
//                  front of a blossoming corner crown cut by the right edge and the bottom.
//   LampPost5      the terrace's lamppost family (cast iron, an unlit lantern: April morning), base at (0, 0); with
//                  `baskets` the WIPE prop: two hanging flower baskets, a ~460 px mass at the backs' height.
//   NearPetals5    screen-space petals near the lens, born below y 620, never over the subjects.
// Crowns are forked from kit/dc/bloom.tsx (same build: mass, ink limbs, clumps, flowers) with backlit tones.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, mix, crownD, ellD, lineD, polyD, rng, rand, frac, blossomD, burstScale, circleD, smoothClosed, type Pt} from '../kit/dc/core';
import type {PullBox} from '../kit/dc/crane';
import {DT} from './V2S5_deck_cam';

// ---------------------------------------------------------------- backlit blossom crowns (forked from kit bloom.tsx)

export type Tones5 = {base: string; limb: string; shade: string; mid: string; lit: string; flower: string; flowerShade: string; white: string; bud: string};
/** Near cherries seen against the light: plum mass and shade clumps dominate, blossom lit on the rim toward the sun. */
export const BACKLIT: Tones5 = {
  base: mix(CM.shadeWarm, CM.anchor, 0.62),
  limb: CM.anchor,
  shade: mix(CM.shadeWarm, CM.anchor, 0.3),
  mid: mix(CM.shadeWarm, CM.blossom, 0.3),
  lit: mix(CM.blossom, CM.brickLight, 0.14),
  flower: CM.blossom,
  flowerShade: mix(CM.blossom, CM.shadeWarm, 0.42),
  white: CM.paper,
  bud: mix(CM.leafRust, CM.shadeWarm, 0.25),
};

export type Crown5 = {cx: number; cy: number; rx: number; ry: number; seed: string; light: Pt; bloom?: number; limbs?: boolean; ink?: number; litK?: number};
type Clump = {x: number; y: number; rx: number; ry: number; col: string; seed: string; i: number};
type Flower = {x: number; y: number; r: number; col: string; i: number};

function layout(c: Crown5, T: Tones5) {
  const r = rng(`${c.seed}/bloom5`);
  const base = crownD(c.cx, c.cy, c.rx, c.ry, `${c.seed}/b`, Math.max(7, Math.round(c.rx / 18)), 0.28);
  let limbs = '';
  let twigs = '';
  const n = c.rx > 120 ? 5 : c.rx > 60 ? 4 : 3;
  const root: Pt = [c.cx + r.range(-0.05, 0.05) * c.rx, c.cy + c.ry * 0.95];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + ((k - (n - 1) / 2) / n) * 2.3 + r.range(-0.15, 0.15);
    const end: Pt = [c.cx + Math.cos(a) * c.rx * 0.74, c.cy + Math.sin(a) * c.ry * 0.74];
    const mid: Pt = [(root[0] + end[0]) / 2 + r.range(-0.12, 0.12) * c.rx, (root[1] + end[1]) / 2];
    limbs += `M${root[0].toFixed(1)} ${root[1].toFixed(1)}Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
    for (let j = 0; j < 3; j++) {
      const b = a + r.range(-0.55, 0.55);
      const len = r.range(0.25, 0.42);
      twigs += `M${end[0].toFixed(1)} ${end[1].toFixed(1)}L${(end[0] + Math.cos(b) * c.rx * len).toFixed(1)} ${(end[1] + Math.sin(b) * c.ry * len).toFixed(1)}`;
    }
  }
  const clumps: Clump[] = [];
  const nc = Math.max(6, Math.round(((c.rx * c.ry) / 1300) * (c.bloom ?? 0.8)));
  const litK = c.litK ?? 0.5;
  for (let i = 0; i < nc; i++) {
    const a = r.range(0, Math.PI * 2);
    const d = Math.sqrt(r.next()) * 0.84;
    const x = c.cx + Math.cos(a) * c.rx * d;
    const y = c.cy + Math.sin(a) * c.ry * d * 0.92;
    const side = (Math.cos(a) * c.light[0] + Math.sin(a) * c.light[1]) * d;
    const col = side > litK ? T.lit : side > 0.05 ? T.mid : T.shade;
    const s = r.range(0.15, 0.27);
    clumps.push({x, y, rx: c.rx * s, ry: c.ry * s * 0.8, col, seed: `${c.seed}/c${i}`, i});
  }
  clumps.sort((p, q) => (p.x - c.cx) * c.light[0] + (p.y - c.cy) * c.light[1] - ((q.x - c.cx) * c.light[0] + (q.y - c.cy) * c.light[1]));
  const flowers: Flower[] = [];
  const nf = Math.round(((c.rx * c.ry) / 380) * (c.bloom ?? 0.8));
  for (let i = 0; i < nf; i++) {
    const a = r.range(0, Math.PI * 2);
    const d = Math.sqrt(r.next()) * 0.94;
    const side = (Math.cos(a) * c.light[0] + Math.sin(a) * c.light[1]) * d;
    const col = side > 0.6 && r.chance(0.4) ? T.white : side > 0.2 ? T.flower : T.flowerShade;
    flowers.push({x: c.cx + Math.cos(a) * c.rx * d, y: c.cy + Math.sin(a) * c.ry * d * 0.9, r: Math.max(3, Math.min(13, c.rx * r.range(0.045, 0.085))), col, i: i + nc});
  }
  return {base, limbs, twigs, clumps, flowers};
}

export const Crowns5: React.FC<{crowns: Crown5[]; tones?: Tones5; burstAt?: number; seed: string; misreg?: number}> = ({crowns, tones = BACKLIT, burstAt, seed, misreg = 3}) => {
  const t = useTime();
  const L = useMemo(() => crowns.map((c) => layout(c, tones)), [crowns, tones]);
  const build = (scaleOf: (i: number) => number) => {
    const B = new Batch();
    crowns.forEach((c, k) => {
      const l = L[k];
      B.layer();
      B.fill(tones.base, l.base);
      if (c.limbs !== false) {
        const w = c.ink ?? Math.max(2.2, Math.min(5, c.rx / 30));
        B.ink(l.limbs, w, tones.limb);
        B.ink(l.twigs, w * 0.55, tones.limb);
      }
      B.layer();
      let buds = '';
      for (const q of l.clumps) {
        const sc = scaleOf(q.i);
        if (sc > 0) B.fill(q.col, crownD(q.x, q.y, q.rx * sc, q.ry * sc, q.seed, 6, 0.25));
        else buds += ellD(q.x, q.y, Math.max(2, q.rx * 0.1), Math.max(1.6, q.ry * 0.09));
      }
      for (const f of l.flowers) {
        const sc = scaleOf(f.i);
        if (sc > 0) B.fill(f.col, blossomD(f.x, f.y, f.r * sc, `${seed}/f${k}/${f.i}`, 3));
      }
      if (buds) B.fill(tones.bud, buds);
    });
    return B;
  };
  const bloomed = burstAt === undefined || t >= burstAt + 0.12;
  const before = burstAt !== undefined && t < burstAt;
  const full = useMemo(() => build(() => 1), [L]);
  const bare = useMemo(() => build(() => 0), [L]);
  const b = bloomed ? full : before ? bare : build((i) => burstScale(t, burstAt, i));
  return <Paint b={b} seed={seed} misreg={misreg} />;
};

// ---------------------------------------------------------------- the terrace tree (LEFT frame)

/** The terrace tree's crown box (cut by the left edge) and trunk: crown top 642 (held by its box), x <= ~300. */
export const TREE5 = {crown: {x0: -170, x1: 300, y0: 642, y1: 1262}, trunk: {x: 64, base: 1925}};
/** Its box: the crown's top-left travels in from 520 px left of its landing, 1.3x -> 1x; the top stays at y 642. */
export const TREE5_BOX: PullBox = {from: [TREE5.crown.x0 - 520, TREE5.crown.y0], to: [TREE5.crown.x0, TREE5.crown.y0], s0: 1.3};

export const TerraceTree5: React.FC<{burstAt?: number}> = ({burstAt}) => {
  const trunk = useMemo(() => {
    const B = new Batch();
    const T = TREE5.trunk;
    const bark = CM.anchor;
    const barkLit = mix(CM.anchor, CM.brickDeep, 0.5);
    // the roots spreading over the floor, cut by both edges (the floor's own shade is the deck's: no light there)
    // roots: flared buttresses into the ground
    B.poly(bark, [[T.x - 150, 1990], [T.x - 120, 1902], [T.x - 52, 1866], [T.x - 40, 1990]]);
    B.poly(bark, [[T.x + 40, 1990], [T.x + 58, 1868], [T.x + 120, 1898], [T.x + 230, 1960], [T.x + 250, 1990]]);
    B.poly(bark, [[T.x + 110, 1990], [T.x + 150, 1934], [T.x + 260, 1932], [T.x + 330, 1990]]);
    // the trunk, leaning right, forking into two limbs under the crown
    B.poly(bark, [
      [T.x - 66, 1990],
      [T.x - 46, 1700],
      [T.x - 40, 1480],
      [T.x - 64, 1330],
      [T.x - 118, 1212],
      [T.x - 86, 1196],
      [T.x - 22, 1300],
      [T.x + 12, 1196],
      [T.x + 58, 1108],
      [T.x + 92, 1118],
      [T.x + 46, 1240],
      [T.x + 34, 1460],
      [T.x + 44, 1700],
      [T.x + 74, 1990],
    ]);
    // lit edge (right: the sun is beyond, right), a few bark marks
    B.poly(barkLit, [[T.x + 26, 1990], [T.x + 20, 1700], [T.x + 14, 1470], [T.x + 24, 1290], [T.x + 36, 1262], [T.x + 30, 1460], [T.x + 40, 1700], [T.x + 64, 1990]]);
    let marks = '';
    const r = rng('s5deck/bark');
    for (let i = 0; i < 16; i++) {
      const y = r.range(1330, 1880);
      const x = T.x + r.range(-36, 18);
      marks += lineD([[x, y], [x + r.range(8, 16), y + r.range(-2, 2)]]);
    }
    B.ink(marks, 1.6, mix(CM.anchor, CM.brickDeep, 0.3));
    B.layer();
    B.ink(lineD([[T.x - 66, 1990], [T.x - 46, 1700], [T.x - 40, 1480], [T.x - 64, 1330], [T.x - 118, 1212]]), 4.8, DT.ink, 0.1);
    B.ink(lineD([[T.x + 74, 1990], [T.x + 44, 1700], [T.x + 34, 1460], [T.x + 46, 1240], [T.x + 92, 1118]]), 4.8, DT.ink, 0.1);
    B.ink(lineD([[T.x + 40, 1990], [T.x + 58, 1868], [T.x + 120, 1898], [T.x + 230, 1960]]), 3.4, DT.ink, 0.25);
    // the tree pit's iron grille round the foot (radial bars, cut by the bottom)
    let bars = '';
    const gc: Pt = [T.x + 10, 1960];
    for (let a = -0.15; a < Math.PI + 0.15; a += 0.13) {
      bars += lineD([[gc[0] + Math.cos(a) * 150, gc[1] - Math.sin(a) * 38], [gc[0] + Math.cos(a) * 250, gc[1] - Math.sin(a) * 66]]);
    }
    B.ink(bars, 2.2, mix(CM.anchor, CM.coatPlum, 0.4), 0.15);
    B.ink(`M${gc[0] - 250} ${gc[1]}A250 66 0 0 1 ${gc[0] + 250} ${gc[1]}`, 2.6, CM.anchor);
    return B;
  }, []);
  const crowns = useMemo<Crown5[]>(() => {
    const C = TREE5.crown;
    const light: Pt = [0.8, -0.6];
    const m: [number, number, number, number, number][] = [
      [C.x0 + 110, 1100, 220, 150, 0.55],
      [C.x0 + 280, 1168, 150, 92, 0.6],
      [C.x0 + 140, 905, 245, 180, 0.45],
      [C.x0 + 345, 990, 125, 118, 0.42],
      [C.x0 + 245, 780, 190, 130, 0.4],
      [C.x0 + 395, 850, 74, 80, 0.35],
      [C.x0 + 60, 720, 150, 90, 0.45],
    ];
    return m.map(([cx, cy, rx, ry, litK], i) => ({cx, cy, rx, ry, seed: `s5deck/tree/m${i}`, light, bloom: 0.95, litK}));
  }, []);
  return (
    <>
      <Paint b={trunk} seed="s5deck/treeTrunk" misreg={3} />
      <Crowns5 crowns={crowns} burstAt={burstAt} seed="s5deck/treeBl" />
    </>
  );
};

// ---------------------------------------------------------------- lampposts (one family) + baskets

/** A hanging basket at (cx, cy) (the rim's centre; k = scale vs the 560 px reference): a wicker bowl, a lobed
 *  mound of leaves in two sage values and trailing chains of small leaves (ivy-leaved geraniums) hanging below it. */
function basketShapes(B: Batch, cx: number, cy: number, k: number, seed: string) {
  const r = rng(`s5deck/basket/${seed}`);
  B.fill(mix(CM.line, CM.brickDeep, 0.3), `M${cx - 64 * k} ${cy - 4 * k}Q${cx} ${cy + 62 * k} ${cx + 64 * k} ${cy - 4 * k}Z`);
  B.ink(`M${cx - 52 * k} ${cy + 14 * k}Q${cx} ${cy + 42 * k} ${cx + 52 * k} ${cy + 14 * k}`, Math.max(1, 1.6 * k), mix(CM.line, CM.anchor, 0.4));
  B.fill(DT.leafShade, crownD(cx, cy - 18 * k, 112 * k, 50 * k, `s5deck/bk/${seed}0`, 11, 0.12));
  B.fill(DT.leaf, crownD(cx + 14 * k, cy - 32 * k, 84 * k, 34 * k, `s5deck/bk/${seed}1`, 9, 0.15));
  // trailing chains
  let ca = '';
  let cb = '';
  for (let i = 0; i < 11; i++) {
    let x = cx + r.range(-104, 104) * k;
    let y = cy - r.range(0, 14) * k;
    const n = r.int(3, 7);
    for (let j = 0; j < n; j++) {
      const lw = r.range(8, 12) * k;
      const e = crownD(x, y, lw, lw * 0.72, `s5deck/bk/${seed}c${i}/${j}`, 5, 0.1);
      if ((i + j) % 2) ca += e;
      else cb += e;
      x += r.jitter(6) * k;
      y += r.range(9, 14) * k;
    }
  }
  B.fill(DT.leafShade, cb);
  B.fill(DT.leafWarm, ca);
}

/** A terrace lamppost, BASE at (0, 0), `h` px to the finial (the reference drawing is 560 tall). Unlit lantern. */
export const LampPost5: React.FC<{h: number; baskets?: 0 | 1 | 2; ink?: number; seed: string; nod?: boolean}> = ({h, baskets = 0, ink = 4.8, seed, nod = true}) => {
  const t = useTime();
  const k = h / 560;
  const b = useMemo(() => {
    const B = new Batch();
    const pw = 24 * k;
    const iron = DT.iron;
    const lit = DT.ironLit;
    // the base: a fluted plinth with a ring
    B.poly(iron, [[-pw * 1.5, 0], [pw * 1.5, 0], [pw * 1.2, -46 * k], [pw * 0.9, -86 * k], [-pw * 0.9, -86 * k], [-pw * 1.2, -46 * k]]);
    B.poly(lit, [[pw * 0.6, 0], [pw * 1.5, 0], [pw * 1.2, -46 * k], [pw * 0.9, -86 * k], [pw * 0.5, -86 * k], [pw * 0.7, -46 * k]]);
    B.rect(iron, -pw * 1.25, -54 * k, pw * 2.5, 9 * k);
    // the shaft with a collar
    B.rect(iron, -pw / 2, -462 * k, pw, 380 * k);
    B.rect(lit, pw * 0.12, -462 * k, pw * 0.26, 380 * k);
    B.rect(iron, -pw * 0.85, -300 * k, pw * 1.7, 12 * k);
    B.rect(iron, -pw * 0.95, -470 * k, pw * 1.9, 14 * k);
    // the lantern: a tapered glass box in an iron frame, a cap, a finial
    const lw = 66 * k;
    B.poly(DT.lanternGlass, [[-lw * 0.4, -472 * k], [lw * 0.4, -472 * k], [lw * 0.55, -538 * k], [-lw * 0.55, -538 * k]]);
    B.poly(mix(DT.lanternGlass, CM.stoneShade, 0.45), [[-lw * 0.4, -472 * k], [-lw * 0.12, -472 * k], [-lw * 0.16, -538 * k], [-lw * 0.55, -538 * k]]);
    B.poly(iron, [[-lw * 0.66, -538 * k], [lw * 0.66, -538 * k], [lw * 0.14, -556 * k], [-lw * 0.14, -556 * k]]);
    B.fill(iron, circleD(0, -560 * k, 6 * k));
    if (baskets) {
      // a scrolled bracket each side at -452 (ink scrolls) and the chains
      for (const s of baskets === 2 ? [-1, 1] : [1]) {
        B.rect(iron, s > 0 ? 0 : -122 * k, -452 * k, 122 * k, 7 * k);
        B.ink(`M${s * 20 * k} ${-445 * k}Q${s * 60 * k} ${-410 * k} ${s * 96 * k} ${-446 * k}`, Math.max(1.2, 2.2 * k), DT.ink);
        B.ink(lineD([[s * 118 * k, -446 * k], [s * 70 * k, -392 * k]]) + lineD([[s * 118 * k, -446 * k], [s * 166 * k, -392 * k]]), Math.max(0.9, 1.4 * k), DT.ink);
      }
    }
    B.layer();
    B.ink(lineD([[-pw / 2, -86 * k], [-pw / 2, -462 * k]]) + lineD([[pw / 2, -86 * k], [pw / 2, -462 * k]]), ink, DT.ink, 0.15);
    B.ink(lineD([[-pw * 1.5, 0], [-pw * 0.9, -86 * k], [pw * 0.9, -86 * k], [pw * 1.5, 0]]), ink, DT.ink, 0.2);
    B.ink(lineD([[-lw * 0.4, -472 * k], [-lw * 0.55, -538 * k], [lw * 0.55, -538 * k], [lw * 0.4, -472 * k], [-lw * 0.4, -472 * k]]) + lineD([[0, -472 * k], [0, -538 * k]]), ink * 0.7, DT.ink);
    return B;
  }, [k, baskets, ink, seed]);
  // baskets nod a little (a soft sway at the hook; deterministic), the flowers drawn on top
  const sway = nod ? Math.sin(t * 1.25 + rand(seed, 'ph') * 6) * 2.2 * k : 0;
  const bk = useMemo(() => {
    if (!baskets) return null;
    const B = new Batch();
    for (const s of baskets === 2 ? [-1, 1] : [1]) basketShapes(B, s * 118 * k, -378 * k, k, `${seed}${s}`);
    return B;
  }, [k, baskets, seed]);
  const flowers = useMemo(() => {
    if (!baskets) return [];
    const r = rng(`s5deck/fl/${seed}`);
    const cols = [CM.blossom, CM.paper, CM.coatMustard, CM.blossom, CM.coatPlum, mix(CM.blossom, CM.brick, 0.35)];
    const out: {x: number; y: number; rr: number; col: string}[] = [];
    for (const s of baskets === 2 ? [-1, 1] : [1]) {
      for (let i = 0; i < 36; i++) {
        const a = r.range(0, Math.PI * 2);
        const dd = Math.sqrt(r.next());
        const trail = r.chance(0.35);
        out.push({x: s * 118 * k + Math.cos(a) * 100 * k * dd, y: (trail ? -370 * k + r.range(10, 66) * k : -398 * k + Math.sin(a) * 36 * k * dd), rr: r.range(8, 12.5) * k, col: r.pick(cols)});
      }
    }
    return out;
  }, [k, baskets, seed]);
  const fl = new Map<string, string>();
  for (const f of flowers) fl.set(f.col, (fl.get(f.col) ?? '') + blossomD(f.x, f.y, f.rr, `${seed}${Math.round(f.x)}${Math.round(f.y)}`, 3));
  return (
    <>
      <Paint b={b} seed={`s5deck/lamp/${seed}`} misreg={2} />
      {bk ? (
        <g transform={`translate(${sway.toFixed(2)} 0)`}>
          <Paint b={bk} seed={`s5deck/lampbk/${seed}`} misreg={2} />
          {[...fl.entries()].map(([c, d]) => (
            <path key={c} d={d} fill={c} />
          ))}
        </g>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the right frame

/** The end lamppost (base cut by the bottom-right) and the corner crown behind it. */
export const LAMP5 = {x: 1004, base: 1985, h: 640};
/** Its box: the lamppost's base travels in from beyond the bottom-right (late), 1.35x -> 1x. */
export const RIGHT5_BOX: PullBox = {from: [LAMP5.x + 430, LAMP5.base + 260], to: [LAMP5.x, LAMP5.base], s0: 1.35};
export const CORNER5 = {cx: 1090, cy: 1690, rx: 270, ry: 230};

export const RightFrame5: React.FC = () => {
  const crowns = useMemo<Crown5[]>(() => {
    const C = CORNER5;
    const light: Pt = [-0.25, -0.97];
    return [
      {cx: C.cx + 40, cy: C.cy + 90, rx: C.rx, ry: C.ry, seed: 's5deck/corner/0', light, bloom: 0.85, litK: 0.55},
      {cx: C.cx - 110, cy: C.cy + 10, rx: C.rx * 0.6, ry: C.ry * 0.55, seed: 's5deck/corner/1', light, bloom: 0.95, litK: 0.45},
      {cx: C.cx - 10, cy: C.cy - 110, rx: C.rx * 0.6, ry: C.ry * 0.48, seed: 's5deck/corner/2', light, bloom: 0.95, litK: 0.4},
    ];
  }, []);
  return (
    <>
      <Crowns5 crowns={crowns} seed="s5deck/cornerBl" />
      <g transform={`translate(${LAMP5.x} ${LAMP5.base})`}>
        <LampPost5 h={LAMP5.h} baskets={1} seed="right" />
      </g>
    </>
  );
};

// ---------------------------------------------------------------- petals near the lens (screen space)

/** Petals drifting down near the lens: born at y 620 (never in the band margin y 290-600), falling 36-70 px/s with a
 *  sway and a flip (a squash, never a fade). Only where they never cross a subject: the side strips above y 1260
 *  (x < 190 and x > 835: the crowns and the right third), anywhere below it. */
export const NearPetals5: React.FC<{n?: number}> = ({n = 14}) => {
  const t = useTime();
  let a = '';
  let b = '';
  for (let i = 0; i < n; i++) {
    const seed = 's5deck/petals';
    const v = 38 + rand(seed, `v${i}`) * 32;
    const side = i % 3;
    const span = side === 2 ? 700 : 1400;
    const y0 = side === 2 ? 1260 : 620;
    const life = span / v;
    const ph = rand(seed, `p${i}`) * life;
    const k = frac((t + ph) / life);
    const y = y0 + k * span;
    const base = side === 0 ? -30 + rand(seed, `x${i}`) * 200 : side === 1 ? 845 + rand(seed, `x${i}`) * 260 : -20 + rand(seed, `x${i}`) * 1120;
    const x = base + Math.sin((t + ph) * 1.6 + i) * 22 - k * 90;
    const s = 4.5 + rand(seed, `s${i}`) * 4.5;
    const flip = Math.abs(Math.cos((t + ph) * 3.1 + i));
    const d = ellD(x, y, s, s * (0.25 + 0.55 * flip));
    if (i % 3) a += d;
    else b += d;
  }
  return (
    <>
      <path d={a} fill={DT.petal} />
      <path d={b} fill={DT.petalShade} />
    </>
  );
};

void polyD;
