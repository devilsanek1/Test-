// V2S8 board (lane L6; conform_L6 §3, §4, §8). Everything here rides the BOARD plane (V2S8_depth S8Plane 'board').
// HER BOARD: lane L5's ONE StatementBoard face at B (the same face, type, light, pen and clack as Google's board in
// S7, A5), filled with K3's herContent (TXT_HER: SHE SAYS / "talking about facts / is not criticising" / the credit).
//   33.16 SHE SAYS pops with the clack · a HALF-WIPED menu (a band of smudges left only across the face's lower-left,
//   where the cafe owner's squeegee rides) · 35.72 the ONE stroke (L5's ragged wipe edge; the squeegee's blade rides it
//   across the smudges) · 36.54 the credit pops and the quote pens on (36.54-37.10 / 37.20-37.70). Tier: support until
//   the wipe, then the SUBJECT (its A outline pops on with the stroke, 35.72: THROUGHLINE §4 S8).
// THE CAFE OWNER (tier B: a small figure in an apron, rear 3/4, no face): stands just LEFT of the board at its depth,
// between the board and the cafe boat (feet (66, 1258), 210 px: never in front of the face), a long-handled squeegee in
// both hands; it slides in with the truck (the board plane), rests the blade on the face's lower-left, wipes the ONE
// stroke 35.72 (the blade on L5's wipe edge across the smudges), lowers it and stays, watching her words go up.
// PIP'S BOLLARD: a squat cast-iron mooring bollard (slate, tier C: never the plum anchor), its top Pip's seat (700, 1205).
// No readers (conform_L6 §3: strangers' backs reading a board from the foreground are v3's retired S4 model).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {FormShade} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {clamp, ease, useTime} from '../../lib/time';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {StatementBoard, B_GEOM, herContent, herWipe, HER_T, wipeEdgeX} from '../kit/boards';
import {CAFE_OWNER, Person} from '../kit/cast';
import {PIP_SEAT, S8T} from './V2S8_clock';
import {S8Plane} from './V2S8_depth';

// ---------------------------------------------------------------- her board

/** The smudged remains of the cafe's menu: one band across the face's lower-left (the rest was wiped earlier: "half-
 *  wiped"), exactly the swath the squeegee's blade rides, clear of the quote and the credit. */
const SMUDGES: MAP.Rect = {x0: 194, y0: 1034, x1: 392, y1: 1142};
/** The ONE stroke (L5's wipe: a ragged edge crossing the face left -> right; it erases only where smudges are). */
const WIPE = herWipe({t0: 0, wipeAt: S8T.herWords, wipeDur: HER_T.wipeDur, wipeDir: 'right'});
const CONTENT = herContent(
  B_GEOM,
  {header: S8T.she, quote1: [S8T.quotePen, S8T.quoteLine1End], quote2: [S8T.quoteLine2, S8T.quoteLine2End], credit: S8T.quotePen},
  1,
);
/** The board's tier: support (B) until the wipe, then the subject (A): the outline pops on with the stroke. */
export const boardIsSubject = (t: number) => t >= S8T.herWords;

const HerBoardS8: React.FC<{t: number}> = ({t}) => (
  <Tier tier={boardIsSubject(t) ? 'subject' : 'support'}>
    <StatementBoard face={MAP.B} legsTo={MAP.B_LEGS_Y1} clackAt={S8T.she} lines={CONTENT.lines} rules={CONTENT.rules} smudges={SMUDGES} wipe={WIPE} shadow={false} seed="her" />
  </Tier>
);

// ---------------------------------------------------------------- Pip's bollard

/** A squat cast-iron mooring bollard (slate, waisted, a rounded cap a touch wider than the body): its TOP is Pip's seat. */
export const S8_BOLLARD = {x: PIP_SEAT.x, top: PIP_SEAT.y, foot: 1302, w: 54} as const;
export const S8_BOLLARD_BODY = (() => {
  const {x, top, foot, w} = S8_BOLLARD;
  const bw = w * 0.42;
  const nw = w * 0.32;
  return `M${x - bw} ${foot}L${x - nw} ${top + 22}Q${x - nw} ${top + 13} ${x - w * 0.44} ${top + 10}L${x + w * 0.44} ${top + 10}Q${x + nw} ${top + 13} ${x + nw} ${top + 22}L${x + bw} ${foot}Z`;
})();
export const S8_BOLLARD_CAP = (() => {
  const {x, top, w} = S8_BOLLARD;
  const hw = w / 2;
  return `M${x - hw} ${top + 10}Q${x - hw} ${top} ${x} ${top}Q${x + hw} ${top} ${x + hw} ${top + 10}Z`;
})();
const Bollard: React.FC = () => (
  <>
    <Tier tier="environment">
      <Fill d={S8_BOLLARD_BODY} color={CM.coatSlate} seed="s8bollardBody" />
      <Fill d={S8_BOLLARD_CAP} color={CM.coatSlate} seed="s8bollardCap" />
    </Tier>
    <FormShade d={S8_BOLLARD_BODY} kind="band" />
  </>
);

// ---------------------------------------------------------------- the cafe owner and the squeegee

/** Feet (board-plane landing coords), height: just left of the board's frame (outer x 110), at its depth. */
export const OWNER = {x: 66, y: 1258, h: 210} as const;
/** The blade: its centre rides the wipe edge at this height (the smudge band's middle), 108 px tall (the band's height). */
const BLADE = {y: (SMUDGES.y0 + SMUDGES.y1) / 2, h: SMUDGES.y1 - SMUDGES.y0 + 2, w: 9} as const;
/** The blade's x before, during and after the stroke: at rest on the face's lower-left, on the edge across the smudges,
 *  then lowered to lean on the board's left leg. */
const REST: [number, number] = [SMUDGES.x0 + 6, BLADE.y];
const END_X = SMUDGES.x1 + 16;
const LOWER = {dur: 0.32} as const;
const DOWN: [number, number] = [150, 1236];
/** When the edge passes END_X at the blade's height (scene s). */
const STROKE_END = (() => {
  for (let i = 0; i <= 200; i++) {
    const tt = WIPE.at + (i / 200) * (WIPE.dur ?? HER_T.wipeDur);
    const x = wipeEdgeX(MAP.B, WIPE, tt, BLADE.y);
    if (x !== null && x >= END_X) return tt;
  }
  return WIPE.at + HER_T.wipeDur;
})();
/** The blade's centre at t (board-plane coords). */
export const bladeAt = (t: number): [number, number] => {
  if (t < WIPE.at) return REST;
  if (t < STROKE_END) {
    const x = wipeEdgeX(MAP.B, WIPE, t, BLADE.y);
    return [clamp(x ?? REST[0], REST[0], END_X), BLADE.y];
  }
  const u = ease.inOutCubic(clamp((t - STROKE_END) / LOWER.dur));
  return [END_X + (DOWN[0] - END_X) * u, BLADE.y + (DOWN[1] - BLADE.y) * u];
};
/** His front hand on the pole (screen-relative to the feet): chest height, following the blade a little. */
const handAt = (blade: [number, number]): [number, number] => {
  const lowered = clamp((blade[1] - BLADE.y) / (DOWN[1] - BLADE.y));
  return [30 + (blade[0] - REST[0]) * 0.08, -OWNER.h * (0.56 - 0.1 * lowered)];
};

const Squeegee: React.FC<{blade: [number, number]; hand: [number, number]}> = ({blade, hand}) => {
  const hx = OWNER.x + hand[0];
  const hy = OWNER.y + hand[1];
  const dx = blade[0] - hx;
  const dy = blade[1] - hy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // the pole: from its butt (behind the hand, by his hip) to the blade's holder; 6 px wide, pale aluminium
  const bx = hx - ux * 46;
  const by = hy - uy * 46;
  const nx = -uy * 3;
  const ny = ux * 3;
  const pole = `M${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)}L${(blade[0] - ux * 7 + nx).toFixed(1)} ${(blade[1] - uy * 7 + ny).toFixed(1)}L${(blade[0] - ux * 7 - nx).toFixed(1)} ${(blade[1] - uy * 7 - ny).toFixed(1)}L${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)}Z`;
  // the head: a holder bar and the rubber blade, upright (it wipes left -> right across the face)
  const hh = BLADE.h / 2;
  const holder = `M${(blade[0] - 9).toFixed(1)} ${(blade[1] - hh + 4).toFixed(1)}h7v${(BLADE.h - 8).toFixed(1)}h-7Z`;
  const rubber = `M${(blade[0] - 2).toFixed(1)} ${(blade[1] - hh).toFixed(1)}h${BLADE.w}v${BLADE.h}h-${BLADE.w}Z`;
  return (
    <>
      <Fill d={pole} color={CM.stoneShade} offset={false} seed="s8squeegeePole" />
      <Fill d={holder} color={CM.coatSlate} offset={false} seed="s8squeegeeHolder" />
      <Fill d={rubber} color={CM.anchor} offset={false} seed="s8squeegeeBlade" />
    </>
  );
};

const CafeOwnerS8: React.FC<{t: number}> = ({t}) => {
  const blade = bladeAt(t);
  const hand = handAt(blade);
  // the drawn frame faces LEFT; flipped, he faces the board (right): the reach is mirrored into the drawn frame
  const reach: [number, number] = [-hand[0], hand[1]];
  return (
    <Tier tier="support">
      <Person x={OWNER.x} y={OWNER.y} h={OWNER.h} exact seed="s8owner" traits={CAFE_OWNER} model={CAFE_OWNER} pose="reach" view="rear34" flip reach={reach} />
      <Squeegee blade={blade} hand={hand} />
    </Tier>
  );
};

export const S8Board: React.FC = () => {
  const t = useTime();
  return (
    <S8Plane p="board">
      <HerBoardS8 t={t} />
      <Bollard />
      <CafeOwnerS8 t={t} />
    </S8Plane>
  );
};
