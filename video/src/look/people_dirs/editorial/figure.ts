// Editorial people: one person = a build, a hairstyle, an outfit, materials and a face treatment, drawn in any pose and
// view (dir_editorial.md). Returns the parts back to front; Person.tsx paints them.
import {type PP, type SecKey, type V2, type V3, type View, add3, lerp, lerp3, loftOutline, mul3, norm3, proj, sections, sub3, tubeOutline} from './core';
import {type Build, type Pose, type Side, type Skeleton, skeleton} from './body';
import {type HeadRig, faceYaw, headRig, lashLine, lipTone, lostFlick, noseShade, sunglasses} from './head';
import {type HairStyle, hair} from './hair';
import {arm, armZ, foot, forearm, hand, leg, shoe, sleeve, type ShoeKind, type SleeveSpec} from './limbs';
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

const neckChain = (sk: Skeleton, r: HeadRig): V3[] => {
  const b = sk.b;
  // from inside the collar up under the jaw, slanting forward ~13 degrees (design_research §11.4): the throat meets the
  // jaw ~0.3 h behind the chin, the nape leaves the skull's base far back
  const base = add3(sk.neckBase, [0, -16, -2]);
  const top = r.xf([0, b.pivotY + 0.08 * b.skull, -0.1 * b.skull]);
  const mid: V3 = [lerp(base[0], top[0], 0.5), lerp(base[1], top[1], 0.5), lerp(base[2], top[2], 0.5) + 2];
  return [base, mid, top];
};
const neckR = (b: Skeleton['b']) => (u: number) => ({ru: b.neckR * (1.1 - 0.12 * u), rv: b.neckD * (1.08 - 0.06 * u)});
/** The neck, under the tops: a crew or mock neckline covers its base, an open collar shows the chest under it. */
const neckPart = (sk: Skeleton, v: View, r: HeadRig): Part => {
  const pts = tubeOutline(neckChain(sk, r), neckR(sk.b), v, [0, 0, 1], {m: 14});
  return {k: 'neck', pts, mat: 'skin', z: Z.neck, tension: 0.5};
};
/** The neck above the front neckline, drawn over the outer layers when we see the front or the side: a coat's or a
 *  jacket's back collar stands BEHIND the neck there (from behind, the collar covers the nape instead). */
const neckTopPart = (sk: Skeleton, v: View, r: HeadRig): Part | null => {
  if (Math.cos((v.yaw * Math.PI) / 180) < -0.2) return null;
  const [base, mid, top] = neckChain(sk, r);
  const k = 0.32;
  const from: V3 = [lerp(base[0], top[0], k), lerp(base[1], top[1], k), lerp(base[2], top[2], k)];
  const rr = neckR(sk.b);
  const pts = tubeOutline([from, mid[1] > from[1] ? mid : from, top].filter((p, i, a) => i === 0 || p !== a[i - 1]), (u) => rr(k + (1 - k) * u), v, [0, 0, 1], {m: 10, capStart: false});
  return {k: 'neckTop', pts, mat: 'skin', z: Z.outer + 1, tension: 0.5, grp: 'neckG'};
};

/** The head's cast shadow on the neck: the head's outline shifted away from the key, clipped to the neck (a crisp shape
 *  under the jaw: the classic editorial device that turns a neck from a pipe into a form). */
const jawShadow = (head: PP[], key: V2, h: number, onTop: boolean): Part => {
  const dx = -key[0] * 0.05 * h;
  const dy = 0.13 * h;
  return {k: 'jawShadow', pts: head.map((p) => [p[0] + dx, p[1] + dy] as PP), mat: 'skin', tone: 'shade', z: onTop ? Z.outer + 1.5 : Z.neck + 0.5, clip: onTop ? 'neckTop' : 'neck', tension: 0.42};
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

/** The face budget by the head's size on screen (design_research §11.3; the skull's height in px):
 *   < 12 px   nothing but the facing (where skin meets hair); sunglasses from ~11 px
 *   12-18     ONE of: the profile line (the geometry), sunglasses, the lost profile's cheek
 *   18-40     + at most one mark: a lash (profile, lost profile), or in a 3/4 front face the nose shade
 *   >= 40     close shots: both lashes on a 3/4 front face, the T-shade, a lip tone, the lost profile's flick */
function faceParts(p: Person, sk: Skeleton, v: View, r: HeadRig, key: V2, skullPx: number): Part[] {
  const out: Part[] = [];
  const fy = Math.abs(faceYaw(r));
  const close = skullPx >= 40;
  const mark = skullPx >= 18;
  if (p.face.glasses) {
    if (skullPx < 11) return out;
    const g = sunglasses(r, v);
    g.lenses.forEach((l, i) => out.push({k: `lens${i}`, pts: l, mat: 'lens', tone: 'base', z: Z.hairDetail + 2, tension: 0.45}));
    if (g.bridge) out.push({k: 'bridge', pts: g.bridge, mat: 'lens', tone: 'base', z: Z.hairDetail + 2, tension: 0.4});
    if (mark) g.arms.forEach((a, i) => out.push({k: `garm${i}`, pts: a, mat: 'lens', tone: 'base', z: Z.hairDetail + 1.5, line: 0.006 * sk.b.skull * 8, tension: 0.4}));
    if (mark) g.glints.forEach((gl, i) => out.push({k: `glint${i}`, pts: gl, mat: 'lens', tone: 'sheen', z: Z.hairDetail + 2.5, clip: `lens${0}`, tension: 0.4}));
    return out;
  }
  const frontal = fy < 62;
  if (mark && p.face.lash !== 'none' && fy < 150 && (!frontal || close)) {
    // the one mark: a lash line (open = looking, closed = serene or looking down); a 3/4 front face shows both eyes'
    // lashes (the far one foreshortened), never one eye, so it gets lashes only when close
    const open = p.face.lash === 'open';
    const lower = p.face.lash === 'closed' ? 0.006 : 0;
    const l = lashLine(r, v, open, lower);
    if (l) out.push({k: 'lash', pts: l, mat: 'hair', tone: 'deep', z: Z.face + 0.5, line: 4.2, tension: 0.5});
    const l2 = frontal ? lashLine(r, v, open, lower, true) : null;
    if (l2) out.push({k: 'lash2', pts: l2, mat: 'hair', tone: 'deep', z: Z.face + 0.5, line: 3.6, tension: 0.5});
  }
  if (mark && frontal && (p.face.planes || !close)) {
    const n = noseShade(r, v, key[0]);
    if (n) out.push({k: 'noseShade', pts: n, mat: 'skin', tone: 'shade', z: Z.face, clip: 'head', op: 0.6, tension: 0.5});
  }
  if (close && p.face.planes) {
    const lt = lipTone(r, v);
    if (lt) out.push({k: 'lips', pts: lt, mat: 'lip', tone: 'base', z: Z.face, clip: 'head', op: 0.55, tension: 0.6});
  }
  const lf = mark ? lostFlick(r, v) : null;
  if (lf) out.push({k: 'flick', pts: lf, mat: 'hair', tone: 'deep', z: Z.hairDetail + 0.5, line: 3.2, tension: 0.4});
  return out;
}

// ---------------------------------------------------------------- outfits

const sleeves = (sk: Skeleton, v: View, mat: string, spec: SleeveSpec): Part[] => [...sleeve(sk, 'l', v, mat, spec), ...sleeve(sk, 'r', v, mat, spec)];
const hands = (sk: Skeleton, v: View): Part[] => (['l', 'r'] as Side[]).map((s) => hand(sk, s, v, 'skin')).filter((x): x is Part => !!x);
const shoes = (sk: Skeleton, v: View, kind: ShoeKind, mats: {shoe: string; sole?: string; stripe?: string}): Part[] => [...shoe(sk, 'l', v, kind, mats), ...shoe(sk, 'r', v, kind, mats)];
const feet = (sk: Skeleton, v: View): Part[] => [foot(sk, 'l', v), foot(sk, 'r', v)];

function outfit(p: Person, sk: Skeleton, v: View): Part[] {
  const out: Part[] = [];
  switch (p.outfit) {
    case 'herEvening': {
      out.push(leg(sk, 'l', v), leg(sk, 'r', v), ...feet(sk, v));
      out.push(...shoes(sk, v, 'pump', {shoe: 'shoe'}));
      out.push(...slipSkirt(sk, v, 'skirt'));
      out.push(...knit(sk, v, 'knit'));
      out.push(...coat(sk, v, 'coat'));
      out.push(...sleeves(sk, v, 'coat', {r: [34, 31, 29], drop: 8}));
      out.push(...hands(sk, v));
      break;
    }
    case 'herWeekend': {
      out.push(...shoes(sk, v, 'sneaker', {shoe: 'sneaker', sole: 'sole', stripe: 'stripe'}));
      out.push(...trousers(sk, v, 'jeans', 'straight', 646, {hemDrop: 16}));
      out.push(...tee(sk, v, 'tee', 846, 632));
      out.push(...cardigan(sk, v, 'cardigan'));
      out.push(...sleeves(sk, v, 'cardigan', {r: [29, 25, 19], drop: 6, cuff: 16}));
      out.push(...hands(sk, v));
      out.push(...tote(sk, v));
      break;
    }
    case 'manSuede': {
      out.push(...socks(sk, v));
      out.push(...shoes(sk, v, 'loafer', {shoe: 'shoe', sole: 'soleDark'}));
      out.push(...trousers(sk, v, 'trousers', 'relaxed', 612, {hemDrop: -16}));
      out.push(...tee(sk, v, 'tee', 840, 560, 1.12));
      out.push(...choreJacket(sk, v, 'jacket'));
      out.push(...sleeves(sk, v, 'jacket', {r: [38, 35, 33], drop: 10}));
      out.push(...hands(sk, v));
      out.push(...phone(sk, v));
      break;
    }
    case 'womanShirt': {
      out.push(...feet(sk, v));
      out.push(...shoes(sk, v, 'flat', {shoe: 'flat'}));
      out.push(...trousers(sk, v, 'jeans', 'wide', 644, {hemDrop: 30}));
      out.push(forearm(sk, 'l', v), forearm(sk, 'r', v));
      out.push(...bigShirt(sk, v, 'shirt', 644));
      out.push(...sleeves(sk, v, 'shirt', {r: [35, 32, 29], drop: 12, end: 0.42, cuff: 20}));
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
  // over the shoulder's front, its top and its back (dense, low tension: the strap lies ON the shoulder, no loop)
  const strapF: PP[] = [
    proj([x0, top, 56], v),
    proj(lerp3([x0, top, 56], add3(sh, [ss * 2, 6, 30]), 0.55), v),
    proj(add3(sh, [ss * 2, 6, 30]), v),
    proj(add3(sh, [ss * 4, 24, 8]), v),
    proj(add3(sh, [ss * 3, 14, -24]), v),
    proj(lerp3([x0, top, -60], add3(sh, [ss * 3, 14, -24]), 0.55), v),
    proj([x0, top, -60], v),
  ].map((q) => [q.x, q.y]);
  return [
    {k: 'tote', pts, mat: 'tote', z, tension: 0.4},
    {k: 'strap', pts: strapF, mat: 'tote', tone: 'shade', z: Math.max(z, Z.outer) + 0.6, line: 7.5, tension: 0.3},
  ];
}

/** A phone in the gripping hand: a dark slim rectangle (its screen edge catching the key). */
function phone(sk: Skeleton, v: View): Part[] {
  const s: Side | null = sk.hand.l === 'grip' ? 'l' : sk.hand.r === 'grip' ? 'r' : null;
  if (!s) return [];
  const W = sk.wrist[s];
  const fore = norm3(sub3(W, sk.elbow[s]));
  const c = add3(W, mul3(fore, 52));
  // the screen faces the eyes: its normal from the phone toward the face
  const eye: V3 = add3(sk.pivot, [0, 40, 60]);
  const nrm = norm3(sub3(eye, c));
  const upW: V3 = [0, 1, 0];
  const side = norm3([nrm[1] * upW[2] - nrm[2] * upW[1], nrm[2] * upW[0] - nrm[0] * upW[2], nrm[0] * upW[1] - nrm[1] * upW[0]]);
  const up = norm3([side[1] * nrm[2] - side[2] * nrm[1], side[2] * nrm[0] - side[0] * nrm[2], side[0] * nrm[1] - side[1] * nrm[0]]);
  const hh = 44;
  const hw = 20.5;
  const back = mul3(nrm, -6);
  const corners = [
    add3(add3(add3(c, mul3(up, hh)), mul3(side, hw)), back),
    add3(add3(add3(c, mul3(up, hh)), mul3(side, -hw)), back),
    add3(add3(add3(c, mul3(up, -hh)), mul3(side, -hw)), back),
    add3(add3(add3(c, mul3(up, -hh)), mul3(side, hw)), back),
  ].map((p) => proj(p, v));
  return [{k: 'phone', pts: corners.map((q) => [q.x, q.y] as PP), mat: 'phone', tone: 'base', z: armZ(sk, s, v) + 1.5, tension: 0.08}];
}

// ---------------------------------------------------------------- the person

export type Built = {parts: Part[]; ground: {x: number; w: number}; sk: Skeleton};

/** `px` = the figure's height on screen (crown to sole): the face's detail follows it (faceParts). */
export function buildPerson(p: Person, pose: Pose, flip = false, px = 640): Built {
  const v: View = {yaw: pose.yaw};
  const key: V2 = [flip ? 0.82 : -0.82, -0.57];
  const sk = skeleton(p.build, pose);
  const r = headRig(p.build, sk, v);
  const parts: Part[] = [];
  parts.push(...outfit(p, sk, v));
  const neck = neckPart(sk, v, r);
  neck.grp = 'neckG';
  parts.push(neck);
  const neckTop = neckTopPart(sk, v, r);
  if (neckTop) parts.push(neckTop);
  const headPts = loftOutline(r.secs, v, r.xf);
  parts.push({k: 'head', pts: headPts, mat: 'skin', z: Z.head, tension: 0.42});
  parts.push(jawShadow(headPts, key, p.build.skull, !!neckTop));
  const hr = hair(p.hair, p.build, sk, r, v, 'hair', neck.pts, {key});
  parts.push(...hr.parts);
  if (p.hair === 'twists' || p.hair === 'pony') {
    const e = earPart(sk, v, r);
    if (e) parts.push(e);
  }
  parts.push(...faceParts(p, sk, v, r, key, (px * p.build.skull) / 1000));
  parts.sort((a, b) => a.z - b.z);
  const al = proj(sk.ankle.l, v);
  const ar = proj(sk.ankle.r, v);
  return {parts, ground: {x: (al.x + ar.x) / 2, w: Math.max(150, Math.abs(al.x - ar.x) + 170)}, sk};
}
