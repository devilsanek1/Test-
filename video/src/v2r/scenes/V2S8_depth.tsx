// V2S8 (lane L6): DEPTH for her lane (CRAFT §f, lib/depth, lib/DEPTH.md; conform_L6 §10, THROUGHLINE §5b). ONE
// atmosphere for the set (the air = S8_AIR, the sky's lowest colour warmed under SUN8: world/skies.ts), each truck
// plane's depth plane (V2S8_clock S8_DEPTH: -1 the near band, 0 her / the board / the lane, +1 the far bank across the
// basin, +2 the far rows on the sunset band), and the plane group every part draws in: its truck offset plus its share
// of the parallax float (V2S8_clock planeShift). Shadows and particles ride the group of the plane they lie on.
import React from 'react';
import {makeAtmosphere, planePalette, recede} from '../../lib/depth';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {S8_AIR} from '../world/skies';
import {planeShift, S8_DEPTH} from './V2S8_clock';
import type {PlaneId} from './V2S8_clock';

/** The lane's ONE atmosphere: far fills converge on the sunset air (lighter, softer, warmer: a warm air keeps a cool
 *  hue turning the warm way round, never through grey; lib/depth atmos). */
export const S8_ATM = makeAtmosphere({name: 'S8 lane at sunset', air: S8_AIR, hueTurn: 30});

/** A colour on a truck plane's depth plane: one flat step toward the air per plane farther than her (+1 / +2), a value
 *  step darker per plane nearer (the near band, -1); her plane unchanged. */
export const onPlane = (c: string, p: PlaneId): string => recede(c, S8_DEPTH[p], S8_ATM);
/** A set of materials on a depth plane, merged to the plane's values (lib/depth planePalette: 5 / 5 / 4 / 3 / 2). */
export const planeColors = (colors: string[], plane: number) => planePalette(colors, plane, S8_ATM);

/** A truck plane's group: its truck offset + its depth share of the parallax float (the same tree every frame). */
export const S8Plane: React.FC<{p: PlaneId; children?: React.ReactNode}> = ({p, children}) => {
  const t = useTime();
  const [dx, dy] = planeShift(p, t);
  return <XG m={mat.translate(dx, dy)}>{children}</XG>;
};
