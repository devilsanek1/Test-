// V2S7_near.tsx (lane L5): the BOTTOM THIRD of V2S7: things, FEW and BIG, cut by the frame's edges (conform_L5 §3;
// THROUGHLINE §1.5: no stranger's back anywhere near; DIRECTION rule 3). Every one is built in metres on the shot's ONE
// camera (V2S7_plan S7_CAM) and projected, so its edges run to the VP and its size falls with distance.
//   S7Cafe      plane -1: the bistro table (a round marble top 0.6 m, an iron pedestal), a bentwood chair in front of
//               it with its back to us and a slate coat over it, a second chair cut by the left edge; on the table two
//               cups on saucers and a folded newspaper
//   S7Planter   plane -1: a low timber planter of grasses, cut by the bottom edge, its west side receding to the VP
//   S7Basin     plane -0.5: the fountain basin at the right: its west end (lit by the low sun) and its near rim
//               (south: the shade step is V2S7_light's), the coping, the water, three STEADY jets in a row running
//               into the picture (a constant column with a slow shimmer: never rising and falling)
// Near planes get value range, not prop count (CRAFT §f): the colours are their plane-0 colours one near step darker
// (lib/depth recede -1 / -0.5); tier C (environment: flat fills, no outline). Nothing here rises over the board's
// bottom rail where it stands in front of it, nor near Pip (x 645-755, y >= 1100).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {recede} from '../../lib/depth';
import {Batch, Paint, lobes, ovalPath, rng} from '../kit/canal/core';
import {kz, pt, S7_ATM, S7_BASIN, S7_CAFE, type P2} from './V2S7_plan';

const near = (c: string, plane = -1) => recede(c, plane, S7_ATM);

/** A circle of radius r about (x, z) at `level`, projected (n points). */
const ring = (x: number, z: number, r: number, level: number, n = 40): P2[] => Array.from({length: n}, (_, i) => pt(x + r * Math.cos((i / n) * Math.PI * 2), z + r * Math.sin((i / n) * Math.PI * 2), level));
/** The near half of a ring (the band between two levels): the visible edge of a round top or a saucer. */
function ringBand(x: number, z: number, r: number, l0: number, l1: number, n = 24): P2[] {
  const top: P2[] = [];
  const bot: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (i / n);
    top.push(pt(x + r * Math.cos(a), z - r * Math.sin(a), l1));
    bot.push(pt(x + r * Math.cos(a), z - r * Math.sin(a), l0));
  }
  return [...top, ...bot.reverse()];
}
/** A vertical post (square section `w` m) from l0 to l1 at (x, z), as a screen quad. */
const post = (x: number, z: number, w: number, l0: number, l1: number): P2[] => [pt(x - w / 2, z, l1), pt(x + w / 2, z, l1), pt(x + w / 2, z, l0), pt(x - w / 2, z, l0)];
/** A box face helpers: a quad on a level (ground-parallel) or a frontal / side face. */
const flat = (x0: number, x1: number, z0: number, z1: number, l: number): P2[] => [pt(x0, z0, l), pt(x1, z0, l), pt(x1, z1, l), pt(x0, z1, l)];
const front = (x0: number, x1: number, z: number, l0: number, l1: number): P2[] => [pt(x0, z, l1), pt(x1, z, l1), pt(x1, z, l0), pt(x0, z, l0)];
const side = (x: number, z0: number, z1: number, l0: number, l1: number): P2[] => [pt(x, z0, l1), pt(x, z1, l1), pt(x, z1, l0), pt(x, z0, l0)];

// ---------------------------------------------------------------- the cafe (-1)

/** The cafe's colours, one near step darker than on the subject's plane. */
const CC = {
  marble: near(CM.limestone),
  marbleEdge: near(CM.stoneShade),
  iron: near(CM.coatSlate),
  wood: near(CM.line),
  woodLit: near(CM.leafRust),
  cane: near(CM.coatOat),
  cup: near(CM.paper),
  coffee: near(CM.brickDeep),
  saucer: near(CM.stucco),
  paper: near(CM.paper),
  print: near('#E6DCCB'),
  coat: near(CM.coatSlate),
  coatLit: near('#7D8BA0'),
  coatLining: near(CM.coatPlum),
} as const;

/** The near chair (back to us, in front of the table) and the chair cut by the left edge (plan m). */
export const CAFE_NEAR_CHAIR = {x: -0.78, z: 2.98, seat: 0.45, back: 0.86, w: 0.42, d: 0.4} as const;
export const CAFE_EDGE_CHAIR = {x: -1.2, z: 3.55, seat: 0.45, back: 0.86, w: 0.42, d: 0.4} as const;

/** A bentwood chair seen from behind or from its side: the far legs, the cane seat and its rim, the near legs, the
 *  hooped back (two uprights + a bent top rail + a mid rail). `backZ` = the back on the near (z0) or the far side. */
function chairInto(k: Batch, c: {x: number; z: number; seat: number; back: number; w: number; d: number}, o: {backNear: boolean}) {
  const x0 = c.x - c.w / 2;
  const x1 = c.x + c.w / 2;
  const z0 = c.z - c.d / 2;
  const z1 = c.z + c.d / 2;
  const leg = 0.028;
  // far legs (splayed a little), then the seat, its rim, then the near legs
  k.poly(CC.wood, post(x0 + 0.03, z1 - 0.03, leg, 0, c.seat - 0.02));
  k.poly(CC.wood, post(x1 - 0.03, z1 - 0.03, leg, 0, c.seat - 0.02));
  k.layer();
  k.poly(CC.cane, flat(x0, x1, z0, z1, c.seat));
  k.poly(CC.wood, front(x0, x1, z0, c.seat - 0.035, c.seat));
  k.layer();
  k.poly(CC.wood, post(x0 + 0.03, z0 + 0.03, leg, 0, c.seat - 0.02));
  k.poly(CC.wood, post(x1 - 0.03, z0 + 0.03, leg, 0, c.seat - 0.02));
  // a stretcher ring between the legs
  k.poly(CC.wood, front(x0 + 0.04, x1 - 0.04, z0 + 0.03, 0.16, 0.18));
  if (o.backNear) {
    // the hooped back on the near side, facing us
    const zb = z0 + 0.01;
    k.layer();
    k.poly(CC.wood, post(x0 + 0.025, zb, 0.03, c.seat, c.back - 0.02));
    k.poly(CC.wood, post(x1 - 0.025, zb, 0.03, c.seat, c.back - 0.02));
    const rail = (l: number, h: number, bow: number) => {
      const pts: P2[] = [];
      for (let i = 0; i <= 16; i++) {
        const u = i / 16;
        pts.push(pt(x0 + 0.01 + (c.w - 0.02) * u, zb, l + h + bow * Math.sin(Math.PI * u)));
      }
      for (let i = 16; i >= 0; i--) {
        const u = i / 16;
        pts.push(pt(x0 + 0.01 + (c.w - 0.02) * u, zb, l + bow * Math.sin(Math.PI * u)));
      }
      return pts;
    };
    k.poly(CC.wood, rail(c.back - 0.05, 0.05, 0.03));
    k.poly(CC.wood, rail(c.seat + 0.18, 0.03, 0.015));
  }
}

/** The coat over the near chair's back: draped over the top rail, hanging down its back (toward us), a collar, a lit
 *  fold on the sun side (left), the lining showing at one edge. */
function coatInto(k: Batch) {
  const c = CAFE_NEAR_CHAIR;
  const zb = c.z - c.d / 2 - 0.02;
  const xl = c.x - c.w / 2 - 0.03;
  const xr = c.x + c.w / 2 + 0.02;
  const top = c.back + 0.03;
  const P = (x: number, l: number): P2 => pt(x, zb, l);
  const body: P2[] = [P(xl + 0.04, top), P(xr - 0.08, top + 0.01), P(xr, top - 0.06), P(xr + 0.02, c.seat + 0.02), P(xr - 0.06, c.seat - 0.1), P(c.x + 0.02, c.seat - 0.06), P(xl + 0.08, c.seat - 0.12), P(xl, c.seat + 0.04), P(xl - 0.01, top - 0.08)];
  k.poly(CC.coat, body);
  k.layer();
  // the lit fold (sun side) and the lining at the right edge, the collar over the rail
  k.poly(CC.coatLit, [P(xl + 0.05, top - 0.02), P(xl + 0.13, top - 0.01), P(xl + 0.11, c.seat - 0.02), P(xl + 0.06, c.seat - 0.06), P(xl + 0.01, c.seat + 0.06)]);
  k.poly(CC.coatLining, [P(xr - 0.04, top - 0.08), P(xr + 0.01, top - 0.07), P(xr + 0.015, c.seat + 0.04), P(xr - 0.035, c.seat - 0.02)]);
  k.poly(CC.coatLit, [P(xl + 0.1, top + 0.03), P(xr - 0.12, top + 0.04), P(xr - 0.06, top - 0.04), P(xl + 0.16, top - 0.05)]);
}

/** The table: marble top (seen from above), its edge band, the iron pedestal and foot; on it two cups on saucers
 *  and a folded newspaper. */
function tableInto(k: Batch) {
  const {x, z, r, h} = S7_CAFE.table;
  k.poly(CC.iron, ring(x, z, 0.22, 0.02, 40));
  k.poly(CC.iron, ringBand(x, z, 0.22, 0, 0.025));
  k.poly(CC.iron, post(x, z, 0.06, 0.02, h - 0.03));
  k.layer();
  k.poly(CC.marbleEdge, ringBand(x, z, r, h - 0.03, h));
  k.poly(CC.marble, ring(x, z, r, h, 48));
  k.layer();
  // the newspaper, folded, lying across the table's back half (tone-on-tone columns, no words)
  const nx = x - 0.04;
  const nz = z + 0.08;
  const np = (u: number, v: number): P2 => pt(nx + (u - 0.5) * 0.3 * Math.cos(0.35) - (v - 0.5) * 0.2 * Math.sin(0.35), nz + (u - 0.5) * 0.3 * Math.sin(0.35) + (v - 0.5) * 0.2 * Math.cos(0.35), h + 0.004);
  k.poly(CC.paper, [np(0, 0), np(1, 0), np(1, 1), np(0, 1)]);
  k.layer();
  for (const v of [0.22, 0.5, 0.78]) k.poly(CC.print, [np(0.1, v - 0.06), np(0.9, v - 0.06), np(0.9, v + 0.06), np(0.1, v + 0.06)]);
  k.layer();
  // two cups on saucers (the near one in the sun side's light), coffee in them
  for (const [cx, cz] of [[x + 0.13, z - 0.1], [x - 0.17, z - 0.03]] as P2[]) {
    k.poly(CC.saucer, ring(cx, cz, 0.075, h + 0.006, 28));
    k.poly(CC.cup, ringBand(cx, cz, 0.042, h + 0.008, h + 0.072));
    k.poly(CC.cup, ring(cx, cz, 0.042, h + 0.072, 24));
    k.poly(CC.coffee, ring(cx, cz, 0.034, h + 0.072, 20));
    // the handle: a small loop on the right as a closed band
    const hp: P2[] = [pt(cx + 0.04, cz, h + 0.06), pt(cx + 0.068, cz, h + 0.055), pt(cx + 0.07, cz, h + 0.025), pt(cx + 0.04, cz, h + 0.02), pt(cx + 0.04, cz, h + 0.03), pt(cx + 0.056, cz, h + 0.034), pt(cx + 0.055, cz, h + 0.05), pt(cx + 0.04, cz, h + 0.052)];
    k.poly(CC.cup, hp);
  }
}

export const S7Cafe: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    chairInto(k, CAFE_EDGE_CHAIR, {backNear: false});
    k.layer();
    tableInto(k);
    k.layer();
    chairInto(k, CAFE_NEAR_CHAIR, {backNear: true});
    k.layer();
    coatInto(k);
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/cafe" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the planter of grasses (-1)

export const S7_PLANTER = {x0: 0.15, x1: 0.55, z0: 2.74, z1: 3.06, h: 0.35, grass: 0.72} as const;

export const S7Planter: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, z0, z1, h, grass} = S7_PLANTER;
    const wood = near(CM.line);
    const woodLit = near(CM.leafRust);
    const soil = near(CM.brickDeep);
    // the box: its west side (lit by the low western sun), its front (south: shade is the light layer's), the cap
    k.poly(woodLit, side(x0, z0, z1, 0, h));
    k.poly(wood, front(x0, x1, z0, 0, h));
    k.poly(soil, flat(x0 + 0.02, x1 - 0.02, z0 + 0.02, z1 - 0.02, h - 0.02));
    k.layer();
    k.poly(near(CM.coatOat), [pt(x0 - 0.01, z0 - 0.01, h + 0.012), pt(x1 + 0.01, z0 - 0.01, h + 0.012), pt(x1 + 0.01, z0 + 0.02, h + 0.012), pt(x0 - 0.01, z0 + 0.02, h + 0.012)]);
    k.poly(near(CM.coatOat), [pt(x0 - 0.01, z0 - 0.01, h + 0.012), pt(x0 + 0.02, z0 - 0.01, h + 0.012), pt(x0 + 0.02, z1 + 0.01, h + 0.012), pt(x0 - 0.01, z1 + 0.01, h + 0.012)]);
    k.layer();
    // the grasses: three flat clumps (sage, autumn gold, rust) and a few long blades as closed shapes, seed heads
    const base = pt((x0 + x1) / 2, (z0 + z1) / 2, h)[1];
    const [gxL] = pt(x0 + 0.02, z0, h);
    const [gxR] = pt(x1 - 0.02, z0, h);
    const top = pt((x0 + x1) / 2, (z0 + z1) / 2, grass)[1];
    const H = base - top;
    k.fill(near(CM.sage), lobes(gxL - 8, gxR + 6, base + 6, H * 0.78, 's7/pl/a', 4));
    k.layer();
    k.fill(near(CM.leafGold), lobes(gxL + (gxR - gxL) * 0.1, gxL + (gxR - gxL) * 0.62, base + 4, H * 0.62, 's7/pl/b', 3));
    k.fill(near(CM.leafRust), lobes(gxL + (gxR - gxL) * 0.55, gxR - 6, base + 4, H * 0.5, 's7/pl/c', 2));
    k.layer();
    const r = rng('s7/pl/blades');
    for (let i = 0; i < 7; i++) {
      const bx = gxL + (gxR - gxL) * (0.08 + 0.84 * (i / 6)) + r.jitter(8);
      const L = H * r.range(0.8, 1.05);
      const lean = r.jitter(L * 0.22);
      const w = r.range(5, 8);
      k.fill(i % 3 ? near(CM.sage) : near('#C9C08E'), `M${bx - w / 2} ${base}Q${bx + lean * 0.3 - w / 2} ${base - L * 0.6} ${bx + lean} ${base - L}Q${bx + lean * 0.3 + w / 2} ${base - L * 0.55} ${bx + w / 2} ${base}Z`);
      if (i % 2 === 0) k.fill(near(CM.coatOat), `M${bx + lean - 4} ${base - L + 2}Q${bx + lean} ${base - L - 22} ${bx + lean + 4} ${base - L + 2}Z`);
    }
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/planter" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the fountain basin (-0.5)

const BS = S7_BASIN;
/** The basin's faces (screen polygons) for the light layer: the near rim's south face (shade), the water. */
export function s7BasinFaces() {
  const {x0, x1, zN, zF, rim, coping, water} = BS;
  return {
    nearFace: front(x0, x1, zN, 0, rim),
    westFace: side(x0, zN, zF, 0, rim),
    water: flat(x0 + coping, x1, zN + coping, zF - coping, water),
    /** The west wall's shadow on the water (the low western sun over the coping): a thin strip along its inner edge. */
    waterShade: flat(x0 + coping, x0 + coping + 0.16, zN + coping, zF - coping, water),
    foot: [pt(x0, zF, 0), pt(x0, zN, 0), pt(x1, zN, 0)] as P2[],
  };
}

/** The jets: steady columns (a constant height, a slow ripple up their length; never rising and falling). */
export const S7_JET_TOPS = BS.jets.z.map((z) => pt(BS.jets.x, z, BS.water + BS.jets.h));

/** The basin's water (two flat depth bands: the far rim's reflection and the sky's; no glints: the sun is not in its
 *  path). V2S7_light's water shade goes on it before the rims are drawn. */
export const S7BasinWater: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, zN, zF, coping, water} = BS;
    k.poly(recede(CM.water, -0.5, S7_ATM), flat(x0 + coping, x1, zN + coping, zF - coping, water));
    k.poly(recede(CM.waterDeep, -0.5, S7_ATM), flat(x0 + coping, x1, zF - coping - 0.28, zF - coping, water));
    k.poly(recede(CM.glass, -0.5, S7_ATM), flat(x0 + coping + 0.5, x1, zN + coping + 0.25, zN + coping + 0.4, water));
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/basinWater" misreg={false} />
    </Tier>
  );
};

/** The rims: the far coping and its inner face, the west end (toward the low western sun: lit), the near rim (its
 *  south face: V2S7_light's Shade step), the nosing's lit edge. */
export const S7BasinRims: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, zN, zF, rim, coping, water} = BS;
    const stone = recede(CM.limestone, -0.5, S7_ATM);
    const stoneLit = recede(CM.paper, -0.5, S7_ATM);
    const stoneEdge = recede(CM.stucco, -0.5, S7_ATM);
    k.poly(stoneEdge, front(x0 + coping, x1, zF - coping, water, rim));
    k.poly(stone, flat(x0, x1, zF - coping, zF, rim));
    k.layer();
    k.poly(stoneLit, side(x0, zN, zF, 0, rim));
    k.poly(stone, flat(x0, x0 + coping, zN, zF, rim));
    k.layer();
    k.poly(stone, front(x0, x1, zN, 0, rim));
    k.poly(stoneLit, flat(x0, x1, zN, zN + coping, rim));
    k.poly(stoneEdge, front(x0, x1, zN, rim - 0.035, rim));
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/basinRims" misreg={false} />
    </Tier>
  );
};

/** The three steady jets: a column of glass with a paper stripe on the sun side and the water's tone on the far side,
 *  a slow ripple up its length, a small crown of falling water, a foam ring at the foot (constant height). */
export const S7Jets: React.FC = () => {
  const t = useTime();
  const jets = new Batch();
  const glass = recede(CM.glass, -0.5, S7_ATM);
  const foam = recede(CM.paper, -0.5, S7_ATM);
  const deep = recede(CM.water, -0.5, S7_ATM);
  BS.jets.z.forEach((z, i) => {
    const {x, h, r} = BS.jets;
    const k = kz(z);
    const [bx, by] = pt(x, z, BS.water);
    const [, ty] = pt(x, z, BS.water + h);
    const H = by - ty;
    const half = r * k;
    const L: P2[] = [];
    const R: P2[] = [];
    const S: P2[] = [];
    const N = 10;
    for (let s = 0; s <= N; s++) {
      const u = s / N;
      const y = by - H * u;
      const w = half * (1 - 0.35 * u);
      const wob = 1.2 * Math.sin(2 * Math.PI * (u * 2 - t * 1.6) + i * 1.7) * u;
      L.push([bx - w + wob, y]);
      R.push([bx + w + wob, y]);
      S.push([bx - w * 0.35 + wob, y]);
    }
    jets.poly(foam, ring(x, z, r * 2.2, BS.water + 0.002, 20));
    jets.layer();
    jets.poly(glass, [...L, ...R.slice().reverse()]);
    jets.poly(foam, [...L, ...S.slice().reverse()]);
    jets.poly(deep, [...S.map(([sx, sy]) => [sx + half * 0.9, sy] as P2), ...R.slice().reverse()]);
    const cx = (L[N][0] + R[N][0]) / 2;
    jets.fill(glass, `M${(cx - half * 2.4).toFixed(1)} ${(ty + 5).toFixed(1)}Q${cx.toFixed(1)} ${(ty - half * 1.6).toFixed(1)} ${(cx + half * 2.4).toFixed(1)} ${(ty + 5).toFixed(1)}Z`);
    jets.fill(foam, ovalPath(cx - half * 0.3, ty + 1, half * 1.2, half * 0.7));
    jets.layer();
  });
  return (
    <Tier tier="environment">
      <Paint b={jets} seed="s7/jets" misreg={false} />
    </Tier>
  );
};
