// S7 (lane L4-desk; G5b dense pass by lane S7-S8): CLOSE at your desk in the home base, 16.60-18.28 ("Mostly because
// your laptop runs on").
// Locked board (animatic S7, camera_plan_g3, storyboard_g3): slightly high (the kit laptop's 3/4 view from above);
// O1's room tone: the peach wall (the calm caption band) over the terracotta desk (back edge y 1000); O1's lamp, its
// shade cut by the left edge, lit; YOUR laptop (the old one: dark screen) centred on the desk, w 420, in the golden
// lamp pool (690 px wide, wider than the laptop, so it reads as light, not a mat). On "your" (17.24) the see-inside
// bubble pops upper right (board: centre 680, 728, r 112, above y 840; small element, so 0.10 s ahead of the word) and
// grows out of a spot on the keyboard; the memory stick (the kit stick, w 170) pops inside it a beat later. No window
// (saved for O1, S13 and S15).
// G5b (owner: "way too empty"; the approved pilot's bar): the desk world dressed to O1's level around the locked board
// (S7_desk.tsx: string lights, photos, a hanging pothos, a print, the pinboard, a wall shelf, the calendar, books, a
// candle, the mug, a speaker, headphones, biscuits, glasses, sticky notes, the charger into the laptop, a spiral
// notebook, letters, your phone face down, the planner; Pip on the desk watching, then whipping round to face us and
// up at the bubble, trunk up on "your"). Fix pass: S12's dusk-blue thermos, a dusk scarf across the front desk, the
// dusk clip dish and three dusk spines on the shelf (cozy v2 §4 cool share; the same desk as S12).
// cozy v2 (docs/v3/cozy_v2_application.md, OVERRIDES the g5b plan): the laptop's off screen in dcSide (plain dark,
// matched S7 / S8 / S12; the cool share); its glint slides across once (17.6).
// Camera: the FLOAT (cozy v2 §3, replaces the invisible 1.5 % breathe): translation only, 8-12 px/s legs that turn back
// within +-12 / +-10 px of home, ONE plan across S7 + S8 (S8 continues S7's last leg: `s7s8Float`); the captions and the
// UI stay fixed. Every set reaches >= 60 px past each frame edge.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, floatCam, Lamp, Laptop, laptopGeo, MemoryStick, quadPt} from '../kit';
import {S7Lens} from './S7_lens';
import {S12Thermos} from './S12_desk';
import {S7_LENS_AT, S7DeskBack, S7DeskFront, S7DeskMid, S7Grain, S7Mug, S7Pip, S7PullChain, S7WallLow, S7WallTop, ScreenGlint} from './S7_desk';

const START = 16.6;
const DUR = 18.28 - START;
/** "your" (17.24): the bubble, a small element, leads the word by 0.10 s. */
const LENS_AT = S7_LENS_AT;
/** The screen's glint slides across (17.6). */
const GLINT_AT = 17.6 - START;

/** The S7 + S8 float: one plan over both shots (S8 = S7's end + its own time), so the cut-in continues S7's last leg. */
export const S7S8_FLOAT = {dur: 19.4 - 16.6, seed: 's7s8/float'};
export const S7_DUR = DUR;
export const s7s8Float = (tAcross: number) => floatCam(tAcross, S7S8_FLOAT);

/** The desk's back edge (board y 1000); the wall above it is the calm caption band. */
const DESK_Y = 1000;
/** YOUR laptop: hinge centre and lid width (board icon x 330-750, lid top ~860; here ~876, so the lid's top edge
 *  stays clear of the bubble's rim instead of grazing it). */
const S7_LAP = {x: 540, y: 1145, w: 420};
/** The golden pool under it (board: centre 540, 640 px wide; camera plan 540-760). */
const POOL = {cx: 540, cy: 1232, rx: 345, ry: 122};
/** The see-inside bubble (board: centre 680, 728, r 112) and the stick inside it (board: w 170; 180 for the phone-size read). */
const LENS = {cx: 680, cy: 728, r: 112};
const STICK_W = 180;

const Desk: React.FC = () => (
  <>
    <Fill rect={[-80, DESK_Y, 1240, 1000]} color={EMBER.desk} offset={false} />
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's7/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(POOL.cx - 10, POOL.cy + 4, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 's7/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-80, 1160, DESK_Y, {seed: 's7/deskE', over: 'structural'})} width={3.4} />
  </>
);

const S7: React.FC = () => {
  const t = useTime();
  const [dx, dy] = s7s8Float(t);
  const g = laptopGeo(S7_LAP.x, S7_LAP.y, S7_LAP.w);
  // the spot the bubble looks into: right of centre on the keyboard (board: the line's foot at 650, 1100)
  const tip = quadPt(g.deck, 0.7, 0.42);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <S7WallTop />
        <S7WallLow />
        <Desk />
        <S7Grain />
        <S7DeskBack />
        <Lamp pose={{base: [-300, 1090], elbow: [-90, 640], head: [8, 792], rot: -24, scale: 1.55}} seed="s7/lamp" />
        <S7PullChain />
        {/* S12's dusk-blue thermos on the back row behind Pip (the same desk; the cool share) */}
        <S12Thermos x={818} y={1104} />
        <S7Mug />
        <Laptop x={S7_LAP.x} y={S7_LAP.y} w={S7_LAP.w} variant="old" screen={EMBER.dcSide} seed="s7/lap" />
        <ScreenGlint scr={g.scr} at={GLINT_AT} />
        <S7DeskMid />
        <S7Pip />
        <S7DeskFront />
        <S7Lens cx={LENS.cx} cy={LENS.cy} r={LENS.r} tip={tip} at={LENS_AT} seed="s7/lens">
          <MemoryStick x={LENS.cx} y={LENS.cy + 2} w={STICK_W} rot={-4} seed="s7/stick" />
        </S7Lens>
      </XG>
    </World>
  );
};
export default S7;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
