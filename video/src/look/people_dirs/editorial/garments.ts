// Editorial people: garments (dir_editorial.md §2, clothing). Each garment is 1-2 lofted masses that follow the body's
// contrapposto spine, with fit as distance from the body (compact <= 0.01 H, relaxed 0.015-0.025, roomy 0.03-0.06:
// design_research C3), ONE roomy piece per figure against compact ones (C2), dropped shoulders on coats, knits and
// shirts (C4), current lengths (C5) and cuts (C6), and one finish detail each (C9): the open coat's lapels, the
// cardigan's ribbed hem, the shirt's half-tuck, the jacket's open front, the jeans' clean hem on the shoe.
import {type PP, type Sec, type SecKey, type V2, type V3, type View, add3, clamp, lerp, loftOutline, pchip, proj, region, ringExtent, sections, surf, tubeOutline} from './core';
import type {Build, Side, Skeleton} from './body';
import {legRadius} from './body';
import {type Part, Z} from './parts';

/** A garment row in the standing frame: height, half-widths (+X side `a`, -X side `an`), depths, squareness, an extra
 *  forward offset. */
export type GRow = {y: number; a: number; an?: number; bf: number; bb: number; n?: number; dz?: number};

export type GOpts = {
  /** How much of the spine's frontal tilt a row takes (1 above the waist; a hanging hem takes less). */
  tiltK?: (y: number) => number;
  /** Contain the legs below this height (skirts, coats in a stride), with this ease. */
  envelope?: {below: number; ease: number; back?: number};
};

/** The leg's point and radius at height y (along hip -> knee -> ankle), or null when the leg does not reach y. */
function legAt(sk: Skeleton, s: Side, y: number): {p: V3; r: number} | null {
  const ch = [sk.hip[s], sk.knee[s], sk.ankle[s]];
  const lens = [Math.hypot(...([0, 1, 2].map((i) => ch[1][i] - ch[0][i]) as [number, number, number])), Math.hypot(...([0, 1, 2].map((i) => ch[2][i] - ch[1][i]) as [number, number, number]))];
  const tot = lens[0] + lens[1];
  for (let j = 0; j < 2; j++) {
    const a = ch[j];
    const b = ch[j + 1];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) {
      const k = (a[1] - y) / (a[1] - b[1]);
      const p: V3 = [lerp(a[0], b[0], k), y, lerp(a[2], b[2], k)];
      const s = (j === 0 ? k * lens[0] : lens[0] + k * lens[1]) / tot;
      const r = legRadius(sk.b, s);
      return {p, r: Math.max(r.ru, r.rv)};
    }
  }
  return null;
}

/** Garment rows -> resampled sections on the body's spine (and around the legs, for skirts). */
export function garmentSecs(sk: Skeleton, rows: GRow[], o: GOpts = {}, step = 8): Sec[] {
  const sorted = [...rows].sort((a, b) => b.y - a.y);
  // densify (every 30 units) so the envelope can bend the outline between the designer's rows
  const dense: GRow[] = [];
  for (let i = 0; i < sorted.length; i++) {
    dense.push(sorted[i]);
    const nx = sorted[i + 1];
    if (!nx) break;
    const gap = sorted[i].y - nx.y;
    const n = Math.floor(gap / 30);
    for (let j = 1; j < n; j++) {
      const k = j / n;
      const a = sorted[i];
      dense.push({
        y: lerp(a.y, nx.y, k),
        a: lerp(a.a, nx.a, k),
        an: lerp(a.an ?? a.a, nx.an ?? nx.a, k),
        bf: lerp(a.bf, nx.bf, k),
        bb: lerp(a.bb, nx.bb, k),
        n: lerp(a.n ?? 2, nx.n ?? 2, k),
        dz: lerp(a.dz ?? 0, nx.dz ?? 0, k),
      });
    }
  }
  const keys: SecKey[] = dense.map((r) => {
    const y = r.y - sk.bob;
    const cx = sk.cx(y);
    const cz = sk.cz(y) + (r.dz ?? 0);
    let ap = r.a;
    let an = r.an ?? r.a;
    let bf = r.bf;
    let bb = r.bb;
    const env = o.envelope;
    if (env && r.y < env.below) {
      for (const s of ['l', 'r'] as Side[]) {
        const L = legAt(sk, s, y);
        if (!L) continue;
        const e = env.ease + L.r;
        ap = Math.max(ap, L.p[0] + e - cx);
        an = Math.max(an, cx - (L.p[0] - e));
        bf = Math.max(bf, L.p[2] + e - cz);
        bb = Math.max(bb, cz - (L.p[2] - e) + (env.back ?? 0));
      }
    }
    return {y, cx, cz, ap, an, bf, bb, n: r.n ?? 2, tilt: sk.tilt(y) * (o.tiltK ? o.tiltK(r.y) : 1)};
  });
  return sections(keys, step);
}

export type Opening = {
  /** The half-angle of the front opening (degrees) by height (standing frame); 0 = closed. */
  alpha: (y: number) => number;
  /** From and to (standing frame). */
  y0: number;
  y1: number;
};

/** The screen polygon of a front opening (the region between the two front edges), extended past hidden edges and
 *  below the hem: cut out of the garment so the layers under it show. */
export function openingCut(sk: Skeleton, secs: Sec[], v: View, op: Opening, below = 40): PP[] {
  // decide per view, once, which front edge faces the camera (at mid-height), so the polygon never zig-zags row by row
  const yMid = lerp(op.y0, op.y1, 0.45) - sk.bob;
  const aMid = op.alpha(yMid + sk.bob);
  const m1 = surf(secs, yMid, 90 - aMid, v, sk.leanXf);
  const m2 = surf(secs, yMid, 90 + aMid, v, sk.leanXf);
  if (!m1.vis && !m2.vis) return [];
  // facing screen-left (the front is screen-left) for yaw in (0, 180)
  const yw = ((v.yaw % 360) + 360) % 360;
  const frontLeft = yw > 0 && yw < 180;
  const L: V2[] = [];
  const R: V2[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const ys = lerp(op.y0, op.y1, i / n);
    const y = ys - sk.bob;
    const a = op.alpha(ys);
    const e1 = surf(secs, y, 90 - a, v, sk.leanXf);
    const e2 = surf(secs, y, 90 + a, v, sk.leanXf);
    const [lo, hi] = ringExtent(secs, y, v, sk.leanXf);
    let p1: V2 = e1.p;
    let p2: V2 = e2.p;
    // a hidden edge is replaced by a point past the silhouette on the front's side
    const far: V2 = frontLeft ? [lo - 40, 0] : [hi + 40, 0];
    if (!m1.vis) p1 = [far[0], e1.p[1]];
    if (!m2.vis) p2 = [far[0], e2.p[1]];
    if (a < 0.5) {
      p1 = e1.p;
      p2 = e1.p;
    }
    const [pl, pr] = p1[0] <= p2[0] ? [p1, p2] : [p2, p1];
    L.push(pl);
    R.push(pr);
  }
  const lastL = L[L.length - 1];
  const lastR = R[R.length - 1];
  return [...L, [lastL[0], lastL[1] + below], [lastR[0], lastR[1] + below], ...R.reverse()];
}

const tiltHang = (yHip: number) => (y: number) => (y > yHip ? 1 : clamp(1 - (yHip - y) / 220, 0.15, 1));

// ---------------------------------------------------------------- her A: the knee coat, the knit, the slip skirt

/** The long open coat: chocolate wool, dropped shoulders, worn open and unbelted, hanging straight from the shoulder
 *  blades to just below the knee (fashion N1/N2; diagnose §5's belted A-line, retired). Roomy: 0.035-0.05 H off the
 *  body at the hem. Its lapels are the finish detail. */
export function coat(sk: Skeleton, v: View, mat = 'coat', hemY = 268): Part[] {
  const b = sk.b;
  const rows: GRow[] = [
    {y: 872, a: 30, bf: 22, bb: 32, dz: -12},
    {y: 852, a: 44, bf: 30, bb: 42, dz: -10},
    {y: 832, a: 86, bf: 46, bb: 58, dz: -6},
    {y: 812, a: 112, bf: 62, bb: 64, n: 2.2, dz: -4},
    {y: 790, a: 117, bf: 78, bb: 68, n: 2.3},
    {y: 755, a: 117, bf: 88, bb: 70, n: 2.3},
    {y: 735, a: 117, bf: 92, bb: 70, n: 2.3},
    {y: 680, a: 118, bf: 90, bb: 70, n: 2.3},
    {y: 620, a: 120, bf: 87, bb: 74, n: 2.3},
    {y: 540, a: 125, bf: 86, bb: 84, n: 2.3},
    {y: 500, a: 128, bf: 86, bb: 88, n: 2.3},
    {y: 400, a: 131, bf: 88, bb: 88, n: 2.3},
    {y: hemY, a: 135, bf: 90, bb: 88, n: 2.3},
  ];
  const secs = garmentSecs(sk, rows, {tiltK: tiltHang(b.hipJY), envelope: {below: b.crotchY + 30, ease: 26, back: 6}});
  const out = loftOutline(secs, v, sk.leanXf, {cornerBottom: true});
  const alpha = pchip([-872, -852, -820, -790, -735, -700, -620, -500, -hemY], [62, 52, 40, 33, 25, 22, 21, 23, 27].map((x) => x));
  const op: Opening = {alpha: (y) => alpha(-y), y0: 872, y1: hemY};
  const cut = openingCut(sk, secs, v, op);
  const parts: Part[] = [{k: 'coat', pts: out, mat, z: Z.outer, cut: cut.length ? [cut] : undefined, tension: 0.45}];
  // the lapels: a notch lapel on each front, from the collar down to the break point above the bust
  for (const side of [1, -1]) {
    const reg = region(
      secs,
      v,
      806 - sk.bob,
      716 - sk.bob,
      (y) => {
        const ys = y + sk.bob;
        const a = alpha(-ys);
        const u = clamp((ys - 716) / (806 - 716), 0, 1);
        const w = 30 * Math.pow(u, 0.85) + 2;
        return side === 1 ? [90 - a - w, 90 - a + 1.5] : [90 + a - 1.5, 90 + a + w];
      },
      sk.leanXf,
      2.5,
      12,
    );
    if (reg) parts.push({k: `lapel_${side}`, pts: reg.map((p, i) => (i === 0 || i === reg.length - 1 ? ([p[0], p[1], 1] as PP) : p)), mat, z: Z.outerDetail, tension: 0.3, gk: 1.15});
  }
  // the collar band at the back of the neck
  const col = region(secs, v, 872 - sk.bob, 836 - sk.bob, () => [100, 440], sk.leanXf, 1.5, 6, true);
  if (col) parts.push({k: 'collar', pts: col, mat, tone: 'shade', z: Z.outer - 0.5, tension: 0.4});
  // the back vent: a slim shade sliver from the hem up the centre back
  const vent = region(secs, v, 380 - sk.bob, hemY + 2 - sk.bob, (y) => [268, 272 + (1 - (y + sk.bob - hemY) / (380 - hemY)) * 3], sk.leanXf, 1, 6);
  if (vent) parts.push({k: 'vent', pts: vent, mat, tone: 'deep', z: Z.outerDetail, clip: 'coat', tension: 0.2});
  return parts;
}

/** The cream fine knit under the coat: a mock neck, fitted (compact), tucked into the skirt. Visible in the opening. */
export function knit(sk: Skeleton, v: View, mat = 'knit', bottom = 626): Part[] {
  const rows: GRow[] = [
    {y: 866, a: 24, bf: 23, bb: 26, dz: -3},
    {y: 846, a: 26, bf: 25, bb: 28, dz: -6},
    {y: 830, a: 46, bf: 32, bb: 42, dz: -8},
    {y: 810, a: 102, bf: 52, bb: 56, n: 2.1},
    {y: 788, a: 102, bf: 64, bb: 58},
    {y: 758, a: 94, bf: 72, bb: 58},
    {y: 736, a: 92, bf: 74, bb: 58},
    {y: 700, a: 84, bf: 62, bb: 54},
    {y: bottom, a: 77, bf: 52, bb: 51},
  ];
  const secs = garmentSecs(sk, rows);
  return [{k: 'knit', pts: loftOutline(secs, v, sk.leanXf), mat, z: Z.top, tension: 0.45}];
}

/** The bias-cut satin midi slip skirt in the hero teal: clinging at the hip, swinging below the knee (fashion L3/N3);
 *  its sheen band along the hip is the finish detail; its hem is the figure's flowing element. */
export function slipSkirt(sk: Skeleton, v: View, mat = 'skirt', hemY = 168): Part[] {
  const b = sk.b;
  const rows: GRow[] = [
    {y: 642, a: 77, bf: 51, bb: 50},
    {y: 600, a: 85, bf: 53, bb: 60},
    {y: 560, a: 96, bf: 56, bb: 70},
    {y: 516, a: 104, bf: 58, bb: 75},
    {y: 460, a: 104, bf: 60, bb: 74},
    {y: 380, a: 106, bf: 62, bb: 72},
    {y: 300, a: 110, bf: 64, bb: 72},
    {y: 220, a: 116, bf: 68, bb: 74},
    {y: hemY, a: 121, bf: 71, bb: 77},
  ];
  const secs = garmentSecs(sk, rows, {tiltK: tiltHang(b.hipJY), envelope: {below: b.crotchY + 10, ease: 16, back: 4}});
  const out = loftOutline(secs, v, sk.leanXf, {cornerBottom: true});
  const parts: Part[] = [{k: 'skirt', pts: out, mat, z: Z.lower, tension: 0.45}];
  // the satin's sheen: a soft band down the hip on the key side (crisp shape, +14 L*)
  const sh = region(
    secs,
    v,
    560 - sk.bob,
    hemY + 30 - sk.bob,
    (y) => {
      // the band sits where the surface turns toward the key (screen-left): choose the visible phi arc per view
      const ys = y + sk.bob;
      const u = clamp((560 - ys) / (560 - hemY), 0, 1);
      const c = keyPhi(v) + 6 * Math.sin(u * 3);
      const w = 9 - 5 * u;
      return [c - w, c + w];
    },
    sk.leanXf,
    1,
    10,
  );
  if (sh) parts.push({k: 'skirtSheen', pts: sh, mat, tone: 'sheen', z: Z.lower + 0.5, clip: 'skirt', tension: 0.5});
  return parts;
}

/** The phi on a garment's ring that faces the key (screen upper-left) best, for this view. */
export function keyPhi(v: View): number {
  // screen-left is the direction (-1, 0); in world terms the outward normal at phi projects to x = cos(phi)cos(yaw) -
  // sin(phi)sin(yaw); we want it most negative while still facing the camera a little
  let best = 90;
  let bs = Infinity;
  for (let a = 0; a < 360; a += 3) {
    const r = (a * Math.PI) / 180;
    const yr = (v.yaw * Math.PI) / 180;
    const nx = Math.cos(r) * Math.cos(yr) - Math.sin(r) * Math.sin(yr);
    const nd = Math.cos(r) * Math.sin(yr) + Math.sin(r) * Math.cos(yr);
    if (nd < 0.2) continue;
    const s = nx * 0.75 - 0.66 * nd;
    if (s < bs) {
      bs = s;
      best = a;
    }
  }
  return best;
}

// ---------------------------------------------------------------- her B: the cropped cardigan, the tee, straight jeans

/** The cropped boxy cardigan in the hero teal: dropped shoulders, a V neck over the white tee, a ribbed hem band at
 *  the waist (fashion §2.1: slim cardigans; the crop shows the long leg line). */
export function cardigan(sk: Skeleton, v: View, mat = 'cardigan', hemY = 606): Part[] {
  const rows: GRow[] = [
    {y: 858, a: 34, bf: 25, bb: 36, dz: -10},
    {y: 838, a: 56, bf: 36, bb: 46, dz: -8},
    {y: 812, a: 106, bf: 58, bb: 60, n: 2.2},
    {y: 790, a: 112, bf: 72, bb: 64, n: 2.25},
    {y: 760, a: 112, bf: 80, bb: 64, n: 2.25},
    {y: 736, a: 111, bf: 82, bb: 64, n: 2.25},
    {y: 690, a: 108, bf: 76, bb: 62, n: 2.25},
    {y: 640, a: 105, bf: 70, bb: 62, n: 2.25},
    {y: hemY, a: 102, bf: 67, bb: 62, n: 2.25},
  ];
  const secs = garmentSecs(sk, rows);
  const out = loftOutline(secs, v, sk.leanXf, {cornerBottom: true});
  const alpha = pchip([-858, -838, -800, -760, -728, -720], [44, 36, 24, 11, 1.5, 0]);
  const cut = openingCut(sk, secs, v, {alpha: (y) => alpha(-y), y0: 858, y1: 722}, 0);
  const parts: Part[] = [{k: 'cardigan', pts: out, mat, z: Z.outer, cut: cut.length ? [cut] : undefined, tension: 0.45}];
  // the ribbed hem band: a 0.018 H value step
  const band = region(secs, v, hemY + 19 - sk.bob, hemY - sk.bob, () => [0, 359.9], sk.leanXf, 0.8, 3, true);
  if (band) parts.push({k: 'rib', pts: band, mat, tone: 'shade', z: Z.outerDetail, clip: 'cardigan', tension: 0.4});
  // the V's edge band (the placket): a thin step along each front edge
  for (const side of [1, -1]) {
    const pl = region(secs, v, 852 - sk.bob, hemY - sk.bob, (y) => {
      const a = alpha(-(y + sk.bob));
      return side === 1 ? [90 - a - 5.5, 90 - a + 0.5] : [90 + a - 0.5, 90 + a + 5.5];
    }, sk.leanXf, 0.8, 16);
    if (pl) parts.push({k: `placket_${side}`, pts: pl, mat, tone: 'hi', z: Z.outerDetail, clip: 'cardigan', tension: 0.4});
  }
  return parts;
}

/** A plain tee (crew neck) under an open layer: only its neck and front show. */
export function tee(sk: Skeleton, v: View, mat = 'tee', crewY = 842, bottom = 600, big = 1): Part[] {
  const rows: GRow[] = [
    {y: crewY + 4, a: 30 * big, bf: 28, bb: 34, dz: -8},
    {y: crewY - 12, a: 52 * big, bf: 36, bb: 44, dz: -8},
    {y: 810, a: 106 * big, bf: 54, bb: 58, n: 2.1},
    {y: 760, a: 98 * big, bf: 74, bb: 60},
    {y: 700, a: 92 * big, bf: 70, bb: 58},
    {y: bottom, a: 90 * big, bf: 64, bb: 62},
  ];
  const secs = garmentSecs(sk, rows);
  return [{k: 'tee', pts: loftOutline(secs, v, sk.leanXf), mat, z: Z.top, tension: 0.45}];
}

/** Trousers or jeans: the seat (a short loft from the waistband to the crotch) and two leg tubes that hang from the
 *  hips; `cut` sets the leg's radii (thigh, knee, hem): straight (0.10 H hem), wide (0.14 H), relaxed (0.11 H). */
export function trousers(sk: Skeleton, v: View, mat: string, cut: 'straight' | 'wide' | 'relaxed', waistY = 640, o: {hemDrop?: number} = {}): Part[] {
  const b = sk.b;
  const m = b.sex === 'm';
  const seat: GRow[] = [
    {y: waistY + 4, a: b.waistA + 6, bf: b.waistBf + 4, bb: b.waistBb + 3},
    {y: waistY - 40, a: (b.waistA + b.hipA) / 2 + 9, bf: b.waistBf + 7, bb: (b.waistBb + b.hipBb) / 2 + 6},
    {y: b.hipY, a: b.hipA + 7, bf: b.hipBf + 6, bb: b.hipBb + 6},
    {y: b.crotchY - 6, a: b.hipA + 4, bf: b.hipBf + 2, bb: b.hipBb + 2},
  ];
  const secs = garmentSecs(sk, seat);
  const grp = `${mat}Grp`;
  const parts: Part[] = [{k: `${mat}Seat`, pts: loftOutline(secs, v, sk.leanXf, {cornerTop: true}), mat, z: Z.lower, tension: 0.45, grp}];
  // the leg's top at the thigh's centre below the seat (not the hip joint: a wide leg would bulge past the hip)
  const R = cut === 'wide' ? [58, 64, 70] : cut === 'relaxed' ? (m ? [62, 55, 53] : [60, 53, 51]) : m ? [58, 50, 48] : [55, 48, 46];
  for (const s of ['l', 'r'] as Side[]) {
    const H = sk.hip[s];
    const K = sk.knee[s];
    const A = sk.ankle[s];
    const drop = o.hemDrop ?? 20;
    const hang = cut === 'wide' ? 0.55 : cut === 'relaxed' ? 0.3 : 0.15;
    const hem: V3 = [lerp(A[0], K[0], hang * 0.35), A[1] - drop, lerp(A[2], K[2], hang * 0.6) - 4];
    const yTop = b.crotchY + 30 - sk.bob;
    const cxT = sk.cx(yTop);
    const top: V3 = [cxT + (H[0] - cxT) * 0.66, yTop, H[2] * 0.6 + K[2] * 0.08];
    const ru = pchip([0, 0.1, 0.45, 0.6, 1], [R[0] * 1.03, R[0], (R[0] + R[1]) / 2, R[1], R[2]]);
    const pts = tubeOutline([top, K, hem], (u) => ({ru: ru(u), rv: ru(u) * 1.04}), v, [0, 0, 1], {m: 34, capEnd: false});
    const d = proj(K, v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
    parts.push({k: `${mat}Leg_${s}`, pts: crisp2(pts), mat, z: d < 0 ? Z.farLeg + 2 : Z.lower - 1, tension: 0.45, grp});
  }
  return parts;
}
function crisp2(pts: PP[]): PP[] {
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

// ---------------------------------------------------------------- the man: the suede chore jacket

/** A boxy suede chore jacket to the hip, dropped shoulders, worn open over the white tee (fashion N5); its flat collar
 *  and the open front are the finish. */
export function choreJacket(sk: Skeleton, v: View, mat = 'jacket', hemY = 470): Part[] {
  const b = sk.b;
  const rows: GRow[] = [
    {y: 852, a: 40, bf: 32, bb: 42, dz: -10},
    {y: 832, a: 76, bf: 46, bb: 56, dz: -6},
    {y: 806, a: 146, bf: 66, bb: 70, n: 2.35},
    {y: 780, a: 148, bf: 80, bb: 74, n: 2.4},
    {y: 740, a: 142, bf: 82, bb: 72, n: 2.4},
    {y: 680, a: 136, bf: 79, bb: 70, n: 2.4},
    {y: 600, a: 132, bf: 77, bb: 71, n: 2.4},
    {y: 520, a: 133, bf: 77, bb: 75, n: 2.4},
    {y: hemY, a: 135, bf: 79, bb: 77, n: 2.4},
  ];
  const secs = garmentSecs(sk, rows, {tiltK: tiltHang(b.hipJY)});
  const out = loftOutline(secs, v, sk.leanXf, {cornerBottom: true});
  const alpha = pchip([-852, -832, -800, -760, -700, -600, -hemY], [56, 46, 33, 26, 22, 20, 22]);
  const cut = openingCut(sk, secs, v, {alpha: (y) => alpha(-y), y0: 852, y1: hemY});
  const parts: Part[] = [{k: 'jacket', pts: out, mat, z: Z.outer, cut: cut.length ? [cut] : undefined, tension: 0.45}];
  for (const side of [1, -1]) {
    const reg = region(secs, v, 846 - sk.bob, 770 - sk.bob, (y) => {
      const ys = y + sk.bob;
      const a = alpha(-ys);
      const u = clamp((ys - 770) / (846 - 770), 0, 1);
      const w = 22 * Math.pow(u, 0.7) + 1.5;
      return side === 1 ? [90 - a - w, 90 - a + 1.5] : [90 + a - 1.5, 90 + a + w];
    }, sk.leanXf, 2.5, 10);
    if (reg) parts.push({k: `jcollar_${side}`, pts: reg, mat, z: Z.outerDetail, tension: 0.35, gk: 1.15});
  }
  // a chest patch pocket on the near side: a crisp value step (suede: matte, no highlight)
  const kp = keyPhi(v);
  void kp;
  return parts;
}

// ---------------------------------------------------------------- the woman: the oversized shirt, half-tucked

/** The oversized cloud-white button-down, dropped shoulders, sleeves pushed up, the front tucked into the jeans and
 *  the back loose (fashion L1: the half tuck is what gives a double-roomy look its waist). */
export function bigShirt(sk: Skeleton, v: View, mat = 'shirt', waistY = 642): Part[] {
  const b = sk.b;
  const upper: GRow[] = [
    {y: 852, a: 34, bf: 26, bb: 36, dz: -10},
    {y: 834, a: 66, bf: 40, bb: 50, dz: -7},
    {y: 806, a: 136, bf: 62, bb: 64, n: 2.2},
    {y: 780, a: 138, bf: 80, bb: 68, n: 2.2},
    {y: 740, a: 134, bf: 88, bb: 70, n: 2.2},
    {y: 690, a: 128, bf: 84, bb: 72, n: 2.2},
    {y: waistY + 22, a: 118, bf: 76, bb: 74, n: 2.2},
    {y: waistY + 2, a: b.waistA + 12, bf: b.waistBf + 10, bb: b.waistBb + 10, n: 2.1},
  ];
  const secs = garmentSecs(sk, upper);
  const out = loftOutline(secs, v, sk.leanXf, {cornerBottom: false});
  const alpha = pchip([-852, -834, -800, -770], [44, 34, 14, 0]);
  const cut = openingCut(sk, secs, v, {alpha: (y) => alpha(-y), y0: 852, y1: 772}, 0);
  const parts: Part[] = [{k: 'shirt', pts: out, mat, z: Z.outer, cut: cut.length ? [cut] : undefined, tension: 0.45}];
  // the loose back tail: from the waist down to 0.47 H at the back and sides only (behind the jeans in front views)
  const tail: GRow[] = [
    {y: waistY + 8, a: 118, bf: 40, bb: 76, n: 2.2, dz: -10},
    {y: 560, a: 120, bf: 30, bb: 84, n: 2.2, dz: -14},
    {y: 470, a: 122, bf: 26, bb: 86, n: 2.2, dz: -16},
  ];
  const tsecs = garmentSecs(sk, tail, {tiltK: tiltHang(b.hipJY)});
  const tOut = loftOutline(tsecs, v, sk.leanXf, {cornerBottom: true, arc: () => [168, 372]});
  const dT = proj(sk.leanXf([sk.cx(560), 560, -80]), v).d - proj(sk.leanXf([sk.cx(560), 560, 0]), v).d;
  parts.push({k: 'shirtTail', pts: tOut, mat, z: dT > 0 ? Z.outer - 1 : Z.farLeg - 1, tension: 0.45});
  // the collar's two points lying on the chest either side of the open V
  for (const side of [1, -1]) {
    const reg = region(secs, v, 846 - sk.bob, 792 - sk.bob, (y) => {
      const ys = y + sk.bob;
      const a = alpha(-ys);
      const u = clamp((ys - 792) / (846 - 792), 0, 1);
      const w = 26 * Math.pow(u, 0.6) + 2;
      return side === 1 ? [90 - a - w, 90 - a + 1] : [90 + a - 1, 90 + a + w];
    }, sk.leanXf, 2, 8);
    if (reg) parts.push({k: `scollar_${side}`, pts: reg, mat, z: Z.outerDetail, tension: 0.35, gk: 1.2});
  }
  return parts;
}

export {surf};
