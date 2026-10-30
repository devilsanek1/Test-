// Editorial people: hair as designed masses (dir_editorial.md §4, hair). One main mass (a shell over the skull, in the
// head's frame) with the face cut out of it (and the neck, where the neck is in front), 0-2 secondary masses (a long
// fall down the back in the body's frame, a ponytail, a bob's blunt notched hem) and ONE sheen band (+13 L*, a crisp
// crescent 7-20 % down from the crown on the key side): healthy hair, not a helmet (design_research R1-R7; fashion
// H1-H10). The masses of one head share one gradient (a group), so no seam shows where they overlap.
import {type PP, type SecKey, type V2, type V3, type View, clamp, hash, lerp, loftOutline, pchip, proj, sections, sub3, surf, tubeOutline} from './core';
import type {Build, Skeleton} from './body';
import {type HeadRig, faceYaw, headRegion} from './head';
import {type Part, Z} from './parts';

export type HairStyle = 'long' | 'pony' | 'bob' | 'twists';

type HRow = {t: number; zf: number; zb: number; a: number};

/** The face's opening (degrees either side of the front: [the figure's left side, its right side]) at head fraction t;
 *  null above the hairline (covered). */
function faceArc(style: HairStyle, t: number): [number, number] | null {
  const ramp = (t0: number, t1: number, a: number, b: number) => lerp(a, b, clamp((t - t0) / (t1 - t0), 0, 1));
  switch (style) {
    case 'long': {
      if (t < 0.155) return null;
      const w = t < 0.24 ? ramp(0.155, 0.24, 26, 56) : t < 0.42 ? ramp(0.24, 0.42, 56, 66) : t < 0.62 ? ramp(0.42, 0.62, 66, 68) : ramp(0.62, 0.9, 68, 62);
      return [w, w];
    }
    case 'pony': {
      if (t < 0.15) return null;
      const w = t < 0.22 ? ramp(0.15, 0.22, 28, 66) : t < 0.45 ? ramp(0.22, 0.45, 66, 74) : 78;
      return [w, w];
    }
    case 'bob': {
      if (t < 0.145) return null;
      // a side part on the figure's right: the swept front piece covers more of the LEFT temple and cheek
      const l = t < 0.38 ? ramp(0.145, 0.38, 22, 40) : ramp(0.38, 0.9, 40, 50);
      const r = t < 0.22 ? ramp(0.145, 0.22, 26, 60) : t < 0.5 ? ramp(0.22, 0.5, 60, 66) : ramp(0.5, 0.9, 66, 60);
      return [l, r];
    }
    case 'twists': {
      if (t < 0.165) return null;
      const w = t < 0.25 ? ramp(0.165, 0.25, 30, 72) : ramp(0.25, 0.6, 72, 78);
      return [w, w];
    }
  }
}

/** The shell over the skull (h units) per style. The sides stay behind the face's front (never in front of a cheek). */
function capRows(style: HairStyle): HRow[] {
  switch (style) {
    case 'long':
      return [
        {t: -0.05, zf: -0.01, zb: -0.07, a: 0.03},
        {t: -0.015, zf: 0.16, zb: -0.27, a: 0.19},
        {t: 0.05, zf: 0.29, zb: -0.39, a: 0.3},
        {t: 0.14, zf: 0.375, zb: -0.45, a: 0.355},
        {t: 0.28, zf: 0.42, zb: -0.48, a: 0.378},
        {t: 0.45, zf: 0.42, zb: -0.485, a: 0.385},
        {t: 0.6, zf: 0.38, zb: -0.47, a: 0.39},
        {t: 0.72, zf: 0.3, zb: -0.465, a: 0.39},
        {t: 0.8, zf: 0.22, zb: -0.46, a: 0.385},
      ];
    case 'pony':
      return [
        {t: -0.022, zf: 0.0, zb: -0.06, a: 0.03},
        {t: 0.008, zf: 0.15, zb: -0.26, a: 0.18},
        {t: 0.07, zf: 0.27, zb: -0.36, a: 0.28},
        {t: 0.15, zf: 0.35, zb: -0.405, a: 0.325},
        {t: 0.3, zf: 0.405, zb: -0.43, a: 0.35},
        {t: 0.45, zf: 0.41, zb: -0.432, a: 0.352},
        {t: 0.6, zf: 0.36, zb: -0.4, a: 0.344},
        {t: 0.7, zf: 0.28, zb: -0.36, a: 0.33},
        {t: 0.77, zf: 0.2, zb: -0.31, a: 0.31},
      ];
    case 'bob':
      return [
        {t: -0.055, zf: -0.01, zb: -0.07, a: 0.03},
        {t: -0.018, zf: 0.17, zb: -0.28, a: 0.2},
        {t: 0.05, zf: 0.31, zb: -0.4, a: 0.31},
        {t: 0.14, zf: 0.395, zb: -0.46, a: 0.372},
        {t: 0.3, zf: 0.44, zb: -0.49, a: 0.4},
        {t: 0.48, zf: 0.4, zb: -0.495, a: 0.418},
        {t: 0.66, zf: 0.3, zb: -0.48, a: 0.43},
        {t: 0.84, zf: 0.25, zb: -0.46, a: 0.445},
        {t: 0.98, zf: 0.22, zb: -0.445, a: 0.458},
        {t: 1.04, zf: 0.21, zb: -0.44, a: 0.462},
      ];
    case 'twists':
      return [
        {t: -0.19, zf: 0.0, zb: -0.08, a: 0.06},
        {t: -0.16, zf: 0.17, zb: -0.24, a: 0.2},
        {t: -0.1, zf: 0.31, zb: -0.38, a: 0.33},
        {t: -0.02, zf: 0.4, zb: -0.46, a: 0.385},
        {t: 0.08, zf: 0.44, zb: -0.48, a: 0.39},
        {t: 0.18, zf: 0.44, zb: -0.47, a: 0.37},
        {t: 0.3, zf: 0.43, zb: -0.452, a: 0.356},
        {t: 0.45, zf: 0.41, zb: -0.44, a: 0.352},
        {t: 0.58, zf: 0.36, zb: -0.415, a: 0.345},
        {t: 0.68, zf: 0.28, zb: -0.37, a: 0.335},
      ];
  }
}

const capKeys = (b: Build, rows: HRow[]): SecKey[] =>
  rows.map((r) => ({y: b.crownY - r.t * b.skull, cx: 0, cz: ((r.zf + r.zb) / 2) * b.skull, ap: r.a * b.skull, an: r.a * b.skull, bf: ((r.zf - r.zb) / 2) * b.skull, bb: ((r.zf - r.zb) / 2) * b.skull, n: 2}));

/** The twists' textured top: rounded points of unequal size around the crown (no spikes, no strands). */
function twistBump(phi: number, t: number): number {
  if (t > 0.2) return 0;
  const k = clamp((0.2 - t) / 0.22, 0, 1);
  const n = 11;
  const u = (((phi + 7 * Math.round(t * 20)) % 360) + 360) % 360 / (360 / n);
  const i = Math.floor(u);
  const f = u - i;
  const amp = 0.5 + 0.5 * hash(i * 7.3 + Math.round(t * 30) * 1.7);
  return k * amp * Math.sin(Math.PI * f) ** 2.2;
}

export type HairOut = {parts: Part[]; crownPt: V2};

export function hair(style: HairStyle, b: Build, sk: Skeleton, r: HeadRig, v: View, mat: string, neckPts: PP[] | null): HairOut {
  const parts: Part[] = [];
  const h = b.skull;
  const fy = faceYaw(r);
  const grp = 'hairG';
  const secs = sections(capKeys(b, capRows(style)), 4);
  const tAt = (y: number) => (b.crownY - y) / h;
  let capXf = r.xf;
  if (style === 'twists') {
    const base = r.xf;
    capXf = (p: V3) => {
      const t = tAt(p[1]);
      const cz = -0.02 * h;
      const phi = (Math.atan2(p[2] - cz, p[0]) * 180) / Math.PI;
      const bump = twistBump(phi, t) * 0.055 * h;
      const dx = p[0];
      const dz = p[2] - cz;
      const l = Math.hypot(dx, dz) || 1;
      return base([p[0] + (dx / l) * bump, p[1] + (t < -0.05 ? bump * 0.6 : 0), p[2] + (dz / l) * bump]);
    };
  }
  // the face (and, where it is in front, the neck) cut out of the shell
  const cuts: PP[][] = [];
  const tLow = style === 'bob' ? 1.04 : style === 'twists' ? 0.7 : 0.82;
  const faceReg = headRegion(
    r,
    v,
    0.14,
    Math.min(1.0, tLow + 0.12),
    (t) => {
      const fa = faceArc(style, t) ?? [0, 0];
      return [90 - fa[0], 90 + fa[1]];
    },
    0,
    18,
  );
  if (faceReg) cuts.push(faceReg);
  if (neckPts && Math.abs(fy) < 100) cuts.push(neckPts);
  const cap = loftOutline(secs, v, capXf);
  parts.push({k: 'hairCap', pts: cap, mat, z: Z.hair, tension: 0.45, cut: cuts, grp});

  // the sheen band on the key side of the crown
  const sheenRows = style === 'twists' ? [-0.12, 0.0] : style === 'bob' ? [0.06, 0.19] : [0.05, 0.17];
  {
    const left: V2[] = [];
    const right: V2[] = [];
    const rowsN = 6;
    for (let i = 0; i <= rowsN; i++) {
      const t = lerp(sheenRows[0], sheenRows[1], i / rowsN);
      const y = b.crownY - t * h;
      const cand: {phi: number; p: V2; score: number}[] = [];
      for (let a = 0; a < 360; a += 5) {
        const s = surf(secs, y, a, v, capXf, 0.6);
        if (!s.vis) continue;
        const s2 = surf(secs, y, a, v, capXf, 6);
        const nx = s2.p[0] - s.p[0];
        const ny = s2.p[1] - s.p[1];
        const nl = Math.hypot(nx, ny) || 1;
        cand.push({phi: a, p: s.p, score: (nx / nl) * -0.82 + (ny / nl) * -0.57});
      }
      const good = cand.filter((c) => c.score > 0.2);
      if (good.length < 2) continue;
      good.sort((a, c) => a.phi - c.phi);
      let best: typeof good = [];
      let cur: typeof good = [good[0]];
      for (let j = 1; j < good.length; j++) {
        if (good[j].phi - good[j - 1].phi <= 5.5) cur.push(good[j]);
        else {
          if (cur.length > best.length) best = cur;
          cur = [good[j]];
        }
      }
      if (cur.length > best.length) best = cur;
      if (best.length < 2) continue;
      const taper = Math.sin((Math.PI * (i + 0.5)) / (rowsN + 1));
      const mid = Math.floor(best.length / 2);
      const half = Math.max(1, Math.round((best.length / 2) * (0.3 + 0.55 * taper)));
      const run = best.slice(Math.max(0, mid - half), Math.min(best.length, mid + half));
      const xs = run.map((c) => c.p);
      left.push(xs.reduce((a, c) => (c[0] < a[0] ? c : a)));
      right.push(xs.reduce((a, c) => (c[0] > a[0] ? c : a)));
    }
    if (left.length >= 3) parts.push({k: 'hairSheen', pts: [...left, ...right.reverse()], mat, tone: 'sheen', z: Z.hairDetail, clip: 'hairCap', cut: cuts, tension: 0.5});
  }

  if (style === 'long') {
    // the fall: from behind the ears down the back to the shoulder blades; full rings kept behind the jaw and neck
    // (head frame at the top, the body's frame below the jaw: the hair hangs)
    const rows: HRow[] = [
      {t: 0.62, zf: -0.06, zb: -0.475, a: 0.37},
      {t: 0.8, zf: -0.17, zb: -0.465, a: 0.382},
      {t: 0.93, zf: -0.22, zb: -0.465, a: 0.385},
      {t: 1.06, zf: -0.27, zb: -0.49, a: 0.39},
      {t: 1.25, zf: -0.42, zb: -0.6, a: 0.43},
      {t: 1.5, zf: -0.57, zb: -0.7, a: 0.48},
      {t: 1.85, zf: -0.6, zb: -0.73, a: 0.5},
      {t: 2.18, zf: -0.62, zb: -0.74, a: 0.46},
      {t: 2.36, zf: -0.63, zb: -0.73, a: 0.36},
      {t: 2.44, zf: -0.64, zb: -0.71, a: 0.22},
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
    // the bouncy ends: two soft notches up into the bottom (three rounded clumps)
    const yEnd = b.crownY - 2.44 * h;
    const notches: PP[][] = [];
    for (const u of [-0.17, 0.15]) {
      const e = proj(bodyXf([u * h, yEnd + 0.06 * h, -0.72 * h]), v);
      const w = 0.05 * h;
      notches.push([[e.x - w, e.y + 0.14 * h], [e.x - w * 0.15, e.y - 0.03 * h], [e.x + w * 0.15, e.y - 0.03 * h], [e.x + w, e.y + 0.14 * h]]);
    }
    const c = Math.cos((v.yaw * Math.PI) / 180);
    parts.push({k: 'hairFall', pts: fall, mat, z: c > 0.17 ? Z.backHair : Z.frontHair, tension: 0.5, cut: c < 0.6 ? notches : undefined, grp});
  }
  if (style === 'pony') {
    // the tie at the back of the crown, the tail falling from it: the figure's one flowing element
    const tieT = 0.26;
    const tieN: V3 = [0, b.crownY - tieT * h, -0.46 * h];
    const tie = r.xf(tieN);
    const bodyXf = (p: V3): V3 => sk.leanXf([p[0] + sk.cx(p[1] - sk.bob), p[1] - sk.bob, p[2]]);
    // the tail hangs in the body's frame (gravity), with a soft S
    const p1 = r.xf([0, tieN[1] + 0.03 * h, -0.66 * h]);
    const p2 = bodyXf([0.02 * h, tieN[1] - 0.3 * h, -0.72 * h]);
    const p3 = bodyXf([0.04 * h, tieN[1] - 0.78 * h, -0.66 * h]);
    const p4 = bodyXf([0.07 * h, tieN[1] - 1.26 * h, -0.6 * h]);
    const chain: V3[] = [tie, p1, p2, p3, p4];
    const rad = pchip([0, 0.1, 0.3, 0.62, 0.86, 1], [0.08 * h, 0.13 * h, 0.15 * h, 0.12 * h, 0.06 * h, 0.012 * h]);
    const tail = tubeOutline(chain, (s) => ({ru: rad(s), rv: rad(s) * 0.85}), v, [0, 0, 1], {m: 32, capStart: true, capEnd: false});
    const dT = proj(p3, v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
    parts.push({k: 'hairTail', pts: tail, mat, z: dT < -20 ? Z.backHair : Z.frontHair - 1, tension: 0.5, grp});
    // the tie: a small dark band across the tail's root
    const a = proj(tie, v);
    const q = proj(p1, v);
    const ax: V2 = [q.x - a.x, q.y - a.y];
    const al = Math.hypot(ax[0], ax[1]) || 1;
    const d: V2 = [ax[0] / al, ax[1] / al];
    const nrm: V2 = [-d[1], d[0]];
    const c0: V2 = [a.x + d[0] * 0.05 * h, a.y + d[1] * 0.05 * h];
    const w = 0.11 * h;
    const tt = 0.03 * h;
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
      z: Z.frontHair,
      clip: 'hairTail',
      tension: 0.6,
    });
  }
  if (style === 'bob') {
    // the "ripped" hem: 3-4 shallow tapered notches cut up into the bottom edge, where it is visible
    const yH = b.crownY - 1.04 * h;
    for (const [phi, dep] of [
      [200, 0.06],
      [232, 0.085],
      [262, 0.055],
      [292, 0.08],
      [322, 0.06],
      [350, 0.07],
      [22, 0.06],
      [160, 0.07],
    ] as [number, number][]) {
      const s = surf(secs, yH + 0.01 * h, phi, v, capXf, 1.5);
      if (!s.vis) continue;
      const w = 0.032 * h;
      cuts.push([[s.p[0] - w, s.p[1] + 0.06 * h], [s.p[0], s.p[1] - dep * h], [s.p[0] + w, s.p[1] + 0.06 * h]]);
    }
  }
  if (style === 'twists') {
    // the low taper: the lowest band at the sides and nape a step lighter (skin showing through), a clean neckline
    const tRows = capRows('twists').filter((q) => q.t >= 0.45);
    const tSec = sections(capKeys(b, tRows), 4);
    const taper = loftOutline(tSec, v, r.xf);
    parts.push({k: 'hairTaper', pts: taper, mat: 'taper', tone: 'base', z: Z.hairDetail, clip: 'hairCap', cut: cuts, tension: 0.45});
  }
  const top = proj(r.xf([0, b.crownY + 4, 0]), v);
  void sub3;
  return {parts, crownPt: [top.x, top.y]};
}
