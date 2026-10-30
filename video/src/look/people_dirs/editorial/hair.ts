// Editorial people: hair as designed masses (dir_editorial.md §4, hair). One main mass (a loft in the head's frame, the
// face's arc left open), 0-2 secondary masses (a fall down the back in the body's frame, a ponytail, a bob's shell) and
// ONE sheen band (+13 L*, a crisp crescent 20-35 % down from the crown on the key side): "healthy hair", not a helmet
// (design_research R1-R7; fashion H1-H10). The back view is the hair's showcase, so each style is designed from behind.
import {type PP, type SecKey, type V2, type V3, type View, add3, clamp, hash, lerp, loftOutline, norm3, pchip, proj, sections, sub3, surf, tubeOutline} from './core';
import type {Build, Skeleton} from './body';
import {type HeadRig, faceYaw} from './head';
import {type Part, Z} from './parts';

export type HairStyle = 'long' | 'pony' | 'bob' | 'twists';

type HRow = {t: number; zf: number; zb: number; a: number};

/** The face's open arc (half-angle around the front, degrees) at head fraction t, per style: 0 = covered. */
function faceArc(style: HairStyle, t: number): [number, number] | null {
  // returns [left extent, right extent]: the face spans phi in [90 - right, 90 + left]... (both positive)
  const tf = style === 'twists' ? 0.165 : style === 'bob' ? 0.15 : 0.16;
  if (t < tf) return null;
  const u = clamp((t - tf) / 0.08, 0, 1);
  const open = (full: number) => lerp(30, full, Math.sqrt(u));
  switch (style) {
    case 'long':
      return [open(t < 0.62 ? 63 : 60), open(t < 0.62 ? 63 : 60)];
    case 'pony':
      return [open(t < 0.5 ? 72 : 78), open(t < 0.5 ? 72 : 78)];
    case 'bob': {
      // a side part on the figure's right: the swept front piece covers more of the LEFT side's temple and cheek
      const l = t < 0.36 ? lerp(open(46), 40, clamp((t - 0.2) / 0.16, 0, 1)) : lerp(46, 52, clamp((t - 0.36) / 0.4, 0, 1));
      const r = t < 0.5 ? open(66) : 60;
      return [l, r];
    }
    case 'twists':
      return [open(76), open(76)];
  }
}

/** The cap's shell over the skull (h units): volume by t, per style. */
function capRows(style: HairStyle): HRow[] {
  switch (style) {
    case 'long':
      return [
        {t: -0.045, zf: 0.0, zb: -0.06, a: 0.03},
        {t: -0.01, zf: 0.16, zb: -0.27, a: 0.19},
        {t: 0.06, zf: 0.29, zb: -0.39, a: 0.3},
        {t: 0.15, zf: 0.37, zb: -0.45, a: 0.36},
        {t: 0.3, zf: 0.42, zb: -0.48, a: 0.385},
        {t: 0.45, zf: 0.43, zb: -0.475, a: 0.395},
        {t: 0.6, zf: 0.41, zb: -0.45, a: 0.395},
        {t: 0.75, zf: 0.38, zb: -0.42, a: 0.39},
        {t: 0.9, zf: 0.35, zb: -0.4, a: 0.385},
        {t: 1.02, zf: 0.32, zb: -0.39, a: 0.38},
      ];
    case 'pony':
      return [
        {t: -0.02, zf: 0.0, zb: -0.06, a: 0.03},
        {t: 0.01, zf: 0.15, zb: -0.26, a: 0.18},
        {t: 0.07, zf: 0.27, zb: -0.36, a: 0.28},
        {t: 0.15, zf: 0.35, zb: -0.405, a: 0.325},
        {t: 0.3, zf: 0.405, zb: -0.43, a: 0.35},
        {t: 0.45, zf: 0.42, zb: -0.43, a: 0.352},
        {t: 0.6, zf: 0.4, zb: -0.395, a: 0.34},
        {t: 0.7, zf: 0.38, zb: -0.35, a: 0.325},
        {t: 0.76, zf: 0.36, zb: -0.3, a: 0.31},
      ];
    case 'bob':
      return [
        {t: -0.05, zf: 0.0, zb: -0.06, a: 0.03},
        {t: -0.015, zf: 0.17, zb: -0.28, a: 0.2},
        {t: 0.06, zf: 0.31, zb: -0.4, a: 0.31},
        {t: 0.15, zf: 0.39, zb: -0.46, a: 0.375},
        {t: 0.3, zf: 0.44, zb: -0.49, a: 0.405},
        {t: 0.48, zf: 0.44, zb: -0.49, a: 0.42},
        {t: 0.66, zf: 0.42, zb: -0.47, a: 0.43},
        {t: 0.84, zf: 0.4, zb: -0.45, a: 0.445},
        {t: 0.98, zf: 0.38, zb: -0.43, a: 0.46},
        {t: 1.04, zf: 0.37, zb: -0.42, a: 0.465},
      ];
    case 'twists':
      return [
        {t: -0.2, zf: 0.0, zb: -0.08, a: 0.05},
        {t: -0.16, zf: 0.2, zb: -0.26, a: 0.24},
        {t: -0.08, zf: 0.34, zb: -0.4, a: 0.36},
        {t: 0.02, zf: 0.42, zb: -0.47, a: 0.39},
        {t: 0.13, zf: 0.44, zb: -0.475, a: 0.385},
        {t: 0.24, zf: 0.43, zb: -0.46, a: 0.36},
        {t: 0.36, zf: 0.42, zb: -0.445, a: 0.355},
        {t: 0.5, zf: 0.4, zb: -0.43, a: 0.35},
        {t: 0.62, zf: 0.36, zb: -0.4, a: 0.34},
        {t: 0.7, zf: 0.3, zb: -0.36, a: 0.33},
      ];
  }
}

const capKeys = (b: Build, rows: HRow[]): SecKey[] =>
  rows.map((r) => ({y: b.crownY - r.t * b.skull, cx: 0, cz: ((r.zf + r.zb) / 2) * b.skull, ap: r.a * b.skull, an: r.a * b.skull, bf: ((r.zf - r.zb) / 2) * b.skull, bb: ((r.zf - r.zb) / 2) * b.skull, n: 2}));

/** The twists' bumpy top: a radial modulation of the cap above t 0.3 (small rounded points of unequal size). */
function twistBump(phi: number, t: number): number {
  if (t > 0.3) return 0;
  const k = clamp((0.3 - t) / 0.3, 0, 1);
  const n = 13;
  const u = ((phi % 360) + 360) % 360 / (360 / n);
  const i = Math.floor(u);
  const f = u - i;
  const amp = 0.55 + 0.45 * hash(i * 7.3 + Math.round(t * 40));
  return k * amp * Math.sin(Math.PI * f) ** 1.5;
}

export type HairOut = {parts: Part[]; /** The head's silhouette top, for hats or sunglasses pushed up. */ crownPt: V2};

export function hair(style: HairStyle, b: Build, sk: Skeleton, r: HeadRig, v: View, mat = 'hair'): HairOut {
  const parts: Part[] = [];
  const h = b.skull;
  const fy = faceYaw(r);
  const rows = capRows(style);
  let keys = capKeys(b, rows);
  const secs = sections(keys, 4);
  const tAt = (y: number) => (b.crownY - y) / h;
  // the cap's arc: everything but the face below the hairline
  const arc = (y: number): [number, number] | null => {
    const fa = faceArc(style, tAt(y));
    if (!fa) return null;
    return [90 + fa[0], 450 - fa[1]];
  };
  let capXf = r.xf;
  if (style === 'twists') {
    // push the cap's points out by the twist bumps (in the head's neutral frame, radially from the head's axis)
    const base = r.xf;
    capXf = (p: V3) => {
      const t = tAt(p[1]);
      const phi = (Math.atan2(p[2] - (-0.02 * h), p[0]) * 180) / Math.PI;
      const bump = twistBump(phi, t) * 0.07 * h;
      const dx = p[0];
      const dz = p[2] + 0.02 * h;
      const l = Math.hypot(dx, dz) || 1;
      const up = t < 0 ? bump * 0.8 : 0;
      return base([p[0] + (dx / l) * bump, p[1] + up, p[2] + (dz / l) * bump]);
    };
  }
  const cap = loftOutline(secs, v, capXf, {arc});
  parts.push({k: 'hairCap', pts: cap, mat, z: Z.hair, tension: 0.45});

  // the sheen band: a crisp crescent following the skull's curve on the key side (screen-left), 20-35 % down the
  // crown; it sits where the surface faces both the camera and the key
  const sheenRows = style === 'twists' ? [-0.12, -0.02] : style === 'bob' ? [0.08, 0.2] : [0.07, 0.19];
  {
    const left: V2[] = [];
    const right: V2[] = [];
    const rowsN = 6;
    for (let i = 0; i <= rowsN; i++) {
      const t = lerp(sheenRows[0], sheenRows[1], i / rowsN);
      const y = b.crownY - t * h;
      // candidate phis on the visible surface whose normal points toward screen-left-up
      const cand: {phi: number; p: V2; score: number}[] = [];
      for (let a = 0; a < 360; a += 6) {
        const s = surf(secs, y, a, v, capXf, 0.6);
        if (!s.vis) continue;
        const s2 = surf(secs, y, a, v, capXf, 6);
        const nx = s2.p[0] - s.p[0];
        const ny = s2.p[1] - s.p[1];
        const nl = Math.hypot(nx, ny) || 1;
        cand.push({phi: a, p: s.p, score: (nx / nl) * -0.82 + (ny / nl) * -0.57});
      }
      const good = cand.filter((c) => c.score > 0.25);
      if (good.length < 2) continue;
      // the longest contiguous run of good phis
      good.sort((a, c) => a.phi - c.phi);
      let best: typeof good = [];
      let cur: typeof good = [good[0]];
      for (let j = 1; j < good.length; j++) {
        if (good[j].phi - good[j - 1].phi <= 6.5) cur.push(good[j]);
        else {
          if (cur.length > best.length) best = cur;
          cur = [good[j]];
        }
      }
      if (cur.length > best.length) best = cur;
      if (best.length < 2) continue;
      const taper = Math.sin((Math.PI * (i + 0.5)) / (rowsN + 1));
      const mid = Math.floor(best.length / 2);
      const half = Math.max(1, Math.round((best.length / 2) * (0.35 + 0.65 * taper)));
      const run = best.slice(Math.max(0, mid - half), Math.min(best.length, mid + half));
      const xs = run.map((c) => c.p);
      const lx = xs.reduce((a, c) => (c[0] < a[0] ? c : a));
      const rx = xs.reduce((a, c) => (c[0] > a[0] ? c : a));
      left.push(lx);
      right.push(rx);
    }
    if (left.length >= 3) parts.push({k: 'hairSheen', pts: [...left, ...right.reverse()], mat, tone: 'sheen', z: Z.hairDetail, clip: 'hairCap', tension: 0.5});
  }

  // ---- secondary masses
  if (style === 'long') {
    // the fall: from behind the head down the back to the shoulder blades, its ends turned in a soft curl (body space)
    const y0 = b.pivotY + 10;
    const yEnd = b.crownY - 2.42 * h;
    const nb = sk.neckBase;
    const bk = (y: number) => b.chestBb + 6;
    void bk;
    const fallKeys: SecKey[] = [
      {y: y0, cx: sk.cx(y0), cz: -0.34 * h, ap: 0.39 * h, an: 0.39 * h, bf: 0.13 * h, bb: 0.13 * h},
      {y: y0 - 30, cx: sk.cx(y0 - 30), cz: -0.42 * h, ap: 0.41 * h, an: 0.41 * h, bf: 0.1 * h, bb: 0.12 * h},
      {y: nb[1] - 4, cx: sk.cx(nb[1]), cz: nb[2] - 0.34 * h, ap: 0.46 * h, an: 0.46 * h, bf: 0.09 * h, bb: 0.1 * h},
      {y: b.shY - 40, cx: sk.cx(b.shY - 40), cz: -b.chestBb - 0.07 * h, ap: 0.5 * h, an: 0.5 * h, bf: 0.07 * h, bb: 0.08 * h},
      {y: yEnd + 0.4 * h, cx: sk.cx(yEnd + 40), cz: -b.chestBb - 0.08 * h, ap: 0.5 * h, an: 0.5 * h, bf: 0.07 * h, bb: 0.09 * h},
      {y: yEnd + 0.12 * h, cx: sk.cx(yEnd), cz: -b.chestBb - 0.1 * h, ap: 0.47 * h, an: 0.47 * h, bf: 0.08 * h, bb: 0.1 * h},
      {y: yEnd, cx: sk.cx(yEnd), cz: -b.chestBb - 0.13 * h, ap: 0.4 * h, an: 0.4 * h, bf: 0.06 * h, bb: 0.06 * h},
    ];
    const fsecs = sections(fallKeys, 6);
    const fall = loftOutline(fsecs, v, sk.leanXf, {cornerBottom: false});
    // the bouncy ends: scallop the bottom (2-3 big rounded curls) by cutting soft notches up into it
    const dTorso = proj(sk.leanXf([sk.cx(b.chestY), b.chestY, -b.chestBb - 0.1 * h]), v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
    const z = dTorso > 0 ? Z.frontHair : Z.backHair;
    const notches: PP[][] = [];
    const ends: V3[] = [-0.2, 0.17].map((u) => sk.leanXf([sk.cx(yEnd) + u * h * 1.2, yEnd + 0.05 * h, -b.chestBb - 0.18 * h]));
    for (const e of ends) {
      const p = proj(e, v);
      const w = 0.045 * h;
      notches.push([[p.x - w, p.y + 0.12 * h], [p.x, p.y - 0.04 * h], [p.x + w, p.y + 0.12 * h]]);
    }
    parts.push({k: 'hairFall', pts: fall, mat, z, tension: 0.5, cut: Math.abs(fy) > 100 ? notches : undefined});
  }
  if (style === 'pony') {
    // the tie at the back of the crown, the tail falling from it: the figure's one flowing element
    const tieT = 0.27;
    const tieN: V3 = [0, b.crownY - tieT * h, -0.47 * h];
    const tie = r.xf(tieN);
    const back = norm3(sub3(r.xf([0, tieN[1], -0.9 * h]), tie));
    const p1 = add3(tie, [back[0] * 0.22 * h, 0.06 * h, back[2] * 0.22 * h]);
    const p2 = add3(tie, [back[0] * 0.34 * h, -0.38 * h, back[2] * 0.34 * h]);
    const p3 = add3(tie, [back[0] * 0.3 * h, -0.9 * h, back[2] * 0.3 * h]);
    const p4 = add3(tie, [back[0] * 0.18 * h + 0.02 * h, -1.32 * h, back[2] * 0.18 * h]);
    const chain: V3[] = [tie, p1, p2, p3, p4];
    const rad = pchip([0, 0.12, 0.35, 0.7, 1], [0.1 * h, 0.15 * h, 0.15 * h, 0.1 * h, 0.012 * h]);
    const tail = tubeOutline(chain, (s) => ({ru: rad(s), rv: rad(s) * 0.8}), v, [0, 0, 1], {m: 30, capStart: true, capEnd: false});
    const dT = proj(p3, v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
    parts.push({k: 'hairTail', pts: tail, mat, z: dT < -20 ? Z.backHair : Z.tail, tension: 0.5});
    // the tie: a small dark band where the tail leaves the head
    const tp = proj(tie, v);
    const tq = proj(p1, v);
    const ax = norm3([tq.x - tp.x, tq.y - tp.y, 0]);
    const nx = -ax[1];
    const ny = ax[0];
    const w = 0.1 * h;
    const off = 0.06 * h;
    const c: V2 = [tp.x + ax[0] * off, tp.y + ax[1] * off];
    parts.push({
      k: 'hairTie',
      pts: [
        [c[0] + nx * w - ax[0] * 0.025 * h, c[1] + ny * w - ax[1] * 0.025 * h],
        [c[0] + nx * w + ax[0] * 0.025 * h, c[1] + ny * w + ax[1] * 0.025 * h],
        [c[0] - nx * w + ax[0] * 0.025 * h, c[1] - ny * w + ax[1] * 0.025 * h],
        [c[0] - nx * w - ax[0] * 0.025 * h, c[1] - ny * w - ax[1] * 0.025 * h],
      ],
      mat,
      tone: 'deep',
      z: Math.abs(fy) > 60 ? Z.hairDetail : Z.tail + 1,
      clip: Math.abs(fy) > 60 ? undefined : 'hairTail',
      tension: 0.6,
    });
  }
  if (style === 'bob') {
    // the blunt, separated hem: 3-4 shallow tapered notches cut up into the bob's bottom edge
    const yH = b.crownY - 1.04 * h;
    const notches: PP[][] = [];
    for (const [phi, dep] of [
      [205, 0.07],
      [240, 0.09],
      [275, 0.06],
      [310, 0.085],
      [345, 0.07],
      [20, 0.06],
      [160, 0.06],
    ] as [number, number][]) {
      const s = surf(secs, yH + 0.01 * h, phi, v, capXf, 1.5);
      if (!s.vis && Math.abs(fy) < 100) continue;
      const w = 0.035 * h;
      notches.push([[s.p[0] - w, s.p[1] + 0.05 * h], [s.p[0], s.p[1] - dep * h], [s.p[0] + w, s.p[1] + 0.05 * h]]);
    }
    const capPart = parts.find((p) => p.k === 'hairCap')!;
    capPart.cut = notches;
  }
  if (style === 'twists') {
    // the low taper: the sides and nape a step lighter in the lowest band (skin showing through), a clean neckline
    const tSec = sections(capKeys(b, capRows('twists')).filter((k) => k.y < b.crownY - 0.3 * h), 4);
    const taper = loftOutline(tSec, v, r.xf, {arc: (y) => {
      const fa = faceArc('twists', tAt(y));
      return fa ? [90 + fa[0] + 4, 450 - fa[1] - 4] : null;
    }});
    parts.push({k: 'hairTaper', pts: taper, mat: 'taper', tone: 'base', z: Z.hairDetail, clip: 'hairCap', tension: 0.45});
  }
  void keys;
  keys = [];
  const top = proj(r.xf([0, b.crownY + 4, 0]), v);
  return {parts, crownPt: [top.x, top.y]};
}
