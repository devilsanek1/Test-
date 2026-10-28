// V2S3_nground.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): the ground of the
// bottom third, nearest the lens, drawn from the shot's ONE camera (V2S3_depth S3_CAM: the towpath's vanishing point
// (540, 1150); CRAFT §f.4): the sliver of water in our hull's shade, OUR coping (stone blocks whose joints run to the
// vanishing point) and OUR towpath y 1652-2016 (slabs laid out in metres and projected: the joints running into the
// picture as flat tone bands at dL* 7, narrowing with distance; the level joints a softer step), a few fallen leaves as
// flat shapes (bigger toward us), the boat's rope to our mooring bollard, and the near lamp-post held from S2 across the
// match-cut (L2's lamp, copied exactly). Flat colour only (the clean pen's environment tier draws no lines here): no
// cracks, grit, dabs or ripple dashes (CRAFT §c). Planes (V2S3_depth planeBatch): the water under the hull rides the
// boat's plane (-1), the coping, the paving, the leaves and the rope ours (-2): one value step darker each.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {band, nearStep, seamTone} from '../../lib/depth';
import {Batch, Paint, P, rng, ovalPath, leafPath} from '../kit/canal/core';
import type {Pt} from '../kit/canal/core';
import {NB, Levels} from './V2S3_nboat';
import {bollardNeck} from './V2S3_ndress';
import {Tier} from '../../lib/tier';
import {S2_NEAR_LAMP} from './V2S2_Near';
import {S3_CAM, planeBatch} from './V2S3_depth';

/** Ground lines (world px). */
export const NG = {
  x0: -70,
  x1: 1170,
  waterTop: 1604,
  lip: 1631,
  copingNear: 1652,
  bottom: 2016,
  /** Vanishing point of every line running into the picture (S3_CAM.vp). */
  vp: S3_CAM.vp,
} as const;

const cam = S3_CAM;
/** Depth (m) of a screen y on our towpath. */
const zAt = (y: number) => cam.z(y);
/** The towpath's slabs: 0.75 m wide (x, metres right of the lens axis), rows 0.6 m deep. */
const SLAB_W = 0.75;
const SLAB_D = 0.6;
/** World x span covering the frame and its overscan at the coping (the widest row). */
const X_SPAN = 4.6;

// ---------------------------------------------------------------- the static ground

/** Our coping and towpath (-2): stone blocks and slabs laid out in metres and projected from S3_CAM. */
function groundBatch(): Batch {
  const L = new Levels();
  const {x0, x1, lip, copingNear, bottom} = NG;
  // ---- the coping: the stone edge of our bank; its top catches the sky at the lip, its near edge one soft step down
  L.at(0).rect(CM.limestone, x0, lip, x1 - x0, copingNear - lip);
  L.at(1).rect(CM.paper, x0, lip, x1 - x0, 3);
  L.at(1).rect(seamTone(CM.limestone, 5), x0, copingNear - 4, x1 - x0, 4);
  const zLip = zAt(lip);
  const zCop = zAt(copingNear);
  const jc = seamTone(CM.limestone, 7);
  for (let x = -X_SPAN + 0.35; x < X_SPAN; x += 1.2) L.at(1).poly(jc, band(cam, [x, zLip], [x, zCop - 0.02], 0.03));
  // ---- the towpath: the paving, a few slabs one soft step lighter or darker (stone tones, sparse), the joints
  L.at(0).rect(CM.paving, x0, copingNear, x1 - x0, bottom - copingNear);
  const zFar = zCop;
  const zNear = zAt(bottom + 20);
  const r = rng('s3ng/slabs');
  const lighter = seamTone(CM.paving, -4);
  const darker = seamTone(CM.paving, 4);
  for (let z = zFar; z > zNear; z -= SLAB_D) {
    for (let x = -X_SPAN; x < X_SPAN; x += SLAB_W) {
      const pick = r.next();
      if (pick > 0.16) continue;
      const pts: Pt[] = [cam.pt(x, z), cam.pt(x + SLAB_W, z), cam.pt(x + SLAB_W, z - SLAB_D), cam.pt(x, z - SLAB_D)];
      L.at(1).poly(pick < 0.08 ? lighter : darker, pts);
    }
  }
  // the joints running INTO the picture (visible: dL* 7, CRAFT §f.4), continuous to the vanishing point, ~2 cm wide
  const seam = seamTone(CM.paving, 7);
  for (let x = -X_SPAN; x <= X_SPAN + 1e-6; x += SLAB_W) L.at(2).poly(seam, band(cam, [x, zFar], [x, zNear], 0.022));
  // the level joints between the rows: a softer step (dL* 4), so the receding lines lead
  const soft = seamTone(CM.paving, 4);
  for (let z = zFar - SLAB_D; z > zNear; z -= SLAB_D) L.at(2).poly(soft, band(cam, [-X_SPAN - 1, z], [X_SPAN + 1, z], 0.018));
  // ---- a few fallen leaves as flat shapes, bigger toward us (~12 cm leaves at the ground's own scale)
  const lv = rng('s3ng/leaves');
  // gold, mustard and a light rust (a dark rust leaf on the near paving reads as a speck: CRAFT §c)
  const LEAF = [CM.leafGold, '#C98B6B', CM.coatMustard, '#C98B6B'];
  const spots: [number, number][] = [[-2.2, 7.4], [-0.9, 6.3], [0.6, 7.9], [1.7, 6.8], [2.6, 5.9], [-1.6, 5.4], [0.2, 5.6], [-2.9, 6.6]];
  spots.forEach(([lx, lz], i) => {
    const [sx, sy] = cam.pt(lx, lz);
    const s = 0.13 * cam.pxPerM(sy);
    L.at(3).fill(LEAF[i % LEAF.length], leafPath(sx, sy, s, s * 0.36, lv.range(-50, 50)));
  });
  return planeBatch(L.merge(), -2);
}

// ---------------------------------------------------------------- the rope

/** The boat's rope: from the T-stud on the gunwale down across the water to the mooring bollard on our coping
 *  (V2S3_ndress), a loop round its neck and the tail coiled flat on the stones beside it (flat shapes, no twist
 *  ticks). Our plane (-2); drawn after the bollard (the loop sits in front of its neck). */
function ropeBatch(): Batch {
  const L = new Levels();
  const a: Pt = [NB.dolly[0], NB.dolly[1]];
  const c: Pt = bollardNeck();
  const mid: Pt = [(a[0] + c[0]) / 2 + 6, (a[1] + c[1]) / 2 + 16];
  const pts: Pt[] = [];
  for (let k = 0; k <= 16; k++) {
    const u = k / 16;
    pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mid[0] + u * u * c[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * mid[1] + u * u * c[1]]);
  }
  // the tail coiled on the coping by the bollard's foot
  const foot = NG.copingNear - 6;
  L.at(0).fill(CM.coatOat, ovalPath(c[0] + 40, foot, 20, 5.5));
  L.at(1).fill(seamTone(CM.coatOat, 8), ovalPath(c[0] + 40, foot - 0.5, 8, 2.2));
  // the rope as a flat ribbon, and its loop round the neck
  const rib: Pt[] = [];
  const back: Pt[] = [];
  for (let k = 0; k < pts.length; k++) {
    const p0 = pts[Math.max(0, k - 1)];
    const p1 = pts[Math.min(pts.length - 1, k + 1)];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const m = Math.hypot(dx, dy) || 1;
    rib.push([pts[k][0] - (dy / m) * 4.2, pts[k][1] + (dx / m) * 4.2]);
    back.unshift([pts[k][0] + (dy / m) * 4.2, pts[k][1] - (dx / m) * 4.2]);
  }
  L.at(2).poly(CM.coatOat, [...rib, ...back]);
  L.at(2).fill(CM.coatOat, ovalPath(c[0], c[1], 17, 6));
  L.at(3).fill(seamTone(CM.coatOat, 10), ovalPath(c[0], c[1] + 1.5, 13, 2.4));
  return planeBatch(L.merge(), -2);
}

// ---------------------------------------------------------------- components

/** The coping, the towpath and the leaves (AFTER the boat), in our plane. */
export const S3Ground: React.FC = () => {
  const g = useMemo(groundBatch, []);
  return <Paint b={g} seed="s3ngGround" misreg={false} />;
};

/** The boat's rope to the bollard (after the bollard: V2S3_near). */
export const S3Rope: React.FC = () => {
  const rope = useMemo(ropeBatch, []);
  return <Paint b={rope} seed="s3ngRope" misreg={false} />;
};

/** The near lamp-post (nearest of all): S2's, HELD across the match-cut, copied exactly from L2's V2S2_Near.tsx
 *  (S2NearThings' post, its numbers exported as S2_NEAR_LAMP "for L3, who holds it across the cut"): the slim post in
 *  nearStep(CM.line, -2) (#7E3E26 authored, #8F553F on screen in tier C) from below the frame (foot y 1990, half-width
 *  0.62 w there, 0.5 w from the neck up) to the neck at y 790, the swan-neck curving right into an arm that leaves the
 *  frame at y ~644-665, a collar at y 1640 (48 x 30). Same path, colour and tier as S2 draws it, and both floats are
 *  home at the cut, so the foreground column stays put while the world swaps behind it. (S2's bike locked to it is
 *  S2's own: the world it belongs to swaps at the cut.) */
const L = S2_NEAR_LAMP;
const LAMP_TOP = L.neckY - 90;
function nearLampBatch(): Batch {
  const b = new Batch();
  const {x, w} = L;
  const c = nearStep(CM.line, -2);
  b.fill(c, `M${P(x - w * 0.62, L.foot)}L${P(x - w * 0.5, LAMP_TOP + 90)}C${P(x - w * 0.5, LAMP_TOP + 20)} ${P(x + 10, LAMP_TOP - 40)} ${P(x + 60, LAMP_TOP - 46)}L${P(1140, LAMP_TOP - 56)}L${P(1140, LAMP_TOP - 56 + w * 0.7)}L${P(x + 62, LAMP_TOP - 46 + w * 0.72)}C${P(x + 24, LAMP_TOP - 38 + w * 0.7)} ${P(x + w * 0.5, LAMP_TOP + 30)} ${P(x + w * 0.5, LAMP_TOP + 90)}L${P(x + w * 0.62, L.foot)}Z`);
  b.rect(c, x - w * 0.8, L.collar.y, w * 1.6, L.collar.h);
  return b;
}
/** The lamp's numbers as S3 holds them (= L2's S2_NEAR_LAMP). */
export const NEAR_LAMP = L;
export const S3LampFoot: React.FC = () => {
  const b = useMemo(nearLampBatch, []);
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s2lamppost" misreg={false} />
    </Tier>
  );
};
