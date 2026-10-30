// Editorial people: the sheet's poses (dir_editorial.md §6). Contrapposto with one hand anchored (a pocket, a strap, a
// phone), the gaze into the scene, never at the camera; the walk with less arm swing and one arm anchored
// (design_research A1-A8).
import type {Pose} from './body';

export const POSES = {
  /** Her A, front 3/4: the weight on the far leg, the near hand in the coat pocket, the head turned to a profile. */
  herEveningFront: {yaw: 38, weight: 'r', contra: 1, free: {fwd: 46, out: 14, turn: 30}, armL: {kind: 'pocket'}, armR: {kind: 'hang'}, head: {turn: 50, nod: -4, roll: 2}} as Pose,
  /** Her A, profile: walking (just after the contact), the near hand in the coat pocket, the far arm swinging. */
  herEveningProfile: {yaw: 90, walk: 0.12, armL: {kind: 'pocket'}, armR: {kind: 'swing', amount: 14}, head: {nod: 3}} as Pose,
  /** Her A, from behind: contrapposto, one hand in the pocket, the head turned to a lost profile. */
  herEveningBack: {yaw: 166, weight: 'l', contra: 1, free: {fwd: 30, out: 18, turn: 22}, armL: {kind: 'hang'}, armR: {kind: 'pocket'}, head: {turn: -36, nod: 2}} as Pose,
  /** Her B, front 3/4: sunglasses, the thumb hooked in the jeans pocket, the far hand on the tote's strap. */
  herWeekendFront: {yaw: 34, weight: 'l', contra: 1, free: {fwd: 40, out: 10, turn: 26}, armL: {kind: 'jeansPocket'}, armR: {kind: 'strap'}, head: {turn: 12, nod: 1, roll: -2}} as Pose,
  /** Her B, profile: walking, the near hand holding the tote's strap at the hip, the far arm swinging. */
  herWeekendProfile: {yaw: 90, walk: 1.12, armL: {kind: 'hold'}, armR: {kind: 'swing', amount: 12}, head: {nod: 2}} as Pose,
  /** Her B, from behind: contrapposto, the tote on her left shoulder, the arms easy, the ponytail down her back. */
  herWeekendBack: {yaw: 192, weight: 'r', contra: 1, free: {fwd: 26, out: 16, turn: 20}, armL: {kind: 'hang'}, armR: {kind: 'hang'}, head: {turn: 24, nod: 0}} as Pose,
  /** The man, front 3/4: the near hand in the trouser pocket, the far hand holding the phone; looking down at it. */
  manFront: {yaw: 36, weight: 'r', contra: 0.8, free: {fwd: 40, out: 18, turn: 26}, armL: {kind: 'phone'}, armR: {kind: 'pocket'}, head: {turn: 4, nod: 22}} as Pose,
  /** The woman, front 3/4 (drawn facing right): the thumb hooked in the jeans pocket, the head turned to a profile. */
  womanFront: {yaw: 36, weight: 'l', contra: 1, free: {fwd: 44, out: 16, turn: 28}, armL: {kind: 'jeansPocket'}, armR: {kind: 'hang'}, head: {turn: 44, nod: -3, roll: 3}} as Pose,
  /** Her A in the doorway (the painted still v6): walking out, profile. */
  herDoor: {yaw: 90, walk: 0.12, armL: {kind: 'pocket'}, armR: {kind: 'swing', amount: 12}, head: {nod: 3}} as Pose,
};
