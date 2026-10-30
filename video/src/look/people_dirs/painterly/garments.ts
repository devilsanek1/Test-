// people_dirs/painterly: garments (dir_painterly.md "Clothing"; fashion.md). A garment is a surface built over the
// body's own rings: an ease (how far the cloth stands off the body), a HANG (below a support line the cloth no longer
// follows the body in: it falls straight from the shoulder blades, the bust, the hips), a flare toward a hem, a few
// drape folds (vertical lobes, deeper toward the hem: the light turns them into soft value bands), an open front (a
// mask, so the layer under shows), and hems that may vary around the body (a half tuck).
import {type Skeleton, type Q4, fx, fz, ring4, rowsFor, footChain, tube} from './body';
import {type V3, add, chainAt, clamp, cross, dot, hash, lerp, mix, mulMV, nrm, rotY, scl, smooth, spline, sub} from './math';
import type {Surface, SurfLook} from './mesh';

// ---------------------------------------------------------------- the legs at a height (for skirts and coats)

/** A leg's centre and radius at a world height y (the leg chain's point at that height). */
export function legAt(sk: Skeleton, side: 'L' | 'R', y: number): {c: V3; r: number} {
  const b = sk.b;
  const chain = [add(sk.hip[side], [0, 60, 0]), sk.hip[side], sk.knee[side], sk.ankle[side]];
  // walk the chain to the segment that spans y
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i];
    const c = chain[i + 1];
    if ((y <= a[1] && y >= c[1]) || i === chain.length - 2) {
      const k = clamp((a[1] - y) / (a[1] - c[1] || 1), -0.5, 1.5);
      const p = lerp(a, c, k);
      // the straight-leg height that matches: interpolate the profile by the fraction along the leg
      const yS = y + (b.hipY - sk.hip[side][1]);
      const r = (spline(b.lL, yS) + spline(b.lM, yS) + spline(b.lF, yS) + spline(b.lB, yS)) / 4;
      return {c: p, r};
    }
  }
  return {c: sk.ankle[side], r: 18};
}

// ---------------------------------------------------------------- the torso garment

export type TorsoGarment = {
  key: string;
  mat: string;
  /** The hem's height, or by the angle around the body (0 = front): a half tuck, a curved shirt tail. */
  hem: number | ((phi: number) => number);
  /** The top: the neckline's back height (default the neck's base). */
  top?: number;
  /** Ease off the body (units), by height. */
  ease: number | ((y: number) => number);
  /** The hang: below `from`, the cloth falls straight: the radii never shrink below k x their value at `from`. */
  hang?: {from: number; k?: number};
  /** Flare: extra radius per 100 units below `from` (A-line). */
  flare?: {from: number; per100: number};
  /** Dropped shoulders: the shoulder's line widened and lowered (units). */
  drop?: number;
  /** Ring exponents (higher = boxier). */
  n?: {front: number; back: number};
  /** The front's opening: half-angle (radians) by height (0 = closed). */
  open?: (y: number) => number;
  /** The neckline: how far it dips at the front (units below `top`) and its half-angle width. */
  neck?: {dip: number; width: number};
  /** Below the hips, wrap the legs (coats, long shirts, dresses). */
  wrapLegs?: boolean;
  /** Drape folds: count around, amplitude at the hem (units), where they start (height). */
  folds?: {n: number; amp: number; from: number; seed?: number};
  look?: SurfLook;
  bias?: number;
  /** What it encloses (Surface.covers); default the torso and the neck. */
  covers?: string[];
  /** Rows and columns at res 1. */
  rows?: number;
  cols?: number;
};

const valOf = (v: number | ((y: number) => number), y: number) => (typeof v === 'number' ? v : v(y));

/** The ring of the legs' hull at height y, in the pelvis's orientation. */
function hullRing(sk: Skeleton, y: number, ease: number): {o: V3; q: Q4; ax: V3; az: V3} {
  const L = legAt(sk, 'L', y);
  const R = legAt(sk, 'R', y);
  const ax = fx(sk.pelvis);
  const az = fz(sk.pelvis);
  const o: V3 = lerp(L.c, R.c, 0.5);
  const proj = (p: V3, d: V3) => dot(sub(p, o), d);
  const pL = proj(L.c, ax) + L.r + ease;
  const mR = -(proj(R.c, ax) - R.r - ease);
  const f = Math.max(proj(L.c, az) + L.r, proj(R.c, az) + R.r) + ease;
  const bk = Math.max(-(proj(L.c, az) - L.r), -(proj(R.c, az) - R.r)) + ease;
  return {o: [o[0], y, o[2]], q: {f, b: bk, p: pL, m: mR, nf: 2.2, nb: 2.2}, ax, az};
}

export function torsoGarment(sk: Skeleton, g: TorsoGarment, res: number): Surface {
  const b = sk.b;
  const top = g.top ?? (b.sex === 'f' ? 850 : 854);
  const hemAt = (phi: number) => (typeof g.hem === 'number' ? g.hem : g.hem(phi));
  // the lowest hem point decides the rows' span; each column's rows run from its own hem to the top
  const cols = rowsFor(g.cols ?? 52, res, 18);
  let low = Infinity;
  for (let k = 0; k < cols; k++) low = Math.min(low, hemAt((k / cols) * Math.PI * 2));
  const rows = rowsFor(g.rows ?? Math.round(30 + (top - low) / 14), res, 10);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const nF = g.n?.front ?? 2.3;
  const nB = g.n?.back ?? 2.6;
  // the hang's reference radii
  const radiiAt = (y: number) => {
    if (y >= 470 || !g.wrapLegs) {
      const yy = Math.max(470, y);
      const f = sk.ring(yy);
      const a = spline(b.tA, yy) * b.slim;
      return {o: f.o, ax: fx(f), az: fz(f), f: spline(b.tF, yy), bk: spline(b.tB, yy), p: a, m: a};
    }
    const h = hullRing(sk, y, 0);
    return {o: h.o, ax: h.ax, az: h.az, f: h.q.f, bk: h.q.b, p: h.q.p, m: h.q.m};
  };
  const hangRef = g.hang ? radiiAt(g.hang.from) : null;
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const row: V3[] = [];
    // each column's own height (so a varying hem is exact); the ring's shape is evaluated per column
    let oAvg: V3 = [0, 0, 0];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      const y = mix(hemAt(phi), top, Math.pow(t, 1.0));
      const r = radiiAt(y);
      const e = valOf(g.ease, y);
      let f = r.f + e;
      let bk = r.bk + e;
      let p = r.p + e;
      let m = r.m + e;
      if (hangRef && y < g.hang!.from) {
        const kk = g.hang!.k ?? 1;
        const w = smooth(g.hang!.from, g.hang!.from - 60, y);
        f = Math.max(f, mix(f, (hangRef.f + e) * kk, w));
        bk = Math.max(bk, mix(bk, (hangRef.bk + e) * kk, w));
        p = Math.max(p, mix(p, (hangRef.p + e) * kk, w));
        m = Math.max(m, mix(m, (hangRef.m + e) * kk, w));
      }
      if (g.flare && y < g.flare.from) {
        const ex = ((g.flare.from - y) / 100) * g.flare.per100;
        f += ex * 0.8;
        bk += ex * 0.9;
        p += ex;
        m += ex;
      }
      if (g.drop && y > 760) {
        const w = smooth(760, 815, y) * (1 - smooth(830, 850, y));
        p += g.drop * w;
        m += g.drop * w;
      }
      // the neckline: near the top the ring closes in toward the neck (a soft roll of cloth)
      const q: Q4 = {f, b: bk, p, m, nf: nF, nb: nB};
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      const n = c >= 0 ? q.nf! : q.nb!;
      const sp = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
      let fz0 = sp(c) * (c >= 0 ? q.f : q.b);
      let fx0 = sp(s) * (s >= 0 ? q.p : q.m);
      // drape folds: vertical lobes, deeper toward the hem; on the sides and the back more than the front
      if (g.folds && y < g.folds.from) {
        const depth = smooth(g.folds.from, g.folds.from - 220, y);
        const sd = g.folds.seed ?? 3;
        const lobes = Math.sin(g.folds.n * phi + sd) * 0.6 + Math.sin(g.folds.n * 1.7 * phi + sd * 2.1) * 0.4;
        const amp = g.folds.amp * depth * (0.55 + 0.45 * (1 - Math.max(0, c)));
        const l = Math.hypot(fx0, fz0) || 1;
        const dd = amp * lobes;
        fx0 += (fx0 / l) * dd;
        fz0 += (fz0 / l) * dd;
      }
      const pt = add(r.o, add(scl(r.az, fz0), scl(r.ax, fx0)));
      row.push(pt);
      oAvg = add(oAvg, r.o);
    }
    grid.push(row);
    axis.push(scl(oAvg, 1 / cols));
  }
  // the open front and the neckline: masks on the angle around (0 = the front) and the height
  const mask = (i: number, j: number) => {
    const phi = (j / cols) * Math.PI * 2;
    const ang = Math.atan2(Math.sin(phi), Math.cos(phi));
    const y = grid[i][j][1];
    let v = 1;
    if (g.open) v = Math.min(v, Math.abs(ang) - g.open(y));
    if (g.neck) {
      // the neckline's front dip: a curve from the back's top down to the front's dip
      const depth = g.neck.dip * Math.max(0, Math.cos(ang * (Math.PI / 2) / Math.max(0.2, g.neck.width)));
      v = Math.min(v, (top - depth - y) / 30);
    }
    return v;
  };
  return {key: g.key, mat: g.mat, grid, axis, wrap: true, open: !!g.open || !!g.neck, mask: g.open || g.neck ? mask : undefined, look: g.look, bias: g.bias, covers: g.covers ?? ['torso', 'neck']};
}

// ---------------------------------------------------------------- sleeves

export type Sleeve = {
  key: string;
  mat: string;
  /** From the shoulder (distance along the arm; -30 = over the shoulder's top) to the cuff. */
  from?: number;
  to: number;
  /** Ease by distance along the arm, and an extra roomy hang below the elbow. */
  ease: number | ((d: number) => number);
  /** Dropped shoulder: the seam's distance down the arm (the sleeve is wider at the top). */
  drop?: number;
  /** A pushed-up sleeve: bunched folds near the cuff. */
  bunch?: number;
  look?: SurfLook;
  bias?: number;
};

export function sleeveSurface(sk: Skeleton, side: 'L' | 'R', sl: Sleeve, res: number): Surface {
  const b = sk.b;
  const s = side === 'L' ? 1 : -1;
  const sh = sk.shoulder[side];
  const el = sk.elbow[side];
  const wr = sk.wrist[side];
  // the sleeve's head: a dome over the shoulder joint, standing off the arm's own cap by the ease
  const CAP = 30;
  const upv = nrm(sub(sh, el));
  const ext = add(sh, scl(upv, CAP));
  const chain = [ext, sh, el, wr];
  const len0 = b.upperArm + b.foreArm + CAP;
  const from = sl.from ?? -CAP;
  const tA = clamp((from + CAP) / len0, 0, 0.98);
  const tB = clamp((sl.to + CAP) / len0, tA + 0.02, 1);
  const rows = rowsFor(Math.round(40 * (tB - tA)) + 8, res, 7);
  const cols = rowsFor(26, res, 10);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const ap = sk.pose.arms[side];
  const palm = ap.palm ? nrm(ap.palm) : ([-s, 0, 0] as V3);
  const Lc = (() => {
    let l = 0;
    for (let i = 1; i < chain.length; i++) l += Math.hypot(...(sub(chain[i], chain[i - 1]) as [number, number, number]));
    return l;
  })();
  const withCap = tA < 0.01;
  for (let i = 0; i < rows; i++) {
    const x = i / (rows - 1);
    const t = mix(tA, tB, withCap ? Math.pow(x, 1.35) : x);
    const {p, d} = chainAt(chain, t);
    const dist = t * Lc - CAP;
    const tw = smooth(b.upperArm * 0.7, b.upperArm + b.foreArm, dist);
    const thumb = nrm(scl(cross(palm, d), s));
    const lat = nrm(lerp([s, 0, 0], thumb, tw * 0.6));
    const ax = nrm(sub(lat, scl(d, dot(lat, d))));
    let az = nrm(cross(d, ax));
    const back = nrm(lerp([0, 0, 1], scl(palm, -1), tw * 0.6));
    if (dot(az, back) < 0) az = scl(az, -1);
    const dd = Math.max(0, dist);
    const e = valOf(sl.ease, dd);
    // a dropped shoulder: the head is wider and sits lower (the seam slides down the arm)
    const dropK = sl.drop ? 1 - smooth(0, sl.drop, dd) : 0;
    const cap = dist < 0 ? Math.sqrt(Math.max(0.0025, 1 - (dist / CAP) ** 2)) : 1;
    // cloth rounds the arm: equal-ish radii, a little more ease at the back of the elbow
    const rf = (spline(b.aF, dd) + e + 6 * dropK) * cap;
    const rb = (spline(b.aB, dd) + e * 1.15 + 6 * dropK) * cap;
    const rl = (spline(b.aL, dd) + e + 10 * dropK) * cap;
    const rm = (spline(b.aM, dd) + e * 0.9 + 4 * dropK) * cap;
    const bunch = sl.bunch ? sl.bunch * smooth(sl.to - 70, sl.to - 5, dist) : 0;
    const q: Q4 = {f: rf + bunch, b: rb + bunch, p: rl + bunch, m: rm + bunch, nf: 2.1, nb: 2.1};
    const disp = sl.bunch ? (phi: number) => bunch * 0.35 * Math.sin(phi * 3 + dist * 0.25) : undefined;
    grid.push(ring4(p, ax, az, q, cols, 0, disp));
    axis.push(p);
  }
  return {
    key: sl.key + side,
    mat: sl.mat,
    grid,
    axis,
    wrap: true,
    open: true,
    covers: [`arm${side}`, `hand${side}`, `thumb${side}`],
    look: sl.look,
    bias: sl.bias,
  };
}

// ---------------------------------------------------------------- skirts

export type Skirt = {
  key: string;
  mat: string;
  waist: number;
  hem: number;
  /** Ease at the hips (cling) and the half-width at the hem. */
  ease: number;
  hemHalf: number;
  folds?: {n: number; amp: number; seed?: number};
  look?: SurfLook;
  bias?: number;
  covers?: string[];
};

export function skirtSurface(sk: Skeleton, sl: Skirt, res: number): Surface {
  const b = sk.b;
  const rows = rowsFor(Math.round(26 + (sl.waist - sl.hem) / 14), res, 10);
  const cols = rowsFor(56, res, 18);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const y = mix(sl.hem, sl.waist, t);
    // the hips' ring above the crotch, the legs' hull below; the cloth falls from the widest hip (no pinch under it)
    let o: V3;
    let ax: V3;
    let az: V3;
    let q: Q4;
    const hip = sk.ring(Math.max(470, Math.min(y, 640)));
    const yHip = 520;
    if (y >= 470) {
      const yy = y;
      const a = spline(b.tA, Math.max(yy, y < yHip ? yHip : yy)) * b.slim;
      const yr = y < yHip ? yHip : y;
      q = {f: spline(b.tF, yr) + sl.ease, b: spline(b.tB, yr) + sl.ease, p: a + sl.ease, m: a + sl.ease, nf: 2.2, nb: 2.3};
      o = sk.ring(y).o;
      ax = fx(hip);
      az = fz(hip);
    } else {
      const h = hullRing(sk, y, sl.ease + 4);
      const ref = {f: spline(b.tF, yHip) + sl.ease, b: spline(b.tB, yHip) + sl.ease, a: spline(b.tA, yHip) * b.slim + sl.ease};
      const k = smooth(470, sl.hem, y);
      const half = mix(ref.a, sl.hemHalf, k);
      const hipC = sk.ring(470).o;
      o = lerp(hipC, h.o, smooth(470, sl.hem + 60, y) * 0.85);
      o = [o[0], y, o[2]];
      ax = h.ax;
      az = h.az;
      const fz0 = mix(ref.f, ref.f + (sl.hemHalf - ref.a) * 0.7, k);
      const bz0 = mix(ref.b, ref.b + (sl.hemHalf - ref.a) * 0.6, k);
      // never inside the legs' hull
      q = {
        f: Math.max(fz0, h.q.f + dot(sub(h.o, o), az)),
        b: Math.max(bz0, h.q.b - dot(sub(h.o, o), az)),
        p: Math.max(half, h.q.p + dot(sub(h.o, o), ax)),
        m: Math.max(half, h.q.m - dot(sub(h.o, o), ax)),
        nf: 2.15,
        nb: 2.15,
      };
    }
    let disp: ((phi: number) => number) | undefined;
    if (sl.folds) {
      const depth = smooth(500, sl.hem, y);
      const sd = sl.folds.seed ?? 1.3;
      const amp = sl.folds.amp * depth;
      disp = (phi: number) => amp * (Math.sin(sl.folds!.n * phi + sd) * 0.62 + Math.sin(sl.folds!.n * 1.6 * phi + sd * 2.7) * 0.38) * (0.6 + 0.4 * (1 - Math.max(0, Math.cos(phi))));
    }
    grid.push(ring4(o, ax, az, q, cols, 0, disp));
    axis.push(o);
  }
  return {key: sl.key, mat: sl.mat, grid, axis, wrap: true, look: sl.look, bias: sl.bias, covers: sl.covers ?? ['leg', 'torso', 'top']};
}

// ---------------------------------------------------------------- trousers

export type Trousers = {
  key: string;
  mat: string;
  waist: number;
  /** The hem's height above the sole (0-25: touching the shoe). */
  hem: number;
  /** Ease at the seat and the thigh; the leg's half-width from the knee down (straight) or from the hip (wide). */
  ease: number;
  legHalf: number;
  cut: 'straight' | 'wide' | 'slim';
  /** Stack at the ankle: soft zigzag folds in the lowest units. */
  stack?: number;
  look?: SurfLook;
  bias?: number;
  covers?: string[];
};

export function trouserSurfaces(sk: Skeleton, tr: Trousers, res: number): Surface[] {
  const b = sk.b;
  const out: Surface[] = [];
  // the seat: from the crotch to the waistband
  const rows = rowsFor(16, res, 6);
  const cols = rowsFor(48, res, 16);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const y = mix(468, tr.waist, i / (rows - 1));
    const f = sk.ring(y);
    const a = spline(b.tA, y) * b.slim;
    const q: Q4 = {f: spline(b.tF, y) + tr.ease, b: spline(b.tB, y) + tr.ease, p: a + tr.ease, m: a + tr.ease, nf: 2.25, nb: 2.35};
    grid.push(ring4(f.o, fx(f), fz(f), q, cols));
    axis.push(f.o);
  }
  out.push({key: tr.key + 'Seat', mat: tr.mat, grid, axis, wrap: true, look: tr.look, bias: (tr.bias ?? 0) - 2, covers: tr.covers ?? ['leg', 'torso']});
  for (const side of ['L', 'R'] as const) {
    const s = side === 'L' ? 1 : -1;
    const hip = sk.hip[side];
    const knee = sk.knee[side];
    const ank = sk.ankle[side];
    const lp = sk.pose.legs[side];
    const up = nrm(sub(hip, knee));
    const top = add(hip, scl(up, 70));
    // the cloth below the knee hangs (wide) or follows the shin (straight, slim)
    const fall: V3 = tr.cut === 'wide' ? [ank[0] + s * 4, tr.hem, ank[2] + 6] : [ank[0], tr.hem, ank[2] + 4];
    const chain = [top, hip, knee, fall];
    const nr = rowsFor(40, res, 10);
    const nc = rowsFor(28, res, 12);
    const g2: V3[][] = [];
    const a2: V3[] = [];
    const footDir = mulMV(rotY(lp.footYaw), [0, 0, 1]);
    for (let i = 0; i < nr; i++) {
      const t = i / (nr - 1);
      const {p, d} = chainAt(chain, t);
      // the straight-leg height here (for the body's radii)
      const yS = mix(b.hipY + 70, tr.hem, t);
      const lat = mulMV(rotY(lp.footYaw * smooth(0.5, 1, t) * 0.5), [s, 0, 0]);
      const ax = nrm(sub(lat, scl(d, dot(lat, d))));
      let az = nrm(cross(d, ax));
      if (dot(az, nrm(lerp([0, 0, 1], footDir, 0.3))) < 0) az = scl(az, -1);
      const body = {f: spline(b.lF, yS), b: spline(b.lB, yS), p: spline(b.lL, yS), m: spline(b.lM, yS)};
      const e = tr.ease;
      let q: Q4 = {f: body.f + e, b: body.b + e, p: body.p + e, m: body.m + e, nf: 2.1, nb: 2.1};
      // the cut: below the hip (wide) or the knee (straight), the leg is a column of legHalf
      const from = tr.cut === 'wide' ? b.hipY - 20 : tr.cut === 'straight' ? b.kneeY + 60 : b.kneeY;
      const w = smooth(from + 40, from - 40, yS);
      const L = tr.legHalf;
      q = {f: Math.max(q.f, mix(q.f, L * 0.95, w)), b: Math.max(q.b, mix(q.b, L * 1.0, w)), p: Math.max(q.p, mix(q.p, L * 1.02, w)), m: Math.max(q.m, mix(q.m, L * 0.98, w)), nf: 2.15, nb: 2.15};
      let disp: ((phi: number) => number) | undefined;
      if (tr.stack && yS < tr.hem + 70) {
        const k = smooth(tr.hem + 70, tr.hem + 5, yS);
        disp = (phi: number) => tr.stack! * k * Math.sin(phi * 3 + yS * 0.18 + s) * 0.6;
      }
      g2.push(ring4(p, ax, az, q, nc, 0, disp));
      a2.push(p);
    }
    out.push({key: tr.key + side, mat: tr.mat, grid: g2, axis: a2, wrap: true, look: tr.look, bias: tr.bias, covers: tr.covers ?? [`leg${side}`, 'torso', `sock${side}`]});
  }
  return out;
}

// ---------------------------------------------------------------- shoes, socks, the bare foot

export type Shoe = {
  key: string;
  mat: string;
  style: 'flat' | 'sneaker' | 'loafer';
  /** The sole band's material (sneakers), or none. */
  sole?: string;
  look?: SurfLook;
};

/** The shoe along the foot (heel -> toe): its height and half-width by the fraction along the foot. */
export function shoeSurfaces(sk: Skeleton, side: 'L' | 'R', sh: Shoe, res: number): Surface[] {
  const b = sk.b;
  const len = b.foot * (sh.style === 'flat' ? 1.06 : 1.08);
  const fc = footChain(sk, side, len);
  const s = side === 'L' ? 1 : -1;
  const lat = nrm(cross(fc.up, fc.dir));
  const latS: V3 = dot(lat, mulMV(rotY(0), [s, 0, 0])) < 0 ? scl(lat, -1) : lat;
  const H = sh.style === 'flat' ? 30 : sh.style === 'loafer' ? 40 : 46;
  const W = sh.style === 'flat' ? 26 : 30;
  const nr = rowsFor(22, res, 8);
  const nc = rowsFor(22, res, 10);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  // the profile along the foot: t 0 = heel, 1 = toe
  const hK: [number, number][] =
    sh.style === 'flat'
      ? [
          [0, 0.55],
          [0.08, 0.95],
          [0.3, 1.0],
          [0.55, 0.9],
          [0.78, 0.62],
          [0.93, 0.36],
          [1, 0.12],
        ]
      : [
          [0, 0.7],
          [0.08, 1.0],
          [0.35, 1.0],
          [0.55, 0.88],
          [0.78, 0.66],
          [0.93, 0.45],
          [1, 0.18],
        ];
  const wK: [number, number][] =
    sh.style === 'flat'
      ? [
          [0, 0.45],
          [0.1, 0.78],
          [0.35, 0.85],
          [0.68, 1.0],
          [0.84, 0.82],
          [0.95, 0.42],
          [1, 0.06],
        ]
      : [
          [0, 0.55],
          [0.1, 0.82],
          [0.35, 0.86],
          [0.68, 1.0],
          [0.86, 0.9],
          [0.96, 0.62],
          [1, 0.2],
        ];
  for (let i = 0; i < nr; i++) {
    const t = i / (nr - 1);
    const base = lerp(fc.heel, fc.toe, t);
    const hh = spline(hK, t) * H;
    const ww = spline(wK, t) * W;
    // ring in the plane across the foot: up = fc.up, side = latS; the sole is flat (a D shape)
    const o = add(base, scl(fc.up, hh * 0.5));
    const q: Q4 = {f: hh * 0.5, b: hh * 0.5, p: ww, m: ww * 0.92, nf: 2.1, nb: 6};
    grid.push(ring4(o, latS, fc.up, q, nc));
    axis.push(o);
  }
  // a flat or loafer opens over the instep: the vamp line (low at the front for a flat), the foot shows in the opening
  let mask: ((i: number, j: number) => number) | undefined;
  if (sh.style !== 'sneaker') {
    // included where the toe box encloses the foot (past the vamp) or below the topline on the sides
    const opening = sh.style === 'flat' ? 0.6 : 0.45;
    const topline = sh.style === 'flat' ? 0.2 : 0.42;
    mask = (i: number, j: number) => {
      const t = i / (nr - 1);
      const up = Math.cos((j / nc) * Math.PI * 2); // +1 = the top of the ring
      return Math.max((t - opening) * 10, (topline - up) * 3);
    };
  }
  const out: Surface[] = [{key: sh.key + side, mat: sh.mat, grid, axis, wrap: true, open: !!mask, mask, look: sh.look ?? {hi: 0.8, rim: 0.45}, bias: 8, covers: [`foot${side}`, `sock${side}`]}];
  if (sh.sole) {
    const g2: V3[][] = [];
    const a2: V3[] = [];
    for (let i = 0; i < nr; i++) {
      const t = i / (nr - 1);
      const base = lerp(fc.heel, fc.toe, t);
      const ww = spline(wK, t) * W * 1.06 + 1.5;
      const o = add(base, scl(fc.up, 6.5));
      const q: Q4 = {f: 6.5, b: 6.5, p: ww, m: ww * 0.94, nf: 2.6, nb: 4};
      g2.push(ring4(o, latS, fc.up, q, nc));
      a2.push(o);
    }
    out.push({key: sh.key + 'Sole' + side, mat: sh.sole, grid: g2, axis: a2, wrap: true, look: {hi: 0.7}, bias: 9, noRim: true});
  }
  return out;
}

/** The bare foot (under a flat): heel, instep and toes as one soft form. */
export function footSurface(sk: Skeleton, side: 'L' | 'R', res: number, mat = 'skin'): Surface {
  const b = sk.b;
  const fc = footChain(sk, side, b.foot);
  const s = side === 'L' ? 1 : -1;
  const lat = nrm(cross(fc.up, fc.dir));
  const latS: V3 = dot(lat, [s, 0, 0]) < 0 ? scl(lat, -1) : lat;
  const ank = sk.ankle[side];
  const nr = rowsFor(16, res, 6);
  const nc = rowsFor(18, res, 8);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < nr; i++) {
    const t = i / (nr - 1);
    const base = lerp(fc.heel, fc.toe, t);
    // the instep rises toward the ankle
    const hh = spline(
      [
        [0, 0.55],
        [0.15, 0.95],
        [0.3, 1.0],
        [0.55, 0.62],
        [0.8, 0.38],
        [1, 0.15],
      ],
      t,
    ) * (ank[1] + 10);
    const ww = spline(
      [
        [0, 0.55],
        [0.2, 0.75],
        [0.65, 1.0],
        [0.9, 0.78],
        [1, 0.15],
      ],
      t,
    ) * 24;
    const o = add(base, scl(fc.up, hh * 0.5));
    grid.push(ring4(o, latS, fc.up, {f: hh * 0.5, b: hh * 0.5, p: ww, m: ww * 0.92, nf: 2.2, nb: 4}, nc));
    axis.push(o);
  }
  return {key: 'foot' + side, mat, grid, axis, wrap: true, bias: 2, look: {glow: true}};
}

/** A sock (or the trouser's cuff band): a short tube around the ankle. */
export function sockSurface(sk: Skeleton, side: 'L' | 'R', mat: string, top: number, res: number): Surface {
  const b = sk.b;
  const ank = sk.ankle[side];
  const knee = sk.knee[side];
  const d = nrm(sub(knee, ank));
  const chain = [add(ank, scl(d, top - b.ankleY)), add(ank, scl(d, -18))];
  const t = tube(
    chain,
    rowsFor(8, res, 4),
    rowsFor(18, res, 10),
    (tt) => {
      const r = mix(21, 22, tt);
      return {f: r, b: r + 2, p: r, m: r};
    },
    () => [side === 'L' ? 1 : -1, 0, 0],
  );
  return {key: 'sock' + side, mat, grid: t.grid, axis: t.axis, wrap: true, bias: 6, covers: [`leg${side}`, `foot${side}`]};
}

export {hash};
