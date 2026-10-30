// PEOPLE v4, BODIES (docs/look/people_design/bodies_v4/NOTES.md): the assembled person on the NEW body. The same
// character as asm_people.ts person5 (the v4 hair on the v4 head, joined by one light), on people_v4/body5.ts: a pose
// from skel5.ts (weight, gesture, sitting, leaning), authored hands, and the clothes of fashion.md. What the light adds
// here (EVALUATION.md 3 and 6):
//   casts   the hair's soft shadow on the skin (as person5); the head's on the neck; and now the body's own: the near
//           arm's soft shadow on the torso, the open coat's on the column inside ("inside an open coat"), the top's
//           on the trousers at the hem, the hair's on the coat's back: one group per part, shifted away from the key
//   rim     the light's band on the shoulders' top edges (the top, the coat's panels, the sleeves)
//   contact a soft shadow where the figure meets the ground, the ledge or the rail
// Every figure faces screen-left (the key is upper left), as in person5. The heads and the hair are untouched.
import type {V2} from './bez';
import {hair, earsOf} from './hair';
import {CUTS4} from './cuts';
import type {MotionState} from './sim';
import type {View} from './cut';
import {fromV4, fromH4, type P5, type Role} from './asm_render';
import {fitCut} from './asm_fit';
import {hfOf, viewsOf, CAST5, LOOK, type Who5} from './asm_people';
import {body5, type Outfit5} from '../people_v4/body5';
import {skel5, walk5, type Pose5} from '../people_v4/skel5';
import {head, placeHead, type Eyes} from '../people_v4/head';
import type {FaceView} from '../people_v4/faces';
import {headFrame, type HeadFrame} from '../graphic_faces/head';
import {cam, proj} from '../graphic/rig';
import {mixLab, shiftL, tone} from '../graphic/color';
import {WARDROBE as W} from '../hair_v2/people';

// ---------------------------------------------------------------- the cast in their clothes (fashion.md §4)
export type Who6 = Who5 & {fit: Outfit5};
const ink = tone('#2A2124', {k: 0.7});
const coatBlack = tone('#3A2E33', {k: 0.66});
const coatFacing = tone('#4C3D43', {k: 0.7});
const cloud = tone('#F0EAE1', {k: 0.84});
const cream = tone('#E9DBCA', {k: 0.82});
const sneaker = tone('#EFE7DB', {k: 0.86});
const boot = tone('#4A3530', {k: 0.72});
const caramel = tone('#B58058', {k: 0.78});
const caramelFacing = tone('#9C6A48', {k: 0.78});
const navy = tone('#2B3F5C', {k: 0.76, toward: 290, maxTurn: 6});
const denimMid = tone('#6A8DAA', {k: 0.8, toward: 280, maxTurn: 6});
const indigo = tone('#33496B', {k: 0.76, toward: 290, maxTurn: 6});
const darkDenim = tone('#2C3B57', {k: 0.76, toward: 290, maxTurn: 6});
const pinkFlat = tone('#E2A9A2', {k: 0.84});
export const CAST6: Record<string, Who6> = {
  // N1, the long open coat: the warm near-black coat over the light column (a cloud knit tucked into cream wide
  // trousers), dark pointed flats: her direction-C colours, now with fit and fall
  her: {...CAST5.her, label: 'her: the long open coat', fit: {outer: {kind: 'coat', tone: coatBlack, facing: coatFacing}, top: {kind: 'knit', tone: cloud, tuck: 'full', sleeve: 'long'}, bottom: {kind: 'wide', tone: cream}, shoe: {kind: 'flat', tone: ink}}},
  // the knit and jeans: a chocolate fine knit (rib bands) over straight indigo jeans, slim sneakers with a stripe
  W1: {...CAST5.W1, label: 'the knit and straight jeans', fit: {top: {kind: 'knit', tone: W.chocolate, tuck: 'none', sleeve: 'long'}, bottom: {kind: 'jeans', tone: indigo}, shoe: {kind: 'sneaker', tone: sneaker, stripe: '#664334'}}},
  // L1, the big shirt: cloud, tucked into the high waist and bloused over it, the sleeves pushed up, washed wide jeans,
  // baby-pink flats
  W6: {...CAST5.W6, label: 'the big shirt, tucked', fit: {top: {kind: 'shirt', tone: cloud, tuck: 'full', sleeve: 'pushed'}, bottom: {kind: 'wide', tone: denimMid}, shoe: {kind: 'flat', tone: pinkFlat}}},
  // L2-like: a fitted burgundy tee tucked into butter wide trousers, slim sneakers
  W4: {...CAST5.W4, label: 'the tee and wide trousers', fit: {top: {kind: 'tee', tone: W.burgundy, tuck: 'full', sleeve: 'short'}, bottom: {kind: 'wide', tone: W.butter}, shoe: {kind: 'sneaker', tone: sneaker, stripe: '#743137'}}},
  // N5, suede and boots: the caramel suede jacket open over a cream tee, navy straight trousers, Chelsea boots
  M1: {...CAST5.M1, label: 'the suede jacket and boots', fit: {outer: {kind: 'jacket', tone: caramel, facing: caramelFacing}, top: {kind: 'tee', tone: cream, tuck: 'none', sleeve: 'short'}, bottom: {kind: 'straight', tone: navy}, shoe: {kind: 'boot', tone: boot}}},
  // the knit and dark jeans: a sage crew knit, dark straight jeans, slim sneakers
  M2: {...CAST5.M2, label: 'the knit and dark jeans', fit: {top: {kind: 'knit', tone: W.sage, tuck: 'none', sleeve: 'long'}, bottom: {kind: 'jeans', tone: darkDenim}, shoe: {kind: 'sneaker', tone: sneaker, stripe: '#2F4566'}}},
};
export const CAST6_ORDER = ['her', 'W1', 'W6', 'W4', 'M1', 'M2'];

// ---------------------------------------------------------------- the light
const KEY: V2 = [0.42, 0.91];
const SKIN_PARTS = /^(head|neck|ear)$/;
const BODY_SKIN = /^(arm-|hand-|shin-|collarV)/;
const RIMMED = /^(top|sleeve-|outer-)/;

export type Opts6 = {
  pose: Pose5;
  /** the camera's yaw on the body (0 faces us, -90 the profile facing screen-left, 180 the back) */
  yaw: number;
  /** the drawn height in px of a standing figure (crown to sole): the detail ladder */
  px: number;
  eyes?: Eyes;
  brow?: boolean;
  motion?: MotionState;
  /** the whole figure moved (a walk's travel), figure units */
  bob?: V2;
  breeze?: V2;
  cast?: boolean;
  rim?: boolean;
  ground?: boolean;
  /** the contact shadow's colour and strength, and the surface's height (body units, y up) */
  contact?: {color: string; opacity: number};
};
export type Built6 = {parts: P5[]; hf: HeadFrame; head: V2; face: FaceView; hairView: View};

const shiftD = (d: string, dx: number, dy: number): string => {
  if (!dx && !dy) return d;
  let i = 0;
  return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => {
    const v = parseFloat(m) + (i % 2 === 0 ? dx : dy);
    i++;
    return (Math.round(v * 100) / 100).toString();
  });
};
const shiftPaint = (f: P5['fill'], dx: number, dy: number): P5['fill'] => {
  if (typeof f === 'string') return f;
  if ('lin' in f) return {...f, lin: [[f.lin[0][0] + dx, f.lin[0][1] + dy], [f.lin[1][0] + dx, f.lin[1][1] + dy]]};
  return {...f, rad: {...f.rad, c: [f.rad.c[0] + dx, f.rad.c[1] + dy]}};
};
function moveP5(p: P5, dx: number, dy: number): P5 {
  if (!dx && !dy) return p;
  return {...p, d: shiftD(p.d, dx, dy), fill: shiftPaint(p.fill, dx, dy), regions: p.regions?.map((r) => ({...r, d: shiftD(r.d, dx, dy), fill: shiftPaint(r.fill, dx, dy)}))};
}

/** The head frame a pose puts the head on (light: the skeleton only), moved by a bob. */
export function poseHead6(w: Who6, pose: Pose5, yaw: number, bob: V2 = [0, 0]): HeadFrame {
  const hf = headFrame(skel5(w.sex, w.build, pose), cam(yaw));
  return hfOf({c: [hf.c[0] + bob[0], hf.c[1] + bob[1]], s: hf.s, rot: hf.rot, yaw: hf.yaw});
}

/** One assembled person on the new body. */
export function person6(w: Who6, o: Opts6): Built6 {
  const cut = fitCut(CUTS4[w.cut], w.sex);
  const bob = o.bob ?? [0, 0];
  const pre = poseHead6(w, o.pose, o.yaw, bob);
  const vv = viewsOf(pre.yaw);
  const by = Math.abs(((((o.yaw + 180) % 360) + 360) % 360) - 180);
  const ownNeck = (vv.face === 'p' && by >= 66 && by <= 114) || vv.face === 'l';
  const B = body5(w.sex, w.build, o.pose, w.fit, {yaw: o.yaw, skin: w.skin, px: o.px, neck: !ownNeck});
  const hf = hfOf({c: [B.head.c[0] + bob[0], B.head.c[1] + bob[1]], s: B.head.s, rot: B.head.rot, yaw: B.head.yaw});
  const parts: P5[] = [];
  const S = hf.s;
  for (const p of B.parts) {
    const role: Role = p.name === 'neck' || BODY_SKIN.test(p.name) ? 'skin' : 'body';
    parts.push(moveP5(fromV4(p, role), bob[0], bob[1]));
  }
  // the head on the head frame
  const skullPx = (o.px * S) / 1000;
  const H = head(w.sex, vv.face, {skin: w.skin, hair: w.hair, px: skullPx, eyes: o.eyes, brow: o.brow});
  const showEar = earsOf(cut, vv.hair);
  for (const p of placeHead(H, {c: hf.c, s: S, rot: hf.rot, mirror: false})) {
    if (p.name === 'neck' && !ownNeck) continue;
    if (p.name === 'ear' && !showEar) continue;
    // the head's own neck goes under the collar too (body5's neck sits at z 39)
    const q = p.name === 'neck' ? {...p, z: 39} : p;
    parts.push(fromV4(q, SKIN_PARTS.test(p.name) ? 'skin' : 'face'));
  }
  // the hair on the same frame
  const br = o.breeze;
  const motion: MotionState | undefined = o.motion ?? (br ? {t: 1.6, key: `b6|${w.id}|${o.pose.kind}|${o.yaw}|${br[0]},${br[1]}`, head: () => hf, wind: () => br} : undefined);
  const hp = hair(cut, vv.hair, hf, motion, {tone: w.hair, shading: 'soft', px: o.px, skin: w.skin.lit, gloss: LOOK.gloss});
  for (const p of hp) parts.push(fromH4(p, 'hair'));
  const sd: V2 = [KEY[0] * 0.05 * S, KEY[1] * 0.05 * S];
  if (o.cast ?? true) {
    // the hair's soft shadow on the skin it lies over (person5)
    const casters = parts.filter((p) => p.role === 'hair' && !p.line && !/fly|strand|tendril|loose|coil[0-9]|bones|joint/.test(p.name));
    for (const p of parts) {
      if (p.role !== 'skin' || !SKIN_PARTS.test(p.name)) continue;
      const over = casters.filter((c) => c.z > p.z);
      if (!over.length) continue;
      p.casts = [{ds: over.map((c) => c.d), fill: mixLab(w.skin.shade, w.skin.deep, 0.35), opacity: p.name === 'ear' ? 0.5 : 0.42, blur: 0.016 * S, dx: sd[0], dy: sd[1]}];
    }
    // the head's soft shadow under the jaw on the body's neck
    const headPart = parts.find((p) => p.name === 'head');
    const neck = parts.find((p) => p.name === 'neck' && p.role === 'skin');
    if (headPart && neck && !ownNeck) neck.casts = [...(neck.casts ?? []), {ds: [headPart.d], fill: w.skin.deep, opacity: 0.38, blur: 0.022 * S, dx: 0.02 * S, dy: 0.075 * S}];
    // the body's own soft shadows: what lies over a garment shades it a little, down and away from the key
    const bodyCast = (target: RegExp, from: RegExp, opacity: number, k = 1) => {
      for (const p of parts) {
        if (!target.test(p.name)) continue;
        const over = parts.filter((c) => from.test(c.name) && c.z > p.z && !c.line);
        if (!over.length) continue;
        const fill = typeof p.fill === 'string' ? p.fill : (p.fill.stops[1]?.[1] ?? '#000');
        p.casts = [...(p.casts ?? []), {ds: over.map((c) => c.d), fill: mixLab(shiftL(fill, -26), '#1B1424', 0.35), opacity, blur: 0.02 * S * k, dx: sd[0] * 1.3 * k, dy: sd[1] * 1.1 * k}];
      }
    };
    bodyCast(/^(top|waistband|collar|collarV)$/, /^(outer-|sleeve-|arm-|hand-)/, 0.34);
    bodyCast(/^(seat|leg-)/, /^(top|outer-|sleeve-|arm-|hand-|waistband)/, 0.3);
    bodyCast(/^(outer-)/, /^(sleeve-|arm-|hand-)/, 0.3);
    // the hair on the back of the coat or the top (seen from behind)
    if (vv.face === 'l') bodyCast(/^(top|outer-)/, /^hair/, 0.32, 1.2);
  }
  // the rim on the shoulders' top edges
  if (o.rim ?? true) {
    const rw = 0.03 * S;
    for (const p of parts) {
      if (p.role !== 'body' || !RIMMED.test(p.name)) continue;
      const lit = typeof p.fill === 'string' ? p.fill : p.fill.stops[1]?.[1] ?? w.top.lit;
      p.rimBand = {dx: rw * 0.12, dy: rw * 0.99, color: mixLab(shiftL(lit, 16), '#FFE9CF', 0.35), opacity: 0.55};
    }
  }
  // the contact shadow: under the feet (standing, walking, leaning) or under the seat and the feet (seated)
  if (o.ground ?? true) {
    const sk = B.skel;
    const k = o.pose.kind;
    const col = o.contact?.color ?? '#140F1C';
    const op = o.contact?.opacity ?? 0.3;
    const foot = (side: 'l' | 'r') => proj(sk.leg[side].ankle, B.cam);
    if (k !== 'ledge') {
      const a = foot('l');
      const b = foot('r');
      const cx = (a[0] + b[0]) / 2 + bob[0];
      const rx = Math.abs(a[0] - b[0]) / 2 + 95;
      parts.push({name: 'contact', d: ellipseD(cx, 996 + bob[1], rx, 20), fill: col, opacity: op, z: 0, ground: true, role: 'prop'});
    }
    if (k === 'ground' || k === 'ledge') {
      const hp2 = proj([(sk.leg.l.hip[0] + sk.leg.r.hip[0]) / 2, sk.leg.l.hip[1] - 70, (sk.leg.l.hip[2] + sk.leg.r.hip[2]) / 2], B.cam);
      parts.push({name: 'contactSeat', d: ellipseD(hp2[0] + bob[0], hp2[1] + 8 + bob[1], 150, 16), fill: col, opacity: op * 1.1, z: 0, ground: true, role: 'prop'});
    }
  }
  return {parts, hf, head: hf.c, face: vv.face, hairView: vv.hair};
}

function ellipseD(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
}

// ---------------------------------------------------------------- the walk over time (the strip's motion)
/** The walk: a cycle every TC seconds; the travel at V figure units a second (the stance foot's slide: the camera
 *  tracks, the figure stays in its cell while the hair feels the real motion). */
export const WALK6 = {TC: 1.1, V: 0};
{
  // the planted foot slides ZF + ZB in 62 % of a cycle: that is the body's speed
  const zf = 168;
  const zb = 184;
  WALK6.V = (zf + zb) / (0.62 * WALK6.TC);
}
export const walkPhase = (t: number, ph0 = 0) => ph0 + t / WALK6.TC;
/** The MotionState for a walking person (from t = 0, already at speed). */
export function walkMotion6(w: Who6, t: number, yaw = -90, ph0 = 0): MotionState {
  return {t, key: `walk6|${w.id}|${yaw}|${ph0}`, head: (tt: number) => poseHead6(w, walk5(w.sex, walkPhase(tt, ph0)), yaw, [-WALK6.V * tt, 0])};
}

// ---------------------------------------------------------------- props (SVG in figure units: x, screen y; y 1000 = the floor)
export const PROPS = {
  /** a stone ledge (ref 05's block): its top at body height `top`, its front edge at screen x `edge`, going back to x1 */
  ledge(top: number, edgeX: number, backX: number, color = '#3C3550', topColor = '#5E5878'): string {
    const y = 1000 - top;
    return `<path d="M${backX} ${y + 6}L${edgeX - 10} ${y - 4}Q${edgeX + 4} ${y - 2} ${edgeX + 6} ${y + 14}L${edgeX + 28} ${1000 + 30}L${backX} ${1000 + 30}Z" fill="${color}"/><path d="M${backX} ${y + 6}L${edgeX - 10} ${y - 4}Q${edgeX + 4} ${y - 2} ${edgeX + 6} ${y + 14}L${edgeX - 6} ${y + 16}L${backX} ${y + 24}Z" fill="${topColor}" opacity="0.8"/>`;
  },
  /** a quay rail in 3D (body space: along x at height top and depth z, from x0 to x1), seen at the camera's yaw */
  rail3(yaw: number, top: number, z: number, x0: number, x1: number, color = '#2E2A3E', lit = '#6C6688'): string {
    const c = cam(yaw);
    const a = proj([x0, top, z], c);
    const b = proj([x1, top, z], c);
    const a2 = proj([x0, top - 170, z], c);
    const b2 = proj([x1, top - 170, z], c);
    const posts = [0.08, 0.5, 0.92].map((t) => {
      const p = proj([x0 + (x1 - x0) * t, top, z], c);
      return `<rect x="${p[0] - 7}" y="${p[1]}" width="14" height="${1000 - p[1]}" fill="${color}"/>`;
    }).join('');
    const bar = (p: V2, q: V2, w: number) => `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `${posts}${bar(a, b, 18)}<path d="M${a[0] + 4} ${a[1] - 5}L${b[0] - 4} ${b[1] - 5}" stroke="${lit}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>${bar(a2, b2, 9)}`;
  },
  /** a quay rail: a bar at body height `top` from x0 to x1 (screen), posts, a lighter top edge */
  rail(top: number, x0: number, x1: number, color = '#2E2A3E', lit = '#6C6688'): string {
    const y = 1000 - top;
    const posts = [x0 + 30, (x0 + x1) / 2, x1 - 30].map((x) => `<rect x="${x - 7}" y="${y}" width="14" height="${1000 - y}" fill="${color}"/>`).join('');
    return `${posts}<rect x="${x0}" y="${y - 10}" width="${x1 - x0}" height="18" rx="9" fill="${color}"/><rect x="${x0 + 4}" y="${y - 9}" width="${x1 - x0 - 8}" height="5" rx="2.5" fill="${lit}" opacity="0.8"/><rect x="${x0}" y="${y + 160}" width="${x1 - x0}" height="10" rx="5" fill="${color}"/>`;
  },
  /** a soft hilltop (ref 01): the ground's crest */
  hill(x0: number, x1: number, color = '#4B4466'): string {
    return `<path d="M${x0} 1010Q${(x0 + x1) / 2} 975 ${x1} 1010L${x1} 1200L${x0} 1200Z" fill="${color}"/>`;
  },
};
