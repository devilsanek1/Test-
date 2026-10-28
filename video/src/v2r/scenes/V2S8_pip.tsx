// V2S8 Pip (lane L6; conform_L6 §1, §4; THROUGHLINE §3, §4). Tier B (the kit's support default, its tinted line).
// Pip rides the wiping narrowboat in (on its stern deck 32.97), steps off at 33.00 and lands on the board bollard 33.20,
// ears down on "can't" 33.78 (its ONE reaction), rides the truck on the bollard, sit-watches her board (S7's pose, A5:
// facing 'backLeft'), looks up at W on "not" 37.70 (a lead: W is the film's last picture), turns back to neutral by
// 38.70 (nothing turns in 38.72-39.08 but the un-build), and on the un-build SETTLES 30 px straight down onto S1's
// bollard (700, 1235) (no hop), then un-builds late with the shot: S1's own Pip is absent at t < 0 and draws on from
// frame 0 on that spot (V2S1_clock S1_F0), so the loop lands on S1's frame 0 with one Pip, never two.
// Coordinates: before the seam Pip rides the board plane (V2S8_depth S8Plane 'board': the truck and its float share);
// from 38.60 every plane is home, so its seam spot is screen = landing coords.
import React from 'react';
import {useTime} from '../../lib/time';
import {PipTrack, type PipKey} from '../kit/pip';
import {S8T, L, PIP_ENTRY, PIP_SEAT, PIP_SIZE, PIP_SEAM, PIP_BOARD_FACING, herAt, planeOffset, wiperX} from './V2S8_clock';
import {S8Plane} from './V2S8_depth';
import {LateExit} from './V2S8_exit';

const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const mix = (a: [number, number], b: [number, number], u: number): [number, number] => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

/** Shared Pip props: S7's board size (A5), one seed for every stretch (its idle runs on unbroken). */
const PIP = {size: PIP_SIZE, seed: 'pipS8'} as const;

// ---------------------------------------------------------------- the gaze (board-plane landing coords)

const HEAD: [number, number] = [PIP_SEAT.x, PIP_SEAT.y - PIP_SIZE * 0.74];
/** A screen point at scene t -> board-plane landing coords (Pip's own space before the landing; the house and the
 *  board share one depth plane, so the float cancels). */
const toBoard = (p: [number, number], t: number): [number, number] => [p[0] - planeOffset('board', t), p[1]];
const herHead = (t: number): [number, number] => {
  const h = herAt(Math.min(t, S8T.herIn - 1e-3));
  if (!h) return [725, 960];
  return toBoard([h.x + planeOffset('house', t), h.y - h.h * 0.92], t);
};
const herDoor = (t: number): [number, number] => toBoard([725 + planeOffset('house', t), 950], t);
const BOARD_C: [number, number] = [390, 1000];
/** The pen tip on her board (her quote's two lines, V2S8_board), pulled 35 % from the board centre (a quiet watch). */
const penTip = (t: number): [number, number] => {
  let p: [number, number];
  if (t < S8T.quoteLine1End) p = mix([190, 935], [590, 935], smooth((t - S8T.quotePen) / (S8T.quoteLine1End - S8T.quotePen)));
  else if (t < S8T.quoteLine2) p = mix([590, 935], [215, 1001], smooth((t - S8T.quoteLine1End) / (S8T.quoteLine2 - S8T.quoteLine1End)));
  else p = mix([215, 1001], [565, 1001], smooth((t - S8T.quoteLine2) / (S8T.quoteLine2End - S8T.quoteLine2)));
  return mix(BOARD_C, p, 0.35);
};
const WIPE_AT: [number, number] = [270, 1090];
const W_AT: [number, number] = [860, 700];

/** Where Pip looks, scene t -> board-plane landing coords. One continuous path (target switches would snap the head). */
export function pipGaze(t: number): [number, number] {
  const seg = (a: number, b: number) => smooth((t - L(a)) / (L(b) - L(a)));
  if (t < L(34.62)) return herHead(t);
  if (t < L(35.0)) return mix(herHead(L(34.62)), herDoor(t), seg(34.62, 35.0));
  if (t < L(35.62)) return herDoor(t);
  if (t < L(35.9)) return mix(herDoor(t), WIPE_AT, seg(35.62, 35.9));
  if (t < L(36.3)) return WIPE_AT;
  if (t < S8T.quotePen) return mix(WIPE_AT, penTip(S8T.quotePen), seg(36.3, 36.54));
  if (t < L(37.62)) return penTip(t);
  if (t < L(37.75)) return mix(penTip(L(37.62)), W_AT, seg(37.62, 37.75));
  if (t < L(38.35)) return W_AT;
  if (t < L(38.55)) return mix(W_AT, HEAD, seg(38.35, 38.55));
  return HEAD;
}

// ---------------------------------------------------------------- the three stretches

/** The stern deck point at take-off (screen) and in board-plane landing coords. */
const T_HOP = S8T.pipHop;
const STERN_AT_HOP: [number, number] = [wiperX(T_HOP) + PIP_ENTRY.sternDx, PIP_ENTRY.deckY];
const STERN_LANDING: [number, number] = toBoard(STERN_AT_HOP, T_HOP);

/** The main track's keys (scene s). Neutral (sit, facing back, look 0) by 38.70. */
const MAIN_KEYS: PipKey[] = [
  {t: T_HOP, hop: {to: [PIP_SEAT.x, PIP_SEAT.y], dur: S8T.pipLands - T_HOP, style: 'leap', height: 70, crouch: 0.001}},
  {t: S8T.pipLands, facing: 'back', dur: 0.3},
  {t: S8T.pipLands + 0.04, target: (tt: number) => pipGaze(tt)},
  {t: S8T.cant, pose: 'earsDown', dur: 0.12},
  {t: L(35.1), pose: 'sit', dur: 0.3},
  {t: L(35.62), facing: PIP_BOARD_FACING, dur: 0.35},
  {t: S8T.not, pose: 'lookUp', dur: 0.2},
  {t: L(38.35), pose: 'sit', look: 0, lookUp: 0, facing: 'back', dur: 0.3},
  {t: L(38.66), target: null},
];
/** The settle's own track: the pose MAIN ends in (sit, facing back, look 0), so the switch at 38.82 is seamless. */
const SEAM_KEYS: PipKey[] = [{t: 0, pose: 'sit', look: 0, lookUp: 0, dur: 0}];

/** 32.97-33.00: on the passing boat's stern deck (S8 shows through the open stern; never drawn in the rail). Screen
 *  space: the boat is S7's foreground wiper. */
const PipRide: React.FC<{t: number}> = ({t}) => {
  const x = wiperX(t) + PIP_ENTRY.sternDx;
  if (x > 780) return null;
  return <PipTrack x={x} y={PIP_ENTRY.deckY} {...PIP} facing="left" keys={[]} />;
};

/** 33.00-38.82: the leap, the bollard, the truck, her board, W. Rides the board plane. */
const PipMain: React.FC = () => (
  <S8Plane p="board">
    <PipTrack x={STERN_LANDING[0]} y={STERN_LANDING[1]} {...PIP} facing="left" keys={MAIN_KEYS} />
  </S8Plane>
);

/** 38.82-38.98: the settle, 30 px straight down onto S1's bollard (ease in-out), then held while it un-builds. */
const PipSeam: React.FC<{t: number}> = ({t}) => {
  const k = smooth((t - PIP_SEAM.t0) / (PIP_SEAM.land - PIP_SEAM.t0));
  const x = PIP_SEAT.x + (PIP_SEAM.to.x - PIP_SEAT.x) * k;
  const y = PIP_SEAT.y + (PIP_SEAM.to.y - PIP_SEAT.y) * k;
  return <PipTrack x={x} y={y} {...PIP} facing="back" keys={SEAM_KEYS} />;
};

export const S8Pip: React.FC = () => {
  const t = useTime();
  if (t < S8T.pipOnStern) return null;
  return <LateExit>{t < T_HOP ? <PipRide t={t} /> : t < PIP_SEAM.t0 ? <PipMain /> : <PipSeam t={t} />}</LateExit>;
};
