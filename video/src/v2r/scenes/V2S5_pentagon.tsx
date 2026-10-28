// V2S5_pentagon.tsx (lane L4): THE PENTAGON for S5, FORKED from the Arlington kit (kit/dc/pentagon.tsx, 2026-10-27) so
// it takes S5's ONE atmosphere (conform_L4 §10): its tones recede toward the April gold at HALF the mid plane's step
// (the subject from 22.43, CRAFT §f), instead of the kit's sRGB mix toward the mint. The body is the kit's.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, mix, inkCol, lineD, polyD, quadD, crownD, circleD, rng, type Pt} from '../kit/dc/core';
import {rcAtm, rcShade} from './V2S5_depth';
import {toneOnTone} from '../../lib/depth';
import {MID, PENT, PENT_ROT, circ, facesLens, halfSide, pentagon, sideFrame, sidePt, shadowOffset, wallLight, vert} from '../kit/dc/lens';
import {tiered} from '../kit/tiers';
import {Shadow, ShadowLayer, fromLch, lch, multiply, tintFor, useRig, type LightRig} from '../../lib/light';
import {MT5} from './V2S5_valley';

/** The kit's atm / atmShade through S5's air at HALF the step (the Pentagon is the shot's subject from 22.43: CRAFT §f
 *  "the subject takes at most half its plane's step"; one value all through, no colour pop on its word). */
const atm = (c: string, d: number) => rcAtm(c, d, 'subject');
const atmShade = (c: string, d: number) => rcShade(c, d, 'subject');

// ---------------------------------------------------------------- tones (plane 2: 22 % toward the sky)

const FACADE_LIT = atm(CM.limestone, 2);
/** The front facades turned from the sun (3/4 backlight): ONE step under the lawn's cast shadow in front of them (L* 60
 *  on the cast's ~69: a shaded edge on a lighter field, CRAFT §f.3 counterchange), their foot a step deeper (L* 55). */
const FACADE_SHADE = atmShade(mix(CM.stoneShade, CM.shadeCool, 0.85), 2);
const FACADE_FOOT = atmShade(mix(CM.shadeCool, CM.anchor, 0.1), 2);
/** The facades' former mid shade (L* 72): the lit facade's plinth and the tone its A outline is drawn from (the clean
 *  pen's subject drop: L* ~37, its own deep shade, never near-black). */
const FACADE_MID = atmShade(mix(CM.stoneShade, CM.shadeCool, 0.22), 2);
const FACADE_SHADE_DEEP = atmShade(CM.stoneShade, 2);

export const PT5 = {
  facadeLit: FACADE_LIT,
  facadeShade: FACADE_SHADE,
  facadeFoot: FACADE_FOOT,
  facadeMid: FACADE_MID,
  facadeShadeDeep: FACADE_SHADE_DEEP,
  cornice: atm(CM.paper, 2),
  // the roof: grey (the real building's limestone walls under a darker grey roof), one value under the hazy
  // parkland behind it, so its far edges hold a fill step (check_depth "melts": a cream roof was 4-5 off it)
  roofLit: atm(mix(CM.stoneShade, CM.shadeCool, 0.45), 2),
  roofShade: atmShade(mix(CM.stoneShade, CM.shadeCool, 0.62), 2),
  // the four light wells TONE-ON-TONE with the roof (L* 61 on its 70: the critic's single scale change, 2026-10-28): the
  // rings read as a huge complex's roof grain far away, never as dark grooves on a model past the railing
  well: atmShade(mix(CM.stoneShade, CM.shadeCool, 0.8), 2),
  // its windows TONE-ON-TONE (CRAFT §f.2: windows dE <= 6 from their wall from +2, never a dark speck; §c: no specks):
  // the rows still read as the facade's grain, without ~700 dark specks (QA 2026-10-28: 74 % of the end frame's
  // strokes, line measure 457 strokes / Mpx at 23.4); the warm run (paneWarm, 23.08) is the one window beat
  paneShade: toneOnTone(FACADE_SHADE, {dE: 6}),
  paneCourt: toneOnTone(FACADE_SHADE_DEEP, {dE: 6}),
  paneLit: toneOnTone(FACADE_LIT, {dE: 6}),
  paneWarm: atm(CM.lamp, 2),
  courtLawn: atmShade(mix(CM.sage, CM.shadeCool, 0.18), 2),
  courtLawnLit: atm(CM.sage, 2),
  courtPath: atm(CM.paving, 2),
  courtTree: atmShade(mix(CM.sage, CM.shadeWarm, 0.3), 2),
  courtBlossom: atm(CM.blossom, 2),
  pavilion: atm(CM.paper, 2),
  pavilionRoof: atm(CM.brick, 2),
  ink: inkCol(2),
};

/** The building's cast on its lawn (left and toward us) is a LIGHT-LAYER shadow, never a hand-picked fill (CRAFT §d.3):
 *  the lawn x the rig's family at the rig's CAST strength (its cast tint on the lawn: L* 79.5 -> ~68), with §d.3's turn
 *  for a cool surface (10-16 deg toward violet, chroma kept). The rose family alone would turn the sage lawn olive (h 107,
 *  C* 12: lib/depth's olive band 88-118), as it greys teal water (world/rigs' `water` key, the same remedy: the
 *  surface's own deeper step as a multiply tint, `tintFor`). Result on the lawn: L* ~69, C* ~15, h ~135. */
const CAST_CACHE = new Map<string, string>();
export function lawnCastTint(rig: LightRig): string {
  const key = rig.tints.cast;
  let v = CAST_CACHE.get(key);
  if (!v) {
    const lawn = lch(MT5.lawn);
    const L = lch(multiply(MT5.lawn, rig.tints.cast)).L + 1.5;
    v = tintFor(MT5.lawn, fromLch(L, lawn.C * 0.95, lawn.h + 12));
    CAST_CACHE.set(key, v);
  }
  return v;
}

/** The cast's screen path (the footprint swept along the end light: the kit lens' 3D shadow offset). */
const castD = (): string => {
  const outer = pentagon(PENT.apothem);
  return polyD(hull([...outer, ...shifted(outer, shadowOffset(H))].map((q) => P3(q, 0))));
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
export const PENT_SIDES5 = [0, 1, 2, 3, 4].map((i) => {
  const {n} = sideFrame(i);
  const m = sidePt(i, PENT.apothem, 0);
  return {i, front: facesLens(MID.cam, n, m), light: wallLight(n)};
});

/** The lit visible facade (the windows that warm on 23.08). */
const WARM_SIDE = PENT_SIDES5.filter((s) => s.front).sort((a, b) => b.light - a.light)[0]?.i ?? 0;

export type Pentagon5Props = {
  /** Windows warm on one by one along the lit wing from this scene time (s). */
  warmAt?: number;
  /** Seconds over which the warm run travels the wing. */
  warmDur?: number;
  seed?: string;
};

const PentagonBody: React.FC<Pentagon5Props> = ({warmAt, warmDur = 0.7, seed = 'pent'}) => {
  const t = useTime();
  const parts = useMemo(() => {
    const outer = pentagon(PENT.apothem);
    const b = new Batch();

    // ---- 1. the shadow on the lawn (toward the lens and left): the light layer below (PentagonBody's ShadowLayer)

    // ---- 2. the courtyard: floor (its far part in the far ring's shadow), paths, trees, the small pavilion
    b.layer();
    const court = pentagon(PENT.courtApothem);
    b.poly(PT5.courtLawn, court.map((q) => P3(q, 0)));
    // the lit part: the courtyard's near half (hidden by the near rings anyway; keeps the far edge honest)
    const lit = court.map(([x, y]) => [x * 0.98, y * 0.98 - 18] as Pt);
    b.poly(PT5.courtLawnLit, lit.map((q) => P3(q, 0)));
    // paths from the pavilion to the five sides (the courtyard's real walks)
    for (let i = 0; i < 5; i++) {
      const m = sidePt(i, PENT.courtApothem - 2, 0);
      const {t: tt} = sideFrame(i);
      const w = 2.2;
      const a0: Pt = [tt[0] * w, tt[1] * w];
      b.poly(PT5.courtPath, [P3([a0[0], a0[1]], 0), P3([-a0[0], -a0[1]], 0), P3([m[0] - a0[0], m[1] - a0[1]], 0), P3([m[0] + a0[0], m[1] + a0[1]], 0)]);
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
      b.fill(rr.chance(0.35) ? PT5.courtBlossom : PT5.courtTree, crownD(c[0], c[1], cr, cr * 0.62, `${seed}/ct${k}`, 6, 0.4));
    }
    // the pavilion at the centre (a small pentagonal roof on a pale drum)
    const pv = pentagon(9);
    b.poly(PT5.pavilion, pv.map((q) => P3(q, 0)).concat(pv.slice().reverse().map((q) => P3(q, 4))));
    b.poly(PT5.pavilionRoof, pv.map((q) => P3(q, 4.5)));
    b.fill(PT5.pavilionRoof, circleD(...P3([0, 0], 6.4), MID.pxPerM(0, 0, 6) * 1.6));

    // ---- 3. the courtyard's walls that face the lens (the far ones, seen across the courtyard)
    b.layer();
    for (let i = 0; i < 5; i++) {
      const {n} = sideFrame(i);
      const inward: Pt = [-n[0], -n[1]];
      const m = sidePt(i, PENT.courtApothem, 0);
      if (!facesLens(MID.cam, inward, m)) continue;
      const A = vert(PENT.courtApothem, i);
      const B = vert(PENT.courtApothem, (i + 1) % 5);
      b.poly(PT5.facadeShadeDeep, [P3(A, 0), P3(B, 0), P3(B, H), P3(A, H)]);
      // its windows (courtyard facade): small, few rows show
      const hs = halfSide(PENT.courtApothem);
      for (const [z0, z1] of PENT.windowRows) {
        for (let s = -hs + 2; s < hs - 2; s += PENT.windowPitch) {
          const a2 = sidePt(i, PENT.courtApothem - 0.06, s);
          const b2 = sidePt(i, PENT.courtApothem - 0.06, s + 1.4);
          b.poly(PT5.paneCourt, [P3(a2, z1), P3(b2, z1), P3(b2, z0), P3(a2, z0)]);
        }
      }
    }

    // ---- 4. the roof: the outer pentagon at the roofline minus the courtyard (evenodd), lit
    b.layer();
    b.fill(PT5.roofLit, annulus(PENT.apothem, PENT.courtApothem, H));
    // ---- 5. the four light wells (deep, narrow, in shade) ...
    b.layer();
    for (let k = 0; k < PENT.rings.length - 1; k++) {
      const aO = PENT.rings[k][1];
      const aI = PENT.rings[k + 1][0];
      b.fill(PT5.well, annulus(aO, aI, H));
    }
    // ... broken by the ten corridors (roof bridges, perpendicular to each side)
    b.layer();
    for (let i = 0; i < 5; i++) {
      for (const s of PENT.corridors) {
        const w = PENT.corridorW / 2;
        const aO = PENT.rings[0][1] + 0.5;
        const aI = PENT.rings[PENT.rings.length - 1][0] - 0.5;
        b.poly(PT5.roofLit, [P3(sidePt(i, aO, s - w), H), P3(sidePt(i, aO, s + w), H), P3(sidePt(i, aI, s + w), H), P3(sidePt(i, aI, s - w), H)]);
      }
    }

    // ---- 6. the outer facades that face the lens: shade (the long left one) / grazing-lit (the right one)
    b.layer();
    const winBatch: {lit: string[]; shade: string[]} = {lit: [], shade: []};
    for (const sd of PENT_SIDES5) {
      if (!sd.front) continue;
      const A = vert(PENT.apothem, sd.i);
      const B = vert(PENT.apothem, (sd.i + 1) % 5);
      const lit = sd.light > -0.05;
      b.poly(lit ? PT5.facadeLit : PT5.facadeShade, [P3(A, 0), P3(B, 0), P3(B, H), P3(A, H)]);
      // cornice band and plinth (flat steps): the shaded facade's foot a step deeper (its base edge on the lighter cast)
      b.poly(PT5.cornice, [P3(A, H - 1.1), P3(B, H - 1.1), P3(B, H), P3(A, H)]);
      b.poly(lit ? PT5.facadeMid : PT5.facadeFoot, [P3(A, 0), P3(B, 0), P3(B, 0.9), P3(A, 0.9)]);
      for (const w of facadeWindows(sd.i)) (lit ? winBatch.lit : winBatch.shade).push(polyD(w.q));
    }
    b.layer();
    b.fill(PT5.paneShade, winBatch.shade.join(''));
    b.fill(PT5.paneLit, winBatch.lit.join(''));

    // ---- 7. ONE closed outline (CRAFT §b tier A, conform_L4 §5/§8): the building's silhouette (the roof's pentagon and
    // the front facades' bases, hulled) at INK_PX.mid, in ITS OWN SHADE (CM.ink bounding the facade's shade: the clean
    // pen draws it one step darker than that shade, never near-black). Tier C (before "Pentagon", 22.43) draws no
    // contour, so it pops on its word; no inner lines (the courtyard and the corners read by their values).
    b.layer();
    const roofOut = outer.map((q) => P3(q, H));
    const bases: Pt[] = [];
    for (const sd of PENT_SIDES5) {
      if (!sd.front) continue;
      bases.push(P3(vert(PENT.apothem, sd.i), 0), P3(vert(PENT.apothem, (sd.i + 1) % 5), 0));
    }
    const sil = hull([...roofOut, ...bases]);
    b.ink(lineD([...sil, sil[0]]), INK_PX.mid, CM.ink, 0, {tone: PT5.facadeMid});
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
  const rig = useRig();
  const cast = useMemo(castD, []);
  return (
    <>
      <ShadowLayer>
        <Shadow d={cast} tint={lawnCastTint(rig)} soft={3} />
      </ShadowLayer>
      <Paint b={parts} seed={`${seed}/p`} misreg={false} />
      {wd ? <path d={wd} fill={PT5.paneWarm} /> : null}
    </>
  );
};
export const Pentagon5 = tiered('environment', {}, PentagonBody);

const rand01 = (k: string) => rng(k).next();

/** The screen outline of the Pentagon's roofline (for masks / checks). */
export const pentagonRoofline5 = (): Pt[] => pentagon(PENT.apothem).map((q) => P3(q, H));
/** The near facade's screen base line (the ground corner nearest the lens). */
export const pentagonNearCorner5 = (): Pt => {
  const g = pentagon(PENT.apothem).map((q) => P3(q, 0));
  return g.reduce((a, c) => (c[1] > a[1] ? c : a));
};
void circ;
void quadD;
void PENT_ROT;
