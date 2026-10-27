// geom.ts — Pip's pure 2D / 3D maths: vectors, shapes with inside tests, the union silhouette (marching squares with
// exact boundary crossings), polyline helpers and the tapered brush. No React, no colours, no time.
//
// Everything here is deterministic and allocation-light: Pip is rebuilt every frame (idle life never stops), so the
// silhouette is traced fresh each frame from the part shapes. Crossings are bisected to ~1/64 of a grid step, so the
// contour moves continuously with the shapes (no raster boil between frames).

export type V2 = [number, number];
export type V3 = [number, number, number];

export const D2R = Math.PI / 180;
export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};

// ---------------------------------------------------------------- 3D vectors

export const v3 = {
  add: (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a: V3): V3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  /** Rotate v about the unit axis k by angle a (radians), Rodrigues. */
  rot: (v: V3, k: V3, a: number): V3 => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    const kv = v3.cross(k, v);
    const kd = v3.dot(k, v) * (1 - c);
    return [v[0] * c + kv[0] * s + k[0] * kd, v[1] * c + kv[1] * s + k[1] * kd, v[2] * c + kv[2] * s + k[2] * kd];
  },
};

// ---------------------------------------------------------------- 2D helpers

export const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polyLength(p: V2[], closed = false): number {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]);
  if (closed && p.length > 1) L += dist(p[p.length - 1], p[0]);
  return L;
}

export function signedArea(p: V2[]): number {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] - p[i][0]) * (p[j][1] + p[i][1]);
  return a / 2;
}

export function centroid(p: V2[]): V2 {
  let x = 0;
  let y = 0;
  for (const q of p) {
    x += q[0];
    y += q[1];
  }
  return [x / (p.length || 1), y / (p.length || 1)];
}

/** Resample an open polyline at even spacing (keeps both ends). */
export function resample(p: V2[], step: number): V2[] {
  if (p.length < 2) return p.slice();
  const out: V2[] = [p[0]];
  let carry = 0;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    const L = dist(a, b);
    if (L < 1e-9) continue;
    let s = step - carry;
    while (s <= L) {
      const k = s / L;
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      s += step;
    }
    carry = L - (s - step);
  }
  const last = p[p.length - 1];
  if (dist(out[out.length - 1], last) > step * 0.25) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

/** Point-in-polygon (even-odd crossing). */
export function inPoly(x: number, y: number, P: V2[]): boolean {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const yi = P[i][1];
    const yj = P[j][1];
    if (yi > y !== yj > y) {
      const xi = P[i][0];
      const xj = P[j][0];
      if (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}

export type BBox = [number, number, number, number];
export function bboxOf(P: V2[], pad = 0): BBox {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of P) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
}
const inBox = (x: number, y: number, b: BBox) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];

// ---------------------------------------------------------------- shapes

/** A 2D shape: inside test + closed outline (for its fill) + a box. */
export type Shape = {
  inside: (x: number, y: number) => boolean;
  outline: V2[];
  box: BBox;
};

export function polyShape(P: V2[]): Shape {
  const box = bboxOf(P);
  return {inside: (x, y) => inBox(x, y, box) && inPoly(x, y, P), outline: P, box};
}

/** Ellipse, rotated by `rot` radians. */
export function ellipseShape(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 40): Shape {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const out: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * ry;
    out.push([cx + ex * c - ey * s, cy + ex * s + ey * c]);
  }
  const R = Math.max(rx, ry);
  const box: BBox = [cx - R, cy - R, cx + R, cy + R];
  return {
    inside: (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      const u = (dx * c + dy * s) / rx;
      const v = (-dx * s + dy * c) / ry;
      return u * u + v * v <= 1;
    },
    outline: out,
    box,
  };
}

/** A tube along a centreline with a radius per point (trunk, legs, tail): inside = within r of the polyline; outline
 *  = the two offset sides + round caps (good for a fill; the even-odd test is not used for it). */
export function tubeShape(C: V2[], R: number[]): Shape {
  const n = C.length;
  const left: V2[] = [];
  const right: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)];
    const b = C[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    left.push([C[i][0] - ty * R[i], C[i][1] + tx * R[i]]);
    right.push([C[i][0] + ty * R[i], C[i][1] - tx * R[i]]);
  }
  const cap = (p: V2, r: number, dir: V2, k = 7): V2[] => {
    // half circle around p from the left side to the right side, bulging along dir
    const base = Math.atan2(dir[1], dir[0]);
    const pts: V2[] = [];
    for (let i = 1; i < k; i++) {
      const a = base + Math.PI / 2 - (i / k) * Math.PI;
      pts.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]);
    }
    return pts;
  };
  const endDir: V2 = n > 1 ? [C[n - 1][0] - C[n - 2][0], C[n - 1][1] - C[n - 2][1]] : [1, 0];
  const startDir: V2 = n > 1 ? [C[0][0] - C[1][0], C[0][1] - C[1][1]] : [-1, 0];
  const outline: V2[] = [...left, ...cap(C[n - 1], R[n - 1], endDir), ...right.reverse(), ...cap(C[0], R[0], startDir)];
  let rmax = 0;
  for (const r of R) rmax = Math.max(rmax, r);
  const box = bboxOf(C, rmax);
  return {
    inside: (x, y) => {
      if (!inBox(x, y, box)) return false;
      for (let i = 1; i < n; i++) {
        const a = C[i - 1];
        const b = C[i];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const L2 = dx * dx + dy * dy || 1e-9;
        const k = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / L2);
        const px = a[0] + dx * k - x;
        const py = a[1] + dy * k - y;
        const r = R[i - 1] + (R[i] - R[i - 1]) * k;
        if (px * px + py * py <= r * r) return true;
      }
      return false;
    },
    outline,
    box,
  };
}

/** Implicit shape from a field f (<= 0 inside) with a known box; the outline is traced by rays from (cx, cy). */
export function fieldShape(f: (x: number, y: number) => number, cx: number, cy: number, box: BBox, n = 56): Shape {
  const out: V2[] = [];
  const Rmax = Math.hypot(box[2] - box[0], box[3] - box[1]);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let lo = 0;
    let hi = Rmax;
    for (let k = 0; k < 22; k++) {
      const m = (lo + hi) / 2;
      if (f(cx + ux * m, cy + uy * m) <= 0) lo = m;
      else hi = m;
    }
    out.push([cx + ux * lo, cy + uy * lo]);
  }
  return {inside: (x, y) => inBox(x, y, box) && f(x, y) <= 0, outline: out, box};
}

// ---------------------------------------------------------------- the union silhouette

/** Trace the boundary of the union of `inside` over `box` on a grid of `step`: marching squares on the binary field,
 *  every crossing bisected along its grid edge (exact to ~step/64). Returns every loop (the outer silhouette first,
 *  then islands and holes, largest first), each oriented with positive signedArea(); [] if nothing is inside. */
export function traceUnion(inside: (x: number, y: number) => boolean, box: BBox, step: number): V2[][] {
  const x0 = box[0] - step * 1.5;
  const y0 = box[1] - step * 1.5;
  const nx = Math.ceil((box[2] - box[0]) / step) + 4;
  const ny = Math.ceil((box[3] - box[1]) / step) + 4;
  const val = new Uint8Array(nx * ny);
  let any = false;
  for (let j = 0; j < ny; j++) {
    const y = y0 + j * step;
    for (let i = 0; i < nx; i++) {
      const v = i > 0 && j > 0 && i < nx - 1 && j < ny - 1 && inside(x0 + i * step, y) ? 1 : 0;
      val[j * nx + i] = v;
      if (v) any = true;
    }
  }
  if (!any) return [];
  // edge ids: horizontal edge (i,j)-(i+1,j) -> j*nx+i ; vertical edge (i,j)-(i,j+1) -> H + j*nx+i
  const H = nx * ny;
  const pts = new Map<number, V2>();
  const crossing = (id: number): V2 => {
    let p = pts.get(id);
    if (p) return p;
    let ax: number, ay: number, bx: number, by: number;
    if (id < H) {
      const j = Math.floor(id / nx);
      const i = id - j * nx;
      ax = x0 + i * step;
      ay = y0 + j * step;
      bx = ax + step;
      by = ay;
    } else {
      const k = id - H;
      const j = Math.floor(k / nx);
      const i = k - j * nx;
      ax = x0 + i * step;
      ay = y0 + j * step;
      bx = ax;
      by = ay + step;
    }
    let inA = inside(ax, ay);
    let lo = 0;
    let hi = 1;
    for (let s = 0; s < 6; s++) {
      const m = (lo + hi) / 2;
      const im = inside(ax + (bx - ax) * m, ay + (by - ay) * m);
      if (im === inA) lo = m;
      else hi = m;
    }
    const m = (lo + hi) / 2;
    p = [ax + (bx - ax) * m, ay + (by - ay) * m];
    pts.set(id, p);
    return p;
  };
  const adj = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    let la = adj.get(a);
    if (!la) adj.set(a, (la = []));
    la.push(b);
    let lb = adj.get(b);
    if (!lb) adj.set(b, (lb = []));
    lb.push(a);
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const tl = val[j * nx + i];
      const tr = val[j * nx + i + 1];
      const br = val[(j + 1) * nx + i + 1];
      const bl = val[(j + 1) * nx + i];
      const c = tl * 8 + tr * 4 + br * 2 + bl;
      if (c === 0 || c === 15) continue;
      const top = j * nx + i;
      const bottom = (j + 1) * nx + i;
      const left = H + j * nx + i;
      const right = H + j * nx + i + 1;
      switch (c) {
        case 1: case 14: link(left, bottom); break;
        case 2: case 13: link(bottom, right); break;
        case 3: case 12: link(left, right); break;
        case 4: case 11: link(top, right); break;
        case 6: case 9: link(top, bottom); break;
        case 7: case 8: link(left, top); break;
        case 5: case 10: {
          const mid = inside(x0 + (i + 0.5) * step, y0 + (j + 0.5) * step);
          if ((c === 5) === mid) {
            link(left, top);
            link(bottom, right);
          } else {
            link(left, bottom);
            link(top, right);
          }
          break;
        }
      }
    }
  }
  // walk loops
  const seen = new Set<number>();
  const loops: V2[][] = [];
  adj.forEach((_, start) => {
    if (seen.has(start)) return;
    const loop: V2[] = [];
    let prev = -1;
    let cur = start;
    for (let guard = 0; guard < 200000; guard++) {
      seen.add(cur);
      loop.push(crossing(cur));
      const nb = adj.get(cur) || [];
      let next = -1;
      for (const n of nb) if (n !== prev && !seen.has(n)) {
        next = n;
        break;
      }
      if (next < 0) break;
      prev = cur;
      cur = next;
    }
    if (loop.length > 3) loops.push(loop);
  });
  loops.sort((p, q) => Math.abs(signedArea(q)) - Math.abs(signedArea(p)));
  for (const l of loops) if (signedArea(l) < 0) l.reverse();
  return loops;
}

// ---------------------------------------------------------------- open strokes cut out of a closed loop

/** Cut gaps out of a closed loop. `gaps` = [centre index, half-length px]. Returns the open pieces in loop order,
 *  starting right after the first gap (so a draw-on starts at gap 0 and runs once round the loop). */
export function cutGaps(loop: V2[], gaps: [number, number][]): V2[][] {
  const n = loop.length;
  if (n < 3) return [];
  if (!gaps.length) return [[...loop, loop[0]]];
  // cumulative arc length
  const cum = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) cum[i] = cum[i - 1] + dist(loop[i - 1], loop[i % n]);
  const L = cum[n];
  const at = (s: number): V2 => {
    s = ((s % L) + L) % L;
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (cum[m] <= s) lo = m;
      else hi = m;
    }
    const k = (s - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
    const a = loop[lo];
    const b = loop[(lo + 1) % n];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  // gap windows in arc length, sorted from gap 0
  const g0 = cum[gaps[0][0]];
  const wins = gaps
    .map(([i, h]) => {
      let c = cum[i] - g0;
      c = ((c % L) + L) % L;
      return [c - h, c + h] as [number, number];
    })
    .sort((a, b) => a[0] - b[0]);
  const pieces: V2[][] = [];
  for (let k = 0; k < wins.length; k++) {
    const s0 = wins[k][1];
    const s1 = k + 1 < wins.length ? wins[k + 1][0] : L + wins[0][0];
    if (s1 - s0 < 2) continue;
    const piece: V2[] = [at(g0 + s0)];
    const steps = Math.max(2, Math.ceil((s1 - s0) / 1.2));
    for (let q = 1; q < steps; q++) piece.push(at(g0 + s0 + ((s1 - s0) * q) / steps));
    piece.push(at(g0 + s1));
    pieces.push(piece);
  }
  return pieces;
}

/** Index of the loop vertex nearest to p. */
export function nearestIndex(loop: V2[], p: V2): number {
  let bi = 0;
  let bd = Infinity;
  for (let i = 0; i < loop.length; i++) {
    const d = (loop[i][0] - p[0]) ** 2 + (loop[i][1] - p[1]) ** 2;
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi;
}

// ---------------------------------------------------------------- the brush

/** Width profile of one pen stroke at arc fraction u: a quick press-in, a long release, a seeded swell. */
export type BrushOpts = {
  /** Peak width (px). */
  w: number;
  /** Fraction of the peak at the start / end of the stroke. */
  w0?: number;
  w1?: number;
  /** Press-in and release lengths (px). */
  pressIn?: number;
  release?: number;
  /** Seeded swell (fraction of w) and its phase. */
  swell?: number;
  phase?: number;
};

/** A tapered brush polygon (one closed SVG subpath) along an open polyline. `upto` (px of arc) draws only the first
 *  part (pen draw-on), `from` (px) starts later (ink retract). Returns '' when nothing is visible. */
export function brushPath(P: V2[], o: BrushOpts, from = 0, upto = Infinity): string {
  if (P.length < 2) return '';
  const n = P.length;
  const cum: number[] = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + dist(P[i - 1], P[i]));
  const L = cum[n - 1];
  const a = Math.max(0, from);
  const b = Math.min(L, upto);
  if (b - a < 0.6) return '';
  const pin = o.pressIn ?? Math.min(6, L * 0.18);
  const rel = o.release ?? Math.min(14, L * 0.35);
  const w0 = o.w0 ?? 0.35;
  const w1 = o.w1 ?? 0.25;
  const sw = o.swell ?? 0.1;
  const ph = o.phase ?? 0;
  const width = (s: number) => {
    let k = 1;
    if (s < pin) k = lerp(w0, 1, smooth(s / pin));
    if (L - s < rel) k = Math.min(k, lerp(w1, 1, smooth((L - s) / rel)));
    return o.w * k * (1 + sw * Math.sin((s / Math.max(30, L)) * Math.PI * 2 + ph));
  };
  // the visible window's points
  const pts: V2[] = [];
  const ss: number[] = [];
  const pointAt = (s: number): V2 => {
    let i = 1;
    while (i < n - 1 && cum[i] < s) i++;
    const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k];
  };
  pts.push(pointAt(a));
  ss.push(a);
  for (let i = 0; i < n; i++)
    if (cum[i] > a + 0.05 && cum[i] < b - 0.05) {
      pts.push(P[i]);
      ss.push(cum[i]);
    }
  pts.push(pointAt(b));
  ss.push(b);
  const m = pts.length;
  const L1: V2[] = [];
  const R1: V2[] = [];
  for (let i = 0; i < m; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[Math.min(m - 1, i + 1)];
    let tx = p1[0] - p0[0];
    let ty = p1[1] - p0[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const h = width(ss[i]) / 2;
    L1.push([pts[i][0] - ty * h, pts[i][1] + tx * h]);
    R1.push([pts[i][0] + ty * h, pts[i][1] - tx * h]);
  }
  const f = (p: V2) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  let d = `M${f(L1[0])}`;
  for (let i = 1; i < m; i++) d += `L${f(L1[i])}`;
  // round end cap
  const he = width(ss[m - 1]) / 2;
  d += `A${he.toFixed(2)} ${he.toFixed(2)} 0 0 1 ${f(R1[m - 1])}`;
  for (let i = m - 2; i >= 0; i--) d += `L${f(R1[i])}`;
  const hs = width(ss[0]) / 2;
  d += `A${hs.toFixed(2)} ${hs.toFixed(2)} 0 0 1 ${f(L1[0])}Z`;
  return d;
}

/** Closed polygon -> SVG path. */
export function polyPath(P: V2[]): string {
  if (P.length < 3) return '';
  let d = `M${P[0][0].toFixed(2)} ${P[0][1].toFixed(2)}`;
  for (let i = 1; i < P.length; i++) d += `L${P[i][0].toFixed(2)} ${P[i][1].toFixed(2)}`;
  return d + 'Z';
}
