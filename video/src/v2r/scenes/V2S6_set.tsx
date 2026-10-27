// V2S6_set.tsx (lane L5): set dressing on top of the dc kit's gate, in the kit's own plane coordinates.
//   S6HedgeFix   (mid)  the hedge behind the fence repainted in sage (the kit's GT.hedge = mix(sage, shadeWarm, 0.3)
//                      reads olive-grey, C* 8: STYLE section 2 forbids olive / grey), then the kit's pickets, lower rail,
//                      piers, the corner post and the fence-foot tulips redrawn EXACTLY over it (same Batch layer
//                      indices, colours and Paint seed 'fence' = identical misregistration), so nothing doubles.
//   S6ShrubFix   (near) the flowering shrub bottom-left repainted the same way (its shade mix(sage, shadeWarm, 0.4) is
//                      grey-beige): the kit's own crown paths, dilated 6 px, in cool sage tones + fresh blossom.
//   S6Border     (near) a deep tulip border in front of the bollards (heads y ~1478-1560, never above y 1250), cut by
//                      the left edge; the heads nod (12 drawings/s). Fills the bottom third's middle band.
// Colours: CM role tokens and flat steps of them only (foliage shade turns COOL toward the water green, STYLE 2).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {rng} from '../../lib/rng';
import {Batch, Paint, mix, crownD, blossomD, circleD, ellD, lineD, frac} from '../kit/dc/core';
import {GATE, GT} from '../kit/dc/gate';

/** Foliage tones (sage lit -> cool shade; never olive, never grey). */
export const LEAF = {
  lit: mix(CM.sage, CM.paper, 0.3),
  body: CM.sage,
  shade: mix(CM.sage, CM.waterDeep, 0.55),
  deep: mix(CM.waterDeep, CM.paneUnlit, 0.22),
  stem: mix(CM.sage, CM.waterDeep, 0.8),
};

// ---------------------------------------------------------------- the hedge behind the fence (mid plane)

const fenceOverlay = (): Batch => {
  const B = new Batch();
  const {top, base} = GATE.fence; // 1010, 1236
  const x0 = -300;
  const x1 = 1500;
  const P = GATE.post;
  const r = rng('s6hedge');
  B.layer(); // 1
  B.layer(); // 2: the new hedge (its own colours)
  // a solid band from y 1104 (the kit's hedge crowns reach up to ~1109) with bumps above it (tops ~1072)
  const yTop = 1104;
  let lit = '';
  let shade = '';
  let deep = '';
  for (let x = x0; x < x1; x += 38) {
    const w = r.range(30, 42);
    lit += crownD(x + 6, yTop - 4 + r.range(-3, 3), w, w * 0.62, `s6h/l${x}`, 6, 0.4);
    shade += ellD(x + 20, yTop + r.range(40, 92), r.range(12, 22), r.range(6, 10));
    if (r.chance(0.5)) deep += ellD(x + r.range(0, 40), base - r.range(10, 30), r.range(14, 24), r.range(6, 9));
  }
  B.rect(LEAF.body, x0, yTop, x1 - x0, base - yTop + 2);
  B.fill(LEAF.body, lit);
  B.fill(LEAF.shade, shade);
  B.fill(LEAF.deep, deep);
  let flecks = '';
  for (let i = 0; i < 300; i++) flecks += ellD(r.range(x0, x1), r.range(yTop - 20, base - 8), r.range(2.5, 4.5), r.range(1.5, 2.6));
  B.fill(LEAF.lit, flecks);
  // layer 3: the kit's rails, pickets, finials and piers (only what crosses the hedge band is needed; same colours)
  B.layer();
  B.rect(GT.rail, x0, base - 34, x1 - x0, 6);
  let pk = '';
  for (let x = x0; x < x1; x += 34) {
    if (Math.abs(x - P.x) < P.w * 0.7) continue;
    pk += `M${x - 2.5} ${base}V${yTop - 40}h5V${base}Z`;
  }
  B.fill(GT.rail, pk);
  for (let x = x0 + 40; x < x1; x += 34 * 6) {
    if (Math.abs(x - P.x) < 120) continue;
    B.rect(GT.stone, x - 10, yTop - 40, 20, base - yTop + 40);
    B.rect(GT.stoneShade, x + 4, yTop - 40, 6, base - yTop + 40);
  }
  // layer 4: the tall corner post, exactly as the kit draws it
  B.layer();
  B.rect(GT.stone, P.x - P.w / 2, P.cap + 14, P.w, base - P.cap - 14 + 4);
  B.rect(GT.stoneLit, P.x - P.w / 2, P.cap + 14, P.w * 0.35, base - P.cap - 14 + 4);
  B.rect(GT.stoneShade, P.x + P.w * 0.22, P.cap + 14, P.w * 0.28, base - P.cap - 14 + 4);
  B.rect(GT.stoneLit, P.x - P.w / 2 - 7, P.cap, P.w + 14, 9);
  B.rect(GT.stoneShade, P.x - P.w / 2 - 5, P.cap + 9, P.w + 10, 7);
  B.rect(GT.stoneShade, P.x - P.w / 2 - 6, base - 18, P.w + 12, 22);
  B.ink(lineD([[P.x - P.w / 2, base], [P.x - P.w / 2, P.cap + 16]]), 3.4, GT.ink);
  B.ink(lineD([[P.x + P.w / 2, base], [P.x + P.w / 2, P.cap + 16]]), 3.4, GT.ink);
  B.ink(lineD([[P.x - P.w / 2 - 7, P.cap], [P.x + P.w / 2 + 7, P.cap]]), 3.4, GT.ink);
  // layer 5: the fence-foot tulips, replayed with the kit's own rng sequence (rng('fence'): the heights are its first draws)
  B.layer();
  B.rect(GT.kerb, x0, base - 6, x1 - x0, 8);
  const rk = rng('fence');
  let leaves = '';
  const heads = new Map<string, string>();
  for (let x = x0 + 4; x < x1; x += 11) {
    if (Math.abs(x - P.x) < P.w * 0.7) continue;
    const hgt = rk.range(26, 40);
    leaves += `M${x - 3} ${base + 8}L${x} ${base + 8 - hgt * 0.7}L${x + 3} ${base + 8}Z`;
    const col = GT.tulip[Math.floor(frac(Math.sin(x * 0.07) * 43758.5) * GT.tulip.length)];
    heads.set(col, (heads.get(col) ?? '') + ellD(x, base + 8 - hgt, 4.2, 5.6));
  }
  B.fill(GT.leaf, leaves);
  heads.forEach((d, col) => B.fill(col, d));
  return B;
};

export const S6HedgeFix: React.FC = () => {
  const b = useMemo(fenceOverlay, []);
  return <Paint b={b} seed="fence" misreg={3} />;
};

// ---------------------------------------------------------------- the flowering shrub (near plane)

/** The kit's shrub crowns (GateNear: crownD(-60, 1372, 200, 112, 'near/sh0'), crownD(-90, 1352, 150, 86, 'near/sh1')),
 *  repainted: each path is filled AND stroked 12 px in the same colour (a 6 px dilation covers the kit's misregistered
 *  fills), then fresh shade lobes and blossom. Its top stays >= 1236 (left of the board's x range when it gets there). */
export const S6ShrubFix: React.FC = () => {
  const b = useMemo(() => {
    const r = rng('s6shrub');
    const B = new Batch();
    let bl = '';
    let bs = '';
    let bt = '';
    for (let i = 0; i < 70; i++) {
      const a = r.range(0, Math.PI * 2);
      const d = Math.sqrt(r.next()) * 0.9;
      const x = -75 + Math.cos(a) * 205 * d;
      const y = 1366 + Math.sin(a) * 96 * d;
      if (y < 1268) continue;
      const db = blossomD(x, y, r.range(10, 17), `s6sh/b${i}`, 4);
      if (Math.sin(a) < -0.4) bt += db;
      else if (Math.cos(a) > 0.3) bs += db;
      else bl += db;
    }
    B.fill(mix(CM.blossom, CM.shadeWarm, 0.22), bs);
    B.fill(CM.blossom, bl);
    B.fill(mix(CM.blossom, CM.paper, 0.45), bt);
    return B;
  }, []);
  const d0 = crownD(-60, 1372, 200, 112, 'near/sh0', 10, 0.3);
  const d1 = crownD(-90, 1352, 150, 86, 'near/sh1', 10, 0.3);
  const lobes = useMemo(() => {
    const r = rng('s6shrubL');
    let s = '';
    for (let i = 0; i < 9; i++) s += ellD(-20 + r.range(-150, 150), 1400 + r.range(-20, 40), r.range(26, 44), r.range(12, 20));
    return s;
  }, []);
  return (
    <>
      <path d={d0} fill={LEAF.shade} stroke={LEAF.shade} strokeWidth={12} strokeLinejoin="round" />
      <path d={d1} fill={LEAF.body} stroke={LEAF.body} strokeWidth={12} strokeLinejoin="round" />
      <path d={lobes} fill={LEAF.deep} />
      <Paint b={b} seed="s6shrub" misreg={2} />
    </>
  );
};

// ---------------------------------------------------------------- the tulip border (near plane)

const BORDER = {x0: -300, x1: 768, soil: 1606, edge: 1626};
const TULIP_COLS = [CM.box, CM.blossom, CM.brick, CM.paper, CM.coatMustard, CM.brickLight];

type Bloom = {x: number; base: number; h: number; col: string; ph: number; s: number; lean: number};

export const S6Border: React.FC = () => {
  const t = useTime();
  const td = Math.floor(t * 12) / 12;
  const {bed, blooms} = useMemo(() => {
    const r = rng('s6border');
    const B = new Batch();
    // the bed: a low stone edge, dark soil, a short flat shadow of the edge onto the paving (the sun is left)
    B.rect(mix(CM.brickDeep, CM.anchor, 0.42), BORDER.x0, BORDER.soil - 30, BORDER.x1 - BORDER.x0, 34);
    B.poly(mix(CM.paving, CM.shadeWarm, 0.38), [[BORDER.x0, BORDER.edge + 4], [BORDER.x1, BORDER.edge + 4], [BORDER.x1 + 30, BORDER.edge + 14], [BORDER.x0, BORDER.edge + 14]]);
    for (let x = BORDER.x0; x < BORDER.x1; x += r.range(44, 60)) {
      const w = r.range(40, 56);
      B.rect(r.chance(0.35) ? CM.paper : CM.limestone, x, BORDER.soil, Math.min(w, BORDER.x1 - x), BORDER.edge - BORDER.soil);
      B.rect(CM.stoneShade, x, BORDER.edge - 5, Math.min(w, BORDER.x1 - x), 5);
    }
    B.ink(lineD([[BORDER.x0, BORDER.soil], [BORDER.x1 + 4, BORDER.soil - 1]]), 3.4, CM.ink, 0.25);
    B.ink(lineD([[BORDER.x1 + 4, BORDER.soil - 2], [BORDER.x1 + 4, BORDER.edge]]), 3.4, CM.ink);
    // leaves (broad, two tones) in three staggered rows
    const out: Bloom[] = [];
    let la = '';
    let lb = '';
    for (let row = 0; row < 3; row++) {
      const baseY = BORDER.soil - 6 - row * 16;
      for (let x = BORDER.x0 + 8 + row * 7; x < BORDER.x1 - 6; x += r.range(15, 21)) {
        const h = r.range(64, 92) - row * 10;
        out.push({x, base: baseY, h, col: r.pick(TULIP_COLS), ph: r.range(0, 6.28), s: r.range(8.5, 11.5) - row * 0.8, lean: r.range(-4, 4)});
        for (const side of [-1, 1]) {
          if (r.chance(0.35)) continue;
          const lh = h * r.range(0.45, 0.62);
          const d = `M${(x - 4).toFixed(1)} ${baseY}Q${(x + side * 22).toFixed(1)} ${(baseY - lh * 0.55).toFixed(1)} ${(x + side * 13).toFixed(1)} ${(baseY - lh).toFixed(1)}Q${(x + side * 5).toFixed(1)} ${(baseY - lh * 0.45).toFixed(1)} ${(x + 4).toFixed(1)} ${baseY}Z`;
          if ((side > 0) === (row % 2 === 0)) la += d;
          else lb += d;
        }
      }
    }
    B.layer();
    B.fill(LEAF.shade, lb);
    B.fill(LEAF.body, la);
    // back-to-front: rear rows first
    out.sort((a, b) => a.base - b.base);
    return {bed: B, blooms: out};
  }, []);
  let stems = '';
  const heads = new Map<string, string>();
  const shades = new Map<string, string>();
  for (const f of blooms) {
    const sw = Math.sin(td * 1.5 + f.ph) * 3.4 + Math.sin(td * 0.6 + f.ph * 1.7) * 2;
    const hx = f.x + f.lean + sw;
    const hy = f.base - f.h + Math.abs(sw) * 0.15;
    stems += `M${f.x.toFixed(1)} ${f.base}Q${(f.x + (f.lean + sw) * 0.35).toFixed(1)} ${(f.base - f.h * 0.5).toFixed(1)} ${hx.toFixed(1)} ${(hy + f.s * 0.8).toFixed(1)}`;
    const s = f.s;
    // a cup: two outer petals with a notch, rounded base
    const d = `M${(hx - s).toFixed(1)} ${(hy - s * 0.85).toFixed(1)}L${(hx - s * 0.45).toFixed(1)} ${(hy - s * 0.35).toFixed(1)}L${hx.toFixed(1)} ${(hy - s * 1.1).toFixed(1)}L${(hx + s * 0.45).toFixed(1)} ${(hy - s * 0.35).toFixed(1)}L${(hx + s).toFixed(1)} ${(hy - s * 0.85).toFixed(1)}Q${(hx + s * 1.02).toFixed(1)} ${(hy + s).toFixed(1)} ${hx.toFixed(1)} ${(hy + s).toFixed(1)}Q${(hx - s * 1.02).toFixed(1)} ${(hy + s).toFixed(1)} ${(hx - s).toFixed(1)} ${(hy - s * 0.85).toFixed(1)}Z`;
    heads.set(f.col, (heads.get(f.col) ?? '') + d);
    // the shade side of the cup (right: the sun is left)
    const sd = `M${(hx + s * 0.2).toFixed(1)} ${(hy - s * 0.4).toFixed(1)}L${(hx + s * 0.9).toFixed(1)} ${(hy - s * 0.7).toFixed(1)}Q${(hx + s * 0.95).toFixed(1)} ${(hy + s * 0.9).toFixed(1)} ${(hx + s * 0.1).toFixed(1)} ${(hy + s * 0.95).toFixed(1)}Z`;
    shades.set(f.col, (shades.get(f.col) ?? '') + sd);
  }
  return (
    <>
      <Paint b={bed} seed="s6border" misreg={3} />
      <path d={stems} stroke={LEAF.stem} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {[...heads.entries()].map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
      {[...shades.entries()].map(([c, d]) => (
        <path key={`s${c}`} d={d} fill={mix(c, CM.shadeWarm, 0.22)} />
      ))}
    </>
  );
};

void circleD;
