// PEOPLE v4 ASSEMBLED (docs/look/people_design/hair_v4/final/FINAL.md): the hair round's cuts (hair_v4: designed shapes
// on a 2D spring rig) on the faces round's heads and bodies (people_v4: authored pen faces, smooth bodies), as one
// character with one light. The order of a figure:
//   1. the pose's head frame (the same skeleton people_v4/body.ts builds), its yaw -> the face's drawn view
//      (people_v4/head.ts viewOfYaw: 3/4 under 63, profile under 114, then the lost profile) -> the hair's drawing
//      (q / p / b); the hair's 3/4 -> profile morph is set to finish exactly at the face's swap (hair.ts SWITCH)
//   2. body(): the body draws the neck in 3/4 and from behind; in profile the head's designed neck is used
//   3. head() placed on the head frame; its ear is drawn only where the cut leaves the ear showing
//   4. hair() on the SAME head frame (head units: crown -0.5, chin 0.5), still or over a motion
//   5. the light that joins them (EVALUATION.md 3, 6): the hair's soft shadow cast on the forehead, the cheek, the ear and
//      the nape (one group, shifted away from the key, softened); the rim on the hair AND the shoulders; a contact shadow
// Every figure faces screen-left (the key is upper left; a mirrored face would light its front from the wrong side).
import type {V2} from './bez';
import {hair, earsOf, setSwitch, type Shading} from './hair';
import {CUTS4} from './cuts';
import type {MotionState} from './sim';
import type {View} from './cut';
import {fromV4, fromH4, type P5, type Role} from './asm_render';
import {fitCut} from './asm_fit';
import {body, buildV4} from '../people_v4/body';
import {head, placeHead, viewOfYaw as faceViewOf, type Eyes} from '../people_v4/head';
import type {FaceView, Sex} from '../people_v4/faces';
import {headFrame, type HeadFrame} from '../graphic_faces/head';
import {cam, proj} from '../graphic/rig';
import type {Frame} from '../graphic/body';
import {mixLab, shiftL, tone, type Tone} from '../graphic/color';
import {SKIN, HAIR} from '../graphic/palette';
import {standV2, walkV2, skelV2, type BuildName} from '../hair_v2/stance';
import {HC, SK, WARDROBE as W} from '../hair_v2/people';

// the hair's turn finishes where the face's drawing swaps (people_v4/head.ts: 63 / 114)
setSwitch({m0: 36, m1: 63, p: 63, b: 113.99});

// ---------------------------------------------------------------- the cast
export type Who5 = {
  id: string;
  sex: Sex;
  build: BuildName;
  /** stature (cm): only the drawn height changes (the figure is 1000 units tall) */
  cm: number;
  cut: string;
  skin: Tone;
  hair: Tone;
  top: Tone;
  bottom: Tone;
  shoe: Tone;
  label: string;
};
const shoeDark = tone('#2A2124', {k: 0.7});
const shoeLight = tone('#EDE5D8', {k: 0.86});
export const CAST5: Record<string, Who5> = {
  her: {id: 'her', sex: 'f', build: 'average', cm: 168, cut: 'LONG', skin: SKIN.s2, hair: HAIR.copper, top: tone('#3E3238', {k: 0.7}), bottom: tone('#E7D9C6', {k: 0.82}), shoe: shoeDark, label: 'her: long layers, curtain bangs'},
  W1: {id: 'W1', sex: 'f', build: 'slim', cm: 160, cut: 'LOB', skin: SK.s1, hair: HC.espresso, top: W.cloud, bottom: W.chocolate, shoe: shoeDark, label: 'the wavy lob'},
  W6: {id: 'W6', sex: 'f', build: 'soft', cm: 165, cut: 'CLOUD', skin: SK.s6, hair: HC.black, top: W.rust, bottom: W.cream, shoe: shoeLight, label: 'the natural coily cloud'},
  W4: {id: 'W4', sex: 'f', build: 'athletic', cm: 174, cut: 'PONY', skin: SK.s3, hair: HC.honey, top: W.burgundy, bottom: W.butter, shoe: shoeDark, label: 'the sleek ponytail'},
  M1: {id: 'M1', sex: 'm', build: 'athletic', cm: 182, cut: 'CROP', skin: SK.s4, hair: HC.blackBrown, top: W.cloud, bottom: W.indigo, shoe: shoeLight, label: 'the textured crop'},
  M2: {id: 'M2', sex: 'm', build: 'slim', cm: 188, cut: 'FLOW', skin: SK.s5, hair: HC.darkBrown, top: W.sage, bottom: W.nearBlack, shoe: shoeDark, label: 'the middle-part flow'},
};
export const CAST_ORDER = ['her', 'W1', 'W6', 'W4', 'M1', 'M2'];

// ---------------------------------------------------------------- the pose's head frame
export type PoseName5 = 'stand' | 'walk';
export type Pose5 = {pose: PoseName5; bodyYaw: number; headYaw: number};
/** A HeadFrame from a placement {c, s, rot, yaw}. */
export function hfOf(h: {c: V2; s: number; rot: number; yaw: number}): HeadFrame {
  const r = (h.rot * Math.PI) / 180;
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  const P = (u: V2): V2 => [h.c[0] + (u[0] * cs - u[1] * sn) * h.s, h.c[1] + (u[0] * sn + u[1] * cs) * h.s];
  return {c: h.c, s: h.s, rot: h.rot, yaw: h.yaw, P, PP: (us) => us.map(P), R: () => ''};
}
/** The head frame body() would build for this pose (the arms never move the head), moved by a bob (a walk's step). */
export function poseHead(sex: Sex, build: BuildName, p: Pose5, bob: V2 = [0, 0]): HeadFrame {
  const b = buildV4(sex, build);
  const arms = (_: Frame) => ({l: {el: [150, 640, 0] as [number, number, number], wr: [160, 520, 10] as [number, number, number]}, r: {el: [-150, 640, 0] as [number, number, number], wr: [-160, 520, 10] as [number, number, number]}});
  const ps = p.pose === 'stand' ? standV2(b, arms, {headYaw: p.headYaw, roll: sex === 'm' ? 5 : 7, upright: true}) : walkV2(b, arms, {upright: true});
  if (p.pose === 'stand') ps.head = {...ps.head, yaw: p.headYaw, roll: 2, pitch: 1, dx: 2};
  else ps.head = {...ps.head, yaw: p.headYaw};
  const hf = headFrame(skelV2(ps), cam(p.bodyYaw));
  return hfOf({c: [hf.c[0] + bob[0], hf.c[1] + bob[1]], s: hf.s, rot: hf.rot, yaw: hf.yaw});
}
/** The face's drawn view for a head yaw, and the hair's drawing that goes with it. */
export function viewsOf(yaw: number): {face: FaceView; hair: View; mirror: boolean} {
  const v = faceViewOf(yaw);
  return {face: v.view, hair: v.view === 'l' ? 'b' : v.view, mirror: v.mirror};
}

// ---------------------------------------------------------------- the light that joins hair and head
/** The key is upper left: shadows fall down-right, the rim faces up-left. */
const KEY: V2 = [0.42, 0.91];
const SKIN_PARTS = /^(head|neck|ear)$/;
const BODY_SKIN = /^(arm-|hand-)/;
const RIMMED = /^(top|sleeve-)/;

export type Opts5 = Pose5 & {
  /** the drawn height in px (crown to sole): the detail ladder of the face and the hair */
  px: number;
  eyes?: Eyes;
  brow?: boolean;
  shading?: Shading;
  /** a motion for the hanging hair (the head track must be this figure's: poseHead) */
  motion?: MotionState;
  /** the whole figure moved (a walk's bob), figure units */
  bob?: V2;
  /** the hair's cast shadow on the skin (default on) and the shoulders' rim (default on) */
  cast?: boolean;
  rim?: boolean;
  /** no contact shadow (busts) */
  ground?: boolean;
  /** the lost profile's neck: the body's (follows the body's yaw) or the head's own (meets the jaw) */
  lostNeck?: 'body' | 'head';
  /** the hair's gloss strength (hair.ts HairOpts.gloss) */
  gloss?: number;
  /** a steady breeze (figure units per second, screen axes) the still hair has settled into (no motion given) */
  breeze?: V2;
  /** the contact shadow's colour and strength (the scene's ground) */
  contact?: {color: string; opacity: number};
};
export const NECK: {lost: 'body' | 'head'} = {lost: 'head'};
/** The assembly's look settings (the stills use these defaults). */
export const LOOK = {gloss: 1.6};
export type Built5 = {parts: P5[]; hf: HeadFrame; head: V2; face: FaceView; hairView: View};

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
/** A part moved by (dx, dy) (the walk's bob for the body, whose builder knows no bob). */
function moveP5(p: P5, dx: number, dy: number): P5 {
  if (!dx && !dy) return p;
  return {...p, d: shiftD(p.d, dx, dy), fill: shiftPaint(p.fill, dx, dy), regions: p.regions?.map((r) => ({...r, d: shiftD(r.d, dx, dy), fill: shiftPaint(r.fill, dx, dy)}))};
}

/** One assembled person. */
export function person5(w: Who5, o: Opts5): Built5 {
  const cut = fitCut(CUTS4[w.cut], w.sex);
  const bob = o.bob ?? [0, 0];
  const hf = poseHead(w.sex, w.build, o, bob);
  const vv = viewsOf(hf.yaw);
  // the head's own designed neck when the whole figure is in profile (the throat's line); a head turned to profile on
  // a 3/4 body keeps the body's neck (it twists with the body; no pop of the neck at the face's swap in a turn)
  const by = Math.abs(((((o.bodyYaw + 180) % 360) + 360) % 360) - 180);
  const ownNeck = (vv.face === 'p' && by >= 66 && by <= 114) || (vv.face === 'l' && (o.lostNeck ?? NECK.lost) === 'head');
  const B = body(w.sex, w.build, o.pose, 'tee', {yaw: o.bodyYaw, headYaw: o.headYaw, tones: {skin: w.skin, top: w.top, bottom: w.bottom, shoe: w.shoe}, neck: !ownNeck});
  const parts: P5[] = [];
  const S = hf.s;
  // ---- the body (moved by the bob; its own builder places it standing)
  for (const p of B.parts) {
    const role: Role = p.name === 'neck' || BODY_SKIN.test(p.name) ? 'skin' : 'body';
    parts.push(moveP5(fromV4(p, role), bob[0], bob[1]));
  }
  // ---- the head on the head frame (the same similarity as the hair's frame)
  const skullPx = (o.px * S) / 1000;
  const H = head(w.sex, vv.face, {skin: w.skin, hair: w.hair, px: skullPx, eyes: o.eyes, brow: o.brow});
  const showEar = earsOf(cut, vv.hair);
  for (const p of placeHead(H, {c: hf.c, s: S, rot: hf.rot, mirror: false})) {
    if (p.name === 'neck' && !ownNeck) continue;
    if (p.name === 'ear' && !showEar) continue;
    parts.push(fromV4(p, SKIN_PARTS.test(p.name) ? 'skin' : 'face'));
  }
  // ---- the hair on the same frame
  const br = o.breeze;
  const motion: MotionState | undefined = o.motion ?? (br ? {t: 1.6, key: `breeze|${w.id}|${o.pose}|${o.bodyYaw}|${o.headYaw}|${br[0]},${br[1]}`, head: () => hf, wind: () => br} : undefined);
  const hp = hair(cut, vv.hair, hf, motion, {tone: w.hair, shading: o.shading ?? 'soft', px: o.px, skin: w.skin.lit, gloss: o.gloss ?? LOOK.gloss});
  for (const p of hp) parts.push(fromH4(p, 'hair'));
  // ---- the hair's soft shadow on the skin it lies over: one group per skin part (overlaps never double-darken)
  if (o.cast ?? true) {
    const casters = parts.filter((p) => p.role === 'hair' && !p.line && !/fly|strand|tendril|loose|coil[0-9]|bones|joint/.test(p.name));
    const sd: V2 = [KEY[0] * 0.05 * S, KEY[1] * 0.05 * S];
    for (const p of parts) {
      if (p.role !== 'skin' || !SKIN_PARTS.test(p.name)) continue;
      const over = casters.filter((c) => c.z > p.z);
      if (!over.length) continue;
      const deep = mixLab(w.skin.shade, w.skin.deep, 0.35);
      p.casts = [{ds: over.map((c) => c.d), fill: deep, opacity: p.name === 'ear' ? 0.5 : 0.42, blur: 0.016 * S, dx: sd[0], dy: sd[1]}];
    }
    // the head's own soft shadow on the body's neck under the jaw (the profile's designed neck carries its own)
    const headPart = parts.find((p) => p.name === 'head');
    const neck = parts.find((p) => p.name === 'neck' && p.role === 'skin');
    if (headPart && neck && !ownNeck) {
      const jd: V2 = [0.02 * S, 0.075 * S];
      neck.casts = [...(neck.casts ?? []), {ds: [headPart.d], fill: w.skin.deep, opacity: 0.38, blur: 0.022 * S, dx: jd[0], dy: jd[1]}];
    }
  }
  // ---- the rim on the shoulders (the hair has its own): the light's colour on the key-facing silhouette
  if (o.rim ?? true) {
    const rw = 0.03 * S;
    for (const p of parts) {
      if (p.role !== 'body' || !RIMMED.test(p.name)) continue;
      const lit = typeof p.fill === 'string' ? p.fill : w.top.lit;
      // the shoulders' top faces the key; a near-vertical shift keeps the band off the sides (never an outline)
      p.rimBand = {dx: rw * 0.12, dy: rw * 0.99, color: mixLab(shiftL(lit, 16), '#FFE9CF', 0.35), opacity: 0.6};
    }
  }
  // ---- the contact shadow
  if (o.ground ?? true) {
    // under the feet: the ankles projected, the ellipse a little wider than the stance
    const a = proj(B.skel.leg.l.ankle, B.cam);
    const b = proj(B.skel.leg.r.ankle, B.cam);
    const cx = (a[0] + b[0]) / 2 + bob[0];
    const rx = Math.abs(a[0] - b[0]) / 2 + 95;
    parts.push({name: 'contact', d: ellipseD(cx, 996, rx, 20), fill: o.contact?.color ?? '#140F1C', opacity: o.contact?.opacity ?? 0.3, z: 0, ground: true, role: 'prop'});
  }
  return {parts, hf, head: hf.c, face: vv.face, hairView: vv.hair};
}

function ellipseD(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
}
