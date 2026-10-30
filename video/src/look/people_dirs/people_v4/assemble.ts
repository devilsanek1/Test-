// PEOPLE v4: one figure assembled for the stills (the assembler's job in the next round, shown here so the faces and
// bodies are judged together): body() + head() placed on it + the stand-in haircut (standin.ts; the hair round's cuts
// replace it). Figure units: H = 1000, the crown near y 0, the sole at y 1000.
import type {Tone} from '../graphic/color';
import {skinTone, hairTone, tone, mixLab} from '../graphic/color';
import {SKIN, HAIR} from '../graphic/palette';
import type {BuildName} from '../hair_v2/stance';
import {body, type BodyTones} from './body';
import {head, placeHead, viewOfYaw, type Eyes} from './head';
import {standinHair, standinShoulders} from './standin';
import {mapPart, type PartV4} from './paint';
import type {FaceView, Sex} from './faces';

export const TONES: Record<Sex, {skin: Tone; hair: Tone; body: BodyTones; shoulders: Tone}> = {
  f: {
    skin: SKIN.s2,
    hair: HAIR.copper,
    body: {skin: SKIN.s2, top: tone('#ECE3D7', {k: 0.84}), bottom: tone('#4A3B40', {k: 0.72}), shoe: tone('#2A2124', {k: 0.7})},
    shoulders: tone('#ECE3D7', {k: 0.84}),
  },
  m: {
    skin: skinTone('#C79671'),
    hair: hairTone('#2F2627'),
    body: {skin: skinTone('#C79671'), top: tone('#A9B6C0', {k: 0.82, toward: 280, maxTurn: 6}), bottom: tone('#33435F', {k: 0.76, toward: 290, maxTurn: 6}), shoe: tone('#EDE5D8', {k: 0.86})},
    shoulders: tone('#9E5A3C', {k: 0.78}),
  },
};

/** His short sides: a faded tone between the hair and the skin. */
const fadeOf = (sex: Sex) => (sex === 'm' ? mixLab(TONES.m.hair.lit, TONES.m.skin.shade, 0.42) : undefined);

/** A whole v4 figure: the body at `yaw`, the head turned by `headYaw`, the drawn view picked from the head's yaw. */
export function figureV4(sex: Sex, o: {yaw: number; headYaw?: number; px: number; eyes?: Eyes; build?: BuildName}): {parts: PartV4[]; head: [number, number]} {
  const T = TONES[sex];
  const pre = body(sex, o.build ?? 'average', 'stand', 'tee', {yaw: o.yaw, headYaw: o.headYaw ?? 0, tones: T.body, neck: false});
  const vv = viewOfYaw(pre.head.yaw);
  const ownNeck = vv.view === 'p';
  const B = ownNeck ? pre : body(sex, o.build ?? 'average', 'stand', 'tee', {yaw: o.yaw, headYaw: o.headYaw ?? 0, tones: T.body, neck: true});
  const h = head(sex, vv.view, {skin: T.skin, hair: T.hair, px: o.px * 0.128, eyes: o.eyes});
  const m = {c: B.head.c, s: B.head.s, rot: B.head.rot, mirror: vv.mirror};
  const hp = placeHead(h, m).filter((p) => ownNeck || p.name !== 'neck');
  const hair = standinHair(sex, vv.view, T.hair, fadeOf(sex)).map((p) => {
    const q = mapPart(p, m);
    return q.name === 'hairBack' && vv.view === 'q' ? {...q, z: 20} : q;
  });
  return {parts: [...B.parts, ...hp, ...hair], head: B.head.c};
}

/** A head alone (with the stand-in cut and shoulders) in head units, for the close panels. */
export function headAloneV4(sex: Sex, view: FaceView, o: {px: number; eyes?: Eyes; brow?: boolean}): PartV4[] {
  const T = TONES[sex];
  const h = head(sex, view, {skin: T.skin, hair: T.hair, px: o.px, eyes: o.eyes, brow: o.brow});
  return [...h.faceParts, ...standinHair(sex, view, T.hair, fadeOf(sex)), ...standinShoulders(sex, view, T.body.top)];
}
