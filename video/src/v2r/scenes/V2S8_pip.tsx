// V2S8 Pip (lane L6). First pass by the L6 orchestrator (builder D may refine it; keep the seam maths).
// TREATMENT section 3 (S8): Pip rides the wiping narrowboat in, hops to the board bollard 33.20, ears down on "can't"
// 33.78 (its ONE reaction), rides the truck on the bollard, sit-watch at her board (S7's pose, A5: facing 'backLeft'),
// looks up at W on "not" 37.70, hops onto S1's f0 bollard on the un-build.
// THE SEAM: every Pip here is drawn on S1's clock (TimeShift by S1_SHIFT) with S1's seed 'pipS1', size and default
// idle, so its idle (blink, ears, breath, scarf) runs continuously into V2S1's frame-0 Pip (V2S1_pip.tsx S1Pip, which
// draws nothing at t < 0). The last hop is our own small arc (no PipTrack hop: its landing squash and ear flop would
// still be playing at the seam), ending in the exact base pose S1 starts from: sit, facing back, look 0.
// Coordinates: Pip draws in LANDING coords inside V2S8's seam push (so at 1.05 it shares S1's frame-0 space); before
// the landing it rides the board plane (XG translate by planeOffset('board', t)).
import React from 'react';
import {NoExit} from '../../lib/exit';
import {TimeShift, useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {PipTrack, type PipKey} from '../kit/pip';
import {
  S8T,
  L,
  PIP_ENTRY,
  PIP_SEAT,
  PIP_SIZE,
  PIP_SEAM,
  PIP_BOARD_FACING,
  S1_PIP,
  S1_SHIFT,
  herAt,
  planeOffset,
  wiperX,
} from './V2S8_clock';

/** S8 scene s -> S1 s (the clock every Pip here runs on). */
const s1 = (t: number) => t - S1_SHIFT;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const mix = (a: [number, number], b: [number, number], u: number): [number, number] => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

/** Shared Pip props (S1's frame-0 Pip: size, seed, default idle). */
const PIP = {size: PIP_SIZE, seed: S1_PIP.seed} as const;

// ---------------------------------------------------------------- the gaze (board-plane landing coords)

const HEAD: [number, number] = [PIP_SEAT.x, PIP_SEAT.y - PIP_SIZE * 0.74];
/** A screen point at scene t -> board-plane landing coords (Pip's own space before the landing). */
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
  if (t < L(38.4)) return W_AT;
  if (t < L(38.6)) return mix(W_AT, HEAD, seg(38.4, 38.6));
  return HEAD;
}

// ---------------------------------------------------------------- the three stretches

/** The stern deck point at take-off (screen) and in board-plane landing coords. */
const T_HOP = S8T.pipHop;
const STERN_AT_HOP: [number, number] = [wiperX(T_HOP) + PIP_ENTRY.sternDx, PIP_ENTRY.deckY];
const STERN_LANDING: [number, number] = toBoard(STERN_AT_HOP, T_HOP);
/** The seam hop: our own arc from the board bollard down onto S1's f0 bollard (landing coords). */
const SEAM = {t0: PIP_SEAM.t0, t1: PIP_SEAM.t0 + 0.14, apex: PIP_SEAM.height} as const;
const T_SEAM_TRACK = SEAM.t0 - 0.06;

/** The main track's keys (S1 clock). */
const MAIN_KEYS: PipKey[] = [
  {t: s1(T_HOP), hop: {to: [PIP_SEAT.x, PIP_SEAT.y], dur: S8T.pipLands - T_HOP, style: 'leap', height: 70, crouch: 0.001}},
  {t: s1(S8T.pipLands), facing: 'back', dur: 0.3},
  {t: s1(S8T.pipLands + 0.04), target: (tt: number) => pipGaze(tt + S1_SHIFT)},
  {t: s1(S8T.cant), pose: 'earsDown', dur: 0.12},
  {t: s1(L(35.1)), pose: 'sit', dur: 0.3},
  {t: s1(L(35.62)), facing: PIP_BOARD_FACING, dur: 0.35},
  {t: s1(S8T.not), pose: 'lookUp', dur: 0.2},
  {t: s1(L(38.4)), pose: 'sit', look: 0, lookUp: 0, facing: 'back', dur: 0.3},
  {t: s1(L(38.62)), target: null},
];

/** 32.97-33.00: on the passing boat's stern deck (S8 shows through the open stern; never drawn in the rail). */
const PipRide: React.FC<{t: number}> = ({t}) => {
  const x = wiperX(t) + PIP_ENTRY.sternDx;
  if (x > 780) return null;
  return (
    <TimeShift by={S1_SHIFT}>
      <PipTrack x={x} y={PIP_ENTRY.deckY} {...PIP} facing="left" keys={[]} />
    </TimeShift>
  );
};

/** 33.00-38.76: the leap, the bollard, the truck, her board, W. Rides the board plane. */
const PipMain: React.FC<{t: number}> = ({t}) => (
  <XG m={mat.translate(planeOffset('board', t), 0)}>
    <TimeShift by={S1_SHIFT}>
      <PipTrack x={STERN_LANDING[0]} y={STERN_LANDING[1]} {...PIP} facing="left" keys={MAIN_KEYS} />
    </TimeShift>
  </XG>
);

/** 38.76-end: the seam hop onto S1's f0 bollard; ends in S1's exact frame-0 state. */
const PipSeam: React.FC<{t: number}> = ({t}) => {
  const k = Math.max(0, Math.min(1, (t - SEAM.t0) / (SEAM.t1 - SEAM.t0)));
  const x = PIP_SEAT.x + (S1_PIP.x - PIP_SEAT.x) * k;
  const y = PIP_SEAT.y + (S1_PIP.y - PIP_SEAT.y) * k - SEAM.apex * 4 * k * (1 - k);
  return (
    <TimeShift by={S1_SHIFT}>
      <PipTrack
        x={x}
        y={y}
        {...PIP}
        facing="back"
        keys={[
          {t: s1(SEAM.t0), pose: 'tuck', dur: 0.04},
          // 'tuck' sets lookUp 0.15 and 'sit' defines none: reset it, or the last frame looks up and S1's f0 does not
          {t: s1(SEAM.t1 - 0.01), pose: 'sit', look: 0, lookUp: 0, dur: 0.1},
        ]}
      />
    </TimeShift>
  );
};

export const S8Pip: React.FC = () => {
  const t = useTime();
  if (t < S8T.pipOnStern) return null;
  return (
    <NoExit>
      {t < T_HOP ? <PipRide t={t} /> : t < T_SEAM_TRACK ? <PipMain t={t} /> : <PipSeam t={t} />}
    </NoExit>
  );
};
