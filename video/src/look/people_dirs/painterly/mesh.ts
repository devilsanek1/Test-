// people_dirs/painterly: the 2.5D engine (dir_painterly.md "How it is built"). Every body part, garment, hair mass and
// prop is a SURFACE: a grid of 3D points (rows along the form, columns around it). The camera turns the figure (yaw) and
// projects it with a mild perspective (a person filming a person: the eye at ~0.9 H, 5 H away), so hems and soles bow
// as they do below the eye line. From the grid's normals and the rig's lights we extract, as smooth iso-contours
// (marching squares in the grid's own parameter space), the regions a painter would block in:
//   OUTLINE  the visible surface (crisp: the silhouette),
//   SHADE    the form shade away from the warm key (painted soft: blurred, then clipped by the outline),
//   HI       the key's brightest band (or a material's specular streak / the hair's sheen band),
//   RIM      the cool sky catching the edge away from the key,
//   GLOW     skin only: the warm saturated band along the terminator.
// Regions that end on the silhouette are pushed a little past it, so the blur's falloff is cut by the crisp outline and
// never leaves a pale fringe: soft edges inside, crisp silhouettes outside.
import {type V2, type V3, D2R, add, cross, dot, nrm, scl, sub} from './math';

export type Surface = {
  key: string;
  /** Material key in the person's palette. */
  mat: string;
  /** Model-space points [row][col]. */
  grid: V3[][];
  /** Columns form a closed ring. */
  wrap: boolean;
  /** An open shell (hair, an open coat): its inside (back faces) is drawn first as the UNDER layer. */
  open?: boolean;
  /** Signed inclusion per vertex (> 0 inside): a garment's hem, the hair's face window. */
  mask?: (i: number, j: number) => number;
  /** Per row, a point inside the form (outward normals point away from it). Default: the row's centroid. */
  axis?: V3[];
  /** Depth-sort bias (model units; + = drawn later). */
  bias?: number;
  /** Coarse order class, drawn in ascending order before the depth sort (default 0). */
  order?: number;
  /** Key prefixes of the surfaces this one encloses (a skirt the legs, a jacket the top, hair the head): they are
   *  always painted before it, and its inside (UNDER) right before them. The depth sort decides the rest. */
  covers?: string[];
  look?: SurfLook;
  /** Draw only the outline in one colour (lit), no light (a lens, a cable). */
  flat?: boolean;
  /** Skip the RIM on this surface. */
  noRim?: boolean;
  /** Normals from the grid's winding alone (no inside/outside test against the axis): a thin slab (a cap's brim),
   *  where the axis cannot tell up from forward. 'neg' turns them over. */
  winding?: 'pos' | 'neg';
  /** A simplified twin of the grid (the same rows and columns): the light reads its normals, mixed with the real
   *  ones by `simplify` (0 = real forms only, 1 = the simplified forms only). A painter's simplification: the face's
   *  features shade softly instead of as hard holes. */
  shadeGrid?: V3[][];
  simplify?: number;
};

export type SurfLook = {
  /** N.L below which the form is in shade (default 0.06). */
  shade?: number;
  /** N.L above which the key's highlight band is (default 0.84; > 1 = none). */
  hi?: number;
  /** A specular streak (leather, satin): (N.H)^p above t, instead of the diffuse band. */
  spec?: {p: number; t: number};
  /** Hair sheen: an anisotropic band where the strands (the rows' direction) are perpendicular to the half vector. */
  sheen?: {t: number; p?: number};
  /** N.R above which the cool rim shows (default 0.5). */
  rim?: number;
  /** Skin: the warm band along the terminator. */
  glow?: boolean;
  /** Shade blur, model units (default 7). */
  blur?: number;
};

/** The camera and the rig, in camera space (x right, y up, z toward the camera). */
export type Cam = {
  /** The figure's turn: 0 faces the camera, -90 a profile facing screen-left, 180 the back. */
  yaw: number;
  /** The eye's height (model units) and its distance: a mild perspective. */
  eyeY: number;
  D: number;
  /** px per model unit, and where the model's origin (between the feet on the ground) lands. */
  s: number;
  ox: number;
  oy: number;
  /** Unit vectors toward the key (warm) and the rim (cool sky) light. */
  L: V3;
  R: V3;
};

export const toCam = (c: Cam, p: V3): V3 => {
  const r = c.yaw * D2R;
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return [p[0] * cs + p[2] * sn, p[1], -p[0] * sn + p[2] * cs];
};
export const toScreen = (c: Cam, q: V3): V2 => {
  const k = c.D / (c.D - q[2]);
  return [c.ox + c.s * q[0] * k, c.oy - c.s * (c.eyeY + (q[1] - c.eyeY) * k)];
};
export const project = (c: Cam, p: V3): V2 => toScreen(c, toCam(c, p));

// ---------------------------------------------------------------- the projected surface

export type PS = {
  sf: Surface;
  rows: number;
  cols: number;
  /** Camera-space points, screen points, vertex normals (camera space, outward), view vectors. */
  Q: V3[];
  S: V2[];
  N: V3[];
  /** Per-vertex N.V, N.L, N.R, N.H, sheen term, mask. */
  ndv: Float64Array;
  ndl: Float64Array;
  ndr: Float64Array;
  ndh: Float64Array;
  sheen: Float64Array;
  mask: Float64Array | null;
  /** Mean camera depth of the visible part (for sorting). */
  zFront: number;
  zBack: number;
  hasFront: boolean;
  hasBack: boolean;
};

const id = (ps: {cols: number}, i: number, j: number) => i * ps.cols + j;

export function projectSurface(sf: Surface, c: Cam): PS {
  const rows = sf.grid.length;
  const cols = sf.grid[0].length;
  const n = rows * cols;
  const Q: V3[] = new Array(n);
  const S: V2[] = new Array(n);
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const q = toCam(c, sf.grid[i][j]);
      Q[i * cols + j] = q;
      S[i * cols + j] = toScreen(c, q);
    }
  const ax: V3[] = [];
  for (let i = 0; i < rows; i++) {
    if (sf.axis) ax.push(toCam(c, sf.axis[i]));
    else {
      const s: V3 = [0, 0, 0];
      for (let j = 0; j < cols; j++) {
        const q = Q[i * cols + j];
        s[0] += q[0];
        s[1] += q[1];
        s[2] += q[2];
      }
      ax.push(scl(s, 1 / cols));
    }
  }
  const N: V3[] = new Array(n);
  const cam: V3 = [0, c.eyeY, c.D];
  const ndv = new Float64Array(n);
  const ndl = new Float64Array(n);
  const ndr = new Float64Array(n);
  const ndh = new Float64Array(n);
  const sheen = new Float64Array(n);
  const P = (i: number, j: number) => {
    const ii = Math.max(0, Math.min(rows - 1, i));
    let jj = j;
    if (sf.wrap) jj = ((j % cols) + cols) % cols;
    else jj = Math.max(0, Math.min(cols - 1, j));
    return Q[ii * cols + jj];
  };
  // pole rows (a ring shrunk to a point: the crown, a fingertip): their normal is the axis's own direction
  const ringR: number[] = [];
  for (let i = 0; i < rows; i++) {
    let r = 0;
    for (let j = 0; j < cols; j++) {
      const q = Q[i * cols + j];
      r += Math.hypot(q[0] - ax[i][0], q[1] - ax[i][1], q[2] - ax[i][2]);
    }
    ringR.push(r / cols);
  }
  const rMax = Math.max(...ringR, 1e-6);
  const pole = (i: number) => ringR[i] < rMax * 0.14 && (i === 0 || i === rows - 1 || ringR[i] < rMax * 0.06);
  // the simplified twin's normals (camera space), if any
  let N2: V3[] | null = null;
  if (sf.shadeGrid) {
    N2 = new Array(n);
    const Q2: V3[] = new Array(n);
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) Q2[i * cols + j] = toCam(c, sf.shadeGrid[i][j]);
    const P2 = (i: number, j: number) => {
      const ii = Math.max(0, Math.min(rows - 1, i));
      const jj = sf.wrap ? ((j % cols) + cols) % cols : Math.max(0, Math.min(cols - 1, j));
      return Q2[ii * cols + jj];
    };
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) {
        let nn = cross(sub(P2(i, j + 1), P2(i, j - 1)), sub(P2(i + 1, j), P2(i - 1, j)));
        const radial = sub(Q2[i * cols + j], ax[i]);
        if (Math.hypot(nn[0], nn[1], nn[2]) < 1e-6) nn = radial;
        if (dot(nn, radial) < 0) nn = scl(nn, -1);
        N2[i * cols + j] = nrm(nn);
      }
  }
  const mixK = sf.simplify ?? 0.5;
  let zf = 0;
  let nf = 0;
  let zb = 0;
  let nb = 0;
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const k = i * cols + j;
      const q = Q[k];
      const du = sub(P(i, j + 1), P(i, j - 1));
      const dv = sub(P(i + 1, j), P(i - 1, j));
      let nn = cross(du, dv);
      const radial = sub(q, ax[i]);
      if (Math.hypot(nn[0], nn[1], nn[2]) < 1e-6) nn = radial;
      if (sf.winding) {
        if (sf.winding === 'neg') nn = scl(nn, -1);
      } else if (dot(nn, radial) < 0) nn = scl(nn, -1);
      let N0 = nrm(nn);
      if (pole(i) && rows > 2) {
        const out = i < rows / 2 ? sub(ax[i], ax[Math.min(rows - 1, i + 2)]) : sub(ax[i], ax[Math.max(0, i - 2)]);
        const w = ringR[i] / (rMax * 0.14);
        N0 = nrm(add(scl(nrm(out), 1 - w), scl(N0, w)));
      }
      N[k] = N0;
      const v = nrm(sub(cam, q));
      ndv[k] = dot(N0, v);
      // the light reads the simplified forms where a twin is given (the silhouette keeps the real ones)
      const NL = N2 && !pole(i) ? nrm(add(scl(N2[k], mixK), scl(N0, 1 - mixK))) : N0;
      ndl[k] = dot(NL, c.L);
      ndr[k] = dot(NL, c.R);
      const H = nrm(add(c.L, v));
      ndh[k] = dot(NL, H);
      // the strands run along the rows: the sheen is where they are perpendicular to the half vector
      const T = nrm(dv);
      const th = dot(T, H);
      sheen[k] = Math.sqrt(Math.max(0, 1 - th * th)) * Math.max(0, ndl[k] + 0.15);
      if (ndv[k] > 0) {
        zf += q[2];
        nf++;
      } else {
        zb += q[2];
        nb++;
      }
    }
  let mask: Float64Array | null = null;
  if (sf.mask) {
    mask = new Float64Array(n);
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) mask[i * cols + j] = sf.mask(i, j);
  }
  return {sf, rows, cols, Q, S, N, ndv, ndl, ndr, ndh, sheen, mask, zFront: nf ? zf / nf : zb / Math.max(1, nb), zBack: nb ? zb / nb : zf / Math.max(1, nf), hasFront: nf > 0, hasBack: nb > 0};
}

// ---------------------------------------------------------------- regions: marching squares on min(fields)

export const TAG = {CONTOUR: 1, GRID: 2, MASK: 3, INNER: 4} as const;
export type Field = {v: ArrayLike<number>; tag: number};
export type Loop = V2[];

/**
 * The region where every field is > 0, as closed loops in screen space (orientation: positive area = the region).
 * `ext` (px) pushes the loop's vertices that lie on an OUTER edge (a CONTOUR, the GRID's end, a MASK) outward, so a
 * blurred fill keeps its full value up to the crisp clip.
 */
export function extract(ps: PS, fields: Field[], ext = 0): Loop[] {
  const {rows, cols, S, N} = ps;
  const wrap = ps.sf.wrap;
  // padded grid: one virtual row above and below, and (if not wrapping) one virtual column each side
  const PR = rows + 2;
  const PC = wrap ? cols : cols + 2;
  const real = (pi: number, pj: number): [number, number] | null => {
    const i = pi - 1;
    const j = wrap ? pj : pj - 1;
    if (i < 0 || i >= rows || j < 0 || j >= cols) return null;
    return [i, j];
  };
  const clampReal = (pi: number, pj: number): [number, number] => {
    const i = Math.max(0, Math.min(rows - 1, pi - 1));
    const j = wrap ? pj : Math.max(0, Math.min(cols - 1, pj - 1));
    return [i, j];
  };
  const g = new Float64Array(PR * PC);
  const tag = new Int8Array(PR * PC);
  for (let pi = 0; pi < PR; pi++)
    for (let pj = 0; pj < PC; pj++) {
      const r = real(pi, pj);
      const k = pi * PC + pj;
      if (!r) {
        g[k] = -1;
        tag[k] = TAG.GRID;
        continue;
      }
      const vk = r[0] * cols + r[1];
      let m = Infinity;
      let t: number = TAG.INNER;
      for (const f of fields) {
        const x = f.v[vk];
        if (x < m) {
          m = x;
          t = f.tag;
        }
      }
      g[k] = m === 0 ? -1e-9 : m;
      tag[k] = t;
    }
  // crossing points, memoised per edge: edge key = (pi * PC + pj) * 2 + (0 horizontal | 1 vertical)
  type X = {p: V2; e: number};
  const memo = new Map<number, X>();
  const outward = (ri: number, rj: number, pi: number, pj: number): V2 => {
    // a GRID crossing sits on a real boundary vertex: its outward direction points from the interior neighbour
    const i = ri;
    const j = rj;
    let di = 0;
    let dj = 0;
    if (pi - 1 < 0) di = -1;
    else if (pi - 1 >= rows) di = 1;
    if (!wrap) {
      if (pj - 1 < 0) dj = -1;
      else if (pj - 1 >= cols) dj = 1;
    }
    const a = S[i * cols + j];
    const ni = Math.max(0, Math.min(rows - 1, i - di));
    const nj = Math.max(0, Math.min(cols - 1, j - dj));
    const b = S[ni * cols + nj];
    let v: V2 = [a[0] - b[0], a[1] - b[1]];
    let l = Math.hypot(v[0], v[1]);
    if (l < 1e-6) {
      // a pole: use the projected normal
      const nn = N[i * cols + j];
      v = [nn[0], -nn[1]];
      l = Math.hypot(v[0], v[1]) || 1;
    }
    return [v[0] / l, v[1] / l];
  };
  const cross_ = (pa: number, pb: number, key: number): X => {
    const got = memo.get(key);
    if (got) return got;
    const ia = Math.floor(pa / PC);
    const ja = pa % PC;
    const ib = Math.floor(pb / PC);
    const jb = pb % PC;
    const ga = g[pa];
    const gb = g[pb];
    const inA = ga > 0;
    const pin = inA ? pa : pb;
    const pout = inA ? pb : pa;
    const gin = inA ? ga : gb;
    const gout = inA ? gb : ga;
    const t = gin / (gin - gout);
    const rin = clampReal(Math.floor(pin / PC), pin % PC);
    const rout = clampReal(Math.floor(pout / PC), pout % PC);
    const kin = rin[0] * cols + rin[1];
    const kout = rout[0] * cols + rout[1];
    const sa = S[kin];
    const sb = S[kout];
    let p: V2 = [sa[0] + (sb[0] - sa[0]) * t, sa[1] + (sb[1] - sa[1]) * t];
    const tg = tag[pout];
    if (ext > 0 && (tg === TAG.CONTOUR || tg === TAG.GRID || tg === TAG.MASK)) {
      let d: V2;
      if (tg === TAG.CONTOUR) {
        const na = N[kin];
        const nb = N[kout];
        const nx = na[0] + (nb[0] - na[0]) * t;
        const ny = na[1] + (nb[1] - na[1]) * t;
        const l = Math.hypot(nx, ny) || 1;
        d = [nx / l, -ny / l];
      } else if (tg === TAG.GRID && !real(Math.floor(pout / PC), pout % PC)) {
        d = outward(rin[0], rin[1], Math.floor(pout / PC), pout % PC);
      } else {
        const l = Math.hypot(sb[0] - sa[0], sb[1] - sa[1]);
        d = l > 1e-6 ? [(sb[0] - sa[0]) / l, (sb[1] - sa[1]) / l] : outward(rin[0], rin[1], Math.floor(pout / PC), pout % PC);
      }
      p = [p[0] + d[0] * ext, p[1] + d[1] * ext];
    }
    void ia;
    void ja;
    void ib;
    void jb;
    const x = {p, e: key};
    memo.set(key, x);
    return x;
  };
  // segments: from an exit crossing to an entry crossing, walking each cell a -> b -> c -> d
  const next = new Map<number, number>();
  const pt = new Map<number, V2>();
  const ncj = wrap ? PC : PC - 1;
  for (let pi = 0; pi < PR - 1; pi++)
    for (let pj = 0; pj < ncj; pj++) {
      const pj1 = (pj + 1) % PC;
      const A = pi * PC + pj;
      const B = pi * PC + pj1;
      const C = (pi + 1) * PC + pj1;
      const D = (pi + 1) * PC + pj;
      const ins = [g[A] > 0, g[B] > 0, g[C] > 0, g[D] > 0];
      const ninside = ins.filter(Boolean).length;
      if (ninside === 0 || ninside === 4) continue;
      const cornerId = [A, B, C, D];
      // edges in cycle order: AB (horizontal at row pi, col pj), BC (vertical at col pj1), CD (horizontal at row pi+1),
      // DA (vertical at col pj)
      const ekey = [(pi * PC + pj) * 2, (pi * PC + pj1) * 2 + 1, ((pi + 1) * PC + pj) * 2, (pi * PC + pj) * 2 + 1];
      const xs: {k: number; exit: boolean}[] = [];
      for (let e = 0; e < 4; e++) {
        const a = e;
        const b = (e + 1) % 4;
        if (ins[a] !== ins[b]) {
          const X = cross_(cornerId[a], cornerId[b], ekey[e]);
          pt.set(X.e, X.p);
          xs.push({k: X.e, exit: ins[a]});
        }
      }
      if (xs.length === 2) {
        const ex = xs.find((x) => x.exit)!;
        const en = xs.find((x) => !x.exit)!;
        next.set(ex.k, en.k);
      } else if (xs.length === 4) {
        const centre = (g[A] + g[B] + g[C] + g[D]) / 4 > 0;
        for (let q = 0; q < 4; q++) {
          if (!xs[q].exit) continue;
          const to = centre ? xs[(q + 1) % 4] : xs[(q + 3) % 4];
          next.set(xs[q].k, to.k);
        }
      }
    }
  // link into loops
  const loops: Loop[] = [];
  const seen = new Set<number>();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop: V2[] = [];
    let k: number | undefined = start;
    let guard = 0;
    while (k !== undefined && !seen.has(k) && guard++ < 200000) {
      seen.add(k);
      loop.push(pt.get(k)!);
      k = next.get(k);
    }
    if (loop.length >= 3) loops.push(loop);
  }
  // orientation: the region's total signed area positive
  let A = 0;
  for (const l of loops) A += area(l);
  if (A < 0) for (const l of loops) l.reverse();
  return loops;
}

export const area = (l: V2[]) => {
  let a = 0;
  for (let i = 0; i < l.length; i++) {
    const p = l[i];
    const q = l[(i + 1) % l.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
};

const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
export function pathOf(loops: Loop[]): string {
  let d = '';
  for (const l of loops) {
    if (l.length < 3) continue;
    d += `M${f1(l[0][0])} ${f1(l[0][1])}`;
    for (let i = 1; i < l.length; i++) d += `L${f1(l[i][0])} ${f1(l[i][1])}`;
    d += 'Z';
  }
  return d;
}

// ---------------------------------------------------------------- the painted regions of one surface

export type Regions = {
  outline: string;
  under: string;
  shade: string;
  hi: string;
  rim: string;
  glow: string;
  deep: string;
};

export function regionsOf(ps: PS, c: Cam, opt: {extPx: number; small: boolean}): Regions {
  const look = ps.sf.look ?? {};
  const n = ps.rows * ps.cols;
  const neg = (a: ArrayLike<number>) => {
    const r = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) r[i] = -a[i];
    return r;
  };
  const sub_ = (k: number, a: ArrayLike<number>) => {
    const r = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) r[i] = k - a[i];
    return r;
  };
  const front: Field = {v: ps.ndv, tag: TAG.CONTOUR};
  const back: Field = {v: neg(ps.ndv), tag: TAG.CONTOUR};
  const mk: Field[] = ps.mask ? [{v: ps.mask, tag: TAG.MASK}] : [];
  const open = !!ps.sf.open;
  // the outline: the visible (front-facing) surface; its edge on the contour is the silhouette
  const oFront = ps.hasFront ? extract(ps, [front, ...mk]) : [];
  // a closed form's silhouette has no holes: a fold (the inside of a bent elbow) leaves back-facing islands inside the
  // visible region; orient every loop the same way so the nonzero fill (and the clip) covers them
  if (!ps.sf.mask) for (const l of oFront) if (area(l) < 0) l.reverse();
  const outline = pathOf(oFront);
  const under = open && ps.hasBack ? pathOf(extract(ps, [back, ...mk])) : '';
  if (ps.sf.flat || !ps.hasFront) return {outline, under, shade: '', hi: '', rim: '', glow: '', deep: ''};
  const ext = opt.extPx;
  const tShade = look.shade ?? 0.06;
  const shade = pathOf(extract(ps, [front, ...mk, {v: sub_(tShade, ps.ndl), tag: TAG.INNER}], ext));
  // the core: a deeper step only on big forms at large sizes (kept subtle)
  const deep = '';
  let hi = '';
  if (look.spec) {
    const p = look.spec.p;
    const v = new Float64Array(n);
    for (let i = 0; i < n; i++) v[i] = Math.pow(Math.max(0, ps.ndh[i]), p) - look.spec.t;
    hi = pathOf(extract(ps, [front, ...mk, {v, tag: TAG.INNER}], ext));
  } else if (look.sheen) {
    const p = look.sheen.p ?? 6;
    const v = new Float64Array(n);
    for (let i = 0; i < n; i++) v[i] = Math.pow(Math.max(0, ps.sheen[i]), p) - look.sheen.t;
    hi = pathOf(extract(ps, [front, ...mk, {v, tag: TAG.INNER}], ext));
  } else if ((look.hi ?? 0.84) <= 1) {
    hi = pathOf(extract(ps, [front, ...mk, {v: sub_(0, sub_(look.hi ?? 0.84, ps.ndl)), tag: TAG.INNER}], ext));
  }
  let rim = '';
  if (!ps.sf.noRim) {
    // the rim is narrower on small figures (it must never read as a halo)
    const tR = (look.rim ?? 0.5) + (opt.small ? 0.1 : 0);
    const v = new Float64Array(n);
    // the rim lives on the side away from the key (never on a lit face)
    for (let i = 0; i < n; i++) v[i] = Math.min(ps.ndr[i] - tR, 0.32 - ps.ndl[i]);
    rim = pathOf(extract(ps, [front, ...mk, {v, tag: TAG.INNER}], ext * 0.6));
  }
  let glow = '';
  if (look.glow && !opt.small) {
    const v = new Float64Array(n);
    for (let i = 0; i < n; i++) v[i] = Math.min(ps.ndl[i] - (tShade - 0.2), tShade + 0.1 - ps.ndl[i]);
    glow = pathOf(extract(ps, [front, ...mk, {v, tag: TAG.INNER}], ext));
  }
  return {outline, under, shade, hi, rim, glow, deep};
}
