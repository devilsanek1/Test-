// The painted pieces of S1, by bake (scripts/look/paint/<spec> -> paint.py -> public/paint/<set>/manifest.json): the scene
// names its pieces (sky, cloud, cloudbar, tree, pier, farroofs, fartower, fern), PaintS1 picks the set. A piece missing
// from a set is drawn flat.
//   v1  v2s1.json    the first dose (2026-10-29): sky, cumulus, bar, tree, pier
//   v2  v2s1_v2.json the bolder dose (the coordinator: obvious at 400 px): + the far city (roofs, tower), the fern pot
//   v3  v2s1_v3.json the broad brush (the owner's models: 03_beach_dusk, 02_bus_stop_night) and a layered cloudscape
//   v4design, v4  v2s1_v4.json: DESIGNED shapes first (flat: v4design, `paint.py --design`), then painted (v4)
//   v5design, v5  v2s1_v5.json: v4 with true billows (no crescents), designed inner strokes; the scene's one evening light
import {paintSet} from '../../lib/paint';
import m1 from '../../../public/paint/v2s1/manifest.json';
import m2 from '../../../public/paint/v2s1_v2/manifest.json';
import m3 from '../../../public/paint/v2s1_v3/manifest.json';
import m4d from '../../../public/paint/v2s1_v4design/manifest.json';
import m4 from '../../../public/paint/v2s1_v4/manifest.json';
import m5d from '../../../public/paint/v2s1_v5design/manifest.json';
import m5 from '../../../public/paint/v2s1_v5/manifest.json';

type Manifest = Parameters<typeof paintSet>[0];
export const PAINT_SETS = {v1: paintSet(m1 as unknown as Manifest), v2: paintSet(m2 as unknown as Manifest), v3: paintSet(m3 as unknown as Manifest), v4design: paintSet(m4d as unknown as Manifest), v4: paintSet(m4 as unknown as Manifest), v5design: paintSet(m5d as unknown as Manifest), v5: paintSet(m5 as unknown as Manifest)} as const;
export type PaintSetName = keyof typeof PAINT_SETS;
