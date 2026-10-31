// test01_s1: HER, the people in use (PEOPLE_DESIGN.md's top, owner 2026-10-30: hair v4, the redrawn faces with OPEN
// EYES looking away, the rebuilt bodies), drawn as src/look/v8_s1/her_v8.tsx draws her (person6 from
// hair_v4/asm_bodies.ts on people_v4 skel5 / hand5 / body5), in a pose of her own for this moment (CARD.md §3): on the
// crown of the bridge at the near railing, turned three-quarters (a lean toward the water reads only off the frontal
// view), bent forward over the rail with one forearm resting along it, the near arm reaching out over the water with
// her phone, her head bowed to the light below (eyes open, looking down at it, never at us). Her evening look (the long
// open coat over the light column, the copper long layers), the hair lifted a touch by the warm air rising off the
// pages. Crisp, never painted; her light is the scene's live layers (T01Scene.tsx).
import React, {useId, useMemo} from 'react';
import {CAST6, person6, type Built6} from '../people_dirs/hair_v4/asm_bodies';
import {placeSvg} from '../people_dirs/hair_v4/asm_render';
import {skel5, type Pose5} from '../people_dirs/people_v4/skel5';
import {cam, proj as figProj} from '../people_dirs/graphic/rig';

type V3 = [number, number, number];

export type HerPose = {
  /** the view's yaw on her body (0 faces us, -90 profile facing screen-left) */
  yaw: number;
  /** the phone hand: 'l' her left, 'r' her right (pick the one on the near side of the yaw) */
  phoneSide: 'l' | 'r';
  /** the lean over the rail (degrees about the hips) and the rounding of the upper back */
  lean: number;
  bend: number;
  /** the head: pitch (negative bows it), yaw on the neck, roll */
  headPitch: number;
  headYaw: number;
  headRoll: number;
  /** the phone hand's wrist, body units for the phone side's sign +1 (x out to that side, y up from the soles, z to
   *  her front), mirrored for the other side */
  phone: V3;
  /** the resting forearm's wrist on the rail (the same convention, for the other arm) */
  rest: V3;
  /** the warm air rising in her hair (figure units a second) */
  breeze: [number, number];
};

/** The delivered pose (picked on the T01Her sheet). */
export const HER_T01: HerPose = {
  yaw: -56,
  phoneSide: 'l',
  lean: 30,
  bend: 16,
  headPitch: -38,
  headYaw: -6,
  headRoll: 4,
  phone: [40, 585, 390],
  rest: [6, 618, 168],
  breeze: [60, -700],
};

/** The pose in skel5's terms: the rail (1.02 m) at ~607 units, a forearm's length in front of her hips. */
export function herPose5(p: HerPose): Pose5 {
  const s = p.phoneSide === 'l' ? 1 : -1;
  const phone: V3 = [s * p.phone[0], p.phone[1], p.phone[2]];
  const rest: V3 = [-s * p.rest[0], p.rest[1], p.rest[2]];
  const phoneArm = {wr: phone, pole: [s * 0.55, -0.75, -0.25] as V3, hand: 'grip' as const, hd: [s * 0.05, -0.15, 1] as V3, pn: [0, 1, 0.05] as V3};
  const restArm = {wr: rest, pole: [-s * 0.85, -0.45, -0.15] as V3, hand: 'rest' as const, hd: [s * 0.85, -0.1, 0.35] as V3, pn: [0, -1, 0.05] as V3};
  return {
    kind: 'stand',
    pelvis: {x: 0, z: -34, roll: -3, tw: 4 * s},
    chest: {x: 0, z: -18, roll: 2.5, tw: -5 * s},
    waist: {x: 0, z: -26},
    torso: {dy: -6, pitch: p.lean, bend: p.bend},
    head: {yaw: p.headYaw, roll: p.headRoll, pitch: p.headPitch, dx: 0},
    neck: {fwd: 14, lean: 18, nbz: -14},
    legs: {
      // the weight on the leg away from the phone, the other knee eased, its foot a little forward and out
      r: {ankle: s > 0 ? [-40, 40, -62] : [-50, 44, -22], fy: s > 0 ? -10 : -16, fp: s > 0 ? 0 : 6, pole: [-0.1, 0, 1]},
      l: {ankle: s > 0 ? [50, 44, -24] : [40, 40, -62], fy: s > 0 ? 16 : 10, fp: s > 0 ? 6 : 0, pole: [0.1, 0, 1]},
    },
    arms: s > 0 ? {l: phoneArm, r: restArm} : {l: restArm, r: phoneArm},
  };
}

const CACHE = new Map<string, Built6>();
function herParts(px: number, p: HerPose): Built6 {
  const k = `${Math.round(px * 10)}|${JSON.stringify(p)}`;
  let b = CACHE.get(k);
  if (!b) {
    b = person6(CAST6.her, {pose: herPose5(p), yaw: p.yaw, px, eyes: 'open', breeze: p.breeze, contact: {color: '#1E1A2A', opacity: 0.0}});
    CACHE.set(k, b);
  }
  return b;
}

/** Her phone hand's wrist on screen: the skeleton's wrist through the figure's own camera and placeSvg's transform. */
export function herWrist(x: number, feetY: number, h: number, p: HerPose = HER_T01): [number, number] {
  const sk = skel5(CAST6.her.sex, CAST6.her.build, herPose5(p));
  const w = p.phoneSide === 'l' ? sk.arm.l.wr : sk.arm.r.wr;
  const q = figProj(w, cam(p.yaw));
  const s = h / 1000;
  return [x + q[0] * s, feetY - h + q[1] * s];
}

export const T01Her: React.FC<{x: number; feetY: number; h: number; pose?: HerPose; clipAboveY?: number; alsoBox?: readonly [number, number, number, number]}> = ({x, feetY, h, pose = HER_T01, clipAboveY, alsoBox}) => {
  const uid = 't01her' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useMemo(() => placeSvg(herParts(h, pose).parts, uid, x, feetY, h, {shadow: false}), [uid, x, feetY, h, pose]);
  if (clipAboveY === undefined) return <g dangerouslySetInnerHTML={{__html: svg}} />;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}clip`}>
          <rect x={x - h} y={feetY - h * 1.3} width={h * 2} height={clipAboveY - (feetY - h * 1.3)} />
          {alsoBox ? <rect x={alsoBox[0]} y={alsoBox[1]} width={alsoBox[2]} height={alsoBox[3]} /> : null}
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}clip)`} dangerouslySetInnerHTML={{__html: svg}} />
    </g>
  );
};
