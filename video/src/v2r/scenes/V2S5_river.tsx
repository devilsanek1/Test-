// V2S5_river.tsx (lane L4, SKY & FAR): the S5 RIVER plane in END coords (horizon 750; step ~40 %, no ink), and its
// PullPlane RIVER_PL (the rig's slide, re-slotted under the shot's horizon by FAR_END.dy). Top to bottom:
//   the far shore (y ~793-801): the embankment, the cherry fringe (April without words: thickest round the Tidal Basin and
//     the Jefferson Memorial's low dome), the Lincoln Memorial's temple at Memorial Bridge's far end, the Kennedy Center
//   the Potomac (y 801-824): cool water, a darker reflection strip under the far shore, current streaks, glints that pop
//     on and off slowly; Memorial Bridge's low arches (left, sloping to the near shore), the 14th Street spans (right)
//     with a few tiny slow cars; three rowers and two small sails
//   the near bank (y 824-848): the shore edge, park trees, the George Washington Parkway with tiny cars (6-9 px, slow),
//     the boat basin with its docks and moored boats
//   the deep parkland (y 848-1290): seen only while the mid plane RISES into place (the dolly): lawns with mown bands,
//     groves in blossom growing with nearness, a lagoon channel, paths; static.
// >>> THE JOIN: the river plane's NEAR EDGE (the bottom of the near bank, where the deep parkland starts) is END y 848
// >>> (RIVER.nearBank[1]). The VALLEY builder joins the mid plane's far edge to it (mid ground drawn from y <= 848 down;
// >>> the Pentagon's far roofline sits at 846). Below 848 this plane keeps drawing parkland to y 1290, so the gap between
// >>> it and the rising mid plane is never empty at any p.
// Life (river plane, pure functions of scene time): glints, rowers, sails, parkway and bridge cars. Nothing fades.
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
  /** The 14th Street spans: far ends -> near ends (three parallel decks). */
  fourteenth: [
    {far: [770, 802] as Pt, near: [1390, 826] as Pt},
    {far: [792, 802] as Pt, near: [1420, 826] as Pt},
    {far: [818, 802] as Pt, near: [1452, 826] as Pt},
  ],
  lincoln: {x: 318, base: 800},
  jefferson: {x: 652, base: 801},
  kennedy: {x: 40, base: 800},
  basin: {x0: 990, x1: 1150, y: 826},
};

const lerpP = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** A sloped band (a bridge deck) from a to b, thickness th (vertical), as a clockwise quad. */
const deckD = (a: Pt, b: Pt, th: number) => `M${a[0]} ${a[1] - th / 2}L${b[0]} ${b[1] - th / 2}L${b[0]} ${b[1] + th / 2}L${a[0]} ${a[1] + th / 2}Z`;

function staticRiver(seed: string): Batch {
  const B = new Batch();
  const r = rng(seed);
  const {x0, x1} = RIVER;
  // ---- the deep parkland (behind everything else on this plane)
  B.rect(RIV.park, x0, RIVER.nearBank[1] - 2, x1 - x0, RIVER.deep - RIVER.nearBank[1] + 2);
  for (let y = RIVER.nearBank[1] + 10, k = 0; y < RIVER.deep; k++) {
    const hgt = 6 + (y - RIVER.nearBank[1]) * 0.07;
    if (k % 2) B.rect(RIV.parkLit, x0, y, x1 - x0, hgt);
    y += hgt * 1.1;
  }
  B.layer();
  // a lagoon channel across the parkland and two pale paths
  {
    const pts: Pt[] = [];
    const pts2: Pt[] = [];
    for (let x = x0; x <= x1; x += 40) {
      const y = 890 + 10 * Math.sin(x * 0.0042 + 1.3) + 6 * Math.sin(x * 0.011);
      const w = 6 + 2.5 * Math.sin(x * 0.007 + 0.4);
      pts.push([x, y - w / 2]);
      pts2.unshift([x, y + w / 2]);
    }
    B.poly(RIV.waterDeep, [...pts, ...pts2]);
    for (const [yc, amp, f, w] of [
      [968, 26, 0.0036, 3.2],
      [1110, 40, 0.0028, 4.4],
    ] as [number, number, number, number][]) {
      const a: Pt[] = [];
      const b: Pt[] = [];
      for (let x = x0; x <= x1; x += 40) {
        const y = yc + amp * Math.sin(x * f + yc);
        a.push([x, y - w / 2]);
        b.unshift([x, y + w / 2]);
      }
      B.poly(RIV.path, [...a, ...b]);
    }
  }
  B.layer();
  // groves: crowns grow with nearness (lower = nearer), clustered, a third in blossom
  {
    const g = rng(`${seed}/groves`);
    for (let i = 0; i < 70; i++) {
      const gx = g.range(x0, x1);
      const gy = g.range(RIVER.nearBank[1] + 8, RIVER.deep - 10);
      const n = g.int(3, 9);
      const blossomGrove = g.chance(0.4);
      for (let j = 0; j < n; j++) {
        const y = gy + g.range(-14, 14);
        const s = 4.5 + (y - RIVER.nearBank[1]) * 0.036;
        const x = gx + g.range(-4, 4) * s;
        const col = blossomGrove ? g.pick([RIV.blossom, RIV.blossom, RIV.blossomWhite, RIV.tree]) : g.pick([RIV.tree, RIV.treeLit, RIV.treeDark, RIV.tree]);
        B.fill(RIV.parkShade, crownD(x + s * 0.5, y + s * 0.55, s * 1.05, s * 0.36, `${seed}/gs${i}/${j}`, 5, 0.2));
        B.fill(col, crownD(x, y, s, s * 0.82, `${seed}/g${i}/${j}`, 6, 0.35));
      }
    }
    // a scatter of single trees between the groves
    for (let i = 0; i < 260; i++) {
      const x = g.range(x0, x1);
      const y = g.range(RIVER.nearBank[1] + 4, RIVER.deep - 6);
      const s = 3.5 + (y - RIVER.nearBank[1]) * 0.03;
      B.fill(g.chance(0.3) ? RIV.blossom : g.chance(0.5) ? RIV.treeLit : RIV.tree, crownD(x, y, s, s * 0.8, `${seed}/s${i}`, 5, 0.4));
    }
  }
  B.layer();
  // ---- the water
  const [wy0, wy1] = RIVER.water;
  B.rect(RIV.water, x0, wy0 - 1, x1 - x0, wy1 - wy0 + 2);
  B.rect(RIV.waterDeep, x0, wy0, x1 - x0, 2.6);
  {
    const s = rng(`${seed}/streak`);
    for (let i = 0; i < 70; i++) {
      const x = s.range(x0, x1);
      const y = s.range(wy0 + 5, wy1 - 3);
      B.rect(s.chance(0.6) ? RIV.waterLit : RIV.waterDeep, x, y, s.range(30, 110), s.chance(0.7) ? 1.1 : 1.6);
    }
  }
  B.layer();
  // ---- the near bank: the shore edge, the lawn strip, the parkway, the boat basin
  const [ny0, ny1] = RIVER.nearBank;
  B.rect(RIV.park, x0, ny0, x1 - x0, ny1 - ny0);
  B.rect(RIV.wall, x0, ny0 - 0.5, x1 - x0, 1.8);
  B.rect(RIV.road, x0, RIVER.parkway - 2.4, x1 - x0, 4.8);
  B.rect(RIV.roadEdge, x0, RIVER.parkway - 0.3, x1 - x0, 0.7);
  {
    const {x0: bx0, x1: bx1, y} = RIVER.basin;
    // the basin: a lagoon notch in the near bank, docks (pale lines) and moored boats (white specks)
    B.poly(RIV.water, [
      [bx0, y - 1],
      [bx1, y - 1],
      [bx1 - 8, y + 9],
      [bx0 + 12, y + 9],
    ]);
    const d = rng(`${seed}/basin`);
    for (let x = bx0 + 18; x < bx1 - 14; x += 20) {
      B.rect(RIV.dock, x, y + 0.5, 1.2, 7.5);
      for (let k = 0; k < 3; k++) if (d.chance(0.8)) B.rect(RIV.hull, x + (d.chance(0.5) ? 1.8 : -5.6), y + 1.5 + k * 2.4, 3.8, 1.4);
    }
  }
  B.layer();
  // near-bank trees in a broken line along the shore and the parkway (blossom among them)
  {
    const t = rng(`${seed}/nbt`);
    for (let x = x0; x < x1; x += t.range(5, 13)) {
      if (x > RIVER.basin.x0 - 4 && x < RIVER.basin.x1 + 4) continue;
      if (t.chance(0.22)) continue;
      const y = t.chance(0.55) ? ny0 + t.range(4, 8) : ny1 - t.range(1, 4);
      const s = t.range(3.2, 5.6);
      B.fill(t.chance(0.3) ? RIV.blossom : t.chance(0.15) ? RIV.blossomWhite : t.chance(0.5) ? RIV.tree : RIV.treeLit, crownD(x, y - s * 0.5, s, s * 0.8, `${seed}/nb${x.toFixed(1)}`, 5, 0.45));
    }
  }
  B.layer();
  // ---- the bridges over the water
  {
    // Memorial Bridge: a low stone deck with its arches, from the Lincoln Memorial to the near shore (left)
    const {far, near} = RIVER.memorial;
    B.fill(RIV.bridge, deckD(far, near, 4.2));
    B.fill(RIV.bridgeLit, deckD(lerpP(far, near, 0) as Pt, near, 1.2));
    const n = 9;
    for (let i = 0; i < n; i++) {
      const k0 = (i + 0.18) / n;
      const k1 = (i + 0.82) / n;
      const a = lerpP(far, near, k0);
      const b = lerpP(far, near, k1);
      const m = lerpP(far, near, (k0 + k1) / 2);
      const h = 2.2 + 2.4 * ((k0 + k1) / 2); // nearer arches are bigger
      B.fill(RIV.arch, `M${a[0]} ${a[1] + 2.1}Q${m[0]} ${m[1] + 2.1 - h * 2} ${b[0]} ${b[1] + 2.1}L${b[0]} ${b[1] + 2.1 + h * 0.7}L${a[0]} ${a[1] + 2.1 + h * 0.7}Z`);
    }
    // the 14th Street spans: thin flat decks on slim piers (the third a darker rail bridge)
    RIVER.fourteenth.forEach(({far: f, near: nn}, i) => {
      B.fill(i === 2 ? RIV.bridgeShade : RIV.bridge, deckD(f, nn, i === 2 ? 1.8 : 2.4));
      for (let k = 0.06; k < 1; k += 0.075) {
        const p = lerpP(f, nn, k);
        B.rect(RIV.bridgeShade, p[0] - 0.7, p[1] + 1, 1.4, 2.5 + 2.5 * k);
      }
    });
  }
  B.layer();
  // ---- the far shore: the embankment, the monuments, the cherry fringe in front of the city's lowest row
  B.rect(RIV.wall, x0, RIVER.shore - 2, x1 - x0, 2.4);
  B.rect(RIV.wallShade, x0, RIVER.shore + 0.2, x1 - x0, 0.8);
  {
    // the Lincoln Memorial: a long white temple, a colonnade band in shade, a flat attic
    const {x, base} = RIVER.lincoln;
    B.rect(RIV.temple, x - 17, base - 11, 34, 11);
    B.rect(RIV.templeShade, x - 15, base - 8.4, 30, 5.2);
    for (let k = -14; k <= 14; k += 3.5) B.rect(RIV.temple, x + k - 0.6, base - 8.4, 1.2, 5.2);
    B.rect(RIV.temple, x - 13, base - 14, 26, 3.4);
    B.rect(RIV.templeShade, x - 17, base - 11, 4, 11);
    // the Jefferson Memorial: a low dome on a portico, ringed by the Tidal Basin's cherries
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
    // the Kennedy Center: a long low white box on the shore (far left)
    const {x: kx, base: kb} = RIVER.kennedy;
    B.rect(RIV.temple, kx - 30, kb - 9, 60, 9);
    B.rect(RIV.templeShade, kx - 30, kb - 2.6, 60, 2.6);
    B.rect(RIV.templeShade, kx - 30, kb - 9, 6, 9);
  }
  B.layer();
  {
    const c = rng(`${seed}/cherry`);
    for (let x = x0; x < x1; x += c.range(3.5, 8)) {
      // skip the monuments' fronts
      if (Math.abs(x - RIVER.lincoln.x) < 19 || Math.abs(x - RIVER.kennedy.x) < 32) continue;
      const nearJeff = Math.abs(x - RIVER.jefferson.x) < 120;
      if (Math.abs(x - RIVER.jefferson.x) < 15) continue;
      const pinkK = nearJeff ? 0.85 : 0.35 + 0.25 * Math.sin(x * 0.009);
      const s = c.range(2.8, 5.2) * (nearJeff ? 1.15 : 1);
      const col = c.chance(pinkK) ? (c.chance(0.3) ? RIV.shoreBlossomLit : RIV.shoreBlossom) : c.chance(0.5) ? RIV.shoreTree : RIV.shoreTreeLit;
      B.fill(col, crownD(x, RIVER.shore - s * 0.55, s, s * 0.78, `${seed}/fs${x.toFixed(1)}`, 5, 0.5));
    }
  }
  return B;
}

export const S5River: React.FC<{seed?: string}> = ({seed = 's5river'}) => {
  const t = useTime();
  const stat = useMemo(() => staticRiver(seed), [seed]);
  // glints: short paper dashes on the water; each pops on / off on its own slow period (never a fade), drifting with
  // the current (+2 px/s)
  const glints = useMemo(() => {
    const g = rng(`${seed}/gl`);
    return Array.from({length: 90}, () => ({x: g.range(RIVER.x0, RIVER.x1), y: g.range(RIVER.water[0] + 3.5, RIVER.water[1] - 2.5), w: g.range(3, 9), ph: g.range(0, 1), per: g.range(1.4, 2.8), duty: g.range(0.45, 0.75)}));
  }, [seed]);
  let gd = '';
  for (const q of glints) if (frac(t / q.per + q.ph) < q.duty) gd += `M${(q.x + 2 * t).toFixed(1)} ${q.y.toFixed(1)}h${q.w.toFixed(1)}`;
  // rowers (sculls: a hull and two oars that stroke ~1 Hz), slow
  const rowers = [
    {x0: 470, v: 7, y: 814},
    {x0: 905, v: -6, y: 818},
    {x0: 1210, v: 8, y: 811},
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
    {x0: 1120, v: -2, y: 812},
  ];
  let sd = '';
  for (const q of sails) {
    const x = q.x0 + q.v * t;
    sd += `M${(x - 5).toFixed(1)} ${q.y}h11l-2 2h-7Z M${(x - 1).toFixed(1)} ${(q.y - 0.5).toFixed(1)}l0 -12l7 11.5Z`;
  }
  // cars on the parkway (both ways, ~32 px/s) and on the two 14th Street road decks (~26 px/s along the deck)
  const cars: React.ReactNode[] = [];
  const span = RIVER.x1 - RIVER.x0;
  for (let i = 0; i < 44; i++) {
    const dir = i % 2 ? 1 : -1;
    const x = RIVER.x0 + frac(rand(seed, `car${i}`) + (dir * t * 32) / span) * span;
    const w = 6 + rand(seed, `cw${i}`) * 3;
    cars.push(<rect key={`p${i}`} x={x} y={dir > 0 ? RIVER.parkway - 2.1 : RIVER.parkway + 0.3} width={w} height={1.9} fill={RIV.carCols[i % RIV.carCols.length]} />);
  }
  RIVER.fourteenth.slice(0, 2).forEach(({far, near}, j) => {
    const len = Math.hypot(near[0] - far[0], near[1] - far[1]);
    for (let i = 0; i < 6; i++) {
      const dir = j === 0 ? 1 : -1;
      const k = frac(rand(seed, `bc${j}/${i}`) + (dir * t * 26) / len);
      const p = lerpP(far, near, k);
      cars.push(<rect key={`b${j}/${i}`} x={p[0] - 2.4} y={p[1] - 2.1} width={4.8} height={1.7} fill={RIV.carCols[(i + j * 3) % RIV.carCols.length]} />);
    }
  });
  return (
    <>
      <Paint b={stat} seed={seed} misreg={false} />
      <path d={gd} stroke={RIV.glint} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={hulls} fill={RIV.hull} />
      <path d={rw} stroke={RIV.rower} strokeWidth={0.9} strokeLinecap="round" fill="none" />
      <path d={sd} fill={RIV.sail} />
      {cars}
    </>
  );
};
