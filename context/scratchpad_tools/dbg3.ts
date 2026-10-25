import {edgeSpec} from '../../../../../home/user/Test-/video/src/lib/edges/variants';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
const [v, seed, amt, shot] = process.argv.slice(2);
const s = edgeSpec(v as any, seed, Number(amt), {hints: shot === 'none' ? undefined : EDGE_HINTS[`edgelab/${shot}`]});
console.log(JSON.stringify({colour: s.colourPolys, ink: s.inkPolys}));
