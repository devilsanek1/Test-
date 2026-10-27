// dc/gate.tsx: S6's gate (TREATMENT section 5 S6, section 8; the K2 contract S6): the Pentagon's perimeter footpath at
// eye level, looking SOUTH (the morning sun in the east = screen left, SUN2), HELD at its 24.00 pose (2026-10-27,
// docs/v2/THROUGHLINE.md §4.6: the lateral truck is retired, DIRECTION rule 8: every plane's drift is 0).
//
//   FAR   GateFacade: the low limestone facade band (y 705-835, cut by both edges), a row of tall windows between
//         pilasters (they light one by one past both edges 27.08-27.80), the sliding service door (x 900-1020 at 24.00)
//         with its plate CLASSIFIED / AUTHORIZED PERSONNEL ONLY; it slides shut behind people at 25.0 and 27.4 (the
//         people are K4's: `doorPeople` slot). A hedge and a lawn strip at its foot; blossom trees on the lawn.
//   MID   GateFence: the footpath (paving in perspective), the picket fence behind the deal board, THE TALL CORNER
//         POST right of the board (its cap: map S6.cornerPost (770, 720); Pip now sits at the board's foot), tulip beds.
//   NEAR  GateNear: the near kerb, stone bollards with a low chain, a flowering shrub cut by the left edge, a bike rack
//         and a bench in the right rail (masses), petals on the paving. K4's three readers' head-backs go on top.
// Fairness (V1/V2/V10/V12/V15): an institutional facade, calm, in daylight: no guard, camera, flag, seal, vehicle,
// Google letters, screens or deliveries; "classified", never "secret"; the door never shuts on anyone.
// Scene time t = film time - 24.00. All x at t = 0 (the contract's pose); the planes add their drift.

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {S6, SUN2} from '../../world/map';
import {Batch, Paint, mix, crownD, ellD, lineD, polyD, rng, rand, frac, blossomD, circleD, ease01, type Pt} from './core';
import {benchBack} from './terrace';
import {useTierLine, tiered, Slot} from '../tiers';

export const S6_T0 = 24.0;
export const GATE_DUR = 28.06 - 24.0;

/** Plane drifts (px/s): ALL 0 since the conform (S6 is held; the contract's S6 drifts are 0, the lawn's too). */
export const GATE_DRIFT = {far: S6.facadeDriftPxS, lawn: 0, mid: S6.boardDriftPxS, near: S6.nearCrossPxS};
/** Drift of a plane at scene time t (linear: the contract's s6u). */
export const gateDx = (v: number, t: number) => v * Math.min(GATE_DUR, Math.max(0, t));

export const GATE = {
  horizon: 836,
  facade: {y0: S6.facadeBandY[0], y1: S6.facadeBandY[1], x0: -260, x1: 1400},
  door: S6.serviceDoor0,
  /** The mid plane: the footpath's back kerb (the board's legs), the fence, the corner post (cap = map S6.cornerPost). */
  kerbY: 1252,
  /** A low, open park fence (calm: never a security wall), pickets every 34 px; the tall corner post rises over it. */
  fence: {top: 1010, base: 1236},
  post: {x: S6.cornerPost.x, cap: S6.cornerPost.y, w: 54},
  board: S6.board0,
  sun: SUN2,
};

// ---------------------------------------------------------------- tones (eye level, April morning: no far steps)

export const GT = {
  stone: CM.limestone,
  stoneLit: CM.paper,
  stoneShade: CM.stoneShade,
  stoneDeep: mix(CM.stoneShade, CM.shadeCool, 0.3),
  pane: mix(CM.paneUnlit, CM.glass, 0.25),
  paneLit: CM.lamp,
  door: mix(CM.stoneShade, CM.paneUnlit, 0.35),
  doorDark: mix(CM.paneUnlit, CM.anchor, 0.35),
  plate: CM.paper,
  hedge: mix(CM.sage, CM.shadeWarm, 0.3),
  lawn: CM.sage,
  lawnLit: mix(CM.sage, CM.paper, 0.25),
  paving: CM.paving,
  pavingLit: mix(CM.paving, CM.paper, 0.4),
  joint: mix(CM.paving, CM.line, 0.4),
  kerb: CM.limestone,
  iron: CM.anchor,
  rail: mix(CM.line, CM.anchor, 0.35),
  ironLit: mix(CM.anchor, CM.paneUnlit, 0.55),
  soil: mix(CM.brickDeep, CM.anchor, 0.35),
  tulip: [CM.box, CM.blossom, CM.coatMustard, CM.paper, CM.brick],
  leaf: CM.sage,
  crown: mix(CM.sage, CM.shadeWarm, 0.12),
  crownShade: mix(CM.sage, CM.shadeWarm, 0.4),
  blossom: CM.blossom,
  blossomShade: mix(CM.blossom, CM.shadeWarm, 0.3),
  bark: CM.anchor,
  ink: CM.ink,
};

// ---------------------------------------------------------------- the service door

/** The door's open fraction 0 (shut) .. 1 at scene time t: open at the cut, slides shut behind a person at 25.0, opens
 *  for someone coming out ~26.3, slides shut behind them at 27.4. Each slide takes 0.32 s. */
export function doorOpen(t: number): number {
  const shut1 = S6.doorShutsAt[0] - S6_T0;
  const shut2 = S6.doorShutsAt[1] - S6_T0;
  const open2 = 2.3;
  const d = 0.32;
  if (t < shut1) return 1;
  if (t < shut1 + d) return 1 - ease01(t, shut1, d);
  if (t < open2) return 0;
  if (t < open2 + d) return ease01(t, open2, d);
  if (t < shut2) return 1;
  return 1 - ease01(t, shut2, d);
}

// ---------------------------------------------------------------- FAR: the facade band

export type GateFacadeProps = {
  /** Windows light one by one 27.08-27.80 (scene 3.08-3.80), sweeping past both edges. */
  lightAt?: [number, number];
  /** People at the door (K4 staff backs), drawn INSIDE the doorway layer (between the dark opening and the leaf). */
  doorPeople?: React.ReactNode;
  seed?: string;
};

const GateFacadeBody: React.FC<GateFacadeProps> = ({lightAt = [S6.facadeWindowsLight[0] - S6_T0, S6.facadeWindowsLight[1] - S6_T0], doorPeople, seed = 'facade'}) => {
  const line = useTierLine();
  const t = useTime();
  const F = GATE.facade;
  const D = GATE.door;
  const wins = useMemo(() => {
    const out: {x: number; i: number}[] = [];
    let i = 0;
    for (let x = F.x0 + 40; x < F.x1 - 40; x += 92, i++) {
      if (x + 36 > D.x0 - 24 && x < D.x1 + 24) continue; // the door's bay
      out.push({x, i});
    }
    return out;
  }, []);
  const stat = useMemo(() => {
    const B = new Batch();
    // the hedge and lawn strip at the facade's foot (eye level: the horizon is the facade's base)
    B.rect(GT.lawn, F.x0, F.y1 - 4, F.x1 - F.x0, 60);
    B.rect(GT.lawnLit, F.x0, F.y1 + 22, F.x1 - F.x0, 8);
    B.layer();
    // the band: wall, frieze, cornice (lit top), plinth
    B.rect(GT.stone, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
    B.rect(GT.stoneLit, F.x0, F.y0, F.x1 - F.x0, 5);
    B.rect(GT.stoneShade, F.x0, F.y0 + 14, F.x1 - F.x0, 5);
    B.rect(GT.stoneShade, F.x0, F.y1 - 13, F.x1 - F.x0, 13);
    // pilasters between the windows (the sun on the left: their shade side to the right)
    for (let x = F.x0 + 20; x < F.x1; x += 92) {
      if (x > D.x0 - 30 && x < D.x1 + 20) continue;
      B.rect(GT.stoneLit, x, F.y0 + 20, 6, F.y1 - F.y0 - 33);
      B.rect(GT.stoneShade, x + 6, F.y0 + 20, 5, F.y1 - F.y0 - 33);
    }
    // window surrounds (stone) and their sills
    for (const w of wins) {
      B.rect(GT.stoneLit, w.x - 4, 742, 44, 70);
      B.rect(GT.stoneShade, w.x - 6, 812, 48, 5);
    }
    // the door's bay: a stone surround with a lintel
    B.rect(GT.stoneShade, D.x0 - 12, D.y0 - 9, D.x1 - D.x0 + 24, 9);
    B.rect(GT.stoneLit, D.x0 - 12, D.y0 - 12, D.x1 - D.x0 + 24, 4);
    B.rect(GT.stoneDeep, D.x0 - 12, D.y0, 12, D.y1 - D.y0);
    B.rect(GT.stoneLit, D.x1, D.y0, 12, D.y1 - D.y0);
    // the doorway's dark interior (seen when the leaf slides open)
    B.layer();
    B.rect(GT.doorDark, D.x0, D.y0, D.x1 - D.x0, D.y1 - D.y0);
    // ink: the cornice line, the plinth line (long, broken), the door surround
    B.layer();
    B.ink(lineD([[F.x0, F.y0 + 19], [F.x1, F.y0 + 19]]), 2.2, GT.ink, 0.12);
    B.ink(lineD([[F.x0, F.y1 - 13], [F.x1, F.y1 - 13]]), 2.2, GT.ink, 0.12);
    B.ink(lineD([[D.x0 - 12, D.y1], [D.x0 - 12, D.y0 - 9], [D.x1 + 12, D.y0 - 9], [D.x1 + 12, D.y1]]), 2.2, GT.ink);
    return B;
  }, [wins]);
  // the windows: unlit panes, then the lighting run (one by one, left -> right, past both edges)
  const [l0, l1] = lightAt;
  let unlit = '';
  let lit = '';
  const xs = wins.map((w) => w.x);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  for (const w of wins) {
    const at = l0 + ((w.x - xmin) / (xmax - xmin)) * (l1 - l0);
    const on = t >= at && rand(seed, `w${w.i}`) < 0.82;
    const d = `M${w.x} 748h36v58h-36Z`;
    if (on) lit += d;
    else unlit += d;
  }
  // mullions on every pane
  let mull = '';
  for (const w of wins) mull += `M${w.x + 18} 748v58M${w.x} 776h36`;
  // the sliding leaf: slides RIGHT into a pocket behind the wall; the plate rides on it
  const o = doorOpen(t);
  const lw = D.x1 - D.x0;
  const lx = D.x0 + o * lw * 0.96;
  return (
    <>
      <Paint b={stat} seed={seed} misreg={2} />
      <path d={unlit} fill={GT.pane} />
      <path d={lit} fill={GT.paneLit} />
      <path d={mull} {...line(GT.stoneLit, 2.4, {thing: true})} fill="none" />
      <Slot>{doorPeople}</Slot>
      {/* the leaf, clipped to the doorway (it slides into the wall on the right) */}
      <defs>
        <clipPath id={`${seed}door`}>
          <rect x={D.x0} y={D.y0} width={lw} height={D.y1 - D.y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${seed}door)`}>
        <rect x={lx} y={D.y0} width={lw} height={D.y1 - D.y0} fill={GT.door} />
        <rect x={lx + 4} y={D.y0 + 4} width={3} height={D.y1 - D.y0 - 8} fill={GT.stoneLit} />
        <ServicePlate x={lx + lw / 2} y={D.y0 + 30} />
        <path d={`M${lx + 1} ${D.y0}V${D.y1}`} {...line(GT.ink, 2.2, {contour: false})} />
      </g>
    </>
  );
};
export const GateFacade = tiered('environment', {}, GateFacadeBody);

/** The door plate: CLASSIFIED / AUTHORIZED PERSONNEL ONLY (US spelling; "classified", never "secret"). Centre x, top y. */
const ServicePlateBody: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 108}) => {
  const h = w * 0.5;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={3} fill={GT.plate} stroke={GT.ink} strokeWidth={1.8} />
      <text x={x} y={y + h * 0.42} textAnchor="middle" fontFamily="CaptionHand, 'Patrick Hand', cursive" fontSize={w * 0.185} letterSpacing={0.6} fill={GT.ink}>
        CLASSIFIED
      </text>
      <text x={x} y={y + h * 0.66} textAnchor="middle" fontFamily="CaptionHand, 'Patrick Hand', cursive" fontSize={w * 0.1} fill={GT.ink}>
        AUTHORIZED
      </text>
      <text x={x} y={y + h * 0.86} textAnchor="middle" fontFamily="CaptionHand, 'Patrick Hand', cursive" fontSize={w * 0.1} fill={GT.ink}>
        PERSONNEL ONLY
      </text>
    </g>
  );
};
export const ServicePlate = tiered('environment', {}, ServicePlateBody);

// ---------------------------------------------------------------- LAWN: blossom trees between the fence and the facade

const GateLawnTreesBody: React.FC<{seed?: string}> = ({seed = 'lawntrees'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const r = rng(seed);
    const trees: [number, number, number][] = [];
    // a few cherries on the lawn, kept clear of the service door's bay (x 820-1090 at the cut) so the door reads
    for (let x = -200; x < 1500; x += r.range(230, 330)) if (x < 800 || x > 1110) trees.push([x, r.range(40, 56), r.range(0.5, 0.85)]);
    for (const [x, rr] of trees) {
      B.rect(GT.bark, x - 3, 838, 6, 44);
      B.fill(GT.crownShade, crownD(x + 8, 812, rr * 1.15, rr * 0.7, `${seed}/s${x}`, 7, 0.3));
      B.fill(GT.crown, crownD(x - 6, 800, rr, rr * 0.62, `${seed}/c${x}`, 7, 0.3));
    }
    B.layer();
    let bl = '';
    let bs = '';
    for (const [x, rr, k] of trees) {
      const n = Math.round(14 * k);
      for (let i = 0; i < n; i++) {
        const a = r.range(0, Math.PI * 2);
        const d = Math.sqrt(r.next()) * 0.85;
        const bx = x + Math.cos(a) * rr * d;
        const by = 804 + Math.sin(a) * rr * 0.6 * d;
        if (by < 760) continue;
        const db = blossomD(bx, by, r.range(6, 10), `${seed}/b${x}/${i}`, 4);
        if (Math.cos(a) < 0.2) bl += db;
        else bs += db;
      }
    }
    B.fill(GT.blossomShade, bs);
    B.fill(GT.blossom, bl);
    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={2} />;
};
export const GateLawnTrees = tiered('environment', {}, GateLawnTreesBody);

// ---------------------------------------------------------------- MID: footpath, fence, the tall corner post, tulips

const GateFenceBody: React.FC<{seed?: string}> = ({seed = 'fence'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const r = rng(seed);
    const {top, base} = GATE.fence;
    const x0 = -300;
    const x1 = 1500;
    // the lawn behind the fence down to the footpath (eye level: it recedes to the facade's foot)
    B.rect(GT.lawn, x0, 880, x1 - x0, base - 880 + 6);
    for (let y = 900; y < base; y += 46) B.rect(GT.lawnLit, x0, y, x1 - x0, 10);
    // a gravel walk across the lawn (receding to the facade) and two oval tulip beds: the lawn is a place, never a slab
    B.poly(GT.pavingLit, [[560, 870], [600, 870], [980, base - 90], [880, base - 90]]);
    for (const [cx, cy, rx] of [[300, 940, 120], [1000, 930, 110], [-120, 960, 130]] as [number, number, number][]) {
      B.fill(GT.soil, ellD(cx, cy, rx, 14));
      let hd = '';
      for (let k = -rx + 10; k < rx - 8; k += 9) hd += ellD(cx + k, cy - 6 + Math.abs(k) * 0.03, 3.6, 4.6);
      B.fill(GT.tulip[Math.abs(cx) % 3], hd);
    }
    // the footpath under the board (paving, its joints converging on the eye's vanishing point)
    B.layer();
    B.rect(GT.paving, x0, base, x1 - x0, GATE.kerbY + 30 - base);
    B.layer();
    // a low hedge behind the fence (the lawn's edge), then the fence: two rails and slim pickets with round finials,
    // painted the warm line colour (a park fence), stone piers every ~6 bays
    let hedge = '';
    for (let x = x0; x < x1; x += 46) hedge += crownD(x, base - 92, 40, 30, `${seed}/h${x}`, 6, 0.4);
    B.fill(GT.hedge, hedge);
    B.rect(GT.hedge, x0, base - 96, x1 - x0, 92);
    B.layer();
    B.rect(GT.rail, x0, top + 18, x1 - x0, 6);
    B.rect(GT.rail, x0, base - 34, x1 - x0, 6);
    let pk = '';
    let fin = '';
    for (let x = x0; x < x1; x += 34) {
      if (Math.abs(x - GATE.post.x) < GATE.post.w * 0.7) continue;
      pk += `M${x - 2.5} ${base}V${top + 8}h5V${base}Z`;
      fin += circleD(x, top + 4, 5);
    }
    B.fill(GT.rail, pk);
    B.fill(GT.rail, fin);
    for (let x = x0 + 40; x < x1; x += 34 * 6) {
      if (Math.abs(x - GATE.post.x) < 120) continue;
      B.rect(GT.stone, x - 10, top - 6, 20, base - top + 6);
      B.rect(GT.stoneShade, x + 4, top - 6, 6, base - top + 6);
      B.rect(GT.stoneLit, x - 13, top - 10, 26, 6);
    }
    // the tall corner post: a limestone pier with a cap (Pip's seat on top), lit left (the sun is east = left)
    const P = GATE.post;
    B.layer();
    B.rect(GT.stone, P.x - P.w / 2, P.cap + 14, P.w, base - P.cap - 14 + 4);
    B.rect(GT.stoneLit, P.x - P.w / 2, P.cap + 14, P.w * 0.35, base - P.cap - 14 + 4);
    B.rect(GT.stoneShade, P.x + P.w * 0.22, P.cap + 14, P.w * 0.28, base - P.cap - 14 + 4);
    B.rect(GT.stoneLit, P.x - P.w / 2 - 7, P.cap, P.w + 14, 9);
    B.rect(GT.stoneShade, P.x - P.w / 2 - 5, P.cap + 9, P.w + 10, 7);
    B.rect(GT.stoneShade, P.x - P.w / 2 - 6, base - 18, P.w + 12, 22);
    B.ink(lineD([[P.x - P.w / 2, base], [P.x - P.w / 2, P.cap + 16]]), 3.4, GT.ink);
    B.ink(lineD([[P.x + P.w / 2, base], [P.x + P.w / 2, P.cap + 16]]), 3.4, GT.ink);
    B.ink(lineD([[P.x - P.w / 2 - 7, P.cap], [P.x + P.w / 2 + 7, P.cap]]), 3.4, GT.ink);
    // the tulip beds along the fence's foot (soil kerb, leaves, heads in rows)
    B.layer();
    B.rect(GT.kerb, x0, base - 6, x1 - x0, 8);
    B.rect(GT.soil, x0, base + 2, x1 - x0, 14);
    let leaves = '';
    const heads = new Map<string, string>();
    for (let x = x0 + 4; x < x1; x += 11) {
      if (Math.abs(x - P.x) < P.w * 0.7) continue;
      const hgt = r.range(26, 40);
      leaves += `M${x - 3} ${base + 8}L${x} ${base + 8 - hgt * 0.7}L${x + 3} ${base + 8}Z`;
      const col = GT.tulip[Math.floor(frac(Math.sin(x * 0.07) * 43758.5) * GT.tulip.length)];
      heads.set(col, (heads.get(col) ?? '') + ellD(x, base + 8 - hgt, 4.2, 5.6));
    }
    B.fill(GT.leaf, leaves);
    heads.forEach((d, col) => B.fill(col, d));
    // the footpath's back kerb (the board's legs stand here) and a few joints
    B.layer();
    B.rect(GT.kerb, x0, GATE.kerbY - 4, x1 - x0, 7);
    for (let x = x0; x < x1; x += r.range(80, 160)) B.ink(lineD([[x, base + 18], [x - 6, GATE.kerbY - 4]]), 1.6, GT.joint);
    B.ink(lineD([[x0, base + 1], [x1, base + 1]]), 2.2, GT.ink, 0.15);
    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={3} />;
};
export const GateFence = tiered('environment', {}, GateFenceBody);

// ---------------------------------------------------------------- NEAR: kerb, bollards, chain, shrub, rack, bench

const GateNearBody: React.FC<{seed?: string}> = ({seed = 'near'}) => {
  const t = useTime();
  const b = useMemo(() => {
    const B = new Batch();
    const r = rng(seed);
    const x0 = -500;
    const x1 = 1600;
    // the near footpath (big slabs, broken joints converging on the eye's VP (540, horizon))
    B.rect(GT.paving, x0, GATE.kerbY + 3, x1 - x0, 1920 - GATE.kerbY);
    B.layer();
    const vp: Pt = [540, GATE.horizon];
    for (let y = GATE.kerbY + 40; y < 1960; y += 40 + (y - GATE.kerbY) * 0.55) {
      for (let x = x0 + r.range(0, 60); x < x1; x += r.range(180, 360)) B.ink(lineD([[x, y], [x + r.range(90, 220), y + r.range(-2, 2)]]), Math.min(3.4, 1.6 + (y - 1250) / 300), GT.joint);
    }
    for (let k = -12; k <= 12; k++) {
      if (r.chance(0.25)) continue;
      const xb = 540 + k * 170;
      const a: Pt = [vp[0] + (xb - vp[0]) * ((GATE.kerbY + 6 - vp[1]) / (1920 - vp[1])), GATE.kerbY + 6];
      B.ink(lineD([a, [xb, 1920]]), 2.2, GT.joint, 0.4);
    }
    // stone bollards along the near edge with a low chain between (every 330 px)
    B.layer();
    let chain = '';
    for (let x = x0 + 40; x < x1; x += 330) {
      B.rect(GT.stone, x - 20, 1408, 40, 96);
      B.rect(GT.stoneLit, x - 20, 1408, 13, 96);
      B.fill(GT.stoneLit, ellD(x, 1408, 22, 7));
      B.ink(lineD([[x - 20, 1504], [x - 20, 1410], [x + 20, 1410], [x + 20, 1504]]), 4.8, GT.ink);
      chain += `M${x + 20} 1430Q${x + 165} 1470 ${x + 310} 1430`;
    }
    B.ink(chain, 3.4, GT.iron, 0, {thing: true});
    // a flowering shrub cut by the left edge (blossom over sage), and a planter of tulips by it
    B.layer();
    // (low: its top stays under the board's base y 1240 while the near plane overtakes the board)
    B.fill(GT.crownShade, crownD(-60, 1372, 200, 112, `${seed}/sh0`, 10, 0.3));
    B.fill(GT.crown, crownD(-90, 1352, 150, 86, `${seed}/sh1`, 10, 0.3));
    let bl = '';
    for (let i = 0; i < 40; i++) bl += blossomD(r.range(-220, 120), r.range(1290, 1440), r.range(9, 15), `${seed}/sb${i}`, 4);
    B.fill(GT.blossom, bl);
    // the right rail: a bike rack with a parked bike, a bench (masses only)
    B.layer();
    benchBack(B, 860, 1110, 1310, 1420, 4.8);
    let rack = '';
    for (let x = 790; x < 1000; x += 52) rack += `M${x} 1560V1500Q${x} 1478 ${x + 22} 1478Q${x + 44} 1478 ${x + 44} 1500V1560`;
    B.ink(rack, 4.8, GT.iron, 0, {thing: true});
    B.fill(GT.ink, circleD(860, 1530, 4));
    B.ink(`M820 1540a34 34 0 1 0 68 0a34 34 0 1 0 -68 0M900 1540a34 34 0 1 0 68 0a34 34 0 1 0 -68 0M854 1540L900 1500L934 1540M900 1500L892 1478M880 1478h26`, 3.4, GT.ink, 0, {thing: true});
    return B;
  }, [seed]);
  // petals drifting on the near paving (a slow skitter in the morning air)
  let pd = '';
  for (let i = 0; i < 26; i++) {
    const x = rand(seed, `px${i}`) * 1300 - 100 + Math.sin(t * 0.8 + i) * 6;
    const y = 1300 + rand(seed, `py${i}`) * 600;
    pd += ellD(x, y, 5, 3);
  }
  return (
    <>
      <Paint b={b} seed={seed} misreg={3} />
      <path d={pd} fill={GT.blossom} />
    </>
  );
};
export const GateNear = tiered('environment', {}, GateNearBody);

/** S6's set on its truck: sky pieces + sun (fixed: SUN2), far facade, lawn trees, mid fence (with the board slot),
 *  near plane. Slots: `board` (K3 deal board, mid plane), `pip` (mid plane, on the post cap), `mid`, `lawn` (a jogger on
 *  the lawn path beyond the fence: small),
 *  `near` (K4's readers' head-backs), `doorPeople` (K4 staff at the door, far plane). */
const GateSetBody: React.FC<{board?: React.ReactNode; pip?: React.ReactNode; mid?: React.ReactNode; lawn?: React.ReactNode; near?: React.ReactNode; doorPeople?: React.ReactNode; sky?: boolean; bars?: React.ReactNode}> = ({board, pip, mid, lawn: lawnSlot, near, doorPeople, sky = false, bars}) => {
  const t = useTime();
  const far = gateDx(GATE_DRIFT.far, t);
  const lawn = gateDx(GATE_DRIFT.lawn, t);
  const md = gateDx(GATE_DRIFT.mid, t);
  const nr = gateDx(GATE_DRIFT.near, t);
  return (
    <>
      {sky ? <rect x={-50} y={-50} width={1180} height={2020} fill={CM.sky} /> : null}
      <Slot>{bars}</Slot>
      <circle cx={GATE.sun.x} cy={GATE.sun.y} r={GATE.sun.r} fill={CM.sun} />
      <g transform={`translate(${far.toFixed(2)} 0)`}>
        <GateFacade doorPeople={doorPeople} />
      </g>
      <g transform={`translate(${lawn.toFixed(2)} 0)`}>
        <GateLawnTrees />
        <Slot>{lawnSlot}</Slot>
      </g>
      <g transform={`translate(${md.toFixed(2)} 0)`}>
        <GateFence />
        <Slot>{mid}</Slot>
        <Slot>{board}</Slot>
        <Slot>{pip}</Slot>
      </g>
      <g transform={`translate(${nr.toFixed(2)} 0)`}>
        <GateNear />
        <Slot>{near}</Slot>
      </g>
    </>
  );
};
export const GateSet = tiered('environment', {}, GateSetBody);
