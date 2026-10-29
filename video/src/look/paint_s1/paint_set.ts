// The painted pieces of S1, by bake (scripts/look/paint/<spec> -> paint.py -> public/paint/<set>/manifest.json): the scene
// names its pieces (sky, cloud, cloudbar, tree, pier, farroofs, fartower, fern), PaintS1 picks the set. A piece missing
// from a set is drawn flat.
//   v1  v2s1.json    the first dose (2026-10-29): sky, cumulus, bar, tree, pier
//   v2  v2s1_v2.json the bolder dose (the coordinator: obvious at 400 px): + the far city (roofs, tower), the fern pot
import {paintSet} from '../../lib/paint';
import m1 from '../../../public/paint/v2s1/manifest.json';
import m2 from '../../../public/paint/v2s1_v2/manifest.json';

type Manifest = Parameters<typeof paintSet>[0];
export const PAINT_SETS = {v1: paintSet(m1 as unknown as Manifest), v2: paintSet(m2 as unknown as Manifest)} as const;
export type PaintSetName = keyof typeof PAINT_SETS;
