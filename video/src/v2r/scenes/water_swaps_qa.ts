// water_swaps_qa.ts: the water lint (lib/water waterProblems) and the ramp's key colours for every shot that draws the
// shared water (docs/v2/water/SWAPS.md). Run in node through esbuild:
//   npx esbuild src/v2r/scenes/water_swaps_qa.ts --bundle --platform=node --format=cjs --jsx=automatic \
//     --loader:.tsx=tsx --outfile=/tmp/wq.js --log-level=error && node /tmp/wq.js
import '../palette';
import {cie, dE76, waterColourAt, waterPalette, waterProblems, type WaterSpec} from '../../lib/water';
import {s1WaterSpec} from './V2S1_water';
import {s2WaterSpec} from './V2S2_Water';
import {S1_PARTICLES_ALIVE as S1_OTHER_ALIVE} from './V2S1_particles';
import {s3WaterSpecs} from './V2S3_water';
import {S3_OTHER_ALIVE} from './V2S3_particles';
import {s4WaterSpecs} from './V2S4_water';
import {S4_OTHER_ALIVE} from './V2S4_particles';
import {s5WaterSpecs} from './V2S5_river';

type Row = {spec: WaterSpec; t0: number; t1: number; other: number};
const rows: Row[] = [];
const add = (spec: WaterSpec, t0: number, t1: number, other: number) => rows.push({spec, t0, t1, other});

add(s1WaterSpec(), 0, 6.13, S1_OTHER_ALIVE);
// S2's fields: 2 blown leaves and 6 motes at most (V2S2_Life); S2 has no glitter
add(s2WaterSpec(), 6.1, 12.98, 8);
{
  const s = s3WaterSpecs();
  add(s.canal, 12.98, 14.86, S3_OTHER_ALIVE);
  add(s.sliver, 12.98, 14.86, S3_OTHER_ALIVE);
}
{
  const s = s4WaterSpecs();
  add(s.canal, 14.86, 20.55, S4_OTHER_ALIVE);
  add(s.near, 14.86, 20.55, S4_OTHER_ALIVE);
}
{
  // S5 runs on scene seconds (0 at 20.55); its other particles: <= 9 alive (V2S5_particles: 4 + 2 motes, 3 leaves)
  const s = s5WaterSpecs();
  add(s.potomac, 0, 3.25, 9);
  add(s.channel, 0, 3.25, 9);
}

const fmt = (hex: string) => {
  const c = cie(hex);
  return `${hex} (L* ${c.L.toFixed(1)} C* ${c.C.toFixed(1)} h ${c.h.toFixed(0)})`;
};
let bad = 0;
for (const r of rows) {
  const p = waterProblems(r.spec, {t1: r.t1, otherAlive: r.other});
  bad += p.length;
  const top = r.spec.ramp.yFar;
  const bot = r.spec.ramp.yNear;
  console.log(`== ${r.spec.id}: ${p.length ? p.length + ' problem(s)' : 'clean'}`);
  for (const m of p) console.log('   ' + m);
  console.log(`   ramp far ${fmt(waterColourAt(r.spec, top))}, mid ${fmt(waterColourAt(r.spec, (top + bot) / 2))}, near ${fmt(waterColourAt(r.spec, bot))}`);
  if (r.spec.air) console.log(`   air ${fmt(r.spec.air)}; far water dE76 to the notLike: ${(r.spec.notLike ?? []).map((n) => `${n.name} ${dE76(waterColourAt(r.spec, top), n.hex).toFixed(1)}`).join(', ')}`);
  if (process.argv.includes('--palette')) for (const c of waterPalette(r.spec)) console.log(`   ${c.name.padEnd(28)} ${c.hex} L* ${c.L} C* ${c.C} h ${c.h} ${c.band}`);
}
console.log(bad ? `${bad} problem(s)` : 'all clean');
