// MODERN GRAPHIC people: shoes. "The feet are the tell" (fashion.md §1.3): 2026 feet are slim and low. A shoe is a
// small 3D point cloud (sections from the heel to the toe), projected and wrapped in its hull: one crisp shape with a
// light sole band, its visible side in the shade plane when it faces away from the key. Never a puck or a blob.
import {V2, V3, RV, rpath, poly, hull, rad, add, sub, mul, norm} from './geo';
import {Cam, proj, toCam} from './rig';
import type {Leg, Skel} from './body';
import type {Tone} from './color';
import type {Part, Region} from './part';

export type ShoeKind = 'pointedFlat' | 'loafer' | 'sneaker' | 'kitten';
export type ShoeSpec = {kind: ShoeKind; tone: Tone; sole: string; /** a side stripe (sneakers) */ stripe?: string; /** sock or skin above the shoe */ above?: Tone; z?: number};

type Sec = {t: number; w: number; h: number; sole: number};
const SECTIONS: Record<ShoeKind, Sec[]> = {
  // t along the shoe (0 heel, 1 toe tip), w half-width, h height of the upper, sole thickness
  pointedFlat: [
    {t: 0, w: 0.2, h: 0.2, sole: 0.035},
    {t: 0.08, w: 0.3, h: 0.26, sole: 0.035},
    {t: 0.35, w: 0.31, h: 0.2, sole: 0.03},
    {t: 0.62, w: 0.36, h: 0.15, sole: 0.03},
    {t: 0.82, w: 0.27, h: 0.11, sole: 0.025},
    {t: 0.95, w: 0.12, h: 0.07, sole: 0.02},
    {t: 1, w: 0.02, h: 0.04, sole: 0.015},
  ],
  loafer: [
    {t: 0, w: 0.22, h: 0.27, sole: 0.06},
    {t: 0.1, w: 0.31, h: 0.32, sole: 0.06},
    {t: 0.4, w: 0.33, h: 0.3, sole: 0.055},
    {t: 0.65, w: 0.37, h: 0.22, sole: 0.055},
    {t: 0.85, w: 0.32, h: 0.17, sole: 0.055},
    {t: 0.97, w: 0.2, h: 0.12, sole: 0.05},
    {t: 1, w: 0.08, h: 0.09, sole: 0.045},
  ],
  sneaker: [
    {t: 0, w: 0.24, h: 0.33, sole: 0.085},
    {t: 0.1, w: 0.32, h: 0.38, sole: 0.09},
    {t: 0.4, w: 0.34, h: 0.34, sole: 0.08},
    {t: 0.66, w: 0.38, h: 0.25, sole: 0.08},
    {t: 0.86, w: 0.33, h: 0.19, sole: 0.08},
    {t: 0.97, w: 0.2, h: 0.14, sole: 0.075},
    {t: 1, w: 0.08, h: 0.1, sole: 0.07},
  ],
  kitten: [
    {t: 0, w: 0.17, h: 0.22, sole: 0.03},
    {t: 0.12, w: 0.24, h: 0.14, sole: 0.03},
    {t: 0.45, w: 0.28, h: 0.08, sole: 0.025},
    {t: 0.68, w: 0.34, h: 0.12, sole: 0.025},
    {t: 0.86, w: 0.25, h: 0.1, sole: 0.02},
    {t: 0.97, w: 0.1, h: 0.06, sole: 0.02},
    {t: 1, w: 0.02, h: 0.035, sole: 0.015},
  ],
};

/** The shoe's frame from the leg: the heel under the ankle, the toe forward along the foot's yaw; a raised heel
 *  (toe pitch, + = heel up) pivots about the ball of the foot. */
function shoeFrame(L: Leg, len: number, kind: ShoeKind) {
  const f: V3 = [Math.sin(rad(L.fy)), 0, Math.cos(rad(L.fy))];
  const s: V3 = [f[2], 0, -f[0]]; // the foot's left
  const heelBack = 0.25 * len;
  const heel: V3 = [L.ankle[0] - f[0] * heelBack, 0, L.ankle[2] - f[2] * heelBack];
  const pitch = rad(L.fp + (kind === 'kitten' ? 12 : 0));
  const ballT = 0.7;
  const bx = ballT * len;
  /** a point t along the shoe (0 heel, 1 toe), `side` to the foot's left, `y` up from the sole */
  const P = (t: number, side: number, y: number): V3 => {
    let ax = t * len;
    let ay = y;
    if (pitch && t < ballT) {
      // rotate about the ball so the heel rises (the toe stays down)
      const dx = ax - bx;
      ax = bx + dx * Math.cos(pitch) + ay * Math.sin(pitch);
      ay = -dx * Math.sin(pitch) + ay * Math.cos(pitch);
    }
    return [heel[0] + f[0] * ax + s[0] * side, ay, heel[2] + f[2] * ax + s[2] * side];
  };
  return {P, f, s};
}

/** A shoe (and the bit of foot or sock above it) as parts. */
export function shoe(sk: Skel, side: 'l' | 'r', c: Cam, sp: ShoeSpec): Part[] {
  const L = sk.leg[side];
  const len = sk.b.foot * (sp.kind === 'sneaker' ? 1.07 : sp.kind === 'loafer' ? 1.05 : 1.04);
  const W = len * 0.36;
  const {P, s} = shoeFrame(L, len, sp.kind);
  const secs = SECTIONS[sp.kind];
  const all: V2[] = [];
  const soleTop: V2[] = [];
  const soleAll: V2[] = [];
  const sideOut: V2[] = [];
  const sideIn: V2[] = [];
  // the outer side is the foot's left for the left foot
  const out = side === 'l' ? 1 : -1;
  for (const q of secs) {
    for (const sd of [-1, 1]) {
      const w = q.w * W * 1.4 * sd;
      const p0 = proj(P(q.t, w, 0), c);
      const p1 = proj(P(q.t, w * 0.8, q.h * len), c);
      const ps = proj(P(q.t, w, q.sole * len), c);
      all.push(p0, p1);
      soleAll.push(p0, ps);
      if (sd === out) sideOut.push(p0, p1);
      else sideIn.push(p0, p1);
    }
    soleTop.push(proj(P(q.t, 0, q.sole * len), c));
  }
  const H = hull(all);
  const parts: Part[] = [];
  const z = sp.z ?? 30 + toCam(L.ankle, c)[2] * 0.01;
  // which side faces the camera, and is it lit?
  const sOut: V3 = [s[0] * out, 0, s[2] * out];
  const sc = toCam(sOut, c);
  const visOut = sc[2] > 0;
  const sideN = visOut ? sc : ([-sc[0], 0, -sc[2]] as V3);
  const lit = sideN[0] * c.light[0] + sideN[2] * c.light[2] > 0;
  const regs: Region[] = [];
  if (!lit) regs.push({d: poly(hull(visOut ? sideOut : sideIn)), fill: sp.tone.shade});
  // the sole band: everything below the sole's top line (a hull of the sole points)
  regs.push({d: poly(hull(soleAll)), fill: sp.sole});
  if (sp.stripe) {
    // a side stripe on the visible side: a parallelogram from the heel's top to the arch
    const sd = visOut ? out : -out;
    const st = [
      P(0.2, sd * W * 0.5, 0.2 * len),
      P(0.32, sd * W * 0.5, 0.33 * len),
      P(0.6, sd * W * 0.52, 0.2 * len),
      P(0.5, sd * W * 0.5, 0.12 * len),
    ].map((p) => proj(p, c));
    regs.push({d: poly(st), fill: sp.stripe});
  }
  parts.push({name: `shoe-${side}`, d: rpath(H.map((p) => [p[0], p[1], 3] as RV)), fill: sp.tone.lit, regions: regs, z});
  if (sp.kind === 'kitten') {
    // the kitten heel: a slim block from under the raised heel to the ground, set a little in from the back
    const top0 = P(0.02, 0, 0);
    const top1 = P(0.15, 0, 0);
    const blk = [
      proj([top0[0], top0[1], top0[2]], c),
      proj([top1[0], top1[1], top1[2]], c),
      proj([top1[0] * 0.5 + top0[0] * 0.5, 0, top1[2] * 0.5 + top0[2] * 0.5], c),
      proj([top0[0] * 0.8 + top1[0] * 0.2, 0, top0[2] * 0.8 + top1[2] * 0.2], c),
    ];
    parts.push({name: `heel-${side}`, d: rpath(blk.map((p) => [p[0], p[1], 2] as RV)), fill: sp.tone.shade, z: z - 0.02});
  }
  if (sp.above) {
    // the instep (skin or sock) between the shoe's topline and the ankle, behind the shoe
    const a1 = proj([L.ankle[0], L.ankle[1] + 18, L.ankle[2]], c);
    const pts = [
      proj(P(0.1, W * 0.35, 0.22 * len), c),
      proj(P(0.1, -W * 0.35, 0.22 * len), c),
      proj(P(0.55, W * 0.4, 0.12 * len), c),
      proj(P(0.55, -W * 0.4, 0.12 * len), c),
      add(a1, [-sk.b.ankleR, 0]),
      add(a1, [sk.b.ankleR, 0]),
    ];
    parts.push({name: `instep-${side}`, d: rpath(hull(pts).map((p) => [p[0], p[1], 4] as RV)), fill: sp.above.lit, z: z - 0.05});
  }
  return parts;
}

/** The contact shadow under both feet: one flat ellipse-ish shape on the ground (excluded from the silhouette test). */
export function contact(sk: Skel, c: Cam, color: string, opacity = 0.32): Part {
  const pts: V2[] = [];
  for (const side of ['l', 'r'] as const) {
    const L = sk.leg[side];
    const len = sk.b.foot * 1.05;
    const f: V3 = [Math.sin(rad(L.fy)), 0, Math.cos(rad(L.fy))];
    const heel: V3 = [L.ankle[0] - f[0] * len * 0.25, 0, L.ankle[2] - f[2] * len * 0.25];
    const toe: V3 = [heel[0] + f[0] * len, 0, heel[2] + f[2] * len];
    if (L.fp > 25) continue;
    for (const p of [heel, toe]) {
      const q = proj(p, c);
      pts.push(add(q, [-22, 0]), add(q, [22, 0]), add(q, [0, -5]), add(q, [0, 7]));
    }
  }
  const H = hull(pts);
  // flatten and widen a little: a soft, wide pool
  const cx = H.reduce((s2, p) => s2 + p[0], 0) / Math.max(1, H.length);
  const cy = H.reduce((s2, p) => s2 + p[1], 0) / Math.max(1, H.length);
  const P2 = H.map((p) => [cx + (p[0] - cx) * 1.15, cy + (p[1] - cy) * 0.7 + 2, 30] as RV);
  return {name: 'contact', d: rpath(P2), fill: color, opacity, z: -100, ground: true};
}
export const dirOf = (a: V2, b: V2) => norm(sub(b, a));
export const scale2 = mul;
