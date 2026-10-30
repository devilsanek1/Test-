// HAIR v4: the test figures. The bodies and the LASH heads are the v3 figures' (hair_v2/people.ts, read only): we build
// them, drop their v3 hair (and the ears the v3 cuts asked for), and put the v4 hair on the SAME head frame, rebuilt
// from the same pose. This is also the model for the assembler: build the head, then
//   parts.push(...hair(cut, H.lm.view, H.hf, motion, {tone, shading}))
// and draw the ears when the cut leaves them showing (earsOf).
import type {V2} from './bez';
import {cam, type Cam} from '../graphic/rig';
import type {Frame} from '../graphic/body';
import {headFrame, type FaceOpt, type HeadFrame} from '../graphic_faces/head';
import {ear} from '../graphic_faces/headwear';
import {SKIN, HAIR} from '../graphic/palette';
import type {Tone} from '../graphic/color';
import {herV2, personV2, lookOf, HC, SK, YAW_V2, type Look, type View} from '../hair_v2/people';
import {CUTS3} from '../hair_v2/cuts3';
import {WOMAN_V2, MAN_V2, standV2, walkV2, backV2, skelV2, type SkelV2} from '../hair_v2/stance';
import {hair, earsOf, viewOfYaw, type Shading} from './hair';
import type {MotionState} from './sim';
import type {Cut} from './cut';
import type {Part4} from './part4';
import type {Fig4Built} from './render';

export type Who = 'her' | 'W1' | 'W2' | 'W4' | 'W5' | 'W6' | 'W7' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
const V3HAIR = /^(hair|hl-|hb-|hx-|hp-|ear$)/;

/** The pose's head frame (the same skeleton personV2 / herV2 build; the arms do not touch the head). */
function skelOf(sex: 'f' | 'm', view: View, headYaw: number | undefined): SkelV2 {
  const b = sex === 'f' ? WOMAN_V2 : MAN_V2;
  const arms = (_: Frame) => ({l: {el: [150, 640, 0] as [number, number, number], wr: [160, 520, 10] as [number, number, number]}, r: {el: [-150, 640, 0] as [number, number, number], wr: [-160, 520, 10] as [number, number, number]}});
  const pose = view === 'q' ? standV2(b, arms, {headYaw: headYaw ?? 20, roll: sex === 'm' ? 5 : 7, upright: true}) : view === 'p' ? walkV2(b, arms, {upright: true}) : backV2(b, arms, headYaw ?? 30, true);
  if (view === 'p' && headYaw !== undefined) pose.head = {...pose.head, yaw: headYaw};
  return skelV2(pose);
}
function herSkel4(view: View, headYaw: number | undefined): SkelV2 {
  // herV2 uses the same stance calls with her arms; her standing roll is the default 7
  const b = WOMAN_V2;
  const arms = (_: Frame) => ({l: {el: [150, 640, 0] as [number, number, number], wr: [160, 520, 10] as [number, number, number]}, r: {el: [-150, 640, 0] as [number, number, number], wr: [-160, 520, 10] as [number, number, number]}});
  const pose = view === 'q' ? standV2(b, arms, {headYaw: headYaw ?? 20, upright: true}) : view === 'p' ? walkV2(b, arms, {upright: true}) : backV2(b, arms, headYaw ?? 30, true);
  if (view === 'p' && headYaw !== undefined) pose.head = {...pose.head, yaw: headYaw};
  return skelV2(pose);
}

/** Translate every coordinate pair of an absolute path (M/L/C/Z with x y pairs; arcs keep their radii). */
export function shiftD(d: string, dx: number, dy: number): string {
  if (!dx && !dy) return d;
  // arcs ('a'/'A') carry radii and flags: shift only the M/L/C/Z pairs (our builders write no arcs except the joints)
  if (/[aA]/.test(d)) return d;
  let i = 0;
  return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => {
    const v = parseFloat(m) + (i % 2 === 0 ? dx : dy);
    i++;
    return (Math.round(v * 10) / 10).toString();
  });
}
const shiftPart = (p: Part4, dx: number, dy: number): Part4 => ({
  ...p,
  d: shiftD(p.d, dx, dy),
  regions: p.regions?.map((r) => ({...r, d: shiftD(r.d, dx, dy)})),
  cut: p.cut ? shiftD(p.cut, dx, dy) : undefined,
  paint: p.paint ? {...p.paint, a: [p.paint.a[0] + dx, p.paint.a[1] + dy], b: [p.paint.b[0] + dx, p.paint.b[1] + dy]} : undefined,
});
/** A head frame moved by (dx, dy) (a walk's bob). */
export function moveHF(hf: HeadFrame, dx: number, dy: number): HeadFrame {
  if (!dx && !dy) return hf;
  const P = (u: V2): V2 => {
    const q = hf.P(u);
    return [q[0] + dx, q[1] + dy];
  };
  return {...hf, c: [hf.c[0] + dx, hf.c[1] + dy], P, PP: (us) => us.map(P), R: hf.R};
}

export type Opts4 = {
  view: View;
  cut: Cut;
  /** the head's yaw relative to the body (a turn); default the pose's own */
  headYaw?: number;
  shading?: Shading;
  px?: number;
  motion?: MotionState;
  /** the whole figure moved (a walk's bob), figure-local units */
  bob?: V2;
  face?: FaceOpt;
  tone?: Tone;
  bones?: boolean;
  rim?: boolean | string;
};
export type Built4 = Fig4Built & {hf: HeadFrame; skin: Tone; hairTone: Tone};

/** The head frame of a test figure for a pose (the motion strips animate this). */
export function headOf(who: Who, view: View, headYaw?: number, bob: V2 = [0, 0]): HeadFrame {
  const sk = who === 'her' ? herSkel4(view, headYaw) : skelOf(lookOf(who).sex, view, headYaw);
  const hf = headFrame(sk, cam(YAW_V2[view]) as Cam);
  return moveHF(hf, bob[0], bob[1]);
}

/** A test figure: the v3 body and LASH head, the v4 hair. */
export function person4(who: Who, o: Opts4): Built4 {
  const ver = 3 as const;
  const lk: Look | null = who === 'her' ? null : lookOf(who);
  const body = who === 'her' ? herV2({view: o.view, ver, px: o.px, headYaw: o.headYaw, face: o.face ?? 'lash', cut: CUTS3.W3}) : personV2(lk!, {view: o.view, ver, px: o.px, headYaw: o.headYaw, face: o.face ?? ((o.px ?? 640) < 200 ? 'edge' : 'lash')});
  const skin = who === 'her' ? SKIN.s2 : lk!.skin;
  const tone = o.tone ?? (who === 'her' ? HAIR.copper : lk!.hair);
  const bob = o.bob ?? [0, 0];
  // herV2 has no headYaw for the walk: the profile head stays at its pose's yaw
  const hf0 = headOf(who, o.view, o.headYaw);
  const hf = moveHF(hf0, bob[0], bob[1]);
  const parts: Part4[] = body.parts.filter((p) => !V3HAIR.test(p.name)).map((p) => shiftPart(p as Part4, bob[0], bob[1]));
  // the head's own drawing (a turn crosses from the 3/4 drawing to the profile at |yaw| 70)
  const hv = viewOfYaw(hf.yaw);
  if (earsOf(o.cut, hv)) {
    if (hv === 'b') parts.push(...ear(hf, 'b', skin, -1), ...ear(hf, 'b', skin, 1));
    else parts.push(...ear(hf, hv, skin));
  }
  parts.push(...hair(o.cut, hv, hf, o.motion, {tone, shading: o.shading, px: o.px, bones: o.bones, rim: o.rim, skin: skin.lit}));
  return {parts, box: body.box, head: [hf.c[0], hf.c[1]], hf, skin, hairTone: tone};
}

export {HC, SK, lookOf};
