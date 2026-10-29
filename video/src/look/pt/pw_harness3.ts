// PT lane: the demo's own patchworks, measured (for the sheet's labels).
import {demoPatchworks} from './PatchworkDemo';
import {patchStats, patchworkProblems} from '../../lib/patchwork';
const out: Record<string, unknown> = {};
for (const [name, g] of [['patch', 0], ['grid', 0.3]] as const) {
  const t0 = Date.now();
  const {quay, far} = demoPatchworks(g);
  out[name] = {ms: Date.now() - t0, quay: patchStats(quay), far: patchStats(far), problems: [...patchworkProblems(quay, 'quay'), ...patchworkProblems(far, 'far')], quayTones: quay.tones, farTones: far.tones};
}
console.log(JSON.stringify(out));
