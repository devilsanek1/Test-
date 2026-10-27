// dc/pentagon.tsx: THE PENTAGON, true to the real building (lens.ts: five rings, four light wells, ten corridors,
// the courtyard, five storeys of windows), on the mid plane of the S5 end frame (plane step 22 %, hairline ink).
//
// Calm in daylight (TREATMENT V3): no flag, seal, helipad, vehicle, guard, glow or rim; 3/4 backlight from the morning
// sun beyond it (roofs lit, the camera-facing long facade in shade, the right facade grazing-lit, its shadow falling
// toward us on the lawn). 23.08 (`warmAt`): windows warm on one by one along the lit wing (no screens, no use shown).
//
//   <Pentagon warmAt={2.53} />          // scene seconds; authored in END-frame coordinates (put it in the MID plane)

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {Batch, Paint, atm, atmShade, mix, inkCol, lineD, polyD, quadD, crownD, circleD, rng, type Pt} from './core';
import {MID, PENT, PENT_ROT, circ, facesLens, halfSide, pentagon, sideFrame, sidePt, shadowOffset, wallLight, vert} from './lens';

// ---------------------------------------------------------------- tones (plane 2: 22 % toward the sky)

export const PT = {
  facadeLit: atm(CM.limestone, 2),
  facadeShade: atmShade(mix(CM.stoneShade, CM.limestone, 0.25), 2),
  facadeShadeDeep: atmShade(CM.stoneShade, 2),
  cornice: atm(CM.paper, 2),
  roofLit: atm(mix(CM.limestone, CM.stoneShade, 0.3), 2),
  roofShade: atmShade(mix(CM.stoneShade, CM.limestone, 0.2), 2),
  well: atmShade(mix(CM.shadeCool, CM.stoneShade, 0.25), 2),
  wellDeep: atmShade(CM.shadeCool, 2),
  paneShade: atmShade(mix(CM.paneUnlit, CM.stoneShade, 0.35), 2),
  paneLit: atm(mix(CM.paneUnlit, CM.limestone, 0.45), 2),
  paneWarm: atm(CM.lamp, 2),
  courtLawn: atmShade(mix(CM.sage, CM.shadeCool, 0.18), 2),
  courtLawnLit: atm(CM.sage, 2),
  courtPath: atm(CM.paving, 2),
  courtTree: atmShade(mix(CM.sage, CM.shadeWarm, 0.3), 2),
  courtBlossom: atm(CM.blossom, 2),
  pavilion: atm(CM.paper, 2),
  pavilionRoof: atm(CM.brick, 2),
  shadow: atm(mix(CM.sage, CM.anchor, 0.2), 2),
  ink: inkCol(2),
};

const H = PENT.height;
const P3 = (q: Pt, z: number) => MID.p([q[0], q[1], z]);

/** Ground pentagon offset by a vector (the building's shadow footprint). */
const shifted = (pts: Pt[], d: Pt): Pt[] => pts.map(([x, y]) => [x + d[0], y + d[1]]);

/** Convex hull (monotone chain) of screen points. */
function hull(pts: Pt[]): Pt[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** A pentagonal annulus at height z between apothems aOut > aIn (evenodd path). */
const annulus = (aOut: number, aIn: number, z: number) => polyD(pentagon(aOut).map((q) => P3(q, z))) + polyD(pentagon(aIn).map((q) => P3(q, z)).reverse());

/** The windows of one outer facade side i: [row][col] screen quads. */
type Win = {q: [Pt, Pt, Pt, Pt]; side: number; row: number; col: number};
function facadeWindows(i: number): Win[] {
  const out: Win[] = [];
  const a = PENT.apothem;
  const hs = halfSide(a);
  const n = Math.floor((hs * 2 - 6) / PENT.windowPitch);
  const {n: nn} = sideFrame(i);
  const wOut = 0.06; // a hair proud of the wall (no z-fight with the wall fill)
  for (let row = 0; row < PENT.windowRows.length; row++) {
    const [z0, z1] = PENT.windowRows[row];
    for (let c = 0; c < n; c++) {
      const s0 = -hs + 3 + c * PENT.windowPitch + 0.7;
      const s1 = s0 + 1.5;
      const A = sidePt(i, a + wOut, s0);
      const B = sidePt(i, a + wOut, s1);
      out.push({q: [P3(A, z1), P3(B, z1), P3(B, z0), P3(A, z0)], side: i, row, col: c});
    }
  }
  void nn;
  return out;
}

/** Which outer sides face the lens, and how lit each is. */
export const PENT_SIDES = [0, 1, 2, 3, 4].map((i) => {
  const {n} = sideFrame(i);
  const m = sidePt(i, PENT.apothem, 0);
  return {i, front: facesLens(MID.cam, n, m), light: wallLight(n)};
});

/** The lit visible facade (the windows that warm on 23.08). */
const WARM_SIDE = PENT_SIDES.filter((s) => s.front).sort((a, b) => b.light - a.light)[0]?.i ?? 0;

export type PentagonProps = {
  /** Windows warm on one by one along the lit wing from this scene time (s). */
  warmAt?: number;
  /** Seconds over which the warm run travels the wing. */
  warmDur?: number;
  seed?: string;
};

export const Pentagon: React.FC<PentagonProps> = ({warmAt, warmDur = 0.7, seed = 'pent'}) => {
  const t = useTime();
  const parts = useMemo(() => {
    const outer = pentagon(PENT.apothem);
    const b = new Batch();

    // ---- 1. the shadow on the lawn (toward the lens and left), under everything
    const sh = shadowOffset(H);
    b.poly(PT.shadow, hull([...outer, ...shifted(outer, sh)].map((q) => P3(q, 0))));

    // ---- 2. the courtyard: floor (its far part in the far ring's shadow), paths, trees, the small pavilion
    b.layer();
    const court = pentagon(PENT.courtApothem);
    b.poly(PT.courtLawn, court.map((q) => P3(q, 0)));
    // the lit part: the courtyard's near half (hidden by the near rings anyway; keeps the far edge honest)
    const lit = court.map(([x, y]) => [x * 0.98, y * 0.98 - 18] as Pt);
    b.poly(PT.courtLawnLit, lit.map((q) => P3(q, 0)));
    // paths from the pavilion to the five sides (the courtyard's real walks)
    for (let i = 0; i < 5; i++) {
      const m = sidePt(i, PENT.courtApothem - 2, 0);
      const {t: tt} = sideFrame(i);
      const w = 2.2;
      const a0: Pt = [tt[0] * w, tt[1] * w];
      b.poly(PT.courtPath, [P3([a0[0], a0[1]], 0), P3([-a0[0], -a0[1]], 0), P3([m[0] - a0[0], m[1] - a0[1]], 0), P3([m[0] + a0[0], m[1] + a0[1]], 0)]);
    }
    // trees round the courtyard (a ring of crowns), blossom on some
    const rr = rng(`${seed}/ctrees`);
    b.layer();
    for (let k = 0; k < 26; k++) {
      const ang = (k / 26) * Math.PI * 2 + rr.jitter(0.05);
      const rad = rr.range(42, 62);
      const q: Pt = [Math.cos(ang) * rad, Math.sin(ang) * rad];
      const c = P3(q, 6);
      const s = MID.pxPerM(q[0], q[1], 6);
      const cr = rr.range(3.2, 4.6) * s;
      b.fill(rr.chance(0.35) ? PT.courtBlossom : PT.courtTree, crownD(c[0], c[1], cr, cr * 0.62, `${seed}/ct${k}`, 6, 0.4));
    }
    // the pavilion at the centre (a small pentagonal roof on a pale drum)
    const pv = pentagon(9);
    b.poly(PT.pavilion, pv.map((q) => P3(q, 0)).concat(pv.slice().reverse().map((q) => P3(q, 4))));
    b.poly(PT.pavilionRoof, pv.map((q) => P3(q, 4.5)));
    b.fill(PT.pavilionRoof, circleD(...P3([0, 0], 6.4), MID.pxPerM(0, 0, 6) * 1.6));

    // ---- 3. the courtyard's walls that face the lens (the far ones, seen across the courtyard)
    b.layer();
    for (let i = 0; i < 5; i++) {
      const {n} = sideFrame(i);
      const inward: Pt = [-n[0], -n[1]];
      const m = sidePt(i, PENT.courtApothem, 0);
      if (!facesLens(MID.cam, inward, m)) continue;
      const A = vert(PENT.courtApothem, i);
      const B = vert(PENT.courtApothem, (i + 1) % 5);
      b.poly(PT.facadeShadeDeep, [P3(A, 0), P3(B, 0), P3(B, H), P3(A, H)]);
      // its windows (courtyard facade): small, few rows show
      const hs = halfSide(PENT.courtApothem);
      for (const [z0, z1] of PENT.windowRows) {
        for (let s = -hs + 2; s < hs - 2; s += PENT.windowPitch) {
          const a2 = sidePt(i, PENT.courtApothem - 0.06, s);
          const b2 = sidePt(i, PENT.courtApothem - 0.06, s + 1.4);
          b.poly(PT.paneShade, [P3(a2, z1), P3(b2, z1), P3(b2, z0), P3(a2, z0)]);
        }
      }
    }

    // ---- 4. the roof: the outer pentagon at the roofline minus the courtyard (evenodd), lit
    b.layer();
    b.fill(PT.roofLit, annulus(PENT.apothem, PENT.courtApothem, H));
    // ---- 5. the four light wells (deep, narrow, in shade) ...
    b.layer();
    for (let k = 0; k < PENT.rings.length - 1; k++) {
      const aO = PENT.rings[k][1];
      const aI = PENT.rings[k + 1][0];
      b.fill(PT.well, annulus(aO, aI, H));
    }
    // ... broken by the ten corridors (roof bridges, perpendicular to each side)
    b.layer();
    for (let i = 0; i < 5; i++) {
      for (const s of PENT.corridors) {
        const w = PENT.corridorW / 2;
        const aO = PENT.rings[0][1] + 0.5;
        const aI = PENT.rings[PENT.rings.length - 1][0] - 0.5;
        b.poly(PT.roofLit, [P3(sidePt(i, aO, s - w), H), P3(sidePt(i, aO, s + w), H), P3(sidePt(i, aI, s + w), H), P3(sidePt(i, aI, s - w), H)]);
      }
    }

    // ---- 6. the outer facades that face the lens: shade (the long left one) / grazing-lit (the right one)
    b.layer();
    const winBatch: {lit: string[]; shade: string[]} = {lit: [], shade: []};
    for (const sd of PENT_SIDES) {
      if (!sd.front) continue;
      const A = vert(PENT.apothem, sd.i);
      const B = vert(PENT.apothem, (sd.i + 1) % 5);
      const lit = sd.light > -0.05;
      b.poly(lit ? PT.facadeLit : PT.facadeShade, [P3(A, 0), P3(B, 0), P3(B, H), P3(A, H)]);
      // cornice band and plinth (flat steps)
      b.poly(PT.cornice, [P3(A, H - 1.1), P3(B, H - 1.1), P3(B, H), P3(A, H)]);
      b.poly(lit ? PT.facadeShade : PT.facadeShadeDeep, [P3(A, 0), P3(B, 0), P3(B, 0.9), P3(A, 0.9)]);
      for (const w of facadeWindows(sd.i)) (lit ? winBatch.lit : winBatch.shade).push(polyD(w.q));
    }
    b.layer();
    b.fill(PT.paneShade, winBatch.shade.join(''));
    b.fill(PT.paneLit, winBatch.lit.join(''));

    // ---- 7. hairline ink: the roof outline, the visible corners, the courtyard opening, the facade bases
    b.layer();
    const roofOut = outer.map((q) => P3(q, H));
    b.ink(lineD([...roofOut, roofOut[0]]), 1.6, PT.ink, 0.18);
    b.ink(lineD([...pentagon(PENT.courtApothem).map((q) => P3(q, H)), P3(vert(PENT.courtApothem, 0), H)]), 1.3, PT.ink, 0.25);
    for (const sd of PENT_SIDES) {
      if (!sd.front) continue;
      const A = vert(PENT.apothem, sd.i);
      const B = vert(PENT.apothem, (sd.i + 1) % 5);
      b.ink(lineD([P3(A, 0), P3(B, 0)]), 1.6, PT.ink, 0.15);
      b.ink(lineD([P3(A, 0), P3(A, H)]), 1.6, PT.ink);
      b.ink(lineD([P3(B, 0), P3(B, H)]), 1.6, PT.ink);
    }
    return b;
  }, [seed]);

  // the warm run along the lit wing (23.08): windows switch on one by one, a column at a time, from the corner out
  const warm = useMemo(() => facadeWindows(WARM_SIDE), []);
  const warmD = useMemo(() => {
    if (warmAt === undefined) return null;
    return (tt: number) => {
      const k = (tt - warmAt) / warmDur;
      if (k <= 0) return '';
      const r = rng(`${seed}/warm`);
      let d = '';
      const cols = Math.max(...warm.map((w) => w.col)) + 1;
      const order = r.shuffle(Array.from({length: cols}, (_, i) => i));
      for (const w of warm) {
        const rank = order.indexOf(w.col) / cols;
        // ~45 % of the windows of that wing come on (people at work), never all of them
        if (rand01(`${seed}/w${w.col}/${w.row}`) > 0.45) continue;
        if (rank < k) d += polyD(w.q);
      }
      return d;
    };
  }, [warmAt, warmDur, warm, seed]);
  const wd = warmD ? warmD(t) : '';
  return (
    <>
      <Paint b={parts} seed={`${seed}/p`} misreg={false} />
      {wd ? <path d={wd} fill={PT.paneWarm} /> : null}
    </>
  );
};

const rand01 = (k: string) => rng(k).next();

/** The screen outline of the Pentagon's roofline (for masks / checks). */
export const pentagonRoofline = (): Pt[] => pentagon(PENT.apothem).map((q) => P3(q, H));
/** The near facade's screen base line (the ground corner nearest the lens). */
export const pentagonNearCorner = (): Pt => {
  const g = pentagon(PENT.apothem).map((q) => P3(q, 0));
  return g.reduce((a, c) => (c[1] > a[1] ? c : a));
};
void circ;
void quadD;
void PENT_ROT;
