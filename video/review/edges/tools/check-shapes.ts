// check-shapes.ts — for many seeds and amounts: every colour contour contains the caption block (CAPTION_SAFE), no
// overlay stroke enters it, and (trim / panel) the paper widths per side in the always-visible zone (y 250-1450) and
// at the top. Run:
//   npx esbuild review/edges/tools/check-shapes.ts --bundle --platform=node --log-level=error > /tmp/cs.cjs && node /tmp/cs.cjs
import {CAPTION_SAFE, EDGE_VARIANTS, edgeSpec} from '../../../src/lib/edges/variants';
import {containsRect} from '../../../src/lib/edges/rough';

let fails = 0;
let n = 0;
const [cx0, cy0, cx1, cy1] = CAPTION_SAFE;
const stats: Record<string, {L: number[]; R: number[]; T: number[]; strokes: number[]}> = {};
const range = (v: number[]) => (v.length ? `${Math.min(...v).toFixed(0)}-${Math.max(...v).toFixed(0)}` : '-');
for (const v of EDGE_VARIANTS) {
  for (const amount of [0.5, 0.75, 1, 1.25, 1.4]) {
    for (let s = 0; s < 40; s++) {
      const spec = edgeSpec(v, `seed${s}`, amount);
      // strokes: every coordinate pair outside the caption block (+6 px)
      for (const st of spec.strokes) {
        const nums = (st.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
        for (let i = 0; i + 1 < nums.length; i += 2) {
          const [x, y] = [nums[i], nums[i + 1]];
          if (x > cx0 - 6 && x < cx1 + 6 && y > cy0 - 6 && y < cy1 + 6) {
            fails++;
            console.log(`FAIL ${v} seed${s} amount ${amount}: a stroke enters the caption block at ${x},${y}`);
            break;
          }
        }
      }
      if (!spec.colourPts) continue;
      n++;
      if (!containsRect(spec.colourPts, CAPTION_SAFE, 10)) {
        fails++;
        console.log(`FAIL ${v} seed${s} amount ${amount}: contour cuts the caption block`);
      }
      if (amount === 1 && (v === 'trim' || v === 'panel')) {
        const st = (stats[v] ??= {L: [], R: [], T: [], strokes: []});
        const vis = spec.colourPts.filter((p) => p[1] > 250 && p[1] < 1450);
        st.L.push(...vis.filter((p) => p[0] < 540).map((p) => p[0]));
        st.R.push(...vis.filter((p) => p[0] > 540).map((p) => 1080 - p[0]));
        st.T.push(...spec.colourPts.filter((p) => p[1] < 300 && p[0] > 200 && p[0] < 880).map((p) => p[1]));
        st.strokes.push(spec.strokes.length);
      }
    }
  }
}
console.log(`${n} contours checked, ${fails} failures (caption block ${JSON.stringify(CAPTION_SAFE)})`);
for (const [k, s] of Object.entries(stats)) console.log(`${k} @1, 40 seeds: paper left ${range(s.L)} px, right ${range(s.R)} px (y 250-1450), top ${range(s.T)} px, strokes ${range(s.strokes)}`);
process.exit(fails ? 1 : 0);
