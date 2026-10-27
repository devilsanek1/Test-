// V2S2_Board (lane L2): the newsstand's A-board TOLD THE BBC (TREATMENT §5 S2 "Texts on objects"; map S2.aBoard face
// x 160-560, y 1050-1250) and the newsagent who slides it out from behind the kiosk at 8.44 (the wood clack). A
// stand-in for K3's StatementBoard (lane L5) with the same anatomy: plum stiles and rails, a paper face with a plum
// keyline, legs to the paving, a ground shadow; lettering from K3 (`WorldText`, `TYPE`, `TXT_TOLD_THE_BBC`), words
// unchanged, the body re-broken to the 400 px face. Times are FILM seconds (the scene wraps it in <TimeShift by={-6.1}>).
// REQUEST (report): swap to L5's ToldTheBBCBoard when it lands.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import {useTime, clamp, ease} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {WorldText, TYPE, textW} from '../kit/boards/WorldText';
import {TXT_TOLD_THE_BBC} from '../kit/boards/texts';
import {Person} from '../kit/cast';
import {useCaptionFont} from '../../lib/font';
import * as MAP from '../world/map';

const F = MAP.S2.aBoard;
const STILE = 22;
const RAIL = 16;
/** Ground line under the board (the legs' feet). */
export const BOARD_GROUND = 1298;
/** Slide: from behind the kiosk (dx -360) to its spot, 8.44 -> 8.74, a 3 % overshoot that settles by 8.86. */
export const boardDx = (t: number): number => {
  const t0 = MAP.S2.aBoardOutAt;
  if (t < t0 - 0.18) return -380;
  if (t < t0) return -380 + 20 * ease.outCubic(clamp((t - (t0 - 0.18)) / 0.18)); // the newsagent takes hold
  const u = clamp((t - t0) / 0.3);
  const settle = t > t0 + 0.3 ? 9 * Math.exp(-(t - t0 - 0.3) * 18) * Math.cos((t - t0 - 0.3) * 40) : 0;
  return -360 * (1 - ease.outCubic(u)) + (u >= 1 ? settle : 0);
};

/** Greedy wrap of the board body to the face width (the words exactly as texts.ts has them). */
function wrap(words: string[], size: number, maxW: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && textW(next, size) > maxW) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

const BoardFace: React.FC = () => {
  useCaptionFont();
  const x0 = F.x0;
  const x1 = F.x1;
  const y0 = F.y0;
  const y1 = F.y1;
  const cx = (x0 + x1) / 2;
  const body = wrap(TXT_TOLD_THE_BBC.body.join(' ').split(' '), TYPE.bodySmall, x1 - x0 - 2 * STILE - 30);
  const ink = useMemo(
    () =>
      [
        line(x0 - STILE, y0 - RAIL, x0 - STILE + 4, BOARD_GROUND, {seed: 'abL', over: 'small'}),
        line(x1 + STILE, y0 - RAIL, x1 + STILE - 4, BOARD_GROUND, {seed: 'abR', over: 'small'}),
        line(x0 - STILE - 6, y0 - RAIL, x1 + STILE + 8, y0 - RAIL + 1, {seed: 'abT', over: 'small'}),
        line(x0 - 4, y1 + RAIL, x1 + 10, y1 + RAIL, {seed: 'abB', over: 'small'}),
      ].join(''),
    [x0, x1, y0, y1],
  );
  const lead = 32;
  const bodyTop = 1148;
  return (
    <>
      {/* the ground shadow (colour, never grey), cast right by the low west sun */}
      <Fill d={`M${x0 - STILE},${BOARD_GROUND}L${x1 + STILE},${BOARD_GROUND}L${x1 + STILE + 150},${BOARD_GROUND + 26}L${x0 - STILE + 110},${BOARD_GROUND + 30}Z`} color={CM.stoneShade} offset={false} seed="abShadow" />
      {/* the back leg pair peeking under the face (an A-frame) */}
      <Fill d={`M${x0 - STILE + 30},${y1 + RAIL}L${x0 - STILE + 44},${y1 + RAIL}L${x0 - STILE + 60},${BOARD_GROUND - 10}L${x0 - STILE + 46},${BOARD_GROUND - 10}Z`} color={CM.brickDeep} seed="abBackL" />
      <Fill d={`M${x1 + STILE - 44},${y1 + RAIL}L${x1 + STILE - 30},${y1 + RAIL}L${x1 + STILE - 46},${BOARD_GROUND - 10}L${x1 + STILE - 60},${BOARD_GROUND - 10}Z`} color={CM.brickDeep} seed="abBackR" />
      {/* the frame: stiles to the paving, rails, the paper face, a plum keyline */}
      <Fill rect={[x0 - STILE, y0 - RAIL, STILE, BOARD_GROUND - (y0 - RAIL)]} color={CM.anchor} seed="abStL" />
      <Fill rect={[x1, y0 - RAIL, STILE, BOARD_GROUND - (y0 - RAIL)]} color={CM.anchor} seed="abStR" />
      <Fill rect={[x0, y0 - RAIL, x1 - x0, RAIL]} color={CM.anchor} seed="abRailT" />
      <Fill rect={[x0, y1, x1 - x0, RAIL]} color={CM.anchor} seed="abRailB" />
      <Fill rect={[x0, y0, x1 - x0, y1 - y0]} color={CM.paper} offset={false} seed="abFace" />
      <Ink d={`M${x0 + 8},${y0 + 8}H${x1 - 8}V${y1 - 8}H${x0 + 8}Z`} width={INK_PX.hair} color={CM.anchor} seed="abKey" />
      {/* two brass screws on the top rail, the stiles' feet capped */}
      <Fill d={`M${x0 + 18},${y0 - RAIL / 2}m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`} color={CM.coatMustard} offset={false} seed="abS1" />
      <Fill d={`M${x1 - 18},${y0 - RAIL / 2}m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`} color={CM.coatMustard} offset={false} seed="abS2" />
      <Ink d={ink} width={INK_PX.mid} seed="abInk" />
      {/* lettering (K3): header 56 (read at 216 px), body 30, credit 20 (read at ~390 px) */}
      <WorldText x={cx} y={1104} size={TYPE.key} text={TXT_TOLD_THE_BBC.header} anchor="middle" weight={0.9} seed="abH" />
      <Ink d={line(cx - 130, 1118, cx + 132, 1117, {seed: 'abRule', over: 'small'})} width={INK_PX.far} color={CM.anchor} seed="abRuleI" />
      {body.map((l, i) => (
        <WorldText key={i} x={cx} y={bodyTop + i * lead} size={TYPE.bodySmall} text={l} anchor="middle" seed={`abB${i}`} />
      ))}
      <WorldText x={cx} y={y1 - 14} size={TYPE.creditLarge} text={TXT_TOLD_THE_BBC.credit} anchor="middle" color={CM.shadeWarm} seed="abC" />
    </>
  );
};

/** The newsagent: stands at the kiosk's corner (a back in 3/4), takes hold of the board 8.26, pushes it out 8.44-8.74,
 *  lets go and turns back to the counter 9.10 (re-stacking papers). Never over the lettering (x <= 150). */
const Newsagent: React.FC = () => {
  const t = useTime();
  const t0 = MAP.S2.aBoardOutAt;
  const pushing = t >= t0 - 0.18 && t < t0 + 0.62;
  const x = 112 + (pushing ? 18 * ease.outCubic(clamp((t - t0) / 0.3)) : t >= t0 + 0.62 ? 18 - 18 * ease.inOutCubic(clamp((t - t0 - 0.62) / 0.4)) : 0);
  const h = 262;
  const y = 1296;
  if (pushing) {
    const reachX = -(18 + 26 * ease.outCubic(clamp((t - t0) / 0.3)));
    return <Person x={x} y={y} h={h} seed="s2agent" pose="reach" view="profile" flip reach={[-reachX, -h * 0.55]} traits={{coat: CM.coatPlum, acc: 'none'}} />;
  }
  // idle: re-stacking papers at the counter (a small reach in and out every ~1.4 s)
  const k = 0.5 + 0.5 * Math.sin((t - 6.1) * 4.4);
  return <Person x={x} y={y} h={h} seed="s2agent" pose="reach" view="back" reach={[-34 - 10 * k, -h * (0.5 + 0.06 * k)]} traits={{coat: CM.coatPlum, acc: 'none'}} />;
};

/** Board + newsagent, drawn BEFORE the kiosk (V2S2_Set's aBoard slot): the board slides out from behind it. */
export const S2Board: React.FC = () => {
  const t = useTime();
  const dx = boardDx(t);
  return (
    <>
      <XG m={mat.translate(dx, 0)}>
        <BoardFace />
      </XG>
    </>
  );
};

/** The newsagent is drawn AFTER the kiosk (he stands in front of its corner). */
export const S2Newsagent = Newsagent;
