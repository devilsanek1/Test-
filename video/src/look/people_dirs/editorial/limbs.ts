// Editorial people: legs, arms, sleeves, hands and shoes (dir_editorial.md §1-§2). Limbs taper to their ends (thigh :
// ankle ~3.6 : 1, upper arm : wrist ~1.9 : 1) with offset bulges (the calf's peak behind and high, design_research
// S2, S6); hands are real-size (0.096 H) mittens with a thumb lobe and a wrist break; shoes are the style statement at
// our sizes (fashion §3.2): a slim pointed pump, a slim low sneaker with its light sole band, a loafer, a ballet flat.
import {type PP, type V2, type V3, type View, add3, clamp, cross3, hull, lerp, len2, mul3, norm2, norm3, pchip, proj, rot2, sub2, sub3, tubeOutline} from './core';
import {type Build, type Side, type Skeleton, armRadius, legRadius} from './body';
import {type Part, Z} from './parts';

const torsoDepth = (sk: Skeleton, v: View) => proj(sk.leanXf([sk.cx(sk.b.chestY), sk.b.chestY - sk.bob, 0]), v).d;

/** A leg in skin (or tights) from the hip to the ankle; `zPart` sets near/far order by depth. */
export function leg(sk: Skeleton, s: Side, v: View, mat = 'skin'): Part {
  const b = sk.b;
  const chain: V3[] = [sk.hip[s], sk.knee[s], sk.ankle[s]];
  const pts = tubeOutline(chain, (u) => legRadius(b, u, s === 'l' ? 1 : -1), v, [0, 0, 1], {m: 40});
  const d = proj(sk.knee[s], v).d - torsoDepth(sk, v);
  return {k: `leg_${s}`, pts, mat, z: d < 0 ? Z.farLeg : Z.leg, tension: 0.5};
}

/** A bare arm (skin) from the shoulder to the wrist. */
export function arm(sk: Skeleton, s: Side, v: View, mat = 'skin'): Part {
  const b = sk.b;
  const chain: V3[] = [sk.sh[s], sk.elbow[s], sk.wrist[s]];
  const pts = tubeOutline(chain, (u) => armRadius(b, u), v, [0, 0, 1], {m: 28});
  return {k: `arm_${s}`, pts, mat, z: armZ(sk, s, v), tension: 0.5};
}

/** A bare forearm (skin) from just below the elbow to the wrist: under a pushed-up sleeve. */
export function forearm(sk: Skeleton, s: Side, v: View, mat = 'skin'): Part {
  const b = sk.b;
  const E = sk.elbow[s];
  const W = sk.wrist[s];
  const S = sk.sh[s];
  const top: V3 = [lerp(E[0], S[0], 0.12), lerp(E[1], S[1], 0.12), lerp(E[2], S[2], 0.12)];
  const pts = tubeOutline([top, E, W], (u) => armRadius(b, 0.44 + 0.56 * u), v, [0, 0, 1], {m: 20});
  return {k: `forearm_${s}`, pts, mat, z: armZ(sk, s, v) - 0.5, tension: 0.5};
}

/** Near or far arm: by the elbow's depth against the torso's centre (design: an arm beside the body draws over it). */
export function armZ(sk: Skeleton, s: Side, v: View): number {
  const d = (proj(sk.elbow[s], v).d + proj(sk.sh[s], v).d) / 2 - torsoDepth(sk, v);
  return d < -28 ? Z.farArm : Z.nearArm;
}

export type SleeveSpec = {
  /** Radii at the shoulder (the cap), the elbow and the cuff. */
  r: [number, number, number];
  /** Where the sleeve ends along the forearm (1 = the wrist; 0.75 = pushed up). */
  end?: number;
  /** The dropped shoulder: the cap starts this far outside and below the shoulder joint. */
  drop?: number;
  /** A cuff band (a value step) of this length at the end. */
  cuff?: number;
};

/** A sleeve along the arm chain: a tube with a crisp cuff edge. It starts just below the shoulder line, inside the
 *  garment's own shoulder (the torso loft carries the shoulder's smooth arc, the dropped seam), so no cap stands above
 *  the shoulder. */
export function sleeve(sk: Skeleton, s: Side, v: View, mat: string, spec: SleeveSpec, grp?: string): Part[] {
  const drop = spec.drop ?? 0;
  const S0 = sk.sh[s];
  const E = sk.elbow[s];
  const W = sk.wrist[s];
  // the sleeve's top: its cap's dome rises to the shoulder line, its outer edge on the garment's shoulder (the garment
  // rows put the shoulder at shX + r0 + 2), so the arm leaves the shoulder in one line, never a puffed cap
  const ua: V3 = norm3(sub3(E, S0));
  const S = add3(S0, mul3(ua, spec.r[0] * 0.5 + drop * 0.5));
  const end = spec.end ?? 1;
  const Wend: V3 = [lerp(E[0], W[0], end), lerp(E[1], W[1], end), lerp(E[2], W[2], end)];
  const [r0, r1, r2] = spec.r;
  const ru = pchip([0, 0.12, 0.5, 1], [r0 * 1.02, r0, r1, r2]);
  const pts = tubeOutline([S, E, Wend], (u) => ({ru: ru(u), rv: ru(u) * 1.04}), v, [0, 0, 1], {m: 30, capEnd: false});
  const out: Part[] = [{k: `sleeve_${s}`, pts: crispEnd(pts), mat, z: armZ(sk, s, v), tension: 0.5, grp: grp ? `${grp}_${s}` : undefined}];
  if (spec.cuff) {
    const L = Math.hypot(...sub3(Wend, E));
    const k = 1 - spec.cuff / L;
    const c0: V3 = [lerp(E[0], Wend[0], k), lerp(E[1], Wend[1], k), lerp(E[2], Wend[2], k)];
    const cp = tubeOutline([c0, Wend], () => ({ru: r2 * 1.06, rv: r2 * 1.1}), v, [0, 0, 1], {m: 4, capEnd: false, capStart: false});
    out.push({k: `cuff_${s}`, pts: cp, mat, tone: 'shade', z: armZ(sk, s, v) + 0.5, clip: `sleeve_${s}`, tension: 0.3});
  }
  return out;
}
/** The tube's flat end: the two points where the end cap would start become corners. */
function crispEnd(pts: PP[]): PP[] {
  // the tube outline is [left..., right reversed..., start cap]; the end's corners are where the left run turns
  // into the right run: the pair with the largest jump among consecutive points near the middle
  let best = -1;
  let bd = 0;
  const n = pts.length;
  for (let i = Math.floor(n * 0.25); i < Math.floor(n * 0.75); i++) {
    const a = pts[i];
    const c = pts[i + 1];
    const d = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (d > bd) {
      bd = d;
      best = i;
    }
  }
  if (best < 0) return pts;
  return pts.map((p, i) => (i === best || i === best + 1 ? ([p[0], p[1], 1] as PP) : p));
}

// ---------------------------------------------------------------- hands

type HandShape = V2[];
/** The relaxed hand seen from its thumb side (local: the wrist at the origin, the hand toward +y, the thumb on -x),
 *  in hand lengths: the back of the hand a long straight, the palm side curved, the fingers grouped and curled 20-35
 *  degrees, the thumb a separate lobe split by a notch 40 % down (design_research H1-H3). */
const HAND_SIDE: HandShape = [
  [0.15, -0.04],
  [0.17, 0.2],
  [0.165, 0.46],
  [0.14, 0.66],
  [0.09, 0.86],
  [0.03, 0.99],
  [-0.03, 1.0],
  [-0.07, 0.9],
  [-0.08, 0.74],
  [-0.1, 0.6],
  [-0.155, 0.56],
  [-0.2, 0.48],
  [-0.215, 0.36],
  [-0.19, 0.22],
  [-0.15, 0.1],
  [-0.14, -0.04],
];
/** The back of the hand (the thumb tucked behind): a long tapered paddle, the fingers' tips softly squared. */
const HAND_BACK: HandShape = [
  [0.15, -0.04],
  [0.18, 0.22],
  [0.18, 0.46],
  [0.155, 0.7],
  [0.11, 0.9],
  [0.04, 1.0],
  [-0.05, 0.99],
  [-0.12, 0.86],
  [-0.155, 0.66],
  [-0.175, 0.44],
  [-0.16, 0.2],
  [-0.14, -0.04],
];
/** A hand gripping (a phone, a strap): the fingers wrapped forward as one mass, the thumb along the top. */
const HAND_GRIP: HandShape = [
  [0.16, -0.04],
  [0.19, 0.18],
  [0.2, 0.38],
  [0.17, 0.56],
  [0.08, 0.68],
  [-0.04, 0.7],
  [-0.14, 0.62],
  [-0.2, 0.46],
  [-0.24, 0.3],
  [-0.22, 0.16],
  [-0.15, 0.06],
  [-0.14, -0.04],
];
/** The thumb hooked over a pocket's edge: only the thumb and the top of the hand's back show. */
const HAND_THUMB: HandShape = [
  [0.15, -0.04],
  [0.17, 0.16],
  [0.12, 0.3],
  [-0.02, 0.33],
  [-0.12, 0.42],
  [-0.2, 0.4],
  [-0.2, 0.26],
  [-0.15, 0.08],
  [-0.14, -0.04],
];

/** The hand at the wrist, along the projected forearm with a soft wrist break; mirrored so the thumb faces the side
 *  its 3D thumb direction projects to. */
export function hand(sk: Skeleton, s: Side, v: View, mat = 'skin', kind?: 'relaxed' | 'grip' | 'hidden' | 'thumb'): Part | null {
  const k = kind ?? sk.hand[s];
  if (k === 'hidden') return null;
  const b = sk.b;
  const E = proj(sk.elbow[s], v);
  const W = proj(sk.wrist[s], v);
  const fore: V2 = norm2([W.x - E.x, W.y - E.y]);
  // the 3D thumb: forward (+Z) and a little inward, for a hanging hand; for a grip it is up the forearm's side
  const ss = s === 'l' ? 1 : -1;
  const thumb3: V3 = k === 'grip' ? norm3([-ss * 0.3, 0.8, 0.5]) : norm3([-ss * 0.25, 0, 1]);
  const t0 = proj(sk.wrist[s], v);
  const t1 = proj(add3(sk.wrist[s], mul3(thumb3, 40)), v);
  const thumbScr: V2 = [t1.x - t0.x, t1.y - t0.y];
  const side = thumbScr[0] * -fore[1] + thumbScr[1] * fore[0]; // + = the thumb on the screen-right of the forearm's direction
  const vis = len2(thumbScr) / 40; // how much the thumb shows (0 = toward/away from the camera)
  let shape: HandShape = k === 'grip' ? HAND_GRIP : k === 'thumb' ? HAND_THUMB : vis > 0.55 ? HAND_SIDE : HAND_BACK;
  // the shapes have the thumb on -x when the hand points +y: mirror to put it on the projected thumb side
  // (for a hand pointing +y, screen-right of the direction is -x... so a thumb on the direction's right needs +x)
  const mirror = side > 0 ? -1 : 1;
  const L = b.hand;
  // the wrist break: 12 degrees toward the palm (the thumb side for a hanging hand)
  const ang = (Math.atan2(fore[1], fore[0]) * 180) / Math.PI - 90 + (k === 'relaxed' ? 10 * mirror * -1 : 0);
  const fore3 = norm3(sub3(sk.wrist[s], sk.elbow[s]));
  const fsh = clamp(Math.hypot(...[proj(add3(sk.wrist[s], mul3(fore3, 50)), v).x - W.x, proj(add3(sk.wrist[s], mul3(fore3, 50)), v).y - W.y]) / 50, 0.45, 1);
  const pts: PP[] = shape.map(([x, y]) => {
    const q = rot2([x * L * mirror * -1, y * L * (k === 'grip' ? 1 : fsh)], ang);
    return [W.x + q[0], W.y + q[1]];
  });
  return {k: `hand_${s}`, pts, mat, z: armZ(sk, s, v) + 2, tension: 0.5};
}

// ---------------------------------------------------------------- shoes

export type ShoeKind = 'pump' | 'sneaker' | 'loafer' | 'flat';
type ShoeSpec = {
  len: number;
  /** half-width and height (in foot lengths) at s = 0 (heel) .. 1 (toe) */
  s: number[];
  hw: number[];
  ht: number[];
  /** the heel's lift (units) and the sole band's height (foot lengths) */
  heel: number;
  sole: number;
};
const SHOES: Record<ShoeKind, ShoeSpec> = {
  // a slim pointed flat: a low vamp (the instep shows), a long pointed toe, a whisper of a heel
  pump: {len: 1.1, s: [0, 0.06, 0.2, 0.4, 0.6, 0.75, 0.88, 0.96, 1], hw: [0.07, 0.1, 0.11, 0.12, 0.14, 0.135, 0.09, 0.04, 0.01], ht: [0.17, 0.16, 0.1, 0.075, 0.1, 0.11, 0.08, 0.045, 0.02], heel: 4, sole: 0},
  // a slim low-profile sneaker: a rounded toe, the tongue up the instep, a light sole band ~0.01 H
  sneaker: {len: 1.07, s: [0, 0.06, 0.25, 0.42, 0.6, 0.78, 0.9, 0.97, 1], hw: [0.09, 0.115, 0.125, 0.13, 0.15, 0.15, 0.13, 0.09, 0.05], ht: [0.22, 0.25, 0.27, 0.3, 0.2, 0.16, 0.13, 0.09, 0.05], heel: 0, sole: 0.065},
  // a loafer: low and long, a soft square toe, a low sole
  loafer: {len: 1.07, s: [0, 0.06, 0.25, 0.45, 0.62, 0.78, 0.9, 0.97, 1], hw: [0.085, 0.11, 0.12, 0.13, 0.145, 0.145, 0.125, 0.08, 0.04], ht: [0.18, 0.19, 0.16, 0.2, 0.17, 0.14, 0.11, 0.08, 0.04], heel: 6, sole: 0.035},
  // a ballet flat: very low, a soft almond toe, the instep bare
  flat: {len: 1.05, s: [0, 0.06, 0.25, 0.45, 0.62, 0.78, 0.9, 0.97, 1], hw: [0.08, 0.105, 0.115, 0.125, 0.14, 0.14, 0.11, 0.06, 0.02], ht: [0.13, 0.11, 0.075, 0.07, 0.09, 0.1, 0.08, 0.05, 0.02], heel: 2, sole: 0.02},
};

/** The foot's frame: the heel's ground point, the forward axis (yawed), the up axis (pitched by the heel's lift). */
function footFrame(sk: Skeleton, s: Side, spec: ShoeSpec): {o: V3; u: V3; up: V3; w: V3} {
  const b = sk.b;
  const A = sk.ankle[s];
  const yawD = sk.footYaw[s];
  const r = (yawD * Math.PI) / 180;
  const fwd: V3 = [Math.sin(r), 0, Math.cos(r)];
  const pitch = (sk.footPitch[s] * Math.PI) / 180;
  // pitch about the toe-ball for a lifted heel: u tilts down toward the toe
  const u: V3 = norm3([fwd[0] * Math.cos(pitch), -Math.sin(pitch), fwd[2] * Math.cos(pitch)]);
  const w = norm3(cross3([0, 1, 0], fwd));
  const up = norm3(cross3(u, w));
  // the heel's ground point behind and below the ankle
  const back = 0.22 * b.foot;
  const upF = up[1] < 0 ? mul3(up, -1) : up;
  const o = add3(A, add3(mul3(u, -back), mul3(upF, -b.ankleY * 0.95)));
  return {o, u, up: upF, w};
}

/** A shoe as rings along the foot, projected; its outline by the axis method (profile-ish views) or the hull (front,
 *  back). Returns the shoe, its sole band (sneakers, loafers), and the instep skin above a low vamp. */
export function shoe(sk: Skeleton, s: Side, v: View, kind: ShoeKind, mats: {shoe: string; sole?: string; skin?: string}): Part[] {
  const b = sk.b;
  const spec = SHOES[kind];
  const F = footFrame(sk, s, spec);
  const L = b.foot * spec.len;
  const hwF = pchip(spec.s, spec.hw.map((x) => x * b.foot));
  const htF = pchip(spec.s, spec.ht.map((x) => x * b.foot));
  const ringsAt = (hScale: (u: number) => number, bottom = 0, heightCap?: (u: number) => number) => {
    const rings: V3[][] = [];
    const N = 22;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const hw = hwF(u);
      let ht = htF(u) * hScale(u);
      if (heightCap) ht = Math.min(ht, heightCap(u));
      const c = add3(F.o, mul3(F.u, u * L));
      const ring: V3[] = [];
      for (let j = 0; j <= 12; j++) {
        const a = (Math.PI * j) / 12;
        // a flat sole, rounded sides and top
        const x = Math.cos(a) * hw;
        const y = bottom + Math.sin(a) ** 0.7 * (ht - bottom);
        ring.push(add3(c, add3(mul3(F.w, x), mul3(F.up, y))));
      }
      rings.push(ring);
    }
    return rings;
  };
  const outlineOf = (rings: V3[][]): PP[] => {
    const P = rings.map((r) => r.map((p) => proj(p, v)));
    const a0 = proj(F.o, v);
    const a1 = proj(add3(F.o, mul3(F.u, L)), v);
    const ax: V2 = [a1.x - a0.x, a1.y - a0.y];
    const axl = len2(ax);
    if (axl > L * 0.5) {
      const d = norm2(ax);
      const n: V2 = [-d[1], d[0]];
      const top: PP[] = [];
      const bot: PP[] = [];
      P.forEach((ring) => {
        let hi = ring[0];
        let lo = ring[0];
        ring.forEach((p) => {
          if (p.x * n[0] + p.y * n[1] < hi.x * n[0] + hi.y * n[1]) hi = p;
          if (p.x * n[0] + p.y * n[1] > lo.x * n[0] + lo.y * n[1]) lo = p;
        });
        top.push([hi.x, hi.y]);
        bot.push([lo.x, lo.y]);
      });
      return [...top, ...bot.reverse()];
    }
    return hull(P.flat().map((p) => [p.x, p.y] as V2));
  };
  const zs = proj(sk.ankle[s], v).d - torsoDepth(sk, v) < 0 ? Z.farLeg + 1 : Z.shoe;
  const out: Part[] = [];
  out.push({k: `shoe_${s}`, pts: outlineOf(ringsAt(() => 1)), mat: mats.shoe, z: zs, tension: 0.35});
  if (spec.sole && mats.sole) {
    out.push({k: `sole_${s}`, pts: outlineOf(ringsAt(() => 1, 0, () => spec.sole * b.foot)), mat: mats.sole, tone: 'base', z: zs + 0.2, clip: `shoe_${s}`, tension: 0.3});
  }
  if (spec.heel > 10) {
    // the kitten heel: a slim block under the heel's back
    const h0 = add3(F.o, mul3(F.u, 0.03 * L));
    const h1 = add3(F.o, mul3(F.u, 0.12 * L));
    const gnd = (p: V3): V3 => [p[0], 0, p[2]];
    const pts = [proj(h0, v), proj(h1, v), proj(add3(gnd(h1), [0, 0, 0]), v), proj(gnd(add3(h0, mul3(F.u, 0.04 * L))), v)].map((p) => [p.x, p.y] as PP);
    out.push({k: `heel_${s}`, pts: pts.map((p) => [p[0], p[1], 1] as PP), mat: mats.shoe, tone: 'deep', z: zs - 0.1, tension: 0});
  }
  return out;
}

export {clamp, lerp, sub2};
