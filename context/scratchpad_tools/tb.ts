import {paintSpec} from '/home/user/Test-/video/src/lib/edges/paint';
const t0 = performance.now();
let n = 0;
for (let s = 0; s < 100; s++) for (const L of [0.5, 1, 1.6]) { paintSpec(`b${s}`, L); n++; }
const ms = (performance.now() - t0) / n;
const g = paintSpec('film', 1);
console.log(`paintSpec build: ${ms.toFixed(2)} ms per (seed, looseness), once per scene (memoised); film/medium colour path ${(g.colour.length/1024).toFixed(1)} KB (${g.colourPolys.length} blocks), ink path ${(g.ink.length/1024).toFixed(1)} KB (${g.inkPolys.length} subpaths)`);
