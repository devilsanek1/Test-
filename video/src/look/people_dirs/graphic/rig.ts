// MODERN GRAPHIC people: the 3D rig behind the flat drawing. Bodies and garments are a few horizontal RINGS (lofted
// into an outline) and limbs are TUBES (a joint chain with radii). A view is a yaw about the vertical; the projection
// is orthographic with a gentle eye-level perspective (a ring below the eye shows its front arc a little lower, so hems
// and soles bow down as they do to a standing viewer: design_research.md C10). The light is ONE key from the upper
// left; every terminator is computed, then drawn as a crisp straight-ish line (two flat tones per form, DIRECTION 5).
import {V2, V3, cross3, dot3, norm3, add3, mul3, sub3, rad} from './geo';

/** Units: H = 1000 (crown to sole). Body space: x = her left, y = up from the sole, z = her front. */
export type Cam = {
  /** the body's yaw: 0 faces the camera, -90 = profile facing screen-left, 180 = the back */
  yaw: number;
  /** eye height of the viewer (body units) and its distance: the perspective of the hems */
  eye: number;
  dist: number;
  /** toward the key light, in camera space (x right, y up, z toward the camera) */
  light: V3;
};
export const LIGHT: V3 = norm3([-0.78, 0.42, 0.46]);
export const cam = (yaw: number, o: Partial<Cam> = {}): Cam => ({yaw, eye: 930, dist: 6000, light: LIGHT, ...o});

/** Body space -> camera space (rotation about the vertical by the yaw). */
export function toCam(p: V3, c: Cam): V3 {
  const t = rad(c.yaw);
  return [p[0] * Math.cos(t) + p[2] * Math.sin(t), p[1], -p[0] * Math.sin(t) + p[2] * Math.cos(t)];
}
/** A camera-space direction back to body space. */
export function fromCam(v: V3, c: Cam): V3 {
  const t = rad(c.yaw);
  return [v[0] * Math.cos(t) - v[2] * Math.sin(t), v[1], v[0] * Math.sin(t) + v[2] * Math.cos(t)];
}
/** Camera space -> the figure's local screen (x right, y down; the crown at y 0, the sole at y 1000). */
export function screen(q: V3, c: Cam): V2 {
  return [q[0], 1000 - q[1] + (q[2] * (c.eye - q[1])) / c.dist];
}
export const proj = (p: V3, c: Cam): V2 => screen(toCam(p, c), c);
/** depth toward the camera (bigger = nearer) */
export const depth = (p: V3, c: Cam) => toCam(p, c)[2];

// ---------------------------------------------------------------- rings (torsos, garments)
/** A horizontal ellipse: centre (x, z) at height y, half-width a (along x), half-depth b (along z), its own yaw
 *  `tw` (a twist of the hips or shoulders) and `roll` (degrees: + raises her left side). */
export type Ring = {y: number; a: number; b: number; x?: number; z?: number; tw?: number; roll?: number};

/** The body-space point of a ring at angle phi (0 = her left, 90 = her front). */
export function ringP(r: Ring, phi: number): V3 {
  const t = rad(r.tw ?? 0);
  const ca = r.a * Math.cos(rad(phi));
  const sb = r.b * Math.sin(rad(phi));
  const lx = ca * Math.cos(t) + sb * Math.sin(t);
  const lz = -ca * Math.sin(t) + sb * Math.cos(t);
  const y = r.y + lx * Math.tan(rad(r.roll ?? 0));
  return [(r.x ?? 0) + lx, y, (r.z ?? 0) + lz];
}
/** The ring's outward normal at phi (body space). */
function ringN(r: Ring, phi: number): V3 {
  const t = rad(r.tw ?? 0);
  const nx = Math.cos(rad(phi)) / Math.max(1e-6, r.a);
  const nz = Math.sin(rad(phi)) / Math.max(1e-6, r.b);
  return norm3([nx * Math.cos(t) + nz * Math.sin(t), 0, -nx * Math.sin(t) + nz * Math.cos(t)]);
}
/** The angles of the ring's two silhouette points (screen-left one first) and of its visible terminator. */
export function ringAngles(r: Ring, c: Cam): {left: number; right: number; term: number | null; frontLit: boolean} {
  // sample: the silhouette is where x_cam is extreme; the terminator where n.L changes sign on the visible half
  let minX = Infinity;
  let maxX = -Infinity;
  let left = 0;
  let right = 0;
  const N = 180;
  const lit: boolean[] = [];
  const zc: number[] = [];
  for (let i = 0; i < N; i++) {
    const phi = (i * 360) / N;
    const q = toCam(ringP(r, phi), c);
    if (q[0] < minX) {
      minX = q[0];
      left = phi;
    }
    if (q[0] > maxX) {
      maxX = q[0];
      right = phi;
    }
    const n = toCam(ringN(r, phi), c);
    lit.push(n[0] * c.light[0] + n[2] * c.light[2] > 0);
    zc.push(n[2]);
  }
  let term: number | null = null;
  let best = -Infinity;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    if (lit[i] !== lit[j] && zc[i] + zc[j] > best) {
      best = zc[i] + zc[j];
      term = ((i + 0.5) * 360) / N;
    }
  }
  if (best < 0) term = null; // the terminator is round the back: all of the visible half is lit or shaded
  // the frontmost point's light
  let fi = 0;
  for (let i = 0; i < N; i++) if (zc[i] > zc[fi]) fi = i;
  return {left, right, term, frontLit: lit[fi]};
}
/** The visible (camera-facing) arc of a ring from angle a0 to a1 going the front way round, as screen points. */
export function frontArc(r: Ring, c: Cam, a0: number, a1: number, n = 10): V2[] {
  // go from a0 to a1 through the side that faces the camera
  const mid1 = a0 + (((a1 - a0 + 360) % 360) / 2);
  const mid2 = mid1 + 180;
  const z1 = toCam(ringP(r, mid1), c)[2];
  const z2 = toCam(ringP(r, mid2), c)[2];
  const span = (a1 - a0 + 360) % 360;
  const out: V2[] = [];
  if (z1 >= z2) for (let i = 0; i <= n; i++) out.push(proj(ringP(r, a0 + (span * i) / n), c));
  else for (let i = 0; i <= n; i++) out.push(proj(ringP(r, a0 - ((360 - span) * i) / n), c));
  return out;
}

export type Loft = {
  /** the outline: the top's front arc (right to left), the left side down, the bottom's front arc, the right side up */
  outline: V2[];
  left: V2[];
  right: V2[];
  /** the shade region (a polygon to clip by the outline), or '' */
  shade: V2[];
  bottom: V2[];
  top: V2[];
};
/** Loft rings (top to bottom) into a flat outline with its computed two-tone split. */
export function loft(rings: Ring[], c: Cam, o: {arcN?: number; shadeMin?: number} = {}): Loft {
  const L: V2[] = [];
  const R: V2[] = [];
  const T: V2[] = [];
  const angs = rings.map((r) => ringAngles(r, c));
  rings.forEach((r, i) => {
    L.push(proj(ringP(r, angs[i].left), c));
    R.push(proj(ringP(r, angs[i].right), c));
  });
  // the terminator line: per ring, else the silhouette on the shade side
  let shadeOnRight = true;
  rings.forEach((r, i) => {
    const a = angs[i];
    if (a.term !== null) T.push(proj(ringP(r, a.term), c));
    else T.push(a.frontLit ? R[i] : L[i]);
  });
  // which side is shaded: the light comes from screen-left when its x is negative
  shadeOnRight = c.light[0] <= 0;
  const top = frontArc(rings[0], c, angs[0].right, angs[0].left, o.arcN ?? 10);
  const last = rings.length - 1;
  const bottom = frontArc(rings[last], c, angs[last].left, angs[last].right, o.arcN ?? 10);
  const outline = top.concat(L.slice(1, -1), bottom, R.slice(1, -1).reverse());
  let shade: V2[] = [];
  if (shadeOnRight) {
    // from the terminator to far right
    shade = T.concat(T.slice().reverse().map((q) => [q[0] + 3000, q[1]] as V2));
  } else {
    shade = T.concat(T.slice().reverse().map((q) => [q[0] - 3000, q[1]] as V2));
  }
  // extend the shade polygon above and below so the clip, not the polygon, ends it
  if (shade.length) {
    const first = T[0];
    const lastT = T[T.length - 1];
    shade = ([[first[0], first[1] - 400]] as V2[]).concat(T, [[lastT[0], lastT[1] + 400]] as V2[]);
    const dx = shadeOnRight ? 3000 : -3000;
    shade = shade.concat([[lastT[0] + dx, lastT[1] + 400]] as V2[], [[first[0] + dx, first[1] - 400]] as V2[]);
  }
  return {outline, left: L, right: R, shade, bottom, top};
}
/** A point on the loft's surface: ring i at angle phi, with its depth (to know if it faces the camera). */
export function surf(r: Ring, phi: number, c: Cam): {p: V2; z: number; facing: boolean} {
  const q = toCam(ringP(r, phi), c);
  const n = toCam(ringN(r, phi), c);
  return {p: screen(q, c), z: q[2], facing: n[2] > 0};
}

// ---------------------------------------------------------------- tubes (limbs, sleeves, trouser legs)
export type Tube = {
  axis: V2[];
  /** the two silhouettes, joint by joint: A = +m side, B = -m side */
  A: V2[];
  B: V2[];
  /** the visible terminator, joint by joint */
  T: V2[];
  /** which silhouette is in shade */
  shadeSide: 'A' | 'B';
  /** the mean depth (camera space) */
  z: number;
  /** the screen direction at each joint (unit) */
  dirs: V2[];
};
export function tube(chain: V3[], radii: number[], c: Cam): Tube {
  const Q = chain.map((p) => toCam(p, c));
  const n = Q.length;
  const V: V3 = [0, 0, 1];
  const A: V2[] = [];
  const B: V2[] = [];
  const T: V2[] = [];
  const dirs: V2[] = [];
  let shadeVotes = 0;
  let lastM: V3 = [1, 0, 0];
  for (let i = 0; i < n; i++) {
    const a = Q[Math.max(0, i - 1)];
    const b = Q[Math.min(n - 1, i + 1)];
    const d = norm3(sub3(b, a));
    let m = cross3(d, V);
    if (Math.hypot(m[0], m[1], m[2]) < 1e-3) m = lastM;
    m = norm3(m);
    lastM = m;
    const r = radii[i];
    A.push(screen(add3(Q[i], mul3(m, r)), c));
    B.push(screen(add3(Q[i], mul3(m, -r)), c));
    let t = cross3(d, c.light);
    if (Math.hypot(t[0], t[1], t[2]) < 1e-4) t = m;
    t = norm3(t);
    if (dot3(t, V) < 0) t = mul3(t, -1);
    T.push(screen(add3(Q[i], mul3(t, r)), c));
    shadeVotes += dot3(m, c.light) < 0 ? 1 : -1;
    const sd = screen(d, c);
    const s0 = screen([0, 0, 0], c);
    const dd: V2 = [sd[0] - s0[0], sd[1] - s0[1]];
    const l = Math.hypot(dd[0], dd[1]) || 1;
    dirs.push([dd[0] / l, dd[1] / l]);
  }
  const axis = Q.map((q) => screen(q, c));
  const z = Q.reduce((s, q) => s + q[2], 0) / n;
  return {axis, A, B, T, shadeSide: shadeVotes >= 0 ? 'A' : 'B', z, dirs};
}
/** The tube's shade region: the terminator, then the shaded silhouette pushed outward (clip it by the tube). */
export function tubeShade(t: Tube, push = 60): V2[] {
  const S = t.shadeSide === 'A' ? t.A : t.B;
  const out = S.map((q, i) => {
    const v: V2 = [q[0] - t.T[i][0], q[1] - t.T[i][1]];
    const l = Math.hypot(v[0], v[1]) || 1;
    return [q[0] + (v[0] / l) * push, q[1] + (v[1] / l) * push] as V2;
  });
  // extend both ends along the axis so the caps are covered too
  const d0 = t.dirs[0];
  const d1 = t.dirs[t.dirs.length - 1];
  const T0: V2 = [t.T[0][0] - d0[0] * push, t.T[0][1] - d0[1] * push];
  const T1: V2 = [t.T[t.T.length - 1][0] + d1[0] * push, t.T[t.T.length - 1][1] + d1[1] * push];
  const O0: V2 = [out[0][0] - d0[0] * push, out[0][1] - d0[1] * push];
  const O1: V2 = [out[out.length - 1][0] + d1[0] * push, out[out.length - 1][1] + d1[1] * push];
  return [T0, ...t.T, T1, O1, ...out.slice().reverse(), O0];
}
/** The visible fraction of the tube in shade at joint i (0..1), for decisions such as hiding a hairline sliver. */
export function shadeFrac(t: Tube, i: number): number {
  const S = t.shadeSide === 'A' ? t.A[i] : t.B[i];
  const O = t.shadeSide === 'A' ? t.B[i] : t.A[i];
  const w = Math.hypot(S[0] - O[0], S[1] - O[1]) || 1;
  return Math.hypot(S[0] - t.T[i][0], S[1] - t.T[i][1]) / w;
}
