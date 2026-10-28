// V2S3_water.tsx (lane L3): S3's WATER, ONE isolated component with its geometry in ONE exported const, a flat
// placeholder until the shared premium water lands (the orchestrator, 2026-10-28: the owner called the look clip's water
// "way too cheap, not clean or premium quality or refined, just lazy and cheap"; src/lib/water.tsx is being built as one
// shared component). No styling is spent here: two flat values, nothing else. THE SWAP to lib/water is one line: the
// body of S3Water below becomes `<Water spec={S3_WATER} part={part} />` (or whatever its API takes from this const).
// Two parts, drawn at their places in the z-order (the boat sits between them):
//   'canal'   the canal between her coping and our moored boat (the water plane, -0.6): her coping's edge at y 1130
//             above it, the boat's roof hides it from y 1262
//   'sliver'  the strip of water under our hull (the boat's plane, -1), between the hull's waterline (y 1616) and our
//             coping's lip (y 1631), in the hull's shade
// The glints are a separate Particles field on top (V2S3_particles: the glitter path is S3_WATER.glitter).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Batch, Paint} from '../kit/canal/core';
import {S3_AIR} from '../world/skies';
import * as MAP from '../world/map';

/** Everything a water renderer needs about S3 (world px at the 12.98 match = screen px at the float's rest). */
export const S3_WATER = {
  /** The canal: its region and edges; the far edge is her towpath's coping (its stone face stands just above it). */
  canal: {x0: -80, x1: 1180, y0: 1130, y1: 1262, bottom: 1300, plane: -0.6},
  /** The water under our hull: between the hull's waterline and our coping's lip (both stand above it). */
  sliver: {x0: -70, x1: 1170, y0: 1604, y1: 1634, waterline: 1616, lip: 1631, plane: -1},
  /** The lines that bound the water: her coping (the far edge, a 9 px stone band above y 1130), our hull's
   *  waterline (the plum gunwale stripe and the slate hull above it) and our coping's lip (limestone below it). */
  edges: {herCoping: {y: 1130, h: 9}, hullWaterline: 1616, ourLip: 1631, boatRoofFar: 1262},
  /** What stands in the water or above its edge (reflections, wakes, contact lines): the heron's mooring post. */
  standing: [{what: 'the heron on its mooring post', x: 1046, top: 1150, bottom: 1236, w: 12}],
  /** What the water mirrors (x ranges on the far bank; colours as drawn): the sun, her lit window, the terrace, the
   *  heritage lamp, the tree past her end wall. */
  reflected: [
    {what: 'the sun (SUN3)', x0: 50, x1: 142, color: CM.sun},
    {what: 'her lit window (M)', x0: MAP.W2_CUT.x - MAP.W2_CUT.w / 2, x1: MAP.W2_CUT.x + MAP.W2_CUT.w / 2, color: CM.lamp},
    {what: 'the terrace', x0: 165, x1: 1180, color: CM.brick},
    {what: 'the lit heritage lamp', x0: 980, x1: 992, color: CM.lamp},
    {what: 'the autumn tree and the garden wall', x0: -80, x1: 152, color: CM.sage},
  ],
  /** The low sun's glitter path on the canal (the glints' region: V2S3_particles) and the colour under it. */
  glitter: {x: 96, yFar: 1142, yNear: 1215, wFar: 40, wNear: 80, on: CM.water},
  /** The shot's camera and air (V2S3_depth): the towpath's vanishing point (540, 1150), the far air. */
  camera: {horizon: 1150, vpx: 540},
  air: S3_AIR,
} as const;

/** The flat placeholder (two values: the canal's water with her coping's shade along its far edge; the sliver in our
 *  hull's shade). */
function canalBatch(): Batch {
  const b = new Batch();
  const c = S3_WATER.canal;
  b.rect(CM.water, c.x0, c.y0, c.x1 - c.x0, c.bottom - c.y0);
  b.layer();
  b.rect(CM.waterDeep, c.x0, c.y0, c.x1 - c.x0, S3_WATER.edges.herCoping.h);
  return b;
}
function sliverBatch(): Batch {
  const b = new Batch();
  const s = S3_WATER.sliver;
  b.rect(CM.waterDeep, s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0);
  return b;
}

/** S3's water, one part at its place in the z-order (the swap to lib/water replaces this body). */
export const S3Water: React.FC<{part: 'canal' | 'sliver'}> = ({part}) => {
  const b = useMemo(() => (part === 'canal' ? canalBatch() : sliverBatch()), [part]);
  return <Paint b={b} seed={`s3water/${part}`} misreg={false} />;
};
