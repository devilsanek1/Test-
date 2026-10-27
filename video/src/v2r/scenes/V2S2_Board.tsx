// V2S2_Board (lane L2): the newsstand's A-board TOLD THE BBC (TREATMENT §5 S2 "Texts on objects"; map S2.aBoard face
// x 160-560, y 1050-1250) and the newsagent who shoves it out from behind the kiosk (the wood clack 8.44). A stand-in
// for K3's StatementBoard with the same anatomy: plum stiles and rails round a paper face with a plum keyline, brick
// legs to the paving, a ground shadow; lettering from K3 (`WorldText`, `TXT_TOLD_THE_BBC`), words unchanged, the body
// on exactly three lines (the quote whole). Times are FILM seconds (the scene wraps it in <TimeShift by={-6.1}>).
//   the move: the shove starts it at 8.42; a sine push-and-slide (quarter-sine in over 0.11 s while the hand is on the
//   stile, quarter-cosine out over 0.41 s) lands 3 px past its spot at 8.94 and rocks back by 8.985 (peak 19.1 px/f),
//   as the five light clicks start (8.96-9.12).
//   the newsagent: back -> 3/4 -> profile in 3 drawings at 12/s (8.12-8.28), a 3-drawing shove with a lean
//   (8.34 wind-up / 8.42 push / 8.50 follow-through) with the hand ON the right stile while it is in reach, recovers
//   (8.62 / 8.74), then steps back and turns back in 3 drawings (9.05 / 9.15 / 9.25); idle = 3 drawn re-stacking
//   poses at 7/s in bursts (no sine-driven arm).
// REQUEST (report): swap to L5's ToldTheBBCBoard when it lands.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import {useTime, clamp} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {WorldText, TYPE} from '../kit/boards/WorldText';
import {TXT_TOLD_THE_BBC} from '../kit/boards/texts';
import {Person} from '../kit/cast';
import type {View} from '../kit/cast';
import {useCaptionFont} from '../../lib/font';
import * as MAP from '../world/map';

/** The board face shifted this far left of the map rect (Pip's seat clearance; the left stile stays at x >= 126).
 *  Its lettering hides behind the kiosk (x <= 124) and the newsagent at rest (BOARD_DX0). */
export const BOARD_SHIFT = -8;
const F = {x0: MAP.S2.aBoard.x0 + BOARD_SHIFT, y0: MAP.S2.aBoard.y0, x1: MAP.S2.aBoard.x1 + BOARD_SHIFT, y1: MAP.S2.aBoard.y1};
const STILE = 22;
const RAIL = 16;
/** Ground line under the board (the legs' feet). */
export const BOARD_GROUND = 1298;
/** The board's resting offset behind the kiosk (its lettering hidden) and its move. */
export const BOARD_DX0 = -376;
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

/** The body on exactly three lines: the words of texts.ts, the quote whole. */
const BODY_LINES: string[] = (() => {
  const w = TXT_TOLD_THE_BBC.body[0].split(' ');
  return [w.slice(0, 3).join(' '), w.slice(3).join(' '), TXT_TOLD_THE_BBC.body[1]];
})();
/** Baselines (the 1.06 push about W2 keeps the credit at y <= 1250 at the cut: 1220 -> 1248). */
const Y_HEADER = 1099;
const Y_RULE = 1111;
const Y_BODY = [1141, 1170, 1199];
const Y_CREDIT = 1222;

const BoardFace: React.FC = () => {
  useCaptionFont();
  const {x0, x1, y0, y1} = F;
  const cx = (x0 + x1) / 2;
  const ink = useMemo(
    () =>
      [
        line(x0 - STILE, y0 - RAIL, x0 - STILE + 2, y1 + RAIL + 2, {seed: 'abL', over: 'small'}),
        line(x1 + STILE, y0 - RAIL, x1 + STILE - 2, y1 + RAIL + 2, {seed: 'abR', over: 'small'}),
        line(x0 - STILE - 6, y0 - RAIL, x1 + STILE + 8, y0 - RAIL + 1, {seed: 'abT', over: 'small'}),
        line(x0 - 4, y1 + RAIL, x1 + 10, y1 + RAIL, {seed: 'abB', over: 'small'}),
        // the front legs (brick, below the face's bottom rail): one line each, open at the foot
        line(x0 - STILE + 3, y1 + RAIL + 2, x0 - STILE + 6, BOARD_GROUND - 2, {seed: 'abLL', over: 'small'}),
        line(x1 + STILE - 3, y1 + RAIL + 2, x1 + STILE - 6, BOARD_GROUND - 2, {seed: 'abRL', over: 'small'}),
      ].join(''),
    [x0, x1, y0, y1],
  );
  const legTop = y1 + RAIL;
  return (
    <>
      {/* the ground shadow (colour, never grey), cast right by the low west sun */}
      <Fill d={`M${x0 - STILE},${BOARD_GROUND}L${x1 + STILE},${BOARD_GROUND}L${x1 + STILE + 150},${BOARD_GROUND + 26}L${x0 - STILE + 110},${BOARD_GROUND + 30}Z`} color={CM.stoneShade} offset={false} seed="abShadow" />
      {/* the back leg pair peeking under the face (an A-frame) */}
      <Fill d={`M${x0 - STILE + 30},${legTop}L${x0 - STILE + 44},${legTop}L${x0 - STILE + 60},${BOARD_GROUND - 10}L${x0 - STILE + 46},${BOARD_GROUND - 10}Z`} color={CM.brickDeep} seed="abBackL" />
      <Fill d={`M${x1 + STILE - 44},${legTop}L${x1 + STILE - 30},${legTop}L${x1 + STILE - 46},${BOARD_GROUND - 10}L${x1 + STILE - 60},${BOARD_GROUND - 10}Z`} color={CM.brickDeep} seed="abBackR" />
      {/* the front legs below the bottom rail: brick (the plum stays on the face's frame: dark budget) */}
      <Fill rect={[x0 - STILE + 1, legTop, STILE - 4, BOARD_GROUND - legTop]} color={CM.brickDeep} seed="abLegL" />
      <Fill rect={[x1 + 3, legTop, STILE - 4, BOARD_GROUND - legTop]} color={CM.brickDeep} seed="abLegR" />
      {/* the frame: plum stiles and rails round the face only */}
      <Fill rect={[x0 - STILE, y0 - RAIL, STILE, y1 + RAIL - (y0 - RAIL)]} color={CM.anchor} seed="abStL" />
      <Fill rect={[x1, y0 - RAIL, STILE, y1 + RAIL - (y0 - RAIL)]} color={CM.anchor} seed="abStR" />
      <Fill rect={[x0, y0 - RAIL, x1 - x0, RAIL]} color={CM.anchor} seed="abRailT" />
      <Fill rect={[x0, y1, x1 - x0, RAIL]} color={CM.anchor} seed="abRailB" />
      <Fill rect={[x0, y0, x1 - x0, y1 - y0]} color={CM.paper} offset={false} seed="abFace" />
      <Ink d={`M${x0 + 8},${y0 + 8}H${x1 - 8}V${y1 - 8}H${x0 + 8}Z`} width={INK_PX.hair} color={CM.anchor} seed="abKey" />
      {/* two brass screws on the top rail */}
      <Fill d={`M${x0 + 18},${y0 - RAIL / 2}m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`} color={CM.coatMustard} offset={false} seed="abS1" />
      <Fill d={`M${x1 - 18},${y0 - RAIL / 2}m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`} color={CM.coatMustard} offset={false} seed="abS2" />
      <Ink d={ink} width={INK_PX.mid} seed="abInk" />
      {/* lettering (K3): header 56 (read at 216 px), a rule, body 30 on three lines, credit 21 in ink */}
      <WorldText x={cx} y={Y_HEADER} size={TYPE.key} text={TXT_TOLD_THE_BBC.header} anchor="middle" weight={0.9} seed="abH" />
      <Ink d={line(cx - 136, Y_RULE, cx + 138, Y_RULE - 1, {seed: 'abRule', over: 'small'})} width={INK_PX.far} color={CM.anchor} seed="abRuleI" />
      {BODY_LINES.map((l, i) => (
        <WorldText key={i} x={cx} y={Y_BODY[i]} size={TYPE.bodySmall} text={l} anchor="middle" seed={`abB${i}`} />
      ))}
      <WorldText x={cx} y={Y_CREDIT} size={21} text={TXT_TOLD_THE_BBC.credit} anchor="middle" color={CM.ink} seed="abC" />
    </>
  );
};

// ---------------------------------------------------------------- the newsagent

const AGENT_X = 112;
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
  if (t < 8.12) return idle(6.1);
  // the turn: back (head turned) -> 3/4 -> profile, 3 drawings at 12/s
  if (t < 8.2) return {view: 'back', flip: false, pose: 'stand', dx: 0, lean: 0, turn: 0.6};
  if (t < 8.28) return {view: 'rear34', flip: true, pose: 'stand', dx: 2, lean: 0};
  if (t < 8.34) return {view: 'profile', flip: true, pose: 'stand', dx: 4, lean: 0};
  // the shove: wind-up (hand on the stile, a lean back), push, follow-through
  if (t < 8.42) return {view: 'profile', flip: true, pose: 'reach', dx: 6, lean: -2.5, reach: 'stile', elbow: [-22, -132]};
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
      // stretch it lets go (the board slides on)
      const sx = Math.min(boardRightStileX(t) - 10, fx + 118);
      const sy = 1150;
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
      <BoardFace />
    </XG>
  );
};

/** The newsagent is drawn AFTER the kiosk (he stands in front of its corner). */
export const S2Newsagent = Newsagent;
