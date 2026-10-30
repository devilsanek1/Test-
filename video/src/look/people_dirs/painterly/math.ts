// people_dirs/painterly: 3D and spline helpers for the 2.5D figure engine (docs/look/people_design/dir_painterly.md).
// Model space: H = 1000 units (sole at y = 0, crown at y = 1000), +y up, +z the figure's forward, +x the figure's LEFT
// (screen right when the figure faces the camera). Angles in degrees.
export type V3 = [number, number, number];
export type V2 = [number, number];
/** Row-major 3x3 matrix. */
export type M3 = [V3, V3, V3];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const nrm = (a: V3): V3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const madd = (a: V3, b: V3, k: number): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const avg = (ps: V3[]): V3 => {
  const s: V3 = [0, 0, 0];
  for (const p of ps) {
    s[0] += p[0];
    s[1] += p[1];
    s[2] += p[2];
  }
  const n = ps.length || 1;
  return [s[0] / n, s[1] / n, s[2] / n];
};

export const D2R = Math.PI / 180;
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
/** A gaussian bump: 1 at x = c, falling with sigma s. */
export const bump = (x: number, c: number, s: number) => Math.exp(-((x - c) * (x - c)) / (2 * s * s));
/** Wrap an angle (degrees) into (-180, 180]. */
export const wrapDeg = (a: number) => {
  let r = ((a + 180) % 360 + 360) % 360 - 180;
  if (r === -180) r = 180;
  return r;
};

export const mulMV = (m: M3, v: V3): V3 => [dot(m[0], v), dot(m[1], v), dot(m[2], v)];
export const mulMM = (a: M3, b: M3): M3 => {
  const c = (j: number): V3 => [b[0][j], b[1][j], b[2][j]];
  const r = (i: number): V3 => [dot(a[i], c(0)), dot(a[i], c(1)), dot(a[i], c(2))];
  return [r(0), r(1), r(2)];
};
export const I3: M3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
/** About +y: positive turns the forward (+z) toward +x (the figure turns to its left). */
export const rotY = (a: number): M3 => {
  const c = Math.cos(a * D2R);
  const s = Math.sin(a * D2R);
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ];
};
/** About +x: positive tips the top forward (+z): a nod. */
export const rotX = (a: number): M3 => {
  const c = Math.cos(a * D2R);
  const s = Math.sin(a * D2R);
  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c],
  ];
};
/** About +z: positive raises the +x side (the figure's left) and tips the top toward -x. */
export const rotZ = (a: number): M3 => {
  const c = Math.cos(a * D2R);
  const s = Math.sin(a * D2R);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
};
/** yaw (y), then pitch (x), then roll (z), applied to a local vector in that order from the outside in. */
export const euler = (yaw = 0, pitch = 0, roll = 0): M3 => mulMM(rotY(yaw), mulMM(rotX(pitch), rotZ(roll)));

export type Frame = {o: V3; m: M3};
export const toWorld = (f: Frame, p: V3): V3 => add(f.o, mulMV(f.m, p));
export const axisX = (f: Frame): V3 => [f.m[0][0], f.m[1][0], f.m[2][0]];
export const axisY = (f: Frame): V3 => [f.m[0][1], f.m[1][1], f.m[2][1]];
export const axisZ = (f: Frame): V3 => [f.m[0][2], f.m[1][2], f.m[2][2]];
/** A frame from three (not necessarily orthogonal) axes: y kept, z made orthogonal, x = y x z. */
export const frameFrom = (o: V3, y: V3, zHint: V3): Frame => {
  const Y = nrm(y);
  const X = nrm(cross(Y, zHint));
  const Z = cross(X, Y);
  return {
    o,
    m: [
      [X[0], Y[0], Z[0]],
      [X[1], Y[1], Z[1]],
      [X[2], Y[2], Z[2]],
    ],
  };
};

/** Catmull-Rom through (u, value) knots sorted by u; clamped at the ends. */
export function spline(k0: ReadonlyArray<readonly [number, number]>, u: number): number {
  const k = k0.length > 1 && k0[0][0] > k0[k0.length - 1][0] ? [...k0].reverse() : k0;
  const n = k.length;
  if (u <= k[0][0]) return k[0][1];
  if (u >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (i < n - 2 && u > k[i + 1][0]) i++;
  const p0 = k[Math.max(0, i - 1)];
  const p1 = k[i];
  const p2 = k[i + 1];
  const p3 = k[Math.min(n - 1, i + 2)];
  const t = (u - p1[0]) / (p2[0] - p1[0] || 1);
  // tangents scaled to the knot spacing (non-uniform Catmull-Rom, finite differences)
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0] || 1)) * (p2[0] - p1[0]);
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0] || 1)) * (p2[0] - p1[0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
}

/** A point along a polyline chain at parameter t in [0, 1] (by length), and its unit tangent. */
export function chainAt(chain: V3[], t: number): {p: V3; d: V3} {
  const L: number[] = [0];
  for (let i = 1; i < chain.length; i++) L.push(L[i - 1] + len(sub(chain[i], chain[i - 1])));
  const total = L[L.length - 1] || 1;
  const x = clamp(t, 0, 1) * total;
  let i = 0;
  while (i < chain.length - 2 && x > L[i + 1]) i++;
  const seg = L[i + 1] - L[i] || 1;
  const k = (x - L[i]) / seg;
  const p = lerp(chain[i], chain[i + 1], k);
  // a smoothed tangent: blend the neighbouring segment directions near a joint
  const dA = nrm(sub(chain[i + 1], chain[i]));
  let d = dA;
  const blend = 0.35;
  if (k > 1 - blend && i + 2 < chain.length) {
    const dB = nrm(sub(chain[i + 2], chain[i + 1]));
    d = nrm(lerp(dA, dB, 0.5 * smooth(1 - blend, 1, k)));
  } else if (k < blend && i > 0) {
    const dP = nrm(sub(chain[i], chain[i - 1]));
    d = nrm(lerp(dP, dA, 0.5 + 0.5 * smooth(0, blend, k)));
  }
  return {p, d};
}
export const chainLength = (chain: V3[]) => {
  let s = 0;
  for (let i = 1; i < chain.length; i++) s += len(sub(chain[i], chain[i - 1]));
  return s;
};

/** Two-bone IK: the middle joint between root and end (bone lengths a, b), bending toward `hint`. */
export function ik3(root: V3, end: V3, a: number, b: number, hint: V3): V3 {
  const d = sub(end, root);
  const D = Math.min(len(d), a + b - 1e-3);
  const u = nrm(d);
  const x = (a * a - b * b + D * D) / (2 * D);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  // the bend direction: the hint made perpendicular to the root-end line
  const perp = nrm(sub(hint, scl(u, dot(hint, u))));
  return add(add(root, scl(u, x)), scl(perp, h));
}

/** A deterministic hash noise in [0, 1) (for seeded variation: fold lobes, curl sizes). */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/** Round a polyline's corners: each interior vertex becomes a short quadratic arc of about radius r (a knee, an elbow),
 *  so the rings of a tube built along it never fold through each other on the inside of the bend. */
export function fillet(chain: V3[], r: number, n = 7): V3[] {
  if (chain.length < 3) return chain;
  const out: V3[] = [chain[0]];
  for (let i = 1; i < chain.length - 1; i++) {
    const P = chain[i];
    const a = sub(P, chain[i - 1]);
    const b = sub(chain[i + 1], P);
    const la = len(a);
    const lb = len(b);
    const u1 = nrm(a);
    const u2 = nrm(b);
    const th = Math.acos(clamp(dot(u1, u2), -1, 1));
    const d = Math.min(r * Math.tan(th / 2), la * 0.45, lb * 0.45);
    if (d < 0.5) {
      out.push(P);
      continue;
    }
    const A = sub(P, scl(u1, d));
    const B = add(P, scl(u2, d));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const q1 = lerp(A, P, t);
      const q2 = lerp(P, B, t);
      out.push(lerp(q1, q2, t));
    }
  }
  out.push(chain[chain.length - 1]);
  return out;
}
