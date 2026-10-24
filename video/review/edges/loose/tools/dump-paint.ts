// dump-paint.ts — dump paint blocks (colour, ink, strokes, roles) as JSON for quick geometry previews (geom.py).
//   npx esbuild review/edges/loose/tools/dump-paint.ts --bundle --platform=node --log-level=error > /tmp/dp.cjs
//   node /tmp/dp.cjs film s1 s2 > paint.json
import {paintSpec, PAINT_LOOSENESS} from '../../../../src/lib/edges/paint';

const seeds = process.argv.slice(2).length ? process.argv.slice(2) : ['film'];
const out: unknown[] = [];
for (const seed of seeds) {
  for (const [v, L] of Object.entries(PAINT_LOOSENESS)) {
    const g = paintSpec(seed, L);
    out.push({seed, variant: v, colour: g.colourPolys, ink: g.inkPolys, strokes: g.strokes.map((x) => x.d), roles: g.meta.roles});
  }
}
console.log(JSON.stringify(out));
