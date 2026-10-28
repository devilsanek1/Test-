// V2S7_near.tsx (lane L5): the BOTTOM THIRD of V2S7: things, FEW and BIG, cut by the frame's edges like v4's cafe
// (conform_L5 §3; THROUGHLINE §1.5: no stranger's back anywhere near; DIRECTION rule 3). Every one is built in metres on
// the shot's ONE camera (V2S7_plan S7_CAM) and projected, so its edges run to the VP and its size falls with distance.
//   S7Cafe      plane -1: the bistro table (a round marble top, an iron pedestal) with two cups on saucers and a folded
//               newspaper; two bentwood chairs pushed back from it, their backs to us: chair A to the left with a coat
//               draped over it, cut by the left edge; chair B to the right
//   S7Planter   plane -1: a corten planter of grasses in the bottom-right corner, cut by both edges, its west side lit
//   S7Basin*    plane -0.5: the fountain basin at the right: a low limestone rim (its west end toward the low sun, its
//               near face south: V2S7_light's shade step); its water and jets are V2S7_water's (one component)
// Near planes get value range, not prop count (CRAFT §f): their plane-0 colours one near step darker (lib/depth recede
// -1 / -0.5); tier C (environment: flat fills, no outline). Nothing here rises over the board's bottom rail where it
// stands in front of it (h <= 1.6 - 0.196 z m), nor near Pip (x 645-755, y >= 1100).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Tier} from '../../lib/tier';
import {recede} from '../../lib/depth';
import {Batch, Paint, lobes, rng} from '../kit/canal/core';
import {pt, S7_ATM, S7_BASIN, S7_CAFE, type P2} from './V2S7_plan';

const near = (c: string, plane = -1) => recede(c, plane, S7_ATM);

/** A circle of radius r about (x, z) at `level`, projected (n points). */
const ring = (x: number, z: number, r: number, level: number, n = 40): P2[] => Array.from({length: n}, (_, i) => pt(x + r * Math.cos((i / n) * Math.PI * 2), z + r * Math.sin((i / n) * Math.PI * 2), level));
/** The near half of a ring between two levels: the visible edge band of a round top or a saucer. */
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
/** A vertical post (section `w` m) from l0 to l1 at (x, z), as a screen quad. */
const post = (x: number, z: number, w: number, l0: number, l1: number): P2[] => [pt(x - w / 2, z, l1), pt(x + w / 2, z, l1), pt(x + w / 2, z, l0), pt(x - w / 2, z, l0)];
/** Box faces: a level quad, a frontal face (at z), a side face (at x, running into the picture). */
const flat = (x0: number, x1: number, z0: number, z1: number, l: number): P2[] => [pt(x0, z0, l), pt(x1, z0, l), pt(x1, z1, l), pt(x0, z1, l)];
const front = (x0: number, x1: number, z: number, l0: number, l1: number): P2[] => [pt(x0, z, l1), pt(x1, z, l1), pt(x1, z, l0), pt(x0, z, l0)];
const side = (x: number, z0: number, z1: number, l0: number, l1: number): P2[] => [pt(x, z0, l1), pt(x, z1, l1), pt(x, z1, l0), pt(x, z0, l0)];

// ---------------------------------------------------------------- the cafe (-1)

/** The cafe's colours, one near step darker than on the subject's plane. */
const CC = {
  marble: near(CM.limestone),
  marbleEdge: near(CM.stucco),
  iron: near(CM.coatSlate),
  wood: near(CM.line),
  cane: near(CM.coatOat),
  cup: near(CM.paper),
  coffee: near(CM.brickDeep),
  saucer: near(CM.stucco),
  paper: near(CM.paper),
  print: near('#E3D8C6'),
  coat: near('#8794AC'),
  coatLit: near('#A1ADC2'),
  coatDeep: near('#6E7B94'),
} as const;

type Chair = {x: number; z: number; seat: number; back: number; w: number; d: number};

/** Chair A from behind: far legs, the cane seat, the near legs and a stretcher, the bentwood hoop (two uprights, a
 *  bent top rail, a mid rail). The coat goes over it (coatInto). */
function chairBackInto(k: Batch, c: Chair) {
  const x0 = c.x - c.w / 2;
  const x1 = c.x + c.w / 2;
  const z0 = c.z - c.d / 2;
  const z1 = c.z + c.d / 2;
  const leg = 0.028;
  k.poly(CC.wood, post(x0 + 0.04, z1 - 0.03, leg, 0, c.seat - 0.02));
  k.poly(CC.wood, post(x1 - 0.04, z1 - 0.03, leg, 0, c.seat - 0.02));
  k.layer();
  k.poly(CC.cane, flat(x0, x1, z0, z1, c.seat));
  k.poly(CC.wood, front(x0, x1, z0, c.seat - 0.035, c.seat));
  k.layer();
  k.poly(CC.wood, post(x0 + 0.03, z0 + 0.03, leg, 0, c.seat - 0.02));
  k.poly(CC.wood, post(x1 - 0.03, z0 + 0.03, leg, 0, c.seat - 0.02));
  k.poly(CC.wood, front(x0 + 0.04, x1 - 0.04, z0 + 0.03, 0.17, 0.19));
  const zb = z0 + 0.01;
  k.layer();
  k.poly(CC.wood, post(x0 + 0.025, zb, 0.03, c.seat, c.back - 0.03));
  k.poly(CC.wood, post(x1 - 0.025, zb, 0.03, c.seat, c.back - 0.03));
  const rail = (l: number, h: number, bow: number): P2[] => {
    const pts: P2[] = [];
    for (let i = 0; i <= 16; i++) pts.push(pt(x0 + 0.01 + (c.w - 0.02) * (i / 16), zb, l + h + bow * Math.sin((Math.PI * i) / 16)));
    for (let i = 16; i >= 0; i--) pts.push(pt(x0 + 0.01 + (c.w - 0.02) * (i / 16), zb, l + bow * Math.sin((Math.PI * i) / 16)));
    return pts;
  };
  k.poly(CC.wood, rail(c.back - 0.05, 0.05, 0.03));
  k.poly(CC.wood, rail(c.seat + 0.17, 0.03, 0.015));
}

/** The coat draped over chair A's back (toward us): the collar folded over the bent rail, the body hanging below the
 *  seat with a soft hem, a sleeve hanging at each side; lit on the sun side (left), its right third in the form shade
 *  (V2S7_light). One closed shape per tone, no lines. */
function coatInto(k: Batch, c: Chair) {
  const zb = c.z - c.d / 2 - 0.03;
  const P = (u: number, l: number): P2 => pt(c.x + u, zb, l);
  const top = c.back + 0.035;
  const hem = c.seat - 0.08;
  const body: P2[] = [
    P(-0.2, top - 0.01), P(-0.1, top + 0.012), P(0, top + 0.016), P(0.1, top + 0.012), P(0.2, top - 0.01),
    P(0.235, top - 0.05), P(0.25, c.seat + 0.12), P(0.262, hem + 0.02), P(0.2, hem - 0.004), P(0.1, hem + 0.012),
    P(0, hem - 0.008), P(-0.1, hem + 0.01), P(-0.2, hem - 0.002), P(-0.262, hem + 0.02), P(-0.25, c.seat + 0.12), P(-0.235, top - 0.05),
  ];
  k.poly(CC.coat, body);
  k.layer();
  // the sleeves, hanging a little lower at each side
  k.poly(CC.coatDeep, [P(-0.235, top - 0.06), P(-0.17, top - 0.07), P(-0.17, hem - 0.03), P(-0.215, hem - 0.05), P(-0.25, hem + 0.01)]);
  k.poly(CC.coatDeep, [P(0.235, top - 0.06), P(0.17, top - 0.07), P(0.17, hem - 0.03), P(0.215, hem - 0.05), P(0.25, hem + 0.01)]);
  // the collar folded over the rail (lit on top), the lit fold on the sun side
  k.poly(CC.coatLit, [P(-0.19, top - 0.005), P(0.19, top - 0.005), P(0.16, top - 0.06), P(0.04, top - 0.075), P(-0.04, top - 0.075), P(-0.16, top - 0.06)]);
  k.poly(CC.coatLit, [P(-0.165, top - 0.07), P(-0.1, top - 0.08), P(-0.11, hem + 0.03), P(-0.165, hem + 0.02)]);
}

/** The table: the iron foot and pedestal, the marble top and its edge band; on it the newspaper and two cups. */
function tableInto(k: Batch) {
  const {x, z, r, h} = S7_CAFE.table;
  k.poly(CC.iron, ring(x, z, 0.16, 0.025, 36));
  k.poly(CC.iron, ringBand(x, z, 0.16, 0, 0.025));
  k.poly(CC.iron, post(x, z, 0.055, 0.02, h - 0.03));
  k.layer();
  k.poly(CC.marbleEdge, ringBand(x, z, r, h - 0.03, h));
  k.poly(CC.marble, ring(x, z, r, h, 48));
  k.layer();
  // the newspaper, folded, lying across the table's back half (tone-on-tone columns, no words)
  const nx = x - 0.02;
  const nz = z + 0.1;
  const a = 0.35;
  const np = (u: number, v: number): P2 => pt(nx + (u - 0.5) * 0.3 * Math.cos(a) - (v - 0.5) * 0.2 * Math.sin(a), nz + (u - 0.5) * 0.3 * Math.sin(a) + (v - 0.5) * 0.2 * Math.cos(a), h + 0.004);
  k.poly(CC.paper, [np(0, 0), np(1, 0), np(1, 1), np(0, 1)]);
  k.layer();
  for (const v of [0.24, 0.5, 0.76]) k.poly(CC.print, [np(0.1, v - 0.06), np(0.9, v - 0.06), np(0.9, v + 0.06), np(0.1, v + 0.06)]);
  k.layer();
  for (const [cx, cz] of [[x + 0.17, z - 0.08], [x + 0.02, z - 0.17]] as P2[]) {
    k.poly(CC.saucer, ring(cx, cz, 0.075, h + 0.006, 28));
    k.poly(CC.cup, ringBand(cx, cz, 0.042, h + 0.008, h + 0.072));
    k.poly(CC.cup, ring(cx, cz, 0.042, h + 0.072, 24));
    k.poly(CC.coffee, ring(cx, cz, 0.034, h + 0.072, 20));
    k.poly(CC.cup, [pt(cx + 0.04, cz, h + 0.062), pt(cx + 0.07, cz, h + 0.056), pt(cx + 0.072, cz, h + 0.026), pt(cx + 0.04, cz, h + 0.02), pt(cx + 0.04, cz, h + 0.032), pt(cx + 0.057, cz, h + 0.035), pt(cx + 0.056, cz, h + 0.05), pt(cx + 0.04, cz, h + 0.052)]);
  }
}

export const S7Cafe: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    tableInto(k);
    k.layer();
    chairBackInto(k, S7_CAFE.chairB);
    k.layer();
    chairBackInto(k, S7_CAFE.chairA);
    k.layer();
    coatInto(k, S7_CAFE.chairA);
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/cafe" misreg={false} />
    </Tier>
  );
};

/** The coat's box (its form band) for V2S7_light. */
export function s7CoatD(): P2[] {
  const c = S7_CAFE.chairA;
  const zb = c.z - c.d / 2 - 0.03;
  const P = (u: number, l: number): P2 => pt(c.x + u, zb, l);
  return [P(-0.26, c.back + 0.04), P(0.26, c.back + 0.04), P(0.27, c.seat - 0.1), P(-0.27, c.seat - 0.1)];
}

// ---------------------------------------------------------------- the planter of grasses (-1)

/** A corten planter in the bottom-right corner (cut by both edges), its west side toward the low sun. */
export const S7_PLANTER = {x0: 0.62, x1: 1.4, z0: 2.72, z1: 3.02, h: 0.36, grass: 0.74} as const;

export const S7Planter: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, z0, z1, h, grass} = S7_PLANTER;
    const steel = near(CM.brick);
    const steelLit = near(CM.brickLight);
    const soil = near(CM.brickDeep);
    k.poly(steelLit, side(x0, z0, z1, 0, h));
    k.poly(steel, front(x0, x1, z0, 0, h));
    k.poly(soil, flat(x0 + 0.015, x1, z0 + 0.015, z1 - 0.015, h - 0.02));
    k.layer();
    // the grasses: flat clumps (sage, autumn gold, rust) and long blades as closed shapes, oat seed heads
    const [gxL, base] = pt(x0 + 0.04, (z0 + z1) / 2, h);
    const gxR = 1110;
    const top = pt(x0 + 0.3, (z0 + z1) / 2, grass)[1];
    const H = base - top;
    k.fill(near(CM.sage), lobes(gxL - 6, gxR, base + 8, H * 0.72, 's7/pl/a', 4));
    k.layer();
    k.fill(near(CM.leafGold), lobes(gxL + 14, gxL + 92, base + 6, H * 0.6, 's7/pl/b', 2));
    k.fill(near(CM.leafRust), lobes(gxL + 84, gxR, base + 6, H * 0.46, 's7/pl/c', 2));
    k.layer();
    const r = rng('s7/pl/blades');
    for (let i = 0; i < 6; i++) {
      const bx = gxL + 10 + (gxR - gxL - 10) * (i / 6) + r.jitter(6);
      const L = H * r.range(0.82, 1.04);
      const lean = r.jitter(L * 0.2) - L * 0.06;
      const w = r.range(6, 9);
      k.fill(i % 3 ? near(CM.sage) : near('#C9C08E'), `M${(bx - w / 2).toFixed(1)} ${base.toFixed(1)}Q${(bx + lean * 0.3 - w / 2).toFixed(1)} ${(base - L * 0.6).toFixed(1)} ${(bx + lean).toFixed(1)} ${(base - L).toFixed(1)}Q${(bx + lean * 0.3 + w / 2).toFixed(1)} ${(base - L * 0.55).toFixed(1)} ${(bx + w / 2).toFixed(1)} ${base.toFixed(1)}Z`);
      if (i % 2 === 0) k.fill(near(CM.coatOat), `M${(bx + lean - 5).toFixed(1)} ${(base - L + 3).toFixed(1)}Q${(bx + lean).toFixed(1)} ${(base - L - 26).toFixed(1)} ${(bx + lean + 5).toFixed(1)} ${(base - L + 3).toFixed(1)}Z`);
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
/** The basin's faces (screen polygons) for the light layer (its water is V2S7_water's S7_WATER). */
export function s7BasinFaces() {
  const {x0, x1, zN, zF, rim} = BS;
  return {
    nearFace: front(x0, x1, zN, 0, rim),
    westFace: side(x0, zN, zF, 0, rim),
    foot: [pt(x0, zF, 0), pt(x0, zN, 0), pt(x1, zN, 0)] as P2[],
  };
}

const STONE = {
  stone: recede(CM.limestone, -0.5, S7_ATM),
  lit: recede(CM.paper, -0.5, S7_ATM),
  edge: recede(CM.stucco, -0.5, S7_ATM),
};

/** The far rim (its inner face over the water and its coping): drawn before the water. */
export const S7BasinFarRim: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, zF, rim, coping, water} = BS;
    k.poly(STONE.edge, front(x0 + coping, x1, zF - coping, water, rim));
    k.poly(STONE.stone, flat(x0, x1, zF - coping, zF, rim));
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/basinFar" misreg={false} />
    </Tier>
  );
};

/** The west end (toward the low western sun: lit) and the near rim (its south face: V2S7_light's Shade step), after the
 *  water. */
export const S7BasinRims: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x0, x1, zN, zF, rim, coping} = BS;
    k.poly(STONE.lit, side(x0, zN, zF, 0, rim));
    k.poly(STONE.stone, flat(x0, x0 + coping, zN, zF, rim));
    k.layer();
    k.poly(STONE.stone, front(x0, x1, zN, 0, rim));
    k.poly(STONE.lit, flat(x0, x1, zN, zN + coping, rim));
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/basinRims" misreg={false} />
    </Tier>
  );
};
