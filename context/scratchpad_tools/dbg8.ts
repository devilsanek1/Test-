import {edgeSpec} from '/home/user/Test-/video/src/lib/edges/variants';
import {paintSpec} from '/home/user/Test-/video/src/lib/edges/paint';
const s = edgeSpec('paint-medium', 'scene-07', 1, {});
console.log(paintSpec('scene-07', 1).meta);
console.log('sketch', s.inkPolys![0].map((q) => q.map((v) => v.toFixed(0)).join(',')).join(' '));
console.log('body', s.colourPolys![0].map((q) => q.map((v) => v.toFixed(0)).join(',')).join(' '));
s.colourPolys!.slice(1).forEach((p, i) => console.log('block', i + 1, p.map((q) => q.map((v) => v.toFixed(0)).join(',')).join(' ')));
