// dump-paint.ts — the paint geometry (colour blocks, ink clip, strokes, roles) as JSON, per preset x shot (with the
// shot's EDGE_HINTS) x seed, for the quick simulator (sim.py) and the checks.
//   npx esbuild review/edges/loose/final/tools/dump-paint.ts --bundle --platform=node --log-level=error > /tmp/dp.cjs
//   node /tmp/dp.cjs film scene-01 > paint.json         (seeds; default 'film')
import {edgeSpec, EdgeVariant} from '../../../../../src/lib/edges/variants';
import {paintSpec, PAINT_LOOSENESS} from '../../../../../src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../src/lib/edges/hints';

const seeds = process.argv.slice(2).length ? process.argv.slice(2) : ['film'];
const out: unknown[] = [];
for (const seed of seeds) {
  for (const shot of ['street', 'monument', 'vista']) {
    const hints = EDGE_HINTS[`edgelab/${shot}`];
    for (const v of ['trim', ...Object.keys(PAINT_LOOSENESS)] as EdgeVariant[]) {
      const s = edgeSpec(v, seed, 1, {hints});
      const meta = v === 'trim' ? null : paintSpec(seed, PAINT_LOOSENESS[v as keyof typeof PAINT_LOOSENESS], hints).meta;
      out.push({seed, shot, variant: v, colour: s.colourPolys ?? [s.colourPts], ink: s.inkPolys ?? (s.inkPts ? [s.inkPts] : null), strokes: s.strokes.map((x) => x.d), meta, keep: hints?.keep ?? []});
    }
  }
}
console.log(JSON.stringify(out));
