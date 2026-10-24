// check-paint.ts — the paint edge over many seeds, looseness values and scenes (the three lab shots' EDGE_HINTS and
// no hints at all):
//   - the colour (union of blocks) contains the caption block; no overlay stroke enters it
//   - paper beside the caption block <= 38 px (left) / 77 px (right); under the right rail (y 900-1500) <= 18 px
//   - every keep rect of the hints is inside the colour
//   - no HOLES (paper enclosed by colour, on a 1 px raster of the union: a speck between blocks) and no HAIRLINES
//     (paper < 6 px along a frame edge)
//   - JOGS: along each side, steps of the paper depth smaller than 20 px (a glitch-like jog; the paint's steps are 0
//     or >= 26 / 40 / 48 px); reported per preset
//   - DASHES: lines parallel to a frame edge in the paper: ink-clip coverage gaps shorter than 60 px between two
//     covered stretches (a scene line parallel to the edge would show as '- - -'); reported per preset
//   - stats per preset at amount 1 (40 seeds, the three shots): paper share of the frame and of the visible zone
//     (y 180-1520), paper depth per side, bare corners, ink clip size
// Run:
//   npx esbuild review/edges/loose/final/tools/check-paint.ts --bundle --platform=node --log-level=error > /tmp/cp.cjs && node /tmp/cp.cjs [--where]
import {CAPTION_SAFE, edgeSpec, EdgeVariant} from '../../../../../src/lib/edges/variants';
import {containsRectAny, depthAt, PAINT_LIMITS, paintSpec, PAINT_LOOSENESS} from '../../../../../src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../src/lib/edges/hints';
import type {EdgeHints} from '../../../../../src/lib/edges/shared';
import type {Pt} from '../../../../../src/lib/sketch';

const W = 1080;
const H = 1920;
const [cx0, cy0, cx1, cy1] = CAPTION_SAFE;
const WHERE = process.argv.includes('--where');

/** Covered intervals of the union along a scanline (horizontal: y = c, vertical: x = c). */
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

const pct = (v: number[], q: number) => {
  const s = v.slice().sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN;
};
let fails = 0;
let n = 0;
const fail = (m: string) => {
  fails++;
  if (fails < 100000) console.log('FAIL ' + m);
};
const variants: EdgeVariant[] = ['paint-subtle', 'paint-medium', 'paint-loose'];
const scenes: [string, EdgeHints | undefined][] = [['no hints', undefined], ...(['street', 'monument', 'vista'].map((s) => [s, EDGE_HINTS[`edgelab/${s}`]]) as [string, EdgeHints][])];
type St = {paper: number[]; vis: number[]; L: number[]; R: number[]; T: number[]; B: number[]; bare: number[]; inkKB: number[]; jogs: number; dashes: number; dashLines: number; holes: number; hair: number};
const stats: Record<string, St> = {};
for (const v of variants) {
  for (const amount of [0.6, 0.8, 1, 1.2, 1.4]) {
    for (const [sceneName, hints] of scenes) {
      for (let s = 0; s < 40; s++) {
        const seed = s === 0 ? 'film' : `scene-${String(s).padStart(2, '0')}`;
        const spec = edgeSpec(v, seed, amount, {hints});
        const polys = spec.colourPolys!;
        const inkPolys = spec.inkPolys!;
        n++;
        const tag = `${v} ${seed} x${amount} [${sceneName}]`;
        if (!containsRectAny(polys, CAPTION_SAFE, 10)) fail(`${tag}: colour cuts the caption block`);
        for (const kr of hints?.keep ?? []) if (!containsRectAny(polys, kr, 8)) fail(`${tag}: keep rect ${kr} is cut`);
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
        // raster of the union
        const mask = new Uint8Array(W * H);
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
        let hx = 0;
        let hy = 0;
        for (let i = 0; i < W * H; i++)
          if (!mask[i] && !seen[i]) {
            holes++;
            hx = i % W;
            hy = (i / W) | 0;
          }
        let hair = 0;
        const hairAt: string[] = [];
        for (let y = 0; y < H; y += 2) {
          let a = 0;
          while (a < W && !mask[y * W + a]) a++;
          if (a > 0 && a < 6) (hair++, hairAt.push(`L y${y}`));
          let b = 0;
          while (b < W && !mask[y * W + W - 1 - b]) b++;
          if (b > 0 && b < 6) (hair++, hairAt.push(`R y${y}`));
        }
        for (let x = 0; x < W; x += 2) {
          let a = 0;
          while (a < H && !mask[a * W + x]) a++;
          if (a > 0 && a < 6) (hair++, hairAt.push(`T x${x}`));
          let b = 0;
          while (b < H && !mask[(H - 1 - b) * W + x]) b++;
          if (b > 0 && b < 6) (hair++, hairAt.push(`B x${x}`));
        }
        if (holes > 4) fail(`${tag}: ${holes} px of enclosed paper (holes between blocks)${WHERE ? ` e.g. at ${hx},${hy}` : ''}`);
        if (hair > 10) fail(`${tag}: ${hair} hairline scanlines at the frame edge${WHERE ? ` ${hairAt.slice(0, 4).join(' ')}` : ''}`);
        // jogs: per side, the paper depth profile (every 2 px); a jog = a level change of 6-24 px within 12 px with
        // flat paper (< 2 px change over 12 px) on both sides; consecutive windows count once
        let jogs = 0;
        for (let side = 0; side < 4; side++) {
          const len = side % 2 ? H : W;
          const d: number[] = [];
          for (let u = 1; u < len; u += 2) d.push(Math.max(0, Math.min(400, depthAt(polys, side, u))));
          let last = -100;
          for (let i = 6; i < d.length; i++) {
            const dd = Math.abs(d[i] - d[i - 6]);
            const before = Math.abs(d[i - 6] - (d[i - 12] ?? d[i - 6]));
            const after = Math.abs((d[i + 6] ?? d[i]) - d[i]);
            if (dd >= 6 && dd < 24 && before < 2 && after < 2) {
              if (i - last > 8) {
                jogs++;
                if (WHERE && jogs <= 2 && amount === 1) console.log(`  jog ${v} ${seed} [${sceneName}] side ${side} u ${i * 2 + 1}: ${d[i - 6].toFixed(0)} -> ${d[i].toFixed(0)}`);
              }
              last = i;
            }
          }
        }
        // dashes: scanlines parallel to each side at depth 4..200 px inside the paper; covered (ink) intervals of
        // the paper part; gap between two covered stretches < 60 px (and both stretches > 20 px) = a dash
        let dashes = 0;
        let dashLines = 0;
        for (let side = 0; side < 4; side++) {
          for (let dd = 4; dd <= 200; dd += 6) {
            const vertical = side === 1 || side === 3;
            const c = side === 0 ? dd : side === 1 ? W - dd : side === 2 ? H - dd : dd;
            const col = spans(polys, c, vertical);
            const ink = spans(inkPolys, c, vertical);
            const len = vertical ? H : W;
            // paper intervals = complement of col
            const paper: [number, number][] = [];
            let x = 0;
            for (const [a, b] of col) {
              if (a > x) paper.push([x, Math.min(a, len)]);
              x = Math.max(x, b);
            }
            if (x < len) paper.push([x, len]);
            let lineDash = false;
            for (const [pa, pb] of paper) {
              if (pb - pa < 80) continue;
              const cov = ink.map(([a, b]) => [Math.max(a, pa), Math.min(b, pb)]).filter(([a, b]) => b - a > 20);
              for (let i = 1; i < cov.length; i++) {
                const gap = cov[i][0] - cov[i - 1][1];
                if (gap > 1 && gap < 60) {
                  dashes++;
                  lineDash = true;
                  if (WHERE && amount === 1 && s < 2 && dashes <= 6) console.log(`  dash ${v} ${seed} [${sceneName}] side ${side} depth ${dd}: gap ${cov[i - 1][1].toFixed(0)}-${cov[i][0].toFixed(0)}`);
                }
              }
            }
            if (lineDash) dashLines++;
          }
        }
        const key = v;
        const st = (stats[key] ??= {paper: [], vis: [], L: [], R: [], T: [], B: [], bare: [], inkKB: [], jogs: 0, dashes: 0, dashLines: 0, holes: 0, hair: 0});
        st.jogs += jogs;
        st.dashes += dashes;
        st.dashLines += dashLines;
        st.holes += holes > 4 ? 1 : 0;
        st.hair += hair > 10 ? 1 : 0;
        if (amount === 1) {
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
          st.bare.push(paintSpec(seed, PAINT_LOOSENESS[v as keyof typeof PAINT_LOOSENESS], hints).meta.roles.filter((r) => r === 'bare').length);
          st.inkKB.push((spec.ink ?? '').length / 1024);
        }
      }
    }
  }
}
console.log(`${n} paint edges checked (3 presets x 5 amounts x 4 scenes (3 lab shots + no hints) x 40 seeds), ${fails} failures`);
const r = (v: number[]) => `${pct(v, 0.05).toFixed(0)} / ${pct(v, 0.5).toFixed(0)} / ${pct(v, 0.95).toFixed(0)}`;
console.log('preset @ amount 1 (4 scenes x 40 seeds): p5 / median / p95; jogs / dashes over all amounts');
for (const [k, s] of Object.entries(stats)) {
  console.log(`${k}: paper ${r(s.paper)} % of the frame (${r(s.vis)} % of y 180-1520); depth left ${r(s.L)}, right ${r(s.R)} (y 200-1500), top ${r(s.T)}, bottom ${r(s.B)} px; bare corners ${r(s.bare)}; ink clip ${r(s.inkKB)} KB; jogs 6-24 px ${s.jogs} (${(s.jogs / 200).toFixed(2)} per edge); dash gaps < 60 px ${s.dashes} (on ${s.dashLines} scanlines); edges with holes ${s.holes}, with hairlines ${s.hair}`);
}
process.exit(fails ? 1 : 0);
