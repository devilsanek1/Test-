// V2S6_pip.tsx (lane L5): Pip in S6 (TREATMENT section 3: on the fence's tall corner post right of the deal board,
// watching the service door; ONE ear flick on "veto", no droop; >= 200 px from the clause; never in the band or rail).
//   -0.17 .. 0.12  it arrives mid-leap from S5 (the cut on action, 24.00): at the cut it is at (694, 714) moving right
//                  with a small rise (apex 707 at 0.05), lands on the post's cap (770, 720) at 0.12 with a squash.
//   0.12 .. 3.83   sits watching the door (the far plane, converted to the mid plane every frame), following the staff
//                  member who comes out ~2.5 and goes back in; 2.50 "veto": ear A flicks (its ONE reaction).
//   3.83 .. 3.95   crouch; 3.95 take-off: from here to the cut it is drawn in SCREEN space on V2S7_pip's pipHopAt
//                  (one path both shots evaluate), pose blending to the leap, side-on (facing left).
// The idle never flicks on its own (idle={{flick: false}}): the only flick is the scripted one.
import React from 'react';
import {useTime} from '../../lib/time';
import {useExit} from '../../lib/exit';
import {useInkScale} from '../../lib/inkComp';
import {PipDrawing, trackAt, poseParams, blendParams, applyIdle, defaultInk, FACING, type PipTrackProps} from '../kit/pip';

type V2 = [number, number];
import {pipHopAt, PIP_HOP, PIP_SIZE_S6} from './V2S7_pip';
import {T0, W6, DRIFT, PIP_SEAT, dxOf, doorAt} from './V2S6_rig';
import {staffHeadAt} from './V2S6_life';

export const PIP_HOP_T = PIP_HOP.t0 - T0; // 3.95
const CROUCH_T = PIP_HOP_T - 0.12;
const SEED = 's6pip';
const SIZE = PIP_SIZE_S6;

/** Where Pip looks (MID-plane coords): the service door's threshold, or the staff member who steps out. */
const lookAt = (t: number): V2 => {
  const md = dxOf(DRIFT.mid, t);
  const d = doorAt(t);
  const door: V2 = [(d.x0 + d.x1) / 2 - md, d.y0 + 52];
  const s = staffHeadAt(t);
  if (!s) return door;
  return [s[0] - md, s[1] + 10];
};

/** The arrival arc, solved so the cut frame shows Pip mid-leap at (694, 719) moving right, topping out at 717.8
 *  (0.047) and landing on the cap at 0.12. It stays this low on purpose: Pip's airborne silhouette (head + tuft) is
 *  ~117 px above its feet, so feet >= 717 keep it below the band margin (y >= 600), and feet <= 720 keep it >= 200 px
 *  from the clause (top y 920). Take-off (-0.28, behind the board) is never drawn. */
const ARRIVE = {from: [516.7, 760.5] as V2, t0: -0.28, dur: 0.4, height: 16};

export const S6_PIP_TRACK: PipTrackProps = {
  x: ARRIVE.from[0],
  y: ARRIVE.from[1],
  size: SIZE,
  pose: 'sit',
  facing: 'back',
  seed: SEED,
  idle: {flick: false},
  keys: [
    {t: ARRIVE.t0, hop: {to: [PIP_SEAT.x, PIP_SEAT.y], dur: ARRIVE.dur, height: ARRIVE.height, style: 'leap', land: 0.22}},
    {t: 0.0, wind: 0.5, dur: 0.4},
    {t: 0.16, target: lookAt},
    {t: W6.veto, flick: 'A'},
    {t: CROUCH_T, pose: 'crouch', dur: 0.12},
  ],
};

const smooth = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};

/** Pip on the corner post, in MID-plane coordinates (put it in the gate's `pip` slot). Gone from the take-off on. */
export const S6PipOnPost: React.FC = () => {
  const t = useTime();
  const exit = useExit();
  const inkScale = useInkScale();
  if (t >= PIP_HOP_T) return null;
  const st = trackAt(S6_PIP_TRACK, t);
  // the wind-up: a squash into the crouch before the take-off (the track blends the crouch pose)
  const wind = smooth((t - CROUCH_T) / 0.12) * 0.14;
  return <PipDrawing x={st.x} y={st.y} size={SIZE} params={st.params} squash={st.squash + wind} rotate={st.rotate} draw={st.draw} exit={exit} paint="colour" inkPx={defaultInk(SIZE) * inkScale} seed={SEED} />;
};

/** Pip's take-off into the S6 -> S7 hop, in SCREEN space (draw it above the whole set). The path is V2S7_pip's
 *  pipHopAt (a level launch off the cap at y 720: the clause and the band margin both hold). The pose blends from the
 *  crouch to S7's first-frame pose (the tuck, facing the watcher's 3/4 back, wind -0.7), so the cut hands over; the
 *  squash goes from the crouch to 0 (never a stretch: the head + tuft stay at y >= 600). */
export const S6PipHop: React.FC = () => {
  const t = useTime();
  const exit = useExit();
  const inkScale = useInkScale();
  if (t < PIP_HOP_T) return null;
  const T = T0 + t;
  const h = pipHopAt(T);
  if (!h || h.side !== 'V2S6') return null;
  const kCut = (PIP_HOP.tCut - PIP_HOP.t0) / (PIP_HOP.t1 - PIP_HOP.t0);
  const kh = (T - PIP_HOP.t0) / (PIP_HOP.t1 - PIP_HOP.t0);
  const base = trackAt(S6_PIP_TRACK, PIP_HOP_T - 1e-3).params;
  const air = smooth(Math.min(1, kh / (kCut * 0.75)));
  const tuck = {...poseParams('tuck'), yaw: FACING.back, wind: -0.7};
  const params = applyIdle(blendParams(base, tuck, air), t, SEED, {flick: false, amount: 0.6});
  const squash = 0.14 * (1 - smooth(kh / kCut));
  return <PipDrawing x={h.x} y={h.y} size={SIZE} params={params} squash={squash} exit={exit} paint="colour" inkPx={defaultInk(SIZE) * inkScale} seed={SEED} />;
};
