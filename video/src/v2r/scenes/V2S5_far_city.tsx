// V2S5_far_city.tsx (lane L4, SKY & FAR): the far band under the horizon, in the FAR plane (END coords, horizon 750):
//   FarHills      the far hills as a thin flat step on the horizon (65 %), running past both ends of the plane
//   FarCityS5     the low white city PACKED (CINEMATIC_GUIDE Scale cues 2-4): an infinity strip, then 6 rows every 9-10 px
//                 (each hiding about half the row behind; no sky gaps), seeded motifs of 5 building types (+-15 % width,
//                 4 roof colours), a tick (chimney, cupola, spire, tree) every 3-4 roofs; DETAIL PEAKS just under the
//                 horizon (the back rows are the smallest, most varied marks); the Mall with its tree rows, the castle,
//                 the museums, and the Capitol dome as a tiny second landmark one step paler. Flat steps 65 % / 40 %,
//                 no ink. STATIC: nothing moves inside the city (Scale cues 11).
//   ObeliskS5     THE OBELISK: the one far shape over the horizon (~4x its true size), its top >= 610 at every p, the
//                 darkest far shape (its shade face) against the palest cloud, a hairline in its shade colour.
import React, {useMemo} from 'react';
import {Batch, Paint, crownD, rng, type Pt} from '../kit/dc/core';
import {FAR} from './V2S5_far_tones';

export const CITY = {
  horizon: 750,
  /** The plane's x span (END coords): the start sees x ~830-1830, the end 0-1080. */
  x0: -520,
  x1: 2620,
  /** Row bases (END y), back -> front; the river's far shore (V2S5_river) covers from ~799 down. */
  rows: [758, 767, 776, 785, 795, 805],
  /** The obelisk: centre x, base (behind the Mall's trees), top (>= 610 at every p: the QA maps it), base width. */
  obelisk: {x: 396, base: 793, top: 620, w: 24},
  /** The Capitol dome: centre x, base, dome radius (~28 px tall with its drum and lantern). */
  capitol: {x: 884, base: 762, r: 8.5},
  /** The Mall: its lawn strip and the two tree rows (END x span). */
  mall: {x0: 250, x1: 960, y: 789},
  castle: {x: 566, base: 786},
};

type Tone = {faces: [string, number][]; shade: string; shadeDeep: string; roofs: [string, number][]; tree: string; tree2: string; blossom: string; windows: boolean};

const BACK: Tone = {
  faces: [
    [FAR.backLit, 5],
    [FAR.backStone, 3],
  ],
  shade: FAR.backShade,
  shadeDeep: FAR.backSlate,
  roofs: [
    [FAR.backRoof, 3],
    [FAR.backSlate, 3],
    [FAR.backShade, 2],
    [FAR.backTree, 1],
  ],
  tree: FAR.backTree,
  tree2: FAR.backTree,
  blossom: FAR.backRoof,
  windows: false,
};
const FRONT: Tone = {
  faces: [
    [FAR.lit, 6],
    [FAR.stone, 4],
    [FAR.warm, 3],
  ],
  shade: FAR.shade,
  shadeDeep: FAR.shadeDeep,
  roofs: [
    [FAR.roofSlate, 4],
    [FAR.roofPink, 3],
    [FAR.roofCopper, 2],
    [FAR.roofBrick, 1.2],
    [FAR.roofLit, 1.5],
  ],
  tree: FAR.tree,
  tree2: FAR.treeDark,
  blossom: FAR.blossom,
  windows: true,
};

type Kind = 'block' | 'gable' | 'hip' | 'tower' | 'long' | 'trees';
type R = ReturnType<typeof rng>;

/** A few window dots on a facade (front rows only): 1-3 dots at irregular positions on half the facades, never a
 *  regular row (the far plane slides ~12 px a frame at the peak: a fine regular pattern would strobe), so the detail
 *  still peaks in the small back rows just under the horizon. */
function windows(B: Batch, x: number, w: number, y: number, tone: Tone, r: R) {
  if (!r.chance(0.5)) return;
  const n = Math.min(3, Math.max(1, Math.floor(w / 5)));
  for (let i = 0; i < n; i++) B.rect(tone.shadeDeep, x + Math.max(1.6, w * 0.3) + r.range(0.5, Math.max(0.6, w * 0.6 - 2)), y + r.range(-0.6, 1.4), 1.4, 1.5);
}

/** One far building (3-5 flat shapes: a face, its shade side on the left (the sun is to the right), a roof band). */
function building(B: Batch, kind: Kind, x: number, base: number, w: number, h: number, tone: Tone, face: string, roof: string, r: R): {roofY: number} {
  const sh = Math.max(1.1, w * r.range(0.24, 0.34));
  switch (kind) {
    case 'gable': {
      const eave = base - h * 0.66;
      B.rect(face, x, eave, w, base - eave);
      B.rect(tone.shade, x, eave, sh, base - eave);
      B.poly(roof, [
        [x - 0.7, eave + 0.5],
        [x + w * 0.5, base - h],
        [x + w + 0.7, eave + 0.5],
      ]);
      if (tone.windows && base - eave > 6) windows(B, x, w, eave + 2.4, tone, r);
      return {roofY: base - h};
    }
    case 'hip': {
      const eave = base - h * 0.7;
      B.rect(face, x, eave, w, base - eave);
      B.rect(tone.shade, x, eave, sh, base - eave);
      B.poly(roof, [
        [x - 0.5, eave + 0.4],
        [x + w * 0.16, base - h],
        [x + w * 0.84, base - h],
        [x + w + 0.5, eave + 0.4],
      ]);
      if (tone.windows && base - eave > 6) windows(B, x, w, eave + 2.4, tone, r);
      return {roofY: base - h};
    }
    case 'tower': {
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x, base - h, sh, h);
      if (w > 4.5) for (let wy = base - h + 3; wy < base - 3; wy += 3.6) B.rect(tone.shadeDeep, x + w * 0.5, wy, Math.max(1, w * 0.18), 1.6);
      B.rect(roof, x - 0.4, base - h - 2, w + 0.8, 2.2);
      return {roofY: base - h - 2};
    }
    case 'long': {
      // a long federal block: a colonnade band in shade under a flat roof slab
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x + w * 0.04, base - h * 0.64, w * 0.92, h * 0.36);
      B.rect(face, x + w * 0.04, base - h * 0.66, w * 0.92, 1.1);
      B.rect(tone.shade, x, base - h, sh * 0.7, h);
      B.rect(roof, x - 0.6, base - h - 2.2, w + 1.2, 2.6);
      return {roofY: base - h - 2.2};
    }
    case 'trees': {
      const n = Math.max(1, Math.round(w / 6));
      for (let i = 0; i < n; i++) {
        const cx = x + ((i + 0.5) * w) / n + r.jitter(1);
        const rr = r.range(3, 5.5) * Math.min(1.4, h / 10);
        B.fill(r.chance(0.28) ? tone.blossom : r.chance(0.5) ? tone.tree : tone.tree2, crownD(cx, base - rr * 0.85, rr, rr * 0.82, `t${x.toFixed(1)}/${i}`, 5, 0.5));
      }
      return {roofY: base - h};
    }
    default: {
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x, base - h, sh, h);
      const rh = r.range(1.6, 2.8);
      B.rect(roof, x - 0.4, base - h - rh * 0.5, w + 0.8, rh);
      if (tone.windows && h > 8) windows(B, x, w, base - h + rh + 2, tone, r);
      return {roofY: base - h - rh * 0.5};
    }
  }
}

/** A tick on a roof (every 3-4 roofs): a chimney, a cupola, a spire or a tree in front. */
function tick(B: Batch, x: number, w: number, roofY: number, base: number, tone: Tone, r: R) {
  const k = r.pick(['chimney', 'chimney', 'cupola', 'spire', 'tree', 'tree'] as const);
  const cx = x + w * r.range(0.3, 0.75);
  if (k === 'chimney') B.rect(tone.shadeDeep, cx, roofY - r.range(2.4, 3.8), r.range(1.4, 2.2), r.range(2.8, 4.2));
  else if (k === 'cupola') {
    const rr = r.range(1.7, 2.7);
    B.rect(tone.faces[0][0], cx - rr, roofY - rr * 0.9, rr * 2, rr * 0.9 + 0.4);
    B.poly(tone.roofs[2][0], [
      [cx - rr, roofY - rr * 0.85],
      [cx - rr * 0.5, roofY - rr * 1.9],
      [cx + rr * 0.5, roofY - rr * 1.9],
      [cx + rr, roofY - rr * 0.85],
    ]);
  } else if (k === 'spire') {
    B.poly(tone.shadeDeep, [
      [cx - 1.2, roofY + 0.5],
      [cx, roofY - r.range(5, 9)],
      [cx + 1.2, roofY + 0.5],
    ]);
  } else {
    const rr = r.range(2.6, 4.2);
    B.fill(r.chance(0.3) ? tone.blossom : tone.tree, crownD(cx, base - rr * 0.7, rr, rr * 0.85, `tk${cx.toFixed(1)}`, 5, 0.45));
  }
}

/** A line of street trees along a row's base (separates the rows: the eye reads them as stacked streets). */
function streetTrees(B: Batch, y: number, tone: Tone, r: R, skip?: (x: number) => boolean) {
  for (let x = CITY.x0 + r.range(0, 8); x < CITY.x1; x += r.range(5, 12)) {
    if (r.chance(0.3) || (skip && skip(x))) continue;
    const rr = r.range(2.4, 3.8);
    B.fill(r.chance(0.25) ? tone.blossom : r.chance(0.6) ? tone.tree : tone.tree2, crownD(x, y - rr * 0.6, rr, rr * 0.8, `st${y}/${x.toFixed(1)}`, 5, 0.45));
  }
}

const KINDS_BACK: [Kind, number][] = [
  ['block', 6],
  ['gable', 3],
  ['hip', 2],
  ['tower', 1.2],
  ['trees', 1.6],
];
const KINDS_FRONT: [Kind, number][] = [
  ['block', 5],
  ['gable', 3],
  ['hip', 3],
  ['long', 1.2],
  ['tower', 0.8],
  ['trees', 1.6],
];

/** Row spec: [base, width range, height range, tone, tick period]. Back rows smaller and denser (the detail peak). */
const ROWSPEC: {base: number; w: [number, number]; h: [number, number]; tone: Tone; tickEvery: number}[] = [
  {base: CITY.rows[0], w: [4, 7.5], h: [6, 11], tone: BACK, tickEvery: 3},
  {base: CITY.rows[1], w: [5, 9], h: [8, 13], tone: BACK, tickEvery: 3},
  {base: CITY.rows[2], w: [6, 11], h: [10, 15], tone: FRONT, tickEvery: 3},
  {base: CITY.rows[3], w: [7, 13], h: [11, 17], tone: FRONT, tickEvery: 4},
  {base: CITY.rows[4], w: [8, 15], h: [12, 18], tone: FRONT, tickEvery: 4},
  {base: CITY.rows[5], w: [9, 17], h: [12, 19], tone: FRONT, tickEvery: 4},
];

/** One packed row, seeded: buildings overlap (x advances 0.62-0.92 of a width), so there are no sky gaps. */
function cityRow(B: Batch, i: number, seed: string, skip?: (x: number, w: number) => boolean) {
  const spec = ROWSPEC[i];
  const r = rng(`${seed}/row${i}`);
  const kinds = spec.tone === BACK ? KINDS_BACK : KINDS_FRONT;
  // seeded motifs: a run of 4-6 buildings repeats one type and roof colour (with +-15 % width), then changes
  let x = CITY.x0 + r.range(0, 10);
  let run = 0;
  let kind: Kind = 'block';
  let roof = spec.tone.roofs[0][0];
  let face = spec.tone.faces[0][0];
  let baseW = (spec.w[0] + spec.w[1]) / 2;
  let n = 0;
  while (x < CITY.x1) {
    if (run <= 0) {
      run = r.int(4, 6);
      kind = r.weighted(kinds);
      roof = r.weighted(spec.tone.roofs);
      face = r.weighted(spec.tone.faces);
      baseW = r.range(spec.w[0], spec.w[1]);
    }
    run--;
    const w = baseW * r.range(0.85, 1.15) * (kind === 'long' ? 2.6 : kind === 'tower' ? 0.7 : 1);
    const h = r.range(spec.h[0], spec.h[1]) * (kind === 'tower' ? 1.6 : kind === 'long' ? 0.8 : 1);
    if (!skip || !skip(x, w)) {
      const f = r.chance(0.18) ? r.weighted(spec.tone.faces) : face;
      const {roofY} = building(B, kind, x, spec.base + r.range(-0.8, 0.8), w, h, spec.tone, f, roof, r);
      n++;
      if (kind !== 'trees' && n % spec.tickEvery === 0) tick(B, x, w, roofY, spec.base, spec.tone, r);
    }
    x += w * r.range(0.62, 0.92);
  }
}

/** Skyline accents in the back rows (65 %): spires, a clock tower, a few taller blocks and the Basilica's dome and
 *  campanile far to the right; they break the horizon by at most ~8 px, so the obelisk stays the one far shape over it
 *  (the Capitol, the tiny second landmark, rises ~20 px). */
function skylineAccents(B: Batch, seed: string) {
  const r = rng(seed);
  const base = CITY.rows[1] + 1;
  for (let x = CITY.x0 + r.range(20, 120); x < CITY.x1; x += r.range(90, 190)) {
    if (Math.abs(x - CITY.obelisk.x) < 60 || Math.abs(x - CITY.capitol.x) < 50) continue;
    const k = r.pick(['spire', 'spire', 'tower', 'block', 'block'] as const);
    if (k === 'spire') {
      const h = r.range(14, 20);
      B.rect(FAR.backStone, x - 2.2, base - h * 0.55, 4.4, h * 0.55);
      B.rect(FAR.backShade, x - 2.2, base - h * 0.55, 1.4, h * 0.55);
      B.poly(FAR.backSlate, [
        [x - 2.4, base - h * 0.55],
        [x, base - h - r.range(2, 5)],
        [x + 2.4, base - h * 0.55],
      ]);
    } else if (k === 'tower') {
      const h = r.range(16, 22);
      const w = r.range(4.5, 6.5);
      B.rect(FAR.backLit, x - w / 2, base - h, w, h);
      B.rect(FAR.backShade, x - w / 2, base - h, w * 0.32, h);
      B.poly(FAR.backSlate, [
        [x - w / 2 - 0.4, base - h],
        [x, base - h - w * 0.9],
        [x + w / 2 + 0.4, base - h],
      ]);
    } else {
      const h = r.range(13, 18);
      const w = r.range(8, 14);
      B.rect(FAR.backStone, x - w / 2, base - h, w, h);
      B.rect(FAR.backShade, x - w / 2, base - h, w * 0.3, h);
      B.rect(FAR.backSlate, x - w / 2 - 0.4, base - h - 1.6, w + 0.8, 1.8);
    }
  }
  // the Old Post Office clock tower (right of the Mall) and the Basilica's dome + campanile (far right)
  {
    const x = 742;
    B.rect(FAR.backLit, x - 3.4, base - 26, 6.8, 26);
    B.rect(FAR.backShade, x - 3.4, base - 26, 2.2, 26);
    B.poly(FAR.backSlate, [
      [x - 4, base - 26],
      [x, base - 33],
      [x + 4, base - 26],
    ]);
    const bx = 1392;
    B.rect(FAR.backLit, bx - 14, base - 8, 28, 8);
    B.fill(FAR.backLit, `M${bx - 7} ${base - 8}A7 7.5 0 0 1 ${bx + 7} ${base - 8}Z`);
    B.rect(FAR.backShade, bx + 11, base - 22, 4, 22);
    B.rect(FAR.backLit, bx + 12.2, base - 22, 2.8, 22);
  }
}

/** The far hills: two flat ridges on the horizon (the farther one paler), past both plane ends. */
export const FarHills: React.FC<{seed?: string}> = ({seed = 's5hills'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const ridge = (y0: number, amp: number, col: string, k: string, wave: number) => {
      const r = rng(k);
      const ph = r.range(0, 6);
      const pts: Pt[] = [[CITY.x0, CITY.horizon + 8]];
      for (let x = CITY.x0; x <= CITY.x1; x += 24) pts.push([x, y0 - amp * (0.5 + 0.5 * Math.sin(x * wave + ph)) * (0.7 + 0.3 * Math.sin(x * wave * 3.1 + ph * 2)) - r.range(0, 1.2)]);
      pts.push([CITY.x1, CITY.horizon + 8]);
      B.poly(col, pts);
    };
    ridge(CITY.horizon - 9, 14, FAR.hillFar, `${seed}/r0`, 0.0042);
    ridge(CITY.horizon - 3, 10, FAR.hill, `${seed}/r1`, 0.0061);
    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={false} />;
};

/** The city: infinity strip, six packed rows, the Mall, the landmarks (the obelisk is drawn between the rows). */
export const FarCityS5: React.FC<{seed?: string; obelisk?: React.ReactNode}> = ({seed = 's5city', obelisk}) => {
  const [back, front] = useMemo(() => {
    const B = new Batch();
    // the infinity strip: the suburbs beyond, packed specks right on the horizon (the city runs on)
    {
      const r = rng(`${seed}/inf`);
      for (let x = CITY.x0; x < CITY.x1; x += r.range(2.4, 4.6)) {
        const w = r.range(2.5, 5.5);
        const h = r.range(2, 5.5);
        const c = r.weighted([
          [FAR.infLit, 5],
          [FAR.infShade, 3],
          [FAR.infTree, 2],
        ] as [string, number][]);
        B.rect(c, x, CITY.horizon + 3 - h + r.range(-0.6, 0.6), w, h + 1);
      }
    }
    B.layer();
    // the Capitol (far, on the back rows' line, one step paler): a drum, the dome, the lantern, two low wings
    {
      const {x, base, r: rr} = CITY.capitol;
      B.rect(FAR.capLit, x - rr * 3.4, base - rr * 0.95, rr * 6.8, rr * 0.95);
      B.rect(FAR.capShade, x - rr * 3.4, base - rr * 0.95, rr * 0.9, rr * 0.95);
      B.rect(FAR.capLit, x - rr * 1.15, base - rr * 1.9, rr * 2.3, rr * 1.0);
      B.rect(FAR.capShade, x - rr * 1.15, base - rr * 1.9, rr * 0.55, rr * 1.0);
      B.fill(FAR.capLit, `M${x - rr} ${base - rr * 1.88}A${rr} ${rr * 1.12} 0 0 1 ${x + rr} ${base - rr * 1.88}Z`);
      B.fill(FAR.capShade, `M${x - rr} ${base - rr * 1.88}A${rr} ${rr * 1.12} 0 0 1 ${x - rr * 0.25} ${base - rr * 2.96}L${x - rr * 0.25} ${base - rr * 1.88}Z`);
      B.rect(FAR.capLit, x - 1.1, base - rr * 3.35, 2.2, rr * 0.5);
    }
    B.layer();
    cityRow(B, 0, seed);
    B.layer();
    cityRow(B, 1, seed, (x, w) => x + w > CITY.capitol.x - 30 && x < CITY.capitol.x + 30);
    B.layer();
    skylineAccents(B, `${seed}/acc`);
    B.layer();
    cityRow(B, 2, seed);
    B.layer();
    // the museums along the Mall's far side (long colonnaded blocks), the castle on its south side
    {
      const r = rng(`${seed}/museums`);
      const y = CITY.mall.y - 7;
      for (let x = CITY.mall.x0 + 40; x < CITY.mall.x1 - 30; x += r.range(46, 70)) {
        if (Math.abs(x - CITY.obelisk.x) < 50 || Math.abs(x - CITY.castle.x) < 34) continue;
        building(B, 'long', x, y, r.range(26, 40), r.range(9, 12), FRONT, r.pick([FAR.lit, FAR.stone, FAR.warm]), r.pick([FAR.roofSlate, FAR.roofCopper, FAR.roofSlate]), r);
      }
      // the castle: red sandstone, towers and turrets
      const {x: cx, base} = CITY.castle;
      B.rect(FAR.brick, cx - 15, base - 12, 30, 12);
      B.rect(FAR.brickShade, cx - 15, base - 12, 6, 12);
      B.rect(FAR.brick, cx - 13, base - 19, 5, 8);
      B.rect(FAR.brick, cx - 3, base - 24, 6, 13);
      B.poly(FAR.brickShade, [
        [cx - 3.6, base - 23.4],
        [cx, base - 29],
        [cx + 3.6, base - 23.4],
      ]);
      B.rect(FAR.brick, cx + 8, base - 18, 4.5, 7);
      B.rect(FAR.brickShade, cx + 13, base - 16, 3, 5);
    }
    B.layer();
    streetTrees(B, CITY.rows[2] + 1.5, FRONT, rng(`${seed}/st2`), (x) => Math.abs(x - CITY.obelisk.x) < 20);
    B.layer();
    cityRow(B, 3, seed, (x, w) => (x + w > CITY.castle.x - 20 && x < CITY.castle.x + 20) || (x + w > CITY.obelisk.x - 18 && x < CITY.obelisk.x + 18));
    B.layer();
    streetTrees(B, CITY.rows[3] + 1.5, FRONT, rng(`${seed}/st3`), (x) => Math.abs(x - CITY.obelisk.x) < 20);
    const backB = B;
    // in front of the obelisk: the Mall's lawn strip + two tree rows, then the two front rows
    const F = new Batch();
    {
      const r = rng(`${seed}/mall`);
      const {x0, x1, y} = CITY.mall;
      F.rect(FAR.treeLit, x0, y - 1, x1 - x0, 4);
      for (const [yy, rr0] of [
        [y - 1.5, 4.2],
        [y + 3.5, 5.0],
      ] as [number, number][]) {
        for (let x = x0 + r.range(0, 6); x < x1; x += r.range(7, 11)) {
          if (Math.abs(x - CITY.obelisk.x) < 26) continue;
          const rr = rr0 * r.range(0.85, 1.2);
          F.fill(r.chance(0.18) ? FAR.blossom : r.chance(0.5) ? FAR.tree : FAR.treeDark, crownD(x, yy - rr * 0.6, rr, rr * 0.8, `m${x.toFixed(1)}/${yy}`, 5, 0.5));
        }
      }
      // the obelisk's grassy mound
      const {x, base} = CITY.obelisk;
      F.fill(FAR.treeLit, `M${x - 34} ${base + 3}Q${x} ${base - 9} ${x + 34} ${base + 3}Z`);
    }
    F.layer();
    cityRow(F, 4, seed, (x, w) => x + w > CITY.obelisk.x - 30 && x < CITY.obelisk.x + 30);
    F.layer();
    streetTrees(F, CITY.rows[4] + 1.5, FRONT, rng(`${seed}/st4`));
    F.layer();
    cityRow(F, 5, seed);
    return [backB, F];
  }, [seed]);
  return (
    <>
      <Paint b={back} seed={`${seed}/b`} misreg={false} />
      {obelisk}
      <Paint b={front} seed={`${seed}/f`} misreg={false} />
    </>
  );
};

/** THE OBELISK (the Washington Monument's shape: a tapering square shaft ~10:1, a small pyramid cap; marble). The
 *  morning sun is to the right: the right face lit, the left face a step darker; a hairline in its shade colour; the
 *  faint level line where the two marbles meet, a third of the way up. */
export const ObeliskS5: React.FC<{x?: number; base?: number; top?: number; w?: number}> = ({x = CITY.obelisk.x, base = CITY.obelisk.base, top = CITY.obelisk.top, w = CITY.obelisk.w}) => {
  const capH = w * 1.2;
  const shaftTop = top + capH;
  const wt = w * 0.7;
  const split = 0.1; // the lit face is the wider one (the sun is to the right)
  const L: Pt[] = [
    [x - w / 2, base],
    [x - wt / 2, shaftTop],
    [x - wt * split, shaftTop],
    [x - w * split, base],
  ];
  const R: Pt[] = [
    [x - w * split, base],
    [x - wt * split, shaftTop],
    [x + wt / 2, shaftTop],
    [x + w / 2, base],
  ];
  const capL: Pt[] = [
    [x - wt / 2, shaftTop],
    [x, top],
    [x - wt * split, shaftTop],
  ];
  const capR: Pt[] = [
    [x - wt * split, shaftTop],
    [x, top],
    [x + wt / 2, shaftTop],
  ];
  const d = (pts: Pt[]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(2)} ${b.toFixed(2)}`).join('') + 'Z';
  const outline = `M${x - w / 2} ${base}L${x - wt / 2} ${shaftTop}L${x} ${top}L${x + wt / 2} ${shaftTop}L${x + w / 2} ${base}`;
  const by = base - (base - shaftTop) * 0.3;
  const bx0 = x - w / 2 + ((w - wt) / 2) * 0.3;
  return (
    <>
      <path d={d(L)} fill={FAR.obShade} />
      <path d={d(R)} fill={FAR.obLit} />
      <path d={d(capL)} fill={FAR.obShade} />
      <path d={d(capR)} fill={FAR.obLit} />
      <path d={`M${bx0 + 1} ${by}L${2 * x - bx0 - 1} ${by}`} stroke={FAR.obLine} strokeWidth={0.9} fill="none" />
      <path d={outline} stroke={FAR.obLine} strokeWidth={1.25} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
};
