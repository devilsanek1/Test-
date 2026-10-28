// V2S7_ground.tsx (lane L5): the FORECOURT of V2S7 on ONE camera (V2S7_plan S7_CAM: eye 1.6 m, horizon 897, VP
// (540, 897)) and its young London plane, plane +0.5.
//   S7Ground band    the granite paving laid out flat in metres and projected (CRAFT §f.4): long slabs 0.6 m wide
//                    running north, so their joints run INTO the picture to the VP (|dL*| 8, a band that narrows with
//                    distance), darker granite strips (0.12 m) every 2.4 m running north too (they keep the far
//                    forecourt's perspective readable where the joints thin to a hairline), staggered cross joints that
//                    foreshorten toward the wing (only nearer than 14 m: the far paving calms to its long lines). Drawn in three bands, one per float plane (near z < 4.6: -1;
//                    mid 4.6-11.8: 0; far 11.8 to the steps: +0.5); each seam lies on a cross joint.
//   S7TreeGrate      the plane's iron grate (seen in perspective) and the fallen leaves round it
//   S7NearLeaves     three big fallen leaves on the near paving (sized by the camera: ~0.17 m)
//   S7Tree           the young plane (z 16.6): a mottled trunk, its limbs, an autumn crown kept in y 618-872 (clear of
//                    the caption band and of the board), on +0.5 (one small step toward the air)
// Tier C (environment): flat fills, no line.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Tier} from '../../lib/tier';
import {seamTone} from '../../lib/depth';
import {crown as crownD, blob} from '../../lib/sketch';
import {Batch, Paint, leafPath, rng, lerp, ovalPath} from '../kit/canal/core';
import {S7_AIR} from '../world/skies';
import {kz, onPlane, pt, S7_BOLLARD, S7_STEPS, S7_TREE, type P2} from './V2S7_plan';

// ---------------------------------------------------------------- the paving

/** The float planes' bands of the forecourt (z m): near / mid / far; each seam on a cross joint. */
export const GROUND_BANDS = {near: [2.4, 4.6] as P2, mid: [4.6, 11.8] as P2, far: [11.8, S7_STEPS.z[0]] as P2} as const;
export type GroundBand = keyof typeof GROUND_BANDS;

/** The paving and its joints (environment tier: the base is a backdrop, the joints a calm step of the same stone). */
const PAVE = CM.paving;
const JOINT = seamTone(CM.paving, 8);
const SLAB_W = 0.6;
const SLAB_L = 1.2;
const JOINT_W = 0.014;
/** x of the long joints (m): 0.3 + 0.6 j, none exactly on the lens axis. */
const JOINT_XS = Array.from({length: 61}, (_, j) => 0.3 + SLAB_W * (j - 30)).filter((x) => Math.abs(x) < 18);
/** The forecourt's granite strips: a darker stone 0.12 m wide every 2.4 m, running north into the picture (as the
 *  paving's long joints do: the far forecourt's thin joints narrow to a hairline, these strips keep its perspective
 *  readable to the wing). Off the lens axis: none crosses the bottom centre. */
const STRIP = seamTone(CM.paving, 9);
const STRIP_W = 0.12;
const STRIP_XS = [-6.3, -3.9, -1.5, 1.5, 3.9, 6.3, 8.7];

/** A joint as a band in the plane (its width in metres, held >= 1.4 px on screen so the far joints still read). */
function jointQuad(x: number, z0: number, z1: number): P2[] {
  const w0 = Math.max(JOINT_W, 1.4 / kz(z0)) / 2;
  const w1 = Math.max(JOINT_W, 1.4 / kz(z1)) / 2;
  return [pt(x - w0, z0), pt(x + w0, z0), pt(x + w1, z1), pt(x - w1, z1)];
}
/** A cross joint between two long joints at depth z (its depth held >= 1.4 px). */
function crossQuad(xa: number, xb: number, z: number): P2[] {
  const dz = Math.max(JOINT_W, (1.4 * z) / (kz(z) * 1.6)) / 2;
  return [pt(xa, z - dz), pt(xb, z - dz), pt(xb, z + dz), pt(xa, z + dz)];
}

/** The screen x range a band of the ground must cover (the frame plus the float's overscan), as plan x at depth z. */
const XSPAN = (z: number): P2 => [((-80 - 540) * z) / 1800, ((1160 - 540) * z) / 1800];

export const S7Ground: React.FC<{band: GroundBand}> = ({band}) => {
  const b = useMemo(() => {
    const k = new Batch();
    const [z0, z1] = GROUND_BANDS[band];
    // the base (a near band overlaps the seam by a hair under the band nearer to it: never a gap under the float)
    const za = band === 'near' ? z0 : z0 - 0.02;
    const [xl0, xr0] = XSPAN(za);
    const [xl1, xr1] = XSPAN(z1);
    k.poly(PAVE, [pt(xl0, za), pt(xr0, za), pt(xr1, z1), pt(xl1, z1)]);
    k.layer();
    // long joints into the picture
    for (const x of JOINT_XS) {
      const [lo] = XSPAN(z1);
      const [, hi] = XSPAN(z1);
      if (x < Math.min(XSPAN(za)[0], lo) - 1 || x > Math.max(XSPAN(za)[1], hi) + 1) continue;
      k.poly(JOINT, jointQuad(x, za, z1));
    }
    // the granite strips (over the joints they lie on)
    for (const x of STRIP_XS) k.poly(STRIP, [pt(x - STRIP_W / 2, za), pt(x + STRIP_W / 2, za), pt(x + STRIP_W / 2, z1), pt(x - STRIP_W / 2, z1)]);
    // staggered cross joints (running bond), only nearer than 14 m
    for (let j = 0; j < JOINT_XS.length - 1; j++) {
      const xa = JOINT_XS[j];
      const xb = JOINT_XS[j + 1];
      const off = j % 2 ? SLAB_L / 2 : 0;
      for (let z = 2.4 + off; z < Math.min(z1, 14); z += SLAB_L) {
        if (z < z0 || z > z1) continue;
        const [lo, hi] = XSPAN(z);
        if (xb < lo || xa > hi) continue;
        k.poly(JOINT, crossQuad(xa, xb, z));
      }
    }
    return k;
  }, [band]);
  return (
    <Tier tier="environment">
      <Paint b={b} seed={`s7/ground/${band}`} misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- fallen leaves (things, sized by the camera)

const LEAF_COLS = [CM.leafGold, CM.leafRust, CM.coatMustard, CM.leafGold];

/** A fallen plane leaf lying flat at (x, z), `m` metres long: the palmate outline lib/particles draws in the air (five
 *  pointed lobes round a centre a third up from the stem, and the stem), laid out in the ground plane and projected,
 *  so the camera foreshortens it. One closed shape. */
const PALM: [number, number][] = [
  [-1.75, 0.42],
  [-0.95, 0.82],
  [0, 1],
  [0.95, 0.82],
  [1.75, 0.42],
];
function flatLeafInto(k: Batch, x: number, z: number, m: number, rot: number, col: string) {
  const R = m / 1.32;
  const x0 = -m / 2;
  const cx = x0 + 0.32 * R;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const P = (u: number, v: number): P2 => pt(x + u * c - v * s, z + u * s + v * c);
  const at = (a: number, L: number): P2 => P(cx + Math.cos(a) * R * L, Math.sin(a) * R * L);
  const pts: P2[] = [P(x0 - m * 0.16, -m * 0.02), P(x0 - m * 0.16, m * 0.02), P(x0, 0)];
  PALM.forEach(([a, L], i) => {
    if (i > 0) pts.push(at((PALM[i - 1][0] + a) / 2, 0.44));
    pts.push(at(a - 0.2, L * 0.72), at(a, L), at(a + 0.2, L * 0.72));
  });
  k.poly(col, pts);
}

/** The plane's grate (cast iron, seen in perspective) and the leaves round it. */
export const S7TreeGrate: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x, z} = S7_TREE;
    const h = 0.6;
    k.poly(onPlane(CM.coatSlate, 0.5), [pt(x - h, z - h), pt(x + h, z - h), pt(x + h, z + h), pt(x - h, z + h)]);
    k.layer();
    k.poly(onPlane(CM.stoneShade, 0.5), [pt(x - h + 0.06, z - h + 0.06), pt(x + h - 0.06, z - h + 0.06), pt(x + h - 0.06, z + h - 0.06), pt(x - h + 0.06, z + h - 0.06)]);
    k.layer();
    const r = rng('s7/grateLeaves');
    for (let i = 0; i < 6; i++) flatLeafInto(k, x + r.range(-1.6, 0.9), z + r.range(-1.4, 1.2), 0.17, r.range(0, 6.28), onPlane(LEAF_COLS[i % 4], 0.5));
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/grate" misreg={false} />
    </Tier>
  );
};

/** Three big fallen leaves on the near paving (they read as leaves at phone size: ~70-80 px). */
export const S7NearLeaves: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    flatLeafInto(k, 0.35, 3.3, 0.17, 0.4, LEAF_COLS[0]);
    flatLeafInto(k, 0.62, 4.05, 0.16, 2.1, LEAF_COLS[1]);
    flatLeafInto(k, -0.05, 4.4, 0.15, 4.0, LEAF_COLS[2]);
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/nearLeaves" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the young London plane (+0.5)

type Limb = {a: P2; c: P2; w0: number; w1: number};
type Cluster = {x: number; y: number; rx: number; ry: number};

const T = S7_TREE;
const LIMBS: Limb[] = [
  {a: [T.sx - 5, 852], c: [T.sx - 62, 742], w0: 15, w1: 8},
  {a: [T.sx + 1, 850], c: [T.sx + 8, 712], w0: 14, w1: 8},
  {a: [T.sx + 6, 854], c: [T.sx + 70, 758], w0: 13, w1: 7},
  {a: [T.sx - 62, 742], c: [T.sx - 76, 690], w0: 8, w1: 5},
];
const CLUSTERS: Cluster[] = [
  {x: 1000, y: 712, rx: 72, ry: 70},
  {x: 1076, y: 690, rx: 76, ry: 66},
  {x: 1034, y: 790, rx: 84, ry: 64},
  {x: 970, y: 790, rx: 44, ry: 40},
];

/** The tree's colours on +0.5. */
const TC = {
  bark: onPlane(CM.limestone, 0.5),
  barkPatch: [onPlane('#DCDCC6', 0.5), onPlane('#E6DCCB', 0.5), onPlane('#E8DFC9', 0.5)],
  knuckle: onPlane(CM.paving, 0.5),
  leaf: [onPlane(CM.leafGold, 0.5), onPlane(CM.sage, 0.5), onPlane(CM.coatMustard, 0.5), onPlane(CM.leafRust, 0.5)],
  leafLit: onPlane('#E9C27E', 0.5),
} as const;

/** The trunk (tapered, mottled plates, its shade side is V2S7_light's FormShade) and the limbs. */
export const S7TreeTrunk: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const wb = T.trunkW;
    const wt = T.trunkW * 0.78;
    const fl = wb * 0.2;
    k.poly(TC.bark, [[T.sx - wb / 2 - fl, T.base], [T.sx - wb / 2, T.base - 14], [T.sx - wt / 2, T.trunkTop], [T.sx + wt / 2, T.trunkTop], [T.sx + wb / 2, T.base - 14], [T.sx + wb / 2 + fl, T.base]]);
    for (const L of LIMBS) {
      const dx = L.c[0] - L.a[0];
      const dy = L.c[1] - L.a[1];
      const n = Math.hypot(dx, dy) || 1;
      const nx = -dy / n;
      const ny = dx / n;
      k.poly(TC.bark, [[L.a[0] + (nx * L.w0) / 2, L.a[1] + (ny * L.w0) / 2], [L.c[0] + (nx * L.w1) / 2, L.c[1] + (ny * L.w1) / 2], [L.c[0] - (nx * L.w1) / 2, L.c[1] - (ny * L.w1) / 2], [L.a[0] - (nx * L.w0) / 2, L.a[1] - (ny * L.w0) / 2]]);
      k.fill(TC.knuckle, ovalPath(L.c[0], L.c[1], L.w1 * 0.7, L.w1 * 0.55));
    }
    k.layer();
    // the plane's bark: two long soft plates a close tone off the trunk (never spots)
    const h = T.base - T.trunkTop;
    k.fill(TC.barkPatch[0], `M${T.sx - wt * 0.34} ${T.trunkTop + h * 0.12}Q${T.sx - wt * 0.05} ${T.trunkTop + h * 0.2} ${T.sx - wt * 0.12} ${T.trunkTop + h * 0.46}Q${T.sx - wt * 0.3} ${T.trunkTop + h * 0.4} ${T.sx - wt * 0.34} ${T.trunkTop + h * 0.12}Z`);
    k.fill(TC.barkPatch[2], `M${T.sx - wb * 0.4} ${T.trunkTop + h * 0.58}Q${T.sx + wb * 0.05} ${T.trunkTop + h * 0.64} ${T.sx - wb * 0.02} ${T.trunkTop + h * 0.9}Q${T.sx - wb * 0.32} ${T.trunkTop + h * 0.86} ${T.sx - wb * 0.4} ${T.trunkTop + h * 0.58}Z`);
    return k;
  }, []);
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/treeTrunk" misreg={false} />
    </Tier>
  );
};

/** The crown: autumn clusters, a lit patch on the sun side (left) of each; kept in y 618-872. */
export const S7TreeCrown: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    CLUSTERS.forEach((c, i) => k.fill(TC.leaf[0], crownD(c.x, c.y, c.rx, c.ry, {seed: `s7/crown${i}`, round: 0.8})));
    k.layer();
    // the sun side (west, upper left of each mass) one step lighter; a few rust masses in the depth of the crown
    CLUSTERS.slice(0, 3).forEach((c, i) => k.fill(TC.leafLit, crownD(c.x - c.rx * 0.3, c.y - c.ry * 0.24, c.rx * 0.52, c.ry * 0.46, {seed: `s7/crownLit${i}`, round: 0.82})));
    k.fill(TC.leaf[3], crownD(1058, 812, 40, 26, {seed: 's7/crownRust', round: 0.8}));
    return k;
  }, []);
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/treeCrown" misreg={false} />
    </Tier>
  );
};

/** The crown's outline (for its FormShade crescent and the leaves' source region). */
export const S7_CROWN_CLUSTERS = CLUSTERS;
export {leafPath};

// ---------------------------------------------------------------- Pip's stone bollard (0)

/** Pip's short stone bollard (map BOARD_BOLLARD: the cap's top 1205, its base 1274: 0.29 m at z 7.63): a limestone
 *  drum, a domed cap with a lit rim on the sun side, a base ring. Tier C; its form crescent and its shadows are
 *  V2S7_light's. */
export const S7Bollard: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {x, cap, base, w} = S7_BOLLARD;
    const r = w / 2;
    const stone = CM.limestone;
    k.fill(stone, `M${x - r - 3} ${base - 4}L${x - r} ${cap + 14}L${x + r} ${cap + 14}L${x + r + 3} ${base - 4}Q${x} ${base + 4} ${x - r - 3} ${base - 4}Z`);
    k.fill(CM.stucco, `M${x - r - 5} ${base - 9}L${x + r + 5} ${base - 9}L${x + r + 5} ${base - 3}Q${x} ${base + 5} ${x - r - 5} ${base - 3}Z`);
    k.layer();
    k.fill(stone, `M${x - r - 2} ${cap + 15}A${r + 2} 15 0 0 1 ${x + r + 2} ${cap + 15}Q${x} ${cap + 20} ${x - r - 2} ${cap + 15}Z`);
    k.fill(CM.paper, `M${x - r + 2} ${cap + 12}A${r * 0.55} 9 0 0 1 ${x - 2} ${cap + 4}Q${x - r * 0.4} ${cap + 9} ${x - r + 2} ${cap + 12}Z`);
    return k;
  }, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/bollard" misreg={false} />
    </Tier>
  );
};
