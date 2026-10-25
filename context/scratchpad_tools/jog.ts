import {edgeSpec} from '../../../../../home/user/Test-/video/src/lib/edges/variants';
import {depthAt} from '../../../../../home/user/Test-/video/src/lib/edges/paint';
import {EDGE_HINTS} from '../../../../../home/user/Test-/video/src/lib/edges/hints';
for (const [v, shot] of [['paint-subtle', 'none'], ['paint-medium', 'street'], ['paint-loose', 'vista']]) {
  const sp = edgeSpec(v as any, 'film', 1, {hints: shot === 'none' ? undefined : EDGE_HINTS[`edgelab/${shot}`]});
  const polys = sp.colourPolys!;
  const out: string[] = [];
  for (let side = 0; side < 4; side++) {
    const len = side % 2 ? 1920 : 1080;
    const d: number[] = [];
    for (let u = 1; u < len; u += 2) d.push(Math.max(0, Math.min(400, depthAt(polys, side, u))));
    for (let i = 6; i < d.length; i++) {
      const dd = Math.abs(d[i] - d[i - 6]);
      const before = Math.abs(d[i - 6] - (d[i - 12] ?? d[i - 6]));
      const after = Math.abs((d[i + 6] ?? d[i]) - d[i]);
      if (dd > 3 && dd < 20 && before < 2 && after < 2) out.push(`s${side} u${(i * 2 + 1)} ${d[i - 6].toFixed(0)}->${d[i].toFixed(0)}`);
    }
  }
  console.log(v, shot, out.length, out.slice(0, 14).join(' | '));
}
