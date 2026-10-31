// test01_s1: HER, the people in use (PEOPLE_DESIGN.md's top, owner 2026-10-30: hair v4, the redrawn faces with OPEN
// EYES looking away, the rebuilt bodies), drawn as src/look/v8_s1/her_v8.tsx draws her (person6 from
// hair_v4/asm_bodies.ts on people_v4 skel5 / hand5 / body5), in a pose of her own for this moment (CARD.md §3): on the
// crown of the bridge, leaning forward over the near railing on her forearms, her right hand holding the phone out over
// the water, her head bowed to the light below (eyes open, looking down at it, never at us), turned a little toward
// it. Her evening look (the long open coat over the light column, the copper long layers), the hair lifted a touch by
// the warm air rising off the pages. Crisp, never painted; her light is the scene's live layers (T01Scene.tsx).
import React, {useId, useMemo} from 'react';
import {CAST6, person6, type Built6} from '../people_dirs/hair_v4/asm_bodies';
import {placeSvg} from '../people_dirs/hair_v4/asm_render';
import {skel5, type Pose5} from '../people_dirs/people_v4/skel5';
import {cam, proj as figProj} from '../people_dirs/graphic/rig';

export type HerPose = {
  /** the camera's yaw on her body (0 faces us; a little negative turns her toward screen-left) */
  yaw: number;
  /** how far she leans over the rail (degrees about the hips) and how round her back is */
  lean: number;
  bend: number;
  /** the head's pitch (negative bows it) and its yaw on the neck */
  headPitch: number;
  headYaw: number;
  /** the phone hand's wrist (body units: x her left, y up from the soles, z toward her front) */
  phone: [number, number, number];
  /** the warm air rising in her hair (figure units a second) */
  breeze: [number, number];
};

/** The delivered pose: leaning on the rail, the phone held out over the water, her head bowed to the light. */
export const HER_T01: HerPose = {yaw: -14, lean: 30, bend: 16, headPitch: -36, headYaw: -10, phone: [-46, 700, 360], breeze: [140, -900]};

/** The pose in skel5's terms: the rail (1.02 m) at ~607 units, a forearm's width in front of her. */
export function herPose5(p: HerPose): Pose5 {
  return {
    kind: 'lean',
    pelvis: {x: 0, z: -40, roll: -3, tw: 4},
    chest: {x: 0, z: -28, roll: 2.5, tw: -4},
    waist: {x: 0, z: -30},
    torso: {dy: -8, pitch: p.lean, bend: p.bend},
    head: {yaw: p.headYaw, roll: 6, pitch: p.headPitch, dx: 0},
    neck: {fwd: 16, lean: 20, nbz: -14},
    legs: {
      r: {ankle: [-38, 40, -64], fy: -10, fp: 0, pole: [-0.1, 0, 1]},
      l: {ankle: [52, 44, -28], fy: 14, fp: 6, pole: [0.05, 0, 1]},
    },
    arms: {
      // the phone hand: out over the rail, the wrist level, the palm down (the screen faces the water)
      r: {wr: p.phone, pole: [-0.55, -0.75, -0.2], hand: 'grip', hd: [0.12, -0.08, 1], pn: [0, -1, 0.05]},
      // the other forearm resting along the rail, the hand relaxed over its edge
      l: {wr: [70, 628, 236], pole: [0.6, -0.75, -0.1], hand: 'rest', hd: [-0.35, -0.2, 1], pn: [0.05, -1, 0.1]},
    },
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
  const q = figProj(sk.arm.r.wr, cam(p.yaw));
  const s = h / 1000;
  return [x + q[0] * s, feetY - h + q[1] * s];
}

export const T01Her: React.FC<{x: number; feetY: number; h: number; pose?: HerPose; clipAboveY?: number}> = ({x, feetY, h, pose = HER_T01, clipAboveY}) => {
  const uid = 't01her' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useMemo(() => placeSvg(herParts(h, pose).parts, uid, x, feetY, h, {shadow: false}), [uid, x, feetY, h, pose]);
  if (clipAboveY === undefined) return <g dangerouslySetInnerHTML={{__html: svg}} />;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}clip`}>
          <rect x={x - h} y={feetY - h * 1.3} width={h * 2} height={clipAboveY - (feetY - h * 1.3)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}clip)`} dangerouslySetInnerHTML={{__html: svg}} />
    </g>
  );
};
