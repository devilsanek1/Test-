// V2S5_valley.tsx (lane L4): S5's MID ground and NEAR-MID slope, FORKED from the Arlington kit (kit/dc/valley.tsx,
// 2026-10-27) so they take S5's ONE atmosphere (conform_L4 §10; CRAFT §f): the kit's `atm` / `atmShade` (an sRGB mix
// toward the mint: far brick and sage go tan and olive) are aliased to V2S5_depth's `rcAtm` / `rcShade` (lib/depth
// recede toward the April gold), so the bodies below stay the kit's. The near-mid crowns take BLOOM_S5: calmer
// blossoming cherries on plane +1 (tier C: a mid-value mauve mass, never near-black; low contrast inside the crown; the
// slot stays framed by value, the news box keeps the frame's strongest contrast).
//   <MidGround5 />                 END coords (the MID plane, under the Pentagon)
//   <NearMid5 burstAt={0.21} />    START coords (through startMat(NEAR_MID_PL, p))
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, mix, crownD, ellD, lineD, polyD, ribbonD, rng, rand, frac, along, burstScale, blossomD, type Pt} from '../kit/dc/core';
import {rcAtm as atm, rcShade as atmShade} from './V2S5_depth';
import {MID, PENT, pentagon, shadowOffset} from '../kit/dc/lens';
import {BloomCrowns, type CrownSpec, type BloomTones} from '../kit/dc/bloom';
import {tiered} from '../kit/tiers';

// ---------------------------------------------------------------- MID ground tones (22 %)

export const MT5 = {
  lawn: atm(CM.sage, 2),
  lawnLit: atm(mix(CM.sage, CM.paper, 0.22), 2),
  lawnShade: atmShade(mix(CM.sage, CM.shadeWarm, 0.25), 2),
  road: atm(CM.paving, 2),
  roadEdge: atmShade(CM.stoneShade, 2),
  path: atm(mix(CM.paving, CM.paper, 0.4), 2),
  tree: atm(mix(CM.sage, CM.anchor, 0.16), 2),
  treeLit: atm(mix(CM.sage, CM.leafGold, 0.12), 2),
  treeDeep: atm(mix(CM.sage, CM.anchor, 0.32), 2),
  blossom: atm(CM.blossom, 2),
  blossomShade: atmShade(mix(CM.blossom, CM.shadeWarm, 0.35), 2),
  white: atm(CM.paper, 2),
  shadow: atmShade(mix(CM.sage, CM.shadeWarm, 0.5), 2),
  roof: atm(CM.brick, 2),
  roofShade: atmShade(CM.brickDeep, 2),
  wall: atm(CM.stucco, 2),
  person: [CM.coatSlate, CM.coatMustard, CM.coatPlum, CM.coatOat, CM.brickDeep].map((c) => atm(c, 1)),
  car: [CM.coatSlate, CM.paper, CM.coatMustard, CM.coatPlum, CM.brick, CM.coatOat, CM.paneUnlit].map((c) => atm(c, 2)),
};

/** Local ground extent of the mid plane (metres): x across, y from the near edge to the far tree line. */
export const MID_EXTENT5 = {x0: -2200, x1: 2200, y0: -720, y1: 245};

/** Washington Boulevard (Route 27) along the Pentagon's west side, and its ramp toward the front (local metres). */
export const WASH_BLVD5: Pt[] = [
  [-760, -720],
  [-600, -520],
  [-500, -330],
  [-440, -150],
  [-405, 30],
  [-385, 190],
  [-370, 340],
];
/** A lawn loop path round the building (joggers), local metres. */
const JOG_PATHS: Pt[][] = [
  // the path just outside the ring road, front and left sides
  [
    [-330, -300],
    [-120, -330],
    [120, -320],
    [330, -250],
    [420, -60],
  ],
  [
    [-330, -300],
    [-345, -120],
    [-330, 80],
    [-300, 260],
  ],
  [
    [80, 260],
    [300, 250],
    [420, 120],
    [470, -60],
  ],
];

const G = (q: Pt): Pt => MID.g(q[0], q[1]);
const proj = (pts: Pt[]) => pts.map(G);

/** A ground-plane ribbon (a road of width w metres) projected point by point. */
function groundRibbon(pts: Pt[], w: number): string {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    L.push(G([pts[i][0] + (nx * w) / 2, pts[i][1] + (ny * w) / 2]));
    R.push(G([pts[i][0] - (nx * w) / 2, pts[i][1] - (ny * w) / 2]));
  }
  return polyD([...L, ...R.reverse()]);
}

/** Densify a polyline (straight segments -> many points) so a projected ribbon follows the ground. */
function dense(pts: Pt[], step = 25): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** A tree at a ground point: a flat shadow toward the lens-left, a crown sized in metres. */
function tree(B: {shadow: string[]; crowns: Map<string, string[]>}, x: number, y: number, rM: number, col: string, seed: string) {
  const s = MID.pxPerM(x, y, 6);
  const c = MID.p([x, y, rM * 1.6]);
  const so = shadowOffset(rM * 2.2);
  const sc = MID.g(x + so[0] * 0.5, y + so[1] * 0.5);
  B.shadow.push(ellD(sc[0], sc[1] + 1, rM * s * 1.25, rM * s * 0.42));
  const arr = B.crowns.get(col) ?? [];
  arr.push(crownD(c[0], c[1], rM * s, rM * s * 0.78, seed, 6, 0.35));
  B.crowns.set(col, arr);
}

const MidGroundBody: React.FC<{seed?: string}> = ({seed = 'midg'}) => {
  const t = useTime();
  const stat = useMemo(() => {
    const B = new Batch();
    const r = rng(seed);
    const E = MID_EXTENT5;
    // the lawn (one ground quad), with broad mown bands one step lighter
    B.poly(MT5.lawn, proj([
      [E.x0, E.y1],
      [E.x1, E.y1],
      [E.x1, E.y0],
      [E.x0, E.y0],
    ]));
    for (let k = 0; k < 9; k++) {
      const y0 = E.y0 + k * 120 + 30;
      if (k % 2) B.poly(MT5.lawnLit, proj([[E.x0, y0 + 60], [E.x1, y0 + 60], [E.x1, y0], [E.x0, y0]]));
    }
    // the ring road round the building (no traffic: part of the reservation) and its link to the boulevard
    B.layer();
    const ringO = pentagon(PENT.apothem + 42).map(G);
    const ringI = pentagon(PENT.apothem + 34).map(G);
    B.fill(MT5.road, polyD(ringO) + polyD(ringI));
    B.fill(MT5.road, groundRibbon(dense([[-260, -150], [-400, -120]]), 9));
    // Washington Boulevard (4 lanes), with its kerb edges a step darker
    B.fill(MT5.roadEdge, groundRibbon(dense(WASH_BLVD5), 22));
    B.fill(MT5.road, groundRibbon(dense(WASH_BLVD5), 18));
    // the lawn paths (joggers)
    for (const p of JOG_PATHS) B.fill(MT5.path, groundRibbon(dense(p, 20), 3.2));

    // groves and street trees (never on the building, its ring or the roads)
    B.layer();
    const T = {shadow: [] as string[], crowns: new Map<string, string[]>()};
    const nearRoad = (x: number, y: number) => {
      for (const q of dense(WASH_BLVD5, 20)) if (Math.hypot(q[0] - x, q[1] - y) < 22) return true;
      return false;
    };
    const ok = (x: number, y: number) => {
      const rr = Math.hypot(x, y);
      return rr > PENT.apothem / Math.cos(Math.PI / 5) + 60 && !nearRoad(x, y);
    };
    const pickCol = () => (r.chance(0.26) ? MT5.blossom : r.chance(0.12) ? MT5.white : r.chance(0.5) ? MT5.treeLit : MT5.tree);
    // groves: clusters on the lawns
    for (let g = 0; g < 26; g++) {
      const cx = r.range(-1400, 1400);
      const cy = r.range(-600, 300);
      const n = r.int(4, 11);
      for (let k = 0; k < n; k++) {
        const x = cx + r.range(-55, 55);
        const y = cy + r.range(-35, 35);
        if (!ok(x, y) || y > E.y1 - 10) continue;
        tree(T, x, y, r.range(4, 7.5), pickCol(), `${seed}/g${g}/${k}`);
      }
    }
    // the lawns in front of the long facade and left of it: dense groves (cherries, oaks, dogwoods) round the paths
    for (let k = 0; k < 120; k++) {
      const x = r.range(-470, 260);
      const y = r.range(-345, -235);
      if (!ok(x, y)) continue;
      tree(T, x, y, r.range(3.4, 6.2), pickCol(), `${seed}/fg${k}`);
    }
    for (let k = 0; k < 80; k++) {
      const x = r.range(-520, -300);
      const y = r.range(-240, 230);
      if (!ok(x, y)) continue;
      tree(T, x, y, r.range(3.4, 6), pickCol(), `${seed}/lg${k}`);
    }
    // the boulevard's street trees, both sides
    for (let u = 0.02; u < 0.98; u += 0.035) {
      const {p, dir} = along(WASH_BLVD5, u);
      for (const sgn of [-1, 1]) {
        const x = p[0] - dir[1] * sgn * 20;
        const y = p[1] + dir[0] * sgn * 20;
        if (Math.hypot(x, y) < 300) continue;
        tree(T, x, y, r.range(3.6, 5.2), r.chance(0.35) ? MT5.blossom : MT5.tree, `${seed}/st${u.toFixed(3)}${sgn}`);
      }
    }
    // the far tree line (Columbia Island's edge) that meets the river plane
    for (let x = E.x0; x < E.x1; x += r.range(9, 16)) tree(T, x, E.y1 - r.range(0, 24), r.range(3.2, 5.5), pickCol(), `${seed}/fl${Math.round(x)}`);
    // the valley front: a band of crowns over the neighbourhood (near edge, mostly behind the balustrade)
    for (let x = -900; x < 1100; x += r.range(16, 30)) tree(T, x, r.range(-700, -560), r.range(6, 9), pickCol(), `${seed}/vf${Math.round(x)}`);
    // the slope's foot just beyond the balustrade: a dense dark band of crowns that the rail's pale stone reads against
    // (the drop: we look down onto treetops), a few in blossom
    const darkCols = [MT5.treeDeep, MT5.tree, MT5.treeDeep, MT5.blossomShade];
    for (let x = -1000; x < 1400; x += r.range(8, 15)) tree(T, x, r.range(-395, -300), r.range(4.2, 7.5), r.pick(darkCols), `${seed}/sf${Math.round(x)}`);
    B.fill(MT5.shadow, T.shadow.join(''));
    B.layer();
    T.crowns.forEach((parts, col) => B.fill(col, parts.join('')));
    return B;
  }, [seed]);

  // ---- life: cars on the boulevard (both ways), joggers on the paths
  const blvd = useMemo(() => dense(WASH_BLVD5, 15), []);
  const cars: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const dir = i % 2 ? 1 : -1;
    const u = frac(rand(seed, `c${i}`) + (dir * t * 15) / 1200);
    const {p, dir: d} = along(blvd, u);
    const lane = dir * 4.5;
    const q: Pt = [p[0] - d[1] * lane, p[1] + d[0] * lane];
    const a = G(q);
    const b = G([q[0] + d[0] * 4.6, q[1] + d[1] * 4.6]);
    const s = MID.pxPerM(q[0], q[1]);
    cars.push(<path key={`c${i}`} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`} stroke={MT5.car[i % MT5.car.length]} strokeWidth={Math.max(2.4, s * 1.9)} strokeLinecap="round" />);
  }
  const joggers: React.ReactNode[] = [];
  let ji = 0;
  for (const path of JOG_PATHS) {
    const d = dense(path, 10);
    for (let k = 0; k < 3; k++, ji++) {
      const dir = (ji % 2 ? 1 : -1) * (0.9 + rand(seed, `jv${ji}`) * 0.5);
      const u = frac(rand(seed, `j${ji}`) + (dir * t * 3) / 520);
      const {p} = along(d, u);
      const g = G(p);
      const s = MID.pxPerM(p[0], p[1]);
      const h = Math.max(4.5, s * 2.3); // a person, a touch over true size so the speck reads as one
      const bob = Math.abs(Math.sin(t * 9 + ji)) * 0.6;
      joggers.push(
        <g key={`j${ji}`}>
          <rect x={g[0] - h * 0.17} y={g[1] - h * 0.78 - bob} width={h * 0.34} height={h * 0.6} rx={h * 0.12} fill={MT5.person[ji % MT5.person.length]} />
          <circle cx={g[0]} cy={g[1] - h * 0.9 - bob} r={h * 0.15} fill={atm(CM.hair[ji % CM.hair.length], 1)} />
        </g>,
      );
    }
  }
  return (
    <>
      <Paint b={stat} seed={seed} misreg={false} />
      {cars}
      {joggers}
    </>
  );
};
export const MidGround5 = tiered('environment', {}, MidGroundBody);

/** S5's blossoming near-mid cherries (plane +1): the kit's BLOOM_NEAR lifted (the mass a mid mauve, L* ~48-55, not the
 *  near-black plum), the clumps and flowers closer together, all receded one step toward the April air. */
export const BLOOM_S5: BloomTones = {
  base: atm(mix(CM.shadeWarm, CM.blossom, 0.12), 1),
  limb: atm(mix(CM.anchor, CM.shadeWarm, 0.45), 1),
  shade: atm(mix(CM.shadeWarm, CM.blossom, 0.42), 1),
  mid: atm(mix(CM.shadeWarm, CM.blossom, 0.64), 1),
  lit: atm(mix(CM.blossom, CM.brickLight, 0.12), 1),
  flower: atm(CM.blossom, 1),
  flowerShade: atm(mix(CM.blossom, CM.shadeWarm, 0.26), 1),
  white: atm(mix(CM.paper, CM.blossom, 0.55), 1),
  bud: atm(mix(CM.leafRust, CM.shadeWarm, 0.25), 1),
};

// ---------------------------------------------------------------- the NEAR-MID slope (START coordinates)

export const NT5 = {
  crownDark: mix(CM.shadeWarm, CM.anchor, 0.25),
  crown: CM.shadeWarm,
  crownLit: mix(CM.brickDeep, CM.shadeWarm, 0.35),
  crownSage: mix(CM.sage, CM.shadeWarm, 0.55),
  crownRim: mix(CM.brickLight, CM.blossom, 0.35),
  branch: CM.anchor,
  bud: mix(CM.leafRust, CM.shadeWarm, 0.3),
  blossom: CM.blossom,
  blossomShade: mix(CM.blossom, CM.shadeWarm, 0.38),
  hedge: mix(CM.sage, CM.anchor, 0.5),
  roof: mix(CM.brickDeep, CM.shadeWarm, 0.3),
};

/** The near-mid layout in START coordinates (the frame at the hold 20.55-21.30). */
export const NEAR_MID5 = {
  /** The slot's bottom edge: the small slot trees' tops (contract: the bright slot x 150-560, y 580-880). */
  slotBottom: 880,
  /** The big tree that stands where the Pentagon will land (right), and the left mass. */
  bigTree: {cx: 830, cy: 790, rx: 320, ry: 205, trunkX: 760},
  /** The light at the start: the sun in the slot (SUN1). Crowns are lit on the side facing it. */
  light: [250, 650] as [number, number],
  leftMass: {x0: -80, x1: 172, top: 598},
};

type Crown = {cx: number; cy: number; rx: number; ry: number; col: string; seed: string; blossom: number};

/** The near-mid crowns (start coords), back to front. */
function nearCrowns(seed: string): Crown[] {
  const r = rng(seed);
  const out: Crown[] = [];
  const NM = NEAR_MID5;
  // the slope's back row of crowns behind the slot trees (dark), filling the slot's bottom band to the balustrade
  for (let x = -60; x < 1140; x += r.range(42, 70)) out.push({cx: x, cy: r.range(915, 960), rx: r.range(48, 76), ry: r.range(34, 48), col: r.pick([NT5.crown, NT5.crownDark, NT5.crownSage]), seed: `${seed}/b${Math.round(x)}`, blossom: r.range(0.2, 0.5)});
  // the slot trees: small crowns whose tops make the slot's bottom edge (they burst into blossom on "April")
  for (let x = 140; x < 600; x += r.range(34, 52)) out.push({cx: x, cy: NM.slotBottom + r.range(22, 34), rx: r.range(24, 38), ry: r.range(22, 30), col: r.pick([NT5.crownLit, NT5.crown, NT5.crownSage]), seed: `${seed}/s${Math.round(x)}`, blossom: r.range(0.55, 0.85)});
  // the left mass (x <= 172, top ~598): three overlapping crowns
  out.push({cx: 30, cy: 700, rx: 150, ry: 102, col: NT5.crown, seed: `${seed}/l0`, blossom: 0.6});
  out.push({cx: 110, cy: 800, rx: 92, ry: 80, col: NT5.crownLit, seed: `${seed}/l1`, blossom: 0.7});
  out.push({cx: -10, cy: 880, rx: 140, ry: 110, col: NT5.crownDark, seed: `${seed}/l2`, blossom: 0.45});
  // the big tree (right): one big crown of four lobes, warm-dark (the sun is behind it, on the left)
  const bt = NM.bigTree;
  out.push({cx: bt.cx + 20, cy: bt.cy + 40, rx: bt.rx, ry: bt.ry * 0.95, col: NT5.crownDark, seed: `${seed}/t0`, blossom: 0.5});
  out.push({cx: bt.cx - 150, cy: bt.cy + 10, rx: 170, ry: 150, col: NT5.crown, seed: `${seed}/t1`, blossom: 0.75});
  out.push({cx: bt.cx + 120, cy: bt.cy - 40, rx: 200, ry: 160, col: NT5.crown, seed: `${seed}/t2`, blossom: 0.7});
  out.push({cx: bt.cx - 40, cy: bt.cy - 70, rx: 150, ry: 118, col: NT5.crownLit, seed: `${seed}/t3`, blossom: 0.8});
  return out;
}

export type NearMid5Props = {
  /** "April" (scene s): every cluster bursts into blossom within 4 frames. Undefined = in blossom already. */
  burstAt?: number;
  seed?: string;
};

/** The near-mid slope in START coords: the slope's crowns (dark masses, limbs, then blossom that bursts in 4 frames on
 *  "April"), lit on the side facing the sun in the slot; the big tree's trunk. */
const NearMidBody: React.FC<NearMid5Props> = ({burstAt, seed = 'nm'}) => {
  const crowns = useMemo(() => nearCrowns(seed), [seed]);
  const specs = useMemo<CrownSpec[]>(
    () =>
      crowns.map((c) => {
        const dx = NEAR_MID5.light[0] - c.cx;
        const dy = NEAR_MID5.light[1] - c.cy;
        const dl = Math.hypot(dx, dy) || 1;
        return {cx: c.cx, cy: c.cy, rx: c.rx, ry: c.ry, seed: c.seed, light: [dx / dl, dy / dl] as Pt, bloom: 0.55 + c.blossom * 0.5};
      }),
    [crowns],
  );
  const trunk = useMemo(() => {
    const B = new Batch();
    const bt = NEAR_MID5.bigTree;
    B.poly(NT5.branch, [
      [bt.trunkX - 34, 1060],
      [bt.trunkX - 22, 930],
      [bt.trunkX - 60, 860],
      [bt.trunkX - 44, 852],
      [bt.trunkX - 4, 905],
      [bt.trunkX + 40, 840],
      [bt.trunkX + 58, 850],
      [bt.trunkX + 18, 935],
      [bt.trunkX + 26, 1060],
    ]);
    return B;
  }, []);
  return (
    <>
      <Paint b={trunk} seed={`${seed}/trunk`} misreg={3} />
      <BloomCrowns crowns={specs} burstAt={burstAt} seed={`${seed}/bl`} tones={BLOOM_S5} />
    </>
  );
};
export const NearMid5 = tiered('environment', {}, NearMidBody);

void ribbonD;
