// V2S3_tCanal.tsx (lane L3, V2S3 FAR helper): what stands in the canal, WORLD px at the 12.98 match: a heron standing
// still on a mooring post off her coping (the water itself is V2S3_water's one isolated component; its geometry, this
// post included, is S3_WATER). The post's waterline is a flat step of the water's own deeper colour (never a contact
// strip on water). Flat shapes, tier C; no head turn (the life budget).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {mixHex} from '../../lib/light';
import {Paint} from '../kit/canal/core';
import {Batch, ovalPath, P, leafPath} from './V2S3_tParts';
import {S3_WATER} from './V2S3_water';

// ---------------------------------------------------------------- the heron on its post (still)

/** The heron's mooring post: a timber post standing in the water off the far coping. */
const POST = S3_WATER.standing[0];

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
