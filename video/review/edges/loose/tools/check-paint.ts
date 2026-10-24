// check-paint.ts — the paint edge over many seeds and looseness values:
//   - the colour (union of blocks) contains the caption block; no overlay stroke enters it
//   - paper beside the caption block <= 38 px (left) / 77 px (right); under the right rail (y 900-1500) <= 18 px
//   - no HOLES: paper enclosed by colour (a speck or gap between blocks; <= 4 px tolerated: below one anti-aliased
//     pixel cluster), on a 1 px raster of the union; and no
//     HAIRLINES: paper < 6 px wide along a frame edge (rows and columns). (A diagonal block edge meeting a thin margin
//     tapers to nothing: that taper is the paint, not a sliver, and is not counted.)
//   - stats per preset at amount 1 (40 seeds): paper share of the frame, of the always-visible zone (y 180-1520), paper
//     depth per side in that zone, number of blocks, ink clip size
// Run:
//   npx esbuild review/edges/loose/tools/check-paint.ts --bundle --platform=node --log-level=error > /tmp/cp.cjs && node /tmp/cp.cjs
import {CAPTION_SAFE, edgeSpec, EdgeVariant} from '../../../../src/lib/edges/variants';
import {containsRectAny, depthAt, PAINT_LIMITS} from '../../../../src/lib/edges/paint';
import type {Pt} from '../../../../src/lib/sketch';

const W = 1080;
const H = 1920;
const [cx0, cy0, cx1, cy1] = CAPTION_SAFE;

/** Colour intervals of the union along a scanline (horizontal: y = c, vertical: x = c). */
function spans(polys: Pt[][], c: number, vertical: boolean): [number, number][] {
  const iv: [number, number][] = [];
  for (const p of polys) {
    const xs: number[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      const [ay, by, ax, bx] = vertical ? [a[0], b[0], a[1], b[1]] : [a[1], b[1], a[0], b[0]];
      if (ay > c === by > c) continue;
      xs.push(ax + ((bx - ax) * (c - ay)) / (by - ay));
    }
    xs.sort((m, n) => m - n);
    for (let i = 0; i + 1 < xs.length; i += 2) iv.push([xs[i], xs[i + 1]]);
  }
  iv.sort((m, n) => m[0] - n[0]);
  const out: [number, number][] = [];
  for (const s of iv) {
    const l = out[out.length - 1];
    if (l && s[0] <= l[1] + 0.5) l[1] = Math.max(l[1], s[1]);
    else out.push([s[0], s[1]]);
  }
  return out;
}

/** Paper runs along a scanline within [0, len]: interior (between colour) and edge (touching the frame). */
function paperRuns(sp: [number, number][], len: number) {
  const runs: {a: number; b: number; edge: boolean}[] = [];
  let x = 0;
  for (const [a0, b] of sp) {
    const a = Math.min(a0, len);
    if (a > x) runs.push({a: x, b: a, edge: x <= 0 || a >= len});
    x = Math.max(x, b);
    if (x >= len) break;
  }
  if (x < len) runs.push({a: x, b: len, edge: true});
  return runs.filter((r) => r.b > r.a + 0.01);
}

const pct = (v: number[], q: number) => {
  const s = v.slice().sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN;
};
let fails = 0;
let n = 0;
const fail = (m: string) => {
  fails++;
  if (fails < 40) console.log('FAIL ' + m);
};
const variants: EdgeVariant[] = ['paint-subtle', 'paint-medium', 'paint-loose'];
const stats: Record<string, {paper: number[]; vis: number[]; L: number[]; R: number[]; T: number[]; B: number[]; blocks: number[]; inkKB: number[]; sliver: number}> = {};
for (const v of variants) {
  for (const amount of [0.6, 0.8, 1, 1.2, 1.4]) {
    for (let s = 0; s < 40; s++) {
      const seed = s === 0 ? 'film' : `scene-${String(s).padStart(2, '0')}`;
      const spec = edgeSpec(v, seed, amount);
      const polys = spec.colourPolys!;
      n++;
      const tag = `${v} ${seed} x${amount}`;
      if (!containsRectAny(polys, CAPTION_SAFE, 10)) fail(`${tag}: colour cuts the caption block`);
      for (const st of spec.strokes) {
        const nums = (st.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
        for (let i = 0; i + 1 < nums.length; i += 2) {
          const [x, y] = [nums[i], nums[i + 1]];
          if (x > cx0 - 6 && x < cx1 + 6 && y > cy0 - 6 && y < cy1 + 6) {
            fail(`${tag}: a stroke enters the caption block at ${x},${y}`);
            break;
          }
        }
      }
      // zone limits (rows)
      for (let y = cy0 - 30; y <= cy1 + 30; y += 4) {
        const l = depthAt(polys, 3, H - y);
        const r = depthAt(polys, 1, y);
        if (l > PAINT_LIMITS.left + 0.5) fail(`${tag}: left paper ${l.toFixed(1)} beside the caption at y ${y}`);
        if (r > PAINT_LIMITS.right + 0.5) fail(`${tag}: right paper ${r.toFixed(1)} beside the caption at y ${y}`);
      }
      for (let y = 900; y <= 1500; y += 4) {
        const r = depthAt(polys, 1, y);
        if (r > PAINT_LIMITS.rail + 0.5) fail(`${tag}: right paper ${r.toFixed(1)} under the rail at y ${y}`);
      }
      // raster of the union (1 px rows), paper share, holes (paper not reachable from the frame border), hairlines
      const mask = new Uint8Array(W * H); // 1 = colour
      for (let y = 0; y < H; y++) for (const [a, b] of spans(polys, y + 0.5, false)) for (let x = Math.max(0, Math.ceil(a - 0.5)); x < Math.min(W, Math.floor(b - 0.5) + 1); x++) mask[y * W + x] = 1;
      let paperPx = 0;
      let visPx = 0;
      const seen = new Uint8Array(W * H);
      const stack: number[] = [];
      for (let i = 0; i < W * H; i++) {
        if (mask[i]) continue;
        paperPx++;
        const y = (i / W) | 0;
        if (y >= 180 && y <= 1520) visPx++;
        const x = i % W;
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) {
          seen[i] = 1;
          stack.push(i);
        }
      }
      while (stack.length) {
        const i = stack.pop()!;
        const x = i % W;
        for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
          if (j < 0 || j >= W * H || seen[j] || mask[j]) continue;
          seen[j] = 1;
          stack.push(j);
        }
      }
      let holes = 0;
      for (let i = 0; i < W * H; i++) if (!mask[i] && !seen[i]) holes++;
      let hair = 0;
      for (let y = 0; y < H; y += 2) {
        let a = 0;
        while (a < W && !mask[y * W + a]) a++;
        if (a > 0 && a < 6 && a < W) hair++;
        let b = 0;
        while (b < W && !mask[y * W + W - 1 - b]) b++;
        if (b > 0 && b < 6 && b < W) hair++;
      }
      for (let x = 0; x < W; x += 2) {
        let a = 0;
        while (a < H && !mask[a * W + x]) a++;
        if (a > 0 && a < 6 && a < H) hair++;
        let b = 0;
        while (b < H && !mask[(H - 1 - b) * W + x]) b++;
        if (b > 0 && b < 6 && b < H) hair++;
      }
      const sliver = holes + hair;
      if (holes > 4) fail(`${tag}: ${holes} px of enclosed paper (holes between blocks)`);
      if (hair > 10) fail(`${tag}: ${hair} hairline scanlines at the frame edge`);
      if (amount === 1) {
        const st = (stats[v] ??= {paper: [], vis: [], L: [], R: [], T: [], B: [], blocks: [], inkKB: [], sliver: 0});
        st.paper.push((paperPx / (W * H)) * 100);
        st.vis.push((visPx / (W * 1340)) * 100);
        for (let y = 200; y <= 1500; y += 10) {
          st.L.push(Math.max(0, depthAt(polys, 3, H - y)));
          st.R.push(Math.max(0, depthAt(polys, 1, y)));
        }
        for (let x = 60; x <= 1020; x += 10) {
          st.T.push(Math.max(0, depthAt(polys, 0, x)));
          st.B.push(Math.max(0, depthAt(polys, 2, W - x)));
        }
        st.blocks.push(polys.length);
        st.inkKB.push((spec.ink ?? '').length / 1024);
        st.sliver += sliver;
      }
    }
  }
}
console.log(`${n} paint edges checked (3 presets x 5 amounts x 40 seeds), ${fails} failures`);
const r = (v: number[]) => `${pct(v, 0.05).toFixed(0)} / ${pct(v, 0.5).toFixed(0)} / ${pct(v, 0.95).toFixed(0)}`;
console.log('preset @ amount 1, 40 seeds: p5 / median / p95');
for (const [k, s] of Object.entries(stats)) {
  console.log(`${k}: paper ${r(s.paper)} % of the frame (${r(s.vis)} % of y 180-1520); depth left ${r(s.L)}, right ${r(s.R)} (y 200-1500), top ${r(s.T)}, bottom ${r(s.B)} px; blocks ${r(s.blocks)}; ink clip ${r(s.inkKB)} KB; holes + hairlines ${s.sliver}`);
}
process.exit(fails ? 1 : 0);
