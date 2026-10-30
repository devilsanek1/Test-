// Editorial people: the 2.5D core (docs/look/people_design/dir_editorial.md). One figure is a few 3D forms (lofted
// cross-sections for the torso, garments, head and hair; tubes along joint chains for limbs and shoes) projected at any
// view angle, so the front 3/4, the profile and the back are one drawing seen from three sides, never three drawings
// that disagree. Pure geometry: no time, no randomness; every outline is one closed smooth path (no strokes, no
// outlines); the painter (paint.ts, Person.tsx) fills each with its one soft light gradient.
//
// Units: H = 1000 (crown to sole). World: X lateral (+ = the figure's LEFT), Y up (feet at 0), Z forward (+ = the
// figure's front). Screen: x right, y down, the feet at y = 0. View yaw: 0 = the figure faces the camera, 90 = a profile
// facing screen-left, 180 = seen from behind; 40 = the front 3/4 facing left; 150 = the rear 3/4 turned left.

export type V2 = [number, number];
export type V3 = [number, number, number];

export const deg = (a: number) => (a * Math.PI) / 180;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const norm3 = (a: V3): V3 => {
  const l = len3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const add2 = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
export const sub2 = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export const mul2 = (a: V2, k: number): V2 => [a[0] * k, a[1] * k];
export const len2 = (a: V2) => Math.hypot(a[0], a[1]);
export const norm2 = (a: V2): V2 => {
  const l = len2(a) || 1;
  return [a[0] / l, a[1] / l];
};
export const lerp2 = (a: V2, b: V2, k: number): V2 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const rot2 = (p: V2, a: number, c: V2 = [0, 0]): V2 => {
  const r = deg(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** Rotate a 3D point about the vertical axis through c (yaw, degrees; + turns the figure's front toward its LEFT... i.e.
 *  toward screen-left in the front view). */
export const yawAbout = (p: V3, c: V3, a: number): V3 => {
  const r = deg(a);
  const dx = p[0] - c[0];
  const dz = p[2] - c[2];
  return [c[0] + dx * Math.cos(r) + dz * Math.sin(r), p[1], c[2] - dx * Math.sin(r) + dz * Math.cos(r)];
};
/** Rotate about the lateral (X) axis through c (pitch, degrees; + tips the top forward: a nod, a lean). */
export const pitchAbout = (p: V3, c: V3, a: number): V3 => {
  const r = deg(a);
  const dy = p[1] - c[1];
  const dz = p[2] - c[2];
  return [p[0], c[1] + dy * Math.cos(r) - dz * Math.sin(r), c[2] + dy * Math.sin(r) + dz * Math.cos(r)];
};
/** Rotate about the forward (Z) axis through c (roll, degrees; + drops the figure's LEFT side). */
export const rollAbout = (p: V3, c: V3, a: number): V3 => {
  const r = deg(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(r) + dy * Math.sin(r), c[1] - dx * Math.sin(r) + dy * Math.cos(r), p[2]];
};

// ---------------------------------------------------------------- the camera

export type View = {
  /** Degrees: 0 front, 40 front 3/4 facing left, 90 profile facing left, 150 rear 3/4, 180 back. */
  yaw: number;
  /** The camera's height (world Y): below it a near point drops on screen (a hem's front arc bows down). */
  eyeY?: number;
  /** How strongly depth shifts screen y below the eye (per 1000 units below it). */
  pitchK?: number;
};
export type P = {x: number; y: number; d: number};

export function proj(p: V3, v: View): P {
  const r = deg(v.yaw);
  const x = p[0] * Math.cos(r) - p[2] * Math.sin(r);
  const d = p[0] * Math.sin(r) + p[2] * Math.cos(r);
  const eye = v.eyeY ?? 940;
  const k = v.pitchK ?? 0.11;
  const pitch = (k * Math.max(0, eye - p[1])) / 1000;
  return {x, y: -p[1] + d * pitch, d};
}
export const pj = (p: V3, v: View): V2 => {
  const q = proj(p, v);
  return [q.x, q.y];
};
/** The camera-space depth of a point (+ = toward the camera). */
export const depthOf = (p: V3, v: View) => proj(p, v).d;

// ---------------------------------------------------------------- paths

/** A path point: [x, y] or [x, y, 1] for a crisp corner (its handles collapse: the curve leaves along the chord). */
export type PP = V2 | [number, number, 1];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** A smooth closed (or open) path through pts (Catmull-Rom, tension 0..1). Corners keep zero-length handles. */
export function pathOf(pts: PP[], closed = true, tension = 0.5): string {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const g = (i: number): PP => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const isC = (p: PP) => p.length === 3;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    const c1: V2 = isC(p1) ? [p1[0], p1[1]] : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: V2 = isC(p2) ? [p2[0], p2[1]] : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}
/** A straight polygon (for clip helpers). */
export function polyOf(pts: V2[]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`).join('') + 'Z';
}
/** Remove points closer than `min` to the previous kept point (keeps corners). */
export function thin(pts: PP[], min: number): PP[] {
  const out: PP[] = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || p.length === 3 || Math.hypot(p[0] - q[0], p[1] - q[1]) >= min) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- monotone interpolation (PCHIP)

/** A monotone cubic through (xs, ys) (xs ascending): smooth, never overshooting a designed width. */
export function pchip(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  if (n === 1) return () => ys[0];
  const h = xs.slice(1).map((x, i) => x - xs[i]);
  const dl = h.map((hh, i) => (ys[i + 1] - ys[i]) / hh);
  const m: number[] = new Array(n).fill(0);
  m[0] = dl[0];
  m[n - 1] = dl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (dl[i - 1] * dl[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i]);
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const hh = h[i];
    const t = (x - xs[i]) / hh;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * hh * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * hh * m[i + 1];
  };
}

// ---------------------------------------------------------------- lofts (stacked cross-sections)

/** One horizontal cross-section: centre (cx, cz), half-widths toward +X (`ap`, the figure's left) and -X (`an`), depths
 *  to the front (`bf`) and back (`bb`), superellipse exponent `n` (2 = ellipse, higher = squarer), a frontal tilt
 *  (degrees: + lifts the figure's LEFT side, a hip or shoulder line), and `bump`: extra forward depth near the front
 *  centre (a nose, the lips: [amount, half-angle in degrees]). */
export type Sec = {y: number; cx: number; cz: number; ap: number; an: number; bf: number; bb: number; n?: number; nb?: number; tilt?: number; bump?: [number, number]};
export type SecKey = Partial<Sec> & {y: number};

/** The point of a section at angle phi (degrees: 0 = +X the figure's left, 90 = the front, 180 = -X, 270 = the back). */
export function secPt(s: Sec, phi: number): V3 {
  const r = deg(phi);
  const c = Math.cos(r);
  const sn = Math.sin(r);
  const ex = 2 / (sn >= 0 ? (s.n ?? 2) : (s.nb ?? s.n ?? 2));
  const ax = c >= 0 ? s.ap : s.an;
  const bz = sn >= 0 ? s.bf : s.bb;
  let X = s.cx + ax * Math.sign(c) * Math.abs(c) ** ex;
  let Z = s.cz + bz * Math.sign(sn) * Math.abs(sn) ** ex;
  if (s.bump && s.bump[0] !== 0) {
    const da = (((phi - 90) % 360) + 540) % 360 - 180;
    const u = da / s.bump[1];
    if (Math.abs(u) < 1) {
      const w = (1 - u * u) ** 2;
      Z += s.bump[0] * w;
      X = s.cx + (X - s.cx) * (1 - 0.35 * w);
    }
  }
  const Y = s.y + (X - s.cx) * Math.tan(deg(s.tilt ?? 0));
  return [X, Y, Z];
}

/** Resample designed key sections every `step` units of y (monotone cubic per parameter). Keys are given top to bottom
 *  or in any order; missing fields inherit the previous key's. Returns sections from the top (highest y) down. */
export function sections(keys: SecKey[], step = 8): Sec[] {
  const full: Sec[] = [];
  let prev: Sec = {y: 0, cx: 0, cz: 0, ap: 0, an: 0, bf: 0, bb: 0, n: 2, tilt: 0};
  const sorted = [...keys].sort((a, b) => b.y - a.y);
  for (const k of sorted) {
    const a = k.ap ?? (k as {a?: number}).a ?? prev.ap;
    const s: Sec = {
      ...prev,
      ...k,
      ap: k.ap ?? (k as {a?: number}).a ?? prev.ap,
      an: k.an ?? (k as {a?: number}).a ?? (k.ap !== undefined ? k.ap : prev.an),
      bump: k.bump ?? [0, 20],
    };
    void a;
    full.push(s);
    prev = s;
  }
  const ys = full.map((s) => -s.y);
  const fn = (key: 'cx' | 'cz' | 'ap' | 'an' | 'bf' | 'bb' | 'n' | 'tilt') => pchip(ys, full.map((s) => (s[key] ?? (key === 'n' ? 2 : 0)) as number));
  const F = {cx: fn('cx'), cz: fn('cz'), ap: fn('ap'), an: fn('an'), bf: fn('bf'), bb: fn('bb'), n: fn('n'), tilt: fn('tilt')};
  const nbF = pchip(ys, full.map((s) => s.nb ?? s.n ?? 2));
  const bumpA = pchip(ys, full.map((s) => s.bump?.[0] ?? 0));
  const bumpW = pchip(ys, full.map((s) => s.bump?.[1] ?? 20));
  const out: Sec[] = [];
  const y0 = full[0].y;
  const y1 = full[full.length - 1].y;
  const n = Math.max(2, Math.ceil((y0 - y1) / step));
  for (let i = 0; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    const t = -y;
    out.push({y, cx: F.cx(t), cz: F.cz(t), ap: Math.max(0.01, F.ap(t)), an: Math.max(0.01, F.an(t)), bf: Math.max(0.01, F.bf(t)), bb: Math.max(0.01, F.bb(t)), n: F.n(t), nb: nbF(t), tilt: F.tilt(t), bump: [bumpA(t), bumpW(t)]});
  }
  return out;
}

export type Xf = (p: V3) => V3;
const ID: Xf = (p) => p;
const RING = 48;

export type LoftOpts = {
  /** Corners where the side meets the bottom (a hem) / the top. */
  cornerBottom?: boolean;
  cornerTop?: boolean;
  /** Only part of each ring: [phi0, phi1] degrees (the arc from phi0 counter-clockwise to phi1), as a function of y. */
  arc?: (y: number) => [number, number] | null;
};

/** The screen outline of a loft: the left extremes top to bottom, the near arc of the bottom ring, the right extremes
 *  bottom to top, the far arc of the top ring. Dense (every section); smoothed by pathOf. */
export function loftOutline(secs: Sec[], v: View, xf: Xf = ID, o: LoftOpts = {}): PP[] {
  const closed: boolean[] = [];
  const rings: P[][] = secs.map((s) => {
    const ar = o.arc?.(s.y);
    const out: P[] = [];
    if (ar) {
      let [a0, a1] = ar;
      while (a1 < a0) a1 += 360;
      const m = Math.max(4, Math.round(((a1 - a0) / 360) * RING));
      for (let i = 0; i <= m; i++) out.push(proj(xf(secPt(s, a0 + ((a1 - a0) * i) / m)), v));
      closed.push(false);
    } else {
      for (let i = 0; i < RING; i++) out.push(proj(xf(secPt(s, (360 * i) / RING)), v));
      closed.push(true);
    }
    return out;
  });
  const L: PP[] = [];
  const R: PP[] = [];
  let iL0 = 0;
  let iR0 = 0;
  let iLn = 0;
  let iRn = 0;
  rings.forEach((ring, j) => {
    let li = 0;
    let ri = 0;
    ring.forEach((p, i) => {
      if (p.x < ring[li].x) li = i;
      if (p.x > ring[ri].x) ri = i;
    });
    L.push([ring[li].x, ring[li].y]);
    R.push([ring[ri].x, ring[ri].y]);
    if (j === 0) {
      iL0 = li;
      iR0 = ri;
    }
    if (j === rings.length - 1) {
      iLn = li;
      iRn = ri;
    }
  });
  const arcBetween = (ring: P[], from: number, to: number, near: boolean, closedRing: boolean): PP[] => {
    const n = ring.length;
    if (!closedRing) {
      // an open arc: the run between the two extremes that stays on the arc (walk the indices directly)
      const out: PP[] = [];
      const st = from <= to ? 1 : -1;
      for (let i = from; i !== to + st; i += st) out.push([ring[i].x, ring[i].y]);
      return out;
    }
    const walk = (dir: 1 | -1) => {
      const out: P[] = [];
      let i = from;
      for (let g = 0; g <= n; g++) {
        out.push(ring[i]);
        if (i === to) break;
        i = (i + dir + n) % n;
      }
      return out;
    };
    const a = walk(1);
    const b = walk(-1);
    const md = (q: P[]) => q.reduce((s, p) => s + p.d, 0) / q.length;
    const pick = near ? (md(a) >= md(b) ? a : b) : md(a) < md(b) ? a : b;
    return pick.map((p) => [p.x, p.y] as PP);
  };
  const last = rings[rings.length - 1];
  const first = rings[0];
  const bottom = arcBetween(last, iLn, iRn, true, closed[closed.length - 1]).slice(1, -1);
  const top = arcBetween(first, iR0, iL0, false, closed[0]).slice(1, -1);
  const Lc = L.map((p, i) => (o.cornerBottom && i === L.length - 1 ? ([p[0], p[1], 1] as PP) : o.cornerTop && i === 0 ? ([p[0], p[1], 1] as PP) : p));
  const Rc = [...R].reverse().map((p, i, arr) => (o.cornerBottom && i === 0 ? ([p[0], p[1], 1] as PP) : o.cornerTop && i === arr.length - 1 ? ([p[0], p[1], 1] as PP) : p));
  return thin([...Lc, ...bottom, ...Rc, ...top], 2.5);
}

/** The screen point of a surface point (section at height y, angle phi), and whether it faces the camera. */
export function surf(secs: Sec[], y: number, phi: number, v: View, xf: Xf = ID, push = 0): {p: V2; d: number; vis: boolean; w: V3} {
  // the section at y (linear between the resampled ones)
  let i = 0;
  while (i < secs.length - 2 && secs[i + 1].y > y) i++;
  const a = secs[i];
  const b = secs[i + 1] ?? a;
  const k = a.y === b.y ? 0 : clamp((a.y - y) / (a.y - b.y), 0, 1);
  const s: Sec = {
    y,
    cx: lerp(a.cx, b.cx, k),
    cz: lerp(a.cz, b.cz, k),
    ap: lerp(a.ap, b.ap, k),
    an: lerp(a.an, b.an, k),
    bf: lerp(a.bf, b.bf, k),
    bb: lerp(a.bb, b.bb, k),
    n: lerp(a.n ?? 2, b.n ?? 2, k),
    nb: lerp(a.nb ?? a.n ?? 2, b.nb ?? b.n ?? 2, k),
    tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, k),
    bump: [lerp(a.bump?.[0] ?? 0, b.bump?.[0] ?? 0, k), lerp(a.bump?.[1] ?? 20, b.bump?.[1] ?? 20, k)],
  };
  let w = secPt(s, phi);
  // the outward normal (approx.) by the neighbouring angles
  const w1 = secPt(s, phi + 2);
  const w0 = secPt(s, phi - 2);
  const tang = sub3(w1, w0);
  const up: V3 = [0, 1, 0];
  const nrm = norm3(cross3(up, tang));
  if (push) w = add3(w, mul3(nrm, push));
  const W = xf(w);
  const Wn = xf(add3(w, mul3(nrm, 10)));
  const q = proj(W, v);
  const qn = proj(Wn, v);
  return {p: [q.x, q.y], d: q.d, vis: qn.d - q.d > 0.4, w: W};
}

// ---------------------------------------------------------------- tubes (limbs, sleeves, trouser legs, ponytails)

export type TubeR = {
  /** Lateral and depth radii, and the section's offset along its depth axis (+ = toward the reference: a calf's bulge
   *  back is negative with ref = forward). */
  ru: number;
  rv: number;
  off?: number;
  /** A lateral offset (+ toward +u): an inner/outer bulge. */
  offU?: number;
};

/** Sample a joint chain by arc length: M points with their tangents. */
function sampleChain(chain: V3[], m: number): {c: V3; t: V3; s: number}[] {
  const seg = chain.slice(1).map((p, i) => len3(sub3(p, chain[i])));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  const out: {c: V3; t: V3; s: number}[] = [];
  for (let i = 0; i <= m; i++) {
    let s = (total * i) / m;
    let j = 0;
    while (j < seg.length - 1 && s > seg[j]) {
      s -= seg[j];
      j++;
    }
    const k = seg[j] ? clamp(s / seg[j], 0, 1) : 0;
    const c = lerp3(chain[j], chain[j + 1], k);
    // a smooth tangent: blend the segment directions near the joints
    const tj = norm3(sub3(chain[j + 1], chain[j]));
    let t = tj;
    const blend = 0.18;
    if (k < blend && j > 0) {
      const tp = norm3(sub3(chain[j], chain[j - 1]));
      t = norm3(lerp3(tp, tj, 0.5 + (0.5 * k) / blend));
    } else if (k > 1 - blend && j < seg.length - 1) {
      const tn = norm3(sub3(chain[j + 2], chain[j + 1]));
      t = norm3(lerp3(tj, tn, (0.5 * (k - (1 - blend))) / blend));
    }
    out.push({c, t, s: i / m});
  }
  return out;
}

/** The screen outline of a tube along a 3D chain: radii as a function of the arc-length fraction s (0..1); `ref` is the
 *  3D direction the section's depth axis leans toward (forward for legs and arms). Caps are the rings' far arcs. */
export function tubeOutline(chain: V3[], rad: (s: number) => TubeR, v: View, ref: V3 = [0, 0, 1], o: {m?: number; capStart?: boolean; capEnd?: boolean; xf?: Xf} = {}): PP[] {
  const m = o.m ?? 28;
  const xf = o.xf ?? ID;
  const smp = sampleChain(chain, m);
  const rings = smp.map(({c, t, s}) => {
    let vv = sub3(ref, mul3(t, dot3(ref, t)));
    if (len3(vv) < 1e-3) vv = [1, 0, 0];
    vv = norm3(vv);
    const uu = norm3(cross3(t, vv));
    const r = rad(s);
    const pts: P[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (2 * Math.PI * i) / 20;
      const pu = r.ru * Math.cos(a) + (r.offU ?? 0);
      const pv = r.rv * Math.sin(a) + (r.off ?? 0);
      pts.push(proj(xf(add3(c, add3(mul3(uu, pu), mul3(vv, pv)))), v));
    }
    return {pts, c: proj(xf(c), v)};
  });
  // the projected axis direction at each sample
  const axis: V2[] = rings.map((r, i) => {
    const a = rings[Math.max(0, i - 1)].c;
    const b = rings[Math.min(rings.length - 1, i + 1)].c;
    const d: V2 = [b.x - a.x, b.y - a.y];
    return len2(d) < 1e-6 ? [0, 1] : norm2(d);
  });
  const Lp: PP[] = [];
  const Rp: PP[] = [];
  rings.forEach((r, i) => {
    const n: V2 = [-axis[i][1], axis[i][0]];
    let li = 0;
    let ri = 0;
    r.pts.forEach((p, j) => {
      const s = (p.x - r.c.x) * n[0] + (p.y - r.c.y) * n[1];
      const sl = (r.pts[li].x - r.c.x) * n[0] + (r.pts[li].y - r.c.y) * n[1];
      const sr = (r.pts[ri].x - r.c.x) * n[0] + (r.pts[ri].y - r.c.y) * n[1];
      if (s > sl) li = j;
      if (s < sr) ri = j;
    });
    Lp.push([r.pts[li].x, r.pts[li].y]);
    Rp.push([r.pts[ri].x, r.pts[ri].y]);
  });
  // caps: half-ellipses beyond the ends, along the axis
  const cap = (i: number, dir: 1 | -1): PP[] => {
    const r = rings[i];
    const ax = mul2(axis[i], dir);
    const n: V2 = [-axis[i][1], axis[i][0]];
    // the ring's extent along the axis (beyond the centre)
    let ext = 0;
    let wid = 0;
    r.pts.forEach((p) => {
      ext = Math.max(ext, (p.x - r.c.x) * ax[0] + (p.y - r.c.y) * ax[1]);
      wid = Math.max(wid, Math.abs((p.x - r.c.x) * n[0] + (p.y - r.c.y) * n[1]));
    });
    const e = Math.max(ext, wid * 0.55);
    const out: PP[] = [];
    for (let k = 1; k <= 3; k++) {
      const a = (Math.PI * k) / 4;
      const cn = Math.cos(a);
      const sn = Math.sin(a);
      out.push([r.c.x + n[0] * wid * cn * dir + ax[0] * e * sn, r.c.y + n[1] * wid * cn * dir + ax[1] * e * sn]);
    }
    return out;
  };
  const endCap = o.capEnd === false ? [] : cap(rings.length - 1, 1);
  const startCap = o.capStart === false ? [] : cap(0, -1);
  return thin([...Lp, ...endCap, ...[...Rp].reverse(), ...startCap], 2);
}

/** Two-bone IK in 3D: the middle joint between root and end (bone lengths a, b), bending toward `pole`. */
export function ik3(root: V3, end: V3, a: number, b: number, pole: V3): V3 {
  const d = sub3(end, root);
  const D = Math.min(len3(d), a + b - 1e-3);
  const u = norm3(d);
  const x = (a * a - b * b + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  let pv = sub3(pole, mul3(u, dot3(pole, u)));
  if (len3(pv) < 1e-6) pv = [0, 0, 1];
  pv = norm3(pv);
  return add3(add3(root, mul3(u, x)), mul3(pv, h));
}

/** 2D convex hull (monotone chain). */
export function hull(pts: V2[]): V2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

/** A deterministic hash in [0, 1) (no randomness at render: the same figure every frame). */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A region on a loft's surface: rows y0..y1, a phi interval per row; its visible part's screen outline. */
export function region(secs: Sec[], v: View, y0: number, y1: number, phiAt: (y: number) => [number, number], xf: Xf = ID, push = 0, rows = 10, visOnly = true): PP[] | null {
  const left: PP[] = [];
  const right: PP[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = lerp(y0, y1, i / rows);
    const [a0, a1] = phiAt(y);
    const m = 12;
    const seg: {p: V2; vis: boolean}[] = [];
    for (let j = 0; j <= m; j++) {
      const s = surf(secs, y, lerp(a0, a1, j / m), v, xf, push);
      seg.push({p: s.p, vis: s.vis});
    }
    const vs = visOnly ? seg.filter((q) => q.vis) : seg;
    if (vs.length < 2) continue;
    let li = 0;
    let ri = 0;
    vs.forEach((q, k) => {
      if (q.p[0] < vs[li].p[0]) li = k;
      if (q.p[0] > vs[ri].p[0]) ri = k;
    });
    left.push(vs[li].p);
    right.push(vs[ri].p);
  }
  if (left.length < 2) return null;
  return [...left, ...right.reverse()];
}
/** The screen x-extent of a loft's ring at height y (for clamping hidden edges). */
export function ringExtent(secs: Sec[], y: number, v: View, xf: Xf = ID): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let a = 0; a < 360; a += 7.5) {
    const s = surf(secs, y, a, v, xf);
    lo = Math.min(lo, s.p[0]);
    hi = Math.max(hi, s.p[0]);
  }
  return [lo, hi];
}

// ---------------------------------------------------------------- contour bands (sheens, rims)

/** Resample a closed outline to `n` points evenly spaced by arc length (corners are smoothed away: for bands only). */
export function resampleClosed(pts: PP[], n: number): V2[] {
  const P: V2[] = pts.map((p) => [p[0], p[1]]);
  const m = P.length;
  const seg: number[] = [];
  let tot = 0;
  for (let i = 0; i < m; i++) {
    const a = P[i];
    const b = P[(i + 1) % m];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(l);
    tot += l;
  }
  const out: V2[] = [];
  let j = 0;
  let acc = 0;
  for (let k = 0; k < n; k++) {
    const s = (tot * k) / n;
    while (j < m - 1 && acc + seg[j] < s) {
      acc += seg[j];
      j++;
    }
    const u = seg[j] ? (s - acc) / seg[j] : 0;
    const a = P[j];
    const b = P[(j + 1) % m];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}

/** The signed area of a closed polygon (screen coords: > 0 = clockwise on screen, y down). */
export function areaOf(P: V2[]): number {
  let s = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    const b = P[(i + 1) % P.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

export type BandOpts = {
  /** The light's direction on screen (toward the light), unit. */
  key: V2;
  /** Where the band may sit: the outward normal's dot with `key` must exceed this. */
  minDot?: number;
  /** The band's gap from the contour and its thickness (screen units) at its middle. */
  gap: number;
  width: number;
  /** Only the part of the run nearest this point (screen units), max this arc length. */
  near?: V2;
  maxLen?: number;
  /** Extra screen-space restriction (a point must pass to be in the run). */
  where?: (p: V2) => boolean;
  /** How many samples around the contour. */
  samples?: number;
  /** How the thickness tapers along the run (u 0..1): default a sine. */
  taper?: (u: number) => number;
};

/** A crescent band set just inside a closed outline where it faces the light: a hair sheen, a satin highlight, a rim.
 *  Returns a closed outline (the outer edge along the contour, the inner edge offset inward), or null. */
export function contourBand(pts: PP[], o: BandOpts): PP[] | null {
  const n = o.samples ?? 160;
  const P = resampleClosed(pts, n);
  if (P.length < 8) return null;
  const cw = areaOf(P) > 0;
  // smoothed outward normals
  const N: V2[] = P.map((_, i) => {
    const a = P[(i - 3 + n) % n];
    const b = P[(i + 3) % n];
    const t: V2 = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(t[0], t[1]) || 1;
    // positive signed area (x right, y down): the outward normal of the tangent t is (t.y, -t.x)
    return cw ? [t[1] / l, -t[0] / l] : [-t[1] / l, t[0] / l];
  });
  const minDot = o.minDot ?? 0.35;
  const ok = P.map((p, i) => N[i][0] * o.key[0] + N[i][1] * o.key[1] > minDot && (!o.where || o.where(p)));
  // the runs of consecutive ok samples (circular)
  const runs: number[][] = [];
  let start = ok.findIndex((v) => !v);
  if (start < 0) start = 0;
  let cur: number[] = [];
  for (let k = 1; k <= n; k++) {
    const i = (start + k) % n;
    if (ok[i]) cur.push(i);
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  if (!runs.length) return null;
  let run: number[];
  if (o.near) {
    const d = (r: number[]) => Math.min(...r.map((i) => Math.hypot(P[i][0] - o.near![0], P[i][1] - o.near![1])));
    run = runs.reduce((a, b) => (d(a) <= d(b) ? a : b));
  } else run = runs.reduce((a, b) => (a.length >= b.length ? a : b));
  // limit the arc length (centred on the sample nearest `near`, or the middle)
  if (o.maxLen) {
    const step = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]) || 1;
    const maxN = Math.max(4, Math.round(o.maxLen / step));
    if (run.length > maxN) {
      let c = Math.floor(run.length / 2);
      if (o.near) {
        let bd = Infinity;
        run.forEach((i, k) => {
          const dd = Math.hypot(P[i][0] - o.near![0], P[i][1] - o.near![1]);
          if (dd < bd) {
            bd = dd;
            c = k;
          }
        });
      }
      const a = clamp(c - Math.floor(maxN / 2), 0, run.length - maxN);
      run = run.slice(a, a + maxN);
    }
  }
  if (run.length < 4) return null;
  const tp = o.taper ?? ((u: number) => Math.sin(Math.PI * u) ** 0.8);
  const outer: PP[] = [];
  const inner: PP[] = [];
  run.forEach((i, k) => {
    const u = k / (run.length - 1);
    const w = o.width * tp(u);
    const g = o.gap * (0.6 + 0.4 * tp(u));
    const p = P[i];
    const nn = N[i];
    outer.push([p[0] - nn[0] * g, p[1] - nn[1] * g]);
    inner.push([p[0] - nn[0] * (g + w), p[1] - nn[1] * (g + w)]);
  });
  return [...outer, ...inner.reverse()];
}

/** Scallop a closed outline: displace the samples that pass `where` outward by rounded lobes (curls, coils, twists,
 *  foliage-like hems). Lobes vary in size (hash), their valleys stay on the original contour. */
export function scallop(pts: PP[], o: {period: number; amp: number; where: (p: V2) => boolean; seed?: number; samples?: number; sharp?: number}): PP[] {
  const n = o.samples ?? 220;
  const P = resampleClosed(pts, n);
  const cw = areaOf(P) > 0;
  const N: V2[] = P.map((_, i) => {
    const a = P[(i - 2 + n) % n];
    const b = P[(i + 2) % n];
    const t: V2 = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(t[0], t[1]) || 1;
    return cw ? [t[1] / l, -t[0] / l] : [-t[1] / l, t[0] / l];
  });
  let tot = 0;
  const S: number[] = [0];
  for (let i = 1; i < n; i++) {
    tot += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    S.push(tot);
  }
  // a smooth on/off mask so the lobes fade in and out at the region's ends
  const on = P.map((p) => (o.where(p) ? 1 : 0));
  const mask = on.map((_, i) => {
    let s = 0;
    for (let k = -4; k <= 4; k++) s += on[(i + k + n) % n];
    return s / 9;
  });
  return P.map((p, i) => {
    const u = S[i] / o.period;
    const j = Math.floor(u);
    const f = u - j;
    const a = o.amp * (0.55 + 0.45 * hash(j * 3.71 + (o.seed ?? 0)));
    const lobe = Math.sin(Math.PI * f) ** (o.sharp ?? 0.55);
    const d = a * lobe * mask[i];
    return [p[0] + N[i][0] * d, p[1] + N[i][1] * d] as PP;
  });
}
