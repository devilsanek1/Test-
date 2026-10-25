import {edgeSpec} from '/home/user/Test-/video/src/lib/edges/variants';
import type {Pt} from '/home/user/Test-/video/src/lib/sketch';
const [v, seed, amt] = process.argv.slice(2);
const spec = edgeSpec(v as never, seed, Number(amt));
const polys = spec.colourPolys!;
function spans(polys: Pt[][], c: number, vertical: boolean): [number, number][] {
  const iv: [number, number][] = [];
  for (const p of polys) { const xs: number[] = [];
    for (let i = 0; i < p.length; i++) { const a = p[i]; const b = p[(i + 1) % p.length];
      const [ay, by, ax, bx] = vertical ? [a[0], b[0], a[1], b[1]] : [a[1], b[1], a[0], b[0]];
      if (ay > c === by > c) continue; xs.push(ax + ((bx - ax) * (c - ay)) / (by - ay)); }
    xs.sort((m, n) => m - n); for (let i = 0; i + 1 < xs.length; i += 2) iv.push([xs[i], xs[i + 1]]); }
  iv.sort((m, n) => m[0] - n[0]); const out: [number, number][] = [];
  for (const s of iv) { const l = out[out.length - 1]; if (l && s[0] <= l[1] + 0.5) l[1] = Math.max(l[1], s[1]); else out.push([s[0], s[1]]); }
  return out; }
for (const vertical of [false, true]) {
  const len = vertical ? 1920 : 1080;
  for (let c = 1; c < (vertical ? 1080 : 1920); c += 2) {
    const sp = spans(polys, c, vertical); let x = 0;
    const runs: [number, number, boolean][] = [];
    for (const [a0, b] of sp) { const a = Math.min(a0, len); if (a > x) runs.push([x, a, x <= 0 || a >= len]); x = Math.max(x, b); if (x >= len) break; }
    if (x < len) runs.push([x, len, true]);
    for (const [a, b, e] of runs) { const w = b - a; if ((!e && w < 12) || (e && w < 6 && w > 0.5)) console.log(vertical ? 'col' : 'row', c, a.toFixed(1), b.toFixed(1), e ? 'edge' : 'interior'); }
  }
}
