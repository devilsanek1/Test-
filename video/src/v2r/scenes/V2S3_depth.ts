// V2S3_depth.ts (lane L3): the shot's DEPTH in numbers (docs/look/CRAFT.md §f, THROUGHLINE §5b's S3 row; lib/depth, its
// how-to src/lib/DEPTH.md). Pure: nothing here draws.
//   S3_ATM      ONE atmosphere: the air = S3_AIR (world/skies: the sky's lowest colour warmed under SUN3), the default
//               flat steps (k 0 / .12 / .22 per plane); every far fill goes through recede / planePalette (planeBatch)
//   S3_CAM      ONE camera for every ground: the towpath's vanishing point (540, 1150) (the eye's horizon above the
//               boat), 3.1 m over our towpath (its slabs ~0.75 m: 165 px/m at the coping, 210 px/m at y 1800); sizes
//               fall as 1/distance, so nothing nearer is smaller per metre (her terrace ~85 px/m, the boat ~150)
//   planeBatch  a Batch's fills on their plane: far = one flat step toward the air, merged to the plane's few values
//               (planePalette: +1 five, +2 four within dE 24), their ink dropped (a far plane draws no lines); near = a
//               value step darker (5 / 10 L* on -1 / -2, hue and chroma kept)
// Planes (V2S3_rig S3_PLANE, the parallax float's): the sky inf · +2 the far city on the sunset band (the west gap's
// far rows behind the sun) · +1 the roofs and chimneys in front of the sun, the viaduct and the warehouse · 0 her
// terrace, her window M, her towpath, the tree and garden wall past her end wall, Pip · -0.6 the canal · -1 the boat
// and the water under it · -2 our towpath and its things.
import {groundCam, makeAtmosphere, nearStep, planePalette, recede} from '../../lib/depth';
import {S3_AIR} from '../world/skies';
import {Batch} from '../kit/canal/core';

/** S3's ONE atmosphere (lib/depth): the air is the sky's lowest colour behind the far planes. */
export const S3_ATM = makeAtmosphere({name: 's3', air: S3_AIR});

/** S3's ONE camera (lib/depth groundCam): the towpath's vanishing point (540, 1150), 3.1 m over our towpath. */
export const S3_CAM = groundCam({horizon: 1150, vpx: 540, f: 1400, height: 3.1});

/** A colour on its plane (far: one step toward the air; near: a value step darker; 0: itself). */
export const onPlane = (c: string, plane: number) => recede(c, plane, S3_ATM);

/** Every fill of a batch on its plane (in place; returns it). Far planes (> 0) merge the batch's colours to the plane's
 *  few values (planePalette over the whole batch, so the plane holds one small palette) and drop their ink; near planes
 *  (< 0) take the near value step on every colour (lit portholes too: the brightest pane in the frame is hers). */
export function planeBatch(b: Batch, plane: number, o: {keepInk?: boolean} = {}): Batch {
  if (plane === 0) return b;
  const all = new Set<string>();
  b.layers.forEach((l) => l.fills.forEach((_, c) => all.add(c)));
  const pal = plane > 0 ? planePalette(Array.from(all), plane, S3_ATM) : null;
  const map = (c: string) => (pal ? pal[c] ?? recede(c, plane, S3_ATM) : nearStep(c, plane, S3_ATM));
  b.layers.forEach((l) => {
    const fills = new Map<string, string[]>();
    l.fills.forEach((ds, c) => {
      const m = map(c);
      const a = fills.get(m);
      if (a) a.push(...ds);
      else fills.set(m, [...ds]);
    });
    l.fills = fills;
    if (plane > 0 && !o.keepInk) l.inks = new Map();
  });
  return b;
}
