import {edgeSpec} from '/home/user/Test-/video/src/lib/edges/variants';
const range = (v: number[]) => `${Math.min(...v).toFixed(0)}-${Math.max(...v).toFixed(0)}`;
for (const v of ['trim', 'panel'] as const) for (const a of [0.6, 0.8, 1, 1.2, 1.4]) {
  const L: number[] = [], R: number[] = [], T: number[] = [];
  for (let s = 0; s < 40; s++) {
    const p = edgeSpec(v, `seed${s}`, a).colourPts!;
    const vis = p.filter((q) => q[1] > 250 && q[1] < 1450);
    L.push(...vis.filter((q) => q[0] < 540).map((q) => q[0]));
    R.push(...vis.filter((q) => q[0] > 540).map((q) => 1080 - q[0]));
    T.push(...p.filter((q) => q[1] < 300 && q[0] > 200 && q[0] < 880).map((q) => q[1]));
  }
  console.log(v, a, 'L', range(L), 'R', range(R), 'T', range(T));
}
