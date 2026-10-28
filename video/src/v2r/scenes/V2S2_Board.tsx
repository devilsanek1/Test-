// V2S2_Board (lane L2): the newsstand's A-board TOLD THE BBC (TREATMENT §5 S2 "Texts on objects"; map S2.aBoard face
// x 110-510, y 1050-1250) and the newsagent who shoves it out from behind the kiosk (the wood clack
// 8.44). The board is K3's `ToldTheBBCBoard` (L5): its frame, face, lettering and ground shadow; tier B while it rests
// behind the kiosk, A on its beat only, 8.42-9.60 (the shove, "But Google's", until the BBC beat has played: the critic
// 2026-10-28, it owned the eye to the match as the biggest, brightest A), then B again; its shadow only once it moves.
// Times are FILM seconds (the scene wraps it in <TimeShift by={-6.1}>).
//   at rest it is wholly hidden behind the kiosk (its back wedge's foot at x 95 < the kiosk's 104: no plum stile beside
//   the newsagent before the shove).
//   the move: the shove starts it at 8.42; a sine push-and-slide (quarter-sine in over 0.11 s while the hand is on the
//   stile, quarter-cosine out over 0.41 s) lands 3 px past its spot at 8.94 and rocks back by 8.985 (the same timing;
//   453 px now: peak 22.8 px/f at 8.53, while only its stile and blank margin are out; the lettering clears the
//   newsagent at ~22 px/f and is under 15 px/f from 8.75), as the five light clicks start (8.96-9.12).
//   the newsagent: back -> 3/4 -> profile in 3 drawings at 12/s (7.70-7.92, on "contract", well before Pip's "But"
//   swivel 8.28-8.44: never two turns at once), holds in profile with his hand on the board's edge at the kiosk's
//   corner (no wind-up), then a 2-drawing shove with a lean (8.42 push / 8.50 follow-through) with the hand ON the
//   right stile while it is in reach, recovers (8.62 / 8.74), then steps back and turns back in 3 drawings (9.05 /
//   9.15 / 9.25); idle = 3 drawn re-stacking poses at 7/s in bursts (no sine-driven arm).
import React from 'react';
import {CM} from '../palette';
import {useTime, clamp} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {ToldTheBBCBoard, S2_LEGS_Y1, boardDy} from '../kit/boards/StatementBoard';
import {Person} from '../kit/cast';
import type {View} from '../kit/cast';
import * as MAP from '../world/map';

/** The board face = the map rect S2.aBoard (x 110-510: since 2026-10-28 the map holds this lane's 50 px shift left of
 *  the treatment's 160-560, the former BOARD_SHIFT): K3's frame (26 px stiles) ends at x 536, a clear gap left of Pip's
 *  seat (Pip's lower body starts at x ~560: no tangent, Pip never reads as perched on the board). Its left stile hides
 *  behind the kiosk; at rest the whole board hides behind the kiosk (BOARD_DX0). */
const F = MAP.S2.aBoard;
/** K3's small frame (ToldTheBBCBoard's defaults). */
const STILE = 26;
/** Ground line under the board (the legs' feet: K3's S2_LEGS_Y1). */
export const BOARD_GROUND = S2_LEGS_Y1;
/** The board's resting offset: wholly behind the kiosk (x <= 104): the frame's right stile ends at x 536 and its back
 *  wedge's foot at 545 (K3 boardFrame: side 0.36 x the 26 px stile), so at -450 its rightmost pixel is x 95. */
export const BOARD_DX0 = -450;
/** The board is the beat's subject (tier A) from the shove to here, then support (B). */
export const BOARD_SUBJECT = {t0: 8.42, t1: 9.6};
const SHOVE_T0 = 8.42;
const RISE = 0.11;
const FALL = 0.41;
const OVER = 3;
const SETTLE = 0.045;

/** Board x offset at film time t: rest behind the kiosk, the shove (sine in), the slide (cosine out) 4 px past its
 *  spot, a rock back to 0 by 8.98. */
export const boardDx = (t: number): number => {
  if (t <= SHOVE_T0) return BOARD_DX0;
  const D = -BOARD_DX0 + OVER;
  const vmax = (D * Math.PI) / (2 * (RISE + FALL));
  const tau = t - SHOVE_T0;
  if (tau <= RISE) return BOARD_DX0 + vmax * ((2 * RISE) / Math.PI) * (1 - Math.cos((Math.PI * tau) / (2 * RISE)));
  if (tau <= RISE + FALL) return BOARD_DX0 + vmax * ((2 * RISE) / Math.PI) + vmax * ((2 * FALL) / Math.PI) * Math.sin((Math.PI * (tau - RISE)) / (2 * FALL));
  const u = clamp((tau - RISE - FALL) / SETTLE);
  return OVER * (0.5 + 0.5 * Math.cos(Math.PI * u));
};

/** The right stile's outer edge x at time t (the newsagent's hand). */
export const boardRightStileX = (t: number) => F.x1 + STILE + boardDx(t);

// ---------------------------------------------------------------- the newsagent

const AGENT_X = 112;
/** The hand's leftmost spot: the board's edge at the kiosk's corner (x 104). */
const HAND_MIN_X = 100;
const AGENT_Y = 1296;
const AGENT_H = 250;
const AGENT_TRAITS = {coat: CM.coatPlum, acc: 'none' as const};

type AgentDrawing = {view: View; flip: boolean; pose: 'stand' | 'reach'; dx: number; lean: number; turn?: number; reach?: [number, number] | 'stile'; elbow?: [number, number]};

/** Re-stacking at the counter (back view, the hand on the kiosk's paper stacks): 3 drawn poses. */
const RESTACK: [number, number][] = [
  [-36, -128],
  [-48, -140],
  [-30, -120],
];

/** The newsagent's drawing at film time t. */
export function agentAt(t: number): AgentDrawing {
  const back = (k: number): AgentDrawing => ({view: 'back', flip: false, pose: 'reach', dx: 0, lean: 0, reach: RESTACK[k]});
  // idle bursts: re-stack at 7 drawings/s for 0.86 s, then a 0.6 s hold on the first pose
  const idle = (t0: number): AgentDrawing => {
    const cyc = 1.46;
    const u = (((t - t0) % cyc) + cyc) % cyc;
    if (u > 0.86) return back(0);
    const f = Math.floor(u * 7);
    return back([0, 1, 2, 1, 0, 2][f % 6]);
  };
  if (t < 7.7) return idle(6.1);
  // the turn (on "contract", before Pip's "But" swivel): back (head turned) -> 3/4 -> profile, 3 drawings at 12/s
  if (t < 7.78) return {view: 'back', flip: false, pose: 'stand', dx: 0, lean: 0, turn: 0.6};
  if (t < 7.86) return {view: 'rear34', flip: true, pose: 'stand', dx: 2, lean: 0};
  if (t < 7.92) return {view: 'profile', flip: true, pose: 'stand', dx: 4, lean: 0};
  // the hold: in profile, his hand on the board's edge at the kiosk's corner, upright (no wind-up)
  if (t < 8.42) return {view: 'profile', flip: true, pose: 'reach', dx: 6, lean: 0, reach: 'stile', elbow: [-22, -132]};
  // the shove: push, follow-through
  if (t < 8.5) return {view: 'profile', flip: true, pose: 'reach', dx: 12, lean: 5, reach: 'stile'};
  if (t < 8.62) return {view: 'profile', flip: true, pose: 'reach', dx: 16, lean: 9, reach: 'stile'};
  // recover (watching it land), upright
  if (t < 8.74) return {view: 'profile', flip: true, pose: 'reach', dx: 16, lean: 4, reach: [-62, -138]};
  if (t < 9.05) return {view: 'profile', flip: true, pose: 'stand', dx: 16, lean: 0};
  // step back and turn back: 3 drawings
  if (t < 9.15) return {view: 'profile', flip: true, pose: 'stand', dx: 8, lean: -1.5};
  if (t < 9.25) return {view: 'rear34', flip: true, pose: 'stand', dx: 3, lean: 0};
  return idle(9.25);
}

/** The newsagent at the kiosk's corner (drawn after the kiosk). Never over the lettering (his hand only on the stile). */
const Newsagent: React.FC = () => {
  const t = useTime();
  const d = agentAt(t);
  const fx = AGENT_X + d.dx;
  const fy = AGENT_Y;
  let reach: [number, number] | undefined;
  if (d.pose === 'reach') {
    if (d.reach === 'stile') {
      // the hand on the right stile's face (screen), mapped into the leaning, flipped figure's local frame; at full
      // stretch it lets go (the board slides on). While the stile is still behind the kiosk the hand grips the board's
      // edge at the kiosk's corner (never reaching back into the kiosk)
      const sx = Math.min(Math.max(boardRightStileX(t) - 10, HAND_MIN_X), fx + 118);
      const sy = 1150 + boardDy(t, undefined, MAP.S2.aBoardOutAt);
      const th = (-d.lean * Math.PI) / 180;
      const vx = sx - fx;
      const vy = sy - fy;
      const rx = vx * Math.cos(th) - vy * Math.sin(th);
      const ry = vx * Math.sin(th) + vy * Math.cos(th);
      reach = [d.flip ? -rx : rx, ry];
    } else reach = d.reach;
  }
  return (
    <XG m={mat.about(mat.rotate(d.lean), fx, fy)}>
      <Person x={fx} y={fy} h={AGENT_H} exact seed="s2agent" pose={d.pose} view={d.view} flip={d.flip} turn={d.turn} reach={reach} elbow={d.elbow} traits={AGENT_TRAITS} />
    </XG>
  );
};

/** Board + newsagent, drawn BEFORE the kiosk (V2S2_Set's aBoard slot): the board slides out from behind it. */
export const S2Board: React.FC = () => {
  const t = useTime();
  const dx = boardDx(t);
  return (
    <XG m={mat.translate(dx, 0)}>
      <ToldTheBBCBoard
        face={F}
        legsTo={BOARD_GROUND}
        clackAt={MAP.S2.aBoardOutAt}
        shadow={t < SHOVE_T0 ? false : undefined}
        tier={t >= BOARD_SUBJECT.t0 && t < BOARD_SUBJECT.t1 ? 'subject' : 'support'}
        seed="s2bbc"
      />
    </XG>
  );
};

/** The newsagent is drawn AFTER the kiosk (he stands in front of its corner). */
export const S2Newsagent = Newsagent;
