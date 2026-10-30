// Editorial people: one person = a build, a hairstyle, an outfit, materials and a face treatment, drawn in any pose and
// view (dir_editorial.md). Returns the parts back to front; Person.tsx paints them.
import {type PP, type SecKey, type V3, type View, add3, lerp, loftOutline, mul3, norm3, proj, sections, sub3, tubeOutline} from './core';
import {type Build, type Pose, type Side, type Skeleton, skeleton} from './body';
import {type HeadRig, faceYaw, headRig, lashLine, lipTone, lostFlick, noseShade, sunglasses} from './head';
import {type HairStyle, hair} from './hair';
import {arm, armZ, hand, leg, shoe, sleeve, type ShoeKind, type SleeveSpec} from './limbs';
import {bigShirt, cardigan, choreJacket, coat, knit, slipSkirt, tee, trousers} from './garments';
import type {Kind} from './color';
import {type Part, Z} from './parts';

export type Mat = {c: string; kind: Kind};
export type OutfitId = 'herEvening' | 'herWeekend' | 'manSuede' | 'womanShirt';
export type FaceSpec = {
  /** The one lash line: open (looking), closed (serene, or looking down), none. */
  lash?: 'open' | 'closed' | 'none';
  /** Oversized sunglasses (outdoors, daylight; about 1 in 3 people). */
  glasses?: boolean;
  /** The 3/4 face's light: a nose shade and a lip tone (only with glasses or a lowered gaze). */
  planes?: boolean;
};
export type Person = {
  name: string;
  build: Build;
  hair: HairStyle;
  outfit: OutfitId;
  mats: Record<string, Mat>;
  face: FaceSpec;
};

const neckPart = (sk: Skeleton, v: View, r: HeadRig): Part => {
  const b = sk.b;
  // from inside the collar up under the jaw, slanting forward ~13 degrees (design_research §11.4)
  const base = add3(sk.neckBase, [0, -16, 2]);
  const top = r.xf([0, b.pivotY + 0.05 * b.skull, 0.03 * b.skull]);
  const mid: V3 = [lerp(base[0], top[0], 0.5), lerp(base[1], top[1], 0.5), lerp(base[2], top[2], 0.5) + 1];
  const pts = tubeOutline([base, mid, top], (u) => ({ru: b.neckR * (1.08 - 0.1 * u), rv: b.neckD * (1.06 - 0.08 * u)}), v, [0, 0, 1], {m: 14});
  return {k: 'neck', pts, mat: 'skin', z: Z.neck, tension: 0.5};
};

/** The ear (short hair only): a small skin shape at the side, t 0.43-0.63, where that side faces the camera. */
const earPart = (sk: Skeleton, v: View, r: HeadRig): Part | null => {
  const fy = faceYaw(r);
  if (Math.abs(fy) < 25 || Math.abs(fy) > 155) return null;
  const s = fy > 0 ? 1 : -1; // the left ear (+X, phi 0) faces the camera when the face looks screen-left
  const h = sk.b.skull;
  const pts: PP[] = [];
  const rows: [number, number][] = [
    [0.43, -0.02],
    [0.47, -0.07],
    [0.55, -0.075],
    [0.62, -0.045],
    [0.645, 0.0],
    [0.6, 0.03],
    [0.5, 0.035],
    [0.44, 0.025],
  ];
  for (const [t, dz] of rows) {
    const w: V3 = [s * (0.345 * h + 4), sk.b.crownY - t * h, dz * h - 0.02 * h];
    const q = proj(r.xf(w), v);
    pts.push([q.x, q.y]);
  }
  return {k: 'ear', pts, mat: 'skin', z: Z.hairDetail + 1, tension: 0.55};
};

function faceParts(p: Person, sk: Skeleton, v: View, r: HeadRig): Part[] {
  const out: Part[] = [];
  const fy = Math.abs(faceYaw(r));
  if (p.face.glasses) {
    const g = sunglasses(r, v);
    g.lenses.forEach((l, i) => out.push({k: `lens${i}`, pts: l, mat: 'lens', tone: 'base', z: Z.hairDetail + 2, tension: 0.45}));
    if (g.bridge) out.push({k: 'bridge', pts: g.bridge, mat: 'lens', tone: 'base', z: Z.hairDetail + 2, tension: 0.4});
    g.arms.forEach((a, i) => out.push({k: `garm${i}`, pts: a, mat: 'lens', tone: 'base', z: Z.hairDetail + 1.5, line: 0.006 * sk.b.skull * 8, tension: 0.4}));
    g.glints.forEach((gl, i) => out.push({k: `glint${i}`, pts: gl, mat: 'lens', tone: 'sheen', z: Z.hairDetail + 2.5, clip: `lens${0}`, tension: 0.4}));
  } else if (p.face.lash !== 'none' && fy > 25 && fy < 150) {
    const l = lashLine(r, v, p.face.lash === 'open', p.face.lash === 'closed' ? 0.006 : 0);
    if (l) out.push({k: 'lash', pts: l, mat: 'hair', tone: 'deep', z: Z.face + 0.5, line: 4.2, tension: 0.5});
  }
  if (p.face.planes && fy < 75) {
    const n = noseShade(r, v);
    if (n) out.push({k: 'noseShade', pts: n, mat: 'skin', tone: 'shade', z: Z.face, clip: 'head', op: 0.85, tension: 0.5});
    const lt = lipTone(r, v);
    if (lt) out.push({k: 'lips', pts: lt, mat: 'lip', tone: 'base', z: Z.face, clip: 'head', op: 0.9, tension: 0.55});
  }
  const lf = lostFlick(r, v);
  if (lf && !p.face.glasses) out.push({k: 'flick', pts: lf, mat: 'hair', tone: 'deep', z: Z.hairDetail + 0.5, line: 3.6, tension: 0.4});
  return out;
}

// ---------------------------------------------------------------- outfits

const sleeves = (sk: Skeleton, v: View, mat: string, spec: SleeveSpec): Part[] => [...sleeve(sk, 'l', v, mat, spec), ...sleeve(sk, 'r', v, mat, spec)];
const hands = (sk: Skeleton, v: View): Part[] => (['l', 'r'] as Side[]).map((s) => hand(sk, s, v, 'skin')).filter((x): x is Part => !!x);
const shoes = (sk: Skeleton, v: View, kind: ShoeKind, mats: {shoe: string; sole?: string}): Part[] => [...shoe(sk, 'l', v, kind, mats), ...shoe(sk, 'r', v, kind, mats)];

function outfit(p: Person, sk: Skeleton, v: View): Part[] {
  const out: Part[] = [];
  switch (p.outfit) {
    case 'herEvening': {
      out.push(leg(sk, 'l', v), leg(sk, 'r', v));
      out.push(...shoes(sk, v, 'pump', {shoe: 'shoe'}));
      out.push(...slipSkirt(sk, v, 'skirt'));
      out.push(...knit(sk, v, 'knit'));
      out.push(...coat(sk, v, 'coat'));
      out.push(...sleeves(sk, v, 'coat', {r: [41, 37, 35], drop: 14}));
      out.push(...hands(sk, v));
      break;
    }
    case 'herWeekend': {
      out.push(...shoes(sk, v, 'sneaker', {shoe: 'sneaker', sole: 'sole'}));
      out.push(...trousers(sk, v, 'jeans', 'straight', 646, {hemDrop: 16}));
      out.push(...tee(sk, v, 'tee', 846, 632));
      out.push(...cardigan(sk, v, 'cardigan'));
      out.push(...sleeves(sk, v, 'cardigan', {r: [37, 33, 25], drop: 12, cuff: 16}));
      out.push(...hands(sk, v));
      out.push(...tote(sk, v));
      break;
    }
    case 'manSuede': {
      out.push(...socks(sk, v));
      out.push(...shoes(sk, v, 'loafer', {shoe: 'shoe', sole: 'soleDark'}));
      out.push(...trousers(sk, v, 'trousers', 'relaxed', 612, {hemDrop: -30}));
      out.push(...tee(sk, v, 'tee', 840, 560, 1.12));
      out.push(...choreJacket(sk, v, 'jacket'));
      out.push(...sleeves(sk, v, 'jacket', {r: [46, 42, 40], drop: 14}));
      out.push(...hands(sk, v));
      out.push(...phone(sk, v));
      break;
    }
    case 'womanShirt': {
      out.push(...shoes(sk, v, 'flat', {shoe: 'flat'}));
      out.push(...trousers(sk, v, 'jeans', 'wide', 644, {hemDrop: 30}));
      out.push(arm(sk, 'l', v), arm(sk, 'r', v));
      out.push(...bigShirt(sk, v, 'shirt', 644));
      out.push(...sleeves(sk, v, 'shirt', {r: [45, 42, 39], drop: 20, end: 0.42, cuff: 22}));
      out.push(...hands(sk, v));
      break;
    }
  }
  return out;
}

/** White crew socks: the flash between the trouser hem and the loafer (fashion N5's one detail). */
function socks(sk: Skeleton, v: View): Part[] {
  return (['l', 'r'] as Side[]).map((s) => {
    const A = sk.ankle[s];
    const pts = tubeOutline([add3(A, [0, 44, 0]), add3(A, [0, -18, 4])], () => ({ru: 23, rv: 25}), v, [0, 0, 1], {m: 6});
    const d = proj(A, v).d - proj(sk.leanXf([sk.cx(sk.b.chestY), sk.b.chestY, 0]), v).d;
    return {k: `sock_${s}`, pts, mat: 'sock', z: d < 0 ? 17.5 : 19.5, tension: 0.5};
  });
}

/** The big soft tote on the shoulder (fashion A6): a soft trapezoid hanging at the hip on the strap side, its strap a
 *  band over the shoulder; the hand holds the strap. */
function tote(sk: Skeleton, v: View): Part[] {
  const b = sk.b;
  const s: Side = sk.pose.armL?.kind === 'strap' ? 'l' : sk.pose.armR?.kind === 'strap' ? 'r' : 'l';
  const ss = s === 'l' ? 1 : -1;
  const top = 600 - sk.bob;
  const bot = 418 - sk.bob;
  const x0 = sk.cx(b.hipY) + ss * (b.hipA + 34);
  const keys: SecKey[] = [
    {y: top, cx: x0, cz: -6, ap: 15, an: 15, bf: 84, bb: 84, n: 3.2},
    {y: lerp(top, bot, 0.5), cx: x0 + ss * 3, cz: -6, ap: 19, an: 19, bf: 90, bb: 90, n: 3.2},
    {y: bot + 12, cx: x0 + ss * 4, cz: -6, ap: 21, an: 21, bf: 92, bb: 92, n: 3.0},
    {y: bot, cx: x0 + ss * 4, cz: -6, ap: 16, an: 16, bf: 86, bb: 86, n: 2.6},
  ];
  const secs = sections(keys, 8);
  const pts = loftOutline(secs, v, sk.leanXf, {cornerTop: true});
  const d = proj([x0, (top + bot) / 2, 0], v).d - proj(sk.leanXf([sk.cx(b.chestY), b.chestY, 0]), v).d;
  const z = d < -30 ? Z.farArm - 1 : armZ(sk, s, v) - 0.5;
  // the strap: from the bag's top front and back corners up over the shoulder (a true line, ~0.008 H)
  const sh = sk.sh[s];
  const strapF: PP[] = [proj([x0, top, 56], v), proj(add3(sh, [ss * 6, 22, 24]), v), proj(add3(sh, [ss * 4, 30, -10]), v), proj([x0, top, -60], v)].map((q) => [q.x, q.y]);
  return [
    {k: 'tote', pts, mat: 'tote', z, tension: 0.4},
    {k: 'strap', pts: strapF, mat: 'tote', tone: 'shade', z: Math.max(z, Z.outer) + 0.6, line: 9, tension: 0.5},
  ];
}

/** A phone in the gripping hand: a dark slim rectangle (its screen edge catching the key). */
function phone(sk: Skeleton, v: View): Part[] {
  const s: Side | null = sk.hand.l === 'grip' ? 'l' : sk.hand.r === 'grip' ? 'r' : null;
  if (!s) return [];
  const ss = s === 'l' ? 1 : -1;
  const W = sk.wrist[s];
  const fore = norm3(sub3(W, sk.elbow[s]));
  const c = add3(W, mul3(fore, 52));
  const up: V3 = norm3([-ss * 0.25, 1, 0.35]);
  const side = norm3([fore[2], 0, -fore[0]]);
  const hh = 66;
  const hw = 32;
  const corners = [
    add3(add3(c, mul3(up, hh)), mul3(side, hw)),
    add3(add3(c, mul3(up, hh)), mul3(side, -hw)),
    add3(add3(c, mul3(up, -hh)), mul3(side, -hw)),
    add3(add3(c, mul3(up, -hh)), mul3(side, hw)),
  ].map((p) => proj(p, v));
  return [{k: 'phone', pts: corners.map((q) => [q.x, q.y] as PP), mat: 'phone', tone: 'base', z: armZ(sk, s, v) + 1.5, tension: 0.12}];
}

// ---------------------------------------------------------------- the person

export type Built = {parts: Part[]; ground: {x: number; w: number}; sk: Skeleton};

export function buildPerson(p: Person, pose: Pose): Built {
  const v: View = {yaw: pose.yaw};
  const sk = skeleton(p.build, pose);
  const r = headRig(p.build, sk, v);
  const parts: Part[] = [];
  parts.push(...outfit(p, sk, v));
  parts.push(neckPart(sk, v, r));
  parts.push({k: 'head', pts: loftOutline(r.secs, v, r.xf), mat: 'skin', z: Z.head, tension: 0.42});
  const hr = hair(p.hair, p.build, sk, r, v, 'hair');
  parts.push(...hr.parts);
  if (p.hair === 'twists') {
    const e = earPart(sk, v, r);
    if (e) parts.push(e);
  }
  parts.push(...faceParts(p, sk, v, r));
  parts.sort((a, b) => a.z - b.z);
  const al = proj(sk.ankle.l, v);
  const ar = proj(sk.ankle.r, v);
  return {parts, ground: {x: (al.x + ar.x) / 2, w: Math.max(150, Math.abs(al.x - ar.x) + 170)}, sk};
}
