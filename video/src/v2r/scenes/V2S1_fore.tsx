// V2S1 helper (lane L1, our bank): THE FOREGROUND at near scale (the orchestrator's G4 fixes, 2026-10-27; DIRECTION
// rule 3: full, never empty, a world made of things, layered, cut by the edges). Strangers-free: things only. On the
// two-point ground (V2S1_steps_stone): every long edge of a thing that runs along the canal goes to GROUND_VP like the
// steps' own edges, verticals stay vertical, contact shadows lie along the ground's slope. Three layers, back to front:
//   mid    a long stone bench cut by the right edge (tread 2); the bay tree's crown over the left treads
//   near   a terracotta planter with the bay tree, cut by the left edge (the terrace); two stacked flower crates (tread
//          5); a café table and two bistro chairs (tread 4); a stone pier cut by the right edge
//   front  cut by the bottom edge: a big pot of fern, a third bistro chair (nothing empty at the bottom)
// The small props sit in clusters ON those things (the café table, the bench, the pier, the planter's foot), never as an
// even scatter. Tier C, but NEAR: the fullest value range of the ground (near = most contrast, far = haze; deeper source
// colours so the environment tier's page pull leaves them full, never ghostly). Every light shape from RIG_CANAL (the
// assembly's Lit): contact under whatever touches (tilted along the ground), casts right and a little toward us, the
// side away from the low western sun one form step; all landing with the flood (frame 0 is pale shapes only).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {CastShadow, ContactShadow, FormShade, Shade, ShadowLayer} from '../../lib/light';
import {CM} from '../palette';
import {floodAt} from './V2S1_clock';
import {BANK_LIT, GROUND_VP, edgeSlope} from './V2S1_steps_stone';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`;
const F: React.FC<{d: string; c: string; s: string}> = ({d, c, s}) => <Fill d={d} color={c} seed={`fore/${s}`} offset={false} />;

/** y at x2 on the ground-edge line through (x, y) (the line to GROUND_VP). */
const along = (x: number, y: number, x2: number) => GROUND_VP[1] + ((y - GROUND_VP[1]) * (x2 - GROUND_VP[0])) / (x - GROUND_VP[0]);
/** A box face whose top and bottom edges run to GROUND_VP: from x0 to x1, top through (xc, yTop), bottom through
 *  (xc, yBot); its sides vertical. */
const slab = (x0: number, x1: number, xc: number, yTop: number, yBot: number) =>
  poly([[x0, along(xc, yTop, x0)], [x1, along(xc, yTop, x1)], [x1, along(xc, yBot, x1)], [x0, along(xc, yBot, x0)]]);
/** An ellipse lying on the ground: its long axis along the ground's edges at that spot. */
const groundEll = (cx: number, cy: number, rx: number, ry: number) => {
  const a = Math.atan(edgeSlope(cx, cy));
  const pts: Pt[] = [];
  for (let k = 0; k < 28; k++) {
    const u = (k / 28) * Math.PI * 2;
    const ex = Math.cos(u) * rx;
    const ey = Math.sin(u) * ry;
    pts.push([cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)]);
  }
  return poly(pts);
};

/** The things in screen px (zoom 1.00, the camera is locked): each base on its own tread of the two-point bank. */
export const FORE = {
  pier: {x0: 872, cap: 1598, base: 1960, xc: 986},
  planter: {x0: -40, x1: 268, xc: 114, rim: 1528, base: 1754},
  crates: {x0: 372, x1: 548, xc: 460, base: 1754},
  table: {x: 742, top: 1566, foot: 1696},
  bench: {x0: 846, xc: 970, seat: 1438, base: 1500},
  fern: {x: 452, rim: 1826},
  nearChair: {x: 760, seat: 1888},
};

// NEAR values (fuller than the far ground's): warm only (a shadow multiplied onto a low-chroma stone reads grey)
const STONE_LIT = BANK_LIT;
const STONE = CM.paving;
const STONE_MID = '#CFB39B'; // the near stone faces (L* ~74)
const TERRACOTTA = '#C98A6C'; // the planter and the pots (L* ~63)
const WOOD = '#C99052'; // the crates (L* ~64)
const WOOD_LIGHT = '#DDB06F'; // their lighter slat (L* ~74)
const RATTAN = '#C9876A'; // the bistro chairs (L* ~62)
const IRON = CM.coatSlate;
const LEAF_SHADE = '#86A07E'; // the bay's inner lobes, a full step under the sage (L* ~63)
const FERN = '#7E9C74'; // the near fern (L* ~61)
const CANVAS = '#F1E3CB'; // the tote's canvas

// ---------------------------------------------------------------- near: the pier (cut by the right edge)

const Pier: React.FC = () => {
  const {x0, cap, base, xc} = FORE.pier;
  return (
    <>
      <F d={slab(x0, 1100, xc, cap + 26, base)} c={STONE_MID} s="pierBody" />
      <F d={slab(x0 - 14, 1100, xc, cap, cap + 28)} c={STONE_LIT} s="pierCap" />
      {/* a terracotta pot of thyme on the pier cap */}
      <F d={poly([[930, cap - 44], [990, cap - 44], [982, cap], [938, cap]])} c={TERRACOTTA} s="pierPot" />
      <F d={`M926 ${cap - 44}C930 ${cap - 74} 950 ${cap - 88} 962 ${cap - 84}C976 ${cap - 92} 996 ${cap - 72} 994 ${cap - 44}Z`} c={CM.sage} s="pierThyme" />
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
  const {x0, x1, xc, rim, base} = FORE.planter;
  return (
    <>
      {/* the bay's trunk (wider than a line: 16 px) and its crown, cut by the left edge */}
      <F d={poly([[118, rim + 2], [134, rim + 2], [138, 1420], [124, 1420]])} c={CM.brickDeep} s="bayTrunk" />
      <F d={crown} c={CM.sage} s="bayCrown" />
      <F d={ell(150, 1414, 52, 30) + ell(70, 1440, 40, 22)} c={LEAF_SHADE} s="bayInner" />
      {/* the terracotta box: a lit stone rim, the body below it, both edges to the vanishing point */}
      <F d={slab(x0, x1, xc, rim + 14, base)} c={TERRACOTTA} s="plBody" />
      <F d={slab(x0 - 8, x1 + 10, xc, rim, rim + 16)} c={STONE_LIT} s="plRim" />
      {/* a few grasses at the rim's right corner */}
      <F d={`M228 ${rim}C226 ${rim - 40} 214 ${rim - 70} 206 ${rim - 82}C222 ${rim - 66} 236 ${rim - 40} 240 ${rim}ZM244 ${rim}C246 ${rim - 46} 256 ${rim - 72} 268 ${rim - 86}C262 ${rim - 60} 256 ${rim - 32} 256 ${rim}Z`} c={CM.leafGold} s="plGrass" />
    </>
  );
};

/** The planter's foot: a canvas tote someone set down. */
const PlanterFoot: React.FC = () => (
  <>
    <F d={poly([[282, 1704], [334, 1710], [338, 1762], [278, 1756]])} c={CANVAS} s="tote" />
    <F d={poly([[280, 1722], [337, 1728], [337, 1737], [280, 1731]])} c={CM.sage} s="toteBand" />
    <F d={`M294 1705C296 1683 320 1685 322 1708L316 1707C314 1693 302 1691 300 1705Z`} c={RATTAN} s="toteH" />
  </>
);

const Crates: React.FC = () => {
  const {x0, x1, xc, base} = FORE.crates;
  const lower = 1666;
  const upper = 1590;
  const ux0 = x0 + 14;
  const ux1 = x1 - 10;
  return (
    <>
      {/* flowers in the upper crate: mounds above its rim */}
      <F d={ell(ux0 + 40, upper - 4, 36, 24) + ell(ux0 + 118, upper - 6, 40, 28)} c={CM.sage} s="crLeaves" />
      <F d={ell(ux0 + 34, upper - 14, 22, 15) + ell(ux0 + 96, upper - 18, 20, 14)} c={CM.blossom} s="crPink" />
      <F d={ell(ux0 + 66, upper - 10, 18, 13) + ell(ux0 + 140, upper - 14, 18, 13)} c={CM.coatMustard} s="crGold" />
      {/* the two crates: slats as flat bands in two woods, no gaps (a dark slit reads as a line) */}
      <F d={slab(ux0, ux1, xc, upper, lower)} c={WOOD} s="crU" />
      <F d={slab(ux0, ux1, xc, upper + 26, upper + 46)} c={WOOD_LIGHT} s="crUs" />
      <F d={slab(x0, x1, xc, lower, base)} c={WOOD} s="crL" />
      <F d={slab(x0, x1, xc, lower + 30, lower + 54)} c={WOOD_LIGHT} s="crLs" />
    </>
  );
};

const Chair: React.FC<{x: number; s: string; flip?: boolean; seatY?: number; k?: number}> = ({x, s, flip, seatY = 1626, k: z = 1}) => {
  const k = (flip ? -1 : 1) * z;
  const foot = seatY + 74 * z;
  return (
    <>
      {/* legs: wide and mid-light (thin dark legs read as lines) */}
      <F d={poly([[x - 36 * k, seatY], [x - 26 * k, seatY], [x - 30 * k, foot], [x - 42 * k, foot]])} c={CM.stoneShade} s={`${s}L1`} />
      <F d={poly([[x + 26 * k, seatY], [x + 36 * k, seatY], [x + 42 * k, foot], [x + 30 * k, foot]])} c={CM.stoneShade} s={`${s}L2`} />
      {/* the back: a rattan hoop seen from the side, the seat a flat oval */}
      <F d={`M${x - 40 * k} ${seatY}C${x - 46 * k} ${seatY - 46 * z} ${x - 40 * k} ${seatY - 80 * z} ${x - 20 * k} ${seatY - 86 * z}L${x - 10 * k} ${seatY - 74 * z}C${x - 26 * k} ${seatY - 66 * z} ${x - 30 * k} ${seatY - 36 * z} ${x - 26 * k} ${seatY}Z`} c={RATTAN} s={`${s}B`} />
      <F d={ell(x, seatY, 46 * z, 12 * z)} c={RATTAN} s={`${s}S`} />
    </>
  );
};

const CafeSet: React.FC = () => {
  const {x, top, foot} = FORE.table;
  return (
    <>
      <Chair x={622} s="chL" />
      <Chair x={856} s="chR" flip />
      {/* the table: a marble top on a slate pedestal (14 px: a form, not a line) and a flat foot on the ground */}
      <F d={groundEll(x, foot, 48, 9)} c={IRON} s="tFoot" />
      <F d={poly([[x - 7, top + 10], [x + 7, top + 10], [x + 7, foot], [x - 7, foot]])} c={IRON} s="tPed" />
      <F d={ell(x, top + 7, 94, 20)} c={STONE} s="tEdge" />
      <F d={ell(x, top, 94, 20)} c={STONE_LIT} s="tTop" />
      {/* the cluster on the table: two takeaway cups and a folded paper */}
      <F d={poly([[702, top - 26], [722, top - 26], [719, top + 2], [705, top + 2]])} c={CM.paper} s="cup1" />
      <F d={poly([[703, top - 18], [721, top - 18], [721, top - 9], [703, top - 9]])} c={CM.brick} s="cup1s" />
      <F d={poly([[740, top - 30], [760, top - 30], [757, top - 2], [743, top - 2]])} c={CM.paper} s="cup2" />
      <F d={poly([[741, top - 22], [759, top - 22], [759, top - 13], [741, top - 13]])} c={CM.sage} s="cup2s" />
      <F d={poly([[770, top - 6], [818, top - 12], [826, top - 2], [778, top + 4]])} c={CM.paper} s="paper" />
    </>
  );
};

// ---------------------------------------------------------------- mid: the bench (cut by the right edge)

const Bench: React.FC = () => {
  const {x0, xc, seat, base} = FORE.bench;
  return (
    <>
      <F d={slab(x0 + 8, 1100, xc, seat + 18, base)} c={STONE_MID} s="bnFace" />
      <F d={slab(x0, 1100, xc, seat, seat + 18)} c={STONE_LIT} s="bnSeat" />
      {/* the cluster on the bench: a backpack and a flask */}
      <F d={`M900 ${seat - 2}L898 ${seat - 46}Q900 ${seat - 66} 926 ${seat - 66}Q952 ${seat - 66} 954 ${seat - 46}L952 ${seat}Z`} c={IRON} s="pack" />
      <F d={poly([[904, seat - 42], [948, seat - 42], [948, seat - 32], [904, seat - 32]])} c={CM.stoneShade} s="packFlap" />
      <F d={poly([[984, seat - 46], [1000, seat - 46], [1000, seat + 1], [984, seat + 1]])} c={CM.sage} s="flask" />
    </>
  );
};

// ---------------------------------------------------------------- front: cut by the bottom edge

/** A big terracotta pot of fern, nearest of all (its foot below the frame). */
const FernPot: React.FC = () => {
  const {x, rim} = FORE.fern;
  return (
    <>
      <F d={`M${x - 6} ${rim}C${x - 70} ${rim - 50} ${x - 150} ${rim - 60} ${x - 196} ${rim - 34}C${x - 150} ${rim - 40} ${x - 84} ${rim - 22} ${x - 20} ${rim}ZM${x + 6} ${rim}C${x + 60} ${rim - 70} ${x + 140} ${rim - 96} ${x + 196} ${rim - 80}C${x + 136} ${rim - 72} ${x + 74} ${rim - 34} ${x + 22} ${rim}ZM${x - 10} ${rim}C${x - 40} ${rim - 90} ${x - 30} ${rim - 150} ${x + 10} ${rim - 176}C${x - 6} ${rim - 130} ${x + 6} ${rim - 66} ${x + 12} ${rim}Z`} c={FERN} s="fern" />
      <F d={poly([[x - 112, rim + 22], [x + 112, rim + 22], [x + 92, 1960], [x - 92, 1960]])} c={TERRACOTTA} s="fernPot" />
      <F d={slab(x - 122, x + 122, x, rim, rim + 24)} c={'#D9A486'} s="fernRim" />
    </>
  );
};

/** Leaves on the terrace and the near treads: flat, bigger the nearer. */
function leaf(x: number, y: number, L: number, a: number): string {
  const r = (a * Math.PI) / 180;
  const ux = Math.cos(r) * L;
  const uy = Math.sin(r) * L * 0.5;
  return `M${r1(x - ux)} ${r1(y - uy)}Q${r1(x - uy)} ${r1(y + ux * 0.25)} ${r1(x + ux)} ${r1(y + uy)}Q${r1(x + uy)} ${r1(y - ux * 0.25)} ${r1(x - ux)} ${r1(y - uy)}Z`;
}
const Leaves: React.FC = () => (
  <>
    <F d={leaf(330, 1676, 15, 60) + leaf(600, 1790, 20, -10) + leaf(160, 1830, 26, 30)} c={CM.leafGold} s="lvG" />
    <F d={leaf(566, 1734, 16, -40) + leaf(270, 1900, 30, -20) + leaf(980, 1900, 28, 50)} c={RATTAN} s="lvR" />
  </>
);

// ---------------------------------------------------------------- their light

type Foot = {x: number; y: number; w: number; h?: number};
const NEAR_FEET: Foot[] = [
  {x: FORE.planter.xc, y: FORE.planter.base, w: 318, h: 226}, // planter
  {x: 308, y: 1760, w: 58, h: 52}, // tote
  {x: FORE.crates.xc, y: FORE.crates.base, w: 180, h: 164}, // crates
  {x: FORE.table.x, y: FORE.table.foot + 2, w: 96, h: 130}, // table
  {x: 622, y: 1702, w: 92, h: 86}, // chair L
  {x: 856, y: 1702, w: 92, h: 86}, // chair R
];
const MID_FEET: Foot[] = [{x: FORE.bench.xc, y: FORE.bench.base, w: 280, h: 62}];

/** Contact strips lie along the ground's slope (the two-point bank), casts along the light. */
const Feet: React.FC<{feet: Foot[]}> = ({feet}) => (
  <ShadowLayer>
    {feet.map((f, i) => (
      <React.Fragment key={i}>
        <ContactShadow x={f.x} y={f.y} w={f.w} d={groundEll(f.x, f.y + 3, f.w * 0.56, Math.max(6, Math.min(14, f.w * 0.07)))} at={floodAt(f.x, f.y)} />
        {f.h ? <CastShadow x={f.x} y={f.y} w={f.w * 0.85} h={f.h} at={floodAt(f.x, f.y)} /> : null}
      </React.Fragment>
    ))}
  </ShadowLayer>
);

/** Small contact strips under the props in the clusters (on the table, the bench, the pier). */
const PropFeet: React.FC = () => {
  const top = FORE.table.top;
  const seat = FORE.bench.seat;
  const strips: Foot[] = [
    {x: 712, y: top + 2, w: 16},
    {x: 750, y: top - 2, w: 16},
    {x: 798, y: top + 2, w: 50},
    {x: 926, y: seat + 1, w: 56},
    {x: 992, y: seat + 1, w: 18},
    {x: 960, y: FORE.pier.cap + 1, w: 52},
  ];
  return (
    <ShadowLayer>
      {strips.map((f, i) => (
        <ContactShadow key={i} x={f.x} y={f.y} w={f.w} h={6} at={floodAt(f.x, f.y)} />
      ))}
    </ShadowLayer>
  );
};

/** The side away from the low western sun on the big things: one form step; the faces turned to us one Shade step. */
const NearForm: React.FC = () => (
  <>
    <FormShade d={slab(FORE.planter.x0, FORE.planter.x1, FORE.planter.xc, FORE.planter.rim + 14, FORE.planter.base)} at={floodAt(120, 1640)} />
    <FormShade d={crown} kind="crescent" at={floodAt(120, 1390)} />
    <FormShade d={slab(FORE.crates.x0, FORE.crates.x1, FORE.crates.xc, 1666, FORE.crates.base)} at={floodAt(460, 1700)} />
    <FormShade d={slab(FORE.crates.x0 + 14, FORE.crates.x1 - 10, FORE.crates.xc, 1590, 1666)} at={floodAt(460, 1620)} />
    <FormShade d={poly([[FORE.table.x - 7, FORE.table.top + 10], [FORE.table.x + 7, FORE.table.top + 10], [FORE.table.x + 7, FORE.table.foot], [FORE.table.x - 7, FORE.table.foot]])} at={floodAt(742, 1640)} />
    <Shade d={slab(FORE.pier.x0, 1100, FORE.pier.xc, FORE.pier.cap + 26, FORE.pier.base)} at={floodAt(980, 1700)} />
  </>
);

const FrontForm: React.FC = () => (
  <FormShade d={poly([[FORE.fern.x - 112, FORE.fern.rim + 22], [FORE.fern.x + 112, FORE.fern.rim + 22], [FORE.fern.x + 92, 1960], [FORE.fern.x - 92, 1960]])} at={floodAt(452, 1880)} />
);

// ---------------------------------------------------------------- the slots

/** The mid layer (the bench), drawn after the treads it stands on and before the near layer. */
export const S1ForeMid: React.FC = () => (
  <>
    <Feet feet={MID_FEET} />
    <Tier tier="environment">
      <Bench />
    </Tier>
  </>
);

/** The near and front layers: the planter and the bay, the crates, the café set, the pier; then what the bottom edge
 *  cuts: the fern pot and the nearest chair. */
export const S1ForeNear: React.FC = () => (
  <>
    <Feet feet={NEAR_FEET} />
    <Tier tier="environment">
      <Planter />
      <PlanterFoot />
      <Crates />
      <CafeSet />
      <Leaves />
      <Pier />
    </Tier>
    <NearForm />
    <PropFeet />
    <Tier tier="environment">
      <FernPot />
      <Chair x={FORE.nearChair.x} s="chN" seatY={FORE.nearChair.seat} k={1.35} />
    </Tier>
    <FrontForm />
  </>
);
