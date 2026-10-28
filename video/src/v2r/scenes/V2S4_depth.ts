// V2S4_depth.ts (lane L3): the shot's DEPTH in numbers (docs/look/CRAFT.md §f, THROUGHLINE §5b's S4 row; lib/depth, its
// how-to src/lib/DEPTH.md; V2S3_depth.ts is the model). Pure: nothing here draws.
//   S4_ATM      ONE atmosphere: the air = S4_AIR (world/skies: the sky's lowest colour warmed under SUN1), the default
//               flat steps (k 0 / .12 / .22 per plane); every far fill goes through recede / planePalette (planeBatch)
//   S4_CAM      ONE camera for every ground: the eye 3.1 m over her towpath, its horizon at y 760 (= S4_SKY's horizon,
//               behind the far roofs: the backs and the far rows share it), the vanishing point straight ahead (540, 760);
//               her towpath's coping (y 1070) is 14 m away at 100 px/m (her 170 px = 1.7 m), the garden walls' foot (y 992)
//               18.7 m: a 4.7 m towpath whose joints converge on the VP and whose slab rows foreshorten (> 2x far to near)
//   planeBatch  a Batch's fills on their plane: far = one flat step toward the air, merged to the plane's few values
//               (planePalette: +1 five, +2 four within dE 24), their ink dropped (a far plane draws no lines); near = a
//               value step darker (5 / 10 L* on -1 / -2, hue and chroma kept)
// Planes (S4_PLANE; the truck factors are V2S4_rig S4_K): the sky inf (fixed) · +2 the far roofs, the gasholders and the
// viaduct (0.3x) · +1 the terrace backs, the allotment yard and HER end house with her far window (0.6x) · 0 her towpath,
// the garden walls, the post, her, the walkers (1.0x; her screen-fixed) · -0.5 the canal strip (1.0x) · -1 our boat
// (screen-fixed: it glides with us) and the water under it (2.0x).
import {groundCam, makeAtmosphere, nearStep, planePalette, recede, PARALLAX_SKY} from '../../lib/depth';
import {S4_AIR} from '../world/skies';
import {Batch} from '../kit/canal/core';

/** S4's ONE atmosphere (lib/depth): the air is the sky's lowest colour behind the far planes. */
export const S4_ATM = makeAtmosphere({name: 's4', air: S4_AIR});

/** S4's ONE camera (lib/depth groundCam): horizon y 760 (the sky's), VP x 540, f 1400, the eye 3.1 m over her towpath. */
export const S4_CAM = groundCam({horizon: 760, vpx: 540, f: 1400, height: 3.1});

/** S4's depth planes (lib/depth indices; the truck factors live in V2S4_rig S4_K). */
export const S4_PLANE = {sky: PARALLAX_SKY, far: 2, backs: 1, path: 0, canal: -0.5, boat: -1, near: -1} as const;

/** A colour on its plane (far: one step toward the air; near: a value step darker; 0: itself). */
export const onPlane = (c: string, plane: number) => recede(c, plane, S4_ATM);

/** Every fill of a batch on its plane (in place; returns it). Far planes (> 0) merge the batch's colours to the plane's
 *  few values (planePalette over the whole batch, so the plane holds one small palette) and drop their ink; near planes
 *  (< 0) take the near value step on every colour. `keep` colours are mapped by `onPlane` alone (never merged: a lit
 *  window that must stay lamp-gold, her window's teal). */
export function planeBatch(b: Batch, plane: number, o: {keepInk?: boolean; keep?: string[]} = {}): Batch {
  if (plane === 0) return b;
  const keep = new Set((o.keep ?? []).map((c) => c.toUpperCase()));
  const all = new Set<string>();
  b.layers.forEach((l) => l.fills.forEach((_, c) => {
    if (!keep.has(c.toUpperCase())) all.add(c);
  }));
  const pal = plane > 0 ? planePalette(Array.from(all), plane, S4_ATM) : null;
  const map = (c: string) => {
    if (keep.has(c.toUpperCase())) return onPlane(c, plane);
    return pal ? pal[c] ?? recede(c, plane, S4_ATM) : nearStep(c, plane, S4_ATM);
  };
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
