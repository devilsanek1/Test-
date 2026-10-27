// V2S8 "Her words" (lane L6): the shot's ONE clock and camera contract, shared by every V2S8_*.tsx part.
// Scene-local seconds: t = film - 32.93 (BUILD.md scene contract). Film times from TREATMENT.md section 5 (row S8),
// map.ts S8, the heard word onsets (public/v2r/voice_words_heard.json).
//
// CAMERA (decided by L6):
//   - pre-truck float: every plane drifts right by 10 % of its truck dx, linear from the wipe start (the board plane at
//     ~8.6 px/s, the near plane ~11 px/s: the 8-12 px/s float), multiplied into the truck so the speed is continuous;
//   - ONE plain truck 34.99-35.60 (ease in-out, inside the speech pause): planes shift right by their dx
//     (map S8.truck: board 250, ghosts 240, house 160, sky 0) and land EXACTLY on the landing pose (board at B, W at
//     (860, 700)) with zero speed; locked 35.60-37.70 (the quote reads on a still board);
//   - the seam push: 1.00 -> 1.05 about W (860, 700), 37.70 -> 38.82, ease in-out (zero speed both ends), then held
//     through the un-build 38.82-39.08, so W is 157.5 x 178.5 at (860, 700) = S1's frame 0 (zoom 1.05 about W), and
//     S1's ease-in pull-out starts from rest: the seam has no speed step.
//   - MULTIPLANE: every part draws at the LANDING pose (screen px = map px at 35.60) and shifts by its plane's
//     offset. The lane's ground is THREE RIGID BANDS split by horizontal edges (a horizontal edge sliding along itself
//     is invisible): the house band (forecourt setts, y < KERB_Y) rides the house plane, the towpath flagstones
//     (KERB_Y..NEAR_Y) ride the board plane, the near paving (>= NEAR_Y) the near plane. Nothing long and receding may
//     cross a band edge, except the canal coping, whose house / board break (y = KERB_Y, x 333) stays behind the board
//     at every frame. An object standing on the ground rides the band under its feet.
//   - GHOSTS (decision): they pop on "can't" ahead of her on the towpath, LEFT of her door (pre-truck x 418-494 on the
//     240 px plane), and the truck slides them in front of her SHUT door (x 658-734): the claim still stands at her
//     door. They glide 80 px relative to the house during the truck (the map's plane, kept on purpose).
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
  pipOnStern: L(32.97), // Pip first shows on the passing boat's stern deck (S8 shows through the open stern)
  pipHop: L(33.0), // Pip leaps off the boat's stern
  pipLands: L(33.2), // on the pre-truck board bollard (450, 1205)
  cant: L(33.78), // "can't": three ghosts pop ahead of her, Pip's ears down
  criticize: L(34.04),
  herAtDoor: L(34.5), // she reaches her door step, hand to the door (goIn)
  doorOpen: L(34.52), // her door starts to swing in
  herIn: L(34.68), // she is through the door (no longer drawn)
  doorShuts: L(34.75), // latch: the door shuts behind her, the ghosts stay
  wLights: L(34.95), // her window W lights (lamp click): the picture S3 showed
  truckT0: L(MAP.S8.truck.t0), // 34.99
  truckT1: L(MAP.S8.truck.t1), // 35.60
  but: L(35.45),
  herWords: L(35.72), // "her words": the cafe owner wipes the board clean in ONE stroke
  wipeDur: 0.42,
  herInWindow: L(35.85), // her silhouette comes to W, phone at her ear (S3's picture, caught up with)
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

/** Truck progress c(t): 0 before 34.99 (the map's pre-truck pose), 1 at the landing (35.60) with zero speed. The old
 *  parallax float (a % of each plane's dx) is OFF: STYLE.md's float law forbids parallax and a heading held for seconds;
 *  the float is now `floatXY` (one 2D translation of the whole picture). */
export const FLOAT_K = 0;
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
  water: 110, // the canal (drawn wide: the towpath bands cover its near edge)
  lampsFar: 140, // (spare) lamps beyond the bend
  house: MAP.S8.truck.housePlaneDx, // 160: her house at the bend, W, her door, the forecourt band, her walk home
  ghosts: MAP.S8.truck.ghostPlaneDx, // 240
  board: MAP.S8.truck.boardPlaneDx, // 250: the towpath band, her board, Pip's bollard, the cafe owner, the readers
  boat: MAP.S8.truck.boardPlaneDx, // 250: the cafe boat, moored at the board band's coping (moves with it)
  near: 320, // the near band: the cafe deck, the planter, the near lamp-post (bottom third)
} as const;
export type PlaneId = keyof typeof PLANE_DX;

/** A plane's screen offset at scene time t (px; negative before the landing). */
export const planeDx = (dx: number, t: number) => -dx * (1 - camC(t));
export const planeOffset = (p: PlaneId, t: number) => planeDx(PLANE_DX[p], t);

/** THE FLOAT (STYLE.md section 6, the float law): translation only, the whole picture together (no parallax), eased straight
 *  legs turning every 0.6-1.5 s, 8-15 px/s (peak <= 25), net within +-12 px of home, and back home (0) when a move starts
 *  (the truck 34.99, the un-build 38.82) so every K2 spot is exact. Two runs: the wipe -> the truck; the landing -> the un-build.
 *  Keys: [scene t, dx, dy]. */
export const FLOAT_KEYS: [number, number, number][][] = [
  [[L(32.7), 0, 0], [L(33.55), 9, -4], [L(34.3), 2, 5], [L(34.99), 0, 0]],
  [[L(35.6), 0, 0], [L(36.4), -8, -3], [L(37.15), -1, 5], [L(38.0), 7, 1], [L(38.82), 0, 0]],
];
export const floatXY = (t: number): [number, number] => {
  for (const run of FLOAT_KEYS) {
    if (t < run[0][0] || t > run[run.length - 1][0]) continue;
    for (let i = 0; i < run.length - 1; i++) {
      const [t0, x0, y0] = run[i];
      const [t1, x1, y1] = run[i + 1];
      if (t <= t1) {
        const u = (t - t0) / (t1 - t0);
        const e = u * u * (3 - 2 * u);
        return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e];
      }
    }
  }
  return [0, 0];
};

// ---------------------------------------------------------------- the lane (landing-pose geometry)

/** The lane looking west, at the landing pose. */
export const LANE = {
  /** Vanishing point of the lane (the bend), on the horizon. */
  vp: {x: 600, y: 948},
  horizonY: 948,
  /** Her house front's ground line (her door sill, the terrace's ground). */
  houseGround: 1060,
  /** Band edges (horizontal): house band < KERB_Y <= board band < NEAR_Y <= near band. */
  kerbY: 1100,
  nearY: 1340,
  /** The canal coping: a straight line from (0, copingY0) to the VP; the canal is above / left of it. Its break
   *  between the house and board bands is at (copingX(kerbY), kerbY) = (333, 1100): always behind the board. */
  copingY0: 1290,
} as const;
export const KERB_Y = LANE.kerbY;
export const NEAR_Y = LANE.nearY;
/** Coping y at screen x (landing pose); coping x at y. */
export const copingY = (x: number) => LANE.copingY0 + (LANE.vp.y - LANE.copingY0) * (x / LANE.vp.x);
export const copingX = (y: number) => (LANE.vp.x * (LANE.copingY0 - y)) / (LANE.copingY0 - LANE.vp.y);
export type Band = 'house' | 'board' | 'near';
/** The ground band at a landing-pose y. */
export const bandOfY = (y: number): Band => (y < LANE.kerbY ? 'house' : y < LANE.nearY ? 'board' : 'near');
/** Screen offset of a ground point (or anything standing on it) at landing-pose y. */
export const groundOffset = (y: number, t: number) => planeOffset(bandOfY(y), t);

// ---------------------------------------------------------------- her walk home (house-plane coords)

/** Her walk home, keyed in HOUSE-PLANE landing coords (screen x = x + planeOffset('house', t)): she moves with the
 *  house she walks to (the board band drifts ~4 px from her over 2 s: invisible). Back view, ~1.6 steps/s.
 *  [scene t, feet x, feet y, height]. Pre-truck screen x ~ x - 150. */
export const HER_KEYS: [number, number, number, number][] = [
  [L(32.7), 828, 1162, 166],
  [L(33.16), 810, 1140, 163],
  [L(33.78), 772, 1103, 157],
  [L(34.5), 732, 1066, 151], // at her door step (door centre 725 in house coords)
  [L(34.68), 728, 1060, 149], // through the doorway (hidden by the closing leaf from here)
];
const lerpN = (a: number, b: number, u: number) => a + (b - a) * u;
/** Her feet + height at t (house-plane landing coords), or null once she is inside. */
export const herAt = (t: number): {x: number; y: number; h: number} | null => {
  if (t >= S8T.herIn) return null;
  const k = HER_KEYS;
  if (t <= k[0][0]) return {x: k[0][1], y: k[0][2], h: k[0][3]};
  for (let i = 0; i < k.length - 1; i++) {
    if (t <= k[i + 1][0]) {
      const u = (t - k[i][0]) / (k[i + 1][0] - k[i][0]);
      return {x: lerpN(k[i][1], k[i + 1][1], u), y: lerpN(k[i][2], k[i + 1][2], u), h: lerpN(k[i][3], k[i + 1][3], u)};
    }
  }
  const e = k[k.length - 1];
  return {x: e[1], y: e[2], h: e[3]};
};
/** Her step count (back view, 1.6 steps/s while walking; the last step lands on the door step at 34.50). */
export const herStep = (t: number) => 1.6 * (Math.min(t, S8T.herAtDoor) - S8T.wipeT0);

/** Her door's swing 0 (shut) .. 1 (open into the hall): opens 34.52-34.60, holds, swings shut 34.66-34.75 (latch). */
export const doorOpenK = (t: number) => {
  const smooth = (u: number) => u * u * (3 - 2 * u);
  if (t < S8T.doorOpen) return 0;
  if (t < L(34.6)) return smooth(prog(t, S8T.doorOpen, L(34.6) - S8T.doorOpen));
  if (t < L(34.66)) return 1;
  return 1 - smooth(prog(t, L(34.66), S8T.doorShuts - L(34.66)));
};

// ---------------------------------------------------------------- Pip

/** S7's narrowboat wiper (canal kit BoatWiper, half 630, hull half-length 590): its centre on screen at scene t
 *  (Film's wipeEdgeX for dir 'left', 32.70-33.16). S8 shows only RIGHT of this x while the wipe runs. */
export const WIPER = {half: 630, hullHalf: 590, sternDeckY: 1652, t0: S8T.wipeT0, dur: 0.46} as const;
export const wiperX = (t: number) => {
  const p = clamp((t - WIPER.t0) / WIPER.dur);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * p);
  const x = -WIPER.half - 30 + (1080 + 2 * WIPER.half + 60) * e;
  return 1080 - x;
};
/** Pip's entry: sits on the passing boat's stern deck (screen x = wiperX + 545, feet on the deck y 1648) from 32.97
 *  (only where S8 shows: x <= 780, never the rail), leaps at 33.00 and lands on the pre-truck board bollard 33.20.
 *  S7's band-safe wiper (L5, V2S7_wiper.tsx S7_WIPER: boatInto 1180 x 980, water 2020, half 630) draws NO Pip; its
 *  gunwale top is at y ~1652 and its stern end at wiperX + 590 (~578 at 33.00). */
export const PIP_ENTRY = {sternDx: 545, deckY: 1648, size: 100} as const;
/** Pip at a board bollard (S7 and S8 alike, A5; L5's S7 pose): 'sit', facing 'backLeft' (3/4 back, toward the board),
 *  size 100, idle {flick: false}. */
export const PIP_BOARD_FACING = 'backLeft' as const;
/** Pip's board bollard (top centre = Pip's seat) in BOARD-PLANE landing coords. */
export const PIP_SEAT = {x: MAP.BOARD_BOLLARD.x, y: MAP.BOARD_BOLLARD.y} as const;
/** Pip's size at the board bollard: S7's PIP_SIZE_S7 (A5: the same Pip pose at both boards). */
export const PIP_SIZE = 100;
/** Pip's seam SETTLE (conform_L6 §1, THROUGHLINE §3: a 30 px step down, no hop): 38.82 -> 38.98 from the board
 *  bollard (700, 1205) onto S1's f0 bollard (700, 1235), zoom 1.00; it un-builds with the shot (late), so the loop lands
 *  on S1's frame 0, where S1's own Pip draws on from t 0 (V2S1_clock S1_F0: absent at t < 0). */
export const PIP_SEAM = {t0: S8T.unbuildT0, land: L(38.98), to: {x: MAP.S1_BOLLARD.x, y: MAP.S1_BOLLARD.y}, height: 0} as const;
/** S1's clock relative to S8's: S1 time = S8 time - S1_SHIFT (the loop underlay runs at film T - 2345 / 60). */
export const S1_SHIFT = 2345 / 60 - S8_START;
/** S1's frame-0 Pip, mirrored from V2S1_pip.tsx `S1Pip` (L1; it draws nothing at t < 0): from PIP_SEAM.land on, S8 draws THIS Pip on S1's clock
 *  (TimeShift by S1_SHIFT) inside the 1.05 push, so the last S8 frame and S1's frame 0 hold the identical Pip. */
export const S1_PIP = {x: MAP.S1_BOLLARD.x, y: MAP.S1_BOLLARD.y, size: 100, facing: 'back' as const, seed: 'pipS1'};

/** Pip's seat on screen (pre-truck = map (450, 1205); landing = BOARD_BOLLARD) at t. */
export const pipSeatAt = (t: number) => ({x: PIP_SEAT.x + planeOffset('board', t), y: PIP_SEAT.y});

// ---------------------------------------------------------------- the lamp run on "facts" (37.18)

/** ONE run, near -> far ("west down the lane"), everything alike (Q9 c: no item singled out; the board never lights),
 *  FLASH-SAFE (STYLE / THROUGHLINE: <= 3 switch-ons in any 1 s): four lamps, 0.34 s apart, each switching on ONCE and
 *  laying its pool (two flat steps). Every other light (the carriage lamps, the festoons, the cafe boat's lights, the
 *  far windows) is already on at sunset: `lampRunAt` gives them -10 (on from the start). */
export const LAMP_RUN_STEP = 0.34;
export const LAMP_RUN_ORDER = ['nearPool', 'houseLamp', 'canalLamp1', 'canalLamp2'] as const;
export type LampRunId = (typeof LAMP_RUN_ORDER)[number] | 'carriageR' | 'festoon' | 'carriageL' | 'boatLights' | 'farWindows';
export const lampRunAt = (id: LampRunId): number => {
  const i = (LAMP_RUN_ORDER as readonly string[]).indexOf(id);
  return i < 0 ? -10 : S8T.facts + LAMP_RUN_STEP * i;
};

// ---------------------------------------------------------------- ground (the paving profile, for the sets)

/** Ground plane shear (kept for old callers): use groundOffset(y, t) for the rigid bands. */
export const groundDxAtY = (y: number, t: number) => groundOffset(y, t);

/** The seam push is RETIRED (conform_L6 §1: S1 opens at zoom 1.00, so W (860, 700) 150 x 170 already IS S1's frame-0
 *  window). Kept as a constant 1.00 so old callers stay exact. */
export const SEAM_ZOOM = 1.0;
export const seamZoom = (t: number) => {
  const p = prog(t, S8T.pushT0, S8T.pushT1 - S8T.pushT0);
  return 1 + (SEAM_ZOOM - 1) * p * p * (3 - 2 * p);
};
/** Landing-pose screen point -> on-screen point under the seam push. */
export const pushPt = (x: number, y: number, t: number): [number, number] => {
  const z = seamZoom(t);
  return [MAP.W.x + (x - MAP.W.x) * z, MAP.W.y + (y - MAP.W.y) * z];
};

/** Pip's seam target: S1's f0 bollard on screen (zoom 1.00: (700, 1235)). */
export const S1_F0_PIP = {x: MAP.W.x + (MAP.S1_BOLLARD.x - MAP.W.x) * SEAM_ZOOM, y: MAP.W.y + (MAP.S1_BOLLARD.y - MAP.W.y) * SEAM_ZOOM};

/** Nothing drawn above this landing-pose y (so the 1.05 push about W keeps every built top at screen y >= 600). */
export const SKYLINE_MIN_Y = 606;
/** Smoke, steam and flyers stay below this screen y (the band margin y 290-600 stays flat sky). */
export const LIFE_CEIL = 602;
