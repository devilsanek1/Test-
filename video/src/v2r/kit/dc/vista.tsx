// dc/vista.tsx: the FAR and RIVER planes of the Arlington view (TREATMENT section 6; CINEMATIC_GUIDE "Scale cues").
// All authored in END-frame coordinates (the screen when the crane lands, horizon y 800) and wide enough for the
// crane's slide (the far plane is seen from end-x ~830..1830 at the start, 0..1080 at the end).
//
//   FAR (step 65 %, no ink): the high cloud bars, the hero cloud bank (>= 1 W, flat base, lobed top >= y 623 so it
//        stays >= 610 at the start's 1.08x), the sun (lands cut by the right edge; it IS SUN1 at the start), the far
//        hills, the low white city packed in rows, and THE OBELISK (the one far shape over the horizon, huge yet far:
//        its shade face one step darker, a hairline in its shade colour, the cloud bank's saddle behind it).
//   RIVER (step 40 %, no ink): the far shore's cherry fringe (April without words), the Potomac with glints, rowers
//        and two small sails, Memorial Bridge's low arches on the left, the near bank's park trees and the parkway
//        with tiny cars, the boat basin; a deep band of parkland below it (seen while the mid plane rises into place).
// Life is a pure function of scene time (cars, rowers, sails, glints, cloud drift); nothing fades.

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {Batch, Paint, atm, atmShade, mix, cloudD, crownD, circleD, ellD, lineD, polyD, ribbonD, rng, rand, frac, type Pt} from './core';

// ---------------------------------------------------------------- the frame's numbers (end coords)

export const VISTA = {
  horizonY: 800,
  /** The far plane content spans this x range (end coords). */
  x0: -700,
  x1: 2000,
  /** The obelisk: centre x, base (hidden by the far shore) and top (>= 623, so >= 610 at the start's 1.08x). */
  obelisk: {x: 396, base: 836, top: 626, w: 25},
  /** The sun at the END (cut by the right edge). At the start it maps exactly onto SUN1 (250, 650) r 65 (crane.ts). */
  sun: {x: 1058.5, y: 661.1, r: 60.2},
  /** The hero cloud bank: flat base on the horizon, lobed top (>= 623); a low saddle behind the obelisk. */
  bank: {x0: 170, x1: 1990, base: 800, topMin: 626},
  /** The far city band (the far shore at y 836). */
  cityY: [804, 836] as [number, number],
  /** The river plane: far shore, water, near bank, the deep parkland band. */
  river: {shore: 834, water: [836, 857] as [number, number], nearBank: [855, 880] as [number, number], deep: 1120},
};

// ---------------------------------------------------------------- tones

export const VT = {
  // far (65 %)
  hill: atm(CM.sage, 4),
  hillFar: mix(atm(CM.sage, 4), CM.sky, 0.4),
  cityLit: atm(CM.paper, 4),
  cityWarm: atm(CM.stucco, 4),
  cityStone: atm(CM.limestone, 4),
  cityShade: atmShade(CM.stoneShade, 4),
  cityRoof: atmShade(mix(CM.stoneShade, CM.brick, 0.25), 4),
  cityBrick: atm(CM.brickDeep, 4),
  cityTree: atmShade(CM.sage, 4),
  cityGlass: atmShade(CM.glass, 4),
  // the obelisk: one step nearer than its plane (the darkest far shape on the palest cloud)
  obLit: atm(CM.limestone, 3),
  obShade: atmShade(mix(CM.stoneShade, CM.limestone, 0.2), 3),
  obInk: mix(atmShade(CM.stoneShade, 3), CM.shadeWarm, 0.35),
  // sky
  bankCrown: CM.paper,
  bankBody: mix(CM.stucco, CM.paper, 0.35),
  bankBelly: mix(CM.stoneShade, CM.sky, 0.25),
  bankSaddle: mix(CM.stucco, CM.skyHigh, 0.5),
  barLit: CM.paper,
  barBody: CM.skyHigh,
  bandHigh: CM.skyHigh,
  bandGold: CM.bandGold,
  // river (40 %)
  shoreBlossom: atm(CM.blossom, 3),
  shoreTree: atmShade(CM.sage, 3),
  shoreTreeLit: atm(CM.sage, 3),
  water: atm(CM.water, 3),
  waterDeep: atm(CM.waterDeep, 3),
  glint: atm(CM.paper, 2),
  bridge: atm(CM.limestone, 3),
  bridgeShade: atmShade(CM.stoneShade, 3),
  park: atm(mix(CM.sage, CM.paper, 0.15), 3),
  parkDeep: atmShade(CM.sage, 3),
  road: atm(CM.paving, 3),
  boat: atm(CM.paper, 2),
  rower: atmShade(CM.coatSlate, 2),
  carCols: [CM.coatSlate, CM.coatMustard, CM.paper, CM.coatPlum, CM.brick, CM.coatOat].map((c) => atm(c, 3)),
};

// ---------------------------------------------------------------- the sky pieces (far plane)

/** The hero cloud bank's lobes: [centre x, width, height above the base]. Tops >= 626; a saddle behind the obelisk;
 *  low under the sun (its disc stays whole at the start: SUN1 is a full disc at the S4 match). */
const BANK_LOBES: [number, number, number][] = [
  [205, 190, 88],
  [298, 210, 118],
  [396, 170, 82], // the saddle behind the obelisk (top 718)
  [505, 240, 150],
  [660, 300, 172],
  [820, 260, 140],
  [955, 230, 104],
  [1060, 200, 70], // under the sun: low (top 730 < the sun's bottom 721? no: below it, 730 > 721)
  [1182, 240, 90],
  [1310, 300, 166],
  [1480, 280, 140],
  [1650, 320, 160],
  [1840, 300, 120],
  [1975, 200, 80],
];

export const CloudBank: React.FC<{seed?: string}> = ({seed = 'bank'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const {x0, x1, base} = VISTA.bank;
    // body (the whole bank), then the crown (the lit tops, offset up-right toward the sun), then the flat belly
    B.fill(VT.bankBody, cloudD(x0, x1, base + 2, BANK_LOBES));
    B.layer();
    const crown = BANK_LOBES.map(([cx, w, h]) => [cx + w * 0.05, w * 0.74, h] as [number, number, number]);
    for (let i = 0; i < crown.length; i++) {
      const [cx, w, h] = crown[i];
      B.fill(VT.bankCrown, cloudD(cx - w / 2, cx + w / 2, base - h * 0.42, [[cx + w * 0.06, w * 0.86, h * 0.58]]));
    }
    B.layer();
    // the belly: a flat darker strip along the base, with soft scallops
    const belly: Pt[] = [[x0 + 30, base + 2]];
    for (let x = x0 + 30; x <= x1 - 30; x += 70) belly.push([x + 35, base - 18 - 6 * Math.sin(x * 0.021)]);
    belly.push([x1 - 30, base + 2]);
    B.poly(VT.bankBelly, belly);
    // the saddle behind the obelisk: a paler, lower field so the needle reads dark on light
    B.fill(VT.bankSaddle, cloudD(330, 470, base - 10, [[398, 130, 62]]));
    return B;
  }, []);
  return <Paint b={b} seed={seed} misreg={false} />;
};

/** Thin high cloud bars in the top gutter (y 120-290), drifting `drift` px/s (huge means slow: <= 6). */
export const HighBars: React.FC<{drift?: number; seed?: string}> = ({drift = 4, seed = 'bars'}) => {
  const t = useTime();
  const bars = useMemo(() => {
    const r = rng(seed);
    const out: {x: number; y: number; w: number; h: number}[] = [];
    const rows = [148, 196, 236, 278];
    for (let i = 0; i < 9; i++) out.push({x: -600 + i * 300 + r.range(-60, 60), y: rows[i % rows.length] + r.range(-10, 10), w: r.range(170, 420), h: r.range(12, 20)});
    return out;
  }, [seed]);
  const dx = drift * t;
  let body = '';
  let lit = '';
  for (const s of bars) {
    const x = s.x + dx;
    body += cloudD(x, x + s.w, s.y + s.h, [
      [x + s.w * 0.3, s.w * 0.55, s.h * 1.05],
      [x + s.w * 0.68, s.w * 0.6, s.h * 0.85],
    ]);
    lit += cloudD(x + s.w * 0.12, x + s.w * 0.7, s.y + s.h * 0.45, [[x + s.w * 0.4, s.w * 0.5, s.h * 0.55]]);
  }
  return (
    <>
      <path d={body} fill={VT.barBody} />
      <path d={lit} fill={VT.barLit} />
    </>
  );
};

/** The April morning's flat horizon bands (below y 600 only): a cool high step over the gold band. */
export const SkyBands: React.FC = () => (
  <>
    <rect x={VISTA.x0} y={694} width={VISTA.x1 - VISTA.x0} height={60} fill={VT.bandHigh} />
    <rect x={VISTA.x0} y={754} width={VISTA.x1 - VISTA.x0} height={60} fill={VT.bandGold} />
  </>
);

// ---------------------------------------------------------------- the sun (+ the APRIL 2026 calendar flip)

export type SunProps = {
  x?: number;
  y?: number;
  r?: number;
  /** 20.76 "April": the disc flips into a calendar page APRIL 2026 and back by 21.20 (scene s). */
  flip?: [number, number];
  label?: [string, string];
};

/** The sun disc (the pop, 1-3 %), optionally flipping into a calendar page and back (a squash-flip, never a fade). */
export const SunDisc: React.FC<SunProps> = ({x = VISTA.sun.x, y = VISTA.sun.y, r = VISTA.sun.r, flip, label = ['APRIL', '2026']}) => {
  const t = useTime();
  // flip phases: 0 -> 0.12 s squash the disc to a line; the page grows; hold; squash the page; the disc returns
  let mode: 'disc' | 'page' = 'disc';
  let sx = 1;
  if (flip) {
    const [a, b] = flip;
    const q = 0.09;
    if (t >= a && t < a + q) sx = 1 - (t - a) / q;
    else if (t >= a + q && t < b - q) {
      mode = 'page';
      sx = Math.min(1, (t - a - q) / q);
    } else if (t >= b - q && t < b) {
      mode = 'page';
      sx = 1 - (t - (b - q)) / q;
    } else if (t >= b && t < b + q) sx = (t - b) / q;
  }
  sx = Math.max(0.02, sx);
  if (mode === 'disc') {
    return (
      <g transform={`translate(${x} ${y}) scale(${sx.toFixed(3)} 1)`}>
        <circle r={r} fill={CM.sun} />
      </g>
    );
  }
  // the calendar page: paper, a sun-orange header band with two rings, APRIL / 2026 in the hand font
  const w = r * 1.86;
  const h = r * 2.0;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx.toFixed(3)} 1)`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={CM.paper} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.34} rx={6} fill={CM.sun} />
      <circle cx={-w * 0.24} cy={-h / 2 + 4} r={5} fill={CM.ink} />
      <circle cx={w * 0.24} cy={-h / 2 + 4} r={5} fill={CM.ink} />
      <text x={0} y={-h / 2 + h * 0.27} textAnchor="middle" fontFamily="CaptionHand, 'Patrick Hand', cursive" fontSize={r * 0.5} fill={CM.ink}>
        {label[0]}
      </text>
      <text x={0} y={h * 0.32} textAnchor="middle" fontFamily="CaptionHand, 'Patrick Hand', cursive" fontSize={r * 0.66} fill={CM.ink}>
        {label[1]}
      </text>
      <path d={`M${-w / 2} ${-h / 2 + 6}V${h / 2 - 6}Q${-w / 2} ${h / 2} ${-w / 2 + 6} ${h / 2}H${w / 2 - 6}Q${w / 2} ${h / 2} ${w / 2} ${h / 2 - 6}V${-h / 2 + 6}`} fill="none" stroke={CM.ink} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- the far city + the obelisk

type Block = {x: number; w: number; top: number; base: number; col: string; shade: string; roof?: string};

/** The low white city: 5-6 packed rows of small blocks from the far shore up, a few marks (domes, a red castle,
 *  a temple) at true-ish bearings from the viewpoint. Detail peaks just under the horizon (CINEMATIC_GUIDE 3, 4). */
function cityBlocks(seed: string): {blocks: Block[]; marks: string[]} {
  const r = rng(seed);
  const blocks: Block[] = [];
  const [yTop, yBase] = VISTA.cityY;
  const rows = 6;
  const cols = [VT.cityLit, VT.cityStone, VT.cityWarm, VT.cityLit, VT.cityStone];
  for (let row = 0; row < rows; row++) {
    const base = yTop + 4 + ((yBase - yTop - 4) * (row + 1)) / rows; // farther rows higher
    const hMax = 5 + row * 1.6;
    let x = VISTA.x0 + r.range(0, 12);
    while (x < VISTA.x1) {
      const w = r.range(6, 16) * (0.8 + row * 0.08);
      const h = r.range(hMax * 0.5, hMax) * (r.chance(0.07) ? 1.8 : 1);
      blocks.push({x, w, top: base - h, base, col: r.pick(cols), shade: VT.cityShade, roof: r.chance(0.2) ? VT.cityRoof : undefined});
      x += w * r.range(0.62, 0.95);
    }
  }
  // tree breaks along the Mall and the shore (dark-ish clumps between the rows)
  const marks: string[] = [];
  for (let i = 0; i < 70; i++) {
    const x = r.range(VISTA.x0, VISTA.x1);
    marks.push(crownD(x, yBase - r.range(1, 8), r.range(5, 11), r.range(2.5, 4), `${seed}/tr${i}`, 4, 0.5));
  }
  return {blocks, marks};
}

/** The far hills (beyond the city), the city rows, the landmark marks and the obelisk. */
export const FarCity: React.FC<{seed?: string}> = ({seed = 'city'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    // far hills: two flat stepped ridges on the horizon, running past both ends of the plane
    const ridge = (y0: number, amp: number, col: string, k: string) => {
      const r = rng(k);
      const pts: Pt[] = [[VISTA.x0, 820]];
      for (let x = VISTA.x0; x <= VISTA.x1; x += 40) pts.push([x, y0 - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + r.range(0, 6))) - r.range(0, 2)]);
      pts.push([VISTA.x1, 820]);
      B.poly(col, pts);
    };
    ridge(800, 9, VT.hillFar, `${seed}/r0`);
    ridge(806, 6, VT.hill, `${seed}/r1`);
    B.layer();
    const {blocks, marks} = cityBlocks(seed);
    // rows back to front (blocks are already generated back -> front)
    for (const bl of blocks) {
      B.rect(bl.col, bl.x, bl.top, bl.w, bl.base - bl.top);
      // one shade side on the left (the sun is on the right) and a roof line
      B.rect(bl.shade, bl.x, bl.top, Math.max(1, bl.w * 0.3), bl.base - bl.top);
      if (bl.roof) B.rect(bl.roof, bl.x, bl.top, bl.w, 1.6);
    }
    B.layer();
    for (const m of marks) B.fill(VT.cityTree, m);
    B.layer();
    // landmarks (tiny, one step each): a dome far right (the Capitol's bearing), a dome behind the Pentagon (the
    // Jefferson's), a red-brick castle with towers, a long white temple on the far shore at the left
    const dome = (cx: number, base: number, rr: number) => {
      B.rect(VT.cityStone, cx - rr * 1.6, base - rr * 0.9, rr * 3.2, rr * 0.9);
      B.fill(VT.cityLit, `M${cx - rr} ${base - rr * 0.9}a${rr} ${rr} 0 0 1 ${rr * 2} 0Z`);
      B.fill(VT.cityShade, `M${cx - rr} ${base - rr * 0.9}a${rr} ${rr} 0 0 1 ${rr * 0.8} ${-rr * 0.92}L${cx - rr * 0.2} ${base - rr * 0.9}Z`);
      B.rect(VT.cityLit, cx - 1, base - rr * 2.4, 2, rr * 0.6);
    };
    dome(1022, 812, 9.5);
    dome(1612, 822, 8);
    dome(905, 830, 6.5);
    // the castle (red sandstone: brick at 65 %): a block with three towers
    B.rect(VT.cityBrick, 640, 820, 34, 12);
    B.rect(VT.cityBrick, 642, 812, 5, 10);
    B.rect(VT.cityBrick, 655, 809, 6, 12);
    B.rect(VT.cityBrick, 668, 813, 4, 9);
    // the temple on the far shore (left): a long low white box with a darker colonnade band
    B.rect(VT.cityLit, 168, 822, 46, 13);
    B.rect(VT.cityShade, 172, 826, 38, 5);
    B.rect(VT.cityRoof, 168, 820, 46, 2.5);
    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={false} />;
};

/** THE OBELISK (the Washington Monument's shape: a tapering square shaft ~10:1, a small pyramid cap; marble). The
 *  morning sun is to the right: the right face lit, the left face a step darker; a hairline in its shade colour. */
export const Obelisk: React.FC<{x?: number; base?: number; top?: number; w?: number}> = ({x = VISTA.obelisk.x, base = VISTA.obelisk.base, top = VISTA.obelisk.top, w = VISTA.obelisk.w}) => {
  const capH = w * 1.15;
  const shaftTop = top + capH;
  const wt = w * 0.72; // the shaft tapers
  const L: Pt[] = [
    [x - w / 2, base],
    [x - wt / 2, shaftTop],
    [x - wt * 0.1, shaftTop],
    [x - w * 0.1, base],
  ];
  const R: Pt[] = [
    [x - w * 0.1, base],
    [x - wt * 0.1, shaftTop],
    [x + wt / 2, shaftTop],
    [x + w / 2, base],
  ];
  const capL: Pt[] = [
    [x - wt / 2, shaftTop],
    [x, top],
    [x - wt * 0.1, shaftTop],
  ];
  const capR: Pt[] = [
    [x - wt * 0.1, shaftTop],
    [x, top],
    [x + wt / 2, shaftTop],
  ];
  const outline = lineD([[x - w / 2, base], [x - wt / 2, shaftTop], [x, top], [x + wt / 2, shaftTop], [x + w / 2, base]]);
  // the faint level line where the stone colour changes a third of the way up (the real monument's two marbles)
  const band = lineD([
    [x - w / 2 + (w - wt) * 0.16, base - (base - shaftTop) * 0.31],
    [x + w / 2 - (w - wt) * 0.16, base - (base - shaftTop) * 0.31],
  ]);
  return (
    <>
      <path d={polyD(L)} fill={VT.obShade} />
      <path d={polyD(R)} fill={VT.obLit} />
      <path d={polyD(capL)} fill={VT.obShade} />
      <path d={polyD(capR)} fill={VT.obLit} />
      <path d={band} stroke={VT.obInk} strokeWidth={1} fill="none" />
      <path d={outline} stroke={VT.obInk} strokeWidth={1.3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- the river plane

/** Memorial Bridge's low arches (left) and the 14th Street spans (right, behind the Pentagon). */
function bridges(B: Batch) {
  const deckY = 841;
  // Memorial Bridge: a stone deck with a parapet and nine low arches, from the far shore toward us at the left
  const x0 = -560;
  const x1 = 210;
  B.rect(VT.bridge, x0, deckY - 3, x1 - x0, 6);
  B.rect(VT.bridgeShade, x0, deckY + 3, x1 - x0, 6);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const ax = x0 + ((i + 0.5) * (x1 - x0)) / n;
    const aw = ((x1 - x0) / n) * 0.62;
    B.fill(VT.waterDeep, `M${ax - aw / 2} ${deckY + 9}Q${ax} ${deckY + 3} ${ax + aw / 2} ${deckY + 9}Z`);
  }
  // 14th Street: three flat spans on thin piers (right)
  for (const [a, b2, y] of [
    [1150, 1700, 843],
    [1170, 1720, 848],
  ] as [number, number, number][]) {
    B.rect(VT.bridge, a, y - 2, b2 - a, 3.5);
    for (let x = a + 20; x < b2; x += 46) B.rect(VT.bridgeShade, x, y + 1.5, 2.5, 6);
  }
}

export const RiverPlane: React.FC<{seed?: string}> = ({seed = 'river'}) => {
  const t = useTime();
  const R = VISTA.river;
  const stat = useMemo(() => {
    const B = new Batch();
    const r = rng(seed);
    // the deep parkland band below (seen only while the mid plane rises), then the near bank's base
    B.rect(VT.parkDeep, VISTA.x0, R.nearBank[0], VISTA.x1 - VISTA.x0, R.deep - R.nearBank[0]);
    for (let i = 0; i < 260; i++) {
      const x = r.range(VISTA.x0, VISTA.x1);
      const y = r.range(R.nearBank[0] + 8, R.deep - 6);
      const s = 0.7 + (y - R.nearBank[0]) / 120;
      B.fill(r.chance(0.3) ? VT.shoreBlossom : r.chance(0.5) ? VT.shoreTreeLit : VT.shoreTree, crownD(x, y, r.range(6, 13) * s, r.range(3.5, 7) * s, `${seed}/dp${i}`, 5, 0.4));
    }
    B.layer();
    // the water
    B.rect(VT.water, VISTA.x0, R.water[0], VISTA.x1 - VISTA.x0, R.water[1] - R.water[0]);
    B.rect(VT.waterDeep, VISTA.x0, R.water[0], VISTA.x1 - VISTA.x0, 3);
    // the far shore: a thin cherry fringe (pink, the Tidal Basin's April) with darker trunks of trees between
    B.layer();
    for (let x = VISTA.x0; x < VISTA.x1; x += r.range(5, 11)) {
      const pink = Math.sin(x * 0.013) > -0.15;
      B.fill(pink ? VT.shoreBlossom : VT.shoreTree, crownD(x, R.shore - 1, r.range(4, 8), r.range(2, 3.4), `${seed}/fs${Math.round(x)}`, 4, 0.5));
    }
    B.layer();
    bridges(B);
    // the near bank: park trees, the parkway (a thin pale road), the boat basin
    B.layer();
    B.rect(VT.park, VISTA.x0, R.nearBank[0], VISTA.x1 - VISTA.x0, R.nearBank[1] - R.nearBank[0]);
    B.rect(VT.road, VISTA.x0, 861, VISTA.x1 - VISTA.x0, 3);
    // the boat basin (a lagoon inlet), right of centre
    B.fill(VT.water, ellD(760, 869, 110, 7));
    for (let i = 0; i < 16; i++) B.rect(VT.boat, 670 + i * 11 + r.range(-2, 2), 866 + (i % 2) * 4, 6, 2.2);
    B.layer();
    for (let i = 0; i < 160; i++) {
      const x = r.range(VISTA.x0, VISTA.x1);
      if (x > 640 && x < 880) continue;
      const y = r.range(R.nearBank[0] + 4, R.nearBank[1]);
      B.fill(r.chance(0.28) ? VT.shoreBlossom : r.chance(0.45) ? VT.shoreTreeLit : VT.shoreTree, crownD(x, y, r.range(5, 9), r.range(3, 5), `${seed}/nb${i}`, 5, 0.45));
    }
    return B;
  }, [seed]);

  // life: glints (a few switch every ~0.4 s), rowers (slow), two sails, cars on the parkway
  const glints = useMemo(() => {
    const r = rng(`${seed}/gl`);
    return Array.from({length: 46}, () => ({x: r.range(VISTA.x0, VISTA.x1), y: r.range(R.water[0] + 4, R.water[1] - 3), w: r.range(5, 12), ph: r.range(0, 1), hz: r.range(0.6, 1.4)}));
  }, [seed]);
  let gd = '';
  for (const g of glints) if (frac(t * g.hz + g.ph) < 0.55) gd += `M${(g.x).toFixed(1)} ${g.y.toFixed(1)}h${g.w.toFixed(1)}`;
  const rowers = [
    {x0: 120, v: 9, y: 846},
    {x0: 980, v: -7, y: 851},
    {x0: 1420, v: 8, y: 848},
  ];
  let rw = '';
  for (const rr of rowers) {
    const x = rr.x0 + rr.v * t;
    const stroke = Math.sin(t * 6.2 + rr.x0) * 2;
    rw += `M${x - 8} ${rr.y}h16M${x - 3} ${rr.y - 3 + stroke}l2 6M${x + 3} ${rr.y - 3 - stroke}l-2 6`;
  }
  const sails = [
    {x0: 560, v: 3, y: 852},
    {x0: 1260, v: -2.5, y: 846},
  ];
  let sd = '';
  for (const s of sails) {
    const x = s.x0 + s.v * t;
    sd += `M${x} ${s.y}l5 -13l4 13Z`;
  }
  // cars on the parkway: both ways, ~40 px/s far away (~70 km/h at this distance), steady flow
  const cars: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const dir = i % 2 ? 1 : -1;
    const span = VISTA.x1 - VISTA.x0;
    const x = VISTA.x0 + frac(rand(seed, `car${i}`) + (dir * t * 38) / span) * span;
    cars.push(<rect key={i} x={x} y={dir > 0 ? 860.5 : 862.5} width={6.5} height={2.4} fill={VT.carCols[i % VT.carCols.length]} />);
  }
  return (
    <>
      <Paint b={stat} seed={seed} misreg={false} />
      <path d={gd} stroke={VT.glint} strokeWidth={1.6} strokeLinecap="round" />
      <path d={rw} stroke={VT.rower} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <path d={sd} fill={VT.boat} />
      {cars}
    </>
  );
};

/** The whole far plane in one piece (sky bands, high bars, the sun, the cloud bank, the hills, city and obelisk). */
export const FarPlane: React.FC<{sun?: SunProps; seed?: string; bars?: boolean}> = ({sun, seed = 'far', bars = true}) => (
  <>
    <SkyBands />
    {bars ? <HighBars seed={`${seed}/bars`} /> : null}
    <SunDisc {...sun} />
    <CloudBank seed={`${seed}/bank`} />
    <FarCity seed={`${seed}/city`} />
    <Obelisk />
  </>
);

void circleD;
void ribbonD;
