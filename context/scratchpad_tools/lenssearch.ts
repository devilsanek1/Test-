import {pageAt} from '/home/user/Test-/video/src/scenes/scene06/page';
import {LENS_OUT} from '/home/user/Test-/video/src/scenes/scene07/lens';
const CAP: Record<number, number[][]> = {
  660: [[317, 417, 195, 838], [441, 540, 201, 792], [422, 528, 489, 861]],
  661: [[280, 375, 201, 792], [280, 363, 489, 861], [462, 561, 112, 929]],
  662: [[280, 322, 201, 792], [409, 508, 112, 929]],
  663: [[280, 294, 201, 792], [381, 480, 112, 929]],
};
function margin(fr: number): {m: number; s: number} {
  const p = pageAt(fr / 30);
  if (!p) return {m: 999, s: 1};
  const th = (p.rot * Math.PI) / 180;
  const P = (x: number, y: number) => [p.x + p.s * (x * Math.cos(th) - y * Math.sin(th)), p.y + p.s * (x * Math.sin(th) + y * Math.cos(th))];
  const pts: number[][] = [];
  for (let i = 0; i < 80; i++) pts.push(P(-105 + (178.5 * i) / 79, -135));
  for (let i = 0; i < 20; i++) pts.push(P(73.5 + (31.5 * i) / 19, -135 + (31.5 * i) / 19));
  for (let i = 0; i < 40; i++) pts.push(P(105, -103.5 + (238.5 * i) / 39));
  for (let i = 0; i < 40; i++) for (const dy of [-3.2, 0, 3.2]) pts.push(P(-75.6 + (71.4 * i) / 39, -89 + dy));
  if (p.s < 4) for (let i = 0; i < 40; i++) { pts.push(P(-75.6 + (121.8 * i) / 39, -70.2)); pts.push(P(-75.6 + (96.6 * i) / 39, -55.4)); }
  let m = 999;
  for (const b of CAP[fr] ?? []) for (const [x, y] of pts) {
    if (x < b[2] || x > b[3]) continue;
    const d = y < b[0] ? b[0] - y : y > b[1] ? y - b[1] : -Math.min(y - b[0], b[1] - y);
    m = Math.min(m, d);
  }
  return {m, s: p.s};
}
const res: string[] = [];
for (let mi = 1.0; mi <= 2.2; mi += 0.05) for (let pi = 1.0; pi <= 2.0; pi += 0.05) {
  LENS_OUT.inPow = mi; LENS_OUT.pow = pi;
  const ms = [660, 661, 662, 663].map(margin);
  const minM = Math.min(...ms.map((x) => x.m));
  const ss = [8.112, ...[661, 662, 663, 664].map((fr) => pageAt(fr / 30)!.s), 1];
  const ratios = ss.slice(1).map((v, i) => v / ss[i]);
  const spread = Math.max(...ratios) - Math.min(...ratios);
  if (minM >= 6) res.push(`${minM.toFixed(1).padStart(6)} m ${mi.toFixed(2)} p ${pi.toFixed(2)} s ${ss.map((v) => v.toFixed(2)).join(' ')} r ${ratios.map((v) => v.toFixed(2)).join(' ')} spread ${spread.toFixed(2)}`);
}
res.sort((a, b) => parseFloat(a.split('spread ')[1]) - parseFloat(b.split('spread ')[1]));
console.log(res.slice(0, 25).join('\n'));
