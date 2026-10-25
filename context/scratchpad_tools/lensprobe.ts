import {pageAt} from '/home/user/Test-/video/src/scenes/scene06/page';
// caption glyph boxes per film frame (caption mask, measured): [y0, y1, x0, x1]
const CAP: Record<number, number[][]> = {
  659: [[317, 417, 195, 838], [441, 540, 201, 792], [422, 528, 489, 861]],
  660: [[317, 417, 195, 838], [441, 540, 201, 792], [422, 528, 489, 861]],
  661: [[280, 375, 201, 792], [280, 363, 489, 861], [462, 561, 112, 929]],
  662: [[280, 322, 201, 792], [409, 508, 112, 929]],
  663: [[280, 294, 201, 792], [381, 480, 112, 929]],
};
const w = 210, h = 270, f = 31.5;
for (const fr of [659, 660, 661, 662, 663, 664, 665]) {
  const T = fr / 30;
  const p = pageAt(T);
  if (!p) { console.log(fr, 'landed'); continue; }
  const th = (p.rot * Math.PI) / 180;
  const P = (x: number, y: number) => [p.x + p.s * (x * Math.cos(th) - y * Math.sin(th)), p.y + p.s * (x * Math.sin(th) + y * Math.cos(th))];
  const bar = 6.4;
  const feats: Record<string, number[][]> = {
    top: Array.from({length: 60}, (_, i) => P(-105 + (178.5 * i) / 59, -135)),
    ear: Array.from({length: 20}, (_, i) => P(73.5 + (31.5 * i) / 19, -135 + (31.5 * i) / 19)),
    right: Array.from({length: 40}, (_, i) => P(105, -103.5 + (238.5 * i) / 39)),
    left: Array.from({length: 40}, (_, i) => P(-105, -135 + (270 * i) / 39)),
  };
  const barPts: number[][] = [];
  for (let i = 0; i < 30; i++) for (const dy of [-bar / 2, 0, bar / 2]) barPts.push(P(-75.6 + (71.4 * i) / 29, -89 + dy));
  feats.bar = barPts;
  if (p.s < 4) {
    feats.rules = [...Array.from({length: 30}, (_, i) => P(-75.6 + (121.8 * i) / 29, -70.2)), ...Array.from({length: 30}, (_, i) => P(-75.6 + (96.6 * i) / 29, -55.4))];
  }
  const hits: string[] = [];
  for (const [k, pts] of Object.entries(feats)) {
    for (const b of CAP[fr] ?? []) {
      const n = pts.filter(([x, y]) => x >= b[2] && x <= b[3] && y >= b[0] - 4 && y <= b[1] + 4).length;
      if (n) hits.push(`${k}x${n}@[${b.join(',')}]`);
    }
  }
  const ys = (k: string) => feats[k].filter(([x]) => x > 0 && x < 1080).map(([, y]) => y);
  const rng = (k: string) => { const v = ys(k); return v.length ? `${Math.min(...v).toFixed(0)}..${Math.max(...v).toFixed(0)}` : '-'; };
  console.log(fr, T.toFixed(4), 's', p.s.toFixed(3), 'rot', p.rot.toFixed(2), 'c', p.x.toFixed(1), p.y.toFixed(1), 'top', rng('top'), 'bar', rng('bar'), 'ear', rng('ear'), hits.join(' ') || 'CLEAN');
}
for (const T of [21.985, 22.0183, 22.0517]) {
  const p = pageAt(T)!;
  console.log('S07comp', T, p && p.s.toFixed(3));
}
