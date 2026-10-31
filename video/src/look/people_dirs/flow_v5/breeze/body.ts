// FLOW v5, BREEZE: the body under the clothes, as a few 2D landmarks per view (figure units: y down, the crown 0, the
// soles 1000). The body stays calm and upright; anatomy is left undrawn: legs are two slim dark tapered strokes, feet
// small dark wedges, arms live inside the garment and one acting arm at a time comes out as a slim stroke ending in a
// small tapered hand. A walk is the one place the legs move: a 2D two-bone leg reaching for a gait's ankle target.
import {add, sub, mul, norm, nrm, dist, lerp, clamp, mix, outline, rot, type V2, type Nd} from './v';
import type {View, Sex} from './head';

export type Build = {
  sex: Sex;
  /** crown to chin (figure units) */
  head: number;
  /** shoulder width, tip to tip (front) */
  sh: number;
  hip: number;
  neck: number;
  /** a leg's width at the knee, at the ankle */
  knee: number;
  ankle: number;
  foot: number;
  /** a garment's fullness factor (1 = slim) */
  full?: number;
};
export const BUILDS = {
  her: {sex: 'f', head: 144, sh: 156, hip: 150, neck: 40, knee: 31, ankle: 17, foot: 60},
  womanSlim: {sex: 'f', head: 140, sh: 160, hip: 144, neck: 31, knee: 29, ankle: 16, foot: 58},
  womanSoft: {sex: 'f', head: 142, sh: 172, hip: 168, neck: 35, knee: 35, ankle: 19, foot: 60, full: 1.1},
  manAthletic: {sex: 'm', head: 140, sh: 214, hip: 150, neck: 45, knee: 37, ankle: 21, foot: 72},
  manSlim: {sex: 'm', head: 140, sh: 196, hip: 144, neck: 41, knee: 34, ankle: 20, foot: 70},
  manBroad: {sex: 'm', head: 142, sh: 224, hip: 162, neck: 49, knee: 40, ankle: 23, foot: 74, full: 1.08},
} satisfies Record<string, Build>;

export type Joints = {
  view: View;
  head: {c: V2; tilt: number};
  neckBase: V2;
  /** shoulder tips: far (screen-left in 3/4 and profile... the upwind side when standing) and near */
  shF: V2;
  shN: V2;
  hipF: V2;
  hipN: V2;
  kneeF: V2;
  kneeN: V2;
  ankleF: V2;
  ankleN: V2;
  /** each foot's pitch (degrees; + toes down) and its facing (+1 toes to screen-right) */
  footF: {pitch: number; face: number};
  footN: {pitch: number; face: number};
  /** the walk's phase, its stride (signed: + the near leg forward) */
  phase?: number;
  stride?: number;
  /** the near arm when it acts: shoulder, elbow, wrist */
  arm?: {sh: V2; el: V2; wr: V2; fist?: boolean};
  /** a walk a moment ago (a coat's follow-through): the trailing and leading knees' x, the tail's lift from the bob */
  lag?: {trail: number; lead: number; lift: number};
};

/** Two-bone IK in 2D: from a toward the target, the middle joint bent toward `bend` (+1: to the right of travel).
 *  SOFT near full extension: the reach eases toward the limb's length (never snapping straight, the knee's classic pop)
 *  and the two bones stretch by the few per cent that remain, so the end still lands on its target. */
export function ik2(a: V2, tgt: V2, l1: number, l2: number, bend: 1 | -1): V2 {
  const d = sub(tgt, a);
  const L = Math.max(Math.abs(l1 - l2) + 1, Math.hypot(d[0], d[1]));
  const Lmax = l1 + l2;
  const ds = 0.08 * Lmax;
  const L0 = Lmax - ds;
  const Le = L > L0 ? Lmax - ds * Math.exp(-(L - L0) / ds) : L;
  const k = L / Le;
  const u = norm(d);
  const x = (l1 * l1 - l2 * l2 + Le * Le) / (2 * Le);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const nv = nrm(u);
  return add(add(a, mul(u, x * k)), mul(nv, -h * bend * k));
}

// ---------------------------------------------------------------- the legs and feet
/** A leg: a slim tapered stroke hip -> knee -> ankle (only its lower part shows under a garment). */
export function legD(hip: V2, knee: V2, ankle: V2, b: Build, o: {thigh?: number} = {}): string {
  const th = o.thigh ?? b.knee * 1.5;
  // sample the two bones, widths: the thigh, the knee, a slight calf, the ankle
  const pts: V2[] = [];
  const ws: number[] = [];
  const N = 6;
  for (let i = 0; i <= N; i++) {
    pts.push(lerp(hip, knee, i / N));
    ws.push(mix(th, b.knee, i / N));
  }
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push(lerp(knee, ankle, t));
    // the calf's gentle swell a third of the way down, then the taper to the ankle
    ws.push(mix(b.knee, b.ankle, Math.pow(t, 1.15)) + b.knee * 0.1 * Math.sin(Math.PI * Math.min(1, t * 1.6)));
  }
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const nv = nrm(norm(sub(c, a)));
    L.push(add(pts[i], mul(nv, ws[i] / 2)));
    R.push(add(pts[i], mul(nv, -ws[i] / 2)));
  }
  // close below the ankle (the foot overlaps it)
  const dn = norm(sub(ankle, knee));
  const end = add(ankle, mul(dn, b.ankle * 0.9));
  const ns: Nd[] = [{p: L[0], c: true}, ...L.slice(1).map((p) => ({p})), {p: end}, ...R.slice(1).reverse().map((p) => ({p})), {p: R[0], c: true}];
  return outline(ns);
}

/** A foot: a small dark wedge from the heel to a soft point at the toe (its facing and pitch as seen). */
export function footD(ankle: V2, b: Build, view: View, f: {pitch: number; face: number}, sole: number): string {
  const L = b.foot;
  const hgt = b.ankle * 1.9;
  if (view === 'b') {
    // from behind: the heel and the shaft of a boot, a small rounded block
    const w = b.ankle * 1.5;
    const y0 = Math.min(ankle[1] - hgt * 0.3, sole - hgt);
    return outline([
      {p: [ankle[0] - w / 2, y0], c: true},
      {p: [ankle[0] + w / 2, y0], c: true},
      {p: [ankle[0] + w * 0.56, sole - 6]},
      {p: [ankle[0] + w * 0.3, sole], c: true},
      {p: [ankle[0] - w * 0.3, sole], c: true},
      {p: [ankle[0] - w * 0.56, sole - 6]},
    ]);
  }
  const k = view === 'q' ? 0.72 : 1;
  const fx = f.face;
  // in the foot's own frame (x along the foot toward the toe, y down), then pitched about the ankle
  const local: Nd[] = [
    {p: [-0.3 * L * k, -hgt * 0.95], c: true},
    {p: [0.12 * L * k, -hgt * 0.95], c: true},
    {p: [0.28 * L * k, -hgt * 0.5]},
    {p: [0.66 * L * k, -hgt * 0.24]},
    {p: [0.8 * L * k, -hgt * 0.04], c: true},
    {p: [-0.2 * L * k, 0], c: true},
    {p: [-0.3 * L * k, -hgt * 0.22]},
  ];
  const base: V2 = [ankle[0], ankle[1] + hgt * 0.62];
  const ns = local.map((n) => ({...n, p: add(base, rot([n.p[0] * fx, n.p[1]], [0, 0], f.pitch * fx))}));
  return outline(ns);
}

// ---------------------------------------------------------------- the acting arm
/** One acting arm: a slim sleeve stroke (the garment's colour) from the shoulder to the wrist, and a small tapered
 *  hand. Returns the sleeve and the hand outlines. */
export function armD(sh: V2, el: V2, wr: V2, w: {upper: number; wrist: number; cuff?: number}, hand: {len: number; fist?: boolean}): {sleeve: string; hand: string; handTip: V2} {
  const N = 5;
  const pts: V2[] = [];
  const ws: number[] = [];
  for (let i = 0; i <= N; i++) {
    pts.push(lerp(sh, el, i / N));
    ws.push(mix(w.upper, (w.upper + w.wrist) / 2 + 2, i / N));
  }
  for (let i = 1; i <= N; i++) {
    pts.push(lerp(el, wr, i / N));
    ws.push(mix((w.upper + w.wrist) / 2 + 2, w.wrist, i / N));
  }
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const nv = nrm(norm(sub(c, a)));
    L.push(add(pts[i], mul(nv, ws[i] / 2)));
    R.push(add(pts[i], mul(nv, -ws[i] / 2)));
  }
  const sleeve = outline([{p: L[0]}, ...L.slice(1, -1).map((p) => ({p})), {p: L[L.length - 1], c: true}, {p: R[R.length - 1], c: true}, ...R.slice(1, -1).reverse().map((p) => ({p})), {p: R[0]}]);
  // the hand: a small tapered closed shape along the forearm's line (08's fist)
  const d = norm(sub(wr, el));
  const tip = add(wr, mul(d, hand.len));
  const handD = fistD(wr, d, w.wrist, hand.len);
  return {sleeve, hand: handD, handTip: tip};
}

/** A small closed hand (08's fist): from the wrist it swells a little over the knuckles, then tapers to a soft blunt
 *  end, longer than it is wide, never a ball; the thumb's side a touch fuller. d = along the forearm, w = the wrist's
 *  width, len = the hand's length past the wrist. */
export function fistD(wr: V2, d: V2, w: number, len: number): string {
  const nv = nrm(d);
  const P = (x: number, y: number): V2 => add(add(wr, mul(d, x * len)), mul(nv, y * w));
  return outline([
    {p: P(-0.16, 0.48)},
    {p: P(0.34, 0.6), k: 0.9},
    {p: P(0.76, 0.44), k: 0.9},
    {p: P(1.0, 0.08), k: 0.55},
    {p: P(0.86, -0.3), k: 0.9},
    {p: P(0.42, -0.6), k: 0.9},
    {p: P(-0.16, -0.48)},
  ]);
}

export {dist};
