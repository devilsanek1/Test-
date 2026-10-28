// assembly_lints.ts: the film-wide data lints for the v2r assembly (docs/v2/ASSEMBLY.md): skyProblems on every shot's
// sky, particleProblems on every lib/particles field set (each with its shot's joins), floatProblems on every parallax
// float, and the K2 map contract. The water lint is its own runner (src/v2r/scenes/water_swaps_qa.ts: waterProblems on
// the eight lib/water specs). Run in node through esbuild (from video/):
//   npx esbuild src/v2r/film/assembly_lints.ts --bundle --platform=node --format=cjs --jsx=automatic \
//     --loader:.tsx=tsx --outfile=/tmp/al.js --log-level=error && node /tmp/al.js
// A sky message starting "note:" and a contract issue of severity "note" are notes (listed, never failing); anything
// else is a problem (exit code 1). Read the notes: they are the lints' judgement calls.
import '../palette';
import {CM} from '../palette';
import {skyProblems, type SkySpec} from '../../lib/sky';
import {particleProblems, type ParticlesProps} from '../../lib/particles';
import {floatProblems} from '../../lib/depth';
import {S1_EVENING, S2_EVENING, S3_SUNSET, S4_SKY, S5_SKY, S6_MORNING, S7_SUNSET, S8_EVENING} from '../world/skies';
import {contractProblems} from '../world/map';
import {S1_PARTICLE_FIELDS, S1_PARTICLES} from '../scenes/V2S1_particles';
import {S2_PARTICLE_FIELDS, S2_PARTICLES} from '../scenes/V2S2_Life';
import {S3_PARTICLE_FIELDS, S3_PARTICLES} from '../scenes/V2S3_particles';
import {S4_PARTICLE_FIELDS, S4_PARTICLES} from '../scenes/V2S4_particles';
import {S5_PARTICLE_FIELDS, S5_JOINS} from '../scenes/V2S5_particles';
import {S7_PARTICLE_FIELDS, S7_JOINS} from '../scenes/V2S7_particles';
import {S8_PARTICLE_FIELDS, S8_PARTICLE_JOINS} from '../scenes/V2S8';
import {S1_FLOAT_LEGS, S1_FLOAT_REST} from '../scenes/V2S1_float';
import {S2_FLOAT_LEGS, S2_FLOAT_REST} from '../scenes/V2S2_Float';
import {S3_FLOAT_LEGS, S3_FLOAT_REST} from '../scenes/V2S3_rig';
import {s6FloatProblems} from '../scenes/V2S6_rig';
import {s7FloatProblems} from '../scenes/V2S7_pip';
import {S8_FLOAT_LEGS, S8_FLOAT_REST} from '../scenes/V2S8_clock';

let bad = 0;
let notes = 0;
const isNote = (m: unknown) =>
  typeof m === 'string' ? m.startsWith('note:') : (m as {severity?: string}).severity === 'note';
const report = (name: string, p: readonly unknown[]) => {
  const n = p.filter(isNote).length;
  bad += p.length - n;
  notes += n;
  console.log(`== ${name}: ${p.length - n ? `${p.length - n} problem(s)` : 'clean'}${n ? `, ${n} note(s)` : ''}`);
  for (const m of p) console.log('   ' + (typeof m === 'string' ? m : JSON.stringify(m)));
};

const skies: [string, SkySpec][] = [
  ['sky S1_EVENING (V2S1)', S1_EVENING], ['sky S2_EVENING (V2S2)', S2_EVENING], ['sky S3_SUNSET (V2S3)', S3_SUNSET],
  ['sky S4_SKY (V2S4)', S4_SKY], ['sky S5_SKY (V2S5)', S5_SKY], ['sky S6_MORNING (V2S6)', S6_MORNING],
  ['sky S7_SUNSET (V2S7)', S7_SUNSET], ['sky S8_EVENING (V2S8)', S8_EVENING],
];
for (const [name, spec] of skies) report(name, skyProblems(spec, {ink: CM.ink}));

// V2S6 draws no lib/particles field (its petals are V2S6_life's own movers).
const parts: [string, ParticlesProps[], number[]][] = [
  ['particles V2S1', S1_PARTICLE_FIELDS.map((x) => x.f), S1_PARTICLES.joins],
  ['particles V2S2', S2_PARTICLE_FIELDS.map((x) => x.f), S2_PARTICLES.joins],
  ['particles V2S3', S3_PARTICLE_FIELDS.map((x) => x.f), S3_PARTICLES.joins],
  ['particles V2S4', S4_PARTICLE_FIELDS.map((x) => x.f), S4_PARTICLES.joins],
  ['particles V2S5', S5_PARTICLE_FIELDS.map((x) => x.f), S5_JOINS],
  ['particles V2S7', S7_PARTICLE_FIELDS, S7_JOINS],
  ['particles V2S8', S8_PARTICLE_FIELDS.map((x) => x.f), S8_PARTICLE_JOINS],
];
for (const [name, fields, joins] of parts) report(`${name} (${fields.length} fields, joins ${joins.map((j) => +j.toFixed(2)).join(', ')})`, particleProblems(fields, {joins}));

// V2S4 and V2S5 have no parallax float.
report('float V2S1', floatProblems(S1_FLOAT_LEGS, {rest: S1_FLOAT_REST}));
report('float V2S2', floatProblems(S2_FLOAT_LEGS, {rest: S2_FLOAT_REST}));
report('float V2S3', floatProblems(S3_FLOAT_LEGS, {rest: S3_FLOAT_REST}));
report('float V2S6', s6FloatProblems());
report('float V2S7', s7FloatProblems());
report('float V2S8', floatProblems(S8_FLOAT_LEGS, {rest: S8_FLOAT_REST}));

report('map contractProblems', contractProblems());

console.log(`${bad ? `${bad} problem(s)` : 'all clean'}${notes ? `, ${notes} note(s)` : ''}`);
process.exit(bad ? 1 : 0);
