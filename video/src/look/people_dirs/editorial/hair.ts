// Editorial people: hair as designed masses (dir_editorial.md §4, hair). One main mass (a shell over the skull with real
// volume, in the head's frame) with the face and the nape cut out of it along a designed hairline, 0-2 secondary masses
// (a long fall resting on the back, a ponytail, a bob's graduated hem) and ONE sheen band: a crescent set just inside
// the contour on the key side, following the head's curve (healthy, glossy hair, never a helmet's highlight blob;
// design_research R1-R7; fashion H1-H10). The masses of one head share one gradient (a group), so no seam shows.
import {type PP, type SecKey, type V2, type V3, type View, clamp, contourBand, lerp, loftOutline, pchip, proj, scallop, sections, surf, tubeOutline} from './core';
import type {Build, Skeleton} from './body';
import {type HeadRig, faceYaw, headRegion} from './head';
import {type Part, Z} from './parts';

export type HairStyle = 'long' | 'pony' | 'bob' | 'twists';

type HRow = {t: number; zf: number; zb: number; a: number};

/** The hairline: the face opening's half-angle from the front (degrees) on the figure's LEFT and RIGHT at head fraction
 *  t (0 crown .. 1 chin); null above the hairline. Past 90 the opening wraps behind the ear; near 180 only the nape's
 *  centre keeps hair (short and tied-back styles). */
const tab = (ts: number[], ws: number[]) => {
  const f = pchip(ts, ws);
  return (t: number) => (t < ts[0] ? null : f(t));
};
const FACE: Record<HairStyle, {l: (t: number) => number | null; r: (t: number) => number | null; t0: number; t1: number}> = (() => {
  // long, centre part: the hair falls from the part over the temples and the ears; the jaw's angle shows
  const long = tab([0.14, 0.18, 0.22, 0.27, 0.32, 0.45, 0.6, 0.75, 0.85, 1.0], [8, 40, 60, 73, 79, 82, 84, 92, 100, 108]);
  // high pony: pulled back from a clean hairline, the ear free, the nape clean
  const pony = tab([0.13, 0.17, 0.22, 0.3, 0.4, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9], [10, 42, 62, 76, 88, 102, 116, 136, 156, 172, 179]);
  // bob, a side part on the figure's right: the swept side covers more of the left temple
  const bobL = tab([0.14, 0.2, 0.26, 0.32, 0.45, 0.6, 0.8, 1.0, 1.1], [5, 26, 44, 56, 66, 72, 78, 84, 88]);
  const bobR = tab([0.14, 0.2, 0.26, 0.32, 0.45, 0.6, 0.8, 1.0, 1.1], [14, 46, 64, 74, 80, 82, 86, 92, 96]);
  // a crop on a low taper: the hairline at the brow, the temples, in front of and behind the ear, the nape
  const crop = tab([0.15, 0.18, 0.24, 0.32, 0.42, 0.52, 0.6, 0.68, 0.76, 0.84], [30, 52, 64, 72, 82, 98, 118, 140, 164, 179]);
  return {
    long: {l: long, r: long, t0: 0.14, t1: 0.96},
    pony: {l: pony, r: pony, t0: 0.13, t1: 0.95},
    bob: {l: bobL, r: bobR, t0: 0.14, t1: 1.16},
    twists: {l: crop, r: crop, t0: 0.15, t1: 0.92},
  };
})();

/** The shell over the skull (h units) per style: real volume beyond the skull (design_research R2: sleek +0.01-0.02 h,
 *  normal +0.03-0.06 h, more at the back where long hair lies). */
function capRows(style: HairStyle): HRow[] {
  switch (style) {
    case 'long':
      return [
        {t: -0.05, zf: 0.0, zb: -0.08, a: 0.03},
        {t: -0.025, zf: 0.17, zb: -0.28, a: 0.2},
        {t: 0.04, zf: 0.31, zb: -0.41, a: 0.315},
        {t: 0.12, zf: 0.395, zb: -0.475, a: 0.372},
        {t: 0.25, zf: 0.435, zb: -0.505, a: 0.398},
        {t: 0.4, zf: 0.435, zb: -0.515, a: 0.406},
        {t: 0.55, zf: 0.4, zb: -0.505, a: 0.41},
        {t: 0.7, zf: 0.33, zb: -0.495, a: 0.41},
        {t: 0.84, zf: 0.24, zb: -0.485, a: 0.402},
      ];
    case 'pony':
      return [
        {t: -0.028, zf: 0.0, zb: -0.06, a: 0.03},
        {t: 0.004, zf: 0.15, zb: -0.26, a: 0.185},
        {t: 0.07, zf: 0.27, zb: -0.36, a: 0.282},
        {t: 0.15, zf: 0.35, zb: -0.41, a: 0.326},
        {t: 0.3, zf: 0.402, zb: -0.437, a: 0.35},
        {t: 0.45, zf: 0.41, zb: -0.44, a: 0.352},
        {t: 0.6, zf: 0.36, zb: -0.415, a: 0.345},
        {t: 0.72, zf: 0.28, zb: -0.37, a: 0.325},
        {t: 0.82, zf: 0.15, zb: -0.31, a: 0.285},
        {t: 0.9, zf: 0.03, zb: -0.255, a: 0.215},
      ];
    case 'bob':
      return [
        {t: -0.055, zf: -0.01, zb: -0.08, a: 0.03},
        {t: -0.02, zf: 0.17, zb: -0.28, a: 0.21},
        {t: 0.05, zf: 0.315, zb: -0.415, a: 0.325},
        {t: 0.14, zf: 0.405, zb: -0.475, a: 0.39},
        {t: 0.3, zf: 0.445, zb: -0.505, a: 0.415},
        {t: 0.48, zf: 0.43, zb: -0.505, a: 0.428},
        {t: 0.66, zf: 0.37, zb: -0.485, a: 0.438},
        {t: 0.84, zf: 0.33, zb: -0.445, a: 0.452},
        {t: 0.98, zf: 0.32, zb: -0.41, a: 0.466},
        {t: 1.07, zf: 0.31, zb: -0.38, a: 0.472},
      ];
    case 'twists':
      return [
        {t: -0.15, zf: 0.02, zb: -0.1, a: 0.06},
        {t: -0.13, zf: 0.17, zb: -0.25, a: 0.18},
        {t: -0.09, zf: 0.29, zb: -0.37, a: 0.28},
        {t: -0.03, zf: 0.38, zb: -0.45, a: 0.35},
        {t: 0.05, zf: 0.43, zb: -0.48, a: 0.383},
        {t: 0.15, zf: 0.445, zb: -0.475, a: 0.378},
        {t: 0.28, zf: 0.435, zb: -0.458, a: 0.36},
        {t: 0.45, zf: 0.415, zb: -0.445, a: 0.354},
        {t: 0.6, zf: 0.37, zb: -0.42, a: 0.347},
        {t: 0.72, zf: 0.28, zb: -0.375, a: 0.33},
        {t: 0.84, zf: 0.12, zb: -0.31, a: 0.28},
        {t: 0.92, zf: 0.0, zb: -0.26, a: 0.215},
      ];
  }
}

const capKeys = (b: Build, rows: HRow[]): SecKey[] =>
  rows.map((r) => ({y: b.crownY - r.t * b.skull, cx: 0, cz: ((r.zf + r.zb) / 2) * b.skull, ap: r.a * b.skull, an: r.a * b.skull, bf: ((r.zf - r.zb) / 2) * b.skull, bb: ((r.zf - r.zb) / 2) * b.skull, n: 2}));

export type HairOut = {parts: Part[]; crownPt: V2};

/** The face (and nape) opening as two half regions (left, right), so a view from behind never bridges the back of the
 *  head between the two visible halves. Pushed out to the shell's volume. */
function faceCuts(style: HairStyle, r: HeadRig, v: View, push: number): PP[][] {
  const F = FACE[style];
  const out: PP[][] = [];
  for (const side of ['l', 'r'] as const) {
    const fn = side === 'l' ? F.l : F.r;
    const reg = headRegion(
      r,
      v,
      F.t0,
      F.t1,
      (t) => {
        const w = fn(t) ?? 0;
        return side === 'l' ? [90 - w, 90.5] : [89.5, 90 + w];
      },
      push,
      22,
    );
    if (reg) out.push(reg);
  }
  return out;
}

export type HairCtx = {key: V2};

export function hair(style: HairStyle, b: Build, sk: Skeleton, r: HeadRig, v: View, mat: string, neckPts: PP[] | null, ctx: HairCtx = {key: [-0.82, -0.57]}): HairOut {
  const parts: Part[] = [];
  const h = b.skull;
  const fy = faceYaw(r);
  const grp = 'hairG';
  const tAt = (y: number) => (b.crownY - y) / h;
  let capXf = r.xf;
  if (style === 'bob') {
    // the graduated bob: the hem rises toward the back (longer in front), the ends flare a touch
    const base = r.xf;
    capXf = (p: V3) => {
      const t = tAt(p[1]);
      const k = clamp((t - 0.7) / 0.37, 0, 1);
      const back = clamp(-p[2] / (0.42 * h), -0.6, 1);
      return base([p[0], p[1] + k * k * back * 0.075 * h, p[2]]);
    };
  }
  const secs = sections(capKeys(b, capRows(style)), 4);
  const cuts: PP[][] = faceCuts(style, r, v, 0.075 * h);
  if (neckPts && Math.abs(fy) < 60) cuts.push(neckPts);
  let cap = loftOutline(secs, v, capXf);
  if (style === 'twists') {
    // the textured top: rounded lobes of unequal size along the upper contour (coils, not a flat-top)
    const topY = proj(r.xf([0, b.crownY + 0.15 * h, 0]), v).y;
    cap = scallop(cap, {period: 0.105 * h, amp: 0.045 * h, where: (p) => p[1] < topY + 0.4 * h, seed: 3, sharp: 0.5});
  }
  parts.push({k: 'hairCap', pts: cap, mat, z: Z.hair, tension: 0.45, cut: cuts, grp});

  // the parting: a thin shade wedge from the hairline back over the crown (seen from the front and the 3/4 views)
  if (style === 'long' || style === 'bob') {
    const c = style === 'long' ? 90 : 116;
    const left: V2[] = [];
    const right: V2[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = lerp(0.135, -0.01, i / 8);
      const y = b.crownY - t * h;
      const w = 2.6 * Math.sin(Math.PI * (0.15 + 0.85 * (i / 8)));
      const a = surf(secs, y, c - w, v, capXf, 0.4);
      const bb = surf(secs, y, c + w, v, capXf, 0.4);
      if (!a.vis || !bb.vis) continue;
      left.push(a.p);
      right.push(bb.p);
    }
    if (left.length >= 4) parts.push({k: 'hairPart', pts: [...left, ...right.reverse()], mat, tone: 'deep', z: Z.hairDetail - 0.2, clip: 'hairCap', tension: 0.5});
  }

  if (style === 'long') {
    // the fall: from behind the ears down the back to below the shoulder blades, RESTING on the back (its front edge on
    // the neck's back and the back's surface); head frame at the top, the body's frame below the jaw (it hangs)
    const rows: HRow[] = [
      {t: 0.6, zf: 0.05, zb: -0.5, a: 0.405},
      {t: 0.75, zf: 0.04, zb: -0.49, a: 0.405},
      {t: 0.88, zf: 0.0, zb: -0.48, a: 0.4},
      {t: 1.0, zf: -0.08, zb: -0.48, a: 0.4},
      {t: 1.15, zf: -0.18, zb: -0.5, a: 0.41},
      {t: 1.32, zf: -0.3, zb: -0.55, a: 0.45},
      {t: 1.55, zf: -0.4, zb: -0.6, a: 0.5},
      {t: 1.85, zf: -0.43, zb: -0.62, a: 0.52},
      {t: 2.15, zf: -0.44, zb: -0.61, a: 0.49},
      {t: 2.36, zf: -0.44, zb: -0.59, a: 0.4},
      {t: 2.46, zf: -0.44, zb: -0.57, a: 0.26},
    ];
    const fsecs = sections(capKeys(b, rows), 6);
    const yJaw = b.crownY - 0.95 * h;
    const bodyXf = (p: V3): V3 => sk.leanXf([p[0] + sk.cx(p[1] - sk.bob), p[1] - sk.bob, p[2]]);
    const xf = (p: V3): V3 => {
      const w = clamp((yJaw - p[1]) / (0.45 * h), 0, 1);
      const k = w * w * (3 - 2 * w);
      const a = r.xf(p);
      const c = bodyXf(p);
      return [lerp(a[0], c[0], k), lerp(a[1], c[1], k), lerp(a[2], c[2], k)];
    };
    const fall = loftOutline(fsecs, v, xf, {cornerBottom: false});
    // the bouncy ends: two soft notches up into the bottom (three rounded clumps), seen from behind and the side
    const yEnd = b.crownY - 2.46 * h;
    const notches: PP[][] = [];
    const c = Math.cos((v.yaw * Math.PI) / 180);
    if (c < 0.5) {
      for (const u of [-0.15, 0.13]) {
        const e = proj(bodyXf([u * h, yEnd + 0.05 * h, -0.62 * h]), v);
        const w = 0.045 * h;
        notches.push([[e.x - w, e.y + 0.14 * h], [e.x - w * 0.12, e.y - 0.06 * h], [e.x + w * 0.12, e.y - 0.06 * h], [e.x + w, e.y + 0.14 * h]]);
      }
    }
    parts.push({k: 'hairFall', pts: fall, mat, z: c > 0.17 ? Z.backHair : Z.frontHair, tension: 0.5, cut: notches.length ? notches : undefined, grp});
  }
  if (style === 'pony') {
    // the tie high at the back of the crown, the tail falling from it with a soft S: the figure's one flowing element
    const tieT = 0.2;
    const tieN: V3 = [0, b.crownY - tieT * h, -0.43 * h];
    const tie = r.xf(tieN);
    const bodyXf = (p: V3): V3 => sk.leanXf([p[0] + sk.cx(p[1] - sk.bob), p[1] - sk.bob, p[2]]);
    const p1 = r.xf([0, tieN[1] + 0.0 * h, -0.57 * h]);
    const p2 = bodyXf([0.02 * h, tieN[1] - 0.34 * h, -0.66 * h]);
    const p3 = bodyXf([0.05 * h, tieN[1] - 0.84 * h, -0.6 * h]);
    const p4 = bodyXf([0.1 * h, tieN[1] - 1.3 * h, -0.55 * h]);
    const chain: V3[] = [tie, p1, p2, p3, p4];
    const rad = pchip([0, 0.08, 0.28, 0.6, 0.86, 1], [0.065 * h, 0.1 * h, 0.13 * h, 0.11 * h, 0.055 * h, 0.01 * h]);
    const tail = tubeOutline(chain, (s) => ({ru: rad(s), rv: rad(s) * 0.8}), v, [0, 0, 1], {m: 34, capStart: true, capEnd: false});
    const dT = proj(p3, v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
    const zt = dT < -20 ? Z.backHair : Z.frontHair - 1;
    parts.push({k: 'hairTail', pts: tail, mat, z: zt, tension: 0.5, grp});
    const sh = contourBand(tail, {key: ctx.key, gap: 0.03 * h, width: 0.045 * h, minDot: 0.3, maxLen: 0.9 * h});
    if (sh) parts.push({k: 'tailSheen', pts: sh, mat, tone: 'sheen', z: zt + 0.1, clip: 'hairTail', tension: 0.5});
    // the tie: a small dark band across the tail's root
    const a = proj(tie, v);
    const q = proj(p1, v);
    const ax: V2 = [q.x - a.x, q.y - a.y];
    const al = Math.hypot(ax[0], ax[1]) || 1;
    const d: V2 = [ax[0] / al, ax[1] / al];
    const nrm: V2 = [-d[1], d[0]];
    const c0: V2 = [a.x + d[0] * 0.06 * h, a.y + d[1] * 0.06 * h];
    const w = 0.13 * h;
    const tt = 0.028 * h;
    parts.push({
      k: 'hairTie',
      pts: [
        [c0[0] + nrm[0] * w - d[0] * tt, c0[1] + nrm[1] * w - d[1] * tt],
        [c0[0] + nrm[0] * w + d[0] * tt, c0[1] + nrm[1] * w + d[1] * tt],
        [c0[0] - nrm[0] * w + d[0] * tt, c0[1] - nrm[1] * w + d[1] * tt],
        [c0[0] - nrm[0] * w - d[0] * tt, c0[1] - nrm[1] * w - d[1] * tt],
      ],
      mat,
      tone: 'deep',
      z: zt + 0.2,
      clip: 'hairTail',
      tension: 0.6,
    });
  }
  if (style === 'bob') {
    // the "ripped" hem: shallow tapered notches cut up into the bottom edge where it is visible
    const yH = b.crownY - 1.0 * h;
    for (const [phi, dep] of [
      [205, 0.07],
      [236, 0.09],
      [266, 0.06],
      [296, 0.085],
      [326, 0.065],
      [354, 0.075],
      [24, 0.065],
      [150, 0.07],
      [176, 0.06],
    ] as [number, number][]) {
      const s = surf(secs, yH, phi, v, capXf, 1.5);
      if (!s.vis) continue;
      const w = 0.03 * h;
      cuts.push([[s.p[0] - w, s.p[1] + 0.2 * h], [s.p[0] - w * 0.1, s.p[1] - dep * h], [s.p[0] + w * 0.1, s.p[1] - dep * h], [s.p[0] + w, s.p[1] + 0.2 * h]]);
    }
  }
  if (style === 'twists') {
    // the low taper: the lowest band at the sides and nape a step lighter (skin showing through), a clean neckline
    const tRows = capRows('twists').filter((q) => q.t >= 0.45);
    const tSec = sections(capKeys(b, tRows), 4);
    const taper = loftOutline(tSec, v, r.xf);
    parts.push({k: 'hairTaper', pts: taper, mat: 'taper', tone: 'base', z: Z.hairDetail, clip: 'hairCap', cut: cuts, tension: 0.45});
  }

  // the sheen: one crescent inside the cap's contour on the key side, on the head (never on the fall's length)
  const top = proj(r.xf([0, b.crownY + 4, 0]), v);
  const headTop = top.y;
  if (style === 'twists') {
    // curls: 3 small sheen arcs on the key side's lobes
    for (const k of [0, 1, 2]) {
      const near: V2 = [top.x + ctx.key[0] * 0.3 * h * (0.4 + 0.5 * k), top.y + 0.04 * h + k * 0.1 * h];
      const sh = contourBand(cap, {key: ctx.key, gap: 0.025 * h, width: 0.035 * h, minDot: 0.2, near, maxLen: 0.17 * h, where: (p) => p[1] < headTop + 0.42 * h});
      if (sh) parts.push({k: `hairSheen${k}`, pts: sh, mat, tone: 'sheen', z: Z.hairDetail, clip: 'hairCap', tension: 0.5});
    }
  } else {
    const sh = contourBand(cap, {
      key: ctx.key,
      gap: (style === 'pony' ? 0.03 : 0.04) * h,
      width: (style === 'pony' ? 0.07 : 0.06) * h,
      minDot: 0.25,
      maxLen: (style === 'bob' ? 0.95 : 0.85) * h,
      where: (p) => p[1] < headTop + (style === 'bob' ? 0.6 : 0.5) * h,
    });
    if (sh) parts.push({k: 'hairSheen', pts: sh, mat, tone: 'sheen', z: Z.hairDetail, clip: 'hairCap', cut: cuts, tension: 0.5});
  }
  return {parts, crownPt: [top.x, top.y]};
}
