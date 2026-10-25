import {edgeSpec} from '/home/user/Test-/video/src/lib/edges/variants';
import {scanSpans} from '/home/user/Test-/video/src/lib/edges/paint';
const s = edgeSpec('paint-medium', 'scene-07', 1, {});
const y = 1920 - 70;
const col = scanSpans(s.colourPolys!, y, false).map((r) => r.map((v) => v.toFixed(0)).join('-'));
const ink = scanSpans(s.inkPolys!, y, false).filter(([a, b]) => b > 900).map((r) => r.map((v) => v.toFixed(0)).join('-'));
console.log('colour', col.join(' '), '| ink', ink.join(' '));
// polygons crossing the gap
for (const [i, p] of s.inkPolys!.entries()) {
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  if (Math.min(...xs) < 1023 && Math.max(...xs) > 981 && Math.min(...ys) < y && Math.max(...ys) > y) console.log(i, p.length, xs.length < 12 ? p.map((q) => q.map((v) => v.toFixed(0)).join(',')).join(' ') : `bbox ${Math.min(...xs).toFixed(0)},${Math.min(...ys).toFixed(0)}-${Math.max(...xs).toFixed(0)},${Math.max(...ys).toFixed(0)}`);
}
