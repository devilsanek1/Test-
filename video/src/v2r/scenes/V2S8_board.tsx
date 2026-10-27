// V2S8 board (lane L6). First pass by the L6 orchestrator (builder C may refine it; keep the times and the face).
// HER BOARD: lane L5's ONE StatementBoard face at B (the same face, type, light, pen and clack as Google's board in
// S7, A5), filled with K3's herContent (TXT_HER: SHE SAYS / "talking about facts / is not criticising" / the credit).
//   33.16 SHE SAYS pops with the clack · a HALF-WIPED menu (the smudges left only in the lower-left of the face, where
//   the cafe owner's one stroke can reach) · 35.72 the ONE cloth stroke (L5's ragged wipe edge; the owner's cloth hand
//   rides it across the smudges) · 36.54 the credit pops and the quote pens on (36.54-37.10 / 37.20-37.70).
// THE CAFE OWNER (K4 CafeOwner, a small back in an apron with a cloth): beside the board when the truck lands, wipes,
// lowers the arm, steps back left and stays, watching. PIP'S BOLLARD: a cast-iron canal bollard whose top is Pip's
// seat (700, 1205). THE READERS: two neighbours walk in from the left and stop under the board on "facts" (37.18).
// Everything in S8Board rides the BOARD plane (planeOffset('board', t)); the readers come after the truck.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import {useTime, clamp} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {StatementBoard, B_GEOM, herContent, herWipe, HER_T} from '../kit/boards';
import {CafeOwner, CAFE_OWNER, Person, type TraitOverrides} from '../kit/cast';
import {L, PIP_SEAT, planeOffset, S8T} from './V2S8_clock';

// ---------------------------------------------------------------- her board

/** The smudged remains of the cafe's menu: only the face's lower-left (the rest was wiped earlier: "half-wiped"),
 *  inside the cafe owner's reach. */
const SMUDGES: MAP.Rect = {x0: 194, y0: 1004, x1: 392, y1: 1172};
/** The ONE stroke (L5's wipe: a ragged edge crossing the face left -> right; it erases only where smudges are). */
const WIPE = herWipe({t0: 0, wipeAt: S8T.herWords, wipeDur: HER_T.wipeDur, wipeDir: 'right'});
const CONTENT = herContent(
  B_GEOM,
  {header: S8T.she, quote1: [S8T.quotePen, S8T.quoteLine1End], quote2: [S8T.quoteLine2, S8T.quoteLine2End], credit: S8T.quotePen},
  1,
);

const HerBoardS8: React.FC = () => (
  <StatementBoard face={MAP.B} legsTo={MAP.B_LEGS_Y1} clackAt={S8T.she} lines={CONTENT.lines} rules={CONTENT.rules} smudges={SMUDGES} wipe={WIPE} seed="her" />
);

// ---------------------------------------------------------------- Pip's bollard

/** A cast-iron canal bollard (plum, a worn mustard band, a domed cap): its TOP is Pip's seat. */
const BOLLARD = {x: PIP_SEAT.x, top: PIP_SEAT.y, foot: 1302, wTop: 44, wFoot: 54};
const bollardBody = () => {
  const {x, top, foot, wTop, wFoot} = BOLLARD;
  return `M${x - wTop / 2} ${top + 6}L${x - wFoot / 2} ${foot}L${x + wFoot / 2} ${foot}L${x + wTop / 2} ${top + 6}Z`;
};
const bollardCap = () => {
  const {x, top, wTop} = BOLLARD;
  const r = wTop / 2 + 3;
  return `M${x - r} ${top + 8}Q${x - r} ${top - 6} ${x} ${top - 7}Q${x + r} ${top - 6} ${x + r} ${top + 8}Z`;
};
const Bollard: React.FC = () => {
  const {x, top, foot, wFoot} = BOLLARD;
  const band = top + 30;
  return (
    <>
      {/* its flat sunset shadow toward us (the low sun is ahead, west) */}
      <Fill d={`M${x - wFoot / 2} ${foot}L${x + wFoot / 2} ${foot}L${x + wFoot * 0.9} ${foot + 26}L${x - wFoot * 0.05} ${foot + 30}Z`} color={CM.stoneShade} offset={false} seed="s8bollardShadow" />
      <Fill d={bollardBody()} color={CM.anchor} seed="s8bollard" />
      <Fill d={`M${x - 24} ${band}L${x + 24} ${band}L${x + 24.6} ${band + 9}L${x - 24.6} ${band + 9}Z`} color={CM.coatMustard} offset={false} seed="s8bollardBand" />
      <Fill d={bollardCap()} color={CM.coatPlum} seed="s8bollardCap" />
      <Fill d={`M${x - wFoot / 2 - 6} ${foot - 8}L${x + wFoot / 2 + 6} ${foot - 8}L${x + wFoot / 2 + 6} ${foot + 2}L${x - wFoot / 2 - 6} ${foot + 2}Z`} color={CM.anchor} offset={false} seed="s8bollardFoot" />
      <Ink d={line(x - 22, top + 8, x - 27, foot - 8, {seed: 's8bol/l'}) + line(x + 25, top + 30, x + 27, foot - 10, {seed: 's8bol/r'})} width={INK_PX.mid} />
    </>
  );
};

// ---------------------------------------------------------------- the cafe owner

/** Feet during the wipe (landing coords) and after the step back. */
const OWNER = {x: 236, y: 1338, h: 284, xBack: 82} as const;
/** The cloth hand relative to the feet (the drawn frame faces left; back view): on the smudges' lower-left, then up
 *  across them with the wipe edge (L5's edge crosses x 190 at +0.094 s and x 380 at +0.175 s). */
const REACH_FROM: [number, number] = [-44, -188];
const REACH_TO: [number, number] = [146, -296];
const HAND_DOWN: [number, number] = [18, -112];
const STROKE = {at: S8T.herWords + 0.07, dur: 0.13} as const;
const DROP = {at: STROKE.at + STROKE.dur + 0.06, dur: 0.14} as const;
const WALK = {t0: L(36.12), t1: L(36.6)} as const;

const CafeOwnerS8: React.FC<{t: number}> = ({t}) => {
  if (t < L(34.6)) return null;
  if (t < DROP.at) return <CafeOwner x={OWNER.x} y={OWNER.y} h={OWNER.h} wipeAt={STROKE.at} wipeDur={STROKE.dur} reachFrom={REACH_FROM} reachTo={REACH_TO} seed="s8owner" />;
  if (t < WALK.t0) return <CafeOwner x={OWNER.x} y={OWNER.y} h={OWNER.h} wipeAt={DROP.at} wipeDur={DROP.dur} reachFrom={REACH_TO} reachTo={HAND_DOWN} seed="s8owner" />;
  if (t < WALK.t1) {
    const u = (t - WALK.t0) / (WALK.t1 - WALK.t0);
    const e = u * u * (3 - 2 * u);
    const x = OWNER.x + (OWNER.xBack - OWNER.x) * e;
    return <Person x={x} y={OWNER.y} h={OWNER.h} exact seed="s8owner" traits={CAFE_OWNER} model={CAFE_OWNER} pose="walk" view="profile" step={1.9 * (t - WALK.t0)} />;
  }
  // stays at the board's left, turned to it, watching her words go up
  return <Person x={OWNER.xBack} y={OWNER.y} h={OWNER.h} exact seed="s8owner" traits={CAFE_OWNER} model={CAFE_OWNER} pose="stand" view="rear34" flip tilt={-6} />;
};

export const S8Board: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(planeOffset('board', t), 0)}>
      <HerBoardS8 />
      <Bollard />
      <CafeOwnerS8 t={t} />
    </XG>
  );
};

// ---------------------------------------------------------------- the readers

type Reader = {seed: string; h: number; y: number; t0: number; x0: number; x1: number; traits: TraitOverrides};
/** Two neighbours (never teal, never her signature), walking in from the left along the cafe deck / near paving, stopping
 *  under the board's lower-left ON "facts" and turning up to read. */
const READERS: Reader[] = [
  {seed: 's8readerA', h: 270, y: 1506, t0: L(36.04), x0: -70, x1: 176, traits: {hair: 'cap', hairColor: CM.hair[3], hatColor: CM.coatSlate, coat: CM.coatOat, coatLen: 'jacket', acc: 'strap', accColor: CM.leafRust}},
  {seed: 's8readerB', h: 254, y: 1492, t0: L(35.96), x0: -70, x1: 266, traits: {hair: 'beanie', hairColor: CM.hair[2], hatColor: CM.leafRust, coat: CM.coatMustard, coatLen: 'mid', acc: 'tote', accColor: CM.coatOat}},
];

const ReaderFig: React.FC<{r: Reader; t: number}> = ({r, t}) => {
  if (t < r.t0) return null;
  const stop = S8T.facts;
  if (t < stop) {
    const u = (t - r.t0) / (stop - r.t0);
    // arriving: a last half-step slowing into the stop
    const e = u < 0.82 ? u / 0.91 : 0.9 + (1 - (1 - (u - 0.82) / 0.18) ** 2) * 0.1;
    const x = r.x0 + (r.x1 - r.x0) * Math.min(1, e);
    return <Person x={x} y={r.y} h={r.h} exact seed={r.seed} traits={r.traits} pose="walk" view="profile" flip step={1.7 * (t - r.t0)} />;
  }
  // stopped: turned to the board, heads up to read (a whole-head turn)
  const k = clamp((t - stop) / 0.12);
  return <Person x={r.x1} y={r.y} h={r.h} exact seed={r.seed} traits={r.traits} pose="stand" view="rear34" flip tilt={-10 * k} />;
};

export const S8Readers: React.FC = () => {
  const t = useTime();
  return (
    <>
      {READERS.map((r) => (
        <ReaderFig key={r.seed} r={r} t={t} />
      ))}
    </>
  );
};
