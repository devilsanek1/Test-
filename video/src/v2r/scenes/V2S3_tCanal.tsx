// V2S3_tCanal.tsx (lane L3, V2S3 FAR helper): the canal between her towpath and our moored boat, WORLD px at the 12.98
// match. The water is S1's treatment, exactly (the owner on look clip v5: "I don't like the water too much ... let's
// keep it and keep going": V2S1_set_life S1Water, its method and numbers, on S3's geometry; no new water styling): the
// base water, the coping's shade on it (a flat step of the water's own deeper colour), the far water one step toward
// the air (atmos, C* >= 12), the near water a step deeper along the boat, and TWO reflections only as long flat bands
// (the terrace's, broken in two by a calm gap; the sun's gold column under SUN3, where the glints live: V2S3
// particles), each eased into the water through atmos (hue kept, never grey). No ripple dashes, no glints drawn here
// (CRAFT §c). Then a heron standing still on a mooring post (the post's waterline strip is the water's own deeper step).
// Our boat (the NEAR part) covers the water from y ~1254.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {atmos} from '../../lib/depth';
import {mixHex} from '../../lib/light';
import {Paint} from '../kit/canal/core';
import {S3_AIR} from '../world/skies';
import {SUN3} from './V2S3_tWest';
import {Batch, ovalPath, rng, P, leafPath} from './V2S3_tParts';

export const CANAL = {top: 1130, bottom: 1420, x0: -80, x1: 1180} as const;

// ---------------------------------------------------------------- the water (S1's S1Water, on S3's geometry)

type Refl = {x0: number; x1: number; color: string; depth: number};
/** Two reflections only (S1): the terrace's warm brick, and the sun's gold column under the disc. */
const REFL: Refl[] = [
  {x0: 165, x1: 1080, color: CM.brickLight, depth: 46},
  {x0: SUN3.x - 80, x1: SUN3.x + 80, color: CM.sun, depth: 0},
];
const REFL_SOFT = 0.5;
/** The water from her coping's edge down behind our boat's roof (the boat covers it from y ~1254). */
const WATER = {y0: CANAL.top, y1: 1300, x0: -80, x1: 1180} as const;
const WATER_H0 = 1262 - CANAL.top + 4;
/** The far water toward the air (S1: through atmos, a pale teal, C* 12), the near water a step deeper. */
const WATER_FAR = atmos(CM.water, 0.3, S3_AIR, {chromaFloor: 12});
const WATER_NEAR = mixHex(CM.water, CM.waterDeep, 0.3);
/** The sun's reflection colour (behind the glints: their `on`). */
export const SUN_REFL = atmos(CM.lamp, REFL_SOFT, CM.water, {chromaFloor: 12});
/** The sun's glitter column's top (just under the reflection's first band). */
export const REFL_TOP = WATER.y0 + 10;

function waterBase(): Batch {
  const b = new Batch();
  const {y0, y1, x0, x1} = WATER;
  b.rect(CM.water, x0, y0, x1 - x0, y1 - y0);
  b.rect(WATER_FAR, x0, y0 + 9, x1 - x0, WATER_H0 * 0.3);
  b.rect(WATER_NEAR, x0, y0 + WATER_H0 * 0.7, x1 - x0, WATER_H0 * 0.35);
  b.rect(CM.waterDeep, x0, y0, x1 - x0, 9);
  return b;
}

function waterReflections(): Batch {
  const b = new Batch();
  const rt = REFL_TOP;
  REFL.forEach((ref, i) => {
    const color = atmos(ref.color === CM.sun ? CM.lamp : ref.color, REFL_SOFT, CM.water, {chromaFloor: 12});
    const depth = ref.depth || 60;
    const W = ref.x1 - ref.x0;
    const rr = rng(`s3refl/${i}`);
    const h1 = Math.max(3, depth * 0.2);
    const h2 = Math.max(4, depth * 0.32);
    const g1 = W > 300 ? rr.range(0.38, 0.5) : -1;
    if (g1 > 0) {
      b.rect(color, ref.x0 + W * 0.02, rt + 2, W * (g1 - 0.04), h1);
      b.rect(color, ref.x0 + W * (g1 + 0.03), rt + 2, W * (0.95 - g1), h1);
    } else b.rect(color, ref.x0 + W * 0.04, rt + 2, W * 0.92, h1);
    if (ref.color === CM.sun) b.rect(color, ref.x0 + W * 0.16, rt + 2 + h1 + depth * 0.18, W * 0.62, h2);
  });
  return b;
}

export const S3Water: React.FC = () => {
  const base = useMemo(waterBase, []);
  const refl = useMemo(waterReflections, []);
  return (
    <>
      <Paint b={base} seed="s3c/base" misreg={false} />
      <Paint b={refl} seed="s3c/refl" misreg={false} />
    </>
  );
};

// ---------------------------------------------------------------- the heron on its post (still)

/** The heron's mooring post: a timber post standing in the water off the far coping. */
const POST = {x: 1046, top: 1150, bottom: 1236, w: 12} as const;

function postBatch(): Batch {
  const b = new Batch();
  b.rect(CM.line, POST.x - POST.w / 2, POST.top, POST.w, POST.bottom - POST.top);
  b.fill(CM.line, ovalPath(POST.x, POST.top, POST.w / 2 + 1, 3));
  // its waterline: the water's own deeper step (never a contact strip on water), and one soft reflection band
  b.rect(CM.waterDeep, POST.x - POST.w, POST.bottom - 4, POST.w * 2, 4);
  b.rect(mixHex(CM.water, CM.line, 0.35), POST.x - 4, POST.bottom, 8, 14);
  return b;
}

/** A grey heron standing still on the post, in profile facing west (left): long legs, a hunched body with folded
 *  wings, the S-neck tucked, a dark crest stripe and a dagger bill. Flat shapes; no head turn (the life budget). */
function heronBatch(x: number, y: number, h: number): Batch {
  const b = new Batch();
  const dir = -1;
  const legH = h * 0.34;
  const k = h / 84;
  b.poly(CM.shadeCool, [[x - 4 * k, y], [x - 2.5 * k, y - legH * 0.5], [x - 4.5 * k, y - legH], [x - 2.5 * k, y - legH], [x - 0.5 * k, y - legH * 0.5], [x - 2 * k, y]]);
  b.poly(CM.shadeCool, [[x + 3 * k, y], [x + 4 * k, y - legH * 0.55], [x + 1.5 * k, y - legH], [x + 3.5 * k, y - legH], [x + 5.5 * k, y - legH * 0.55], [x + 5 * k, y]]);
  const by = y - legH;
  const body = `M${P(x - 16 * k, by - 18 * k)}Q${P(x - 4 * k, by - 30 * k)} ${P(x + 14 * k, by - 22 * k)}Q${P(x + 30 * k, by - 12 * k)} ${P(x + 34 * k, by + 2 * k)}Q${P(x + 14 * k, by + 4 * k)} ${P(x - 2 * k, by + 2 * k)}Q${P(x - 16 * k, by - 4 * k)} ${P(x - 16 * k, by - 18 * k)}Z`;
  b.fill(CM.stoneShade, body);
  b.layer();
  b.fill(CM.shadeCool, `M${P(x - 6 * k, by - 20 * k)}Q${P(x + 14 * k, by - 22 * k)} ${P(x + 34 * k, by + 1 * k)}Q${P(x + 12 * k, by - 4 * k)} ${P(x - 4 * k, by - 8 * k)}Z`);
  b.fill(CM.paper, `M${P(x - 16 * k, by - 18 * k)}Q${P(x - 18 * k, by - 6 * k)} ${P(x - 6 * k, by + 1 * k)}Q${P(x - 10 * k, by - 10 * k)} ${P(x - 10 * k, by - 20 * k)}Z`);
  // the neck as a flat S-shaped band, the head, the crest, the bill
  const nx = x - 12 * k;
  const ny = by - 20 * k;
  const hx = nx - 6 * k;
  const hy = ny - 22 * k;
  b.fill(CM.paper, `M${P(nx - 3.5 * k, ny)}C${P(nx - 14 * k, ny - 8 * k)} ${P(hx + 4 * k, hy + 10 * k)} ${P(hx - 3.5 * k, hy)}L${P(hx + 3.5 * k, hy)}C${P(hx + 11 * k, hy + 10 * k)} ${P(nx - 6 * k, ny - 8 * k)} ${P(nx + 3.5 * k, ny)}Z`);
  b.fill(CM.paper, ovalPath(hx, hy, 5.4 * k, 4.6 * k));
  b.layer();
  b.fill(CM.shadeCool, `M${P(hx - dir * 1 * k, hy - 3.4 * k)}L${P(hx - dir * 14 * k, hy - 2 * k)}L${P(hx - dir * 2 * k, hy - 1 * k)}Z`);
  b.fill(CM.coatMustard, `M${P(hx + dir * 3 * k, hy - 1.6 * k)}L${P(hx + dir * 19 * k, hy + 0.6 * k)}L${P(hx + dir * 3 * k, hy + 1.8 * k)}Z`);
  for (let i = 0; i < 2; i++) b.fill(CM.shadeCool, leafPath(x + (30 + i * 3) * k, by + (2 - i * 3) * k, 11 * k, 3 * k, 12 + i * 10));
  return b;
}

export const S3CanalLife: React.FC = () => {
  const post = useMemo(postBatch, []);
  const heron = useMemo(() => heronBatch(POST.x, POST.top + 1, 84), []);
  return (
    <>
      <Paint b={post} seed="s3c/post" misreg={false} />
      <Paint b={heron} seed="s3heron" misreg={false} />
    </>
  );
};
