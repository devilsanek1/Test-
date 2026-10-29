// PT lane: calmer near-ground variants, for lane S's "reads busy" flag (tones span and cell; the lint and the numbers).
import {groundCam} from '../../lib/depth';
import {groundPatchwork, patchStats, patchTones, patchworkProblems} from '../../lib/patchwork';
const cam = groundCam({horizon: 965, f: 1400, height: 1.3});
const base = '#9C7A6E'; // a mid-tone stone (L* ~55, the near group's level)
const V: [string, Parameters<typeof patchTones>[1], number, number][] = [
  ['default: 4 tones 4.6 apart, cell 0.8', {plane: -1}, 0.8, 0.3],
  ['3 tones 4.5 apart, cell 0.8', {plane: -1, n: 3, step: 4.5}, 0.8, 0.3],
  ['3 tones 4.5 apart, cell 1.2', {plane: -1, n: 3, step: 4.5}, 1.2, 0.3],
  ['4 tones 4.6 apart, cell 1.2', {plane: -1}, 1.2, 0.3],
  ['2 tones 4.5 apart, cell 0.8', {plane: -1, n: 2, step: 4.5}, 0.8, 0.3],
  ['2 tones 4.5 apart, cell 1.2', {plane: -1, n: 2, step: 4.5}, 1.2, 0.3],
];
const out: Record<string, unknown> = {};
for (const [name, to, cell, grid] of V) {
  const pw = groundPatchwork(cam, {seed: 'calm', poly: [[-4.4, 1.95], [4.4, 1.95], [4.4, 9], [-4.4, 9]], cell, grid, tones: patchTones(base, to), plane: -1});
  out[name] = {stats: patchStats(pw), problems: patchworkProblems(pw), tones: pw.tones, facets: pw.facets.map((f) => [f.d, f.color]), base: pw.base};
}
console.log(JSON.stringify(out));
