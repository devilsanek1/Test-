// The painted pieces of S1 (the bake's manifest: scripts/look/paint/v2s1.json -> paint.py -> public/paint/v2s1/):
// the sky, the hero cloud, the bay tree, the stone pier. A piece that is not baked yet is undefined: its flat shapes.
import {paintSet} from '../../lib/paint';
import manifest from '../../../public/paint/v2s1/manifest.json';

export const PAINT = paintSet(manifest as unknown as Parameters<typeof paintSet>[0]);
