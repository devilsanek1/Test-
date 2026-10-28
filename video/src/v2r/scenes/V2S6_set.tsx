// V2S6_set.tsx (lane L5): set dressing on top of the dc kit's gate, in the kit's own coordinates.
//   S6HedgeFix   (plane +1, over GateFence) the hedge behind the fence repainted in sage (the kit's GT.hedge =
//                mix(sage, shadeWarm, 0.3) reads olive-grey, C* 8: STYLE section 2 forbids olive / grey), then the kit's
//                pickets, lower rail, piers, the corner post and the fence-foot tulips redrawn EXACTLY over it (same
//                Batch layer indices, colours and Paint seed 'fence' = identical misregistration), so nothing doubles.
//                Flat shapes only (the hand-drawn flecks are gone: THROUGHLINE §6).
// Colours: CM role tokens and flat steps of them only (foliage shade turns COOL toward the water green, STYLE 2).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {rng} from '../../lib/rng';
import {Batch, Paint, mix, crownD, ellD, lineD, frac} from '../kit/dc/core';
import {GATE, GT} from '../kit/dc/gate';

/** Foliage tones (sage lit -> cool shade; never olive, never grey). */
export const LEAF = {
  lit: mix(CM.sage, CM.paper, 0.3),
  body: CM.sage,
  shade: mix(CM.sage, CM.waterDeep, 0.4),
  deep: mix(CM.sage, CM.coatSlate, 0.28),
  stem: mix(CM.sage, CM.waterDeep, 0.65),
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
  // layer 5: the fence-foot tulips, replayed with the kit's own rng sequence (rng('fence'): the heights are its first
  // draws) over ONE calm foliage band: the kit's leaf triangles on its dark soil strip read as a comb of short dark
  // strokes (the line measure's near-miss ends), so the leaves are a continuous sage band with a lit top edge
  B.layer();
  B.rect(GT.kerb, x0, base - 6, x1 - x0, 8);
  B.rect(LEAF.body, x0, base - 16, x1 - x0, 26);
  B.rect(LEAF.lit, x0, base - 16, x1 - x0, 3);
  const rk = rng('fence');
  const heads = new Map<string, string>();
  for (let x = x0 + 4; x < x1; x += 11) {
    if (Math.abs(x - P.x) < P.w * 0.7) continue;
    const hgt = rk.range(26, 40);
    const col = GT.tulip[Math.floor(frac(Math.sin(x * 0.07) * 43758.5) * GT.tulip.length)];
    heads.set(col, (heads.get(col) ?? '') + ellD(x, base + 8 - hgt, 4.2, 5.6));
  }
  heads.forEach((d, col) => B.fill(col, d));
  return B;
};

export const S6HedgeFix: React.FC = () => {
  const b = useMemo(fenceOverlay, []);
  return <Paint b={b} seed="fence" misreg={3} />;
};
