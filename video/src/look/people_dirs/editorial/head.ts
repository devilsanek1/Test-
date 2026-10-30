// Editorial people: the head (dir_editorial.md §3, the face). A lofted skull whose front profile follows
// design_research.md §11.4 (brow, a straight nose turned up a little, lips just behind the E-line, a chin 0.03 h behind
// the face front, a jaw rising ~25 degrees to its angle), so a profile's silhouette IS the face; turned toward or away
// from the camera it becomes the lost profile or the 3/4 face by the same geometry. Faces are never features on a blank
// oval: the profile line, one lash line, the lost profile's cheek, sunglasses, a nose shade, a lip tone.
import {type PP, type Sec, type SecKey, type V2, type V3, type View, add3, clamp, lerp, pitchAbout, proj, rollAbout, sections, sub3, surf, yawAbout} from './core';
import type {Build, Skeleton} from './body';

type Row = [number, number, number, number, number?];
// t (0 crown .. 1 chin), Z front, Z back, half-width a, front bump (nose, lips); all in skull heights h
const HEAD_F: Row[] = [
  [0.0, -0.02, -0.05, 0.02],
  [0.03, 0.13, -0.23, 0.165],
  [0.08, 0.25, -0.33, 0.26],
  [0.15, 0.33, -0.385, 0.305],
  [0.25, 0.385, -0.415, 0.332],
  [0.35, 0.41, -0.425, 0.34],
  [0.42, 0.43, -0.42, 0.338],
  [0.46, 0.418, -0.41, 0.334, 0.004],
  [0.52, 0.414, -0.4, 0.33, 0.026],
  [0.6, 0.41, -0.375, 0.324, 0.056],
  [0.68, 0.404, -0.335, 0.312, 0.094],
  [0.725, 0.4, -0.29, 0.298, 0.028],
  [0.785, 0.396, -0.215, 0.272, 0.026],
  [0.83, 0.386, -0.18, 0.246, 0.008],
  [0.87, 0.381, -0.152, 0.216, 0.021],
  [0.91, 0.394, -0.12, 0.18, 0.0],
  [0.955, 0.372, -0.045, 0.122, 0.0],
  [1.0, 0.27, 0.13, 0.035, 0.0],
];
const HEAD_M: Row[] = [
  [0.0, -0.02, -0.05, 0.02],
  [0.03, 0.13, -0.23, 0.17],
  [0.08, 0.25, -0.33, 0.27],
  [0.15, 0.335, -0.39, 0.315],
  [0.25, 0.39, -0.42, 0.345],
  [0.35, 0.415, -0.43, 0.352],
  [0.42, 0.445, -0.425, 0.35],
  [0.46, 0.425, -0.415, 0.346, 0.006],
  [0.52, 0.42, -0.405, 0.342, 0.03],
  [0.6, 0.415, -0.38, 0.336, 0.066],
  [0.68, 0.41, -0.34, 0.326, 0.108],
  [0.725, 0.405, -0.3, 0.315, 0.03],
  [0.785, 0.4, -0.225, 0.296, 0.017],
  [0.83, 0.392, -0.195, 0.275, 0.006],
  [0.87, 0.388, -0.165, 0.25, 0.014],
  [0.91, 0.402, -0.13, 0.222, 0.0],
  [0.955, 0.39, -0.05, 0.172, 0.0],
  [1.0, 0.3, 0.12, 0.07, 0.0],
];

/** The skull's key sections in world units at the neutral head (pivot at X 0, Z -2). */
export function headKeys(b: Build): SecKey[] {
  const h = b.skull;
  const rows = b.sex === 'm' ? HEAD_M : HEAD_F;
  return rows.map(([t, zf, zb, a, bump]) => ({
    y: b.crownY - t * h,
    cx: 0,
    cz: ((zf + zb) / 2) * h,
    ap: a * h,
    an: a * h,
    bf: ((zf - zb) / 2) * h,
    bb: ((zf - zb) / 2) * h,
    n: t > 0.7 ? 2.15 : 2.0,
    bump: [(bump ?? 0) * h, t > 0.75 ? 34 : 15],
  }));
}

export type HeadRig = {
  secs: Sec[];
  /** Neutral head space -> world (the nod, turn and roll about the pivot, then the body's lean, then the pivot's move). */
  xf: (p: V3) => V3;
  /** The head's effective yaw on screen (the view yaw plus the head's turn). */
  yaw: number;
  /** y of a head fraction t (neutral space). */
  yAt: (t: number) => number;
  h: number;
};

export function headRig(b: Build, sk: Skeleton, v: View): HeadRig {
  const P0: V3 = [0, b.pivotY, -2];
  const hp = sk.pose.head ?? {};
  const turn = hp.turn ?? 0;
  const nod = hp.nod ?? 0;
  const roll = hp.roll ?? 0;
  const lean = sk.pose.lean ?? (sk.pose.walk !== undefined ? 2.5 : 0);
  const dP = sub3(sk.pivot, sk.leanXf(P0));
  const xf = (p: V3): V3 => {
    let q = rollAbout(p, P0, roll);
    q = pitchAbout(q, P0, nod - lean * 0.6);
    q = yawAbout(q, P0, -turn);
    q = sk.leanXf(q);
    return add3(q, dP);
  };
  return {secs: sections(headKeys(b), 4), xf, yaw: v.yaw + turn, yAt: (t) => b.crownY - t * b.skull, h: b.skull};
}

/** The screen point of a face point (t down the skull, phi around it), pushed out from the skin by `push`. */
export function facePt(r: HeadRig, v: View, t: number, phi: number, push = 0): {p: V2; vis: boolean; d: number} {
  const s = surf(r.secs, r.yAt(t), phi, v, r.xf, push);
  return {p: s.p, vis: s.vis, d: s.d};
}

/** Where the face looks, relative to the camera: 0 = straight at it, 90 = a profile facing screen-left, -90 facing
 *  right, 180 = the back of the head. */
export const faceYaw = (r: HeadRig) => ((((r.yaw + 180) % 360) + 360) % 360) - 180;

/** The near eye's side for the profile features: +1 = the figure's left eye (phi < 90) is toward the camera. */
const nearSide = (r: HeadRig) => (faceYaw(r) >= 0 ? 1 : -1);

/** The one lash line (design_research §11.4): at t 0.5, from just behind the face front back ~0.09 h; closed = an arc
 *  bowed down with the outer end flicking up and back; open = straighter. An OPEN path (a true line). */
export function lashLine(r: HeadRig, v: View, open = false, lower = 0): PP[] | null {
  const fy = Math.abs(faceYaw(r));
  if (fy < 25 || fy > 160) return null;
  const s = nearSide(r);
  const pts: PP[] = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    // inner corner near the nose (phi 90 -/+ 22) to the outer corner (90 -/+ 50)
    const phi = 90 - s * lerp(23, 49, u);
    const bow = open ? 0.004 * Math.sin(Math.PI * u) : 0.016 * Math.sin(Math.PI * u) - 0.012 * Math.max(0, u - 0.82) / 0.18;
    const t = 0.505 + lower + bow;
    const q = facePt(r, v, t, phi, 0.6);
    if (!q.vis && fy < 120) continue;
    pts.push(q.p);
  }
  return pts.length >= 3 ? pts : null;
}

/** A region on the head's surface (t0..t1 rows, a phi interval per row) as a closed outline (front-facing part only
 *  when `visOnly`). Used for the sunglasses' lenses, the nose shade, the lip tone, the hair's sheen. */
export function headRegion(r: HeadRig, v: View, t0: number, t1: number, phiAt: (t: number) => [number, number], push = 0, rows = 8, visOnly = true): PP[] | null {
  const left: PP[] = [];
  const right: PP[] = [];
  for (let i = 0; i <= rows; i++) {
    const t = lerp(t0, t1, i / rows);
    const [a0, a1] = phiAt(t);
    const seg: {p: V2; vis: boolean}[] = [];
    const m = 10;
    for (let j = 0; j <= m; j++) seg.push(facePt(r, v, t, lerp(a0, a1, j / m), push));
    const vis = visOnly ? seg.filter((q) => q.vis) : seg;
    if (vis.length < 2) continue;
    // the extremes along screen x of the visible part of this row
    let li = 0;
    let ri = 0;
    vis.forEach((q, k) => {
      if (q.p[0] < vis[li].p[0]) li = k;
      if (q.p[0] > vis[ri].p[0]) ri = k;
    });
    left.push(vis[li].p);
    right.push(vis[ri].p);
  }
  if (left.length < 2) return null;
  return [...left, ...right.reverse()];
}

/** Oversized sunglasses (design_research §11.6; fashion A1): two lenses on the brow line to the cheekbone, the bridge,
 *  the near temple arm as a line to the ear. Returns lens outlines (closed), the bridge (closed), arms (open lines), and
 *  one reflection streak on the key-side lens. */
export function sunglasses(r: HeadRig, v: View): {lenses: PP[][]; bridge: PP[] | null; arms: PP[][]; glints: PP[][]} {
  const fy = faceYaw(r);
  const lenses: PP[][] = [];
  const glints: PP[][] = [];
  const t0 = 0.385;
  const t1 = 0.612;
  for (const side of [1, -1]) {
    // a soft-cornered oversize square: phi from the bridge (8) to past the eye's outer corner (52)
    const reg = headRegion(
      r,
      v,
      t0,
      t1,
      (t) => {
        const u = (t - t0) / (t1 - t0);
        const e = Math.abs(2 * u - 1);
        const inner = 6 + 8 * e ** 3 + (u > 0.55 ? 10 * (u - 0.55) : 0);
        const outer = 57 - 12 * e ** 3 - (u > 0.6 ? 10 * (u - 0.6) : 0);
        return side === 1 ? [90 - outer, 90 - inner] : [90 + inner, 90 + outer];
      },
      0.055 * r.h,
      7,
    );
    if (reg) {
      lenses.push(reg);
      // the glint: a short diagonal streak on the key-side (screen-left) lens
    }
  }
  // the key-side lens = the one whose centre is further left on screen
  const cx = (q: PP[]) => q.reduce((s, p) => s + p[0], 0) / q.length;
  if (lenses.length) {
    const L = lenses.reduce((a, b) => (cx(a) < cx(b) ? a : b));
    const xs = L.map((p) => p[0]);
    const ys = L.map((p) => p[1]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const w = x1 - x0;
    const h = y1 - y0;
    if (w > 4) glints.push([[x0 + w * 0.22, y0 + h * 0.62], [x0 + w * 0.48, y0 + h * 0.18], [x0 + w * 0.6, y0 + h * 0.22], [x0 + w * 0.34, y0 + h * 0.7]]);
  }
  const bridge = Math.abs(fy) < 80 ? headRegion(r, v, 0.43, 0.47, () => [82, 98], 0.06 * r.h, 2) : null;
  const arms: PP[][] = [];
  const s = fy >= 0 ? 1 : -1;
  if (Math.abs(fy) > 20 && Math.abs(fy) < 160) {
    const a: PP[] = [];
    for (const phi of [90 - s * 52, 90 - s * 62, 90 - s * 75, 90 - s * 86]) a.push(facePt(r, v, 0.44, phi, 0.04 * r.h).p);
    arms.push(a);
  }
  return {lenses, bridge, arms, glints};
}

/** The 3/4 face's nose shade (on the side away from the key) and lip tone: the face made of light, used only with
 *  sunglasses or a lowered gaze (dir_editorial.md §3). */
export function noseShade(r: HeadRig, v: View): PP[] | null {
  const fy = faceYaw(r);
  if (Math.abs(fy) < 12 || Math.abs(fy) > 70) return null;
  // the side of the nose away from the key: the key is screen-left, so the shade is on the nose's screen-right side
  const s = fy > 0 ? -1 : 1;
  return headRegion(r, v, 0.47, 0.71, (t) => {
    const u = (t - 0.47) / 0.24;
    const w = 6 + 10 * u;
    return s === -1 ? [90 + 1, 90 + w] : [90 - w, 90 - 1];
  }, 0.4, 7);
}
export function lipTone(r: HeadRig, v: View): PP[] | null {
  const fy = Math.abs(faceYaw(r));
  if (fy > 75) return null;
  return headRegion(r, v, 0.775, 0.875, (t) => {
    const u = (t - 0.775) / 0.1;
    const w = 15 + 4 * Math.sin(Math.PI * u) - (u > 0.45 && u < 0.55 ? 1 : 0);
    return [90 - w, 90 + w];
  }, 0.3, 6);
}
/** The lost profile's lash flick: from behind (the face turned 110-150 degrees away) a 1-px flick past the cheek. */
export function lostFlick(r: HeadRig, v: View): PP[] | null {
  const fy = Math.abs(faceYaw(r));
  if (fy < 105 || fy > 150) return null;
  const s = faceYaw(r) >= 0 ? 1 : -1;
  const a = facePt(r, v, 0.5, 90 - s * 30, 0.5);
  const b = facePt(r, v, 0.49, 90 - s * 12, 1.6);
  return [a.p, b.p];
}

export {clamp, proj, lerp};
