import {paintSpec} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
(globalThis as any).PAINT_DEBUG = 1;
const g = paintSpec('film', 1, EDGE_HINTS['edgelab/monument']);
console.log(g.meta.roles);
