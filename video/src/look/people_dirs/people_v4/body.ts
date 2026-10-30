// PEOPLE v4 (docs/look/people_design/faces_v2/V4.md): THE BODY API. body(sex, build, pose, outfit) returns the figure's
// parts (body units, H = 1000, the figure's local screen: the crown at y 0, the sole at y 1000), its skeleton, and the
// head's placement for head() (head.ts placeHead). The composition is the recipe's (faces_v2/RECIPE.md section 3): her
// waist ~0.69 of her hips, shoulders sloping 19 degrees and no wider than the hips + 15, slim wrists and ankles; his V
// (shoulders ~1.6x the waist), a thick neck flaring into the shoulders. Tasteful and generic: never a bust or hip
// exaggeration, no muscle display. Built on the current skeleton (hair_v2/stance.ts skelV2 with the UPRIGHT neck and
// the relaxed stance: the weight on one leg, an arm off the body) and the rig's projection (graphic/rig.ts), but every
// outline is SMOOTH: the limbs are tubes with authored radius profiles (the thigh's taper, the knee's narrowing, the
// calf, the slim ankle; the deltoid, the forearm's swell, the slim wrist), the torso rings at the recipe's widths, and
// each silhouette is joined as one smooth curve (pen.ts through), never a rounded polygon. Two tones and a crisp
// terminator per form, a soft gradient inside the lit plane.
import type {V2, V3} from '../graphic/geo';
import {cam, loft, tube, toCam, proj, type Cam, type Ring} from '../graphic/rig';
import {framePt, type Build, type Frame} from '../graphic/body';
import {fr, blend} from '../graphic/wear';
import {mixLab, type Tone} from '../graphic/color';
import {build as buildV2, skelV2, standV2, walkV2, armAt, shoulderOf, UPRIGHT, type BuildName, type PoseV2, type SkelV2} from '../hair_v2/stance';
import {headFrame} from '../graphic_faces/head';
import {through, type Seg} from './pen';
import {polySegs, type PartV4, type Paint, type Region} from './paint';
import type {Sex} from './faces';

// ---------------------------------------------------------------- the composition (RECIPE section 3)
/** The recipe's widths (full widths, H = 1000) for the average build; the other builds move them by their factor. */
const COMP = {
  f: {skull: 128, neckW: 40, shoulderW: 228, slope: 19, chestW: 194, waistW: 148, hipW: 214, knee: 54, calf: 62, ankle: 27, thigh: 100, arm: 44, elbow: 34, fore: 40, wrist: 24, hand: 94, foot: 140, chestD: 128, waistD: 108, hipD: 144},
  m: {skull: 125, neckW: 62, shoulderW: 290, slope: 13, chestW: 252, waistW: 180, hipW: 190, knee: 70, calf: 78, ankle: 38, thigh: 112, arm: 66, elbow: 50, fore: 58, wrist: 36, hand: 108, foot: 160, chestD: 160, waistD: 124, hipD: 132},
};
export type Comp = (typeof COMP)['f'];
/** A build's composition: the recipe's ratios held, the widths moved by +-15-20 (never inverting the ratios). */
export function compOf(sex: Sex, kind: BuildName): Comp {
  const c = {...COMP[sex]};
  const k = {slim: -1, average: 0, athletic: 0.6, soft: 1}[kind];
  const s = kind === 'athletic' ? 1 : 0;
  c.waistW += k * (sex === 'f' ? 12 : 16) - s * 6;
  c.hipW += k * (sex === 'f' ? 14 : 10);
  c.shoulderW += k * 10 + s * 10;
  c.chestW += k * 10 + s * 10;
  c.thigh += k * 10;
  c.calf += k * 5;
  c.arm += k * 4 + s * 4;
  return c;
}
/** The skeleton's Build with the recipe's composition (the heights stay stance.ts's). */
export function buildV4(sex: Sex, kind: BuildName): Build {
  const b = buildV2(sex, kind);
  const c = compOf(sex, kind);
  return {
    ...b,
    skull: c.skull,
    neckW: c.neckW,
    shoulderW: c.shoulderW,
    chestW: c.chestW,
    waistW: c.waistW,
    hipW: c.hipW,
    thighR: c.thigh / 2,
    kneeR: c.knee / 2,
    calfR: c.calf / 2,
    ankleR: c.ankle / 2,
    armR: c.arm / 2,
    elbowR: c.elbow / 2,
    wristR: c.wrist / 2,
    hand: c.hand,
    foot: c.foot,
    chestD: c.chestD / 2,
    waistD: c.waistD / 2,
    hipD: c.hipD / 2,
  };
}

// ---------------------------------------------------------------- smooth tubes and lofts
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const d3 = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** Points along a joint chain by length (a gentle Catmull-Rom axis through the joints), with t (0..1) for each. */
function axis(chain: V3[], n: number): {p: V3[]; t: number[]} {
  const L: number[] = [0];
  for (let i = 1; i < chain.length; i++) L.push(L[i - 1] + d3(chain[i - 1], chain[i]));
  const tot = L[L.length - 1] || 1;
  const p: V3[] = [];
  const t: number[] = [];
  for (let k = 0; k <= n; k++) {
    const s = (k / n) * tot;
    let i = 1;
    while (i < chain.length - 1 && L[i] < s) i++;
    const u = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    const a = chain[Math.max(0, i - 2)];
    const b = chain[i - 1];
    const c = chain[i];
    const d = chain[Math.min(chain.length - 1, i + 1)];
    // Catmull-Rom (uniform) between b and c
    const u2 = u * u;
    const u3 = u2 * u;
    const q: V3 = [0, 1, 2].map((j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * u3)) as V3;
    p.push(q);
    t.push(k / n);
  }
  return {p, t};
}
/** A smooth tube along a chain with radius r(t): its outline (both silhouettes, rounded caps) and its shade region. */
function smoothTube(chain: V3[], r: (t: number) => number, c: Cam, o: {n?: number; capStart?: number; capEnd?: number} = {}): {outline: Seg[]; shade: Seg[]; z: number; A: V2[]; B: V2[]} {
  const n = o.n ?? 18;
  const ax = axis(chain, n);
  const radii = ax.t.map(r);
  const tb = tube(ax.p, radii, c);
  const A = tb.A;
  const B = tb.B;
  const cap = (P: V2, Q: V2, dir: V2, k: number): V2[] => {
    // a rounded cap from P to Q bulging along dir by k x half the width
    const m: V2 = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
    const hw = Math.hypot(P[0] - Q[0], P[1] - Q[1]) / 2;
    return [
      [m[0] + (P[0] - m[0]) * 0.7 + dir[0] * hw * k * 0.7, m[1] + (P[1] - m[1]) * 0.7 + dir[1] * hw * k * 0.7],
      [m[0] + dir[0] * hw * k, m[1] + dir[1] * hw * k],
      [m[0] + (Q[0] - m[0]) * 0.7 + dir[0] * hw * k * 0.7, m[1] + (Q[1] - m[1]) * 0.7 + dir[1] * hw * k * 0.7],
    ];
  };
  const d0 = tb.dirs[0];
  const d1 = tb.dirs[tb.dirs.length - 1];
  const endCap = cap(A[A.length - 1], B[B.length - 1], d1, o.capEnd ?? 0.55);
  const startCap = cap(B[0], A[0], [-d0[0], -d0[1]], o.capStart ?? 0.55);
  const loopPts: V2[] = [...A, ...endCap, ...B.slice().reverse(), ...startCap];
  const outline = through(loopPts, true, 1);
  // the shade side: the terminator, then out past the shaded silhouette (only seen through the clip)
  const S = tb.shadeSide === 'A' ? A : B;
  const far: V2[] = S.map((q, i) => {
    const v: V2 = [q[0] - tb.T[i][0], q[1] - tb.T[i][1]];
    const l = Math.hypot(v[0], v[1]) || 1;
    return [q[0] + (v[0] / l) * 300, q[1] + (v[1] / l) * 300];
  });
  const e0: V2 = [tb.T[0][0] - d0[0] * 200, tb.T[0][1] - d0[1] * 200];
  const e1: V2 = [tb.T[tb.T.length - 1][0] + d1[0] * 200, tb.T[tb.T.length - 1][1] + d1[1] * 200];
  const f0: V2 = [far[0][0] - d0[0] * 200, far[0][1] - d0[1] * 200];
  const f1: V2 = [far[far.length - 1][0] + d1[0] * 200, far[far.length - 1][1] + d1[1] * 200];
  const termSegs = through([e0, ...tb.T, e1], false, 1);
  const shade: Seg[] = [...termSegs, ...polySegs([e1, f1, ...far.slice().reverse(), f0, e0]).slice(0, far.length + 3)];
  return {outline, shade, z: tb.z, A, B};
}
/** A smooth loft through rings (top to bottom): the outline (the top's and bottom's visible arcs and both
 *  silhouettes) as one smooth curve, and the shade region from the computed terminator. */
function smoothLoft(rings: Ring[], c: Cam): {outline: Seg[]; shade: Seg[]; L: V2[]; R: V2[]} {
  const Lf = loft(rings, c, {arcN: 8});
  const pts: V2[] = [...Lf.top, ...Lf.left.slice(1, -1), ...Lf.bottom, ...Lf.right.slice(1, -1).reverse()];
  const outline = through(pts, true, 1);
  let shade: Seg[] = [];
  if (Lf.shade.length) {
    // the terminator line is Lf.shade's points after the first (the polygon's first and last two points are extensions)
    const T = Lf.shade.slice(1, rings.length + 1);
    const tSegs = through(T, false, 1);
    const rest = Lf.shade.slice(rings.length + 1).concat([Lf.shade[0]]);
    shade = [...polySegs([Lf.shade[0], T[0]]).slice(0, 1), ...tSegs, ...polySegs([T[T.length - 1], ...rest]).slice(0, rest.length)];
  }
  return {outline, shade, L: Lf.left, R: Lf.right};
}

// ---------------------------------------------------------------- the radius profiles (the limbs' authored shapes)
const smooth = (pts: [number, number][]) => (t: number): number => {
  // a smooth (cosine-eased) profile through (t, value) keys
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1];
      const [t1, v1] = pts[i];
      const u = (t - t0) / (t1 - t0);
      const e = (1 - Math.cos(Math.PI * u)) / 2;
      return v0 + (v1 - v0) * e;
    }
  }
  return pts[pts.length - 1][1];
};
/** The leg from the hip joint to the ankle: the thigh's full top, its taper, the knee's narrowing, the calf's swell
 *  high on the shin, the long slim taper to the ankle (05's taper: thigh : ankle ~3.6 : 1 for her). */
function legProfile(c: Comp, sex: Sex, cover = 0): (t: number) => number {
  const h = (w: number) => w / 2 + cover;
  const thigh = c.thigh;
  if (sex === 'f')
    return smooth([
      [0, h(thigh * 1.02)],
      [0.14, h(thigh * 0.94)],
      [0.36, h(thigh * 0.72)],
      [0.48, h(c.knee * 1.02)],
      [0.53, h(c.knee)],
      [0.66, h(c.calf)],
      [0.86, h(c.ankle * 1.25)],
      [1, h(c.ankle)],
    ]);
  return smooth([
    [0, h(thigh * 1.0)],
    [0.16, h(thigh * 0.92)],
    [0.38, h(thigh * 0.74)],
    [0.49, h(c.knee * 1.02)],
    [0.54, h(c.knee)],
    [0.66, h(c.calf)],
    [0.86, h(c.ankle * 1.18)],
    [1, h(c.ankle)],
  ]);
}
/** The arm from the shoulder joint to the wrist: the deltoid's round head, the upper arm, the elbow, the forearm's
 *  swell just below the elbow, the slim wrist. */
function armProfile(c: Comp, cover = 0): (t: number) => number {
  const h = (w: number) => w / 2 + cover;
  return smooth([
    [0, h(c.arm * 1.12)],
    [0.12, h(c.arm * 1.02)],
    [0.38, h(c.arm * 0.88)],
    [0.53, h(c.elbow)],
    [0.62, h(c.fore)],
    [0.8, h(c.fore * 0.82)],
    [1, h(c.wrist)],
  ]);
}

// ---------------------------------------------------------------- the API
export type PoseName = 'stand' | 'walk';
export type Outfit = 'tee';
export type BodyTones = {skin: Tone; top: Tone; bottom: Tone; shoe: Tone};
export type BodyOpts = {
  /** the body's yaw (0 faces the camera, -90 the profile facing screen-left) */
  yaw?: number;
  /** the head's yaw relative to the body (faces never look at the camera: the front view turns the head away) */
  headYaw?: number;
  tones: BodyTones;
  /** draw the neck from the body (true) or leave it to head() (the profile's designed neck) */
  neck?: boolean;
};
export type BodyV4 = {
  parts: PartV4[];
  skel: SkelV2;
  cam: Cam;
  /** where head() goes: placeHead(h, {c, s, rot, mirror}); view = the head's drawn view for its yaw */
  head: {c: V2; s: number; rot: number; yaw: number};
};

/** The relaxed stance's arms: the near arm hangs a little off the body (a gap at the waist, the elbow eased), the
 *  other relaxed at the side. */
function relaxedArms(b: Build, sex: Sex): (chest: Frame) => PoseV2['arms'] {
  return (chest: Frame) => {
    const shL = shoulderOf(b, chest, 'l');
    const shR = shoulderOf(b, chest, 'r');
    return {l: armAt(b, shL, 'l', -4, sex === 'f' ? 13 : 11, 16, 5), r: armAt(b, shR, 'r', 3, sex === 'f' ? 7 : 8, 12, 4)};
  };
}

export function body(sex: Sex, kind: BuildName, pose: PoseName, outfit: Outfit, o: BodyOpts): BodyV4 {
  const b = buildV4(sex, kind);
  const C = compOf(sex, kind);
  const arms = relaxedArms(b, sex);
  const p = pose === 'stand' ? standV2(b, arms, {headYaw: o.headYaw ?? 0, roll: sex === 'm' ? 5 : 7, upright: true}) : walkV2(b, arms, {upright: true});
  if (pose === 'stand') p.head = {...p.head, yaw: o.headYaw ?? 0, roll: 2, pitch: 1, dx: 2};
  const sk = skelV2(p);
  const c = cam(o.yaw ?? 0);
  const T = o.tones;
  const parts: PartV4[] = [];
  const depthZ = (q: V3) => toCam(q, c)[2] * 0.01;
  const m = sex === 'm';
  void outfit;

  // ---- the legs (the trousers: slim, the hem on the shoe) and the shoes
  for (const side of ['l', 'r'] as const) {
    const L = sk.leg[side];
    const hipTop: V3 = [L.hip[0] * 0.9, L.hip[1] + 18, L.hip[2]];
    const ank: V3 = [L.ankle[0], L.ankle[1] + 8, L.ankle[2]];
    const tb = smoothTube([hipTop, L.knee, ank], legProfile(C, sex, 4), c, {capStart: 0.2, capEnd: 0.15});
    const zL = 30 + depthZ(L.knee);
    parts.push({name: `leg-${side}`, segs: tb.outline, fill: litPaint(T.bottom, c), z: zL, regions: [{segs: tb.shade, fill: T.bottom.shade}]});
    parts.push(shoe(sk, side, c, T.shoe, sex, zL + 0.5));
  }
  // ---- the seat (the trousers between the legs, from the waistband to the crotch)
  {
    const pv = sk.pelvis;
    const rings: Ring[] = [
      fr(pv, b.waistY - 30, C.waistW / 2 + 6, C.waistD / 2 + 2),
      fr(pv, b.hipY + 30, C.hipW / 2 - 2, C.hipD / 2 - 6),
      fr(pv, b.hipY - 2, C.hipW / 2, C.hipD / 2 - 8),
      fr(pv, b.crotch + 6, C.hipW / 2 - 28, C.hipD / 2 - 16),
    ];
    const lf = smoothLoft(rings, c);
    parts.push({name: 'seat', segs: lf.outline, fill: litPaint(T.bottom, c), z: 33, regions: lf.shade.length ? [{segs: lf.shade, fill: T.bottom.shade}] : []});
  }
  // ---- the torso in the fitted tee: the shoulders' slope, the chest, the waist, down to the hip
  {
    const ch = sk.chest;
    const pv = sk.pelvis;
    const wa = sk.waist;
    const slopeDrop = Math.tan((C.slope * Math.PI) / 180) * (C.shoulderW / 2 - C.neckW / 2 - 6);
    const topY = b.shoulderY + 20;
    const fit = m ? 6 : 3;
    const rings: Ring[] = [
      fr(ch, topY, C.neckW / 2 + (m ? 16 : 9), C.neckW * 0.62, -6),
      fr(ch, topY - slopeDrop * 0.45, C.neckW / 2 + (C.shoulderW / 2 - C.neckW / 2) * 0.55, C.chestD * 0.36, -4),
      fr(ch, topY - slopeDrop - 4, C.shoulderW / 2 - 8 + fit, C.chestD * 0.4, -2),
      fr(ch, topY - slopeDrop - 26, C.shoulderW / 2 + fit, C.chestD * 0.44, -1),
      fr(ch, b.chestY + 20, C.chestW / 2 + fit, C.chestD / 2 + fit, 0),
      fr(blend(ch, wa, 0.5), (b.chestY + b.waistY) / 2 - 10, (C.chestW + C.waistW) / 4 + fit, (C.chestD + C.waistD) / 4 + fit, 0),
      fr(wa, b.waistY, C.waistW / 2 + fit, C.waistD / 2 + fit, 0),
      fr(blend(wa, pv, 0.6), b.waistY - 55, (C.waistW + C.hipW) / 4 + fit + 2, (C.waistD + C.hipD) / 4 + fit, 0),
      fr(pv, m ? b.hipY + 40 : b.hipY + 34, C.hipW / 2 - (m ? 6 : 10) + fit, C.hipD / 2 + fit - 2, 0),
    ];
    const lf = smoothLoft(rings, c);
    parts.push({name: 'top', segs: lf.outline, fill: litPaint(T.top, c), z: 40, regions: lf.shade.length ? [{segs: lf.shade, fill: T.top.shade}] : []});
  }
  // ---- the arms: the sleeve (the tee's short sleeve), the bare arm, the hand
  for (const side of ['l', 'r'] as const) {
    const A = sk.arm[side];
    const z = toCam(A.el, c)[2] > toCam([sk.chest.x, b.chestY, sk.chest.z], c)[2] - 30 ? 60 + depthZ(A.el) : 22 + depthZ(A.el);
    // the arm starts just under the shoulder line (the torso's slope is the shoulder's outline, never a pad above it)
    const sh: V3 = [A.sh[0], A.sh[1] - 8, A.sh[2]];
    const ap = armProfile(C);
    const arm = smoothTube([sh, A.el, A.wr], ap, c, {capStart: 0.35, capEnd: 0.3});
    parts.push({name: `arm-${side}`, segs: arm.outline, fill: litPaint(T.skin, c), z, regions: [{segs: arm.shade, fill: T.skin.shade}]});
    // the short sleeve: from above the shoulder to 40% of the upper arm, a little roomier than the arm
    const cuff = lerp3(A.sh, A.el, 0.42);
    const top: V3 = [A.sh[0], A.sh[1] - 6, A.sh[2]];
    const sl = smoothTube([top, lerp3(top, cuff, 0.5), cuff], (t) => (C.arm / 2) * (1.1 - 0.06 * t) + (m ? 5 : 3), c, {capStart: 0.3, capEnd: 0.08, n: 8});
    parts.push({name: `sleeve-${side}`, segs: sl.outline, fill: litPaint(T.top, c), z: z + 0.3, regions: [{segs: sl.shade, fill: T.top.shade}]});
    parts.push(hand(sk, side, c, T.skin, C, z + 0.5));
  }
  // ---- the neck (when the body draws it): an upright column, deeper than wide, flaring into the shoulders
  if (o.neck ?? true) parts.push(neckPart(sk, c, T.skin, C, sex));

  const hf = headFrame(sk, c);
  return {parts, skel: sk, cam: c, head: {c: hf.c, s: hf.s, rot: hf.rot, yaw: hf.yaw}};
}

/** The lit plane's gentle gradient: warmer and lighter toward the key (upper left), a touch deeper away from it. */
function litPaint(t: Tone, c: Cam): Paint {
  void c;
  return {lin: [[-260, 0], [260, 700]], stops: [[0, mixLab(t.lit, t.sheen, 0.12)], [0.6, t.lit], [1, mixLab(t.lit, t.shade, 0.12)]]};
}

/** The neck: rings from the base (wider, the trapezius' flare for him) up under the skull; one shade plane. */
function neckPart(sk: SkelV2, c: Cam, skin: Tone, C: Comp, sex: Sex): PartV4 {
  const nb = sk.neckBase;
  const hc = sk.head.c;
  const s = sk.b.skull;
  const r = C.neckW / 2;
  const yt = hc[1] - 0.18 * s;
  const yb = nb[1] - 14;
  const zt = hc[2] - 0.12 * s;
  const zb = nb[2] + 4;
  const at = (y: number) => zb + ((zt - zb) * (y - yb)) / (yt - yb);
  const ax = (y: number) => nb[0] + ((hc[0] - nb[0]) * (y - yb)) / (yt - yb);
  const flare = sex === 'm' ? 1.5 : 1.18;
  const ys = [yt, hc[1] - 0.42 * s, (hc[1] - 0.5 * s + yb) / 2, yb + 10, yb];
  const rs = [r * 0.96, r, r * 0.98, r * (1 + (flare - 1) * 0.45), r * flare];
  const rings: Ring[] = ys.map((y, i) => ({y, a: rs[i], b: rs[i] * 1.35, x: ax(y), z: at(y)}));
  const lf = smoothLoft(rings, c);
  const regs: Region[] = [];
  return {name: 'neck', segs: lf.outline, fill: {lin: [[0, 1000 - (hc[1] - 0.45 * s)], [0, 1000 - yb]], stops: [[0, skin.shade], [1, mixLab(skin.shade, skin.lit, 0.25)]]}, z: 50, regions: regs};
}

/** The hand: one smooth mitten shape along the forearm's direction (the palm, the closed fingers, the thumb's soft
 *  bump), slim for her; the far edge in shade. */
function hand(sk: SkelV2, side: 'l' | 'r', c: Cam, skin: Tone, C: Comp, z: number): PartV4 {
  const A = sk.arm[side];
  const w0 = proj(A.wr, c);
  const e0 = proj(A.el, c);
  const dx = w0[0] - e0[0];
  const dy = w0[1] - e0[1];
  const l = Math.hypot(dx, dy) || 1;
  const d: V2 = [dx / l, dy / l];
  const nrm: V2 = [-d[1], d[0]];
  const L = C.hand;
  const W = C.wrist / 2;
  const P = (u: number, v: number): V2 => [w0[0] + d[0] * u + nrm[0] * v, w0[1] + d[1] * u + nrm[1] * v];
  const thumbSide = side === 'l' ? -1 : 1;
  const pts: V2[] = [
    P(-6, W * 0.95),
    P(L * 0.25, W * 1.32),
    P(L * 0.55, W * 1.22),
    P(L * 0.82, W * 0.82),
    P(L * 0.98, W * 0.1),
    P(L * 0.86, -W * 0.72),
    P(L * 0.55, -W * 1.05 + thumbSide * -1),
    P(L * 0.3, -W * 1.3),
    P(-6, -W * 0.95),
  ];
  const outline = through(pts, true, 1);
  const shadeSide = c.light[0] <= 0 ? 1 : -1;
  const sh: V2[] = [P(-20, shadeSide * W * 0.35), P(L * 1.1, shadeSide * W * 0.2), P(L * 1.1, shadeSide * W * 3), P(-20, shadeSide * W * 3)];
  return {name: `hand-${side}`, segs: outline, fill: litPaint(skin, c), z, regions: [{segs: polySegs(sh), fill: skin.shade}]};
}

/** The shoe: a low, slim shoe from any view (its sole ring and ankle opening in 3D, projected, wrapped smooth). */
function shoe(sk: SkelV2, side: 'l' | 'r', c: Cam, t: Tone, sex: Sex, z: number): PartV4 {
  const L = sk.leg[side];
  const f = sk.b.foot;
  const yawF = ((L.fy + (side === 'l' ? 4 : -4)) * Math.PI) / 180;
  const fd: V3 = [Math.sin(yawF), 0, Math.cos(yawF)];
  const sd: V3 = [Math.cos(yawF), 0, -Math.sin(yawF)];
  const heel: V3 = [L.ankle[0] - fd[0] * f * 0.22, 0, L.ankle[2] - fd[2] * f * 0.22];
  const w = f * (sex === 'f' ? 0.27 : 0.33);
  const pt = (along: number, across: number, y: number): V3 => [heel[0] + fd[0] * along + sd[0] * across, y, heel[2] + fd[2] * along + sd[2] * across];
  const pts3: V3[] = [];
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const along = f * 0.5 + Math.cos(a) * f * 0.5;
    const across = Math.sin(a) * (w / 2) * (along > f * 0.6 ? 1 - ((along - f * 0.6) / (f * 0.4)) * (sex === 'f' ? 0.55 : 0.35) : 1);
    pts3.push(pt(along, across, 0));
    pts3.push(pt(along, across * 0.9, along < f * 0.5 ? 26 : Math.max(10, 26 - (along - f * 0.5) * 0.3)));
  }
  pts3.push([L.ankle[0], 34, L.ankle[2]]);
  const pts2 = pts3.map((q) => proj(q, c));
  const hullPts = hull2(pts2);
  const outline = through(hullPts, true, 0.9);
  return {name: `shoe-${side}`, segs: outline, fill: t.lit, z, regions: [{segs: polySegs([[-2000, 1000 - 10], [2000, 1000 - 10], [2000, 1100], [-2000, 1100]]), fill: t.shade}]};
}
function hull2(pts: V2[]): V2[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

export {UPRIGHT, framePt};
