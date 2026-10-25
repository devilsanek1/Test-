import {rng} from '/home/user/Test-/video/src/lib/rng';
for (const [seed, head, sd] of [['s03/nearL', 104, 1], ['s03/nearR', 112, -1]] as [string, number, number][]) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const s = head / (hr * 2);
  const hw = w / 2, d = 0.18 * w;
  const hx = sd * (hw - d * 0.5) * s;
  const hy = s * (0.86 * hr + 1.135 * w);
  const cuffY = s * (0.86 * hr + 1.05 * w);
  console.log(seed, {w: w.toFixed(1), hr: hr.toFixed(1), s: s.toFixed(3), handDx: hx.toFixed(1), handDy: hy.toFixed(1), cuffDy: cuffY.toFixed(1), handRx: (0.075*w*s).toFixed(1), handRy: (0.1*w*s).toFixed(1), d: (d*s).toFixed(1), round});
}
