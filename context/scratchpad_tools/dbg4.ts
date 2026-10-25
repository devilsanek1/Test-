import {paintSpec, depthAt} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
const g = paintSpec('scene-36', 1, EDGE_HINTS['edgelab/vista']);
console.log(g.meta);
const row: string[] = [];
for (let y = 1560; y <= 1700; y += 8) row.push(`${y}:${depthAt(g.colourPolys, 1, y).toFixed(0)}`);
console.log(row.join(' '));
for (const [i, p] of g.colourPolys.entries()) {
  const near = p.filter((q) => q[0] > 1000 && q[1] > 1500 && q[1] < 1750).map((q) => `(${q[0].toFixed(0)},${q[1].toFixed(0)})`);
  if (near.length) console.log(i, p.length, near.join(' '));
}
