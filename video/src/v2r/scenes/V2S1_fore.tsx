// V2S1 helper (lane L1, our bank): THE FOREGROUND at near scale (the orchestrator's G4 fix, 2026-10-27; DIRECTION
// rule 3: full, never empty, a world made of things, layered, cut by the edges; CRAFT §b tier C: no outlines, soft
// values, local contrast <= 7). Strangers-free: things only. Three layers, back to front, over the treads
// (V2S1_steps_stone, calm two-tone blocks):
//   mid    a long stone bench cut by the right edge (tread 2); the small bay tree's crown over the left treads
//   near   a stone planter with the bay tree, cut by the left edge; two stacked flower crates; a café table and two
//          bistro chairs (tread 4)
//   front  the stone parapet across the bottom and its pier cut by the right edge (the last tread under it)
// The small props sit in four clusters ON those things (the café table, the parapet's cap, the bench, the planter's
// foot), never as an even scatter. Flat shapes in two tones; every light shape from RIG_CANAL (the assembly's Lit):
// contact under whatever touches, casts right and a little toward us, the side away from the low western sun one form
// step, the faces turned to us one Shade step; all landing with the flood (frame 0 is pale shapes only).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {CastShadow, ContactShadow, FormShade, Shade, ShadowLayer} from '../../lib/light';
import {CM} from '../palette';
import {floodAt} from './V2S1_clock';
import {BANK_LIT} from './V2S1_steps_stone';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`;
const F: React.FC<{d: string; c: string; s: string}> = ({d, c, s}) => <Fill d={d} color={c} seed={`fore/${s}`} offset={false} />;

/** The front layer in screen px (zoom 1.00, the camera is locked). */
export const FORE = {
  parapet: {cap: [1760, 1786] as Pt, face: [1786, 1940] as Pt},
  pier: {x0: 872, cap: [1598, 1626] as Pt},
  planter: {x0: -40, x1: 268, rim: 1528, base: 1754},
  crates: {x0: 372, x1: 548, base: 1754},
  table: {x: 742, top: 1566, foot: 1696},
  bench: {x0: 846, seat: [1438, 1456] as Pt, base: 1500},
};

// warm values only (a shadow multiplied onto a low-chroma stone reads grey: check_light)
const STONE_LIT = BANK_LIT;
const STONE = CM.paving;
const STONE_MID = CM.coatOat;
const WOOD = CM.leafGold;
const WOOD_LIGHT = '#E4BE84'; // the crates' lighter slat (between the gold and the oat)
const RATTAN = CM.brickLight;
const IRON = CM.coatSlate;
const LEAF_SHADE = '#9DB596'; // the bay's inner lobes, one step under the sage
const CANVAS = '#F1E3CB'; // the tote's canvas

// ---------------------------------------------------------------- front: the parapet and its pier

const Parapet: React.FC = () => {
  const {cap, face} = FORE.parapet;
  // ashlar blocks ~1.4 m (200-260 px at this depth) in two warm tones, staggered by half a block between the courses
  const blocks: {d: string; c: string}[] = [];
  const courses: [number, number][] = [
    [face[0], 1862],
    [1862, face[1]],
  ];
  courses.forEach(([y0, y1], j) => {
    let x = j ? -130 : -20;
    let i = 0;
    while (x < FORE.pier.x0) {
      const w = 236 + ((i * 53 + j * 31) % 40);
      blocks.push({d: rect(x, y0, Math.min(x + w, FORE.pier.x0), y1), c: (i + j) % 2 ? STONE : STONE_MID});
      x += w;
      i++;
    }
  });
  return (
    <>
      {blocks.map((b, i) => (
        <F key={i} d={b.d} c={b.c} s={`parB${i}`} />
      ))}
      {/* the cap: a lit top a little proud of the face */}
      <F d={rect(-30, cap[0], FORE.pier.x0, cap[1])} c={STONE_LIT} s="parCap" />
    </>
  );
};

const Pier: React.FC = () => {
  const {x0, cap} = FORE.pier;
  return (
    <>
      <F d={rect(x0, cap[1], 1100, 1760)} c={STONE_MID} s="pierU" />
      <F d={rect(x0, 1760, 1100, 1940)} c={STONE} s="pierL" />
      <F d={rect(x0 - 14, cap[0], 1100, cap[1])} c={STONE_LIT} s="pierCap" />
      {/* a terracotta pot of thyme on the pier cap */}
      <F d={poly([[930, cap[0] - 44], [990, cap[0] - 44], [982, cap[0]], [938, cap[0]]])} c={CM.brickLight} s="pierPot" />
      <F d={`M926 ${cap[0] - 44}C930 ${cap[0] - 74} 950 ${cap[0] - 88} 962 ${cap[0] - 84}C976 ${cap[0] - 92} 996 ${cap[0] - 72} 994 ${cap[0] - 44}Z`} c={CM.sage} s="pierThyme" />
    </>
  );
};

/** The faces turned to us (away from the low western sun): one Shade step under the lit caps. */
const FrontShade: React.FC = () => {
  const {cap, face} = FORE.parapet;
  return (
    <>
      <Shade d={rect(-30, cap[1], FORE.pier.x0, face[1])} at={floodAt(400, 1840)} />
      <Shade d={rect(FORE.pier.x0, FORE.pier.cap[1], 1100, 1940)} at={floodAt(980, 1700)} />
    </>
  );
};

// ---------------------------------------------------------------- near: planter + bay, crates, the café set

const crown: string = [
  ell(118, 1388, 104, 70),
  ell(36, 1420, 84, 58),
  ell(206, 1428, 80, 54),
  ell(128, 1348, 70, 40),
].join('');

const Planter: React.FC = () => {
  const {x0, x1, rim, base} = FORE.planter;
  return (
    <>
      {/* the bay's trunk (wider than a line: 16 px) and its crown, cut by the left edge */}
      <F d={poly([[118, rim + 2], [134, rim + 2], [138, 1420], [124, 1420]])} c={CM.brickDeep} s="bayTrunk" />
      <F d={crown} c={CM.sage} s="bayCrown" />
      <F d={ell(150, 1414, 52, 30) + ell(70, 1440, 40, 22)} c={LEAF_SHADE} s="bayInner" />
      {/* the box: a lit rim, the face in the mid stone, the soil just showing */}
      <F d={rect(x0, rim + 14, x1, base)} c={STONE_MID} s="plBody" />
      <F d={rect(x0 - 8, rim, x1 + 10, rim + 16)} c={STONE_LIT} s="plRim" />
      {/* a few grasses at the rim's right corner */}
      <F d={`M228 ${rim}C226 ${rim - 40} 214 ${rim - 70} 206 ${rim - 82}C222 ${rim - 66} 236 ${rim - 40} 240 ${rim}ZM244 ${rim}C246 ${rim - 46} 256 ${rim - 72} 268 ${rim - 86}C262 ${rim - 60} 256 ${rim - 32} 256 ${rim}Z`} c={CM.leafGold} s="plGrass" />
    </>
  );
};

/** The planter's foot: a canvas tote someone set down, and two leaves. */
const PlanterFoot: React.FC = () => (
  <>
    <F d={poly([[282, 1704], [334, 1704], [338, 1756], [278, 1756]])} c={CANVAS} s="tote" />
    <F d={rect(280, 1722, 337, 1731)} c={CM.sage} s="toteBand" />
    <F d={`M294 1704C296 1682 320 1682 322 1704L316 1704C314 1690 302 1690 300 1704Z`} c={RATTAN} s="toteH" />
  </>
);

const Crates: React.FC = () => {
  const {x0, x1, base} = FORE.crates;
  const lower = 1666;
  const upper = 1590;
  const ux0 = x0 + 14;
  const ux1 = x1 - 10;
  return (
    <>
      {/* flowers in the upper crate: mounds above its rim */}
      <F d={ell(ux0 + 40, upper - 6, 36, 24) + ell(ux0 + 118, upper - 10, 40, 28)} c={CM.sage} s="crLeaves" />
      <F d={ell(ux0 + 34, upper - 16, 22, 15) + ell(ux0 + 96, upper - 22, 20, 14)} c={CM.blossom} s="crPink" />
      <F d={ell(ux0 + 66, upper - 12, 18, 13) + ell(ux0 + 140, upper - 18, 18, 13)} c={CM.coatMustard} s="crGold" />
      {/* the two crates: slats as flat bands in two woods, no gaps (a dark slit reads as a line) */}
      <F d={rect(ux0, upper, ux1, lower)} c={WOOD} s="crU" />
      <F d={rect(ux0, upper + 26, ux1, upper + 46)} c={WOOD_LIGHT} s="crUs" />
      <F d={rect(x0, lower, x1, base)} c={WOOD} s="crL" />
      <F d={rect(x0, lower + 30, x1, lower + 54)} c={WOOD_LIGHT} s="crLs" />
    </>
  );
};

const Chair: React.FC<{x: number; s: string; flip?: boolean}> = ({x, s, flip}) => {
  const k = flip ? -1 : 1;
  const seatY = 1626;
  return (
    <>
      {/* legs: wide and mid-light (thin dark legs read as lines) */}
      <F d={poly([[x - 36 * k, seatY], [x - 26 * k, seatY], [x - 30 * k, 1700], [x - 42 * k, 1700]])} c={CM.stoneShade} s={`${s}L1`} />
      <F d={poly([[x + 26 * k, seatY], [x + 36 * k, seatY], [x + 42 * k, 1700], [x + 30 * k, 1700]])} c={CM.stoneShade} s={`${s}L2`} />
      {/* the back: a rattan hoop seen from the side, the seat a flat oval */}
      <F d={`M${x - 40 * k} ${seatY}C${x - 46 * k} 1580 ${x - 40 * k} 1546 ${x - 20 * k} 1540L${x - 10 * k} 1552C${x - 26 * k} 1560 ${x - 30 * k} 1590 ${x - 26 * k} ${seatY}Z`} c={RATTAN} s={`${s}B`} />
      <F d={ell(x, seatY, 46, 12)} c={RATTAN} s={`${s}S`} />
    </>
  );
};

const CafeSet: React.FC = () => {
  const {x, top, foot} = FORE.table;
  return (
    <>
      <Chair x={622} s="chL" />
      <Chair x={856} s="chR" flip />
      {/* the table: a marble top on a slate pedestal (14 px: a form, not a line) and a flat foot */}
      <F d={ell(x, foot, 48, 9)} c={IRON} s="tFoot" />
      <F d={rect(x - 7, top + 10, x + 7, foot)} c={IRON} s="tPed" />
      <F d={ell(x, top + 7, 94, 20)} c={STONE} s="tEdge" />
      <F d={ell(x, top, 94, 20)} c={STONE_LIT} s="tTop" />
      {/* the cluster on the table: two takeaway cups and a folded paper */}
      <F d={poly([[702, top - 26], [722, top - 26], [719, top + 2], [705, top + 2]])} c={CM.paper} s="cup1" />
      <F d={rect(703, top - 18, 721, top - 9)} c={CM.brick} s="cup1s" />
      <F d={poly([[740, top - 30], [760, top - 30], [757, top - 2], [743, top - 2]])} c={CM.paper} s="cup2" />
      <F d={rect(741, top - 22, 759, top - 13)} c={CM.sage} s="cup2s" />
      <F d={poly([[770, top - 6], [818, top - 12], [826, top - 2], [778, top + 4]])} c={CM.paper} s="paper" />
    </>
  );
};

// ---------------------------------------------------------------- mid: the bench (cut by the right edge)

const Bench: React.FC = () => {
  const {x0, seat, base} = FORE.bench;
  return (
    <>
      <F d={rect(x0 + 8, seat[1], 1100, base)} c={STONE_MID} s="bnFace" />
      <F d={rect(x0, seat[0], 1100, seat[1])} c={STONE_LIT} s="bnSeat" />
      {/* the cluster on the bench: a backpack and a flask */}
      <F d={`M900 ${seat[0]}L898 ${seat[0] - 44}Q900 ${seat[0] - 64} 926 ${seat[0] - 64}Q952 ${seat[0] - 64} 954 ${seat[0] - 44}L952 ${seat[0]}Z`} c={IRON} s="pack" />
      <F d={rect(904, seat[0] - 40, 948, seat[0] - 30)} c={CM.stoneShade} s="packFlap" />
      <F d={rect(984, seat[0] - 46, 1000, seat[0])} c={CM.sage} s="flask" />
    </>
  );
};

// ---------------------------------------------------------------- the parapet cap's cluster + a few leaves

const CapCluster: React.FC = () => {
  const y = FORE.parapet.cap[0];
  return (
    <>
      <F d={rect(424, y - 12, 488, y)} c={RATTAN} s="book" />
      <F d={rect(428, y - 15, 484, y - 12)} c={CM.paper} s="bookP" />
      {/* a scarf left folded on the wall */}
      <F d={`M548 ${y}C570 ${y - 14} 610 ${y - 12} 640 ${y - 2}L642 ${y + 1}C612 ${y - 3} 574 ${y - 3} 548 ${y + 3}Z`} c={CM.coatMustard} s="scarf" />
      {/* fallen leaves: two on the cap, two on the tread by the planter */}
      <F d={leaf(372, y + 4, 14, 20) + leaf(700, y + 6, 13, -30)} c={CM.leafGold} s="lvG" />
      <F d={leaf(330, 1676, 15, 60) + leaf(566, 1734, 13, -10)} c={RATTAN} s="lvR" />
    </>
  );
};

function leaf(x: number, y: number, L: number, a: number): string {
  const r = (a * Math.PI) / 180;
  const ux = Math.cos(r) * L;
  const uy = Math.sin(r) * L * 0.5;
  return `M${r1(x - ux)} ${r1(y - uy)}Q${r1(x - uy)} ${r1(y + ux * 0.25)} ${r1(x + ux)} ${r1(y + uy)}Q${r1(x + uy)} ${r1(y - ux * 0.25)} ${r1(x - ux)} ${r1(y - uy)}Z`;
}

// ---------------------------------------------------------------- their light

type Foot = {x: number; y: number; w: number; h?: number};
const NEAR_FEET: Foot[] = [
  {x: 114, y: FORE.planter.base, w: 318, h: 226}, // planter
  {x: 308, y: 1757, w: 58, h: 52}, // tote
  {x: 460, y: FORE.crates.base, w: 180, h: 164}, // crates
  {x: FORE.table.x, y: FORE.table.foot + 2, w: 96, h: 130}, // table
  {x: 622, y: 1702, w: 92, h: 86}, // chair L
  {x: 856, y: 1702, w: 92, h: 86}, // chair R
];
const MID_FEET: Foot[] = [{x: 980, y: FORE.bench.base, w: 280, h: 62}];

const Feet: React.FC<{feet: Foot[]}> = ({feet}) => (
  <ShadowLayer>
    {feet.map((f, i) => (
      <React.Fragment key={i}>
        <ContactShadow x={f.x} y={f.y} w={f.w} at={floodAt(f.x, f.y)} />
        {f.h ? <CastShadow x={f.x} y={f.y} w={f.w * 0.85} h={f.h} at={floodAt(f.x, f.y)} /> : null}
      </React.Fragment>
    ))}
  </ShadowLayer>
);

/** Small contact strips under the props in the clusters (on the table, the cap, the bench). */
const PropFeet: React.FC = () => {
  const top = FORE.table.top;
  const cap = FORE.parapet.cap[0];
  const seat = FORE.bench.seat[0];
  const strips: Foot[] = [
    {x: 712, y: top + 2, w: 16},
    {x: 750, y: top - 2, w: 16},
    {x: 798, y: top + 2, w: 50},
    {x: 456, y: cap + 1, w: 66},
    {x: 926, y: seat + 1, w: 56},
    {x: 992, y: seat + 1, w: 18},
    {x: 960, y: FORE.pier.cap[0] + 1, w: 52},
  ];
  return (
    <ShadowLayer>
      {strips.map((f, i) => (
        <ContactShadow key={i} x={f.x} y={f.y} w={f.w} h={6} at={floodAt(f.x, f.y)} />
      ))}
    </ShadowLayer>
  );
};

/** The side away from the low western sun on the big things: one form step. */
const NearForm: React.FC = () => (
  <>
    <FormShade d={rect(FORE.planter.x0, FORE.planter.rim + 14, FORE.planter.x1, FORE.planter.base)} at={floodAt(120, 1640)} />
    <FormShade d={crown} kind="crescent" at={floodAt(120, 1390)} />
    <FormShade d={rect(FORE.crates.x0, 1666, FORE.crates.x1, FORE.crates.base)} at={floodAt(460, 1700)} />
    <FormShade d={rect(FORE.crates.x0 + 14, 1590, FORE.crates.x1 - 10, 1666)} at={floodAt(460, 1620)} />
    <FormShade d={rect(FORE.table.x - 7, FORE.table.top + 10, FORE.table.x + 7, FORE.table.foot)} at={floodAt(742, 1640)} />
  </>
);

// ---------------------------------------------------------------- the slot

/** The mid layer (the bench), drawn after the treads it stands on and before the near layer. */
export const S1ForeMid: React.FC = () => (
  <>
    <Feet feet={MID_FEET} />
    <Tier tier="environment">
      <Bench />
    </Tier>
  </>
);

/** The near and front layers: the planter and the bay, the crates, the café set; then the parapet and its pier. */
export const S1ForeNear: React.FC = () => (
  <>
    <Feet feet={NEAR_FEET} />
    <Tier tier="environment">
      <Planter />
      <PlanterFoot />
      <Crates />
      <CafeSet />
    </Tier>
    <NearForm />
    <Tier tier="environment">
      <Parapet />
      <Pier />
      <CapCluster />
    </Tier>
    <FrontShade />
    <PropFeet />
  </>
);
