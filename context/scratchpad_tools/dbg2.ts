import {paintSpec, depthAt} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
const g = paintSpec('film', 0.6);
console.log('roles', g.meta.roles, 'polys', g.colourPolys.length, g.colourPolys.map((p) => p.length));
for (const [i, p] of g.colourPolys.entries()) {
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  console.log(i, 'bbox', Math.min(...xs).toFixed(0), Math.min(...ys).toFixed(0), Math.max(...xs).toFixed(0), Math.max(...ys).toFixed(0));
}
for (const y of [100, 400, 800, 1200, 1600, 1880]) console.log('left depth at y', y, depthAt([g.colourPolys[0]], 3, 1920 - y).toFixed(1), 'all', depthAt(g.colourPolys, 3, 1920 - y).toFixed(1));
