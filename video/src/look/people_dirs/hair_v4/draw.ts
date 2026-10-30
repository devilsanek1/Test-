// HAIR v4: two small authoring helpers (notation, like the pen's curvature tool: every point is still placed by hand).
//   scallop  a run of curl clumps: the notches between clumps, in order; each pair is joined by ONE cubic arc that
//            bulges away from the centre c by d (u). The notches become cusps (the valleys of the edge).
//   join     smooth nodes through hand-placed points, each handle along the neighbours' chord (k = handle share).
import type {N, V2} from './bez';

export function scallop(c: V2, notches: V2[], d: number | number[], o: {inStart?: V2; outEnd?: V2} = {}): N[] {
  const n = notches.length;
  const out: N[] = [];
  const handles: {i: V2; o: V2}[] = notches.map(() => ({i: [0, 0], o: [0, 0]}));
  for (let k = 0; k < n - 1; k++) {
    const A = notches[k];
    const B = notches[k + 1];
    const ch: V2 = [B[0] - A[0], B[1] - A[1]];
    const mid: V2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    let nr: V2 = [-ch[1], ch[0]];
    const l = Math.hypot(nr[0], nr[1]) || 1;
    nr = [nr[0] / l, nr[1] / l];
    if ((mid[0] - c[0]) * nr[0] + (mid[1] - c[1]) * nr[1] < 0) nr = [-nr[0], -nr[1]];
    const dd = (Array.isArray(d) ? d[k] ?? d[d.length - 1] : d) / 0.75;
    handles[k].o = [ch[0] * 0.22 + nr[0] * dd, ch[1] * 0.22 + nr[1] * dd];
    handles[k + 1].i = [-ch[0] * 0.22 + nr[0] * dd, -ch[1] * 0.22 + nr[1] * dd];
  }
  if (o.inStart) handles[0].i = o.inStart;
  if (o.outEnd) handles[n - 1].o = o.outEnd;
  for (let k = 0; k < n; k++) out.push([notches[k][0], notches[k][1], handles[k].i[0], handles[k].i[1], handles[k].o[0], handles[k].o[1]]);
  return out;
}

export function join(pts: V2[], k = 0.3, ends?: {first?: V2; last?: V2}): N[] {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let h: V2 = [(b[0] - a[0]) * k * 0.5, (b[1] - a[1]) * k * 0.5];
    if (i === 0 && ends?.first) h = ends.first;
    if (i === n - 1 && ends?.last) h = ends.last;
    return [p[0], p[1], h[0], h[1]] as N;
  });
}
