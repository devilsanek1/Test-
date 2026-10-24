// check-shapes.ts — every colour contour must contain the caption block (CAPTION_SAFE) and stay within the frame's
// reach, for many seeds and amounts. Run:
//   npx esbuild review/edges/tools/check-shapes.ts --bundle --platform=node --log-level=error > /tmp/cs.cjs && node /tmp/cs.cjs
import {CAPTION_SAFE, EDGE_VARIANTS, edgeSpec} from '../../../src/lib/edges/variants';
import {containsRect} from '../../../src/lib/edges/rough';

let fails = 0;
let n = 0;
const insetStats: Record<string, number[]> = {};
for (const v of EDGE_VARIANTS) {
  for (const amount of [0.5, 0.75, 1, 1.25, 1.6]) {
    for (let s = 0; s < 40; s++) {
      const spec = edgeSpec(v, `seed${s}`, amount);
      if (!spec.colourPts) continue;
      n++;
      if (!containsRect(spec.colourPts, CAPTION_SAFE, 10)) {
        fails++;
        console.log(`FAIL ${v} seed${s} amount ${amount}: contour cuts the caption block`);
      }
      // smallest distance of the contour to the frame's left / right edge in the caption rows
      const side = spec.colourPts.filter((p) => p[1] > CAPTION_SAFE[1] && p[1] < CAPTION_SAFE[3]).map((p) => Math.min(p[0], 1080 - p[0]));
      if (side.length) (insetStats[`${v}@${amount}`] ??= []).push(Math.max(...side));
    }
  }
}
console.log(`${n} contours checked, ${fails} cut the caption block ${JSON.stringify(CAPTION_SAFE)}`);
for (const [k, v] of Object.entries(insetStats)) console.log(`${k}: max side inset next to the captions ${Math.max(...v).toFixed(0)} px`);
process.exit(fails ? 1 : 0);
