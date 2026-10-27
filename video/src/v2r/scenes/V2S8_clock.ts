// V2S8 "Her words" (lane L6): the shot's ONE clock and camera contract, shared by every V2S8_*.tsx part.
// Scene-local seconds: t = film - 32.93 (BUILD.md scene contract). Film times from TREATMENT.md section 5 (row S8),
// map.ts S8, the heard word onsets (public/v2r/voice_words_heard.json).
//
// CAMERA (decided by L6):
//   - pre-truck float: every plane drifts right by 7 % of its truck dx, linear from the wipe start (the near plane at
//     ~9.6 px/s, inside the 8-12 px/s float), multiplied into the truck so the speed is continuous;
//   - ONE plain truck 34.99-35.60 (ease in-out, inside the speech pause): planes shift right by their dx
//     (map S8.truck: board 250, ghosts 240, house 160, sky 0) and land EXACTLY on the landing pose (board at B, W at
//     (860, 700)) with zero speed; locked 35.60-37.70 (the quote reads on a still board);
//   - the seam push: 1.00 -> 1.05 about W (860, 700), 37.70 -> 38.82, ease in-out (zero speed both ends), then held
//     through the un-build 38.82-39.08, so W is 157.5 x 178.5 at (860, 700) = S1's frame 0 (zoom 1.05 about W), and
//     S1's ease-in pull-out starts from rest: the seam has no speed step.
//   - GHOSTS (decision): they pop on "can't" ahead of her on the towpath, LEFT of her door (pre-truck x 418-494 on the
//     240 px plane), and the truck slides them in front of her SHUT door (x 658-734): the claim still stands at her door.
import {clamp, prog} from '../../lib/time';
import * as MAP from '../world/map';

export const S8_START = 32.93;
export const S8_END = 39.08;
/** film s -> scene s */
export const L = (film: number) => film - S8_START;

/** Story beats, scene seconds. */
export const S8T = {
  wipeT0: L(32.7), // S7's narrowboat bow enters (S8 visible from here, behind the boat)
  wipeT1: L(33.16), // the wipe has cleared
  she: L(33.16), // "She": SHE SAYS header pops with the board clack; she walks home
  pipHop: L(33.0), // Pip leaves the boat's stern
  pipLands: L(33.2), // on the pre-truck board bollard (450, 1205)
  cant: L(33.78), // "can't": three ghosts pop ahead of her, Pip's ears down
  criticize: L(34.04),
  herAtDoor: L(34.55), // she reaches her door (it opens as she arrives)
  doorOpen: L(34.4), // her door starts to swing in
  doorShuts: L(34.75), // latch: the door shuts behind her, the ghosts stay
  wLights: L(34.95), // her window W lights (lamp click): the picture S3 showed
  truckT0: L(MAP.S8.truck.t0), // 34.99
  truckT1: L(MAP.S8.truck.t1), // 35.60
  but: L(35.45),
  herWords: L(35.72), // "her words": the cafe owner wipes the board clean in ONE stroke
  wipeDur: 0.42,
  quotePen: L(36.54), // the quote pen-draws on (line 1), the credit pops on the board
  quoteLine1End: L(37.1), // line 1 complete just before "facts"
  facts: L(37.18), // the lamps light in a run west down the lane; two neighbours stop to read
  quoteLine2: L(37.2),
  quoteLine2End: L(37.7), // line 2 complete on "not"
  not: L(37.7), // Pip looks up at W; the seam push starts
  pushT0: L(37.7),
  pushT1: L(38.82),
  unbuildT0: L(38.82), // the engine's un-build (exit 0 -> 1) over 0.26 s onto S1's t < 0 state
  unbuildT1: L(39.08),
  end: L(39.08),
} as const;

/** The truck's own progress 0..1 (map s8TruckU, in scene seconds). */
export const truckU = (t: number) => MAP.s8TruckU(t + S8_START);

/** Float + truck progress c(t): 0 at the wipe start (the map's pre-truck pose), 1 at the landing (35.60) with zero
 *  speed; a 7 % linear float before, multiplied into the in-out truck (continuous speed at 34.99). */
export const FLOAT_K = 0.07;
export const camC = (t: number) => {
  const u = truckU(t);
  const f = FLOAT_K * clamp((t - S8T.wipeT0) / (S8T.truckT1 - S8T.wipeT0));
  return 1 - (1 - u) * (1 - f);
};

/** The planes' truck dx (px, screen-rightward, landing pose = 0 offset). Map S8.truck + L6's extra planes. */
export const PLANE_DX = {
  sky: MAP.S8.truck.skyDx, // 0: the sky and the sun (SUN8 fixed through the truck)
  far: 24, // far roofs, gasholders, viaduct beyond the bend
  south: 60, // the south bank across the canal, receding
  water: 110, // the canal wedge (its near edge moves with the path)
  house: MAP.S8.truck.housePlaneDx, // 160: her house at the bend, W, her door, the lane's house side
  lampsFar: 140,
  ghosts: MAP.S8.truck.ghostPlaneDx, // 240
  board: MAP.S8.truck.boardPlaneDx, // 250: her board, Pip's bollard, the readers, the cafe owner
  boat: 270, // the cafe boat (moored left, at the board's depth and nearer)
  near: 320, // the stern deck, the planter, the near lamp-post (bottom third)
} as const;
export type PlaneId = keyof typeof PLANE_DX;

/** A plane's screen offset at scene time t (px; negative before the landing). */
export const planeDx = (dx: number, t: number) => -dx * (1 - camC(t));
export const planeOffset = (p: PlaneId, t: number) => planeDx(PLANE_DX[p], t);

/** Ground plane shear: the lane's paving is one receding plane, so its offset grows with nearness. y = screen y of a
 *  ground point (VP y 948 = far, 1920 = near). Returns the dx in px at time t. */
export const groundDxAtY = (y: number, t: number) => {
  const k = clamp((y - 948) / (1920 - 948));
  const dx = PLANE_DX.far + (PLANE_DX.near - PLANE_DX.far) * k;
  return planeDx(dx, t);
};

/** The seam push (zoom about W), 1.00 -> 1.05 over 37.70-38.82, ease in-out, held after. */
export const SEAM_ZOOM = 1.05;
export const seamZoom = (t: number) => {
  const p = prog(t, S8T.pushT0, S8T.pushT1 - S8T.pushT0);
  return 1 + (SEAM_ZOOM - 1) * p * p * (3 - 2 * p);
};
/** Landing-pose screen point -> on-screen point under the seam push. */
export const pushPt = (x: number, y: number, t: number): [number, number] => {
  const z = seamZoom(t);
  return [MAP.W.x + (x - MAP.W.x) * z, MAP.W.y + (y - MAP.W.y) * z];
};

/** Pip's seam target: S1's f0 bollard on screen at S1's zoom 1.05 about W = (692, 1261.75). */
export const S1_F0_PIP = {x: MAP.W.x + (MAP.S1_BOLLARD.x - MAP.W.x) * SEAM_ZOOM, y: MAP.W.y + (MAP.S1_BOLLARD.y - MAP.W.y) * SEAM_ZOOM};
