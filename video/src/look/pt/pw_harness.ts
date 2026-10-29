// PT lane: a node harness for lib/patchwork (bundled with esbuild into the scratchpad; never imported by a film).
import {groundCam} from '../../lib/depth';
import {frontalBlocks, groundPatchwork, patchStats, patchTones, patchworkProblems, convexParts} from '../../lib/patchwork';

const t0 = Date.now();
const cam = groundCam({horizon: 965, f: 1400, height: 1.3});
const pave = groundPatchwork(cam, {seed: 'h1', poly: [[-9, 2.2], [9, 2.2], [9, 16], [-9, 16]], cell: 0.9, tones: patchTones('#F4D6C2', {plane: -1}), plane: -1, key: [-1, -0.3]});
const t1 = Date.now();
console.log('ground', JSON.stringify(patchStats(pave)), (t1 - t0) + 'ms', pave.tones.join(' '));
console.log(' problems', patchworkProblems(pave, 'ground'));
const sky: [number, number][] = [[0, 900], [0, 760], [70, 760], [70, 700], [150, 700], [150, 790], [230, 790], [230, 650], [300, 650], [300, 740], [420, 740], [420, 720], [520, 720], [520, 900]];
console.log('parts', convexParts(sky).length);
const far = frontalBlocks({seed: 'h2', poly: sky, tones: patchTones('#C9A9A0', {plane: 3}), plane: 3});
console.log('far', JSON.stringify(patchStats(far)), (Date.now() - t1) + 'ms', far.tones.join(' '));
console.log(' problems', patchworkProblems(far, 'far'));
const sz = pave.facets.map((f) => Math.round(Math.sqrt(f.area))).sort((a, b) => a - b);
console.log(' ground sides p10/50/90', sz[Math.floor(sz.length * 0.1)], sz[Math.floor(sz.length * 0.5)], sz[Math.floor(sz.length * 0.9)]);
const byY = [1000, 1100, 1300, 1600, 1900].map((y) => pave.facets.filter((f) => Math.abs(f.c[1] - y) < 60).map((f) => Math.round(Math.sqrt(f.area))));
console.log(' ground side by y', byY.map((l) => l.length ? l.sort((a, b) => a - b)[Math.floor(l.length / 2)] : '-').join(' '));
const small = pave.facets.filter((f) => f.minW < 8);
const hist = new Map<number, number>();
for (const f of small) hist.set(Math.round(f.c[1] / 100) * 100, (hist.get(Math.round(f.c[1] / 100) * 100) ?? 0) + 1);
console.log(' small by y', JSON.stringify(Array.from(hist.entries()).sort((a, b) => a[0] - b[0])));
console.log(' examples', small.slice(0, 5).map((f) => `${f.minW}@${f.c} pts=${JSON.stringify(f.pts)} uv=${JSON.stringify(f.uv.map(([u, v]) => [+u.toFixed(3), +v.toFixed(3)]))}`).join('\n'));
