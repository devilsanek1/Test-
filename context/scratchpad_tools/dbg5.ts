import {paintSpec, depthAt} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
const g = paintSpec('film', 1, EDGE_HINTS['edgelab/street']);
console.log(g.meta.roles, g.meta.seamsR);
const row: string[] = [];
for (let y = 1480; y <= 1900; y += 12) row.push(`${y}:${depthAt(g.colourPolys, 1, y).toFixed(0)}`);
console.log(row.join(' '));
console.log('body', depthAt([g.colourPts], 1, 1650).toFixed(0), 'corner pts', g.colourPts.filter((p) => p[0] > 900 && p[1] > 1500).map((p) => p.map((v) => v.toFixed(0)).join(',')).join(' | '));
