// V2S5_river.tsx (lane L4, SKY & FAR): the S5 RIVER plane in END coords (horizon 750; step ~40 %, no ink), and its
// PullPlane RIVER_PL (the rig's slide, re-slotted under the shot's horizon by FAR_END.dy). Top to bottom:
//   the far shore (y ~793-801): the embankment, the cherry fringe (April without words: thickest round the Tidal Basin and
//     the Jefferson Memorial's low dome), the Lincoln Memorial's temple at Memorial Bridge's far end, the Kennedy Center
//   the Potomac (y 801-824): cool water, a darker reflection strip under the far shore, current streaks, glints that pop
//     on and off slowly; Memorial Bridge's low arches (left, sloping to the near shore), the 14th Street spans (right)
//     with a few tiny slow cars; three rowers and two small sails
//   the near bank (y 824-848): the shore edge, a tree line along the water, the George Washington Parkway with tiny cars
//     (6-9 px, slow) between two rows of park trees, the boat basin with its docks and moored boats
//   the deep parkland (y 848-1290): seen only while the mid plane RISES into place (the dolly): the Boundary Channel and
//     the lagoon, Lady Bird Johnson Park's woods and blossom groves (crowns grow with nearness), lawns, paths, the
//     highway with its ramps and a few slow cars.
// >>> THE JOIN: the river plane's NEAR EDGE (the bottom of the near bank, where the deep parkland starts) is END y 848
// >>> (RIVER.nearBank[1]). The VALLEY builder joins the mid plane's far edge to it (mid ground drawn from y <= 848 down;
// >>> the Pentagon's far roofline sits at 846). Below 848 this plane keeps drawing parkland to y 1290, so the gap between
// >>> it and the rising mid plane is never empty at any p (in END coords it is visible down to y ~1130 at p 0, ~990 at
// >>> p 0.55, ~945 at p 0.7, ~900 at p 0.85).
// Life (pure functions of scene time): glints, rowers, sails, parkway, bridge and highway cars. Nothing fades.
// THE WATER is ONE component, `S5Water` (its geometry in ONE const, `S5_WATER`): the Potomac band + its streaks, the boat
// basin, the Boundary Channel / lagoon band and the glints on the water. S5River draws the ground the water lies in, then
// <S5Water> with the land over the water as its children (the banks' lines, docks, bridges, the far shore, the parkland),
// then what floats on it (hulls, rowers, sails) and the near trees. A shared premium water (src/lib/water.tsx, later)
// replaces S5Water in ONE line (S5River's <S5Water>); it never needs the land's code.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {Batch, Paint, crownD, frac, rand, rng, type Pt} from '../kit/dc/core';
import {RIVER as KIT_RIVER, type PullPlane} from '../kit/dc/crane';
import {FAR_END} from './V2S5_far';
import {RIV} from './V2S5_far_tones';

export const RIVER_PL: PullPlane = {...KIT_RIVER, o: [KIT_RIVER.o[0], KIT_RIVER.o[1] + FAR_END.dy]};

/** The river plane's numbers (END coords). */
export const RIVER = {
  x0: -720,
  x1: 2560,
  /** The far shore's embankment line (the water's top edge). */
  shore: 801,
  water: [801, 824] as [number, number],
  nearBank: [824, 848] as [number, number],
  /** The parkway's centre line on the near bank. */
  parkway: 838,
  /** The deep parkland band's bottom (seen while the mid plane rises). */
  deep: 1290,
  /** Memorial Bridge: far end (at the Lincoln Memorial) -> near end. */
  memorial: {far: [338, 802] as Pt, near: [-210, 826] as Pt},
  /** The 14th Street spans: far ends -> near ends (three parallel decks, the third the rail bridge). */
  fourteenth: [
    {far: [770, 802] as Pt, near: [1390, 826] as Pt},
    {far: [794, 802] as Pt, near: [1422, 826] as Pt},
    {far: [820, 802] as Pt, near: [1456, 826] as Pt},
  ],
  lincoln: {x: 318, base: 800},
  jefferson: {x: 652, base: 801},
  kennedy: {x: 40, base: 800},
  basin: {x0: 990, x1: 1150, y: 826},
  /** The highway across the deep parkland (END y of its centre line at x, two carriageways). */
  highway: (x: number) => 968 + 30 * Math.sin(x * 0.0021 + 0.6) + 0.012 * (x - 900),
};

/** Nearness scale of the deep parkland (1 at the near bank, growing toward the viewer). */
const near = (y: number) => 1 + Math.max(0, y - RIVER.nearBank[1]) * 0.0078;

const lerpP = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** A clockwise polygon path through points. */
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
/** A band along a curve y = f(x) of width w(x) (clockwise). */
function bandD(x0: number, x1: number, f: (x: number) => number, w: (x: number) => number, step = 24): string {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    top.push([x, f(x) - w(x) / 2]);
    bot.unshift([x, f(x) + w(x) / 2]);
  }
  return polyD([...top, ...bot]);
}

// ---------------------------------------------------------------- THE WATER (one component, one geometry)

/** Every water region of the river plane (END coords) and the banks' lines the land draws over it. S5Water draws these;
 *  the land (S5River) never draws water. */
export const S5_WATER = {
  x0: RIVER.x0,
  x1: RIVER.x1,
  /** The banks' lines (the land's, drawn over the water): the far shore's embankment, the near bank's edge. */
  banks: {farShore: RIVER.shore, nearBank: RIVER.nearBank[0]},
  /** The Potomac: a band from the far shore's foot to the near bank's edge; a darker strip under the far shore (its
   *  reflection) `deep` px tall; current streaks in `streaks.y` (count, lengths, two heights; seeded). */
  potomac: {top: RIVER.water[0] - 1, bottom: RIVER.nearBank[0], deep: 3, streaks: {n: 80, y: [RIVER.water[0] + 5, RIVER.water[1] - 3] as [number, number], len: [30, 120] as [number, number]}},
  /** The boat basin: a trapezoid let into the near bank (its docks and boats are the land's). */
  basin: ((): Pt[] => {
    const {x0, x1, y} = RIVER.basin;
    return [
      [x0, y - 1],
      [x1, y - 1],
      [x1 - 8, y + 9],
      [x0 + 12, y + 9],
    ];
  })(),
  /** The Boundary Channel and the lagoon: a band right under the near bank (centre, width), wider at the lagoon, with a
   *  thin deep line along its far edge. */
  channel: {
    centre: (x: number) => 866 + 4 * Math.sin(x * 0.006 + 1.2),
    width: (x: number) => 9 + 8 * Math.max(0, Math.sin((x - 250) * 0.0045)) + 2 * Math.sin(x * 0.02),
    deepLine: (x: number) => 862 + 4 * Math.sin(x * 0.006 + 1.2),
    deepW: 1.6,
  },
  /** Glints on the Potomac: `n` short dashes in `y`, never within 26 px of a bridge's line; each pops on / off on its
   *  own period and drifts with the current (`drift` px/s). */
  glints: {n: 70, y: [RIVER.water[0] + 4, RIVER.water[1] - 2.5] as [number, number], w: [3, 9] as [number, number], drift: 2, bridges: [RIVER.memorial, ...RIVER.fourteenth]},
};

/** The water's flat fills (static): the channel (deep parkland), the Potomac, the basin; one layer each (drawn apart
 *  before the split: the same colours, the same order). */
function waterBatch(seed: string): Batch {
  const B = new Batch();
  const {x0, x1} = S5_WATER;
  const C = S5_WATER.channel;
  B.fill(RIV.water, bandD(x0, x1, C.centre, C.width));
  B.fill(RIV.waterDeep, bandD(x0, x1, C.deepLine, () => C.deepW));
  B.layer();
  const P = S5_WATER.potomac;
  B.rect(RIV.water, x0, P.top, x1 - x0, P.bottom - P.top);
  B.rect(RIV.waterDeep, x0, P.top + 1, x1 - x0, P.deep);
  {
    const s = rng(`${seed}/streak`);
    for (let i = 0; i < P.streaks.n; i++) {
      const x = s.range(x0, x1);
      const y = s.range(P.streaks.y[0], P.streaks.y[1]);
      B.rect(s.chance(0.6) ? RIV.waterLit : RIV.waterDeep, x, y, s.range(P.streaks.len[0], P.streaks.len[1]), s.chance(0.7) ? 1.1 : 1.6);
    }
  }
  B.layer();
  B.poly(RIV.water, S5_WATER.basin);
  return B;
}

/** THE WATER: its fills, then `children` (the land over it: banks, docks, bridges, the far shore, the parkland), then
 *  the glints on its surface. Replace this component to restyle every water in the shot. */
export const S5Water: React.FC<{seed?: string; children?: React.ReactNode}> = ({seed = 's5river', children}) => {
  const t = useTime();
  const fills = useMemo(() => waterBatch(seed), [seed]);
  const glints = useMemo(() => {
    const G = S5_WATER.glints;
    const g = rng(`${seed}/gl`);
    const out: {x: number; y: number; w: number; ph: number; per: number; duty: number}[] = [];
    while (out.length < G.n) {
      const x = g.range(S5_WATER.x0, S5_WATER.x1);
      const y = g.range(G.y[0], G.y[1]);
      const onBridge = G.bridges.some(({far, near: nr}) => {
        const k = (y - far[1]) / (nr[1] - far[1]);
        return k > -0.1 && k < 1.1 && Math.abs(x - (far[0] + (nr[0] - far[0]) * k)) < 26;
      });
      if (!onBridge) out.push({x, y, w: g.range(G.w[0], G.w[1]), ph: g.range(0, 1), per: g.range(2.2, 4.2), duty: g.range(0.5, 0.8)});
    }
    return out;
  }, [seed]);
  let gd = '';
  for (const q of glints) if (frac(t / q.per + q.ph) < q.duty) gd += `M${(q.x + S5_WATER.glints.drift * t).toFixed(1)} ${q.y.toFixed(1)}h${q.w.toFixed(1)}`;
  return (
    <>
      <Paint b={fills} seed={`${seed}/w`} misreg={false} />
      {children}
      <path d={gd} stroke={RIV.glint} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </>
  );
};

type Crown = {x: number; y: number; r: number; col: string; seed: string};

/** Draw crowns back to front in y bands (a layer per band keeps the overlap order by depth), each with its flat
 *  shadow thrown toward the viewer-left (the sun is ahead-right). */
function drawCrowns(B: Batch, crowns: Crown[], shadow: string, band = 9) {
  crowns.sort((a, b) => a.y - b.y);
  let cut = -Infinity;
  for (const c of crowns) {
    if (c.y > cut + band) {
      B.layer();
      cut = c.y;
    }
    B.fill(shadow, crownD(c.x - c.r * 0.35, c.y + c.r * 0.62, c.r * 1.1, c.r * 0.38, `${c.seed}s`, 5, 0.2));
    B.fill(c.col, crownD(c.x, c.y, c.r, c.r * 0.84, c.seed, 6, 0.35));
  }
}

/** The ground the water lies in (drawn under S5Water): the deep parkland's base and mown bands, the near bank's lawn. */
function riverGround(): Batch {
  const B = new Batch();
  const {x0, x1} = RIVER;
  const y0 = RIVER.nearBank[1] - 2;
  B.rect(RIV.parkDeep, x0, y0, x1 - x0, RIVER.deep - y0);
  // broad mown bands, one step lighter, widening with nearness
  for (let y = y0 + 14, k = 0; y < RIVER.deep; k++) {
    const h = 7 * near(y);
    if (k % 2) B.rect(RIV.park, x0, y, x1 - x0, h);
    y += h * 1.15;
  }
  B.layer();
  // the near bank's lawn strip (the shore edge, the parkway and the basin's docks are the land's, over the water)
  const [ny0, ny1] = RIVER.nearBank;
  B.rect(RIV.park, x0, ny0, x1 - x0, ny1 - ny0 + 1);
  return B;
}

/** The deep parkland over its water (the channel and the lagoon are S5Water's). */
function deepPark(seed: string): Batch {
  const B = new Batch();
  const r = rng(`${seed}/deep`);
  const {x0, x1} = RIVER;
  // moored boats in the lagoon below the basin
  for (let x = 1004; x < 1140; x += r.range(7, 11)) B.rect(RIV.hull, x, 866 + r.range(-2, 3), r.range(3.5, 5.5), 1.6);
  B.layer();
  // paths: pale thin ribbons wandering through the park
  for (const [yc, amp, f, ph] of [
    [900, 10, 0.006, 0.3],
    [1040, 24, 0.0042, 2.1],
    [1150, 34, 0.0031, 4.0],
  ] as [number, number, number, number][]) {
    B.fill(RIV.path, bandD(x0, x1, (x) => yc + amp * Math.sin(x * f + ph), (x) => 1.3 * near(yc + amp * Math.sin(x * f + ph))));
  }
  // the highway: two pale carriageways with a grass median, and two ramps curving off it
  const hw = RIVER.highway;
  B.fill(RIV.road, bandD(x0, x1, (x) => hw(x) - 4 * near(hw(x)), (x) => 3.6 * near(hw(x))));
  B.fill(RIV.road, bandD(x0, x1, (x) => hw(x) + 4 * near(hw(x)), (x) => 3.6 * near(hw(x))));
  B.fill(RIV.roadEdge, bandD(x0, x1, (x) => hw(x) - 6.2 * near(hw(x)), () => 0.8));
  for (const [cx, cy, rx, ry] of [
    [380, 1010, 120, 34],
    [1500, 990, 140, 38],
  ] as [number, number, number, number][]) {
    // a ramp loop: an elliptical ribbon (clockwise outer, counter-clockwise inner = a ring under nonzero)
    const out: Pt[] = [];
    const inn: Pt[] = [];
    const w = 3.2 * near(cy);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      out.push([cx + Math.cos(a) * (rx + w / 2), cy + Math.sin(a) * (ry + w / 2)]);
      inn.unshift([cx + Math.cos(a) * (rx - w / 2), cy + Math.sin(a) * (ry - w / 2)]);
    }
    B.fill(RIV.road, polyD(out) + polyD(inn));
  }
  // woods: a jittered grid of crowns gated by a smooth field (woods where it is high, lawns and clearings where it is
  // low), crowns growing with nearness; a third of the stands in blossom; single trees dot the clearings
  const crowns: Crown[] = [];
  const field = (x: number, y: number) =>
    0.55 * Math.sin(x * 0.0093 + 1.1) * Math.sin(y * 0.031 + 0.4) + 0.35 * Math.sin(x * 0.0231 + y * 0.017 + 2.0) + 0.25 * Math.sin(x * 0.0047 - y * 0.041 + 0.7) + 0.15 * Math.sin(x * 0.061 + 3.3);
  const bloomField = (x: number, y: number) => Math.sin(x * 0.0071 + y * 0.012 + 0.9) + 0.5 * Math.sin(x * 0.019 - 1.4);
  for (let y = RIVER.nearBank[1] + 10; y < 1150; ) {
    const rr = 4.3 * near(y);
    for (let x = -80 + r.range(0, rr); x < 1780; x += rr * r.range(1.05, 1.4)) {
      const f = field(x, y);
      if (f < -0.08) {
        if (r.chance(0.035)) crowns.push({x, y: y + r.jitter(rr * 0.3), r: rr * r.range(0.8, 1.1), col: r.chance(0.35) ? RIV.blossom : r.chance(0.5) ? RIV.treeLit : RIV.tree, seed: `${seed}/c${crowns.length}`});
        continue;
      }
      if (Math.abs(y - hw(x)) < 8.5 * near(y)) continue;
      const bloom = bloomField(x, y) > 0.9;
      const edge = f < 0.08;
      const col = bloom && r.chance(0.7) ? r.pick([RIV.blossom, RIV.blossom, RIV.blossomWhite]) : edge && r.chance(0.3) ? RIV.treeLit : r.pick([RIV.tree, RIV.tree, RIV.treeDark, RIV.treeLit, RIV.treeDark]);
      crowns.push({x: x + r.jitter(rr * 0.25), y: y + r.jitter(rr * 0.3), r: rr * r.range(0.9, 1.22), col, seed: `${seed}/c${crowns.length}`});
    }
    y += rr * 0.78;
  }
  drawCrowns(B, crowns, RIV.parkShade, 15);
  return B;
}

/** The land over the water: the near bank's edge and parkway, the basin's docks, the bridges, the far shore. */
function riverBack(seed: string): Batch {
  const B = new Batch();
  const {x0, x1} = RIVER;
  // ---- the near bank: the shore edge (the bank's line, over the water), the parkway, the boat basin's docks
  const [ny0] = RIVER.nearBank;
  {
    // the bank's line, 2 px from 0.6 above the water's edge; its last 0.4 px stops at the basin's mouth (the basin is
    // let into the bank: its water meets the line, never under it)
    const nb = S5_WATER.banks.nearBank;
    const [bx0, bx1] = [S5_WATER.basin[0][0], S5_WATER.basin[1][0]];
    B.rect(RIV.wall, x0, nb - 0.6, x1 - x0, 1.6);
    B.rect(RIV.wall, x0, nb + 1, bx0 - x0, 0.4);
    B.rect(RIV.wall, bx1, nb + 1, x1 - bx1, 0.4);
  }
  B.rect(RIV.road, x0, RIVER.parkway - 2.6, x1 - x0, 5.2);
  B.rect(RIV.roadEdge, x0, RIVER.parkway - 0.3, x1 - x0, 0.7);
  {
    const {x0: bx0, x1: bx1, y} = RIVER.basin;
    const d = rng(`${seed}/basin`);
    for (let x = bx0 + 18; x < bx1 - 14; x += 20) {
      B.rect(RIV.dock, x, y + 0.5, 1.1, 7);
      for (let k = 0; k < 3; k++) if (d.chance(0.8)) B.rect(RIV.hull, x + (d.chance(0.5) ? 1.8 : -5.6), y + 1.5 + k * 2.3, 3.8, 1.4);
    }
  }
  B.layer();
  // the tree line along the water (between the shore edge and the parkway)
  {
    const t = rng(`${seed}/shoreline`);
    const crowns: Crown[] = [];
    for (let x = x0; x < x1; x += t.range(4, 8)) {
      if (x > RIVER.basin.x0 - 4 && x < RIVER.basin.x1 + 4) continue;
      if (t.chance(0.12)) continue;
      const rr = t.range(3, 5);
      crowns.push({x, y: ny0 + t.range(4, 7), r: rr, col: t.chance(0.28) ? RIV.blossom : t.chance(0.12) ? RIV.blossomWhite : t.chance(0.5) ? RIV.tree : t.chance(0.5) ? RIV.treeDark : RIV.treeLit, seed: `${seed}/sl${x.toFixed(1)}`});
    }
    drawCrowns(B, crowns, RIV.parkShade, 3);
  }
  B.layer();
  // ---- the bridges over the water
  {
    // Memorial Bridge: a stone face with its arches, from the Lincoln Memorial to the near shore (left)
    const {far, near: nr} = RIVER.memorial;
    const thF = 4.6;
    const thN = 9;
    B.poly(RIV.bridge, [
      [far[0], far[1] - 1.4],
      [nr[0], nr[1] - 1.8],
      [nr[0], nr[1] - 1.8 + thN],
      [far[0], far[1] - 1.4 + thF],
    ]);
    B.poly(RIV.bridgeLit, [
      [far[0], far[1] - 2],
      [nr[0], nr[1] - 2.6],
      [nr[0], nr[1] - 1.2],
      [far[0], far[1] - 1],
    ]);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const k0 = (i + 0.16) / n;
      const k1 = (i + 0.84) / n;
      const km = (k0 + k1) / 2;
      const th = (k: number) => thF + (thN - thF) * k;
      const bot = (k: number): Pt => {
        const p = lerpP(far, nr, k);
        return [p[0], p[1] - 1.6 + th(k)];
      };
      const a = bot(k0);
      const b = bot(k1);
      const m = bot(km);
      const ah = th(km) * 0.7;
      B.fill(RIV.arch, `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${m[0].toFixed(1)} ${(m[1] - ah * 2).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}Z`);
    }
    // the 14th Street spans: a lit deck edge over a shaded face on slim piers (the third the darker rail bridge)
    RIVER.fourteenth.forEach(({far: f, near: nn}, i) => {
      const thF = i === 2 ? 1.6 : 2.2;
      const thN = i === 2 ? 2.6 : 3.6;
      B.poly(i === 2 ? RIV.bridgeShade : RIV.bridge, [
        [f[0], f[1] - 0.6],
        [nn[0], nn[1] - 0.8],
        [nn[0], nn[1] - 0.8 + thN],
        [f[0], f[1] - 0.6 + thF],
      ]);
      B.poly(RIV.bridgeLit, [
        [f[0], f[1] - 1.5],
        [nn[0], nn[1] - 2],
        [nn[0], nn[1] - 0.6],
        [f[0], f[1] - 0.5],
      ]);
      for (let k = 0.05; k < 1; k += 0.07) {
        const p = lerpP(f, nn, k);
        const th = thF + (thN - thF) * k;
        B.rect(RIV.bridgeShade, p[0] - 0.8, p[1] - 0.6 + th, 1.6, 2 + 3 * k);
      }
    });
  }
  B.layer();
  // ---- the far shore: the embankment (the far bank's line, over the water), the monuments, the cherry fringe
  B.rect(RIV.wall, x0, S5_WATER.banks.farShore - 2, x1 - x0, 2.4);
  B.rect(RIV.wallShade, x0, S5_WATER.banks.farShore + 0.2, x1 - x0, 0.9);
  {
    const {x, base} = RIVER.lincoln;
    B.rect(RIV.temple, x - 17, base - 11, 34, 11);
    B.rect(RIV.templeShade, x - 15, base - 8.4, 30, 5.2);
    for (let k = -14; k <= 14; k += 3.5) B.rect(RIV.temple, x + k - 0.6, base - 8.4, 1.2, 5.2);
    B.rect(RIV.temple, x - 13, base - 14, 26, 3.4);
    B.rect(RIV.templeShade, x - 17, base - 11, 4, 11);
    const {x: jx, base: jb} = RIVER.jefferson;
    B.rect(RIV.temple, jx - 13, jb - 7, 26, 7);
    B.rect(RIV.templeShade, jx - 13, jb - 7, 5, 7);
    B.fill(RIV.temple, `M${jx - 9} ${jb - 7}A9 7.5 0 0 1 ${jx + 9} ${jb - 7}Z`);
    B.fill(RIV.templeShade, `M${jx - 9} ${jb - 7}A9 7.5 0 0 1 ${jx - 2.5} ${jb - 14.2}L${jx - 2.5} ${jb - 7}Z`);
    B.poly(RIV.temple, [
      [jx - 6, jb - 6.5],
      [jx, jb - 10],
      [jx + 6, jb - 6.5],
    ]);
    const {x: kx, base: kb} = RIVER.kennedy;
    B.rect(RIV.temple, kx - 30, kb - 9, 60, 9);
    B.rect(RIV.templeShade, kx - 30, kb - 2.6, 60, 2.6);
    B.rect(RIV.templeShade, kx - 30, kb - 9, 6, 9);
  }
  B.layer();
  {
    const c = rng(`${seed}/cherry`);
    for (let x = x0; x < x1; x += c.range(3.2, 7)) {
      if (Math.abs(x - RIVER.lincoln.x) < 19 || Math.abs(x - RIVER.kennedy.x) < 32) continue;
      const nearJeff = Math.abs(x - RIVER.jefferson.x) < 130;
      if (Math.abs(x - RIVER.jefferson.x) < 15) continue;
      const pinkK = nearJeff ? 0.9 : 0.4 + 0.3 * Math.sin(x * 0.009);
      const s = c.range(2.8, 5) * (nearJeff ? 1.2 : 1);
      const col = c.chance(pinkK) ? (c.chance(0.3) ? RIV.shoreBlossomLit : RIV.shoreBlossom) : c.chance(0.5) ? RIV.shoreTree : RIV.shoreTreeLit;
      B.fill(col, crownD(x, RIVER.shore - s * 0.55, s, s * 0.78, `${seed}/fs${x.toFixed(1)}`, 5, 0.5));
    }
  }
  return B;
}

/** The park trees in front of the parkway (drawn over its cars). */
function riverFront(seed: string): Batch {
  const B = new Batch();
  const t = rng(`${seed}/nbt`);
  const crowns: Crown[] = [];
  for (let x = RIVER.x0; x < RIVER.x1; x += t.range(4.5, 10)) {
    if (t.chance(0.18)) continue;
    const rr = t.range(3.6, 6);
    crowns.push({x, y: RIVER.nearBank[1] - t.range(1, 3.5), r: rr, col: t.chance(0.3) ? RIV.blossom : t.chance(0.12) ? RIV.blossomWhite : t.chance(0.5) ? RIV.tree : t.chance(0.5) ? RIV.treeDark : RIV.treeLit, seed: `${seed}/nf${x.toFixed(1)}`});
  }
  drawCrowns(B, crowns, RIV.parkShade, 3);
  return B;
}

export const S5River: React.FC<{seed?: string}> = ({seed = 's5river'}) => {
  const t = useTime();
  const ground = useMemo(() => riverGround(), []);
  const deep = useMemo(() => deepPark(seed), [seed]);
  const back = useMemo(() => riverBack(seed), [seed]);
  const front = useMemo(() => riverFront(seed), [seed]);
  // rowers (sculls: a hull and two oars that stroke ~1 Hz), slow
  const rowers = [
    {x0: 470, v: 7, y: 814},
    {x0: 905, v: -6, y: 819},
    {x0: 1210, v: 8, y: 810},
  ];
  let rw = '';
  let hulls = '';
  for (const q of rowers) {
    const x = q.x0 + q.v * t;
    const st = Math.sin(t * 6.2 + q.x0) * 1.6;
    hulls += `M${(x - 8).toFixed(1)} ${q.y}h16v1.3h-16Z`;
    rw += `M${(x - 2.5).toFixed(1)} ${(q.y - 2.6 + st).toFixed(1)}l-2.4 5.4M${(x + 2.5).toFixed(1)} ${(q.y - 2.6 - st).toFixed(1)}l2.4 5.4`;
  }
  // two small sails (a white triangle over a hull), drifting
  const sails = [
    {x0: 560, v: 2.5, y: 820},
    {x0: 1120, v: -2, y: 813},
  ];
  let sd = '';
  for (const q of sails) {
    const x = q.x0 + q.v * t;
    sd += `M${(x - 5).toFixed(1)} ${q.y}h11l-2 2h-7Z M${(x - 1).toFixed(1)} ${(q.y - 0.5).toFixed(1)}l0 -12l7 11.5Z`;
  }
  // cars: the parkway (both ways, ~32 px/s), the two 14th Street road decks (~26 px/s), the highway (~40 px/s at its
  // nearness); flat specks, never at the building
  const cars: React.ReactNode[] = [];
  const span = RIVER.x1 - RIVER.x0;
  for (let i = 0; i < 44; i++) {
    const dir = i % 2 ? 1 : -1;
    const x = RIVER.x0 + frac(rand(seed, `car${i}`) + (dir * t * 32) / span) * span;
    const w = 6 + rand(seed, `cw${i}`) * 3;
    cars.push(<rect key={`p${i}`} x={x} y={dir > 0 ? RIVER.parkway - 2.3 : RIVER.parkway + 0.4} width={w} height={1.9} fill={RIV.carCols[i % RIV.carCols.length]} />);
  }
  RIVER.fourteenth.slice(0, 2).forEach(({far, near: nr}, j) => {
    const len = Math.hypot(nr[0] - far[0], nr[1] - far[1]);
    for (let i = 0; i < 6; i++) {
      const dir = j === 0 ? 1 : -1;
      const k = frac(rand(seed, `bc${j}/${i}`) + (dir * t * 26) / len);
      const p = lerpP(far, nr, k);
      cars.push(<rect key={`b${j}/${i}`} x={p[0] - 2.4} y={p[1] - 3.2} width={4.8} height={1.7} fill={RIV.carCols[(i + j * 3) % RIV.carCols.length]} />);
    }
  });
  for (let i = 0; i < 30; i++) {
    const dir = i % 2 ? 1 : -1;
    const x = RIVER.x0 + frac(rand(seed, `hw${i}`) + (dir * t * 40) / span) * span;
    const y = RIVER.highway(x);
    const s = near(y);
    cars.push(<rect key={`h${i}`} x={x} y={y + (dir > 0 ? -4 : 4) * s - 1 * s} width={5.5 * s} height={2 * s} fill={RIV.carCols[(i + 2) % RIV.carCols.length]} />);
  }
  return (
    <>
      <Paint b={ground} seed={`${seed}/g`} misreg={false} />
      <S5Water seed={seed}>
        <Paint b={deep} seed={`${seed}/d`} misreg={false} />
        <Paint b={back} seed={`${seed}/b`} misreg={false} />
      </S5Water>
      <path d={hulls} fill={RIV.hull} />
      <path d={rw} stroke={RIV.rower} strokeWidth={0.9} strokeLinecap="round" fill="none" />
      <path d={sd} fill={RIV.sail} />
      {cars}
      <Paint b={front} seed={`${seed}/f`} misreg={false} />
    </>
  );
};
