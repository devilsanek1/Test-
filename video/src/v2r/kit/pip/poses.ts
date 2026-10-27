// poses.ts — Pip's named poses (TREATMENT section 3, "Pip per shot"), each a set of PoseParams overrides on NEUTRAL.
// Poses BLEND (every field is a number), so a change is a short animated move, never a pop. Facing is separate
// (`yaw`): a pose keeps the facing unless it names one.

import {NEUTRAL, PoseParams} from './model';

export type PoseName =
  | 'sit' // seated, ears relaxed, tail hanging over the seat's edge (perch on a bollard / post / box); keeps the facing
  | 'watch34' // THE WATCHER: body 3/4 back on the perch, the head turned round to show its face (trunk curl, eye, blush)
  | 'alert' // ears up and forward, head up a hair: something is about to happen
  | 'earsCover' // S1 "life": the leaf ears swing forward and fold over the face, a hunch, the trunk tucks
  | 'earsDown' // S8 "can't": ears hang straight down, head low (sad, small; no droop of the body)
  | 'lookUp' // S5 / S8: head tipped back to the sky, ears falling back, the trunk lifting
  | 'crouch' // the wind-up before a hop
  | 'tuck' // airborne, small hop: legs tucked, ears streaming back, scarf flying
  | 'leap' // airborne, big leap: front legs reaching, hind legs and soles back, ears and tail streaming
  | 'land' // the landing squash (ears flop forward)
  | 'ride'; // seated on a moving boat roof: ears a touch back, the scarf streaming

export const POSES: Record<PoseName, Partial<PoseParams>> = {
  sit: {},
  // the body squares to "away" and the watcher cheat (model.ts watchYaw) turns it 40 deg toward the side it looks, the
  // head round to a 3/4 front on that side (a clean profile at <= 60 px); no target / look: screen left (west)
  watch34: {yaw: 180, watch: 1, earSwingA: 12, earSwingB: 12, lookUp: 0.05},
  alert: {earDroopA: 8, earDroopB: 8, earSwingA: 24, earSwingB: 24, earFoldA: 0, earFoldB: 0, lookUp: 0.14, trunkRaise: 8},
  earsCover: {
    earDroopA: 50, earDroopB: 50, earSwingA: 128, earSwingB: 128, earFoldA: 0.3, earFoldB: 0.3,
    hunch: 0.38, headDrop: 3.5, lookUp: -0.38, trunkCurl: 1.3, trunkRaise: -8, tailAngle: -4, eyes: 0, scarfLift: 0.25,
    toCam: 1, // played from the FRONT: the head turns to us first (PipTrack leads it by 0.12 s), the leaves fold over the eyes
  },
  earsDown: {earDroopA: 82, earDroopB: 82, earSwingA: -4, earSwingB: -4, earFoldA: 0.3, earFoldB: 0.3, headDrop: 2.5, lookUp: -0.28, hunch: 0.12, trunkCurl: 1.15},
  lookUp: {lookUp: 1, earDroopA: 52, earDroopB: 52, earSwingA: -22, earSwingB: -22, trunkRaise: 105, trunkCurl: 0.85, trunkLen: 1.45, headDrop: 1.5},
  crouch: {hunch: 0.5, earDroopA: 16, earDroopB: 16, earSwingA: -22, earSwingB: -22, lookUp: 0.18, tailAngle: 30},
  tuck: {
    tuck: 1, earDroopA: -14, earDroopB: -14, earSwingA: -48, earSwingB: -48, earFoldA: 0.18, earFoldB: 0.18,
    scarfLift: 1.05, tailAngle: 125, tailCurl: 0.2, trunkCurl: 1.1, trunkRaise: 22, lookUp: 0.15,
  },
  leap: {
    leap: 1, earDroopA: -20, earDroopB: -20, earSwingA: -62, earSwingB: -62, earFoldA: 0.25, earFoldB: 0.25,
    scarfLift: 1.15, tailAngle: 150, tailCurl: 0.1, trunkCurl: 0.85, trunkRaise: 45, lookUp: 0.32,
  },
  land: {hunch: 0.45, earDroopA: 58, earDroopB: 58, earSwingA: 20, earSwingB: 20, earFoldA: 0.2, earFoldB: 0.2},
  ride: {earDroopA: 26, earDroopB: 26, earSwingA: -14, earSwingB: -14, scarfLift: 0.85},
};

/** Named facings (body yaw). The watcher is a 3/4 back view (we look over its shoulder at what it watches). */
export const FACING = {
  front: 12,
  frontRight: 40,
  right: 90,
  backRight: 140,
  back: 160, // the default watcher (3/4 back, its left side a little toward us)
  backLeft: 200,
  left: 270,
  frontLeft: 320,
} as const;
export type FacingName = keyof typeof FACING;

/** Full params of a pose (+ overrides) on NEUTRAL. */
export function poseParams(pose: PoseName | Partial<PoseParams> = 'sit', over: Partial<PoseParams> = {}): PoseParams {
  const base = typeof pose === 'string' ? POSES[pose] : pose;
  return {...NEUTRAL, ...base, ...over};
}
