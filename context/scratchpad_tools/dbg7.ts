import {edgeSpec} from '/home/user/Test-/video/src/lib/edges/variants';
const s = edgeSpec('paint-medium', 'scene-07', 1, {});
for (const [name, polys] of [['colour', s.colourPolys!], ['ink', s.inkPolys!]] as const) {
  polys.forEach((p, i) => {
    for (let j = 0; j < p.length; j++) {
      const a = p[j], b = p[(j + 1) % p.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const diag = Math.abs(b[0] - a[0]) > 300 && Math.abs(b[1] - a[1]) > 300;
      if (diag) console.log(name, i, 'n', p.length, 'edge', a.map((v) => v.toFixed(0)).join(','), '->', b.map((v) => v.toFixed(0)).join(','), 'len', L.toFixed(0));
    }
  });
}
console.log('colour polys', s.colourPolys!.length, s.colourPolys!.map((p) => p.length).join(' '));
