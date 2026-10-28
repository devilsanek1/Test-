// V2S6_near.tsx (lane L5): S6's footpath and its near plane, on ONE camera (V2S6_rig CAM: eye 1.6 m, horizon y 771,
// VP (540, 771), f 1400). Every size and place comes from CAM.pt(x m, z m ahead, level m): nothing nearer is smaller per
// metre than anything farther (CRAFT §f.5; the near plane gets value range, never prop count: FEW, BIG, cut by the frame).
//   S6Paving         (plane 0)  the footpath from the kerb at the board's feet (z 4.66 m) to the frame's foot (z 1.95 m):
//                               0.6 m slabs, joints running to the VP, rows foreshortening toward the eye
//   S6GroundShadows  (plane 0)  RIG_APRIL (sun at the left, shadows right and toward us): contact under the board's legs
//                               and Pip, the board's and Pip's casts (K3's own flat shadow is off: shadow={false})
//   S6NearBed        (plane -1) a raised tulip bed along the left (a limestone kerb 0.3 m tall, its inner face turned from
//                               the sun), tulips in rows (heads 5.5 cm: 30-52 px), a flowering shrub in its far corner cut
//                               by the left edge (the petals' source); it ends at z 2.6 m, clear of Pip and the board
//   S6NearBench      (plane -1) a park bench along the right, its long axis into the picture (z 2.15-3.97 m), cut by the
//                               right edge: wooden slats, iron ends
//   S6NearShadows    (plane -1) the bed's kerb and tulips' cast on the path, the bench's feet (before the objects);
//   S6KerbShade      (plane -1) the shade on the kerb's inner face (after the bed)
// Tiers: the paving and the near pieces are environment (C); the board (A) and Pip (B) are their own.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {rand} from '../../lib/rng';
import {Batch, Paint, mix, polyD, crownD, blossomD, type Pt} from '../kit/dc/core';
import {Tier} from '../kit/tiers';
import {CastShadow, ContactShadow, Shade, Shadow, ShadowLayer, multiply} from '../../lib/light';
import {nearStep} from '../../lib/depth';
import {RIG_APRIL} from '../world/rigs';
import {S6} from '../world/map';
import {CAM, KERB_Y, KERB_Z, PIP_SEAT} from './V2S6_rig';
import {LEAF} from './V2S6_set';

const pt = (x: number, z: number, lv = 0): Pt => CAM.pt(x, z, lv);
const ppm = (z: number) => CAM.scale(z);
/** One flat step of the rig's form shade, baked (for small round things: tulip heads, the shrub's far side). */
const formOf = (c: string) => multiply(c, RIG_APRIL.tints.form);
/** The near plane's value step (lib/depth: plane -1 is 5 L* darker than the subject's plane, hue and chroma kept). */
const near = (c: string) => nearStep(c, -1);

// ---------------------------------------------------------------- the footpath (plane 0)

const PV = {
  slab: CM.paving,
  joint: mix(CM.paving, CM.line, 0.22),
};
const SLAB = 0.6;
/** Joint width, m (2.7 px at the kerb, 6.5 px at the frame's foot; a crossing row never under 1.6 px). */
const JOINT = 0.009;

const pavingBatch = (): Batch => {
  const B = new Batch();
  B.rect(PV.slab, -160, KERB_Y + 3, 1400, 1990 - KERB_Y);
  B.layer();
  // crossing rows (level lines: one-point, no yaw), every 0.6 m from the kerb toward the eye
  for (let z = KERB_Z - SLAB; z > 1.3; z -= SLAB) {
    let y0 = CAM.y(z + JOINT / 2);
    let y1 = CAM.y(z - JOINT / 2);
    if (y1 - y0 < 1.6) {
      const m = (y0 + y1) / 2;
      y0 = m - 0.8;
      y1 = m + 0.8;
    }
    B.rect(PV.joint, -160, y0, 1400, y1 - y0);
  }
  // receding joints at x = 0.3 + 0.6 j (m), from the kerb to under the frame
  for (let j = -9; j <= 8; j++) {
    const x = 0.3 + SLAB * j;
    B.poly(PV.joint, [pt(x - JOINT / 2, 1.3), pt(x + JOINT / 2, 1.3), pt(x + JOINT / 2, KERB_Z), pt(x - JOINT / 2, KERB_Z)]);
  }
  return B;
};

export const S6Paving: React.FC = () => {
  const b = useMemo(pavingBatch, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s6paving" misreg={false} />
    </Tier>
  );
};

/** The deal board's legs (K3: the stiles run down to the kerb) and its outer width. */
const BOARD = S6.board0;
const LEG_W = 40;

export const S6GroundShadows: React.FC = () => (
  <ShadowLayer>
    {/* the deal board: a contact strip under each leg and its cast, the whole panel swept along the light */}
    <ContactShadow x={BOARD.x0 + LEG_W / 2} y={KERB_Y} w={LEG_W} />
    <ContactShadow x={BOARD.x1 - LEG_W / 2} y={KERB_Y} w={LEG_W} />
    <CastShadow
      x={(BOARD.x0 + BOARD.x1) / 2}
      y={KERB_Y}
      w={BOARD.x1 - BOARD.x0}
      pts={[
        [BOARD.x0 + 4, KERB_Y - 2],
        [BOARD.x1, KERB_Y - 2],
        [BOARD.x1, KERB_Y + 3],
        [BOARD.x0 + 4, KERB_Y + 3],
      ]}
      h={KERB_Y - BOARD.y0}
    />
    {/* Pip, seated on the paving */}
    <ContactShadow x={PIP_SEAT.x} y={PIP_SEAT.y} w={S6.pipH * 0.66} k={1.15} />
    <CastShadow x={PIP_SEAT.x} y={PIP_SEAT.y} w={S6.pipH * 0.52} h={S6.pipH * 0.92} />
  </ShadowLayer>
);

// ---------------------------------------------------------------- the tulip bed (plane -1)

/** The bed (m): x across (left of the axis), z ahead, the kerb's height and top width, the soil's level. */
const BED = {x0: -1.32, x1: -0.45, z0: 1.3, z1: 2.6, h: 0.3, lip: 0.09, soil: 0.27};
const BT = {
  kerb: near(CM.limestone),
  kerbTop: near(CM.paper),
  soil: near(mix(CM.brickDeep, CM.paving, 0.3)),
  heads: [CM.box, CM.blossom, CM.coatMustard, CM.paper, CM.brick].map(near),
  leaf: near(LEAF.body),
  leafShade: near(LEAF.shade),
  stem: near(LEAF.stem),
};

/** A tulip head: a cup with three pointed petal tips; centre bottom (cx, by), width w, height h. */
const tulipD = (cx: number, by: number, w: number, h: number, tilt: number): string => {
  const p = (u: number, v: number): string => {
    const x = cx + u * w + tilt * v * h;
    const y = by - v * h;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  };
  return (
    `M${p(-0.5, 0.55)}` +
    `C${p(-0.52, 0.12)} ${p(-0.28, -0.02)} ${p(0, -0.02)}` +
    `C${p(0.28, -0.02)} ${p(0.52, 0.12)} ${p(0.5, 0.55)}` +
    `L${p(0.42, 1)}L${p(0.22, 0.74)}L${p(0, 1.02)}L${p(-0.22, 0.74)}L${p(-0.42, 1)}Z`
  );
};

/** A leaf blade from a base point toward a tip, max half-width hw (screen px). */
const bladeD = (a: Pt, tip: Pt, hw: number): string => {
  const dx = tip[0] - a[0];
  const dy = tip[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const m: Pt = [a[0] + dx * 0.42, a[1] + dy * 0.42];
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${(m[0] + nx * hw * 2).toFixed(1)} ${(m[1] + ny * hw * 2).toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}Q${(m[0] - nx * hw * 2).toFixed(1)} ${(m[1] - ny * hw * 2).toFixed(1)} ${a[0].toFixed(1)} ${a[1].toFixed(1)}Z`;
};

type TulipSpot = {x: number; z: number; top: number; c: number; lean: number; tilt: number; leaf: number};
/** The tulips: rows across the bed, far to near (draw order). */
const TULIPS: TulipSpot[] = (() => {
  const out: TulipSpot[] = [];
  let row = 0;
  for (let z = BED.z1 - BED.lip - 0.07; z > BED.z0 + 0.04; z -= 0.115, row++) {
    for (let x = BED.x0 + 0.07 + (row % 2) * 0.045; x < BED.x1 - BED.lip - 0.03; x += 0.095) {
      const k = `${row}/${Math.round(x * 100)}`;
      const jx = (rand('s6tul', `x${k}`) - 0.5) * 0.03;
      const jz = (rand('s6tul', `z${k}`) - 0.5) * 0.03;
      out.push({
        x: x + jx,
        z: z + jz,
        top: 0.5 + rand('s6tul', `h${k}`) * 0.1,
        c: Math.floor(rand('s6tul', `c${k}`) * BT.heads.length),
        lean: (rand('s6tul', `l${k}`) - 0.5) * 0.04,
        tilt: (rand('s6tul', `t${k}`) - 0.5) * 0.22,
        leaf: rand('s6tul', `f${k}`),
      });
    }
  }
  return out;
})();

/** The shrub in the bed's far-left corner (m): its crown's centre and radii. */
const SHRUB = {x: -1.12, z: 2.42, level: 0.68, r: 0.36, rv: 0.37};
export const SHRUB_SCREEN = (() => {
  const c = pt(SHRUB.x, SHRUB.z, SHRUB.level);
  const k = ppm(SHRUB.z);
  return {x: c[0], y: c[1], rx: SHRUB.r * k, ry: SHRUB.rv * k};
})();

const bedBatch = (): Batch => {
  const B = new Batch();
  const {x0, x1, z0, z1, h, lip, soil} = BED;
  // the soil (mostly under the leaves), then the kerb: its inner face (turned from the sun: Shade in the light layer),
  // the lit top along the inner side and across the far end
  B.poly(BT.soil, [pt(x0, z0, soil), pt(x1 - lip, z0, soil), pt(x1 - lip, z1 - lip, soil), pt(x0, z1 - lip, soil)]);
  B.poly(BT.kerb, [pt(x1, z0, 0), pt(x1, z1, 0), pt(x1, z1, h), pt(x1, z0, h)]);
  B.poly(BT.kerbTop, [pt(x1 - lip, z0, h), pt(x1, z0, h), pt(x1, z1, h), pt(x1 - lip, z1, h)]);
  B.poly(BT.kerbTop, [pt(x0 - 0.2, z1 - lip, h), pt(x1, z1 - lip, h), pt(x1, z1, h), pt(x0 - 0.2, z1, h)]);
  // the shrub's crown (behind the near tulips): sage, its far (right) side one step down, blossom clusters on it
  B.layer();
  const S = SHRUB_SCREEN;
  B.fill(formOf(BT.leaf), crownD(S.x + S.rx * 0.08, S.y + S.ry * 0.04, S.rx, S.ry, 's6shrub/s', 9, 0.3));
  B.fill(BT.leaf, crownD(S.x - S.rx * 0.1, S.y - S.ry * 0.02, S.rx * 0.9, S.ry * 0.94, 's6shrub/b', 9, 0.3));
  let bl = '';
  let bs = '';
  for (let i = 0; i < 46; i++) {
    const a = rand('s6shrub', `a${i}`) * Math.PI * 2;
    const d = Math.sqrt(rand('s6shrub', `d${i}`)) * 0.86;
    const bx = S.x + Math.cos(a) * S.rx * d;
    const by = S.y + Math.sin(a) * S.ry * d;
    if (bx < -30 || bx > S.x + S.rx * 0.92) continue;
    const r = 13 + rand('s6shrub', `r${i}`) * 9;
    const dd = blossomD(bx, by, r, `s6shrub/f${i}`, 4);
    if (Math.cos(a) > 0.35) bs += dd;
    else bl += dd;
  }
  B.fill(formOf(near(CM.blossom)), bs);
  B.fill(near(CM.blossom), bl);
  // the tulips, far rows first: leaves, stem, head (its far side one flat step down)
  for (const tl of TULIPS) {
    B.layer();
    const k = ppm(tl.z);
    const base = pt(tl.x, tl.z, soil);
    const headBase = pt(tl.x + tl.lean, tl.z, tl.top);
    // two broad blades, splayed
    const s = tl.leaf > 0.5 ? 1 : -1;
    const tipA = pt(tl.x - 0.07 * s, tl.z - 0.02, soil + 0.17 + tl.leaf * 0.05);
    const tipB = pt(tl.x + 0.06 * s, tl.z + 0.015, soil + 0.13 + (1 - tl.leaf) * 0.05);
    B.fill(BT.leafShade, bladeD(base, tipB, 0.012 * k));
    B.fill(BT.leaf, bladeD(base, tipA, 0.014 * k));
    // the stem
    const sw = Math.max(1.6, 0.007 * k);
    B.poly(BT.stem, [
      [base[0] - sw / 2, base[1]],
      [base[0] + sw / 2, base[1]],
      [headBase[0] + sw / 2, headBase[1] + 2],
      [headBase[0] - sw / 2, headBase[1] + 2],
    ]);
    // the head (cup), and its far-from-the-sun third
    const col = BT.heads[tl.c];
    const w = 0.055 * k;
    const hh = 0.07 * k;
    B.fill(col, tulipD(headBase[0], headBase[1], w, hh, tl.tilt));
    B.fill(formOf(col), tulipD(headBase[0] + w * 0.3, headBase[1] - hh * 0.04, w * 0.4, hh * 0.86, tl.tilt));
  }
  return B;
};

export const S6NearBed: React.FC = () => {
  const b = useMemo(bedBatch, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s6bed" misreg={2} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the bench (plane -1)

const BN = {zA: 2.15, zB: 3.97, ends: [2.25, 3.92], xFront: 0.76, xBack: 1.2, seat: 0.44};
const WOOD = mix(CM.line, CM.leafGold, 0.45);
const BW = {
  wood: near(WOOD),
  woodLit: near(mix(WOOD, CM.paper, 0.26)),
  woodEdge: near(mix(WOOD, CM.paper, 0.42)),
  under: near(mix(CM.line, CM.shadeWarm, 0.5)),
  iron: near(mix(CM.coatSlate, CM.anchor, 0.35)),
};

/** One cast-iron end (a frontal plane at depth z): front leg, rear leg rising into the back post, seat rail, armrest. */
const benchEnd = (B: Batch, z: number) => {
  const q = (xa: number, la: number, xb: number, lb: number, w: number): Pt[] => [pt(xa - w / 2, z, la), pt(xa + w / 2, z, la), pt(xb + w / 2, z, lb), pt(xb - w / 2, z, lb)];
  B.poly(BW.iron, q(0.79, 0, 0.79, 0.66, 0.045));
  B.poly(BW.iron, q(1.17, 0, 1.25, 0.92, 0.05));
  B.poly(BW.iron, [pt(0.77, z, 0.4), pt(1.2, z, 0.4), pt(1.2, z, 0.44), pt(0.77, z, 0.44)]);
  B.poly(BW.iron, [pt(0.73, z, 0.64), pt(1.21, z, 0.64), pt(1.21, z, 0.685), pt(0.73, z, 0.685)]);
};

const benchBatch = (): Batch => {
  const B = new Batch();
  const {zA, zB, xFront, xBack, seat} = BN;
  benchEnd(B, BN.ends[1]);
  B.layer();
  // the back: three slats on the far side (their faces turned toward the path and the sun: lit), a darker underside
  for (const [l0, l1] of [
    [0.52, 0.6],
    [0.65, 0.73],
    [0.78, 0.86],
  ] as [number, number][]) {
    B.poly(BW.wood, [pt(xBack, zA, l0), pt(xBack, zB, l0), pt(xBack, zB, l1), pt(xBack, zA, l1)]);
    B.poly(BW.woodEdge, [pt(xBack, zA, l1 - 0.012), pt(xBack, zB, l1 - 0.012), pt(xBack, zB, l1), pt(xBack, zA, l1)]);
  }
  // the seat: the dark under-seat seen through the gaps, four slats (lit tops), the front slat's lit edge
  B.layer();
  B.poly(BW.under, [pt(xFront, zA, seat - 0.03), pt(xBack, zA, seat - 0.03), pt(xBack, zB, seat - 0.03), pt(xFront, zB, seat - 0.03)]);
  for (let i = 0; i < 4; i++) {
    const xa = xFront + 0.1 * i;
    const xb = xa + 0.086;
    B.poly(BW.woodLit, [pt(xa, zA, seat), pt(xb, zA, seat), pt(xb, zB, seat), pt(xa, zB, seat)]);
  }
  B.poly(BW.woodEdge, [pt(xFront, zA, seat - 0.04), pt(xFront, zB, seat - 0.04), pt(xFront, zB, seat), pt(xFront, zA, seat)]);
  // the near end (mostly past the right edge)
  B.layer();
  benchEnd(B, BN.ends[0]);
  return B;
};

export const S6NearBench: React.FC = () => {
  const b = useMemo(benchBatch, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s6bench" misreg={2} />
    </Tier>
  );
};

// ---------------------------------------------------------------- near shadows (plane -1)

/** The strip the bed's kerb and its tulips throw on the path (sun at the left, el 40: ~0.36 m for the kerb, the tulips'
 *  heads reaching ~0.55 m past it), and the shade on the kerb's inner face. */
const bedCastD = (() => {
  const {x1, z0, z1} = BED;
  const pts: Pt[] = [pt(x1, z0, 0), pt(x1, z1, 0)];
  // a scalloped outer edge: the tulip rows' shadows
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const z = z1 - 0.06 - ((z1 - 0.06 - z0) * i) / n;
    const reach = 0.3 + 0.12 * (i % 2) + 0.06 * rand('s6bedcast', `r${i}`);
    pts.push(pt(x1 + reach, z - 0.08, 0));
  }
  return polyD(pts);
})();
const kerbFaceD = polyD([pt(BED.x1, BED.z0, 0), pt(BED.x1, BED.z1, 0), pt(BED.x1, BED.z1, BED.h), pt(BED.x1, BED.z0, BED.h)]);

/** The near plane's ground shadows (after the paving, before the bed and the bench). */
export const S6NearShadows: React.FC = () => {
  const feet: Pt[] = [];
  for (const z of BN.ends) {
    feet.push(pt(0.79, z, 0));
    feet.push(pt(1.17, z, 0));
  }
  return (
    <ShadowLayer>
      <Shadow d={bedCastD} soft={3} />
      {feet.map(([x, y], i) => (
        <ContactShadow key={i} x={x} y={y} w={Math.max(10, 0.07 * CAM.pxPerM(y))} />
      ))}
    </ShadowLayer>
  );
};

/** The kerb's inner face, turned from the sun: one Shade step (after the bed). */
export const S6KerbShade: React.FC = () => <Shade d={kerbFaceD} />;
