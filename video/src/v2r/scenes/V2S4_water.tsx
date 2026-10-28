// V2S4_water.tsx (lane L3): S4's WATER, ONE isolated component with its geometry in ONE exported const, a flat
// placeholder until the shared premium water lands (the orchestrator, 2026-10-28: the owner called the look clip's water
// "way too cheap, not clean or premium quality or refined, just lazy and cheap"; src/lib/water.tsx is being built as one
// shared component; V2S3_water.tsx is the model). No styling is spent here: two flat values per part, nothing else (the
// old reflection dashes, ripples, wake lines, foam, switching glints and floating leaf specks are gone). THE SWAP to
// lib/water is one line: the body of S4Water below becomes `<Water spec={S4_WATER} part={part} />` (or whatever its API
// takes from this const). Two parts, drawn at their places in the z-order:
//   'canal'  the canal strip between her coping and our boat (the canal plane, -0.5, sliding 1.0x with her towpath):
//            her coping's lip at y 1082 above it, our boat's roof hides it from y 1222
//   'near'   the water below our hull (in front of the boat, sliding 2.0x): from the hull's waterline (y 1700) to the
//            frame's foot, the hull's shade on it as the water's own deeper step
// The glints are a separate Particles field on top (V2S4_particles: the glitter path is S4_WATER.glitter); the ducks and
// the angler's float sit on the canal (V2S4_wcanal).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Batch, Paint} from '../kit/canal/core';
import {S4_AIR} from '../world/skies';
import {ROW, PLANE_X} from './V2S4_wcore';
import {S4_CAM, S4_PLANE} from './V2S4_depth';
import {S4_K} from './V2S4_rig';

const [CX0, CX1] = PLANE_X(S4_K.canal);
const [NX0, NX1] = PLANE_X(S4_K.near);

/** Everything a water renderer needs about S4 (plane px at the 17.96 pose; the canal and the near water truck with
 *  their planes: V2S4_rig s4PlaneDx(S4_K.canal / S4_K.near, t)). */
export const S4_WATER = {
  /** The canal strip: its region (plane px) and depth plane; the far edge is her coping's lip. */
  canal: {x0: CX0, x1: CX1, y0: ROW.edge, y1: ROW.roofFar + 18, plane: S4_PLANE.canal, truckK: S4_K.canal},
  /** The water in front of our hull (screen px: our boat glides with us, the water streams past at 2.0x). */
  near: {x0: Math.max(-40, NX0), x1: Math.min(1120, NX1), y0: ROW.waterline, y1: 1944, plane: S4_PLANE.near, truckK: S4_K.near},
  /** The lines that bound the water: her coping (its lip at y 1082, a 7 px band of its shade on the water), our boat's
   *  roof (its far edge hides the canal from y 1222), our hull's waterline (y 1700, a 16 px band of its shade). */
  edges: {herCoping: {y: ROW.edge, shade: 7}, boatRoofFar: ROW.roofFar, hullWaterline: ROW.waterline, hullShade: 16},
  /** What stands in the water or above its edge (wakes, contact lines, reflections): the angler's float, the ducks,
   *  our hull. Plane px at the pose. */
  standing: [
    {what: "the angler's float (still)", x: 226, y: 1136, w: 8},
    {what: 'two ducks paddling west (24 px/s in the canal plane)', x: 1040, y: 1168, w: 32},
    {what: 'our hull (the waterline of the near water)', y: ROW.waterline},
  ],
  /** What the water mirrors (x ranges on the canal plane at the pose, colours as drawn; no reflection of her, ever:
   *  no teal off her, no dark water behind her): the garden walls and gates, the lamp posts, the fingerpost; our hull's
   *  slate and plum stripe over the near water; SUN1 (its glitter path). */
  reflected: [
    {what: 'the garden walls and gates', x0: CX0, x1: CX1, color: CM.brick},
    {what: 'the lamp posts', xs: [40, 905, 1392], color: '#9A8C95'},
    {what: 'the fingerpost (plum)', xs: [575], color: CM.anchor},
    {what: "our hull's slate and plum stripe (near water)", x0: -40, x1: 1120, color: CM.paneUnlit},
    {what: 'SUN1 (250, 650) r 65', x0: 185, x1: 315, color: CM.sun},
  ],
  /** The low sun's glitter path on the near water, under SUN1 (screen px: it stays under the sun while the water
   *  streams; the glints' region, V2S4_particles) and the colour under it. */
  glitter: {x: 250, yFar: 1716, yNear: 1900, wFar: 70, wNear: 150, on: CM.water},
  /** The shot's camera and air (V2S4_depth). */
  camera: {horizon: S4_CAM.horizon, vpx: S4_CAM.vpx},
  air: S4_AIR,
} as const;

/** The flat placeholders (two values each: the water, and the shade of what stands over its edge). */
function canalBatch(): Batch {
  const b = new Batch();
  const c = S4_WATER.canal;
  b.rect(CM.water, c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
  b.layer();
  b.rect(CM.waterDeep, c.x0, c.y0, c.x1 - c.x0, S4_WATER.edges.herCoping.shade);
  return b;
}
function nearBatch(): Batch {
  const b = new Batch();
  const n = S4_WATER.near;
  b.rect(CM.water, n.x0, n.y0, n.x1 - n.x0, n.y1 - n.y0);
  b.layer();
  b.rect(CM.waterDeep, n.x0, n.y0, n.x1 - n.x0, S4_WATER.edges.hullShade);
  return b;
}

/** S4's water, one part at its place in the z-order (the swap to lib/water replaces this body). */
export const S4Water: React.FC<{part: 'canal' | 'near'}> = ({part}) => {
  const b = useMemo(() => (part === 'canal' ? canalBatch() : nearBatch()), [part]);
  return <Paint b={b} seed={`s4water/${part}`} misreg={false} />;
};
