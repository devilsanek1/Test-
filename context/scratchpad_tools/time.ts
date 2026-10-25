import {paintSpec} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
const t0 = Date.now();
for (const s of ['street', 'monument', 'vista']) for (const L of [0.6, 1, 1.6]) {
  const g = paintSpec('film', L, EDGE_HINTS[`edgelab/${s}`]);
  console.log(s, L, g.meta.roles.join(','), 'blocks', g.colourPolys.length, 'ink polys', g.inkPolys.length, 'colour KB', (g.colour.length / 1024).toFixed(1), 'ink KB', (g.ink.length / 1024).toFixed(1));
}
console.log('ms per spec', ((Date.now() - t0) / 9).toFixed(0));
