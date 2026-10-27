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

type Tone = {faces: [string, number][]; shade: string; roofs: string[]; tree: string; tree2: string; blossom: string};

const BACK: Tone = {
  faces: [
    [FAR.backLit, 5],
    [FAR.backStone, 3],
    [FAR.backShade, 1],
  ],
  shade: FAR.backShade,
  roofs: [FAR.backRoof, FAR.backSlate, FAR.backLit, FAR.backTree],
  tree: FAR.backTree,
  tree2: FAR.backTree,
  blossom: FAR.backRoof,
};
const FRONT: Tone = {
  faces: [
    [FAR.lit, 6],
    [FAR.stone, 4],
    [FAR.warm, 3],
  ],
  shade: FAR.shade,
  roofs: [FAR.roofPink, FAR.roofSlate, FAR.roofCopper, FAR.roofLit],
  tree: FAR.tree,
  tree2: FAR.treeDark,
  blossom: FAR.blossom,
};

type Kind = 'block' | 'gable' | 'hip' | 'tower' | 'long' | 'trees';

/** One far building (2-4 flat shapes: a face, its shade side on the left (the sun is to the right), a roof). */
function building(B: Batch, kind: Kind, x: number, base: number, w: number, h: number, tone: Tone, face: string, roof: string, r: ReturnType<typeof rng>): {roofY: number} {
  const sh = Math.max(1, w * r.range(0.22, 0.34));
  switch (kind) {
    case 'gable': {
      const eave = base - h * 0.7;
      B.rect(face, x, eave, w, base - eave);
      B.rect(tone.shade, x, eave, sh, base - eave);
      B.poly(roof, [
        [x - 0.6, eave + 0.4],
        [x + w * 0.5, base - h],
        [x + w + 0.6, eave + 0.4],
      ]);
      return {roofY: base - h};
    }
    case 'hip': {
      const eave = base - h * 0.74;
      B.rect(face, x, eave, w, base - eave);
      B.rect(tone.shade, x, eave, sh, base - eave);
      B.poly(roof, [
        [x - 0.4, eave + 0.3],
        [x + w * 0.16, base - h],
        [x + w * 0.84, base - h],
        [x + w + 0.4, eave + 0.3],
      ]);
      return {roofY: base - h};
    }
    case 'tower': {
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x, base - h, sh, h);
      // a column of windows as one darker strip (no ink on far planes)
      if (w > 5) B.rect(tone.shade, x + w * 0.55, base - h + 2, Math.max(0.8, w * 0.14), h - 3);
      B.rect(roof, x - 0.3, base - h - 1.2, w + 0.6, 1.6);
      return {roofY: base - h - 1.2};
    }
    case 'long': {
      // a long federal block: a colonnade band in shade under a flat roof slab
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x + w * 0.04, base - h * 0.62, w * 0.92, h * 0.34);
      B.rect(tone.shade, x, base - h, sh * 0.7, h);
      B.rect(roof, x - 0.5, base - h - 1.6, w + 1, 2);
      return {roofY: base - h - 1.6};
    }
    case 'trees': {
      const n = Math.max(1, Math.round(w / 6));
      for (let i = 0; i < n; i++) {
        const cx = x + ((i + 0.5) * w) / n + r.jitter(1);
        const rr = r.range(3, 5.5) * Math.min(1.4, h / 10);
        B.fill(r.chance(0.3) ? tone.blossom : r.chance(0.5) ? tone.tree : tone.tree2, crownD(cx, base - rr * 0.85, rr, rr * 0.82, `t${x.toFixed(1)}/${i}`, 5, 0.5));
      }
      return {roofY: base - h};
    }
    default: {
      B.rect(face, x, base - h, w, h);
      B.rect(tone.shade, x, base - h, sh, h);
      B.rect(roof, x - 0.3, base - h - 1, w + 0.6, 1.5);
      return {roofY: base - h - 1};
    }
  }
}

/** A tick on a roof (every 3-4 roofs): a chimney, a cupola, a spire or a tree in front. */
function tick(B: Batch, x: number, w: number, roofY: number, base: number, tone: Tone, r: ReturnType<typeof rng>) {
  const k = r.pick(['chimney', 'chimney', 'cupola', 'spire', 'tree', 'tree'] as const);
  const cx = x + w * r.range(0.3, 0.75);
  if (k === 'chimney') B.rect(tone.shade, cx, roofY - r.range(2.2, 3.6), r.range(1.4, 2.2), r.range(2.6, 4));
  else if (k === 'cupola') {
    const rr = r.range(1.6, 2.6);
    B.rect(tone.roofs[0] === FAR.backRoof ? FAR.backLit : FAR.lit, cx - rr, roofY - rr * 0.9, rr * 2, rr * 0.9 + 0.4);
    B.poly(tone.roofs[2] ?? tone.shade, [
      [cx - rr, roofY - rr * 0.85],
      [cx - rr * 0.5, roofY - rr * 1.9],
      [cx + rr * 0.5, roofY - rr * 1.9],
      [cx + rr, roofY - rr * 0.85],
    ]);
  } else if (k === 'spire') {
    B.poly(tone.shade, [
      [cx - 1.1, roofY + 0.5],
      [cx, roofY - r.range(5, 8)],
      [cx + 1.1, roofY + 0.5],
    ]);
  } else {
    const rr = r.range(2.6, 4.2);
    B.fill(r.chance(0.35) ? tone.blossom : tone.tree, crownD(cx, base - rr * 0.7, rr, rr * 0.85, `tk${cx.toFixed(1)}`, 5, 0.45));
  }
}

const KINDS_BACK: [Kind, number][] = [
  ['block', 5],
  ['gable', 3],
  ['hip', 2],
  ['tower', 1],
  ['trees', 2],
];
const KINDS_FRONT: [Kind, number][] = [
  ['block', 5],
  ['gable', 3],
  ['hip', 3],
  ['long', 1.4],
  ['tower', 0.7],
  ['trees', 2.2],
];

/** Row spec: [base, width range, height range, tone, tick period]. Back rows smaller and denser (the detail peak). */
const ROWSPEC: {base: number; w: [number, number]; h: [number, number]; tone: Tone; tickEvery: number}[] = [
  {base: CITY.rows[0], w: [4.5, 8], h: [6, 11], tone: BACK, tickEvery: 3},
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
  let roof = spec.tone.roofs[0];
  let face = spec.tone.faces[0][0];
  let baseW = (spec.w[0] + spec.w[1]) / 2;
  let n = 0;
  while (x < CITY.x1) {
    if (run <= 0) {
      run = r.int(4, 6);
      kind = r.weighted(kinds);
      roof = r.pick(spec.tone.roofs);
      face = r.weighted(spec.tone.faces);
      baseW = r.range(spec.w[0], spec.w[1]);
    }
    run--;
    const w = baseW * r.range(0.85, 1.15) * (kind === 'long' ? 2.6 : kind === 'tower' ? 0.7 : 1);
    const h = r.range(spec.h[0], spec.h[1]) * (kind === 'tower' ? 1.55 : kind === 'long' ? 0.8 : 1);
    if (!skip || !skip(x, w)) {
      const f = r.chance(0.18) ? r.weighted(spec.tone.faces) : face;
      const {roofY} = building(B, kind, x, spec.base + r.range(-0.8, 0.8), w, h, spec.tone, f, roof, r);
      n++;
      if (kind !== 'trees' && n % spec.tickEvery === 0) tick(B, x, w, roofY, spec.base, spec.tone, r);
    }
    x += w * r.range(0.62, 0.92);
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
    ridge(CITY.horizon - 3, 13, FAR.hillFar, `${seed}/r0`, 0.0042);
    ridge(CITY.horizon + 1, 8, FAR.hill, `${seed}/r1`, 0.0061);
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
    cityRow(B, 2, seed);
    B.layer();
    // the museums along the Mall's far side (long colonnaded blocks), the castle on its south side
    {
      const r = rng(`${seed}/museums`);
      const y = CITY.mall.y - 7;
      for (let x = CITY.mall.x0 + 40; x < CITY.mall.x1 - 30; x += r.range(46, 70)) {
        if (Math.abs(x - CITY.obelisk.x) < 50 || Math.abs(x - CITY.castle.x) < 34) continue;
        building(B, 'long', x, y, r.range(26, 40), r.range(9, 12), FRONT, r.pick([FAR.lit, FAR.stone, FAR.warm]), r.pick([FAR.roofSlate, FAR.roofCopper, FAR.roofLit]), r);
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
    cityRow(B, 3, seed, (x, w) => (x + w > CITY.castle.x - 20 && x < CITY.castle.x + 20) || (x + w > CITY.obelisk.x - 18 && x < CITY.obelisk.x + 18));
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
