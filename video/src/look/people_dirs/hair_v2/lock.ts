// HAIR v2 (docs/look/people_design/hair_v2/RECIPE.md (a)): the LOCK, the primitive every cut is made of, and the
// organic path builder. A lock is a tapered ribbon on a curved spine: widest a quarter of the way down, tapering to a
// point over its last third (a.2); its spine bends by the BEND RULE d(s) = d_tip x s^1.7 (wind, a walk, a turn and
// gravity only set d_tip, c.1), waves as a helix seen from the side (looser at the root, tighter at the ends, a.4) and
// may end in a hook (a curl turning back). Everything here is in head units (u = the skull, crown to chin; y down);
// the hair builder maps the points to the figure with the head frame.
// The outlines are smooth splines (Catmull-Rom), never rounded polygons: the tips are the only corners (ORGANIC, NOT
// GEOMETRIC; the people stay crisp).
import type {V2} from '../graphic/geo';

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1e-9)));
  return t * t * (3 - 2 * t);
};
const hyp = (a: V2, b: V2) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** The wave of a lock (a.4): amplitude a0 -> a1 (u) and wavelength l0 -> l1 (u) from where it starts to the tip; ph =
 *  its phase (turns); from = where it starts along the lock (0..1), ramping in over the next 15 %. */
export type Wave = {a0: number; a1: number; l0: number; l1: number; ph?: number; from?: number};

export type LockGeo = {
  /** the spine's control points (u), root first: 2-5 points */
  pts: V2[];
  /** the widest width (u) */
  w: number;
  /** the width profile (a.2): w(s) = w x (1 + swell sin(pi s)) x (1 - s^k)^m */
  swell?: number;
  k?: number;
  m?: number;
  /** the width at the root as a fraction (a lock growing out of the mass 1; a wisp ~0.35, its root tapered too) */
  root?: number;
  /** the asymmetric tip: +1 the A edge (+normal side) runs straighter into the tip, -1 the B edge */
  asym?: number;
  wave?: Wave;
  /** a curl's hook: the degrees the last part of the spine turns (+ clockwise on screen), from hookFrom (0..1) */
  hook?: number;
  hookFrom?: number;
  /** the bend rule: the degrees the direction turns at the tip (+ clockwise on screen); pow 1.7 */
  bend?: number;
  bendPow?: number;
  /** gravity: the degrees a hanging lock turns back toward straight down when the head bows or tilts; it takes over
   *  within the first third of the lock (a hair bends under its own weight past ~5 cm, F7), unlike the bend rule */
  grav?: number;
  /** a stretch of the spine (a curl stretched 5-10 % on the step) */
  stretch?: number;
  /** the width narrows where the wave turns the ribbon edge-on (0..0.45) */
  twist?: number;
  /** samples along the spine */
  n?: number;
};

export type Lock = {
  spine: V2[];
  /** the unit tangent and the +normal (perp: [t.y, -t.x]) at each sample */
  t: V2[];
  nrm: V2[];
  s: number[];
  /** the half-widths on the A (+normal) and B sides */
  wA: number[];
  wB: number[];
  /** the wave's phase (turns, without ph) and lateral offset at each sample */
  phi: number[];
  off: number[];
  ph: number;
  A: V2[];
  B: V2[];
  tip: V2;
  /** the spine's length (u) */
  len: number;
  /** the outline as a closed point list and the index of its tip (the one corner) */
  outline: V2[];
  tipAt: number;
};

/** Sample a Catmull-Rom spline through pts densely, then resample it by arc length into n points. */
export function spline(pts: V2[], n: number): V2[] {
  const m = pts.length;
  if (m < 2) return pts.slice();
  const P = (i: number): V2 => {
    if (i < 0) return [2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]];
    if (i > m - 1) return [2 * pts[m - 1][0] - pts[m - 2][0], 2 * pts[m - 1][1] - pts[m - 2][1]];
    return pts[i];
  };
  const dense: V2[] = [];
  const per = 24;
  for (let i = 0; i < m - 1; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[m - 1]);
  return resample(dense, n);
}

/** Resample a polyline into n points evenly spaced by arc length. */
export function resample(line: V2[], n: number): V2[] {
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + hyp(line[i - 1], line[i]));
  const total = cum[cum.length - 1] || 1e-9;
  const out: V2[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const goal = (total * k) / (n - 1);
    while (j < line.length - 1 && cum[j] < goal) j++;
    const a = line[j - 1];
    const b = line[j];
    const seg = cum[j] - cum[j - 1] || 1e-9;
    const t = Math.max(0, Math.min(1, (goal - cum[j - 1]) / seg));
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

const tangents = (sp: V2[]): V2[] =>
  sp.map((_, i) => {
    const a = sp[Math.max(0, i - 1)];
    const b = sp[Math.min(sp.length - 1, i + 1)];
    const l = hyp(a, b) || 1e-9;
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l] as V2;
  });

/** Build a lock: the spine (with the bend rule, the hook and the wave), its widths and its outline. */
export function buildLock(g: LockGeo): Lock {
  const n = g.n ?? 30;
  let sp = spline(g.pts, n);
  // the stretch (a curl springs, never unwinds: the spine lengthens, the loops stay)
  if (g.stretch) {
    const r = sp[0];
    sp = sp.map((p) => [r[0] + (p[0] - r[0]) * (1 + g.stretch!), r[1] + (p[1] - r[1]) * (1 + g.stretch!)] as V2);
  }
  // the bend rule and the hook: turn each segment's direction by d(s), then rebuild the spine (the length is kept)
  const bend = g.bend ?? 0;
  const pow = g.bendPow ?? 1.7;
  const hook = g.hook ?? 0;
  const hf = g.hookFrom ?? 0.55;
  const grav = g.grav ?? 0;
  if (bend || hook || grav) {
    const out: V2[] = [sp[0]];
    for (let i = 0; i < n - 1; i++) {
      const s = (i + 0.5) / (n - 1);
      const dx = sp[i + 1][0] - sp[i][0];
      const dy = sp[i + 1][1] - sp[i][1];
      const a = Math.atan2(dy, dx) + ((bend * Math.pow(s, pow) + hook * smooth(hf, 1, s) + grav * smooth(0.02, 0.34, s)) * Math.PI) / 180;
      const l = Math.hypot(dx, dy);
      const q = out[i];
      out.push([q[0] + Math.cos(a) * l, q[1] + Math.sin(a) * l]);
    }
    sp = out;
  }
  let len = 0;
  for (let i = 1; i < n; i++) len += hyp(sp[i - 1], sp[i]);
  // the wave: a lateral offset along the normal, its phase running with the arc length over a shortening wavelength
  const w = g.wave;
  const ph = w?.ph ?? 0;
  const phi: number[] = new Array(n).fill(0);
  const off: number[] = new Array(n).fill(0);
  const s: number[] = sp.map((_, i) => i / (n - 1));
  if (w) {
    const from = w.from ?? 0.12;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const sw = Math.max(0, (s[i] - from) / (1 - from));
      if (i > 0 && s[i] > from) {
        const lam = w.l0 + (w.l1 - w.l0) * sw;
        acc += hyp(sp[i - 1], sp[i]) / Math.max(0.05, lam);
      }
      phi[i] = acc;
      const amp = (w.a0 + (w.a1 - w.a0) * sw) * smooth(0, 0.15, sw) * (1 - 0.75 * smooth(0.72, 1, s[i]));
      off[i] = amp * Math.sin(2 * Math.PI * (acc + ph));
    }
    const t0 = tangents(sp);
    sp = sp.map((p, i) => [p[0] + t0[i][1] * off[i], p[1] - t0[i][0] * off[i]] as V2);
  }
  const t = tangents(sp);
  const nrm: V2[] = t.map((q) => [q[1], -q[0]] as V2);
  // the widths
  const w0 = g.w;
  const swell = g.swell ?? 0.18;
  const k = g.k ?? 1.9;
  const m = g.m ?? 0.8;
  const root = g.root ?? 1;
  const asym = g.asym ?? 0;
  const twist = g.twist ?? 0;
  const wA: number[] = [];
  const wB: number[] = [];
  for (let i = 0; i < n; i++) {
    const si = s[i];
    let wi = w0 * (1 + swell * Math.sin(Math.PI * si)) * Math.pow(Math.max(0, 1 - Math.pow(si, k)), m);
    if (root < 1) wi *= root + (1 - root) * smooth(0, 0.22, si);
    if (twist && w) wi *= 1 - twist * Math.pow(Math.cos(2 * Math.PI * (phi[i] + ph)), 2) * smooth(0, 0.2, si);
    const a = asym * 0.34 * smooth(0.45, 1, si);
    wA.push(wi * (0.5 + a));
    wB.push(wi * (0.5 - a));
  }
  wA[n - 1] = 0;
  wB[n - 1] = 0;
  const A = sp.map((p, i) => [p[0] + nrm[i][0] * wA[i], p[1] + nrm[i][1] * wA[i]] as V2);
  const B = sp.map((p, i) => [p[0] - nrm[i][0] * wB[i], p[1] - nrm[i][1] * wB[i]] as V2);
  const tip = sp[n - 1];
  // the outline: up the A side to the tip, back down the B side, and a round cap behind the root
  const cap: V2[] = [];
  const r0 = (wA[0] + wB[0]) / 2;
  const c0: V2 = [(A[0][0] + B[0][0]) / 2, (A[0][1] + B[0][1]) / 2];
  for (let j = 1; j < 4; j++) {
    const a = (Math.PI * j) / 4;
    // from B round the back (-t) to A
    const nx = -nrm[0][0] * Math.cos(a) - t[0][0] * Math.sin(a);
    const ny = -nrm[0][1] * Math.cos(a) - t[0][1] * Math.sin(a);
    cap.push([c0[0] + nx * r0, c0[1] + ny * r0]);
  }
  const outline: V2[] = [...A.slice(0, n - 1), tip, ...B.slice(0, n - 1).reverse(), ...cap];
  return {spine: sp, t, nrm, s, wA, wB, phi, off, ph, A, B, tip, len, outline, tipAt: n - 1};
}

/** The lock's shade plane (its own terminator): a band along the shade edge, `frac(s)` of the width (0..1), pushed
 *  outward so the lock's outline (its clip) makes the crisp edge. shadeA: the A side is in shade. */
export function lockShade(L: Lock, shadeA: boolean, frac: (s: number, i: number) => number): V2[] {
  const n = L.spine.length;
  const T: V2[] = [];
  const O: V2[] = [];
  for (let i = 0; i < n; i++) {
    const wi = L.wA[i] + L.wB[i];
    const f = Math.max(0, Math.min(1, frac(L.s[i], i)));
    const sg = shadeA ? 1 : -1;
    const edge = shadeA ? L.wA[i] : L.wB[i];
    const d = edge - f * wi; // from the spine toward the shade edge
    const p = L.spine[i];
    const nn = L.nrm[i];
    T.push([p[0] + nn[0] * d * sg, p[1] + nn[1] * d * sg]);
    O.push([p[0] + nn[0] * (edge + 0.4) * sg, p[1] + nn[1] * (edge + 0.4) * sg]);
  }
  // run past the root and the tip so the clip, not the polygon, ends it
  const t0 = L.t[0];
  const t1 = L.t[n - 1];
  const back = (p: V2): V2 => [p[0] - t0[0] * 0.5, p[1] - t0[1] * 0.5];
  const fwd = (p: V2): V2 => [p[0] + t1[0] * 0.3, p[1] + t1[1] * 0.3];
  return [back(T[0]), ...T, fwd(T[n - 1]), fwd(O[n - 1]), ...O.slice().reverse(), back(O[0])];
}

/** A sheen dash across the lock at s0 (a.5): from near the lit edge inward, `reach` of the width long, `th` thick
 *  (u), both ends tapered; `litA`: the A side is lit. */
export function sheenDash(L: Lock, s0: number, reach: number, th: number, litA: boolean, inset = -0.08): V2[] {
  const n = L.spine.length;
  const fi = Math.max(0, Math.min(n - 1.001, s0 * (n - 1)));
  const i = Math.floor(fi);
  const u = fi - i;
  const lerp = (a: V2, b: V2): V2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const p = lerp(L.spine[i], L.spine[i + 1]);
  const tt = lerp(L.t[i], L.t[i + 1]);
  const nn = lerp(L.nrm[i], L.nrm[i + 1]);
  const wa = L.wA[i] + (L.wA[i + 1] - L.wA[i]) * u;
  const wb = L.wB[i] + (L.wB[i + 1] - L.wB[i]) * u;
  const wi = wa + wb;
  const sg = litA ? 1 : -1;
  const edge = litA ? wa : wb;
  const top: V2[] = [];
  const bot: V2[] = [];
  const M = 9;
  for (let j = 0; j <= M; j++) {
    const q = j / M;
    // from the lit edge (minus an inset) toward the shade edge
    const d = (edge - inset * wi - q * reach * wi) * sg;
    // full at the lit edge (the lock's outline clips it crisp), tapering to a point toward the shade side
    const h = (th / 2) * Math.pow(Math.max(0, Math.sin(Math.PI * (0.5 + 0.5 * q))), 0.8);
    // a band round a round lock: its middle toward the root, like a ring seen from above
    const bow = 1.1 * th * q * q;
    const c: V2 = [p[0] + nn[0] * d + tt[0] * bow, p[1] + nn[1] * d + tt[1] * bow];
    top.push([c[0] - tt[0] * h, c[1] - tt[1] * h]);
    bot.push([c[0] + tt[0] * h, c[1] + tt[1] * h]);
  }
  return [...top, ...bot.reverse()];
}

/** A split inside a big lock at close size (F5: a clump shows its sub-locks): a tapered sliver following the spine,
 *  `at` of the width in from the lit edge, from s0 to s1, `th` wide at its fullest (u). */
export function splitSliver(L: Lock, litA: boolean, at: number, s0: number, s1: number, th: number): V2[] {
  const n = L.spine.length;
  const a: V2[] = [];
  const b: V2[] = [];
  const sg = litA ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const s = L.s[i];
    if (s < s0 || s > s1) continue;
    const u = (s - s0) / (s1 - s0);
    const h = (th / 2) * Math.pow(Math.sin(Math.PI * u), 0.8);
    const wi = L.wA[i] + L.wB[i];
    const edge = litA ? L.wA[i] : L.wB[i];
    const d = (edge - at * wi) * sg;
    const p = L.spine[i];
    const nn = L.nrm[i];
    const c: V2 = [p[0] + nn[0] * d, p[1] + nn[1] * d];
    a.push([c[0] + nn[0] * h, c[1] + nn[1] * h]);
    b.push([c[0] - nn[0] * h, c[1] - nn[1] * h]);
  }
  return [...a, ...b.reverse()];
}

/** The samples' parameters where the wave's crests face the light (one sheen dash per crest, a.4). sideA: the lit
 *  side is A (+normal), so the crest bulging toward +normal is lit. */
export function crestsLit(L: Lock, litA: boolean, shift = 0.07): number[] {
  const out: number[] = [];
  const n = L.spine.length;
  if (!L.off.some((o) => o !== 0)) return out;
  const want = litA ? 0.25 : 0.75; // sin(2 pi x) = +1 at x = 0.25, -1 at 0.75
  for (let i = 1; i < n; i++) {
    const a = L.phi[i - 1] + L.ph + shift;
    const b = L.phi[i] + L.ph + shift;
    const ka = Math.floor(a - want);
    const kb = Math.floor(b - want);
    if (kb > ka) out.push(L.s[i]);
  }
  return out;
}

// ---------------------------------------------------------------- the organic path builder
const fmt = (v: number) => (Math.round(v * 10) / 10).toString();
const P2 = (p: V2) => `${fmt(p[0])} ${fmt(p[1])}`;

/** A smooth path through pts (Catmull-Rom as cubic Beziers), crisp at the points flagged as corners. Points are
 *  already in the figure's local units. */
export function smoothPath(pts: V2[], corner: (i: number) => boolean = () => false, closed = true, tension = 1): string {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const isC = (i: number) => (!closed && (i <= 0 || i >= n - 1)) || corner(((i % n) + n) % n);
  // incoming and outgoing tangents at each point
  const tin: V2[] = [];
  const tout: V2[] = [];
  for (let i = 0; i < n; i++) {
    const p = at(i);
    const a = at(i - 1);
    const b = at(i + 1);
    if (isC(i)) {
      tin.push([(p[0] - a[0]) * 0.5 * tension, (p[1] - a[1]) * 0.5 * tension]);
      tout.push([(b[0] - p[0]) * 0.5 * tension, (b[1] - p[1]) * 0.5 * tension]);
    } else {
      const tt: V2 = [((b[0] - a[0]) / 2) * tension, ((b[1] - a[1]) / 2) * tension];
      tin.push(tt);
      tout.push(tt);
    }
  }
  let d = `M${P2(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % n;
    const p = pts[i];
    const q = pts[j];
    const c1: V2 = [p[0] + tout[i][0] / 3, p[1] + tout[i][1] / 3];
    const c2: V2 = [q[0] - tin[j][0] / 3, q[1] - tin[j][1] / 3];
    d += `C${P2(c1)} ${P2(c2)} ${P2(q)}`;
  }
  return closed ? d + 'Z' : d;
}

/** A plain polygon path (for regions that a clip trims). */
export const polyPath = (pts: V2[]) => `M${pts.map(P2).join('L')}Z`;

/** A mass outline point: x, y (u) and 1 for a crisp corner (a tip), 0 or absent for a smooth point. */
export type MP = [number, number, number?];
